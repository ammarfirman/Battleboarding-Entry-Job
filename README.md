# Battleboarding Business Entry

A Persona 5–styled job / service tracker for **Battleboarding Business** — an
Indonesian community business doing debate-judging and argument services.

One vanilla-JS app (no framework, no build step) shipped three ways from the
same `www/` source. All data is stored **on the device** — no server, no
account, works fully offline.

> **Live demo:** enable GitHub Pages (**Settings → Pages → Source: GitHub
> Actions**); the included workflow deploys `www/` and the URL lands here.

**Stack:** HTML · CSS · ES5 · IndexedDB · Capacitor 8 (Android) · Electron 44
(Windows) · bundled web fonts (Anton / Barlow / IBM Plex Mono).

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

- **Board** — the four service lines are the starting categories (Respect
  Thread, Joki Private Debate, Judgement Battleboarding, Calculation
  Battleboarding). Add more with **+ Tambah kategori**. Each job has:
  - a description and a **tag list** (the fiction / work it's about);
  - a **price + status** — `Penawaran` (quote), `Terjual` (sold), or
    `Contoh / estimasi` (worth-if-sold), rolled up in the header as
    *Terjual* vs *Est. nilai*;
  - a scheduled date/time; checking it off stamps the completion time;
  - an **Arguments doc** — a lightweight rich-text editor (bold, headings,
    lists, quote, links) that autosaves to the device;
  - **Embeds** — paste an Imgur / Gyazo / direct-image / YouTube / Vimeo /
    Streamable link and it renders inline (image, or click-to-play video);
  - a **photo log** (downscaled, stored on-device).
- **Search** — word-tokenized search across titles, descriptions, tags,
  argument text, embed links and Work On entries; results jump to the job.
- **Schedule** — every scheduled job, soonest first, overdue flagged.
- **History / Services** — company story; service descriptions with price ranges.
- **Work On** — a directory of where work comes from: **Facebook**,
  **WhatsApp**, **Discord**, **External Web**, each with name + link + note.
- Persona 5 screen-wipe (Joker GIF) on every tab change; "Processing to
  Meta-Listing" launch screen; looping background music with a remembered
  mute toggle.

> Embeds load on GitHub Pages, the standalone file, and the Android/Windows
> apps. They do **not** load inside the claude.ai artifact preview (its CSP
> blocks third-party images/iframes).

## Data & storage

Everything is one record in **IndexedDB** (`bbe` database → `kv` store →
`state` key, schema `v2`): `categories`, `jobsByCat` (jobs carry `tags`,
`argDoc`, `embeds`, `price`, `priceKind`), `imagesByJob`, `workOn`. Photos are
downscaled to ~1000 px JPEG and stored as data URLs. A `v1` record migrates
forward automatically on first load.

It is **local to each install / browser** — no sync between devices, and
clearing the app's storage resets it to the four starter categories (each
seeded with one worked example). There is no export button yet.

## Editing the code

All logic is the single `<script>` at the bottom of `www/index.html` — plain
ES5, no framework, no build step:

- `DATA` — every create/update/delete; most end with `renderAll()` then `save()`.
- `save()` / `idbGet()` / `idbSet()` — the IndexedDB layer (debounced 250 ms).
- `seedServices()` — first-run categories + one example job each; `migrate()` — v1 → v2.
- `render*` — `renderPanel` / `renderSchedule` / `renderSearch` / `renderWorkOn` rebuild the DOM from `state`.
- `classifyEmbed()` — URL → `{kind, embedUrl, thumbUrl}`; `cleanHtml()` — sanitises the Arguments doc.
- `playTransition()` — the P5 wipe.

After editing `www/`:

- **Browser** — re-inline into `battleboarding-standalone.html`, or just serve `www/` locally.
- **Windows** — copy `www/` into the bundle's `resources/app/www/`.
- **Android** — `npx cap sync`, then rebuild (`SETUP-ANDROID.md`).

## License

MIT — see `LICENSE`.
