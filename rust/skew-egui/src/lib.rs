//! # skew-egui
//!
//! Skew — the targz design system — as egui parts rather than as a stylesheet.
//!
//! Two of the three adopting apps are `eframe`/`egui` and cannot load CSS at any
//! price (`docs/APP-ALIGNMENT.md`, finding 1). Both had already adopted the skin
//! by hand-transcribing hex into their own `theme.rs`, independently, and both
//! had drifted. `dist/skew_tokens.rs` closed half of that: the **values** are
//! generated now and cannot drift. This crate closes the other half — the
//! **drawings**. A recess is nine shadow layers in CSS and six rectangles in
//! egui; a key is a cap on a wall with a throw under it. Those are painter code,
//! they were written three times, and they are what this crate holds.
//!
//! ## What is in here
//!
//! * [`tokens`] — generated from `src/skew.css` by `tools/build-dist.mjs`. The
//!   same file as `dist/skew_tokens.rs`. Never hand-edited.
//! * [`Theme`] — a [`tokens::Palette`] resolved into the names the painted parts
//!   actually ask for, with the light/dark fallbacks stated once instead of at
//!   every call site. **Select it at startup; it is a value, not a const.**
//! * The parts: [`key`], [`btn`], [`colored_btn`], [`fader`], [`knob`], [`panel_frame`],
//!   [`well_frame`], [`section`], [`label`].
//!
//! ## The light skin is the tuned one
//!
//! Every pixel value in [`key`] and [`fader`] was tuned by eye against the
//! documentation renders, in the light skin, in `TargzPenPlotterCtrl`. They are
//! lifted here unchanged. `Theme::dark()` resolves the dark palette and the
//! parts draw with it, but the dark skin has two drawings this crate does not
//! do — the LCD phosphor glow and `--grain` — and `docs/PORTING.md` says why.
//!
//! ```no_run
//! # fn demo(ctx: &egui::Context, ui: &mut egui::Ui) {
//! let theme = skew_egui::Theme::light();
//! theme.apply(ctx);                       // fonts, visuals, spacing — once
//! if skew_egui::colored_btn(ui, &theme, "▶ START", theme.primary,
//!                           egui::Color32::WHITE, egui::vec2(120.0, 40.0), true).clicked() {
//!     // ...
//! }
//! # }
//! ```

pub mod sfx;
pub mod tokens;

mod fader;
mod frame;
mod key;
mod knob;
mod machine;
mod nav;
mod paint;
mod theme;

pub use fader::{fader, paint_fader, FaderState, FADER_SIZE};
pub use frame::{label, panel_frame, section, well_frame, well_shadow};
pub use knob::{knob, paint_knob, KnobKind, KNOB_D, KNOB_SIZE};
pub use key::{btn, colored_btn, key, paint_key, paint_pkey_down, pkey_bar, KeyState, KeyStyle};
pub use machine::{
    bezel_edges, bezel_frame, cut, dro, jog_pad, lcd, paint_lcd, panel, JogPress,
};
pub use nav::{nav_bar, Nav, NavHit, NAV_GAP, NAV_HEIGHT};
pub use paint::{hex, mix, rgb, vgrad};
pub use theme::{mono, read_font, Skin, Theme};
pub use tokens::{Palette, ShadowLayer};
