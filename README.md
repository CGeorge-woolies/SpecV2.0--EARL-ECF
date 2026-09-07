# SPECKIT — a product requirements kit for any prototype

Give it a **prototype** and it produces a **requirements package** an engineering team can build
from: what the product contains, what it means, what is still undecided — and, on every later
version, **what changed**.

Written for a PM or designer working with a coding agent. **The only app-specific file is one
config.**

---

## Upload this whole folder to a new (or existing) repo

Its contents **are** the repo layout. Copy them to the repo root as they are:

| Upload | To | What it is |
|---|---|---|
| `.github/` | repo root | Copilot config — instructions, prompts, CI. **Loaded automatically** |
| `spec-extract/` | repo root | the framework: extraction, templates, guidance |
| `internal/` | repo root | the verification gates. **Never handed to Eng** |
| `requirements/` | repo root | where your specs will live (starts near-empty) |
| `HANDOVER/` | repo root | what you give Eng (starts empty; assembled at the end) |

Then add your own two inputs, wherever you like — the config points at them:

| Add | Notes |
|---|---|
| the **built prototype** (a self-contained `.html`) | required |
| its **source tree**, if you have it | optional, and worth a lot — see §5 |

```
your-repo/
├── .github/          ← Copilot reads this on every request
├── spec-extract/     ← the kit
├── internal/         ← gates (ours, not Eng's)
├── requirements/     ← the specs you are about to write
├── HANDOVER/         ← what ships
└── prototype/        ← your build + optional source
```

**First run once, locally or in CI:**

```bash
cd spec-extract && npm install        # playwright + chromium
cd ../internal    && npm install
```

---

## A) Run the kit for a NEW prototype

In Copilot: **`/new-app`**

That prompt carries the full procedure. What it does, and what you will be asked for:

| Step | Who | What happens |
|---|---|---|
| 1 | you + agent | Copy `spec-extract/config/_TEMPLATE.config.mjs` → `<app>.config.mjs`. Fill in the prototype path, the entry gate, the **viewport list**, and the screen matrix |
| 2 | agent | `node src/census.mjs --version v1` — drives every screen at every viewport and records what is actually there |
| 2b | agent | `node src/census-open.mjs --version v1` — **drives every overlay OPEN** and samples enter/exit motion. The resting census cannot see either |
| 2c | agent | `node src/census-components.mjs --version v1` — style-clusters every rendered element into **component recipes** with measured hover/focus. This is what the `ux-ui-library` is built from |
| 2d | agent | `node src/census-states.mjs --version v1` — **in-place states**: scroll/sticky chrome, expand-collapse, row hover & selected, focus-visible. None of the other passes can see these |
| 2e | agent | `node src/coverage.mjs --version v1` — reconciles discovered against measured. **Must pass before a spec is written** |
| 3 | **agent proposes, you approve** | Derives the **document list** — not one per screen. See `guidance/decomposing-into-documents.md` |
| 4 | agent | Writes one spec per document from `templates/functional-spec.template.md` |
| 5 | agent | Extracts the pattern library into `templates/ux-ui-library.template.md` |
| 6 | **agent asks, you answer** | The **eleven classes** a prototype cannot express (§4) |
| 7 | agent | Generates `ENG-SOURCING.md`, runs `coverage.mjs --strict` and the gates, assembles `HANDOVER/` |

> **Step 2b is the other one people skip**, and it is expensive. A closed dialog is pixel-identical
> whether it was built correctly or never built at all, and a missing transition is invisible once
> settled — so the resting census cannot see either, while the spec template requires both. Skipping
> it once produced **335 live `⚠ EXTRACT` markers** in a finished package. `coverage.mjs` exists so
> that cannot happen quietly: it fails on any overlay that is neither measured, waived **with a
> reason**, nor classified unmeasurable. See `guidance/measuring-open-states.md`.

> **Step 3 is the one people skip.** A tabbed route written as a single document becomes 3,000
> unreadable lines; and the app shell, the cross-screen actions and any printed artifact belong to
> **no screen at all**, so a per-screen rule never creates them. In one real package the naive rule
> would have produced **5 documents instead of 13**.

**Two things to get right in the config, because a wrong guess produces confident wrong numbers
rather than an error:**

- **`entryGate.assert`** and every screen's **`assert`** — something true *only* in that state.
- **the viewport list** — it must straddle **every layout breakpoint**, not just your width caps. A
  responsive tier nothing measures is a tier nobody specifies.

---

## B) Run a DELTA for a new version

In Copilot: **`/fold-delta <new-version>`**

