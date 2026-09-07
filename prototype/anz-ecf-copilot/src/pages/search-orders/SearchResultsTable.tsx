import { ReceiptLong } from '@/components/icons/material-icons'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  stickyThClass,
  stickyThStuckShadowClass,
  stickyThStyle,
  theadStyle,
  useStickyHeaderShadow,
} from '@/components/shared/StickyTableContainer'
import { useStore } from '@/context/StoreContext'
import tokens from '@/theme/tokens'
import { getOrderDetailInfo } from '../order-detail/orderDetailData'
import {
  bodyCellClass,
  CHECKBOX_COL_WIDTH,
  colDividerClass,
  getVisibleFlagColumns,
} from '../order-summary/OrdersTable'
import { getOrderSessionAndWindowForStore, HOME_STORE_ID, type OrderRow } from '../order-summary/orderGroups'
import { computeMergeSpans } from './mergeSpans'
import { SearchResultRow } from './SearchResultRow'

const RESULT_COLUMNS = [
  { key: 'orderNo', label: 'Order No', align: 'left', width: '11%' },
  { key: 'transitCode', label: 'Routing', align: 'left', width: '11%' },
  { key: 'customer', label: 'Customer', align: 'left', width: '17%' },
  { key: 'status', label: 'Status', align: 'left', width: '10%' },
  { key: 'totesPicked', label: 'Totes Picked', align: 'right', width: '5%' },
  { key: 'lines', label: 'Lines', align: 'right', width: '5%' },
  { key: 'articles', label: 'Articles', align: 'right', width: '5%' },
] as const

const STORE_COL_WIDTH = '6%'
const SESSION_WINDOW_COL_WIDTH = '8%'
const PICKUP_DATE_COL_WIDTH = '7%'

function formatPickupDate(date: Date) {
  return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
}

export function SearchResultsTable({
  rows,
  selectedIds,
  onSelectedIdsChange,
}: {
  rows: OrderRow[]
  selectedIds: Set<string>
  onSelectedIdsChange: (ids: Set<string>) => void
}) {
  const { isAU, isNZ } = useStore()
  const { sentinelRef, isStuck } = useStickyHeaderShadow()
  const stuckShadow = isStuck ? stickyThStuckShadowClass : ''
  const flagColumns = getVisibleFlagColumns()
  const NUM_COLUMNS = 4 + flagColumns.length + RESULT_COLUMNS.length

  const selectedCount = rows.filter((row) => selectedIds.has(row.id)).length
  const allChecked = rows.length > 0 && selectedCount === rows.length
  const indeterminate = selectedCount > 0 && selectedCount < rows.length

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    onSelectedIdsChange(next)
  }

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      onSelectedIdsChange(new Set())
      return
    }
    onSelectedIdsChange(new Set(rows.map((row) => row.id)))
  }

  const storeLabels = rows.map((row) => row.storeId ?? HOME_STORE_ID)
  const sessionWindowLabels = rows.map((row) => {
    const info = getOrderSessionAndWindowForStore(row.orderNo, row.storeId ?? HOME_STORE_ID)
    if (!info) return '—'
    return isNZ ? info.window : info.session
  })
  const pickupDateLabels = rows.map((row) => formatPickupDate(getOrderDetailInfo(row.orderNo).deliveryDate))
  const customerLabels = rows.map((row) => row.customer)

  const storeSpans = computeMergeSpans(storeLabels)
  const sessionWindowSpans = computeMergeSpans(sessionWindowLabels)
  const pickupDateSpans = computeMergeSpans(pickupDateLabels)
  const customerSpans = computeMergeSpans(customerLabels)

  return (
    <div className="mx-4 my-3 rounded-lg" style={{ border: `1px solid ${tokens.colorBorderWeak}` }}>
      <div
        className="flex items-center gap-1 rounded-t-lg px-3 py-2"
        style={{ backgroundColor: tokens.colorBgTertiary, borderBottom: `1px solid ${tokens.colorBorderWeak}` }}
      >
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="ghost" size="icon-sm" disabled={selectedCount === 0} focusableWhenDisabled />}
          >
            <ReceiptLong size={16} />
          </TooltipTrigger>
          <TooltipContent>Print invoices for selected orders</TooltipContent>
        </Tooltip>
      </div>
      <div ref={sentinelRef} />
      <table className="w-full table-fixed border-collapse">
        <thead style={theadStyle}>
          <tr>
            <th
              className={`${stickyThClass} ${stuckShadow} ${colDividerClass}`}
              style={{ ...stickyThStyle, width: STORE_COL_WIDTH }}
            >
              Store
            </th>
            <th
              className={`${stickyThClass} ${stuckShadow} ${colDividerClass}`}
              style={{ ...stickyThStyle, width: SESSION_WINDOW_COL_WIDTH }}
            >
              {isNZ ? 'Window' : 'Session'}
            </th>
            <th
              className={`${stickyThClass} ${stuckShadow} text-center! px-1! ${colDividerClass}`}
              style={{ ...stickyThStyle, width: CHECKBOX_COL_WIDTH }}
            >
              <Checkbox
                className="mx-auto"
                checked={allChecked}
                indeterminate={indeterminate}
                onCheckedChange={(checked) => toggleAll(checked === true)}
              />
            </th>
            <th
              className={`${stickyThClass} ${stuckShadow} ${colDividerClass}`}
              style={{ ...stickyThStyle, width: PICKUP_DATE_COL_WIDTH }}
            >
              Pickup Date
            </th>
            {flagColumns.map(({ key, abbr, width }, index) => (
              <th
                key={key}
                className={`${stickyThClass} ${stuckShadow} text-center! ${index === flagColumns.length - 1 ? colDividerClass : ''}`}
                style={{ ...stickyThStyle, width }}
              >
                {abbr}
              </th>
            ))}
            {RESULT_COLUMNS.map(({ key, label, align, width }, index) => (
              <th
                key={key}
                className={`${stickyThClass} ${stuckShadow} ${align === 'right' ? 'text-right' : 'text-left'} ${index === RESULT_COLUMNS.length - 1 ? '' : colDividerClass}`}
                style={{ ...stickyThStyle, width }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <SearchResultRow
              key={row.id}
              row={row}
              rowBg={index % 2 === 0 ? tokens.colorBgPrimary : tokens.colorBgSecondary}
              checked={selectedIds.has(row.id)}
              onCheckedChange={() => toggleRow(row.id)}
              storeLabel={storeLabels[index]}
              storeSpan={storeSpans[index]}
              sessionWindowLabel={sessionWindowLabels[index]}
              sessionWindowSpan={sessionWindowSpans[index]}
              pickupDateLabel={pickupDateLabels[index]}
              pickupDateSpan={pickupDateSpans[index]}
              customerSpan={customerSpans[index]}
              isAU={isAU}
              isNZ={isNZ}
            />
          ))}
          {rows.length === 0 && (
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
