# Skew light mode → three apps: alignment study

A read-only study of the WIP light skin on `skew-light-v2` against **targz-launchpad2**,
**Terminass** and **TargzPenPlotterCtrl**, and the two prompts that come out of it.

**The reframe.** Two of the three apps are Rust egui and cannot load CSS at all; the third's
markup shares no class names with Skew. All three adopt **by values, not by stylesheet**. On top
of that, Skew has no spacing, type, control-height, z-index or motion tokens — and every app
invented its own.

Nothing in this document has been implemented. It is the brief for the work on this branch.

---

## Context

The WIP light skin is `skew-light-v2` (`.claude/worktrees/skew-light-v2`, 212 `[data-skin="light"]`
rules in an 8682-line `src/skew.css`). `worktree-skew-light-buttons` (1.138.0, 2026-08-28, 86 light
rules) is a separate, unmerged earlier attempt; `skew-daylight` is a stale wip. This study reads v2
only.

---

## Finding 1 — two of three apps cannot load CSS

| App | Stack | Loads skew.css? | Current skin |
|---|---|---|---|
| targz-launchpad2 | Rust, eframe/egui 0.29 — 2711 lines, no HTML/CSS/DOM | No | dark only, hard-locked |
| Terminass | Rust, eframe/egui 0.29 + vt100 + ssh2 — 7450 lines | No | dark only, hard-locked |
| TargzPenPlotterCtrl | Electron 23 (OpenBuilds CONTROL fork), jQuery + Metro4 | technically yes, see verdict | already light |

Both Rust apps have already adopted Skew dark by hand-transcribing hex into `src/theme.rs`,
independently of each other, and both have drifted:

- `targz-launchpad2/src/theme.rs:1-3` — "Skew (targz-design-system) dark palette… Every colour
  comes from skew.css"
- `Terminass/src/theme.rs:8-27` — every const carries its CSS token name in a trailing comment
  (`// --room`, `// --case`, `// .key color`)

So "deploy the light mode" means, for two of three apps, **re-transcribing ~45 values into Rust by
hand, twice, with nothing keeping them in sync.**

---

## Finding 2 — the app that can take the CSS has a better token file than the design system

`TargzPenPlotterCtrl/app/css/pc-tokens.css` is 123 lines, 79 definitions, covering colour, spacing,
type scale, leading, tracking, weights, radii, shadows, motion, control heights, z-index and a focus
ring. `app/js/theme.js:4` says the dark paths were removed and the UI is warm-light.

Skew light has 45 tokens and none of the non-colour scales:

| | spacing | type scale | control heights | z-index | motion | tracking/leading/weight | focus ring |
|---|---|---|---|---|---|---|---|
| pc-tokens.css | 8 steps | 6 steps | 24/32/40 | 7 levels | 2 | yes | `--pc-focus-ring` |
| Skew `:root` (dark) | — | — | — | — | — | — | — |
| Skew `[data-skin=light]` | — | — | — | — | — | — | — |

Grep returns **0** in `src/skew.css` for `--*space*`, `--*size*`, `--z-*`, `--control-*`,
`--tracking*`, `--leading*`, `--weight*`, `--transition*`, `--ease*`, `--dur*`.

All three apps therefore invented their own:

- **targz-launchpad2** — 6 layout consts (`ui.rs:12-17`) + inline magic numbers; 10 ad-hoc type
  sizes, no scale constant
- **Terminass** — 2 spacing values + ~40 hard-coded offsets; 3 type sizes; etched letter-spacing
  passed per call site (0.12 / 0.14 / 0.16 / 0.2 / 0.22)
- **TargzPenPlotterCtrl** — the complete scale above, which the Command Deck then ignores

---

## Blockers

### B1. Electron 23 cannot parse 67 declarations in skew.css

`TargzPenPlotterCtrl/package.json:11` pins `"electron": "^23.1.1"` → Electron 23 → Chromium 110.
`color-mix()` landed in Chromium 111. v2's `src/skew.css` uses `color-mix(` **67 times**. Those
declarations are invalid and dropped silently, per-property. No lockfile and no `node_modules`
present, so the pin is the only evidence.

### B2. `dist/` is stale on v2 — an app copying it today gets no light skin

`node tools/build-dist.mjs` reports all three files drift. `README.md` says "dist/ is the only
folder an app touches."

### B3. The display font silently vanishes on adoption

`src/skew.css:15-24` loads Silkscreen from `fonts/…woff2` by relative path.
`tools/build-dist.mjs` never mentions `fonts/` (0 hits) and `dist/` holds only three files. Every
app that follows the README loses `--font-read`'s pixels and falls back to system mono, **with no
error**.

The plotter app has the mirror bug: Inter via a network `@import` from rsms.me
(`pc-tokens.css:5`), and JetBrains Mono named in two tokens but never bundled and with no
`@font-face` — while the whole DRO and jog pad are set in it.

### B4. The plotter parts are not shipped and have no light skin

`src/skew-machine.css` (1008 lines) holds exactly what a plotter UI needs — `.dro`, `.dro-num`,
`.estop`, `.jog-k`, `.jog-grid`, `.jog-home`, `.stick-*`, `.penbank`, `.penrow`, `.annun`,
`.runbank`, `.ovrcol`. It has **110 literal hex colours, 0 `[data-skin]` rules**, and is not in
`dist/`. `docs/skew-nextdraw.css` (106 literal colours, 0 skin rules) draws the same family again
as a mockup.

The plotter app rebuilt all of it: `.cd-jog-grid` 4×3 of 46px with `.cd-jog-btn` (21 CSS rules),
`.cd-axis-value` (7 rules, click-to-edit DRO), `.cd-vslider` ×3 override faders, `.cd-btn-abort`,
`.cd-state-dot`, `.cd-progress-*`.

### B5. Token names collide with the styleguide every app was built against

