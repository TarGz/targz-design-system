//! The application shell — the parts a windowed app is built out of, as
//! opposed to the parts a control panel is built out of.
//!
//! All six were lifted from `~/Documents/GIT/Terminass` (Rust, eframe/egui
//! 0.29), the third of the three apps `docs/APP-ALIGNMENT.md` studies. That
//! app drew every one of them by hand in its own `src/theme.rs` and
//! `src/app.rs`, because this crate had nothing to reach for — the same way it
//! hand-transcribed the palette, which is the drift this crate exists to end.
//!
//! The web side is the source, as always: `src/skew.css`, under
//! **TERMINASS'S PARTS**. No part here picks a COLOUR — every one comes off
//! [`Theme`]. The ALPHAS that are written as numbers are all in
//! [`paint_tab_ledge`]'s near wall — `inset 0 2px 5px rgba(0,0,0,.28)` read as
//! three lines falling away. An alpha is not a value the palette carries,
//! which is why the fader's own hardware is the other exception PARITY.md
//! already records.

use crate::console::{paint_lens, paint_well, Lens};
use crate::icon::{paint_icon, Icon};
use crate::key::{KeyState, KeyStyle};
use crate::theme::{mono, Theme};
use egui::{pos2, vec2, Align2, Color32, FontId, Rect, Rounding, Sense, Stroke, Ui, Vec2};

/// `--rim` as a FILL — see [`paint_rail_item`] for why this is two tokens.
fn hover_fill(th: &Theme) -> Color32 {
    match th.skin {
        crate::Skin::Dark => th.pal.rim,
        crate::Skin::Light => th.card_hover,
    }
}

// ── the vertical nav rail ───────────────────────────────────────────────────

/// `.rail-item` — 34px, the row's whole width.
pub const RAIL_ROW_H: f32 = 34.0;

/// One destination on the rail.
#[derive(Clone, Copy, Debug)]
pub struct RailItem<'a> {
    pub icon: Icon,
    pub name: &'a str,
}

/// Paint one rail row.
///
/// THE SELECTED ROW IS A CUT, NOT A CAP. On a horizontal bar the current page
/// is a key that is down, because the keys have walls between them. A column
/// of rows has no walls, so a cap would be a key standing in a space with
/// nothing to stand on — the mark is the row sinking into the case instead,
/// which is `--recess`, the token the whole language uses for "below the
/// surface", and which [`paint_well`] already draws.
///
/// THE LAMP IS THE ONLY COLOUR IN THE COLUMN. A column of unlit lamps with one
/// lit reads across a room; a tinted background does not, and it spends the
/// skin's one loud colour on a row that is merely current.
pub fn paint_rail_item(
    p: &egui::Painter, th: &Theme, rect: Rect, item: &RailItem, on: bool, hover: bool,
) {
    if on {
        // `--bay`, not `--paper`: the floor of a hole is the case seen
        // deeper, and in the light skin `--bay` already aliases to `--paper`.
        paint_well(p, rect, th.pal.bay, th.edge);
    } else if hover {
        // `.rail-item:not(.on):hover` — the metal warming under the pointer.
        // Nothing moves: a row that lifts is a row that was a card.
        //
        // TWO TOKENS FOR ONE STATE, because `--rim` is an EDGE. In the dark
        // skin it is white at 9% and warms anodising exactly the way the
        // stylesheet asks; in the light skin it is white at 100%, which as a
        // FILL on cream is invisible — so the light rule in `src/skew.css`
        // hands that row to `--card-hover`, and so does this.
        p.rect_filled(rect, Rounding::same(th.r_key), hover_fill(th));
    }
    let cy = rect.center().y;
    // 7px lamp at 12 in from the edge — `.rail-item .pilot`
    paint_lens(p, th, pos2(rect.left() + 15.5, cy), 7.0, if on { Lens::Lit } else { Lens::Unlit });
    let ink = if on { th.primary } else { th.ink_2 };
    paint_icon(p, item.icon, pos2(rect.left() + 34.0, cy), 14.0, 1.8, ink, 0.0);
    // `.rail-nm` — 10.5px, .16em tracking, caps
    let mut job = egui::text::LayoutJob::default();
    job.append(
        &item.name.to_uppercase(),
        0.0,
        egui::TextFormat {
            font_id: FontId::monospace(10.5),
            color: ink,
            extra_letter_spacing: 10.5 * 0.16,
            ..Default::default()
        },
    );
    job.wrap.max_width = rect.width() - 56.0;
    let g = p.layout_job(job);
    p.galley(pos2(rect.left() + 48.0, cy - g.rect.height() / 2.0), g, ink);
}

