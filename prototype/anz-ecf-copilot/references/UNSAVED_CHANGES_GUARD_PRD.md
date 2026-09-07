# PRD: Unsaved Changes Navigation Guard

## Overview

This document specifies a reusable pattern for warning users before they navigate away from a page with unsaved changes. It covers **every way a user can leave a dirty page** — not just clicking an explicit "back" button — and prescribes the exact hook, component, and wiring needed to implement it consistently across pages.

Without this guard, a user editing a table or form can lose in-progress changes silently by clicking a sidebar link, pressing the browser back button, or closing the tab. This pattern makes data loss an explicit, confirmed choice instead of an accident.

Stack assumptions for this PRD: **React 18 + TypeScript + React Router v6 + Shadcn/ui (Tailwind + Base UI primitives)**. No Material UI / dual-theme branching is included — this is a single-design-system implementation.

---

## 1. Requirements checklist

The guard must intercept and prompt the user in **all** of the following scenarios whenever the current page is "dirty" (has unsaved changes):

| Scenario | Trigger | Result |
|---|---|---|
| Clicking a sidebar/nav link or any in-app `<Link>`/`navigate()` call | In-app navigation | Custom confirmation dialog (see §4) |
| Browser back / forward button | Router POP navigation | Custom confirmation dialog (see §4) |
| Any other programmatic `navigate()` call | Router navigation | Custom confirmation dialog (see §4) |
| Closing the tab, closing the browser, or refreshing the page | `beforeunload` | **Native browser** "Leave site?" prompt — cannot be replaced with custom UI (see gotcha in §7) |

If the page is **not** dirty, none of the above should be intercepted — navigation proceeds normally.

---

## 2. Prerequisite: React Router v6 data router

This pattern depends on React Router v6's real `useBlocker` hook, which **only works with a data router** (`createBrowserRouter` / `createMemoryRouter` + `<RouterProvider>`). It does **not** work with the legacy `<BrowserRouter>` component.

```tsx
// main.tsx or App.tsx — router must be created at module scope
const router = createBrowserRouter([
  // ...routes
])

export default function App() {
  return <RouterProvider router={router} />
}
```

**Gotcha:** Create the router object at module scope, not inside a component body. Re-creating it on every render (e.g. inline inside `App()`) wipes the router's internal history state on every re-render, breaking the blocker and potentially navigation itself.

If the target app currently uses `<BrowserRouter>`, migrating to `createBrowserRouter` is a prerequisite for this pattern — there is no workaround that preserves `<BrowserRouter>` and still catches the back-button case.

---

## 3. `isDirty` tracking convention

Each page owns its own dirty state locally — **there is no global "dirty" context or provider**. Keep it page-local; it composes fine without one.

- **Table pages:** track a `Set<string | number>` of changed row IDs.
- **Form pages:** track a `Set<string>` of changed field names.
- `isDirty` is simply `changedIds.size > 0`.
- On **Save**: commit changes, clear the set → `isDirty` becomes `false`.
- On **Discard**: revert all in-memory state to the last-saved snapshot, clear the set → `isDirty` becomes `false`.

```ts
const [changedIds, setChangedIds] = useState<Set<string>>(new Set())
const isDirty = changedIds.size > 0
```

---

## 4. `useNavigationGuard` hook

This is the core reusable piece. It has no design-system dependency and can be copied verbatim into `src/hooks/useNavigationGuard.ts`:

```ts
import { useEffect, useCallback } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * Blocks navigation when isDirty is true.
 *
 * - Tab close / refresh: native browser "Leave site?" dialog via beforeunload
 * - In-app navigation (sidebar links, back button, programmatic navigate()):
 *   useBlocker intercepts and returns isBlocked=true so the caller can show
 *   a confirmation dialog.
 */
export function useNavigationGuard(isDirty: boolean) {
  const blocker = useBlocker(isDirty)

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const confirm = useCallback(() => {
    if (blocker.state === 'blocked') blocker.proceed()
  }, [blocker])

  const cancel = useCallback(() => {
    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker])

  return {
    isBlocked: blocker.state === 'blocked',
    confirm,
    cancel,
  }
}
```

`useBlocker(isDirty)` passed a boolean means the blocker is only "armed" while `isDirty` is `true` — it automatically stops blocking once changes are saved or discarded, without needing to manually re-subscribe.

---

## 5. Unsaved Changes Dialog component

A single component using Shadcn/Base UI's `AlertDialog` primitives. Reusable both for the navigation guard and for other in-page "are you sure" confirmations (see §8).

