# Skew

A machined design language in two skins. Anodised chassis, backlit keys, jewel LEDs, engraved
plates, one lamp above-left and nothing that argues with it. Used by my pen plotter control
software and my generative art UI.

**Two skins, one attribute.** Dark is the default and the absence of the attribute — not
`data-skin="dark"`. Light is `<html data-skin="light">`, and it is a material change only: the
same parts, the same geometry, cast in a cream case instead of a black one.

**And it ships values, not only a stylesheet.** Two of the three apps adopting it are Rust egui
and cannot load CSS at any price; a third's markup shares no class name with it. So `dist/`
carries a resolved token manifest as well — see *Adopting it* below.

```bash
npm run dev          # http://localhost:2860
```

---

## The layout

```
src/      skew.css, skew-kit.js, skew-hatch.js, skew-machine.css   what you edit
          fonts/    the display face, loaded by skew.css by relative path
dist/     skew.css, skew-kit.js, skew-hatch.js, skew-machine.css   what an app copies
          fonts/    copied, because skew.css loads it by relative path
          skew-tokens.json  every token, both skins, var() and color-mix() resolved
          skew_tokens.rs    the same, as one Palette struct with two values
          skew-tokens.js    the same, with colours as 0-1 floats for a vertex buffer
rust/     skew-egui/   the same parts PAINTED, for the apps that cannot load CSS
                       src/tokens.rs  generated, same bytes as dist/skew_tokens.rs
                       assets/        Silkscreen as TTF — egui cannot read woff2
docs/     the six pages, plus their own CSS, nav and APP-ALIGNMENT.md
tools/    build-dist.mjs, tokens.mjs
```

Changing any of it: [`CONTRIBUTING.md`](CONTRIBUTING.md). Adding a hatch: the same file, and it
has the worked example.

**`dist/` is the only folder an app touches.** Its path does not move when the repo is
reorganised, which is the whole reason it exists. Everything else is source and site.

---

## Adopting it

### If your app cannot load CSS

Two of the three apps using this are Rust `eframe/egui`: no CSS, no HTML, no DOM. They adopt
**`dist/skew_tokens.rs`** — one `Palette` struct and two values of it, `Palette::dark()` and
`Palette::light()`. It is a struct and not a wall of `pub const` on purpose: a const is chosen
when the binary is built and a skin is chosen when the app starts, so holding a `Palette` in
your state is the only form in which an egui app can have a light mode at all.

Vendor the file — both apps build in CI, which cannot see a sibling folder.

**Or take the whole part and not only its colours.** `rust/skew-egui` is this repo's egui
implementation: the generated tokens *plus* the painted key, fader, panel and well that all
three apps were each re-drawing by hand. Values stop drifting with a manifest; drawings only
stop drifting with shared code. `cargo run --example gallery` is the running reference —
every part in every state, light skin. It is taken as a **`git` dependency pinned by `rev`**,
because CI cannot see a sibling folder and a `path` dependency is the one thing that cannot
work; [`rust/skew-egui/README.md`](rust/skew-egui/README.md) has the dependency line, the
local-override block and the const-by-const port table.

A token that exists in one skin and not the other is an `Option`. The two skins do not name the
same parts: `--card` and `--case-face` are light-only, `--plate` and `--groove` dark-only, because
the dark theme was written first and the light skin is an island appended to it. Filling the gap
with a transparent colour would compile, run, and draw nothing.

`--recess` and `--chamfer` are not values — they are a nine-layer inset shadow and a 152° gradient,
and egui has neither. They are emitted as their **layers** and their **stops**, which is the form
your painter code already wants.

For a WebGL vertex buffer, **`dist/skew-tokens.js`** carries every colour a second time as a
normalised 0–1 quadruplet. It also sidesteps Chromium 110, which drops every `color-mix()`
declaration silently — and this sheet has 67 of them.

### If it can

Copy `dist/skew.css` and `dist/skew-kit.js` into your app, and `dist/skew-hatch.js` if you
fill anything. Do not link back to this folder:
Targz Launchpad roots every project at its own directory, so a path out of it cannot be fetched
at runtime, and there is no build step to resolve one.

`dist/skew.css` is `@layer skew`, so your own `.card`, `.row`, `.box`, `.key` and `.wrap` keep
beating it without a rename and without an `!important`.

`dist/skew-kit.js` publishes `window.SkewKit`. It is wrapped rather than loose because an app
running p5 in global mode already has a global `key`, and two of those collide without throwing.

`dist/skew-hatch.js` publishes `KIT`, `HANDS` and `HATCH`, and touches nothing else. No DOM, no
measuring, no drawing — it hands back path data in millimetres. It is the one piece here you can
test from a terminal, which is the whole reason it is a file.

**Never hand-edit a copy.** A patch on a generated file disappears at the next build, silently,
and you find out when a control stops matching the reference.

---

## Building

```bash
node tools/build-dist.mjs           # report drift between src/ and dist/
node tools/build-dist.mjs --write   # rebuild
```

Run it after any change to `src/`. The CSS build drops this documentation site's own rules and
nothing else; working out which parts *your* app uses needs your code and belongs in your repo.
Portrait-Typo and Portrait-ribbons each have a `tools/kit-css.mjs` that does exactly that,
downstream of this one.

---

## The six pages

| | |
|---|---|
| **HOME** | the door, and how to adopt it |
| **SYSTEM** | the parts and the rules, ordered as a build-up: the factories, the four surfaces every part is cut from, the tokens, the primitives, knob layouts, the interlock, the nav bar, the settings drawer, the room and the sheet, traps |
| **PANELS** | Portrait-Typo rebuilt as hardware, down to a hatch bay that plots in real millimetres |
| **MACHINE** | TargzPenPlotterCtrl rebuilt, jog by keys against jog by stick |
| **HATCH** | the fill engine. One contract, three layers, two specimens at 1:1, and how to add to it |
| **NEXTDRAW** | the plotter's own 7&Prime; touchscreen. Six screens at 800&times;480, with real plotter geometry on the bed |

Papers: [`CONTRIBUTING.md`](CONTRIBUTING.md) for changing any of it,
[`HATCH-API.md`](HATCH-API.md) for the fill generators,
[`FEATURES-REQUEST.md`](FEATURES-REQUEST.md) for what is asked for and not built.

`old/index.html` is the discontinued light-palette document Skew replaces. It stays reachable
because deleting the thing a decision was made against loses the decision.

---

## Rules

- Never invent a value. If a component is not in a real app, it does not belong here.
- A folder is a bay, not a collapsible header.
- A theme that tints the thing being drawn is a theme that lies about the drawing. The chrome is
  metal; the paper is not.


---

## What this system does not own

**The chrome is metal; the paper is not.** A terminal's buffer and a plotter's toolpath are the
drawing, not the furniture around it — and `skew.css`'s own `.sheet` rule settles it: *a theme
that tints the thing being drawn is a theme that lies about the drawing.*

So: Terminass bundles 956 iTerm2 schemes and its own `Palette{bg,fg,cursor,selection,ansi[16]}`,
and that is correct. The plotter's three.js colours carry plotter semantics Skew has no business
in — travel against feed against already-drawn, where the drawn grey must not be black because
black already means *excluded by you* rather than *drawn by the machine*. Neither is a gap.

A **status LED must never be the only carrier of state.** A dot that encodes run, pause and alarm
by colour alone is unreadable to a quarter of the people who will stand in front of it, and the
machine it is attached to moves.