/// The rail. `current` is the row that is cut in; it is written on a press.
/// Returns the index pressed, if one was.
pub fn rail(ui: &mut Ui, th: &Theme, items: &[RailItem], current: &mut usize) -> Option<usize> {
    let mut hit = None;
    ui.vertical(|ui| {
        ui.spacing_mut().item_spacing.y = 3.0;
        for (i, it) in items.iter().enumerate() {
            let (rect, resp) = ui.allocate_exact_size(
                vec2(ui.available_width(), RAIL_ROW_H),
                Sense::click(),
            );
            let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
            if ui.is_rect_visible(rect) {
                paint_rail_item(ui.painter(), th, rect, it, *current == i, resp.hovered());
            }
            if resp.clicked() {
                *current = i;
                hit = Some(i);
            }
        }
    });
    hit
}

// ── the tab bar ────────────────────────────────────────────────────────────

/// `.tab.on` — the open folder, and the tallest thing on the bar.
pub const TAB_H: f32 = 34.0;
/// `.tabbar .tab:not(.on)` — a closed folder stands seven pixels shorter.
pub const TAB_H_OFF: f32 = 27.0;
/// `.tabbar` — `padding:12px 8px 0`. The room showing above the folders.
pub const TABBAR_PAD_T: f32 = 12.0;
/// The whole ledge: the room above the tabs plus the tallest tab.
pub const TABBAR_H: f32 = TABBAR_PAD_T + TAB_H;

/// What KIND of session a tab is — and it is a kind, not an identity.
///
/// Terminass tells its hosts apart by a letter and a colour, which is an
/// identity and belongs to the host. This is the other question: is the thing
/// at the end of this tab THIS machine or another one. Two answers, so two
/// marks and two colours, and no ramp is involved.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum TabKind {
    /// `ICON.term` — the prompt. This machine.
    Local,
    /// `ICON.server` — two rack units. Somewhere else.
    Remote,
}

impl TabKind {
    fn icon(self) -> Icon {
        match self {
            TabKind::Local => Icon::Term,
            TabKind::Remote => Icon::Server,
        }
    }
    /// THE LIT STEP, NOT THE FILL. `--run` and `--led` are what a large cap is
    /// PAINTED IN and arrive muddy at 13px; `--run-lit` and `--led-hot` are
    /// what a READOUT is made of, which is what a 11px name on a tab is. The
    /// light skin takes the deep step of each instead, because on cream the
    /// lit value is the one that disappears.
    fn ink(self, th: &Theme) -> Color32 {
        match (self, th.skin) {
            (TabKind::Local, crate::Skin::Dark) => th.pal.run_lit,
            (TabKind::Local, crate::Skin::Light) => th.pal.run,
            (TabKind::Remote, crate::Skin::Dark) => th.pal.led_hot,
            (TabKind::Remote, crate::Skin::Light) => th.primary_deep,
        }
    }
}

/// One tab on the bar.
#[derive(Clone, Copy, Debug)]
pub struct Tab<'a> {
    pub name: &'a str,
    pub kind: TabKind,
}

/// The surface a tab bar is cut into: `--plate` under `--rim` and `--groove`.
///
/// Paint this FIRST and let the bar overlap its top edge by a pixel — the cut
/// is the whole mechanism and it needs something to be cut into.
pub fn paint_tabpane(p: &egui::Painter, th: &Theme, rect: Rect) {
    let fill = pane_fill(th);
    p.rect_filled(rect, Rounding::same(th.r_mod), fill);
    p.rect_stroke(rect, Rounding::same(th.r_mod), Stroke::new(1.0, groove(th)));
    p.line_segment(
        [pos2(rect.left() + th.r_mod, rect.top() + 0.5), pos2(rect.right() - th.r_mod, rect.top() + 0.5)],
        Stroke::new(1.0, rim(th)),
    );
}

