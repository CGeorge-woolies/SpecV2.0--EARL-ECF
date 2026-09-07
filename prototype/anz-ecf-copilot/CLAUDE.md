# ANZ ECF — Order Management Prototype

## Purpose
High-fidelity React prototype of the front end for an ecommerce order management system (ECF). Built for designer demos to developers. No backend — all data is hardcoded. Focus: visual fidelity, interactions, and clickability.

## Stack
- React 18 + TypeScript + Vite
- React Router v6 (client-side routing, nested routes)
- Shadcn/ui + Tailwind CSS v4 (single design system — no MUI in this repo)
- Node v20.20.1 via nvm at `/Users/tobias/.nvm/versions/node/v20.20.1/bin`

## Playwright Validation
**IMPORTANT: Always ask for explicit user permission before using Playwright (or any browser automation) to validate a change, even if the session is running with bypass-permissions/auto-accept mode enabled.** Do not treat a permissive session mode as covering this — confirm first, every time.

## Dev Server
Run from `/Users/tobias/Desktop/anz-ecf`:
```
npm run dev
```
Opens at http://localhost:5173

## Key Architecture

### Header controls
- **Store selectors** (`StoreToggle`) — two dropdowns in the left region: store type (Supermarket / CFC / eStore) and country (AU / NZ). Changes which UI elements/options appear on pages.
- **Center title** — the current page's nav label (from `NAV_ITEMS`, resolved via `findNavLabel`), with a small subline showing the date/time the page was loaded (captured on `Header` mount).
- **Nav links** — plain text links (Settings, Dash, Reports, Search) in the right region, left of `UserMenu`. Currently placeholders (`href="#"`); not yet wired to routes.
- **UserMenu** — far-right. Shows a person icon, the active persona's label and ID, and a chevron. Clicking opens a dropdown with three persona options — **Store Team (1193644)**, **Support Office (12345678)**, and **Customer Support (98765432)** — that set `activePersona` via `usePersona()`, followed by a **Logout** item (SSO signout trigger in production).
- There is no sidebar in this app — persona switching lives entirely in the header `UserMenu`.

### Contexts (src/context/)
- `PersonaContext.tsx` — holds `activePersona: 'store-team' | 'support-office' | 'customer-support'`, persisted to localStorage (`ecf-persona`)
  - Exposes `isSupportOffice`, `isStoreTeam`, and `isCustomerSupport` convenience booleans
- `StoreContext.tsx` — holds two independent axes, each persisted to localStorage separately:
  - `activeStoreType: 'supermarket' | 'cfc' | 'estore' | null` (`ecf-store-type`)
  - `activeCountry: 'au' | 'nz' | null` (`ecf-country`)
  - Exposes `isSupermarket`, `isCFC`, `isEstore`, `isAU`, `isNZ` convenience booleans

### Provider stack in App.tsx
```
createBrowserRouter([...])  // module scope, not created inside App() — required for useBlocker/useNavigationGuard
  └── RouterProvider
      └── PersonaContextProvider
          └── StoreContextProvider
              └── AppShell (Header + <Outlet />)
```
Uses React Router's data router (`createBrowserRouter` + `<RouterProvider>`), not the legacy `<BrowserRouter>` component — this is required for `useBlocker`, which the unsaved-changes guard depends on (see below). Keep the router object at module scope; recreating it inside `App()` breaks the blocker and navigation history.

### Persona permissions in pages
```tsx
const { isSupportOffice } = usePersona()
{isSupportOffice && <Button>Add Printer</Button>}
```
Document all persona differences in PERSONAS.md as pages are built.

### Store config in pages
```tsx
const { isCFC, isSupermarket, isEstore, isAU, isNZ } = useStore()
{isCFC && <CFCOnlyOption />}
```
Use these booleans to conditionally show UI elements specific to each store type / country.

## Adding a New Page
1. Create `src/pages/MyPage.tsx`
2. Add the route to `src/App.tsx` inside the AppShell `<Route>`
3. Add the nav item to `src/data/navigation.ts`
4. Update PAGES.md with the new entry and status

