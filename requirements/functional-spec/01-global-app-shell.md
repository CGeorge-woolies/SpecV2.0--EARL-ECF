# 01 — Global App Shell

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** global chrome, entry gate, header, primary navigation, identity/context controls and route-level shell effects. Route-specific tables, tabs, filters, row actions and workflow dialogs are owned by their route or action specs.
>
> **Prototype baseline:** ANZ ECF Union Prototype - Version 1.7 - as at 03/09/2026 15:30.

## A. Purpose & context
- **User goal:** enter the ECF workspace with the correct store, country and persona context, then navigate between operational routes without losing the global identity and navigation frame.
- **Entry points:** initial application load before store type / country selection; direct navigation to `#/dash`, `#/order-summary`, `#/reports`, `#/search-orders` and `#/settings` once context is available.
- **Exit points / next actions:** primary navigation launches Dash, Order Summary, Reports, Search Orders and Settings. The shell provides launch points only; each route owns its page content and shell effects.

## A1. What this screen depends on, and where its data comes from

### Depends on — build these first
- The shared UX/UI pattern library entries for app header, primary navigation links, icon-only tooltip triggers, native selects, page cap and focus-visible treatment. These entries still need to be extracted from the component census before this spec is rebuild-ready.
- Route specs for the content mounted below the shell: `02` Order Summary, `05` Search Orders, `06a` Dash shell, `09` Settings and `10` Reports.

### Fixture data — for verification only, never for production
- Measured screen key: `entry-gate`; label: `Entry gate — before store type / country selected`; spec family: `shell`.
- Viewport coverage: `1024`, `1280`, `1440`, `1920`, `2560`.
- The entry-gate fixture renders 18 visible literals at 1024 and 19 visible literals at each measured viewport from 1280 through 2560; it renders no tables.
- Prototype-only explanatory text and context-driving controls are mock scaffolding that must not ship as production copy. Production authentication, store selection and persona selection rules are open product and engineering decisions.

## B1. Page composition & region map

| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `GLOB.RGN-01` | application root | Full viewport-width application root. Measured page width equals viewport width at all measured widths; measured page height is 2481px for the entry-gate state. | `GLOB.RGN-02`, `GLOB.RGN-03` |
| `GLOB.RGN-02` | global header | Fixed-height top chrome. Measured main content starts at y=68px, so downstream route specs inherit a 68px top shell offset. Header remains present on every measured screen. | `GLOB.CMP-01`, `GLOB.CMP-02`, `GLOB.CMP-03`, `GLOB.CMP-04` |
| `GLOB.RGN-03` | route mount / main | Starts below the header at y=68px; width equals viewport width. Measured entry-gate main region is 2380px high. | `GLOB.RGN-04` |
| `GLOB.RGN-04` | content cap | 24px horizontal inset from 1024 through 1920; capped at 1920px and centred at 2560. Measured boxes: 976px at 1024, 1232px at 1280, 1392px at 1440, 1872px at 1920, 1920px at 2560 with x=320. | `GLOB.CMP-05` |

- **Width model:** the shell spans the viewport; the content cap uses 24px side margins until the available width exceeds 1968px, then holds a 1920px maximum width and centres.
- **Region state variance:** the header appearance was measured on scroll and did not change. Record the scroll reaction as `none`; do not invent a stuck shadow.
- **Prototype symbol(s):** measured through `out/census/v1.json`, `out/open-census/v1.json` and `out/state-census/v1.json` screen `entry-gate`.

## B2. Component inventory

| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `GLOB.CMP-01` | Product identity | header text / brand label | `GLOB.RGN-02` | Renders `ANZ ECF Union Prototype` in the baseline. |
| `GLOB.CMP-02` | Version stamp | header metadata | `GLOB.RGN-02` | Renders `Version` and `- as at`; exact baseline string is fixture-only. |
| `GLOB.CMP-03` | Primary navigation | nav links | `GLOB.RGN-02` | Routes: `#/dash`, `#/order-summary`, `#/reports`, `#/search-orders`, `#/settings`. |
| `GLOB.CMP-04` | Header tooltip triggers | icon/link tooltips | `GLOB.RGN-02` | Six tooltip triggers measured in the entry-gate state; tooltip recipes repeat across all measured screens. |
| `GLOB.CMP-05` | Entry-gate panel | context gate / prototype notice | `GLOB.RGN-04` | Renders before store type / country selection. Contains visible button and context controls. |
| `GLOB.CMP-06` | Store type selector | native select | `GLOB.CMP-05` | One of five measured native selects in the entry-gate state. |
| `GLOB.CMP-07` | Country selector | native select | `GLOB.CMP-05` | One of five measured native selects in the entry-gate state. |
| `GLOB.CMP-08` | Persona selector | native select | `GLOB.CMP-05` | One of five measured native selects in the entry-gate state. |
| `GLOB.CMP-09` | Continue action | button | `GLOB.CMP-05` | The only measured button in the entry-gate state. |

