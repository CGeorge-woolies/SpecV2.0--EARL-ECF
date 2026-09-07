import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SettingsOutlined } from '@/components/icons/material-icons'
import tokens from '@/theme/tokens'

/**
 * Prototype-only affordance: Manual Picking should never actually be used in production and
 * will be hidden behind a real feature flag (BCP fallback only). This lets a designer flip
 * that flag on to demo the quick action instead of it always being visible.
 */
export function DemoBcpManualPickingToggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (next: boolean) => void
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
          <TooltipContent>Preview feature flags (demo only)</TooltipContent>
        </Tooltip>
        <PopoverContent align="start" side="top" className="w-72">
          <div className="mb-2 text-sm font-bold">Preview feature flags</div>
          <p className="mb-3 text-xs text-muted-foreground">
            Prototype demo aid, not a real control — in production Manual Picking is disabled by
            default and only enabled via feature flag as a BCP fallback.
          </p>
          <label className="flex items-center justify-between gap-2 text-sm">
            BCP for Manual Picking
            <Switch checked={value} onCheckedChange={onChange} />
          </label>
        </PopoverContent>
      </Popover>
    </div>
  )
}
