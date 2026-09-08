# Building the Android APK

This turns `www/` into an installable Android app using **Capacitor**. Data
is stored on the device with IndexedDB. No server, no account, works fully
offline.

A prebuilt debug APK is attached to the latest GitHub release (Android 7.0
and newer). Download it, copy it to a phone, and allow "install unknown
apps". The steps below rebuild it from source. `.apk` files and release
binaries in `dist/` are git ignored; publish new builds as release assets,
not commits.

## What this machine needed (2026-09-06)

- Node.js 24, Capacitor 8.5.
- Android Studio's SDK (platform 36, build tools 36).
- **A separate JDK 21.** Android Studio bundles JDK 25, and Gradle 8.14 (what
  Capacitor 8 uses) cannot run on JDK 25; it fails with "Unsupported class
  file major version 69". The fix is to install any JDK 21 (Temurin 21 here,
  unzipped to `C:\Users\preyu\jdk-21-for-gradle\`) and point Gradle at it, as
  in step 3.

## 1. Install the prerequisites (one time)

| Tool | Why | Link |
|---|---|---|
| Node.js 18 or newer (LTS) | runs the Capacitor CLI | https://nodejs.org |
| Android Studio | builds the APK; brings the Android SDK, a JDK and Gradle | https://developer.android.com/studio |
| Java JDK 21 | Gradle needs it; the bundled JDK 25 does not work (see above). Unzip any JDK 21 somewhere. | https://adoptium.net/temurin/releases/?version=21 |

After installing Android Studio, open it once and let it finish "SDK
components setup", which downloads the Android SDK and platform tools.

## 2. Build the project

Open a terminal in the repository root and run:

```bash
npm install                 # downloads Capacitor
npx cap add android         # creates the native android/ project (one time)
npm run sync                # copies www/ and config into android/
```

`npx cap add android` asks you to confirm; say yes.

## 3. Point Gradle at JDK 21, then build

Edit `android/gradle.properties` and add this line, with the path to where
you unzipped JDK 21 and forward slashes:

```
org.gradle.java.home=C:/Users/preyu/jdk-21-for-gradle/jdk-21.0.12.1+1
```

Then, from the `android/` folder:

```bash
cd android
./gradlew assembleDebug
```

The first run downloads Gradle and dependencies and takes several minutes.
The output is:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

In Android Studio instead: run `npx cap open android`, then open
Settings, Build Execution Deployment, Build Tools, Gradle, and set Gradle JDK
to the JDK 21. Wait for the Gradle sync, then use Build, Build Bundles or
APKs, Build APKs.

Copy the `.apk` to a phone and open it (allow "install unknown apps"). To run
it straight onto a plugged in phone, enable USB debugging on the phone and
press Run in Android Studio.

## 4. After you change the web app

Edit files in `www/`, then:

```bash
npm run build     # refresh dist/battleboarding-standalone.html
npm run sync      # copy www/ into android/
```

and rebuild the APK (step 3).

## Making a signed release

The `app-debug.apk` is fine for personal use and sideloading. For a signed
release build:

1. In Android Studio, use Build, Generate Signed Bundle or APK.
2. Choose APK, create a new keystore (keep the `.jks` file and passwords
   safe; you need the same one for every future update), pick "release".
3. The output is `android/app/build/outputs/apk/release/app-release.apk`.

## App identity (optional polish)

- Name and package id: edit `capacitor.config.json` (`appName`, `appId`)
  before `npx cap add android`. The `appId` (`com.battleboarding.entry`) is
  permanent once published.
- Icon and splash: put a 1024 by 1024 `icon.png` and `splash.png` in a
  `resources/` folder, then `npm i -D @capacitor/assets` and
  `npx capacitor-assets generate --android`. Or set them by hand in Android
  Studio (right click `res`, New, Image Asset).
- The dark background (`#0B0B0C`) is already set so there is no white flash on
  launch; the in app "Now loading" screen covers the rest.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npx cap add android` fails with "capacitor.config not found" | run it from the repository root, where `capacitor.config.json` is |
| Gradle sync fails with "SDK location not found" | in Android Studio, open Settings, Languages and Frameworks, Android SDK, note the path; it usually self heals after the first sync |
| Build error about the Java version | point Gradle JDK at your JDK 21 (step 3) |
| Music does not start | tap anywhere once; browsers and WebViews block audio until the first tap, by design. The corner button toggles it. |
| Fonts look wrong | make sure `www/fonts/` and `www/fonts.css` were copied; `npm run sync` handles this |
