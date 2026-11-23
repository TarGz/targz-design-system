//! The knob, matched to the documentation's KNOB and KNOB · ENDLESS.
//!
//! Four parts, each lifted from `.knob` in `src/skew.css`:
//!
//! 1. **The collar** — a black milled ring. It stays dark in the light skin
//!    (`[data-skin="light"] .knob-collar` is on the keep-dark list).
//! 2. **The arc** — the value as a lit orange trace round the collar, 270° of
//!    sweep from the lower-left stop. An endless knob draws no arc: on a closed
//!    ring a length means nothing, so the colour moves onto the pointer.
//! 3. **The cap** — knurled (120 conic teeth), inset 19% of the knob, with a
//!    specular high on the left that does not turn.
//! 4. **The pointer** — one lit mark that turns with the value.
//!
//! Under it, the e-paper readout ([`crate::paint_lcd`]).
//!
//! egui has no blur, so every CSS `drop-shadow` / glow here is three stacked
//! translucent strokes. A mesh has no anti-aliasing, so each mesh sits on an AA
//! fill that is slightly larger.

use crate::machine::paint_lcd;
use crate::paint::{hex, mix};
use crate::theme::Theme;
use egui::epaint::{Mesh, PathShape, Vertex, WHITE_UV};
use egui::{pos2, vec2, Color32, Pos2, Rect, Sense, Stroke, Ui};
use std::f32::consts::TAU;

// ── the knob's own hardware, the same in both skins ─────────────────────────
// `.knob-collar`: radial-gradient(#0c0d0f 56%, #1d1f23 57%, #101113 100%)
const COLLAR_IN: Color32 = hex(0x0C0D0F);
const COLLAR_BAND: Color32 = hex(0x1D1F23);
const COLLAR_OUT: Color32 = hex(0x101113);
// `.knob-cap`: conic-gradient(#3a3e45 0deg, #23262b 3deg, …)
const TOOTH_HI: Color32 = hex(0x3A3E45);
const TOOTH_LO: Color32 = hex(0x23262B);
// `.knob.bi .knob-collar::after` — the etched centre mark
const BI_MARK: Color32 = hex(0x767D88);
// `.knob`'s default `--arc`
const ARC: Color32 = hex(0xFF6A00);

/// The knob's diameter — `--kd`, 54px.
pub const KNOB_D: f32 = 54.0;
/// Knob plus its readout, so a caller can lay out a row without guessing.
pub const KNOB_SIZE: egui::Vec2 = egui::Vec2 { x: 58.0, y: KNOB_D + 6.0 + 18.0 };

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum KnobKind {
    /// A potentiometer: 270° of sweep, a stop at each end, the value as an arc.
    Pot,
    /// An encoder: 360°, no stops, the value wraps. No arc; the pointer is lit.
    Endless,
}

/// A point at `deg` clockwise from twelve o'clock.
fn at(c: Pos2, r: f32, deg: f32) -> Pos2 {
    let a = deg.to_radians();
    pos2(c.x + r * a.sin(), c.y - r * a.cos())
}

fn arc_points(c: Pos2, r: f32, from: f32, to: f32) -> Vec<Pos2> {
    let n = (((to - from).abs() / 3.0).ceil() as usize).max(2);
    (0..=n)
        .map(|i| at(c, r, from + (to - from) * i as f32 / n as f32))
        .collect()
}

fn stroke_arc(p: &egui::Painter, c: Pos2, r: f32, from: f32, to: f32, w: f32, col: Color32) {
    p.add(PathShape::line(arc_points(c, r, from, to), Stroke::new(w, col)));
}

/// A glowing round-capped trace: three wide faint strokes under the real one.
fn lit_arc(p: &egui::Painter, c: Pos2, r: f32, from: f32, to: f32, w: f32, col: Color32) {
    for (extra, a) in [(6.0, 0.10), (3.5, 0.18), (1.5, 0.30)] {
        let g = col.gamma_multiply(a);
        stroke_arc(p, c, r, from, to, w + extra, g);
        for d in [from, to] {
            p.circle_filled(at(c, r, d), (w + extra) / 2.0, g);
        }
    }
    stroke_arc(p, c, r, from, to, w, col);
    for d in [from, to] {
        p.circle_filled(at(c, r, d), w / 2.0, col);
    }
}

/// A disc as a polar mesh, every vertex coloured by `col(angle_index, pos)`.
fn disc_mesh(p: &egui::Painter, c: Pos2, r: f32, segs: usize, rings: usize, col: impl Fn(usize, Pos2) -> Color32) {
    let mut m = Mesh::default();
    m.vertices.push(Vertex { pos: c, uv: WHITE_UV, color: col(usize::MAX, c) });
    for k in 1..=rings {
        let rr = r * k as f32 / rings as f32;
        for i in 0..segs {
            let a = TAU * i as f32 / segs as f32;
            let q = pos2(c.x + rr * a.cos(), c.y + rr * a.sin());
            m.vertices.push(Vertex { pos: q, uv: WHITE_UV, color: col(i, q) });
        }
    }
    let s = segs as u32;
    for i in 0..s {
        m.indices.extend_from_slice(&[0, 1 + i, 1 + (i + 1) % s]);
    }
    for k in 1..rings as u32 {
        let (a0, b0) = (1 + (k - 1) * s, 1 + k * s);
        for i in 0..s {
            let j = (i + 1) % s;
            m.indices.extend_from_slice(&[a0 + i, b0 + i, b0 + j, a0 + i, b0 + j, a0 + j]);
        }
    }
    p.add(m);
}

