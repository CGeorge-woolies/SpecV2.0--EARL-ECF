import { useNavigate } from 'react-router-dom'
import { FlagMilestoneOrder, FlagPackingSlipRequired } from '@/components/icons/material-icons'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { LocationIdChip } from '@/components/shared/LocationIdChip'
import tokens from '@/theme/tokens'
import {
  bodyCellClass,
  checkboxCellClass,
  colDividerClass,
  FLAG_ICONS,
  getVisibleFlagColumns,
  rowHighlightStyle,
} from '../order-summary/OrdersTable'
import {
  getAgeRestrictionDisplay,
  getMilestoneOrderDisplay,
  getPropositionDisplay,
  getRoutingDisplay,
  shouldShowOnDemandDisTime,
  type OrderRow,
} from '../order-summary/orderGroups'

/** rowSpan for a merged column's leading row; null means this row is covered by an earlier row's
 * merged cell and should render nothing for that column. */
export type MergeSpan = number | null

export function SearchResultRow({
  row,
  rowBg,
  checked,
  onCheckedChange,
  storeLabel,
  storeSpan,
  sessionWindowLabel,
  sessionWindowSpan,
  pickupDateLabel,
  pickupDateSpan,
  customerSpan,
  isAU,
  isNZ,
}: {
  row: OrderRow
  rowBg: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  storeLabel: string
  storeSpan: MergeSpan
  sessionWindowLabel: string
  sessionWindowSpan: MergeSpan
  pickupDateLabel: string
  pickupDateSpan: MergeSpan
  customerSpan: MergeSpan
  isAU: boolean
  isNZ: boolean
}) {
  const navigate = useNavigate()
  const proposition = getPropositionDisplay(row, isAU)
  const ageRestriction = getAgeRestrictionDisplay(row)
  const routing = getRoutingDisplay(row, isNZ)
  const highlightStyle = rowHighlightStyle(row)
  const flagColumns = getVisibleFlagColumns()
  const milestone = getMilestoneOrderDisplay(row)

  return (
    <tr
      className="cursor-pointer hover:brightness-95"
      style={{ backgroundColor: rowBg }}
      onClick={() => navigate(`/order/detail?id=${row.orderNo}`)}
    >
      {storeSpan !== null && (
        <td rowSpan={storeSpan} className={`${bodyCellClass} ${colDividerClass}`}>
          {storeLabel}
        </td>
      )}
      {sessionWindowSpan !== null && (
        <td rowSpan={sessionWindowSpan} className={`${bodyCellClass} ${colDividerClass}`}>
          {sessionWindowLabel}
        </td>
      )}
      <td className={`${checkboxCellClass} ${colDividerClass}`} onClick={(e) => e.stopPropagation()}>
        <Checkbox className="mx-auto" checked={checked} onCheckedChange={onCheckedChange} />
      </td>
      {pickupDateSpan !== null && (
        <td rowSpan={pickupDateSpan} className={`${bodyCellClass} ${colDividerClass}`}>
          {pickupDateLabel}
        </td>
      )}
      {flagColumns.map(({ key, label }, index) => {
        const FlagIcon = FLAG_ICONS[key]
        return (
          <td key={key} className={`px-1 py-1 text-xs text-center text-foreground border-b border-border ${index === flagColumns.length - 1 ? colDividerClass : ''}`}>
            {key === 'proposition' && proposition && (
              <Tooltip>
                <TooltipTrigger render={<span className="mx-auto flex w-fit cursor-default" />}>
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
                <TooltipTrigger render={<span className="mx-auto flex w-fit cursor-default" />}>
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
            {key !== 'proposition' &&
              key !== 'ageRestricted' &&
              FlagIcon &&
              row.flags.includes(key) && (
              <Tooltip>
                <TooltipTrigger render={<span className="mx-auto flex w-fit cursor-default" />}>
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
                <TooltipTrigger render={<span className="inline-flex cursor-default" />}>
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
                <TooltipTrigger render={<span className="inline-flex cursor-default" />}>
                  <FlagPackingSlipRequired size={14} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Packing slip required</TooltipContent>
              </Tooltip>
            )}
          </span>
        )}
      </td>
      <td className={`${bodyCellClass} ${colDividerClass}`} style={highlightStyle}>
        <span className="inline-flex w-full items-center justify-between gap-1.5">
          {routing.kind === 'locationId' && <LocationIdChip id={routing.value} />}
          {routing.kind === 'code' && routing.value}
          {row.dispatchByTime && shouldShowOnDemandDisTime(row, isNZ) && (
            <span className="ml-auto text-[11px] text-muted-foreground whitespace-nowrap">DUE {row.dispatchByTime}</span>
          )}
        </span>
      </td>
      {customerSpan !== null && (
        <td
          rowSpan={customerSpan}
          className={`${bodyCellClass} ${colDividerClass} truncate`}
          style={highlightStyle}
          title={row.customer}
        >
          {row.customer}
        </td>
      )}
      <td className={`${bodyCellClass} ${colDividerClass}`} style={highlightStyle}>
        {row.status}
      </td>
      <td className={`${bodyCellClass} ${colDividerClass} text-right`} style={highlightStyle}>{row.totesPicked}</td>
      <td className={`${bodyCellClass} ${colDividerClass} text-right`} style={highlightStyle}>{row.lines}</td>
      <td className={`${bodyCellClass} text-right`} style={highlightStyle}>{row.articles}</td>
    </tr>
  )
}
