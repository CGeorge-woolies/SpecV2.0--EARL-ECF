---
applyTo: "requirements/functional-spec/**,HANDOVER/functional-spec/**"
---

# Editing a functional spec

## Section order — never reorder, never omit
`A` purpose · `A1` what to extract from the prototype **with volumes** · `B1` region map ·
`B2` component inventory · `C0` context matrix · `C` component blocks · `D` conditions ·
`E` **open items only** · `F` render-parity checklist · `G` coverage reconciliation.

## Inside a component block
- **Design requirement** — platform-neutral, and **why**. Read first, written first.
- **Source** — `` `pseudo.field` `` — meaning · **system** · `⚠ Eng to source`.
- **Business rules** — thresholds, eligibility, permissions, configurables, **and why**.
- **Structure & placement** — box structure, child order, grid, width constraints, rendering layer.
- **Render** — the exact render of each data field.
- **States** — four tiers, **opening with the DEFAULT**, including `not rendered until <precondition>`.
- **Motion** — enter and exit separately, or an explicit `none`.
- **Interactions** — `IF <trigger> THEN <outcome>`.
- **Acceptance** — GIVEN / WHEN / THEN.

## Hard rules
- **If it renders, it has an ID.** A prose bullet is not a specification — *a bullet is where a
  component goes to die.*
- **One component, one owning spec.** Everywhere else keeps a launch contract, not a copy.
- **§E holds open items ONLY.** A ruled decision in a questions table is a defect: it reads as
  unresolved. Decisions live in the block they govern, stated definitively, reasoning intact.
- **No build archaeology.** Not *"this previously said X"*, not *"every gate passed"*. A builder
  needs what is true now. The one exception is a **do-not-build** instruction.
- **A ✅ in §F must point at text in §C.** A tick with nothing behind it is a fabrication.
- **Where the requirement departs from the prototype**, state the requirement first and in full;
  keep the prototype version visibly subordinate and marked **do-not-build**.

## After editing
Sync `requirements/` → `HANDOVER/`, regenerate `ENG-SOURCING.md`
(`python requirements/tools/gen-eng-sourcing.py`), then `cd internal && npm run gate:docs`.
