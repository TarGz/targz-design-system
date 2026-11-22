//! The four drawing primitives the parts are built out of.
//!
//! `egui` has no inset box-shadow, no CSS gradient, no text-shadow and no
//! filter, and the characteristic parts of this language are made of exactly
//! those (`docs/PORTING.md`, part one). This is the bottom of that translation.

use egui::{pos2, Color32, Rect};

/// `0xRRGGBB` as an opaque colour. `const` so a token can be a `const`.
pub const fn hex(v: u32) -> Color32 {
    Color32::from_rgb((v >> 16) as u8, (v >> 8) as u8, v as u8)
}

/// 0-1 floats as a colour — what `dist/skew-tokens.js` emits for vertex buffers.
pub fn rgb(c: [f32; 3]) -> Color32 {
    Color32::from_rgb(
        (c[0] * 255.0) as u8,
        (c[1] * 255.0) as u8,
        (c[2] * 255.0) as u8,
    )
}

/// Linear blend, `t` from `a` to `b`. Every lit edge, wall and hover step in
/// this crate is a mix of a base colour towards white or black, so that the
/// family of a key is one colour and not six.
pub fn mix(a: Color32, b: Color32, t: f32) -> Color32 {
    let l = |x: u8, y: u8| (x as f32 + (y as f32 - x as f32) * t) as u8;
    Color32::from_rgb(l(a.r(), b.r()), l(a.g(), b.g()), l(a.b(), b.b()))
}

/// Put a coordinate on the physical pixel grid.
///
/// egui lays out in points and the screen is in pixels, so a hairline at an
/// arbitrary point lands across two rows of pixels and is drawn as two half-lit
/// ones. At this scale that is the difference between an engraved line and a
/// grey smear — and a panel made of hairlines shows it everywhere at once.
pub fn snap(p: &egui::Painter, v: f32) -> f32 {
    let ppp = p.ctx().pixels_per_point();
    (v * ppp).round() / ppp
}

/// The same, offset half a pixel: where a 1px stroke's CENTRE has to sit for the
/// line to cover exactly one row of pixels.
pub fn snap_line(p: &egui::Painter, v: f32) -> f32 {
    let ppp = p.ctx().pixels_per_point();
    ((v * ppp).floor() + 0.5) / ppp
}

/// A rect with every edge on the pixel grid.
pub fn snap_rect(p: &egui::Painter, r: Rect) -> Rect {
    Rect::from_min_max(
        egui::pos2(snap(p, r.left()), snap(p, r.top())),
        egui::pos2(snap(p, r.right()), snap(p, r.bottom())),
    )
}

/// One line of an inset shadow, **cut to the part's own corner**.
///
/// `inset 0 2px 5px` in CSS follows the border radius: at two pixels down, the
/// shadow is only as wide as the box is at two pixels down. Drawn as a straight
/// line from edge to edge it runs out past the curve at both ends and reads as a
/// separate bar laid across the top of the part — which is exactly what it looks
/// like, because at that height there is no part there yet.
///
/// `depth` is how far in from the edge; the horizontal inset is the chord of the
/// corner circle at that depth.
pub fn edge_line(
    p: &egui::Painter,
    rect: Rect,
    radius: f32,
    depth: f32,
    from_top: bool,
    stroke: egui::Stroke,
) {
    let r = radius.max(0.0);
    let inset = if depth < r {
        r - (r * r - (r - depth) * (r - depth)).max(0.0).sqrt()
    } else {
        0.0
    };
    let y = snap_line(
        p,
        if from_top {
            rect.top() + depth
        } else {
            rect.bottom() - depth
        },
    );
    let (a, b) = (rect.left() + inset + 0.5, rect.right() - inset - 0.5);
    if b > a {
        p.line_segment([pos2(a, y), pos2(b, y)], stroke);
    }
}

