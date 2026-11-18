// Netlify function: POST /api/chat. The interview. Stateless: the page sends the conversation each turn and nothing is kept.
import { createHash } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { chat, vertexConverse } from '../../ask-core.mjs';

export const config = { path: '/api/chat' };
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default async (request, context) => {
  if (request.method !== 'POST') return json(405, { error: 'POST only.' });
  if (!process.env.VERTEX_API_KEY) return json(503, { error: 'The demo is not switched on.' });
  const text = await request.text();
  if (text.length > 60_000) return json(413, { error: 'That chat is too long. Press Write my file, or start over.' });
  let body; try { body = JSON.parse(text); } catch { return json(400, { error: 'Send JSON.' }); }
  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash('sha256').update(`${context?.ip || request.headers.get('x-nf-client-connection-ip') || 'unknown'}|${day}|${process.env.CVQ_SALT || 'cvq'}`).digest('hex').slice(0, 24);
  const blobs = getStore('cvq-counters');
  const store = { async get(key) { const value = await blobs.get(key); return value === null ? null : Number(value); }, async set(key, value) { await blobs.set(key, String(value)); } };
  const result = await chat({ body, visitor, store, converse: vertexConverse({ apiKey: process.env.VERTEX_API_KEY, model: process.env.VERTEX_MODEL || 'gemini-3.8-flash' }) });
  return json(result.status, result.body);
};
