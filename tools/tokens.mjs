// ─────────────────────────────────────────────────────────────────────────────
// THE TOKEN MANIFEST — src/skew.css, resolved, in three shapes.
//
// WHY THIS EXISTS, AND IT IS NOT "SO APPS CAN THEME IN JSON".
//
// Three apps are adopting this language and ALL THREE ADOPT BY VALUES, NOT BY
// STYLESHEET. targz-launchpad2 and Terminass are Rust eframe/egui: no CSS, no
// HTML, no DOM, and nothing in them can ever load skew.css. Both have already
// transcribed the dark palette into their own `src/theme.rs` BY HAND, twice,
// independently — and both have drifted from it and from each other.
// TargzPenPlotterCtrl is Electron and could load the sheet, except its markup is
// `.cd-*` plus Metro4 and no Skew class name matches any of it, so every
// component rule would match nothing.
//
// So `dist/` — three files an app copies — is the wrong unit of adoption for all
// three. The right one is a resolved manifest: every `var()` followed, every
// `color-mix()` computed, every composite broken into the primitives a renderer
// with no CSS can actually draw.
//
// ── WHAT "RESOLVED" MEANS HERE ───────────────────────────────────────────────
// A token's value in this file can be a chain — `--ring` reads `--led`, `--case`
// reads `--card`, `--font-read` reads `--font` — and the chain's ANSWER differs
// per skin, because the light skin redefines the far end of it. A consumer that
// cannot run CSS cannot follow that chain, so this does it for them, once per
// skin, and emits the leaf.
//
// ── WHAT "PRIMITIVES" MEANS ──────────────────────────────────────────────────
// egui has no inset box-shadow, no CSS gradient and no text-shadow. `--recess`
// is nine shadow layers and `--chamfer` is a four-stop gradient at 152°, and
// both already exist a second time in Terminass as procedural painter code
// (theme.rs:215-228 and 274-305) written by reading the CSS and translating it
// by eye. So a shadow is emitted as its LAYERS — offset, blur, spread, colour,
// inset — and a gradient as its ANGLE and its STOPS. That is the form the port
// is already in; it stops being a translation and becomes a transcription.
//
// ── THE THREE OUTPUTS ────────────────────────────────────────────────────────
//   dist/skew-tokens.json  the source of truth. Both skins, typed, with the raw
//                          declaration kept beside the resolved value so a
//                          disagreement can be traced without opening the CSS.
//   dist/skew_tokens.rs    ONE STRUCT, TWO VALUES — not `pub const` per colour.
//                          A const cannot switch at runtime, and a light mode in
//                          either Rust app is a palette the app SELECTS at
//                          startup. The struct is the mechanism by which those
//                          two apps get a light skin at all; loose constants
//                          would have made it impossible by construction.
//                          Both apps build in .github/workflows and CI cannot
//                          see a sibling folder, so this is a file they vendor.
//   dist/skew-tokens.js    the same, with colours ALSO as normalised 0-1
//                          triplets, because the plotter's layer palette and its
//                          toolpath colours feed a WebGL vertex buffer and can
//                          never be tokenised in CSS alone. It also sidesteps
//                          the Electron 23 / Chromium 110 problem entirely: that
//                          build drops every `color-mix()` declaration silently,
//                          and here they are already computed.
// ─────────────────────────────────────────────────────────────────────────────

/* ── READING THE DECLARATIONS ────────────────────────────────────────────────
   Only two blocks are read: `:root{…}` and `[data-skin="light"]{…}`. Custom
   properties declared anywhere else in the file are deliberately NOT tokens —
   `--wall` and `--chamf` are set per element so one rule can serve two colours,
   and `--lyr` is a layer's own ink pushed in from JS. Those are parameters, not
   values, and a manifest that exported them would be exporting a mechanism. */
