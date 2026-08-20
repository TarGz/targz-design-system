/* ══════════════════════════════════════════════════════════════════════════
   skew-kit.js — THE SKEW KIT, LIFTED OUT OF THE PAGE THAT GREW IT.

   Every primitive here was written for skew-layers.html and is copied
   from it VERBATIM: the icon sets, the voice bank, the knob, the two faders,
   the colour picker, the drum, the rotary, the key and the piano key, the
   panel outline and the window. Nothing was redesigned on the way out — the
   whole point of a second document is that it uses the SAME parts, and a part
   that got improved while being moved is a different part.

   ONE EDIT, AND IT IS `engage`. Its root list was a literal of that page's
   ids. It now reads `window.ENGAGE_ROOTS` at CALL time, so a second page
   declares its own roots and neither page knows about the other's.

   skew-layers.html still carries its own inline copy and is untouched.
   Two copies of a kit is a debt, and it is written down here rather than paid
   by editing a document another hand is in the middle of.
   ══════════════════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════════════════
   The icon set is Portrait-Typo's own — same paths, same stroke language.
   ══════════════════════════════════════════════════════════════════════════ */
const svg = (d, w = 24) => `<svg viewBox="0 0 ${w} ${w}" aria-hidden="true">${d}</svg>`;
const ICON = {
  plus: svg('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
  eye: svg('<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff: svg('<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'),
  cells: svg('<polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2"/><circle cx="12" cy="12" r="2.5"/>'),
  cellsOff: svg('<polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2"/><circle cx="12" cy="12" r="2.5"/><line x1="1" y1="1" x2="23" y2="23"/>'),
  ground: svg('<path d="M3 20l6-9 4 5 3-4 5 8z"/><circle cx="8" cy="6" r="2"/>'),
  groundOff: svg('<path d="M3 20l6-9 4 5 3-4 5 8z"/><line x1="3" y1="9" x2="16" y2="22"/>'),
  outline: svg('<rect x="4" y="6" width="16" height="12" rx="2"/>'),
  outlineOff: svg('<rect x="4" y="6" width="16" height="12" rx="2"/><line x1="2" y1="2" x2="22" y2="22"/>'),
  face: svg('<rect x="4" y="6" width="16" height="12" rx="2"/><line x1="7" y1="15" x2="12" y2="9"/><line x1="11" y1="15" x2="16" y2="9"/>'),
  faceOff: svg('<rect x="4" y="6" width="16" height="12" rx="2"/><line x1="7" y1="15" x2="12" y2="9"/><line x1="11" y1="15" x2="16" y2="9"/><line x1="2" y1="2" x2="22" y2="22"/>'),
  side: svg('<path d="M4 9l4-3h12v9l-4 3H4z"/><line x1="16" y1="6" x2="16" y2="15"/><line x1="17.5" y1="16.5" x2="19.5" y2="14"/>'),
  sideOff: svg('<path d="M4 9l4-3h12v9l-4 3H4z"/><line x1="16" y1="6" x2="16" y2="15"/><line x1="2" y1="2" x2="22" y2="22"/>'),
  shade: svg('<rect x="3" y="5" width="10" height="10" rx="2"/><line x1="9" y1="19" x2="21" y2="19"/><line x1="13" y1="16" x2="17" y2="16"/><line x1="15" y1="22" x2="21" y2="22"/>'),
  shadeOff: svg('<rect x="3" y="5" width="10" height="10" rx="2"/><line x1="9" y1="19" x2="21" y2="19"/><line x1="13" y1="16" x2="17" y2="16"/><line x1="2" y1="2" x2="22" y2="22"/>'),
  copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/>'),
  trash: svg('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  chev: svg('<polyline points="9 6 15 12 9 18"/>'),
  dropper: svg('<path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L9 16l-4 1 1-4z"/><line x1="13.5" y1="5.5" x2="16.5" y2="8.5"/>'),
  /* FOLLOW THE OBJECT — a tilted body with its fill tilted to match, which is
     the whole claim in one mark. The first attempt paired a generic box glyph
     on the switch with a separate engraved protractor beside it: two icons
     competing to explain one toggle, and neither of them saying "the hatch
     turns with the shape". One shape, three strokes inside it, same angle. */
  follow: svg('<path d="M4.2 9.2 13 3.6l6.8 11.2L11 20.4z"/>' +
              '<line x1="7.4" y1="11.6" x2="12.6" y2="8.3"/>' +
              '<line x1="9.6" y1="14.9" x2="14.8" y2="11.6"/>' +
              '<line x1="11.8" y1="18.2" x2="17" y2="14.9"/>'),
  clear: svg('<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="14" y2="15"/><line x1="14" y1="11" x2="10" y2="15"/>'),
};

/* ENGRAVED icons — the same set drawn for .eng rather than for a key cap.
   They are separate from ICON on purpose: an engraving is a CUT, so it takes
   the panel's shadow colour and never currentColor, and the shapes have to be
   open enough that a 1px light line under them still reads. A filled glyph
   engraves as a blob. Each one is the PARAMETER, not a metaphor for it:
   spacing is literally two rules with a gap measured between them. */
const eng = d => `<svg class="eng" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ENG = {
  // two parallel rules with the gap arrow between them
  spacing: eng('<line x1="3" y1="5" x2="21" y2="5"/><line x1="3" y1="19" x2="21" y2="19"/>' +
               '<line x1="12" y1="8" x2="12" y2="16"/>' +
               '<polyline points="9.5 10.5 12 8 14.5 10.5"/><polyline points="9.5 13.5 12 16 14.5 13.5"/>'),
  // a pen tip in section — the barrel tapering to the nib, with the slit
  nib: eng('<path d="M9 3h6l-1 9-2 9-2-9-1-9z"/><line x1="12" y1="8" x2="12" y2="17"/>' +
           '<line x1="9.4" y1="12" x2="14.6" y2="12"/>'),
  // a short dash with end caps: the shortest mark that survives
  minstroke: eng('<line x1="8" y1="12" x2="16" y2="12"/>' +
                 '<line x1="8" y1="8.5" x2="8" y2="15.5"/><line x1="16" y1="8.5" x2="16" y2="15.5"/>'),
  // two dashes and the arc that bridges them
  joinreach: eng('<line x1="2.5" y1="15" x2="8.5" y2="15"/><line x1="15.5" y1="15" x2="21.5" y2="15"/>' +
                 '<path d="M8.5 15A3.5 3.5 0 0 1 12 11.5 3.5 3.5 0 0 1 15.5 15"/>'),
  // a protractor quadrant: the baseline, the arm, and the arc between them
  angle: eng('<line x1="4" y1="18" x2="20" y2="18"/><line x1="4" y1="18" x2="17" y2="7"/>' +
             '<path d="M12 18A8 8 0 0 0 14.2 12.5"/>'),
  /* THE THREE HANDS AND THE SERPENTINE. They were never in this table — the
     PANELS page carries its own inline copy of this kit and added them to
     THAT, so the canonical one has been short of four marks for as long as
     both copies existed. Here, so the HATCH page can read them off the kit
     like every other engraving. */
  // THE THREE HANDS, and each one is its own marks rather than a picture of
  // them: strokes that bend, strokes that cross, strokes that agree on nothing
  hhand: eng('<path d="M4 16.5C7 9.5 11 6 17 5"/><path d="M7 19C10 12 14 8.5 20 7.5"/>' +
             '<path d="M3.5 11.5C6 7.5 8.5 5.5 12.5 4.5"/>'),
  hcross: eng('<path d="M3.5 14C7 8 11 5 17 4"/><path d="M6.5 19.5C10 13.5 14 10.5 20.5 9.5"/>' +
              '<path d="M7 3.5C9 9 12.5 15 17.5 20"/><path d="M3 8.5C5 13 8 17.5 11.5 21"/>'),
  hrand: eng('<line x1="3.5" y1="7" x2="7" y2="4.5"/><line x1="10" y1="5.5" x2="12" y2="9.5"/>' +
             '<line x1="16" y1="4" x2="19.5" y2="6.5"/><line x1="5" y1="13" x2="8.5" y2="11"/>' +
             '<line x1="12.5" y1="14.5" x2="15" y2="11.5"/><line x1="18" y1="13.5" x2="20.5" y2="16"/>' +
             '<line x1="4" y1="19.5" x2="6" y2="16.5"/><line x1="10" y1="20" x2="14" y2="18.5"/>'),
  // the serpentine: three passes and the two turns that make them one stroke
  serp: eng('<path d="M4 5h13a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h13"/>'),
  // the pen cap, for the colour row
  ink: eng('<path d="M8.5 21V8.5C8.5 5 10 3 12 3s3.5 2 3.5 5.5V21z"/><line x1="8.5" y1="17" x2="15.5" y2="17"/>'),
  /* FOUR MORE MACHINE FILLS. Same rule as the hands above: the mark is the
     PARAMETER, not a picture of the result — what each one draws is what makes
     it a different generator from the other three. */
  // streamlines: evenly spaced lines that bend round something
  stream: eng('<path d="M3 7C8 7 10 12 15 12s7-5 6-5"/><path d="M3 12C8 12 10 17 15 17s7-5 6-5"/>' +
              '<path d="M3 17C8 17 10 22 15 22"/><path d="M4.5 3C9 3 11 7 15 7s6-4 6-4"/>'),
  // squiggle: one line, and the amplitude is the tone
  squig: eng('<path d="M2 12h3l1-1.5 1 3 1-4.5 1 6 1-7.5 1 9 1-9 1 7.5 1-6 1 4.5 1-3 1 1.5h3"/>'),
  // space-filling curve: the four cells of a Hilbert order, joined
  sfc: eng('<path d="M5 5v6h6V5m0 6h6V5m-6 6v8"/><path d="M5 11v8h6"/><path d="M11 19h6v-8"/>'),
  // labyrinth: one closed curve, folded until it fills
  laby: eng('<path d="M12 21a9 9 0 1 1 0-18 5.5 5.5 0 0 1 0 11 2.2 2.2 0 0 1 0-4.4"/>'),
};

/* ══════════════════════════════════════════════════════════════════════════
   MORE ICONS — same stroke language as the set above
   ══════════════════════════════════════════════════════════════════════════ */
Object.assign(ICON, {
  file:  svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'),
  upload:svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),
  image: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
  sun:   svg('<circle cx="12" cy="12" r="4"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/>'),
  term:  svg('<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>'),
  /* THE SPEAKER TAKES THE SAME SLASH EVERY OTHER `…Off` IN THIS SET TAKES —
     the plain drawing with a rule through it, so off is a SHAPE and not a
     second grey. The waves come off rather than being dimmed: what is gone is
     the sound, and the cone is still there. */
  sound: svg('<polygon points="4 9 8 9 13 5 13 19 8 15 4 15"/><path d="M16.4 8.6a4.8 4.8 0 0 1 0 6.8"/><path d="M19.2 5.8a8.8 8.8 0 0 1 0 12.4"/>'),
  soundOff: svg('<polygon points="4 9 8 9 13 5 13 19 8 15 4 15"/><line x1="2" y1="2" x2="22" y2="22"/>'),
  search:svg('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
  ext:   svg('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'),
  play:  svg('<polygon points="6 3 20 12 6 21 6 3"/>'),
  stop:  svg('<rect x="5" y="5" width="14" height="14" rx="2"/>'),
  folder:svg('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'),
  settle:svg('<line x1="12" y1="3" x2="12" y2="14"/><polyline points="7.5 9.5 12 14 16.5 9.5"/><line x1="4" y1="20" x2="20" y2="20"/>'),
  run:   svg('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>'),
  close: svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
  hand:  svg('<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v7M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8v-1a2 2 0 1 1 4 0"/>'),
  orbit: svg('<circle cx="12" cy="12" r="3"/><path d="M12 3a9 9 0 0 1 0 18"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-30 12 12)"/>'),
  arrow: svg('<polygon points="4 2 4 18 8.5 13.5 11.5 20 14 19 11 12.5 17 12.5"/>'),
  drop:  svg('<path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3z"/>'),
  /* THE DOCK'S OWN GLYPHS. Six marks the bar could not be built without, in
     the same stroke language as everything above: 24-box, open shapes, no
     fill, because a filled glyph on a 16px cap is a blob. */
  save:  svg('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 14 8"/>'),
  fileNew: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/>'),
  /* THE PEN IS THE SVG, and it is the nib in section — the barrel tapering to
     the tip with the slit up the middle. A PNG is a picture of the drawing; an
     SVG is the path the pen takes, so the mark is the pen. */
  nib:   svg('<path d="M9 3h6l-1 9-2 9-2-9-1-9z"/><line x1="12" y1="8" x2="12" y2="17"/><line x1="9.4" y1="12" x2="14.6" y2="12"/>'),
  /* AND THE DEBUG SVG IS THE SAME DRAWING WITH THE CONSTRUCTION LEFT IN — one
     curve, its two anchors and the handles that made it. Not a bug, not a
     wrench: what is different about that file is that it still shows its
     working, and the mark says exactly that. */
  nibDebug: svg('<path d="M3 17.5C6.5 7 17.5 7 21 17.5"/><rect x="1.5" y="16" width="3.5" height="3.5" rx=".6"/><rect x="19" y="16" width="3.5" height="3.5" rx=".6"/><rect x="10.2" y="5.2" width="3.5" height="3.5" rx=".6"/><line x1="5" y1="15.4" x2="10.4" y2="8.6"/><line x1="13.6" y1="8.6" x2="19" y2="15.4"/>'),
  /* FOUR PANES, NOT A GRID. The mark is the WINDOWS — four of them, square,
     where they belong. Which is why it is the right mark for the key that puts
     them back: what you press it for is this picture. */
  windows: svg('<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>'),
});


/* ── helpers ───────────────────────────────────────────────────────────── */
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
/* ══════════════════════════════════════════════════════════════════════════
   THE PANEL MAKES A NOISE, AND IT IS THE SAME ARGUMENT THE DETENT MADE.

   The drum's tick was written as a one-off, with the reasoning that a detent
   is the one control whose defining feature — the notch it drops into — has
   no visual at all, so you hear it or you get nothing. That reasoning was
   never about the drum. EVERY object on this panel is a machined part with a
   sound: a key bottoms out, a switch snaps over, an encoder ratchets, a fader
   cap is picked up off its track and set back down. Drawing all of that under
   one lamp and then rendering it silent is the same half-finished illusion as
   drawing one control lit from the other side.

   SO IT IS ONE BANK OF VOICES AT THE TOP OF THE KIT, NOT A FUNCTION IN THE
   DRUM. Same rule as `--recess` and `--chamfer`: declared once, used at any
   size. Seven voices out of TWO generators — a ringing one for the parts that
   really ring and a struck one for the parts that hit, which is the argument
   directly below. Nothing is sampled and nothing ships: the whole bank is
   under eighty lines and there is no asset.

   THE BUDGET IS THE WHOLE DESIGN, AND IT IS DISCREET RATHER THAN QUIET. These
   are 3.5–14ms of transient with at most 30ms of body under it, at a level you
   should notice you have STOPPED hearing rather than notice you are hearing —
   a control that announces itself is a control you turn the volume off for,
   and then every one of them is silent. It is one number, `MASTER`, so the
   whole panel moves together and the balance between the parts cannot drift
   while it does. Loudest is the press, because it is the one you make on
   purpose; the tab is a third of it, because a tab strip is WALKED.

   AND AN ENCODER TICKS PER NOTCH, NOT PER STEP. A knob with `step: 1` over a
   0–360 range fires 360 times across its travel, which at any rate limit at
   all is a buzz rather than a ratchet. A real encoder has a fixed number of
   detents whatever it is wired to, so the tick is keyed to a fixed division
   of the TRAVEL — `ENC` of them end to end — and the value's own step is left
   to say what the value is. THE KNOB ALONE: a fader has no ratchet in it and
   is silent as it runs, which is the note on `rangeFader`'s setter.

   BUILT LAZILY, on the first sound, because an AudioContext made before a
   gesture is one the browser suspends and one nobody asked for. Muted through
   `SFX.on`, in localStorage rather than in any document's state: whether the
   room is quiet is a property of the room, not of the piece being made in it.
   ══════════════════════════════════════════════════════════════════════════ */
/* AN OSCILLATOR IS A TONE AND A CLICK IS NOT A TONE — that is the whole of why
   the first build came out sounding electronic. A falling square wave is a
   CHIRP: it has a pitch, you can hum it, and a panel full of them is a panel of
   little beeps. Nothing in a machine makes a pitch when you press it. What a
   plastic cap hitting an aluminium skirt makes is a BURST OF NOISE, a few
   milliseconds long, coloured by the resonance of whatever was struck — plus a
   thump from the mass behind it.

   SO THE STRIKE IS NOISE THROUGH A BANDPASS, AND THAT IS THE MODEL. White noise
   is every frequency at once, which is what an impact is before the object gets
   to it; the filter is the object. `f` is what the thing rings at and `Q` is how
   dead it is — a low Q is a dull damped thock, a high one is a small hard
   ringing tick. One buffer of noise is made once and every strike reads a
   RANDOM SLICE of it, so no two are the same waveform.

   AND THE BODY IS A SECOND, LOWER COMPONENT, because a real press is two events
   in one: the tick of the contact and the thud of the mass. A sine at 150–350Hz
   dropping slightly as it decays is that thud. Skip it and a key sounds like a
   fingernail on the desk rather than a key going down.

   NOTHING REPEATS EXACTLY. Frequency ±6%, level ±15%, a different slice of noise
   every time. Identical repeats are most of what "digital" means — a real object
   struck twice makes two different sounds, and the ear is far better at spotting
   that they are the SAME than at hearing what either one was.

   THE KNOB'S RATCHET IS DELIBERATELY NOT THIS. `step` is still a chirp: an
   encoder's notch is the one thing on this panel that really does ring at a
   pitch, it is forty-to-a-turn so it has to be tiny rather than detailed, and
   it was asked to stay. It is the LAST one — the drum's chirp went the same way
   every other tone here did, and for the same reason. */
const ENC = 40;                        // notches across a knob's travel
const SFX = (() => {
  let ac = null, noise = null, on = true;
  try { on = localStorage.getItem('skew.sfx') !== 'off'; } catch { /* no storage, stay on */ }
  const vary = (a, b) => a + Math.random() * (b - a);

  const wake = () => {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    if (!noise) {
      // 0.4s of white noise, made once. Every strike takes a random slice, which
      // is what stops two presses being the same waveform.
      noise = ac.createBuffer(1, Math.ceil(ac.sampleRate * .4), ac.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return ac;
  };

  /* THE RINGING VOICE, kept for the ENCODER's notch: a pitch falling through an
     exponential gain. It is the knob's ratchet and nothing else now. */
  const blip = (f0, f1, g0, dur, type) => {
    if (!on) return;
    try {
      const c = wake(), t = c.currentTime;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + dur * .45);
      g.gain.setValueAtTime(g0, t);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + dur * 1.25);
    } catch { /* no audio here, and every control still works */ }
  };

  /* DISCREET IS A LEVEL, AND IT IS ONE NUMBER. Every strike is scaled by
     `MASTER` on its way out, so "the panel is too loud" is one edit and not
     fourteen — and the BALANCE between the voices, which is the part that took
     the tuning, cannot drift while you are changing the volume. The per-voice
     numbers below are therefore relative: what a press is against a tab, not
     what either is against the room.

     THE ONE THAT RINGS IS NOT SCALED BY IT. `step` was asked to stay exactly as
     it is, and "exactly" includes its level, so it goes out at its own gain.
     That is the only reason `MASTER` is inside `strike` rather than on a master
     GainNode across the whole bank.

     0.55 IS TUNED BY EAR AND IT WENT DOWN BEFORE IT WENT UP. It was 1.0 while
     the voices were still oscillators, cut to 0.34 the moment they became
     impacts — a noise burst through a bandpass carries far more perceived
     level than a chirp at the same peak — and that overshot: the panel became
     something you had to listen FOR. Discreet is not the same as inaudible.
     The number is here, alone, precisely so this is one edit and not fourteen.

     AND THE BODY IS CUT HARDER THAN THE TRANSIENT, because loudness at these
     levels is almost all in the low end: an equal cut leaves a click that
     measures quiet and still THUDS. The transient is what says the object is
     hard; the body is what says it is heavy, and a discreet panel is one whose
     parts are hard and light. */
  const MASTER = .55;

  /* AN IMPACT: a slice of noise shaped by what it hit, over an optional thud. */
  const strike = (f, q, dur, g0, body, bodyG, bodyDur) => {
    if (!on) return;
    try {
      const c = wake(), t = c.currentTime;
      const s = c.createBufferSource();
      s.buffer = noise;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = f * vary(.94, 1.06);
      bp.Q.value = q;
      const g = c.createGain();
      // the attack is half a millisecond — an impact has no attack at all, and
      // anything slower than this is audible as a swell rather than a hit
      g.gain.setValueAtTime(.0001, t);
      g.gain.linearRampToValueAtTime(g0 * MASTER * vary(.85, 1.15), t + .0005);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp).connect(g).connect(c.destination);
      s.start(t, Math.random() * (noise.duration - .05), dur + .01);
      s.stop(t + dur + .02);
      if (body) {
        // the mass behind the contact: a struck body drops slightly in pitch as
        // it dies, which is the difference between a thud and a bleep
        const o = c.createOscillator(), bg = c.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(body * vary(.96, 1.04), t);
        o.frequency.exponentialRampToValueAtTime(body * .78, t + bodyDur);
        bg.gain.setValueAtTime(.0001, t);
        bg.gain.linearRampToValueAtTime(bodyG * MASTER * vary(.85, 1.15), t + .001);
        bg.gain.exponentialRampToValueAtTime(.0001, t + bodyDur);
        o.connect(bg).connect(c.destination);
        o.start(t); o.stop(t + bodyDur + .02);
      }
    } catch { /* no audio here, and every control still works */ }
  };

  return {
    isOn: () => on,
    mute: v => { on = !v; try { localStorage.setItem('skew.sfx', on ? 'on' : 'off'); } catch {} },
    /* ── THE ONE THAT RINGS, AND IT IS THE KNOB'S ONLY. One notch of an
       encoder: asked to stay exactly as it is and left exactly as it is.

       THE DRUM'S CHIRP IS GONE, AND IT WAS THE LAST THING IN HERE THAT SOUNDED
       LIKE A UI. It was kept on the grounds that it is the sound the part
       shipped with and somebody had been listening to it since before any of
       this — which is an argument about HISTORY, not about the object, and the
       object is a machined barrel with a sprung ball riding a groove. A falling
       square wave at 0.05 is a gimmick, it is not what that makes, and it was
       the loudest thing left in the bank. `roll` is what it makes. Nothing
       calls `blip` now except the ratchet, which is the only place a pitch was
       ever honest: an encoder's notch really does ring. */
    step:    () => blip(3100, 2000, .012, .010, 'square'),
    // ── AND THE SEVEN THAT STRIKE.       f     Q   dur   lvl  body  lvl   dur
    // a cap bottoming out on its skirt — hard and light, a whisper of mass
    press:   () => strike(1800, 1.4, .009, .34,  200, .018, .028),
    // and springing back to its top stop — lighter, brighter, no mass at all
    release: () => strike(3200, 1.8, .005, .11),
    // a switch going over centre — crisper than a key, and shorter
    flip:    () => strike(2800, 2.3, .007, .26,  350, .012, .016),
    /* A SELECTOR SWITCH SNAPPING INTO A POSITION. Heavier than a toggle,
       because the part is: a sprung ball, a machined star wheel and a shaft
       with a knob on it. Higher Q than anything else in the bank, which is
       what makes it read as METAL rather than as plastic — but a strike and
       not a chirp, because the ball is what makes the noise and a ball hitting
       a groove has no pitch to hum. */
    clack:   () => strike(2200, 3.4, .011, .30,  430, .016, .024),
    /* A DRUM IS THE SAME MECHANISM IN A BIGGER, DEADER PART. A rotary is a
       machined star wheel on a short shaft and it rings; a drum is a barrel
       with mass in it, gripped at the rim, and mass is what kills a ring. So:
       lower, a full point less Q, and two thirds of the level — the difference
       between flicking a switch and rolling a wheel round to the next name. */
    roll:    () => strike(1500, 2.3, .009, .19,  270, .010, .020),
    /* A PIANO KEY IS A THINNER PART, AND IT IS THE ONE YOU HIT MOST. A tab
       strip is WALKED — six of them, back and forth, while you compare one
       setting across six marks — so a key's full thock on a tab is the loudest
       thing in the panel attached to the lightest gesture in it. Higher,
       shorter, a third of the level and no mass behind it at all: the sound of
       a thin key on a bar rather than a command key on a skirt. */
    tap:     () => strike(2500, 1.7, .005, .11),
    lift:    () => strike(3500, 1.9, .0035, .045),
    // a fader cap lifted off its track — damped, nothing rings
    grab:    () => strike( 980,  .9, .011, .15),
    // and set back down on it
    drop:    () => strike( 800, 1.0, .014, .17,  160, .014, .030),
  };
})();

/* Every key, switch and chevron in the kit takes the same pair, so the two
   halves of a press cannot drift apart between one control and the next. It
   is on the POINTER and not on `click`, because the sound of a key is the
   sound of it going down — a click fires on the way back up, by which time
   the noise is late by however long you held it. */
const clicky = (b, down = SFX.press, up = SFX.release) => {
  b.addEventListener('pointerdown', () => { if (!b.disabled) down(); });
  b.addEventListener('pointerup',   () => { if (!b.disabled) up(); });
  return b;
};

/* ══════════════════════════════════════════════════════════════════════════
   THE PRESS IS THE CLICK — one listener, and it retires an argument.

   A `click` is not an event the pointer sends. It is one the browser INFERS,
   from a pointerdown and a pointerup that resolve to the same element — and
   the moment those two disagree there is no click at all, however obvious the
   press was. Every way they can disagree is in play on this kit at once:

     · the cap TRAVELS. `:active` lands on pointerdown and drops it 2px, so a
       press that arrived near the top edge is left standing above the thing
       it just pressed.
     · the pad is INVISIBLE and its edges are exact. A release one pixel out
       is a release on the chassis.
     · a rounded corner is not a corner. Browsers hit-test the rounded box, so
       the crescent outside every curve belongs to whatever is behind it.

   THREE ROUNDS OF THIS FILE'S CSS WENT AFTER THOSE ONE AT A TIME — a squarer
   pad, a longer reach, a counter-translate — and every one of them was a
   better answer to the wrong question. The question is not which pixels belong
   to the key. It is why a control that has visibly been pressed is waiting for
   the browser's permission to act.

   SO IT DOES NOT WAIT. Pointerdown on a control captures the pointer and arms
   it; pointerup within reach of where it started fires the control, and the
   browser's own click — if it turns up — is the one that wins. Press and
   release on a key, and the key goes. That is the whole rule, and it is the
   rule a physical key has.

   IT IS NOT A CLICK ANYWHERE. Release well away from the control and nothing
   happens, because sliding off a key you have changed your mind about is how
   every button on every machine has always worked. `SLOP` is what "away"
   means, and it is generous on purpose: it has to clear the travel and the
   pad, and the cost of being wrong is a press that does nothing, which is the
   bug this exists to end.

   ONE DOCUMENT LISTENER, NOT ONE PER CONTROL, because the controls this has to
   reach are not all built here. The doc site's nav bar writes its own `.pkey`
   anchors and never calls `clicky`; an adopting app will do the same thing the
   first time it wants a key the factory does not make. A rule about what a
   press MEANS cannot live in the constructors.
   ══════════════════════════════════════════════════════════════════════════ */
const PRESSABLE = '.key, .pkey, .chip, .sw, .chev, .menu-row, .tab-demo, .act';
const PRESS_SLOP = 12;

function pressFix(root) {
  let armed = null, fired = false;

  root.addEventListener('pointerdown', e => {
    if (e.button) return;                       // primary button only
    const t = e.target.closest && e.target.closest(PRESSABLE);
    if (!t || t.disabled) return;
    armed = t; fired = false;
    /* CAPTURE FIRST, and most browsers then retarget the native click here on
       their own — which is the outcome we want and the one we do not have to
       synthesise. The rest of this is for the ones that do not. */
    try { t.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
  }, true);

  /* THE REAL CLICK ALWAYS WINS. It carries the modifier keys, the detail count
     and the trusted flag; a synthetic one carries none of that, so it is only
     ever a fallback and never a duplicate. */
  root.addEventListener('click', e => {
    if (armed && (e.target === armed || armed.contains(e.target))) fired = true;
  }, true);

  root.addEventListener('pointerup', e => {
    const t = armed;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const near = e.clientX >= r.left   - PRESS_SLOP && e.clientX <= r.right  + PRESS_SLOP
              && e.clientY >= r.top    - PRESS_SLOP && e.clientY <= r.bottom + PRESS_SLOP;
    if (!near) { armed = null; return; }
    /* DISARMED IN THE TIMEOUT, NOT HERE, AND THAT ORDER IS THE WHOLE THING.
       Pointer events run pointerdown → pointerup → click, so the browser's
       click lands AFTER this handler. Clearing `armed` now leaves the click
       listener above with nothing to match, `fired` never goes true, and this
       fires a second synthetic click on top of the real one — every control in
       the kit actuating twice. It reads as working on anything idempotent (a
       piano key reselecting the same key) and as DEAD on anything that toggles:
       a latch flips back, and a menu opens on the real click and shuts on the
       duplicate. Hold the reference until the fallback has had its look. */
    setTimeout(() => {
      if (!fired) t.click();
      if (armed === t) armed = null;
    });
  }, true);

  root.addEventListener('pointercancel', () => { armed = null; }, true);
  return root;
}

/* INSTALLED BY THE KIT, NOT BY THE APP. An adopter that has to remember to
   call this is an adopter whose keys work everywhere except the one page where
   they forgot. Guarded for `tools/run-page.mjs`, which runs this file with no
   document at all. */
if (typeof document !== 'undefined' && !document.__skewPressFix) {
  document.__skewPressFix = true;
  pressFix(document);
}

/* A backlit switch. `state` is on | mixed | off for the masters; per-layer
   switches pass null and use the plain on/off. */
/* ONE ICON. NOT TWO, AND NOT DIMMED.

   Off used to be the struck-through drawing in a darker grey, which was the
   right answer when the switch was a flat chip and colour was all it had.
   It is not the answer now: the cap is UP or DOWN, and that is already a
   statement you can read from across the panel and in a greyscale shot. Adding
   a slash to it means the state is said three times, and the slashed glyph is
   the weakest of the three — it is the one you have to look AT rather than
   see. Worse, a slashed grey icon on a raised cap reads as DISABLED, so half
   the switches in the dock looked like controls that were not available.

   So the legend is the plain drawing at its normal weight, exactly as it would
   be silkscreened on a real cap — the same mark whatever the switch is doing —
   and what changes is the cap's position and whether the legend is lit. */
/* AND IT ALWAYS TAKES AN ICON. A cap with nothing printed on it is not a blank
   legend, it is a MISSING one, and a boolean with no honest glyph is not a cap
   at all — it is a slide switch. See `toggle`. */
const swBtn = (on, label, icon, state, onClick) => {
  const cls = 'sw' + (state ? ' ' + state : (on ? ' on' : ''));
  const b = el('button', cls, icon);
  b.type = 'button';
  b.setAttribute(state ? 'role' : 'aria-pressed', state ? 'checkbox' : String(on));
  if (state) b.setAttribute('aria-checked', state === 'mixed' ? 'mixed' : String(state === 'on'));
  b.setAttribute('aria-label', `${on ? 'Hide' : 'Show'} ${label}`);
  b.title = state === 'mixed' ? `Some layers only — click to hide ${label} everywhere`
          : on ? `Hide ${label}` : `Show ${label}`;
  b.addEventListener('click', e => { e.stopPropagation(); engage(b, onClick, 'on'); });
  return clicky(b, SFX.flip, SFX.release);
};

/* ══════════════════════════════════════════════════════════════════════════
   A TOGGLE — the switch with its name engraved beside it
   ══════════════════════════════════════════════════════════════════════════
   `swBtn` puts the label in the `aria-label` and the `title` and never on
   screen, because it was written for a layer row where the ROW carries the
   name. Off that row there is nothing saying what the switch does, and every
   adopter has composed the same molecule out of the same three parts to fix
   it. Four apps composing one molecule four ways is how a language stops
   being one.

   IT IS NOT A `.row`, AND THAT IS THE DECISION IN THIS PART. A row is a module
   card: a layer is a thing with contents, a colour and an editor behind it,
   and the raised card is what says so. A boolean is a SETTING, and a settings
   bay engraves its names straight onto the metal rather than giving each one a
   card of its own. Nineteen booleans on nineteen cards is a stack of pallets.

   THE WHOLE LINE IS THE BUTTON. A 24px cap is a small thing to hit and the
   name is what you were aiming at anyway. The cap inside is a `<span>`, not a
   nested button — one hit target, one `aria-pressed`, and nothing to disagree
   with anything else.

   AND IT REPAINTS RATHER THAN REBUILDS, which is the trap `swBtn` carries:
   that one bakes its state into the class, the aria and the title at
   construction, so it has to be replaced wholesale on every change and its
   container has to be in `ENGAGE_ROOTS` for `engage()` to find the replacement.
   Here the state lives on the plate and the cap is repainted in place, so
   `.set(v)` is the same one-line call every other value control in this kit
   carries — which is what a loaded config pushes through.

   THE ICON DECIDES WHICH PART IT IS, and there is no third argument for it.
   A boolean with an honest glyph — an eye for a preview, an outline for the
   outlines — gets the backlit cap, silkscreened, exactly as the layer dock
   builds it. A boolean with no honest glyph gets a SLIDE SWITCH, where the
   legend is the actuator's position and there is nothing printed at all. An
   arbitrary glyph is worse than none, and a blank cap is worse than both.

     label      engraved beside the switch
     icon       silkscreened on a cap. Leave it out and you get the slide
     lamp       a colour, for a switch that belongs to a LAYER: it lights the
                pipe down the leading edge and the band the slide uncovers.
                Leave it off for a plain setting — a pipe on every boolean is
                a column of light saying nothing, and the pipe is a layer's
                own ink
   ══════════════════════════════════════════════════════════════════════════ */
function toggle({ label, value = false, icon = '', lamp = '', title, onChange } = {}) {
  const b = el('button', 'tog');
  b.type = 'button';
  if (lamp) { b.style.setProperty('--lyr', lamp); b.append(el('span', 'pipe')); }
  /* THE SLOT BUILDS ITS FLOOR AND ITS ACTUATOR. Two children rather than the
     slot's own two pseudo-elements, because the actuator needs pseudos of its
     own — the knurl cut into its face and the specular streak across it — and
     a part with five surfaces cannot be drawn on a part with two. */
  const cap = icon ? el('span', 'sw', icon)
                   : el('span', 'slide', '<i class="sl-bed"></i><i class="sl-act"></i>');
  b.append(cap, el('span', 'name', label));

  let on = !!value;
  const paint = () => {
    b.classList.toggle('off', !on);
    cap.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
    b.title = title || (on ? `Turn ${label} off` : `Turn ${label} on`);
    b.setAttribute('aria-label', b.title);
  };
  paint();

  /* THE SURGE IS ON THE WAY IN AND NOT ON THE WAY OUT. Flipping a switch off
     is a circuit opening; there is nothing to light. Same rule `engage()`
     applies, without needing `engage()` — nothing here gets rebuilt, so the
     cap that went down is the cap still on the page.

     AND ONLY A CAP SURGES. `engage` is a lamp coming up behind a key face as
     it lands in its recess; a slide switch has no recess to land in and no
     lamp behind it — its state is where the actuator IS, and a flash of orange
     round the slot would be a second, weaker way of saying the same thing. */
  const flip = () => {
    on = !on;
    paint();
    if (on && icon) { cap.classList.remove('engage'); void cap.offsetWidth; cap.classList.add('engage'); }
    onChange && onChange(on);
  };
  b.addEventListener('click', flip);
  /* `.set()` MOVES THE SWITCH WITHOUT FIRING THE HANDLER, because the caller
     that pushes a loaded config through every control is not a user pressing
     nineteen switches. */
  b.set = (v) => { on = !!v; paint(); };
  b.get = () => on;
  return clicky(b, SFX.flip, SFX.release);
}

const chevBtn = (open, label, onClick) => {
  const b = el('button', 'chev' + (open ? ' open' : ''), ICON.chev);
  b.type = 'button';
  b.setAttribute('aria-expanded', String(open));
  b.setAttribute('aria-label', `${open ? 'Hide' : 'Show'} what ${label} draws`);
  b.title = open ? `Hide what ${label} draws` : `Show what ${label} draws`;
  b.addEventListener('click', e => { e.stopPropagation(); engage(b, onClick, 'open'); });
  return clicky(b, SFX.flip, SFX.release);
};

/* ══════════════════════════════════════════════════════════════════════════
   THE KNOB — 270° of travel, drag / wheel / arrows, shift for fine
   ══════════════════════════════════════════════════════════════════════════ */
const RING_R = 43;                       // in the 0–100 viewBox
const RING_C = 2 * Math.PI * RING_R;     // 270.18
/* ══════════════════════════════════════════════════════════════════════════
   A READOUT YOU CAN TYPE INTO.

   Every lit readout on this panel is the value of a control you can only
   reach by dragging, and dragging is the wrong tool for "45" — you can find
   44 and 46 all day. A knob is for LOOKING FOR a value and a keyboard is for
   KNOWING one, and a panel that only offers the first is a panel you fight
   whenever you already have the number.

   DOUBLE-CLICK, not click: a single click on a readout is what happens on the
   way to somewhere else, and a field that opens by accident is a field that
   eats the next keystroke. The window is the same lit glass it always was —
   it does not turn into a form control, because it is not one; it is the same
   readout with a cursor in it.

   The units in the readout are FORMATTING, not input: `45°`, `1.6×` and
   `0.35` are all one number, so what comes back is parsed and the format is
   reapplied by the control's own paint. Type `45` or `45°` and both work.
   ══════════════════════════════════════════════════════════════════════════ */
function typeable(el, read, write) {
  el.classList.add('kedit-able');
  el.title = 'Double-click to type a value';
  el.addEventListener('dblclick', e => {
    e.preventDefault();
    if (el.querySelector('input')) return;
    const inp = document.createElement('input');
    inp.className = 'kedit';
    inp.value = String(read());
    inp.setAttribute('aria-label', 'Type a value');
    el.textContent = '';
    el.append(inp);
    inp.focus();
    inp.select();

    let closed = false;
    const close = commit => {
      if (closed) return;
      closed = true;
      const raw = inp.value.replace(',', '.');
      inp.remove();
      /* WRITE AFTER REMOVING, never before: write() repaints the readout, and
         a repaint with the input still in it would set textContent over the
         top of the element being removed and leave the field half-torn. */
      const v = parseFloat(raw);
      if (commit && !Number.isNaN(v)) write(v);
      else el.textContent = String(read());
    };
    inp.addEventListener('keydown', ev => {
      /* THE CONTROL UNDERNEATH IS LISTENING FOR ARROWS. Without this, typing
         into the box also nudges the thing the box is reporting on. */
      ev.stopPropagation();
      if (ev.key === 'Enter') { ev.preventDefault(); close(true); }
      if (ev.key === 'Escape') { ev.preventDefault(); close(false); }
    });
    inp.addEventListener('blur', () => close(true));
    inp.addEventListener('wheel', ev => ev.stopPropagation(), { passive: true });
    inp.addEventListener('pointerdown', ev => ev.stopPropagation());
  });
}

/* FOUR LAYOUTS, one control. They differ only in what is around the dial and
   how it is stacked, because the dial is never the thing in question:

     stack    caption, dial, value in a column, on bare metal. The default,
              and what three knobs side by side need, since a row of them has
              to be named before it can be read.
     tile     the same column on a PROUD PLATE. A module rather than a control:
              what a grid of them wants, because the plate is the edge that
              says where one channel stops and the next begins.
     row      a PARAM STRIP on its own small plate: dial, caption, value on one
              line. A column of these reads as a rack of channels.
     compact  dial and value, no caption. For when the row around it already
              says what the number is.
     bare     the dial alone. For when the value has its own window somewhere
              else, which is what the pen bank does.

   Every one of them is the same dial at the same angles; picking one is a
   question about the SURROUNDINGS, never about the control. */
function knob({ label, min, max, step = 1, value, fmt, arc = '#FF6A00',
                layout = 'stack', size, bipolar = false, detents = null, onChange }) {
  const row     = layout === 'row';
  const tile    = layout === 'tile';
  const compact = layout === 'compact';
  const bare    = layout === 'bare';
  if (size == null) size = row ? 40 : compact || bare ? 34 : 46;
  const wrap = el('div', 'kwrap' + (row ? ' inline' : tile ? ' tile'
                                  : compact ? ' compact' : bare ? ' bare' : ''));
  const k = el('div', 'knob' + (bipolar ? ' bi' : ''));
  k.style.setProperty('--kd', size + 'px');
  k.style.setProperty('--arc', arc);
  k.tabIndex = 0;
  k.setAttribute('role', 'slider');
  k.setAttribute('aria-label', label);
  k.setAttribute('aria-valuemin', min);
  k.setAttribute('aria-valuemax', max);
  // the ring: two stroked circles, antialiased by the renderer
  const ring = el('div', null,
    `<svg class="knob-ring" viewBox="0 0 100 100" aria-hidden="true">
       <circle class="kr-track" cx="50" cy="50" r="${RING_R}"
               stroke-dasharray="${RING_C * .75} ${RING_C}"/>
       <circle class="kr-val" cx="50" cy="50" r="${RING_R}"/>
     </svg>`).firstElementChild;
  const valArc = ring.querySelector('.kr-val');
  const cap = el('div', 'knob-cap');
  k.append(el('div', 'knob-collar'), ring, cap);
  const val = el('div', 'kval');
  let v = value;

  const paint = () => {
    const t = (v - min) / (max - min);
    cap.style.setProperty('--deg', (-135 + t * 270) + 'deg');
    // Unipolar grows from the start of the sweep; bipolar grows from its middle
    // in whichever direction you turned. One dasharray + one dashoffset does both.
    const from = bipolar ? 0.5 : 0;
    const len = Math.abs(t - from) * .75 * RING_C;
    valArc.setAttribute('stroke-dasharray', `${len} ${RING_C}`);
    valArc.setAttribute('stroke-dashoffset', `${-Math.min(t, from) * .75 * RING_C}`);
    valArc.style.opacity = len < 1.2 ? 0 : 1;   // no round-cap dot at the origin
    val.textContent = fmt ? fmt(v) : String(v);
    k.setAttribute('aria-valuenow', v);
    k.setAttribute('aria-valuetext', val.textContent);
  };
  /* DETENTS, the same idea the centre fader already has and for the same
     reason: an angle of 45° is not a value you approach, it is a place, and a
     real panel cuts a notch in the track so the finger finds it without the
     eye. Within 2% of the sweep the cap falls in — wide enough to catch, tight
     enough that the numbers between the notches are still reachable. */
  const NOTCH = .02 * (max - min);
  /* THE RATCHET. `enc` is which of the ENC notches across the sweep the cap is
     standing in, and the tick fires when that number changes — so the noise is
     the KNOB's and not the value's, and a 0–360 knob at step 1 ratchets forty
     times across its travel instead of buzzing three hundred and sixty. Seeded
     from the starting value, or the control announces itself on the way in.
     `quiet` is what a host's `set` passes: a sync is not an edit, and a panel
     refreshed after a layer switch must not sound like one being played. */
  const notch = x => Math.round(((x - min) / (max - min)) * ENC);
  let enc = notch(v), held = null;
  const set = (nv, quiet) => {
    const q = Math.round(nv / step) * step;
    v = +Math.min(max, Math.max(min, q)).toFixed(6);
    let fell = false;
    if (detents) {
      // `held` is what makes this fire ONCE. Without it the cap is re-snapped
      // on every pointermove inside the notch band and the detent machine-guns
      // for as long as you sit in it.
      const near = detents.find(d => Math.abs(v - d) < NOTCH);
      if (near != null) { fell = held !== near; v = near; held = near; }
      else held = null;
    }
    if (!quiet) {
      /* Landing in a DECLARED notch is a decision and gets the selector's
         clack — a notch cut in a knob and a notch cut in a rotary are the same
         part, so they are the same sound. Crossing an encoder notch is just
         travel, and keeps the ratchet. The drum's chirp reaches neither. */
      if (fell) SFX.clack();
      else if (notch(v) !== enc) SFX.step();
    }
    enc = notch(v);
    paint(); onChange && onChange(v);
  };

  // 200px of travel is the full range. DOWN AND RIGHT BOTH TURN IT CLOCKWISE:
  // you are pushing the near edge of a cap away from you, which is the
  // direction it would actually spin under your finger. (Audio software mostly
  // does the opposite — drag up to raise — but that is a fader's gesture
  // borrowed by a knob, and this panel has real faders for that.) Shift
  // divides the travel by five.
  /* ── A DRAG ENDS ON `lostpointercapture`, NOT ON `pointerup` ─────────────
     THE STUCK KNOB. Every drag in this file captured the pointer and then
     waited for `pointerup` to let go, and a pointerup is NOT GUARANTEED TO
     ARRIVE. Release over the browser's own chrome, drag off the window and let
     go, alt-tab away mid-turn, open a context menu, or have the panel rebuild
     the control under your hand — in every one of those the capture ends and
     no pointerup is delivered. `pointercancel` does not cover them either; it
     is for the browser taking the gesture away, not for the gesture ending
     somewhere the element cannot see.

     So the control keeps its `dragging` flag AND its capture, which is the
     worst possible pair: it still owns every pointermove on the page, so the
     knob goes on turning with the mouse after you have let go of it.

     `lostpointercapture` FIRES WHENEVER CAPTURE ENDS, FOR ANY REASON — the
     implicit release at pointerup, the element being removed, the browser
     dropping it, the window losing focus. It cannot be missed, which is
     exactly what an end-of-drag needs to be. pointerup and pointercancel stay:
     they arrive first in the ordinary case and the handler is idempotent, so
     the sound and the state land at the moment you release rather than a tick
     later. This is the rule for every capturing control in this file. */
  let sx = 0, sy = 0, sv = 0;
  k.addEventListener('pointerdown', e => {
    k.setPointerCapture(e.pointerId); k.classList.add('dragging');
    sx = e.clientX; sy = e.clientY; sv = v; e.preventDefault();
  });
  k.addEventListener('pointermove', e => {
    if (!k.classList.contains('dragging')) return;
    const d = (e.clientY - sy) + (e.clientX - sx);
    set(sv + (d / 200) * (max - min) * (e.shiftKey ? 0.2 : 1));
  });
  const end = () => k.classList.remove('dragging');
  k.addEventListener('pointerup', end);
  k.addEventListener('pointercancel', end);
  k.addEventListener('lostpointercapture', end);
  k.addEventListener('wheel', e => {
    e.preventDefault();
    set(v + Math.sign(e.deltaY) * step * (e.shiftKey ? 1 : 10));
  }, { passive: false });
  k.addEventListener('keydown', e => {
    const big = (max - min) / 20;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); set(v + (e.shiftKey ? step : big)); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); set(v - (e.shiftKey ? step : big)); }
  });

  paint();
  typeable(val, () => v, set);
  // In a row the knob leads, because the knob is the control; stacked, the
  // caption leads, because three of them side by side need naming first.
  if (bare)         wrap.append(k);
  else if (compact) wrap.append(k, val);
  else if (row)     wrap.append(k, el('div', 'klab', label), val);
  else              wrap.append(el('div', 'klab', label), k, val);   // stack and tile
  wrap.set = nv => set(nv, true);        // a host drives this control SILENTLY
  return wrap;
}

/* ── ONE FADER WITH TWO ENDS, because the value is ONE LENGTH ─────────────
   Zone from and Zone to were two sliders, and two sliders is a lie about what
   they are: there is one band, it has a start and an end, and the thing you
   are actually setting is the SPAN between them. Two separate tracks make you
   compute that span in your head from two positions on two different lines,
   and they let you set from > to, which is not a state the piece has — it is
   just a slider that has not been corrected yet.

   One slot, two caps, the band lit between them. The span is now a length you
   can SEE, dragging either end keeps the other still, the caps cannot cross,
   and the panel gets a row back. The band carries a fine hatch so it reads as
   a solid piece between two thumbs rather than as a fill that happens to start
   late — the same reason the cap has a knurl. */
const CAP_W = 17, MIN_SPAN = 0.02;
function rangeFader({ label, min, max, step = 0.01, from, to, fmt, onChange }) {
  const row = el('div', 'fader');
  const slot = el('div', 'fslot');
  const track = el('div', 'ftrack');
  const band = el('div', 'ffill band');
  const capA = el('div', 'fcap');
  const capB = el('div', 'fcap');
  const out = el('div', 'kval wide');
  track.append(band, capA, capB);
  slot.append(track, el('div', 'fticks'));
  let a = from, b = to;

  const q = v => +Math.min(max, Math.max(min, Math.round(v / step) * step)).toFixed(6);
  const norm = v => (v - min) / (max - min);
  // x of a cap CENTRE, in %, allowing for the cap's own width at both ends
  const cx = t => `calc(${t * 100}% - ${(t - .5) * CAP_W}px)`;

  const paint = () => {
    const ta = norm(a), tb = norm(b);
    capA.style.left = cx(ta);
    capB.style.left = cx(tb);
    band.style.left = cx(ta);
    band.style.width = `calc(${(tb - ta) * 100}% - ${(tb - ta) * CAP_W}px)`;
    out.textContent = `${fmt ? fmt(a) : a}–${fmt ? fmt(b) : b}`;
    capA.setAttribute('aria-valuenow', a);
    capB.setAttribute('aria-valuenow', b);
  };
  /* A FADER IS SILENT WHILE IT SLIDES, AND A KNOB IS NOT. That is not a taste
     call, it is what the two parts are: an encoder is a ratchet with a fixed
     number of detents cut into it and it clicks through every one, while a
     fader cap runs on a greased track with nothing to click against. The only
     noises a fader has are the cap coming off the track and going back down —
     and, where the part has one, the notch at the centre. A ratchet on a fader
     is the sound of a control that does not exist. */
  const set = (which, v) => {
    if (which === 0) a = Math.min(q(v), b - MIN_SPAN * (max - min));
    else b = Math.max(q(v), a + MIN_SPAN * (max - min));
    paint(); onChange && onChange(a, b);
  };

  // The caps are painted, not hit — the TRACK takes every pointer event and
  // hands it to whichever cap is nearer. Grabbing a 17px thumb exactly is a
  // pointing task nobody should be set; clicking anywhere on the line and
  // having the near end come to you is the same gesture with no aiming.
  let active = 0;
  const fromX = (e, pick) => {
    const r = track.getBoundingClientRect();
    const usable = r.width - CAP_W;
    const t = Math.min(1, Math.max(0, (e.clientX - r.left - CAP_W / 2) / usable));
    const v = min + t * (max - min);
    if (pick) active = Math.abs(v - a) <= Math.abs(v - b) ? 0 : 1;
    set(active, v);
  };
  track.addEventListener('pointerdown', e => {
    track.setPointerCapture(e.pointerId); track.dataset.on = '1'; SFX.grab(); fromX(e, true);
  });
  track.addEventListener('pointermove', e => { if (track.dataset.on) fromX(e, false); });
  // see the note on the knob: capture can end without a pointerup
  const fEnd = () => { if (track.dataset.on) SFX.drop(); delete track.dataset.on; };
  track.addEventListener('pointerup', fEnd);
  track.addEventListener('pointercancel', fEnd);
  track.addEventListener('lostpointercapture', fEnd);

  [capA, capB].forEach((c, n) => {
    c.tabIndex = 0;
    c.setAttribute('role', 'slider');
    c.setAttribute('aria-label', `${label} ${n ? 'end' : 'start'}`);
    c.setAttribute('aria-valuemin', min);
    c.setAttribute('aria-valuemax', max);
    c.addEventListener('keydown', e => {
      const big = (max - min) / 20, d = e.shiftKey ? step : big;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(n, (n ? b : a) + d); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(n, (n ? b : a) - d); }
    });
  });

  paint();
  row.append(el('div', 'flab', label), slot, out);
  /* THE SAME HANDLE THE OTHER FOUR EXPOSE, and the last one to get it. Two
     arguments because a span is two numbers, and the far cap is clamped the
     same way a drag clamps it — a config that stored a crossed pair does not
     get to put the control in a state a hand could not.
     Silent, like the others: a host pushing a loaded config into a panel is
     not a user turning a knob, and firing onChange here is how a config load
     turns into a re-render per control. */
  row.set = (x, y) => {
    a = q(x);
    b = Math.max(q(y), a + MIN_SPAN * (max - min));
    paint();
  };
  return row;
}

/* ── ONE CAP: the plain fader, and its two variations ─────────────────────
   The range fader above is the exception, not the type. The type is a single
   cap in a slot, and the refs are unanimous about it: the EQ-200, the TX-6,
   the K.O.II and the Sidekick are all banks of one-cap faders. Three forms,
   one factory, because they differ in two things only — where the lit fill
   starts, and which way the slot runs.

     LEVEL    fill runs from the end of the slot to the cap. The value is how
              much of the track is lit, which is why this is the right control
              for anything that has a floor and a ceiling and no natural
              middle.

     CENTRE   fill runs from the middle out to the cap, in whichever
              direction. A trim is not "how much", it is "how far off", and a
              fill that always starts at the left cannot say that. The scale
              gets a long tick at zero and the cap DETENTS there: inside 3% of
              the middle it snaps, the way a real centre-detent pot has a
              notch cut in its track. Zero is a place you can find without
              looking, which is the entire point of the part.

     VERTICAL the same control stood up. Not a style choice: a bank of them
              is readable across at a glance because the caps make a profile,
              which is why every mixer on earth is built this way and why the
              EQ-200's twelve bands are legible as a curve.

   The cap is 17px along its travel in both orientations, so all three share
   the same geometry as the range fader: a cap CENTRE at t sits at
   `t*100% - (t-.5)*CAP_W`, which keeps the cap inside the slot at both ends
   without the value lying about where it is. */
function fader({ label, min, max, step = 0.01, value, fmt, mode = 'level',
                 vert = false, onChange } = {}) {
  const row = el('div', `fader${vert ? ' vert' : ''}${mode === 'center' ? ' bi' : ''}`);
  const slot = el('div', 'fslot');
  const track = el('div', 'ftrack');
  const fill = el('div', 'ffill');
  const cap = el('div', 'fcap');
  const out = el('div', 'kval');
  track.append(fill, cap);
  slot.append(track, el('div', 'fticks'));
  let v = value;

  // the neutral point a centre fader measures FROM: real zero if the range
  // crosses it, the middle of the range otherwise
  const zero = (mode === 'center') ? ((min < 0 && max > 0) ? (0 - min) / (max - min) : .5) : 0;
  const DETENT = .03;

  const q = x => +Math.min(max, Math.max(min, Math.round(x / step) * step)).toFixed(6);
  const norm = x => (x - min) / (max - min);
  const cx = t => `calc(${t * 100}% - ${(t - .5) * CAP_W}px)`;
  const span = d => `calc(${d * 100}% - ${d * CAP_W}px)`;

  const paint = () => {
    const t = norm(v);
    cap.style[vert ? 'top' : 'left'] = cx(vert ? 1 - t : t);
    if (mode === 'center') {
      const lo = Math.min(zero, t), hi = Math.max(zero, t);
      fill.style[vert ? 'top' : 'left'] = cx(vert ? 1 - hi : lo);
      fill.style[vert ? 'height' : 'width'] = span(hi - lo);
    } else if (vert) {
      fill.style.top = cx(1 - t); fill.style.bottom = '2px'; fill.style.height = 'auto';
    } else {
      fill.style.left = '2px'; fill.style.width = `calc(${cx(t)} - 2px)`;
    }
    out.textContent = fmt ? fmt(v) : v;
    cap.setAttribute('aria-valuenow', v);
    cap.setAttribute('aria-valuetext', out.textContent);
  };
  // silent while it slides — see the note on the range fader's `set`. The ONE
  // thing a fader can click on is a notch that is really cut in the part, and
  // `held` is what makes it fire once on the way in rather than on every
  // pointermove for as long as you sit in the band.
  let held = false;
  const set = (x, quiet) => {
    v = q(x);
    // the notch: inside 3% of the middle the cap falls into zero
    if (mode === 'center' && Math.abs(norm(v) - zero) < DETENT) {
      v = q(min + zero * (max - min));
      if (!held && !quiet) SFX.clack();
      held = true;
    } else held = false;
    paint(); onChange && onChange(v);
  };

  // same as the range fader: the TRACK takes every pointer event, so you
  // click the line rather than aiming at the cap
  const fromXY = e => {
    const r = track.getBoundingClientRect();
    const usable = (vert ? r.height : r.width) - CAP_W;
    const at = vert ? (r.bottom - e.clientY - CAP_W / 2) : (e.clientX - r.left - CAP_W / 2);
    set(min + Math.min(1, Math.max(0, at / usable)) * (max - min));
  };
  track.addEventListener('pointerdown', e => {
    track.setPointerCapture(e.pointerId); track.dataset.on = '1'; SFX.grab(); fromXY(e);
  });
  track.addEventListener('pointermove', e => { if (track.dataset.on) fromXY(e); });
  // see the note on the knob: capture can end without a pointerup
  const rEnd = () => { if (track.dataset.on) SFX.drop(); delete track.dataset.on; };
  track.addEventListener('pointerup', rEnd);
  track.addEventListener('pointercancel', rEnd);
  track.addEventListener('lostpointercapture', rEnd);
  track.addEventListener('wheel', e => {
    e.preventDefault(); set(v - Math.sign(e.deltaY) * (e.shiftKey ? step : (max - min) / 40));
  }, { passive: false });

  cap.tabIndex = 0;
  cap.setAttribute('role', 'slider');
  cap.setAttribute('aria-label', label);
  cap.setAttribute('aria-valuemin', min);
  cap.setAttribute('aria-valuemax', max);
  cap.addEventListener('keydown', e => {
    const d = e.shiftKey ? step : (max - min) / 20;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(v + d); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(v - d); }
  });

  paint();
  typeable(out, () => v, set);
  row.append(el('div', 'flab', label), slot, out);
  row.set = x => set(x, true);         // same handle knob() exposes, same reason
  return row;
}
/* ══════════════════════════════════════════════════════════════════════════
   THE COLOUR PICKER — a plate that happens to return a colour.

   It is a PRIMITIVE, not a part of any one panel: openPicker() takes an
   anchor and a callback, and anything with a colour on it can call it. The
   hatch bay's refillable pens were the first caller and are not the only
   possible one, which is the whole reason it lives up here with the faders
   and the keys rather than down inside that bay.

   Colour maths in one place: hex is what the outside world speaks, HSV is
   what a field-and-hue picker is FOR (the two axes of the square are S and V
   and the slot is H), so the widget holds HSV and converts at the edges.
   ══════════════════════════════════════════════════════════════════════════ */
const hex2rgb = h => {
  const m = /^#?([\da-f]{6})$/i.exec(h.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
};
const rgb2hex = ([r, g, b]) =>
  '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const rgb2hsv = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d + 6) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, mx ? d / mx : 0, mx];
};
const hsv2rgb = ([h, s, v]) => {
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  const t = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor((h % 360) / 60)];
  return t.map(u => (u + m) * 255);
};

/* THE WELL SHOWS THE CASE, NOT A GUESS AT ONE.

   It was seeded with five hard-coded colours, which was the worst of both: they
   look like they mean something and they mean nothing, and the moment the rail
   changed they were five stale duplicates of a palette that no longer existed.

   So the caller says what belongs in the well. A picker opened from a rail
   passes THAT RAIL — the other pens in the case, which is the set you actually
   reach for, and which is live by definition. A picker opened from nowhere in
   particular falls back to what has genuinely been picked before, starting
   empty rather than starting wrong. */
const PK_RECENT = [];

/* WHICH SWATCH THE OPEN PLATE BELONGS TO, and its closer. Kept out here
   because "is one already open, and is it this one's" is a question about the
   page rather than about any single call. */
let pkOpen = null;

function openPicker(anchor, value, onChange, swatches) {
  /* THE SWATCH THAT OPENS IT CLOSES IT. Every other way out was already there
     — Escape, a click anywhere else — except the one the hand reaches for
     first, which is the thing you just clicked. Without this, clicking it
     again tore the plate down and built an identical one in the same place: a
     control that visibly does nothing, which is worse than one that does
     nothing quietly, because you try it twice.

     One plate at a time either way, so an open one always closes first — and
     if it was THIS anchor's, that is the whole of the gesture. */
  if (pkOpen) {
    const same = pkOpen.anchor === anchor;
    pkOpen.close();
    if (same) return null;
  }
  let [h, s, v] = rgb2hsv(hex2rgb(value) || [255, 106, 0]);

  const plate = el('div', 'plate picker');
  const bodyEl = el('div', 'plate-body');

  const fieldEl = el('div', 'pk-field');
  const cross = el('div', 'pk-cross');
  fieldEl.append(cross);

  const drop = key(ICON.dropper, { title: 'Sample a colour from the screen' });
  const hue = fader({
    label: 'Hue', min: 0, max: 360, step: 1, value: h,
    onChange: x => { h = x; push(); },
  });
  hue.classList.add('pk-hue');
  const row = el('div', 'pk-row');
  row.append(drop, hue);

  const lcd = el('div', 'lcd pk-lcd');
  const mk = (cls, w) => {
    const i = el('input', cls);
    i.type = 'text'; i.spellcheck = false; i.setAttribute('aria-label', w);
    return i;
  };
  const rI = mk('', 'Red'), gI = mk('', 'Green'), bI = mk('', 'Blue'), xI = mk('hex', 'Hex');
  lcd.append(rI, el('span', 'pk-sep', '·'), gI, el('span', 'pk-sep', '·'), bI,
             el('span', 'pk-sep', '·'), xI);
  const legend = el('div', 'pk-legend', '<span>R</span><span>G</span><span>B</span>');

  const well = el('div', 'pk-well');
  const drawWell = () => {
    const list = (typeof swatches === 'function' ? swatches() : swatches) || PK_RECENT;
    const now = hexNow().toUpperCase();
    well.textContent = '';
    list.forEach(c => {
      /* THE ONE YOU ARE EDITING IS SEATED, exactly as it is in the rail. Two
         rails of the same object showing the same state the same way is the
         whole reason it is the same object. */
      const p = el('button', 'pencap' + (c.toUpperCase() === now ? ' on' : ''));
      p.type = 'button'; p.style.setProperty('--ink', c); p.title = c.toUpperCase();
      p.setAttribute('aria-label', c.toUpperCase());
      p.addEventListener('click', () => {
        [h, s, v] = rgb2hsv(hex2rgb(c)); push();
      });
      well.append(p);
    });
    well.hidden = !list.length;
  };

  bodyEl.append(fieldEl, row, lcd, legend, well);
  plate.append(bodyEl);
  document.body.append(plate);

  /* ANCHORED TO THE THING THAT SUMMONED IT, and flipped rather than clipped:
     a plate that opens off the bottom of the window is a plate you cannot
     use. Measured after it is in the DOM, because its height depends on
     whether the dropper is there. */
  const place = () => {
    const a = anchor.getBoundingClientRect(), p = plate.getBoundingClientRect();
    let x = a.left + a.width / 2 - p.width / 2;
    let y = a.bottom + 9;
    if (y + p.height > innerHeight - 8) y = Math.max(8, a.top - p.height - 9);
    plate.style.left = Math.max(8, Math.min(x, innerWidth - p.width - 8)) + 'px';
    plate.style.top = y + 'px';
  };
  place();

  const hexNow = () => rgb2hex(hsv2rgb([h, s, v]));
  let typing = null;
  function push(silent) {
    const rgb = hsv2rgb([h, s, v]).map(Math.round), hx = rgb2hex(rgb);
    fieldEl.style.setProperty('--pk-h', h.toFixed(1));
    cross.style.left = (s * 100) + '%';
    cross.style.top = ((1 - v) * 100) + '%';
    cross.style.background = hx;
    if (typing !== 'rgb') { rI.value = rgb[0]; gI.value = rgb[1]; bI.value = rgb[2]; }
    if (typing !== 'hex') xI.value = hx.toUpperCase();
    if (!silent) onChange(hx);
    drawWell();          // the seated swatch follows the value, and so does the rail
  }

  // the field: S across, V up. Pointer capture so a drag that leaves the
  // square keeps working, same as every other control here.
  const fromXY = e => {
    const r = fieldEl.getBoundingClientRect();
    s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    push();
  };
  fieldEl.addEventListener('pointerdown', e => {
    fieldEl.setPointerCapture(e.pointerId); fieldEl.dataset.on = '1'; fromXY(e);
  });
  fieldEl.addEventListener('pointermove', e => { if (fieldEl.dataset.on) fromXY(e); });
  // see the note on the knob: capture can end without a pointerup
  const pEnd = () => delete fieldEl.dataset.on;
  fieldEl.addEventListener('pointerup', pEnd);
  fieldEl.addEventListener('pointercancel', pEnd);
  fieldEl.addEventListener('lostpointercapture', pEnd);

  // EDITABLE IN PLACE. `typing` stops the field writing over the box you are
  // in the middle of typing into — the classic two-way-binding cursor jump.
  const readRGB = () => {
    const n = [rI, gI, bI].map(i => parseInt(i.value, 10));
    if (n.some(x => Number.isNaN(x))) return;
    typing = 'rgb'; [h, s, v] = rgb2hsv(n.map(x => Math.max(0, Math.min(255, x))));
    push(); typing = null;
  };
  [rI, gI, bI].forEach(i => i.addEventListener('input', readRGB));
  xI.addEventListener('input', () => {
    const rgb = hex2rgb(xI.value);
    if (!rgb) return;
    typing = 'hex'; [h, s, v] = rgb2hsv(rgb); push(); typing = null;
  });

  /* THE EYEDROPPER IS A KEY, and it is HIDDEN rather than dead-styled where
     the API does not exist. A control that is present and cannot work is worse
     than one that was never offered. */
  if (window.EyeDropper) {
    drop.addEventListener('click', async () => {
      try {
        const r = await new EyeDropper().open();
        [h, s, v] = rgb2hsv(hex2rgb(r.sRGBHex)); push();
      } catch { /* cancelled — nothing to report */ }
    });
  } else {
    drop.remove();
  }

  const close = () => {
    pkOpen = null;
    const hx = hexNow();
    if (!PK_RECENT.includes(hx)) { PK_RECENT.unshift(hx); PK_RECENT.length = 8; }
    plate.remove();
    document.removeEventListener('pointerdown', outside, true);
    document.removeEventListener('keydown', onKey, true);
  };
  const outside = e => { if (!plate.contains(e.target) && !anchor.contains(e.target)) close(); };
  const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  pkOpen = { anchor, close };
  // deferred, or the click that opened it closes it again in the same tick
  setTimeout(() => document.addEventListener('pointerdown', outside, true));
  document.addEventListener('keydown', onKey, true);

  push(true);
  place();
  return plate;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE DRUM — a selector for a list the dial cannot hold

   THE ROTARY HAS A CEILING AND IT IS ABOUT SIX. Its fan is a fixed 80°, so
   the detents run from 27° apart at four names to 9° at ten, and a real
   selector switch detents at about 30° — long before the names stop fitting,
   the positions stop being aimable. The rotary's whole claim is that it SHOWS
   EVERY POSITION AT ONCE and points at the one you are on, and past six you
   cannot keep that and keep the switch.

   So this gives up the half that cannot survive, and gives it up HONESTLY. A
   drum shows the NEIGHBOURHOOD: the one you are on, lit, in a milled window,
   with the names either side of it curving away. You do not see all ten — but
   nothing here pretends you do, which is the difference between this and a
   `<select>`. A select is a list that HIDES; a drum is a list you are looking
   at part of, and the part you cannot see is visibly still there, rolling
   round the back of the cylinder.

   IT IS A REAL CYLINDER, not a scaled list. Each name sits on the surface of
   one — rotated about the drum's axis and pushed out to its radius in 3D — so
   the spacing compresses towards the edges the way a drum's does, and the top
   and bottom rows fall away rather than just fading. A list with an opacity
   ramp on it is a list with an opacity ramp on it; the eye knows.
   ══════════════════════════════════════════════════════════════════════════ */
/* THE GEOMETRY, AND IT HAS TO BE SOLVED RATHER THAN GUESSED. A name k steps
   from the centre sits at y = R·sin(kθ) once projected, so how many you can
   see is fixed by the window height and NOT by how many you draw. At 18° and
   an 18px pitch the radius is 57px, which puts the second name 33px out and
   the third 46px — so a 76px window shows five and clips the sixth, which is
   the right amount of neighbourhood for a list of ten. */
const DRUM_STEP = 18, DRUM_ROW = 18;                 // degrees per name, px per name
const DRUM_R = DRUM_ROW / (2 * Math.tan(DRUM_STEP * Math.PI / 360));

/* THE DETENT MAKES A NOISE, because a detent is a noise, and THAT is the
   argument the whole voice bank at the top of the kit grew out of — this
   control's defining feature, the notch it drops into, has no visual at all.
   It is `SFX.roll` now rather than the chirp it shipped with: a barrel with
   mass in it, not a bleep. The chirp is deleted rather than left unread. */

function drum({ options, index = 0, label, onChange }) {
  /* THE WHOLE ASSEMBLY DROPS INTO A WELL. A drum standing on the faceplate is
     a drum somebody left there; a drum in a milled recess with a margin of
     floor round it is a drum the case was CUT FOR. The room around it is the
     whole of the difference — butt the walls up against the window and the
     well disappears, because a recess is read from its floor and not from its
     walls, and with no floor showing there is nothing to read. */
  const bay = el('div', 'drum-bay');
  const wrap = el('div', 'drum');
  const win = el('div', 'drum-win');
  const list = el('div', 'drum-list');
  /* THE WHOLE DRUM IS PUSHED BACK BY ITS OWN RADIUS. Without this the front
     name sits R in front of the screen and the perspective magnifies it —
     200/(200-57) is 1.4×, so every name overflowed the window and came out
     sliced down both sides. Back by R and the row you are reading lands at
     z = 0 at its true size, with the others falling away behind it, which is
     what looking at a drum actually is. */
  list.style.transform = `translateZ(${(-DRUM_R).toFixed(2)}px)`;
  win.append(list);
  /* THE KNURL IS ON THE EDGE YOU WOULD TOUCH. A drum is gripped at its rim,
     not at its face — the face is where the names are, and a knurl across it
     would be a texture over the one thing being read. */
  const grip = el('div', 'drum-grip');
  wrap.append(win, grip);

  const items = options.map((o, i) => {
    const it = el('button', 'drum-item', o);
    it.type = 'button';
    it.setAttribute('role', 'option');
    it.addEventListener('click', () => set(i));
    list.append(it);
    return it;
  });

  win.tabIndex = 0;
  win.setAttribute('role', 'listbox');
  if (label) win.setAttribute('aria-label', label);

  let i = index;
  const paint = () => {
    /* AND THE WHEEL ROLLS WITH IT. The surface travels R·θ per detent, which
       for an 18px pitch at 18° is 17.9px — near enough the row height that one
       number does both, and the teeth move exactly as far as the names do,
       which is the only way a wheel and the thing it drives can agree. */
    grip.style.setProperty('--roll', `${(-i * DRUM_ROW).toFixed(1)}px`);
    items.forEach((it, n) => {
      const a = (n - i) * DRUM_STEP;
      /* Anything past 84° is on the far side of the drum and must not be
         clickable — it is behind the panel. backface-visibility would hide it
         and still take the pointer. */
      const gone = Math.abs(a) > 84;
      it.style.transform = `rotateX(${-a}deg) translateZ(${DRUM_R}px)`;
      it.style.opacity = gone ? 0 : Math.max(0, Math.cos(a * Math.PI / 180)) ** 1.6;
      it.style.pointerEvents = gone ? 'none' : 'auto';
      it.classList.toggle('on', n === i);
    });
    win.setAttribute('aria-activedescendant', options[i]);
  };
  /* IT IS BLOCKED BETWEEN NOTCHES, on purpose. A detent that can be crossed as
     fast as the input arrives is not a detent, it is a slider with names on
     it: a trackpad delivers sixty events a second and the list becomes a blur
     you cannot stop on. 70ms is about as fast as a thumb can actually index a
     real wheel, and it is what makes the thing feel sprung rather than free.

     THE LOCKOUT IS ON THE GESTURE, NOT ON set(). A tab switch or a preset
     writing six controls at once must land immediately and silently — the
     resistance belongs to the hand, not to the value. */
  let lastAt = 0;
  const DETENT_MS = 70;
  const set = (n, quiet) => {
    const to = Math.max(0, Math.min(options.length - 1, n));
    if (to === i) return;
    i = to; paint();
    if (!quiet) {
      SFX.roll();
      win.classList.remove('knock'); void win.offsetWidth; win.classList.add('knock');
    }
    onChange && onChange(options[i], i);
  };
  const step = n => {
    const now = performance.now();
    if (now - lastAt < DETENT_MS) return;
    const before = i;
    set(n);
    if (i !== before) lastAt = now;
  };

  /* DRAG IS VERTICAL AND SO IS THE DRUM. One row per DRUM_ROW of travel, which
     is the same distance the name moves — the thing under your finger goes
     where your finger goes, which is the only gesture a cylinder can honestly
     offer. */
  /* YOU TURN IT BY THE WHEEL, NOT BY THE NAMES. Dragging across the window
     was dragging across TEXT, so the browser did what it does with text and
     started selecting it — a blue smear over the list, and the drum moving
     underneath. The names are not a handle; they are the thing being read, and
     the wheel is right there for the hand. A click on a name still picks it,
     because that is a click and not a drag. */
  let sy = 0, si = 0, on = false;
  grip.addEventListener('pointerdown', e => {
    grip.setPointerCapture(e.pointerId); on = true; sy = e.clientY; si = i;
    e.preventDefault();
  });
  grip.addEventListener('pointermove', e => {
    if (on) step(si - Math.round((e.clientY - sy) / DRUM_ROW));
  });
  const end = () => { on = false; };
  grip.addEventListener('pointerup', end);
  grip.addEventListener('pointercancel', end);
  grip.addEventListener('lostpointercapture', end);
  /* the wheel still works over the whole thing — a scroll is not a grab, and
     nobody aims a trackpad at a 24px strip */
  grip.addEventListener('wheel', e => win.dispatchEvent(new WheelEvent('wheel', e)),
                        { passive: false });
  /* THE WHEEL ACCUMULATES INSTEAD OF STEPPING PER EVENT. One notch per event
     is right for a mouse, which sends one big delta per click, and wrong for a
     trackpad, which sends a stream of small ones — so a flick that meant "down
     one" ran the whole list past. Travel is added up and a name is taken every
     42px of it, which is roughly the same distance a drag needs for two rows:
     the same wheel, the same list, the same speed, whichever device is on it.

     Reversing zeroes the tally, or a change of mind has to pay off the travel
     it already banked in the other direction before anything moves. */
  /* A MOUSE CLICK AND A TRACKPAD FLICK ARE NOT THE SAME EVENT, and treating
     them as one was the whole problem. A wheel sends one big delta per notch;
     a trackpad sends a stream of small ones. Accumulating everything made the
     mouse fire twice per click, and stepping per event made the trackpad run
     the list past. So: a big delta IS a notch and lands at once, and small
     ones are added up until they are worth one. Either way it goes through
     step(), so the detent lockout has the last word and no gesture can index
     faster than a real wheel would.

     AND THE DIRECTION IS INVERTED, because you are turning a cylinder and not
     scrolling a list. Push down on the face of a wheel and its top rolls away
     from you: the names come UP past the window, so the one you land on is
     the one that was above. Matching the scrollbar convention here would mean
     the drum turned the opposite way to the thumb on it. */
  let acc = 0;
  const WHEEL_STEP = 64, WHEEL_NOTCH = 40;
  win.addEventListener('wheel', e => {
    e.preventDefault();
    const d = e.deltaY;
    if (d * acc < 0) acc = 0;
    if (Math.abs(d) >= WHEEL_NOTCH) { acc = 0; step(i - Math.sign(d)); return; }
    acc += d;
    if (Math.abs(acc) >= WHEEL_STEP) { step(i - Math.sign(acc)); acc = 0; }
  }, { passive: false });
  win.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); step(i + 1); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); step(i - 1); }
    if (e.key === 'Home') { e.preventDefault(); set(0); }
    if (e.key === 'End') { e.preventDefault(); set(options.length - 1); }
  });

  paint();
  bay.append(wrap);
  bay.set = n => { i = Math.max(0, Math.min(options.length - 1, n)); paint(); };  // silent, immediate
  return bay;
}

/* ── the rotary selector: a teardrop lever on a ring of marks ─────────────── */
function rotary({ options, index, onChange, compact = false }) {
  const uid = 'tr' + (rotary.n = (rotary.n || 0) + 1);
  const row = el('div', 'rotary');
  row.append(el('span', 'rot-seat'));

  /* THE TEARDROP. Circle of r=21 centred at (50,51), tapering to a tip at
     (50,5) — two curves down each shoulder and the arc round the bottom. Drawn
     in SVG because the silhouette is the control: a CSS border-radius teardrop
     has a visible seam where the two radii meet, and this one rotates, so the
     seam would swing round with it. */
  /* A ROUND CAP WITH A POINTER, and the roundness is the ARGUMENT rather than
     a style. The lever was a teardrop, and a teardrop has to rotate as a whole
     — which means its lighting rotates too, so "lit from above left" spent
     half the dial lit from below right. A circle has no orientation, so the
     CAP never turns, its lighting is nailed to the room like every other cap
     here, and the only thing that moves is the line. That is what a pointer
     is, and why every real rotary switch ever built is round.

     MATTE, AND MACHINED. The first round build was one big radial sheen on a
     dark disc, which is how you draw a plastic bead: a broad soft gloss says
     the surface is smooth and slightly wet. A machined knob is the opposite —
     the face is nearly flat in value and the light lives in the EDGES, a
     hairline on the rim and a knurled collar that catches it tooth by tooth.
     So the bloom is gone, the face barely moves across its width, and what
     reads is a lit rim, a ring of teeth, and one line. */
  /* THE KNOB IS FOUR RINGS AND A DOT, read off the reference and built in that
     order from the outside in — a knurled collar, a lit bevel, a near-flat
     face, and one small bright indicator.

     THE FACE IS ALMOST FLAT IN VALUE. That is the single thing that separates
     machined metal from a plastic bead: a broad radial sheen across the top
     says the surface is domed and slightly wet, and a real knob's top is a
     turned disc. So the face barely moves across its width and ALL the light
     lives in the edges — a crisp ring on the bevel, and a collar of teeth that
     each catch the lamp separately.

     THE INDICATOR IS A DOT, NOT A LINE. A line is a second radius competing
     with the ring it sits inside; a dot is a position and nothing else, which
     is all a pointer has ever had to be. */
  const TEETH = 52;
  const LAMP = -2.36;                                   // up and left, 158°
  const knurl = Array.from({ length: TEETH }, (_, i) => {
    const a = (i / TEETH) * Math.PI * 2, c = Math.cos(a), s2 = Math.sin(a);
    /* A tooth facing the lamp is a bright fleck and one facing away is a dark
       one — that alternation IS the knurl. A uniform ring of ticks is a
       texture, and textures do not turn in the light. */
    const lit = Math.max(0, Math.cos(a - LAMP)) ** 1.7;
    return `<line x1="${(50 + c * 40.5).toFixed(2)}" y1="${(50 + s2 * 40.5).toFixed(2)}"` +
           ` x2="${(50 + c * 47).toFixed(2)}" y2="${(50 + s2 * 47).toFixed(2)}"` +
           ` stroke="#fff" stroke-opacity="${(0.05 + lit * 0.5).toFixed(3)}"` +
           ` stroke-width="1.35" stroke-linecap="round"/>`;
  }).join('');
  const knob = el('div', 'rot-knob',
    `<svg class="tear" viewBox="0 0 100 100" aria-hidden="true">
       <defs>
         <linearGradient id="${uid}c" x1="22%" y1="2%" x2="78%" y2="98%">
           <stop offset="0"   stop-color="#31363d"/>
           <stop offset=".5"  stop-color="#1b1f24"/>
           <stop offset="1"   stop-color="#0e1114"/>
         </linearGradient>
         <!-- the bevel: a full ring, brightest where it turns into the lamp
              and never quite dark, because a turned edge catches something all
              the way round -->
         <linearGradient id="${uid}r" x1="26%" y1="0%" x2="74%" y2="100%">
           <stop offset="0"   stop-color="#ffffff" stop-opacity=".95"/>
           <stop offset=".30" stop-color="#ffffff" stop-opacity=".46"/>
           <stop offset=".58" stop-color="#ffffff" stop-opacity=".10"/>
           <stop offset=".84" stop-color="#ffffff" stop-opacity=".16"/>
           <stop offset="1"   stop-color="#ffffff" stop-opacity=".32"/>
         </linearGradient>
         <radialGradient id="${uid}f" cx="42%" cy="34%" r="92%">
           <stop offset="0"   stop-color="#22262b"/>
           <stop offset=".72" stop-color="#1a1e22"/>
           <stop offset="1"   stop-color="#121517"/>
         </radialGradient>
       </defs>
       <circle cx="50" cy="50" r="48" fill="url(#${uid}c)" stroke="#08090b" stroke-width="1"/>
       <g>${knurl}</g>
       <circle cx="50" cy="50" r="38.6" fill="none"
               stroke="url(#${uid}r)" stroke-width="2.6"/>
       <circle cx="50" cy="50" r="36.6" fill="url(#${uid}f)"
               stroke="#0b0d10" stroke-width=".9"/>
       <g class="tear-ptr">
         <circle cx="50" cy="27.5" r="5.6" fill="#ffffff" opacity=".10"/>
         <circle cx="50" cy="27.5" r="2.7" fill="#f2f6fb"/>
       </g>
     </svg>`);
  knob.tabIndex = 0;
  knob.setAttribute('role', 'listbox');
  knob.setAttribute('aria-label', 'Place from');
  const tear = knob.querySelector('.tear');
  row.append(knob);

  /* THE MARKS FAN TO ONE SIDE AND THE NAMES ARE A COLUMN.

     Two separate things were wrong with a 270° ring. The knob had to be
     wrenched three-quarters of a turn to cross four positions — a lot of wrist
     for four items — and the names sat at four different angles round the
     dial, so picking one meant finding it first. Here the whole switch lives
     in 76° on the side facing into the panel: three short steps end to end.

     The NAMES ignore that geometry entirely. They are an evenly spaced
     vertical list at a fixed x — scanned top to bottom like any list, and each
     one a comfortable click target rather than a word wedged between two
     ticks. The LEADER absorbs the mismatch: it leaves the tick on the radius,
     elbows, and runs flat into its name. That is the whole job of a leader
     line on a real panel, and it is why engraved gear can put a tidy list
     beside a round switch without lying about where the detents are. */
  const N = options.length, A0 = 50, A1 = 130;     // clockwise from 12 o'clock
  /* COMPACT IS FOR A SETTINGS BAY, where a switch is one of five on a 318px
     panel rather than the one object in a viewport. Nothing about the switch
     changes — same fan, same detents, same leaders — only the space it is
     allowed to reserve: names 4px closer together, and a floor that comes from
     the SEAT rather than from a constant. */
  const LEAD_R = 40, LAB_GAP = compact ? 18 : 22;
  /* AND THE NAMES COME IN, not just closer together — 8px of name back on
     every switch, on a panel where 8px is the difference between a word
     fitting and being abbreviated.

     BUT THE ELBOW CANNOT COME IN WITH THEM, and at 34 it had. The rim of the
     fan reaches x = 39.6 at the middle detents, so an elbow at 34 is INSIDE
     the dial: the leader left the tick, travelled five pixels BACKWARDS
     towards the knob, turned, and came out again. Four of the six leads on a
     compact switch were drawn inside out, which is what "the lines go in
     chaotic directions" was — not a fan that had opened too far, a fan
     pointing the wrong way.

     41 IS THE FLOOR AND IT IS NOT A TASTE: it is LEAD_R plus one, the first
     whole pixel outside the rim, which is the same 1px of run the full-size
     one has always had at its middle detents. The names keep their 48 and
     compact keeps everything it was for. */
  const ELBOW_X = compact ? 41 : 40, LAB_X = compact ? 48 : 56;
  const FLOOR = compact ? 84 : 130;
  /* THE BOX GROWS WITH THE LIST. It was a fixed 130px, which fits six names at
     22px apart and silently clips the seventh — and worse, the column is
     centred, so the overflow goes UP as well as down and the first name lands
     on the caption above the bay. A selector that quietly writes over its own
     heading is a selector that looks broken for a reason nobody can see.

     Six is still the sensible ceiling — the fan is a fixed 80°, so the detents
     go from 16° apart at six to 9° at ten and stop being aimable long before
     they stop fitting. Growing the box does not raise that ceiling; it just
     stops the failure being invisible. Past six, use the drum. */
  const SVG_W = 150, SVG_H = Math.max(FLOOR, (N - 1) * LAB_GAP + 34), CY = SVG_H / 2;
  const leadSvg = el('div', null,
    `<svg class="rot-leads" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}"
          aria-hidden="true"></svg>`).firstElementChild;
  leadSvg.style.marginTop = `${-CY}px`;           // the CSS -65px was half of the old fixed box
  row.style.minHeight = `${Math.max(compact ? 78 : 116, SVG_H)}px`;
  row.append(leadSvg);

  const labs = [];
  options.forEach((o, n) => {
    const a = A0 + (n / (N - 1)) * (A1 - A0);
    const rad = a * Math.PI / 180;
    const ex = Math.sin(rad) * LEAD_R, ey = -Math.cos(rad) * LEAD_R;
    const ly = (n - (N - 1) / 2) * LAB_GAP;


    const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    pl.setAttribute('class', 'rot-lead');
    pl.setAttribute('points',
      `${ex.toFixed(1)},${(ey + CY).toFixed(1)} ${ELBOW_X},${(ly + CY).toFixed(1)} ${LAB_X - 6},${(ly + CY).toFixed(1)}`);
    leadSvg.append(pl);

    const lab = el('button', 'rot-lab', o);
    lab.type = 'button';
    // Two chained translates rather than one with calc(): `calc(0 + 62px)` is
    // invalid — a bare 0 cannot be added to a length — and an invalid transform
    // is DROPPED, which parked every label on top of the knob.
    lab.style.transform = `translate(${LAB_X}px, ${ly}px) translate(0, -50%)`;
    lab.addEventListener('click', () => set(n));
    row.append(lab); labs.push(lab);
  });

  let i = index;
  const paint = () => {
    /* THE POINTER READS THE SAME GEOMETRY THE TICKS DO. It did not: the marks
       were narrowed to the 50–130° fan and this line was left sweeping the old
       -135 → +135, so the tip pointed at an angle no detent was at — the switch
       said one thing and the lit mark said another. One expression, used twice. */
    tear.style.setProperty('--deg', (A0 + (i / (N - 1)) * (A1 - A0)) + 'deg');
    labs.forEach((l, n) => l.classList.toggle('on', n === i));
    knob.setAttribute('aria-activedescendant', options[i]);
  };
  // A ROTARY IS ALL DETENT — there is no travel between its positions, only
  // positions — so it gets the detent's own voice, and only when `i` moves.
  const set = n => {
    const was = i;
    i = Math.max(0, Math.min(N - 1, n));
    if (i !== was) SFX.clack();
    paint(); onChange && onChange(options[i], i);
  };
  /* the same handle knob() and fader() expose, and for the same reason: a
     control another control has to be able to move needs a way in that is not
     "rebuild it" */
  row.set = n => { i = Math.max(0, Math.min(N - 1, n)); paint(); };

  let sy = 0, si = 0;
  knob.addEventListener('pointerdown', e => {
    knob.setPointerCapture(e.pointerId); knob.classList.add('dragging'); sy = e.clientY; si = i;
  });
  knob.addEventListener('pointermove', e => {
    if (!knob.classList.contains('dragging')) return;
    // down = clockwise = down the list, which is also the order the names are
    // printed in — the gesture, the rotation and the reading all agree
    set(si + Math.round((e.clientY - sy) / 26));
  });
  // see the note on the knob: capture can end without a pointerup
  const kEnd = () => knob.classList.remove('dragging');
  knob.addEventListener('pointerup', kEnd);
  knob.addEventListener('pointercancel', kEnd);
  knob.addEventListener('lostpointercapture', kEnd);
  knob.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); set(i + 1); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); set(i - 1); }
  });
  paint();
  return row;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE AXIS BALL — the selector whose options are DIRECTIONS

   THE THIRD SELECTOR, AND THE COUNT DOES NOT DECIDE IT. rotary() and drum()
   are picked by how many names there are: six you can aim a lever at, or more
   than a dial can hold. This one is picked by what the names ARE. Six
   directions in a space, and for those the PICTURE is the control — you do not
   read the word "Right", you click the red node on the right.

   SO THE SET IS FIXED AT SIX AND THE CALLER CANNOT REARRANGE IT. A space has
   six axis directions and this part is that fact. `views` RENAMES them — an
   app that calls +Z "Camera" is still choosing +Z — but the order is the
   geometry (+Z, +X, +Y, −Z, −X, −Y), because a list you could shuffle would
   let a caller print "Top" on the right-hand node, and that is a control that
   lies about where it points.

   HOLLOW IS THE FAR SIDE. Three of the six point away from the eye, and a ball
   drawn without that distinction is a flat cross with five beads on it: the
   near nodes are filled and catch the lamp, the far ones are rings. It is also
   why FRONT IS THE HUB — +Z comes straight at you, so it has no arm to draw
   and no length to draw it at. A vector aimed at the eye is a point, which is
   the same thing lightDir() says at the zenith and for the same reason.

   AND THE CURRENT VIEW IS LIT ON THE BALL. The first build of this — inline in
   the panels exploration — marked the choice only on the six keys beside it,
   so the ball was an input with no readout: press Top and it looks exactly as
   it did. A selector shows its own position or it is a row of buttons.
   ══════════════════════════════════════════════════════════════════════════ */
const GZ_VIEWS = ['Front', 'Right', 'Top', 'Back', 'Left', 'Bottom'];
function gizmo({ views = GZ_VIEWS, index = 0, onChange } = {}) {
  /* 132px of ball, 40px of arm, measured off the reference and left alone.
     There is no `size`: .gz-node is a 15px bead in the stylesheet and the
     knurl-and-bevel argument applies here too — a part sampled at a size the
     document does not use is a part nobody can check. */
  const C = 66, R = 40;
  const AX = { x: '#FF4A4A', y: '#4ADE80', z: '#5AA9FF' };

  const ball = el('div', 'gizmo');
  ball.setAttribute('role', 'radiogroup');
  ball.setAttribute('aria-label', 'View direction');

  const arm = (deg, len, ax) => {
    const a = el('div', 'gz-arm');
    a.style.cssText = `width:${len}px;transform:rotate(${deg}deg) translateY(-1px)`;
    a.style.setProperty('--ax', ax);
    return a;
  };
  /* four arms in the plane of the screen, and one FORESHORTENED at 62% for the
     axis running back into it. That single short arm is the whole reason this
     reads as a ball rather than a compass rose. */
  ball.append(arm(0, R, AX.x), arm(180, R, AX.x),
              arm(-90, R, AX.y), arm(90, R, AX.y),
              arm(-140, R * 0.62, AX.z));

  //  x, y, colour, hollow, diameter — in the order the views are named in
  const SEATS = [
    [C, C, AX.z, false, 17],                    // Front   +Z   the hub
    [C + R, C, AX.x, false],                    // Right   +X
    [C, C - R, AX.y, false],                    // Top     +Y
    [C - R * 0.48, C - R * 0.40, AX.z, true],   // Back    −Z
    [C - R, C, AX.x, true],                     // Left    −X
    [C, C + R, AX.y, true],                     // Bottom  −Y
  ];

  const nodes = SEATS.map(([x, y, ax, hollow, d], n) => {
    const b = el('button', 'gz-node' + (hollow ? ' hollow' : ''));
    b.type = 'button';
    b.style.cssText = `left:${x}px;top:${y}px`
      + (d ? `;width:${d}px;height:${d}px;margin:${-d / 2}px 0 0 ${-d / 2}px` : '');
    b.style.setProperty('--ax', ax);
    b.setAttribute('role', 'radio');
    b.title = `${views[n]} view`;
    b.setAttribute('aria-label', `${views[n]} view`);
    b.addEventListener('click', () => set(n));
    return b;
  });
  // the hub is laid down LAST so it sits over the five arms meeting under it
  ball.append(...nodes.slice(1), nodes[0]);

  let i = index;
  const paint = () => {
    nodes.forEach((b, n) => {
      const on = n === i;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(on));
      /* ROVING TABINDEX. Six tab stops for one choice is five too many, so the
         GROUP is the stop and the arrows walk inside it — which is what a
         radio group has always done, and what the rotary's listbox does with
         its own four. */
      b.tabIndex = on ? 0 : -1;
    });
  };
  // all detent and no travel, like the rotary, so it gets the same voice
  const set = n => {
    const was = i;
    i = Math.max(0, Math.min(nodes.length - 1, n));
    if (i !== was) SFX.clack();
    paint();
    onChange && onChange(views[i], i);
  };
  /* the handle knob(), fader() and rotary() all expose. The six keys beside a
     ball are the reason it has to exist: two controls on one choice, and
     neither of them may be rebuilt to follow the other. */
  ball.set = n => { i = Math.max(0, Math.min(nodes.length - 1, n)); paint(); };

  ball.addEventListener('keydown', e => {
    const n = nodes.length;
    let to = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (i + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (i + n - 1) % n;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = n - 1;
    else return;
    /* IT WRAPS, AND THE ROTARY DOES NOT. A lever has a first and a last detent
       because it is a lever; a set of axes has neither, and stopping the walk
       at Bottom would be a mechanical limit imported into a thing with no
       mechanism. */
    e.preventDefault();
    set(to);
    nodes[i].focus();
  });

  paint();
  return ball;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE PANEL OUTLINE: rounded rectangle ∪ lobe, joined by tangent fillets.

   Traversed clockwise from the top-left corner. Everything except the left
   edge is an ordinary rounded rect; on the way back UP the left edge the path
   flares out around the lobe and returns.

   THE FILLET is the whole point — a circle butting a straight line leaves two
   corners, and a moulded boss has a flare where it grows out of the face. A
   fillet of radius f is tangent to the edge (so its centre is f to the left of
   it) and externally tangent to the lobe (so its centre is R+f from the lobe's
   centre). Those two conditions fix it, and the tangent point on the lobe is
   just f/(R+f) of the way from one centre to the other.

     L   the face's left edge          cx,cy  lobe centre, cx > L so it crosses
     R   lobe radius                   f      fillet radius
   ══════════════════════════════════════════════════════════════════════════ */
function panelShape(w, h, cy, { L = 52, R = 44, f = 12, r = 14, cxOff = -8 } = {}) {
  const cx = L + cxOff;
  const fcx = L - f;                                  // fillet centre x
  const d = cx - fcx;                                 // centre-to-centre, x only
  const dy2 = (R + f) * (R + f) - d * d;
  if (dy2 <= 0 || cy - Math.sqrt(dy2) < r + 4 || cy + Math.sqrt(dy2) > h - r - 4) {
    // no room for the lobe on this panel — fall back to the plain rectangle
    return `inset(0 0 0 ${L}px round ${r}px)`;
  }
  const fy = Math.sqrt(dy2);                          // fillet centre offset from cy
  const k = f / (R + f);
  const px = fcx + d * k;                             // tangent point on the lobe
  const py = fy - fy * k;                             // …measured from cy
  const n = v => (+v).toFixed(2);
  return `path('M ${n(L + r)} 0
    H ${n(w - r)} A ${r} ${r} 0 0 1 ${n(w)} ${r}
    V ${n(h - r)} A ${r} ${r} 0 0 1 ${n(w - r)} ${n(h)}
    H ${n(L + r)} A ${r} ${r} 0 0 1 ${n(L)} ${n(h - r)}
    V ${n(cy + fy)}
    A ${f} ${f} 0 0 0 ${n(px)} ${n(cy + py)}
    A ${R} ${R} 0 0 1 ${n(px)} ${n(cy - py)}
    A ${f} ${f} 0 0 0 ${n(L)} ${n(cy - fy)}
    V ${r} A ${r} ${r} 0 0 1 ${n(L + r)} 0 Z')`.replace(/\s+/g, ' ');
}

/* FLASH THE CONTROL THAT WENT IN — ACROSS THE REBUILD THAT ATE IT.

   Every one of these panels redraws itself wholesale on a click, so the button
   you pressed does not exist by the time you would put a class on it. Its
   REPLACEMENT does, at the same index of the same selector inside the same
   root — and the roots (#dock, #editor, …) are the part that survives, because
   build() empties and refills them rather than replacing them. So: note the
   index, let the rebuild happen, find the new element, light it.

   Only if it actually ended up IN. Flipping a switch off is a circuit opening;
   there is nothing to surge. */
/* THE ROOTS ARE THE HOST'S, not the kit's — the one line that changed on the
   way out of skew-layers.html. Read at call time so a page can declare
   `window.ENGAGE_ROOTS` after the kit has loaded. */
const ENGAGE_ROOTS = '#dock, #editor, #viewport, #tools, #navbar, #console, #pages, #hatch, #handhatch, #serp';
function engage(btn, run, cls) {
  const root = btn.closest(window.ENGAGE_ROOTS || ENGAGE_ROOTS) || document.body;
  const sel = '.' + btn.className.trim().split(/\s+/)[0];
  const at = [...root.querySelectorAll(sel)].indexOf(btn);
  run();
  const now = [...root.querySelectorAll(sel)][at];
  if (!now || !now.classList.contains(cls)) return;
  now.classList.remove('engage'); void now.offsetWidth; now.classList.add('engage');
}

/* A key. `latch:true` stays down; otherwise it springs back and pulses. */
function key(html, { cls = '', title, down = false, latch = false, onClick, disabled = false } = {}) {
  const b = el('button', `key skirt ${cls}` + (down ? ' is-down' : ''), html);
  b.type = 'button';
  if (title) { b.title = title; b.setAttribute('aria-label', title); }
  b.disabled = disabled;
  if (latch) b.setAttribute('aria-pressed', String(down));
  b.addEventListener('click', () => {
    if (latch) { engage(b, () => onClick && onClick(b), 'is-down'); return; }
    b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
    onClick && onClick(b);
  });
  return clicky(b);
}
/* A piano key — latching, and its bar holds one down at a time. */
function pkey(labelHtml, { down = false, title, onClick, cls = '' } = {}) {
  const b = el('button', `pkey ${cls}` + (down ? ' is-down' : ''), labelHtml);
  b.type = 'button';
  b.setAttribute('role', 'radio');
  b.setAttribute('aria-checked', String(down));
  if (title) b.title = title;
  b.addEventListener('click', () => engage(b, () => onClick && onClick(), 'is-down'));
  return clicky(b, SFX.tap, SFX.lift);
}

/* ══════════════════════════════════════════════════════════════════════════
   THE ASSET ROW — load a file, and say what is loaded

   THE PART WAS ALREADY HALF HERE, WHICH IS WHY IT KEPT NOT GETTING BUILT.
   `.filmrow` and its four children have been in the stylesheet since the layer
   editor: a thumb, a name, a source line, a stack of small keys. What was
   missing is the half that is not CSS — the file input, the empty state, and
   the rule about what SAVE and CLEAR may do when there is nothing loaded. So
   every app wrote that half itself, and grepping this system for `type=file`
   returned nothing at all while nine apps had one each.

   THE INPUT IS HIDDEN AND THE FACTORY OWNS IT. `<input type=file>` cannot be
   styled — its button is browser chrome no CSS in this file reaches, which is
   the same reason `openPicker` exists instead of `input[type=color]`. So the
   input is off-screen, the LOAD key clicks it, and the caller is handed a File
   and never sees the element. It also resets `value` after every pick, because
   choosing the same file twice in a row fires no `change` otherwise and the
   app looks frozen on the one action a user repeats while iterating.

   THREE KEYS SET THE HEIGHT, AND THE THUMB GROWS TO MEET THEM. The stack is
   24px caps with 5px between, so two make 53 and sit inside a 56px thumb —
   which is the row §02 has always drawn. Three make 82, and at that point the
   thumb is no longer the tallest thing in the row: either the stack overhangs a
   small picture or the picture grows. It grows. An 82px preview of a map is
   also a better preview, and the row stays ONE block rather than a picture with
   something taller floating beside it. `.filmrow.three` is that, and it is set
   from the key count rather than by the caller — a row that is tall because
   somebody passed `tall:true` is a row that will be tall with two keys.

   EMPTY IS A REAL STATE AND IT IS NOT AN ABSENCE. A slot with no image is the
   state every one of these rows starts in, so it gets a well rather than a gap,
   the name says so in words, and SAVE and CLEAR are DISABLED — there is nothing
   to write out and nothing to throw away. A live key that does nothing teaches
   you not to trust the row.

   THE DISABLE TOGGLE IS OPTIONAL AND OFF BY DEFAULT. `select ≠ active`: a slot
   you have loaded an image into and switched off is a real state, and the
   request for this part argues it belongs here. It is still a CONTROL, and a
   control that appears in a panel nobody asked to put it in is a knob somebody
   has to understand. Pass `onToggle` and you get it; leave it out and there is
   no switch in the row.
   ══════════════════════════════════════════════════════════════════════════ */
function assetRow({ name, source, thumb, accept = 'image/*', label = 'No image',
                    onLoad, onSave, onClear, onToggle, on = true } = {}) {
  const row = el('div', 'filmrow');

  const th = el('div', 'thumb');
  const meta = el('div', 'meta');
  const fn = el('div', 'fn');
  const fs = el('div', 'fs');
  meta.append(fn, fs);

  const stack = el('div', 'stack');
  const defs = [
    ['LOAD', 'Load an image into this slot', () => input.click(), false],
    onSave  && ['SAVE',  'Save this image out',  () => onSave(),  true],
    onClear && ['CLEAR', 'Empty this slot',      () => onClear(), true],
  ].filter(Boolean);
  /* THE HEIGHT COMES FROM THE COUNT, not from a flag. 3·24 + 2·5 = 82 against
     the thumb's own 56, so anything past two keys has to move the picture. */
  if (defs.length > 2) row.classList.add('three');

  const keys = defs.map(([lab, title, run]) => key(`<span>${lab}</span>`, { title, onClick: run }));
  stack.append(...keys);
  /* which keys go dead when the slot is empty — LOAD never does */
  const needsFile = defs.map(d => d[3]);

  /* the input is a real element in the DOM because a detached one does not
     open a picker in every browser; it is simply nowhere anyone can reach it */
  const input = el('input');
  input.type = 'file';
  input.accept = accept;
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  input.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';
  input.addEventListener('change', () => {
    const f = input.files && input.files[0];
    input.value = '';                       // same file twice must fire again
    if (f && onLoad) onLoad(f);
  });

  let sw = null;
  if (onToggle) {
    sw = toggle({ label: 'Use', value: on, title: 'Use this image', onChange: v => onToggle(v) });
  }

  const paint = (st) => {
    const has = !!(st && st.name);
    fn.textContent = has ? st.name : label;
    fn.style.color = has ? '' : '#61666f';
    fs.textContent = (st && st.source) || (has ? '' : '—');
    th.classList.toggle('empty', !has);
    th.style.background = has && st.thumb ? st.thumb : '';
    keys.forEach((k, n) => { if (needsFile[n]) k.disabled = !has; });
  };

  row.append(th, meta, stack, input);
  if (sw) row.append(sw);
  paint({ name, source, thumb });
  /* the same handle every other part exposes. A slot's contents change from
     outside the row far more often than from inside it — a config load, a
     generate, a paint — so `.set()` is the normal way in, not the exception. */
  row.set = (st) => paint(st || {});
  return row;
}


/* ══════════════════════════════════════════════════════════════════════════
   THE MENU — `.plate` was the surface; this is the mechanism.

   The plate has positioned itself against the thing that summoned it since the
   colour picker, and its own comment says "menus, tooltips and any popup want
   it". What never existed was the part underneath: open, close, Escape,
   click-outside, a keyboard walk. Eight of the nine Portrait apps have an
   icon bar with dropdowns hanging off it, and all eight wrote that themselves.

   ONE OPEN AT A TIME, AND THE KEY THAT OPENED IT CLOSES IT. The second half is
   the one that gets left out: without it, clicking the lit key tears the plate
   down and builds an identical one in the same place — a control that visibly
   does nothing, which is worse than one that does nothing quietly, because you
   try it twice.

   THE KEY STAYS LIT FOR AS LONG AS ITS MENU IS OPEN. On a bar of eight icons
   that lamp is the only thing saying which menu you are in. The plate carries
   no title and should not need one — it is anchored to the key, and the key is
   the label.

   IT OPENS UPWARD, because the bar this hangs off is on the floor. `up:false`
   for a bar at the top, and either way it flips rather than clipping: a plate
   that opens off the edge of the window is a plate you cannot use.
   ══════════════════════════════════════════════════════════════════════════ */
let plateOpen = null;

/* THE MECHANISM, WITH NOTHING IN IT. Everything that opens off a key shares
   this: one open at a time, the key that opened it closes it and stays lit
   while it is up, Escape, click-outside, a flip rather than a clip at a window
   edge. A menu is this plus rows; the console is this plus a log.

   NO TAIL, NO POINTER, NO NOTCH. The plate is anchored to the key and the key
   is LIT — that is already two channels saying where it came from, and a
   pointer stuck on the edge is a third that only works while the plate is
   directly over its key. The moment a wide plate slides off a window edge the
   tail is somewhere in the middle of the bar, pointing at whatever happens to
   be under it. */
function openPlate(anchor, body, { up = true, cls = '', onKey } = {}) {
  if (plateOpen) {
    const same = plateOpen.anchor === anchor;
    plateOpen.close();
    if (same) return null;
  }

  const plate = el('div', 'plate ' + cls);
  plate.append(body);
  document.body.append(plate);

  /* Measured after it is in the DOM: the height depends on what it was given,
     and the flip decision depends on the height. */
  const place = () => {
    const a = anchor.getBoundingClientRect(), p = plate.getBoundingClientRect();
    const GAP = 11;
    let above = up;
    if (above && a.top - p.height - GAP < 8) above = false;
    else if (!above && a.bottom + p.height + GAP > innerHeight - 8) above = true;
    let x = a.left + a.width / 2 - p.width / 2;
    x = Math.max(8, Math.min(x, innerWidth - p.width - 8));
    plate.style.left = x + 'px';
    plate.style.top  = Math.max(8, above ? a.top - p.height - GAP : a.bottom + GAP) + 'px';
  };
  place();

  function close() {
    if (plateOpen && plateOpen.plate !== plate) return;
    plateOpen = null;
    plate.remove();
    anchor.classList.remove('is-down');
    anchor.setAttribute('aria-expanded', 'false');
    removeEventListener('resize', place);
    removeEventListener('scroll', place, true);
    document.removeEventListener('pointerdown', outside, true);
    document.removeEventListener('keydown', key_, true);
  }
  const outside = e => {
    if (!plate.contains(e.target) && !anchor.contains(e.target)) close();
  };
  const key_ = e => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); anchor.focus(); return; }
    onKey && onKey(e, close);
  };

  anchor.setAttribute('aria-expanded', 'true');
  plateOpen = { anchor, plate, close, body };
  addEventListener('resize', place);
  addEventListener('scroll', place, true);
  // deferred, or the click that opened it closes it again in the same tick
  setTimeout(() => document.addEventListener('pointerdown', outside, true));
  document.addEventListener('keydown', key_, true);
  plate.reflow = place;
  return plate;
}

