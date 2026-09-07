# 07 — Move to Shop Floor

> **Artifact type:** Functional & UX Specification (PM + Designer → Engineering handover)
>
> **Scope:** the cross-screen Move to Shop Floor action outcome. This action is launched from Order Summary in bulk and from Order Details for whole-order or selected-line moves, so it has one owner here and callers keep launch contracts only.

## A. Purpose & context
- **User goal:** move eligible OSR work to the Shop Floor picking queue with explicit confirmation.
- **Entry points:** Order Summary eStore bulk action; Order Details Articles toolbar whole-order action; Order Details Articles selected-line action.
- **Exit points / next actions:** cancel without changes, confirm move, return outcome to the caller.

## A1. What this screen depends on, and where its data comes from

### Depends on — build these first
- `02` Order Summary for bulk selected-order launch.
- `03a` Order Details Shell and `03b` Articles tab for whole-order and selected-line launch.

### Fixture data — for verification only, never for production
- Measured bulk overlay: `order-summary-estore/manual:move-to-shop-floor-bulk`, 480px × 236px at x=480px, y=382px, z-index 3001, 32px padding, 14px radius.
- Prototype source confirms whole-order and selected-line Order Detail dialogs with the same modal structure and `Move to Shop Floor` confirmation action.

## B1. Page composition & region map

| Region ID | Node | Scaffold properties (bg · padding/margin · width constraint · border · stacking) | Contains |
|---|---|---|---|
| `MOVE.RGN-01` | caller-owned launch surface | Toolbar/action area in `02` or `03b`; caller owns placement. | `MOVE.CMP-01` |
| `MOVE.RGN-02` | portal modal layer | Backdrop z-index 3000; popup z-index 3001; modal width 480px with max-width calc(100vw - 48px). | `MOVE.CMP-02`, `MOVE.CMP-03`, `MOVE.CMP-04` |

- **Width model:** popup has fixed 480px target width and viewport-safe max width.
- **Region state variance:** text changes for bulk order, whole-order and selected-line variants.
- **Prototype symbol(s):** `MoveOrdersToShopFloorDialog`, `MoveOrderDialog`, `MoveLineDialog`.

## B2. Component inventory

| Component ID | Name | Type | Parent region | Notes |
|---|---|---|---|---|
| `MOVE.CMP-01` | Launch contract | action contract | `MOVE.RGN-01` | Caller passes trigger, gate, selected scope and context. |
| `MOVE.CMP-02` | Move confirmation dialog | modal dialog | `MOVE.RGN-02` | Shared outcome confirmation. |
| `MOVE.CMP-03` | Move warning/body copy | confirmation text | `MOVE.CMP-02` | States irreversible queue move. |
| `MOVE.CMP-04` | Cancel/confirm actions | button group | `MOVE.CMP-02` | `Cancel`, `Move to Shop Floor`. |

## C0. Context-variant matrix

| Context | Values | What changes on this screen |
|---|---|---|
| Caller | Order Summary bulk · Order Detail whole-order · Order Detail selected-line | Dialog title/body names selected orders or selected lines. Caller owns trigger placement; this spec owns outcome. |
| Store type | eStore | Action is eStore-only in the prototype. Non-eStore availability is not measured. |
| Order status | dispatched · not dispatched | Order Detail source disables move actions for dispatched orders. Bulk dispatch eligibility is open. |
| Selection scope | selected orders · all remaining OSR lines · selected lines | Confirmation copy and source payload change by scope. |
| Date / time | n/a | No time-based behavior measured; eligibility windows are open. |

## C. Component specifications

