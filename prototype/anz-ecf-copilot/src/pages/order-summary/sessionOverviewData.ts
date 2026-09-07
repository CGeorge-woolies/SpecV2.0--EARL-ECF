/** Canonical set of session codes a store can be assigned, in display order (Truck Arrival dialog etc). */
export const SESSION_CODES = [
  'AM', 'CDAM1', 'CDAM2', 'CDAM3', 'CDMD1', 'CDMD2', 'CDPM1', 'CDPM2', 'DDAM1',
  'DDAM2', 'DDAM3', 'DDMD1', 'DDMD2', 'DDPM1', 'DDPM2', 'DTBN', 'PM', 'XP',
] as const

/**
 * Subset of SESSION_CODES that carry fleet delivery orders (see orderGroups.ts —
 * scheduledFleet rows only ever sit in the "AM"/"PM" session groups). A truck
 * arrival is only relevant to sessions that actually contain a fleet delivery,
 * so the Truck Arrival dialog restricts its session list to these.
 */
export const FLEET_SESSION_CODES: readonly (typeof SESSION_CODES)[number][] = ['AM', 'PM']

export interface SessionOverviewRow {
  session: string
  orders: number
  articles: number
  value: number
  pctOrders: number | null
  pctTotesPacked: number | null
  pctSupplied: number | null
}

export interface SessionOverviewDay {
  /** Days after the toolbar's selected date (0 = selected date itself). */
  offset: number
  orders: number
  articles: number
  value: number
  rows: SessionOverviewRow[]
}

export const sessionOverviewTotalValue = 4076.93

export const sessionOverviewDays: SessionOverviewDay[] = [
  {
    offset: 0,
    orders: 23,
    articles: 654,
    value: 3156.2,
    rows: [
      { session: '8946 CDAM1', orders: 1, articles: 10, value: 228.0, pctOrders: 100, pctTotesPacked: 100, pctSupplied: 100 },
      { session: '8946 CDAM2', orders: 5, articles: 154, value: 570.78, pctOrders: 100, pctTotesPacked: 60, pctSupplied: 98 },
      { session: '8946 CDAM3', orders: 2, articles: 51, value: 271.13, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 11.8 },
      { session: '8946 CDMD1', orders: 2, articles: 79, value: 246.04, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { session: '8946 DDAM2', orders: 1, articles: 9, value: 50.3, pctOrders: 100, pctTotesPacked: 0, pctSupplied: 100 },
      { session: '8946 DDAM3', orders: 3, articles: 122, value: 453.17, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 24.2 },
      { session: '8946 DDMD1', orders: 1, articles: 27, value: 109.34, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { session: '8946 DDMD2', orders: 1, articles: 21, value: 175.44, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { session: '8946 XP', orders: 7, articles: 181, value: 1052.0, pctOrders: 85.7, pctTotesPacked: 85.7, pctSupplied: 89.5 },
    ],
  },
  {
    offset: 1,
    orders: 4,
    articles: 131,
    value: 423.14,
    rows: [
      { session: '8946 DDAM1', orders: 2, articles: 68, value: 272.11, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { session: '8946 DDAM2', orders: 2, articles: 63, value: 151.03, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
    ],
  },
  {
    offset: 2,
    orders: 1,
    articles: 30,
    value: 188.06,
    rows: [
      { session: '8946 DDPM1', orders: 1, articles: 30, value: 188.06, pctOrders: null, pctTotesPacked: null, pctSupplied: null },
    ],
  },
  {
    offset: 3,
    orders: 1,
    articles: 30,
    value: 197.99,
    rows: [
      { session: '8946 DDMD1', orders: 1, articles: 30, value: 197.99, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
    ],
  },
  {
    offset: 4,
    orders: 1,
    articles: 15,
    value: 59.2,
    rows: [
      { session: '8946 DDAM3', orders: 1, articles: 15, value: 59.2, pctOrders: null, pctTotesPacked: null, pctSupplied: null },
    ],
  },
  // offset 5 intentionally omitted — no sessions scheduled that day
  {
    offset: 6,
    orders: 1,
    articles: 21,
    value: 52.34,
    rows: [
      { session: '8946 DDAM2', orders: 1, articles: 21, value: 52.34, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
    ],
  },
]
