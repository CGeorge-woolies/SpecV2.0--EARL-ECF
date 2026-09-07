import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AutocompleteInput } from '@/components/shared/AutocompleteInput'
import tokens from '@/theme/tokens'
import { SUBSTITUTE_CATALOG, searchSubstituteCatalog, type SubstituteCatalogItem } from '@/pages/order-detail/articlesData'
import { accent } from '@/pages/order-detail/lineAccents'

interface OrderedArticle {
  description: string
  volume: string
  price: number
}

// Same pattern as SearchFilters.tsx's ORDER_NO_SUGGESTIONS/CUSTOMER_NAME_SUGGESTIONS — dedup'd,
// sorted values pulled from the mock catalog rather than a separately hand-maintained list.
const uniqueSorted = (values: string[]) => Array.from(new Set(values)).sort()
const ARTICLE_ID_SUGGESTIONS = uniqueSorted(SUBSTITUTE_CATALOG.map((i) => i.articleNo))
const BRAND_SUGGESTIONS = uniqueSorted(SUBSTITUTE_CATALOG.map((i) => i.brand))
const VARIETY_SUGGESTIONS = uniqueSorted(SUBSTITUTE_CATALOG.map((i) => i.variety))
const GENERIC_SUGGESTIONS = uniqueSorted(SUBSTITUTE_CATALOG.map((i) => i.generic))
const VOLUME_SUGGESTIONS = uniqueSorted(SUBSTITUTE_CATALOG.map((i) => i.volume))

function FilterField({
  label,
  value,
  onChange,
  suggestions,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  suggestions: string[]
}) {
  return (
    <div className="flex flex-col" style={{ gap: tokens.spaceInternalXsmall }}>
      <AutocompleteInput placeholder={label} value={value} onChange={onChange} suggestions={suggestions} />
    </div>
  )
}

const headerCellClass = 'px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-left border-b'
const bodyCellClass = 'px-3 py-2.5 text-sm text-foreground align-middle border-b'

// Same stepper treatment as the Articles table's SuppliedInput (chevrons at the left edge,
// revealed on hover/focus) — simplified since there's no committed/dirty state here, just a
// quantity typed in before Select is enabled.
function QuantityInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="group relative inline-flex items-center">
      <div className="absolute left-0.5 top-1/2 -translate-y-1/2 flex flex-col opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault()
            onChange(value + 1)
          }}
        >
          <ChevronUp className="size-3" style={{ color: accent.slt.border }} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault()
            onChange(Math.max(0, value - 1))
          }}
        >
          <ChevronDown className="size-3" style={{ color: accent.slt.border }} />
        </button>
      </div>
      <input
        type="number"
        min={0}
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="w-16 h-8 rounded-md border bg-background pl-5 pr-1 text-right text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        style={{ borderColor: tokens.colorBorderDefault }}
      />
    </div>
  )
}

