import {
  stickyThClass,
  stickyThStuckShadowClass,
  theadStyle,
  useStickyHeaderShadow,
} from '@/components/shared/StickyTableContainer'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import tokens from '@/theme/tokens'
import {
  timelinePickers,
  itemsPerLabourHour,
  rfPickRate,
  TIMELINE_START_MIN,
  TIMELINE_END_MIN,
  type TimelineZone,
} from './dashData'

const ZONE_COLOR: Record<TimelineZone, string> = {
  ambient: tokens.colorZoneAmbient,
  chilled: tokens.colorZoneChilled,
  frozen: tokens.colorZoneFrozen,
  security: tokens.colorZoneSecurity,
  nonPicking: tokens.colorZoneNonPicking,
}

const ZONE_LABEL: Record<TimelineZone, string> = {
  ambient: 'Ambient',
  chilled: 'Chilled',
  frozen: 'Frozen',
  security: 'Security',
  nonPicking: 'Non picking',
}

const LEGEND: TimelineZone[] = ['ambient', 'chilled', 'frozen', 'nonPicking']

const HOUR_TICKS = Array.from(
  { length: (TIMELINE_END_MIN - TIMELINE_START_MIN) / 60 + 1 },
  (_, i) => TIMELINE_START_MIN + i * 60,
)

function formatHour(min: number) {
  const h = Math.floor(min / 60)
  const suffix = h < 12 ? 'am' : 'pm'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}${suffix}`
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}hr`
  return `${h}hr ${m}min`
}

function toFrac(min: number) {
  return (min - TIMELINE_START_MIN) / (TIMELINE_END_MIN - TIMELINE_START_MIN)
}

// Bucketed by % of target rather than icons: <95% pale red, 95-99% the same pale yellow used
// for unsaved-change field highlights elsewhere in the app, 100%+ the light green used for
// "Picking" status in the Order Summary supply bar.
function metricStatus(value: number | null, target: number): { backgroundColor: string; color: string } {
  const pctOfTarget = target > 0 ? ((value ?? 0) / target) * 100 : 0
  if (pctOfTarget < 95) {
    return { backgroundColor: tokens.colorStatusNegativeBgWeak, color: tokens.colorStatusNegativeTextWeak }
  }
  if (pctOfTarget < 100) {
    return { backgroundColor: tokens.colorStatusTentativeBgWeak, color: tokens.colorStatusTentativeTextWeak }
  }
  return { backgroundColor: tokens.colorBgHighlightWeak, color: tokens.colorTextMedium }
}

function metricCellClass(stuckShadow: string) {
  return `${stickyThClass} ${stuckShadow} text-right!`
}

function MetricCell({ value, target, suffix = '' }: { value: number | null; target: number; suffix?: string }) {
  const status = metricStatus(value, target)
  return (
    <td
      className="text-right"
      style={{
        fontFamily: tokens.fontFamily,
        fontSize: tokens.fontSizeCaption,
        fontWeight: 700,
        padding: `${tokens.spaceInternalSmall} ${tokens.spaceInternalMedium}`,
        borderBottom: `1px solid ${tokens.colorBorderWeak}`,
        backgroundColor: status.backgroundColor,
        color: status.color,
      }}
    >
      {value ?? 0}
      {suffix}
    </td>
  )
}

export function TimelineTab() {
  const { sentinelRef, isStuck } = useStickyHeaderShadow()
  const stuckShadow = isStuck ? stickyThStuckShadowClass : ''

  return (
    <div className="p-6 flex flex-col" style={{ gap: tokens.spaceContentSmall }}>
      <Card>
        <CardHeader className="justify-between">
          <CardTitle>Personal Shopper Timeline</CardTitle>
          <div className="flex items-center flex-wrap" style={{ gap: tokens.spaceContentSmall }}>
            {LEGEND.map((key) => (
              <div key={key} className="flex items-center" style={{ gap: tokens.spaceInternalSmall }}>
                <span style={{ width: 10, height: 10, borderRadius: tokens.radiusXxs, backgroundColor: ZONE_COLOR[key], display: 'inline-block' }} />
                <span style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeCaption, color: tokens.colorTextMedium }}>{ZONE_LABEL[key]}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <div ref={sentinelRef} />
        <table className="w-full" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 64 }} />
            <col />
            <col style={{ width: 90 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 140 }} />
          </colgroup>
          <thead style={theadStyle}>
            <tr>
              <th className={`${stickyThClass} ${stuckShadow}`}>ID</th>
              <th className={`${stickyThClass} ${stuckShadow}`} style={{ position: 'relative' }}>
                <div className="relative" style={{ height: 16 }}>
                  {HOUR_TICKS.map((min) => (
                    <span
                      key={min}
                      className="absolute"
                      style={{ left: `${toFrac(min) * 100}%`, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
                    >
                      {formatHour(min)}
                    </span>
                  ))}
                </div>
              </th>
              <th className={metricCellClass(stuckShadow)}>Items/Hour</th>
              <th className={metricCellClass(stuckShadow)}>RF Pick rate</th>
              <th className={metricCellClass(stuckShadow)}>Goal Time Performance</th>
            </tr>
          </thead>
          <tbody>
            {timelinePickers.map((picker, i) => (
              <tr key={picker.id} style={{ backgroundColor: i % 2 === 0 ? tokens.colorBgPrimary : tokens.colorBgSecondary }}>
                <td
                  style={{
                    fontFamily: tokens.fontFamily,
                    fontSize: tokens.fontSizeCaption,
                    color: tokens.colorTextStrong,
                    padding: `${tokens.spaceInternalSmall} ${tokens.spaceInternalMedium}`,
                    borderBottom: `1px solid ${tokens.colorBorderWeak}`,
                  }}
                >
                  {picker.id}
                </td>
                <td style={{ padding: `${tokens.spaceInternalSmall} ${tokens.spaceInternalMedium}`, borderBottom: `1px solid ${tokens.colorBorderWeak}` }}>
                  <div className="relative" style={{ height: 18 }}>
                    {picker.segments.map((seg, si) => (
                      <Tooltip key={si}>
                        <TooltipTrigger
                          render={
                            <div
                              className="absolute"
                              style={{
                                left: `${toFrac(seg.startMin) * 100}%`,
                                width: `${(toFrac(seg.endMin) - toFrac(seg.startMin)) * 100}%`,
                                top: 0,
                                bottom: 0,
                                backgroundColor: ZONE_COLOR[seg.zone],
                                borderRadius: tokens.radiusXxs,
                                cursor: 'default',
                              }}
                            />
                          }
                        />
                        <TooltipContent>
                          {ZONE_LABEL[seg.zone]} — {formatDuration(seg.endMin - seg.startMin)}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </td>
                <MetricCell value={picker.itemsPerHour} target={itemsPerLabourHour.target} />
                <MetricCell value={picker.rfPickRate} target={rfPickRate.target} />
                <MetricCell value={picker.goalTimePerformance} target={100} suffix="%" />
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
