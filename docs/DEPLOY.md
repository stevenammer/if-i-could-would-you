# Host your own copy

Everything here is plain static files. No server, no build step you can't skip, no keys. You can host any of it on Netlify, GitHub Pages, Cloudflare Pages, or a folder on any web server.

## The Voice Workshop Prompt page

Source: [`sites/voice-workshop-prompt/`](../sites/voice-workshop-prompt). It's the prompt from Issue 1 on a page with a copy button, plus PDF and Word downloads.

To change the wording, edit `sites/voice-workshop-prompt/The_Voice_Workshop_Prompt.txt`, then rebuild the page:

```sh
python3 scripts/build-prompt-site.py
```

Then publish the `sites/voice-workshop-prompt` folder. On Netlify that's drag and drop, or `netlify deploy --prod --dir sites/voice-workshop-prompt`. On GitHub Pages, point Pages at that folder (or copy it to a `docs/` folder on a branch).

The live version is at https://if-i-could-would-you.netlify.app.

## The "what happens when you hit Send" explainer

Source: [`explainers/issue-2/index.html`](../explainers/issue-2/index.html). One self-contained file. Its answers are scripted and labeled that way; it doesn't call any AI. Open it in a browser or publish the folder as is.

The live version is at https://if-i-could-issue-2.netlify.app/send-button/.

## The loop explainer (Issue 3)

Source: [`explainers/issue-3/index.html`](../explainers/issue-3/index.html). One self-contained file, no network requests, and no AI: the loop demos are scripted and labeled that way. It's deployed with a small `_headers` file that sets a strict Content-Security-Policy (inline script and style only), under `loop/index.html` on its own Netlify site.

The live version is at https://if-i-could-issue-3.netlify.app/loop/.

## The parked context-window prototype

Source: [`coming-next/issue-03/index.html`](../coming-next/issue-03/index.html). Also one file, scripted, and not finished. Same deal.

## Make them yours

The writing is CC BY 4.0 and the code is MIT. Fork it, change the words, point it at your own topic, and keep a credit line. If you build something from it, I'd like to see it.
