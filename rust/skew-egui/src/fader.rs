//! The vertical fader, matched to the documentation's FADER · VERTICAL BANK.
//!
//! Top to bottom, as `.fader.vert` stacks it (column-reverse, 10px gaps in a
//! light `.fbank`): the e-paper readout, a 34×136 slot, the etched name.
//!
//! In the slot, from `src/skew.css`:
//! * the track — 9px, `--paper` with an `--edge-ctl` ring, and a `--card`
//!   trench inset 2px inside it (`[data-skin="light"] .ftrack::before`);
//! * the fill — `--ink`, inset 2px, from the cap down to the floor. A fader is
//!   pulled down against its own travel; the dark fill is what makes the cap's
//!   position readable;
//! * the scale on the right — quarter marks 4px in `--ink-2`, fifths 2px in
//!   `#C9C3BA`;
//! * the cap — 24×17, radius 5, a horizontal six-stop gradient, knurled on the
//!   two shoulders and bare across the waist, with the one lit mark standing
//!   vertical in the middle: `--led-hot` glowing `--led`.

use crate::machine::paint_lcd;
use crate::paint::{hex, mix};
use crate::theme::Theme;
use egui::epaint::{Mesh, Vertex, WHITE_UV};
use egui::text::{LayoutJob, TextFormat};
use egui::{pos2, vec2, Color32, FontId, Rect, Rounding, Sense, Stroke, Ui};

// `.fader.vert .fcap` background, left to right
const CAP_STOPS: [(f32, Color32); 6] = [
    (0.00, hex(0x585D66)),
    (0.16, hex(0x3A3E45)),
    (0.46, hex(0x22252A)),
    (0.54, hex(0x1A1C20)),
    (0.86, hex(0x33373D)),
    (1.00, hex(0x4C5158)),
];
// `--tick-sub` in the light skin
const TICK_SUB: Color32 = hex(0xC9C3BA);

const LCD_H: f32 = 18.0;
const GAP: f32 = 10.0;
const SLOT_H: f32 = 136.0;
const SLOT_W: f32 = 34.0;
const LAB_H: f32 = 12.0;
const CAP: egui::Vec2 = egui::Vec2 { x: 24.0, y: 17.0 };

/// Geometry, so a caller can lay out a bank of these without guessing.
pub const FADER_SIZE: egui::Vec2 = egui::Vec2 {
    x: 56.0,
    y: LCD_H + GAP + SLOT_H + GAP + LAB_H,
};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum FaderState {
    Rest,
    Hover,
    /// Held. The cap lightens; the value tracks the pointer live.
    Dragging,
}

fn slot_rect(rect: Rect) -> Rect {
    Rect::from_min_size(
        pos2(rect.center().x - SLOT_W / 2.0, rect.top() + LCD_H + GAP),
        vec2(SLOT_W, SLOT_H),
    )
}

/// The cap's centre runs from 8.5px under the top of the slot to 8.5px above
/// its floor — the kit's `usable = height - CAP_W`.
fn cap_y(slot: Rect, t: f32) -> f32 {
    slot.bottom() - CAP.y / 2.0 - t * (SLOT_H - CAP.y)
}

/// Fill a rounded rect with a horizontal gradient, exactly: vertical strips,
/// each column clipped to the corner arcs. Paint an AA fill under it first.
fn hgrad(p: &egui::Painter, rect: Rect, radius: f32, col: impl Fn(f32) -> Color32) {
    let w = rect.width();
    let mut xs: Vec<f32> = (0..=(w.ceil() as usize)).map(|i| (i as f32).min(w)).collect();
    xs.dedup();
    let half = |x: f32| -> f32 {
        let dx = if x < radius {
            radius - x
        } else if x > w - radius {
            x - (w - radius)
        } else {
            0.0
        };
        let inset = radius - (radius * radius - dx * dx).max(0.0).sqrt();
        rect.height() / 2.0 - inset
    };
    let mut m = Mesh::default();
    let cy = rect.center().y;
    for (i, &x) in xs.iter().enumerate() {
        let c = col(x / w);
        let h = half(x);
        m.vertices.push(Vertex { pos: pos2(rect.left() + x, cy - h), uv: WHITE_UV, color: c });
        m.vertices.push(Vertex { pos: pos2(rect.left() + x, cy + h), uv: WHITE_UV, color: c });
        if i > 0 {
            let b = (i as u32) * 2;
            m.indices.extend_from_slice(&[b - 2, b - 1, b + 1, b - 2, b + 1, b]);
        }
    }
    p.add(m);
}

