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

### `[design system]` The ink swatch as a glass capsule, filled or empty
The rail's swatches are modelled squircle caps today — a coloured face that goes down and lights
when it is the one in use. The request is to make them **little glass capsules** instead, at the
same rendering quality the panel's other glass has, and to use **how full they are** as the state:
a capsule with ink in it is a pen you own, a half-filled one and an empty one say the rest.

**Why it is not just a reskin.** The rail currently carries three facts — which pen is selected,
which slots have ink, which are empty — and it says them with three different devices: the seated
state, the coloured face, and the milled well. A capsule that is full / half / empty folds the
second and third into one reading, which is better, but it has to keep saying the first, and a
glass tube's "selected" cannot be the recess-and-lamp the squircle uses without looking like a
capsule pressed into the panel edge-on.

**Prior art in this repo, and it is worth reading before starting.** Three swatch objects were
built and rejected before the squircle: a pen cap (read as a battery), a technical nib (read as a
marker tip), and a glass pipette (read correctly as a pipette and was still wrong). The failure
was the same each time — each got better at being a *picture of a thing on the desk* and none got
better at being a *control*: you could not tell at a glance which one was selected, the colour
fought a silhouette for attention, and at swatch size the depicted object was unreadable. Any
capsule attempt has to answer that, not just look good enlarged.

**What was learned about drawing glass here** (from the pipette): the ink is a CORE, not a skin —
a lit glass wall is the brightest thing on the object, so the edges go bright and the colour sits
inside; the meniscus must be a CURVE, because flat reads as a painted stripe; and the specular
runs the full height because it is on the outside and does not care where the liquid stops. Those
three are the difference between glass and a coloured lozenge.

**Open question the request has to settle:** what half-full *means*. Right now a slot is binary —
it has ink or it does not. A three-state capsule needs a third fact to carry, and if there is not
one, half-full is decoration.

---

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

- ~~The bay's machine-made `Hand hatched` position~~ — **settled (v1.12.0).** It was retired
  and the three hands went onto the dial in its place: six positions, not seven, because the
  one that was known wrong left rather than sitting there. Breaking the register makes a fill
  look *noisy*, and noisy is not hand-made.
- **Which constants become knobs — half settled.** Pitch and angle are exposed: the bay's
  Spacing and Angle knobs reach the hands, and they work because 08 writes every hand against
  a BASE — each pitch a multiple of it, each pass angle an offset — so the character lives in
  the relationships and the base is only where they are anchored. Moving the anchor is a
  parameter; moving the relationships would be a different drawing. **Still open:** the jitter
  fraction (0.34 of pitch), the end over/undershoot and the re-grip length (17mm). The four
  tone thresholds are the *definition* of "four passes" and must not be exposed. One known
  dead end: `hand random` has no register to rotate, so Angle goes quiet on that position.
- **Nothing writes a file.** The paths are plottable and the units are right, but there is no
  export. That is one function and a Blob, and it is deliberately not in the design system —
  it belongs to whichever app adopts this. Recorded so it is not mistaken for done.

**Settled here, and worth not re-litigating:** the specimen glass drops `.screen`'s scanline
haze and keeps only its reflection. The haze is a 1-in-3px horizontal rule and a hatch is a
rule every few tenths; they beat, and the moire lands on the exact property being judged.

---

### `[design system]` The hatch bay — built; one decision left
The bay is built and has outgrown the entry that asked for it. It now carries a **tab strip of
six surfaces**, each with its own hatch state; a **rotary selector with six fills** — three
machine (parallel, crossed, serpentine) and section 08's three hands, borrowed rather than
reimplemented; **three independent knobs** (pen continuous 0.1–3 mm, spacing, angle with
detents); a **follow-the-object** toggle that changes what the angle knob measures against; a
rail of **nine refillable ink slots** on `.picker`; **two specimens** side by side — the ball
for tone, the blob for boundary, both from the shared `KIT`; the two cleanup thresholds in a
recess; and **`.eng`**, the engraved icon primitive, which was the part of this entry that
mattered beyond hatching and is available to every label row.

