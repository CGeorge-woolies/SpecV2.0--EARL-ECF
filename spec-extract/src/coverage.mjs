/**
 * COVERAGE RECONCILIATION — the closed loop.
 *
 * ── THE DEFECT THIS EXISTS TO MAKE IMPOSSIBLE ───────────────────────────────
 *
 * A first run of this kit produced 335 live `⚠ EXTRACT` markers and a spec-
 * completeness gate that failed 15 of 19 documents. None of it was carelessness.
 * Two holes in the pipeline made it the DETERMINISTIC outcome:
 *
 *   1. The resting census could not measure open states or motion, but the spec
 *      template required both. Closed by `census-open.mjs`.
 *
 *   2. NOTHING RECONCILED WHAT EXISTS AGAINST WHAT WAS MEASURED. `config.screens`
 *      is hand-authored, so anything its author did not think to list was
 *      invisible; an overlay nobody enumerated produced no measurement, the
 *      spec author wrote `⚠ EXTRACT` and moved on, and the marker survived all
 *      the way into the handover. The gate at the END of the line caught the
 *      symptom (a marker in prose) long after the cheap moment to fix it (a
 *      missing measurement) had passed. This file closes that.
 *
 * ── THE RULE ────────────────────────────────────────────────────────────────
 *
 * Every overlay the census DISCOVERED must end in exactly one of three states:
 *
 *   MEASURED  — `census-open.mjs` drove it open and recorded it.
 *   WAIVED    — the config names it out of scope, WITH A REASON. An absent
 *               overlay and a deliberately-excluded one must never look alike.
 *   UNMEASURABLE — classified with its evidence (a native `<select>` popup is
 *               drawn by the OS and has no DOM). Honest classification, not a
 *               silent skip: "a confidently wrong list is worse than no list".
 *
 * Anything in none of those three is a HOLE, and this exits non-zero naming it
 * — before a spec is written, when the fix is one config stanza rather than a
 * hunt through 10,000 lines of markdown.
 *
 * It also reads the specs (when they exist) and reports every live `⚠ EXTRACT`
 * against the measurement that would close it, so the remaining markers are a
 * worklist with owners rather than a number in a gate report.
 *
 * Usage:  node src/coverage.mjs --config <path> --version <v> [--strict]
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name)
  return i > -1 ? process.argv[i + 1] : fallback
}
const has = (name) => process.argv.includes('--' + name)

const cfgPath = arg('config', join(HERE, '..', 'config', 'myapp.config.mjs'))
const version = arg('version', 'v1')
const config = (await import(pathToFileURL(cfgPath).href)).default

const censusFile = join(HERE, '..', 'out', 'census', `${version}.json`)
const openFile = join(HERE, '..', 'out', 'open-census', `${version}.json`)

if (!existsSync(censusFile)) {
  console.error(`\nNo resting census at ${censusFile}\n  run: node src/census.mjs --config ${basename(cfgPath)} --version ${version}\n`)
  process.exit(2)
}
const census = JSON.parse(readFileSync(censusFile, 'utf8'))
const open = existsSync(openFile) ? JSON.parse(readFileSync(openFile, 'utf8')) : null

console.log(`\nCOVERAGE — ${config.id} ${version}`)

/* ── 1. What the resting census DISCOVERED ─────────────────────────────────
 * The resting probe already counts triggers by kind on every screen. That
 * count is the denominator nobody was using: it is the app telling us how many
 * overlays exist, screen by screen, for free. */
const discovered = []
for (const [screenId, sc] of Object.entries(census.screens)) {
  const vps = Object.values(sc.viewports).filter(Boolean)
  if (!vps.length) continue
  /* Take the MAXIMUM across viewports, not the first. A trigger that only
   * renders above a breakpoint exists and must be measured; taking one
   * viewport's count would silently drop it. */
  const kinds = {}
  for (const m of vps) {
    for (const [kind, n] of Object.entries(m.triggers ?? {})) {
      if (kind === 'dual-kind') continue // a cross-tabulation, not a population
      kinds[kind] = Math.max(kinds[kind] ?? 0, n)
    }
  }
  for (const [kind, n] of Object.entries(kinds)) {
    if (n > 0) discovered.push({ screenId, kind, count: n })
  }
}
const discoveredTotal = discovered.reduce((a, d) => a + d.count, 0)

