//! The skin as a value: a [`Palette`] resolved into the handful of names the
//! painted parts ask for, plus the egui `Visuals` and `Style` that go with it.

use crate::paint::hex;
use crate::tokens::Palette;
use egui::{Color32, FontId, RichText, Rounding, Stroke, Vec2};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Skin {
    Light,
    Dark,
}

/// A resolved skin.
///
/// `Palette` is the generated union of both skins, so half its colour fields are
/// `Option` — a token one skin names and the other does not (`dist/skew_tokens.rs`
/// explains why that is an `Option` and not a default). The parts cannot paint an
/// `Option`, so every fallback is decided **here, once**, with the reason beside
/// it, rather than at forty call sites.
///
/// Field comments carry the CSS token name, and — where the pen-plotter app's
/// hand-written `theme.rs` had a const for it — that const's name, so a port is a
/// find-and-replace and not a re-reading.
#[derive(Clone, Copy, Debug)]
pub struct Theme {
    pub skin: Skin,
    /// Everything the generator emits, if a part needs a token no field below names.
    pub pal: Palette,

    // ── surfaces ────────────────────────────────────────────────────────────
    /// `--paper` / dark `--room` — the page a panel sits on. (app: `BG`)
    pub paper: Color32,
    /// `--card` / dark `--plate` — a panel's own face. (app: `PANEL`)
    pub card: Color32,
    /// `--case-face` / dark `--case` — a plain key's cap, milled from the case. (app: `PANEL_ALT`)
    pub case_face: Color32,
    /// `--card-hover` / dark `--plate-hi`. (app: `PANEL_HI`)
    pub card_hover: Color32,
    /// `--edge` / dark `--border` — a hairline. (app: `BORDER`)
    pub edge: Color32,
    /// `--edge-ctl` / dark `--case-hi` — the edge of a *control*, which is stronger
    /// than a hairline because it is the wall a cap stands on. (app: `BORDER_STRONG`)
    pub edge_ctl: Color32,

    // ── ink ─────────────────────────────────────────────────────────────────
    /// `--ink` / dark `--txt`. (app: `TEXT`)
    pub ink: Color32,
    /// `--ink-2` / dark `--txt-dim`. (app: `MUTED`)
    pub ink_2: Color32,
    /// `--ink-3` / dark `--txt-etch` — marks and hints only, never a value. (app: `FAINT`)
    pub ink_3: Color32,

    // ── accent ──────────────────────────────────────────────────────────────
    /// `--primary`. (app: `ACCENT`)
    pub primary: Color32,
    /// `--primary-light` / dark `--led-hot`. (app: `ACCENT_HI` / `ACCENT_DIM`)
    pub primary_light: Color32,
    /// `--primary-subtle` — the accent as a *fill*. Dark has no such token, and the
    /// fallback is `--case`: in the dark skin an accented surface is not tinted, it
    /// is lit, so "no tint" is the honest answer rather than a mixed one. (app: `ACCENT_SOFT`)
    pub primary_subtle: Color32,
    /// `--primary-deep` / dark `--primary` (dark names no deeper step). (app: `ACCENT_DEEP`)
    pub primary_deep: Color32,
    /// `--ring-color` — the focus ring, `--primary-ink` in light and `--primary` in
    /// dark. A token in both skins, so no fallback. (app: `ACCENT_INK`)
    pub ring: Color32,

    // ── semantic ────────────────────────────────────────────────────────────
    /// `--ok-ink` — readable on the surface, which `--ok` is not. (app: `GOOD`)
    pub ok_ink: Color32,
    /// `--no`. (app: `BAD`)
    pub no: Color32,
    /// `--no-bg`. (app: `BAD_BG`)
    pub no_bg: Color32,
    /// `--no-edge`. (app: `BAD_EDGE`)
    pub no_edge: Color32,
    /// `--no-ink`. (app: `NO_INK`)
    pub no_ink: Color32,
    /// `--info`, and `None` in dark **on purpose** — `docs/PORTING.md`: no app has a
    /// dark one, and picking a blue for a near-black panel with nothing to check it
    /// against is the guess the manifest exists to stop. An app that needs one in
    /// dark answers for it. (app: `INFO`)
    pub info: Option<Color32>,

