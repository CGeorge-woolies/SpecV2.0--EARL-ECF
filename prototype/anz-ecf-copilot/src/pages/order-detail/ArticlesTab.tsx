import { Fragment, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownRight, CornerLeftUp } from 'lucide-react'
import { ChevronRightFilled, KeyboardArrowDownFilled, Storefront, ConveyorBeltFilled, FlagPharmacy } from '@/components/icons/material-icons'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useStore } from '@/context/StoreContext'
import { useOrderArticles } from '@/context/OrderArticlesContext'
import AlertMessageDialog from '@/components/shared/AlertMessageDialog'
import tokens from '@/theme/tokens'
import { getArticlesVariant, computeArticleTotals, type ArticleSubRow } from './articlesData'
import { accent, TypeBadge } from './lineAccents'
import { SuppliedInput, SaveButton, DisabledSuppliedInput, type CellEditState } from './SuppliedInput'
import { AddWeightDialog } from './AddWeightDialog'
import { OrderSummaryCard } from './OrderSummaryCard'
import { MoveLineDialog } from './MoveLineDialog'
import { MoveOrderDialog } from './MoveOrderDialog'

// Checkboxes only ever appear for eStore, so the select column's own leading <td>/<th> is
// rendered conditionally wherever a row would otherwise be misaligned.
const selectCellClass = 'w-10 px-2 align-middle'

