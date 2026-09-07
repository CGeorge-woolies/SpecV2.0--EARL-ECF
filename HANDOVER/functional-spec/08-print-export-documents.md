# 08 — Print & Export Documents

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** printed/exported document flows and artifacts launched from Order Summary, Order Details and Labels. Callers keep launch contracts; this document owns the artifact/dialog behavior.

## A. Purpose & context
- **User goal:** produce operational print/export artifacts from selected orders, departments, labels or order detail context.
- **Entry points:** Order Summary quick actions; Order Detail toolbar; Order Details Labels row action.
- **Exit points / next actions:** cancel, close, confirm print selection, invoke browser/system print, return to caller.

## A1. What this screen depends on, and where its data comes from

### Depends on — build these first
- `02` Order Summary for Department Notifications, Packing Slips and Print Order List launch contracts.
- `03a`/`03b` Order Details for Print Invoice, Print Order List and Print Packing Slip launch contracts.
- `03e` Order Details Labels for label row Print launch contract.

### Fixture data — for verification only, never for production
- Measured print/export overlays include Department Notifications, Packing Slips and Labels Print action popovers.
- Source-confirmed launchers include AU-only `Print Invoice for Dispatched Order` and NZ `Print Order List`.
- Any `[DEMO] ... will render here for printing` body copy is mock scaffolding and must not ship.

## B1. Page composition & region map

| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `PRN.RGN-01` | caller launch surface | Caller-owned toolbar or row action location. | `PRN.CMP-01` |
| `PRN.RGN-02` | modal/portal layer | Standard print dialogs use backdrop z-index 3000 and popup z-index 3001; Print Order List uses z-index 3011 and a 90vw/90vh document preview shell. | `PRN.CMP-02` through `PRN.CMP-08` |
| `PRN.RGN-03` | print artifact surface | Document content sent to print/export. | `PRN.CMP-04`, `PRN.CMP-06`, `PRN.CMP-08` |

- **Width model:** standard confirmations use 480px or 560px modal widths with viewport-safe max width; Print Order List uses 90vw/90vh capped at 900px.
- **Region state variance:** artifacts differ by caller, country and eligibility.
- **Prototype symbol(s):** print/export dialogs and measured open-census overlays.

## B2. Component inventory

| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `PRN.CMP-01` | Print/export launch contract | action contract | `PRN.RGN-01` | Caller passes trigger, eligibility, context and selected scope. |
| `PRN.CMP-02` | Department Notifications selector | modal dialog | `PRN.RGN-02` | Department/specialty/print-options selection. |
| `PRN.CMP-03` | Department Notifications artifact placeholder | do-not-build demo dialog | `PRN.RGN-03` | `[DEMO]` copy must be replaced by real artifact behavior. |
| `PRN.CMP-04` | Packing Slips confirmation and artifact | modal + print artifact | `PRN.RGN-02`, `PRN.RGN-03` | NZ/bulk packing-slip flow. |
| `PRN.CMP-05` | Print Invoice dialog | modal / artifact placeholder | `PRN.RGN-02` | AU-only dispatched-order flow. |
| `PRN.CMP-06` | Print Order List preview | document preview / print artifact | `PRN.RGN-02`, `PRN.RGN-03` | NZ order detail print list. |
| `PRN.CMP-07` | Labels print row action | popover launch | `PRN.RGN-01` | Labels tab row action with `Print`. |
| `PRN.CMP-08` | Printed label artifact | print artifact | `PRN.RGN-03` | Artifact definition open. |

## C0. Context-variant matrix

| Context | Values | What changes on this screen |
|---|---|---|
| Caller | Order Summary · Order Detail toolbar · Labels row action | Caller determines selected scope and where the launch control renders. |
| Country | AU · NZ | Print Invoice for Dispatched Order is AU-only in source. Print Order List and Packing Slip actions are NZ-specific in source/prototype notes. |
| Order status | dispatched · non-dispatched | Print Invoice is disabled until status starts with `DIS`; Print Order List is disabled when status starts with `DIS` in source. |
| Selection scope | selected orders · one order · one tote/label row · selected departments | Dialog body and artifact content change by scope. |
| Artifact type | Department Notifications · Packing Slips · Print Invoice · Print Order List · Labels | Each artifact has separate content and eligibility. |

## C. Component specifications

