//! The application shell — the parts a windowed app is built out of, as
//! opposed to the parts a control panel is built out of.
//!
//! All six were lifted from `~/Documents/GIT/Terminass` (Rust, eframe/egui
//! 0.29), the third of the three apps `docs/APP-ALIGNMENT.md` studies. That
//! app drew every one of them by hand in its own `src/theme.rs` and
//! `src/app.rs`, because this crate had nothing to reach for — the same way it
//! hand-transcribed the palette, which is the drift this crate exists to end.
//!
//! The web side is the source, as always: `src/skew.css`, under
//! **TERMINASS'S PARTS**. No part here picks a COLOUR — every one comes off
//! [`Theme`]. Two ALPHAS are written as numbers, both in [`paint_tab`]'s
//! jewel, and both are `.jewel`'s own: the seating rim is `rgba(0,0,0,.55)`
//! and the highlight is the same white [`paint_lens`] already puts on a lamp.
//! An alpha is not a value the palette carries, which is why the fader's own
//! hardware is the other exception PARITY.md already records.

use crate::console::{paint_lens, paint_well, Lens};
use crate::icon::{paint_icon, Icon};
use crate::key::{paint_key, paint_pkey_down, KeyState, KeyStyle};
use crate::theme::{mono, Theme};
use egui::{pos2, vec2, Align2, Color32, FontId, Rect, Rounding, Sense, Stroke, Ui, Vec2};

/// `--rim` as a FILL — see [`paint_rail_item`] for why this is two tokens.
fn hover_fill(th: &Theme) -> Color32 {
    match th.skin {
        crate::Skin::Dark => th.pal.rim,
        crate::Skin::Light => th.card_hover,
    }
}

// ── the vertical nav rail ───────────────────────────────────────────────────

/// `.rail-item` — 34px, the row's whole width.
pub const RAIL_ROW_H: f32 = 34.0;

/// One destination on the rail.
#[derive(Clone, Copy, Debug)]
pub struct RailItem<'a> {
    pub icon: Icon,
    pub name: &'a str,
}

/// Paint one rail row.
///
/// THE SELECTED ROW IS A CUT, NOT A CAP. On a horizontal bar the current page
/// is a key that is down, because the keys have walls between them. A column
/// of rows has no walls, so a cap would be a key standing in a space with
/// nothing to stand on — the mark is the row sinking into the case instead,
/// which is `--recess`, the token the whole language uses for "below the
/// surface", and which [`paint_well`] already draws.
///
/// THE LAMP IS THE ONLY COLOUR IN THE COLUMN. A column of unlit lamps with one
/// lit reads across a room; a tinted background does not, and it spends the
/// skin's one loud colour on a row that is merely current.
pub fn paint_rail_item(
    p: &egui::Painter, th: &Theme, rect: Rect, item: &RailItem, on: bool, hover: bool,
) {
    if on {
        // `--bay`, not `--paper`: the floor of a hole is the case seen
        // deeper, and in the light skin `--bay` already aliases to `--paper`.
        paint_well(p, rect, th.pal.bay, th.edge);
    } else if hover {
        // `.rail-item:not(.on):hover` — the metal warming under the pointer.
        // Nothing moves: a row that lifts is a row that was a card.
        //
        // TWO TOKENS FOR ONE STATE, because `--rim` is an EDGE. In the dark
        // skin it is white at 9% and warms anodising exactly the way the
        // stylesheet asks; in the light skin it is white at 100%, which as a
        // FILL on cream is invisible — so the light rule in `src/skew.css`
        // hands that row to `--card-hover`, and so does this.
        p.rect_filled(rect, Rounding::same(th.r_key), hover_fill(th));
    }
    let cy = rect.center().y;
    // 7px lamp at 12 in from the edge — `.rail-item .pilot`
    paint_lens(p, th, pos2(rect.left() + 15.5, cy), 7.0, if on { Lens::Lit } else { Lens::Unlit });
    let ink = if on { th.primary } else { th.ink_2 };
    paint_icon(p, item.icon, pos2(rect.left() + 34.0, cy), 14.0, 1.8, ink, 0.0);
    // `.rail-nm` — 10.5px, .16em tracking, caps
    let mut job = egui::text::LayoutJob::default();
    job.append(
        &item.name.to_uppercase(),
        0.0,
        egui::TextFormat {
            font_id: FontId::monospace(10.5),
            color: ink,
            extra_letter_spacing: 10.5 * 0.16,
            ..Default::default()
        },
    );
    job.wrap.max_width = rect.width() - 56.0;
    let g = p.layout_job(job);
    p.galley(pos2(rect.left() + 48.0, cy - g.rect.height() / 2.0), g, ink);
}

