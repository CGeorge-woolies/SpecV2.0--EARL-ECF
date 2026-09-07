import { Fragment, useState } from 'react'
import { toast } from 'sonner'
import { Trash2, MoreVertical, ShoppingBag } from 'lucide-react'
import { ChevronRightFilled, KeyboardArrowDownFilled, PrintFilled } from '@/components/icons/material-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import tokens from '@/theme/tokens'
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog'
import { getOrderArticles, type ArticleRow } from './articlesData'
import { getOrderTotes, ZONE_CONFIG, type PrinterOption, type Tote, type ToteZone } from './labelsData'
import { OrderSummaryCard } from './OrderSummaryCard'
import { PrintLabelsDialog } from './PrintLabelsDialog'

interface PendingDelete {
  ids: string[]
  /** Set when deleting a single row (drives the "N - Zone" wording); omitted for bulk deletes. */
  single?: Tote
}

// While an order is on hold (status "Awaiting Pick (PST HH:MM AM/PM)"), its totes exist but picking
// hasn't started — show every row as "Awaiting Pick" (like the order-summary "not started" state)
// rather than the tote's underlying Packed/Picking status.
const AWAITING_PICK_STATUS_STYLE = { color: tokens.colorTextMedium, borderColor: tokens.colorBorderDefault, backgroundColor: tokens.colorBgSecondary }
const AWT_HOLD_STATUS_PATTERN = /^Awaiting Pick \(PST/

const STATUS_STYLE: Record<Tote['status'], { color: string; borderColor: string; backgroundColor: string }> = {
  Packed: { color: tokens.colorAlertSuccessIcon, borderColor: tokens.colorAlertSuccessBorder, backgroundColor: tokens.colorAlertSuccessBg },
  Picking: { color: tokens.colorAlertInfoIcon, borderColor: tokens.colorAlertInfoBorder, backgroundColor: tokens.colorAlertInfoBg },
  'Awaiting Pick': AWAITING_PICK_STATUS_STYLE,
}

// Matches the "Deleted" order-summary treatment (red text/pill, strikethrough) — see rowHighlightStyle in OrdersTable.tsx.
const DELETED_STATUS_STYLE = { color: tokens.colorAlertErrorIcon, borderColor: tokens.colorAlertErrorBorder, backgroundColor: tokens.colorAlertErrorBg }
const DELETED_TEXT_STYLE = { color: tokens.colorAlertErrorIcon, textDecoration: 'line-through' as const }

const headerCellClass = 'px-2 py-[5px] text-xs font-semibold uppercase tracking-widest text-muted-foreground text-left border-b border-border select-none'
const bodyCellClass = 'px-2 py-2.5 text-sm text-foreground border-b border-border'
const checkboxCellClass = 'w-10 px-2 py-2.5 text-center border-b border-border'
const chevronCellClass = 'w-8 px-1 py-2.5 text-center border-b border-border'
const kebabCellClass = 'w-10 px-2 py-2.5 text-center border-b border-border'

const articleColDividerClass = 'border-r border-border'
const articleHeaderCellClass = 'px-2 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-left border-b border-border select-none'
const articleBodyCellClass = 'px-2 py-1.5 text-sm text-foreground border-b border-border'

function formatToteNoList(toteNumbers: number[]) {
  const labels = toteNumbers.map((n) => `#${n}`)
  if (labels.length === 1) return labels[0]
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

// The description strings in articlesData.ts often lead with a recognizable brand token —
// split it off so the Labels tab can show Brand/Generic as separate columns (for label printing).
const KNOWN_BRAND_PREFIXES: [string, string][] = [
  ['WW ', 'Woolworths'],
  ['Birds Eye ', 'Birds Eye'],
  ['Lindt ', 'Lindt'],
  ["Schwarz ", 'Schwarz'],
  ['Dairy Farmers ', 'Dairy Farmers'],
  ['Sunny Queen ', 'Sunny Queen'],
  ['Macro ', 'Macro'],
  ["Ingham's ", "Ingham's"],
  ["Helga's ", "Helga's"],
  ['Vitasoy ', 'Vitasoy'],
  ['Essentials ', 'Essentials'],
]

function splitBrandGeneric(description: string): { brand: string; generic: string } {
  for (const [prefix, brand] of KNOWN_BRAND_PREFIXES) {
    if (description.startsWith(prefix)) return { brand, generic: description.slice(prefix.length) }
  }
  return { brand: '', generic: description }
}

/** Articles land in whichever tote shares their zone (e.g. alcohol always goes in the Security tote). */
function getToteArticles(orderArticles: ArticleRow[], zone: ToteZone): ArticleRow[] {
  return orderArticles.filter((a) => a.zone === zone)
}

export function LabelsTab({ orderNo, customerName, statusLabel }: { orderNo: string; customerName: string; statusLabel: string }) {
  const [totes, setTotes] = useState<Tote[]>(() => getOrderTotes(orderNo))
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  const [pendingPrintIds, setPendingPrintIds] = useState<string[] | null>(null)

  const orderArticles = getOrderArticles(orderNo, statusLabel)

  const isAwaitingPickOrder = statusLabel === 'Awaiting Pick'
  const isAwtHoldOrder = AWT_HOLD_STATUS_PATTERN.test(statusLabel)

  const selectableTotes = totes.filter((t) => !t.isDeleted)
  const allSelected = selectableTotes.length > 0 && selectedIds.size === selectableTotes.length
  const someSelected = selectedIds.size > 0 && !allSelected

  const toggleAllSelected = (checked: boolean) => {
    setSelectedIds(checked ? new Set(selectableTotes.map((t) => t.id)) : new Set())
  }

  const toggleRowSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => (prev.has(id) ? new Set() : new Set([id])))
  }

  const selectedTotes = totes.filter((t) => selectedIds.has(t.id))
  const canBulkDelete = selectedTotes.length > 0 && selectedTotes.every((t) => t.isManualTote)

  const deleteTotes = (ids: string[]) => {
    setTotes((prev) => prev.map((t) => (ids.includes(t.id) && t.isManualTote ? { ...t, isDeleted: true } : t)))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }

  const printTotes = (ids: string[], printer: PrinterOption) => {
    console.log('[LabelsTab] Print tote labels', ids, 'to', printer)
    toast.success(`Labels sent to ${printer}.`)
  }

  const printBag = (toteId: string, bagNo: number) => {
    console.log('[LabelsTab] Print bag label', toteId, bagNo)
    toast.success(`Bag #${bagNo} label sent to printer.`)
  }

  const deleteBag = (toteId: string, bagNo: number) => {
    setTotes((prev) => prev.map((t) => (t.id === toteId ? { ...t, bagNumbers: t.bagNumbers.filter((n) => n !== bagNo) } : t)))
    toast.success(`Bag #${bagNo} has been deleted.`)
  }

  const pendingPrintTotes = pendingPrintIds ? totes.filter((t) => pendingPrintIds.includes(t.id)) : []

  const confirmPendingPrint = (printer: PrinterOption) => {
    if (!pendingPrintIds) return
    printTotes(pendingPrintIds, printer)
    setPendingPrintIds(null)
  }

  const confirmPendingDelete = () => {
    if (!pendingDelete) return
    // Only report totes that are actually transitioning to deleted in this action — guards
    // against a stale/leftover id in pendingDelete.ids dragging an already-deleted tote into the message.
    const deletedToteNumbers = totes
      .filter((t) => pendingDelete.ids.includes(t.id) && !t.isDeleted)
      .map((t) => t.toteNo)
    deleteTotes(pendingDelete.ids)
    setPendingDelete(null)
    const toteWord = deletedToteNumbers.length === 1 ? 'Tote' : 'Totes'
    toast.success(`${toteWord} ${formatToteNoList(deletedToteNumbers)} ${deletedToteNumbers.length === 1 ? 'has' : 'have'} been deleted successfully`)
  }

  if (isAwaitingPickOrder) {
    return (
      <div className="flex flex-col p-6" style={{ gap: tokens.spaceContentSmall }}>
        <OrderSummaryCard orderNo={orderNo} customerName={customerName} statusLabel={statusLabel} />
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          No totes have been generated for this order.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-6 pb-24" style={{ gap: tokens.spaceContentSmall }}>
      <OrderSummaryCard orderNo={orderNo} customerName={customerName} statusLabel={statusLabel} />

      <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${tokens.colorBorderWeak}` }}>
        <div
          className="flex items-center gap-1 px-3 py-2"
          style={{ backgroundColor: tokens.colorBgTertiary, borderBottom: `1px solid ${tokens.colorBorderWeak}` }}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={!canBulkDelete}
                  onClick={() => setPendingDelete({ ids: selectedTotes.filter((t) => !t.isDeleted).map((t) => t.id) })}
                />
              }
            >
              <Trash2 className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Delete selected totes</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={selectedIds.size === 0}
                  onClick={() => setPendingPrintIds(Array.from(selectedIds))}
                />
              }
            >
              <PrintFilled size={16} />
            </TooltipTrigger>
            <TooltipContent>Print selected tote labels</TooltipContent>
          </Tooltip>

        </div>

        <div style={{ backgroundColor: tokens.colorBgPrimary }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={checkboxCellClass}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={(checked) => toggleAllSelected(Boolean(checked))}
                  />
                </th>
                <th className={chevronCellClass} />
                <th className={headerCellClass}>Tote No.</th>
                <th className={headerCellClass}>Status</th>
                <th className={headerCellClass}>Zone</th>
                <th className={headerCellClass}>Personal Shopper</th>
                <th className={headerCellClass}>Bags</th>
                <th className={kebabCellClass} />
              </tr>
            </thead>
            <tbody>
              {totes.map((tote, index) => {
                const isExpanded = expandedIds.has(tote.id)
                const isSelected = selectedIds.has(tote.id)
                const displayStatus = tote.isDeleted ? 'Deleted' : isAwtHoldOrder ? 'Awaiting Pick' : tote.status
                const statusStyle = tote.isDeleted ? DELETED_STATUS_STYLE : isAwtHoldOrder ? AWAITING_PICK_STATUS_STYLE : STATUS_STYLE[tote.status]
                const zone = ZONE_CONFIG[tote.zone]
                const ZoneIcon = zone.icon
                const canDelete = tote.isManualTote && !tote.isDeleted
                const toteArticles = tote.isManualTote
                  ? []
                  : getToteArticles(orderArticles, tote.zone)

                return (
                  <Fragment key={tote.id}>
                  <tr style={{ backgroundColor: index % 2 === 0 ? tokens.colorBgPrimary : tokens.colorBgSecondary }}>
                    <td className={checkboxCellClass}>
                      {!tote.isDeleted && (
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleRowSelected(tote.id)} />
                      )}
                    </td>
                    <td className={chevronCellClass}>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={() => toggleExpanded(tote.id)}
                        aria-label={isExpanded ? 'Collapse tote' : 'Expand tote'}
                      >
                        {isExpanded ? <KeyboardArrowDownFilled size={16} /> : <ChevronRightFilled size={16} />}
                      </button>
                    </td>
                    <td className={bodyCellClass}>#{tote.toteNo}</td>
                    <td className={bodyCellClass}>
                      <Badge
                        variant="outline"
                        style={{ color: statusStyle.color, borderColor: statusStyle.borderColor, backgroundColor: statusStyle.backgroundColor }}
                      >
                        {displayStatus}
                      </Badge>
                    </td>
                    <td className={bodyCellClass}>
                      <span className="inline-flex items-center gap-1.5" style={tote.isDeleted ? DELETED_TEXT_STYLE : undefined}>
                        <ZoneIcon size={16} style={{ color: tote.isDeleted ? DELETED_TEXT_STYLE.color : tokens.colorTextMedium }} />
                        {zone.label}
                      </span>
                    </td>
                    <td className={bodyCellClass}>
                      <span
                        className={!tote.isDeleted && tote.isManualTote ? 'italic text-muted-foreground' : undefined}
                        style={tote.isDeleted ? DELETED_TEXT_STYLE : undefined}
                      >
                        {tote.personalShopper}
                      </span>
                    </td>
                    <td className={bodyCellClass}>{tote.bagNumbers.length}</td>
                    <td className={kebabCellClass}>
                      {!tote.isDeleted && (
                        <Popover>
                          <PopoverTrigger render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground" />}>
                            <MoreVertical className="size-4" />
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-auto gap-0 overflow-hidden p-0">
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-1.5 text-left text-sm font-normal hover:bg-muted"
                              onClick={() => setPendingPrintIds([tote.id])}
                            >
                              <PrintFilled size={14} />
                              Print
                            </button>
                            <button
                              type="button"
                              disabled={!canDelete}
                              className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-1.5 text-left text-sm font-normal hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                              onClick={() => setPendingDelete({ ids: [tote.id], single: tote })}
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </button>
                          </PopoverContent>
                        </Popover>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="p-0 border-b border-border">
                        <div className="flex gap-3 p-4" style={{ backgroundColor: tokens.colorBgTertiary }}>
                          {tote.bagNumbers.length === 0 ? (
                            <div
                              className="flex w-64 shrink-0 flex-col items-center justify-center gap-3 rounded-lg p-4 text-center"
                              style={{ border: `1px solid ${tokens.colorBorderWeak}`, backgroundColor: tokens.colorBgSecondary }}
                            >
                              <p className="text-sm text-muted-foreground">No bag labels have been generated for this tote.</p>
                            </div>
                          ) : (
                            <div
                              className="flex w-64 shrink-0 flex-col gap-2 rounded-lg p-3"
                              style={{ border: `1px solid ${tokens.colorBorderWeak}`, backgroundColor: tokens.colorBgSecondary }}
                            >
                              {tote.bagNumbers.map((bagNo) => (
                                <div
                                  key={bagNo}
                                  className="flex items-center justify-between gap-2 rounded-md px-3 py-2"
                                  style={{ backgroundColor: tokens.colorBgTertiary }}
                                >
                                  <span className="flex items-center gap-2 text-sm text-foreground">
                                    <ShoppingBag className="size-4 text-muted-foreground" />
                                    Bag #{bagNo}
                                  </span>
                                  <Popover>
                                    <PopoverTrigger render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground" />}>
                                      <MoreVertical className="size-4" />
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-auto gap-0 overflow-hidden p-0">
                                      <button
                                        type="button"
                                        className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-1.5 text-left text-sm font-normal hover:bg-muted"
                                        onClick={() => printBag(tote.id, bagNo)}
                                      >
                                        <PrintFilled size={14} />
                                        Print
                                      </button>
                                      <button
                                        type="button"
                                        className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-1.5 text-left text-sm font-normal hover:bg-muted"
                                        onClick={() => deleteBag(tote.id, bagNo)}
                                      >
                                        <Trash2 className="size-3.5" />
                                        Delete
                                      </button>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                          {toteArticles.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">No articles for this tote.</div>
                          ) : (
                            <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${tokens.colorBorderWeak}` }}>
                              <table className="w-full border-collapse" style={{ backgroundColor: tokens.colorBgPrimary }}>
                                <thead>
                                  <tr>
                                    <th className={`${articleHeaderCellClass} ${articleColDividerClass}`}>No.</th>
                                    <th className={`${articleHeaderCellClass} ${articleColDividerClass}`}>Article No.</th>
                                    <th className={`${articleHeaderCellClass} ${articleColDividerClass}`}>Brand</th>
                                    <th className={`${articleHeaderCellClass} ${articleColDividerClass}`}>Generic</th>
                                    <th className={`${articleHeaderCellClass} ${articleColDividerClass}`}>Variety</th>
                                    <th className={`${articleHeaderCellClass} ${articleColDividerClass} text-right`}>Vol (ml)</th>
                                    <th className={`${articleHeaderCellClass} ${articleColDividerClass} text-right`}>Ordered</th>
                                    <th className={`${articleHeaderCellClass} ${articleColDividerClass} text-right`}>Supplied</th>
                                    <th className={`${articleHeaderCellClass} ${articleColDividerClass} text-right`}>Weight</th>
                                    <th className={`${articleHeaderCellClass} text-right`}>Moved</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {toteArticles.map((article, i) => {
                                    const { brand, generic } = splitBrandGeneric(article.description)
                                    const weight = article.weights?.length ? `${article.weights[article.weights.length - 1]}g` : ''
                                    return (
                                      <tr
                                        key={`${article.articleNo}-${i}`}
                                        style={{ backgroundColor: i % 2 === 0 ? tokens.colorBgPrimary : tokens.colorBgSecondary }}
                                      >
                                        <td className={`${articleBodyCellClass} ${articleColDividerClass}`}>{i + 1}</td>
                                        <td className={`${articleBodyCellClass} ${articleColDividerClass}`}>{article.articleNo}</td>
                                        <td className={`${articleBodyCellClass} ${articleColDividerClass}`}>{brand}</td>
                                        <td className={`${articleBodyCellClass} ${articleColDividerClass}`}>{generic}</td>
                                        <td className={`${articleBodyCellClass} ${articleColDividerClass}`} />
                                        <td className={`${articleBodyCellClass} ${articleColDividerClass} text-right`}>{article.volume}</td>
                                        <td className={`${articleBodyCellClass} ${articleColDividerClass} text-right`}>{article.ordered}</td>
                                        <td className={`${articleBodyCellClass} ${articleColDividerClass} text-right`}>{article.supplied}</td>
                                        <td className={`${articleBodyCellClass} ${articleColDividerClass} text-right`}>{weight}</td>
                                        <td className={`${articleBodyCellClass} text-right`} />
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                )
              })}
              {totes.length === 0 && (
                <tr>
                  <td className={bodyCellClass} colSpan={8}>
                    <div className="py-8 text-center text-sm text-muted-foreground">No totes found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      <PrintLabelsDialog
        open={pendingPrintIds !== null}
        onClose={() => setPendingPrintIds(null)}
        toteNumbers={pendingPrintTotes.map((t) => t.toteNo)}
        onPrint={confirmPendingPrint}
      />

      <UnsavedChangesDialog
        open={pendingDelete !== null}
        onConfirm={confirmPendingDelete}
        onCancel={() => setPendingDelete(null)}
        title="Delete Tote"
        description={
          pendingDelete?.single
            ? <>Are you sure you want to delete <strong>{pendingDelete.single.toteNo} - {ZONE_CONFIG[pendingDelete.single.zone].label}</strong>?</>
            : 'Are you sure you want to delete the selected totes?'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  )
}
