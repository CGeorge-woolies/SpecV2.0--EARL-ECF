import { Button } from '@/components/ui/button'
import tokens from '@/theme/tokens'

export interface SaveDiscardBarProps {
  isDirty: boolean
  message: string
  onDiscard: () => void
  onSave: () => void
}

/** Height of the bar in px — use this to add bottom padding to page content. */
export const SAVE_BAR_HEIGHT = 64

export default function SaveDiscardBar({ isDirty, message, onDiscard, onSave }: SaveDiscardBarProps) {
  if (!isDirty) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: tokens.colorStatusTentativeBgWeak,
        borderTop: `1px solid ${tokens.colorStatusTentativeBgStrong}`,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.07)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1200,
        fontFamily: tokens.fontFamily,
      }}
    >
      <span style={{ fontSize: 13, color: tokens.colorStatusTentativeTextWeak }}>
        {message}
      </span>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="outline" size="sm" onClick={onDiscard}>
          Discard
        </Button>
        <Button variant="default" size="sm" onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  )
}
