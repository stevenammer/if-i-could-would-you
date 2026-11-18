// Page wiring. Everything a visitor types is put on the page as text, never as markup.
import { INTERVIEW_PROMPT, SECTIONS, buildFile, customInstructions, privacyFlags } from './lib/context.js';
import { docx, pdf } from './lib/files.js';

const $ = id => document.getElementById(id);
const EXAMPLES = ['Help me plan dinner tonight.', 'Write a short reply to a customer who is angry about a late order.', 'What should I focus on this week?', 'Explain what a mortgage escrow account is.'];
const SAMPLE = { question: 'Help me plan dinner tonight.',
  plain: 'Here is a simple plan: pick a protein, a vegetable and a starch. For example, baked chicken, roasted broccoli and rice. Check what you already have, shop for what is missing, and aim to start cooking by 6 so you eat by 7. Want a vegetarian or quicker option?',
  tailored: 'Sample only (the live demo is resting): with a file that says you have 25 minutes, a $25 budget and a kid with a peanut allergy, an answer would skip peanut oil, use chicken thighs and rice you already have, and give you one pan and a shopping list under $25.' };
let dirty = false; let busy = false; let first = '';

function show(box, tag, text) {
  box.hidden = false; box.replaceChildren();
  const label = document.createElement('span'); label.className = 'tag'; label.textContent = tag;
  box.append(label, document.createTextNode(text));
}
const words = text => (text.trim().match(/\S+/g) || []).length;

async function ask(question, context) {
  const response = await fetch('/api/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(context ? { question, context } : { question }) });
  let data = {}; try { data = await response.json(); } catch { /* handled below */ }
  if (!response.ok) { const error = new Error(data.error || 'Something went wrong. Try again.'); error.resting = Boolean(data.resting); throw error; }
  return data.answer;
}

async function run(button, status, work) {
  if (busy) return; busy = true; button.disabled = true; status.className = 'status'; status.textContent = 'Asking...';
  try { await work(); status.textContent = ''; }
  catch (error) { status.className = 'status bad'; status.textContent = error.message || 'Something went wrong.'; if (error.resting) useSample(); }
  finally { busy = false; button.disabled = false; }
}

function useSample() {
  if ($('question').value.trim() !== SAMPLE.question) return;
  show($('answer1'), 'Sample answer, no context (not live)', SAMPLE.plain); first = SAMPLE.plain;
}

function currentFile() { return $('file').value; }
function answers() { const out = {}; for (const section of SECTIONS) out[section.id] = $(`a-${section.id}`).value; return out; }
function refresh() {
  if (!dirty) $('file').value = buildFile(answers());
  const text = currentFile();
  $('count').textContent = `${text.length.toLocaleString('en-US')} characters`;
  $('short').value = customInstructions(text);
  const flags = privacyFlags(text); const box = $('flags');
  box.hidden = flags.length === 0; box.textContent = flags.length ? `Before you share or paste this anywhere, look at it again. It may contain ${flags.join(', ')}.` : '';
  $('rebuild').hidden = !dirty;
}

function download(kind) {
  const text = currentFile(); let blob; let name = 'master-context-file';
  if (kind === 'md') blob = new Blob([text], { type: 'text/markdown' });
  else if (kind === 'txt') blob = new Blob([text.replace(/^#+\s*/gm, '')], { type: 'text/plain' });
  else if (kind === 'json') blob = new Blob([JSON.stringify({ updated: new Date().toISOString().slice(0, 10), answers: answers(), file: text }, null, 2)], { type: 'application/json' });
  else if (kind === 'docx') blob = new Blob([docx(text)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  else blob = new Blob([pdf(text)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = `${name}.${kind}`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  $('status4').textContent = `Downloaded ${name}.${kind}`;
}

async function copy(text, status, done) {
  try { await navigator.clipboard.writeText(text); status.textContent = done; }
  catch { status.className = 'status bad'; status.textContent = 'Your browser blocked copying. Select the text and copy it yourself.'; }
}

function start() {
  const chips = $('chips');
  for (const example of EXAMPLES) { const chip = document.createElement('button'); chip.type = 'button'; chip.textContent = example; chip.addEventListener('click', () => { $('question').value = example; }); chips.append(chip); }
  const holder = $('questions');
  for (const section of SECTIONS) {
    const wrap = document.createElement('div'); wrap.className = 'q';
    const label = document.createElement('label'); label.htmlFor = `a-${section.id}`; label.textContent = section.question;
    const hint = document.createElement('p'); hint.textContent = section.hint;
    const area = document.createElement('textarea'); area.id = `a-${section.id}`; area.rows = 2; area.maxLength = 1200;
    area.addEventListener('input', refresh);
    wrap.append(label, hint, area); holder.append(wrap);
  }
  $('prompt').textContent = INTERVIEW_PROMPT;
  $('copyPrompt').addEventListener('click', () => copy(INTERVIEW_PROMPT, $('promptStatus'), 'Copied.'));
  $('file').addEventListener('input', () => { dirty = true; refresh(); });
  $('rebuild').addEventListener('click', () => { dirty = false; refresh(); });
  $('copyFile').addEventListener('click', () => copy(currentFile(), $('status4'), 'Copied your file.'));
  $('copyShort').addEventListener('click', () => copy($('short').value, $('status4'), 'Copied the short version.'));
  for (const button of document.querySelectorAll('[data-download]')) button.addEventListener('click', () => download(button.dataset.download));
  $('ask1').addEventListener('click', () => run($('ask1'), $('status1'), async () => {
    const question = $('question').value.trim(); first = await ask(question); show($('answer1'), 'Answer 1: no context', first); $('question2').value = question;
  }));
  $('ask2').addEventListener('click', () => run($('ask2'), $('status5'), async () => {
    const question = $('question2').value.trim(); const second = await ask(question, currentFile());
    show($('answer2'), 'Answer 2: with your file', second);
    if (!first) { $('status5').textContent = 'Ask with no context in step 1 to compare.'; }
    else { $('c1').textContent = first; $('c2').textContent = second; $('m1').textContent = `${words(first)} words`; $('m2').textContent = `${words(second)} words`; $('step6').hidden = false; $('step6').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
  }));
  $('question2').value = $('question').value;
  refresh();
}
start();
