// ─────────────────────────────────────────────────────────────────────────────
// BUILD dist/ — the two files an app copies.
//
//   node tools/build-dist.mjs           report whether dist/ matches the source
//   node tools/build-dist.mjs --write   rebuild it
//
// WHY dist/ EXISTS. src/ is where the language is written and dist/ is what an
// app copies, and they are different files on purpose: src/skew.css carries this
// documentation site's own rules, and src/skew-kit.js is a plain script that
// cannot be loaded beside p5 without colliding. dist/ is those two problems
// solved, once, by a program rather than by remembering.
//
// IT IS GENERATED AND NEVER HAND-EDITED, which is the whole reason it is allowed
// to exist at all. A third copy of a stylesheet is a third thing to keep in sync
// unless a program owns it, and then it is a build output. Edit src/; run this;
// commit both.
//
//   src/     what you edit
//   dist/    what an app copies
//   docs/    the four pages, which read src/ so the site cannot document a
//            version of the language nobody ships
//
// ── WHAT THE CSS BUILD DOES, AND WHAT IT DELIBERATELY DOES NOT ───────────────
// It removes the documentation site's own rules and nothing else. It does NOT
// try to work out which parts your app uses — that judgement needs your code, it
// belongs in your repo, and it already exists there: `tools/kit-css.mjs` in
// Portrait-Typo and Portrait-ribbons reads the class names its own app writes and
// pulls only those rules. This build is the input to that, not a replacement.
//
// So dist/skew.css is barely smaller than src/skew.css, and that is correct. The
// win is not bytes, it is that copying it cannot bring the doc site's `.wrap`,
// `.spec` and `.mat` into your app.
//
// AN EXCLUDE LIST, NOT AN INCLUDE LIST, AND THAT DIRECTION IS THE POINT. An
// include list is built by scanning the kit's code for the class names it writes,
// and the scan misses the ones only the CSS knows: `.knob-ring`, `.kr-track`,
// `.rot-leads` are inner parts no line of JS names. Typo's extractor documents
// exactly this failure — the controls still build, still work, and render as flat
// black discs, because a missing rule does not throw. Over-including costs bytes.
// Under-including costs a control, silently. So the list below is the doc site,
// which is short, closed, and lives in this repo where it can be checked.
//
// ── WHAT THE JS BUILD DOES ───────────────────────────────────────────────────
// One transformation: the source is a plain script whose factories are top-level
// `const`s, written for a page that loads nothing else. An app loads p5 in global
// mode, and a top-level `const key` beside p5's own global `key` is a collision
// that does not throw and does not surface until something reads the wrong one.
// So the body is wrapped in an IIFE and the API is published on `window.SkewKit`.
// The BODY is byte-identical to the source; the wrapper is a few lines at each
// end plus the export list, which is what lets the check below be exact.
//
// Both adopting apps wrote this wrapper themselves, separately. That is the
// signal it belongs here.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const WRITE = process.argv.includes('--write');

/* ── THE DOC SITE, ENUMERATED ─────────────────────────────────────────────────
   A rule is dropped when EVERY selector in it is doc-only. A rule that styles
   `.mat .knob` is kept, because the second half is a part and dropping the rule
   would take a part's geometry with it.

   `.dock`, `.skip` and the `.nav-*` family are NOT here and that is deliberate:
   they read like chrome and they are parts. Portrait-Typo's `src/navbar.js` is
   the nav bar with that app's registry in it, and an app wants a skip link as
   much as this page does. */
