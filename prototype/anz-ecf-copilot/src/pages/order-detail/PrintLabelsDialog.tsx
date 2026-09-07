import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectIcon, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PRINTER_OPTIONS, type PrinterOption } from './labelsData'

interface Props {
  open: boolean
  onClose: () => void
  toteNumbers: number[]
  onPrint: (printer: PrinterOption) => void
}

export function PrintLabelsDialog({ open, onClose, toteNumbers, onPrint }: Props) {
  const [printer, setPrinter] = useState<PrinterOption>(PRINTER_OPTIONS[0])

  const handlePrint = () => {
    onPrint(printer)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[480px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
          <Dialog.Title className="text-lg font-bold text-foreground mb-6">Print Labels</Dialog.Title>

          <ul className="list-disc pl-5 text-sm text-foreground mb-6">
            {toteNumbers.map((toteNo) => (
              <li key={toteNo}>Tote #{toteNo}</li>
            ))}
          </ul>

          <span className="block text-sm font-medium text-foreground mb-1.5">Print Labels To</span>
          <Select value={printer} onValueChange={(value) => setPrinter(value as PrinterOption)}>
            <SelectTrigger className="h-9 w-full justify-between gap-1.5 rounded-lg border border-input bg-muted px-3 text-sm">
              <SelectValue />
              <SelectIcon>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </SelectIcon>
            </SelectTrigger>
            <SelectContent positionerClassName="z-3002">
              {PRINTER_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 justify-end mt-7">
            <Dialog.Close render={<Button variant="outline">Cancel</Button>} />
            <Button onClick={handlePrint}>Print</Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
