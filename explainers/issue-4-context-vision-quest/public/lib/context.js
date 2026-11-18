// The first thing the interviewer says. The rest of the interview is a live chat.
export const OPENER = "Hi. I'm going to interview you so your AI finally knows who you are. I ask one question at a time, you answer however you like, and you can skip anything or talk instead of type. First one: what do you want your AI to help you with?";

// Things worth a second look before a file is shared or pasted into a tool. A hint, never a promise that it caught everything.
export function privacyFlags(text) {
  const flags = [];
  const test = (label, pattern) => { if (pattern.test(text)) flags.push(label); };
  test('an email address', /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  test('a phone number', /(?:\+?\d{1,2}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}/);
  test('what looks like a street address', /\b\d{1,5}\s+[A-Za-z0-9.\s]{2,30}\s(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct)\b/i);
  test('a long number, like an account or card number', /\b(?:\d[ -]?){12,19}\b/);
  test('something labelled as a password or key', /\b(?:password|passcode|api[ _-]?key|secret|token)\s*[:=]/i);
  return flags;
}

// A shorter version for the custom-instructions boxes some chat tools offer, which have a small limit.
export function customInstructions(markdown, limit = 1500) {
  const plain = markdown.replace(/^# .*$/m, '').replace(/^Updated .*$/m, '').replace(/^## /gm, '').replace(/\n{3,}/g, '\n\n').trim();
  return plain.length <= limit ? plain : `${plain.slice(0, limit - 1).replace(/\s+\S*$/, '')}…`;
}

export const INTERVIEW_PROMPT = `You're a patient interviewer who helps people write the context file their AI should have been given on day one.

I want to build my master context file: one short file I can hand to any AI at the start of a conversation so it already knows who I am and how I like to work. I'm starting from nothing, so you'll have to pull it out of me.

What I'm trying to do: [replace this with one sentence, like "get better answers from AI at my job" or "stop re-explaining myself every chat"]

Before you ask me anything, list the assumptions you're already making about me and ask up to three questions that would change your approach. Wait for my answers.

Then interview me:
- One question at a time. Wait for my answer before the next one.
- Cover who I am, my work, what I'm working on right now, how I like answers to look, rules and pet peeves, the tools I use, anything about life outside work that I choose to share, and boundaries (what you should never bring up or assume).
- Don't run a generic questionnaire. Build each question from what I just said, and dig in when an answer is vague.
- When I give you a rule, ask me why I want it. A rule with a reason works better than a rule on its own.
- At some point, ask me for one answer from an AI that I loved and one that I hated. Examples teach you more than adjectives.
- If I skip a question or say "pass", move on. Don't push.
- I may talk instead of type, so expect rambling. Pull out what matters.
- Keep asking until you have what you need to write a file that sounds like me, or until I say "done".
- Never ask for passwords, account numbers, or anything I wouldn't put in a note to a stranger.

When I say "done" (or after about 12 questions), do this:
1. Write the file in Markdown with these headings: Who I am, My work, What I am working on right now, How I like answers, Rules and pet peeves (with the reason for each), Tools I use, Life outside work (only what I chose to share), Boundaries. Keep it to about one page, and leave out anything generic that would be true of anybody.
2. Be critical of your own draft. Tell me what you cut, what contradicts itself, and what you guessed.
3. List the assumptions you made that I never actually told you, so I can correct them. Then ask me what's missing or wrong.
4. Rewrite the file with my corrections.

Then use this file at the start of every new conversation. When I give you a new rule, update it, and hand me the new version at the end of the chat.`;
