# Battleboarding Business Entry

A Persona 5–styled job / service tracker for **Battleboarding Business** — an
Indonesian community business doing debate-judging and argument services.

One vanilla-JS app (no framework, no build step) shipped three ways from the
same `www/` source. All data is stored **on the device** — no server, no
account, works fully offline.

> **Live demo:** https://ammarfirman.github.io/Battleboarding-Entry-Job/
> (GitHub Pages, deployed from `www/` by the included workflow).

**Stack:** HTML · CSS · ES5 · IndexedDB · Capacitor 8 (Android) · Electron 44
(Windows) · bundled web fonts (Anton / Barlow / IBM Plex Mono). No framework,
no build step, no runtime dependencies.

| Target | What | How to get it |
|---|---|---|
| **Browser** | one self-contained ~10 MB HTML file | double-click `battleboarding-standalone.html`, or open the live demo above |
| **Android** | installable APK, Android 7.0+ (debug-signed) | **[Releases](../../releases/latest)** → `BattleboardingEntry-debug.apk` · build: `SETUP-ANDROID.md` |
| **Windows** | Electron desktop app | **[Releases](../../releases/latest)** → `BattleboardingEntry-Windows-x64.zip` · build: `windows-app/README.md` |

---

## Folder layout

```
battleboarding/
├─ www/                          the app — shared by all three builds
│  ├─ index.html                 markup + styles + all the logic (one file)
│  ├─ fonts.css  fonts/*.woff2   bundled Anton / Barlow / IBM Plex Mono (offline)
│  └─ assets/                    joker-bg.webp, loading.gif, wipe-joker.gif, life-will-change.mp3
│
├─ battleboarding-standalone.html   everything inlined into one ~10 MB file
│
├─ windows-app/
│  ├─ electron/                  the Electron wrapper source (main.js + package.json)
│  └─ README.md                  how to reassemble the runnable bundle
│
├─ .github/workflows/pages.yml   deploys www/ to GitHub Pages
├─ capacitor.config.json  package.json   Android (Capacitor) config
└─ SETUP-ANDROID.md              how to build the APK
```

Not in git (all regenerated — see `.gitignore`): `node_modules/`, `android/`
(Capacitor output), `dist/` + `*.apk`, and `windows-app/BattleboardingEntry/`
(the ~375 MB Electron bundle).

---

## 1. Browser (no build)

Double-click **`battleboarding-standalone.html`** — runs offline in any modern
browser, saves data in that browser (IndexedDB).

To work on the source, serve `www/` so fonts + audio load:

```
cd www
python -m http.server 8000        # then open http://localhost:8000
```

## 2. Android APK

Full walkthrough in **`SETUP-ANDROID.md`**. Short version:

```
npm install
npx cap add android      # one time
npx cap sync
cd android && ./gradlew assembleDebug
# -> android/app/build/outputs/apk/debug/app-debug.apk
```

Needs Node.js + Android Studio's SDK + a **JDK 21** (Android Studio's bundled
JDK 25 is too new for Gradle 8.14 — see `SETUP-ANDROID.md`). Distribute the
`.apk` by attaching it to a **GitHub Release**.

## 3. Windows `.exe`

