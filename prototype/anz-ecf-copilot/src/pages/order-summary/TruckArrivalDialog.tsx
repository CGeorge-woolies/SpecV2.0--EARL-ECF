import { useEffect, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar as DatePickerCalendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarTodayFooter } from '@/components/shared/CalendarTodayFooter'
import { useStore } from '@/context/StoreContext'
import tokens from '@/theme/tokens'
import { FLEET_SESSION_CODES } from './sessionOverviewData'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (date: Date, sessions: string[]) => void
}

function formatArrivalDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-AU', { weekday: 'short' })
  const month = date.toLocaleDateString('en-AU', { month: 'long' })
  return `${weekday} ${date.getDate()} ${month} ${date.getFullYear()}`
}

export function TruckArrivalDialog({ open, onClose, onConfirm }: Props) {
  const { isNZ } = useStore()
  const storePrefix = isNZ ? '9100' : '1997'

  const [date, setDate] = useState(() => new Date())
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [reportOpen, setReportOpen] = useState(false)

  // Reset back to today / no selection each time the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      setDate(new Date())
      setSelectedSessions(new Set())
    }
  }, [open])

  const toggleSession = (code: string, checked: boolean) => {
    setSelectedSessions((prev) => {
      const next = new Set(prev)
      if (checked) next.add(code)
      else next.delete(code)
      return next
    })
  }

  const handleConfirm = () => {
    onConfirm(date, Array.from(selectedSessions))
    setReportOpen(true)
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[480px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
            <Dialog.Title className="text-lg font-bold text-foreground mb-6">
              Truck Arrival
            </Dialog.Title>

            <span
              style={{
                fontFamily: tokens.fontFamily,
                fontSize: tokens.fontSizeCaption,
                color: tokens.colorTextMedium,
              }}
            >
              Date:
            </span>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger
                render={<Button variant="outline" size="sm" className="mt-1.5 mb-5 w-full justify-start gap-1.5 font-normal" />}
              >
                <CalendarIcon className="size-3.5" style={{ color: tokens.colorIconMedium }} />
                {formatArrivalDate(date)}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" positionerClassName="z-[3002]">
                <DatePickerCalendar
                  mode="single"
                  selected={date}
                  onSelect={(selected) => selected && setDate(selected)}
                />
                <CalendarTodayFooter
                  onClick={() => {
                    setDate(new Date())
                    setDatePopoverOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>

            <span
              style={{
                fontFamily: tokens.fontFamily,
                fontSize: tokens.fontSizeCaption,
                color: tokens.colorTextMedium,
              }}
            >
              {isNZ ? 'Window:' : 'Session:'}
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1.5">
              {FLEET_SESSION_CODES.map((code) => {
                const label = `${storePrefix} ${code}`
                return (
                  <label
                    key={code}
                    className="flex items-center gap-2 text-sm text-foreground cursor-pointer py-1"
                  >
                    <Checkbox
                      checked={selectedSessions.has(code)}
                      onCheckedChange={(checked) => toggleSession(code, checked === true)}
                    />
                    {label}
                  </label>
                )
              })}
            </div>

            <div className="flex gap-2 justify-end mt-7">
              <Dialog.Close render={<Button variant="outline">Cancel</Button>} />
              <Button aria-disabled={selectedSessions.size === 0} onClick={() => selectedSessions.size > 0 && handleConfirm()}>
                Confirm
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={reportOpen} onOpenChange={setReportOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[480px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
            <Dialog.Title className="text-lg font-bold text-foreground mb-6">
              Truck Arrival
            </Dialog.Title>
            <p className="text-sm text-muted-foreground mb-6">
              [DEMO] Truck arrival report will render here.
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
