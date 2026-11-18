// A real-browser run against the real page and the real handler, with a stand-in for the AI.
// PLAYWRIGHT_DIR=/path/to/node_modules node test/browser.e2e.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { makeServer } from '../dev-server.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(join(process.env.PLAYWRIGHT_DIR || '', 'playwright'));
const calls = [];
const model = async ({ user }) => { calls.push(user); return { text: user.includes('USER CONTEXT FILE') ? 'Since you have 25 minutes and no peanuts, use one pan.' : 'Here is a **generic** dinner idea.', usage: { inputTokens: 50, outputTokens: 20 } }; };
const heard = [];
const listen = async ({ mime, audio }) => { heard.push({ mime, bytes: audio.length }); return 'I am Sam, a support lead in Orlando.'; };
const server = makeServer({ model, listen }); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, permissions: ['microphone'] });
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (!r.url().startsWith(origin) && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) errors.push(`outside request ${r.url()}`); });
  await page.goto(origin);
  await page.getByRole('button', { name: 'Ask with no context' }).click();
  await page.getByText('Answer 1: no context').waitFor(); await page.locator('#answer1 strong', { hasText: 'generic' }).waitFor(); assert.doesNotMatch(await page.locator('#answer1').innerText(), /\*\*/, 'bold markers are shown as bold, not as asterisks');
  // A visitor who skips the interview is told to answer something first, and no second call is spent.
  await page.getByRole('button', { name: 'Ask with my context file' }).click();
  await page.getByText('Your file is empty. Answer a few questions').waitFor();
  assert.equal(await page.locator('#answer2').isVisible(), false, 'no answer is shown for an empty file');
  // Voice typing: press Talk, speak (a fake microphone), press Stop, and the words land in the box.
  const talk = page.locator('#questions .q').first().getByRole('button', { name: /Talk instead/ });
  await talk.click(); await page.getByRole('button', { name: /^Stop/ }).waitFor();
  assert.equal(await page.getByRole('button', { name: /^Stop/ }).getAttribute('aria-pressed'), 'true');
  await page.waitForTimeout(1200); await page.getByRole('button', { name: /^Stop/ }).click();
  await page.getByText('Added. Edit it however you like.').waitFor({ timeout: 15000 });
  assert.match(await page.locator('#a-who').inputValue(), /I am Sam, a support lead in Orlando\./);
  assert.equal(heard.length, 1); assert.ok(heard[0].mime.startsWith('audio/') && heard[0].bytes > 100, 'a real recording reached the handler');
  await page.locator('#a-who').fill('');
  await page.locator('#a-who').fill('Sam, in Orlando. <img src=x onerror=window.__pwn=1>');
  await page.locator('#a-rules').fill('Never use em dashes. Email me at sam@example.com');
  const file = await page.locator('#file').inputValue();
  assert.match(file, /## Who I am\nSam, in Orlando/); assert.match(file, /## Rules and pet peeves/);
  await page.getByText(/may contain an email address/).waitFor();
  assert.ok((await page.locator('#short').inputValue()).includes('Never use em dashes'));
  // Editing the file by hand is kept, and the rebuild button appears.
  await page.locator('#file').fill(`${file}\n## Added by hand\nI have 25 minutes.`);
  await page.getByRole('button', { name: 'Rebuild from my answers' }).waitFor();
  await page.locator('#a-work').fill('Support lead.');
  assert.match(await page.locator('#file').inputValue(), /Added by hand/, 'typing in the interview does not wipe a hand edit');
  await page.getByRole('button', { name: 'Rebuild from my answers' }).click();
  assert.doesNotMatch(await page.locator('#file').inputValue(), /Added by hand/);
  assert.match(await page.locator('#file').inputValue(), /## My work\nSupport lead\./);
  // Downloads in every format.
  for (const kind of ['md', 'txt', 'json', 'docx', 'pdf']) {
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator(`[data-download=${kind}]`).click()]);
    assert.equal(download.suggestedFilename(), `master-context-file.${kind}`);
    const bytes = readFileSync(await download.path()); assert.ok(bytes.length > 100, kind);
    if (kind === 'pdf') assert.equal(bytes.subarray(0, 5).toString(), '%PDF-'); if (kind === 'docx') assert.equal(bytes.subarray(0, 2).toString(), 'PK');
  }
  // Ask again with the file, then compare.
  await page.getByRole('button', { name: 'Ask with my context file' }).click();
  await page.getByText('Answer 2: with your file').waitFor();
  await page.locator('#step6').waitFor({ state: 'visible' });
  assert.match(await page.locator('#c2').innerText(), /25 minutes and no peanuts/); assert.match(await page.locator('#c1').innerText(), /generic dinner/);
  assert.ok(calls[0] === 'Help me plan dinner tonight.' && calls[1].includes('USER CONTEXT FILE'), 'first call has no file, second has it');
  assert.equal(await page.evaluate(() => window.__pwn), undefined, 'hostile text stayed text');
  assert.equal(await page.locator('img').count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no sideways scroll on a phone');
  await page.locator('summary', { hasText: 'Steal the interview prompt' }).click();
  const stolen = await page.locator('#prompt').innerText();
  assert.match(stolen, /build my master context file/); assert.match(stolen, /list the assumptions you're already making about me/); assert.match(stolen, /One question at a time/); assert.match(stolen, /Be critical of your own draft/); assert.match(stolen, /Never ask for passwords/);
  assert.deepEqual(errors, []);
  console.log('PASS: the Context Vision Quest in a real browser at 390px: ask, interview, edit, export five ways, ask again, compare, hostile text inert.');
} finally { await browser.close(); server.close(); }
