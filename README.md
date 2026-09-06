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
  Battleboarding). Add more with **+ Tambah kategori**. Each category holds a
  job list; every job has a description, an IDR price, a scheduled date/time,
  and its own photo log. Checking a job off stamps the time it was done.
- **Schedule** — every scheduled job across all categories, soonest first,
  overdue flagged. Click one to jump to it.
- **History / Services** — the company story and the service descriptions.
- Persona 5 screen-wipe (Joker GIF) on every tab change.
- "Processing to Meta-Listing" GIF screen on launch.
- Looping background music with a remembered mute toggle (top-right).

## Data & storage

Everything is one record in **IndexedDB** (`bbe` database → `kv` store →
`state` key): `categories`, `jobsByCat`, `imagesByJob`. Photos are downscaled
to ~1000 px JPEG and stored as data URLs.

It is **local to each install / browser** — no sync between devices, and
clearing the app's storage resets it to the four starter categories. There is
no export button yet (a small addition if you want it).

## Editing the code

All logic is the single `<script>` at the bottom of `www/index.html` — plain
ES5, no framework, no build step:

- `DATA` — every create/update/delete; each ends with `renderAll()` then `save()`.
- `save()` / `idbGet()` / `idbSet()` — the IndexedDB layer (debounced 250 ms).
- `seedServices()` — first-run categories.
- `render*` — rebuild the DOM from `state`.
- `playTransition()` — the P5 wipe.

After editing `www/`:

- **Browser** — re-inline into `battleboarding-standalone.html`, or just serve `www/` locally.
- **Windows** — copy `www/` into the bundle's `resources/app/www/`.
- **Android** — `npx cap sync`, then rebuild (`SETUP-ANDROID.md`).

## License

MIT — see `LICENSE`.
