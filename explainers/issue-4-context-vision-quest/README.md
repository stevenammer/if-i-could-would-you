# The Context Vision Quest (Issue #4 explainer)

Ask an AI something and get a generic answer. Let an AI interview you in a chat (type or talk), get a master context file you own, export it (Markdown, text, JSON, Word, PDF, or a short custom-instructions version), and ask the same thing again. Compare the two answers.

## What's live and what isn't

Three small functions talk to a real model (Gemini on Google Vertex AI): `netlify/functions/ask.mjs` (the two answers), `chat.mjs` (the interview, and writing the file from it) and `transcribe.mjs` (the Talk button). The page, the privacy check and every export run in the visitor's browser. The interview is stateless: the page sends the conversation each turn and the server keeps nothing. The file only leaves the browser when it's sent with the question to get the second answer.

## Limits and what is kept

- A question is at most 400 characters and a context file at most 6,000.
- 25 answers, 60 interview turns and 30 voice clips per visitor per day (a voice clip costs a flat estimate, an interview turn its real tokens, all against the same $5 daily cap).
- 25 answers per visitor per day. The visitor is a one-way hash of the address and the day, so it counts a day and can't be looked up afterwards.
- A hard daily budget of $5, counted at list prices set above the real ones. When it's used up the page says so, shows a labelled sample, and the exports keep working.
- No accounts, no cookies, no analytics. Answers and context files are not stored or logged. The only things kept are two counters.

## Run it on your machine

```sh
npm install
VERTEX_API_KEY=... npm run dev     # http://127.0.0.1:8790
npm test                           # the limits, the Word and PDF builders, the privacy check
PLAYWRIGHT_DIR=/path/to/node_modules node test/browser.e2e.mjs   # real browser, stand-in AI
```

## Deploy

Netlify: connect the folder, set `VERTEX_API_KEY` (and optionally `VERTEX_MODEL`, `CVQ_SALT`) as environment variables, and deploy. The key lives only in Netlify's settings. Never put it in the page or the repo.
