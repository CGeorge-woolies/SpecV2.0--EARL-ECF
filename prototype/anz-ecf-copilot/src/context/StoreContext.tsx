import { createContext, useContext, useState, type ReactNode } from 'react'
import type { StoreType, Country } from '@/types'

interface StoreContextValue {
  activeStoreType: StoreType | null
  setActiveStoreType: (storeType: StoreType | null) => void
  activeCountry: Country | null
  setActiveCountry: (country: Country | null) => void
  isSupermarket: boolean
  isCFC: boolean
  isEstore: boolean
  isAU: boolean
  isNZ: boolean
}

const StoreContext = createContext<StoreContextValue | null>(null)

const VALID_STORE_TYPES: StoreType[] = ['supermarket', 'cfc', 'estore']
const VALID_COUNTRIES: Country[] = ['au', 'nz']

// Share builds (npm run build:share) are handed to stakeholders as a standalone HTML
// file they reopen repeatedly — each open should start from the store/country picker
// rather than resuming whatever was last selected, so skip localStorage persistence.
const IS_SHARE_BUILD = import.meta.env.VITE_SHARE_BUILD === 'true'

export function StoreContextProvider({ children }: { children: ReactNode }) {
  const [activeStoreType, setActiveStoreTypeState] = useState<StoreType | null>(() => {
    if (IS_SHARE_BUILD) return null
    const stored = localStorage.getItem('ecf-store-type')
    return VALID_STORE_TYPES.includes(stored as StoreType) ? (stored as StoreType) : null
  })
  const [activeCountry, setActiveCountryState] = useState<Country | null>(() => {
    if (IS_SHARE_BUILD) return null
    const stored = localStorage.getItem('ecf-country')
    return VALID_COUNTRIES.includes(stored as Country) ? (stored as Country) : null
  })

  const setActiveStoreType = (storeType: StoreType | null) => {
    if (!IS_SHARE_BUILD) {
      if (storeType === null) {
        localStorage.removeItem('ecf-store-type')
      } else {
        localStorage.setItem('ecf-store-type', storeType)
      }
    }
    setActiveStoreTypeState(storeType)
  }

  const setActiveCountry = (country: Country | null) => {
    if (!IS_SHARE_BUILD) {
      if (country === null) {
        localStorage.removeItem('ecf-country')
      } else {
        localStorage.setItem('ecf-country', country)
      }
    }
    setActiveCountryState(country)
  }

  return (
    <StoreContext.Provider value={{
      activeStoreType,
      setActiveStoreType,
      activeCountry,
      setActiveCountry,
      isSupermarket: activeStoreType === 'supermarket',
      isCFC: activeStoreType === 'cfc',
      isEstore: activeStoreType === 'estore',
      isAU: activeCountry === 'au',
      isNZ: activeCountry === 'nz',
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreContextProvider')
  return ctx
}
