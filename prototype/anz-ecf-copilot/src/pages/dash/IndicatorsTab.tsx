import type { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import tokens from '@/theme/tokens'
import { useStore } from '@/context/StoreContext'
import { Gauge } from './Gauge'
import { SimpleBarChart, StackedBarChart } from './ZoneBarChart'
import {
  itemsPerLabourHour,
  rfPickRate,
  estimatedPickingEndTime,
  teamMembers,
  totes,
  trucks,
  ZONE_LABEL,
} from './dashData'

function TargetBadge({ value }: { value: number | string }) {
  return (
    <span
      style={{
        fontFamily: tokens.fontFamily,
        fontSize: tokens.fontSizeBodySm,
        fontWeight: 400,
        color: tokens.colorStatusPositiveTextWeak,
      }}
    >
      Target: {value}
    </span>
  )
}

function InfoTable({ rows }: { rows: { label: string; value: ReactNode; highlight?: boolean; bold?: boolean }[] }) {
  return (
    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th
            className="text-left"
            style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeCaption, color: tokens.colorTextMedium, fontWeight: 700, padding: tokens.spaceInternalMedium, borderBottom: `1px solid ${tokens.colorBorderWeak}` }}
          >
            Description
          </th>
          <th
            className="text-right"
            style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeCaption, color: tokens.colorTextMedium, fontWeight: 700, padding: tokens.spaceInternalMedium, borderBottom: `1px solid ${tokens.colorBorderWeak}` }}
          >
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td
              style={{
                fontFamily: tokens.fontFamily,
                fontSize: tokens.fontSizeBodySm,
                fontWeight: row.bold ? 700 : 400,
                color: tokens.colorTextStrong,
                padding: tokens.spaceInternalMedium,
                borderBottom: `1px solid ${tokens.colorBorderWeak}`,
              }}
            >
              {row.label}
            </td>
            <td
              className="text-right"
              style={{
                fontFamily: tokens.fontFamily,
                fontSize: tokens.fontSizeBodySm,
                fontWeight: row.bold ? 700 : 400,
                color: row.highlight ? tokens.colorStatusNegativeTextStrong : tokens.colorTextStrong,
                backgroundColor: row.highlight ? tokens.colorStatusNegativeBgStrong : undefined,
                padding: tokens.spaceInternalMedium,
                borderBottom: `1px solid ${tokens.colorBorderWeak}`,
              }}
            >
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function IndicatorsTab() {
  const { isCFC } = useStore()
  const trucksTotal = trucks.awaitingPick + trucks.picking + trucks.packed + trucks.dispatched

  const teamMembersData = [
    { key: 'unassigned', label: teamMembers.unassignedLabel, value: teamMembers.unassignedCount },
    ...teamMembers.zones.map((z) => ({ key: z.key, label: ZONE_LABEL[z.key], value: z.count })),
  ]

  const totesData = totes.map((t) => ({
    key: t.key,
    label: ZONE_LABEL[t.key],
    segments: [
      { key: 'packed', value: t.packed, color: tokens.colorBgHighlightStrong, labelColor: tokens.colorTextOnContrastStrong },
      { key: 'picking', value: t.picking, color: tokens.colorBgHighlightWeak, labelColor: tokens.colorTextMedium },
      { key: 'awaiting', value: t.awaiting, color: tokens.colorStatusNeutralBgWeak, labelColor: tokens.colorBorderMedium },
    ],
  }))

  return (
    <div className="p-6 flex flex-col" style={{ gap: tokens.spaceContentSmall }}>
      <div className="grid grid-cols-3" style={{ gap: tokens.spaceContentSmall }}>
        <Card>
          <CardHeader className="justify-between">
            <CardTitle>Items Per Labour Hour</CardTitle>
            {isCFC && <TargetBadge value={itemsPerLabourHour.target} />}
          </CardHeader>
          <CardContent className="items-center">
            <Gauge
              value={itemsPerLabourHour.overall}
              max={itemsPerLabourHour.max}
              target={isCFC ? itemsPerLabourHour.target : undefined}
              belowTargetColor={tokens.colorStatusNegativeBgStrong}
              targetTickColor={tokens.colorStatusInfoBgStrong}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="justify-between">
            <CardTitle>RF Pick Rate</CardTitle>
            {isCFC && <TargetBadge value={rfPickRate.target} />}
          </CardHeader>
          <CardContent className="items-center">
            <Gauge
              value={rfPickRate.overall}
              max={rfPickRate.max}
              target={isCFC ? rfPickRate.target : undefined}
              belowTargetColor={tokens.colorStatusNegativeBgStrong}
              targetTickColor={tokens.colorStatusInfoBgStrong}
            />
            <div className="grid grid-cols-2 justify-items-center" style={{ gap: tokens.spaceContentSmall, width: '100%' }}>
              {rfPickRate.zones.map((z) => (
                <Gauge
                  key={z.key}
                  value={z.value}
                  max={rfPickRate.max}
                  target={isCFC ? rfPickRate.target : undefined}
                  size={100}
                  label={ZONE_LABEL[z.key]}
                  belowTargetColor={tokens.colorStatusNegativeBgStrong}
                  targetTickColor={tokens.colorStatusInfoBgStrong}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimated Picking End Time</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, gap: 0 }}>
            <InfoTable
              rows={[
                { label: 'Target', value: estimatedPickingEndTime.target },
                { label: 'Estimated', value: estimatedPickingEndTime.estimated, highlight: estimatedPickingEndTime.estimatedBehindTarget },
                { label: 'Actual', value: estimatedPickingEndTime.actual ?? '—' },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3" style={{ gap: tokens.spaceContentSmall }}>
        <Card>
          <CardHeader>
            <CardTitle>Count of Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={teamMembersData} yAxisLabel="Personal Shoppers" xAxisLabel="Picking Zone" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Count of Totes</CardTitle>
          </CardHeader>
          <CardContent>
            <StackedBarChart
              data={totesData}
              legend={[
                { key: 'packed', label: 'Packed', color: tokens.colorBgHighlightStrong },
                { key: 'picking', label: 'Picking', color: tokens.colorBgHighlightWeak },
                { key: 'awaiting', label: 'Awaiting Pick', color: tokens.colorStatusNeutralBgWeak },
              ]}
              xAxisLabel="Picking Zone"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Count of Trucks</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0, gap: 0 }}>
            <InfoTable
              rows={[
                { label: 'Trucks Awaiting Pick', value: trucks.awaitingPick },
                { label: 'Trucks Picking', value: trucks.picking },
                { label: 'Trucks Packed', value: trucks.packed },
                { label: 'Trucks Dispatched', value: trucks.dispatched },
                { label: 'Total Trucks', value: trucksTotal, bold: true },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
