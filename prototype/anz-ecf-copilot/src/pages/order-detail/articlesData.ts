import type { ToteZone } from './labelsData'
import { findOrder } from '../order-summary/orderGroups'

export interface ArticleSubRow {
  articleNo: string
  description: string
  volume: string
  ordered: number
  supplied: number
  price?: number
  subs?: 'yes' | 'no'
  amount?: number
}

export interface ArticleRow {
  no: number
  articleNo: string
  description: string
  volume: string
  ordered: number
  supplied: number
  price: number
  subs?: 'yes' | 'no'
  amount: number
  /** Aisle/Bay/Shelf shelf location, printed on the manual picking list (e.g. "A7 B42 S1"). */
  location: string
  /** Which picking tote this article belongs in — drives the Labels tab's per-tote article split. Alcohol is the only security-zone case. */
  zone: ToteZone
  /** Presence drives the WGHT badge + expandable "Actual weights" row. */
  weights?: number[]
  /** Pink SLT row — what the customer actually ordered before a silent/system sub. */
  silentSub?: ArticleSubRow
  /** Green SUB row(s) — manual substitutions the personal shopper supplied instead. A line can
   *  have more than one (e.g. two different articles covering the shortfall). */
  substitutes?: ArticleSubRow[]
  /** eStore only: already moved from the OSR queue to the Shop Floor picking queue. The move is
   *  one-way, so these rows never show the select checkbox — a storefront icon takes its place. */
  shopFloor?: boolean
  /** NZ-only: this line is a pharmacy item. Appended to an order's article list by
   *  getOrderArticles when that order's OrderRow carries the 'pharmacy' flag — see PHARMACY_ARTICLE. */
  pharmacy?: boolean
}

/**
 * Picking-stage data: order is being (or has just been) picked. Mix of straightforward
 * matches, a silent sub, a substitute, and a weighed produce item — the "typical in-progress
 * order" shape.
 */
