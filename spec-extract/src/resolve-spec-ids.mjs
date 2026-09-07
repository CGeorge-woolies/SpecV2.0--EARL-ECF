/**
 * RESOLVE-SPEC-IDS — derive the component↔spec-ID map instead of hand-writing it.
 *
 * WHY THIS EXISTS. The hand-written map in the config is file-granular, but spec
 * IDs are COMPONENT-granular and many components are cells rendered inside one
 * file: `ORD.CMP-25` (Status cell) lives inside `OrdersTable.tsx`. A file-level
 * map therefore reported 69 spec IDs as "claimed by no source file" — which
 * reads as 69 possible removals and is nothing of the sort.
 *
 *   METHOD.md §3.5.10(e): when a run reports a large regression, reproduce it by
 *   hand before changing anything. A harness is itself software with its own
 *   defects, and a confidently wrong number is more expensive than an error.
 *
 * WHAT IT DOES. For every spec ID, take the DISTINGUISHING LITERALS from its
 * component block — quoted copy, bold copy, field names — and look for them in
 * the source. The file carrying the most of them owns the component. A spec ID
 * whose literals appear NOWHERE is a genuine removal candidate, and that is a
 * far smaller and far more trustworthy list.
 *
 * The output is PROPOSED map entries. It is not authoritative: a proposal with
 * one weak literal match is a guess, so every row carries its evidence and its
 * confidence, and low-confidence rows are listed separately for a human.
 *
 * Usage:  node src/resolve-spec-ids.mjs --version <version> [--write]
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, relative, sep, dirname } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'out')
const posix = (p) => p.split(sep).join('/')

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name)
  return i > -1 ? process.argv[i + 1] : fallback
}

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (n === 'node_modules' || n.startsWith('.')) continue
    const p = join(dir, n)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

/** Literals distinctive enough to identify a component in source.
 *  Deliberately excludes single common words: `"Today"` is quoted in `01`
 *  CMP-06 and appears in two unrelated places, and the string gate reported
 *  PASS while all four calendars were unbuilt (§3.5.11s(3)). A literal must
 *  earn its place as EVIDENCE, not merely exist. */
function distinguishingLiterals(block) {
  const out = new Set()

  /* Quoted strings are COPY. Bold is usually EMPHASIS IN PROSE — and treating
   * the two alike is what made the first run report 8 removal candidates whose
   * "missing literals" were things like "Do not restate them here" and
   * "Body layout:". A spec sentence is not a product string, and a resolver
   * that cannot tell them apart produces a list that reads as findings and is
   * noise (§3.5.11l — a confidently wrong list is worse than none). */
  for (const m of block.matchAll(/"([^"\n]{3,60})"/g)) {
    const s = m[1].trim()
    if (isCopy(s)) out.add(s)
  }
  /* Bold is admitted only when it LOOKS like a label rather than a sentence:
   * short, no trailing colon, not starting with an explanatory word. §3.5.11(n)
   * requires bold to be harvested — `**% Totes packed**` is a real column label
   * that appears in no quotes anywhere — but it must be filtered, not trusted. */
  for (const m of block.matchAll(/\*\*([^*\n]{3,48})\*\*/g)) {
    const s = m[1].trim().replace(/^"|"$/g, '')
    if (isCopy(s) && s.split(/\s+/).length <= 5) out.add(s)
  }
  /* Field names are strong evidence and carry no prose risk. */
  for (const m of block.matchAll(/`([a-z][A-Za-z0-9]{3,30})`/g)) out.add(m[1])
  return [...out]
}

/** Does this read as product copy rather than as a sentence about the product? */
function isCopy(s) {
  if (!/[A-Za-z]{3}/.test(s)) return false
  /* A SCHEMATIC is never a string in the build. `Version {version} — as at
   * {DD/MM/YYYY}` is composed at runtime, so searching for it always fails and
   * always looks like a removal. §3.5.11(t) is the same trap from the other
   * side: a gate that treats an illustrative value as required copy will
   * enforce a defect. Here it would invent one. */
  if (/[{}]/.test(s)) return false
  /* Spec VOCABULARY — system names and markers from the Source line. These
   * describe the requirement; they are not copy the product renders. */
  if (/^(store admin service|customer master|login \/ session|OMS|FMS|store-configurable|client view state|presentational)$/i.test(s)) return false
  if (/[:;]$/.test(s)) return false                     // "Body layout:" — a prose label
  if (s.split(/\s+/).length > 8) return false           // a sentence, not a string
  if (/^(Do|Does|Why|That|This|What|When|Where|Which|If|It|They|There|Each|Every|Note|Only|Still|Because|So|And|But|Per|The [a-z])\b/.test(s)) return false
  if (/\b(must|should|never|always|cannot|is not|are not|be built|restate)\b/i.test(s)) return false
  if (/^(Source|States|Render|Motion|Interactions|Acceptance|Structure|Purpose|Design|Business|OPEN|EXTRACT|Eng|OMS|FMS|AS-IS|NEW|Data|Title|Lead|Body)\b/.test(s)) return false
  return true
}

