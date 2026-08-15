# Feature requests — Skew

This file tracks what the Skew language has that its first real adoption does not.

**The adoption is `~/Documents/GIT/Portrait-Typo`** (v6.0.0, branch `main`; the paper build
it replaced is preserved on `theme-light`). Skew went in there as `assets/skew.css` plus a
material palette in `index.html`'s `:root` — the token NAMES did not change, so what those
words point at is aluminium now instead of white card and the layout survived intact.

Most of what follows is a piece of `physical-ui.css` that did **not** make that first pass,
with the reason it did not — the gap between a language and one application of it.

A few entries are the other direction: things the SYSTEM ITSELF is missing, found by trying to
adopt it. Those are tagged **`[design system]`** and are the more urgent kind, because every
future adoption pays for them again.

## How to use this file

- Add a new entry under **Open** when you find something the language has and an adoption lacks,
  or something the language should document and does not.
- Say WHY it is missing — cheap-and-skipped, needs markup, needs JS, or a whole subsystem.
  That is the field that decides what gets picked up, and it is the one that goes stale.
- Tag **`[design system]`** when the work is in this folder rather than in an adopting app.
- Remove the entry once implemented — it is recorded in `version.js` and the commit, not here.

---

## Open

### `[design system]` The machine half of 08 — built; one decision left
The serpentine is in as the second half of section 08: parallel as a control, serpentine as the
result, on the same ball and the same holed blob, with a pen-down count under each. Read the two
numbers off the panel — they move whenever the pitch or the nib does.

**Do not re-open the one that looks obvious.** A wall-walking join — route the pen along the
outline where the straight cut runs out, then carry on round the perimeter — takes the flat shape
to a single stroke. It was built, it works, and it was removed, because every trick of that kind
buys a lift with a *line*: the wall inks twice where the pen retraces it, and the closing join is
a stroke straight across the middle of the shape. **The count is not the drawing.** A serpentine
is a fill that does not lift when it does not have to, not a fill that never lifts.

**What is genuinely open:** chaining is per pass and never across passes, so the pen lifts at
least three times on the ball before anything else. Joining across thresholds means drawing a
connector in a region that is not the one it belongs to — the same objection as above, one step
smaller. **Decide whether it is the same mistake or an acceptable one**, because the answer also
settles how far any future optimiser is allowed to go.

**Not gaps, and worth not re-opening either:** nothing on the machine half is dithered and the
thresholds therefore band — that is the demonstration of why the hand half dithers. And the edge
is a hairline rather than a nib width, because an outline at pen weight is the heaviest mark on
the sheet and a specimen must not have its own annotation shouting over the thing being judged.

---

### `[design system]` The three hands — built; three decisions left
The hand half of section 08 (v1.10.0) draws **hand hatching**, **hand cross hatching** and **hand random
lines**, each on two specimens: the ball (tone) and a flat blob (boundary). All of it is
geometry in millimetres at 1:1 and goes straight out to SVG. What is left is not build work —
it is three decisions, and each one is cheap to make and expensive to make twice.

- **The bay's `Hand hatched` position is now superseded and still on the dial.** These three
  exist because that one does not get the vibe: breaking the register makes a fill look
  *noisy*, and noisy is not hand-made. So the rotary has four positions of which one is known
  wrong. **Decide:** retire it and put the three hands on the dial (seven positions, which is
  a lot for one switch), or keep the machine four on the bay and give the hands a switch of
  their own. Nothing else in the bay changes either way.
- **Which constants become knobs.** Every hand is currently a hard-coded table: pitch, the
  four tone thresholds, the angle drift per pass, the jitter fraction (0.34 of pitch), the
  end over/undershoot, the re-grip length (17mm). Some of those are the *definition* of the
  type and must not be exposed — the four thresholds are what "four passes" means. Some are
  genuinely per-drawing: **pitch** certainly, **jitter** probably, **nothing else obviously**.
  The block ships with no controls on purpose, so this is still an open hand.
- **Nothing writes a file.** The paths are plottable and the units are right, but there is no
  export. That is one function and a Blob, and it is deliberately not in the design system —
  it belongs to whichever app adopts this. Recorded so it is not mistaken for done.

**Settled here, and worth not re-litigating:** the specimen glass drops `.screen`'s scanline
haze and keeps only its reflection. The haze is a 1-in-3px horizontal rule and a hatch is a
rule every few tenths; they beat, and the moire lands on the exact property being judged.

---