/// Paint a knob and its readout into `rect` (width ≥ [`KNOB_D`]), no interaction.
/// `text` is what the readout says — the caller formats it (`"62"`, `"147°"`).
pub fn paint_knob(
    p: &egui::Painter,
    th: &Theme,
    rect: Rect,
    v: f32,
    min: f32,
    max: f32,
    kind: KnobKind,
    text: &str,
) {
    let d = KNOB_D;
    let r = d / 2.0;
    let c = pos2(rect.center().x, rect.top() + r);
    let t = ((v - min) / (max - min)).clamp(0.0, 1.0);
    let bipolar = min < 0.0 && max > 0.0;

    // ── 1 the collar ────────────────────────────────────────────────────────
    // CSS `circle` with no size is farthest-corner = r·√2, so the 56% stop
    // lands at 0.79r and the edge of the disc is 34% of the way to #101113.
    let r_in = r * 0.56 * std::f32::consts::SQRT_2;
    let edge = mix(COLLAR_BAND, COLLAR_OUT, (r - r_in) / (r * std::f32::consts::SQRT_2 - r_in));
    p.circle_filled(c, r, edge);
    disc_mesh(p, c, r - 0.6, 72, 2, |_, q| {
        let dd = q.distance(c);
        if dd < r_in - 0.5 {
            COLLAR_IN
        } else {
            mix(COLLAR_BAND, edge, ((dd - r_in) / (r - r_in)).clamp(0.0, 1.0))
        }
    });
    p.circle_filled(c, r_in, COLLAR_IN);
    // inset 0 2px 5px rgba(0,0,0,.9): the near wall's shadow, heaviest at the top
    stroke_arc(p, c, r - 1.5, -70.0, 70.0, 2.0, Color32::from_rgba_unmultiplied(0, 0, 0, 120));

    if bipolar {
        // the etched centre mark, 2×5, poking 2px above the collar
        let m = Rect::from_min_size(pos2(c.x - 1.0, c.y - r - 2.0), vec2(2.0, 5.0));
        p.rect_filled(m.translate(vec2(0.0, 1.0)), 1.0, Color32::from_rgba_unmultiplied(0, 0, 0, 217));
        p.rect_filled(m, 1.0, BI_MARK);
    }

    // ── 2 the ring: r = 43 and stroke 7 in a 0–100 viewBox ──────────────────
    let rr = 0.43 * d;
    let w = 0.07 * d;
    let track = Color32::from_rgba_unmultiplied(255, 255, 255, 19); // .075
    match kind {
        KnobKind::Pot => {
            stroke_arc(p, c, rr, -135.0, 135.0, w, track);
            for dg in [-135.0, 135.0] {
                p.circle_filled(at(c, rr, dg), w / 2.0, track);
            }
            let (from, to) = if bipolar {
                let mid = 0.0_f32;
                let here = -135.0 + t * 270.0;
                (mid.min(here), mid.max(here))
            } else {
                (-135.0, -135.0 + t * 270.0)
            };
            // no round-cap dot at the origin: the CSS hides an arc under 1.2 units
            if (to - from).to_radians() * rr > 1.2 * d / 100.0 {
                lit_arc(p, c, rr, from, to, w, ARC);
            }
        }
        KnobKind::Endless => {
            p.circle_stroke(c, rr, Stroke::new(w, track));
        }
    }

    // ── 3 the cap: inset 19%, so 62% of the knob ────────────────────────────
    let rc = r * 0.62;
    // 0 2px 4px rgba(0,0,0,.8)
    for (grow, a) in [(3.0, 40), (1.8, 70), (0.8, 110)] {
        p.circle_filled(c + vec2(0.0, 2.0), rc + grow, Color32::from_rgba_unmultiplied(0, 0, 0, a));
    }
    p.circle_filled(c, rc, mix(TOOTH_HI, TOOTH_LO, 0.5));
    // radial-gradient(circle at 36% 26%, rgba(255,255,255,.30) 0%, transparent 46%)
    let side = rc * 2.0;
    let spec_c = pos2(c.x - rc + 0.36 * side, c.y - rc + 0.26 * side);
    let spec_r = 0.46 * side * (0.64_f32.hypot(0.74));
    disc_mesh(p, c, rc - 0.6, 120, 8, |i, q| {
        let base = if i == usize::MAX {
            mix(TOOTH_HI, TOOTH_LO, 0.5)
        } else if i % 2 == 0 {
            TOOTH_HI
        } else {
            TOOTH_LO
        };
        let s = (1.0 - q.distance(spec_c) / spec_r).clamp(0.0, 1.0) * 0.30;
        mix(base, Color32::WHITE, s)
    });
    // inset 0 1px 0 rgba(255,255,255,.28) and inset 0 -2px 4px rgba(0,0,0,.75)
    stroke_arc(p, c, rc - 0.5, -60.0, 60.0, 1.0, Color32::from_rgba_unmultiplied(255, 255, 255, 71));
    stroke_arc(p, c, rc - 1.5, 120.0, 240.0, 3.0, Color32::from_rgba_unmultiplied(0, 0, 0, 110));

    // ── 4 the pointer: top 9%, height 34%, 2px wide ─────────────────────────
    let deg = match kind {
        KnobKind::Pot => -135.0 + t * 270.0,
        KnobKind::Endless => (t - if bipolar { 0.5 } else { 0.0 }) * 360.0,
    };
    let (outer, inner) = (rc - 0.09 * side, rc - 0.43 * side);
    let (a, b) = (at(c, outer, deg), at(c, inner, deg));
    let (core, glow) = match kind {
        // [data-skin="light"] .knob-cap::after — --led-hot, glowing --led
        KnobKind::Pot => (th.pal.led_hot, th.pal.led),
        // .knob.endless .knob-cap::after — --arc, glowing --arc
        KnobKind::Endless => (ARC, ARC),
    };
    p.line_segment([a + vec2(0.0, 1.0), b + vec2(0.0, 1.0)], Stroke::new(2.0, Color32::from_rgba_unmultiplied(0, 0, 0, 204)));
    for (ww, al) in [(7.0, 0.12), (4.5, 0.25), (3.0, 0.45)] {
        p.line_segment([a, b], Stroke::new(ww, glow.gamma_multiply(al)));
    }
    p.line_segment([a, b], Stroke::new(2.0, core));

    // ── the readout ─────────────────────────────────────────────────────────
    let lcd = Rect::from_center_size(pos2(c.x, rect.top() + d + 6.0 + 9.0), vec2(KNOB_SIZE.x, 18.0));
    paint_lcd(p, th, lcd, text);
}

