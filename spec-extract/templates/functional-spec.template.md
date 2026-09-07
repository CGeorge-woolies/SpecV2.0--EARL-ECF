# [NN] — <Screen / Feature Name>

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Two sources of truth, and they cover different things.**
> - **The baseline prototype** (see `../README.md`) is the source of truth for the **experience** —
>   layout, states, interactions, and every pixel. Where this doc describes *rendering*, the
>   prototype wins and the spec must be verbatim.
> - **PM / Design** are the source of truth for the **business rules** — thresholds, eligibility,
>   permissions, sources, cadences, configurable values. A static mock **cannot express these**, so
>   the prototype is *silent* on them, not authoritative.
>
> **Filling that second gap is the point of this artifact.** A business rule that differs from the
> prototype is normally the work landing, not a defect — classify it in `../FLAGS.md`
> (*extension* · *conflict* · *spec defect* · *mock scaffolding*) rather than treating every
> difference as a problem. Only a **conflict** blocks build.
>
> **Scope:** *what* the screen does and *how* it behaves, plus the rules behind it. Technical
> connection to backend systems is out of scope (owned by the integration team); this doc tells
> them **which data each element reflects** and **under what rules**.
>
> **Legend:** _(observed)_ · _(inferred)_ · **⚠ OPEN** = needs a decision · **⚠ EXTRACT** =
> value still to mine from the bundle. State names reference `../DATA-CONVENTIONS.md` §2.
> Styling references the shared **UX/UI pattern library** (`../ux-ui-library/README.md`) —
> name *which* pattern applies, not the values.
>
> **Authoring rules (non-negotiable — `../guidance/writing-a-spec.md` §3.5):**
> 1. **Completeness before altitude.** Complete on all **five coverage axes** — Region ·
>    Component · Field · State (incl. **overlay/open** and **viewport**) · Structure (incl.
>    **width constraints** and **rendering layer**). Being terse never means omitting an axis.
> 2. **If it renders, it has an ID.** Build §B1/§B2 by walking the prototype's **render tree
>    top-down from the page root**, not by listing the data on screen. Never describe a
>    component inside another component's prose bullets — give it its own ID and block.
> 3. **Structure is a requirement.** `colSpan`, column-grid participation, child order,
>    alignment, **width constraints (min/max/cap)** and **rendering layer** (inline vs portal,
>    stacking, clipping ancestors) go in *Structure & placement* — they are not styling and must
>    not be left to the builder.
> 4. **Styling by reference — and the reference must resolve.** Cite an existing
>    `ux-ui-library` §/recipe. If it isn't there, log `⚠ EXTRACT` (and register it in library
>    §7). A reference that resolves to nothing reads as complete and is empty.
> 5. **Behaviour verbatim; rules explicit.** States, strings and conditions quoted from the
>    prototype exactly. Unknown → `⚠ OPEN`, never a plausible guess. When a PM/Design rule differs
>    from the prototype, **record the rule as the requirement**, mark the component
>    `⚠ Diverges`, and log it in `../FLAGS.md` **with its type**. Write the prototype's behaviour
>    alongside, labelled *"for reference — do not build this"*, so the builder cannot mistake which
>    one to implement.
> 8. **Every component has a *Business rules* field.** If the prototype answers *what it looks
>    like* but nobody has said *when it applies, to what, and why*, the rule is missing — write
>    `⚠ OPEN` there. **Rendering completeness is not requirement completeness**; a component can be
>    pixel-perfect and unbuildable.
> 9. **Name the time-dependent state.** If a component changes with **no user action and no record
>    change** — an elapsed-time threshold, a window becoming eligible, a stale-data cutoff — say so
>    explicitly. No screenshot, at rest or open, can ever see it, so it is invisible to every
>    verification the pack has.
> 6. **Never infer a rendering from a data field's existence.** Grep the field in render
>    context. A state with no found rendering renders nothing.
> 7. **Overlays are specified OPEN.** A tooltip, popover, dialog or toast is only covered when its
>    **open state** is written down — panel geometry, side/align/offset, and rendering layer
>    (§3.5.9). An at-rest screenshot scores a broken overlay as perfect.

---

## A. Purpose & context
- **User goal:** <who uses this and what they achieve>
- **Entry points:** <how the user arrives here>
- **Exit points / next actions:** <where they can go>

## A1. What this screen depends on, and where its data comes from

> **Both halves are REQUIRED.** A screen spec that omits them reads as standalone and is not.

### Depends on — build these first
<shell regions this screen assumes · any constant INHERITED from another spec (e.g. header height
→ a sticky offset) · the `ux-ui-library` sections that resolve its units>

