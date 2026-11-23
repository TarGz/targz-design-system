//! The sound bank — `SFX` from `src/skew-kit.js`, ported voice for voice.
//!
//! Every number here is the kit's. Two generators, as there:
//!
//! * **strike** — a slice of white noise through a bandpass (`f` is what the
//!   part rings at, `Q` how dead it is), with an optional sine "body" under it
//!   that drops to 78% of its pitch as it dies. That is the press of a key.
//! * **blip** — a falling square wave. The knob's ratchet and nothing else: an
//!   encoder's notch is the one part that really rings at a pitch.
//!
//! Nothing repeats exactly: frequency ±6%, level ±15%, fresh noise every time.
//! Strikes are scaled by `MASTER` (0.55); the ratchet goes out at its own level.
//!
//! The samples are rendered on the calling thread (a few hundred of them) and
//! handed to one audio thread that owns the output stream, so a host's UI
//! thread never blocks on the device. With no audio device every call is a
//! silent no-op and every control still works.
//!
//! Behind the `sound` cargo feature (on by default). Without it the same
//! functions exist and do nothing.

use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};

/// Notches across a knob's travel — the kit's `ENC`. The ratchet ticks per
/// notch, not per step, so a 0–360 knob ratchets 40 times, not 360.
pub const ENC: f32 = 40.0;

const SR: u32 = 44_100;
const MASTER: f32 = 0.55;

static ON: AtomicBool = AtomicBool::new(true);
static SEED: AtomicU64 = AtomicU64::new(0);

/// Sound on or off for the whole panel.
pub fn set_on(on: bool) {
    ON.store(on, Ordering::Relaxed);
}
pub fn is_on() -> bool {
    ON.load(Ordering::Relaxed)
}

// ── a tiny xorshift, so nothing ever repeats and no crate is pulled in ─────
fn rnd() -> f32 {
    let mut x = SEED.load(Ordering::Relaxed);
    if x == 0 {
        x = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos() as u64)
            .unwrap_or(0x9E37_79B9_7F4A_7C15)
            | 1;
    }
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    SEED.store(x, Ordering::Relaxed);
    (x >> 40) as f32 / (1u64 << 24) as f32
}
fn vary(a: f32, b: f32) -> f32 {
    a + rnd() * (b - a)
}

/// WebAudio's envelope pair: a linear ramp to `peak` over `attack`, then an
/// exponential ramp to 0.0001 at `end`.
fn env(t: f32, start: f32, peak: f32, attack: f32, end: f32) -> f32 {
    if t < attack {
        start + (peak - start) * t / attack
    } else if t < end {
        peak * (0.0001 / peak).powf((t - attack) / (end - attack))
    } else {
        0.0
    }
}

/// An impact: noise through a bandpass, over an optional thud.
fn strike(f: f32, q: f32, dur: f32, g0: f32, body: Option<(f32, f32, f32)>) -> Vec<f32> {
    let total = dur + 0.02;
    let total = body.map_or(total, |(_, _, bd)| total.max(bd + 0.02));
    let n = (total * SR as f32) as usize;
    let mut out = vec![0.0_f32; n];

    // RBJ bandpass, constant 0 dB peak gain — WebAudio's `bandpass`
    let w0 = std::f32::consts::TAU * f * vary(0.94, 1.06) / SR as f32;
    let alpha = w0.sin() / (2.0 * q);
    let a0 = 1.0 + alpha;
    let (b0, b2) = (alpha / a0, -alpha / a0);
    let (a1, a2) = (-2.0 * w0.cos() / a0, (1.0 - alpha) / a0);
    let (mut x1, mut x2, mut y1, mut y2) = (0.0, 0.0, 0.0, 0.0);
    let peak = g0 * MASTER * vary(0.85, 1.15);
    let src = ((dur + 0.01) * SR as f32) as usize;
    for (i, s) in out.iter_mut().enumerate().take(src.min(n)) {
        let x = rnd() * 2.0 - 1.0;
        let y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2;
        x2 = x1;
        x1 = x;
        y2 = y1;
        y1 = y;
        *s = y * env(i as f32 / SR as f32, 0.0001, peak, 0.0005, dur);
    }

    if let Some((bf, bg, bd)) = body {
        // a struck body drops slightly in pitch as it dies
        let f0 = bf * vary(0.96, 1.04);
        let f1 = bf * 0.78;
        let peak = bg * MASTER * vary(0.85, 1.15);
        let mut ph = 0.0_f32;
        for (i, s) in out.iter_mut().enumerate() {
            let t = i as f32 / SR as f32;
            if t > bd + 0.02 {
                break;
            }
            let fr = f0 * (f1 / f0).powf((t / bd).min(1.0));
            ph += std::f32::consts::TAU * fr / SR as f32;
            *s += ph.sin() * env(t, 0.0001, peak, 0.001, bd);
        }
    }
    out
}