The Electron bundle is a build output and is not committed. Rebuild it from
`windows-app/electron/` + `www/` — steps in **`windows-app/README.md`**. Data
lives in `%APPDATA%\battleboarding-entry\`.

---

## Features

Tabs: **Board · Schedule · Stats · Work On · Services · History**, plus a
global **Ctrl/⌘ + K** search palette.

**Board** — the four service lines are the starting categories and are
**locked** (🔒, can't be deleted); add your own with **+ Tambah kategori**
(those stay deletable). Every job carries:

- **Lifecycle status** — `Not Started → Researching → Writing → Reviewing →
  Completed → Delivered`. The square button on the row cycles it; the detail
  has a direct picker. Completing a job stamps its completion date.
- **Priority** — Low / Medium / High / Urgent (High & Urgent show on the row).
- **Deadline** + **Customer** + **tags** (the fiction / verse it's about).
- **Rebuttals** — a structured list, not a text box: each entry is
  *Claim → Counter → Rebuttal* with a status (`Unanswered`, `In Progress`,
  `Resolved`, `Rejected`, `Needs Evidence`).
- **Notes** — a lightweight rich-text doc (bold, headings, lists, quote,
  links), autosaved.
- **Embeds** — paste an Imgur / Gyazo / direct-image / YouTube / Vimeo /
  Streamable link → renders inline (image, or click-to-play video).
- **Price + status** — `Penawaran` / `Terjual` / `Contoh (estimasi)`.
- a **photo log** (downscaled, stored on-device).

**Respect Thread jobs** get an extra structured **Respect Thread** section in
five parts — **Introduction · Terminology · Feats and Abilities · Statistics ·
Intelligence and In-Char**. Terminology and Feats entries take
name/tier/explanation + evidence links; Statistics is a label/value/note
table. An **Export to HTML** button writes a clean formatted document with
those five headings (evidence rendered as images, stats as a table).

**Schedule** — deadline buckets (🔴 Overdue · 🟠 Due soon · 🟡 Upcoming ·
🟢 Completed) plus a month **calendar** with per-day deadline dots.

**Stats** — Total / Active / Completed / Overdue jobs, customer count, total
revenue, average job value, average completion time; **Upcoming Deadlines**
list; and charts for jobs-by-status, jobs-by-priority, most-requested
fiction/verse, jobs completed per month, and revenue per month.

**Ctrl + K** — one search across the whole app: **Jobs**, **Rebuttals**,
**Arguments** (notes), **Customers**, **Tags**. Jobs/rebuttals jump to the
job; customers & tags filter the board.

**Work On** — a directory of where work comes from: Facebook / WhatsApp /
Discord / External Web, each with name + link + note.

Persona 5 screen-wipe on every tab change; "Processing to Meta-Listing" launch
screen; looping background music with a remembered mute toggle.

> Embeds load on GitHub Pages, the standalone file, and the Android/Windows
> apps. They do **not** load inside the claude.ai artifact preview (its CSP
> blocks third-party images/iframes).

## Data & storage

One record in **IndexedDB** (`bbe` → `kv` → `state`, schema **`v3`**):
`categories`, `jobsByCat` (each job: `status`, `priority`, `deadline`,
`createdAt`, `completedAt`, `customer`, `tags`, `rebuttals`, `argDoc`,
`embeds`, `price`, `priceKind`), `imagesByJob`, `workOn`. Photos are
downscaled to ~1000 px JPEG and stored as data URLs. A `v1` or `v2` record
migrates forward automatically on first load.

It is **local to each install / browser** — no sync between devices, and
clearing the app's storage resets it to the four starter categories (each
seeded with one worked example). There is no export button yet.

## Editing the code

All logic is the single `<script>` at the bottom of `www/index.html` — plain
ES5, no framework, no build step:

- `STATUSES` / `PRIORITIES` / `REB_STATUSES` — the lifecycle vocab (extend here).
- `DATA` — every create/update/delete; most end with `renderAll()` then `save()`.
- `save()` / `idbGet()` / `idbSet()` — the IndexedDB layer (debounced 250 ms).
- `seedServices()` — first-run categories + one example job each; `migrate()` — v1/v2 → v3.
- `render*` — `renderPanel` / `renderSchedule` / `renderStatsView` / `renderWorkOn` / `renderPalette` rebuild the DOM from `state`.
- `hbars()` / `vbars()` — the hand-drawn CSS charts.
- `classifyEmbed()` — URL → `{kind, embedUrl, thumbUrl}`; `cleanHtml()` — sanitises the Notes doc.
- `playTransition()` — the P5 wipe.

Regression check: `node` + `jsdom` smoke test lives outside the repo; it
seeds the app, walks every tab, and exercises status/rebuttal/palette/filter.

After editing `www/`:

- **Browser** — re-inline into `battleboarding-standalone.html`, or just serve `www/` locally.
- **Windows** — copy `www/` into the bundle's `resources/app/www/`.
- **Android** — `npx cap sync`, then rebuild (`SETUP-ANDROID.md`).

## License

MIT — see `LICENSE`.
