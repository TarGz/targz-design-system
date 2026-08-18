# Bugs

This file tracks known bugs in the repo. Keep it up to date so any agent working on the code (Claude Code, etc.) knows the current state before making changes.

## How to use this file

- Add a new entry under **Open** when you find a bug.
- Keep descriptions short but precise: what happens, what should happen, how to reproduce.

---

## Open

### The HATCH page's two specimens render empty

**What happens.** `docs/skew-hatch.html` §03 and §04 build their boxes but no sheets appear.
The page script runs clean end to end (`node tools/run-page.mjs docs/skew-hatch.html` → OK) and
the engine produces geometry headlessly, so this is layout, not JS: `render()` bails when
`field.getBoundingClientRect().width` is 0.

**Next step.** Check whether the two `.hh-field` cream rectangles are present but empty, or absent
entirely. Those are different bugs. `.hh-field` is `flex:0 0 130px; height:136px` with a
`--paper` background, so if the box lays out at all they should be visible.

### The grid rig's body is missing `box-body`

`docs/skew-system.html:1281` builds `el('div', 'set-body gridbody')`. Every other body on the site
is `box-body` plus its own class, and `box-body` is what supplies the column, the padding and
`z-index:2` — which lifts contents above `.box::before`, the grain overlay. Without it the `gap`
is inert and the controls paint through the overlay. Same omission was fixed in the segment rig.

### The kit's `ENG` and PANELS' inline copy have drifted

`src/skew-kit.js:62` declares `ENG` with the plotter marks. `docs/skew-panels.html` carries its own
inline copy of the kit and has added `hhand`, `hcross`, `hrand` and `serp` to that copy, so the
canonical table has never had them. SYSTEM §01 has a trap row about these two copies; this is it
happening. `docs/skew-hatch.html` works around it with `Object.assign(ENG, …)`.

### `.intcell > .bay-cap` ships into dist

It names `bay-cap`, which is a part, so the build keeps the rule even though `.intcell` is
doc-only. Inert — it can only match inside `.intcell` — but it is doc CSS in the shipped file.

### `.seg` is dead in Portrait-Ribbons' vendored CSS

`.seg` was deleted here in 1.30.0. `Portrait-ribbons/assets/skew-kit.css` still carries it from an
earlier extraction, and nothing in that app uses it. Clears on the next
`node tools/kit-css.mjs --write` there.

---

### `quiet` on a factory's `set()` silences the SOUND but still fires `onChange`

**What happens.** Every factory takes `set(value, quiet)` and the kit's own comment says
the right thing — *"`quiet` is what a host's `set` passes: a sync is not an edit, and a
panel refreshed after a layer switch must not sound like one being played."* But in `knob`
(and the same shape in `fader`, `rangeFader`, `rotary`, `drum`) the guard covers only the
SFX:

```js
if (!quiet) {
  if (fell) SFX.clack();
  else if (notch(v) !== enc) SFX.step();
}
enc = notch(v);
paint(); onChange && onChange(v);      // ← outside the guard
```

So `wrap.set(v)` — the documented way for a host to push a value in — calls `onChange`
exactly as if a human had turned the control.

**What should happen.** `quiet` should suppress `onChange` too, which is what the comment
promises and what a host needs. A sync is not an edit.

**Why it matters, measured.** Portrait-Ribbons pushes a loaded config through 133 controls
via `.set()`. Each one fired its change handler; about two dozen of that app's parameters
carry a handler that reprocesses three image maps at ~60ms apiece. A portrait↔landscape
flip did **74ms of real work and then sat in a 1720ms long task**, rebuilding the same
three maps fifteen times. It presents as "the app is slow", not as "a callback fired", so
it costs a profiling session to find.

**Reproduce.** Give a `knob` an `onChange` that logs, then call `k.set(5)`. The log fires.

**Workaround in the adopter** (`Portrait-Ribbons/src/skew-panel.js`): a `syncing` flag the
panel raises around its refresh loop, checked before calling the app-level handler. It
works, but every adopter has to discover this the same way, and the fix belongs upstream —
one line, moving `onChange` inside the existing `if (!quiet)`.

**Note the second-order risk if it is fixed:** an app that has been relying on `.set()`
firing `onChange` to keep a mirror in step would go quiet. Worth a line in the changelog
rather than a silent correction.

---

## In Progress

---

## Notes for the agent

- Check this file before starting any task involving the affected areas.
- Do not close/remove an entry without confirming the fix.
- If you find a new bug while working, add it here instead of just fixing it silently.