## C0. Context-variant matrix

| Context | Values | What changes on this screen |
|---|---|---|
| Store type | Supermarket · CFC · eStore · no store type selected | The prototype uses this control to drive downstream route variants. This selector is prototype-driving scaffolding unless PM confirms it as a production control. |
| Country | AU · NZ · no country selected | The prototype uses this control to drive downstream country variants. Production source and persistence are open. |
| Persona | Store Team · Customer Support · Support Office | The prototype uses this control to expose persona-gated behavior such as the Customer Support `Edit Details` action. Production persona source and permissions are open. |
| Date / time | Baseline at 03/09/2026 15:30; rendered operational date examples include 7 September 2026 | Header/version timestamp is fixture metadata and must not become product copy. Route dates are owned by route specs. |
| Feature toggles | prototype-only context differences | The entry gate names prototype-only differences; these labels explain the fixture and must not be built as user-facing production instructions. |

## C. Component specifications

### `GLOB.CMP-01` — Product identity
- **Purpose / reflects:** identifies the application currently running.
- **Business rules:** Production product naming and environment labelling are open. The prototype name contains `Prototype` and must not be shipped as production copy.
- **Data shown:** baseline visible literal: `ANZ ECF Union Prototype`.
- **Structure & placement:** header child; inline text within the global header.
- **Open state (overlays only):** n/a.
- **Render — per data field:** product label renders as header text; no table or badge treatment.
- **States — all four tiers:**
  - *Record:* default label only measured.
  - *Component:* focus-visible is not applicable to the static label.
  - *Context:* no measured context variance in the label.
  - *Temporal:* n/a.
- **Design requirement:** The product identity remains visible while users move between routes so the operational workspace is consistently identifiable.
- **Source:** `productName` · application configuration · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none.
- **UX/UI:** Library §4 — the app-header identity recipe from component census..
- **Acceptance:** GIVEN any measured route is mounted, WHEN the shell renders, THEN the product identity remains in the header.
- **Prototype symbol(s):** `entry-gate` visible literals; shared header recipes in component census.

### `GLOB.CMP-02` — Version stamp
- **Purpose / reflects:** identifies the prototype build used for verification.
- **Business rules:** Do not build the prototype version stamp into production unless PM explicitly confirms an environment/build metadata requirement.
- **Data shown:** `Version`, `- as at`, and the fixture string `ANZ ECF Union Prototype - Version 1.7 - as at 03/09/2026 15:30`.
- **Structure & placement:** header metadata text associated with the identity area.
- **Open state (overlays only):** n/a.
- **Render — per data field:** build metadata renders as plain header text in the prototype.
- **States — all four tiers:**
  - *Record:* one fixture build version measured.
  - *Component:* static text; no focus-visible state.
  - *Context:* no measured context variance.
  - *Temporal:* n/a for production unless a live build timestamp is approved.
- **Design requirement:** Build metadata must be visibly subordinate to the application identity when it is present, so it supports verification without competing with operational navigation.
- **Source:** `buildVersion` · build metadata · ⚠ Eng to source if production metadata is required.
- **Motion — axis 6:** none.
- **Interactions:** none.
- **UX/UI:** Library §4 — the header metadata text recipe..
- **Acceptance:** GIVEN this remains a prototype artifact, WHEN production is built, THEN this exact prototype timestamp is not rendered as product copy.
- **Prototype symbol(s):** `entry-gate` visible literals.

### `GLOB.CMP-03` — Primary navigation
- **Purpose / reflects:** global route navigation.
- **Business rules:** Route availability, default route, disabled route behavior and permission gating are open product decisions. Settings and Reports remain route documents even though their current content is placeholder.
- **Data shown:** five measured route targets: `#/dash`, `#/order-summary`, `#/reports`, `#/search-orders`, `#/settings`.
- **Structure & placement:** header navigation group; links persist across every measured screen.
- **Open state (overlays only):** n/a; tooltip open states for icon/link affordances are owned by `GLOB.CMP-04`.
- **Render — per data field:** route destination is rendered as a navigable header control; active-route treatment is route-specific shell effect and must be named in each route spec.
- **States — all four tiers:**
  - *Record:* default available state measured for all five routes.
  - *Component:* focus-visible on navigation tooltip triggers measured as outline `1px auto oklab(0.708 0 0 / 0.5)` with `1px` outline offset.
  - *Context:* no measured context removal of nav routes.
  - *Temporal:* n/a.