/* ── 2. What the open census MEASURED ───────────────────────────────────────
 *
 * SAMPLING, NOT EXHAUSTION — and why that is the correct rule rather than a
 * concession. This app's resting census discovers 2,987 tooltip triggers on one
 * screen: one per table cell. They are 2,987 instances of ONE recipe, and a
 * spec needs the recipe, not 2,987 identical boxes. Opening all of them would
 * take hours and produce a document nobody can read.
 *
 * So the unit of coverage is the (screen, kind) pair, and the requirement is a
 * SAMPLE of `sampleSize` per pair. The remainder is "represented by sample" —
 * stated explicitly, never silently dropped.
 *
 * The sample is only honest if the instances really are alike, so the samples
 * within a pair are COMPARED: if their geometry or box model disagrees beyond a
 * tolerance, that pair holds more than one recipe and the sample must widen.
 * That check is what stops sampling from becoming an excuse. */
/** The two passes name the same thing differently — the resting probe uses the
 *  slot attribute it counted (`base-ui-click-trigger`), the open pass uses its
 *  own taxonomy (`click-trigger`). Naive suffix-stripping silently produced
 *  `base-ui-click` vs `click` and reported 24 discovered / 0 sampled for a kind
 *  that was fully measured — a reconciliation that cannot reconcile is worse
 *  than none, because it manufactures holes and trains you to ignore it. */
const KIND_ALIASES = {
  'base-ui-click-trigger': 'click',
  'click-trigger': 'click',
  'popover-trigger': 'popover',
  'tooltip-trigger': 'tooltip',
  'select-trigger': 'select',
  'dialog-trigger': 'dialog',
  'menu-trigger': 'menu',
  'native-select': 'native-select',
}
const normKind = (k) => KIND_ALIASES[k] ?? String(k).replace(/-trigger$/, '')

const measuredByScreen = {}
const measuredByPair = {}          // `${screenId}/${normKind}` -> array of overlay records
let measuredTotal = 0, unmeasurableTotal = 0, noPanelTotal = 0
if (open) {
  for (const [screenId, sc] of Object.entries(open.screens)) {
    const m = { measured: 0, unmeasurable: 0, noPanel: 0 }
    for (const o of sc.overlays) {
      if (o.measurable === false) m.unmeasurable++
      else if (o.opened) m.measured++
      else m.noPanel++
      const key = `${screenId}/${normKind(o.kind)}`
      ;(measuredByPair[key] ??= []).push(o)
    }
    measuredByScreen[screenId] = m
    measuredTotal += m.measured
    unmeasurableTotal += m.unmeasurable
    noPanelTotal += m.noPanel
  }
}

const SAMPLE_SIZE = config.overlays?.sampleSize ?? 3

/** Do the sampled panels in one (screen, kind) actually look like one recipe?
 *
 *  Compared on STYLE, never on SIZE. A tooltip's width follows its label text
 *  and a popover's height follows its content — two correct instances of one
 *  recipe differ in both. Including size flagged every tooltip pair in this app
 *  as "two recipes", which is a false positive that would push an author to
 *  widen a sample that was already representative.
 *
 *  What actually defines the recipe is the styling a builder must reproduce:
 *  radius, background, padding, border, shadow, z-index, type. Position is
 *  excluded for the same reason as size — one recipe opens in many places. */
function oneRecipe(records) {
  const panels = records.filter((r) => r.opened && r.panel?.found)
  const shapes = panels.map((r) => JSON.stringify({
    radius: r.panel.style?.borderRadius,
    bg: r.panel.style?.background,
    pad: r.panel.style?.padding,
    border: r.panel.style?.border,
    shadow: r.panel.style?.boxShadow,
    z: r.panel.style?.zIndex,
    font: r.panel.style?.font,
  }))
  const sizes = panels.map((r) => `${r.panel.box.w}x${r.panel.box.h}`)
  return { distinct: new Set(shapes).size, sampled: shapes.length, sizes }
}

/* ── 3. Waivers — out of scope, with a reason ─────────────────────────────── */
const waivers = (config.overlays?.waivers ?? []).map((w) => ({ match: String(w.match), reason: w.reason }))
const waivedRe = waivers.map((w) => new RegExp(w.match))
const unreasoned = waivers.filter((w) => !w.reason || !String(w.reason).trim())

