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

use egui::{pos2, vec2, Align, Align2, Color32, FontId, Layout, Rect, Sense, Ui, Vec2};
use skew_egui::{
    frow, hint, paint_rail_item, paint_tab, paint_tab_ledge, paint_tabpane, rail, slot_row,
    statline, swatches, tabbar, entry, field, frow_inline, id_color, EntryView, RailItem, Tab,
    TabKind, Tone, ENTRY_H, FIELD_SM_W, RAIL_ROW_H, TABBAR_H, TAB_H, TAB_H_OFF,
    btn, colored_btn, cut, dro, fader, jog_pad, key, knob, slide, KnobKind, SlideKind, backlit, chevron, icon_key, micro, sep, Icon, label, lcd, mono, nav_bar, paint_fader,
    appwin, stage, page_fill, paint_key, panel, panel_frame, pkey_bar, read_font, well_frame, well_shadow, FaderState,
    JogPress, KeyState, KeyStyle, Nav, NavHit, Skin, Theme,
    act, channel, con_say, empty_rack, module_card, pull_line, sel, sel_list, sel_list_size,
    slot_field, version_readout, version_readout_h, ActStyle,
    ModuleHit, ModuleView, Part, PullHit, PullState, VerState, MODULE_MIN_W,
};

/// `.pipe` — the layer lamp at the head of a `.tog` row: 4px of lit colour,
/// the height of the row, with its own small bloom. Unlit it is a milled bar.
fn pipe(ui: &mut Ui, th: &Theme, on: bool) {
    let (r, _) = ui.allocate_exact_size(vec2(4.0, 22.0), Sense::hover());
    if !ui.is_rect_visible(r) {
        return;
    }
    let p = ui.painter();
    if on {
        p.rect_filled(r.expand(3.0), egui::Rounding::same(5.0), th.primary.gamma_multiply(0.16));
        p.rect_filled(r, egui::Rounding::same(2.0), th.primary);
    } else {
        p.rect_filled(r, egui::Rounding::same(2.0), th.edge_ctl);
    }
}

/// One project on the launcher's rack, and what its pull will do in the demo.
///
/// NO DESCRIPTION. The card dropped it when the rack became one list, so the
/// demo's data drops it too — a field the part cannot draw is a field that
/// drifts.
struct Proj {
    name: &'static str,
    /// Empty means no folder, which is the common case in the real rack.
    folder: &'static str,
    port: u16,
    up: bool,
    tags: &'static [&'static str],
    pull: Option<PullState>,
    t0: f64,
    ok: bool,
    msg: &'static str,
    hide_at: f64,
}

/// THE SAME EIGHT PROJECTS THE WEB PAGE HAS, including the two in no folder.
/// A mock that files everything designs for a library nobody has.
fn projects() -> Vec<Proj> {
    let p = |name, folder, port, up, tags, ok, msg| Proj {
        name, folder, port, up, tags, pull: None, t0: 0.0, ok, msg, hide_at: 0.0,
    };
    vec![
        p("Portrait-Typo", "Portrait", 2857, true, &["dev"], true,
          "3 files changed · 41 insertions(+), 9 deletions(−)"),
        p("Portrait-ribbons", "Portrait", 2855, true, &["dev"], true, "Already up to date."),
        p("Portrait-Cubes", "Portrait", 2851, true, &["dev", "start"], false,
          "fatal: Not possible to fast-forward, aborting."),
        p("Portrait-DNA", "Portrait", 2853, false, &["dev"], false,
          "error: your local changes to settings.json would be overwritten"),
        p("targz-design-system", "Targz", 2860, false, &["dev"], true, "Already up to date."),
        p("targz.fr", "Web", 4000, false, &["serve"], true, "Already up to date."),
        p("_divers/agent-tiktok", "", 3310, false, &["dev"], true, "Already up to date."),
        p("_divers/plotter-bench", "", 0, false, &[], true, "Already up to date."),
    ]
}

/// The two values that are not folders, and they lead the list. `ALL FOLDERS`
/// and `NO FOLDER` are filters; everything after them is a folder you can
/// rename and delete. The commands split on exactly that line.
const ALL: &str = "ALL FOLDERS";
const NONE: &str = "NO FOLDER";