const PICKING_ARTICLES: ArticleRow[] = [
  {
    no: 1,
    articleNo: '165262',
    description: 'Berry Raspberry 125g P/P',
    volume: '125g',
    ordered: 1,
    supplied: 1,
    price: 4.5,
    subs: 'yes',
    amount: 4.5,
    location: 'A3 B12 S2',
    zone: 'chilled',
  },
  {
    no: 2,
    articleNo: '201687',
    description: 'Lindt Excellence 85% Cocoa 100g',
    volume: '100g',
    ordered: 2,
    supplied: 0,
    price: 6.8,
    subs: 'no',
    amount: 0,
    location: 'A7 B45 S4',
    zone: 'ambient',
  },
  {
    no: 3,
    articleNo: '250994',
    description: 'WW Chilli Flakes Hot 23g',
    volume: '23g',
    ordered: 1,
    supplied: 0,
    price: 2.0,
    subs: 'no',
    amount: 0,
    location: 'A11 B8 S1',
    zone: 'ambient',
    shopFloor: true,
  },
  {
    no: 4,
    articleNo: '6005940',
    description: 'WW Butter Croissant Bake 6pk 360g',
    volume: '6 pack',
    ordered: 1,
    supplied: 1,
    price: 7.25,
    subs: 'yes',
    amount: 7.25,
    location: 'A5 B33 S5',
    zone: 'freezer',
  },
  {
    no: 5,
    articleNo: '6051862',
    description: 'WW Milk Free From Lactose Full Cream 2L',
    volume: '2l',
    ordered: 1,
    supplied: 0,
    price: 5.65,
    subs: 'yes',
    amount: 0,
    location: 'A2 B19 S3',
    zone: 'chilled',
    substitutes: [
      {
        articleNo: '386952',
        description: 'Dairy Farmers Lact Free Full Crm Milk 2L',
        volume: '2l',
        ordered: 1,
        supplied: 1,
        price: 6.1,
        subs: 'no',
        amount: 5.65,
      },
    ],
  },
  {
    no: 6,
    articleNo: '683764',
    description: 'Schwarz Root Retouch Brown 120ml',
    volume: '120ml',
    ordered: 1,
    supplied: 1,
    price: 12.0,
    subs: 'yes',
    amount: 12.0,
    location: 'A9 B27 S2',
    zone: 'ambient',
  },
  {
    no: 7,
    articleNo: '752346',
    description: 'Birds Eye Deli Chips Sea Salt Rsmry 600g',
    volume: '600g',
    ordered: 1,
    supplied: 1,
    price: 1.0,
    subs: 'yes',
    amount: 1.0,
    location: 'A4 B41 S1',
    zone: 'freezer',
  },
  {
    no: 8,
    articleNo: '119318',
    description: 'WW RSPCA Chicken Thigh Fillets Small',
    volume: '500g - 750g',
    ordered: 1,
    supplied: 1,
    price: 13.5,
    subs: 'yes',
    amount: 10.69,
    location: 'A6 B15 S4',
    zone: 'chilled',
    weights: [594],
    shopFloor: true,
  },
  {
    no: 9,
    articleNo: '205222',
    description: 'WW Eggs Free Range XL 12pk 700g',
    volume: '700g',
    ordered: 1,
    supplied: 1,
    price: 7.15,
    subs: 'yes',
    amount: 7.15,
    location: 'A1 B22 S3',
    zone: 'chilled',
    silentSub: {
      articleNo: '224763',
      description: 'WW Free Range Eggs XL 12pk 700g',
      volume: '700g',
      ordered: 0,
      supplied: 0,
    },
  },
  {
    no: 10,
    articleNo: '205222',
    description: 'WW Eggs Free Range XL 12pk 700g',
    volume: '700g',
    ordered: 1,
    supplied: 0,
    price: 6.5,
    subs: 'yes',
    amount: 0,
    location: 'A1 B22 S3',
    zone: 'chilled',
    silentSub: {
      articleNo: '224763',
      description: 'WW Free Range Eggs XL 12pk 700g',
      volume: '700g',
      ordered: 0,
      supplied: 0,
    },
    substitutes: [
      {
        articleNo: '77170',
        description: 'Sunny Queen Fms F/Range XL 12pk 700g',
        volume: '700g',
        ordered: 1,
        supplied: 1,
        price: 8.8,
        subs: 'no',
        amount: 6.5,
      },
    ],
  },
  {
    no: 11,
    articleNo: '143109',
    description: 'Mushroom Cups Loose',
    volume: 'per 200g',
    ordered: 0.2,
    supplied: 0.233,
    price: 12.9,
    subs: 'yes',
    amount: 2.58,
    location: 'A10 B36 S5',
    zone: 'chilled',
    weights: [233],
  },
  {
    no: 12,
    articleNo: '144329',
    description: 'Onion Brown Loose',
    volume: 'each',
    ordered: 3,
    supplied: 3,
    price: 0.63,
    subs: 'no',
    amount: 1.89,
    location: 'A8 B29 S2',
    zone: 'ambient',
  },
  {
    no: 13,
    articleNo: '208895',
    description: 'Potato White Washed Loose',
    volume: 'each',
    ordered: 2,
    supplied: 2,
    price: 0.9,
    subs: 'yes',
    amount: 1.8,
    location: 'A12 B7 S1',
    zone: 'ambient',
    shopFloor: true,
  },
  {
    no: 14,
    articleNo: '135306',
    description: 'Capsicum Red',
    volume: 'each',
    ordered: 1,
    supplied: 1,
    price: 1.48,
    subs: 'yes',
    amount: 1.48,
    location: 'A3 B50 S3',
    zone: 'ambient',
  },
  {
    no: 15,
    articleNo: '39385',
    description: 'Grant Burge Hillcot Merlot 750ml',
    volume: '750ml',
    ordered: 1,
    supplied: 1,
    price: 20.0,
    subs: 'no',
    amount: 20.0,
    location: 'A901 B1 S1',
    zone: 'security',
  },
]

/**
 * Awaiting-pick data: same order lines as picking, but nothing has been actioned yet — no
 * supplied quantities, subs decisions, or weights recorded. Silent subs are decided at a
 * system level (not by the picker), so they're already visible here, same as in picking/dispatched.
 */
const NOT_STARTED_ARTICLES: ArticleRow[] = PICKING_ARTICLES.map((row) => ({
  no: row.no,
  articleNo: row.articleNo,
  description: row.description,
  volume: row.volume,
  ordered: row.ordered,
  supplied: 0,
  price: row.price,
  subs: row.subs,
  amount: 0,
  location: row.location,
  zone: row.zone,
  ...(row.silentSub && { silentSub: row.silentSub }),
  // Weight-tracked items start with no weights recorded yet — the Articles tab shows an
  // "+ Add weight" prompt in place of a supplied count until at least one is entered.
  ...(row.weights && { weights: [] }),
  ...(row.shopFloor && { shopFloor: row.shopFloor }),
}))

/**
 * Dispatched data: a different, fully-settled order — everything supplied or substituted,
 * nothing left pending — so the tab reads as a distinct completed order rather than a
 * re-skinned picking view.
 */
