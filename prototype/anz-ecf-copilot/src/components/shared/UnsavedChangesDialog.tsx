import { type ReactNode } from 'react'
import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  /** Override the dialog title. Defaults to "Leave without saving?". */
  title?: ReactNode
  /** Override the body copy. Defaults to generic page-navigation warning. */
  description?: ReactNode
  /** Override the confirm button label. Defaults to "Discard and leave". */
  confirmLabel?: string
  /** Override the cancel button label. Defaults to "Go back". */
  cancelLabel?: string
}

const DEFAULT_TITLE = 'Leave without saving?'
const DEFAULT_DESCRIPTION = (
  <>
    <p>You have unsaved changes on this page.</p>
    <p className="mt-3">Leaving now will discard them — this can't be undone.</p>
  </>
)
const DEFAULT_CONFIRM_LABEL = 'Discard and leave'
const DEFAULT_CANCEL_LABEL = 'Go back'

export default function UnsavedChangesDialog({
  open,
  onConfirm,
  onCancel,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  confirmLabel = DEFAULT_CONFIRM_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,
}: Props) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[440px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
          <AlertDialog.Title className="text-lg font-bold text-foreground mb-2.5">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground leading-relaxed mb-7">
            {description}
          </AlertDialog.Description>
          <div className="flex gap-2 justify-end">
            <AlertDialog.Close className="group/button inline-flex shrink-0 items-center justify-center h-8 px-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50">
              {cancelLabel}
            </AlertDialog.Close>
            <Button variant="destructive" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