function menu(anchor, items, { up = true } = {}) {
  const body = el('div', 'plate-body');
  const rows = [];
  body.setAttribute('role', 'menu');

  items.forEach(it => {
    if (it === '-') { body.append(el('div', 'menu-cut')); return; }
    const r = el('button', 'menu-row');
    r.type = 'button';
    r.setAttribute('role', 'menuitem');
    r.append(el('span', 'menu-ico', it.icon || ''), el('span', 'menu-nm', it.label));
    /* A ROW WITH NO SHORTCUT LEAVES THE COLUMN EMPTY. `New` has none, and
       giving it one to square the block off is inventing a key binding for the
       sake of a straight right edge. */
    if (it.kbd) r.append(el('kbd', 'menu-kbd', it.kbd));
    r.disabled = !!it.disabled;
    /* CLOSE FIRST, THEN RUN. A handler that opens a window, throws, or blocks
       on a file dialog leaves the plate on screen over the thing it just did. */
    r.addEventListener('click', () => {
      const go = it.onPick;
      if (plateOpen) plateOpen.close();
      go && go();
    });
    clicky(r, SFX.tap, SFX.lift);
    rows.push(r);
    body.append(r);
  });

  /* THE WALK IS ARROWS, and it starts at whichever end you came in from. A
     menu you can only reach with a pointer is a menu half the shortcuts on it
     are lying about. */
  const step = d => {
    const live = rows.filter(r => !r.disabled);
    if (!live.length) return;
    const at = live.indexOf(document.activeElement);
    const to = at < 0 ? (d > 0 ? 0 : live.length - 1)
                      : (at + d + live.length) % live.length;
    live[to].focus();
  };
  return openPlate(anchor, body, { up, cls: 'menu', onKey: (e, close) => {
    if (e.key === 'ArrowDown')     { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowUp')  { e.preventDefault(); step(-1); }
    else if (e.key === 'Tab')      { close(); }
  }});
}

/* A KEY THAT OWNS A PLATE — a menu, a console, anything that opens. It is a
   `.key` and nothing else; what it adds is the lamp staying on while the plate
   is up. `open` is handed the key and returns the plate, or null if that click
   closed one. It carries `aria-expanded` and NOT `aria-pressed`: it is not a
   state, it is a door. */
function plateKey(icon, { title, open, cls = '' } = {}) {
  const b = key(icon, {
    title, cls: 'dock-plate ' + cls, latch: true,
    onClick: () => { b.classList.toggle('is-down', !!open(b)); },
  });
  b.setAttribute('aria-haspopup', 'dialog');
  b.setAttribute('aria-expanded', 'false');
  b.removeAttribute('aria-pressed');
  return b;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE APP DOCK — the other bar, and the one an app runs on

   THE NAV BAR CARRIES DESTINATIONS AND REFUSES VERBS, in as many words: "no
   actions, no search, no menu. A bar carrying both makes you read it to work
   out which is which." This is the other half of that sentence — a bar that is
   ALL verbs, plus one readout, and it is what every Portrait app actually
   drives from. The two are different objects and an app has both.

   THE SLOT LIST IS NOT A PARAMETER, and that is the point of the factory. Eight
   controls and one window, in this order, in every app that adopts it:

     FILE ▸ Load All · Save All · New          a menu
     EXPORT ▸ PNG · SVG · debug SVG            a menu
     IMAGE                                     the reference image
     LIGHT                                     the room
     ── the channel ──
     SOUND                                     latched, lit when on
     RESET WINDOWS                             momentary — the way back
     CONSOLE                                   a plate, lit while it is up
     READOUT                                   how many strokes are on the sheet

   An app that ships a subset ships a different bar, and then the one piece of
   chrome a user carries between nine apps stops being the same object. What
   varies between apps is what the handlers DO, not which keys exist.

   THE CHANNEL SPLITS THE SHEET FROM THE ROOM, and it is not a split between
   momentary and latching. Left of it is everything that touches the DRAWING —
   load it, export it, the reference under it, the light on it. Right of it is
   the workspace: the sound, the windows, the console. RESET WINDOWS is a verb
   sitting between two states and that is correct, because what it acts on is
   the room and not the sheet.

   MOMENTARY AGAINST LATCHING IS READ PER KEY, off the lamp. A key lit while
   nothing is touching it is a state; a key that flashes and comes back up did
   something. That reading holds anywhere on the strip, which is why the groups
   do not have to carry it.

   THE CONSOLE KEY SHOWS THE CONSOLE. It does not turn one on. Every other key
   right of the channel is a setting you leave somewhere, and this one is a
   DOOR: press it and the log is up, press it again and it is gone, and there
   is no state left behind either way. It carries `aria-expanded` like the two
   menus and not `aria-pressed` like the sound key — same lamp, different
   sentence. Wiring it as a latch is the easy mistake, because the two look
   identical while the plate happens to be open.

   AND THE CONSOLE IS THE READOUT WITH A HISTORY, which is why it is green
   monospace behind glass and not a panel: the `.lcd` says how many strokes are
   on the sheet NOW, and the log says what the app has been doing about it. The
   app pushes with `dock.log(text)` whether the plate is up or not — a line
   that arrives while the console is closed is still in it when you open it,
   because a log that only records while you are watching is not a log.

   RESET WINDOWS IS THE WAY BACK, and it is mandatory for the reason
   `windowise` gives: a window dragged mostly off screen has no handle left to
   grab, and folding does not help because the head goes with it. An app that
   lets a panel be moved and does not carry this key has a state a user cannot
   get out of.

   IT IS CHASSIS. Like the top strip in PANELS 09 it cannot be closed, reduced
   or dragged. A canvas whose only route to Save can be put in a corner is a
   canvas you can lose.

   EXPORT CARRIES THREE ROWS, NOT TWO. PNG is what it looks like and SVG is what
   the pen will cut; the third is what the app THOUGHT — the same drawing with
   the working geometry left in. On a generative tool that is the only file that
   answers "why did it do that", and an app that hides it behind a constant and
   a reload has a debug output nobody ever looks at.
   ══════════════════════════════════════════════════════════════════════════ */
/* THE CHIP SAYS WHAT THE HAND PRESSES. ⌘ on a Mac and Ctrl everywhere else,
   read once — and guarded, because the page audit in `tools/run-page.mjs`
   runs this file with no `navigator` at all. */
const MODKEY = typeof navigator !== 'undefined'
  && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '') ? '\u2318' : 'Ctrl';

function appDock({
  onLoad, onSave, onNew,
  onPNG, onSVG, onDebug,
  onImage, onLight,
  onWindows,
  sound = true,
  onSound,
  strokes = 0, log = [], shortcuts = true, fixed = true,
} = {}) {
  const dock = el('div', 'appdock' + (fixed ? '' : ' inline'));
  const bar  = el('div', 'strip dock-bar');

  const file = plateKey(ICON.folder, { title: 'File', open: b => menu(b, [
    { icon: ICON.folder,  label: 'Load All', kbd: MODKEY + ' O', onPick: onLoad },
    { icon: ICON.save,    label: 'Save All', kbd: MODKEY + ' S', onPick: onSave },
    { icon: ICON.fileNew, label: 'New',                          onPick: onNew  },
  ])});
  const exp = plateKey(ICON.upload, { title: 'Export', open: b => menu(b, [
    { icon: ICON.image,    label: 'Export PNG', kbd: MODKEY + ' P', onPick: onPNG   },
    { icon: ICON.nib,      label: 'Export SVG', kbd: MODKEY + ' E', onPick: onSVG   },
    { icon: ICON.nibDebug, label: 'Export debug SVG',              onPick: onDebug },
  ])});
  const img = key(ICON.image, { title: 'Reference image', onClick: () => onImage && onImage() });
  const lit = key(ICON.sun,   { title: 'Light',           onClick: () => onLight && onLight() });

  /* A LATCH SAYS ITS STATE WITH THE LAMP, NOT WITH A SECOND GLYPH. §06 settled
     this on the switch caps — one icon, at one weight, and what changes is
     whether it is lit. `ICON.soundOff` exists for a switch that has no lamp;
     a key has one. */
  const latch = (icon, title, on, cb) => {
    let v = on;
    const b = key(icon, { title, down: v, latch: true, onClick: () => {
      v = !v; b.classList.toggle('is-down', v); b.setAttribute('aria-pressed', String(v));
      cb && cb(v);
    }});
    return b;
  };
  const snd = latch(ICON.sound, 'Sound', sound, onSound);
  const win = key(ICON.windows, { title: 'Reset windows',
                                  onClick: () => onWindows && onWindows() });

  /* ── the console ──────────────────────────────────────────────────────────
     THE LOG OUTLIVES THE PLATE. Lines go into an array the dock owns; the
     plate is a view of it that exists while it is open and is thrown away when
     it closes. Nothing is buffered, nothing is replayed, and a line pushed at
     16:12 is there at 16:13 whether or not anybody was looking. */
  const LOG = log.slice();
  const stamp = () => new Date().toTimeString().slice(0, 8);
  const conBody = () => {
    const wrap = el('div', 'con');
    const list = el('div', 'con-log');
    LOG.forEach(e => {
      const r = el('div', 'con-row');
      r.append(el('span', 'con-t', e.t), el('span', 'con-m' + (e.lit ? ' lit' : ''), e.text));
      list.append(r);
    });
    const n = el('span', 'con-n', LOG.length + (LOG.length === 1 ? ' entry' : ' entries'));
    const clr = el('button', 'con-clear', 'Clear');
    clr.type = 'button';
    clr.addEventListener('click', () => { LOG.length = 0; redraw(); });
    const foot = el('div', 'con-foot');
    foot.append(n, clr);
    wrap.append(list, foot);
    /* NEWEST AT THE BOTTOM AND THAT IS WHERE IT OPENS. A log you have to scroll
       down to read is a log whose last line — the one you pressed the key for
       — is the one off screen. */
    setTimeout(() => { list.scrollTop = list.scrollHeight; });
    return wrap;
  };
  const trm = plateKey(ICON.term, { title: 'Console', open: b => openPlate(b, conBody(), { cls: 'console' }) });
  /* Rebuilt in place, so a line arriving while the plate is up lands in it. */
  const redraw = () => {
    if (!plateOpen || plateOpen.anchor !== trm) return;
    plateOpen.plate.replaceChildren(conBody());
    plateOpen.plate.reflow && plateOpen.plate.reflow();
  };

  const lcd = el('div', 'lcd dock-count', strokes + ' strokes');
  lcd.setAttribute('aria-live', 'polite');

  bar.append(file, exp, img, lit, el('div', 'chan'), snd, win, trm, lcd);
  dock.append(bar);

  /* THE CHIP IS BOUND OR IT IS A LIE. A menu row that prints ⌘S and does not
     answer to it is worse than one with no chip at all. `shortcuts:false` is
     for a page that is SHOWING a dock rather than running one — this
     documentation, for instance, where a global ⌘S would take the browser's. */
  if (shortcuts) {
    const onDoc = e => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const go = { o: onLoad, s: onSave, p: onPNG, e: onSVG }[e.key.toLowerCase()];
      if (!go) return;
      e.preventDefault();
      go();
    };
    document.addEventListener('keydown', onDoc);
    dock.unbind = () => document.removeEventListener('keydown', onDoc);
  }

  /* THE READOUT IS A FACT ABOUT THE DRAWING, NOT A CONTROL. It is an `.lcd`,
     it is never a button, and the app pushes to it — nothing in here counts
     anything. */
  dock.count = n => { lcd.textContent = n + ' strokes'; return dock; };
  /* `lit` is for a line that is a RESULT — what got made, how many, how long.
     The rest are notes, and the app decides which is which. */
  dock.log = (text, lit) => { LOG.push({ t: stamp(), text, lit: !!lit }); redraw(); return dock; };
  dock.keys = { file, exp, img, lit, snd, win, trm };
  return dock;
}


