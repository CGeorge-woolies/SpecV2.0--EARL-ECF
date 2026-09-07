# SETUP — step by step

Follow once per product. Roughly 20 minutes to the first census.

---

## 1. Create the repo and upload

Copy the contents of this folder to your repo root. Do not nest them inside a `SPECKIT/` directory —
`.github/` only works at the root.

```
your-repo/
├── .github/          instructions/ · prompts/ · workflows/ · copilot-instructions.md
├── spec-extract/     config/ · src/ · templates/ · guidance/
├── internal/         verification/ — the gates
├── requirements/     functional-spec/ · ux-ui-library/ · tools/
└── HANDOVER/         empty for now
```

Commit. Copilot picks up `.github/` immediately — no configuration.

---

## 2. Add the prototype

```
your-repo/prototype/
├── build.html        the self-contained built prototype   (required)
└── src/              its source tree                      (optional)
```

**If you have a `dist/` build alongside the source, check they match** (compare hashes). Three
artifacts that quietly disagree are worse than two.

---

## 3. Install

```bash
cd spec-extract && npm install     # playwright + chromium
cd ../internal   && npm install
```

CI does this itself via `.github/workflows/copilot-setup-steps.yml`. Without Chromium the census and
every open-state gate fail with a driver error that **reads like a product defect** — so install it
before you draw any conclusions.

---

## 4. Write the config — the only app-specific file

```bash
cp spec-extract/config/_TEMPLATE.config.mjs spec-extract/config/myapp.config.mjs
```

Fill in five things. Two of them decide whether every later measurement is trustworthy.

| Field | Notes |
|---|---|
| `versions` | build path per version; `source` optional |
| **`entryGate`** | get past any splash/login/selector — **and `assert` something true only past it** |
| **`viewports`** | straddle **every layout breakpoint**, not just width caps. Include one width below your smallest breakpoint and one above your largest cap |
| `screens` | one entry per screen **and per state**. `go` drives there; **`assert` proves it arrived** |
| `componentSpecMap` | seed what you know; the resolver derives the rest |

> **Why the asserts matter more than they look.** A measurement taken in the wrong state is not a
> failed measurement — it is a **confidently wrong one**, with clean numbers and no error. The
> classic version: clicking the first table row to reach a detail screen clicks a *group header*,
> which does not navigate. Both sides then agree perfectly, and the check passes while measuring the
> wrong screen.

**Never edit anything under `spec-extract/src/`.** It is generic on purpose.

---

## 5. First census

```bash
cd spec-extract
node src/census.mjs --version v1
```

Expect `N/N viewports` on every screen and **zero driver failures**. If a screen reports failures,
**fix the config, not the product** — a driver failure is reported separately precisely so it is
never mistaken for a finding.

With source available, also run:

```bash
node src/source-map.mjs      --version v1
node src/resolve-spec-ids.mjs --version v1
```

## 5b. Open the overlays — the pass the resting census cannot do

```bash
node src/census-open.mjs --version v1
node src/census-components.mjs --version v1
node src/census-states.mjs --version v1
node src/coverage.mjs    --version v1
```

`census-open` discovers every overlay trigger, opens a sample of each kind, and measures the panel
open — geometry, placement relative to its trigger, rendering layer, clipping ancestors — plus
**enter and exit motion sampled as a series**, which is the only way a hard cut is distinguishable
from a fade.

`coverage` then reconciles **discovered against measured** and fails on anything that is neither
measured, waived with a reason, nor classified unmeasurable. **Do not start writing specs until it
passes.** Skipping this is what puts `⚠ EXTRACT` markers into a finished handover: the resting
census counts overlay triggers and never opens them, so without this pass every panel and every
duration is unmeasured by construction.

> **Expect to fix your config here, not the product.** A trigger the pass cannot open is usually
> behind a state your `screens` matrix never reaches.

---

## 6. Then hand over to the agent

`/new-app` in Copilot. It has the rest.

---

## 7. When a new version arrives

```bash
node src/census.mjs --version v2
node src/diff.mjs   --from v1 --to v2
node src/plan.mjs   --from v1 --to v2
```

or just `/fold-delta v2`. The prior census is cached — only the new build is driven.

---

## 8. Assembling the handover

```bash
python requirements/tools/gen-eng-sourcing.py      # regenerate the sourcing index
cd spec-extract && node src/coverage.mjs --version v1 --strict   # no live ⚠ EXTRACT may ship
cd ../internal && npm run gate:docs                # k · h · j
```

Then copy into `HANDOVER/`: `functional-spec/` · `ux-ui-library/` · `DATA-CONVENTIONS.md` ·
`ENG-SOURCING.md` · `OPEN-ITEMS.md` · `divergences/` · the built prototype · `measure.mjs` +
`MEASURING.md` + `package.json`.

**Do not copy** `internal/`, `spec-extract/`, or the prototype's source tree. See README §C.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| every screen fails its assert | the entry gate is not being passed. Check `entryGate.pass` selectors |
| nav does nothing, asserts fail | navigating by **label** when the nav is icon-only. Navigate by **route** |
| identical literal counts at every viewport | the census is reading **hidden** DOM. Responsive layouts keep both variants mounted — it must respect visibility |
| one change reported on every screen | it is in the **shell**. The differ hoists these; if yours does not, it is one finding, not N |
| a huge diff on a screen you did not touch | **reproduce it by hand before believing it.** A harness is software with its own defects, and a confidently wrong number is more expensive than an error |
