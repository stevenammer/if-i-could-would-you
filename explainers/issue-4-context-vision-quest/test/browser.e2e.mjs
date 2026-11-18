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
const chats = [];
const converse = async ({ system, messages }) => {
  chats.push({ system, messages });
  if (/You write a person's master context file/.test(system)) return { text: '# Master context file\nUpdated 2026-11-18.\n\n## Who I am\nSam, a support lead in Orlando.\n\n## Rules and pet peeves\n- Never use em dashes, because they look robotic.\n- Email me at sam@example.com\n---GUESSES---\n- You manage a small team\n- Your tools are Outlook and Excel', usage: { inputTokens: 300, outputTokens: 120 } };
  return { text: `Question ${chats.length}: tell me more?`, usage: { inputTokens: 100, outputTokens: 20 } };
};
const server = makeServer({ model, listen, converse }); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
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
  // A visitor who skips the interview is told to do it first, and no second call is spent.
  await page.getByRole('button', { name: 'Ask with my context file' }).click();
  await page.getByText('Your file is empty. Do the interview').waitFor();
  assert.equal(await page.locator('#answer2').isVisible(), false, 'no answer is shown for an empty file');
  // The interview is a chat that opens by itself, asks one question at a time, and keeps the file button asleep until there is enough.
  await page.getByText(/what do you want your AI to help you with/i).waitFor();
  assert.equal(await page.locator('#questions').count(), 0, 'there are no question boxes');
  assert.equal(await page.getByRole('button', { name: 'Write my file' }).isDisabled(), true);
  // Voice typing into the chat box: press Talk, speak (a fake microphone), press Stop, and the words land in the box.
  await page.locator('#micSay').getByRole('button', { name: /Talk instead/ }).click(); await page.getByRole('button', { name: /^Stop/ }).waitFor();
  assert.equal(await page.getByRole('button', { name: /^Stop/ }).getAttribute('aria-pressed'), 'true');
  await page.waitForTimeout(1200); await page.getByRole('button', { name: /^Stop/ }).click();
  await page.getByText('Added. Edit it however you like.').waitFor({ timeout: 15000 });
  assert.match(await page.locator('#say').inputValue(), /I am Sam, a support lead in Orlando\./);
  assert.equal(heard.length, 1); assert.ok(heard[0].mime.startsWith('audio/') && heard[0].bytes > 100, 'a real recording reached the handler');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByText('Question 1: tell me more?').waitFor();
  assert.equal(chats[0].messages.at(-1).role, 'user'); assert.match(chats[0].messages.at(-1).content, /support lead in Orlando/); assert.equal(chats[0].messages[0].role, 'assistant');
  // Hostile text and an email in an answer: shown as text, warned about, never run.
  await page.locator('#say').fill('Email me at sam@example.com <img src=x onerror=window.__pwn=1>');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByText('Question 2: tell me more?').waitFor();
  await page.getByText(/Heads up: that looks like an email address/).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Write my file' }).isDisabled(), true, 'two answers is not enough yet');
  // Ctrl+Enter sends too, and the third answer wakes the file button.
  await page.locator('#say').fill('I never want em dashes.'); await page.locator('#say').press('Control+Enter');
  await page.getByText('Question 3: tell me more?').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Write my file' }).isDisabled(), false);
  // A failed turn puts the person's words back instead of losing them.
  await page.route('**/api/chat', route => route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"The AI had a hiccup. Try that again in a moment."}' }));
  await page.locator('#say').fill('A fourth answer.'); await page.getByRole('button', { name: 'Send' }).click();
  await page.getByText('The AI had a hiccup.').waitFor();
  assert.equal(await page.locator('#say').inputValue(), 'A fourth answer.'); await page.unroute('**/api/chat'); await page.locator('#say').fill('');
  // Write the file from the chat: it lands in step 3, with what it guessed, and the privacy check looks at it.
  await page.getByRole('button', { name: 'Write my file' }).click();
  await page.getByText('Done. Your file is in step 3.').waitFor();
  const file = await page.locator('#file').inputValue();
  assert.match(file, /^# Master context file/); assert.match(file, /## Who I am\nSam, a support lead in Orlando/);
  assert.match(chats.at(-1).messages[0].content, /<transcript>/); assert.match(chats.at(-1).messages[0].content, /Me: Email me at sam@example\.com/);
  await page.getByText('You manage a small team').waitFor(); await page.getByText('Your tools are Outlook and Excel').waitFor();
  await page.getByText(/may contain an email address/).waitFor();
  assert.ok((await page.locator('#short').inputValue()).includes('Never use em dashes'));
  await page.getByRole('button', { name: 'Rewrite from the chat' }).waitFor();
  // Editing the file by hand is kept.
  await page.locator('#file').fill(`${file}\n## Added by hand\nI have 25 minutes.`);
  assert.match(await page.locator('#file').inputValue(), /Added by hand/);
  // Start over clears the chat and asks the first question again.
  await page.getByRole('button', { name: 'Start over' }).click();
  assert.equal(await page.locator('#chat .msg').count(), 1); assert.equal(await page.getByRole('button', { name: 'Write my file' }).isDisabled(), true);
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
  assert.equal(await page.locator('#chat img').count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no sideways scroll on a phone');
  await page.locator('summary', { hasText: 'Steal the interview prompt' }).click();
  const stolen = await page.locator('#prompt').innerText();
  assert.match(stolen, /build my master context file/); assert.match(stolen, /list the assumptions you're already making about me/); assert.match(stolen, /One question at a time/); assert.match(stolen, /Be critical of your own draft/); assert.match(stolen, /Never ask for passwords/);
  assert.deepEqual(errors, []);
  console.log('PASS: the Context Vision Quest in a real browser at 390px: ask, chat interview by voice and typing, write the file, edit, export five ways, ask again, compare, hostile text inert.');
} finally { await browser.close(); server.close(); }
