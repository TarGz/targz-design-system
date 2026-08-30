/* ─────────────────────────────────────────────────────────────────────────────
   skew-hatch.js — GENERATED. DO NOT HAND-EDIT.

     source   ../src/skew-hatch.js
     at       Skew v1.103.0
     rebuild  node tools/build-dist.mjs --write

   A patch applied here disappears at the next build, silently, and the way you
   find out is that a control stops matching the reference. Change the source.
   ───────────────────────────────────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════════
   SKEW · THE HATCH ENGINE
   ══════════════════════════════════════════════════════════════════════════

   Everything that turns a region into pen strokes. No DOM, no measuring, no
   drawing — this file hands back path data in MILLIMETRES and never asks what
   it is going to be drawn on.

   IT LIVED INSIDE A DOCUMENTATION PAGE UNTIL v1.31.0, defined halfway down two
   specimen rigs in `skew-panels.html`: `KIT` inside one, `HANDS` filled in by
   another through a `let` declared 700 lines above it, the machine fills
   private to a third. Three consequences, and the third is the one that made
   this a file. The hatch bay depended on a specimen rig running first. Nothing
   could use the generators without loading a 215KB document. And a hatching
   system is the one thing here that is meant to KEEP GROWING — new hands, new
   machine fills, better chaining — which is a thing you do to a file you can
   open, not to a thing wedged between a window demo and a bill.

   ── THE ONE CONTRACT EVERYTHING OBEYS ─────────────────────────────────────
   A region is a function `tone(x, y) → number`:

       < 0      outside the region — never draw here
       0 … 1    inside; 0 is bare paper, 1 is as dark as the fill goes

   That is the entire coupling. Any subject that answers it can be filled by
   any generator here, and no generator asks what shape it is on.

   ── EVERYTHING IS MILLIMETRES ─────────────────────────────────────────────
   There is no pixel anywhere below the DOM. A caller measures its element,
   converts at 96 / 25.4, and passes `w, h`. One unit out is one millimetre on
   paper, so the SVG needs no rescale and the plotter needs no scaling step.
   Get this wrong and every number in the API means nothing — AND IT WILL
   STILL RUN, which is why it is written at the top of the file rather than in
   a comment beside one function.

   ── WHAT IS EXPORTED ──────────────────────────────────────────────────────
   KIT     the subjects and the primitives: scene, blob, the line families,
           carve. Shared, and the reason two fills of one idea cannot drift
           apart — light the ball differently in two places and the two stop
           being comparable, which is the only reason either is worth having.
   HANDS   the three hand fills. draw / drawShape (kind, w, h, seed, opt)
   HATCH   the machine side: scanlines, stitch, cut, and the mm formatter.

   Reference: HATCH-API.md. Specimens and the argument for every choice:
   the HATCH page, docs/skew-hatch.html.
   ══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── THE SPECIMEN KIT — the subjects, the tone model, the primitives ─────
     Moved whole. `scene()` is the ball, the table and the lamp; `blob()` is the
     flat shape; `latitudes()` follows the form and `parallels()` deliberately
     does not; `carve()` is what turns a family of lines into the part of it
     that is dark enough to draw. */
