# Skew v1.9.0 → v1.14.0 — what an adopting app has to pick up

**For:** any app already on Skew (`physical-ui.css` + the factories in `physical-ui-layers.html`).
**Not a code drop.** Take the parts you need; every section says what to copy, what it depends
on, and what it costs. Sections marked **BREAKING** change something you already have.

---

## Why this exists

The design system grew a compound control (the hatch bay) and, in building it, grew four
primitives and three factory APIs that had been missing. Most of what follows is those
primitives, which are useful well outside hatching.

There is also a list of **traps at the bottom** — five things that cost real time here. Read
that section even if you take none of the code.

---

## 1 · New primitives

### `.eng` — the engraved ICON  ·  *pure CSS, no dependencies*

The language had engraved **type** (`.demo-etch`) and nothing engraved that is a **shape**, so
every icon was a flat monoline glyph laid on the metal — the sticker failure the source already
names about a centred highlight.

```css
.eng{
  width:14px; height:14px; flex:0 0 14px; display:block;
  fill:none; stroke:#0d0f12; stroke-width:1.7;
  stroke-linecap:round; stroke-linejoin:round;
  filter:drop-shadow(0 1px 0 rgba(255,255,255,.11));
}
```

**The rules that matter more than the numbers:** the stroke is the panel's *shadow colour*,
never a grey and **never `currentColor`** — an engraving does not change colour when its row is
selected, because it is a hole. Shapes must be open enough that a 1px light line under them
still reads; a filled glyph engraves as a blob. On a recess floor, drop both values (less light
reaches down there).

**Cost:** one CSS rule and a parallel icon set to your existing one. Worth it if you have more
than about three icons on a machined surface.

---

### `.plate` — the first FLOATING surface  ·  *pure CSS*

Everything else in Skew is bolted into a chassis. This is the first surface that opens,
positions itself against what summoned it, and goes away. Menus, tooltips and any popup
inherit it.

A plate is the same metal as a `.box` with **two** differences, both about elevation:
a **harder and shorter** cast shadow (a plate 8mm off the panel throws a tighter shadow than a
panel 40mm off the desk), and **1px of black all the way round**, because a lifted edge has a
dark side wherever the lamp is. Same gradient, same grain, same edge highlight — it is a piece
of the same machine, held up.

**Not done, and it is the last piece:** the plate does not trap focus. Escape and click-outside
close it, Tab still walks into the page behind. Whoever needs that should build it **on
`.plate`**, not on one caller, because it sets the pattern for every floating surface after it.

---

### `.picker` + `openPicker()` — replaces `input[type=color]`  ·  *needs JS*

`input[type=color]` renders its popup in browser chrome and **no CSS reaches it**, so the one
moment a person touches a colour, a dark machined panel produces a bright OS sheet. This is not
"theme the popup" — it cannot be themed — it is replace it, keeping a hidden native input as
the form **value** so nothing downstream changes.

```js
openPicker(anchorEl, '#FF6A00', hex => { /* … */ }, swatchesOrFn)
```

| argument | |
|---|---|
| `anchor` | the element it opens against, and the one that closes it again |
| `value` | starting hex |
| `onChange` | called with a hex on every change |
| `swatches` | array **or function** returning hexes for the well; omit → accumulated recents |

Built entirely from parts you already have: the field behind the same glass as any display,
hue on a **real `.fader`** with the knurled cap and a scale at the six primaries, one lit
`.lcd` with editable R/G/B and hex instead of three white boxes, the eyedropper as a `.key`
that **removes itself** where `EyeDropper` is absent, and a well of recents built from the same
swatch object as the main rail.

**Dark on purpose:** a picker is the one place the panel must *disappear* so the colour can be
judged. Neutral metal, no coloured light from the chassis, no tint in the bezel — the only
saturated thing inside is the colour being picked. **Deliberately absent:** alpha, HSL/LAB
tabs, palette management.

**Pass `swatches` as a function** if the set can change while the plate is open — it re-reads
on every repaint instead of freezing a copy. Passing your live rail is the useful case: the
well then shows the pens you actually have rather than a seeded list that goes stale.

---

### Typeable readouts  ·  *needs JS, ~40 lines*

Every lit readout is the value of a control you can only reach by dragging, and dragging is the
wrong tool for "45" — you can find 44 and 46 all day. A knob is for **looking for** a value; a
keyboard is for **knowing** one.

```js
typeable(readoutEl, () => currentValue, v => set(v))
```

- **Double-click, not click.** A single click on a readout is what happens on the way somewhere
  else, and a field that opens by accident eats the next keystroke.
- **Units are formatting, not input.** `45`, `45°` and `1.6×` are one number; parse and let the
  control reapply its own format.
- **No I-beam on hover.** A text cursor claims it is a text field; it is a display that will
  take a value if you ask it twice.
- **Stop arrow keys reaching the control underneath**, or typing also nudges the thing the box
  reports on.
- **Write after removing the input.** `write()` repaints the readout, and a repaint with the
  input still in it leaves the field half-torn.

---

## 2 · Factory API additions  ·  **BREAKING: none — all additive**

