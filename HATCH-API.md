# The hatch generators — API

Everything in sections 07 and 08 of `skew-layers.html` draws through the same three
layers. This is the reference for porting them into an app; the sections themselves are the
argument for *why* each choice is what it is, and you do not need to read them to use this.

**Everything is millimetres.** There is no pixel anywhere below the DOM layer. A caller measures
its element, converts at `96 / 25.4`, and passes the result as `w, h`. One user unit in the
returned path data is one millimetre on paper, so the output goes into an SVG with `mm` units and
onto the plotter with no rescale. Get this wrong and every number here means nothing.

---

## The three layers

| | what it is | who owns it |
|---|---|---|
| **`KIT`** | the subjects and the primitives — scene, blob, line families, carve | shared, global in the document |
| **`HANDS`** | the three hand fills | filled by 08a, read by 07's dial |
| *machine fills* | parallel and serpentine | local to 08b — **not yet exported**, see *Open* |

---

## The one contract everything else obeys

**A region is a function `tone(x, y) → number`.**

```
 < 0        outside the region — never draw here
 0 … 1      inside; 0 is bare paper, 1 is as dark as the fill goes
```

That is the entire coupling between "what is being drawn" and "how it is filled". Any subject
that can answer that question can be filled by any generator here, and a generator never asks
what shape it is working on. A flat fill is just a region whose tone is `1` everywhere inside.

---

## `KIT` — subjects and primitives

### `KIT.scene(w, h)`
The ball, the table and the lamp. Returns:

| key | |
|---|---|
| `R, cx, cy` | ball radius and centre, mm |
| `gy` | the contact point — where the ball meets the table |
| `sx, sy, srx, sry` | the cast-shadow ellipse |
| `ball(x, y)` | tone of the sphere; `-1` outside the disc |
| `shadow(x, y)` | tone of the cast shadow; `-1` inside the disc and outside the ellipse |

Ball and shadow are **separate tone functions on purpose** — they are different surfaces and the
strokes that fill them are not the same strokes. The sphere's wrap the form; the table's are flat,
because the table is. Take `Math.max` of the two only if you genuinely want one region.

The lighting is not a Lambert term. `1 - n·L` alone draws a shaded *disc*; what makes it a sphere
is the terminator being darker than the silhouette plus the table's **bounce** lifting the lower
rim, occluded near the contact so the contact itself stays black. Do not simplify it back.

### `KIT.blob(w, h, seed)`
A closed organic shape **with a hole in it**. Returns:

| key | |
|---|---|
| `cx, cy` | centre |
| `rad(θ)` | outer radius at angle θ |
| `tone(x, y)` | `1` inside the outer ring and outside the hole, `-1` elsewhere |
| `rings(step)` | `[outer, hole]` — two closed polylines, points every `step` mm |

The outer radius is *derived*, not chosen: four harmonics summing to `0.65` put the widest point
at `1.65 × base`, so `base = (min(w, h) / 2 − 2.5) / 1.65` and no seed can run off the sheet.
The hole is placed, checked the whole way round against the outer radius with 2.6 mm of margin,
and the offset walks back toward the centre until it clears — shrink-until-it-fits terminates
every time and sometimes terminates at a hole a third of a millimetre across, which is a dot the
fill steps over without being asked a question.

**The hole is the point of this subject.** A circle has no corner and no neck; a fill can be
perfect on the ball and come apart the first time it meets a real outline. With an inner edge,
passes break in the *middle* instead of at the ends and the two halves stop being neighbours.

### Line families

```js
KIT.parallels(x0, y0, x1, y1, angDeg, pitch, offset, step, jitter?) → run[]
KIT.latitudes(A, phi0, dphi, cx, cy, R, step, phi1?, jitter?)       → run[]
```

A `run` is a polyline: `[[x, y], …]`. `parallels` covers a box with straight lines; `latitudes`
covers a sphere with curves that **follow the form**, built as latitude circles about an axis `A`
(use `KIT.AXIS(αDeg, βDeg)`).

`jitter` is a function returning roughly `-0.5 … 0.5`; each line is displaced by `jitter() × pitch
× 0.34`. Pass it for a hand fill, omit it for a machine one. An unvarying pitch is the loudest
machine tell in a fill — louder than straightness — so this matters more than the wobble does.