// The Checkbox/Storefront-icon content itself is centered with flex — text-align on the cell
// isn't reliable since Checkbox renders as a fixed-size flex box, not inline content.
function SelectCellContent({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-center">{children}</div>
}

const colDividerClass = 'border-r border-border'
const headerCellClass = 'px-2 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-left border-b border-border select-none'
const bodyCellBase = 'px-2 py-3 text-sm text-foreground align-middle'
const bodyCellClass = `${bodyCellBase} border-b border-border`
const numericCellClass = `${bodyCellClass} text-right`
// Slim column that only ever holds the Save button — keeps it out of the Supplied column
// entirely so that column never resizes as Save appears/disappears. A fixed-size button slot
// is always rendered here (just invisible when not needed) so the column's own width never
// changes either — that's what actually stops the table from reflowing.
const SAVE_COL_WIDTH = 44
const saveCellClass = `${bodyCellClass} ${colDividerClass} text-center`

function formatMoney(value: number | undefined) {
  if (value === undefined) return ''
  return `$${value.toFixed(2)}`
}

// Renders the No./badge column's cell for one row within a group. Groups (main row + its
// weight/SLT/SUB rows) look "merged" by keeping the parent row's background and only drawing
// the bottom border on the group's last row — each cell still sits in its own <tr>, so its
// content stays vertically centered on that row's actual height instead of an equal-height slice.
function LeftCell({ content, bg, isLast, style }: { content: ReactNode; bg: string; isLast: boolean; style?: CSSProperties }) {
  return (
    <td className={`${isLast ? bodyCellClass : bodyCellBase} ${colDividerClass} text-center`} style={{ backgroundColor: bg, ...style }}>
      {content}
    </td>
  )
}

function SubRow({
  row,
  colorBg,
  colorText,
  leftCell,
  selectCell,
  icon: Icon = CornerDownRight,
  suppliedSlot,
  saveSlot,
}: {
  row: ArticleSubRow
  colorBg: string
  colorText: string
  leftCell: ReactNode
  /** Blank filler for the eStore select column — sub-rows aren't individually selectable. */
  selectCell?: ReactNode
  icon?: typeof CornerDownRight
  suppliedSlot?: ReactNode
  saveSlot?: ReactNode
}) {
  const cellStyle = { color: colorText }
  return (
    <tr style={{ backgroundColor: colorBg }}>
      {selectCell}
      {leftCell}
      <td className={`${bodyCellClass} ${colDividerClass}`} style={cellStyle}>
        <span className="inline-flex items-center gap-1">
          <Icon className="size-3.5 shrink-0" style={{ color: colorText }} />
          {row.articleNo}
        </span>
      </td>
      <td className={`${bodyCellClass} ${colDividerClass}`} style={cellStyle}>{row.description}</td>
      <td className={`${bodyCellClass} ${colDividerClass}`} style={cellStyle}>{row.volume}</td>
      <td className={`${numericCellClass} ${colDividerClass}`} style={cellStyle}>{row.ordered}</td>
      <td className={numericCellClass} style={cellStyle}>{suppliedSlot ?? row.supplied}</td>
      <td className={saveCellClass} style={{ backgroundColor: colorBg }}>{saveSlot}</td>
      <td className={`${numericCellClass} ${colDividerClass}`} style={cellStyle}>{formatMoney(row.price)}</td>
      <td className={`${bodyCellClass} ${colDividerClass}`} style={cellStyle}>{row.subs ?? ''}</td>
      <td className={numericCellClass} style={cellStyle}>{formatMoney(row.amount)}</td>
    </tr>
  )
}

export function ArticlesTab({
  orderNo,
  customerName,
  statusLabel,
  onDirtyChange,
  onSelectedLineCountChange,
  moveLineDialogOpen,
  onCloseMoveLineDialog,
  moveOrderDialogOpen,
  onCloseMoveOrderDialog,
}: {
  orderNo: string
  customerName: string
  statusLabel: string
  /** Reports whether any inline Supplied edit is unsaved, so the page-level navigation guard
   *  (and the in-page tab-switch confirmation) can see it. Articles' own edit state stays local
   *  to this component — unlike Details/Instructions, it naturally resets on unmount when the
   *  user switches away from the Articles tab, so no explicit discard hook-up is needed here. */
  onDirtyChange?: (dirty: boolean) => void
  /** eStore only: reports how many lines are selected, so the page-level toolbar's "Move Line
   *  from OSR to Shop Floor" quick action knows whether to enable itself. */
  onSelectedLineCountChange?: (count: number) => void
  /** Controlled from the page-level toolbar's quick action, since that's where the trigger
   *  button lives — the dialog itself still renders here, next to the selection state it acts on. */
  moveLineDialogOpen?: boolean
  onCloseMoveLineDialog?: () => void
  /** Same pattern as the move-line dialog above, but moves every remaining (non-shop-floor) line
   *  in the order rather than just the selected ones. */
  moveOrderDialogOpen?: boolean
  onCloseMoveOrderDialog?: () => void
}) {
  const { isEstore, isNZ } = useStore()
  const variant = getArticlesVariant(statusLabel)
  // Dispatched orders are fully settled/read-only; every other status can still be edited.
  const isEditable = variant !== 'dispatched'

  const navigate = useNavigate()
  const [localArticles, setLocalArticles] = useOrderArticles(orderNo, statusLabel)
  const [cells, setCells] = useState<Record<string, CellEditState>>({})
  const [expandedWeights, setExpandedWeights] = useState<Record<number, boolean>>({})
  const [weightDialogRow, setWeightDialogRow] = useState<number | null>(null)
  const [supplyExceededOpen, setSupplyExceededOpen] = useState(false)
  // eStore-only: which article lines are selected for bulk "Move Line to Shop Floor". Selection
  // is keyed on the row's line number (`no`) rather than `articleNo`, which isn't unique across
  // silent-sub/substitute rows. Lines already on the shop floor aren't selectable — the move is
  // one-way, so there's nothing left to action on them.
  const [selectedLineNos, setSelectedLineNos] = useState<Set<number>>(new Set())

  useEffect(() => {
    onSelectedLineCountChange?.(selectedLineNos.size)
    return () => onSelectedLineCountChange?.(0)
  }, [selectedLineNos, onSelectedLineCountChange])

  const selectableLineNos = useMemo(
    () => (isEditable ? localArticles.filter((row) => !row.shopFloor).map((row) => row.no) : []),
    [isEditable, localArticles]
  )
  const allLinesSelected = selectableLineNos.length > 0 && selectedLineNos.size === selectableLineNos.length
  const someLinesSelected = selectedLineNos.size > 0 && !allLinesSelected

  const toggleAllLinesSelected = (checked: boolean) => {
    setSelectedLineNos(checked ? new Set(selectableLineNos) : new Set())
  }
  const toggleLineSelected = (no: number) => {
    setSelectedLineNos((prev) => {
      const next = new Set(prev)
      if (next.has(no)) next.delete(no)
      else next.add(no)
      return next
    })
  }

  const confirmMoveLineToShopFloor = () => {
    setLocalArticles((prev) => prev.map((row) => (selectedLineNos.has(row.no) ? { ...row, shopFloor: true } : row)))
    setSelectedLineNos(new Set())
    onCloseMoveLineDialog?.()
  }

  const remainingOsrLineCount = localArticles.filter((row) => !row.shopFloor).length

  const confirmMoveOrderToShopFloor = () => {
    setLocalArticles((prev) => prev.map((row) => ({ ...row, shopFloor: true })))
    setSelectedLineNos(new Set())
    onCloseMoveOrderDialog?.()
  }

  const totals = computeArticleTotals(localArticles)

  // A cell only counts as an unsaved edit once its draft actually differs from the committed
  // value — merely having focused-then-blurred a field (which still populates `cells`, see
  // handleBlur below) shouldn't arm the navigation guard on its own.
  const isArticlesDirty = useMemo(() => {
    return localArticles.some((row) => {
      const mainCell = cells[`${row.no}:main`]
      if (mainCell && mainCell.draft !== row.supplied) return true
      if (row.silentSub) {
        const sltCell = cells[`${row.no}:slt`]
        if (sltCell && sltCell.draft !== row.silentSub.supplied) return true
      }
      if (row.substitutes?.some((sub) => {
        const subCell = cells[`${row.no}:sub:${sub.articleNo}`]
        return subCell && subCell.draft !== sub.supplied
      })) return true
      return false
    })
  }, [cells, localArticles])

  useEffect(() => {
    onDirtyChange?.(isArticlesDirty)
    return () => onDirtyChange?.(false)
  }, [isArticlesDirty, onDirtyChange])

  const toggleWeights = (no: number) => {
    setExpandedWeights((prev) => ({ ...prev, [no]: !prev[no] }))
  }

  const cellFor = (key: string, committed: number): CellEditState => cells[key] ?? { draft: committed, dirty: false }

  const handleChange = (key: string, value: number) => {
    setCells((prev) => ({ ...prev, [key]: { draft: value, dirty: false } }))
  }
  const handleFocus = (key: string) => {
    setCells((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], dirty: false } } : prev))
  }
  const handleBlur = (key: string, committed: number) => {
    setCells((prev) => ({ ...prev, [key]: { draft: prev[key]?.draft ?? committed, dirty: true } }))
  }
  const handleSave = (key: string, commit: (value: number) => void) => {
    const cell = cells[key]
    if (cell) commit(cell.draft)
    setCells((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const updateMainSupplied = (no: number, newSupplied: number) => {
    setLocalArticles((prev) =>
      prev.map((r) => (r.no === no ? { ...r, supplied: newSupplied, amount: +(r.price * newSupplied).toFixed(2) } : r))
    )
  }
  const updateSilentSubSupplied = (no: number, newSupplied: number) => {
    setLocalArticles((prev) =>
      prev.map((r) => {
        if (r.no !== no || !r.silentSub) return r
        const amount = r.silentSub.price !== undefined ? +(r.silentSub.price * newSupplied).toFixed(2) : r.silentSub.amount
        return { ...r, silentSub: { ...r.silentSub, supplied: newSupplied, amount } }
      })
    )
  }
  const updateSubstituteSupplied = (no: number, articleNo: string, newSupplied: number) => {
    setLocalArticles((prev) =>
      prev.map((r) => {
        if (r.no !== no || !r.substitutes) return r
        return {
          ...r,
          substitutes: r.substitutes.map((sub) => {
            if (sub.articleNo !== articleNo) return sub
            const amount = sub.price !== undefined ? +(sub.price * newSupplied).toFixed(2) : sub.amount
            return { ...sub, supplied: newSupplied, amount }
          }),
        }
      })
    )
  }
  // Weighed items' `supplied` is a kg quantity (matching `ordered`, e.g. 0.2 for "per 200g"),
  // not a count of weigh-ins — so it's the sum of the recorded gram weights, not weights.length.
  const addWeight = (no: number, grams: number) => {
    const row = localArticles.find((r) => r.no === no)
    if (!row?.weights) return
    const weights = [...row.weights, grams]
    const supplied = +(weights.reduce((sum, w) => sum + w, 0) / 1000).toFixed(3)
    setLocalArticles((prev) =>
      prev.map((r) => (r.no === no ? { ...r, weights, supplied, amount: +(r.price * supplied).toFixed(2) } : r))
    )
    if (supplied > row.ordered) setSupplyExceededOpen(true)
  }
  const removeWeight = (no: number, index: number) => {
    setLocalArticles((prev) =>
      prev.map((r) => {
        if (r.no !== no || !r.weights) return r
        const weights = r.weights.filter((_, i) => i !== index)
        const supplied = +(weights.reduce((sum, w) => sum + w, 0) / 1000).toFixed(3)
        return { ...r, weights, supplied, amount: +(r.price * supplied).toFixed(2) }
      })
    )
  }

  return (
    <div className="flex flex-col p-6" style={{ gap: tokens.spaceContentSmall }}>
      <OrderSummaryCard orderNo={orderNo} customerName={customerName} statusLabel={statusLabel} />

      <Card className="overflow-hidden">
        <CardContent style={{ padding: 0 }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {isEstore && (
                  <th className={`${headerCellClass} ${colDividerClass} ${selectCellClass}`}>
                    {isEditable && (
                      <SelectCellContent>
                        <Checkbox
                          checked={allLinesSelected}
                          indeterminate={someLinesSelected}
                          onCheckedChange={(checked) => toggleAllLinesSelected(Boolean(checked))}
                          aria-label="Select all articles"
                        />
                      </SelectCellContent>
                    )}
                  </th>
                )}
                <th className={`${headerCellClass} ${colDividerClass} text-center`}>No.</th>
                <th className={`${headerCellClass} ${colDividerClass}`}>Article No.</th>
                <th className={`${headerCellClass} ${colDividerClass}`}>Description</th>
                <th className={`${headerCellClass} ${colDividerClass}`}>Volume</th>
                <th className={`${headerCellClass} ${colDividerClass} text-right`}>Ordered</th>
                <th className={`${headerCellClass} text-right`}>Supplied</th>
                <th className={`${headerCellClass} ${colDividerClass}`} style={{ width: SAVE_COL_WIDTH }} aria-hidden />
                <th className={`${headerCellClass} ${colDividerClass} text-right`}>Price</th>
                <th className={`${headerCellClass} ${colDividerClass}`}>Subs</th>
                <th className={`${headerCellClass} text-right`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: tokens.colorBorderWeak, fontWeight: 700 }}>
                {isEstore && <td className={`${bodyCellClass} ${colDividerClass}`} style={{ backgroundColor: tokens.colorBorderWeak }}></td>}
                <td className={`${bodyCellClass} ${colDividerClass}`} colSpan={2}>Totals</td>
                <td className={`${bodyCellClass} ${colDividerClass}`} colSpan={2}>
                  {totals.orderedLines} ordered lines / {totals.unsuppliedCount} unsupplied articles
                </td>
                <td className={`${numericCellClass} ${colDividerClass}`}>{totals.ordered}</td>
                <td className={numericCellClass}>{totals.supplied}</td>
                <td className={saveCellClass} style={{ backgroundColor: tokens.colorBorderWeak }}></td>
                <td className={`${numericCellClass} ${colDividerClass}`}>{formatMoney(totals.price)}</td>
                <td className={`${bodyCellClass} ${colDividerClass}`}>{totals.subsCount}</td>
                <td className={numericCellClass}>{formatMoney(totals.amount)}</td>
              </tr>

              {localArticles.map((row, index) => {
                const hasWeights = !!row.weights
                const hasSilentSub = !!row.silentSub
                const substitutes = row.substitutes ?? []
                const hasSubstitute = substitutes.length > 0

                const mainKey = `${row.no}:main`
                const mainCell = isEditable && !hasWeights ? cellFor(mainKey, row.supplied) : null
                const effectiveSupplied = mainCell ? mainCell.draft : row.supplied
                const isShort = effectiveSupplied < row.ordered
                const showDirtyBorder = !!mainCell?.dirty
                // Shortfall with no substitute found is flagged yellow; a shortfall a substitute
                // already covers just reads as red text on the original (unfulfilled) line. Both
                // are suppressed while the Supplied field is mid-edit-and-unsaved (dirty).
                const isFlagged = !showDirtyBorder && isShort && !hasSubstitute
                const isOutOfStock = !showDirtyBorder && isShort && hasSubstitute
                const isExpanded = !!expandedWeights[row.no]
                const dirtyBorderStyle: CSSProperties | undefined = showDirtyBorder
                  ? { boxShadow: `inset 0 2px 0 ${tokens.colorAlertWarningBorder}, inset 0 -2px 0 ${tokens.colorAlertWarningBorder}` }
                  : undefined
                const cellStyle: CSSProperties = { color: isOutOfStock ? tokens.colorError : undefined, ...dirtyBorderStyle }
                const rowBg = isFlagged ? tokens.colorWarningBg : index % 2 === 0 ? tokens.colorBgSecondary : tokens.colorBgPrimary

                const weightsEmpty = hasWeights && row.weights!.length === 0
                const showWeightContent = hasWeights && isExpanded

                // The No./badge column reads as "merged" across the main row and any weight/SLT/SUB
                // rows beneath it (shared background, no border between them) — but each cell stays
                // in its own <tr> so it's vertically centered on its own row's actual height. The
                // pink/green sub-row tints only apply to columns from Article No. onward.
                const mainIsLast = !hasWeights && !hasSilentSub && !hasSubstitute
                const weightToggleIsLast = hasWeights && !showWeightContent && !hasSilentSub && !hasSubstitute
                const weightContentIsLast = hasWeights && showWeightContent && !hasSilentSub && !hasSubstitute
                const sltIsLast = hasSilentSub && !hasSubstitute

                const sltKey = `${row.no}:slt`
                const sltCell = isEditable && row.silentSub ? cellFor(sltKey, row.silentSub.supplied) : null

                return (
                  <Fragment key={row.no}>
                    <tr
                      className="cursor-pointer hover:brightness-[0.97]"
                      style={{ backgroundColor: rowBg }}
                      onClick={() => navigate(`/order/detail/line?id=${orderNo}&line=${row.no}`)}
                    >
                      {isEstore && (
                        <td
                          className={`${bodyCellClass} ${colDividerClass} ${selectCellClass}`}
                          style={{ backgroundColor: rowBg }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectCellContent>
                            {row.shopFloor ? (
                              <Tooltip>
                                <TooltipTrigger className="inline-flex items-center justify-center">
                                  <Storefront size={16} style={{ color: tokens.colorTextMedium }} />
                                </TooltipTrigger>
                                <TooltipContent>Shop Floor Pick</TooltipContent>
                              </Tooltip>
                            ) : !isEditable ? (
                              // Dispatched: every remaining (never-moved) line was fulfilled
                              // straight off the conveyor rather than via an OSR->Shop Floor
                              // move, so there's nothing to select — no checkbox to show.
                              <Tooltip>
                                <TooltipTrigger className="inline-flex items-center justify-center">
                                  <ConveyorBeltFilled size={16} style={{ color: tokens.colorTextMedium }} />
                                </TooltipTrigger>
                                <TooltipContent>OSR Pick</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Checkbox
                                checked={selectedLineNos.has(row.no)}
                                onCheckedChange={() => toggleLineSelected(row.no)}
                                aria-label={`Select line ${row.no}`}
                              />
                            )}
                          </SelectCellContent>
                        </td>
                      )}
                      <LeftCell content={row.no} bg={rowBg} isLast={mainIsLast} style={dirtyBorderStyle} />
                      <td className={`${bodyCellClass} ${colDividerClass} relative`} style={cellStyle}>
                        {row.articleNo}
                        {/* NZ-only: this line is a pharmacy item — mirrors Order Summary's pharmacy flag. */}
                        {isNZ && row.pharmacy && (
                          <Tooltip>
                            <TooltipTrigger render={<span className="absolute right-2 top-1/2 -translate-y-1/2 flex cursor-default" data-icon-tooltip />}>
                              <FlagPharmacy size={16} className="text-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>Pharmacy item</TooltipContent>
                          </Tooltip>
                        )}
                      </td>
                      <td className={`${bodyCellClass} ${colDividerClass}`} style={cellStyle}>{row.description}</td>
                      <td className={`${bodyCellClass} ${colDividerClass}`} style={cellStyle}>{row.volume}</td>
                      <td className={`${numericCellClass} ${colDividerClass}`} style={cellStyle}>{row.ordered}</td>
                      <td className={numericCellClass} style={cellStyle} onClick={(e) => e.stopPropagation()}>
                        {hasWeights ? (
                          <DisabledSuppliedInput value={row.supplied} />
                        ) : isEditable && mainCell ? (
                          <SuppliedInput
                            committed={row.supplied}
                            draft={mainCell.draft}
                            dirty={mainCell.dirty}
                            maxAllowed={row.ordered}
                            onChange={(v) => handleChange(mainKey, v)}
                            onFocus={() => handleFocus(mainKey)}
                            onBlur={() => handleBlur(mainKey, row.supplied)}
                          />
                        ) : (
                          row.supplied
                        )}
                      </td>
                      <td
                        className={saveCellClass}
                        style={{ backgroundColor: rowBg, ...dirtyBorderStyle }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Weighted rows never show a Save button here — Supplied is derived from
                            the recorded weights below, edited via Add/Remove weight instead. */}
                        {mainCell && (
                          <SaveButton
                            visible={!mainCell.dirty && mainCell.draft !== row.supplied}
                            disabled={mainCell.draft > row.ordered}
                            onClick={() => handleSave(mainKey, (v) => updateMainSupplied(row.no, v))}
                          />
                        )}
                      </td>
                      <td className={`${numericCellClass} ${colDividerClass}`} style={cellStyle}>{formatMoney(row.price)}</td>
                      <td className={`${bodyCellClass} ${colDividerClass}`} style={cellStyle}>{row.subs}</td>
                      <td className={numericCellClass} style={cellStyle}>{formatMoney(row.amount)}</td>
                    </tr>

                    {hasWeights && (
                      <tr style={{ backgroundColor: tokens.colorBgTertiary }}>
                        {isEstore && <td className={`${bodyCellClass} ${colDividerClass}`} style={{ backgroundColor: tokens.colorBgTertiary }}></td>}
                        <LeftCell
                          content={<TypeBadge label="WGHT" bg={accent.wght.bg} border={accent.wght.border} text={accent.wght.text} />}
                          bg={rowBg}
                          isLast={weightToggleIsLast}
                        />
                        <td className={bodyCellClass} colSpan={3}>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger
                                type="button"
                                onClick={() => toggleWeights(row.no)}
                                className="inline-flex items-center justify-center"
                                style={{ color: accent.wght.text }}
                              >
                                {isExpanded ? <KeyboardArrowDownFilled size={16} /> : <ChevronRightFilled size={16} />}
                              </TooltipTrigger>
                              <TooltipContent>{isExpanded ? 'Collapse weights' : 'Expand weights'}</TooltipContent>
                            </Tooltip>
                            <span className="font-semibold">Actual weights ({row.weights!.length} supplied weights)</span>
                          </div>
                        </td>
                        <td className={bodyCellClass}></td>
                        <td className={`${numericCellClass} font-semibold`}>Weight (g)</td>
                        <td className={bodyCellClass} colSpan={4}></td>
                      </tr>
                    )}
                    {/* Locks column widths to the widest weight-row content (the "+ Add weight" /
                        "Remove" buttons) so collapsing/expanding the weight rows below doesn't
                        change the table's column widths. `visibility: collapse` removes the row
                        from the rendered layout (no height) while its cells still count toward
                        the table's auto column-width calculation. */}
                    {hasWeights && (
                      <tr aria-hidden style={{ visibility: 'collapse' }}>
                        {isEstore && <td></td>}
                        <td></td>
                        <td></td>
                        <td></td>
                        <td colSpan={2}>
                          <Button type="button" variant="link" size="xs" className="h-auto p-0">
                            + Add weight
                          </Button>
                        </td>
                        <td>0,000g</td>
                        <td></td>
                        <td colSpan={3}>
                          <Button type="button" variant="link" size="xs" className="h-auto p-0">
                            Remove
                          </Button>
                        </td>
                      </tr>
                    )}
                    {hasWeights &&
                      showWeightContent &&
                      (weightsEmpty ? [null] : row.weights!).map((w, i, arr) => (
                        <tr key={i} style={{ backgroundColor: tokens.colorBgTertiary }}>
                          {isEstore && <td className={`${bodyCellClass} ${colDividerClass}`} style={{ backgroundColor: tokens.colorBgTertiary }}></td>}
                          <LeftCell content={null} bg={rowBg} isLast={weightContentIsLast && i === arr.length - 1} />
                          <td className={bodyCellClass}></td>
                          <td className={bodyCellClass}></td>
                          <td className={`${bodyCellClass} text-right`} colSpan={2}>
                            {i === 0 && isEditable && (
                              <Button
                                type="button"
                                variant="link"
                                size="xs"
                                onClick={() => setWeightDialogRow(row.no)}
                                className="h-auto p-0"
                              >
                                + Add weight
                              </Button>
                            )}
                          </td>
                          <td className={numericCellClass}>{w === null ? '-' : `${w}g`}</td>
                          <td className={bodyCellClass}></td>
                          <td className={bodyCellClass} colSpan={3}>
                            {w !== null && isEditable && (
                              <Button
                                type="button"
                                variant="link"
                                size="xs"
                                onClick={() => removeWeight(row.no, i)}
                                className="h-auto p-0"
                              >
                                Remove
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}

                    {row.silentSub && (
                      <SubRow
                        row={row.silentSub}
                        colorBg={accent.slt.bg}
                        colorText={accent.slt.text}
                        icon={CornerLeftUp}
                        selectCell={isEstore && <td className={`${bodyCellClass} ${colDividerClass}`} style={{ backgroundColor: accent.slt.bg }}></td>}
                        leftCell={
                          <LeftCell
                            content={<TypeBadge label="SLT" bg={accent.slt.bg} border={accent.slt.border} text={accent.slt.text} />}
                            bg={rowBg}
                            isLast={sltIsLast}
                          />
                        }
                        suppliedSlot={
                          sltCell && (
                            <SuppliedInput
                              committed={row.silentSub.supplied}
                              draft={sltCell.draft}
                              dirty={sltCell.dirty}
                              onChange={(v) => handleChange(sltKey, v)}
                              onFocus={() => handleFocus(sltKey)}
                              onBlur={() => handleBlur(sltKey, row.silentSub!.supplied)}
                            />
                          )
                        }
                        saveSlot={
                          sltCell && (
                            <SaveButton
                              visible={!sltCell.dirty && sltCell.draft !== row.silentSub.supplied}
                              onClick={() => handleSave(sltKey, (v) => updateSilentSubSupplied(row.no, v))}
                            />
                          )
                        }
                      />
                    )}
                    {substitutes.map((sub, subIndex) => {
                      const subKey = `${row.no}:sub:${sub.articleNo}`
                      const subCell = isEditable ? cellFor(subKey, sub.supplied) : null
                      const subIsLast = subIndex === substitutes.length - 1
                      return (
                        <SubRow
                          key={sub.articleNo}
                          row={sub}
                          colorBg={accent.sub.bg}
                          colorText={accent.sub.text}
                          selectCell={isEstore && <td className={`${bodyCellClass} ${colDividerClass}`} style={{ backgroundColor: accent.sub.bg }}></td>}
                          leftCell={
                            <LeftCell
                              content={<TypeBadge label="SUB" bg={accent.sub.bg} border={accent.sub.border} text={accent.sub.text} />}
                              bg={rowBg}
                              isLast={subIsLast}
                            />
                          }
                          suppliedSlot={
                            subCell && (
                              <SuppliedInput
                                committed={sub.supplied}
                                draft={subCell.draft}
                                dirty={subCell.dirty}
                                onChange={(v) => handleChange(subKey, v)}
                                onFocus={() => handleFocus(subKey)}
                                onBlur={() => handleBlur(subKey, sub.supplied)}
                              />
                            )
                          }
                          saveSlot={
                            subCell && (
                              <SaveButton
                                visible={!subCell.dirty && subCell.draft !== sub.supplied}
                                onClick={() => handleSave(subKey, (v) => updateSubstituteSupplied(row.no, sub.articleNo, v))}
                              />
                            )
                          }
                        />
                      )
                    })}
                  </Fragment>
                )
              })}

              {localArticles.length === 0 && (
                <tr>
                  <td className={bodyCellClass} colSpan={isEstore ? 11 : 10}>
                    <div className="py-8 text-center text-sm text-muted-foreground">No articles found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AddWeightDialog
        open={weightDialogRow !== null}
        onCancel={() => setWeightDialogRow(null)}
        onSave={(grams) => {
          if (weightDialogRow !== null) addWeight(weightDialogRow, grams)
          setWeightDialogRow(null)
        }}
      />

      <AlertMessageDialog
        open={supplyExceededOpen}
        onDismiss={() => setSupplyExceededOpen(false)}
        title="Article supply exceeded"
        description="Article supply cannot exceed what was ordered. Please review the supplied amount."
      />

      {isEstore && (
        <MoveLineDialog
          open={!!moveLineDialogOpen}
          lineCount={selectedLineNos.size}
          onClose={() => onCloseMoveLineDialog?.()}
          onConfirm={confirmMoveLineToShopFloor}
        />
      )}

      {isEstore && (
        <MoveOrderDialog
          open={!!moveOrderDialogOpen}
          lineCount={remainingOsrLineCount}
          onClose={() => onCloseMoveOrderDialog?.()}
          onConfirm={confirmMoveOrderToShopFloor}
        />
      )}
    </div>
  )
}