/// The rail. `current` is the row that is cut in; it is written on a press.
/// Returns the index pressed, if one was.
pub fn rail(ui: &mut Ui, th: &Theme, items: &[RailItem], current: &mut usize) -> Option<usize> {
    let mut hit = None;
    ui.vertical(|ui| {
        ui.spacing_mut().item_spacing.y = 3.0;
        for (i, it) in items.iter().enumerate() {
            let (rect, resp) = ui.allocate_exact_size(
                vec2(ui.available_width(), RAIL_ROW_H),
                Sense::click(),
            );
            let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
            if ui.is_rect_visible(rect) {
                paint_rail_item(ui.painter(), th, rect, it, *current == i, resp.hovered());
            }
            if resp.clicked() {
                *current = i;
                hit = Some(i);
            }
        }
    });
    hit
}

// ── the window tab ──────────────────────────────────────────────────────────

/// `.pkey.tab` — the height the interlocked bar already uses.
pub const TAB_H: f32 = 34.0;

/// Paint one tab. `lamp` is the session's identity colour, which is the HOST'S
/// to choose — this crate has no identity ramp and is not going to invent one
/// (`docs/PORTING.md`, "a categorical ramp, and it is one set, not three").
///
/// THE CLOSE MARK IS ABSENT UNTIL IT IS WANTED. A × on every tab is a row of
/// marks saying "you may destroy this" on a bar you are reading for names. It
/// shows on hover and on the tab that is down — the one you could mean.
pub fn paint_tab(
    p: &egui::Painter, th: &Theme, rect: Rect, name: &str, lamp: Color32, state: KeyState,
    x_hot: bool,
) {
    let down = state == KeyState::Pressed;
    if down {
        // `.pkey.is-down` IS A WELL, NOT A LIT CAP — PARITY.md says so for the
        // whole interlocked family, and a tab is one key of that bar.
        // "" with the bar's own size: the legend is painted below, with the
        // lamp and the close mark, because a tab's name is not centred.
        paint_pkey_down(p, th, rect, "", 11.0);
    } else {
        paint_key(p, th, rect, "", &KeyStyle::new(th.card, th.ink_2), state);
    }
    let cy = rect.center().y + if down { 1.0 } else { -1.0 };
    // the jewel: 8px, the session's own colour, seated by a rim
    let c = pos2(rect.left() + 13.0, cy);
    p.circle_filled(c, 4.0, lamp);
    // the highlight paint_lens already puts on every lamp in this crate
    p.circle_filled(c + vec2(-1.2, -1.4), 1.2, Color32::from_rgba_unmultiplied(255, 255, 255, 70));
    // `.jewel` — `0 0 0 1px rgba(0,0,0,.55)`, the bead's seating rim. The
    // light skin takes it off (`:is(.jewel, .pilot){ box-shadow:none }`),
    // because on paper a black rim round a colour is dirt and not depth.
    if th.skin == crate::Skin::Dark {
        p.circle_stroke(c, 4.0, Stroke::new(0.8, Color32::from_rgba_unmultiplied(0, 0, 0, 140)));
    }

    let show_x = down || state == KeyState::Hover;
    let right = if show_x { rect.right() - 28.0 } else { rect.right() - 9.0 };
    let ink = if down { th.primary } else { th.ink_2 };
    let mut job = egui::text::LayoutJob::single_section(
        name.to_string(),
        egui::TextFormat { font_id: FontId::monospace(11.0), color: ink, ..Default::default() },
    );
    job.wrap = egui::text::TextWrapping {
        max_width: (right - rect.left() - 22.0).max(8.0),
        max_rows: 1,
        break_anywhere: true,
        overflow_character: Some('…'),
    };
    let g = p.layout_job(job);
    p.galley(pos2(rect.left() + 22.0, cy - g.rect.height() / 2.0), g, ink);

    if show_x {
        let xc = pos2(rect.right() - 16.0, cy);
        if x_hot {
            p.rect_filled(Rect::from_center_size(xc, Vec2::splat(16.0)), 4.0, hover_fill(th));
        }
        paint_icon(
            p, Icon::Close, xc, 11.0, 2.0,
            if x_hot { th.primary_light } else { th.ink_2 }, 0.0,
        );
    }
}

