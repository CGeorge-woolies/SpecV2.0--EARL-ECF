# Changelog

### [2026-07-07] — Session 1
**Added:**
- New repo scaffolded as a sibling to `anz-admin-service`, reusing its shell pattern: Header, Sidebar, sidebar footer with `PersonaToggle`, `StoreRequired` gating, design tokens (`src/theme/tokens.ts`), Shadcn/Tailwind v4 setup, shared components (`SaveDiscardBar`, `StickyTableContainer`, `UnsavedChangesDialog`), `useNavigationGuard`/`usePageTitle` hooks
- `PersonaContext` — Store Team / Support Office toggle, unchanged from anz-admin-service (localStorage key renamed `ecf-persona`)
- `StoreContext` — new two-axis model: `activeStoreType: 'supermarket' | 'cfc' | 'estore'` and `activeCountry: 'au' | 'nz'`, each independently selectable and persisted (`ecf-store-type`, `ecf-country`)
- `StoreToggle` header component — two dropdowns (store type, country) replacing the old single combined store selector
- Placeholder `OrderSummary` page and minimal nav (`src/data/navigation.ts`) as the shell's only route

**Changed:**
- Design system: Shadcn only — no MUI, no `ThemeContext`/`ThemeToggle`, no MUI↔Shadcn dispatch pattern. All layout components (`Header`, `Sidebar`, `SidebarItem`, `UserMenu`) are the promoted Shadcn variants with no theme branching
- App title/branding updated to "ANZ ECF Order Management"

**Pages progressed this session:**
- OrderSummary (/order-summary) — placeholder shell page, shows active store type + country

### [2026-07-10] — Session 2
**Added:**
- Tooltips on the `StatPanel` zone breakdown chips (Ambient, Chilled, Frozen, Security), showing the zone name on hover
- CFC + AU store config: ambient zone splits into three chips (Ambient 1/2/3), each with a small numbered badge overlaid on the shelving icon and its own tooltip; `ZoneBreakdown` mock data gained optional `ambient1`/`ambient2`/`ambient3` fields

**Changed:**
- `StatPanel` zone grid switches to 3 columns when the CFC/AU split-ambient view is shown (2 columns otherwise)

**Pages progressed this session:**
- OrderSummary (/order-summary) — zone breakdown chips in the header toolbar now have tooltips and a CFC/AU-specific ambient zone split

### [2026-07-10] — Session 3
**Added:**
- Select-all checkboxes on the `OrdersTable` session (group) and window (sub-group) header rows, in a dedicated leading column that lines up with the order row checkboxes; the expand/collapse chevron shifted right into the label cell, keeping its indent for windows
- Selection state wired end-to-end: checking a session selects every order across all its windows, checking a window selects only its own orders, and checking/unchecking individual orders drives indeterminate state upward
- `Checkbox` component (`src/components/ui/checkbox.tsx`) now renders a minus icon and fills for the `indeterminate` state, in addition to the existing checked state

**Changed:**
- `GroupHeaderRow`/`SubGroupHeaderRow` in `OrdersTable.tsx` now take `checked`/`indeterminate`/`onCheckedChange` props instead of an unwired placeholder checkbox

**Pages progressed this session:**
- OrderSummary (/order-summary) — orders table header rows gained select-all checkboxes with indeterminate state

### [2026-07-12] — Session 4
**Added:**
- `orderGroups.ts` regenerated from `references/Sample ECF data.xlsx` (309 orders across 18 windows / 30 sessions), replacing the small hand-written mock dataset; parsed via a one-off script reading the sheet's window (yellow, col A) and session (cyan, col B) fill markers to rebuild the `Group`/`SubGroup` nesting, with "5098 On Demand" (from `XP`) always first, "5098 DTBN" always second, then the remaining windows in sheet order
- `OrderRow` gained three new independent flags derived from the sheet's font-color conventions: `isFresh` (green text), `isDeleted` (red strikethrough), `isFirstOrder` (blue text, derived 1:1 from the sheet's `ORDERS` column == 1) — precedence when more than one applies: deleted > first-order > fresh
- New `suppliedStatus: 'deleted'` — renders a red-strikethrough "DELETED" pill in the Supplied % column instead of a progress bar
- `PERSONAL_SHOPPERS` — 15-name pool in `orderGroups.ts`, randomly assigned (1-3 per order, seeded) to picking and dispatched orders
- `AwardStarFilled` icon (`src/components/icons/material-icons.tsx`) — shown as a blue suffix next to the customer name on first-order rows, with a "First order" tooltip
- Customer names and picker names were stripped from the source spreadsheet for privacy; both are synthesized with a seeded random name generator so the dataset is stable across reloads. MILKRUN orders keep the existing `MILKRUN ` customer-name prefix convention
- Supplied % has no source data, so it's derived from `STATUS`: `Picking` → in-progress %, `DIS` → ~85% dark-green "Packed" (80-100%) / ~15% orange "atRisk" (50-79%), `Awaiting Pick`/`AWT` → "Not started", `Deleted` → the new DELETED pill

**Changed:**
- `OrdersTable.tsx`: the "Deleted Orders" filter toggle is now actually wired to `filterGroupsForVisibility` (previously rendered but had no effect); row highlight styling replaced the old status-string-based green highlight (`Picking`/`AWT` prefix) with the new precedence-ordered `isDeleted`/`isFirstOrder`/`isFresh` resolver; the picker-names tooltip on the Supplied bar now also triggers for dispatched (`DIS`) rows, not just `Picking`

**Pages progressed this session:**
- OrderSummary (/order-summary) — orders table now shows real sample data at production-like volume, with working dispatched/deleted filters and new fresh/deleted/first-order visual states

### [2026-07-12] — Session 5
**Added:**
- New Order Details page (`src/pages/OrderDetails.tsx`), reached by clicking any order row on Order Summary, route `/order/detail?id={orderNo}`
- Grey `OrderDetailToolbar` (`src/pages/order-detail/`): left-aligned quick actions (Print Invoice for Dispatched Order — disabled until status is `DIS`; Manual Picking for BCP; Move Order/Line from OSR to Shop Floor — both gated to eStore via `useStore().isEstore`, Move Line additionally disabled until 1+ article is selected) built as a data-driven action list so tab-specific actions can be merged in later; centered Articles/Details/Instructions/Labels/Samples/Audit tabs
- `src/components/ui/tabs.tsx` — new shadcn-style Tabs wrapper around `@base-ui/react/tabs` (first Tabs usage in this codebase)
- Three placeholder popups (`ManualPickingDialog`, `MoveOrderDialog`, `MoveLineDialog` in `src/pages/order-detail/`), centered modals built directly on `@base-ui/react/dialog` matching the existing `UnsavedChangesDialog` styling convention; content TBD
- Global header (`Header.tsx`) now swaps its center title for an order-number stepper on `/order/detail`: prev/next chevrons (`ChevronLeftFilled`/`ChevronRightFilled`) with "Previous order"/"Next order" tooltips, stepping through orders in the same flattened top-to-bottom order the Order Summary table renders them, plus a proposition icon + label subline replacing the page-loaded-at timestamp
- `getFlattenedOrders()`/`findOrder()` selectors added to `orderGroups.ts` — single source of truth for "all orders in table order" and order lookup by `orderNo`, used by the row click handler, the header stepper, and the details page
- `DELIVERY_ICONS` map hoisted from `OrdersTable.tsx` into `orderGroups.ts` so both the table's Proposition column and the header subline share one definition

**Changed:**
- `OrdersTable.tsx` — order rows are now clickable (`cursor-pointer hover:brightness-95`), navigating to the new Order Details page; checkbox cell gained `stopPropagation` to keep row selection independent of row navigation

**Pages progressed this session:**
- Order Details (/order/detail?id={orderNo}) — new page: toolbar, quick actions, and tab shell built; tab content and popup content still to be designed

