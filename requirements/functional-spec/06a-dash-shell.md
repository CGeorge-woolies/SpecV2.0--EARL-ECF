# 06a — Dash Shell

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** Dash route shell, tab strip, shared title/refresh/header effects and launch contracts for Dash tabs. Indicator and Timeline tab content are owned by `06b` and `06c`.

## A. Purpose & context
- **User goal:** view real-time performance through Dash tabs without losing the route-level controls.
- **Entry points:** global navigation target `#/dash`.
- **Exit points / next actions:** switch between Indicators and Timeline; refresh Dash data; leave through global navigation.

## A1. What this screen depends on, and where its data comes from

### Depends on — build these first
- `01` Global App Shell for navigation, content cap and shell offset.
- `06b` Dash: Indicators tab and `06c` Dash: Timeline tab for tab content inventories.

### Fixture data — for verification only, never for production
- Measured screen keys: `dash-indicators`, `dash-timeline`.
- At 1440px both states share the same shell route; Indicators content cap height is 939px and Timeline content cap height is 1278px.

## B1. Page composition & region map

| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `DASHSH.RGN-01` | shell-provided route mount | Starts below header at y=68px; measured main box 1440px × 2300px. | `DASHSH.RGN-02` |
| `DASHSH.RGN-02` | content cap | x=24px, y=68px, w=1392px. | `DASHSH.RGN-03`, `DASHSH.RGN-04` |
| `DASHSH.RGN-03` | Dash route toolbar | Owns title, tab strip and refresh. | `DASHSH.CMP-01` through `DASHSH.CMP-03` |
| `DASHSH.RGN-04` | active tab mount | Contains either Indicators or Timeline tab content. | launch contract to `06b` or `06c` |

- **Width model:** inherits global content cap.
- **Region state variance:** active tab changes the content mounted below the toolbar; shell remains present.
- **Prototype symbol(s):** `dash-indicators`, `dash-timeline`.

## B2. Component inventory

| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `DASHSH.CMP-01` | Dash title | heading | `DASHSH.RGN-03` | Renders `Real Time Performance`. |
| `DASHSH.CMP-02` | Dash tab strip | tabs | `DASHSH.RGN-03` | Renders `Indicators` and `Timeline`. |
| `DASHSH.CMP-03` | Dash refresh action | button | `DASHSH.RGN-03` | Renders `Refresh`. |
| `DASHSH.CMP-04` | Active tab mount | tab panel launcher | `DASHSH.RGN-04` | Owns launch contract only. |

## C0. Context-variant matrix

| Context | Values | What changes on this screen |
|---|---|---|
| Active tab | Indicators · Timeline | Tab strip active state changes; active tab mount switches between `06b` and `06c`. |
| Date / time | last refreshed timestamp | Measured literal includes `Last refreshed` and fixture times around 9:31 AM. Refresh cadence is open. |
| Store/persona/country | shell-selected values | Dash-specific context changes are not fully ruled by prototype; CFC/zone values render in tab content. |
| Feature toggles | n/a measured | No Dash shell feature toggles measured. |

## C. Component specifications

### `DASHSH.CMP-01` — Dash title
- **Purpose / reflects:** identifies the Dash route.
- **Business rules:** production name for the route is open if PM changes `Real Time Performance`.
- **Data shown:** `Real Time Performance`.
- **Structure & placement:** top of Dash toolbar.
- **Open state (overlays only):** n/a.
- **Render — per data field:** heading text.
- **States — all four tiers:** Record: default. Component: static. Context: unchanged across tabs. Temporal: n/a.
- **Design requirement:** Dash must be clearly titled so performance data is not confused with order-list data.
- **Source:** `routeTitle` · product navigation configuration · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none.
- **UX/UI:** Library §4.1 — route-heading recipe..
- **Acceptance:** GIVEN Dash is mounted, THEN `Real Time Performance` renders above the active tab.
- **Prototype symbol(s):** `dash-*` visible literals.