/* ── 4. The holes ─────────────────────────────────────────────────────────── */
const holes = []
if (!open) {
  holes.push({
    kind: 'no-open-census',
    detail: `${discoveredTotal} overlay triggers discovered across ${discovered.length} screen/kind pairs, and the open-state census has never been run for ${version}.`,
    fix: `node src/census-open.mjs --config ${basename(cfgPath)} --version ${version}`,
  })
} else {
  for (const d of discovered) {
    const m = measuredByScreen[d.screenId]
    if (!m) {
      if (waivedRe.some((re) => re.test(`${d.screenId}/${d.kind}`))) continue
      holes.push({
        kind: 'screen-not-open-censused',
        detail: `${d.screenId}: ${d.count} ${d.kind} trigger(s) discovered by the resting census; this screen was never visited by the open-state pass.`,
        fix: `include "${d.screenId}" in the open-state run, or waive it in config.overlays.waivers with a reason`,
      })
    }
  }
  /* Per (screen, kind): is there a sample, and is one sample honest? */
  for (const d of discovered) {
    const key = `${d.screenId}/${normKind(d.kind)}`
    if (waivedRe.some((re) => re.test(key))) continue
    const recs = measuredByPair[key] ?? []
    const usable = recs.filter((r) => r.opened || r.measurable === false || r.opened === false)
    const required = Math.min(d.count, SAMPLE_SIZE)

    if (usable.length < required) {
      holes.push({
        kind: 'no-sample',
        detail: `${d.screenId}: ${d.count} × ${d.kind} discovered, only ${usable.length} of the required ${required} sampled.`,
        fix: `raise config.overlays.sampleSize, add an opening recipe for this kind, or waive "${key}" with a reason`,
      })
      continue
    }

    /* A sample is only a fair representative if the instances agree. */
    const shape = oneRecipe(recs)
    if (shape.sampled >= 2 && shape.distinct > 1) {
      holes.push({
        kind: 'multiple-recipes',
        detail: `${d.screenId}: the ${shape.sampled} sampled ${d.kind} panels resolve to ${shape.distinct} DIFFERENT shapes — this pair holds more than one recipe, so a sample of ${required} does not represent the other ${d.count - required}.`,
        fix: `raise config.overlays.sampleSize for this app, or split the kind with an explicit opening recipe per variant`,
      })
    }
  }
}
/* A CONFIGURED RECIPE THAT NEVER OPENED IS A HOLE.
 *
 * Manual recipes are not in the auto-discovered set, so nothing above would
 * notice one that silently stopped working — and a recipe is exactly the thing
 * that rots, because it encodes an interaction path (a label, a precondition, a
 * gate) rather than a selector the app maintains. A recipe that breaks and says
 * nothing is worse than no recipe, because the config still claims coverage. */
const recipesConfigured = config.overlays?.extra ?? []
if (open && recipesConfigured.length) {
  const measuredRecipes = Object.values(open.screens)
    .flatMap((s) => s.overlays)
    .filter((o) => o.recipe && o.opened)
    .map((o) => String(o.id).split('manual:')[1])
  for (const rec of recipesConfigured) {
    if (waivedRe.some((re) => re.test(`${rec.screen}/manual:${rec.id}`))) continue
    if (!measuredRecipes.includes(rec.id)) {
      const df = (open.driverFailures ?? []).find((f) => String(f.overlay).endsWith(`manual:${rec.id}`))
      holes.push({
        kind: 'recipe-did-not-open',
        detail: `overlays.extra "${rec.id}" (${rec.screen}) is configured but never produced a panel.${df ? ` Driver said: ${df.error}` : ''}`,
        fix: 'fix the recipe (the error above usually names the precondition), or waive it with a reason if the state is genuinely unreachable in this build',
      })
    }
  }
}

for (const w of unreasoned) {
  holes.push({
    kind: 'waiver-without-reason',
    detail: `waiver "${w.match}" carries no reason.`,
    fix: 'a waiver without a reason is indistinguishable from an oversight — state why it is out of scope',
  })
}

/* ── 5. Live EXTRACT markers in the specs, tied to what would close them ──── */
const specsDir = config.specsDir
let extracts = []
if (specsDir && existsSync(specsDir)) {
  for (const f of readdirSync(specsDir).filter((n) => n.endsWith('.md') && !n.startsWith('_'))) {
    const src = readFileSync(join(specsDir, f), 'utf8')
    src.split(/\r?\n/).forEach((line, i) => {
      if (!/⚠ *EXTRACT/.test(line)) return
      /* Same exclusion the completeness gate uses: the specs discuss the marker
       * constantly, and matching a legend line reports every clean doc as dirty. */
      if (/none|0 open|closed|Legend|is a|means|marker|= value still|provenance|§F filled|No outstanding/i.test(line)) return
      extracts.push({ file: f, line: i + 1, text: line.trim().slice(0, 150) })
    })
  }
}
/* Which of those an open-state measurement would close, by keyword. Not a
 * guess at the fix — a pointer at the pass that produces the missing number. */
