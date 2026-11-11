// Real-browser test for the Issue 3 loop explainer. It needs a Playwright install and Chrome; none are bundled.
//   PLAYWRIGHT_DIR=/path/to/folder-with-node_modules CHROME_PATH=/usr/bin/google-chrome node explainers/issue-3/e2e.mjs [screenshot-folder]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire((process.env.PLAYWRIGHT_DIR || process.cwd()) + '/node_modules/');
const { chromium } = require('playwright');
const base = process.env.EXPLAINER_URL || new URL('./index.html', import.meta.url).href;
const out = process.argv[2] || '/tmp'; mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const errs = [], reqs = [];
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const open = async (vp, q = '') => { const p = await b.newPage({ viewport: vp }); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('request', r => !r.url().startsWith('file:') && !r.url().startsWith(base.split('/').slice(0, 3).join('/')) && reqs.push(r.url())); await p.goto(base + q); return p; };
const center = async (p, sel) => { const bb = await p.locator(sel).boundingBox(); return [bb.x + bb.width / 2, bb.y + bb.height / 2]; };
async function drag(p, fromSel, toSel) {
  if (fromSel.startsWith('#tray1')) await p.locator(toSel).evaluate(e => e.scrollIntoView({ block: 'center' }));
  else { const [fy0, ty0] = await p.evaluate(([f, t]) => [document.querySelector(f).getBoundingClientRect().top + scrollY, document.querySelector(t).getBoundingClientRect().top + scrollY], [fromSel, toSel]); await p.evaluate(m => scrollTo(0, m - innerHeight / 2), (fy0 + ty0) / 2); }
  const [fx, fy] = await center(p, fromSel), [tx, ty] = await center(p, toSel);
  await p.mouse.move(fx, fy); await p.mouse.down(); await p.mouse.move(fx + 10, fy + 10, { steps: 3 }); await p.mouse.move(tx, ty, { steps: 8 }); await p.mouse.up();
}
const vis = (key) => `#blks1 .blank[data-key="${key}"]:visible`;
const KEYS = []; for (let k = 1; k <= 2; k++) ['t', 'a', 's'].forEach(r => KEYS.push(k + r));
const val = key => { const k = parseInt(key); return key.endsWith('s') ? k - 1 : k; };
const tile = (st, id) => `#pool${st} .tile[data-id="${id}"]`, slot = (st, i) => `#code${st} .slot[data-i="${i}"]`;

