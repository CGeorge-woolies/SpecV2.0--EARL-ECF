# Measuring the prototype

> **The prototype in this pack is a requirement artifact, not an attachment.** It is authoritative
> as a **running** thing: its rendered geometry, colours, copy, states and data *are* the
> requirement. Its class strings are one framework's way of achieving them and are not.
>
> The specs state every value they carry in real units. This is for the values they don't carry —
> the ones nobody thought to ask about until you needed one, mid-component.

---

## Setup — once

```bash
cd HANDOVER
npm run setup          # installs playwright + chromium
```

## Ask it a question

```bash
# every column header in a table, one line each
node measure.mjs --sel "main table thead th" --all --brief

# the full report for one element
node measure.mjs --sel "header"

# at a different width — check the spec's §B1 width model for the breakpoints that matter
node measure.mjs --sel "header" --viewport 1024

# if the prototype opens on a splash/login gate
node measure.mjs --sel "main table" --gate-click "text=Continue"

# something only visible after you drive the UI there
node measure.mjs --sel "[role=dialog]" --click "text=<the button that opens it>"

# every design token, as the browser resolves it
node measure.mjs --tokens
```

`--all` measures every match · `--brief` collapses each to one line · `--nth N` picks one ·
`--click`/`--hover` are repeatable and run in order · `--wait ms` if something settles slowly.

## What you get back

Per element, in real units — never a utility class:

| | |
|---|---|
| **box** | x · y · w · h |
| **spacing** | padding · margin · gap |
| **type** | size/line-height · family · weight · letter-spacing · align · transform |
| **colour** | text · background |
| **border** | width per side · colour · radius |
| **effects** | box-shadow · opacity |
| **layout** | display · position · z-index · flex axes · grid columns · max/min width · overflow |
| **motion** | transition property/duration/easing · animation name/duration |

---

## When to reach for this instead of the spec

| Question | Where to look |
|---|---|
| What must this component *do*, and why | **the spec** — `functional-spec/` |
| Who may do it · what it means · what happens next | **the spec** — nothing else knows |
| Which system owns this value | **the spec's `Source:` line**, indexed in `ENG-SOURCING.md` |
| Is this real or demo scaffolding | **the spec**, and `DATA-CONVENTIONS.md` §9 |
| Exact padding on this one element | **here** |
| What this looks like at 1024px | **here**, with `--viewport` |
| The real duration/easing of this transition | **here** — and note the spec records motion as *measured*, so where it states a value the two should agree |

**A disagreement between this tool and a spec is a finding worth raising**, not a licence to pick
one. The spec is the requirement; the prototype is the evidence it was written from. If they part
company, someone needs to know.

---

## What this deliberately is *not*

It is **not a test suite**, and there is none in this pack by decision. The verification gates that
produced these documents assert *this* prototype's React/Tailwind DOM — they would fail against a
perfectly correct build on your platform, and they answer a question that was ours ("are these specs
complete enough to build from?") rather than yours ("is my build right?"). Shipping them would have
invited you to treat them as acceptance criteria and quietly pushed you toward porting the
prototype's implementation, which is the one thing this pack asks you not to do.

What survived from that verification work is in the documents themselves: each spec's **§F
render-parity checklist**, its **§G coverage reconciliation**, and per-component **GIVEN/WHEN/THEN
acceptance criteria** — all platform-neutral, and all testable with your own tooling on your own
stack.

---

## For coding agents

This tool exists mainly so an agent can answer its own geometry questions instead of guessing or
inventing a plausible value. Two rules:

1. **Measure before you assume.** If the spec doesn't carry a value, query it here rather than
   picking something that looks right. A plausible wrong value passes review and is wrong only where
   nobody checks.
2. **Measure, don't transcribe.** The prototype carries animation class names with no rule behind
   them in places. `--sel ... ` reports the *computed* duration, which is the one that is true.

If a value is absent from both the spec and the running prototype, it does not exist yet — that is
an open item, not something to fill in. Check `OPEN-ITEMS.md` for the owner.
