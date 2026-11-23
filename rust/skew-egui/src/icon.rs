//! The kit's line icons, drawn as egui strokes.
//!
//! Each is the `ICON.*` SVG from `src/skew-kit.js` transcribed point for point
//! in its 24-unit box: `stroke-linecap:round`, `fill:none`, and the stroke
//! width each part sets (`.sw` 1.7, `.key` 1.8, `.micro` 1.7, `.chev` 2.4).
//! egui cannot read SVG, and six icons do not justify a rasteriser.

use egui::epaint::PathShape;
use egui::{pos2, Color32, Pos2, Stroke};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Icon {
    Eye,
    Upload,
    Sun,
    Copy,
    Trash,
    Chev,
}

/// A path in the 24-unit box, as open or closed polylines.
struct Pen {
    lines: Vec<(Vec<Pos2>, bool)>,
    cur: Vec<Pos2>,
}

impl Pen {
    fn new() -> Self {
        Pen { lines: Vec::new(), cur: Vec::new() }
    }
    fn m(&mut self, x: f32, y: f32) -> &mut Self {
        self.end(false);
        self.cur.push(pos2(x, y));
        self
    }
    fn l(&mut self, x: f32, y: f32) -> &mut Self {
        self.cur.push(pos2(x, y));
        self
    }
    /// A quarter arc of radius `r` about `(cx, cy)` from `a0` to `a1` degrees
    /// (0 = +x, 90 = +y, SVG's y-down).
    fn arc(&mut self, cx: f32, cy: f32, r: f32, a0: f32, a1: f32) -> &mut Self {
        for i in 0..=6 {
            let a = (a0 + (a1 - a0) * i as f32 / 6.0).to_radians();
            self.cur.push(pos2(cx + r * a.cos(), cy + r * a.sin()));
        }
        self
    }
    fn cubic(&mut self, c1: Pos2, c2: Pos2, e: Pos2) -> &mut Self {
        let s = *self.cur.last().unwrap();
        for i in 1..=10 {
            let t = i as f32 / 10.0;
            let u = 1.0 - t;
            let q = s.to_vec2() * (u * u * u)
                + c1.to_vec2() * (3.0 * u * u * t)
                + c2.to_vec2() * (3.0 * u * t * t)
                + e.to_vec2() * (t * t * t);
            self.cur.push(q.to_pos2());
        }
        self
    }
    fn circle(&mut self, cx: f32, cy: f32, r: f32) -> &mut Self {
        self.end(false);
        for i in 0..32 {
            let a = (i as f32 / 32.0) * std::f32::consts::TAU;
            self.cur.push(pos2(cx + r * a.cos(), cy + r * a.sin()));
        }
        self.end(true);
        self
    }
    fn end(&mut self, closed: bool) {
        if self.cur.len() > 1 {
            self.lines.push((std::mem::take(&mut self.cur), closed));
        } else {
            self.cur.clear();
        }
    }
}

