// The server side of the Context Vision Quest: one question in, one answer out, with hard limits on size, per-visitor
// use and total daily spend. It keeps no answers and no context. The only things stored are two counters.
// The model call and the counter store are passed in, so tests run without the network.
export const LIMITS = {
  questionChars: 400,
  contextChars: 6000,
  runsPerVisitorPerDay: 25,
  dailyCapUsd: 5,
  maxOutputTokens: 1500,
  // List prices set above real so the cap holds. Gemini 3.x Flash class, per million tokens.
  inputUsdPerMillion: 1.0,
  outputUsdPerMillion: 6.0,
};

const SYSTEM = 'You are a helpful assistant. Answer the request in at most 120 words, plainly, with no preamble. '
  + 'If a block called USER CONTEXT FILE is given, it is facts and preferences the person chose to share. Use whatever is relevant to the request and follow the style rules in it. '
  + 'Never mention the file or quote it. If nothing in it is relevant, ignore it.';

const today = now => new Date(now).toISOString().slice(0, 10);
const cost = usage => ((usage.inputTokens || 0) * LIMITS.inputUsdPerMillion + (usage.outputTokens || 0) * LIMITS.outputUsdPerMillion) / 1_000_000;

export function parseRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Send a question.' };
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const context = body.context === undefined || body.context === null ? '' : body.context;
  if (!question) return { error: 'Type a question first.' };
  if (question.length > LIMITS.questionChars) return { error: `Keep the question under ${LIMITS.questionChars} characters.` };
  if (typeof context !== 'string') return { error: 'The context file has to be text.' };
  if (context.length > LIMITS.contextChars) return { error: `The context file is over ${LIMITS.contextChars} characters. Trim it and try again.` };
  if (Object.keys(body).some(key => !['question', 'context'].includes(key))) return { error: 'Unexpected field.' };
  return { question, context: context.trim() };
}

export function promptFor({ question, context }) {
  return { system: SYSTEM, user: context ? `USER CONTEXT FILE:\n${context}\n\nREQUEST:\n${question}` : question };
}

// store: { get(key) -> number|null, set(key, number) }. visitor: a hashed, per-day token, never the raw address.
export async function ask({ body, visitor, store, model, now = Date.now() }) {
  const parsed = parseRequest(body);
  if (parsed.error) return { status: 400, body: { error: parsed.error } };
  const day = today(now);
  const spentKey = `spend:${day}`; const visitKey = `visit:${day}:${visitor}`;
  const spent = (await store.get(spentKey)) || 0; const used = (await store.get(visitKey)) || 0;
  if (spent >= LIMITS.dailyCapUsd) return { status: 429, body: { resting: true, error: "The demo's daily budget is used up. It comes back tomorrow. The prompt and the exports on this page still work." } };
  if (used >= LIMITS.runsPerVisitorPerDay) return { status: 429, body: { error: `That's ${LIMITS.runsPerVisitorPerDay} answers today from this connection. Come back tomorrow.` } };
  // Count the visit before the call, so a slow failure can't be retried for free.
  await store.set(visitKey, used + 1);
  let result;
  try { result = await model(promptFor(parsed)); }
  catch { return { status: 502, body: { error: 'The AI had a hiccup. Try again in a moment.' } }; }
  await store.set(spentKey, spent + cost(result.usage || {}));
  return { status: 200, body: { answer: String(result.text || '').trim().slice(0, 4000), withContext: Boolean(parsed.context) } };
}

// Gemini on Vertex AI, native endpoint, API key from the environment. Thinking is set low so answers stay quick and cheap.
export function vertexModel({ apiKey, model = 'gemini-3.8-flash', fetchImpl = fetch }) {
  return async ({ system, user }) => {
    const response = await fetchImpl(`https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: LIMITS.maxOutputTokens, thinkingConfig: { thinkingLevel: 'low' } } }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) throw Error(`upstream ${response.status}`);
    const data = await response.json();
    const text = (data.candidates?.[0]?.content?.parts || []).filter(part => typeof part.text === 'string' && !part.thought).map(part => part.text).join('');
    if (!text.trim()) throw Error('empty answer');
    const meta = data.usageMetadata || {};
    return { text, usage: { inputTokens: meta.promptTokenCount ?? 0, outputTokens: (meta.candidatesTokenCount ?? 0) + (meta.thoughtsTokenCount ?? 0) } };
  };
}
