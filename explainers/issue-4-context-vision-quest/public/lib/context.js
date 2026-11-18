// The interview questions, the file they become, and a check for things people usually don't mean to share.
export const SECTIONS = [
  { id: 'who', title: 'Who I am', question: 'What should the AI call you, and who are you in a sentence or two?', hint: 'Your name or nickname, where you are, anything that frames the rest.' },
  { id: 'work', title: 'My work', question: 'What do you do for work, and what does a good day look like?', hint: 'Your role, the kind of problems you solve, who you do it for.' },
  { id: 'goals', title: 'What I am working on right now', question: 'What are the one to three things you are working toward this month or this quarter?', hint: 'Projects, deadlines, goals. The stuff you keep re-explaining.' },
  { id: 'style', title: 'How I like answers', question: 'How do you like answers to look?', hint: 'Short or thorough, plain or technical, bullets or paragraphs, formal or casual.' },
  { id: 'rules', title: 'Rules and pet peeves', question: 'What should it always or never do?', hint: 'Things like "search before answering", "no em dashes", "ask me a question if you are unsure".' },
  { id: 'tools', title: 'Tools I use', question: 'What software and tools do you use every day?', hint: 'So it stops suggesting things you can not use.' },
  { id: 'life', title: 'Life outside work (only what I choose to share)', question: 'Anything about your life outside work that would help? Skip it if you like.', hint: 'Family, time, money, health, hobbies. Only what you are comfortable with.' },
  { id: 'never', title: 'Boundaries', question: 'What should it never bring up, assume, or ask about?', hint: 'This is how you set the privacy line.' },
  { id: 'extra', title: 'Anything else', question: 'What else would you regret not mentioning?', hint: 'The thing you wish it already knew.' },
];

export function buildFile(answers, { now = new Date() } = {}) {
  const day = now.toISOString().slice(0, 10);
  const parts = [`# Master context file`, `Updated ${day}. Edit this any time something changes, and paste it at the start of a new chat.`];
  for (const section of SECTIONS) {
    const text = String(answers[section.id] || '').trim();
    if (text) parts.push(`## ${section.title}\n${text}`);
  }
  if (parts.length === 2) parts.push('(Nothing here yet. Answer one question above and it shows up.)');
  return parts.join('\n\n') + '\n';
}

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

export const INTERVIEW_PROMPT = `I want you to interview me and then write my master context file.

How to run it:
- Ask one question at a time. Wait for my answer before the next one.
- Cover: who I am, my work, what I'm working on right now, how I like answers to look, rules and pet peeves, the tools I use, anything about life outside work that I choose to share, and boundaries (what you should never bring up or assume).
- If I skip a question or say "pass", move on. Don't push.
- If I answer with something that raises a follow-up that would clearly help, ask one short follow-up. Otherwise move on.
- I may talk instead of type, so expect rambling. Pull out what matters.
- Never ask for passwords, account numbers, or anything I wouldn't put in a note to a stranger.

When I say "done" (or after about 12 questions), do this:
1. Write the file in Markdown with these headings: Who I am, My work, What I am working on right now, How I like answers, Rules and pet peeves, Tools I use, Life outside work (only what I chose to share), Boundaries.
2. List the assumptions you made that I never actually told you, so I can correct them.
3. Ask me what's missing or wrong.

Then use this file at the start of every new conversation, and update it when I give you a new rule.`;
