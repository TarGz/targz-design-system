//! The small pressing parts of § Pressing: BACKLIT KEY, MOMENTARY VS LATCHING,
//! MICRO KEY and KNURLED CHEVRON — each drawn with the light skin's rules.
//!
//! * **Backlit key** (`.sw`) — 24px. Off it is a raised `--card` cap on its
//!   `--edge-ctl` wall with the glyph in `--ink-2`; on (and mixed) it is DOWN:
//!   a `--paper` well with the glyph lit in `--primary-deep`. Built on
//!   [`crate::paint_key`] / [`crate::paint_pkey_down`], the same two drawings.
//! * **Icon key** (`.key.skirt` in `.mat-keys`) — 38px, r9, glyph 18px. A
//!   momentary one springs back; a latching one stays down in the same well.
//! * **Micro key** (`.micro`) — 22px, r5, `--paper` with an inset `--edge`
//!   ring; hover darkens the glyph to `--ink` and the ring to `--edge-ctl`;
//!   a delete key goes `--no-ink` on hover only.
//! * **Chevron** (`.chev`) — 20×22, a `--card` cap on the `--lift` wall. In the
//!   light skin its knurl is gone (`:is(.act, .chev)::before{display:none}`).
//!   Open, it turns 90° and lights in `--led`.

use crate::icon::{paint_icon, paint_icon_lit, Icon};
use crate::key::{clicky, clicky_with, paint_key, paint_pkey_down, KeyState, KeyStyle};
use crate::theme::Theme;
use egui::{pos2, vec2, Color32, Pos2, Rect, Rounding, Sense, Stroke, Ui, Vec2};

/// `.sw` — a 24px cap plus its 3px wall.
pub const BACKLIT_SIZE: Vec2 = Vec2 { x: 24.0, y: 27.0 };
/// `.mat-keys .key` — a 38px cap plus its 3px skirt.
pub const ICON_KEY_SIZE: Vec2 = Vec2 { x: 38.0, y: 41.0 };
/// `.micro` — 22px, cut flush, no wall.
pub const MICRO_SIZE: Vec2 = Vec2 { x: 22.0, y: 22.0 };
/// `.chev` — 20×22 plus its 3px wall.
pub const CHEV_SIZE: Vec2 = Vec2 { x: 20.0, y: 25.0 };

/// Where [`paint_key`] puts the cap, so a glyph can sit on it.
fn cap_centre(rect: Rect, down: bool) -> Pos2 {
    let wall = (rect.height() * 0.09).clamp(2.0, 3.0);
    let c = pos2(rect.center().x, rect.center().y - wall / 2.0);
    if down {
        c + vec2(0.0, wall)
    } else {
        c
    }
}

/// A key with a glyph on it: raised (or passing through `state`), or latched
/// down into its well with the glyph lit.
pub fn paint_icon_key(
    p: &egui::Painter,
    th: &Theme,
    rect: Rect,
    icon: Icon,
    icon_px: f32,
    stroke: f32,
    ink: Color32,
    state: KeyState,
    down: bool,
) {
    if down {
        paint_pkey_down(p, th, rect, "", 11.0);
        paint_icon_lit(p, icon, cap_centre(rect, true), icon_px, stroke, th.primary_deep, th.primary);
    } else {
        paint_key(p, th, rect, "", &KeyStyle::new(th.card, ink), state);
        let ink = if state == KeyState::Disabled { th.ink_3 } else { ink };
        paint_icon(p, icon, cap_centre(rect, state == KeyState::Pressed), icon_px, stroke, ink, 0.0);
    }
}

fn state_of(resp: &egui::Response) -> KeyState {
    if resp.is_pointer_button_down_on() {
        KeyState::Pressed
    } else if resp.hovered() {
        KeyState::Hover
    } else {
        KeyState::Raised
    }
}

/// BACKLIT KEY — a latching 24px switch with a glyph. Click flips `*on`.
/// Sounds like the kit's `swBtn`: `flip` down, `release` up.
pub fn backlit(ui: &mut Ui, th: &Theme, icon: Icon, on: &mut bool) -> egui::Response {
    let (rect, resp) = ui.allocate_exact_size(BACKLIT_SIZE, Sense::click());
    let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
    clicky_with(ui, &resp, crate::sfx::flip, crate::sfx::release);
    if resp.clicked() {
        *on = !*on;
    }
    if ui.is_rect_visible(rect) {
        paint_icon_key(ui.painter(), th, rect, icon, 14.0, 1.7, th.ink_2, state_of(&resp), *on);
    }
    resp
}