`_targz-launchpad/theme/STYLEGUIDE.md` publishes a copy-paste `:root`. `pc-tokens.css` follows it
almost exactly. The light skin renames all of it and revalues two:

| Styleguide / pc-tokens | Skew light | |
|---|---|---|
| `--bg` #F5F3F0 | `--paper` #F1EEE9 | renamed and revalued |
| `--surface` #FFFFFF | `--card` #FCFBF9 | renamed and revalued |
| `--border` / `--border-light` | `--edge` / `--edge-soft` | renamed |
| `--text` / `-secondary` / `-tertiary` | `--ink` / `--ink-2` / `--ink-3` | renamed |
| `--green` / `--red` / `--blue` | `--ok` / `--no` / `--info` | renamed |
| `--radius` / `-sm` / `-pill` | `--r` / `--r-sm` / `--r-pill` | renamed |
| `--shadow-*` (cast) | `--shadow-*` (inset bevel) | **same names, opposite behaviour** |
| `--green-bg --green-border --red-bg --red-border --shadow-sm` | absent | the styleguide's own Launch/Stop variants are defined in terms of these |

An app already on those names gets nothing from skew.css **and sees no error**.

---

## Gaps, by bucket

### A. Values the apps needed that Skew has never had

Zero hits in `src/skew.css` for any of these.

| Value(s) | Where | What it is | Apps |
|---|---|---|---|
| the non-colour scales | `pc-tokens.css:74-122`; reinvented in both Rust apps | see Finding 2 | 3/3 |
| `#22C55E #F0FDF4 #BBF7D0` / `#EF4444 #FEF2F2 #FECACA` | `pc-tokens.css:15-21`; styleguide | success / danger as fill + bg + border | 2 |
| `#5EEAD4 #2DD4BF #0F766E #115E59 #134E4A #CCFBF1 #042F2E` | `targz-launchpad2/src/theme.rs:23-24` + Launch key ramp | running / alive. Stock Tailwind teal, imported because Skew has no success colour | 1 |
| `#9A3412 #7C2D12 #C2410C #FFEDD5 #FF8E3A` | targz-launchpad2 Stop key ramp | stock Tailwind orange, same reason | 1 |
| `--pc-axis-x/y/z/a` `#EF4444 #22C55E #0015FF #FF6A00` | `pc-tokens.css:24-27`; `--cd-axis-*` disagrees | per-axis colour on the DRO and jog pad | 1 |
| `#C99A5B` | `targz-launchpad2/src/theme.rs:28` (FOLDER_TEXT) | brass folder accent | 1 |
| `#2a1a10` | `Terminass/src/theme.rs` (ROW_SELECTED) | "the bay lit faintly by the LED" | 1 |
| `#7CFFB0` as semantic OK | `Terminass/src/theme.rs` (OK = LCD_TXT) | the LCD green doing duty as success | 1 |
| `#303244` | `Terminass/src/app.rs:2334` | orphan — SFTP pane divider | 1 |
| `#3a6b52 #3b5b8c #1f4e8c` | `Terminass/src/app.rs:866, 982, 2429` | inline one-offs | 1 |
| 6× HOST_COLORS, 12× LOCAL_TAB_COLORS | `Terminass/src/theme.rs:55-78` | per-identity tab colours | 1 |
| STROKE_LAYER_COLORS — 6 normalised triplets | `TargzPenPlotterCtrl/app/js/stroke-select.js:797` | drives both the WebGL meshes and the `.cd-layer-swatch` chips | 1 |

The two most semantically loaded controls in launchpad2 — the **Launch** and **Stop** keys — were
invented locally from Tailwind because dark `:root` carries only `--led`, `--led-hot`, `--led-red`.
The light skin adds `--ok` / `--no` / `--info` / `--ok-ink` / `--no-ink`, the right shape, but dark
still has none, so the two skins and the two apps still disagree.

### B. Drifted values — same intent, different number

| | targz-launchpad2 | Terminass | Skew |
|---|---|---|---|
| text primary | `#e3e6eb` | `#d3d6dc` ✓ | `--txt #d3d6dc` |
| text dim | `#7e838d` | `#7d828c` ✓ | `--txt-dim #7d828c` |
| page / room | `#000000` | `#0b0b0d` ✓ | `--room #0b0b0d` |
| UI font | Helvetica Neue | system | `--font-ui -apple-system` |
| grid | 24px, white, every 5th | 32px, alpha 9 | `--grid-pitch 15px`, `--grid-ink #7FB2E5` |

launchpad2 is the drifted one on all five; Terminass matches on colour and diverges on grid. Three
apps, three grids.

**Radii are a fourth answer, and the design system is the worst offender.** `--r`/`--r-sm`/`--r-pill`
exist only inside `[data-skin="light"]` — dark `:root` has no radius token at all. And
`src/skew.css` writes raw radii far more often than it reads its own token: 7px ×18, 4px ×17,
8px ×14, 6px ×14, 3px ×13, 5px ×8, 12px ×7, 9px ×5, 14px ×5, 10px ×5 — against `var(--r-sm)` ×7,
with `--r-sm` set to 10px while `.key` is 7px. Terminass hard-codes KEY_RADIUS 7.0 /
MODULE_RADIUS 11.0 / LCD_RADIUS 5.0; launchpad2 R_CARD 16.0 / R_SM 7.0; the plotter ignores its own
8–18px scale in favour of 2–4px (3px ×28, 4px ×25, 2px ×10).

### C. Parts that stay dark when `data-skin` flips

193 of 331 classes have a light rule. Ranked by whether one of these three apps actually uses the
part — the repo's own rule is "if a component is not in a real app, it does not belong here."

