# Building the Android APK

This turns `www/` (the web app) into an installable Android app using
**Capacitor**. Data is stored **on the device** (IndexedDB) — no server, no
account, works fully offline.

> **Prebuilt APK:** attached to the latest **GitHub Release** (debug-signed,
> Android 7.0+) — download, copy to a phone, allow "install unknown apps".
> The steps below rebuild it from source.
>
> `.apk` files and `dist/` are git-ignored (build output); publish new builds
> as Release assets, not commits.

## What was needed on this machine (2026-09-06)

- Node.js 24, Capacitor 8.5.
- Android Studio's SDK (`platform 36`, `build-tools 36`) — already present.
- **A separate JDK 21.** Android Studio bundles JDK 25, and Gradle 8.14
  (what Capacitor 8 uses) can't run on JDK 25 — it fails with
  *"Unsupported class file major version 69"*. Fix: install any JDK 21
  (used here: Temurin 21, unzipped to `C:\Users\preyu\jdk-21-for-gradle\`)
  and point Gradle at it — see step 3.

---

## 1. Install the prerequisites (one time)

| Tool | Why | Link |
|---|---|---|
| **Node.js 18+** (LTS) | runs Capacitor's CLI | https://nodejs.org |
| **Android Studio** | builds the APK (brings the Android SDK, a JDK, and Gradle) | https://developer.android.com/studio |
| **Java JDK 21** | Gradle needs it; Android Studio's bundled JDK 25 does **not** work (see box above). Unzip any JDK 21 somewhere. | https://adoptium.net/temurin/releases/?version=21 |

After installing Android Studio, open it once and let it finish
"SDK components setup" (it downloads the Android SDK + platform tools).

---

## 2. Build the project

Open a terminal **in this folder** (`battleboarding`) and run:

```bash
npm install                 # downloads Capacitor
npx cap add android         # creates the native android/ project (one time)
npx cap sync                # copies www/ + config into android/
```

`npx cap add android` will ask you to confirm — say yes.

---

## 3. Point Gradle at JDK 21, then build

Edit **`android/gradle.properties`** and add (adjust the path to where you
unzipped JDK 21, forward slashes):

```
org.gradle.java.home=C:/Users/preyu/jdk-21-for-gradle/jdk-21.0.12.1+1
```

Then, from the `android/` folder:

```bash
cd android
./gradlew assembleDebug
```

First run downloads Gradle + dependencies — several minutes. Output:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Or in Android Studio:** `npx cap open android`, then
**Settings → Build, Execution, Deployment → Build Tools → Gradle →
Gradle JDK → add / select the JDK 21**. Wait for Gradle sync, then
**Build → Build App Bundle(s) / APK(s) → Build APK(s)**.

Copy the `.apk` to your phone and open it (allow "install unknown apps").

To run it straight onto a plugged-in phone instead: enable **USB debugging**
on the phone, then press the green **▶ Run** button in Android Studio.

---

## 4. After you change the web app

Edit files in `www/`, then:

```bash
npx cap sync
```

and rebuild the APK in Android Studio (step 3).

---

## Making a release (Play Store or a signed APK)

The `app-debug.apk` above is fine for personal use and sideloading. For a
signed release build:

1. In Android Studio: **Build → Generate Signed Bundle / APK**.
2. Choose **APK**, create a new keystore (keep the `.jks` file and passwords
   safe — you need the same one for every future update), pick **release**.
3. Output: `android/app/build/outputs/apk/release/app-release.apk`.

---

## App identity (optional polish)

- **Name / package id**: edit `capacitor.config.json` (`appName`, `appId`)
  *before* `npx cap add android`. `appId` (`com.battleboarding.entry`) is
  permanent once published.
- **Icon & splash**: put a 1024×1024 `icon.png` and `splash.png` in a
  `resources/` folder, then `npm i -D @capacitor/assets` and
  `npx capacitor-assets generate --android`. Or set them by hand in
  Android Studio (right-click `res` → New → Image Asset).
- The dark background (`#0B0B0C`) is already set so there's no white flash on
  launch; the in-app "Now loading" GIF screen covers the rest.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npx cap add android` fails: "capacitor.config not found" | run it from the `battleboarding` folder (where `capacitor.config.json` is) |
| Gradle sync fails: "SDK location not found" | open Android Studio → Settings → Languages & Frameworks → Android SDK, note the path; it usually self-heals after first sync |
| Build error about Java version | install JDK 17, then Android Studio → Settings → Build Tools → Gradle → Gradle JDK → select 17 |
| Music doesn't start | tap anywhere once — browsers/Webews block audio until the first tap (by design); the 🔊 button toggles it |
| Fonts look wrong | make sure `www/fonts/` and `www/fonts.css` were copied — `npx cap sync` handles this |
