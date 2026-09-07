import { Dialog } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'
import { useStore } from '@/context/StoreContext'
import { getRoutingDisplay, isCustomerCollectionType, type OrderRow } from '@/pages/order-summary/orderGroups'
import type { OrderDetailInfo } from './orderDetailData'
import type { OrderInstructions } from './instructionsData'
import type { ArticleRow } from './articlesData'

interface Props {
  open: boolean
  onClose: () => void
  order: OrderRow
  info: OrderDetailInfo
  instructions: OrderInstructions
  articles: ArticleRow[]
}

// Duplicated from ManualPickingDialog's PickingListDocument — this dialog skips straight to the
// Picking List (no Personal Shopper / printer selection step), so it's kept as its own component
// rather than sharing state/props with the manual-pick flow.
function PickingListDocument({ order, info, instructions, articles }: Pick<Props, 'order' | 'info' | 'instructions' | 'articles'>) {
  const { isNZ } = useStore()
  const routing = getRoutingDisplay(order, isNZ)
  const routingLabel = routing.kind === 'locationId' ? `Location ${routing.value}` : routing.kind === 'code' ? routing.value : '—'
  const pickupDateTime = `${info.pickDate} ${info.pickupTime}`
  const customerPickup = isCustomerCollectionType(order.deliveryIcon) ? 'Yes' : 'No'

  return (
    <div className="mx-auto w-[210mm] max-w-full bg-white px-10 py-8 text-black">
      <h1 className="text-center text-3xl font-bold">Picking List</h1>
      <h2 className="mt-1 text-center text-lg font-bold">
        Order No: {order.orderNo} - Routing: {routingLabel}
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-x-8 text-sm">
        <div className="space-y-0.5">
          <div>
            <span className="font-bold">Pickup Date/Time: </span>
            {pickupDateTime}
          </div>
          <div>
            <span className="font-bold">Name: </span>
            {order.customer}
          </div>
          <div>
            <span className="font-bold">Address1: </span>
            {info.deliveryAddressLines[0]}
          </div>
          <div className="pl-[5.5rem]">{info.deliveryAddressLines[1]}</div>
          <div className="pl-[5.5rem]">{info.deliveryAddressLines[2]}</div>
        </div>
        <div className="space-y-0.5">
          <div>
            <span className="font-bold">Business: </span>
          </div>
          <div>
            <span className="font-bold">Payment Ref: </span>
          </div>
          <div className="h-4" />
          <div>
            <span className="font-bold">Delivery Phone: </span>
            {info.phoneNumber}
          </div>
          <div>
            <span className="font-bold">Additional Phone: </span>
            {info.workNumber}
          </div>
          <div>
            <span className="font-bold">Mobile Phone: </span>
            {info.mobileNumber}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm">
        <div>
          <span className="font-bold">Customer Pickup: </span>
          {customerPickup}
        </div>
        <div>
          <span className="font-bold">Personal Shopper Instructions: </span>
          {instructions.personalShopperInstructions}
        </div>
      </div>

      <div className="mt-6 text-sm">
        <div className="font-bold">Delivery Instructions:</div>
        <div>{instructions.deliveryInstructions}</div>
      </div>
      <div className="mt-4 text-sm">
        <div className="font-bold">Customer Care Instructions:</div>
        <div>{instructions.customerCareInstructions}</div>
      </div>

      <h2 className="mt-10 text-center text-lg font-bold">
        Order No: {order.orderNo} - Routing: {routingLabel}
      </h2>
      <div className="mt-1 text-center text-sm">
        <span className="font-bold">Pickup Date/Time: </span>
        {pickupDateTime}
      </div>
      <div className="text-center text-sm">{order.customer}</div>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black">
            <th className="py-1.5 text-left font-bold">Article No.</th>
            <th className="py-1.5 text-left font-bold">Description</th>
            <th className="py-1.5 text-right font-bold">Substitute</th>
            <th className="py-1.5 text-left font-bold pl-4">Location</th>
            <th className="py-1.5 text-right font-bold">Ordered</th>
            <th className="py-1.5 text-right font-bold">Supplied</th>
            <th className="py-1.5 text-right font-bold">To Pick</th>
            <th className="py-1.5 text-left font-bold pl-4">Status</th>
            <th className="py-1.5 text-right font-bold">Web Price</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.no} className="border-b border-border">
              <td className="py-1.5">{article.articleNo}</td>
              <td className="py-1.5">{article.description}</td>
              <td className="py-1.5 text-right">{article.subs === 'yes' ? 'Yes' : 'No'}</td>
              <td className="py-1.5 pl-4">{article.location}</td>
              <td className="py-1.5 text-right">{article.ordered.toFixed(2)}</td>
              <td className="py-1.5 text-right">{article.supplied.toFixed(2)}</td>
              <td className="py-1.5 text-right font-bold">{(article.ordered - article.supplied).toFixed(2)}</td>
              <td className="py-1.5 pl-4" />
              <td className="py-1.5 text-right">{article.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PrintOrderListDialog({ open, onClose, order, info, instructions, articles }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/60 z-[3010] print:hidden" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3011] w-[90vw] h-[90vh] max-w-[900px] bg-background rounded-xl shadow-2xl outline-none flex flex-col overflow-hidden print:static print:inset-auto print:h-auto print:w-auto print:max-w-none print:translate-x-0 print:translate-y-0 print:rounded-none print:shadow-none">
          <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0 print:hidden">
            <Dialog.Title className="text-lg font-bold text-foreground">Picking List</Dialog.Title>
            <div className="flex gap-2">
              <Button onClick={() => window.print()}>Print</Button>
              <Dialog.Close render={<Button variant="outline">Close</Button>} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-muted/40 py-8 print:overflow-visible print:bg-white print:py-0">
            <PickingListDocument order={order} info={info} instructions={instructions} articles={articles} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