> **The trap in `latitudes`.** Every axis has one pole on the front of the sphere and one place
> where its circles shrink to a point. Put either in the middle of the shading and there is a
> visible whirlpool. They cannot be removed, only placed: aim the axis down the light (`α ≈ 49°`,
> `β ≈ 20°`) and clip `φ` to `[β + cap, π − cap]`, and the two blank caps land on the highlight
> and the reflected-light rim — both places a hand leaves paper anyway.

### `KIT.carve(runs, tone, tau, dither, minLen) → run[]`
Cuts a family down to the parts where `tone(x,y) ≥ tau + dither(x,y)`, drops anything shorter
than `minLen`. This is where tone becomes geometry.

**`dither` is not optional for a hand fill.** A clean threshold draws a *contour map of the
lighting* — the fill bands into visible isolines — which is the one thing that never happens by
hand. Pass `() => 0` only for a machine fill, where the banding is honest.

### Also on `KIT`
`rng(seed)` → deterministic `0…1`; `noise(seed)` → smooth 1-D value noise; `toPath(points)` →
smoothed cubic path data; `thin(points, n)` → decimate; `plen`, `clamp01`, `norm`, `cross`.

---

## `HANDS` — the three hand fills

```js
HANDS.draw     (kind, w, h, seed, opt?) → { paths: string[], nib: number, S }   // the ball
HANDS.drawShape(kind, w, h, seed, opt?) → { paths: string[], nib: number, S }   // the blob
```

`kind` is `'hand'`, `'cross'` or `'random'`. `paths` are SVG path `d` strings in mm; join them and
set them on one `<path>` — a plotter reads movetos, not the DOM, and the random hand emits several
thousand of them. Same seed in, same drawing out. Always.

### `opt` — the three a caller owns

| | default | |
|---|---|---|
| `nib` | `0.35` | pen width, mm. Also drives the wobble, the overshoot and the shortest mark that still reads — those are properties of the *pen*, not of the pitch. |
| `spacing` | `2.17 × nib/0.35` | the base pitch, mm. Every internal pitch is a multiple of it. |
| `angle` | `-34` | the base direction, degrees. Every pass angle is an offset from it, including the form-following axis on the ball. |

**Spacing defaults *from the nib*, and that is the important part.** Pitch and nib are one
setting — what a fill looks like is pitch measured in nibs — so a caller that picks up a bigger
pen and says nothing about spacing gets *the same drawing with a bigger pen*, not a darker one.
Pass `spacing` and you have taken that over; the two are then independent and it is on you to
keep them clear of the flood crossing.

**`angle` does nothing on `'random'`, and cannot.** A fill with no readable direction is the
whole definition of that kind. `spacing` does work there: it has no register to space, so the
only thing spacing can mean is how much paper is left — coverage is density × length × nib, so
density goes as 1/pitch and the random hand lightens and darkens in step with the two that have
a pitch.

> Changing `spacing` or `angle` alone leaves the drawing **the same drawing**: the passes keep
> their relative pitches and their relative angles, so nothing about the fill's character moves.
> That is what makes them parameters rather than a different generator.

### What "hand-made" is, as a list

Not a texture added at the end. Five behaviours, and every one is something a loop does not do:

1. **It does not space evenly.** Pitch jittered by a third of itself, before anything else.
2. **It does not come back at the same angle.** Each pass drifts a couple of degrees off the last.
3. **It does not stop on the line.** A stroke overshoots the boundary or pulls up short, never by
   the same amount twice.
4. **It re-grips.** Past ~16 mm the wrist runs out of travel, so a long fill contains no
   edge-to-edge strokes at all.
5. **It builds tone by going back over.** Four passes, each confined to what is already darker
   than the last — you do not draw a grey.

### The constants

All pitches below are at the default `spacing` of 2.17 and scale with it; all angles are
offsets from the default `angle` of −34°.

| | `hand` | `cross` | `random` |
|---|---|---|---|
| ball | 4 form passes @ 2.17, axis at +83°, drift ±3° | 1 form pass @ 2.10 then 3 straight @ 1.75 / 1.54 / 1.33 at +20° / +90° / +56° | density 2.7 marks/mm², ∝ 1/pitch |
| thresholds | `0.12 / 0.36 / 0.56 / 0.76` | `0.12 / 0.36 / 0.56 / 0.76` | accept ∝ `tone^1.3` |
| flat fill | 2 passes @ 1.96 at +0° / +4° | 2 passes @ 1.61 at +0° / +86° | density 2.7 |
| shadow | 3 passes @ 1.61 at +30° / +28° / +32° | 3 passes @ 1.61, one crossing at +58° | scattered |

