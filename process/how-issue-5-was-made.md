# How Issue 5 was made

Issue 5 is the one where my wife sent me a link to an animated read-aloud of a kids' book and asked, "Can you make the pages come alive a little like this?" I said yes before I knew what that meant. This is the honest version of how it went, mistakes included.

- The finished video, with every 1904 page next to the animated version: [if-i-could-issue-5.netlify.app/watch](https://if-i-could-issue-5.netlify.app/watch/)
- The replay of the real build session: [if-i-could-issue-5.netlify.app](https://if-i-could-issue-5.netlify.app/)
- The source for both pages: [`explainers/issue-5-five-minutes/`](../explainers/issue-5-five-minutes)

## Picking a book I was allowed to use

I didn't want to animate somebody else's book without permission, so the plan used L. Leslie Brooke's *The Story of the Three Little Pigs* from 1904. It's public domain, and the Library of Congress scanned it and lists it as free to use and reuse. I also softened the story for preschoolers. In the 1904 version the wolf eats two pigs and then gets eaten. In ours, nobody gets eaten.

## The planning (free)

Same as I described in the issue. I planned in free chat apps, ran the plan past a few of them for second opinions, and only then handed one file and one prompt to my coding agent, Claude Code. Before it touched anything it watched the reference video with Google's free Gemini, pulled the book from the Library of Congress, and checked what my laptop could actually do.

## The build

A loop ran on my laptop for about two days. Every few minutes a cheaper model woke up, checked the work, handed building jobs to Codex, and wrote down what it learned. A more expensive model reviewed the drafts. I mostly typed short complaints. The real prompts are in the replay.

By the end it had run 296 loop cycles, 95 Codex jobs and 166 commits on the video project, and made 35 full versions of the book.

## What went wrong (the useful part)

- **It built one scene perfectly while the rest of the book waited.** Eleven scenes sat untouched for six and a half hours. When I asked what was taking so long, it changed the plan to a rough cut of the whole book first.
- **The quotas ran out.** Codex hit its weekly limit. Claude hit its 5-hour limit and the loop read that as a crash and stopped itself. It had to learn to sleep through limits.
- **The video I tried to show my wife was black.** It was saved in a format phones can't play, so you got the sound and no picture.
- **The subtitles glitched.** Between words the text box jumped back to the start of the sentence.
- **The coloring was half done.** Pigs with pink heads on white bodies. The fix came from a tool I already had.
- **The sounds disappeared.** The sound mixes were a day out of date and every sound effect was buried under the narrator, so the bricks stopped going clunk.

## Where Google Flow came in

I asked if I had any free Google stuff to use. Turns out my Google plan includes Flow credits. Flow did two jobs:

1. **It colored the black and white pages.** Its image editor colored all 15 line drawings in Brooke's style. That didn't cost credits.
2. **It animated the big moments.** Nine short clips, each one starting from the actual book page: the houses blowing away, the brick house that won't budge, the apple, the churn, the chimney, the splash, and the pigs dancing on the cover. One clip had to be remade because the wolf went down a hole next to the chimney instead of the chimney. Each clip cost 24 of my plan's credits.

Everything else, the cut-out characters, the timing, the text boxes, the sound and putting it all together, was built by the coding agents on my laptop.

## What it cost

No new money. Everything ran on subscriptions I already pay for, free tiers, and the Flow credits that came with my Google plan. The narrator is a free AI voice, labeled as a placeholder, until a real reader records it.

## What I'd do differently

- Ask for the whole thing rough first, then polish. Perfecting scene one first cost most of a day.
- Watch it on a phone early. Two of the worst bugs only showed up there.
- Give the expensive model the job of looking, and keep it looking. Most fixes started with "that looks wrong."
