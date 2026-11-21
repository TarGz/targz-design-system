# Porting Skew

Two documents in one, both answering questions a token manifest cannot.

1. **What the four unportable parts are**, written as anatomy rather than as CSS — because
   `--recess` and `--chamfer` already exist a second time in Rust as painter code, and the
   translation was done by eye.
2. **Rulings on the orphan values** — every colour an app invented because this system did not
   have one. System or app, one line each.

---

## Part one — the four that cannot be shared as values

`egui` has no inset box-shadow, no CSS gradient, no text-shadow and no filter. The characteristic
parts of this language are built out of exactly those four things, so they are already two
implementations: a declaration here, and procedural drawing in
`Terminass/src/theme.rs:215-228, 274-305, 321-328, 331-342`.

The manifest emits their **numbers** — shadow layers, gradient stops. What it cannot emit is
**why those numbers**, which is the half that keeps a reimplementation from drifting.

### The invariant that governs all four

**There is one lamp and it is above and to the left.** Every lit edge in this language faces it;
every dark edge faces away. A part that is lit on two opposite edges has no light source and reads
as a sticker.

`targz-launchpad2/src/theme.rs:147-182` states the consequence better than this repo does, so it
is quoted as the rule:

> **the lit rim must die out across the part.** A rim drawn as a straight line of constant alpha
> along the top is wrong, because `inset 0 1px 0` does not do that — it follows the border radius
> into the corner and fades as the surface turns away from the lamp. A straight line cannot bend
> into the corner the way the inset does, so the Rust version has to attenuate by angle or the
> corner lights up where the CSS one goes dark.

### 1. `--recess` — a hole, nine layers

What it is: the four walls of a cut, seen from above, with the near wall closest to the lamp
casting across the floor.

Anatomy, top to bottom, which is the order the layers are written in:

1. A hard 1px line all the way round at 73% black — the lip, where the surface stops.
2. A tight dark band under the **top** edge only (`0 2.4px 1.2px`, 86%) — the near wall's shadow
   falling on the floor. This is the layer that says *hole* rather than *dark patch*; remove it and
   the recess becomes a fill.
3. A softer spread of the same (`0 3.6px 4.8px -1.2px`, 51%).
4. and 5. The two **side** walls, mirrored (`±3.6px 0`, 57%). Equal, because the lamp is above and
   neither side is nearer it.
6. The **far** wall, weakest of the four (`0 -3.6px 4.8px -2.4px`, 31%) — it faces the lamp, so it
   catches light the other three do not.
7. A 1px white line along the **bottom** inside edge at 15% — the far wall coming back up to the
   surface.
8. and 9. Outside the box: a 1px solid and a 1px soft, which is the surface's own edge sitting
   proud of what is around it.

**Port:** six rectangles or lines plus two outside. The thing to get right is the *asymmetry* —
top strong, sides equal, bottom weak, plus the white return. Four equal walls read as a frame.

**In the light skin** the same shape runs at roughly a sixth of the alpha, because the floor is
cream and the walls are cream. The structure does not change; only the contrast does.

### 2. `--chamfer` — a broken edge, concave

What it is: the bevel round a cutout, as a 152° gradient across the part.

**The polarity is the whole thing and it is the opposite of a bump.** Dark at the top where the
chamfer turns *away* from the lamp; bright at the bottom where it turns *into* it. Get it the
right way round and the part reads as a hole with a broken edge. Get it backwards and it reads as
a dome, every time, and no amount of tuning the alphas rescues it.

Stops: 50% black at 0%, 20% black at 24%, transparent white at 50%, 30% white at 100%.

**Port:** `Terminass/src/theme.rs:274-305` draws it arc by arc with trigonometry, which is correct
and is the reference. The angle is 152°, not 135° — it is not a diagonal, it is a lamp position.

### 3. The LCD glow — `text-shadow: 0 0 6px`

What it is: a lit readout seen through glass. The glow is **not** a style on the text; it is light
leaving the segment and hitting the inside of the cover.

**Port:** `Terminass/src/theme.rs:321-328` draws the string four times at small offsets under the
real one. That is the right approach — a blur over a whole panel costs more than the effect is
worth, and four offsets at low alpha is indistinguishable at this size.

**In the light skin this part does not exist.** A readout on cream is e-paper: matte, absolutely no
bloom, dark ink on warm grey. If a Rust app takes the light palette, the glow routine is skipped,
not re-coloured — a pale glow on a pale ground is a smudge.

### 4. The unlit jewel — `filter: grayscale(1) brightness(.42)`

What it is: a lamp with no current in it. Not a grey dot — *the same lamp, dark*, which is why it
is a filter over the lit colour rather than a second colour.

