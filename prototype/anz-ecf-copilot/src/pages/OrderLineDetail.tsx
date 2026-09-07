import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import tokens from '@/theme/tokens'
import { useNavigationGuard } from '@/hooks/useNavigationGuard'
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog'
import AlertMessageDialog from '@/components/shared/AlertMessageDialog'
import { useOrderArticles } from '@/context/OrderArticlesContext'
import { findOrder } from '@/pages/order-summary/orderGroups'
import { findArticleLine, getArticlesVariant, type ArticleRow, type SubstituteCatalogItem } from '@/pages/order-detail/articlesData'
import { DetailRow } from '@/pages/order-detail/DetailRow'
import { AddWeightDialog } from '@/pages/order-detail/AddWeightDialog'
import type { CellEditState } from '@/pages/order-detail/SuppliedInput'
import { OrderSummaryCard } from '@/pages/order-detail/OrderSummaryCard'
import { LineDetailToolbar, type LineDetailTab } from '@/pages/order-line-detail/LineDetailToolbar'
import { DetailsTab } from '@/pages/order-line-detail/DetailsTab'
import { SubstituteTab } from '@/pages/order-line-detail/SubstituteTab'
import { SubstituteSearchDialog } from '@/pages/order-line-detail/SubstituteSearchDialog'

function formatMoney(value: number | undefined) {
  if (value === undefined) return ''
  return `$${value.toFixed(2)}`
}

/** `sub:<articleNo>` keys keep each substitute's edit state stable across add/delete, since a
 *  positional index would silently point at the wrong row once an earlier substitute is removed. */
const subKeyFor = (articleNo: string) => `sub:${articleNo}`

