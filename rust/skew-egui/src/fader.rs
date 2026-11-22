//! The vertical fader, matched to the documentation's FADER · VERTICAL BANK.
//!
//! Top to bottom: an LCD window with the live value in `--font-read`, a white
//! 8px slot with an inner top shadow, a thick black rod rising from the bottom
//! of the slot to the cap, a 24×16 ridged dark cap wearing the orange grip
//! line, quarter dashes down the left and fine dots down the right, and an
//! etched label under all of it.
//!
//! Three things make it read as hardware rather than as a slider: the rod is
//! **below** the cap and nearly fills the groove (a fader is pulled down against
//! its own travel, it is not a progress bar); the cap is the only dark mass in a
//! cream panel, so it is where the eye goes; and the LCD is **matte** — no bloom
//! at all, because a readout on cream is e-paper (`docs/PORTING.md` §3).

use crate::paint::{hex, mix, vgrad};
use crate::theme::{read_font, Theme};
use egui::{pos2, vec2, Align2, Color32, Rect, Rounding, Sense, Stroke, Ui};

// ── the fader's own hardware, in both skins ─────────────────────────────────
// A black rod and a dark ridged cap are not surfaces of the case, so they do not
// take a skin: the part is the same object on cream and on near-black. These are
// its material, tuned in the pen-plotter app and approved there.
const ROD: Color32 = hex(0x232528); // the stem below the cap
const CAP_REST: Color32 = hex(0x3A3D43);
const CAP_HOVER: Color32 = hex(0x43474E);
const CAP_DRAG: Color32 = hex(0x4A4E55);
const CAP_EDGE: Color32 = hex(0x202226);

/// Geometry, so a caller can lay out a bank of these without guessing.
pub const FADER_SIZE: egui::Vec2 = egui::Vec2 { x: 54.0, y: 136.0 };

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum FaderState {
    Rest,
    Hover,
    /// Held. The cap lightens; the value tracks the pointer live.
    Dragging,
}