/// `.tabpane` background — and in the LIGHT skin it is not `--plate`.
///
/// `--case` and `--plate` BOTH alias to `--card` over there, so a closed
/// folder painted in the pane's own fill is not a closed folder at all. The
/// pane keeps `--card`; the step BACK is `--case-face`, which is what
/// [`tab_face`] uses. Same inversion `module_card` already documents.
fn pane_fill(th: &Theme) -> Color32 {
    match th.skin {
        crate::Skin::Dark => th.pal.plate,
        crate::Skin::Light => th.card,
    }
}
fn groove(th: &Theme) -> Color32 {
    match th.skin {
        crate::Skin::Dark => th.pal.groove,
        crate::Skin::Light => th.edge,
    }
}
fn rim(th: &Theme) -> Color32 {
    match th.skin {
        crate::Skin::Dark => th.pal.rim,
        crate::Skin::Light => th.pal.case_hi,
    }
}
/// The three stops down a closed folder's face: lit top, body, far wall.
///
/// Hovering does not LIGHTEN those three, it swaps them for the next surface
/// up — `--plate` where the resting face has `--case`, `--case` where it has
/// `--groove`. A folder coming forward is a folder nearer the lamp, and the
/// file has a name for every step of that; brightening one by a percentage
/// would be inventing a surface the language does not have.
fn tab_face(th: &Theme, hover: bool) -> (Color32, Color32, Color32) {
    match (th.skin, hover) {
        (crate::Skin::Dark, false) => (th.pal.plate_hi, th.pal.case, th.pal.groove),
        (crate::Skin::Dark, true) => (th.pal.plate_hi, th.pal.plate, th.pal.case),
        (crate::Skin::Light, false) => (th.card, th.case_face, th.edge),
        (crate::Skin::Light, true) => (Color32::WHITE, th.card_hover, th.edge),
    }
}

/// `.tabbar` — THE LEDGE IS A WINDOW ONTO THE ROOM.
///
/// Not a strip of case with the tabs on it: a hole in the panel, with the
/// room's own ruled ground at the bottom of it. The ruling is
/// [`crate::grid_shapes`], the same 120px majors and 24px minors every other
/// ruled surface in this crate uses, and its origin is the LEDGE'S OWN
/// top-left so the phase matches whatever it is sitting in — the CSS gets
/// this from `background-attachment:fixed` and this is that.
///
/// An earlier pass had the ground in `--run`, a saturated semantic blue spent
/// on a surface nobody is reading. The room is the room.
pub fn paint_tab_ledge(p: &egui::Painter, th: &Theme, rect: Rect) {
    let r = th.r_key;
    let round = Rounding { nw: r, ne: r, sw: 0.0, se: 0.0 };
    p.rect_filled(rect, round, th.pal.room);
    let clip = p.with_clip_rect(rect);
    clip.extend(crate::grid_shapes(th, rect, rect.min));
    // `inset 0 2px 5px rgba(0,0,0,.28)` — the near wall of the cut
    for (i, a) in [(1.0_f32, 46u8), (2.0, 30), (3.5, 16)] {
        clip.line_segment(
            [pos2(rect.left() + r, rect.top() + i), pos2(rect.right() - r, rect.top() + i)],
            Stroke::new(1.0, Color32::from_rgba_unmultiplied(0, 0, 0, a)),
        );
    }
    // `.tabbar::after` — the baseline. It runs the width of the ledge and the
    // open tab is the one place it stops, because that tab paints over it.
    p.line_segment(
        [pos2(rect.left(), rect.bottom() - 0.5), pos2(rect.right(), rect.bottom() - 0.5)],
        Stroke::new(1.0, groove(th)),
    );
}

