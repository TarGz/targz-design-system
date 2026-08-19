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
| **`HATCH`** | the machine side — scanlines, six fills, the chain and its bridge | shared, global in the document |

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

---

## The four newer machine fills

All four take a region and hand back `run[]`, so `stitch` and `cut` work on them exactly as they
work on `scanlines`. **None of them asks what shape it is on** — the direction field below is
derived from the tone function itself, so hand any of them the blob and it fills the blob.

They split on **what carries the tone**, which is the only axis worth sorting them by:

| | tone is | lifts | costs |
|---|---|---|---|
| `streamlines` | the **separation** | some | cheap |
| `squiggle` | the **amplitude** | ~1 per region | cheap |
| `spaceFill` | **curve length** per mm² | 1 per contiguous stretch | cheap |
| `labyrinth` | the **coil spacing** | 1 | expensive |

### `HATCH.streamlines(w, h, tone, opt?) → run[]`

Jobard & Lefer, 1997. Seed a point, integrate the field both ways, stop the moment you come
closer than `d` to a line already drawn, then drop fresh seeds at ±d off the line you just made.
Tone enters as `d` itself.

| `opt` | default | |
|---|---|---|
| `near` / `far` | `1.25` / `3.6` × nib/0.35 | the separation in mm, dark and light |
| `bend` | `0.85` | radians of bend the field will take. `0` is plain parallels |
| `angle` | `-34` | the base direction |
| `field` | derived | pass your own `(x, y) → radians` and `bend`/`angle` are ignored |

**This is the only fill here where tone is not a threshold.** `carve` and the serpentine draw a
full-strength line or none; this draws every line and moves them. It has no banding to dither
away, and it is the only one that reads as drawn rather than screened.

> **The self test is not optional.** A line is not in the grid while it is still being walked, so
> without checking its own trail it spirals onto itself wherever the field curls. The trailing
> window is skipped because the last few samples are always within `d` of the head — that is not
> a collision, that is the line.

### `HATCH.toneField(tone, angle, bend) → (x, y) → radians`

The default field: a base angle **bent** toward the iso-tone direction, by an amount weighted by
how much gradient there actually is. Flat tone leaves the base angle alone; turning tone bends the
lines round it. That is what "the hatching follows the form" means when you are not allowed to
know what the form is.

> **It bends the ANGLE. It does not blend two vector fields.** Blending a uniform field with a
> rotational one always leaves a point where the two cancel, and every streamline in the
> neighbourhood spirals into it — a whirlpool in the middle of the fill, the same failure as an
> unplaced `latitudes` pole and arriving with no warning at all.

> **It bends by `sin(2d)`, not by `d`.** The iso-tone direction is a LINE, not an arrow: it has no
> preferred end, so any formula that folds it into a half-turn range has a seam where the fold
> happens and the fill draws it as a staircase straight across the region. `sin(2d)` is π-periodic
> so the seam cannot exist, and it is zero at 0° and 90° and peaks at 45° — which is also the
> right shape, because those two are the angles with nothing to bend toward.

### `HATCH.squiggle(w, h, tone, opt?) → run[]`

Ahmed & Deussen. Rows at the base angle, and the tone is the **amplitude** of a wave riding along
each one rather than whether the row is drawn. Nothing is ever broken, so a region comes back as
rows that `stitch` folds into a single stroke.

| `opt` | default | |
|---|---|---|
| `pitch` | `2.6` × nib/0.35 | row spacing, mm |
| `amp` | `0.44` | peak, as a fraction of the pitch |
| `wave` | `4.6` × nib/0.35 | wavelength at zero tone, mm. It shortens as the tone rises |
| `angle` | `-34` | |

> **The amplitude ceiling is the whole of the tuning.** Peak-to-peak has to stay under the pitch
> or neighbouring rows collide, and when they collide the dark end stops getting darker and starts
> getting muddled — the tone inverts and the shading reads as a smear. `0.44` leaves an eighth of
> the pitch as margin.

> **The phase advances by arc length, not by the parameter.** Advance it by the parameter and the
> wavelength stretches with each row's own direction, so every angled row comes out a different
> frequency from the ones beside it. That reads as a moiré nobody asked for.

> **The region test is on the DISPLACED point.** Test the centreline and a crest near the edge
> swings outside the shape. The amplitude is pulled in until it fits rather than the run being
> cut, so the wave hugs the boundary instead of fraying against it.

### `HATCH.spaceFill(w, h, tone, opt?) → run[]`