/// MOMENTARY / LATCHING — a 38px key with a glyph. `latch: None` springs back
/// (watch `clicked()`); `Some(&mut down)` stays down until pressed again.
/// Sounds like the kit's `key`: `press` down, `release` up.
pub fn icon_key(ui: &mut Ui, th: &Theme, icon: Icon, latch: Option<&mut bool>) -> egui::Response {
    let (rect, resp) = ui.allocate_exact_size(ICON_KEY_SIZE, Sense::click());
    let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
    clicky(ui, &resp);
    let mut down = false;
    if let Some(d) = latch {
        if resp.clicked() {
            *d = !*d;
        }
        down = *d;
    }
    if ui.is_rect_visible(rect) {
        paint_icon_key(ui.painter(), th, rect, icon, 18.0, 1.8, th.ink, state_of(&resp), down);
    }
    resp
}

/// MICRO KEY — 22px, flush with the row. `del` makes it the delete key, red on
/// hover only. Silent, as the kit's `.micro` is.
pub fn micro(ui: &mut Ui, th: &Theme, icon: Icon, del: bool) -> egui::Response {
    let (rect, resp) = ui.allocate_exact_size(MICRO_SIZE, Sense::click());
    let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
    if ui.is_rect_visible(rect) {
        let p = ui.painter();
        let r = Rounding::same(5.0);
        let hover = resp.hovered();
        let (ink, ring) = match (hover, del) {
            (true, true) => (th.no_ink, th.no_ink),
            (true, false) => (th.ink, th.edge_ctl),
            _ => (th.ink_2, th.edge),
        };
        p.rect_filled(rect, r, th.paper);
        // inset 0 1px 2px rgba(0,0,0,.10) (.12 on hover)
        let a = if hover { 31 } else { 26 };
        p.line_segment(
            [pos2(rect.left() + 4.0, rect.top() + 1.2), pos2(rect.right() - 4.0, rect.top() + 1.2)],
            Stroke::new(1.5, Color32::from_rgba_unmultiplied(0, 0, 0, a)),
        );
        p.rect_stroke(rect.shrink(0.5), Rounding::same(4.5), Stroke::new(1.0, ring));
        paint_icon(p, icon, rect.center(), 13.0, 1.7, ink, 0.0);
    }
    resp
}

/// The `.sep` beside a chevron — 1px of `--edge`, 18px tall, 3px of margin.
pub fn sep(ui: &mut Ui, th: &Theme) {
    let (rect, _) = ui.allocate_exact_size(vec2(7.0, 18.0), Sense::hover());
    ui.painter().rect_filled(
        Rect::from_center_size(rect.center(), vec2(1.0, 18.0)),
        0.0,
        th.edge,
    );
}

/// KNURLED CHEVRON — a disclosure key. Click flips `*open`; open, the chevron
/// turns 90° over 0.16s, the key sits down in its well and the glyph lights in
/// `--led`. Sounds like the kit's `chevBtn`: `flip` down, `release` up.
pub fn chevron(ui: &mut Ui, th: &Theme, id: &str, open: &mut bool) -> egui::Response {
    let (rect, resp) = ui.allocate_exact_size(CHEV_SIZE, Sense::click());
    let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
    clicky_with(ui, &resp, crate::sfx::flip, crate::sfx::release);
    if resp.clicked() {
        *open = !*open;
    }
    let t = ui.ctx().animate_bool_with_time(ui.id().with(id).with("chev"), *open, 0.16);
    if ui.is_rect_visible(rect) {
        let p = ui.painter();
        let deg = 90.0 * t;
        if *open {
            paint_pkey_down(p, th, rect, "", 11.0);
            // .chev.open svg: scale .9, lit
            let c = cap_centre(rect, true);
            let g = Color32::from_rgba_unmultiplied(th.pal.led.r(), th.pal.led.g(), th.pal.led.b(), 40);
            for d in [vec2(0.7, 0.0), vec2(-0.7, 0.0), vec2(0.0, 0.7), vec2(0.0, -0.7)] {
                paint_icon(p, Icon::Chev, c + d, 11.0 * 0.9, 2.4, g, deg);
            }
            paint_icon(p, Icon::Chev, c, 11.0 * 0.9, 2.4, th.pal.led, deg);
        } else {
            let state = state_of(&resp);
            paint_key(p, th, rect, "", &KeyStyle::new(th.card, th.ink), state);
            let c = cap_centre(rect, state == KeyState::Pressed);
            // drop-shadow(0 1px 1px rgba(0,0,0,.9)) is the dark skin's; light has none
            paint_icon(p, Icon::Chev, c, 11.0, 2.4, th.ink, deg);
        }
    }
    resp
}
