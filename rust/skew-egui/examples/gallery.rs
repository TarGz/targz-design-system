//! The running visual reference: every part, in every state, side by side.
//!
//!     cargo run --example gallery            # light skin
//!     cargo run --example gallery -- dark    # the same parts, dark palette
//!
//! The palette is read **once, at startup** — which is the whole point of
//! `Palette` being a struct and not a wall of `pub const` (`dist/skew_tokens.rs`
//! says so at the top). There is no skin switch in the window, on purpose: a
//! live toggle would need every part to re-resolve its colours per frame, and
//! that is not how an app holds a theme.
//!
//! The hover and pressed columns are **posed** with `paint_key` / `paint_fader`,
//! not reached with the mouse, so all five states of a key are on screen at the
//! same time and can be compared without moving anything.

use egui::{vec2, Color32, Rect, Sense, Ui, Vec2};
use skew_egui::{
    btn, colored_btn, cut, dro, fader, jog_pad, key, label, lcd, paint_fader, paint_key, panel,
    panel_frame, pkey_bar, read_font, section, well_frame, well_shadow, FaderState, JogPress,
    KeyState, KeyStyle, Skin, Theme,
};

const KEY: Vec2 = Vec2 { x: 104.0, y: 34.0 };
const STATES: [(KeyState, &str); 4] = [
    (KeyState::Raised, "RAISED"),
    (KeyState::Hover, "HOVER"),
    (KeyState::Pressed, "PRESSED"),
    (KeyState::Disabled, "DISABLED"),
];

struct Gallery {
    th: Theme,
    latched: bool,
    toggle: bool,
    ink: f32,
    speed: f32,
    power: f32,
    live: String,
    pos: [f32; 3],
    driven: bool,
    step: usize,
    units: usize,
}

impl Gallery {
    fn new(th: Theme) -> Self {
        Gallery {
            th,
            latched: true,
            toggle: false,
            ink: 62.0,
            speed: 80.0,
            power: 35.0,
            live: "—".into(),
            pos: [0.0, 0.0, 0.0],
            driven: false,
            step: 1,
            units: 0,
        }
    }