```tsx
import { type ReactNode } from 'react'
import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  /** Override the body copy. Defaults to a generic page-navigation warning. */
  description?: ReactNode
  /** Override the confirm button label. Defaults to "Discard and leave". */
  confirmLabel?: string
}

const DEFAULT_DESCRIPTION =
  "You have unsaved changes on this page. Leaving now will discard them — this can't be undone."
const DEFAULT_CONFIRM_LABEL = 'Discard and leave'

export default function UnsavedChangesDialog({
  open,
  onConfirm,
  onCancel,
  description = DEFAULT_DESCRIPTION,
  confirmLabel = DEFAULT_CONFIRM_LABEL,
}: Props) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-black/45 z-[3000]" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[440px] max-w-[calc(100vw-48px)] bg-background rounded-xl p-8 shadow-2xl outline-none">
          <AlertDialog.Title className="text-lg font-bold text-foreground mb-2.5">
            Leave without saving?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground leading-relaxed mb-7">
            {description}
          </AlertDialog.Description>
          <div className="flex gap-2 justify-end">
            <AlertDialog.Close className="group/button inline-flex shrink-0 items-center justify-center h-8 px-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50">
              Go back
            </AlertDialog.Close>
            <Button variant="destructive" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
```

**Default copy:**

| Element | Copy |
|---|---|
| Title | "Leave without saving?" |
| Body | Configurable per page — describes what will be lost. Default: "You have unsaved changes on this page. Leaving now will discard them — this can't be undone." |
| Primary action (destructive) | "Discard and leave" — proceeds with navigation, discards changes. |
| Secondary action | "Go back" — closes the dialog, user stays on the current page. |

---

## 6. Save/Discard Bar (context for wiring)

Not strictly part of the navigation guard, but this is what makes a page "dirty" and gives the guard something to protect. A fixed bar at the bottom of the viewport:

- Visible only when `isDirty === true`; hidden otherwise.
- Approximately 64px tall.
- Message (left-aligned): "You have unsaved changes."
- Two buttons (right-aligned): **Discard** (outlined/secondary) and **Save** (primary/filled).
- Page content area gets bottom padding equal to the bar height so content isn't obscured.

```tsx
export const SAVE_BAR_HEIGHT = 64

export default function SaveDiscardBar({
  isDirty,
  onSave,
  onDiscard,
}: {
  isDirty: boolean
  onSave: () => void
  onDiscard: () => void
}) {
  if (!isDirty) return null
  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 border-t bg-background z-[2000]"
      style={{ height: SAVE_BAR_HEIGHT }}
    >
      <span className="text-sm text-muted-foreground">You have unsaved changes.</span>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onDiscard}>Discard</Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  )
}
```

---

## 7. Worked example: wiring it all together on a page

```tsx
function SomePage() {
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set())
  const isDirty = changedIds.size > 0

  const { isBlocked, confirm, cancel } = useNavigationGuard(isDirty)

  const handleSave = () => {
    // ...commit changes
    setChangedIds(new Set())
  }

  const handleDiscard = () => {
    // ...revert to last-saved snapshot
    setChangedIds(new Set())
  }

  return (
    <div style={{ paddingBottom: isDirty ? SAVE_BAR_HEIGHT : 0 }}>
      {/* page content, marking rows/fields as changed into changedIds */}

      <SaveDiscardBar isDirty={isDirty} onSave={handleSave} onDiscard={handleDiscard} />
      <UnsavedChangesDialog open={isBlocked} onConfirm={confirm} onCancel={cancel} />
    </div>
  )
}
```

---

## 8. Extension: reusing the dialog for non-router confirmations

`UnsavedChangesDialog` is generic enough to reuse for in-page "are you sure" prompts that aren't router navigation at all — for example, switching between tabs/sections within a page that each have their own dirty state.

Pattern: instead of driving `open` from `isBlocked`, drive it from local state (e.g. `pendingTarget !== null`), and pass a custom `description` naming the specific thing that will be discarded:

```tsx
const [pendingZone, setPendingZone] = useState<string | null>(null)

<UnsavedChangesDialog
  open={pendingZone !== null}
  onConfirm={() => { commitZoneSwitch(pendingZone!); setPendingZone(null) }}
  onCancel={() => setPendingZone(null)}
  description={`You have unsaved changes to the ${currentZone} zone sequence. Switching to ${pendingZone} will discard them — this can't be undone.`}
  confirmLabel="Discard and switch"
/>
```

This keeps one dialog component and one visual language for "you're about to lose changes," regardless of whether the trigger is router navigation or an in-page control.

---

## 9. Non-goals / gotchas

- **Do not** try to customize the `beforeunload` browser prompt's text or buttons — modern browsers ignore any custom message and show their own fixed native text. The `e.preventDefault()` call is all that's needed to trigger it.
- **Do not** build a global dirty-state context/provider. Keep `isDirty` page-local; it's simpler to reason about and avoids stale-state bugs when multiple pages mount/unmount.
- The router **must** be a data router (`createBrowserRouter`/`createMemoryRouter`) — `useBlocker` throws or silently no-ops otherwise.
- `useBlocker` only intercepts navigations *within the same router instance* — it cannot intercept a user typing a new URL directly into the address bar (that's equivalent to a full page load, covered by `beforeunload` instead).
