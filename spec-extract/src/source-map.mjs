/**
 * SOURCE-MAP — walks a React/Tailwind source tree and emits a component index.
 *
 * GENERIC. Knows about TSX, class strings and exported const maps. Knows nothing
 * about the app it is reading; everything app-specific comes from the config.
 *
 * WHAT IT IS FOR, and what it is NOT for
 * -------------------------------------
 * Source is authoritative for IDENTITY, PROVENANCE, SEMANTIC MAPS, GENERATED
 * CONTENT and WHAT CHANGED BETWEEN VERSIONS. It is NOT authoritative for
 * anything computed — rendered geometry, cascade outcome, whether a declared
 * transition actually runs, or whether a class has a rule behind it.
 *
 *   METHOD.md §3.5.11(u4): the popover carries `animate-in`, `zoom-in-95` and
 *   `slide-in-from-top-2`, and the <baseline> bundle contained NO RULE for any of
 *   them — the plugin was not loaded, so all were inert. A source reader would
 *   transcribe five animations that do not exist.
 *
 *   METHOD.md §3.5.11(s) trap (i): a shared <Button>'s default size class beat
 *   the caller's className, because Tailwind v4 resolves equal-specificity
 *   utilities by CSS SOURCE ORDER, not class-attribute order. Source plainly
 *   said 212x341; the render was 250x370.
 *
 * So every value emitted here is a CLAIM to be confirmed by the census.
 * `reconcile.mjs` is what turns a claim into a fact. Fields that source cannot
 * settle are emitted under `claims`, never under `facts`.
 *
 * Usage:  node src/source-map.mjs --config config/myapp.config.mjs --version <version>
 */
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, relative, sep, dirname } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'out', 'source-map')

/* ---- argv ---------------------------------------------------------------- */
function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name)
  return i > -1 ? process.argv[i + 1] : fallback
}

/* ---- generic file walk --------------------------------------------------- */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const posix = (p) => p.split(sep).join('/')

/* ---- extractors ---------------------------------------------------------- *
 * Each returns a CLAIM. None of them is trusted until the census agrees.      */

/** Human-readable copy: JSX text nodes, and string literals that read as copy.
 *  Deliberately NOT every string — a bundle carries debug text and css tokens,
 *  and a gate that demands those is a gate that enforces noise (§3.5.11n). */
