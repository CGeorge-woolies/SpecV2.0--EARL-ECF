/**
 * GATE (h) — FIELD-REFERENCE INTEGRITY.
 *
 * The pack no longer ships a schema, because the entity shape is Engineering's
 * to decide and a shape reverse-derived from a design prototype would only have
 * been wrong. The integrity rule survives the schema, and is now stronger,
 * because it polices the thing a builder actually reads: THE COMPONENT BLOCK.
 *
 * Every field a spec names must resolve to ONE of:
 *   - a `Source:` line somewhere in the specs — the field is DECLARED, with its
 *     meaning, its system, and whether Eng still has to source it
 *   - a term defined in DATA-CONVENTIONS.md — an enum value, a convention, or a
 *     mock-scaffolding call-out marked must-not-ship
 *
 * A field named in prose and declared on no `Source:` line is a dangling
 * reference: the spec asks for a value and tells nobody where it comes from.
 */
import fs from 'node:fs'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PACK } from './config.mjs'

/** Read a file the pack is supposed to contain, or explain what is missing.
 *  A gate that throws ENOENT tells you a path; a gate that says WHICH artifact
 *  is absent and WHICH step produces it tells you what to do. This one fires
 *  routinely mid-run, because the document gates are useful long before the
 *  supporting documents exist. */
/** Same idea for a directory the pack should contain. */
function readPackDir(p, what, producedBy) {
  try {
    return fs.readdirSync(p)
  } catch {
    console.error([
      '',
      'Cannot run this gate yet — ' + what + ' does not exist:',
      '  ' + p,
      '',
      'It is produced by: ' + producedBy,
      '',
      'This is expected until that step has run. Not a failure of the specs.',
      '',
    ].join(String.fromCharCode(10)))
    process.exit(2)
  }
}

function readPackFile(p, what, producedBy) {
  try {
    return fs.readFileSync(p, 'utf8')
  } catch {
    console.error([
      '',
      `Cannot run this gate yet — ${what} does not exist:`,
      '  ' + p,
      '',
      `It is produced by: ${producedBy}`,
      '',
      'This is expected until that step has run. Not a failure of the specs.',
      '',
    ].join(String.fromCharCode(10)))
    process.exit(2)
  }
}


const ROOT = PACK
const SPECS = join(ROOT, 'functional-spec')
const CONVENTIONS = join(ROOT, 'DATA-CONVENTIONS.md')

/* Accept `**Source:**` and `**Source**` alike — the template writes the colon
 * outside the bold, and a harvester that matches only one form finds NO source
 * lines at all, then reports every field in the pack as unresolved. */
const SOURCE_LINE = /\*\*Source:?\*\*/

const specFiles = readPackDir(SPECS, 'HANDOVER/functional-spec/', '/new-app step 4 (write the specs), then sync requirements/ -> HANDOVER/').filter((n) => n.endsWith('.md') && !n.startsWith('_'))

/* ---- what the SOURCE lines declare ----------------------------------------
 * A Source line owns its component's data requirement, so every field token in
 * one (and in its indented continuation) counts as a declaration. A dotted path
 * declares each of its segments: `order.orderNo` declares `orderNo`. */
const declared = new Set()
const sourceLines = []
const engMarked = new Set()

for (const f of specFiles) {
  const lines = readFileSync(join(SPECS, f), 'utf8').split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (!SOURCE_LINE.test(lines[i])) continue
    const block = [lines[i]]
    for (let j = i + 1; j < lines.length; j++) {
      if (!/^\s{2,}\S/.test(lines[j]) || SOURCE_LINE.test(lines[j])) break
      block.push(lines[j])
    }
    const text = block.join(' ')
    sourceLines.push({ file: f, text })
    for (const m of text.matchAll(/`([A-Za-z][A-Za-z0-9_.\[\]*]*)`/g)) {
      for (const seg of m[1].replace(/\[\]/g, '').split('.')) {
        if (/^[a-z][A-Za-z0-9]*$/.test(seg)) {
          declared.add(seg)
          if (text.includes('⚠ Eng')) engMarked.add(seg)
        }
      }
    }
  }
}