/// **And there is a sheet of glass over it.**
///
/// Not a contradiction of "the panel does not emit": the panel does not — the
/// cover over it is another material, and a hard clear cover is the one part of
/// a display module that is glossy. The reflection belongs to the room, not to
/// the device; it is there with the power off.
///
/// Two panes and a ceiling, because a real reflection is more than one thing. A
/// broad sheen where the top of the glass catches the ceiling, and two hard
/// streaks at angles that do not agree — a window has a mullion, and two edges
/// that disagree is what says the reflection is OF something rather than being a
/// shine applied TO something. One streak reads as glass; three read as an
/// effect, which is the difference between the thing and the sticker.
///
/// **The streaks are sized in pixels, not in per cent.** A gradient stop is a
/// fraction of the box, so the two panes that read as a window on a 52px readout
/// became a 700px diagonal wash on a full-width one. A wider pane of glass shows
/// more GLASS, not a wider window.
///
/// Safe for the ink by construction: every layer is white, so the ground only
/// gets lighter.
///
/// **`strength` is a fraction of the stylesheet's alphas, and it is not 1.** The
/// CSS numbers are a reflection on a 52px chip seen at browser scale; on a 290px
/// DRO module the same fractions draw a white sheet across the glass and the
/// coordinate reads through it. A reflection is something you notice when you
/// look for it. [`crate::Theme::glass`] holds the value — and it is zero in
/// dark, where the window is a lit one and the room is not in it.
pub fn glass(p: &egui::Painter, rect: Rect, radius: f32, streak: f32, sheen: f32) {
    if streak <= 0.0 && sheen <= 0.0 {
        return;
    }
    let p = &p.with_clip_rect(rect.shrink(1.0));
    // ── THE UNIT IS AN ALPHA LEVEL, BECAUSE THAT IS ALL THERE IS ───────────
    // A vertex colour is eight bits. At the strengths this effect actually runs
    // at, the whole reflection lives in the first three or four levels of 255 —
    // so a control calibrated in per cent of the stylesheet has most of its
    // travel doing nothing and one notch doing everything, and clamping a
    // non-zero stop up to one level (which this did for a version) flattens
    // every stop to the same value and leaves exactly two outcomes: off, and
    // all of it. So `streak` and `sheen` are the PEAK stop's alpha, in levels,
    // and every other stop keeps its ratio to that peak. One notch is one level
    // and there is nothing finer to ask for.
    const SHEEN_PEAK: f32 = 0.15; // the ceiling's brightest stop, in CSS
    let c = |v: f32| ((v / SHEEN_PEAK) * sheen).round().clamp(0.0, 255.0) as u8;
    // the window: a thin light running the inside of the top edge and turning
    // down the right corner, which is what a moulded edge does with a room in
    // front of it — see `edge_streak`
    edge_streak(p, rect, radius, streak);
    // the ceiling, and it is the one layer that spans, because the ceiling
    // really is as wide as the glass
    band(p, rect, 180.0, 0.0, &[(0.0, c(0.15)), (0.40, c(0.04)), (0.64, 0)]);
}