### Fixture data — for verification only, never for production
<In production this screen is populated from its named source systems (§C *Source* per component).
A **fidelity rebuild** additionally needs the baseline dataset, because row counts and aggregates
determine the page geometry. State: **where it lives** (prototype symbol), the **expected volume**
so a partial extraction is detectable, and that it is **mock scaffolding that must not ship**.
**Do not invent rows** — synthesised data matches nothing and reads as real.>

---

## B1. Page composition & region map
> *Coverage axis 1.* Walk the render tree **outside-in from the page root**. Every node that
> exists before you reach a component — page background, bands, containers, wrappers — is a
> **region** and gets a `SCRN.RGN-*` ID. Regions dropped here are regions the rebuild omits.

| Region ID | Node | Scaffold properties (bg · padding/margin · **width constraint** · border · stacking) | Contains |
|---|---|---|---|
| `SCRN.RGN-01` | page root | … | `SCRN.RGN-02`, `SCRN.RGN-03` |
| `SCRN.RGN-02` | … | … | … |

- **Width model:** state every `max-width` / `min-width` / centring / break-out on the chain from
  the app shell down. **A missing cap is pixel-identical below it and wrong above it**, so this
  must be written even when it looks like it has no effect at your test width.

- **Region state variance:** <any region whose chrome changes with context — e.g. a background
  driven by the selected date. Cross-reference §C0.>
- **Prototype symbol(s):** <minified symbols, so every claim is re-checkable>

## B2. Component inventory
> *Coverage axis 2.* **Every** rendered element — data-bearing or not — with a stable ID and
> its parent region. Chrome (icon groups, steppers, labels, chips) counts.

| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `SCRN.CMP-01` | … | table / button / badge / … | `SCRN.RGN-02` | … |

## C0. Context-variant matrix
> *Coverage axis 4, context tier.* What this screen renders differently by context. Fill every
> cell that applies; "no change" is a valid, useful answer.

| Context | Values | What changes on this screen |
|---|---|---|
| <context axis 1, e.g. tenant / product type> | <value> · <value> | … |
| <context axis 2, e.g. locale / market> | <value> · <value> | … |
| <role / persona> | <value> · <value> | … |
| Date / time | today · past · future | … |
| Feature toggles | … | … |

## C. Component specifications
Repeat this block **per component in §B2** — no component may be covered only by prose
elsewhere.

### `SCRN.CMP-01` — <Component name>
- **Purpose / reflects:** <the real-world data/state this represents + its system source,
  e.g. "current order state from the OMS">
- **Business rules:** <the logic the prototype cannot show: *when* this renders, *what* qualifies,
  *which* threshold or eligibility applies, *who* may use it, *what* configures it, and **why**.
  Cite the ruling and its date. `⚠ OPEN` if nobody has ruled — an unfilled rule is as much a gap
  as an unextracted colour. Where a rule differs from the prototype, mark `⚠ Diverges — F-NNN`
  and state the required behaviour **first**, the prototype's second.>
- **Data shown:** <the values/strings displayed, in plain language>
- **Structure & placement:** <parent region; box/DOM structure and child order; participation
  in a column grid (`colSpan`, which columns it lands over); alignment; **min/max width and any
  cap it inherits**; **rendering layer** — inline, portal-popup or portal-modal — plus stacking
  and any `overflow-hidden` ancestor that would clip it.>
- **Open state (overlays only):** <for a tooltip/popover/dialog/toast: measured panel geometry
  (w×h at the baseline viewport), side/align/offset, and layer. §3.5.9.>
- **Render — per data field:** <one line per field: exactly how the prototype draws it. Not
  that the field exists — how it renders. A field with no found rendering renders nothing.>
- **States — all four tiers** *(motion is NOT a state; it has its own field below)*:
  - *Record:* <per-record flags/enums and each one's found treatment>
  - *Component:* <hover · focus · selected · indeterminate · open/collapsed · sticky/stuck ·
    empty · loading · error — whichever this component can be in>
  - *Context:* <what §C0 changes for this component specifically>
  - *Temporal:* <what changes with **elapsed time alone** — no click, no new data. An
    order ageing past a "recently placed" threshold; a window passing its `pickingAllowed` time and
    entering a count; data going stale past a refresh cutoff. State the **trigger**, the
    **threshold**, where it is **configured**, and **when it re-evaluates**. `n/a` is the common and
    correct answer — but it must be answered, because nothing else in this pack can detect it.>
- **Design requirement** *(REQUIRED — platform-neutral; `../guidance/writing-a-spec.md` §1.4)*: one or two
  sentences saying **what must be true for the user, and why** — *before* any mechanism.
  - *"The column header row stays visible at the top of the scroll region while the body scrolls,
    so column meaning is never lost on a long list. Once content has scrolled beneath it, it gains
    a shadow separating it from the body."*
  - **Never state a mechanism as the requirement.** `position: sticky`, `IntersectionObserver`,
    `z-[4]` are **realisation**, recorded separately — they mean nothing on another platform.
  - Behavioural affordances that MUST be stated here because they are **invisible in a screenshot
    and unstated in a class string**: what stays fixed while what scrolls · focus order and
    autofocus · keyboard activation and `Escape` dismissal · click-outside · tab stops deliberately
    removed · what holds its width when empty · drag/resize.
