# Architecture

The whole app is `www/index.html`: markup, a `<style>` block, and one
`<script>` at the bottom. Plain ES5, no framework, no build step. The other
files under `www/` are static assets it references.

## Data flow

1. On load, `idbGet("state")` reads the single IndexedDB record.
2. If there is nothing, `seedServices()` creates the four starter categories
   with one worked example job each. If the record is an older shape,
   `migrate()` upgrades it to schema version 3.
3. `state` is the in memory object. Every mutation goes through `DATA`
   (create, update, delete). Each `DATA` method ends by calling `renderAll()`
   and then `save()`.
4. `save()` writes `state` back to IndexedDB, debounced by 250 ms.

## Rendering

`render*` functions rebuild DOM from `state` with string templates:

- `renderPanel` is the Board, `renderSchedule`, `renderStatsView`,
  `renderWorkOn`, `renderPalette` are the other screens.
- `renderAll()` calls the chip bar plus the active view.
- Events are delegated: one `click` and one `keydown` listener on `document`
  read `data-act` and `data-*` attributes to decide what to do.

## Key pieces

| Name | Role |
|---|---|
| `STATUSES`, `PRIORITIES`, `REB_STATUSES` | the lifecycle vocabulary; extend here |
| `CATEGORY_KIND`, `CATEGORY_HIDE`, `catHides()` | per category layout rules |
| `I18N`, `L("key")`, `setLang()`, `applyStatic()` | the Indonesian and English catalog |
| `classifyEmbed()` | a URL becomes `{kind, embedUrl, thumbUrl}` |
| `cleanHtml()` | sanitises the Notes rich text document |
| `mathEval()` | the scientific calculator parser, no `eval` |
| `renderMathInto()` | splits text from math and calls bundled KaTeX |
| `hbars()`, `vbars()` | the hand drawn CSS charts |
| `playTransition(swap, label, motif)` | the two second Persona 5 wipe |
| `buildRespectThreadDoc()` | the Export to HTML output for Respect Thread jobs |

## Styling

Persona 5 tokens live in `:root`: `--bg`, `--red`, `--warn`, the `--anton`
font stack, plus two families of `clip-path` polygons. `--sh-*` are the label
shapes (pennants, tabs, banners); `--k-*` are the box shapes (leaning
parallelograms, banner points, stepped notches). The hard offset shadow is
`filter: drop-shadow` so it follows the clipped edge.

## Builds

`scripts/build-standalone.js` inlines `fonts.css`, the KaTeX CSS and JS, and
everything under `www/assets/` as data URIs, writing
`dist/battleboarding-standalone.html`. If a local Electron bundle exists it
refreshes that too.

`scripts/smoke-test.js` boots `www/index.html` in jsdom with shims for
IndexedDB, media, canvas and KaTeX, then walks every tab and exercises jobs,
the job detail, rebuttals, the Respect Thread and Calculation builders, the
calculator, the music picker, the language toggle and the transitions. Run it
with `npm test`.

## After editing `www/`

- Browser: `npm run build`, or just serve `www/` locally.
- Windows: `npm run build` also refreshes the bundle's `resources/app/www/`
  when the bundle is present (see `docs/windows.md`).
- Android: `npm run sync`, then rebuild the APK (see `docs/android.md`).
