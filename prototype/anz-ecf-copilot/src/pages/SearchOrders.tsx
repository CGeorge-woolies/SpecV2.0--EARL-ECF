import { useState } from 'react'
import { SearchFilters } from './search-orders/SearchFilters'
import { SearchResultsTable } from './search-orders/SearchResultsTable'
import { filterOrders, type SearchFilterValues } from './search-orders/filterOrders'
import { getFlattenedOrders, getFlattenedOrdersAllStores, type OrderRow } from './order-summary/orderGroups'

export default function SearchOrders() {
  const [results, setResults] = useState<OrderRow[] | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleSearch = (values: SearchFilterValues) => {
    const sourceRows = values.searchAllStores ? getFlattenedOrdersAllStores() : getFlattenedOrders()
    setResults(filterOrders(sourceRows, values))
    setSelectedIds(new Set())
  }

  const handleReset = () => {
    setResults(null)
    setSelectedIds(new Set())
  }

  return (
    <div className="min-h-full -m-6">
      <SearchFilters onSearch={handleSearch} onReset={handleReset} />
      {results !== null && (
        <SearchResultsTable rows={results} selectedIds={selectedIds} onSelectedIdsChange={setSelectedIds} />
      )}
    </div>
  )
}