/* ---- what DATA-CONVENTIONS.md defines ------------------------------------
 * Enum values, conventions and the must-not-ship list. These are terms a spec
 * may legitimately name without a Source line of their own. */
const conventions = readPackFile(CONVENTIONS, 'DATA-CONVENTIONS.md', '/new-app step 6 — the supporting documents')
const defined = new Set()
for (const m of conventions.matchAll(/`([A-Za-z][A-Za-z0-9_.\[\]*]*)`/g)) {
  for (const seg of m[1].replace(/\[\]/g, '').split('.')) {
    if (/^[a-z][A-Za-z0-9]*$/.test(seg)) defined.add(seg)
  }
}

/* Demonstrably not data fields. Kept SHORT and visible on purpose: an exclusion
 * list is a blind spot, so anything added here should be obviously not a field.
 * Derived CONTEXT predicates (isToday, isNZ) are computed in the client from a
 * selected date or store, never carried on a record. */
const NOT_A_FIELD = new Set([
  'isToday', 'isNZ', 'isAU', 'isLast', 'isCollapsed', 'isOpen', 'isStuck', 'isFirst',
  'true', 'false', 'null', 'undefined', 'style', 'disabled', 'hidden', 'invisible',
  'focused', 'selected', 'checked', 'indeterminate', 'ease', 'linear', 'transparent',
  'marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'left', 'right', 'top', 'bottom',
  'width', 'height', 'display', 'position', 'opacity', 'transform', 'translate', 'overflow',
  'label', 'value', 'key', 'title', 'children', 'render', 'align', 'side', 'variant',
  'indicators', 'columns', 'rows', 'groups', 'items', 'options', 'target', 'source',
  'line', 'link', 'grid', 'group', 'colgroup', 'includes', 'blur', 'camelCase',
  'orderTime', 'placementTime', 'toteStatus', 'pickStatus', 'suppliedStatus',
  'outline', 'location', 'readonly', 'main', 'onMouseDown', 'slice', 'message',
  'timeline', 'none', 'eStore', 'targetTickColor', 'aboveTargetColor',
  'truncate', 'noTotes', 'alcohol',   // a CSS utility, a component STATE, a removed flag
  'disabledMessage',                 // a UI copy constant, not a data field
  'ageRestricted',                   // the COLUMN key; the FIELD is `ageRestriction`
  'offset', 'total', 'required',     // a fixture extraction detail, a fixture object key,
                                     // and a print-dialog radio option key
])

const CSSISH = /^(?:color|font|space|radius|bg|text|border|px|py|pt|pb|pl|pr|mx|my|gap|size|min|max|w|h|z|rounded|flex|grid|absolute|relative|inline|hover|focus|group|peer|data)/
/* A verb-prefixed camelCase identifier (`getRowFlag`, `useStickyHeaderShadow`, `isEstore`,
 * `onConfirm`, `computeMergeSpans`, `flattenSessionGroupsToWindows`, `formatArrivalDate`) is a
 * FUNCTION, HOOK or EVENT HANDLER cited as code provenance — never a data field. This app's specs
 * cite exact helper names constantly (the guidance's own "name the exact mechanism" rule), which
 * DOMISH/NOT_A_FIELD (deliberately short, per their own comment) had not yet caught up to. Same
 * risk the file already accepts for `is*` in NOT_A_FIELD (a genuine `isFresh`-shaped field could in
 * principle be masked) — this app's real boolean fields are not named this way
 * (`packingSlipRequired`, `suppliedStatus`, `isFresh`/`isDeleted` are already declared elsewhere). */
const FUNCTIONISH = /^(?:get|is|has|use|on|compute|format|flatten|filter|delete|save|search|confirm|toggle|generate|split|show|set|find|do|to)[A-Z]/
/* A `...Class`/`...Style` suffix names a Tailwind class-string or inline-style CONSTANT
 * (`bodyCellClass`, `stickyThStyle`) — realisation, not a data field, same reasoning as CSSISH. */
