import { Pencil, X } from 'lucide-react'
import {
  FlagPackingSlipRequired,
  MobileArrowDown,
  MobileArrowDownOutlined,
  NoteAlt,
  PrintOrder,
  ReceiptLong,
  type IconComponent,
} from '@/components/icons/material-icons'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsIndicator } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePersona } from '@/context/PersonaContext'
import { useStore } from '@/context/StoreContext'
import tokens from '@/theme/tokens'
import type { OrderRow } from '../order-summary/orderGroups'

export type OrderDetailTab = 'articles' | 'details' | 'instructions' | 'labels' | 'samples' | 'audit'

const TABS: { key: OrderDetailTab; label: string }[] = [
  { key: 'articles', label: 'Articles' },
  { key: 'details', label: 'Details' },
  { key: 'instructions', label: 'Instructions' },
  { key: 'labels', label: 'Labels' },
  { key: 'samples', label: 'Samples' },
  { key: 'audit', label: 'Audit' },
]

interface QuickAction {
  key: string
  label: string
  icon: IconComponent
  disabled?: boolean
  onClick: () => void
}

interface OrderDetailToolbarProps {
  order: OrderRow
  activeTab: OrderDetailTab
  onTabChange: (tab: OrderDetailTab) => void
  selectedLineCount: number
  showManualPicking: boolean
  onOpenManualPicking: () => void
  onOpenPrintOrderList: () => void
  onOpenPrintInvoice: () => void
  onOpenMoveOrder: () => void
  onOpenMoveLine: () => void
  isEditingDetails: boolean
  onStartEditingDetails: () => void
  onCancelEditingDetails: () => void
}

export function OrderDetailToolbar({
  order,
  activeTab,
  onTabChange,
  selectedLineCount,
  showManualPicking,
  onOpenManualPicking,
  onOpenPrintOrderList,
  onOpenPrintInvoice,
  onOpenMoveOrder,
  onOpenMoveLine,
  isEditingDetails,
  onStartEditingDetails,
  onCancelEditingDetails,
}: OrderDetailToolbarProps) {
  const { isEstore, isAU, isNZ } = useStore()
  const { isCustomerSupport } = usePersona()

  const showEditDetails = activeTab === 'details' && isNZ && isCustomerSupport

  // Base quick actions are always shown, regardless of the active tab. Once tab-specific
  // actions are designed, merge in a `TAB_ACTIONS[activeTab] ?? []` lookup here.
  const actions: QuickAction[] = [
    // AU-only: NZ shows a Print Packing Slip action in this slot instead.
    ...(isAU
      ? [
          {
            key: 'print-invoice',
            label: 'Print Invoice for Dispatched Order',
            icon: ReceiptLong,
            disabled: !order.status.startsWith('DIS'),
            onClick: onOpenPrintInvoice,
          },
        ]
      : []),
    // NZ-only, and only when this order is flagged as requiring a packing slip.
    ...(isNZ && order.packingSlipRequired
      ? [
          {
            key: 'print-packing-slip',
            label: 'Print Packing Slip',
            icon: FlagPackingSlipRequired,
            onClick: () => console.log('[OrderDetailToolbar] Print Packing Slip clicked'),
          },
        ]
      : []),
    // NZ-only — AU has no equivalent screen/need for this.
    ...(isNZ
      ? [
          {
            key: 'print-order-list',
            label: 'Print Order List',
            icon: PrintOrder,
            disabled: order.status.startsWith('DIS'),
            onClick: onOpenPrintOrderList,
          },
        ]
      : []),
    // Manual Picking is a BCP fallback only — hidden behind a feature flag, off by default.
    ...(showManualPicking
      ? [
          {
            key: 'manual-picking',
            label: 'Print Manual Pick List',
            icon: NoteAlt,
            disabled: order.status.startsWith('DIS'),
            onClick: onOpenManualPicking,
          },
        ]
      : []),
    // Both OSR actions act on Articles-tab data (whole-order or selected-line moves), and their
    // dialogs live inside ArticlesTab itself — so they're only meaningful, and only mounted to
    // actually open, while that tab is active.
    ...(isEstore && activeTab === 'articles'
      ? [
          {
            key: 'move-order-osr',
            label: 'Move Order from OSR to Shop Floor',
            icon: MobileArrowDown,
            // Dispatched orders are fully settled/read-only — every OSR line has already moved
            // (or been fulfilled), so there's nothing left to move.
            disabled: order.status.startsWith('DIS'),
            onClick: onOpenMoveOrder,
          },
          {
            key: 'move-line-osr',
            label: 'Move Line from OSR to Shop Floor',
            icon: MobileArrowDownOutlined,
            disabled: order.status.startsWith('DIS') || selectedLineCount === 0,
            onClick: onOpenMoveLine,
          },
        ]
      : []),
  ]

  return (
    <div
      className="w-screen"
      style={{
        backgroundColor: tokens.colorBgTertiary,
        borderBottom: `1px solid ${tokens.colorBorderWeak}`,
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
      }}
    >
      <div className="relative flex items-center max-w-[1920px] mx-auto px-4 py-3">
        <div className="flex items-center gap-1">
          {actions.map(({ key, label, icon: Icon, disabled, onClick }) => (
            <Tooltip key={key}>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    disabled={disabled}
                    focusableWhenDisabled
                    className="border border-transparent hover:not-aria-disabled:border-border hover:not-aria-disabled:bg-white"
                    onClick={disabled ? undefined : onClick}
                  />
                }
              >
                <Icon className="size-6" />
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as OrderDetailTab)}>
            <TabsList className="relative">
              {TABS.map(({ key, label }) => (
                <TabsTrigger key={key} value={key}>
                  {label}
                </TabsTrigger>
              ))}
              <TabsIndicator />
            </TabsList>
          </Tabs>
        </div>

        {showEditDetails && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={isEditingDetails ? onCancelEditingDetails : onStartEditingDetails}
          >
            {isEditingDetails ? (
              <>
                <X className="size-3.5" />
                Cancel
              </>
            ) : (
              <>
                <Pencil className="size-3.5" />
                Edit Details
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
