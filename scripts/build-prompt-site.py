import html, os

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, "..", "sites", "voice-workshop-prompt")
prompt = open(os.path.join(SITE, "The_Voice_Workshop_Prompt.txt"), encoding="utf-8").read().strip()
words = len(prompt.split())

page = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Voice Workshop Prompt</title>
<meta name="description" content="Paste this into your AI and it'll learn to write like you, not like a bot and not like a generic human. From the newsletter If I Could, Would You? by Steven Ammer.">
<meta property="og:title" content="The Voice Workshop Prompt">
<meta property="og:description" content="Paste this into your AI and it'll learn to write like you. Free to copy, change, and share.">
<meta property="og:type" content="website">
<meta name="theme-color" content="#0c0c0b">
<style>
:root{
  --bg:#0c0c0b; --panel:#161614; --text:#efece4; --dim:#b9b4a7; --faint:#8f8a7e;
  --line:rgba(239,236,228,.14); --blue:#6ea8ff; --violet:#a99ae8; --green:#9acb91; --on-accent:#0c0c0b;
}
@media (prefers-color-scheme: light){
  :root{--bg:#f4efe4; --panel:#fffaf0; --text:#23211d; --dim:#4f493f; --faint:#6b6558; --line:#d8cebc; --blue:#1f5fbf; --violet:#5b49b0; --green:#3f7a37; --on-accent:#fffaf0;}
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font:17px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:720px;margin:0 auto;padding:28px 20px 72px}
.hero{border:1px solid var(--line);border-radius:22px;padding:clamp(24px,5vw,44px);
  background:linear-gradient(135deg,rgba(169,154,232,.10),var(--panel) 46%,rgba(154,203,145,.07))}
h1{font:400 clamp(36px,7vw,58px)/1.05 Georgia,"Iowan Old Style","Times New Roman",serif;letter-spacing:-.03em;margin:0 0 14px}
.lede{color:var(--dim);margin:0 0 22px;max-width:56ch;font-size:1.06em}
.actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
button.go,a.btn{font:inherit;font-weight:600;border-radius:999px;padding:14px 24px;min-height:48px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
button.go{background:var(--blue);color:var(--on-accent);border:0}
a.btn{border:1px solid var(--line);color:var(--text);background:transparent}
a.btn:hover,button.go:hover{filter:brightness(1.08)}
:focus-visible{outline:3px solid var(--violet);outline-offset:3px}
#status{min-height:1.5em;margin:12px 0 0;color:var(--green);font-size:.95em}
h2{font:400 26px/1.2 Georgia,"Iowan Old Style",serif;letter-spacing:-.02em;margin:40px 0 12px}
ol.steps{padding-left:1.25em;margin:0}
ol.steps li{margin:0 0 10px;color:var(--dim)}
ol.steps strong{color:var(--text);font-weight:600}
details{border:1px solid var(--line);border-radius:14px;background:var(--panel);margin-top:14px}
summary{cursor:pointer;padding:16px 18px;font-weight:600;border-radius:14px}
pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:0;padding:6px 18px 20px;max-height:520px;overflow:auto;color:var(--dim);font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.note{color:var(--faint);font-size:.92em;margin-top:28px}
.note p{margin:0 0 8px}
footer{margin-top:44px;color:var(--faint);font-size:.9em;border-top:1px solid var(--line);padding-top:18px}
@media (max-width:420px){.actions>*{width:100%}}
@media (prefers-reduced-motion:no-preference){button.go,a.btn{transition:filter .15s}}
</style>
</head>
<body>
<main class="wrap">
  <section class="hero">
    <h1>The Voice Workshop Prompt</h1>
    <p class="lede">Paste this into your AI and it'll try to learn how you write, then write something new that sounds like you. Not like a bot. Not like a generic human, either.</p>
    <div class="actions">
      <button class="go" type="button" id="copy">Copy the prompt</button>
      <a class="btn" href="The_Voice_Workshop_Prompt.pdf">PDF</a>
      <a class="btn" href="The_Voice_Workshop_Prompt.docx">Word</a>
      <a class="btn" href="The_Voice_Workshop_Prompt.txt">Plain text</a>
      <a class="btn" href="The_Voice_Workshop_Prompt.md">Markdown</a>
    </div>
    <p id="status" role="status" aria-live="polite"></p>
  </section>

  <h2>How to use it</h2>
  <ol class="steps">
    <li><strong>Copy it.</strong> One tap on the button above grabs the whole thing.</li>
    <li><strong>Paste it into your AI</strong> as your first message. Any chat AI will do.</li>
    <li><strong>Answer its questions.</strong> It'll ask for samples of your writing first. Use things you typed yourself, not things an AI helped with.</li>
    <li><strong>Tear it apart.</strong> Tell it everything that sounds wrong. Every correction becomes a rule.</li>
  </ol>
  <p class="note">Short on time? Tell it QUICK MODE and it'll skip to a faster version.</p>

  <h2>The whole prompt</h2>
  <details>
    <summary>Read all __WORDS__ words</summary>
    <pre id="prompt">__PROMPT__</pre>
  </details>

  <div class="note">
    <p>Nothing you do on this page is tracked or sent anywhere. It's one static page.</p>
    <p>When you share writing with your AI, leave out passwords, card numbers, and other people's private messages.</p>
  </div>

  <footer>
    <p>Use it, change it, share it. If you repost the prompt, credit <em>If I Could, Would You?</em> by Steven Ammer.</p>
  </footer>
</main>
<script>
(function(){
  var btn=document.getElementById('copy'), st=document.getElementById('status'), pre=document.getElementById('prompt');
  function done(ok){ st.textContent = ok ? 'Copied. Paste it into your AI as your first message.' : 'Your browser blocked copying. Open "Read all" below, select the text, and copy it.'; }
  btn.addEventListener('click', function(){
    var text = pre.textContent;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function(){done(true)}, function(){fallback(text)});
    } else { fallback(text); }
  });
  function fallback(text){
    try {
      var ta=document.createElement('textarea'); ta.value=text; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select(); var ok=document.execCommand('copy'); document.body.removeChild(ta); done(ok);
    } catch(e){ done(false); }
  }
})();
</script>
</body>
</html>
"""
page = page.replace("__PROMPT__", html.escape(prompt)).replace("__WORDS__", f"{words:,}")

open(os.path.join(SITE, "index.html"), "w", encoding="utf-8").write(page)
print("wrote index.html", len(page), "bytes;", words, "words")
