# Skew

A dark, machined design language. Anodised chassis, backlit keys, jewel LEDs, engraved plates,
one lamp above-left and nothing that argues with it. Used by my pen plotter control software and
my generative art UI.

```bash
npm run dev          # http://localhost:2860
```

---

## The layout

```
src/      skew.css, skew-kit.js, skew-hatch.js, skew-machine.css   what you edit
dist/     skew.css, skew-kit.js, skew-hatch.js                     what an app copies
docs/     the five pages, plus their own CSS and nav
tools/    build-dist.mjs
```

Changing any of it: [`CONTRIBUTING.md`](CONTRIBUTING.md). Adding a hatch: the same file, and it
has the worked example.

**`dist/` is the only folder an app touches.** Its path does not move when the repo is
reorganised, which is the whole reason it exists. Everything else is source and site.

---

## Adopting it

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

## The five pages

| | |
|---|---|
| **HOME** | the door, and how to adopt it |
| **SYSTEM** | the parts and the rules, ordered as a build-up: the factories, the four surfaces every part is cut from, the tokens, the primitives, knob layouts, the interlock, the nav bar, the settings drawer, the room and the sheet, traps |
| **PANELS** | Portrait-Typo rebuilt as hardware, down to a hatch bay that plots in real millimetres |
| **MACHINE** | TargzPenPlotterCtrl rebuilt, jog by keys against jog by stick |
| **HATCH** | the fill engine. One contract, three layers, two specimens at 1:1, and how to add to it |

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