/// The ringing voice: a square wave falling `f0 → f1` over 45% of `dur`,
/// through an exponential decay from `g0`.
fn blip(f0: f32, f1: f32, g0: f32, dur: f32) -> Vec<f32> {
    let n = (dur * 1.25 * SR as f32) as usize;
    let mut ph = 0.0_f32;
    (0..n)
        .map(|i| {
            let t = i as f32 / SR as f32;
            let fr = f0 * (f1 / f0).powf((t / (dur * 0.45)).min(1.0));
            ph = (ph + fr / SR as f32).fract();
            let sq = if ph < 0.5 { 1.0 } else { -1.0 };
            let g = if t < dur { g0 * (0.0001 / g0).powf(t / dur) } else { 0.0 };
            sq * g
        })
        .collect()
}

#[cfg(feature = "sound")]
mod out {
    use std::sync::mpsc::{channel, Sender};
    use std::sync::{Mutex, OnceLock};

    static TX: OnceLock<Option<Mutex<Sender<Vec<f32>>>>> = OnceLock::new();

    /// Built lazily, on the first sound, like the kit's AudioContext.
    pub fn play(samples: Vec<f32>) {
        let tx = TX.get_or_init(|| {
            let (tx, rx) = channel::<Vec<f32>>();
            let ok = std::thread::Builder::new()
                .name("skew-sfx".into())
                .spawn(move || {
                    let Ok((_stream, handle)) = rodio::OutputStream::try_default() else {
                        return;
                    };
                    while let Ok(s) = rx.recv() {
                        let _ = handle.play_raw(rodio::buffer::SamplesBuffer::new(1, super::SR, s));
                    }
                })
                .is_ok();
            ok.then(|| Mutex::new(tx))
        });
        if let Some(tx) = tx {
            if let Ok(tx) = tx.lock() {
                let _ = tx.send(samples);
            }
        }
    }
}

#[cfg(not(feature = "sound"))]
mod out {
    pub fn play(_: Vec<f32>) {}
}

fn emit(make: impl FnOnce() -> Vec<f32>) {
    if is_on() {
        out::play(make());
    }
}

// ── the voices, with the kit's numbers ──────────────────────────────────────
//                                         f     Q    dur    lvl   body  lvl   dur

/// One notch of an encoder.
pub fn step() {
    emit(|| blip(3100.0, 2000.0, 0.012, 0.010));
}
/// A cap bottoming out on its skirt — hard and light, a whisper of mass.
pub fn press() {
    emit(|| strike(1800.0, 1.4, 0.009, 0.34, Some((200.0, 0.018, 0.028))));
}
/// And springing back to its top stop — lighter, brighter, no mass at all.
pub fn release() {
    emit(|| strike(3200.0, 1.8, 0.005, 0.11, None));
}
/// A fader cap lifted off its track — damped, nothing rings.
pub fn grab() {
    emit(|| strike(980.0, 0.9, 0.011, 0.15, None));
}
/// And set back down on it.
pub fn drop() {
    emit(|| strike(800.0, 1.0, 0.014, 0.17, Some((160.0, 0.014, 0.030))));
}
/// The cap brushing one printed mark of its scale — the quietest, deadest
/// strike in the bank. One per mark crossed, [`MARKS`] to the travel.
pub fn slide() {
    emit(|| strike(1400.0, 1.2, 0.004, 0.05, None));
}

/// Marks on a fader's scale — the fifths the ticks print.
pub const MARKS: f32 = 20.0;
