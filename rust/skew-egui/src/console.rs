//! The launcher console's parts — `docs/skew-panels.html` § 06 Launchpad, in
//! the light skin.
//!
//! * [`act`] — `.act` / `.chip`: a key with a legend made of [`Part`]s (a lamp,
//!   a glyph, a word, a count). [`ActStyle::Go`] is the lit orange cap,
//!   [`ActStyle::Aux`] the plain `--card` cap, [`ActStyle::Down`] a chip held
//!   down in its well. Built on [`crate::paint_key`] / [`crate::paint_pkey_down`].
//! * [`split_act`] — the running module's STOP with a restart segment welded on.
//! * [`sel`] / [`paint_sel`] — `.selwrap .sel`: the selector's face, a milled
//!   `--paper` well with the value in it and a chevron lying on its side —
//!   NOT the orange cap the bare `.sel` rule paints, which nothing builds.
//!   [`sel_list`] is the open plate, live; [`paint_sel_list`] poses it.
//! * [`slot_field`] — `.slot`: the milled field the filter is typed into.
//! * [`paint_stamp`] — `.stamp`: a printed plate. The card's folder and tags.
//! * [`con_say`] — `.con-say`: the sentence in the armed delete row.
//! * [`empty_rack`] — `.empty`: the rack with nothing in it, with or without a
//!   way out of the filter that emptied it.
//! * [`port_strip`] — the localhost well, lit or dead.
//! * [`pull_line`] — git pull reporting: running with a trace, done, or failed
//!   with RETRY / terminal / dismiss. A failure stays until it is answered.
//! * [`version_readout`] — the version you press to check for updates.
//! * [`module_card`] — one project: head with its stamps, the address, the run
//!   key and the five tools, the pull line and the folder drawer, on the
//!   `--paper` + `--surround` panel. No description and no NODE stamp: both
//!   went when the rack became one list.
//!
//! Every colour is a token or a value lifted from `src/skew.css`; no green —
//! running is the orange lamp, as the rack in the CSS has it.

use crate::icon::{paint_icon, paint_icon_solid, Icon};
use crate::key::{clicky, paint_key, paint_pkey_down, paint_pkey_held, KeyState, KeyStyle};
use crate::machine::paint_lcd_ink;
use crate::paint::{hex, mix};
use crate::theme::{read_font, Theme};
use egui::text::{LayoutJob, TextFormat};
use egui::{pos2, vec2, Align, Color32, FontId, Layout, Pos2, Rect, Rounding, Sense, Stroke, Ui};

// ── lamps ───────────────────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Lens {
    /// `:is(.act.halt, .act.stop) .lens` — red.
    Stop,
    /// `.act.fire .lens` — the orange lamp, and the running pilot.
    Lit,
    /// `[data-skin=light] .act.start .lens` — off.
    Unlit,
}

/// A lamp of diameter `d` centred on `c`. The CSS radial gradient
/// (`#fff → mid 40% → edge`) is three stacked discs and a glow.
pub fn paint_lens(p: &egui::Painter, th: &Theme, c: Pos2, d: f32, lens: Lens) {
    let r = d / 2.0;
    let (edge, mid, glow) = match lens {
        // no halo: on an orange cap a red glow is a smudge, so the lamp is
        // seated by its rim instead (inset 0 -1px 1px rgba(0,0,0,.4))
        Lens::Stop => (hex(0xC21B1B), hex(0xFF9B9B), None),
        Lens::Lit => (hex(0xE05A00), hex(0xFFC08A), Some(Color32::from_rgba_unmultiplied(255, 106, 0, 60))),
        Lens::Unlit => {
            p.circle_filled(c, r, th.edge_ctl);
            p.circle_stroke(c + vec2(0.0, 0.3), r - 0.6, Stroke::new(0.8, Color32::from_rgba_unmultiplied(0, 0, 0, 30)));
            return;
        }
    };
    // FLAT: one fill a third of the way from the rim colour to the lit one,
    // and a small soft highlight — a lamp seen under a lens, not a glass bead
    if let Some(g) = glow {
        p.circle_filled(c, r + 1.2, g.gamma_multiply(0.6));
    }
    p.circle_filled(c, r, crate::paint::mix(edge, mid, 0.3));
    p.circle_filled(c + vec2(-0.3 * r, -0.35 * r), r * 0.3, Color32::from_rgba_unmultiplied(255, 255, 255, 70));
    if lens == Lens::Stop {
        p.circle_stroke(c, r - 0.4, Stroke::new(0.8, Color32::from_rgba_unmultiplied(0, 0, 0, 90)));
    }
}