**Settled, and worth not re-opening:**

- Flooding is a *result*, not a warning. Nothing reports it; the strokes overlap into solid ink
  on their own and the specimen shows it like it shows everything else.
- Pen and spacing are **independent**. An earlier build had the pen drag spacing to hold a nib
  ratio, which means one control silently edits another — so a value you set by hand stops
  being the value you set.
- Pen is **continuous**, not a kit of six. This closed the old "demoted free Pen (mm) fader"
  sub-item: a kit is the right model for choosing a pen off a shelf and the wrong one for
  dialling a line until it looks right, which is what having a specimen in front of you is for.
- Selecting a surface and **drawing** it are two facts, so they get two gestures: click selects,
  double-click toggles drawn. Down is what the next change reaches; a lit legend is what gets
  plotted, and a tab can be either without the other.
- The specimens are **SVG geometry in millimetres**, not gradients — four of the six fills are
  paths that no gradient can express. Still DOM rather than canvas, so the glass is free. That
  is an exception argued from the subject, **not** an answer to the canvas question at the foot
  of this file.

**What is left, and it is one decision for the whole language:** engraved graduations on
`.knob-collar`. It is bare on every value knob. The rotary's own cap got a knurled collar in
v1.13.0 and it reads well, which is a precedent but not a ruling — every knob gets them or none
do, and at 44px graduations and a pointer are close to the same spatial frequency that already
cost the chevron its knurl.

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

<!-- ── FROM THE PORTRAIT-RIBBONS ADOPTION, 2026-08-17 ────────────────
     Everything from here to "## Not wanted" was found by BUILDING against the
     kit rather than by reading it: Portrait-Ribbons replaced Tweakpane with Skew
     (133 parameters, 20 bays, 6 panels) and these are the parts the language did
     not have when the panel needed them. Each says what the app shipped instead,
     so promoting one means deleting that code rather than guessing at a spec.
     ──────────────────────── -->

### `[design system]` A BODY THAT SCROLLS — the first thing a real app hits
Every `.box` in the language is sized to its contents, because every panel the language
was grown on is a dozen controls at a fixed size. Portrait-Ribbons is **133 bound
parameters across 20 bays in 6 panels**, and the tallest is several times any window.

**Why it is not a one-liner in the adopting app.** It nearly is, and that is the problem:
the obvious `overflow-y:auto` goes on the `.box`, which scrolls the `.box-head` off the
top — and the head is the only thing saying which panel you are in once six of them
exist. It has to go on `.box-body`, with `min-height:0` on the box, and then the browser
scrollbar is the same intrusion `input[type=color]` was: an OS surface on a machined
panel. Ribbons ships `.sp-scroll` — body-only, `overscroll-behavior:contain`, and a
milled channel with a bevelled thumb in place of the OS bar. That is 20 lines that every
adopter will write, slightly differently, until the language has them.

**The related decision the language has not made:** density. 133 knobs at 46px is not a
panel, it is a wall. The five knob layouts (SYSTEM 05) are the start of the answer and
they stop at five variants of one control; there is no guidance on what a bay of twelve
numbers should look like, and Ribbons guessed (`knobs()` puts up to three on a
`.knobrow`, everything else stacks).

---

### `[design system]` A GATED BAY DOES NOT DIM
`toggle` gives a bay its gate — "Weave crossings" over a clearance and a minimum angle — and
when the gate is off the two knobs below it stay at full brightness and stay draggable. The
panel goes on offering a clearance to a weave that is not running.

**Why it is not built.** No app dims one today, and SYSTEM 06 states the placement rule (the
gate is first in the bay, under the cap, above what it governs) while declining this half of
it in the open. A rule the documentation states and the language does not implement is drift
wearing a hat, so it is filed rather than quietly half-shipped.