const DISPATCHED_ARTICLES: ArticleRow[] = [
  {
    no: 1,
    articleNo: '84129',
    description: "Helga's Bread Traditional Wholemeal 750g",
    volume: '750g',
    ordered: 1,
    supplied: 1,
    price: 5.3,
    subs: 'yes',
    amount: 5.3,
    location: 'A4 B18 S3',
    zone: 'ambient',
  },
  {
    no: 2,
    articleNo: '205222',
    description: 'WW Eggs Free Range XL 12pk 700g',
    volume: '700g',
    ordered: 1,
    supplied: 1,
    price: 6.5,
    subs: 'yes',
    amount: 6.5,
    location: 'A1 B22 S3',
    zone: 'chilled',
    silentSub: {
      articleNo: '224763',
      description: 'WW Free Range Eggs XL 12pk 700g',
      volume: '700g',
      ordered: 0,
      supplied: 0,
    },
  },
  {
    no: 3,
    articleNo: '148781',
    description: 'Vitasoy Oat Milky 1L',
    volume: '1l',
    ordered: 3,
    supplied: 3,
    price: 2.5,
    subs: 'yes',
    amount: 7.5,
    location: 'A7 B39 S2',
    zone: 'chilled',
  },
  {
    no: 4,
    articleNo: '227255',
    description: "Ingham's Chicken Tenders Original 1kg",
    volume: '1kg',
    ordered: 1,
    supplied: 0,
    price: 13.0,
    subs: 'no',
    amount: 0,
    location: 'A6 B44 S5',
    zone: 'freezer',
    shopFloor: true,
  },
  {
    no: 5,
    articleNo: '133211',
    description: 'Banana Cavendish',
    volume: 'each',
    ordered: 4,
    supplied: 4,
    price: 0.88,
    subs: 'yes',
    amount: 3.52,
    location: 'A2 B10 S1',
    zone: 'ambient',
  },
  {
    no: 6,
    articleNo: '170225',
    description: 'Zucchini Green Kg Md',
    volume: 'each',
    ordered: 3,
    supplied: 3,
    price: 1.18,
    subs: 'no',
    amount: 3.54,
    location: 'A9 B31 S4',
    zone: 'chilled',
  },
  {
    no: 7,
    articleNo: '120080',
    description: 'Avocado Hass',
    volume: 'each',
    ordered: 2,
    supplied: 2,
    price: 1.5,
    subs: 'yes',
    amount: 3.0,
    location: 'A3 B25 S2',
    zone: 'ambient',
  },
  {
    no: 8,
    articleNo: '154340',
    description: 'Lettuce Iceberg',
    volume: 'each',
    ordered: 1,
    supplied: 1,
    price: 3.9,
    subs: 'yes',
    amount: 3.9,
    location: 'A5 B14 S1',
    zone: 'chilled',
  },
  {
    no: 9,
    articleNo: '829107',
    description: 'Mandarin Amorette Seedless',
    volume: 'each',
    ordered: 6,
    supplied: 0,
    price: 0.59,
    subs: 'yes',
    amount: 0,
    location: 'A11 B48 S3',
    zone: 'ambient',
    shopFloor: true,
    substitutes: [
      {
        articleNo: '314075',
        description: 'Mandarin Afourer Md',
        volume: 'each',
        ordered: 6,
        supplied: 6,
        price: 0.64,
        subs: 'no',
        amount: 3.54,
      },
    ],
  },
  {
    no: 10,
    articleNo: '187314',
    description: 'Broccolini Bunch',
    volume: 'each',
    ordered: 2,
    supplied: 2,
    price: 3.7,
    subs: 'yes',
    amount: 7.4,
    location: 'A8 B36 S5',
    zone: 'chilled',
  },
  {
    no: 11,
    articleNo: '137102',
    description: 'Cucumber Continental',
    volume: 'each',
    ordered: 1,
    supplied: 1,
    price: 3.5,
    subs: 'yes',
    amount: 3.5,
    location: 'A2 B20 S4',
    zone: 'chilled',
  },
  {
    no: 12,
    articleNo: '31370',
    description: 'Essentials Coconut Cream 400ml',
    volume: '400ml',
    ordered: 1,
    supplied: 1,
    price: 1.7,
    subs: 'no',
    amount: 1.7,
    location: 'A4 B9 S1',
    zone: 'ambient',
  },
  {
    no: 13,
    articleNo: '160857',
    description: 'Macro FR Chicken Schnitzel 350g 2pk',
    volume: '350g',
    ordered: 2,
    supplied: 2,
    price: 9.0,
    subs: 'yes',
    amount: 18.0,
    location: 'A6 B42 S3',
    zone: 'freezer',
  },
  {
    no: 14,
    articleNo: '254623',
    description: 'Macro Grass Fed Beef Chuck Steak',
    volume: '380g - 800g',
    ordered: 1,
    supplied: 1,
    price: 18.8,
    subs: 'yes',
    amount: 13.82,
    location: 'A10 B33 S2',
    zone: 'chilled',
    weights: [588],
    shopFloor: true,
  },
  {
    no: 15,
    articleNo: '6026225',
    description: 'WW Greek Style Chicken Steaks 500g',
    volume: '500g',
    ordered: 1,
    supplied: 1,
    price: 9.0,
    subs: 'yes',
    amount: 9.0,
    location: 'A5 B27 S4',
    zone: 'chilled',
  },
  {
    no: 16,
    articleNo: '83172',
    description: 'WW Chicken Roasting Portions Italian',
    volume: '1.5kg - 2kg',
    ordered: 1,
    supplied: 1,
    price: 14.0,
    subs: 'yes',
    amount: 12.85,
    location: 'A9 B16 S1',
    zone: 'freezer',
    weights: [1836],
  },
  {
    no: 17,
    articleNo: '969723',
    description: 'WW RSPCA Chicken Breast Fillets Bulk',
    volume: '1.3kg - 1.7kg',
    ordered: 1,
    supplied: 1,
    price: 18.7,
    subs: 'yes',
    amount: 17.6,
    location: 'A6 B44 S5',
    zone: 'chilled',
    weights: [1600],
    shopFloor: true,
  },
  {
    no: 18,
    articleNo: '39385',
    description: 'Grant Burge Hillcot Merlot 750ml',
    volume: '750ml',
    ordered: 1,
    supplied: 1,
    price: 20.0,
    subs: 'no',
    amount: 20.0,
    location: 'A901 B1 S1',
    zone: 'security',
  },
]

