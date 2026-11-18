// Page wiring. Everything a visitor types is put on the page as text, never as markup.
import { INTERVIEW_PROMPT, OPENER, customInstructions, privacyFlags } from './lib/context.js';
import { docx, pdf } from './lib/files.js';

const $ = id => document.getElementById(id);
const EXAMPLES = ['Help me plan dinner tonight.', 'Write a short reply to a customer who is angry about a late order.', 'What should I focus on this week?', 'Explain what a mortgage escrow account is.'];
const SAMPLE = { question: 'Help me plan dinner tonight.',
  plain: 'Here is a simple plan: pick a protein, a vegetable and a starch. For example, baked chicken, roasted broccoli and rice. Check what you already have, shop for what is missing, and aim to start cooking by 6 so you eat by 7. Want a vegetarian or quicker option?',
  tailored: 'Sample only (the live demo is resting): with a file that says you have 25 minutes, a $25 budget and a kid with a peanut allergy, an answer would skip peanut oil, use chicken thighs and rice you already have, and give you one pan and a shopping list under $25.' };
let busy = false; let first = ''; let messages = [{ role: 'assistant', content: OPENER }]; let built = false;

// Answers sometimes carry **bold** markers. Show them as bold, built from text nodes, never parsed as markup.
function formatted(text) {
  const out = document.createDocumentFragment();
  String(text).split(/\*\*(.+?)\*\*/g).forEach((part, index) => { if (!part) return; if (index % 2) { const strong = document.createElement('strong'); strong.textContent = part; out.append(strong); } else out.append(document.createTextNode(part)); });
  return out;
}
function show(box, tag, text) {
  box.hidden = false; box.replaceChildren();
  const label = document.createElement('span'); label.className = 'tag'; label.textContent = tag;
  box.append(label, formatted(text));
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
function refresh() {
  const text = currentFile();
  $('count').textContent = `${text.length.toLocaleString('en-US')} characters`;
  $('short').value = customInstructions(text);
  const flags = privacyFlags(text); const box = $('flags');
  box.hidden = flags.length === 0; box.textContent = flags.length ? `Before you share or paste this anywhere, look at it again. It may contain ${flags.join(', ')}.` : '';
}

function download(kind) {
  const text = currentFile(); let blob; let name = 'master-context-file';
  if (kind === 'md') blob = new Blob([text], { type: 'text/markdown' });
  else if (kind === 'txt') blob = new Blob([text.replace(/^#+\s*/gm, '')], { type: 'text/plain' });
  else if (kind === 'json') blob = new Blob([JSON.stringify({ updated: new Date().toISOString().slice(0, 10), file: text, interview: messages }, null, 2)], { type: 'application/json' });
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

// Voice typing: record a short clip, send it to be written down, put the words in the box. Nothing is kept.
const MAX_CLIP_SECONDS = 60;
const clipMime = () => ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(type => window.MediaRecorder && MediaRecorder.isTypeSupported(type)) || '';
function micIcon() {
  const ns = 'http://www.w3.org/2000/svg'; const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', '18'); svg.setAttribute('height', '18'); svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(ns, 'path'); path.setAttribute('fill', 'currentColor');
  path.setAttribute('d', 'M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z'); svg.append(path); return svg;
}
function addMic(area, holder) {
  if (!navigator.mediaDevices?.getUserMedia || !clipMime()) return;
  const button = document.createElement('button'); button.type = 'button'; button.className = 'mic'; button.setAttribute('aria-pressed', 'false');
  const label = document.createElement('span'); label.textContent = 'Talk instead';
  const note = document.createElement('span'); note.className = 'status mic-note'; note.setAttribute('role', 'status'); note.setAttribute('aria-live', 'polite');
  button.append(micIcon(), label); holder.append(button, note);
  let recorder = null; let stream = null; let timer = null; let started = 0;
  const idle = () => { button.classList.remove('live'); button.setAttribute('aria-pressed', 'false'); label.textContent = 'Talk instead'; button.disabled = false; clearInterval(timer); };
  const stop = () => { if (recorder && recorder.state !== 'inactive') recorder.stop(); };
  button.addEventListener('click', async () => {
    if (recorder && recorder.state === 'recording') { stop(); return; }
    note.className = 'status mic-note'; note.textContent = '';
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { note.className = 'status bad mic-note'; note.textContent = "I can't use your microphone. Allow it for this page, or use the microphone button on your keyboard."; return; }
    const mime = clipMime(); const chunks = [];
    recorder = new MediaRecorder(stream, { mimeType: mime });
    recorder.addEventListener('dataavailable', event => { if (event.data.size) chunks.push(event.data); });
    recorder.addEventListener('stop', async () => {
      stream.getTracks().forEach(track => track.stop()); idle();
      if (!chunks.length) return;
      button.disabled = true; note.textContent = 'Writing it down...';
      try {
        const blob = new Blob(chunks, { type: mime.split(';')[0] });
        const audio = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1] || ''); reader.onerror = reject; reader.readAsDataURL(blob); });
        const response = await fetch('/api/transcribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ audio, mime: blob.type }) });
        let data = {}; try { data = await response.json(); } catch { /* handled below */ }
        if (!response.ok) throw new Error(data.error || 'I could not hear that one. Try again, or type it.');
        if (!data.text) { note.textContent = "I didn't catch anything. Try again a little closer."; }
        else { area.value = (area.value.trim() ? area.value.trimEnd() + ' ' : '') + data.text; area.dispatchEvent(new Event('input', { bubbles: true })); note.textContent = 'Added. Edit it however you like.'; }
      } catch (error) { note.className = 'status bad mic-note'; note.textContent = error.message; }
      finally { button.disabled = false; }
    });
    recorder.start(); started = Date.now(); button.classList.add('live'); button.setAttribute('aria-pressed', 'true');
    timer = setInterval(() => { const seconds = Math.floor((Date.now() - started) / 1000); label.textContent = `Stop (${seconds}s)`; if (seconds >= MAX_CLIP_SECONDS) stop(); }, 250);
    label.textContent = 'Stop (0s)';
  });
}

// ---- The interview chat -----------------------------------------------------------------------------------------
async function converse(mode) {
  const response = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode, messages }) });
  let data = {}; try { data = await response.json(); } catch { /* handled below */ }
  if (!response.ok) { const error = new Error(data.error || 'Something went wrong. Try again.'); error.resting = Boolean(data.resting); throw error; }
  return data;
}
function bubble(role, text, extra = '') {
  const node = document.createElement('div'); node.className = `msg ${role === 'user' ? 'me' : 'ai'} ${extra}`.trim(); node.textContent = text;
  $('chat').append(node); $('chat').scrollTop = $('chat').scrollHeight; return node;
}
const userTurns = () => messages.filter(message => message.role === 'user').length;
function syncChat() { $('makeFile').disabled = busy || userTurns() < 3; $('send').disabled = busy; $('restart').hidden = userTurns() === 0; $('makeFile').textContent = built ? 'Rewrite from the chat' : 'Write my file'; }
function setupChat() {
  bubble('assistant', OPENER); syncChat();
  const send = async () => {
    const text = $('say').value.trim();
    if (!text || busy) return;
    const flags = privacyFlags(text); $('chatStatus').className = 'status';
    messages.push({ role: 'user', content: text }); bubble('user', text); $('say').value = ''; busy = true; syncChat();
    const wait = bubble('assistant', 'Thinking...', 'wait'); $('chatStatus').textContent = flags.length ? `Heads up: that looks like ${flags.join(', ')}. You can leave it out of your file.` : '';
    try { const data = await converse('chat'); wait.remove(); messages.push({ role: 'assistant', content: data.reply }); bubble('assistant', data.reply); }
    catch (error) {
      wait.remove(); messages.pop(); $('chat').lastElementChild?.remove(); $('say').value = text;
      $('chatStatus').className = 'status bad'; $('chatStatus').textContent = error.message || 'Something went wrong.';
    } finally { busy = false; syncChat(); }
  };
  $('send').addEventListener('click', send);
  $('say').addEventListener('keydown', event => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); send(); } });
  $('makeFile').addEventListener('click', async () => {
    if (busy || userTurns() < 3) return;
    busy = true; syncChat(); $('chatStatus').className = 'status'; $('chatStatus').textContent = 'Writing your file...';
    try {
      const data = await converse('file');
      $('file').value = data.file; built = true; refresh();
      const list = $('guessList'); list.replaceChildren(...data.guesses.map(guess => { const item = document.createElement('li'); item.textContent = guess; return item; }));
      $('guesses').hidden = data.guesses.length === 0; $('chatStatus').textContent = 'Done. Your file is in step 3.';
      $('step3').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    } catch (error) { $('chatStatus').className = 'status bad'; $('chatStatus').textContent = error.message || 'Something went wrong.'; }
    finally { busy = false; syncChat(); }
  });
  $('restart').addEventListener('click', () => {
    if (busy) return; built = false; messages = [{ role: 'assistant', content: OPENER }]; $('chat').replaceChildren(); bubble('assistant', OPENER); $('chatStatus').textContent = ''; syncChat();
  });
}