Velho & Gomes. A Hilbert curve that recurses a level deeper wherever the region is darker, so tone
becomes how much curve length is spent per square millimetre.

| `opt` | default | |
|---|---|---|
| `pitch` | `2.6` × nib/0.35 | sets the shallow depth, so it lands at the same density as the others |
| `depth` | from `pitch` | the shallow depth, if you would rather say it outright |
| `levels` | `3` | how many deeper it may go |

**Every sub-cell of a Hilbert curve enters and leaves at fixed corners**, which is why you may
stop the recursion at different depths in different places and the curve is *still continuous*.
That property is the entire reason this works and no other subdivision substitutes for it without
redoing the corners.

Its honest weakness is the grid: the curve is axis-aligned and its lattice is visible in any flat
area, which is a texture and not a shading. Segerman's pinwheel curve is the published answer and
is not built here. Cells outside the region are dropped, which breaks the one line into one run
per contiguous stretch — correct, not a failure to chain. A connector across the outside is a mark
on the paper.

### `HATCH.labyrinth(w, h, tone, opt?) → run[]`

Pedersen & Singh, NPAR 2006. A closed polyline under four forces — fairing toward the neighbours'
midpoint, an edge spring holding the node spacing, Brownian jitter, and repulsion from every
non-adjacent node inside a radius — resampling itself as it goes. The tone drives the repulsion
radius, so the coils crowd where the region is dark.

| `opt` | default | |
|---|---|---|
| `near` / `far` | `2.0` / `4.2` × nib/0.35 | coil spacing, dark and light |
| `iters` | `240` | |
| `cap` | `2600` | node budget. It is what stops the thing |
| `seed` | `1` | |

**It is by far the most expensive fill here** — an n-body relaxation with a neighbour query per
node per step, a few hundred milliseconds against one for the other three — and it does not hold
fine tone. What it holds is *texture*, which nothing else in this file can make.

> **Growth is an injection, and this is the part that is not obvious.** Repulsion cannot lengthen
> a small loop, because a small loop has no non-adjacent neighbours inside the radius to push
> against: leave it to the forces and the curve sits there as a circle for as long as you care to
> iterate.

> **And the injection is gated on room.** A lobe that has filled cannot take more nodes — the
> repulsion has nowhere to put them, the wall pins them, and the next injection lands on the pile.
> It knots, solid black where the coils should be, and no amount of iterating undoes it because
> the crossings are already made. Gate it and the curve grows until the region is full and stops
> on its own, which is also the only sensible definition of *full*.

> **The room test's window is along the CURVE, not in space.** A node's own near neighbours sit a
> node-spacing from the midpoint by definition; count those and every injection is refused by the
> run it is being inserted into. What the test is asking about is another *coil*.

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

**`cut` publishes its own reach as `bridge.reach`, and `stitch` reads it.** With a reach the free
ends go in a bucket grid sized to it and only the neighbours are considered; without one the
search stays exhaustive. That is not an approximation of the greedy rule, it is the same rule —
`cut` refuses every gap wider than `reach`, so a candidate outside the neighbourhood could never
have been taken however long it was looked at. It matters because the search was O(n²) per stroke
and O(n³) over a fill: fine at the two hundred runs a specimen makes, minutes at the ten thousand
a streamline fill on a big sheet makes. A bridge that walks a wall, or does anything else with no
distance bound, simply does not set `reach` and gets what it needs.

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

- **The hatch bay's `Serpentine` dial still runs its own generator** rather than this one. Two
  implementations of one idea drift apart — the same argument `KIT` exists to settle.
- **`spaceFill` shows its grid**, which is a texture and not a shading. Segerman's pinwheel curve
  over Conway pinwheel tiles is the published fix and is unbuilt.
- **Nothing here reaches one stroke on an arbitrary region.** Connected Fermat Spirals (Zhao et
  al., SIGGRAPH 2016) is the algorithm that does — decompose the region, one spiral per piece,
  joined at the boundary — and it is the largest single thing missing from this file.
- **Chaining is per pass, never across passes**, so the pen lifts at least three times on the
  ball before anything else. Joining across thresholds means drawing a connector in a region it
  does not belong to — the same objection as the wall walk, one step smaller, and untried.
- **A shaded region cannot use a wall walk at all**, because its islands are edged by an isoline
  of the tone and there is no curve to follow. Extracting that isoline (marching squares over the
  tone field) is the only route to a lower count on the ball, and it is unbuilt on purpose until
  someone decides it is worth the code.
