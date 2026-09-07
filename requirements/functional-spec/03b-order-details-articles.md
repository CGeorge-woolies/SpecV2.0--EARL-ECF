# 03b — Order Details: Articles Tab

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** Articles tab table, totals/weight summary and Articles-specific row/selection behavior. Shared shell and toolbar are owned by `03a`.

## A. Purpose & context
- **User goal:** inspect ordered and supplied articles for one order and launch line/detail actions.
- **Entry points:** `03a` with Articles active; default Order Details tab.
- **Exit points / next actions:** open Order Line Detail; launch Move to Shop Floor through `07`; print/export through `08` where available.

## A1. What this screen depends on, and where its data comes from
### Depends on — build these first
- `03a` Order Details Shell; `04` Order Line Detail; `07` Move to Shop Floor.

### Fixture data — for verification only, never for production
- Measured keys: `order-detail-articles`, `order-detail-estore`.
- At 1440px article table renders 24 rows in default context and 22 rows in eStore; table is 1390px wide with 45px row height.

## B1. Page composition & region map
| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `ODART.RGN-01` | Articles tab mount | Mounted inside `03a`; cap x=24px, y=68px, w=1392px. | `ODART.RGN-02`, `ODART.RGN-03` |
| `ODART.RGN-02` | totals/weight summary | Above/around article table; literals include `Totals` and `Actual weights (`. | `ODART.CMP-01` |
| `ODART.RGN-03` | articles table region | Table at x=25px, y=225px, w=1390px. | `ODART.CMP-02`, `ODART.CMP-03` |
- **Width model:** table spans 1390px inside inherited cap at 1440px.
- **Region state variance:** eStore table height is 1145px for 22 rows; default height is 1259px for 24 rows.
- **Prototype symbol(s):** `order-detail-articles`, `order-detail-estore`.

## B2. Component inventory
| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `ODART.CMP-01` | Article totals and weights summary | summary fields | `ODART.RGN-02` | Renders totals/actual weights copy. |
| `ODART.CMP-02` | Articles table | table | `ODART.RGN-03` | 9-column article table. |
| `ODART.CMP-03` | Article row interaction | row behavior | `ODART.CMP-02` | Hover measured; eStore selected state measured. |

## C0. Context-variant matrix
| Context | Values | What changes on this screen |
|---|---|---|
| Store type | Supermarket · eStore | eStore has 22 measured rows and exposes Move to Shop Floor launch contracts through `03a`/`07`. |
| Order status | active · dispatched | Move actions disabled for dispatched status in source; final rule open. |
| Selection | no selected line · selected line(s) | Selected line count gates Move Line in eStore. |
| Date / time | n/a | No temporal article-table behavior measured. |

## C. Component specifications
### `ODART.CMP-01` — Article totals and weights summary
- **Purpose / reflects:** summarises order article totals and supplied weights.
- **Business rules:** weight/total derivations are open.
- **Data shown:** `Totals`, `Actual weights (`, `ordered lines /`, `unsupplied articles`, `supplied weights)`.
- **Structure & placement:** above or adjacent to the articles table.
- **Open state (overlays only):** n/a.
- **Render — per data field:** summary labels and values render as text/summary fields.
- **States — all four tiers:** Record: order totals. Component: static. Context: store type. Temporal: n/a.
- **Design requirement:** Summary values must appear before row detail so users can understand article completion before scanning each line.
- **Source:** article totals/weights · OMS / picking system · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none measured.
- **UX/UI:** Library §4 — summary field recipe..
- **Acceptance:** GIVEN Articles tab renders, THEN totals/weight summary renders above the table.
- **Prototype symbol(s):** Articles tab literals.

### `ODART.CMP-02` — Articles table
- **Purpose / reflects:** article line items for the selected order.
- **Business rules:** substitution, price and amount derivations are open.
- **Data shown:** headers `No.`, `Article No.`, `Description`, `Volume`, `Ordered`, `Supplied`, `Price`, `Subs`, `Amount`.
- **Structure & placement:** table at x=25px, y=225px, w=1390px; row height 45px; cell padding 12px 8px; font 14px/20px.
- **Open state (overlays only):** n/a.
- **Render — per data field:** one row per article; identifiers render as strings.
- **States — all four tiers:** Record: article line status/substitution. Component: row hover/selection. Context: eStore row count and actions. Temporal: n/a.
- **Design requirement:** Article columns must stay in a fixed order so line quantities, substitutions and amounts can be compared row by row.
- **Source:** article line fields · OMS / catalogue / picking system · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** IF a row is activated THEN open `04` Order Line Detail.
- **UX/UI:** Library §4.9 — article table recipe..
- **Acceptance:** GIVEN Articles tab is active, THEN the 9 table headers render in the order listed.
- **Prototype symbol(s):** Articles table records.

### `ODART.CMP-03` — Article row interaction
- **Purpose / reflects:** hover/selected line state for article rows.
- **Business rules:** selectable rows and disabled rows are open.
- **Data shown:** row content from `ODART.CMP-02`.
- **Structure & placement:** inside table rows.
- **Open state (overlays only):** n/a.
- **Render — per data field:** row hover changes filter from none to brightness(0.97) on hover-enabled article rows per Library §4.11.g.
- **States — all four tiers:** Record: line eligibility. Component: hover measured; selected measured in eStore. Context: selected lines gate Move Line. Temporal: n/a.
- **Design requirement:** Row feedback must make the target line clear before line-level movement or detail navigation.
- **Source:** selected line state · client; article line fields · OMS · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** IF row selected THEN selectedLineCount updates for Move Line contract.
- **UX/UI:** Library §4.9, §4.11 — table row state recipe..
- **Acceptance:** GIVEN an article row is hovered, THEN measured row feedback appears.
- **Prototype symbol(s):** Articles state-census row records.

## D. Screen-level conditions, permissions & edge cases
- Empty article list, unavailable catalogue data, substitution rules and price visibility are open.
- Move to Shop Floor outcome is owned by `07`.

## E. Open questions (for PM/Design/Eng to resolve)
- ⚠ OPEN — PM: What row ordering and substitution rules apply to article lines?
- ⚠ OPEN — PM: Which article fields are visible by role/country/store type?
- ⚠ OPEN — Eng: Which systems own article, price, quantity and substitution values?
- ⚠ OPEN — Design Systems: extract article table, totals summary and row-state recipes.

## F. Render-parity checklist
| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `ODART.CMP-01` | ⚠ | n/a | n/a | n/a | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `ODART.CMP-02` | ✅ | ⚠ | ⚠ | ✅ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ✅ |
| `ODART.CMP-03` | ⚠ | ⚠ | n/a | ✅ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |

## G. Coverage reconciliation
| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| Articles tab mount | `ODART.RGN-01` | |
| totals/weight summary | `ODART.CMP-01` | |
| articles table and row states | `ODART.CMP-02`, `ODART.CMP-03` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.