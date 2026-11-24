# App icons

The rule for every Targz app icon on the dock. It is not a style I chose — it
is `Terminass/assets/icon.svg` written down, because that one was already right
and the other two were approximations of it.

Written *after* the three marks were drawn, not before. The first version of
this file invented rules ahead of the work — "never filled", one stroke weight
for everything — and those rules produced a set so safe it had to be thrown
away. What follows is what the three icons actually do.

---

## The plate

One rounded square, on the 1024 canvas Apple asks for, inset so the shadow has
somewhere to fall:

```
x=100  y=100  w=824  h=824  rx=185.4
```

`rx` is **22.5% of the width**. That is the figure, not a look: below about 20%
the corner reads as a square with the edges knocked off, above about 25% it
starts to read as a pill, and the macOS squircle sits in between. Every icon
uses the same one, so a row of them shares a silhouette.

**It is inset by 100 on every side.** The 824 box is the icon; the 100 of
margin is where the shadow goes. An icon drawn edge to edge has to have its
shadow clipped, and a clipped shadow is a grey line.

---

## The fill — one plate, every app

```xml
<linearGradient id="g" gradientUnits="userSpaceOnUse"
                x1="100" y1="100" x2="924" y2="924">
  <stop offset="0" stop-color="#ffda6b"/>
  <stop offset="1" stop-color="#de920d"/>
</linearGradient>
```

The diagonal, never straight down: a vertical ramp reads as a cylinder, the
diagonal reads as a flat plate lit from up and to the left, which is where
every other light in this system comes from.

**Every app gets the same one, and the mark does the telling apart.** The
earlier draft of this file gave each app its own step along a warm family —
orange, mid, amber — and three steps of one hue at dock size are not three
colours, they are three near-misses of the same colour. One plate reads as a
suite, and then the drawing has to do its own work instead of leaning on a
tint. If a drawing only works because its plate is a different orange from the
one next to it, the drawing is not finished.

`gradientUnits="userSpaceOnUse"` is not optional. Without it the ramp is
relative to whatever shape fills with it, so a small shape — a hole in a knob,
a counter in a letter — samples the whole ramp inside itself and comes out a
different colour from the plate behind it. In user space every shape samples
the one ramp, and a hole is invisible because it *is* the plate.

---

## The shadow and the rim

```xml
<filter id="s" x="-20%" y="-20%" width="140%" height="140%">
  <feDropShadow dx="0" dy="20" stdDeviation="15" flood-opacity="0.3"/>
</filter>
```

Straight down, never offset sideways. The filter region has to be grown or the
blur is cut off at the edge of the box.

Then the same rounded rect again, no fill, `stroke="#ffffff"
stroke-opacity="0.20" stroke-width="4"`. It is one line and it does most of the
work: without it the plate ends at the dock background with nothing happening.
White at a fifth, not a lighter version of the hue — a hue-tinted rim reads as
a border, a white one reads as light.

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

1. Is the silhouette the same as its neighbours? If one corner looks tighter,
   `rx` is not 22.5%.
2. Cover the other two. Is the mark still about *this* app?
3. Is the lit top edge there?
4. Does any vertex look sharp?
