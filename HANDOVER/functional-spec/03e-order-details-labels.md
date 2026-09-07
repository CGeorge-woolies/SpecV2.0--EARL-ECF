# 03e — Order Details: Labels Tab

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** Labels tab tote table and row action menu. Print artifact outcome is owned by `08`.

## A. Purpose & context
- **User goal:** inspect tote/label status for an order and launch row-scoped label actions.
- **Entry points:** `03a` with Labels tab active.
- **Exit points / next actions:** print labels through `08`, delete label rows if approved, switch tabs.

## A1. What this screen depends on, and where its data comes from
### Depends on — build these first
- `03a` Order Details Shell; `08` Print & Export Documents.
### Fixture data — for verification only, never for production
- Measured key: `order-detail-labels`; 4-row table at x=25px, y=270px, w=1390px, h=237px, row height 50px.

## B1. Page composition & region map
| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `ODLBL.RGN-01` | Labels tab mount | Inside `03a`; cap x=24px, y=68px, w=1392px, h=536px. | `ODLBL.RGN-02`, `ODLBL.RGN-03` |
| `ODLBL.RGN-02` | label table region | Contains tote label table. | `ODLBL.CMP-01`, `ODLBL.CMP-02` |
| `ODLBL.RGN-03` | row-action popover layer | Row popovers at x=1323px, w=84px, h=64px. | `ODLBL.CMP-03` |
- **Width model:** table measures 1390px wide inside inherited cap.
- **Region state variance:** row action y-position follows row (349px, 399px, 449px measured).
- **Prototype symbol(s):** `order-detail-labels`.

## B2. Component inventory
| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `ODLBL.CMP-01` | Labels table | table | `ODLBL.RGN-02` | Headers `Tote No.`, `Status`, `Zone`, `Personal Shopper`, `Bags`. |
| `ODLBL.CMP-02` | Label row state | row behavior | `ODLBL.CMP-01` | Hover and selected states measured. |
| `ODLBL.CMP-03` | Label row actions | popover menu | `ODLBL.RGN-03` | `Delete`, `Print`; Print launches `08`. |

## C0. Context-variant matrix
| Context | Values | What changes on this screen |
|---|---|---|
| Row action | closed · open | Open row popover renders Delete/Print. |
| Label status | Awaiting Pick · Packed and related measured statuses | Status map and rules are open. |
| Zone | Ambient · Chilled · Freezer · Security | Zone labels render in table; taxonomy open. |
| Date / time | n/a | No temporal behavior measured. |

## C. Component specifications
### `ODLBL.CMP-01` — Labels table
- **Purpose / reflects:** tote/label rows for the selected order.
- **Business rules:** label generation, tote assignment and status rules are open.
- **Data shown:** headers `Tote No.`, `Status`, `Zone`, `Personal Shopper`, `Bags`.
- **Structure & placement:** table at x=25px, y=270px, w=1390px, h=237px; 4 rows; cell padding 10px 8px; font 16px/24px.
- **Open state (overlays only):** n/a.
- **Render — per data field:** each header renders in listed order; row values render in table cells.
- **States — all four tiers:** Record: tote/label status. Component: row hover/selected. Context: zone/status. Temporal: n/a.
- **Design requirement:** Label data must stay tabular so users can compare tote status, zone and owner row by row.
- **Source:** tote/label fields · label service / OMS · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** row actions open from row menu.
- **UX/UI:** Library §4.9 — label table recipe..
- **Acceptance:** GIVEN Labels tab is active, THEN the 5-column tote table renders.
- **Prototype symbol(s):** Labels table record.

### `ODLBL.CMP-02` — Label row state
- **Purpose / reflects:** row hover/selection state.
- **Business rules:** selectability and disabled rows are open.
- **Data shown:** row treatment for selected/hovered state.
- **Structure & placement:** inside Labels table.
- **Open state (overlays only):** n/a.
- **Render — per data field:** row state applies across the row.
- **States — all four tiers:** Record: label row. Component: hover and selected measured. Context: n/a. Temporal: n/a.
- **Design requirement:** Row feedback must make the target label clear before Delete or Print is chosen.
- **Source:** row interaction state · client; label fields · label service · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** IF a row action trigger opens THEN `ODLBL.CMP-03` appears for that row.
- **UX/UI:** Library §4.9, §4.11 — row state recipe..
- **Acceptance:** GIVEN a label row is selected, THEN selected-state treatment is visible.
- **Prototype symbol(s):** Labels state-census row records.

### `ODLBL.CMP-03` — Label row actions
- **Purpose / reflects:** row-scoped Delete and Print actions.
- **Business rules:** Delete eligibility, confirmation and audit are open. Print outcome belongs to `08`.
- **Data shown:** `Delete`, `Print`.
- **Structure & placement:** compact popover 84px × 64px at row-aligned x=1323px.
- **Open state (overlays only):** popover measured for three rows and matching click triggers.
- **Render — per data field:** two action rows.
- **States — all four tiers:** Record: selected row. Component: closed/open/focus. Context: Labels tab. Temporal: n/a.
- **Design requirement:** Row actions must stay spatially tied to the selected label row to avoid applying print/delete to the wrong label.
- **Source:** `labelActions`, `labelPrintEligibility`, `labelDeleteEligibility` · label service / permissions · ⚠ Eng to source.
- **Motion — axis 6:** popover motion pending extraction.
- **Interactions:** IF Print is activated THEN launch `08`; IF Delete is activated THEN deletion behavior follows PM rules.
- **UX/UI:** Library §4.8 — row action popover recipe..
- **Acceptance:** GIVEN a row action popover opens, THEN Delete and Print render in the measured compact panel.
- **Prototype symbol(s):** `order-detail-labels/popover#0-2`.

## D. Screen-level conditions, permissions & edge cases
- Delete confirmation, failed label print/delete, empty labels and printer routing are open.
## E. Open questions (for PM/Design/Eng to resolve)
- ⚠ OPEN — PM: What are the label status definitions and allowed actions per status?
- ⚠ OPEN — PM: Does Delete require confirmation and audit?
- ⚠ OPEN — Eng: Which label/document service owns tote labels and print/delete outcomes?
- ⚠ OPEN — Design Systems: extract label table and row-action popover recipes.
## F. Render-parity checklist
| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `ODLBL.CMP-01` | ✅ | ⚠ | ⚠ | ✅ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ⚠ | ✅ |
| `ODLBL.CMP-02` | ⚠ | ⚠ | n/a | ✅ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `ODLBL.CMP-03` | ✅ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
## G. Coverage reconciliation
| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| Labels table | `ODLBL.CMP-01`, `ODLBL.CMP-02` | |
| Print/Delete row popovers | `ODLBL.CMP-03` | Print artifact owned by `08` |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.