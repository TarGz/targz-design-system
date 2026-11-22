# skew-egui

Skew — the targz design system — as **painted egui parts**, not as a stylesheet.

```
cargo run --example gallery          # the visual reference, light skin
cargo run --example gallery -- dark  # same parts, dark palette
```

## Why this exists

`docs/APP-ALIGNMENT.md`, finding 1: two of the three adopting apps are `eframe`/`egui`
and cannot load CSS at any price. Both had adopted the skin by hand-transcribing hex
into their own `theme.rs`, independently of each other, and both had drifted.

`dist/skew_tokens.rs` fixed half of that — the **values** are generated now. This crate
fixes the other half, the **drawings**. A recess is nine shadow layers in CSS and six
rectangles in egui; a key is a cap standing on a wall with a throw under it. That is
painter code, it was written three times by hand, and it is what lives here.

## What is in it

| | |
|---|---|
| `tokens` | Generated from `src/skew.css` by `tools/build-dist.mjs` — byte-identical to `dist/skew_tokens.rs`. **Never hand-edit; a rebuild overwrites it.** |
| `Theme` | A `Palette` resolved into the names the parts ask for, with every light/dark fallback decided once, with its reason. Selected at startup. |
| `key` `btn` `colored_btn` | The key: five states, `paint_key` for posing one. |
| `fader` | The vertical fader, live value, commit on release. |
| `pkey_bar` | A bar of interlocked keys, one down. A latch in a bar is a well, not a lit cap. |
| `panel` | `.box` — head with a chip, one hairline, body. |
| `lcd` `cut` `bezel_frame` | The glass, the engraved caption, the group bezel (`--surround`). |
| `dro` `jog_pad` | A coordinate under glass with its travel scale; the direction pad. |
| `panel_frame` `well_frame` `well_shadow` | The chassis and the recess. |
| `section` `label` `read_font` `mono` | Etched type, and Silkscreen as `--font-read`. |
| `nav_bar` | `.strip.nav-strip` — wordmark, page keys, sections, skin, version. |
| `vgrad` `mix` `hex` `rgb` `glass` | The primitives, since egui has no gradient or inset shadow. |

Silkscreen ships here as **TTF** (`assets/`, OFL alongside): egui's `FontData` takes raw
TTF/OTF and has no woff2 decompressor, so the web build of the font is unusable in a
Rust app. The TTFs are copied in from `src/fonts/` by the same build step that writes
`dist/` — they are generated-and-committed, like everything in `dist/`.

**[`PARITY.md`](PARITY.md) is the list**: every part the stylesheet and
`skew-kit.js` have, what is drawn here, and what is still open — plus the shape
a new part takes. Read it before adding one.

## The light skin is the tuned one

Every pixel value in `key` and `fader` was tuned by eye against the documentation
renders, in the light skin, in `TargzPenPlotterCtrl`, and approved there. They are
lifted here unchanged. **Do not change one without a render to compare against.**

`Theme::dark()` resolves the dark palette and the parts draw with it, but two drawings
the dark skin has are not implemented: the LCD phosphor glow and `--grain`.
`docs/PORTING.md` has both, and why the light skin does not want the first one at all.

One value in here is not a token: `Theme::key_lit` = `#E06728`, the lit cap. `--primary`
straight out of the palette is too hot for a cap this size on cream. It is recorded as
the crate's own, not as a system value.

## How an app takes it

**Decision: a `git` dependency, pinned by revision.** A `path` dependency on a sibling
folder is the obvious thing and it is the one thing that cannot work — both Rust apps
build in `.github/workflows`, `actions/checkout` fetches one repo, and CI cannot see
`../targz-design-system`. The repo is public, so a git dependency needs no credentials
in CI, and pinning by `rev` means a design-system commit cannot change an app's pixels
without someone moving that `rev` on purpose.

```toml
# app/Cargo.toml
[dependencies]
skew-egui = { git = "https://github.com/TarGz/targz-design-system.git", rev = "<sha>" }
egui = "0.29"
```

Cargo finds the package inside the repository by name; the crate's path in the repo is
not part of the dependency line, so `rust/skew-egui` can move without breaking an app.
If this repo starts cutting tags, `tag = "v1.114.0"` reads better than a `rev` and pins
exactly as hard.

While working on a part and the app that uses it at the same time, override the git
dependency with the local checkout — one block, removed when you are done:

```toml
[patch."https://github.com/TarGz/targz-design-system.git"]
skew-egui = { path = "../targz-design-system/rust/skew-egui" }
```

**The fallback is vendoring**, and it is only for an app that cannot take a git
dependency at all (an offline or vendored-registry build): copy `src/tokens.rs` as
`dist/skew_tokens.rs` is already copied today, and copy the painter modules beside it.
That is the state this crate exists to end, so if you do it, say in a comment which
revision it came from.

## Version

The crate version tracks the design system's `version.js`. A part has no meaning apart
from the skin it draws, so a second version number would only ever be a thing to
reconcile.

## Porting an app that already has a hand-written `theme.rs`

The field comments in `src/theme.rs` carry both the CSS token name and the const name
the pen-plotter app used, so the first pass is mechanical:

| app const | crate |
|---|---|
| `BG` | `th.paper` |
| `PANEL` | `th.card` |
| `PANEL_ALT` | `th.case_face` |
| `PANEL_HI` | `th.card_hover` |
| `BORDER` | `th.edge` |
| `BORDER_STRONG` | `th.edge_ctl` |
| `TEXT` `MUTED` `FAINT` | `th.ink` `th.ink_2` `th.ink_3` |
| `ACCENT` `ACCENT_DEEP` `ACCENT_SOFT` | `th.primary` `th.primary_deep` `th.primary_subtle` |
| `ACCENT_INK` | `th.ring` |
| `GOOD` | `th.ok_ink` |
| `BAD` `BAD_BG` `BAD_EDGE` | `th.no` `th.no_bg` `th.no_edge` |
| `KEY_LIT` | `th.key_lit` |
| `R_KEY` `R_SM` `R_MOD` | `th.r_key` `th.r_sm` `th.r_mod` |

Two signature changes, both because the arguments were dead:

* `key(..)` no longer takes `ring` — the raised key has no ring, so the parameter had
  been `_ring` since the light skin landed. It takes a `&KeyStyle` instead of four
  loose colour and size arguments.
* `colored_btn(..)` no longer takes `stroke`, for the same reason.

An app keeps its own values: axis colours, grid pitch, a folder accent, an amber it
invented. `docs/PORTING.md` part two rules on each of those — they are the app's, and
this crate does not try to hold them.