> **Pitch and nib are one setting.** What a fill *looks like* is pitch measured in nibs. Change
> the nib and scale every pitch by the same factor or the drawing changes into a different one —
> the 0.25 → 0.35 change scaled all of these by 1.4 and the tone did not move.

> **The flood crossing.** Four interleaved passes at pitch `s` land the darkest tone at `s/4`, so
> `s` must stay four nibs clear of the crossing or the terminator becomes a solid black disc. The
> hatch bay marks this in red on its spacing knob; it is the first thing that goes wrong here.

---

## The machine fills — parallel and serpentine

Currently local to 08b (see *Open* below). Signatures as they stand:

```js
ballDraw (w, h, join) → { paths, edge, downs, nib }
shapeDraw(w, h, join) → { paths, edge, downs, nib }
```

`join: false` is the control — the pen lifts at the end of every pass. `join: true` is the
serpentine. `downs` is the number of pen-downs; `edge` is the boundary as separate path data,
drawn as a hairline so the fill can be read against it.

Constants: nib **0.35**, angle **−34°**, pitch **2.17**, reach **1.6 × pitch**, thresholds
`0.12 / 0.36 / 0.56 / 0.76` on the ball and `0.12 / 0.44 / 0.72` on the shadow.

### `stitch(runs, bridge) → run[]`

Greedy nearest-end. That is all a serpentine is: the nearest unused end to where you stopped is
the near end of the next pass, so every other pass comes out reversed without anybody asking.
The turnaround is the entire visible difference.

Whether a travel is *legal* is not `stitch`'s decision — it is handed in as a **bridge**:

```js
bridge(a, b) → points[] | null      // the line the pen draws on the way, or "lift"
```

`cut(reach, inside)` is the only bridge in use: it returns `[b]` if the gap is under `reach`
**and** five sample points along it are all inside the region. That second test is not optional —
skip it and the fill grows whiskers across the white paper between its islands, which is worse
than the lift it saved.

### The rule that is deliberately not implemented

A wall-walking bridge — route along the outline where the straight cut runs out, then finish by
carrying on round the perimeter — takes a flat fill to **one stroke**. It was built, it worked,
and it was removed.

**The count is not the drawing.** Every trick of that kind buys a lift with a *line*, and a line
is permanent: the wall inks twice where the pen retraces it, and the closing join runs from
wherever the fill stopped to wherever the perimeter starts — straight across the middle of the
shape. One of those ruins a plot; sixty pen lifts do not.

> A serpentine is a fill that does not lift **when it does not have to**, not a fill that never
> lifts. Chasing the second is how you draw the first line you cannot erase. Lifting is free;
> ink is not.

---

## Getting a plottable file out

```js
const out = HANDS.drawShape('cross', w, h, seed);
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">` +
  `<path fill="none" stroke="#000" stroke-width="${out.nib}" ` +
  `stroke-linecap="round" stroke-linejoin="round" d="${out.paths.join('')}"/></svg>`;
```

No filter, no blur, no `fill` anywhere. Every mark is a stroked path at the nib's own width, which
is the only condition under which what you see is what the pen puts down.

---

## Open

- **The machine fills are not exported.** `HANDS` is, via a top-level `let` that 08a fills and
  07 reads; the parallel/serpentine pair has no equivalent, so the bay's `Serpentine` dial
  position runs its own generator rather than this one. Two implementations of one idea drift
  apart — the same argument `KIT` exists to settle. One line, once section 07's rewiring lands.
- **Chaining is per pass, never across passes**, so the pen lifts at least three times on the
  ball before anything else. Joining across thresholds means drawing a connector in a region it
  does not belong to — the same objection as the wall walk, one step smaller, and untried.
- **A shaded region cannot use a wall walk at all**, because its islands are edged by an isoline
  of the tone and there is no curve to follow. Extracting that isoline (marching squares over the
  tone field) is the only route to a lower count on the ball, and it is unbuilt on purpose until
  someone decides it is worth the code.
