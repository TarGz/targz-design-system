## Development Guidelines

- Only commit when I ask
- Never mention Claude Code in commits
- Never add Co-Authored-By lines to commits
- USER is the one who tests — anything VISUAL is his to judge; Claude says what to test and what to check, nerver use playwright

## Versioning

- Every commit must include a version bump in `version.js`
- Follow semver: Major (breaking changes), Minor (new features), Fix/Patch (bug fixes)
- Always update the CHANGELOG array in `version.js` with the current date and list of changes


## BUG.md file template
# Bugs

This file tracks known bugs in the repo. Keep it up to date so any agent working on the code (Claude Code, etc.) knows the current state before making changes.

## How to use this file

- Add a new entry under **Open** when you find a bug.
- Keep descriptions short but precise and short, very close from the USER prompt, One title on short descritpion 100 char MAX
- Remove the entry once implemented — it's recorded in `version.js` and the commit, not here.

---

## Open

### Short title of the bug
100 char MAX



# FEATURES-REQUEST.md template

This file tracks feature requests in the repo. Keep it up to date so any agent working on the code (Claude Code, etc.) knows what's planned before making changes.

## How to use this file

- Add a new entry under **Open** when you think of a feature.
- Remove the entry once implemented — it's recorded in `version.js` and the commit, not here.
- Keep descriptions short but precise and short, very close from the USER prompt, One title on short descritpion 100 char MAX

---

## Open

<!-- Duplicate the block above for each new request -->
### Short title of the bug
100 char MAX


## Targz Launchpad compatibility

Every project must be launchable by Targz Launchpad (`~/Documents/GIT/_targz-launchpad`,
reference: `NEW_PROJECT_GUIDE.md`) on any of my machines.

- Project lives at `~/Documents/GIT/<project>`, or one level nested at `~/Documents/GIT/<group>/<project>`
- **Declare the port explicitly** in the `dev` (or `start`) script: `"dev": "exec node server.js --port 5173"`.
  The launcher finds the port by regex-matching `--port <n>` in that script; with no flag it can only
  auto-assign from 2850, so the port is never predictable and it cannot track a running instance.
- **Never start the script with a bare `node`** — write `exec node …`, or point it at a shebang'd
  executable. The launcher is a `pkg`-built binary and pkg replaces a spawned `node` with its own
  executable path, unquoted. That path is `/Applications/Targz Launchpad.app/Contents/MacOS/server`,
  so the space splits it and the launch dies with `sh: /Applications/Targz: No such file or directory`
  — while the launcher still reports success and opens a dead page. Any other leading token is safe
  (`vite`, `live-server`, `npx …` were never affected).
- **Accept both spellings** — `--port 5173` and `--port=5173` — because the launcher rewrites the flag
  to `--port=<assigned>` on launch. It also sets `PORT` in the env. Precedence: flag, then `PORT`, then default.
- Serve something on `/`: the launcher health-checks `http://localhost:<port>` and any HTTP response
  counts as ready. For a single-page app, serve `index.html` for extensionless paths that are not real assets.
- Add a `description` to `package.json` — it shows on the dashboard card
- Jekyll: set `port:` in `_config.yml`, or `--port` in `startlocaldev.sh`. No `package.json` → treated as
  static and run with `npx live-server`.

When a launch "says started but the page is dead": `startProject` always returns `{ok: true}` — it
discards the health-check result and short-circuits on a stale in-memory `running` entry without
checking the process is alive (quitting and relaunching the app clears that map). The launcher spawns
with `stdio: 'ignore'`, so to see the real error, temporarily append `> /tmp/dev.log 2>&1` to the dev script.

## Instructions Sync

At the start of each conversation, compare the global CLAUDE.md (`~/.claude/CLAUDE.md`) with this
project-local CLAUDE.md. Then:
1. Copy any rules from the global file that are missing here
2. If a rule exists in both but differs, ask which version to keep
3. If this file has rules not present globally, leave them (they are project-specific)

## This project

- `old/index.html` is the shipping design system, the light-palette one. It is a **self-contained bundle**: the real markup is
  JSON-escaped onto a single line inside `<script type="__bundler/template">`. To edit it, decode that line
  with `JSON.parse`, change the HTML, then re-encode with `JSON.stringify(...).replace(/\//g, '\\u002F')` —
  escaping every `/` is what stops a literal `</script>` from breaking out of the host tag. Verify the
  payload decodes back byte-identically before saving.
- The document defines its own `--tg-*` tokens in one inline `<style>`. No external CSS, no other files.
- Note the drift worth resolving one day: this document's palette (`--tg-orange #F26B1F`, canvas `#FDF1E8`
  + ruled grid) is **not** what the apps ship. `_targz-launchpad`, `Portrait-Cubes`, `Portrait-DNA`,
  `Portrait-bubbles` and `Portrait-Ribbons` all use `--primary #FF6A00`, `--bg #F5F3F0` and radii 16/10/100,
  documented in `_targz-launchpad/theme/STYLEGUIDE.md`.
- Never invent a value — if a component is not in a real app, it does not belong here.
- Dev port is **2860**.