const DOC_ONLY = new Set([
  'orbench',          // the glass tuning bench on SYSTEM 12 — no app gets it

  'wrap', 'masthead', 'lede', 'sub', 'spec', 'tok', 'trap',
  'mats', 'mat', 'mat-body', 'mat-d', 'mat-keys', 'mat-row', 'mat-stage', 'mat-t',
  'tab-cap', 'tab-cell', 'tab-demo', 'tab-pair', 'tab-sub',
  'doc', 'doc-body', 'doc-file', 'doc-foot', 'doc-grid', 'doc-kick', 'doc-line',
  'doc-list', 'doc-open',
  'paper', 'paper-lab', 'papers', 'archive', 'arch-link',
  'klayouts', 'deskdemo', 'matstage', 'matbulge', 'setrow', 'gridout',
  'intrig', 'intcell', 'intcell-cap', 'intcell-wrap',
  'togrig', 'togcell',
  'gridbody', 'gridrow', 'gridcol', 'gridswatch', 'gridmoved',
  'loupe', 'loupe-glass', 'loupe-mark',
  'detail', 'detail-tab', 'detail-nm', 'detail-n',
  'lightroom', 'ground', 'ground-nm', 'ground-z', 'ground-marks', 'ground-plate', 'ground-cut',
  'leadstub', 'capmap-sheet', 'capmap-key',
  'bp', 'bp-view', 'bp-legend', 'bp-lead', 'bp-dim', 'bp-dim-hot', 'bp-out',
  'bp-tick', 'bp-dash', 'bp-lit', 'bp-hatch', 'bp-thin', 'bp-break', 'bp-zig',
  'bp-part', 'bp-note', 'bp-plus', 'benchpanels', 'benchpanel', 'capsblock', 'xray', 'xraykey',
  'bp-fill-bay', 'bp-fill-hole', 'bp-fill-face', 'bp-fill-front', 'bp-fill-spec',
]);

/* ── A BRACE WALKER, BECAUSE A REGEX CANNOT DO THIS ───────────────────────────
   Selectors contain braces in `:is()` and `[attr="{"]`, at-rules nest, and the
   whole file is inside `@layer skew`. Walking is the only way that stays right
   when the source grows a construct nobody predicted. */
function blocks(css) {
  const out = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) { out.push({ pre: css.slice(i), body: null }); break; }
    let d = 0, j = open;
    for (; j < css.length; j++) {
      if (css[j] === '{') d++;
      else if (css[j] === '}') { d--; if (d === 0) break; }
    }
    out.push({ pre: css.slice(i, open), body: css.slice(open + 1, j) });
    i = j + 1;
  }
  return out;
}

const classesIn = sel => (sel.match(/\.[a-zA-Z][\w-]*/g) || []).map(s => s.slice(1));

/* A SELECTOR IS DOC-ONLY WHEN IT NAMES A DOC CLASS AND NO OTHER CLASS. That is
   the narrow test on purpose: `.mat .knob` names one of each and stays. */
const docOnlySelector = (sel) => {
  const c = classesIn(sel);
  return c.length > 0 && c.every(x => DOC_ONLY.has(x));
};

