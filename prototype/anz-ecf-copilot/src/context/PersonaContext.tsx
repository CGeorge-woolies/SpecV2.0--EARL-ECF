import { createContext, useContext, useState, type ReactNode } from 'react'
import type { PersonaMode } from '@/types'

interface PersonaContextValue {
  activePersona: PersonaMode
  setActivePersona: (persona: PersonaMode) => void
  isSupportOffice: boolean
  isStoreTeam: boolean
  isCustomerSupport: boolean
}

const PersonaContext = createContext<PersonaContextValue | null>(null)

export function PersonaContextProvider({ children }: { children: ReactNode }) {
  const [activePersona, setActivePersonaState] = useState<PersonaMode>(() => {
    const stored = localStorage.getItem('ecf-persona')
    return (stored === 'store-team' || stored === 'support-office' || stored === 'customer-support') ? stored : 'store-team'
  })

  const setActivePersona = (persona: PersonaMode) => {
    localStorage.setItem('ecf-persona', persona)
    setActivePersonaState(persona)
  }

  return (
    <PersonaContext.Provider value={{
      activePersona,
      setActivePersona,
      isSupportOffice: activePersona === 'support-office',
      isStoreTeam: activePersona === 'store-team',
      isCustomerSupport: activePersona === 'customer-support',
    }}>
      {children}
    </PersonaContext.Provider>
  )
}

export function usePersona() {
  const ctx = useContext(PersonaContext)
  if (!ctx) throw new Error('usePersona must be used within PersonaContextProvider')
  return ctx
}
