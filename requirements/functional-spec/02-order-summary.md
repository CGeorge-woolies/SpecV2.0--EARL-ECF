# 02 — Order Summary

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** the Order Summary route as one shared inventory across store type and country contexts. Store type, country and persona differences are captured in §C0; they are not separate documents.

## A. Purpose & context
- **User goal:** review the operational order list, scan order state at scale, filter by date/flags/visibility and launch order-level work from selected rows.
- **Entry points:** global navigation target `#/order-summary`; return from Order Details; context chosen through the global shell prototype gate.
- **Exit points / next actions:** open Order Details from an order row, refresh the list, filter the list, change the operational date, launch Order-Summary-only confirmations, launch Move to Shop Floor, and launch print/export document flows.

## A1. What this screen depends on, and where its data comes from

### Depends on — build these first
- `01` Global App Shell for header, navigation, inherited 68px shell offset and context values.
- `03a` Order Details Shell for order-row navigation target behavior.
- `07` Move to Shop Floor for eStore bulk move outcomes.
- `08` Print & Export Documents for Department Notifications, Packing Slips and Print Order List launch outcomes.

### Fixture data — for verification only, never for production
- Measured screen keys: `order-summary`, `order-summary-nz`, `order-summary-estore`, `order-summary-cfc-au`.
- At 1440px the shared Order Summary table measures 1406px wide with 35px row height and 4px cell padding. Body row counts are 129 for Supermarket AU, 125 for Supermarket NZ, 121 for eStore and 129 for CFC AU.
- Fixture dates and order counts are verification data only. Production row volume, order eligibility and refresh cadence must come from the owning operational systems named in §C.

## B1. Page composition & region map

| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `ORDSUM.RGN-01` | shell-provided route mount | Starts below the global header at y=68px. Measured 1440px main heights vary by context: 4457px AU, 4309px NZ, 4191px eStore, 4481px CFC AU. | `ORDSUM.RGN-02` |
| `ORDSUM.RGN-02` | content cap | Inherits global cap. At 1440px x=24px, w=1392px. | `ORDSUM.RGN-03`, `ORDSUM.RGN-04`, `ORDSUM.RGN-05` |
| `ORDSUM.RGN-03` | route toolbar / summary controls | Top control band above the table. Owns refresh, date/session controls, filters and quick-action launch points. | `ORDSUM.CMP-01` through `ORDSUM.CMP-06` |
| `ORDSUM.RGN-04` | table scroll/list area | Contains the order table. First table measured at x=17px, y=170px for AU/NZ/eStore and y=194px for CFC AU. | `ORDSUM.CMP-07` |
| `ORDSUM.RGN-05` | portal overlay layer | Portal layer for filter/date popovers and modal confirmations. Popovers use z-index 50; modal confirmations use z-index 3001. | `ORDSUM.CMP-03`, `ORDSUM.CMP-04`, `ORDSUM.CMP-09`, `ORDSUM.CMP-10` |

- **Width model:** route content inherits the global 1920px capped width model from `01`.
- **Region state variance:** CFC AU moves the first table y-position from 170px to 194px because the context adds upstream summary content. eStore changes the filter panel height from 181px to 223px.
- **Prototype symbol(s):** `order-summary*` screens in `out/census/v1.json`, `out/open-census/v1.json`, `out/state-census/v1.json`.

## B2. Component inventory

| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `ORDSUM.CMP-01` | Route title | heading | `ORDSUM.RGN-03` | Renders `Order Summary`. |
| `ORDSUM.CMP-02` | Refresh action | button | `ORDSUM.RGN-03` | Renders `Refresh`. |
| `ORDSUM.CMP-03` | Filters/options popover | popover | `ORDSUM.RGN-03` / `ORDSUM.RGN-05` | Shared filter panel; eStore adds Split Supply View. |
| `ORDSUM.CMP-04` | Operational date picker | popover | `ORDSUM.RGN-03` / `ORDSUM.RGN-05` | Measured label `7SEPT 2026Monday`; date value is schematic fixture data. |
| `ORDSUM.CMP-05` | Session/window overview | summary stat/control | `ORDSUM.RGN-03` | Literal changes between Session overview and Window overview by country/context. |
| `ORDSUM.CMP-06` | Quick-action launcher group | button group | `ORDSUM.RGN-03` | Owns Order-Summary-only actions and launch contracts for external action docs. |
| `ORDSUM.CMP-07` | Orders table | table | `ORDSUM.RGN-04` | Shared order list table; context changes selected headers. |
| `ORDSUM.CMP-08` | Row selection and row states | checkbox / row interaction | `ORDSUM.CMP-07` | Hover and selected states measured across all Order Summary contexts. |
| `ORDSUM.CMP-09` | Truck Arrival confirmation | modal dialog | `ORDSUM.RGN-05` | Order-Summary-only bulk quick action. |
| `ORDSUM.CMP-10` | Dispatch Order confirmation | modal dialog | `ORDSUM.RGN-05` | Order-Summary-only bulk quick action. |
| `ORDSUM.CMP-11` | External action/document launch contracts | launch contract set | `ORDSUM.RGN-03` | Move to Shop Floor, Department Notifications, Packing Slips, Print Order List. |

## C0. Context-variant matrix

| Context | Values | What changes on this screen |
|---|---|---|
| Store type | Supermarket · eStore · CFC | Supermarket and CFC use `Status` and `Supplied %` table columns. eStore replaces them with `eCom Supply` and `Shop Floor Supply`, and its filter popover adds `Split Supply View:` and `On`. CFC AU adds the measured 3-way ambient split upstream of the table. |
| Country | AU · NZ | NZ keeps the shared table inventory but uses window terminology where the prototype label calls out windows rather than sessions. NZ exposes Packing Slips and Print Order List as print/export launch contracts. |
| Persona | Store Team · Customer Support · Support Office | No Order Summary persona-specific rendering was measured; persona-specific behavior is owned where it renders, such as Order Details. |
| Date / time | current operational date · alternate selected date | The date picker opens a 212px × 305px calendar popover. The fixture date label is illustrative and must be written schematically in product copy. |
| Feature toggles | show deleted · show dispatched · split supply view | Filter popover exposes Deleted Orders, Dispatched Orders and Hidden controls in all contexts; eStore adds Split Supply View. Eligibility and defaults are open. |

## C. Component specifications

### `ORDSUM.CMP-01` — Route title
- **Purpose / reflects:** identifies the current route.
- **Business rules:** title copy is fixed for this route unless PM later renames the route.
- **Data shown:** `Order Summary`.
- **Structure & placement:** top of `ORDSUM.RGN-03`, before list controls.
- **Open state (overlays only):** n/a.
- **Render — per data field:** route title renders as text, not as a table heading.
- **States — all four tiers:** Record: default only. Component: static. Context: unchanged across measured contexts. Temporal: n/a.
- **Design requirement:** The route title must anchor the page before dense order data so users can confirm they are working in the summary list, not an order detail.
- **Source:** `routeTitle` · product navigation configuration · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none.
- **UX/UI:** Library §4.1 — route-heading recipe..
- **Acceptance:** GIVEN Order Summary is mounted, THEN `Order Summary` renders above the order list.
- **Prototype symbol(s):** `order-summary*` visible literals.

### `ORDSUM.CMP-02` — Refresh action
- **Purpose / reflects:** user-initiated refresh of the Order Summary data.
- **Business rules:** refresh cadence, stale-data threshold, permission to refresh and failure handling are open.
- **Data shown:** `Refresh`.
- **Structure & placement:** toolbar action in `ORDSUM.RGN-03`.
- **Open state (overlays only):** n/a.
- **Render — per data field:** text button/control labelled `Refresh`.
- **States — all four tiers:** Record: default available state measured. Component: focus/hover values require UX library extraction. Context: measured in AU, eStore, CFC AU and Dash; NZ availability must follow PM rule. Temporal: stale-data behavior open.
- **Design requirement:** Refresh must be directly available from the summary route so users can reconcile operational state without leaving the list.
- **Source:** `lastRefreshAt`, `refreshStatus` · order orchestration / OMS · ⚠ Eng to source.
- **Motion — axis 6:** none measured.
- **Interactions:** IF activated THEN the route requests fresh order-summary data and preserves the selected context unless PM rules otherwise.
- **UX/UI:** Library §4.2 — toolbar button recipe..
- **Acceptance:** GIVEN Order Summary is visible, WHEN Refresh is activated, THEN refreshed data is requested for the current context.
- **Prototype symbol(s):** Order Summary visible literals and trigger counts.