### `PRN.CMP-01` — Print/export launch contract
- **Purpose / reflects:** standardises how callers launch print/export flows.
- **Business rules:** caller must pass trigger label, country, store type, selected scope, eligibility gate, expected artifact and return handling.
- **Data shown:** launcher labels include `Department Notifications`, `Packing Slips`, `Print Invoice for Dispatched Order`, `Print Order List`, `Print Packing Slip`, and Labels row `Print`.
- **Structure & placement:** caller-owned toolbar or row-action placement.
- **Open state (overlays only):** n/a.
- **Render — per data field:** launcher label/icon renders in caller context.
- **States — all four tiers:** Record: selected order/label scope. Component: enabled/disabled/focus. Context: country/status/caller. Temporal: n/a unless print windows expire.
- **Design requirement:** Print/export outcomes must be owned once so printed artifacts do not drift between toolbar, bulk and row-action callers.
- **Source:** `printAction`, `selectedOrders`, `orderStatus`, `country`, `artifactType` · OMS / document service · ⚠ Eng to source.
- **Motion — axis 6:** owned by target dialog/artifact components.
- **Interactions:** IF a caller launches a print/export flow THEN this spec receives trigger, gate, passed-in data, return result and rendering layer.
- **UX/UI:** Library §4.2, §4.7, §4.8 and §4.12 — caller buttons, dialog panels, popovers and launch links.
- **Acceptance:** GIVEN any print/export caller is activated, THEN the caller uses this contract rather than duplicating artifact behavior.
- **Prototype symbol(s):** `QuickActions.tsx`, `OrderDetailToolbar.tsx`, Labels open-census popovers.

### `PRN.CMP-02` — Department Notifications selector
- **Purpose / reflects:** configures department notification print output.
- **Business rules:** department list, specialty eligibility, default selections and print option definitions are open.
- **Data shown:** `Department Notifications`, `Departments`, `Print Options`, `Reprint`, department names, `Cancel`, `Confirm`.
- **Structure & placement:** modal popup measured 560px × 648px at x=440px, y=176px; padding 32px; radius 14px; z-index 3001; max-height 85vh in source.
- **Open state (overlays only):** measured with 29 literals and 44 interactive elements.
- **Render — per data field:** department and print-option values render as checkbox sections.
- **States — all four tiers:** Record: selected orders and selected departments/options. Component: open/closed/checkbox states. Context: Order Summary caller. Temporal: n/a.
- **Design requirement:** Department notification printing must expose the selected departments and print options before output is generated.
- **Source:** `selectedOrders`, `departments`, `printOptions` · OMS / department configuration / document service · ⚠ Eng to source.
- **Motion — axis 6:** measured modal motion none for manual dialog.
- **Interactions:** IF Confirm is activated THEN selected department notification output is prepared.
- **UX/UI:** Library §4.4, §4.5, §4.7 — modal checkbox-section recipe..
- **Acceptance:** GIVEN Department Notifications opens, THEN department and print-option controls render before confirmation.
- **Prototype symbol(s):** `order-summary/manual:department-notifications`, `DepartmentNotificationsDialog.tsx`.

### `PRN.CMP-03` — Department Notifications artifact placeholder
- **Purpose / reflects:** prototype-only print output placeholder.
- **Business rules:** Do not build `[DEMO] Department notifications will render here for printing.` Production artifact content, layout and print pagination are open.
- **Data shown:** demo placeholder copy only.
- **Structure & placement:** secondary modal after confirmation in source; standard 480px modal shell.
- **Open state (overlays only):** source-confirmed; full rendered measurement not present in open projection.
- **Render — per data field:** no production fields are defined by the placeholder.
- **States — all four tiers:** Record: selected departments/options. Component: demo open/close. Context: Order Summary. Temporal: n/a.
- **Design requirement:** The real artifact must replace demo copy with printable department notification content.
- **Source:** department notification document fields · document service / OMS · ⚠ Eng to source.
- **Motion — axis 6:** none in source classes unless measured otherwise.
- **Interactions:** IF output is generated THEN real document preview/print behavior replaces demo close-only dialog.
- **UX/UI:** Library §4.7 — modal shell and actions; printed artifact layout remains a Design open item in §E.
- **Acceptance:** GIVEN production Department Notifications output is generated, THEN no `[DEMO]` placeholder text is rendered.
- **Prototype symbol(s):** `DepartmentNotificationsDialog.tsx`.

