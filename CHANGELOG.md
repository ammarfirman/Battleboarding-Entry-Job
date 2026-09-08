# Changelog

All notable changes to Battleboarding Business Entry. Versions match the
GitHub release tags. Existing on-device data upgrades automatically on first
open of a newer version.

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
- Backup and Restore in the History tab: Save to file writes the whole state
  (categories, jobs, photos, Work On) to a JSON file; Load from file replaces
  the current data with a saved file. This is the only backup that survives
  clearing the browser or app storage.
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
