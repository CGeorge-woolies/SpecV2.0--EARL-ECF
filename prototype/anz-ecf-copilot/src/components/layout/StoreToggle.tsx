import { useStore } from '@/context/StoreContext'
import type { StoreType, Country } from '@/types'

export const STORE_TYPE_OPTIONS: { value: StoreType; label: string }[] = [
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'cfc', label: 'CFC' },
  { value: 'estore', label: 'eStore' },
]

export const COUNTRY_OPTIONS: { value: Country; label: string }[] = [
  { value: 'au', label: 'AU' },
  { value: 'nz', label: 'NZ' },
]

const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function ToggleSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  minWidth,
}: {
  value: T | null
  onChange: (v: T | null) => void
  options: { value: T; label: string }[]
  placeholder: string
  minWidth: number
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : (e.target.value as T))}
        className="appearance-none bg-transparent border border-white/30 rounded text-white text-sm font-medium pl-3 pr-8 py-1.5 cursor-pointer focus:outline-none focus:border-white/60"
        style={{ colorScheme: 'dark', minWidth }}
      >
        <option value="" style={{ backgroundColor: '#003D20', color: 'rgba(255,255,255,0.5)' }}>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ backgroundColor: '#003D20', color: '#FFFFFF' }}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/60">
        <Chevron />
      </div>
    </div>
  )
}

export function StoreToggle() {
  const { activeStoreType, setActiveStoreType, activeCountry, setActiveCountry } = useStore()

  return (
    <div className="flex items-center gap-2">
      <ToggleSelect
        value={activeStoreType}
        onChange={setActiveStoreType}
        options={STORE_TYPE_OPTIONS}
        placeholder="No store type"
        minWidth={140}
      />
      <ToggleSelect
        value={activeCountry}
        onChange={setActiveCountry}
        options={COUNTRY_OPTIONS}
        placeholder="No country"
        minWidth={100}
      />
    </div>
  )
}
