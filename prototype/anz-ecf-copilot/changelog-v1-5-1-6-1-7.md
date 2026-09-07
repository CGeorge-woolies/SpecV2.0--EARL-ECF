# Changelog — v1.5, v1.6 & v1.7

Everything that changed since the v1.4 local share, covering the v1.5 share (Session 15a), the changes made since v1.5 that formed v1.6 (Session 15b), and the changes made since v1.6 that formed v1.7 (Session 16).

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
**Note:** v1.5 local distribution share was generated after Session 27; everything below is new since that share and formed part of the next local share, v1.6.

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
- v1.7 local distribution share generated after Session 52 (`dist/anz-ecf-union-v-1-7.html`, via `npm run build:share`).
