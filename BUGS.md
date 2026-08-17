# Bugs

This file tracks known bugs in the repo. Keep it up to date so any agent working on the code (Claude Code, etc.) knows the current state before making changes.

## How to use this file

- Add a new entry under **Open** when you find a bug.
- Keep descriptions short but precise: what happens, what should happen, how to reproduce.

---

## Open

### `physical-ui-layers.html` — the Materials count crashes the end of the script

`physical-ui-layers.html` ends with

```js
document.getElementById('mat-count').textContent = WORDS[tiles.length] || tiles.length;
```

but no element with `id="mat-count"` exists in the markup — the §11 Materials paragraph
that used to carry the `<span>` no longer has it. The page throws
`TypeError: Cannot set properties of null (setting 'textContent')` on load.

Impact is small (it is the last statement in the file, so everything else has already
built) but it is a real console error on every load, and the self-writing count the
comment above it describes never gets written.

**Reproduce:** open the page, look at the console.

**Fix:** put `<span id="mat-count"></span>` back in the Materials `<p class="sub">` —
the sentence is "The count writes itself." and it should read e.g. "Thirteen primitives
carry every component above."

**Not mine:** confirmed pre-existing — a copy of the file taken before the jog section
was moved out crashes identically. Left for whoever owns that document.

---

## In Progress

---

## Notes for the agent

- Check this file before starting any task involving the affected areas.
- Do not close/remove an entry without confirming the fix.
- If you find a new bug while working, add it here instead of just fixing it silently.
