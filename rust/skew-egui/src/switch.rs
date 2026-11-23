//! The slide switch, matched to the documentation's SLIDE SWITCH (§ Pressing).
//!
//! `.slide` from `src/skew.css`, in its two dresses:
//!
//! * [`SlideKind::Grip`] — variant A: a 46×22 cut, a painted floor, and a
//!   moulded grip with vertical knurl that slides 20px across it.
//! * [`SlideKind::Pill`] — variant B: the same part in a pill, the grip dotted
//!   instead of knurled, and **ON / OFF printed on the floor** — the legend is
//!   what the grip uncovers.
//!
//! Its state is where the actuator IS: when it is on, the grip has moved right
//! and uncovered a lit `--led` floor. There is no lamp and no surge — a slide
//! switch has no recess to land in. The grip stays dark in the light skin (the
//! note at "AN ACTUATOR IS A GRIP AND IT WAS FILED AS A FILL"); the floor is
//! the light skin's grey `#3a3e45 → #767d88 → #43474e`.
//!
//! Variant C, the rocker, is not here: the CSS flags it "WIP, NOT VALIDATED —
//! do not copy it into an app yet".

use crate::paint::{hex, mix};
use crate::theme::Theme;
use egui::epaint::{Mesh, Vertex, WHITE_UV};
use egui::text::{LayoutJob, TextFormat};
use egui::{pos2, vec2, Color32, FontId, Pos2, Rect, Rounding, Sense, Stroke, Ui};

/// `.slide` — 46×22.
pub const SLIDE_SIZE: egui::Vec2 = egui::Vec2 { x: 46.0, y: 22.0 };

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SlideKind {
    /// Variant A: rounded 7px, a knurled grip.
    Grip,
    /// Variant B: a pill, a dotted grip, ON / OFF on the floor.
    Pill,
}

// ── colour arithmetic, everything composited to opaque ──────────────────────
fn over(base: Color32, top: Color32, a: f32) -> Color32 {
    mix(base, top, a.clamp(0.0, 1.0))
}
fn stops(u: f32, s: &[(f32, Color32)]) -> Color32 {
    let u = u.clamp(0.0, 1.0);
    for w in s.windows(2) {
        if u <= w[1].0 {
            return mix(w[0].1, w[1].1, (u - w[0].0) / (w[1].0 - w[0].0).max(1e-6));
        }
    }
    s[s.len() - 1].1
}
fn brighten(c: Color32, k: f32) -> Color32 {
    let f = |v: u8| ((v as f32) * k).min(255.0) as u8;
    Color32::from_rgb(f(c.r()), f(c.g()), f(c.b()))
}

/// A rounded rect filled with any colour field: the perimeter (four corner
/// arcs plus straight edges cut every 2px) scaled toward the centre in rings,
/// each vertex coloured by `col`. A mesh has no AA, so it is inset 0.6px over
/// an AA fill of `rim`.
fn field(p: &egui::Painter, rect: Rect, radius: f32, rim: Color32, col: impl Fn(Pos2) -> Color32) {
    p.rect_filled(rect, Rounding::same(radius), rim);
    let rect = rect.shrink(0.6);
    let r = (radius - 0.6).max(0.0).min(rect.height() / 2.0).min(rect.width() / 2.0);
    let mut per: Vec<Pos2> = Vec::new();
    let corners = [
        (pos2(rect.right() - r, rect.top() + r), -90.0_f32),
        (pos2(rect.right() - r, rect.bottom() - r), 0.0),
        (pos2(rect.left() + r, rect.bottom() - r), 90.0),
        (pos2(rect.left() + r, rect.top() + r), 180.0),
    ];
    for (k, (c, a0)) in corners.iter().enumerate() {
        for i in 0..=8 {
            let a = (a0 + i as f32 * 90.0 / 8.0).to_radians();
            per.push(pos2(c.x + r * a.cos(), c.y + r * a.sin()));
        }
        // the straight edge from this corner's end to the next corner's start
        let end = *per.last().unwrap();
        let (nc, na) = corners[(k + 1) % 4];
        let na = na.to_radians();
        let next = pos2(nc.x + r * na.cos(), nc.y + r * na.sin());
        let n = (end.distance(next) / 2.0).floor() as usize;
        for j in 1..n {
            per.push(end + (next - end) * (j as f32 / n as f32));
        }
    }
    let c = rect.center();
    let rings = 8u32;
    let mut m = Mesh::default();
    m.vertices.push(Vertex { pos: c, uv: WHITE_UV, color: col(c) });
    for k in 1..=rings {
        let f = k as f32 / rings as f32;
        for q in &per {
            let v = c + (*q - c) * f;
            m.vertices.push(Vertex { pos: v, uv: WHITE_UV, color: col(v) });
        }
    }
    let s = per.len() as u32;
    for i in 0..s {
        m.indices.extend_from_slice(&[0, 1 + i, 1 + (i + 1) % s]);
    }
    for k in 1..rings {
        let (a0, b0) = (1 + (k - 1) * s, 1 + k * s);
        for i in 0..s {
            let j = (i + 1) % s;
            m.indices.extend_from_slice(&[a0 + i, b0 + i, b0 + j, a0 + i, b0 + j, a0 + j]);
        }
    }
    p.add(m);
}