### `ORDSUM.CMP-03` — Filters/options popover
- **Purpose / reflects:** list filtering and visibility controls.
- **Business rules:** default values, persistence, and eligibility for deleted/dispatched/hidden orders are open.
- **Data shown:** `Filter by order flags`, `Deleted Orders:`, `Dispatched Orders:`, `Hidden`, `Clear`; eStore also shows `Split Supply View:` and `On`.
- **Structure & placement:** toolbar trigger with portal popover. Panel measured at 288px × 181px in AU/NZ/CFC and 288px × 223px in eStore; padding 10px; radius 10px; z-index 50.
- **Open state (overlays only):** AU open panel at x=16px, y=159px, w=288px, h=181px. NZ y=144px. CFC y=171px. eStore h=223px.
- **Render — per data field:** filter labels render as popover text with interactive controls; exact control recipes require library extraction.
- **States — all four tiers:** Record: default closed. Component: open/closed; clear action; focus-visible. Context: eStore adds split-supply controls. Temporal: n/a unless PM defines persisted or stale filters.
- **Design requirement:** Filters must open near the toolbar without shifting the order table, so users can refine a large list while preserving table context.
- **Source:** `includeDeletedOrders`, `includeDispatchedOrders`, `hiddenFlagFilter`, `splitSupplyView` · order search/list preferences · ⚠ Eng to source.
- **Motion — axis 6:** enter measured with 0.1s animation and 0.1s transition, easing `ease`; exit travels and unmounts after the measured 100ms ease close per Library §0.7 and §4.8.
- **Interactions:** IF Filters/options is opened THEN the popover renders in the portal layer. IF Clear is activated THEN filter reset behavior follows PM-defined defaults.
- **UX/UI:** Library §4.8 — filter-popover recipe..
- **Acceptance:** GIVEN Order Summary is visible, WHEN Filters/options is opened, THEN the measured filter controls appear in a portal popover without moving the table.
- **Prototype symbol(s):** `order-summary*/popover#0`, `order-summary*/click-trigger#0`.

### `ORDSUM.CMP-04` — Operational date picker
- **Purpose / reflects:** selected operational date for the order list.
- **Business rules:** allowable date range, default date, timezone and whether future/past dates are permitted are open.
- **Data shown:** measured fixture trigger `7SEPT 2026Monday`; calendar popover literals include days 1 through 31, weekday abbreviations and `September 2026`.
- **Structure & placement:** toolbar date trigger with portal calendar panel. Panel measured at 212px × 305px, radius 10px, z-index 50.
- **Open state (overlays only):** AU/eStore/NZ panel x=614px, y=141px; CFC y=153px. Padding 0px; shadow matches popover elevation.
- **Render — per data field:** trigger renders selected date; panel renders month/day grid and today affordance where present.
- **States — all four tiers:** Record: selected date. Component: closed/open and selected day. Context: CFC vertical placement shifts with upstream summary content. Temporal: date rollover and timezone behavior open.
- **Design requirement:** Date selection must be accessible without leaving the list so users can compare operational workload by day while staying in the same route.
- **Source:** `selectedOperationalDate` · order orchestration / calendar configuration · ⚠ Eng to source.
- **Motion — axis 6:** enter measured with 0.1s animation and 0.1s transition, easing `ease`; exit travels and unmounts after the measured 100ms ease close per Library §0.7 and §4.8.
- **Interactions:** IF a date is selected THEN the Order Summary list reloads or re-filters for that date according to PM rules.
- **UX/UI:** Library §4.8 — date-picker popover recipe..
- **Acceptance:** GIVEN the date picker is opened, THEN a 212px × 305px calendar panel renders in the portal layer.
- **Prototype symbol(s):** `order-summary*/popover#2`, `order-summary*/click-trigger#2`.

