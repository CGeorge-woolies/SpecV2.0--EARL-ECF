import { useEffect, useRef, useState } from 'react'
import { OrderSummaryToolbar } from './order-summary/OrderSummaryToolbar'
import { ToolbarPullTab } from './order-summary/ToolbarPullTab'
import { OrdersTable } from './order-summary/OrdersTable'
import { orderGroups, getAllOrderRows, type OrderFlagKey } from './order-summary/orderGroups'
import type { OverviewDrawer } from './order-summary/OverviewDrawers'
import { DemoWindowStateToggle, type DemoWindowState } from './order-summary/DemoWindowStateToggle'
import tokens from '@/theme/tokens'

const allOrderRows = getAllOrderRows(orderGroups)

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function OrderSummary() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activeDrawer, setActiveDrawer] = useState<OverviewDrawer>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set())
  const [demoWindowState, setDemoWindowState] = useState<DemoWindowState>('normal')
  const [toolbarPinned, setToolbarPinned] = useState(false)
  const [toolbarHeight, setToolbarHeight] = useState(0)
  const [isHeaderStuck, setIsHeaderStuck] = useState(false)
  const [hideDispatched, setHideDispatched] = useState(true)
  const [hideDeleted, setHideDeleted] = useState(true)
  const [splitSupplyView, setSplitSupplyView] = useState(true)
  const [selectedFlags, setSelectedFlags] = useState<Set<OrderFlagKey>>(new Set())
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return
    const observer = new ResizeObserver(([entry]) => setToolbarHeight(entry.contentRect.height))
    observer.observe(toolbar)
    return () => observer.disconnect()
  }, [])

  const headerHeightPx = parseInt(tokens.headerHeight, 10)
  const stickyTopOffsetPx = toolbarPinned ? headerHeightPx + toolbarHeight : headerHeightPx

  const toggleRowSelected = (id: string) =>
    setSelectedRowIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const setRowsSelected = (ids: string[], selected: boolean) =>
    setSelectedRowIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (selected ? next.add(id) : next.delete(id)))
      return next
    })

  const today = new Date()
  const isToday = isSameDay(selectedDate, today)
  const backgroundColor = isToday
    ? tokens.colorBgPrimary
    : selectedDate < today
      ? tokens.colorAlertWarningBg
      : tokens.colorAlertInfoBg
  const toolbarBackgroundColor = isToday ? tokens.colorBgTertiary : backgroundColor

  return (
    <div className="min-h-full -m-6" style={{ backgroundColor }}>
      <OrderSummaryToolbar
        ref={toolbarRef}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        activeDrawer={activeDrawer}
        onDrawerChange={setActiveDrawer}
        backgroundColor={toolbarBackgroundColor}
        selectedRowIds={selectedRowIds}
        allOrderRows={allOrderRows}
        onClearSelection={() => setSelectedRowIds(new Set())}
        pinned={toolbarPinned}
        hideDispatched={hideDispatched}
        onHideDispatchedChange={setHideDispatched}
        hideDeleted={hideDeleted}
        onHideDeletedChange={setHideDeleted}
        splitSupplyView={splitSupplyView}
        onSplitSupplyViewChange={setSplitSupplyView}
        selectedFlags={selectedFlags}
        onSelectedFlagsChange={setSelectedFlags}
      />
      <ToolbarPullTab
        stickyTopOffsetPx={stickyTopOffsetPx}
        visible={isHeaderStuck}
        pinned={toolbarPinned}
        onToggle={() => setToolbarPinned((prev) => !prev)}
      />
      <OrdersTable
        headerBackgroundColor={isToday ? undefined : backgroundColor}
        selectedRowIds={selectedRowIds}
        onToggleRowSelected={toggleRowSelected}
        onSetRowsSelected={setRowsSelected}
        demoWindowState={demoWindowState}
        stickyTopOffsetPx={stickyTopOffsetPx}
        onStuckChange={setIsHeaderStuck}
        hideDispatched={hideDispatched}
        hideDeleted={hideDeleted}
        splitSupplyView={splitSupplyView}
        selectedFlags={selectedFlags}
      />
      <DemoWindowStateToggle value={demoWindowState} onChange={setDemoWindowState} />
    </div>
  )
}