### [2026-07-12] — Session 6
**Added:**
- Order Details "Details" tab built (`src/pages/order-detail/DetailsTab.tsx`) — 3-column layout (Fulfilment / Customer / Payment & Fraud), each column in a `Card` with a section-title header; replicates a reference screenshot supplied by the user, then iterated to a neater card-based treatment
- `src/pages/order-detail/orderDetailData.ts` — new `OrderDetailInfo` type and `getOrderDetailInfo(orderNo)` selector; currently returns a single canonical dummy record (customer Jonathan Villao) for every order — real per-order data and AU/NZ variation are a future pass
- `src/pages/order-detail/DetailRow.tsx` — shared label/value row helper used across the Details tab (and intended for reuse by future tabs)
- `src/components/ui/select.tsx` — new shadcn-style Select wrapper around `@base-ui/react/select` (first Select usage in this codebase), used for the editable pick-status dropdown; trigger content is fully composable so it can be styled as a `Badge` pill rather than a boxed input
- `src/components/ui/card.tsx` — new minimal Card/CardHeader/CardTitle/CardContent primitives (first Card usage in this codebase), styled from `theme/tokens.ts`

**Changed:**
- `OrderDetails.tsx` — Details tab now renders `DetailsTab` instead of the generic placeholder; other tabs (Articles/Instructions/Labels/Samples/Audit) unchanged

**Pages progressed this session:**
- Order Details (/order/detail?id={orderNo}) — Details tab content built (editable Status dropdown + On Hold/Priority Order/Ignore Transit/Ignore Fraud Status checkboxes are locally stateful only; no save/dirty-tracking pattern yet). Remaining tabs still placeholders

### [2026-07-12] — Session 7
**Added:**
- Order Details "Instructions" tab built (`src/pages/order-detail/InstructionsTab.tsx`) — Personal Shopper, Customer Care, and Delivery instructions, laid out in the `Card` pattern from Session 6
- `src/pages/order-detail/instructionsData.ts` — new `OrderInstructions` type and `getOrderInstructions(orderNo)` selector; canonical dummy record (empty Personal Shopper/Customer Care, populated Delivery Instructions) so both the editable-empty and read-only-populated states are visible without extra wiring
- `src/components/ui/textarea.tsx` — new shadcn-style Textarea wrapper (first Textarea usage in this codebase)
- First real usage of the isDirty/save-discard pattern carried over from `anz-admin-service` in Session 1 (`SaveDiscardBar`, `UnsavedChangesDialog`, `useNavigationGuard`) — previously scaffolded but unwired in any page

**Changed:**
- `OrderDetails.tsx` — Instructions tab now renders `InstructionsTab` instead of the generic placeholder; other tabs (Articles/Labels/Samples/Audit) unchanged
- `SaveDiscardBar.tsx` — bottom bar now spans the full viewport width (`left: 0`) instead of leaving a stale `tokens.sidebarWidth` (288px) gap inherited from `anz-admin-service`'s sidebar layout, which this app doesn't have

**Pages progressed this session:**
- Order Details (/order/detail?id={orderNo}) — Instructions tab content built. Personal Shopper/Customer Care are editable textareas (pale-yellow dirty highlight via `colorStatusTentativeBgWeak`, bottom Save/Discard bar, unsaved-changes nav guard) while `suppliedStatus` is `notStarted`/`picking`; read-only plain text with grey empty-state copy once `packed`/`atRisk`/`deleted`. Delivery Instructions always read-only. Remaining tabs (Articles/Labels/Samples/Audit) still placeholders

### [2026-07-12] — Session 8
**Added:**
- Details tab's Status/On Hold/Priority Order/Ignore Transit/Ignore Fraud Status fields wired to the shared `SaveDiscardBar`/`useNavigationGuard`/`UnsavedChangesDialog` pattern ("You have unsaved changes to Order Details."), each dirty field individually highlighted via a new `dirty` prop on `DetailRow`
- Day-of-week added to Order Created/Delivery ETA to match Pick Date/Delivery Date's format; reordered the Fulfilment card (Status/Confirmation Number/Transit Code → On Hold/Priority Order → Order Created/Pick Date/Delivery Date/Delivery Window → Delivery ETA/Transit Status/Ignore Transit)
- `confirmationNumber` field on `OrderDetailInfo`, shown only for NZ (`useStore().isNZ`)
- Customer card: Mobile/Phone/Work Number split into individual rows (Smartphone/Phone/Briefcase lucide icons); icons added to all three card headers (`Package`/`User`/`CreditCard`)
- Customer card is now editable: header gained an outline "Edit Details" button (Pencil icon, becomes plain "Cancel" while editing) that makes Name/Mobile/Phone/Work Number/Delivery Address 1-3 editable inputs — Customer Number stays read-only; feeds into the same dirty/save-discard flow as the rest of the tab
- `src/components/ui/input.tsx` — new shadcn-style Input wrapper (first Input usage in this codebase), matching `Textarea`'s styling convention
- New **Customer Support** persona (`PersonaMode`, `PersonaContext.isCustomerSupport`, `UserMenu` option "Customer Support (98765432)") — distinct from Support Office
- New toolbar quick action "Edit Customer Details" (Pencil icon) in `OrderDetailToolbar`, visible only on the Details tab, only for NZ stores, only for the Customer Support persona; opens the Customer card into edit mode via lifted `isEditingCustomer` state in `OrderDetails.tsx`

**Changed:**
- `SaveDiscardBar.tsx` — background/border/text recoloured to the pale-yellow `colorStatusTentativeBgWeak`/`colorStatusTentativeBgStrong`/`colorStatusTentativeTextWeak` tokens (previously white), matching the per-field dirty highlight; both Details and Instructions tab bars now end their message with a full stop and use Title Case tab names
- Briefly prototyped, then reverted per user request: pinning the Customer card's save/discard controls to the bottom of the card instead of the page-wide fixed bar

**Pages progressed this session:**
- Order Details (/order/detail?id={orderNo}) — Details tab now has a working save/discard flow across Fulfilment and Customer fields, an editable Customer card, and a persona/country/tab-gated "Edit Customer Details" toolbar action for the new Customer Support persona

### [2026-07-12] — Session 9
**Added:**
- `src/pages/order-detail/useEditableField.ts` — small `useEditableField<T>(initial)` hook (value/setValue/isDirty/commit/revert) factoring out the value+saved-baseline pattern that was previously hand-rolled per field; used for all 15 editable Details-tab fields
- Delivery Date, Delivery Window, and Fulfilment Fee are now editable while Edit Details mode is on (previously only Customer fields were editable)

**Changed:**
- Lifted all Details-tab form state (Status, On Hold, Priority Order, Ignore Transit, Ignore Fraud Status, Customer Name/Mobile/Phone/Work Number/Address 1-3, Delivery Date/Window, Fulfilment Fee) out of `DetailsTab.tsx` and up into `OrderDetails.tsx`, so `isDirty`/save/discard is a single source of truth shared by the tab's `SaveDiscardBar` and the toolbar's Edit Details button — `DetailsTab` is now a controlled/presentational component (`info`, `fields`, `isEditingDetails`, `isDirty`, `onSave`, `onDiscard` props), and `UnsavedChangesDialog`/`useNavigationGuard` moved up to `OrderDetails.tsx` alongside it
- Removed the Customer card's own header Edit Details/Cancel button and the "Edit Customer Details" quick action — replaced with a single **Edit Details**/**Cancel** button at the far right of the grey toolbar (outline `Button`, Pencil icon when idle, `X` icon while editing), same Details-tab-only/NZ-only/Customer-Support-only gating as before

**Pages progressed this session:**
- Order Details (/order/detail?id={orderNo}) — Edit Details is now a single toolbar-level action covering Customer fields plus Delivery Date/Window/Fulfilment Fee, with one unified isDirty/save-discard flow for the whole Details tab

### [2026-07-12] — Session 10
**Added:**
- Delivery Date is now a real `Date` (`OrderDetailInfo.deliveryDate`, was a display string) — while editing, shows a Popover+Calendar date picker matching the existing `DateStepper` pattern from Order Summary; `formatDetailDate()` renders it back to the "Sun 12 Jul 2026" style used elsewhere in the Fulfilment card
- Delivery Window is now a dropdown (`Select`) of 8 made-up three-hour blocks spanning the full day (`DELIVERY_WINDOW_OPTIONS` in `orderDetailData.ts`, 12:00 AM to 3:00 AM ... 9:00 PM to 12:00 AM), replacing the free-text input while editing

