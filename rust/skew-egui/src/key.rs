//! The key.
//!
//! **A cap standing proud on a wall, with a soft throw under it.** Not a filled
//! rectangle with a border: the wall is a 3px band, bottom-rounded, drawn behind
//! the cap and therefore visible only *under* it — never at its top, which is
//! what would turn the lamp around and flatten the part. A press drops the cap
//! onto its wall and swaps the throw for a thin dark rim, so the key reads as
//! having gone into a hole in the panel. There is no ring when a key is raised:
//! the cap's own edge and the wall carry the shape, and a ring on top of them
//! reads as a selection mark.
//!
//! Every number here was tuned by eye against the documentation renders, in the
//! light skin, in `TargzPenPlotterCtrl`, and is approved. Do not change one
//! without a render to compare it against.

use crate::paint::{edge_line, mix, vgrad};
use crate::theme::Theme;
use egui::{pos2, vec2, Align2, Color32, FontId, Rect, Rounding, Sense, Stroke, Ui, Vec2};

/// Which of the five drawings to paint. `Pressed` and `Hover` come off the
/// `Response` in [`key`]; they are named here so a gallery can pose them.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum KeyState {
    /// At rest: wall, double throw, cap.
    Raised,
    /// Under the pointer. A plain cap darkens 3%, a pigment cap lightens 10%.
    Hover,
    /// Held. The cap sits on the wall; a 0.5px rim at `rgba(0,0,0,.43)` is the hole.
    Pressed,
    /// Dead: flat on the paper, no wall, no throw, label still legible.
    Disabled,
}

/// What the cap is made of.
#[derive(Clone, Copy, Debug)]
pub struct KeyStyle {
    /// The cap. `theme.card` / `theme.case_face` for a plain key, a pigment for
    /// an action key — see [`Theme::is_plain`], which decides which of the two
    /// drawings this fill gets.
    pub fill: Color32,
    /// The label's ink.
    pub fg: Color32,
    pub text_size: f32,
    /// A latched key is **a lit cap, exactly like an action key** — not a sunk
    /// one, not a ringed one. `fill` and `fg` are overridden when this is set.
    pub latched: bool,
}

impl KeyStyle {
    pub fn new(fill: Color32, fg: Color32) -> Self {
        KeyStyle {
            fill,
            fg,
            text_size: 11.0,
            latched: false,
        }
    }
}

