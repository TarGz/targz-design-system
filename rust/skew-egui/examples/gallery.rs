//! The running visual reference — **built as the documentation site is built**.
//!
//!     cargo run --example gallery            # light skin
//!     cargo run --example gallery -- dark    # the same parts, dark palette
//!
//! One nav bar, one centred column, and the same numbered sections the six HTML
//! pages carry, in the same order and under the same names. A section the crate
//! cannot draw yet is **still a section**, with a placeholder naming what is
//! missing — a gallery that shows only what exists cannot tell you what does
//! not, and `PARITY.md` is a table rather than something you can look at.
//!
//! The palette is read once, at startup, which is the whole point of `Palette`
//! being a struct and not a wall of `pub const`. The skin key in the bar reports
//! the skin; it does not change it.
//!
//! Hover and pressed are **posed** with `paint_key` / `paint_fader`, so every
//! state of a part is on screen at once and can be compared without moving
//! anything.

use egui::{vec2, Align, Color32, Layout, Rect, Sense, Ui, Vec2};
use skew_egui::{
    btn, colored_btn, cut, dro, fader, jog_pad, key, knob, slide, KnobKind, SlideKind, backlit, chevron, icon_key, micro, sep, Icon, label, lcd, mono, nav_bar, paint_fader,
    paint_key, panel, panel_frame, pkey_bar, read_font, well_frame, well_shadow, FaderState,
    JogPress, KeyState, KeyStyle, Nav, NavHit, Skin, Theme,
    act, module_card, paint_well, paint_icon, surround, version_readout, ActStyle,
    ModuleHit, ModuleView, Part, PullHit, PullState, VerState, MODULE_MIN_W,
};

/// One project on the launcher's rack, and what its pull will do in the demo.
struct Proj {
    name: &'static str,
    folder: &'static str,
    port: u16,
    up: bool,
    desc: &'static str,
    tags: &'static [&'static str],
    pull: Option<PullState>,
    t0: f64,
    ok: bool,
    msg: &'static str,
    hide_at: f64,
}

fn projects() -> Vec<Proj> {
    let p = |name, port, up, desc, tags, ok, msg| Proj {
        name, folder: "Portrait", port, up, desc, tags, pull: None, t0: 0.0, ok, msg, hide_at: 0.0,
    };
    vec![
        p("Portrait-Typo", 2857, true,
          "Generative portrait engine — 3D letters dropped into a virtual box under gravity, settled by physics, then flattened into a hatch-filled pen-plotter drawing.",
          &["dev"], true, "3 files changed · 41 insertions(+), 9 deletions(−)"),
        p("Portrait-ribbons", 2855, true,
          "Generative portrait engine — 3D ribbons on a flow field, twisting from face-on to edge-on to draw a portrait in white on black.",
          &["dev"], true, "Already up to date."),
        p("Portrait-Cubes", 2851, true,
          "Generative isometric cube grid with hatching for pen plotter — portrait encoding via grayscale density.",
          &["dev", "start"], false, "fatal: Not possible to fast-forward, aborting."),
        p("Portrait-DNA", 2853, false,
          "Generative portrait engine — DNA-shaped pattern layered over a portrait image, plotter-ready.",
          &["dev"], false, "error: your local changes to settings.json would be overwritten"),
    ]
}

const FOLDERS: [&str; 5] = ["Running", "All", "Portrait", "Razo", "Web"];

/// The nav registry and every page's sections, from `docs/skew-nav.js` and the
/// `<h2>` of each document. The bar and this list cannot disagree — the same
/// reason the web one reads its pages from one array.
const PAGES: [(&str, &str, &[&str]); 5] = [
    (
        "SYSTEM",
        "The parts, and the rules that make them one language",
        &[
            "The factories",
            "Surfaces",
            "The tokens",
            "The primitives",
            "Knob layouts",
            "The toggle",
            "The interlock",
            "The nav bar",
            "The app dock",
            "The settings panel",
            "The room and the sheet",
            "The orbit ball",
            "The progress track",
            "The modal",
            "Traps",
        ],
    ),
    (
        "PANELS",
        "The drawing side — Portrait-Typo rebuilt as hardware",
        &[
            "The layer dock",
            "The layer editor",
            "The viewport",
            "The hatch bay",
            "Windows",
            "Launchpad",
        ],
    ),
    (
        "MACHINE",
        "The machine side — jog by keys against jog by stick",
        &[
            "The jog pad",
            "The jog stick",
            "The pen bank",
            "Run",
            "The overrides",
            "The status rail",
            "The job meter",
            "The annunciator",
            "The tape",
        ],
    ),
    (
        "HATCH",
        "The fill engine — one contract, three layers",
        &[
            "The contract",
            "The three layers",
            "The fills",
            "The API",
            "Contributing",
        ],
    ),
    (
        "NEXTDRAW",
        "A screen, not an app",
        &[
            "Locked",
            "Files",
            "Plot",
            "Run",
            "Jog",
            "Set",
            "What is deliberately not here",
        ],
    ),
];