**Pages progressed this session:**
- Order Details (/order/detail?id={orderNo}) — Delivery Date and Delivery Window in the Fulfilment card now use a date picker and a windows dropdown respectively instead of free-text inputs while Edit Details is on

### [2026-07-16] — Session 11
**Added:**
- New Dash page (`/dash`, `src/pages/Dash.tsx` + `src/pages/dash/`) — a "Real Time Performance" picking-floor monitoring dashboard, wired up from the header's previously-placeholder "Dash" nav link. Two tabs (grey toolbar, same shadcn `Tabs` pattern as Order Details): **Indicators** (6-tile grid) and **Timeline** (Personal Shopper Timeline)
- `src/pages/dash/Gauge.tsx` — reusable custom SVG semicircle gauge (no charting library in this repo): red/green bands split at a `target` value, blue target tick, needle allowed to overshoot slightly past `max` so out-of-range readings stay visible instead of being clamped; per-instance `belowTargetColor`/`aboveTargetColor`/`targetTickColor` overrides
- `src/pages/dash/ZoneBarChart.tsx` — `SimpleBarChart` and `StackedBarChart`, div-based vertical bar charts following the existing `SuppliedBar` fill-div idiom
- `src/pages/dash/IndicatorsTab.tsx` — Items Per Labour Hour and RF Pick Rate gauges (RF Pick Rate also renders 4 zone mini-gauges in a 2x2 grid); Estimated Picking End Time and Count of Trucks as plain tables; Count of Team Members (simple bar chart) and Count of Totes (stacked bar chart, reusing the exact Packed/Picking/Awaiting colours from the Order Summary supply bar)
- `src/pages/dash/TimelineTab.tsx` — Gantt-style table (reuses `StickyTableContainer`'s sticky-header helpers) with one row per picker: a zone-coloured shift bar (hover `Tooltip` shows zone name + duration, e.g. "44min" or "1hr 12min") plus three metric cells colour-coded by % of target — pale red <95%, pale yellow 95-99% (same token as the app's dirty-field highlight), light green 100%+ (same token as the Picking supply-bar chip) — colour-blind-safe by design (no red/green-only distinction relied on)
- `src/pages/dash/dashData.ts` — mock data (gauge values, zone breakdowns, truck counts, ~40 seeded-PRNG picker timeline rows, static across renders)
- Picking-zone colour tokens in `src/theme/tokens.ts` (`colorZoneAmbient/Chilled/Frozen/Security/NonPicking`), following the existing "project-specific" token precedent set by `colorSupplyEcom*`/`colorSupplyShopFloor*`
- Header search link replaced with an icon-only `Search` (lucide-react) button with a tooltip, matching the icon-button pattern used for the order-stepper chevrons

**Changed:**
- Picking-zone vocabulary (Ambient/Chilled/Frozen/Security) reused from `StatPanel.tsx` for consistency with Order Summary, instead of inventing new labels from the reference screenshot
- Global `Header.tsx`: the "Dash" nav link now routes to `/dash` (was `href="#"`) and its label reads "Performance"; on `/dash` the centre subline swaps to "Last refreshed HH:MM:SS" plus a Refresh link (bumps a local timestamp) instead of the static page-load time
- Added `{ path: 'dash', element: <Dash /> }` to `App.tsx` and a `dash` entry to `NAV_ITEMS` in `navigation.ts`

**Pages progressed this session:**
- Dash (/dash) — new page, Indicators and Timeline tabs both built out with mock data; no persona/store gating yet (open question, flagged for follow-up)

### [2026-07-17] — Session 12
**Added:**
- New Order Line Detail page (`/order/detail/line?id={orderNo}&line={lineNo}`, `src/pages/OrderLineDetail.tsx` + `src/pages/order-line-detail/`), reached by clicking any article row in the Order Details Articles table — `LineDetailToolbar.tsx` (Details/Substitute tabs + Previous Line/Next Line, disabled at the first/last line), a breadcrumb link back to the order, a left sidebar (Line Number, Subs Allowed, tab-specific price/amount fields), `DetailsTab.tsx` (product info, editable Supplied Quantity, Actual Weight Supplied table for weighed items, a nested "SILENT SUB" card when the line has a silent substitution), and `SubstituteTab.tsx` (existing substitute details, or an "+ Add Substitute" button)
- `SubstituteSearchDialog.tsx` — mock-functional substitute search (Article ID, or Brand/Variety/Generic/Volume combined) against a small hardcoded catalog (`SUBSTITUTE_CATALOG`/`searchSubstituteCatalog` in `articlesData.ts`); picking a result sets it as the line's substitute
- `OrderArticlesContext` (`src/context/OrderArticlesContext.tsx`) — in-memory (no localStorage) shared store of order-line edits keyed by order number, mounted at the app root so edits made on the Line Detail page (Supplied Quantity, added substitutes) are reflected back in the Articles table for the rest of the session
- `findArticleLine` in `articlesData.ts` — mirrors `findOrder`'s `{ row, index, all }` shape for prev/next-line navigation
- Per the "use the field name as a placeholder for data we don't model" instruction: UOM (no backing field anywhere in `ArticleRow`/`ArticleSubRow`) renders as literal `<UnitOfMeasure>`, and per-line Personal Shopper Notes (no per-line field exists, only order-level) renders as `<PersonalShopperNotes>`

**Changed:**
- `ArticlesTab.tsx` now sources its article rows from `useOrderArticles` (the new shared context) instead of local `useState`, so edits persist across navigation to/from the Line Detail page; its `accent`/`TypeBadge` moved to `src/pages/order-detail/lineAccents.tsx` and its `SuppliedInput`/`SaveButton`/`DisabledSuppliedInput` moved to `src/pages/order-detail/SuppliedInput.tsx`, both now shared with the new Line Detail page
- Article rows in the Articles table are now clickable (whole row, excluding the inline Supplied input/Save/checkbox), navigating to the new Line Detail page

**Pages progressed this session:**
- Order Line Detail (/order/detail/line) — new page, Details and Substitute tabs both built out with mock data and a working (mock) substitute search flow

