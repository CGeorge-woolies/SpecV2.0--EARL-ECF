import { Fragment, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import {
  ChevronRightFilled,
  FlagBulk,
  FlagFraudChallenge,
  FlagMilestoneOrder,
  FlagPackingSlipRequired,
  FlagPharmacy,
  FlagPickStartTimeLock,
  FlagSpecialtyPrep,
  KeyboardArrowDownFilled,
  PauseFilled,
  PlayArrowFilled,
  WarningFilled,
  type IconComponent,
} from '@/components/icons/material-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  stickyThClass,
  stickyThStuckShadowClass,
  stickyThStyle,
  theadStyle,
  useStickyHeaderShadow,
} from '@/components/shared/StickyTableContainer'
import { LocationIdChip } from '@/components/shared/LocationIdChip'
import { useStore } from '@/context/StoreContext'
import tokens from '@/theme/tokens'
import {
  orderGroups,
  flattenSessionGroupsToWindows,
  getAllOrderRows,
  getAgeRestrictionDisplay,
  getMilestoneOrderDisplay,
  getRoutingDisplay,
  getPropositionDisplay,
  isEveningWindow,
  isNoRouteGroup,
  shouldShowOnDemandDisTime,
  ORDER_FLAG_FILTERS,
  type Group,
  type OrderFlagKey,
  type OrderRow,
  type SubGroup,
} from './orderGroups'
import { splitOrderSupply } from './supplyChannels'
import type { DemoWindowState } from './DemoWindowStateToggle'

export const FLAG_COLUMNS = [
  { key: 'proposition', abbr: 'P', label: 'Proposition', width: '2.6%' },
  // Bulk = order has a line at/above the "Bulk Order Line Quantity" threshold set in Admin Console
  // (e.g. ORD QTY >= 24), not an order-total value/weight threshold — see OrderRow.flags.
  { key: 'bulk', abbr: 'B', label: 'Bulk', width: '2.6%' },
  { key: 'specialty', abbr: 'S', label: 'Specialty items', width: '2.6%' },
  { key: 'ageRestricted', abbr: 'A', label: 'Age Restricted', width: '2.6%' },
  { key: 'fraud', abbr: 'F', label: 'Fraud Challenged', width: '2.6%' },
] as const

export function getVisibleFlagColumns() {
  return FLAG_COLUMNS
}

export const FLAG_ICONS: Partial<Record<(typeof FLAG_COLUMNS)[number]['key'], IconComponent>> = {
  bulk: FlagBulk,
  specialty: FlagSpecialtyPrep,
  fraud: FlagFraudChallenge,
}

// Column order (all store types, for consistency): Order No, Routing, Customer,
// [Status — eStore has none], Supply column(s), Totes Picked, Lines, Articles.
export const COLUMNS_DEFAULT = [
  { key: 'orderNo', label: 'Order No', align: 'left', width: '11%' },
  { key: 'transitCode', label: 'Routing', align: 'left', width: '11%' },
  { key: 'customer', label: 'Customer', align: 'left', width: '17%' },
  { key: 'status', label: 'Status', align: 'left', width: '12%' },
  { key: 'supplied', label: 'Supplied %', align: 'left', width: '12%' },
  { key: 'totesPicked', label: 'Totes Picked', align: 'right', width: '5%' },
  { key: 'lines', label: 'Lines', align: 'right', width: '5%' },
  { key: 'articles', label: 'Articles', align: 'right', width: '5%' },
] as const

// eStore, Split Supply View ON: no in-store "Status" column, and no Total column — just eCom / Shop Floor.
export const COLUMNS_ESTORE_SPLIT = [
  { key: 'orderNo', label: 'Order No', align: 'left', width: '11%' },
  { key: 'transitCode', label: 'Routing', align: 'left', width: '11%' },
  { key: 'customer', label: 'Customer', align: 'left', width: '17%' },
  { key: 'ecomSupply', label: 'eCom Supply', align: 'left', width: '12%' },
  { key: 'shopFloorSupply', label: 'Shop Floor Supply', align: 'left', width: '12%' },
  { key: 'totesPicked', label: 'Totes Picked', align: 'right', width: '5%' },
  { key: 'lines', label: 'Lines', align: 'right', width: '5%' },
  { key: 'articles', label: 'Articles', align: 'right', width: '5%' },
] as const

// eStore, Split Supply View OFF: eCom/Shop Floor collapse into one Total Order Supply column, and the
// same Status column supermarkets/CFCs show comes back (there's no split-cell layout eating its slot).
export const COLUMNS_ESTORE_COMBINED = [
  { key: 'orderNo', label: 'Order No', align: 'left', width: '11%' },
  { key: 'transitCode', label: 'Routing', align: 'left', width: '11%' },
  { key: 'customer', label: 'Customer', align: 'left', width: '17%' },
  { key: 'status', label: 'Status', align: 'left', width: '12%' },
  { key: 'totalSupply', label: 'Total Order Supply', align: 'left', width: '12%' },
  { key: 'totesPicked', label: 'Totes Picked', align: 'right', width: '5%' },
  { key: 'lines', label: 'Lines', align: 'right', width: '5%' },
  { key: 'articles', label: 'Articles', align: 'right', width: '5%' },
] as const

export const CHECKBOX_COL_WIDTH = '2.6%'

export const bodyCellClass = 'px-2 py-1.5 text-sm text-foreground border-b border-border'
export const checkboxCellClass = 'px-1 py-1 text-center text-foreground border-b border-border'
const flagCellClass = 'px-1 py-1 text-xs text-center text-foreground border-b border-border'
export const headerCellClass = 'px-2 py-[5px] text-sm border-b border-border select-none'
export const colDividerClass = 'border-r border-border'

type RowSupplyStatus = Exclude<OrderRow['suppliedStatus'], 'notStarted' | 'deleted'>
// Total Order Supply (and Supermarket/CFC's plain Supplied %) uses the app's standard green;
// eCom Supply gets its own blue and Shop Floor its own orange, so all three read apart at a glance.
type SupplyBarChannel = 'default' | 'ecom' | 'shopFloor'

const SUPPLIED_BAR_FILL_COLOR: Record<SupplyBarChannel, Record<RowSupplyStatus, string>> = {
  default: {
    picking: tokens.colorBgHighlightWeak,
    packed: tokens.colorBgHighlightStrong,
  },
  ecom: {
    picking: tokens.colorSupplyEcomWeak,
    packed: tokens.colorSupplyEcomStrong,
  },
  shopFloor: {
    picking: tokens.colorSupplyShopFloorWeak,
    packed: tokens.colorSupplyShopFloorStrong,
  },
}

const SUPPLIED_BAR_LABEL: Record<OrderRow['suppliedStatus'], string> = {
  notStarted: 'Awaiting Pick',
  picking: 'Picking',
  packed: 'Packed',
  deleted: 'Deleted',
}

