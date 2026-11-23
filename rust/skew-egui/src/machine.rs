//! The machine parts: the panel, the glass, the engraved caption, the group
//! bezel, the DRO and the jog pad.
//!
//! These are `src/skew-machine.css` and the `[data-skin="light"]` block of
//! `src/skew.css`, ported by their anatomy rather than by their declarations —
//! egui has no inset shadow, so each one is the lines that shadow was drawing.
//! Every value carries the rule it came from.

use crate::key::{key, KeyStyle};
use crate::paint::{edge_line, glass, snap_rect};
use crate::theme::{mono, read_font, Theme};
use egui::{
    pos2, vec2, Align, Align2, Color32, Layout, Margin, Rect, Rounding, Sense, Stroke, Ui, Vec2,
};

// ── the glass ───────────────────────────────────────────────────────────────

/// `.lcd` — a lit window: 26px tall, 11px of air each side, the bitmap face at
/// 12px, and **no smoothing and no tracking**. `version.js` 1.112.0: Silkscreen
/// draws every character on a fixed cell with its clear space built in, so
/// tracking on top of that is spacing applied twice.
///
/// In light it is e-paper, not a lamp: `--epaper` glass, an `--epaper-bezel`
/// frame, the near wall's shadow across the top of the glass, and a white line
/// under the box where the case comes back up.
pub fn lcd(ui: &mut Ui, th: &Theme, text: &str) -> egui::Response {
    let font = read_font(12.0);
    let galley = ui
        .painter()
        .layout_no_wrap(text.to_owned(), font.clone(), th.epaper_ink);
    let size = vec2(galley.rect.width() + 22.0, 26.0);
    let (rect, resp) = ui.allocate_exact_size(size, Sense::hover());
    if ui.is_rect_visible(rect) {
        paint_lcd(ui.painter(), th, rect, text);
    }
    resp
}

/// `.lcd` into a rect you own — for a readout placed by hand.
pub fn paint_lcd(p: &egui::Painter, th: &Theme, rect: Rect, text: &str) {
    let rect = snap_rect(p, rect);
    let r = Rounding::same(3.0);
    p.rect_filled(rect, r, th.epaper);
    glass(p, rect, 3.0, th.glass_streak, th.glass_sheen);
    // inset 0 1px 2px rgba(0,0,0,.16) — the bezel's near wall on the glass
    edge_line(
        p,
        rect,
        3.0,
        1.5,
        true,
        Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, 41)),
    );
    p.rect_stroke(rect, r, Stroke::new(1.0, th.epaper_bezel));
    // and no white line under the module, for the reason the DRO has none
    p.text(
        rect.center(),
        Align2::CENTER_CENTER,
        text,
        read_font(12.0),
        th.epaper_ink,
    );
}

// ── the engraved caption ────────────────────────────────────────────────────

/// `.cut` — an engraved caption over a group inside a panel: a word, then a
/// rule that runs to the right edge and dies out.
///
/// It names a REGION, where [`crate::section`] (`.bay-cap`) names a bay and
/// [`crate::label`] tags an object. The rule is a gradient because a cut in
/// metal catches the lamp at one end and not at the other; on cream the
/// engraving itself goes — `version.js` 1.111.0, a white line under a glyph the
/// colour of the panel erases the letterform it was meant to light — so the
/// word is ink and only the rule survives.
pub fn cut(ui: &mut Ui, th: &Theme, title: &str) {
    ui.horizontal(|ui| {
        ui.spacing_mut().item_spacing.x = 9.0;
        ui.label(mono(title, 9.0).color(th.ink_2));
        // one pixel tall, not `available_height()` — a horizontal layout hands
        // that out as the whole of the rest of the panel, and the caption row
        // would take it
        let (rect, _) = ui.allocate_exact_size(vec2(ui.available_width(), 1.0), Sense::hover());
        if !ui.is_rect_visible(rect) {
            return;
        }
        let y = rect.center().y;
        gradient_line(
            ui.painter(),
            pos2(rect.left(), y),
            pos2(rect.right(), y),
            Color32::from_rgba_unmultiplied(0, 0, 0, 179),
            Color32::TRANSPARENT,
        );
    });
}

/// A 1px line whose colour runs from one end to the other. Two triangles,
/// because egui strokes one colour at a time.
fn gradient_line(p: &egui::Painter, a: egui::Pos2, b: egui::Pos2, from: Color32, to: Color32) {
    use egui::epaint::{Mesh, Vertex, WHITE_UV};
    let mut m = Mesh::default();
    for (pt, c) in [
        (pos2(a.x, a.y - 0.5), from),
        (pos2(a.x, a.y + 0.5), from),
        (pos2(b.x, b.y + 0.5), to),
        (pos2(b.x, b.y - 0.5), to),
    ] {
        m.vertices.push(Vertex {
            pos: pt,
            uv: WHITE_UV,
            color: c,
        });
    }
    m.indices.extend_from_slice(&[0, 1, 2, 0, 2, 3]);
    p.add(m);
}

