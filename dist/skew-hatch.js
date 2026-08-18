/* ─────────────────────────────────────────────────────────────────────────────
   skew-hatch.js — GENERATED. DO NOT HAND-EDIT.

     source   ../src/skew-hatch.js
     at       Skew v1.34.0
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

  return { rng, noise, clamp01, norm, cross, plen, scene, blob,
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
    const free = runs.map(ends), used = new Array(free.length).fill(false);
    const out = [];
    for (let n = 0; n < free.length; n++) {
      if (used[n]) continue;
      used[n] = true;
      const cur = free[n].slice();
      for (;;) {
        const p = cur[cur.length - 1];
        const cand = [];
        for (let j = 0; j < free.length; j++) {
          if (used[j]) continue;
          cand.push([dist(p, free[j][0]), j, 0], [dist(p, free[j][1]), j, 1]);
        }
        cand.sort((a, b) => a[0] - b[0]);
        let hit = null, br = null;
        for (const c of cand) {
          br = bridge(p, free[c[1]][c[2]]);
          if (br) { hit = c; break; }
        }
        if (!hit) break;
        used[hit[1]] = true;
        cur.push(...br, free[hit[1]][1 - hit[2]]);
      }
      out.push(cur);
    }
    return out;
  }

  /* THE CONNECTOR IS A LINE THE PEN ACTUALLY DRAWS, so "is the gap short
     enough" is only half the test. It also has to stay inside the region being
     filled — skip that and the fill grows whiskers across the white paper
     between its islands, which is worse than the lift it saved. */
  const cut = (reach, inside) => (a, b) => {
    if (dist(a, b) > reach) return null;
    for (let i = 1; i < 5; i++) {
      const u = i / 5;
      if (!inside(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)) return null;
    }
    return [b];
  };

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

  /* THE ONLY THREE NAMES ANYTHING OUTSIDE THIS FILE MAY USE. Kept as three
     objects rather than one because they are three different things to be:
     KIT is what a subject is made of, HANDS is a look, HATCH is a machine. */
  global.KIT   = KIT;
  global.HANDS = { draw, drawShape };
  global.HATCH = { scanlines, stitch, cut, toPoly, mm2: f, ends, dist };

})(typeof window !== 'undefined' ? window : globalThis);