fn cap_colour(u: f32, lift: f32) -> Color32 {
    let mut c = CAP_STOPS[0].1;
    for w in CAP_STOPS.windows(2) {
        let ((a, ca), (b, cb)) = (w[0], w[1]);
        if u >= a && u <= b {
            c = mix(ca, cb, (u - a) / (b - a));
            break;
        }
    }
    mix(c, Color32::WHITE, lift)
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
    let cx = rect.center().x;
    let slot = slot_rect(rect);

    // ── the readout ─────────────────────────────────────────────────────────
    let lcd = Rect::from_center_size(pos2(cx, rect.top() + LCD_H / 2.0), vec2(50.0, LCD_H));
    paint_lcd(p, th, lcd, &format!("{:.0}", v));

    // ── the track: left 12px in the slot, 9px wide ──────────────────────────
    let track = Rect::from_min_max(pos2(slot.left() + 12.0, slot.top()), pos2(slot.left() + 21.0, slot.bottom()));
    p.rect_filled(track, Rounding::same(4.5), th.paper);
    p.rect_stroke(track.shrink(0.5), Rounding::same(4.0), Stroke::new(1.0, th.edge_ctl));
    let trench = track.shrink(2.0);
    p.rect_filled(trench, Rounding::same(3.0), th.card);
    // inset 0 1px 1px rgba(0,0,0,.05)
    p.line_segment(
        [pos2(trench.left() + 1.5, trench.top() + 0.5), pos2(trench.right() - 1.5, trench.top() + 0.5)],
        Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, 13)),
    );

    let t = ((v - min) / (max - min)).clamp(0.0, 1.0);
    let y = cap_y(slot, t);

    // ── the fill: ink, from the cap to the floor ────────────────────────────
    let fill = Rect::from_min_max(pos2(trench.left(), y), trench.right_bottom());
    if fill.height() > 1.0 {
        p.rect_filled(fill, Rounding::same(2.5), th.ink);
    }

    // ── the scale: right 1px, quarters 4px, fifths 2px, right-aligned ───────
    let right = slot.right() - 1.0;
    for i in 0..=20 {
        let ty = (slot.top() + SLOT_H * i as f32 / 20.0).min(slot.bottom() - 1.0);
        let (len, col) = if i % 5 == 0 { (4.0, th.ink_2) } else { (2.0, TICK_SUB) };
        p.rect_filled(Rect::from_min_max(pos2(right - len, ty), pos2(right, ty + 1.0)), 0.0, col);
    }

    // ── the cap ─────────────────────────────────────────────────────────────
    let cap = Rect::from_center_size(pos2(track.center().x, y), CAP);
    // 0 3px 6px rgba(0,0,0,.9)
    for (grow, a) in [(4.0, 22), (2.5, 40), (1.0, 70)] {
        p.rect_filled(cap.translate(vec2(0.0, 3.0)).expand(grow), Rounding::same(5.0 + grow), Color32::from_rgba_unmultiplied(0, 0, 0, a));
    }
    // not in the CSS — the pen-plotter app's approved hover / drag lift
    let lift = match state {
        FaderState::Rest => 0.0,
        FaderState::Hover => 0.05,
        FaderState::Dragging => 0.09,
    };
    p.rect_filled(cap, Rounding::same(5.0), cap_colour(0.5, lift));
    hgrad(p, cap.shrink2(vec2(0.6, 0.6)), 4.4, |u| cap_colour(u, lift));
    // insets: left white .45, right white .22, top white .10, bottom black .6
    let line = |a: egui::Pos2, b: egui::Pos2, c: Color32| p.line_segment([a, b], Stroke::new(1.0, c));
    line(pos2(cap.left() + 0.5, cap.top() + 4.0), pos2(cap.left() + 0.5, cap.bottom() - 4.0), Color32::from_rgba_unmultiplied(255, 255, 255, 115));
    line(pos2(cap.right() - 0.5, cap.top() + 4.0), pos2(cap.right() - 0.5, cap.bottom() - 4.0), Color32::from_rgba_unmultiplied(255, 255, 255, 56));
    line(pos2(cap.left() + 4.0, cap.top() + 0.5), pos2(cap.right() - 4.0, cap.top() + 0.5), Color32::from_rgba_unmultiplied(255, 255, 255, 26));
    line(pos2(cap.left() + 4.0, cap.bottom() - 0.5), pos2(cap.right() - 4.0, cap.bottom() - 0.5), Color32::from_rgba_unmultiplied(0, 0, 0, 153));
    // 0 0 0 1px rgba(0,0,0,.65)
    p.rect_stroke(cap.expand(0.5), Rounding::same(5.5), Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, 166)));

    // knurl: inset 3px 2px, teeth 1px light .13 + 1.5px dark .30, shoulders only
    let k = Rect::from_min_max(pos2(cap.left() + 2.0, cap.top() + 3.0), pos2(cap.right() - 2.0, cap.bottom() - 3.0));
    let kw = k.width();
    let mut x = 0.0;
    while x < kw {
        let u = x / kw;
        if u <= 0.34 || u >= 0.66 {
            p.rect_filled(Rect::from_min_size(pos2(k.left() + x, k.top()), vec2(1.0, k.height())), 0.0, Color32::from_rgba_unmultiplied(255, 255, 255, 33));
            let dw = (1.5_f32).min(kw - x - 1.0).max(0.0);
            p.rect_filled(Rect::from_min_size(pos2(k.left() + x + 1.0, k.top()), vec2(dw, k.height())), 0.0, Color32::from_rgba_unmultiplied(0, 0, 0, 77));
        }
        x += 2.5;
    }

    // the indicator: vertical, 2px, top 2 bottom 2 — --led-hot glowing --led
    let ia = pos2(cap.center().x, cap.top() + 2.0);
    let ib = pos2(cap.center().x, cap.bottom() - 2.0);
    for (ww, al) in [(7.0, 0.12), (4.5, 0.25), (3.0, 0.45)] {
        p.line_segment([ia, ib], Stroke::new(ww, th.pal.led.gamma_multiply(al)));
    }
    p.rect_filled(Rect::from_min_max(pos2(ia.x - 1.0, ia.y), pos2(ib.x + 1.0, ib.y)), Rounding::same(1.0), th.pal.led_hot);

    // ── the name: --font, 8.5px, .16em tracking, --ink-2 ────────────────────
    let mut job = LayoutJob::default();
    job.append(
        label,
        0.0,
        TextFormat {
            font_id: FontId::monospace(8.5),
            color: th.ink_2,
            extra_letter_spacing: 8.5 * 0.16,
            ..Default::default()
        },
    );
    let g = p.layout_job(job);
    let pos = pos2(cx - g.rect.width() / 2.0, rect.bottom() - LAB_H / 2.0 - g.rect.height() / 2.0);
    p.galley(pos, g, th.ink_2);
}

