import { Dialog } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onClose: () => void
}

export function PrintInvoiceDialog({ open, onClose }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[480px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
          <Dialog.Title className="text-lg font-bold text-foreground mb-6">
            Print Invoice
          </Dialog.Title>
          <p className="text-sm text-muted-foreground mb-6">
            [DEMO] Invoice for dispatched order will render here for printing.
          </p>
          <div className="flex gap-2 justify-end">
            <Dialog.Close render={<Button variant="outline">Close</Button>} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