### `PRN.CMP-04` — Packing Slips confirmation and artifact
- **Purpose / reflects:** prints packing slips for selected NZ orders requiring them.
- **Business rules:** packing-slip requirement source, handling of mixed eligible/ineligible selections and artifact contents are open.
- **Data shown:** `Print Packing Slips`, `Packing Slips`, `Print`, `Cancel`, counts of selected/required/not-required orders, warning that orders without packing slips will not be printed.
- **Structure & placement:** measured confirmation modal 480px × 270px at x=480px, y=365px; padding 32px; radius 14px; z-index 3001.
- **Open state (overlays only):** measured with 13 literals and 2 interactive elements.
- **Render — per data field:** count values render in body/warning text; print action label pluralises by required count.
- **States — all four tiers:** Record: totalCount, requiredCount, notRequiredCount. Component: confirmation open; artifact/demo open. Context: NZ. Temporal: n/a.
- **Design requirement:** The flow must distinguish selected orders from printable packing slips so users do not expect ineligible orders to print.
- **Source:** `packingSlipRequired`, `selectedOrders`, `packingSlipDocument` · OMS / document service · ⚠ Eng to source.
- **Motion — axis 6:** measured modal motion none.
- **Interactions:** IF Print is activated THEN print only required packing slips and show/produce the artifact.
- **UX/UI:** Library §4.7 — packing-slip confirmation and warning recipe..
- **Acceptance:** GIVEN a mixed selection, THEN the warning names how many selected orders do not require packing slips.
- **Prototype symbol(s):** `order-summary-nz/manual:packing-slips`, `PackingSlipsDialog.tsx`.

### `PRN.CMP-05` — Print Invoice dialog
- **Purpose / reflects:** AU-only dispatched-order invoice print flow.
- **Business rules:** invoice eligibility, invoice content, legal/tax requirements and output system are open. The prototype `[DEMO]` copy is do-not-build.
- **Data shown:** launcher `Print Invoice for Dispatched Order`; dialog title `Print Invoice`; placeholder `[DEMO] Invoice for dispatched order will render here for printing.`
- **Structure & placement:** source modal uses 480px width, max-width calc(100vw - 48px), 32px padding, radius 14px, backdrop z-index 3000 and popup z-index 3001.
- **Open state (overlays only):** source-confirmed; not surfaced in measured open projection.
- **Render — per data field:** production invoice fields are open; placeholder renders no production fields.
- **States — all four tiers:** Record: order status must start with `DIS` in source. Component: disabled until eligible; open/close. Context: AU-only. Temporal: n/a.
- **Design requirement:** Invoice printing must be restricted to eligible dispatched AU orders and must produce a real invoice artifact, not demo placeholder copy.
- **Source:** invoice fields · billing/document service and OMS · ⚠ Eng to source.
- **Motion — axis 6:** modal motion requires rendered measurement before rebuild-ready sign-off.
- **Interactions:** IF eligible AU dispatched order launches Print Invoice THEN open invoice print flow; IF Close is activated THEN close without printing.
- **UX/UI:** Library §4.7 — modal shell and actions; invoice artifact layout remains a Design open item in §E.
- **Acceptance:** GIVEN production Print Invoice opens, THEN no `[DEMO]` placeholder copy renders.
- **Prototype symbol(s):** `OrderDetailToolbar.tsx`, `PrintInvoiceDialog.tsx`.

### `PRN.CMP-06` — Print Order List preview
- **Purpose / reflects:** NZ order detail picking/order list print artifact.
- **Business rules:** exact artifact naming, country eligibility, disabled-state rule for dispatched orders and printed fields are open.
- **Data shown:** launcher `Print Order List`; preview title `Picking List`; actions `Print`, `Close`.
- **Structure & placement:** document preview modal with backdrop z-index 3010 and popup z-index 3011; w=90vw, h=90vh, max-width 900px; scrollable document body; print mode removes modal chrome.
- **Open state (overlays only):** source-confirmed; rendered measurement not present in open projection.
- **Render — per data field:** printed document uses order, info, instructions and articles passed into `PickingListDocument`.
- **States — all four tiers:** Record: order/info/instructions/articles. Component: preview open/closed, print. Context: NZ. Temporal: n/a.
- **Design requirement:** The print preview must show the artifact in a print-oriented surface while keeping screen-only controls out of the printed output.
- **Source:** `order`, `info`, `instructions`, `articles` · OMS / picking document service · ⚠ Eng to source.
- **Motion — axis 6:** modal motion requires rendered measurement before rebuild-ready sign-off.
- **Interactions:** IF Print is activated THEN invoke print for the document body. IF Close is activated THEN return to caller without printing.
- **UX/UI:** Library §4.7 — modal shell and preview chrome; final print document layout remains a Design open item in §E.
- **Acceptance:** GIVEN Print Order List preview is printed, THEN screen-only header controls are not included in the printed artifact.
- **Prototype symbol(s):** `PrintOrderListDialog.tsx`.