    // ── parts ───────────────────────────────────────────────────────────────
    /// The lit cap. **The one value here that is not a token**: `#E06728`, warmer
    /// than the docs render and short of neon, tuned in the pen-plotter app and
    /// approved there. `--primary` straight out of the palette is too hot for a
    /// cap this size on cream. In dark the cap is simply `--led`.
    pub key_lit: Color32,
    /// The fader's LCD window, and matte: `--font-read` digits on warm grey, no
    /// bloom (`docs/PORTING.md` §3 — a readout on cream is e-paper). Dark falls back
    /// to `--groove` / `--led`, and the glow that skin's CSS puts on it is a drawing
    /// this crate does not do.
    ///
    /// **This is not `epaper`**, and the two disagree. The fader's window was tuned
    /// in the pen-plotter app at `#E9E5DD` / `#6F6A60`; the system's own glass is
    /// `--epaper` `#D0CBC1` / `#23211C`, a stop darker. Same part, two values — the
    /// drift this crate exists to end, recorded rather than silently resolved.
    pub lcd_face: Color32,
    pub lcd_ink: Color32,
    /// `--epaper` — the glass every lit window in this skin is cut from: 1.40:1
    /// under the case, never white. Dark falls back to `--groove`.
    pub epaper: Color32,
    /// `--epaper-ink` — 9.95:1 on that glass. Dark falls back to `--txt`; the dark
    /// skin's own `#7CFFB0` phosphor and its glow are a drawing, not a token, and
    /// `docs/PORTING.md` §3 rules on both.
    pub epaper_ink: Color32,
    /// `--epaper-bezel` — the frame round the glass, 2.14:1 against the case.
    pub epaper_bezel: Color32,

    /// The light on the module's moulded top edge — see [`crate::glass`] — as
    /// **its brightest alpha in levels of 255**, which is the only unit this effect has: it runs
    /// in the first three or four levels and a per cent of the stylesheet's own
    /// alphas is a control whose travel is mostly nothing (see [`crate::glass`]).
    /// Dark is zero, because that skin's window is lit from inside and the room
    /// is not in it.
    pub glass_streak: f32,
    /// The ceiling on the top of the glass, same unit. **Separate from the
    /// panes on purpose**: one is the room's geometry arriving at a surface and
    /// the other is ambient light on it, they are judged against different
    /// things, and tuning them together means never getting either one right.
    pub glass_sheen: f32,

    // ── geometry ────────────────────────────────────────────────────────────
    /// `--r` (16) — a panel's radius.
    pub r: f32,
    /// `--r-key` (7).
    pub r_key: f32,
    /// `--r-sm` (10) — the light-skin key radius.
    pub r_sm: f32,
    /// `--r-mod` (11).
    pub r_mod: f32,
}

impl Theme {
    pub fn light() -> Self {
        Self::new(Skin::Light)
    }
    pub fn dark() -> Self {
        Self::new(Skin::Dark)
    }

    pub fn new(skin: Skin) -> Self {
        let pal = match skin {
            Skin::Light => Palette::light(),
            Skin::Dark => Palette::dark(),
        };
        Theme {
            skin,
            pal,
            paper: pal.paper.unwrap_or(pal.room),
            card: pal.card.unwrap_or(pal.plate),
            case_face: pal.case_face.unwrap_or(pal.case),
            card_hover: pal.card_hover.unwrap_or(pal.plate_hi),
            edge: pal.edge.unwrap_or(pal.border),
            edge_ctl: pal.edge_ctl.unwrap_or(pal.case_hi),
            ink: pal.ink.unwrap_or(pal.txt),
            ink_2: pal.ink_2.unwrap_or(pal.txt_dim),
            ink_3: pal.ink_3.unwrap_or(pal.txt_etch),
            primary: pal.primary,
            primary_light: pal.primary_light.unwrap_or(pal.led_hot),
            primary_subtle: pal.primary_subtle.unwrap_or(pal.case),
            primary_deep: pal.primary_deep.unwrap_or(pal.primary),
            ring: pal.ring_color,
            ok_ink: pal.ok_ink,
            no: pal.no,
            no_bg: pal.no_bg,
            no_edge: pal.no_edge,
            no_ink: pal.no_ink,
            info: pal.info,
            key_lit: match skin {
                Skin::Light => hex(0xE06728),
                Skin::Dark => pal.led,
            },
            lcd_face: match skin {
                Skin::Light => hex(0xE9E5DD),
                Skin::Dark => pal.groove,
            },
            lcd_ink: match skin {
                Skin::Light => hex(0x6F6A60),
                Skin::Dark => pal.led,
            },
            // src/skew.css — declared on the light block beside --surround
            epaper: match skin {
                Skin::Light => hex(0xD0CBC1),
                Skin::Dark => pal.groove,
            },
            epaper_ink: match skin {
                Skin::Light => hex(0x23211C),
                Skin::Dark => pal.txt,
            },
            epaper_bezel: match skin {
                Skin::Light => hex(0xA9A49A),
                Skin::Dark => pal.case_lo,
            },
            // judged on the running gallery against the DRO, which is the
            // widest piece of glass in the language and the worst case
            glass_streak: match skin {
                Skin::Light => 7.0,
                Skin::Dark => 0.0,
            },
            glass_sheen: match skin {
                Skin::Light => 5.0,
                Skin::Dark => 0.0,
            },
            r: pal.r,
            r_key: pal.r_key,
            r_sm: pal.r_sm,
            r_mod: pal.r_mod,
        }
    }

