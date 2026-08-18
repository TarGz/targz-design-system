# Contributing to Skew

Read this before you change anything. It is short because most of it is one idea: **some files
here are written and some are generated, and the two look identical until you hand-edit the wrong
one.** A patch on a generated file disappears at the next build, silently, and the way you find
out is that a control stops matching the reference.

```bash
npm install
npm run dev          # http://localhost:2860
```

---

## Where the code lives

| Path | | Edit it? |
|---|---|---|
| `src/skew.css` | The language. Every surface, every control, plus this site's own rules | **yes** |
| `src/skew-kit.js` | The control factories: `knob`, `fader`, `key`, `pkey`, `drum`, `rotary`, `swBtn`, `openPicker`, `windowise`, `navBar` | **yes** |
| `src/skew-hatch.js` | The fill engine: `KIT`, `HANDS`, `HATCH`. No DOM | **yes** |
| `src/skew-machine.css` | The plotter console's own parts | **yes** |
| `docs/*.html` | The five pages. Each is markup + one inline `<script>` | **yes** |
| `docs/skew-nav.js` | The nav bar and the page registry | **yes** |
| `dist/*` | What an app copies | **NO — generated** |
| `old/index.html` | The discontinued light-palette document | **no — kept as a record** |

`dist/` is the only folder an app touches, and it is built:

```bash
node tools/build-dist.mjs           # report drift between src/ and dist/
node tools/build-dist.mjs --write   # rebuild
```

Run the reporting form before you commit. It exits non-zero on drift, and it fails the build if
`version.js` stops parsing — which it does by *importing* it rather than by matching a regex,
because a regex once read a perfectly good version number out of a file that no longer ran.

### What `dist/` drops, and how it decides

`tools/build-dist.mjs` holds a `DOC_ONLY` set of class names. A rule is dropped when **every**
class in its selector is doc-only, so `.mat .knob` survives — the second half is a part, and
dropping the rule would take a part's geometry with it.

Two consequences worth knowing before you name a class:

- **A doc-only class needs a doc-only name.** `.segcell.col` shipped `col` into the kit, because
  `col` is a name an app is entitled to use. It is `.segcell-col` now. Prefix your modifiers.
- **Qualifying with a part leaks the rule.** `.box.segpanel` names `box`, so the whole rule ships.
  If you need to out-rank a part from a doc-only rule, double the class — `.segpanel.segpanel` —
  which buys the same specificity out of a name the build already knows to drop.

---

## The rules that get a change rejected

**If a component is not in a real app, it does not belong in Skew.** This is the oldest rule here
and the most expensive one to ignore. A part called `.seg` was written from scratch for a
documentation page, specified as new language, shipped in `dist/`, and never once rendered
upright across four attempts to fix it. Nothing in any app had ever been built from it. It is
gone. Bring the part *out* of an app that needs it; do not draw one and hope an app arrives.

**A specimen is lifted, not written.** The three interlocks on SYSTEM §06 are Portrait-Typo's page
switcher, that app's tool palette and the hatch bay's own tab bar — copied, not reimplemented. A
specimen written for the page is a specimen that can be upright on the page and broken in the app.

**Never hand-edit a vendored copy.** Adopting apps vendor from `dist/` with their own extractors
(`tools/vendor-kit.mjs`, `tools/kit-css.mjs`, `tools/vendor-nav.mjs` in Portrait-ribbons). Fix the
source here and re-extract downstream.

**Never bind two controls to one key.** They do not sync each other, so two rows on one key drift
apart until the next refresh.

**A parameter is not a way to avoid a decision.** Two rules in the hatch engine are deliberately
not tunable — everything is millimetres, and a connector is a line the pen actually draws. Both
have been argued once and written down. A knob for either is an invitation to get it wrong once
per call site.

**Every commit bumps `version.js`** and adds its entry to `CHANGELOG`, with the date and what
changed. Semver: breaking/architectural is major, new work is minor, fixes are patch.

Not building it now? File it: [`FEATURES-REQUEST.md`](FEATURES-REQUEST.md) for what is asked for
and not built, [`BUGS.md`](BUGS.md) for what is broken.

---

## Adding a hatch

This is the part of Skew meant to keep growing, so it is the one with a worked example. The engine
is `src/skew-hatch.js`; the reference is [`HATCH-API.md`](HATCH-API.md); the page is
`docs/skew-hatch.html`.

### The one contract

A region is a function `tone(x, y) → number`:

```
 < 0      outside the region — never draw here
 0 … 1    inside; 0 is bare paper, 1 is as dark as the fill goes
```

That is the entire coupling. Any subject that answers it can be filled by any generator, and no
generator asks what shape it is on.

