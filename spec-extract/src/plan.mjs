/**
 * PLAN — DELTA.md → REVALIDATION-PLAN.md
 *
 * Turns "what changed" into "what a Product & Design manager must answer".
 *
 * WHY THIS STEP EXISTS. A delta tells you the Orders column is gone. It does not
 * tell you what the column MEANT, whether the rule behind it survived, or where
 * its meaning went — and those are the parts only Product can supply. Screen `01`
 * was once verified at 0.001% pixel difference while nobody had said what the
 * Orders column meant, what the stat chips counted, or who was allowed to
 * dispatch (METHOD.md §3.5.11d).
 *
 * So every changed component gets the **Gate 2 question set, unanswered**, in the
 * shape the spec template already uses. The agent that folds the delta in fills
 * these; it does not invent them, and it does not skip them because the pixels
 * matched.
 *
 * Usage:  node src/plan.mjs --from <prev> --to <new>
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, relative, sep } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'out')
const posix = (p) => p.split(sep).join('/')
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d }

/* The ELEVEN classes a static mock cannot express, by construction.
 *
 * DERIVED, not invented: an earlier version of this list had six, and was tested
 * against the 23 questions a real package actually needed. It would have missed
 * TWELVE of them — including the permission question, which alone closed
 * thirteen open items across nine specs.
 *
 * The first six are about the DATA. The last five are about THE ACT, and they
 * are the ones most often missed — a prototype has no actions that do anything,
 * so it is silent on effect, permission, reversibility and failure by
 * construction rather than by omission.
 *
 * Full guidance: guidance/asking-product-questions.md */
const CLASSES = [
  ['order', 'Is this sequence a **rule** or an accident of the fixture?'],
  ['emptiness', 'What renders at **zero**, at **null**, and **before the first load**?'],
  ['time', 'Does anything change with **elapsed time alone**? What is *now* — whose clock?'],
  ['derivation', 'Numerator, denominator, the window they cover, rounding, caps.'],
  ['concurrency', 'What happens when **someone else changes this** while it is on screen?'],
  ['scale', 'What does this do at **1,500 rows** rather than 15?'],
  ['scope', 'Bounded by **what**? This store or the group? The **result set** or the **page**?'],
  ['permission', '**Who may do this, and who may see it?** The prototype gates nothing, so everything reads as available to everyone.'],
  ['effect', 'What actually **happens downstream**? Most actions are inert in a mock, so the UI gets built and the outcome does not.'],
  ['reversibility', 'Is it **undoable**? What is the **recovery path**? What happens when it **fails**?'],
  ['is-it-real', 'A **real attribute** or fixture scaffolding? An **intended** constraint or an artefact?'],
]

/* Engineering answers these; Product frames them. */
const ENG_CLASSES = [
  ['source system', '**Which system is truth** for this value — not the endpoint, not the field name.'],
  ['degraded state', 'What does this do when an upstream system is **down or slow**? *"As production does"* is a ruling that does not reach a builder.'],
]

const QUESTIONS = [
  ['Design requirement', 'what must be true **for the user**, and **why** — stated without reference to any framework'],
  ['Source', '`pseudo.field` — meaning · **system** · `⚠ Eng to source` where the origin is open'],
  ['Business rules', 'the logic a static mock cannot show: thresholds, eligibility, permissions, configurables — **and why**'],
  ['States', 'four tiers, **opening with the DEFAULT** — record · component · context · temporal'],
  ['Motion', 'enter and exit **separately**, with duration and easing — or an explicit `none`'],
  ['Structure & placement', 'box structure, child order, grid participation, width constraints, **rendering layer**'],
]

