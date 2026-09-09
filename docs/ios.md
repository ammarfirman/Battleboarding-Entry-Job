# Building the iOS app

This turns `www/` into an iOS app using **Capacitor** - the same wrapper the
Android build uses. Data is stored on the device with IndexedDB. No server, no
account, works fully offline.

The native project already exists at `ios/` (created with `npx cap add ios`).
It uses Swift Package Manager, so there is **no CocoaPods step**.

## The hard requirement: a Mac

Apple's toolchain (Xcode) runs on **macOS only**. There is no way to compile,
archive, or sign an iOS app on Windows or Linux. Your options:

| Route | Needs | Result |
|---|---|---|
| A Mac with Xcode | macOS 14+, Xcode 16+ | Full local build, run on Simulator or a plugged-in iPhone |
| GitHub Actions (`.github/workflows/ios.yml`) | nothing - runs on a hosted Mac | An **unsigned** `.ipa`: Simulator-only unless you add signing secrets |
| Cloud Mac (Codemagic, Ionic Appflow, MacStadium) | an account | Configurable, can produce signed builds |

Installing on a real iPhone also needs an Apple ID:

- **Free Apple ID** - Xcode signs the app for a 7-day install on your own
  device (repeat every 7 days). Fine for personal use.
- **Apple Developer Program ($99/year)** - TestFlight (up to 100 testers,
  90-day builds) or the App Store.

## Build on a Mac

```bash
npm install
npm run build          # refresh the web bundle
npx cap sync ios       # copy www/ + config into ios/
npx cap open ios       # opens ios/App in Xcode
```

In Xcode:

1. Select the **App** target, **Signing & Capabilities** tab.
2. Set **Team** to your Apple ID (add it under Xcode > Settings > Accounts).
3. Change the **Bundle Identifier** if `com.battleboarding.entry` is taken
   (it must be globally unique on Apple's side).
4. Pick a device or Simulator in the toolbar and press **Run** (Cmd+R).

For a release archive: **Product > Archive**, then distribute via the
Organizer window (TestFlight, App Store, or Ad Hoc).

## Build in GitHub Actions (no Mac)

`.github/workflows/ios.yml` builds on a hosted macOS runner. Trigger it from
the **Actions** tab > **Build iOS app** > **Run workflow**.

As written it produces an **unsigned** `.ipa` artifact. That runs on the iOS
Simulator and can be resigned (e.g. with [AltStore](https://altstore.io) or
`fastlane`), but it will not install directly on an iPhone.

To make CI produce a **device-installable signed** build, add repository
secrets for your Apple Developer signing assets (a `.p12` certificate + its
password and a provisioning profile, or App Store Connect API key), import
them in a step before `xcodebuild`, and drop the `CODE_SIGNING_ALLOWED=NO`
flags. Codemagic and Ionic Appflow automate this part.

## After you change the web app

```bash
npm run build     # refresh dist/battleboarding-standalone.html
npm run sync:ios  # copy www/ into ios/
```

then rebuild in Xcode or re-run the workflow.

## App identity and polish

- **Name / bundle id**: `capacitor.config.json` (`appName`, `appId`). The
  `appId` is permanent once published to the App Store.
- **Status bar**: `ios/App/App/Info.plist` is set to light text on the dark
  `#0B0B0C` background.
- **Icon / splash**: put a 1024x1024 `icon.png` (and optional `splash.png`)
  in a `resources/` folder, then `npm i -D @capacitor/assets` and
  `npx capacitor-assets generate --ios`. Otherwise Xcode uses the default
  Capacitor icon.
- **Orientation**: portrait + landscape, same as Android. Restrict it in the
  Info.plist `UISupportedInterfaceOrientations` array if you want portrait
  only.

## No Mac, no CI? Install it as a home-screen web app

The GitHub Pages demo (`https://ammarfirman.github.io/Battleboarding-Entry-Job/`)
opens in iOS Safari. **Share > Add to Home Screen** gives it its own icon and
a full-screen, chrome-free window. IndexedDB persists, so the tracker works
the same way. This needs no Xcode, no account, and no build - it is the
fastest way to get the app onto an iPhone. The only limits versus a native
build: iOS may evict the site's data under heavy storage pressure, and there
is no App Store listing.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npx cap add ios` on Windows | works - it scaffolds `ios/`. You still cannot *build* without a Mac. |
| Xcode: "Signing for App requires a development team" | set Team under Signing & Capabilities (needs an Apple ID) |
| Xcode: bundle id conflict | change `appId` in `capacitor.config.json`, re-run `npx cap sync ios` |
| App loads white | make sure `npm run build` then `npx cap sync ios` ran; check `ios/App/App/public/index.html` exists |
| Music does not start | tap once; WebViews block audio until the first interaction, by design |