### `DASHSH.CMP-02` — Dash tab strip
- **Purpose / reflects:** selects the active Dash inventory.
- **Business rules:** default tab is Indicators in the measured prototype; whether deep links preserve active tab is open.
- **Data shown:** `Indicators`, `Timeline`.
- **Structure & placement:** tab strip in route toolbar; active tab panel mounted below.
- **Open state (overlays only):** n/a.
- **Render — per data field:** two tab labels; active treatment requires UX extraction.
- **States — all four tiers:** Record: n/a. Component: active/inactive/focus. Context: active tab. Temporal: n/a.
- **Design requirement:** Tabs must keep the performance route stable while changing only the dashboard inventory below them.
- **Source:** `dashTabs` · product navigation configuration · ⚠ Eng to source.
- **Motion — axis 6:** none measured for tab change.
- **Interactions:** IF Indicators is selected THEN mount `06b`. IF Timeline is selected THEN mount `06c`.
- **UX/UI:** Library §4 — tab-strip recipe..
- **Acceptance:** GIVEN the Timeline tab is selected, THEN Timeline content replaces Indicators without changing global shell navigation.
- **Prototype symbol(s):** `dash-indicators`, `dash-timeline` literals.

### `DASHSH.CMP-03` — Dash refresh action
- **Purpose / reflects:** requests updated performance data.
- **Business rules:** refresh cadence, stale threshold, loading and failure handling are open.
- **Data shown:** `Refresh`, `Last refreshed`.
- **Structure & placement:** toolbar action shared by both tabs.
- **Open state (overlays only):** n/a.
- **Render — per data field:** action label and refreshed timestamp treatment require UX extraction.
- **States — all four tiers:** Record: current refresh state. Component: focus/loading/disabled open. Context: both tabs. Temporal: data staleness open.
- **Design requirement:** Refresh must apply at the Dash route level so both tabs share one understanding of data recency.
- **Source:** `lastRefreshedAt`, `refreshStatus` · performance telemetry / fulfilment operations · ⚠ Eng to source.
- **Motion — axis 6:** none measured.
- **Interactions:** IF activated THEN refresh Dash data for the selected context.
- **UX/UI:** Library §4.2 — toolbar button and timestamp recipe..
- **Acceptance:** GIVEN either Dash tab is active, WHEN Refresh is activated, THEN Dash data refreshes for that context.
- **Prototype symbol(s):** Dash visible literals.

### `DASHSH.CMP-04` — Active tab mount
- **Purpose / reflects:** contains the currently selected tab document.
- **Business rules:** tab content ownership stays with the tab specs.
- **Data shown:** none directly.
- **Structure & placement:** below route toolbar.
- **Open state (overlays only):** n/a.
- **Render — per data field:** n/a.
- **States — all four tiers:** Record: n/a. Component: active tab. Context: Indicators/Timeline. Temporal: n/a.
- **Design requirement:** The tab mount must isolate tab inventories so shell controls do not drift between tab specs.
- **Source:** n/a — structural.
- **Motion — axis 6:** none measured.
- **Interactions:** IF active tab changes THEN replace the mounted tab content.
- **UX/UI:** Library §0.5 and §4.11 — structural route scaffold and measured scroll/focus state recipes.
- **Acceptance:** GIVEN the active tab changes, THEN only the active tab content changes.
- **Prototype symbol(s):** measured Dash tab screens.

## D. Screen-level conditions, permissions & edge cases
- Dash shell owns the tab strip and refresh only; tab tables and metrics are not copied here.
- Data staleness, unavailable telemetry, empty Dash data and permission-denied behavior are open.

## E. Open questions (for PM/Design/Eng to resolve)

- ⚠ OPEN — PM: What refresh cadence and stale-data threshold apply to Dash?
- ⚠ OPEN — PM: Which tab is default and should active tab be linkable/bookmarkable?
- ⚠ OPEN — Eng: Which telemetry or fulfilment systems own Dash values?
- ⚠ OPEN — Design Systems: extract route tabs, toolbar refresh and timestamp recipes.

## F. Render-parity checklist

| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `DASHSH.CMP-01` | ⚠ | n/a | ⚠ | n/a | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `DASHSH.CMP-02` | ⚠ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `DASHSH.CMP-03` | ⚠ | n/a | n/a | ⚠ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `DASHSH.CMP-04` | ✅ | n/a | n/a | n/a | n/a | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | n/a | ✅ | ✅ |

## G. Coverage reconciliation

| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| `dash-*` route mount | `DASHSH.RGN-01` | |
| Dash toolbar/title/tabs | `DASHSH.RGN-03`, `DASHSH.CMP-01` through `DASHSH.CMP-03` | |
| Indicators tab content | `DASHSH.CMP-04` launch to `06b` | |
| Timeline tab content | `DASHSH.CMP-04` launch to `06c` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.