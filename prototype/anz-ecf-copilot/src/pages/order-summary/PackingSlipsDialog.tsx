import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  totalCount: number
  requiredCount: number
  onClose: () => void
  onConfirm: () => void
}

export function PackingSlipsDialog({ open, totalCount, requiredCount, onClose, onConfirm }: Props) {
  const [slipsOpen, setSlipsOpen] = useState(false)
  const notRequiredCount = totalCount - requiredCount
  const allRequired = notRequiredCount === 0

  const handleConfirm = () => {
    onConfirm()
    setSlipsOpen(true)
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[480px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
            <Dialog.Title className="text-lg font-bold text-foreground mb-6">
              Print Packing Slips
            </Dialog.Title>

            {allRequired ? (
              <p className="text-sm text-foreground mb-6">
                {totalCount} {totalCount === 1 ? 'order' : 'orders'} with packing slips selected and will be printed.
              </p>
            ) : (
              <>
                <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 mb-4">
                  <TriangleAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900">
                    {notRequiredCount} of {totalCount} selected {totalCount === 1 ? 'order doesn’t' : 'orders don’t'} require a packing slip and won&rsquo;t be printed.
                  </p>
                </div>
                <p className="text-sm text-foreground mb-6">
                  {requiredCount} {requiredCount === 1 ? 'packing slip' : 'packing slips'} will be printed.
                </p>
              </>
            )}

            <div className="flex gap-2 justify-end mt-1">
              <Dialog.Close render={<Button variant="outline">Cancel</Button>} />
              <Button onClick={handleConfirm}>
                Print {requiredCount} {requiredCount === 1 ? 'Packing Slip' : 'Packing Slips'}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={slipsOpen} onOpenChange={setSlipsOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[480px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
            <Dialog.Title className="text-lg font-bold text-foreground mb-6">
              Packing Slips
            </Dialog.Title>
            <p className="text-sm text-muted-foreground mb-6">
              [DEMO] Packing slips will render here for printing.
            </p>
            <div className="flex gap-2 justify-end">
              <Dialog.Close render={<Button variant="outline">Close</Button>} />
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
