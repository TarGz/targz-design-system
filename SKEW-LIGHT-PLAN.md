# Skew Light — brief

A second skin for Skew: warm, matte, light. **White, beige, orange, black.**
Not a rewrite — the dark theme stays default and untouched.

Derived from nine references (`ref/ref2/`): Teenage Engineering EP-133 K.O. II,
Nothing Phone, Pioneer DDJ Off-White, Polyend-style orange/grey synth, Carl Hauser's
modular slabs, two skeuomorphic toggles, and two K.O. II-language app mockups.

**The references are evidence, not templates. Do not reproduce a layout from one.**
They were used to derive the rules below; your job is to apply the rules to Skew's
own components.

---

## How to think about this

The dark theme gets its separation from **light** — lit rims, glow, chamfers, bloom.
None of that survives on a light panel. A white rim on beige is invisible; a bloom on
white is mud. Everything below is the answer to "what separates forms when light can't".

The answer is **form, shadow, and cuts**. Which means this theme is where Skew's shadow
model either proves itself or collapses. There is nowhere to hide.

Before picking a material for any part, ask two questions in this order:

1. **What is this part made of?** Is it the panel, a thing sitting on the panel, or a
   hole in the panel? That decides the material before any colour question.
2. **What job is it doing?** A bay's colour should mean something — this group is one
   function, this is channel A not channel B. Colour that means nothing is paint.

---

## The material system

Colour attaches to the **bay**. Never the chassis, never invented per-component.

| material | role | z |
|---|---|---|
| `pale` | white — identity plates, primary-action caps, label areas | raised |
| `mid` | beige — the chassis and the default bay, the ground | flush |
| `accent` | orange — consequence; one bay per panel maximum | recessed |
| `dark` | black — display glass, dark caps, engraved legends | recessed |

**A material is a set, not a value.** Each defines five things:

```
surface        the fill
raised         what a form sitting ON it looks like (lip, shadow)
recess         what a hole IN it looks like
text           legend colour and treatment
seam           what a lit parting line in it looks like
```

Julien has deferred the exact tones. Structure it so that picking the final beige is
**one line**, not an afternoon of re-tuning every bevel. That is the main reason the
sets exist.

---

## The rules

Non-negotiable. Each has a reason attached — apply the reason to cases not listed.

**1. Accent lives in the cuts.**
On a light panel, saturated colour needs a dark neighbour to read. Seams, slots,
recessed wells, the shadowed junction under an actuator. Never on a flat lit face —
orange on lit beige goes chalky. This is why black is not optional: it is what gives
orange somewhere to sit. Confirmed independently by both toggle references and the ball.

**2. Tone-on-tone is the default.**
A control with no cap material assigned is made of **its bay's own material**. Orange
knobs on an orange plate; white knobs on a white slab. Form and shadow do the
separating. Contrast caps are the exception, reserved for the two or three genuinely
consequential keys per panel.

**3. A dark cap on a light panel needs a bright lip.**
Without it the cap and its own cast shadow merge into one blob. This is the exact
inverse of the dark theme's lit-top-edge logic. Get it wrong and every dark control
looks like a hole.

**4. Light bays are raised. Dark bays are recessed.**
Forced by physics: a bay lighter than the chassis cannot also read as a hole. `.bay`
is currently a well (`inset 0 3px 7px rgba(0,0,0,.85)`, skew.css:516). A `pale` bay
becomes a raised plate instead. Real structural fork — plan for it.

**5. Two tinted bays never share a raw edge.**
A chassis rib or a seam goes between them. Two colours butted directly reads as a flag,
not a machine.

**6. Pits and recesses survive the inversion unchanged.**
`--recess`, the dot-matrix grip, the grille, the knurl. A hole reads the same at any
panel value — dark walls, lit lower lip. **Do not re-tune these.** They are the one
family that already works.

**7. Gloss is a theme property, not a constant.**
`SPEC`/`SHINE` at skew-kit.js:4139 belong to the skin. The comment above them already
argues both sides: a tight specular suits a dark body because there is headroom to
white; a mid-value saturated body needs a broad soft sheen or the highlight arrives as
a pale smear. The light theme's orange ball is the second case. The earlier decision
was not wrong — it flips with the skin.

**8. The glass gets colours the panel does not.**
Panel is disciplined to four materials. A display is emissive and may carry blue,
magenta, green, red, white. Keep `.lcd` / `.screen` free.

**9. A display shows its whole vocabulary at all times.**
Every icon printed, most dimmed to near-invisible; state is *which are lit*. Nothing
appears or disappears. This is what makes glass read as a printed surface with lamps
behind it rather than a screen drawing widgets.

**10. Short shadows, matte throughout.**
Take the shadow discipline from the industrial references — tight contact, short
travel, low blur. The two skeuomorphic toggle refs have long soft bloom and big linear
gradients standing in for forms; that is the "sticker failure" skew.css already names.
Take their state logic, not their rendering.

---

## Build order

Each step is additive. Nothing renders differently until step 2.

**Every step ends at a review. Stop there.**

