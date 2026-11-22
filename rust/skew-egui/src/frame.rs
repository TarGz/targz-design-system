//! Panels, wells and the two bits of etched type that label them.

use crate::theme::{mono, Theme};
use egui::{pos2, Color32, Rect, Rounding, Stroke, Ui, Vec2};

/// Panel chassis: a card fill with `--space-5` / `--space-4` padding.
///
/// It draws **no second frame**. `version.js` 1.113.0: the no-nested-frame rule
/// is general — a tint is a frame on a surface this pale, and what is mounted in
/// a panel is the inner group *entire*, so the outer one wins and the inner keeps
/// only its padding and its gaps.
pub fn panel_frame(th: &Theme, fill: Color32) -> egui::Frame {
    egui::Frame::none()
        .fill(fill)
        .inner_margin(egui::Margin::symmetric(th.pal.space_5, th.pal.space_4))
}

/// Recessed well — `--recess`, which in the light skin is an edge ring plus a
/// soft inner top shadow and nothing else. For consoles, lists, readouts and
/// anything cut into a panel.
///
/// The nine-layer dark `--recess` is not this. `docs/PORTING.md` §1 has its
/// anatomy: top strong, sides equal, bottom weak, plus the white return — and
/// the light skin runs the same shape at about a sixth of the alpha, which is
/// why two lines are enough here.
pub fn well_frame(th: &Theme) -> egui::Frame {
    egui::Frame::none()
        .fill(th.paper)
        .stroke(Stroke::new(1.0, th.edge))
        .rounding(Rounding::same(th.r_key))
        .inner_margin(6.0)
}

/// Paint the well's inner top shadow over its rect — call after the frame, with
/// the rect the frame actually took.
pub fn well_shadow(ui: &Ui, th: &Theme, rect: Rect) {
    ui.painter().line_segment(
        [
            pos2(rect.left() + th.r_key, rect.top() + 1.5),
            pos2(rect.right() - th.r_key, rect.top() + 1.5),
        ],
        Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, 10)),
    );
}

/// Section title, after Skew's `.bay-cap`: a small accent jewel, then etched caps.
pub fn section(ui: &mut Ui, th: &Theme, title: &str) {
    ui.horizontal(|ui| {
        let (r, _) = ui.allocate_exact_size(Vec2::splat(4.0), egui::Sense::hover());
        ui.painter().rect_filled(r, 1.0, th.primary);
        ui.label(mono(title, 10.5).color(th.primary).strong());
    });
}

/// A field label: `--ink-2`, small, mono.
pub fn label(ui: &mut Ui, th: &Theme, t: &str) {
    ui.label(mono(t, 9.5).color(th.ink_2));
}