/// An interactive fader. It sounds like the kit's: `grab` when the cap is
/// taken, `slide` per scale mark it passes while held, `drop` on release.
/// Returns `(commit, dragging)`: **the value moves live
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
    let (rect, _) = ui.allocate_exact_size(FADER_SIZE, Sense::hover());
    let slot = slot_rect(rect);
    let id = ui.id().with(label);
    let resp = ui
        .interact(slot.expand2(vec2(6.0, 4.0)), id, Sense::click_and_drag())
        .on_hover_cursor(egui::CursorIcon::Grab);
    let dragging = resp.dragged();
    let mut commit = false;
    // grab as the pointer goes down on the track, drop as it lets go
    let held = resp.is_pointer_button_down_on();
    let hid = id.with("skew-held");
    let was_held = ui.data(|d| d.get_temp::<bool>(hid)).unwrap_or(false);
    if held && !was_held {
        crate::sfx::grab();
    } else if !held && was_held {
        crate::sfx::drop();
    }
    if held != was_held {
        ui.data_mut(|d| d.insert_temp(hid, held));
    }
    if held || dragging || resp.clicked() {
        if let Some(mp) = resp.interact_pointer_pos() {
            let tt = ((cap_y(slot, 0.0) - mp.y) / (SLOT_H - CAP.y)).clamp(0.0, 1.0);
            let mark = |x: f32| (((x - min) / (max - min)) * crate::sfx::MARKS).round() as i32;
            let before = mark(*v);
            *v = (min + tt * (max - min)).round();
            // the cap brushing its scale: one soft strike per mark, only while held
            if held && mark(*v) != before {
                crate::sfx::slide();
            }
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
