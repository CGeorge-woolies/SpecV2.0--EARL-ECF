import {
  FlagAgeRestricted18,
  FlagB2B,
  FlagBulk,
  FlagFraudChallenge,
  FlagMilestoneOrder,
  FlagPackingSlipRequired,
  FlagPharmacy,
  FlagSpecialtyPrep,
  PropOnDemandCustomer,
  PropOnDemandDriver,
  PropScheduledCustomer,
  PropScheduledDriver,
  PropScheduledFleet,
  PropScheduledLockerAssigned,
  PropScheduledLockerUnassigned,
  type IconComponent,
} from '@/components/icons/material-icons'

/** Icon + label for each proposition type. Shared by OrdersTable's Proposition column, Search
 * Orders, and the Header's order-detail subline. On Demand propositions only ever appear in
 * onDemand groups; Scheduled propositions appear everywhere else. Locker is NZ-only — see
 * getPropositionDisplay, which hides it for AU. */
export const DELIVERY_ICONS = {
  ondemandCustomer: { icon: PropOnDemandCustomer, label: 'Customer Collection' },
  ondemandDriver: { icon: PropOnDemandDriver, label: 'Driver Collection' },
  scheduledCustomer: { icon: PropScheduledCustomer, label: 'Customer Collection' },
  scheduledDriver: { icon: PropScheduledDriver, label: 'Driver Collection' },
  scheduledFleet: { icon: PropScheduledFleet, label: 'Fleet' },
  scheduledLockerUnassigned: { icon: PropScheduledLockerUnassigned, label: 'Locker' },
  scheduledLockerAssigned: { icon: PropScheduledLockerAssigned, label: 'Locker' },
} as const

export type PropositionType = keyof typeof DELIVERY_ICONS

/** Second tooltip line for a proposition icon: the On Demand sub-proposition (DTB Now / Uber /
 * DoorDash / MILKRUN, the driver variant coming from propositionLabel) or the Locker assignment
 * state. Scheduled Customer/Driver/Fleet have no sub-proposition. */
function getPropositionSubLabel(row: Pick<OrderRow, 'deliveryIcon' | 'propositionLabel'>): string | undefined {
  switch (row.deliveryIcon) {
    case 'ondemandCustomer':
      return 'DTB Now'
    case 'ondemandDriver':
      return row.propositionLabel
    case 'scheduledLockerUnassigned':
      return 'Unallocated'
    case 'scheduledLockerAssigned':
      return 'Allocated'
    default:
      return undefined
  }
}

/** Icon/label/sub-label to render for a row's Proposition flag, or null to render nothing.
 * Locker is NZ-only, so it's hidden entirely when isAU. */
export function getPropositionDisplay(
  row: Pick<OrderRow, 'deliveryIcon' | 'propositionLabel'>,
  isAU: boolean,
): { icon: IconComponent; label: string; subLabel?: string } | null {
  const type = row.deliveryIcon
  if (!type) return null
  if (isAU && (type === 'scheduledLockerUnassigned' || type === 'scheduledLockerAssigned')) return null
  const entry = DELIVERY_ICONS[type]
  return { icon: entry.icon, label: entry.label, subLabel: getPropositionSubLabel(row) }
}

/** Customer Collection orders (On Demand DTB Now or Scheduled in-store pickup) — the only
 * propositions where the customer, not a driver, physically collects the order. */
export function isCustomerCollectionType(type: OrderRow['deliveryIcon']): boolean {
  return type === 'ondemandCustomer' || type === 'scheduledCustomer'
}

/** Icon for a row's Age Restricted flag, or null to render nothing. The 16+ tier is not
 * currently distinguished in the UI — any age-restricted order shows as 18+, in both AU and NZ,
 * regardless of the row's stored tier. */
export function getAgeRestrictionDisplay(
  row: Pick<OrderRow, 'ageRestriction'>,
): { icon: IconComponent; tier: '18' } | null {
  if (!row.ageRestriction) return null
  return { icon: FlagAgeRestricted18, tier: '18' }
}

/** Order-count milestones tracked for the milestone-order flag (Orders column + Order Details'
 * Customer card). Keyed by the customer's lifetime order count. */
export const MILESTONE_ORDER_LABELS: Record<number, string> = {
  1: '1st order',
  25: '25th order',
  50: '50th order',
  100: '100th order',
  200: '200th order',
  500: '500th order',
  1000: '1000th order',
}

/** Milestone-order flag for a row, or null if its order count isn't a tracked milestone. First
 * order (via isFirstOrder) renders blue; every other milestone renders in the default icon
 * colour — see rowHighlightStyle for the blue and FlagMilestoneOrder for the icon. */
export function getMilestoneOrderDisplay(
  row: Pick<OrderRow, 'orders' | 'isFirstOrder'>,
): { label: string; isFirstOrder: boolean } | null {
  if (row.isFirstOrder) return { label: MILESTONE_ORDER_LABELS[1], isFirstOrder: true }
  const label = MILESTONE_ORDER_LABELS[row.orders]
  return label ? { label, isFirstOrder: false } : null
}

export type OrderFlagKey = 'bulk' | 'specialty' | 'pharmacy' | 'ageRestricted' | 'fraud' | 'milestone' | 'packingSlip' | 'b2b'

export interface OrderFlagFilterOption {
  key: OrderFlagKey
  tooltip: string
  icon: IconComponent
  /** Omitted entirely from the "Order flags" filter row when isNZ is false. */
  countryGated?: 'nz'
  /** isNZ is passed so an NZ-only flag stays inert (never matches) if the country is switched to
   * AU while it's still selected — its button disappears from the filter row in that case (see
   * countryGated), so this is what stops a now-unreachable selection from silently continuing to
   * filter the table with no visible way to clear it. */
  matches: (row: OrderRow, isNZ: boolean) => boolean
}

/** Shared by the "Order flags" filter (OverviewDrawers) and its filtering logic
 * (filterGroupsForVisibility in OrdersTable), so both stay in sync off one definition. */
export const ORDER_FLAG_FILTERS: OrderFlagFilterOption[] = [
  { key: 'bulk', tooltip: 'Bulk', icon: FlagBulk, matches: (row) => row.flags.includes('bulk') },
  {
    key: 'specialty',
    tooltip: 'Specialty item(s)',
    icon: FlagSpecialtyPrep,
    matches: (row) => row.flags.includes('specialty'),
  },
  {
    key: 'pharmacy',
    tooltip: 'Pharmacy Item',
    icon: FlagPharmacy,
    countryGated: 'nz',
    matches: (row, isNZ) => isNZ && row.flags.includes('pharmacy'),
  },
  {
    key: 'ageRestricted',
    tooltip: 'Age Restricted',
    icon: FlagAgeRestricted18,
    matches: (row) => !!row.ageRestriction,
  },
  { key: 'fraud', tooltip: 'Fraud Challenged', icon: FlagFraudChallenge, matches: (row) => row.flags.includes('fraud') },
  {
    key: 'milestone',
    tooltip: 'Milestone Order',
    icon: FlagMilestoneOrder,
    matches: (row) => getMilestoneOrderDisplay(row) !== null,
  },
  {
    key: 'packingSlip',
    tooltip: 'Packing Slip Required',
    icon: FlagPackingSlipRequired,
    countryGated: 'nz',
    matches: (row, isNZ) => isNZ && !!row.packingSlipRequired,
  },
  { key: 'b2b', tooltip: 'B2B Customer', icon: FlagB2B, matches: (row) => !!row.isB2B },
]

export interface OrderRow {
  id: string
  orderNo: string
  /** Fleet orders only — AU's Transit Code (e.g. "FBB01"), reformatted as NZ's Drop Code via
   * getRoutingDisplay. Customer/Driver Collection and Locker rows don't use this field — see
   * getRoutingDisplay for what each proposition shows in the Routing cell. */
  transitCode?: string
  customer: string
  status: string
  orders: number
  suppliedPercent: number
  /**
   * notStarted = grey/outlined, not yet picking
   * picking    = light/zing green, picking in progress
   * packed     = dark green, packed (picking complete)
   * deleted    = red strikethrough "DELETED" pill, order was cancelled
   *
   * The "Out of Stock > 2%" warning icon is not part of this phase — it's computed at render
   * time from status (packed/dispatched) + suppliedPercent, see isOosFlagged in OrdersTable.
   */
  suppliedStatus: 'notStarted' | 'picking' | 'packed' | 'deleted'
  /** Personal Shopper(s) who picked/are picking this order (shown in a tooltip while picking or once dispatched) */
  pickers?: string[]
  totesPicked: string
  lines: number
  articles: number
  /** Order-level flags shown as flag-column icons in OrdersTable (see FLAG_COLUMNS/FLAG_ICONS).
   * 'bulk' = the order contains at least one line whose ordered quantity meets/exceeds the "Bulk
   * Order Line Quantity" threshold configured in Admin Console (e.g. ORD QTY >= 24) — flagged so
   * pickers know to expect a bulk-handling line, not a per-order value or weight threshold.
   * 'pharmacy' = NZ-only — the order contains a pharmacy item (see articlesData.ts's
   * getOrderArticles). Independent of 'specialty': the Specialty items column renders the
   * generic specialty icon and the pharmacy icon side by side when both flags are present on
   * the same order (e.g. a platter/hot-chicken order that also has a pharmacy item), or just
   * the one icon when only one flag is set — see the 'specialty' cell render branch in
   * OrdersTable.tsx and FlagPharmacy. */
  flags: string[]
  deliveryIcon?: PropositionType
  /** Age Restricted flag. The stored tier is kept for data-modelling purposes, but the UI does
   * not currently distinguish 16+ from 18+ — any age-restricted order displays as 18+ in both AU
   * and NZ, see getAgeRestrictionDisplay. */
  ageRestriction?: '16' | '18'
  /** New/fresh order flag, independent of status */
  isFresh?: boolean
  /** Order is on hold — renders a pink row background (checkbox through Status columns) with an
   * explanatory hover tooltip. Editable via the "On Hold" checkbox on Order Details; toggling and
   * saving there writes back onto this same row object, so Order Summary reflects it immediately
   * (for the rest of the session). Precedence when combined with isAudit/isReissued: onHold wins. */
  onHold?: boolean
  /** Order flagged for audit — renders a pastel-green row background with an explanatory hover
   * tooltip. Display-only for this prototype (no toggle UI). Precedence: beaten by onHold, beats isReissued. */
  isAudit?: boolean
  /** Order has been reissued — renders a light-blue row background with an explanatory hover
   * tooltip. Display-only for this prototype (no toggle UI). Lowest precedence of the three flags. */
  isReissued?: boolean
  /** Order was deleted/cancelled — renders red strikethrough and can be hidden via the Deleted Orders filter */
  isDeleted?: boolean
  /** Customer's first-ever order — renders blue with an award-star suffix on the customer name */
  isFirstOrder?: boolean
  /** On Demand / DTBN orders only — shown in a "Dispatch by HH:MM AM/PM" tooltip on hover of the
   * Status cell. NZ always shows it when present; AU only shows it while the "locked" (PST) flag
   * is active — dispatch time is only known once the pick start time lock has been set. */
  dispatchByTime?: string
  /** Overrides the delivery-icon tooltip label (e.g. On Demand orders all use the milkrun icon but vary this label; DTBN orders all read "Direct to Boot Now") */
  propositionLabel?: string
  /** Scheduled - Locker orders only — lockers are an NZ-only fulfilment option, so these rows are
   * filtered out of the table entirely for AU (not just their icon hidden — an AU store's queue
   * wouldn't contain a locker order in the first place). */
  nzOnly?: boolean
  /** Order requires a printed packing slip — NZ-only concern, shown as an icon suffix on the order
   * number; not shown in the AU interface even though it's present on every row in this one shared
   * dataset. Assigned deterministically to ~30% of orders in forEachOrderRow below. */
  packingSlipRequired?: boolean
  /** Customer is a B2B (business) account — shown as a briefcase icon (in place of the usual
   * person icon) on the Order Details > Details tab's Customer card. Assigned deterministically
   * to ~10% of orders below, prioritising 'bulk'-flagged orders first (bulk orders are the most
   * plausible B2B candidates), then filling the remainder from the rest of the order set. */
  isB2B?: boolean
  /** 4-digit store number the order was picked at. Every row belongs to HOME_STORE_ID; rows for
   * OTHER_STORE_IDS are synthesized clones (see cloneGroupsForStore) used only by the Search Orders
   * "Search all stores" mode, so a single store's UI never needs to think about this field. */
  storeId?: string
}

export interface SubGroup {
  id: string
  label: string
  orderValue: number
  rows: OrderRow[]
  onHold?: boolean
}

export interface Group {
  id: string
  label: string
  /** onDemand = flat rows, no sub-grouping. session = AU delivery session, wraps subGroups (windows). window = NZ's flattened stand-in for a session's subGroup (see flattenSessionGroupsToWindows) — flat rows like onDemand, but labelled/held as a "window" not a "session". */
  kind: 'onDemand' | 'session' | 'window'
  orderValue: number
  /** onDemand groups only — shown as "N/M" next to the group label (AU only; hidden for NZ, see
   * GroupHeaderRow). N is the number of Personal Shoppers currently active picking On Demand
   * orders; M is "On Demand Picking Capacity" — the number the capacity algorithm has determined
   * are needed to meet demand. Not a completion ratio. */
  pickingCount?: number
  subGroups: SubGroup[]
  rows: OrderRow[]
  onHold?: boolean
  /** Display-only cutoff time for window/session groups (e.g. "11:00am"). Only set on the first window/session group in a dataset. */
  cutoffTime?: string
  /** window groups only (NZ) — shown as "X/Y" on the Open/Closed chip. X is rows.length (orders currently
   * in the window); Y is the window's capacity limit, set by the real capacity system in production. In
   * this prototype it's derived deterministically from the window (see flattenSessionGroupsToWindows) —
   * sometimes equal to X, sometimes X plus a small amount of headroom. */
  windowCapacity?: number
}

/** Parses a "HH:MM-HH:MM" window label into its start-time in minutes-from-midnight, for chronological sorting. */
function windowStartMinutes(label: string): number | null {
  const match = /^(\d{2}):(\d{2})/.exec(label)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

// Demo-only cutoff: evening delivery windows (17:00 onwards) haven't had their session cutoff pass
// yet, so totes/trips haven't been generated and there's nothing real to show a Supplied % bar for.
const EVENING_WINDOW_START_MINUTES = 17 * 60

/** True for a "HH:MM-HH:MM" window/subGroup label whose start time is 17:00 or later. */
export function isEveningWindow(label: string): boolean {
  const start = windowStartMinutes(label)
  return start !== null && start >= EVENING_WINDOW_START_MINUTES
}

/** Ids of the catch-all "NO ROUTE" session (AU) / window (NZ, via flattenSessionGroupsToWindows)
 * for orders with no fleet transit code assigned yet. Always sits last in orderGroups so it's
 * the final group on the page for both AU (kind 'session') and NZ (flattened to kind 'window'). */
export const NO_ROUTE_GROUP_ID = 'g-no-route'
export const NO_ROUTE_SUBGROUP_ID = 'sg-no-route'

/** True for the NO ROUTE group/subGroup/window — no totes have been generated for it yet (same
 * "not ready" treatment as an isEveningWindow window), and its header row is always highlighted
 * bright yellow so it stands out for triage regardless of hold/demo-highlight state. */
export function isNoRouteGroup(entity: { id: string }): boolean {
  return entity.id === NO_ROUTE_GROUP_ID || entity.id === NO_ROUTE_SUBGROUP_ID
}

/** Deterministic string hash, used to derive stable-but-varied prototype values (e.g. window capacity) from a window's id. */
function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  return hash
}

