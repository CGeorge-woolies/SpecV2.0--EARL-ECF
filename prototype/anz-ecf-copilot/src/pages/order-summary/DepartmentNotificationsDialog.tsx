import { useEffect, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useStore } from '@/context/StoreContext'
import {
  DEPARTMENTS,
  PRINT_OPTIONS,
  SPECIALTY_OPTIONS,
  SPECIALTY_OPTIONS_NZ,
  type DepartmentNotificationOption,
  type DepartmentNotificationsSelection,
} from './departmentNotificationsData'

interface Props {
  open: boolean
  totalCount: number
  onClose: () => void
  onConfirm: (selection: DepartmentNotificationsSelection) => void
}

function toggleInSet(set: Set<string>, id: string): Set<string> {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

interface CheckboxSectionProps {
  title: string
  options: DepartmentNotificationOption[]
  selected: Set<string>
  onToggle: (id: string) => void
  onToggleAll: (checked: boolean) => void
}

function CheckboxSection({ title, options, selected, onToggle, onToggleAll }: CheckboxSectionProps) {
  const allChecked = options.length > 0 && options.every((option) => selected.has(option.id))
  const someChecked = options.some((option) => selected.has(option.id))

  return (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer mb-3">
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked && !allChecked}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
        />
        {title}
      </label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-1">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <Checkbox
              checked={selected.has(option.id)}
              onCheckedChange={() => onToggle(option.id)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  )
}

export function DepartmentNotificationsDialog({ open, totalCount, onClose, onConfirm }: Props) {
  const { isNZ } = useStore()
  const specialtyOptions = isNZ ? SPECIALTY_OPTIONS_NZ : SPECIALTY_OPTIONS
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set())
  const [selectedSpecialty, setSelectedSpecialty] = useState<Set<string>>(new Set())
  const [selectedPrintOptions, setSelectedPrintOptions] = useState<Set<string>>(new Set())
  const [demoOpen, setDemoOpen] = useState(false)

  // Reset back to no selections each time the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      setSelectedDepartments(new Set())
      setSelectedSpecialty(new Set())
      setSelectedPrintOptions(new Set())
    }
  }, [open])

  const handleConfirm = () => {
    onConfirm({
      departments: [...selectedDepartments],
      specialty: [...selectedSpecialty],
      printOptions: [...selectedPrintOptions],
    })
    setDemoOpen(true)
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[560px] max-w-[calc(100vw-48px)] max-h-[85vh] overflow-y-auto bg-background rounded-xl p-8 shadow-2xl outline-none">
            <Dialog.Title className="text-lg font-bold text-foreground mb-6">
              Department Notifications
            </Dialog.Title>
            <p className="text-sm text-muted-foreground mb-6">
              Selection: {totalCount} order{totalCount === 1 ? '' : 's'}
            </p>

            <CheckboxSection
              title="Departments"
              options={DEPARTMENTS}
              selected={selectedDepartments}
              onToggle={(id) => setSelectedDepartments((prev) => toggleInSet(prev, id))}
              onToggleAll={(checked) =>
                setSelectedDepartments(checked ? new Set(DEPARTMENTS.map((d) => d.id)) : new Set())
              }
            />

            <CheckboxSection
              title="Specialty"
              options={specialtyOptions}
              selected={selectedSpecialty}
              onToggle={(id) => setSelectedSpecialty((prev) => toggleInSet(prev, id))}
              onToggleAll={(checked) =>
                setSelectedSpecialty(checked ? new Set(specialtyOptions.map((s) => s.id)) : new Set())
              }
            />

            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Print Options</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-1">
                {PRINT_OPTIONS.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <Checkbox
                      checked={selectedPrintOptions.has(option.id)}
                      onCheckedChange={() =>
                        setSelectedPrintOptions((prev) => toggleInSet(prev, option.id))
                      }
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-7">
              <Dialog.Close render={<Button variant="outline">Cancel</Button>} />
              <Button onClick={handleConfirm}>
                Confirm
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={demoOpen} onOpenChange={setDemoOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[480px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
            <Dialog.Title className="text-lg font-bold text-foreground mb-6">
              Department Notifications
            </Dialog.Title>
            <p className="text-sm text-muted-foreground mb-6">
              [DEMO] Department notifications will render here for printing.
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