/* THE TWO OPENED-OUT MARKS ARE FOUR CORNERS, POINTING OUT AND POINTING IN.
   Not a rectangle and not a chevron: a rectangle is what a window IS and drawing
   one on a window says nothing, while an arrow says "go somewhere" and this goes
   nowhere — it is the same panel, bigger. Corners are the only mark that says
   EXTENT, which is the only thing that changes. */
/* ══════════════════════════════════════════════════════════════════════════
   THE ORBIT BALL — three rings, and each one is a rotation you can drag.

   THE AXIS BALL IT REPLACES WAS A PICTURE WITH BUTTONS ON IT. Six nodes, one
   per view, and pressing one snapped the camera there — which is a useful
   control and also the exact job the six-key pad beside it already did. Two
   parts for one question is one part too many, and the one that went is the
   one that could not answer the OTHER question: what if the angle you want is
   not one of the six.

   A RING IS AN AXIS SEEN EDGE ON, and that is the whole idea. Each ring is the
   great circle perpendicular to one axis, drawn in the object's own frame, so
   the three of them together are a picture of where the object is pointing.
   Grab one and the object turns about that axis — and the ring you are holding
   does not move, because a circle rotated about its own axis is the same
   circle. Only the other two swing, which is precisely the feedback you want:
   the thing you grabbed stays under the finger and everything else reports.

   FRONT AND BACK ARE DRAWN DIFFERENTLY OR IT IS A FLAT DOODLE. A great circle
   projected orthographically is an ellipse, and an ellipse says nothing about
   which half is nearer. Split at the sign of the projected z, draw the near
   half bright and full-width and the far half thin and dim, and the same three
   ellipses become a sphere. Nothing else here is doing the depth work — no
   shading, no perspective, no occlusion.

   AND EACH RING CARRIES AN ARROWHEAD, because a ring is symmetric and a
   rotation is not. Without it, which way a drag will turn the object is a
   thing you find out by trying it.

   IT DRIVES THREE ANGLES, NOT A QUATERNION, and that is deliberate. The panel
   this is built for stores yaw, pitch and roll and shows all three on knobs; a
   gizmo that owned a quaternion would have to decompose it back into Euler
   angles to keep those readouts honest, and would drift from them the first
   time the decomposition picked the other equivalent triple. One ring, one
   angle, one knob.
   ══════════════════════════════════════════════════════════════════════════ */
