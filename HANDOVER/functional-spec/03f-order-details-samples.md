# 03f — Order Details: Samples Tab

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** Samples tab table. Shared shell is owned by `03a`.

## A. Purpose & context
- **User goal:** inspect sample items associated with an order.
- **Entry points:** `03a` with Samples tab active.
- **Exit points / next actions:** switch tabs or navigate globally.

## A1. What this screen depends on, and where its data comes from
### Depends on — build these first
- `03a` Order Details Shell.
### Fixture data — for verification only, never for production
- Measured key: `order-detail-samples`; 2-row table at x=25px, y=225px, w=1390px, h=131px, row height 45px.

## B1. Page composition & region map
| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `ODSMP.RGN-01` | Samples tab mount | Inside `03a`; cap h=313px at 1440px. | `ODSMP.CMP-01`, `ODSMP.CMP-02` |
- **Width model:** table spans 1390px inside inherited cap.
- **Region state variance:** no overlays; hover measured.
- **Prototype symbol(s):** `order-detail-samples`.

## B2. Component inventory
| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `ODSMP.CMP-01` | Samples table | table | `ODSMP.RGN-01` | Headers `Number`, `Description`, `Supplied`. |
| `ODSMP.CMP-02` | Sample row state | row behavior | `ODSMP.CMP-01` | Hover measured. |

## C0. Context-variant matrix
| Context | Values | What changes on this screen |
|---|---|---|
| Sample supply state | supplied · not supplied | Supplied column renders per sample; semantic map open. |
| Store/country/persona | inherited | No measured variance. |
| Date / time | n/a | No temporal behavior measured. |

## C. Component specifications
### `ODSMP.CMP-01` — Samples table
- **Purpose / reflects:** sample items associated with the order.
- **Business rules:** why samples attach to orders, fulfilment rules and supplied semantics are open.
- **Data shown:** headers `Number`, `Description`, `Supplied`.
- **Structure & placement:** table x=25px, y=225px, w=1390px, h=131px; 2 rows; padding 12px 8px; font 14px/20px.
- **Open state (overlays only):** n/a.
- **Render — per data field:** sample number, description and supplied value render in table cells.
- **States — all four tiers:** Record: supplied state. Component: row hover. Context: inherited. Temporal: n/a.
- **Design requirement:** Samples must be separated into their own compact table so users can distinguish promotional/sample fulfilment from ordered articles.
- **Source:** sample fields · OMS / promotion/sample system · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** no activation measured.
- **UX/UI:** Library §4.9 — compact tab table recipe..
- **Acceptance:** GIVEN Samples tab is active, THEN the 3-column samples table renders.
- **Prototype symbol(s):** Samples table record.

### `ODSMP.CMP-02` — Sample row state
- **Purpose / reflects:** row hover feedback.
- **Business rules:** row activation/selectability is open.
- **Data shown:** row content from `ODSMP.CMP-01`.
- **Structure & placement:** inside samples table.
- **Open state (overlays only):** n/a.
- **Render — per data field:** row feedback treatment pending extraction.
- **States — all four tiers:** Record: sample row. Component: hover measured. Context: inherited. Temporal: n/a.
- **Design requirement:** Row feedback must help users track across the sample list even when the table is short.
- **Source:** client row state; sample fields · OMS/sample system · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** hover only measured.
- **UX/UI:** Library §4.9, §4.11 — row hover recipe..
- **Acceptance:** GIVEN a sample row is hovered, THEN measured hover treatment appears.
- **Prototype symbol(s):** Samples state-census row records.

## D. Screen-level conditions, permissions & edge cases
- Empty samples and sample eligibility rules are open.
## E. Open questions (for PM/Design/Eng to resolve)
- ⚠ OPEN — PM: What qualifies an item as a sample and who sees it?
- ⚠ OPEN — PM: What does Supplied mean for samples?
- ⚠ OPEN — Eng: Which system owns sample rows?
- ⚠ OPEN — Design Systems: extract samples table and row-hover recipes.
## F. Render-parity checklist
| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `ODSMP.CMP-01` | ✅ | ⚠ | ⚠ | ✅ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ⚠ | ✅ |
| `ODSMP.CMP-02` | ⚠ | ⚠ | n/a | ✅ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
## G. Coverage reconciliation
| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| Samples table | `ODSMP.CMP-01`, `ODSMP.CMP-02` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.