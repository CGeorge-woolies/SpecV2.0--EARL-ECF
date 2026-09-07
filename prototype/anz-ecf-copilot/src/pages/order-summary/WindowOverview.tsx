import { Fragment, useState } from 'react'
import { ChevronRightFilled, KeyboardArrowDownFilled } from '@/components/icons/material-icons'
import tokens from '@/theme/tokens'
import { windowOverviewDays, windowOverviewTotalValue } from './windowOverviewData'
import { selectedDayHighlight } from './dayHighlight'

interface WindowOverviewProps {
  selectedDate: Date
}

const COLUMNS = [
  { label: '', align: 'left', width: '6%' },
  { label: 'Window', align: 'left', width: '25%' },
  { label: 'Orders', align: 'right', width: '8%' },
  { label: 'Articles', align: 'right', width: '9%' },
  { label: 'Value', align: 'right', width: '11%' },
  { label: '% Orders Dispatched', align: 'right', width: '13%' },
  { label: '% Totes packed', align: 'right', width: '14%' },
  { label: '% Supplied', align: 'right', width: '14%' },
] as const

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function weekdayLabel(date: Date) {
  return date.toLocaleDateString('en-AU', { weekday: 'long' })
}

function currency(value: number) {
  return `$${value.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function pct(value: number | null) {
  return value === null ? '—' : `${value.toFixed(2)}%`
}

const cellClass = 'px-2 py-1.5 text-sm border-b'
const nowrapCellClass = 'px-2 py-1.5 text-sm border-b whitespace-nowrap'
const headerCellClass = 'px-2 py-1.5 text-xs font-medium uppercase tracking-wide border-b whitespace-normal align-bottom'

export function WindowOverview({ selectedDate }: WindowOverviewProps) {
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set())

  const toggleDay = (offset: number) =>
    setCollapsedDays((prev) => {
      const next = new Set(prev)
      next.has(offset) ? next.delete(offset) : next.add(offset)
      return next
    })

  return (
    <div className="flex-1 overflow-auto px-4 pb-4" style={{ fontFamily: tokens.fontFamily }}>
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {COLUMNS.map(({ label, align, width }) => (
              <th
                key={label}
                className={`${headerCellClass} ${align === 'right' ? 'text-right' : 'text-left'}`}
                style={{ borderColor: tokens.colorBorderWeak, color: tokens.colorTextMedium, width }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              className={`${cellClass} text-left`}
              style={{ borderColor: tokens.colorBorderWeak, fontWeight: 700, color: tokens.colorTextStrong }}
              colSpan={4}
            >
              Total
            </td>
            <td
              className={`${cellClass} text-right`}
              style={{ borderColor: tokens.colorBorderWeak, fontWeight: 700, color: tokens.colorTextStrong }}
            >
              {currency(windowOverviewTotalValue)}
            </td>
            <td className={cellClass} style={{ borderColor: tokens.colorBorderWeak }} colSpan={3} />
          </tr>

          {windowOverviewDays.map((day) => {
            const date = addDays(selectedDate, day.offset)
            const collapsed = collapsedDays.has(day.offset)
            const isCurrent = day.offset === 0
            const highlight = selectedDayHighlight(selectedDate)
            const headerBg = isCurrent ? highlight.bg : tokens.colorActionTertiaryBgFocus
            const headerText = isCurrent ? highlight.text : tokens.colorTextStrong

            return (
              <Fragment key={day.offset}>
                <tr className="cursor-pointer select-none" style={{ backgroundColor: headerBg }} onClick={() => toggleDay(day.offset)}>
                  <td className={`${cellClass} text-left whitespace-normal`} style={{ borderColor: 'transparent', fontWeight: 700, color: headerText }} colSpan={2}>
                    <div className="flex items-center gap-1.5">
                      {collapsed ? <ChevronRightFilled size={14} className="shrink-0" /> : <KeyboardArrowDownFilled size={14} className="shrink-0" />}
                      <span>
                        {weekdayLabel(date)} {formatDate(date)}
                      </span>
                    </div>
                  </td>
                  <td className={`${cellClass} text-right`} style={{ borderColor: 'transparent', fontWeight: 700, color: headerText }}>
                    {day.orders}
                  </td>
                  <td className={`${cellClass} text-right`} style={{ borderColor: 'transparent', fontWeight: 700, color: headerText }}>
                    {day.articles}
                  </td>
                  <td className={`${cellClass} text-right`} style={{ borderColor: 'transparent', fontWeight: 700, color: headerText }}>
                    {currency(day.value)}
                  </td>
                  <td className={cellClass} style={{ borderColor: 'transparent' }} colSpan={3} />
                </tr>

                {!collapsed &&
                  day.rows.map((row, index) => (
                    <tr
                      key={row.window}
                      style={{ backgroundColor: index % 2 === 0 ? tokens.colorBgPrimary : tokens.colorBgSecondary }}
                    >
                      {index === 0 && (
                        <td className={cellClass} style={{ borderColor: tokens.colorBorderWeak }} rowSpan={day.rows.length} />
                      )}
                      <td className={`${nowrapCellClass} text-left`} style={{ borderColor: tokens.colorBorderWeak, color: tokens.colorTextStrong }}>
                        {row.window}
                      </td>
                      <td className={`${cellClass} text-right`} style={{ borderColor: tokens.colorBorderWeak }}>{row.orders}</td>
                      <td className={`${cellClass} text-right`} style={{ borderColor: tokens.colorBorderWeak }}>{row.articles}</td>
                      <td className={`${cellClass} text-right`} style={{ borderColor: tokens.colorBorderWeak }}>{currency(row.value)}</td>
                      <td className={`${cellClass} text-right`} style={{ borderColor: tokens.colorBorderWeak }}>{pct(row.pctOrders)}</td>
                      <td className={`${cellClass} text-right`} style={{ borderColor: tokens.colorBorderWeak }}>{pct(row.pctTotesPacked)}</td>
                      <td className={`${cellClass} text-right`} style={{ borderColor: tokens.colorBorderWeak }}>{pct(row.pctSupplied)}</td>
                    </tr>
                  ))}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