/* NO PER-AXIS SIGN, AND THE ONE THAT WAS HERE WAS FIGHTING THE MODEL.

   The pitch ring carried `inv:-1`, added back when a drag was an angle bolted
   onto an Euler term: the right-hand rule about +X tips the nose UP when the
   hand pulls DOWN, and that is the sign no flight stick and no 3D viewport has
   used in thirty years. Correct then.

   IT STOPPED BEING CORRECT WHEN THE DRAG BECAME AN ARCBALL. The whole promise
   of that model is that the point you grabbed goes where your hand goes — and
   a sign flip is exactly the instruction to send it the OTHER way. The red
   ring's arrow was running backwards out from under the pointer while the
   other two followed it, which is the thing that got reported.

   So there is no sign to carry. All three rings follow the hand, because that
   is what an arcball is, and the keyboard states its own convention separately
   below where a key press has no hand to agree with. */
/* RED ON X AFTER ALL, AND THE ORANGE THAT SAT HERE FOR ONE VERSION LOST TO A
   COLLISION IT MADE ITSELF. The argument for orange was sound in the abstract
   — red already means fault on this panel, orange is the language's own accent
   and separates further from the green and the blue. Then the caps became
   wells with coloured floors, one of them red, and the ball had an orange ring
   crossing an orange-adjacent body over a red hole. Red/green/blue is what
   every 3D viewport uses and the eye arrives already knowing it; spending that
   to avoid a clash, and buying a worse clash, is a bad trade twice. */
const ORBIT_AX = [
  { key: 'pitch', col: '#FF4A4A', lab: 'X' },   // ring in YZ — pitch
  { key: 'yaw',   col: '#4ADE80', lab: 'Y' },   // ring in ZX — yaw
  { key: 'roll',  col: '#5AA9FF', lab: 'Z' },   // ring in XY — roll
];

/* R = Ry(yaw) · Rx(pitch) · Rz(roll), written out rather than multiplied at
   runtime: it is called on every pointermove of a drag and the three matrix
   products are the same nine lines every time. */
function orbitMat(yaw, pitch, roll) {
  const D = Math.PI / 180;
  const cy = Math.cos(yaw * D),   sy = Math.sin(yaw * D);
  const cp = Math.cos(pitch * D), sp = Math.sin(pitch * D);
  const cr = Math.cos(roll * D),  sr = Math.sin(roll * D);
  return [
    cy * cr + sy * sp * sr,  -cy * sr + sy * sp * cr,  sy * cp,
    cp * sr,                  cp * cr,                -sp,
   -sy * cr + cy * sp * sr,   sy * sr + cy * sp * cr,  cy * cp,
  ];
}
/* ROTATION ABOUT AN ARBITRARY AXIS — Rodrigues, because the axis a drag turns
   about is wherever that ring happens to be pointing right now, and that is
   not one of the three the Euler angles are written in. */
function orbitAxisMat(n, th) {
  const c = Math.cos(th), s = Math.sin(th), t = 1 - c;
  const [x, y, z] = n;
  return [
    t*x*x + c,    t*x*y - s*z,  t*x*z + s*y,
    t*x*y + s*z,  t*y*y + c,    t*y*z - s*x,
    t*x*z - s*y,  t*y*z + s*x,  t*z*z + c,
  ];
}
const orbitMul = (a, b) => {
  const o = new Array(9);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
    o[r*3+c] = a[r*3] * b[c] + a[r*3+1] * b[3+c] + a[r*3+2] * b[6+c];
  return o;
};
/* AND BACK OUT TO THREE ANGLES, because the knobs hold three angles and a
   matrix that cannot be read back is a matrix the readouts have to guess at.
   The decomposition matches `orbitMat` term for term — Ry·Rx·Rz — so a round
   trip is exact everywhere except the pole, where cos(pitch) is zero, yaw and
   roll are the same rotation, and the split between them is arbitrary. There
   the roll is handed to yaw and roll is zeroed, which is the conventional
   choice and the only one that does not make the knobs jitter. */
function orbitEuler(m) {
  const D = 180 / Math.PI;
  const sp = Math.max(-1, Math.min(1, -m[5]));
  const cp = Math.sqrt(1 - sp * sp);
  if (cp < 1e-6) return {
    yaw: Math.atan2(-m[6], m[0]) * D, pitch: Math.asin(sp) * D, roll: 0,
  };
  return {
    yaw:   Math.atan2(m[2], m[8]) * D,
    pitch: Math.asin(sp) * D,
    roll:  Math.atan2(m[3], m[4]) * D,
  };
}
const orbitApply = (m, p) => [
  m[0] * p[0] + m[1] * p[1] + m[2] * p[2],
  m[3] * p[0] + m[4] * p[1] + m[5] * p[2],
  m[6] * p[0] + m[7] * p[1] + m[8] * p[2],
];

/* (-180, 180], and the only place an angle is ever bounded in here. It is not
   a limit — it is the same rotation written where a knob can read it.

   NOT CALLED `wrap`, because the factory below already has one: its root
   element. A helper shadowed by a div is a helper that throws the first time
   anything calls it. */
const wrapDeg = a => { a %= 360; return a > 180 ? a - 360 : a <= -180 ? a + 360 : a; };

/* THREE SIZES, NAMED, AND A NUMBER STILL WORKS.

   A PART WITH A FREE `size` HAS NO SIZE. Every adopter picks its own, they all
   land a few pixels apart, and the one thing a shared language is for — that
   the same control is the same control in two apps — is the first thing lost.
   Three is what this needs: one that fits a knob row, one for a panel that has
   room, and one for a page that is ABOUT the orientation.

   THEY ARE 1 : 1.5 : 2 off the small one, which is the only ratio that matters
   here — the graticule and the ring weight are fractions of the box, so a step
   has to be big enough to be a decision rather than a nudge. `sm` is the
   default because a control that has to be asked for is a control that gets
   forgotten at the size it was prototyped at. */
const ORBIT_SIZE = { sm: 132, md: 198, lg: 264 };

/* ══════════════════════════════════════════════════════════════════════════
   THE MAP — the ball's material, drawn once, flat.

   EVERY MARK ON THIS BALL USED TO BE A STROKE, and that is why the junction
   between the black body and the coloured cap never looked like anything but
   a line: it WAS a line. Three concentric circles with opacities on them. No
   surface, nothing with a normal, nothing that could darken because of the way
   it happens to be tilted. Six versions went into adjusting the width and the
   softness of a drawn line, and every one of them produced a better-drawn
   line.

   SO THE MATERIAL IS A MAP AND THE BALL IS RENDERED. Equirectangular, latitude
   down and longitude across, which is the flat sheet the sphere is wrapped in
   — the same thing a globe's paper gores are. It is drawn once with ordinary
   2D calls, and then every pixel of the ball asks it what it is made of.

   TWO CHANNELS, AND THE SECOND ONE IS THE WHOLE POINT. The first is colour:
   one dark plastic throughout, the graticule, and the three rings.
   The second is SLOPE — how far the surface tilts at that point, in latitude.
   Flat everywhere except the two grooves, where it runs down one wall and up
   the other. The renderer bends the normal by it, so the groove's walls face
   different directions and take different amounts of light: one is bright and
   one is dark, from one lamp, because that is what a channel cut in a solid
   does. Nothing is painted dark. The dark is a consequence.
   ══════════════════════════════════════════════════════════════════════════ */
const TEX_W = 2048, TEX_H = 1024;

/* ══════════════════════════════════════════════════════════════════════════
   THE CAPS ARE HOLES, AND A HOLE IS A SHAPE RATHER THAN A LINE.

   THEY USED TO BE A STROKE. Two dark lines round the ball at ±75°, blurred
   into the height sheet so the bump map put a bevel on each side of them —
   which is a GROOVE: body, a channel, body again. But there is no body beyond
   the top of this one. What is up there is a different material and a
   different level, and a groove cannot say that, because a groove is symmetric
   and a step is not. It read as a line drawn round the ball, because it was.

   SO THE CAP IS SUNK. One lip at CAP_LAT, one wall CAP_WALL degrees deep, then
   a floor at CAP_DEEP below the ball's own radius, all the way to the pole.
   And nothing is drawn on it — no ring, no graticule, no seam. Where the body
   ends is told by the hole, and a line along the top of a hole is a line
   repeating what the hole already said.

   AND IT IS TRACED RATHER THAN FAKED. A bump map moves no surface: it lies to
   the lamp about which way a pixel faces and leaves the pixel exactly where it
   was, so a recess drawn that way never occludes, never shifts as the ball
   turns, and looks like paint the moment you drag it. The renderer marches the
   view ray down onto the sunk surface instead — cheap here because the profile
   is a function of LATITUDE and nothing else, so the object-space y along the
   ray is LINEAR in the ray parameter and a step costs one square root. The
   ball's own equatorial band pays nothing at all: if the ray meets the sphere
   above the lip, the sphere is the surface there and there is nothing to
   march.
   ══════════════════════════════════════════════════════════════════════════ */
const CAP_LAT  = 78;         // the lip — where the body stops
const CAP_DEEP  = 0.085;     // how far the floor sits below the rim, in radii
/* 86°, AND THE FLOOR'S WIDTH IS WHY. A hole on the pole of a sphere, written
   as r(lat), CANNOT have parallel sides — its floor's radius is `r·cos(lat)`
   and both factors shrink on the way down, so it always converges somewhat.
   What is controllable is how much LATITUDE the wall spends getting there, and
   at 80° it was spending a degree of it: the floor came out three quarters of
   the mouth's width and read as a funnel. At 86° the wall spends a fifth of a
   degree, and what is left of the taper is the sphere's own. */
/* 84, AND 88 WAS A MISTAKE I MADE FOR 4% OF THE MARCHING. A wall that vertical
   is seen EDGE ON from in front, so it occupies no pixels and says nothing: a
   groove renders as a flat ribbon with no side to it, which does not read as a
   channel at all — it reads as a hole through the ball. The wall IS the thing
   that says "carved", and buying four percent by deleting it is not a trade.
   The area was never in the wall anyway; it is in the corner fillet. */
const CAP_STAND = 84;        // degrees the wall stands off the surface
/* THE CORNER RADIUS, AND IT IS A RADIUS RATHER THAN A WIDTH.

   THE FIRST ROUNDING WAS A PARABOLA AND IT MEASURED THE WRONG THING. Its
   fillet was one pixel WIDE, which sounded like the brief and was not it: a
   parabola's curvature is tightest at its vertex, so the corner it puts on an
   80° wall has an actual radius of about a fifth of a pixel and the remaining
   four fifths of the pixel are spent nearly straight. It read as sharp because
   it was sharp — the width was in the flat part.

   SO THE CORNER IS A CIRCULAR ARC, specified the way a machinist specifies
   one: a radius. At `lg` this is one pixel of it, and the arc's horizontal
   extent falls out at about a fifth of that, because a rounding on a wall that
   steep is mostly a VERTICAL feature. Both corners get the same radius — the
   lip at the top and where the wall meets the floor.

   THE FLOOR NARROWS AS THE RADIUS GROWS, which is the trade this number is
   really making: every degree of latitude a corner spends is a degree the
   floor does not get. At two pixels the bore becomes a countersink and the
   bottom drops to about 78% of the mouth's width; under one, the wall is a
   wall with its edges broken and the floor is back near 86%.

   AND IT IS CLAMPED, BECAUSE THE PROFILE HAS A ROUNDEST. Two corners turning
   through the same angle need `2·R·(1 − cos STAND)` of depth between them, and
   there are only CAP_DEEP to spend — ask for more and the straight run goes
   NEGATIVE, which is not a gentler curve, it is `capSink` returning nonsense
   between two branches that no longer meet. The clamp turns that cliff into a
   limit: at the maximum the straight run vanishes, the two arcs meet at mid
   depth, and the well is a smooth dimple with no flat in it anywhere. Any
   value above that is the same well. */
const CAP_ROUND  = 0.017;    // the LIP's corner, in ball radii — about 2.1px at `lg`
/* AND THE FLOOR'S CORNER IS ITS OWN NUMBER, AT ZERO — DEAD SQUARE.

   ONE RADIUS FOR BOTH CORNERS WAS AN ASSUMPTION, NOT A DESIGN. They are not
   the same joint: the lip is an outside edge, the one your eye runs along and
   the one that would alias into a jagged line if it were sharp, so it wants a
   couple of pixels of roll. The floor's is an INSIDE corner, where a wall
   meets a bottom, and rounding an inside corner is exactly what stops it
   reading as a corner — it becomes a dish, and the transition the shadow needs
   to sit against goes soft. Two joints, two answers.

   AT ZERO THE SLOPE JUMPS from the wall's to the floor's in one step, which is
   a crease rather than an artefact: the normal is discontinuous there because
   the SURFACE is. That is what square means. It also hands back the latitude
   the second fillet was spending, so the disc comes out wider. */
const CAP_RFLOOR = 0;        // where the wall meets the floor

const CAP_ANG = (90 - CAP_LAT) * Math.PI / 180;   // the rim, as a half-angle
const S_LIP   = Math.sin(CAP_LAT * Math.PI / 180);

const CAP_K   = Math.cos(CAP_LAT * Math.PI / 180);
const CAP_SIN = Math.sin(CAP_STAND * Math.PI / 180);
const CAP_COS = Math.cos(CAP_STAND * Math.PI / 180);
const CAP_TW  = CAP_SIN / CAP_COS;
/* THE TWO CORNERS SHARE ONE DEPTH BUDGET, so they are clamped TOGETHER and in
   proportion. Each one spends `R·(1 − cos STAND)` of the drop turning through;
   ask for more between them than the well is deep and the straight run goes
   negative, which is not a rounder profile, it is `capSink` returning nonsense
   between two branches that no longer meet. Scaling both keeps whatever ratio
   was asked for instead of picking a winner. */
const CAP_BUD = (CAP_ROUND + CAP_RFLOOR) * (1 - CAP_COS);
const CAP_FIT = CAP_BUD > CAP_DEEP ? CAP_DEEP / CAP_BUD : 1;
const CAP_RL  = CAP_ROUND  * CAP_FIT;      // the lip's radius, as fitted
const CAP_RF  = CAP_RFLOOR * CAP_FIT;      // the floor's

const CAP_U1 = CAP_RL * CAP_SIN * CAP_K;             // arc spent on the lip corner
const CAP_Y1 = CAP_RL * (1 - CAP_COS);               // depth spent on it
const CAP_Y3 = CAP_RF * (1 - CAP_COS);               // and on the floor's
const CAP_U2 = CAP_U1 + (CAP_DEEP - CAP_Y1 - CAP_Y3) / CAP_TW * CAP_K;
const CAP_U3 = CAP_U2 + CAP_RF * CAP_SIN * CAP_K;
const S_FLOOR = S_LIP + CAP_U3;
/* THE FLOOR'S ANGULAR RADIUS, and the gradient across it has to be measured in
   THIS rather than in the rim's. Normalising by the mouth meant the falloff
   only ever reached a third of its travel before the floor ran out, so the
   part of the curve that actually darkens was spent on the wall, where a dark
   plastic surface was already dark. */
const CAP_RHO = Math.PI / 2 - Math.asin(S_FLOOR);
/* ── HOW WIDE THE DISC'S EDGE MAY BLEND, AND IT IS THE WALL THAT DECIDES ─────
   THE CEILING ON THAT BAND USED TO BE A NUMBER I PICKED, .22, AND IT WAS
   NEARLY TWICE THE WIDTH OF THE WALL. So at any tilt — where the band opens up
   to cover the grazing case — the disc's colour was blended clean across the
   bore and out to the lip, and the black plastic wall came out orange. Two
   changes drove it there without either being wrong on its own: the grazing
   term, which widens the band up to sevenfold, and moving the lip to 78°,
   which shrank the disc so the same pixel is a bigger fraction of it.

   A LIMIT HAS TO BE MADE OF THE THING IT PROTECTS. The wall is `CAP_ANG/CAP_RHO
   − 1` wide in these units, and the blend gets a quarter of it — enough to soften
   an edge, never enough to reach the lip. The grazing case it was opening up for
   is covered properly now anyway, by the four samples at the rim. */
const CAP_AAMAX = (CAP_ANG / CAP_RHO - 1) * .25;
/* HOW HARD THE DISC'S RIM SHADOW BITES. 0 turns it off entirely, which is
   worth keeping: it is the one switch that separates "the bore is too dark" —
   a question about the material — from "the shadow is eating the bore", which
   is a question about this curve. Those two looked identical for four rounds. */
const CAP_SHADOW = 1;

