# Changelog

All notable changes to Battleboarding Business Entry. Versions match the
GitHub release tags. Existing on-device data upgrades automatically on first
open of a newer version.

## v5.0

Mobile-native pass, richer evidence, and a calculation suite.

- **Phone layout** rebuilt: a bottom navigation bar (Board, Schedule,
  Channels, Stats, More), bottom-sheet forms for adding jobs / rebuttals /
  terminology / feats / calculations, a horizontal Persona category strip,
  flatter cards with a clearer hierarchy, 44-48 dp tap targets, edge-to-edge
  layout behind the system bars, and an About panel under "More".
- The top language / music controls and the "+" button slide away while you
  scroll down and return on scroll-up or near the top. While a job is open, a
  collapse button sits bottom-left so you can fold it from anywhere.
- **Per-view background art**: a different Persona 5 key visual per tab,
  overlaid at ~30% opacity behind the content column and fading out down the
  page - a quiet backdrop rather than a full-bleed wallpaper - with the flat
  near-black panels sitting on top.
- **Respect Thread export** now follows a Notion-style document layout: a
  cover band, a compiled-by line, a "List of Contents" with jump links,
  horizontal rules between sections, and lighter Notion typography.
- Shorter, tap-skippable section transitions at phone width.
- **Evidence and embeds**: pasted links render inline as a readable image
  thread; every scan takes an editable caption; links that cannot be shown
  fall back to a clear "open" chip. Wide host support - Gyazo, Imgur (single
  images and albums), ImgChest, Giphy, Tenor, Catbox, Discord and Reddit
  CDNs, direct image / video links; YouTube, Vimeo, Streamable, Dailymotion,
  Twitch clips and VODs, Bilibili. Tap any scan for a full-screen viewer that
  pages through every scan in that feat ("3 / 7", swipe or arrow keys).
- Respect Thread evidence now carries captions; older evidence upgrades
  automatically.
- **Calculation panel** gains a multi-mode calculator with the standard VS
  Battles methods: Kinetic Energy, Mass from Volume, Destruction Energy
  (material x method, J/cc table built in), Crater, Gravitational Binding
  Energy, Falling / Lifting Energy, Free Fall, Speed (distance / time),
  Energy - TNT - Tier, Volume of 13 solid shapes, and Angular Size (angsize,
  70 degree FOV: size <-> distance). Each shows the result, its TNT
  equivalent and the matching Attack Potency or Speed tier, and inserts the
  full working as a LaTeX block. The scientific calculator is unchanged.

## Final V (v4.0)

Interface and polish pass.

- Every tab change and category switch now plays a 2 second Persona 5
  pause-menu transition, each with its own animated motif: Board, Schedule,
  Stats, Work On, Services, History, plus a themed motif per service line
  (Respect Thread is a booting monitor, Joki a marionette, Judgement the
  scales of justice, Calculation a thinking head). Click or tap to skip.
- The category rail is a rounded, frosted, translucent panel. Pressing an
  option plays a select animation (a skew and scale bounce with a shine
  sweep).
- Every container carries its text in its own Persona 5 silhouette: leaning
  parallelograms, banner points and stepped notches, with more spacing
  throughout.
- Header badge now reads "Final V".
- Saves in the History tab, like a game's memory card. Snapshot the current
  data into a named slot inside the app and load it back with one tap, no
  file dialog. Each slot can also be exported to a JSON file or copied as
  text (for photo-free saves), and a save from another device can be brought
  in from a file or by pasting its text. The same save file works on the
  browser, the Android app and the Windows app.
- The Add category button is gone. The four service lines are the only
  categories.
- Fixed: on a phone the Add job button could sit off the right edge and be
  untappable. The add row now wraps and the panel can shrink to the screen.
- Repository reorganised: build and test tooling under `scripts/`, guides
  under `docs/`, the standalone build under `dist/`.
- Copy no longer uses the arrow or the long dash anywhere.

## v3.0

- Job lifecycle status: Not Started, Researching, Writing, Reviewing,
  Completed, Delivered.
- Priority (Low, Medium, High, Urgent), deadlines, a Schedule tab with
  deadline buckets and a month calendar.
- Structured Rebuttals: Claim, Counter, Rebuttal, each with a status.
- Customers field and a Stats tab (summary table plus hand-drawn charts).
- Global Ctrl or Cmd plus K search across jobs, rebuttals, notes, customers
  and tags.
- The four service lines are locked starter categories.
- Per-job Full Feats links under the tags.
- Respect Thread jobs get a five part builder (Introduction, Terminology,
  Feats and Abilities, Statistics, Intelligence and In-Char) with an
  Export to HTML button.
- Calculation jobs get offline LaTeX blocks (bundled KaTeX), each with its
  own evidence, plus a built-in scientific calculator.
- Two background music themes with a Persona 5 decision-style picker.
- Full Indonesian and English language toggle.

## v2.0

- Per-job tags (the fiction or verse a job is about) and word search.
- A rich-text arguments document per job.
- External embeds (Imgur, Gyazo, direct image, YouTube, Vimeo, Streamable).
- Price with a status (quote, sold, example).
- A Work On tab: a directory of where work comes from (Facebook, WhatsApp,
  Discord, external web).

## v1.0

- First release. Persona 5 styled board of categories and jobs, a photo log
  per job, all data stored on the device via IndexedDB, shipped as a
  standalone HTML file, an Android APK and a Windows desktop app.
