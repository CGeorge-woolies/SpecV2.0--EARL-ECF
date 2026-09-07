import { useState, type FormEvent } from 'react'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { AutocompleteInput } from '@/components/shared/AutocompleteInput'
import { CalendarTodayFooter } from '@/components/shared/CalendarTodayFooter'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectIcon, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePersona } from '@/context/PersonaContext'
import tokens from '@/theme/tokens'
import { getFlattenedOrders } from '../order-summary/orderGroups'
import { DEFAULT_SEARCH_FILTERS, type SearchFilterValues, type SearchStatusFilter } from './filterOrders'

// Real backing data to suggest against — only fields with an actual matching OrderRow field get
// autocomplete (Customer number/Article No/Barcode/date range stay plain inputs, see filterOrders.ts).
const CUSTOMER_NAME_SUGGESTIONS = Array.from(new Set(getFlattenedOrders().map((row) => row.customer))).sort()
const ORDER_NO_SUGGESTIONS = Array.from(
  new Set(getFlattenedOrders().flatMap((row) => [row.orderNo, row.transitCode].filter((v): v is string => Boolean(v)))),
)

const STATUS_OPTIONS: { value: SearchStatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'awaiting-pick', label: 'Awaiting Pick' },
  { value: 'picking', label: 'Picking' },
  { value: 'packed', label: 'Packed' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'deleted', label: 'Deleted' },
]

const DATE_RANGE_OPTIONS = [
  'Today',
  'Yesterday',
  'Last Week',
  'Last Fortnight',
  'Last Month',
  'Last 3 Months',
  'Last 6 Months',
  'Last Year',
] as const

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

/** Beginning/ending dates implied by each preset, relative to today — only drives the two date fields'
 * displayed values (no per-order date data exists on OrderRow to actually filter results by). */
function computeDateRange(preset: (typeof DATE_RANGE_OPTIONS)[number], today: Date): { begin: Date; end: Date } {
  switch (preset) {
    case 'Today':
      return { begin: today, end: today }
    case 'Yesterday':
      return { begin: addDays(today, -1), end: addDays(today, -1) }
    case 'Last Week':
      return { begin: addDays(today, -7), end: today }
    case 'Last Fortnight':
      return { begin: addDays(today, -14), end: today }
    case 'Last Month':
      return { begin: addMonths(today, -1), end: today }
    case 'Last 3 Months':
      return { begin: addMonths(today, -3), end: today }
    case 'Last 6 Months':
      return { begin: addMonths(today, -6), end: today }
    case 'Last Year':
      return { begin: addMonths(today, -12), end: today }
  }
}

