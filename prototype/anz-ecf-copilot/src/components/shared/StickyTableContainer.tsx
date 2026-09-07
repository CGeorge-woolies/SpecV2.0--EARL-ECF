import { useEffect, useRef, useState } from 'react'
import tokens from '@/theme/tokens'

/** Tailwind className string for sticky header <th> cells (position only — see stickyThStyle for the top offset). */
export const stickyThClass =
  'sticky z-[4] bg-background text-left px-2 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border transition-shadow duration-150'

/**
 * Drop-shadow applied to sticky <th> cells only while the header is actually
 * pinned (stuck) mid-scroll — see useStickyHeaderShadow. Kept separate from
 * stickyThClass so the shadow doesn't show while the header sits in its
 * normal, unstuck position at the top of the table.
 *
 * Rendered as an `::after` gradient overlay rather than `box-shadow`:
 * browsers don't paint box-shadow on table cells once the table has
 * `border-collapse` (as this one does), so a real box-shadow here is silently
 * dropped. The pseudo-element is absolutely positioned, which takes it out of
 * table layout entirely and makes it exempt from that restriction.
 */
export const stickyThStuckShadowClass =
  "after:content-[''] after:pointer-events-none after:absolute after:left-0 after:right-0 after:top-full after:h-2.5 after:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35),rgba(0,0,0,0))]"

/**
 * Inline style for sticky <th> cells — offsets them below the fixed green
 * app header so the table header pins directly under it as the page scrolls.
 */
export const stickyThStyle: React.CSSProperties = { top: tokens.headerHeight }

/**
 * Inline style for the <thead> element.
 * Intentionally empty — do NOT add `filter` here, as filter creates a new
 * stacking context that scopes the z-index on child <th> cells, causing them
 * to be painted behind tbody stacking contexts (e.g. Switch transforms).
 * The drop-shadow is instead applied via box-shadow on each <th> cell.
 */
export const theadStyle: React.CSSProperties = {}

/**
 * Tracks whether a sticky <thead> is currently pinned under the fixed app
 * header, so callers can show the drop-shadow only while stuck. Works by
 * watching a zero-height sentinel placed immediately above the <table>: once
 * the sentinel scrolls above the sticky offset, the header must be stuck.
 */
export function useStickyHeaderShadow(topOffsetPx: number = parseInt(tokens.headerHeight, 10)) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      // rootMargin only accepts literal px/percent values, not calc() — topOffsetPx must
      // already be a plain number.
      { rootMargin: `-${topOffsetPx}px 0px 0px 0px`, threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [topOffsetPx])

  return { sentinelRef, isStuck }
}