/// Paint one tab, bottom-aligned inside the ledge.
///
/// THE CUT IS THE WHOLE MECHANISM, AND IT IS ONE RECTANGLE. A tab bar's claim
/// is that the tab and the pane are THE SAME OBJECT — which a key that is down
/// cannot make, because a key stands ON a surface and a tab is a thing the
/// surface is PART OF. So the open tab overlaps the pane by a pixel and then
/// lays the pane's OWN fill back across that overlap, painting out the line
/// that would have closed its bottom. The baseline runs past every closed
/// folder and stops dead at the open one.
///
/// AND THE OPEN TAB'S FACE IS FLAT. A moulding running on into the pane would
/// draw a seam exactly where the part exists to have none.
///
/// THE KIND COLOURS THE WHOLE OPEN TAB OR NONE OF IT. One ink, and the mark
/// and the close take it too — a tab is one object, and an orange mark beside
/// orange text beside a grey × is three objects that happen to be touching.
/// Closed tabs carry the mark in dim ink: the SHAPE already says the kind.
pub fn paint_tab(
    p: &egui::Painter, th: &Theme, rect: Rect, tab: &Tab, on: bool, state: KeyState, x_hot: bool,
) {
    let r = th.r_key;
    let round = Rounding { nw: r, ne: r, sw: 0.0, se: 0.0 };
    let hover = state == KeyState::Hover;

    if on {
        p.rect_filled(rect, round, pane_fill(th));
    } else {
        let (top, mid, bot) = tab_face(th, hover);
        p.rect_filled(rect, round, mid);                      // the AA outline
        let clip = p.with_clip_rect(rect.shrink(0.5));        // hide the meshes' hard edges
        let split = rect.top() + rect.height() * 0.55;
        crate::vgrad(&clip, Rect::from_min_max(rect.min, pos2(rect.right(), split)), 0.0, top, mid);
        crate::vgrad(&clip, Rect::from_min_max(pos2(rect.left(), split), rect.max), 0.0, mid, bot);
    }
    // the hairline round the face and the lit lip under its top edge
    p.rect_stroke(rect, round, Stroke::new(1.0, groove(th)));
    p.line_segment(
        [pos2(rect.left() + r, rect.top() + 0.5), pos2(rect.right() - r, rect.top() + 0.5)],
        Stroke::new(1.0, rim(th)),
    );
    // AND THE BOTTOM EDGE OF THE OPEN ONE IS CUT: the pane's fill, laid back
    // over the line that would close it.
    if on {
        p.rect_filled(
            Rect::from_min_max(pos2(rect.left() + 1.0, rect.bottom() - 1.5), pos2(rect.right() - 1.0, rect.bottom())),
            Rounding::ZERO,
            pane_fill(th),
        );
    }

    let ink = if on {
        tab.kind.ink(th)
    } else if hover {
        th.pal.txt
    } else {
        th.pal.txt_dim
    };
    let cy = rect.center().y;

    // the mark — 13px, `.tab-ico`
    paint_icon(p, tab.kind.icon(), pos2(rect.left() + 16.5, cy), 13.0, 1.8, ink, 0.0);

    // the close shows on hover and on the open one — the tab you could mean.
    // A × on every tab is a row of marks saying "you may destroy this" on a
    // bar you are reading for names.
    let show_x = on || hover;
    let right = if show_x { rect.right() - 26.0 } else { rect.right() - 10.0 };

    let mut job = egui::text::LayoutJob::single_section(
        tab.name.to_string(),
        egui::TextFormat { font_id: FontId::monospace(11.0), color: ink, ..Default::default() },
    );
    job.wrap = egui::text::TextWrapping {
        max_width: (right - rect.left() - 31.0).max(8.0),
        max_rows: 1,
        break_anywhere: true,
        overflow_character: Some('…'),
    };
    let g = p.layout_job(job);
    p.galley(pos2(rect.left() + 31.0, cy - g.rect.height() / 2.0), g, ink);

    if show_x {
        let xc = pos2(rect.right() - 16.0, cy);
        if x_hot {
            p.rect_filled(Rect::from_center_size(xc, Vec2::splat(16.0)), 4.0, hover_fill(th));
        }
        paint_icon(p, Icon::Close, xc, 11.0, 2.0, if x_hot { th.pal.led_hot } else { ink }, 0.0);
    }
}

