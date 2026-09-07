import { useState, useRef, useEffect } from 'react'
import { User, LogOut, ChevronDown, Check } from 'lucide-react'
import { usePersona } from '@/context/PersonaContext'
import type { PersonaMode } from '@/types'
import tokens from '@/theme/tokens'

export const PERSONA_OPTIONS: { value: PersonaMode; label: string; id: string }[] = [
  { value: 'store-team', label: 'Store Team', id: '1193644' },
  { value: 'support-office', label: 'Support Office', id: '12345678' },
  { value: 'customer-support', label: 'Customer Support', id: '98765432' },
]

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { activePersona, setActivePersona } = usePersona()

  const activeOption = PERSONA_OPTIONS.find((opt) => opt.value === activePersona)!
  const displayName = `${activeOption.label} (${activeOption.id})`

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleLogout = () => {
    setOpen(false)
    // SSO signout would be triggered here
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 8px',
          background: 'transparent',
          border: 'none',
          borderRadius: tokens.radiusSm,
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.85)',
          fontFamily: tokens.fontFamily,
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.color = '#FFFFFF'
          el.style.backgroundColor = 'rgba(255,255,255,0.08)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.color = 'rgba(255,255,255,0.85)'
          el.style.backgroundColor = 'transparent'
        }}
      >
        <User size={20} strokeWidth={1.75} />
        <span className="hidden xl:inline">{displayName}</span>
        <ChevronDown
          size={13}
          style={{
            opacity: 0.7,
            transition: 'transform 0.15s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: tokens.radiusSm,
            border: `1px solid ${tokens.colorBorderWeak}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            minWidth: 200,
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '6px 0', borderBottom: `1px solid ${tokens.colorBorderWeak}` }}>
            {PERSONA_OPTIONS.map((opt) => {
              const isActive = opt.value === activePersona
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setActivePersona(opt.value)
                    setOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    width: '100%',
                    padding: '8px 14px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: tokens.fontFamily,
                    fontSize: 13,
                    color: tokens.colorTextStrong,
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = tokens.colorBgTertiary
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <span>
                    {opt.label}
                    <span style={{ color: tokens.colorTextMedium }}> ({opt.id})</span>
                  </span>
                  {isActive && <Check size={14} style={{ color: tokens.colorPrimaryDarkest, flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: tokens.fontFamily,
              fontSize: 13,
              color: tokens.colorTextStrong,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = tokens.colorBgTertiary
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
            }}
          >
            Logout
            <LogOut size={14} style={{ color: tokens.colorTextMedium }} />
          </button>
        </div>
      )}
    </div>
  )
}
