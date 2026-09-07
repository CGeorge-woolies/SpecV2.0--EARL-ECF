# Single-File Share Build (Template)

Recipe for producing a single portable `.html` file (no server, opens via
`file://`, works in an email/Slack attachment) from a Vite + React app, with a
lightweight version counter baked into the UI. Copy this pattern into another
Claude Code project with a similar stack.

## Prompt to reuse

> Add a "share build" to this Vite + React app: a single self-contained HTML
> file (JS/CSS inlined, no external requests) that can be opened directly from
> disk via `file://`, for sending to people without a dev server. Bake a
> version number + "as at" timestamp into the app's header/footer, bumped
> interactively at build time. Follow the pattern: `vite-plugin-singlefile`
> for a `share` build mode, a `version.json` read at build/runtime, and an
> interactive Node build script that prompts to bump the version before
> building and renames the output to include the version number.

## Pieces

**1. `vite-plugin-singlefile`** (devDependency) — inlines all JS/CSS into the
HTML output so it needs no server.

**2. `vite.config.ts`** — add a `share` mode that sets `base: './'` (relative
asset paths, required for `file://`) and only applies the singlefile plugin in
that mode. Normal `dev`/`build` stay untouched.
```ts
base: mode === 'share' ? './' : '/',
plugins: [
  ...(mode === 'share' ? [viteSingleFile()] : []),
],
```
Note: Chrome blocks `type="module"` script fetches over `file://` — that's
why inlining (not just relative paths) is required.

**3. `src/version.json`** — `{ "version": "1.0", "timestamp": "<ISO>" }`,
committed to the repo. Source of truth for the version shown in the UI.

**4. `src/version.ts`** — reads `version.json`, exports a formatted label
(`APP_NAME - Version X.X - as at DD/MM/YYYY HH:MM`) for use in the app header
or footer.

**5. `scripts/build-share.mjs`** — Node script run via `npm run build:share`:
- Reads current version from `version.json`.
- If run in an interactive TTY, prompts: Enter/`y` = bump by +0.1, type an
  exact version (e.g. `2.0`), or `n` = keep current. Non-interactive shells
  skip the prompt and keep the current version (safe for CI/agents).
- On bump, rewrites `version.json` with the new version + fresh timestamp.
- Runs `tsc -b && vite build --mode share`.
- Renames `dist/index.html` → `dist/<app-name>-v-<version>.html` (dots →
  dashes) so multiple versions can sit side by side in `dist/`.

**6. `package.json`**
```json
"scripts": {
  "build:share": "node scripts/build-share.mjs"
}
```

## Result

`npm run build:share` → prompts for a version bump → produces
`dist/<app-name>-v-1-4.html`, a single file with the version/timestamp
visible in the running app, ready to send as-is.