/** Sample NZ pharmacy line item — appended (not duplicated per dataset) to whichever order is
 *  flagged 'pharmacy' on its OrderRow, see getOrderArticles. `no` is reassigned to sit last in
 *  whatever list it's appended to. */
const PHARMACY_ARTICLE: Omit<ArticleRow, 'no'> = {
  articleNo: 'PH10234',
  description: 'Panadol Osteo 665mg 96 Tablets',
  volume: '96 pack',
  ordered: 1,
  supplied: 1,
  price: 15.5,
  subs: 'no',
  amount: 15.5,
  location: 'PHARM 1',
  zone: 'ambient',
  pharmacy: true,
}

export type ArticlesVariant = 'notStarted' | 'picking' | 'dispatched'

/** Maps the order-summary `status` text (e.g. "Awaiting Pick (PST 02:20 PM)", "Picking", "DIS 01:32 PM") to a variant. */
export function getArticlesVariant(statusLabel: string): ArticlesVariant {
  if (statusLabel.startsWith('DIS')) return 'dispatched'
  if (statusLabel.startsWith('Awaiting Pick')) return 'notStarted'
  return 'picking'
}

const ARTICLES_BY_VARIANT: Record<ArticlesVariant, ArticleRow[]> = {
  notStarted: NOT_STARTED_ARTICLES,
  picking: PICKING_ARTICLES,
  dispatched: DISPATCHED_ARTICLES,
}

/** Same dummy set for every order within a variant, plus the sample pharmacy line appended for
 *  whichever orders are flagged 'pharmacy' on their OrderRow (see OrderRow.flags) — per-order
 *  variation beyond that lands later. */
export function getOrderArticles(orderNo: string, statusLabel: string): ArticleRow[] {
  const rows = ARTICLES_BY_VARIANT[getArticlesVariant(statusLabel)]
  const isPharmacyOrder = findOrder(orderNo)?.order.flags.includes('pharmacy') ?? false
  if (!isPharmacyOrder) return rows
  return [...rows, { ...PHARMACY_ARTICLE, no: rows.length + 1 }]
}

export interface ArticleTotals {
  orderedLines: number
  unsuppliedCount: number
  ordered: number
  supplied: number
  price: number
  subsCount: number
  amount: number
}

/** Mirrors `findOrder`'s shape (order-summary/orderGroups.ts) for prev/next-line navigation. */
export function findArticleLine(rows: ArticleRow[], lineNo: number): { row: ArticleRow; index: number; all: ArticleRow[] } | null {
  const index = rows.findIndex((r) => r.no === lineNo)
  if (index === -1) return null
  return { row: rows[index], index, all: rows }
}

