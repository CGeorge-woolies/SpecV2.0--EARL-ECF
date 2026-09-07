import { ChevronsLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import tokens from '@/theme/tokens'

function SummaryField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <span style={{ fontSize: tokens.fontSizeBodySm, color: tokens.colorTextMedium }}>{label}</span>
      <span style={{ fontSize: tokens.fontSizeBodySm, fontWeight: 600, color: tokens.colorTextStrong }}>{value}</span>
    </>
  )
}

export function OrderSummaryCard({
  orderNo,
  customerName,
  statusLabel,
  backHref,
}: {
  orderNo: string
  customerName: string
  statusLabel: string
  /** When set (e.g. on the order-line detail page), the Order No. links back to the order — with a leading « icon. */
  backHref?: string
}) {
  return (
    <Card>
      <CardContent
        className="grid items-center"
        style={{
          gridTemplateColumns: 'auto auto 1fr auto auto 1fr auto auto',
          gap: tokens.spaceContentSmall,
          padding: tokens.spaceContentSmall,
        }}
      >
        <SummaryField
          label="Order No."
          value={
            backHref ? (
              <Link
                to={backHref}
                className="inline-flex items-center gap-1 no-underline hover:opacity-80 transition-opacity"
                style={{ color: tokens.colorActionLinkDefault }}
              >
                <ChevronsLeft className="size-4" />
                {orderNo}
              </Link>
            ) : (
              orderNo
            )
          }
        />
        <span />
        <SummaryField label="Customer Name" value={customerName} />
        <span />
        <SummaryField label="Status" value={statusLabel} />
      </CardContent>
    </Card>
  )
}