/// A plain rect as a fine grid — for the knurl, whose ridges are 5.2px apart.
fn grid(p: &egui::Painter, rect: Rect, nx: usize, ny: usize, col: impl Fn(f32, f32) -> Color32) {
    let mut m = Mesh::default();
    for j in 0..=ny {
        for i in 0..=nx {
            let (u, v) = (i as f32 / nx as f32, j as f32 / ny as f32);
            let q = pos2(rect.left() + u * rect.width(), rect.top() + v * rect.height());
            m.vertices.push(Vertex { pos: q, uv: WHITE_UV, color: col(u, v) });
        }
    }
    let w = nx as u32 + 1;
    for j in 0..ny as u32 {
        for i in 0..nx as u32 {
            let a = j * w + i;
            m.indices.extend_from_slice(&[a, a + 1, a + w + 1, a, a + w + 1, a + w]);
        }
    }
    p.add(m);
}

/// `radial-gradient(120% 200% at 50% 45%, transparent s0, rgba(0,0,0,amax) 100%)`
fn vignette(rect: Rect, q: Pos2, s0: f32, amax: f32) -> f32 {
    let dx = (q.x - rect.center().x) / (1.2 * rect.width());
    let dy = (q.y - (rect.top() + 0.45 * rect.height())) / (2.0 * rect.height());
    let d = dx.hypot(dy);
    ((d - s0) / (1.0 - s0)).clamp(0.0, 1.0) * amax
}

/// The `0 1px 2px / 0 3px 5px / 0 6px 10px` drop under the grip, as stacked
/// translucent rounded rects.
fn drop_shadow(p: &egui::Painter, r: Rect, radius: f32) {
    for (dy, grow, a) in [(6.0, 5.0, 14), (5.0, 3.5, 22), (3.0, 2.0, 40), (1.0, 0.8, 70)] {
        p.rect_filled(
            r.translate(vec2(0.0, dy)).expand(grow),
            Rounding::same(radius + grow),
            Color32::from_rgba_unmultiplied(0, 0, 0, a),
        );
    }
}