/* ── HOW TALL THE RIM IS BUDGETED, AND IT IS NOT ITS GEOMETRIC HEIGHT ────────
   THE WELL IS WIDE FOR ITS DEPTH — 0.41 — so a lamp only has to clear about
   thirty degrees to see the whole floor, and the one lighting this ball sits at
   fifty-three above a well that faces the camera. The cast shadow was being
   computed correctly and was simply never in shadow: it existed below thirty
   degrees, where the floor's own Lambert term has already gone dark, and it
   varied most across the disc's outer part, where the contact shadow is
   already at full. Right term, no room to live.

   AND A KNIFE-EDGE RIM IS THE WRONG MODEL ANYWAY. The lip has the fillet's
   thickness, the whole body of the ball behind it, and a horizon that keeps
   rising as you look along it — and the single direction being tested stands
   in for a hemisphere of room light that the rim blocks a great deal more of
   than one ray suggests. One constant carries all of it. */
const CAP_CAST = 2.4;

/* THE PROFILE, AND THE ONLY DESCRIPTION OF IT THE GEOMETRY USES.

   FIVE DEGREES OF WALL WAS A DISH, NOT A HOLE — a slope of about nine degrees
   off the surface, a saucer pressed into the ball. A hole is a wall you could
   set a square against. */
function capSink(s) {
  const u = (s < 0 ? -s : s) - S_LIP;
  if (u <= 0) return 0;
  if (u >= CAP_U3) return CAP_DEEP;
  if (u <= CAP_U1) {                                   /* the lip's corner */
    const x = u / CAP_K;
    return CAP_RL - Math.sqrt(CAP_RL * CAP_RL - x * x);
  }
  if (u >= CAP_U2) {                                   /* the floor's, if it has one */
    const x = (CAP_U3 - u) / CAP_K;
    return CAP_DEEP - CAP_RF + Math.sqrt(CAP_RF * CAP_RF - x * x);
  }
  return CAP_Y1 + (u - CAP_U1) * CAP_TW / CAP_K;       /* the wall itself */
}
/* AND ITS DERIVATIVE, WHICH IS THE WALL'S NORMAL AND HAS TO BE EXACT.

   A BUMP MAP CANNOT DRAW AN EDGE THIS STEEP. It was doing the job while the
   wall was a dish — the cap was a ramp painted into the height sheet, the
   renderer differentiated it, and over five degrees there were twenty-eight
   texels to differentiate ACROSS. Stand the wall up and the same feature is a
   handful of texels under a five-pixel blur, which is not a steep slope, it is
   a smeared one. Every version of that trade is a choice between mush and a
   stair.

   SO THE WALL IS DIFFERENTIATED IN CLOSED FORM INSTEAD. This is a surface of
   revolution, r = r(lat) and nothing else, whose normal is exactly
   `ê_r − (r'/r)·ê_lat` — no sampling, no blur, and as near vertical as the
   profile says with no resolution to run out of. The height sheet goes back to
   being about the RINGS, which is the one thing on this ball that genuinely is
   a shallow relief. */
function capSlope(s) {              // d(sink)/d(sin lat), signed by hemisphere
  const u = (s < 0 ? -s : s) - S_LIP;
  if (u <= 0 || u >= CAP_U3) return 0;
  let d;
  if (u <= CAP_U1 || u >= CAP_U2) {
    const R = u <= CAP_U1 ? CAP_RL : CAP_RF;
    const x = (u <= CAP_U1 ? u : CAP_U3 - u) / CAP_K;
    const w = R * R - x * x;
    d = x / CAP_K / Math.sqrt(w > 1e-14 ? w : 1e-14);
  } else d = CAP_TW / CAP_K;
  return s < 0 ? -d : d;
}

const TY = lat => (90 - lat) / 180 * TEX_H;
const TX = lon => (lon + 180) / 360 * TEX_W;

const RING_PX = 26;                 // the ring's width ON THE EQUATOR, in texels
const DEG = Math.PI / 180;
const T2D = 360 / TEX_W;            // degrees of arc per texel, on the equator
const RING_HW = RING_PX / 2 * T2D;  // and the ring's HALF-WIDTH IN DEGREES OF ARC

/* ══════════════════════════════════════════════════════════════════════════
   THE ARCS ARE CUT, NOT PAINTED — SAME SECTION AS THE WELLS, SAME MARCH.

   THEY WERE A STROKE IN A TEXTURE with a bump map pretending it had an edge,
   which is the thing the caps stopped being three versions ago and for exactly
   the same reasons: a painted mark cannot occlude, cannot shift as the ball
   turns, and gets its "depth" from a lie told to the lamp. The wells proved
   the alternative works. There is no argument for the arcs keeping the old one.

   AND A GREAT CIRCLE IS AS CHEAP AS A POLE. The cap's profile is a function of
   `|oy|` alone; a ring's is a function of `|o·A|` for its own axis, which for
   the three coordinate circles is `|ox|`, `|oy|`, `|oz|`. All three are LINEAR
   in the ray parameter for the same reason the cap's was — the ray only moves
   in view z — so one march finds the nearest of four cuts with three more
   multiplies a step and no new machinery at all.

   THE DEEPEST CUT WINS, which is what `max` over the four means and what a
   milling cutter does. Where two grooves cross, both are at full depth, and
   the floor there belongs to neither of them — so it is black, and the
   crossing reads as a pocket rather than as one arc painted over another.
   ══════════════════════════════════════════════════════════════════════════ */
/* THE WIDTH IS THE ONE 1.90.1 SETTLED ON — `RING_HW`, a half-width in DEGREES
   OF ARC rather than in texels, which is the whole point of that version: a
   meridian drawn at constant texel width narrows toward the poles because the
   sheet does. A cut has the same requirement and gets it for free, because
   `|o·A|` is an arc measure and knows nothing about the texture at all.

   AND IT IS THE FLOOR THAT GETS THAT WIDTH, NOT THE MOUTH — which is the whole
   of why the first cut arcs came out thin. Making the LIP the old ring's width
   leaves the two walls to be carved out of it, and at this depth they take
   2.7px of a 4.9px half-width: the coloured part ends up smaller than half the
   mark it replaced, and the rim shadow then covers the outer 45% of what is
   left. Barely two pixels of colour where there used to be ten. So the floor
   is the ring's width and the walls are cut OUTSIDE it. */
/* ── A GROOVE HAS ITS OWN DEPTH AND ITS OWN CORNER ───────────────────────────
   IT WAS SHARING THE WELLS', AND A WELL IS NOT A SLOT. Two hundredths of the
   radius across a disc twenty-five pixels wide is a recess; the same drop
   across a groove ten pixels wide is a trench you can fall into, and at the
   crossing where two of them meet it reads as a hole punched through the ball.
   Depth is a proportion of the mark it is cut into, not a property of the
   cutter.

   AND A SMALLER CORNER, WHICH IS WHERE THE COST ACTUALLY IS. The mouth is the
   floor plus a fillet plus a wall, and at the wells' 2px radius the FILLET was
   most of it — the wall is a tenth of what the corner spends. Shrinking the
   corner is what narrows a groove's mouth; standing the wall up, which is what
   88° was for, buys almost nothing and costs the whole read. */
const RING_DEEP  = CAP_DEEP / 2;   // half the wells' — a slot, not a pocket
const RING_ROUND = 0.012;    // a wider corner, so the lip rolls rather than steps
const RNG_U1 = RING_ROUND * CAP_SIN;
const RNG_Y1 = RING_ROUND * (1 - CAP_COS);
const RNG_U3 = RNG_U1 + (RING_DEEP - RNG_Y1) / CAP_TW;  // the wall's own arc
/* HALF AGAIN AS WIDE AS THE PAINTED RING WAS. `RING_HW` is what 1.90.1
   settled on for a stroke lying on the surface; a cut is read differently —
   the walls take angle off both sides and the contact shadow takes more, so
   the same nominal width arrives narrower. This is the mark, not the mouth. */
const RNG_FL = Math.sin(RING_HW * 1.69 * Math.PI / 180); // the floor — the mark's width
const RING_LIP = RNG_FL + RNG_U3;                       // and the mouth is wider by a wall
const RNG_AAMAX = (RING_LIP / RNG_FL - 1) * .25;
const GLOW_FAR  = RING_LIP * 1.7;      // where the spill has fallen to nothing

/* ══════════════════════════════════════════════════════════════════════════
   TWO PARTS, AND THE SEAM IS THE EQUATOR GROOVE.

   A COLOUR EDGE ACROSS BARE PLASTIC IS A DECAL. Nothing physical holds it, so
   the eye files it as printing — and a gradient instead of an edge is worse,
   because a vertical gradient on a sphere has exactly one reading and that
   reading is LIGHT. Neither says "assembly".

   WHAT SAYS ASSEMBLY IS A PARTING LINE, and there is already one: the yaw
   ring is cut along the equator, which is where a moulded ball splits anyway.
   So the two colours meet INSIDE that groove, across its floor, where the
   darkest part of the cut hides the transition — the way the join between two
   mouldings hides in the channel between them. Above the groove is one part,
   below it is the other, and the seam is a feature rather than a boundary.

   AND IT IS ONE FUNCTION FOR BOTH PAINT PATHS, WHICH IS THE WHOLE POINT. The
   body comes from the texture and the inside of every cut is painted in closed
   form; those are two places, and left to themselves a blue north half gets
   grey plastic inside its grooves. Everything asks here instead, so a cut
   through the north half is cut into north-coloured material. */
const BODY_N = [26, 36, 58];   // north of the seam — dark blue, for gloss
/* DARKER, AND STILL FAINTLY COOL. A neutral grey beside a saturated blue does
   not look neutral — the eye subtracts the blue it is comparing against and
   what is left reads WARM, which is why the south half came out orange without
   a drop of orange in it. Answering that with actual blue would make it a
   second blue part; the fix is to take it toward black and leave a hair of
   cool in it, so there is nothing warm for the contrast to find. */
const BODY_S = [24, 27, 32];   // south — darker still, a hair cool
const BODY_RGB = [0, 0, 0];    // scratch: this is called once per pixel
function bodyAt(oy) {
  const t = oy >= RNG_FL ? 1 : oy <= -RNG_FL ? 0 : (oy + RNG_FL) / (2 * RNG_FL);
  const e = t * t * (3 - 2 * t);
  BODY_RGB[0] = BODY_S[0] + (BODY_N[0] - BODY_S[0]) * e;
  BODY_RGB[1] = BODY_S[1] + (BODY_N[1] - BODY_S[1]) * e;
  BODY_RGB[2] = BODY_S[2] + (BODY_N[2] - BODY_S[2]) * e;
  return BODY_RGB;
}
const hexOf = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

/* AND THEY RUN INTO THE WELLS RATHER THAN STOPPING AT THEM. Clipping them at
   the lip left a little wall across the mouth of every groove where it met a
   well — a piece of un-cut material standing between two cuts, which is not
   something a cutter can leave behind. Unclipped, `max` merges them: the
   groove notches through the well's wall and runs on into it.

   AT HALF DEPTH THE JOINT IS A STEP RATHER THAN A MERGE, and that is correct
   rather than a regression — a shallow slot running into a deeper pocket ends
   at the pocket's wall, because the pocket has already taken the material.
   What it must not do is stop short of it and leave a rib.

   THE WELL STILL WINS ITS OWN FLOOR, because the rings only take `which` on a
   strict `>` and inside the well the two are tied. Otherwise both meridians
   meet at the pole, read as a crossing, and put a black patch in the middle of
   a coloured floor. */
function ringSink(a) {
  if (!RING_SHOW) return 0;
  const u = RING_LIP - a;
  if (u <= 0) return 0;
  if (u >= RNG_U3) return RING_DEEP;
  if (u <= RNG_U1) return RING_ROUND - Math.sqrt(RING_ROUND * RING_ROUND - u * u);
  return RNG_Y1 + (u - RNG_U1) * CAP_TW;
}
function ringSlope(a) {                  // d(sink)/d(a) — negative inside the cut
  if (!RING_SHOW) return 0;
  const u = RING_LIP - a;
  if (u <= 0 || u >= RNG_U3) return 0;
  if (u <= RNG_U1) {
    const w = RING_ROUND * RING_ROUND - u * u;
    return -u / Math.sqrt(w > 1e-14 ? w : 1e-14);
  }
  return -CAP_TW;
}
/* ── MUTED, NOW THE BALL IS ─────────────────────────────────────────────────
   THREE FULLY SATURATED MARKS ON A GREY MOULDING WERE THE ONLY SATURATED
   THINGS IN THE PICTURE, which made them read as lit signal rather than as
   coloured material — and the ball has just gone the other way, from a blue
   part to a grey-blue one. Pigment, not indicator: the value comes down as
   well as the saturation, because a colour that is merely less pure but still
   the brightest thing on the object has not stopped shouting.

   THE HOVER IS WHERE THE BRIGHTNESS WENT. An arc that is quiet at rest and
   lifts when you reach for it needs somewhere to lift FROM. */
/* THE HUE IS THE ORIGINAL, SCALED — not re-mixed. Muting them meant raising
   the two weak channels toward the strong one, which is desaturation, and it
   shifted each colour as well as calming it. Putting the hue back is not a
   fresh guess at three colours: it is the ORIGINAL triple multiplied by one
   number, so every ratio between the channels is exactly what it was and only
   the brightness differs. Same three pigments, less light on them. */
const RING_RGB = [[214, 62, 62], [64, 192, 111], [77, 145, 218]];
/* how far the hovered arc throws light past its own edges, and how hard */
const GLOW_STR = 0.28;

/* ── HIDDEN. ONE FLAG, NOTHING DELETED ──────────────────────────────────────
   `false` makes the three grooves not exist: their profile returns zero depth,
   so nothing classifies as a ring, nothing is carved, nothing is coloured and
   the hover has nothing to find. The wells are untouched. Set it true and the
   carved arcs come straight back with every constant where it was. */
const RING_SHOW = true;


/* THE WHOLE SURFACE, AS ONE NUMBER. Four cuts, deepest wins. This is the only
   thing the march needs, so it is the only thing that has to be fast. */
const cutNear = v => (v < 0 ? -v : v) < RING_LIP;
/* every floor sits at this one radius, which is what makes the fast path above
   a single square root rather than a search */
const CAP_RFLR = 1 - CAP_DEEP;
const CAP_RF2  = CAP_RFLR * CAP_RFLR;
const RNG_RFLR = 1 - RING_DEEP;
const RNG_RF2  = RNG_RFLR * RNG_RFLR;

/* IT BAILS AT FULL DEPTH, which is most of the calls that get past the first
   test: nothing can be deeper than the floor, so the moment one cut reaches it
   the other three are wasted work. This runs nineteen times per marched pixel
   and there are thousands of those. */
function cutSink(ox, oy, oz) {
  const ay = oy < 0 ? -oy : oy;
  let s = 0;
  if (ay > S_LIP) {
    s = capSink(oy);
    if (s >= CAP_DEEP) return CAP_DEEP;
  }
  const ax = ox < 0 ? -ox : ox;
  if (ax < RING_LIP) {
    const r = ringSink(ax);
    if (r >= CAP_DEEP) return CAP_DEEP;
    if (r > s) s = r;
  }
  const az = oz < 0 ? -oz : oz;
  if (az < RING_LIP) {
    const r = ringSink(az);
    if (r >= CAP_DEEP) return CAP_DEEP;
    if (r > s) s = r;
  }
  if (ay < RING_LIP) { const r = ringSink(ay); if (r > s) s = r; }
  return s;
}

/* THE EQUATOR IS A STRAIGHT LINE HERE, AND IT IS THE ONLY ONE THAT IS. The
   three rings are the coordinate great circles: the one perpendicular to Y is
   the equator, and the ones perpendicular to X and Z are meridian pairs a
   quarter turn apart. A stripe of constant LATITUDE covers the same arc at
   every longitude, so this one has always been the width it claims to be. It
   is drawn exactly as it was — everything below is about the other two. */
const tEquat = c => { c.beginPath(); c.moveTo(0, TY(0)); c.lineTo(TEX_W, TY(0)); c.stroke(); };

/* ── A MERIDIAN IS A BAND ROUND A GREAT CIRCLE, WHICH IS NOT A LINE ──────────
   IT WAS A LINE, AND THAT IS WHY THE RED ONE PINCHED. Drawn as a stripe of
   constant LONGITUDE it covers an arc of Δλ·cos(lat) — so the stripe that is
   twenty-six texels wide across the middle of the ball is nearly five times
   thinner where it runs into the well, and it read as an arc that tapered at
   both ends for no reason the eye could name. Green never showed it, because
   latitude does not do this. That is the whole of why one of the three looked
   right and two did not.

   SO THE HALF-WIDTH IS SOLVED RATHER THAN ASSUMED. The band of angular
   half-width w round the meridian at longitude a reaches, at latitude φ,
   dλ(φ) = asin(sin w / cos φ) — exact, closed form, one arcsine. What it
   draws on the sheet is a bowtie that flares toward the caps, because that IS
   the shape of a constant-width band in this projection. The two halves of a
   meridian pair would only meet past 87.7°, which is above the lip, so
   nothing inside the band degenerates.

   THREE MERIDIAN LONGITUDES, NOT TWO, AND THE THIRD IS THE SEAM. A meridian
   pair at 0° draws at x = TEX_W/2 and x = 0 — and the one at 0 is half a
   band, because the other half belongs to x = TEX_W, which is off the sheet.
   Everything downstream wraps its lookups, so that meridian sampled a ring
   half the width of the other two, on one side only. */
