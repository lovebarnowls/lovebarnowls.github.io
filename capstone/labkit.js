// labkit.js: shared runtime for the "under the hood" labs (W6L2 onwards).
// Put this file in the same folder as the lab pages. Each page calls Lab({...}).
(function(){
const CSS = `
:root{--bg:#121212;--pn:#1e1e1e;--pn2:#252526;--bd:#3a3a3a;--tx:#e0e0e0;--mut:#9a9a9a;--ac:#4EC9B0;--rd:#ce3c3c;--warn:#f0a500}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tx);font:14px/1.55 'Segoe UI',Tahoma,sans-serif}
header{background:#1f1f1f;border-bottom:2px solid var(--rd);padding:12px 18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
header h1{font-size:17px;margin:0}.bar{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.who{font-size:12px;color:var(--mut)}.who a{color:var(--ac);cursor:pointer;margin-left:6px}
main{display:grid;gap:14px;padding:14px;max-width:1300px;margin:0 auto}
section{background:var(--pn2);border:1px solid var(--bd);border-radius:8px;padding:14px}
section.brief{border-left:4px solid var(--ac)}section.stretch{border-left:4px solid var(--warn)}
h2{font-size:14px;color:var(--ac);margin:0 0 6px}section.stretch h2{color:var(--warn)}
p{margin:4px 0;max-width:80ch}.hint{font-size:12px;color:var(--mut)}
label{display:block;font-size:12px;color:var(--mut);margin:10px 0 3px}
input,textarea,select{width:100%;background:var(--pn);color:#d4d4d4;border:1px solid var(--bd);border-radius:4px;padding:7px 9px;font:13px Consolas,monospace}
input[type=checkbox]{width:auto;margin-right:8px}
input:focus,textarea:focus,select:focus,button:focus-visible{outline:2px solid var(--ac);outline-offset:1px}
textarea{resize:vertical;min-height:70px}
button{background:var(--rd);color:#fff;border:0;border-radius:4px;padding:8px 16px;font-weight:700;cursor:pointer}
button:hover{background:#e04a4a}button.go{background:var(--ac);color:#1e1e1e}button.alt{background:#444}button.alt:hover{background:#555}button.tab{background:#333;border-radius:4px 4px 0 0}button.tab.on{background:#1e1e1e;color:var(--ac)}
.split{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:900px){.split{grid-template-columns:1fr}}
#ed{width:100%;height:440px;white-space:pre;overflow:auto;tab-size:4;line-height:1.45;resize:vertical}
#ed[readonly]{background:#171717;color:#9aa;border-style:dashed}
iframe{width:100%;height:330px;border:1px solid var(--bd);border-radius:6px;background:#fff}
#log{background:#171717;border:1px solid var(--bd);border-radius:4px;padding:8px;height:200px;overflow:auto;font:12px Consolas,monospace;white-space:pre-wrap}
#log b{color:var(--ac)}#log .e{color:#f05050}#log .w{color:var(--warn)}
#py{font-size:12px;color:var(--warn);min-height:18px}
ul.chk{list-style:none;padding:0;margin:6px 0}ul.chk li{padding:3px 0}.ok{color:var(--ac)}.bad{color:#f05050}
.warnbox{border-left:4px solid var(--rd);background:#2a1515;border-color:#5a2a2a;color:#ffb4b4}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px}
#modal{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:10;display:flex;align-items:center;justify-content:center}
#modal.hidden{display:none}
.mbox,.lbox{background:var(--pn2);border:2px solid var(--ac);border-radius:12px;padding:28px 32px;max-width:440px;width:90%}
.mbox h2,.lbox h2{font-size:17px}.mbox p{color:#aaa;margin:6px 0 14px}.mbox button{width:100%;background:var(--ac);color:#1e1e1e}
#merr{color:#f05050;font-size:12px;min-height:16px;margin:8px 0}
#load{position:fixed;inset:0;background:rgba(18,18,18,.96);z-index:9;display:flex;align-items:center;justify-content:center}
.track{background:#171717;border:1px solid var(--bd);border-radius:6px;height:16px;overflow:hidden;margin:14px 0 6px}
#pbar{background:var(--ac);height:100%;width:0;transition:width .3s}#ppct{font-size:12px;color:var(--mut)}#pstat{margin:6px 0}
`;
const SKEL = `
<div id="modal"><div class="mbox"><h2>Welcome to the AI App Lab</h2>
<p>Enter your first name. It goes on your exported work so your teacher knows it is yours.</p>
<input id="minput" placeholder="Your first name"><div id="merr"></div><button id="mgo">Start</button></div></div>
<div id="load"><div class="lbox"><h2>Getting Python ready</h2>
<p class="hint">Python runs inside your browser, so it has to download first. This takes longer the first time and is much quicker after that.</p>
<div class="track"><div id="pbar"></div></div><div id="ppct">0%</div><div id="pstat">Starting…</div>
<div class="row"><button class="alt" id="hideload">Read the code while I wait</button><button class="go" id="retry" style="display:none">Try again</button></div></div></div>
<header><h1 id="h1"></h1><span class="who" id="who"></span>
<div class="bar"><select id="labsel" style="width:auto" aria-label="Choose a lab"></select><button class="alt" id="dlb">Download my files</button><button class="go" id="exb">Export my work</button></div></header>
<main>
<section class="warnbox" role="note"><b id="banner"></b></section>
<section class="brief"><h2 id="ltitle"></h2><div id="lbrief"></div></section>
<section class="split">
<div>
<div class="row" style="margin:0"><button class="tab on" id="t_py">app.py</button><button class="tab" id="t_html">index.html</button><span class="hint" id="fh"></span></div>
<textarea id="ed" spellcheck="false" aria-label="Code editor" wrap="off"></textarea>
<div class="row"><button class="go" id="upd">Update the app</button><button class="alt" id="rst">Reset this file</button><button class="alt" id="ldb"></button><span class="hint">Ctrl+Enter also updates the app. The Tab key types four spaces.</span></div>
</div>
<div><h2>The app, running</h2><div id="py"></div><iframe id="pv" title="The app"></iframe>
<h2 style="margin-top:10px">What happens under the hood</h2><div id="log" aria-live="polite"></div>
<p class="hint">Every request leaves a trail here. AI calls share the 45 second lock with your other apps.</p></div>
</section>
<section id="qs"></section>
<section id="cs"><div id="chk"></div><div id="ex"></div></section>
<section class="stretch"><h2>Stretch (optional)</h2><div id="lstretch"></div><label for="snote">Your stretch response (goes in your export)</label><textarea id="snote"></textarea></section>
</main>`;

window.Lab = function(C){
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store = {get:k => {try{return localStorage.getItem(k)}catch(e){return null}}, set:(k,v) => {try{localStorage.setItem(k,v)}catch(e){}}};
const pick = (s, re) => { const m = String(s).match(re); return m ? m[0].trim() : ""; };
const KEY = "aib-"+C.id, COOLDOWN = C.cooldown || 45, PYB = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
document.title = C.title;
const sty = document.createElement("style"); sty.textContent = CSS; document.head.appendChild(sty);
document.body.innerHTML = SKEL;
$("h1").textContent = C.id; $("banner").textContent = C.banner || "THIS IS FOR FUN. DO NOT USE THE ANSWERS FOR REAL, AS AIs CAN MAKE MISTAKES. USE MADE-UP OR EVERYDAY INPUTS ONLY.";

let who = store.get("aib-name") || "";
let S = {lab:Object.keys(C.labs)[0], file:"py", code:{}, st:{}, tk:{}, ans:{}, n:{}, stretch:{}};
try{ const s = JSON.parse(store.get(KEY)); if(s && s.lab && C.labs[s.lab]) S = s; }catch(e){}
["code","st","tk","ans","n","stretch"].forEach(k => S[k] = S[k] || {}); S.file = S.file || "py";
const save = () => store.set(KEY, JSON.stringify(S));
const L = () => C.labs[S.lab];
const code = () => L().locked ? {py:L().py, html:L().html} : (S.code[S.lab] = S.code[S.lab] || {py:L().py, html:L().html});
const stats = () => S.st[S.lab] = S.st[S.lab] || {ok:0, err:false, fixed:false};

// ── Name ──
function setName(){
  const v = $("minput").value.trim().replace(/[^A-Za-z\u00C0-\u024F' -]/g,"");
  if(v.length < 2){ $("merr").textContent = "Please enter your first name (at least 2 letters)."; return; }
  who = v; store.set("aib-name", who); $("modal").classList.add("hidden"); showWho();
}
function changeName(){ $("minput").value = who; $("modal").classList.remove("hidden"); }
function showWho(){ $("who").innerHTML = who ? esc(who)+" <a id=\"chg\">change</a>" : ""; if($("chg")) $("chg").onclick = changeName; }

// ── Log ──
let LOG = [];
function log(h, t, c){ LOG.push('<span class="'+(c || "")+'"><b>'+esc(h)+"</b>\n"+esc(t)+"</span>"); if(LOG.length > 60) LOG.shift(); $("log").innerHTML = LOG.join("\n\n"); $("log").scrollTop = 1e9; }
const tail = m => String(m).trim().split("\n").slice(-4).join("\n");

// ── Python ──
let pyo = null, pyErr = "", ready = null;
const setPy = t => $("py").textContent = t;
function prog(p, t){ $("pbar").style.width = p+"%"; $("ppct").textContent = Math.round(p)+"%"; $("pstat").textContent = t; setPy(t+" "+Math.round(p)+"%"); }
const addScript = src => new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => no(new Error("could not reach the Python download")); document.head.appendChild(s); });
async function prefetch(){
  const files = ["pyodide.asm.wasm","python_stdlib.zip","pyodide.asm.js","pyodide-lock.json"], got = files.map(() => 0), tot = files.map(() => 0);
  const upd = () => { const t = tot.reduce((a,b) => a+b, 0) || 12e6, l = got.reduce((a,b) => a+b, 0); prog(5 + 85*Math.min(l/t, 1), "Downloading Python…"); };
  await Promise.all(files.map(async (f,i) => {
    const r = await fetch(PYB+f); if(!r.ok) throw new Error("download failed"); tot[i] = +r.headers.get("content-length") || 0;
    const rd = r.body.getReader(); for(;;){ const x = await rd.read(); if(x.done) break; got[i] += x.value.length; upd(); }
  }));
}
function initPy(){
  ready = (async () => {
    prog(2, "Starting…"); await addScript(PYB+"pyodide.js");
    prog(5, "Downloading Python…"); try{ await prefetch(); }catch(e){}
    prog(92, "Starting Python…"); pyo = await loadPyodide({indexURL:PYB}); pyo.globals.set("ask_ai", askAI);
    prog(100, "Python is ready."); setTimeout(() => $("load").style.display = "none", 400);
  })().catch(e => {
    $("pstat").textContent = "Python did not load: "+e.message+". Check your internet connection, then press Try again. If it keeps failing, tell your teacher."; $("pbar").style.background = "#ce3c3c"; $("retry").style.display = ""; $("load").style.display = ""; setPy("Python did not load."); throw e;
  });
  return ready;
}
async function askAI(system, text){
  log("3. Python asks the AI", "Instructions:\n"+system+"\nInput: "+text);
  const left = Math.ceil(((+store.get("aib-lock") || 0) - Date.now())/1000);
  if(left > 0){ log("Locked", "The "+COOLDOWN+" second lock is on, so nothing was sent. Wait "+left+" seconds.", "w"); return "Please wait "+left+" seconds."; }
  store.set("aib-lock", String(Date.now() + COOLDOWN*1000));
  try{
    const r = await fetch(C.endpoint, {method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({messages:[{role:"system",content:system},{role:"user",content:text}], model:"llama-3.1-8b-instant", max_tokens:88, temperature:0.1})});
    if(!r.ok) throw new Error((await r.json()).error?.message || "Request failed");
    const t = ((await r.json()).choices[0].message.content || "").trim();
    log("4. The AI replies", t || "(blank answer)"); return t || "(blank answer, try again)";
  }catch(e){ log("Error", e.message, "e"); return "ERROR: "+e.message; }
}
const resp = o => new Response(JSON.stringify(o), {status:200, headers:{"Content-Type":"application/json"}});
const fail = m => resp({error:m, category:"ERROR", reason:m});
async function handle(url, opts){
  const name = String(url).split("/").pop().replace(/[^A-Za-z0-9_]/g, "");
  let data = {}; try{ data = JSON.parse(opts.body); }catch(e){}
  log("1. The page sends a request", "POST /"+name+"\n"+((opts && opts.body) || ""));
  if(!pyo) return fail("Python is still loading.");
  if(pyErr){ log("app.py has an error", pyErr, "e"); return fail("app.py has an error. Read the log."); }
  try{
    pyo.globals.set("_data", pyo.toPy(data)); log("2. Python runs "+name+"()", name+"(...)");
    const call = C.arg === "item" ? name+"(_data.get('item', ''))" : name+"(_data)";
    const out = await pyo.runPythonAsync("import json\njson.dumps(await "+call+")"), d = JSON.parse(out);
    log("5. Python sends the answer back to the page", out);
    if(!d.error && d.category !== "ERROR"){ const s = stats(); s.ok++; if(s.err) s.fixed = true; if(C.onResult) C.onResult(d, s); save(); renderChecks(); }
    return resp(d);
  }catch(e){ stats().err = true; save(); log("Python error", tail(e.message), "e"); return fail("Python error. Read the log."); }
}
async function applyApp(){
  try{ await ready; }catch(e){ return; }
  const c = code(); pyErr = ""; LOG = []; $("log").innerHTML = "";
  try{
    pyo.runPython("for _k in list(globals()):\n    if not _k.startswith('_') and _k != 'ask_ai':\n        del globals()[_k]");
    await pyo.runPythonAsync(c.py); log("Updated", "app.py loaded without errors.");
  }catch(e){ pyErr = tail(e.message); if(!L().locked){ stats().err = true; save(); } log("app.py has an error", pyErr, "e"); }
  const fr = $("pv");
  fr.onload = () => { const w = fr.contentWindow; w.fetch = handle; w.addEventListener("error", ev => { if(!L().locked){ stats().err = true; save(); } log("The page has a JavaScript error", ev.message, "e"); }); };
  fr.srcdoc = c.html; renderChecks();
}

// ── Editor ──
function loadEd(){
  const c = code(), l = L(); $("ed").value = c[S.file]; $("ed").readOnly = !!l.locked; $("upd").textContent = l.locked ? "Restart the app" : "Update the app";
  $("t_py").classList.toggle("on", S.file === "py"); $("t_html").classList.toggle("on", S.file === "html"); $("fh").textContent = l.locked ? "Locked in this lab." : "";
}
function showFile(f){ S.file = f; save(); loadEd(); }
$("t_py").onclick = () => showFile("py"); $("t_html").onclick = () => showFile("html");
$("rst").onclick = () => { if(confirm("Put this file back to the starting code?")){ code()[S.file] = L()[S.file]; save(); loadEd(); renderChecks(); } };
$("ldb").onclick = () => {
  const l = L().load; let s = null; try{ s = l.get(JSON.parse(store.get(l.key))); }catch(e){}
  if(!s){ $("fh").textContent = "Nothing saved in "+l.label.replace("Load my app from ","")+" on this browser. Use the starting code instead."; return; }
  if(confirm("Replace the code in both files with the one you saved before?")){ S.code[S.lab] = {py:s.py, html:s.html}; save(); loadEd(); renderChecks(); $("fh").textContent = "Loaded."; }
};
$("ed").addEventListener("keydown", e => {
  if(e.key === "Tab" && !e.target.readOnly){ e.preventDefault(); const t = e.target; t.setRangeText("    ", t.selectionStart, t.selectionEnd, "end"); t.dispatchEvent(new Event("input")); }
  if(e.key === "Enter" && e.ctrlKey){ e.preventDefault(); applyApp(); }
});
$("ed").addEventListener("input", e => { if(!L().locked){ code()[S.file] = e.target.value; save(); renderChecks(); } });
$("upd").onclick = applyApp;

// ── Questions, checks, notes ──
function renderChecks(){
  const l = L(), s = stats(), el = $("chk");
  if(!l.checks){ el.innerHTML = ""; return; }
  el.innerHTML = '<h2>Checklist</h2><ul class="chk">'+l.checks({c:code(), o:{py:l.py, html:l.html}, s, pick}).map(([t,ok]) => '<li><span class="'+(ok ? 'ok">&#10004;' : 'bad">&#10008;')+"</span> "+esc(t)+"</li>").join("")+"</ul>";
}
function renderQ(){
  const l = L(), a = S.ans[S.lab] = S.ans[S.lab] || []; $("qs").style.display = (l.qs && l.qs.length) ? "" : "none";
  $("qs").innerHTML = (l.qs || []).map((q,n) => '<label for="qa'+n+'">'+(n+1)+". "+esc(q)+'</label><textarea class="qa" id="qa'+n+'" data-n="'+n+'" style="min-height:56px"></textarea>').join("");
  (l.qs || []).forEach((q,n) => $("qa"+n).value = a[n] || "");
}
function renderEx(){
  const l = L(), tk = S.tk[S.lab] = S.tk[S.lab] || [];
  $("ex").innerHTML = (l.ticks || []).map((t,i) => '<label style="margin:8px 0;color:inherit;font-size:14px"><input type="checkbox" class="tk" data-i="'+i+'"'+(tk[i] ? " checked" : "")+">"+esc(t)+"</label>").join("")+
    (l.notes || []).map((t,i) => '<label for="nn'+i+'">'+esc(t)+'</label><textarea class="nt" id="nn'+i+'" data-k="'+S.lab+"_"+i+'"></textarea>').join("");
  (l.notes || []).forEach((t,i) => $("nn"+i).value = S.n[S.lab+"_"+i] || "");
  $("cs").style.display = (l.checks || (l.ticks || []).length || (l.notes || []).length) ? "" : "none";
}

// ── Render ──
function render(){
  const k = S.lab, l = L(); $("labsel").value = k; $("ltitle").textContent = l.t; $("lbrief").innerHTML = l.brief; $("lstretch").textContent = l.s || ""; $("snote").value = S.stretch[k] || "";
  $("dlb").style.display = l.locked ? "none" : ""; $("rst").style.display = l.locked ? "none" : ""; $("ldb").style.display = l.load ? "" : "none"; if(l.load) $("ldb").textContent = l.load.label;
  renderQ(); renderEx(); renderChecks(); loadEd(); applyApp();
}
$("labsel").innerHTML = Object.keys(C.labs).map(k => '<option value="'+k+'">'+esc(C.labs[k].t)+"</option>").join("");
$("labsel").onchange = e => { S.lab = e.target.value; save(); render(); };
document.addEventListener("input", e => {
  const t = e.target, c = t.classList;
  if(c.contains("qa")) (S.ans[S.lab] = S.ans[S.lab] || [])[+t.dataset.n] = t.value;
  else if(c.contains("nt")) S.n[t.dataset.k] = t.value;
  else if(c.contains("tk")) (S.tk[S.lab] = S.tk[S.lab] || [])[+t.dataset.i] = t.checked;
  else if(t.id === "snote") S.stretch[S.lab] = t.value;
  save();
});

// ── Files and export ──
function dl(name, text, type){ const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name; a.click(); URL.revokeObjectURL(a.href); }
$("dlb").onclick = () => { if(!who){ changeName(); return; } const c = code(), f = who.replace(/\s+/g,"-")+"-"+C.id; dl(f+"-app.py", c.py, "text/plain"); setTimeout(() => dl(f+"-index.html", c.html, "text/html"), 400); };
$("exb").onclick = () => {
  if(!who){ changeName(); return; }
  const pre = t => "<pre style='white-space:pre-wrap;font-family:Consolas,monospace;font-size:10pt'>"+esc(t)+"</pre>"; let b = "";
  for(const k in C.labs){
    const l = C.labs[k], a = S.ans[k] || [], c = S.code[k], note = i => S.n[k+"_"+i] || "";
    const has = a.some(x => x && x.trim()) || (l.notes || []).some((t,i) => note(i).trim()) || (c && (c.py !== l.py || c.html !== l.html)) || S.stretch[k];
    if(!has) continue;
    b += "<h2>"+esc(l.t)+"</h2>"+(l.qs || []).map((q,i) => "<p><b>"+(i+1)+". "+esc(q)+"</b></p><p>"+esc(a[i] || "")+"</p>").join("")+(l.notes || []).map((t,i) => "<p><b>"+esc(t)+"</b></p><p>"+esc(note(i))+"</p>").join("");
    if(c && !l.locked) b += "<p><b>My app.py</b></p>"+pre(c.py)+"<p><b>My index.html</b></p>"+pre(c.html)+"<p><b>Successful runs:</b> "+((S.st[k] || {}).ok || 0)+"</p>";
    if(S.stretch[k]) b += "<p><b>Stretch:</b> "+esc(l.s)+"</p><p>"+esc(S.stretch[k])+"</p>";
  }
  if(!b){ alert("Add some work first, so there is something to export."); return; }
  dl(who.replace(/\s+/g,"-")+"-"+C.id+".doc", "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><title>"+esc(who)+" "+C.id+"</title></head><body style='font-family:Calibri,sans-serif'><h1>"+esc(who)+": "+C.id+" work</h1><p><b>THIS IS FOR FUN. AIs CAN MAKE MISTAKES, SO DO NOT RELY ON ANY ANSWER FOR ANYTHING REAL.</b></p>"+b+"</body></html>", "application/msword");
};

// ── Start up ──
$("mgo").onclick = setName; $("minput").onkeydown = e => { if(e.key === "Enter") setName(); };
$("hideload").onclick = () => $("load").style.display = "none"; $("retry").onclick = () => location.reload();
showWho(); if(who) $("modal").classList.add("hidden");
initPy(); render();
};
})();
