# Collapsible Grouped Table — Implementation Spec

Reference implementation: `src/pages/StoreFeatureSwitches.tsx` (shadcn/Tailwind view) in the ANZ Admin Service prototype. Reproduce this pattern for a two-level (group → sub-group → row) collapsible table using shadcn/ui + Tailwind + a plain HTML `<table>`.

## Data shape

Three-level nesting: **Group → SubGroup → Row** (rows may optionally have their own nested child rows, e.g. "sub-switches").

```ts
interface Row {
  id: string
  label: string
  description: string
  // ...whatever fields the row needs (a toggle value, status, etc.)
  children?: Row[]   // optional — for a 4th nesting level, same visual treatment as SubGroup rows but indented further
}

interface SubGroup {
  id: string
  label: string
  rows: Row[]
}

interface Group {
  id: string
  label: string
  subGroups: SubGroup[]
}
```

## Structure: plain `<table>`, not a component library grid

Use a native `<table>` with `<colgroup>` for fixed column widths, `<thead>` (sticky), and a single `<tbody>` containing **every row type** — group headers, sub-group headers, and data rows are all `<tr>` siblings inside one `<tbody>`, grouped visually with React `<Fragment>` per group/sub-group so React keys stay stable during collapse/expand.

```tsx
<table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
  <colgroup>
    <col style={{ width: '36%' }} />
    <col style={{ width: '54%' }} />
    <col style={{ width: '10%' }} />
  </colgroup>
  <thead>{/* sticky header row */}</thead>
  <tbody>
    {groups.map(group => (
      <Fragment key={group.id}>
        {/* group header row */}
        {!collapsed(group.id) && group.subGroups.map(sg => (
          <Fragment key={sg.id}>
            {/* sub-group header row */}
            {!collapsed(sg.id) && sg.rows.map(row => (
              <Fragment key={row.id}>
                {/* data row */}
                {row.children?.map(child => <tr key={child.id}>{/* nested row */}</tr>)}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </Fragment>
    ))}
  </tbody>
</table>
```

Key point: **collapsing is just conditional rendering** — collapsed groups/sub-groups simply don't render their child `<tr>`s. No animation, no height transition. This keeps it simple and avoids layout jank in a table.

## State

```ts
const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
const [collapsedSubGroups, setCollapsedSubGroups] = useState<Set<string>>(new Set())

const toggleGroup = (id: string) =>
  setCollapsedGroups(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
// same pattern for toggleSubGroup
```

Groups/sub-groups default to **expanded** (empty Set = nothing collapsed).

## Row visual treatment (4 distinct row types)

| Row type | Background | Font | Indent (padding-left) | Border | Cursor |
|---|---|---|---|---|---|
| Group header | Light brand tint (e.g. `#EDF4EE`) | 13px, weight 700 | 16px (base cell padding) | 1px bottom border | pointer |
| Sub-group header | Neutral grey tint | 12px, weight 600, muted color | 32px | 1px bottom border | pointer |
| Data row | White / row background | 13px normal | 52px | 1px bottom border (or none on last child) | default |
| Nested child row (optional 4th level) | Slightly different tint (e.g. `#FAFCFA`) than parent rows, to visually recede | 12px, muted color | 68px | 1px bottom border | default |

- Each indent level adds ~16-20px over the previous, so the hierarchy reads visually without needing connector lines. The reference implementation uses an `L`-shaped corner glyph (two small CSS borders forming a corner) before nested child row labels to visually connect them to their parent — optional polish, not required.
- Header rows (`colSpan` across all columns) contain a chevron icon that flips between right (collapsed) and down (expanded), plus the group/sub-group label. Use `lucide-react`'s `ChevronRight` / `ChevronDown` (or whatever icon set the target project uses) at ~16-18px.
- Header row `onClick` toggles collapse state; give it `cursor: pointer` and a `:hover` background darken. Data rows are not clickable as a whole (only their interactive controls, e.g. a switch, are).
- `userSelect: none` on header row text so double-click-to-toggle doesn't select text.

## Sticky header

The `<thead>` needs to stay pinned while the table body scrolls, and the table itself needs a bounded, scrollable viewport (not the whole page). Reference pattern:

- Wrap the `<table>` in a `<div style={{ maxHeight: 'calc(100vh - <space for page chrome>)', overflowY: 'auto' }}>`.
- Give every `<th>` `position: sticky; top: 0; z-index: 4;` plus a background color (can't be transparent, since content scrolls underneath) and a `box-shadow` for a subtle drop-shadow separating header from scrolled content — **do not** put a `filter` on the `<thead>` itself, since `filter` creates a new stacking context that breaks the `z-index` sticky ordering of children.

## Search / filter interaction

If the table supports a search box, filtering should **flatten the hierarchy**: when a query is active, ignore the collapsed state entirely (render everything expanded) and filter groups → subGroups → rows down to only branches that have at least one matching leaf. Also disable the click-to-toggle cursor/handler on headers while search is active, since there's nothing meaningful to collapse.

```ts
const searchActive = query.trim().length > 0
const isGroupCollapsed = searchActive ? false : collapsedGroups.has(group.id)
```

## Row highlighting for "changed" / "dirty" state (optional)

If rows have editable values, track a `changedIds: Set<string>` of ids that differ from their initial value, and tint those rows' background (e.g. pale yellow `#FFFDE7`) so users can see unsaved edits at a glance, even inside a collapsed... — no, only while expanded, since collapsed rows aren't rendered. This pairs naturally with a sticky save/discard bar at the bottom of the page when `changedIds.size > 0`.

## Empty state

If the filtered result set is empty, render a single `<tr>` with one `<td colSpan={numColumns}>` containing a centered "No results" message, rather than an empty table.

## Summary of what makes this pattern work

1. **One flat `<tbody>`, grouped with `<Fragment>`** — not nested `<table>`s, not a tree component. Keeps native table semantics (`colgroup`, alignment, sticky header) intact.
2. **Collapse = conditional render**, not CSS visibility/height animation. Simple and correct for tables.
3. **Visual hierarchy via indent + background tint + font-weight/size step-down**, not connector lines or a tree-view library.
4. **Search bypasses collapse state** by filtering the data itself and forcing full expansion.