**Port:** `Terminass/src/theme.rs:331-342` takes the luminance and divides by three, which is the
same statement in a different arithmetic and is correct.

### And `--grain`, which neither Rust app has

A 1.4KB inline SVG turbulence filter, laid over every metal surface at 5% in overlay blend. The
note in this file says a gradient with no grain reads as plastic within about two seconds.

**Is its absence over there a gap or is it correct?** It is a **gap**, and a small one. The two
Rust apps are the only ungrained surfaces in the family and they do read flatter than the web ones
side by side. But it is the lowest-value item on this page: it costs a texture upload and a shader
or a tiled mesh in egui, for an effect measured at 5% alpha. Record it, do not schedule it.

---

## Part two — rulings on the orphan values

Every value below is a colour an app invented because this system did not have one. The question
for each is only: **is this the system's or the app's?**

### System — adopted, and now in `:root`

| Value | Was | Now |
|---|---|---|
| `#2DD4BF` + ramp | launchpad2's Launch key, stock Tailwind teal | `--ok` / `--ok-bg` / `--ok-edge` / `--ok-ink` |
| `#C2410C` + ramp | launchpad2's Stop key, stock Tailwind orange | `--no` / `--no-bg` / `--no-edge` / `--no-ink` |
| `#22C55E` / `#EF4444` + bg + border | the styleguide, via `pc-tokens.css` | the same four names, light values |

The running colour had two answers. **Teal wins over Terminass's `#7CFFB0`**, because `#7CFFB0` is
what a *lit readout* is made of — a system where "the number is showing" and "the process is alive"
share a colour can say neither.

### System — but not decided here

**`--info` in dark.** No app has one. Picking a blue that reads on a near-black panel with nothing
to check it against is the guess this whole pass exists to stop making. Light has `--info`; dark
does not, and the manifest emits `None` for it rather than a default.

### System — a categorical ramp, and it is one set, not three

Three apps each needed **a ramp of visually distinct identity colours**, and each invented its own:

- `HOST_COLORS` ×6 and `LOCAL_TAB_COLORS` ×12 — `Terminass/src/theme.rs:55-78`
- `STROKE_LAYER_COLORS` ×6 — `TargzPenPlotterCtrl/app/js/stroke-select.js:797`

These are the same requirement: *tell these N things apart, where N is not known in advance and
the things have no inherent colour.* A layer is not red because it is hot; it is red because it is
not the blue one.

**Ruling: system, as one ramp, not yet built.** It needs to be ordered so the first six are maximally
separable, extend to twelve without a reshuffle, and hold up in both skins — which is real work and
is not a value to paste in. Named here so three apps stop each inventing a fourth.

### App — not the system's

| Value | Where | Why |
|---|---|---|
| `--pc-axis-x/y/z/a` `#EF4444 #22C55E #0015FF #FF6A00` | `pc-tokens.css:24-27` | **X red, Y green, Z blue** is a CNC convention, not a design decision. It belongs to any app that has axes and to no app that does not. *But `--cd-axis-*` disagrees with `--pc-axis-*` inside the same app, and that is a bug in that app.* |
| `#C99A5B` folder accent | `targz-launchpad2/src/theme.rs:28` | One app, one concept. A design system with a "folder colour" has decided every app has folders. |
| `#2a1a10` selected row | `Terminass/src/theme.rs` | "the bay lit faintly by the LED" — a derived value, `--led` at very low alpha over the row. The *rule* is the system's and is already written; this particular mix is the app's. |
| `#303244` pane divider | `Terminass/src/app.rs:2334` | Used once, nowhere else. Should be `--case-lo`; it is an orphan because it was typed rather than reached for. |
| `#3a6b52` / `#3b5b8c` / `#1f4e8c` | `Terminass/src/app.rs:866, 982, 2429` | Three inline one-offs. Same answer: not values, oversights. |

### Drifted — same intent, different number

`targz-launchpad2` is the drifted one on all four; Terminass matches this file exactly.

| | launchpad2 | Skew | Ruling |
|---|---|---|---|
| text primary | `#e3e6eb` | `--txt #d3d6dc` | **Skew.** |
| text dim | `#7e838d` | `--txt-dim #7d828c` | **Skew.** |
| page | `#000000` | `--room #0b0b0d` | **Skew.** Pure black is not a surface; it is the absence of one, and nothing can be recessed into it. |
| UI font | Helvetica Neue | `--font-ui` | **Skew.** |

**The grid is three answers and stays three.** 15px `#7FB2E5` here, 24px white every fifth there,
32px at alpha 9 in the third. A grid's pitch is a property of **what is being drawn on it** — a
plotter's millimetres, a canvas's pixels, a terminal's cells — and a design system that fixes it
has decided what every app is for. **App, deliberately.** The grid's *ink* could be a token; its
pitch cannot.