/// `.tabbar` live — the ledge, the tabs on it, and the pane under it.
///
/// Returns `(clicked, closed)`: which tab was selected, and which was asked to
/// go away. `pane` is the rect the pane will occupy; the bar overlaps its top
/// edge by a pixel, which is what makes the cut possible.
///
/// THE × IS NOT THE TAB. A close mark inside a control that also selects is
/// the one press on a tab bar you can make by accident, so the hit is tested
/// against the mark's own box before the tab ever claims the click.
pub fn tabbar(
    ui: &mut Ui, th: &Theme, tabs: &[Tab], current: usize,
) -> (Option<usize>, Option<usize>) {
    let w = ui.available_width();
    let (bar, _) = ui.allocate_exact_size(vec2(w, TABBAR_H), Sense::hover());
    let mut picked = None;
    let mut closed = None;

    if ui.is_rect_visible(bar) {
        paint_tab_ledge(ui.painter(), th, bar);
    }

    let mut x = bar.left() + 8.0;
    for (i, t) in tabs.iter().enumerate() {
        let on = i == current;
        let tw = 170.0_f32.min((bar.width() - 50.0) / tabs.len().max(1) as f32).max(96.0);
        let h = if on { TAB_H } else { TAB_H_OFF };
        let rect = Rect::from_min_max(pos2(x, bar.bottom() - h), pos2(x + tw, bar.bottom()));
        let resp = ui.interact(rect, ui.id().with(("tab", i)), Sense::click());
        let resp = resp.on_hover_cursor(egui::CursorIcon::PointingHand);
        let xr = Rect::from_center_size(pos2(rect.right() - 16.0, rect.center().y), Vec2::splat(18.0));
        let over_x = resp.hover_pos().map_or(false, |q| xr.contains(q));
        let state = if resp.hovered() { KeyState::Hover } else { KeyState::Raised };
        if ui.is_rect_visible(rect) {
            paint_tab(ui.painter(), th, rect, t, on, state, over_x);
        }
        // middle-click closes a tab too — it is the one gesture every bar has
        if (resp.clicked() && over_x) || resp.middle_clicked() {
            closed = Some(i);
        } else if resp.clicked() {
            picked = Some(i);
        }
        x += tw + 2.0;
    }
    (picked, closed)
}

// ── the field and its action ────────────────────────────────────────────────

/// `.slotrow` — a field and the key that acts on it, one row, one height.
///
/// THE KEY IS NOT INSIDE THE WELL. A cap sunk into the slot beside it would be
/// a key at the bottom of a hole. The two stand side by side at one height,
/// which is what `.con-top :is(.sel, .slot, .lcd)` already says about every box
/// in a row — and the host no longer computes the field's width as
/// `available_width() - 70.0`, which is a number that has to be re-guessed
/// every time the key's label changes.
///
/// `enabled` is the key's, not the field's: CONNECT is dead until the field
/// has something in it, which is a state the specimen has to be able to show.
///
/// Returns `(field, key)` responses, in that order.
pub fn slot_row(
    ui: &mut Ui, th: &Theme, mark: Option<Icon>, hint: &str, buf: &mut String, action: &str,
    h: f32, enabled: bool,
) -> (egui::Response, egui::Response) {
    let mut field = None;
    let mut act = None;
    ui.horizontal(|ui| {
        ui.spacing_mut().item_spacing.x = 6.0;
        let key_w = ui
            .painter()
            .layout_no_wrap(action.to_owned(), FontId::monospace(11.0), th.ink)
            .rect
            .width()
            + 26.0;
        let field_w = (ui.available_width() - key_w - 6.0).max(60.0);
        field = Some(crate::console::slot_field(ui, th, field_w, h, mark, hint, buf));
        act = Some(crate::key::key(
            ui, th, action, &KeyStyle::new(th.card, th.ink), vec2(key_w, h), enabled, false,
        ));
    });
    (field.unwrap(), act.unwrap())
}

