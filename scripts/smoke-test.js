/*
 * smoke-test.js
 *
 * Headless regression test for www/index.html. Boots the app in jsdom with
 * shims for IndexedDB, media, canvas and KaTeX, then walks every tab and
 * exercises jobs, the job detail, rebuttals, the Respect Thread and
 * Calculation builders, the scientific calculator, the music picker, the
 * language toggle and the section transitions.
 *
 * Usage:  node scripts/smoke-test.js       (or: npm test)
 * Requires the "jsdom" dev dependency:  npm install
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "www", "index.html"), "utf8");

let JSDOM;
try { ({ JSDOM } = require("jsdom")); }
catch (e) {
  console.error("Cannot load jsdom. Run `npm install` first.");
  process.exit(1);
}

const dom = new JSDOM(html, {
  runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.org/",
  beforeParse(window) {
    window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
    // report reduced-motion so view transitions resolve synchronously in the test
    window.matchMedia = (q) => ({ matches: /reduce/.test(q || ""), addEventListener() {}, removeEventListener() {} });
    const store = new Map();
    function req(fn) { const r = { onsuccess: null, onerror: null, onupgradeneeded: null, result: undefined };
      setTimeout(() => { try { r.result = fn ? fn() : undefined; r.onsuccess && r.onsuccess({ target: r }); } catch (e) { r.onerror && r.onerror({ target: r }); } }, 0); return r; }
    window.indexedDB = { open: () => { const r = req(() => ({ createObjectStore() {}, transaction: () => {
      const tx = { objectStore: () => ({ get: (k) => req(() => store.get(k)), put: (v, k) => { store.set(k, v); return req(); } }), oncomplete: null, onerror: null };
      setTimeout(() => tx.oncomplete && tx.oncomplete(), 3); return tx; } }));
      setTimeout(() => { r.onupgradeneeded && r.onupgradeneeded({ target: r }); }, 0); return r; } };
    window.HTMLMediaElement.prototype.play = () => Promise.resolve();
    window.HTMLMediaElement.prototype.pause = function () { this.paused = true; };
    window.HTMLMediaElement.prototype.load = () => {};
    window.HTMLCanvasElement.prototype.getContext = () => ({ fillRect() {}, drawImage() {}, fillStyle: "" });
    window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/jpeg;base64,AA";
    window.URL.createObjectURL = () => "blob:x";
    window.URL.revokeObjectURL = () => {};
    // minimal KaTeX shim (real one is an external bundled script)
    window.katex = { renderToString: (tex, opts) => `<span class="katex" data-display="${!!(opts && opts.displayMode)}">${tex}</span>` };
  },
});
const { window } = dom, doc = window.document;
const errors = [];
window.addEventListener("error", (e) => errors.push("onerror: " + (e.error && e.error.stack || e.message)));
window.console.error = (...a) => errors.push("console.error: " + a.map(String).join(" "));
const tick = () => new Promise((r) => setTimeout(r, 40));
const settle = () => new Promise((r) => setTimeout(r, 900));

(async () => {
  await settle();
  const $ = (s) => doc.querySelector(s), $$ = (s) => [...doc.querySelectorAll(s)];
  const click = (el) => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  const blur = (el) => el.dispatchEvent(new window.Event("blur", { bubbles: true }));
  const submit = (el) => el.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  const checks = [];
  const ok = (n, c) => checks.push([n, !!c]);
  window.confirm = () => true; window.prompt = () => "Temp Verse";

  ok("4 categories seeded", $$("#catList .cat").length === 4);
  ok("Respect Thread shows lock pill", /🔒 inti/.test($("#panel .panel-head").textContent));
  ok("locked cat: no delete button", $('#panel [data-act="del-cat"]') == null);
  ok("no Add category button", $("#addCatBtn") == null && !/Tambah kategori|Add category/i.test($(".rail").textContent));

  // Respect Thread job
  click($$("#catList .cat").find((c) => /RESPECT THREAD/i.test(c.textContent)));
  await settle();
  $("#jobInput").value = "Ishmael"; submit($("#jobForm")); await tick();
  click($$("#panel .job-main").find((r) => /ISHMAEL/i.test(r.textContent)));
  await tick(); await tick();

  ok("RT section present", $("#panel .rt-section") != null);
  ok("RT job: no Rebuttals section", $('#panel [data-act="add-reb"]') == null && !/>Rebuttals</.test($("#panel").innerHTML));
  ok("RT job: no Embed section", $('#panel [data-embedform]') == null);
  ok("RT job: Notes section kept", $("#panel .argdoc-editor") != null);
  ok("RT job: Photos section kept", $("#panel .dropzone") != null);

  // Full Feats section sits directly below Tags
  ok("has Full Feats section", $('#panel [data-ff-form]') != null);
  {
    const flds = $$("#panel .job-detail > .fld");
    const tagI = flds.findIndex((f) => /fiksi . verse/.test(f.textContent));
    const ffI = flds.findIndex((f) => /Full Feats/.test(f.textContent));
    ok("Full Feats is directly below Tags", tagI !== -1 && ffI === tagI + 1);
  }
  const ffForm0 = $("#panel [data-ff-form]");
  ffForm0.querySelector("input").value = "https://i.imgur.com/fullfeats.png";
  submit(ffForm0); await tick(); await tick();
  ok("Full Feats link added as a card", $("#panel [data-ff-form]").closest(".fld").querySelector(".embed-card img") != null);
  const ffcap = $("#panel [data-ff-cap]");
  ok("Full Feats caption editable", ffcap && ffcap.tagName === "INPUT");
  ffcap.value = "RT lengkap"; blur(ffcap); await tick();
  const irow = () => $$("#panel .job-main").find((r) => /ISHMAEL/i.test(r.textContent));
  click(irow()); await tick(); click(irow()); await tick(); await tick();
  ok("Full Feats persisted", $("#panel [data-ff-cap]") && $("#panel [data-ff-cap]").value === "RT lengkap");
  click($('#panel [data-act="del-full-feat"]')); await tick(); await tick();
  ok("Full Feats deleted", $("#panel [data-ff-form]").closest(".fld").querySelector(".embed-card") == null);

  const subs = $$("#panel .rt-section .rt-sub").map((e) => e.textContent);
  ok("5-part format labels", ["Introduction","Terminology","Feats and Abilities","Statistics","Intelligence and In-Char"].every((s) => subs.includes(s)));
  ok("intro + inChar textareas", $('#panel [data-rt-text="intro"]') != null && $('#panel [data-rt-text="inChar"]') != null);
  ok("3 add-list buttons", $$('#panel [data-act="add-rt"]').length === 3);
  ok("add buttons carry data-list", $$('#panel [data-act="add-rt"]').map((b) => b.getAttribute("data-list")).sort().join(",") === "feats,stats,terminology");
  ok("export button present", $('#panel [data-act="rt-export"]') != null);

  // fill it
  const intro = $('#panel [data-rt-text="intro"]');
  intro.value = "Ishmael adalah Watcher berdimensi tinggi.\n\nMuncul di Chapter 16."; blur(intro); await tick();
  const inchar = $('#panel [data-rt-text="inChar"]');
  inchar.value = "Sangat cerdas, manipulatif, cenderung menahan diri."; blur(inchar); await tick();

  // add a terminology item
  const termBtn = $$('#panel [data-act="add-rt"]').find((b) => b.getAttribute("data-list") === "terminology");
  click(termBtn); await tick(); await tick();
  const termCard = $('#panel .rt-entry[data-rt-list="terminology"]');
  ok("terminology card added", termCard != null);
  const tf = termCard.querySelector('[data-rt-field="term"]');
  tf.value = "Punishing Virus"; blur(tf);
  const df = termCard.querySelector('[data-rt-field="definition"]');
  df.value = "Patogen sibernetik berdimensi tinggi."; blur(df); await tick();
  const tevForm = termCard.querySelector(".rt-ev-add");
  tevForm.querySelector("input").value = "https://i.imgur.com/xyz.png"; submit(tevForm); await tick(); await tick();
  ok("terminology evidence image added", $('#panel .rt-entry[data-rt-list="terminology"] .rt-ev img') != null);

  // add a feat
  const featBtn = $$('#panel [data-act="add-rt"]').find((b) => b.getAttribute("data-list") === "feats");
  click(featBtn); await tick(); await tick();
  const featCard = $('#panel .rt-entry[data-rt-list="feats"]');
  ok("feat card has name+tier+explanation", featCard.querySelector('[data-rt-field="name"]') && featCard.querySelector('[data-rt-field="tier"]') && featCard.querySelector('[data-rt-field="explanation"]'));
  const nf = featCard.querySelector('[data-rt-field="name"]');
  nf.value = "Higher-Dimensional Manipulation"; blur(nf); await tick();

  // add a stat (no evidence form)
  const statBtn = $$('#panel [data-act="add-rt"]').find((b) => b.getAttribute("data-list") === "stats");
  click(statBtn); await tick(); await tick();
  const statCard = $('#panel .rt-entry[data-rt-list="stats"]');
  ok("stat card has label+value+note, no evidence", statCard.querySelector('[data-rt-field="label"]') && statCard.querySelector('[data-rt-field="value"]') && statCard.querySelector('[data-rt-field="note"]') && statCard.querySelector(".rt-ev-add") == null);
  const sl = statCard.querySelector('[data-rt-field="label"]'); sl.value = "Attack Potency"; blur(sl);
  const sv = statCard.querySelector('[data-rt-field="value"]'); sv.value = "Multiversal+"; blur(sv); await tick();

  // export builds a doc with all 5 headings
  let exportedHtml = null;
  const RealBlob = window.Blob;
  window.Blob = function (parts) { exportedHtml = String(parts[0]); return new RealBlob(parts, { type: "text/html" }); };
  window.HTMLAnchorElement.prototype.click = function () {};
  click($('#panel [data-act="rt-export"]')); await tick(); await tick();
  ok("export doc has all 5 headings", exportedHtml &&
    ["Introduction","Terminology","Feats and Abilities","Statistics","Intelligence and In-Char"].every((h) => exportedHtml.includes("<h2>" + h + "</h2>")));
  ok("export doc has the term + feat + stat data", exportedHtml &&
    /Punishing Virus/.test(exportedHtml) && /Higher-Dimensional Manipulation/.test(exportedHtml) &&
    /Attack Potency/.test(exportedHtml) && /Multiversal\+/.test(exportedHtml) && /Watcher berdimensi tinggi/.test(exportedHtml));
  ok("export doc has a stats table", exportedHtml && /<table class="stats">/.test(exportedHtml));

  // persistence: collapse + re-expand
  const rrow = () => $$("#panel .job-main").find((r) => /ISHMAEL/i.test(r.textContent));
  click(rrow()); await tick(); click(rrow()); await tick(); await tick();
  ok("intro persisted", /Watcher berdimensi tinggi/.test($('#panel [data-rt-text="intro"]').value));
  ok("inChar persisted", /manipulatif/.test($('#panel [data-rt-text="inChar"]').value));
  ok("feat name persisted", $('#panel .rt-entry[data-rt-list="feats"] [data-rt-field="name"]').value === "Higher-Dimensional Manipulation");
  ok("stat value persisted", $('#panel .rt-entry[data-rt-list="stats"] [data-rt-field="value"]').value === "Multiversal+");
  ok("terminology evidence persisted", $('#panel .rt-entry[data-rt-list="terminology"] .rt-ev img') != null);

  // delete a term item
  click($('#panel .rt-entry[data-rt-list="terminology"] [data-act="del-rt"]')); await tick(); await tick();
  ok("terminology item deleted", $('#panel .rt-entry[data-rt-list="terminology"]') == null);

  // Judgement job: no RT section, and Rebuttals + Embed hidden, Notes kept
  click($$("#catList .cat").find((c) => /JUDGEMENT/i.test(c.textContent))); await settle();
  $("#jobInput").value = "Match X"; submit($("#jobForm")); await tick();
  click($$("#panel .job-main").find((r) => /MATCH X/i.test(r.textContent))); await tick(); await tick();
  ok("Judgement job: no RT section", $("#panel .rt-section") == null);
  ok("Judgement job: Rebuttals hidden", $('#panel [data-act="add-reb"]') == null);
  ok("Judgement job: Embed hidden", $('#panel [data-embedform]') == null);
  ok("Judgement job: Notes kept", $("#panel .argdoc-editor") != null);

  // Joki job (not RT, not hidden): keeps Rebuttals + Embed
  click($$("#catList .cat").find((c) => /JOKI/i.test(c.textContent))); await settle();
  $("#jobInput").value = "Joki A"; submit($("#jobForm")); await tick();
  click($$("#panel .job-main").find((r) => /JOKI A/i.test(r.textContent))); await tick(); await tick();
  ok("Joki job: keeps Rebuttals", $('#panel [data-act="add-reb"]') != null);
  ok("Joki job: keeps Embed", $('#panel [data-embedform]') != null);
  ok("Joki job: no RT section", $("#panel .rt-section") == null);
  ok("Joki job: no Calc section", $("#panel .calc-section") == null);
  ok("Joki job: keeps Photos", $("#panel .dropzone") != null);

  // embed caption is an editable input, and persists (on Joki, which keeps the global embed section)
  const ef = $("#panel [data-embedform]");
  ef.querySelector(".embed-url").value = "https://i.imgur.com/cap.png";
  submit(ef); await tick(); await tick();
  const capIn = $("#panel [data-embed-cap]");
  ok("embed caption is an editable input", capIn && capIn.tagName === "INPUT");
  capIn.value = "Panel bukti scaling"; blur(capIn); await tick();
  const jrow = () => $$("#panel .job-main").find((r) => /JOKI A/i.test(r.textContent));
  click(jrow()); await tick(); click(jrow()); await tick(); await tick();
  ok("embed caption persisted", $("#panel [data-embed-cap]") && $("#panel [data-embed-cap]").value === "Panel bukti scaling");

  // Calculation job: LaTeX section, Rebuttals + global Embed + Photos all hidden
  click($$("#catList .cat").find((c) => /CALCULATION/i.test(c.textContent))); await settle();
  $("#jobInput").value = "KE proyektil"; submit($("#jobForm")); await tick();
  click($$("#panel .job-main").find((r) => /KE PROYEKTIL/i.test(r.textContent))); await tick(); await tick();
  ok("Calc job: has Calc section", $("#panel .calc-section") != null);
  ok("Calc job: Rebuttals hidden", $('#panel [data-act="add-reb"]') == null);
  ok("Calc job: global Embed section hidden", $("#panel [data-embedform]") == null);
  ok("Calc job: Photos section removed", $("#panel .dropzone") == null && !/>Photos</.test($("#panel").innerHTML));

  click($('#panel [data-act="add-calc"]')); await tick(); await tick();
  const cb = $("#panel .calc-block");
  ok("calc block added w/ label+body+preview", cb && cb.querySelector('[data-calc-field="label"]') && cb.querySelector('[data-calc-field="body"]') && cb.querySelector("[data-calc-preview]"));
  const body = cb.querySelector('[data-calc-field="body"]');
  body.value = "Massa $m=5$, kecepatan $v=200$.\n$$E_k=\\tfrac12 m v^2$$";
  body.dispatchEvent(new window.Event("input", { bubbles: true }));
  await settle();
  ok("calc preview rendered math", /class="katex"/.test(cb.querySelector("[data-calc-preview]").innerHTML));
  ok("calc preview has display + inline math", (cb.querySelector("[data-calc-preview]").innerHTML.match(/class="katex"/g) || []).length >= 3);
  blur(body);
  const cl = cb.querySelector('[data-calc-field="label"]'); cl.value = "Energi kinetik"; blur(cl); await tick();

  // per-block Embed & scan eksternal, right inside the block
  const CB = () => $("#panel .calc-block");
  ok("calc block has its own embed form", CB().querySelector(".calc-ev-add") != null);
  ok("calc block embed form sits after the preview",
     (CB().querySelector(".calc-preview").compareDocumentPosition(CB().querySelector(".calc-ev")) & window.Node.DOCUMENT_POSITION_FOLLOWING) !== 0);
  const cev = CB().querySelector(".calc-ev-add");
  cev.querySelector("input").value = "https://i.imgur.com/feat.png";
  submit(cev); await tick(); await tick();
  ok("calc evidence image added under the block", CB().querySelector(".calc-ev .embed-card img") != null);
  const cevcap = CB().querySelector(".calc-ev [data-calc-ev-cap]");
  ok("calc evidence caption editable", cevcap && cevcap.tagName === "INPUT");
  cevcap.value = "Panel penghancuran"; blur(cevcap); await tick();

  // persist
  const crow = () => $$("#panel .job-main").find((r) => /KE PROYEKTIL/i.test(r.textContent));
  click(crow()); await tick(); click(crow()); await tick(); await tick();
  ok("calc label persisted", $('#panel .calc-block [data-calc-field="label"]').value === "Energi kinetik");
  ok("calc body persisted + re-rendered", /E_k/.test($('#panel .calc-block [data-calc-field="body"]').value) && /class="katex"/.test($("#panel .calc-preview").innerHTML));
  ok("calc evidence persisted", $("#panel .calc-block .calc-ev .embed-card img") != null);
  ok("calc evidence caption persisted", $("#panel .calc-block .calc-ev [data-calc-ev-cap]").value === "Panel penghancuran");
  click($('#panel .calc-block .calc-ev [data-act="del-calc-ev"]')); await tick(); await tick();
  ok("calc evidence deleted", $("#panel .calc-block .calc-ev .embed-card") == null);
  click($('#panel .calc-block [data-act="del-calc"]')); await tick(); await tick();
  ok("calc block deleted", $("#panel .calc-block") == null);

  // ---- scientific calculator ----
  ok("Calc panel has a Kalkulator button", $('#panel [data-act="calc-open"]') != null);
  click($('#panel [data-act="calc-open"]')); await tick(); await tick();
  ok("calculator modal opens", $("#calc").hidden === false && $("#calcExpr") != null);
  const cx = $("#calcExpr");
  cx.value = "0.5*80*200^2"; cx.dispatchEvent(new window.Event("input", { bubbles: true }));
  await tick();
  ok("live result shown", /1600000/.test($("#calcOut").textContent));
  // keypad: press a digit button
  const k7 = $$("#calc .calc-key").find((b) => b.textContent.trim() === "7");
  ok("keypad renders", k7 != null);
  // DEG/RAD toggle
  const degBtn = $("#calc .calc-deg");
  const before = degBtn.textContent;
  click(degBtn); await tick();
  ok("DEG/RAD toggles", $("#calc .calc-deg").textContent !== before);
  click($("#calc .calc-deg")); await tick(); // back to DEG
  // sin(30) in DEG
  cx.value = "sin(30)"; cx.dispatchEvent(new window.Event("input", { bubbles: true })); await tick();
  ok("sin(30) = 0.5 in DEG", /0\.5/.test($("#calcOut").textContent));
  // equals -> history
  cx.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true })); await tick(); await tick();
  ok("= pushes to history", $("#calc .calc-hrow") != null && /sin\(30\)/.test($("#calc .calc-hrow").textContent));
  // insert as LaTeX block (a calc job must be expanded)
  $("#calc [data-ck=\"@close\"]"); // no-op ref
  // re-add + expand a calc job first
  click($("#calc")); // backdrop close
  await tick();
  ok("backdrop closes calculator", $("#calc").hidden === true);

  $("#jobInput").value = "Insert test"; submit($("#jobForm")); await tick();
  click($$("#panel .job-main").find((r) => /INSERT TEST/i.test(r.textContent))); await tick(); await tick();
  click($('#panel [data-act="calc-open"]')); await tick(); await tick();
  ok("Sisipkan button present when a calc job is expanded", $('#calc [data-ck="@ins"]') != null);
  $("#calcExpr").value = "9.81*2"; $("#calcExpr").dispatchEvent(new window.Event("input", { bubbles: true })); await tick();
  click($('#calc [data-ck="@ins"]')); await tick(); await tick();
  ok("Sisipkan created a calc block with the result", $("#panel .calc-block [data-calc-field=\"body\"]") &&
     /19\.62/.test($("#panel .calc-block [data-calc-field=\"body\"]").value) &&
     /\$\$/.test($("#panel .calc-block [data-calc-field=\"body\"]").value));
  ok("calculator closed after insert", $("#calc").hidden === true);

  // Escape closes it
  click($('#panel [data-act="calc-open"]')); await tick();
  doc.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await tick();
  ok("Escape closes calculator", $("#calc").hidden === true);

  // non-calc category has no Kalkulator button
  click($$("#catList .cat").find((c) => /JOKI/i.test(c.textContent))); await settle();
  ok("Joki panel: no Kalkulator button", $('#panel [data-act="calc-open"]') == null);

  // ---- music theme picker (Persona 5 decision style) ----
  const sb = $("#soundBtn");
  ok("music menu starts hidden", $("#musicMenu").hidden === true);
  click(sb); await tick();
  const mmOpts = $$("#musicMenu .mm-opt");
  ok("menu opens with 3 options", $("#musicMenu").hidden === false && mmOpts.length === 3);
  ok("default (Aksi) is marked on", mmOpts.find((o) => o.getAttribute("data-track") === "life-will-change").classList.contains("on"));
  ok("button icon reflects action theme", /🔥/.test(sb.querySelector(".ico").textContent));
  // pick calm
  click(mmOpts.find((o) => o.getAttribute("data-track") === "no-more-what-ifs")); await tick();
  ok("menu closes after choosing", $("#musicMenu").hidden === true);
  ok("calm theme stored", (() => { try { return window.localStorage.getItem("bbe-music") === "no-more-what-ifs"; } catch (e) { return false; } })());
  ok("button icon now calm (moon)", /🌙/.test(sb.querySelector(".ico").textContent));
  ok("audio src points at calm track", /no-more-what-ifs\.mp3/.test($("#bgm").src));
  // reopen -> calm marked on
  click(sb); await tick();
  ok("calm now marked on in menu", $$("#musicMenu .mm-opt").find((o) => o.getAttribute("data-track") === "no-more-what-ifs").classList.contains("on"));
  // turn off
  click($("#musicMenu .mm-off")); await tick();
  ok("off stored + icon muted", (() => { try { return window.localStorage.getItem("bbe-music") === "off"; } catch (e) { return false; } })() && /🔇/.test(sb.querySelector(".ico").textContent));
  ok("bgm paused when off", $("#bgm").paused !== false);
  // click outside closes menu
  click(sb); await tick();
  ok("menu reopened", $("#musicMenu").hidden === false);
  click(doc.body); await tick();
  ok("clicking outside closes menu", $("#musicMenu").hidden === true);

  // ---- language toggle ----
  const lb = $("#langBtn");
  ok("lang button exists, shows ID by default", lb != null && lb.textContent.trim() === "ID");
  ok("default UI is Indonesian", /Papan/.test($('.view-switch button[data-view="board"]').textContent) && /Kategori/.test($(".rail h2").textContent));
  ok("tagline populated (id)", /tersimpan di perangkat/.test($(".tagline").textContent));
  ok("history prose populated", $("[data-i18n-html]") && /2021/.test($("[data-i18n-html]").textContent));
  click(lb); await tick(); await tick();
  ok("switched to EN", lb.textContent.trim() === "EN" && $('html').getAttribute("lang") === "en");
  ok("tabs now English", /Board/.test($('.view-switch button[data-view="board"]').textContent) && /Categories/.test($(".rail h2").textContent));
  ok("tagline now English", /stored on this device/.test($(".tagline").textContent));
  ok("lang persisted", (() => { try { return window.localStorage.getItem("bbe-lang") === "en"; } catch (e) { return false; } })());
  // job detail re-renders in EN
  click($$("#catList .cat").find((c) => /JOKI/i.test(c.textContent))); await settle();
  $("#jobInput").value = "lang test"; submit($("#jobForm")); await tick();
  click($$("#panel .job-main").find((r) => /LANG TEST/i.test(r.textContent))); await tick(); await tick();
  ok("detail labels English", /Description/.test($("#panel .job-detail").textContent) && /Rebuttals/.test($("#panel .job-detail").textContent));
  ok("panel Add job button English", /Add job/.test($("#jobForm button").textContent));
  ok("status options English", /Not Started/.test($('#panel [data-jf="status"]').textContent));
  // music menu labels follow language
  click($("#soundBtn")); await tick();
  ok("music menu in English", /Action Theme|Calm Theme|Turn off/.test($("#musicMenu").textContent));
  click($("#soundBtn")); await tick();
  // switch back to ID
  click(lb); await tick(); await tick();
  ok("back to ID", lb.textContent.trim() === "ID" && /Papan/.test($('.view-switch button[data-view="board"]').textContent));

  // ---- Persona 5 pause-menu section transition + per-destination motifs ----
  ok("wipe overlay has P5 layers", ["w-fill","w-red","w-blk","w-stripe","w-star","w-mo","w-word","w-flash"]
     .every((c) => $("#wipe ." + c) != null));
  ok("wipe word span present", $("#wipeWord") != null);
  ok("all 11 motif svgs present", ["board","schedule","stats","workon","services","history","rt","joki","judge","calc","star"]
     .every((m) => $("#wipe .m-" + m) != null));
  {
    const goto = (v) => {
      const btn = $('.view-switch button[data-view="' + v + '"]');
      click(btn);
      return (btn.textContent || "").trim();
    };
    const lbl = goto("schedule"); await settle();
    ok("transition: schedule view shown", $("#scheduleWrap").hidden === false && $("#boardWrap").hidden === true);
    ok("transition: word stamped with section label", $("#wipeWord").textContent.trim() === lbl);
    ok("transition: overlay not left visible", $("#wipe").hidden === true);
    ok("transition: motif attr set to schedule", $("#wipe").getAttribute("data-motif") === "schedule");
    goto("stats"); await settle();
    ok("transition: stats view shown", $("#statsWrap").hidden === false);
    goto("workon"); await settle();
    ok("transition: workon view shown", $("#workonWrap").hidden === false);
    goto("services"); await settle();
    ok("transition: services view shown", $("#servicesWrap").hidden === false);
    goto("history"); await settle();
    ok("transition: history view shown", $("#historyWrap").hidden === false);
    ok("backup section: save + load controls", $("#dataSave") != null && $("#dataFile") != null);
    ok("backup section: summary shows counts", /categor|kategori/i.test(($("#dataSummary") || {}).textContent || ""));
    { let threw = false; try { $("#dataSave").dispatchEvent(new window.MouseEvent("click", { bubbles: true })); } catch (e) { threw = true; } ok("backup: export does not throw", !threw); }
    await tick();
    goto("board"); await settle();
    ok("transition: back to board", $("#boardWrap").hidden === false);

    // category selection now transitions with a themed motif
    const pickCat = (re) => click($$("#catList .cat").find((c) => re.test(c.textContent)));
    pickCat(/CALCULATION/i); await settle();
    ok("category transition: calc motif", $("#wipe").getAttribute("data-motif") === "calc");
    pickCat(/JUDGEMENT/i); await settle();
    ok("category transition: judge motif", $("#wipe").getAttribute("data-motif") === "judge");
    pickCat(/JOKI/i); await settle();
    ok("category transition: joki motif", $("#wipe").getAttribute("data-motif") === "joki");
    pickCat(/RESPECT THREAD/i); await settle();
    ok("category transition: rt motif", $("#wipe").getAttribute("data-motif") === "rt");
    ok("category transition: word is the category name", /RESPECT THREAD/i.test($("#wipeWord").textContent));
  }

  console.log("\n=== RESULTS ===");
  let pass = 0, fail = 0;
  for (const [n, c] of checks) { console.log((c ? "  ok  " : " FAIL ") + n); c ? pass++ : fail++; }
  console.log(`\n${pass} passed, ${fail} failed`);
  if (errors.length) { console.log("\n=== ERRORS ==="); errors.forEach((e) => console.log(e)); }
  process.exit(fail || errors.length ? 1 : 0);
})();