### `[design system]` The hatch bay — two pieces still outstanding
The bay is built (v1.9.0): specimen at 1:1 mm on toned stock, a rotary type selector with four
hatch types, three independent knobs (pen over the kit, spacing, angle with detents), pen-cap
colour with two refillable slots on the new `.picker`, `.bay-cap` + `.jewel`, the two cleanup
thresholds in a recess, and **`.eng`** — the engraved icon primitive, which was the part of
this entry that mattered beyond hatching and is now available to every label row.

Flooding is a *result*, not a warning, so nothing reports it — the strokes overlap into solid
ink on their own and the specimen shows it like it shows everything else. Pen and spacing are
**independent**: an earlier build had the pen drag spacing to hold a nib ratio, which means one
control silently edits another, so a value you set by hand stops being the value you set.

**Two sub-items from the original spec were deliberately not built, and both want a decision
rather than a build:**

- **The demoted free `Pen (mm)` fader**, "for the pens that are not in the kit". Left out
  because the turret's whole argument is that a nib is one of six objects — putting a
  continuous fader beside it hands back the 0.43 the turret exists to refuse. If the kit is
  genuinely incomplete the fix is a longer kit, not a second control. **Decide which.**
- **Engraved graduations on the angle knob's collar.** `.knob-collar` is currently bare. This
  is a change to the SHARED knob, not to the bay — every knob in the language would get them,
  or none would, and at 42px the graduations and the pointer are close to the same spatial
  frequency that already cost the chevron its knurl. **Wants one decision for all knobs.**

**Also settled here, and only here:** the specimen is DOM, not canvas — hatch is literally
parallel lines, so it is a `repeating-linear-gradient` and takes `::before`/`::after` glass for
free. That is an exception argued from the subject, **not** an answer to the canvas question at
the foot of this file. The gizmo and the screen are still open.

---

### `[design system]` The colour picker — built; one sub-item left
Built in v1.9.0 as **`.picker`**, and as a primitive rather than a part of the bay that
prompted it: `openPicker(anchor, value, onChange)` is called by the hatch bay's refillable pens
and, separately, by its own Materials tile — two unrelated callers, which is what makes it a
primitive and not a panel feature.

Everything the original entry asked for is in: the floating plate, the field behind the same
glass as any other display, hue as a real `.fader` with the knurled cap and a scale at the six
primaries, one lit `.lcd` window with editable R/G/B and hex instead of three white boxes, the
eyedropper as a `.key` that hides itself where `EyeDropper` does not exist, a pen well of
recents built from the same `.pencap` the ink rail uses, dark by default, and none of the alpha
/ HSL / LAB / palette-management that was listed as not wanted.

**It also produced `.plate`**, which was the reusable half: the language's first surface that
is not bolted into a chassis. Same metal as a `.box`, harder and shorter cast shadow, 1px black
all the way round. Menus, tooltips and the rotary's own popup inherit it now.

**What is left:** the entry asked for a surface that "traps focus". It closes on Escape and on
a click outside, and it takes focus on open, but Tab still walks out of the plate into the page
behind it. That is the last piece, and it is the one that decides the pattern for every future
floating surface — so it wants doing once, properly, on `.plate` rather than on `.picker`.

---

### The specular sweep on every chassis
`.dock::after` — one soft diagonal band, high-left, matching the room light. The source file's
note is *"Never centred: a centred highlight reads as a sticker."*

**Why it is missing:** the adoption spent its one available pseudo-element on the grain and the
brushed striation, and never found a second. **Pure CSS**, no markup: the band can fold into the
panel's own `background-image` alongside the gradient it already carries.

**Why it matters:** this is the cheapest item on the list and the one that most changes whether a
panel reads as metal at all. Do this first.

---

### The light pipe's hot core
`.pipe::after` — a blurred white line up the middle of the layer bar, where the LED is brightest.

**Why it is missing:** the adoption draws the pipe as the row's own `::before` so that `ui.js`
would not have to change (`--lyr` is already set per row), and a pseudo-element cannot have a
child of its own. What is there is an approximation — `inset 0 0 3px rgba(255,255,255,.55)` —
which is flatter than the real thing.

**Cost:** one span per row in `buildDock`, or a second gradient stop layered into the pipe's fill.

---

### `.bay-cap` — a heading with a hairline running out of it
A caption over a bay, with `::after { flex: 1; height: 1px }` doing the separating that a gap
cannot. **Pure CSS.** The adoption's section heads (`.led-sec`, `.mp-head`) are bare text.

---

### `.lens` — the lamp jewel inside an illuminated key
`.act.go .lens`, `.act.halt .lens`, `.act.fire .lens`: a small glowing jewel INSIDE the cap, to
the left of the label, the way a real illuminated pushbutton is built.