const COLUMN: f32 = 1000.0;
const KEY: Vec2 = Vec2 { x: 104.0, y: 34.0 };
const STATES: [(KeyState, &str); 4] = [
    (KeyState::Raised, "RAISED"),
    (KeyState::Hover, "HOVER"),
    (KeyState::Pressed, "PRESSED"),
    (KeyState::Disabled, "DISABLED"),
];

struct Gallery {
    th: Theme,
    page: usize,
    toggle: bool,
    latched: bool,
    ink: f32,
    speed: f32,
    power: f32,
    live: String,
    pos: [f32; 3],
    driven: bool,
    step: usize,
    units: usize,
    nav_demo: usize,
    pot: f32,
    heading: f32,
    bank: [f32; 3],
    slides: [bool; 4],
    lit: [bool; 3],
    sun: bool,
    chev_open: bool,
    rack: Vec<Proj>,
    lp_folder: usize,
    lp_q: String,
    ver: VerState,
    ver_t0: f64,
    ver_n: usize,
    ver_cur: String,
}

impl Gallery {
    fn new(th: Theme) -> Self {
        Gallery {
            th,
            page: 0,
            toggle: false,
            latched: true,
            ink: 62.0,
            speed: 80.0,
            power: 35.0,
            live: "—".into(),
            pos: [0.0, 0.0, 0.0],
            driven: false,
            step: 1,
            units: 0,
            nav_demo: 1,
            pot: 62.0,
            heading: 147.0,
            bank: [34.0, 71.0, 52.0],
            slides: [true, false, true, false],
            lit: [true, false, true],
            sun: true,
            chev_open: false,
            rack: projects(),
            lp_folder: 1,
            lp_q: String::new(),
            ver: VerState::Idle("2.3.0".into()),
            ver_t0: 0.0,
            ver_n: 0,
            ver_cur: "2.3.0".into(),
        }
    }

    // ── the shell ───────────────────────────────────────────────────────────

    /// A section the crate has nothing for yet: it names the part, so the hole
    /// is something you can read rather than a gap.
    fn open(&self, ui: &mut Ui, what: &str) {
        let th = self.th;
        let w = well_frame(&th).show(ui, |ui| {
            ui.set_width(ui.available_width() - 14.0);
            ui.add_space(8.0);
            ui.horizontal(|ui| {
                ui.add_space(6.0);
                ui.label(mono("OPEN", 9.0).color(th.ink_3));
                ui.add_space(8.0);
                ui.label(mono(what, 9.5).color(th.ink_2));
            });
            ui.add_space(8.0);
        });
        well_shadow(ui, &th, w.response.rect);
    }

    /// A posed cell: a rect, a caption under it, no interaction.
    fn pose(&self, ui: &mut Ui, size: Vec2, cap: &str, draw: impl FnOnce(&egui::Painter, Rect)) {
        ui.vertical(|ui| {
            let (rect, _) = ui.allocate_exact_size(size, Sense::hover());
            if ui.is_rect_visible(rect) {
                draw(ui.painter(), rect);
            }
            ui.add_space(4.0);
            ui.label(mono(cap, 8.5).color(self.th.ink_3));
        });
    }

    /// One row: the same key in all four drawings, plus the latch.
    fn key_row(&self, ui: &mut Ui, style: KeyStyle, text: &str, latch: bool) {
        ui.horizontal(|ui| {
            for (state, cap) in STATES {
                self.pose(ui, KEY, cap, |p, rect| {
                    paint_key(p, &self.th, rect, text, &style, state)
                });
            }
            if latch {
                let lit = KeyStyle {
                    latched: true,
                    ..style
                };
                self.pose(ui, KEY, "LATCHED", |p, rect| {
                    paint_key(p, &self.th, rect, text, &lit, KeyState::Raised)
                });
            }
        });
    }

    // ── the sections that draw something ────────────────────────────────────