// Dark text stays WCAG AA-readable whether it lands on a weak (light) fill or spills onto the white track at low %.
// Strong (packed) fills are dark/saturated enough to need white text instead.
const SUPPLIED_BAR_LABEL_COLOR: Record<SupplyBarChannel, Record<OrderRow['suppliedStatus'], string>> = {
  default: {
    notStarted: tokens.colorBorderMedium,
    picking: tokens.colorTextMedium,
    packed: tokens.colorTextOnContrastStrong,
    deleted: tokens.colorAlertErrorIcon,
  },
  ecom: {
    notStarted: tokens.colorBorderMedium,
    picking: tokens.colorTextStrong,
    packed: tokens.colorTextOnContrastStrong,
    deleted: tokens.colorAlertErrorIcon,
  },
  shopFloor: {
    notStarted: tokens.colorBorderMedium,
    picking: tokens.colorTextStrong,
    packed: tokens.colorTextOnContrastStrong,
    deleted: tokens.colorAlertErrorIcon,
  },
}

/**
 * The "Out of Stock > 2%" warning icon is independent of suppliedStatus — it's shown whenever
 * the order's own status is Packed or Dispatched and its supplied % leaves >2% out of stock.
 * Picking/not-started/deleted orders never show it, dispatched orders now do (unlike the old
 * "Below 80% supplied" flag, which suppressed itself once dispatched).
 */
function isOosFlagged(isPackedOrDispatched: boolean, percent: number): boolean {
  return isPackedOrDispatched && percent < 98
}

function currency(value: number) {
  return `$${value.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function subGroupTotals(subGroups: SubGroup[]) {
  const rows = subGroups.flatMap((sg) => sg.rows)
  return rowTotals(rows)
}

function rowTotals(rows: OrderRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.orders += row.orders
      acc.lines += row.lines
      acc.articles += row.articles
      const [picked, total] = row.totesPicked.split('/').map(Number)
      acc.totesPicked += picked
      acc.totesTotal += total
      return acc
    },
    { orders: 0, lines: 0, articles: 0, totesPicked: 0, totesTotal: 0 },
  )
}

/** Phase of a session/window's grey header row, based on the raw order statuses (channel-agnostic). */
function computeSupplyPhase(rows: OrderRow[]): 'notStarted' | 'picking' | 'packed' {
  const isAwaiting = (row: OrderRow) => row.status.startsWith('Awaiting Pick')
  if (rows.some((row) => row.status === 'Picking')) return 'picking'
  if (rows.every(isAwaiting)) return 'notStarted'
  if (rows.every((row) => row.status === 'Packed')) return 'packed'
  return 'picking'
}

/**
 * Cumulative Supply % for a session/window's grey header row.
 * Only considers orders not yet dispatched (status doesn't start with "DIS") and not deleted —
 * dispatched orders are done and shouldn't dilute the in-progress %.
 */
function computeSupplyStatus(rows: OrderRow[]): { percent: number; status: 'notStarted' | 'picking' | 'packed' } | null {
  const relevant = rows.filter((row) => !row.status.startsWith('DIS') && !row.isDeleted)
  if (relevant.length === 0) return null

  const totalArticles = relevant.reduce((sum, row) => sum + row.articles, 0)
  const percent =
    totalArticles > 0
      ? Math.round(relevant.reduce((sum, row) => sum + row.articles * row.suppliedPercent, 0) / totalArticles)
      : 0

  return { percent, status: computeSupplyPhase(relevant) }
}

/** Same as computeSupplyStatus, but the percent is the article-weighted average of a single supply channel. */
function computeChannelSupplyStatus(
  rows: OrderRow[],
  channel: 'ecom' | 'shopFloor',
): { percent: number; status: 'notStarted' | 'picking' | 'packed' } | null {
  const relevant = rows.filter((row) => !row.status.startsWith('DIS') && !row.isDeleted)
  if (relevant.length === 0) return null

  let totalArticles = 0
  let weightedPercent = 0
  for (const row of relevant) {
    const { articles, percent } = splitOrderSupply(row)[channel]
    totalArticles += articles
    weightedPercent += articles * percent
  }
  const percent = totalArticles > 0 ? Math.round(weightedPercent / totalArticles) : 0

  return { percent, status: computeSupplyPhase(relevant) }
}

function SupplyStatusBar({
  percent,
  status,
  channel = 'default',
  percentTextColor,
}: {
  percent: number
  status: 'notStarted' | 'picking' | 'packed'
  channel?: SupplyBarChannel
  percentTextColor?: string
}) {
  const noFill = status === 'notStarted'

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="relative h-5 flex-1 rounded-full overflow-hidden"
        style={{ border: `1px solid ${tokens.colorBorderDefault}`, backgroundColor: tokens.colorBgPrimary }}
      >
        {!noFill && (
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${percent}%`, backgroundColor: SUPPLIED_BAR_FILL_COLOR[channel][status] }}
          />
        )}
        <span
          className="absolute inset-y-0 left-2 flex items-center text-[10px] font-medium leading-none whitespace-nowrap"
          style={{ color: SUPPLIED_BAR_LABEL_COLOR[channel][status] }}
        >
          {SUPPLIED_BAR_LABEL[status]}
        </span>
      </div>
      <span
        className="shrink-0 w-7 text-right text-[10px] font-medium leading-none"
        style={{ color: percentTextColor ?? tokens.colorTextStrong }}
      >
        {percent}%
      </span>
    </div>
  )
}

