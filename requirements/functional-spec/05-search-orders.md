# 05 — Search Orders

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** the Search Orders route as one inventory. The pre-search and post-search measurements are component states of the same screen: the results table is not rendered until Search is clicked.

## A. Purpose & context
- **User goal:** find orders by known identifiers, customer details, fraud reference, status and date range, then inspect the matching order set.
- **Entry points:** global navigation target `#/search-orders`.
- **Exit points / next actions:** activate Search, reset filters, open matching order details from the results table.

## A1. What this screen depends on, and where its data comes from

### Depends on — build these first
- `01` Global App Shell for route mounting, global navigation and inherited content cap.
- `03a` Order Details Shell for result-row navigation outcomes.

### Fixture data — for verification only, never for production
- Measured screen keys: `search-orders-prefilter` and `search-orders-results`.
- At 1440px the pre-search state has no table and content cap height 425px. After Search, the results table renders 314 body rows, starts at y=551px and measures 1406px × 10507px.
- Search fixture values, customer names, order numbers and date examples are mock data and must not ship.

## B1. Page composition & region map

| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `SRCH.RGN-01` | shell-provided route mount | Starts below global header at y=68px; measured 1440px main height is 2300px before search and 11003px with results. | `SRCH.RGN-02` |
| `SRCH.RGN-02` | content cap | Inherits global cap; measured x=24px, y=68px, w=1392px. | `SRCH.RGN-03`, `SRCH.RGN-04`, `SRCH.RGN-05` |
| `SRCH.RGN-03` | search criteria panel | Contains route title, criteria fields, status/date controls, Search and Reset Filters. | `SRCH.CMP-01` through `SRCH.CMP-07` |
| `SRCH.RGN-04` | results panel | Not rendered until Search is clicked; contains the results table in post-search state. | `SRCH.CMP-08`, `SRCH.CMP-09` |
| `SRCH.RGN-05` | portal overlay layer | Date picker and select panels. | `SRCH.CMP-05`, `SRCH.CMP-06` |

- **Width model:** inherits `01` global content cap; results table measures wider than the cap content width and participates in the route's horizontal table layout.
- **Region state variance:** `SRCH.RGN-04` is absent before Search and present after Search.
- **Prototype symbol(s):** `search-orders-prefilter`, `search-orders-results`.

## B2. Component inventory

| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `SRCH.CMP-01` | Route title | heading | `SRCH.RGN-03` | Renders `Search Orders`. |
| `SRCH.CMP-02` | Search by field group | form field group | `SRCH.RGN-03` | Identifier/customer/fraud search criteria. |
| `SRCH.CMP-03` | Status selector | custom select | `SRCH.RGN-03` / `SRCH.RGN-05` | Opens status options. |
| `SRCH.CMP-04` | Date-range preset selector | custom select | `SRCH.RGN-03` / `SRCH.RGN-05` | Opens preset options including Today/Yesterday/ranges. |
| `SRCH.CMP-05` | Beginning date picker | date popover | `SRCH.RGN-03` / `SRCH.RGN-05` | Calendar panel at x=614px, y=400px. |
| `SRCH.CMP-06` | Ending date picker | date popover | `SRCH.RGN-03` / `SRCH.RGN-05` | Calendar panel at x=921px, y=400px. |
| `SRCH.CMP-07` | Search and reset actions | button group | `SRCH.RGN-03` | `Search`, `Reset Filters`. |
| `SRCH.CMP-08` | Results table | table | `SRCH.RGN-04` | Not rendered until Search. |
| `SRCH.CMP-09` | Result row interaction | row / selection state | `SRCH.CMP-08` | Hover and selected states measured after Search. |

## C0. Context-variant matrix

| Context | Values | What changes on this screen |
|---|---|---|
| Search execution | before Search · after Search | Before Search, no results table renders. After Search, the 314-row results table renders below the criteria panel. |
| Status filter | all · Awaiting Pick · Deleted · Dispatched · Packed · Picking | Status select panel renders these measured options. Default and permission rules are open. |
| Date preset | Today · Yesterday · Last Week · Last Fortnight · Last Month · Last 3 Months · Last 6 Months · Last Year | Date preset select panel renders these measured options. Allowed range and default are open. |
| Country/store/persona | shell-selected values | No search-specific context variance was measured beyond inherited shell identity. |
| Date / time | beginning date · ending date | Two measured date popovers open for the range boundaries. Timezone and inclusivity are open. |

## C. Component specifications