### `MOVE.CMP-01` — Launch contract
- **Purpose / reflects:** standardises caller responsibilities.
- **Business rules:** caller must pass selected scope, eStore context, disabled/eligibility state and return handling. Exact eligibility rules are open.
- **Data shown:** caller label examples: `Move to Shop Floor Pick`, `Move Order from OSR to Shop Floor`, `Move Line from OSR to Shop Floor`.
- **Structure & placement:** caller-owned toolbar action; no outcome copy is duplicated in caller specs.
- **Open state (overlays only):** n/a.
- **Render — per data field:** trigger label renders in caller toolbar.
- **States — all four tiers:** Record: selected scope and eligibility. Component: enabled/disabled/focus. Context: eStore only. Temporal: n/a unless eligibility expires.
- **Design requirement:** Any caller must launch the same confirmation contract so moving work between picking queues behaves identically wherever it starts.
- **Source:** `selectedOrders`, `selectedLines`, `storeType`, `orderStatus` · OMS / fulfilment operations · ⚠ Eng to source.
- **Motion — axis 6:** owned by modal components.
- **Interactions:** IF launched with a valid scope THEN open `MOVE.CMP-02`; IF launched without an eligible scope THEN caller displays its disabled feedback.
- **UX/UI:** Library §4.2 — toolbar action recipe in callers..
- **Acceptance:** GIVEN either Order Summary or Order Details launches Move to Shop Floor, THEN this spec receives the caller, scope, gate, payload and return contract.
- **Prototype symbol(s):** `QuickActions.tsx`, `OrderDetailToolbar.tsx`.

### `MOVE.CMP-02` — Move confirmation dialog
- **Purpose / reflects:** confirms queue reassignment before it is applied.
- **Business rules:** irreversibility, audit logging, partial failures and undo policy are open.
- **Data shown:** measured/source titles include `Move Order from OSR to Shop Floor`, `Move Orders from OSR to Shop Floor`, `Move Line from OSR to Shop Floor`.
- **Structure & placement:** portal modal with backdrop; 480px popup, 32px padding, 14px radius, z-index 3001.
- **Open state (overlays only):** bulk measured at x=480px, y=382px, w=480px, h=236px.
- **Render — per data field:** title names scope; body names count and destination queue.
- **States — all four tiers:** Record: order/line count. Component: closed/open. Context: caller/scope. Temporal: n/a.
- **Design requirement:** The irreversible queue move must be blocked by a confirmation modal so users can verify the scope before committing.
- **Source:** `moveScope`, `lineCount`, `orderCount` · OMS / picking queue · ⚠ Eng to source.
- **Motion — axis 6:** none in measured bulk dialog; source modal classes must not override rendered measurement without verification.
- **Interactions:** IF modal opens THEN focus remains in the modal until close/confirm. IF backdrop or Cancel closes THEN no move occurs.
- **UX/UI:** Library §4.7 — modal confirmation recipe..
- **Acceptance:** GIVEN a valid move launch, THEN a modal confirmation renders before queue reassignment.
- **Prototype symbol(s):** `order-summary-estore/manual:move-to-shop-floor-bulk`, `MoveOrderDialog`, `MoveLineDialog`.

### `MOVE.CMP-03` — Move warning/body copy
- **Purpose / reflects:** explains destination and irreversibility.
- **Business rules:** exact irreversible wording and legal/audit requirements are open.
- **Data shown:** body copy states selected order(s) or line(s) will move to the Shop Floor picking queue and cannot be undone.
- **Structure & placement:** body text below dialog title and above actions.
- **Open state (overlays only):** inside `MOVE.CMP-02`.
- **Render — per data field:** count and noun agree with selected scope.
- **States — all four tiers:** Record: singular/plural count. Component: static. Context: caller/scope. Temporal: n/a.
- **Design requirement:** Users must see both destination and irreversibility in the confirmation body before committing the move.
- **Source:** `orderCount`, `lineCount`, `destinationQueue` · OMS / picking queue · ⚠ Eng to source.
- **Motion — axis 6:** none.
- **Interactions:** none.
- **UX/UI:** Library §4.4, §4.7 — modal body-copy recipe..
- **Acceptance:** GIVEN a selected-line move, THEN the confirmation body names lines rather than orders.
- **Prototype symbol(s):** Move dialog source files.