| Part | literal colours | light rules | app counterpart |
|---|---|---|---|
| `.meter` | 12 | 1 of 6 | `.cd-progress-track/-fill/-pct` |
| `.prog-cap` / `.prog-nm` | 1 / 1 | 0 / 1 of 2 | same |
| all of `src/skew-machine.css` | 110 | 0 | `.cd-jog-grid`, `.cd-axis-value`, `.cd-vslider`, `.cd-btn-abort`, `.cd-state-dot` |

Not used by any of the three apps, so out of scope under that rule, recorded only so nobody
re-derives the list: `.gate-lever`/`.gate-slot` (15/7 literal colours), `.lens` (15), `.orbit` (12),
`.tone` (7), `.stamp` (6), `.sliders` (6), `.rot-seat` (5), `.drum-item` (4), `.tok` (3).
`docs/skew-nextdraw.css` is a mockup sheet and should stay dark.

### D. What the Rust side cannot consume even as values

egui has no inset shadow, no CSS gradient and no text-shadow. The characteristic Skew parts are
already two parallel implementations:

| Skew | Rust |
|---|---|
| `--recess` (9-layer box-shadow) | `Terminass/src/theme.rs:215-228` — procedural lines |
| `--chamfer` (152° gradient) | `Terminass/src/theme.rs:274-305` — trig, arc by arc |
| `.lcd{text-shadow:0 0 6px}` | `Terminass/src/theme.rs:321-328` — 4 offset text draws |
| `filter:grayscale(1) brightness(.42)` | `Terminass/src/theme.rs:331-342` — luminance ÷ 3 |
| any gradient | hand-built triangle meshes (`vgrad`, `gradient`) |
| `--grain` SVG noise | nothing. Both Rust apps are ungrained. |

These transfer as **documented intent**, not values. `targz-launchpad2/src/theme.rs:147-182` has
the best statement of the invariant anywhere in the four repos — that the lit rim must die out
across the part because the one lamp is above-left.

### E. Accessibility — Skew is ahead, and none of it crossed over

Skew has 5 `prefers-reduced-motion` blocks, 12 `:focus-visible` rules, a `--ring-r` token, and
`aria-` used 77 times in `skew-kit.js`.

- **targz-launchpad2** — focus rings on 2 of ~40 controls. All 40 painted keys are Tab-reachable
  (`Sense::click()` sets `focusable: true`) and show nothing when focused.
- **Terminass** — no focus rings at all; Tab is actively intercepted (`app.rs:2775-2800`).
- **Both Rust apps** — AccessKit is live via eframe defaults, but every custom part draws with
  `Painter::text`, which emits no accessibility node. The whole custom-widget layer is invisible to
  VoiceOver.
- **TargzPenPlotterCtrl** — defines `--pc-focus-ring` and consumes it twice, against 19
  `outline:none`. 17 `:focus-visible` vs 33 plain `:focus`. 16 `aria-*` and 2 real `role=` in 2270
  lines of markup + 14k lines of JS. `.cd-state-dot` conveys run/pause/alarm **by colour alone** —
  safety-relevant on a machine that moves.
- **Reduced motion** — neither Rust app checks it; the plotter has one block covering its one
  `@keyframes` and ignores every transition.

**Contrast** — the light skin already solved a bug the plotter still has. Skew light demoted
`--ink-3 #9B9B9B` to "MARKS ONLY — rules, ticks, leaders" with the ratios worked out in the comment
(2.69:1 on card, 2.40:1 on page). `--cd-text-faint #A89E87` on white computes to ≈2.7:1 — below AA
— and is the default colour of `.cd-axis-value`, the 22px DRO. Same mistake, already diagnosed
upstream.

### F. What the system should not own

Terminass bundles 956 iTerm2 schemes and a separate `Palette{bg,fg,cursor,selection,ansi[16]}`
(`src/themes.rs`), stating the rule at `theme.rs:4-5`: "the chrome is metal; the paper is not."
`skew.css:174`'s own `.sheet` rule already settles it — "a theme that tints the thing being drawn
is a theme that lies about the drawing." Same for the plotter's three.js toolpath colours
(`app/js/theme.js:31-61`, normalised 0–1 vertex colours, plus a `DRAWN_COLOR` grey that must not be
black because black already means *excluded by you* rather than *drawn by the machine*). One line
in the README. No work.

---

## Per-app verdict — how to apply the style

**All three: tokens, not the stylesheet.** That is the study's conclusion, and it makes the token
manifest (prompt item 2) the single adoption path.