### `SRCH.CMP-01` — Route title
- **Purpose / reflects:** identifies the Search Orders route.
- **Business rules:** route title copy is fixed unless PM renames the feature.
- **Data shown:** `Search Orders`.
- **Structure & placement:** top of search criteria panel.
- **Open state (overlays only):** n/a.
- **Render — per data field:** text heading.
- **States — all four tiers:** Record: default only. Component: static. Context: unchanged. Temporal: n/a.
- **Design requirement:** The search task must be clearly separated from summary browsing so users know they are constructing a query.
- **Source:** `routeTitle` · product navigation configuration · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none.
- **UX/UI:** Library §4.1 — route-heading recipe..
- **Acceptance:** GIVEN Search Orders is mounted, THEN the route title renders above criteria controls.
- **Prototype symbol(s):** `search-orders-*` visible literals.

### `SRCH.CMP-02` — Search by field group
- **Purpose / reflects:** accepts typed search criteria.
- **Business rules:** minimum query length, allowed combinations, exact/partial matching and fraud-reference behavior are open.
- **Data shown:** measured labels include `Search by`, `Order No/Transit code`, `Article No/Barcode`, `Customer name`, `Customer number`, `Fraud reference`.
- **Structure & placement:** form field group inside `SRCH.RGN-03`.
- **Open state (overlays only):** n/a.
- **Render — per data field:** labels render beside/above input fields; exact input recipe requires UX extraction.
- **States — all four tiers:** Record: empty criteria by default. Component: focus/filled/error states open. Context: no measured context variance. Temporal: n/a.
- **Design requirement:** Criteria labels must make the searchable identifiers explicit so users can choose the narrowest known key before running a broad search.
- **Source:** query values · user input; matching fields · OMS/search index · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** IF criteria are entered THEN Search uses them according to PM-defined matching rules.
- **UX/UI:** Library §4.5 — form-field and criteria-group recipe..
- **Acceptance:** GIVEN the criteria panel is visible, THEN each measured search-by option is represented as an input criterion.
- **Prototype symbol(s):** `search-orders-prefilter` literals.

### `SRCH.CMP-03` — Status selector
- **Purpose / reflects:** filters search results by order status.
- **Business rules:** default status, whether Deleted is visible to all roles and how multiple statuses are handled are open.
- **Data shown:** `all`; open panel options: `All statuses`, `Awaiting Pick`, `Deleted`, `Dispatched`, `Packed`, `Picking`.
- **Structure & placement:** custom select in criteria panel; open panel measured at x=267px, y=154px, w=283px, h=224px.
- **Open state (overlays only):** portal/custom select panel with 6 interactive options.
- **Render — per data field:** selected status renders in trigger; options render as selectable rows.
- **States — all four tiers:** Record: selected status. Component: closed/open/focus. Context: role visibility open. Temporal: n/a.
- **Design requirement:** Status filtering must be available before the query runs so users can reduce result volume without post-processing the table.
- **Source:** `statusFilter` · user input; order status · OMS · ⚠ Eng to source.
- **Motion — axis 6:** select enter/exit travels for 150ms with easing ease per Library §0.7 and §4.6.
- **Interactions:** IF a status option is selected THEN it constrains the next Search request.
- **UX/UI:** Library §4.6 — custom-select recipe..
- **Acceptance:** GIVEN the status selector is opened, THEN all six measured options render in the panel.
- **Prototype symbol(s):** `search-orders-*/select#0`.

### `SRCH.CMP-04` — Date-range preset selector
- **Purpose / reflects:** chooses a relative date range.
- **Business rules:** inclusive/exclusive endpoints, timezone and maximum range are open.
- **Data shown:** `Today`; options include `Yesterday`, `Last Week`, `Last Fortnight`, `Last Month`, `Last 3 Months`, `Last 6 Months`, `Last Year`.
- **Structure & placement:** custom select in criteria panel; panel measured at x=267px, y=358px, w=283px, h=296px.
- **Open state (overlays only):** portal/custom select panel with 8 interactive options.
- **Render — per data field:** selected preset renders in trigger; options render as selectable rows.
- **States — all four tiers:** Record: selected preset. Component: closed/open/focus. Context: none measured. Temporal: date rollover open.
- **Design requirement:** Preset ranges must reduce repetitive date entry while still exposing the concrete date boundaries.
- **Source:** `datePreset` · user input; calendar rules · product configuration · ⚠ Eng to source.
- **Motion — axis 6:** select enter/exit travels for 150ms with easing ease per Library §0.7 and §4.6.
- **Interactions:** IF a preset is selected THEN beginning and ending date fields update according to date rules.
- **UX/UI:** Library §4.6 — custom-select recipe..
- **Acceptance:** GIVEN the preset selector is opened, THEN the measured date-range options render.
- **Prototype symbol(s):** `search-orders-*/select#1`.