### `MOVE.CMP-04` — Cancel/confirm actions
- **Purpose / reflects:** modal decision controls.
- **Business rules:** confirm failure handling and success feedback are open.
- **Data shown:** `Cancel`, `Move to Shop Floor`.
- **Structure & placement:** bottom-right modal action row.
- **Open state (overlays only):** inside `MOVE.CMP-02`.
- **Render — per data field:** Cancel renders as secondary/outline action; confirm renders as primary action.
- **States — all four tiers:** Record: pending/failed/succeeded open. Component: default/focus/loading/disabled. Context: caller/scope. Temporal: n/a.
- **Design requirement:** Destructive or irreversible confirmation must present a clear non-destructive escape and a distinct commit action.
- **Source:** action state · client; move result · OMS / picking queue · ⚠ Eng to source.
- **Motion — axis 6:** none measured.
- **Interactions:** IF Cancel is activated THEN close without move. IF Move to Shop Floor is activated THEN submit the move and return outcome to caller.
- **UX/UI:** Library §4.2, §4.7 — modal action button recipe..
- **Acceptance:** GIVEN the modal is open, WHEN Cancel is activated, THEN no move occurs.
- **Prototype symbol(s):** Move dialog source files and measured bulk overlay.

## D. Screen-level conditions, permissions & edge cases
- Move to Shop Floor is cross-screen because it launches from Order Summary and Order Details.
- Empty selection, ineligible status, partial failures, already-moved lines and concurrent updates are open.
- The action is eStore-only in the prototype; production eligibility is open.

## E. Open questions (for PM/Design/Eng to resolve)

- ⚠ OPEN — PM: What exact orders/lines are eligible for OSR-to-Shop-Floor movement?
- ⚠ OPEN — PM: Is the move irreversible in production, and what audit/success/failure messaging is required?
- ⚠ OPEN — Eng: Which system owns OSR and Shop Floor queue reassignment?
- ⚠ OPEN — Design Systems: extract modal confirmation and toolbar action recipes.

## F. Render-parity checklist

| Component | Region/container chrome | Background & zebra (incl. index reset) | Header styling | Hover · focus · selected | Each data field's render | Every state, 4 tiers | Temporal state | Business rules ruled | Structure / colSpan / alignment | Width constraint | Rendering layer | Open-state geometry | Conditional to group·store·country·persona | Spacing, padding & widths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `MOVE.CMP-01` | caller-owned | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | caller-owned | caller-owned | n/a | ✅ | ⚠ |
| `MOVE.CMP-02` | ✅ | n/a | ⚠ | ⚠ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `MOVE.CMP-03` | ✅ | n/a | n/a | n/a | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ✅ |
| `MOVE.CMP-04` | ⚠ | n/a | n/a | ⚠ | ✅ | ⚠ | ✅ | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ |

## G. Coverage reconciliation

| Prototype node (symbol) | Mapped to | If unmapped — why |
|---|---|---|
| Order Summary bulk move launch | `MOVE.CMP-01` | caller placement owned by `02` |
| Order Detail whole-order move launch | `MOVE.CMP-01` | caller placement owned by `03b` |
| Order Detail selected-line move launch | `MOVE.CMP-01` | caller placement owned by `03b` |
| Move modal dialog | `MOVE.CMP-02` through `MOVE.CMP-04` | |

**Rebuild-ready** — can engineering build the pixels?
☐ §B1 complete (incl. the width model) · ☐ §G fully mapped · ☐ every component has Structure + Render + 4-tier states · ☐ every overlay specified open · ☐ every library reference resolves · ☐ every library value has provenance · ☐ §F filled · ☐ multi-viewport parity passes.

**Requirement-ready** — can engineering build the right thing, and wire it?
☐ every component has a Business rules entry (ruled, or an owned `⚠ OPEN`) · ☐ every temporal state named with its threshold and where it is configured · ☐ every value's source system named · ☐ all mock scaffolding called out as must-not-build · ☐ every flag carries a type · ☐ no `⚠ OPEN` without a named owner.