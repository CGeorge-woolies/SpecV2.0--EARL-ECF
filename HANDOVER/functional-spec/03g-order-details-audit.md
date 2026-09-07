# 03g — Order Details: Audit Tab

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** Audit tab table and audit adjustment content. Shared shell is owned by `03a`.

## A. Purpose & context
- **User goal:** review order audit history and audit adjustments.
- **Entry points:** `03a` with Audit tab active.
- **Exit points / next actions:** switch tabs or navigate globally.

## A1. What this screen depends on, and where its data comes from
### Depends on — build these first
- `03a` Order Details Shell.
### Fixture data — for verification only, never for production
- Measured key: `order-detail-audit`; 13-row table at x=25px, y=225px, w=1390px, h=626px, row height 45px.

## B1. Page composition & region map
| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `ODAUD.RGN-01` | Audit tab mount | Inside `03a`; cap h=808px at 1440px. | `ODAUD.CMP-01`, `ODAUD.CMP-02`, `ODAUD.CMP-03` |
- **Width model:** table spans 1390px inside inherited cap.
- **Region state variance:** row hover measured; no custom overlays beyond shared demo popover in `03a`.
- **Prototype symbol(s):** `order-detail-audit`.

## B2. Component inventory
| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `ODAUD.CMP-01` | Order Audit heading/content | heading/section | `ODAUD.RGN-01` | Renders `Order Audit` and completion copy. |
| `ODAUD.CMP-02` | Audit table | table | `ODAUD.RGN-01` | Headers `Action Date`, `User`, `Action`, `Line No.`, `Message`. |
| `ODAUD.CMP-03` | Audit row state | row behavior | `ODAUD.CMP-02` | Hover measured. |

## C0. Context-variant matrix
| Context | Values | What changes on this screen |
|---|---|---|
| Audit type | order audit · order audit adjustments | Measured literals include both headings. |
| User/system actor | user · system | Actor source and display rules open. |
| Date / time | action date/time | Timezone and format rules open. |

## C. Component specifications
### `ODAUD.CMP-01` — Order Audit heading/content
- **Purpose / reflects:** identifies audit history sections.
- **Business rules:** audit retention and adjustment definitions are open.
- **Data shown:** `Order Audit`, `Order Audit Adjustments`, `Order audit complete`.
- **Structure & placement:** heading/section content above or around the audit table.
- **Open state (overlays only):** n/a.
- **Render — per data field:** section labels render as text.
- **States — all four tiers:** Record: audit availability. Component: static. Context: none measured. Temporal: audit updates open.
- **Design requirement:** Audit sections must be named so operational users can distinguish history from editable order content.
- **Source:** audit section state · OMS/audit log · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none measured.
- **UX/UI:** Library §4.4 — audit section recipe..
- **Acceptance:** GIVEN Audit tab is active, THEN audit section labels render.
- **Prototype symbol(s):** Audit literals.

### `ODAUD.CMP-02` — Audit table
- **Purpose / reflects:** chronological audit events for the order.
- **Business rules:** sort order, retention, actor naming and adjustment inclusion are open.
- **Data shown:** headers `Action Date`, `User`, `Action`, `Line No.`, `Message`.
- **Structure & placement:** table x=25px, y=225px, w=1390px, h=626px; 13 rows; padding 12px 8px; font 14px/20px.
- **Open state (overlays only):** n/a.
- **Render — per data field:** date, user, action, line number and message render in table columns.
- **States — all four tiers:** Record: audit event. Component: row hover. Context: order. Temporal: audit append/update behavior open.
- **Design requirement:** Audit history must be tabular with timestamp, actor, action and message separated so events can be reviewed accurately.
- **Source:** audit event fields · OMS/audit log · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** row hover only measured.
- **UX/UI:** Library §4.9 — audit table recipe..
- **Acceptance:** GIVEN Audit tab is active, THEN the 5-column audit table renders.
- **Prototype symbol(s):** Audit table record.

### `ODAUD.CMP-03` — Audit row state
- **Purpose / reflects:** row hover feedback.
- **Business rules:** row activation or expansion is open.
- **Data shown:** row content from `ODAUD.CMP-02`.
- **Structure & placement:** inside audit table.
- **Open state (overlays only):** n/a.
- **Render — per data field:** hover treatment pending extraction.
- **States — all four tiers:** Record: audit row. Component: hover measured. Context: n/a. Temporal: n/a.
- **Design requirement:** Hover feedback must help users track across dense audit rows.
- **Source:** client interaction state; audit fields · OMS/audit log · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** hover only measured.
- **UX/UI:** Library §4.9, §4.11 — row hover recipe..
- **Acceptance:** GIVEN an audit row is hovered, THEN measured hover treatment appears.
- **Prototype symbol(s):** Audit state-census row records.

## D. Screen-level conditions, permissions & edge cases
- Empty audit, long messages, redactions and failed audit loads are open.
## E. Open questions (for PM/Design/Eng to resolve)
- ⚠ OPEN — PM: What audit events and adjustments must be shown?
- ⚠ OPEN — PM: What sort order and timezone apply to Action Date?
- ⚠ OPEN — Eng: Which audit log owns these rows?
- ⚠ OPEN — Design Systems: extract audit table and row-hover recipes.
## F. Render-parity checklist
| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `ODAUD.CMP-01` | ⚠ | n/a | ⚠ | n/a | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `ODAUD.CMP-02` | ✅ | ⚠ | ⚠ | ✅ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ✅ |
| `ODAUD.CMP-03` | ⚠ | ⚠ | n/a | ✅ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
## G. Coverage reconciliation
| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| Audit section/headings | `ODAUD.CMP-01` | |
| Audit table and rows | `ODAUD.CMP-02`, `ODAUD.CMP-03` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.