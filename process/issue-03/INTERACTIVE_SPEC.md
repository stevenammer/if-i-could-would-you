# Claude Code implementation specification: interactive learning demo

**Intent:** The *interactive demonstration* described by the author is a separate usable teaching component. The author's complete line is already retained in the publication manuscript as an HTML build comment. Do not publish the comment as paragraph copy.

**Non-negotiables**
- Keep the article's author prose exactly as supplied; the semantic visuals and control labels can be newly written **as tool UI**, separately attributable.
- Demo must be immediately usable without an AI API, paid account, backend, credentials, or installation.
- No pretended execution of the original Windows C file. It's unfinished, contains non-portable macros and unsafe input behavior. Animate a faithful explanatory model of the parts shown.
- One screen at a time or compact tabs; do not overwhelm beginners. Preserve a visible conceptual path to an off-ramp.
- Mobile first, keyboard accessible, touch targets large, captions legible, reduced-motion support.

## Stage 1: 16 tedious prompts

Show exactly the 16 repeated `if` blocks in the article (already present). Provide a plain-language representation repeating the same semantic instruction with a changing word number:

- If the reader asked for at least word 1: ask for word 1 and store it.
- If at least word 2: ask for word 2 and store it.
- ... continue through 16.

**Important:** The author's lesson depends on the unpleasant volume of repetition; don't collapse this to three lines by default. A simple comparison marker, syntax highlighting, and an expandable 16-row UI are acceptable if the repeated amount remains obvious. Mark this version **illustrative alternative, not Steven's 2014 source**.

## Stage 2: actual `getWords` source

Use the exact author excerpt visible in article. Show a live three-to-five-word example with `numberOfWords`, `count`, current prompt and saved words.

A stepper should follow:
1. `count = 0`
2. Ask for word `count + 1`
3. Save the entered word
4. `count++`
5. Check `count < numberOfWords`
6. Repeat until false, then show **exit**.

Input: constrain to `1..16` words. Safe browser UI can cap input length, but label that as a simulation safety choice; archival `scanf("%s", userWord)` itself is not bounds-safe. Do not run arbitrary C or let users execute the original source.

## Stage 3: the original broken stopping condition

Source: [`originals/wordSearchProjectSoFar.c`](https://github.com/stevenammer/before-the-vibes/blob/main/originals/wordSearchProjectSoFar.c) (`enterWordsIntoGrid`, February 2014 snapshot).

Show with careful syntax emphasis:

```c
} while (doesItFit = 'N');
```

Explain in a **UI label or tooltip**, not new author paragraph:

- `=` assigns `'N'` to `doesItFit` and returns a nonzero value, true in C; next iteration starts.
- Intended conditional comparison would use `==`. That alone doesn't fix the unfinished program.

The "infinite" illustration must **not actually run forever**. Simulate at most 4–6 passes, show a clearly labeled counter, then pause with `Still true, so it would keep repeating...` and a user-triggered `Stop simulation` control. Optionally offer `Switch to ==` so learners can see an exit based on a simulated successful fit. **Never** claim the finished word-search works after changing this character. Don't mock the actual user's 2014 effort.

The separate `if (direction = 1)` ... `= 8` mistakes exist in the original but are not the center of the author lesson. A technical details disclosure may mention them, separated from article prose.

## Stage 4: simple tool-using AI loop

Illustrate a **scripted** fictional example, not a live autonomous agent:

`Goal` → `AI chooses a next step` → `Tool takes action` → `Result comes back` → `AI checks result` → `Continue / Stop / Ask human`.

Use a small universally relatable example with clearly labeled mock responses. Better: one of the author's own examples already inside the piece, such as repeatedly checking an automated job search for new roles, with a **deduplication gate and explicit stop**. This makes the stakes visible. Display that a model can choose a different next action on the basis of tool feedback, unlike a rigid repeated prompt.

Do not imply the model retrains its internal weights after each action. State in the UI that the process changes its next action by reading the latest input/tool result. Tools, permissions and safeguards matter. A loop on its own is not a complete definition of every agent product.

## Design and technical guidance

- Inspect the site's existing framework, CSS tokens, HTML accessibility patterns and current explainer before implementation. Use its components/theme where reasonable; don't add a new heavy dependency for a small demo.
- Create isolated route, e.g. `explainers/loop/index.html`, without modifying the live Issue #2 explainer. Link it from the Issue #3 article at the exact reader handoff spot after the agent explanation or adjacent to the code example; decision belongs to author during preview.
- Provide Code/Plain-English switch; step/back/reset controls with no hidden state drift; a progress indicator and terminating state.
- Provide descriptive text alongside color so no concept relies on red/green alone. Use visible focus rings and semantic labels.
- Verify desktop and mobile breakpoints, zoom to 200%, keyboard-only operation, prefers-reduced-motion.
- Security: don't send user-entered words to an external service; no local secrets; avoid executing source code; if embedding third-party YouTube videos, prefer a privacy-conscious thumbnail/link or consent-based embed.
- Clearly attribute original source, archive date, and illustrative simulations.

## Acceptance tests

- Entering 3 words shows exactly 3 input cycles, then stops.
- 1 and 16 words work; zero and greater than 16 are blocked with helpful inline message.
- Text source panels match article; no claim the archival project works.
- Broken condition demonstrates repeated truth **without freezing the page**.
- Changing the simulated condition changes the exit behavior with an explicit note that it is only a conceptual simulation.
- Agent loop can stop on success, time/attempt cap, and human interruption.
- No unintended network calls or paid services.
- Article source copy preserved; proposed UI text and publication diffs shown before merge.