/// Which inline edit the strip is in, if any. `None` is the resting row.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Edit {
    /// Naming a folder that does not exist yet — so there is no bin.
    New,
    /// Renaming the one that is picked — bin, field, tick.
    Rename,
}

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
            "Terminass",
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
    /// § 07. The rail's current row, the tab that is down, the tabs that
    /// are left after a ×, the two slot rows' buffers and the three-way.
    t_rail: usize,
    t_tab: usize,
    t_tabs: Vec<(String, TabKind)>,
    t_entry: usize,
    t_sw: usize,
    t_label: String,
    t_port: String,
    t_find: String,
    t_key: String,
    t_agent: usize,
    t_hidden: bool,
    rack: Vec<Proj>,
    /// The folders, which rename and delete change — so they are owned state
    /// and not a `const` array of tabs.
    folders: Vec<String>,
    /// Which value the folder selector is showing: `ALL FOLDERS`, `NO FOLDER`,
    /// or one of `folders`.
    lp_folder: String,
    lp_q: String,
    lp_only_up: bool,
    /// The strip's inline edit, and the name being typed into it.
    lp_edit: Option<Edit>,
    lp_buf: String,
    /// `delArm` — the folder the armed row is about to empty.
    lp_del: Option<String>,
    /// Which card has its folder drawer open, by name. Kept out here so the
    /// drawer survives the rack being redrawn under it.
    lp_card: Option<String>,
    /// Set for the one frame an inline edit opens on, so the field is focused
    /// once. Asked for every frame it never loses focus and never commits.
    lp_focus: bool,
    /// The selector's list is open. It is drawn in an overlay so it COVERS
    /// the rack instead of shoving it down the window — which is the whole
    /// reason a popover is a popover.
    lp_list: bool,
    /// Where the selector's face is, so the plate can hang off its bottom edge.
    lp_rect: Rect,
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
            t_rail: 0,
            t_tab: 3,
            // the app's own pages first, then the sessions — one bar, and
            // the difference carries itself: no close, no kind colour, own
            // width. See `TabKind::Page`.
            t_tabs: vec![
                ("Vaults".into(), TabKind::Page(Icon::Server)),
                ("SFTP".into(), TabKind::Page(Icon::Upload)),
                ("Settings".into(), TabKind::Page(Icon::Sliders)),
                ("Local Terminal".into(), TabKind::Local),
                ("Contabo".into(), TabKind::Remote),
                ("NextDraw".into(), TabKind::Remote),
            ],
            t_entry: 0,
            t_sw: 0,
            t_label: "hestia".into(),
            t_port: String::new(),
            t_find: String::new(),
            t_key: String::new(),
            t_agent: 1,
            t_hidden: false,
            rack: projects(),
            folders: vec!["Portrait".into(), "Targz".into(), "Web".into()],
            lp_folder: ALL.into(),
            lp_q: String::new(),
            lp_only_up: false,
            lp_edit: None,
            lp_buf: String::new(),
            lp_del: None,
            lp_card: None,
            lp_focus: false,
            lp_list: false,
            lp_rect: Rect::NOTHING,
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

    /// `[ALL FOLDERS, NO FOLDER, …folders]` — the selector's values. The two
    /// that lead are filters and the rest are folders, and the folder commands
    /// split on exactly that line.
    fn lp_opts(&self) -> Vec<String> {
        let mut v = vec![ALL.to_string(), NONE.to_string()];
        v.extend(self.folders.iter().cloned());
        v
    }

    /// A NAMED folder is picked — so RENAME and DELETE have an object. They
    /// are PRESENT OR ABSENT rather than enabled or greyed, because a key that
    /// is there and dead still has to be read before it can be dismissed.
    fn lp_named(&self) -> bool {
        self.lp_folder != ALL && self.lp_folder != NONE
    }

    /// Which projects survive the three filters, in rack order. Each one is
    /// applied to the result of the last: folder, then text, then running.
    fn lp_filtered(&self) -> Vec<usize> {
        let q = self.lp_q.trim().to_lowercase();
        (0..self.rack.len())
            .filter(|&i| {
                let p = &self.rack[i];
                let by_folder = self.lp_folder == ALL
                    || (self.lp_folder == NONE && p.folder.is_empty())
                    || p.folder == self.lp_folder;
                let hay = format!("{} {} {}", p.name, p.folder, p.tags.join(" ")).to_lowercase();
                by_folder && (!self.lp_only_up || p.up) && hay.contains(&q)
            })
            .collect()
    }

    fn lp_filtering(&self) -> bool {
        !self.lp_q.trim().is_empty() || self.lp_folder != ALL || self.lp_only_up
    }

    /// Enter commits. An empty name is a cancel, because a folder with no name
    /// is not a folder — and a rename to the same word is a no-op rather than
    /// a rewrite of every project that was in it.
    fn lp_commit(&mut self) {
        let Some(mode) = self.lp_edit.take() else { return };
        let v = self.lp_buf.trim().to_string();
        if v.is_empty() {
            return;
        }
        match mode {
            Edit::New => {
                if !self.folders.contains(&v) {
                    self.folders.push(v.clone());
                }
            }
            Edit::Rename => {
                let was = self.lp_folder.clone();
                if v != was {
                    for f in &mut self.folders {
                        if *f == was {
                            *f = v.clone();
                        }
                    }
                    // the folder is a property of the project, so renaming it
                    // has to walk the rack — there is no directory to move
                    for p in &mut self.rack {
                        if p.folder == was {
                            // leaked on purpose: `Proj.folder` is `&'static str`
                            // in this demo, and a rename in a demo is cheap
                            p.folder = Box::leak(v.clone().into_boxed_str());
                        }
                    }
                }
            }
        }
        self.lp_folder = v;
    }

    /// The bin arms; the row states the consequence and offers CANCEL and
    /// DELETE. Two presses, which is the whole of the protection — what went
    /// is the room you had to be sent to, not the stop.
    fn lp_do_delete(&mut self) {
        let Some(was) = self.lp_del.take() else { return };
        self.folders.retain(|f| *f != was);
        for p in &mut self.rack {
            if p.folder == was {
                p.folder = "";
            }
        }
        self.lp_folder = ALL.into();
    }

    fn launchpad(&mut self, ui: &mut Ui) {
        let th = self.th;
        self.lp_tick(ui.ctx());
        let now = ui.input(|i| i.time);

        // THE LAUNCHER IS A WINDOW, NOT A PANEL, so it is `console` and not
        // `surround`: the ruled desk is INSIDE it, the cards are laid out ON
        // that desk, and the page around it stays plain. Every other section
        // on this page is the opposite way round, because every other section
        // is a part MOUNTED IN a face.
        // AND IT IS SHOWN THE WAY YOU MEET IT: a window, on a plate. Every
        // other specimen on this page is a PART and is drawn as the part. The
        // launcher is a PROGRAM, and a program is something you meet as a
        // window on a desktop with the system's bar across the top of it —
        // leaving that off does not make the specimen neutral, it makes it a
        // panel, which is the one thing this object is not.
        stage(ui, &th, |ui| {
        appwin(ui, &th, "Targz Launchpad", 18.0, |ui| {
            ui.set_width(ui.available_width());

            // ══ ROW ONE: A LINE OF BOXES ════════════════════════════════════
            // THE STRIP IS SPLIT BY WHAT A PART IS, not by what it does. This
            // line is everything cut as a box of ONE HEIGHT — the selector,
            // the field, the keys — and it reads left to right as a sentence:
            // which folder, then what matches, then, past the gap, what the
            // program is. 8px binds, 18px separates, and the one channel marks
            // the single cut that matters.
            //
            // IT IS LAID FROM THE RIGHT, and that is not a preference. The app
            // group is all fixed widths and the field is the only part that
            // gives, so taking the program's corner out of the row first
            // leaves exactly the room the field is allowed to claim — no
            // measured constant, and nothing to keep in step by hand.
            ui.horizontal(|ui| {
                ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                    ui.spacing_mut().item_spacing.x = 8.0;
                    // ── what the program IS, right of the channel
                    // 32, not 21: `.con-top` puts every box in this row on
                    // one height, and the readout is the short one.
                    if version_readout_h(ui, &th, &self.ver, 32.0).clicked() {
                        match self.ver {
                            VerState::Available(_) => { self.ver = VerState::Updating(0); self.ver_t0 = now; }
                            _ => { self.ver = VerState::Checking; self.ver_t0 = now; }
                        }
                    }
                    // THE SKIN KEY POSES ITS STATE AND DOES NOT CHANGE IT.
                    // The bar at the top of this gallery owns the skin; two
                    // controls writing one attribute is two chances to
                    // disagree about which of them is true.
                    let lit = th.skin == Skin::Light;
                    let sk = if lit {
                        let (rect, r) = ui.allocate_exact_size(vec2(32.0, 35.0), Sense::click());
                        // held, so the sun stays on the strip's line
                        skew_egui::paint_act(ui.painter(), &th, rect, &[Part::Icon(Icon::Sun)],
                                             ActStyle::Held, KeyState::Raised, 10.5);
                        r
                    } else {
                        act(ui, &th, &[Part::Icon(Icon::Sun)], ActStyle::Aux, 32.0, true)
                    };
                    if sk.on_hover_text("Light or dark").clicked() {
                        self.live = "SKIN — the nav bar owns it".into();
                    }
                    channel(ui, &th);
                    if act(ui, &th, &[Part::Icon(Icon::Restart), Part::Text("RESCAN")], ActStyle::Aux, 32.0, true)
                        .on_hover_text("Look for projects again")
                        .clicked()
                    {
                        self.live = "RESCAN".into();
                    }
                    ui.add_space(10.0);

                    // ── and your projects, in the room that is left
                    ui.with_layout(Layout::left_to_right(Align::Center), |ui| {
                        ui.spacing_mut().item_spacing.x = 8.0;
                        if let Some(name) = self.lp_del.clone() {
                            // THE WHOLE ROW, not a group in it: the sentence
                            // needs the width the selector and the field were
                            // using, and leaving them there would let you
                            // change the folder you are deleting while the
                            // warning for the old one is still up.
                            let n = self.rack.iter().filter(|p| p.folder == name).count();
                            let tail = if n > 0 {
                                format!(" — {n} project{} go back to no folder. Nothing on disk is touched.",
                                        if n == 1 { "" } else { "s" })
                            } else {
                                " — it is empty. Nothing on disk is touched.".to_string()
                            };
                            con_say(ui, &th, "Delete ", &name, &tail);
                            ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                                ui.spacing_mut().item_spacing.x = 8.0;
                                if act(ui, &th, &[Part::Icon(Icon::Trash), Part::Text("DELETE")], ActStyle::Halt, 32.0, true).clicked() {
                                    self.lp_do_delete();
                                }
                                if act(ui, &th, &[Part::Text("CANCEL")], ActStyle::Aux, 32.0, true).clicked() {
                                    self.lp_del = None;
                                }
                            });
                            // ESCAPE LEAVES, which is what every other field
                            // here already does — and the armed row is the one
                            // place a stray Return could empty a folder, so
                            // nothing in it is focused by default.
                            if ui.input(|i| i.key_pressed(egui::Key::Escape)) {
                                self.lp_del = None;
                            }
                        } else if let Some(mode) = self.lp_edit {
                            // ── THE SELECTOR BECOMES THE FIELD. Same place,
                            //    same 186px, same row: the control that SHOWS
                            //    the name is the control that TAKES it, which
                            //    is how a file is renamed in every file
                            //    browser there has ever been.
                            let bin = if mode == Edit::Rename {
                                // THE BIN IS ON THE FAR SIDE OF THE FIELD FROM
                                // THE TICK. They are the two ways out and they
                                // do opposite things; side by side they are a
                                // pair of 32px caps differing only by the mark
                                // on the face, and the one you hit by mistake
                                // empties a folder.
                                Some(act(ui, &th, &[Part::Icon(Icon::Trash)], ActStyle::Aux, 32.0, true)
                                    .on_hover_text("Delete this folder"))
                            } else {
                                // A FOLDER BEING NAMED FOR THE FIRST TIME DOES
                                // NOT EXIST YET, so there is nothing to bin.
                                None
                            };
                            let hint = if mode == Edit::New { "NEW FOLDER" } else { "FOLDER NAME" };
                            let f = slot_field(ui, &th, 186.0, 32.0, None, hint, &mut self.lp_buf);
                            if self.lp_focus {
                                f.request_focus();
                                self.lp_focus = false;
                            }
                            let ok = act(ui, &th, &[Part::Icon(Icon::Check)], ActStyle::Go, 32.0, true)
                                .on_hover_text("Save this name");

                            // ── THE ORDER THESE ARE RESOLVED IN IS THE WHOLE
                            //    CORRECTNESS OF THE ROW, and it is the same
                            //    bug the web version had in another form.
                            //    ESCAPE FIRST: a `TextEdit` also loses focus on
                            //    Escape, so a commit keyed off `lost_focus`
                            //    would save the name you just cancelled.
                            //    THE BIN NEXT: the press that arms it is the
                            //    press that blurs the field, so arming has to
                            //    happen before the blur is read as a commit —
                            //    otherwise the bin arrives to delete a folder
                            //    that has just been renamed out from under it.
                            let esc = ui.input(|i| i.key_pressed(egui::Key::Escape));
                            let binning = bin.as_ref().is_some_and(|b| b.clicked() || b.is_pointer_button_down_on());
                            if esc {
                                self.lp_edit = None;
                            } else if binning {
                                // `was` is the folder as it stands, never the
                                // half-typed name: that is the only thing there
                                // is to remove.
                                self.lp_del = Some(self.lp_folder.clone());
                                self.lp_edit = None;
                            } else if ok.clicked()
                                || (f.lost_focus() && ui.input(|i| i.key_pressed(egui::Key::Enter)))
                            {
                                self.lp_commit();
                            }
                        } else {
                            // ── THE VALUE LEADS AND ITS COMMAND FOLLOWS IT.
                            //    The selector says which folder; the pencil
                            //    acts on THAT folder, so it comes after it and
                            //    vanishes with it. First would be a verb with
                            //    no object for as long as ALL FOLDERS is up.
                            let cur = self.lp_folder.clone();
                            let sr = sel(ui, &th, &cur, 186.0, 32.0, self.lp_list);
                            self.lp_rect = sr.rect;
                            if sr.clicked() {
                                self.lp_list = !self.lp_list;
                            }
                            if self.lp_named()
                                && act(ui, &th, &[Part::Icon(Icon::Pencil)], ActStyle::Aux, 32.0, true)
                                    .on_hover_text("Edit this folder")
                                    .clicked()
                            {
                                self.lp_edit = Some(Edit::Rename);
                                self.lp_buf = cur;
                                self.lp_focus = true;
                            }
                            ui.add_space(10.0);
                            // THE FIELD IS THE ONLY THING THAT GIVES, and it
                            // never gives everything: at 200 the placeholder
                            // still reads, and a field narrower than its own
                            // label cannot be told from a button.
                            let w = ui.available_width().clamp(200.0, 420.0);
                            slot_field(ui, &th, w, 32.0, Some(Icon::Search), "FILTER", &mut self.lp_q);
                        }
                    });
                });
            });

            // ── TEN UNDER ROW ONE, because the switch belongs to it: a folder,
            //    a field and then only-what-is-running are three narrowings of
            //    one list, and a bigger break would cut the third off from the
            //    two it follows.
            ui.add_space(10.0);

            // ══ ROW TWO: THE ONE PART THAT IS NOT A BOX ═════════════════════
            // The selector, the field and the keys are cut rectangles of about
            // one height. A slide switch is a slot milled in the face with a
            // grip standing proud of it and its name beside it in the open —
            // dropped into that line it was the one part with no edge, so it
            // read as having come loose and fallen out of the row. On its own
            // line it is what it actually is: a setting you leave on.
            ui.horizontal(|ui| {
                ui.spacing_mut().item_spacing.x = 9.0;
                // `.pipe` LEADS THE ROW AND IT IS A BAR, not a bead. It is the
                // layer lamp every `.tog` in this system carries: 4px wide,
                // the height of the row, lit in the thing's own colour — here
                // the rack's orange, so the filter and what it selects say the
                // same thing. A round lamp between the switch and its name is
                // a third object in a part that has two.
                pipe(ui, &th, self.lp_only_up);
                let mut on = self.lp_only_up;
                if slide(ui, &th, "lp-running", &mut on, SlideKind::Grip).clicked() {
                    self.lp_only_up = on;
                }
                ui.label(mono("RUNNING", 9.5).color(if self.lp_only_up { th.ink } else { th.ink_2 }));
            });

            // ── THE OPEN LIST, IN AN OVERLAY AND NOT IN THE ROW ─────────
            //    A PLATE THAT TAKES LAYOUT SPACE IS NOT A PLATE. Laid out in
            //    the strip it pushed the rack half a window down every time
            //    the list opened, which is the one thing a popover exists to
            //    avoid — you open it to CHOOSE from a list while the thing it
            //    filters stays where you left it.
            //
            //    IT CLOSES THE WAY EVERY PLATE IN THIS SYSTEM CLOSES: the
            //    face, Escape, or a press anywhere else. Not the chevron,
            //    which lies down and stays down because it is a signpost.
            if self.lp_list {
                let opts = self.lp_opts();
                let refs: Vec<&str> = opts.iter().map(|s| s.as_str()).collect();
                let cur = refs.iter().position(|v| *v == self.lp_folder).unwrap_or(0);
                let at = egui::pos2(self.lp_rect.left(), self.lp_rect.bottom() + 6.0);
                let picked = egui::Area::new(egui::Id::new("lp-sellist"))
                    .order(egui::Order::Foreground)
                    .fixed_pos(at)
                    .show(ui.ctx(), |ui| sel_list(ui, &th, 186.0, &refs, cur, &["NEW FOLDER…"]))
                    .inner;
                let plate = Rect::from_min_size(at, sel_list_size(refs.len(), 1, 186.0));
                if let Some(i) = picked {
                    self.lp_list = false;
                    if i < opts.len() {
                        self.lp_folder = opts[i].clone();
                    } else {
                        // NEW NEEDS NOTHING, so it lives in the list — that is
                        // where you already are when you are thinking about
                        // folders, and the only place the answer could be.
                        self.lp_edit = Some(Edit::New);
                        self.lp_buf.clear();
                        self.lp_focus = true;
                    }
                } else if ui.input(|i| i.key_pressed(egui::Key::Escape)) {
                    self.lp_list = false;
                } else if ui.ctx().input(|i| i.pointer.any_click()) {
                    if let Some(pos) = ui.ctx().input(|i| i.pointer.interact_pos()) {
                        if !plate.contains(pos) && !self.lp_rect.contains(pos) {
                            self.lp_list = false;
                        }
                    }
                }
            }

            // ── THIRTY-TWO UNDER THE WHOLE STRIP. This is the break between
            //    the window's chrome and its contents, and it is the only gap
            //    here that has to be bigger than the 14 between two cards: a
            //    band of controls one card-gap above the rack reads as the
            //    rack's first row.
            ui.add_space(32.0);

            // ══ THE RACK ════════════════════════════════════════════════════
            let idx = self.lp_filtered();
            if idx.is_empty() {
                let filtering = self.lp_filtering();
                let (txt, out) = if filtering {
                    ("NOTHING MATCHES", Some("CLEAR FILTERS"))
                } else {
                    ("NO PROJECTS FOUND", None)
                };
                if let Some(r) = empty_rack(ui, &th, txt, out) {
                    if r.clicked() {
                        self.lp_q.clear();
                        self.lp_folder = ALL.into();
                        self.lp_only_up = false;
                    }
                }
                return;
            }
            let cols = ((ui.available_width() + 14.0) / (MODULE_MIN_W + 14.0)).floor().max(1.0) as usize;
            let mut hits: Vec<(usize, ModuleHit)> = Vec::new();
            for row in idx.chunks(cols) {
                ui.columns(cols, |c| {
                    for (k, &i) in row.iter().enumerate() {
                        let p = &self.rack[i];
                        let v = ModuleView {
                            name: p.name, port: p.port, up: p.up, folder: p.folder,
                            tags: p.tags, pull: p.pull.as_ref(),
                            editing: self.lp_card.as_deref() == Some(p.name),
                        };
                        if let Some(h) = module_card(&mut c[k], &th, &v) {
                            hits.push((i, h));
                        }
                    }
                });
                ui.add_space(14.0);
            }
            for (i, h) in hits {
                let name = self.rack[i].name;
                match h {
                    ModuleHit::Stop => self.rack[i].up = false,
                    ModuleHit::Launch => self.rack[i].up = true,
                    ModuleHit::Pull | ModuleHit::Pull2(PullHit::Retry) => {
                        self.rack[i].pull = Some(PullState::Run(0));
                        self.rack[i].t0 = now;
                    }
                    ModuleHit::Pull2(PullHit::Dismiss) => self.rack[i].pull = None,
                    // the drawer survives the rack being redrawn under it:
                    // filing a project repaints everything, and a drawer that
                    // shut every time you used it is one you open twice
                    ModuleHit::Edit => {
                        self.lp_card = if self.lp_card.as_deref() == Some(name) {
                            None
                        } else {
                            Some(name.to_string())
                        };
                    }
                    other => self.live = format!("{name} · {other:?}"),
                }
            }
        });
        });

        self.lp_states(ui);
    }

    // ══ THE STATE BOOK ══════════════════════════════════════════════════════
    // THE CONSOLE ABOVE IS THE ARGUMENT; THIS IS THE PARTS LIST. A posed
    // console can only be in one state at a time, so the half of the launcher
    // that is states — a pull that failed, an update waiting, a folder being
    // renamed, an empty rack — is reachable only by finding the press that
    // produces it. Every state is drawn once here, captioned with the name the
    // code calls it by, and the six groups are `docs/skew-panels.html`'s own.
    //
    // POSED, NOT LIVE: whatever is pressed down here changes nothing.
    fn lp_states(&mut self, ui: &mut Ui) {
        let th = self.th;
        let head = |ui: &mut Ui, t: &str| {
            ui.add_space(26.0);
            ui.label(mono(t, 9.5).color(th.ink));
            ui.add_space(10.0);
        };
        let cap = |ui: &mut Ui, t: &str| {
            ui.add_space(5.0);
            ui.label(mono(t, 8.5).color(th.ink_3));
            ui.add_space(14.0);
        };
        let row = |ui: &mut Ui, add: &mut dyn FnMut(&mut Ui)| {
            ui.horizontal(|ui| {
                ui.spacing_mut().item_spacing.x = 8.0;
                add(ui);
            });
        };

        // ── A · THE FOLDER ROW ──────────────────────────────────────────────
        head(ui, "A · THE FOLDER ROW — WHICH PROJECTS");
        for (c, value, pencil) in [
            ("folder = ALL FOLDERS · no commands, because there is no folder to command", ALL, false),
            ("folder = NO FOLDER · still no commands: it is a filter, not a folder", NONE, false),
            ("folder = 'Portrait' · named, so the one door appears", "Portrait", true),
        ] {
            row(ui, &mut |ui: &mut Ui| {
                let _ = sel(ui, &th, value, 186.0, 32.0, false);
                if pencil {
                    let _ = act(ui, &th, &[Part::Icon(Icon::Pencil)], ActStyle::Aux, 32.0, true);
                }
            });
            cap(ui, c);
        }
        row(ui, &mut |ui: &mut Ui| {
            let _ = act(ui, &th, &[Part::Icon(Icon::Trash)], ActStyle::Aux, 32.0, true);
            let mut b = "Portrait".to_string();
            let _ = slot_field(ui, &th, 186.0, 32.0, None, "FOLDER NAME", &mut b);
            let _ = act(ui, &th, &[Part::Icon(Icon::Check)], ActStyle::Go, 32.0, true);
        });
        cap(ui, "editF.mode = 'rename' · the selector IS the field · bin, name, tick");
        row(ui, &mut |ui: &mut Ui| {
            let mut b = String::new();
            let _ = slot_field(ui, &th, 186.0, 32.0, None, "NEW FOLDER", &mut b);
            let _ = act(ui, &th, &[Part::Icon(Icon::Check)], ActStyle::Go, 32.0, true);
        });
        cap(ui, "editF.mode = 'new' · no bin: there is nothing yet to delete");
        for (c, name, n) in [
            ("delArm = 'Portrait' · the whole row, and it counts what comes loose", "Portrait", 4usize),
            ("delArm = 'Razo' · the same row when the folder is empty", "Razo", 0),
        ] {
            let tail = if n > 0 {
                format!(" — {n} projects go back to no folder. Nothing on disk is touched.")
            } else {
                " — it is empty. Nothing on disk is touched.".to_string()
            };
            row(ui, &mut |ui: &mut Ui| {
                con_say(ui, &th, "Delete ", name, &tail);
                ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                    ui.spacing_mut().item_spacing.x = 8.0;
                    let _ = act(ui, &th, &[Part::Icon(Icon::Trash), Part::Text("DELETE")], ActStyle::Halt, 32.0, true);
                    let _ = act(ui, &th, &[Part::Text("CANCEL")], ActStyle::Aux, 32.0, true);
                });
            });
            cap(ui, c);
        }
        row(ui, &mut |ui: &mut Ui| {
            let opts = ["ALL FOLDERS", "NO FOLDER", "Portrait", "Targz", "Web"];
            let (rect, _) = ui.allocate_exact_size(vec2(186.0, 14.0 + 26.0 * 6.0 + 9.0), Sense::hover());
            skew_egui::paint_sel_list(ui.painter(), &th, rect.min, 186.0, &opts, 2, &["NEW FOLDER…"], None);
        });
        cap(ui, "the list · the live row is pressed in and lit · NEW under a cut, no tick");

        // ── B · THE SWITCH ──────────────────────────────────────────────────
        head(ui, "B · THE RUNNING FILTER — ITS OWN LINE, UNDER THE ROW");
        for (c, on) in [("onlyUp = false", false), ("onlyUp = true · the lamp is the state", true)] {
            row(ui, &mut |ui: &mut Ui| {
                pipe(ui, &th, on);
                let mut v = on;
                let _ = slide(ui, &th, if on { "sb-run-on" } else { "sb-run-off" }, &mut v, SlideKind::Grip);
                ui.label(mono("RUNNING", 9.5).color(if on { th.ink } else { th.ink_2 }));
            });
            cap(ui, c);
        }

        // ── C · THE VERSION READOUT ─────────────────────────────────────────
        head(ui, "C · THE VERSION READOUT — APP.st");
        ui.horizontal_wrapped(|ui| {
            ui.spacing_mut().item_spacing = vec2(26.0, 18.0);
            for (c, st) in [
                ("idle", VerState::Idle("2.3.0".into())),
                ("checking", VerState::Checking),
                ("latest", VerState::Latest),
                ("failed", VerState::Failed),
                ("available", VerState::Available("2.4.0".into())),
                ("updating", VerState::Updating(47)),
                ("done", VerState::Done("2.4.0".into())),
            ] {
                ui.vertical(|ui| {
                    let _ = version_readout(ui, &th, &st);
                    ui.add_space(6.0);
                    ui.label(mono(&format!("APP.st = '{c}'"), 8.5).color(th.ink_3));
                });
            }
        });

        // ── D · GIT PULL ────────────────────────────────────────────────────
        head(ui, "D · GIT PULL --FF-ONLY — p.pull");
        for (c, st) in [
            ("pull.st = 'run' · pct 0 — fetching origin…", PullState::Run(0)),
            ("pull.st = 'run' · pct 45 — the only step that shows a number", PullState::Run(45)),
            ("pull.st = 'run' · pct 85 — fast-forwarding…", PullState::Run(85)),
            ("pull.st = 'ok' · it says what changed, then leaves on its own",
             PullState::Ok("3 files changed · 41 insertions(+), 9 deletions(−)".into())),
            ("pull.st = 'ok' · nothing to pull", PullState::Ok("Already up to date.".into())),
            ("pull.st = 'err' · it STAYS, and carries the three ways out",
             PullState::Err("fatal: Not possible to fast-forward, aborting.".into())),
            ("pull.st = 'err' · git's own words, never ours",
             PullState::Err("error: your local changes to settings.json would be overwritten".into())),
        ] {
            let _ = pull_line(ui, &th, &st);
            cap(ui, c);
        }

        // ── E · THE CARD ────────────────────────────────────────────────────
        head(ui, "E · ONE PROJECT — p.up, p.port, AND THE DRAWER");
        let poses: [(&str, &str, &str, u16, bool, bool, &[&str]); 4] = [
            ("p.up = true · split STOP + restart · the port is a door",
             "Portrait-Typo", "Portrait", 2857, true, false, &["dev"]),
            ("p.up = false · LAUNCH · the port is the door NUMBER",
             "Portrait-DNA", "Portrait", 2853, false, false, &["dev"]),
            ("p.port = 0 · PORT ASSIGNED ON LAUNCH · and folder \"\" prints NO FOLDER",
             "_divers/plotter-bench", "", 0, false, false, &[]),
            ("editing · the pencil is LATCHED and the drawer is on the card, not over it",
             "targz.fr", "Web", 4000, false, true, &["serve"]),
        ];
        let cols = ((ui.available_width() + 14.0) / (MODULE_MIN_W + 14.0)).floor().max(1.0) as usize;
        for chunk in poses.chunks(cols) {
            ui.columns(cols, |c| {
                for (k, (cp, name, folder, port, up, editing, tags)) in chunk.iter().enumerate() {
                    let v = ModuleView { name, port: *port, up: *up, folder, tags, pull: None, editing: *editing };
                    let _ = module_card(&mut c[k], &th, &v);
                    c[k].add_space(5.0);
                    c[k].label(mono(*cp, 8.5).color(th.ink_3));
                }
            });
            ui.add_space(14.0);
        }

        // ── F · THE EMPTY RACK ──────────────────────────────────────────────
        head(ui, "F · THE EMPTY RACK — TWO REASONS, ONE WAY OUT");
        let _ = empty_rack(ui, &th, "NOTHING MATCHES", Some("CLEAR FILTERS"));
        cap(ui, "filtering() = true · the filter did it, so the filter can undo it");
        let _ = empty_rack(ui, &th, "NO PROJECTS FOUND", None);
        cap(ui, "filtering() = false · the disk is empty · no key, nothing to press");
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

    /// § 07 — the six parts lifted out of Terminass.
    ///
    /// EVERY LAMP ON THIS SECTION IS POSED FROM A SEMANTIC TOKEN. A session's
    /// colour belongs to the host: `docs/PORTING.md` rules the identity ramp
    /// system-owned and NOT YET BUILT, and a gallery that pasted an app's six
    /// hexes in would have answered that question by the back door.
    fn terminass(&mut self, ui: &mut Ui) {
        let th = self.th;

        // ── the rail ────────────────────────────────────────────────────────
        label(ui, &th, "THE VERTICAL RAIL — THE SELECTED ROW IS A CUT, NOT A CAP");
        ui.add_space(8.0);
        let items = [
            RailItem { icon: Icon::Folder, name: "Hosts" },
            RailItem { icon: Icon::Key, name: "Keychain" },
            RailItem { icon: Icon::Forward, name: "Port forwarding" },
            RailItem { icon: Icon::Code, name: "Snippets" },
            RailItem { icon: Icon::Clock, name: "Logs" },
        ];
        panel_frame(&th, th.card).show(ui, |ui| {
            ui.set_width(250.0);
            if let Some(i) = rail(ui, &th, &items, &mut self.t_rail) {
                self.live = items[i].name.to_uppercase();
            }
        });
        ui.add_space(24.0);

        // ── the tab bar ─────────────────────────────────────────────────────
        // THE BAR AND THE PANE ARE ONE SPECIMEN AND CANNOT BE POSED APART.
        // A tab bar's whole claim is that the open tab and the pane below it
        // are THE SAME SURFACE, and a row of tabs with nothing under them is
        // a row of keys. So the pane is drawn first, the bar overlaps its top
        // edge by a pixel, and the open tab lays the pane's own fill back
        // across that overlap.
        label(ui, &th, "THE TAB BAR \u{2014} THE OPEN TAB AND THE PANE ARE ONE SURFACE");
        ui.add_space(8.0);
        let tabs: Vec<Tab> = self
            .t_tabs
            .iter()
            .map(|(n, k)| Tab { name: n.as_str(), kind: *k })
            .collect();
        let (picked, closed) = tabbar(ui, &th, &tabs, self.t_tab);
        {
            // the pane: one pixel up, under the bar, so the cut has something
            // to be cut into
            let w = ui.available_width();
            let (pane, _) = ui.allocate_exact_size(vec2(w, 74.0), Sense::hover());
            let pane = pane.translate(vec2(0.0, -1.0));
            if ui.is_rect_visible(pane) {
                paint_tabpane(ui.painter(), &th, pane);
                let name = self.t_tabs.get(self.t_tab).map(|(n, _)| n.as_str()).unwrap_or("");
                ui.painter().text(
                    pos2(pane.left() + 18.0, pane.top() + 20.0),
                    Align2::LEFT_TOP,
                    format!("$ {name}"),
                    FontId::monospace(11.5),
                    th.pal.read,
                );
            }
        }
        if let Some(i) = picked {
            self.t_tab = i;
        }
        if let Some(i) = closed {
            self.t_tabs.remove(i);
            self.t_tab = self.t_tab.min(self.t_tabs.len().saturating_sub(1));
            self.live = "TAB CLOSED".into();
        }
        if self.t_tabs.is_empty() {
            ui.add_space(6.0);
            hint(ui, &th, Tone::No, "Every tab closed. Reopen the gallery to get them back.");
        }
        ui.add_space(24.0);

        // ── the field and its action ────────────────────────────────────────
        label(ui, &th, "A FIELD AND ITS ACTION ARE ONE ROW \u{2014} CONNECT IS DEAD UNTIL THE FIELD IS NOT");
        ui.add_space(8.0);
        ui.allocate_ui(vec2(520.0, 0.0), |ui| {
            ui.set_width(520.0);
            let armed = !self.t_find.trim().is_empty();
            let (_, go) = slot_row(
                ui, &th, Some(Icon::Search), "find a host or ssh user@hostname…",
                &mut self.t_find, "CONNECT", 32.0, armed,
            );
            if go.clicked() {
                self.live = "CONNECT".into();
            }
            ui.add_space(10.0);
            let (_, keys) = slot_row(
                ui, &th, None, "Private key file (optional)", &mut self.t_key, "KEYS", 32.0, true,
            );
            if keys.clicked() {
                self.live = "KEYS".into();
            }
        });
        ui.add_space(24.0);

        // ── the form row, the sentence, the three-way ───────────────────────
        label(ui, &th, "THE SETTINGS FORM ROW — NAMES END ON ONE RULE");
        ui.add_space(8.0);
        panel_frame(&th, th.card).show(ui, |ui| {
            ui.set_width(600.0);
            frow(ui, &th, "Agent forwarding", |ui| {
                pkey_bar(ui, &th, &["INHERIT", "ON", "OFF"], &mut self.t_agent, vec2(84.0, 30.0));
                hint(
                    ui, &th,
                    if self.t_agent == 1 { Tone::Ok } else { Tone::Plain },
                    match self.t_agent {
                        0 => "Inherit — from the group",
                        1 => "On — set on this host",
                        _ => "Off — set on this host",
                    },
                );
                hint(
                    ui, &th, Tone::Plain,
                    "When on, your local SSH agent is forwarded so this server can use your keys.",
                );
            });
            frow(ui, &th, "SFTP", |ui| {
                ui.horizontal(|ui| {
                    slide(ui, &th, "t_hidden", &mut self.t_hidden, SlideKind::Grip);
                    ui.label(mono("Show hidden files", 11.5).color(th.ink));
                });
                if self.t_hidden {
                    hint(ui, &th, Tone::No, "Hidden files include the keys in ~/.ssh.");
                }
            });
        });
        ui.add_space(24.0);

        // ── the entry ───────────────────────────────────────────────────────
        label(ui, &th, "THE ENTRY \u{2014} THE PENCIL ONLY ON THE ROW YOU COULD MEAN");
        ui.add_space(8.0);
        {
            let rows: [(char, &str, &str, usize); 3] = [
                ('H', "hestia", "jterraz@192.168.1.24", 0),
                ('C', "Contabo", "root@vmi1284.contabo.net", 2),
                ('N', "NextDraw", "pi@nextdraw.local", 1),
            ];
            ui.allocate_ui(vec2(420.0, (ENTRY_H + 7.0) * rows.len() as f32), |ui| {
                ui.spacing_mut().item_spacing.y = 7.0;
                for (i, (letter, name, sub, id)) in rows.into_iter().enumerate() {
                    let e = EntryView {
                        letter,
                        name,
                        sub,
                        id: id_color(&th, id),
                        on: self.t_entry == i,
                    };
                    let (r, edit) = entry(ui, &th, &e);
                    if edit {
                        self.live = format!("EDIT {}", name.to_uppercase());
                    } else if r.clicked() {
                        self.t_entry = i;
                        self.live = name.to_uppercase();
                    }
                }
            });
        }
        ui.add_space(24.0);

        // ── the form field, the inline row and the quiet key ────────────────
        label(ui, &th, "THE FORM FIELD \u{2014} THE LABEL IS THE PLACEHOLDER, AND IT IS NOT THE FILTER SLOT");
        ui.add_space(8.0);
        panel_frame(&th, th.card).show(ui, |ui| {
            ui.set_width(404.0);
            ui.spacing_mut().item_spacing.y = 9.0;
            field(ui, &th, &mut self.t_label, "Label", ui.available_width());
            frow_inline(ui, &th, "Port", |ui| {
                field(ui, &th, &mut self.t_port, "22", FIELD_SM_W);
            });
            ui.add_space(4.0);
            // THE DANGER IS IN THE WORD. SAVE is the lit cap, CONNECT the
            // plain one, and DELETE has no cap at all — see `ActStyle::Quiet`.
            ui.horizontal(|ui| {
                ui.spacing_mut().item_spacing.x = 8.0;
                act(ui, &th, &[Part::Text("SAVE")], ActStyle::Go, 32.0, true);
                act(ui, &th, &[Part::Text("CONNECT")], ActStyle::Aux, 32.0, true);
                if act(ui, &th, &[Part::Text("DELETE")], ActStyle::Quiet, 32.0, true).clicked() {
                    self.live = "DELETE PRESSED".into();
                }
            });
        });
        ui.add_space(24.0);

        // ── the ramp, and the control that picks out of it ──────────────────
        label(ui, &th, "THE IDENTITY RAMP \u{2014} TWELVE, AND THE FIRST SIX ARE SIX FAMILIES");
        ui.add_space(8.0);
        if swatches(ui, &th, &mut self.t_sw) {
            self.live = format!("COLOUR {}", self.t_sw + 1);
        }
        ui.add_space(24.0);

        // ── the states, posed ───────────────────────────────────────────────
        // PARITY.md 1 and 5: a gallery has to be able to show a state no
        // pointer is producing, which is the only way to see all of them at
        // once. These are the painters, with no Response anywhere near them.
        label(ui, &th, "THE TAB, EVERY STATE \u{2014} CLOSED · HOVER · OPEN · OPEN, ON THE \u{d7}");
        ui.add_space(8.0);
        let (strip, _) =
            ui.allocate_exact_size(vec2(ui.available_width(), TABBAR_H + 26.0), Sense::hover());
        if ui.is_rect_visible(strip) {
            let p = ui.painter();
            // the ledge and a stub of pane under it, so each posed tab is
            // sitting in the thing it is cut into rather than floating
            let ledge = Rect::from_min_size(strip.min, vec2(strip.width(), TABBAR_H));
            let pane = Rect::from_min_max(
                pos2(strip.left(), ledge.bottom() - 1.0),
                pos2(strip.right(), strip.bottom()),
            );
            paint_tabpane(p, &th, pane);
            paint_tab_ledge(p, &th, ledge);
            let t = Tab { name: "Local Terminal", kind: TabKind::Local };
            for (i, (on, st, hot)) in [
                (false, KeyState::Raised, false),
                (false, KeyState::Hover, false),
                (true, KeyState::Raised, false),
                (true, KeyState::Raised, true),
            ]
            .iter()
            .enumerate()
            {
                let h = if *on { TAB_H } else { TAB_H_OFF };
                let r = Rect::from_min_max(
                    pos2(strip.left() + 8.0 + i as f32 * 176.0, ledge.bottom() - h),
                    pos2(strip.left() + 8.0 + i as f32 * 176.0 + 170.0, ledge.bottom()),
                );
                paint_tab(p, &th, r, &t, *on, *st, *hot);
            }
        }
        ui.add_space(10.0);
        // AND THE OTHER KIND, because the mark and the ink are the only thing
        // that separates them and a specimen with one of two is half a part
        label(ui, &th, "AND THE KIND \u{2014} LOCAL IS THE BLUE, REMOTE IS THE ORANGE");
        ui.add_space(8.0);
        let (kstrip, _) =
            ui.allocate_exact_size(vec2(ui.available_width(), TABBAR_H + 26.0), Sense::hover());
        if ui.is_rect_visible(kstrip) {
            let p = ui.painter();
            let ledge = Rect::from_min_size(kstrip.min, vec2(kstrip.width(), TABBAR_H));
            let pane = Rect::from_min_max(
                pos2(kstrip.left(), ledge.bottom() - 1.0),
                pos2(kstrip.right(), kstrip.bottom()),
            );
            paint_tabpane(p, &th, pane);
            paint_tab_ledge(p, &th, ledge);
            for (i, (name, kind, on)) in [
                ("Local Terminal", TabKind::Local, true),
                ("Contabo", TabKind::Remote, false),
                ("NextDraw", TabKind::Remote, false),
            ]
            .iter()
            .enumerate()
            {
                let h = if *on { TAB_H } else { TAB_H_OFF };
                let r = Rect::from_min_max(
                    pos2(kstrip.left() + 8.0 + i as f32 * 176.0, ledge.bottom() - h),
                    pos2(kstrip.left() + 8.0 + i as f32 * 176.0 + 170.0, ledge.bottom()),
                );
                paint_tab(p, &th, r, &Tab { name, kind: *kind }, *on, KeyState::Raised, false);
            }
        }
        ui.add_space(24.0);

        label(ui, &th, "THE RAIL ROW, EVERY STATE \u{2014} OFF · HOVER · ON");
        ui.add_space(8.0);
        let (col, _) =
            ui.allocate_exact_size(vec2(250.0, RAIL_ROW_H * 3.0 + 6.0), Sense::hover());
        if ui.is_rect_visible(col) {
            let p = ui.painter();
            let it = RailItem { icon: Icon::Folder, name: "Hosts" };
            for (i, (on, hov)) in [(false, false), (false, true), (true, false)].iter().enumerate() {
                let r = Rect::from_min_size(
                    pos2(col.left(), col.top() + i as f32 * (RAIL_ROW_H + 3.0)),
                    vec2(250.0, RAIL_ROW_H),
                );
                paint_rail_item(p, &th, r, &it, *on, *hov);
            }
        }
        ui.add_space(24.0);

        // ── the status line ─────────────────────────────────────────────────
        label(ui, &th, "THE STATUS LINE — IT DOES NOT GO AWAY");
        ui.add_space(8.0);
        statline(ui, &th, true, Tone::Ok, "Bookmarks synced");
        ui.add_space(8.0);
        statline(ui, &th, false, Tone::No, "Sync folder missing");
        ui.add_space(8.0);
        statline(ui, &th, false, Tone::Plain, "Not checked");
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
            (1, 6) => self.terminass(ui),
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
        // ── THE PAGE IS `--page` AND IT IS FLAT ─────────────────────────
        //    It was `--paper`, which is the hole milled INTO a panel — so the
        //    whole gallery read as one slab of the darkest cream in the skin
        //    and nothing on it had anything to stand apart from. The page is
        //    the cool #EFF4F7, and the separation from the warm parts on it is
        //    TEMPERATURE, not darkness: dropping the page's value to force
        //    contrast is what aged the screen.
        //
        //    AND IT IS NOT RULED. The grid is the launcher's own desk and it
        //    lives INSIDE its window — see `console`.
        egui::CentralPanel::default()
            .frame(panel_frame(&th, page_fill(&th)))
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
