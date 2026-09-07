import type { OrderRow } from '../order-summary/orderGroups'

export type SearchStatusFilter = 'all' | 'awaiting-pick' | 'picking' | 'packed' | 'dispatched' | 'deleted'

export interface SearchFilterValues {
  status: SearchStatusFilter
  orderNo: string
  customerName: string
  fraudReference: string
  searchAllStores: boolean
}

export const DEFAULT_SEARCH_FILTERS: SearchFilterValues = {
  status: 'all',
  orderNo: '',
  customerName: '',
  fraudReference: '',
  searchAllStores: false,
}

function matchesStatus(row: OrderRow, status: SearchStatusFilter): boolean {
  switch (status) {
    case 'all':
      return true
    case 'awaiting-pick':
      return row.status.startsWith('Awaiting Pick')
    case 'picking':
      return row.status === 'Picking'
    case 'packed':
      return row.status === 'Packed'
    case 'dispatched':
      return row.status.startsWith('DIS')
    case 'deleted':
      return !!row.isDeleted
  }
}

/** Order No/Transit code, Customer name, Status, and a fraud-flag check all have real backing data on
 * OrderRow. Customer number, Article No/Barcode, and date range are rendered for visual fidelity to the
 * legacy search screen but have no equivalent field on OrderRow, so they're intentionally not filtered on. */
export function filterOrders(rows: OrderRow[], filters: SearchFilterValues): OrderRow[] {
  const orderNo = filters.orderNo.trim().toLowerCase()
  const customerName = filters.customerName.trim().toLowerCase()
  const hasFraudFilter = filters.fraudReference.trim().length > 0

  return rows.filter((row) => {
    if (!matchesStatus(row, filters.status)) return false
    if (orderNo && !row.orderNo.toLowerCase().includes(orderNo) && !row.transitCode?.toLowerCase().includes(orderNo)) {
      return false
    }
    if (customerName && !row.customer.toLowerCase().includes(customerName)) return false
    if (hasFraudFilter && !row.flags.includes('fraud')) return false
    return true
  })
}
