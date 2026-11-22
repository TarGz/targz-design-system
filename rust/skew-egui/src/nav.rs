//! The nav bar — `.strip.nav-strip`, the chrome that is on every page.
//!
//! Left to right: the wordmark, a channel, the page keys as one interlocked
//! bar, a channel, the sections key, the skin key and the version window.
//!
//! **The split is one channel and the tools live to the right of it.** The bar
//! carries DOCUMENTS on the left and the things you do to the page on the
//! right, and `docs/skew-nav.js` says why there is only one: everything right
//! of a single channel is the workspace, which is the arrangement the app dock
//! already uses. Two channels would claim three groups where there are two.
//!
//! The wordmark is the way home, so there is no HOME key beside it — that is
//! the same door twice, and it costs a slot in a bar that has to fit on a
//! phone.

use crate::key::{key, paint_pkey_down, pkey_bar, KeyStyle};
use crate::machine::lcd;
use crate::theme::{mono, Theme};
use egui::{pos2, vec2, Color32, Rounding, Sense, Stroke, Ui, Vec2};

/// What the bar is showing.
pub struct Nav<'a> {
    /// The wordmark. It is the way home.
    pub brand: &'a str,
    /// The documents, in the order they are in the registry.
    pub pages: &'a [&'a str],
    /// The version, in the readout at the far right.
    pub version: &'a str,
    /// Whether the light skin is on — the skin key shows its own state.
    pub light: bool,
}

/// What was pressed.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum NavHit {
    /// A page key. The index is into `Nav::pages`.
    Page(usize),
    /// The sections key — the way into a long page, not a destination.
    Sections,
    /// The skin key.
    Skin,
}

/// `.chan` — the channel the bar is split by: a slot milled in the case, which
/// in this skin is the floor colour and a hairline and nothing else.
fn channel(ui: &mut Ui, th: &Theme) {
    let (rect, _) = ui.allocate_exact_size(vec2(3.0, 22.0), Sense::hover());
    if !ui.is_rect_visible(rect) {
        return;
    }
    let p = ui.painter();
    p.rect_filled(rect, Rounding::same(1.5), th.paper);
    p.rect_stroke(rect, Rounding::same(1.5), Stroke::new(1.0, th.edge));
}

/// Draw the bar. `current` is the page that is lit; it is written on a press.
pub fn nav_bar(ui: &mut Ui, th: &Theme, nav: &Nav, current: &mut usize) -> Option<NavHit> {
    let mut hit = None;
    let out = egui::Frame::none()
        .fill(th.case_face)
        .stroke(Stroke::new(1.0, th.edge))
        .rounding(Rounding::same(th.r))
        .inner_margin(egui::Margin::symmetric(16.0, 10.0))
        .show(ui, |ui| {
            ui.horizontal(|ui| {
                ui.spacing_mut().item_spacing.x = 12.0;
                // the wordmark: etched caps, and the only thing here set in ink
                ui.label(mono(nav.brand, 13.0).strong().color(th.ink));
                channel(ui, th);

                // the documents, as one interlocked bar
                let before = *current;
                pkey_bar(ui, th, nav.pages, current, vec2(96.0, 34.0));
                if *current != before {
                    hit = Some(NavHit::Page(*current));
                }

                channel(ui, th);

                // the sections key — a door, so it is a key and not a page
                let r = key(
                    ui,
                    th,
                    "",
                    &KeyStyle::new(th.card, th.ink),
                    vec2(40.0, 34.0),
                    true,
                    false,
                );
                sections_glyph(ui, th, r.rect);
                if r.clicked() {
                    hit = Some(NavHit::Sections);
                }

                // the skin key says where the page STANDS, not where it is
                // going: it reads LIGHT and is lit when the light skin is on. A
                // key that read DARK while the page was light would be the one
                // control here to be read as an instruction rather than a state.
                let size = vec2(76.0, 34.0);
                if nav.light {
                    let (rect, resp) = ui.allocate_exact_size(size, Sense::click());
                    let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
                    if ui.is_rect_visible(rect) {
                        paint_pkey_down(ui.painter(), th, rect, "LIGHT", 11.0);
                    }
                    if resp.clicked() {
                        hit = Some(NavHit::Skin);
                    }
                } else if key(
                    ui,
                    th,
                    "LIGHT",
                    &KeyStyle::new(th.card, th.ink),
                    size,
                    true,
                    false,
                )
                .clicked()
                {
                    hit = Some(NavHit::Skin);
                }

                lcd(ui, th, nav.version);
            });
        });
    let _ = out;
    hit
}

/// The sections key's mark: a list — three rules with their bullets.
fn sections_glyph(ui: &Ui, th: &Theme, rect: egui::Rect) {
    if !ui.is_rect_visible(rect) {
        return;
    }
    let p = ui.painter();
    let c = rect.center() - vec2(0.0, 1.5); // the cap's face, not the whole key
    let w: f32 = 14.0;
    for i in 0..3 {
        let y = c.y - 4.0 + i as f32 * 4.0;
        p.rect_filled(
            egui::Rect::from_min_size(pos2(c.x - w / 2.0, y - 0.5), vec2(2.0, 2.0)),
            0.5,
            th.ink,
        );
        p.line_segment(
            [pos2(c.x - w / 2.0 + 4.5, y + 0.5), pos2(c.x + w / 2.0, y + 0.5)],
            Stroke::new(1.2, th.ink),
        );
    }
    let _ = Color32::WHITE;
}

/// The bar's own height, for a window that reserves room for it.
pub const NAV_HEIGHT: f32 = 54.0;

/// Spacing between a bar and whatever it sits over.
pub const NAV_GAP: Vec2 = Vec2 { x: 0.0, y: 12.0 };
