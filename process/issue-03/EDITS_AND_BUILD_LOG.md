# Issue #3: what changed after the handoff, and what was left alone

Written Nov 11, 2026. `ASSISTANT` here means Claude Code. Nothing below is pushed or published.

## Edits made to the article text (author-approved typo pass)

Steven asked for typo fixes only, said to keep "alls", and to leave judgment calls alone. These are the only changes to `issues/issue-03-working-draft.md` compared with the handoff copy `issue-03-prepublish.md`. Everything else is the handoff text, unchanged.

| # | Before | After | Why |
|---|---|---|---|
| 1 | `that sauce pan I forgot stir until` | `that saucepan I forgot to stir until` | typo: 'sauce pan' to 'saucepan', 'forgot stir' to 'forgot to stir' |
| 2 | `chatGPT found them right away` | `ChatGPT found them right away` | typo: capitalization |
| 3 | `turn firm mos to excited yeses` | `turn firm no's to excited yeses` | typo: 'mos' to 'no's' |
| 4 | `alls an "agent" is is your normal way` | `alls an "agent" is, is your normal way` | kept "alls" on purpose; comma added between "is" and "is" |
| 5 | `it giving you it's first take` | `it giving you its first take` | typo: it's to its |
| 6 | `to judge it's output off of` | `to judge its output off of` | typo: it's to its |
| 7 | `ad nauseum` | `ad nauseam` | typo: spelling |
| 8 | `"CLI" agents like Claude code and Codex? Just An AI call,` | `"CLI" agents like Claude Code and Codex? Just an AI call,` | typo: "Claude code" to "Claude Code", "An" to "an" |
| 9 | `agents like Muse and Dots and Grokbot? The exact` | `agents like Muse and Dots and Grokbot, and now Duet? The exact` | requested addition: "and now Duet" |
| 10 | `sometimes decades."](https://www.nature.com` | `sometimes decades.](https://www.nature.com` | typo: removed the stray closing quotation mark after "decades." |
| 11 | `![The AI Loop. Locked seven-panel comic.](../assets/the-ai-loop-locked.png)` | `![The AI Loop. Locked seven-panel comic.](../assets/issue-03/the-ai-loop-locked.png)` | asset path adapted to this repository |
| 12 | `See also: ["Hammer Time"](...otCpCn0l4Wo)` | `See also: ["Super Freak"](...QYHxGBH6o4M) to ["Can't Touch This"](...otCpCn0l4Wo)` | requested: link both videos. Both titles verified as the official uploads: "Rick James - Super Freak (Official Music Video)" and "M.C. Hammer - U Can't Touch This". |
| 13 | (HTML build comment about the interactive demonstration) | `TL;DR` line, then `Try it yourself: The Loop (interactive explainer)` | requested: link the explainer as TL;DR, matching Issue 2. Placed right before Word of the Week. The link is a repo path until the explainer is hosted. |

## Left alone on purpose (author-wording or judgment calls, flagged for review)

- **"Moana" clip:** the article says "claws"; the linked film line is "jaws". Not changed.
- **"For this week's offer to the throne:"** is the author's locked Groundhog Day caption. Not changed.
- **Opening line:** "teach it away... In a way... That inspires others." May be a dictation slip for "teach it. In a way..." Not changed.
- **Personal details:** the wife's job-list anecdote and laptop automation, and the professor's name spelling, are the author's call.
- **"Hammer Time" link:** resolved. Steven asked to link both videos, so the line now links "Super Freak" and "Can't Touch This". No side-by-side video was found; the songs are connected because "Can't Touch This" is built on the "Super Freak" riff and the dispute ended in a songwriting credit for James.
- **Cherny link:** goes to his LinkedIn profile, which does not itself contain the "writes loops now" claim. An article link would be a better source. Not changed.
- **Engelbart quote and page 12:** the PDF link resolves, but the quote and page number were not independently verified.

## The explainer (`explainers/issue-3/index.html`)

Built by the assistant from `INTERACTIVE_SPEC.md` plus Steven's direction. Every plain-words line in it was written by the assistant for the page. The article contains no semantic version of the code, and Steven asked for one to be written. They are labeled as page text, not newsletter prose.

Step 6 shows the wrong-operator bug a second time with an AI inside the loop: the AI notices nothing is new and sets moreToDo to 'N', and the `=` in the closing line puts it back to 'Y' every pass, so the loop runs forever (page emergency stop at 12 passes) unless a safety cap or the human stops it. Switching to `==` makes the loop respect the AI's answer.

Decisions that came from Steven: my product's visual theme (warm black, cream, aurora blue and violet); a big Plain words / Real code switch, starting on plain words; many fill-in blanks in the first step, on purpose annoying; real drag and drop; hints when stuck or idle; do-while examples throughout, because the article teaches a do-while loop, not a for loop; "and now Duet" added to the agent sentence.

Safety and honesty choices: it never runs the original C; word counts are capped 1 to 16; the `=` simulation stops after 6 trips and has a Stop button; the AI loop is scripted with made-up job postings and says so; it makes no network requests; it uses system fonts instead of the theme's web fonts for that reason.

Tests: a real-Chrome script (desktop and phone widths) exercises every step, the wrong-drop paths, hints, the Words/Code switch keeping filled blanks, input limits, the endless-loop caps, and checks for console errors, network requests and sideways overflow.