    /// Is this fill a plain cap, milled from the case — or a pigment?
    ///
    /// The two are drawn differently: a plain cap is a flat fill with a hairline,
    /// a pigment cap gets the gradient mesh and a wall mixed from its own colour.
    /// The pen-plotter app asked `is_light(fill)`, which is the same answer on
    /// cream and the wrong one on a dark palette — on black every plain key would
    /// come out as pigment. The question it was really asking is this one.
    pub fn is_plain(&self, fill: Color32) -> bool {
        fill == self.card || fill == self.case_face || fill == self.paper || fill == self.card_hover
    }

    /// Fonts, visuals and spacing. Call once, at startup, after the palette is
    /// chosen.
    ///
    /// THIS IS THE ONE-CALL PATH AND IT INSTALLS FONTS. If your app has a font
    /// of its own, this is the wrong door: it calls [`install_fonts`], which
    /// calls `set_fonts`, which REPLACES — so it would undo the set you just
    /// installed, whichever order the two run in. Use [`add_fonts`] with your
    /// own faces and then [`Theme::apply_no_fonts`].
    pub fn apply(&self, ctx: &egui::Context) {
        install_fonts(ctx);
        self.apply_no_fonts(ctx);
    }

    /// Visuals and spacing, and NOT fonts.
    ///
    /// FOR AN APP THAT OWNS ITS OWN `FontDefinitions`. There is exactly one of
    /// those in a program and exactly one place it is installed, and that
    /// place belongs to whoever owns `main` — a crate that calls `set_fonts`
    /// has taken the host's decision away from it. So the host builds the set,
    /// adds its own faces, calls [`add_fonts`] to add Skew's, installs it
    /// once, and then calls this for everything else.
    ///
    /// ```no_run
    /// # let ctx = egui::Context::default();
    /// # let theme = skew_egui::Theme::new(skew_egui::Skin::Dark);
    /// let mut defs = egui::FontDefinitions::default();
    /// // ... the app's own faces ...
    /// skew_egui::add_fonts(&mut defs);
    /// ctx.set_fonts(defs);
    /// theme.apply_no_fonts(&ctx);
    /// ```
    pub fn apply_no_fonts(&self, ctx: &egui::Context) {
        let mut v = match self.skin {
            Skin::Light => egui::Visuals::light(),
            Skin::Dark => egui::Visuals::dark(),
        };
        v.panel_fill = self.paper;
        v.window_fill = self.card;
        v.window_rounding = Rounding::same(self.r_mod);
        v.window_stroke = Stroke::new(1.0, self.edge_ctl);
        v.extreme_bg_color = self.card;
        v.faint_bg_color = self.case_face;
        v.override_text_color = Some(self.ink);
        v.selection.bg_fill = self.primary_subtle;
        v.selection.stroke = Stroke::new(1.0, self.primary);
        for w in [
            &mut v.widgets.inactive,
            &mut v.widgets.hovered,
            &mut v.widgets.active,
            &mut v.widgets.noninteractive,
            &mut v.widgets.open,
        ] {
            w.rounding = Rounding::same(self.r_key);
        }
        v.widgets.inactive.bg_fill = self.case_face;
        v.widgets.inactive.weak_bg_fill = self.case_face;
        v.widgets.inactive.bg_stroke = Stroke::new(1.0, self.edge);
        v.widgets.hovered.bg_fill = self.card_hover;
        v.widgets.hovered.weak_bg_fill = self.card_hover;
        v.widgets.hovered.bg_stroke = Stroke::new(1.0, self.edge_ctl);
        v.widgets.active.bg_fill = self.primary_subtle;
        v.widgets.active.weak_bg_fill = self.primary_subtle;
        v.widgets.active.bg_stroke = Stroke::new(1.0, self.primary);
        v.widgets.noninteractive.bg_stroke = Stroke::new(1.0, self.edge);
        v.slider_trailing_fill = true;
        ctx.set_visuals(v);
        let mut st = (*ctx.style()).clone();
        st.spacing.item_spacing = Vec2::new(self.pal.space_3, self.pal.space_3);
        st.spacing.button_padding = Vec2::new(10.0, 5.0);
        ctx.set_style(st);
    }
}