**Why it is missing:** needs one `<span>` inside each button. The adoption has the illuminated
key's *alloy* (Compute, Render, Settle) and not its lamp.

---

### `.screw` — four countersunk corner screws
Each a pit plus a domed head, at the same inset, with the slot at a different angle on each —
*"nobody torques four screws to the same angle"*. The source calls it *"the cheapest single
detail that says this is an object."*

**Why it is missing:** four elements per chassis, and the adoption has eleven chassis. Wants one
helper in `ui.js` rather than eleven hand-written sets.

---

### `.screen::after` — glass over the reference image
One diagonal reflection plus a scanline haze, so a photograph on a metal panel reads as a
DISPLAY rather than a picture stuck on.

**Why it is missing, and it is a hard block:** every image surface in the adoption is a
`<canvas>`, and **a canvas is a replaced element — `::before` and `::after` never render on
it**. The glass needs a wrapper div around each canvas, which is a change to `ui.js`. The
adoption has the parts that work without one: dark ground, hairline bezel, a slight contrast
lift.

**Worth knowing before adopting Skew anywhere else:** any app whose images are canvases pays
this cost. It is not obvious until the reflection silently fails to appear.

---

### `.fticks` — the engraved scale under a fader
Ticks at 0 · ¼ · ½ · ¾ · 1, below the cap's travel rather than under it (*"a 24px cap on a 26px
slot covers its own ticks"*). The source is explicit that ticks are *"the reason a fader can be
a fader instead of a bar with a lump"*.

**Why it is missing:** a bare `<input type="range">` has nowhere to put them. Needs a wrapper
per slider — **and it was never in front of anyone**, because at the time of the adoption the
fader had no Materials tile. *That half is fixed:* the system now ships four live fader tiles
(one cap, centre detent, vertical bank, range) built by the same `fader()` / `rangeFader()`
factories, so the scale, the trace and the band are visible primitives rather than comments.
This entry, `.ffill` and `.ffill.band` are one root cause and it is now an adoption debt only.

---

### `.grip` — the knurled drag handle
Dotted, bottom-right, exactly where the shipping card has it.

**Why it is missing:** overlooked. The adoption's layer stack IS draggable, by either header,
and shows nothing at all that says so — which is the specific problem this element solves.

---

### `.ffill` — the lit trace in the fader slot
The part of the slot that is below the value, glowing onto the metal around it.

**Why it is missing:** **needs JS.** A native range input cannot paint its own fill; the value
has to be written to a custom property on `input`. Today the slot is dark along its whole length
and only the cap's indicator line carries the value.

---

### `.ffill.band` — the hatched band between two caps
*"THE BAND between two caps is a PIECE, not a fill that starts late. A fine hatch is what says
so — the same reason the caps are knurled."*

**Why it is missing:** needs JS and a second thumb.

**Why it is the most valuable item on this list for Portrait-Typo specifically:** that app's
panel is full of genuine RANGES — `Size min`/`Size max`, `Zone from`/`Zone to` — and this is the
only element in the language that draws a range as one object. It is also the reason the
adoption kept faders instead of taking the knobs: a range is a LENGTH and a length is compared
by eye along a line. Having made that argument, it then failed to draw the band the argument was
for.

---

### `.engage` — the surge when a toggle goes IN
Distinct from `.key.flash`, and the source explains why a second animation was written for it
and then thrown away: *"a momentary key's pulse reports an event, a toggle's reports that a
circuit has just closed and is now staying closed."* Same keyframe shape, different resting
place — the momentary key settles back to its raised shadow, the toggle settles into the recess.

**Why it is missing:** needs a class added on change. **Needs JS.**

---

### `.key.flash` — the momentary pulse, as a real one-shot
**Why it is missing:** the adoption approximated it with a CSS `:active` animation, which fires
*while the key is held* rather than once on actuation. That is a different behaviour, not a
cheaper spelling of the same one.

---

### Rotary knobs
`.knob` + `.knob-collar` + `.knob-ring` (an SVG stroke, deliberately, because a conic-gradient
arc aliases at three boundaries) + `.knob-cap` + the pointer.

**Why it is missing, and this entry is the one to read carefully:** the adoption argued that a
range with two ends you compare still wants a track — which is the source file's own position,
stated under `.fader` — and then **skipped knobs everywhere, including on the single-value
controls the argument never covered.** `Ground (mm)`, `Tolerance`, `Attempts`, `Tone gamma`,
`Count`, `Release height` and `Face the camera` are all single values, all turnable, and all
still sliders. The rejection was narrower than the omission.

---

