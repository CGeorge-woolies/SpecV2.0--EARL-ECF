export interface DepartmentNotificationOption {
  id: string
  label: string
}

export const DEPARTMENTS: DepartmentNotificationOption[] = [
  { id: 'bakehouse', label: 'Bakehouse' },
  { id: 'fruit-and-veg', label: 'Fruit And Veg' },
  { id: 'cigarettes', label: 'Cigarettes' },
  { id: 'liquor', label: 'Liquor' },
  { id: 'deli-service', label: 'Deli Service' },
  { id: 'prop-bakery', label: 'Prop Bakery' },
  { id: 'fresh-convenience', label: 'Fresh Convenience' },
  { id: 'seafood-service', label: 'Seafood Service' },
  { id: 'front-of-store', label: 'Front Of Store' },
]

export const SPECIALTY_OPTIONS: DepartmentNotificationOption[] = [
  { id: 'cake', label: 'Cake' },
  { id: 'hot-food', label: 'Hot Food' },
  { id: 'deli-platters', label: 'Deli Platters' },
  { id: 'floral', label: 'Floral' },
  { id: 'seafood-platters', label: 'Seafood Platters' },
  { id: 'fruit-box', label: 'Fruit Box' },
  { id: 'sushi-rolls', label: 'Sushi Rolls' },
]

export const SPECIALTY_OPTIONS_NZ: DepartmentNotificationOption[] = [
  ...SPECIALTY_OPTIONS,
  { id: 'pharmacy', label: 'Pharmacy' },
]

export const PRINT_OPTIONS: DepartmentNotificationOption[] = [
  { id: 'reprint', label: 'Reprint' },
  { id: 'sort-by-article', label: 'Sort by Article' },
  { id: 'separate-pages', label: 'Separate Pages' },
]

export interface DepartmentNotificationsSelection {
  departments: string[]
  specialty: string[]
  printOptions: string[]
}
