import { CONFIG } from './config.mjs'
/**
 * GATE (g) — NO SPEC COMMENTARY IN RENDERED OUTPUT.  CLAUDE.md §3.5.11(x)
 *
 * A document artifact must never become product content. A build once shipped a
 * drawer whose body read "⚠ The seven-day aggregate behind this drawer is an open
 * Eng item (01 §E q.20a)…" — invented prose, in no prototype, that would have
 * reached a store operator.
 *
 * A placeholder that EXPLAINS ITSELF is more dangerous than a blank one: blank
 * reads as unfinished, while a confident explanatory sentence reads as designed,
 * survives review, and ships.
 *
 * This checks RENDERED TEXT, not source. Code comments are stripped first, so a
 * `/* §4.31a ... *\/` note in the source is fine — it never reaches the DOM.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PACK } from './config.mjs'
const ROOT = PACK
const TARGETS = [
  CONFIG.buildFile,
]

/** Markers that belong to the requirements pack and never to the product. */
const LEAKS = [
  { re: /⚠/g, why: 'warning marker — a spec annotation' },
  { re: /§\s?\d/g, why: 'section reference' },
  { re: /\bF-\d{3}\b/g, why: 'flag id' },
  { re: /\bq\.\d+\b/g, why: 'open-question reference' },
  { re: /\bCMP-\d/g, why: 'component id' },
  { re: /\bRGN-\d/g, why: 'region id' },
  { re: /\bTODO\b/g, why: 'TODO' },
  { re: /not (?:yet )?sourced/gi, why: '"not sourced" placeholder' },
  { re: /open (?:Eng|PM|Design) item/gi, why: 'open-item placeholder' },
  { re: /\bplaceholder\b/gi, why: 'the word "placeholder"' },
  { re: /ux-ui-library/g, why: 'library reference' },
  { re: /\bdata-contract\b/g, why: 'data-contract reference' },
]

/* Strip everything that is not rendered text:
 *  - <script> and <style> blocks (the whole bundle lives there)
 *  - HTML comments
 * What remains is markup + literal text the user could see. Bundled JS string
 * literals are inside <script>, so a source comment or a spec citation in code
 * is correctly ignored — this gate is about the DOM, not the source. */
function renderedText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
}

let failures = 0, checked = 0
for (const name of TARGETS) {
  let html
  try { html = readFileSync(name, 'utf8') }
  catch { console.log(`  skip  ${name} (not built)`); continue }
  checked++
  const text = renderedText(html)
  const hits = []
  for (const { re, why } of LEAKS) {
    const m = text.match(re)
    if (m) hits.push(`${why}: ${[...new Set(m)].slice(0, 4).join(' ')} ×${m.length}`)
  }
  if (hits.length) {
    failures++
    console.log(`✗ ${name}`)
    hits.forEach((h) => console.log(`    ${h}`))
  } else {
    console.log(`✓ ${name} — no spec commentary in rendered output`)
  }
}

console.log(`\ngate (g) spec-leak: ${checked - failures}/${checked} clean`)
process.exit(failures ? 1 : 0)