for (const [name, vp] of [['desktop', { width: 1100, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const p = await open(vp);
  ok(await p.getAttribute('html', 'data-mode') === 'words', name + ' starts on plain words');
  ok(await p.locator('#blks1 .c:visible').count() === 0 && await p.locator('#blks1 .w:visible').count() > 0, name + ' words mode hides code');
  ok(await p.locator('#s2').isHidden() && await p.locator('#s6').isHidden(), name + ' later steps locked');
  ok(await p.locator('#tray1 .chip').count() === 6 && await p.locator('#blks1 .blk').count() === 16, name + ' 6 chips, 16 blocks shown');
  ok(await p.evaluate(() => Object.keys(blanks).length) === 48, name + ' 48 blanks');
  // wrong then right, then toggle keeps state
  await p.click('#tray1 .chip[data-n="5"]'); await p.click(vis('1t')); // wrong via tap
  ok((await p.textContent('#msg1')).includes('Not 5'), name + ' wrong number refused with reason');
  await p.click('#tray1 .chip[data-n="5"]'); await p.click(vis('1t'));
  ok(await p.locator('#help1, #s1 .helper:not([hidden])').count() >= 1, name + ' two misses show a hint');
  ok(await p.locator('#tray1 .chip.nudge').count() === 1, name + ' the right chip glows after two misses');
  await drag(p, '#tray1 .chip[data-n="1"]', vis('1t'));
  ok(await p.locator('#blks1 .blank[data-key="1t"].filled').count() === 2, name + ' drag fills both words and code versions');
  await p.click('#seg button[data-mode="code"]');
  ok(await p.locator('#blks1 .c:visible').count() > 0 && await p.locator('#blks1 .w:visible').count() === 0, name + ' code mode shows code');
  ok((await p.locator('#blks1 .blank[data-key="1t"]:visible').textContent()) === '1', name + ' filled number survives the switch');
  await p.click('#seg button[data-mode="words"]');
  // fill the rest
  for (const key of KEYS.slice(1)) {
    if (name === 'desktop' && Math.random() < 0.7) await drag(p, `#tray1 .chip[data-n="${val(key)}"]`, vis(key));
    else { await p.click(`#tray1 .chip[data-n="${val(key)}"]`); await p.locator(vis(key)).evaluate(e => e.scrollIntoView({ block: 'center' })); await p.click(vis(key)); }
  }
  await p.waitForSelector('#pat1:not([hidden])', { timeout: 6000 }); const miss = await p.evaluate(() => Object.keys(blanks).filter(k => !blanks[k][0].classList.contains('filled'))); if (miss.length) console.log('MISSING', name, JSON.stringify(miss), await p.textContent('#msg1'));
  ok((await p.textContent('#count1')).startsWith('6 of 6') && miss.length === 0, name + ' you fill 6, the other 42 fill themselves');
  ok(await p.locator('#s2').isHidden(), name + ' step 2 waits for the pattern reveal');
  await p.click('#seePat'); ok(await p.locator('#blks1.hl').count() === 1, name + ' pattern highlight');
  await p.click('#howNow'); ok(await p.locator('#s2').isVisible() && await p.locator('#s1.done').count() === 1, name + ' step 1 done, step 2 open');
  ok((await p.textContent('#collapse1')).includes('while'), name + ' collapse uses the while loop');
  // 2: do-while order puzzle
  await drag(p, tile(2, 'while'), slot(2, 0));
  ok(await p.locator('#code2 .slot.empty').count() === 6, name + ' off-ramp piece first is refused');
  for (const [id, i] of Object.entries({ count: 0, do: 1, ask: 2, read: 3, inc: 4, while: 5 })) {
    if (name === 'desktop') await drag(p, tile(2, id), slot(2, i)); else { await p.click(tile(2, id)); await p.locator(slot(2, i)).evaluate(e => e.scrollIntoView({ block: 'center' })); await p.click(slot(2, i)); }
  }
  ok(await p.locator('#s2.done').count() === 1 && await p.locator('#s3').isVisible(), name + ' loop puzzle done');
  ok(!(await p.locator('#s2').textContent()).includes('for (int'), name + ' no for loop in step 2');
  // 3
  ok(await p.locator('#typing').isHidden(), name + ' typing waits for a choice');
  await p.click('#pBlocks'); ok(await p.locator('#typing').isVisible(), name + ' choice opens the typing demo');
  await p.click('.pre[data-n="100"]'); await p.waitForSelector('#that:not([hidden])', { timeout: 9000 });
  ok((await p.textContent('#count3')).includes('200 lines') && await p.locator('#s4').isVisible(), name + ' typing 100 words = 200 lines, step 4 opens');
  // 4
  await p.fill('#n4', '0'); await p.locator('#n4').dispatchEvent('change'); ok((await p.textContent('#err4')).includes('1 to 16'), name + ' 0 words blocked');
  await p.fill('#n4', '17'); await p.locator('#n4').dispatchEvent('change'); ok((await p.textContent('#err4')).includes('1 to 16'), name + ' 17 words blocked');
  await p.fill('#n4', '3'); await p.locator('#n4').dispatchEvent('change');
  let asks = 0; for (let i = 0; i < 200 && !(await p.isDisabled('#next4')); i++) { if ((await p.locator('#code4 .cl.hot').textContent()).includes('Enter word')) asks++; await p.click('#next4'); }
  ok(asks === 3, name + ' 3 words = exactly 3 input cycles (saw ' + asks + ')');
  ok((await p.textContent('#vars4')).includes('"tiger", "maple", "orbit"'), name + ' three words stored');
  ok(await p.locator('#s4.done').count() === 1 && await p.locator('#s5').isVisible(), name + ' step 4 done, step 5 open');
  await p.fill('#n4', '16'); await p.locator('#n4').dispatchEvent('change'); await p.click('#trip4'); await p.click('#trip4'); ok((await p.textContent('#pos4')).includes('of'), name + ' 16 words works');
  // 5
  ok(await p.locator('#code5 .eq').count() === 1, name + ' the single = is highlighted');
  for (let i = 0; i < 6; i++) await p.click('#run5');
  ok((await p.textContent('#note5')).includes('STILL TRUE') && await p.isDisabled('#run5'), name + ' = never exits and the demo caps at 6 trips');
  await p.click('#stop5'); await p.click('#fix5'); await p.click('#run5');
  ok((await p.textContent('#note5')).includes('OFF RAMP TAKEN'), name + ' == exits');
  ok(await p.locator('#s5.done').count() === 1 && await p.locator('#s6').isVisible(), name + ' step 5 done, step 6 open');
  // 6
  await drag(p, tile(6, 'endEqEq'), slot(6, 0)); ok(await p.locator('#code6 .slot.empty').count() === 8, name + ' closing piece first is refused');
  const m6 = { init: 0, do: 1, choose: 2, run: 3, dedupe: 4, show: 5, check: 6, endEq: 7 };
  for (const [id, i] of Object.entries(m6)) { if (name === 'desktop') await drag(p, tile(6, id), slot(6, i)); else { await p.click(tile(6, id)); await p.locator(slot(6, i)).evaluate(e => e.scrollIntoView({ block: 'center' })); await p.click(slot(6, i)); } }
  if (!(await p.locator('#sim').isVisible())) console.log('S6 STATE', await p.locator('#code6 .slot.empty').count(), await p.textContent('#msg6'));
  ok(await p.locator('#sim').isVisible(), name + ' AI loop built, simulator shown');
  ok((await p.textContent('#status6')).includes("moreToDo = 'Y'"), name + ' the wrong operator (=) the user chose is in play');
  for (let i = 0; i < 14; i++) { if (await p.isDisabled('#run6')) break; await p.click('#run6'); }
  const l6 = await p.textContent('#log6');
  ok(l6.includes('NO OFF RAMP') && l6.includes('did its job right') && l6.includes("Nothing new. The AI sets moreToDo = 'N'"), name + ' = keeps the AI going forever until the emergency stop, and says why');
  ok((await p.textContent('#meter6')).includes('passes = 12'), name + ' meter shows 12 passes');
  await p.click('#reset6'); await p.check('#cap'); for (let i = 0; i < 14; i++) { if (await p.isDisabled('#run6')) break; await p.click('#run6'); }
  ok((await p.textContent('#log6')).includes('SAFETY CAP'), name + ' safety cap stops the broken loop');
  await p.click('#opEqEq'); await p.uncheck('#cap'); for (let i = 0; i < 14; i++) { if (await p.isDisabled('#run6')) break; await p.click('#run6'); }
  ok((await p.textContent('#log6')).includes('NOTHING NEW') && (await p.textContent('#meter6')).includes('passes = 4'), name + ' == stops itself at pass 4');
  ok(await p.locator('#s6.done').count() === 1, name + ' step 6 done once both were seen');
  ok(await p.locator('#pips i.on').count() === 6 && await p.locator('#finale').isVisible(), name + ' progress dots full and the closing card shows');
  await p.click('#opEq'); await p.click('#run6'); await p.click('#run6'); await p.click('#human6'); ok((await p.textContent('#log6')).includes('OFF RAMP: YOU'), name + ' a human can stop it');
  await p.screenshot({ path: `${out}/c-${name}-end.png`, fullPage: true });
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), name + ' no horizontal overflow');
  await p.close();
}
// idle hints
const q = await open({ width: 1100, height: 900 }, '?idle=700');
await q.waitForTimeout(900); ok(await q.locator('#s1 .helper:not([hidden])').count() === 1, 'idle 1: hint by itself');
await q.waitForTimeout(800); ok(await q.locator('#s1 .blank.nudge').count() >= 1 && await q.locator('#tray1 .chip.nudge').count() === 1, 'idle 2: blank and number glow');
await q.screenshot({ path: `${out}/c-idle.png` }); await q.close();
const r = await open({ width: 1100, height: 900 }, '?idle=600#unlock');
await r.waitForTimeout(900); ok(await r.locator('#s3 .helper:not([hidden])').count() === 1, 'idle hint on the preference step'); await r.close();
ok(errs.length === 0, 'no console/page errors ' + JSON.stringify(errs));
ok(reqs.length === 0, 'no network requests ' + JSON.stringify(reqs));
await b.close();
