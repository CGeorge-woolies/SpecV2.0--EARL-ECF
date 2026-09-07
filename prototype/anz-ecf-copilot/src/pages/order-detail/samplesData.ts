export interface SampleRow {
  number: string
  description: string
  supplied: boolean
}

const DEFAULT_SAMPLES: SampleRow[] = [
  { number: '497', description: 'SUPERCOAT Baked Treats 6x400g', supplied: true },
  { number: '506', description: 'Aussie Drops Eucalyptus 150g', supplied: true },
]

export function getOrderSamples(_orderNo: string): SampleRow[] {
  return DEFAULT_SAMPLES
}
