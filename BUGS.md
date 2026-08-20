# Bugs

This file tracks known bugs in the repo. Keep it up to date so any agent working on the code (Claude Code, etc.) knows the current state before making changes.

## How to use this file

- Add a new entry under **Open** when you find a bug.
- Keep descriptions short but precise: what happens, what should happen, how to reproduce.

---

## Open

### PANELS carries a second copy of the kit, and five parts have already drifted

`docs/skew-panels.html` has an inline copy of the kit rather than loading `src/skew-kit.js` —
**35 colliding top-level names**. Measured: 30 are byte-identical, **5 have diverged** —
`knob`, `rotary`, `rangeFader`, `engage`, `ENG`. So the page is running older versions of three
controls than the ones the language documents, silently.

**What it costs right now.** No new kit part can reach that page. The orbit ball (SYSTEM 12) was
written for the viewport — it is what drives yaw, pitch and roll — and had to be mounted on SYSTEM
instead, because a classic script cannot load beside 35 duplicate `const`s.

**Fix.** Delete the 30 identical definitions from the inline script and load the kit; the 5 that
diverged need a look first, since adopting the kit's versions is a visible change to how those
controls behave on that page. `docs/index.html` was the same problem and took two deletions —
this one is bigger but the same shape.

`docs/skew-machine.html` already loads the kit, so it is only this one page.

### Clicking the OUTER FRAME of a `.piano` still does nothing

The gutters BETWEEN keys are fixed — each key reaches half the gap through `.pkey::before`. The
group's own padding, the 5-6px frame around the whole strip, is still inert by design: the case a
key is set into is not a key. If that reads as the same bug rather than as the edge of the part,
the first and last key can be given the outer reach too; it needs `:first-child`/`:last-child`
and `.hb-tabs` is a grid with non-key children, so it is not a one-liner.

### The HATCH page's two specimens render empty

**What happens.** `docs/skew-hatch.html` §03 and §04 build their boxes but no sheets appear.
The page script runs clean end to end (`node tools/run-page.mjs docs/skew-hatch.html` → OK) and
the engine produces geometry headlessly, so this is layout, not JS: `render()` bails when
`field.getBoundingClientRect().width` is 0.

**Next step.** Check whether the two `.hh-field` cream rectangles are present but empty, or absent
entirely. Those are different bugs. `.hh-field` is `flex:0 0 130px; height:136px` with a
`--paper` background, so if the box lays out at all they should be visible.

### `.seg` is dead in Portrait-Ribbons' vendored CSS

`.seg` was deleted here in 1.30.0. `Portrait-ribbons/assets/skew-kit.css` still carries it from an
earlier extraction, and nothing in that app uses it. Clears on the next
`node tools/kit-css.mjs --write` there.

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
