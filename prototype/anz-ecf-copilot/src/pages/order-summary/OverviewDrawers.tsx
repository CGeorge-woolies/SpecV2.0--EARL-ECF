import { FilterAltFilled, LeftPanelOpenFilled } from '@/components/icons/material-icons'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useStore } from '@/context/StoreContext'
import { ORDER_FLAG_FILTERS, type OrderFlagKey } from './orderGroups'
import { SessionOverview } from './SessionOverview'
import { WindowOverview } from './WindowOverview'
import tokens from '@/theme/tokens'

export type OverviewDrawer = 'window' | 'session' | null

interface OverviewDrawersProps {
  activeDrawer: OverviewDrawer
  onOpenChange: (drawer: OverviewDrawer) => void
  selectedDate: Date
  hideDispatched: boolean
  onHideDispatchedChange: (hidden: boolean) => void
  hideDeleted: boolean
  onHideDeletedChange: (hidden: boolean) => void
  splitSupplyView: boolean
  onSplitSupplyViewChange: (split: boolean) => void
  selectedFlags: Set<OrderFlagKey>
  onSelectedFlagsChange: (flags: Set<OrderFlagKey>) => void
}

const linkStyle = {
  fontFamily: tokens.fontFamily,
  fontSize: tokens.fontSizeBodySm,
  fontWeight: 500,
  color: tokens.colorActionLinkDefault,
} as const

const linkButtonClassName =
  'h-auto justify-start gap-1 rounded-sm px-1.5 py-0.5 border border-transparent hover:border-border hover:bg-white'

function FilterRow({
  label,
  statusLabel,
  checked,
  onCheckedChange,
}: {
  label: string
  statusLabel?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 px-2 py-1.5 cursor-pointer">
      <span style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeBodySm, color: tokens.colorTextStrong }}>
        {label}
        {statusLabel && (
          <span style={{ color: tokens.colorPrimaryDarkest, fontWeight: 500 }}> {statusLabel}</span>
        )}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  )
}