/// A tab. Returns its response and whether the × was the thing pressed.
///
/// THE × IS NOT THE TAB. A close mark inside a control that also selects is
/// the one press on a tab bar you can make by accident, so the hit is tested
/// against the mark's own box before the tab ever claims the click.
pub fn tab(
    ui: &mut Ui, th: &Theme, name: &str, lamp: Color32, down: bool, w: f32,
) -> (egui::Response, bool) {
    let (rect, resp) = ui.allocate_exact_size(vec2(w, TAB_H), Sense::click());
    let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
    let xr = Rect::from_center_size(pos2(rect.right() - 16.0, rect.center().y), Vec2::splat(18.0));
    let over_x = resp.hover_pos().map_or(false, |q| xr.contains(q));
    let state = if down {
        KeyState::Pressed
    } else if resp.hovered() {
        KeyState::Hover
    } else {
        KeyState::Raised
    };
    if ui.is_rect_visible(rect) {
        paint_tab(ui.painter(), th, rect, name, lamp, state, over_x);
    }
    // middle-click closes a tab too — it is the one gesture every tab bar has
    let close = (resp.clicked() && over_x) || resp.middle_clicked();
    (resp, close)
}

// ── the field and its action ────────────────────────────────────────────────

/// `.slotrow` — a field and the key that acts on it, one row, one height.
///
/// THE KEY IS NOT INSIDE THE WELL. A cap sunk into the slot beside it would be
/// a key at the bottom of a hole. The two stand side by side at one height,
/// which is what `.con-top :is(.sel, .slot, .lcd)` already says about every box
/// in a row — and the host no longer computes the field's width as
/// `available_width() - 70.0`, which is a number that has to be re-guessed
/// every time the key's label changes.
///
/// `enabled` is the key's, not the field's: CONNECT is dead until the field
/// has something in it, which is a state the specimen has to be able to show.
///
/// Returns `(field, key)` responses, in that order.
pub fn slot_row(
    ui: &mut Ui, th: &Theme, mark: Option<Icon>, hint: &str, buf: &mut String, action: &str,
    h: f32, enabled: bool,
) -> (egui::Response, egui::Response) {
    let mut field = None;
    let mut act = None;
    ui.horizontal(|ui| {
        ui.spacing_mut().item_spacing.x = 6.0;
        let key_w = ui
            .painter()
            .layout_no_wrap(action.to_owned(), FontId::monospace(11.0), th.ink)
            .rect
            .width()
            + 26.0;
        let field_w = (ui.available_width() - key_w - 6.0).max(60.0);
        field = Some(crate::console::slot_field(ui, th, field_w, h, mark, hint, buf));
        act = Some(crate::key::key(
            ui, th, action, &KeyStyle::new(th.card, th.ink), vec2(key_w, h), enabled, false,
        ));
    });
    (field.unwrap(), act.unwrap())
}

// ── the settings form row ───────────────────────────────────────────────────