/// The light on a moulded edge: a thin bright line following the inside of the
/// top edge, round the top-right corner and a short way down the right side,
/// fading out at both ends.
///
/// **This replaced two diagonal panes and it is not a smaller version of them.**
/// A pane is a window reflected in flat glass, and on a part this wide it is a
/// broad wash whatever its alpha — the thing you see is the gradient, not the
/// window. What a cast or moulded edge actually does is catch the room along the
/// one line where the surface turns: bright where it faces the lamp, gone within
/// a couple of pixels, and carried round the corner because the corner is where
/// the turn is sharpest. One line, two fades, and the part reads as having a
/// front face and an edge.
fn edge_streak(p: &egui::Painter, rect: Rect, radius: f32, alpha: f32) {
    use egui::epaint::{Mesh, Vertex, WHITE_UV};
    if alpha <= 0.0 {
        return;
    }
    // ── AND IT IS CUT TO THE PART, NOT TO A SET OF NUMBERS ─────────────────
    // The same inset and the same tails that model a 68px module are, on a 26px
    // chip, a line parked in the middle of the face with a hook longer than the
    // corner it is turning. A moulded edge is a property of the EDGE: it sits
    // against it and its length is the corner's, so every value here is read off
    // the part's own height.
    let h = rect.height();
    let inset = (h * 0.03).clamp(1.0, 2.0);
    let width = (h * 0.024).clamp(0.9, 1.6);
    let tail_l = (h * 0.15).clamp(3.0, 10.0); // how far down the left it starts
    let tail_r = (h * 0.33).clamp(6.0, 22.0); // and how far down the right it dies
    let rc = rect.shrink(inset);
    let r = (radius - inset)
        .max(0.5)
        .min(rc.height() / 2.0)
        .min(rc.width() / 2.0);

    let mut pts: Vec<egui::Pos2> = Vec::with_capacity(22);
    pts.push(pos2(rc.left(), rc.top() + r + tail_l));
    for i in 0..=8 {
        let a = (180.0 + i as f32 * 90.0 / 8.0f32).to_radians();
        pts.push(pos2(rc.left() + r + r * a.cos(), rc.top() + r + r * a.sin()));
    }
    for i in 0..=8 {
        let a = (270.0 + i as f32 * 90.0 / 8.0f32).to_radians();
        pts.push(pos2(rc.right() - r + r * a.cos(), rc.top() + r + r * a.sin()));
    }
    pts.push(pos2(rc.right(), rc.top() + r + tail_r));

    // alpha by distance along the line: in fast, hold across the top, out slowly
    let mut len = vec![0.0f32];
    for i in 1..pts.len() {
        len.push(len[i - 1] + (pts[i] - pts[i - 1]).length());
    }
    let total = *len.last().unwrap_or(&1.0);
    let profile = |t: f32| -> f32 {
        if t < 0.10 {
            t / 0.10
        } else if t < 0.62 {
            1.0
        } else {
            ((1.0 - t) / 0.38).max(0.0)
        }
    };

    let mut m = Mesh::default();
    for i in 0..pts.len() {
        let d = if i == 0 {
            pts[1] - pts[0]
        } else if i == pts.len() - 1 {
            pts[i] - pts[i - 1]
        } else {
            pts[i + 1] - pts[i - 1]
        };
        let n = egui::vec2(-d.y, d.x).normalized();
        let al = (alpha * profile(len[i] / total)).round().clamp(0.0, 255.0) as u8;
        let col = Color32::from_rgba_unmultiplied(255, 255, 255, al);
        m.vertices.push(Vertex {
            pos: pts[i] - n * (width / 2.0),
            uv: WHITE_UV,
            color: col,
        });
        m.vertices.push(Vertex {
            pos: pts[i] + n * (width / 2.0),
            uv: WHITE_UV,
            color: col,
        });
        if i > 0 {
            let b = (i as u32 - 1) * 2;
            m.indices
                .extend_from_slice(&[b, b + 1, b + 3, b, b + 3, b + 2]);
        }
    }
    p.add(m);
}