const merHalf = (w, lat) => {       // the band's longitude half-width at this latitude
  const q = Math.sin(w * DEG) / Math.cos(lat * DEG);
  return q >= 1 ? 90 : Math.asin(q) / DEG;
};
const RING_LIM = CAP_LAT + 3, RING_N = 96;   // past the lip; the clip takes the rest
const bMerid = (c, a, w) => {
  c.beginPath();
  for (const lon of [a, a - 180, a + 180]) {
    for (let i = 0; i <= RING_N; i++) {
      const lat = RING_LIM - 2 * RING_LIM * i / RING_N;
      const x = TX(lon + merHalf(w, lat)), y = TY(lat);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    for (let i = RING_N; i >= 0; i--) {
      const lat = RING_LIM - 2 * RING_LIM * i / RING_N;
      c.lineTo(TX(lon - merHalf(w, lat)), TY(lat));
    }
    c.closePath();
  }
  c.fill();
};
const MER_BAND = [
  { i: 0, band: (c, w) => bMerid(c, 90, w) },   // X · pitch
  { i: 2, band: (c, w) => bMerid(c, 0, w) },    // Z · roll
];

/* ── AND A MERIDIAN'S SOFT EDGE IS A STACK OF BANDS, NOT A BLURRED SHEET ─────
   FOR EXACTLY THE SAME REASON. A blur is a blur in TEXTURE space, so the
   bevel and the glow collapse by cos(lat) just as the body did — and a bevel
   carrying its full height over a shorter arc is a STEEPER bevel, so a
   meridian's tails took the lamp harder than its middle. Fixing the body
   alone trades one width gradient for a subtler one.

   SO THE EDGE IS DRAWN: bands whose half-widths step outward by a constant
   ARC amount, at the values along the profile a blur would have produced.
   Painted with the lighten operator, so a texel ends up holding the innermost
   band that reaches it — and so a ring's faint outer skirt cannot punch a
   notch through the core of the ring it crosses, which is what a stack of
   opaque bands does without it.

   A LITTLE BLUR IS STILL LEFT, doing a different job: taking the stair off
   twenty-four steps, and keeping the ring's ENDS soft where the clip cuts
   them at the lip. The drawn spread is reduced to leave room for it — two
   gaussians in a row are one gaussian of sqrt(a²+b²) — so the bevel ends up
   the five texels wide it always was, and the equator's is untouched. */
const RING_STEPS = 24;
const BEV_PX = 5, BEV_BLUR = 2.5;   // the bevel's total spread, and the blur's share of it
const GLO_PX = 3, GLO_BLUR = 1.5;   // the glow's
const drawnSig = (tot, bl) => Math.sqrt(tot * tot - bl * bl);
const grey = v => { const q = Math.round(v); return 'rgb(' + q + ',' + q + ',' + q + ')'; };
const bandStack = (c, band, sig, tint) => {   // tint(u) is the fill at profile height u
  const S = sig * T2D;
  for (let j = 0; j <= RING_STEPS; j++) {
    const hw = RING_HW + S * (3 - 6 * j / RING_STEPS);   // +3σ outermost, −3σ innermost
    if (hw <= 0) break;
    const t = j / RING_STEPS;
    c.fillStyle = tint(t * t * (3 - 2 * t));
    band(c, hw);
  }
};

/* ── ONE GREY SHEET, BUILT IN TWO LAYERS AND MAXED TOGETHER ──────────────────
   THE EQUATOR AND THE MERIDIANS WANT DIFFERENT BLURS NOW, and a canvas filter
   applies to a whole drawImage — so they are blurred apart and combined with
   the lighten operator, which is the same max the band stacks already rely
   on. Both layers carry the base, so where there is no ring the max is the
   base and nothing has moved. */
const twoLayer = (base, eq, mer) => {
  const layer = (draw, blur) => {
    const [cv, x] = texSheet();
    x.fillStyle = base; x.fillRect(0, 0, TEX_W, TEX_H);
    x.save(); bandClip(x); x.globalCompositeOperation = 'lighten'; draw(x); x.restore();
    const [, b] = texSheet();
    if ('filter' in b) b.filter = 'blur(' + blur + 'px)';
    b.drawImage(cv, 0, 0);
    if ('filter' in b) b.filter = 'none';
    return b;
  };
  const out = layer(eq.draw, eq.blur);
  out.globalCompositeOperation = 'lighten';
  out.drawImage(layer(mer.draw, mer.blur).canvas, 0, 0);
  return out.getImageData(0, 0, TEX_W, TEX_H).data;
};

const texSheet = () => {
  const cv = document.createElement('canvas');
  cv.width = TEX_W; cv.height = TEX_H;
  return [cv, cv.getContext('2d')];
};
/* EVERYTHING INBOARD OF THE LIP, which is the only place anything is drawn */
const bandClip = c => {
  c.beginPath();
  c.rect(0, TY(CAP_LAT), TEX_W, TY(-CAP_LAT) - TY(CAP_LAT));
  c.clip();
};

/* ── THE MATERIAL ────────────────────────────────────────────────────────────
   COLOUR AND SURFACE, BUILT ONCE. Neither depends on which ring is held any
   more — that moved into the ink mask below, which is a tenth of the work —
   so the two expensive sheets are built on the first paint and never again. */
let orbitBase = null;

function orbitMaterial() {
  if (orbitBase) return orbitBase;

  /* ── COLOUR ──────────────────────────────────────────────────────────────
     LIGHTER THAN IT WAS. The body was #0e1013, which is a black that has
     nowhere to go: the shading multiplies it, so a near-black base means the
     lit side is dark grey and the dark side is a hole. A plastic that reads as
     plastic has to have some value in it for the lamp to take away. */
  const [, g] = texSheet();
  /* ONE MATERIAL, AND THE CAPS STOPPED BEING A DIFFERENT ONE. They were an
     orange moulding at the top and a bone one at the bottom — which made sense
     while they were CAPS, parts fitted onto a body, and stopped making any
     the moment they became holes. A hole is not a component, it is an absence,
     and it is made of whatever the thing it is cut into is made of. Painting
     the inside of it a second colour is the same mistake as drawing a line
     round the top of it: a mark saying what the shape already says. */
  /* THE SHEET TAKES THE SAME TWO COLOURS, split at the equator. The hard edge
     between them sits at latitude 0, which is the middle of the yaw groove's
     floor — seventeen texels inside its mouth, so nothing ever samples it on
     open surface. */
  g.fillStyle = hexOf(BODY_S); g.fillRect(0, 0, TEX_W, TEX_H);
  g.fillStyle = hexOf(BODY_N); g.fillRect(0, 0, TEX_W, TY(0));
  /* THE FLOOR OF EACH WELL IS THE SAME PLASTIC IN RED. Not a light and not a
     coating — a moulding, which is why it is a fill on this sheet like every
     other material and takes the lamp, the rim's cast shadow and the well's
     occlusion exactly as the body does. It stops where the WALL stops: the
     wall is body-coloured all the way down, so what you see down a hole is a
     dark bore with a coloured bottom, and how much of that bottom you see is
     the angle you are looking from. Paint the wall too and the hole becomes a
     coloured dish with no depth to read.

     AND THE TWO ARE DIFFERENT COLOURS, WHICH IS THE ONLY THING ON THIS BALL
     THAT TELLS TOP FROM BOTTOM. Everything else is symmetric — the body, the
     graticule, all three rings — so a ball turned upside down is a ball you
     cannot tell is upside down. Red up, white down, and the pole you are
     looking at is a fact rather than an inference. Orange up, white down. */
  /* AND ONLY THE FLOOR. The wall is the ball's own black plastic all the way
     down, so what you see is a dark bore with a coloured bottom and how much
     of that bottom you get is the angle you are looking from. */
  const FLOOR_LAT = Math.asin(S_FLOOR) * 180 / Math.PI;
  g.fillStyle = '#e07b1c'; g.fillRect(0, 0, TEX_W, TY(FLOOR_LAT));
  g.fillStyle = '#d5d9df'; g.fillRect(0, TY(-FLOOR_LAT), TEX_W, TEX_H - TY(-FLOOR_LAT));

  g.save(); bandClip(g);
  g.strokeStyle = 'rgba(198,214,236,.13)'; g.lineWidth = 4;
  /* A COUNT, NOT A STEP, FOR THE MERIDIANS. They close on themselves, so the
     spacing has to divide 360 exactly or the seam gets a double line — say how
     many there are and let the arithmetic find the angle. */
  const MERID = 28;
  for (let i = 0; i < MERID; i++) {
    const lon = -180 + i * 360 / MERID;
    g.beginPath(); g.moveTo(TX(lon), 0); g.lineTo(TX(lon), TEX_H); g.stroke();
  }
  /* THE PARALLELS KEEP THEIR SPACING AND LOSE THEIR OUTERMOST PAIR. Dropping
     two by widening the gap would have spread the whole set; dropping the two
     nearest the poles takes them from where they were already crowding into
     the wells, and leaves the rest where they were. */
  for (let lat = -52.5; lat <= 52.5; lat += 7.5) {
    g.beginPath(); g.moveTo(0, TY(lat)); g.lineTo(TEX_W, TY(lat)); g.stroke();
  }
  g.restore();
  const col = g.getImageData(0, 0, TEX_W, TEX_H).data;

  /* ── HEIGHT ──────────────────────────────────────────────────────────────
     The rings stand a little proud of the body and the caps step down into it;
     the renderer differentiates this sheet and bends the normal by the result,
     so every boundary gets a bevel that catches the lamp on one side and loses
     it on the other.

     THE CAP IS NOT IN HERE ANY MORE. It was — a ramp and a floor drawn in the
     same numbers `capSink` uses — and that worked while the wall was a dish
     five degrees wide, which is twenty-eight texels to differentiate across.
     The wall is 0.8° now, which is four texels under a five-pixel blur, and no
     amount of tuning gets a vertical edge out of that. Its normal is solved in
     closed form instead (`capSlope`), and this sheet is left doing the one job
     it is actually good at: the rings, which really are a shallow relief.

     THE EQUATOR IS BLURRED AFTERWARDS RATHER THAN WHILE DRAWING, because a
     canvas filter applies per call, and a bevel is the blur: a step edge
     differentiates to one infinitely-steep texel and reads as a hard line,
     where a few texels of spread is a chamfer with a width.

     THE MERIDIANS CANNOT TAKE THEIR CHAMFER FROM A BLUR, for the reason
     bandStack exists: a blur lives in texture space and their arc does not.
     Their ramp is drawn and only finished with a blur, which is why this is
     two layers maxed together rather than one sheet. */
  /* AND THE HEIGHT SHEET IS GONE ENTIRELY. It held one thing — the rings'
     bevel — and the rings are geometry now, differentiated in closed form like
     the wells' walls. A uniform sheet is eight megabytes of the same number
     and a texture fetch per pixel to read it back. */
  orbitBase = { col };
  return orbitBase;
}

/* THE INK MASK IS GONE WITH THE PAINTED RINGS. It existed to stop the lamp
   eating an arc that was a coloured stroke on a lit surface — three separate
   temperings on three marks, and a whole sheet to undo them. An arc that is a
   CUT has no such problem: its colour is a groove floor and gets the same
   compression every well floor already gets. One mechanism instead of two. */
function orbitTexture() { return orbitMaterial(); }

function orbit({ size = 'sm', yaw = 0, pitch = 0, roll = 0, onChange } = {}) {
  size = ORBIT_SIZE[size] || +size || ORBIT_SIZE.sm;
  const C    = size / 2;
  /* THE BOX IS THE HOLE. This part used to draw its own round faceplate with
     the socket sunk into the middle of it, which meant every panel adopting it
     got a disc of somebody else's metal pasted onto its own — and a plate on a
     plate reads as a boss, not as a cut. What is left is the cut itself: the
     collar's knife line at the very edge of the box, then socket wall, then
     ball. The plate is whatever it is set into, which is the host's. */
  const R    = size * 0.465;
  const STEP = 72;                    // ring samples, for the pick only
  const W    = size * 0.0241;
  const GRAB = Math.max(13, size * 0.05);

  const val = { yaw, pitch, roll };

  const wrap = el('div', 'orbit');
  wrap.style.width = wrap.style.height = size + 'px';
  wrap.style.setProperty('--ow', W.toFixed(2) + 'px');
  wrap.style.setProperty('--osc', (size / 216).toFixed(4));

  /* THE SOCKET, AND IT IS THE STICK'S SOCKET WITH THE STICK TAKEN OUT. Seat
     under, mouth and collar over — the collar sits at the CUT IN THE PLATE and
     not at the ball's rim, because a machined edge is a plate that stops and a
     sphere never stops. Everything inboard of it is tone only. */
  wrap.append(el('div', 'orbit-seat'));
  const cv = el('canvas', 'orbit-cv');
  wrap.append(cv, el('div', 'orbit-mouth'), el('div', 'orbit-collar'));

  /* ── THE RASTER ──────────────────────────────────────────────────────────
     THE ONLY WAY A JUNCTION LOOKS REAL IS IF IT IS SHADED BY ITS OWN SHAPE,
     and that means a pixel at a time. Every pixel inside the silhouette is a
     point on a sphere, and on a UNIT sphere the point is its own normal — the
     one piece of luck this part has had throughout. So there is no geometry to
     intersect and no depth to sort: turn the pixel into a direction, ask the
     map what is painted there, bend the normal by the map's slope, and light
     it.

     THE GEOMETRY IS PRECOMPUTED BECAUSE IT NEVER CHANGES. Which pixels are
     inside the disc, and what direction each one faces, are properties of the
     BOX and not of the rotation. They are worked out once at construction; a
     drag only re-runs the lighting.

     AND THE LIGHT IS ROTATED, NOT THE SPHERE. Turning every pixel's normal
     into world space would be a matrix multiply per pixel per frame; turning
     the lamp into the object's space is one multiply per frame, and then the
     whole loop happens in the frame the map is written in. Same answer,
     fifty thousand times less arithmetic. */
  /* 1.5×, NOT THE SCREEN'S, AND THAT IS A MEASUREMENT RATHER THAN A TASTE.
     A repaint is one pass over every pixel inside the disc, and the disc grows
     with the square of the ratio: at `lg` it is 4.6ms at 1× and about 18 at
     2×, which is over a frame for ONE ball before anything else on the page
     has done anything. 1.5 keeps the edges from stepping and lands near 10ms,
     and the marks on this thing are shaded gradients rather than hairlines —
     the one kind of drawing that loses least to a softer pixel. */
  /* ── TWO RESOLUTIONS: ONE FOR LOOKING AT, ONE FOR DRAGGING ─────────────
     A REPAINT IS ONE VISIT PER PIXEL AND THE DISC GROWS WITH THE SQUARE OF
     THIS, so the device ratio is the cheapest lever there is by a wide margin
     — and the only moments it costs anything are the ones where you are not
     looking at the edges. During a drag the ball is MOVING: the eye is on the
     rotation, motion blur is doing most of the antialiasing for free, and a
     frame that arrives is worth more than a frame that is sharp. Let go and
     the full pass runs once.

     0.75 IS A THIRD OF THE PIXELS OF 1.25, which is the whole difference
     between a drag that tracks the hand and one that does not. Rebuilding the
     grid costs about one paint and happens twice a drag, not sixty times. */
  const DPR_HI = Math.min(1.25, (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1) || 1);
  const DPR_LO = Math.min(.75, DPR_HI);
  const ctx = cv.getContext && cv.getContext('2d');
  cv.style.width = cv.style.height = size + 'px';

  let DPR = DPR_HI, PX = 0, rr = 1, img = null, N = 0;
  let IDX = [], NX = [], NY = [], NZ = [], VIG = [];

  function buildGrid(dpr) {
    DPR = dpr;
    PX  = Math.round(size * dpr);
    cv.width = cv.height = PX;
    img = ctx && ctx.createImageData(PX, PX);
    rr  = R * dpr;
    IDX = []; NX = []; NY = []; NZ = []; VIG = [];
    for (let py = 0; py < PX; py++) {
      const y = (PX / 2 - py - .5) / rr;
      for (let px = 0; px < PX; px++) {
        const x = (px + .5 - PX / 2) / rr;
        const d2 = x * x + y * y;
        if (d2 >= 1) continue;
        IDX.push((py * PX + px) * 4);
        NX.push(x); NY.push(y); NZ.push(Math.sqrt(1 - d2));
        /* THE SOCKET STEALS LIGHT FROM EVERY SIDE AT ONCE — not directional
           like the lamp, so the outer few millimetres go dark whichever way
           you look. It is what dissolves the ball's edge into the socket wall
           rather than leaving it cut out against it. */
        const q = Math.sqrt(d2);
        VIG.push(q < .80 ? 1 : 1 - .62 * ((q - .80) / .20) ** 1.6);
      }
    }
    N = IDX.length;
  }
  buildGrid(DPR_HI);
  const quality = dpr => { if (dpr !== DPR) { buildGrid(dpr); paint(); } };

  /* the lamp, and the one every other part on this site is lit by */
  const LAMP = [-0.58, 0.62, 0.528];
  /* ── GLOSS, AND IT IS THE DARK THAT PAYS FOR IT ─────────────────────────
     THIS WENT THE OTHER WAY ONCE, on the argument that a tight bright specular
     is a WET look and that a moulded plastic has a broad soft sheen. True of
     the plastic that was here then — a mid grey, where a highlight has only a
     little headroom above the surface and arrives as a smear. A dark body is
     the opposite case: there is a long way between the material and white, so
     the highlight has somewhere to be and reads as a polished surface rather
     than a pale patch. Gloss and darkness are the same decision.

     THE CUTS STAY MATTE, which is unchanged and matters more now: the sheen is
     three times what it was, and a machined face catching that would look
     lacquered. `sp` is damped to a fifth inside a groove. */
  const AMB = 0.32, DIF = 0.71, SPEC = 0.26, SHINE = 30;

  /* how far a step in the height sheet bends the normal — the bevel's ANGLE,
     where the blur that made it was its width */
  const BUMP = 3.4;

  let held = -1;
  /* WHICH ARC THE POINTER IS OVER, AND IT IS NOW THE ONLY THING THAT COLOURS
     ONE. A cut arc unlit is structure; lit, it is an answer. So the ball shows
     you its frame at rest and names the axis you are reaching for the moment
     you arrive on it — which is the information a gizmo actually owes you, at
     the moment you actually want it. */
  let hover = -1;

  /* ══════════════════════════════════════════════════════════════════════
     MOMENTUM — A BALL YOU CAN THROW.

     A THING WITH THIS MUCH WEIGHT DRAWN INTO IT SHOULD HAVE SOME. It is a
     machined sphere sitting in a socket; letting go of it mid-turn and having
     it stop dead is the one moment the whole illusion is available to be
     broken for free.

     THE SPIN IS MEASURED, NOT GUESSED. Every move already produces a rotation
     matrix, so the last two give a DELTA — `M · Mprev'`, orthonormal, whose
     axis and angle come straight out of its trace and its antisymmetric part.
     Divide by the milliseconds between them and that is an angular velocity in
     the frame the drag was in, which is exactly the frame the spin has to
     continue in. No re-deriving it from screen coordinates, and it works
     identically for a ring drag and a free roll because both end in a matrix.

     DECAY IS PER MILLISECOND, NOT PER FRAME. Tying it to frames means the ball
     slows down faster on a slow machine, which is the opposite of what a
     dropped frame should cost you. */
  let spAxis = null, spRate = 0, spRAF = 0, spPrev = null, spT = 0, rzRAF = 0;
  const spBuf = [];              // recent turns: rotation vectors and their spans
  const SPIN_MIN  = 1.6e-4;      // rad/ms below which it has stopped
  const SPIN_MAX  = 0.02;        // and a ceiling, so a 2px flick is not a blur
  /* ── THE THROW IS SCALED DOWN, AND IT IS NOT THE SAME KNOB AS THE DECAY ────
     1:1 WITH THE HAND IS RIGHT WHILE YOU ARE HOLDING IT and wrong the moment
     you let go. During a drag the ball has to track the finger exactly — that
     is what an arcball promises. A throw is a different question: the hand's
     last speed is how fast you MOVED, not how fast you meant the thing to go,
     and on a part this small a hand moves very fast indeed. A third of it
     reads as the same gesture carried by something with weight. */
  const SPIN_GAIN = 1 / 3;
  /* 450ms TO HALVE, AND THE FLOOR DOES HALF THE WORK. Sustain and abruptness
     pull opposite ways on a half-life alone: 320 stopped it dead, 800 gave it
     a tail that crawls for seconds at a speed too low to read as motion but
     too high to be finished. The tail is where "spins too long" actually
     lives, and it is the FLOOR that cuts it — stop the ball while it still
     looks like it is turning, and the drop from throw to stop stays short
     enough not to feel like a brake. */
  const SPIN_HALF = 450;
  /* ── THE THROW IS THE LAST 90ms, NOT THE LAST EVENT ────────────────────────
     ONE SAMPLE IS WHATEVER THE HAND DID IN THE FINAL SIXTEEN MILLISECONDS, and
     the final sixteen milliseconds of a drag are usually the worst of it: the
     fingers are already lifting, the pointer twitches a pixel, and that twitch
     becomes the whole launch. A tiny angle about an arbitrary axis, divided by
     a tiny dt, is a large rate pointing nowhere in particular — which is
     exactly what "spinning but I cannot control it" looks like.

     SO THE TURNS ARE SUMMED AS VECTORS OVER A WINDOW. Rotation vectors add
     properly for small angles, so the sum over the window divided by its total
     time is the average angular velocity — and a single twitch is one short
     contribution among five or six rather than the entire answer. Its
     DIRECTION averages too, which is the half that matters here: the axis
     stops jumping and the ball goes where the hand was going.

     AND A HAND THAT STOPPED HAS THROWN NOTHING. If nothing was sampled inside
     the window, the ball was set down rather than released, and it stays. */
  const SPIN_WIN = 90;

  const spinSample = () => {
    const now = Date.now(), M = orbitMat(val.yaw, val.pitch, val.roll);
    const dt = now - spT;
    if (spPrev && dt > 0 && dt < 200) {
      /* D = M · Mprev', the turn made since the last sample */
      const P = spPrev, D = new Array(9);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
        D[r * 3 + c] = M[r * 3] * P[c * 3] + M[r * 3 + 1] * P[c * 3 + 1] + M[r * 3 + 2] * P[c * 3 + 2];
      const co = Math.max(-1, Math.min(1, (D[0] + D[4] + D[8] - 1) / 2));
      const ang = Math.acos(co), si = Math.sin(ang);
      const ax = si > 1e-6 ? norm([D[7] - D[5], D[2] - D[6], D[3] - D[1]]) : null;
      spBuf.push(ax
        ? { x: ax[0] * ang, y: ax[1] * ang, z: ax[2] * ang, t: now, dt }
        : { x: 0, y: 0, z: 0, t: now, dt });
      while (spBuf.length && now - spBuf[0].t > SPIN_WIN) spBuf.shift();
    }
    spPrev = M; spT = now;
  };

  /* EVERYTHING, NOT JUST THE FRAME. A cancelled animation with its axis and
     rate still standing is a ball that remembers how it was thrown — and the
     next release, if it produced no samples of its own, would find them lying
     there. Catching it has to be a full stop. */
  const spinStop = () => {
    if (spRAF) cancelAnimationFrame(spRAF);
    if (rzRAF) cancelAnimationFrame(rzRAF);
    spRAF = 0; rzRAF = 0; spRate = 0; spAxis = null;
    spBuf.length = 0; spPrev = null;
  };

  const spinGo = () => {
    const now = Date.now();
    let x = 0, y = 0, z = 0, span = 0;
    for (const e of spBuf) if (now - e.t <= SPIN_WIN) { x += e.x; y += e.y; z += e.z; span += e.dt; }
    spBuf.length = 0;
    const mag = Math.hypot(x, y, z);
    spAxis = span > 0 && mag > 1e-9 ? [x / mag, y / mag, z / mag] : null;
    spRate = span > 0 ? Math.min(SPIN_MAX, mag / span) * SPIN_GAIN : 0;
    if (!spAxis || spRate < SPIN_MIN) { quality(DPR_HI); return; }
    let t0 = now;
    const step = () => {
      /* A HAND ON THE BALL OUTRANKS A QUEUED FRAME. `spinStop` cancels the
         animation, but a frame already scheduled when the press lands would
         still turn the ball once under the finger. `base` is set for the whole
         of a drag and is the cheapest thing to ask. */
      if (base) { spRAF = 0; return; }
      const t = Date.now(), dt = Math.min(64, t - t0);
      t0 = t;
      spRate *= Math.pow(.5, dt / SPIN_HALF);
      if (spRate < SPIN_MIN) { spRAF = 0; quality(DPR_HI); return; }
      Object.assign(val, orbitEuler(orbitMul(
        orbitAxisMat(spAxis, spRate * dt), orbitMat(val.yaw, val.pitch, val.roll))));
      paint();
      onChange && onChange({ ...val }, null);
      spRAF = requestAnimationFrame(step);
    };
    spRAF = requestAnimationFrame(step);
  };
  let proj = [];        // ring samples in screen space, for the pick

  function paint() {
    const m = orbitMat(val.yaw, val.pitch, val.roll);
    proj = RINGS.map(pts => pts.map(p => {
      const v = orbitApply(m, p);
      return { x: C + R * v[0], y: C - R * v[1], z: v[2] };
    }));
    if (!img) return;

    const { col } = orbitTexture();
    /* m is orthonormal, so the inverse is the transpose — into object space */
    const lx = m[0] * LAMP[0] + m[3] * LAMP[1] + m[6] * LAMP[2];
    const ly = m[1] * LAMP[0] + m[4] * LAMP[1] + m[7] * LAMP[2];
    const lz = m[2] * LAMP[0] + m[5] * LAMP[1] + m[8] * LAMP[2];
    /* ── THE EYE GOES THE SAME WAY THE LAMP DOES, AND IT WAS GOING THE OTHER ──
       Both halves of a specular term have to be in the frame the normal is in,
       and the normal here is in the OBJECT's. The lamp is carried there by the
       transpose, three lines up — the eye was being carried by the matrix
       itself. `(m2, m5, m8)` is M·ẑ, the ball's own z-axis written in view
       space; what this needs is Mᵀ·ẑ, the VIEWER written in the ball's space,
       which is `(m6, m7, m8)`.

       AT REST THE TWO ARE THE SAME COLUMN, which is exactly why it survived:
       every check was made on a ball sitting at zero. Turn it and they diverge,
       the half-vector swings with the rotation, and the sheen crawls across the
       surface as though the lamp were bolted to the ball. One character each in
       two places, and the highlight now stays where the room's light is. */
    let hx = lx + m[6], hy = ly + m[7], hz = lz + m[8];
    const hm = Math.hypot(hx, hy, hz) || 1;
    hx /= hm; hy /= hm; hz /= hm;

    /* HOW FAR `oy` MOVES ACROSS ONE DEVICE PIXEL, which is what lets the well's
       edge antialias in PIXELS rather than in degrees. A band fixed in angle is
       a band whose width in pixels collapses as the disc foreshortens — 1.45px
       pole-on and 0.73px at a 60° tilt, which is not a soft edge, it is a hard
       one with a rounding error. The pixel grid moves `vx` and `vy` by 1/(R·DPR)
       per step and `oy` is a fixed combination of them, so this is exact for the
       in-plane part and the out-of-plane part only matters at the silhouette,
       where the clamp below covers it. */
    const GXY = Math.hypot(m[1], m[4]);
    /* and the same for each ring's own coordinate — a well's edge is measured
       in latitude, a groove's in `|o·A|`, and the pixel moves each at its own
       rate, so one antialias width cannot serve four boundaries */
    const GRA = [Math.hypot(m[0], m[3]), GXY, Math.hypot(m[2], m[5])];
    const GVZ = [m[6] < 0 ? -m[6] : m[6], m[7] < 0 ? -m[7] : m[7], m[8] < 0 ? -m[8] : m[8]];
    let MX = 0, MY = 0, MZ = 0;        /* where the march landed */
    /* THE SUB-SAMPLE PATTERN — a triad round the pixel centre, in pixels. */
    const SSX = [.42, -.21, -.21], SSY = [0, .36, -.36];

    /* ── THE MARCH, LIFTED OUT SO THE EDGE CAN BE SAMPLED MORE THAN ONCE ───
       Same arithmetic it always was; it writes to three outer slots rather
       than returning, because this is called up to four times per pixel on a
       few thousand pixels and an object per call is an object per call. */
    const march = (vx, vy, vz) => {
      MX = vx; MY = vy; MZ = vz;
      /* ALL THREE COMPONENTS ARE LINEAR IN `t`, for the one reason this whole
         approach works: the ray only moves in view z. So four cuts cost three
         more multiply-adds a step and not a second pass. */
      const axA = m[0] * vx + m[3] * vy, axB = m[6];
      const ayA = m[1] * vx + m[4] * vy, ayB = m[7];
      const azA = m[2] * vx + m[5] * vy, azB = m[8];
      /* ── EVERY CUT IS MARCHED, AND TAKING THE GROOVES OFF IT WAS THE BUG ──
         I REMOVED THEM TO BUY SPEED, ON THE ARGUMENT THAT A 10px SLOT HAS
         LITTLE PARALLAX TO LOSE. The parallax was never the point. Without a
         march a pixel keeps its position ON THE SPHERE, so the groove's floor
         is drawn at the surface — a flat coloured band lying on the ball,
         which is what a painted ring is and what this whole rewrite existed to
         stop being.

         AND IT SHOWED AS TWO. The wells are still traced, so near one the ray
         IS displaced, lands inside the groove and draws it properly recessed —
         while every pixel further out draws the same groove flat on the
         surface. One groove, two renderings, at two different depths, meeting
         exactly at the well's lip. Which is why it looked like a leftover
         overlay that stopped where the old painted ring used to stop.

         THE COST IS REAL AND IT IS THE PRICE OF THE FEATURE. Most of it comes
         back through the closed-form floor: a groove's floor is a sphere, hit
         in one square root, and only its walls need the search. */
      const ey = ayA + ayB * vz;
      if (!((ey < 0 ? -ey : ey) > S_LIP
         || cutNear(axA + axB * vz) || cutNear(ey) || cutNear(azA + azB * vz))) return;
      const rho = vx * vx + vy * vy;

      /* ── THE FLOOR IS A SPHERE, SO MOST OF A CUT NEEDS NO MARCH AT ALL ────
         EVERY FLOOR ON THIS BALL IS AT ONE RADIUS — that is what a constant
         depth means — so the whole of it is a sphere of radius 1 − CAP_DEEP
         and a ray meets it in closed form, one square root, no iteration.
         Only the WALLS need searching, and a wall is a few pixels wide where a
         floor is most of what you can see.

         THE CAPS NEVER NEEDED THIS. They are 2.2% of the sphere; three great
         circles are 18.5%, because a band's area goes with its width along its
         own axis and not with how thin it looks. The same march over eight
         times the area is eight times the cost, which is the whole of why this
         got slow — not a different technique, the same one at a scale the
         wells never reached.

         THREE PROBES CONFIRM IT. A closed-form hit is only the FIRST hit if
         the ray was in open air the whole way down, so the quarter points get
         tested against the surface; any of them already inside the material
         means the ray met a wall on the way and the march has to run. */
      /* TWO FLOOR SPHERES NOW, AND THE SHALLOW ONE IS TRIED FIRST because a
         ray coming down meets the larger radius first. A groove floor is only
         the surface if the deepest cut there is EXACTLY the groove's depth —
         deeper means a well is cutting through the same point and this sphere
         is sitting in its open air. */
      for (let pass = 0; pass < 2; pass++) {
        const RF2 = pass ? CAP_RF2 : RNG_RF2;
        if (rho >= RF2) continue;
        const iq = 1 / (pass ? CAP_RFLR : RNG_RFLR);
        const tf = Math.sqrt(RF2 - rho);
        const sk = cutSink((axA + axB * tf) * iq, (ayA + ayB * tf) * iq, (azA + azB * tf) * iq);
        if (pass ? sk < CAP_DEEP : (sk < RING_DEEP - 1e-9 || sk > RING_DEEP + 1e-9)) continue;
        let clear = true;
        for (let k = 1; k < 4; k++) {
          const t = vz + (tf - vz) * k * .25;
          const q = Math.sqrt(rho + t * t), qi = 1 / q;
          if (q <= 1 - cutSink((axA + axB * t) * qi, (ayA + ayB * t) * qi, (azA + azB * t) * qi)) {
            clear = false; break;
          }
        }
        if (clear) { MX = vx * iq; MY = vy * iq; MZ = tf * iq; return; }
      }

      let above = vz, hit = null;
      for (let st = 1; st <= 11; st++) {
        const t = vz - CAP_DEEP * 2.6 * st / 11;
        const q = Math.sqrt(rho + t * t);
        if (q > 1) break;                      /* out through the far rim */
        const iq = 1 / q;
        if (q <= 1 - cutSink((axA + axB * t) * iq, (ayA + ayB * t) * iq, (azA + azB * t) * iq)) { hit = t; break; }
        above = t;
      }
      if (hit === null) return;
      for (let st = 0; st < 7; st++) {
        const t = (above + hit) * .5;
        const q = Math.sqrt(rho + t * t), iq = 1 / q;
        if (q <= 1 - cutSink((axA + axB * t) * iq, (ayA + ayB * t) * iq, (azA + azB * t) * iq))
          hit = t; else above = t;
      }
      const q = Math.sqrt(rho + hit * hit) || 1;
      MX = vx / q; MY = vy / q; MZ = hit / q;
    };

    const out = img.data;
    const wrapC = c => c < 0 ? c + TEX_W : c >= TEX_W ? c - TEX_W : c;
    const clampR = r => r < 0 ? 0 : r >= TEX_H ? TEX_H - 1 : r;

    for (let i = 0; i < N; i++) {
      let vx = NX[i], vy = NY[i], vz = NZ[i];

      /* ── DOWN THE RAY, INTO THE HOLE ─────────────────────────────────────
         The pixel starts on the ball's own surface, which is where it ends up
         for nine tenths of them: above the lip the sphere IS the surface and
         there is nothing to look for. Below it the surface has moved inward,
         so the ray keeps going.

         AND THE WHOLE MARCH IS ONE SQUARE ROOT A STEP, because the profile
         depends on latitude alone. Object-space y is a linear function of the
         ray parameter — the ray only moves in view z — so `oyA + oyB·t` is
         exact at every step with no matrix multiply, and the only real
         arithmetic is turning the point into a radius. Sixteen steps to find
         the crossing, six bisections to place it — a wall 0.8° wide is 0.014
         of arc, and a bracket landing anywhere in it has to be squeezed well
         under that or the sharp edge comes back as a stair. This lands at
         2.7e-4, a twentieth of the wall. */
      march(vx, vy, vz);
      vx = MX; vy = MY; vz = MZ;

      const ox = m[0] * vx + m[3] * vy + m[6] * vz;
      const oy = m[1] * vx + m[4] * vy + m[7] * vz;
      const oz = m[2] * vx + m[5] * vy + m[8] * vz;

      const lat = Math.asin(oy > 1 ? 1 : oy < -1 ? -1 : oy);
      const lon = Math.atan2(oz, ox);
      const cla = Math.cos(lat);

      const rho = Math.PI / 2 - (lat < 0 ? -lat : lat);   /* angle off a pole */

      /* ── WHICH CUT AM I IN, AND WHERE ACROSS IT ──────────────────────────
         `which` is 0 for a well and 1..3 for a ring, `rad` runs 0 at the
         middle of that cut's floor to 1 at its edge and past 1 up the wall —
         the same coordinate the wells already used, so every term downstream
         (the bore's colour, the contact shadow, the edge's antialiasing) works
         on a groove without knowing it is one.

         `cross` IS TWO FLOORS AT ONCE. Where two grooves meet, both are cut to
         full depth and the floor belongs to neither — so it is black, and the
         junction reads as a pocket rather than as one arc drawn over another. */
      let sink = 0, which = -1, rad = 2, cross = false;
      {
        const ay = oy < 0 ? -oy : oy;
        if (ay > S_LIP) { sink = capSink(oy); which = 0; rad = rho / CAP_RHO; }
        let floors = 0;
        for (let k = 0; k < 3; k++) {
          const v = k === 0 ? ox : k === 1 ? oy : oz;
          const a = v < 0 ? -v : v;
          if (a >= RING_LIP) continue;
          const rs = ringSink(a);
          if (a <= RNG_FL) floors++;
          if (rs > sink) { sink = rs; which = k + 1; rad = a / RNG_FL; }
        }
        cross = floors > 1;
      }
      /* WELLS AND GROOVES ARE DIFFERENT DEPTHS, so every term that reads "how
         far down am I, as a fraction" has to ask which cut it is in. */
      const deep = which === 0 ? CAP_DEEP : RING_DEEP;
      const kw = which === 0 ? capSlope(oy) * cla / (1 - sink) : 0;
      const kr = which > 0 ? ringSlope(
        (which === 1 ? (ox < 0 ? -ox : ox) : which === 2 ? (oy < 0 ? -oy : oy)
                     : (oz < 0 ? -oz : oz))) / (1 - sink) : 0;

      /* ── FILTERED, AND THE POLE IS WHY ────────────────────────────────────
         Nearest-neighbour was showing every texel edge on the rings, and at
         the top of the ball it was showing them badly: in this projection the
         longitude lines CONVERGE at the pole, so a few screen pixels up there
         are covering hundreds of texels across. One sample out of hundreds is
         noise, and it looked like it.

         So it is bilinear — and near the pole it takes several samples ACROSS
         longitude and averages them, which is the direction the compression
         happens in. The count follows 1/cos(lat), which is exactly how much
         the sheet is stretched at that latitude, and it is capped because at
         the pole itself the factor is infinite and one sample of a converged
         point is as good as a thousand. */
      const fy = (TEX_H * (.5 - lat / Math.PI)) - .5;
      const r0 = Math.floor(fy), ty = fy - r0;
      const ra = clampR(r0), rb = clampR(r0 + 1);
      /* AT LEAST ONE, and that is not defensive coding — at the equator the
         factor is .5 and rounds to zero, which divides the accumulator by
         nothing and paints NaN. It is exactly the latitude the yaw ring sits
         on, so it would have been a line of missing pixels straight across
         the middle of the ball. */
      const span = Math.max(1, cla > 1e-4 ? Math.min(24, Math.round(.5 / cla)) : 24);
      let cr = 0, cg = 0, cb = 0, gr = 0, gg = 0, gb = 0;
      /* ── AND A CUT PIXEL DOES NOT SAMPLE AT ALL ──────────────────────────
         THE WELL AND THE GROOVES ARE PAINTED IN CLOSED FORM further down, so
         every texel fetched here for one of them is fetched and discarded —
         and they are the WORST pixels to fetch for. The pole filter's sample
         count follows 1/cos(lat), which inside a well runs from four to
         twenty-four, so the most expensive sampling on the ball was being done
         exclusively for pixels whose colour is overwritten a few lines later.
         A sixth of the ball, at up to twenty-four times the cost. */
      if (sink === 0) for (let k = 0; k < span; k++) {
        const fx = (TEX_W * (.5 + lon / (2 * Math.PI)))
                 + (span > 1 ? (k / span - .5) * (TEX_W / 360) * 2 : 0) - .5;
        const c0 = Math.floor(fx), tx = fx - c0;
        const ca = wrapC(((c0 % TEX_W) + TEX_W) % TEX_W);
        const cb2 = wrapC(ca + 1);
        const iaa = (ra * TEX_W + ca) * 4, iab = (ra * TEX_W + cb2) * 4;
        const iba = (rb * TEX_W + ca) * 4, ibb = (rb * TEX_W + cb2) * 4;
        const w00 = (1 - tx) * (1 - ty), w10 = tx * (1 - ty);
        const w01 = (1 - tx) * ty,       w11 = tx * ty;
        cr += col[iaa] * w00 + col[iab] * w10 + col[iba] * w01 + col[ibb] * w11;
        cg += col[iaa+1] * w00 + col[iab+1] * w10 + col[iba+1] * w01 + col[ibb+1] * w11;
        cb += col[iaa+2] * w00 + col[iab+2] * w10 + col[iba+2] * w01 + col[ibb+2] * w11;
      }
      if (sink === 0) { cr /= span; cg /= span; cb /= span; }

      /* ── THE NORMAL COMES OFF THE HEIGHT SHEET ───────────────────────────
         Central differences in both directions, which is the whole of a bump
         map. The longitude one is divided by cos(lat) because a degree of
         longitude is a shorter distance the further from the equator you are —
         without that the rings' bevels would flare out to nothing at the top
         of the ball. Clamped for the same reason the filter is. */
      /* ── AND THE WALL'S OWN NORMAL, EXACTLY ──────────────────────────────
         `ê_r − (r'/r)·ê_lat`, which is the normal of any surface of revolution
         and needs no sampling at all. It lands in the same `ê_lat` coefficient
         the bump map writes to, because a bump map is doing this arithmetic
         approximately — and the two never meet on the ball anyway: the rings
         stop at the lip and the wall starts there. Zero everywhere except the
         0.8° the wall occupies, so the body and the floor cost nothing. */

      /* THE LOCAL FRAME COSTS NOTHING, because the point already holds it:
         `ox = cos(lat)·cos(lon)` by construction, so a division recovers the
         longitude's sine and cosine and `oy` IS the latitude's sine. Three
         trig calls a pixel went away when this stopped calling `Math.cos(lon)`
         for a number it had already computed. At the pole `cla` is zero and
         every azimuth is the same azimuth, so any pair will do. */
      const inv = cla > 1e-6 ? 1 / cla : 0;
      const sla = oy, clo = inv ? ox * inv : 1, slo = inv ? oz * inv : 0;

      /* ── THE SURFACE'S OWN NORMAL, FOR WHICHEVER CUT IS THE DEEPEST ──────
         THE WELLS' TERM IS `ê_r − (r'/r)·ê_lat`, ALONG A LATITUDE. A ring's is
         the same identity about a different axis: the groove is a function of
         `a = |o·A|` and nothing else, so its normal is
         `ê_r + (S'(a)/r)·(sgn·A − a·o)` — and the `√(1−a²)` that turns a
         gradient in `a` into a gradient in ARC cancels against the one that
         normalises the tangent, which is why there is no square root here at
         all. Three multiplies and an axis that is (1,0,0), (0,1,0) or (0,0,1).

         ONLY THE DEEPEST CUT CONTRIBUTES, which is what `max` means: at a
         crossing the two grooves are both at their floor, both slopes are
         zero, and the pocket is flat. There is nothing to blend. */
      let nx = ox, ny = oy, nz = oz;
      if (kw) {
        const kl = kw;
        nx += kl * -sla * clo;
        ny += kl * cla;
        nz += kl * -sla * slo;
      } else if (kr) {
        const A = which - 1;
        const av = A === 0 ? ox : A === 1 ? oy : oz;
        const sg = av < 0 ? -1 : 1;
        const aa2 = av < 0 ? -av : av;
        nx += kr * ((A === 0 ? sg : 0) - aa2 * ox);
        ny += kr * ((A === 1 ? sg : 0) - aa2 * oy);
        nz += kr * ((A === 2 ? sg : 0) - aa2 * oz);
      }
      if (kw || kr) {
        const nm = Math.hypot(nx, ny, nz) || 1;
        nx /= nm; ny /= nm; nz /= nm;
      }

      /* ── A HOLE IS DARKER, AND ONLY THE AMBIENT KNOWS IT ─────────────────
         AMB is the room — light arriving from everywhere at once — and the lip
         of the cap is in the way of most of it once you are down on the floor.
         The DIFFUSE term is not touched: one lamp in one direction either
         reaches the floor or it does not, and the wall's own normal is what
         decides that. Darkening both would be painting the shadow twice. */
      /* ── AN INNER SHADOW ON THE DISC, AND WIDE IS THE WHOLE POINT ────────
         EVERY NARROW VERSION OF THIS READ AS A STROKE, and that is not a
         failure of the shading, it is what a narrow dark band between two
         lighter things IS. A shadow is recognised by its GRADIENT — the eye
         reads the falloff, not the darkness — so one that resolves inside two
         or three pixels has nothing to read and gets filed as a drawn line.

         SO IT STARTS AT 45% OF THE DISC'S RADIUS. More than half the red is
         inside a soft ramp, which is enormous by the standards of a shading
         term and exactly the proportion an inset shadow uses. Smoothstepped,
         so it leaves the middle flat and arrives at the rim with zero slope —
         no edge at either end of it.

         AND IT CARRIES ON PAST THE RIM ONTO THE WALL, because `rad` runs over
         1 out there and clamps. The wall arrives already at full darkness, so
         the disc does not END, it fades into the bore. That is the join that
         was drawing a line. */
      /* ══════════════════════════════════════════════════════════════════
         THE CUT'S EDGE IS SUPERSAMPLED, WHICH IS THE ONLY GENERAL ANSWER.

         Three things alias where a floor meets its wall: the COLOUR boundary,
         the SHADOW, which reaches full exactly there, and the corner's own
         OCCLUSION — a square lip hiding a strip of floor from a grazing ray,
         where the marched depth genuinely jumps between neighbouring pixels.
         The third has no analytic width to widen: it is a visibility
         discontinuity, and one sample per pixel cannot resolve one.

         `sink` and `rad` are what all three are computed from, so averaging
         those antialiases all three at once and in the right proportion,
         without touching the normal — which wants to stay creased, because
         that corner is square on purpose. Sub-samples are measured against the
         cut the CENTRE landed in; they sit a fifth of a pixel away, and one
         that would disagree about which groove it is in has found a crossing,
         where both floors are flat and the answer is the same either way.

         ADAPTIVE, SO IT IS NEARLY FREE — only the annulus within a tenth of an
         edge pays for the extra three marches. */
      /* AND IT ONLY RUNS WHERE IT EARNS ITS KEEP. The wells were four hundred
         edge pixels; three grooves add four and a half THOUSAND, because a
         great circle is 772px long and each cut has two sides. Three extra
         marches on every one of those is the lag.

         The colour boundary is already antialiased analytically, and the thing
         only supersampling can fix — the corner occluding a strip of its own
         floor — needs a GRAZING view to exist at all. Face-on there is nothing
         hidden and nothing to average, so the gate is the view angle. */
      if (sink > 0 && rad > .80 && rad < 1.20 && vz < .82) {
        let aS = sink, aR = rad, n = 1;
        for (let k = 0; k < 3; k++) {
          const bx = NX[i] + SSX[k] / rr, by = NY[i] + SSY[k] / rr;
          const q2 = bx * bx + by * by;
          if (q2 >= 1) continue;
          march(bx, by, Math.sqrt(1 - q2));
          const y2 = m[1] * MX + m[4] * MY + m[7] * MZ;
          if (which === 0) {
            const l2 = y2 > 1 ? 1 : y2 < -1 ? -1 : y2;
            aS += capSink(l2);
            aR += (Math.PI / 2 - Math.abs(Math.asin(l2))) / CAP_RHO;
          } else {
            const v2 = which === 1 ? m[0] * MX + m[3] * MY + m[6] * MZ
                     : which === 2 ? y2
                                   : m[2] * MX + m[5] * MY + m[8] * MZ;
            const a2 = v2 < 0 ? -v2 : v2;
            aS += ringSink(a2);
            aR += a2 / RNG_FL;
          }
          n++;
        }
        sink = aS / n; rad = aR / n;
      }
      /* ── THE RIM SHADOW IS THE DISC'S, AND ONLY THE DISC'S ───────────────
         GATED ON `sink >= CAP_DEEP`, WHICH IS THE FLOOR EXACTLY. `rad` keeps
         climbing past 1 out onto the wall, and every version of this that let
         it do so spent its darkness there: clamped at full it multiplied the
         whole bore to zero and the hole had no inside, and released gradually
         it still laid a gradient over a surface whose own shading is the only
         thing saying how deep the well is. The wall is not a place to put a
         shadow. It is already the dark part, it is doing that job with a
         normal that points sideways, and anything painted on top of it is
         covering the answer with a picture of the answer. */
      const up = oy > 0;
      let shade = 0, bnc = 0;
      if (sink >= deep) {
        /* ── A PLATEAU, NOT A PEAK, AND THAT IS THE WHOLE OF THE EDGE BUG ────
           THE DARKEST THING ON THE BALL WAS A RING OF ZERO WIDTH. Both sides
           of the corner ramped UP to full and reached it only exactly AT the
           corner, so the shadow's own maximum was a knife edge — and a thin
           dark feature is the one thing antialiasing cannot rescue. Four
           samples a pixel just draws a smoother thin dark line. It is the same
           stroke that has been in every screenshot of this joint.

           SO FULL DARK STARTS EARLY AND STAYS. The ramp finishes at .90 and
           the last tenth of the disc is flat black, the wall is flat black for
           its bottom quarter, and the geometry's edge sits in the MIDDLE of
           that band with the same value either side of it. There is nothing
           left at the junction for a pixel to be wrong about — which is what
           "hide the edge with a shadow" actually requires: not a darker
           shadow, a shadow with no feature in it where the edge is. */
        /* ── CUBIC, NOT SMOOTHSTEP, AND THAT IS WHY IT LOOKED LIKE A RIM ────
           SMOOTHSTEP HAS A VISIBLE START. Its slope is zero at both ends, so
           over a short range it reads as a band with two edges — you can see
           where the shadow BEGINS, and a shadow you can find the beginning of
           is a ring. Widening it only moves the ring inward.

           A CUBIC HAS NO ONSET. It leaves the middle of the disc alone by
           being almost nothing for the first half of its travel — an eighth of
           the way down at the midpoint — and then falls away hard near the
           rim. Same darkness at the edge, same plateau behind it, but there is
           no radius at which it starts: it just progressively is not there any
           more as you go in. Which is what an inset shadow does.

           THE PLATEAU IS UNCHANGED AND HAS TO BE. The last tenth of the radius
           is flat black, about two pixels at this size, and that is what the
           geometry's edge is buried in. */
        /* ── HOW ENCLOSED A FLOOR IS, IS ITS DEPTH OVER ITS WIDTH ──────────
           ONE CURVE FOR BOTH CUTS WAS WRONG BY A FACTOR OF FIVE. A well is
           49px across and 10 deep — ratio 0.21, a shallow dish, and leaving
           the inner half of it unshaded is right. A groove is 9.8px across and
           the same 10 deep — ratio 1.06, which is a slot you look INTO, and
           almost none of its floor can see the sky. Given the same curve its
           floor came out flat and unoccluded, and a flat bright floor on a
           dark ball is a RIBBON LYING ON TOP however deep the geometry says it
           is. The eye reads enclosure, not depth.

           SO THE GRADE STARTS AT A TENTH OF THE WAY OUT. The colour survives
           as a bright line down the middle of the cut with the walls closing
           on it either side, which is what the bottom of a narrow slot looks
           like. */
        const v0 = which === 0 ? .55 : .10;
        const v = rad <= v0 ? 0 : rad >= .90 ? 1 : (rad - v0) / (.90 - v0);
        shade = v * v * v;
      } else if (sink > 0) {
        /* ── AND THE WALL IS SHADED BY ITS OWN DEPTH ────────────────────────
           DARK AT ITS FOOT, CLEAR AT THE LIP, which is what a well does and
           what its own Lambert term cannot say: the wall's normal points
           sideways all the way up, so the lamp treats the bottom of it exactly
           like the top and the surface comes out one flat value. Depth is the
           missing variable. Squared, so it stays open across most of the wall
           and closes in the last part near the floor.

           IT MEETS THE DISC'S SHADOW EXACTLY. Both reach 1 at the corner —
           one coming in across the red, one coming down the wall — so the
           contact shadow is continuous through the joint even though the
           SURFACE is not, which is the point of making that corner square. */
        const w = sink / deep;
        /* QUARTIC, AND THE PLATEAU IS A SLIVER. Full black over the bottom
           fifth of the wall was most of the wall — it is a steep surface and
           does not occupy many pixels — so the whole bore went dark whatever
           colour it was. The flat part is the bottom twentieth now, which is
           still the couple of pixels the corner's seam has to hide in, and the
           fourth power keeps the rest of the climb open. */
        const v = w >= .95 ? 1 : w / .95;
        shade = v * v * v * v;
        /* ── THE BOUNCE PEAKS IN THE MIDDLE OF THE WALL, NOT AT ITS FOOT ────
           IT WAS BRIGHTEST EXACTLY WHERE THE SHADOW WAS DARKEST, so the one
           band was doing both jobs at once and came out as a dark RED ring —
           and then the wall brightened above it, which is the second ring, and
           the lip turned away above that, which is the third. Three bands from
           two terms fighting over one place.

           A HUMP FIXES THE SHAPE AND THE PHYSICS TOGETHER. The very foot of
           the wall is the most enclosed point in the well and sees least of
           anything; the middle of the wall has the floor open in front of it
           and sees most. Zero at both ends, so it is continuous with the disc
           across the corner without needing a term on the disc at all — the
           shadow band goes back to being neutral, and the red sits above it
           where there is light to tint. */
        const hw = 4 * w * (1 - w);
        bnc = hw * hw;
      }
      /* ── FULL RANGE, AND IT MULTIPLIES EVERYTHING ────────────────────────
         BLACK AT THE WALL, NOTHING AT THE MIDDLE. It was .80 of the AMBIENT
         only, which is two compromises in one number: the rim could never get
         past 80% and the DIFFUSE went straight through it, so a lamp shining
         into the well lit the very pixels the shadow was trying to close. An
         inset shadow is not a reduction in the room's light, it is the surface
         not being reachable — so it scales the whole term, lamp included, and
         it reaches zero. The specular goes with it: a highlight surviving in a
         part that is fully shadowed is the giveaway that the shadow is paint.

         AND THE COLOUR LIFT RIDES THE SAME CURVE, so the disc's rim arrives at
         exactly the black the wall is at, with nothing lifting it back up. */
      /* ── THE SHAPE AND THE STRENGTH ARE TWO NUMBERS, AND HAVE TO BE ──────
         `shade` is WHERE the shadow is, 0 to 1, and CAP_SHADOW is how hard it
         bites. They were one term, and that quietly tied a second thing to the
         strength: the disc's colour lift is weighted by the shadow so that it
         reaches zero at the corner and meets the wall, which gets no lift at
         all. At full strength that worked by accident — the weight hit zero
         because the shadow hit one. Turn the shadow down and the weight stops
         reaching zero, the disc's rim keeps a lift the wall never had, and a
         bright seam appears on the exact edge the shadow is there to bury.
         So the lift rides `shade`, which is always 0..1, and the strength is
         free to be anything without moving the seam. */
      const dark = shade * CAP_SHADOW;
      const lit = 1 - dark;

      /* ══════════════════════════════════════════════════════════════════
         NOTHING INSIDE THE WELL IS SAMPLED — THE POLE IS IN THERE.

         THIS WAS THE PIXELATION, AND IT WAS NEVER THE SHADING. The material
         is an equirectangular sheet and the disc is centred on its POLE,
         which is the one place that projection falls apart: the longitude
         lines all converge, so a few screen pixels across the middle of the
         hole cover hundreds of texels and the filter is averaging two dozen
         samples to survive it. That filter was running along the boundary
         between black wall and red floor — so the wall's colour got dragged
         onto the disc a texel at a time, unevenly, because how many samples
         land on which side depends on where the pole happens to be. Black on
         the circle, ragged, exactly as reported.

         SO THE WELL IS PAINTED IN CLOSED FORM. Its colour is two flats and an
         edge, and the edge is `rad` — the same coordinate the inner shadow is
         built on, so the two cannot disagree by a texel or by anything else.
         Antialiased over 4% of the radius, which is where the dark stops:
         JUST on the edge, because that IS the edge rather than a filter's
         opinion of where it fell.
         ══════════════════════════════════════════════════════════════════ */
      if (sink > 0) {
        /* ONE AND A THIRD DEVICE PIXELS, WHEREVER THE EDGE HAPPENS TO BE.
           `rho` and `oy` differ by a factor of cos(lat), so a pixel of screen
           is `GOY/cos(lat)` of latitude is that over CAP_RHO of `rad`. Floored
           so a face-on disc still gets a soft edge, ceilinged so a grazing one
           does not dissolve into a gradient. NOT called `m` — the rotation
           matrix is called that, and shadowing it inside this block is a bug
           waiting for the next person to add a line here. */
        /* BOTH TERMS OF THE GRADIENT, AND ONLY ONE WAS HERE. `oy` moves with
           the pixel through the in-plane part AND through `vz`, and near the
           silhouette the second dominates: measured against the first alone
           the bound is 2.2× short at vz = .6 and 6.9× short at vz = .15. So
           the band was under a pixel wide exactly where the edge is most
           compressed, which is why it looked worst turned away. */
        const gz = Math.sqrt(vx * vx + vy * vy) / (vz > .05 ? vz : .05);
        const goy = which === 0
          ? (GXY + GVZ[1] * gz) / rr / (cla > .05 ? cla : .05)
          : (GRA[which - 1] + GVZ[which - 1] * gz) / rr;
        const aa = which === 0
          ? Math.min(CAP_AAMAX, Math.max(.020, goy / CAP_RHO * 1.3))
          : Math.min(RNG_AAMAX, Math.max(.020, goy / RNG_FL * 1.3));
        /* ── THE BLEND IS ONE-SIDED: NOTHING OF THE DISC LEAVES THE DISC ────
           IT WAS CENTRED ON THE EDGE, half the band inside and half out, which
           is the textbook way to antialias a boundary and the wrong way here.
           Outside is the WALL, and any fraction of the disc's colour landing
           there is orange on black plastic — a glow, at whatever width the
           band happens to be. Narrowing the ceiling made it thinner; only
           moving the band can make it absent.

           SO IT FADES INWARD AND ARRIVES AT ZERO EXACTLY AT `rad` = 1. The
           softening all happens on the disc's own last pixel, the wall gets
           nothing by construction rather than by a constant being small
           enough, and the sharp side is covered by the four samples at the rim
           that are already being taken there. */
        const e = rad >= 1 ? 0 : rad <= 1 - 2 * aa ? 1 : (1 - rad) / (2 * aa);
        const mx = e * e * (3 - 2 * e);
        /* ── THE BORE IS DARK GREY, AND IT IS A MATERIAL RATHER THAN A LEVEL ─
           IT WAS THE BODY'S OWN COLOUR IN SHADOW, which is a way of being
           black rather than a way of being grey: #20252b is nearly black to
           start with and the well's own shading takes most of what is left, so
           the wall had nothing to show but its silhouette. A bore machined
           into a moulding is LIGHTER than the skin around it — cut plastic is
           matte where the moulded face is not — so it gets its own value.

           GRADED IN FROM THE LIP so there is no step where the well begins.
           At the mouth it is exactly the body, or the lip would wear a ring
           the same way the floor's edge used to. */
        /* ── THE LIFT IS THE WELL'S, NOT THE GROOVE'S ───────────────────
           A BORE MACHINED INTO A MOULDING IS LIGHTER THAN THE SKIN, which is
           true and which a WELL needs — 49px across and 10 deep, its wall has
           nothing else to show. A groove is 10px across, and the same lift
           makes the whole cut two to three times brighter than the ball it is
           cut into. A light band on a dark sphere is a RIB, not a channel:
           that is the "second overlay sitting on top". A groove is the ball's
           own plastic and is darker for the only reason a recess ever is —
           less light gets into it, which the shading already says. */
        const wd = sink / deep;
        const lf = which === 0 ? 60 : 8;
        const B = bodyAt(oy);
        const br = B[0] + lf * wd, bg = B[1] + lf * 1.05 * wd, bb = B[2] + lf * 1.12 * wd;
        /* ── AND THE FLOOR OF THE CUT, WHICH IS THE ONLY COLOUR ON THIS BALL ─
           A WELL IS ALWAYS ITS COLOUR; A GROOVE IS ONLY ITS COLOUR WHEN YOU
           ARE ON IT. Unlit and cut, the three arcs are structure — you can see
           the frame without being told anything by it — and the axis you are
           reaching for answers when you arrive. The colour IS the hover,
           rather than a label the hover brightens.

           A CROSSING IS BLACK WHATEVER IS HOVERED. Two floors at one point
           belong to neither groove, and lighting it for one of them would draw
           that arc straight through the other. */
        /* ── THE COLOUR IS THE RESTING STATE NOW, AND THE HOVER IS A GLOW ───
           EARLIER THE COLOUR *WAS* THE HOVER: unlit grooves as structure, the
           axis named only when you arrived on it. That reads well on paper and
           costs the ball the one thing it exists to say — three arcs you can
           name at a glance. So an arc wears its axis colour at rest, and
           reaching for one ADDS light rather than adding meaning: the answer
           was already there, the hover just brings it forward. */
        const RG = which > 0 && !cross ? RING_RGB[which - 1] : null;
        /* ── AN UNLIT GROOVE STILL HAS A BOTTOM ─────────────────────────
           IT WAS (15,17,20) AGAINST A WALL OF (92,100,110), so the deepest
           part of the cut was the darkest thing in it with lit sides around —
           which is the signature of a hole punched THROUGH something, not a
           channel with a floor. Nothing about "the arc has no colour until you
           hover it" requires the floor to be a void; it requires it to be the
           same plastic as everything else. A shade under the wall, so the
           section still models, and the ring's colour when you are on it. */
        const fr = which === 0 ? (up ? 224 : 213) : RG ? RG[0] : B[0] + 4;
        const fg = which === 0 ? (up ? 123 : 217) : RG ? RG[1] : B[1] + 4;
        const fb = which === 0 ? (up ?  28 : 223) : RG ? RG[2] : B[2] + 5;
        cr = br + (fr - br) * mx;
        cg = bg + (fg - bg) * mx;
        cb = bb + (fb - bb) * mx;

      }

      const d = nx * lx + ny * ly + nz * lz;
      let dif = d > 0 ? d : 0;

      /* ══════════════════════════════════════════════════════════════════
         AND THE RIM CASTS INTO THE WELL — THE ONE TERM IN HERE THAT ANSWERS
         TO WHICH WAY THE BALL IS POINTING.

         EVERYTHING ELSE ABOUT THIS HOLE IS FIXED TO THE HOLE. The contact
         shadow is a function of position, the bore's colour is a material,
         the disc's edge is geometry — turn the ball and none of them move,
         which is correct for all three and leaves the well saying nothing
         about the attitude it is being viewed at. A real recess announces
         that constantly, because its own rim is in the way of the lamp and
         the shape of what it blocks sweeps as the thing turns.

         IT IS AN EXACT QUESTION AND IT COSTS ONE SQUARE ROOT. The rim is a
         circle of known angular radius, the point is a known depth below it:
         reach the rim along the light's own bearing — the ray-circle chord —
         and compare how far that is against how far the light has to travel
         horizontally to fall that depth. `D·sin(elev)` against
         `depth·cos(elev)`, no trig, no marching.

         IT TAKES THE DIFFUSE AND LEAVES THE AMBIENT, which is what a cast
         shadow is: the lamp is blocked, the room is not. The room's own
         occlusion is already handled, by the contact term, and doing it twice
         is how the well went black the first time this existed.

         AND THE PENUMBRA IS ENORMOUS ON PURPOSE — the ratio runs from half to
         one and a bit before it is fully lit. A rim shadow with a crisp edge
         is a dark shape with a boundary inside a hole, which is the same
         stroke this part has produced under four other names. */
      /* ── AND IT IS THE WELL'S RIM, SO ONLY A WELL MAY ASK IT ─────────────
         THIS RAN ON EVERY CUT PIXEL AND IT IS BUILT ENTIRELY FROM THE WELL:
         `CAP_ANG` is the well's rim radius and `rho` is the angle from the
         POLE. On a groove at the equator `rho` is 1.571 and the discriminant
         goes negative, so `D` collapses to `-rho·c` — a number with no
         geometry behind it that flips sign with the light's bearing. Measured
         along one groove it hands back 100% lit, 100% lit, 0%, 0%, 0% as the
         bearing turns: a hard shadow edge across every arc, in a place decided
         by where the POLE happens to be. That is the "strange light", and the
         lit half either side of it is the thing that reads as a second ring
         laid over the groove.

         A GROOVE'S OWN RIM IS TWO PARALLEL EDGES, NOT A CIRCLE, so it needs
         its own solution and does not get to borrow this one. Until it has
         one it takes no cast shadow at all — which is honest: a 10px slot's
         rim throws very little, and none is much closer to the truth than a
         hard edge in an arbitrary place. */
      let sun = 1;
      if (which > 0 && sink > 0) {
        /* ── AND A GROOVE'S RIM CASTS TOO — IT IS A TRENCH, NOT A CIRCLE ────
           THE WELL'S TEST CANNOT BE BORROWED, which is why grooves had none:
           it reaches a rim of known radius round a known centre, and a groove
           has no centre — it has two parallel edges running away in both
           directions. But the question is the same one and the answer is
           simpler. The light's bearing has a component ACROSS the trench; the
           edge it must clear is whichever one lies that way, and the distance
           to it is `(halfWidth − a)/|c|` on the near side, `(halfWidth + a)/|c|`
           on the far. Light running ALONG the groove clears nothing and blocks
           nothing — `c` goes to zero, the reach goes to infinity, and the
           trench is lit end to end. Which is exactly what a slot does.

           Same comparison as the well's, same penumbra, same constant. */
        const lu = lx * ox + ly * oy + lz * oz;
        if (lu <= 0) sun = 0;
        else {
          const A = which - 1;
          const av = A === 0 ? ox : A === 1 ? oy : oz;
          const sg = av < 0 ? -1 : 1, a = av < 0 ? -av : av;
          const ex = (A === 0 ? sg : 0) - a * ox;
          const ey = (A === 1 ? sg : 0) - a * oy;
          const ez = (A === 2 ? sg : 0) - a * oz;
          const en = Math.sqrt(1 - a * a) || 1;
          const h2 = 1 - lu * lu, hm = h2 > 0 ? Math.sqrt(h2) : 0;
          const c = hm > 1e-6
            ? ((lx - lu * ox) * ex + (ly - lu * oy) * ey + (lz - lu * oz) * ez) / (en * hm)
            : 0;
          const ac = c < 0 ? -c : c;
          const D = ac > 1e-3 ? (RING_LIP - (c < 0 ? -a : a)) / ac : 1e3;
          const need = sink * hm * CAP_CAST;
          let tt = need <= 1e-9 ? 1 : (D * lu / need - .88) / .24;
          sun = tt <= 0 ? 0 : tt >= 1 ? 1 : tt * tt * (3 - 2 * tt);
        }
      } else if (which === 0 && sink > 0) {
        const lu = lx * ox + ly * oy + lz * oz;
        if (lu <= 0) sun = 0;
        else {
          const h2 = 1 - lu * lu;
          const hm = h2 > 0 ? Math.sqrt(h2) : 0;
          let c = 1;                       /* how much of the bearing runs outward */
          if (hm > 1e-6 && rho > 1e-6) {
            const sg = up ? -1 : 1;        /* ê_out = -sign(oy)·ê_lat */
            c = ((lx - lu * ox) * -sla * clo
               + (ly - lu * oy) * cla
               + (lz - lu * oz) * -sla * slo) * sg / hm;
          }
          const disc = CAP_ANG * CAP_ANG - rho * rho * (1 - c * c);
          const D = -rho * c + Math.sqrt(disc > 0 ? disc : 0);
          const need = sink * hm * CAP_CAST;
          /* ── AND THE PENUMBRA IS TIGHT, CENTRED ON THE REAL BOUNDARY ──────
             IT RAN FROM HALF TO ONE AND SEVEN TENTHS, which is a transition
             wider than the whole quantity it was measuring — the geometric
             edge is at exactly 1, and a ramp that starts at .5 and finishes at
             1.7 never actually arrives anywhere, it just tints the well. That
             width was defensive: every hard edge this part has produced turned
             out to be a stroke. But a cast shadow's edge is not a seam between
             two surfaces, it is a real feature with a real position, and
             blurring it to hide the other problem was hiding this one too. */
          let tt = need <= 1e-9 ? 1 : (D * lu / need - .88) / .24;
          sun = tt <= 0 ? 0 : tt >= 1 ? 1 : tt * tt * (3 - 2 * tt);
        }
      }

      /* THE LAMP LOSES ALL OF IT AND THE ROOM LOSES SOME. A cast shadow takes
         the direct light entirely — that is what being blocked means — but a
         rim also stands between the floor and most of the sky, and that part
         is what keeps the shadow readable at the angles where the diffuse term
         has already fallen to nothing on its own. Four tenths of the ambient,
         which is enough to see and not enough to put the well back to black. */
      let f = (AMB * (.46 + .54 * sun) + DIF * dif * sun) * lit;
      const hs = nx * hx + ny * hy + nz * hz;
      let sp = hs > 0 ? SPEC * lit * Math.pow(hs, SHINE) * 255 : 0;
      /* MATTE INSIDE A GROOVE. A moulded face has a broad sheen; the bottom of
         a machined slot does not — it is a cut surface, and a glint down there
         is what made the arcs read as polished ribbons laid on the ball rather
         than as material removed from it. The wells keep theirs: they are wide
         enough for a sheen to be a shape rather than a dot. */
      if (which > 0) sp *= .22;
      f *= VIG[i];

      /* ── AND THE RINGS DO NOT GO OUT ─────────────────────────────────────
         The lift is toward a floor and it is proportional, so the bevel the
         height sheet gives a ring survives — it is still a moulded thing with
         a lit edge — while the colour stops being something the back of the
         ball and the socket's rim shadow are allowed to take away. */
      /* ══════════════════════════════════════════════════════════════════
         A MARK'S LIGHT IS COMPRESSED, NOT LIFTED — AND THAT IS THE WHOLE FIX.

         THE ARCS WERE NOT DIM, THEY WERE MILKY, and two versions of "lift the
         rings so the lamp cannot eat them" made it worse each time, because a
         lift is the one operation that CANNOT leave a saturated colour alone.
         Brightening is additive and clipping is per-channel: at f = 1.16 a
         (255, 74, 74) red is already pinned at 255 on the channel that makes
         it red, so the only thing still able to move is the two channels that
         make it grey. Every step of "brighter" was a step of "less red". And
         `sp` was added equally to all three on top of that, which is what
         white means. Two desaturators, both introduced by the attempt to stop
         the colour being lost.

         SO NOTHING GOES ABOVE THE SWATCH. A mark's response is squeezed into
         [LOW, 1] instead of stretched past it — the brightest a ring is ever
         drawn is EXACTLY the colour it was specified as, and the darkest is
         LOW of it. Scaling all three channels by the same s ≤ 1 cannot clip
         and cannot change a ratio, so hue and saturation are now identical at
         every point on every arc, by construction rather than by tuning. Only
         brightness moves, it moves over a 1.5× range, and the bevel still
         reads inside it.

         THE SPECULAR COMES OFF THE RINGS FOR THE SAME REASON. A moulded inlay
         does have a sheen, and at this size a white one costs more saturation
         than the sheen is worth. The plastic keeps it; the marks do not.

         AND THE WELL FLOORS ARE MARKS TOO. Same squeeze, a lower floor — they
         want the rim's shadow sweeping across them, which is a three-fold
         range rather than the rings' one and a half — and the same guarantee:
         a red floor in shadow is a dark red floor, never a black one and never
         a pink one.
         ══════════════════════════════════════════════════════════════════ */
      const FLOOR_LOW = .34;
      const t = f > 1 ? 1 : f;
      if (sink >= deep) {
        /* THE LIFT FADES OUT ON THE SHADOW'S OWN CURVE. Applied flat across
           the disc it put a 2.4× step at the rim — the red squeezed into
           [LOW, 1] against a wall pixel that got none of it, two brightnesses
           meeting on one texel, a stroke. Weighted by `1 − dark` it is zero
           exactly where the wall begins and full in the middle, so the disc
           and the bore arrive at the same value and the seam has nothing to
           show. The saturation guarantee is unaffected: this only ever scales,
           so the red is the same red at every radius. */
        f += (1 - shade) * (FLOOR_LOW + (1 - FLOOR_LOW) * t - f);
      }

      /* ── THE FLOOR THROWS ITS COLOUR BACK UP THE WALL ────────────────────
         A LIT ORANGE DISC AT THE BOTTOM OF A BLACK SHAFT PUTS ORANGE ON IT,
         and leaving that out is what made the wall read as a cut-out rather
         than as the inside of something. It is ADDED, because bounced light is
         a source arriving at the surface rather than a property of it — a
         multiply would only tint what the lamp already delivered, which at the
         foot of the wall is nothing, and nothing times red is nothing.

         STRONGEST AT THE FOOT AND CUBED, since the wall's view of the floor
         closes fast as it climbs. And it answers to the lamp: `ly` in object
         space is how squarely the light is coming down the well's own axis, so
         a floor turned away from the lamp has less to give back. The floor is
         at its darkest exactly where this is at its brightest, which is why
         the foot of the wall reads as a deep warm tone rather than as black.

         AND IT IS CONTINUOUS THROUGH THE CORNER, which it was not: the wall's
         foot took the whole term and the disc's rim took none, so the two
         sides of the joint differed by 74 in the red channel across one texel.
         That is a bright line drawn along an edge that the shadow above it was
         busy trying to bury. Both sides reach 1 at the corner now — and the
         floor's rim genuinely does see more bounced light than its middle
         does, so the shape of it was wrong as well as the discontinuity. */
      const bl = bnc * (.35 + .65 * Math.max(0, up ? ly : -ly));

      /* ══════════════════════════════════════════════════════════════════
         THE HOVERED ARC EMITS, AND AN EMITTER LIGHTS WHAT IS AROUND IT.

         THE FIRST GLOW WAS A BRIGHTER FLOOR AND THAT IS NOT WHAT LIGHT DOES.
         It stopped dead at the walls, so the arc got lighter and stayed a
         stripe — the one thing that says "this is a source" is that it spills
         PAST its own edges onto material that is not it.

         SO IT IS COMPUTED FROM THE DISTANCE TO THE ARC'S OWN GREAT CIRCLE, not
         from the cut, which lets it exist where the cut does not: full down
         the floor, falling away through the walls, and carrying on across the
         plain surface for about two and a half times the slot's width. Added,
         never multiplied, and never touched by the shading — a lamp does not
         dim because the surface it sits in is turned away, and this one has to
         survive the back of the ball to be worth anything.

         AND IT IS ALLOWED TO CLIP. At full strength the middle of the arc runs
         past 255 and blooms toward white, which is exactly what a bright
         source does to a sensor and the only cheap way to say "brighter than
         this screen can print". */
      const H = held >= 0 ? held : hover;
      if (H >= 0) {
        const hv = H === 0 ? ox : H === 1 ? oy : oz;
        const ah = hv < 0 ? -hv : hv;
        let gw = 0;
        if (ah <= RNG_FL) gw = 1;
        else if (ah < GLOW_FAR) {
          const t = 1 - (ah - RNG_FL) / (GLOW_FAR - RNG_FL);
          gw = t * t;
        }
        if (gw > 0) {
          const C = RING_RGB[H], w = gw * GLOW_STR;
          gr = C[0] * w; gg = C[1] * w; gb = C[2] * w;
        }
      }

      const o = IDX[i];
      out[o]     = cr * f + sp + gr + (up ? 0 : 27) * bl;
      out[o + 1] = cg * f + sp + gg + (up ? 0 : 28) * bl;
      out[o + 2] = cb * f + sp + gb + (up ? 0 : 29) * bl;
      out[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  /* THE RING SAMPLES SURVIVE THE REWRITE, and only for the pick. Nothing
     draws them any more — they are painted into the map — but a pointer still
     has to be told which ring it is nearest, and that is a question about
     screen positions rather than about pixels. */
  /* AND THEY STOP AT THE LIP, LIKE THE DRAWING DOES. The two meridian rings
     are painted only across the body now, so their samples over the caps are
     samples of a ring that is not there — a pick radius reaching into a hole
     and handing back an axis nothing on screen offered. */
  const RINGS = [0, 1, 2].map(k =>
    Array.from({ length: STEP + 1 }, (_, i) => {
      const t = i / STEP * Math.PI * 2, c = Math.cos(t), n = Math.sin(t);
      return k === 0 ? [0, c, n] : k === 1 ? [n, 0, c] : [c, n, 0];
    }).filter(p => (p[1] < 0 ? -p[1] : p[1]) <= S_LIP));
  const AXV = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

  /* WHICH RING DID THE POINTER GRAB — nearest sample wins, and near ones win
     over far ones at the same distance, because where two rings cross on
     screen the one in front is the one you were looking at. */
  function pick(px, py) {
    let best = -1, bd = GRAB;
    /* ONLY WHAT IS VISIBLE CAN BE GRABBED. The far half is not drawn any more,
       and a ring you cannot see is not a ring you meant to take hold of. */
    proj.forEach((pts, k) => {
      for (const p of pts) {
        if (p.z < 0) continue;
        const d = Math.hypot(p.x - px, p.y - py);
        if (d < bd) { bd = d; best = k; }
      }
    });
    return best;
  }

  /* ── THE DRAG IS AN ARCBALL, WHICH IS THE WHOLE FIX ────────────────────
     THE FIRST TWO VERSIONS MEASURED AN ANGLE FROM THE HUB, and that is not a
     hard control to tune, it is the wrong quantity. A screen angle about a
     centre has a singularity AT the centre — two pixels across the middle is
     most of a half turn — and no relationship at all to the surface the hand
     thinks it is pushing. Damping it and halving it made a wrong number
     smaller; it did not make it the right number.

     SHOEMAKE'S ARCBALL (1992) IS THE RIGHT NUMBER. The pointer is projected
     DOWN ONTO THE SPHERE, and a drag is the arc between two points on that
     sphere — so the hand is pushing the ball's actual surface and the ball
     turns exactly as far as the hand pushed it. There is no gain to tune,
     because 1:1 on the surface is what a ball is.

     HOLROYD'S SHEET IS WHY IT SURVIVES THE EDGE. A plain hemisphere has no
     answer past the rim, so a pointer leaving the silhouette either clamps or
     goes imaginary — and the rim is where the useful travel is. Inside r²/2 it
     is the sphere; outside, a hyperbola with the same value and slope at the
     join, so the surface never creases and the pointer can wander off the part
     and come back.

     AND THE CONSTRAINT IS A PROJECTION, NOT A CLAMP. A ring means "about this
     axis": both sphere points are projected onto the plane PERPENDICULAR to it
     and the signed angle between them about that axis is the rotation. Well
     conditioned face-on and edge-on alike — the two cases the old screen angle
     got worst. */
  const project = (x, y) => {           // unit sphere, origin at the hub
    const d = x * x + y * y;
    return d <= 0.5 ? [x, y, Math.sqrt(1 - d)] : [x, y, 0.5 / Math.sqrt(d)];
  };
  /* the pointer in ball radii, which is the only unit any of this works in */
  const ballPt = (e, r) => project(
    (e.clientX - (r.left + r.width  / 2)) / (R * r.width  / size),
    ((r.top + r.height / 2) - e.clientY) / (R * r.height / size),
  );
  const norm = v => {
    const m = Math.hypot(v[0], v[1], v[2]);
    return m < 1e-6 ? null : [v[0] / m, v[1] / m, v[2] / m];
  };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1],
                           a[2] * b[0] - a[0] * b[2],
                           a[0] * b[1] - a[1] * b[0]];
  /* v with its component along n removed — v as seen by someone looking down n */
  const flatten = (v, n) => {
    const k = dot(v, n);
    return norm([v[0] - k * n[0], v[1] - k * n[1], v[2] - k * n[2]]);
  };
  /* the signed angle from a to b about n, and the sign is the cross product's
     agreement with n — `acos` alone loses it and the ball turns one way only */
  const signedAngle = (a, b, n) => {
    const cx = a[1] * b[2] - a[2] * b[1];
    const cy = a[2] * b[0] - a[0] * b[2];
    const cz = a[0] * b[1] - a[1] * b[0];
    return Math.atan2(cx * n[0] + cy * n[1] + cz * n[2],
                      Math.max(-1, Math.min(1, dot(a, b))));
  };

  let from = null, axis = null, base = null;   // `held` is declared with the raster

  /* ══════════════════════════════════════════════════════════════════════
     DOUBLE-CLICK RETURNS IT TO ZERO, ALONG THE WAY IT WOULD ACTUALLY TURN.

     A SNAP TELLS YOU NOTHING. Set the three angles to zero in one frame and
     the ball is simply somewhere else — you cannot see WHICH way it went, so
     you cannot tell afterwards whether the thing that moved was the ball or
     the picture of it. Turning it back is the same argument the arcball makes
     for dragging: the object has to be seen to move.

     AND THERE IS ONE PATH, NOT THREE. Interpolating yaw, pitch and roll
     separately is three unrelated numbers arriving at zero together, which
     traces a wobble — the ball rolls one way and then another on its way to
     rest, because Euler angles are a coordinate system rather than a route.
     Every rotation is a single turn about a single axis, so the CURRENT
     attitude already IS an axis and an angle: take them out of the matrix and
     walk that one angle down to zero. Shortest possible path, and the axis
     never moves while it runs.

     EASED OUT, because it is arriving rather than departing — and the ball
     stays at drag resolution while it moves, like every other time it moves. */
  const RESET_MS = 460;
  const resetGo = () => {
    spinStop();
    const M = orbitMat(val.yaw, val.pitch, val.roll);
    const co = Math.max(-1, Math.min(1, (M[0] + M[4] + M[8] - 1) / 2));
    const ang = Math.acos(co);
    const land = () => {
      val.yaw = val.pitch = val.roll = 0;
      paint(); onChange && onChange({ ...val }, null);
    };
    if (ang < 2e-3) { land(); return; }
    let ax = norm([M[7] - M[5], M[2] - M[6], M[3] - M[1]]);
    if (!ax) {
      /* HALF A TURN, WHERE THE ANTISYMMETRIC PART VANISHES. R = 2nnᵀ − I
         there, so the axis is in the DIAGONAL — take the largest component,
         which is the numerically safe one, and let its row fix the other two
         signs. Rare, and the one attitude a naive extraction sends nowhere. */
      const d = [(M[0] + 1) / 2, (M[4] + 1) / 2, (M[8] + 1) / 2];
      const k = d[0] >= d[1] && d[0] >= d[2] ? 0 : d[1] >= d[2] ? 1 : 2;
      const v = Math.sqrt(Math.max(0, d[k])) || 1;
      ax = k === 0 ? [v, M[1] / (2 * v), M[2] / (2 * v)]
         : k === 1 ? [M[1] / (2 * v), v, M[5] / (2 * v)]
                   : [M[2] / (2 * v), M[5] / (2 * v), v];
      ax = norm(ax);
      if (!ax) { land(); return; }
    }
    quality(DPR_LO);
    const t0 = Date.now();
    const step = () => {
      const u = Math.min(1, (Date.now() - t0) / RESET_MS);
      const e = 1 - Math.pow(1 - u, 3);
      Object.assign(val, orbitEuler(orbitAxisMat(ax, ang * (1 - e))));
      paint(); onChange && onChange({ ...val }, null);
      if (u < 1) { rzRAF = requestAnimationFrame(step); return; }
      rzRAF = 0; land(); quality(DPR_HI);
    };
    rzRAF = requestAnimationFrame(step);
  };
  cv.addEventListener('dblclick', resetGo);

  /* A REPAINT ONLY WHEN IT CHANGES. `pick` is a walk over a few hundred
     projected samples and a repaint is every pixel of the ball; doing either
     on every `pointermove` of a hover would cost more than the drag does. */
  const setHover = k => { if (k !== hover) { hover = k; paint(); } };
  cv.addEventListener('pointermove', e => {
    if (held >= 0 || from) return;              /* a drag owns the ball */
    const r = cv.getBoundingClientRect();
    setHover(pick((e.clientX - r.left) * size / r.width,
                  (e.clientY - r.top) * size / r.height));
  });
  cv.addEventListener('pointerleave', () => setHover(-1));

  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect();
    const k = pick((e.clientX - r.left) * size / r.width,
                   (e.clientY - r.top) * size / r.height);
    spinStop();                 /* catching it stops it, like catching a ball */
    quality(DPR_LO);
    spPrev = null; spT = Date.now(); spBuf.length = 0;
    base = orbitMat(val.yaw, val.pitch, val.roll);
    if (k < 0) {
      /* ── NOT ON A RING: ROLL THE BALL ────────────────────────────────────
         A BALL YOU CAN ONLY TURN BY ITS RINGS IS NOT A BALL, it is three
         sliders bent into circles. The rings are for turning about ONE axis on
         purpose; the body is for the other nine-tenths of the time, when what
         you want is just to see the other side of it.

         SAME ARCBALL, ONE CONSTRAINT FEWER. Where a ring drag flattens both
         sphere points onto that ring's plane, this uses them whole: the
         rotation is the one that carries the point you grabbed to the point
         under the pointer now, about the axis perpendicular to both. Nothing
         is fixed, so it goes in every direction at once, which is what rolling
         a ball under your palm is.

         ONLY FROM INSIDE THE SILHOUETTE. Past it there is socket, and a drag
         starting on the case is not a drag on the ball — though once it has
         started the hand may wander anywhere, because Holroyd's sheet keeps
         answering out there. */
      const bp = ballPt(e, r);
      if (bp[0] * bp[0] + bp[1] * bp[1] > 1) { base = null; return; }
      from = norm(bp);
      if (!from) { base = null; return; }
      held = -2; axis = null;
      cv.setPointerCapture(e.pointerId);
      wrap.classList.add('turning');
      e.preventDefault();
      return;
    }
    /* THE AXIS IS WHERE THAT RING IS POINTING NOW, in world space, and the
       whole drag turns about that one axis. Read once, because rotating about
       an axis leaves that axis alone — so the ring you are holding does not
       move, and the ARROW PAINTED ON IT travels round under your hand, which
       is the thing you grabbed and the thing that should respond.

       MEASURED FROM WHERE THE DRAG STARTED, not accumulated frame to frame:
       incremental sums drift, and a drag that ends where it began has to end
       where it began. */
    axis = norm(orbitApply(base, AXV[k]));
    from = axis && flatten(ballPt(e, r), axis);
    if (!axis || !from) { axis = from = base = null; return; }
    held = k;
    cv.setPointerCapture(e.pointerId);
    wrap.classList.add('turning');
    wrap.dataset.ax = ORBIT_AX[k].lab;
    e.preventDefault();
  });

  cv.addEventListener('pointermove', e => {
    if (held === -1) return;
    const r = cv.getBoundingClientRect();
    if (held === -2) {
      const to = norm(ballPt(e, r));
      if (!to) return;
      const c = cross(from, to), m = Math.hypot(c[0], c[1], c[2]);
      /* the two points coincide — no axis, and no rotation to make */
      if (m < 1e-7) return;
      const th = Math.atan2(m, dot(from, to));
      Object.assign(val, orbitEuler(orbitMul(
        orbitAxisMat([c[0] / m, c[1] / m, c[2] / m], th), base)));
      spinSample();
      paint();
      onChange && onChange({ ...val }, null);
      return;
    }
    const to = flatten(ballPt(e, r), axis);
    /* THE POINTER IS ON THE AXIS ITSELF — no component in the plane, so no
       angle to read. Hold, do not guess. */
    if (!to) return;
    const th = signedAngle(from, to, axis);
    /* TURNED ABOUT THE RING'S OWN AXIS AND THEN READ BACK AS THREE ANGLES.
       Adding the angle straight onto one Euler term — which is what this did
       before — is a rotation about one of the THREE AXES THE ANGLES ARE
       WRITTEN IN, not about the ring, so the ring swung away from the hand and
       the two you were not touching stayed put. Exactly backwards.

       NO CLAMP, EVER: the decomposition returns (-180, 180] on its own, so the
       ball turns forever in either direction and there is no edge to run into.
       A rotation has no ends; only a knob does, and the knob is showing the
       same angle written the other way round. */
    Object.assign(val, orbitEuler(orbitMul(orbitAxisMat(axis, th), base)));
    spinSample();
    paint();
    onChange && onChange({ ...val }, ORBIT_AX[held].key);
  });

  const drop = () => {
    if (held === -1) return;
    held = -1; from = axis = base = null;
    wrap.classList.remove('turning');
    delete wrap.dataset.ax;
    spinGo();                   /* let go and it keeps going, then settles */
  };
  cv.addEventListener('pointerup', drop);
  cv.addEventListener('pointercancel', drop);
  cv.addEventListener('lostpointercapture', drop);

  /* THE KEYBOARD GETS THE TWO IT CAN REACH. Arrows are yaw and pitch because
     those are the two a pointer would reach for; roll takes shift, because a
     control with three axes and four arrow keys has to leave one out and roll
     is the one you set least. */
  wrap.tabIndex = 0;
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'Orientation — drag a ring to turn');
  wrap.addEventListener('keydown', e => {
    /* DOWN IS LESS, the same sentence the drag makes — an arrow key that
       disagreed with the hand would be the same control answering twice. */
    const d = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: 1, ArrowDown: -1 }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    const horiz = e.key === 'ArrowRight' || e.key === 'ArrowLeft';
    const key = e.shiftKey ? 'roll' : horiz ? 'yaw' : 'pitch';
    val[key] = wrapDeg(val[key] + d * (e.altKey ? 1 : 5));
    paint();
    onChange && onChange({ ...val }, key);
  });

  paint();
  /* SILENT, like every other `.set` in this file: a host pushing a value in is
     syncing, not turning the ball. */
  wrap.set = (v = {}) => {
    if (v.yaw   != null) val.yaw   = v.yaw;
    if (v.pitch != null) val.pitch = v.pitch;
    if (v.roll  != null) val.roll  = v.roll;
    paint();
    return wrap;
  };
  wrap.get = () => ({ ...val });
  return wrap;
}