## Adding a Persona-Restricted Feature
1. Use `usePersona()` hook in the page component
2. Wrap the restricted UI: `{isSupportOffice && <Component />}`
3. Add a row to PERSONAS.md documenting the restriction

## Adding a Store-Config-Specific Feature
1. Use `useStore()` hook in the page component
2. Wrap the config-specific UI: `{isCFC && <Component />}`, `{isSupermarket && <Component />}`, `{isEstore && <Component />}`, `{isAU && <Component />}`, `{isNZ && <Component />}`

## Unsaved Changes Navigation Guard
Full spec: `references/UNSAVED_CHANGES_GUARD_PRD.md`. **Any page or tab that tracks an `isDirty` flag (a save/discard bar) must wire up this guard — it is not optional.** It intercepts every way a user can leave a dirty view: in-app `<Link>`/`navigate()`, the browser back/forward button, and tab close/refresh (native `beforeunload` prompt).

Reusable pieces (do not reimplement — reuse these):
- `src/hooks/useNavigationGuard.ts` — `useNavigationGuard(isDirty)` → `{ isBlocked, confirm, cancel }`. Wraps `useBlocker` (router nav) + a `beforeunload` listener (tab close/refresh).
- `src/components/shared/UnsavedChangesDialog.tsx` — the confirmation modal (`open`, `onConfirm`, `onCancel`, optional `description`/`confirmLabel`). Reusable for non-router "are you sure" prompts too (e.g. switching tabs within a page) — drive `open` from local state instead of `isBlocked` and pass a custom `description`.
- `src/components/shared/SaveDiscardBar.tsx` — the fixed-bottom "You have unsaved changes" bar (`SAVE_BAR_HEIGHT` export for content padding).
- `src/pages/order-detail/useEditableField.ts` — `useEditableField(initial)` → `{ value, setValue, isDirty, commit, revert }`, per-field dirty tracking. Aggregate a tab's `isDirty` as `Object.values(fields).some(f => f.isDirty)`.

Convention: **keep `isDirty` page/tab-local** — no global dirty-state context. See `src/pages/OrderDetails.tsx` for the reference implementation: each tab (`DetailsTab.tsx`, `InstructionsTab.tsx`) is a controlled component whose field state is lifted into the parent page, which runs a single `useNavigationGuard` (armed by *any* tab being dirty, for leaving the page entirely) plus a second `UnsavedChangesDialog` instance driven by local `pendingTab` state (for switching between tabs in-page, which isn't a router navigation and so isn't caught by `useBlocker`).

When adding a new editable page or tab:
1. Track dirty state with `useEditableField` per field (or a `Set<id>` for tables), aggregate into `isDirty`.
2. Call `useNavigationGuard(isDirty)` and render `<UnsavedChangesDialog open={isBlocked} onConfirm={confirm} onCancel={cancel} />`.
3. Render `<SaveDiscardBar isDirty={isDirty} onSave={...} onDiscard={...} />` and pad page content by `SAVE_BAR_HEIGHT` while dirty.
4. If the dirty view lives inside a page with other in-page navigation (tabs, wizard steps), also intercept that switch and show a second `UnsavedChangesDialog` instance with a custom `description` naming what will be discarded — don't rely on `useNavigationGuard` for it, since it only sees router navigations.

## Design Tokens
Located in `src/theme/tokens.ts`. Woolworths brand: primary green `#008446`, Roboto font, 8px base radius.
Shadcn CSS vars override: Woolworths primary colour in `src/index.css`

## Nav Structure
Full nav tree in `src/data/navigation.ts`. Currently just a single placeholder entry:
- Order Summary (`/order-summary`)

Add real ECF nav items (Orders, Order Detail, Returns, Fulfilment, etc.) here as pages are built.

## Session Changelog Instructions
**IMPORTANT: At the end of every session, append a new dated entry to CHANGELOG.md in this format:**

```
### [YYYY-MM-DD] — Session N
**Added:**
- list items

**Changed:**
- list items

**Pages progressed this session:**
- PageName (/path) — brief description
```

Do not skip this step. The changelog is the project history (no git).
