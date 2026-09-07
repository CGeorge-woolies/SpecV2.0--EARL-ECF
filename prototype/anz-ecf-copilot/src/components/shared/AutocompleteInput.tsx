import { useState, type KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  maxSuggestions?: number
}

/** Plain-text input with a filtered, click-or-arrow-key-selectable suggestion list underneath —
 * matches substrings against `suggestions` (case-insensitive), same as the legacy search screen's
 * type-ahead fields. Enter selects the highlighted suggestion if one is highlighted; otherwise it
 * falls through so the surrounding filter form's "Enter submits the search" behaviour still works. */
export function AutocompleteInput({ value, onChange, suggestions, placeholder, maxSuggestions = 12 }: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const query = value.trim().toLowerCase()
  const filtered = query ? suggestions.filter((s) => s.toLowerCase().includes(query)).slice(0, maxSuggestions) : []

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      selectSuggestion(filtered[highlightedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <Input
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value)
          setIsOpen(true)
          setHighlightedIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-input bg-popover p-1 text-popover-foreground shadow-md">
          {filtered.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              className={cn(
                'block w-full rounded-md px-3 py-2 text-left text-sm outline-none',
                index === highlightedIndex ? 'bg-accent' : 'hover:bg-accent',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