/// One CSS linear-gradient of white, as a strip of quads across its own axis.
///
/// **Clipped to its own box, which is the half that makes it a window.** A
/// `background-size` of 150px is a 150px pane; the quads are built long enough
/// to cover any angle, so without the clip the streak runs the full width of the
/// module and what should be a reflection of a window becomes a wash over the
/// whole glass.
fn band(p: &egui::Painter, rect: Rect, angle_deg: f32, taper: f32, stops: &[(f32, u8)]) {
    use egui::epaint::{Mesh, Vertex, WHITE_UV};
    // NO CLIP TO THE BAND'S OWN BOX. The taper below is the pane's edge; a clip
    // on top of it is a second edge, and the one that wins is the hard one — a
    // streak sliced off down a vertical line in the middle of the glass, which
    // is not something a window does. The module's own clip, set in `glass`,
    // still keeps everything on the part.
    let a = angle_deg.to_radians();
    // CSS angles: 0deg points up, clockwise, in a y-down space
    let d = egui::vec2(a.sin(), -a.cos());
    let n = egui::vec2(-d.y, d.x);
    let (w, h) = (rect.width(), rect.height());
    let len = (w * a.sin()).abs() + (h * a.cos()).abs();
    let c = rect.center();
    let at = |t: f32| c + d * ((t - 0.5) * len);
    // ACROSS the gradient, a pane ENDS — and a hard end is a cut, which is what
    // a streak that stops dead in the middle of the glass is. The clip alone
    // gives that cut; the taper is the pane's own edge arriving. The ceiling
    // passes 0 and spans, because the ceiling really is as wide as the glass.
    let ext = ((w * n.x).abs() + (h * n.y).abs()) / 2.0;
    let (half, inner) = if taper > 0.0 {
        (ext, ext * (1.0 - taper))
    } else {
        let far = (w * w + h * h).sqrt();
        (far, far)
    };
    let segs: &[(f32, f32, f32, f32)] = &[
        (-half, 0.0, -inner, 1.0),
        (-inner, 1.0, inner, 1.0),
        (inner, 1.0, half, 0.0),
    ];
    let mut m = Mesh::default();
    for pair in stops.windows(2) {
        let (t0, a0) = pair[0];
        let (t1, a1) = pair[1];
        let (p0, p1) = (at(t0), at(t1));
        for &(s0, f0, s1, f1) in segs {
            if s1 <= s0 {
                continue;
            }
            let base = m.vertices.len() as u32;
            for (q, al) in [
                (p0 + n * s0, a0 as f32 * f0),
                (p0 + n * s1, a0 as f32 * f1),
                (p1 + n * s1, a1 as f32 * f1),
                (p1 + n * s0, a1 as f32 * f0),
            ] {
                m.vertices.push(Vertex {
                    pos: q,
                    uv: WHITE_UV,
                    color: Color32::from_rgba_unmultiplied(255, 255, 255, al.round() as u8),
                });
            }
            m.indices
                .extend_from_slice(&[base, base + 1, base + 2, base, base + 2, base + 3]);
        }
    }
    p.add(m);
}

/// A smooth vertical gradient filling a rounded rect.
///
/// One mesh tessellated to the exact cap outline — a fan from the centre to a
/// perimeter of four eight-segment arcs, each vertex coloured by its height. It
/// is the only way to get a gradient in egui, and it comes with one catch:
/// **a mesh has no anti-aliasing**. Paint an AA `rect_filled` first and inset
/// this by about 1.2px, so the mesh's hard edge hides under the smooth rim.
pub fn vgrad(p: &egui::Painter, rect: Rect, radius: f32, top: Color32, bottom: Color32) {
    use egui::epaint::{Mesh, Vertex, WHITE_UV};
    let r = radius.min(rect.height() / 2.0).min(rect.width() / 2.0);
    let col = |y: f32| {
        mix(
            top,
            bottom,
            ((y - rect.top()) / rect.height().max(1.0)).clamp(0.0, 1.0),
        )
    };
    // perimeter: four arcs, clockwise from the top-right corner
    let mut pts: Vec<egui::Pos2> = Vec::with_capacity(40);
    let corners = [
        (pos2(rect.right() - r, rect.top() + r), -90.0_f32),
        (pos2(rect.right() - r, rect.bottom() - r), 0.0),
        (pos2(rect.left() + r, rect.bottom() - r), 90.0),
        (pos2(rect.left() + r, rect.top() + r), 180.0),
    ];
    for (c, a0) in corners {
        for i in 0..=8 {
            let a = (a0 + i as f32 * 90.0 / 8.0).to_radians();
            pts.push(pos2(c.x + r * a.cos(), c.y + r * a.sin()));
        }
    }
    let mut m = Mesh::default();
    m.vertices.push(Vertex {
        pos: rect.center(),
        uv: WHITE_UV,
        color: col(rect.center().y),
    });
    for q in &pts {
        m.vertices.push(Vertex {
            pos: *q,
            uv: WHITE_UV,
            color: col(q.y),
        });
    }
    let n = pts.len() as u32;
    for i in 0..n {
        m.indices.extend_from_slice(&[0, 1 + i, 1 + (i + 1) % n]);
    }
    p.add(m);
}
