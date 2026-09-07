# 03a — Order Details Shell

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** shared Order Details route chrome, order header, tab strip and toolbar launch contracts. Tab inventories are owned by `03b` through `03g`.

## A. Purpose & context
- **User goal:** inspect and act on one order while moving between stable tab inventories.
- **Entry points:** Order Summary row activation; Search Orders result row activation; Order Line Detail back link.
- **Exit points / next actions:** switch tabs, open line detail, launch print/export, launch Move to Shop Floor, edit details where permitted.

## A1. What this screen depends on, and where its data comes from

### Depends on — build these first
- `01` Global App Shell; `07` Move to Shop Floor; `08` Print & Export Documents.

### Fixture data — for verification only, never for production
- Measured keys: `order-detail-articles`, `order-detail-details`, `order-detail-instructions`, `order-detail-labels`, `order-detail-samples`, `order-detail-audit`, plus NZ Customer Support and eStore variants.
- At 1440px the shell content cap starts at x=24px, y=68px, w=1392px across all tabs.

## B1. Page composition & region map
| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `ODSH.RGN-01` | route mount | Below global header at y=68px. | `ODSH.RGN-02` |
| `ODSH.RGN-02` | content cap | Inherits global cap; height varies by tab from 313px to 1441px in measured states. | `ODSH.RGN-03`, `ODSH.RGN-04` |
| `ODSH.RGN-03` | order header / toolbar | Shared order identity, status, customer, tabs and actions. | `ODSH.CMP-01` through `ODSH.CMP-05` |
| `ODSH.RGN-04` | active tab mount | Contains active tab inventory only. | launch to `03b` through `03g` |

- **Width model:** inherited from `01`; tab content tables measure 1390px wide at 1440px.
- **Region state variance:** active tab changes mounted content; shell remains stable.
- **Prototype symbol(s):** `order-detail-*` measured screens.

## B2. Component inventory
| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `ODSH.CMP-01` | Order identity summary | header fields | `ODSH.RGN-03` | Renders Order, Order No., Customer Name, Status and related identity fields. |
| `ODSH.CMP-02` | Picking status selector | select | `ODSH.RGN-03` | Details tab select opens Awaiting Pick/Dispatched/Packed/Picked/Picking. |
| `ODSH.CMP-03` | Tab strip | tabs | `ODSH.RGN-03` | Articles, Details, Instructions, Labels, Samples, Audit. |
| `ODSH.CMP-04` | Toolbar launch contracts | action group | `ODSH.RGN-03` | Print/export, Move to Shop Floor, Edit Details. |
| `ODSH.CMP-05` | Manual Picking demo flag popover | prototype-only popover | `ODSH.RGN-03` | Renders `BCP for Manual Picking` and `Preview feature flags`; do not build as production control. |

## C0. Context-variant matrix
| Context | Values | What changes on this screen |
|---|---|---|
| Active tab | Articles · Details · Instructions · Labels · Samples · Audit | Tab strip active state and mounted inventory change. |
| Country | AU · NZ | NZ Customer Support variant shows `Edit Details`; print/export contracts differ by country. |
| Store type | Supermarket · eStore | eStore Articles exposes Move to Shop Floor launch contracts. |
| Persona | Store Team · Customer Support | Customer Support persona gates Edit Details in NZ. |
| Order status | Picking · Awaiting Pick · Packed · Picked · Dispatched | Drives status selector and action disabled states. |

## C. Component specifications
### `ODSH.CMP-01` — Order identity summary
- **Purpose / reflects:** stable order context while tabs change.
- **Business rules:** authoritative order identity fields and which statuses are editable are open.
- **Data shown:** `Order`, `Order No.`, `Customer Name`, `Status`, `Picking`.
- **Structure & placement:** route header above tab strip.
- **Open state (overlays only):** n/a.
- **Render — per data field:** labels and values render as header/detail fields.
- **States — all four tiers:** Record: selected order. Component: static. Context: country/persona/store variations. Temporal: status ageing open.
- **Design requirement:** The selected order identity must remain visible across tab changes so users do not lose context while inspecting details.
- **Source:** order identity/status/customer fields · OMS · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none directly.
- **UX/UI:** Library §4.4 — order header recipe..
- **Acceptance:** GIVEN any Order Details tab is active, THEN order identity remains visible.
- **Prototype symbol(s):** `order-detail-*` visible literals.

### `ODSH.CMP-02` — Picking status selector
- **Purpose / reflects:** editable/displayed picking status.
- **Business rules:** who may change status and allowed transitions are open.
- **Data shown:** `Picking`; options `Awaiting Pick`, `Dispatched`, `Packed`, `Picked`, `Picking`.
- **Structure & placement:** header select; open panel measured 116px × 188px.
- **Open state (overlays only):** custom select panel; 5 interactive options.
- **Render — per data field:** selected status in trigger; options in popup.
- **States — all four tiers:** Record: order status. Component: closed/open/focus. Context: role/country. Temporal: n/a.
- **Design requirement:** Status selection must show the current order state and constrain edits to approved transitions.
- **Source:** `orderStatus` · OMS · ⚠ Eng to source.
- **Motion — axis 6:** select motion pending extraction.
- **Interactions:** IF an option is selected THEN status transition follows PM/Eng rules.
- **UX/UI:** Library §4.6 — custom select recipe..
- **Acceptance:** GIVEN status selector opens, THEN five measured status options render.
- **Prototype symbol(s):** `order-detail-details/select#0`.