/// Paint a slide switch into `rect` (46×22). `travel` is the grip's position,
/// 0 = off, 1 = on — pass a fraction to draw it mid-throw. `hover` lifts the
/// grip 7% (`filter:brightness(1.07)`).
pub fn paint_slide(p: &egui::Painter, th: &Theme, rect: Rect, kind: SlideKind, travel: f32, hover: bool) {
    let led = th.pal.led;
    let on = travel > 0.5;
    let pill = kind == SlideKind::Pill;
    let slot_r = if pill { rect.height() / 2.0 } else { 7.0 };

    // ── the cut: transparent in light, so only its inset shadows are left ───
    p.rect_filled(rect, Rounding::same(slot_r), Color32::from_rgba_unmultiplied(0, 0, 0, 150));
    p.rect_stroke(rect.expand(0.5), Rounding::same(slot_r + 0.5), Stroke::new(1.0, Color32::from_rgba_unmultiplied(255, 255, 255, 14)));

    // ── the floor ───────────────────────────────────────────────────────────
    let bed = rect.shrink(if pill { 2.0 } else { 3.0 });
    let bed_r = if pill { bed.height() / 2.0 } else { 4.0 };
    let lit = [
        (0.00, mix(led, Color32::BLACK, 0.48)),
        (0.34, mix(led, Color32::WHITE, 0.10)),
        (0.62, mix(led, Color32::BLACK, 0.12)),
        (1.00, mix(led, Color32::BLACK, 0.50)),
    ];
    let grey = [(0.00, hex(0x3A3E45)), (0.55, hex(0x767D88)), (1.00, hex(0x43474E))];
    let (floor, s0, amax): (&[(f32, Color32)], f32, f32) = if on { (&lit, 0.30, 0.50) } else { (&grey, 0.22, 0.46) };
    field(p, bed, bed_r, stops(0.5, floor), |q| {
        let base = stops((q.y - bed.top()) / bed.height(), floor);
        over(base, Color32::BLACK, vignette(bed, q, s0, amax))
    });
    // inset 0 2px 3px rgba(0,0,0,.6) off, 0 1px 2px + a 1px ring on
    let top_a = if on { 120 } else { 150 };
    p.line_segment(
        [pos2(bed.left() + bed_r, bed.top() + 0.8), pos2(bed.right() - bed_r, bed.top() + 0.8)],
        Stroke::new(1.5, Color32::from_rgba_unmultiplied(0, 0, 0, top_a)),
    );
    if on {
        p.rect_stroke(bed.shrink(0.5), Rounding::same(bed_r - 0.5), Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, 102)));
    }

    // ── the printed legend on a pill's floor ────────────────────────────────
    if pill {
        let word = |text: &str, color: Color32| {
            let mut job = LayoutJob::default();
            job.append(text, 0.0, TextFormat {
                font_id: FontId::monospace(7.0),
                color,
                extra_letter_spacing: 7.0 * 0.08,
                ..Default::default()
            });
            p.layout_job(job)
        };
        let cy = bed.center().y;
        let (on_c, on_sh) = if on {
            (mix(led, Color32::BLACK, 0.74), mix(led, Color32::WHITE, 0.45))
        } else {
            (Color32::from_rgba_unmultiplied(226, 232, 240, 33), Color32::from_rgba_unmultiplied(0, 0, 0, 178))
        };
        let g = word("ON", on_c);
        let at = pos2(bed.left() + 5.5, cy - g.rect.height() / 2.0);
        p.galley(at + vec2(0.0, 1.0), word("ON", on_sh), on_sh);
        p.galley(at, g, on_c);
        let off_c = Color32::from_rgba_unmultiplied(226, 232, 240, 33);
        let g = word("OFF", off_c);
        let at = pos2(bed.right() - 4.5 - g.rect.width(), cy - g.rect.height() / 2.0);
        p.galley(at + vec2(0.0, 1.0), word("OFF", Color32::from_rgba_unmultiplied(0, 0, 0, 178)), Color32::BLACK);
        p.galley(at, g, off_c);
    }

    // ── the grip: 22×18, 2px in, 20px of throw ──────────────────────────────
    let act = Rect::from_min_size(rect.min + vec2(2.0 + 20.0 * travel, 2.0), vec2(22.0, 18.0));
    let act_r = if pill { 9.0 } else { 4.5 };
    drop_shadow(p, act, act_r);
    let (body, el, er, top_hi): ([(f32, Color32); 4], f32, f32, f32) = if pill {
        ([(0.0, hex(0x31353C)), (0.30, hex(0x2B2F35)), (0.68, hex(0x24272D)), (1.0, hex(0x1D2025))], 0.24, 0.30, 0.11)
    } else {
        ([(0.0, hex(0x34383F)), (0.30, hex(0x2E3239)), (0.68, hex(0x26292F)), (1.0, hex(0x1F2227))], 0.26, 0.34, 0.15)
    };
    let er_from = if pill { 0.84 } else { 0.82 };
    let k = if hover { 1.07 } else { 1.0 };
    // the accent washing the grip's inboard edge, only when on
    let wash = if on { if pill { 0.13 } else { 0.12 } } else { 0.0 };
    field(p, act, act_r, brighten(stops(0.5, &body), k), |q| {
        let u = (q.x - act.left()) / act.width();
        let v = (q.y - act.top()) / act.height();
        let mut c = stops(v, &body);
        let edge = if u < 0.16 { el * (1.0 - u / 0.16) } else if u > er_from { er * (u - er_from) / (1.0 - er_from) } else { 0.0 };
        c = over(c, Color32::BLACK, edge);
        // inset 0 -2px 4px: the bottom of the grip in its own shadow
        let bot = ((v - 0.70) / 0.30).clamp(0.0, 1.0) * if on { 0.42 } else { 0.70 };
        c = over(c, Color32::BLACK, bot * 0.6);
        // inset 6px 0 8px -3px of --led, from the left edge
        let px = q.x - act.left();
        if wash > 0.0 && px < 8.0 {
            c = over(c, led, wash * (1.0 - px / 8.0));
        }
        brighten(c, k)
    });
    // the 1px top light, and the lit left edge when on
    p.line_segment(
        [pos2(act.left() + act_r, act.top() + 0.5), pos2(act.right() - act_r, act.top() + 0.5)],
        Stroke::new(1.0, Color32::from_rgba_unmultiplied(255, 255, 255, (top_hi * 255.0) as u8)),
    );
    if on {
        let edge = mix(hex(0x2B2F35), led, if pill { 0.44 } else { 0.40 });
        p.line_segment(
            [pos2(act.left() + 0.8, act.top() + act_r * 0.6), pos2(act.left() + 0.8, act.bottom() - act_r * 0.6)],
            Stroke::new(1.0, edge),
        );
    }

    // ── the face: knurl on A, a dot grid on B ───────────────────────────────
    let c = act.center();
    if pill {
        let face = Rect::from_center_size(c, vec2(16.0, 10.5));
        let p2 = p.with_clip_rect(face);
        let (cell, n_x, n_y) = (3.5_f32, 6, 4);
        let ox = c.x - cell * n_x as f32 / 2.0;
        let oy = c.y - cell * n_y as f32 / 2.0;
        for j in 0..n_y {
            for i in 0..n_x {
                let o = pos2(ox + i as f32 * cell, oy + j as f32 * cell);
                p2.circle_filled(o + vec2(1.2, 1.9), 0.68, Color32::from_rgba_unmultiplied(226, 232, 240, 43));
                p2.circle_filled(o + vec2(1.2, 1.2), 0.68, Color32::from_rgba_unmultiplied(0, 0, 0, 158));
            }
        }
    } else {
        let face = Rect::from_center_size(c, vec2(15.0, 11.0));
        // the ridge profile, 5.2px a period, as alpha of white (+) or black (−)
        let ridge = |x: f32| -> f32 {
            let x = x.rem_euclid(5.2);
            let pts = [(0.0, 0.11), (1.5, 0.025), (2.3, -0.14), (3.3, -0.40), (4.1, -0.14), (5.2, 0.11)];
            for w in pts.windows(2) {
                if x <= w[1].0 {
                    return w[0].1 + (w[1].1 - w[0].1) * (x - w[0].0) / (w[1].0 - w[0].0);
                }
            }
            0.11
        };
        let base_at = |q: Pos2| {
            let v = (q.y - act.top()) / act.height();
            brighten(stops(v, &body), k)
        };
        grid(p, face, 60, 4, |u, v| {
            let q = pos2(face.left() + u * face.width(), face.top() + v * face.height());
            let mut col = base_at(q);
            let r = ridge(u * face.width());
            col = if r >= 0.0 { over(col, Color32::WHITE, r) } else { over(col, Color32::BLACK, -r) };
            // the face's own light: white .11 → .02 at 24%, black .05 at 58%, .26 at the foot
            if v < 0.24 {
                over(col, Color32::WHITE, 0.11 - 0.09 * v / 0.24)
            } else if v < 0.58 {
                let t = (v - 0.24) / 0.34;
                over(over(col, Color32::WHITE, 0.02 * (1.0 - t)), Color32::BLACK, 0.05 * t)
            } else {
                over(col, Color32::BLACK, 0.05 + 0.21 * (v - 0.58) / 0.42)
            }
        });
    }
}

/// An interactive slide switch. Click to throw it; the grip travels 0.16s with
/// the CSS's overshoot. Sounds like the kit's `toggle`: `flip` as the pointer
/// goes down, `release` as it comes up. Returns the response; `*on` is
/// already flipped when `clicked()`.
pub fn slide(ui: &mut Ui, th: &Theme, id: &str, on: &mut bool, kind: SlideKind) -> egui::Response {
    let (rect, resp) = ui.allocate_exact_size(SLIDE_SIZE, Sense::click());
    let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
    crate::key::clicky_with(ui, &resp, crate::sfx::flip, crate::sfx::release);
    if resp.clicked() {
        *on = !*on;
    }
    let t = ui.ctx().animate_bool_with_time(ui.id().with(id).with("slide"), *on, 0.16);
    // cubic-bezier(.34,1.25,.5,1): out, with a small overshoot past the stop
    let back_out = |x: f32| {
        let s = x - 1.0;
        1.0 + 1.8 * s * s * s + 0.8 * s * s
    };
    let eased = if *on { back_out(t) } else { 1.0 - back_out(1.0 - t) };
    if ui.is_rect_visible(rect) {
        paint_slide(ui.painter(), th, rect, kind, eased, resp.hovered());
    }
    resp
}
