---
mode: agent
description: Fold a new prototype version into the requirements package as a delta
---

# Fold in a new prototype version

Input: a version id (e.g. `<new>`), its built html, optionally its React source, and a changelog.

## 1. Register it
Add the version to `spec-extract/config/<app>.config.mjs` under `versions`. **Verify the built html
matches the source's `dist/` output** (compare hashes). Three artifacts that quietly disagree are
worse than two.

## 2. Measure — do NOT read the bundle
```bash
cd spec-extract
node src/source-map.mjs      --version <new>     # if source was provided
node src/resolve-spec-ids.mjs --version <new>
node src/census.mjs          --version <new>     # resting states
node src/census-open.mjs     --version <new>     # overlays OPEN + motion
node src/census-components.mjs --version <new>  # component RECIPES (the library)
node src/census-states.mjs     --version <new>  # scroll · expand · row · focus states
node src/coverage.mjs        --version <new>     # discovered vs measured
node src/diff.mjs  --from <prev> --to <new>
node src/plan.mjs  --from <prev> --to <new>
```
The prior census is cached; only the new build is driven.

**Run the open pass on every delta, not just the first census.** Triggers are auto-discovered, so a
dialog added in this version is enumerated the moment it exists — but only if the pass runs. An
overlay that arrives in `<new>` and is never opened is invisible to the diff in exactly the way a
closed dialog is invisible to a screenshot, and `coverage.mjs` is what turns that silence into a
failure. A **rise in the discovered trigger count with no matching rise in measured panels** is
itself a finding: something was added and nobody specified it.

## 3. Read only the outputs
`out/DELTA-<prev>-<new>.md` and `out/REVALIDATION-PLAN-<new>.md`. **Do not open the prototype bundle** —
it is a single-line minified file and reading it is never the cheapest route to an answer.

## 4. Cross-check the changelog against the delta
A changelog records what was **intended**; the census records what **happened**. List anything in
one and not the other — **that disagreement is the finding**, and it is the main reason this step
exists.

## 5. Apply, component by component
For each item in the revalidation plan, edit the **named spec block** in `requirements/`:
- answer the Gate 2 set and the six-class sweep **in the block**, definitively, reasoning intact;
- a **removal** becomes a relocation or supersession — never a deletion — and says where it went;
- a **new component** gets its own ID and full block;
- a **ruled divergence** from the prototype states the requirement first and marks the prototype
  version do-not-build.

**STOP and ask before recording any removal or any product ruling.** Present it with the evidence
and the proposed disposition, one at a time. Do not batch them.

## 6. Close out
Sync `requirements/` → `HANDOVER/`, regenerate `ENG-SOURCING.md`, then:

```bash
node src/coverage.mjs --version <new> --strict     # no live ⚠ EXTRACT may ship
cd ../internal && npm run gate:docs
```

Update `PLAN-*.md`. Record the delta **once, outside the artifacts** — in the PR, split into
behavioural and rendering-only. The specs stay clean.