/// ADD Skew's faces to a set the host is building.
///
/// THIS IS THE ONE THE HOST WANTS, AND [`install_fonts`] IS THE CONVENIENCE.
/// `Context::set_fonts` REPLACES — it does not merge — so a crate that calls
/// it is a crate that deletes whatever families the app had registered. An app
/// with a font of its own (a terminal face, a brand face) adopts one part that
/// calls [`read_font`] and panics inside epaint the first time anything asks
/// for the family that got erased:
///
/// ```text
/// FontFamily::Name("silkscreen") is not bound to any fonts
/// ```
///
/// Whichever of the two `set_fonts` calls runs last wins, so the failure
/// depends on initialisation order and looks like a bug in the app. It is not;
/// it is this crate having taken a decision that is the HOST'S to take. There
/// is exactly one `FontDefinitions` in a program and exactly one place it is
/// installed, and that place belongs to whoever owns `main`.
///
/// So: the host builds the set, adds its own faces, calls this to add Skew's,
/// and installs it once.
///
/// ```no_run
/// # let ctx = egui::Context::default();
/// let mut defs = egui::FontDefinitions::default();
/// // ... the app's own faces go in here ...
/// skew_egui::add_fonts(&mut defs);
/// ctx.set_fonts(defs);
/// ```
///
/// It EXTENDS rather than assumes: the monospace fallback behind Silkscreen is
/// read off the set it is handed, so an app that has already put its own face
/// into `Monospace` keeps it as the fallback and does not get the default one
/// back.
pub fn add_fonts(defs: &mut egui::FontDefinitions) {
    defs.font_data.insert(
        "silkscreen".into(),
        egui::FontData::from_static(include_bytes!("../assets/silkscreen-400.ttf")),
    );
    defs.font_data.insert(
        "silkscreen-bold".into(),
        egui::FontData::from_static(include_bytes!("../assets/silkscreen-700.ttf")),
    );
    let mut fam: Vec<String> = vec!["silkscreen".into()];
    fam.extend(
        defs.families
            .get(&egui::FontFamily::Monospace)
            .cloned()
            .unwrap_or_default(),
    );
    defs.families
        .insert(egui::FontFamily::Name("silkscreen".into()), fam);
    defs.families.insert(
        egui::FontFamily::Name("silkscreen-bold".into()),
        vec!["silkscreen-bold".into()],
    );
}

/// Register Silkscreen as the `"silkscreen"` family — `--font-read`, the pixel
/// readout face, embedded as TTF because egui has no woff2 decoder.
///
/// THE ONE-CALL CASE, for an app that has no fonts of its own. It builds a
/// default set, adds Skew's, and installs it. [`Theme::apply`] calls this, so
/// a plain app needs to know none of it.
///
/// IF YOUR APP HAS A FONT OF ITS OWN, DO NOT USE THIS — use [`add_fonts`]. Two
/// calls to `set_fonts` leave only the last one's families, whichever way
/// round they go, and the loser panics in epaint. See `add_fonts`.
pub fn install_fonts(ctx: &egui::Context) {
    let mut fonts = egui::FontDefinitions::default();
    add_fonts(&mut fonts);
    ctx.set_fonts(fonts);
}

/// `--font-read` at `size`. Silkscreen is a bitmap face on a five-pixel grid:
/// `version.js` 1.112.0 records why a readout is set in the REGULAR weight —
/// the bold is a second drawing and its counters close up at readout sizes.
pub fn read_font(size: f32) -> FontId {
    FontId::new(size, egui::FontFamily::Name("silkscreen".into()))
}

/// `--font-mono`, the label and key face.
pub fn mono(t: impl Into<String>, size: f32) -> RichText {
    RichText::new(t).font(FontId::monospace(size))
}

/// How many colours the identity ramp has.
pub const ID_RAMP_LEN: usize = 12;

/// `--id-1` … `--id-12` BY INDEX, which is the only way anyone actually wants
/// them.
///
/// THE RAMP IS AN INDEX WEARING A HUE. `--ok` is green because the thing is
/// running; these twelve mean nothing — a host is not blue because it is cold,
/// it is blue because it is not the green one, and the next host is green
/// because the blue is taken. So every consumer has an integer and not a name:
/// `host.color` is a `usize`, `LOCAL_TAB_COLORS[i]` is a `usize`, a layer
/// number is a `usize`.
///
/// `Palette` CANNOT GIVE THEM BACK THAT WAY. It is a generated struct with
/// twelve named fields and no indexer, because `tokens.mjs` emits one field
/// per `:root` declaration and knows nothing about ramps. Without this, every
/// app that wants the third colour writes its own twelve-arm match — not an
/// invented value, but twelve lines of this crate's business living somewhere
/// it cannot be fixed from.
///
/// It wraps, because the ramp's whole claim is that it extends without a
/// reshuffle and an app with thirteen hosts is not an error.
pub fn id_color(th: &Theme, i: usize) -> egui::Color32 {
    let p = &th.pal;
    [
        p.id_1, p.id_2, p.id_3, p.id_4, p.id_5, p.id_6,
        p.id_7, p.id_8, p.id_9, p.id_10, p.id_11, p.id_12,
    ][i % ID_RAMP_LEN]
}