```js
knob({ …, detents: [0, 45, 90, 135, 180] })   // NEW: snaps within 2% of the sweep
knob(…).set(v)                                 // existed
fader(…).set(v)                                // NEW
rotary(…).set(i)                               // NEW
```

`.set()` on all three exists for one reason: **a control another control has to move needs a
way in that is not "rebuild it"**. If you have tabs, presets, or an ALL mode, you need this.

Detents are the same idea the centre fader already had — an angle of 45° is a *place*, not a
value you approach, and a real panel cuts a notch so the finger finds it without the eye.

---

## 3 · Patterns worth copying even if you take no code

These are behaviour rules, not CSS. Each one was got wrong first, in the way described.

### Selection is the LAMP, and only the lamp
A rail of swatches had the selected one *bigger*, *brighter* **and** with an inverted core, on
top of the light. Each extra signal is a second thing to notice that means the thing you already
noticed — and the cost is not clutter, it is that the rail stops being a row of **like objects**.
A pen case is N identical slots; which pen is in your hand is a fact about you, not about the
slot. Say it with light and nothing else.

### Two facts need two channels
Which item you are **editing** and whether it is **active** are different questions. Running
both through one control gets both wrong: turning a thing off also means leaving it, so you
cannot see what you turned off, and coming back to look turns it on again.

> **single click = select · double click = toggle active**
> **down = what the next change reaches · lit legend = what actually gets made**

An item can be *down and dark* — editing something that will not be drawn, which is a real and
useful state — or *up and lit*.

### A struck legend, not a faded one
Dimming says "unavailable", which is usually the opposite of true: an inactive item is still
fully editable, and you often want to set one up **before** switching it on. A strike says the
name is still there and **the mark is not**. Let the line take `currentColor` so it strikes in
the lamp colour when down and in grey when up.

### An inactive block has its LAMPS out — one filter, not twenty overrides
Every lit thing means "this will be made". When it will not be, none of it is true. The lamps
are spread across knob arcs, fader fills, cap indicators, readouts and jewels, and half of them
hard-code their colour — so hunting them individually misses some and goes stale.

```css
.block.off .body > :not(.tabs){ filter:saturate(.06) brightness(.6); }
```

Take every lamp at once and leave the metal: that is what an unpowered instrument looks like.
**Keep the controls live** (editing before switching on is the whole point) and **exclude the
tab strip** — you have to be able to reach the control that turns it back on.

### A modifier lives next to what it modifies
A "follow the object" toggle that changes what an Angle knob means belongs beside that knob.
And if it **takes the value over**, disable the knob: two controls steering one value is a panel
where whichever you touched last wins and neither says so.

### Recessed vs proud is FOUR hairlines, not one shadow
Adding an inset shadow to the raised recipe gives a proud cap with a smudge on it — the eye
believes the hairlines. A recess inverts all four: hard near-black **inside** the top edge, wall
shading down from it, faint light **inside** the bottom (the wall the room actually reaches), a
lit lip **outside** below — and **no cast shadow at all**, because a hole does not throw one.

---

## 4 · Traps — read this section regardless

1. **Substring selectors.** `.pencap.on` is a substring of `.pk-well .pencap.on`. A scripted
   edit anchored on the short one sliced out an entire CSS section here, and then the
   *verification check* matched the same wrong rule and reported it fine. Anchor to line start.

2. **`background` resets `background-image`.** Restating a state's background with only the
   colour layer strips every other layer off the one element you are looking at. This file has
   been bitten twice — once erasing a knurl, once a specular.

3. **`clip-path` clips `box-shadow`.** A clipped silhouette loses its cast shadow entirely.
   Use `filter: drop-shadow()`, which follows the shape — which is what a shadow does anyway.

4. **A canvas cannot have pseudo-elements.** Any glass, dome or reflection on a `<canvas>`
   needs a wrapper div. Not obvious until the reflection silently fails to appear.

5. **Do not rebuild a list from inside an open popup's callback.** Filling an empty slot called
   the rail's redraw, which threw away every button and made new ones — *including the element
   the open picker's callback still pointed at*. Every later drag then wrote to a detached node,
   so the model and everything reading it kept up while the one thing under the cursor froze.

6. **SVG inner-group rotation needs `transform-box: view-box`** if you rotate a child rather
   than the whole `<svg>` — and rotating the whole `<svg>` rotates its *lighting* with it, which
   is why the rotary lever became a round knob: a circle has no orientation, so only the pointer
   moves and the light can stay nailed to the room.

---

## 5 · What is NOT in here

- **Nothing writes a file.** The fill generators produce plottable paths in real millimetres,
  but export is one function and a Blob and belongs to the adopting app.
- **The hatch bay itself** is a demo of a compound control, not a component to import. Take the
  primitives and the patterns; the bay is six surfaces of *this* document's making.
- **Focus trapping on `.plate`** — see §1.

---

## 6 · Suggested order

1. `.eng` — cheapest, most reusable, no dependencies.
2. `.set()` on your factories — you will need it before anything else on this list.
3. Typeable readouts — small, and the most immediately felt by anyone using the panel.
4. `.plate`, then `.picker` — the picker is the one that removes the last OS surface.
5. The selection/active patterns in §3 — no code, just decisions.