/// An interactive knob. Drag down or right to turn it clockwise (the kit's
/// gesture), the wheel works too, shift divides the travel by five. It
/// ratchets: one [`crate::sfx::step`] per notch, [`crate::sfx::ENC`] to the travel. Returns `(commit, dragging)` with the fader's contract: the value
/// moves live while dragging, `commit` fires once on release.
pub fn knob(
    ui: &mut Ui,
    th: &Theme,
    id: &str,
    v: &mut f32,
    min: f32,
    max: f32,
    kind: KnobKind,
    fmt: impl Fn(f32) -> String,
) -> (bool, bool) {
    let (rect, _) = ui.allocate_exact_size(KNOB_SIZE, Sense::hover());
    let dial = Rect::from_center_size(pos2(rect.center().x, rect.top() + KNOB_D / 2.0), vec2(KNOB_D, KNOB_D));
    let resp = ui
        .interact(dial, ui.id().with(id), Sense::click_and_drag())
        .on_hover_cursor(egui::CursorIcon::ResizeVertical);
    let span = max - min;
    // the kit: 200px of travel is the full range, DOWN AND RIGHT both turn it
    // clockwise (you push the near edge of the cap away), shift divides by five
    let fine = if ui.input(|i| i.modifiers.shift) { 0.2 } else { 1.0 };
    let mut delta = 0.0;
    if resp.dragged() {
        let dd = resp.drag_delta();
        delta += (dd.x + dd.y) / 200.0 * span * fine;
    }
    if resp.hovered() {
        let s = ui.input(|i| i.smooth_scroll_delta.y);
        delta += s / 400.0 * span * fine;
    }
    let mut commit = resp.drag_stopped();
    if delta != 0.0 {
        // the ratchet ticks per NOTCH of the travel, not per step of the value
        let notch = |x: f32| (((x - min) / span) * crate::sfx::ENC).round() as i32;
        let before = notch(*v);
        let raw = *v + delta;
        *v = match kind {
            KnobKind::Pot => raw.clamp(min, max),
            KnobKind::Endless => min + (raw - min).rem_euclid(span),
        };
        let after = notch(*v);
        // an endless knob wrapping 180 → -180 lands on the same notch, not 40 away
        let crossed = match kind {
            KnobKind::Endless => (after - before).rem_euclid(crate::sfx::ENC as i32) != 0,
            KnobKind::Pot => after != before,
        };
        if crossed {
            crate::sfx::step();
        }
        if !resp.dragged() {
            commit = true;
        }
    }
    if ui.is_rect_visible(rect) {
        paint_knob(ui.painter(), th, rect, v.round(), min, max, kind, &fmt(v.round()));
    }
    (commit, resp.dragged())
}
