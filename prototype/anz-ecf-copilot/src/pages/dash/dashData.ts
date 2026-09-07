// Mock data for the Dash / Real Time Performance page. No backend — everything below is
// generated once at module load with a seeded PRNG so the page looks the same on every render.

export type PickingZoneKey = 'ambient' | 'chilled' | 'frozen' | 'security'

export const ZONE_LABEL: Record<PickingZoneKey, string> = {
  ambient: 'Ambient',
  chilled: 'Chilled',
  frozen: 'Frozen',
  security: 'Security',
}

export const PICKING_ZONES: PickingZoneKey[] = ['ambient', 'chilled', 'frozen', 'security']

// Simple seeded PRNG (mulberry32) so mock data is stable across renders/reloads.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260716)
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min

// ---------------------------------------------------------------------------
// Gauges
// ---------------------------------------------------------------------------
export interface GaugeData {
  overall: number
  target: number
  max: number
}

export const itemsPerLabourHour: GaugeData = { overall: 136, target: 120, max: 200 }

export interface ZoneGaugeValue {
  key: PickingZoneKey
  value: number
}

export const rfPickRate: GaugeData & { zones: ZoneGaugeValue[] } = {
  overall: 205,
  target: 170,
  max: 200,
  zones: [
    { key: 'ambient', value: 204 },
    { key: 'chilled', value: 163 },
    { key: 'frozen', value: 112 },
    { key: 'security', value: 359 },
  ],
}

// ---------------------------------------------------------------------------
// Estimated Picking End Time
// ---------------------------------------------------------------------------
export const estimatedPickingEndTime = {
  target: '11:59:00',
  estimated: '13:26:36',
  estimatedBehindTarget: true,
  actual: null as string | null,
}

// ---------------------------------------------------------------------------
// Count of Team Members
// ---------------------------------------------------------------------------
export const teamMembers = {
  unassignedLabel: 'Unassigned',
  unassignedCount: 42,
  zones: PICKING_ZONES.map((key) => ({ key, count: 0 })),
}

// ---------------------------------------------------------------------------
// Count of Totes
// ---------------------------------------------------------------------------
export interface ToteZoneCounts {
  key: PickingZoneKey
  packed: number
  picking: number
  awaiting: number
}

export const totes: ToteZoneCounts[] = [
  { key: 'ambient', packed: 450, picking: 0, awaiting: 190 },
  { key: 'chilled', packed: 296, picking: 0, awaiting: 38 },
  { key: 'frozen', packed: 360, picking: 199, awaiting: 52 },
  { key: 'security', packed: 1, picking: 0, awaiting: 10 },
]

// ---------------------------------------------------------------------------
// Count of Trucks
// ---------------------------------------------------------------------------
export const trucks = {
  awaitingPick: 21,
  picking: 0,
  packed: 0,
  dispatched: 0,
}

// ---------------------------------------------------------------------------
// Personal Shopper Timeline
// ---------------------------------------------------------------------------
export type TimelineZone = PickingZoneKey | 'nonPicking'

export interface TimelineSegment {
  zone: TimelineZone
  startMin: number // minutes from 00:00
  endMin: number
}

export interface TimelinePicker {
  id: string
  segments: TimelineSegment[]
  itemsPerHour: number | null
  rfPickRate: number | null
  goalTimePerformance: number | null // percentage
}

export const TIMELINE_START_MIN = 4 * 60 // 4:00am
export const TIMELINE_END_MIN = 15 * 60 // 3:00pm

const PICKING_ZONE_POOL: PickingZoneKey[] = ['ambient', 'chilled', 'frozen']

function generatePicker(): TimelinePicker {
  const id = String(1300 + randInt(0, 9999)).padStart(4, '0') + randInt(0, 9)
  const shiftStart = TIMELINE_START_MIN + randInt(0, 5 * 60)
  const shiftEnd = Math.min(TIMELINE_END_MIN, shiftStart + randInt(90, 6 * 60))
  const didPick = rand() < 0.55

  if (!didPick) {
    return {
      id,
      segments: [{ zone: 'nonPicking', startMin: shiftStart, endMin: shiftEnd }],
      itemsPerHour: 0,
      rfPickRate: 0,
      goalTimePerformance: 0,
    }
  }

  const segments: TimelineSegment[] = []
  const preGap = randInt(30, 120)
  let cursor = shiftStart
  const pickingStart = Math.min(shiftEnd, shiftStart + preGap)
  if (pickingStart > cursor) {
    segments.push({ zone: 'nonPicking', startMin: cursor, endMin: pickingStart })
    cursor = pickingStart
  }

  const blockCount = randInt(1, 3)
  for (let i = 0; i < blockCount && cursor < shiftEnd; i++) {
    const blockLen = Math.min(shiftEnd - cursor, randInt(40, 100))
    const zone = PICKING_ZONE_POOL[randInt(0, PICKING_ZONE_POOL.length - 1)]
    segments.push({ zone, startMin: cursor, endMin: cursor + blockLen })
    cursor += blockLen
    if (cursor < shiftEnd && rand() < 0.4) {
      const gap = Math.min(shiftEnd - cursor, randInt(5, 20))
      cursor += gap
    }
  }

  const itemsPerHour = randInt(110, 220)
  const rfPickRateVal = randInt(150, 300)
  const goalTimePerformance = Math.round((itemsPerHour / itemsPerLabourHour.target) * 100)

  return { id, segments, itemsPerHour, rfPickRate: rfPickRateVal, goalTimePerformance }
}

export const timelinePickers: TimelinePicker[] = Array.from({ length: 40 }, () => generatePicker())
