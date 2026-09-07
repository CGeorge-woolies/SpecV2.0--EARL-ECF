import { type ReactNode } from 'react'
import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onDismiss: () => void
  title: ReactNode
  description: ReactNode
  /** Defaults to "Dismiss". */
  dismissLabel?: string
}

/** Single-button informational alert — for messages that just need acknowledging (no
 *  confirm/cancel choice), unlike UnsavedChangesDialog's two-button pattern. */
export default function AlertMessageDialog({ open, onDismiss, title, description, dismissLabel = 'Dismiss' }: Props) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => { if (!o) onDismiss() }}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[440px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
          <AlertDialog.Title className="text-lg font-bold text-foreground mb-2.5">{title}</AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground leading-relaxed mb-7">
            {description}
          </AlertDialog.Description>
          <div className="flex justify-end">
            <Button onClick={onDismiss}>{dismissLabel}</Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
