import tokens from '@/theme/tokens'
import { Badge } from '@/components/ui/badge'

// No matching design tokens exist for these accents — approximated from the reference screenshots.
export const accent = {
  slt: { bg: '#F6E3F0', border: '#9C3587', text: '#9C3587' },
  sub: { bg: '#DFF3E1', border: tokens.colorTextHighlight, text: tokens.colorTextHighlight },
  wght: { bg: tokens.colorBgTertiary, border: tokens.colorBorderDefault, text: tokens.colorTextStrong },
}

export function TypeBadge({ label, bg, border, text }: { label: string; bg: string; border: string; text: string }) {
  return (
    <Badge variant="outline" style={{ backgroundColor: bg, borderColor: border, color: text }}>
      {label}
    </Badge>
  )
}