export async function resolve(config, version) {
  const v = config.versions[version]
  if (!v?.source) throw new Error(`version ${version} has no source tree`)

  const files = (config.source?.roots ?? ['src'])
    .flatMap((r) => walk(join(v.source, r)))
    .filter((f) => /\.(tsx|ts)$/.test(f) && !/\.d\.ts$/.test(f))
  const text = new Map(files.map((f) => [posix(relative(v.source, f)), readFileSync(f, 'utf8')]))

  /* every component block in every spec */
  const blocks = []
  for (const f of readdirSync(config.specsDir).filter((n) => n.endsWith('.md') && !n.startsWith('_'))) {
    const screen = f.split('-')[0]
    const spec = readFileSync(join(config.specsDir, f), 'utf8')
    const parts = spec.split(/^### /m).slice(1)
    for (const b of parts) {
      const m = b.match(/^`?([A-Z]{3}\.(?:CMP|RGN)-[0-9a-z]+)`?/)
      if (!m) continue
      blocks.push({
        id: `${screen}/${m[1]}`,
        title: b.split('\n')[0].trim(),
        literals: distinguishingLiterals(b),
      })
    }
  }

  const resolved = [], weak = [], missing = [], undetectable = []
  for (const blk of blocks) {
    const scores = []
    for (const [path, src] of text) {
      let hits = 0
      const evidence = []
      for (const lit of blk.literals) {
        if (src.includes(lit)) { hits++; if (evidence.length < 4) evidence.push(lit) }
      }
      if (hits) scores.push({ path, hits, evidence })
    }
    scores.sort((a, b) => b.hits - a.hits)
    const best = scores[0]
    const row = {
      id: blk.id,
      title: blk.title,
      literals: blk.literals.length,
      file: best?.path ?? null,
      hits: best?.hits ?? 0,
      evidence: best?.evidence ?? [],
      alternates: scores.slice(1, 3).map((s) => `${s.path} (${s.hits})`),
      /* What we looked for. A "not found" is only meaningful alongside the
       * search terms that failed — otherwise the reader cannot judge it. */
      evidenceSearched: blk.literals.slice(0, 8),
    }
    /* Confidence. Two independent literals in one file is evidence; one is a
     * coincidence waiting to happen (§3.5.11s(3)).
     *
     * A block with NO distinguishing literals cannot be resolved by this pass at
     * all — a select checkbox, a tab strip and an identity header carry no
     * quotable copy. Reporting those as "not found in source" would be a
     * CONFIDENTLY WRONG list, which is more expensive than no list (§3.5.11l).
     * They are UNDETECTABLE here and belong to the structural census instead. */
    if (blk.literals.length === 0) undetectable.push(row)
    else if (row.hits >= 2) resolved.push(row)
    else if (row.hits === 1) weak.push(row)
    else missing.push(row)
  }

  return { blocks: blocks.length, resolved, weak, missing, undetectable }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cfgPath = arg('config', join(HERE, '..', 'config', 'myapp.config.mjs'))
  const version = arg('version', 'v1')
  const config = (await import(pathToFileURL(cfgPath).href)).default
  const r = await resolve(config, version)

  console.log(`\nSPEC-ID RESOLUTION — ${config.id} ${version}`)
  console.log(`  component blocks in the specs : ${r.blocks}`)
  console.log(`  resolved (2+ literals)        : ${r.resolved.length}`)
  console.log(`  weak (1 literal — verify)     : ${r.weak.length}`)
  console.log(`  undetectable (no literals)    : ${r.undetectable.length}   ← census must decide, NOT a finding`)
  console.log(`  NOT FOUND IN SOURCE           : ${r.missing.length}   ← removal candidates\n`)

  if (r.missing.length) {
    console.log('  ─── NOT FOUND — each is a REMOVAL CANDIDATE, to be confirmed by hand ───')
    for (const m of r.missing) {
      console.log(`    ${m.id.padEnd(22)} (${m.literals} literals) ${m.title.slice(0, 60)}`)
      console.log(`        searched for: ${m.evidenceSearched.slice(0, 5).join(' · ')}`)
    }
  }
  if (r.undetectable.length) {
    console.log('\n  ─── UNDETECTABLE by literal search (no quotable copy) — NOT evidence of removal ───')
    for (const u of r.undetectable) console.log(`    ${u.id.padEnd(22)} ${u.title.slice(0, 66)}`)
  }
  if (r.weak.length) {
    console.log('\n  ─── WEAK (one literal only — could be an unrelated occurrence) ───')
    for (const w of r.weak) console.log(`    ${w.id.padEnd(22)} ${w.file}  "${w.evidence[0]}"`)
  }

  mkdirSync(OUT, { recursive: true })
  const out = join(OUT, `spec-id-resolution-${version}.json`)
  writeFileSync(out, JSON.stringify(r, null, 2))
  console.log(`\n  written → ${posix(relative(process.cwd(), out))}\n`)
}
