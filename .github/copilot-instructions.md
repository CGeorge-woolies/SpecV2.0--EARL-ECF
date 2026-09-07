# <PRODUCT> requirements repo — working rules

This repo holds a **product & design requirements package**, not an application. You are usually
editing **specifications**, not code. The deep method lives in `METHOD.md`; **do not read it unless
a prompt sends you there** — it is 120KB and it is reference, not context.

## What ships, and what does not

| | |
|---|---|
| **`HANDOVER/`** | the deliverable — specs · `ux-ui-library` · `DATA-CONVENTIONS.md` · `ENG-SOURCING.md` · `OPEN-ITEMS.md` · `divergences/` · the prototype |
| `requirements/` | working copies. **Edit here, then sync to `HANDOVER/`** |
| `internal/` | our verification gates. Never shipped |
| `spec-extract/` | the extraction framework. Never shipped |

**There is no schema and no entity model in this pack, by decision.** Entity shape and wire field
names belong to Engineering and the real backend. Do not create one.

## The seven rules that matter most

1. **Never invent a value.** No colour, label, icon, threshold, count or copy that an artifact did
   not give you. A missing value is a gap to report — an invented one looks entirely plausible and
   is wrong only in the cases nobody checks.
2. **Never render spec commentary.** No `⚠`, no `§` reference, no flag id, no "not yet sourced" may
   appear in any UI copy you write. A placeholder that explains itself reads as designed and ships.
3. **State the requirement, not the mechanism.** *"The header gains a shadow once the body scrolls
   beneath it"* is the requirement. `position: sticky` is realisation, recorded separately. Every
   measurable value also gets real units — px, hex, ms — never only a Tailwind class.
4. **A removal is never a deletion.** It is a relocation or a supersession, and both keep the
   reasoning. Say where the meaning went.
5. **Semantic maps go inline in the component block** — any `state → value` table. Referenced only,
   a builder writes their own, and an invented map is wrong only where nobody looks.
6. **Every component block needs a `Source:` line** — `` `pseudo.field` `` — meaning · **system** ·
   `⚠ Eng to source`. That line *is* the data requirement; there is nowhere else for it to live.
7. **Illustrative values are schematics, never quoted copy.** Write `"{Long weekday} {DD/MM/YYYY}"`,
   not `"Saturday 29/08/2026"` — a gate will otherwise demand the example as required copy.

## Source vs rendered — the authority rule

The React source in `<prototype-source>/` is authoritative for **identity,
provenance, semantic maps, generated content and what changed between versions**. It is **not**
authoritative for anything computed — rendered geometry, cascade outcome, or whether a declared
transition actually runs. Class names in source have twice been found with no rule behind them.

> **Source proposes; render disposes.** Where they disagree, the render wins and the disagreement
> is itself a finding.

## Before you report anything as verified

Run the document gates: `cd internal && npm run gate:docs`. A long list of green checks with no
measurement quoted is an incomplete report.

## Where the method lives

| Need | Read |
|---|---|
| write or revise a spec | `spec-extract/templates/functional-spec.template.md` + `spec-extract/guidance/writing-a-spec.md` |
| ask the PM something | `spec-extract/guidance/asking-product-questions.md` — **before** asking, not after |
| fold in a new prototype | `/fold-delta` |
| start a package for a new app | `/new-app` |

These are short by design. `METHOD.md` is the long-form archive — open it only when a prompt sends
you there.

## When you are unsure

Ask, or mark `⚠ OPEN` **with a named owner**. Do not resolve a product question by picking the
reading that makes the edit easier — a confident wrong requirement costs more than an open one.
