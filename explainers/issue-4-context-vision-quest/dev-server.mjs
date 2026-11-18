// Runs the page and the /api/ask endpoint on your own machine with the same code the live function uses.
// VERTEX_API_KEY must be in the environment for live answers. Counters are kept in memory here.
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ask, chat, transcribe, vertexModel, vertexListener, vertexConverse } from './ask-core.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'public');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
export function makeServer({ model, listen, converse, store = new Map() } = {}) {
  const counters = { async get(key) { return store.get(key) ?? null; }, async set(key, value) { store.set(key, value); } };
  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/ask') {
      if (req.method !== 'POST') { res.writeHead(405); return res.end(); }
      let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 20_000) { res.writeHead(413); return res.end(); } }
      let body; try { body = JSON.parse(raw); } catch { res.writeHead(400, { 'content-type': 'application/json' }); return res.end('{"error":"Send JSON."}'); }
      const visitor = createHash('sha256').update(req.socket.remoteAddress || 'x').digest('hex').slice(0, 24);
      const result = await ask({ body, visitor, store: counters, model });
      res.writeHead(result.status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); return res.end(JSON.stringify(result.body));
    }
    if (url.pathname === '/api/chat') {
      if (req.method !== 'POST') { res.writeHead(405); return res.end(); }
      let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 60_000) { res.writeHead(413); return res.end(); } }
      let body; try { body = JSON.parse(raw); } catch { res.writeHead(400, { 'content-type': 'application/json' }); return res.end('{"error":"Send JSON."}'); }
      const visitor = createHash('sha256').update(req.socket.remoteAddress || 'x').digest('hex').slice(0, 24);
      const result = await chat({ body, visitor, store: counters, converse });
      res.writeHead(result.status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); return res.end(JSON.stringify(result.body));
    }
    if (url.pathname === '/api/transcribe') {
      if (req.method !== 'POST') { res.writeHead(405); return res.end(); }
      let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 2_200_000) { res.writeHead(413); return res.end(); } }
      let body; try { body = JSON.parse(raw); } catch { res.writeHead(400, { 'content-type': 'application/json' }); return res.end('{"error":"Send JSON."}'); }
      const visitor = createHash('sha256').update(req.socket.remoteAddress || 'x').digest('hex').slice(0, 24);
      const result = await transcribe({ body, visitor, store: counters, listen });
      res.writeHead(result.status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); return res.end(JSON.stringify(result.body));
    }
    const path = normalize(join(root, url.pathname === '/' ? 'index.html' : url.pathname));
    if (!path.startsWith(root)) { res.writeHead(403); return res.end(); }
    try { const body = readFileSync(path); res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' }); res.end(body); } catch { res.writeHead(404); res.end(); }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!process.env.VERTEX_API_KEY) console.log('VERTEX_API_KEY is not set: the Ask buttons will say the AI had a hiccup.');
  makeServer({ model: vertexModel({ apiKey: process.env.VERTEX_API_KEY || '' }), listen: vertexListener({ apiKey: process.env.VERTEX_API_KEY || '' }), converse: vertexConverse({ apiKey: process.env.VERTEX_API_KEY || '' }) }).listen(Number(process.env.PORT || 8790), '127.0.0.1', () => console.log('http://127.0.0.1:' + (process.env.PORT || 8790)));
}