- **Design requirement:** Primary navigation remains in a consistent header position so users can leave any route without searching inside page-specific content.
- **Source:** `navigationItems` · product navigation configuration · ⚠ Eng to source.
- **Motion — axis 6:** none for route links.
- **Interactions:** IF a navigation target is activated THEN the route mount changes to the target route while the global shell remains present.
- **UX/UI:** Library §4.11, §4.12 — primary-navigation link, active and focus-visible recipe..
- **Acceptance:** GIVEN the shell is visible, WHEN each primary navigation item is activated, THEN the corresponding route target is launched and the header remains mounted.
- **Prototype symbol(s):** route arrays measured on all resting census screens; component census recipe present across 20 screens.

### `GLOB.CMP-04` — Header tooltip triggers
- **Purpose / reflects:** exposes text labels for compact header navigation or utility controls.
- **Business rules:** Tooltip content must be informational only; it must not be the sole source of route meaning or required task instruction. Tooltip copy ownership is open for PM.
- **Data shown:** measured tooltip content includes `Order Summary` and `Admin Console` / `Settings/` in the entry-gate state.
- **Structure & placement:** tooltip trigger is inline in the header; panel renders in a portal-like layer, not inside the trigger.
- **Open state (overlays only):** measured tooltip panels at the open-pass viewport include 109px × 28px and 107px × 44px examples; side is bottom with 4px vertical offset; no clipping ancestors; z-index 50 stacking ancestor; panel background `oklch(0.145 0 0)`, text `oklch(1 0 0)`, radius 8px, padding 6px 12px.
- **Render — per data field:** tooltip text renders as one or two plain text lines inside a dark panel.
- **States — all four tiers:**
  - *Record:* default closed.
  - *Component:* open on trigger activation/hover/focus per measured trigger behavior; focus-visible outline measured on `a[data-slot="tooltip-trigger"]`.
  - *Context:* same tooltip recipe measured across every screen.
  - *Temporal:* n/a.
- **Design requirement:** Compact header controls provide a discoverable text label in a small, non-blocking overlay without moving surrounding layout.
- **Source:** `tooltipLabel` · navigation/utility configuration · ⚠ Eng to source.
- **Motion — axis 6:** Enter uses animation duration 0.15s with easing `ease`; declared transition duration is 0s. Exit measurement must be carried into the UX/UI library recipe before rebuild-ready sign-off.
- **Interactions:** IF the trigger opens THEN the tooltip panel appears below the trigger; IF focus leaves or the pointer exits according to the component contract THEN the panel closes.
- **UX/UI:** Library §4.10 — tooltip trigger and tooltip panel recipe from open census..
- **Acceptance:** GIVEN a compact header trigger, WHEN it is opened, THEN the tooltip appears below it in the portal layer without clipping.
- **Prototype symbol(s):** `entry-gate/tooltip#0`, `entry-gate/tooltip#1`, `entry-gate/tooltip#2`.

### `GLOB.CMP-05` — Entry-gate panel
- **Purpose / reflects:** prototype-only context setup before route content is meaningful.
- **Business rules:** The explanatory prototype copy is do-not-build. PM must decide whether production has any equivalent entry gate, and Eng must identify the production source for store, country and persona context.
- **Data shown:** visible literals include `Select a store type and country to continue`, `Store type / country differences in this prototype`, `Prototype only`, `Store type`, `Country`, `Persona`, `CFC + AU`, `NZ + Customer Support persona`, `eStore`, and explanatory difference notes.
- **Structure & placement:** first route content inside the content cap; measured cap y=92px and height=2332px in the entry-gate state; no tables.
- **Open state (overlays only):** n/a.
- **Render — per data field:** title and explanatory literals render as content-panel text; selectors and continue button are separate components in this inventory.
- **States — all four tiers:**
  - *Record:* default before store type / country selected.
  - *Component:* panel has no measured disclosure or row state.
  - *Context:* hidden option literals include `No store type selected`, `No country selected`, `Supermarket`, `CFC`, `eStore`, `AU`, `NZ`, `Store Team`, `Customer Support`, `Support Office`.
  - *Temporal:* n/a.
