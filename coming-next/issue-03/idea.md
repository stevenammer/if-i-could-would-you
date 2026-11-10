# Parked idea for Issue 3: Context management (Nov 5 2026)

Parked, not dead. Issue 3 went a different direction. These are an AI assistant's working notes from the day I had the idea, kept as they were written.

Seed (his words): the interactive explainer should show the context window, maybe even compact in the middle of it. "Maybe this will be next week's lesson. Context management."

Rough shape (a proposal, not built):
- Extend the "what happens when you hit Send" explainer (if-i-could-issue-2.netlify.app/send-button/) with a context-window gauge: a bar that fills as each turn adds the system prompt, memory, the conversation so far, tool results and the new message.
- Add a "compaction" moment mid-demo: the bar hits its limit, the app summarizes the older turns into a short note, the bar drops, and the right-hand view shows what was kept and what was lost (the wording of an early instruction is paraphrased, which is the Issue 2 story).
- Challenge for readers: start a long chat, ask the AI what it remembers from the beginning, compare.

Rules from Issue 2 to keep: do not touch the published explainer (the live article links to it); build as a separate page; the demo's answers are scripted and labeled as such; the Context Window section in Issue 2 has claims experts may dispute, so check facts before teaching them as rules.
Status: a scripted prototype exists (8 steps, pin toggle). It's the `index.html` in this folder. Not deployed.