function FilterMenu({
  hideDispatched,
  onHideDispatchedChange,
  hideDeleted,
  onHideDeletedChange,
  showSplitSupplyToggle,
  splitSupplyView,
  onSplitSupplyViewChange,
  isNZ,
  selectedFlags,
  onSelectedFlagsChange,
}: {
  hideDispatched: boolean
  onHideDispatchedChange: (hidden: boolean) => void
  hideDeleted: boolean
  onHideDeletedChange: (hidden: boolean) => void
  showSplitSupplyToggle: boolean
  splitSupplyView: boolean
  onSplitSupplyViewChange: (split: boolean) => void
  /** Gates which ORDER_FLAG_FILTERS options render — NZ-only flags (Pharmacy Item, Packing Slip
   * Required) are omitted entirely for AU. */
  isNZ: boolean
  selectedFlags: Set<OrderFlagKey>
  onSelectedFlagsChange: (flags: Set<OrderFlagKey>) => void
}) {
  const visibleFlagOptions = ORDER_FLAG_FILTERS.filter((option) => !option.countryGated || isNZ)

  const toggleFlag = (key: OrderFlagKey) => {
    const next = new Set(selectedFlags)
    next.has(key) ? next.delete(key) : next.add(key)
    onSelectedFlagsChange(next)
  }

  // Counts toggles that have moved away from their out-of-the-box value — that's what "a filter
  // is applied" means here, since every toggle (not just the narrowing ones) ships with a default.
  // Each selected order flag also counts as one active filter.
  const activeFilterCount =
    Number(!hideDispatched) +
    Number(!hideDeleted) +
    (showSplitSupplyToggle ? Number(!splitSupplyView) : 0) +
    selectedFlags.size
  const hasActiveFilters = activeFilterCount > 0

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={hasActiveFilters ? 'h-auto justify-start gap-1 rounded-sm px-1.5 py-0.5 border border-transparent hover:opacity-90' : linkButtonClassName}
            style={hasActiveFilters ? { ...linkStyle, backgroundColor: tokens.colorPrimary, color: tokens.colorTextOnContrastStrong } : linkStyle}
          />
        }
      >
        <FilterAltFilled size={14} style={hasActiveFilters ? { color: tokens.colorTextOnContrastStrong } : undefined} />
        Filters/options
        {hasActiveFilters && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: tokens.radiusPill,
              backgroundColor: tokens.colorTextOnContrastStrong,
              color: tokens.colorPrimary,
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {activeFilterCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <FilterRow
          label="Dispatched Orders:"
          statusLabel={hideDispatched ? 'Hidden' : 'Shown'}
          checked={!hideDispatched}
          onCheckedChange={(checked) => onHideDispatchedChange(!checked)}
        />
        <FilterRow
          label="Deleted Orders:"
          statusLabel={hideDeleted ? 'Hidden' : 'Shown'}
          checked={!hideDeleted}
          onCheckedChange={(checked) => onHideDeletedChange(!checked)}
        />
        {showSplitSupplyToggle && (
          <FilterRow
            label="Split Supply View:"
            statusLabel={splitSupplyView ? 'On' : 'Off'}
            checked={splitSupplyView}
            onCheckedChange={onSplitSupplyViewChange}
          />
        )}
        <div className="mt-1 border-t pt-2" style={{ borderColor: tokens.colorBorderWeak }}>
          <div className="flex items-center justify-between px-2 pb-1.5">
            <span style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeBodySm, color: tokens.colorTextStrong }}>
              Filter by order flags
              {selectedFlags.size > 0 && (
                <span style={{ color: tokens.colorPrimaryDarkest, fontWeight: 500 }}> ({selectedFlags.size})</span>
              )}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-1 py-0.5 disabled:opacity-50"
              style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeBodySm, fontWeight: 500, color: tokens.colorActionLinkDefault }}
              disabled={selectedFlags.size === 0}
              onClick={() => onSelectedFlagsChange(new Set())}
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-1 px-2 pb-1">
            {visibleFlagOptions.map(({ key, tooltip, icon: Icon }) => {
              const selected = selectedFlags.has(key)
              return (
                <Tooltip key={key}>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-pressed={selected}
                        // [&_svg_path]:fill-current overrides FlagAgeRestricted18/16's hardcoded
                        // `fill="black"` paths, which otherwise ignore the button's text color.
                        className={`[&_svg_path]:fill-current ${selected ? 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary' : 'text-muted-foreground'}`}
                        onClick={() => toggleFlag(key)}
                      />
                    }
                  >
                    <Icon />
                  </TooltipTrigger>
                  <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function OverviewDrawers({
  activeDrawer,
  onOpenChange,
  selectedDate,
  hideDispatched,
  onHideDispatchedChange,
  hideDeleted,
  onHideDeletedChange,
  splitSupplyView,
  onSplitSupplyViewChange,
  selectedFlags,
  onSelectedFlagsChange,
}: OverviewDrawersProps) {
  const { isAU, isEstore, isNZ } = useStore()
  return (
    <div className="flex flex-col items-start gap-0.5">
      {isAU && (
        <Button variant="ghost" size="sm" className={linkButtonClassName} style={linkStyle} onClick={() => onOpenChange('session')}>
          <LeftPanelOpenFilled size={14} />
          Session overview
        </Button>
      )}
      <Button variant="ghost" size="sm" className={linkButtonClassName} style={linkStyle} onClick={() => onOpenChange('window')}>
        <LeftPanelOpenFilled size={14} />
        Window overview
      </Button>
      <FilterMenu
        hideDispatched={hideDispatched}
        onHideDispatchedChange={onHideDispatchedChange}
        hideDeleted={hideDeleted}
        onHideDeletedChange={onHideDeletedChange}
        showSplitSupplyToggle={isEstore}
        splitSupplyView={splitSupplyView}
        onSplitSupplyViewChange={onSplitSupplyViewChange}
        isNZ={isNZ}
        selectedFlags={selectedFlags}
        onSelectedFlagsChange={onSelectedFlagsChange}
      />

      <Sheet open={activeDrawer === 'window'} onOpenChange={(open) => onOpenChange(open ? 'window' : null)}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Window overview</SheetTitle>
          </SheetHeader>
          <WindowOverview selectedDate={selectedDate} />
        </SheetContent>
      </Sheet>

      {isAU && (
        <Sheet open={activeDrawer === 'session'} onOpenChange={(open) => onOpenChange(open ? 'session' : null)}>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Session overview</SheetTitle>
            </SheetHeader>
            <SessionOverview selectedDate={selectedDate} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