// ── the group bezel ─────────────────────────────────────────────────────────

/// `--surround` — what a GROUP is made of: a band of the case standing slightly
/// proud, lit along its top edge where it turns up to meet the lamp, a dark line
/// where the body turns under, and the control edge all the way round.
///
/// Not a tint with a hairline. `src/skew.css`: a sub-panel drawn that way is a
/// rectangle drawn ON the panel rather than a piece OF it, and the part inside
/// it looks placed rather than held.
///
/// **A bezel does not draw inside a bezel** (`version.js` 1.109.1, made general
/// in 1.113.0): what is mounted in the outer frame is the inner group entire, so
/// the inner one keeps its padding and its gaps and loses the frame.
pub fn bezel_frame(th: &Theme) -> egui::Frame {
    egui::Frame::none()
        .fill(th.paper)
        .rounding(Rounding::same(th.r_sm))
        .inner_margin(11.0)
}

/// The three lines `--surround` is made of. Call it with the rect the frame took.
pub fn bezel_edges(p: &egui::Painter, th: &Theme, rect: Rect) {
    let rect = snap_rect(p, rect);
    let r = Rounding::same(th.r_sm);
    // inset 0 1px 0 rgba(255,255,255,1)
    edge_line(p, rect, th.r_sm, 1.0, true, Stroke::new(1.0, Color32::WHITE));
    // inset 0 -1.5px 0 rgba(0,0,0,.11)
    edge_line(
        p,
        rect,
        th.r_sm,
        1.0,
        false,
        Stroke::new(1.5, Color32::from_rgba_unmultiplied(0, 0, 0, 28)),
    );
    // inset 0 0 0 1px var(--edge-ctl)
    p.rect_stroke(rect, r, Stroke::new(1.0, th.edge_ctl));
}

// ── the panel ───────────────────────────────────────────────────────────────

/// `.box` — the panel: the case's own face, a hairline edge, `--r`, and a head
/// separated from the body by one hairline and nothing else.
///
/// `src/skew.css`: a head that is a TINT needs its corners mitred against the
/// panel's radius; a head that is the case's own face has no join to get wrong.
/// The name is the loudest thing in the row because it is bold ink, not because
/// it sits on a different ground.
///
/// `chip` is the one fact the whole panel is qualified by — `G54` over three
/// axes, the step size over a jog pad. It is a fact about the machine, not about
/// the row, which is why it belongs in the head and not in each cell.
///
/// Constrain the width before calling (`ui.set_max_width`), or the head's chip
/// goes wherever the parent's layout is wide.
pub fn panel<R>(
    ui: &mut Ui,
    th: &Theme,
    title: &str,
    chip: Option<&str>,
    add: impl FnOnce(&mut Ui) -> R,
) -> R {
    let mut head_bottom = 0.0_f32;
    let out = egui::Frame::none()
        .fill(th.case_face)
        .stroke(Stroke::new(1.0, th.edge))
        .rounding(Rounding::same(th.r))
        .show(ui, |ui| {
            // A FRAME INHERITS ITS PARENT'S LAYOUT, which is how a panel dropped
            // into a row comes out as a row: head, body and every part in it laid
            // end to end. A panel is a stack by construction, so it says so here
            // rather than relying on where it was called.
            let w = ui.available_width();
            ui.vertical(|ui| {
            ui.set_min_width(w);
            let head = egui::Frame::none()
                .inner_margin(Margin {
                    left: 18.0,
                    right: 16.0,
                    top: 11.0,
                    bottom: 11.0,
                })
                .show(ui, |ui| {
                    let w = ui.available_width();
                    ui.allocate_ui_with_layout(
                        vec2(w, 26.0),
                        Layout::left_to_right(Align::Center),
                        |ui| {
                            ui.label(mono(title, 12.0).strong().color(th.ink));
                            if let Some(c) = chip {
                                ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                                    lcd(ui, th, c);
                                });
                            }
                        },
                    );
                });
            head_bottom = head.response.rect.bottom();
            egui::Frame::none()
                .inner_margin(12.0)
                .show(ui, |ui| {
                    ui.spacing_mut().item_spacing.y = 12.0;
                    add(ui)
                })
                .inner
            })
            .inner
        });
    let rect = out.response.rect;
    let p = ui.painter();
    p.hline(
        rect.left() + 1.0..=rect.right() - 1.0,
        crate::paint::snap_line(p, head_bottom),
        Stroke::new(1.0, th.edge),
    );
    // --shadow-card, light: a lit lip and the line where the case turns under
    p.hline(
        rect.left() + th.r..=rect.right() - th.r,
        crate::paint::snap_line(p, rect.top() + 1.0),
        Stroke::new(1.0, Color32::from_rgba_unmultiplied(255, 255, 255, 230)),
    );
    p.hline(
        rect.left() + th.r..=rect.right() - th.r,
        crate::paint::snap_line(p, rect.bottom() - 1.0),
        Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, 14)),
    );
    out.inner
}