### The rotary selector
`.rotary`, `.rot-knob`, `.tear`, `.rot-seat`, `.rot-leads`, `.rot-lab` — a `<select>` replaced by
a switch with a detent pip per position and a leader line out to each name. *"A `<select>` is a
list that hides. A selector switch shows every position at once and points at the one you are
on."*

**Why it is missing:** a whole subsystem, and it needs JS. In Portrait-Typo it would cover
`Place from`, `Size from`, `Gravity`, `View from` and `Font`.

---

### The boss / the bulge
`.box.bulge`, `.bulge-wrap`, the generated `clip-path`. The panel's silhouette growing out to
meet a switch body deeper than the case — *"one surface with a bump in it"*, not a disc laid on
a box.

**Depends on the rotary selector** — it exists to house one, and there is nothing to house
without it. Needs JS to generate the clip-path from measured layout, and the drop shadow has to
move to a wrapper because filters apply before clipping.

---

### The tool palette as its own object
`.palette` — Pan / Turn / Select on a narrow movable strip of their own, on the argument that
everything in a viewport panel answers WHERE THE CAMERA IS while these three answer WHAT THE
MOUSE DOES, *"which stays true while you are not looking at the viewport at all. Two different
questions do not share a chassis."*

**Why it is missing:** this is a **UX change, not a skin.** In Portrait-Typo the three tools are
a segmented control inside the viewport panel. Adopting it means moving a control, which is a
decision about the app rather than about its material — flagged here so it is chosen rather than
absorbed.

---

### A DOM gizmo
`.gz-arm`, `.gz-node`, `.gz-hub` under a glass dome — arms as lit spokes, nodes as jewels.

**Why it is missing:** the adoption's gizmo is a `<canvas>`, so it got a machined socket and the
axis ball is still drawn in 2D by `ui.js` (dished face, engraved graticule, lamp indicator —
`PAD`/`padDish`/`padEngrave`). The dome is the same canvas-has-no-pseudo-elements block as the
screen glass.

**Open question worth deciding once:** whether Skew's answer for a canvas instrument is *wrap it
and dress the wrapper* or *rebuild it in DOM*. The screen glass, the gizmo and the two pads all
hang on that one answer, and right now each was solved separately.

---

## Not wanted

### The bright skin — DECLINED
`[data-skin="light"]`, ~295 lines, plus `.skin-switch`. Skew in pale anodised aluminium.

**Decided against, 2026-08-15.** Portrait-Typo stripped light mode rather than making it
switchable — the paper build is archived on the `theme-light` branch at v5.0.0 and the app ships
one material. A second skin is not wanted in an adoption that deliberately has one.

Recorded rather than deleted, because it is the kind of thing that gets proposed again: the
bright skin is **not** the paper build in different clothes, and the two sound identical when
someone says "the light one". If a pale metal is ever actually wanted, the argument for it
starts here, not from scratch.

---

## In Progress

*(nothing)*

---

## Notes for the agent

- Check this file before starting any work on Skew or on an app that has adopted it.
- Do not remove an entry without confirming the implementation in the adopting app.
- The **why it is missing** field is the useful half. If you implement something, delete the
  entry; if you discover the reason was wrong, correct it rather than deleting it.
- Two blocks recur and are worth recognising early: **a canvas cannot have pseudo-elements**,
  and **a native range input cannot paint its own fill**. Between them they account for the
  screen glass, the gizmo dome, the fader ticks, the trace and the band.
- **A SKIN MAY SET THE MATERIAL, NEVER THE STATE.** This is the one lesson worth keeping out of
  the declined bright-skin entry, because it is not about light mode at all — it is about
  specificity, and it is the trap this language walks into. `[data-skin=light] .sw` out-ranks
  `.sw.on`, so a material rule that also sets a shadow or a colour silently un-presses and
  un-lights the whole panel; the source file says it learned this three times. Anything a STATE
  owns is scoped away with `:not()` or restated at the skin's own specificity.

  The first adoption hit the same class of failure twice without ever writing a skin selector:
  seven `:disabled:hover { background:#fff }` rules at (0,3,0) out-ranked every `:disabled` rule
  the theme could write at (0,2,0), so a dead Compute turned white under the pointer; and a
  `:hover` using the `background` SHORTHAND reset `background-image`, erasing the knurl on the
  one control whose whole point is that it looks like something you flick. **Before overriding a
  base rule, check what the ORIGINAL stylesheet says about that element's states** — that is the
  general form, and it costs one grep.
- Findings from the first adoption that belong to the LANGUAGE rather than to this list are in
  `Portrait-Typo/CLAUDE.md` under "SKEW" — in particular that `position: relative` does not add
  to `fixed` but replaces it, which cost that app its entire layout for one round.
