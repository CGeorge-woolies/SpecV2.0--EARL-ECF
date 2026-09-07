# 06b — Dash: Indicators Tab

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** Indicators tab content inside the Dash route. Dash title, tab strip and refresh are owned by `06a`.

## A. Purpose & context
- **User goal:** review real-time operational indicators for trucks, team members, totes, pick rate and zone status.
- **Entry points:** `06a` Dash shell with Indicators tab active.
- **Exit points / next actions:** switch to Timeline; refresh through `06a`; global navigation.

## A1. What this screen depends on, and where its data comes from

### Depends on — build these first
- `01` Global App Shell.
- `06a` Dash Shell for route title, tab strip and refresh.

### Fixture data — for verification only, never for production
- Measured screen key: `dash-indicators`.
- At 1440px two `Description` / `Value` tables render: 3 rows at x=937px, y=196px, w=398px, h=149px; 5 rows at x=937px, y=692px, w=398px, h=225px.

## B1. Page composition & region map

| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `DASHIND.RGN-01` | Indicators tab mount | Mounted inside `06a` active tab region. | `DASHIND.RGN-02`, `DASHIND.RGN-03` |
| `DASHIND.RGN-02` | indicator visual/grid region | Contains metric/zone indicator content measured as literals. | `DASHIND.CMP-01`, `DASHIND.CMP-02` |
| `DASHIND.RGN-03` | description/value table column | Right-side table region. | `DASHIND.CMP-03`, `DASHIND.CMP-04` |

- **Width model:** inherits Dash shell content cap; tables measure 398px wide at x=937px.
- **Region state variance:** row hover measured for indicator tables; no disclosure or overlay measured.
- **Prototype symbol(s):** `dash-indicators`.

## B2. Component inventory

| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `DASHIND.CMP-01` | Operational indicator set | metrics/status content | `DASHIND.RGN-02` | Renders Actual/Estimated/Target and operational labels. |
| `DASHIND.CMP-02` | Picking-zone status content | status/zone content | `DASHIND.RGN-02` | Renders Ambient, Chilled, Frozen, Security and status labels. |
| `DASHIND.CMP-03` | Truck/team summary table | table | `DASHIND.RGN-03` | 3 rows, headers `Description`, `Value`. |
| `DASHIND.CMP-04` | Secondary summary table | table | `DASHIND.RGN-03` | 5 rows, headers `Description`, `Value`. |

## C0. Context-variant matrix

| Context | Values | What changes on this screen |
|---|---|---|
| Active tab | Indicators | This inventory renders only when Indicators is active in `06a`. |
| Operational zone | Ambient · Chilled · Frozen · Security | Zone labels render in the indicator content. Zone definitions and ordering are open. |
| Time | Last refreshed time | Fixture time renders; refresh cadence and stale behavior are open. |
| Store/persona/country | shell-selected values | Context-specific KPI rules are open. |

## C. Component specifications

### `DASHIND.CMP-01` — Operational indicator set
- **Purpose / reflects:** current operational performance metrics.
- **Business rules:** definitions and thresholds for Actual, Estimated, Target, RF Pick Rate and Items Per Labour Hour are open.
- **Data shown:** measured literals include `Actual`, `Estimated`, `Target`, `RF Pick Rate`, `Items Per Labour Hour`, `Estimated Picking End Time`.
- **Structure & placement:** main indicator region left of the right-side tables.
- **Open state (overlays only):** n/a.
- **Render — per data field:** metric labels and values render as indicator content; exact visual recipe requires UX extraction.
- **States — all four tiers:** Record: KPI values. Component: default; no overlay. Context: selected store/zone. Temporal: KPI refresh/staleness open.
- **Design requirement:** Indicators must present key operational values as a scannable summary before the user reads supporting tables.
- **Source:** KPI fields · real-time performance / fulfilment telemetry · ⚠ Eng to source.
- **Motion — axis 6:** none measured.
- **Interactions:** none measured inside the component.
- **UX/UI:** Library §4.3, §4.4 — KPI indicator recipe..
- **Acceptance:** GIVEN Indicators is active, THEN the measured KPI labels render in the indicator region.
- **Prototype symbol(s):** `dash-indicators` visible literals.