/// `.frow-lab` — Terminass's own `FORM_LABEL_W`, which is its longest name
/// plus room.
pub const FROW_LAB_W: f32 = 150.0;

/// A settings row: a right-aligned name, then what it names.
///
/// THE NAME IS RIGHT-ALIGNED AND THAT IS THE WHOLE POINT. A column of
/// left-aligned labels puts a ragged edge against the controls, so the eye
/// crosses a different gap on every line; right-aligned, the names end on one
/// rule and every control starts on the next.
///
/// THE BODY IS A COLUMN, not a row, because a setting is a control AND the
/// sentence under it — see [`hint`] — and those stack.
pub fn frow<R>(ui: &mut Ui, th: &Theme, label: &str, add: impl FnOnce(&mut Ui) -> R) -> R {
    ui.add_space(4.0);
    ui.horizontal_top(|ui| {
        ui.spacing_mut().item_spacing.x = 14.0;
        let (r, _) = ui.allocate_exact_size(vec2(FROW_LAB_W, 22.0), Sense::hover());
        if ui.is_rect_visible(r) {
            ui.painter().text(
                pos2(r.right(), r.center().y),
                Align2::RIGHT_CENTER,
                label,
                FontId::monospace(11.5),
                th.ink_2,
            );
        }
        ui.vertical(|ui| {
            ui.spacing_mut().item_spacing.y = 6.0;
            add(ui)
        })
        .inner
    })
    .inner
}

// ── the sentence under a control ────────────────────────────────────────────

/// What a [`hint`] or a [`statline`] is saying.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Tone {
    /// What the control does. `--ink-2`.
    Plain,
    /// What it is doing now, and it is fine. `--ok-ink`.
    Ok,
    /// What it is doing now, and it is not. `--no-ink`.
    No,
}

impl Tone {
    fn ink(self, th: &Theme) -> Color32 {
        match self {
            // `--ok-ink` AND NOT `--ok`: the lamp value is a FILL and reads
            // 2.20:1 as a word on a card. The token block says so.
            Tone::Plain => th.ink_2,
            Tone::Ok => th.ok_ink,
            Tone::No => th.no_ink,
        }
    }
}

/// `.hint` — the sentence under a control, in sentence case, saying what the
/// control will do.
///
/// IT IS SET AT THE ROW'S SIZE, NOT UNDER IT. The instinct is to shrink a note,
/// and a note nobody reads is a note that is not there. `.mod-desc` settled
/// this at 11.5 for the same kind of text on a card; this is that rule where
/// there is no card.
pub fn hint(ui: &mut Ui, th: &Theme, tone: Tone, text: &str) {
    ui.label(mono(text, 11.5).color(tone.ink(th)));
}

// ── the status line ─────────────────────────────────────────────────────────

/// `.statline` — a lamp and what it means, at the foot of a pane.
///
/// IT IS NOT A TOAST AND IT DOES NOT GO AWAY. The thing it reports is true for
/// as long as it is true, and a message that leaves cannot be checked.
///
/// THE WORDS ARE ETCHED, NOT SET: a status line is a legend stamped on the
/// case, so it takes the caption's tracking and its caps.
pub fn statline(ui: &mut Ui, th: &Theme, lit: bool, tone: Tone, cap: &str) {
    ui.horizontal(|ui| {
        ui.spacing_mut().item_spacing.x = 9.0;
        let (r, _) = ui.allocate_exact_size(Vec2::splat(9.0), Sense::hover());
        if ui.is_rect_visible(r) {
            paint_lens(
                ui.painter(), th, r.center(), 9.0,
                if lit { Lens::Lit } else { Lens::Unlit },
            );
        }
        let mut job = egui::text::LayoutJob::default();
        job.append(
            &cap.to_uppercase(),
            0.0,
            egui::TextFormat {
                font_id: FontId::monospace(9.5),
                color: tone.ink(th),
                extra_letter_spacing: 9.5 * 0.14,
                ..Default::default()
            },
        );
        ui.label(ui.fonts(|f| f.layout_job(job)));
    });
}
