# 10 — Reports

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** the rendered Reports route placeholder. This route is in scope because it is navigable and renders real placeholder copy; it is not an out-of-scope route.

## A. Purpose & context
- **User goal:** reach the future Reports surface from global navigation.
- **Entry points:** global navigation target `#/reports`.
- **Exit points / next actions:** none measured beyond global navigation.

## A1. What this screen depends on, and where its data comes from

### Depends on — build these first
- `01` Global App Shell for header, navigation and route mount.

### Fixture data — for verification only, never for production
- Measured screen key: `reports`; label: `Reports (scaffold)`.
- At 1440px the route renders no table, no route-specific overlays and no route-specific buttons. Measured visible route copy includes `Reports`.

## B1. Page composition & region map

| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `RPT.RGN-01` | shell-provided route mount | Starts below global header at y=68px; measured main box 1440px × 2300px. | `RPT.RGN-02` |
| `RPT.RGN-02` | content cap | x=24px, y=92px, w=1392px, h=1440px at 1440px viewport. | `RPT.CMP-01`, `RPT.CMP-02` |

- **Width model:** inherits `01` global content cap.
- **Region state variance:** none measured.
- **Prototype symbol(s):** `reports` in measured census outputs.

## B2. Component inventory

| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `RPT.CMP-01` | Reports title | heading | `RPT.RGN-02` | Renders `Reports`. |
| `RPT.CMP-02` | Reports placeholder state | placeholder / empty scaffold | `RPT.RGN-02` | No production report content is rendered in the prototype. |

## C0. Context-variant matrix

| Context | Values | What changes on this screen |
|---|---|---|
| Route status | scaffold placeholder | Reports renders only the route title and shell context in the measured prototype. |
| Persona/store/country | shell-selected values | No Reports-specific differences measured. |
| Date / time | n/a | No time-based route content measured. |
| Feature toggles | reporting capability availability | Which reports exist and how they launch is open. |

## C. Component specifications

### `RPT.CMP-01` — Reports title
- **Purpose / reflects:** identifies the Reports route.
- **Business rules:** title remains only if Reports remains a production route.
- **Data shown:** `Reports`.
- **Structure & placement:** top of route content cap.
- **Open state (overlays only):** n/a.
- **Render — per data field:** text heading.
- **States — all four tiers:** Record: default. Component: static. Context: unchanged. Temporal: n/a.
- **Design requirement:** A scaffold route must visibly identify itself so a user can distinguish a deliberately incomplete surface from a failed load.
- **Source:** `routeTitle` · product navigation configuration · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none.
- **UX/UI:** Library §4.1 — route-heading recipe..
- **Acceptance:** GIVEN the Reports route is mounted, THEN `Reports` renders in the route content.
- **Prototype symbol(s):** `reports` visible literals.

### `RPT.CMP-02` — Reports placeholder state
- **Purpose / reflects:** absence of implemented report content in the prototype.
- **Business rules:** Do not treat this absence as production behavior. PM must define which reports exist, who may run them, and whether outputs are screen reports, exports or printed documents.
- **Data shown:** no report-specific body copy was measured beyond the title.
- **Structure & placement:** route content area under the title; no table, cards, filters or overlays measured.
- **Open state (overlays only):** n/a.
- **Render — per data field:** no data fields render.
- **States — all four tiers:** Record: scaffold empty. Component: static empty area. Context: no measured variance. Temporal: n/a.
- **Design requirement:** The missing report inventory must be named as an open product decision, not silently omitted, because the route is visible in navigation.
- **Source:** n/a — report inventory not present in prototype; ⚠ Eng/PM to source once defined.
- **Motion — axis 6:** none.
- **Interactions:** none measured.
- **UX/UI:** Library §4.4, §4.11 — placeholder/empty-route recipe if a scaffold state remains..
- **Acceptance:** GIVEN production Reports is built, THEN it does not ship as an unexplained blank route.
- **Prototype symbol(s):** `reports` table and overlay counts are zero.

## D. Screen-level conditions, permissions & edge cases
- Reports is in scope because it is a navigable route.
- Report catalogue, permissions, loading, empty, export and failure states are open.
- If report output creates printed/exported artifacts, those artifacts must be owned by `09` or by a new flow document rather than buried in this placeholder spec.

## E. Open questions (for PM/Design/Eng to resolve)

- ⚠ OPEN — PM: Which reports must exist for the first production release?
- ⚠ OPEN — PM: Which roles may view and run each report?
- ⚠ OPEN — Eng: Which reporting platform or data source owns report generation and delivery?
- ⚠ OPEN — Design Systems: extract title and empty/scaffold route recipes if placeholder states remain.

## F. Render-parity checklist

| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `RPT.CMP-01` | ⚠ | n/a | ⚠ | n/a | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `RPT.CMP-02` | ⚠ | n/a | n/a | n/a | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |

## G. Coverage reconciliation

| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| `reports` route mount | `RPT.RGN-01` | |
| Reports content cap | `RPT.RGN-02` | |
| `Reports` title | `RPT.CMP-01` | |
| empty/scaffold content area | `RPT.CMP-02` | Product report inventory is open, not out of scope. |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.