function blockOf(css, selector) {
  const i = css.indexOf(selector + '{');
  const j = i < 0 ? -1 : css.indexOf(selector + ' {');
  const at = i >= 0 ? i : j;
  if (at < 0) return '';
  let depth = 0, start = -1;
  for (let k = at; k < css.length; k++) {
    if (css[k] === '{') { if (depth === 0) start = k + 1; depth++; }
    else if (css[k] === '}') { depth--; if (depth === 0) return css.slice(start, k); }
  }
  return '';
}

/* A declaration can run over many lines — `--recess` is nine — so this walks to
   the semicolon rather than to the newline, and skips the ones inside comments
   by stripping comments first. Comments in this file contain example CSS. */
function declsOf(block) {
  const clean = block.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = new Map();
  const re = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(clean))) out.set(m[1], m[2].trim().replace(/\s+/g, ' '));
  return out;
}

/* ── FOLLOWING THE CHAIN ─────────────────────────────────────────────────────
   `var(--x, fallback)` where the fallback may itself contain a var, and the
   whole thing may be nested inside a `color-mix()`. Resolved innermost-first by
   repeated substitution, with a depth cap because a cycle in a stylesheet is a
   bug that should be reported rather than a stack overflow. */
function resolve(value, lookup, seen = new Set(), depth = 0) {
  if (depth > 24) return value;
  let out = '';
  for (let i = 0; i < value.length; i++) {
    if (value.startsWith('var(', i)) {
      let d = 0, j = i;
      for (; j < value.length; j++) {
        if (value[j] === '(') d++;
        else if (value[j] === ')') { d--; if (!d) break; }
      }
      const inner = value.slice(i + 4, j);
      const comma = splitTop(inner);
      const name = comma[0].trim();
      const fallback = comma.slice(1).join(',').trim();
      let got = lookup.has(name) && !seen.has(name) ? lookup.get(name) : null;
      if (got != null) got = resolve(got, lookup, new Set([...seen, name]), depth + 1);
      else if (fallback) got = resolve(fallback, lookup, seen, depth + 1);
      else got = `var(${name})`;          // genuinely undefined — kept, visibly
      out += got;
      i = j;
    } else out += value[i];
  }
  return out;
}

/* Split on top-level commas only — `color-mix(in srgb, a, b)` inside a shadow
   list is one layer, not three. */
function splitTop(s, sep = ',') {
  const out = [];
  let d = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') d++;
    else if (ch === ')') d--;
    if (ch === sep && d === 0) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

/* ── COLOUR ──────────────────────────────────────────────────────────────────
   Everything becomes {r,g,b,a} with 0-255 channels and a 0-1 alpha, which is the
   one shape all three consumers want: hex for CSS, Color32::from_rgba_unmultiplied
   for egui, and 0-1 floats for a WebGL vertex buffer. */
const NAMED = { transparent: [0, 0, 0, 0], white: [255, 255, 255, 1], black: [0, 0, 0, 1] };

function parseColor(v) {
  v = v.trim();
  if (NAMED[v]) { const [r, g, b, a] = NAMED[v]; return { r, g, b, a }; }

  let m = /^#([0-9a-f]{3,8})$/i.exec(v);
  if (m) {
    const h = m[1];
    const ex = h.length <= 4 ? h.split('').map(c => c + c).join('') : h;
    const n = (i) => parseInt(ex.slice(i * 2, i * 2 + 2), 16);
    return { r: n(0), g: n(1), b: n(2), a: ex.length === 8 ? n(3) / 255 : 1 };
  }

  m = /^rgba?\(([^)]+)\)$/i.exec(v);
  if (m) {
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0] | 0, g: p[1] | 0, b: p[2] | 0, a: p.length > 3 ? p[3] : 1 };
  }

  /* `color-mix(in srgb, A P%, B)` — the only form this file uses, 67 times, and
     the one Chromium 110 drops on the floor. Mixed in straight sRGB with the
     alphas carried, which is what the spec says for this syntax and what the
     browsers this language is drawn in actually do. */
  m = /^color-mix\(\s*in\s+srgb\s*,([\s\S]+)\)$/i.exec(v);
  if (m) {
    const parts = splitTop(m[1]).map(s => s.trim());
    if (parts.length !== 2) return null;
    const read = (s) => {
      const pm = /^(.*?)\s+([\d.]+)%$/.exec(s);
      return pm ? { c: parseColor(pm[1]), w: parseFloat(pm[2]) / 100 }
                : { c: parseColor(s), w: null };
    };
    const a = read(parts[0]), b = read(parts[1]);
    if (!a.c || !b.c) return null;
    let wa = a.w, wb = b.w;
    if (wa == null && wb == null) { wa = wb = 0.5; }
    else if (wa == null) wa = 1 - wb;
    else if (wb == null) wb = 1 - wa;
    const t = wa + wb || 1;
    wa /= t; wb /= t;
    return {
      r: Math.round(a.c.r * wa + b.c.r * wb),
      g: Math.round(a.c.g * wa + b.c.g * wb),
      b: Math.round(a.c.b * wa + b.c.b * wb),
      a: +(a.c.a * wa + b.c.a * wb).toFixed(4),
    };
  }
  return null;
}

