# Battleboarding Business Entry

A Persona 5 styled job and service tracker for **Battleboarding Business**, an
Indonesian community that does debate judging and argument writing.

One vanilla JavaScript app, no framework and no build step, shipped four ways
from the same `www/` source. All data is stored **on the device** using
IndexedDB. No server, no account, works fully offline.

**Live demo:** https://ammarfirman.github.io/Battleboarding-Entry-Job/
(GitHub Pages, deployed from `www/` by the workflow in `.github/`.)

**Stack:** HTML, CSS, ES5, IndexedDB, Capacitor 8 (Android), Electron 44
(Windows), bundled web fonts (Anton, Barlow, IBM Plex Mono), bundled KaTeX for
offline math. No framework, no runtime dependencies.

## Get it

| Target | What | Where |
|---|---|---|
| Browser | one self contained HTML file, about 22 MB | `dist/battleboarding-standalone.html` in this repo, or the live demo above |
| Android | installable APK, Android 7.0 and newer, debug signed | [latest release](../../releases/latest), file `BattleboardingEntry-debug.apk`. Build steps in `docs/android.md` |
| Windows | Electron desktop app | [latest release](../../releases/latest), file `BattleboardingEntry-Windows-x64.zip`. Build steps in `docs/windows.md` |
| Web | your own host | serve the contents of `www/` |

## Repository layout

```
.
├─ www/                       the app, shared by every build
│  ├─ index.html              markup, styles and all the logic in one file
│  ├─ fonts.css, fonts/       bundled Anton, Barlow, IBM Plex Mono
│  ├─ vendor/katex/           bundled KaTeX for Calculation jobs
│  └─ assets/                 background, loading gif, two music tracks
│
├─ scripts/
│  ├─ build-standalone.js     inlines every asset into dist/battleboarding-standalone.html
│  └─ smoke-test.js           jsdom regression test, walks every screen
│
├─ docs/
│  ├─ android.md              build the APK
│  ├─ windows.md              build the Electron desktop bundle
│  └─ architecture.md         how www/index.html is put together
│
├─ windows-app/               the Electron wrapper source (main.js, package.json)
├─ dist/                      the committed one file build lives here
│  └─ battleboarding-standalone.html
│
├─ .github/workflows/pages.yml   deploys www/ to GitHub Pages
├─ capacitor.config.json, package.json   Capacitor and npm config
├─ CHANGELOG.md
└─ LICENSE
```

Not in git, all regenerated (see `.gitignore`): `node_modules/`, `android/`
(the Capacitor native project), release binaries in `dist/`, and
`windows-app/BattleboardingEntry/` (the roughly 385 MB Electron bundle).

## Working on the app

```bash
npm install          # dev tooling (Capacitor CLI, jsdom)
cd www && python -m http.server 8000    # then open http://localhost:8000
```

Serving `www/` locally is enough for day to day work; the fonts and audio
load over http. When you are done editing `www/`:

```bash
npm run build        # regenerate dist/battleboarding-standalone.html
npm test             # run the smoke test
npm run sync         # copy www/ into the Android project
```

`docs/architecture.md` explains the single script inside `www/index.html`.

## Releasing

1. `npm run build && npm test`.
2. Rebuild the APK (`docs/android.md`) and the Windows zip (`docs/windows.md`).
3. Commit `www/` and `dist/battleboarding-standalone.html`.
4. Create a GitHub release, tag it (`1.0`, `2.0`, `3.0`, `4.0`, ...), and
   attach the APK and the Windows zip. Binaries are release assets, never
   commits.

## Features

Tabs: Board, Schedule, Stats, Work On, Services, History, plus a global
Ctrl or Cmd plus K search palette.

**Board.** The four service lines (Respect Thread, Joki Private Debate,
Judgement Battleboarding, Calculation Battleboarding) are the categories.
They are fixed and cannot be deleted. Every job carries:

- Lifecycle status: Not Started, Researching, Writing, Reviewing, Completed,
  Delivered. The square button on the row advances it; completing a job
  stamps the date.
