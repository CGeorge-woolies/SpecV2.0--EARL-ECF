import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SettingsOutlined } from '@/components/icons/material-icons'
import tokens from '@/theme/tokens'

export type DemoWindowState = 'normal' | 'warning' | 'exceeded'

const OPTIONS: { value: DemoWindowState; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'warning', label: 'Warning (<15 min to cutoff)' },
  { value: 'exceeded', label: 'Exceeded (cutoff passed)' },
]

/**
 * Prototype-only affordance: this app has no live clock, so the first window/session's
 * cutoff-driven header color can't be demoed by waiting for real time to pass. This lets
 * a designer force that state for a demo instead.
 *
 * In production this would not be a manual toggle — the state would be computed from each
 * window/session's picking completion status vs. current time relative to the window/cutoff
 * time, with the "<15 min" warning threshold itself configurable (TBD where — likely a
 * store/session-level setting rather than hardcoded).
 */
export function DemoWindowStateToggle({
  value,
  onChange,
}: {
  value: DemoWindowState
  onChange: (next: DemoWindowState) => void
}) {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Popover>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={
                  <Button
                    variant="default"
                    size="icon"
                    className="rounded-full shadow-lg"
                    style={{ backgroundColor: tokens.colorSuccess }}
                  />
                }
              />
            }
          >
            <SettingsOutlined size={20} />
          </TooltipTrigger>
          <TooltipContent>Preview window status (demo only)</TooltipContent>
        </Tooltip>
        <PopoverContent align="start" side="top" className="w-72">
          <div className="mb-2 text-sm font-bold">Preview window status</div>
          <p className="mb-3 text-xs text-muted-foreground">
            Applies to the first window/session header row only. Prototype demo aid, not a real
            control — in production this state would be computed automatically from picking
            completion vs. current time against the window/cutoff time, with the &lt;15 min warning
            threshold configurable (logic TBD).
          </p>
          <RadioGroup value={value} onValueChange={(next) => onChange(next as DemoWindowState)}>
            {OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <RadioGroupItem value={option.value} />
                {option.label}
              </label>
            ))}
          </RadioGroup>
        </PopoverContent>
      </Popover>
    </div>
  )
}