const hex = (c) => '#' + [c.r, c.g, c.b].map(n => n.toString(16).padStart(2, '0')).join('')
  + (c.a < 1 ? Math.round(c.a * 255).toString(16).padStart(2, '0') : '');

/* ── COMPOSITES ──────────────────────────────────────────────────────────────
   A shadow layer in CSS order is `[inset] x y [blur] [spread] colour`, with the
   colour at either end. Emitted as numbers plus a colour, because the Rust side
   draws it as a rect or a line and needs the offsets, not the string. */
function parseShadow(v) {
  return splitTop(v).map(raw => {
    const s = raw.trim();
    const inset = /(^|\s)inset(\s|$)/.test(s);
    const body = s.replace(/(^|\s)inset(\s|$)/, ' ').trim();
    const lens = [];
    let colour = null;
    for (const tok of splitTop(body, ' ').map(t => t.trim()).filter(Boolean)) {
      if (/^-?[\d.]+(px|em|rem)?$/.test(tok)) lens.push(parseFloat(tok));
      else if (!colour) colour = parseColor(tok);
    }
    const [x = 0, y = 0, blur = 0, spread = 0] = lens;
    return { inset, x, y, blur, spread, color: colour ? hex(colour) : null,
             rgba: colour || null };
  });
}

/* A gradient as its angle and its stops. `at 50% 50%` radials keep their shape
   string, because a renderer that cannot draw one needs to know that rather
   than be handed numbers that imply it can. */
function parseGradient(v) {
  const m = /^(linear|radial|conic|repeating-linear|repeating-radial)-gradient\(([\s\S]+)\)$/.exec(v.trim());
  if (!m) return null;
  const parts = splitTop(m[2]).map(s => s.trim());
  let angle = null, shape = null, from = 0;
  if (/^-?[\d.]+deg$/.test(parts[0])) { angle = parseFloat(parts[0]); from = 1; }
  else if (/^(to |circle|ellipse|[\d.]+%|at )/.test(parts[0])) { shape = parts[0]; from = 1; }
  const stops = parts.slice(from).map(s => {
    const pm = /^([\s\S]+?)((?:\s+-?[\d.]+%)+)$/.exec(s);
    const col = parseColor((pm ? pm[1] : s).trim());
    const pos = pm ? pm[2].trim().split(/\s+/).map(parseFloat) : [];
    return { color: col ? hex(col) : (pm ? pm[1] : s).trim(), rgba: col || null, at: pos };
  });
  return { kind: m[1], angle, shape, stops };
}

/* ── CLASSIFY ────────────────────────────────────────────────────────────────
   The type is what tells a consumer which field to read. A length is a number
   and a unit because egui wants the number; a colour is a hex and an rgba
   because CSS wants one and a vertex buffer wants the other. */
