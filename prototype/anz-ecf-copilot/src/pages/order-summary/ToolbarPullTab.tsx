import { KeyboardArrowDownFilled } from '@/components/icons/material-icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const TAB_HEIGHT = 22

/**
 * Sits right at the seam where the sticky table header currently pins —
 * under the app header when the toolbar is unpinned, under the pinned
 * toolbar once it's pinned — using the same zero-height sticky-sentinel
 * trick as the table's own stuck-shadow sentinel.
 *
 * Hangs downward (overlapping the top of the stuck table header) while
 * unpinned, and upward (overlapping the bottom of the pinned toolbar) once
 * pinned, so it always reads as a handle attached to whichever panel is
 * currently visible at the seam. It can never hang upward while unpinned:
 * the app header is `position: fixed` with `z-50`, so anything poking up
 * into its 0–headerHeight band renders behind it regardless of z-index — a
 * fixed element's own stacking context always wins there.
 */
export function ToolbarPullTab({
  stickyTopOffsetPx,
  visible,
  pinned,
  onToggle,
}: {
  stickyTopOffsetPx: number
  visible: boolean
  pinned: boolean
  onToggle: () => void
}) {
  return (
    <div
      style={{ position: 'sticky', top: `${stickyTopOffsetPx}px`, height: 0, zIndex: 6 }}
      className="pointer-events-none"
    >
      {visible && (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={onToggle}
                style={{ height: TAB_HEIGHT, [pinned ? 'bottom' : 'top']: 0 }}
                className={`pointer-events-auto absolute left-1/2 flex w-8 -translate-x-1/2 items-center justify-center border border-border bg-background text-muted-foreground shadow-sm hover:bg-muted ${
                  pinned ? 'rounded-t-md border-b-0' : 'rounded-b-md border-t-0'
                }`}
              />
            }
          >
            <KeyboardArrowDownFilled size={14} className={pinned ? 'rotate-180' : ''} />
          </TooltipTrigger>
          <TooltipContent>{pinned ? 'Unpin toolbar' : 'Pin toolbar'}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
