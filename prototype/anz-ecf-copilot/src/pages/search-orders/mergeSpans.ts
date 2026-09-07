import type { MergeSpan } from './SearchResultRow'

/** For a column of values, returns a rowSpan for the first row of each run of consecutive equal
 * values, and null for the rows a run covers (so the caller skips rendering a cell for them). */
export function computeMergeSpans(values: string[]): MergeSpan[] {
  const spans: MergeSpan[] = new Array(values.length).fill(null)
  let i = 0
  while (i < values.length) {
    let j = i + 1
    while (j < values.length && values[j] === values[i]) j++
    spans[i] = j - i
    i = j
  }
  return spans
}
