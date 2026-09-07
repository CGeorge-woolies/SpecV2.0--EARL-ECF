import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import tokens from '@/theme/tokens'

export function AddWeightDialog({ open, onCancel, onSave }: { open: boolean; onCancel: () => void; onSave: (grams: number) => void }) {
  const [value, setValue] = useState(0)
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel()
        else setValue(0)
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[420px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
          <Dialog.Title className="text-lg font-bold text-foreground mb-6">Please enter the item&apos;s weight</Dialog.Title>
          <label className="block text-sm text-muted-foreground mb-2" htmlFor="item-weight-input">
            Item weight (g)
          </label>
          <input
            id="item-weight-input"
            type="number"
            min={0}
            autoFocus
            value={value}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
            className="w-full h-9 rounded-md border-2 px-3 text-sm outline-none"
            style={{ borderColor: tokens.colorPrimary }}
          />
          <div className="flex gap-2 justify-end mt-7">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onSave(value)}>
              <Save className="size-4" />
              Save
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
