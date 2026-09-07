# Writing a functional spec from a prototype

> The condensed method. Everything here was bought with a defect that survived a green check.
> Read this; use `templates/functional-spec.template.md` as the shape.

---

## 0. First decide WHICH documents to write

**Before anything else**, read `decomposing-into-documents.md`. One spec per screen is not the rule,
and getting the decomposition wrong is expensive to undo once thirteen documents cross-reference
each other.

## 1. What you are producing

A requirements package an engineering team — or an agent — can use to **rebuild the product on a
platform that may be neither React nor Tailwind**, and **wire it to real systems**, without
reconstructing the conversation that produced it.

Five conditions, all required:

1. every component, region, state, interaction and transition is recreatable, at every viewport;
2. the design requirement **survives leaving the prototype's framework behind**;
3. every value names **what data it reflects and which system knows it**;
4. nobody has to reverse-engineer a requirement from a struck-out question;
5. what is still undecided is **distinct from what is decided**, and has a named owner.

---

## 2. The three sources of truth

| Source | Authoritative for | **Not** authoritative for |
|---|---|---|
| **The prototype** (running, not its source) | the **design** — every component, placement, state, interaction and pixel; and the fixture dataset | business rules, thresholds, permissions, data sources. On these it is **silent, not correct** |
| **PM / Design** | the **product** — what data means, what is allowed, what is configurable, and **why** | how it should look |
| **The live system**, where one exists | behaviours marked **AS-IS**; the description you write is the *known* contract, not the complete one | anything not marked AS-IS |

Where a prototype's source code is also available, it is authoritative for **identity, provenance,
semantic maps, generated content and what changed between versions** — and **never** for anything
computed. **Source proposes; render disposes.**

---

## 3. Two levels for every design requirement

A framework class is **not** a specification. On another platform it means nothing.

> **Requirement:** *the column header row stays visible at the top of the scroll region while the
> body scrolls, so column meaning is never lost on a long list; once content has scrolled beneath
> it, it gains a shadow to separate it from the body.*
>
> **Realisation (reference only):** `position: sticky`, `top: 68px`, `z-index 4`, an
> IntersectionObserver on a sentinel.

- **Every measurable value in real units** — px, hex, ms, font-weight. A builder on another platform
  cannot resolve a utility scale and must not have to.
- **Every behavioural affordance gets a requirement sentence** — sticky behaviour, focus order,
  keyboard dismissal, what holds width when empty, what stays fixed while what scrolls. These are
  invisible in a screenshot and unstated in a class string, and they are exactly what gets dropped.
- **Never state a mechanism as the requirement.**

---

## 4. Coverage — six axes, and a spec is only as complete as its weakest

| Axis | Means | Failure it prevents |
|---|---|---|
| **Region** | every node from page root down, with padding, sizing, background | whole regions silently absent |
| **Component** | **if it renders, it has an ID** | components dissolved into another's prose bullets |
| **Field** | the exact render of **each data field** | inventing a badge from a field name |
| **State** | **record · component · context · temporal**, opening with the **DEFAULT** | a date-driven theme; a 5-minute threshold; a table that does not exist until a search runs |
| **Motion** | enter and exit **separately**, with duration and easing — or an explicit `none` | every overlay cutting instantly while the recipes carried the right values |
| **Structure** | placement, child order, grid participation, width caps, **rendering layer** | a tooltip clipped by an `overflow-hidden` ancestor |

> **A prose bullet is not a specification.** If you find yourself writing *"…and a date selector"*
> inside another component's description — stop. That is a component. *A bullet is where a component
> goes to die.*

**Build the inventory by walking the render tree from the page root**, not by listing the data.
Data-first extraction under-samples chrome; render-tree-first under-samples data variants. **Both
passes are required.**

---

## 5. Altitude — split by KIND, not by topic

| Aspect | Altitude |
|---|---|
| Chrome — colour, spacing, radius, shadow | **by reference** to the pattern library |
| **Semantic maps** — any `state → value` table | **reproduced INLINE in the component block** |
| States, interactions, data source | **terse but verbatim** |

**Why semantic maps are the exception.** A reference is followed only if the builder chooses to. For
chrome that is survivable — a wrong padding is visible. For a map that encodes **meaning** it is
not: the builder's invented map produces a component that looks entirely plausible and is wrong only
in the states nobody checks.

---

## 6. Divergence — classify it, and only one kind blocks

| Type | Meaning | Disposition |
|---|---|---|
| **Business-rule extension** | PM supplies logic the mock could not encode | **Expected.** Record it as the requirement |
| **Business-rule conflict** | the rule and the designed experience cannot both hold | **Blocks build.** Design must reconcile |
| **Spec defect** | the pack failed to describe what the prototype does | fix the spec **and** the rule that let it through |
| **Mock scaffolding** | exists only to make a static demo work | **Must not be built.** Name it at the component |

A PM rule that differs from the mock is **the normal output of the exercise**, not an anomaly.

> **A do-not-build call-out belongs on the COMPONENT BLOCK**, not only in a divergence register. A
> builder reads the block; an unmarked block is a build instruction whatever the register says.

---

## 7. Things that are true and easy to get wrong

- **An absent property in a recipe is a statement, not a gap.** No marker means complete. Where a
  value is genuinely missing, mark it. Do not fill a gap with a plausible default.
- **A rendering format is never a data source.** If the mock embeds a value in presentation
  (`"DIS 01:32 PM"`), the derivation belongs in fixture extraction, once — never in product code.
- **An identifier is a string**, however numeric it looks.
- **Illustrative values are schematics**, never quoted copy — write `"{Long weekday} {DD/MM/YYYY}"`.
  A completeness gate will otherwise demand your example as required copy.
- **Never render spec commentary.** No warning marks, section references, flag ids or
  "not yet sourced" may appear in UI copy. A placeholder that explains itself reads as designed and
  ships.
- **A category noun is not a shape.** "Card", "panel", "metric", "summary" carry no structural
  information. Where the render is tabular, **name the header cells in order**.
- **A control's KIND is a requirement** — native or custom, click-opened or hover-opened, or **both
  at once**. It decides the accessibility contract and whether a design system can style it at all.
- **Where a component's height is set by a child rather than by its text, say which child.** A 2px
  indicator or a 28px icon button can be load-bearing for the whole page below it.

---

## 8. Verification — what each instrument can and cannot see

| | |
|---|---|
| A **pixel comparison** | evidence of **accuracy**, never of completeness. An unbuilt overlay is pixel-identical to a correct one while closed |
| **Completeness checks** | evidence of **completeness**, never of accuracy. Ten green gates say nothing about whether the glyphs are right |
| **No instantaneous measurement of any kind** | can see **motion** |
| **One viewport** | cannot see a width constraint |
| **A resting screenshot** | cannot see an overlay's correctness *or its existence* |

**They are cumulative, not alternative.** Report both, and quote the numbers — a list of green checks
with no measurement reads as more thorough than it is.