    /// A posed cell: a rect, a caption under it, no interaction.
    fn pose(&self, ui: &mut Ui, size: Vec2, cap: &str, draw: impl FnOnce(&egui::Painter, Rect)) {
        ui.vertical(|ui| {
            let (rect, _) = ui.allocate_exact_size(size, Sense::hover());
            if ui.is_rect_visible(rect) {
                draw(ui.painter(), rect);
            }
            ui.add_space(4.0);
            ui.label(skew_egui::mono(cap, 8.5).color(self.th.ink_3));
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
}

impl eframe::App for Gallery {
    fn update(&mut self, ctx: &egui::Context, _f: &mut eframe::Frame) {
        let th = self.th;
        egui::CentralPanel::default()
            .frame(panel_frame(&th, th.paper))
            .show(ctx, |ui| {
                egui::ScrollArea::both().show(ui, |ui| {
                    ui.label(skew_egui::mono("SKEW · EGUI — PAINTED PARTS", 13.0).strong());
                    ui.label(
                        skew_egui::mono(
                            match th.skin {
                                Skin::Light => "light skin · the tuned one",
                                Skin::Dark => "dark palette · drawings tuned for light",
                            },
                            9.5,
                        )
                        .color(th.ink_2),
                    );
                    ui.add_space(14.0);

                    // ── KEY ───────────────────────────────────────────────────
                    section(ui, &th, "KEY · PLAIN");
                    ui.add_space(6.0);
                    self.key_row(ui, KeyStyle::new(th.card, th.ink), "STEP", true);
                    ui.add_space(10.0);

                    section(ui, &th, "KEY · ACTION");
                    ui.add_space(6.0);
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

                    section(ui, &th, "KEY · STOP");
                    ui.add_space(6.0);
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
                    ui.add_space(14.0);

                    // ── LIVE ──────────────────────────────────────────────────
                    section(ui, &th, "LIVE · HOVER AND PRESS THESE");
                    ui.add_space(6.0);
                    ui.horizontal(|ui| {
                        if key(ui, &th, "STEP", &KeyStyle::new(th.card, th.ink), KEY, true, false)
                            .clicked()
                        {
                            self.live = "STEP".into();
                        }
                        if colored_btn(ui, &th, "▶ START", th.primary, Color32::WHITE, KEY, true)
                            .clicked()
                        {
                            self.live = "START".into();
                        }
                        if colored_btn(ui, &th, "⊗ ABORT", th.no, Color32::WHITE, KEY, true)
                            .clicked()
                        {
                            self.live = "ABORT".into();
                        }
                        colored_btn(ui, &th, "|| PAUSE", th.card, th.ink_2, KEY, false);
                        if btn(ui, &th, "LASER", self.toggle, KEY).clicked() {
                            self.toggle = !self.toggle;
                            self.live = format!("LASER {}", if self.toggle { "ON" } else { "OFF" });
                        }
                        if btn(ui, &th, "MM", self.latched, vec2(54.0, 34.0)).clicked() {
                            self.latched = !self.latched;
                        }
                    });
                    ui.add_space(8.0);
                    ui.horizontal(|ui| {
                        label(ui, &th, "LAST");
                        ui.label(skew_egui::mono(&self.live, 10.0).color(th.ok_ink));
                    });
                    ui.add_space(14.0);

                    // ── FADER ─────────────────────────────────────────────────
                    section(ui, &th, "FADER · VERTICAL BANK");
                    ui.add_space(6.0);
                    ui.horizontal(|ui| {
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
                    ui.add_space(14.0);

                    // ── SURFACES ──────────────────────────────────────────────
                    section(ui, &th, "PANEL · WELL · READOUT");
                    ui.add_space(6.0);
                    ui.horizontal_top(|ui| {
                        let col = egui::Layout::top_down(egui::Align::Min);
                        ui.allocate_ui_with_layout(vec2(292.0, 0.0), col, |ui| {
                        panel_frame(&th, th.card).show(ui, |ui| {
                            ui.set_width(260.0);
                            section(ui, &th, "PANEL");
                            ui.add_space(6.0);
                            label(ui, &th, "A CARD FILL, PADDING, NO SECOND FRAME");
                            ui.add_space(8.0);
                            let w = well_frame(&th).show(ui, |ui| {
                                ui.set_width(228.0);
                                ui.label(
                                    skew_egui::mono("ok  ready  idle  0 queued", 9.5)
                                        .color(th.ink_2),
                                );
                            });
                            well_shadow(ui, &th, w.response.rect);
                        });
                        });
                        ui.add_space(12.0);
                        ui.allocate_ui_with_layout(vec2(232.0, 0.0), col, |ui| {
                        panel_frame(&th, th.card).show(ui, |ui| {
                            ui.set_width(200.0);
                            section(ui, &th, "READOUT");
                            ui.add_space(6.0);
                            for (ax, val) in [("X", "128.40"), ("Y", "-64.00"), ("Z", "3.20")] {
                                ui.horizontal(|ui| {
                                    ui.label(skew_egui::mono(ax, 9.5).color(th.ink_3));
                                    ui.label(
                                        egui::RichText::new(val).font(read_font(13.0)).color(th.ink),
                                    );
                                });
                            }
                            ui.add_space(6.0);
                            label(ui, &th, "SILKSCREEN · --FONT-READ · MATTE");
                        });
                        });
                    });
                    ui.add_space(18.0);

                    // ── THE MACHINE PANELS ────────────────────────────────────
                    section(ui, &th, "PANEL · DRO · JOG PAD · KEY BAR");
                    ui.add_space(8.0);
                    // the one knob in this window, and it is a tuning knob: how
                    // much of the stylesheet's reflection the glass carries. Read
                    // the number back rather than judging it from a screenshot.
                    ui.horizontal(|ui| {
                        // whole alpha levels of 255, which is the unit the
                        // effect actually has
                        let mut st = self.th.glass_streak;
                        let mut sh = self.th.glass_sheen;
                        fader(ui, &th, "EDGE", &mut st, 0.0, 40.0);
                        fader(ui, &th, "SHEEN", &mut sh, 0.0, 12.0);
                        self.th.glass_streak = st;
                        self.th.glass_sheen = sh;
                        ui.vertical(|ui| {
                            ui.add_space(26.0);
                            label(ui, &th, "GLASS · EDGE LIGHT AND CEILING, IN ALPHA LEVELS");
                            ui.label(
                                skew_egui::mono(
                                    format!(
                                        "EDGE {:.0}   SHEEN {:.0}",
                                        self.th.glass_streak, self.th.glass_sheen
                                    ),
                                    11.0,
                                )
                                .color(th.ok_ink),
                            );
                        });
                    });
                    let th = self.th;
                    ui.add_space(8.0);
                    ui.horizontal_top(|ui| {
                        // a panel is a column, so it is allocated as one: a width
                        // and a top-down layout, never the row's own direction
                        let col = egui::Layout::top_down(egui::Align::Min);
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
                                    if dro(
                                        ui,
                                        &th,
                                        name,
                                        col,
                                        &format!("{:.3}", v),
                                        t,
                                        self.driven,
                                    )
                                    .clicked()
                                    {
                                        self.pos[i] = 0.0;
                                        self.live = format!("{} ZEROED", name);
                                    }
                                }
                                ui.horizontal(|ui| {
                                    label(ui, &th, "FEED");
                                    lcd(ui, &th, if self.driven { "2400" } else { "0" });
                                    ui.with_layout(
                                        egui::Layout::right_to_left(egui::Align::Center),
                                        |ui| {
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
                                        },
                                    );
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
                    ui.add_space(18.0);
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
        viewport: egui::ViewportBuilder::default().with_inner_size([980.0, 860.0]),
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