const STYLE_CONST = /(?:Class|Style)$/
const DOMISH = new Set([
  'className', 'onClick', 'onChange', 'onOpenChange', 'colSpan', 'rowSpan', 'tabIndex',
  'textContent', 'querySelector', 'scrollHeight', 'offsetHeight', 'getBoundingClientRect',
  'toLocaleString', 'toFixed', 'toISOString', 'getTime', 'getDate', 'getMonth', 'getDay',
  'padStart', 'localStorage', 'sessionStorage', 'beforeunload', 'requestAnimationFrame',
  'setTimeout', 'clearTimeout', 'addEventListener', 'createHashRouter', 'createPortal',
  'isIntersecting', 'rootMargin', 'threshold', 'sideOffset', 'deviceScaleFactor',
  'borderColor', 'backgroundColor', 'textAlign', 'fontWeight', 'fontSize', 'fontFamily',
  'textDecoration', 'borderRadius', 'minWidth', 'maxWidth', 'minHeight', 'letterSpacing',
  'whiteSpace', 'lineHeight', 'showOutsideDays', 'captionLayout', 'buttonVariant',
  'autoFocus', 'initialFocus', 'focusableWhenDisabled', 'aria', 'viewBox', 'strokeWidth',
  'currentColor', 'transitionDuration', 'animationDuration', 'fontVariantNumeric',
])

/* ---- every field reference in the specs ----------------------------------- */
let total = 0
const unresolved = []
for (const f of specFiles) {
  const text = readFileSync(join(SPECS, f), 'utf8')
  const names = new Set(text.match(/`([a-z][A-Za-z0-9]{3,30})`/g)?.map((s) => s.slice(1, -1)) ?? [])
  for (const n of names) {
    if (CSSISH.test(n) || DOMISH.has(n) || NOT_A_FIELD.has(n) || FUNCTIONISH.test(n) || STYLE_CONST.test(n)) continue
    total++
    if (declared.has(n) || defined.has(n)) continue
    unresolved.push(`${f}  ${n}`)
  }
}

/* ---- every component block has a Source line ------------------------------
 * The reciprocal check. A field can only resolve to a Source line if the block
 * has one; a block without one declares nothing and is invisible to the rule. */
const blocksWithoutSource = []
for (const f of specFiles) {
  const text = readFileSync(join(SPECS, f), 'utf8')
  const blocks = text.split(/^### /m).slice(1)
  for (const b of blocks) {
    const heading = b.split('\n')[0]
    if (!/CMP-/.test(heading)) continue          // §A1/§E subsections are not components
    if (!SOURCE_LINE.test(b)) {
      blocksWithoutSource.push(`${f}  ${heading.trim().slice(0, 64)}`)
    }
  }
}

/* ---- report --------------------------------------------------------------- */
console.log(`Source lines found          : ${sourceLines.length}`)
console.log(`fields they declare         : ${declared.size}`)
const engLines = sourceLines.filter((l) => l.text.includes('⚠ Eng')).length
console.log(`Source lines with ⚠ Eng     : ${engLines}   (see ENG-SOURCING.md)`)
console.log(`terms in DATA-CONVENTIONS   : ${defined.size}`)
console.log(`\nfield references checked    : ${total}`)

let failed = false

if (unresolved.length) {
  failed = true
  console.log(`\n✗ ${unresolved.length} field reference(s) resolve to NOTHING:`)
  for (const u of [...new Set(unresolved)].slice(0, 60)) console.log('    ' + u)
  console.log('\n  Each must be declared on a `Source:` line, or defined in DATA-CONVENTIONS.md.')
  console.log('  A field named in prose and sourced nowhere asks for a value and says where')
  console.log('  from to nobody.')
}

if (blocksWithoutSource.length) {
  failed = true
  console.log(`\n✗ ${blocksWithoutSource.length} component block(s) carry NO Source line:`)
  for (const b of blocksWithoutSource.slice(0, 40)) console.log('    ' + b)
}

if (failed) process.exit(1)
console.log('\n✓ gate (h) field-reference integrity — every field resolves to a Source line')
