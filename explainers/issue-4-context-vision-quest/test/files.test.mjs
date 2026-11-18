import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crc32, docx, pdf, zip } from '../public/lib/files.js';
import { OPENER, INTERVIEW_PROMPT, customInstructions, privacyFlags } from '../public/lib/context.js';

test('crc32 matches the standard check value', () => { assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926); });

test('the zip is a real zip: unzip tests it clean and returns the same bytes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cvq-')); const file = join(dir, 'a.zip');
  writeFileSync(file, zip([['a.txt', 'hello'], ['dir/b.txt', 'world — café']]));
  const test = execFileSync('python3', ['-c', 'import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; print(z.read("dir/b.txt").decode("utf8"))', file]).toString().trim();
  assert.equal(test, 'world — café');
});

test('the Word file opens with a real parser and keeps headings, bullets and awkward characters', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cvq-')); const file = join(dir, 'a.docx');
  writeFileSync(file, docx('# Title & more\n\n## Rules\n- never use <em> dashes\nPlain line "quoted"\n'));
  const out = execFileSync('python3', ['-c', `
import zipfile,sys,re
z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None
d=z.read('word/document.xml').decode('utf8')
import xml.dom.minidom as m; m.parseString(d); m.parseString(z.read('word/styles.xml')); m.parseString(z.read('[Content_Types].xml'))
print(' | '.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', d)))`, file]).toString().trim();
  assert.match(out, /Title &amp; more/); assert.match(out, /never use &lt;em&gt; dashes/); assert.match(out, /Plain line &quot;quoted&quot;/);
});

test('the PDF is well formed: header, xref offsets that point at real objects, and wrapped pages', () => {
  const long = Array.from({ length: 140 }, (_, i) => `Line ${i} ${'word '.repeat(30)}`).join('\n');
  const bytes = pdf(`# Heading\n${long}\ncafé — “quoted” • (parens) \\ backslash 中`);
  const text = Buffer.from(bytes).toString('latin1');
  assert.match(text, /^%PDF-1\.4/); assert.match(text, /%%EOF\n$/);
  const start = Number(/startxref\n(\d+)/.exec(text)[1]); assert.ok(text.slice(start).startsWith('xref'));
  const entries = [...text.slice(start).matchAll(/^(\d{10}) 00000 n $/gm)].map(m => Number(m[1]));
  entries.forEach((offset, i) => assert.ok(text.slice(offset).startsWith(`${i + 1} 0 obj`), `object ${i + 1} is where the table says`));
  assert.ok(Number(/\/Count (\d+)/.exec(text)[1]) >= 3, 'long text runs onto more pages');
  const dir = mkdtempSync(join(tmpdir(), 'cvq-')); const file = join(dir, 'a.pdf'); writeFileSync(file, bytes);
  try { const check = execFileSync('python3', ['-c', 'import sys\ntry:\n import pypdf\n r=pypdf.PdfReader(sys.argv[1]); print(len(r.pages), "Heading" in r.pages[0].extract_text())\nexcept ImportError:\n print("skip")', file]).toString().trim(); if (check !== 'skip') assert.match(check, /^[3-9]\d* True$/); } catch (error) { if (error.status) throw error; }
});

test('the interviewer opens by asking what the person wants help with, and the stealable prompt keeps its commitments', () => {
  assert.match(OPENER, /what do you want your AI to help you with/i); assert.doesNotMatch(OPENER, /[\u2013\u2014]/);
  for (const part of [/One question at a time/, /list the assumptions you're already making/, /ask me why I want it/, /Be critical of your own draft/, /Never ask for passwords/]) assert.match(INTERVIEW_PROMPT, part);
});

test('privacy flags catch the usual accidents and nothing in an ordinary file', () => {
  assert.deepEqual(privacyFlags('I like short answers.'), []);
  const flags = privacyFlags('Email me at sam@example.com or 407-555-0142. I live at 120 Palm Street. card 4111 1111 1111 1111. password: hunter2');
  for (const label of ['an email address', 'a phone number', 'what looks like a street address', 'a long number, like an account or card number', 'something labelled as a password or key']) assert.ok(flags.includes(label), label);
});

test('the short version fits the limit, drops the title line, and ends cleanly', () => {
  const file = `# Master context file\nUpdated 2026-01-01\n\n## Who I am\n${'a '.repeat(2000)}`;
  const short = customInstructions(file, 1500);
  assert.ok(short.length <= 1500); assert.ok(short.endsWith('…')); assert.doesNotMatch(short, /Master context file|^## /m);
  assert.equal(customInstructions('# Master context file\nUpdated 2026-01-01\n\n## A\nshort'), 'A\nshort');
});