const WIN_ICON = {
  close:  svg('<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>'),
  reduce: svg('<line x1="6" y1="12" x2="18" y2="12"/>'),
  max:    svg('<path d="M4 9V4h5"/><path d="M20 15v5h-5"/><path d="M15 4h5v5"/><path d="M9 20H4v-5"/>'),
  min:    svg('<path d="M9 4v5H4"/><path d="M15 20v-5h5"/><path d="M20 9h-5V4"/><path d="M4 15h5v5"/>'),
};

/* ── AND A WINDOW MAY OPEN OUT — `maximise: true` ──────────────────────────
   A PANEL WITH A PICTURE IN IT OUTGROWS ITS DESK, and that is the whole case
   for this. A map editor, a preview, a specimen sheet: the controls beside it
   have an honest width and the picture has none — it takes whatever it is
   given, and on a desk it is given a thumbnail. Reducing solves the opposite
   problem. There was no part for this one, so the first app that needed it
   built the button, the class and the chrome-hiding for itself; this is that,
   taken back, because a second adopter composing it a second way is how a
   language stops being one.

   IT IS A SECOND BUTTON AND NOT A MODE. Reduce and open-out are not two ends of
   one control — a panel can be neither, and the two gestures live at opposite
   ends of the same axis — so they are two caps in the head, the maximise one
   FIRST so the pair reads outward-then-down.

   MAXIMISED AND REDUCED CANNOT BOTH BE TRUE, and the interlock runs both ways:
   opening out clears the fold, and reducing an opened-out panel stands it down
   first. A full-screen panel collapsed to its title bar is a title bar across
   the whole screen.

   `maxed-open` GOES ON THE BODY so a document can stand its own chrome down —
   opened out, the panel IS the screen, and a bar lying across the top of it is
   the furniture of a view you have left. The flag is read back off the DOM
   rather than from the argument, so it stays true while ANY window is open: the
   answer to "is anything maximised" is a query, not a counter.

   WHAT THE HOST STILL OWNS is where the panel was. This part writes `position`
   and `transform` from a stylesheet, and a host that pins its windows with
   INLINE styles — as a desk that remembers where you dragged them must — beats
   any selector with them. `onMax(on)` fires synchronously on every change and is
   where such a host parks and restores its own inline properties. */