function formatFilterDate(date: Date) {
  return date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

interface SearchFiltersProps {
  onSearch: (values: SearchFilterValues) => void
  onReset: () => void
}

export function SearchFilters({ onSearch, onReset }: SearchFiltersProps) {
  const { isSupportOffice, isCustomerSupport } = usePersona()
  const today = new Date()

  const [status, setStatus] = useState<SearchStatusFilter>(DEFAULT_SEARCH_FILTERS.status)
  const [orderNo, setOrderNo] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerNumber, setCustomerNumber] = useState('')
  const [fraudReference, setFraudReference] = useState('')
  const [articleBarcode, setArticleBarcode] = useState('')
  const [searchAllStores, setSearchAllStores] = useState(false)
  const [dateRangePreset, setDateRangePreset] = useState<(typeof DATE_RANGE_OPTIONS)[number]>('Today')
  const [{ begin, end }, setDateRange] = useState(() => computeDateRange('Today', today))
  const [beginPopoverOpen, setBeginPopoverOpen] = useState(false)
  const [endPopoverOpen, setEndPopoverOpen] = useState(false)

  const handlePresetChange = (preset: (typeof DATE_RANGE_OPTIONS)[number]) => {
    setDateRangePreset(preset)
    setDateRange(computeDateRange(preset, today))
  }

  const handleSearch = () => {
    onSearch({ status, orderNo, customerName, fraudReference, searchAllStores })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const handleReset = () => {
    setStatus(DEFAULT_SEARCH_FILTERS.status)
    setOrderNo('')
    setCustomerName('')
    setCustomerNumber('')
    setFraudReference('')
    setArticleBarcode('')
    setSearchAllStores(false)
    setDateRangePreset('Today')
    setDateRange(computeDateRange('Today', today))
    onReset()
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <form className="w-full max-w-4xl" onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold" style={{ color: tokens.colorTextStrong }}>
          Search by
        </h1>
        {(isSupportOffice || isCustomerSupport) && (
          <label className="flex items-center gap-1.5 cursor-pointer text-sm" style={{ color: tokens.colorTextMedium }}>
            <Checkbox checked={searchAllStores} onCheckedChange={(checked) => setSearchAllStores(checked === true)} />
            Search all stores
          </label>
        )}
      </div>

      <div className="grid grid-cols-3 gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: tokens.colorTextMedium }}>Status</label>
          <Select value={status} onValueChange={(value) => setStatus(value as SearchStatusFilter)}>
            <SelectTrigger className="h-8 w-full justify-between gap-1.5 rounded-lg border border-input px-2.5 text-sm">
              <SelectValue />
              <SelectIcon>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </SelectIcon>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div />
        <div />

        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: tokens.colorTextMedium }}>Order No/Transit code</label>
          <AutocompleteInput value={orderNo} onChange={setOrderNo} suggestions={ORDER_NO_SUGGESTIONS} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: tokens.colorTextMedium }}>Customer name</label>
          <AutocompleteInput value={customerName} onChange={setCustomerName} suggestions={CUSTOMER_NAME_SUGGESTIONS} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: tokens.colorTextMedium }}>Customer number</label>
          <Input value={customerNumber} onChange={(e) => setCustomerNumber(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: tokens.colorTextMedium }}>Fraud reference</label>
          <Input value={fraudReference} onChange={(e) => setFraudReference(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: tokens.colorTextMedium }}>Article No/Barcode</label>
          <Input value={articleBarcode} onChange={(e) => setArticleBarcode(e.target.value)} />
        </div>
        <div />

        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: tokens.colorTextMedium }}>Select date range</label>
          <Select value={dateRangePreset} onValueChange={(value) => handlePresetChange(value as (typeof DATE_RANGE_OPTIONS)[number])}>
            <SelectTrigger className="h-8 w-full justify-between gap-1.5 rounded-lg border border-input px-2.5 text-sm">
              <SelectValue />
              <SelectIcon>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </SelectIcon>
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: tokens.colorTextMedium }}>Beginning 12:00 am on</label>
          <Popover open={beginPopoverOpen} onOpenChange={setBeginPopoverOpen}>
            <PopoverTrigger render={<Button variant="outline" className="h-8 w-full justify-start gap-1.5 font-normal" />}>
              <CalendarIcon className="size-3.5" style={{ color: tokens.colorIconMedium }} />
              {formatFilterDate(begin)}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={begin} onSelect={(date) => date && setDateRange((prev) => ({ ...prev, begin: date }))} />
              <CalendarTodayFooter
                onClick={() => {
                  setDateRange((prev) => ({ ...prev, begin: new Date() }))
                  setBeginPopoverOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" style={{ color: tokens.colorTextMedium }}>Ending 11:59 pm on</label>
          <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
            <PopoverTrigger render={<Button variant="outline" className="h-8 w-full justify-start gap-1.5 font-normal" />}>
              <CalendarIcon className="size-3.5" style={{ color: tokens.colorIconMedium }} />
              {formatFilterDate(end)}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={end} onSelect={(date) => date && setDateRange((prev) => ({ ...prev, end: date }))} />
              <CalendarTodayFooter
                onClick={() => {
                  setDateRange((prev) => ({ ...prev, end: new Date() }))
                  setEndPopoverOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4" style={{ borderTop: `1px solid ${tokens.colorBorderWeak}` }}>
        <Button type="submit">Search</Button>
        <Button type="button" variant="outline" onClick={handleReset}>Reset Filters</Button>
      </div>
      </form>
    </div>
  )
}