### [2026-07-29] — Session 13
**Added:**
- `LocationIdChip` (`src/components/shared/LocationIdChip.tsx`) — light grey/bold-black badge shown next to the Transit Code for On Demand and In Store Collection orders (not shown while a row is Awaiting Pick); inverts to black background/white text on row hover in the `OrdersTable` (relies on the ancestor row's Tailwind `group` class), and renders in its resting state on the Order Details page where there's no hover-group ancestor
- `hasLocationId`/`getLocationId` in `orderGroups.ts` — `hasLocationId` gates the chip on delivery proposition (`store`/`milkrun`) and non-awaiting status; `getLocationId` derives a deterministic two-digit "01"-"99" id from the order number (simple string hash) so the same order shows the same Location ID everywhere it appears

**Changed:**
- `OrdersTable.tsx` Transit Code cell and `order-detail/DetailsTab.tsx`'s Transit Code detail row both now render the Transit Code alongside the new `LocationIdChip` (when `hasLocationId` is true), sharing the same `getLocationId(orderNo)` value across both pages
- Version bumped to 1.3 (`src/version.json`, via `scripts/build-share.mjs`)

**Pages progressed this session:**
- Order Summary (/order-summary) — Transit Code column in `OrdersTable` now shows a Location ID chip for eligible orders
- Order Details (/order/detail) — Transit Code field in the Details tab now shows the same Location ID chip

### [2026-08-28] — Session 14
**Added:**
- `scripts/a11y-contrast-check.mjs` — dependency-free WCAG 2.1 AA contrast audit script. Encodes the full `src/theme/tokens.ts` palette plus the Shadcn `oklch` vars from `src/index.css` (light mode only — dark mode is unused), checks 82 real foreground/background pairs actually rendered across the app (status badges, buttons, alerts, supply/zone/gauge indicators, `TypeBadge` accents, Shadcn primitives) against the correct threshold (4.5:1 text, 3:1 large text/icons/graphical UI per WCAG 1.4.11), and prints a pass/fail report (`--json` for machine-readable output). Re-run after editing `tokens.ts` or adding new color pairs to the script's `pairs` list
- Order Summary Quick Actions gained two new selection-driven bulk actions: **Move to Shop Floor** (eStore only) — moves selected orders' remaining OSR lines to the Shop Floor picking queue via `MoveOrdersToShopFloorDialog.tsx`, showing the count of eligible (non-dispatched, non-deleted) selected orders; and **Packing Slips** (NZ only) — opens `PackingSlipsDialog.tsx`, letting the user choose via a `RadioGroup` between generating slips for all selected orders or only those with `packingSlipRequired` set, with both counts shown. Both stubbed (`console.log`) — no real PDF generation or shop-floor state mutation yet
- `getAllOrderRows(groups)` in `orderGroups.ts` — flattens `Group[]` into `OrderRow[]`, reused by `OrdersTable`'s group-select-all logic and by `OrderSummary.tsx` to resolve selected row ids back to order data. Row-selection state (`selectedRowIds`) lifted from `OrdersTable.tsx` up into `OrderSummary.tsx` so it can be shared with the `QuickActions` toolbar, without changing `OrdersTable`'s own row/group/sub-group checkbox behavior
- `OrderRow.packingSlipRequired?: boolean` — assigned deterministically to ~30% of orders via a stable hash of each row's `id`, so the flag stays consistent across reloads without hand-editing every row; NZ-only concern (AU never shows it). Rendered as an icon suffix on the Order No cell (`FlagPackingSlipRequired`, tooltip "Packing slip required") when `isNZ && row.packingSlipRequired`
- `getRoutingDisplay(row, isNZ)` in `orderGroups.ts` — single source of truth for the "Routing" column: Location ID chip for Customer/Driver Collection (both countries), Transit Code text for AU Fleet, Drop Code text for NZ Fleet (`getDropCode`, format `XXX-QX-TIME-FR`), Locker ID text for NZ Locker once assigned (`getLockerId`, sequential `LOCK001`-style). `hasLocationId` widened to cover all four Customer/Driver Collection proposition types (previously missing Location ID for on-demand customer and scheduled driver rows)
- Global content max-width: `AppShell` wraps `<Outlet />` in `max-w-[1920px] mx-auto`, so pages stay full-bleed up to 1920px and only gain side whitespace on wider screens (removing now-redundant per-page max-width wrappers on Order Summary and Order Details); the same full-bleed-background-with-constrained-content pattern applied to `Header`, `OrderSummaryToolbar`, `OrderDetailToolbar`, `LineDetailToolbar`, and `Dash`'s tab bar
- Proposition column rebuilt on a new 7-icon set (On Demand Customer/Driver Collection, Scheduled Customer/Driver Collection, Scheduled Fleet, Scheduled Locker Unassigned/Assigned) via a new generic `createIcon24` icon factory, replacing the old ad-hoc delivery-icon set; `getPropositionDisplay(row, isAU)` is now the single source of truth for the Proposition icon/label/two-line tooltip, shared by Order Summary, Search Orders, and the Order Details header subline; Locker hidden entirely for AU
- `OrderRow.nzOnly?: boolean` — NZ-only rows (e.g. Locker orders) are now filtered out of the table entirely for AU instead of just having their icon hidden
- New Age Restricted flag (`ageRestriction?: '16' | '18'` on `OrderRow`, `getAgeRestrictionDisplay`) — NZ shows the 16+ or 18+ icon, AU always resolves to 18+ (no 16+ category)
- `CalendarTodayFooter` (`src/components/shared/CalendarTodayFooter.tsx`) — reusable "Today" button rendered under the `Calendar` in a date-picker `PopoverContent`, setting the field to today's date and closing the popover; wired into all three date-picker sites (`SearchFilters.tsx` begin/end date range, `DateStepper.tsx` on Order Summary, `DetailsTab.tsx`'s Delivery Date field on Order Detail), each Popover now controlled (`open`/`onOpenChange`) so the footer button can close it
- `ArticleRow.location` (`src/pages/order-detail/articlesData.ts`) — Aisle/Bay/Shelf shelf location (format `A# B# S#`) added to all 33 mock article rows (15 in `PICKING_ARTICLES`, 18 in `DISPATCHED_ARTICLES`, carried through into `NOT_STARTED_ARTICLES`), populating the previously-empty Location column on the manual picking list (`ManualPickingDialog.tsx`)