### `ODSH.CMP-03` — Tab strip
- **Purpose / reflects:** active Order Details inventory.
- **Business rules:** default tab is Articles; deep-link and disabled-tab rules are open.
- **Data shown:** `Articles`, `Details`, `Instructions`, `Labels`, `Samples`, `Audit`.
- **Structure & placement:** centred tab strip in route shell.
- **Open state (overlays only):** n/a.
- **Render — per data field:** six tab labels.
- **States — all four tiers:** Record: n/a. Component: active/inactive/focus. Context: active tab. Temporal: n/a.
- **Design requirement:** Tabs must switch only the tab inventory while preserving order identity and toolbar actions.
- **Source:** `orderDetailTabs` · product navigation configuration · ⚠ Eng to source.
- **Motion — axis 6:** none measured.
- **Interactions:** IF a tab is selected THEN the corresponding `03*` tab document mounts.
- **UX/UI:** Library §4 — tab recipe..
- **Acceptance:** GIVEN a tab is selected, THEN only active tab content changes.
- **Prototype symbol(s):** `order-detail-*` literals.

### `ODSH.CMP-04` — Toolbar launch contracts
- **Purpose / reflects:** shared actions launched from Order Details.
- **Business rules:** caller passes trigger, gate, order, selected lines and rendering layer to the owning spec.
- **Data shown:** source labels include `Print Invoice for Dispatched Order`, `Print Order List`, `Print Packing Slip`, `Move Order from OSR to Shop Floor`, `Move Line from OSR to Shop Floor`, `Edit Details`.
- **Structure & placement:** toolbar within shell; outcome owned by `07`, `08` or the Details tab.
- **Open state (overlays only):** target-owned.
- **Render — per data field:** label/icon controls in toolbar.
- **States — all four tiers:** Record: order status/selection. Component: enabled/disabled/focus. Context: country/store/persona. Temporal: n/a.
- **Design requirement:** Shared toolbar actions must have one outcome owner so cross-tab behavior does not drift.
- **Source:** `availableActions`, `orderStatus`, `selectedLines` · OMS / permissions · ⚠ Eng to source.
- **Motion — axis 6:** target-owned.
- **Interactions:** IF Move is activated THEN launch `07`; IF Print/Export is activated THEN launch `08`; IF Edit Details is activated THEN Details tab owns the edit outcome.
- **UX/UI:** Library §4.2 — toolbar action recipe..
- **Acceptance:** GIVEN a cross-owned action is launched, THEN the caller sends a launch contract rather than duplicating outcome behavior.
- **Prototype symbol(s):** `OrderDetailToolbar.tsx`.

### `ODSH.CMP-05` — Manual Picking demo flag popover
- **Purpose / reflects:** prototype-only feature flag aid.
- **Business rules:** do not build this demo aid as production UI. Manual Picking production behavior is outside this document unless PM adds it to scope.
- **Data shown:** `BCP for Manual Picking`, `Preview feature flags`.
- **Structure & placement:** popover measured 288px × 164px on Order Details tabs.
- **Open state (overlays only):** click-trigger popover.
- **Render — per data field:** demo labels only.
- **States — all four tiers:** Record: feature flag. Component: closed/open. Context: all measured Order Details tabs. Temporal: n/a.
- **Design requirement:** Prototype demo aids must be visibly excluded from production requirements so they are not mistaken for product controls.
- **Source:** n/a — mock scaffolding.
- **Motion — axis 6:** popover motion pending extraction.
- **Interactions:** none for production.
- **UX/UI:** Library §4.8 — demo popover recipe only if retained for prototype parity..
- **Acceptance:** GIVEN production Order Details is built, THEN this prototype-only flag popover is absent unless PM explicitly approves a production equivalent.
- **Prototype symbol(s):** `order-detail-*/click-trigger#0`.

## D. Screen-level conditions, permissions & edge cases
- Shell owns the tab strip and cross-owned launch contracts; tab specs own content.
- Edit Details is NZ Customer Support only in measured/source context; final permission rule is open.

## E. Open questions (for PM/Design/Eng to resolve)
- ⚠ OPEN — PM: Which Order Detail actions are available by country, store type, status and persona?
- ⚠ OPEN — PM: What status transitions are allowed from the Picking selector?
- ⚠ OPEN — Eng: Which system owns order identity, status and action eligibility?
- ⚠ OPEN — Design Systems: extract order header, toolbar, tab and demo popover recipes.

## F. Render-parity checklist
| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `ODSH.CMP-01` | ⚠ | n/a | ⚠ | n/a | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `ODSH.CMP-02` | ✅ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ODSH.CMP-03` | ⚠ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `ODSH.CMP-04` | ⚠ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | target-owned | target-owned | ✅ | ⚠ |
| `ODSH.CMP-05` | ✅ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## G. Coverage reconciliation
| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| `order-detail-*` shell | `ODSH.RGN-01` through `ODSH.RGN-04` | |
| order header/status/tabs/actions | `ODSH.CMP-01` through `ODSH.CMP-05` | |
| active tab content | launch to `03b` through `03g` | owned by tab specs |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.