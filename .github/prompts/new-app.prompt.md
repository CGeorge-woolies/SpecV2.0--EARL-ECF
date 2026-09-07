---
mode: agent
description: Bootstrap a requirements package from a prototype for an app that has none yet
---

# Start a spec kit for a new app

Input: a **built prototype** (self-contained html), optionally its **source tree**, and whatever the
PM has said so far.

## 1. Config first — it is the only app-specific file
Copy `spec-extract/config/_TEMPLATE.config.mjs` to `<app>.config.mjs` and fill it in. **Do not edit
anything under `spec-extract/src/`.** Get `entryGate.assert` and every screen's `assert` right before
running anything — a measurement taken in the wrong state returns clean numbers and no error.

Set the viewport list to straddle **every layout breakpoint**, not just the width caps.

## 2. Inventory what exists — BOTH passes, then reconcile

```bash
cd spec-extract
node src/source-map.mjs  --version <v>     # if source was provided
node src/census.mjs      --version <v>     # resting states
node src/census-open.mjs  --version <v>     # overlays OPEN + motion
node src/census-components.mjs --version <v>  # component RECIPES (the library)
node src/census-states.mjs   --version <v>     # scroll · expand · row · focus states
node src/coverage.mjs     --version <v>     # must pass before you write a spec
```

The resting census is your **coverage baseline**: screens, tables and their header sets, control
kinds, routes, geometry, cell scales, responsive tiers.

**The open-state pass is not optional, and running it late is the single most expensive mistake in
this procedure.** A resting probe cannot see an overlay — a closed dialog is pixel-identical whether
it was built correctly or never built at all — and it cannot see motion, which is a function of time
between two states and invisible at any single instant. The spec template *requires* both. Skip this
pass and every overlay and every duration becomes a `⚠ EXTRACT` that survives into the handover: one
real run produced **335 of them**, and none of it was carelessness.

**The component census is the third instrument, and it exists for the same reason.**
`writing-a-spec.md` §5 says chrome is specified *by reference* to the pattern library, and the
template adds that the reference **must resolve**. Nothing produced those recipes, so the library got
hand-authored from source reads — which is why it had holes, and why every hole became a bare
`- **UX/UI:** ⚠ EXTRACT.` in whichever spec cited it. Those markers were then explained away as
authoring work. They are not: **the control renders, so its recipe is measurable.** This pass
style-clusters every rendered element into distinct recipes and measures hover/focus as a diff.

**`coverage.mjs` must exit clean before step 4.** It reconciles what the resting census *discovered*
against what the open pass *measured*, and fails on anything that is neither measured, waived with a
reason, nor classified unmeasurable. It exists because `screens` is hand-authored: whatever its
author did not think of was previously invisible, and the completeness gate caught it only at the
very end, when the fix was a hunt through thousands of lines instead of one config stanza.

## 3. Decide the DOCUMENT LIST first — do not assume one per screen

Read `spec-extract/guidance/decomposing-into-documents.md` and derive the list from the census.
**"One spec per screen" is wrong in both directions**: it makes any tabbed route one unreadable
document, and it produces nothing for behaviour that belongs to no single screen.

Six rules: a document per **route** · a tabbed route splits **per tab plus a shell** · chrome on
every screen gets **its own** · cross-screen **actions** get their own owner · a **flow or printed
artifact** gets its own · **out of scope is written down**.

**Show me the proposed list and the rule behind each entry before writing any of them.**

## 4. Write the specs
One file per document on that list, from `spec-extract/templates/functional-spec.template.md`. Follow
`spec-extract/guidance/writing-a-spec.md` — in particular:
- **walk the render tree from the page root**, do not list the data;
- **if it renders, it has an ID** — a prose bullet is not a specification;
- state every requirement **platform-neutrally**, with the mechanism recorded separately;
- **inline every semantic map** (`state → value`); reference chrome only.

**Write open states and motion from `out/open-census/<v>.json`, never from class names.** The
measurements are already in hand by this point — panel geometry, placement relative to the trigger,
rendering layer, clipping ancestors, and enter/exit series with computed durations. A `⚠ EXTRACT`
for an overlay at this stage means the open pass did not reach it, which is a **config** problem to
go back and fix, not a marker to write down and move past.

## 5. Ask the PM what the prototype cannot say
Follow `spec-extract/guidance/asking-product-questions.md`. Run the **six classes** — order ·
emptiness · time · derivation · concurrency · scale — against every component. **Do not guess a
business rule**; a plausible wrong requirement passes every check and gets built.

## 6. Set up the supporting documents
- `DATA-CONVENTIONS.md` — the cross-cutting data rules (vocabularies, clock, currency, nulls,
  identifiers, must-not-ship). **No schema and no entity model** — the shape is Engineering's.
- `ENG-SOURCING.md` — **generated** from the specs' `Source:` lines. Never hand-edited.
- A divergence register — every entry typed: extension · conflict · spec defect · mock scaffolding.
  **Only conflicts block a build.**

## 7. Close out — the package ships with no live `⚠ EXTRACT`

```bash
node src/coverage.mjs --version <v> --strict     # refuses to pass while any remain
cd ../internal && npm run gate:docs
```

`--strict` is the setting a handover is assembled under. A remaining marker is either a measurement
somebody still has to take (go take it) or a genuine unknown that belongs in `OPEN-ITEMS.md` with a
named owner — never a marker left in prose for a builder to trip over.

Ship `measure.mjs` + `MEASURING.md` alongside the prototype so Engineering and their agents can
query rendered values on demand rather than guessing at anything the specs do not carry.

## 8. Copy the Copilot kit in
`spec-extract/github-kit/` → `.github/`. Adjust the product name and paths. Keep
`copilot-instructions.md` **short** — it is injected on every request.
