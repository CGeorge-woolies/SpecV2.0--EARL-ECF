/**
 * DIFF — two censuses (+ the source map) → DELTA.md
 *
 * GENERIC. Compares whatever the census recorded; knows nothing about the app.
 *
 * THE OUTPUT IS SPLIT BY WHO MUST ACT, not by what changed:
 *
 *   BEHAVIOURAL   copy, structure, control kinds, routes, data variants —
 *                 needs PM/Design sign-off before it becomes a requirement
 *   RENDERING     geometry and cell scale — reviewers diff intent, not pixels
 *
 * and every row names the SPEC IDs it lands on, because that is what makes the
 * next agent's job cheap: it reads a few hundred lines and touches only the
 * named blocks, instead of re-reading 13 specs and a 1.3MB bundle.
 *
 * A CHANGELOG IS A SUMMARY, NOT A DIFF. Where the two disagree, that is the
 * finding — the changelog records what was intended, the census what happened.
 *
 * Usage:  node src/diff.mjs --from <prev> --to <new>
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname, relative, sep } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'out')
const posix = (p) => p.split(sep).join('/')
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d }

const load = (v) => JSON.parse(readFileSync(join(OUT, 'census', `${v}.json`), 'utf8'))
const setDiff = (a, b) => [...new Set(a)].filter((x) => !new Set(b).has(x))

/** Spec IDs a screen owns, from the resolution artifact. */
function specIndex() {
  const f = join(OUT, 'spec-id-resolution-<version>.json')
  if (!existsSync(f)) return {}
  const r = JSON.parse(readFileSync(f, 'utf8'))
  const byScreen = {}
  for (const row of [...r.resolved, ...r.weak]) {
    const [screen, id] = row.id.split('/')
    ;(byScreen[screen] ??= []).push(id)
  }
  return byScreen
}

export function diff(from, to) {
  const A = load(from), B = load(to)
  const specs = specIndex()
  const screens = [...new Set([...Object.keys(A.screens), ...Object.keys(B.screens)])]
  const out = { behavioural: [], rendering: [], unchanged: [], screens: {} }

  for (const id of screens) {
    const sa = A.screens[id], sb = B.screens[id]
    if (!sa || !sb) {
      out.behavioural.push({ screen: id, kind: 'screen', detail: sa ? 'REMOVED in ' + to : 'NEW in ' + to })
      continue
    }
    const vps = Object.keys(sb.viewports).filter((w) => sa.viewports[w] && sb.viewports[w])
    if (!vps.length) continue

    /* Use the widest common viewport as the primary comparison; responsive
     * differences are reported separately below. */
    const wide = vps[vps.length - 1]
    const a = sa.viewports[wide], b = sb.viewports[wide]
    const rec = { label: sb.label, spec: sb.spec, specIds: specs[sb.spec] ?? [], changes: [] }

    /* --- copy --- */
    const addedCopy = setDiff(b.literals, a.literals)
    const removedCopy = setDiff(a.literals, b.literals)
    if (addedCopy.length || removedCopy.length) {
      rec.changes.push({ kind: 'copy', class: 'behavioural', added: addedCopy, removed: removedCopy })
    }

    /* --- structure: table count and header SETS, in order --- */
    const ha = a.tables.map((t) => t.headers.join(' | '))
    const hb = b.tables.map((t) => t.headers.join(' | '))
    if (a.tableCount !== b.tableCount || ha.join('#') !== hb.join('#')) {
      rec.changes.push({
        kind: 'tables', class: 'behavioural',
        countFrom: a.tableCount, countTo: b.tableCount,
        headersFrom: ha, headersTo: hb,
      })
    }

    /* --- control kinds --- */
    const tk = [...new Set([...Object.keys(a.triggers), ...Object.keys(b.triggers)])]
    const trig = tk.filter((k) => (a.triggers[k] ?? 0) !== (b.triggers[k] ?? 0))
      .map((k) => ({ kind: k, from: a.triggers[k] ?? 0, to: b.triggers[k] ?? 0 }))
    if (trig.length) rec.changes.push({ kind: 'triggers', class: 'behavioural', deltas: trig })

    /* --- routes --- */
    const addedR = setDiff(b.routes, a.routes), removedR = setDiff(a.routes, b.routes)
    if (addedR.length || removedR.length) {
      rec.changes.push({ kind: 'routes', class: 'behavioural', added: addedR, removed: removedR })
    }

    /* --- responsive: does this screen change shape across the matrix?
     *
     * Recorded per screen, then HOISTED below if it turns out to be the same
     * change on every screen. The app shell is on every screen, so one
     * responsive change in the header would otherwise be reported eleven times
     * — eleven rows that read as eleven findings and are one. */
    const narrow = sb.viewports[vps[0]], widest = sb.viewports[vps[vps.length - 1]]
    const respCopy = {
      onlyNarrow: setDiff(narrow.literals, widest.literals),
      onlyWide: setDiff(widest.literals, narrow.literals),
    }
    const respTrig = [...new Set([...Object.keys(narrow.triggers), ...Object.keys(widest.triggers)])]
      .filter((k) => (narrow.triggers[k] ?? 0) !== (widest.triggers[k] ?? 0))
      .map((k) => ({ kind: k, narrow: narrow.triggers[k] ?? 0, wide: widest.triggers[k] ?? 0 }))
    if (respCopy.onlyNarrow.length || respCopy.onlyWide.length || respTrig.length) {
      const shapes = vps.map((w) => {
        const v = sb.viewports[w]
        return { w, sig: `${v.literalCount}/${v.tableCount}/${JSON.stringify(v.triggers)}` }
      })
      const groups = {}
      for (const sh of shapes) (groups[sh.sig] ??= []).push(sh.w)
      rec._responsive = {
        kind: 'responsive', class: 'behavioural',
        tiers: Object.values(groups).map((ws) => ws.join(', ')),
        copy: respCopy, triggers: respTrig,
        fingerprint: JSON.stringify([respCopy.onlyNarrow, respCopy.onlyWide, respTrig]),
      }
    }

    /* --- rendering: geometry + cell scale --- */
    const geoKeys = ['page', 'main', 'cap', 'firstTable']
    const geo = geoKeys.filter((k) => JSON.stringify(a.geometry[k]) !== JSON.stringify(b.geometry[k]))
      .map((k) => ({ box: k, from: a.geometry[k], to: b.geometry[k] }))
    if (geo.length) rec.changes.push({ kind: 'geometry', class: 'rendering', boxes: geo })

    const csA = a.tables[0]?.cellScale, csB = b.tables[0]?.cellScale
    if (JSON.stringify(csA) !== JSON.stringify(csB)) {
      rec.changes.push({ kind: 'cellScale', class: 'rendering', from: csA, to: csB })
    }

    if (rec.changes.length || rec._responsive) out.screens[id] = rec
    else out.unchanged.push(id)
  }

  /* --- hoist the shell's responsive behaviour out of every screen ---------- */
  const withResp = Object.values(out.screens).filter((r) => r._responsive)
  const prints = {}
  for (const r of withResp) (prints[r._responsive.fingerprint] ??= []).push(r)
  for (const [fp, group] of Object.entries(prints)) {
    if (group.length >= Math.max(3, withResp.length - 2)) {
      /* the same change on (nearly) every screen = it lives in the SHELL */
      out.shellResponsive = { ...group[0]._responsive, screens: group.length }
      for (const r of group) delete r._responsive
    }
  }
  for (const [id, r] of Object.entries(out.screens)) {
    if (r._responsive) { r.changes.push(r._responsive); delete r._responsive }
    if (!r.changes.length) { delete out.screens[id]; out.unchanged.push(id) }
  }
  return out
}