const KIT = (function specimenKit() {
  const rng = s => { let r = (s >>> 0) || 1; return () => (r = (r * 1664525 + 1013904223) >>> 0) / 4294967296; };
  const noise = s => {
    const g = [], rr = rng(s);
    for (let i = 0; i < 512; i++) g[i] = rr() * 2 - 1;
    return x => {
      const i = Math.floor(x), f = x - i, t = f * f * (3 - 2 * f);
      return g[i & 511] + (g[(i + 1) & 511] - g[i & 511]) * t;
    };
  };
  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const norm = v => { const m = Math.hypot(v[0], v[1], v[2]); return [v[0] / m, v[1] / m, v[2] / m]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const plen = p => { let t = 0; for (let i = 1; i < p.length; i++) t += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return t; };

  /* ── the scene: one ball, one table, one lamp ─────────────────────────── */
  function scene(w, h) {
    const R = Math.min(w * 0.34, h * 0.295);
    const cx = w * 0.45, cy = h * 0.42;
    const gy = cy + R;                                   // the contact point
    const L = norm([-0.52, -0.60, 0.53]);                // the lamp: up, left, front
    const B = norm([0.42, 0.70, 0.28]);                  // the table's bounce: low, right
    const sx = cx + R * 0.55, sy = gy + R * 0.09, srx = R * 1.08, sry = R * 0.30;

    /* THE BALL. 1 - n·L is the whole of it and it is not enough: that draws a
       shaded disc, which is what a flat fill looks like. What makes a sphere a
       sphere is the BOUNCE — the table throwing light back at the underside, so
       the darkest band is not the edge but the terminator, and there is a rim of
       paper INSIDE the shadow side. Take that away and the ball goes flat even
       though every other number is right. */
    const ball = (x, y) => {
      const dx = (x - cx) / R, dy = (y - cy) / R, d2 = dx * dx + dy * dy;
      if (d2 > 1) return -1;
      const nz = Math.sqrt(1 - d2);
      const lam = dx * L[0] + dy * L[1] + nz * L[2];
      const lit = clamp01((lam - 0.02) / 0.86);
      let t = 1 - Math.pow(lit, 0.72);
      /* THE DARKEST PLACE IS NOT THE EDGE, it is the band just past the
         terminator. Miss that and every tone still reads as a gradient — which
         is what a shaded disc is. */
      t += 0.16 * Math.exp(-Math.pow((lam + 0.10) / 0.20, 2));
      const bo = Math.max(0, dx * B[0] + dy * B[1] + nz * B[2]);
      /* the bounce is blocked where the ball meets the table, which is why the
         contact stays black while the rim beside it lifts */
      const occ = clamp01((Math.hypot(dx, (dy - 1) * 1.10) - 0.26) / 0.46);
      t -= Math.pow(bo, 4.2) * 0.36 * occ * (1 - lit);
      return clamp01(t) * 0.98;
    };

    /* THE CAST SHADOW is the only thing that says "table". No horizon line: the
       refs have none either, and a drawn line would be a second object competing
       with the one being tested. */
    const shadow = (x, y) => {
      const dx = (x - cx) / R, dy = (y - cy) / R;
      if (dx * dx + dy * dy < 1.0) return -1;            // the ball is in front of it
      const u = (x - sx) / srx, v = (y - sy) / sry, d = Math.hypot(u, v);
      if (d > 1) return -1;
      let t = (1 - Math.pow(d, 1.35)) * 0.90;
      const c = Math.hypot((x - cx) / (R * 0.58), (y - gy) / (R * 0.26));
      t = Math.max(t, 1.05 - c * 0.85);                  // the contact, which is near solid
      return clamp01(t);
    };
    return { R, cx, cy, gy, sx, sy, srx, sry, ball, shadow };
  }

  /* ── the strokes follow the form ───────────────────────────────────────── */
  function latitudes(A, phi0, dphi, cx, cy, R, step, phi1 = Math.PI, jit = () => 0) {
    const t0 = Math.abs(A[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const U = norm(cross(A, t0)), V = cross(A, U);
    const tHide = Math.atan2(V[2], U[2]) + Math.PI;      // start on the far side
    const out = [];
    for (let base = phi0; base < phi1; base += dphi) {
      /* NOBODY SPACES BY EYE AND GETS IT RIGHT. A perfectly even pitch is the
         single loudest machine tell in a fill — louder than straightness, which
         is why the wobble alone was never enough. */
      const phi = base + jit() * dphi * 0.34;
      const ca = Math.cos(phi), sa = Math.sin(phi), rad = R * sa;
      if (rad < step) continue;
      const dt = step / rad;
      let run = [];
      for (let k = 0; k <= Math.PI * 2 / dt + 1; k++) {
        const t = tHide + k * dt, c = Math.cos(t), s = Math.sin(t);
        const z = ca * A[2] + sa * (c * U[2] + s * V[2]);
        if (z > 0.015) {
          run.push([cx + R * (ca * A[0] + sa * (c * U[0] + s * V[0])),
                    cy + R * (ca * A[1] + sa * (c * U[1] + s * V[1]))]);
        } else if (run.length) { out.push(run); run = []; }
      }
      if (run.length) out.push(run);
    }
    return out;
  }

  function parallels(x0, y0, x1, y1, ang, s, off, step, jit = () => 0) {
    const a = ang * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    let tmin = Infinity, tmax = -Infinity;
    [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([px, py]) => {
      const t = (px - cx) * nx + (py - cy) * ny;
      if (t < tmin) tmin = t; if (t > tmax) tmax = t;
    });
    const L = Math.hypot(x1 - x0, y1 - y0);
    const out = [];
    for (let b = Math.ceil(tmin / s) * s + off; b <= tmax; b += s) {
      const t = b + jit() * s * 0.34;
      const px = cx + nx * t, py = cy + ny * t, run = [];
      for (let u = -L / 2; u <= L / 2; u += step) run.push([px + ux * u, py + uy * u]);
      out.push(run);
    }
    return out;
  }

  /* ── carve a family of lines down to the part that is dark enough ──────── */
  function carve(runs, tone, tau, dither, minLen) {
    const out = [];
    runs.forEach(pts => {
      let cur = [];
      for (const p of pts) {
        if (tone(p[0], p[1]) >= tau + dither(p[0], p[1])) cur.push(p);
        else { if (cur.length > 1) out.push(cur); cur = []; }
      }
      if (cur.length > 1) out.push(cur);
    });
    return out.filter(r => plen(r) >= minLen);
  }

  const f = v => (Math.round(v * 100) / 100);
  function toPath(p) {
    if (!p || p.length < 2) return '';
    let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    if (p.length === 2) return d + `L${f(p[1][0])} ${f(p[1][1])}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)},` +
           `${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)},` +
           `${f(p2[0])} ${f(p2[1])}`;
    }
    return d;
  }
  const thin = (p, n) => {
    if (p.length <= 3) return p;
    const o = [];
    for (let i = 0; i < p.length; i += n) o.push(p[i]);
    if (o[o.length - 1] !== p[p.length - 1]) o.push(p[p.length - 1]);
    return o;
  };

  const AXIS = (aDeg, bDeg) => {
    const a = aDeg * Math.PI / 180, b = bDeg * Math.PI / 180;
    return norm([Math.cos(b) * Math.cos(a), Math.cos(b) * Math.sin(a), -Math.sin(b)]);
  };

  /* ══════════════════════════════════════════════════════════════════════════
     THE SECOND TEST — a flat shape

     The ball tests TONE and nothing else: a circle has no corners, no neck and
     no concave anything, so a fill can look perfect on it and fall apart the
     first time it meets a real silhouette. This one carries no shading at all —
     one density, edge to edge — because what is being read here is the BOUNDARY:
     where the strokes stop, whether they stop in a line (a machine) or over a
     couple of tenths (a hand), and what happens in a notch too narrow to fit a
     stroke in.
     ══════════════════════════════════════════════════════════════════════════ */
  function blob(w, h, seed) {
    const rnd = rng(seed);
    /* THE RADIUS IS DERIVED, not chosen. The four harmonics sum to 0.65, so the
       blob's widest point is 1.65 × base — pick base as a fraction of the sheet
       and one seed in ten runs off the edge of it. Sized from the worst case
       instead, with 2.5mm of margin, the shape fits on every seed there is. */
    const base = (Math.min(w, h) / 2 - 2.5) / 1.65;
    const cx = w / 2, cy = h / 2;
    const ph = () => rnd() * Math.PI * 2;
    const ring = b => {
      const H = [[2, 0.25], [3, 0.20], [5, 0.13], [7, 0.07]].map(([k, a]) => [k, a, ph()]);
      return th => b * (1 + H.reduce((s, [k, a, p]) => s + a * Math.sin(k * th + p), 0));
    };
    const rad = ring(base);

    /* AND A HOLE IN IT, because a fill that has never met one has not been
       tested. Every hard thing about a boundary happens twice as often once
       the region has an inside edge: passes break in the MIDDLE instead of at
       the ends, the two halves of a broken pass stop being neighbours, and any
       join that reaches across the gap draws a line straight through the one
       place on the sheet that is supposed to stay paper. A fill is not proved
       by the shape it fills, it is proved by the shape it refuses to.

       IT HAS TO FIT, and roughly right is not fitting: an inner edge that
       breaks the outer one has quietly made a different shape and not said so.
       So it is placed, checked the whole way round against the outer radius
       with a margin wide enough for the fill to live in, and shrunk until it
       clears. */
    const hrad0 = ring(1);
    const ha = ph(), off = 0.20 + rnd() * 0.20;
    const fits = (x, y, k) => {
      for (let t = 0; t < Math.PI * 2; t += 0.05) {
        const px = x + hrad0(t) * k * Math.cos(t), py = y + hrad0(t) * k * Math.sin(t);
        if (Math.hypot(px - cx, py - cy) > rad(Math.atan2(py - cy, px - cx)) - 2.6) return false;
      }
      return true;
    };
    /* SHRINKING ALONE IS NOT A PLACEMENT. Shrink-until-it-fits terminates every
       time and sometimes terminates at a hole a third of a millimetre across,
       which is not a hole — it is a dot the fill steps over without ever being
       asked a question. So the offset walks back toward the centre and the
       best of the attempts wins: a hole has to be big enough to break a pass
       in half or it is not testing anything. */
    let hx = cx, hy = cy, hb = 0;
    for (let a = 0; a < 7; a++) {
      const d = base * off * (1 - a / 8);
      const x = cx + Math.cos(ha) * d, y = cy + Math.sin(ha) * d;
      let k = base * 0.34;
      for (let i = 0; i < 18 && !fits(x, y, k); i++) k *= 0.9;
      if (!fits(x, y, k)) continue;
      if (k > hb) { hb = k; hx = x; hy = y; }
      if (hb > base * 0.24) break;
    }
    const hrad = t => hrad0(t) * hb;
    const inHole = (x, y) => Math.hypot(x - hx, y - hy) < hrad(Math.atan2(y - hy, x - hx));

    const poly = (ox, oy, f, b, step) => {
      const p = [], d = step / b;
      for (let th = 0; th <= Math.PI * 2 + d; th += d) p.push([ox + f(th) * Math.cos(th), oy + f(th) * Math.sin(th)]);
      return p;
    };
    return {
      cx, cy, rad,
      /* the same signature as the ball's tone, so it drops into the same carve */
      tone: (x, y) => (Math.hypot(x - cx, y - cy) < rad(Math.atan2(y - cy, x - cx)) && !inHole(x, y) ? 1 : -1),
      /* BOTH EDGES, outer first. An inner edge is an edge — anything that
         draws the boundary draws two of them or it is drawing a lie. */
      rings: step => [poly(cx, cy, rad, base, step), poly(hx, hy, hrad, hb, step)],
    };
  }


  /* ══════════════════════════════════════════════════════════════════════
     THE TEAPOT — the first subject here that is actually three-dimensional

     `scene()`'s ball is a DRAWING of a lit sphere: an analytic function of
     paper position with a fake normal, hand-tuned until it reads. That is the
     right way to make one specimen and the wrong way to make a test, because
     a function of (x, y) cannot produce the cases that break a fill. It has no
     inside. Nothing occludes anything. The cast shadow is an ellipse someone
     chose.

     THIS ONE IS RENDERED, and it is here for the four cases nothing else on
     the page reaches:

       · SELF-OCCLUSION.  The spout crosses the body and the handle crosses
         itself, so the fill meets a hard tone discontinuity that is NOT the
         outer silhouette. That is where runs fragment and chaining starts
         proposing connectors across a gap that is not empty paper.
       · A HOLE THAT IS NOT THE OUTLINE.  Between the handle and the body.
       · SADDLE CURVATURE.  The neck. A direction field derived from tone
         behaves differently on a saddle than on a dome, and until now nothing
         asked it to.
       · A REAL CAST SHADOW, projected rather than drawn, which falls back
         across the object's own foot.

     AND IT IS STILL JUST `tone(x, y)`. The renderer runs once into a depth,
     normal and light buffer; the tone function is a buffer lookup returning
     -1 outside the silhouette. Every generator in this file fills it without
     knowing any of the above happened — which is the contract doing exactly
     what it is for, and the reason this could be added without touching one
     line of any fill.

     THE DATA IS MARTIN NEWELL'S, 1975, via three.js's TeapotGeometry: 32
     bicubic Bézier patches over 290 control points. Transcribed rather than
     retyped — a single wrong digit in 870 numbers is a spike you would have to
     find by eye. Public domain, and the reference object every renderer has
     been checked against for fifty years, which is most of the argument for
     using it here rather than modelling something. */
  const TEA_V = [
    1.4,0,2.4,1.4,-0.784,2.4,0.784,-1.4,2.4,0,-1.4,2.4,1.3375,0,2.53125,1.3375,-0.749,2.53125,
    0.749,-1.3375,2.53125,0,-1.3375,2.53125,1.4375,0,2.53125,1.4375,-0.805,2.53125,0.805,-1.4375,
    2.53125,0,-1.4375,2.53125,1.5,0,2.4,1.5,-0.84,2.4,0.84,-1.5,2.4,0,-1.5,2.4,-0.784,-1.4,2.4,
    -1.4,-0.784,2.4,-1.4,0,2.4,-0.749,-1.3375,2.53125,-1.3375,-0.749,2.53125,-1.3375,0,2.53125,
    -0.805,-1.4375,2.53125,-1.4375,-0.805,2.53125,-1.4375,0,2.53125,-0.84,-1.5,2.4,-1.5,-0.84,
    2.4,-1.5,0,2.4,-1.4,0.784,2.4,-0.784,1.4,2.4,0,1.4,2.4,-1.3375,0.749,2.53125,-0.749,1.3375,
    2.53125,0,1.3375,2.53125,-1.4375,0.805,2.53125,-0.805,1.4375,2.53125,0,1.4375,2.53125,-1.5,
    0.84,2.4,-0.84,1.5,2.4,0,1.5,2.4,0.784,1.4,2.4,1.4,0.784,2.4,0.749,1.3375,2.53125,1.3375,
    0.749,2.53125,0.805,1.4375,2.53125,1.4375,0.805,2.53125,0.84,1.5,2.4,1.5,0.84,2.4,1.75,0,
    1.875,1.75,-0.98,1.875,0.98,-1.75,1.875,0,-1.75,1.875,2,0,1.35,2,-1.12,1.35,1.12,-2,1.35,0,
    -2,1.35,2,0,0.9,2,-1.12,0.9,1.12,-2,0.9,0,-2,0.9,-0.98,-1.75,1.875,-1.75,-0.98,1.875,-1.75,0,
    1.875,-1.12,-2,1.35,-2,-1.12,1.35,-2,0,1.35,-1.12,-2,0.9,-2,-1.12,0.9,-2,0,0.9,-1.75,0.98,
    1.875,-0.98,1.75,1.875,0,1.75,1.875,-2,1.12,1.35,-1.12,2,1.35,0,2,1.35,-2,1.12,0.9,-1.12,2,
    0.9,0,2,0.9,0.98,1.75,1.875,1.75,0.98,1.875,1.12,2,1.35,2,1.12,1.35,1.12,2,0.9,2,1.12,0.9,2,
    0,0.45,2,-1.12,0.45,1.12,-2,0.45,0,-2,0.45,1.5,0,0.225,1.5,-0.84,0.225,0.84,-1.5,0.225,0,
    -1.5,0.225,1.5,0,0.15,1.5,-0.84,0.15,0.84,-1.5,0.15,0,-1.5,0.15,-1.12,-2,0.45,-2,-1.12,0.45,
    -2,0,0.45,-0.84,-1.5,0.225,-1.5,-0.84,0.225,-1.5,0,0.225,-0.84,-1.5,0.15,-1.5,-0.84,0.15,
    -1.5,0,0.15,-2,1.12,0.45,-1.12,2,0.45,0,2,0.45,-1.5,0.84,0.225,-0.84,1.5,0.225,0,1.5,0.225,
    -1.5,0.84,0.15,-0.84,1.5,0.15,0,1.5,0.15,1.12,2,0.45,2,1.12,0.45,0.84,1.5,0.225,1.5,0.84,
    0.225,0.84,1.5,0.15,1.5,0.84,0.15,-1.6,0,2.025,-1.6,-0.3,2.025,-1.5,-0.3,2.25,-1.5,0,2.25,
    -2.3,0,2.025,-2.3,-0.3,2.025,-2.5,-0.3,2.25,-2.5,0,2.25,-2.7,0,2.025,-2.7,-0.3,2.025,-3,-0.3,
    2.25,-3,0,2.25,-2.7,0,1.8,-2.7,-0.3,1.8,-3,-0.3,1.8,-3,0,1.8,-1.5,0.3,2.25,-1.6,0.3,2.025,
    -2.5,0.3,2.25,-2.3,0.3,2.025,-3,0.3,2.25,-2.7,0.3,2.025,-3,0.3,1.8,-2.7,0.3,1.8,-2.7,0,1.575,
    -2.7,-0.3,1.575,-3,-0.3,1.35,-3,0,1.35,-2.5,0,1.125,-2.5,-0.3,1.125,-2.65,-0.3,0.9375,-2.65,
    0,0.9375,-2,-0.3,0.9,-1.9,-0.3,0.6,-1.9,0,0.6,-3,0.3,1.35,-2.7,0.3,1.575,-2.65,0.3,0.9375,
    -2.5,0.3,1.125,-1.9,0.3,0.6,-2,0.3,0.9,1.7,0,1.425,1.7,-0.66,1.425,1.7,-0.66,0.6,1.7,0,0.6,
    2.6,0,1.425,2.6,-0.66,1.425,3.1,-0.66,0.825,3.1,0,0.825,2.3,0,2.1,2.3,-0.25,2.1,2.4,-0.25,
    2.025,2.4,0,2.025,2.7,0,2.4,2.7,-0.25,2.4,3.3,-0.25,2.4,3.3,0,2.4,1.7,0.66,0.6,1.7,0.66,
    1.425,3.1,0.66,0.825,2.6,0.66,1.425,2.4,0.25,2.025,2.3,0.25,2.1,3.3,0.25,2.4,2.7,0.25,2.4,
    2.8,0,2.475,2.8,-0.25,2.475,3.525,-0.25,2.49375,3.525,0,2.49375,2.9,0,2.475,2.9,-0.15,2.475,
    3.45,-0.15,2.5125,3.45,0,2.5125,2.8,0,2.4,2.8,-0.15,2.4,3.2,-0.15,2.4,3.2,0,2.4,3.525,0.25,
    2.49375,2.8,0.25,2.475,3.45,0.15,2.5125,2.9,0.15,2.475,3.2,0.15,2.4,2.8,0.15,2.4,0,0,3.15,
    0.8,0,3.15,0.8,-0.45,3.15,0.45,-0.8,3.15,0,-0.8,3.15,0,0,2.85,0.2,0,2.7,0.2,-0.112,2.7,0.112,
    -0.2,2.7,0,-0.2,2.7,-0.45,-0.8,3.15,-0.8,-0.45,3.15,-0.8,0,3.15,-0.112,-0.2,2.7,-0.2,-0.112,
    2.7,-0.2,0,2.7,-0.8,0.45,3.15,-0.45,0.8,3.15,0,0.8,3.15,-0.2,0.112,2.7,-0.112,0.2,2.7,0,0.2,
    2.7,0.45,0.8,3.15,0.8,0.45,3.15,0.112,0.2,2.7,0.2,0.112,2.7,0.4,0,2.55,0.4,-0.224,2.55,0.224,
    -0.4,2.55,0,-0.4,2.55,1.3,0,2.55,1.3,-0.728,2.55,0.728,-1.3,2.55,0,-1.3,2.55,1.3,0,2.4,1.3,
    -0.728,2.4,0.728,-1.3,2.4,0,-1.3,2.4,-0.224,-0.4,2.55,-0.4,-0.224,2.55,-0.4,0,2.55,-0.728,
    -1.3,2.55,-1.3,-0.728,2.55,-1.3,0,2.55,-0.728,-1.3,2.4,-1.3,-0.728,2.4,-1.3,0,2.4,-0.4,0.224,
    2.55,-0.224,0.4,2.55,0,0.4,2.55,-1.3,0.728,2.55,-0.728,1.3,2.55,0,1.3,2.55,-1.3,0.728,2.4,
    -0.728,1.3,2.4,0,1.3,2.4,0.224,0.4,2.55,0.4,0.224,2.55,0.728,1.3,2.55,1.3,0.728,2.55,0.728,
    1.3,2.4,1.3,0.728,2.4,0,0,0,1.425,0,0,1.425,0.798,0,0.798,1.425,0,0,1.425,0,1.5,0,0.075,1.5,
    0.84,0.075,0.84,1.5,0.075,0,1.5,0.075,-0.798,1.425,0,-1.425,0.798,0,-1.425,0,0,-0.84,1.5,
    0.075,-1.5,0.84,0.075,-1.5,0,0.075,-1.425,-0.798,0,-0.798,-1.425,0,0,-1.425,0,-1.5,-0.84,
    0.075,-0.84,-1.5,0.075,0,-1.5,0.075,0.798,-1.425,0,1.425,-0.798,0,0.84,-1.5,0.075,1.5,-0.84,
    0.075
  ];
  const TEA_P = [
    0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,3,16,17,18,7,19,20,21,11,22,23,24,15,25,26,27,18,28,29,
    30,21,31,32,33,24,34,35,36,27,37,38,39,30,40,41,0,33,42,43,4,36,44,45,8,39,46,47,12,12,13,14,
    15,48,49,50,51,52,53,54,55,56,57,58,59,15,25,26,27,51,60,61,62,55,63,64,65,59,66,67,68,27,37,
    38,39,62,69,70,71,65,72,73,74,68,75,76,77,39,46,47,12,71,78,79,48,74,80,81,52,77,82,83,56,56,
    57,58,59,84,85,86,87,88,89,90,91,92,93,94,95,59,66,67,68,87,96,97,98,91,99,100,101,95,102,
    103,104,68,75,76,77,98,105,106,107,101,108,109,110,104,111,112,113,77,82,83,56,107,114,115,
    84,110,116,117,88,113,118,119,92,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,
    135,123,136,137,120,127,138,139,124,131,140,141,128,135,142,143,132,132,133,134,135,144,145,
    146,147,148,149,150,151,68,152,153,154,135,142,143,132,147,155,156,144,151,157,158,148,154,
    159,160,68,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,164,177,178,161,
    168,179,180,165,172,181,182,169,176,183,184,173,173,174,175,176,185,186,187,188,189,190,191,
    192,193,194,195,196,176,183,184,173,188,197,198,185,192,199,200,189,196,201,202,193,203,203,
    203,203,204,205,206,207,208,208,208,208,209,210,211,212,203,203,203,203,207,213,214,215,208,
    208,208,208,212,216,217,218,203,203,203,203,215,219,220,221,208,208,208,208,218,222,223,224,
    203,203,203,203,221,225,226,204,208,208,208,208,224,227,228,209,209,210,211,212,229,230,231,
    232,233,234,235,236,237,238,239,240,212,216,217,218,232,241,242,243,236,244,245,246,240,247,
    248,249,218,222,223,224,243,250,251,252,246,253,254,255,249,256,257,258,224,227,228,209,252,
    259,260,229,255,261,262,233,258,263,264,237,265,265,265,265,266,267,268,269,270,271,272,273,
    92,119,118,113,265,265,265,265,269,274,275,276,273,277,278,279,113,112,111,104,265,265,265,
    265,276,280,281,282,279,283,284,285,104,103,102,95,265,265,265,265,282,286,287,266,285,288,
    289,270,95,94,93,92
  ];

  /* One cache. Nine fills ask for the same subject at the same size, and
     rendering it nine times is nine times the work for one answer. */
  const solidCache = new Map();

  /* ── `solid` IS THE RENDERER AND IT DOES NOT KNOW WHAT A TEAPOT IS ──────
     It was written as `teapot()` and that was one subject's worth of thinking.
     What it actually does is take a triangle mesh with normals and hand back
     `tone`, `shadow` and `edge` — so the mesh belongs to the caller, and the
     LIGHTING BELONGS HERE, once. That is the whole KIT argument one floor
     down: light the ball in one place and the teapot in another and the two
     stop being comparable, which on a page whose only job is comparing fills
     is not a cosmetic problem. Switch subject and exactly one thing may change,
     and it has to be the shape. */
  function solid(w, h, meshOf, opt = {}) {
    /* THE KEY IS EVERY INPUT, and it has to be. Leave one out and the cache
       answers a question it was not asked: four lamp positions came back as
       four copies of the first render, with four identical tone ranges printed
       underneath, which is the sort of wrong that looks like a finding. */
    const key = [opt.mesh || 'teapot', w.toFixed(2), h.toFixed(2), opt.seg || 7, opt.res || 3.4,
                 opt.az == null ? 34 : opt.az, opt.el == null ? 16 : opt.el,
                 (opt.light || [0.10, -0.80, 0.59]).join(','),
                 opt.ambient == null ? 0.13 : opt.ambient,
                 opt.gamma == null ? 0.80 : opt.gamma,
                 opt.margin == null ? 2.0 : opt.margin].join('|');
    const hit = solidCache.get(key);
    if (hit) return hit;

    const SEG = opt.seg || 7;                     /* per patch, per direction */
    const RES = opt.res || 3.4;                   /* buffer samples per mm */
    const az = (opt.az == null ? 34 : opt.az) * Math.PI / 180;
    /* SIXTEEN DEGREES, NOT TWENTY-SIX, and it is the difference between a
       teapot and a blob. Look down at it far enough and the spout foreshortens
       into the body, the handle merges with the rim, and the silhouette — the
       thing every fill on this page has to fill — is a rounded lump with a nub
       on it. Low enough to see the profile is the whole reason to use this
       object rather than a sphere. */
    const el = (opt.el == null ? 16 : opt.el) * Math.PI / 180;

    /* ── the mesh ───────────────────────────────────────────────────────
       A bicubic Bézier patch and its two partial derivatives. THE LID AND
       THE BASE HAVE DEGENERATE PATCHES — four identical control points at a
       cusp — so one derivative vanishes there and the cross product is the
       zero vector. Nudging the parameter off the cusp is the whole fix; take
       the normal at face value and the teapot gets a black pinhole at the top
       of the lid, which reads as a hole in the drawing. */
    const B = (t) => {
      const s = 1 - t;
      return [s * s * s, 3 * s * s * t, 3 * s * t * t, t * t * t];
    };
    const dB = (t) => {
      const s = 1 - t;
      return [-3 * s * s, 3 * s * s - 6 * s * t, 6 * s * t - 3 * t * t, 3 * t * t];
    };
    const tri = meshOf(SEG);

    /* ── the view ───────────────────────────────────────────────────────
       ORTHOGRAPHIC, and not for simplicity. A plotter draws what is on the
       sheet at the size it is on the sheet; a perspective divide means the
       same object plots at two sizes depending where it sits, which is the
       one thing 1:1 cannot survive. It also makes the cast shadow an exact
       affine projection rather than something to approximate.

       The Newell data is Z-UP. The sheet is x right, y DOWN. */
    const ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(el), se = Math.sin(el);
    const F = [ca * ce, sa * ce, se];              /* toward the camera */
    const R = [-sa, ca, 0];                        /* screen right */
    const U = [-ca * se, -sa * se, ce];            /* screen up */
    /* RAKING, NOT OVERHEAD, and it was measured against three others rather than
       reasoned. Near the vertical the lid lights up, every side of the body falls
       to the same middling dark, and there is no terminator anywhere — which is
       the one feature a fill is here to render. This one puts the turn straight
       across the belly, catches the spout, and drops the handle into the dark:
       full range on the one surface every tile has to cross. */
    const L = norm(opt.light || [0.10, -0.80, 0.59]);   /* toward the lamp */

    const proj = (p) => [p[0] * R[0] + p[1] * R[1] + p[2] * R[2],
                         p[0] * U[0] + p[1] * U[1] + p[2] * U[2],
                         p[0] * F[0] + p[1] * F[1] + p[2] * F[2]];

    /* Fit: the object AND the ground it throws a shadow on, so the shadow
       cannot fall off the sheet. */
    const gnd = (p) => {                            /* p flattened onto z = 0 along L */
      const k = p[2] / L[2];
      return [p[0] - L[0] * k, p[1] - L[1] * k, 0];
    };
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const t of tri) for (const v of t) {
      for (const q of [v.p, gnd(v.p)]) {
        const s = proj(q);
        if (s[0] < x0) x0 = s[0]; if (s[0] > x1) x1 = s[0];
        if (-s[1] < y0) y0 = -s[1]; if (-s[1] > y1) y1 = -s[1];
      }
    }
    const m = opt.margin == null ? 2.0 : opt.margin;
    const sc = Math.min((w - 2 * m) / (x1 - x0), (h - 2 * m) / (y1 - y0));
    const ox = (w - (x1 - x0) * sc) / 2 - x0 * sc;
    const oy = (h - (y1 - y0) * sc) / 2 - y0 * sc;
    const toPaper = (p) => { const s = proj(p); return [s[0] * sc + ox, -s[1] * sc + oy, s[2]]; };

    /* ── the buffers ────────────────────────────────────────────────────
       One rasteriser, run twice: once from the camera for depth and normal,
       once from the LIGHT for the shadow. Two buffers out of one pass each,
       and the light one answers both questions that matter — whether a
       surface can see the lamp, and whether a patch of ground can. */
    const BW = Math.max(8, Math.round(w * RES)), BH = Math.max(8, Math.round(h * RES));
    const dep = new Float32Array(BW * BH).fill(-Infinity);
    const nrm = new Float32Array(BW * BH * 3);
    const msk = new Uint8Array(BW * BH);

    const LR = 2.6;                                 /* light buffer, per mm */
    const LU = [-L[1], L[0], 0], lm = Math.hypot(LU[0], LU[1]) || 1;
    LU[0] /= lm; LU[1] /= lm;
    const LV = cross(L, LU);
    const lproj = (p) => [p[0] * LU[0] + p[1] * LU[1] + p[2] * LU[2],
                          p[0] * LV[0] + p[1] * LV[1] + p[2] * LV[2],
                          p[0] * L[0]  + p[1] * L[1]  + p[2] * L[2]];
    let lx0 = 1e9, lx1 = -1e9, ly0 = 1e9, ly1 = -1e9;
    for (const t of tri) for (const v of t) {
      const s = lproj(v.p);
      if (s[0] < lx0) lx0 = s[0]; if (s[0] > lx1) lx1 = s[0];
      if (s[1] < ly0) ly0 = s[1]; if (s[1] > ly1) ly1 = s[1];
    }
    const LW = Math.max(8, Math.round((lx1 - lx0) * sc * LR)), LH = Math.max(8, Math.round((ly1 - ly0) * sc * LR));
    const ldep = new Float32Array(LW * LH).fill(-Infinity);
    const toLight = (p) => { const s = lproj(p);
      return [(s[0] - lx0) / (lx1 - lx0) * (LW - 1), (s[1] - ly0) / (ly1 - ly0) * (LH - 1), s[2]]; };

    /* Scanline fill of one triangle, nearest wins. `store` is what a hit
       writes — the two passes differ in that and in nothing else. */
    function raster(a, b, c, W, H, keep, store) {
      const minx = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
      const maxx = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
      const miny = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
      const maxy = Math.min(H - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
      const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      if (Math.abs(d) < 1e-12) return;
      for (let py = miny; py <= maxy; py++) for (let px = minx; px <= maxx; px++) {
        const l1 = ((b[1] - c[1]) * (px + 0.5 - c[0]) + (c[0] - b[0]) * (py + 0.5 - c[1])) / d;
        const l2 = ((c[1] - a[1]) * (px + 0.5 - c[0]) + (a[0] - c[0]) * (py + 0.5 - c[1])) / d;
        const l3 = 1 - l1 - l2;
        if (l1 < 0 || l2 < 0 || l3 < 0) continue;
        const z = l1 * a[2] + l2 * b[2] + l3 * c[2];
        const i = py * W + px;
        if (z > keep[i]) { keep[i] = z; store(i, l1, l2, l3); }
      }
    }

    for (const t of tri) {
      const A = toPaper(t[0].p), Bp = toPaper(t[1].p), C = toPaper(t[2].p);
      raster([A[0] * RES, A[1] * RES, A[2]], [Bp[0] * RES, Bp[1] * RES, Bp[2]], [C[0] * RES, C[1] * RES, C[2]],
        BW, BH, dep, (i, l1, l2, l3) => {
          msk[i] = 1;
          for (let k = 0; k < 3; k++) nrm[i * 3 + k] = l1 * t[0].n[k] + l2 * t[1].n[k] + l3 * t[2].n[k];
        });
      const la = toLight(t[0].p), lb = toLight(t[1].p), lc = toLight(t[2].p);
      raster(la, lb, lc, LW, LH, ldep, () => {});
    }

    /* A SURFACE IS ITS OWN NEAREST OCCLUDER, so without slack everything
       shadows itself — the classic acne. Generous, because the light buffer
       is coarser than the object. */
    /* THE BIAS SCALES WITH THE SLOPE. Near the terminator a surface runs almost
       edge-on to the lamp, so one light-buffer texel spans a long way along it
       and the depth inside that texel varies by more than any flat constant
       covers; the surface then reads as nearer the lamp than its own recorded
       depth and shadows itself in a band. Dividing by n·L is the standard
       answer and the right shape — nothing where the surface faces the lamp
       squarely, as much as it takes where it does not. Capped, or a grazing
       face asks for infinity.

       IT IS NOT WHAT FIXED THE SPHERE'S DIAGONAL, and the note is here so the
       next reader does not inherit the wrong story. That line is the
       TERMINATOR: the lamp sits 101° off the camera, so the terminator great
       circle is seen nearly edge-on and projects to something very close to a
       straight line. It is correct, it is meant to be there, and it is the
       best thing on the specimen — a hard tonal turn for a hatch to cross. */
    const BIAS = 0.06 * Math.max(1, 3 / LR);
    const litAt = (p, lam) => {
      const q = toLight(p);
      const px = Math.round(q[0]), py = Math.round(q[1]);
      if (px < 0 || py < 0 || px >= LW || py >= LH) return 1;
      const d = ldep[py * LW + px];
      const b = BIAS * Math.min(6, 1 / Math.max(0.16, lam == null ? 1 : lam));
      return d === -Infinity || q[2] >= d - b ? 1 : 0;
    };

    /* ── the tone ───────────────────────────────────────────────────────
       Lambert off the REAL normal, and then the two things `scene()` had to
       fake: the shadow is looked up rather than drawn, and the bounce comes
       off the ground plane the object is actually standing on. */
    const amb = opt.ambient == null ? 0.13 : opt.ambient;
    const gam = opt.gamma == null ? 0.80 : opt.gamma;
    const shade = new Float32Array(BW * BH);
    for (let py = 0; py < BH; py++) for (let px = 0; px < BW; px++) {
      const i = py * BW + px;
      if (!msk[i]) continue;
      const n = [nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]];
      const nl = Math.hypot(n[0], n[1], n[2]) || 1;
      n[0] /= nl; n[1] /= nl; n[2] /= nl;
      const lam = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
      /* the world point, recovered from the depth we stored */
      const sx = ((px + 0.5) / RES - ox) / sc, sy = -((py + 0.5) / RES - oy) / sc, sz = dep[i];
      const P = [sx * R[0] + sy * U[0] + sz * F[0], sx * R[1] + sy * U[1] + sz * F[1], sx * R[2] + sy * U[2] + sz * F[2]];
      const vis = litAt(P, lam);
      let lit = amb + (1 - amb) * lam * vis;
      /* THE BOUNCE IS SMOOTH, because `max(0, -n.z)` is continuous in VALUE and
         kinked in its DERIVATIVE at the equator, and a C1 break can read as a
         crease even where nothing jumps. A squared half-angle falls off the
         same way with no corner in it. Housekeeping rather than a fix: it was
         changed while hunting the sphere's diagonal, which turned out to be the
         terminator and nothing to do with either. */
      const down = clamp01(0.5 - 0.5 * n[2]);
      lit += down * down * 0.26 * (1 - lam);          /* the table, bouncing */
      shade[i] = clamp01(1 - Math.pow(clamp01(lit), gam)) * 0.97;
    }

    const at2 = (x, y) => {
      const px = Math.floor(x * RES), py = Math.floor(y * RES);
      if (px < 0 || py < 0 || px >= BW || py >= BH) return -1;
      return msk[py * BW + px] ? py * BW + px : -1;
    };
    const tone = (x, y) => { const i = at2(x, y); return i < 0 ? -1 : shade[i]; };

    /* ── the cast shadow ────────────────────────────────────────────────
       A SEPARATE TONE FUNCTION, exactly as `scene()` keeps ball and shadow
       apart: they are different surfaces and the strokes that fill them are
       not the same strokes. Ground first — a paper point is a ray, and where
       that ray meets z = 0 is the patch of table under it. */
    /* WHERE THE POT MEETS THE TABLE, measured off the mask rather than assumed:
       the lowest covered row, and the span of it. Everything about the contact
       shadow is derived from those two numbers. */
    let cxp = w / 2, cyp = h / 2, R0 = Math.min(w, h) / 4;
    {
      let lo = 1e9, hi = -1e9, bot = -1;
      for (let py = BH - 1; py >= 0 && bot < 0; py--)
        for (let px = 0; px < BW; px++) if (msk[py * BW + px]) { bot = py; break; }
      if (bot >= 0) {
        for (let px = 0; px < BW; px++) if (msk[bot * BW + px]) { if (px < lo) lo = px; if (px > hi) hi = px; }
        let l2 = 1e9, h2 = -1e9;
        for (let py = 0; py < BH; py++) for (let px = 0; px < BW; px++)
          if (msk[py * BW + px]) { if (px < l2) l2 = px; if (px > h2) h2 = px; }
        cxp = (l2 + h2) / 2 / RES; cyp = bot / RES; R0 = (h2 - l2) / 2 / RES;
      }
    }

    const ground = (x, y) => {
      const sx = (x - ox) / sc, sy = -(y - oy) / sc;
      const den = F[2];
      if (Math.abs(den) < 1e-9) return null;
      const t = -(sx * R[2] + sy * U[2]) / den;
      return [sx * R[0] + sy * U[0] + t * F[0], sx * R[1] + sy * U[1] + t * F[1], 0];
    };
    const shadow = (x, y) => {
      if (at2(x, y) >= 0) return -1;               /* the pot is in front of it */
      const g = ground(x, y);
      if (!g) return -1;
      if (litAt(g)) return -1;
      /* A DIRECTIONAL SHADOW DOES NOT GET LIGHTER BECAUSE THE CASTER IS TALL.
         Grading it by how far the blocker sits above the table read as a pale
         disc inside a dark one — the body's shadow lighter than the foot's,
         which is a ring nobody would draw. It is one tone, darkened where the
         pot actually touches: that contact is the only thing in the picture
         saying the two are in the same place. */
      const foot = Math.hypot((x - cxp) / (R0 * 1.25), (y - cyp) / (R0 * 0.42));
      return clamp01(0.62 + 0.34 * Math.max(0, 1 - foot));
    };

    /* ── the silhouette ─────────────────────────────────────────────────
       Marching squares over the mask, midpoints rather than interpolation —
       the mask is binary, so there is nothing to interpolate. It costs a
       half-sample of stair on a hairline annotation and it gets the HANDLE
       HOLE for free, which is the boundary worth having. */
    const segs = [];
    const M = (px, py) => (px < 0 || py < 0 || px >= BW || py >= BH) ? 0 : msk[py * BW + px];
    for (let py = -1; py < BH; py++) for (let px = -1; px < BW; px++) {
      const a = M(px, py), b = M(px + 1, py), c = M(px + 1, py + 1), d2 = M(px, py + 1);
      const k = a | (b << 1) | (c << 2) | (d2 << 3);
      if (k === 0 || k === 15) continue;
      const X = (px + 1), Y = (py + 1);
      const T = [X, Y - 0.5], Rt = [X + 0.5, Y], Bm = [X, Y + 0.5], Lf = [X - 0.5, Y];
      const P2 = q => [q[0] / RES, q[1] / RES];
      const push = (p, q) => segs.push([P2(p), P2(q)]);
      switch (k) {
        case 1: case 14: push(Lf, T); break;
        case 2: case 13: push(T, Rt); break;
        case 4: case 11: push(Rt, Bm); break;
        case 8: case 7:  push(Bm, Lf); break;
        case 3: case 12: push(Lf, Rt); break;
        case 6: case 9:  push(T, Bm); break;
        case 5:  push(Lf, T); push(Rt, Bm); break;
        case 10: push(T, Rt); push(Bm, Lf); break;
      }
    }
    const edge = segs.map(s => `M${(Math.round(s[0][0] * 100) / 100)} ${(Math.round(s[0][1] * 100) / 100)}` +
                               `L${(Math.round(s[1][0] * 100) / 100)} ${(Math.round(s[1][1] * 100) / 100)}`).join('');

    /* ── THE SILHOUETTE AS POLYLINES ────────────────────────────────────
       `edge` is path data, which is all an annotation needs. A HAND needs
       points: it inks a contour as a run of separate marks with gaps in it,
       the same way `blob` hands back `rings`, and it cannot do that to a
       string. Same segments, linked head to tail — a marching-squares cell
       emits its ends on a shared lattice, so two segments meet when their
       endpoints round to the same lattice point and no tolerance is needed. */
    function rings(step) {
      const q = 1 / (RES * 2);
      const key = pt => Math.round(pt[0] / q) + ',' + Math.round(pt[1] / q);
      const ends = new Map();
      segs.forEach((sg, i) => [0, 1].forEach(e => {
        const k = key(sg[e]);
        let a = ends.get(k); if (!a) { a = []; ends.set(k, a); } a.push([i, e]);
      }));
      const used = new Uint8Array(segs.length), out = [];
      for (let i = 0; i < segs.length; i++) {
        if (used[i]) continue;
        used[i] = 1;
        const line = [segs[i][0].slice(), segs[i][1].slice()];
        for (;;) {
          const a = ends.get(key(line[line.length - 1]));
          let nxt = -1, end = 0;
          if (a) for (const [j, e] of a) if (!used[j]) { nxt = j; end = e; break; }
          if (nxt < 0) break;
          used[nxt] = 1;
          line.push(segs[nxt][1 - end].slice());
        }
        if (line.length > 2) out.push(step ? thin(line, Math.max(1, Math.round(step * RES))) : line);
      }
      return out;
    }

    const out = { tone, shadow, edge, rings, ground, mask: msk, BW, BH, RES, scale: sc,
                  cx: cxp, cy: cyp, R: R0 };
    solidCache.set(key, out);
    if (solidCache.size > 24) solidCache.delete(solidCache.keys().next().value);
    return out;
  }

  /* ── THE MESHES ─────────────────────────────────────────────────────────
     A mesh is a flat list of triangles, each a triple of `{p, n}`. Nothing
     below knows about paper, light or pitch; nothing in `solid` knows what it
     is looking at. */

  /* A bicubic Bézier patch and its two partial derivatives. THE LID AND THE
     BASE HAVE DEGENERATE PATCHES — four identical control points at a cusp —
     so one derivative vanishes there and the cross product is the zero vector.
     Nudging the parameter off the cusp is the whole fix; take the normal at
     face value and the teapot gets a black pinhole at the top of the lid,
     which reads as a hole in the drawing. */
  const BZ = (t) => { const s = 1 - t; return [s * s * s, 3 * s * s * t, 3 * s * t * t, t * t * t]; };
  const dBZ = (t) => { const s = 1 - t; return [-3 * s * s, 3 * s * s - 6 * s * t, 6 * s * t - 3 * t * t, 3 * t * t]; };

  function teapotMesh(SEG) {
    const at = (patch, u, v) => {
      const bu = BZ(u), bv = BZ(v), du = dBZ(u), dv = dBZ(v);
      const p = [0, 0, 0], pu = [0, 0, 0], pv = [0, 0, 0];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        /* `c * 4 + r`, TRANSPOSED, and it is not a tidy-up. Read the patch
           table row-major and the surface is identical — a Bézier patch is
           symmetric under transposing its control net and swapping u for v —
           but du × dv comes out the other way and EVERY NORMAL POINTS INTO
           THE POT. Nothing looks broken: it renders, it shades, and it is lit
           from the wrong side by exactly 180°. Measured rather than reasoned:
           on the body patches, outward is 42 of 48 this way and 6 of 48 the
           other. The six are the lid's underside, which faces in and should. */
        const idx = TEA_P[patch * 16 + c * 4 + r] * 3;
        const wp = bu[r] * bv[c], wu = du[r] * bv[c], wv = bu[r] * dv[c];
        for (let k = 0; k < 3; k++) {
          p[k]  += TEA_V[idx + k] * wp;
          pu[k] += TEA_V[idx + k] * wu;
          pv[k] += TEA_V[idx + k] * wv;
        }
      }
      const n = [pu[1] * pv[2] - pu[2] * pv[1], pu[2] * pv[0] - pu[0] * pv[2], pu[0] * pv[1] - pu[1] * pv[0]];
      const m = Math.hypot(n[0], n[1], n[2]);
      if (m < 1e-9) {                              /* a cusp: step off it */
        return { p, n: at(patch, Math.min(0.999, u + 0.004), Math.min(0.999, v + 0.004)).n };
      }
      return { p, n: [n[0] / m, n[1] / m, n[2] / m] };
    };
    const tri = [];
    for (let s = 0; s < 32; s++) {
      const g = [];
      for (let i = 0; i <= SEG; i++) { g.push([]); for (let j = 0; j <= SEG; j++) g[i].push(at(s, i / SEG, j / SEG)); }
      for (let i = 0; i < SEG; i++) for (let j = 0; j < SEG; j++) {
        tri.push([g[i][j], g[i + 1][j], g[i + 1][j + 1]]);
        tri.push([g[i][j], g[i + 1][j + 1], g[i][j + 1]]);
      }
    }
    return tri;
  }

  /* THE BALL, AND IT SITS ON THE TABLE. Radius 2 centred at z = 2, so it
     touches z = 0 exactly where the teapot's foot does and both get the same
     contact, the same bounce and the same projected shadow. A sphere floating
     above the ground would light identically and read completely differently,
     which is the sort of difference that ends up being blamed on the fill. */
  function sphereMesh(SEG) {
    const N = Math.max(8, SEG * 4), R = 2, C = [0, 0, 2];
    const P = (i, j) => {
      const th = i / N * Math.PI, ph = j / (N * 2) * Math.PI * 2;
      const n = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
      return { p: [C[0] + R * n[0], C[1] + R * n[1], C[2] + R * n[2]], n };
    };
    const tri = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N * 2; j++) {
      const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
      if (i > 0) tri.push([a, b, c]);
      if (i < N - 1) tri.push([a, c, d]);
    }
    return tri;
  }

  const teapot = (w, h, opt) => solid(w, h, teapotMesh, opt);
  const ball3d = (w, h, opt) => solid(w, h, sphereMesh, Object.assign({ mesh: 'ball' }, opt));

  return { rng, noise, clamp01, norm, cross, plen, scene, blob, teapot, ball3d, solid,
           latitudes, parallels, carve, toPath, thin, AXIS };
})();

  /* ── THE MACHINE SIDE ─────────────────────────────────────────────────── */
  /* SCANLINES, CLIPPED TO THE SHEET — and the clipping is the point.

     The obvious build is an over-sized axis-aligned grid rotated as a group,
     which is right for three of these types and silently wrong for the fourth:
     a serpentine's whole identity is the TURNAROUND at the end of each pass,
     and on an over-sized grid every turnaround is off the edge of the paper.
     It would have rendered as LINES with a different name on the key.

     So the lines are generated in world space and each one is clipped to the
     sheet (Liang–Barsky, two axes), which puts every endpoint ON the boundary
     — where a real fill puts them, and where you can see the pen turn. */
  function scanlines(w, h, s, angDeg, m = 1.4) {
    const a = angDeg * Math.PI / 180;
    const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    const x0 = m, y0 = m, x1 = w - m, y1 = h - m;
    const cx = w / 2, cy = h / 2;
    let tmin = Infinity, tmax = -Infinity;
    [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([px, py]) => {
      const t = (px - cx) * nx + (py - cy) * ny;
      if (t < tmin) tmin = t;
      if (t > tmax) tmax = t;
    });
    const out = [];
    for (let t = Math.ceil(tmin / s) * s; t <= tmax; t += s) {
      const px = cx + nx * t, py = cy + ny * t;
      let lo = -Infinity, hi = Infinity, ok = true;
      const clip = (p, d, mn, mx) => {
        if (Math.abs(d) < 1e-9) return p >= mn && p <= mx;
        const A = (mn - p) / d, B = (mx - p) / d;
        lo = Math.max(lo, Math.min(A, B));
        hi = Math.min(hi, Math.max(A, B));
        return true;
      };
      if (!clip(px, ux, x0, x1)) ok = false;
      if (ok && !clip(py, uy, y0, y1)) ok = false;
      if (!ok || hi - lo < 0.15) continue;
      out.push([px + ux * lo, py + uy * lo, px + ux * hi, py + uy * hi]);
    }
    return out;
  }
  const f = v => Math.round(v * 100) / 100;
  const toPoly = p => 'M' + p.map(q => `${f(q[0])} ${f(q[1])}`).join('L');
  const ends = r => [r[0], r[r.length - 1]];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  /* ── THE CHAIN ──────────────────────────────────────────────────────────
     Greedy nearest-end, which is what a slicer does and produces the
     serpentine for free: the nearest unused end to where you just stopped is
     the near end of the next pass, so every other pass comes out reversed
     without anybody asking for it.

     WHAT IT CANNOT DO IS DECIDE FOR ITSELF WHETHER THE TRAVEL IS LEGAL, and
     that is the whole of the interesting part, so it is handed in as a BRIDGE:
     a function that either returns the line the pen draws on the way or says
     no. Two regions in this section answer that question differently, and the
     difference is the finding. */
  function stitch(runs, bridge) {
    /* IT CARRIES THE WHOLE RUN, and it did not always. Reducing each run to
       its two ends is right for a straight chord and only for a straight
       chord — it is what 08b wants, and it is what makes a plotter file forty
       times smaller. Do it in here and every CURVED fill comes out as a
       scribble of chords between the places its curves happened to start and
       stop, which still draws, still counts one pen down, and is not the
       drawing. A caller with straight runs reduces them itself, before
       chaining, where that decision belongs. */
    const path = runs.map(r => r.slice());
    const free = path.map(ends), used = new Array(free.length).fill(false);
    const out = [];

    /* THE SEARCH IS BOUNDED WHEN THE BRIDGE SAYS SO. Walking every free end
       on every step is O(n²) per stroke and O(n³) over a fill — fine at the
       two hundred runs a specimen makes, not fine at the ten thousand a
       streamline fill on a big sheet makes, where it is minutes.

       `cut` publishes its own reach, so the ends go in a bucket grid sized to
       it and only the neighbours are considered. That is not an approximation
       of the greedy rule, it is the same rule: `cut` refuses every gap wider
       than `reach`, so a candidate outside the neighbourhood could never have
       been taken however long it was looked at. A bridge that does not
       publish a reach — one that walks a wall, say — gets the exhaustive
       search it needs, unchanged. */
    const reach = typeof bridge.reach === 'number' ? bridge.reach : null;
    let cellOf = null, grid = null;
    if (reach) {
      const c = Math.max(reach, 0.5), key = (i, j) => i * 100003 + j;
      grid = new Map();
      cellOf = (p) => key(Math.floor(p[0] / c), Math.floor(p[1] / c));
      free.forEach((e, i) => {
        for (let k = 0; k < 2; k++) {
          const g = cellOf(e[k]);
          let a = grid.get(g); if (!a) { a = []; grid.set(g, a); } a.push([i, k]);
        }
      });
      cellOf.c = c; cellOf.key = key;
    }

    const near = (p) => {
      const cand = [];
      if (grid) {
        const ci = Math.floor(p[0] / cellOf.c), cj = Math.floor(p[1] / cellOf.c);
        for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
          const a = grid.get(cellOf.key(ci + di, cj + dj)); if (!a) continue;
          for (let q = 0; q < a.length; q++) {
            const [j, k] = a[q]; if (used[j]) continue;
            const d = dist(p, free[j][k]);
            if (d <= reach) cand.push([d, j, k]);
          }
        }
      } else {
        for (let j = 0; j < free.length; j++) {
          if (used[j]) continue;
          cand.push([dist(p, free[j][0]), j, 0], [dist(p, free[j][1]), j, 1]);
        }
      }
      cand.sort((a, b) => a[0] - b[0]);
      return cand;
    };

    for (let n = 0; n < free.length; n++) {
      if (used[n]) continue;
      used[n] = true;
      const cur = path[n].slice();
      for (;;) {
        const p = cur[cur.length - 1];
        let hit = null, br = null;
        for (const c of near(p)) {
          br = bridge(p, free[c[1]][c[2]]);
          if (br) { hit = c; break; }
        }
        if (!hit) break;
        used[hit[1]] = true;
        const seg = hit[2] === 1 ? path[hit[1]].slice().reverse() : path[hit[1]];
        /* the bridge ends ON the next run's near end, so that point is already
           down — push the run from its second point or it is drawn twice */
        cur.push(...br, ...seg.slice(1));
      }
      out.push(cur);
    }
    return out;
  }

  /* THE CONNECTOR IS A LINE THE PEN ACTUALLY DRAWS, so "is the gap short
     enough" is only half the test. It also has to stay inside the region being
     filled — skip that and the fill grows whiskers across the white paper
     between its islands, which is worse than the lift it saved. */
  const cut = (reach, inside) => {
    const bridge = (a, b) => {
      if (dist(a, b) > reach) return null;
      for (let i = 1; i < 5; i++) {
        const u = i / 5;
        if (!inside(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)) return null;
      }
      return [b];
    };
    /* PUBLISHED so `stitch` may bound its search. It is the bridge that knows
       what it will refuse, and nothing else can be told to assume it. */
    bridge.reach = reach;
    return bridge;
  };


  /* ══════════════════════════════════════════════════════════════════════
     FOUR MORE MACHINE FILLS

     Every one of them answers the same question as the serpentine — how do
     you turn a tone into strokes without lifting more than you must — and
     every one answers it differently enough to be a different drawing, not a
     setting. They take a region and hand back runs, so `stitch` and `cut`
     work on all four exactly as they work on `scanlines`.

     WHAT THEY DO NOT DO IS ASK WHAT SHAPE THEY ARE ON. The direction field
     below is derived from the tone function itself; nothing here knows there
     is a ball. Hand it the blob and it wraps the blob.
     ══════════════════════════════════════════════════════════════════════ */

  /* ── THE DIRECTION FIELD ────────────────────────────────────────────────
     A base angle, BENT toward the iso-tone direction where the tone actually
     has one. Flat tone leaves the base direction alone; a turning tone bends
     the lines round it, which is what "the hatching follows the form" means
     when you are not allowed to know what the form is.

     TWO THINGS ARE DELIBERATE HERE AND BOTH ARE BUGS IF YOU UNDO THEM.

     It BENDS THE ANGLE, it does not blend two vector fields. Blending a
     uniform field with a rotational one always leaves a point where the two
     cancel, and every streamline in the neighbourhood spirals into it — a
     whirlpool in the middle of the fill, the same failure as an unplaced
     `latitudes` pole but arriving without warning.

     It bends by `sin(2d)`, not by `d`. The iso-tone direction is a LINE, not
     an arrow: it has no preferred end, so any formula that folds it into a
     half-turn range has a seam where the fold happens, and the fill shows it
     as a staircase straight across the region. `sin(2d)` is π-periodic, so
     the seam cannot exist. It is zero at 0° and at 90° and peaks at 45°,
     which is also the right shape: those two are the angles where there is
     nothing to bend toward. */
  function toneField(tone, angDeg, bend) {
    const base = angDeg * Math.PI / 180;
    const e = 1.6;                                    /* probe, mm */
    const t0 = (x, y) => { const v = tone(x, y); return v < 0 ? 0 : v; };
    return (x, y) => {
      const gx = t0(x + e, y) - t0(x - e, y), gy = t0(x, y + e) - t0(x, y - e);
      const g = Math.hypot(gx, gy);
      if (g < 1e-9) return base;
      const coh = Math.min(1, g / 0.06);              /* how much to trust it */
      const d = (Math.atan2(gy, gx) + Math.PI / 2) - base;
      return base + bend * coh * Math.sin(2 * d);
    };
  }

  /* ── STREAMLINES · evenly spaced, tone by separation ────────────────────
     Jobard & Lefer, 1997. Seed a point, integrate the field both ways, and
     stop the moment you come closer than `d` to a line already drawn; then
     drop fresh seeds at ±d off the line you just made and repeat until the
     queue empties. Tone enters as `d` itself — the separation closes up
     where the region is dark.

     THIS IS THE ONE FILL HERE WHERE TONE IS NOT A THRESHOLD. `carve` and the
     serpentine both draw a full-strength line or no line; this draws every
     line and moves them. That is why it has no banding to dither away and
     why it is the only one that reads as drawn rather than screened.

     `opt.near` / `opt.far` are the two separations in mm, dark and light.
     `opt.bend` is how hard the field follows the tone, 0 = straight parallels.

     THE SELF TEST IS NOT OPTIONAL. A line has not been added to the grid
     while it is still being walked, so without checking its own trail it
     will happily spiral onto itself wherever the field curls. The trailing
     window is skipped because the last few samples are always within `d` of
     the head — that is not a collision, that is the line. */
  function streamlines(w, h, tone, opt = {}) {
    const nib   = opt.nib   || 0.35;
    const far   = opt.far   || 3.6 * (nib / 0.35);
    const near  = opt.near  || 1.25 * (nib / 0.35);
    const field = opt.field || toneField(tone, opt.angle == null ? -34 : opt.angle,
                                         opt.bend == null ? 0.85 : opt.bend);
    const step  = 0.7, TEST = 0.56, maxLen = opt.maxLen || Math.max(w, h) * 0.9;
    const cap   = opt.cap || 4000;

    const sep = (x, y) => { const t = tone(x, y); return t < 0 ? far : far + (near - far) * Math.pow(t, 0.85); };
    const cell = far, grid = new Map(), key = (i, j) => i * 100003 + j;
    const put = p => {
      const k = key(Math.floor(p[0] / cell), Math.floor(p[1] / cell));
      let a = grid.get(k); if (!a) { a = []; grid.set(k, a); } a.push(p);
    };
    const crowded = (x, y, r) => {
      const ci = Math.floor(x / cell), cj = Math.floor(y / cell), r2 = r * r;
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
        const a = grid.get(key(ci + di, cj + dj)); if (!a) continue;
        for (let q = 0; q < a.length; q++) {
          const ex = a[q][0] - x, ey = a[q][1] - y;
          if (ex * ex + ey * ey < r2) return true;
        }
      }
      return false;
    };

    const walk = (sx, sy, sgn) => {
      const pts = []; let x = sx, y = sy, len = 0;
      for (let s = 0; s < 4000; s++) {
        if (x < 0 || x > w || y < 0 || y > h || tone(x, y) < 0) break;
        const r = TEST * sep(x, y);
        if (crowded(x, y, r)) break;
        const back = Math.ceil(2.4 * sep(x, y) / step);
        let hit = false;
        for (let q = 0; q < pts.length - back; q++) {
          const ex = pts[q][0] - x, ey = pts[q][1] - y;
          if (ex * ex + ey * ey < r * r) { hit = true; break; }
        }
        if (hit) break;
        pts.push([x, y]);
        const a1 = field(x, y);                                     /* midpoint (RK2) */
        const a2 = field(x + sgn * step * 0.5 * Math.cos(a1), y + sgn * step * 0.5 * Math.sin(a1));
        x += sgn * step * Math.cos(a2); y += sgn * step * Math.sin(a2);
        len += step; if (len > maxLen) break;
      }
      return pts;
    };

    /* Propagation from one seed stalls wherever the queue happens to close a
       pocket off, so a jittered grid goes in behind it as a backstop. Every
       one of those is rejected on the spot if the space is already taken —
       they cost nothing and they are the difference between a fill and a
       fill with a hole in it. */
    const queue = [[w / 2, h / 2]];
    const G = 19;
    for (let gy = 0; gy < G; gy++) for (let gx = 0; gx < G; gx++)
      queue.push([(gx + 0.5) * w / G, (gy + 0.5) * h / G]);

    const out = [];
    for (let qi = 0; qi < queue.length && out.length < cap; qi++) {
      const s = queue[qi];
      if (s[0] < 0 || s[0] > w || s[1] < 0 || s[1] > h) continue;
      if (tone(s[0], s[1]) < 0) continue;
      if (crowded(s[0], s[1], sep(s[0], s[1]))) continue;
      const fwd = walk(s[0], s[1], 1), back = walk(s[0], s[1], -1);
      const line = back.slice(1).reverse().concat(fwd);
      if (line.length < 4) continue;
      for (const p of line) put(p);
      out.push(line);
      let acc = 0;
      for (let i = 1; i < line.length; i++) {
        acc += dist(line[i], line[i - 1]);
        const d = sep(line[i][0], line[i][1]);
        if (acc < d * 0.9) continue;
        acc = 0;
        const tx = line[i][0] - line[i - 1][0], ty = line[i][1] - line[i - 1][1];
        const m = Math.hypot(tx, ty) || 1, nx = -ty / m, ny = tx / m;
        queue.push([line[i][0] + nx * d, line[i][1] + ny * d]);
        queue.push([line[i][0] - nx * d, line[i][1] - ny * d]);
      }
    }
    return out;
  }

  /* ── SQUIGGLE · amplitude-modulated line halftone ───────────────────────
     Ahmed & Deussen. Rows at the base angle, and the tone is the AMPLITUDE
     of a wave riding along each one rather than whether the row is drawn.
     Nothing is ever broken, so a whole region comes out as one row of runs
     that `stitch` folds into a single stroke — this and the space-filling
     curve are the two fills here that genuinely reach one pen-down.

     THE AMPLITUDE CEILING IS THE WHOLE OF THE TUNING. Peak-to-peak has to
     stay under the pitch or neighbouring rows collide, and when they collide
     the dark end stops getting darker and starts getting muddled: the tone
     inverts and the shading reads as a smear. 0.44 of the pitch is peak, so
     0.88 of it is peak-to-peak, and the remaining eighth is the margin.

     THE PHASE ADVANCES BY ARC LENGTH, not by x. Advance it by the parameter
     and the wavelength stretches with the row's own direction — every row at
     an angle comes out a different frequency from the ones beside it, which
     reads as a moiré nobody asked for. */
  function squiggle(w, h, tone, opt = {}) {
    const nib   = opt.nib   || 0.35;
    const pitch = opt.pitch || 2.6 * (nib / 0.35);
    const ang   = opt.angle == null ? -34 : opt.angle;
    const amp   = opt.amp   == null ? 0.44 : opt.amp;              /* of the pitch */
    const wl0   = opt.wave  || 4.6 * (nib / 0.35);
    const ds    = 0.22;
    const out = [];
    let phase = 0;
    scanlines(w, h, pitch, ang, opt.margin == null ? 1.4 : opt.margin).forEach(seg => {
      const [x0, y0, x1, y1] = seg;
      const L = Math.hypot(x1 - x0, y1 - y0); if (L < ds) return;
      const ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux;
      let run = null;
      for (let s = 0; s <= L; s += ds) {
        const px = x0 + ux * s, py = y0 + uy * s;
        const t = tone(px, py);
        if (t < 0) { run = null; continue; }               /* outside: break the row */
        const a = Math.pow(t, 1.15) * pitch * amp;
        phase += ds / Math.max(0.6, wl0 - (wl0 * 0.55) * t) * Math.PI * 2;
        let o = a * Math.sin(phase);
        /* THE WAVE IS WHAT LANDS ON THE PAPER, not the row it rides on. The
           region test belongs on the displaced point: test the centreline and
           a crest near the edge swings a millimetre outside the shape, which
           is a mark in the white and the one thing the contract forbids. The
           amplitude is pulled in until it fits rather than the run being cut,
           so the wave hugs the boundary instead of fraying against it. */
        if (tone(px + nx * o, py + ny * o) < 0) {
          let lo = 0, hi = o;
          for (let k = 0; k < 5; k++) {
            const u = (lo + hi) / 2;
            if (tone(px + nx * u, py + ny * u) < 0) hi = u; else lo = u;
          }
          o = lo;
        }
        if (!run) { run = []; out.push(run); }
        run.push([px + nx * o, py + ny * o]);
      }
    });
    return out.filter(r => r.length > 1);
  }

  /* ── SPACE-FILLING CURVE · one line, tone by curve length ───────────────
     Velho & Gomes. A Hilbert curve that recurses a level deeper wherever the
     region is darker, so tone becomes how much curve length is spent per
     square millimetre. Because every sub-cell of a Hilbert curve enters and
     leaves at fixed corners, you may stop the recursion at different depths
     in different places and the curve is STILL CONTINUOUS — that property is
     the entire reason this works, and it is why no other subdivision can be
     substituted for it without redoing the corners.

     ITS HONEST WEAKNESS IS THE GRID. The curve is axis-aligned and its
     lattice is visible in any flat area, which is a texture, not a shading.
     Segerman's pinwheel curve is the published answer and is not built here.

     Cells outside the region are dropped, which breaks the one line into one
     run per contiguous stretch. That is the correct behaviour and not a
     failure to chain: a connector across the outside is a mark on the paper. */
  function spaceFill(w, h, tone, opt = {}) {
    const nib  = opt.nib  || 0.35;
    const m    = opt.margin == null ? 1.4 : opt.margin;
    const S    = Math.min(w, h) - 2 * m;
    const ox   = (w - S) / 2, oy = (h - S) / 2;
    /* The shallow depth is set from the pitch so this fill lands at the same
       density as the others: a depth-n curve puts its line S/2^n apart. */
    const pitch = opt.pitch || 2.6 * (nib / 0.35);
    const dmin = opt.depth || Math.max(2, Math.round(Math.log2(S / pitch)));
    const dmax = dmin + (opt.levels == null ? 3 : opt.levels);
    const out = []; let run = null;
    (function rec(x0, y0, xi, xj, yi, yj, depth) {
      const cx = x0 + (xi + yi) / 2, cy = y0 + (xj + yj) / 2;
      const t = tone(cx, cy);
      const want = t < 0 ? dmin : dmin + Math.round(Math.pow(t, 0.9) * (dmax - dmin));
      if (depth >= want || depth >= dmax) {
        if (t < 0) { run = null; return; }
        if (!run) { run = []; out.push(run); }
        run.push([cx, cy]);
        return;
      }
      rec(x0, y0, yi / 2, yj / 2, xi / 2, xj / 2, depth + 1);
      rec(x0 + xi / 2, y0 + xj / 2, xi / 2, xj / 2, yi / 2, yj / 2, depth + 1);
      rec(x0 + xi / 2 + yi / 2, y0 + xj / 2 + yj / 2, xi / 2, xj / 2, yi / 2, yj / 2, depth + 1);
      rec(x0 + xi / 2 + yi, y0 + xj / 2 + yj, -yi / 2, -yj / 2, -xi / 2, -xj / 2, depth + 1);
    })(ox, oy, S, 0, 0, S, 0);
    return out.filter(r => r.length > 1);
  }

  /* ── LABYRINTH · one closed curve, grown ────────────────────────────────
     Pedersen & Singh, NPAR 2006. A closed polyline under four forces —
     fairing toward the neighbours' midpoint, an edge spring holding the node
     spacing, Brownian jitter, and repulsion from every non-adjacent node
     inside a radius — resampling itself as it goes. The tone drives the
     repulsion radius, so the coils crowd where the region is dark.

     GROWTH IS AN INJECTION, and this is the part that is not obvious.
     Repulsion cannot lengthen a small loop, because a small loop has no
     non-adjacent neighbours inside the radius to push against: leave it to
     the forces and the curve sits there as a circle for as long as you care
     to iterate. Nodes are pushed in at a fixed rate and the forces then have
     something to arrange.

     IT IS BY FAR THE MOST EXPENSIVE FILL HERE — an n-body relaxation with a
     neighbour query per node per step — and it does not hold fine tone. What
     it holds is TEXTURE, which nothing else in this file can make. */
  function labyrinth(w, h, tone, opt = {}) {
    const nib  = opt.nib  || 0.35;
    const near = opt.near || 2.0 * (nib / 0.35);
    const far  = opt.far  || 4.2 * (nib / 0.35);
    const iters = opt.iters || 240;
    const rnd  = KIT.rng(opt.seed || 1);

    /* Start wherever there is the most room: the inside sample furthest from
       anything outside. Starting at the centre of the sheet puts the seed
       loop through the blob's hole about a third of the time. */
    let sx = w / 2, sy = h / 2, bestD = -1, inside = 0;
    for (let gy = 1; gy < 24; gy++) for (let gx = 1; gx < 24; gx++) {
      const x = gx * w / 24, y = gy * h / 24;
      if (tone(x, y) < 0) continue;
      inside++;
      let d = 0;
      while (d < 22) {
        const q = d + 1.6; let free = true;
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * Math.PI * 2;
          if (tone(x + q * Math.cos(a), y + q * Math.sin(a)) < 0) { free = false; break; }
        }
        if (!free) break; d = q;
      }
      if (d > bestD) { bestD = d; sx = x; sy = y; }
    }
    /* A curve at coil spacing `near` fills an area with `area / near` of line,
       and a node every `near * 0.46` of it. That is the budget — measured off
       the same grid the seed came from, so a small specimen and a big sheet
       both stop when they are full rather than when a constant says so. */
    const area = inside / (23 * 23) * w * h;
    const cap = opt.cap || Math.max(200, Math.min(4000,
                  Math.round(area / (0.46 * near * near) * 1.15)));
    let R0 = Math.max(1.6, Math.min(bestD * 0.55, 12));
    let nodes = [];
    for (let tries = 0; tries < 9; tries++) {
      nodes = [];
      let ok = true;
      for (let i = 0; i < 56; i++) {
        const a = i / 56 * Math.PI * 2;
        const x = sx + R0 * Math.cos(a), y = sy + R0 * Math.sin(a);
        if (tone(x, y) < 0) { ok = false; break; }
        nodes.push([x, y]);
      }
      if (ok) break;
      R0 *= 0.7;                      /* shrink until the seed loop fits */
    }

    const radius = (x, y) => { const t = tone(x, y); return t < 0 ? near : far + (near - far) * Math.pow(t, 0.75); };
    const cell = near, key = (i, j) => i * 100003 + j;

    for (let it = 0; it < iters; it++) {
      const n = nodes.length, grid = new Map();
      for (let i = 0; i < n; i++) {
        const k = key(Math.floor(nodes[i][0] / cell), Math.floor(nodes[i][1] / cell));
        let a = grid.get(k); if (!a) { a = []; grid.set(k, a); } a.push(i);
      }
      const fx = new Float64Array(n), fy = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const p = nodes[i], pv = nodes[(i - 1 + n) % n], nx2 = nodes[(i + 1) % n];
        const R = radius(p[0], p[1]), de = R * 0.46;
        fx[i] += ((pv[0] + nx2[0]) / 2 - p[0]) * 0.20;
        fy[i] += ((pv[1] + nx2[1]) / 2 - p[1]) * 0.20;
        for (const q of [pv, nx2]) {
          const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy);
          if (d > 1e-6) { const f = (d - de) * 0.22; fx[i] += dx / d * f; fy[i] += dy / d * f; }
        }
        fx[i] += (rnd() * 2 - 1) * 0.13; fy[i] += (rnd() * 2 - 1) * 0.13;
        const ci = Math.floor(p[0] / cell), cj = Math.floor(p[1] / cell);
        const RR = Math.ceil(R / cell);
        for (let di = -RR; di <= RR; di++) for (let dj = -RR; dj <= RR; dj++) {
          const a = grid.get(key(ci + di, cj + dj)); if (!a) continue;
          for (let q = 0; q < a.length; q++) {
            const j = a[q];
            if (j === i || j === (i + 1) % n || j === (i - 1 + n) % n
                        || j === (i + 2) % n || j === (i - 2 + n) % n) continue;
            const dx = p[0] - nodes[j][0], dy = p[1] - nodes[j][1], d = Math.hypot(dx, dy);
            if (d > 1e-6 && d < R) { const f = (1 - d / R) * 0.62; fx[i] += dx / d * f; fy[i] += dy / d * f; }
          }
        }
      }
      /* The region is the wall. A node that steps outside is walked back
         along the step it just took rather than clamped to a box — the box
         is the sheet, and the sheet is not the shape. */
      for (let i = 0; i < n; i++) {
        const p = nodes[i];
        const px = p[0] + Math.max(-0.9, Math.min(0.9, fx[i]));
        const py = p[1] + Math.max(-0.9, Math.min(0.9, fy[i]));
        if (px > 0 && px < w && py > 0 && py < h && tone(px, py) >= 0) { p[0] = px; p[1] = py; continue; }
        let lo = 0, hi = 1;
        for (let k = 0; k < 6; k++) {
          const u = (lo + hi) / 2;
          const qx = p[0] + (px - p[0]) * u, qy = p[1] + (py - p[1]) * u;
          if (qx > 0 && qx < w && qy > 0 && qy < h && tone(qx, qy) >= 0) lo = u; else hi = u;
        }
        p[0] += (px - p[0]) * lo * 0.6; p[1] += (py - p[1]) * lo * 0.6;
      }
      /* GROWTH IS GATED ON ROOM, and this is the second half of the same
         lesson. Injecting at a fixed rate is what lengthens the curve, but a
         lobe that has already filled cannot take more nodes: the repulsion
         has nowhere to put them, the walk-back pins them against the wall,
         and the next injection lands on top of the pile. It knots — a solid
         black tangle where the coils should be — and no amount of iterating
         undoes it, because the crossings are already made.

         So a node goes in only where its midpoint has clearance. The curve
         then grows until the region is full and stops on its own, which is
         also the only sensible definition of "full". */
      if (nodes.length < cap) {
        const add = Math.max(1, Math.floor(n * 0.08));
        /* PICKED FIRST, SPLICED AFTER, and in descending order. The grid holds
           indices into the array as it stood at the top of the iteration; the
           first splice moves every index above it and every later room test
           then reads the wrong node. It does not throw — it quietly refuses
           almost every injection, and the curve sits there as a ring. */
        const picks = [], seen = new Set();
        for (let g = 0; g < add; g++) {
          const i = Math.floor(rnd() * n);
          if (seen.has(i)) continue;
          const a = nodes[i], b = nodes[(i + 1) % n];
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          if (tone(mx, my) < 0) continue;
          const room = radius(mx, my) * 0.55, r2 = room * room;
          const ci = Math.floor(mx / cell), cj = Math.floor(my / cell);
          const RR = Math.ceil(room / cell);
          let tight = false;
          for (let di = -RR; di <= RR && !tight; di++) for (let dj = -RR; dj <= RR && !tight; dj++) {
            const arr = grid.get(key(ci + di, cj + dj)); if (!arr) continue;
            for (let q = 0; q < arr.length; q++) {
              const j = arr[q];
              /* The window is along the CURVE, not in space. Its own near
                 neighbours sit a node-spacing from the midpoint by definition;
                 count those and every injection is refused by the run it is
                 being inserted into. What the test asks about is another COIL. */
              const g1 = Math.abs(j - i), gap = g1 < n - g1 ? g1 : n - g1;
              if (gap <= 4) continue;
              const ex = nodes[j][0] - mx, ey = nodes[j][1] - my;
              if (ex * ex + ey * ey < r2) { tight = true; break; }
            }
          }
          if (!tight) { picks.push([i, mx, my]); seen.add(i); }
        }
        picks.sort((p1, p2) => p2[0] - p1[0]);
        for (const [i, mx, my] of picks) {
          if (nodes.length >= cap) break;
          nodes.splice(i + 1, 0, [mx, my]);
        }
      }
      /* THE CAP IS ON WHAT THIS PASS STARTED WITH. Gate the split on the
         array being BUILT and it never holds: `keep` already contains a copy
         of every node, so it passes the cap halfway through and the pass
         still added a midpoint to everything before that point. Each pass
         then comes out half as long again as the last — a runaway that ends
         at fifty thousand nodes and a hundred seconds, with no error. */
      const mayGrow = nodes.length < cap;
      const keep = [];
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i], b = nodes[(i + 1) % nodes.length];
        const de = radius(a[0], a[1]) * 0.46, d = dist(a, b);
        if (d < de * 0.30 && keep.length > 40 && nodes.length > 56) continue;
        keep.push(a);
        if (d > de * 1.35 && mayGrow && keep.length < cap) {
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          if (tone(mx, my) >= 0) keep.push([mx, my]);
        }
      }
      nodes = keep;
    }
    nodes.push(nodes[0].slice());
    return [nodes];
  }

  /* ── THE THREE HANDS ──────────────────────────────────────────────────── */
  const { rng, noise, plen, scene, blob, latitudes, parallels,
          carve, toPath, thin, AXIS } = KIT;

  /* ── the hand ──────────────────────────────────────────────────────────── */
  function handify(pts, rnd, n1, amp, endMax) {
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const tot = L[L.length - 1];
    if (tot < 0.12) return null;
    const ph = rnd() * 600, wl = 3.0 + rnd() * 4.5, bow = (rnd() - 0.5) * amp * 3.4;
    const o = pts.map((p, i) => {
      const s = L[i], u = s / tot;
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
      const w = n1(ph + s / wl) * amp + bow * Math.sin(Math.PI * u);
      return [p[0] - ty * w, p[1] + tx * w, tx, ty];
    });
    const e0 = rnd() * endMax - endMax * 0.4, e1 = rnd() * endMax - endMax * 0.4;
    const A = o[0], Z = o[o.length - 1];
    const out = o.map(p => [p[0], p[1]]);
    out[0] = [A[0] - A[2] * e0, A[1] - A[3] * e0];
    out[out.length - 1] = [Z[0] + Z[2] * e1, Z[1] + Z[3] * e1];
    return out;
  }


  /* ── the three hands ───────────────────────────────────────────────────── */

  function draw(kind, w, h, seed, opt = {}) {
    const S = scene(w, h);
    const rnd = rng(seed), n1 = noise(seed ^ 0x9e37), n2 = noise(seed ^ 0x51ed);
    const dither = (x, y) => (n1(x * 0.62 + y * 0.21) + n2(y * 0.55 - x * 0.18)) * 0.085;
    const nib = opt.nib || 0.35;
    /* SPACING AND ANGLE ARE WHAT A CALLER OWNS, and everything inside is
       written against them: every pitch is a multiple of the base, every pass
       angle is an offset from it. So one knob rotates the whole fill and the
       other changes its pitch without changing what it looks like — which is
       the difference between a parameter and a different drawing.

       THE DEFAULT SPACING FOLLOWS THE NIB, because pitch and nib are one
       setting: what a fill LOOKS like is pitch measured in nibs. A caller that
       picks up a bigger pen and says nothing about spacing wants the same
       drawing with a bigger pen, not a darker one. Say `spacing` and you have
       taken that over.

       `u` is everything the NIB owns — wobble, overshoot, the shortest mark
       that still reads. Those are properties of the pen, not of the pitch. */
    const u = nib / 0.35;
    const S0 = opt.spacing > 0 ? opt.spacing : 2.17 * u;
    const k = S0 / 2.17, A0 = opt.angle == null ? -34 : opt.angle;
    const jit = () => rnd() - 0.5;
    const amp = 0.11 * u, out = [];
    const ink = pts => { const g = handify(thin(pts, 3), rnd, n1, amp, 0.5 * u); if (g) out.push(toPath(g)); };
    /* A HAND RE-GRIPS. Past about 16mm the wrist runs out of travel and the
       stroke is two strokes with a hairline break in it — which is the reason a
       long hand-drawn fill never has a single edge-to-edge line in it. */
    const push = pts => {
      const L = plen(pts);
      if (L < 17 || pts.length < 8) return ink(pts);
      const k = Math.round(pts.length * (0.38 + rnd() * 0.24));
      const g = Math.max(1, Math.round(pts.length * (0.02 + rnd() * 0.03)));
      ink(pts.slice(0, k)); ink(pts.slice(k + g));
    };

    if (kind === 'random') {
      /* NO REGISTER AT ALL. Density is the only tone control, so the marks have
         to be short and the direction has to come from somewhere other than the
         dice: a hand scribbling shares a direction with the marks it just made,
         and pure uniform angles read as static rather than as shading. */
      /* DENSITY IS THIS FILL'S SPACING. It has no register to space, so the
         only thing `spacing` can mean here is how much paper is left: coverage
         is density × length × nib, so density goes as 1/pitch and the random
         hand darkens and lightens in step with the two that have a pitch.
         ANGLE does nothing on this kind, and cannot — a fill with no readable
         direction is the whole definition of it. */
      const dens = 2.7 / k, N = Math.round(w * h * dens);
      for (let k = 0; k < N; k++) {
        const x = rnd() * w, y = rnd() * h;
        const t = Math.max(S.ball(x, y), S.shadow(x, y));
        if (t <= 0.03 || rnd() > Math.pow(t, 1.3)) continue;
        const base = (n1(x * 0.10 + y * 0.07) * 1.6 + n1(y * 0.31 - x * 0.19 + 90) * 0.5) * Math.PI;
        const a = base + (rnd() - 0.5) * 1.1;
        const dx = Math.cos(a), dy = Math.sin(a);
        const len = (0.38 + rnd() * 0.68) * (0.55 + t * 0.6);
        const n = rnd() < 0.06 ? 2 : 1;
        const gap = 0.26 + rnd() * 0.14, half = len / 2, pts = [];
        for (let i = 0; i < n; i++) {
          const off = (i - (n - 1) / 2) * gap;
          const a0 = i % 2 ? half : -half, a1 = i % 2 ? -half : half;
          const steps = Math.max(2, Math.round(len / 0.3));
          for (let j = i ? 1 : 0; j <= steps; j++) {
            const u = a0 + (a1 - a0) * (j / steps);
            pts.push([x + dx * u - dy * off, y + dy * u + dx * off]);
          }
        }
        const g = handify(pts, rnd, n1, 0.07 * u, 0.22 * u);
        if (g) out.push(toPath(g));
      }
      /* the edge is made of the marks, so the contour is made of marks too */
      for (let k = 0; k < 320; k++) {
        const a = rnd() * Math.PI * 2;
        const t = S.ball(S.cx + S.R * 0.94 * Math.cos(a), S.cy + S.R * 0.94 * Math.sin(a));
        if (rnd() > 0.14 + Math.max(0, t) * 0.66) continue;
        const r0 = S.R * (0.985 + (rnd() - 0.5) * 0.02), d = (0.10 + rnd() * 0.22);
        const pts = [];
        for (let j = 0; j <= 4; j++) {
          const u = a - d / 2 + d * j / 4;
          pts.push([S.cx + r0 * Math.cos(u), S.cy + r0 * Math.sin(u)]);
        }
        const g = handify(pts, rnd, n1, 0.08 * u, 0.25 * u);
        if (g) out.push(toPath(g));
      }
      return { paths: out, nib, S };
    }

    /* PARALLEL AND CROSSED. Both are the same build: pass after pass, each one
       confined to what is already darker than the last. That is how a hand does
       it — you do not draw a grey, you go back over the part that is not dark
       enough yet — and it is why the boundaries have to be dithered: a clean
       threshold draws a CONTOUR MAP of the lighting, which is the one thing that
       never happens by hand. */
    /* THE AXIS IS AIMED AT THE HIGHLIGHT, and that is not decoration.

       Every axis has one pole on the front of the ball and one place where the
       latitude circles shrink to a point — put either of them in the middle of
       the shading and the fill has a visible whirlpool in it. They cannot be
       removed, only placed: at 40° behind the screen plane both land 0.77R from
       the centre, and the light's own screen direction puts the highlight at
       0.79R. Aim the axis down the light and the two coincide — so the blank
       cap round the pole IS the highlight, and the blank cap opposite it IS the
       reflected-light rim. Both are places a hand leaves paper anyway. */
    const AX = A0 + 83, BX = 20, cap = 17 * Math.PI / 180;
    const form = (angDrift, tau, off, pitch) => {
      const A = AXIS(AX + angDrift, BX);
      const dphi = pitch / S.R, phi0 = BX * Math.PI / 180 + cap + dphi * off;
      const runs = latitudes(A, phi0, dphi, S.cx, S.cy, S.R, 0.42, Math.PI - cap, jit);
      carve(runs, S.ball, tau, dither, 1.68 * u).forEach(r => { if (rnd() > 0.035) push(r); });
    };
    /* A FLOOD IS NOT A DARK. Four interleaved passes at pitch s land the darkest
       tone at s/4, so s has to be four nibs clear of it or the terminator turns
       into a solid black disc — the same crossing the hatch bay marks in red on
       its spacing knob, and it is the first thing that goes wrong here. */
    if (kind === 'cross') {
      /* THE FIRST LAYER WRAPS, THE REST CROSS IT — which is what a hand does:
         you find the form once and then you stop thinking about it and just get
         it dark. Later layers are straight, and being straight is what makes
         them read as a second pass rather than as more of the first. */
      form(0, 0.12, 0, 2.10 * k);
      [[20, 0.36, 1.75], [90, 0.56, 1.54], [56, 0.76, 1.33]].forEach(([d, tau, pitch]) => {
        const runs = parallels(S.cx - S.R - 1, S.cy - S.R - 1, S.cx + S.R + 1, S.cy + S.R + 1, A0 + d, pitch * k, 0, 0.42, jit);
        carve(runs, S.ball, tau, dither, 1.68 * u).forEach(r => { if (rnd() > 0.04) push(r); });
      });
    } else {
      /* ONE DIRECTION, FOUR TIMES — and the drift is the hand. Nobody comes back
         to a fill at the angle they left it, so each pass is a couple of degrees
         off the last; that tiny disagreement is most of what separates a hand
         from a machine running the same generator. */
      [[0, 0.12, 0], [3, 0.36, 0.5], [-3, 0.56, 0.25], [1.5, 0.76, 0.75]]
        .forEach(([d, tau, off]) => form(d, tau, off, 2.17 * k));
    }

    /* the table is flat, so its strokes are flat — the shadow does not wrap */
    const box = [S.sx - S.srx - 1, S.sy - S.sry - 1, S.sx + S.srx + 1, S.sy + S.sry + 1];
    const sp = 1.61 * k;
    const spasses = kind === 'cross'
      ? [{ ang: A0 + 30, tau: 0.12, off: 0 }, { ang: A0 + 58, tau: 0.44, off: 0 }, { ang: A0 + 30, tau: 0.72, off: sp / 2 }]
      : [{ ang: A0 + 30, tau: 0.12, off: 0 }, { ang: A0 + 28, tau: 0.44, off: sp / 2 }, { ang: A0 + 32, tau: 0.72, off: sp / 4 }];
    spasses.forEach(p => {
      const runs = parallels(box[0], box[1], box[2], box[3], p.ang, sp, p.off, 0.42, jit);
      carve(runs, S.shadow, p.tau, dither, 0.98 * u).forEach(r => { if (rnd() > 0.04) push(r); });
    });

    /* THE CONTOUR, and a hand never closes one. Two arcs with a gap where the
       light is, doubled on the shadow side because that is where the pen goes
       back over it. */
    const arcs = kind === 'cross'
      ? [[-0.30, 2.05], [2.35, 4.15], [2.6, 3.9]]
      : [[-0.28, 2.10], [2.30, 4.20]];
    arcs.forEach(([a0, a1]) => {
      const pts = [];
      for (let a = a0; a <= a1; a += 0.06) {
        const r0 = S.R * (1 + (n1(a * 2.1 + 40) * 0.006));
        pts.push([S.cx + r0 * Math.cos(a), S.cy + r0 * Math.sin(a)]);
      }
      const g = handify(thin(pts, 2), rnd, n1, 0.075 * u, 0.62 * u);
      if (g) out.push(toPath(g));
    });
    return { paths: out, nib, S };
  }


  function drawShape(kind, w, h, seed, opt = {}) {
    const S = blob(w, h, seed);
    const rnd = rng(seed ^ 0x2f1b), n1 = noise(seed ^ 0x77a3), n2 = noise(seed ^ 0x1c05);
    const dither = () => 0;                      // no tone here, so nothing to dither
    const nib = opt.nib || 0.35;
    /* SPACING AND ANGLE ARE WHAT A CALLER OWNS, and everything inside is
       written against them: every pitch is a multiple of the base, every pass
       angle is an offset from it. So one knob rotates the whole fill and the
       other changes its pitch without changing what it looks like — which is
       the difference between a parameter and a different drawing.

       THE DEFAULT SPACING FOLLOWS THE NIB, because pitch and nib are one
       setting: what a fill LOOKS like is pitch measured in nibs. A caller that
       picks up a bigger pen and says nothing about spacing wants the same
       drawing with a bigger pen, not a darker one. Say `spacing` and you have
       taken that over.

       `u` is everything the NIB owns — wobble, overshoot, the shortest mark
       that still reads. Those are properties of the pen, not of the pitch. */
    const u = nib / 0.35;
    const S0 = opt.spacing > 0 ? opt.spacing : 2.17 * u;
    const k = S0 / 2.17, A0 = opt.angle == null ? -34 : opt.angle;
    const jit = () => rnd() - 0.5;
    const out = [];
    /* THE ENDS ARE THE TEST. A fill that stops dead on the outline is a clip
       path; a hand runs past it and pulls up short by turns, and the amount is
       about a third of the pitch — enough to see, not enough to read as a fringe. */
    const ink = pts => { const g = handify(thin(pts, 3), rnd, n1, 0.11 * u, 1.05 * u); if (g) out.push(toPath(g)); };
    const push = pts => {
      const L = plen(pts);
      if (L < 17 || pts.length < 8) return ink(pts);
      const k = Math.round(pts.length * (0.38 + rnd() * 0.24));
      const g = Math.max(1, Math.round(pts.length * (0.02 + rnd() * 0.03)));
      ink(pts.slice(0, k)); ink(pts.slice(k + g));
    };
    const lay = (ang, pitch, off) => {
      const runs = parallels(0, 0, w, h, ang, pitch, off, 0.42, jit);
      carve(runs, S.tone, 0.5, dither, 0.63 * u).forEach(r => { if (rnd() > 0.03) push(r); });
    };

    if (kind === 'random') {
      /* DENSITY IS THIS FILL'S SPACING. It has no register to space, so the
         only thing `spacing` can mean here is how much paper is left: coverage
         is density × length × nib, so density goes as 1/pitch and the random
         hand darkens and lightens in step with the two that have a pitch.
         ANGLE does nothing on this kind, and cannot — a fill with no readable
         direction is the whole definition of it. */
      const dens = 2.7 / k, N = Math.round(w * h * dens);
      for (let k = 0; k < N; k++) {
        const x = rnd() * w, y = rnd() * h;
        if (S.tone(x, y) < 0) continue;
        const base = (n1(x * 0.10 + y * 0.07) * 1.6 + n2(y * 0.31 - x * 0.19) * 0.5) * Math.PI;
        const a = base + (rnd() - 0.5) * 1.1;
        const dx = Math.cos(a), dy = Math.sin(a), len = 0.52 + rnd() * 0.78, half = len / 2;
        const pts = [];
        const steps = Math.max(2, Math.round(len / 0.3));
        for (let j = 0; j <= steps; j++) {
          const u = -half + len * (j / steps);
          pts.push([x + dx * u, y + dy * u]);
        }
        const g = handify(pts, rnd, n1, 0.07 * u, 0.22 * u);
        if (g) out.push(toPath(g));
      }
    } else if (kind === 'cross') {
      lay(A0, 1.61 * k, 0); lay(A0 + 86, 1.61 * k, 0);
    } else {
      lay(A0, 1.96 * k, 0); lay(A0 + 4, 1.96 * k, 0.98 * k);
    }

    /* THE OUTLINE IS PART OF THE TEST, not a frame round it: a hand-drawn edge
       is where you see whether the wobble has a wavelength or is just noise. */
    S.rings(0.45).forEach(o => {
      const n = o.length;
      if (kind === 'random') {
        for (let k = 0; k < Math.round(n * 1.2); k++) {
          const i = Math.floor(rnd() * n), m = 3 + Math.floor(rnd() * 4);
          ink(o.slice(i, i + m).map(p => p.slice()));
        }
      } else {
        /* two arcs and a gap, and the gap is not in the same place twice */
        const c0 = Math.floor(rnd() * n), c1 = (c0 + Math.floor(n * (0.42 + rnd() * 0.16))) % n;
        const seg = (a, b) => { const p = []; for (let i = a; i !== b; i = (i + 1) % n) p.push(o[i]); return p; };
        [seg(c0, c1), seg(c1, c0)].forEach(p => { if (p.length > 4) ink(p); });
      }
    });
    return { paths: out, nib, S };
  }


  /* ══════════════════════════════════════════════════════════════════════
     `fill` — A HAND ON ANY REGION

     `draw` and `drawShape` each BUILD their own subject: one makes a scene and
     hatches the ball, the other makes a blob and hatches that. They predate the
     region contract, and the cost showed up the moment there was a third
     subject — the teapot — because they are the only generators in this file
     that cannot be pointed at one. Three tiles out of nine quietly drew
     something else.

     THIS IS THE SAME HAND WITH THE SUBJECT TAKEN OUT. Same jitter, same drift,
     same overshoot, same re-grip, same four thresholds each confined to what
     the last left dark. `draw` and `drawShape` are untouched — Portrait-Typo
     calls both, and changing what they return would change a drawing in
     somebody else's app to tidy this one.

     THE FORM-FOLLOWING PASS IS THE ONLY REAL DIFFERENCE, and it had to be.
     `latitudes` wraps a SPHERE: it needs a centre, a radius and an axis, and it
     has one pole on the front of the ball that must be aimed at the highlight
     or the fill grows a whirlpool. A teapot has no such axis and no honest
     place to put one. So the wrapping pass is `streamlines` over the field the
     tone itself implies — which is the same idea arrived at from the other end,
     works on any region, and has no pole to place.
     ══════════════════════════════════════════════════════════════════════ */
  function fill(kind, w, h, seed, region, opt = {}) {
    const tone = region.tone;
    const rnd = rng(seed), n1 = noise(seed ^ 0x9e37), n2 = noise(seed ^ 0x51ed);
    const dither = (x, y) => (n1(x * 0.62 + y * 0.21) + n2(y * 0.55 - x * 0.18)) * 0.085;
    const nib = opt.nib || 0.35;
    const u = nib / 0.35;
    const S0 = opt.spacing > 0 ? opt.spacing : 2.17 * u;
    const k = S0 / 2.17, A0 = opt.angle == null ? -34 : opt.angle;
    const jit = () => rnd() - 0.5;
    const amp = 0.11 * u, out = [];
    const ink = pts => { const g = handify(thin(pts, 3), rnd, n1, amp, 0.5 * u); if (g) out.push(toPath(g)); };
    /* PAST ABOUT 16MM THE WRIST RUNS OUT and the stroke is two strokes with a
       hairline break in it, which is why a long hand-drawn fill has no single
       edge-to-edge line anywhere in it. */
    const push = pts => {
      const L = plen(pts);
      if (L < 17 || pts.length < 8) return ink(pts);
      const c = Math.round(pts.length * (0.38 + rnd() * 0.24));
      const g = Math.max(1, Math.round(pts.length * (0.02 + rnd() * 0.03)));
      ink(pts.slice(0, c)); ink(pts.slice(c + g));
    };

    if (kind === 'random') {
      const dens = 2.7 / k, N = Math.round(w * h * dens);
      for (let i = 0; i < N; i++) {
        const x = rnd() * w, y = rnd() * h;
        const t = tone(x, y);
        if (t <= 0.03 || rnd() > Math.pow(t, 1.3)) continue;
        const base = (n1(x * 0.10 + y * 0.07) * 1.6 + n1(y * 0.31 - x * 0.19 + 90) * 0.5) * Math.PI;
        const a = base + (rnd() - 0.5) * 1.1;
        const dx = Math.cos(a), dy = Math.sin(a);
        const len = (0.38 + rnd() * 0.68) * (0.55 + t * 0.6);
        const n = rnd() < 0.06 ? 2 : 1;
        const gap = 0.26 + rnd() * 0.14, half = len / 2, pts = [];
        for (let j = 0; j < n; j++) {
          const off = (j - (n - 1) / 2) * gap;
          const a0 = j % 2 ? half : -half, a1 = j % 2 ? -half : half;
          const steps = Math.max(2, Math.round(len / 0.3));
          for (let m = j ? 1 : 0; m <= steps; m++) {
            const v = a0 + (a1 - a0) * (m / steps);
            pts.push([x + dx * v - dy * off, y + dy * v + dx * off]);
          }
        }
        ink(pts);
      }
    } else {
      const straight = (drift, tau, pitch) => {
        const runs = parallels(0, 0, w, h, A0 + drift, pitch * k, 0, 0.42, jit);
        carve(runs, tone, tau, dither, 1.68 * u).forEach(r => { if (rnd() > 0.04) push(r); });
      };
      /* EACH WRAPPING PASS IS SPACED A LITTLE WIDER THAN THE LAST. Four runs of
         the same field at the same separation land on the same lines — and
         since every pass is confined to what is already darker, they would
         stack exactly on top of each other in the shadow and ink it twice
         instead of building it up. Widening by an eleventh a pass is enough to
         interleave them. */
      const wrap = (i, tau, pitch) => {
        const runs = streamlines(w, h, tone, {
          nib, angle: A0 + [0, 3, -2, 5][i % 4],
          near: pitch * k * (1 + i * 0.11), far: pitch * k * 2.4 });
        carve(runs, tone, tau, dither, 1.68 * u).forEach(r => { if (rnd() > 0.035) push(r); });
      };
      /* ── HOW MANY PASSES IS ASKED OF THE TONE, NOT OF THE CALLER ────────
         Four passes each confined to what the last left dark is how you build
         a TONE. Hand that recipe a flat region — the blob is 1 everywhere
         inside — and all four thresholds pass everywhere at once: four
         interleaved passes at pitch s land at s/4, which is under two nibs and
         floods to solid black. A flat fill wants two passes, and `drawShape`
         has always used two for exactly this reason.

         So the region is asked what range it has. That is not the generator
         peeking at the shape — it never learns what the thing IS — it is the
         same question `carve` asks at every sample, put once instead of ten
         thousand times. */
      let lo = 2, hi = -2;
      for (let gy = 1; gy < 15; gy++) for (let gx = 1; gx < 15; gx++) {
        const t = tone(gx * w / 15, gy * h / 15);
        if (t < 0) continue;
        if (t < lo) lo = t; if (t > hi) hi = t;
      }
      const flatRegion = hi - lo < 0.12;
      if (kind === 'cross') {
        if (flatRegion) { straight(0, 0.5, 1.61); straight(86, 0.5, 1.61); }
        else {
          wrap(0, 0.12, 2.10);
          [[20, 0.36, 1.75], [90, 0.56, 1.54], [56, 0.76, 1.33]].forEach(a => straight(a[0], a[1], a[2]));
        }
      } else {
        if (flatRegion) { straight(0, 0.5, 1.96); straight(4, 0.5, 1.96); }
        else [0.12, 0.36, 0.56, 0.76].forEach((tau, i) => wrap(i, tau, 2.17));
      }
    }

    /* THE OUTLINE IS MADE OF THE MARKS TOO, and it is two arcs with a gap in
       them because a hand does not close a contour in one unbroken pass. Only
       if the region can hand back points: `edge` is path data and a hand cannot
       ink a string. */
    if (region.rings) region.rings(0.45).forEach(o => {
      const n = o.length;
      if (n < 6) return;
      if (kind === 'random') {
        for (let i = 0; i < Math.round(n * 1.2); i++) {
          const j = Math.floor(rnd() * n), m = 3 + Math.floor(rnd() * 4);
          ink(o.slice(j, j + m).map(q => q.slice()));
        }
      } else {
        const c0 = Math.floor(rnd() * n), c1 = (c0 + Math.floor(n * (0.42 + rnd() * 0.16))) % n;
        const seg = (a, b) => { const q = []; for (let i = a; i !== b; i = (i + 1) % n) q.push(o[i]); return q; };
        [seg(c0, c1), seg(c1, c0)].forEach(q => { if (q.length > 4) ink(q); });
      }
    });
    return { paths: out, nib };
  }

  /* THE ONLY THREE NAMES ANYTHING OUTSIDE THIS FILE MAY USE. Kept as three
     objects rather than one because they are three different things to be:
     KIT is what a subject is made of, HANDS is a look, HATCH is a machine. */
  global.KIT   = KIT;
  global.HANDS = { draw, drawShape, fill };
  global.HATCH = { scanlines, stitch, cut, toPoly, mm2: f, ends, dist,
                   streamlines, squiggle, spaceFill, labyrinth, toneField };

})(typeof window !== 'undefined' ? window : globalThis);
