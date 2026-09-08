/*
 * build-standalone.js
 *
 * Inlines every local asset that www/index.html references (fonts.css, the
 * bundled KaTeX CSS/JS, the images and audio under www/assets/) into one
 * self-contained file: dist/battleboarding-standalone.html
 *
 * If a local Electron bundle exists at windows-app/BattleboardingEntry/, its
 * copy of www/ is refreshed in the same run so the desktop build stays current.
 *
 * Usage:  node scripts/build-standalone.js       (or: npm run build)
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const WWW = path.join(ROOT, "www");
const DIST = path.join(ROOT, "dist");

const MIME = {
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf",
  ".webp": "image/webp", ".gif": "image/gif", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
};

function dataUriAbs(p) {
  const buf = fs.readFileSync(p);
  const mime = MIME[path.extname(p).toLowerCase()] || "application/octet-stream";
  return `data:${mime};base64,${buf.toString("base64")}`;
}
const dataUri = (rel) => dataUriAbs(path.join(WWW, rel));

let html = fs.readFileSync(path.join(WWW, "index.html"), "utf8");

// Replacements are passed as functions so a `$` in library source is not
// treated as a String.prototype.replace substitution pattern.

// 1. fonts.css  ->  inline <style>, its url() targets inlined as data URIs
let fontsCss = fs.readFileSync(path.join(WWW, "fonts.css"), "utf8");
fontsCss = fontsCss.replace(
  /url\(\s*(['"]?)([^'")]+)\1\s*\)/g,
  (m, q, url) => (/^(data:|https?:)/i.test(url) ? m : `url(${dataUri(url)})`)
);
html = html.replace(
  /<link rel="stylesheet" href="fonts\.css">/,
  () => `<style>\n${fontsCss}\n</style>`
);

// 2. KaTeX CSS  ->  inline <style>, font url() targets relative to vendor/katex/
let kcss = fs.readFileSync(path.join(WWW, "vendor/katex/katex.min.css"), "utf8");
kcss = kcss.replace(
  /url\(\s*(['"]?)(fonts\/[^'")]+)\1\s*\)/g,
  (m, q, url) => `url(${dataUriAbs(path.join(WWW, "vendor/katex", url))})`
);
html = html.replace(
  /<link rel="stylesheet" href="vendor\/katex\/katex\.min\.css">/,
  () => `<style>\n${kcss}\n</style>`
);

// 3. KaTeX JS  ->  inline <script>
const kjs = fs.readFileSync(path.join(WWW, "vendor/katex/katex.min.js"), "utf8");
html = html.replace(
  /<script src="vendor\/katex\/katex\.min\.js"><\/script>/,
  () => `<script>\n${kjs}\n</script>`
);

// 4. assets/*  ->  data URIs
html = html.replace(
  /(["'(])\s*assets\/([A-Za-z0-9_.\-]+)\s*(["')])/g,
  (m, a, file, b) => {
    try { return `${a}${dataUri("assets/" + file)}${b}`; }
    catch (e) { console.warn("skip", file); return m; }
  }
);

fs.mkdirSync(DIST, { recursive: true });
const out = path.join(DIST, "battleboarding-standalone.html");
fs.writeFileSync(out, html);
console.log("wrote", path.relative(ROOT, out), (Buffer.byteLength(html) / 1048576).toFixed(2), "MB");

// Refresh the local Electron bundle's www/ if it is present (git-ignored output)
const bundleWww = path.join(ROOT, "windows-app/BattleboardingEntry/resources/app/www");
if (fs.existsSync(bundleWww)) {
  const copyTree = (src, dst) => {
    fs.mkdirSync(dst, { recursive: true });
    for (const e of fs.readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, e.name), d = path.join(dst, e.name);
      if (e.isDirectory()) copyTree(s, d);
      else fs.copyFileSync(s, d);
    }
  };
  for (const f of ["index.html", "fonts.css"]) {
    fs.copyFileSync(path.join(WWW, f), path.join(bundleWww, f));
  }
  for (const dir of ["assets", "fonts", "vendor"]) {
    if (fs.existsSync(path.join(WWW, dir))) {
      copyTree(path.join(WWW, dir), path.join(bundleWww, dir));
    }
  }
  fs.writeFileSync(path.join(ROOT, "windows-app/BattleboardingEntry.html"), html);
  console.log("refreshed Electron bundle www/");
}