export interface SubstituteCatalogItem {
  articleNo: string
  description: string
  brand: string
  variety: string
  generic: string
  volume: string
  price: number
}

/** Small fixed catalog for the "Add Substitute" search dialog — spans brand/variety/generic/volume so every filter has something to match. */
export const SUBSTITUTE_CATALOG: SubstituteCatalogItem[] = [
  { articleNo: '224763', description: 'WW Free Range Eggs XL 12pk 700g', brand: 'WW', variety: 'Free Range', generic: 'Eggs', volume: '700g', price: 6.9 },
  { articleNo: '77170', description: 'Sunny Queen Fms F/Range XL 12pk 700g', brand: 'Sunny Queen', variety: 'Free Range', generic: 'Eggs', volume: '700g', price: 8.8 },
  { articleNo: '6061963', description: 'MuscleNation Yoghurt Vanilla 150g', brand: 'MuscleNation', variety: 'Vanilla', generic: 'Yoghurt', volume: '150g', price: 3.0 },
  { articleNo: '6059944', description: 'Muscle Nation Yoghurt Choc 150g', brand: 'Muscle Nation', variety: 'Chocolate', generic: 'Yoghurt', volume: '150g', price: 3.0 },
  { articleNo: '386952', description: 'Dairy Farmers Lact Free Full Crm Milk 2L', brand: 'Dairy Farmers', variety: 'Lactose Free', generic: 'Milk', volume: '2l', price: 6.1 },
  { articleNo: '148781', description: 'Vitasoy Oat Milky 1L', brand: 'Vitasoy', variety: 'Oat', generic: 'Milk', volume: '1l', price: 2.5 },
  { articleNo: '314075', description: 'Mandarin Afourer Md', brand: 'Generic', variety: 'Afourer', generic: 'Mandarin', volume: 'each', price: 0.64 },
  { articleNo: '201688', description: 'Lindt Excellence 70% Cocoa 100g', brand: 'Lindt', variety: '70% Cocoa', generic: 'Chocolate', volume: '100g', price: 6.8 },
]

/** Article ID matches alone; otherwise brand/variety/generic/volume are ANDed together (substring, case-insensitive). */
export function searchSubstituteCatalog(filters: {
  articleId?: string
  brand?: string
  variety?: string
  generic?: string
  volume?: string
}): SubstituteCatalogItem[] {
  const { articleId, brand, variety, generic, volume } = filters
  const norm = (v?: string) => v?.trim().toLowerCase() ?? ''

  if (norm(articleId)) {
    return SUBSTITUTE_CATALOG.filter((item) => item.articleNo.toLowerCase().includes(norm(articleId)))
  }

  const otherFilters = { brand: norm(brand), variety: norm(variety), generic: norm(generic), volume: norm(volume) }
  if (!Object.values(otherFilters).some(Boolean)) return []

  return SUBSTITUTE_CATALOG.filter((item) =>
    (!otherFilters.brand || item.brand.toLowerCase().includes(otherFilters.brand)) &&
    (!otherFilters.variety || item.variety.toLowerCase().includes(otherFilters.variety)) &&
    (!otherFilters.generic || item.generic.toLowerCase().includes(otherFilters.generic)) &&
    (!otherFilters.volume || item.volume.toLowerCase().includes(otherFilters.volume))
  )
}

export function computeArticleTotals(rows: ArticleRow[]): ArticleTotals {
  return rows.reduce<ArticleTotals>(
    (totals, row) => {
      // Weighed items are supplied one weigh-in at a time — count weight entries (+1 each), not
      // the row's own `supplied` value, which for loose/weighed produce can be a kg quantity
      // rather than a unit count.
      const suppliedCount = row.weights ? row.weights.length : row.supplied
      const substitutesAmount = (row.substitutes ?? []).reduce((sum, sub) => sum + (sub.amount ?? 0), 0)
      const effectiveAmount = suppliedCount > 0 ? row.amount : substitutesAmount
      return {
        orderedLines: totals.orderedLines + 1,
        unsuppliedCount: totals.unsuppliedCount + (suppliedCount === 0 ? 1 : 0),
        ordered: totals.ordered + row.ordered,
        supplied: totals.supplied + suppliedCount,
        price: totals.price + row.price,
        subsCount: totals.subsCount + ((row.substitutes && row.substitutes.length > 0) || row.silentSub ? 1 : 0),
        amount: totals.amount + effectiveAmount,
      }
    },
    { orderedLines: 0, unsuppliedCount: 0, ordered: 0, supplied: 0, price: 0, subsCount: 0, amount: 0 }
  )
}
