/* Gate (k) — HANDOVER COMPLETENESS.
 *
 * The pack's end goal (CLAUDE.md §1.1) is that {prototype + ux-ui-library +
 * functional specs + gates} can be handed to Engineering and built.  Every other
 * gate compares a BUILD to the prototype; this one asks whether the DOCUMENTS
 * are complete, per screen, without a build in the loop.
 *
 * It exists because the audits kept finding gaps on one screen that were equally
 * true of the other twelve — a defect surfaces where it happens to be noticed,
 * and fixing it there leaves eleven copies behind.
 *
 * Every check below is one a reviewer would otherwise have to do by eye on
 * ~15,000 lines of specification.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { PACK } from './config.mjs'

const __here = path.dirname(fileURLToPath(import.meta.url))
/* Resolve against the HANDOVER PACK, never the shell's cwd. The gates are ours
 * and live outside the pack they check (`internal/`), so this must not resolve
 * relative to the gate's own folder. */
const pkg = (p) => path.resolve(PACK, p)


const SPEC_DIR = pkg('functional-spec')
const LIB = fs.readFileSync(pkg('ux-ui-library/README.md'), 'utf8')

const files = fs.readdirSync(SPEC_DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_'))

/** Split into lines — several checks must judge a marker IN CONTEXT, because the
 *  specs discuss their own markers constantly ("Outstanding ⚠ EXTRACT: none"). */
const lines = (s) => s.split(/\r?\n/)

/** Split a spec into its `### ` component blocks. */
function blocks(src) {
  const out = []
  const re = /^### (.+)$/gm
  let m, prev = null
  while ((m = re.exec(src))) {
    if (prev) out.push({ title: prev.t, body: src.slice(prev.i, m.index) })
    prev = { t: m[1].trim(), i: m.index }
  }
  if (prev) out.push({ title: prev.t, body: src.slice(prev.i) })
  return out.filter((b) => /CMP-|RGN-/.test(b.title))
}

const CHECKS = [
  { id: 'A1', label: '§A1 present (what the screen depends on + its datasets)',
    test: (s) => /^## A1\./m.test(s) },

  { id: 'A1-vol', label: '§A1 datasets carry VOLUMES (so partial extraction is detectable)',
    test: (s) => {
      const m = s.match(/^## A1\.[\s\S]*?(?=^## B)/m)
      if (!m) return false
      if (!/\| *Dataset *\|/.test(m[0])) return true          // no fixture datasets on this screen
      /* A volume is a NUMBER attached to a thing: "**309 result rows**",
       * "**15 order lines**", "**4 totes**". Requiring digits-only bold
       * rejects every natural phrasing. */
      return /\*\*\d[\d,]*\b|\b\d+ (rows?|names|segments|columns?|entries|totes|lines|fields|items)\b/.test(m[0])
    } },

  { id: 'blocks', label: 'every component block has a Design requirement AND a Source',
    /* BOTH punctuation forms are accepted, deliberately. The template writes
     * `**Design requirement** *(…)*:` and `**Source** *(…)*:` — colon OUTSIDE
     * the bold — while this check used to demand `**Source:**` with the colon
     * INSIDE. An author following the template therefore could not pass the
     * gate, and the failure presents as the maximally alarming 0/N on every
     * spec at once, which reads like the specs are empty rather than like a
     * punctuation mismatch. The gate's real question is whether the block
     * DECLARES a design requirement and a source; where the colon sits is not
     * part of that question. */
    perBlock: (b) => /\*\*Design requirement:?\*\*/.test(b.body) && /\*\*Source:?\*\*/.test(b.body) },

  { id: 'extract', label: 'no unresolved ⚠ EXTRACT',
    /* Only an OPEN one counts. The specs discuss the marker constantly - a
     * legend line, and "Outstanding ⚠ EXTRACT: none" - and matching those
     * reports every clean screen as dirty. Verify the verifier (§3.5.10e). */
    test: (s) => !lines(s).some((l) =>
      /⚠ *EXTRACT/.test(l) && !/none|0 open|closed|Legend|is a|means|marker|= value still|provenance|§F filled|No outstanding/i.test(l)) },

  { id: 'unmeasured', label: 'no "still unmeasured" in §F (a live ⚠ that blocks rebuild-ready)',
    /* Same trap: the specs QUOTE the rule about "still unmeasured". */
    test: (s) => !lines(s).some((l) =>
      /still unmeasured/i.test(l) && !/is a LIVE|blocks rebuild|CLAUDE\.md|rule|Previously carried|previously|read as/i.test(l)) },

  { id: 'icon', label: 'no unnamed icon slot in a **Render** line (§5.1: name the glyph)',
    /* Narrowed deliberately. "an icon" appears constantly in prose — design
     * requirements, the §5.1 rule itself, do-not-build blocks — and flagging
     * those reports every screen. Only a RENDER line is a build instruction. */
    test: (s) => !lines(s).some((l) =>
      /^\s*[-*] \*\*Render[:—-]/.test(l) &&
      /\bicon\b/i.test(l) &&
      /* "Named" means ANY of: a backticked token (a purpose key, an asset
       * filename, a size variant), a §-reference that resolves, the word
       * glyph, or icons.json. A bare "an icon" with none of those is the
       * unnamed slot §5.1 forbids. */
      !/`[^`]+`|§ ?\d+\.\d+|glyph|icons\.json/i.test(l)) },

  { id: 'lib-ref', label: 'every ux-ui-library §-reference resolves to a real section',
    test: (s) => {
      const refs = [...s.matchAll(/ux-ui-library[^§]{0,40}§ ?(\d+(?:\.\d+)*[a-z]?)/g)].map((m) => m[1])
      return refs.every((r) => new RegExp('^#+ +' + r.replace('.', '\\.') + '\\b', 'm').test(LIB))
    },
    detail: (s) => {
      const refs = [...s.matchAll(/ux-ui-library[^§]{0,40}§ ?(\d+(?:\.\d+)*[a-z]?)/g)].map((m) => m[1])
      return [...new Set(refs.filter((r) =>
        !new RegExp('^#+ +' + r.replace('.', '\\.') + '\\b', 'm').test(LIB)))].join(' ')
    } },

  { id: 'table-scale', label: 'a screen with a data table states its cell scale (or cites §4.0a)',
    test: (s) => {
      if (!/<table|Columns \(verbatim/i.test(s)) return true       // no table on this screen
      return /py-\[?\d|py-\d|§ ?4\.0a|px-\d py-\d|cell padding|row height/i.test(s)
    } },
]

let fails = 0
const rows = []

for (const f of files) {
  const src = fs.readFileSync(path.join(SPEC_DIR, f), 'utf8')
  const bs = blocks(src)
  const bad = []
  for (const c of CHECKS) {
    if (c.perBlock) {
      const missing = bs.filter((b) => !c.perBlock(b))
      if (missing.length) bad.push(`${c.id}(${missing.length}: ${missing.slice(0, 2).map((m) => m.title.replace(/`/g, '').split('—')[0].trim()).join(', ')})`)
    } else if (!c.test(src)) {
      bad.push(c.id + (c.detail ? `(${c.detail(src)})` : ''))
    }
  }
  if (bad.length) fails++
  rows.push({ f, n: bs.length, bad })
}

console.log('spec'.padEnd(34), 'cmps', ' result')
for (const r of rows) {
  console.log(r.f.padEnd(34), String(r.n).padStart(4),
              r.bad.length ? '  X  ' + r.bad.join(' · ') : '  OK')
}
console.log('\nChecks: ' + CHECKS.map((c) => c.id).join(' · '))
CHECKS.forEach((c) => console.log(`  ${c.id.padEnd(11)} ${c.label}`))
console.log(`\n${fails ? 'FAIL' : 'PASS'}  (k) handover completeness — ` +
            `${rows.length - fails}/${rows.length} specs clean`)
process.exit(fails ? 1 : 0)
