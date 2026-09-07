/* Gate (j) — ASSET INTEGRITY.  CLAUDE.md §3.5.11(gg)
 *
 * Every named asset the pack ships must carry ARTWORK.
 *
 * Why this gate exists: `ux-ui-library/icons/icons.json` presented itself as a
 * 25-glyph Material-Symbols set "keyed by purpose", and 24 of the 25 held no
 * path data at all.  The file was present, its keys resolved, and §3.5.5's
 * reference-integrity rule was satisfied by every one of them — because
 * reference integrity checks that a POINTER RESOLVES and never that the TARGET
 * HAS CONTENT.
 *
 * A build cannot follow what was not delivered, so it invents.  That is how the
 * print-invoice glyph became the Order Summary nav icon, and how the brand mark
 * became a hand-drawn circle.
 *
 * An asset that genuinely cannot be extracted is not a failure — but it must say
 * so in its own record, with the evidence (§3.5.11g).  An empty field that looks
 * like an oversight is the thing this gate forbids.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { PACK } from './config.mjs'

const __here = path.dirname(fileURLToPath(import.meta.url))
/* Resolve against the GATE's location, never the shell's cwd: `npm run`
 * invokes these from the package root. */
const pkg = (p) => path.resolve(PACK, p)


const ICONS = pkg('ux-ui-library/icons/icons.json')
const lib = JSON.parse(fs.readFileSync(ICONS, 'utf8'))

let ok = 0
const missing = []
const declared = []

/** A record counts as delivered when it carries non-empty geometry. */
function artwork(v) {
  if (!v || typeof v !== 'object') return false
  if (typeof v.svg === 'string' && v.svg.trim()) return true
  for (const key of ['d', 'paths']) {
    const val = v[key]
    if (Array.isArray(val) && val.join('').trim()) return true
    if (typeof val === 'string' && val.trim()) return true
  }
  return false
}

for (const family of ['materialSymbols', 'namedAssets', 'lucide', 'brand']) {
  const set = lib[family]
  if (!set) continue
  for (const [name, v] of Object.entries(set)) {
    if (name.startsWith('_')) continue          // family-level metadata
    if (artwork(v)) { ok++; continue }
    /* Not delivered. Is it HONEST about it? A status alone is not enough —
     * §3.5.11(g): an assertion of absence must cite what was inspected. */
    if (v && v.status && v.evidence) {
      declared.push(`${family}.${name} — ${v.status}`)
    } else {
      missing.push(`${family}.${name}` + (v && v.status ? ' (status, but NO evidence)' : ''))
    }
  }
}

for (const d of declared) console.log(`  ~   ${d}`)
for (const m of missing) console.log(`  X   ${m} — a NAME is not an ASSET`)

const label = `(j) asset integrity — every named asset carries artwork  (${ok} delivered` +
              `${declared.length ? `, ${declared.length} declared-absent` : ''})`
console.log(`\n${missing.length ? 'FAIL' : 'PASS'}  ${label}` +
            (missing.length ? `   ${missing.length} EMPTY` : ''))
process.exit(missing.length ? 1 : 0)
