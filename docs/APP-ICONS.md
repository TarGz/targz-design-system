# App icons

The rule for every Targz app icon on the dock. It is not a style I chose — it
is `Terminass/assets/icon.svg` written down, because that one was already right
and the other two were approximations of it.

Written *after* the three marks were drawn, not before. The first version of
this file invented rules ahead of the work — "never filled", one stroke weight
for everything — and those rules produced a set so safe it had to be thrown
away. What follows is what the three icons actually do.

---

## The plate — full bleed

```xml
<svg width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="229" fill="url(#g)"/>
```

**What macOS 26 puts a white plate behind is the MARGIN, not the curve.** A
100px inset leaves a band of nothing around the art and the system fills it —
which is exactly the bug that was filed against these icons after the first
version of this file told everyone to draw them that way.

So the inset goes, the drop shadow goes (the system draws its own) and the white
rim goes (it sat on the edge a mask eats). **The corner stays**, at `rx=229` —
22.37% of 1024, the radius macOS masks with. Drawn at full size the two agree:
there is no band for a plate, and if the system does not mask, the curve is
ours. A plain square would have neither.

So everything the system supplies comes out:

| was | now |
|---|---|
| `x=100 y=100 w=824 h=824` | the whole 1024 |
| `rx=185.4` on the 824 box | `rx=229` on the full 1024 — the same 22.37%, at canvas size |
| `feDropShadow dy=20 stdDeviation=15` | nothing — the system shadows |
| a white rim at 20%, 4 wide | nothing — it sat on the edge the mask eats |

**The mark grows with the plate.** It used to be measured against the 824 box,
so it is scaled by `1024/824` about the centre and keeps the size it had
relative to its ground:

```xml
<g transform="translate(512,512) scale(1.24272) translate(-512,-512)">
```

This is the macOS 26 contract, not a style — but the corner is drawn rather
than assumed, so the file is right whether or not the system masks it.

---

## The fill — one plate, every app

```xml
<linearGradient id="g" gradientUnits="userSpaceOnUse"
                x1="0" y1="0" x2="1024" y2="1024">
  <stop offset="0" stop-color="#ffda6b"/>
  <stop offset="1" stop-color="#de920d"/>
</linearGradient>
```

The diagonal, never straight down: a vertical ramp reads as a cylinder, the
diagonal reads as a flat plate lit from up and to the left, which is where every
other light in this system comes from.

**Every app gets the same one, and the mark does the telling apart.** An earlier
draft gave each app its own step along a warm family — orange, mid, amber — and
three steps of one hue at dock size are not three colours, they are three
near-misses of the same colour. One plate reads as a suite, and then the drawing
has to do its own work instead of leaning on a tint.

`gradientUnits="userSpaceOnUse"` is not optional. Without it the ramp is
relative to whatever shape fills with it, so a small shape — a hole in a knob, a
counter in a letter — samples the whole ramp inside itself and comes out a
different colour from the plate behind it. In user space every shape samples the
one ramp, and a hole is invisible because it *is* the plate.

---

## The mark

**White, and that is the only rule about how it is made.**

The three in the set are built three different ways and all three are right:

| app | mark | how it is made |
|---|---|---|
| Targz Launchpad | three sheets, leaning | solid masses, no stroke |
| Terminass | `>_` | stroked, 62, round caps and joins |
| Pen Plotter Control | a marker tip | solid masses, corners radiused by a stroke of their own ink |

What they share is **finish**, not construction:

- **No sharp vertices.** A needle-pointed triangle beside a 185px squircle is
  the single thing that reads as unfinished, and nothing else in this system
  has a sharp corner in it. A polygon gets its corners by being filled *and*
  stroked in its own ink with `stroke-linejoin="round"` — which radiuses every
  vertex by half the stroke and grows the shape by the same, so draw the source
  path inset.
- **A hole is the plate.** Fill it with `url(#g)`, which under
  `userSpaceOnUse` is exactly the plate behind it.
- **Roughly x 300–724, y 330–694** — about 420 square, centred on 512. The
  margin is not decoration: at 32px the plate's corners eat the outer sixth.
- **Off-level beats square.** The plotter's barrel is twelve off the
  horizontal. A shape perfectly square to the frame reads as a diagram.

### What the mark is *of*

Not the app's category — the app's one verb, or the one object it holds.

The plotter is the worked example. It shipped a fader bank inherited from the
CNC app it was forked from, which describes a mixer. A spiral was tried next
and was worse, because it claimed "one line, never lifted" while the app's own
words are *"pen-up, travel, pump dip, dwell, pen-down"*. What it actually holds
is a marker — the PUMP dips *below* pen-down to re-prime, and only an ink-fed
tip needs that. The tip is the mark.

### Redrawing an existing mark

**Don't.** If a mark only exists as a PNG, trace it — three attempts at copying
the launchpad's sheets by eye produced three worse drawings:

```bash
magick icon.png -resize 2048x2048 -background black -alpha remove \
  -colorspace gray -threshold 80% -negate glyph.pbm
potrace glyph.pbm -s --flat -o glyph.svg
```

potrace emits `transform="translate(0,H) scale(0.1,-0.1)"` on its group; wrap
that in `scale(0.5)` to land in the 1024 canvas.

---

## The file

One `icon.svg` per app, in the app's own repo, 1024×1024. The PNG and the
`.icns` are built from it and are not edited by hand — if a corner is wrong, it
is wrong in the SVG. `scratchpad/icons/build_icons.sh` is the build; it renders
the 1024 master with `qlmanage` because `rsvg-convert` is not installed, then
`sips` + `iconutil` for the rest.

Where each app wants them:

| app | png | icns |
|---|---|---|
| Targz Launchpad | `icon.png` | `icon.icns` |
| Terminass | `assets/icon.png` | `assets/Terminass.icns` |
| Pen Plotter Control | `app/icon.png`, `build/icon.png` | `build/icon.icns` |

---

## Checking one

At 32px, with the others beside it:

1. Is there any white between the icon and its neighbours? Then something in
   the file is still drawing a margin, a corner or a shadow that macOS wants to
   draw itself.
2. Cover the other two. Is the mark still about *this* app?
3. Does any vertex look sharp?
4. Does the mark sit at the same scale as its neighbours', or is one of them
   still measured against the old 824 box?
