# How Issue 3 and its explainer were made

This is the plain account, written after the fact. It covers November 11, 2026. The dated decisions and the rejected video search are in [`ITERATION_HISTORY.md`](ITERATION_HISTORY.md) and [`REJECTED_VIDEO_TRAIL.md`](REJECTED_VIDEO_TRAIL.md). The line-by-line list of every wording change is in [`EDITS_AND_BUILD_LOG.md`](EDITS_AND_BUILD_LOG.md). This page is about the explainer and how the work went.

## Who did what

- **I wrote the article.** Every word of the issue is mine. After I finished it, an AI assistant (Claude Code) did a typo pass at my request, and made a short list of changes I asked for in my own words. Each one is in the edit log.
- **The assistant wrote the explainer**, the plain-English versions of the code, the tests, and the hosting setup, under my direction. The plain-English lines are labeled as written for the page, because I never wrote them myself.
- **I decided.** The assistant proposed and built. I said what was wrong with each version.

## The explainer went through five versions in one day

1. **Tabs.** A first version with four tabs: same job two ways, step through a loop, the `=` bug, a simplified AI loop. It worked, but it was a lecture with buttons.
2. **A puzzle.** I asked for something closer to a kids' test: drag the code pieces into the right spot, and only move forward when you get it right. Then a version where you place the loop pieces in order, "which would you rather write?", and "now imagine typing each one." I also asked for hints when someone is stuck or waits too long.
3. **My product's look, a words/code switch, do-while.** I asked for it to match my own product's visual theme, with a big switch at the top between plain words and real code, starting on plain words. I also noticed it used a `for` loop when the article teaches a `do while` loop, which is confusing. That was an assistant mistake: it picked the loop it knew best, not the one the lesson used.
4. **The wrong operator, with an AI inside.** I asked for the same `=` mistake to show up with an AI in the loop. In the final version the AI correctly notices nothing is new and says there is nothing more to do, and the `=` in the loop's last line quietly overwrites that answer every pass. The AI was never the problem. A safety cap or a human can still stop it.
5. **Easier first step.** My first-step "annoying on purpose" fill-in had 48 blanks. That was too hard. It is now 6 blanks, and the other 14 blocks fill themselves in so you still feel how repetitive it is.

One more correction near the end: the endless-loop step showed a made-up single line. I asked for the real code, and the assistant pulled it from my archived 2014 project. It is the real `do while (doesItFit = 'N')` inside the real outer loop, with eight lines trimmed and marked.

## What the tests caught

The explainer has a real-browser test (`e2e.mjs`, 91 checks, desktop and phone widths). It drags with a real mouse, taps with a phone-sized screen, and checks for console errors, outside network requests and sideways scrolling. It found real problems, not just the ones I could see:

- Dragging a number out of the sticky tray scrolled the page away from the target, so drops missed. The auto-scroll zone sat on top of the tray. Fixed by limiting it to the true screen edges.
- A "hard" goal in an early simulator was reachable after all, contradicting the page's own text. Fixed.
- A label overwrote its own word count in the first AI simulator. Fixed.
- Pieces dropped near the bottom of a phone screen could not be reached while dragging. Fixed with edge auto-scroll.

## Choices worth knowing about

- **Nothing runs the original C.** The 2014 code is unfinished and unsafe (for example `scanf("%s", ...)` has no length limit), so the page only animates a model of it. Word counts are capped, and the endless-loop demo stops after 6 trips with a Stop button.
- **The AI loop is scripted.** It uses made-up job postings and no real model. A model chooses its next step by reading the latest result. It does not retrain itself each pass, and a loop alone isn't everything an agent is.
- **No network at all.** It uses system fonts, not web fonts, and the hosted copy sets a strict Content-Security-Policy (`_headers`).
- **Hints are part of the design.** They appear when someone sits idle, after two wrong tries, or on request, and they escalate from a question to a glowing piece to a glowing spot.

## Things I'd flag as not fully settled

- The Engelbart quote's page number (12) is as I wrote it. It has not been independently checked.
- The link on "creator of Claude Code himself" goes to a profile, not to an article containing the claim.
- The assistant first guessed that "teach it away" in my tagline was a typo. It isn't. It is my phrase from Issue 1.

## Run it

```sh
PLAYWRIGHT_DIR=/path/to/folder-with-node_modules CHROME_PATH=/usr/bin/google-chrome npm run test:issue-3-explainer
```

The explainer itself is one file, [`../../explainers/issue-3/index.html`](../../explainers/issue-3/index.html). Live at https://if-i-could-issue-3.netlify.app/loop/.
