export type PersonaMode = 'store-team' | 'support-office' | 'customer-support'

export type StoreType = 'supermarket' | 'cfc' | 'estore'

export type Country = 'au' | 'nz'

export interface NavItem {
  id: string
  label: string
  icon?: string
  path?: string
  isExternal?: boolean
  externalUrl?: string
  children?: NavItem[]
  visibleTo?: PersonaMode[]
  hiddenFor?: StoreType[]
  divider?: boolean
  defaultCollapsed?: boolean
  required?: boolean
}
