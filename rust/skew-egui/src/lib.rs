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

mod console;
mod fader;
mod frame;
mod icon;
mod key;
mod knob;
mod machine;
mod nav;
mod paint;
mod press;
mod shell;
mod switch;
mod theme;

pub use console::{
    paint_jewel,
    act, appwin, con_say, console, dim_readout, empty_rack, module_card, paint_act, paint_lens, paint_sel,
    paint_sel_list, paint_stamp, paint_surround, paint_well, port_strip, pull_line, pull_step, sel,
    sel_list, sel_list_size, slot_field, split_act, surround, version_readout, version_readout_h,
    ActStyle, Lens, ModuleHit, ModuleView, Part, PullHit, PullState, VerState, MODULE_MIN_W,
    APPWIN_BAR, SEL_CUT, SEL_PAD, SEL_ROW,
};
pub use fader::{
    fader, paint_fader, paint_trim, trim, FaderState, FADER_SIZE, TRIM_H,
};
pub use frame::{grid_shapes, label, page_fill, paint_grid, panel_frame, section, stage, well_frame, well_shadow};
pub use knob::{knob, paint_knob, KnobKind, KNOB_D, KNOB_SIZE};
pub use icon::{paint_icon, paint_icon_lit, paint_icon_solid, Icon};
pub use shell::{
    entry, field, frow, frow_inline, hint, pane_fill, paint_entry, paint_rail_item, paint_swatch, paint_tab,
    paint_tab_ledge, paint_tabpane, rail, slot_row, statline, swatches, tabbar, EntryView,
    RailItem, Tab, TabKind, Tone, ENTRY_H, FIELD_H, FIELD_SM_W, FROW_LAB_W, RAIL_ROW_H, SWATCH,
    TABBAR_H, TABBAR_PAD_T, TAB_H, TAB_H_OFF,
};
pub use press::{
    backlit, chevron, icon_key, micro, paint_icon_key, sep, BACKLIT_SIZE, CHEV_SIZE, ICON_KEY_SIZE,
    MICRO_SIZE,
};
pub use key::{btn, colored_btn, key, paint_key, paint_pkey_down, paint_pkey_held, pkey_bar, KeyState, KeyStyle};
pub use machine::{
    bezel_edges, bezel_frame, cut, dro, jog_pad, lcd, paint_lcd, paint_lcd_ink, panel, JogPress,
};
pub use nav::{channel, nav_bar, Nav, NavHit, NAV_GAP, NAV_HEIGHT};
pub use paint::{hex, mix, rgb, vgrad};
pub use switch::{paint_slide, slide, SlideKind, SLIDE_SIZE};
pub use theme::{
    add_fonts, id_color, install_fonts, mono, read_font, Skin, Theme, ID_RAMP_LEN,
};
pub use tokens::{Palette, ShadowLayer};
