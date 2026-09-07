import tokens from '@/theme/tokens'
import { VERSION_LABEL } from '@/version'

export function Footer() {
  return (
    <footer
      style={{
        textAlign: 'center',
        fontSize: 11,
        color: tokens.colorTextMedium,
        opacity: 0.7,
        padding: '8px 16px',
      }}
    >
      {VERSION_LABEL}
    </footer>
  )
}