### `SRCH.CMP-05` — Beginning date picker
- **Purpose / reflects:** lower boundary of the search date range.
- **Business rules:** boundary inclusivity and timezone are open.
- **Data shown:** `Beginning 12:00 am on`, fixture date `Mon 7 September 2026`.
- **Structure & placement:** date trigger in criteria panel; open calendar panel x=614px, y=400px, w=212px, h=305px.
- **Open state (overlays only):** 40 literal calendar panel, 38 interactive elements.
- **Render — per data field:** selected date renders as trigger text; month/day grid renders in the panel.
- **States — all four tiers:** Record: selected beginning date. Component: closed/open/selected day. Context: none measured. Temporal: date rollover open.
- **Design requirement:** Beginning boundary must be visible beside the ending boundary so users understand the exact query window.
- **Source:** `fromDate` · user input; calendar configuration · ⚠ Eng to source.
- **Motion — axis 6:** date-popover enter/exit travels for 100ms with easing ease per Library §0.7 and §4.8.b.
- **Interactions:** IF a date is selected THEN `fromDate` updates and the pending query range changes.
- **UX/UI:** Library §4.8 — date-picker recipe..
- **Acceptance:** GIVEN the beginning date trigger is opened, THEN the measured calendar panel appears at the recorded position.
- **Prototype symbol(s):** `search-orders-*/popover#0`.

### `SRCH.CMP-06` — Ending date picker
- **Purpose / reflects:** upper boundary of the search date range.
- **Business rules:** boundary inclusivity, invalid range handling and timezone are open.
- **Data shown:** `Ending 11:59 pm on`, fixture date `Mon 7 September 2026`.
- **Structure & placement:** date trigger in criteria panel; open calendar panel x=921px, y=400px, w=212px, h=305px.
- **Open state (overlays only):** 40 literal calendar panel, 38 interactive elements.
- **Render — per data field:** selected date renders as trigger text; month/day grid renders in the panel.
- **States — all four tiers:** Record: selected ending date. Component: closed/open/selected day/error pending. Context: none measured. Temporal: date rollover open.
- **Design requirement:** Ending boundary must make the query range explicit so results can be interpreted against the selected pickup/order window.
- **Source:** `toDate` · user input; calendar configuration · ⚠ Eng to source.
- **Motion — axis 6:** date-popover enter/exit travels for 100ms with easing ease per Library §0.7 and §4.8.b.
- **Interactions:** IF a date is selected THEN `toDate` updates and invalid-range rules re-evaluate.
- **UX/UI:** Library §4.8 — date-picker recipe..
- **Acceptance:** GIVEN the ending date trigger is opened, THEN the measured calendar panel appears at the recorded position.
- **Prototype symbol(s):** `search-orders-*/popover#1`.

### `SRCH.CMP-07` — Search and reset actions
- **Purpose / reflects:** execute or clear the query.
- **Business rules:** validation before Search, reset defaults and loading/error behavior are open.
- **Data shown:** `Search`, `Reset Filters`.
- **Structure & placement:** action controls at the end of search criteria panel.
- **Open state (overlays only):** n/a.
- **Render — per data field:** actions render as buttons/controls.
- **States — all four tiers:** Record: current criteria. Component: default/focus/disabled/loading open. Context: none measured. Temporal: n/a.
- **Design requirement:** Query execution and reset must be adjacent to criteria so users can confidently run or clear a search without scanning elsewhere.
- **Source:** criteria state · client interaction; search results · OMS/search index · ⚠ Eng to source.
- **Motion — axis 6:** none measured.
- **Interactions:** IF Search is clicked THEN `SRCH.RGN-04` renders with results. IF Reset Filters is clicked THEN criteria return to PM-defined defaults.
- **UX/UI:** Library §4.2 — action-button recipe..
- **Acceptance:** GIVEN criteria are present, WHEN Search is activated, THEN results render below the criteria panel.
- **Prototype symbol(s):** `search-orders-*` base click-trigger count.