**targz-launchpad2** — generated tokens. 15 colour consts + 2 radii is the whole token layer;
~60 distinct hex literals and 57 inline alphas bypass it. No light mode (`MECHANICS.md`: "Light
mode: not built yet (request: dark only first)"). Needs the running and stop ramps as real Skew
tokens before a light skin means anything.

**Terminass** — generated tokens. Hard-locks dark at `theme.rs:91-93`
(`ctx.set_theme(egui::Theme::Dark)`), so a light skin is a code change, not a config one. Its port
is the faithful one and is the reference for what the generated Rust should contain.

**TargzPenPlotterCtrl** — generated tokens too, **not** skew.css, even though it is the one app that
could load it. Three reasons, all from its own code:

1. Its markup is `.cd-*` + Metro4. No Skew class name matches it, so every component rule in
   skew.css would match nothing. The only rules that would land are the element-level ones —
   `*{box-sizing:border-box}`, `html,body{margin:0}`, `body{background:…}` — which fight Metro4
   rather than restyle anything.
2. `@layer skew` loses to its unlayered rules **by design**, which is the feature, not a bug.
3. B1: 67 `color-mix()` declarations drop on Chromium 110 anyway.

So adoption here means replacing `pc-tokens.css`'s values with generated ones and keeping the
`.cd-*`/`--pc-*` markup — plus shipping `skew-machine.css` if the jog pad and DRO are ever to come
from the system instead of being rebuilt. Rewriting the markup to Skew class names is a separate,
much larger job and is not what this study recommends.

Worth knowing before touching it: the app carries **two competing palettes with zero shared
values** — `--pc-*` (79 tokens, styleguide-aligned, accent #FF6A00) and `--cd-*` (20 tokens, warm
cream, accent #EA580C) — both live inside `commanddeck.css`, which references `var(--cd-` 477 times
and `var(--pc-` 102 times. `var(--pc-primary, #FF6A00)` appears 81 times, so the brand orange is
written as a literal 81 times over.

---

## Prompt 1 — ship values, not just a stylesheet

> Three apps are adopting the light skin on skew-light-v2, and all three adopt by VALUES, not by
> loading the stylesheet. targz-launchpad2 and Terminass are Rust eframe/egui 0.29 apps with no CSS,
> no HTML and no DOM; both have already hand-transcribed Skew's dark hex into src/theme.rs
> (targz-launchpad2/src/theme.rs:1-3, Terminass/src/theme.rs:8-27), independently, and both have
> drifted. TargzPenPlotterCtrl is Electron 23 and is already light, but its markup is .cd-* plus
> Metro4 — no Skew class name matches it, so loading skew.css would restyle nothing and only its
> element-level rules (*{box-sizing}, body{background}) would land and fight Metro4. Its
> app/css/pc-tokens.css is a more complete token file than this design system has.
>
> Work the items in order. Add no value that is not either cited below from a real app or already a
> token in src/skew.css. For each item say whether it is a token, a CSS rule, a kit factory, or
> build-only.
>
> 1. ADD THE NON-COLOUR SCALES, BOTH SKINS. This is the 3-of-3 gap.
>    src/skew.css has no spacing, type-size, control-height, z-index, motion, tracking, leading or
>    weight token — grep returns 0 for all of them — so all three apps invented their own.
>    targz-launchpad2 has 6 layout consts (ui.rs:12-17) plus inline magic numbers and 10 ad-hoc type
>    sizes; Terminass has 2 spacing values, ~40 hard-coded offsets, and `etched` letter-spacing passed
>    per call site (0.12 / 0.14 / 0.16 / 0.2 / 0.22); TargzPenPlotterCtrl has the full scale and is
>    the only one that got it right.
>    Take TargzPenPlotterCtrl/app/css/pc-tokens.css:74-122 as the source — spacing
>    4/6/8/12/16/20/24/32, type 11/12/13/14/16/20, leading 1.2/1.45/1.6, tracking -0.01/0/0.08em,
>    weights 400/500/600/700, control heights 24/32/40, z-index base->toast, transition .15s and
>    .25s. Those are already Julien's numbers in a shipping app; nothing is being invented.
>    Also give DARK the radius tokens it has never had — --r/--r-sm/--r-pill exist only inside
>    [data-skin="light"].
>
> 2. EMIT A TOKEN MANIFEST FROM tools/build-dist.mjs, BOTH SKINS, INTO dist/. THREE OUTPUTS.
>    Resolve every var() and color-mix() to final hex or rgba. Break composites into primitives,
>    because egui has neither inset shadow nor CSS gradient: --recess and --chamfer become named line
>    colours with alphas and offsets; gradients become their stops with positions.
>    - JSON — the source of truth.
>    - Rust — its OWN generated file, e.g. src/skew_tokens.rs, NOT a block inside theme.rs: both
>      theme.rs files are mostly hand-written painter code and must not be overwritten. Emit ONE
>      PALETTE STRUCT PER SKIN, not `pub const`. Constants cannot switch at runtime, and a light mode
>      in either Rust app needs a palette value it can select at startup — that struct is the actual
>      mechanism by which launchpad2 and Terminass get a light skin at all.
>    - JS, with normalised 0-1 floats — the plotter's layer palette
>      (app/js/stroke-select.js:797, 6 triplets) and toolpath colours (app/js/theme.js:31-61) feed a
>      WebGL vertex buffer and can never be tokenised in CSS alone. This output also sidesteps the
>      Electron blocker at the end of this prompt entirely.
>    Both Rust apps build in .github/workflows and CI cannot see a sibling folder, so the generated
>    Rust file is one they vendor and commit.
>
> 3. FIX THE THREE ADOPTION FAULTS. ALL THREE ARE BUILD FAULTS.
>    `node tools/build-dist.mjs` reports all three dist/ files stale on v2 — rebuild and commit.
>    tools/build-dist.mjs never copies src/fonts/ (0 hits), so --font-read's Silkscreen silently falls
>    back to system mono in every app that follows README.md and copies only dist/ (src/skew.css:15-24
>    loads it by relative path). Ship src/skew-machine.css in dist/ — it is the only place the plotter
>    parts live.
>
> 4. GIVE THE SEMANTIC COLOURS A FILL + BG + BORDER TRIPLET.
>    Dark :root has only --led, --led-hot, --led-red — no success, no bg, no border. So
>    targz-launchpad2 built its Launch key from Tailwind teal (#5EEAD4 #2DD4BF #0F766E #115E59
>    #134E4A #CCFBF1 #042F2E) and its Stop key from Tailwind orange (#9A3412 #7C2D12 #C2410C #FFEDD5
>    #FF8E3A), and the styleguide's own button variants are defined in terms of bg and border values
>    that do not exist here.
>    LIGHT: take the triplets from pc-tokens.css:15-21 (#22C55E #F0FDF4 #BBF7D0 / #EF4444 #FEF2F2
>    #FECACA) and give them Skew's own naming — --ok / --ok-bg / --ok-edge and --no / --no-bg /
>    --no-edge beside the existing --ok-ink / --no-ink. Add --shadow-sm, which the styleguide has and
>    this skin does not.
>    DARK: the only evidence is launchpad2's two Tailwind ramps. Either adopt those as the dark bg and
>    border values, or leave dark's bg/border as an open decision and say so — do not invent a dark
>    equivalent, and do not put #F0FDF4 (a near-white) into the dark skin.
>    Naming across the two systems is item 8's job, not this one.
>    One value does need settling here: whether the running colour is launchpad2's teal or Terminass's
>    #7CFFB0 (OK = LCD_TXT). They disagree today.
>
> 5. RULE ON THE ORPHAN VALUES, ONE LINE EACH: adopt as a token, or name the token to use instead.
>    --pc-axis-x/y/z/a #EF4444 #22C55E #0015FF #FF6A00 (pc-tokens.css:24-27) — per-axis colour on a
>    DRO and jog pad, and --cd-axis-* gives different values for the same three axes;
>    #C99A5B folder accent (targz-launchpad2/src/theme.rs:28);
>    #2a1a10 selected row (Terminass/src/theme.rs, "the bay lit faintly by the LED");
>    #303244 pane divider (Terminass/src/app.rs:2334, used nowhere else);
>    #3a6b52 / #3b5b8c / #1f4e8c (Terminass/src/app.rs:866, 982, 2429);
>    HOST_COLORS 6 + LOCAL_TAB_COLORS 12 (Terminass/src/theme.rs:55-78) and the plotter's
>    STROKE_LAYER_COLORS 6 — three apps each needing a CATEGORICAL IDENTITY RAMP, which may be one
>    token set rather than three. Say which of these are system and which are app.
>
> 6. RECONCILE THE DRIFTED VALUES AND SAY WHICH SIDE IS RIGHT.
>    targz-launchpad2 has TEXT #e3e6eb vs --txt #d3d6dc, TEXT_3 #7e838d vs --txt-dim #7d828c,
>    BOARD #000000 vs --room #0b0b0d, Helvetica Neue vs --font-ui -apple-system. Terminass matches
>    Skew on all four. The grid is a third answer in each app — 15px #7FB2E5 / 24px white every 5th /
>    32px alpha-9 — so either pick one or declare the grid per-app.
>    Then fix the radii INSIDE THIS REPO FIRST: src/skew.css writes raw radii far more often than it
>    reads its own token (7px x18, 4px x17, 8px x14, 6px x14, 3px x13, 5px x8, 12px x7, 9px x5,
>    14px x5, 10px x5 — against var(--r-sm) x7), and --r-sm is 10px while .key is 7px. A scale
>    nothing reads is not a scale. Terminass hard-codes KEY_RADIUS 7.0 / MODULE_RADIUS 11.0 /
>    LCD_RADIUS 5.0 and launchpad2 R_CARD 16.0 / R_SM 7.0, so whatever you decide has to cover those.
>
> 7. GIVE A LIGHT SKIN TO THE PARTS THESE THREE APPS ACTUALLY USE AND THAT STAY DARK WHEN data-skin
>    FLIPS. Two items only, by the repo's own rule that a part not in a real app does not belong here.
>    First .meter and .prog: progress is needed by all three apps, .meter has 12 literal colours with
>    1 light rule out of 6, .prog-cap has 1 literal colour and no light rule at all. The plotter
>    rebuilt it as .cd-progress-track/-fill/-pct.
>    Second src/skew-machine.css entire — 1008 lines, 110 literal colours, 0 light rules: .dro,
>    .dro-num, .estop, .jog-k, .jog-grid, .jog-home, .stick-*, .penbank, .penrow, .annun, .runbank,
>    .ovrcol. TargzPenPlotterCtrl rebuilt every one of these from scratch — .cd-jog-grid 4x3 of 46px
>    with .cd-jog-btn (21 rules), .cd-axis-value (7 rules, click-to-edit), .cd-vslider x3 override
>    faders, .cd-btn-abort, .cd-state-dot, .cd-scrub-slider with G-code marks — because the design
>    system's versions are dark and unshipped.
>    docs/skew-nextdraw.css is a mockup sheet: leave it dark and say so in one line.
>    Not needed by these three apps, so leave them dark: .gate-lever, .gate-slot, .lens, .orbit,
>    .tone, .stamp, .sliders, .rot-seat, .drum-item, .tok.
>
> 8. RESOLVE THE NAME COLLISION WITH THE STYLEGUIDE, OR PUBLISH AN ALIAS LAYER. NOT BOTH.
>    _targz-launchpad/theme/STYLEGUIDE.md ships a copy-paste :root that every app was built against,
>    and pc-tokens.css follows it almost exactly. The light skin renames all of it and revalues two:
>    --bg -> --paper (#F5F3F0 -> #F1EEE9), --surface -> --card (#FFFFFF -> #FCFBF9),
>    --border -> --edge, --text* -> --ink*, --green/--red/--blue -> --ok/--no/--info,
>    --radius* -> --r*. --shadow-* keeps the names and INVERTS THE BEHAVIOUR (cast shadow -> inset
>    bevel), which is the dangerous one: an app already reading --shadow-card gets a silently
>    different result. Either add an alias layer in skew.css or update STYLEGUIDE.md to point here
>    and say the old names are gone.
>
> 9. DOCUMENT, AS INTENT, THE FOUR PARTS THAT CANNOT BE SHARED AS VALUES.
>    --recess, --chamfer, the LCD glow and the unlit-jewel desaturation exist as box-shadow /
>    gradient / text-shadow / filter on one side and as procedural drawing on the other
>    (Terminass/src/theme.rs:215-228, 274-305, 321-328, 331-342). Write the anatomy and the
>    invariants — one lamp above-left, key = ledge -> gradient face -> lit rim -> dark underside, 2px
>    press travel, concave chamfer polarity, and the rule targz-launchpad2/src/theme.rs:147-182 states
>    best (the lit rim must die out across the part, because a straight line cannot bend into the
>    corner the way inset 0 1px 0 does). Say whether --grain's absence in both Rust apps is a gap or
>    correct.
>
> 10. CARRY THE CONTRAST AND FOCUS WORK ACROSS, BECAUSE THIS REPO IS AHEAD ON BOTH.
>     The light skin demoted --ink-3 #9B9B9B to "MARKS ONLY" with the ratios in the comment.
>     TargzPenPlotterCtrl still has --cd-text-faint #A89E87 on white at about 2.7:1 as the default
>     colour of .cd-axis-value, its 22px DRO — the same mistake, already diagnosed here.
>     Publish a --ring / --ring-r focus token in BOTH skins and state the rule, because: the plotter
>     defines --pc-focus-ring, consumes it twice, and has 19 outline:none declarations;
>     targz-launchpad2 has focus rings on 2 of ~40 controls; Terminass has none.
>     Add one line that a status LED must never be the only carrier of state — .cd-state-dot encodes
>     run / pause / alarm by colour alone on a machine that moves.
>
> 11. STATE WHAT THE SYSTEM DOES NOT OWN. One line in the README: the terminal buffer and the toolpath
>     are the drawing, not the chrome. Terminass bundles 956 iTerm2 schemes and a separate
>     Palette{bg,fg,cursor,selection,ansi[16]} (src/themes.rs); the plotter's three.js colours carry
>     plotter semantics Skew has no business in (app/js/theme.js:31-61 — travel vs feed vs
>     already-drawn, where DRAWN_COLOR must be grey because black already means "excluded by you").
>     skew.css:174's own .sheet rule settles it.
>
> 12. FIX THE README, which still opens "A dark, machined design language." There are two skins now,
>     and the adoption section documents neither the skin attribute nor the font folder.
>
> OUT OF SCOPE, FLAGGED NOT FIXED: TargzPenPlotterCtrl pins "electron": "^23.1.1" -> Chromium 110,
> and src/skew.css uses color-mix() 67 times -> Chromium 111+. Those declarations drop silently. The
> pin is the app's call; item 2's manifest routes around it.
> Also app-side: the plotter's two palettes (--pc-* vs --cd-*, ZERO shared values, both live in
> commanddeck.css at 102 and 477 references, and var(--pc-primary, #FF6A00) written 81 times), its
> 689 lines of dead themes/dark.css + hicontrast.css, the unlinked mobilejog.css with its stray */ at
> line 45, and the 50 unresolved var(--pc-*) on the jog PWA, which never links pc-tokens.css.

---

## Prompt 2 — add the missing parts

Paste this one **after** the first. It adds the components, not the tokens — it assumes items 1, 2,
4 and 5 of the first prompt have landed, because every part below has to be declarable as values
for the Rust port.

> Skew is missing twelve parts that these three apps each built for themselves. Add them, both skins,
> in a form a Rust egui port can follow.
>
> The three apps are targz-launchpad2 and Terminass (Rust, eframe/egui 0.29, no CSS — they consume
> Skew as generated values and reimplement every part as painter code) and TargzPenPlotterCtrl
> (Electron, jQuery + Metro4). Each part below is already built, by hand, in at least one of them.
> That is the only reason it belongs here: the repo's rule is that a component not in a real app does
> not belong in Skew, so the citations ARE the justification. Add nothing that is not cited.
>
> HOW EVERY PART MUST BE BUILT — these apply to all twelve:
>
> A. From the existing chassis, not a new surface. .box / .box-head / .box-body / .actrow is the
>    panel, .bay is the recess, .key / .act / .chip are the controls, .jewel is the lamp,
>    .menu-kbd is the keycap. This is the rule 1.101.0 set when the modal was added: "It is a panel
>    and not a new surface… a system with two kinds of card has to explain which is which."
>    Say, per part, which existing classes it is made of and what is genuinely new.
>
> B. Both skins in the same pass. Every value a new part uses must be a token that exists in :root
>    AND in [data-skin="light"], so flipping data-skin is complete on day one. No raw hex anywhere in
>    a new rule. This is the whole lesson of the study: the parts that hurt are the dark-first ones.
>
> C. On-token radii only. Terminass's toast is rounding(8.0), which is neither .key's 7px nor
>    .module's 11px — it drifted precisely because there was no token to reach for. Pick from the
>    radius scale and name it.
>
> D. PORTABLE TO IMMEDIATE MODE. egui has no inset box-shadow, no CSS gradient, no text-shadow and
>    no transitions. For each part, write the anatomy as a numbered list in the comment the way
>    Terminass/src/theme.rs:215-228 and targz-launchpad2/src/theme.rs:147-182 read it — what shape,
>    what fill, which edge is lit, how many pixels of travel — so the port is transcription rather
>    than interpretation. Then say explicitly what cannot port and what the Rust side should do
>    instead. Keep every new part's depth expressible as fills plus 1px lines; if a part only reads
>    correctly as a nine-layer inset stack, that is a sign it is the wrong part for this list.
>
> E. Reduced motion and focus. Anything with motion gets a prefers-reduced-motion branch; anything
>    focusable gets :focus-visible using the --ring / --ring-r token. The three apps have focus rings
>    on 2 of ~40 controls, none at all, and 19 outline:none respectively — this repo is the only one
>    doing it, so a new part that skips it makes the problem worse.
>
> F. Document each part in docs/skew-panels.html, in the existing section style with the reason it
>    exists, or it does not exist. Say whether each is a kit factory, CSS only, or tokens only.
>
> TIER 1 — the five all three apps need. BUILD THESE, THEN STOP FOR REVIEW.
>
> 1. TOAST — a transient notice. CSS + kit factory.
>    Evidence: targz-launchpad2/src/ui.rs:594-610 (bottom-centre pill, 2.8s life, 0.18s fade with an
>    8px slide, SINGLE-SLOT — a new toast replaces the old one, ui.rs:88-91);
>    Terminass/src/app.rs:3220-3232 (Area anchored CENTER_BOTTOM at -24px, TAB_ACTIVE fill,
>    rounding 8.0, 12px inner margin, 4s TTL set in notify() app.rs:299-301, ~25 call sites);
>    TargzPenPlotterCtrl 13× Metro.toast.create, driven by the socket events toastError and
>    toastErrorAlarm.
>    Settle, once: single-slot (both Rust apps already are — do not invent a stack); anchored
>    centre-bottom (both agree); one TTL, 2.8s or 4s, not both; and an error variant, because the
>    plotter distinguishes a plain toast from toastError and toastErrorAlarm on a machine that moves.
>    The 1.101.0 changelog notes that grepping for "modal", "overlay" and "toast" returned nothing and
>    only the modal was built. This closes that.
>
> 2. TOOLTIP — CSS and tokens only, no factory.
>    Evidence: targz-launchpad2 11 on_hover_text (ui.rs:224, 237, 244, 252, 364, 793, 814, 867, 914,
>    945, 970 — including the truncated card description revealing in full); Terminass 16, several of
>    them full explanatory paragraphs (app.rs:1689, 1947); TargzPenPlotterCtrl 47
>    title= / data-toggle="tooltip" plus .cd-util-hint, .cd-opt-hint, .cd-pen-hint, .cd-alarm-hint,
>    .cd-set-nav-hint.
>    No factory, because egui's on_hover_text already places and times it — the Rust side needs only
>    the LOOK, which means fill, radius, padding, text colour and max-width as tokens.
>    One part, not two sizes: it wraps at a max-width, so a label and a paragraph are the same part.
>    Note for whoever builds it: there is no existing pointer or tail part. .tear / .tear-ptr is a
>    rotary's teardrop indicator (src/skew.css:3286), not a tooltip tail. Decide whether this part
>    has a tail at all — a small plate with no tail is the cheaper answer and matches all three apps,
>    none of which draws one.
>
> 3. SEARCH FIELD — mostly composition. Say so.
>    Evidence: targz-launchpad2/src/ui.rs:346-355 (field in a hand-painted well, with "/" to focus
>    and a visible 18x18 keycap hint at ui.rs:372 that hides once focused, Esc to clear);
>    Terminass 3 (quick-connect app.rs:873-876, focused by Tab; SFTP filter app.rs:2479;
>    theme picker app.rs:1582); TargzPenPlotterCtrl .cd-set-search.
>    The parts exist: .bay for the well, ICON.search in skew-kit.js:127, .menu-kbd for the keycap.
>    So this may be a documented composition plus one small factory rather than a new surface — if it
>    is, write it that way and say which existing classes compose it.
>    Do NOT port launchpad2's 200->300px focus width animation. One app, one effect, and it is a knob
>    nobody asked for.
>
> 4. SPINNER — indeterminate busy. CSS + kit factory.
>    Evidence: targz-launchpad2/src/theme.rs:415-420 (a 10-SEGMENT ARC over a faint track, rotated by
>    t * 10.0, used twice: the "Starting" key and the Restart segment); Terminass one ui.spinner() at
>    app.rs:2538 (SFTP pane loading).
>    progress() is determinate and segmented only — progress({segs = 40, value}) at
>    src/skew-kit.js:2331 — so there is no part for "working, length unknown".
>    Build it in the SAME MATERIAL: discrete segments, not a smooth sweep. launchpad2's existing part
>    is already ten segments, and the NEXTDRAW document argues at length for forty discrete segments
>    over a fill creeping 0.3% a minute. A smooth arc here would be the one part in the language that
>    is a gradient pretending to be a mechanism.
>    Reduced motion: it must settle to a legible static state, not freeze mid-rotation.
>
> 5. SCROLLBAR — CSS plus tokens. The cheapest of the five.
>    The recipe already exists and is scoped to one element: src/skew.css:4521-4527 styles
>    .con-log::-webkit-scrollbar — 10px wide, transparent track, thumb #33373d at radius 6px with a
>    3px transparent border and background-clip:content-box to inset it, hover #454a52.
>    Generalise it to a class that any scroller can take, and replace those two literals with tokens
>    so the light skin gets it too. Everything else in all three apps falls back to the platform bar:
>    Terminass has 8 ScrollArea instances untouched by theme.rs, launchpad2 hides its chip strip's bar
>    outright (ScrollBarVisibility::AlwaysHidden, ui.rs:403), the plotter has 8 scrollers unstyled.
>    On a cream panel the platform bar is the most visible unstyled thing left.
>    Emit the thumb colour, track colour, width and inset as TOKENS, because egui takes them through
>    Visuals / style.spacing.scroll rather than through a class — the Rust side needs the values, not
>    the rule.
>
> TIER 2 — needed by two of the three. BUILD AFTER REVIEW OF TIER 1.
>
> 6. MULTI-COLUMN ROW AND HEADER. Terminass/src/app.rs:3556 file_row() — 40px tall, four columns from
>    columns(w) = [0, w*0.44, w*0.68, w*0.84] (Name / Date Modified / Size / Kind), each clipped per
>    column, with an etched header row at app.rs:2560; TargzPenPlotterCtrl .cd-set-thead / -tbody /
>    -row / -row-key / -name / -val / -unit and .cd-pt-row / -key / -val.
>    .setrow is label-plus-value and assetRow (src/skew-kit.js:2235) is a thumbnail row
>    (thumb / filename / filesize / toggle). Neither is a columned row with a header.
>    Fractional column positions, not fixed widths — that is what both apps do.
>
> 7. NUMBERED STEP FLOW. TargzPenPlotterCtrl .cd-resume-step x6 plus .cd-resume-head / -detail /
>    -actions / -go / -dismiss, and eight wizards in app/wizards/ (~3500 lines: probe v2, resume,
>    flashing, surfacing, x/y/z/servo calibration); Terminass help_step() x6 at app.rs:3718 (numbered
>    shell-command help with a copy affordance).
>    One part: a numbered step with a body and its own action. Not a wizard chrome, not a progress
>    indicator across steps — neither app has one.
>
> 8. CARD STATUS STRIPE, AND A CARD WITH TWO STATES. targz-launchpad2/src/ui.rs:744-975 — the card is
>    CARD_LIT #1e2023 when running and CARD_OFF #0e0f11 when stopped, each with its own shadow depth
>    and rim alpha, plus a 10px teal light pipe down the left edge with an outer glow and an inner
>    specular line (ui.rs:766-771). _targz-launchpad/theme/STYLEGUIDE.md specifies it independently:
>    "Left color stripe (10px wide): grey idle, green running."
>    .pipe exists but only inside the toggle. A card that is lit or unlit, with a stripe carrying the
>    state colour, is the part.
>    This one depends on the semantic ramp from item 4 of the first prompt — do not build it before
>    --ok / --ok-bg / --ok-edge exist.
>
> 9. DRAG GHOST AND DROP-TARGET STATE. targz-launchpad2 drag_ghost() ui.rs:612-622 (a floating label
>    following the cursor), the drop feedback at ui.rs:416-424 (target chips take an orange glow and a
>    solid LED fill, non-targets a thin LED outline), and the source card dimmed under
>    rgba(0,0,0,0.5) at ui.rs:972-974; Terminass two Areas at Order::Tooltip — "drag_ghost"
>    (app.rs:2366) and "folder_drop_hint" (app.rs:2837).
>    .grip exists (the 26x26 raised plate with four dots). The ghost and the three target states do
>    not. Three states to name: this is the target, this could be a target, this is the thing being
>    dragged.
>
> TIER 3 — one app each. DO NOT BUILD. Decide and write one line per item: is it system or app?
>
> 10. NUMBER STEPPER — a plus/minus pair around a value. TargzPenPlotterCtrl only, but heavily: five
>     families and roughly 35 instances (.cd-vslider-nudge x6, .cd-zpen-pop-nudge, .cd-scrub-nudge,
>     .cd-range-step x6, .cd-step-btn x12, .cd-zpen-arrow x3). Skew's --nudge (src/skew.css:3012) is a
>     1.5px fader-blade alignment offset, not a stepper. knob() already has typeable() for direct
>     entry, so the question is whether a stepper is a third way to set a number or the right way for
>     a value with no travel.
>
> 11. INLINE ALARM BANNER WITH ACTIONS. TargzPenPlotterCtrl #cd-alarm-banner with .cd-alarm-title /
>     -desc / -hint / -actions / -locked, plus .cd-set-banner / -warn / -bad / -icon. .warn is the
>     nearest thing here and it is a one-line notice with no actions. Safety-relevant: this is what a
>     plotter shows when it has alarmed and cannot move.
>
> 12. CLOSABLE WIDTH-ADAPTIVE TAB. Terminass session_tab() app.rs:3317 — 44 to 200px
>     (SESSION_TAB_MAX / MIN), with the close affordance appearing on hover only above 72px. The .tab-*
>     family has no close and no width adaptation.
>
> WHAT NOT TO TOUCH. Do not build siblings for the parts none of these three apps uses — knob,
> rotary, drum, gizmo, orbit, gate, loupe, lens, ruler, tone, stamp, pens, tear, piano. Those belong
> to the Portrait apps and are why this kit already looks complete. And do not restyle the terminal
> buffer or the toolpath: skew.css:174's own .sheet rule settles that.
>
> PORT MAP. Give each finished part this line in its documentation, so the Rust adaptation is
> mechanical rather than a second design pass:
>   toast        -> targz-launchpad2 toast_ui() ui.rs:594  ·  Terminass app.rs:3220
>   tooltip      -> egui on_hover_text; values only
>   search       -> targz-launchpad2 ui.rs:346  ·  Terminass app.rs:873
>   spinner      -> targz-launchpad2 theme.rs:415  ·  Terminass ui.spinner() app.rs:2538
>   scrollbar    -> egui Visuals / style.spacing.scroll; values only
>   columned row -> Terminass file_row() app.rs:3556
>   step         -> Terminass help_step() app.rs:3718
>   card stripe  -> targz-launchpad2 card() ui.rs:744, pipe ui.rs:766
>   drag ghost   -> targz-launchpad2 drag_ghost() ui.rs:612  ·  Terminass app.rs:2366
>
> Follow CLAUDE.md: bump version.js, update the CHANGELOG array with today's date, and run
> node tools/build-dist.mjs --write so dist/ carries the new parts. Then tell me, per part, what to
> press and what a correct result looks like against a broken one.

---

## Verification

No code changes in this study. To check the findings:

```bash
node tools/build-dist.mjs
```
Expect 3 files stale (B2).

```bash
grep -c 'color-mix(' src/skew.css; grep -c fonts tools/build-dist.mjs; grep -c 'data-skin' src/skew-machine.css
```
Expect 67, 0, 0 (B1, B3, B4).

```bash
grep -cE '^\s*--[a-z-]*(space|size|z-|control-|tracking|leading|weight|transition)' src/skew.css
```
Expect 0 — the item-1 gap.

```bash
grep -n 'hex(0x' ~/Documents/GIT/targz-launchpad2/src/theme.rs | head -20
```
The 15 consts, including the 4 drifted ones.

```bash
grep -n '// --' ~/Documents/GIT/Terminass/src/theme.rs
```
The token-name comments proving the manual port.

```bash
sed -n '74,122p' ~/Documents/GIT/TargzPenPlotterCtrl/app/css/pc-tokens.css
```
The scales item 1 should adopt.

Visual judgement is Julien's: `npm run dev` → localhost:2860, `data-skin="light"` on `<html>`.