### `ORDSUM.CMP-05` — Session/window overview
- **Purpose / reflects:** high-level workload grouping above the table.
- **Business rules:** definitions of session, window and CFC ambient split are open.
- **Data shown:** measured literals include `Session overview` and `Window overview`.
- **Structure & placement:** toolbar/summary area above the table; contributes to table y-position, especially CFC AU.
- **Open state (overlays only):** n/a.
- **Render — per data field:** summary values render above the table; exact subcomponent recipes require focused extraction.
- **States — all four tiers:** Record: default fixture counts. Component: disclosure state measured twice across Order Summary contexts. Context: NZ uses window wording; CFC AU adds ambient split; eStore keeps split supply context. Temporal: time-window rollover behavior open.
- **Design requirement:** The overview must summarise the list context before users scan individual orders, so row-level decisions are understood against current operational workload.
- **Source:** `sessionOverview`, `windowOverview`, `ambientSplit` · order orchestration / fulfilment planning · ⚠ Eng to source.
- **Motion — axis 6:** disclosure rowDelta 0 and mainHeightDelta 0, with declared transition all 150ms where present, per Library §4.11.i.
- **Interactions:** IF a disclosure opens or collapses THEN the summary region changes height and the table remains below it.
- **UX/UI:** Library §4.11 — summary/disclosure recipe..
- **Acceptance:** GIVEN a context with upstream overview content, THEN the order table starts below that content and does not overlap it.
- **Prototype symbol(s):** Order Summary state-census disclosure arrays.

### `ORDSUM.CMP-06` — Quick-action launcher group
- **Purpose / reflects:** action entry points available from selected order rows.
- **Business rules:** action availability, selected-row requirements, single vs bulk eligibility and undo rules are open unless owned by a downstream action spec.
- **Data shown:** action labels are represented by measured dialogs and launch contracts rather than all toolbar button labels in the projection.
- **Structure & placement:** toolbar button group above the table.
- **Open state (overlays only):** launcher buttons do not own their own panels except where specified by `ORDSUM.CMP-09` and `ORDSUM.CMP-10`.
- **Render — per data field:** each launcher renders as a toolbar action; disabled state requires PM/Design confirmation.
- **States — all four tiers:** Record: depends on selected row set. Component: default/focus/disabled open. Context: eStore adds Move to Shop Floor launch contract; NZ adds print document launch contracts. Temporal: n/a unless action windows expire.
- **Design requirement:** Bulk actions must stay near the list controls so users can act on selected orders without losing the selected-row context.
- **Source:** `selectedOrders`, `availableActions` · order orchestration / permissions · ⚠ Eng to source.
- **Motion — axis 6:** none for launcher group.
- **Interactions:** IF Truck Arrival is launched THEN `ORDSUM.CMP-09` opens. IF Dispatch Order is launched THEN `ORDSUM.CMP-10` opens. IF Move to Shop Floor is launched THEN pass control to `07`. IF a print/export action is launched THEN pass control to `08`.
- **UX/UI:** Library §4.2, §4.12 — toolbar action-group recipe..
- **Acceptance:** GIVEN one or more eligible rows are selected, WHEN an available quick action is activated, THEN the owning dialog or external launch contract receives the selected order set.
- **Prototype symbol(s):** base click-trigger counts and manual overlay records.

