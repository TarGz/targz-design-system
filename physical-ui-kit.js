/* ══════════════════════════════════════════════════════════════════════════
   physical-ui-kit.js — THE SKEW KIT, LIFTED OUT OF THE PAGE THAT GREW IT.

   Every primitive here was written for physical-ui-layers.html and is copied
   from it VERBATIM: the icon sets, the voice bank, the knob, the two faders,
   the colour picker, the drum, the rotary, the key and the piano key, the
   panel outline and the window. Nothing was redesigned on the way out — the
   whole point of a second document is that it uses the SAME parts, and a part
   that got improved while being moved is a different part.

   ONE EDIT, AND IT IS `engage`. Its root list was a literal of that page's
   ids. It now reads `window.ENGAGE_ROOTS` at CALL time, so a second page
   declares its own roots and neither page knows about the other's.

   physical-ui-layers.html still carries its own inline copy and is untouched.
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
  // the pen cap, for the colour row
  ink: eng('<path d="M8.5 21V8.5C8.5 5 10 3 12 3s3.5 2 3.5 5.5V21z"/><line x1="8.5" y1="17" x2="15.5" y2="17"/>'),
  // THE THREE HANDS, and each one is its own marks rather than a picture of
  // them: strokes that bend, strokes that cross, strokes that agree on nothing
  hhand: eng('<path d="M4 16.5C7 9.5 11 6 17 5"/><path d="M7 19C10 12 14 8.5 20 7.5"/>' +
             '<path d="M3.5 11.5C6 7.5 8.5 5.5 12.5 4.5"/>'),
  hcross: eng('<path d="M3.5 14C7 8 11 5 17 4"/><path d="M6.5 19.5C10 13.5 14 10.5 20.5 9.5"/>' +
              '<path d="M7 3.5C9 9 12.5 15 17.5 20"/><path d="M3 8.5C5 13 8 17.5 11.5 21"/>'),
  // the serpentine: three passes and the two turns that make them one stroke
  serp: eng('<path d="M4 5h13a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h13"/>'),
  hrand: eng('<line x1="3.5" y1="7" x2="7" y2="4.5"/><line x1="10" y1="5.5" x2="12" y2="9.5"/>' +
             '<line x1="16" y1="4" x2="19.5" y2="6.5"/><line x1="5" y1="13" x2="8.5" y2="11"/>' +
             '<line x1="12.5" y1="14.5" x2="15" y2="11.5"/><line x1="18" y1="13.5" x2="20.5" y2="16"/>' +
             '<line x1="4" y1="19.5" x2="6" y2="16.5"/><line x1="10" y1="20" x2="14" y2="18.5"/>'),
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
  track.addEventListener('pointerup', () => {
    if (track.dataset.on) SFX.drop();
    delete track.dataset.on;
  });

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
  track.addEventListener('pointerup', () => {
    if (track.dataset.on) SFX.drop();
    delete track.dataset.on;
  });
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
  fieldEl.addEventListener('pointerup', () => delete fieldEl.dataset.on);

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
  /* AND THE NAMES COME IN, not just closer together. The leader's whole job is
     to absorb the mismatch between a fan of ticks and a straight column, and
     it can do that over 34px as well as 40 — which is 8px of name back on
     every switch, on a panel where 8px is the difference between a word
     fitting and being abbreviated. */
  const ELBOW_X = compact ? 34 : 40, LAB_X = compact ? 48 : 56;
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
  knob.addEventListener('pointerup', () => knob.classList.remove('dragging'));
  knob.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); set(i + 1); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); set(i - 1); }
  });
  paint();
  return row;
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
   way out of physical-ui-layers.html. Read at call time so a page can declare
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


const WIN_ICON = {
  close:  svg('<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>'),
  reduce: svg('<line x1="6" y1="12" x2="18" y2="12"/>'),
};

function windowise(box, { title, mode = 'reduce', onClose } = {}) {
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
  btn.addEventListener('pointerdown', e => e.stopPropagation());   // not a drag
  btn.addEventListener('click', () => {
    if (mode === 'close') { SFX?.clack?.(); box.classList.add('gone'); onClose && onClose(box); }
    else {
      const to = !box.classList.contains('reduced');
      box.classList.toggle('reduced', to);
      btn.setAttribute('aria-expanded', String(!to));
      SFX?.flip?.();
    }
  });
  head.append(btn);

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

  box.reset = () => { dx = dy = 0; place(); box.classList.remove('gone', 'reduced'); };
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
