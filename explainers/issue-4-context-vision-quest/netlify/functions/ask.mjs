// Netlify function: POST /api/ask. The key is a Netlify environment variable, never in the page or the repo.
import { createHash } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { ask, vertexModel } from '../../ask-core.mjs';

export const config = { path: '/api/ask' };
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default async (request, context) => {
  if (request.method !== 'POST') return json(405, { error: 'POST only.' });
  if (!process.env.VERTEX_API_KEY) return json(503, { error: 'The demo is not switched on.' });
  let body; try { body = await request.json(); } catch { return json(400, { error: 'Send JSON.' }); }
  // One-way hash of the address and the day, so a visitor can be counted for a day and never looked up afterwards.
  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash('sha256').update(`${context?.ip || request.headers.get('x-nf-client-connection-ip') || 'unknown'}|${day}|${process.env.CVQ_SALT || 'cvq'}`).digest('hex').slice(0, 24);
  const blobs = getStore('cvq-counters');
  const store = { async get(key) { const value = await blobs.get(key); return value === null ? null : Number(value); }, async set(key, value) { await blobs.set(key, String(value)); } };
  const result = await ask({ body, visitor, store, model: vertexModel({ apiKey: process.env.VERTEX_API_KEY, model: process.env.VERTEX_MODEL || 'gemini-3.8-flash' }) });
  return json(result.status, result.body);
};