### `SRCH.CMP-08` — Results table
- **Purpose / reflects:** matching orders for the submitted search.
- **Business rules:** result ordering, pagination/virtualisation, maximum result count and no-results behavior are open.
- **Data shown:** headers: `Store`, `Session`, `Pickup Date`, `P`, `B`, `S`, `A`, `F`, `Order No`, `Routing`, `Customer`, `Status`, `Totes Picked`, `Lines`, `Articles`.
- **Structure & placement:** not rendered pre-search; post-search table at x=17px, y=551px, w=1406px, h=10507px; 314 body rows; cell padding 6px 8px; font 14px/20px; row height 33px.
- **Open state (overlays only):** n/a; row tooltips follow shared tooltip recipe.
- **Render — per data field:** each header renders in the order listed; order identifiers render as strings.
- **States — all four tiers:** Record: matching rows. Component: absent before Search, present after Search, row hover/selected measured. Context: inherited country/store/persona. Temporal: result staleness open.
- **Design requirement:** Search results must appear only after deliberate query execution so users can distinguish default criteria from a returned result set.
- **Source:** `searchResults` and listed row fields · OMS/search index · ⚠ Eng to source.
- **Motion — axis 6:** none measured for table mount; loading transition open.
- **Interactions:** IF a result row is activated THEN Order Details opens for that order.
- **UX/UI:** Library §4.9 — search-results table recipe..
- **Acceptance:** GIVEN Search has not been activated, THEN the results table is not rendered. GIVEN Search has returned results, THEN the 15-column table renders below the criteria panel.
- **Prototype symbol(s):** `search-orders-results` table record.

### `SRCH.CMP-09` — Result row interaction
- **Purpose / reflects:** row-level selection/activation state in results.
- **Business rules:** row activation target, selection support and disabled rows are open.
- **Data shown:** hover/selected treatment and row data from `SRCH.CMP-08`.
- **Structure & placement:** row behavior inside the results table.
- **Open state (overlays only):** n/a.
- **Render — per data field:** hover/selected styling applies to row; exact recipe requires state-census extraction.
- **States — all four tiers:** Record: row result. Component: hover and selected measured after Search. Context: inherited. Temporal: n/a.
- **Design requirement:** Row interaction must give immediate visual feedback so users can confidently open the intended order from a dense result set.
- **Source:** row interaction state · client; order route target · OMS · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** IF a row is activated THEN navigate to the corresponding Order Details route.
- **UX/UI:** Library §4.9, §4.11 — row hover/selected recipe..
- **Acceptance:** GIVEN results are rendered, WHEN a result row is hovered or selected, THEN the measured row state treatment appears.
- **Prototype symbol(s):** `search-orders-results` state-census row records.

## D. Screen-level conditions, permissions & edge cases
- Pre-search and post-search are component states, not separate screen documents.
- Empty results, loading, search failure, invalid date ranges and over-large result sets are open.
- Search criteria persistence after leaving and returning to the route is open.

## E. Open questions (for PM/Design/Eng to resolve)

- ⚠ OPEN — PM: What validation is required before Search can run?
- ⚠ OPEN — PM: What are the no-results, loading and search-failure states?
- ⚠ OPEN — PM: What result ordering, maximum result size and pagination/virtualisation rules apply?
- ⚠ OPEN — Eng: Which search/index systems own each criterion and returned row field?
- ⚠ OPEN — Design Systems: extract search form, custom select, date picker and results-table recipes.

## F. Render-parity checklist

| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `SRCH.CMP-01` | ⚠ | n/a | ⚠ | n/a | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `SRCH.CMP-02` | ⚠ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `SRCH.CMP-03` | ✅ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ✅ | ⚠ | ✅ |
| `SRCH.CMP-04` | ✅ | n/a | n/a | ⚠ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `SRCH.CMP-05` | ✅ | n/a | n/a | ⚠ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `SRCH.CMP-06` | ✅ | n/a | n/a | ⚠ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `SRCH.CMP-07` | ⚠ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `SRCH.CMP-08` | ✅ | ⚠ | ⚠ | ✅ | ✅ | ✅ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ✅ |
| `SRCH.CMP-09` | ⚠ | ⚠ | n/a | ✅ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |

## G. Coverage reconciliation

| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| `search-orders-prefilter` route mount | `SRCH.RGN-01` | |
| `search-orders-results` route mount | `SRCH.RGN-01` | state after Search |
| search criteria panel | `SRCH.RGN-03` | |
| results panel/table | `SRCH.RGN-04`, `SRCH.CMP-08` | not rendered until Search |
| select/date overlays | `SRCH.RGN-05`, `SRCH.CMP-03` through `SRCH.CMP-06` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.