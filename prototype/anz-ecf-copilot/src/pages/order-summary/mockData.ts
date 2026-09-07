export interface ZoneBreakdown {
  total: number
  ambient: number
  ambient1?: number
  ambient2?: number
  ambient3?: number
  chilled: number
  frozen: number
  security: number
}

export const totesAvailable: ZoneBreakdown = {
  total: 56,
  ambient: 10,
  ambient1: 4,
  ambient2: 3,
  ambient3: 3,
  chilled: 20,
  frozen: 15,
  security: 11,
}

export const itemsAvailable: ZoneBreakdown = {
  total: 716,
  ambient: 100,
  ambient1: 40,
  ambient2: 30,
  ambient3: 30,
  chilled: 400,
  frozen: 200,
  security: 16,
}
