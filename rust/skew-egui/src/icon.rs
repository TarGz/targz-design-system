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
    Play,
    Stop,
    /// `ICON.run` — the restart arrow.
    Restart,
    /// `ICON.ext` — open in browser.
    Ext,
    Search,
    /// `ICON.settle` — the down arrow onto a line: git pull, update.
    Pull,
    Term,
    Folder,
    /// `ICON.code` — open in editor.
    Code,
    Close,
    /// `ICON.pencil` — edit. On the launcher's strip it is the one door to
    /// everything that happens to a folder's name.
    Pencil,
    /// `ICON.check` — the tick on the orange cap that commits an inline edit.
    Check,
    /// `ICON.server` — THE ONE MARK IN THIS SET DRAWN RATHER THAN LIFTED.
    /// A tab has to say LOCAL or REMOTE and the set had only half of it:
    /// [`Icon::Term`] is the prompt and covers local, and the remote half was
    /// being carried by [`Icon::Ext`], which is the open-a-link arrow and
    /// reads as "this goes to a web page". Nothing in this repo or in
    /// Terminass had a server mark to take — that app tells its hosts apart by
    /// a letter and a colour, which is an identity and not a kind. Two rack
    /// units with their lamps, because it is already this language:
    /// everything else in here is a machined box with a lamp on it. A globe
    /// would have said the internet, which is the wire and not the machine.
    Server,
    /// `ICON.key` — a bit and a bow. KEYCHAIN, and before this the rail was
    /// borrowing [`Icon::Eye`] for it, which means SHOW.
    Key,
    /// `ICON.forward` — two lines that SWAP. What arrives here comes out
    /// there, which is what a forward is. PORT FORWARDING, which was borrowing
    /// [`Icon::Ext`] — the open-a-link arrow, which says "this goes to a web
    /// page" and is the one thing a local forward does not do. Not a fork:
    /// a fork is one line becoming two, which is a different claim.
    Forward,
    /// `ICON.clock` — a dial and two hands. LOGS: a list of things that
    /// happened, which is a list ordered by TIME. It was borrowing
    /// [`Icon::Term`], the prompt, which is where you type rather than where
    /// you read back.
    Clock,
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
        Icon::Play => {
            p.m(6.0, 3.0).l(20.0, 12.0).l(6.0, 21.0);
            p.end(true);
        }
        Icon::Stop => {
            p.m(7.0, 5.0).l(17.0, 5.0).arc(17.0, 7.0, 2.0, -90.0, 0.0).l(19.0, 17.0)
                .arc(17.0, 17.0, 2.0, 0.0, 90.0).l(7.0, 19.0).arc(7.0, 17.0, 2.0, 90.0, 180.0)
                .l(5.0, 7.0).arc(7.0, 7.0, 2.0, 180.0, 270.0);
            p.end(true);
        }
        Icon::Restart => {
            // polyline 1 4 1 10 7 10 · M3.51 15 a9 9 0 1 0 2.13-9.36 L1 10
            p.m(1.0, 4.0).l(1.0, 10.0).l(7.0, 10.0);
            p.m(3.51, 15.0);
            for i in 1..=24 {
                let a = (160.5 - 295.5 * i as f32 / 24.0).to_radians();
                p.l(12.0 + 9.0 * a.cos(), 12.0 + 9.0 * a.sin());
            }
            p.l(1.0, 10.0);
        }
        Icon::Ext => {
            p.m(18.0, 13.0).l(18.0, 19.0).arc(16.0, 19.0, 2.0, 0.0, 90.0).l(5.0, 21.0)
                .arc(5.0, 19.0, 2.0, 90.0, 180.0).l(3.0, 8.0).arc(5.0, 8.0, 2.0, 180.0, 270.0).l(11.0, 6.0);
            p.m(15.0, 3.0).l(21.0, 3.0).l(21.0, 9.0);
            p.m(10.0, 14.0).l(21.0, 3.0);
        }
        Icon::Search => {
            p.circle(11.0, 11.0, 7.0);
            p.m(21.0, 21.0).l(16.65, 16.65);
        }
        Icon::Pull => {
            p.m(12.0, 3.0).l(12.0, 14.0);
            p.m(7.5, 9.5).l(12.0, 14.0).l(16.5, 9.5);
            p.m(4.0, 20.0).l(20.0, 20.0);
        }
        Icon::Term => {
            p.m(4.0, 17.0).l(10.0, 11.0).l(4.0, 5.0);
            p.m(12.0, 19.0).l(20.0, 19.0);
        }
        Icon::Folder => {
            p.m(22.0, 19.0).arc(20.0, 19.0, 2.0, 0.0, 90.0).l(4.0, 21.0).arc(4.0, 19.0, 2.0, 90.0, 180.0)
                .l(2.0, 5.0).arc(4.0, 5.0, 2.0, 180.0, 270.0).l(9.0, 3.0).l(11.0, 6.0).l(20.0, 6.0)
                .arc(20.0, 8.0, 2.0, -90.0, 0.0);
            p.end(true);
        }
        Icon::Code => {
            p.m(16.0, 18.0).l(22.0, 12.0).l(16.0, 6.0);
            p.m(8.0, 6.0).l(2.0, 12.0).l(8.0, 18.0);
        }
        Icon::Close => {
            p.m(18.0, 6.0).l(6.0, 18.0);
            p.m(6.0, 6.0).l(18.0, 18.0);
        }
        // ── THE RAIL'S THREE, AND THEY ARE LIFTED AFTER ALL ───────────────
        // The first draft of these was drawn, and that was wrong twice over.
        // `skew-panels.html` § 07 has already been posing the rail with all
        // three marks on it, inline in the stage — they were simply never
        // named in `ICON`, so nothing could reach them and the crate could not
        // see they existed. These are those paths, unchanged. CONTRIBUTING:
        // a specimen is lifted, not written, and "already in the sheet but
        // anonymous" still counts as there.
        //
        // `ICON.server` keeps its note about being the one mark drawn rather
        // than lifted. It is still the one.
        Icon::Key => {
            // `<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v4"/>`
            // the bow, the shaft, and one ward — KEYCHAIN, where the rail was
            // borrowing `Eye`, which means SHOW
            p.circle(8.0, 12.0, 4.0);
            p.m(12.0, 12.0).l(21.0, 12.0);
            p.m(18.0, 12.0).l(18.0, 16.0);
        }
        Icon::Forward => {
            // `<path d="M4 8h10l6 8M4 16h10l6-8"/>` — TWO LINES THAT SWAP,
            // which is what a forward IS: what arrives here comes out there.
            // Not a fork (one line becoming two) and emphatically not `Ext`,
            // the open-a-link arrow the rail was borrowing, which says "this
            // goes to a web page" — the one thing a local forward never does.
            p.m(4.0, 8.0).l(14.0, 8.0).l(20.0, 16.0);
            p.m(4.0, 16.0).l(14.0, 16.0).l(20.0, 8.0);
        }
        Icon::Clock => {
            // `<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>`
            // LOGS: a list of things that happened, which is a list ordered by
            // TIME. The rail was borrowing `Term`, the prompt, which is where
            // you type rather than where you read back.
            p.circle(12.0, 12.0, 8.0);
            p.m(12.0, 8.0).l(12.0, 12.0).l(15.0, 14.0);
        }
        Icon::Server => {
            // two rack units, 18 × 7 at a 2px round, and the lamp on each
            for y in [4.0_f32, 13.0] {
                p.m(5.0, y).l(19.0, y).arc(19.0, y + 2.0, 2.0, -90.0, 0.0)
                    .l(21.0, y + 5.0).arc(19.0, y + 5.0, 2.0, 0.0, 90.0)
                    .l(5.0, y + 7.0).arc(5.0, y + 5.0, 2.0, 90.0, 180.0)
                    .l(3.0, y + 2.0).arc(5.0, y + 2.0, 2.0, 180.0, 270.0);
                p.end(true);
                p.circle(6.5, y + 3.5, 0.6);
            }
        }
        // `M12 20h9` and the nib: a stroke from the tip up to the hinge, the
        // 2.12-radius corner at the top, then back down to the tail.
        // `M12 20h9` is the rule under it, and the nib is the SVG's own
        // `a2.12 2.12 0 0 1 3 3`: a half-turn about (18,5) from 225° round to
        // 45°, which is the corner where the two long edges of the pencil meet.
        Icon::Pencil => {
            p.m(12.0, 20.0).l(21.0, 20.0);
            p.m(16.5, 3.5).arc(18.0, 5.0, 2.12, 225.0, 405.0)
                .l(7.0, 19.0).l(3.0, 20.0).l(4.0, 16.0);
            p.end(true);
        }
        Icon::Check => {
            p.m(20.0, 6.0).l(9.0, 17.0).l(4.0, 12.0);
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

/// Play or Stop drawn SOLID — the transport glyphs, filled as every transport
/// draws them — with an optional soft light of `glow` around them.
pub fn paint_icon_solid(p: &egui::Painter, icon: Icon, c: Pos2, px: f32, col: Color32, glow: Option<Color32>) {
    let k = px / 24.0;
    let pts: Vec<Pos2> = match icon {
        Icon::Play => vec![pos2(6.0, 3.0), pos2(20.0, 12.0), pos2(6.0, 21.0)],
        _ => vec![pos2(5.0, 5.0), pos2(19.0, 5.0), pos2(19.0, 19.0), pos2(5.0, 19.0)],
    };
    // optical centre: a triangle's mass sits left of its box centre
    let shift = if icon == Icon::Play { 1.0 } else { 0.0 };
    let map = |q: &Pos2, s: f32| pos2(c.x + (q.x - 12.0 + shift) * k * s, c.y + (q.y - 12.0) * k * s);
    if let Some(g) = glow {
        for (s, a) in [(1.45, 0.10), (1.25, 0.18)] {
            let ring: Vec<Pos2> = pts.iter().map(|q| map(q, s)).collect();
            p.add(egui::Shape::convex_polygon(ring, g.gamma_multiply(a), Stroke::NONE));
        }
    }
    let body: Vec<Pos2> = pts.iter().map(|q| map(q, 1.0)).collect();
    p.add(egui::Shape::convex_polygon(body, col, Stroke::new(1.2 * k, col)));
}