### `ORDSUM.CMP-07` — Orders table
- **Purpose / reflects:** order list for the selected operational context.
- **Business rules:** ordering, grouping, row eligibility, status definitions and supply percentage derivation are open.
- **Data shown:** standard headers: `P`, `B`, `S`, `A`, `F`, `Order No`, `Routing`, `Customer`, `Status`, `Supplied %`, `Totes Picked`, `Lines`, `Articles`. eStore replaces `Status` and `Supplied %` with `eCom Supply` and `Shop Floor Supply`.
- **Structure & placement:** table in `ORDSUM.RGN-04`. At 1440px measured box is 1406px wide; row height is 35px; cell padding is 4px; font size 16px and line height 24px.
- **Open state (overlays only):** n/a; cell tooltips are shared tooltip recipe unless a row-specific overlay is later extracted.
- **Render — per data field:** each header renders in order exactly as listed in this block. Order identifiers render as strings even when numeric.
- **States — all four tiers:** Record: row flags P/B/S/A/F and status/supply fields. Component: row hover and selected states measured; table scroll has three measured scroll states. Context: eStore header substitution; NZ row volume 125; CFC row position shift. Temporal: time-window and stale-data behavior open.
- **Design requirement:** The order table must preserve a single shared column inventory across contexts except where §C0 explicitly substitutes columns, so users can scan the same operational structure without variant drift.
- **Source:** `orderFlags`, `orderNumber`, `routing`, `customer`, `orderStatus`, `suppliedPercent`, `totesPicked`, `lineCount`, `articleCount`, `ecomSupply`, `shopFloorSupply` · OMS / fulfilment systems · ⚠ Eng to source.
- **Motion — axis 6:** none for table rows; scroll/sticky behavior is measured in Library §4.11.c and §4.11.d.
- **Interactions:** IF a row is activated THEN Order Details opens for that order. IF a row selection checkbox changes THEN selected-order state updates for quick actions.
- **UX/UI:** Library §4.9, §4.11 — dense operational table, header, cell, row hover and selected recipe..
- **Acceptance:** GIVEN eStore context, THEN the shared table renders `eCom Supply` and `Shop Floor Supply` in place of `Status` and `Supplied %`. GIVEN non-eStore contexts, THEN the standard headers render in the order listed above.
- **Prototype symbol(s):** Order Summary table records in resting census.

### `ORDSUM.CMP-08` — Row selection and row states
- **Purpose / reflects:** selected order set for bulk actions.
- **Business rules:** maximum selected rows, partial eligibility, select-all scope and disabled-selection rules are open.
- **Data shown:** checkbox state and row selected state.
- **Structure & placement:** checkbox/selection affordance inside the table row structure.
- **Open state (overlays only):** n/a.
- **Render — per data field:** selected state renders on row and checkbox; Order Summary selected-row visual treatment is none — measured, per Library §4.11.e.
- **States — all four tiers:** Record: selectable/selected. Component: hover and selected variants measured across all contexts. Context: action eligibility varies by country/store type. Temporal: n/a.
- **Design requirement:** Selection state must be visible at row level and stable while users move to toolbar actions, so bulk actions cannot apply to an ambiguous set.
- **Source:** `selectedOrders` · client interaction state; eligibility from OMS / permissions · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** IF a row checkbox is toggled THEN the selected order set changes and toolbar action availability re-evaluates.
- **UX/UI:** Library §4.9 — row-selection recipe..
- **Acceptance:** GIVEN a row is selected, THEN the selected state is visible both at the row selection control and the row treatment.
- **Prototype symbol(s):** Order Summary state-census row records.

### `ORDSUM.CMP-09` — Truck Arrival confirmation
- **Purpose / reflects:** confirms a bulk Truck Arrival action from Order Summary.
- **Business rules:** eligible sessions/orders, whether arrival can be edited, and downstream effects are open.
- **Data shown:** `Truck Arrival`, `Date:`, `Session:`, `1997 AM`, `1997 PM`, `Cancel`, `Confirm`.
- **Structure & placement:** modal dialog in portal layer; measured at x=480px, y=344px, w=480px, h=312px; padding 32px; radius 14px; z-index 3001.
- **Open state (overlays only):** opens as a modal confirmation; no table content; 7 interactive elements measured.
- **Render — per data field:** date and session render as labelled values; actions render as Cancel and Confirm buttons.
- **States — all four tiers:** Record: selected session/order set. Component: closed/open; confirm/cancel. Context: measured in AU Order Summary. Temporal: arrival time/session cutoff open.
- **Design requirement:** Truck Arrival requires a confirmation dialog so users can verify the date and session before changing operational state.
- **Source:** `selectedOrders`, `arrivalDate`, `sessionId` · order orchestration / transport operations · ⚠ Eng to source.
- **Motion — axis 6:** none; measured transition duration 0s and animation duration 0s.
- **Interactions:** IF Cancel is activated THEN close without applying the action. IF Confirm is activated THEN apply Truck Arrival to the selected scope according to PM rules.
- **UX/UI:** Library §4.7 — modal confirmation recipe..
- **Acceptance:** GIVEN Truck Arrival is launched from Order Summary, THEN the modal shows date, session and Cancel/Confirm controls before any state change is committed.
- **Prototype symbol(s):** `order-summary/manual:truck-arrival`.

