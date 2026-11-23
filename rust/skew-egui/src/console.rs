//! The launcher console's parts — `docs/skew-panels.html` § 06 Launchpad, in
//! the light skin.
//!
//! * [`act`] — `.act` / `.chip`: a key with a legend made of [`Part`]s (a lamp,
//!   a glyph, a word, a count). [`ActStyle::Go`] is the lit orange cap,
//!   [`ActStyle::Aux`] the plain `--card` cap, [`ActStyle::Down`] a chip held
//!   down in its well. Built on [`crate::paint_key`] / [`crate::paint_pkey_down`].
//! * [`split_act`] — the running module's STOP with a restart segment welded on.
//! * [`port_strip`] — the localhost well.
//! * [`pull_line`] — git pull reporting: running with a trace, done, or failed
//!   with RETRY / terminal / dismiss. A failure stays until it is answered.
//! * [`version_readout`] — the version you press to check for updates.
//! * [`module_card`] — one project: head, description, port, keys, pull line,
//!   tags, on the `--paper` + `--surround` panel.
//!
//! Every colour is a token or a value lifted from `src/skew.css`; no green —
//! running is the orange lamp, as the rack in the CSS has it.

use crate::icon::{paint_icon, paint_icon_solid, Icon};
use crate::key::{clicky, paint_key, paint_pkey_down, KeyState, KeyStyle};
use crate::machine::paint_lcd_ink;
use crate::paint::hex;
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
    /// `.chip.is-down` — held down in a `--paper` well, the legend in orange.
    Down,
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
        ActStyle::Down => th.primary_deep,
    };
    let mut down = false;
    match style {
        ActStyle::Go => paint_key(p, th, rect, "", &KeyStyle::new(th.primary, Color32::WHITE), state),
        ActStyle::Aux => paint_key(p, th, rect, "", &KeyStyle::new(th.card, th.ink), state),
        ActStyle::Down => {
            paint_pkey_down(p, th, rect, "", 11.0);
            down = true;
        }
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
                let col = if style == ActStyle::Down { th.pal.primary_ink.unwrap_or(th.primary_deep) } else { th.ink_2 };
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
        let pad = if style == ActStyle::Go { 13.0 } else { 11.0 };
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

/// `.port` — `localhost:2857 … OPEN`, the width of the card. Click opens it.
pub fn port_strip(ui: &mut Ui, th: &Theme, port: u16) -> egui::Response {
    let (rect, resp) = ui.allocate_exact_size(vec2(ui.available_width(), 30.0), Sense::click());
    let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand).on_hover_text("Open in browser");
    if ui.is_rect_visible(rect) {
        let p = ui.painter();
        paint_well(p, rect, th.paper, if resp.hovered() { th.edge_ctl } else { th.edge });
        let cy = rect.center().y;
        paint_icon(p, Icon::Ext, pos2(rect.left() + 16.0, cy), 12.0, 1.8, th.ink, 0.0);
        let g = word(p, &format!("localhost:{port}"), 11.0, 0.04, th.ink);
        p.galley(pos2(rect.left() + 30.0, cy - g.rect.height() / 2.0), g, th.ink);
        let g = word(p, "OPEN", 9.0, 0.1, th.ink_2);
        p.galley(pos2(rect.right() - 10.0 - g.rect.width(), cy - g.rect.height() / 2.0), g, th.ink_2);
    }
    resp
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
    let (rect, resp) = ui.allocate_exact_size(vec2(w, 21.0), sense);
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
    let where_ = ui.painter().add(egui::Shape::Noop);
    let out = egui::Frame::none().inner_margin(margin).show(ui, add);
    let rect = out.response.rect;
    let p = ui.painter();
    // the frame goes into the slot reserved before the content, so it sits under it
    let mut shapes = Vec::new();
    shapes.push(egui::Shape::rect_filled(rect, Rounding::same(radius), th.paper));
    shapes.push(egui::Shape::line_segment(
        [pos2(rect.left() + radius, rect.top() + 1.5), pos2(rect.right() - radius, rect.top() + 1.5)],
        Stroke::new(1.0, Color32::WHITE),
    ));
    shapes.push(egui::Shape::line_segment(
        [pos2(rect.left() + radius, rect.bottom() - 1.75), pos2(rect.right() - radius, rect.bottom() - 1.75)],
        Stroke::new(1.5, Color32::from_rgba_unmultiplied(0, 0, 0, 28)),
    ));
    shapes.push(egui::Shape::rect_stroke(rect.shrink(0.5), Rounding::same(radius - 0.5), Stroke::new(1.0, th.edge_ctl)));
    p.set(where_, egui::Shape::Vec(shapes));
    out.inner
}