function SuppliedBar({
  percent,
  status,
  articles,
  pickers,
  showPickersTooltip,
  channel = 'default',
  dispatched = false,
  oosFlagged = false,
}: {
  percent: number
  status: OrderRow['suppliedStatus']
  articles: number
  pickers?: string[]
  showPickersTooltip: boolean
  channel?: SupplyBarChannel
  dispatched?: boolean
  oosFlagged?: boolean
}) {
  const isDeleted = status === 'deleted'
  const noFill = status === 'notStarted' || isDeleted
  const showPickers = showPickersTooltip && !!pickers?.length

  const labelClassName = 'absolute inset-y-0 left-2 right-2 flex items-center gap-1 text-[10px] font-medium leading-none'
  const labelStyle = {
    color: dispatched ? tokens.colorTextOnContrastStrong : SUPPLIED_BAR_LABEL_COLOR[channel][status],
    textDecoration: isDeleted ? 'line-through' : undefined,
  }
  const labelText = dispatched ? 'Dispatched' : SUPPLIED_BAR_LABEL[status]
  const fillColor = dispatched ? tokens.colorBgInversePrimary : SUPPLIED_BAR_FILL_COLOR[channel][status as RowSupplyStatus]

  const oosIcon = oosFlagged && (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex shrink-0 items-center cursor-default" data-icon-tooltip />}>
        <WarningFilled size={12} style={{ color: tokens.colorTextOnContrastStrong }} />
      </TooltipTrigger>
      <TooltipContent>Out of Stock &gt; 2%</TooltipContent>
    </Tooltip>
  )

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="relative h-5 flex-1 rounded-full overflow-hidden"
        style={{ border: `1px solid ${tokens.colorBorderDefault}`, backgroundColor: tokens.colorBgPrimary }}
      >
        {!noFill && (
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${percent}%`, backgroundColor: fillColor }}
          />
        )}
        {showPickers ? (
          <span className={labelClassName} style={labelStyle}>
            {oosIcon}
            <Tooltip>
              <TooltipTrigger render={<span className="min-w-0 truncate cursor-default" data-icon-tooltip />}>{labelText}</TooltipTrigger>
              <TooltipContent className="flex items-center gap-1.5">
                <User className="size-3.5 shrink-0" />
                {pickers!.join(', ')}
              </TooltipContent>
            </Tooltip>
          </span>
        ) : (
          <span className={labelClassName} style={labelStyle}>
            {oosIcon}
            <span className="min-w-0 truncate">{labelText}</span>
          </span>
        )}
      </div>
      {!isDeleted && (
        <Tooltip>
          <TooltipTrigger
            render={
              <span
                className="shrink-0 w-7 text-right text-[10px] font-medium leading-none cursor-default"
                style={{ color: tokens.colorTextStrong }}
                data-icon-tooltip
              />
            }
          >
            {percent}%
          </TooltipTrigger>
          <TooltipContent className="flex flex-col gap-0.5">
            {(() => {
              const suppliedCount = Math.round((articles * percent) / 100)
              const unsuppliedCount = articles - suppliedCount
              const subCount = status === 'notStarted' ? 0 : Math.floor(unsuppliedCount / 2)
              return (
                <>
                  <span>SUP: {suppliedCount}/{articles}</span>
                  <span>SUB: {subCount}/{unsuppliedCount}</span>
                </>
              )
            })()}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

// On Demand queue priority: Dispatched, then Packed (ready but not yet dispatched), then Picking,
// then Awaiting Pick with its PST locked (next up), then Awaiting Pick still unlocked, then Deleted last.
function onDemandSortRank(row: OrderRow): number {
  if (row.isDeleted) return 5
  if (row.status.startsWith('DIS')) return 0
  if (row.status === 'Packed') return 1
  if (row.status === 'Picking') return 2
  if (row.status.startsWith('Awaiting Pick')) return row.flags.includes('locked') ? 3 : 4
  return 6
}

function filterGroupsForVisibility(
  groups: Group[],
  hideDispatched: boolean,
  hideDeleted: boolean,
  isAU: boolean,
  isNZ: boolean,
  selectedFlags: Set<OrderFlagKey>,
): Group[] {
  const keepRow = (row: OrderRow) =>
    (!hideDispatched || !row.status.startsWith('DIS')) &&
    (!hideDeleted || !row.isDeleted) &&
    (!isAU || !row.nzOnly) &&
    (selectedFlags.size === 0 ||
      Array.from(selectedFlags).some((key) => ORDER_FLAG_FILTERS.find((f) => f.key === key)!.matches(row, isNZ)))
  return groups
    .map((group) => {
      const rows = group.rows.filter(keepRow)
      return {
        ...group,
        rows: group.kind === 'onDemand' ? [...rows].sort((a, b) => onDemandSortRank(a) - onDemandSortRank(b)) : rows,
        subGroups: group.subGroups
          .map((sg) => ({ ...sg, rows: sg.rows.filter(keepRow) }))
          .filter((sg) => sg.rows.length > 0),
      }
    })
    .filter((group) => (group.kind === 'session' ? group.subGroups.length > 0 : group.rows.length > 0))
}

function ExpandCollapseAllToggle({
  allExpanded,
  onAllExpandedChange,
}: {
  allExpanded: boolean
  onAllExpandedChange: (expanded: boolean) => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            onClick={() => onAllExpandedChange(!allExpanded)}
          />
        }
      >
        {allExpanded ? <KeyboardArrowDownFilled size={16} className="size-4" /> : <ChevronRightFilled size={16} className="size-4" />}
      </TooltipTrigger>
      <TooltipContent>{allExpanded ? 'Collapse all' : 'Expand all'}</TooltipContent>
    </Tooltip>
  )
}

// Bright hot pink — distinct from the paler `FLAG_ROW_STYLES.hold.bg` row fill — used on the
// On Hold / Session On Hold chips so "pink = hold" reads clearly even against other chip colours.
const HOT_PINK = '#FF1493'

// Bright attention-grabbing yellow for the NO ROUTE session/window header row — always applied,
// regardless of hold or demo-highlight state, so unrouted orders stand out for triage.
const BRIGHT_YELLOW = '#FFEB00'

function HoldControl({
  onHold,
  onToggle,
  label,
  sessionOnHold = false,
  textColor,
}: {
  onHold: boolean
  onToggle: () => void
  label: 'session' | 'window'
  sessionOnHold?: boolean
  /** Row's warning/exceeded text colour (white-on-orange/red) — the pause/hold/play icon inherits
   * it so it stays legible on those backgrounds, but hover always forces it back to dark since the
   * button's hover background goes light regardless of the row colour. */
  textColor?: string
}) {
  const actionLabel = onHold ? `Release ${label}` : `Hold ${label}`
  const [open, setOpen] = useState(false)
  const disabled = label === 'window' && sessionOnHold

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {sessionOnHold ? (
        <Badge
          className="font-bold"
          style={{
            color: HOT_PINK,
            backgroundColor: '#FFFFFF',
            borderColor: HOT_PINK,
          }}
        >
          Session On Hold
        </Badge>
      ) : (
        onHold && (
          <Badge
            className="font-bold"
            style={{
              color: tokens.colorTextOnContrastStrong,
              backgroundColor: HOT_PINK,
              borderColor: HOT_PINK,
            }}
          >
            On Hold
          </Badge>
        )
      )}
      <Popover open={open && !disabled} onOpenChange={(next) => !disabled && setOpen(next)}>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-foreground hover:text-foreground!"
                    style={textColor ? { color: textColor } : undefined}
                    disabled={disabled}
                    data-icon-tooltip
                  />
                }
              />
            }
          >
            {onHold ? <PlayArrowFilled size={22} /> : <PauseFilled size={22} />}
          </TooltipTrigger>
          <TooltipContent className="capitalize">{disabled ? 'Session on hold' : actionLabel}</TooltipContent>
        </Tooltip>
        <PopoverContent align="start" className="w-auto overflow-hidden p-0">
          <button
            type="button"
            className="w-full whitespace-nowrap px-3 py-1.5 text-left text-sm font-normal capitalize hover:bg-muted"
            onClick={() => {
              onToggle()
              setOpen(false)
            }}
          >
            {actionLabel}
          </button>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// A session/window is treated as CLOSED once every non-deleted order in it has been dispatched.
// Only meaningful once dispatched orders are being shown — otherwise everything defaults to OPEN.
function isSessionClosed(rows: OrderRow[], hideDispatched: boolean) {
  if (hideDispatched) return false
  const liveRows = rows.filter((row) => !row.isDeleted)
  return liveRows.length > 0 && liveRows.every((row) => row.status.startsWith('DIS'))
}

function OpenClosedBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <Badge
      className="cursor-default font-bold normal-case ml-1.5"
      style={{
        color: tokens.colorTextOnContrastStrong,
        backgroundColor: isOpen ? tokens.colorBgHighlightStrong : tokens.colorStatusNegativeBgStrong,
        borderColor: isOpen ? tokens.colorBgHighlightStrong : tokens.colorStatusNegativeBgStrong,
      }}
    >
      {isOpen ? 'Open' : 'Closed'}
    </Badge>
  )
}

// Explains the demo warning/exceeded fill on the first window row. Wording is a placeholder —
// expected to change once real copy is settled.
const DEMO_WINDOW_TOOLTIP_LABEL: Partial<Record<DemoWindowState, string>> = {
  warning: '<15 min until picking due by time',
  exceeded: 'Picking due by time has passed',
}

// Shared by any header row that shows a hover tooltip explaining a whole-row background colour
// (e.g. the demo window-cutoff fill). Mirrors OrderDataRow's rowFlag tooltip: defers to a cell's
// own contextual tooltip (marked with data-icon-tooltip) when the cursor is directly over one.
function useRowFlagTooltip(active: boolean) {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const handleMouseOver = (e: ReactMouseEvent) => {
    if (!active) return
    const overIcon = (e.target as HTMLElement).closest('[data-icon-tooltip]')
    if (overIcon) {
      setVisible(false)
      return
    }
    const rect = rowRef.current?.getBoundingClientRect()
    if (rect) setPos({ top: rect.top, left: rect.left + rect.width / 2 })
    setVisible(true)
  }
  const handleMouseLeave = () => setVisible(false)

  return { rowRef, visible: active && visible, pos, handleMouseOver, handleMouseLeave }
}

function RowFlagTooltip({
  visible,
  pos,
  bg,
  textColor,
  label,
}: {
  visible: boolean
  pos: { top: number; left: number }
  bg: string
  textColor?: string
  label: string
}) {
  if (!visible) return null
  return (
    <div
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-md border px-3 py-1.5 text-center text-xs font-medium shadow-md"
      style={{ top: pos.top, left: pos.left, backgroundColor: bg, borderColor: 'rgb(0 0 0 / 0.15)', color: textColor ?? tokens.colorTextStrong }}
    >
      {label}
    </div>
  )
}

function GroupHeaderRow({
  group,
  collapsed,
  onToggle,
  onHold,
  onToggleHold,
  rowBg,
  textColor,
  tooltipLabel,
  checked,
  indeterminate,
  onCheckedChange,
  isEstore,
  splitSupplyView,
  isAU,
  isNZ,
  hideDispatched,
}: {
  group: Group
  collapsed: boolean
  onToggle: () => void
  onHold: boolean
  onToggleHold: () => void
  rowBg: string
  textColor?: string
  tooltipLabel?: string
  checked: boolean
  indeterminate: boolean
  onCheckedChange: (checked: boolean) => void
  isEstore: boolean
  splitSupplyView: boolean
  isAU: boolean
  isNZ: boolean
  hideDispatched: boolean
}) {
  const { rowRef, visible, pos, handleMouseOver, handleMouseLeave } = useRowFlagTooltip(!!tooltipLabel)
  const flagColumnCount = getVisibleFlagColumns().length
  const totals = group.kind === 'session' ? subGroupTotals(group.subGroups) : rowTotals(group.rows)
  const groupRows = group.kind === 'session' ? group.subGroups.flatMap((sg) => sg.rows) : group.rows
  const orderCount = groupRows.length
  const showSplit = isEstore && splitSupplyView
  const notReady =
    group.kind === 'window'
      ? isEveningWindow(group.label) || isNoRouteGroup(group)
      : group.kind === 'session' &&
        (isNoRouteGroup(group) || group.subGroups.every((sg) => isEveningWindow(sg.label)))
  const supply = group.kind === 'onDemand' || notReady ? null : computeSupplyStatus(groupRows)
  const ecomSupply = group.kind === 'onDemand' || notReady || !showSplit ? null : computeChannelSupplyStatus(groupRows, 'ecom')
  const shopFloorSupply = group.kind === 'onDemand' || notReady || !showSplit ? null : computeChannelSupplyStatus(groupRows, 'shopFloor')
  // Window capacity denominator (the "/Y" in "X/Y") — only known for a real time window; on
  // demand and the NO ROUTE catch-all just show the order count with no denominator.
  const windowCapacityLimit =
    group.kind === 'window' && !isNoRouteGroup(group) ? group.windowCapacity : undefined
  const pickingCapacityIndicator = group.kind === 'onDemand' && group.pickingCount !== undefined && !isNZ && (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex items-center cursor-default normal-case font-bold" />}>
        {group.pickingCount}/{group.rows.length}
        <User className="inline size-3 shrink-0 ml-0.5" />
      </TooltipTrigger>
      <TooltipContent>On Demand Picking Capacity</TooltipContent>
    </Tooltip>
  )

  return (
    <Fragment>
    {tooltipLabel && (
      <RowFlagTooltip visible={visible} pos={pos} bg={rowBg} textColor={textColor} label={tooltipLabel} />
    )}
    <tr
      ref={rowRef}
      className="cursor-pointer font-bold"
      style={{ backgroundColor: rowBg, color: textColor ?? tokens.colorTextStrong }}
      onClick={onToggle}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <td className={`${checkboxCellClass} ${colDividerClass}`} onClick={(e) => e.stopPropagation()}>
        <Checkbox
          className="mx-auto bg-white border-border"
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={onCheckedChange}
        />
      </td>
      <td className={headerCellClass} style={{ fontSize: '13px' }} colSpan={flagColumnCount}>
        <div className="flex items-center gap-1.5">
          {collapsed ? <ChevronRightFilled size={16} /> : <KeyboardArrowDownFilled size={16} />}
          <span className={group.kind === 'onDemand' ? 'uppercase' : undefined}>{group.label}</span>
        </div>
      </td>
      <td className={headerCellClass} style={{ fontSize: '13px' }}>
        <div className="flex items-center gap-1.5">
          {isNZ && <OpenClosedBadge isOpen={!isSessionClosed(groupRows, hideDispatched)} />}
          {(isNZ || isAU) && (
            <Tooltip>
              <TooltipTrigger render={<span className="cursor-default" />}>
                {windowCapacityLimit !== undefined ? `${orderCount}/${windowCapacityLimit}` : orderCount}
              </TooltipTrigger>
              <TooltipContent>{windowCapacityLimit !== undefined ? 'Orders/Capacity' : 'Orders'}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </td>
      <td className={headerCellClass} colSpan={2}>
        <div className="flex items-center justify-between gap-1.5">
          <span>Value {currency(group.orderValue)}</span>
          <HoldControl onHold={onHold} onToggle={onToggleHold} label={group.kind === 'window' ? 'window' : 'session'} textColor={textColor} />
        </div>
      </td>
      {showSplit ? (
        <>
          <td className={headerCellClass}>
            {ecomSupply && (
              <SupplyStatusBar percent={ecomSupply.percent} status={ecomSupply.status} channel="ecom" percentTextColor={textColor} />
            )}
          </td>
          <td className={headerCellClass}>
            {shopFloorSupply && (
              <SupplyStatusBar percent={shopFloorSupply.percent} status={shopFloorSupply.status} channel="shopFloor" percentTextColor={textColor} />
            )}
          </td>
        </>
      ) : (
        <>
          <td className={headerCellClass}>{isAU && pickingCapacityIndicator}</td>
          <td className={headerCellClass}>
            {supply && <SupplyStatusBar percent={supply.percent} status={supply.status} percentTextColor={textColor} />}
          </td>
        </>
      )}
      <td className={`${headerCellClass} text-right`}>
        {!notReady && `${totals.totesPicked}/${totals.totesTotal}`}
      </td>
      <td className={`${headerCellClass} text-right`}>{totals.lines}</td>
      <td className={`${headerCellClass} text-right`}>{totals.articles}</td>
    </tr>
    </Fragment>
  )
}

function SubGroupHeaderRow({
  subGroup,
  collapsed,
  onToggle,
  onHold,
  onToggleHold,
  sessionOnHold,
  rowBg,
  textColor,
  tooltipLabel,
  checked,
  indeterminate,
  onCheckedChange,
  isEstore,
  splitSupplyView,
  isAU,
}: {
  subGroup: SubGroup
  collapsed: boolean
  onToggle: () => void
  onHold: boolean
  onToggleHold: () => void
  sessionOnHold: boolean
  rowBg: string
  textColor?: string
  tooltipLabel?: string
  checked: boolean
  indeterminate: boolean
  onCheckedChange: (checked: boolean) => void
  isEstore: boolean
  splitSupplyView: boolean
  isAU: boolean
}) {
  const { rowRef, visible, pos, handleMouseOver, handleMouseLeave } = useRowFlagTooltip(!!tooltipLabel)
  const flagColumnCount = getVisibleFlagColumns().length
  const totals = rowTotals(subGroup.rows)
  const showSplit = isEstore && splitSupplyView
  const notReady = isEveningWindow(subGroup.label) || isNoRouteGroup(subGroup)
  const supply = notReady ? null : computeSupplyStatus(subGroup.rows)
  const ecomSupply = notReady || !showSplit ? null : computeChannelSupplyStatus(subGroup.rows, 'ecom')
  const shopFloorSupply = notReady || !showSplit ? null : computeChannelSupplyStatus(subGroup.rows, 'shopFloor')

  return (
    <Fragment>
    {tooltipLabel && (
      <RowFlagTooltip visible={visible} pos={pos} bg={rowBg} textColor={textColor} label={tooltipLabel} />
    )}
    <tr
      ref={rowRef}
      className="cursor-pointer font-bold"
      style={{ backgroundColor: rowBg, color: textColor ?? tokens.colorTextStrong }}
      onClick={onToggle}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <td className={`${checkboxCellClass} ${colDividerClass}`} onClick={(e) => e.stopPropagation()}>
        <Checkbox
          className="mx-auto bg-white border-border"
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={onCheckedChange}
        />
      </td>
      <td className={headerCellClass} style={{ fontSize: '13px' }} colSpan={flagColumnCount}>
        <div className="flex items-center gap-1.5 pl-4">
          {collapsed ? <ChevronRightFilled size={16} /> : <KeyboardArrowDownFilled size={16} />}
          <span>{subGroup.label}</span>
        </div>
      </td>
      <td className={headerCellClass} style={{ fontSize: '13px' }}>
        {isAU && (
          <Tooltip>
            <TooltipTrigger render={<span className="cursor-default" />}>{subGroup.rows.length}</TooltipTrigger>
            <TooltipContent>Orders</TooltipContent>
          </Tooltip>
        )}
      </td>
      <td className={headerCellClass} colSpan={2}>
        <div className="flex items-center justify-between gap-1.5">
          <span>Value {currency(subGroup.orderValue)}</span>
          <HoldControl onHold={onHold} onToggle={onToggleHold} label="window" sessionOnHold={sessionOnHold} textColor={textColor} />
        </div>
      </td>
      {showSplit ? (
        <>
          <td className={headerCellClass}>
            {ecomSupply && <SupplyStatusBar percent={ecomSupply.percent} status={ecomSupply.status} channel="ecom" percentTextColor={textColor} />}
          </td>
          <td className={headerCellClass}>
            {shopFloorSupply && (
              <SupplyStatusBar percent={shopFloorSupply.percent} status={shopFloorSupply.status} channel="shopFloor" percentTextColor={textColor} />
            )}
          </td>
        </>
      ) : (
        <>
          <td className={headerCellClass} />
          <td className={headerCellClass}>
            {supply && <SupplyStatusBar percent={supply.percent} status={supply.status} percentTextColor={textColor} />}
          </td>
        </>
      )}
      <td className={`${headerCellClass} text-right`}>
        {!notReady && `${totals.totesPicked}/${totals.totesTotal}`}
      </td>
      <td className={`${headerCellClass} text-right`}>{totals.lines}</td>
      <td className={`${headerCellClass} text-right`}>{totals.articles}</td>
    </tr>
    </Fragment>
  )
}

// Precedence when a row matches more than one visual state: deleted > first-order > fresh > normal.
export function rowHighlightStyle(row: OrderRow) {
  if (row.isDeleted) return { color: tokens.colorAlertErrorIcon, textDecoration: 'line-through' as const }
  if (row.isFirstOrder) return { color: tokens.colorAlertInfoIcon }
  if (row.isFresh) return { color: tokens.colorTextHighlight }
  return undefined
}

// Order-level flags shown as a whole-row background with a hover tooltip explaining the colour.
// Precedence when a row matches more than one: hold > audit > reissued.
// Hold row fills step from light to dark by scope — order < window < session — so a glance at the
// shade signals how far up the hierarchy the hold was applied.
const WINDOW_HOLD_ROW_BG = '#F9A8D4'
const SESSION_HOLD_ROW_BG = '#F472B6'
const FLAG_ROW_STYLES = {
  hold: { bg: '#FDD0E2', label: 'Order On Hold' },
  audit: { bg: tokens.colorBgAuditFlag, label: 'Order flagged for Audit' },
  reissued: { bg: '#C7EBFE', label: 'Reissued Order' },
} as const

function getRowFlag(row: OrderRow) {
  if (row.onHold) return FLAG_ROW_STYLES.hold
  if (row.isAudit) return FLAG_ROW_STYLES.audit
  if (row.isReissued) return FLAG_ROW_STYLES.reissued
  return null
}

export function OrderDataRow({
  row,
  rowBg,
  checked,
  onCheckedChange,
  isEstore,
  isAU,
  isNZ,
  splitSupplyView,
  hideSuppliedBar = false,
}: {
  row: OrderRow
  rowBg: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  isEstore: boolean
  isAU: boolean
  isNZ: boolean
  splitSupplyView: boolean
  hideSuppliedBar?: boolean
}) {
  const navigate = useNavigate()
  const proposition = getPropositionDisplay(row, isAU)
  const ageRestriction = getAgeRestrictionDisplay(row)
  const milestone = getMilestoneOrderDisplay(row)
  const highlightStyle = rowHighlightStyle(row)
  const isDispatched = row.status.startsWith('DIS') || row.status.startsWith('Packed')
  const isDIS = row.status.startsWith('DIS')
  const split = isEstore && splitSupplyView ? splitOrderSupply(row) : null
  const flagColumns = getVisibleFlagColumns()
  const rowFlag = getRowFlag(row)

  const rowRef = useRef<HTMLTableRowElement>(null)
  const [flagTooltipVisible, setFlagTooltipVisible] = useState(false)
  const [flagTooltipPos, setFlagTooltipPos] = useState({ top: 0, left: 0 })

  // Row-level flag tooltip defers to a cell's own contextual tooltip (proposition/age/flag icons,
  // first-order star, dispatch time, supply-bar tooltips — each marked with data-icon-tooltip)
  // when the cursor is directly over one of those.
  const handleRowMouseOver = (e: ReactMouseEvent) => {
    if (!rowFlag) return
    const overIcon = (e.target as HTMLElement).closest('[data-icon-tooltip]')
    if (overIcon) {
      setFlagTooltipVisible(false)
      return
    }
    const rect = rowRef.current?.getBoundingClientRect()
    if (rect) setFlagTooltipPos({ top: rect.top, left: rect.left + rect.width / 2 })
    setFlagTooltipVisible(true)
  }
  const handleRowMouseLeave = () => setFlagTooltipVisible(false)

  return (
    <Fragment>
    {rowFlag && flagTooltipVisible && (
      <div
        className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-md border px-3 py-1.5 text-center text-xs font-medium shadow-md"
        style={{ top: flagTooltipPos.top, left: flagTooltipPos.left, backgroundColor: rowFlag.bg, borderColor: 'rgb(0 0 0 / 0.15)', color: tokens.colorTextStrong }}
      >
        {rowFlag.label}
      </div>
    )}
    <tr
      ref={rowRef}
      className="group cursor-pointer hover:brightness-95"
      style={{ backgroundColor: rowFlag ? rowFlag.bg : rowBg }}
      onClick={() => navigate(`/order/detail?id=${row.orderNo}`)}
      onMouseOver={handleRowMouseOver}
      onMouseLeave={handleRowMouseLeave}
    >
      <td
        className={`${checkboxCellClass} ${colDividerClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox className="mx-auto" checked={checked} onCheckedChange={onCheckedChange} />
      </td>
      {flagColumns.map(({ key, label }, index) => {
        const FlagIcon = FLAG_ICONS[key]
        return (
          <td
            key={key}
            className={`${flagCellClass} ${index === flagColumns.length - 1 ? colDividerClass : ''} ${key === 'specialty' ? 'relative' : ''}`}
          >
            {key === 'proposition' && proposition && (
              <Tooltip>
                <TooltipTrigger render={<span className="mx-auto flex w-fit cursor-default" data-icon-tooltip />}>
                  <proposition.icon size={16} className="text-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col items-center">
                    <span>{proposition.label}</span>
                    {proposition.subLabel && <span>{proposition.subLabel}</span>}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            {key === 'ageRestricted' && ageRestriction && (
              <Tooltip>
                <TooltipTrigger render={<span className="mx-auto flex w-fit cursor-default" data-icon-tooltip />}>
                  <ageRestriction.icon size={16} className="text-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col items-center">
                    <span>Age Restricted</span>
                    <span>{ageRestriction.tier}+</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            {key === 'specialty' && (row.flags.includes('specialty') || (isNZ && row.flags.includes('pharmacy'))) && (
              // Two independent icons, not one column-per-flag: an order can carry the generic
              // specialty flag (platter, hot chicken, etc.) and the pharmacy flag together, so
              // both render side by side with a 4px gap. The column itself stays the same width
              // as every other flag column (no per-row/per-table resizing) — on the rare row
              // that needs both icons, this wrapper is simply wider than its cell and spills
              // over into the neighbouring column, rather than widening the column for everyone.
              // The parent <td> is `relative` (position != static) purely so this overflow paints
              // above that neighbouring cell's own content instead of underneath it.
              <div className="absolute inset-0 flex items-center justify-center gap-1">
                {row.flags.includes('specialty') && (
                  <Tooltip>
                    <TooltipTrigger render={<span className="flex cursor-default" data-icon-tooltip />}>
                      <FlagSpecialtyPrep size={16} className="text-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Specialty item(s)</TooltipContent>
                  </Tooltip>
                )}
                {/* NZ-only for now — may extend to AU in future, but hidden there until then. */}
                {isNZ && row.flags.includes('pharmacy') && (
                  <Tooltip>
                    <TooltipTrigger render={<span className="flex cursor-default" data-icon-tooltip />}>
                      <FlagPharmacy size={16} className="text-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Pharmacy item</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
            {key !== 'proposition' &&
              key !== 'ageRestricted' &&
              key !== 'specialty' &&
              FlagIcon &&
              row.flags.includes(key) && (
              <Tooltip>
                <TooltipTrigger render={<span className="mx-auto flex w-fit cursor-default" data-icon-tooltip />}>
                  <FlagIcon size={16} className="text-foreground" />
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            )}
          </td>
        )
      })}
      <td className={`${bodyCellClass} ${colDividerClass} text-left relative`} style={highlightStyle}>
        {row.orderNo}
        {(milestone || (isNZ && row.packingSlipRequired)) && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1">
            {milestone && (
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex cursor-default" data-icon-tooltip />}>
                  <FlagMilestoneOrder
                    size={14}
                    className={milestone.isFirstOrder ? undefined : 'text-muted-foreground'}
                    style={milestone.isFirstOrder ? { color: tokens.colorAlertInfoIcon } : undefined}
                  />
                </TooltipTrigger>
                <TooltipContent>{milestone.label}</TooltipContent>
              </Tooltip>
            )}
            {/* NZ-only concern, same as the flag column it replaces. */}
            {isNZ && row.packingSlipRequired && (
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex cursor-default" data-icon-tooltip />}>
                  <FlagPackingSlipRequired size={14} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Packing slip required</TooltipContent>
              </Tooltip>
            )}
          </span>
        )}
      </td>
      <td className={`${bodyCellClass} ${colDividerClass}`} style={highlightStyle}>
        {(() => {
          const routing = getRoutingDisplay(row, isNZ)
          const showDisTime = row.dispatchByTime && shouldShowOnDemandDisTime(row, isNZ)
          return (
            <span className="flex w-full items-center justify-between gap-1.5">
              <span className="inline-flex items-center gap-1.5">
                {routing.kind === 'locationId' && <LocationIdChip id={routing.value} />}
                {routing.kind === 'code' && routing.value}
              </span>
              {showDisTime && (
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">DUE {row.dispatchByTime}</span>
              )}
            </span>
          )
        })()}
      </td>
      <td className={`${bodyCellClass} ${colDividerClass}`} style={highlightStyle}>
        <span className="flex min-w-0 items-center justify-between gap-1.5">
          <span className="min-w-0 flex-1 truncate" title={row.customer}>
            {row.customer}
          </span>
          {row.onHold && (
            <Badge
              className="shrink-0 font-bold"
              style={{
                color: tokens.colorTextOnContrastStrong,
                backgroundColor: HOT_PINK,
                borderColor: HOT_PINK,
              }}
            >
              On Hold
            </Badge>
          )}
        </span>
      </td>
      {!split && (
        <td className={`${bodyCellClass} ${colDividerClass}`} style={highlightStyle}>
          {(() => {
            const pstMatch = row.status.match(/^(.+?)\s*\((PST .+)\)$/)
            const mainStatus = pstMatch ? pstMatch[1] : row.status
            const pstTime = pstMatch ? pstMatch[2] : null
            const showLock = !!pstTime && row.flags.includes('locked')
            return (
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="min-w-0 flex-1 truncate" title={mainStatus}>
                  {mainStatus}
                </span>
                {pstTime && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] text-muted-foreground">
                    {showLock && (
                      <Tooltip>
                        <TooltipTrigger render={<span className="inline-flex cursor-default" data-icon-tooltip />}>
                          <FlagPickStartTimeLock size={11} className="text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>PST Locked</TooltipContent>
                      </Tooltip>
                    )}
                    {pstTime}
                  </span>
                )}
              </span>
            )
          })()}
        </td>
      )}
      {split ? (
        <>
          <td className={`${bodyCellClass} ${colDividerClass}`}>
            {!hideSuppliedBar && (
              <SuppliedBar
                percent={split.ecom.percent}
                status={split.ecom.status}
                articles={split.ecom.articles}
                showPickersTooltip={false}
                channel="ecom"
                dispatched={isDIS}
                oosFlagged={isOosFlagged(isDispatched, split.ecom.percent)}
              />
            )}
          </td>
          <td className={`${bodyCellClass} ${colDividerClass}`}>
            {!hideSuppliedBar && (
              <SuppliedBar
                percent={split.shopFloor.percent}
                status={split.shopFloor.status}
                articles={split.shopFloor.articles}
                pickers={row.pickers}
                showPickersTooltip={(split.shopFloor.status === 'picking' || isDispatched) && !!row.pickers?.length}
                channel="shopFloor"
                dispatched={isDIS}
                oosFlagged={isOosFlagged(isDispatched, split.shopFloor.percent)}
              />
            )}
          </td>
        </>
      ) : (
        <td className={`${bodyCellClass} ${colDividerClass}`}>
          {!hideSuppliedBar && (
            <SuppliedBar
              percent={row.suppliedPercent}
              status={row.suppliedStatus}
              articles={row.articles}
              pickers={row.pickers}
              showPickersTooltip={(row.suppliedStatus === 'picking' || isDispatched) && !!row.pickers?.length}
              dispatched={isDIS}
              oosFlagged={isOosFlagged(isDispatched, row.suppliedPercent)}
            />
          )}
        </td>
      )}
      <td className={`${bodyCellClass} ${colDividerClass} text-right`} style={highlightStyle}>{hideSuppliedBar ? '' : row.totesPicked}</td>
      <td className={`${bodyCellClass} ${colDividerClass} text-right`} style={highlightStyle}>{row.lines}</td>
      <td className={`${bodyCellClass} text-right`} style={highlightStyle}>{row.articles}</td>
    </tr>
    </Fragment>
  )
}

export function OrdersTable({
  headerBackgroundColor,
  selectedRowIds,
  onToggleRowSelected,
  onSetRowsSelected,
  demoWindowState = 'normal',
  stickyTopOffsetPx = parseInt(tokens.headerHeight, 10),
  onStuckChange,
  hideDispatched,
  hideDeleted,
  splitSupplyView,
  selectedFlags,
}: {
  headerBackgroundColor?: string
  selectedRowIds: Set<string>
  onToggleRowSelected: (id: string) => void
  onSetRowsSelected: (ids: string[], selected: boolean) => void
  demoWindowState?: DemoWindowState
  stickyTopOffsetPx?: number
  onStuckChange?: (stuck: boolean) => void
  hideDispatched: boolean
  hideDeleted: boolean
  splitSupplyView: boolean
  selectedFlags: Set<OrderFlagKey>
}) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [collapsedSubGroups, setCollapsedSubGroups] = useState<Set<string>>(new Set())
  const [heldIds, setHeldIds] = useState<Set<string>>(new Set())
  const { isEstore, isAU, isNZ } = useStore()
  const displayGroups = isNZ ? flattenSessionGroupsToWindows(orderGroups) : orderGroups

  const getSelectionState = (ids: string[]) => {
    const selectedCount = ids.filter((id) => selectedRowIds.has(id)).length
    return {
      checked: ids.length > 0 && selectedCount === ids.length,
      indeterminate: selectedCount > 0 && selectedCount < ids.length,
    }
  }

  const toggleHold = (id: string) =>
    setHeldIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const allExpanded = collapsedGroups.size === 0 && collapsedSubGroups.size === 0

  const toggleGroup = (id: string) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleSubGroup = (id: string) =>
    setCollapsedSubGroups((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const setAllExpanded = (expanded: boolean) => {
    if (expanded) {
      setCollapsedGroups(new Set())
      setCollapsedSubGroups(new Set())
    } else {
      setCollapsedGroups(new Set(displayGroups.map((g) => g.id)))
      setCollapsedSubGroups(
        new Set(displayGroups.flatMap((g) => g.subGroups.map((sg) => sg.id))),
      )
    }
  }

  const visibleGroups = filterGroupsForVisibility(displayGroups, hideDispatched, hideDeleted, isAU, isNZ, selectedFlags).filter(
    (group) => !isEstore || group.kind !== 'onDemand',
  )
  const firstDemoGroupId = visibleGroups.find((group) => group.kind === 'window' || group.kind === 'session')?.id
  const demoGroupStyle: Record<DemoWindowState, { rowBg: string; textColor?: string }> = {
    normal: { rowBg: tokens.colorActionTertiaryBgFocus },
    warning: { rowBg: tokens.colorAlertOrangeBgStrong, textColor: tokens.colorTextOnContrastStrong },
    exceeded: { rowBg: tokens.colorAlertErrorBgStrong, textColor: tokens.colorTextOnContrastStrong },
  }
  const { sentinelRef, isStuck } = useStickyHeaderShadow(stickyTopOffsetPx)
  const stuckShadow = isStuck ? stickyThStuckShadowClass : ''
  const thStyle = {
    ...stickyThStyle,
    top: `${stickyTopOffsetPx}px`,
    ...(headerBackgroundColor ? { backgroundColor: headerBackgroundColor } : null),
  }

  useEffect(() => {
    onStuckChange?.(isStuck)
  }, [isStuck, onStuckChange])
  const COLUMNS = !isEstore ? COLUMNS_DEFAULT : splitSupplyView ? COLUMNS_ESTORE_SPLIT : COLUMNS_ESTORE_COMBINED
  const flagColumns = getVisibleFlagColumns()
  const NUM_COLUMNS = 1 + flagColumns.length + COLUMNS.length

  return (
    <div className="mx-4 my-3 border border-border">
      <div ref={sentinelRef} />
      <table className="w-full table-fixed border-collapse">
        <thead style={theadStyle}>
          <tr>
            <th
              className={`${stickyThClass} ${stuckShadow} text-center! px-1! ${colDividerClass}`}
              style={{ ...thStyle, width: CHECKBOX_COL_WIDTH }}
            >
              <ExpandCollapseAllToggle allExpanded={allExpanded} onAllExpandedChange={setAllExpanded} />
            </th>
            {flagColumns.map(({ key, abbr, label, width }, index) => (
              <th
                key={key}
                className={`${stickyThClass} ${stuckShadow} text-center! ${index === flagColumns.length - 1 ? colDividerClass : ''}`}
                style={{ ...thStyle, width }}
              >
                <Tooltip>
                  <TooltipTrigger render={<span className="cursor-default" />}>{abbr}</TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              </th>
            ))}
            {COLUMNS.map(({ key, label, align, width }, index) => (
              <th
                key={key}
                className={`${stickyThClass} ${stuckShadow} ${align === 'right' ? 'text-right' : 'text-left'} ${index === COLUMNS.length - 1 ? '' : colDividerClass}`}
                style={{ ...thStyle, width }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
            {visibleGroups.map((group) => {
              const groupCollapsed = collapsedGroups.has(group.id)
              const groupRowIds = getAllOrderRows([group]).map((row) => row.id)
              const groupSelection = getSelectionState(groupRowIds)
              const isFirstDemoTopLevelWindow = group.kind === 'window' && group.id === firstDemoGroupId
              const isGroupHeld = heldIds.has(group.id)
              return (
                <Fragment key={group.id}>
                  <GroupHeaderRow
                    group={group}
                    collapsed={groupCollapsed}
                    onToggle={() => toggleGroup(group.id)}
                    onHold={isGroupHeld}
                    onToggleHold={() => toggleHold(group.id)}
                    rowBg={
                      isNoRouteGroup(group)
                        ? BRIGHT_YELLOW
                        : isGroupHeld
                          ? group.kind === 'session'
                            ? SESSION_HOLD_ROW_BG
                            : WINDOW_HOLD_ROW_BG
                          : isFirstDemoTopLevelWindow
                            ? demoGroupStyle[demoWindowState].rowBg
                            : tokens.colorActionTertiaryBgFocus
                    }
                    textColor={
                      isNoRouteGroup(group)
                        ? undefined
                        : isGroupHeld
                          ? undefined
                          : isFirstDemoTopLevelWindow
                            ? demoGroupStyle[demoWindowState].textColor
                            : undefined
                    }
                    tooltipLabel={
                      isNoRouteGroup(group)
                        ? undefined
                        : isGroupHeld
                          ? undefined
                          : isFirstDemoTopLevelWindow
                            ? DEMO_WINDOW_TOOLTIP_LABEL[demoWindowState]
                            : undefined
                    }
                    checked={groupSelection.checked}
                    indeterminate={groupSelection.indeterminate}
                    onCheckedChange={(checked) => onSetRowsSelected(groupRowIds, checked)}
                    isEstore={isEstore}
                    splitSupplyView={splitSupplyView}
                    isAU={isAU}
                    isNZ={isNZ}
                    hideDispatched={hideDispatched}
                  />
                  {!groupCollapsed && group.kind !== 'session' &&
                    group.rows.map((row, index) => (
                      <OrderDataRow
                        key={row.id}
                        row={row}
                        rowBg={index % 2 === 0 ? tokens.colorBgPrimary : tokens.colorBgSecondary}
                        checked={selectedRowIds.has(row.id)}
                        onCheckedChange={() => onToggleRowSelected(row.id)}
                        isEstore={isEstore}
                        isAU={isAU}
                        isNZ={isNZ}
                        splitSupplyView={splitSupplyView}
                        hideSuppliedBar={group.kind === 'window' && (isEveningWindow(group.label) || isNoRouteGroup(group))}
                      />
                    ))}
                  {!groupCollapsed && group.kind === 'session' && isNoRouteGroup(group) &&
                    group.subGroups.flatMap((sg) => sg.rows).map((row, index) => (
                      <OrderDataRow
                        key={row.id}
                        row={row}
                        rowBg={index % 2 === 0 ? tokens.colorBgPrimary : tokens.colorBgSecondary}
                        checked={selectedRowIds.has(row.id)}
                        onCheckedChange={() => onToggleRowSelected(row.id)}
                        isEstore={isEstore}
                        isAU={isAU}
                        isNZ={isNZ}
                        splitSupplyView={splitSupplyView}
                        hideSuppliedBar
                      />
                    ))}
                  {!groupCollapsed && group.kind === 'session' && !isNoRouteGroup(group) &&
                    group.subGroups.map((subGroup, subGroupIndex) => {
                      const subGroupCollapsed = collapsedSubGroups.has(subGroup.id)
                      const subGroupRowIds = subGroup.rows.map((row) => row.id)
                      const subGroupSelection = getSelectionState(subGroupRowIds)
                      const isFirstDemoWindow = group.id === firstDemoGroupId && subGroupIndex === 0
                      const isSubGroupHeld = heldIds.has(subGroup.id)
                      const isSessionHeldForSubGroup = heldIds.has(group.id)
                      const subGroupPinned = isSubGroupHeld || isSessionHeldForSubGroup
                      return (
                        <Fragment key={subGroup.id}>
                          <SubGroupHeaderRow
                            subGroup={subGroup}
                            collapsed={subGroupCollapsed}
                            onToggle={() => toggleSubGroup(subGroup.id)}
                            onHold={isSubGroupHeld}
                            onToggleHold={() => toggleHold(subGroup.id)}
                            sessionOnHold={isSessionHeldForSubGroup}
                            rowBg={
                              isNoRouteGroup(subGroup)
                                ? BRIGHT_YELLOW
                                : subGroupPinned
                                  ? WINDOW_HOLD_ROW_BG
                                  : isFirstDemoWindow
                                    ? demoGroupStyle[demoWindowState].rowBg
                                    : tokens.colorBorderWeak
                            }
                            textColor={
                              isNoRouteGroup(subGroup)
                                ? undefined
                                : subGroupPinned
                                  ? undefined
                                  : isFirstDemoWindow
                                    ? demoGroupStyle[demoWindowState].textColor
                                    : undefined
                            }
                            tooltipLabel={
                              isNoRouteGroup(subGroup)
                                ? undefined
                                : subGroupPinned
                                  ? undefined
                                  : isFirstDemoWindow
                                    ? DEMO_WINDOW_TOOLTIP_LABEL[demoWindowState]
                                    : undefined
                            }
                            checked={subGroupSelection.checked}
                            indeterminate={subGroupSelection.indeterminate}
                            onCheckedChange={(checked) => onSetRowsSelected(subGroupRowIds, checked)}
                            isEstore={isEstore}
                            splitSupplyView={splitSupplyView}
                            isAU={isAU}
                          />
                          {!subGroupCollapsed &&
                            subGroup.rows.map((row, index) => (
                              <OrderDataRow
                                key={row.id}
                                row={row}
                                rowBg={index % 2 === 0 ? tokens.colorBgPrimary : tokens.colorBgSecondary}
                                checked={selectedRowIds.has(row.id)}
                                onCheckedChange={() => onToggleRowSelected(row.id)}
                                isEstore={isEstore}
                                isAU={isAU}
                                isNZ={isNZ}
                                splitSupplyView={splitSupplyView}
                                hideSuppliedBar={isEveningWindow(subGroup.label) || isNoRouteGroup(subGroup)}
                              />
                            ))}
                        </Fragment>
                      )
                    })}
                </Fragment>
              )
            })}
            {displayGroups.length === 0 && (
              <tr>
                <td className={bodyCellClass} colSpan={NUM_COLUMNS}>
                  <div className="py-8 text-center text-sm text-muted-foreground">No orders found</div>
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  )
}
