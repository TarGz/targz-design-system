# Parity with the web kit

What the stylesheet and `skew-kit.js` have, what this crate has, and what is
left. **The web side is the source.** A part is not finished here until it is
drawn from `src/skew.css`, `src/skew-machine.css` or `skew-kit.js` rather than
from an app's copy of it, and nothing goes in that is not already in a real app
(`CLAUDE.md`: never invent a value).

Status: **done** · **partial** — drawn, but a state or a skin is missing ·
**open** — not started.

## The controls

| Part | Web | Crate | |
|---|---|---|---|
| key | `.key`, `skew-kit.js` `key()` | `key`, `paint_key`, `KeyState` | **done** — raised / hover / pressed / disabled / latched |
| interlocked bar | `.piano`, `.pkey` | `pkey_bar`, `paint_pkey_down` | **done** — the latch is a well, not a lit cap |
| toggle key | `.chip`, `toggle()` | `btn` | **done** |
| action key | `.act`, `.act.halt` | `colored_btn` | **done** |
| fader, vertical | `fader()` | `fader`, `paint_fader` | **done** — live value, commit on release |
| fader, range | `rangeFader()` | — | **open** |
| knob | `knob()` | — | **open** — the biggest single gap |
| rotary | `rotary()` | — | **open** |
| drum | `drum()` | — | **open** |
| switch | `swBtn()` | — | **open** |
| picker | `openPicker()` | — | **open** |
| select | `.sel`, `selector()` | `sel`, `paint_sel`, `paint_sel_list` | **face done** — the plate is `paint_sel_list`, a painter: a live popup is an overlay the host drives |
| field + action | `.slotrow` | `slot_row` | **done** — one row, one height; the key is beside the well, never in it |
| settings form row | `.frow`, `.frow-lab`, `.frow-body` | `frow`, `FROW_LAB_W` | **done** |

## The surfaces

| Part | Web | Crate | |
|---|---|---|---|
| panel | `.box`, `.box-head`, `.box-body` | `panel` | **done** |
| group bezel | `--surround` | `bezel_frame`, `bezel_edges` | **done** |
| recess, light | `--recess` light | `well_frame`, `well_shadow` | **done** |
| recess, dark | `--recess` dark, nine layers | — | **open** — `docs/PORTING.md` §1 has the anatomy |
| chamfer | `--chamfer`, 152° | — | **open** — §2; the polarity is the whole thing |
| grain | `--grain` | — | **open** — §4, recorded, not scheduled |
| card shadow | `--shadow-card` / `-md` / `-lg` | in `panel` only | **partial** |
| window, drawer, modal, menu | `.win`, `.drawer`, `.modal`, `.menu`, `windowise()` | — | **open** |

## The readouts

| Part | Web | Crate | |
|---|---|---|---|
| lit window | `.lcd`, `.readout`, `.kval` | `lcd`, `paint_lcd` | **done** — glass, edge light, ceiling |
| LCD glow, dark | `text-shadow 0 0 6px` | — | **open** — §3; light skips it on purpose |
| engraved caption | `.cut` | `cut` | **done** |
| bay cap | `.bay-cap` | `section` | **done** |
| field label | `.klab` and family | `label` | **done** |
| jewel, pilot, lamp | `.jewel`, `.pilot`, `.pilot.on` | `paint_lens`, `Lens` | **partial** — the lamp is drawn lit and unlit; `.jewel`'s own glass bead is not, and the unlit one is a filter (§4) |
| the sentence under a control | `.hint`, `.hint.ok`, `.hint.no` | `hint`, `Tone` | **done** |
| status line | `.statline`, `.stat-cap` | `statline` | **done** — lamp, caption, three tones |
| progress | `.meter` | — | **open** |
| console | `.con-log` | — | **open** |
| toast | the log as an event | — | **open** |

## The machine

| Part | Web | Crate | |
|---|---|---|---|
| DRO | `.dro` | `dro` | **done** — travel scale, live state, SET 0 |
| jog pad | `.jog-grid`, `.jog-home` | `jog_pad` | **done** |
| stick | `.stick` | — | **open** — stays dark in the light skin |
| pen bank | `.penbank` | — | **open** |
| run bank + guard | `.runbank` | — | **open** |
| e-stop | `.estop` | — | **open** — red and domed in every skin |
| annunciator | `.annun` | — | **open** |
| tape | `.tape` | — | **open** |
| rail | `.rail` | — | **open** |

## The chrome

| Part | Web | Crate | |
|---|---|---|---|
| nav bar | `.strip.nav-strip`, `docs/skew-nav.js` | `nav_bar`, `Nav`, `NavHit` | **done** |
| app dock | `.navdock` §09 | — | **open** |
| settings drawer | `.drawer` | — | **open** |
| tab strip | `.hb-tabs` | — | **open** — `pkey_bar` is most of it |
| tab bar | `.tabbar`, `.tab`, `.tab-ico`, `.tab-nm`, `.tab-x`, `.tabpane` | `tabbar`, `paint_tab`, `paint_tab_ledge`, `paint_tabpane`, `Tab`, `TabKind`, `TAB_H`, `TAB_H_OFF`, `TABBAR_H` | **done** — the cut is the mechanism in both: the bar overlaps the pane by a pixel and the open tab lays the pane's own fill back across the overlap, so the baseline runs past every closed folder and stops dead at the open one. The open face is FLAT, because a moulding running on into the pane would draw the seam the part exists to have none of. The ledge is `grid_shapes` at the ledge's own origin, which is what `background-attachment:fixed` does on the sheet. **Painted together, posed together:** the bar cannot be shown without its pane, so both posed strips in the gallery draw a stub of pane under the ledge |
| vertical nav rail | `.rail`, `.rail-item`, `.rail-nm` | `rail`, `paint_rail_item`, `RailItem` | **done** — the selected row is a cut, not a cap |
| form field | `.field`, `.field.sm` | — | **open** — a cut with ink in it, no phosphor. `.slot` is the FILTER field and is not this |
| quiet danger key | `.act.quiet` | — | **open** — the only key in the sheet with no moulding, and that absence IS the state. `.act.halt` is the E-stop and is not this |
| inline form row | `.frow.inline` | — | **open** — `frow` with the 150px gutter collapsed to the word |
| identity swatches | `.swatches`, `.swatch`, `--id-1`…`--id-12` | `pal.id_1`…`id_12` | **open** — the CONTROL is unported; the RAMP is in `tokens.rs`, twelve fields, one value in both skins |
| local / remote mark | `ICON.server` | `Icon::Server` | **done** — the one mark in the set drawn rather than lifted. `Icon::Term` was already the local half |

---

## Adding a part

The shape every part here already has, and the reason for each half:

1. **`paint_x(painter, theme, rect, …, state)`** — the drawing, no interaction,
   no allocation. A gallery can pose a state no pointer is producing, which is
   the only way to get all of a part's states on screen at once.
2. **`x(ui, theme, …) -> Response`** — allocate, sense, derive the state from
   the `Response`, call `paint_x`.
3. **A `XState` enum** when there is more than hover and press.
4. **Every number carries the rule it came from**, as the comment beside it —
   the CSS declaration, or the `version.js` entry that argued it.
5. **An entry in `examples/gallery.rs`**, in every state.
6. **A row in this table.**

Colours come from `Theme`, never from a literal, with two exceptions already in
the tree and both documented where they sit: `Theme::key_lit`, and the fader's
own hardware (a black rod and a dark ridged cap take no skin).