// ── the module ──────────────────────────────────────────────────────────────

/// One project, as a module card draws it.
pub struct ModuleView<'a> {
    pub name: &'a str,
    pub desc: &'a str,
    pub port: u16,
    pub up: bool,
    pub folder: &'a str,
    pub tags: &'a [&'a str],
    pub pull: Option<&'a PullState>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ModuleHit {
    Stop,
    Restart,
    Launch,
    Open,
    Editor,
    Finder,
    Terminal,
    Pull,
    Pull2(PullHit),
}

/// `.module` — one project card, the full width it is given.
pub fn module_card(ui: &mut Ui, th: &Theme, m: &ModuleView) -> Option<ModuleHit> {
    let mut hit = None;
    surround(ui, th, th.r, 0.0, |ui| {
        ui.set_width(ui.available_width());
        ui.spacing_mut().item_spacing.y = 9.0;
        // ── head: the pilot, the name, the stamp, and the rule under them
        let (head, _) = ui.allocate_exact_size(vec2(ui.available_width(), 44.0), Sense::hover());
        let p = ui.painter();
        let cy = head.center().y + 1.0;
        // the module's mark is what it is — code — grey stopped, orange running
        let mark = if m.up { th.primary } else { th.ink_3 };
        paint_icon(p, Icon::Code, pos2(head.left() + 23.0, cy), 14.0, 2.0, mark, 0.0);
        let g = word(p, m.name, 12.5, 0.01, th.ink);
        p.galley(pos2(head.left() + 34.0, cy - g.rect.height() / 2.0), g, th.ink);
        let sg = word(p, "NODE", 8.5, 0.14, th.ink_2);
        let sb = Rect::from_min_size(
            pos2(head.right() - 16.0 - sg.rect.width() - 10.0, cy - sg.rect.height() / 2.0 - 2.0),
            vec2(sg.rect.width() + 10.0, sg.rect.height() + 4.0),
        );
        p.rect_filled(sb, Rounding::same(3.0), th.paper);
        p.rect_stroke(sb.shrink(0.5), Rounding::same(2.5), Stroke::new(1.0, th.edge_ctl));
        p.galley(pos2(sb.left() + 5.0, sb.top() + 2.0), sg, th.ink_2);
        p.line_segment(
            [pos2(head.left() + 16.0, head.bottom() - 0.5), pos2(head.right() - 16.0, head.bottom() - 0.5)],
            Stroke::new(1.0, th.edge),
        );

        egui::Frame::none().inner_margin(egui::Margin { left: 16.0, right: 16.0, top: 2.0, bottom: 12.0 }).show(ui, |ui| {
            ui.spacing_mut().item_spacing.y = 9.0;
            ui.add(egui::Label::new(egui::RichText::new(m.desc).size(11.5).color(th.ink_2)).wrap());
            if m.up && port_strip(ui, th, m.port).clicked() {
                hit = Some(ModuleHit::Open);
            }
            // ── keys: the run key on the left, the four tools at the far end
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
                ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                    ui.spacing_mut().item_spacing.x = 7.0;
                    let pulling = matches!(m.pull, Some(PullState::Run(_)));
                    // a pull in flight holds its key down, so it cannot be pressed twice
                    let pk = if pulling {
                        let (rect, r) = ui.allocate_exact_size(vec2(32.0, 32.0 + WALL), Sense::hover());
                        paint_act(ui.painter(), th, rect, &[Part::Icon(Icon::Pull)], ActStyle::Down, KeyState::Raised, 10.5);
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
                });
            });
            if let Some(st) = m.pull {
                if let Some(h) = pull_line(ui, th, st) {
                    hit = Some(ModuleHit::Pull2(h));
                }
            }
            // ── tags: printed, not displayed
            ui.horizontal(|ui| {
                ui.spacing_mut().item_spacing.x = 10.0;
                for t in std::iter::once(&m.folder).chain(m.tags.iter()) {
                    ui.label(egui::RichText::new(*t).font(FontId::monospace(9.0)).color(th.ink_2));
                }
            });
        });
    });
    hit
}

/// The size a [`module_card`] wants at minimum — its run key and four tools.
pub const MODULE_MIN_W: f32 = 420.0;