**What it needs deciding first.** Whether a gated control is *dimmed* (still readable, still
tells you what the bay will do when you turn it on) or *disabled* (unreachable). Ribbons wants
the first: the knobs are how you decide whether to turn the gate on at all.

---

### `[design system]` A SWATCH FOR `openPicker` TO OPEN AGAINST
`openPicker(anchor, value, onChange, swatches)` takes an anchor and the language does not
provide one. The hatch bay's pen caps are the only callers today and they are pen caps —
a `.pencap` is a specific object with a specific meaning, not the general "here is a
colour, press it to change it" the argument list implies.

Ribbons has **five** colours (ribbon, shading, infill, drop shadow, preview ground) and
none of them is a pen in a case. It ships `.sp-swatch`: a lit chip in a milled well, the
ink read as a CORE through the cutout rather than as a painted face, which is what stops
it reading as a sticker on the panel. Small, obvious, and the fifth app will write it
again.

---

### `[design system]` A KEY THAT CARRIES A WORD
`.key` is cut for a 14px icon. Ribbons needs `GENERATE`, `BAKE`, `CLEAR`, `LOAD`, `SAVE`,
`RESET EDITS` — commands with no glyph and no room for one — and had to add tracking, a
font size and a min-width to make a legend sit in a key without looking like a mistake.

**Why this is not "just use `.pkey`".** A pkey is a piano key: latching, and its bar holds
one down at a time. These are momentary commands that spring back. The two are different
controls and the word-carrying one does not exist.

---

### `[design system]` THE MENU — `.plate` is the surface and there is no mechanism
Eight of the nine Portrait apps have an icon-only top bar with hover dropdowns, `<kbd>`
shortcut hints and separators. `.plate`'s own documentation says "menus, tooltips and any
popup inherit it" — the SURFACE is there and nothing else is: no open/close, no Escape,
no click-outside, no focus trap, no keyboard walk. `navBar` is a piano of destinations,
which is a different object.

Ribbons' nav bar is therefore a **reskin, not an adoption** — its own markup, its own
open/close, wearing the kit's tokens. That is stated plainly in `assets/skew.css` under a
`§ CHROME` heading precisely so it can be deleted when this exists. It is the single
biggest piece of the language that a Portrait app cannot use.

---

### `[design system]` THE ASSET ROW — load a file and say what is loaded
Load button, hidden `<input type=file>`, a name readout, a source readout, a disable
toggle. Ribbons has this **three times over**, one per map slot, and eight of the nine
apps have at least one. Grep the system for `type=file` and it returns nothing.

