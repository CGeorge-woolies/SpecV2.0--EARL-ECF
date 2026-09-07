export interface WindowOverviewRow {
  window: string
  orders: number
  articles: number
  value: number
  pctOrders: number | null
  pctTotesPacked: number | null
  pctSupplied: number | null
}

export interface WindowOverviewDay {
  /** Days after the toolbar's selected date (0 = selected date itself). */
  offset: number
  orders: number
  articles: number
  value: number
  rows: WindowOverviewRow[]
}

export const windowOverviewTotalOrders = 680
export const windowOverviewTotalArticles = 26728
export const windowOverviewTotalValue = 152760.05

export const windowOverviewDays: WindowOverviewDay[] = [
  {
    offset: 0,
    orders: 552,
    articles: 21457,
    value: 128187.8,
    rows: [
      { window: '7:00AM', orders: 39, articles: 1533, value: 8689.0, pctOrders: 100, pctTotesPacked: 100, pctSupplied: 100 },
      { window: '7:45AM', orders: 8, articles: 1074, value: 6962.31, pctOrders: 100, pctTotesPacked: 87.5, pctSupplied: 100 },
      { window: '8:29AM', orders: 8, articles: 322, value: 1966.0, pctOrders: 100, pctTotesPacked: 75, pctSupplied: 87.5 },
      { window: '8:30AM', orders: 28, articles: 831, value: 4884.14, pctOrders: 96.4, pctTotesPacked: 82.1, pctSupplied: 92.9 },
      { window: '9:00AM', orders: 1, articles: 73, value: 336.89, pctOrders: 100, pctTotesPacked: 0, pctSupplied: 100 },
      { window: '9:14AM', orders: 11, articles: 398, value: 2080.86, pctOrders: 63.6, pctTotesPacked: 36.4, pctSupplied: 63.6 },
      { window: '9:15AM', orders: 44, articles: 1746, value: 11220.34, pctOrders: 47.7, pctTotesPacked: 25, pctSupplied: 47.7 },
      { window: '9:30AM', orders: 1, articles: 28, value: 124.32, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { window: '9:59AM', orders: 2, articles: 79, value: 405.18, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { window: '10:00AM', orders: 50, articles: 2109, value: 12403.7, pctOrders: 20, pctTotesPacked: 8, pctSupplied: 20 },
      { window: '11:00AM', orders: 23, articles: 168, value: 3568.42, pctOrders: 8.7, pctTotesPacked: 0, pctSupplied: 8.7 },
      { window: '12:00PM', orders: 4, articles: 143, value: 926.24, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { window: '12:15PM', orders: 30, articles: 1194, value: 6578.81, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { window: '12:29PM', orders: 2, articles: 81, value: 483.4, pctOrders: null, pctTotesPacked: null, pctSupplied: null },
      { window: '12:58PM', orders: 2, articles: 45, value: 324.5, pctOrders: null, pctTotesPacked: null, pctSupplied: null },
    ],
  },
  {
    offset: 1,
    orders: 45,
    articles: 1856,
    value: 9201.25,
    rows: [
      { window: '7:00AM', orders: 10, articles: 412, value: 1850.0, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { window: '7:45AM', orders: 15, articles: 601, value: 3120.5, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { window: '9:15AM', orders: 20, articles: 843, value: 4230.75, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
    ],
  },
  {
    offset: 2,
    orders: 30,
    articles: 1240,
    value: 5580.6,
    rows: [
      { window: '8:30AM', orders: 12, articles: 480, value: 2100.0, pctOrders: null, pctTotesPacked: null, pctSupplied: null },
      { window: '10:00AM', orders: 18, articles: 760, value: 3480.6, pctOrders: null, pctTotesPacked: null, pctSupplied: null },
    ],
  },
  {
    offset: 3,
    orders: 22,
    articles: 900,
    value: 4050.4,
    rows: [
      { window: '9:00AM', orders: 8, articles: 310, value: 1400.0, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { window: '11:00AM', orders: 14, articles: 590, value: 2650.4, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
    ],
  },
  {
    offset: 4,
    orders: 6,
    articles: 240,
    value: 1080.0,
    rows: [
      { window: '10:00AM', orders: 6, articles: 240, value: 1080.0, pctOrders: null, pctTotesPacked: null, pctSupplied: null },
    ],
  },
  // offset 5 intentionally omitted — no windows scheduled that day
  {
    offset: 6,
    orders: 25,
    articles: 1035,
    value: 4660.0,
    rows: [
      { window: '7:45AM', orders: 9, articles: 365, value: 1620.0, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
      { window: '12:15PM', orders: 16, articles: 670, value: 3040.0, pctOrders: 0, pctTotesPacked: 0, pctSupplied: 0 },
    ],
  },
]
