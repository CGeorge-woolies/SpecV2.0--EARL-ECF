# 03d — Order Details: Instructions Tab

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** Instructions tab content. Shared order shell is owned by `03a`.

## A. Purpose & context
- **User goal:** read customer care, delivery and personal shopper instructions for one order.
- **Entry points:** `03a` with Instructions tab active.
- **Exit points / next actions:** switch tabs or navigate globally.

## A1. What this screen depends on, and where its data comes from
### Depends on — build these first
- `03a` Order Details Shell.
### Fixture data — for verification only, never for production
- Measured key: `order-detail-instructions`; no table renders; cap height 473px at 1440px.

## B1. Page composition & region map
| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `ODINS.RGN-01` | Instructions tab mount | Inside `03a`; x=24px, y=68px, w=1392px. | `ODINS.CMP-01`, `ODINS.CMP-02`, `ODINS.CMP-03` |
- **Width model:** inherits `03a`.
- **Region state variance:** none measured beyond inherited shell.
- **Prototype symbol(s):** `order-detail-instructions`.

## B2. Component inventory
| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `ODINS.CMP-01` | Customer Care Instructions | text panel | `ODINS.RGN-01` | Instruction category. |
| `ODINS.CMP-02` | Delivery Instructions | text panel | `ODINS.RGN-01` | Instruction category. |
| `ODINS.CMP-03` | Personal Shopper Instructions | text panel | `ODINS.RGN-01` | Instruction category. |

## C0. Context-variant matrix
| Context | Values | What changes on this screen |
|---|---|---|
| Instruction type | customer care · delivery · personal shopper | Separate panels render for each instruction class. |
| Store/country/persona | shell-selected values | No measured variance. |
| Date / time | n/a | No temporal behavior measured. |

## C. Component specifications
### `ODINS.CMP-01` — Customer Care Instructions
- **Purpose / reflects:** customer-care notes for the order.
- **Business rules:** source, visibility and empty-state copy are open.
- **Data shown:** `Customer Care Instructions`.
- **Structure & placement:** instruction text panel.
- **Open state (overlays only):** n/a.
- **Render — per data field:** label and instruction body.
- **States — all four tiers:** Record: instruction present/empty. Component: static. Context: role/country. Temporal: n/a.
- **Design requirement:** Customer-care notes must be separated from fulfilment instructions so support context is not mistaken for picker direction.
- **Source:** `customerCareInstructions` · OMS/customer care system · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none measured.
- **UX/UI:** Library §4.4 — instruction panel recipe..
- **Acceptance:** GIVEN customer-care notes exist, THEN they render under their own label.
- **Prototype symbol(s):** Instructions tab literals.

### `ODINS.CMP-02` — Delivery Instructions
- **Purpose / reflects:** delivery-specific instructions.
- **Business rules:** source, visibility and stale/update handling are open.
- **Data shown:** `Delivery Instructions`.
- **Structure & placement:** instruction text panel.
- **Open state (overlays only):** n/a.
- **Render — per data field:** label and instruction body.
- **States — all four tiers:** Record: present/empty. Component: static. Context: route type/country. Temporal: n/a.
- **Design requirement:** Delivery instructions must be visibly distinct because they affect handoff rather than pick execution.
- **Source:** `deliveryInstructions` · delivery/OMS · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none.
- **UX/UI:** Library §4.4 — instruction panel recipe..
- **Acceptance:** GIVEN delivery instructions exist, THEN they render under their own label.
- **Prototype symbol(s):** Instructions tab literals.

### `ODINS.CMP-03` — Personal Shopper Instructions
- **Purpose / reflects:** picker-facing instructions.
- **Business rules:** source, visibility and print inclusion are open.
- **Data shown:** `Personal Shopper Instructions`.
- **Structure & placement:** instruction text panel.
- **Open state (overlays only):** n/a.
- **Render — per data field:** label and instruction body.
- **States — all four tiers:** Record: present/empty. Component: static. Context: order/store. Temporal: n/a.
- **Design requirement:** Picker-facing instructions must remain separate from customer-care and delivery instructions to reduce operational ambiguity.
- **Source:** `personalShopperInstructions` · OMS/picking system · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none.
- **UX/UI:** Library §4.4 — instruction panel recipe..
- **Acceptance:** GIVEN picker instructions exist, THEN they render under their own label.
- **Prototype symbol(s):** Instructions tab literals.

## D. Screen-level conditions, permissions & edge cases
- Empty instructions, long text wrapping and privacy/masking are open.
## E. Open questions (for PM/Design/Eng to resolve)
- ⚠ OPEN — PM: What empty-state copy renders for each instruction type?
- ⚠ OPEN — PM: Which roles can view each instruction type?
- ⚠ OPEN — Eng: Which systems own each instruction field?
- ⚠ OPEN — Design Systems: extract instruction panel recipe.
## F. Render-parity checklist
| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `ODINS.CMP-01` | ⚠ | n/a | ⚠ | n/a | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ⚠ | ⚠ |
| `ODINS.CMP-02` | ⚠ | n/a | ⚠ | n/a | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ⚠ | ⚠ |
| `ODINS.CMP-03` | ⚠ | n/a | ⚠ | n/a | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ⚠ | ⚠ |
## G. Coverage reconciliation
| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| instruction panels | `ODINS.CMP-01` through `ODINS.CMP-03` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.