/* ── 5b. CLASSIFY EVERY MARKER — no residual bucket ─────────────────────────
 *
 * A "needing something else" pile is where accountability goes to die: it looks
 * like a small remainder and is actually the place every unanswered question
 * accumulates. So every live marker is routed to exactly ONE of:
 *
 *   - an INSTRUMENT that can close it (and the command to run), or
 *   - an OWNER, because it is a product or design decision no measurement
 *     can settle.
 *
 * If a marker matches nothing, that is a defect IN THIS CLASSIFIER and it is
 * reported as one — never quietly dropped into a remainder. */
const compFile = join(HERE, '..', 'out', 'component-census', `${version}.json`)
const stateFile = join(HERE, '..', 'out', 'state-census', `${version}.json`)
const comps = existsSync(compFile) ? JSON.parse(readFileSync(compFile, 'utf8')) : null
const states = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : null

const CLASSES = [
  /* A §F render-parity row is a MIRROR of a component-level fact, not a gap of
   * its own: the cell goes green when the block it points at is resolved.
   * Classified first so a pipe-delimited checklist row never gets attributed to
   * whichever keyword happens to appear in an adjacent column. */
  { id: 'checklist-mirror', why: '§F/§G table cell mirroring a component marker — closes when that block does',
    ready: true, cmd: 'resolve the component block it mirrors; do not treat as an independent gap',
    match: /^\s*\|/ },
  { id: 'state-census', why: 'scroll/sticky, expand-collapse, row hover/selected, focus-visible',
    ready: !!states, cmd: `node src/census-states.mjs --config ${basename(cfgPath)} --version ${version}`,
    match: /sticky|scroll|pinned|collaps|expand|disclosure|hover|focus|selected[- ]row|zebra|highlight|focus ring/i },
  { id: 'open-census', why: 'overlay open-state geometry and enter/exit motion',
    ready: !!open, cmd: `node src/census-open.mjs --config ${basename(cfgPath)} --version ${version}`,
    match: /open[- ]state|panel geometry|driven open|not censused|overlay|dialog|popover|dropdown|tooltip|drawer|motion|duration|easing|transition|animat/i },
  { id: 'component-census', why: 'a ux-ui-library recipe for a rendered control',
    ready: !!comps, cmd: `node src/census-components.mjs --config ${basename(cfgPath)} --version ${version}`,
    match: /\*\*UX\/UI|recipe|register as|shared recipe|library|reused identically|pattern repeats|styling/i },
  { id: 'resting-census', why: 'geometry already recorded in out/census — re-read it',
    ready: true, cmd: 'read out/census/<v>.json — no new run needed',
    match: /geometry|width|cap|px|padding|gutter|colWidth|offset|spacing|margin/i },
  { id: 'token-map', why: 'a measured colour that resolves to no named design token',
    ready: !!comps, cmd: 'reconcile the measured value against the tokens module named in config.tokensModule',
    match: /not a named token|palette class|token|hex|#[0-9a-f]{3,6}|oklch|rgb\(/i },
  { id: 'cross-reference', why: 'points at another marker rather than stating its own gap',
    ready: true, cmd: 'resolve the referenced marker; this line follows it',
    match: /⚠ EXTRACT on |see .*⚠|as above|pending that document/i },
  { id: 'PRODUCT-OWNER', why: 'no measurement can settle this — it is a decision',
    ready: null, cmd: 'move to OPEN-ITEMS.md with a named owner; it is not an extraction gap',
    match: /should|whether|intended|confirm with|policy|rule|decide|design decision|pending that|first pass/i },
  /* LAST, and it always matches. A marker that does not say what would close it
   * is not an unknown — it is a badly written marker, and that is a spec defect
   * with a concrete fix. Keeping this class means nothing ever lands in a
   * residual pile, while the count stays visible instead of being absorbed. */
  { id: 'UNDESCRIBED', why: 'the marker does not name what would close it — reword it',
    ready: true, cmd: 'state the missing measurement (and which pass takes it) or the decision and its owner',
    match: /.*/ },
]
const classify = (t) => (CLASSES.find((c) => c.match.test(t)) ?? null)

const buckets = new Map(CLASSES.map((c) => [c.id, []]))
const unclassified = []
for (const e of extracts) {
  const c = classify(e.text)
  if (c) buckets.get(c.id).push(e)
  else unclassified.push(e)
}

for (const c of CLASSES) {
  if (c.ready === false && buckets.get(c.id).length) {
    holes.push({
      kind: 'instrument-not-run',
      detail: `${buckets.get(c.id).length} live marker(s) need ${c.id} (${c.why}) and it has never been run for ${version}.`,
      fix: c.cmd,
    })
  }
}
if (unclassified.length) {
  holes.push({
    kind: 'unclassified-markers',
    detail: `${unclassified.length} live ⚠ EXTRACT marker(s) match no known class. Every marker must route to an instrument or an owner.`,
    fix: 'extend CLASSES in coverage.mjs, or reword the marker so its class is evident',
  })
}

/* ── report ───────────────────────────────────────────────────────────────── */
console.log(`\n  DISCOVERED (resting census)`)
console.log(`    overlay triggers        : ${discoveredTotal} across ${new Set(discovered.map((d) => d.screenId)).size} screens`)
for (const kind of [...new Set(discovered.map((d) => d.kind))].sort()) {
  const n = discovered.filter((d) => d.kind === kind).reduce((a, d) => a + d.count, 0)
  console.log(`      ${kind.padEnd(22)} ${n}`)
}

console.log(`\n  ACCOUNTED FOR (open-state census · sample of ${SAMPLE_SIZE} per screen×kind)`)
if (!open) {
  console.log(`    (never run for ${version})`)
} else {
  const pairs = new Set(discovered.map((d) => `${d.screenId}/${normKind(d.kind)}`))
  const sampledPairs = [...pairs].filter((k) => (measuredByPair[k] ?? []).length > 0).length
  console.log(`    screen×kind pairs       : ${sampledPairs}/${pairs.size} sampled`)
  console.log(`    panels measured OPEN    : ${measuredTotal}`)
  console.log(`    represented by sample   : ${Math.max(0, discoveredTotal - measuredTotal - unmeasurableTotal - noPanelTotal)}`)
  console.log(`    produced no panel       : ${noPanelTotal}`)
  console.log(`    OS-native, no DOM       : ${unmeasurableTotal}`)
  console.log(`    waived, with a reason   : ${waivers.length - unreasoned.length}`)
}

if (extracts.length) {
  console.log(`
  LIVE ⚠ EXTRACT IN SPECS   : ${extracts.length}   — every one routed to an instrument or an owner`)
  for (const c of CLASSES) {
    const n = buckets.get(c.id).length
    if (!n) continue
    const flag = c.id === 'PRODUCT-OWNER' ? '👤' : c.ready ? '✓' : '✗ NOT RUN'
    console.log(`    ${String(n).padStart(4)}  ${c.id.padEnd(18)} ${flag.padEnd(10)} ${c.why}`)
    if (c.ready === false) console.log(`          → ${c.cmd}`)
  }
  if (unclassified.length) {
    console.log(`
    ✗ ${unclassified.length} marker(s) matched NO class — that is a defect in this classifier, not a remainder:`)
    for (const u of unclassified.slice(0, 6)) console.log(`        ${u.file}:${u.line}  ${u.text.slice(0, 90)}`)
  }
}

if (holes.length) {
  console.log(`\n  ✗ ${holes.length} COVERAGE HOLE(S) — an overlay that is neither measured, waived, nor classified:\n`)
  for (const h of holes) {
    console.log(`    [${h.kind}] ${h.detail}`)
    console.log(`        fix: ${h.fix}\n`)
  }
} else {
  console.log(`\n  ✓ every discovered overlay is measured, waived with a reason, or classified unmeasurable`)
}

/* `--strict` additionally refuses to pass while any live EXTRACT remains. That
 * is the setting a handover should be assembled under; the default is the
 * looser one you want mid-flight, when markers are still being burned down. */
const strictFail = has('strict') && extracts.length > 0
if (strictFail) {
  console.log(`\n  ✗ --strict: ${extracts.length} live ⚠ EXTRACT marker(s) remain. A handover ships with none.`)
}

console.log('')
process.exit(holes.length || strictFail ? 1 : 0)
