# 06c — Dash: Timeline Tab

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** Timeline tab content inside the Dash route. Dash title, tab strip and refresh are owned by `06a`.

## A. Purpose & context
- **User goal:** inspect personal-shopper performance across operational hours.
- **Entry points:** `06a` Dash shell with Timeline tab active.
- **Exit points / next actions:** switch to Indicators; refresh through `06a`; global navigation.

## A1. What this screen depends on, and where its data comes from

### Depends on — build these first
- `01` Global App Shell.
- `06a` Dash Shell for route title, tab strip and refresh.

### Fixture data — for verification only, never for production
- Measured screen key: `dash-timeline`.
- At 1440px the timeline table renders 40 body rows, starts at x=105px, y=196px and measures 1230px × 1125px.

## B1. Page composition & region map

| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `DASHTL.RGN-01` | Timeline tab mount | Mounted inside `06a` active tab region. | `DASHTL.RGN-02` |
| `DASHTL.RGN-02` | timeline table region | Contains the personal-shopper timeline table. | `DASHTL.CMP-01`, `DASHTL.CMP-02` |

- **Width model:** inherits Dash shell content cap; table has measured x=105px and w=1230px at 1440px.
- **Region state variance:** two scroll states and row hover measured; no overlays measured.
- **Prototype symbol(s):** `dash-timeline`.

## B2. Component inventory

| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `DASHTL.CMP-01` | Personal Shopper Timeline table | table | `DASHTL.RGN-02` | 40-row timeline table. |
| `DASHTL.CMP-02` | Timeline row state | row interaction | `DASHTL.CMP-01` | Hover state measured; focus-visible not measured in projection. |

## C0. Context-variant matrix

| Context | Values | What changes on this screen |
|---|---|---|
| Active tab | Timeline | This inventory renders only when Timeline is active in `06a`. |
| Time buckets | 4am through 3pm | Timeline columns encode measured hourly buckets. |
| Picking state | picking · non picking | Row/status labels include `Non picking`; rules are open. |
| Store/persona/country | shell-selected values | Timeline source and context filtering are open. |

## C. Component specifications

### `DASHTL.CMP-01` — Personal Shopper Timeline table
- **Purpose / reflects:** personal-shopper activity and performance by hour.
- **Business rules:** row identity, time bucket calculation, RF Pick rate derivation, goal-time calculation and non-picking treatment are open.
- **Data shown:** headers: `ID`, `4am5am6am7am8am9am10am11am12pm1pm2pm3pm`, `Items/Hour`, `RF Pick rate`, `Goal Time Performance`.
- **Structure & placement:** table at x=105px, y=196px, w=1230px, h=1125px; 40 body rows; padding 4px 8px; font 12px/18px; row height 27px.
- **Open state (overlays only):** n/a; tooltip triggers measured in the table but shared tooltip recipe is owned by `01`/library.
- **Render — per data field:** ID renders in first column; time bucket cells render across the combined timeline column; performance metrics render in trailing columns.
- **States — all four tiers:** Record: shopper/activity row. Component: scroll and row hover measured. Context: selected store/date. Temporal: hourly bucket progression and stale refresh open.
- **Design requirement:** The timeline must compress many shopper-hour states into one scannable table so supervisors can compare progress across the day.
- **Source:** `shopperId`, `hourlyActivity`, `itemsPerHour`, `rfPickRate`, `goalTimePerformance` · labour/performance telemetry · ⚠ Eng to source.
- **Motion — axis 6:** none measured for table.
- **Interactions:** row hover measured; no row activation measured.
- **UX/UI:** Library §4.9 — timeline table and hourly-cell recipe..
- **Acceptance:** GIVEN Timeline is active, THEN the 40-row timeline table renders with the measured headers in order.
- **Prototype symbol(s):** `dash-timeline` table record.

### `DASHTL.CMP-02` — Timeline row state
- **Purpose / reflects:** current interaction state for a timeline row.
- **Business rules:** whether rows are selectable or only hoverable is open.
- **Data shown:** row hover treatment; row content from `DASHTL.CMP-01`.
- **Structure & placement:** row state inside timeline table.
- **Open state (overlays only):** n/a.
- **Render — per data field:** hover styling applies to the full row; exact style is measured in Library §4.11.
- **States — all four tiers:** Record: default row. Component: hover measured. Context: selected store/date. Temporal: n/a.
- **Design requirement:** Row feedback must help users track across dense hourly cells without misreading neighbouring rows.
- **Source:** client interaction state · n/a for data; row values from `DASHTL.CMP-01`.
- **Motion — axis 6:** none.
- **Interactions:** IF a row is hovered THEN measured row-hover treatment appears.
- **UX/UI:** Library §4.9, §4.11 — dense table row-hover recipe..
- **Acceptance:** GIVEN the timeline table is visible, WHEN a row is hovered, THEN the row feedback spans the row.
- **Prototype symbol(s):** `dash-timeline` state-census row records.

## D. Screen-level conditions, permissions & edge cases
- Loading, empty, unavailable telemetry and over-large shopper lists are open.
- Time-zone and day-boundary behavior for hourly buckets is open.

## E. Open questions (for PM/Design/Eng to resolve)

- ⚠ OPEN — PM: What defines each time bucket and how should non-picking time be represented?
- ⚠ OPEN — PM: What formulas drive Items/Hour, RF Pick rate and Goal Time Performance?
- ⚠ OPEN — Eng: Which labour/performance system owns shopper timeline rows?
- ⚠ OPEN — Design Systems: extract timeline table, timeline cell and dense row-hover recipes.

## F. Render-parity checklist

| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `DASHTL.CMP-01` | ✅ | ⚠ | ⚠ | ✅ | ✅ | ⚠ | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | ⚠ | ✅ |
| `DASHTL.CMP-02` | ⚠ | ⚠ | n/a | ✅ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |

## G. Coverage reconciliation

| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| `dash-timeline` active tab mount | `DASHTL.RGN-01` | |
| timeline table | `DASHTL.CMP-01` | |
| timeline row states | `DASHTL.CMP-02` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.