// ── the settings form row ───────────────────────────────────────────────────

/// `.frow-lab` — Terminass's own `FORM_LABEL_W`, which is its longest name
/// plus room.
pub const FROW_LAB_W: f32 = 150.0;

/// A settings row: a right-aligned name, then what it names.
///
/// THE NAME IS RIGHT-ALIGNED AND THAT IS THE WHOLE POINT. A column of
/// left-aligned labels puts a ragged edge against the controls, so the eye
/// crosses a different gap on every line; right-aligned, the names end on one
/// rule and every control starts on the next.
///
/// THE BODY IS A COLUMN, not a row, because a setting is a control AND the
/// sentence under it — see [`hint`] — and those stack.
pub fn frow<R>(ui: &mut Ui, th: &Theme, label: &str, add: impl FnOnce(&mut Ui) -> R) -> R {
    ui.add_space(4.0);
    ui.horizontal_top(|ui| {
        ui.spacing_mut().item_spacing.x = 14.0;
        let (r, _) = ui.allocate_exact_size(vec2(FROW_LAB_W, 22.0), Sense::hover());
        if ui.is_rect_visible(r) {
            ui.painter().text(
                pos2(r.right(), r.center().y),
                Align2::RIGHT_CENTER,
                label,
                FontId::monospace(11.5),
                th.ink_2,
            );
        }
        ui.vertical(|ui| {
            ui.spacing_mut().item_spacing.y = 6.0;
            add(ui)
        })
        .inner
    })
    .inner
}

// ── the sentence under a control ────────────────────────────────────────────

/// What a [`hint`] or a [`statline`] is saying.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Tone {
    /// What the control does. `--ink-2`.
    Plain,
    /// What it is doing now, and it is fine. `--ok-ink`.
    Ok,
    /// What it is doing now, and it is not. `--no-ink`.
    No,
}

impl Tone {
    fn ink(self, th: &Theme) -> Color32 {
        match self {
            // `--ok-ink` AND NOT `--ok`: the lamp value is a FILL and reads
            // 2.20:1 as a word on a card. The token block says so.
            Tone::Plain => th.ink_2,
            Tone::Ok => th.ok_ink,
            Tone::No => th.no_ink,
        }
    }
}

/// `.hint` — the sentence under a control, in sentence case, saying what the
/// control will do.
///
/// IT IS SET AT THE ROW'S SIZE, NOT UNDER IT. The instinct is to shrink a note,
/// and a note nobody reads is a note that is not there. `.mod-desc` settled
/// this at 11.5 for the same kind of text on a card; this is that rule where
/// there is no card.
pub fn hint(ui: &mut Ui, th: &Theme, tone: Tone, text: &str) {
    ui.label(mono(text, 11.5).color(tone.ink(th)));
}

// ── the status line ─────────────────────────────────────────────────────────

/// `.statline` — a lamp and what it means, at the foot of a pane.
///
/// IT IS NOT A TOAST AND IT DOES NOT GO AWAY. The thing it reports is true for
/// as long as it is true, and a message that leaves cannot be checked.
///
/// THE WORDS ARE ETCHED, NOT SET: a status line is a legend stamped on the
/// case, so it takes the caption's tracking and its caps.
pub fn statline(ui: &mut Ui, th: &Theme, lit: bool, tone: Tone, cap: &str) {
    ui.horizontal(|ui| {
        ui.spacing_mut().item_spacing.x = 9.0;
        let (r, _) = ui.allocate_exact_size(Vec2::splat(9.0), Sense::hover());
        if ui.is_rect_visible(r) {
            paint_lens(
                ui.painter(), th, r.center(), 9.0,
                if lit { Lens::Lit } else { Lens::Unlit },
            );
        }
        let mut job = egui::text::LayoutJob::default();
        job.append(
            &cap.to_uppercase(),
            0.0,
            egui::TextFormat {
                font_id: FontId::monospace(9.5),
                color: tone.ink(th),
                extra_letter_spacing: 9.5 * 0.14,
                ..Default::default()
            },
        );
        ui.label(ui.fonts(|f| f.layout_job(job)));
    });
}
