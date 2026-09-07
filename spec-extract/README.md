# spec-extract — a PM spec kit for any prototype

Give it a **React/Tailwind prototype** (built html, optionally + source) and it produces a
**product requirements package**: what the product contains, what changed since last time, and
**the questions a Product & Design manager must answer** before any of it can be built.

Built for one product, but **the only app-specific file is one config**.

---

## What is in the kit

```
spec-extract/
├── config/
│   ├── _TEMPLATE.config.mjs        ★ copy this for a new app — the ONLY app-specific file
│   └── myapp.config.mjs              a worked example
├── templates/
│   ├── functional-spec.template.md   the per-document spec, section by section
│   ├── ux-ui-library.template.md     tokens, recipes, motion, icon register
│   ├── data-conventions.template.md  the cross-screen data rules
│   ├── flags.template.md             the divergence register
│   └── open-items.template.md        what is undecided, by owner
├── guidance/
│   ├── decomposing-into-documents.md WHICH documents to write — read this FIRST
│   ├── writing-a-spec.md             the condensed method — coverage, altitude, divergence
│   └── asking-product-questions.md   HOW to formulate the PM/Design questions
├── github-kit/                     drop into `.github/` of any repo — Copilot config
│   ├── copilot-instructions.md     short, always-on
│   ├── instructions/               path-scoped: specs · library · extraction
│   ├── prompts/                    /new-app · /fold-delta · /ask-pm · /spec-component · /verify
│   └── workflows/                  agent setup (node + Chromium) · doc gates on PR
└── src/                            GENERIC — never edit for an app
    ├── source-map.mjs              src/ → provenance, semantic maps, motion, gating
    ├── resolve-spec-ids.mjs        derives the component ↔ spec-ID map from literal evidence
    ├── census.mjs                  drives the BUILT html → rendered truth per screen × viewport
    ├── diff.mjs                    census A vs B → DELTA.md, split behavioural / rendering
    └── plan.mjs                    DELTA.md → REVALIDATION-PLAN.md, the PM question set
```

---

## Two flows

### A new app, no requirements yet — `/new-app`

1. Copy `config/_TEMPLATE.config.mjs` → `<app>.config.mjs`. Fill in versions, the entry gate, the
   viewport list and the screen matrix. **Do not edit `src/`.**
2. `node src/census.mjs --version <v>` — your coverage baseline: screens, tables and their header
   sets, control kinds, routes, geometry, cell scales, responsive tiers.
3. **Decide the document list** — `guidance/decomposing-into-documents.md`. **Not one per screen**:
   a tabbed route splits per tab plus a shell, and the app chrome, the cross-screen actions and any
   printed artifact belong to no screen at all.
4. Write one spec per document from `templates/functional-spec.template.md`, following
   `guidance/writing-a-spec.md`.
5. Ask the PM what the prototype cannot say, following `guidance/asking-product-questions.md`.
6. Copy `github-kit/` → `.github/`.

### A new version of an app you already have — `/fold-delta`

```bash
node src/census.mjs --version <new>
node src/diff.mjs   --from <prev> --to <new>
node src/plan.mjs   --from <prev> --to <new>
```

The prior census is cached, so only the new build is driven. Then read **`out/DELTA-*.md`** and
**`out/REVALIDATION-PLAN-*.md`** — and **not the bundle**.

> **This is the token-efficiency answer.** A delta is a few hundred lines naming the exact spec
> blocks to revisit. The prototype it replaces is a single-line minified bundle whose longest line
> runs to 713,422 characters.

---

## Why a rendered census rather than a text diff

A static string diff of two builds of the same app returned **one changed minified symbol**. What
changed is only visible once the app is **rendered**, which is what the census does — at every
viewport, in every declared state, with each state asserting that it arrived.

---

## The rules this harness holds itself to

Each was bought with a defect that survived a green check.

| | |
|---|---|
| **Assert the state before measuring** | a measurement taken in the wrong state is not a failed measurement — it is a confident wrong one, with clean numbers and no error |
| **Report driver failures AS driver failures** | a shared `try` turns *the harness broke* into *the build is wrong* |
| **Never swallow a timeout** | `.catch(() => {})` converts *the driver failed* into *the element does not exist* |
| **Respect visibility** | Tailwind keeps both responsive layouts in the DOM; a probe ignoring `display:none` is blind to every breakpoint |
| **Trace every assertion to an artifact** | asserting a library's internal class names invents a requirement — and a machine-checked one outranks the written ones |
| **Hoist what is shared** | one shell change reported per screen is eleven rows that are one finding |
| **A confidently wrong list is worse than none** | if a pass cannot see a class of thing, classify it separately and say so |

The last two were learned building this: the spec-ID resolver reported **69** removal candidates,
then 17, 8, 3, 2 — and both survivors were false positives. Three tool bugs, not three findings.

---

## What source is, and is not, authoritative for

| Authoritative | **Not** authoritative |
|---|---|
| identity · provenance · semantic maps · generated content · the token scale · **what changed between versions** | **anything computed** — rendered geometry, cascade outcome, whether a declared transition actually runs |

> **Source proposes; render disposes.** Where they disagree, the render wins and the disagreement is
> itself a finding.

---

## What this kit will not do for you

It measures **what is there**. It cannot tell you what any of it **means** — that is the PM's, and
`guidance/asking-product-questions.md` exists because asking badly is how a plausible wrong
requirement gets into a spec and passes every check afterwards.