### `DASHIND.CMP-02` — Picking-zone status content
- **Purpose / reflects:** picking status by operational zone.
- **Business rules:** zone taxonomy, status thresholds and colour/status maps are open.
- **Data shown:** `Ambient`, `Chilled`, `Frozen`, `Security`, `Awaiting Pick`, `Picking`, `Packed`, `Unassigned`.
- **Structure & placement:** indicator content region.
- **Open state (overlays only):** n/a.
- **Render — per data field:** zones and statuses render as labelled visual content; exact state map requires inline extraction.
- **States — all four tiers:** Record: zone status. Component: default. Context: store type/zone. Temporal: status ageing open.
- **Design requirement:** Zone status must make workload distribution visible without requiring users to inspect individual orders.
- **Source:** `zoneStatus` · fulfilment telemetry / store operations · ⚠ Eng to source.
- **Motion — axis 6:** none measured.
- **Interactions:** none measured.
- **UX/UI:** Library §4.3 — zone-status recipe and semantic map..
- **Acceptance:** GIVEN zone data is available, THEN each measured zone/status label renders in the Indicators tab.
- **Prototype symbol(s):** `dash-indicators` visible literals.

### `DASHIND.CMP-03` — Truck/team summary table
- **Purpose / reflects:** compact description/value metrics.
- **Business rules:** row definitions and calculation rules are open.
- **Data shown:** headers `Description`, `Value`; measured related labels include `Count of Trucks`, `Total Trucks`, `Trucks Awaiting Pick`, `Trucks Picking`, `Trucks Packed`, `Trucks Dispatched`.
- **Structure & placement:** table at x=937px, y=196px, w=398px, h=149px; 3 body rows; cell padding 8px; font 14px/21px; row height 38px.
- **Open state (overlays only):** n/a.
- **Render — per data field:** description in first column, value in second column.
- **States — all four tiers:** Record: metric rows. Component: row hover measured. Context: selected store/date. Temporal: refresh/stale open.
- **Design requirement:** Description/value metrics must remain compact and aligned so users can compare counts quickly.
- **Source:** summary metric fields · performance telemetry · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** row hover measured; no activation measured.
- **UX/UI:** Library §4.9 — compact description/value table recipe..
- **Acceptance:** GIVEN Indicators is active, THEN the 3-row description/value table renders at the measured right-side position.
- **Prototype symbol(s):** `dash-indicators` first table.

### `DASHIND.CMP-04` — Secondary summary table
- **Purpose / reflects:** additional description/value metrics.
- **Business rules:** row definitions and calculation rules are open.
- **Data shown:** headers `Description`, `Value`; measured labels include `Personal Shoppers`, `Count of Team Members`, `Count of Totes`.
- **Structure & placement:** table at x=937px, y=692px, w=398px, h=225px; 5 body rows; cell padding 8px; font 14px/21px; row height 38px.
- **Open state (overlays only):** n/a.
- **Render — per data field:** description/value columns.
- **States — all four tiers:** Record: metric rows. Component: row hover measured. Context: selected store/date. Temporal: refresh/stale open.
- **Design requirement:** Secondary metrics must use the same table treatment as primary metrics so users can compare values consistently.
- **Source:** summary metric fields · performance telemetry · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** row hover measured; no activation measured.
- **UX/UI:** Library §4.9 — compact description/value table recipe..
- **Acceptance:** GIVEN Indicators is active, THEN the 5-row description/value table renders below the first table.
- **Prototype symbol(s):** `dash-indicators` second table.

## D. Screen-level conditions, permissions & edge cases
- Empty, stale, loading and error KPI states are open.
- Threshold maps for KPI/status treatment must be ruled before requirement-ready sign-off.

## E. Open questions (for PM/Design/Eng to resolve)

- ⚠ OPEN — PM: What is the source and calculation for each Dash indicator value?
- ⚠ OPEN — PM: What thresholds drive status/colour treatment for zones and KPIs?
- ⚠ OPEN — Eng: Which telemetry system owns Dash indicator refresh and values?
- ⚠ OPEN — Design Systems: extract KPI indicator, zone status and compact table recipes.

## F. Render-parity checklist

| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `DASHIND.CMP-01` | ⚠ | n/a | n/a | n/a | ✅ | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | ✅ | n/a | ⚠ | ⚠ |
| `DASHIND.CMP-02` | ⚠ | n/a | n/a | n/a | ✅ | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | ✅ | n/a | ⚠ | ⚠ |
| `DASHIND.CMP-03` | ✅ | ⚠ | ⚠ | ✅ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ⚠ | ✅ |
| `DASHIND.CMP-04` | ✅ | ⚠ | ⚠ | ✅ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ⚠ | ✅ |

## G. Coverage reconciliation

| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| `dash-indicators` active tab mount | `DASHIND.RGN-01` | |
| indicator content | `DASHIND.CMP-01`, `DASHIND.CMP-02` | |
| right-side tables | `DASHIND.CMP-03`, `DASHIND.CMP-04` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.