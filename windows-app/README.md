# Battleboarding Entry — Windows app (.exe)

A ready-to-run desktop version. It's the same web app (`../www/`) wrapped in
**Electron** (a bundled Chromium + the app), so every modern feature works and
data is saved on the PC.

## Run it

Open the `BattleboardingEntry` folder and double-click:

```
BattleboardingEntry\BattleboardingEntry.exe
```

That's the whole program — no install, no setup. The first launch may take a
few seconds; after that the "Now loading" screen shows and you're in.

To put it on another PC: copy the entire **`BattleboardingEntry`** folder
(all of it — the `.exe` needs the DLLs and `resources/` next to it). You can
zip the folder to move it; unzip and run.

To make a Start-menu / desktop shortcut: right-click `BattleboardingEntry.exe`
→ *Send to* → *Desktop (create shortcut)*.

## Where the data lives

Everything you enter is stored by the app under:

```
%APPDATA%\battleboarding-entry\
```

(paste that into the File Explorer address bar). It survives closing and
reopening the app and moving the folder. Deleting that `%APPDATA%` folder
resets the app to the four starter service categories.

It is **local to this PC** — it does not sync to your phone or other machines.

## Also here

- **`BattleboardingEntry.html`** — the same app as a single self-contained
  file. Double-click to open it in your normal browser instead of the .exe
  window. (Its data is stored by the browser, separately from the .exe.)

## Notes / limits

- Folder size is ~375 MB — that's the bundled Chromium engine. The app itself
  is tiny; there's no way around shipping a browser engine for a real desktop
  build.
- The window uses Electron's default icon. To brand it you'd rebuild with a
  `.ico` (e.g. with `electron-packager` / `electron-builder` and a proper
  icon file) — ask if you want that set up.
- Built on Electron 44 (`resources/app/main.js` is the wrapper — it serves
  `www/` over an internal `app://local` origin so storage is stable).

## Rebuilding after you change the web app

Replace the contents of `BattleboardingEntry\resources\app\www\` with your
updated `../www/` files. Nothing to compile.

## Building the bundle from scratch (it is not in git)

`BattleboardingEntry/` (~375 MB) is a build output and is `.gitignore`d. The
only source that lives in the repo is **`electron/`** (`main.js` +
`package.json`) — the wrapper that serves `www/` over `app://local`.

To reassemble a runnable folder:

1. Download Electron `v44.x` win-x64 (`electron-v44.*-win32-x64.zip`) from
   https://github.com/electron/electron/releases and unzip it to
   `windows-app/BattleboardingEntry/`.
2. Rename `electron.exe` -> `BattleboardingEntry.exe`, delete
   `resources/default_app.asar`.
3. Create `resources/app/`, copy `electron/main.js` and `electron/package.json`
   into it, and copy the whole `../www/` tree to `resources/app/www/`.
4. Double-click `BattleboardingEntry.exe`.

(Or use `electron-builder` / `electron-packager` for a proper installer with a
custom icon — not set up here.)