function literals(src) {
  const out = new Set()
  // JSX text between tags: >Some copy<
  for (const m of src.matchAll(/>\s*([A-Z][^<>{}\n]{2,60}?)\s*</g)) out.add(m[1].trim())
  // quoted props that carry copy
  for (const m of src.matchAll(/(?:title|label|tooltip|placeholder|aria-label|heading|message)\s*[=:]\s*["'`]([^"'`\n]{2,80})["'`]/g)) {
    out.add(m[1].trim())
  }
  // template literals composed at runtime never exist as a string in the build,
  // so record them as SCHEMATIC - a spec must not quote these as fixed copy.
  const schematic = new Set()
  for (const m of src.matchAll(/`([^`\n]*\$\{[^`]*)`/g)) {
    const t = m[1].trim()
    if (/[A-Za-z]{3}/.test(t)) schematic.add(t.replace(/\$\{[^}]*\}/g, '{…}'))
  }
  return {
    copy: [...out].filter((s) => /[A-Za-z]{2}/.test(s) && !/^[a-z-]+$/.test(s)).sort(),
    schematic: [...schematic].sort(),
  }
}

/** Tailwind / class strings. RECORDED, NEVER TRUSTED — see the header note. */
function classStrings(src) {
  const out = new Set()
  for (const m of src.matchAll(/className\s*=\s*["'`]([^"'`]{2,400})["'`]/g)) out.add(m[1].trim())
  for (const m of src.matchAll(/(?:cn|clsx|cva)\(\s*["'`]([^"'`]{2,400})["'`]/g)) out.add(m[1].trim())
  return [...out].sort()
}

/** Declared motion. A CLAIM in the strongest sense: §3.5.11(u4) is the case
 *  where the class names were right and the behaviour did not exist. */
function motion(src) {
  const tokens = new Set()
  for (const m of src.matchAll(/\b(transition[a-z-]*|duration-\[?\d+m?s?\]?|ease-[a-z-]+|animate-[a-z0-9-]+|fade-(?:in|out)-\d+|zoom-(?:in|out)-\d+|slide-(?:in|out)-from-[a-z]+-\d+|data-(?:starting|ending)-style:[a-z0-9:_\-\[\]./%]+|data-(?:open|closed))\b/g)) {
    tokens.add(m[1])
  }
  return [...tokens].sort()
}

/** Icon references — a named asset with no artwork reads as delivered
 *  (§3.5.11gg), so the names are harvested for the asset register to check. */
function icons(src) {
  const out = new Set()
  for (const m of src.matchAll(/from\s+['"][^'"]*icons?\/([A-Za-z0-9_-]+)['"]/g)) out.add(m[1])
  for (const m of src.matchAll(/["'`]([a-z0-9-]*icon-[a-z0-9-]+)(?:\.svg)?["'`]/g)) out.add(m[1])
  for (const m of src.matchAll(/<(Flag[A-Z][A-Za-z0-9]*|Icon[A-Z][A-Za-z0-9]*)\b/g)) out.add(m[1])
  return [...out].sort()
}

/** Context gating — which tenant/locale/role/flag predicate guards a render.
 *  Confirm which context an element belongs to before writing it as global: a
 *  component behind a context gate is unverified no matter how much else ran.
 *
 *  SHAPE-BASED, NOT A WORD LIST. This previously matched a hardcoded set of ONE
 *  product's predicate names inside a file the kit's own rules require to be
 *  generic ("Never put an app detail in src/"). On any other product it found
 *  nothing, and every context gate went silently unreported — a blind spot that
 *  looks exactly like an app with no context gating. The default below matches
 *  the SHAPE these predicates take; override per app with
 *  `source.contextPredicates` where a codebase names them differently. */
const DEFAULT_CONTEXT_PREDICATES = /\b(is[A-Z][A-Za-z0-9]*|[a-z][A-Za-z0-9]*Only|show[A-Z][A-Za-z0-9]*|has[A-Z][A-Za-z0-9]*)\b/g
function gating(src, pattern) {
  const out = new Set()
  const re = pattern ? new RegExp(pattern.source ?? pattern, 'g') : DEFAULT_CONTEXT_PREDICATES
  for (const m of src.matchAll(re)) out.add(m[1])
  return [...out].sort()
}

/** Exported const objects/arrays — the SEMANTIC MAPS. §3.5.11(w): a map that
 *  encodes MEANING must be reproduced inline in the component block, because a
 *  builder's invented map looks plausible and is wrong only where nobody looks.
 *  Captured verbatim so it can be lifted, not paraphrased. */
function semanticMaps(src) {
  const maps = {}
  const re = /export\s+const\s+([A-Z][A-Z0-9_]{2,})\s*(?::[^=]+)?=\s*([[{])/g
  let m
  while ((m = re.exec(src))) {
    const name = m[1]
    const open = m[2]
    const close = open === '[' ? ']' : '}'
    let depth = 0, i = m.index + m[0].length - 1, end = -1
    for (; i < src.length; i++) {
      if (src[i] === open) depth++
      else if (src[i] === close) { depth--; if (depth === 0) { end = i; break } }
    }
    if (end > -1 && end - m.index < 6000) {
      maps[name] = src.slice(m.index, end + 1).trim()
    }
  }
  return maps
}

/** Exported functions — named derivations a spec must state as business rules. */
function derivations(src) {
  const out = new Set()
  for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+([a-z][A-Za-z0-9]*)/g)) out.add(m[1])
  for (const m of src.matchAll(/export\s+const\s+([a-z][A-Za-z0-9]*)\s*=\s*(?:\([^)]*\)|[a-z][A-Za-z0-9]*)\s*=>/g)) out.add(m[1])
  return [...out].sort()
}

/** Responsive breakpoints this file reacts to. A breakpoint the viewport matrix
 *  does not straddle is a layout nobody measures (§3.5.9c). */
function breakpoints(src) {
  const out = new Set()
  for (const m of src.matchAll(/\b(sm|md|lg|xl|2xl):/g)) out.add(m[1])
  for (const m of src.matchAll(/\bmax-(sm|md|lg|xl|2xl):/g)) out.add('max-' + m[1])
  return [...out].sort()
}

/* ---- main ---------------------------------------------------------------- */
export async function buildSourceMap(config, version) {
  const v = config.versions[version]
  if (!v) throw new Error(`unknown version "${version}" — known: ${Object.keys(config.versions)}`)
  if (!v.source) {
    throw new Error(
      `version "${version}" has no source tree in the config.\n` +
      `  This is expected for versions predating the source drop. Census it instead:\n` +
      `    node src/census.mjs --version ${version}`)
  }

  const roots = (config.source?.roots ?? ['src']).map((r) => join(v.source, r))
  const files = roots.flatMap((r) => walk(r))
    .filter((f) => /\.(tsx|ts)$/.test(f) && !/\.d\.ts$/.test(f))

  const unmapped = config.unmappedByDesign ?? []
  const specMap = config.componentSpecMap ?? {}
  const scaffolding = config.source?.scaffoldingPatterns ?? []

  const components = {}
  let totalMaps = 0

  for (const abs of files) {
    const rel = posix(relative(v.source, abs))
    const key = rel.replace(/^src\//, '')
    const src = readFileSync(abs, 'utf8')
    const name = key.split('/').pop().replace(/\.tsx?$/, '')

    const lits = literals(src)
    const maps = semanticMaps(src)
    totalMaps += Object.keys(maps).length

    const isScaffolding = scaffolding.some((re) => re.test(name) || re.test(src.slice(0, 4000)))
    const mappedTo = key in specMap ? specMap[key] : undefined

    components[key] = {
      name,
      path: rel,
      /* PROVENANCE — the whole point. A stable `file.tsx → Component` reference
       * survives a rebuild; a minified symbol (`oE`, `nO`, `Ow`) renames every
       * time and reads as verified while pointing at something else
       * (§3.5.11b, §8.1 step 3). */
      provenance: `${rel} → ${name}`,
      specIds: mappedTo === undefined ? null : mappedTo,   // null = unmapped/out of scope
      orphan: mappedTo === undefined && !unmapped.some((re) => re.test(rel)),
      isScaffolding,
      bytes: src.length,

      /* FACTS — source settles these outright. */
      facts: {
        semanticMaps: maps,
        derivations: derivations(src),
        gating: gating(src, config?.source?.contextPredicates),
        icons: icons(src),
        breakpoints: breakpoints(src),
        schematicCopy: lits.schematic,
      },

      /* CLAIMS — source proposes; the census disposes. */
      claims: {
        copy: lits.copy,
        classStrings: classStrings(src),
        motion: motion(src),
      },
    }
  }

  /* ---- reconciliation, BOTH directions ---------------------------------- */
  const orphanFiles = Object.values(components).filter((c) => c.orphan).map((c) => c.path)

  const specIdsInMap = new Set()
  for (const ids of Object.values(specMap)) for (const id of ids ?? []) specIdsInMap.add(id)

  /* every SCRN.CMP-* the specs declare */
  const specIdsInDocs = new Set()
  for (const f of readdirSync(config.specsDir).filter((n) => n.endsWith('.md') && !n.startsWith('_'))) {
    const screen = f.split('-')[0]
    const text = readFileSync(join(config.specsDir, f), 'utf8')
    for (const m of text.matchAll(/^###\s+`?([A-Z]{3}\.CMP-[0-9a-z]+)`?/gm)) {
      specIdsInDocs.add(`${screen}/${m[1]}`)
    }
  }
  const unmappedSpecIds = [...specIdsInDocs].filter((id) => !specIdsInMap.has(id)).sort()

  const result = {
    generated: new Date().toISOString(),
    app: config.id,
    version,
    sourceRoot: posix(relative(process.cwd(), v.source)),
    counts: {
      files: files.length,
      components: Object.keys(components).length,
      semanticMaps: totalMaps,
      mapped: Object.values(components).filter((c) => Array.isArray(c.specIds)).length,
      scaffolding: Object.values(components).filter((c) => c.isScaffolding).length,
      orphanFiles: orphanFiles.length,
      specIdsInDocs: specIdsInDocs.size,
      specIdsWithNoSource: unmappedSpecIds.length,
    },
    /* A source file nothing in the specs covers = a component that may need a
     * NEW BLOCK. A spec ID no source file claims = a requirement that may have
     * been REMOVED. Both directions matter, and only the second finds removals. */
    orphanFiles,
    specIdsWithNoSource: unmappedSpecIds,
    components,
  }

  mkdirSync(OUT, { recursive: true })
  const outFile = join(OUT, `${version}.json`)
  writeFileSync(outFile, JSON.stringify(result, null, 2))
  return { result, outFile }
}

/* ---- cli ----------------------------------------------------------------- */
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cfgPath = arg('config', join(HERE, '..', 'config', 'myapp.config.mjs'))
  const version = arg('version', 'v1')
  const config = (await import(pathToFileURL(cfgPath).href)).default
  const { result, outFile } = await buildSourceMap(config, version)

  const c = result.counts
  console.log(`\nSOURCE MAP — ${result.app} ${result.version}`)
  console.log(`  files walked          : ${c.files}`)
  console.log(`  components indexed    : ${c.components}`)
  console.log(`  semantic maps lifted  : ${c.semanticMaps}`)
  console.log(`  mapped to a spec ID   : ${c.mapped}`)
  console.log(`  demo scaffolding      : ${c.scaffolding}`)
  console.log(`\n  ORPHAN FILES (in source, claimed by no spec ID) : ${c.orphanFiles}`)
  for (const p of result.orphanFiles) console.log(`      + ${p}`)
  console.log(`\n  SPEC IDs WITH NO SOURCE (may have been REMOVED) : ${c.specIdsWithNoSource}`)
  for (const id of result.specIdsWithNoSource) console.log(`      - ${id}`)
  console.log(`\n  written → ${posix(relative(process.cwd(), outFile))}\n`)
}
