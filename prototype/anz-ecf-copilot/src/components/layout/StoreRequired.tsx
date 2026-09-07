import { Outlet } from 'react-router-dom'
import { useStore } from '@/context/StoreContext'
import { usePersona } from '@/context/PersonaContext'
import { STORE_TYPE_OPTIONS, COUNTRY_OPTIONS } from './StoreToggle'
import { PERSONA_OPTIONS } from './UserMenu'
import type { StoreType, Country, PersonaMode } from '@/types'
import tokens from '@/theme/tokens'

export function StoreRequired() {
  const { activeStoreType, setActiveStoreType, activeCountry, setActiveCountry } = useStore()
  const { activePersona, setActivePersona } = usePersona()

  if (activeStoreType !== null && activeCountry !== null) return <Outlet />

  const selectStyle: React.CSSProperties = {
    width: 240,
    fontSize: 14,
    padding: '8px 12px',
    border: `1px solid ${tokens.colorBorderDefault}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorTextStrong,
    background: tokens.colorBgPrimary,
    cursor: 'pointer',
    fontFamily: tokens.fontFamily,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    width: 240,
    fontSize: 12,
    fontWeight: 600,
    color: tokens.colorTextMedium,
    marginBottom: 4,
    textAlign: 'left',
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: `calc(100vh - ${tokens.headerHeight})`,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: 13,
        color: tokens.colorAlertWarningText,
        background: tokens.colorAlertWarningBg,
        padding: '10px 20px',
      }}>
        <span style={{ maxWidth: 720 }}>
          <strong>Prototype only</strong> — this demo shows combined ECF/EARL functionality. Not all features are wired up, all order and article data is mock, and numbers/counts may not match between screens.
        </span>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '24px 0',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: tokens.colorTextStrong, margin: '0 0 16px' }}>
          Select a store type and country to continue
        </h2>

        <div>
          <label style={labelStyle}>Store type</label>
          <select
            value={activeStoreType ?? ''}
            onChange={(e) => setActiveStoreType(e.target.value as StoreType)}
            style={selectStyle}
          >
            <option value="" disabled>No store type selected</option>
            {STORE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Country</label>
          <select
            value={activeCountry ?? ''}
            onChange={(e) => setActiveCountry(e.target.value as Country)}
            style={selectStyle}
          >
            <option value="" disabled>No country selected</option>
            {COUNTRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Persona</label>
          <select
            value={activePersona}
            onChange={(e) => setActivePersona(e.target.value as PersonaMode)}
            style={selectStyle}
          >
            {PERSONA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div style={{
          marginTop: 24,
          width: 420,
          maxWidth: '90vw',
          fontSize: 13,
          color: tokens.colorTextMedium,
          background: tokens.colorBgSecondary,
          border: `1px solid ${tokens.colorBorderDefault}`,
          borderRadius: tokens.radiusSm,
          padding: '16px 20px',
          textAlign: 'left',
        }}>
          <p style={{ fontWeight: 700, color: tokens.colorTextStrong, margin: '0 0 8px' }}>
            Store type / country differences in this prototype
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li style={{ marginBottom: 10 }}><strong>NZ</strong> — shows locker functionality (quick actions, audit log); adds a Confirmation Number field on the Order Details tab</li>
            <li style={{ marginBottom: 10 }}><strong>NZ</strong> — no sessions, only windows: Order Summary flattens session groups into standalone window groups, hides the "Session overview" drawer (AU-only), and Search Orders' leading column shows "Window" instead of "Session"</li>
            <li style={{ marginBottom: 10 }}><strong>AU</strong> — hides the "assign to locker" quick action</li>
            <li style={{ marginBottom: 10 }}><strong>NZ + Customer Support persona</strong> — shows an "Edit details" action on the Order Details tab</li>
            <li style={{ marginBottom: 10 }}><strong>eStore</strong> — shows split eCom / Shop Floor Supply % columns (with a toggle to hide the split view in the table filters) on Order Summary and in the Order Details Articles tab, and an "OSR → Shop Floor" quick action on the Order Details view</li>
            <li><strong>CFC + AU</strong> — shows a 3-way ambient zone split in the stat panel</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
