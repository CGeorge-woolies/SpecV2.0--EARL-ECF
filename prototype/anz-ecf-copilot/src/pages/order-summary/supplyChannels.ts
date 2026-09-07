import type { OrderRow } from './orderGroups'

export interface ChannelSupply {
  articles: number
  percent: number
  status: OrderRow['suppliedStatus']
}

/** Deterministic 0..1 value derived from a row id + salt, so the eCom/Shop Floor split is stable across re-renders. */
function seededRatio(seed: string, salt: string): number {
  const str = `${seed}:${salt}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return (Math.abs(hash) % 1000) / 1000
}

function channelStatus(row: OrderRow): OrderRow['suppliedStatus'] {
  if (row.suppliedStatus === 'notStarted' || row.suppliedStatus === 'deleted' || row.suppliedStatus === 'picking') {
    return row.suppliedStatus
  }
  return 'packed'
}

/**
 * Splits an order's articles ~75-85% eCom / 15-25% Shop Floor and derives each channel's
 * supply % and status. eCom's % is solved so the article-weighted average of eCom + Shop
 * Floor exactly reproduces the row's existing suppliedPercent — so when Split Supply View is
 * toggled off and the table falls back to the row's own suppliedPercent/suppliedStatus as
 * "Total Order Supply", that figure is still a true cumulative of the two channels.
 */
export function splitOrderSupply(row: OrderRow): { ecom: ChannelSupply; shopFloor: ChannelSupply } {
  const shopFloorRatio = 0.15 + seededRatio(row.id, 'ratio') * 0.1
  let shopFloorArticles = Math.round(row.articles * shopFloorRatio)
  if (row.articles > 0 && shopFloorArticles === 0) shopFloorArticles = 1
  const ecomArticles = row.articles - shopFloorArticles

  const hasSupply = row.suppliedStatus !== 'notStarted' && row.suppliedStatus !== 'deleted'
  const jitter = Math.round((seededRatio(row.id, 'shopFloor') - 0.5) * 20) // +/-10pp
  const shopFloorPercent = hasSupply ? Math.max(0, Math.min(100, row.suppliedPercent + jitter)) : 0
  const ecomPercent = !hasSupply
    ? 0
    : ecomArticles > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((row.suppliedPercent * row.articles - shopFloorPercent * shopFloorArticles) / ecomArticles)),
        )
      : row.suppliedPercent

  return {
    ecom: { articles: ecomArticles, percent: ecomPercent, status: channelStatus(row) },
    shopFloor: { articles: shopFloorArticles, percent: shopFloorPercent, status: channelStatus(row) },
  }
}