Finish a step, hand Julien a short ordered test list — what to press, what to look at,
what correct looks like versus broken — and **wait**. He is the only one who judges
anything visual; never screenshot to decide for him. When he validates it, tick the box
below and move to the next step. If he does not, fix it and hand it back. Do not run two
steps together, and do not start the next one while a review is open — a step built on
an unvalidated step is a step you will build twice.

- [ ] **1. Token layer.** The four material sets. No component touched.
- [ ] **2. Chassis and bay materials.** One demo bay in each material, side by side, so
      Julien can judge the four grounds before anything is built on them.
- [ ] **3. The leader primitive.** Highest-value single move — see below.
- [ ] **4. Caps.** Cap materials, and rule 3's bright lip.
- [ ] **5. Toggles.** Both variants — see below.
- [ ] **6. Everything else**, component by component. Each component is its own review.
- [ ] **7. The ball — LAST.** See constraints.

---

## Components

### The leader primitive — do this first

Hairline elbow leaders appear in **every one of the nine references**. `.rot-leads` /
`.rot-lead` (skew.css:3241) already does the drawing but is welded to the rotary.
Generalise it. Four positions observed:

- **bracket over a group** — label centred above, hairlines dropping to two controls
- **rotated side rail** — label at 90° beside a column, bracket wrapping it
- **full-width rail** — one label at each end, rule spanning between (`RECORD ——— UNDO`)
- **gutter dot + label** — a small LED dot and a tiny caps label below the control it
  annotates, sitting in the chassis gutter. `.pilot` + `.klab` composed.

Leader colour is semantic: neutral for a plain group, accent when the group is live.

### Toggles — two variants, chosen by density

Both already half-exist as `.slide.pill` (skew.css:1119). The mechanism is unchanged
and correct: **legends engraved into the floor at both ends, actuator covers one.**
Nothing swaps the word.

- **Floor-colour** — the well takes the whole accent. For a binary read from across the
  room: power, record-arm, a bay's master enable. One per bay.
- **Lit seam** — actuator is the object, state is a thin lit line at its edge plus a
  small wash on the floor behind. Quiet enough to repeat down a dense column.

Which one is a judgement call per component. Density decides it.

### Caps

- `light` / `dark` / `accent`, plus the default: **inherit the bay's material**.
- Dual legend: primary glyph plus a secondary below it.
- **Stacked pair** — two separate caps glued as one module, dark over light. Seven
  instances on the K.O. II alone. The live half takes the accent.
- **Split cap** — one body divided by a hairline, two labels. Distinct part.
- Legends: a control's own identity goes *inside* the cap; its shift layer goes
  *outside*, in the gutter.

### Seams

New primitive. A seam is the gap **between two parts** — one hairline dark, one
hairline light. `--groove` is a milled channel cut *into* one part. Different thing,
both needed. Seams are what make a light panel legible when the value range is tight.

### Optional, ask before building

- **Finishes** beyond matte — turned (concentric), ruled (parallel), perforated. Only
  if a part has a reason: a turned disc because it is a coil, not because it is pretty.
- **Speckle** (cork/terrazzo). Undecided. Ask Julien.
- **Screws** at plate corners (`.screw` exists), and a regulatory-microtype block.

### The ball — last, and read this first

The orbit ball is a per-pixel shaded sphere in canvas (`orbit-cv`, skew-kit.js:3800).
It needs three things and no new geometry:

1. a body colour — it becomes the accent object, the one saturated thing on the panel
2. `SPEC`/`SHINE` moved into the skin (rule 7)
3. **a bounce term.** `AMB = 0.32` is currently a flat ambient. On a light panel the
   seat is bright and must kick light back into the ball's underside. The correct model
   is already written down in this repo — `HATCH-API.md`, `KIT.scene`: *terminator
   darker than the silhouette, table bounce lifting the lower rim, occluded near the
   contact so the contact stays black.* It never made it into the canvas ball because
   the dark theme did not need it.

---

## Constraints

- **This is a skin.** A second token block plus polarity-flipped material rules. The
  dark theme is the default and must not change.
- **Respect `@layer skew`** and the reasoning in the file's opening comment.
- **Do not touch the ball or `src/skew-kit.js` until told.** Another agent is live in
  that component — the last four commits are all ball work and the file is dirty.
  Steps 1–6 collide with nothing.
- **Never invent a value.** `--primary #FF6A00` and `--bg #F5F3F0` are what the apps
  actually ship (CLAUDE.md:100). This theme should converge on them, not drift further.
- **Version bump + CHANGELOG in `version.js` on every commit.** Commit only when asked.
- **Julien tests, not you.** Never screenshot to judge. End every piece of work with a
  short ordered list: what to press, what to look at, what correct looks like versus
  broken, and the check that would prove it wrong.
- **Do not add controls or parameters nobody asked for.** Fewer knobs, better defaults.

---

## Open — Julien's calls, do not assume

- exact tones (deferred: "white, beige, orange, maybe black")
- room value — light, or a warmer mid ground with the panels floating on it
- speckle in or out
- the theme's name — `SKEW-LIGHT` is a placeholder
