export interface OrderInstructions {
  personalShopperInstructions: string
  customerCareInstructions: string
  deliveryInstructions: string
}

/** Single canonical dummy record, shown for every order for now. Per-order variation lands later. */
const CANONICAL_ORDER_INSTRUCTIONS: OrderInstructions = {
  personalShopperInstructions: '',
  customerCareInstructions: '',
  deliveryInstructions: 'Please bring the groceries up via the loft to the door. Do not leave in lobby.',
}

/** Always returns the canonical record regardless of order — real per-order data lands in a future pass. */
export function getOrderInstructions(_orderNo: string): OrderInstructions {
  return CANONICAL_ORDER_INSTRUCTIONS
}
