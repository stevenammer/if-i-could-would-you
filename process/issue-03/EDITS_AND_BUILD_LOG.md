# Issue #3: what changed after the handoff, and what was left alone

Written Nov 11, 2026. `ASSISTANT` here means Claude Code. Nothing below is pushed or published.

## Edits made to the article text (author-approved typo pass)

Steven asked for typo fixes only, said to keep "alls", and to leave judgment calls alone. These are the only changes to `issues/issue-03.md` compared with the handoff copy `issue-03-prepublish.md`. Everything else is the handoff text, unchanged.

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
| 14 | `Where I see if I can figure something out and then teach it away... In a way... That inspires others.` | `Where I find out what I can do, then find out if I can teach it away in a way that inspires others.` | requested: use the same tagline wording as Issue 1 (where "teach it away" is the author's own phrase). |
| 15 | `bloodthirsty claws of inescapable death!` | `bloodthirsty jaws of inescapable death!` | requested: matches the film line. |
| 16 | `["interested"](https://github.com/stevenammer/before-the-vibes)` | `[interested](https://github.com/stevenammer/before-the-vibes)` | requested: "interested" is hyperlinked only, no quotation marks |
| 17 | `then find out if I can teach it away in a way that inspires others.` | `then find out if I can teach it away, in a way, that inspires others.` | requested: commas after "away" and "way" |
| 18 | `named Dennis Hunchuck who had` | `named [Dennis Hunchuck](https://www.linkedin.com/in/dennis-hunchuck-7a748a56/) who had` | requested: link the professor on LinkedIn. Chosen profile: Valencia College, West Virginia University. Three other newer-looking Valencia "Dennis Hunchuck" profiles exist. |
| 19 | `some secret agent language to talk to computers, but` | `some secret agent language to talk to computers with, but` | requested: "to talk to computers with" |
| 20 | `not at all unlike my word search strategy when` | `not at all unlike my *actual* word search strategy when` | requested: emphasize "actual" in italics. This adds the word "actual". Italics need to be applied in the LinkedIn editor. |
| 21 | `trying to turn firm no's to excited yeses with no clear indication of` | `trying to turn firm nos to excited yeses without any clear indication of` | requested: correct plural ("nos", like "yeses"; "noes" is also accepted) and "without any clear indication of" |
| 22 | `Finally something would reward me figuring out` | `Finally something would reward me for figuring out` | grammar: added "for" |
| 23 | `start showing you gasp actual code` | `start showing you \*gasp\* actual code` | requested: asterisks around "gasp" so it reads as humor (escaped so they show literally) |
| 24 | `and a loop to go around periodically just to make sure they stay busy.` | `periodically just to make sure they stay busy.` | requested: "a manager that gives them a kick in the tail periodically just to make sure they stay busy" |
| 25 | `but at least now you know "who" we're dealing with.` | `but at least you know "who" we're all dealing with here.` | requested: "At least you know \"who\" we're all dealing with here" |
| 26 | `Especially when things start getting wacky.` | `Especially when things start getting weird.` | requested: "weird" instead of "wacky" |
| 27 | `That's why when I see something like this,` | `That's why, when I see something like this,` | comma after "why" |
| 28 | `    printf("Read it again.\n");
    printf("Do you get it yet? (y/n): ");` | `    printf("Read it again.\n");
    sleep(2);  // pause for effect
    printf("Do you get it yet? (y/n): ");` | requested: a pause between the print statements in the parting shot |
| 29 | `(placeholder for the plain-English version of the first code example)` | `16 plain-English lines, one per block` | requested: a plain-English version of the first example. Written by the assistant; "spot" numbers count from 0 like the code. |
| 30 | `(placeholder for the "Semantic version" of the real getWords code)` | `plain-English version of each line` | requested: the semantic version of the 2014 code. Written by the assistant. |
| 31 | `the single `} while (doesItFit = 'N');` line` | `the real surrounding loops from the 2014 file, with the eight direction tries trimmed and marked` | requested: retrieve the real code. Source: before-the-vibes originals/wordSearchProjectSoFar.c, enterWordsIntoGrid. The inner `do while` is stuck, so the outer `count++` is never reached. |

## Left alone on purpose (author-wording or judgment calls, flagged for review)

- **Edits that added or changed words, applied as requested but worth a second look:** "my *actual* word search strategy" (adds the word "actual"), and "without any clear indication of" (was "with no clear indication of").

- **"For this week's offer to the throne:"** is the author's locked Groundhog Day caption. Not changed.
- **"Hammer Time" link:** resolved. Steven asked to link both videos, so the line now links "Super Freak" and "Can't Touch This". No side-by-side video was found; the songs are connected because "Can't Touch This" is built on the "Super Freak" riff and the dispute ended in a songwriting credit for James.
- **Cherny link:** goes to his LinkedIn profile, which does not itself contain the "writes loops now" claim. An article link would be a better source. Not changed.
- **Engelbart quote and page 12:** the PDF link resolves, but the quote and page number were not independently verified.

## The explainer (`explainers/issue-3/index.html`)

Built by the assistant from `INTERACTIVE_SPEC.md` plus Steven's direction. Every plain-words line in it was written by the assistant for the page. The article contains no semantic version of the code, and Steven asked for one to be written. They are labeled as page text, not newsletter prose.

Step 6 shows the wrong-operator bug a second time with an AI inside the loop: the AI notices nothing is new and sets moreToDo to 'N', and the `=` in the closing line puts it back to 'Y' every pass, so the loop runs forever (page emergency stop at 12 passes) unless a safety cap or the human stops it. Switching to `==` makes the loop respect the AI's answer.

Decisions that came from Steven: my product's visual theme (warm black, cream, aurora blue and violet); a big Plain words / Real code switch, starting on plain words; a fill-in first step that is a bit tedious on purpose, but only 6 blanks (the first two blocks), then the other 14 blocks fill themselves so the repetition is felt without the work; real drag and drop; hints when stuck or idle; do-while examples throughout, because the article teaches a do-while loop, not a for loop; "and now Duet" added to the agent sentence.

Safety and honesty choices: it never runs the original C; word counts are capped 1 to 16; the `=` simulation stops after 6 trips and has a Stop button; the AI loop is scripted with made-up job postings and says so; it makes no network requests; it uses system fonts instead of the theme's web fonts for that reason.

Tests: a real-Chrome script (desktop and phone widths) exercises every step, the wrong-drop paths, hints, the Words/Code switch keeping filled blanks, input limits, the endless-loop caps, and checks for console errors, network requests and sideways overflow.

## Posting (Nov 11, 2026)

Steven approved the post in chat, and the assistant published it to his LinkedIn newsletter through his logged-in browser. The article text in the editor was checked block by block against `issues/issue-03.md` (71 blocks, all identical before the images went in). Two things differ on LinkedIn because its editor can't do them as text:

- The busted loop is a picture of the real code with the single `=` highlighted in red, with alt text, because a code block can't highlight one character and the article says "look at the highlighted portion."
- The editor turned `*gasp*` into italics when pasted, so the asterisks were put back by hand to keep them visible.

A cover image in the same style as Issue 2's was added (`covers/issue-03-cover.png`). No intro text was added to the post. Published: https://www.linkedin.com/pulse/i-could-would-you-issue-3-steven-ammer-i0ane
