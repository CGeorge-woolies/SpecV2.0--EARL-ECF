# 04 — Order Line Detail

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** distinct Order Line Detail route and its details field inventory.

## A. Purpose & context
- **User goal:** inspect one article line in detail and move between neighbouring lines.
- **Entry points:** Order Details Articles row activation.
- **Exit points / next actions:** Previous Line, Next Line, return to Order Details.

## A1. What this screen depends on, and where its data comes from
### Depends on — build these first
- `01` Global App Shell; `03b` Order Details Articles tab.
### Fixture data — for verification only, never for production
- Measured key: `order-line-detail`; no tables or overlays; content cap x=24px, y=68px, w=1392px, h=535px at 1440px.

## B1. Page composition & region map
| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `LINE.RGN-01` | route mount | Below global header at y=68px. | `LINE.RGN-02` |
| `LINE.RGN-02` | content cap | x=24px, y=68px, w=1392px, h=535px. | `LINE.CMP-01` through `LINE.CMP-04` |
- **Width model:** inherits global content cap.
- **Region state variance:** no disclosure, row or overlay state measured.
- **Prototype symbol(s):** `order-line-detail`.

## B2. Component inventory
| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `LINE.CMP-01` | Line identity summary | field group | `LINE.RGN-02` | Article Number, Line Number, Order No. |
| `LINE.CMP-02` | Line quantity and pricing fields | field group | `LINE.RGN-02` | Ordered/Supplied quantity, UOM, price/amount/discount. |
| `LINE.CMP-03` | Substitute and notes fields | field group | `LINE.RGN-02` | Substitute and Personal Shopper Notes. |
| `LINE.CMP-04` | Previous/Next line navigation | button/link group | `LINE.RGN-02` | `Previous Line`, `Next Line`. |

## C0. Context-variant matrix
| Context | Values | What changes on this screen |
|---|---|---|
| Line position | first · middle · last | Previous/Next availability rules are open. |
| Substitute state | allowed · not allowed · selected substitute | Substitute rendering and eligibility are open. |
| Store/country/persona | inherited | No measured variance. |
| Date / time | n/a | No temporal behavior measured. |

## C. Component specifications
### `LINE.CMP-01` — Line identity summary
- **Purpose / reflects:** identifies the selected order line.
- **Business rules:** canonical line identifier and article identifier source are open.
- **Data shown:** `Line Info`, `Line Number`, `Article Number`, `Order No.`, article description.
- **Structure & placement:** field group in route content.
- **Open state (overlays only):** n/a.
- **Render — per data field:** label/value pairs.
- **States — all four tiers:** Record: selected line. Component: static. Context: inherited. Temporal: n/a.
- **Design requirement:** Line identity must be explicit so users know which article line they are inspecting outside the order table.
- **Source:** line/article identity · OMS/catalogue · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none.
- **UX/UI:** Library §4.4 — detail field group recipe..
- **Acceptance:** GIVEN Order Line Detail renders, THEN line and article identifiers are visible.
- **Prototype symbol(s):** `order-line-detail` literals.

### `LINE.CMP-02` — Line quantity and pricing fields
- **Purpose / reflects:** ordered/supplied quantities and monetary values.
- **Business rules:** money, discount, UOM and quantity formatting are open.
- **Data shown:** `Ordered Quantity`, `Supplied Quantity`, `Unit of Measure (UOM)`, `Volume Size`, `Order Price`, `Order Line Amount`, `Order Line Discount`.
- **Structure & placement:** field group in route content.
- **Open state (overlays only):** n/a.
- **Render — per data field:** label/value pairs.
- **States — all four tiers:** Record: line quantity/price. Component: static. Context: inherited. Temporal: n/a.
- **Design requirement:** Quantity and pricing fields must be grouped so fulfilment and commercial information are not conflated.
- **Source:** quantity/price fields · OMS/pricing/catalogue · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none measured.
- **UX/UI:** Library §4.4 — detail field group recipe..
- **Acceptance:** GIVEN Line Detail renders, THEN ordered and supplied quantities are visible as separate fields.
- **Prototype symbol(s):** line detail literals.

### `LINE.CMP-03` — Substitute and notes fields
- **Purpose / reflects:** substitution eligibility and shopper notes.
- **Business rules:** substitute rules, notes visibility and empty values are open.
- **Data shown:** `Substitute`, `Subs Allowed`, `Personal Shopper Notes`, `<PersonalShopperNotes>`.
- **Structure & placement:** field group in route content.
- **Open state (overlays only):** n/a.
- **Render — per data field:** label/value pairs.
- **States — all four tiers:** Record: substitute allowed and notes present/empty. Component: static. Context: inherited. Temporal: n/a.
- **Design requirement:** Substitution and notes must be visible with the line so exception handling is tied to the exact article.
- **Source:** substitution/notes fields · OMS/picking system · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none measured.
- **UX/UI:** Library §4.4 — detail field group recipe..
- **Acceptance:** GIVEN substitution data exists, THEN it renders separately from quantity/pricing fields.
- **Prototype symbol(s):** line detail literals.

### `LINE.CMP-04` — Previous/Next line navigation
- **Purpose / reflects:** movement between lines in the same order.
- **Business rules:** disabled state for first/last line and whether navigation preserves scroll/history are open.
- **Data shown:** `Previous Line`, `Next Line`.
- **Structure & placement:** navigation controls in line detail route.
- **Open state (overlays only):** n/a.
- **Render — per data field:** two navigation controls.
- **States — all four tiers:** Record: current line position. Component: enabled/disabled/focus. Context: inherited. Temporal: n/a.
- **Design requirement:** Adjacent-line navigation must let users inspect line details sequentially without returning to the articles table each time.
- **Source:** current line/order line collection · OMS/client route state · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** IF Previous Line is activated THEN navigate to previous eligible line. IF Next Line is activated THEN navigate to next eligible line.
- **UX/UI:** Library §4.2 — adjacent navigation recipe..
- **Acceptance:** GIVEN a middle line is open, THEN both previous and next navigation controls are available.
- **Prototype symbol(s):** `order-line-detail` literals.

## D. Screen-level conditions, permissions & edge cases
- First/last line navigation, missing line, deleted line and stale order context are open.
## E. Open questions (for PM/Design/Eng to resolve)
- ⚠ OPEN — PM: What happens for first/last line navigation?
- ⚠ OPEN — PM: Which substitute and note fields are visible by role?
- ⚠ OPEN — Eng: Which systems own line detail, pricing, quantity and substitution fields?
- ⚠ OPEN — Design Systems: extract detail field and adjacent navigation recipes.
## F. Render-parity checklist
| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `LINE.CMP-01` | ⚠ | n/a | n/a | n/a | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `LINE.CMP-02` | ⚠ | n/a | n/a | n/a | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `LINE.CMP-03` | ⚠ | n/a | n/a | n/a | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `LINE.CMP-04` | ⚠ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
## G. Coverage reconciliation
| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| line detail route | `LINE.RGN-01`, `LINE.RGN-02` | |
| line info/quantity/substitute fields | `LINE.CMP-01` through `LINE.CMP-03` | |
| previous/next navigation | `LINE.CMP-04` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.