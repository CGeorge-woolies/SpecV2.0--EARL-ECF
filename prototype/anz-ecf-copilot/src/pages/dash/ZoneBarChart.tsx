import tokens from '@/theme/tokens'

const CHART_HEIGHT = 180

interface SimpleBarDatum {
  key: string
  label: string
  value: number
}

interface SimpleBarChartProps {
  data: SimpleBarDatum[]
  maxValue?: number
  barColor?: string
  yAxisLabel?: string
  xAxisLabel?: string
}

export function SimpleBarChart({ data, maxValue, barColor = tokens.colorBgHighlightMedium, yAxisLabel, xAxisLabel }: SimpleBarChartProps) {
  const max = maxValue ?? Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="flex flex-col" style={{ gap: tokens.spaceInternalMedium }}>
      <div className="flex items-stretch" style={{ gap: tokens.spaceInternalMedium }}>
        {yAxisLabel && (
          <div
            className="flex items-center justify-center"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: tokens.fontSizeCaption,
              color: tokens.colorTextMedium,
              fontFamily: tokens.fontFamily,
            }}
          >
            {yAxisLabel}
          </div>
        )}
        <div className="flex flex-1 items-end" style={{ height: CHART_HEIGHT, borderLeft: `1px solid ${tokens.colorBorderWeak}`, borderBottom: `1px solid ${tokens.colorBorderWeak}` }}>
          {data.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center justify-end h-full" style={{ gap: tokens.spaceInternalSmall }}>
              <span style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeCaption, fontWeight: 700, color: tokens.colorStatusNegativeTextWeak }}>
                {d.value}
              </span>
              <div
                style={{
                  width: '60%',
                  height: `${(d.value / max) * (CHART_HEIGHT - 24)}px`,
                  backgroundColor: barColor,
                  borderRadius: `${tokens.radiusXxs} ${tokens.radiusXxs} 0 0`,
                  minHeight: d.value > 0 ? 2 : 0,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex" style={{ paddingLeft: yAxisLabel ? 20 : 0 }}>
        {data.map((d) => (
          <div key={d.key} className="flex-1 text-center" style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeCaption, color: tokens.colorTextMedium }}>
            {d.label}
          </div>
        ))}
      </div>
      {xAxisLabel && (
        <div className="text-center" style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeCaption, color: tokens.colorTextMedium }}>
          {xAxisLabel}
        </div>
      )}
    </div>
  )
}

export interface StackedSegment {
  key: string
  value: number
  color: string
  labelColor?: string
}

interface StackedBarDatum {
  key: string
  label: string
  segments: StackedSegment[]
}

interface StackedBarChartProps {
  data: StackedBarDatum[]
  maxValue?: number
  legend?: { key: string; label: string; color: string }[]
  xAxisLabel?: string
}

export function StackedBarChart({ data, maxValue, legend, xAxisLabel }: StackedBarChartProps) {
  const totals = data.map((d) => d.segments.reduce((sum, s) => sum + s.value, 0))
  const max = maxValue ?? Math.max(1, ...totals)

  return (
    <div className="flex flex-col" style={{ gap: tokens.spaceInternalMedium }}>
      {legend && (
        <div className="flex items-center flex-wrap" style={{ gap: tokens.spaceContentSmall }}>
          {legend.map((l) => (
            <div key={l.key} className="flex items-center" style={{ gap: tokens.spaceInternalSmall }}>
              <span style={{ width: 10, height: 10, borderRadius: tokens.radiusXxs, backgroundColor: l.color, display: 'inline-block' }} />
              <span style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeCaption, color: tokens.colorTextMedium }}>{l.label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end" style={{ height: CHART_HEIGHT, borderLeft: `1px solid ${tokens.colorBorderWeak}`, borderBottom: `1px solid ${tokens.colorBorderWeak}` }}>
        {data.map((d) => {
          const total = d.segments.reduce((sum, s) => sum + s.value, 0)
          return (
            <div key={d.key} className="flex flex-1 flex-col items-center justify-end h-full">
              <div className="flex flex-col-reverse" style={{ width: '55%', height: `${(total / max) * (CHART_HEIGHT - 8)}px` }}>
                {d.segments.map((s) =>
                  s.value > 0 ? (
                    <div
                      key={s.key}
                      className="flex items-start justify-center"
                      style={{
                        height: `${(s.value / total) * 100}%`,
                        backgroundColor: s.color,
                        minHeight: 14,
                      }}
                    >
                      <span style={{ fontFamily: tokens.fontFamily, fontSize: 10, fontWeight: 700, color: s.labelColor ?? tokens.colorTextStrong, marginTop: 1 }}>
                        {s.value}
                      </span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex">
        {data.map((d) => (
          <div key={d.key} className="flex-1 text-center" style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeCaption, color: tokens.colorTextMedium }}>
            {d.label}
          </div>
        ))}
      </div>
      {xAxisLabel && (
        <div className="text-center" style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeCaption, color: tokens.colorTextMedium }}>
          {xAxisLabel}
        </div>
      )}
    </div>
  )
}
