import tokens from '@/theme/tokens'

interface GaugeBand {
  from: number // fraction 0-1
  to: number // fraction 0-1
  color: string
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

function fracToAngle(frac: number) {
  return 180 - 180 * frac
}

function describeArc(cx: number, cy: number, r: number, fromFrac: number, toFrac: number) {
  const start = polarToCartesian(cx, cy, r, fracToAngle(fromFrac))
  const end = polarToCartesian(cx, cy, r, fracToAngle(toFrac))
  // Every band here spans at most the 180° semicircle (fromFrac/toFrac both in [0,1]
  // mapped across exactly half a circle), so the SVG "large arc" flag is never needed —
  // forcing it to 1 for spans >50% of that range was causing the arc to wrap the long
  // way around into a near-full circle.
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`
}

// Pale red below target, light green from target to max by default — the "below/at target"
// read the gauges are for, using the same weak/pale tones as the rest of the dashboard.
// Callers can override the below-target colour (e.g. a bright red) per gauge.
function bandsForTarget(targetFrac: number, belowColor: string, aboveColor: string): GaugeBand[] {
  return [
    { from: 0, to: targetFrac, color: belowColor },
    { from: targetFrac, to: 1, color: aboveColor },
  ]
}

// Values beyond max are allowed to push the needle slightly past the end of the arc
// (rather than pinning it at max) so an out-of-range reading is visible at a glance —
// the exact number is still shown below the gauge.
const MAX_NEEDLE_OVERSHOOT_FRAC = 0.12

interface GaugeProps {
  value: number
  max: number
  target?: number
  label?: string
  size?: number
  valueLabel?: string
  belowTargetColor?: string
  aboveTargetColor?: string
  targetTickColor?: string
}

export function Gauge({
  value,
  max,
  target,
  label = 'Overall',
  size = 220,
  valueLabel,
  belowTargetColor = tokens.colorStatusNegativeBgWeak,
  aboveTargetColor = tokens.colorBgHighlightWeak,
  targetTickColor,
}: GaugeProps) {
  const width = size
  const height = size * 0.62
  const cx = width / 2
  const cy = height - height * 0.12
  const r = width * 0.42
  const trackWidth = size * 0.09

  const needleFrac = Math.max(0, Math.min(1 + MAX_NEEDLE_OVERSHOOT_FRAC, value / max))
  const needleAngle = -90 + 180 * needleFrac
  const targetFrac = target !== undefined ? Math.max(0, Math.min(1, target / max)) : undefined
  const bands = targetFrac !== undefined ? bandsForTarget(targetFrac, belowTargetColor, aboveTargetColor) : [{ from: 0, to: 1, color: aboveTargetColor }]

  const ticks = targetFrac !== undefined ? [0, targetFrac, 1] : [0, 1]
  const tickLabels: Record<number, string> = targetFrac !== undefined ? { 0: '0', [targetFrac]: String(target), 1: String(max) } : { 0: '0', 1: String(max) }

  return (
    <div className="flex flex-col items-center" style={{ width }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} overflow="visible">
        {bands.map((band, i) => (
          <path
            key={i}
            d={describeArc(cx, cy, r, band.from, band.to)}
            fill="none"
            stroke={band.color}
            strokeWidth={trackWidth}
            strokeLinecap="butt"
          />
        ))}

        {ticks.map((t) => {
          const isTargetTick = t === targetFrac && targetTickColor
          const inner = polarToCartesian(cx, cy, r - trackWidth / 2 - 2, fracToAngle(t))
          const outer = polarToCartesian(cx, cy, r + trackWidth / 2 + 2, fracToAngle(t))
          return (
            <line
              key={t}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={isTargetTick ? targetTickColor : tokens.colorBgPrimary}
              strokeWidth={isTargetTick ? 3 : 2}
            />
          )
        })}

        {ticks.map((t) => {
          const pos = polarToCartesian(cx, cy, r + trackWidth + (size * 0.06), fracToAngle(t))
          const anchor = t <= 0.02 ? 'start' : t >= 0.98 ? 'end' : 'middle'
          return (
            <text
              key={t}
              x={pos.x}
              y={pos.y + 4}
              textAnchor={anchor}
              fontSize={size * 0.05}
              fontWeight={t === targetFrac ? 700 : 400}
              fill={t === targetFrac ? tokens.colorTextStrong : tokens.colorTextMedium}
              fontFamily={tokens.fontFamily}
            >
              {tickLabels[t]}
            </text>
          )
        })}

        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - r * 0.82}
          stroke={tokens.colorStatusInfoBgStrong}
          strokeWidth={size * 0.018}
          strokeLinecap="round"
          transform={`rotate(${needleAngle} ${cx} ${cy})`}
        />
        <circle cx={cx} cy={cy} r={size * 0.03} fill={tokens.colorStatusInfoBgStrong} />

        {size >= 150 && (
          <text x={cx} y={cy - r * 0.42} textAnchor="middle" fontSize={size * 0.075} fill={tokens.colorTextMedium} fontFamily={tokens.fontFamily}>
            {label}
          </text>
        )}
      </svg>
      {size < 150 && (
        <span style={{ fontFamily: tokens.fontFamily, fontSize: tokens.fontSizeCaption, fontWeight: 700, color: tokens.colorTextMedium, marginTop: -size * 0.04 }}>
          {label}
        </span>
      )}
      <span style={{ fontFamily: tokens.fontFamily, fontSize: size * 0.16, fontWeight: 700, color: tokens.colorTextStrong, marginTop: size < 150 ? 0 : -size * 0.08 }}>
        {valueLabel ?? value}
      </span>
    </div>
  )
}