/// Paint a fader into `rect` with no interaction. [`fader`] is this plus the drag.
pub fn paint_fader(
    p: &egui::Painter,
    th: &Theme,
    rect: Rect,
    label: &str,
    v: f32,
    min: f32,
    max: f32,
    state: FaderState,
) {
    let (lcd_h, slot_h, gap, lab_h) = (16.0, 96.0, 6.0, 12.0);
    let cx = rect.center().x;
    let slot_x = cx - 7.0;
    let slot = Rect::from_center_size(
        pos2(slot_x, rect.top() + lcd_h + gap + slot_h / 2.0),
        vec2(8.0, slot_h),
    );

    // LCD window: dim, wide-tracked digits
    let lcd = Rect::from_center_size(pos2(cx, rect.top() + lcd_h / 2.0), vec2(48.0, lcd_h));
    p.rect_filled(lcd, Rounding::same(3.0), th.lcd_face);
    p.rect_stroke(lcd, Rounding::same(3.0), Stroke::new(1.0, th.edge_ctl));
    p.line_segment(
        [
            pos2(lcd.left() + 3.0, lcd.top() + 1.5),
            pos2(lcd.right() - 3.0, lcd.top() + 1.5),
        ],
        Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, 16)),
    );
    p.text(
        lcd.center(),
        Align2::CENTER_CENTER,
        format!("{:.0}", v),
        read_font(9.0),
        th.lcd_ink,
    );

    // slot: white groove with an inner top shadow
    p.rect_filled(slot, Rounding::same(4.5), Color32::WHITE);
    p.rect_stroke(slot, Rounding::same(4.5), Stroke::new(1.0, th.edge_ctl));
    p.line_segment(
        [
            pos2(slot.left() + 2.5, slot.top() + 2.0),
            pos2(slot.right() - 2.5, slot.top() + 2.0),
        ],
        Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, 18)),
    );

    let t = ((max - v) / (max - min)).clamp(0.0, 1.0);
    let cap_y = slot.top() + 11.0 + t * (slot_h - 22.0);

    // the black rod below the cap, nearly filling the groove
    let stem = Rect::from_min_max(
        pos2(slot_x - 3.0, cap_y),
        pos2(slot_x + 3.0, slot.bottom() - 2.5),
    );
    if stem.height() > 4.0 {
        p.rect_filled(stem, Rounding::same(3.0), ROD);
    }

    // ticks: quarter dashes left, fine dots right
    for i in 0..=4 {
        let y = slot.top() + 4.0 + (slot_h - 8.0) * i as f32 / 4.0;
        p.line_segment(
            [pos2(slot.left() - 8.0, y), pos2(slot.left() - 4.0, y)],
            Stroke::new(1.0, th.ink_3),
        );
    }
    for i in 0..=12 {
        let y = slot.top() + 4.0 + (slot_h - 8.0) * i as f32 / 12.0;
        p.circle_filled(pos2(cx + 10.0, y), 0.8, th.ink_3);
    }

    // the cap: chunky, ridged, orange grip line in the middle
    let cap = Rect::from_center_size(pos2(slot_x, cap_y), vec2(24.0, 16.0));
    p.rect_filled(
        cap.translate(vec2(0.0, 1.5)),
        Rounding::same(4.0),
        Color32::from_rgba_unmultiplied(0, 0, 0, 34),
    );
    let base = match state {
        FaderState::Dragging => CAP_DRAG,
        FaderState::Hover => CAP_HOVER,
        FaderState::Rest => CAP_REST,
    };
    vgrad(
        p,
        cap,
        4.0,
        mix(base, Color32::WHITE, 0.16),
        mix(base, Color32::BLACK, 0.18),
    );
    p.rect_stroke(cap, Rounding::same(4.0), Stroke::new(1.0, CAP_EDGE));
    // the grip: fine ridges above and below the orange line, not two lone rules
    for dy in [-6.0_f32, -4.0, -2.0, 2.0, 4.0, 6.0] {
        p.line_segment(
            [
                pos2(cap.left() + 3.5, cap.center().y + dy),
                pos2(cap.right() - 3.5, cap.center().y + dy),
            ],
            Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, 60)),
        );
    }
    p.line_segment(
        [
            pos2(cap.left() + 2.5, cap.center().y),
            pos2(cap.right() - 2.5, cap.center().y),
        ],
        Stroke::new(2.0, th.primary),
    );

    // etched label
    p.text(
        pos2(cx, rect.bottom() - lab_h / 2.0),
        Align2::CENTER_CENTER,
        label,
        read_font(8.0),
        th.ink_2,
    );
}

/// An interactive fader. Returns `(commit, dragging)`: **the value moves live
/// while dragging and `commit` fires once on release**, which is the contract a
/// machine needs — the number on screen is what the hand is doing, and the
/// device is told only when the hand lets go.
pub fn fader(
    ui: &mut Ui,
    th: &Theme,
    label: &str,
    v: &mut f32,
    min: f32,
    max: f32,
) -> (bool, bool) {
    let (lcd_h, slot_h, gap) = (16.0, 96.0, 6.0);
    let (rect, _) = ui.allocate_exact_size(FADER_SIZE, Sense::hover());
    let cx = rect.center().x;
    let slot = Rect::from_center_size(
        pos2(cx - 7.0, rect.top() + lcd_h + gap + slot_h / 2.0),
        vec2(8.0, slot_h),
    );
    let id = ui.id().with(label);
    let resp = ui
        .interact(slot.expand2(vec2(12.0, 4.0)), id, Sense::click_and_drag())
        .on_hover_cursor(egui::CursorIcon::Grab);
    let dragging = resp.dragged();
    let mut commit = false;
    if dragging || resp.clicked() {
        if let Some(mp) = resp.interact_pointer_pos() {
            let tt = ((mp.y - slot.top()) / slot.height()).clamp(0.0, 1.0);
            *v = (max - tt * (max - min)).round();
        }
    }
    if resp.drag_stopped() || resp.clicked() {
        commit = true;
    }
    if !ui.is_rect_visible(rect) {
        return (commit, dragging);
    }
    let state = if dragging {
        FaderState::Dragging
    } else if resp.hovered() {
        FaderState::Hover
    } else {
        FaderState::Rest
    };
    paint_fader(ui.painter(), th, rect, label, *v, min, max, state);
    (commit, dragging)
}
