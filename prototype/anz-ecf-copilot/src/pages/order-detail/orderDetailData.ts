export type PickStatus =
  | 'awaitingPick'
  | 'picking'
  | 'picked'
  | 'packed'
  | 'dispatched'

export const PICK_STATUS_LABEL: Record<PickStatus, string> = {
  awaitingPick: 'Awaiting Pick',
  picking: 'Picking',
  picked: 'Picked',
  packed: 'Packed',
  dispatched: 'Dispatched',
}

export interface OrderDetailInfo {
  // Fulfilment
  /** NZ stores only */
  confirmationNumber: string
  pickStatus: PickStatus
  onHold: boolean
  priorityOrder: boolean
  orderCreated: string
  pickDate: string
  pickupTime: string
  deliveryDate: Date
  deliveryWindow: string
  deliveryEta: string
  transitStatus: string
  ignoreTransit: boolean
  // Customer
  customerNumber: string
  customerName: string
  mobileNumber: string
  phoneNumber: string
  workNumber: string
  deliveryAddressLines: [string, string, string]
  // Payment / fraud
  orderDiscountAmount: number
  orderDiscountPercent: number
  fulfilmentFee: number
  orderInclGst: number
  fraudStatus: string
  ignoreFraudStatus: boolean
  fraudStatusRef: string
}

/** Single canonical dummy record, shown for every order for now. Per-order variation lands later. */
const CANONICAL_ORDER_DETAIL: OrderDetailInfo = {
  confirmationNumber: 'CD49324960',
  pickStatus: 'awaitingPick',
  onHold: false,
  priorityOrder: false,
  orderCreated: 'Fri 10 Jul 2026 11:33 AM',
  pickDate: 'Sun 12 Jul 2026',
  pickupTime: '05:00 AM',
  deliveryDate: new Date(2026, 6, 12),
  deliveryWindow: '6:00 AM to 9:00 AM',
  deliveryEta: 'Sun 12 Jul 2026 06:08 AM',
  transitStatus: 'Transit Done',
  ignoreTransit: false,
  customerNumber: '8454441',
  customerName: 'Jonathan Villao',
  mobileNumber: '0450260896',
  phoneNumber: '0200000000',
  workNumber: '0290011234',
  deliveryAddressLines: ['407-419 Elizabeth St', 'SURRY HILLS NSW', 'Surry Hills 2010'],
  orderDiscountAmount: 0,
  orderDiscountPercent: 0,
  fulfilmentFee: 10,
  orderInclGst: 80.6,
  fraudStatus: 'Fraud Checked OK',
  ignoreFraudStatus: false,
  fraudStatusRef: 'KQGBAAjYUGo=',
}

/** Always returns the canonical record regardless of order — real per-order data lands in a future pass. */
export function getOrderDetailInfo(_orderNo: string): OrderDetailInfo {
  return CANONICAL_ORDER_DETAIL
}

/** Maps the Order Summary table's free-form status text (e.g. "DIS 01:32 PM", "Awaiting Pick (PST 02:01 PM)") to the Details tab's Fulfilment status enum. */
export function mapOrderStatusToPickStatus(status: string): PickStatus {
  if (status === 'Picking') return 'picking'
  if (status === 'Packed') return 'packed'
  if (status.startsWith('DIS')) return 'dispatched'
  return 'awaitingPick'
}

/** Formats a delivery date as "Sun 12 Jul 2026", matching the rest of the Fulfilment card's date fields. */
export function formatDetailDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-AU', { weekday: 'short' })
  const month = date.toLocaleDateString('en-AU', { month: 'short' })
  return `${weekday} ${date.getDate()} ${month} ${date.getFullYear()}`
}

/** Three-hour delivery windows from 6am to midnight, in order — the existing "6:00 AM to 9:00 AM" is one of these. */
export const DELIVERY_WINDOW_OPTIONS = [
  '6:00 AM to 9:00 AM',
  '9:00 AM to 12:00 PM',
  '12:00 PM to 3:00 PM',
  '3:00 PM to 6:00 PM',
  '6:00 PM to 9:00 PM',
  '9:00 PM to 12:00 AM',
]
