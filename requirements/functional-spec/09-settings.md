# 09 — Settings

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** the rendered Settings route placeholder. This route is in scope because it renders real copy; the placeholder is a do-not-build instruction until the Admin Console product decision is resolved.

## A. Purpose & context
- **User goal:** reach the future Settings/Admin Console surface from global navigation.
- **Entry points:** global navigation target `#/settings`.
- **Exit points / next actions:** none measured beyond global navigation.

## A1. What this screen depends on, and where its data comes from

### Depends on — build these first
- `01` Global App Shell for header, navigation and route mount.

### Fixture data — for verification only, never for production
- Measured screen key: `settings`; label: `Settings (scaffold)`.
- At 1440px the route renders no table, no route-specific overlays and no route-specific buttons. Measured visible route copy includes `Settings` and `Will load Admin Console MFE`.

## B1. Page composition & region map

| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `SET.RGN-01` | shell-provided route mount | Starts below global header at y=68px; measured main box 1440px × 2300px. | `SET.RGN-02` |
| `SET.RGN-02` | content cap | x=24px, y=92px, w=1392px, h=1440px at 1440px viewport. | `SET.CMP-01`, `SET.CMP-02` |

- **Width model:** inherits `01` global content cap.
- **Region state variance:** none measured.
- **Prototype symbol(s):** `settings` in measured census outputs.

## B2. Component inventory

| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `SET.CMP-01` | Settings title | heading | `SET.RGN-02` | Renders `Settings`. |
| `SET.CMP-02` | Admin Console placeholder | placeholder copy | `SET.RGN-02` | Renders `Will load Admin Console MFE`; do not build as final product copy. |

## C0. Context-variant matrix

| Context | Values | What changes on this screen |
|---|---|---|
| Route status | scaffold placeholder | The route renders placeholder copy rather than production Settings content. |
| Persona/store/country | shell-selected values | No Settings-specific differences measured. |
| Date / time | n/a | No time-based route content measured. |
| Feature toggles | Admin Console MFE availability | Whether Settings embeds or links to Admin Console is open. |

## C. Component specifications

### `SET.CMP-01` — Settings title
- **Purpose / reflects:** identifies the Settings route.
- **Business rules:** title remains only if Settings remains a route in production navigation.
- **Data shown:** `Settings`.
- **Structure & placement:** top of route content cap.
- **Open state (overlays only):** n/a.
- **Render — per data field:** text heading.
- **States — all four tiers:** Record: default. Component: static. Context: unchanged. Temporal: n/a.
- **Design requirement:** A placeholder route must still identify where the user has navigated so scaffolded functionality is not mistaken for a broken page.
- **Source:** `routeTitle` · product navigation configuration · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none.
- **UX/UI:** Library §4.1 — route-heading recipe..
- **Acceptance:** GIVEN the Settings route is mounted, THEN `Settings` renders in the route content.
- **Prototype symbol(s):** `settings` visible literals.

### `SET.CMP-02` — Admin Console placeholder
- **Purpose / reflects:** placeholder for future Admin Console integration.
- **Business rules:** Do not build this copy as final product UI. PM must decide whether Settings loads an Admin Console MFE, links to one, or is replaced by another administration surface.
- **Data shown:** `Will load Admin Console MFE`.
- **Structure & placement:** route content below/near the Settings heading; no table or overlay.
- **Open state (overlays only):** n/a.
- **Render — per data field:** placeholder sentence renders as body copy.
- **States — all four tiers:** Record: scaffold only. Component: static. Context: no measured variance. Temporal: n/a.
- **Design requirement:** Scaffold copy must be explicitly marked do-not-build so Engineering does not preserve prototype placeholder text as production behavior.
- **Source:** n/a — mock scaffolding; Admin Console ownership ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none measured.
- **UX/UI:** Library §4.4 — placeholder/body-copy recipe if a production placeholder remains..
- **Acceptance:** GIVEN production Settings is built, THEN the literal `Will load Admin Console MFE` is absent unless PM explicitly approves it as production copy.
- **Prototype symbol(s):** `settings` visible literals.

## D. Screen-level conditions, permissions & edge cases
- Placeholder content is in scope and must be replaced, not ignored.
- Access rules for Settings/Admin Console are open.
- Loading, unavailable and permission-denied states for any embedded Admin Console are open.

## E. Open questions (for PM/Design/Eng to resolve)

- ⚠ OPEN — PM: Is Settings a production route, and what administration capability must it expose?
- ⚠ OPEN — Eng: Is Admin Console delivered as an MFE, a link, or a native screen in the target platform?
- ⚠ OPEN — PM: Which roles may access Settings/Admin Console?
- ⚠ OPEN — Design Systems: extract placeholder/title recipes if scaffold states remain in the handover.

## F. Render-parity checklist

| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `SET.CMP-01` | ⚠ | n/a | ⚠ | n/a | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `SET.CMP-02` | ⚠ | n/a | n/a | n/a | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |

## G. Coverage reconciliation

| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| `settings` route mount | `SET.RGN-01` | |
| Settings content cap | `SET.RGN-02` | |
| `Settings` title | `SET.CMP-01` | |
| `Will load Admin Console MFE` placeholder | `SET.CMP-02` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.