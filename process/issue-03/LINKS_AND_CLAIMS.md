# Issue #3: source links, claims, and caveats

> **Pre-publish handoff, kept as written (Nov 11, 2026, before posting).** Some lines below are stale: the issue is now published, the Moana line says "jaws", the Hammer Time link became "Super Freak" and "Can't Touch This", and nothing here is a standing instruction. The current record is [`EDITS_AND_BUILD_LOG.md`](EDITS_AND_BUILD_LOG.md).

Keep user links intact. Formatting link text in Markdown is authorized. Do not silently swap a source, present an assistant suggestion as the author's, or turn a satire line into a verified product statement.

## Publication links (included in current working article)

| Location / linked text | Target | Notes |
|---|---|---|
| "interested" | https://github.com/stevenammer/before-the-vibes | Steven's C coursework archive. Actual unfinished word search at `originals/wordSearchProjectSoFar.c`. |
| "creator of Claude Code himself" | https://www.linkedin.com/in/bcherny | Boris Cherny profile, author-supplied link. "Creator" phrase belongs to Steven's satirical sentence. |
| Moana / Gramma Tala "devoured" callback | https://clip.cafe/moana-2016/the-ocean-chose-you/t/156 | Clip shows the relevant moment. **Accuracy flag:** Film uses "jaws," but the authored newsletter currently says "claws." Do not edit without author's approval. |
| Douglas Engelbart's 1992 Bootstrap Planning Document | https://www.dougengelbart.org/pubs/seminars/sembinder1992nov/Bootstrap-Seminar-Binder-Nov1992.pdf | Quote supplied by author, page 12. Use as citation, do not rehost PDF. |
| Flennerhag et al., Bootstrapped Meta-Learning | https://arxiv.org/abs/2109.04504 | Quote supplied by author. |
| "Hammer Time" | https://www.youtube.com/watch?v=otCpCn0l4Wo | Song video. Link/embed only; do not reproduce copyrighted audio in site. |
| A Dose of Optimism | https://www.nature.com/articles/s41591-026-04477-5 | Talos genomic reanalysis study. Does not mean a general system can notify all patients of any diagnosis automatically. |
| A Dash of Pessimism | https://chrisboyd.me/blog/openclaw-meltdown/ | Operator's firsthand account of automation going wrong. |
| "Something to Watch on the Throne" | https://youtu.be/6VF5P7qLaEQ?is=iyiy6aRaP6ApDUJl | Selected `Groundhog Day` (1993), "I'm a god" scene. YouTube upload title verified. **Not** the earlier robot video. |
| This Week's Laugh | ../../assets/issue-03/the-ai-loop-locked.png | This file is the actual approved user-supplied comic; do not reconstruct from prompt. |

## Archive and implementation source links

| Source | URL | Provenance / implication |
|---|---|---|
| Word-search source | https://github.com/stevenammer/before-the-vibes/blob/main/originals/wordSearchProjectSoFar.c | February 2014 **unfinished** original; the finished word-search version has not been located. |
| Repo README | https://github.com/stevenammer/before-the-vibes/blob/main/README.md | Author intentionally labels the code as coursework, not professional engineering. |
| Repo assessment | https://github.com/stevenammer/before-the-vibes/blob/main/ASSESSMENT.md | Other bugs include `if (direction = 1)` assignments, unchecked `scanf`, incomplete direction functions. |
| Codex loop discussion | https://openai.com/index/unrolling-the-codex-agent-loop/ | Useful external technical comparison; not user-authored newsletter prose. |
| Earlier Issue #3 branch | https://github.com/stevenammer/if-i-could-would-you/blob/main/coming-next/issue-03/idea.md | Context-management prototype parked on Nov 5. |
| Current newsletter repo | https://github.com/stevenammer/if-i-could-would-you | Target site/repo, do not push by default. |
| Newsletter LinkedIn | https://www.linkedin.com/newsletters/if-i-could-would-you%3F-7521263683642056705/ | Publication channel (not permission to publish). |
| Earlier rejected 2022 robot | https://www.youtube.com/watch?v=xAXvfVTgqr0 | Retain only in iteration history. |

## Accuracy and voice flags for review — no silent changes

1. "A loop... Is a circle. It goes round and round and repeats itself forever" is the author's introductory metaphor; a programming loop can be finite. He immediately introduces the off-ramp. **Do not rephrase as your own lecture.**
2. `=` in C assignment expressions is correctly identified as the infinite-loop mechanism because `'N'` is nonzero. `==` compares. Note that the 2014 file is also unfinished/unsafe, so changing one character is not a program repair.
3. Historical `scanf("%s", userWord)` can overflow; keep it **unaltered in the historical quote** but do not offer it as safe coding advice or use it in a live runnable demonstration.
4. The sentence describing an agent as "normal way of interacting with an AI and a loop" is a teaching simplification. Tools, permissions, state, external triggers and stop checks can be significant. Distinguish from claims about retraining neural weights.
5. Personal automated job-list anecdote is the author's recollection, not a verified email log; don't add counts or timestamps beyond what the author wrote.
6. The optimism study concerns periodic reanalysis of existing genomic data and additional diagnoses in a specific cohort, not universal patient-alert capability. Source verification can be a supplementary footnote, but don't rewrite the author's paragraph without permission.
7. "Fable" in Groundhog Day caption is the author's humorous reference; don't substitute a different model name or assert release facts without source validation. The sentence is not a factual review of a current model.
8. Comic panel 6 and 7 are satirical. Never attribute the exact balloons as official OpenAI or Anthropic announcements.
9. The orphan quotation mark after "decades." in optimism and the "claws"/"jaws" mismatch are **author-wording review flags**, not editing permission.
10. The new corrected ending is a syntactically valid snippet, not a complete C program. It does take input inside the loop; the old one did not.