**Why it is a part and not a molecule the app should compose.** The disable toggle is the
`select ≠ active` pattern the language already argues for in prose (§3, "Two facts need
two channels"): a slot you have loaded an image into but switched off is a real and useful
state, and every app currently gets it slightly wrong in its own way.

---

### `[design system]` THE RENDER OVERLAY — a blocking layer with a cancel route
All nine apps have one and all nine drew it themselves. A message, a progress track, and a
way out ("Press Space to cancel"). The job meter (MACHINE 07) is the closest part and it is
a *segmented meter on a panel*, not a modal — grep for "modal", "overlay" and "toast" in
the system and all three return nothing.

This is the one gap where the apps are not merely re-composing: they are each inventing a
blocking-interaction pattern, which is the kind of thing a language exists to settle once.

---

### `[design system]` RULERS AND ZOOM, at page scale rather than control scale
Four apps (Typo, Y, Cubes, ribbons) draw millimetre rulers around the paper; three have
zoom controls. `.fticks` is the engraved scale under a fader and is the only ruler-shaped
thing in the language. Zero mentions of "ruler" or "zoom" anywhere.

Lower priority than the four above — a ruler is genuinely app-specific in a way a menu is
not — but worth recording, because the *engraved tick* is a language decision and four
apps are currently making it separately.

---

### `[design system]` CORRECTION — `GAP-ANALYSIS.md` is wrong about `.set()`
`GAP-ANALYSIS.md` (2026-08-17) says, under "The structural gap": *"`knob` has `.set(v)`,
Typo added `rangeFader.set(x, y)`, and `fader`, `rotary` and `drum` still have none. That
is the same hole four times."* It then makes taking `.set()` upstream **item 1** of "what
I would do next".

**SETTLED AT v1.26.0, and both halves of the argument were half right.** Checked factory by
factory against `skew-kit.js`:

| Factory | `.set()` | at v1.25.0 |
|---|---|---|
| `knob` | `wrap.set = nv => set(nv, true)` | had it |
| `fader` | `row.set = x => set(x, true)` | had it |
| `rotary` | `row.set = n => { … paint(); }` | had it |
| `drum` | `bay.set = n => { … paint(); }` | had it |
| `rangeFader` | `row.set = (x, y) => { … paint(); }` | **did not** |

So the correction was right that four of five already had the handle, and wrong that the
fifth did: the `row.set = x => set(x, true)` it attributed to `rangeFader` is the line
inside `fader`, one factory further down. A grep for `row.set` returns both and the two
factories are adjacent, which is how the reading happened.

The gap analysis was right that a hole existed and wrong about its size — one factory, not
four. Portrait-Typo had already written the method for itself, which is the one place an
adoption was ahead of the language, and v1.26.0 takes it upstream with the two arguments
this entry asked about: a span is two numbers, and the far cap is clamped by `MIN_SPAN` the
same way a drag clamps it, so a stored pair that crossed cannot put the control in a state
a hand could not reach.

Nothing left open. Kept as a record because the underlying claim is load-bearing:
Portrait-ribbons built its config-load path on `.set()` existing on everything.

---

### `[design system]` `windowise` SHOULD DEFINE WHERE A WINDOW'S POSITION LIVES

`windowise` moves a window, folds it, and brings it to the front. It forgets all three the
moment the page reloads, and it says nothing about whose job remembering is. Two apps have
now answered that question independently and arrived at the same answer, which is the
signal that it belongs in the language rather than in each of them.

**Portrait-Typo** stores panel position in `localStorage`, per page, and states the rule in
its own notes: *"where you put a panel is not part of the piece"* — a file arriving from
somebody else and landing your panels in a corner you did not choose is the same fault as
one arriving with a fold closed. A saved drop is a pile and its settings, not a desk.

**Portrait-Ribbons** got it wrong first, wrote the layout into the config, and shipped a
config load that rearranged your room. It now matches Typo: `localStorage`, per page,
keyed by window title.

**What the request actually is.** Not necessarily code — a RULE, and then optionally the
code. The rule is the valuable half and it is one line:

> A window's position, its reduced state and which page it was on are properties of the
> DESK. They belong in `localStorage` and never in a document, a param or a saved file.

**And if it does become code**, three things both apps had to work out separately:

1. **`reset()` before restoring.** `windowise` keeps `dx`/`dy` in a closure and exposes only
   `reset()` and `rest()`. Setting `style.transform` alone moves the element while the
   factory still believes it is elsewhere, so the *next* drag jumps by the difference. There
   is no way to write a position through the public API without this dance — which is
   itself an argument for `windowise` owning it.
2. **Key by title, not index.** An index renumbers the moment a window is added and silently
   moves everybody's layout by one.
3. **Per page.** Both apps landed here for the same reason: the pages are different jobs,
   and the corner that is free while you look at the sheet is the corner you need while
   painting a map.

**A way back is required, not optional.** A window dragged mostly off-screen has no handle
left to grab, and folding does not help — the head goes with it. Ribbons added a tidy key to
its bottom bar; Typo resets on a double-click of the header. Whichever it is, `windowise`
producing a state a user cannot get out of is the part that should not be left to adopters.

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