export default function OrderLineDetail() {
  const [searchParams] = useSearchParams()
  const orderNo = searchParams.get('id')
  const lineNo = Number(searchParams.get('line'))
  const found = orderNo ? findOrder(orderNo) : null

  const [articles, setArticles] = useOrderArticles(orderNo ?? '', found?.order.status ?? '')
  const lineResult = found ? findArticleLine(articles, lineNo) : null
  const row = lineResult?.row ?? null

  const [activeTab, setActiveTab] = useState<LineDetailTab>('details')
  const [substituteSearchOpen, setSubstituteSearchOpen] = useState(false)
  const [weightDialogOpen, setWeightDialogOpen] = useState(false)
  const [supplyExceededOpen, setSupplyExceededOpen] = useState(false)
  // Draft/dirty state for this line's editable Supplied Quantity fields — same shape/handling as
  // ArticlesTab's `cells`, just scoped to a single row instead of a whole table. Keys: 'main',
  // 'slt', and 'sub:<articleNo>' per substitute.
  const [cells, setCells] = useState<Record<string, CellEditState>>({})

  // Cell drafts are only meaningful for the currently-viewed line — clear them when navigating
  // to a different line (prev/next), rather than carrying stale drafts across rows.
  useEffect(() => {
    setCells({})
  }, [orderNo, lineNo])

  const variant = found ? getArticlesVariant(found.order.status) : 'picking'
  const isEditable = variant !== 'dispatched'
  // "Subs Allowed" is the manual-substitution-during-picking flag — distinct from silent subs
  // (a system-level swap of an equivalent article, always shown on the Details tab regardless).
  // When it's 'no' the Substitute tab doesn't apply to this line at all.
  const subsAllowed = row?.subs === 'yes'

  // If prev/next-line navigation lands on a line where subs aren't allowed while the Substitute
  // tab was active, fall back to Details rather than showing a tab that's no longer offered.
  useEffect(() => {
    if (!subsAllowed) setActiveTab('details')
  }, [subsAllowed])

  const cellFor = (key: string, committed: number): CellEditState => cells[key] ?? { draft: committed, dirty: false }
  const handleChange = (key: string, value: number) => setCells((prev) => ({ ...prev, [key]: { draft: value, dirty: false } }))
  const handleFocus = (key: string) => setCells((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], dirty: false } } : prev))
  const handleBlur = (key: string, committed: number) =>
    setCells((prev) => ({ ...prev, [key]: { draft: prev[key]?.draft ?? committed, dirty: true } }))
  const handleSave = (key: string, commit: (value: number) => void) => {
    const cell = cells[key]
    if (cell) commit(cell.draft)
    setCells((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const substitutes = row?.substitutes ?? []
  const mainCell = row ? cellFor('main', row.supplied) : { draft: 0, dirty: false }
  const sltCell = row?.silentSub ? cellFor('slt', row.silentSub.supplied) : { draft: 0, dirty: false }

  // A cell only counts as an unsaved edit once its draft actually differs from the committed
  // value, same reasoning as ArticlesTab.isArticlesDirty.
  const isLineDirty = Boolean(
    row &&
      ((cells.main && cells.main.draft !== row.supplied) ||
        (row.silentSub && cells.slt && cells.slt.draft !== row.silentSub.supplied) ||
        substitutes.some((sub) => {
          const cell = cells[subKeyFor(sub.articleNo)]
          return cell && cell.draft !== sub.supplied
        }))
  )

  const { isBlocked, confirm, cancel } = useNavigationGuard(isLineDirty)

  if (!found || !row) {
    return (
      <div className="min-h-full -m-6 flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">Order line not found.</p>
      </div>
    )
  }

  const { index, all } = lineResult!
  const prevRow = index > 0 ? all[index - 1] : null
  const nextRow = index < all.length - 1 ? all[index + 1] : null
  const prevLineHref = prevRow ? `/order/detail/line?id=${orderNo}&line=${prevRow.no}` : null
  const nextLineHref = nextRow ? `/order/detail/line?id=${orderNo}&line=${nextRow.no}` : null
  // Guards against the one-render window before the reset effect above runs (e.g. right after
  // Next Line lands on a subs-disallowed row while Substitute was still the active tab).
  const showSubstitute = activeTab === 'substitute' && subsAllowed

  const currentLineNo = row.no
  const updateRow = (updater: (r: ArticleRow) => ArticleRow) => {
    setArticles((prev) => prev.map((r) => (r.no === currentLineNo ? updater(r) : r)))
  }

  const saveMain = () => handleSave('main', (v) => updateRow((r) => ({ ...r, supplied: v, amount: +(r.price * v).toFixed(2) })))
  const saveSilentSub = () =>
    handleSave('slt', (v) => updateRow((r) => (r.silentSub ? { ...r, silentSub: { ...r.silentSub, supplied: v } } : r)))

  const saveSubstitute = (articleNo: string) =>
    handleSave(subKeyFor(articleNo), (v) =>
      updateRow((r) => ({
        ...r,
        substitutes: (r.substitutes ?? []).map((sub) => {
          if (sub.articleNo !== articleNo) return sub
          const amount = sub.price !== undefined ? +(sub.price * v).toFixed(2) : sub.amount
          return { ...sub, supplied: v, amount }
        }),
      }))
    )

  const deleteSubstitute = (articleNo: string) => {
    updateRow((r) => ({ ...r, substitutes: (r.substitutes ?? []).filter((sub) => sub.articleNo !== articleNo) }))
    setCells((prev) => {
      const next = { ...prev }
      delete next[subKeyFor(articleNo)]
      return next
    })
  }

  const handleAddSubstitute = (item: SubstituteCatalogItem, quantity: number) => {
    updateRow((r) => ({
      ...r,
      substitutes: [
        ...(r.substitutes ?? []),
        {
          articleNo: item.articleNo,
          description: item.description,
          volume: item.volume,
          ordered: r.ordered,
          supplied: quantity,
          price: item.price,
          subs: 'no',
          amount: +(item.price * quantity).toFixed(2),
        },
      ],
    }))
    setSubstituteSearchOpen(false)
  }

  // Weighed items' `supplied` is a kg quantity (matching `ordered`), so it's the sum of the
  // recorded gram weights, not a count of weigh-ins — same fix as ArticlesTab's addWeight/removeWeight.
  const addWeight = (grams: number) => {
    if (!row.weights) return
    const weights = [...row.weights, grams]
    const supplied = +(weights.reduce((sum, w) => sum + w, 0) / 1000).toFixed(3)
    updateRow((r) => ({ ...r, weights, supplied, amount: +(r.price * supplied).toFixed(2) }))
    if (supplied > row.ordered) setSupplyExceededOpen(true)
  }
  const removeWeight = (index: number) => {
    if (!row.weights) return
    const weights = row.weights.filter((_, i) => i !== index)
    const supplied = +(weights.reduce((sum, w) => sum + w, 0) / 1000).toFixed(3)
    updateRow((r) => ({ ...r, weights, supplied, amount: +(r.price * supplied).toFixed(2) }))
  }

  const substitutesPrice = substitutes.length > 0 ? substitutes[0].price ?? row.price : row.price
  const substitutesAmount = substitutes.length > 0 ? substitutes.reduce((sum, sub) => sum + (sub.amount ?? 0), 0) : row.amount

  return (
    <div className="min-h-full -m-6">
      <LineDetailToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showSubstituteTab={subsAllowed}
        prevLineHref={prevLineHref}
        nextLineHref={nextLineHref}
      />

      <div className="max-w-[1280px] mx-auto p-6 flex flex-col" style={{ gap: tokens.spaceContentSmall }}>
        <OrderSummaryCard
          orderNo={found.order.orderNo}
          customerName={found.order.customer}
          statusLabel={found.order.status}
          backHref={`/order/detail?id=${orderNo}`}
        />

        <div className="grid grid-cols-3" style={{ gap: tokens.spaceContentSmall }}>
          <Card className="col-span-1 self-start">
            <CardHeader className="gap-2">
              <CardTitle>Line Info</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow label="Line Number" value={row.no} />
              <DetailRow label="Subs Allowed">
                <Checkbox checked={row.subs === 'yes'} disabled />
              </DetailRow>

              <Separator />

              {showSubstitute ? (
                <>
                  <DetailRow label="Supplied Price" value={formatMoney(substitutesPrice)} />
                  <DetailRow label="Invoice Line Amount" value={formatMoney(substitutesAmount)} />
                </>
              ) : (
                <>
                  <DetailRow label="Order Price" value={formatMoney(row.price)} />
                  <DetailRow label="Order Line Amount" value={formatMoney(row.amount)} />
                  <DetailRow label="Order Line Discount" value="$0.00 ( 0% )" />
                </>
              )}
            </CardContent>
          </Card>

          <div className="col-span-2">
            {!showSubstitute ? (
              <DetailsTab
                row={row}
                isEditable={isEditable}
                mainCell={mainCell}
                onMainChange={(v) => handleChange('main', v)}
                onMainFocus={() => handleFocus('main')}
                onMainBlur={() => handleBlur('main', row.supplied)}
                onMainSave={saveMain}
                onAddWeight={() => setWeightDialogOpen(true)}
                onRemoveWeight={removeWeight}
                silentSubCell={sltCell}
                onSilentSubChange={(v) => handleChange('slt', v)}
                onSilentSubFocus={() => handleFocus('slt')}
                onSilentSubBlur={() => handleBlur('slt', row.silentSub?.supplied ?? 0)}
                onSilentSubSave={saveSilentSub}
              />
            ) : (
              <SubstituteTab
                substitutes={substitutes}
                isEditable={isEditable}
                cellFor={(articleNo, committed) => cellFor(subKeyFor(articleNo), committed)}
                onSubstituteChange={(articleNo, v) => handleChange(subKeyFor(articleNo), v)}
                onSubstituteFocus={(articleNo) => handleFocus(subKeyFor(articleNo))}
                onSubstituteBlur={(articleNo, committed) => handleBlur(subKeyFor(articleNo), committed)}
                onSubstituteSave={saveSubstitute}
                onDeleteSubstitute={deleteSubstitute}
                onOpenSearch={() => setSubstituteSearchOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      <SubstituteSearchDialog
        open={substituteSearchOpen}
        orderedArticle={{ description: row.description, volume: row.volume, price: row.price }}
        onClose={() => setSubstituteSearchOpen(false)}
        onSelect={handleAddSubstitute}
      />

      <AddWeightDialog
        open={weightDialogOpen}
        onCancel={() => setWeightDialogOpen(false)}
        onSave={(grams) => {
          addWeight(grams)
          setWeightDialogOpen(false)
        }}
      />

      <AlertMessageDialog
        open={supplyExceededOpen}
        onDismiss={() => setSupplyExceededOpen(false)}
        title="Article supply exceeded"
        description="Article supply cannot exceed what was ordered. Please review the supplied amount."
      />

      <UnsavedChangesDialog open={isBlocked} onConfirm={confirm} onCancel={cancel} />
    </div>
  )
}