**Everything is millimetres.** No pixel exists below the DOM. A caller measures its element,
converts at `96 / 25.4`, and passes `w, h`. One unit out is one millimetre on paper. Get this
wrong and every number means nothing — *and it will still run*, which is why it is stated twice.

### Test it before you look at it

The engine has no DOM, so you can drive the whole pipeline from a terminal. Do this first; a page
that looks plausible is not evidence.

```bash
node -e "require('./src/skew-hatch.js'); const {KIT,HATCH}=globalThis; const S=KIT.scene(90,70); const c=KIT.carve(KIT.parallels(0,0,90,70,-34,2.17,0,0.5),S.ball,0.36,()=>0,0.84); console.log(c.length,'runs ->',HATCH.stitch(c,HATCH.cut(3.47,(x,y)=>S.ball(x,y)>=0.36)).length,'strokes')"
```

On an unchanged engine that prints `17 runs -> 6 strokes`. If your change moves those numbers,
you should be able to say why before you open the page.

### A new hand, in three places

1. **`src/skew-hatch.js`** — add your `kind` to `draw()` *and* `drawShape()`. `draw` fills a shaded
   subject (the ball, four thresholds); `drawShape` fills a flat one (the blob, one density edge
   to edge). Both return `{ paths, nib }` with `paths` as mm path data.

   Use what is already there: `parallels` / `latitudes` for the family, `carve` for turning tone
   into geometry, `push()` to emit — it is `push` and not `ink` that makes a hand **re-grip** past
   ~17mm, which is why a long hand-drawn fill has no edge-to-edge stroke in it.

   A caller owns `spacing` and `angle`. Write every pitch as a multiple of the base and every pass
   angle as an offset from it, so one knob rotates the whole fill and the other changes its pitch
   *without changing what it looks like*. That is the difference between a parameter and a
   different drawing. Spacing defaults from the nib, because pitch and nib are one setting: a
   caller who picks up a bigger pen and says nothing wants the same drawing with a bigger pen,
   not a darker one.

2. **`docs/skew-hatch.html`** — add a row to `TESTS` (`k`, `nm`, `eng`, and the two captions), and
   its engraving to the `Object.assign(ENG, …)` at the top of that page's script. An engraving is
   its own marks, not a picture of them. Add it to the *assign*, never a fresh `const ENG` — the
   kit already declares one, and redeclaring it stops the whole page parsing.

3. **`docs/skew-panels.html`** — add it to the hatch bay's `TYPES`, so the bay's dial offers it
   beside the machine fills. The bay borrows `HANDS.draw` whole. **Do not write a second
   implementation there** — two implementations of one hand are two hands that drift apart, and
   neither specimen catches it because each is drawing its own.

### A new machine fill

A family of runs plus a **bridge**. The bridge is the whole of the interesting part: it decides
whether a travel move is legal, and it must test two things, not one — is the gap short enough,
*and* does the connector stay inside the region. Skip the second and the fill grows whiskers
across the white paper between its islands, which is worse than the lift it saved.
`HATCH.cut(reach, inside)` is the usual one.

### A new subject

Anything that answers `tone(x, y)`. It goes in `KIT`, not beside your generator. A subject that
lives next to one fill is a subject the other fills cannot be compared on — and comparability is
the only reason any of these specimens is worth looking at.

It has to survive **both** shapes. A fill can be perfect on the ball and come apart the first time
it meets a corner, which is why every specimen here shows two subjects: the ball tests tone, the
blob tests the boundary.

---

## Changing a page

Each page is markup plus one inline `<script>`. Two things bite:

- **`node --check` is syntax only.** It passes a page that throws on load — and a page that throws
  kills every block after it while still rendering whatever ran first, so it reads as one broken
  section rather than a broken page. Run the page instead:

  ```bash
  node tools/run-page.mjs docs/skew-hatch.html
  ```

  It executes the inline script under a stub DOM. It cannot lay anything out and does not try;
  what it catches is the free variable, the missing export and the call on undefined. The four
  older pages still fail under it on stub gaps (`Image`, `body.prepend`, subtrees built from
  `innerHTML`) — those are the stub's limits, not theirs.

- **The kit already defines more names than you think.** `el`, `svg`, `key`, `eng` and `ENG` are all
  top-level in `src/skew-kit.js`. A second `const` of any of them in a page script is a SyntaxError,
  and then *nothing on the page runs*. Extend, don't shadow: `Object.assign(ENG, { … })`.
- **`window.ENGAGE_ROOTS` must name every container that holds a control.** `engage()` lights a
  control after a press by finding it again among its siblings, and it searches upward for one of
  those roots. A container missing from the list is a press that never surges.

Section numbers in prose are links with no `href`, and nothing tells you when one rots. If you
reorder sections, repoint every `§NN` — and where the reference could be ambiguous, write the
name too (`§05 Filling`), so the next rot is visible instead of silent.