/// Paint a key into `rect` in a given state, with no interaction at all.
///
/// [`key`] is this plus a `Response`. Call it directly to pose a state that no
/// pointer is producing — which is what `examples/gallery.rs` does.
pub fn paint_key(
    p: &egui::Painter,
    th: &Theme,
    rect: Rect,
    text: &str,
    style: &KeyStyle,
    state: KeyState,
) {
    // a latched key is a lit cap, exactly like an action key
    let (fg, fill) = if style.latched {
        (Color32::WHITE, th.primary)
    } else {
        (style.fg, style.fill)
    };
    let font = FontId::monospace(style.text_size);

    if state == KeyState::Disabled {
        let r = Rounding::same((rect.height() * 0.24).clamp(5.0, 10.0));
        let cap = Rect::from_min_max(
            rect.min,
            pos2(rect.right(), rect.bottom() - (rect.height() * 0.09).clamp(2.0, 3.0)),
        );
        p.rect_filled(cap, r, th.paper);
        p.rect_stroke(cap, r, Stroke::new(1.0, th.edge));
        p.text(cap.center(), Align2::CENTER_CENTER, text, font, th.ink_2);
        return;
    }

    let wall_h = (rect.height() * 0.09).clamp(2.0, 3.0);
    let rv = (rect.height() * 0.24).clamp(5.0, 10.0);
    let r = Rounding::same(rv);
    let cap_up = Rect::from_min_max(rect.min, pos2(rect.right(), rect.bottom() - wall_h));
    let cap_dn = cap_up.translate(vec2(0.0, wall_h));
    let plain = th.is_plain(fill);

    // --primary straight out of the palette is too hot for a cap this size on cream
    let base = if fill == th.primary || fill == th.primary_deep {
        th.key_lit
    } else {
        fill
    };
    let cap_fill = match state {
        KeyState::Pressed => mix(base, Color32::BLACK, 0.06),
        KeyState::Hover => {
            if plain {
                mix(base, Color32::BLACK, 0.03)
            } else {
                mix(base, Color32::WHITE, 0.10)
            }
        }
        _ => base,
    };
    let wall = if plain {
        th.edge_ctl
    } else {
        mix(base, Color32::BLACK, 0.26)
    };
    let border = if plain {
        if state == KeyState::Hover {
            th.edge_ctl
        } else {
            th.edge
        }
    } else {
        mix(base, Color32::BLACK, 0.20)
    };

    if state == KeyState::Pressed {
        // the cap drops onto its wall
        p.rect_filled(cap_dn, r, cap_fill);
        if !plain {
            // keep a muted gradient when pressed, or the cap goes flat and the 3D dies
            vgrad(
                p,
                cap_dn.shrink(1.2),
                (rv - 1.2).max(2.0),
                mix(cap_fill, Color32::WHITE, 0.10),
                mix(cap_fill, Color32::BLACK, 0.05),
            );
        }
        // pressed: a thin dark rim, the hole in the panel the key sank into
        p.rect_stroke(
            cap_dn,
            r,
            Stroke::new(0.5, Color32::from_rgba_unmultiplied(0, 0, 0, 110)),
        );
        p.text(cap_dn.center(), Align2::CENTER_CENTER, text, font, fg);
        return;
    }

    // raised: soft throw, wall band, cap
    let low = Rect::from_min_max(pos2(rect.left(), rect.bottom() - rv - wall_h), rect.max);
    let low_r = Rounding {
        nw: 0.0,
        ne: 0.0,
        sw: rv,
        se: rv,
    };
    p.rect_filled(
        low.translate(vec2(0.0, 2.5)),
        low_r,
        Color32::from_rgba_unmultiplied(0, 0, 0, 10),
    );
    p.rect_filled(
        low.translate(vec2(0.0, 1.5)),
        low_r,
        Color32::from_rgba_unmultiplied(0, 0, 0, 8),
    );
    p.rect_filled(low, low_r, wall); // the wall shows only under the cap, never at its top
    if plain {
        p.rect_filled(cap_up, r, cap_fill);
        p.rect_stroke(cap_up, r, Stroke::new(1.0, border));
    } else {
        // lit cap: AA base fill, gradient mesh inset 1.2px so its unfeathered
        // edge hides under the smooth rim; no ring when raised
        p.rect_filled(cap_up, r, cap_fill);
        vgrad(
            p,
            cap_up.shrink(1.2),
            (rv - 1.2).max(2.0),
            mix(cap_fill, Color32::WHITE, 0.20),
            mix(cap_fill, Color32::BLACK, 0.06),
        );
    }
    p.text(cap_up.center(), Align2::CENTER_CENTER, text, font, fg);
}

/// An interactive key: allocate, sense, paint the state the pointer puts it in.
///
/// `drag` makes it a click-and-drag key, which is what a jog pad needs.
pub fn key(
    ui: &mut Ui,
    th: &Theme,
    text: &str,
    style: &KeyStyle,
    size: Vec2,
    enabled: bool,
    drag: bool,
) -> egui::Response {
    let sense = if !enabled {
        Sense::hover()
    } else if drag {
        Sense::click_and_drag()
    } else {
        Sense::click()
    };
    let (rect, resp) = ui.allocate_exact_size(size, sense);
    let resp = if enabled {
        resp.on_hover_cursor(egui::CursorIcon::PointingHand)
    } else {
        resp
    };
    if !ui.is_rect_visible(rect) {
        return resp;
    }
    let state = if !enabled {
        KeyState::Disabled
    } else if resp.is_pointer_button_down_on() {
        KeyState::Pressed
    } else if resp.hovered() {
        KeyState::Hover
    } else {
        KeyState::Raised
    };
    let p = ui.painter();
    paint_key(p, th, rect, text, style, state);
    if enabled && resp.has_focus() {
        p.rect_stroke(
            rect.expand(1.5),
            Rounding::same(th.r_sm + 2.0),
            Stroke::new(2.0, th.ring),
        );
    }
    resp
}