    fn factories(&mut self, ui: &mut Ui) {
        let th = self.th;
        self.key_row(ui, KeyStyle::new(th.card, th.ink), "STEP", true);
        ui.add_space(10.0);
        self.key_row(
            ui,
            KeyStyle {
                text_size: 12.0,
                ..KeyStyle::new(th.primary, Color32::WHITE)
            },
            "▶ START",
            false,
        );
        ui.add_space(10.0);
        self.key_row(
            ui,
            KeyStyle {
                text_size: 12.0,
                ..KeyStyle::new(th.no, Color32::WHITE)
            },
            "⊗ ABORT",
            false,
        );
        ui.add_space(4.0);
        self.key_row(
            ui,
            KeyStyle {
                text_size: 12.0,
                ..KeyStyle::new(th.card, th.no)
            },
            "■ STOP",
            false,
        );
        ui.add_space(16.0);
        cut(ui, &th, "LIVE · HOVER AND PRESS THESE");
        ui.add_space(10.0);
        ui.horizontal(|ui| {
            if key(ui, &th, "STEP", &KeyStyle::new(th.card, th.ink), KEY, true, false).clicked() {
                self.live = "STEP".into();
            }
            if colored_btn(ui, &th, "▶ START", th.primary, Color32::WHITE, KEY, true).clicked() {
                self.live = "START".into();
            }
            if colored_btn(ui, &th, "⊗ ABORT", th.no, Color32::WHITE, KEY, true).clicked() {
                self.live = "ABORT".into();
            }
            colored_btn(ui, &th, "|| PAUSE", th.card, th.ink_2, KEY, false);
        });
        ui.add_space(8.0);
        ui.horizontal(|ui| {
            label(ui, &th, "LAST");
            ui.label(mono(&self.live, 10.0).color(th.ok_ink));
        });
    }

    fn surfaces(&mut self, ui: &mut Ui) {
        let th = self.th;
        ui.horizontal_top(|ui| {
            let col = Layout::top_down(Align::Min);
            ui.allocate_ui_with_layout(vec2(292.0, 0.0), col, |ui| {
                panel_frame(&th, th.card).show(ui, |ui| {
                    ui.set_width(260.0);
                    label(ui, &th, "A CARD FILL, PADDING, NO SECOND FRAME");
                    ui.add_space(8.0);
                    let w = well_frame(&th).show(ui, |ui| {
                        ui.set_width(228.0);
                        ui.label(mono("ok  ready  idle  0 queued", 9.5).color(th.ink_2));
                    });
                    well_shadow(ui, &th, w.response.rect);
                });
            });
            ui.add_space(12.0);
            ui.allocate_ui_with_layout(vec2(232.0, 0.0), col, |ui| {
                panel_frame(&th, th.card).show(ui, |ui| {
                    ui.set_width(200.0);
                    for (ax, val) in [("X", "128.40"), ("Y", "-64.00"), ("Z", "3.20")] {
                        ui.horizontal(|ui| {
                            ui.label(mono(ax, 9.5).color(th.ink_3));
                            ui.label(egui::RichText::new(val).font(read_font(13.0)).color(th.ink));
                        });
                    }
                    ui.add_space(6.0);
                    label(ui, &th, "SILKSCREEN · --FONT-READ · MATTE");
                });
            });
        });
    }

    fn toggle_section(&mut self, ui: &mut Ui) {
        let th = self.th;
        ui.horizontal(|ui| {
            if btn(ui, &th, "LASER", self.toggle, KEY).clicked() {
                self.toggle = !self.toggle;
                self.live = format!("LASER {}", if self.toggle { "ON" } else { "OFF" });
            }
            if btn(ui, &th, "MM", self.latched, vec2(54.0, 34.0)).clicked() {
                self.latched = !self.latched;
            }
            ui.add_space(12.0);
            label(ui, &th, "A TOGGLE KEY LATCHES BY LIGHTING ITS CAP");
        });
        ui.add_space(20.0);
        // SLIDE SWITCH: A on / off, then B on / off, as § Pressing lays them out
        ui.vertical(|ui| {
            ui.horizontal(|ui| {
                ui.spacing_mut().item_spacing.x = 18.0;
                let kinds = [SlideKind::Grip, SlideKind::Grip, SlideKind::Pill, SlideKind::Pill];
                for (i, kind) in kinds.into_iter().enumerate() {
                    let mut v = self.slides[i];
                    if slide(ui, &th, &format!("slide{i}"), &mut v, kind).clicked() {
                        self.live = format!("SLIDE {} {}", i + 1, if v { "ON" } else { "OFF" });
                    }
                    self.slides[i] = v;
                }
            });
            ui.add_space(8.0);
            ui.label(mono("SLIDE SWITCH", 8.5).color(th.ink_2));
        });
    }

    fn interlock(&mut self, ui: &mut Ui) {
        let th = self.th;
        pkey_bar(
            ui,
            &th,
            &["0.1", "1", "10", "100"],
            &mut self.step,
            vec2(58.0, 34.0),
        );
        ui.add_space(10.0);
        label(
            ui,
            &th,
            "A KEY IN A BAR LATCHES BY GOING DOWN — IT REPORTS A POSITION",
        );
    }