function start() {
  const chips = $('chips');
  for (const example of EXAMPLES) { const chip = document.createElement('button'); chip.type = 'button'; chip.textContent = example; chip.addEventListener('click', () => { $('question').value = example; }); chips.append(chip); }
  addMic($('question'), $('mic1')); addMic($('question2'), $('mic5')); addMic($('say'), $('micSay'));
  setupChat();
  $('prompt').textContent = INTERVIEW_PROMPT;
  $('copyPrompt').addEventListener('click', () => copy(INTERVIEW_PROMPT, $('promptStatus'), 'Copied.'));
  $('file').addEventListener('input', refresh);
  $('copyFile').addEventListener('click', () => copy(currentFile(), $('status4'), 'Copied your file.'));
  $('copyShort').addEventListener('click', () => copy($('short').value, $('status4'), 'Copied the short version.'));
  for (const button of document.querySelectorAll('[data-download]')) button.addEventListener('click', () => download(button.dataset.download));
  $('ask1').addEventListener('click', () => run($('ask1'), $('status1'), async () => {
    const question = $('question').value.trim(); first = await ask(question); show($('answer1'), 'Answer 1: no context', first); $('question2').value = question;
  }));
  $('ask2').addEventListener('click', () => run($('ask2'), $('status5'), async () => {
    // A cold visitor who skips the interview would get the same generic answer under a "with your file" label. Say so instead.
    if (!currentFile().trim()) throw new Error('Your file is empty. Do the interview in step 2 and press Write my file, then ask again.');
    const question = $('question2').value.trim(); const second = await ask(question, currentFile());
    show($('answer2'), 'Answer 2: with your file', second);
    if (!first) { $('status5').textContent = 'Ask with no context in step 1 to compare.'; }
    else { $('c1').replaceChildren(formatted(first)); $('c2').replaceChildren(formatted(second)); $('m1').textContent = `${words(first)} words`; $('m2').textContent = `${words(second)} words`; $('step6').hidden = false; $('step6').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
  }));
  $('question2').value = $('question').value;
  refresh();
}
start();
