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

/// `--page` — the ground the whole document is printed on, and it is FLAT.
///
/// THE PAGE IS NOT RULED. The grid belongs to a BENCH — a surface a part was
/// put down on — and the page is not one: it is what the bench is standing in.
/// Rule it and the whole document becomes one enormous drafting table, with
/// the headings floating on the squares and every region reading as the same
/// drawing. `src/skew.css:7437` makes the argument in full.
pub fn page_fill(th: &Theme) -> egui::Color32 {
    th.pal.page.unwrap_or(th.pal.room)
}

/// `--desk-grid` — the ruling, laid over whatever is already there.
///
/// TWO PITCHES, 24 AND 120, both 1px, the fine one a quarter the weight of the
/// coarse one. That is what makes it read as a drafting surface rather than as
/// graph paper: you see the 120 and only find the 24 when you look for it.
///
/// `origin` IS THE GRID'S OWN ZERO, and it is a parameter because the answer
/// differs by one case. Everywhere on the page the ruling is pinned to the
/// viewport, so the document and its benches share one phase. Inside an app
/// WINDOW it is pinned to the window: a desk that slid under the cards as you
/// scrolled the page would be saying the desk belongs to the document rather
/// than to the application standing on it.
pub fn paint_grid(p: &egui::Painter, th: &Theme, rect: egui::Rect, origin: egui::Pos2) {
    for sh in grid_shapes(th, rect, origin) {
        p.add(sh);
    }
}

/// The ruling as SHAPES, for a caller that has to put it under its content.
/// A window reserves one slot before it lays anything out and fills it after,
/// which is the only way to get a background behind children in egui — so the
/// grid has to arrive as shapes rather than as paint.
pub fn grid_shapes(th: &Theme, rect: egui::Rect, origin: egui::Pos2) -> Vec<egui::Shape> {
    let mut out = Vec::new();
    // the ink is the skin's own: navy on the cool room, white on the dark one
    let base = match th.skin {
        crate::Skin::Light => egui::Color32::from_rgb(33, 62, 96),
        crate::Skin::Dark => egui::Color32::WHITE,
    };
    for (pitch, a) in [(24.0_f32, 0.035_f32), (120.0, 0.085)] {
        let col = base.gamma_multiply(a);
        let n0 = ((rect.left() - origin.x) / pitch).ceil();
        let mut x = origin.x + n0 * pitch;
        while x < rect.right() {
            out.push(egui::Shape::rect_filled(
                egui::Rect::from_min_size(egui::pos2(x, rect.top()), egui::vec2(1.0, rect.height())),
                egui::Rounding::ZERO, col));
            x += pitch;
        }
        let m0 = ((rect.top() - origin.y) / pitch).ceil();
        let mut y = origin.y + m0 * pitch;
        while y < rect.bottom() {
            out.push(egui::Shape::rect_filled(
                egui::Rect::from_min_size(egui::pos2(rect.left(), y), egui::vec2(rect.width(), 1.0)),
                egui::Rounding::ZERO, col));
            y += pitch;
        }
    }
    out
}