**Findings (13 of 82 pairs fail AA, from the contrast audit script above):**
- Real failures (not disabled-state, so worth fixing): `TypeBadge` "SUB" variant text/bg (`order-detail/lineAccents.tsx:7`, 4.11:1); Totes chart "awaiting" segment label (`dash/IndicatorsTab.tsx:100`, 2.24:1); TimelineTab metric cell at 100%+ of target (`dash/TimelineTab.tsx:64-73`, 4.45:1, just under 4.5:1); `Gauge`'s default white tick mark on the pale-green above-target band (`dash/Gauge.tsx:63`, 1.29:1); 4 of 5 zone-legend swatches vs their white card background (`dash/TimelineTab.tsx:19-25`, Chilled/Frozen/Non-picking/Ambient... Ambient passes, Chilled 1.77:1, Frozen 2.5:1, Non picking 1.88:1 all fail — only Security passes at 4.97:1); Shadcn `variant="destructive"` badge/button text against its 10%-opacity red background (`components/ui/badge.tsx`, `button.tsx`, 4.01:1)
- Disabled-state pairs also fail (flagged informational-only — WCAG AA doesn't require contrast on disabled controls): primary/secondary/tertiary button disabled text, disabled link text, disabled input text (all in `tokens.ts`)
- Full pass/fail table with color swatches published as an artifact for the designer review

**Changed:**
- All 6 selection-required Quick Actions (Department Notifications, Dispatch Order, Truck Arrival, Assign to Locker, Move to Shop Floor, Packing Slips) now share one pattern when clicked with nothing selected: the button stays hoverable/tooltip-visible (`aria-disabled` instead of native `disabled`, since Base UI's `disabled` blocks pointer events entirely), and a `sonner` toast (with a close button, top-right) reads "To {action}, first select one or more orders." instead of the click doing nothing. Assign to Locker's icon also swapped from generic `KitchenFilled` to the `PropScheduledLockerUnassigned` proposition-flag icon for visual consistency
- `flattenWaveGroupsToWindows` now sorts NZ's flattened windows chronologically by parsed start time instead of preserving AU's session-array order (non-time-range labels like `BB`/`BC`/`No Route` keep their original relative position); the 10 `DD*` AU session windows that duplicated `CD*`'s hourly windows are offset by 30 minutes, so NZ's flattened window list has no repeated time labels
- "Transit Code" column/label renamed to "Routing" everywhere (Order Summary, Search Orders, Order Details, printed Picking List); stale `transitCode` mock values removed from Customer/Driver Collection rows now that they resolve via `getRoutingDisplay`; `OrderDetailInfo.transitCode` removed as dead code
- Both Fleet routes ("BC") now have a mix of statuses instead of 100% Dispatched, so their Routing code isn't hidden by the default "Hide Dispatched" filter; Routing column widened 9%→11% (fits NZ's Drop Code) and Customer column reduced 17%→15% to compensate; Customer name cells now truncate with an ellipsis + tooltip instead of wrapping
- Order Summary supplied-bar warning icon reworked from "Below 80% supplied" (hand-authored `atRisk` status, hidden once dispatched) to "Out of Stock > 2%" — shown for Packed/Dispatched orders with `suppliedPercent < 98`, computed on the fly instead of stored per-row (applied to the eCom/Shop Floor split-supply columns too); moved from a fixed right-edge position to an inline suffix after the status label and recoloured white; `suppliedStatus` dropped the now-unused `'atRisk'` value
- Mock data reworked for more realistic coverage: `suppliedPercent` bumped for most Dispatched/Packed rows so the OOS icon isn't ubiquitous; ~60% of rows gained `bulk`/`specialty`/`fraud` flags so the flag-icon columns have visible coverage; AU proposition data audited so every AU wave session shows one consistent type end-to-end
- On Demand toggle and its Open/Closed badge hidden for AU (NZ-only feature); its "switch off" confirmation dialog gained required "Your name" and "Reason for switching off" fields
- `FLAG_COLUMNS`'s `alcohol` key renamed to `ageRestricted` (tooltip label "Alcohol" → "Age Restricted"); Bulk, Specialty (now a star), Fraud Challenged, and PST Locked (now a lock+clock) flag icons replaced with newly supplied SVGs; Age Restricted 16+/18+ icons redrawn for legibility (both now fill solid black, replacing the old cramped digit glyphs)
- "% Orders" column renamed to "Orders Dispatched %" in the Window and Session overview drawers (`WindowOverview.tsx`, `SessionOverview.tsx`)
- On Demand orders' PST (Pick Start Time) Locked flag icon (`OrdersTable.tsx`) now also shows for orders with status `Picking`, not just `AWT (PST ...)`; two on-demand mock rows in `Picking` status given the `locked` flag to demonstrate this
- On Demand orders' Status-cell "Dispatch by" hover tooltip (`OrdersTable.tsx`) is now gated by country: AU only shows it while the PST lock flag is active on the order (previously showed whenever `dispatchByTime` was present, regardless of lock state); NZ always shows it whenever `dispatchByTime` is present

**Pages progressed this session:**
- Order Summary (/order-summary) — bulk Move to Shop Floor (eStore) and Packing Slips (NZ) quick actions; all quick actions give hover/toast feedback when disabled; Routing column shows country-specific codes; new proposition/age-restriction/flag icon sets; OOS warning icon rule reworked; NZ window list sorts correctly; On Demand toggle NZ-only; full-bleed toolbar layout
- Search Orders (/search-orders) — Routing column and proposition rendering brought in line with Order Summary
- Order Details (/order/detail) — Routing logic and proposition rendering shared with Order Summary; full-bleed toolbar layout
- Order Line Detail, Dash — full-bleed toolbar/tab-bar layout
- All pages (via `AppShell`) — consistent 1920px content max-width with side whitespace on very wide screens
- Search Orders, Order Summary, Order Detail — date pickers (begin/end range, `DateStepper`, Delivery Date) gained a "Today" shortcut button
- Order Detail — manual picking list's Location column now shows an Aisle/Bay/Shelf value for every article instead of rendering empty
- Order Summary — Window and Session overview drawers' "% Orders" column relabelled "Orders Dispatched %"
- No page code changed for the accessibility audit pass — Dash, Order Summary, Order Detail were touched only as read targets
- Order Summary (/order-summary) — On Demand group's PST flag and Dispatch-by tooltip logic refined

### [2026-08-31] — Session 15a (pre-v1.5, merges Sessions 15–27)

#### Order Summary (/order-summary)

**Quick Actions**
- Packing Slips: added a second `[DEMO]` completion popup after confirming scope in `PackingSlipsDialog.tsx`, instead of silently closing.
- Department Notifications: wired up (previously a no-op stub) — clicking the toolbar icon opens `DepartmentNotificationsDialog.tsx` (Departments/Specialty/Print Options checkbox groups, tri-state "select all"); confirming clears the table selection and shows the same `[DEMO]` completion popup pattern as Packing Slips. New `departmentNotificationsData.ts` static option lists (`DEPARTMENTS`, `SPECIALTY_OPTIONS`, `PRINT_OPTIONS`).
- Truck Arrival: wired up (previously a no-op stub) — new `TruckArrivalDialog.tsx` (Date popover/calendar defaulting to today + two-column Session checkbox grid, Confirm disabled until a session is checked), followed by the same `[DEMO]` completion popup. New `SESSION_CODES` (18 canonical session codes, prefixed `1997`/`9100` for AU/NZ via `useStore()`) in `sessionOverviewData.ts`.
- Fixed Truck Arrival's Date field popover being unclickable — the calendar rendered behind the dialog's own backdrop (`z-50` vs. the dialog's `z-[3000]`/`z-[3001]`); fixed with `positionerClassName="z-[3002]"`.
- Standardised the Cancel/primary button pairing across `DepartmentNotificationsDialog.tsx`, `PackingSlipsDialog.tsx`, and `MoveOrdersToShopFloorDialog.tsx` — both now render via the shared `Button` component instead of a hardcoded-class `Dialog.Close` paired with a smaller primary button (previously one row-height off from each other).

**Row & flag highlighting**
- On Hold/Audit/Reissued order rows now get a full-row background tint (pink/lime/blue, precedence On Hold > Audit > Reissued) with a colour-matched hover tooltip explaining the flag, suppressed while hovering an element with its own tooltip (`data-icon-tooltip`). Seeded on three sample orders.
- New `packingSlip` flag column (NZ-only, abbr "PS"); `getVisibleFlagColumns(isNZ)` is now the single source of truth for which flag columns render (hides PST Locked for NZ, Packing Slip for AU).
- Age Restricted tooltip now reads two lines ("Age Restricted" / "18+" or "16+"); Locker proposition tooltip's second line changed "Unassigned"/"Assigned" → "Unallocated"/"Allocated"; "Assign to Locker" quick action relabelled "Lockers Capacity Check" (disabled-selection toast copy updated to match).
- Both Supplied %-style progress bars now paint a white background behind the fill so the unsupplied portion doesn't show the row's flag tint through it; the app-wide `Checkbox` component gained an explicit white unchecked-state fill for the same reason (previously only looked white by coincidence).
- Supplied % bar/percent left blank for any order, window, or session whose delivery window starts at 17:00 or later (`isEveningWindow`) — a demo stand-in for "session hasn't cut off yet, so totes/trips haven't generated," not real cutoff-time logic.

**Session/window status**
- Cutoff-status colouring added to the first window/session header row: orange fill within 15 min of cutoff, red once cutoff has passed, both with white header text for contrast. Since the prototype has no live clock, a floating demo-only "cog" FAB (`DemoWindowStateToggle.tsx`) lets Normal/Warning/Exceeded be forced for preview — production would compute this from real picking-completion-vs-cutoff-time state.
- Open/Closed status chip extended from the On Demand row to every session/window header row (AU sessions, AU sub-group windows, NZ flattened windows) — display-only, no toggle (closing is meant to happen automatically via cutoff/dispatch completion, not user action); repositioned to align consistently at the start of the Order No column instead of trailing inline after the label.
- NZ's AM/PM window subGroup labels ("BB"/"BC") replaced with sequential `HH:MM-HH:MM` time-range labels, consistent with the rest of NZ's flattened window view (only labels/ids changed, not rows/values/transit codes).

**Toolbar / stats**
- `StatPanel` relabelled ("Totes/Articles to pick" → "...awaiting pick") and reworked into a label+badge row followed by a fixed 4-column zone-chip grid, so CFC/AU's extra split-ambient chips overflow onto their own line automatically.

#### Search Orders (/search-orders)
- Results now group by store: a new leftmost Store column (using the same rowSpan merge-grouping as Session/Window) so sessions/windows/orders nest under their store when a search spans multiple stores. The previously-unwired "Search all stores" checkbox is now live, backed by two synthesized extra stores' worth of demo data.
- Brought in line with Order Summary's flag-column and tooltip changes: PST Locked column hidden for NZ, new Packing Slip column for NZ, Age Restricted tooltip now two lines, Locker tooltip copy updated to "Unallocated"/"Allocated".

#### Order Details (/order/detail)
- "Manual Picking for BCP" quick action relabelled "Print Manual Pick List"; manual pick list's "Customer Care Centre Instructions:" label shortened to "Customer Care Instructions:".
- Browser tab title now leads with the order number (e.g. `12345678 - ANZ ECF Order Management`) instead of the site-name fallback.
- "On Hold" checkbox now seeds from the actual clicked order instead of a hardcoded mock, and saving the Details tab writes the value back onto the shared `OrderRow` object — toggling On Hold and saving is reflected in Order Summary's row highlighting immediately (relies on the existing shared-object-reference pattern, no new store).
- Labels tab: delete-bag/delete-tote toast position reviewed and reverted — every `sonner` toast in the app (including Order Summary's Quick Actions toast) now consistently uses the app-wide `top-center` default, no per-call overrides.

### [2026-08-31] — Session 15b (post-v1.5, merges Sessions 28–41)
**Note:** v1.5 local distribution share was generated after Session 27; everything below is new since that share and will form part of the next local share, v1.6.

#### Order Summary (/order-summary)

**On Demand orders**
- "N/M" picking-capacity indicator (e.g. "2/7") hidden for NZ — an AU-only concept; documented what N (active Personal Shoppers picking) and M (On Demand Picking Capacity) actually mean. AU now shows a person icon and an "On Demand Picking Capacity" tooltip alongside the numbers.
- `shouldShowOnDemandDisTime(row, isNZ)` added as the single source of truth for the "NZ always shows a DIS time, AU only when PST Locked" rule (previously duplicated/inconsistent between Order Summary and Search Orders). The DIS (dispatch-by) time itself moved out of the Status cell's hover tooltip and into the Routing cell.
- Fixed the "On Demand Picking Capacity" tooltip centering on the indicator itself rather than the full table cell (`TooltipTrigger` switched from `flex` to `inline-flex`, with an outer `flex justify-end` wrapper for right-alignment).
- Removed the NZ-only On Demand session/window open/closed toggle (Switch + confirmation dialog) — On Demand groups now always render the plain, non-interactive `OpenClosedBadge`, same as every other session/window row (AU already had no functioning toggle process for this). Deleted `OnDemandToggleDialog.tsx` and its associated state/props.
- Picking-capacity indicator (person icon + "N/M") moved into the group-label cell, right-aligned against the flag columns, so it no longer competes for space with the Status or Supplied % columns.
- Routing column's dispatch-by time is now left-aligned, trailing immediately after the Location ID chip (or transit/drop code) instead of pushed to the far right, and relabelled from "DIS" to "DUE BY" to distinguish it from the unrelated "DIS HH:MM PM" actual-dispatch-time shown in the Status column once an order is dispatched.

**Hold state (session / window / order)**
- "Session On Hold" chip added to window rows (AU only): when a session is put on hold, every window nested under it shows a distinct white-fill/red-border chip, as opposed to the solid hold badge used for a window's own individual hold state. A window's own pause/unpause button is disabled while its parent session is held.
- Session/window header rows get a pink fill whenever that row (or, for a window, its parent session) is held, taking precedence over the demo cutoff orange/red fill. Fill shades by scope: order-level hold uses `FLAG_ROW_STYLES.hold.bg` (`#FDD0E2`, lightest), a window's own hold (or a window whose parent session is held) uses `WINDOW_HOLD_ROW_BG` (`#F9A8D4`), a session's own header row uses `SESSION_HOLD_ROW_BG` (`#F472B6`, darkest) — the "Session On Hold" vs. "On Hold" chip carries the "held directly" vs. "held via session" distinction.
- "On Hold"/"Session On Hold" chips use a bright hot pink (`HOT_PINK = '#FF1493'`, distinct from the paler row fills) — solid fill for "On Hold", white fill with hot pink border/text for "Session On Hold".
- Fixed `HoldControl`'s chip priority: a window individually on hold whose parent session is then also placed on hold now correctly shows "Session On Hold" instead of keeping its own "On Hold" badge.
- Added a pink "On Hold" chip to the order-level row (Status cell, or the Customer cell for eStore split-supply view which has no Status column).
- Session/window "On Hold"/"Session On Hold" pause button + chip moved into the Status column cell, right-aligned (falling back to the Value cell for eStore split-supply view).

**Cutoff status & window capacity**
- Demo cutoff colouring (orange/red fill) moved off the AU session header row and onto the window-level row instead — session and window are distinct levels, and the colour should signal a specific window approaching/passing cutoff, not the whole session. Added a hover tooltip explaining the fill ("<15 min until picking due by time" / "Picking due by time has passed" — placeholder wording).
- Session/window header rows' "Order Value $X" label shortened to "Value $X".
- Window Capacity added to the Open/Closed chip (NZ-only, window groups): shows "X/Y" (tooltip "Window Capacity"), where X is orders currently in the window and Y is its capacity limit, deterministically derived per window for the prototype.
- Open/Closed chips hidden entirely for AU (not yet relevant there — a placeholder for future integration).

**Quick Actions & toolbar**
- `DispatchOrderDialog.tsx` — placeholder popup for "Dispatch Order" (previously a no-op stub), showing "[DEMO] Placeholder content coming inside" / "Selected: X orders" with a Close button, pending design.
- Quick Actions toolbar reordered to: Move to Shop Floor Pick, Department Notifications, Packing Slips, Truck Arrival, Locker Capacity Check, Dispatch Order; "Move to Shop Floor" relabelled "Move to Shop Floor Pick" and "Lockers Capacity Check" relabelled "Locker Capacity Check".

**Sticky toolbar pull tab**
- Added a pull tab to pin the grey toolbar alongside the sticky table header: once the table header is stuck, a small pull tab fades in flush above it; clicking pins the toolbar sticky between the app header and the table header. Pin state is plain `useState` (no persistence) so it resets to unpinned on reload. New `ToolbarPullTab.tsx`; `useStickyHeaderShadow` gained an optional `topOffset` param.
- The pull tab is icon-only (chevron button, label in a hover tooltip), and hangs in whichever direction attaches it to the currently-visible panel at the seam — downward over the stuck table header while unpinned, upward over the pinned toolbar once pinned.
- Fixed three bugs found via manual testing: the tab was invisible (painted behind the fixed app header — now hangs from the sticky seam instead); clicking it while pinned threw an `IntersectionObserver` error (a `calc()` string was being passed where only literal px/percent values are accepted — now threads a plain pixel number end-to-end); and pinning shifted the table header down but the toolbar itself never appeared (a measurement-only wrapper div left zero slack for the sticky toolbar to stick against — fixed by giving `OrderSummaryToolbar` a `forwardRef` straight onto its own root).

**Stats & Supplied % bar**
- Out of Stock warning icon on the Supplied % bar moved from a suffix after the status label to a prefix before it.
- Dispatched-state label now truncates with an ellipsis instead of being hard-clipped when it doesn't fit the available bar width.
- `StatPanel`'s total chip (Totes/Articles awaiting pick) restyled from a large custom-padded badge to the same small pill size as the zone-breakdown chips, bold number, white fill; gained a "Total" tooltip.
- Status column's "AWT (PST HH:MM PM)" now splits its styling to match the Routing column's trailing-time treatment — "AWT" full size, "PST HH:MM PM" (parentheses dropped) trailing in smaller muted font.

**Terminology & internal cleanup**
- Renamed `Group.kind` value `'wave'` → `'session'` throughout (AU's top-level delivery groupings), plus `flattenWaveGroupsToWindows` → `flattenSessionGroupsToWindows` — "wave" was an internal misnomer versus the correct ECF term "session". Naming-only refactor, no behavioural change.
- Reordered the AU-only "Session overview" link/drawer above "Window overview" (previously Window was listed first).
- Documented what the Orders table's "Bulk" (B) flag means (comment-only, no behaviour change): an order has at least one line whose ordered quantity meets/exceeds the "Bulk Order Line Quantity" threshold, a per-line quantity threshold not an order-total value/weight one.

**Pharmacy orders (NZ)**
- NZ pharmacy items: `OrderRow.flags` gained a `'pharmacy'` value, independent of the existing `'specialty'` value — an order can carry either, both, or neither. Flagged on 13 sample orders spanning Awaiting Pick, Picking, Packed, and Dispatched statuses (10 pharmacy-only, 3 also carrying `'specialty'` to demo the double-icon case below).
- `getOrderArticles` (`articlesData.ts`) now appends a sample pharmacy line item (`PHARMACY_ARTICLE`, "Panadol Osteo 665mg 96 Tablets") to an order's article list when that order's `OrderRow` carries the `'pharmacy'` flag, via a `findOrder` lookup — no second article dataset needed, since the flag alone decides whether the line shows up.
- `FlagPharmacy` icon component added to `material-icons.tsx` from the supplied `icon-flag-pharmacy.svg` ("+" glyph), and wired into the Specialty items column: the column now renders the generic specialty icon (`FlagSpecialtyPrep`) and/or `FlagPharmacy` independently, side by side with a 4px gap when an order carries both flags. The Specialty column keeps its normal width (`2.6%`, same as every other flag column) even on the rare row needing both icons — that row's icon wrapper overflows into the neighbouring cell instead of widening the column for everyone (the specialty `<td>` is made `relative` so the spillover paints above the neighbouring cell's content).
- "Pharmacy Orders Only:" filter toggle added to Order Summary's `FilterMenu` popover (NZ-only, gated on `isNZ`), narrowing the queue to orders carrying the `'pharmacy'` flag when switched on. Fixed the filter staying silently applied after switching from NZ to AU (where its toggle is hidden) — it's now also gated on `isNZ` at the point it's applied, not just where its toggle renders, so the queue can't get stuck filtered with no visible control to turn it back off.

#### Search Orders (/search-orders)
- On Demand DIS (dispatch-by) time moved to the Routing column, following the same NZ-always/AU-PST-locked rule as Order Summary; later relabelled "DUE BY" for consistency with Order Summary's change.

#### Order Details (/order/detail)
- Articles tab shows a sample pharmacy line item on orders flagged pharmacy.

### [2026-08-31] — Distribution note
**Note:**
- v1.6 local distribution share generated after Session 41 (`dist/anz-ecf-union-v-1-6.html`, via `npm run build:share`). Sessions from this point forward will each get their own dated changelog entry again (per CLAUDE.md's per-session convention), until the next local share prompts another version increment.

### [2026-09-03] — Session 16 (post-v1.6, merges Sessions 42–52)

#### Order Summary (/order-summary)

**Toolbar & stats**
- `StatPanel` (Totes/Articles awaiting pick): removed the icon from the total chip (superfluous next to the per-zone chips' meaningful icons); total chip moved before the label; label font size increased to match the chip's number (`fontSizeBodySm`, 14px), with the first word ("Totes"/"Articles") bolded; chip number and label line-heights aligned so both sit flush.
- Grey toolbar made responsive below the `xl` (1280px) breakpoint, where the stat cards previously overlapped the centered `DateStepper`: `CollapsedStatPanels.tsx` swaps in two independently-collapsible cards (Totes, Articles) stacked vertically, each collapsed to just its total by default with the whole card (not just a small chevron hit-area) clickable to expand and reveal that card's zone breakdown; `StatPanel.tsx` refactored to export the shared `StatBadge`/`ZoneBadges`/`useZones` pieces so the full and collapsed layouts can't drift apart.
- Quick Actions (`QuickActions.tsx`) also collapses below `xl`: the inline icon row is replaced by a compact two-line "Quick actions" trigger button opening a `Popover` listing every available action as an icon+label row (same store/country-filtered action list, same click handlers/dialogs as the full row — refactored behind one `useQuickActions` hook so neither view can drift). List-item icons sit at `text-muted-foreground` by default and darken to `text-foreground` on hover, matching the Filters/options flag-icon buttons' hover treatment; labels stay full-contrast regardless of hover state.
- `UserMenu.tsx` (header persona switcher) hides the "Store Team (1193644)"-style name/id text below `xl`, leaving just the person icon and chevron, to make more room in the header at narrower widths — full detail still visible on click via the existing dropdown's active-persona checkmark.
- `ToolbarPullTab.tsx` tooltip copy changed from "Show toolbar"/"Hide toolbar" to "Pin toolbar"/"Unpin toolbar", matching what the control actually does (pins the toolbar sticky, doesn't show/hide it).

**Status, Routing & On Demand orders**
- Routing column: dispatch-by time is now pinned to the right edge of the cell (previously left-aligned trailing the Location ID chip/code), keeping the chip/code anchored on the left edge; relabelled from "DUE BY" to "DUE" (also applied to Search Orders).
- Removed the standalone "PST Locked" flag column to free up table width — the PST pick-start time (parsed out of an On Demand order's status text) and its lock icon now render inline in the Status cell instead, right-aligned after the status label, icon shown only when actually locked. Status cell's main status text now truncates with an ellipsis when the PST time and/or "On Hold" badge don't leave enough room to show it in full.
- On Demand orders' "AWT" status wording changed to "Awaiting Pick" throughout (e.g. "Awaiting Pick (PST 02:20 PM)"), matching scheduled orders' wording — updated across Order Summary, Search Orders, and Order Details' status-text pattern matching. Supplied % bar's "Not started" state relabelled "Awaiting Pick" to match.
- On Demand group now sorts its rows by priority: Dispatched, then Packed, then Picking, then Awaiting Pick with PST locked, then Awaiting Pick unlocked, then Deleted last — applied regardless of the hide-dispatched/hide-deleted filters.
- On Demand group header row: AU's picking-capacity indicator ("N/M" + person icon) moved out of the group label cell, briefly shared the Order No cell with NZ's Open/Closed window chip, then settled in the Status column cell as its final position (mutually exclusive slot from NZ's chip throughout).
- Location ID (Routing column, Customer/Driver Collection orders) is now guaranteed unique: it was a hash of the order number mod 99, which collided constantly once more than ~99 orders needed one at once (62 of 99 possible ids were shared by 2-5 orders in the sample data). Replaced with a sequential-counter map built once over the order list, the same pattern already used for Locker ID / Drop Code — ids are still stable across reloads, just no longer collide.
- New "NO ROUTE" session (AU) / window (NZ) at the very bottom of the queue — a catch-all for orders with no fleet transit code, shown consistently across Store/CFC/eStore and AU/NZ. 5 sample orders (status "Awaiting Pick", varied flags), empty Routing column, no totes generated yet (Supplied bar/Totes Picked hidden via new `isNoRouteGroup` helper, same treatment as an evening/17:00+ window). AU renders it flat under one session header (no nested subgroup, like On Demand); NZ's `flattenSessionGroupsToWindows` turns it into a single top-level window. Header row always bright yellow (`BRIGHT_YELLOW`), overriding hold/demo-highlight styling.

**Flags & Order No cell**
- Pharmacy item icon (Specialty items column) is now NZ-only, matching the pharmacy-only filter — it was rendering for AU too since the icon's own render condition wasn't gated on country the way the filter already was.
- Age Restricted flag no longer distinguishes 16+ from 18+: every age-restricted order now shows the 18+ icon/tooltip for both AU and NZ. Removed the unused 16+ icon and the `isAU` param from `getAgeRestrictionDisplay`. The underlying `ageRestriction: '16' | '18'` data field is unchanged, just no longer read for display.
- Removed the "Packing slip required" (PS) flag column so AU and NZ show the same number of flag columns — the indicator now renders as a small icon pinned to the right edge of the Order No cell instead (NZ-only, matching the column's prior visibility), sized to match the PST-lock-icon treatment.
- New milestone-order flag (`FlagMilestoneOrder` icon, from `icon-flag-milestone-order.svg`) replacing the old first-order-only star: tracks lifetime order-count milestones (1st, 25th, 50th, 100th, 200th, 500th, 1000th) with a tooltip naming the milestone reached. First order still renders blue (unchanged); every other milestone uses the default icon colour. `getMilestoneOrderDisplay`/`MILESTONE_ORDER_LABELS` added to `orderGroups.ts` as the shared source of truth (Order Summary, Search Results, and Order Details' Customer card). Sample data updated so all seven milestones have a visible non-dispatched example.
- Removed the "Orders" column entirely (info now lives on Order Details' Customer card and the milestone flag). The milestone flag moved into the Order No cell's right-side icon slot alongside the NZ-only packing-slip icon (milestone first, packing slip second); Order No/Customer columns widened slightly to absorb the freed width.
- B2B customer flag — `OrderRow.isB2B` in `orderGroups.ts`, assigned deterministically to ~10% of orders, prioritising `bulk`-flagged orders first; two hardcoded example orders. `FlagB2B` icon (`icon-flag-b2b.svg`) and a new `'b2b'` entry in `ORDER_FLAG_FILTERS` add a briefcase toggle to the flag-filter row.
- "Specialty items" flag tooltip changed to "Specialty item(s)" (per-row icon and Filters/options row).

**Session/window header rows**
- Removed a leftover order-count cell that no longer had a column to align with after the Orders column was removed (was shifting Supplied %/Totes Picked/Lines/Articles one column out of place). AU and NZ now share one order-count rendering path in the Order No cell: NZ's Open/Closed chip lost its own `windowCapacity` prop, with the count sitting beside it as a tooltip in the same slot AU's count uses — a real time window shows "X/Y" (tooltip "Orders/Capacity"), On Demand/NO ROUTE/AU sessions show just "X" (tooltip "Orders").
- The Hold/pause control now always renders on the right edge of the Routing+Customer cell ("Value $X"), consistently across AU/NZ and Store/CFC/eStore (previously inconsistent between layouts, and mis-aligned for sessions due to a `justify-content: space-between` single-flex-child bug). `HoldControl` now also inherits the row's warning/exceeded white text colour via a new `textColor` prop so it stays legible on orange/red cutoff backgrounds (hover always forces it back to dark).
- Order-level "On Hold" badge now always renders on the right edge of the Customer cell (previously only in eStore's split-supply view); the Customer cell's name truncation (ellipsis + tooltip) now actually engages when the badge is present (missing `min-w-0`/`flex-1` had left it non-functional).
- `ExpandCollapseAllToggle` (top-corner control) swapped its +/− icons for the same `ChevronRightFilled`/`KeyboardArrowDownFilled` icons used by session/window header rows, sized up to 16px to match (the `icon-xs` variant was force-shrinking them to 12px).
- "Order Value $X" label shortened to "Value $X" (carried from pre-Session-16 work, referenced here for the cell layout above).

**Filters & overview drawers**
- Orders table's Filters trigger relocated from the table's top-left corner into the grey toolbar, alongside Session/Window overview (`OverviewDrawers.tsx`), relabelled "Filters/options"; the table's top-left corner now shows an expand/collapse-all icon toggle instead.
- Filters/options popover gained a badge showing the count of active filters, plus a multi-select "Filter by order flags (N)" section — icon-only toggle buttons for all eight order flags (Bulk, Specialty Item, Pharmacy Item, Age Restricted, Fraud Challenged, Milestone Order, Packing Slip Required, B2B), replacing the old single "Pharmacy Orders Only" switch; matches any selected flag (OR). Pharmacy Item and Packing Slip Required stay NZ-only. `ORDER_FLAG_FILTERS` (`orderGroups.ts`) is the shared config (icon, tooltip, country-gating, row-matching predicate) used by both the filter UI and `OrdersTable`'s visibility filtering, so the two can't drift out of sync. A "Clear" button next to the section label clears the selection (disabled when none selected).
- Popover widened `w-64` → `w-72` with the flag-icon row wrapping (`flex-wrap`) so all eight icons fit without overflow. Trigger button now visually inverts when any filter is active (bright green background, white icon/text/badge-text-on-white).
- Session overview/Window overview/Filters/options toolbar links rebuilt on the shared `Button` component (`variant="ghost"`) instead of unstyled `<button>`s, gaining a visible hover state.

**Quick Actions**
- Locker Capacity Check quick action visibility corrected: was hidden for AU only, now only shown for NZ Supermarket.
- Dispatch Order quick action is now functional (previously a `[DEMO]` placeholder): only selected orders with status `Packed` are eligible. `DispatchOrderDialog.tsx` shows a neutral summary when everything qualifies, or an amber warning plus eligible-count line when some don't; confirm button reads "Dispatch Z Orders". Confirming mutates each eligible order's `status` to `DIS HH:MM AM/PM` so it drops out of view under the default "Hide Dispatched" filter, with success/error toasts.
- Packing Slips quick action no longer offers a choice between "all selected" and "only those requiring a slip" (removed, since printing was never actually possible for orders that don't require one) — `PackingSlipsDialog.tsx` now always prints only the required subset, using the same neutral-summary/amber-warning pattern as Dispatch Order; confirm button reads "Print X Packing Slip(s)".
- Packing Slips and Dispatch Order now share one "blocked" pattern in `QuickActions.tsx` (`blockedMessage`/`isActionDisabled`): if orders are selected but none qualify, the toolbar button stays visually disabled and a toast explains why, instead of opening a dialog that can't do anything.
- `TruckArrivalDialog.tsx` now lists only `FLEET_SESSION_CODES` (new subset of `SESSION_CODES` — `AM`, `PM` — that actually carries fleet deliveries) instead of the full session-code set, so non-fleet sessions no longer appear as checkable options. Field label now reads "Window:" for NZ / "Session:" for AU.
- `DepartmentNotificationsDialog.tsx`: removed "Meat Servery" from Specialty options (AU and NZ); added NZ-only "Pharmacy" via new `SPECIALTY_OPTIONS_NZ`. Section headers ("Departments", "Specialty", "Print Options") switched from muted/medium to foreground/semibold so they read as titles.

**Totes Picked**
- Totes Picked column now blanks alongside Supplied % for orders/windows/sessions whose totes haven't been generated yet (evening-window demo cutoff not yet passed) — applies to per-row cells and session/window header totals.

#### Search Orders (/search-orders)
- DUE label change and PST Locked column removal, matching Order Summary.
- Age Restricted simplified to 18+ only; Packing Slip column removed in favour of an Order No suffix icon.
- Orders column removed; milestone-order flag added to Order No cell (previously still used the old first-order-only star).

#### Order Details (/order/detail)
- Status-text pattern matching updated for "Awaiting Pick" wording (Labels tab hold detection, Articles tab variant mapping).
- Details tab Customer card gained a "Total Orders" field (under Name, showing the order's `orders` count) plus the milestone-order flag next to it.
- Customer card swaps its person icon for a briefcase icon with a "B2B Customer" tooltip when the order's `isB2B` flag is set.
- Page now resets scroll position to top on mount/order change, so navigating from a scrolled Order Summary no longer lands mid-page.
- Toolbar quick actions (`OrderDetailToolbar.tsx`) reworked for AU/NZ parity and real-world constraints: Print Invoice for Dispatched Order is now AU-only and opens a new `PrintInvoiceDialog.tsx` (`[DEMO]` placeholder) instead of a console log; added a Print Packing Slip action (NZ-only, shown only when `packingSlipRequired`); Print Order List is now NZ-only; Manual Picking is hidden behind a new `showManualPicking` demo feature flag (off by default), toggleable via a new floating `DemoBcpManualPickingToggle.tsx` gear icon (mirrors Order Summary's `DemoWindowStateToggle`). Toolbar order: Print Invoice (AU) / Print Packing Slip (NZ) → Print Order List (NZ) → Manual Picking (when flagged on) → Move Order/Line from OSR (eStore).

#### Realtime Performance (Indicators tab)
- Items Per Labour Hour and RF Pick Rate gauges' "Target" badge and gauge target band/tick/label (overall + per-zone) are now CFC-only via `useStore().isCFC`, hidden for Supermarket and eStore.

### [2026-09-03] — Distribution note
**Note:**
- v1.7 local distribution share generated after Session 52 (`dist/anz-ecf-union-v-1-7.html`, via `npm run build:share`). Sessions from this point forward will each get their own dated changelog entry again, until the next local share prompts another version increment.
- Order Summary (/order-summary) — new B2B order flag filterable via Filters/options; Filters/options popover widened/wraps and its trigger button inverts colour when active; added a Clear button for selected flags; session/window hold icon stays legible (white) on warning/exceeded rows; expand/collapse-all icon now matches session/window chevrons; Specialty items tooltip copy updated.