function strip(css) {
  let kept = '', dropped = 0;
  for (const { pre, body } of blocks(css)) {
    if (body === null) { kept += pre; continue; }
    /* THE COMMENT COMES OFF BEFORE THE HEAD IS READ, and this is the bug the
       first run shipped: every block in this file is preceded by its banner
       comment, so `pre` for the whole stylesheet was 20 lines of prose ending
       in `@layer skew`. Tested with `startsWith('@')` that is not an at-rule,
       it is a selector, and the entire file came through as one rule nobody
       could look inside. `pre` is still emitted verbatim — the comments are
       half of what this file is. */
    const head = pre.replace(/\/\*[\s\S]*?\*\//g, '').trim();

    /* At-rules recurse: a @media full of doc rules should lose the rules and
       keep the query, and a @media that empties out goes entirely. */
    if (head.startsWith('@') && /^@(media|supports|layer|container)/.test(head)) {
      const inner = strip(body);
      dropped += inner.dropped;
      if (inner.css.trim()) kept += pre + '{' + inner.css + '}';
      else dropped++;
      continue;
    }
    if (head.startsWith('@')) { kept += pre + '{' + body + '}'; continue; }

    const sels = head.split(',').map(s => s.trim()).filter(Boolean);
    const live = sels.filter(s => !docOnlySelector(s));
    if (!live.length) { dropped++; continue; }
    kept += (live.length === sels.length ? pre : '\n' + live.join(',\n') + ' ') + '{' + body + '}';
  }
  return { css: kept, dropped };
}

/* ── THE KIT'S PUBLIC SURFACE ─────────────────────────────────────────────────
   Written out rather than derived, because this is an API decision and an API
   decision should be a line somebody chose. Anything not here is internal and an
   app reaching for it is reaching past the boundary. */
const API = [
  'el', 'svg', 'eng', 'ICON', 'ENG',
  'knob', 'fader', 'rangeFader', 'rotary', 'drum', 'gizmo', 'orbit', 'orbitBay', 'lightDir', 'selector', 'gate', 'keyBank',
  'key', 'pkey', 'swBtn', 'toggle', 'chevBtn', 'assetRow',
  'openPicker', 'openPlate', 'menu', 'plateKey', 'appDock', 'MODKEY',
  'typeable', 'engage', 'windowise', 'WIN_ICON',
  'hex2rgb', 'rgb2hex', 'rgb2hsv', 'hsv2rgb',
  'RING_R', 'RING_C', 'CAP_W', 'panelShape', 'ORBIT_AX',
  'SFX', 'clicky',
];

/* THE VERSION IS IMPORTED, NOT GREPPED, AND THAT IS THE WHOLE REASON THIS IS
   ASYNC. A regex over the file reported a perfectly good version number out of
   a file that had stopped parsing — a doubled `],` left by an edit — so every
   build said `clean at v1.28.0` while the nav bar on all four pages sat at its
   `v—` placeholder, because the pages read it with a dynamic import and the
   import was throwing. The build has to fail the way the page fails. */
const version = async () => {
  const url = pathToFileURL(path.join(ROOT, 'version.js')).href;
  try {
    const m = await import(url + '?t=' + fs.statSync(path.join(ROOT, 'version.js')).mtimeMs);
    if (!m.version) throw new Error('no `version` export');
    return m.version;
  } catch (e) {
    console.error('version.js does not parse — the nav bar will read v—');
    console.error('  ' + e.message);
    process.exit(1);
  }
};

const banner = (src, v) => `/* ─────────────────────────────────────────────────────────────────────────────
   ${src} — GENERATED. DO NOT HAND-EDIT.

     source   ../src/${src}
     at       Skew v${v}
     rebuild  node tools/build-dist.mjs --write

   A patch applied here disappears at the next build, silently, and the way you
   find out is that a control stops matching the reference. Change the source.
   ───────────────────────────────────────────────────────────────────────────── */
`;

function buildJs(v) {
  const src = fs.readFileSync(path.join(ROOT, 'src/skew-kit.js'), 'utf8');
  return banner('skew-kit.js', v)
    + '(function () {\n'
    + "'use strict';\n\n"
    + src
    + `\n\nwindow.SkewKit = {\n  ${API.join(', ')},\n  VERSION: '${v}',\n};\n})();\n`;
}

function buildCss(v) {
  const src = fs.readFileSync(path.join(ROOT, 'src/skew.css'), 'utf8');
  const { css, dropped } = strip(src);
  return { text: banner('skew.css', v) + css, dropped };
}

const v = await version();
const js = buildJs(v);
const { text: css, dropped } = buildCss(v);

/* THE HATCH ENGINE IS COPIED, NOT BUILT. It is already a self-contained IIFE
   that touches nothing but three globals, it has no doc-site rules to strip and
   no public-surface list to append — so a build step here would be a step that
   can only introduce a difference between what is tested and what ships. It
   gets the banner and nothing else. */
function buildHatch(v) {
  const src = fs.readFileSync(path.join(ROOT, 'src/skew-hatch.js'), 'utf8');
  return banner('skew-hatch.js', v) + src;
}

const targets = [
  ['dist/skew-kit.js', js],
  ['dist/skew.css', css],
  ['dist/skew-hatch.js', buildHatch(v)],
];

if (WRITE) {
  fs.mkdirSync(DIST, { recursive: true });
  for (const [rel, text] of targets) fs.writeFileSync(path.join(ROOT, rel), text);
  console.log(`wrote dist/ at v${v} · ${dropped} doc-site rules dropped from the CSS`);
} else {
  let drift = 0;
  for (const [rel, text] of targets) {
    const p = path.join(ROOT, rel);
    const have = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
    if (have === text) console.log(`  ok      ${rel}`);
    else { drift++; console.log(`  DRIFT   ${rel}${have === null ? ' (missing)' : ''}`); }
  }
  console.log(drift ? `\n${drift} file(s) stale — run with --write` : `\nclean at v${v}`);
  process.exit(drift ? 1 : 0);
}