### `ORDSUM.CMP-10` — Dispatch Order confirmation
- **Purpose / reflects:** confirms dispatching selected order(s) from Order Summary.
- **Business rules:** dispatch eligibility, partial failures, audit trail and reversibility are open.
- **Data shown:** `Order`, `order`, `selected`, `will be dispatched.`, `Cancel`, `Dispatch`.
- **Structure & placement:** modal dialog in portal layer; measured at x=480px, y=404px, w=480px, h=192px; padding 32px; radius 14px; z-index 3001.
- **Open state (overlays only):** opens as a modal confirmation; 2 interactive elements measured.
- **Render — per data field:** selected order count renders in the confirmation sentence; actions render as Cancel and Dispatch.
- **States — all four tiers:** Record: selected order count and eligibility. Component: closed/open. Context: measured in AU Order Summary. Temporal: dispatch cutoff/open window rules are open.
- **Design requirement:** Dispatch requires explicit confirmation because it changes fulfilment state and should not happen from accidental row or toolbar activation.
- **Source:** `selectedOrders`, `dispatchEligibility`, `dispatchOutcome` · OMS / fulfilment operations · ⚠ Eng to source.
- **Motion — axis 6:** none; measured transition duration 0s and animation duration 0s.
- **Interactions:** IF Cancel is activated THEN close without dispatch. IF Dispatch is activated THEN dispatch selected eligible orders according to PM rules.
- **UX/UI:** Library §4.7 — modal confirmation recipe..
- **Acceptance:** GIVEN eligible rows are selected, WHEN Dispatch Order is launched, THEN a confirmation modal renders before dispatch is applied.
- **Prototype symbol(s):** `order-summary/manual:dispatch-order`.

### `ORDSUM.CMP-11` — External action/document launch contracts
- **Purpose / reflects:** launches actions whose outcomes are owned outside this route spec.
- **Business rules:** this spec does not define the outcome of these actions; it defines only caller obligations.
- **Data shown:** measured launches include Move Orders to Shop Floor, Department Notifications and Packing Slips; Print Order List is an NZ launch contract identified by product correction.
- **Structure & placement:** launched from the Order Summary toolbar/action area with selected-order context where applicable.
- **Open state (overlays only):** owned by target specs.
- **Render — per data field:** launcher labels render as toolbar actions; exact labels require focused measurement before rebuild-ready sign-off.
- **States — all four tiers:** Record: selected orders and context eligibility. Component: enabled/disabled/open handled by target. Context: eStore enables Move to Shop Floor; NZ enables Packing Slips and Print Order List; Department Notifications available from Order Summary print/export flow. Temporal: eligibility windows open.
- **Design requirement:** Cross-screen actions must be launched with an explicit selected-order scope and a single owning outcome spec so behavior cannot drift between callers.
- **Source:** `selectedOrders`, `availableActions`, `country`, `storeType` · OMS / fulfilment permissions · ⚠ Eng to source.
- **Motion — axis 6:** owned by target specs.
- **Interactions:** IF Move to Shop Floor is activated THEN call `07` with trigger, gate, selected order set, context and rendering layer. IF Department Notifications, Packing Slips or Print Order List is activated THEN call `08` with trigger, gate, selected order set, country/store context and expected artifact type.
- **UX/UI:** Library §4.2 and §4.12 — launch control and link recipes; target dialog/document recipes remain owned by `08` and `09`.
- **Acceptance:** GIVEN a cross-owned action is launched, THEN this route passes trigger, gate, selected orders, context, expected return/outcome and rendering layer to the owning spec rather than duplicating outcome behavior here.
- **Prototype symbol(s):** `order-summary-nz/manual:packing-slips`, `order-summary-estore/manual:move-to-shop-floor-bulk`, Department Notifications measured under `order-summary/manual:department-notifications`.