// ── the act key ─────────────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Part<'a> {
    Lens(Lens),
    Icon(Icon),
    Text(&'a str),
    /// `.chip .ct` — a count in its own small well.
    Count(usize),
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ActStyle {
    /// `[data-skin=light] .act.go` — `--primary-deep` on a `--primary-ink` wall.
    Go,
    /// `.act.aux` / `.chip` — the plain `--card` cap.
    Aux,
    /// `.chip.is-down` — held down in a `--paper` well, the legend in orange,
    /// and it TRAVELS: three pixels of y that say the key went in. Right in a
    /// bank of keys, where the step between the faces is the reading.
    Down,
    /// The same key held, WITHOUT the travel — `.con-top .key.skirt.is-down`.
    /// A toolbar is one row of boxes cut to one height, and a latched key that
    /// drops out of that row reads as broken rather than as engaged.
    Held,
    /// `[data-skin=light] .act.halt` — the red cap. `--no-ink` on a wall of
    /// its own colour, which is what the two rules at `skew.css:7839` and
    /// `:9280` compute to between them: the second moves the cap onto the ink
    /// and leaves the wall where the first put it.
    ///
    /// IT IS THE ONLY RED CAP IN THE APP and it is spent on one key: DELETE,
    /// in the armed folder row. A second red key would make the first one a
    /// colour rather than a warning.
    Halt,
}

const WALL: f32 = 3.0;

fn word(p: &egui::Painter, t: &str, size: f32, track: f32, col: Color32) -> std::sync::Arc<egui::Galley> {
    let mut job = LayoutJob::default();
    job.append(t, 0.0, TextFormat {
        font_id: FontId::monospace(size),
        color: col,
        extra_letter_spacing: size * track,
        ..Default::default()
    });
    p.layout_job(job)
}

fn part_w(p: &egui::Painter, part: &Part, text: f32, icon: f32) -> f32 {
    match part {
        Part::Lens(_) => 8.0,
        Part::Icon(_) => icon,
        Part::Text(t) => word(p, t, text, 0.08, Color32::WHITE).rect.width(),
        Part::Count(n) => word(p, &n.to_string(), text - 1.0, 0.0, Color32::WHITE).rect.width() + 10.0,
    }
}

/// The width a legend needs: its parts and their gaps.
fn legend_w(p: &egui::Painter, parts: &[Part], text: f32, icon: f32, gap: f32) -> f32 {
    let w: f32 = parts.iter().map(|q| part_w(p, q, text, icon)).sum();
    w + gap * parts.len().saturating_sub(1) as f32
}

/// Paint a key with a legend into `rect` (cap height + the 3px wall).
pub fn paint_act(p: &egui::Painter, th: &Theme, rect: Rect, parts: &[Part], style: ActStyle, state: KeyState, text: f32) {
    let icon = if parts.len() == 1 { 14.0 } else { 12.0 };
    let gap = 8.0;
    let ink = match style {
        ActStyle::Go => Color32::WHITE,
        ActStyle::Aux => if state == KeyState::Disabled { th.ink_2 } else { th.ink },
        ActStyle::Down | ActStyle::Held => th.primary_deep,
        ActStyle::Halt => Color32::WHITE,
    };
    let mut down = false;
    match style {
        ActStyle::Go => paint_key(p, th, rect, "", &KeyStyle::new(th.primary, Color32::WHITE), state),
        ActStyle::Aux => paint_key(p, th, rect, "", &KeyStyle::new(th.card, th.ink), state),
        ActStyle::Down => {
            paint_pkey_down(p, th, rect, "", 11.0);
            down = true;
        }
        // held, not pressed: the legend stays on the line with its neighbours'
        ActStyle::Held => paint_pkey_held(p, th, rect, "", 11.0),
        ActStyle::Halt => paint_key(p, th, rect, "", &KeyStyle::new(th.no_ink, Color32::WHITE), state),
    }
    down |= state == KeyState::Pressed;
    let wall = (rect.height() * 0.09).clamp(2.0, 3.0);
    let cy = rect.center().y - wall / 2.0 + if down { wall } else { 0.0 };
    let total = legend_w(p, parts, text, icon, gap);
    let mut x = rect.center().x - total / 2.0;
    for part in parts {
        let w = part_w(p, part, text, icon);
        let c = pos2(x + w / 2.0, cy);
        match part {
            Part::Lens(l) => paint_lens(p, th, c, 8.0, *l),
            Part::Icon(i @ (Icon::Play | Icon::Stop)) => paint_icon_solid(p, *i, c, 11.0, ink, None),
            Part::Icon(i) => paint_icon(p, *i, c, icon, 1.8, ink, 0.0),
            Part::Text(t) => {
                let g = word(p, t, text, 0.08, ink);
                p.galley(pos2(x, cy - g.rect.height() / 2.0), g, ink);
            }
            Part::Count(n) => {
                let col = if matches!(style, ActStyle::Down | ActStyle::Held) { th.pal.primary_ink.unwrap_or(th.primary_deep) } else { th.ink_2 };
                let g = word(p, &n.to_string(), text - 1.0, 0.0, col);
                let b = Rect::from_center_size(c, vec2(w, g.rect.height() + 2.0));
                p.rect_filled(b, Rounding::same(3.0), th.paper);
                p.rect_stroke(b.shrink(0.5), Rounding::same(2.5), Stroke::new(1.0, th.edge_ctl));
                p.galley(pos2(b.center().x - g.rect.width() / 2.0, b.center().y - g.rect.height() / 2.0), g, col);
            }
        }
        x += w + gap;
    }
}

fn state_of(resp: &egui::Response, enabled: bool) -> KeyState {
    if !enabled {
        KeyState::Disabled
    } else if resp.is_pointer_button_down_on() {
        KeyState::Pressed
    } else if resp.hovered() {
        KeyState::Hover
    } else {
        KeyState::Raised
    }
}

/// An `.act` key. `cap_h` is the cap's height (32 for an act, 28 for a chip,
/// 22 inside a pull line); a single-icon legend makes it square. Sounds like
/// the kit's `key`: press down, release up.
pub fn act(ui: &mut Ui, th: &Theme, parts: &[Part], style: ActStyle, cap_h: f32, enabled: bool) -> egui::Response {
    let text = if cap_h < 26.0 { 9.0 } else { 10.5 };
    let w = if parts.len() == 1 && matches!(parts[0], Part::Icon(_)) {
        cap_h
    } else {
        let pad = if matches!(style, ActStyle::Go | ActStyle::Halt) { 13.0 } else { 11.0 };
        legend_w(ui.painter(), parts, text, 12.0, 8.0) + 2.0 * pad
    };
    let sense = if enabled { Sense::click() } else { Sense::hover() };
    let (rect, resp) = ui.allocate_exact_size(vec2(w, cap_h + WALL), sense);
    let resp = if enabled { resp.on_hover_cursor(egui::CursorIcon::PointingHand) } else { resp };
    if enabled {
        clicky(ui, &resp);
    }
    if ui.is_rect_visible(rect) {
        paint_act(ui.painter(), th, rect, parts, style, state_of(&resp, enabled), text);
    }
    resp
}

/// The running module's key: STOP and a restart segment, one lit cap with a
/// seam. Returns `(stop, restart)`.
pub fn split_act(ui: &mut Ui, th: &Theme, left: &[Part], right: Icon) -> (egui::Response, egui::Response) {
    let text = 10.5;
    let lw = legend_w(ui.painter(), left, text, 12.0, 8.0) + 26.0;
    let rw = 32.0;
    let (rect, _) = ui.allocate_exact_size(vec2(lw + rw, 32.0 + WALL), Sense::hover());
    let lr = Rect::from_min_size(rect.min, vec2(lw, rect.height()));
    let rr = Rect::from_min_size(rect.min + vec2(lw, 0.0), vec2(rw, rect.height()));
    let l = ui.interact(lr, ui.id().with(("split-l", rect.min.x as i32, rect.min.y as i32)), Sense::click())
        .on_hover_cursor(egui::CursorIcon::PointingHand);
    let r = ui.interact(rr, ui.id().with(("split-r", rect.min.x as i32, rect.min.y as i32)), Sense::click())
        .on_hover_cursor(egui::CursorIcon::PointingHand);
    clicky(ui, &l);
    clicky(ui, &r);
    if ui.is_rect_visible(rect) {
        let p = ui.painter();
        let st = if l.is_pointer_button_down_on() || r.is_pointer_button_down_on() {
            KeyState::Pressed
        } else if l.hovered() || r.hovered() {
            KeyState::Hover
        } else {
            KeyState::Raised
        };
        paint_key(p, th, rect, "", &KeyStyle::new(th.primary, Color32::WHITE), st);
        let drop = if st == KeyState::Pressed { WALL } else { 0.0 };
        let cy = rect.center().y - WALL / 2.0 + drop;
        // the seam: border-left 1px rgba(255,255,255,.35)
        p.line_segment(
            [pos2(rr.left() + 0.5, rect.top() + drop + 1.0), pos2(rr.left() + 0.5, rect.bottom() - WALL + drop - 1.0)],
            Stroke::new(1.0, Color32::from_rgba_unmultiplied(255, 255, 255, 89)),
        );
        let total = legend_w(p, left, text, 12.0, 8.0);
        let mut x = lr.center().x - total / 2.0;
        for part in left {
            let w = part_w(p, part, text, 12.0);
            let c = pos2(x + w / 2.0, cy);
            match part {
                Part::Lens(lz) => paint_lens(p, th, c, 8.0, *lz),
                // the one effect on the key: the stop glyph's own soft light
                Part::Icon(i @ (Icon::Play | Icon::Stop)) => paint_icon_solid(p, *i, c, 11.0, Color32::WHITE, Some(Color32::WHITE)),
                Part::Icon(i) => paint_icon(p, *i, c, 12.0, 1.8, Color32::WHITE, 0.0),
                Part::Text(t) => {
                    let g = word(p, t, text, 0.08, Color32::WHITE);
                    p.galley(pos2(x, cy - g.rect.height() / 2.0), g, Color32::WHITE);
                }
                Part::Count(_) => {}
            }
            x += w + 8.0;
        }
        paint_icon(p, right, pos2(rr.center().x, cy), 14.0, 1.8, Color32::WHITE, 0.0);
    }
    (l, r)
}

// ── wells ───────────────────────────────────────────────────────────────────

/// A `--paper` well with the inset `--edge` ring and the near wall's shadow —
/// the localhost strip, the search slot, the pull line.
pub fn paint_well(p: &egui::Painter, rect: Rect, fill: Color32, ring: Color32) {
    let r = Rounding::same(6.0);
    p.rect_filled(rect, r, fill);
    p.line_segment(
        [pos2(rect.left() + 5.0, rect.top() + 1.2), pos2(rect.right() - 5.0, rect.top() + 1.2)],
        Stroke::new(1.5, Color32::from_rgba_unmultiplied(0, 0, 0, 22)),
    );
    p.rect_stroke(rect.shrink(0.5), Rounding::same(5.5), Stroke::new(1.0, ring));
}

/// `.port` / `.port.off` — the project's address, the width of the card.
///
/// IT IS DRAWN WHETHER OR NOT THE PROJECT IS RUNNING, and that is the whole
/// of this part's argument: the port is the thing you came to the rack to
/// read, and a launcher that prints it only for what is already up is
/// answering the one case where you could have read it off the browser's
/// address bar. Running, it is a door you press. Stopped, it is the door's
/// number — the same milled slot with the lamp taken out of it.
///
/// `port == 0` IS NOT A ZERO. The launcher assigns a port at launch for a
/// project that never declared one, so the strip says so in words. Printing
/// `localhost:0` would be printing an address that does not exist.
///
/// THE ADDRESS DOES NOT MOVE WHEN THE PROJECT STOPS. OPEN is what is pushed
/// to the far end; with OPEN gone the address stays on the same left edge, so
/// a column of cards reads down one line instead of shuffling as things start.
pub fn port_strip(ui: &mut Ui, th: &Theme, port: u16, live: bool) -> egui::Response {
    let sense = if live { Sense::click() } else { Sense::hover() };
    let (rect, resp) = ui.allocate_exact_size(vec2(ui.available_width(), 30.0), sense);
    let resp = if live {
        resp.on_hover_cursor(egui::CursorIcon::PointingHand).on_hover_text("Open in browser")
    } else {
        resp
    };
    if ui.is_rect_visible(rect) {
        let p = ui.painter();
        // A LIVE STRIP IS A LIT HOLE; A DEAD ONE IS THE SAME HOLE, UNLIT. The
        // blanket that flattens every cut in this skin sends `.port` to plain
        // `--paper` with `--ink` on it, which is right for a hole and wrong
        // for the one row on a card that reports a RUNNING SERVER: it came out
        // drawn exactly like the row that reports a dead address.
        if live {
            paint_port_hole(p, th, rect, resp.hovered());
        } else {
            paint_well(p, rect, th.paper, th.edge);
        }
        let cy = rect.center().y;
        // THE LIT LEGEND IS ORANGE INK, NOT NAVY UNDER AN ORANGE HALO. That is
        // the system's own rule for a thing that is ON — `--primary-deep` under
        // a 7px `--primary` shadow — and the brighter value is what makes it
        // read as LIT rather than as merely coloured. A warm halo stacked
        // behind cold ink instead just fills the gaps between the letters,
        // which is a highlighter pen and not a lamp.
        // THE LIT INK IS THE SKIN'S OWN LAMP. The dark strip has been a blue
        // well since it was written — `--run-lit` on `--run-fill`, the colour
        // of a thing that is RUNNING — and the warm value belongs to the light
        // skin, where the accent is what marks a live control. Painting the
        // light skin's orange into the dark well would be a second lamp in a
        // room that already has one.
        let ink = if live {
            match th.skin {
                crate::Skin::Light => th.primary_deep,
                crate::Skin::Dark => th.pal.run_lit,
            }
        } else {
            th.ink_2
        };
        paint_icon(p, Icon::Ext, pos2(rect.left() + 16.0, cy), 12.0, 1.8, ink, 0.0);
        let txt = if port > 0 { format!("localhost:{port}") } else { "PORT ASSIGNED ON LAUNCH".into() };
        let at = pos2(rect.left() + 30.0, cy - word(p, &txt, 11.0, 0.04, ink).rect.height() / 2.0);
        // `text-shadow:0 0 7px color-mix(--primary 70%, transparent)` as eight
        // offsets of ONE ring, which is what a painter with no blur has. Eight
        // compounding passes reach 70% at 36 each.
        // THE HALO IS THE DARK SKIN'S AND ONLY THE DARK SKIN'S. `text-shadow:
        // 0 0 7px` is a BLUR — the lamp fades to nothing over seven pixels and
        // never sits anywhere at a readable strength. Eight hard copies of the
        // word is what a painter has instead, and that works over near-black,
        // where every copy only ever adds light; over cream it does not,
        // because the blend walks the hue up as the coverage drops and eight
        // passes of an orange come out an ochre ring with an edge. So the
        // light skin carries its lit reading in the ink and the warm floor,
        // which were always doing the work, and the dark skin keeps its glow.
        if live && th.skin == crate::Skin::Dark {
            let halo = Color32::from_rgba_unmultiplied(
                th.pal.run_lit.r(), th.pal.run_lit.g(), th.pal.run_lit.b(), 36);
            for k in 0..8 {
                let t = k as f32 * std::f32::consts::FRAC_PI_4;
                let g = word(p, &txt, 11.0, 0.04, halo);
                p.galley(at + vec2(1.6 * t.cos(), 1.6 * t.sin()), g, halo);
            }
        }
        let g = word(p, &txt, 11.0, 0.04, ink);
        p.galley(at, g, ink);
        // AND OPEN IS LIT BY THE SAME LAMP, AT THE SAME VALUE. Its own rule
        // gives it a dimmer ink and takes the shadow off — written for the dark
        // strip, where OPEN is a quieter step of `--run-lit`. Here that left a
        // cold grey word inside a warm hole: the one part of the strip the
        // light does not reach. It is the strip's colour and the strip's glow,
        // exactly; it stays the smaller, wider-tracked word, and that is what
        // makes it a label.
        // OPEN: LIT BY THE SAME LAMP IN THE LIGHT SKIN, A QUIETER STEP OF IT IN
        // THE DARK. `.port span:last-child` is `color-mix(--run-lit 55%, #0b0b0d)`
        // with the shadow off — written for the dark well, where OPEN is a
        // label beside a glowing address. In the light skin that left a cold
        // grey word inside a warm hole: the one part of the strip the light
        // does not reach. It stays the smaller, wider-tracked word either way,
        // and that is what makes it a label.
        if live {
            let col = match th.skin {
                crate::Skin::Light => ink,
                crate::Skin::Dark => mix(hex(0x0B0B0D), th.pal.run_lit, 0.55),
            };
            let g = word(p, "OPEN", 9.0, 0.1, col);
            let at = pos2(rect.right() - 10.0 - g.rect.width(), cy - g.rect.height() / 2.0);
            p.galley(at, g, col);
        }
    }
    resp
}

/// A LIVE PORT IS A HOLE WITH A LAMP IN IT, NOT A WARM PLATE ON THE CARD.
///
/// The first attempt put the accent in the floor and again in a ring, and the
/// ring is the giveaway: an outline is what a RAISED part has, so a strip
/// wearing one reads as a plate stuck on the card rather than a slot cut into
/// it. A hole has three things and none of them is an outline — the panel's
/// overhang casting down into it, a hairline on the inside of the cut, and its
/// far wall catching the light. Those are `.gate-slot`'s, the light skin's own
/// deep cut, taken as they are.
///
/// THE ONLY THING ADDED IS THE LAMP, AND IT IS INSIDE: a bloom on the inner
/// face, and a floor warming 3% to 9% toward the bottom where the light would
/// pool. What tells you the server is up is the address glowing out of the
/// hole — not the hole being orange.
fn paint_port_hole(p: &egui::Painter, th: &Theme, rect: Rect, hover: bool) {
    let dark = th.skin == crate::Skin::Dark;

    // THE LAMP IS THE SKIN'S OWN, AND IN THE LIGHT SKIN IT IS `--primary-deep`
    // AND NOT `--primary`. 255,106,0 is orange at full strength and YELLOW
    // laid thin over cream — every low-alpha pass walks the hue up, so a bloom
    // built out of it ends a yellow smear. The deep value stays orange all the
    // way down to nothing, which is the only thing a glow is made of. The dark
    // well's lamp is `--run`, the blue it has always been.
    let acc = if dark { th.pal.run } else { th.primary_deep };
    let warm = |a: f32| Color32::from_rgba_unmultiplied(
        acc.r(), acc.g(), acc.b(), a.clamp(0.0, 255.0) as u8);

    // THE FLOOR IS THE ROOM WITH THE LAMP MIXED INTO IT, which is what `.port`
    // says in both skins — `color-mix(--run-fill 7%, #06080b)` to `11%,
    // #0c0e12` in the dark, and the same two steps of the accent into `--paper`
    // in the light. Brighter at the bottom either way, because that is where
    // light inside a slot pools.
    let (floor_a, floor_b) = if dark {
        (mix(hex(0x06080B), th.pal.run_fill, 0.07), mix(hex(0x0C0E12), th.pal.run_fill, 0.11))
    } else {
        (mix(th.paper, acc, 0.03), mix(th.paper, acc, 0.09))
    };
    p.rect_filled(rect, Rounding::same(6.0), floor_b);
    crate::paint::vgrad(p, rect.shrink(1.0), 5.0, floor_a, floor_b);

    // `inset 0 0 14px` — AND A 14px BLUR INSIDE A 30px BOX IS NOT A RING, IT
    // IS THE WHOLE BOX. Four strokes walking inward from the edge was the
    // wrong translation: at 2.8px each they reached the centre line, stacked
    // to about a quarter of the accent across the entire strip, and painted
    // the peach plate this is supposed to be the opposite of. A painter has no
    // blur, so what is left of that shadow is ONE pass just inside the cut —
    // the inner face catching the lamp, which is all of it you would see.
    // the dark well is lit harder — `rgba(26,121,220,.12)` over near-black
    // reads as a sheen, the same value over cream reads as paint
    let lamp = match (dark, hover) {
        (true, true) => 34.0,
        (true, false) => 20.0,
        (false, true) => 22.0,
        (false, false) => 13.0,
    };
    p.rect_stroke(rect.shrink(1.5), Rounding::same(4.5), Stroke::new(2.0, warm(lamp)));

    // A SHADOW IN A ROUNDED HOLE TURNS THE CORNER WITH IT. These were straight
    // segments stopped 6px short of each end, so the lit top edge and the far
    // wall both ended in mid-air next to the curve — the one detail that makes
    // a drawn object look printed rather than made. An inset shadow has no
    // ends: it runs the whole way round and you only SEE the part the light
    // reaches. So each is a rounded stroke on the hole's own curve, clipped to
    // the band it belongs to, and it follows the corner because it is the
    // corner.
    let band = |y0: f32, y1: f32| p.with_clip_rect(Rect::from_min_max(
        pos2(rect.left() - 2.0, y0), pos2(rect.right() + 2.0, y1)));

    // `inset 0 2px 4px rgba(0,0,0,.16)` — the panel's overhang cast down into
    // the cut. THIS IS THE ONE THING THAT SAYS SUNK, so it goes over the lamp
    // and not under it.
    // `inset 0 2px 5px rgba(0,0,0,.9)` in the dark, `0 2px 4px rgba(0,0,0,.16)`
    // in the light: the same cast, at the depth each room can carry.
    let top = band(rect.top() - 2.0, rect.top() + 6.0);
    let cast: &[(f32, u8)] = if dark {
        &[(1.2, 150), (2.4, 95), (3.8, 45)]
    } else {
        &[(1.2, 26), (2.4, 15), (3.8, 7)]
    };
    for &(k, a) in cast {
        top.rect_stroke(
            rect.shrink(k), Rounding::same((6.0 - k).max(0.5)),
            Stroke::new(1.3, Color32::from_rgba_unmultiplied(0, 0, 0, a)),
        );
    }

    // `inset 0 0 0 1px var(--edge-ctl)` — the hairline is on the INSIDE of the
    // cut, and it is neutral: a warm one would read as an outline again. THE
    // DARK WELL HAS NONE: its floor is five steps below the card and the cast
    // shadow is almost opaque, so the cut is already unmistakable, and a ring
    // round it would be a drawn line where there is a real edge.
    if !dark {
        p.rect_stroke(rect.shrink(0.5), Rounding::same(5.5), Stroke::new(1.0, th.edge_ctl));
    }

    // `inset 0 -1px 0 rgba(255,255,255,.75)` — the far wall of the hole, and
    // ONLY that. The lip below it, `0 1px 0 rgba(255,255,255,.9)`, is the same
    // shape offset down a pixel: in CSS the two are one line thick apart and
    // read as one edge, but drawn as two rounded strokes their corners do not
    // share a centre, so the arcs diverge and each bottom corner got a little
    // white fork in it. One pixel of extra relief is not worth a seam in the
    // one place the eye is already looking for the shape.
    // `inset 0 -1px 0 rgba(255,255,255,.75)` in the light, `.05` in the dark —
    // the far wall catches as much light as the room has to give it.
    let bot = band(rect.bottom() - 5.0, rect.bottom() + 1.0);
    bot.rect_stroke(
        rect.shrink(1.2), Rounding::same(4.8),
        Stroke::new(1.0, Color32::from_rgba_unmultiplied(255, 255, 255, if dark { 13 } else { 191 })),
    );
}

// ── the strip's own parts ───────────────────────────────────────────────────

/// `.stamp` — a printed plate: `--ink-2` on `--paper` inside a hairline.
///
/// EACH MARK IS ITS OWN PLATE. A stamped plate reads as a separate fact, and
/// two facts sharing one plate read as one string — which is why the folder
/// and the tags are three little plates on the card's head and not a comma
/// list. Returns the width it took, so a row of them can be laid right to left.
pub fn paint_stamp(p: &egui::Painter, th: &Theme, right: Pos2, txt: &str) -> f32 {
    let g = word(p, txt, 8.5, 0.14, th.ink_2);
    let w = g.rect.width() + 10.0;
    let b = Rect::from_min_size(
        pos2(right.x - w, right.y - g.rect.height() / 2.0 - 2.0),
        vec2(w, g.rect.height() + 4.0),
    );
    p.rect_filled(b, Rounding::same(3.0), th.paper);
    p.rect_stroke(b.shrink(0.5), Rounding::same(2.5), Stroke::new(1.0, th.edge_ctl));
    p.galley(pos2(b.left() + 5.0, b.top() + 2.0), g, th.ink_2);
    w
}

/// `.selwrap .sel` — the selector's FACE: a milled well with a reading in it.
///
/// IT IS NOT AN ORANGE CAP. `src/skew.css` carries two light rules for `.sel`
/// and only one of them is ever reached: the bare `[data-skin=light] .sel` at
/// `:7854` paints a `--primary-deep` cap, and `.selwrap .sel` at `:9712`
/// paints this well — and since `selector()` in the kit ALWAYS builds its face
/// inside a `.selwrap`, every selector in the system is this one. The orange
/// rule is for a hand-written `.sel` that nothing builds.
///
/// AND THE REASON IS WORTH KEEPING. A cap is a thing you PRESS to make
/// something happen; a selector is a thing that SHOWS you a value and takes a
/// new one. Painting it in the app's one accent makes the quietest control on
/// the strip the loudest thing in the window — and on the launcher it would
/// outshout LAUNCH, which is the only key on the page you came to press.
///
/// SO: `--paper` with a `--edge-ctl` hairline and a soft top shade, the value
/// in `--ink` at NORMAL weight, the chevron in `--ink-2`. Hover darkens the
/// ring. Open turns the ring and the chevron `--primary-ink` — the accent
/// marks the one that is live, which is all the accent is for here.
///
/// NO WALL AND NO TRAVEL. `border:0` and `transform:none`: it is a box of its
/// stated height, exactly like the `.slot` beside it, which is what lets the
/// strip be one line.
///
/// THE CHEVRON LIES DOWN AND STAYS DOWN. It points at where the plate will
/// appear, under the face, and it does NOT turn when the list opens: a
/// chevron that turns is saying "this closes", and what closes the plate is
/// Escape or a press anywhere else. It is a signpost, not a toggle.
pub fn paint_sel(p: &egui::Painter, th: &Theme, rect: Rect, value: &str, state: KeyState) {
    let open = state == KeyState::Pressed;
    let r = Rounding::same(th.r_key);
    p.rect_filled(rect, r, th.paper);
    // inset 0 1px 2px rgba(0,0,0,.10) — the shade a milled edge throws inward
    p.line_segment(
        [pos2(rect.left() + 5.0, rect.top() + 1.2), pos2(rect.right() - 5.0, rect.top() + 1.2)],
        Stroke::new(1.5, Color32::from_rgba_unmultiplied(0, 0, 0, 26)),
    );
    let ring = if open {
        th.pal.primary_ink.unwrap_or(th.primary_deep)
    } else if state == KeyState::Hover {
        hex(0xC4BDB2) // `.selwrap .sel:hover` — one step darker than --edge-ctl
    } else {
        th.edge_ctl
    };
    p.rect_stroke(rect.shrink(0.5), Rounding::same(th.r_key - 0.5), Stroke::new(1.0, ring));
    let g = word(p, value, 9.5, 0.1, th.ink);
    let cy = rect.center().y;
    p.galley(pos2(rect.left() + 11.0, cy - g.rect.height() / 2.0), g, th.ink);
    let chev = if open {
        th.pal.primary_ink.unwrap_or(th.primary_deep)
    } else if state == KeyState::Hover {
        th.ink
    } else {
        th.ink_2
    };
    paint_icon(p, Icon::Chev, pos2(rect.right() - 14.0, cy), 12.0, 2.0, chev, 90.0);
}

/// The live face. `h` is the whole box — 32 on the launcher's strip, where
/// `.con-top :is(.sel, .slot, .lcd)` puts every box in the row on one height,
/// and 28 in a settings column. A press is the host's cue to open the list.
pub fn sel(ui: &mut Ui, th: &Theme, value: &str, w: f32, h: f32, open: bool) -> egui::Response {
    let (rect, resp) = ui.allocate_exact_size(vec2(w, h), Sense::click());
    let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
    clicky(ui, &resp);
    if ui.is_rect_visible(rect) {
        let st = if open || resp.is_pointer_button_down_on() {
            KeyState::Pressed
        } else if resp.hovered() {
            KeyState::Hover
        } else {
            KeyState::Raised
        };
        paint_sel(ui.painter(), th, rect, value, st);
    }
    resp
}

/// `.sellist` — the open plate, POSED. A white popover under the face: one
/// 26px row per value, then a cut, then the commands.
///
/// TWO MARKS, FOR TWO DIFFERENT THINGS. A menu has one mark because its rows
/// are commands and the only state a row can be in is "the pointer is on it".
/// A VALUE list has a row that is already true before you touch anything, so
/// the current row is lit in `--primary-ink` and carries a filled tick while
/// the rest are `--ink-2` with a dead one. Tell those two apart and you can
/// see what you HAVE against what you are ABOUT TO GET, which is the question
/// you opened the list to answer.
///
/// THE COMMANDS SIT UNDER A CUT, with no tick. NEW FOLDER is not a value, and
/// a row that looks like a value but acts like a verb is the one row in a list
/// you can press by accident.
///
/// IT IS A PAINTER AND NOT A POPUP. A live plate is an overlay with its own
/// hit testing and its own dismissal, which belongs to the host's event loop
/// and not to a part — so this draws the view and the app drives it.
pub fn paint_sel_list(
    p: &egui::Painter, th: &Theme, at: Pos2, w: f32, values: &[&str], cur: usize, cmds: &[&str],
    hover: Option<usize>,
) {
    let row = SEL_ROW;
    let pad = SEL_PAD;
    let cut = if cmds.is_empty() { 0.0 } else { SEL_CUT };
    let h = sel_list_size(values.len(), cmds.len(), w).y;
    let rect = Rect::from_min_size(at, vec2(w, h));
    p.rect_filled(rect, Rounding::same(th.r_sm), th.card);
    p.rect_stroke(rect.shrink(0.5), Rounding::same(th.r_sm - 0.5), Stroke::new(1.0, th.edge));
    let prim = th.pal.primary_ink.unwrap_or(th.primary_deep);
    let mut y = rect.top() + pad;
    for (i, v) in values.iter().enumerate() {
        let lit = i == cur;
        let on = hover == Some(i);
        // `.sel-row:hover` — the pointed-at row LIGHTS while the current one
        // is pressed in. Down and up are opposite directions, so what you HAVE
        // and what you are ABOUT TO GET cannot be read as the same thing.
        if on {
            let rr = Rect::from_min_size(pos2(rect.left() + 4.0, y), vec2(w - 8.0, row));
            p.rect_filled(rr, Rounding::same(4.0), if lit { th.primary_subtle } else { th.paper });
        }
        let col = if lit { prim } else if on { th.ink } else { th.ink_2 };
        let cy = y + row / 2.0;
        // `.sel-tick` — 4.5px, filled on the live row and a dead bead on the rest
        p.circle_filled(pos2(rect.left() + 13.0, cy), 2.25, if lit { prim } else { th.edge_ctl });
        let g = word(p, v, 9.5, 0.1, col);
        p.galley(pos2(rect.left() + 24.0, cy - g.rect.height() / 2.0), g, col);
        y += row;
    }
    if !cmds.is_empty() {
        let cy = y + cut / 2.0;
        p.line_segment(
            [pos2(rect.left() + 9.0, cy), pos2(rect.right() - 9.0, cy)],
            Stroke::new(1.0, th.edge),
        );
        y += cut;
        for (k, c) in cmds.iter().enumerate() {
            let cy = y + row / 2.0;
            let on = hover == Some(values.len() + k);
            if on {
                let rr = Rect::from_min_size(pos2(rect.left() + 4.0, y), vec2(w - 8.0, row));
                p.rect_filled(rr, Rounding::same(4.0), th.paper);
            }
            let g = word(p, c, 9.5, 0.1, if on { th.ink } else { th.ink_2 });
            p.galley(pos2(rect.left() + 24.0, cy - g.rect.height() / 2.0), g, th.ink_2);
            y += row;
        }
    }
}

/// `.sel-row`'s height, and the plate's padding and its cut. They are out here
/// because the plate is painted in one place and hit-tested in another, and a
/// row you can see at 26 and press at 28 is the worst bug a menu can have.
pub const SEL_ROW: f32 = 26.0;
pub const SEL_PAD: f32 = 7.0;
pub const SEL_CUT: f32 = 9.0;

/// How big the plate will be. The host needs this before it can place the
/// overlay the plate lives in.
pub fn sel_list_size(values: usize, cmds: usize, w: f32) -> egui::Vec2 {
    let cut = if cmds == 0 { 0.0 } else { SEL_CUT };
    vec2(w, SEL_PAD * 2.0 + SEL_ROW * (values + cmds) as f32 + cut)
}

/// The LIVE plate. Returns the row that was pressed: an index into `values`,
/// or `values.len() + k` for the `k`-th command.
///
/// IT TAKES A `Ui` AND NOT A PAINTER because a list you cannot press is not a
/// list. The host still owns WHERE it is — this belongs in an overlay so the
/// plate covers the rack rather than shoving it down the window, which is what
/// a popover is for and the whole reason it is not laid out in the strip.
pub fn sel_list(
    ui: &mut Ui, th: &Theme, w: f32, values: &[&str], cur: usize, cmds: &[&str],
) -> Option<usize> {
    let size = sel_list_size(values.len(), cmds.len(), w);
    let (rect, _) = ui.allocate_exact_size(size, Sense::hover());
    let n = values.len() + cmds.len();
    let mut hover = None;
    let mut hit = None;
    for i in 0..n {
        let cut = if i >= values.len() { SEL_CUT } else { 0.0 };
        let top = rect.top() + SEL_PAD + SEL_ROW * i as f32 + cut;
        let rr = Rect::from_min_size(pos2(rect.left(), top), vec2(w, SEL_ROW));
        let r = ui.interact(rr, ui.id().with(("sel-row", i)), Sense::click())
            .on_hover_cursor(egui::CursorIcon::PointingHand);
        if r.hovered() {
            hover = Some(i);
        }
        if r.clicked() {
            hit = Some(i);
        }
    }
    if ui.is_rect_visible(rect) {
        paint_sel_list(ui.painter(), th, rect.min, w, values, cur, cmds, hover);
    }
    hit
}

/// `.slot` — a milled field: the well, a 13px mark at the left, and the text.
///
/// THE ONE PART ON THE STRIP THAT GIVES. Everything else there is the size of
/// its words; the field is `flex:1 1 240px` between 200 and 420, because at
/// 200 the placeholder still reads and a field narrower than its own label is
/// a field you cannot tell from a button.
pub fn slot_field(
    ui: &mut Ui, th: &Theme, w: f32, h: f32, mark: Option<Icon>, hint: &str, buf: &mut String,
) -> egui::Response {
    // the well is allocated and painted; the RESPONSE that matters is the
    // field's own, which is what this returns
    let (rect, _) = ui.allocate_exact_size(vec2(w, h), Sense::hover());
    if ui.is_rect_visible(rect) {
        paint_well(ui.painter(), rect, th.paper, th.edge);
        if let Some(ic) = mark {
            paint_icon(ui.painter(), ic, pos2(rect.left() + 18.0, rect.center().y), 13.0, 1.8, th.ink_2, 0.0);
        }
    }
    let left = rect.left() + if mark.is_some() { 32.0 } else { 11.0 };
    // A TEXT EDIT DRAWS FROM THE TOP OF THE RECT IT IS HANDED. Given the well
    // inset by five, it put the line at the top of THAT box rather than on the
    // well's centre line — so the typing sat a couple of pixels high while the
    // mark beside it sat on the middle, which is half a line of disagreement in
    // a row whose whole argument is that everything in it is one height. The
    // rect is one row plus the edit's own 2px margin, centred on the well, so
    // there is nowhere else for the line to go.
    let row = ui.fonts(|f| f.row_height(&FontId::monospace(11.0)));
    let half = (row + 4.0) / 2.0;
    let field = Rect::from_min_max(
        pos2(left, rect.center().y - half),
        pos2(rect.right() - 8.0, rect.center().y + half),
    );
    ui.put(
        field,
        egui::TextEdit::singleline(buf)
            .frame(false)
            .hint_text(hint)
            .font(FontId::monospace(11.0))
            .text_color(th.ink),
    )
}

/// `.con-say` — the sentence in the armed row: a verb, the name in full
/// weight, and what is about to come loose.
///
/// IT IS WHY THERE IS NO DIALOG. Every fact the dialog carried is about what
/// is on screen BEHIND it — which folder, how many projects — and it was
/// covering all of it. You cannot check a warning against a rack you have
/// just been shut out of.
pub fn con_say(ui: &mut Ui, th: &Theme, lead: &str, name: &str, tail: &str) {
    let mut job = LayoutJob::default();
    let f = |col: Color32| TextFormat {
        font_id: FontId::monospace(10.5),
        color: col,
        extra_letter_spacing: 10.5 * 0.07,
        ..Default::default()
    };
    job.append(lead, 0.0, f(th.ink_2));
    job.append(name, 0.0, f(th.ink));
    job.append(tail, 0.0, f(th.ink_2));
    job.wrap.max_width = ui.available_width();
    let g = ui.painter().layout_job(job);
    ui.label(g);
}

/// `.empty` — the rack with nothing in it: the whole width as one milled
/// panel, the reason in words, and a way out when there is one.
///
/// NOTHING MATCHING IS A STATE WITH A WAY OUT OF IT. A rack that is empty
/// because of a filter you set two minutes ago is not an empty rack, so the
/// key that says so is the only thing here that can be pressed. A rack that
/// is empty because the disk is empty gets no key, because there is nothing
/// to press.
pub fn empty_rack(ui: &mut Ui, th: &Theme, txt: &str, way_out: Option<&str>) -> Option<egui::Response> {
    let mut out = None;
    let h = if way_out.is_some() { 118.0 } else { 86.0 };
    let (rect, _) = ui.allocate_exact_size(vec2(ui.available_width(), h), Sense::hover());
    if ui.is_rect_visible(rect) {
        let p = ui.painter();
        p.rect_filled(rect, Rounding::same(11.0), th.paper);
        p.rect_stroke(rect.shrink(0.5), Rounding::same(10.5), Stroke::new(1.0, th.edge));
        let g = word(p, txt, 10.5, 0.18, th.ink_3);
        let y = if way_out.is_some() { rect.top() + 38.0 } else { rect.center().y };
        p.galley(pos2(rect.center().x - g.rect.width() / 2.0, y - g.rect.height() / 2.0), g, th.ink_3);
    }
    if let Some(label) = way_out {
        let kw = legend_w(ui.painter(), &[Part::Text(label)], 10.5, 12.0, 8.0) + 22.0;
        let kr = Rect::from_center_size(pos2(rect.center().x, rect.top() + 76.0), vec2(kw, 32.0 + WALL));
        let r = ui.allocate_rect(kr, Sense::click()).on_hover_cursor(egui::CursorIcon::PointingHand);
        clicky(ui, &r);
        if ui.is_rect_visible(kr) {
            paint_act(ui.painter(), th, kr, &[Part::Text(label)], ActStyle::Aux, state_of(&r, true), 10.5);
        }
        out = Some(r);
    }
    out
}

// ── git pull ────────────────────────────────────────────────────────────────

#[derive(Clone, Debug, PartialEq)]
pub enum PullState {
    /// In flight, 0–100. The step names itself from the percentage.
    Run(u8),
    /// Done — what changed. Leaves on its own.
    Ok(String),
    /// Failed — git's own words. Stays until answered.
    Err(String),
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PullHit {
    Retry,
    Terminal,
    Dismiss,
}

/// What git is doing at `pct`: fetching, receiving with a count, fast-forwarding.
pub fn pull_step(pct: u8) -> String {
    match pct {
        0..=29 => "fetching origin…".into(),
        30..=79 => format!("receiving objects {pct}%"),
        _ => "fast-forwarding…".into(),
    }
}

/// `.pullbar` — the line under a module's keys while a pull reports.
pub fn pull_line(ui: &mut Ui, th: &Theme, st: &PullState) -> Option<PullHit> {
    let (rect, _) = ui.allocate_exact_size(vec2(ui.available_width(), 30.0), Sense::hover());
    let err = matches!(st, PullState::Err(_));
    let mut hit = None;
    let p = ui.painter().clone();
    if err {
        paint_well(&p, rect, th.no_bg, th.no_edge);
    } else {
        paint_well(&p, rect, th.paper, th.edge);
    }
    let cy = rect.center().y;
    let t = ui.input(|i| i.time) as f32;
    let lamp = pos2(rect.left() + 14.0, cy);
    match st {
        PullState::Run(_) => {
            // the lamp breathes while git works: 50% at the bottom of an .8s cycle
            let a = 0.725 + 0.275 * (t * std::f32::consts::TAU / 0.8).cos();
            let mut pp = p.clone();
            pp.set_opacity(a);
            paint_lens(&pp, th, lamp, 8.0, Lens::Lit);
            ui.ctx().request_repaint();
        }
        PullState::Ok(_) => paint_lens(&p, th, lamp, 8.0, Lens::Lit),
        PullState::Err(_) => paint_lens(&p, th, lamp, 8.0, Lens::Stop),
    }
    let msg = match st {
        PullState::Run(pct) => pull_step(*pct),
        PullState::Ok(m) | PullState::Err(m) => m.clone(),
    };
    let ink = if err { th.no_ink } else { th.ink };
    // the keys first, so the message knows where it must stop
    let mut right = rect.right() - 4.0;
    if err {
        let mut keys = ui.new_child(
            egui::UiBuilder::new()
                .id_salt(("pull-acts", rect.min.x as i32, rect.min.y as i32))
                .max_rect(Rect::from_min_max(pos2(rect.left() + 120.0, rect.top() + 2.0), pos2(rect.right() - 4.0, rect.bottom())))
                .layout(Layout::right_to_left(Align::Center)),
        );
        keys.spacing_mut().item_spacing.x = 4.0;
        if act(&mut keys, th, &[Part::Icon(Icon::Close)], ActStyle::Aux, 22.0, true).on_hover_text("Dismiss").clicked() {
            hit = Some(PullHit::Dismiss);
        }
        if act(&mut keys, th, &[Part::Icon(Icon::Term)], ActStyle::Aux, 22.0, true).on_hover_text("Open in terminal").clicked() {
            hit = Some(PullHit::Terminal);
        }
        if act(&mut keys, th, &[Part::Text("RETRY")], ActStyle::Aux, 22.0, true)
            .on_hover_text("Run git pull --ff-only again")
            .clicked()
        {
            hit = Some(PullHit::Retry);
        }
        right = keys.min_rect().left() - 6.0;
    }
    let clip = Rect::from_min_max(pos2(rect.left() + 26.0, rect.top()), pos2(right, rect.bottom()));
    let g = word(&p, &msg, 10.0, 0.04, ink);
    let full = g.rect.width() > clip.width();
    p.with_clip_rect(clip).galley(pos2(clip.left(), cy - g.rect.height() / 2.0), g, ink);
    if full {
        // the tail fades rather than cutting mid-glyph
        p.text(pos2(clip.right() - 2.0, cy), egui::Align2::RIGHT_CENTER, "…", FontId::monospace(10.0), ink);
    }
    if let PullState::Run(pct) = st {
        let w = rect.width() * *pct as f32 / 100.0;
        p.with_clip_rect(rect.shrink(0.5)).rect_filled(
            Rect::from_min_size(pos2(rect.left(), rect.bottom() - 2.5), vec2(w, 2.0)),
            0.0,
            th.primary,
        );
    }
    hit
}

// ── the version ─────────────────────────────────────────────────────────────

#[derive(Clone, Debug, PartialEq)]
pub enum VerState {
    Idle(String),
    Checking,
    Latest,
    Failed,
    /// An update exists: the readout gives its place to an UPDATE key.
    Available(String),
    Updating(u8),
    Done(String),
}

/// The version readout you press to check for updates — or, when an update is
/// available, the UPDATE key standing where the readout stood. Returns the
/// response of whichever is showing.
pub fn version_readout(ui: &mut Ui, th: &Theme, st: &VerState) -> egui::Response {
    version_readout_h(ui, th, st, 21.0)
}

/// The same readout at a stated height. On the launcher's strip it is 32,
/// because `.con-top :is(.sel, .slot, .lcd)` puts every box in that row on one
/// height — a row of four heights is what "unprofessional" looks like close up,
/// and the readout is the one part in it that is shorter than its neighbours.
pub fn version_readout_h(ui: &mut Ui, th: &Theme, st: &VerState, h: f32) -> egui::Response {
    if let VerState::Available(v) = st {
        let label = format!("UPDATE {v}");
        return act(ui, th, &[Part::Icon(Icon::Pull), Part::Text(&label)], ActStyle::Go, 28.0, true)
            .on_hover_text(format!("Install version {v}"));
    }
    let (txt, busy, fail) = match st {
        VerState::Idle(v) => (format!("V{v}"), false, false),
        VerState::Checking => ("CHECKING".into(), true, false),
        VerState::Latest => ("UP TO DATE".into(), false, false),
        VerState::Failed => ("CHECK FAILED".into(), false, true),
        VerState::Updating(p) => (format!("UPDATING {p}%"), true, false),
        VerState::Done(v) => (format!("V{v} ✓"), false, false),
        VerState::Available(_) => unreachable!(),
    };
    // tighter than a panel readout: it is a corner mark, not a display
    let w = ui.painter().layout_no_wrap(txt.clone(), read_font(12.0), th.epaper_ink).rect.width() + 14.0;
    let sense = if busy { Sense::hover() } else { Sense::click() };
    let (rect, resp) = ui.allocate_exact_size(vec2(w, h), sense);
    let tip = if fail { "Could not reach the update server — click to try again" } else if busy { "Working…" } else { "Check for updates" };
    let resp = resp.on_hover_text(tip);
    let resp = if busy { resp.on_hover_cursor(egui::CursorIcon::Progress) } else { resp.on_hover_cursor(egui::CursorIcon::PointingHand) };
    if ui.is_rect_visible(rect) {
        let (mut ink, bezel) = if fail { (th.no_ink, th.no_ink) } else { (th.epaper_ink, th.epaper_bezel) };
        if busy {
            let t = ui.input(|i| i.time) as f32;
            let a = 0.725 + 0.275 * (t * std::f32::consts::TAU).cos();
            ink = ink.gamma_multiply(a);
            ui.ctx().request_repaint();
        }
        paint_lcd_ink(ui.painter(), th, rect, &txt, ink, bezel);
    }
    resp
}

/// A dim readout — `.lcd.dim`, the SHOWN count.
pub fn dim_readout(ui: &mut Ui, th: &Theme, txt: &str) {
    let w = ui.painter().layout_no_wrap(txt.to_owned(), read_font(12.0), th.epaper_ink).rect.width() + 22.0;
    let (rect, _) = ui.allocate_exact_size(vec2(w, 26.0), Sense::hover());
    paint_lcd_ink(ui.painter(), th, rect, txt, th.ink_3, th.epaper_bezel);
}

// ── the panel ───────────────────────────────────────────────────────────────

/// `--surround` on `--paper`: the panel colour, framed — a lit top, the body, a
/// dark line where it turns under, and the `--edge-ctl` ring.
pub fn paint_surround(p: &egui::Painter, th: &Theme, rect: Rect, radius: f32) {
    let r = Rounding::same(radius);
    p.rect_filled(rect, r, th.paper);
    p.line_segment(
        [pos2(rect.left() + radius, rect.top() + 1.5), pos2(rect.right() - radius, rect.top() + 1.5)],
        Stroke::new(1.0, Color32::WHITE),
    );
    p.line_segment(
        [pos2(rect.left() + radius, rect.bottom() - 1.75), pos2(rect.right() - radius, rect.bottom() - 1.75)],
        Stroke::new(1.5, Color32::from_rgba_unmultiplied(0, 0, 0, 28)),
    );
    p.rect_stroke(rect.shrink(0.5), Rounding::same(radius - 0.5), Stroke::new(1.0, th.edge_ctl));
}

/// A framed `--paper` panel with `margin` inside, the size of what it holds.
pub fn surround<R>(ui: &mut Ui, th: &Theme, radius: f32, margin: f32, add: impl FnOnce(&mut Ui) -> R) -> R {
    surround_in(ui, th, radius, margin, th.paper, th.edge_ctl, add)
}

/// A CARD IS NOT A HOLE, AND THE TWO WERE THE SAME FILL. `surround` is a part
/// cut INTO a face, so it is floored with `--paper`, the darkest cream in the
/// skin — the milled value. A module card is the opposite thing: it is a card
/// LYING ON the desk, which the stylesheet files with `.box`, `.console` and
/// `.drawer` at `--case-face` inside an `--edge` hairline. Drawn in `--paper`
/// it came out a shade of tan against the web's near-white, and a rack of them
/// read as holes punched in the desk rather than cards resting on it. Same two
/// lines of relief either way — `--shadow-card` is a white top edge and a soft
/// dark bottom one, and nothing else, because a card on paper does not float.
pub fn surround_in<R>(
    ui: &mut Ui, _th: &Theme, radius: f32, margin: f32,
    fill: Color32, edge: Color32, add: impl FnOnce(&mut Ui) -> R,
) -> R {
    let where_ = ui.painter().add(egui::Shape::Noop);
    let out = egui::Frame::none().inner_margin(margin).show(ui, add);
    let rect = out.response.rect;
    let p = ui.painter();
    // the frame goes into the slot reserved before the content, so it sits under it
    let mut shapes = Vec::new();
    shapes.push(egui::Shape::rect_filled(rect, Rounding::same(radius), fill));
    shapes.push(egui::Shape::line_segment(
        [pos2(rect.left() + radius, rect.top() + 1.5), pos2(rect.right() - radius, rect.top() + 1.5)],
        Stroke::new(1.0, Color32::WHITE),
    ));
    shapes.push(egui::Shape::line_segment(
        [pos2(rect.left() + radius, rect.bottom() - 1.75), pos2(rect.right() - radius, rect.bottom() - 1.75)],
        Stroke::new(1.5, Color32::from_rgba_unmultiplied(0, 0, 0, 28)),
    ));
    shapes.push(egui::Shape::rect_stroke(rect.shrink(0.5), Rounding::same(radius - 0.5), Stroke::new(1.0, edge)));
    p.set(where_, egui::Shape::Vec(shapes));
    out.inner
}

/// `.console` — THE LAUNCHER'S WINDOW, and the desk is INSIDE it.
///
/// THIS IS THE OPPOSITE ARRANGEMENT TO EVERY OTHER SECTION, and the reason is
/// that the relationship is the opposite way round. A knob, a fader, a
/// selector is MOUNTED IN a panel: it is never loose on a bench, so the stage
/// it is shown on is a panel face and the ruling would be showing a thing the
/// product cannot contain. The launcher is not a part — it is a whole program
/// with its own window, and what is inside that window is its OWN page: the
/// rack is a set of cards laid out on the launcher's desk, not a set of keys
/// mounted on the launcher's case.
///
/// SO THE RULING GOES IN AND THE GROUND AROUND IT STAYS PLAIN.
/// `src/skew.css:8369` — `background-color:var(--room); background-image:
/// var(--desk-grid)` — with `--edge-ctl` for the edge, because a case meeting
/// a case needs the panel hairline and a window standing on a lit page needs
/// the darker one.
///
/// AND ITS GRID HAS ITS OWN ORIGIN. Everywhere else the ruling is pinned to
/// the viewport so the page and its benches share one phase; this one is a
/// window, and a desk that slid under the cards when you scrolled would say
/// the desk belongs to the document rather than to the app.
pub fn console<R>(ui: &mut Ui, th: &Theme, margin: f32, add: impl FnOnce(&mut Ui) -> R) -> R {
    console_in(ui, th, margin, Rounding::same(16.0), true, add)
}

/// The desk itself, at a given set of corners and with or without its own edge.
///
/// IT TAKES A `Rounding` AND NOT A RADIUS BECAUSE OF THE WINDOW. Dropped into
/// an [`appwin`], the desk is the window's content and runs flush to the frame:
/// `.appwin{ overflow:hidden }` with `.appwin > .console{ border-radius:0;
/// box-shadow:none }`. There is no clip in a painter, so the two corners the
/// title bar does not cover are rounded here instead, which is the same
/// picture by the only means available.
fn console_in<R>(
    ui: &mut Ui, th: &Theme, margin: f32, r: Rounding, edge: bool,
    add: impl FnOnce(&mut Ui) -> R,
) -> R {
    let where_ = ui.painter().add(egui::Shape::Noop);
    let out = egui::Frame::none().inner_margin(margin).show(ui, add);
    let rect = out.response.rect;
    let fill = match th.skin {
        crate::Skin::Light => th.pal.room,
        // `.console{ background-color:#141517 }` — the room, a step up from
        // the page, because a dark window has to read against a dark desk
        crate::Skin::Dark => hex(0x141517),
    };
    // ONE SLOT, RESERVED BEFORE THE CONTENT AND FILLED AFTER. The fill, then
    // the ruling, then the edge — all three in the shape that was put down
    // first, so the cards lie ON the desk instead of under it.
    let mut shapes = vec![egui::Shape::rect_filled(rect, r, fill)];
    // inset by the radius so the ruling does not run out past the rounded
    // corners; the window's own top-left is the grid's zero
    shapes.extend(crate::frame::grid_shapes(th, rect.shrink(1.0), rect.min));
    if edge {
        shapes.push(egui::Shape::rect_stroke(
            rect.shrink(0.5), r, Stroke::new(1.0, th.edge_ctl)));
    }
    ui.painter().set(where_, egui::Shape::Vec(shapes));
    out.inner
}

/// `.appwin-bar`'s height. The title bar is a fixed 30px in every skin.
pub const APPWIN_BAR: f32 = 30.0;

/// `.appwin` — THE LAUNCHER IS AN APPLICATION, SO IT IS SHOWN IN A WINDOW.
///
/// Every other specimen on the page is a PART, and a part is drawn as the part:
/// a key is a key, a fader is a fader. The launcher is not a part, it is a
/// program — and a program is something you meet as a window on a desktop,
/// with the system's own bar across the top of it. Leaving that bar off does
/// not make the specimen more neutral, it makes it a panel, which is the one
/// thing this object is not.
///
/// THE THREE DOTS ARE macOS'S OWN COLOURS AND THAT IS WHY THEY ARE RIGHT.
/// `src/skew.css` says it at the rule: the system draws this bar, not us, and
/// substituting our red, our amber and our green would produce a window that
/// looks ALMOST like the real one, which reads as a mistake rather than as a
/// quotation. A borrowed thing is borrowed exactly or not at all. The name is
/// set the same way — the interface face, title case, no tracking — because
/// our caps-and-tracking is how a PART is labelled, and using it here would
/// claim we built the bar.
pub fn appwin<R>(
    ui: &mut Ui, th: &Theme, title: &str, margin: f32, add: impl FnOnce(&mut Ui) -> R,
) -> R {
    let radius = 12.0;
    // TWO SLOTS, NOT ONE. The lift goes UNDER the window and the frame's
    // hairline goes OVER its contents, so they cannot be the same shape.
    let under = ui.painter().add(egui::Shape::Noop);
    let out = ui.vertical(|ui| {
        let w = ui.available_width();
        let (bar, _) = ui.allocate_exact_size(vec2(w, APPWIN_BAR), Sense::hover());
        paint_appwin_bar(ui.painter(), th, bar, title, radius);
        console_in(
            ui, th, margin,
            Rounding { nw: 0.0, ne: 0.0, sw: radius, se: radius },
            false, add,
        )
    });
    let rect = out.response.rect;

    let mut below = Vec::new();
    match th.skin {
        crate::Skin::Light => {
            // `0 14px 30px rgba(33,62,96,.13), 0 1px 2px rgba(33,62,96,.10)` —
            // a painter has no blur, so it is the throw walked out in steps.
            for (dy, grow, a) in [(14.0, 10.0, 8), (9.0, 6.0, 12), (5.0, 3.0, 16), (1.0, 0.0, 26)] {
                below.push(egui::Shape::rect_filled(
                    rect.translate(vec2(0.0, dy)).expand(grow),
                    Rounding::same(radius + grow),
                    Color32::from_rgba_unmultiplied(33, 62, 96, a),
                ));
            }
        }
        crate::Skin::Dark => {
            for (dy, grow, a) in [(20.0, 6.0, 40), (12.0, 3.0, 70), (5.0, 1.0, 110)] {
                below.push(egui::Shape::rect_filled(
                    rect.translate(vec2(0.0, dy)).expand(grow),
                    Rounding::same(radius + grow),
                    Color32::from_rgba_unmultiplied(0, 0, 0, a),
                ));
            }
        }
    }
    ui.painter().set(under, egui::Shape::Vec(below));
    // `inset 0 0 0 1px var(--edge-ctl)` — the window's own edge, over the
    // content, because the frame is in front of what it holds.
    let ring = match th.skin {
        crate::Skin::Light => th.edge_ctl,
        crate::Skin::Dark => Color32::from_rgba_unmultiplied(0, 0, 0, 140),
    };
    ui.painter().rect_stroke(
        rect.shrink(0.5), Rounding::same(radius - 0.5), Stroke::new(1.0, ring));
    out.inner
}

/// `.appwin-bar` — the title bar: the dots, then the name, on a light ramp.
fn paint_appwin_bar(p: &egui::Painter, th: &Theme, rect: Rect, title: &str, radius: f32) {
    let r = Rounding { nw: radius, ne: radius, sw: 0.0, se: 0.0 };
    let (top, bottom, line) = match th.skin {
        // `linear-gradient(180deg,#FFFFFF,var(--case-face) 70%)`
        crate::Skin::Light => (Color32::WHITE, th.case_face, th.edge),
        crate::Skin::Dark => (th.pal.case_hi, th.pal.case, Color32::from_rgba_unmultiplied(0, 0, 0, 140)),
    };
    p.rect_filled(rect, r, bottom);
    crate::paint::vgrad(p, rect.shrink(0.6), radius, top, bottom);
    // `inset 0 -1px 0` — the bar's own floor, which is the window's one seam
    p.line_segment(
        [pos2(rect.left(), rect.bottom() - 0.5), pos2(rect.right(), rect.bottom() - 0.5)],
        Stroke::new(1.0, line),
    );
    // the dots: 10px, 6px apart, 11px in from the left
    let cy = rect.center().y;
    for (i, c) in [hex(0xFF5F57), hex(0xFEBC2E), hex(0x28C840)].into_iter().enumerate() {
        let c0 = pos2(rect.left() + 11.0 + 5.0 + i as f32 * 16.0, cy);
        p.circle_filled(c0, 5.0, c);
        // `inset 0 1px 1px rgba(255,255,255,.45)` over `inset 0 -1px 1px
        // rgba(0,0,0,.35)` — a bead, lit from above like everything else here
        p.circle_stroke(c0, 4.6, Stroke::new(0.9, Color32::from_rgba_unmultiplied(0, 0, 0, 40)));
    }
    // THE NAME IS SET THE WAY THE OS SETS IT — the interface face, title case,
    // no tracking, beside the dots and not centred in the bar.
    let g = p.layout_no_wrap(
        title.to_owned(),
        egui::FontId::new(12.0, egui::FontFamily::Proportional),
        th.ink,
    );
    let x = rect.left() + 11.0 + 3.0 * 10.0 + 2.0 * 6.0 + 9.0;
    p.galley(pos2(x, cy - g.rect.height() / 2.0), g, th.ink);
}

// ── the module ──────────────────────────────────────────────────────────────

/// One project, as a module card draws it.
///
/// THE DESCRIPTION IS GONE AND THE FOLDER TOOK ITS SLOT. Forty-three cards of
/// prose is a page you scroll past, and what you scan a rack for is the name
/// and the folder. `NODE` went with it: it was the kind of runtime, which is
/// the launcher's business and not yours, and a label that cannot be wrong
/// cannot be read either.
pub struct ModuleView<'a> {
    pub name: &'a str,
    pub port: u16,
    pub up: bool,
    /// The folder it is filed in. Empty prints `NO FOLDER`, which is a VALUE
    /// and not a missing control — with the folder tabs gone there is no drop
    /// target, so filing is a property of the project and every card can say
    /// what its own is.
    pub folder: &'a str,
    pub tags: &'a [&'a str],
    pub pull: Option<&'a PullState>,
    /// The folder drawer is open on this card: the pencil is latched and a
    /// selector sits under the keys.
    ///
    /// NOT A DIALOG. Filing is a one-field change to the thing you are
    /// already looking at, and a modal for it covers the rack to ask about
    /// one card.
    pub editing: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ModuleHit {
    Stop,
    Restart,
    Launch,
    Open,
    /// The pencil — open or shut the folder drawer.
    Edit,
    Editor,
    Finder,
    Terminal,
    Pull,
    Pull2(PullHit),
    /// The drawer's selector was pressed; the host opens the list.
    Drawer,
}

/// `.module` — one project card, the full width it is given.
pub fn module_card(ui: &mut Ui, th: &Theme, m: &ModuleView) -> Option<ModuleHit> {
    let mut hit = None;
    // `.module` IS A CARD ON THE DESK, NOT A HOLE IN IT — in the LIGHT skin,
    // `--case-face` inside an `--edge` hairline, which is what `src/skew.css`
    // files it under with `.box`, `.console` and `.drawer`. `--paper` is the
    // milled value and it made the rack read tan against the web's near-white.
    //
    // THE DARK CARD IS THE OTHER WAY ROUND AND ALWAYS WAS: `--paper` under the
    // `--surround` frame. That is not an inconsistency, it is what the two
    // rooms can carry — in the dark, a panel is lifted off the desk by a lit
    // top edge and a shadow, and the fill is the darker value because light
    // comes from the edges; in the light there is no such edge to light, so a
    // card is told apart from the desk by being the PALER of the two.
    let (fill, edge) = match th.skin {
        crate::Skin::Light => (th.case_face, th.edge),
        crate::Skin::Dark => (th.paper, th.edge_ctl),
    };
    surround_in(ui, th, th.r, 0.0, fill, edge, |ui| {
        ui.set_width(ui.available_width());
        ui.spacing_mut().item_spacing.y = 9.0;
        // ── head: the mark, the name, the stamps, and the rule under them
        let (head, _) = ui.allocate_exact_size(vec2(ui.available_width(), 44.0), Sense::hover());
        let p = ui.painter();
        let cy = head.center().y + 1.0;
        // the module's mark is what it is — code — grey stopped, orange running
        let mark = if m.up { th.primary } else { th.ink_3 };
        paint_icon(p, Icon::Code, pos2(head.left() + 23.0, cy), 14.0, 2.0, mark, 0.0);
        let g = word(p, m.name, 12.5, 0.01, th.ink);
        p.galley(pos2(head.left() + 34.0, cy - g.rect.height() / 2.0), g, th.ink);
        // ── THE STAMPS, LAID RIGHT TO LEFT so the row never wraps and never
        //    grows: the folder nearest the name is the one you scan for, so it
        //    is laid last and ends up leftmost of the group.
        let mut x = head.right() - 16.0;
        for t in m.tags.iter().rev() {
            // AS THE PROJECT WRITES IT. A stamp is already caps-and-tracked
            // type on a plate; upper-casing the string on top of that is the
            // same emphasis applied twice, and it loses the one thing the
            // tag carries that the plate does not — `dev` and `Portrait` are
            // not the same kind of word, and the project said which is which.
            x -= paint_stamp(p, th, pos2(x, cy), t) + 6.0;
        }
        let f = if m.folder.is_empty() { "NO FOLDER" } else { m.folder };
        paint_stamp(p, th, pos2(x, cy), f);
        p.line_segment(
            [pos2(head.left() + 16.0, head.bottom() - 0.5), pos2(head.right() - 16.0, head.bottom() - 0.5)],
            Stroke::new(1.0, th.edge),
        );

        egui::Frame::none().inner_margin(egui::Margin { left: 16.0, right: 16.0, top: 2.0, bottom: 12.0 }).show(ui, |ui| {
            ui.spacing_mut().item_spacing.y = 9.0;
            // the address is on the card whether or not it is answering
            if port_strip(ui, th, m.port, m.up && m.port > 0).clicked() {
                hit = Some(ModuleHit::Open);
            }
            // ── keys: the run key on the left, the five tools at the far end
            ui.horizontal(|ui| {
                ui.spacing_mut().item_spacing.x = 7.0;
                if m.up {
                    let (s, r) = split_act(ui, th, &[Part::Icon(Icon::Stop), Part::Text("STOP")], Icon::Restart);
                    if s.on_hover_text(format!("Stop {}", m.name)).clicked() {
                        hit = Some(ModuleHit::Stop);
                    }
                    if r.on_hover_text(format!("Restart {}", m.name)).clicked() {
                        hit = Some(ModuleHit::Restart);
                    }
                } else if act(ui, th, &[Part::Icon(Icon::Play), Part::Text("LAUNCH")], ActStyle::Aux, 32.0, true)
                    .on_hover_text(format!("Launch {}", m.name))
                    .clicked()
                {
                    hit = Some(ModuleHit::Launch);
                }
                // RIGHT TO LEFT, SO THE LIST IS REVERSED. On the face they
                // read pencil · editor · finder · terminal · pull, left to
                // right, which is the order the web card has them in.
                ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                    ui.spacing_mut().item_spacing.x = 7.0;
                    let pulling = matches!(m.pull, Some(PullState::Run(_)));
                    // a pull in flight holds its key down, so it cannot be pressed twice
                    let pk = if pulling {
                        let (rect, r) = ui.allocate_exact_size(vec2(32.0, 32.0 + WALL), Sense::hover());
                        paint_act(ui.painter(), th, rect, &[Part::Icon(Icon::Pull)], ActStyle::Held, KeyState::Raised, 10.5);
                        r
                    } else {
                        act(ui, th, &[Part::Icon(Icon::Pull)], ActStyle::Aux, 32.0, true)
                    };
                    if pk.on_hover_text("git pull --ff-only").clicked() && !pulling {
                        hit = Some(ModuleHit::Pull);
                    }
                    for (ic, tip, h) in [
                        (Icon::Term, "Open in terminal", ModuleHit::Terminal),
                        (Icon::Folder, "Reveal in Finder", ModuleHit::Finder),
                        (Icon::Code, "Open in editor", ModuleHit::Editor),
                    ] {
                        if act(ui, th, &[Part::Icon(ic)], ActStyle::Aux, 32.0, true).on_hover_text(tip).clicked() {
                            hit = Some(h);
                        }
                    }
                    // THE PENCIL IS THE DOOR TO THE ONE FIELD ON THIS CARD,
                    // and it is LATCHED while that field is open — which is
                    // what a held key means everywhere else in this system.
                    let ed = if m.editing {
                        let (rect, r) = ui.allocate_exact_size(vec2(32.0, 32.0 + WALL), Sense::click());
                        let r = r.on_hover_cursor(egui::CursorIcon::PointingHand);
                        clicky(ui, &r);
                        paint_act(ui.painter(), th, rect, &[Part::Icon(Icon::Pencil)], ActStyle::Held, KeyState::Raised, 10.5);
                        r
                    } else {
                        act(ui, th, &[Part::Icon(Icon::Pencil)], ActStyle::Aux, 32.0, true)
                    };
                    if ed.on_hover_text(format!("Edit {} — its folder", m.name)).clicked() {
                        hit = Some(ModuleHit::Edit);
                    }
                });
            });
            if let Some(st) = m.pull {
                if let Some(h) = pull_line(ui, th, st) {
                    hit = Some(ModuleHit::Pull2(h));
                }
            }
            // ── the folder drawer, on the panel and not over it
            if m.editing {
                ui.horizontal(|ui| {
                    ui.spacing_mut().item_spacing.x = 10.0;
                    ui.label(egui::RichText::new("FOLDER").font(FontId::monospace(8.5)).color(th.ink_2));
                    let f = if m.folder.is_empty() { "NO FOLDER" } else { m.folder };
                    if sel(ui, th, f, 176.0, 28.0, false).clicked() {
                        hit = Some(ModuleHit::Drawer);
                    }
                });
            }
        });
    });
    hit
}

/// The size a [`module_card`] wants at minimum — its run key and four tools.
pub const MODULE_MIN_W: f32 = 420.0;
