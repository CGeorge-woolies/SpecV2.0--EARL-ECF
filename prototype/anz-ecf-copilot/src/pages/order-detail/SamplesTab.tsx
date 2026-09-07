import { Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import tokens from '@/theme/tokens'
import { getOrderSamples } from './samplesData'
import { OrderSummaryCard } from './OrderSummaryCard'

const colDividerClass = 'border-r border-border'
const headerCellClass = 'px-2 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-left border-b border-border select-none'
const bodyCellClass = 'px-2 py-3 text-sm text-foreground border-b border-border'

export function SamplesTab({
  orderNo,
  customerName,
  statusLabel,
}: {
  orderNo: string
  customerName: string
  statusLabel: string
}) {
  const samples = getOrderSamples(orderNo)

  return (
    <div className="flex flex-col p-6" style={{ gap: tokens.spaceContentSmall }}>
      <OrderSummaryCard orderNo={orderNo} customerName={customerName} statusLabel={statusLabel} />

      <Card className="overflow-hidden">
        <CardContent style={{ padding: 0 }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={`${headerCellClass} ${colDividerClass}`}>Number</th>
                <th className={`${headerCellClass} ${colDividerClass}`}>Description</th>
                <th className={headerCellClass}>Supplied</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((sample, index) => (
                <tr key={sample.number} style={{ backgroundColor: index % 2 === 0 ? tokens.colorBgSecondary : tokens.colorBgPrimary }}>
                  <td className={`${bodyCellClass} ${colDividerClass}`}>{sample.number}</td>
                  <td className={`${bodyCellClass} ${colDividerClass}`}>{sample.description}</td>
                  <td className={bodyCellClass}>
                    {sample.supplied && <Check className="size-4" style={{ color: tokens.colorTextStrong }} />}
                  </td>
                </tr>
              ))}
              {samples.length === 0 && (
                <tr>
                  <td className={bodyCellClass} colSpan={3}>
                    <div className="py-8 text-center text-sm text-muted-foreground">No samples found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
