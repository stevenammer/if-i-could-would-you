import test from 'node:test';
import assert from 'node:assert/strict';
import { LIMITS, ask, parseRequest, promptFor, vertexModel } from '../ask-core.mjs';

const memory = () => { const m = new Map(); return { async get(k) { return m.get(k) ?? null; }, async set(k, v) { m.set(k, v); }, m }; };
const model = (text = 'An answer.', usage = { inputTokens: 100, outputTokens: 50 }) => async () => ({ text, usage });
const NOW = Date.UTC(2026, 10, 18, 12);

test('a question is required, and size and shape are checked before anything is spent', () => {
  assert.match(parseRequest({}).error, /question/i);
  assert.match(parseRequest({ question: '   ' }).error, /question/i);
  assert.match(parseRequest({ question: 'x'.repeat(LIMITS.questionChars + 1) }).error, /under/);
  assert.match(parseRequest({ question: 'hi', context: 'c'.repeat(LIMITS.contextChars + 1) }).error, /over/);
  assert.match(parseRequest({ question: 'hi', context: 7 }).error, /text/);
  assert.match(parseRequest({ question: 'hi', extra: 1 }).error, /Unexpected/);
  assert.match(parseRequest([]).error, /question/i);
  assert.deepEqual(parseRequest({ question: ' hi ', context: ' file ' }), { question: 'hi', context: 'file' });
});

test('the context file is delimited and labelled, and the question alone goes through unchanged', () => {
  assert.equal(promptFor({ question: 'hi', context: '' }).user, 'hi');
  const withFile = promptFor({ question: 'plan dinner', context: 'No peanuts.' });
  assert.match(withFile.user, /^USER CONTEXT FILE:\nNo peanuts\.\n\nREQUEST:\nplan dinner$/);
  assert.match(withFile.system, /Never mention the file/);
});

test('an answer comes back, and the spend is counted with list prices set above real ones', async () => {
  const store = memory();
  const out = await ask({ body: { question: 'hi' }, visitor: 'v1', store, model: model('Hello there.', { inputTokens: 1000, outputTokens: 1000 }), now: NOW });
  assert.equal(out.status, 200); assert.equal(out.body.answer, 'Hello there.'); assert.equal(out.body.withContext, false);
  assert.equal(store.m.get('spend:2026-11-18'), (1000 * LIMITS.inputUsdPerMillion + 1000 * LIMITS.outputUsdPerMillion) / 1e6);
  assert.equal(store.m.get('visit:2026-11-18:v1'), 1);
});

test('one visitor is stopped after their daily runs, and others are not', async () => {
  const store = memory();
  for (let i = 0; i < LIMITS.runsPerVisitorPerDay; i += 1) assert.equal((await ask({ body: { question: 'hi' }, visitor: 'busy', store, model: model(), now: NOW })).status, 200);
  const stopped = await ask({ body: { question: 'hi' }, visitor: 'busy', store, model: model(), now: NOW });
  assert.equal(stopped.status, 429); assert.match(stopped.body.error, /tomorrow/);
  assert.equal((await ask({ body: { question: 'hi' }, visitor: 'someone-else', store, model: model(), now: NOW })).status, 200);
  assert.equal((await ask({ body: { question: 'hi' }, visitor: 'busy', store, model: model(), now: NOW + 86_400_000 })).status, 200, 'a new day starts fresh');
});

test('when the day\'s budget is used up, nothing else is spent and the page is told to fall back', async () => {
  const store = memory(); store.m.set('spend:2026-11-18', LIMITS.dailyCapUsd);
  let calls = 0;
  const out = await ask({ body: { question: 'hi' }, visitor: 'v', store, model: async () => { calls += 1; return { text: 'x', usage: {} }; }, now: NOW });
  assert.equal(out.status, 429); assert.equal(out.body.resting, true); assert.equal(calls, 0, 'the model is never called past the cap');
});

test('a failed model call is a plain 502 with nothing leaked, and the visit still counts', async () => {
  const store = memory();
  const out = await ask({ body: { question: 'hi' }, visitor: 'v', store, model: async () => { throw Error('upstream 500 with SECRET-KEY-123'); }, now: NOW });
  assert.equal(out.status, 502); assert.ok(!JSON.stringify(out.body).includes('SECRET'));
  assert.equal(store.m.get('visit:2026-11-18:v'), 1);
});

test('the Vertex call sends the key in a header, asks for low thinking, and counts thinking tokens as output', async () => {
  let seen;
  const call = vertexModel({ apiKey: 'test-key', fetchImpl: async (url, init) => { seen = { url, init }; return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: 'hi back' }] } }], usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 2, thoughtsTokenCount: 3 } }) }; } });
  const out = await call({ system: 's', user: 'u' });
  assert.deepEqual(out, { text: 'hi back', usage: { inputTokens: 5, outputTokens: 5 } });
  assert.equal(seen.init.headers['x-goog-api-key'], 'test-key'); assert.ok(!seen.url.includes('test-key'));
  const body = JSON.parse(seen.init.body);
  assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, 'low'); assert.equal(body.generationConfig.maxOutputTokens, LIMITS.maxOutputTokens);
  await assert.rejects(vertexModel({ apiKey: 'k', fetchImpl: async () => ({ ok: false, status: 400 }) })({ system: 's', user: 'u' }), /upstream 400/);
  await assert.rejects(vertexModel({ apiKey: 'k', fetchImpl: async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [] } }] }) }) })({ system: 's', user: 'u' }), /empty/);
});
