import { Dialog } from '@base-ui/react/dialog'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  totalCount: number
  eligibleCount: number
  onClose: () => void
  onConfirm: () => void
}

export function DispatchOrderDialog({ open, totalCount, eligibleCount, onClose, onConfirm }: Props) {
  const notPackedCount = totalCount - eligibleCount
  const allEligible = notPackedCount === 0

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[480px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
          <Dialog.Title className="text-lg font-bold text-foreground mb-6">
            Dispatch
          </Dialog.Title>

          {allEligible ? (
            <p className="text-sm text-foreground mb-6">
              {totalCount} selected {totalCount === 1 ? 'order' : 'orders'} will be dispatched.
            </p>
          ) : (
            <>
              <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 mb-4">
                <TriangleAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900">
                  {notPackedCount} of {totalCount} selected {totalCount === 1 ? 'order isn’t' : 'orders aren’t'} in Packed status, so won&rsquo;t be dispatched.
                </p>
              </div>
              <p className="text-sm text-foreground mb-6">
                {eligibleCount} {eligibleCount === 1 ? 'order' : 'orders'} will be dispatched.
              </p>
            </>
          )}

          <div className="flex gap-2 justify-end">
            <Dialog.Close render={<Button variant="outline">Cancel</Button>} />
            <Button onClick={onConfirm}>
              Dispatch {eligibleCount} {eligibleCount === 1 ? 'Order' : 'Orders'}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
