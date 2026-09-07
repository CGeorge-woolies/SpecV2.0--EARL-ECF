# 03c — Order Details: Details Tab

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** Details tab field panels and NZ Customer Support Edit Details affordance. Shared order shell is owned by `03a`.

## A. Purpose & context
- **User goal:** inspect customer, delivery, fulfilment, payment and fraud details for one order.
- **Entry points:** `03a` with Details tab active.
- **Exit points / next actions:** edit details where permitted; change/view picking status through `03a`; leave via tabs/global navigation.

## A1. What this screen depends on, and where its data comes from
### Depends on — build these first
- `03a` Order Details Shell; `01` Global App Shell.
### Fixture data — for verification only, never for production
- Measured keys: `order-detail-details`, `order-detail-nz-customer-support`. At 1440px no table renders; cap heights are 743px and 784px respectively.

## B1. Page composition & region map
| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `ODDET.RGN-01` | Details tab mount | Inside `03a`; cap x=24px, y=68px, w=1392px. | `ODDET.RGN-02`, `ODDET.RGN-03`, `ODDET.RGN-04` |
| `ODDET.RGN-02` | customer/delivery fields | Field panels, no tables. | `ODDET.CMP-01` |
| `ODDET.RGN-03` | payment/fraud fields | Payment and fraud details. | `ODDET.CMP-02` |
| `ODDET.RGN-04` | edit affordance area | Renders only in NZ Customer Support measured context. | `ODDET.CMP-03` |
- **Width model:** inherits `03a` cap.
- **Region state variance:** NZ Customer Support context increases measured cap height and renders `Edit Details`.
- **Prototype symbol(s):** `order-detail-details`, `order-detail-nz-customer-support`.

## B2. Component inventory
| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `ODDET.CMP-01` | Customer and delivery field panels | field group | `ODDET.RGN-02` | Customer, address, phone and delivery values. |
| `ODDET.CMP-02` | Payment, fulfilment and fraud field panels | field group | `ODDET.RGN-03` | Fraud/payment/transit fields. |
| `ODDET.CMP-03` | Edit Details action | button/action | `ODDET.RGN-04` | NZ Customer Support only in measured context. |

## C0. Context-variant matrix
| Context | Values | What changes on this screen |
|---|---|---|
| Country | AU · NZ | NZ Customer Support variant renders Edit Details. |
| Persona | Store Team · Customer Support | Customer Support can see Edit Details in NZ. |
| Order status | Picking and other status options | Status selector owned by `03a`; Details fields reflect order state. |
| Date / time | order created, delivery date/window/ETA | Formatting and timezone rules are open. |

## C. Component specifications
### `ODDET.CMP-01` — Customer and delivery field panels
- **Purpose / reflects:** customer identity and delivery destination/timing.
- **Business rules:** editable fields, masking/privacy rules and address validation are open.
- **Data shown:** `Customer`, `Name`, `Customer Number`, `Mobile Number`, `Delivery Address 1`, `Delivery Address 2`, `Delivery Address 3`, `Delivery Date`, `Delivery Window`, `Delivery ETA`.
- **Structure & placement:** field panels, no table; inside Details tab content.
- **Open state (overlays only):** n/a.
- **Render — per data field:** label/value pairs.
- **States — all four tiers:** Record: selected order/customer. Component: static/read-only by default. Context: country/persona. Temporal: delivery ETA ageing open.
- **Design requirement:** Delivery and customer fields must be grouped so support users can verify contact and fulfilment context without scanning article rows.
- **Source:** customer/delivery fields · OMS / customer profile / delivery systems · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none unless edit mode is approved.
- **UX/UI:** Library §4.4 — detail field group recipe..
- **Acceptance:** GIVEN Details is active, THEN customer and delivery labels render as field groups.
- **Prototype symbol(s):** Details tab literals.

### `ODDET.CMP-02` — Payment, fulfilment and fraud field panels
- **Purpose / reflects:** operational risk and fulfilment metadata.
- **Business rules:** which fraud/payment values are visible and editable are open.
- **Data shown:** `Payment & Fraud`, `Fraud Status`, `Fraud Status Ref`, `Fraud Checked OK`, `Fulfilment`, `Fulfilment Fee`, `Transit Status`, `Ignore Fraud Status`, `Ignore Transit`.
- **Structure & placement:** field panels below/alongside customer fields.
- **Open state (overlays only):** n/a.
- **Render — per data field:** label/value pairs.
- **States — all four tiers:** Record: fraud/payment statuses. Component: static unless edit approved. Context: role/country. Temporal: fraud/ETA freshness open.
- **Design requirement:** Risk and fulfilment fields must be visible as explicit labels so support users can distinguish customer data from operational status.
- **Source:** fraud/payment/fulfilment fields · OMS / payment / fraud systems · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none measured.
- **UX/UI:** Library §4.4 — detail field group recipe..
- **Acceptance:** GIVEN Details is active, THEN fraud and fulfilment labels render in the details inventory.
- **Prototype symbol(s):** Details tab literals.

### `ODDET.CMP-03` — Edit Details action
- **Purpose / reflects:** persona-gated edit entry point.
- **Business rules:** edit scope, audit, validation and save/cancel behavior are open.
- **Data shown:** `Edit Details`.
- **Structure & placement:** Details tab action visible in NZ Customer Support measured context.
- **Open state (overlays only):** edit outcome not measured.
- **Render — per data field:** action label/button.
- **States — all four tiers:** Record: order edit eligibility. Component: enabled/disabled/focus open. Context: NZ + Customer Support. Temporal: n/a.
- **Design requirement:** Edit entry must appear only when the user's role and market context allow the order details to be changed.
- **Source:** `canEditOrderDetails` · IAM / OMS · ⚠ Eng to source.
- **Motion — axis 6:** target-owned.
- **Interactions:** IF activated THEN launch/edit Details flow according to PM rules.
- **UX/UI:** Library §4.2 — action button/edit recipe..
- **Acceptance:** GIVEN NZ Customer Support context, THEN `Edit Details` renders on the Details tab.
- **Prototype symbol(s):** `order-detail-nz-customer-support`.

## D. Screen-level conditions, permissions & edge cases
- Privacy/masking, failed detail loads and edit conflicts are open.
## E. Open questions (for PM/Design/Eng to resolve)
- ⚠ OPEN — PM: Which fields can Customer Support edit and in which countries?
- ⚠ OPEN — PM: What validation and audit apply to edited details?
- ⚠ OPEN — Eng: Which systems own customer, delivery, payment, fraud and fulfilment fields?
- ⚠ OPEN — Design Systems: extract detail field group and edit action recipes.
## F. Render-parity checklist
| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `ODDET.CMP-01` | ⚠ | n/a | n/a | n/a | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `ODDET.CMP-02` | ⚠ | n/a | n/a | n/a | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `ODDET.CMP-03` | ⚠ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | target-owned | target-owned | ✅ | ⚠ |
## G. Coverage reconciliation
| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| Details tab fields | `ODDET.CMP-01`, `ODDET.CMP-02` | |
| NZ Customer Support edit action | `ODDET.CMP-03` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.