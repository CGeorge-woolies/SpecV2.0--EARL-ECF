/**
 * GATE — PARITY. Does the rebuild render what the prototype renders?
 *
 * ── WHY THERE IS ONE OF THESE INSTEAD OF EIGHT ──────────────────────────────
 *
 * This kit used to ship eight browser-driving gates — literals, navigation,
 * popovers, motion, drawers, expanders, census, pixel — each ~150 lines, and
 * every one of them hardcoded ONE product's selectors, nav indices and
 * component names. Pointed at a different prototype they either failed
 * everywhere or, worse, passed while measuring nothing. They were not gates so
 * much as a transcript of one engagement.
 *
 * They were also duplicating work. `spec-extract/src/` already drives a
 * prototype generically, four ways, and each pass returns STRUCTURED DATA:
 *
 *   census.mjs             resting screens, tables, triggers, routes, geometry
 *   census-open.mjs        overlays driven open, panels + enter/exit motion
 *   census-components.mjs  component recipes by style clustering
 *   census-states.mjs      scroll, disclosure, row and focus states
 *
 * So parity is not a new measurement problem. It is the SAME measurement, taken
 * twice and compared. This file runs whichever pass you name against the
 * prototype and against your build, and diffs the results.
 *
 * The consequence that matters: **the gates are prototype-agnostic for free.**
 * A product this kit has never seen is covered the moment its config is
 * written, because the gate has no opinions of its own — every app-specific
 * fact lives in that one config, which is exactly where the kit's own rules
 * say it belongs.
 *
 * ── WHAT A DIFFERENCE MEANS ─────────────────────────────────────────────────
 *
 * The prototype is the requirement. A difference is a defect in the BUILD until
 * someone rules otherwise — except where the spec deliberately diverges, which
 * is recorded in the divergence register and is the one case where the build
 * should differ.
 *
 * Usage:
 *   node verification/gate-parity.mjs --pass resting     [--screens a,b]
 *   node verification/gate-parity.mjs --pass open
 *   node verification/gate-parity.mjs --pass components
 *   node verification/gate-parity.mjs --pass states
 *   node verification/gate-parity.mjs --pass all
 */
import { pathToFileURL, fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { CONFIG } from './config.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d }

const PASSES = {
  resting:    { file: 'census.mjs',            fn: 'census',           label: 'resting layout' },
  open:       { file: 'census-open.mjs',       fn: 'censusOpen',       label: 'overlay open-state + motion' },
  components: { file: 'census-components.mjs', fn: 'censusComponents', label: 'component recipes' },
  states:     { file: 'census-states.mjs',     fn: 'censusStates',     label: 'scroll / disclosure / row / focus' },
}

/* Keys whose difference is never a finding: run metadata, and identifiers that
 * legitimately differ between two builds of the same thing. A diff that reports
 * these drowns the ones that matter, and a gate nobody reads is not a gate. */
const IGNORE = new Set([
  'generated', 'build', 'app', 'version', 'path', 'triggerPath', 'samples',
  'cls', 'literals', 'hiddenLiterals', 'imgs', 'routes', 'driverFailures',
])
/* Numeric slack. Sub-pixel layout differences between two engines rendering the
 * same CSS are not defects; a 4px shift is. */
const TOLERANCE = 2

function walk(a, b, path, out) {
  if (out.length > 400) return
  if (a === b) return
  const ta = a === null ? 'null' : Array.isArray(a) ? 'array' : typeof a
  const tb = b === null ? 'null' : Array.isArray(b) ? 'array' : typeof b

  if (ta === 'number' && tb === 'number') {
    if (Math.abs(a - b) > TOLERANCE) out.push({ path, proto: a, build: b })
    return
  }
  if (ta !== tb) { out.push({ path, proto: a, build: b }); return }
  if (ta === 'array') {
    if (a.length !== b.length) out.push({ path: `${path}.length`, proto: a.length, build: b.length })
    for (let i = 0; i < Math.min(a.length, b.length); i++) walk(a[i], b[i], `${path}[${i}]`, out)
    return
  }
  if (ta === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (IGNORE.has(k)) continue
      walk(a[k], b[k], path ? `${path}.${k}` : k, out)
    }
    return
  }
  if (a !== b) out.push({ path, proto: a, build: b })
}

async function runPass(passKey, buildPath, only) {
  const { file, fn } = PASSES[passKey]
  const mod = await import(pathToFileURL(join(HERE, '..', '..', 'spec-extract', 'src', file)).href)
  const appCfg = (await import(pathToFileURL(resolve(CONFIG.appConfig)).href)).default
  /* Register the target build as a throwaway version so the generic pass can
   * drive it with no knowledge that it is doing a comparison. */
  const cfg = { ...appCfg, versions: { ...appCfg.versions, __parity__: { build: buildPath, source: null } } }
  const { result } = await mod[fn](cfg, '__parity__', only)
  return result
}

const which = arg('pass', 'resting')
const only = arg('screens') ? arg('screens').split(',') : null
const passes = which === 'all' ? Object.keys(PASSES) : [which]

if (!passes.every((p) => PASSES[p])) {
  console.error(`\nUnknown pass "${which}". One of: ${Object.keys(PASSES).join(' · ')} · all\n`)
  process.exit(2)
}
if (!CONFIG.appConfig || !existsSync(resolve(CONFIG.appConfig))) {
  console.error(`\nSet \`appConfig\` in internal/verification/config.mjs to your app's spec-extract config.\n`)
  process.exit(2)
}
if (!existsSync(CONFIG.buildFile)) {
  console.error(`\nNo build found at:\n  ${CONFIG.buildFile}\n\nPoint \`build\`/\`buildFile\` in internal/verification/config.mjs at your output.\n`)
  process.exit(2)
}

let failed = 0
for (const p of passes) {
  console.log(`\nPARITY — ${PASSES[p].label}`)
  let A, B
  /* Each side gets its OWN try: a driver failure is reported AS a driver
   * failure and never folded into the comparison, or "the harness broke"
   * silently becomes "the build is wrong". */
  try { A = await runPass(p, CONFIG.prototypeFile, only) }
  catch (e) { console.log(`  DRIVER (prototype): ${String(e.message).split('\n')[0]}`); failed++; continue }
  try { B = await runPass(p, CONFIG.buildFile, only) }
  catch (e) { console.log(`  DRIVER (build): ${String(e.message).split('\n')[0]}`); failed++; continue }

  const diffs = []
  walk(A, B, '', diffs)
  if (!diffs.length) {
    console.log(`  ✓ no differences (tolerance ±${TOLERANCE}px)`)
    continue
  }
  failed++
  console.log(`  ✗ ${diffs.length} difference(s) — prototype is the requirement:`)
  for (const d of diffs.slice(0, 40)) {
    const fmt = (v) => (typeof v === 'object' ? JSON.stringify(v)?.slice(0, 60) : String(v)).slice(0, 60)
    console.log(`      ${d.path}\n          prototype: ${fmt(d.proto)}\n          build    : ${fmt(d.build)}`)
  }
  if (diffs.length > 40) console.log(`      … and ${diffs.length - 40} more`)
}

console.log(`\n${failed ? 'FAIL' : 'PASS'}  parity — ${passes.length - failed}/${passes.length} pass(es) clean\n`)
process.exit(failed ? 1 : 0)
