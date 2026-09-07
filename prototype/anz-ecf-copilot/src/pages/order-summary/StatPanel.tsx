import { AcUnitFilled, ShelvesFilled, ShieldLockOutlined, ThermostatFilled, type IconComponent } from '@/components/icons/material-icons'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useStore } from '@/context/StoreContext'
import tokens from '@/theme/tokens'
import type { ZoneBreakdown } from './mockData'

export interface ZoneConfig {
  key: keyof Omit<ZoneBreakdown, 'total'>
  label: string
  icon: IconComponent
  color: string
  badge?: string
}

const BASE_ZONES: ZoneConfig[] = [
  { key: 'ambient', label: 'Ambient', icon: ShelvesFilled, color: tokens.colorTextMedium },
  { key: 'chilled', label: 'Chilled', icon: ThermostatFilled, color: tokens.colorTextMedium },
  { key: 'frozen', label: 'Frozen', icon: AcUnitFilled, color: tokens.colorTextMedium },
  { key: 'security', label: 'Security', icon: ShieldLockOutlined, color: tokens.colorTextMedium },
]

// CFC/AU stores split the single ambient zone into three physical ambient zones
const AMBIENT_ZONES: ZoneConfig[] = [
  { key: 'ambient1', label: 'Ambient 1', icon: ShelvesFilled, color: tokens.colorTextMedium, badge: '1' },
  { key: 'ambient2', label: 'Ambient 2', icon: ShelvesFilled, color: tokens.colorTextMedium, badge: '2' },
  { key: 'ambient3', label: 'Ambient 3', icon: ShelvesFilled, color: tokens.colorTextMedium, badge: '3' },
]

/** Returns the zone list for the active store config (AU/CFC stores split ambient into 3 zones). */
export function useZones(): ZoneConfig[] {
  const { isCFC, isAU } = useStore()
  const showSplitAmbient = isCFC && isAU
  return showSplitAmbient ? [...AMBIENT_ZONES, ...BASE_ZONES.slice(1)] : BASE_ZONES
}

/** Bolds the first word (e.g. "Totes"/"Articles") of a "<Noun> awaiting pick" label. */
export function formatStatLabel(label: string) {
  const [firstWord, ...rest] = label.split(' ')
  return (
    <>
      <span style={{ fontWeight: 700 }}>{firstWord}</span>
      {rest.length > 0 && ` ${rest.join(' ')}`}
    </>
  )
}

interface StatBadgeProps {
  total: number
  label: string
}

/** The "12 Totes awaiting pick" badge + label header, shared by the full and compact panel layouts. */
export function StatBadge({ total, label }: StatBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger
          render={
            <Badge
              variant="outline"
              style={{
                borderColor: tokens.colorBorderDefault,
                color: tokens.colorTextStrong,
                backgroundColor: tokens.colorBgPrimary,
              }}
            />
          }
        >
          <span style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeBodySm, lineHeight: '20px', fontWeight: 700 }}>
            {total}
          </span>
        </TooltipTrigger>
        <TooltipContent>Total</TooltipContent>
      </Tooltip>
      <span
        style={{
          fontFamily: tokens.fontFamily,
          fontSize: tokens.fontSizeBodySm,
          lineHeight: '20px',
          color: tokens.colorTextMedium,
          whiteSpace: 'nowrap',
        }}
      >
        {formatStatLabel(label)}
      </span>
    </div>
  )
}

interface ZoneBadgesProps {
  zones: ZoneConfig[]
  data: ZoneBreakdown
}

/** The grid of per-zone icon badges (Ambient/Chilled/Frozen/Security), shared by the full and compact panel layouts. */
export function ZoneBadges({ zones, data }: ZoneBadgesProps) {
  const maxZoneDigits = Math.max(...zones.map(({ key }) => String(data[key] ?? 0).length))

  return (
    <div className="grid grid-cols-4 gap-1">
      {zones.map(({ key, label: zoneLabel, icon: Icon, color, badge }) => (
        <Tooltip key={key}>
          <TooltipTrigger
            render={
              <Badge
                variant="outline"
                className="gap-1"
                style={{
                  borderColor: tokens.colorBorderWeak,
                  color: tokens.colorTextStrong,
                }}
              />
            }
          >
            <span className="relative inline-flex items-center">
              <Icon size={12} style={{ color }} />
              {badge && (
                <span
                  className="absolute -bottom-1 -right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full text-[7px] font-bold leading-none"
                  style={{ backgroundColor: tokens.colorBgPrimary, color: tokens.colorTextStrong }}
                >
                  {badge}
                </span>
              )}
            </span>
            <span
              style={{
                minWidth: `${maxZoneDigits}ch`,
                textAlign: 'left',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {data[key] ?? 0}
            </span>
          </TooltipTrigger>
          <TooltipContent>{zoneLabel}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

interface StatPanelProps {
  label: string
  data: ZoneBreakdown
}

export function StatPanel({ label, data }: StatPanelProps) {
  const zones = useZones()

  return (
    <div
      className="flex flex-col items-start gap-1.5 px-3 py-2"
      style={{
        border: `1px solid ${tokens.colorBorderWeak}`,
        borderRadius: tokens.radiusSm,
      }}
    >
      <StatBadge total={data.total} label={label} />
      <ZoneBadges zones={zones} data={data} />
    </div>
  )
}