- **Source** *(REQUIRED on every data-bearing component — Gate 2 item 3)*: for each value,
  `{field} · {system}` — e.g. `deliveryDate · OMS order`. Unknown is `⚠ Eng: name the field and
  its source`. A presentational component states **`n/a — presentational`** explicitly, so the
  absence is a **decision**, not an omission. **Name what data and which system; never the endpoint.**
- **Motion — axis 6** *(`ux-ui-library` §0.7; REQUIRED for anything that opens, closes or moves)*:
  - *Enter:* <which properties animate, over what **duration**, with what **easing**>
  - *Exit:* <the same, stated **separately** — an exit is not always the enter reversed, and it is
    the half that gets dropped>
  - *Mount lifecycle:* <an overlay must stay **mounted** for its exit duration carrying its closing
    marker. `if (!open) return null` **cannot** animate out, whatever classes it carries — this is a
    **structural** requirement (axis 5), not styling, and a spec that gives only the classes cannot
    be satisfied.>
  - **`n/a` is not an answer for anything that opens or closes.** If it genuinely cuts, write
    **`none`** — that is a design decision and has to be recorded as one. Motion is invisible to
    every screenshot at every viewport. Measured by `census-open.mjs` (enter/exit sampled as a series)
    and signed off by the parity gate's `--pass open`.
  - **Record what you MEASURED, not what the class names say.** The baseline carries dead animation
    classes (`animate-in`, `zoom-in-95`, `slide-in-from-*`) with no CSS rule behind them; a builder
    transcribing them reproduces the names and not the behaviour (§3.5.11u).
- **Interactions:** <`IF <trigger> THEN <outcome>`, verbatim>
- **UX/UI:** <which `ux-ui-library` pattern(s) apply — the reference **must resolve**; `⚠ EXTRACT`
  + library §7 entry if it doesn't. `⚠ OPEN` for undecided tokens.>
- **Acceptance:** <1–2 concise GIVEN/WHEN/THEN for the key behaviour(s)>
- **Prototype symbol(s):** <provenance for everything asserted above>

## D. Screen-level conditions, permissions & edge cases
- Role/permission gating, feature flags, store-type gating, error/empty screens.

## E. Open questions (for PM/Design/Eng to resolve)

> **⚠ ONLY GENUINELY OPEN ITEMS BELONG HERE, each with a named owner.** A **ruled** decision in a
> questions table is a defect — it reads as unresolved, and it forces the reader to reconstruct the
> requirement from a struck-out question plus a ruling (`../guidance/writing-a-spec.md` §1.5).
> **A decision lives in the component block it governs, stated definitively, with its reasoning
> kept intact.** Compression is of *form*, never of *content*: no rule, rationale, scope or owner
> may be lost in the move.

- ⚠ …

## F. Render-parity checklist
> *Filled, not linked* (`../guidance/writing-a-spec.md` §3.5.7). One row per component in §B2. `✅` = answered
> **from the prototype** and recorded above · `n/a` = does not apply · `⚠` = unanswered, which
> **blocks rebuild-ready**.

| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | **Temporal state** | **Business rules ruled** | Structure / colSpan / alignment | **Width constraint** | **Rendering layer** | **Open-state geometry** | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `SCRN.CMP-01` | | | | | | | | | | | | | | |

## G. Coverage reconciliation
> The completeness gate. Every node in the prototype's tree for this screen maps to a spec ID
> **or** carries an explicit out-of-scope reason. **Unmapped nodes = not rebuild-ready.**

| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| `xx` | `SCRN.RGN-01` | |
| `yy` | — | out of scope: <reason> |

**Rebuild-ready** — *can engineering build the pixels?*
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure +
Render + 4-tier states · ☐ every overlay specified **open** · ☐ every library reference resolves ·
☐ every library value has provenance · ☐ §F filled · ☐ **multi-viewport parity passes** (§3.5.9).

**Requirement-ready** — *can engineering build the right thing, and wire it?* **A screen can be
rebuild-ready and still not be this**, which is the gap the whole handover exists to close.
☐ every component has a **Business rules** entry (ruled, or an owned `⚠ OPEN`) ·
☐ every **temporal** state named with its threshold and where it is configured ·
☐ every value's **source system** named · ☐ all **mock scaffolding** called out as must-not-build ·
☐ every flag carries a **type** · ☐ no `⚠ OPEN` without a **named owner**.
