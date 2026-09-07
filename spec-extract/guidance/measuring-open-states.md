# Measuring what a resting screenshot cannot see

> **The four instruments.** Every requirement the templates mandate must have a pass that produces
> it. Where one is missing, the gap does not appear as an error — it appears as a `⚠ EXTRACT` that
> looks like someone's outstanding homework.
>
> | Pass | Produces |
> |---|---|
> | `census.mjs` | resting screens — regions, tables, routes, geometry, responsive tiers |
> | `census-open.mjs` | overlays driven OPEN; enter/exit motion sampled as a series |
> | `census-components.mjs` | component recipes by style clustering, with hover/focus diffs |
> | `census-states.mjs` | in-place states: scroll/sticky, expand-collapse, row hover/selected, focus-visible |
>
> `coverage.mjs` then routes **every** live marker to one of those passes or to a named owner. It
> has no residual bucket by design: a "needing something else" pile is where accountability goes to
> die.

> **A closed dialog is pixel-identical whether it was built correctly or never built at all.** So is
> a missing transition, once it has settled. These two blind spots produced **335 live `⚠ EXTRACT`
> markers** in one real package — not through carelessness, but because the pipeline required a
> measurement it had no instrument to take.

---

## 1. The gap this closes

The spec template makes two demands:

| Demand | Where |
|---|---|
| *"Overlays are specified OPEN… panel geometry, side/align/offset, and rendering layer"* | authoring rule 7 |
| Motion *"recorded AS MEASURED, never as transcribed"* — enter and exit separately, with duration and easing | coverage axis 6 |

Neither is answerable by `census.mjs`. It takes **one instantaneous snapshot of a resting screen**.
The tell was hiding in its own output all along: the probe **counts** overlay triggers by kind —
`popover-trigger`, `dialog-trigger`, `menu-trigger`, `tooltip-trigger` — and then opens **not one of
them**. On one app it counted 3,159 and opened zero.

The capability existed, on the wrong side of the pipeline. `internal/gate-e` enumerates and opens
every popover; `internal/gate-f` samples transitions properly. But both are **two-sided**: they
compare the prototype against a *rebuild*, which does not exist while you are still writing the
specs. `census-open.mjs` is the one-sided extraction equivalent, so the numbers are in hand
**before** a spec is written rather than after a build exists to argue with.

---

## 2. The four rules

### Enumerate, never hand-pick

Open-state coverage assembled as a hand-written list is *"whatever someone remembered to write a
file for — asserted, never measured."* That sentence came from a gate that had learned it the hard
way, in a kit that shipped two other gates still doing exactly that. Triggers are discovered
from the DOM, so an overlay added in a later version is covered the day it is added, with no config
edit and no memory required.

### Sample the recipe, don't exhaust the instances

One screen in a real app carries **2,987 tooltip triggers** — one per table cell, all one recipe. A
spec needs the recipe. So the unit of coverage is the *(screen, kind)* pair and the requirement is a
sample of three, with the remainder recorded as *represented by sample*.

**What keeps that honest:** the sampled panels are compared to each other. If their geometry or box
model disagrees, that pair holds more than one recipe and the sample must widen. Without that check,
sampling is just a nicer word for skipping.

### Motion is a series, not an instant

A hard cut and a 100ms fade are identical in every screenshot ever taken of them. Sample **across**
the duration and require the value to *travel*. Then close it and sample again, separately — an exit
is not the enter reversed, and it is the half that gets dropped.

Two findings only this can produce:

- **Dead animation classes.** `animate-in`, `zoom-in-95` and friends routinely survive in a build
  whose plugin was never wired. The names are right and nothing moves. Reading the *computed*
  duration says so; reading the class string never will.
- **The exit that cannot exist.** A component that unmounts on the same tick its `open` prop flips
  cannot animate out, whatever classes it carries. Catch it by requiring the element to still be
  **mounted** while its opacity travels. This is a *structural* requirement — a spec that hands over
  only the classes cannot be satisfied.

### Classify what you cannot measure — never skip it

A native `<select>` draws its option list in the OS, not the DOM. It is recorded as
*unmeasurable, with the reason*, and its **options** are captured even though its **popup** cannot
be. A silent skip and an overlay nobody found look identical afterwards, and *a confidently wrong
list is worse than no list*.

---

## 3. Verify your own instrument first

Both bugs below were produced by this very pass, and both would have shipped as confident findings
about the product.

**Focus guards and positioners.** Component libraries mount 1×1px focus sentinels at `(-1,-1)` and
wrap panels in transparent positioning elements with no size of their own. Taking "the outermost
newly-visible node" returns one of those — and reports a panel with `z-index: auto`, a transparent
background and no motion. Eleven overlays came back as *"stubs with no animation"* on an app whose
popovers demonstrably animate. **Fix:** discard sub-pixel nodes, then descend to the first element
that actually *paints a surface* — a background, a border or a shadow.

**Your own close routine.** The thorough close (Escape, wait, click away, wait) burns ~120ms before
the caller can sample. Against a declared 100ms exit the animation is over before the first read,
and the pass reports *"EXIT CANNOT ANIMATE — structural defect"* about a component that animates
perfectly. **Fix:** for the exit measurement use a single close action with no waits, so sampling
starts at t≈0. Keep the thorough close for cleanup between overlays.

**Pseudo-elements are invisible to `getComputedStyle(el)`.** The commonest sticky-header "shadow"
idiom in this app is not a `box-shadow` at all — it is a 10px `::after` strip carrying
`linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0))`. Reading only the element reported *"no change on
scroll"* for a header that visibly gains one, and a spec saying "drop shadow" would have a builder
blur the wrong edge. **Fix:** read `getComputedStyle(el, '::before')` and `'::after'` too, and report
a pseudo only when it actually draws (content set, plus a background, shadow or height). Any pass
that judges appearance is blind to a whole class of decoration without this.

> The rule underneath all three: **a driver artefact must never be reported as a property of the
> build.**
> If a result is suspiciously uniform — every overlay a stub, every exit broken — suspect the
> instrument before you suspect the product.

---

## 4. When a marker is still legitimate

`⚠ EXTRACT` survives this pass only when the value genuinely cannot be obtained:

- an overlay behind a **context or data state the fixture never reaches** (add a screen entry that
  reaches it, or waive it with that reason);
- a value that exists **nowhere in the artifacts** — which is not an extraction gap at all. It is an
  **open item**, and it belongs in `OPEN-ITEMS.md` with a named owner.

Everything else is a config problem, and `coverage.mjs --strict` will not let it ship.