### `PRN.CMP-07` — Labels print row action
- **Purpose / reflects:** launches printing for an individual tote/label row from the Labels tab.
- **Business rules:** label eligibility, print count, printer selection and reprint audit are open.
- **Data shown:** row action popover literals `Delete`, `Print`.
- **Structure & placement:** Labels tab row popover measured at x=1323px, w=84px, h=64px; y varies by row (349px, 399px, 449px).
- **Open state (overlays only):** popover/click-trigger measured with 2 literals and 2 interactive elements.
- **Render — per data field:** `Print` renders as row action in the popover.
- **States — all four tiers:** Record: label/tote row. Component: popover open/closed. Context: Labels tab. Temporal: n/a.
- **Design requirement:** Row-level label printing must stay attached to the selected label row so users do not print the wrong tote label.
- **Source:** `toteLabel`, `labelPrintEligibility` · label/document service · ⚠ Eng to source.
- **Motion — axis 6:** popover enter/exit travels for 100ms with easing ease per Library §0.7 and §4.8.
- **Interactions:** IF Print is activated THEN launch `PRN.CMP-08` for that label row.
- **UX/UI:** Library §4.8 — compact row-action popover recipe..
- **Acceptance:** GIVEN a Labels row action menu is open, THEN Print is available as a row-scoped action.
- **Prototype symbol(s):** `order-detail-labels/popover#0-2`.

### `PRN.CMP-08` — Printed label artifact
- **Purpose / reflects:** printed label/tote artifact.
- **Business rules:** label contents, barcode requirements, printer routing and reprint rules are open.
- **Data shown:** production artifact fields are not defined by the measured prototype.
- **Structure & placement:** print artifact; screen preview not measured.
- **Open state (overlays only):** launched from row action; artifact rendering open.
- **Render — per data field:** open; must be specified before build.
- **States — all four tiers:** Record: selected label/tote. Component: print pending/success/failure open. Context: Labels tab/country/store. Temporal: n/a.
- **Design requirement:** Printed labels must encode the row's tote/order identity unambiguously because the artifact leaves the screen and drives physical fulfilment work.
- **Source:** label fields · label/document service and OMS · ⚠ Eng to source.
- **Motion — axis 6:** n/a for printed artifact; any preview motion open.
- **Interactions:** IF label print succeeds THEN return success to Labels caller; failure behavior open.
- **UX/UI:** Library §4.8 — label row-action popover; printed label artifact layout remains a Design open item in §E.
- **Acceptance:** GIVEN a label row is printed, THEN the artifact uses that row's identity and no other row's values.
- **Prototype symbol(s):** Labels row action open census.

## D. Screen-level conditions, permissions & edge cases
- Print/export output placeholders containing `[DEMO]` are mock scaffolding and must not ship.
- Artifact pagination, headers/footers, printer selection, browser print behavior, reprint/audit and failure states are open.
- Print Invoice and Print Order List use the measured modal shell in Library §4.7 where rendered; artifact layout remains a Design open item in §E.

## E. Open questions (for PM/Design/Eng to resolve)

- ⚠ OPEN — PM: What exact fields and pagination are required for Department Notifications, Packing Slips, Print Invoice, Print Order List and Labels?
- ⚠ OPEN — PM: What role/status/country eligibility gates apply to each print/export action?
- ⚠ OPEN — Eng: Which document/printing service owns each artifact and print result?
- ⚠ OPEN — Design: Provide final print layouts for invoice, order list, packing slips, department notifications and labels.
- ⚠ OPEN — Design Systems: extract modal, print preview, checkbox-section and row-action popover recipes.

## F. Render-parity checklist

| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `PRN.CMP-01` | caller-owned | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | caller-owned | caller-owned | n/a | ✅ | ⚠ |
| `PRN.CMP-02` | ✅ | n/a | ⚠ | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PRN.CMP-03` | ⚠ | n/a | ⚠ | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ⚠ | ✅ | ⚠ |
| `PRN.CMP-04` | ✅ | n/a | ⚠ | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PRN.CMP-05` | ⚠ | n/a | ⚠ | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ⚠ | ✅ | ⚠ |
| `PRN.CMP-06` | ⚠ | n/a | ⚠ | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ⚠ | ✅ | ⚠ |
| `PRN.CMP-07` | ✅ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PRN.CMP-08` | ⚠ | n/a | ⚠ | ⚠ | ⚠ | ⚠ | ✅ | ⚠ | ⚠ | ⚠ | print | ⚠ | ⚠ | ⚠ |

## G. Coverage reconciliation

| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| Order Summary Department Notifications | `PRN.CMP-02`, `PRN.CMP-03` | caller placement owned by `02` |
| Order Summary Packing Slips | `PRN.CMP-04` | caller placement owned by `02` |
| Order Detail Print Invoice | `PRN.CMP-05` | source-confirmed; rendered open measurement needed |
| Order Detail Print Order List | `PRN.CMP-06` | source-confirmed; rendered open measurement needed |
| Labels tab Print row action | `PRN.CMP-07`, `PRN.CMP-08` | caller row placement owned by `03e` |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.