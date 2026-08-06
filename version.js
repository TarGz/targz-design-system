export const version = '1.3.0';

export const CHANGELOG = [
  {
    version: '1.3.0',
    date: '2026-08-06',
    changes: [
      'Canvas, grid & rulers (section 03): replaced the static "warm grid" description with how it actually works — the grid is derived from the sheet, not a fixed 40px CSS pattern',
      'Documented the division formula round(max(canvasW, canvasH) / 60) clamped to 4-30, so grid lines always land on the paper edges and continue to the window edges',
      'Documented the size readout: bottom and right rulers pinned to the sheet, a tick per division but only the two ends labelled, in millimetres',
      'Recorded that the Y axis is inverted (paperH - mm) so the origin is bottom-left, matching the plotter bed',
      'Added a demo showing an A1 square sheet at 594 x 594 mm with its grid and both rulers',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-08-06',
    changes: [
      'Side panel (section 06): rewritten as a Tweakpane 4 spec — the hand-drawn panels were never Tweakpane, which is what every app actually ships. Adds a prominent "do not hand-build this" callout, a faithful replica of a skinned pane, a widget anatomy table mapped to the --tp-* variables, placement rules, and the full skin block to copy',
      'Nav bar (section 07): replaced the old Bottom Dock with the glass nav bar as actually shipped — 40px items, popover menus with kbd shortcuts, separator, status readout — plus a full spec list',
      'Logs (section 10): the log is now an event, not a surface — silent by default, a transient toast above the nav bar, and an on-demand history in a nav bar popover, with repeat collapsing, dwell rules and an unread dot',
      'Tab bar (section 11): added the white pill page switcher — demo, spec and states. Active is an --tg-orange-soft fill with an --tg-orange label; focus is a 3px orange halo, never the browser default',
      'Section 11 renamed to "Tab bar & app header"; the docked app header is kept for windowed tools',
      'Console is now bright — white surface, hairline border, orange $ prompt — instead of the black block',
      'Scoped the console to streamed output from external processes (vpype, plotter drivers)',
      'Added a contents rail with scroll-spy, built from the sections at runtime',
      'Added glass tokens: --tg-glass, --tg-glass-border, --tg-glass-hover, --tg-shadow-float, --tg-shadow-pop',
      'Everything else in the document is unchanged',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-05-01',
    changes: [
      'New design system created with Claude design (targz Design System.html)',
      'Remove previous design-system.html (no longer relevant)',
    ],
  },
];