function windowise(box, { title, mode = 'reduce', onClose, maximise = false, onMax } = {}) {
  const head = box.querySelector('.box-head');
  if (!head) return box;
  box.classList.add('win');
  head.classList.add('win-head');
  head.title = 'Drag to move';

  /* ONE BUTTON, AND WHICH ONE IS THE PANEL'S ANSWER, NOT A SETTING. */
  const btn = el('button', 'win-btn', mode === 'close' ? WIN_ICON.close : WIN_ICON.reduce);
  btn.type = 'button';
  btn.title = mode === 'close' ? `Close ${title || 'this panel'}`
                               : `Reduce ${title || 'this panel'} to its title`;
  btn.setAttribute('aria-label', btn.title);
  let setMax = null;
  btn.addEventListener('pointerdown', e => e.stopPropagation());   // not a drag
  btn.addEventListener('click', () => {
    if (mode === 'close') { SFX?.clack?.(); box.classList.add('gone'); onClose && onClose(box); }
    else {
      const to = !box.classList.contains('reduced');
      /* REDUCING AN OPENED-OUT PANEL STANDS IT DOWN FIRST — see the interlock
         note above. Folding one leaves a title bar the width of the screen. */
      if (to && setMax && box.classList.contains('maxed')) setMax(false);
      box.classList.toggle('reduced', to);
      btn.setAttribute('aria-expanded', String(!to));
      SFX?.flip?.();
    }
  });
  head.append(btn);

  if (maximise) {
    const mb = el('button', 'win-btn win-max', WIN_ICON.max);
    mb.type = 'button';
    /* THE CAP CARRIES THE STATE IN ITS GLYPH, ITS TITLE AND ITS `aria-pressed`,
       all three repainted together — a mark saying "open out" over a panel that
       is already out is the same lie a switch tells when only its lamp moves. */
    const paintMax = () => {
      const on = box.classList.contains('maxed');
      mb.innerHTML = on ? WIN_ICON.min : WIN_ICON.max;
      mb.title = on ? `Restore ${title || 'this panel'}` : `Open ${title || 'this panel'} out`;
      mb.setAttribute('aria-label', mb.title);
      mb.setAttribute('aria-pressed', String(on));
    };
    setMax = (on) => {
      box.classList.toggle('maxed', on);
      document.body.classList.toggle('maxed-open', !!document.querySelector('.win.maxed'));
      if (on) { box.classList.remove('reduced'); btn.setAttribute('aria-expanded', 'true'); }
      paintMax();
      onMax && onMax(on);
    };
    mb.addEventListener('pointerdown', e => e.stopPropagation());   // not a drag
    mb.addEventListener('click', () => { SFX?.flip?.(); setMax(!box.classList.contains('maxed')); });
    paintMax();
    /* FIRST OF THE PAIR — outward, then down. */
    head.insertBefore(mb, btn);
    box.setMax = setMax;
  }

  /* DRAG FROM THE HEAD, AND THE PANEL STAYS WHERE YOU PUT IT. Transform rather
     than left/top: it does not reflow anything, it composites, and a panel
     dragged across a page full of live specimens must not make them re-lay-out
     sixty times a second. */
  let dx = 0, dy = 0, sx = 0, sy = 0, on = false;
  const place = () => { box.style.transform = `translate(${dx}px, ${dy}px)`; };
  head.addEventListener('pointerdown', e => {
    if (e.target.closest('.win-btn')) return;
    head.setPointerCapture(e.pointerId);
    on = true; sx = e.clientX - dx; sy = e.clientY - dy;
    box.classList.add('dragging');
    /* THE ONE YOU TOUCHED COMES TO THE FRONT. Two overlapping panels where the
       one underneath stays underneath when you grab it is a stack you cannot
       reorder, which is most of what moving them is for. */
    box.style.zIndex = String(++windowise.top);
    e.preventDefault();
  });
  head.addEventListener('pointermove', e => {
    if (!on) return;
    dx = e.clientX - sx; dy = e.clientY - sy;
    place();
  });
  const stop = () => { on = false; box.classList.remove('dragging'); };
  head.addEventListener('pointerup', stop);
  head.addEventListener('pointercancel', stop);
  head.addEventListener('lostpointercapture', stop);

  box.reset = () => {
    /* STOOD DOWN THROUGH `setMax`, NOT BY DROPPING THE CLASS. The body flag and
       the cap's glyph are part of the state; clearing `maxed` on its own leaves
       a document with its chrome hidden and a button offering to restore a
       panel that is already restored. */
    if (setMax && box.classList.contains('maxed')) setMax(false);
    dx = dy = 0; place(); box.classList.remove('gone', 'reduced');
  };
  /* SET THE RESTING STATE WITHOUT FAKING A CLICK. A demo that dispatches its
     own clicks to arrange itself makes a noise, animates on load, and lies to
     anything listening for a real one. */
  box.rest = () => {
    if (mode === 'close') { box.classList.add('gone'); onClose && onClose(box); }
    else { box.classList.add('reduced'); btn.setAttribute('aria-expanded', 'false'); }
  };
  return box;
}
windowise.top = 10;

/* ── THE LIGHT DIRECTION SETTER ────────────────────────────────────────────
   TWO ANGLES ARE ONE DIRECTION, and that is the entire argument for this
   part. Azimuth and elevation shipped as two number fields, and two fields
   make you hold a hemisphere in your head and do the trigonometry yourself:
   nothing on the panel says that 325°/59° is over your right shoulder and
   high, and nothing says that nudging elevation to 0 puts the sun on the
   horizon where every shadow goes to infinity. A knob each would be worse —
   it would say these are two independent quantities, which is exactly the
   wrong claim.

   SO IT IS A DISC SEEN FROM ABOVE, which is how a light is aimed on any real
   rig. The lamp is a dot you drag:

     THE ANGLE ROUND THE DISC IS THE AZIMUTH, with 0° at the right and the
     numbers running anticlockwise, because that is the convention the maths
     already uses and the one the app's own field is written in. It is
     labelled at the four quarters and nowhere else — a protractor is a
     different instrument.
     THE DISTANCE FROM THE MIDDLE IS THE ELEVATION, inverted: the CENTRE is
     90° and straight down, the RIM is 0° and level with the ground. That is
     not a choice, it is what a hemisphere looks like flattened — the zenith
     is one point and the horizon is the whole edge — and it is why the ring
     at half radius is drawn at 45°, the one elevation anybody aims for by
     name.
     THE PUCK IS THE LAMP AND IT IS LIT. Everything else on this control is
     the fixture.

   IT IS CLAMPED TO THE DISC AND NEVER WRAPS. Drag past the rim and elevation
   pins at 0 while the azimuth keeps following your hand, which is a lamp
   being swung round at the horizon. Letting the radius run past 1 would put
   the light UNDER the ground and there is no such direction on this control.

   THE NUMBERS ARE STILL THERE, under the disc, and they are still typeable.
   A picker replaces the arithmetic, not the value: 325 is a thing you copy
   out of one panel and into another, and a control that can only be dragged
   cannot be given a number someone read to you. */
function lightDir({ label = 'Light', az = 315, el: elev = 45, size = 132, onChange }) {
  const wrap = el('div', 'lwrap');
  const disc = el('div', 'ldisc');
  disc.style.setProperty('--ld', size + 'px');
  disc.tabIndex = 0;
  disc.setAttribute('role', 'application');
  disc.setAttribute('aria-label', label + ' direction');

  /* THE MARKS ARE ONE SVG, NOT SIX ELEMENTS. Two rings, two crosshairs and
     four legends that all have to stay concentric under one radius — as
     divs that is six things to keep agreeing, and every one of them rounds
     to a different pixel at a size the caller picked. */
  const face = el('div', null,
    `<svg class="ld-face" viewBox="0 0 100 100" aria-hidden="true">
       <circle class="ld-ring" cx="50" cy="50" r="46"/>
       <circle class="ld-ring ld-45" cx="50" cy="50" r="23"/>
       <path class="ld-cross" d="M4 50 H96 M50 4 V96"/>
       <text class="ld-deg" x="50" y="12"  text-anchor="middle">90°</text>
       <text class="ld-deg" x="50" y="94"  text-anchor="middle">270°</text>
       <text class="ld-deg" x="7"  y="52.5" text-anchor="start">180°</text>
       <text class="ld-deg" x="93" y="52.5" text-anchor="end">0°</text>
     </svg>`).firstElementChild;
  const puck = el('i', 'ld-puck');
  disc.append(el('i', 'ld-well'), face, puck);

  const azOut = el('div', 'kval'), elOut = el('div', 'kval');
  const field = (cap, out) => {
    const f = el('div', 'lfield');
    f.append(el('div', 'klab', cap), out);
    return f;
  };

  let A = az, E = elev;
  const norm360 = d => ((d % 360) + 360) % 360;

  /* THE MARKER IS A DOT, AND IT WAS AN ARROW FOR ONE VERSION. The arrow was
     more informative on paper — a vector says which way, a dot only says
     where — and on a 118px disc it was worse: the head has to scale with the
     length or it eats the shaft, so above about 60° of elevation the thing is
     a stub, and the one shape that has to stay recognisable changes shape
     across the range that matters. A dot is the same mark at every elevation
     and the RINGS already carry the reading. Kept as a note because the arrow
     is the obvious idea and will be had again. */
  const paint = () => {
    // r = 0 at the zenith, 1 at the horizon — the flattened hemisphere
    const r = (1 - E / 90) * 0.46;
    const t = A * Math.PI / 180;
    puck.style.left = (50 + Math.cos(t) * r * 100) + '%';
    puck.style.top  = (50 - Math.sin(t) * r * 100) + '%';
    azOut.textContent = Math.round(A) + '°';
    elOut.textContent = Math.round(E) + '°';
    disc.setAttribute('aria-valuetext', `azimuth ${Math.round(A)} degrees, elevation ${Math.round(E)} degrees`);
  };

  /* THE TICK IS THE AZIMUTH'S, NOT THE VALUE'S, and it is the knob's rule
     borrowed wholesale: a lamp swung through a full turn should ratchet a
     few dozen times, not three hundred and sixty. Elevation gets none —
     it is a slide, not a turn, and two ratchets from one gesture is a
     mechanism nobody can identify. */
  let enc = Math.round(A / 9);
  const set = (nA, nE, quiet) => {
    A = norm360(nA);
    E = Math.max(0, Math.min(90, nE));
    const e2 = Math.round(A / 9);
    if (!quiet && e2 !== enc) SFX.step();
    enc = e2;
    paint();
    onChange && onChange({ az: +A.toFixed(1), el: +E.toFixed(1) });
  };

  const fromPoint = (cx, cy) => {
    const b = disc.getBoundingClientRect();
    const dx = (cx - b.left) / b.width - 0.5;
    const dy = (cy - b.top) / b.height - 0.5;
    /* CLAMPED, NEVER WRAPPED. Past the rim the elevation pins at 0 and the
       azimuth keeps tracking — a lamp swung round at the horizon. */
    const r = Math.min(Math.hypot(dx, dy) / 0.46, 1);
    // a drag that lands exactly on the middle has no angle; keep the last one
    const ang = (dx || dy) ? norm360(Math.atan2(-dy, dx) * 180 / Math.PI) : A;
    set(ang, (1 - r) * 90);
  };

  disc.addEventListener('pointerdown', e => {
    disc.setPointerCapture(e.pointerId);
    disc.classList.add('dragging');
    e.preventDefault();
    fromPoint(e.clientX, e.clientY);
  });
  disc.addEventListener('pointermove', e => {
    if (disc.classList.contains('dragging')) fromPoint(e.clientX, e.clientY);
  });
  const end = () => disc.classList.remove('dragging');
  disc.addEventListener('pointerup', end);
  disc.addEventListener('pointercancel', end);
  disc.addEventListener('lostpointercapture', end);

  /* LEFT AND RIGHT SWING IT, UP AND DOWN RAISE IT, which is the only mapping
     that matches what the two axes MEAN rather than where the puck happens to
     be on screen — at 90° azimuth the puck moves vertically under a left
     arrow, and that is correct: you are turning the rig, not dragging a dot. */
  disc.addEventListener('keydown', e => {
    const s = e.shiftKey ? 1 : 5;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); set(A + s, E); }
    if (e.key === 'ArrowRight') { e.preventDefault(); set(A - s, E); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); set(A, E + s); }
    if (e.key === 'ArrowDown')  { e.preventDefault(); set(A, E - s); }
  });

  paint();
  typeable(azOut, () => Math.round(A), v => set(v, E));
  typeable(elOut, () => Math.round(E), v => set(A, v));

  const row = el('div', 'lrow');
  row.append(field('Azimuth', azOut), field('Elevation', elOut));
  wrap.append(el('div', 'klab lcap', label), disc, row);
  wrap.set = (nA, nE) => set(nA, nE, true);   // a host drives this SILENTLY
  return wrap;
}

/* ── THE SELECTOR — a value you pick by NAME ───────────────────────────────
   FOR FIVE TO A DOZEN NAMES — the gap between `rotary` and `drum`, and both
   ends of it are real. A rotary
   is aimable to about six and then you are counting detents; a drum
   is a cylinder, which is honest about being a mechanism and dishonest about
   being readable — you can see three names, one of them properly, and there is
   no way to jump.

   SO: A FACE THAT READS, AND A LIST THAT OPENS. Closed, it is a window with
   the current name engraved in it, which is already more than either of the
   other two give you. Open, it is the rows a `menu` uses, because a list of
   things you pick from is a list of things you pick from and this document
   does not need two of them.

   IT IS AN OVERLAY AND NOT AN EXPANDER, and that is a statement about the
   PLATE rather than about menus. A faceplate is rigid. Nothing on a console
   pushes its neighbours down to make room, so a control that reflows the panel
   under it is a control that has stopped pretending the panel is a panel.
   `openPlate` is already the lid that lifts over the face, with one open at a
   time, Escape, click-outside, and a flip rather than a clip at the window
   edge — all of which this gets for nothing.

   WHERE IT DIFFERS FROM `menu`, AND IT IS ONE THING THAT CHANGES EVERYTHING:
   A MENU HAS NO RESTING MARK. Its rows are commands, so the only state a row
   can be in is "the pointer is on it" — and one highlight is enough. A value
   list has a row that is ALREADY TRUE, sitting there before you touch
   anything, and it needs a mark that is not the hover mark or you cannot tell
   what you have from what you are about to get. So there are two:

     THE CURRENT ROW IS PRESSED IN. It takes `.pkey.is-down`'s own language —
     the recess, the chamfer, the lamp — because that is what this panel has
     always meant by "this one is selected", and a selector row is the same
     claim a lit key makes.
     THE POINTED-AT ROW LIGHTS. Raised, warmer, exactly `.menu-row:hover`.

   One is a state and one is a hover, they never look alike, and the row you
   have can be under the pointer without either of them lying.

   AND THE THING THE DRUM COULD NEVER DO: TYPE-AHEAD. Two letters get you to
   `Detail` in a list of thirty. This is the whole of what software can offer
   over a machined part, it costs one keydown handler, and it is the actual
   answer to "the drum is not user friendly". */
const TYPE_GAP = 900;
function selector({ label, options, index = 0, width = 168, onChange }) {
  const wrap = el('div', 'selwrap');
  const face = el('button', 'sel');
  face.type = 'button';
  face.style.setProperty('--selw', width + 'px');
  face.setAttribute('aria-haspopup', 'listbox');
  face.setAttribute('aria-expanded', 'false');
  if (label) face.setAttribute('aria-label', label);
  const nm = el('span', 'sel-nm');
  face.append(nm, el('span', 'sel-chev', ICON.chev || ''));

  let i = Math.max(0, Math.min(options.length - 1, index));
  const paint = () => { nm.textContent = options[i]; };

  const set = (n, quiet) => {
    const was = i;
    i = (n + options.length) % options.length;
    paint();
    if (i !== was && !quiet) { SFX.clack(); onChange && onChange(i, options[i]); }
    else if (i !== was) onChange && onChange(i, options[i]);
  };

  /* ── THE LIST ────────────────────────────────────────────────────────── */
  let rows = [];
  const build = () => {
    const body = el('div', 'plate-body');
    body.setAttribute('role', 'listbox');
    if (label) body.setAttribute('aria-label', label);
    rows = options.map((o, n) => {
      const r = el('button', 'menu-row sel-row' + (n === i ? ' is-cur' : ''));
      r.type = 'button';
      r.setAttribute('role', 'option');
      r.setAttribute('aria-selected', String(n === i));
      r.append(el('span', 'sel-tick', ''), el('span', 'menu-nm', o));
      r.addEventListener('click', () => {
        if (plateOpen) plateOpen.close();
        set(n);
        face.focus();
      });
      clicky(r, SFX.tap, SFX.lift);
      body.append(r);
      return r;
    });
    return body;
  };

  /* THE WALK MOVES FOCUS AND NOTHING ELSE. Committing as you arrow means a
     list you cannot look through without changing the value, and on a control
     wired to a repaint that is thirty renders on the way past. Enter commits,
     Escape leaves it as it was — which `openPlate` already does, because it
     never touched the value in the first place. */
  const step = d => {
    const at = rows.indexOf(document.activeElement);
    const to = at < 0 ? i : (at + d + rows.length) % rows.length;
    rows[to].focus();
  };

  /* TYPE-AHEAD, and the buffer is what makes it a search rather than a jump to
     the last letter you hit. Within nine hundred milliseconds the letters
     accumulate — `d`, `de`, `det` — and after that it starts again, which is
     the interval every list in every OS has used since about 1984. Matching
     starts AFTER the current row so repeated presses of one letter cycle the
     names beginning with it, rather than sticking on the first. */
  let buf = '', bufAt = 0;
  const typeAhead = (ch, now) => {
    buf = (now - bufAt < TYPE_GAP) ? buf + ch : ch;
    bufAt = now;
    const from = rows.indexOf(document.activeElement);
    const start = buf.length > 1 ? Math.max(from, 0) : from + 1;
    for (let k = 0; k < options.length; k++) {
      const n = (start + k + options.length) % options.length;
      if (options[n].toLowerCase().startsWith(buf)) { rows[n].focus(); return true; }
    }
    return false;
  };

  const open = () => {
    const plate = openPlate(face, build(), { up: false, cls: 'menu sellist', onKey: (e, close) => {
      if (e.key === 'ArrowDown')      { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); step(-1); }
      else if (e.key === 'Home')      { e.preventDefault(); rows[0].focus(); }
      else if (e.key === 'End')       { e.preventDefault(); rows[rows.length - 1].focus(); }
      else if (e.key === 'Tab')       { close(); }
      else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (typeAhead(e.key.toLowerCase(), e.timeStamp)) e.preventDefault();
      }
    }});
    face.classList.toggle('is-down', !!plate);
    if (!plate) return;
    /* THE WHOLE LIST IS ON SCREEN AND THERE IS NO SCROLLER, which is a claim
       about the SIZE this part is for: five to a dozen names. Past that it is
       the wrong control and a scrollbar would be the thing hiding that fact —
       a list you have to travel through to see is a list you cannot compare,
       and comparing is the only reason to open it rather than arrow the face.
       `preventScroll` because focusing a row must never move the PAGE under
       a plate that is positioned against it. */
    rows[i].focus({ preventScroll: true });
  };

  face.addEventListener('click', open);
  /* THE CLOSED FACE STEPS WITHOUT OPENING, which is what keeps this a
     one-handed control: a value you are nudging by one is not a value you want
     a list for. Alt opens instead, the platform convention, and Home/End go to
     the ends without a round trip through the plate. */
  face.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (e.altKey) open(); else set(i + (e.key === 'ArrowDown' ? 1 : -1));
    } else if (e.key === 'Home')  { e.preventDefault(); set(0); }
    else if (e.key === 'End')     { e.preventDefault(); set(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });

  paint();
  if (label) wrap.append(el('div', 'klab', label));
  wrap.append(face);
  wrap.set = n => set(n, true);          // a host drives this control SILENTLY
  wrap.value = () => options[i];
  return wrap;
}

/* ── THE GATED LEVER ───────────────────────────────────────────────────────
   NOTHING OPENS, AND THAT IS THE WHOLE POINT. A dropdown was tried twice here
   and the second attempt is what settled it: a plate that flies out over the
   panel reads as a web control no matter what it is made of, because flying
   out over things is not something a panel DOES. A faceplate is a solid, and
   every real control on one is cut INTO it.

   SO THE LIST IS PART OF THE PLATE. A slot milled down the face with a detent
   notch at each position, a lever standing in it, and the names engraved
   beside the notches. Everything is legible at rest, there is no reveal to
   design, and the only thing that moves is the lever — which is what a
   transmission gate, an aircraft flap lever and a desk's routing selector all
   are.

   IT IS VERTICAL, AND THAT IS WHAT MAKES IT SURVIVE PAST FIVE. Laid on its
   side the names have to fit BETWEEN the notches and you run out of room at
   about five; standing up, each name has a whole row to itself and the gate
   just gets taller — twelve notches is 288px, which is a column on a panel
   rather than a problem. The pitch is the row height and nothing else has to
   change.

   THE LEVER SNAPS AS IT CROSSES, not when you let go. A gate that only decides
   at the end of the gesture is a slider with names on it: the notch is the
   whole mechanism, so it has to be felt on the way past, which is the same
   argument the rotary's detents already made and it gets the same clack.

   AND THE NAMES ARE TARGETS. The lever is 22px wide and the legend beside it
   is the width of the control — aiming at the small part when the big part
   means the same thing is a tax nobody should pay. Click a name, the lever
   goes there. */
const GATE_PITCH = 24, GATE_PAD = 7;
function gate({ label, options, index = 0, width = 150, onChange }) {
  const wrap = el('div', 'gatewrap');
  if (label) wrap.append(el('div', 'klab', label));

  const body = el('div', 'gate');
  body.style.setProperty('--gw', width + 'px');
  body.style.setProperty('--gp', GATE_PITCH + 'px');
  body.style.height = (options.length * GATE_PITCH + GATE_PAD * 2) + 'px';

  const slot = el('div', 'gate-slot');
  const lever = el('i', 'gate-lever');
  /* THE NOTCHES ARE ELEMENTS AND NOT A REPEATING GRADIENT. A gradient at this
     pitch is exact only while the pitch divides the height, and the moment a
     caller changes the count by one every notch drifts half a pixel off the
     legend it belongs to. Placed, they cannot disagree with the rows. */
  options.forEach((_, n) => {
    const k = el('i', 'gate-notch');
    k.style.top = (GATE_PAD + n * GATE_PITCH + GATE_PITCH / 2) + 'px';
    slot.append(k);
  });
  slot.append(lever);

  const legs = el('div', 'gate-legs');
  legs.setAttribute('role', 'listbox');
  if (label) legs.setAttribute('aria-label', label);
  legs.tabIndex = 0;

  let i = Math.max(0, Math.min(options.length - 1, index));
  const rows = options.map((o, n) => {
    const b = el('button', 'gate-leg');
    b.type = 'button';
    b.tabIndex = -1;
    b.setAttribute('role', 'option');
    b.append(el('span', 'gate-nm', o));
    b.addEventListener('click', () => set(n));
    legs.append(b);
    return b;
  });

  const paint = () => {
    lever.style.top = (GATE_PAD + i * GATE_PITCH + GATE_PITCH / 2) + 'px';
    rows.forEach((r, n) => {
      r.classList.toggle('on', n === i);
      r.setAttribute('aria-selected', String(n === i));
    });
    legs.setAttribute('aria-activedescendant', '');
  };

  const set = (n, quiet) => {
    const to = Math.max(0, Math.min(options.length - 1, n));
    if (to === i) return;
    i = to;
    paint();
    if (!quiet) SFX.clack();
    onChange && onChange(i, options[i]);
  };

  /* DRAG ANYWHERE IN THE SLOT, and the notch is picked from where the pointer
     IS rather than from how far it has moved. A lever in a gate has an
     absolute position — it is standing in a numbered slot, not accumulating an
     offset — so grabbing it halfway and letting go must not leave it half a
     notch out. */
  const fromY = cy => {
    const b = slot.getBoundingClientRect();
    set(Math.round((cy - b.top - GATE_PAD - GATE_PITCH / 2) / GATE_PITCH));
  };
  let dragging = false;
  slot.addEventListener('pointerdown', e => {
    dragging = true; slot.setPointerCapture(e.pointerId);
    body.classList.add('dragging'); e.preventDefault();
    fromY(e.clientY);
  });
  slot.addEventListener('pointermove', e => { if (dragging) fromY(e.clientY); });
  const end = () => { dragging = false; body.classList.remove('dragging'); };
  slot.addEventListener('pointerup', end);
  slot.addEventListener('pointercancel', end);
  slot.addEventListener('lostpointercapture', end);

  legs.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); set(i + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); set(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); set(0); }
    else if (e.key === 'End')  { e.preventDefault(); set(options.length - 1); }
  });

  body.append(slot, legs);
  wrap.append(body);
  paint();
  wrap.set = n => set(n, true);          // a host drives this control SILENTLY
  wrap.value = () => options[i];
  return wrap;
}

/* ── THE INTERLOCKED BANK ──────────────────────────────────────────────────
   THE CONTROL IS THE LIST, and after three attempts at hiding the names that
   is the only version of this that has been worth using. Everything else in
   this group asks you to accept a trade: the selector hides the list behind a
   plate, the wheel hid it behind a window and showed one name at a time, and
   both of those are answers to a question about SPACE rather than about
   choosing. When there are nine names and each one is a word, the cheapest
   thing a panel can do is put nine keys on it.

   IT IS MECHANICALLY INTERLOCKED, which is the part that makes it a selector
   and not nine switches: pressing one RELEASES the others, and the one that is
   down cannot be pressed up. That second half is not a nicety — a value has to
   be something, so a bank you can click into having no selection is a bank
   with a state the app it drives cannot represent.

   AND IT IS A GRID, NOT A ROW, which is the whole reason it survives past
   five. Nine keys in a line is 700px and a panel does not have that; nine keys
   three across is a block the size of a knob bay, and a block of latching keys
   is what a console actually puts there. `cols` is the only thing a caller
   tunes, and it defaults to three above six names and to one row below — the
   count at which a line still fits.

   IT IS `keyBank` AND NOT `bank`, WHICH COST A CRASH TO FIND OUT. `bank` is
   what anybody calls a local variable holding a row of things — the specimen
   page had one four lines below the call — and a top-level name that shadows a
   common local is the exact trap this file's own build notes describe for
   `key` beside p5's global. It threw here, which was lucky; in an app that
   assigns to its own `bank` first it would simply have read the wrong one.

   IT ADDS NO MATERIAL. The well is `.piano`, the caps are `.pkey`, the lit one
   is `.is-down` — the same three parts the page switcher is made of, doing the
   same job for the same reason. A part that needs no new surface is a part
   this language already had and had not noticed. */
function keyBank({ label, options, index = 0, cols, onChange }) {
  const wrap = el('div', 'bankwrap');
  if (label) wrap.append(el('div', 'klab', label));
  const box = el('div', 'piano sm bank');
  box.setAttribute('role', 'listbox');
  if (label) box.setAttribute('aria-label', label);
  const C = cols || (options.length > 6 ? 3 : options.length);
  box.style.setProperty('--bcols', C);

  let i = Math.max(0, Math.min(options.length - 1, index));
  const keys = options.map((o, n) => {
    const b = el('button', 'pkey bank-key', o);
    b.type = 'button';
    b.setAttribute('role', 'option');
    /* ROVING TABINDEX: the bank is ONE stop on the tab ring, not nine. A
       radio group that costs nine tabs to walk past is why people stop using
       the keyboard. */
    b.tabIndex = n === i ? 0 : -1;
    b.addEventListener('click', () => set(n));
    box.append(b);
    return b;
  });

  const paint = () => keys.forEach((k, n) => {
    const on = n === i;
    k.classList.toggle('is-down', on);
    k.setAttribute('aria-selected', String(on));
    k.tabIndex = on ? 0 : -1;
  });

  const set = (n, quiet) => {
    const to = Math.max(0, Math.min(options.length - 1, n));
    /* PRESSING THE ONE THAT IS DOWN DOES NOTHING, and it does nothing
       SILENTLY: a latching key that clacks without moving is a key reporting
       an event that did not happen. */
    if (to === i) return;
    i = to; paint();
    if (!quiet) SFX.clack();
    onChange && onChange(i, options[i]);
  };

  /* THE ARROWS WALK THE GRID AS A GRID. Left and right step by one, up and
     down step by a ROW — reading the keys as a flat list under a vertical
     arrow puts the focus somewhere the eye did not go, which is worse than no
     vertical arrows at all. */
  box.addEventListener('keydown', e => {
    const at = keys.indexOf(document.activeElement);
    if (at < 0) return;
    let to = null;
    if (e.key === 'ArrowRight') to = at + 1;
    else if (e.key === 'ArrowLeft') to = at - 1;
    else if (e.key === 'ArrowDown') to = at + C;
    else if (e.key === 'ArrowUp') to = at - C;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = keys.length - 1;
    if (to == null) return;
    e.preventDefault();
    if (to < 0 || to >= keys.length) return;
    set(to);
    keys[to].focus();
  });

  paint();
  wrap.append(box);
  wrap.set = n => set(n, true);          // a host drives this control SILENTLY
  wrap.value = () => options[i];
  return wrap;
}