// ── the DRO ─────────────────────────────────────────────────────────────────

/// `.dro` — a coordinate under glass, per axis, with its own colour.
///
/// Not `.readout`. A machine position is the one number you read from across the
/// room while your hands are on the work; it belongs to an AXIS rather than to a
/// control, and it has to stay legible as a coordinate — sign, three decimals,
/// never reflowing as digits come and go.
///
/// **The colour is the axis and nothing else.** The legend and the pip are lit in
/// the axis colour; the numerals stay the same ink for all three, because tinting
/// them trades the one thing a DRO must do for a decoration. X red, Y green,
/// Z blue is a CNC convention this system does not own — the caller passes it
/// (`docs/PORTING.md` part two rules it the app's).
///
/// **`travel` is a place, not a quantity.** 0.0 is this axis's soft minimum and
/// 1.0 its maximum, and the pip rides between them. Drawn as a fill it read as
/// "how much", which is the wrong question about a coordinate: at zero, X and Y
/// drew nothing while Z sat three quarters along and looked nearly finished.
///
/// `live` is the readout being driven. On black that is a hotter phosphor; on
/// paper there is no hotter, so it is the accent — and the digits do not change
/// size or weight, because a readout whose metrics move while it is being driven
/// is one you cannot read while it is being driven.
///
/// Returns the SET 0 key's response, which sits ON the bezel and not in the glass.
pub fn dro(
    ui: &mut Ui,
    th: &Theme,
    axis: &str,
    ax: Color32,
    value: &str,
    travel: f32,
    live: bool,
) -> egui::Response {
    let (rect, _) = ui.allocate_exact_size(vec2(ui.available_width(), 68.0), Sense::hover());
    if ui.is_rect_visible(rect) {
        let p = ui.painter();
        let rect = snap_rect(p, rect);
        let r = Rounding::same(9.0);
        p.rect_filled(rect, r, th.epaper);
        glass(p, rect, 9.0, th.glass_streak, th.glass_sheen);
        // inset 0 2px 5px rgba(0,0,0,.16) — the near wall's shadow across the glass
        for (d, a) in [(1.5_f32, 26_u8), (3.0, 14), (4.5, 7)] {
            edge_line(
                p,
                rect,
                9.0,
                d,
                true,
                Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, a)),
            );
        }
        // NO WHITE LINE ALONG THE BOTTOM. The CSS has one — `inset 0 -1px 0
        // rgba(255,255,255,.75)`, the far wall of the cut coming back up to the
        // surface — and on a module this wide it draws as a hard white rule
        // under the glass rather than as a wall catching the lamp. The light on
        // this part is the moulded top edge, and one part has one lamp.
        p.rect_stroke(rect, r, Stroke::new(1.0, th.epaper_bezel));

        // the legend, and the value under it
        p.text(
            pos2(rect.left() + 11.0, rect.top() + 9.0),
            Align2::LEFT_TOP,
            axis,
            egui::FontId::monospace(11.0),
            ax,
        );
        p.text(
            pos2(rect.left() + 11.0, rect.top() + 28.0),
            Align2::LEFT_TOP,
            value,
            read_font(21.0),
            if live { th.primary } else { th.epaper_ink },
        );

        // the travel scale: a channel cut in the case, with a lit pip riding it
        let bar = snap_rect(
            p,
            Rect::from_min_max(
                pos2(rect.left() + 11.0, rect.bottom() - 13.0),
                pos2(rect.right() - 11.0, rect.bottom() - 8.0),
            ),
        );
        p.rect_filled(bar, Rounding::same(3.0), th.paper);
        edge_line(
            p,
            bar,
            3.0,
            1.0,
            true,
            Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, 36)),
        );
        p.rect_stroke(bar, Rounding::same(3.0), Stroke::new(1.0, th.edge_ctl));
        let x = bar.left() + travel.clamp(0.0, 1.0) * bar.width();
        let pip = Rect::from_center_size(pos2(x, bar.center().y), vec2(5.0, bar.height() + 2.0));
        p.rect_filled(pip, Rounding::same(2.0), ax);
    }
    // the zero key sits on the bezel, top right
    let kr = Rect::from_min_size(
        pos2(rect.right() - 9.0 - 46.0, rect.top() + 7.0),
        vec2(46.0, 18.0),
    );
    let mut cu = ui.new_child(egui::UiBuilder::new().max_rect(kr));
    key(
        &mut cu,
        th,
        "SET 0",
        &KeyStyle {
            text_size: 8.5,
            ..KeyStyle::new(th.card, th.ink_2)
        },
        kr.size(),
        true,
        false,
    )
}