- **Design requirement:** The entry state must prevent users from interpreting downstream fixture variants as live operational differences until the driving context is explicit.
- **Source:** `storeType`, `country`, `persona` · operational identity/context systems · ⚠ Eng to source.
- **Motion — axis 6:** none measured for the panel.
- **Interactions:** IF required context is not selected THEN route content remains gated by this panel. IF the continue action is activated with required selections THEN downstream route content may render in that selected context.
- **UX/UI:** Library §4 — context-gate panel recipe..
- **Acceptance:** GIVEN no store type or country is selected, WHEN the application loads, THEN the entry-gate panel renders and no route-specific table is shown.
- **Prototype symbol(s):** `entry-gate` resting census.

### `GLOB.CMP-06` — Store type selector
- **Purpose / reflects:** selected store type context.
- **Business rules:** Production store-type selection, persistence and whether users may switch store type are open.
- **Data shown:** hidden options measured include `No store type`, `No store type selected`, `Supermarket`, `CFC`, `eStore`.
- **Structure & placement:** native select inside `GLOB.CMP-05`; one of five native selects measured on the entry-gate screen.
- **Open state (overlays only):** native select open UI is platform-native and not measured as a custom panel.
- **Render — per data field:** selected option renders inside the native select control.
- **States — all four tiers:**
  - *Record:* default no store type selected.
  - *Component:* native select default and focus-visible states apply.
  - *Context:* selected store type drives route context variant matrices, not separate Order Summary documents.
  - *Temporal:* n/a.
- **Design requirement:** The store type context must be explicit before users evaluate store-dependent operational values.
- **Source:** `storeType` · store identity / organisational hierarchy · ⚠ Eng to source.
- **Motion — axis 6:** native platform behavior.
- **Interactions:** IF a store type is selected THEN downstream context-variant behavior follows that value.
- **UX/UI:** Library §4.5, §4.6 — native-select recipe..
- **Acceptance:** GIVEN the entry gate is visible, WHEN the user chooses a store type, THEN the selected value is available to route context matrices.
- **Prototype symbol(s):** `entry-gate/native-select#0` through `entry-gate/native-select#2`; resting hidden literals.

### `GLOB.CMP-07` — Country selector
- **Purpose / reflects:** selected country context.
- **Business rules:** Production country selection and whether it is derived from store rather than user-selectable are open.
- **Data shown:** visible and hidden country values include `AU`, `NZ`, `No country`, `No country selected`.
- **Structure & placement:** native select inside `GLOB.CMP-05`; one of five measured native selects.
- **Open state (overlays only):** native platform behavior.
- **Render — per data field:** selected country renders inside the native select control.
- **States — all four tiers:**
  - *Record:* default no country selected.
  - *Component:* native select default and focus-visible states apply.
  - *Context:* selected country drives country-specific route variants and print/export availability.
  - *Temporal:* n/a.
- **Design requirement:** Country context must be explicit where screen content, terminology or actions differ by market.
- **Source:** `country` · store identity / market configuration · ⚠ Eng to source.
- **Motion — axis 6:** native platform behavior.
- **Interactions:** IF the country changes THEN downstream country-specific route content follows the selected context.
- **UX/UI:** Library §4.5, §4.6 — native-select recipe..
- **Acceptance:** GIVEN the entry gate is visible, WHEN `AU` or `NZ` is selected, THEN route context matrices can resolve market-specific differences.
- **Prototype symbol(s):** `entry-gate` visible and hidden literals.

### `GLOB.CMP-08` — Persona selector
- **Purpose / reflects:** selected user/persona context.
- **Business rules:** Production persona must come from authenticated identity and permissions unless PM explicitly requires a switcher. Persona names, allowed switching and audit implications are open.
- **Data shown:** `Persona`; hidden values include `Store Team`, `Store Team (1193644)`, `Customer Support`, `Support Office`.
- **Structure & placement:** native select inside `GLOB.CMP-05`; one of five measured native selects.
- **Open state (overlays only):** native platform behavior.
- **Render — per data field:** selected persona renders inside the native select control.
- **States — all four tiers:**
  - *Record:* default persona context measured through fixture values.
  - *Component:* native select default and focus-visible states apply.
  - *Context:* persona drives downstream permission examples such as Customer Support access to `Edit Details`.
  - *Temporal:* n/a.
- **Design requirement:** Persona-sensitive behavior must be tied to a clearly known identity context so users see only actions they are allowed to perform.
- **Source:** `persona` / `role` · identity and access management · ⚠ Eng to source.
- **Motion — axis 6:** native platform behavior.
- **Interactions:** IF persona context changes in the prototype THEN downstream persona-gated examples change; production switching remains open.
- **UX/UI:** Library §4.5, §4.6 — native-select recipe..
- **Acceptance:** GIVEN a persona context is available, WHEN a route with persona-gated actions renders, THEN the route applies that persona in its context matrix.
- **Prototype symbol(s):** `entry-gate` hidden literals.