export function SubstituteSearchDialog({
  open,
  orderedArticle,
  onClose,
  onSelect,
}: {
  open: boolean
  orderedArticle: OrderedArticle
  onClose: () => void
  onSelect: (item: SubstituteCatalogItem, quantity: number) => void
}) {
  const [articleId, setArticleId] = useState('')
  const [brand, setBrand] = useState('')
  const [variety, setVariety] = useState('')
  const [generic, setGeneric] = useState('')
  const [volume, setVolume] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<SubstituteCatalogItem[]>([])
  // Quantity typed into each result row's Supplied field before Select is clicked — keyed by
  // articleNo, not carried on the catalog item itself.
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const reset = () => {
    setArticleId('')
    setBrand('')
    setVariety('')
    setGeneric('')
    setVolume('')
    setHasSearched(false)
    setResults([])
    setQuantities({})
  }

  const handleSearch = () => {
    setResults(searchSubstituteCatalog({ articleId, brand, variety, generic, volume }))
    setHasSearched(true)
  }

  const handleSelect = (item: SubstituteCatalogItem) => {
    onSelect(item, quantities[item.articleNo] ?? 0)
    reset()
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset()
          onClose()
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[1200px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-96px)] overflow-y-auto bg-background rounded-xl p-8 shadow-2xl outline-none">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title style={{ fontSize: tokens.fontSizeBodyLg, fontWeight: 700, color: tokens.colorTextStrong }}>
              Substitute Search
            </Dialog.Title>
            <Button
              variant="outline"
              onClick={() => {
                reset()
                onClose()
              }}
            >
              Close
            </Button>
          </div>

          <div className="grid grid-cols-[280px_1fr]" style={{ gap: tokens.spaceContentSmall }}>
            <form
              className="flex flex-col"
              style={{ gap: tokens.spaceInternalMedium }}
              onSubmit={(e) => {
                e.preventDefault()
                handleSearch()
              }}
            >
              <FilterField label="Article ID" value={articleId} onChange={setArticleId} suggestions={ARTICLE_ID_SUGGESTIONS} />
              <div className="flex items-center" style={{ gap: tokens.spaceInternalMedium }}>
                <div className="flex-1 h-px" style={{ backgroundColor: tokens.colorBorderWeak }} />
                <span style={{ fontSize: tokens.fontSizeCaption, fontWeight: 700, color: tokens.colorTextMedium }}>OR</span>
                <div className="flex-1 h-px" style={{ backgroundColor: tokens.colorBorderWeak }} />
              </div>
              <FilterField label="Brand" value={brand} onChange={setBrand} suggestions={BRAND_SUGGESTIONS} />
              <FilterField label="Variety" value={variety} onChange={setVariety} suggestions={VARIETY_SUGGESTIONS} />
              <FilterField label="Generic" value={generic} onChange={setGeneric} suggestions={GENERIC_SUGGESTIONS} />
              <FilterField label="Volume" value={volume} onChange={setVolume} suggestions={VOLUME_SUGGESTIONS} />
              <div className="flex gap-2 mt-2">
                <Button type="submit">Search</Button>
                <Button type="button" variant="outline" onClick={reset}>
                  Clear
                </Button>
              </div>
            </form>

            <div className="flex flex-col" style={{ gap: tokens.spaceContentSmall }}>
              <div
                className="rounded-md p-4"
                style={{ border: `1px solid ${tokens.colorBorderWeak}`, backgroundColor: tokens.colorBgSecondary }}
              >
                <Badge variant="outline" className="mb-2">
                  ORDERED ARTICLE
                </Badge>
                <h4 style={{ fontSize: tokens.fontSizeBodyMd, fontWeight: 700, color: tokens.colorTextStrong }}>
                  {orderedArticle.description}
                </h4>
                <div className="flex flex-col mt-2" style={{ gap: tokens.spaceInternalXsmall, fontSize: tokens.fontSizeBodySm }}>
                  <span style={{ color: tokens.colorTextMedium }}>
                    Volume <span style={{ color: tokens.colorTextStrong, fontWeight: 600 }}>{orderedArticle.volume}</span>
                  </span>
                  <span style={{ color: tokens.colorTextMedium }}>
                    Ordered Price{' '}
                    <span style={{ color: tokens.colorTextStrong, fontWeight: 600 }}>${orderedArticle.price.toFixed(2)}</span>
                  </span>
                </div>
              </div>

              <h4 style={{ fontSize: tokens.fontSizeBodyMd, fontWeight: 700, color: tokens.colorTextStrong }}>Search Results</h4>

              {!hasSearched ? (
                <p className="italic text-center py-8" style={{ fontSize: tokens.fontSizeBodySm, color: tokens.colorTextMedium }}>
                  Please search for a substitution article.
                </p>
              ) : results.length === 0 ? (
                <p className="italic text-center py-8" style={{ fontSize: tokens.fontSizeBodySm, color: tokens.colorTextMedium }}>
                  No matching articles found.
                </p>
              ) : (
                <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${tokens.colorBorderWeak}` }}>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className={headerCellClass} style={{ borderColor: tokens.colorBorderWeak }}>Article No.</th>
                        <th className={headerCellClass} style={{ borderColor: tokens.colorBorderWeak }}>Brand</th>
                        <th className={headerCellClass} style={{ borderColor: tokens.colorBorderWeak }}>Generic</th>
                        <th className={headerCellClass} style={{ borderColor: tokens.colorBorderWeak }}>Variety</th>
                        <th className={headerCellClass} style={{ borderColor: tokens.colorBorderWeak }}>Volume</th>
                        <th className={`${headerCellClass} text-right`} style={{ borderColor: tokens.colorBorderWeak }}>Price</th>
                        <th className={headerCellClass} style={{ borderColor: tokens.colorBorderWeak }}>Supplied</th>
                        <th className={headerCellClass} style={{ borderColor: tokens.colorBorderWeak }} aria-hidden />
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((item) => {
                        const qty = quantities[item.articleNo] ?? 0
                        return (
                          <tr key={item.articleNo}>
                            <td className={bodyCellClass} style={{ borderColor: tokens.colorBorderWeak }}>{item.articleNo}</td>
                            <td className={bodyCellClass} style={{ borderColor: tokens.colorBorderWeak }}>{item.brand}</td>
                            <td className={bodyCellClass} style={{ borderColor: tokens.colorBorderWeak }}>{item.generic}</td>
                            <td className={bodyCellClass} style={{ borderColor: tokens.colorBorderWeak }}>{item.variety}</td>
                            <td className={bodyCellClass} style={{ borderColor: tokens.colorBorderWeak }}>{item.volume}</td>
                            <td className={`${bodyCellClass} text-right`} style={{ borderColor: tokens.colorBorderWeak }}>
                              ${item.price.toFixed(2)}
                            </td>
                            <td className={bodyCellClass} style={{ borderColor: tokens.colorBorderWeak }}>
                              <QuantityInput
                                value={qty}
                                onChange={(v) => setQuantities((prev) => ({ ...prev, [item.articleNo]: v }))}
                              />
                            </td>
                            <td className={bodyCellClass} style={{ borderColor: tokens.colorBorderWeak }}>
                              <Button size="sm" disabled={qty <= 0} onClick={() => handleSelect(item)}>
                                Select
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