    fn nav_section(&mut self, ui: &mut Ui) {
        let th = self.th;
        let ver = format!("V{}", env!("CARGO_PKG_VERSION"));
        let nav = Nav {
            brand: "SKEW",
            pages: &["SYSTEM", "PANELS", "MACHINE", "HATCH", "NEXTDRAW"],
            version: &ver,
            light: th.skin == Skin::Light,
        };
        nav_bar(ui, &th, &nav, &mut self.nav_demo);
        ui.add_space(10.0);
        label(ui, &th, "ONE CHANNEL: DOCUMENTS LEFT, THE TOOLS RIGHT");
    }

    fn jog(&mut self, ui: &mut Ui) {
        let th = self.th;
        ui.horizontal_top(|ui| {
            let col = Layout::top_down(Align::Min);
            ui.allocate_ui_with_layout(vec2(320.0, 0.0), col, |ui| {
                panel(ui, &th, "POSITION", Some("G54"), |ui| {
                    const AX: [(&str, Color32, f32, f32); 3] = [
                        ("X", Color32::from_rgb(0xEF, 0x44, 0x44), -10.0, 600.0),
                        ("Y", Color32::from_rgb(0x22, 0xC5, 0x5E), -10.0, 420.0),
                        ("Z", Color32::from_rgb(0x5B, 0x6C, 0xFF), -30.0, 10.0),
                    ];
                    for (i, (name, col, lo, hi)) in AX.into_iter().enumerate() {
                        let v = self.pos[i];
                        let t = (v - lo) / (hi - lo);
                        if dro(ui, &th, name, col, &format!("{:.3}", v), t, self.driven).clicked() {
                            self.pos[i] = 0.0;
                            self.live = format!("{} ZEROED", name);
                        }
                    }
                    ui.horizontal(|ui| {
                        label(ui, &th, "FEED");
                        lcd(ui, &th, if self.driven { "2400" } else { "0" });
                        ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                            let r = key(
                                ui,
                                &th,
                                "DEMO",
                                &KeyStyle::new(th.card, th.ink),
                                vec2(64.0, 26.0),
                                true,
                                true,
                            );
                            // momentary: it drives the strip while it is held
                            self.driven = r.is_pointer_button_down_on();
                            if self.driven {
                                let t = ui.input(|i| i.time) as f32;
                                self.pos[0] = 297.0 + (t * 1.1).sin() * 240.0;
                                self.pos[1] = 210.0 + (t * 0.7).cos() * 170.0;
                                self.pos[2] = -4.5;
                                ui.ctx().request_repaint();
                            }
                        });
                    });
                });
            });
            ui.add_space(14.0);
            ui.allocate_ui_with_layout(vec2(320.0, 0.0), col, |ui| {
                let chip = format!(
                    "{} {}",
                    ["0.100", "1.000", "10.00", "100.0"][self.step],
                    if self.units == 0 { "MM" } else { "IN" }
                );
                panel(ui, &th, "JOG", Some(&chip), |ui| {
                    if let Some(p) = jog_pad(ui, &th, true) {
                        self.live = match p {
                            JogPress::Step { axis, dir } => format!(
                                "JOG {}{}",
                                ["X", "Y", "Z"][axis],
                                if dir > 0 { "+" } else { "−" }
                            ),
                            JogPress::Home => "HOME".into(),
                        };
                    }
                    cut(ui, &th, "STEP");
                    pkey_bar(
                        ui,
                        &th,
                        &["0.1", "1", "10", "100"],
                        &mut self.step,
                        vec2(58.0, 34.0),
                    );
                    cut(ui, &th, "UNITS");
                    pkey_bar(ui, &th, &["MM", "IN"], &mut self.units, vec2(124.0, 34.0));
                    cut(ui, &th, "UTILITY");
                    ui.horizontal(|ui| {
                        for t in ["PROBE Z", "GO TO XY0", "CHECK SIZE"] {
                            if key(
                                ui,
                                &th,
                                t,
                                &KeyStyle {
                                    text_size: 9.0,
                                    ..KeyStyle::new(th.card, th.ink)
                                },
                                vec2(82.0, 30.0),
                                true,
                                false,
                            )
                            .clicked()
                            {
                                self.live = t.into();
                            }
                        }
                    });
                });
            });
        });
    }

    /// KNOB, KNOB · ENDLESS and FADER · VERTICAL BANK, live.
    fn knobs(&mut self, ui: &mut Ui) {
        let th = self.th;
        let cap = |ui: &mut Ui, t: &str| {
            ui.add_space(8.0);
            ui.label(mono(t, 8.5).color(th.ink_2));
        };
        ui.horizontal_top(|ui| {
            ui.vertical(|ui| {
                let (c, _) = knob(ui, &th, "pot", &mut self.pot, 0.0, 100.0, KnobKind::Pot, |v| format!("{v:.0}"));
                if c {
                    self.live = format!("KNOB {:.0}", self.pot);
                }
                cap(ui, "KNOB");
            });
            ui.add_space(60.0);
            ui.vertical(|ui| {
                let (c, _) = knob(ui, &th, "heading", &mut self.heading, -180.0, 180.0, KnobKind::Endless, |v| format!("{v:.0}°"));
                if c {
                    self.live = format!("KNOB · ENDLESS {:.0}°", self.heading);
                }
                cap(ui, "KNOB · ENDLESS");
            });
        });
        ui.add_space(24.0);
        ui.vertical(|ui| {
            let f = egui::Frame::none()
                .fill(th.case_face)
                .stroke(egui::Stroke::new(1.0, th.edge))
                .rounding(egui::Rounding::same(th.r))
                .inner_margin(egui::Margin { left: 16.0, right: 16.0, top: 14.0, bottom: 16.0 });
            f.show(ui, |ui| {
                ui.spacing_mut().item_spacing.x = 10.0;
                ui.horizontal_top(|ui| {
                    let [lo, mid, hi] = &mut self.bank;
                    let (a, _) = fader(ui, &th, "LOW", lo, 0.0, 100.0);
                    let (b, _) = fader(ui, &th, "MID", mid, 0.0, 100.0);
                    let (c, _) = fader(ui, &th, "HIGH", hi, 0.0, 100.0);
                    if a || b || c {
                        self.live = format!("LOW {:.0} · MID {:.0} · HIGH {:.0}", lo, mid, hi);
                    }
                });
            });
            cap(ui, "FADER · VERTICAL BANK");
        });
    }

    /// § Pressing: BACKLIT KEY, MOMENTARY VS LATCHING, MICRO KEY, KNURLED CHEVRON.
    fn pressing(&mut self, ui: &mut Ui) {
        let th = self.th;
        let cap = |ui: &mut Ui, t: &str| {
            ui.add_space(10.0);
            ui.label(mono(t, 8.5).color(th.ink_2));
        };
        ui.horizontal_top(|ui| {
            ui.vertical(|ui| {
                ui.horizontal(|ui| {
                    ui.spacing_mut().item_spacing.x = 10.0;
                    for i in 0..3 {
                        let mut v = self.lit[i];
                        if backlit(ui, &th, Icon::Eye, &mut v).clicked() {
                            self.live = format!("BACKLIT {} {}", i + 1, if v { "ON" } else { "OFF" });
                        }
                        self.lit[i] = v;
                    }
                });
                cap(ui, "BACKLIT KEY");
            });
            ui.add_space(48.0);
            ui.vertical(|ui| {
                ui.horizontal(|ui| {
                    ui.spacing_mut().item_spacing.x = 11.0;
                    if icon_key(ui, &th, Icon::Upload, None).clicked() {
                        self.live = "MOMENTARY · SPRANG BACK".into();
                    }
                    if icon_key(ui, &th, Icon::Sun, Some(&mut self.sun)).clicked() {
                        self.live = format!("LATCHING {}", if self.sun { "DOWN" } else { "UP" });
                    }
                });
                cap(ui, "MOMENTARY VS LATCHING");
            });
            ui.add_space(48.0);
            ui.vertical(|ui| {
                ui.horizontal(|ui| {
                    ui.spacing_mut().item_spacing.x = 5.0;
                    if micro(ui, &th, Icon::Copy, false).clicked() {
                        self.live = "DUPLICATE".into();
                    }
                    if micro(ui, &th, Icon::Trash, true).clicked() {
                        self.live = "DELETE".into();
                    }
                });
                cap(ui, "MICRO KEY");
            });
            ui.add_space(48.0);
            ui.vertical(|ui| {
                ui.horizontal(|ui| {
                    ui.spacing_mut().item_spacing.x = 5.0;
                    sep(ui, &th);
                    if chevron(ui, &th, "chev", &mut self.chev_open).clicked() {
                        self.live = format!("CHEVRON {}", if self.chev_open { "OPEN" } else { "CLOSED" });
                    }
                });
                cap(ui, "KNURLED CHEVRON");
            });
        });
    }

    // ── 06 / LAUNCHPAD ──────────────────────────────────────────────────────

    /// Move every timed thing on the console one frame on: pulls in flight,
    /// done lines leaving, and the version check's state machine.
    fn lp_tick(&mut self, ctx: &egui::Context) {
        let now = ctx.input(|i| i.time);
        let mut live = false;
        for p in &mut self.rack {
            match &p.pull {
                Some(PullState::Run(_)) => {
                    live = true;
                    let pct = (((now - p.t0) / 2.2) * 100.0).min(100.0) as u8;
                    // a failing pull dies where git dies: after the fetch, at the merge
                    p.pull = Some(if !p.ok && pct >= 82 {
                        PullState::Err(p.msg.into())
                    } else if pct >= 100 {
                        p.hide_at = now + 4.0;
                        PullState::Ok(p.msg.into())
                    } else {
                        PullState::Run(pct)
                    });
                }
                Some(PullState::Ok(_)) => {
                    live = true;
                    if now > p.hide_at {
                        p.pull = None;
                    }
                }
                _ => {}
            }
        }
        let dt = now - self.ver_t0;
        let next = match &self.ver {
            VerState::Checking => {
                live = true;
                (dt > 0.9).then(|| {
                    let n = self.ver_n;
                    self.ver_n += 1;
                    match n % 3 {
                        0 if self.ver_cur != "2.4.0" => VerState::Available("2.4.0".into()),
                        0 | 1 => VerState::Latest,
                        _ => VerState::Failed,
                    }
                })
            }
            VerState::Latest => { live = true; (dt > 2.4).then(|| VerState::Idle(self.ver_cur.clone())) }
            VerState::Updating(_) => {
                live = true;
                let pct = ((dt / 2.0) * 100.0).min(100.0) as u8;
                Some(if pct >= 100 {
                    self.ver_cur = "2.4.0".into();
                    VerState::Done(self.ver_cur.clone())
                } else {
                    VerState::Updating(pct)
                })
            }
            VerState::Done(_) => { live = true; (dt > 2.4).then(|| VerState::Idle(self.ver_cur.clone())) }
            _ => None,
        };
        if let Some(n) = next {
            let restart = !matches!((&self.ver, &n), (VerState::Updating(_), VerState::Updating(_)));
            self.ver = n;
            if restart {
                self.ver_t0 = now;
            }
        }
        if live {
            ctx.request_repaint();
        }
    }

    fn launchpad(&mut self, ui: &mut Ui) {
        let th = self.th;
        self.lp_tick(ui.ctx());
        let now = ui.input(|i| i.time);
        let in_folder = |p: &Proj, i: usize| match i { 0 => p.up, 1 => true, _ => p.folder == FOLDERS[i] };

        surround(ui, &th, th.r, 16.0, |ui| {
            ui.set_width(ui.available_width());
            // ── the top: Running first, then the folders, and the version at the right end
            ui.horizontal(|ui| {
                ui.spacing_mut().item_spacing.x = 8.0;
                for (i, f) in FOLDERS.iter().enumerate() {
                    let n = self.rack.iter().filter(|p| in_folder(p, i)).count();
                    let style = if i == self.lp_folder { ActStyle::Down } else { ActStyle::Aux };
                    if act(ui, &th, &[Part::Text(f), Part::Count(n)], style, 28.0, true).clicked() {
                        self.lp_folder = i;
                    }
                }
                act(ui, &th, &[Part::Text("+ NEW FOLDER")], ActStyle::Aux, 28.0, true);
                ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                    let r = version_readout(ui, &th, &self.ver);
                    if r.clicked() {
                        match self.ver {
                            VerState::Available(_) => { self.ver = VerState::Updating(0); self.ver_t0 = now; }
                            VerState::Idle(_) | VerState::Failed | VerState::Latest | VerState::Done(_) => {
                                self.ver = VerState::Checking; self.ver_t0 = now;
                            }
                            _ => {}
                        }
                    }
                });
            });
            ui.add_space(8.0);
            // ── search
            ui.horizontal(|ui| {
                let (slot, _) = ui.allocate_exact_size(vec2(280.0, 30.0), Sense::hover());
                paint_well(ui.painter(), slot, th.paper, th.edge);
                paint_icon(ui.painter(), Icon::Search, egui::pos2(slot.left() + 18.0, slot.center().y), 13.0, 1.8, th.ink_2, 0.0);
                let field = Rect::from_min_max(egui::pos2(slot.left() + 32.0, slot.top() + 6.0), egui::pos2(slot.right() - 8.0, slot.bottom() - 6.0));
                ui.put(field, egui::TextEdit::singleline(&mut self.lp_q)
                    .frame(false)
                    .hint_text("SEARCH")
                    .font(egui::FontId::monospace(11.0))
                    .text_color(th.ink));
            });
            ui.add_space(14.0);
            // ── the rack: as many columns as fit at the module's minimum width
            let idx: Vec<usize> = (0..self.rack.len())
                .filter(|&i| in_folder(&self.rack[i], self.lp_folder)
                    && self.rack[i].name.to_lowercase().contains(&self.lp_q.to_lowercase()))
                .collect();
            if idx.is_empty() {
                ui.label(mono(if self.lp_folder == 0 { "NOTHING IS RUNNING" } else { "NO PROJECTS IN THIS FOLDER" }, 10.5).color(th.ink_3));
                return;
            }
            let cols = ((ui.available_width() + 14.0) / (MODULE_MIN_W + 14.0)).floor().max(1.0) as usize;
            let mut hits: Vec<(usize, ModuleHit)> = Vec::new();
            for row in idx.chunks(cols) {
                ui.columns(cols, |c| {
                    for (k, &i) in row.iter().enumerate() {
                        let p = &self.rack[i];
                        let v = ModuleView { name: p.name, desc: p.desc, port: p.port, up: p.up,
                                             folder: p.folder, tags: p.tags, pull: p.pull.as_ref() };
                        if let Some(h) = module_card(&mut c[k], &th, &v) {
                            hits.push((i, h));
                        }
                    }
                });
                ui.add_space(14.0);
            }
            for (i, h) in hits {
                let p = &mut self.rack[i];
                match h {
                    ModuleHit::Stop => p.up = false,
                    ModuleHit::Launch => p.up = true,
                    ModuleHit::Pull | ModuleHit::Pull2(PullHit::Retry) => {
                        p.pull = Some(PullState::Run(0));
                        p.t0 = now;
                    }
                    ModuleHit::Pull2(PullHit::Dismiss) => p.pull = None,
                    other => self.live = format!("{} · {:?}", p.name, other),
                }
            }
        });

        // ── the state sheet: every state, posed and still ───────────────────
        ui.add_space(28.0);
        ui.label(mono("THE VERSION CHECK", 8.5).color(th.ink_2));
        ui.add_space(8.0);
        ui.horizontal_wrapped(|ui| {
            ui.spacing_mut().item_spacing = vec2(28.0, 18.0);
            for (cap, st) in [
                ("IDLE", VerState::Idle("2.3.0".into())),
                ("CHECKING", VerState::Checking),
                ("UP TO DATE", VerState::Latest),
                ("UPDATE AVAILABLE", VerState::Available("2.4.0".into())),
                ("UPDATING", VerState::Updating(46)),
                ("UPDATED", VerState::Done("2.4.0".into())),
                ("CHECK FAILED", VerState::Failed),
            ] {
                ui.vertical(|ui| {
                    version_readout(ui, &th, &st);
                    ui.add_space(6.0);
                    ui.label(mono(cap, 8.5).color(th.ink_3));
                });
            }
        });
        ui.add_space(22.0);
        ui.label(mono("A MODULE · RUN AND PULL", 8.5).color(th.ink_2));
        ui.add_space(8.0);
        let base = &self.rack[0];
        let poses: [(&str, bool, Option<PullState>); 6] = [
            ("RUNNING", true, None),
            ("STOPPED", false, None),
            ("PULLING · 63%", true, Some(PullState::Run(63))),
            ("PULLED · CHANGES", true, Some(PullState::Ok("3 files changed · 41 insertions(+), 9 deletions(−)".into()))),
            ("PULLED · NOTHING NEW", false, Some(PullState::Ok("Already up to date.".into()))),
            ("PULL FAILED", false, Some(PullState::Err("fatal: Not possible to fast-forward, aborting.".into()))),
        ];
        let cols = ((ui.available_width() + 14.0) / (MODULE_MIN_W + 14.0)).floor().max(1.0) as usize;
        for row in poses.chunks(cols) {
            ui.columns(cols, |c| {
                for (k, (cap, up, pull)) in row.iter().enumerate() {
                    let v = ModuleView { name: base.name, desc: base.desc, port: base.port, up: *up,
                                         folder: base.folder, tags: base.tags, pull: pull.as_ref() };
                    // posed, not live: whatever is pressed here changes nothing
                    let _ = module_card(&mut c[k], &th, &v);
                    c[k].add_space(6.0);
                    c[k].label(mono(*cap, 8.5).color(th.ink_3));
                }
            });
            ui.add_space(14.0);
        }
    }

    fn overrides(&mut self, ui: &mut Ui) {
        let th = self.th;
        ui.horizontal_top(|ui| {
            for (state, cap, v) in [
                (FaderState::Rest, "REST", 62.0_f32),
                (FaderState::Hover, "HOVER", 50.0),
                (FaderState::Dragging, "DRAGGING", 88.0),
            ] {
                self.pose(ui, skew_egui::FADER_SIZE, cap, |p, rect| {
                    paint_fader(p, &th, rect, "INK", v, 0.0, 100.0, state)
                });
            }
            ui.add_space(18.0);
            let (c1, _) = fader(ui, &th, "INK", &mut self.ink, 0.0, 100.0);
            let (c2, _) = fader(ui, &th, "SPEED", &mut self.speed, 0.0, 200.0);
            let (c3, _) = fader(ui, &th, "POWER", &mut self.power, 0.0, 100.0);
            if c1 || c2 || c3 {
                self.live = format!(
                    "INK {:.0} · SPEED {:.0} · POWER {:.0}",
                    self.ink, self.speed, self.power
                );
            }
        });
    }

    /// Which section draws what, and what the rest are waiting for. The strings
    /// are the ones `PARITY.md` uses.
    fn section(&mut self, ui: &mut Ui, page: usize, i: usize) {
        match (page, i) {
            (0, 0) => self.factories(ui),
            (0, 1) => self.surfaces(ui),
            (0, 2) => self.open(ui, "the token sheet · the values are in tokens.rs"),
            (0, 3) => {
                self.pressing(ui);
                ui.add_space(20.0);
                self.open(ui, "jewel · pilot · lamp — the unlit one is a filter");
            }
            (0, 4) => self.knobs(ui),
            (0, 5) => self.toggle_section(ui),
            (0, 6) => self.interlock(ui),
            (0, 7) => self.nav_section(ui),
            (0, 8) => self.open(ui, "app dock"),
            (0, 9) => self.open(ui, "settings drawer"),
            (0, 10) => self.open(ui, "the room · the sheet · --grain"),
            (0, 11) => self.open(ui, "orbit ball"),
            (0, 12) => self.open(ui, "meter · the progress track"),
            (0, 13) => self.open(ui, "modal · window · menu · picker"),
            (0, 14) => self.open(ui, "the traps are prose — docs/PORTING.md"),
            (1, 5) => self.launchpad(ui),
            (2, 0) => self.jog(ui),
            (2, 1) => self.open(ui, "stick — stays dark in this skin"),
            (2, 2) => self.open(ui, "pen bank"),
            (2, 3) => self.open(ui, "run bank · guard · e-stop"),
            (2, 4) => self.overrides(ui),
            (2, 5) => self.open(ui, "rail"),
            (2, 6) => self.open(ui, "meter"),
            (2, 7) => self.open(ui, "annunciator"),
            (2, 8) => self.open(ui, "tape"),
            _ => self.open(ui, "not drawn yet — PARITY.md has the list"),
        }
    }

    fn column(&mut self, ui: &mut Ui) {
        let th = self.th;
        let (nav_name, title, sections) = PAGES[self.page];

        let ver = format!("V{}", env!("CARGO_PKG_VERSION"));
        let nav = Nav {
            brand: "SKEW",
            pages: &["SYSTEM", "PANELS", "MACHINE", "HATCH", "NEXTDRAW"],
            version: &ver,
            light: th.skin == Skin::Light,
        };
        let mut page = self.page;
        if let Some(h) = nav_bar(ui, &th, &nav, &mut page) {
            match h {
                NavHit::Page(i) => self.page = i,
                NavHit::Sections => self.live = "SECTIONS".into(),
                NavHit::Skin => self.live = "THE SKIN IS READ AT STARTUP".into(),
            }
        }
        ui.add_space(30.0);

        // the kicker, the name and the line, as every document carries them
        ui.label(mono(format!("SKEW · {:02}", self.page), 9.5).color(th.ink_3));
        ui.add_space(4.0);
        ui.label(mono(nav_name, 24.0).strong().color(th.ink));
        ui.add_space(4.0);
        ui.label(mono(title, 10.0).color(th.ink_2));
        ui.add_space(28.0);

        for (i, name) in sections.iter().enumerate() {
            cut(ui, &th, &format!("{:02} / {}", i + 1, name.to_uppercase()));
            ui.add_space(14.0);
            self.section(ui, self.page, i);
            ui.add_space(28.0);
        }
        ui.add_space(24.0);
    }
}

