import { Dialog } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  lineCount: number
  onClose: () => void
  onConfirm: () => void
}

export function MoveLineDialog({ open, lineCount, onClose, onConfirm }: Props) {
  const lineWord = lineCount === 1 ? 'line' : 'lines'
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[480px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
          <Dialog.Title className="text-lg font-bold text-foreground mb-6">
            Move Line from OSR to Shop Floor
          </Dialog.Title>
          <p className="text-sm text-muted-foreground">
            {lineCount} {lineWord} will be moved from the OSR queue to the Shop Floor picking queue.
            This can&apos;t be undone — once moved, {lineCount === 1 ? 'this line' : 'these lines'} will need to be picked from the shop floor.
          </p>
          <div className="flex gap-2 justify-end mt-7">
            <Dialog.Close className="group/button inline-flex shrink-0 items-center justify-center h-8 px-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50">
              Cancel
            </Dialog.Close>
            <Button size="sm" onClick={onConfirm}>
              Move to Shop Floor
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
