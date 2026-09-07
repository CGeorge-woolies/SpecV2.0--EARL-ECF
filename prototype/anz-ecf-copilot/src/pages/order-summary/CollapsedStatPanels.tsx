import { useState } from 'react'
import { KeyboardArrowDownFilled } from '@/components/icons/material-icons'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import tokens from '@/theme/tokens'
import { StatBadge, ZoneBadges, useZones, type ZoneConfig } from './StatPanel'
import { totesAvailable, itemsAvailable } from './mockData'
import type { ZoneBreakdown } from './mockData'

interface CollapsedStatPanelProps {
  label: string
  data: ZoneBreakdown
  zones: ZoneConfig[]
}

/** A single stat card collapsed to just its total, with its own chevron to reveal its zone breakdown. */
function CollapsedStatPanel({ label, data, zones }: CollapsedStatPanelProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div
        style={{
          border: `1px solid ${tokens.colorBorderWeak}`,
          borderRadius: tokens.radiusSm,
        }}
      >
        <CollapsibleTrigger
          render={
            <button
              type="button"
              aria-label={expanded ? `Hide ${label} zone breakdown` : `Show ${label} zone breakdown`}
              className="flex w-full items-center gap-2 rounded-[inherit] px-3 py-1 text-left hover:bg-black/3"
            />
          }
        >
          <StatBadge total={data.total} label={label} />
          <KeyboardArrowDownFilled
            size={16}
            className="ml-auto"
            style={{
              color: tokens.colorTextMedium,
              transform: expanded ? 'rotate(180deg)' : undefined,
              transition: 'transform 150ms ease',
            }}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-1">
            <ZoneBadges zones={zones} data={data} />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

/**
 * Compact stand-in for the two full StatPanels on narrow screens, where they'd otherwise
 * overlap the centered DateStepper. Stacks the Totes and Articles cards, each collapsed to
 * just its total by default with its own chevron to reveal that card's zone breakdown.
 */
export function CollapsedStatPanels() {
  const zones = useZones()

  return (
    <div className="flex flex-col gap-2">
      <CollapsedStatPanel label="Totes awaiting pick" data={totesAvailable} zones={zones} />
      <CollapsedStatPanel label="Articles awaiting pick" data={itemsAvailable} zones={zones} />
    </div>
  )
}
