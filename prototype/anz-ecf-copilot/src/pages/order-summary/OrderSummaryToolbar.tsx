import { forwardRef } from 'react'
import { StatPanel } from './StatPanel'
import { CollapsedStatPanels } from './CollapsedStatPanels'
import { DateStepper } from './DateStepper'
import { QuickActions } from './QuickActions'
import { OverviewDrawers, type OverviewDrawer } from './OverviewDrawers'
import { totesAvailable, itemsAvailable } from './mockData'
import type { OrderFlagKey, OrderRow } from './orderGroups'
import tokens from '@/theme/tokens'

interface OrderSummaryToolbarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  activeDrawer: OverviewDrawer
  onDrawerChange: (drawer: OverviewDrawer) => void
  backgroundColor?: string
  selectedRowIds: Set<string>
  allOrderRows: OrderRow[]
  onClearSelection: () => void
  pinned?: boolean
  hideDispatched: boolean
  onHideDispatchedChange: (hidden: boolean) => void
  hideDeleted: boolean
  onHideDeletedChange: (hidden: boolean) => void
  splitSupplyView: boolean
  onSplitSupplyViewChange: (split: boolean) => void
  selectedFlags: Set<OrderFlagKey>
  onSelectedFlagsChange: (flags: Set<OrderFlagKey>) => void
}

export const OrderSummaryToolbar = forwardRef<HTMLDivElement, OrderSummaryToolbarProps>(function OrderSummaryToolbar(
  {
    selectedDate,
    onDateChange,
    activeDrawer,
    onDrawerChange,
    backgroundColor = tokens.colorBgTertiary,
    selectedRowIds,
    allOrderRows,
    onClearSelection,
    pinned = false,
    hideDispatched,
    onHideDispatchedChange,
    hideDeleted,
    onHideDeletedChange,
    splitSupplyView,
    onSplitSupplyViewChange,
    selectedFlags,
    onSelectedFlagsChange,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className="w-screen"
      style={{
        backgroundColor,
        borderBottom: `1px solid ${tokens.colorBorderWeak}`,
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        ...(pinned
          ? {
              position: 'sticky',
              top: tokens.headerHeight,
              zIndex: 5,
              boxShadow: '0 2px 6px 0 rgba(0,0,0,0.15)',
            }
          : null),
      }}
    >
      <div className="relative flex items-center max-w-[1920px] mx-auto px-4 py-3">
        {/* left half: overview links pinned left, quick actions centered in the remaining space up to the bar's true center */}
        <div className="absolute inset-y-0 left-0 right-1/2 flex items-center gap-3 px-4">
          <OverviewDrawers
            activeDrawer={activeDrawer}
            onOpenChange={onDrawerChange}
            selectedDate={selectedDate}
            hideDispatched={hideDispatched}
            onHideDispatchedChange={onHideDispatchedChange}
            hideDeleted={hideDeleted}
            onHideDeletedChange={onHideDeletedChange}
            splitSupplyView={splitSupplyView}
            onSplitSupplyViewChange={onSplitSupplyViewChange}
            selectedFlags={selectedFlags}
            onSelectedFlagsChange={onSelectedFlagsChange}
          />
          <div className="flex flex-1 justify-center">
            <QuickActions
              selectedRowIds={selectedRowIds}
              allOrderRows={allOrderRows}
              onClearSelection={onClearSelection}
            />
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <DateStepper selectedDate={selectedDate} onChange={onDateChange} />
        </div>

        <div className="ml-auto hidden items-center gap-3 xl:flex">
          <StatPanel label="Totes awaiting pick" data={totesAvailable} />
          <StatPanel label="Articles awaiting pick" data={itemsAvailable} />
        </div>
        <div className="ml-auto flex items-center xl:hidden">
          <CollapsedStatPanels />
        </div>
      </div>
    </div>
  )
})
