# <PRODUCT> — UX/UI Pattern Library (design-system extract)

> **Styling source of truth.** Specs reference this; they never re-spell a value.
> Every entry is **extracted and measured**, never invented — and carries **provenance**.

---

## 0.05 How to read a recipe — an ABSENT property is a STATEMENT

**No marker means the recipe is complete.** A property that is not listed is not listed because the
component **does not set it** — and that is often deliberate (a transparent background re-tints with
its container for free; "filling the gap" with white breaks it and matches nothing).

Where a value is genuinely missing, it is marked **`⚠ EXTRACT`**. Nothing else is a gap.

---

## 0.1 Unit scale — resolve every token to a REAL unit

A utility class is **realisation**, not specification. A builder on another platform cannot resolve
your framework's scale and must not have to.

| Token | Real value |
|---|---|
| `<class>` | `<px / hex / ms / weight>` |

> **Every measurable value appears in this table.** If a recipe below cites a class, the class
> resolves here. A recipe that cites a class with no row here is `⚠ EXTRACT`.

---

## 0. Token layering — reproduce ALL layers

| Layer | What it holds | Example |
|---|---|---|
| **1. Primitive** | raw values, no meaning | `#004F2A` |
| **2. Semantic** | role names | `colorBgHighlightStrong` |
| **3. Component** | per-component overrides | button hover background |
| **4. Scaffold** | page-level structure (§0.5) | container caps, bleeds |

> Where the product has a **named design-token module**, extract from **that**, not from computed
> styles: a named token with its design-system path ports to any platform; a measured colour does
> not. Record the path alongside the value.

---

## 0.5 Page scaffold layer

The boxes every screen inherits, outside-in: page root → cap → bleed → content.

| Region | Width model | Padding | Notes |
|---|---|---|---|
| | | | |

> **State every width cap and every breakpoint.** A missing cap is pixel-identical below it and
> completely wrong above — one viewport cannot see it.

---

## 0.6 Rendering layers & stacking

Which components are **portalled**, their z-order, and every **clipping ancestor**.

> A component can be pixel-correct and render in the **wrong layer**: the same panel with the same
> classes, rendered inline instead of portalled, is clipped by any `overflow-hidden` ancestor and
> shrink-to-fits against a narrow containing block so its text wraps. **Rendering layer is a
> structural requirement**, not an implementation detail.

---

## 0.7 Motion — recorded AS MEASURED, never as transcribed

| Component | Enter | Exit | Duration | Easing |
|---|---|---|---|---|

> **A class name is not evidence a rule exists.** Animation utilities routinely appear in a build
> whose plugin was never loaded — the names are right and nothing moves. Measure it.
>
> **Enter and exit are separate**, and an exit needs a **mount lifecycle**: a component that
> unmounts on the same tick its `open` prop flips cannot animate out, whatever classes it carries.

---

## 1–3. Tokens (verbatim)

Theme tokens · brand tokens · shared class constants. **Verbatim, with provenance.**

---

## 4. Component recipes

### 4.N `<Component>`

- **Provenance:** `<file> → <Component>` — **never a minified symbol.** Minification renames symbols
  between builds, so a stale one reads as verified while pointing at something else. Open the
  reference and confirm it renders the component you are specifying.
- **Geometry:** measured `w × h`, padding, radius, border.
- **Cell scale** *(tables only)*: the measured **`padding / font-size / row-height`** triple, **per
  table**. Cell padding compounds — a few px per row becomes hundreds over a long one, and a product
  can easily run three or four different table scales.
- **States:** default · hover · focus · active · disabled · selected · empty · loading · error.
- **Open geometry** *(anything interaction-gated)*: the measured panel, **driven open**, plus each
  sub-part — so a mismatch points at *which* part.
- **Generated content:** where a component **computes** what it draws, record it — labels, counts,
  ordering, fixed dimensions, and for anything drawn: centre, radius, sweep, ticks, label positions,
  **as ratios** so one recipe serves every instance size.
- **Height driver:** where height is set by a **child** rather than by text, say which child. A 2px
  indicator or a 28px icon button can be load-bearing for everything below it.

---

## 4.x Icon register — an icon is a VALUE, not a description

| Key | Glyph | Family | Size | Where used |
|---|---|---|---|---|

> **A named asset with no artwork is not an asset.** An index listing 25 glyph names of which one
> has path data reads as delivered in every review, and a build that cannot follow it **invents**.
> An asset that genuinely cannot be extracted carries a `status` **and the evidence for it** — never
> an empty field.

---

## 5. How a spec references this library

- Chrome — colour, spacing, radius, shadow — **by reference**.
- **Semantic maps** — any `state → value` table — are **reproduced inline in the component block**.
  A reference is followed only if the builder chooses to; for chrome a wrong value is visible, for a
  map that encodes **meaning** it is not.
- Every reference **must resolve to a section that exists**. One that does not is a live
  `⚠ EXTRACT` and blocks readiness.

---

## 6. Referenced but NOT extracted — the dangling-reference register

| Reference | Cited by | Status |
|---|---|---|

> *"Styling by reference"* is safe only if the reference points at something real. A spec citing a
> recipe that was never written **reads as complete and is empty**. Keep this register visible;
> empty is the goal.

---

## 6.5 Build notes — implementation traps

Traps found while building. Each costs an hour the first time and nothing thereafter.

---

## 7. Open / decision items

Design deliverables that exist **nowhere in the prototype** and must be created. Each with an owner.
