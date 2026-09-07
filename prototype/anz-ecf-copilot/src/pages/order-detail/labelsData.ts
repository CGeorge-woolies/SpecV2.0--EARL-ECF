import { AcUnitFilled, ShelvesFilled, ShieldLockOutlined, ThermostatFilled, type IconComponent } from '@/components/icons/material-icons'

export type ToteStatus = 'Packed' | 'Picking' | 'Awaiting Pick'
export type ToteZone = 'ambient' | 'chilled' | 'freezer' | 'security'

export const ZONE_CONFIG: Record<ToteZone, { label: string; icon: IconComponent }> = {
  ambient: { label: 'Ambient', icon: ShelvesFilled },
  chilled: { label: 'Chilled', icon: ThermostatFilled },
  freezer: { label: 'Freezer', icon: AcUnitFilled },
  security: { label: 'Security', icon: ShieldLockOutlined },
}

export const PRINTER_OPTIONS = ['Printer 1', 'Printer 2', 'Printer 3', 'Printer 4', 'Printer 5'] as const
export type PrinterOption = (typeof PRINTER_OPTIONS)[number]

export interface Tote {
  id: string
  toteNo: number
  status: ToteStatus
  zone: ToteZone
  personalShopper: string
  /** Bag numbers packed into this tote — empty when no bag labels have been generated yet. */
  bagNumbers: number[]
  /** Manually added via "Add New Tote" — only these can be deleted. */
  isManualTote: boolean
  /** Soft-deleted manual totes stay in the list, shown struck-through, rather than disappearing. */
  isDeleted: boolean
}

const MOCK_TOTES: Tote[] = [
  { id: 'tote-1', toteNo: 1, status: 'Packed', zone: 'ambient', personalShopper: 'Bhupinder', bagNumbers: [3, 4, 5], isManualTote: false, isDeleted: false },
  { id: 'tote-2', toteNo: 2, status: 'Packed', zone: 'chilled', personalShopper: 'Mia Sullivan', bagNumbers: [], isManualTote: false, isDeleted: false },
  { id: 'tote-3', toteNo: 3, status: 'Packed', zone: 'freezer', personalShopper: 'Ethan Brooks', bagNumbers: [1, 2], isManualTote: false, isDeleted: false },
  { id: 'tote-4', toteNo: 4, status: 'Awaiting Pick', zone: 'security', personalShopper: 'Sophia Reyes', bagNumbers: [], isManualTote: false, isDeleted: false },
]

export function getOrderTotes(_orderNo: string): Tote[] {
  return MOCK_TOTES
}