function main() {
  const from = arg('from', 'v1'), to = arg('to', 'v2')
  const dj = join(OUT, `delta-${from}-${to}.json`)
  if (!existsSync(dj)) throw new Error(`no delta found — run: node src/diff.mjs --from ${from} --to ${to}`)
  const d = JSON.parse(readFileSync(dj, 'utf8'))

  const L = []
  const w = (s = '') => L.push(s)

  const screens = Object.entries(d.screens)
  let items = 0

  w(`# REVALIDATION PLAN — ${to}`)
  w()
  w('> **Generated** by `spec-extract/src/plan.mjs` from the delta. It lists what a **Product &')
  w('> Design manager must answer** for every component the delta touched — not what changed.')
  w('>')
  w('> **Rendering completeness is not requirement completeness.** A screen can be verified to')
  w('> 0.001% pixel difference with nobody having said what its numbers mean. Every box below is a')
  w('> question the artifacts cannot answer and only Product can.')
  w()
  w('## How to work this')
  w()
  w('**Read `spec-extract/guidance/asking-product-questions.md` before asking the PM anything** —')
  w('it is short, and it is how each question below should be shaped: evidence, what the artifacts')
  w('already say, the gap in one sentence, the options with their consequences, and your')
  w('recommendation. A question where every answer produces the same build should be decided, not')
  w('asked.')
  w()
  w('1. **Do not open the bundle.** Everything you need is here, in `DELTA.md`, and in the spec')
  w('   block each item names.')
  w('2. **Answer in the component block**, definitively — not in a questions table. A ruled')
  w('   decision filed as a question reads as unresolved.')
  w('3. **Keep the reasoning.** The *why* is what stops a rule being re-litigated or "optimised"')
  w('   away by the next reader.')
  w('4. **A removal is never a deletion.** It is a relocation or a supersession, and both keep the')
  w('   rationale. Say where it went.')
  w('5. **Where the requirement departs from the prototype**, state the requirement **first and in')
  w('   full**, and keep the prototype version visibly subordinate and marked do-not-build.')
  w()
  w('---')
  w()

  if (d.shellResponsive) {
    w('## Shell — responsive tier')
    w()
    w('The app shell changes shape below the breakpoint, on **every** screen. Specify it **once**')
    w('in `09`, and give every other screen a *Shell effects* line pointing at it.')
    w()
    w(`- [ ] **Design requirement** — what must stay reachable when the header collapses, and why`)
    w(`- [ ] **States** — name the breakpoint and the default side of it`)
    w(`- [ ] **Structure & placement** — what is hidden, what replaces it, what holds its position`)
    w()
    items += 3
    w('---')
    w()
  }

  for (const [id, rec] of screens) {
    const kinds = rec.changes.map((c) => c.kind)
    w(`## \`${id}\` — ${rec.label}  ·  spec \`${rec.spec}\``)
    w()
    w(`**Changed:** ${kinds.map((k) => `\`${k}\``).join(' · ')}`)
    w()

    /* structure changes name the blocks most likely to need rewriting */
    const tbl = rec.changes.find((c) => c.kind === 'tables')
    if (tbl) {
      w('### ⚠ Table structure changed — the column set is a requirement, not a preference')
      w()
      w('A category noun ("card", "panel", "summary") carries no structural information. Where the')
      w('render is tabular, the block must **name the header cells, in order**.')
      w()
      w(`- [ ] Reconcile every added/removed header against a component block`)
      w(`- [ ] For each **removed** column: where did its meaning go? Relocation or supersession?`)
      w(`- [ ] For each **added** column: a full component block, including everything below`)
      w()
      items += 3
    }

    const trg = rec.changes.find((c) => c.kind === 'triggers')
    if (trg) {
      w('### ⚠ Control kinds changed')
      w()
      w('*"A button that opens a thing"* is not a specification. The **kind** of control decides its')
      w('accessibility contract, its keyboard behaviour, and whether the design system can style it')
      w('at all. A control can legitimately be **two kinds at once**.')
      w()
      for (const t of trg.deltas) w(`- [ ] \`${t.kind}\` **${t.from} → ${t.to}** — which component, and is the kind stated in its block?`)
      w()
      items += trg.deltas.length
    }

    const cp = rec.changes.find((c) => c.kind === 'copy')
    if (cp) {
      w('### Copy')
      w()
      if (cp.removed.length) {
        w(`**${cp.removed.length} strings no longer rendered.** For each: is it *gone*, *renamed*, or *moved*?`)
        w('A rename needs the old string marked do-not-build; a move needs the new owner named.')
        w()
        for (const s of cp.removed.slice(0, 20)) w(`- [ ] removed: \`${s}\``)
        w()
        items += Math.min(cp.removed.length, 20)
      }
      if (cp.added.length) {
        w(`**${cp.added.length} strings now rendered.** Each needs an owning component block.`)
        w('**Generated copy must be written as a schematic, never as quoted text** — a gate will')
        w('otherwise demand the example as required copy.')
        w()
        for (const s of cp.added.slice(0, 20)) w(`- [ ] added: \`${s}\``)
        w()
        items += Math.min(cp.added.length, 20)
      }
    }

    if (rec.changes.some((c) => c.kind === 'responsive')) {
      w('### Responsive tier — screen-specific')
      w()
      w('- [ ] **Design requirement** for the collapsed layout, and **why** it collapses')
      w('- [ ] **States** — the breakpoint, and which side is the default')
      w('- [ ] Does any control change **kind** across the breakpoint? A row of buttons becoming a')
      w('      popover is a different control, not a smaller one')
      w()
      items += 3
    }

    if (rec.changes.some((c) => c.kind === 'geometry' || c.kind === 'cellScale')) {
      w('### Rendering — no product decision needed')
      w()
      w('Geometry and cell scale moved. Record the measured values; **no PM answer required** unless')
      w('a height change turns out to be a component nobody specified.')
      w()
    }

    w('### The Gate 2 set — for every component block this screen changed')
    w()
    for (const [k, v] of QUESTIONS) w(`- [ ] **${k}** — ${v}`)
    w()
    w('### The eleven classes — invisible in a mock **by construction**')
    w()
    w('*About the data:*')
    w()
    for (const [k, v] of CLASSES.slice(0, 6)) w(`- [ ] **${k}** — ${v}`)
    w()
    w('*About the act — the ones a prototype is structurally silent on:*')
    w()
    for (const [k, v] of CLASSES.slice(6)) w(`- [ ] **${k}** — ${v}`)
    w()
    w('*Framed by Product, answered by Engineering:*')
    w()
    for (const [k, v] of ENG_CLASSES) w(`- [ ] **${k}** — ${v}`)
    w()
    items += QUESTIONS.length + CLASSES.length + ENG_CLASSES.length
    w('> Any spec sentence reading *"source order"*, *"as shown"* or *"in the order given"* is an')
    w('> **unasked question**, not an answer.')
    w()
    w('---')
    w()
  }

  w('## Before sending any of this to the PM')
  w()
  w('- [ ] **Order by how much it BLOCKS**, not by screen. Blocking (a value renders whose meaning')
  w('      is undecided, or an action ships whose effect is unknown) · should-answer · Engineering.')
  w('- [ ] **Look for the question that closes many.** Several items are often the same question')
  w('      wearing different screens — one permission matrix once closed thirteen items across nine')
  w('      specs, and was worth more than the other twenty-two combined.')
  w('- [ ] **Give each question "what a sufficient answer looks like."** Without it a PM cannot tell')
  w('      when they are done, and you get *"yes, roughly"* to a question that needed a numerator')
  w('      and a denominator.')
  w('- [ ] **Say what is NOT a gap.** An audit listing only problems misrepresents the package.')
  w('- [ ] **Drop every question where all plausible answers produce the same build.** Decide it.')
  w()
  w('---')
  w()
  w('## Done means')
  w()
  w('- [ ] every item above answered **in its component block**, definitively, with its reasoning')
  w('- [ ] every removal recorded as a **relocation or supersession**, never a deletion')
  w('- [ ] every new component has a block with an ID — *a bullet is where a component goes to die*')
  w('- [ ] every ruled divergence from the prototype carries a **do-not-build** block at the component')
  w('- [ ] `ENG-SOURCING.md` regenerated; the document gates re-run')
  w()

  const f = join(OUT, `REVALIDATION-PLAN-${to}.md`)
  writeFileSync(f, L.join('\n') + '\n')
  console.log(`\nREVALIDATION PLAN — ${to}`)
  console.log(`  screens        : ${screens.length}`)
  console.log(`  checklist items: ${items}`)
  console.log(`\n  written → ${posix(relative(process.cwd(), f))}\n`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main()