/** Formats a window label's end time (e.g. "15:00-16:00" -> "4:00pm") for display as the window's cutoff. */
function windowEndTimeLabel(label: string): string | undefined {
  const match = /-(\d{2}):(\d{2})$/.exec(label)
  if (!match) return undefined
  const hour24 = Number(match[1])
  const minute = match[2]
  const period = hour24 >= 12 ? 'pm' : 'am'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:${minute}${period}`
}

/**
 * NZ stores don't use sessions — only windows. This turns each AU-style session group's
 * subGroups (e.g. "5098 CDMD2" -> "15:00-16:00") into standalone top-level "window" groups,
 * dropping the session wrapper, then sorts the resulting windows chronologically by start time.
 * onDemand groups pass through untouched and are kept first; non-time-range labels (e.g.
 * "No Route", for orders with no fleet transit code) keep their original relative order, anchored
 * before the AM session's time windows or after the PM session's, matching where they sit in the
 * source data.
 */
export function flattenSessionGroupsToWindows(groups: Group[]): Group[] {
  const onDemandGroups = groups.filter((group) => group.kind === 'onDemand')
  const sessionGroups = groups.filter((group) => group.kind === 'session')

  const windows = sessionGroups.flatMap((group, groupIndex) =>
    group.subGroups.map(
      (subGroup, subGroupIndex): { group: Group; sortKey: number } => {
        const hash = hashString(subGroup.id)
        const headroom = hash % 3 === 0 ? 0 : (hash % 5) + 1
        return {
          group: {
            id: subGroup.id,
            label: subGroup.label,
            kind: 'window',
            orderValue: subGroup.orderValue,
            subGroups: [],
            rows: subGroup.rows,
            windowCapacity: subGroup.rows.length + headroom,
          },
          sortKey: windowStartMinutes(subGroup.label) ?? groupIndex * 1000 + subGroupIndex,
        }
      },
    ),
  )

  windows.sort((a, b) => a.sortKey - b.sortKey)

  if (windows.length > 0) {
    windows[0].group.cutoffTime = windowEndTimeLabel(windows[0].group.label)
  }

  return [...onDemandGroups, ...windows.map((w) => w.group)]
}

/** Flattens all groups (session groups via their subGroups, onDemand/window groups via rows) into a single list of rows. */
export function getAllOrderRows(groups: Group[]): OrderRow[] {
  return groups.flatMap((group) =>
    group.kind === 'session' ? group.subGroups.flatMap((sg) => sg.rows) : group.rows,
  )
}

/** Pool of personal shopper names randomly assigned (1-3 per order) to picking/dispatched orders. */
export const PERSONAL_SHOPPERS = [
  "Sarah Nguyen", "Tom Baxter", "Priya Singh", "Jamie Chen", "Liam O'Connor", "Amy Clarke", "Ben Foster",
  "Chloe Martin", "Daniel Reyes", "Ella Simmons", "Frank Ortiz", "Grace Kim", "Harry Doyle", "Isla Bennett",
  "Josh Palmer",
] as const

export const orderGroups: Group[] = [
  {
    id: "g-on-demand",
    label: "5098 On Demand",
    kind: "onDemand",
    orderValue: 4818.62,
    pickingCount: 2,
    subGroups: [],
    rows: [
      { id: "r-315260349", orderNo: "315260349", customer: "Harper Campbell", status: "DIS 01:32 PM", orders: 240, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Chloe Martin", "Isla Bennett"], totesPicked: "2/2", lines: 22, articles: 27, flags: ["bulk"], deliveryIcon: "ondemandDriver", dispatchByTime: "01:29 PM", propositionLabel: "DoorDash" },
      { id: "r-315293121", orderNo: "315293121", customer: "Aubrey Douglas", status: "DIS 01:46 PM", orders: 25, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Harry Doyle"], totesPicked: "3/3", lines: 12, articles: 15, flags: ["specialty", "pharmacy"], deliveryIcon: "ondemandDriver", dispatchByTime: "01:47 PM", propositionLabel: "DoorDash" },
      { id: "r-315626307", orderNo: "315626307", customer: "MILKRUN Grayson Morris", status: "DIS 08:55 AM", orders: 0, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Priya Singh", "Isla Bennett"], totesPicked: "3/3", lines: 5, articles: 5, flags: ["fraud"], deliveryIcon: "ondemandDriver", dispatchByTime: "08:58 AM", propositionLabel: "MILKRUN" },
      { id: "r-315639171", orderNo: "315639171", customer: "MILKRUN Hazel Wright", status: "DIS 09:50 AM", orders: 0, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Amy Clarke", "Priya Singh"], totesPicked: "2/2", lines: 25, articles: 35, flags: [], deliveryIcon: "ondemandDriver", dispatchByTime: "09:49 AM", propositionLabel: "MILKRUN" },
      { id: "r-315640941", orderNo: "315640941", customer: "MILKRUN Owen Cooper", status: "DIS 09:49 AM", orders: 0, suppliedPercent: 91, suppliedStatus: "packed", pickers: ["Ella Simmons", "Frank Ortiz", "Jamie Chen"], totesPicked: "2/2", lines: 15, articles: 32, flags: [], deliveryIcon: "ondemandDriver", dispatchByTime: "09:48 AM", propositionLabel: "MILKRUN" },
      { id: "r-315654714", orderNo: "315654714", customer: "MILKRUN Harper Clarke", status: "DIS 10:39 AM", orders: 0, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Ella Simmons", "Frank Ortiz", "Priya Singh"], totesPicked: "3/3", lines: 3, articles: 3, flags: ["bulk", "fraud"], deliveryIcon: "ondemandDriver", dispatchByTime: "10:38 AM", propositionLabel: "MILKRUN" },
      { id: "r-315670625", orderNo: "315670625", customer: "MILKRUN Christopher Evans", status: "DIS 11:59 AM", orders: 0, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Grace Kim", "Jamie Chen", "Sarah Nguyen"], totesPicked: "3/3", lines: 22, articles: 25, flags: ["bulk"], deliveryIcon: "ondemandDriver", dispatchByTime: "12:02 PM", propositionLabel: "MILKRUN" },
      { id: "r-315670995", orderNo: "315670995", customer: "MILKRUN Paisley Walker", status: "DIS 12:00 PM", orders: 0, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Josh Palmer"], totesPicked: "2/2", lines: 5, articles: 5, flags: ["pharmacy"], deliveryIcon: "ondemandDriver", dispatchByTime: "11:57 AM", propositionLabel: "MILKRUN" },
      { id: "r-315671667", orderNo: "315671667", customer: "Addison Carter", status: "Deleted", orders: 3, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], deliveryIcon: "ondemandDriver", dispatchByTime: "12:10 PM", propositionLabel: "Uber", isDeleted: true },
      { id: "r-315675883", orderNo: "315675883", customer: "MILKRUN Caleb Ryan", status: "DIS 12:12 PM", orders: 0, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Grace Kim", "Josh Palmer"], totesPicked: "2/2", lines: 11, articles: 12, flags: [], deliveryIcon: "ondemandDriver", dispatchByTime: "12:09 PM", propositionLabel: "MILKRUN" },
      { id: "r-315676239", orderNo: "315676239", customer: "MILKRUN James Bennett", status: "DIS 12:12 PM", orders: 0, suppliedPercent: 56, suppliedStatus: "packed", pickers: ["Isla Bennett", "Jamie Chen"], totesPicked: "3/3", lines: 4, articles: 5, flags: ["specialty", "fraud"], deliveryIcon: "ondemandDriver", dispatchByTime: "12:15 PM", propositionLabel: "MILKRUN" },
      { id: "r-315678481", orderNo: "315678481", customer: "Isaac Griffiths", status: "DIS 12:33 PM", orders: 25, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Harry Doyle"], totesPicked: "2/2", lines: 25, articles: 33, flags: ["bulk", "fraud"], deliveryIcon: "ondemandDriver", dispatchByTime: "12:30 PM", propositionLabel: "DoorDash" },
      { id: "r-315699502", orderNo: "315699502", customer: "MILKRUN Emma Watson", status: "DIS 01:53 PM", orders: 0, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Amy Clarke", "Tom Baxter", "Isla Bennett"], totesPicked: "3/3", lines: 17, articles: 21, flags: ["bulk"], deliveryIcon: "ondemandDriver", dispatchByTime: "01:51 PM", propositionLabel: "MILKRUN" },
      { id: "r-315701043", orderNo: "315701043", customer: "Paisley James", status: "DIS 02:35 PM", orders: 50, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Amy Clarke", "Ben Foster"], totesPicked: "6/6", lines: 23, articles: 39, flags: [], deliveryIcon: "ondemandDriver", dispatchByTime: "02:38 PM", propositionLabel: "DoorDash" },
      { id: "r-315704010", orderNo: "315704010", customer: "MILKRUN Thomas Mason", status: "DIS 02:13 PM", orders: 0, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Harry Doyle"], totesPicked: "2/2", lines: 4, articles: 4, flags: [], deliveryIcon: "ondemandDriver", dispatchByTime: "02:12 PM", propositionLabel: "MILKRUN" },
      { id: "r-315708650", orderNo: "315708650", customer: "Caleb Anderson", status: "Picking", orders: 50, suppliedPercent: 64, suppliedStatus: "picking", pickers: ["Jamie Chen", "Ben Foster", "Sarah Nguyen"], totesPicked: "0/2", lines: 11, articles: 21, flags: ["locked", "bulk", "specialty"], deliveryIcon: "ondemandDriver", isFresh: true, dispatchByTime: "02:01 PM", propositionLabel: "DoorDash" },
      { id: "r-315709843", orderNo: "315709843", customer: "MILKRUN Gabriel Fraser", status: "Picking", orders: 0, suppliedPercent: 28, suppliedStatus: "picking", pickers: ["Jamie Chen", "Liam O'Connor", "Grace Kim"], totesPicked: "0/3", lines: 22, articles: 22, flags: ["specialty", "locked", "fraud"], deliveryIcon: "ondemandDriver", isFresh: true, dispatchByTime: "02:01 PM", propositionLabel: "MILKRUN" },
      { id: "r-315678390", orderNo: "315678390", customer: "John Turner", status: "Awaiting Pick (PST 02:42 PM)", orders: 2, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/4", lines: 42, articles: 60, flags: ["bulk", "fraud"], deliveryIcon: "ondemandDriver", isFresh: true, dispatchByTime: "02:44 PM", propositionLabel: "DoorDash", ageRestriction: "18" },
      { id: "r-315707820", orderNo: "315707820", customer: "Luke Lambert", status: "Awaiting Pick (PST 02:01 PM)", orders: 320, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/2", lines: 17, articles: 22, flags: ["locked"], deliveryIcon: "ondemandDriver", isFresh: true, dispatchByTime: "02:04 PM", propositionLabel: "Uber" },
      { id: "r-315709772", orderNo: "315709772", customer: "Michael Cox", status: "Awaiting Pick (PST 02:58 PM)", orders: 63, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/2", lines: 23, articles: 30, flags: [], deliveryIcon: "ondemandDriver", isFresh: true, dispatchByTime: "02:56 PM", propositionLabel: "DoorDash", ageRestriction: "16" },
      { id: "r-297031871", orderNo: "297031871", customer: "Addison Williams", status: "DIS 12:56 PM", orders: 52, suppliedPercent: 94, suppliedStatus: "packed", pickers: ["Grace Kim", "Priya Singh"], totesPicked: "2/2", lines: 5, articles: 8, flags: ["fraud"], deliveryIcon: "ondemandCustomer", dispatchByTime: "12:59 PM", propositionLabel: "Direct to Boot Now" },
      { id: "r-314793154", orderNo: "314793154", customer: "Layla Davis", status: "DIS 12:26 PM", orders: 100, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Grace Kim", "Frank Ortiz", "Liam O'Connor"], totesPicked: "3/3", lines: 24, articles: 39, flags: ["bulk", "specialty"], deliveryIcon: "ondemandCustomer", dispatchByTime: "12:28 PM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315622876", orderNo: "315622876", customer: "Julian Murphy", status: "DIS 11:25 AM", orders: 100, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Josh Palmer", "Sarah Nguyen"], totesPicked: "4/4", lines: 39, articles: 47, flags: ["specialty", "fraud"], deliveryIcon: "ondemandCustomer", dispatchByTime: "11:23 AM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315635288", orderNo: "315635288", customer: "Christian Murphy", status: "DIS 10:15 AM", orders: 418, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Ben Foster"], totesPicked: "4/4", lines: 28, articles: 38, flags: [], deliveryIcon: "ondemandCustomer", dispatchByTime: "10:14 AM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315636508", orderNo: "315636508", customer: "Dylan Sutton", status: "DIS 09:02 AM", orders: 200, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Liam O'Connor", "Josh Palmer"], totesPicked: "2/2", lines: 10, articles: 13, flags: [], deliveryIcon: "ondemandCustomer", dispatchByTime: "09:01 AM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315637913", orderNo: "315637913", customer: "Bella Watson", status: "DIS 09:57 AM", orders: 10, suppliedPercent: 85, suppliedStatus: "packed", pickers: ["Tom Baxter", "Daniel Reyes", "Frank Ortiz"], totesPicked: "2/2", lines: 21, articles: 26, flags: ["specialty"], deliveryIcon: "ondemandCustomer", dispatchByTime: "09:58 AM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315645526", orderNo: "315645526", customer: "Emma Hunt", status: "DIS 10:37 AM", orders: 110, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Tom Baxter", "Ella Simmons"], totesPicked: "2/2", lines: 22, articles: 30, flags: ["fraud"], deliveryIcon: "ondemandCustomer", dispatchByTime: "10:40 AM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315649007", orderNo: "315649007", customer: "Addison Evans", status: "DIS 10:25 AM", orders: 200, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Josh Palmer", "Liam O'Connor"], totesPicked: "3/3", lines: 15, articles: 17, flags: ["bulk", "specialty"], deliveryIcon: "ondemandCustomer", dispatchByTime: "10:23 AM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315649453", orderNo: "315649453", customer: "Joshua Carter", status: "DIS 10:19 AM", orders: 35, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Ella Simmons"], totesPicked: "3/3", lines: 49, articles: 55, flags: [], deliveryIcon: "ondemandCustomer", dispatchByTime: "10:18 AM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315653071", orderNo: "315653071", customer: "Grayson Norris", status: "DIS 10:28 AM", orders: 12, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Priya Singh", "Jamie Chen"], totesPicked: "5/5", lines: 37, articles: 47, flags: [], deliveryIcon: "ondemandCustomer", dispatchByTime: "10:29 AM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315659493", orderNo: "315659493", customer: "Thomas Jones", status: "DIS 10:52 AM", orders: 500, suppliedPercent: 89, suppliedStatus: "packed", pickers: ["Liam O'Connor", "Isla Bennett"], totesPicked: "6/6", lines: 38, articles: 41, flags: ["bulk"], deliveryIcon: "ondemandCustomer", dispatchByTime: "10:53 AM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315659784", orderNo: "315659784", customer: "Samantha Ryan", status: "DIS 11:16 AM", orders: 5, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Grace Kim", "Ben Foster", "Isla Bennett"], totesPicked: "4/4", lines: 34, articles: 48, flags: ["specialty"], deliveryIcon: "ondemandCustomer", dispatchByTime: "11:18 AM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315684547", orderNo: "315684547", customer: "Grayson Evans", status: "DIS 12:50 PM", orders: 23, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Harry Doyle", "Daniel Reyes"], totesPicked: "5/5", lines: 41, articles: 52, flags: ["fraud"], deliveryIcon: "ondemandCustomer", dispatchByTime: "12:52 PM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315689674", orderNo: "315689674", customer: "Hazel Palmer", status: "DIS 12:51 PM", orders: 500, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Amy Clarke"], totesPicked: "4/4", lines: 30, articles: 49, flags: [], deliveryIcon: "ondemandCustomer", dispatchByTime: "12:53 PM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315701211", orderNo: "315701211", customer: "Layla Palmer", status: "DIS 01:30 PM", orders: 17, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Josh Palmer"], totesPicked: "3/3", lines: 7, articles: 7, flags: [], deliveryIcon: "ondemandCustomer", dispatchByTime: "01:27 PM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315705251", orderNo: "315705251", customer: "Audrey Richardson", status: "DIS 01:58 PM", orders: 0, suppliedPercent: 96, suppliedStatus: "packed", pickers: ["Isla Bennett", "Ben Foster", "Amy Clarke"], totesPicked: "3/3", lines: 23, articles: 35, flags: ["bulk", "fraud"], deliveryIcon: "ondemandCustomer", isFresh: true, dispatchByTime: "01:59 PM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315708067", orderNo: "315708067", customer: "Harper Ferguson", status: "Awaiting Pick (PST 02:20 PM)", orders: 66, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/5", lines: 29, articles: 39, flags: ["bulk"], deliveryIcon: "ondemandCustomer", isFresh: true, dispatchByTime: "02:21 PM", propositionLabel: "Direct to Boot Now" },
      { id: "r-315708494", orderNo: "315708494", customer: "Michael Cooper", status: "Awaiting Pick (PST 02:01 PM)", orders: 203, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/4", lines: 31, articles: 38, flags: ["locked", "specialty"], deliveryIcon: "ondemandCustomer", isFresh: true, dispatchByTime: "01:59 PM", propositionLabel: "Direct to Boot Now" },
    ],
  },
  {
    id: "g-am",
    label: "5098 AM",
    kind: "session",
    orderValue: 10120.95,
    cutoffTime: "11:00am",
    subGroups: [
      {
        id: "sg-am-09-00-10-00",
        label: "09:00-10:00",
        orderValue: 4790.86,
        rows: [
          { id: "r-313408528", orderNo: "313408528", transitCode: "FBB01", customer: "Levi Griffiths", status: "DIS 11:25 PM", orders: 1000, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Ben Foster"], totesPicked: "4/4", lines: 57, articles: 70, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-314510836", orderNo: "314510836", transitCode: "FBB02", customer: "Ava Green", status: "DIS 11:25 PM", orders: 1000, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Sarah Nguyen", "Josh Palmer"], totesPicked: "5/5", lines: 33, articles: 40, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-315554677", orderNo: "315554677", transitCode: "FBB03", customer: "Connor Ryan", status: "DIS 11:25 PM", orders: 212, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Priya Singh"], totesPicked: "3/3", lines: 16, articles: 19, flags: ["specialty", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315541030", orderNo: "315541030", transitCode: "FBB04", customer: "Levi Fisher", status: "DIS 11:25 PM", orders: 134, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Chloe Martin"], totesPicked: "5/5", lines: 56, articles: 89, flags: ["bulk", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-314971109", orderNo: "314971109", transitCode: "FBB05", customer: "Joshua James", status: "DIS 11:25 PM", orders: 193, suppliedPercent: 88, suppliedStatus: "packed", pickers: ["Jamie Chen"], totesPicked: "4/4", lines: 23, articles: 39, flags: ["bulk"], deliveryIcon: "scheduledFleet" },
          { id: "r-315528337", orderNo: "315528337", transitCode: "FBB06", customer: "Elizabeth Pearce", status: "DIS 11:25 PM", orders: 117, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Chloe Martin", "Priya Singh", "Harry Doyle"], totesPicked: "4/4", lines: 43, articles: 63, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-315562599", orderNo: "315562599", transitCode: "FBB07", customer: "Penelope Davis", status: "DIS 11:25 PM", orders: 208, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Priya Singh"], totesPicked: "4/4", lines: 28, articles: 44, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-313429549", orderNo: "313429549", transitCode: "FBB08", customer: "Levi King", status: "DIS 11:25 PM", orders: 114, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Liam O'Connor", "Isla Bennett"], totesPicked: "4/4", lines: 21, articles: 43, flags: ["bulk", "specialty"], deliveryIcon: "scheduledFleet" },
          { id: "r-315557268", orderNo: "315557268", transitCode: "FBB09", customer: "Anthony Lee", status: "DIS 11:25 PM", orders: 127, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Tom Baxter", "Priya Singh", "Liam O'Connor"], totesPicked: "4/4", lines: 50, articles: 63, flags: ["specialty", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315557662", orderNo: "315557662", transitCode: "FBB10", customer: "David Walker", status: "DIS 11:25 PM", orders: 338, suppliedPercent: 90, suppliedStatus: "packed", pickers: ["Liam O'Connor", "Sarah Nguyen"], totesPicked: "5/5", lines: 33, articles: 47, flags: ["bulk", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315529642", orderNo: "315529642", transitCode: "FBB11", customer: "Josiah Parker", status: "DIS 11:25 PM", orders: 5, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Priya Singh"], totesPicked: "4/4", lines: 37, articles: 50, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-314510825", orderNo: "314510825", transitCode: "FBB12", customer: "Grace Williams", status: "DIS 11:25 PM", orders: 387, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Jamie Chen", "Sarah Nguyen"], totesPicked: "7/7", lines: 63, articles: 89, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-315422050", orderNo: "315422050", transitCode: "FBB13", customer: "Gabriel Foster", status: "DIS 11:25 PM", orders: 77, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Josh Palmer", "Frank Ortiz", "Sarah Nguyen"], totesPicked: "3/3", lines: 31, articles: 58, flags: ["fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315550760", orderNo: "315550760", transitCode: "FBB14", customer: "Lucy Burns", status: "DIS 11:25 PM", orders: 251, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Amy Clarke"], totesPicked: "5/5", lines: 35, articles: 44, flags: ["bulk", "specialty"], deliveryIcon: "scheduledFleet" },
          { id: "r-313429542", orderNo: "313429542", transitCode: "FBB15", customer: "Isaac Wilson", status: "DIS 11:25 PM", orders: 171, suppliedPercent: 59, suppliedStatus: "packed", pickers: ["Liam O'Connor", "Ben Foster"], totesPicked: "4/4", lines: 40, articles: 58, flags: ["specialty", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-314359863", orderNo: "314359863", transitCode: "FBB16", customer: "Zoey Sutton", status: "DIS 11:25 PM", orders: 281, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Ella Simmons", "Amy Clarke"], totesPicked: "6/6", lines: 60, articles: 84, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-314219135", orderNo: "314219135", transitCode: "FBB17", customer: "Oliver Taylor", status: "DIS 11:25 PM", orders: 48, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Priya Singh"], totesPicked: "2/2", lines: 6, articles: 13, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-120548278", orderNo: "120548278", transitCode: "FBB18", customer: "Ava James", status: "DIS 11:25 PM", orders: 113, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Sarah Nguyen", "Josh Palmer"], totesPicked: "5/5", lines: 31, articles: 42, flags: ["specialty"], deliveryIcon: "scheduledFleet" },
        ],
      },
      {
        id: "sg-am-10-00-11-00",
        label: "10:00-11:00",
        orderValue: 5330.09,
        rows: [
          { id: "r-315483986", orderNo: "315483986", transitCode: "FBC01", customer: "Olivia Nelson", status: "Awaiting Pick", orders: 44, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/6", lines: 37, articles: 54, flags: ["fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315525510", orderNo: "315525510", transitCode: "FBC02", customer: "Victoria Grant", status: "Awaiting Pick", orders: 387, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/6", lines: 62, articles: 80, flags: ["bulk", "specialty"], deliveryIcon: "scheduledFleet" },
          { id: "r-314510827", orderNo: "314510827", transitCode: "FBC03", customer: "Ava Bailey", status: "Picking", orders: 90, suppliedPercent: 40, suppliedStatus: "picking", pickers: ["Ben Foster"], totesPicked: "2/5", lines: 35, articles: 49, flags: ["pharmacy"], deliveryIcon: "scheduledFleet" },
          { id: "r-314510812", orderNo: "314510812", transitCode: "FBC04", customer: "Eleanor Hill", status: "Picking", orders: 167, suppliedPercent: 45, suppliedStatus: "picking", pickers: ["Priya Singh", "Frank Ortiz", "Chloe Martin"], totesPicked: "2/4", lines: 35, articles: 54, flags: [], deliveryIcon: "scheduledFleet", onHold: true },
          { id: "r-315496569", orderNo: "315496569", transitCode: "FBC05", customer: "Luna Barnes", status: "Picking", orders: 91, suppliedPercent: 50, suppliedStatus: "picking", pickers: ["Amy Clarke", "Grace Kim"], totesPicked: "4/8", lines: 82, articles: 98, flags: ["bulk", "specialty", "pharmacy"], deliveryIcon: "scheduledFleet" },
          { id: "r-315557285", orderNo: "315557285", transitCode: "FBC06", customer: "Jayden Robinson", status: "Packed", orders: 196, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Frank Ortiz", "Grace Kim", "Liam O'Connor"], totesPicked: "2/2", lines: 11, articles: 12, flags: ["pharmacy"], deliveryIcon: "scheduledFleet" },
          { id: "r-315500122", orderNo: "315500122", transitCode: "FBC07", customer: "Wyatt Duncan", status: "Packed", orders: 196, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Harry Doyle", "Isla Bennett", "Chloe Martin"], totesPicked: "5/5", lines: 28, articles: 43, flags: ["fraud"], deliveryIcon: "scheduledFleet", isAudit: true },
          { id: "r-314377480", orderNo: "314377480", transitCode: "FBC08", customer: "John Phillips", status: "Packed", orders: 199, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Chloe Martin", "Amy Clarke", "Frank Ortiz"], totesPicked: "7/7", lines: 59, articles: 86, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-314510831", orderNo: "314510831", transitCode: "FBC09", customer: "Lucy Gordon", status: "Packed", orders: 53, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Grace Kim", "Frank Ortiz"], totesPicked: "4/4", lines: 56, articles: 61, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-315397531", orderNo: "315397531", transitCode: "FBC10", customer: "Leo Marshall", status: "Packed", orders: 196, suppliedPercent: 84, suppliedStatus: "packed", pickers: ["Isla Bennett", "Sarah Nguyen"], totesPicked: "2/2", lines: 19, articles: 26, flags: ["bulk", "fraud"], deliveryIcon: "scheduledFleet", isReissued: true, isB2B: true },
          { id: "r-315483990", orderNo: "315483990", transitCode: "FBC11", customer: "Liam Webb", status: "Packed", orders: 102, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Grace Kim", "Isla Bennett"], totesPicked: "6/6", lines: 45, articles: 72, flags: ["bulk"], deliveryIcon: "scheduledFleet" },
          { id: "r-315463039", orderNo: "315463039", transitCode: "FBC12", customer: "Eleanor Scott", status: "Packed", orders: 272, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Tom Baxter", "Chloe Martin"], totesPicked: "4/4", lines: 39, articles: 49, flags: ["specialty"], deliveryIcon: "scheduledFleet" },
          { id: "r-313763911", orderNo: "313763911", transitCode: "FBC13", customer: "Layla Curtis", status: "Packed", orders: 33, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Amy Clarke", "Jamie Chen"], totesPicked: "5/5", lines: 36, articles: 46, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-309840919", orderNo: "309840919", transitCode: "FBC14", customer: "Samuel Henderson", status: "Packed", orders: 63, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Liam O'Connor"], totesPicked: "9/9", lines: 101, articles: 170, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-307783164", orderNo: "307783164", transitCode: "FBC15", customer: "Scarlett Powell", status: "Packed", orders: 14, suppliedPercent: 97, suppliedStatus: "packed", pickers: ["Tom Baxter"], totesPicked: "5/5", lines: 44, articles: 60, flags: ["specialty", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315270385", orderNo: "315270385", transitCode: "FBC16", customer: "Luke Harris", status: "Packed", orders: 332, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Frank Ortiz", "Ben Foster", "Jamie Chen"], totesPicked: "4/4", lines: 19, articles: 54, flags: ["bulk", "fraud"], deliveryIcon: "scheduledFleet" },
        ],
      },
      {
        id: "sg-am-no-route",
        label: "No Route",
        orderValue: 0.0,
        rows: [
          { id: "r-314510828", orderNo: "314510828", customer: "Aurora Gordon", status: "Deleted", orders: 196, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["bulk"], isDeleted: true, deliveryIcon: "scheduledFleet" },
          { id: "r-315125085", orderNo: "315125085", customer: "Benjamin Mitchell", status: "Deleted", orders: 211, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], isDeleted: true, deliveryIcon: "scheduledFleet" },
          { id: "r-315243313", orderNo: "315243313", customer: "Olivia Martin", status: "Deleted", orders: 133, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], isDeleted: true, deliveryIcon: "scheduledFleet" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-cdam1",
    label: "5098 CDAM1",
    kind: "session",
    orderValue: 531.29,
    subGroups: [
      {
        id: "sg-cdam1-08-00-09-00",
        label: "08:00-09:00",
        orderValue: 531.29,
        rows: [
          { id: "r-315391934", orderNo: "315391934", customer: "Lucas Carter", status: "Deleted", orders: 32, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["bulk", "specialty"], deliveryIcon: "scheduledCustomer", isDeleted: true },
          { id: "r-315471389", orderNo: "315471389", customer: "John Hughes", status: "DIS 10:29 PM", orders: 32, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Grace Kim", "Isla Bennett"], totesPicked: "6/6", lines: 51, articles: 75, flags: ["specialty", "fraud"], deliveryIcon: "scheduledCustomer" },
          { id: "r-315554882", orderNo: "315554882", customer: "Hunter Henderson", status: "DIS 09:26 PM", orders: 320, suppliedPercent: 84, suppliedStatus: "packed", pickers: ["Grace Kim", "Liam O'Connor", "Ella Simmons"], totesPicked: "6/6", lines: 24, articles: 46, flags: ["bulk", "fraud"], deliveryIcon: "scheduledCustomer" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-cdam2",
    label: "5098 CDAM2",
    kind: "session",
    orderValue: 778.57,
    subGroups: [
      {
        id: "sg-cdam2-09-00-10-00",
        label: "09:00-10:00",
        orderValue: 606.46,
        rows: [
          { id: "r-315565459", orderNo: "315565459", customer: "Jayden Coleman", status: "DIS 08:29 AM", orders: 6, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Isla Bennett", "Grace Kim", "Ella Simmons"], totesPicked: "5/5", lines: 46, articles: 75, flags: [], deliveryIcon: "scheduledCustomer" },
          { id: "r-315569688", orderNo: "315569688", customer: "Owen Edwards", status: "DIS 08:29 AM", orders: 55, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Josh Palmer", "Sarah Nguyen", "Isla Bennett"], totesPicked: "3/3", lines: 20, articles: 42, flags: [], deliveryIcon: "scheduledCustomer" },
        ],
      },
      {
        id: "sg-cdam2-10-00-11-00",
        label: "10:00-11:00",
        orderValue: 172.11,
        rows: [
          { id: "r-315583989", orderNo: "315583989", customer: "Aria Jones", status: "DIS 09:22 AM", orders: 36, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Tom Baxter", "Ben Foster"], totesPicked: "3/3", lines: 27, articles: 32, flags: ["fraud"], deliveryIcon: "scheduledCustomer" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-cdam3",
    label: "5098 CDAM3",
    kind: "session",
    orderValue: 495.38,
    subGroups: [
      {
        id: "sg-cdam3-11-00-12-00",
        label: "11:00-12:00",
        orderValue: 257.01,
        rows: [
          { id: "r-315625974", orderNo: "315625974", customer: "Zoe Turner", status: "DIS 10:38 AM", orders: 91, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Ella Simmons", "Daniel Reyes"], totesPicked: "4/4", lines: 52, articles: 66, flags: ["bulk", "specialty"], deliveryIcon: "scheduledCustomer" },
        ],
      },
      {
        id: "sg-cdam3-12-00-13-00",
        label: "12:00-13:00",
        orderValue: 238.37,
        rows: [
          { id: "r-315537107", orderNo: "315537107", customer: "Connor Chandler", status: "Deleted", orders: 251, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["specialty", "fraud"], deliveryIcon: "scheduledCustomer", isDeleted: true },
          { id: "r-315550406", orderNo: "315550406", customer: "Hazel Bennett", status: "Deleted", orders: 251, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], deliveryIcon: "scheduledCustomer", isDeleted: true },
          { id: "r-315619516", orderNo: "315619516", customer: "David Johnson", status: "DIS 10:39 AM", orders: 28, suppliedPercent: 96, suppliedStatus: "packed", pickers: ["Ella Simmons"], totesPicked: "4/4", lines: 26, articles: 51, flags: [], deliveryIcon: "scheduledCustomer" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-cdmd1",
    label: "5098 CDMD1",
    kind: "session",
    orderValue: 1355.98,
    subGroups: [
      {
        id: "sg-cdmd1-13-00-14-00",
        label: "13:00-14:00",
        orderValue: 686.65,
        rows: [
          { id: "r-315535071", orderNo: "315535071", customer: "Wyatt White", status: "Deleted", orders: 246, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["specialty"], deliveryIcon: "scheduledCustomer", isDeleted: true },
          { id: "r-315566002", orderNo: "315566002", customer: "Aurora Duncan", status: "DIS 12:34 PM", orders: 247, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Amy Clarke", "Liam O'Connor", "Frank Ortiz"], totesPicked: "5/5", lines: 36, articles: 54, flags: ["fraud"], deliveryIcon: "scheduledCustomer" },
          { id: "r-315585212", orderNo: "315585212", customer: "Mason Grant", status: "DIS 12:34 PM", orders: 21, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Ella Simmons", "Sarah Nguyen", "Ben Foster"], totesPicked: "3/3", lines: 35, articles: 50, flags: ["bulk", "specialty"], deliveryIcon: "scheduledCustomer" },
          { id: "r-315599423", orderNo: "315599423", customer: "Samuel White", status: "DIS 12:31 PM", orders: 131, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Isla Bennett"], totesPicked: "4/4", lines: 49, articles: 60, flags: [], deliveryIcon: "scheduledCustomer" },
        ],
      },
      {
        id: "sg-cdmd1-14-00-15-00",
        label: "14:00-15:00",
        orderValue: 669.33,
        rows: [
          { id: "r-315639140", orderNo: "315639140", customer: "Isaiah Bailey", status: "DIS 01:25 PM", orders: 250, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Priya Singh"], totesPicked: "3/3", lines: 14, articles: 17, flags: [], deliveryIcon: "scheduledCustomer" },
          { id: "r-315650494", orderNo: "315650494", customer: "Michael Stewart", status: "DIS 01:17 PM", orders: 270, suppliedPercent: 90, suppliedStatus: "packed", pickers: ["Ben Foster"], totesPicked: "4/4", lines: 29, articles: 41, flags: ["bulk"], deliveryIcon: "scheduledCustomer" },
          { id: "r-315660003", orderNo: "315660003", customer: "Christian Evans", status: "DIS 01:25 PM", orders: 199, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Josh Palmer", "Daniel Reyes", "Frank Ortiz"], totesPicked: "5/5", lines: 54, articles: 75, flags: ["specialty"], deliveryIcon: "scheduledCustomer" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-cdmd2",
    label: "5098 CDMD2",
    kind: "session",
    orderValue: 1447.02,
    subGroups: [
      {
        id: "sg-cdmd2-15-00-16-00",
        label: "15:00-16:00",
        orderValue: 801.27,
        rows: [
          { id: "r-314687729", orderNo: "314687729", customer: "Ella Hunt", status: "Packed", orders: 141, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Ben Foster", "Jamie Chen"], totesPicked: "6/6", lines: 56, articles: 75, flags: ["bulk", "specialty", "fraud", "locked"], deliveryIcon: "scheduledLockerAssigned", nzOnly: true, ageRestriction: "18" },
          { id: "r-315576039", orderNo: "315576039", customer: "Lucy Nguyen", status: "Picking", orders: 1, suppliedPercent: 20, suppliedStatus: "picking", pickers: ["Chloe Martin", "Sarah Nguyen"], totesPicked: "5/7", lines: 51, articles: 76, flags: [], deliveryIcon: "scheduledCustomer", isFirstOrder: true },
          { id: "r-315661318", orderNo: "315661318", customer: "Nora Curtis", status: "Picking", orders: 141, suppliedPercent: 65, suppliedStatus: "picking", pickers: ["Tom Baxter", "Daniel Reyes"], totesPicked: "3/4", lines: 13, articles: 22, flags: ["pharmacy"], deliveryIcon: "scheduledLockerUnassigned", nzOnly: true },
        ],
      },
      {
        id: "sg-cdmd2-16-00-17-00",
        label: "16:00-17:00",
        orderValue: 645.75,
        rows: [
          { id: "r-315629294", orderNo: "315629294", customer: "Andrew Ingram", status: "Packed", orders: 76, suppliedPercent: 98, suppliedStatus: "packed", totesPicked: "3/3", lines: 22, articles: 29, flags: ["bulk", "fraud"], deliveryIcon: "scheduledCustomer" },
          { id: "r-315663189", orderNo: "315663189", customer: "Grace Smith", status: "Picking", orders: 88, suppliedPercent: 33, suppliedStatus: "picking", pickers: ["Grace Kim"], totesPicked: "0/6", lines: 35, articles: 58, flags: ["bulk"], deliveryIcon: "scheduledCustomer" },
          { id: "r-315681100", orderNo: "315681100", customer: "Theodore Watson", status: "Deleted", orders: 36, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["specialty"], deliveryIcon: "scheduledCustomer", isDeleted: true },
          { id: "r-315684246", orderNo: "315684246", customer: "Victoria James", status: "Awaiting Pick", orders: 36, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/2", lines: 30, articles: 37, flags: ["specialty", "pharmacy"], deliveryIcon: "scheduledCustomer", isFresh: true },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-cdpm1",
    label: "5098 CDPM1",
    kind: "session",
    orderValue: 679.53,
    subGroups: [
      {
        id: "sg-cdpm1-17-00-18-00",
        label: "17:00-18:00",
        orderValue: 679.53,
        rows: [
          { id: "r-315096649", orderNo: "315096649", customer: "Layla Chandler", status: "Awaiting Pick", orders: 231, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/1", lines: 14, articles: 26, flags: [], deliveryIcon: "scheduledCustomer", isFresh: true },
          { id: "r-315609491", orderNo: "315609491", customer: "Noah Richardson", status: "Awaiting Pick", orders: 90, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/5", lines: 46, articles: 63, flags: ["specialty", "fraud"], deliveryIcon: "scheduledCustomer", isFresh: true },
          { id: "r-315700628", orderNo: "315700628", customer: "Lucy White", status: "Awaiting Pick", orders: 16, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/4", lines: 33, articles: 45, flags: ["bulk", "fraud"], deliveryIcon: "scheduledCustomer" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-cdpm2",
    label: "5098 CDPM2",
    kind: "session",
    orderValue: 214.97,
    subGroups: [
      {
        id: "sg-cdpm2-19-00-20-00",
        label: "19:00-20:00",
        orderValue: 214.97,
        rows: [
          { id: "r-315673963", orderNo: "315673963", customer: "Luna Jones", status: "Awaiting Pick", orders: 49, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/5", lines: 41, articles: 59, flags: ["bulk"], deliveryIcon: "scheduledCustomer" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-ddam1",
    label: "5098 DDAM1",
    kind: "session",
    orderValue: 1729.3,
    subGroups: [
      {
        id: "sg-ddam1-07-00-08-00",
        label: "07:00-08:00",
        orderValue: 583.06,
        rows: [
          { id: "r-315512422", orderNo: "315512422", customer: "Charles Stewart", status: "DIS 09:25 PM", orders: 215, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Josh Palmer"], totesPicked: "5/5", lines: 63, articles: 72, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315555003", orderNo: "315555003", customer: "Lucas Fisher", status: "DIS 10:19 PM", orders: 17, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Amy Clarke"], totesPicked: "5/5", lines: 38, articles: 67, flags: [], deliveryIcon: "scheduledDriver" },
        ],
      },
      {
        id: "sg-ddam1-08-30-09-30",
        label: "08:30-09:30",
        orderValue: 1146.24,
        rows: [
          { id: "r-313427050", orderNo: "313427050", customer: "Samantha Lowe", status: "DIS 08:17 PM", orders: 29, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Priya Singh"], totesPicked: "2/2", lines: 25, articles: 42, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-313448464", orderNo: "313448464", customer: "Hannah Wilson", status: "DIS 08:17 PM", orders: 18, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Amy Clarke", "Ella Simmons", "Ben Foster"], totesPicked: "5/5", lines: 27, articles: 46, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-314305555", orderNo: "314305555", customer: "Ezra Johnson", status: "DIS 09:23 PM", orders: 107, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Daniel Reyes"], totesPicked: "4/4", lines: 47, articles: 56, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-314497691", orderNo: "314497691", customer: "Hunter Reynolds", status: "DIS 09:24 PM", orders: 180, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Harry Doyle"], totesPicked: "2/2", lines: 26, articles: 50, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315340551", orderNo: "315340551", customer: "Nathan Knight", status: "DIS 09:24 PM", orders: 10, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Liam O'Connor", "Harry Doyle"], totesPicked: "3/3", lines: 41, articles: 51, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315540268", orderNo: "315540268", customer: "Mason Bennett", status: "DIS 08:17 PM", orders: 51, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Ben Foster", "Priya Singh"], totesPicked: "3/3", lines: 10, articles: 15, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315556423", orderNo: "315556423", customer: "Jack Baker", status: "DIS 08:17 PM", orders: 95, suppliedPercent: 96, suppliedStatus: "packed", pickers: ["Liam O'Connor", "Jamie Chen", "Harry Doyle"], totesPicked: "4/4", lines: 38, articles: 55, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-ddam2",
    label: "5098 DDAM2",
    kind: "session",
    orderValue: 8681.69,
    subGroups: [
      {
        id: "sg-ddam2-09-30-10-30",
        label: "09:30-10:30",
        orderValue: 5177.41,
        rows: [
          { id: "r-311886396", orderNo: "311886396", customer: "Nathan Norris", status: "DIS 08:38 AM", orders: 69, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Josh Palmer", "Priya Singh"], totesPicked: "11/11", lines: 56, articles: 83, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-314507818", orderNo: "314507818", customer: "Leo Ferguson", status: "DIS 08:38 AM", orders: 123, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Amy Clarke", "Ben Foster", "Chloe Martin"], totesPicked: "4/4", lines: 22, articles: 31, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-314509953", orderNo: "314509953", customer: "Matthew Reid", status: "Deleted", orders: 129, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-314510063", orderNo: "314510063", customer: "Alexander Ryan", status: "DIS 08:38 AM", orders: 338, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Jamie Chen", "Josh Palmer", "Liam O'Connor"], totesPicked: "6/6", lines: 57, articles: 74, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315032173", orderNo: "315032173", customer: "Sophia Kennedy", status: "DIS 08:38 AM", orders: 82, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Jamie Chen"], totesPicked: "2/2", lines: 35, articles: 53, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315196377", orderNo: "315196377", customer: "Brooklyn Harris", status: "DIS 08:38 AM", orders: 199, suppliedPercent: 84, suppliedStatus: "packed", pickers: ["Tom Baxter", "Harry Doyle", "Grace Kim"], totesPicked: "6/6", lines: 68, articles: 104, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315500764", orderNo: "315500764", customer: "Isaac Kelly", status: "DIS 08:38 AM", orders: 91, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Amy Clarke"], totesPicked: "4/4", lines: 31, articles: 36, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315505122", orderNo: "315505122", customer: "Sofia Palmer", status: "DIS 08:38 AM", orders: 16, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Josh Palmer"], totesPicked: "5/5", lines: 46, articles: 63, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315512413", orderNo: "315512413", customer: "Penelope Mason", status: "DIS 08:38 AM", orders: 53, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Frank Ortiz", "Daniel Reyes", "Sarah Nguyen"], totesPicked: "4/4", lines: 46, articles: 57, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
          { id: "r-315522262", orderNo: "315522262", customer: "Dylan Hamilton", status: "DIS 08:38 AM", orders: 44, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Sarah Nguyen", "Liam O'Connor"], totesPicked: "2/2", lines: 17, articles: 25, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315525649", orderNo: "315525649", customer: "Eleanor Ellis", status: "DIS 08:38 AM", orders: 144, suppliedPercent: 91, suppliedStatus: "packed", pickers: ["Isla Bennett", "Liam O'Connor", "Sarah Nguyen"], totesPicked: "5/5", lines: 66, articles: 91, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315538197", orderNo: "315538197", customer: "Alexander Hill", status: "Deleted", orders: 73, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315550331", orderNo: "315550331", customer: "Chloe Hill", status: "DIS 08:38 AM", orders: 130, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Jamie Chen"], totesPicked: "5/5", lines: 52, articles: 61, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315557835", orderNo: "315557835", customer: "Andrew Lambert", status: "DIS 08:38 AM", orders: 74, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Amy Clarke", "Isla Bennett", "Ben Foster"], totesPicked: "4/4", lines: 61, articles: 90, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315564510", orderNo: "315564510", customer: "Christian Webb", status: "DIS 08:38 AM", orders: 35, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Amy Clarke", "Frank Ortiz"], totesPicked: "6/6", lines: 42, articles: 57, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
          { id: "r-315567925", orderNo: "315567925", customer: "Anna Hill", status: "DIS 08:38 AM", orders: 120, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Harry Doyle"], totesPicked: "2/2", lines: 25, articles: 37, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315580824", orderNo: "315580824", customer: "Brooklyn Knight", status: "DIS 08:38 AM", orders: 104, suppliedPercent: 86, suppliedStatus: "packed", pickers: ["Frank Ortiz"], totesPicked: "4/4", lines: 44, articles: 61, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315582905", orderNo: "315582905", customer: "Nora Parker", status: "DIS 08:38 AM", orders: 52, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Frank Ortiz", "Ben Foster", "Amy Clarke"], totesPicked: "4/4", lines: 49, articles: 73, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315587571", orderNo: "315587571", customer: "Hunter Lambert", status: "DIS 08:38 AM", orders: 33, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Sarah Nguyen", "Liam O'Connor", "Ben Foster"], totesPicked: "3/3", lines: 30, articles: 39, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315591702", orderNo: "315591702", customer: "Emma Ward", status: "DIS 08:38 AM", orders: 119, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Sarah Nguyen", "Josh Palmer", "Harry Doyle"], totesPicked: "5/5", lines: 63, articles: 73, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315596497", orderNo: "315596497", customer: "Sofia Fisher", status: "Deleted", orders: 18, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["bulk"], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315597393", orderNo: "315597393", customer: "Matthew Cox", status: "DIS 08:38 AM", orders: 134, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Chloe Martin", "Ella Simmons", "Frank Ortiz"], totesPicked: "3/3", lines: 17, articles: 35, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315599933", orderNo: "315599933", customer: "Sophia Hughes", status: "DIS 08:38 AM", orders: 18, suppliedPercent: 51, suppliedStatus: "packed", pickers: ["Frank Ortiz", "Sarah Nguyen", "Priya Singh"], totesPicked: "6/6", lines: 53, articles: 70, flags: [], deliveryIcon: "scheduledDriver" },
        ],
      },
      {
        id: "sg-ddam2-10-30-11-30",
        label: "10:30-11:30",
        orderValue: 3504.28,
        rows: [
          { id: "r-314270549", orderNo: "314270549", customer: "Michael Campbell", status: "DIS 09:34 AM", orders: 81, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Grace Kim"], totesPicked: "8/8", lines: 12, articles: 18, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315436548", orderNo: "315436548", customer: "Brooklyn Wright", status: "DIS 09:34 AM", orders: 81, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Frank Ortiz"], totesPicked: "4/4", lines: 32, articles: 44, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315497109", orderNo: "315497109", customer: "Owen Cox", status: "DIS 09:34 AM", orders: 30, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Jamie Chen", "Frank Ortiz"], totesPicked: "5/5", lines: 52, articles: 78, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315500366", orderNo: "315500366", customer: "Levi Reynolds", status: "DIS 09:34 AM", orders: 68, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Jamie Chen", "Chloe Martin"], totesPicked: "4/4", lines: 21, articles: 26, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315537484", orderNo: "315537484", customer: "Caleb Holt", status: "DIS 09:34 AM", orders: 8, suppliedPercent: 72, suppliedStatus: "packed", pickers: ["Sarah Nguyen", "Ben Foster"], totesPicked: "5/5", lines: 70, articles: 76, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315543544", orderNo: "315543544", customer: "Abigail Hunt", status: "DIS 09:34 AM", orders: 21, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Chloe Martin"], totesPicked: "3/3", lines: 21, articles: 23, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315552025", orderNo: "315552025", customer: "Lillian Holt", status: "DIS 09:34 AM", orders: 127, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Ella Simmons", "Isla Bennett", "Liam O'Connor"], totesPicked: "4/4", lines: 46, articles: 89, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315562446", orderNo: "315562446", customer: "Asher Harris", status: "DIS 09:34 AM", orders: 56, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Ella Simmons"], totesPicked: "3/3", lines: 20, articles: 27, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315564668", orderNo: "315564668", customer: "William Smith", status: "DIS 09:34 AM", orders: 24, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Ella Simmons"], totesPicked: "4/4", lines: 39, articles: 49, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315571369", orderNo: "315571369", customer: "Matthew Wright", status: "DIS 09:34 AM", orders: 156, suppliedPercent: 97, suppliedStatus: "packed", pickers: ["Isla Bennett"], totesPicked: "4/4", lines: 42, articles: 55, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315589845", orderNo: "315589845", customer: "Thomas Lee", status: "DIS 09:34 AM", orders: 48, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Grace Kim"], totesPicked: "6/6", lines: 55, articles: 93, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315597137", orderNo: "315597137", customer: "Samuel Foster", status: "DIS 09:34 AM", orders: 134, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Harry Doyle"], totesPicked: "3/3", lines: 32, articles: 41, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315598591", orderNo: "315598591", customer: "Daniel Brown", status: "DIS 09:34 AM", orders: 70, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Harry Doyle", "Ella Simmons", "Sarah Nguyen"], totesPicked: "3/3", lines: 22, articles: 28, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315598895", orderNo: "315598895", customer: "Caleb Jenkins", status: "DIS 09:34 AM", orders: 185, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Priya Singh", "Isla Bennett"], totesPicked: "4/4", lines: 50, articles: 86, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315611061", orderNo: "315611061", customer: "Nora Duncan", status: "DIS 09:34 AM", orders: 214, suppliedPercent: 80, suppliedStatus: "packed", pickers: ["Ella Simmons", "Ben Foster"], totesPicked: "5/5", lines: 22, articles: 38, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315615566", orderNo: "315615566", customer: "Leah Brown", status: "DIS 09:34 AM", orders: 350, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Frank Ortiz", "Isla Bennett", "Chloe Martin"], totesPicked: "5/5", lines: 35, articles: 55, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-ddam3",
    label: "5098 DDAM3",
    kind: "session",
    orderValue: 5784.03,
    subGroups: [
      {
        id: "sg-ddam3-11-30-12-30",
        label: "11:30-12:30",
        orderValue: 3292.17,
        rows: [
          { id: "r-307609947", orderNo: "307609947", customer: "Ryan Hill", status: "DIS 10:38 AM", orders: 61, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Amy Clarke"], totesPicked: "3/3", lines: 28, articles: 45, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-314816758", orderNo: "314816758", customer: "Elizabeth Taylor", status: "DIS 10:38 AM", orders: 102, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Priya Singh"], totesPicked: "4/4", lines: 20, articles: 44, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315510222", orderNo: "315510222", customer: "Owen Wood", status: "DIS 10:38 AM", orders: 84, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Grace Kim", "Harry Doyle"], totesPicked: "3/3", lines: 29, articles: 38, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315572035", orderNo: "315572035", customer: "Anna Evans", status: "Deleted", orders: 48, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315578071", orderNo: "315578071", customer: "Owen Hamilton", status: "DIS 10:38 AM", orders: 68, suppliedPercent: 57, suppliedStatus: "packed", pickers: ["Ben Foster"], totesPicked: "5/5", lines: 37, articles: 70, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315580319", orderNo: "315580319", customer: "Dylan Evans", status: "DIS 10:38 AM", orders: 194, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Liam O'Connor"], totesPicked: "3/3", lines: 21, articles: 24, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
          { id: "r-315583387", orderNo: "315583387", customer: "Isabella Phillips", status: "DIS 10:38 AM", orders: 94, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Harry Doyle"], totesPicked: "5/5", lines: 31, articles: 50, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315583665", orderNo: "315583665", customer: "Paisley Jones", status: "DIS 10:38 AM", orders: 76, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Amy Clarke", "Tom Baxter", "Isla Bennett"], totesPicked: "2/2", lines: 21, articles: 31, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315611143", orderNo: "315611143", customer: "James Richardson", status: "Deleted", orders: 48, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315617969", orderNo: "315617969", customer: "Michael Wood", status: "DIS 10:38 AM", orders: 148, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Josh Palmer", "Jamie Chen"], totesPicked: "8/8", lines: 35, articles: 61, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315625798", orderNo: "315625798", customer: "Andrew Fraser", status: "DIS 10:38 AM", orders: 49, suppliedPercent: 95, suppliedStatus: "packed", pickers: ["Ella Simmons", "Jamie Chen"], totesPicked: "3/3", lines: 17, articles: 32, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315626022", orderNo: "315626022", customer: "Ryan Wilson", status: "DIS 10:38 AM", orders: 637, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Priya Singh", "Liam O'Connor", "Harry Doyle"], totesPicked: "5/5", lines: 37, articles: 48, flags: ["bulk"], deliveryIcon: "scheduledDriver", isFresh: true },
          { id: "r-315631473", orderNo: "315631473", customer: "Owen Simpson", status: "DIS 10:38 AM", orders: 49, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Tom Baxter", "Daniel Reyes"], totesPicked: "3/3", lines: 32, articles: 46, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315632159", orderNo: "315632159", customer: "Isaiah Wilson", status: "Deleted", orders: 77, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315634412", orderNo: "315634412", customer: "Eli Gordon", status: "DIS 10:38 AM", orders: 77, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Frank Ortiz"], totesPicked: "5/5", lines: 44, articles: 64, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver", isFresh: true },
          { id: "r-315635442", orderNo: "315635442", customer: "Harper Jenkins", status: "DIS 10:38 AM", orders: 279, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Priya Singh"], totesPicked: "5/5", lines: 49, articles: 88, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315636911", orderNo: "315636911", customer: "Anna Wilson", status: "DIS 10:38 AM", orders: 79, suppliedPercent: 97, suppliedStatus: "packed", pickers: ["Ben Foster", "Chloe Martin", "Grace Kim"], totesPicked: "6/6", lines: 43, articles: 68, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315636992", orderNo: "315636992", customer: "Riley Harris", status: "DIS 10:38 AM", orders: 27, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Sarah Nguyen", "Tom Baxter"], totesPicked: "3/3", lines: 24, articles: 33, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315637295", orderNo: "315637295", customer: "Hannah Butler", status: "DIS 10:38 AM", orders: 2, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Liam O'Connor", "Ella Simmons", "Ben Foster"], totesPicked: "3/3", lines: 20, articles: 31, flags: [], deliveryIcon: "scheduledDriver", isFresh: true },
        ],
      },
      {
        id: "sg-ddam3-12-30-13-30",
        label: "12:30-13:30",
        orderValue: 2491.86,
        rows: [
          { id: "r-313864884", orderNo: "313864884", customer: "Luke Nelson", status: "DIS 11:25 AM", orders: 12, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Ben Foster", "Isla Bennett"], totesPicked: "4/4", lines: 42, articles: 60, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-314116290", orderNo: "314116290", customer: "Natalie Gordon", status: "DIS 11:25 AM", orders: 2, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Tom Baxter"], totesPicked: "7/7", lines: 62, articles: 77, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315471565", orderNo: "315471565", customer: "Andrew Green", status: "DIS 11:25 AM", orders: 122, suppliedPercent: 82, suppliedStatus: "packed", pickers: ["Chloe Martin"], totesPicked: "5/5", lines: 28, articles: 31, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315551511", orderNo: "315551511", customer: "Andrew Phillips", status: "DIS 11:25 AM", orders: 40, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Jamie Chen"], totesPicked: "4/4", lines: 45, articles: 52, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315558125", orderNo: "315558125", customer: "Hunter Parker", status: "DIS 11:25 AM", orders: 39, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Ben Foster", "Chloe Martin"], totesPicked: "4/4", lines: 25, articles: 29, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315579350", orderNo: "315579350", customer: "Evelyn Parker", status: "DIS 11:25 AM", orders: 400, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Chloe Martin"], totesPicked: "4/4", lines: 30, articles: 40, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315579447", orderNo: "315579447", customer: "Liam Hughes", status: "DIS 11:25 AM", orders: 282, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Amy Clarke"], totesPicked: "2/2", lines: 18, articles: 22, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315583318", orderNo: "315583318", customer: "William Sutton", status: "DIS 11:25 AM", orders: 84, suppliedPercent: 67, suppliedStatus: "packed", pickers: ["Daniel Reyes"], totesPicked: "2/2", lines: 22, articles: 25, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315585135", orderNo: "315585135", customer: "Theodore Bennett", status: "DIS 11:25 AM", orders: 58, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Tom Baxter", "Amy Clarke"], totesPicked: "5/5", lines: 51, articles: 67, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315593215", orderNo: "315593215", customer: "Gabriel Phillips", status: "DIS 11:25 AM", orders: 168, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Tom Baxter", "Chloe Martin"], totesPicked: "4/4", lines: 30, articles: 47, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315628868", orderNo: "315628868", customer: "Addison Gordon", status: "DIS 11:25 AM", orders: 142, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Isla Bennett", "Daniel Reyes", "Josh Palmer"], totesPicked: "7/7", lines: 31, articles: 58, flags: ["bulk"], deliveryIcon: "scheduledDriver", ageRestriction: "16" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-ddmd1",
    label: "5098 DDMD1",
    kind: "session",
    orderValue: 6126.17,
    subGroups: [
      {
        id: "sg-ddmd1-13-30-14-30",
        label: "13:30-14:30",
        orderValue: 4069.34,
        rows: [
          { id: "r-311471382", orderNo: "311471382", customer: "Ethan James", status: "DIS 12:36 PM", orders: 0, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Ben Foster", "Ella Simmons"], totesPicked: "3/3", lines: 31, articles: 45, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-313088890", orderNo: "313088890", customer: "Dylan Anderson", status: "DIS 12:36 PM", orders: 27, suppliedPercent: 65, suppliedStatus: "packed", pickers: ["Frank Ortiz", "Harry Doyle", "Josh Palmer"], totesPicked: "10/10", lines: 77, articles: 124, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315328203", orderNo: "315328203", customer: "Natalie Clarke", status: "Deleted", orders: 191, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315554355", orderNo: "315554355", customer: "Henry Reynolds", status: "Deleted", orders: 636, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315567258", orderNo: "315567258", customer: "Nathan Murphy", status: "DIS 12:36 PM", orders: 48, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Ben Foster", "Harry Doyle"], totesPicked: "2/2", lines: 21, articles: 25, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315576978", orderNo: "315576978", customer: "Penelope Mason", status: "DIS 12:36 PM", orders: 32, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Grace Kim"], totesPicked: "2/2", lines: 11, articles: 16, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
          { id: "r-315618850", orderNo: "315618850", customer: "Chloe Baker", status: "DIS 12:36 PM", orders: 23, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Amy Clarke"], totesPicked: "5/5", lines: 24, articles: 28, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315631436", orderNo: "315631436", customer: "Zoe Murphy", status: "DIS 12:36 PM", orders: 55, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Ben Foster", "Priya Singh"], totesPicked: "3/3", lines: 17, articles: 28, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315633788", orderNo: "315633788", customer: "Zoey Robinson", status: "DIS 12:36 PM", orders: 34, suppliedPercent: 88, suppliedStatus: "packed", pickers: ["Harry Doyle"], totesPicked: "2/2", lines: 32, articles: 55, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315633811", orderNo: "315633811", customer: "Elizabeth White", status: "DIS 12:36 PM", orders: 2, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Frank Ortiz", "Isla Bennett", "Harry Doyle"], totesPicked: "4/4", lines: 22, articles: 28, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315636305", orderNo: "315636305", customer: "Isaac Carter", status: "DIS 12:36 PM", orders: 30, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Liam O'Connor"], totesPicked: "3/3", lines: 35, articles: 57, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315637800", orderNo: "315637800", customer: "Natalie Kelly", status: "DIS 12:36 PM", orders: 111, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Chloe Martin"], totesPicked: "6/6", lines: 51, articles: 71, flags: ["bulk"], deliveryIcon: "scheduledDriver", ageRestriction: "18" },
          { id: "r-315638797", orderNo: "315638797", customer: "Amelia Curtis", status: "DIS 12:36 PM", orders: 64, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Tom Baxter"], totesPicked: "7/7", lines: 47, articles: 90, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315640475", orderNo: "315640475", customer: "Claire Pearce", status: "DIS 12:36 PM", orders: 387, suppliedPercent: 97, suppliedStatus: "packed", pickers: ["Ben Foster"], totesPicked: "3/3", lines: 38, articles: 43, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315641585", orderNo: "315641585", customer: "Grayson Carter", status: "DIS 12:36 PM", orders: 41, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Josh Palmer", "Chloe Martin", "Daniel Reyes"], totesPicked: "4/4", lines: 33, articles: 48, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315647554", orderNo: "315647554", customer: "Ella Douglas", status: "DIS 12:36 PM", orders: 74, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Josh Palmer", "Ben Foster"], totesPicked: "4/4", lines: 25, articles: 32, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315650672", orderNo: "315650672", customer: "Anthony Taylor", status: "DIS 12:36 PM", orders: 91, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Isla Bennett"], totesPicked: "5/5", lines: 41, articles: 51, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315651855", orderNo: "315651855", customer: "Theodore Reid", status: "DIS 12:36 PM", orders: 192, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Harry Doyle", "Josh Palmer"], totesPicked: "4/4", lines: 23, articles: 28, flags: [], deliveryIcon: "scheduledDriver", isFresh: true },
          { id: "r-315659741", orderNo: "315659741", customer: "Isabella Wright", status: "DIS 12:36 PM", orders: 50, suppliedPercent: 97, suppliedStatus: "packed", pickers: ["Grace Kim"], totesPicked: "6/6", lines: 43, articles: 88, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315663021", orderNo: "315663021", customer: "Jayden Henderson", status: "DIS 12:36 PM", orders: 126, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Josh Palmer"], totesPicked: "2/2", lines: 11, articles: 11, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315664095", orderNo: "315664095", customer: "William Roberts", status: "DIS 12:37 PM", orders: 39, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Grace Kim", "Daniel Reyes", "Priya Singh"], totesPicked: "3/3", lines: 34, articles: 39, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
        ],
      },
      {
        id: "sg-ddmd1-14-30-15-30",
        label: "14:30-15:30",
        orderValue: 2056.83,
        rows: [
          { id: "r-315480345", orderNo: "315480345", customer: "Asher Gray", status: "DIS 01:25 PM", orders: 243, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Liam O'Connor", "Chloe Martin", "Frank Ortiz"], totesPicked: "3/3", lines: 19, articles: 37, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315487245", orderNo: "315487245", customer: "Leah Dixon", status: "DIS 01:25 PM", orders: 82, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Grace Kim", "Amy Clarke", "Harry Doyle"], totesPicked: "3/3", lines: 26, articles: 34, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315564394", orderNo: "315564394", customer: "John Cook", status: "DIS 01:25 PM", orders: 62, suppliedPercent: 77, suppliedStatus: "packed", pickers: ["Liam O'Connor", "Ella Simmons", "Tom Baxter"], totesPicked: "7/7", lines: 50, articles: 70, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315569171", orderNo: "315569171", customer: "Charles Sutton", status: "Deleted", orders: 37, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["specialty"], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315596861", orderNo: "315596861", customer: "Jayden James", status: "Deleted", orders: 123, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["fraud"], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315605131", orderNo: "315605131", customer: "Liam Walker", status: "DIS 01:25 PM", orders: 38, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Priya Singh", "Amy Clarke"], totesPicked: "4/4", lines: 35, articles: 55, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315616501", orderNo: "315616501", customer: "Luke Knight", status: "Deleted", orders: 74, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315623439", orderNo: "315623439", customer: "Luna Evans", status: "DIS 01:12 PM", orders: 237, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Harry Doyle"], totesPicked: "4/4", lines: 45, articles: 72, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315626758", orderNo: "315626758", customer: "Luke Dixon", status: "DIS 01:25 PM", orders: 54, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Harry Doyle", "Ben Foster"], totesPicked: "5/5", lines: 39, articles: 49, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
          { id: "r-315637011", orderNo: "315637011", customer: "Lily Carter", status: "DIS 01:13 PM", orders: 124, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Jamie Chen", "Isla Bennett"], totesPicked: "5/5", lines: 49, articles: 77, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315660643", orderNo: "315660643", customer: "Mia Russell", status: "DIS 01:13 PM", orders: 58, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Tom Baxter", "Sarah Nguyen"], totesPicked: "3/3", lines: 27, articles: 31, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315661910", orderNo: "315661910", customer: "Isaac Richardson", status: "DIS 01:13 PM", orders: 74, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Ben Foster", "Jamie Chen"], totesPicked: "4/4", lines: 57, articles: 77, flags: [], deliveryIcon: "scheduledDriver", isFresh: true },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-ddmd2",
    label: "5098 DDMD2",
    kind: "session",
    orderValue: 8216.65,
    subGroups: [
      {
        id: "sg-ddmd2-15-30-16-30",
        label: "15:30-16:30",
        orderValue: 4313.37,
        rows: [
          { id: "r-310338793", orderNo: "310338793", customer: "Nathan Hamilton", status: "Picking", orders: 11, suppliedPercent: 30, suppliedStatus: "picking", pickers: ["Grace Kim", "Liam O'Connor"], totesPicked: "1/2", lines: 8, articles: 13, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-312900593", orderNo: "312900593", customer: "Joseph Douglas", status: "Picking", orders: 10, suppliedPercent: 23, suppliedStatus: "picking", pickers: ["Isla Bennett", "Josh Palmer"], totesPicked: "3/4", lines: 19, articles: 25, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315542293", orderNo: "315542293", customer: "Michael Ward", status: "Picking", orders: 100, suppliedPercent: 52, suppliedStatus: "picking", pickers: ["Ella Simmons", "Ben Foster", "Jamie Chen"], totesPicked: "1/3", lines: 43, articles: 57, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
          { id: "r-315574442", orderNo: "315574442", customer: "Leo Lowe", status: "Picking", orders: 1000, suppliedPercent: 47, suppliedStatus: "picking", pickers: ["Grace Kim", "Josh Palmer"], totesPicked: "6/7", lines: 48, articles: 90, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315579653", orderNo: "315579653", customer: "Lucas Sutton", status: "Deleted", orders: 25, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315583157", orderNo: "315583157", customer: "Addison Nelson", status: "Picking", orders: 25, suppliedPercent: 44, suppliedStatus: "picking", pickers: ["Grace Kim"], totesPicked: "3/4", lines: 31, articles: 46, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315628382", orderNo: "315628382", customer: "Isaac Price", status: "Picking", orders: 169, suppliedPercent: 13, suppliedStatus: "picking", pickers: ["Liam O'Connor", "Sarah Nguyen"], totesPicked: "5/6", lines: 60, articles: 103, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315642377", orderNo: "315642377", customer: "Riley Manning", status: "Packed", orders: 200, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Daniel Reyes", "Isla Bennett", "Tom Baxter"], totesPicked: "6/6", lines: 42, articles: 76, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315650515", orderNo: "315650515", customer: "Leo Marshall", status: "Packed", orders: 124, suppliedPercent: 72, suppliedStatus: "packed", pickers: ["Amy Clarke", "Ben Foster"], totesPicked: "5/5", lines: 27, articles: 32, flags: ["bulk"], deliveryIcon: "scheduledDriver", isB2B: true },
          { id: "r-315654400", orderNo: "315654400", customer: "Emily Chapman", status: "Picking", orders: 59, suppliedPercent: 26, suppliedStatus: "picking", pickers: ["Ella Simmons"], totesPicked: "3/4", lines: 28, articles: 40, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315654457", orderNo: "315654457", customer: "Noah Turner", status: "Picking", orders: 76, suppliedPercent: 12, suppliedStatus: "picking", pickers: ["Grace Kim", "Harry Doyle"], totesPicked: "2/4", lines: 48, articles: 86, flags: [], deliveryIcon: "scheduledDriver", ageRestriction: "16" },
          { id: "r-315654903", orderNo: "315654903", customer: "Leo Reid", status: "Picking", orders: 38, suppliedPercent: 52, suppliedStatus: "picking", pickers: ["Isla Bennett"], totesPicked: "2/3", lines: 34, articles: 54, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315665272", orderNo: "315665272", customer: "Grace Hamilton", status: "Picking", orders: 15, suppliedPercent: 29, suppliedStatus: "picking", pickers: ["Liam O'Connor"], totesPicked: "1/3", lines: 20, articles: 21, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315667547", orderNo: "315667547", customer: "Liam Douglas", status: "Picking", orders: 26, suppliedPercent: 54, suppliedStatus: "picking", pickers: ["Josh Palmer"], totesPicked: "2/3", lines: 39, articles: 63, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315668687", orderNo: "315668687", customer: "Carter Ingram", status: "Picking", orders: 169, suppliedPercent: 20, suppliedStatus: "picking", pickers: ["Priya Singh"], totesPicked: "2/3", lines: 28, articles: 46, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315671427", orderNo: "315671427", customer: "Hazel Brooks", status: "Picking", orders: 22, suppliedPercent: 22, suppliedStatus: "picking", pickers: ["Amy Clarke", "Jamie Chen"], totesPicked: "1/4", lines: 40, articles: 43, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315671594", orderNo: "315671594", customer: "Caleb Mason", status: "Picking", orders: 80, suppliedPercent: 46, suppliedStatus: "picking", pickers: ["Daniel Reyes", "Josh Palmer"], totesPicked: "1/2", lines: 12, articles: 20, flags: ["fraud", "pharmacy"], deliveryIcon: "scheduledDriver" },
          { id: "r-315671978", orderNo: "315671978", customer: "Ella Stewart", status: "Picking", orders: 22, suppliedPercent: 37, suppliedStatus: "picking", pickers: ["Grace Kim", "Frank Ortiz", "Liam O'Connor"], totesPicked: "1/2", lines: 12, articles: 14, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315673002", orderNo: "315673002", customer: "Benjamin Osborne", status: "Picking", orders: 21, suppliedPercent: 34, suppliedStatus: "picking", pickers: ["Josh Palmer"], totesPicked: "2/4", lines: 22, articles: 43, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315677071", orderNo: "315677071", customer: "Emma Harris", status: "Picking", orders: 14, suppliedPercent: 27, suppliedStatus: "picking", pickers: ["Amy Clarke", "Grace Kim"], totesPicked: "6/8", lines: 49, articles: 87, flags: ["pharmacy"], deliveryIcon: "scheduledDriver" },
          { id: "r-315681741", orderNo: "315681741", customer: "Harper Green", status: "Picking", orders: 500, suppliedPercent: 34, suppliedStatus: "picking", pickers: ["Liam O'Connor", "Josh Palmer", "Harry Doyle"], totesPicked: "4/5", lines: 38, articles: 49, flags: ["pharmacy"], deliveryIcon: "scheduledDriver" },
          { id: "r-315684879", orderNo: "315684879", customer: "Ava Baker", status: "Picking", orders: 82, suppliedPercent: 18, suppliedStatus: "picking", pickers: ["Ben Foster", "Grace Kim"], totesPicked: "1/3", lines: 24, articles: 32, flags: ["pharmacy"], deliveryIcon: "scheduledDriver" },
        ],
      },
      {
        id: "sg-ddmd2-16-30-17-30",
        label: "16:30-17:30",
        orderValue: 3903.28,
        rows: [
          { id: "r-314617165", orderNo: "314617165", customer: "Penelope Fraser", status: "Awaiting Pick", orders: 169, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/6", lines: 53, articles: 95, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315567671", orderNo: "315567671", customer: "Hannah Parker", status: "Awaiting Pick", orders: 136, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/4", lines: 38, articles: 52, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315636221", orderNo: "315636221", customer: "Josiah Cook", status: "Picking", orders: 29, suppliedPercent: 26, suppliedStatus: "picking", pickers: ["Josh Palmer", "Harry Doyle"], totesPicked: "0/3", lines: 26, articles: 33, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315647481", orderNo: "315647481", customer: "Wyatt Foster", status: "Awaiting Pick", orders: 370, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/2", lines: 19, articles: 23, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315660947", orderNo: "315660947", customer: "Daniel Clarke", status: "Picking", orders: 43, suppliedPercent: 27, suppliedStatus: "picking", pickers: ["Tom Baxter", "Priya Singh", "Daniel Reyes"], totesPicked: "0/4", lines: 36, articles: 45, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
          { id: "r-315672457", orderNo: "315672457", customer: "Joseph Webb", status: "Awaiting Pick", orders: 131, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/5", lines: 28, articles: 35, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315674259", orderNo: "315674259", customer: "Josiah Bennett", status: "Awaiting Pick", orders: 310, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/5", lines: 43, articles: 71, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315674893", orderNo: "315674893", transitCode: "JBC07", customer: "Lillian Osborne", status: "Picking", orders: 193, suppliedPercent: 28, suppliedStatus: "picking", pickers: ["Harry Doyle"], totesPicked: "0/6", lines: 69, articles: 100, flags: [], deliveryIcon: "scheduledLockerAssigned", nzOnly: true },
          { id: "r-315676857", orderNo: "315676857", customer: "Joshua Webb", status: "Picking", orders: 66, suppliedPercent: 65, suppliedStatus: "picking", pickers: ["Frank Ortiz", "Isla Bennett"], totesPicked: "0/5", lines: 41, articles: 48, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315680420", orderNo: "315680420", customer: "Abigail Turner", status: "Awaiting Pick", orders: 9, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/2", lines: 19, articles: 27, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315682119", orderNo: "315682119", customer: "Luna Fisher", status: "Awaiting Pick", orders: 93, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/4", lines: 34, articles: 42, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
          { id: "r-315682386", orderNo: "315682386", customer: "Audrey Griffiths", status: "Awaiting Pick", orders: 31, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/3", lines: 20, articles: 25, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315682537", orderNo: "315682537", customer: "Skylar Stewart", status: "Picking", orders: 99, suppliedPercent: 68, suppliedStatus: "picking", pickers: ["Amy Clarke"], totesPicked: "0/6", lines: 36, articles: 49, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315682632", orderNo: "315682632", transitCode: "JBC09", customer: "Sofia Robinson", status: "Awaiting Pick", orders: 51, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/4", lines: 36, articles: 48, flags: [], deliveryIcon: "scheduledLockerUnassigned", nzOnly: true },
          { id: "r-315685767", orderNo: "315685767", customer: "Isaiah Chapman", status: "Awaiting Pick", orders: 132, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/5", lines: 43, articles: 97, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315689534", orderNo: "315689534", customer: "Nora Turner", status: "Awaiting Pick", orders: 145, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/6", lines: 42, articles: 62, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315694926", orderNo: "315694926", customer: "Grace Stewart", status: "Awaiting Pick", orders: 63, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/2", lines: 8, articles: 9, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
          { id: "r-315696830", orderNo: "315696830", customer: "Emily Morris", status: "Awaiting Pick", orders: 225, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/2", lines: 13, articles: 15, flags: [], deliveryIcon: "scheduledDriver" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-ddpm1",
    label: "5098 DDPM1",
    kind: "session",
    orderValue: 3299.23,
    subGroups: [
      {
        id: "sg-ddpm1-17-30-18-30",
        label: "17:30-18:30",
        orderValue: 3299.23,
        rows: [
          { id: "r-146038726", orderNo: "146038726", customer: "Benjamin Bennett", status: "Awaiting Pick", orders: 16, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/4", lines: 32, articles: 53, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-291644098", orderNo: "291644098", customer: "Victoria Foster", status: "Awaiting Pick", orders: 12, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/1", lines: 13, articles: 14, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-314622124", orderNo: "314622124", customer: "Joseph Johnson", status: "Awaiting Pick", orders: 26, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/1", lines: 8, articles: 9, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-314743951", orderNo: "314743951", customer: "Riley Webb", status: "Awaiting Pick", orders: 60, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/3", lines: 30, articles: 40, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315302438", orderNo: "315302438", customer: "Charlotte Cox", status: "Awaiting Pick", orders: 85, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/5", lines: 46, articles: 63, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315552290", orderNo: "315552290", customer: "Lily Reynolds", status: "Awaiting Pick", orders: 69, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/4", lines: 39, articles: 58, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315591264", orderNo: "315591264", customer: "Josiah Marshall", status: "Deleted", orders: 16, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["fraud"], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315611932", orderNo: "315611932", customer: "Grayson Lowe", status: "Awaiting Pick", orders: 1, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/8", lines: 68, articles: 93, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver", isFirstOrder: true },
          { id: "r-315632331", orderNo: "315632331", customer: "Aria Chandler", status: "Deleted", orders: 2, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["specialty", "fraud"], deliveryIcon: "scheduledDriver", isDeleted: true },
          { id: "r-315669114", orderNo: "315669114", customer: "Mason Bailey", status: "Awaiting Pick", orders: 49, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/7", lines: 62, articles: 80, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315671832", orderNo: "315671832", customer: "Bella Ellis", status: "Awaiting Pick", orders: 105, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/3", lines: 24, articles: 25, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315674185", orderNo: "315674185", customer: "James Butler", status: "Awaiting Pick", orders: 16, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/7", lines: 61, articles: 83, flags: ["specialty"], deliveryIcon: "scheduledDriver", isFresh: true },
          { id: "r-315674575", orderNo: "315674575", customer: "Aurora Ward", status: "Awaiting Pick", orders: 16, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/3", lines: 28, articles: 38, flags: ["fraud"], deliveryIcon: "scheduledDriver" },
          { id: "r-315685821", orderNo: "315685821", customer: "Violet Coleman", status: "Awaiting Pick", orders: 258, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/2", lines: 16, articles: 20, flags: ["bulk", "specialty"], deliveryIcon: "scheduledDriver" },
          { id: "r-315689520", orderNo: "315689520", customer: "Anthony Watson", status: "Awaiting Pick", orders: 152, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/1", lines: 9, articles: 10, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315691801", orderNo: "315691801", customer: "Jack Marshall", status: "Awaiting Pick", orders: 89, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/1", lines: 13, articles: 15, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315700578", orderNo: "315700578", customer: "Savannah Curtis", status: "Awaiting Pick", orders: 7, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/5", lines: 43, articles: 61, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
          { id: "r-315701802", orderNo: "315701802", customer: "Amelia Baker", status: "Awaiting Pick", orders: 27, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/3", lines: 26, articles: 34, flags: ["specialty"], deliveryIcon: "scheduledDriver", isFresh: true },
          { id: "r-315703706", orderNo: "315703706", customer: "Jayden Fraser", status: "Awaiting Pick", orders: 20, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/1", lines: 15, articles: 20, flags: ["fraud"], deliveryIcon: "scheduledDriver", isFresh: true },
          { id: "r-315707661", orderNo: "315707661", customer: "Amelia Pearce", status: "Awaiting Pick", orders: 55, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/1", lines: 6, articles: 7, flags: [], deliveryIcon: "scheduledDriver", isFresh: true },
          { id: "r-315340364", orderNo: "315340364", customer: "Elizabeth Anderson", status: "Awaiting Pick", orders: 92, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/5", lines: 40, articles: 58, flags: [], deliveryIcon: "scheduledDriver" },
          { id: "r-315666399", orderNo: "315666399", customer: "Mia Marshall", status: "Awaiting Pick", orders: 130, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/2", lines: 19, articles: 25, flags: ["bulk", "fraud"], deliveryIcon: "scheduledDriver" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-ddpm2",
    label: "5098 DDPM2",
    kind: "session",
    orderValue: 454.13,
    subGroups: [
      {
        id: "sg-ddpm2-19-30-20-30",
        label: "19:30-20:30",
        orderValue: 454.13,
        rows: [
          { id: "r-315549407", orderNo: "315549407", customer: "Luke White", status: "Awaiting Pick", orders: 6, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/3", lines: 27, articles: 28, flags: ["bulk"], deliveryIcon: "scheduledDriver" },
          { id: "r-315699003", orderNo: "315699003", customer: "Claire Edwards", status: "Awaiting Pick", orders: 106, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/4", lines: 39, articles: 53, flags: ["specialty"], deliveryIcon: "scheduledDriver" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: "g-pm",
    label: "5098 PM",
    kind: "session",
    orderValue: 6014.68,
    subGroups: [
      {
        id: "sg-pm-12-00-13-00",
        label: "12:00-13:00",
        orderValue: 2366.1,
        rows: [
          { id: "r-312689162", orderNo: "312689162", transitCode: "JBB0001", customer: "Grace Bell", status: "DIS 01:11 PM", orders: 6, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Frank Ortiz"], totesPicked: "3/3", lines: 23, articles: 30, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-314019907", orderNo: "314019907", transitCode: "JBB0002", customer: "Brooklyn Cooper", status: "DIS 01:11 PM", orders: 86, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Chloe Martin", "Liam O'Connor", "Priya Singh"], totesPicked: "3/3", lines: 34, articles: 53, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-315608790", orderNo: "315608790", transitCode: "JBB01", customer: "Audrey Carter", status: "DIS 01:11 PM", orders: 22, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Isla Bennett", "Harry Doyle"], totesPicked: "6/6", lines: 52, articles: 64, flags: ["specialty", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-314971110", orderNo: "314971110", transitCode: "JBB02", customer: "Evelyn Graham", status: "DIS 01:11 PM", orders: 190, suppliedPercent: 96, suppliedStatus: "packed", pickers: ["Amy Clarke", "Isla Bennett"], totesPicked: "5/5", lines: 36, articles: 64, flags: ["bulk", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315488657", orderNo: "315488657", transitCode: "JBB03", customer: "Aria Fraser", status: "DIS 01:11 PM", orders: 116, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Priya Singh", "Daniel Reyes"], totesPicked: "8/8", lines: 69, articles: 86, flags: ["bulk"], deliveryIcon: "scheduledFleet" },
          { id: "r-315419461", orderNo: "315419461", transitCode: "JBB04", customer: "Charles Phillips", status: "DIS 01:11 PM", orders: 182, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Amy Clarke", "Frank Ortiz", "Ella Simmons"], totesPicked: "3/3", lines: 14, articles: 21, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-315596025", orderNo: "315596025", transitCode: "JBB05", customer: "Isaac Kelly", status: "DIS 01:11 PM", orders: 54, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Priya Singh"], totesPicked: "3/3", lines: 7, articles: 12, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-314888498", orderNo: "314888498", transitCode: "JBB06", customer: "Aurora Johnson", status: "DIS 01:11 PM", orders: 1, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Jamie Chen", "Ella Simmons", "Frank Ortiz"], totesPicked: "3/3", lines: 32, articles: 48, flags: ["bulk", "specialty"], isFirstOrder: true, deliveryIcon: "scheduledFleet" },
          { id: "r-315651390", orderNo: "315651390", transitCode: "JBB0601", customer: "Eleanor Wilson", status: "DIS 01:11 PM", orders: 114, suppliedPercent: 97, suppliedStatus: "packed", pickers: ["Sarah Nguyen", "Amy Clarke", "Tom Baxter"], totesPicked: "2/2", lines: 25, articles: 36, flags: ["specialty", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315566959", orderNo: "315566959", transitCode: "JBB07", customer: "Oliver Palmer", status: "DIS 01:11 PM", orders: 462, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Priya Singh"], totesPicked: "5/5", lines: 58, articles: 63, flags: ["bulk", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-314062682", orderNo: "314062682", transitCode: "JBB08", customer: "Levi Lambert", status: "DIS 01:11 PM", orders: 100, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Tom Baxter", "Amy Clarke", "Priya Singh"], totesPicked: "5/5", lines: 22, articles: 31, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-313429532", orderNo: "313429532", transitCode: "JBB09", customer: "Paisley Duncan", status: "DIS 01:11 PM", orders: 196, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Ella Simmons", "Liam O'Connor", "Amy Clarke"], totesPicked: "4/4", lines: 35, articles: 46, flags: [], deliveryIcon: "scheduledFleet" },
        ],
      },
      {
        id: "sg-pm-13-00-14-00",
        label: "13:00-14:00",
        orderValue: 3648.58,
        rows: [
          { id: "r-315529207", orderNo: "315529207", transitCode: "JBC0001", customer: "Nora Ingram", status: "Awaiting Pick", orders: 4, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/5", lines: 66, articles: 96, flags: ["fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315423943", orderNo: "315423943", transitCode: "JBC01", customer: "Abigail Davis", status: "Awaiting Pick", orders: 142, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/4", lines: 40, articles: 60, flags: ["bulk", "specialty"], deliveryIcon: "scheduledFleet" },
          { id: "r-315569032", orderNo: "315569032", transitCode: "JBC02", customer: "Violet Palmer", status: "Picking", orders: 175, suppliedPercent: 30, suppliedStatus: "picking", pickers: ["Priya Singh", "Jamie Chen", "Ella Simmons"], totesPicked: "2/4", lines: 60, articles: 67, flags: ["specialty", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-314468319", orderNo: "314468319", transitCode: "JBC03", customer: "Asher Duncan", status: "Picking", orders: 63, suppliedPercent: 45, suppliedStatus: "picking", pickers: ["Ben Foster", "Grace Kim", "Josh Palmer"], totesPicked: "2/4", lines: 16, articles: 22, flags: [], deliveryIcon: "scheduledFleet", ageRestriction: "18" },
          { id: "r-315584817", orderNo: "315584817", transitCode: "JBC04", customer: "Bella Powell", status: "Picking", orders: 16, suppliedPercent: 50, suppliedStatus: "picking", pickers: ["Josh Palmer", "Grace Kim", "Priya Singh"], totesPicked: "3/5", lines: 18, articles: 25, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-315597486", orderNo: "315597486", transitCode: "JBC05", customer: "Andrew King", status: "Packed", orders: 94, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Jamie Chen", "Daniel Reyes", "Sarah Nguyen"], totesPicked: "12/12", lines: 73, articles: 108, flags: ["specialty"], deliveryIcon: "scheduledFleet" },
          { id: "r-315577941", orderNo: "315577941", transitCode: "JBC06", customer: "Isabella Webb", status: "Packed", orders: 331, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Daniel Reyes"], totesPicked: "6/6", lines: 66, articles: 94, flags: ["fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315497002", orderNo: "315497002", transitCode: "JBC07", customer: "Noah King", status: "Packed", orders: 1, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Ben Foster", "Frank Ortiz", "Chloe Martin"], totesPicked: "1/1", lines: 2, articles: 7, flags: ["bulk", "specialty"], isFirstOrder: true, deliveryIcon: "scheduledFleet" },
          { id: "r-314510824", orderNo: "314510824", transitCode: "JBC0701", customer: "Jack Reid", status: "Packed", orders: 292, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Liam O'Connor", "Priya Singh"], totesPicked: "6/6", lines: 57, articles: 81, flags: ["pharmacy"], deliveryIcon: "scheduledFleet" },
          { id: "r-314404453", orderNo: "314404453", transitCode: "JBC08", customer: "Mia Palmer", status: "Packed", orders: 93, suppliedPercent: 97, suppliedStatus: "packed", pickers: ["Sarah Nguyen", "Ella Simmons", "Josh Palmer"], totesPicked: "4/4", lines: 46, articles: 61, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-259406497", orderNo: "259406497", transitCode: "JBC09", customer: "Mason Graham", status: "Packed", orders: 23, suppliedPercent: 98, suppliedStatus: "packed", pickers: ["Josh Palmer", "Priya Singh", "Chloe Martin"], totesPicked: "6/6", lines: 12, articles: 18, flags: ["bulk"], deliveryIcon: "scheduledFleet" },
          { id: "r-315648166", orderNo: "315648166", transitCode: "JBC0901", customer: "Joseph Gray", status: "Packed", orders: 314, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Priya Singh"], totesPicked: "5/5", lines: 43, articles: 68, flags: ["specialty"], isFresh: true, deliveryIcon: "scheduledFleet" },
          { id: "r-315594468", orderNo: "315594468", transitCode: "JBC10", customer: "Matthew Chandler", status: "Packed", orders: 572, suppliedPercent: 100, suppliedStatus: "packed", pickers: ["Isla Bennett", "Jamie Chen"], totesPicked: "2/2", lines: 15, articles: 28, flags: ["fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315457740", orderNo: "315457740", transitCode: "JBC11", customer: "Victoria Osborne", status: "Packed", orders: 278, suppliedPercent: 99, suppliedStatus: "packed", pickers: ["Jamie Chen", "Sarah Nguyen"], totesPicked: "2/2", lines: 14, articles: 26, flags: ["pharmacy"], deliveryIcon: "scheduledFleet" },
          { id: "r-313126858", orderNo: "313126858", customer: "Alexander Campbell", status: "Deleted", orders: 277, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], isDeleted: true, deliveryIcon: "scheduledFleet" },
          { id: "r-315440304", orderNo: "315440304", customer: "Asher Douglas", status: "Deleted", orders: 330, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["bulk", "fraud"], isDeleted: true, deliveryIcon: "scheduledFleet" },
          { id: "r-315486122", orderNo: "315486122", customer: "Chloe Douglas", status: "Deleted", orders: 116, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["bulk"], isDeleted: true, deliveryIcon: "scheduledFleet" },
          { id: "r-315533222", orderNo: "315533222", customer: "Alexander Burns", status: "Deleted", orders: 462, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: ["specialty"], isDeleted: true, deliveryIcon: "scheduledFleet" },
          { id: "r-315638905", orderNo: "315638905", customer: "Jack Richardson", status: "Deleted", orders: 314, suppliedPercent: 0, suppliedStatus: "deleted", totesPicked: "0/1", lines: 0, articles: 0, flags: [], isDeleted: true, deliveryIcon: "scheduledFleet" },
        ],
      },
    ],
    rows: [],
  },
  {
    id: NO_ROUTE_GROUP_ID,
    label: "5098 NO ROUTE",
    kind: "session",
    orderValue: 0,
    subGroups: [
      {
        id: NO_ROUTE_SUBGROUP_ID,
        label: "NO ROUTE",
        orderValue: 0,
        rows: [
          { id: "r-315712004", orderNo: "315712004", customer: "Freya Whitfield", status: "Awaiting Pick", orders: 8, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/0", lines: 18, articles: 24, flags: ["bulk"], deliveryIcon: "scheduledFleet" },
          { id: "r-315712118", orderNo: "315712118", customer: "Ronan Delacroix", status: "Awaiting Pick", orders: 41, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/0", lines: 12, articles: 15, flags: ["fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315712233", orderNo: "315712233", customer: "Marnie Ostrowski", status: "Awaiting Pick", orders: 3, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/0", lines: 27, articles: 33, flags: ["specialty", "fraud"], deliveryIcon: "scheduledFleet" },
          { id: "r-315712347", orderNo: "315712347", customer: "Declan Fitzsimmons", status: "Awaiting Pick", orders: 156, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/0", lines: 9, articles: 11, flags: [], deliveryIcon: "scheduledFleet" },
          { id: "r-315712461", orderNo: "315712461", customer: "Talia Kowalczyk", status: "Awaiting Pick", orders: 22, suppliedPercent: 0, suppliedStatus: "notStarted", totesPicked: "0/0", lines: 33, articles: 44, flags: ["bulk", "specialty"], deliveryIcon: "scheduledFleet", ageRestriction: "18" },
        ],
      },
    ],
    rows: [],
  },
]

/** All orders in the same top-to-bottom order OrdersTable renders them (groups, then subgroups within session groups). */
export function getFlattenedOrders(): OrderRow[] {
  return orderGroups.flatMap((group) =>
    group.kind === 'onDemand' ? group.rows : group.subGroups.flatMap((sg) => sg.rows),
  )
}

/** Deterministic 0-1 hash of a string, so mock-data flags stay stable across reloads without being stored per row. */
function hashToUnit(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return (hash % 1000) / 1000
}

// Assign packingSlipRequired to ~30% of orders, deterministically by id.
for (const row of getFlattenedOrders()) {
  row.packingSlipRequired = hashToUnit(row.id) < 0.3
}

// Assign isB2B (B2B customer) to ~10% of orders, deterministically by id, prioritising
// 'bulk'-flagged orders first so demo-able B2B orders line up with bulk-handling ones.
{
  const allRows = getFlattenedOrders()
  const b2bTargetCount = Math.round(allRows.length * 0.1)
  const byHash = (a: OrderRow, b: OrderRow) => hashToUnit(a.id) - hashToUnit(b.id)
  const bulkRows = allRows.filter((row) => row.flags.includes('bulk')).sort(byHash)
  const otherRows = allRows.filter((row) => !row.flags.includes('bulk')).sort(byHash)
  for (const row of [...bulkRows, ...otherRows].slice(0, b2bTargetCount)) {
    row.isB2B = true
  }
}

/** The store this prototype's hardcoded data belongs to (matches the "5098" prefix baked into
 * group labels above). Other stores' data for "Search all stores" is synthesized from it below. */
export const HOME_STORE_ID = '5098'

/** Extra 4-digit store numbers synthesized (by cloning HOME_STORE_ID's data) so "Search all
 * stores" in Search Orders has more than one store to actually group results by. */
export const OTHER_STORE_IDS = ['6217', '3054'] as const

export const ALL_STORE_IDS = [HOME_STORE_ID, ...OTHER_STORE_IDS]

for (const row of getFlattenedOrders()) {
  row.storeId = HOME_STORE_ID
}

/** Clones `groups` for another store: remaps ids/order numbers/labels so they don't collide with
 * the source store's, and stamps every row with the new storeId. */
function cloneGroupsForStore(groups: Group[], storeId: string): Group[] {
  const remapOrderNo = (orderNo: string) => storeId[0] + orderNo.slice(1)
  const cloneRow = (row: OrderRow): OrderRow => ({
    ...row,
    id: `${storeId}-${row.id}`,
    orderNo: remapOrderNo(row.orderNo),
    storeId,
  })
  return groups.map((group) => ({
    ...group,
    id: `${storeId}-${group.id}`,
    label: group.label.replace(HOME_STORE_ID, storeId),
    rows: group.rows.map(cloneRow),
    subGroups: group.subGroups.map((subGroup) => ({
      ...subGroup,
      id: `${storeId}-${subGroup.id}`,
      rows: subGroup.rows.map(cloneRow),
    })),
  }))
}

const SYNTHETIC_STORE_GROUPS: Record<string, Group[]> = Object.fromEntries(
  OTHER_STORE_IDS.map((storeId) => [storeId, cloneGroupsForStore(orderGroups, storeId)]),
)

function getGroupsForStore(storeId: string): Group[] {
  return storeId === HOME_STORE_ID ? orderGroups : (SYNTHETIC_STORE_GROUPS[storeId] ?? [])
}

/** All orders across every store (HOME_STORE_ID plus the synthesized OTHER_STORE_IDS) — used only
 * by Search Orders' "Search all stores" mode; every other page stays scoped to the home store via
 * getFlattenedOrders(). */
export function getFlattenedOrdersAllStores(): OrderRow[] {
  return ALL_STORE_IDS.flatMap((storeId) => getAllOrderRows(getGroupsForStore(storeId)))
}

const sessionWindowMapsByStore = new Map<string, Map<string, SessionWindowInfo>>()

/** Store-scoped version of getOrderSessionAndWindow, for looking up orders that may belong to a
 * synthesized store (whose order numbers aren't in the home store's map built by buildSessionWindowMap). */
export function getOrderSessionAndWindowForStore(orderNo: string, storeId: string): SessionWindowInfo | null {
  if (storeId === HOME_STORE_ID) return getOrderSessionAndWindow(orderNo)
  let map = sessionWindowMapsByStore.get(storeId)
  if (!map) {
    map = new Map<string, SessionWindowInfo>()
    for (const group of getGroupsForStore(storeId)) {
      if (group.kind === 'onDemand') {
        for (const row of group.rows) map.set(row.orderNo, { session: group.label, window: group.label })
      } else if (group.kind === 'session') {
        for (const subGroup of group.subGroups) {
          for (const row of subGroup.rows) map.set(row.orderNo, { session: group.label, window: subGroup.label })
        }
      }
    }
    sessionWindowMapsByStore.set(storeId, map)
  }
  return map.get(orderNo) ?? null
}

/** Looks up an order by orderNo along with its position in the flattened (table-order) sequence, for prev/next navigation. */
export function findOrder(orderNo: string): { order: OrderRow; index: number; all: OrderRow[] } | null {
  const all = getFlattenedOrders()
  const index = all.findIndex((row) => row.orderNo === orderNo)
  if (index === -1) return null
  return { order: all[index], index, all }
}

export interface SessionWindowInfo {
  /** AU: the order's session/on-demand label (e.g. "5098 AM"). */
  session: string
  /** NZ: the order's window label (e.g. "08:00-09:00") — the session group's subGroup label,
   * or the same as session for on-demand orders (which don't have sub-windows). */
  window: string
}

let sessionWindowByOrderNo: Map<string, SessionWindowInfo> | null = null

function buildSessionWindowMap(): Map<string, SessionWindowInfo> {
  const map = new Map<string, SessionWindowInfo>()
  for (const group of orderGroups) {
    if (group.kind === 'onDemand') {
      for (const row of group.rows) map.set(row.orderNo, { session: group.label, window: group.label })
    } else if (group.kind === 'session') {
      for (const subGroup of group.subGroups) {
        for (const row of subGroup.rows) map.set(row.orderNo, { session: group.label, window: subGroup.label })
      }
    }
  }
  return map
}

/** Looks up which session (AU) / window (NZ) an order was picked in — used by Search Orders results. */
export function getOrderSessionAndWindow(orderNo: string): SessionWindowInfo | null {
  if (!sessionWindowByOrderNo) sessionWindowByOrderNo = buildSessionWindowMap()
  return sessionWindowByOrderNo.get(orderNo) ?? null
}

/**
 * Customer / Driver Collection orders (On Demand or Scheduled) — shown as a "Location ID" chip
 * in the Routing cell. Hidden for orders still Awaiting Pick, since no location has been
 * assigned yet.
 */
export function hasLocationId(row: Pick<OrderRow, 'deliveryIcon' | 'status'>): boolean {
  const isPropositionMatch =
    row.deliveryIcon === 'scheduledCustomer' ||
    row.deliveryIcon === 'scheduledDriver' ||
    row.deliveryIcon === 'ondemandCustomer' ||
    row.deliveryIcon === 'ondemandDriver'
  const isAwaiting = row.status.startsWith('Awaiting Pick')
  return isPropositionMatch && !isAwaiting
}

let locationIdByOrderNo: Map<string, string> | null = null

function buildLocationIdMap(): Map<string, string> {
  const map = new Map<string, string>()
  let counter = 0
  for (const row of getFlattenedOrders()) {
    if (!hasLocationId(row)) continue
    counter += 1
    map.set(row.orderNo, String(counter).padStart(3, '0'))
  }
  return map
}

/**
 * Unique, sequentially-incrementing "001" style id, so the same order always shows the same
 * Location ID everywhere it appears (Order Summary table + Order Details page) and no two
 * orders eligible for one (see hasLocationId) ever collide — same sequential-assignment pattern
 * as getLockerId/getDropCode. A prior hash-derived 2-digit id (01-99) collided constantly once
 * more than ~99 orders were eligible at once.
 */
export function getLocationId(orderNo: string): string {
  if (!locationIdByOrderNo) locationIdByOrderNo = buildLocationIdMap()
  return locationIdByOrderNo.get(orderNo) ?? '???'
}

/** Fleet route's window start time (24h "HHMM"), keyed by "<session label>|<route label>" — used
 * to build NZ's Drop Code. AU keeps the route's raw transitCode as-is (its Transit Code). */
const FLEET_WINDOW_START: Record<string, string> = {
  '5098 AM|BB': '0700',
  '5098 AM|BC': '0900',
  '5098 PM|BB': '1700',
  '5098 PM|BC': '1900',
}

let dropCodeByOrderNo: Map<string, string> | null = null

function buildDropCodeMap(): Map<string, string> {
  const map = new Map<string, string>()
  const sequenceByRoute = new Map<string, number>()
  for (const group of orderGroups) {
    if (group.kind !== 'session') continue
    for (const subGroup of group.subGroups) {
      for (const row of subGroup.rows) {
        if (row.deliveryIcon !== 'scheduledFleet' || !row.transitCode) continue
        const routeKey = `${group.label}|${subGroup.label}`
        const sequence = (sequenceByRoute.get(routeKey) ?? 0) + 1
        sequenceByRoute.set(routeKey, sequence)
        const time = FLEET_WINDOW_START[routeKey] ?? '0700'
        const quadrant = Math.floor(hashToUnit(row.orderNo) * 6) + 1
        map.set(row.orderNo, `${String(sequence).padStart(3, '0')}-Q${quadrant}-${time}-FR`)
      }
    }
  }
  return map
}

/** NZ's Fleet routing code — "XXX-QX-TIME-FR": XXX increments 001+ within the route, Q is a
 * delivery quadrant 1-6, TIME is the route's window start. NZ-equivalent of AU's Transit Code. */
export function getDropCode(orderNo: string): string | undefined {
  if (!dropCodeByOrderNo) dropCodeByOrderNo = buildDropCodeMap()
  return dropCodeByOrderNo.get(orderNo)
}

let lockerIdByOrderNo: Map<string, string> | null = null

function buildLockerIdMap(): Map<string, string> {
  const map = new Map<string, string>()
  let counter = 0
  for (const row of getFlattenedOrders()) {
    if (row.deliveryIcon !== 'scheduledLockerAssigned') continue
    counter += 1
    map.set(row.orderNo, `LOCK${String(counter).padStart(3, '0')}`)
  }
  return map
}

/** NZ Locker orders only, and only once the locker has been assigned (see scheduledLockerAssigned
 * vs scheduledLockerUnassigned) — a unique, sequentially-incrementing "LOCK001" style id. */
export function getLockerId(orderNo: string): string | undefined {
  if (!lockerIdByOrderNo) lockerIdByOrderNo = buildLockerIdMap()
  return lockerIdByOrderNo.get(orderNo)
}

/**
 * Whether the On Demand DIS (dispatch-by) time should be shown next to the Routing cell's
 * Location ID chip. NZ always shows it for On Demand orders; AU only shows it when the order
 * is PST locked.
 */
export function shouldShowOnDemandDisTime(row: Pick<OrderRow, 'flags'>, isNZ: boolean): boolean {
  return isNZ || row.flags.includes('locked')
}

export type RoutingDisplay = { kind: 'locationId'; value: string } | { kind: 'code'; value: string } | { kind: 'none' }

/**
 * What to render in the Order Summary / Order Details "Routing" cell for a row. AU: Location ID
 * chip for Customer/Driver Collection, Transit Code text for Fleet. NZ: same Location ID chip,
 * Drop Code text for Fleet, Locker ID text for Locker (once assigned) — see PRD notes on Routing.
 */
export function getRoutingDisplay(
  row: Pick<OrderRow, 'deliveryIcon' | 'status' | 'orderNo' | 'transitCode'>,
  isNZ: boolean,
): RoutingDisplay {
  if (hasLocationId(row)) return { kind: 'locationId', value: getLocationId(row.orderNo) }
  if (row.deliveryIcon === 'scheduledFleet' && row.transitCode) {
    return { kind: 'code', value: isNZ ? (getDropCode(row.orderNo) ?? row.transitCode) : row.transitCode }
  }
  if (isNZ && row.deliveryIcon === 'scheduledLockerAssigned') {
    const lockerId = getLockerId(row.orderNo)
    if (lockerId) return { kind: 'code', value: lockerId }
  }
  return { kind: 'none' }
}