impl eframe::App for Gallery {
    fn update(&mut self, ctx: &egui::Context, _f: &mut eframe::Frame) {
        let th = self.th;
        egui::CentralPanel::default()
            .frame(panel_frame(&th, th.paper))
            .show(ctx, |ui| {
                egui::ScrollArea::vertical().show(ui, |ui| {
                    // ONE CENTRED COLUMN, like every page on the site: a
                    // reference that runs the width of the window is one whose
                    // line length changes with the window.
                    let avail = ui.available_width();
                    let w = COLUMN.min(avail - 32.0).max(320.0);
                    ui.horizontal(|ui| {
                        ui.add_space(((avail - w) / 2.0).max(0.0));
                        ui.allocate_ui_with_layout(
                            vec2(w, 0.0),
                            Layout::top_down(Align::Min),
                            |ui| {
                                ui.set_width(w);
                                self.column(ui);
                            },
                        );
                    });
                });
            });
    }
}

fn main() -> eframe::Result<()> {
    let skin = if std::env::args().any(|a| a == "dark") {
        Skin::Dark
    } else {
        Skin::Light
    };
    let th = Theme::new(skin);
    let opts = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default().with_inner_size([1120.0, 900.0]),
        ..Default::default()
    };
    eframe::run_native(
        "Skew · egui gallery",
        opts,
        Box::new(move |cc| {
            th.apply(&cc.egui_ctx);
            Ok(Box::new(Gallery::new(th)))
        }),
    )
}