/* ---- render ---------------------------------------------------------------- */
function render(d, from, to) {
  const L = []
  const w = (s = '') => L.push(s)
  const bullets = (xs, n = 14) => xs.slice(0, n).map((x) => `\`${x}\``).join(' · ') +
    (xs.length > n ? ` … _(+${xs.length - n} more)_` : '')

  const changed = Object.entries(d.screens)
  const behav = changed.filter(([, r]) => r.changes.some((c) => c.class === 'behavioural')).length

  w(`# DELTA — ${from} → ${to}`)
  w()
  w('> **Generated** by `spec-extract/src/diff.mjs` from two rendered censuses.')
  w('> A static text diff of these bundles returns one changed minified symbol; everything below')
  w('> is measured from the **rendered** app at every viewport in the matrix.')
  w('>')
  w('> **A changelog is a summary, not a diff.** Where this and the changelog disagree, that')
  w('> disagreement is the finding: the changelog records what was *intended*, this what *happened*.')
  w()
  w('| | |')
  w('|---|---|')
  w(`| screens compared | **${changed.length + d.unchanged.length}** |`)
  w(`| screens changed | **${changed.length}** |`)
  w(`| …of which behavioural (needs PM/Design) | **${behav}** |`)
  w(`| screens unchanged | ${d.unchanged.length}${d.unchanged.length ? ' — ' + d.unchanged.map((s) => `\`${s}\``).join(' · ') : ''} |`)
  w()
  w('---')
  w()

  if (d.shellResponsive) {
    const r = d.shellResponsive
    w('## Shell — responsive behaviour **BEHAVIOURAL**')
    w()
    w(`Reported once. This identical change appears on **all ${r.screens} screens**, which is how`)
    w('we know it lives in the app shell rather than in any one screen — a header that collapses is')
    w('one finding, not eleven.')
    w()
    w(`Layout groups: ${r.tiers.map((t) => `**${t}**`).join(' | ')}`)
    w()
    if (r.copy.onlyWide.length) w(`**Hidden below the breakpoint:** ${bullets(r.copy.onlyWide)}`)
    if (r.copy.onlyNarrow.length) w(`**Shown only below the breakpoint:** ${bullets(r.copy.onlyNarrow)}`)
    if (r.triggers.length) {
      w()
      w('| control kind | narrow | wide |')
      w('|---|---|---|')
      for (const t of r.triggers) w(`| \`${t.kind}\` | ${t.narrow} | ${t.wide} |`)
    }
    w()
    w('> **Owner: `09` (app shell).** Every screen inherits it; specify it once there.')
    w()
    w('---')
    w()
  }

  for (const [id, rec] of changed) {
    w(`## \`${id}\` — ${rec.label}`)
    w()
    w(`**Spec \`${rec.spec}\`** · component blocks: ${rec.specIds.length ? rec.specIds.map((s) => `\`${s}\``).join(' · ') : '_none mapped_'}`)
    w()
    for (const c of rec.changes) {
      const tag = c.class === 'behavioural' ? '**BEHAVIOURAL**' : '_rendering only_'
      if (c.kind === 'copy') {
        w(`### Copy — ${tag}`)
        w()
        if (c.added.length) { w(`**Added (${c.added.length}):** ${bullets(c.added)}`); w() }
        if (c.removed.length) { w(`**Removed (${c.removed.length}):** ${bullets(c.removed)}`); w() }
      } else if (c.kind === 'tables') {
        w(`### Table structure — ${tag}`)
        w()
        w(`Tables: **${c.countFrom} → ${c.countTo}**`)
        w()
        const n = Math.max(c.headersFrom.length, c.headersTo.length)
        w('| # | ' + from + ' headers | ' + to + ' headers |')
        w('|---|---|---|')
        for (let i = 0; i < n; i++) {
          const x = c.headersFrom[i] ?? '_(none)_', y = c.headersTo[i] ?? '_(none)_'
          w(`| ${i + 1} | ${x === y ? x : '**' + x + '**'} | ${x === y ? y : '**' + y + '**'} |`)
        }
        w()
      } else if (c.kind === 'triggers') {
        w(`### Control kinds — ${tag}`)
        w()
        w('| kind | ' + from + ' | ' + to + ' |')
        w('|---|---|---|')
        for (const t of c.deltas) w(`| \`${t.kind}\` | ${t.from} | **${t.to}** |`)
        w()
      } else if (c.kind === 'routes') {
        w(`### Routes — ${tag}`)
        w()
        if (c.added.length) w(`**Added:** ${bullets(c.added)}`)
        if (c.removed.length) w(`**Removed:** ${bullets(c.removed)}`)
        w()
      } else if (c.kind === 'responsive') {
        w(`### Responsive tiers — ${tag}`)
        w()
        w(`Layout groups: ${c.tiers.map((t) => `**${t}**`).join(' | ')}`)
        w()
        if (c.copy?.onlyWide?.length) { w(`**Hidden below the breakpoint:** ${bullets(c.copy.onlyWide)}`); w() }
        if (c.copy?.onlyNarrow?.length) { w(`**Shown only below the breakpoint:** ${bullets(c.copy.onlyNarrow)}`); w() }
        if (c.triggers?.length) {
          w('| control kind | narrow | wide |')
          w('|---|---|---|')
          for (const t of c.triggers) w(`| \`${t.kind}\` | ${t.narrow} | ${t.wide} |`)
          w()
        }
        w('> Each group is a distinct layout and needs its own coverage. A viewport matrix that')
        w('> does not straddle these boundaries cannot see the difference.')
        w()
      } else if (c.kind === 'geometry') {
        w(`### Geometry — ${tag}`)
        w()
        w('| box | ' + from + ' | ' + to + ' |')
        w('|---|---|---|')
        for (const g of c.boxes) {
          const f = g.from ? `${g.from.x}+${g.from.w} @y${g.from.y} h${g.from.h}` : '_absent_'
          const t = g.to ? `${g.to.x}+${g.to.w} @y${g.to.y} h${g.to.h}` : '_absent_'
          w(`| \`${g.box}\` | ${f} | ${t} |`)
        }
        w()
      } else if (c.kind === 'cellScale') {
        w(`### Cell scale — ${tag}`)
        w()
        w(`\`${JSON.stringify(c.from)}\` → \`${JSON.stringify(c.to)}\``)
        w()
        w('> Cell padding is per-table and it **compounds** — a few px per row becomes hundreds')
        w('> over a long table.')
        w()
      }
    }
    w('---')
    w()
  }
  return L.join('\n') + '\n'
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const from = arg('from', 'v1'), to = arg('to', 'v2')
  const d = diff(from, to)
  mkdirSync(OUT, { recursive: true })
  const f = join(OUT, `DELTA-${from}-${to}.md`)
  writeFileSync(f, render(d, from, to))
  writeFileSync(join(OUT, `delta-${from}-${to}.json`), JSON.stringify(d, null, 2))
  const changed = Object.keys(d.screens).length
  console.log(`\nDELTA ${from} → ${to}`)
  console.log(`  screens changed   : ${changed}`)
  console.log(`  screens unchanged : ${d.unchanged.length}`)
  for (const [id, r] of Object.entries(d.screens)) {
    console.log(`    ${id.padEnd(22)} ${r.changes.map((c) => c.kind).join(', ')}`)
  }
  console.log(`\n  written → ${posix(relative(process.cwd(), f))}\n`)
}
