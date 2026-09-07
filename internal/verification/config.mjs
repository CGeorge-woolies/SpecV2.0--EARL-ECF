/* The only file you edit to run the gates.
 *
 * There are three app-specific facts here and nowhere else. Every gate reads
 * them from this file, and the parity gate additionally reuses your
 * `spec-extract` config — the same one the extraction passes use — so a product
 * is described ONCE, in one place, rather than re-encoded per gate.
 *
 * (An earlier version of this kit hardcoded selectors, nav indices and
 * component names inside each gate. Pointed at a different product they failed
 * everywhere or passed while measuring nothing. If you find yourself adding a
 * selector to a gate file, it belongs in the app config instead.)
 */
import path from 'path'
import { pathToFileURL, fileURLToPath } from 'url'

/* fileURLToPath, not `new URL(...).pathname` — the latter stays percent-encoded,
 * so any path containing a space silently fails to open. */
const here = path.dirname(fileURLToPath(import.meta.url))

/** The HANDOVER PACK — the documents and prototype being verified against.
 *  A sibling of `internal/`, because the gates are OURS and do not ship. */
export const PACK = path.resolve(here, '..', '..', 'HANDOVER')

const local = (p) => path.resolve(PACK, p)

export const CONFIG = {
  /** 1. YOUR APP CONFIG — the same file `spec-extract` uses. The parity gate
   *  reads its screen matrix, entry gate, viewports and overlay recipes, so
   *  those are never restated here. */
  appConfig: path.resolve(here, '..', '..', 'spec-extract', 'config', 'myapp.config.mjs'),

  /** 2. THE BASELINE — the prototype shipped in the handover pack. Whatever the
   *  file is actually called; there is normally exactly one .html in there. */
  prototypeFile: local('prototype/build.html'),
  get prototype() { return pathToFileURL(this.prototypeFile).href },

  /** 3. YOUR BUILD — the thing being verified. A built file or a dev server. */
  buildFile: path.resolve(here, '..', 'build', 'index.html'),
  get build() { return pathToFileURL(this.buildFile).href },
  // buildFile: 'http://localhost:5173/',   // a dev server works too

  /** Viewports the visual gates run at. Defaults to the app config's own list
   *  when omitted, which is usually what you want — a gate that checks fewer
   *  widths than the extraction measured has a blind tier by construction. */
  viewports: null,
}

export default CONFIG

/** Fail with a sentence rather than a stack trace when the build is not there
 *  yet — which is the normal state on day one. */
export function requireBuild(fs) {
  if (fs.existsSync(CONFIG.buildFile)) return
  console.error([
    '',
    'No build found at:',
    '  ' + CONFIG.buildFile,
    '',
    'Drop a built index.html into internal/build/, or point',
    'internal/verification/config.mjs at your own output.',
    '',
  ].join('\n'))
  process.exit(2)
}
