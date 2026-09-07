import { Card, CardContent } from '@/components/ui/card'
import tokens from '@/theme/tokens'
import { useStore } from '@/context/StoreContext'
import { getOrderAuditLog } from './auditData'
import { OrderSummaryCard } from './OrderSummaryCard'

const colDividerClass = 'border-r border-border'
const headerCellClass = 'px-2 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-left border-b border-border select-none'
const bodyCellClass = 'px-2 py-3 text-sm text-foreground border-b border-border'

export function AuditTab({
  orderNo,
  customerName,
  statusLabel,
}: {
  orderNo: string
  customerName: string
  statusLabel: string
}) {
  const { isNZ } = useStore()
  const auditLog = getOrderAuditLog(orderNo, isNZ)

  return (
    <div className="flex flex-col p-6" style={{ gap: tokens.spaceContentSmall }}>
      <OrderSummaryCard orderNo={orderNo} customerName={customerName} statusLabel={statusLabel} />

      <Card className="overflow-hidden">
        <CardContent style={{ padding: 0 }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={`${headerCellClass} ${colDividerClass}`}>Action Date</th>
                <th className={`${headerCellClass} ${colDividerClass}`}>User</th>
                <th className={`${headerCellClass} ${colDividerClass}`}>Action</th>
                <th className={`${headerCellClass} ${colDividerClass}`}>Line No.</th>
                <th className={headerCellClass}>Message</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((entry, index) => (
                <tr key={`${entry.actionDate}-${entry.action}-${entry.lineNo}`} style={{ backgroundColor: index % 2 === 0 ? tokens.colorBgSecondary : tokens.colorBgPrimary }}>
                  <td className={`${bodyCellClass} ${colDividerClass} whitespace-nowrap`}>{entry.actionDate}</td>
                  <td className={`${bodyCellClass} ${colDividerClass}`}>{entry.user}</td>
                  <td className={`${bodyCellClass} ${colDividerClass}`}>{entry.action}</td>
                  <td className={`${bodyCellClass} ${colDividerClass}`}>{entry.lineNo}</td>
                  <td className={bodyCellClass}>{entry.message}</td>
                </tr>
              ))}
              {auditLog.length === 0 && (
                <tr>
                  <td className={bodyCellClass} colSpan={5}>
                    <div className="py-8 text-center text-sm text-muted-foreground">No audit entries found</div>
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
