import { useState } from 'react'
import { toast } from 'sonner'
import {
  BreakingNewsFilled,
  DeliveryTruckSpeedFilled,
  FlagPackingSlipRequired,
  KeyboardArrowDownFilled,
  MobileArrowDown,
  OutboxFilled,
  PropScheduledLockerUnassigned,
} from '@/components/icons/material-icons'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useStore } from '@/context/StoreContext'
import tokens from '@/theme/tokens'
import type { OrderRow } from './orderGroups'
import { DepartmentNotificationsDialog } from './DepartmentNotificationsDialog'
import type { DepartmentNotificationsSelection } from './departmentNotificationsData'
import { DispatchOrderDialog } from './DispatchOrderDialog'
import { MoveOrdersToShopFloorDialog } from './MoveOrdersToShopFloorDialog'
import { PackingSlipsDialog } from './PackingSlipsDialog'
import { TruckArrivalDialog } from './TruckArrivalDialog'

// requiresSelection actions are disabled (visually, not natively — see aria-disabled below) until
// at least one order row is selected; disabledMessage is the toast shown if clicked while disabled.
const ACTIONS = [
  {
    key: 'move-to-shop-floor',
    label: 'Move to Shop Floor Pick',
    icon: MobileArrowDown,
    requiresSelection: true,
    disabledMessage: 'To move orders from OSR to shop floor, first select one or more orders.',
  },
  {
    key: 'print-invoices',
    label: 'Department Notifications',
    icon: BreakingNewsFilled,
    requiresSelection: true,
    disabledMessage: 'To print department notifications, first select one or more orders.',
  },
  {
    key: 'packing-slips',
    label: 'Packing Slips',
    icon: FlagPackingSlipRequired,
    requiresSelection: true,
    disabledMessage: 'To print packing slips, first select one or more orders.',
  },
  {
    key: 'truck-arrival',
    label: 'Truck Arrival',
    icon: DeliveryTruckSpeedFilled,
    requiresSelection: false,
  },
  {
    key: 'assign-to-locker',
    label: 'Locker Capacity Check',
    icon: PropScheduledLockerUnassigned,
    requiresSelection: true,
    disabledMessage: 'To check locker capacity, first select one or more orders.',
  },
  {
    key: 'dispatch-order',
    label: 'Dispatch Order',
    icon: OutboxFilled,
    requiresSelection: true,
    disabledMessage: 'To dispatch orders, first select one or more orders.',
  },
] as const

type QuickAction = (typeof ACTIONS)[number]