function classify(name, raw, resolved) {
  const v = resolved.trim();
  if (/^(linear|radial|conic|repeating-)/.test(v)) {
    return { type: 'gradient', gradient: parseGradient(v) };
  }
  if (/\b(inset\s)?-?\d+(\.\d+)?px\s+-?\d+/.test(v) && /(rgba?\(|#|color-mix)/.test(v)) {
    return { type: 'shadow', layers: parseShadow(v) };
  }
  const c = parseColor(v);
  if (c) return { type: 'color', hex: hex(c), rgba: c, rgb01: [c.r / 255, c.g / 255, c.b / 255, c.a] };
  if (/^-?[\d.]+(px|em|rem|ms|s)$/.test(v)) {
    const unit = /[a-z]+$/.exec(v)[0];
    return { type: 'length', value: parseFloat(v), unit };
  }
  if (/^-?[\d.]+$/.test(v)) return { type: 'number', value: parseFloat(v) };
  if (/^(url\(|")/.test(v) || name.startsWith('--font')) return { type: 'string', value: v };
  return { type: 'raw', value: v };
}

/* ── THE MANIFEST ────────────────────────────────────────────────────────────
   The light skin INHERITS: a token it does not redeclare keeps the dark value,
   which is exactly what the cascade does and exactly what both hand-ported
   theme.rs files got wrong in places. Built by layering light over dark rather
   than by reading the light block alone. */
export function manifest(css) {
  const dark = declsOf(blockOf(css, ':root'));
  const lightOnly = declsOf(blockOf(css, '[data-skin="light"]'));
  const light = new Map([...dark, ...lightOnly]);

  const build = (decls, lookup) => {
    const out = {};
    for (const [name, raw] of decls) {
      if (name === '--grain') continue;   // 1.4KB of inline SVG; see note below
      const resolved = resolve(raw, lookup);
      out[name] = { raw, resolved, ...classify(name, raw, resolved) };
    }
    return out;
  };

  return {
    skins: {
      dark:  build(dark, dark),
      light: build(light, light),
    },
    /* NAMED SO NOBODY GOES LOOKING. `--grain` is a 1.4KB data: URI of an SVG
       turbulence filter, and neither Rust app has a grain at all — the two of
       them are the only ungrained surfaces in the family. Shipping it as a
       token would be shipping a string no consumer of this file can use;
       whether its absence over there is a gap or correct is a question for the
       intent document, not for a manifest. */
    omitted: ['--grain'],
    overridden: [...lightOnly.keys()].filter(k => dark.has(k)),
    lightOnly: [...lightOnly.keys()].filter(k => !dark.has(k)),
  };
}

/* ── RUST ────────────────────────────────────────────────────────────────────
   One struct, two values. The field list is the UNION of both skins, so the two
   palettes are the same type and an app can hold `Palette` in its state and swap
   it — which is the entire point, and the reason this is not a wall of
   `pub const`. A const is chosen at compile time; a skin is chosen at runtime.

   Only colours and lengths become fields. A shadow and a gradient are emitted
   as their own structs beside the palette, because a nine-layer inset stack is
   not a value egui can hold — it is a drawing routine, and the numbers are what
   that routine needs. */
const rustName = (n) => n.replace(/^--/, '').replace(/-/g, '_');

/* The same file is emitted twice: into `dist/`, for an app that vendors a copy,
   and into `rust/skew-egui/src/tokens.rs`, where the crate reads it as a module.
   Only this paragraph of the header differs, because only the answer to "where
   did this come from and may I edit it" differs. */
export const VENDOR_NOTE = `// VENDOR THIS FILE. An adopting Rust app that does not take the skew-egui
// crate builds in .github/workflows and CI cannot see a sibling folder, so this
// is copied in and committed, not linked. If you DO take the crate, you get the
// same values as \`skew_egui::tokens\` and this file is not yours to copy.`;

export const CRATE_NOTE = `// THIS IS THE skew-egui CRATE'S OWN COPY — \`skew_egui::tokens\`. It is written
// by the generator, not by hand, and \`node tools/build-dist.mjs --write\` will
// overwrite it. The identical file is emitted to dist/skew_tokens.rs for apps
// that vendor values without taking the crate.`;

export function toRust(man, version, vendorNote = VENDOR_NOTE) {
  const skins = man.skins;
  const names = [...new Set([...Object.keys(skins.dark), ...Object.keys(skins.light)])].sort();
  const colors = names.filter(n => (skins.light[n] || skins.dark[n]).type === 'color');
  const lens = names.filter(n => (skins.light[n] || skins.dark[n]).type === 'length');
  const nums = names.filter(n => (skins.light[n] || skins.dark[n]).type === 'number');

  /* ── A TOKEN IN ONE SKIN AND NOT THE OTHER IS AN `Option`, NOT A DEFAULT ───
     The two skins do not name the same parts. `--card` and `--case-face` exist
     only in light; `--plate` and `--groove` only in dark — the dark theme calls
     the same surfaces something else, because it was written first and the
     light skin is an island appended to it. Filling the gap with a transparent
     Color32 would hand the Rust side a field that silently draws nothing, which
     is the worst of the three options: it compiles, it runs, and the part is
     invisible. `None` makes the absence a thing the caller has to answer for.
     The field list is the UNION so both palettes stay one type. */
  const both = (n) => skins.dark[n] && skins.light[n];

  const colorLit = (t) =>
    `Color32::from_rgba_unmultiplied(${t.rgba.r}, ${t.rgba.g}, ${t.rgba.b}, ${Math.round(t.rgba.a * 255)})`;

  const body = (skin) => {
    const S = skins[skin];
    const val = (n, lit) => both(n) ? lit(S[n]) : (S[n] ? `Some(${lit(S[n])})` : 'None');
    return [
      ...colors.map(n => `            ${rustName(n)}: ${val(n, colorLit)},`),
      ...lens.map(n => `            ${rustName(n)}: ${val(n, t => t.value.toFixed(1))},`),
      ...nums.map(n => `            ${rustName(n)}: ${val(n, t => t.value.toFixed(3))},`),
    ].join('\n');
  };

  const shadowOf = (skin, n) => {
    const t = man.skins[skin][n];
    if (!t || t.type !== 'shadow') return null;
    return t.layers.map(l =>
      `            ShadowLayer { inset: ${l.inset}, x: ${l.x.toFixed(1)}, y: ${l.y.toFixed(1)}, `
      + `blur: ${l.blur.toFixed(1)}, spread: ${l.spread.toFixed(1)}, `
      + `color: ${l.rgba ? `Color32::from_rgba_unmultiplied(${l.rgba.r}, ${l.rgba.g}, ${l.rgba.b}, ${Math.round(l.rgba.a * 255)})` : 'Color32::TRANSPARENT'} },`
    ).join('\n');
  };

  const shadows = names.filter(n => (skins.light[n] || skins.dark[n]).type === 'shadow');

  return `// GENERATED BY tools/build-dist.mjs — DO NOT HAND-EDIT.
//
//   source   src/skew.css
//   at       Skew v${version}
//   rebuild  node tools/build-dist.mjs --write
//
${vendorNote}
//
// IT IS A STRUCT AND NOT A WALL OF \`pub const\`, DELIBERATELY. A const is chosen
// when the binary is built; a skin is chosen when the app starts. Hold a
// \`Palette\` in your state, select it once, and a light mode is a value — which
// is the only form in which an egui app can have one at all.
//
// WHAT IS NOT HERE: anything that is a drawing rather than a value. The recess
// and the chamfer are emitted as their layers and stops below, because egui has
// no inset shadow and no gradient; your painter code already knows how to turn
// those numbers into lines and meshes, and this stops it being a translation of
// a stylesheet you have to read.

use egui::Color32;

#[derive(Clone, Copy, Debug)]
pub struct ShadowLayer {
    pub inset: bool,
    pub x: f32,
    pub y: f32,
    pub blur: f32,
    pub spread: f32,
    pub color: Color32,
}

#[derive(Clone, Copy, Debug)]
pub struct Palette {
${colors.map(n => `    pub ${rustName(n)}: ${both(n) ? 'Color32' : 'Option<Color32>'},`).join('\n')}
${lens.map(n => `    pub ${rustName(n)}: ${both(n) ? 'f32' : 'Option<f32>'},`).join('\n')}
${nums.map(n => `    pub ${rustName(n)}: ${both(n) ? 'f32' : 'Option<f32>'},`).join('\n')}
}

impl Palette {
    pub fn dark() -> Self {
        Palette {
${body('dark')}
        }
    }

    pub fn light() -> Self {
        Palette {
${body('light')}
        }
    }
}

${shadows.map(n => {
  const d = shadowOf('dark', n), l = shadowOf('light', n);
  const fn = rustName(n);
  /* ── A SHADOW IS A `Vec`, NOT A `&'static [..]` ──────────────────────────
     The first cut of this emitter returned `&'static [ShadowLayer]` from a
     `&[ ... ]` literal and did not compile: rvalue static promotion gives up as
     soon as a layer list is empty-or-not per skin and the slice is built in the
     function body, so rustc reports E0515 — returning a reference to a local
     temporary. Both adopting apps hit it and TargzPenPlotterCtrl hand-patched
     its vendored copy to `Vec`, which is the fix, applied here so the generated
     file compiles as it is shipped. A shadow is read once when a part is
     painted; an allocation of at most nine layers is not the cost that matters. */
  return `pub fn ${fn}_dark() -> Vec<ShadowLayer> {
    vec![
${d || ''}
    ]
}

pub fn ${fn}_light() -> Vec<ShadowLayer> {
    vec![
${l || d || ''}
    ]
}`;
}).join('\n\n')}
`;
}

/* ── JS ──────────────────────────────────────────────────────────────────────
   Colours twice: as hex, for anything that still writes CSS, and as normalised
   0-1 quadruplets, because the plotter's layer palette and its toolpath colours
   go straight into a WebGL vertex buffer and a hex string cannot. */
export function toJs(man, version) {
  const pick = (skin) => {
    const S = man.skins[skin], out = {};
    for (const [n, t] of Object.entries(S)) {
      out[n] = t.type === 'color' ? { hex: t.hex, rgb01: t.rgb01 }
            : t.type === 'length' ? t.value
            : t.type === 'number' ? t.value
            : t.type === 'shadow' ? t.layers
            : t.type === 'gradient' ? t.gradient
            : t.value;
    }
    return out;
  };
  return `/* GENERATED BY tools/build-dist.mjs — DO NOT HAND-EDIT.
   source src/skew.css · Skew v${version} · rebuild: node tools/build-dist.mjs --write

   COLOURS ARE HERE TWICE AND THAT IS THE POINT. \`hex\` for anything still
   writing CSS; \`rgb01\` for a WebGL vertex buffer, which is where the plotter's
   layer palette and its toolpath colours actually go and which a hex string
   cannot reach.

   EVERY color-mix() IS ALREADY COMPUTED. Electron 23 is Chromium 110 and
   color-mix() landed in 111, so those 67 declarations are dropped silently in
   that runtime — per property, with no error. Reading values from here instead
   of from the sheet sidesteps that entirely. */
export const SKEW_VERSION = ${JSON.stringify(version)};
export const SKEW_TOKENS = ${JSON.stringify({ dark: pick('dark'), light: pick('light') }, null, 2)};
export default SKEW_TOKENS;
`;
}
