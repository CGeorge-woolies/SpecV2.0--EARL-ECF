import type { ReactNode } from 'react'
import tokens from '@/theme/tokens'

interface DetailRowProps {
  label: string
  value?: ReactNode
  children?: ReactNode
  /** Override the default 150px label column width. */
  labelWidth?: string
  /** Highlights the row with the shared pale-yellow "unsaved change" background (matches InstructionsTab's textarea dirty state). */
  dirty?: boolean
}

/** Label/value row used throughout the order-detail tabs — label column fixed-width, value column flexible. */
export function DetailRow({ label, value, children, labelWidth = '150px', dirty = false }: DetailRowProps) {
  return (
    <div
      className="flex items-start gap-4 -mx-2 px-2 py-1"
      style={{
        backgroundColor: dirty ? tokens.colorStatusTentativeBgWeak : undefined,
        borderRadius: tokens.radiusXs,
      }}
    >
      <span
        className="shrink-0"
        style={{ width: labelWidth, fontSize: tokens.fontSizeBodySm, color: tokens.colorTextMedium }}
      >
        {label}
      </span>
      <span style={{ fontSize: tokens.fontSizeBodySm, color: tokens.colorTextStrong }}>
        {children ?? value}
      </span>
    </div>
  )
}