- Priority: Low, Medium, High, Urgent (High and Urgent show on the row).
- Deadline, customer, and tags (the fiction or verse the job is about).
- Full Feats: links to feat compilation threads or documents, rendered as
  cards with editable captions.
- Rebuttals: a structured list, not a text box. Each entry is Claim, Counter,
  Rebuttal, with a status (Unanswered, In Progress, Resolved, Rejected,
  Needs Evidence).
- Notes: a lightweight rich text document (bold, headings, lists, quote,
  links), autosaved.
- Embeds: paste an Imgur, Gyazo, direct image, YouTube, Vimeo or Streamable
  link and it renders inline.
- Price with a status: quote, sold, or example.
- A photo log, downscaled and stored on the device.

**Per category layouts.** Judgement jobs hide Rebuttals and the global Embed
section. Respect Thread jobs hide those two and instead get a five part
builder: Introduction, Terminology, Feats and Abilities, Statistics,
Intelligence and In-Char, with an Export to HTML button that writes a clean
formatted document. Calculation jobs are just a LaTeX section: each block is
a title, a body, a live math preview and its own evidence, so every figure
carries its proof. Write `$ ... $` for inline and `$$ ... $$` for display
math; rendered by the bundled KaTeX, fully offline. The Calculation panel also has
a built in scientific calculator (its own parser, no `eval`, no network) with
a DEG and RAD toggle, a history, and an "insert as LaTeX block" button.

**Schedule.** Deadline buckets (Overdue, Due soon, Upcoming, Completed) and a
month calendar with per day deadline dots.

**Stats.** Totals for jobs, customers, revenue, average job value and average
completion time; an upcoming deadlines list; and charts for jobs by status,
jobs by priority, most requested fiction or verse, jobs completed per month
and revenue per month.

**Work On.** A directory of where work comes from: Facebook, WhatsApp,
Discord and external web, each with a name, a link and a note.

**Transitions.** Every tab change and category switch plays a two second
Persona 5 pause menu sequence: a white flash, diagonal panels, a striped
band, scattered stars, and the destination name stamped in Anton. Each
destination has its own animated motif. Board is kanban cards, Schedule a
calendar with a ticking hand, Stats growing bars, Work On chat bubbles,
Services a swinging price tag, History a flipping hourglass; Respect Thread is
a booting monitor, Joki a marionette, Judgement the scales of justice,
Calculation a thinking head. Click or tap anywhere to skip. Honors
`prefers-reduced-motion` (instant swap, no overlay).

**Music.** The corner button opens a Persona 5 decision style menu to pick a
background theme (Tema Aksi, Tema Tenang, or off), remembered per install.

**Language.** An ID and EN button switches the whole interface, including
dates and the History and Services copy. Remembered per install.

**Shapes.** Nothing is a plain rectangle. Every container carries its text in
its own Persona 5 silhouette (`clip-path` polygons in `--sh-*` and `--k-*`
custom properties, with the hard shadow following the cut via
`filter: drop-shadow`): leaning parallelograms, banner points and stepped
notches. The category rail is a rounded, frosted, translucent panel; pressing
an option plays a select animation.

Embeds load on GitHub Pages, in the standalone file, and in the Android and
Windows apps. They do not load inside the claude.ai artifact preview, whose
content policy blocks third party images and iframes.

## Data and storage

One record in IndexedDB (`bbe`, store `kv`, key `state`, schema version 3):
`categories`, `jobsByCat` (each job holds `status`, `priority`, `deadline`,
`createdAt`, `completedAt`, `customer`, `tags`, `rebuttals`, `argDoc`,
`embeds`, `price`, `priceKind`), `imagesByJob`, `workOn`. Photos are
downscaled to about 1000 px JPEG and stored as data URLs. A version 1 or 2
record migrates forward automatically on first load.

Storage is local to each install or browser. There is no sync between
devices. Clearing the app storage resets it to the four starter categories,
each seeded with one worked example.

**Backup and Restore** live in the History tab. Save to file writes the whole
state to a JSON file you can keep or move. Load from file replaces the current
data with a saved file. This is the only backup that survives clearing the
storage or moving to another device.

## License

MIT. See `LICENSE`.
