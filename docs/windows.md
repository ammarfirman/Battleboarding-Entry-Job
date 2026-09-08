# Windows desktop app

A ready to run desktop version. It is the same web app (`../www/`) wrapped in
**Electron** (a bundled Chromium plus the app), so every modern feature works
and data is saved on the PC.

## Run it

Open the `BattleboardingEntry` folder and double click:

```
BattleboardingEntry\BattleboardingEntry.exe
```

That is the whole program. No install, no setup. The first launch may take a
few seconds; after that the "Now loading" screen shows and you are in.

To put it on another PC, copy the entire `BattleboardingEntry` folder (all of
it; the `.exe` needs the DLLs and `resources/` next to it). You can zip the
folder to move it, then unzip and run.

For a Start menu or desktop shortcut, right click `BattleboardingEntry.exe`,
then Send to, then Desktop (create shortcut).

## Where the data lives

Everything you enter is stored under:

```
%APPDATA%\battleboarding-entry\
```

(paste that into the File Explorer address bar). It survives closing and
reopening the app and moving the folder. Deleting that folder resets the app
to the four starter categories.

Storage is local to this PC. It does not sync to your phone or other
machines.

## Also in the bundle

`BattleboardingEntry.html` is the same app as one self contained file. Double
click to open it in your normal browser instead of the Electron window. Its
data is stored by the browser, separately from the `.exe`.

## Notes and limits

- The folder is about 385 MB. That is the bundled Chromium engine. The app
  itself is tiny; a real desktop build has to ship a browser engine.
- The window uses Electron's default icon. Branding it means rebuilding with
  a `.ico` file (for example with `electron-builder`).
- Built on Electron 44. `resources/app/main.js` is the wrapper; it serves
  `www/` over an internal `app://local` origin so storage is stable.

## Rebuilding after you change the web app

Run `npm run build` from the repository root. When the bundle folder is
present, that script refreshes `BattleboardingEntry\resources\app\www\` for
you. Otherwise, replace those files by hand with your updated `../www/`.

## Building the bundle from scratch (it is not in git)

`BattleboardingEntry/` (about 385 MB) is a build output and is git ignored.
The only source in the repo is `../windows-app/` (`main.js` and
`package.json`), the wrapper that serves `www/` over `app://local`.

To reassemble a runnable folder:

1. Download Electron `v44.x` win-x64 (`electron-v44.*-win32-x64.zip`) from
   https://github.com/electron/electron/releases and unzip it to
   `windows-app/BattleboardingEntry/`.
2. Rename `electron.exe` to `BattleboardingEntry.exe`, and delete
   `resources/default_app.asar`.
3. Create `resources/app/`, copy `windows-app/main.js` and
   `windows-app/package.json` into it, and copy the whole `../www/`
   tree to `resources/app/www/`.
4. Double click `BattleboardingEntry.exe`.

For a proper installer with a custom icon, use `electron-builder` or
`electron-packager` (not set up here).