// ── the jog pad ─────────────────────────────────────────────────────────────

/// What a press of [`jog_pad`] was.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum JogPress {
    /// `axis` 0/1/2 for X/Y/Z, `dir` ±1 — one step.
    Step { axis: usize, dir: i32 },
    /// Machine zero. A destination, not a nudge.
    Home,
}

/// `.jog-grid` — a direction pad where **the arrangement IS the axis**.
///
/// X across, Y up, Z on its own column, because Z is a different axis in a
/// different plane and putting it in the same cross would say it is not.
///
/// The plate is a bezel like every other group in this skin; the keys are
/// ordinary caps. Only HOME needs saying: it is RECESSED on purpose — a
/// destination rather than a nudge, and not the thing your thumb should find
/// first on a machine that moves.
pub fn jog_pad(ui: &mut Ui, th: &Theme, enabled: bool) -> Option<JogPress> {
    const CELL: Vec2 = Vec2 { x: 44.0, y: 44.0 };
    let grid: [[Option<(&str, usize, i32)>; 4]; 3] = [
        [None, Some(("Y+", 1, 1)), None, Some(("Z+", 2, 1))],
        [Some(("X−", 0, -1)), None, Some(("X+", 0, 1)), None],
        [None, Some(("Y−", 1, -1)), None, Some(("Z−", 2, -1))],
    ];
    let mut hit = None;
    let out = bezel_frame(th).show(ui, |ui| {
        ui.vertical(|ui| {
        ui.spacing_mut().item_spacing = vec2(7.0, 7.0);
        for (row, cells) in grid.into_iter().enumerate() {
            ui.horizontal(|ui| {
                for (col, cell) in cells.into_iter().enumerate() {
                    match cell {
                        Some((t, axis, dir)) => {
                            if key(
                                ui,
                                th,
                                t,
                                &KeyStyle::new(th.card, th.ink),
                                CELL,
                                enabled,
                                true,
                            )
                            .clicked()
                            {
                                hit = Some(JogPress::Step { axis, dir });
                            }
                        }
                        None if row == 1 && col == 1 => {
                            if home_key(ui, th, CELL, enabled).clicked() {
                                hit = Some(JogPress::Home);
                            }
                        }
                        None => {
                            ui.allocate_exact_size(CELL, Sense::hover());
                        }
                    }
                }
            });
        }
        });
    });
    bezel_edges(ui.painter(), th, out.response.rect);
    hit
}

/// The recessed micro key in the middle of the pad: paper floor, the near
/// wall's shadow, the case's hairline, and the legend in `--ink-2`.
fn home_key(ui: &mut Ui, th: &Theme, size: Vec2, enabled: bool) -> egui::Response {
    let sense = if enabled { Sense::click() } else { Sense::hover() };
    let (rect, resp) = ui.allocate_exact_size(size, sense);
    let resp = if enabled {
        resp.on_hover_cursor(egui::CursorIcon::PointingHand)
    } else {
        resp
    };
    if enabled {
        crate::key::clicky(ui, &resp);
    }
    if !ui.is_rect_visible(rect) {
        return resp;
    }
    let p = ui.painter();
    let r = Rounding::same((rect.height() * 0.24).clamp(5.0, 10.0));
    p.rect_filled(rect, r, th.paper);
    let rr = (rect.height() * 0.24).clamp(5.0, 10.0);
    for (d, a) in [(1.5_f32, 26_u8), (3.0, 12)] {
        edge_line(
            p,
            rect,
            rr,
            d,
            true,
            Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, a)),
        );
    }
    p.rect_stroke(rect, r, Stroke::new(1.0, th.edge));
    let ink = if enabled && resp.hovered() {
        th.ink
    } else {
        th.ink_2
    };
    // the glyph: a roof over a line — machine zero, the corner everything is from
    let c = rect.center();
    let s = 6.0;
    p.add(egui::Shape::line(
        vec![
            pos2(c.x - s, c.y - 1.0),
            pos2(c.x, c.y - s - 1.0),
            pos2(c.x + s, c.y - 1.0),
        ],
        Stroke::new(1.4, ink),
    ));
    p.line_segment(
        [pos2(c.x - s + 1.5, c.y + 2.0), pos2(c.x + s - 1.5, c.y + 2.0)],
        Stroke::new(1.4, ink),
    );
    p.text(
        pos2(c.x, rect.bottom() - 8.0),
        Align2::CENTER_CENTER,
        "HOME",
        egui::FontId::monospace(7.5),
        ink,
    );
    resp
}
