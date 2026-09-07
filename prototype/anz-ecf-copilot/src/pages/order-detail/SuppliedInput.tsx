import { AlertTriangle, AlertCircle, ChevronUp, ChevronDown, Save } from 'lucide-react'
import tokens from '@/theme/tokens'
import { accent } from './lineAccents'

/** Per-cell editing UI state for one Supplied field. Absence of an entry means idle/committed. */
export interface CellEditState {
  draft: number
  /** Blurred without saving — collapses to the warning-chip look until re-focused or saved. */
  dirty: boolean
}

// Inline-editable Supplied cell: idle (plain box) -> focused (stepper + Save once the value
// differs) -> blurred without saving (warning icon, still editable to resume). Hover/focus
// reveal the stepper via CSS alone; only the value + dirty flag are tracked in state.
// Entering more than was ordered flips everything to a red error state (banner + icon +
// border) that's driven purely by draft > maxAllowed, so it survives blur automatically and
// only clears once the user edits the value back down to a valid amount.
export function SuppliedInput({
  committed,
  draft,
  dirty,
  maxAllowed,
  onChange,
  onFocus,
  onBlur,
}: {
  committed: number
  draft: number
  dirty: boolean
  maxAllowed?: number
  onChange: (value: number) => void
  onFocus: () => void
  onBlur: () => void
}) {
  const exceedsOrdered = maxAllowed !== undefined && draft > maxAllowed
  const needsAttention = exceedsOrdered || dirty || draft !== committed
  const attentionColor = exceedsOrdered ? tokens.colorError : accent.slt.border
  return (
    <div className="group relative inline-flex items-center justify-end gap-1">
      {exceedsOrdered && (
        <div
          className="absolute bottom-full left-0 mb-1.5 z-20 flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium shadow-md"
          style={{ backgroundColor: tokens.colorStatusNegativeBgStrong, color: tokens.colorStatusNegativeTextStrong }}
        >
          <AlertCircle className="size-3.5 shrink-0" />
          Cannot supply more than was ordered
        </div>
      )}
      <div className="relative">
        {/* The warning/error icon only shows once the field is blurred-and-unsaved (dirty) —
            while actively focused/editing, the stepper stays visible, same as the plain
            unsaved-changes case, even if the current draft exceeds what was ordered. */}
        {dirty ? (
          exceedsOrdered ? (
            <AlertCircle className="absolute left-1.5 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none" style={{ color: tokens.colorError }} />
          ) : (
            <AlertTriangle className="absolute left-1.5 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none" style={{ color: accent.slt.text }} />
          )
        ) : (
          <div className="absolute left-0.5 top-1/2 -translate-y-1/2 flex flex-col opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(draft + 1)
              }}
            >
              <ChevronUp className="size-3" style={{ color: attentionColor }} />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(Math.max(0, draft - 1))
              }}
            >
              <ChevronDown className="size-3" style={{ color: attentionColor }} />
            </button>
          </div>
        )}
        <input
          type="number"
          min={0}
          value={draft}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-16 h-8 rounded-md border bg-background pl-5 pr-1 text-right text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          style={{ borderColor: needsAttention ? attentionColor : tokens.colorBorderDefault }}
        />
      </div>
    </div>
  )
}

// Always mounted at a fixed size (just invisible when not needed) — visibility:hidden keeps its
// layout space reserved, which is what actually stops a Save column (and so a table) from
// reflowing when a row's Save button appears/disappears.
export function SaveButton({ visible, disabled, onClick }: { visible: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      tabIndex={visible ? 0 : -1}
      disabled={disabled || !visible}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex items-center justify-center size-8 rounded-md text-white disabled:opacity-50 ${visible ? '' : 'invisible'}`}
      style={{ backgroundColor: tokens.colorPrimary }}
    >
      <Save className="size-4" />
    </button>
  )
}

export function DisabledSuppliedInput({ value }: { value: number }) {
  return (
    <input
      type="text"
      value={value}
      disabled
      readOnly
      className="w-16 h-8 rounded-md border border-input bg-muted px-2 text-right text-sm text-muted-foreground"
    />
  )
}