```bash
cd spec-extract
node src/census.mjs --version <new>
node src/diff.mjs   --from <prev> --to <new>
node src/plan.mjs   --from <prev> --to <new>
```

Produces:

| Output | What it is |
|---|---|
| `out/DELTA-<prev>-<new>.md` | what changed, split **behavioural** (needs your sign-off) vs **rendering-only**, each naming the **spec IDs** it lands on |
| `out/REVALIDATION-PLAN-<new>.md` | what **you** must answer, per component |

**The agent reads those two files and edits only the named blocks.** It does not re-read your specs
and it does not open the prototype bundle — that is the whole token argument, and it is why a delta
costs a fraction of a first pass.

> **Give the agent your changelog too.** A changelog records what was *intended*; the census records
> what *happened*. **Where they disagree is the finding** — that comparison has repeatedly caught
> changes nobody wrote down.

**The agent must stop and ask you, one at a time, about:** every **removal**, anything that
**supersedes an existing ruling**, and anything where the prototype and a written requirement
**disagree**. That is in the prompt.

---

## C) What goes to Engineering — and what does not

### Ships — `HANDOVER/`

| | |
|---|---|
| `functional-spec/` | one document per **route, tab, shell, cross-screen action set and flow** — behaviour, rules, states, structure, motion |
| `ux-ui-library/` | design tokens, component recipes, icon assets |
| `measure.mjs` + `MEASURING.md` | the prototype's **on-demand measuring tool** — any selector, any viewport, real units. Ships *because* it measures the prototype, which is itself a requirement artifact. It is not a test suite, and the point is that an agent can answer its own geometry questions instead of inventing a plausible value |
| `DATA-CONVENTIONS.md` | the data rules spanning every screen |
| `ENG-SOURCING.md` | every field still to be named, by screen — **generated**, never hand-edited |
| `OPEN-ITEMS.md` | what is genuinely undecided, by owner |
| `divergences/` | where the requirement departs from the prototype |
| `prototype/` | the built prototype. **Open it, drive it, measure it** |

### Does NOT ship

| | Why |
|---|---|
| `internal/` — the gates | ours. They target *this* prototype's framework and are the wrong instrument for Eng's platform |
| `spec-extract/` — the kit | it produced the package; it is not the package |
| **the prototype's source tree** | a team building on another stack cannot port it, and shipping it makes *"do not port this"* much harder to hold |
| **any schema, entity model or API contract** | entity shape and wire field names belong to Engineering and the real backend. A shape reverse-derived from a design prototype is a guess wearing the costume of a contract — and because it looks authoritative, it gets followed |

> **What Product owes on data is meaning and provenance**, not shape: *what this value is, and which
> system knows it.* That lives on each component's `Source:` line.

---

## D) Instructions to give the Copilot agent

Almost everything is already in `.github/` and loads automatically. In a session, this is enough:

**New prototype**
> `/new-app` — the prototype is at `prototype/build.html`, source at `prototype/src/`. Start with the
> config; show it to me before censusing anything.

**New version**
> `/fold-delta v2` — build at `prototype/build-v2.html`, source at `prototype/src-v2/`, changelog at
> `CHANGELOG-v2.md`. Cross-check the changelog against the census and tell me where they disagree.
> Walk me through every removal one at a time.

**A single component**
> `/spec-component SCR.CMP-12`

**Questions for me**
> `/ask-pm 01` — order them by how much they block, and tell me what a sufficient answer looks like
> for each.

**Check the package**
> `/verify`

---

## E) Keeping it lean

| | |
|---|---|
| `.github/copilot-instructions.md` | **68 lines**, injected on every request. Keep it that size |
| `spec-extract/guidance/*` | ~340 lines, read **only when the task needs them** |
| `spec-extract/templates/*` | read when writing that artifact |
| the delta + revalidation plan | a few hundred lines, and they **name the spec IDs** so nothing else is opened |

**What the agent must not do:** open the prototype bundle. A built prototype is typically a
single-line minified file — one measured here ran to 713,422 characters on its longest line. Reading
it is never the cheapest route to an answer, and the census exists so it is never necessary.

---

## The one idea underneath all of this

**A static prototype renders one arrangement of one dataset at one instant, for one user, with
nothing going wrong.**

Everything else — what a number means, what order things go in, who may act, what happens next,
whether it can be undone, what happens at scale or when a system is down — is invisible **by
construction**. Not by oversight. That is why reviewing the prototype harder never finds it, and why
the eleven classes in `guidance/asking-product-questions.md` are the part of this kit that does the
real work.