### `GLOB.CMP-09` — Continue action
- **Purpose / reflects:** confirms the prototype context selection and allows route content to render.
- **Business rules:** Production equivalent is open. If no production entry gate exists, this control is mock scaffolding and must not be built.
- **Data shown:** button text is measured as one visible button in the entry-gate state; exact label must be confirmed from focused source or measurement before rebuild-ready sign-off.
- **Structure & placement:** button inside the entry-gate panel after context controls.
- **Open state (overlays only):** n/a.
- **Render — per data field:** button label renders as text inside a button control.
- **States — all four tiers:**
  - *Record:* default enabled/disabled rule is open.
  - *Component:* focus-visible treatment applies; disabled state rule is open.
  - *Context:* selected store type and country determine whether this action can proceed.
  - *Temporal:* n/a.
- **Design requirement:** The transition out of the entry gate must be deliberate so users do not enter a context-dependent prototype state accidentally.
- **Source:** `selectedStoreType`, `selectedCountry`, `selectedPersona` · identity/context systems · ⚠ Eng to source.
- **Motion — axis 6:** none measured.
- **Interactions:** IF activated with the required context selected THEN the prototype proceeds to route content for that context.
- **UX/UI:** Library §4.2 — button recipe..
- **Acceptance:** GIVEN required context is incomplete, WHEN the user attempts to continue, THEN production behavior follows the PM-approved validation rule.
- **Prototype symbol(s):** `entry-gate` resting census button count.

## D. Screen-level conditions, permissions & edge cases
- **Do-not-build:** prototype labels that explain fixture differences, including `Prototype only` and `Store type / country differences in this prototype`, must not ship as production user copy.
- **Permissions:** production persona and route visibility rules are open and owned by PM with Eng input from IAM.
- **Missing context:** behavior for missing store type, missing country and missing persona is open. The prototype exposes `No store type selected` and `No country selected` as fixture values, not production copy.
- **Route shell effects:** every route spec must state the active navigation item, page title/header centre changes if any, scroll reset behavior and any inherited shell controls it uses.

## E. Open questions (for PM/Design/Eng to resolve)

- ⚠ OPEN — PM: Does production have an entry gate, or are store, country and persona derived from authenticated identity and selected store?
- ⚠ OPEN — PM: Which user roles may access Dash, Order Summary, Reports, Search Orders and Settings?
- ⚠ OPEN — Eng: Which system owns store type, country and persona context, and how should each value be named on component `Source:` lines?
- ⚠ OPEN — Design Systems: extract global header, primary navigation, tooltip, native select, button, focus-visible and content-cap recipes into `requirements/ux-ui-library` so §C UX/UI references resolve.

## F. Render-parity checklist

| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `GLOB.CMP-01` | ⚠ | n/a | ⚠ | n/a | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `GLOB.CMP-02` | ⚠ | n/a | ⚠ | n/a | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `GLOB.CMP-03` | ⚠ | n/a | ⚠ | ⚠ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |
| `GLOB.CMP-04` | ⚠ | n/a | ⚠ | ✅ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GLOB.CMP-05` | ⚠ | n/a | n/a | n/a | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ✅ |
| `GLOB.CMP-06` | ⚠ | n/a | n/a | ⚠ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | native | native | ✅ | ⚠ |
| `GLOB.CMP-07` | ⚠ | n/a | n/a | ⚠ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | native | native | ✅ | ⚠ |
| `GLOB.CMP-08` | ⚠ | n/a | n/a | ⚠ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | native | native | ✅ | ⚠ |
| `GLOB.CMP-09` | ⚠ | n/a | n/a | ⚠ | ⚠ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |

## G. Coverage reconciliation

| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| `entry-gate` application root | `GLOB.RGN-01` | |
| `entry-gate` header | `GLOB.RGN-02` | |
| `entry-gate` main route mount | `GLOB.RGN-03` | |
| `entry-gate` content cap | `GLOB.RGN-04` | |
| product identity literals | `GLOB.CMP-01` | |
| version/build literals | `GLOB.CMP-02` | |
| primary route links | `GLOB.CMP-03` | |
| tooltip triggers and panels | `GLOB.CMP-04` | |
| prototype entry-gate panel | `GLOB.CMP-05` | |
| store type native select | `GLOB.CMP-06` | |
| country native select | `GLOB.CMP-07` | |
| persona native select | `GLOB.CMP-08` | |
| continue button | `GLOB.CMP-09` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.