/// `.pkey.is-down` — **a latched key in a light panel is a well, not a tint.**
///
/// On black, a key that is ON glows: the cap is lit from inside and the light
/// spills onto the case round it, so a wash of accent IS the state. Nothing on
/// paper glows, and the same wash on cream is a coloured swatch — which says
/// "this one is a different colour", not "this one is held down". So a light
/// panel reports a latch the way a machine does: the cap is BELOW the others and
/// you can see down onto the shadow its own walls throw. The fill goes back to
/// the milled value, the border to the control edge, and the whole of the state
/// is carried by a deep inset — darker and twice as far across as a momentary
/// press, because a latch is a key that has stopped at the bottom of its travel
/// rather than one passing through.
///
/// **The orange stays in the ink**, at `--primary-deep`, with the one lamp this
/// skin allows: a legend at the bottom of a hole has walls to spill onto, which
/// is the real place every other glow in this skin was missing.
///
/// This is not [`btn`]'s latch. A toggle key latches by lighting its cap, like
/// an action key; a key in a BAR latches by going down, because what it reports
/// is a position among its neighbours.
pub fn paint_pkey_down(p: &egui::Painter, th: &Theme, rect: Rect, text: &str, text_size: f32) {
    let wall_h = (rect.height() * 0.09).clamp(2.0, 3.0);
    let rv = (rect.height() * 0.24).clamp(5.0, 10.0);
    let r = Rounding::same(rv);
    let cap = Rect::from_min_max(rect.min, pos2(rect.right(), rect.bottom() - wall_h))
        .translate(vec2(0.0, wall_h));
    p.rect_filled(cap, r, th.paper);
    // --well: inset 0 3px 5px /.18, inset 0 1px 2px /.10, inset 0 -1px 0 white .5
    for (d, a) in [(1.5_f32, 46_u8), (3.0, 30), (4.5, 16), (6.0, 8)] {
        edge_line(
            p,
            cap,
            rv,
            d,
            true,
            Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, a)),
        );
    }
    edge_line(
        p,
        cap,
        rv,
        1.0,
        false,
        Stroke::new(1.0, Color32::from_rgba_unmultiplied(255, 255, 255, 128)),
    );
    p.rect_stroke(cap, r, Stroke::new(1.0, th.edge_ctl));
    // the lit legend: four offsets rather than a blur, per docs/PORTING.md §3
    let font = FontId::monospace(text_size);
    let glow = Color32::from_rgba_unmultiplied(th.primary.r(), th.primary.g(), th.primary.b(), 30);
    for d in [vec2(0.7, 0.0), vec2(-0.7, 0.0), vec2(0.0, 0.7), vec2(0.0, -0.7)] {
        p.text(
            cap.center() + d,
            Align2::CENTER_CENTER,
            text,
            font.clone(),
            glow,
        );
    }
    p.text(
        cap.center(),
        Align2::CENTER_CENTER,
        text,
        font,
        th.primary_deep,
    );
}

/// `.piano` — a bar of interlocked keys where exactly one is down: STEP, UNITS,
/// a page switcher. Returns true when the selection changed.
///
/// The bar itself draws **nothing**. It is a group inside a panel, and a bezel
/// does not draw inside a bezel (`version.js` 1.113.0) — it keeps its gap and
/// gives its caps room to land their skirts, and that is all it is.
pub fn pkey_bar(
    ui: &mut Ui,
    th: &Theme,
    labels: &[&str],
    sel: &mut usize,
    size: Vec2,
) -> bool {
    let mut changed = false;
    ui.horizontal(|ui| {
        ui.spacing_mut().item_spacing.x = 10.0; // --piano gap, light
        for (i, t) in labels.iter().enumerate() {
            if i == *sel {
                let (rect, resp) = ui.allocate_exact_size(size, Sense::click());
                let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
                if ui.is_rect_visible(rect) {
                    paint_pkey_down(ui.painter(), th, rect, t, 11.0);
                }
                let _ = resp;
            } else if key(ui, th, t, &KeyStyle::new(th.card, th.ink), size, true, false).clicked() {
                *sel = i;
                changed = true;
            }
        }
    });
    changed
}

/// Toggle key. `on` latches it — a lit cap, the accent in the fill.
pub fn btn(ui: &mut Ui, th: &Theme, text: &str, on: bool, size: Vec2) -> egui::Response {
    let style = KeyStyle {
        latched: on,
        ..KeyStyle::new(th.card, th.ink)
    };
    key(ui, th, text, &style, size, true, false)
}

/// Action key: a pigment cap, your own ink. `theme.primary` for go,
/// `theme.no` for stop, `theme.card` + `theme.no` ink for a quieter stop.
pub fn colored_btn(
    ui: &mut Ui,
    th: &Theme,
    text: &str,
    fill: Color32,
    fg: Color32,
    size: Vec2,
    enabled: bool,
) -> egui::Response {
    let style = KeyStyle {
        text_size: 12.0,
        ..KeyStyle::new(fill, fg)
    };
    key(ui, th, text, &style, size, enabled, false)
}