## D. Screen-level conditions, permissions & edge cases
- Store type and country are contexts, not separate screen inventories. The table must remain one shared component with context-specific column substitutions only where §C0 states them.
- Move to Shop Floor is not owned here because it is triggered from both Order Summary and Order Detail; this spec only provides the bulk launch contract.
- Truck Arrival and Dispatch are Order-Summary-only in the measured prototype and are owned here.
- Department Notifications, Packing Slips and Print Order List are print/export artifacts and are owned by `08`.

## E. Open questions (for PM/Design/Eng to resolve)

- ⚠ OPEN — PM: What are the default filter values for deleted, dispatched, hidden and split-supply controls?
- ⚠ OPEN — PM: What ordering and grouping rules govern the Order Summary rows in each context?
- ⚠ OPEN — PM: What are the eligibility rules and failure outcomes for Truck Arrival and Dispatch?
- ⚠ OPEN — Eng: Which systems own order status, routing, customer, supply, tote, line and article values?
- ⚠ OPEN — Design Systems: extract dense table, toolbar, popover, date picker, modal, row hover/selection and action-group recipes.

## F. Render-parity checklist

| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `ORDSUM.CMP-01` | ⚠ | n/a | ⚠ | n/a | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `ORDSUM.CMP-02` | ⚠ | n/a | n/a | ⚠ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ⚠ | ⚠ |
| `ORDSUM.CMP-03` | ✅ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ORDSUM.CMP-04` | ✅ | n/a | n/a | ⚠ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ORDSUM.CMP-05` | ⚠ | n/a | n/a | ⚠ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `ORDSUM.CMP-06` | ⚠ | n/a | n/a | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `ORDSUM.CMP-07` | ✅ | ⚠ | ⚠ | ✅ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ✅ |
| `ORDSUM.CMP-08` | ⚠ | ⚠ | n/a | ✅ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `ORDSUM.CMP-09` | ✅ | n/a | n/a | ⚠ | ✅ | ✅ | ⚠ | ⚠ | ✅ | ✅ | ✅ | ✅ | ⚠ | ✅ |
| `ORDSUM.CMP-10` | ✅ | n/a | n/a | ⚠ | ✅ | ✅ | ⚠ | ⚠ | ✅ | ✅ | ✅ | ✅ | ⚠ | ✅ |
| `ORDSUM.CMP-11` | ⚠ | n/a | n/a | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | target-owned | target-owned | ✅ | ⚠ |

## G. Coverage reconciliation

| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| `order-summary*` route mount | `ORDSUM.RGN-01` | |
| content cap | `ORDSUM.RGN-02` | |
| toolbar and summary controls | `ORDSUM.RGN-03` | |
| order table region | `ORDSUM.RGN-04` | |
| portal overlays | `ORDSUM.RGN-05` | |
| route title | `ORDSUM.CMP-01` | |
| refresh control | `ORDSUM.CMP-02` | |
| filters/options popover | `ORDSUM.CMP-03` | |
| date picker popover | `ORDSUM.CMP-04` | |
| session/window overview | `ORDSUM.CMP-05` | |
| quick-action launcher group | `ORDSUM.CMP-06` | |
| order table | `ORDSUM.CMP-07` | |
| row selection and row states | `ORDSUM.CMP-08` | |
| Truck Arrival dialog | `ORDSUM.CMP-09` | |
| Dispatch Order dialog | `ORDSUM.CMP-10` | |
| cross-owned launch contracts | `ORDSUM.CMP-11` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.