/** Matches the "DIS HH:MM AM/PM" status format already used throughout the demo data. */
function formatDispatchTime(date: Date): string {
  const hour24 = date.getHours()
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${String(hour12).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${period}`
}

interface QuickActionsProps {
  selectedRowIds: Set<string>
  allOrderRows: OrderRow[]
  onClearSelection: () => void
}

/**
 * Shared action list + state/handlers behind both the inline icon row (wide screens) and the
 * "Quick actions" popover (narrow screens) — one source of truth so the two views can't drift.
 */
function useQuickActions({ selectedRowIds, allOrderRows, onClearSelection }: QuickActionsProps) {
  const { isEstore, isNZ, isSupermarket } = useStore()
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [packingSlipsDialogOpen, setPackingSlipsDialogOpen] = useState(false)
  const [truckArrivalDialogOpen, setTruckArrivalDialogOpen] = useState(false)
  const [departmentNotificationsDialogOpen, setDepartmentNotificationsDialogOpen] = useState(false)
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false)
  const actions = ACTIONS.filter((action) => {
    if (action.key === 'assign-to-locker' && !(isNZ && isSupermarket)) return false
    if (!isEstore && action.key === 'move-to-shop-floor') return false
    if (!isNZ && action.key === 'packing-slips') return false
    return true
  })

  const eligibleSelectedCount = allOrderRows.filter(
    (row) => selectedRowIds.has(row.id) && !row.status.startsWith('DIS') && !row.isDeleted,
  ).length

  const selectedOrderCount = selectedRowIds.size
  const packingSlipRequiredSelectedCount = allOrderRows.filter(
    (row) => selectedRowIds.has(row.id) && row.packingSlipRequired,
  ).length
  const dispatchEligibleSelectedCount = allOrderRows.filter(
    (row) => selectedRowIds.has(row.id) && row.status === 'Packed',
  ).length

  // Blocked when 1+ orders are selected but none of them qualify — distinct from requiresSelection,
  // which covers the zero-selected case.
  const blockedMessage = (action: QuickAction): string | null => {
    if (action.key === 'packing-slips' && selectedRowIds.size > 0 && packingSlipRequiredSelectedCount === 0) {
      return 'None of the selected orders require a packing slip.'
    }
    if (action.key === 'dispatch-order' && selectedRowIds.size > 0 && dispatchEligibleSelectedCount === 0) {
      return 'None of the selected orders are packed and ready to dispatch.'
    }
    return null
  }

  const isActionDisabled = (action: QuickAction) =>
    (action.requiresSelection && selectedRowIds.size === 0) || blockedMessage(action) !== null

  const handleActionClick = (action: QuickAction) => {
    if (action.requiresSelection && selectedRowIds.size === 0) {
      toast(action.disabledMessage, { closeButton: true })
      return
    }
    const blocked = blockedMessage(action)
    if (blocked) {
      toast(blocked, { closeButton: true })
      return
    }
    if (action.key === 'move-to-shop-floor') {
      setMoveDialogOpen(true)
      return
    }
    if (action.key === 'packing-slips') {
      setPackingSlipsDialogOpen(true)
      return
    }
    if (action.key === 'truck-arrival') {
      setTruckArrivalDialogOpen(true)
      return
    }
    if (action.key === 'print-invoices') {
      setDepartmentNotificationsDialogOpen(true)
      return
    }
    if (action.key === 'dispatch-order') {
      setDispatchDialogOpen(true)
      return
    }
    console.log(`[QuickActions] ${action.label} clicked`)
  }

  const handlePackingSlipsConfirm = () => {
    console.log(`[QuickActions] Packing Slips clicked (${packingSlipRequiredSelectedCount} required)`)
    setPackingSlipsDialogOpen(false)
    onClearSelection()
  }

  const handleTruckArrivalConfirm = (date: Date, sessions: string[]) => {
    console.log('[QuickActions] Truck Arrival clicked', date, sessions)
    setTruckArrivalDialogOpen(false)
  }

  const handleDepartmentNotificationsConfirm = (selection: DepartmentNotificationsSelection) => {
    console.log('[QuickActions] Department Notifications clicked', selection)
    setDepartmentNotificationsDialogOpen(false)
    onClearSelection()
  }

  const handleDispatchConfirm = () => {
    const dispatchedAt = formatDispatchTime(new Date())
    allOrderRows.forEach((row) => {
      if (selectedRowIds.has(row.id) && row.status === 'Packed') row.status = `DIS ${dispatchedAt}`
    })
    const notDispatchedCount = selectedOrderCount - dispatchEligibleSelectedCount
    if (notDispatchedCount > 0) {
      toast.error(
        `${notDispatchedCount} ${notDispatchedCount === 1 ? 'order wasn’t' : 'orders weren’t'} dispatched — not in Packed status.`,
        { closeButton: true },
      )
    }
    toast.success(`${dispatchEligibleSelectedCount} ${dispatchEligibleSelectedCount === 1 ? 'order' : 'orders'} dispatched successfully.`, {
      closeButton: true,
    })
    console.log(`[QuickActions] Dispatch Order clicked (${dispatchEligibleSelectedCount} dispatched)`)
    setDispatchDialogOpen(false)
    onClearSelection()
  }

  const dialogs = (
    <>
      <MoveOrdersToShopFloorDialog
        open={moveDialogOpen}
        orderCount={eligibleSelectedCount}
        onClose={() => setMoveDialogOpen(false)}
        onConfirm={() => {
          setMoveDialogOpen(false)
          onClearSelection()
        }}
      />
      <PackingSlipsDialog
        open={packingSlipsDialogOpen}
        totalCount={selectedOrderCount}
        requiredCount={packingSlipRequiredSelectedCount}
        onClose={() => setPackingSlipsDialogOpen(false)}
        onConfirm={handlePackingSlipsConfirm}
      />
      <TruckArrivalDialog
        open={truckArrivalDialogOpen}
        onClose={() => setTruckArrivalDialogOpen(false)}
        onConfirm={handleTruckArrivalConfirm}
      />
      <DepartmentNotificationsDialog
        open={departmentNotificationsDialogOpen}
        totalCount={selectedOrderCount}
        onClose={() => setDepartmentNotificationsDialogOpen(false)}
        onConfirm={handleDepartmentNotificationsConfirm}
      />
      <DispatchOrderDialog
        open={dispatchDialogOpen}
        totalCount={selectedOrderCount}
        eligibleCount={dispatchEligibleSelectedCount}
        onClose={() => setDispatchDialogOpen(false)}
        onConfirm={handleDispatchConfirm}
      />
    </>
  )

  return { actions, handleActionClick, isActionDisabled, dialogs }
}

function QuickActionsInline({
  actions,
  handleActionClick,
  isActionDisabled,
}: {
  actions: readonly QuickAction[]
  handleActionClick: (action: QuickAction) => void
  isActionDisabled: (action: QuickAction) => boolean
}) {
  return (
    <div className="hidden flex-col items-center gap-1 xl:flex">
      <span
        style={{
          fontFamily: tokens.fontFamily,
          fontSize: tokens.fontSizeCaption,
          color: tokens.colorTextMedium,
          whiteSpace: 'nowrap',
        }}
      >
        Quick actions
      </span>
      <div className="flex items-center gap-1">
        {actions.map((action) => {
          const { key, label, icon: Icon } = action
          const isDisabled = isActionDisabled(action)
          return (
            <Tooltip key={key}>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="border border-transparent hover:border-border hover:bg-white"
                    aria-disabled={isDisabled}
                    onClick={() => handleActionClick(action)}
                  />
                }
              >
                <Icon className="size-6" />
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}

function QuickActionsPopover({
  actions,
  handleActionClick,
  isActionDisabled,
}: {
  actions: readonly QuickAction[]
  handleActionClick: (action: QuickAction) => void
  isActionDisabled: (action: QuickAction) => boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="xl:hidden">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm" className="h-auto w-16 flex-col gap-0.5 whitespace-normal py-1 text-center leading-tight">
              Quick actions
              <KeyboardArrowDownFilled
                size={14}
                style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 150ms ease' }}
              />
            </Button>
          }
        />
        <PopoverContent className="w-64 p-1">
          {actions.map((action) => {
            const { key, label, icon: Icon } = action
            const isDisabled = isActionDisabled(action)
            return (
              <Button
                key={key}
                type="button"
                variant="ghost"
                aria-disabled={isDisabled}
                onClick={() => {
                  setOpen(false)
                  handleActionClick(action)
                }}
                className="h-auto w-full justify-start gap-2.5 px-2 py-1.5 text-muted-foreground hover:text-foreground"
              >
                <Icon className="size-4.5 shrink-0" />
                <span style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeBodySm, color: tokens.colorTextStrong }}>
                  {label}
                </span>
              </Button>
            )
          })}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function QuickActions(props: QuickActionsProps) {
  const { actions, handleActionClick, isActionDisabled, dialogs } = useQuickActions(props)

  return (
    <>
      <QuickActionsInline actions={actions} handleActionClick={handleActionClick} isActionDisabled={isActionDisabled} />
      <QuickActionsPopover actions={actions} handleActionClick={handleActionClick} isActionDisabled={isActionDisabled} />
      {dialogs}
    </>
  )
}
