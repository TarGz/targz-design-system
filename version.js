export const version = '1.4.1';

export const CHANGELOG = [
  {
    version: '1.4.1',
    date: '2026-08-15',
    changes: [
      'Physical UI exploration: the pressed switch rebuilt. It declares no fill of its own — it inherits the raised cap\'s, so up and down cannot drift apart, and the recess is drawn entirely by inset walls. Every earlier attempt at a separate pressed colour was drawing shade with paint, and a darker cap has nothing left for a shadow to take away',
      'Raised the cap into real grey. Shadow is a difference, and a near-black face left the recess nowhere to fall — the change that makes the pressed state read is a change to the unpressed one',
      'Shadow on all four walls, not just the top: a hole has sides, and at 24px the sides are most of what you see of it',
      'Sharpened it — blur radii 6-12px down to 1-4px. A wall two pixels from the face cannot throw a shade that has softened over that distance; 12px of blur at full black is a cap sitting in fog',
      'Travel down to 1px. Two was a third of the row gap, enough that toggling looked like the row twitched',
      'The legend scales to 0.9 when the cap is down — a face further from the eye subtends a smaller angle. Too small to notice as a change, which is the point',
      'One legend per switch: the plain drawing at normal weight, never struck through or greyed. The cap position already says on or off, and a slashed grey icon reads as disabled',
      'MIXED is now the pressed state with a WHITE legend, not an intermediate height. A master whose column is half on is not half-pressed — the thing it commands is engaged, just not everywhere. Down means it is happening; the colour says how completely, and white against orange is a brightness difference that survives with no colour vision',
      'Brightened the bay, the stroke strip and the row faces to match. A recess is the case seen deeper, not a hole into space — darker than the surface, not black, with the inset shadow doing the work',
      'Rotary selector: removed the detent tick marks entirely. The tip already says where the switch is, and a second mark a few pixels away is another thing to read at the moment you are reading the tip',
      'Knobs and the selector now turn clockwise on a downward drag, and the wheel follows; arrow keys stay conventional so the ARIA slider contract holds',
    ],
  },
  {
    version: '1.4.0',
    date: '2026-08-15',
    changes: [
      'New document explorations/physical-ui-layers.html — a "what if the language were hardware" study. It is an EXPLORATION, not part of the system: index.html is untouched and none of these tokens exist there',
      'Six shipping components redrawn in the skeuomorphic register, each with its real anatomy: the Portrait-Typo layer dock (lifted control-for-control from its ui.js), the nav bar, the page switcher, the layer editor, the viewport and a Launchpad project card',
      'Buttons are objects with a body: a skirt, a cast shadow and real travel. Momentary keys spring back and pulse once; latching keys hold the same position a finger would, which is the distinction flat UI has no way to make',
      'Latched, pressed and open all share one recipe — the cap keeps its own colour, the gradient inverts, a hard black inset runs along the top and a hairline of light along the bottom, and only the legend lights. Three-state switches sit at three physical heights (up / half / down), so the state reads in greyscale',
      'One legend per switch: the plain drawing at normal weight, never struck through or dimmed, since the cap position already says on or off and a slashed grey icon reads as disabled',
      'Sliders that set a quantity became knobs — 270° of travel, an SVG-stroked value arc (a conic gradient behind a CSS mask aliases on three edges), a pointer, drag/wheel/keys, and a bipolar mode that grows from 12 o\'clock. Drag down turns clockwise',
      'Zone from / Zone to became ONE range fader, because the value is one length: cut slot, engraved scale, two waisted caps that cannot cross, a hatched band between them',
      'The Place-from dropdown became a rotary selector: a pale teardrop lever, positions fanned into 76° with their names as a vertical list, leader lines absorbing the angle mismatch',
      'The editor panel bulges around that selector — rounded rectangle unioned with a lobe and joined by tangent fillets, as one clip-path on one element, so the fill cannot seam. Its drop shadow is a filter on a wrapper, because a box-shadow is cast by the border-box and would cut the bulge in half',
      'Glow is spent only on things that emit: light pipes, LED readouts and the big illuminated action keys',
      'Closes with the bill — what the language buys, and what it costs (dark-only, paint cost per row, small type against grain, and that it out-shouts the drawing)',
    ],
  },
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
