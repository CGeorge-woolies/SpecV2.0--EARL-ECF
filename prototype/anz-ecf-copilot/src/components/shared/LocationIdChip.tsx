import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import tokens from '@/theme/tokens'

/**
 * Light grey / bold black badge shown in the Transit Code cell for On Demand and In Store
 * Collection orders. Relies on an ancestor with the Tailwind `group` class (the table row) to
 * invert to a black background / white text on row hover — harmless no-op without one (e.g. the
 * Order Details page, where it's always shown in its resting light-grey state).
 */
export function LocationIdChip({ id }: { id: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className="inline-flex w-fit shrink-0 cursor-default items-center justify-center bg-[#E8E8E8] px-1.5 py-0.5 text-[11px] leading-none font-bold text-black transition-colors group-hover:bg-black group-hover:text-white"
            style={{ borderRadius: tokens.radiusXs }}
          />
        }
      >
        {id}
      </TooltipTrigger>
      <TooltipContent>Location ID</TooltipContent>
    </Tooltip>
  )
}