fn build(icon: Icon) -> Vec<(Vec<Pos2>, bool)> {
    let mut p = Pen::new();
    match icon {
        Icon::Eye => {
            // M1 12 s4-7 11-7 11 7 11 7 -4 7-11 7 -11-7-11-7z
            p.m(1.0, 12.0)
                .cubic(pos2(1.0, 12.0), pos2(5.0, 5.0), pos2(12.0, 5.0))
                .cubic(pos2(19.0, 5.0), pos2(23.0, 12.0), pos2(23.0, 12.0))
                .cubic(pos2(23.0, 12.0), pos2(19.0, 19.0), pos2(12.0, 19.0))
                .cubic(pos2(5.0, 19.0), pos2(1.0, 12.0), pos2(1.0, 12.0));
            p.end(true);
            p.circle(12.0, 12.0, 3.0);
        }
        Icon::Upload => {
            p.m(21.0, 15.0).l(21.0, 19.0).arc(19.0, 19.0, 2.0, 0.0, 90.0).l(5.0, 21.0)
                .arc(5.0, 19.0, 2.0, 90.0, 180.0).l(3.0, 15.0);
            p.m(17.0, 8.0).l(12.0, 3.0).l(7.0, 8.0);
            p.m(12.0, 3.0).l(12.0, 15.0);
        }
        Icon::Sun => {
            p.circle(12.0, 12.0, 4.0);
            for (a, b, c, d) in [
                (12.0, 1.0, 12.0, 3.0), (12.0, 21.0, 12.0, 23.0),
                (4.2, 4.2, 5.6, 5.6), (18.4, 18.4, 19.8, 19.8),
                (1.0, 12.0, 3.0, 12.0), (21.0, 12.0, 23.0, 12.0),
                (4.2, 19.8, 5.6, 18.4), (18.4, 5.6, 19.8, 4.2),
            ] {
                p.m(a, b).l(c, d);
            }
        }
        Icon::Copy => {
            // rect x9 y9 12×12 rx2
            p.m(11.0, 9.0).l(19.0, 9.0).arc(19.0, 11.0, 2.0, -90.0, 0.0).l(21.0, 19.0)
                .arc(19.0, 19.0, 2.0, 0.0, 90.0).l(11.0, 21.0).arc(11.0, 19.0, 2.0, 90.0, 180.0)
                .l(9.0, 11.0).arc(11.0, 11.0, 2.0, 180.0, 270.0);
            p.end(true);
            p.m(6.0, 15.0).l(5.0, 15.0).arc(5.0, 13.0, 2.0, 90.0, 180.0).l(3.0, 5.0)
                .arc(5.0, 5.0, 2.0, 180.0, 270.0).l(13.0, 3.0).arc(13.0, 5.0, 2.0, -90.0, 0.0).l(15.0, 6.0);
        }
        Icon::Trash => {
            p.m(3.0, 6.0).l(5.0, 6.0).l(21.0, 6.0);
            p.m(19.0, 6.0).l(19.0, 20.0).arc(17.0, 20.0, 2.0, 0.0, 90.0).l(7.0, 22.0)
                .arc(7.0, 20.0, 2.0, 90.0, 180.0).l(5.0, 6.0);
            p.m(8.0, 6.0).l(8.0, 4.0).arc(10.0, 4.0, 2.0, 180.0, 270.0).l(14.0, 2.0)
                .arc(14.0, 4.0, 2.0, -90.0, 0.0).l(16.0, 6.0);
        }
        Icon::Chev => {
            p.m(9.0, 6.0).l(15.0, 12.0).l(9.0, 18.0);
        }
    }
    p.end(false);
    p.lines
}

/// Draw `icon` centred on `c`, `px` wide, with `stroke` in the 24-unit box
/// (the CSS `stroke-width`), turned `deg` clockwise.
pub fn paint_icon(p: &egui::Painter, icon: Icon, c: Pos2, px: f32, stroke: f32, col: Color32, deg: f32) {
    let k = px / 24.0;
    let w = (stroke * k).max(0.8);
    let (s, co) = deg.to_radians().sin_cos();
    let map = |q: Pos2| {
        let (x, y) = ((q.x - 12.0) * k, (q.y - 12.0) * k);
        pos2(c.x + x * co - y * s, c.y + x * s + y * co)
    };
    for (pts, closed) in build(icon) {
        let pts: Vec<Pos2> = pts.into_iter().map(map).collect();
        if !closed {
            for e in [pts[0], pts[pts.len() - 1]] {
                p.circle_filled(e, w / 2.0, col);
            }
        }
        let shape = if closed {
            PathShape::closed_line(pts, Stroke::new(w, col))
        } else {
            PathShape::line(pts, Stroke::new(w, col))
        };
        p.add(shape);
    }
}

/// The lit legend: four offsets of the accent at low alpha, then the ink —
/// `docs/PORTING.md` §3, a glow without a blur.
pub fn paint_icon_lit(p: &egui::Painter, icon: Icon, c: Pos2, px: f32, stroke: f32, ink: Color32, glow: Color32) {
    let g = Color32::from_rgba_unmultiplied(glow.r(), glow.g(), glow.b(), 30);
    for d in [egui::vec2(0.7, 0.0), egui::vec2(-0.7, 0.0), egui::vec2(0.0, 0.7), egui::vec2(0.0, -0.7)] {
        paint_icon(p, icon, c + d, px, stroke, g, 0.0);
    }
    paint_icon(p, icon, c, px, stroke, ink, 0.0);
}
