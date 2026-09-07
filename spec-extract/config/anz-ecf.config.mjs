/**
 * ANZ ECF — Order Management Prototype.
 *
 * Findings that shaped this config (recorded here, not silently assumed):
 *
 *  - ENTRY GATE: the app is NOT gated by a splash/login. `StoreRequired`
 *    (src/components/layout/StoreRequired.tsx) blocks the ROUTED content
 *    (inside <main><Outlet/></main>) until a store type AND a country are
 *    picked from two native <select> elements that live in the Header —
 *    which renders UNCONDITIONALLY above the gate. That means `main` always
 *    exists, gated or not, and `page.locator('main').count() > 0` (the
 *    template's example assert) would be true on the WRONG screen. The
 *    assert used below instead checks the gate's own heading is gone.
 *  - The same two <select> elements stay live in the header after entry, so
 *    a screen's `go` can flip store type / country without reloading —
 *    that is how the store/country CONTEXT variants below are driven.
 *  - RESPONSIVE: this is a fixed-chrome back-office tool, not a responsive
 *    site. Grepping every .tsx for Tailwind's `sm|md|lg|xl|2xl:` prefixes
 *    found exactly ONE breakpoint that changes page-level chrome: `xl`
 *    (1280px, Tailwind default) — it collapses the header's persona name
 *    (UserMenu.tsx) and the Order Summary toolbar (OrderSummaryToolbar.tsx,
 *    QuickActions.tsx) into an icon-only / overflow form below 1280px.
 *    `md:` and `sm:` appear only inside two isolated popovers (the date
 *    calendar, the Sheet primitive's own max-width) — not page chrome — so
 *    they are not being called a second page-level tier here. The viewport
 *    list below straddles 1280 rather than inventing more tiers than the
 *    code has.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '..', '..')

const GATE_GONE_TEXT = 'Select a store type and country to continue'

/** Flip the header's store-type / country <select>s. Both stay mounted after
 * entry (Header renders them unconditionally), so this works on any screen
 * without reloading — that is what lets a screen id ask for a NON-default
 * context. */
async function setContext(page, { storeType, country } = {}) {
  const selects = page.locator('header select')
  if (storeType) await selects.nth(0).selectOption(storeType)
  if (country) await selects.nth(1).selectOption(country)
  if (storeType || country) await page.waitForTimeout(400)
}

/** Click an Order Summary quick action by its TOOLTIP label.
 *
 * These buttons are icon-only, tooltip-wrapped, and carry no accessible name —
 * so there is nothing to match on but the tooltip text, and their index shifts
 * with store/country gating (Move to Shop Floor is eStore-only, Locker Capacity
 * is NZ+Supermarket). Scoped to the quick-actions group so this hovers four or
 * five buttons rather than the ~460 tooltip triggers on the page. */
async function clickQuickAction(page, label) {
  const group = page.locator('span:text-is("Quick actions")').locator('xpath=following-sibling::div[1]')
  const buttons = group.locator('button')
  const n = await buttons.count()
  const seen = []
  for (let i = 0; i < n; i++) {
    await buttons.nth(i).hover({ force: true })
    await page.waitForTimeout(220)
    /* `[data-slot="tooltip-content"]`, not `[role="tooltip"]` — this component
     * library does not set the ARIA role on its tooltip panel, and matching the
     * role found nothing while the tooltip was plainly on screen. */
    const tip = (await page.locator('[data-slot="tooltip-content"]').first().textContent().catch(() => '')) ?? ''
    const disabled = await buttons.nth(i).getAttribute('aria-disabled')
    seen.push(`${tip.trim() || '(no tooltip)'}${disabled === 'true' ? ' [disabled]' : ''}`)
    if (tip.trim() === label) {
      if (disabled === 'true') {
        throw new Error(`quick action "${label}" is aria-disabled in this context — it needs a precondition (usually a row selection) before it will open`)
      }
      await buttons.nth(i).click({ force: true })
      await page.waitForTimeout(350)
      return
    }
  }
  /* Name what WAS there. A recipe that fails with only "not found" sends its
   * author back to the browser; one that lists the alternatives is usually
   * self-diagnosing. */
  throw new Error(`quick action "${label}" not present in this context. Found: ${seen.join(' · ')}`)
}

/** Select the first N order rows — the precondition most quick actions gate on.
 *
 * Base UI's `Checkbox.Root` renders a `<button data-slot="checkbox">`. There is
 * a hidden native `<input type=checkbox>` alongside it for form semantics, and
 * clicking THAT does nothing — it is a proxy, not the control. An earlier pass
 * targeted the input, concluded the checkboxes were undriveable, and waived
 * three dialogs on that basis. The source said otherwise. */
async function selectOrderRows(page, count = 1) {
  const boxes = page.locator('main table tbody [data-slot="checkbox"]')
  const n = Math.min(await boxes.count(), count)
  for (let i = 0; i < n; i++) {
    await boxes.nth(i).scrollIntoViewIfNeeded().catch(() => {})
    await boxes.nth(i).click({ force: true }).catch(() => {})
  }
  await page.waitForTimeout(300)
}

/** Select order rows whose Status cell reads exactly `status`.
 *
 * `Dispatch Order` gates on `row.status === 'Packed'` (QuickActions.tsx:113) —
 * an exact match, not a prefix — and packed rows are a minority of the fixture,
 * so selecting the first N rows misses them and the action stays disabled.
 * Targeting the rule directly is both reliable and self-documenting. Click ONE
 * row by default: the row itself is `cursor-pointer` and navigates to order
 * detail, so a second click after the selection re-render can land on the row
 * rather than its checkbox and take the page with it. One qualifying row
 * satisfies every gate here anyway. */
async function selectRowsWithStatus(page, status, count = 2) {
  const rows = page.locator('main table tbody tr').filter({ has: page.getByText(status, { exact: true }) })
  const n = Math.min(await rows.count(), count)
  if (n === 0) throw new Error(`no row with status "${status}" is visible on this screen`)
  for (let i = 0; i < n; i++) {
    const cb = rows.nth(i).locator('[data-slot="checkbox"]').first()
    /* scrollIntoViewIfNeeded BEFORE a force click: `force` skips Playwright's
     * actionability checks, which includes scrolling, so a control below the
     * fold is "clicked" at a point outside the viewport and nothing happens —
     * silently. The action then reports itself as permanently gated. */
    await cb.scrollIntoViewIfNeeded().catch(() => {})
    await cb.click({ force: true }).catch(() => {})
  }
  await page.waitForTimeout(300)
}

/** A dialog is open when a portalled dialog panel is present. */
const dialogOpen = async (p) =>
  (await p.locator('[role="dialog"], [role="alertdialog"], [data-slot="dialog-popup"], [data-slot="alert-dialog-popup"]').count()) > 0

/** Open the persona menu (UserMenu, far right of the header) and pick one. */
async function setPersona(page, label) {
  await page.locator('header button', { hasText: /Store Team|Support Office|Customer Support/ }).first().click()
  await page.getByRole('button', { name: new RegExp('^' + label) }).first().click()
  await page.waitForTimeout(300)
}

export default {
  id: 'anz-ecf',
  name: 'ANZ ECF — Order Management Prototype',

  versions: {
    v1: {
      build: path.join(repo, 'prototype', 'anz-ecf-union-v-1-7.html'),
      source: path.join(repo, 'prototype', 'anz-ecf-copilot', 'src'),
    },
  },

  specsDir: path.join(repo, 'requirements', 'functional-spec'),
  libraryFile: path.join(repo, 'requirements', 'ux-ui-library', 'README.md'),

  tokensModule: 'theme/tokens.ts',

  /* ---- ENTRY GATE --------------------------------------------------------
   * Default context for every screen unless the screen's own `go` overrides
   * it: Supermarket / AU / Store Team — the base case PAGES.md and
   * StoreRequired.tsx both describe first. */
  entryGate: {
    async pass(page) {
      await setContext(page, { storeType: 'supermarket', country: 'au' })
      await page.waitForTimeout(300)
    },
    async assert(page) {
      return (await page.getByText(GATE_GONE_TEXT).count()) === 0
    },
  },

  /* ---- VIEWPORTS -----------------------------------------------------------
   * 1024  below the only page-chrome breakpoint found (xl/1280) — the
   *       collapsed toolbar/header tier.
   * 1280  the xl cap itself — the exact pixel the collapse toggles on.
   * 1440  a common laptop width between the cap and the design's own max
   *       content width.
   * 1920  the app's own content ceiling (`max-w-[1920px]` in AppShell /
   *       Dash) — proves the cap, not just the layout above it.
   * 2560  above the content ceiling, on a wide monitor — proves the page
   *       gutters/centres rather than stretching. */
  viewports: [1024, 1280, 1440, 1920, 2560],
  screenshotHeight: 2400,

  /* ---- CONTEXTS ------------------------------------------------------------
   * Documented for the record; NOT swept as a full cross-product (3 store
   * types × 2 countries × 3 personas = 18, most producing no visible
   * difference). Screens below instead target every distinct branch
   * StoreRequired.tsx itself names, plus the persona-gated affordances
   * PAGES.md calls out. Anything not named here (e.g. Support Office
   * persona, CFC+NZ) is a gap for `guidance/asking-product-questions.md`,
   * not a silent omission. */
  contexts: [
    { id: 'supermarket-au-store-team', default: true },
    { id: 'supermarket-nz-store-team' },
    { id: 'estore-au-store-team' },
    { id: 'cfc-au-store-team' },
    { id: 'supermarket-nz-customer-support' },
  ],

  /* ---- OVERLAYS — the open-state pass ------------------------------------
   * Triggers are auto-discovered; nothing is listed here that discovery finds
   * on its own. See `guidance/measuring-open-states.md`. */
  overlays: {
    sampleSize: 3,

    /* Dialogs auto-discovery provably cannot reach. Every `Dialog`/`AlertDialog`
     * in this app is opened by a plain `<button onClick={() => setOpen(true)}>`
     * — no `data-slot`, no `aria-haspopup`, no `aria-expanded` — so no selector
     * finds them, and they are the most consequential overlays in the product
     * (confirmations, a destructive move, printed-document previews). */
    /* Preconditions below are taken from `QuickActions.tsx`'s own gate logic,
     * not from trial and error:
     *   visibility  — `packing-slips` needs `isNZ`; `move-to-shop-floor` needs
     *                 `isEstore`; `assign-to-locker` needs `isNZ && isSupermarket`
     *   enablement  — everything except Truck Arrival needs ≥1 selected row;
     *                 `packing-slips` also needs a selected row with
     *                 `packingSlipRequired`; `dispatch-order` also needs a
     *                 dispatch-eligible (packed) row.
     * Hence the generous row selection on the last two: the qualifying rows are
     * a minority of the fixture, so a wide selection is the reliable way to
     * include one. */
    extra: [
      {
        id: 'truck-arrival',
        screen: 'order-summary',
        label: 'Truck Arrival dialog (bulk quick action)',
        open: (p) => clickQuickAction(p, 'Truck Arrival'),          // requiresSelection: false
        assert: dialogOpen,
      },
      {
        id: 'department-notifications',
        screen: 'order-summary',
        label: 'Department Notifications dialog (bulk quick action)',
        open: async (p) => { await selectOrderRows(p, 3); await clickQuickAction(p, 'Department Notifications') },
        assert: dialogOpen,
      },
      {
        id: 'dispatch-order',
        screen: 'order-summary',
        label: 'Dispatch Order dialog (bulk quick action)',
        open: async (p) => { await selectRowsWithStatus(p, 'Packed', 1); await clickQuickAction(p, 'Dispatch Order') },
        assert: dialogOpen,
      },
      {
        id: 'packing-slips',
        screen: 'order-summary-nz',                                  // isNZ-gated, NOT on AU
        label: 'Packing Slips dialog (bulk quick action, NZ only)',
        open: async (p) => { await selectOrderRows(p, 12); await clickQuickAction(p, 'Packing Slips') },
        assert: dialogOpen,
      },
      {
        id: 'move-to-shop-floor-bulk',
        screen: 'order-summary-estore',
        label: 'Move Orders to Shop Floor dialog (bulk, eStore only)',
        open: async (p) => { await selectOrderRows(p, 3); await clickQuickAction(p, 'Move to Shop Floor Pick') },
        assert: dialogOpen,
      },
    ],

    waivers: [
      {
        /* `coverage.mjs` correctly reports 2-of-3 sampled for these pairs, and
         * the cause is real rather than an oversight: `OrderSummaryToolbar.tsx`
         * and `QuickActions.tsx` carry `xl:flex` / `xl:hidden` PAIRS, so both
         * the full and the collapsed toolbar are always in the DOM and one is
         * hidden. The open pass runs at 1440 — above the xl/1280 breakpoint —
         * so the collapsed variant's trigger is present but not visible, and
         * Playwright (correctly) refuses to click it.
         *
         * The unmeasured item is a TRIGGER, not an overlay: it opens the same
         * popover recipe as the two that were sampled, from the other
         * responsive variant of the same toolbar. The panel is covered.
         *
         * To measure the collapsed toolbar itself, run the open pass a second
         * time with `overlays.viewport: 1024`. */
        match: '^order-summary(-nz|-estore|-cfc-au)?/(popover|click)$',
        reason:
          'third trigger is the below-xl collapsed-toolbar variant (xl:hidden pair), not visible at the 1440 open-pass viewport. Same panel recipe as the two sampled — re-run at 1024 to measure the collapsed toolbar chrome itself.',
      },
    ],
  },

  /* ---- SCREEN × STATE MATRIX ------------------------------------------- */
  screens: [
    // The entry gate's OWN rendered state — every other screen's entryGate.pass
    // selects past this, so without a dedicated entry it is never measured as
    // a state in its own right, and it has real structure (StoreRequired.tsx):
    // a "prototype only" banner, 3 native <select>s, an informational panel.
    {
      id: 'entry-gate',
      label: 'Entry gate — before store type / country selected',
      spec: 'shell',
      gate: false, // do NOT run entryGate.pass — that is the state being measured
      go: async () => {},
      assert: async (p) => (await p.getByText(GATE_GONE_TEXT).count()) > 0,
    },

    // --- Order Summary — default context + the 3 named variants ---
    {
      id: 'order-summary',
      label: 'Order Summary (Supermarket / AU)',
      spec: 'order-summary',
      go: async (p, h) => h.nav(p, '/order-summary'),
      assert: async (p) => /\/order-summary/.test(p.url()) && (await p.locator('main table').count()) > 0,
    },
    {
      id: 'order-summary-nz',
      label: 'Order Summary (Supermarket / NZ — windows not sessions)',
      spec: 'order-summary',
      go: async (p, h) => { await h.nav(p, '/order-summary'); await setContext(p, { country: 'nz' }) },
      assert: async (p) => /\/order-summary/.test(p.url()) && (await p.locator('header select').nth(1).inputValue()) === 'nz',
    },
    {
      id: 'order-summary-estore',
      label: 'Order Summary (eStore — eCom/Shop Floor split)',
      spec: 'order-summary',
      go: async (p, h) => { await h.nav(p, '/order-summary'); await setContext(p, { storeType: 'estore' }) },
      assert: async (p) => (await p.locator('header select').nth(0).inputValue()) === 'estore',
    },
    {
      id: 'order-summary-cfc-au',
      label: 'Order Summary (CFC / AU — 3-way ambient split)',
      spec: 'order-summary',
      go: async (p, h) => { await h.nav(p, '/order-summary'); await setContext(p, { storeType: 'cfc', country: 'au' }) },
      assert: async (p) => (await p.locator('header select').nth(0).inputValue()) === 'cfc',
    },

    // --- Order Details — one screen per tab, default context ---
    {
      id: 'order-detail-articles',
      label: 'Order Details — Articles tab (default)',
      spec: 'order-detail',
      go: async (p, h) => { await h.nav(p, '/order-summary'); await h.openOrder(p) },
      assert: async (p) => /\/order\/detail\?id=/.test(p.url()),
    },
    {
      id: 'order-detail-details',
      label: 'Order Details — Details tab',
      spec: 'order-detail',
      go: async (p, h) => { await h.nav(p, '/order-summary'); await h.openOrder(p); await h.tab(p, 'Details') },
      assert: async (p) => /\/order\/detail\?id=/.test(p.url()),
    },
    {
      id: 'order-detail-instructions',
      label: 'Order Details — Instructions tab',
      spec: 'order-detail',
      go: async (p, h) => { await h.nav(p, '/order-summary'); await h.openOrder(p); await h.tab(p, 'Instructions') },
      assert: async (p) => /\/order\/detail\?id=/.test(p.url()),
    },
    {
      id: 'order-detail-labels',
      label: 'Order Details — Labels tab',
      spec: 'order-detail',
      go: async (p, h) => { await h.nav(p, '/order-summary'); await h.openOrder(p); await h.tab(p, 'Labels') },
      assert: async (p) => /\/order\/detail\?id=/.test(p.url()),
    },
    {
      id: 'order-detail-samples',
      label: 'Order Details — Samples tab',
      spec: 'order-detail',
      go: async (p, h) => { await h.nav(p, '/order-summary'); await h.openOrder(p); await h.tab(p, 'Samples') },
      assert: async (p) => /\/order\/detail\?id=/.test(p.url()),
    },
    {
      id: 'order-detail-audit',
      label: 'Order Details — Audit tab',
      spec: 'order-detail',
      go: async (p, h) => { await h.nav(p, '/order-summary'); await h.openOrder(p); await h.tab(p, 'Audit') },
      assert: async (p) => /\/order\/detail\?id=/.test(p.url()),
    },
    {
      id: 'order-detail-nz-customer-support',
      label: 'Order Details — Details tab (NZ, Customer Support persona — Edit Details button)',
      spec: 'order-detail',
      go: async (p, h) => {
        await h.nav(p, '/order-summary')
        await setContext(p, { country: 'nz' })
        await setPersona(p, 'Customer Support')
        await h.openOrder(p)
        await h.tab(p, 'Details')
      },
      assert: async (p) => /\/order\/detail\?id=/.test(p.url()),
    },
    {
      id: 'order-detail-estore',
      label: 'Order Details — Articles tab (eStore — OSR → Shop Floor action)',
      spec: 'order-detail',
      go: async (p, h) => { await h.nav(p, '/order-summary'); await setContext(p, { storeType: 'estore' }); await h.openOrder(p) },
      assert: async (p) => /\/order\/detail\?id=/.test(p.url()),
    },

    // --- Order Line Detail ---
    {
      id: 'order-line-detail',
      label: 'Order Line Detail — Details tab',
      spec: 'order-line-detail',
      go: async (p, h) => {
        // ArticlesTab (the default tab) navigates via a row onClick, not an
        // <a href> — found by reading ArticlesTab.tsx after this selector
        // timed out against the real build (30s, all 5 viewports). Fixed in
        // the config, not the product, per the kit's own troubleshooting rule.
        await h.nav(p, '/order-summary')
        await h.openOrder(p)
        await p.locator('main table tbody tr.cursor-pointer').first().click({ force: true })
        await p.waitForTimeout(600)
      },
      assert: async (p) => /\/order\/detail\/line/.test(p.url()),
    },

    // --- Search Orders — pre-filter (no results table) and post-search states ---
    {
      id: 'search-orders-prefilter',
      label: 'Search Orders — before Search is clicked',
      spec: 'search-orders',
      go: async (p, h) => h.nav(p, '/search-orders'),
      assert: async (p) => /\/search-orders/.test(p.url()) && (await p.locator('main table').count()) === 0,
    },
    {
      id: 'search-orders-results',
      label: 'Search Orders — after Search is clicked',
      spec: 'search-orders',
      go: async (p, h) => {
        await h.nav(p, '/search-orders')
        await p.getByRole('button', { name: /^Search$/ }).click()
        await p.waitForTimeout(500)
      },
      assert: async (p) => (await p.locator('main table').count()) > 0,
    },

    // --- Dash ---
    {
      id: 'dash-indicators',
      label: 'Dash — Indicators tab (default)',
      spec: 'dash',
      go: async (p, h) => h.nav(p, '/dash'),
      assert: async (p) => /\/dash/.test(p.url()),
    },
    {
      id: 'dash-timeline',
      label: 'Dash — Timeline tab',
      spec: 'dash',
      go: async (p, h) => { await h.nav(p, '/dash'); await h.tab(p, 'Timeline') },
      assert: async (p) => /\/dash/.test(p.url()),
    },

    // --- Scaffold routes ---
    {
      id: 'settings',
      label: 'Settings (scaffold)',
      spec: 'settings',
      go: async (p, h) => h.nav(p, '/settings'),
      assert: async (p) => /\/settings/.test(p.url()),
    },
    {
      id: 'reports',
      label: 'Reports (scaffold)',
      spec: 'reports',
      go: async (p, h) => h.nav(p, '/reports'),
      assert: async (p) => /\/reports/.test(p.url()),
    },
  ],

  source: {
    roots: ['.'],
    componentGlobs: ['**/*.tsx'],
    semanticMapModules: [
      'context/StoreContext.tsx',
      'context/PersonaContext.tsx',
      'data/navigation.ts',
    ],
    fixtureModules: [
      'pages/order-summary/mockData.ts',
      'pages/order-summary/orderGroups.ts',
      'pages/order-detail/orderDetailData.ts',
      'pages/order-detail/articlesData.ts',
      'pages/order-detail/instructionsData.ts',
      'pages/order-detail/labelsData.ts',
      'pages/order-detail/samplesData.ts',
      'pages/order-detail/auditData.ts',
      'pages/dash/dashData.ts',
    ],
    scaffoldingPatterns: [/^Demo/, /\[DEMO\]/],
  },

  componentSpecMap: {
    // seeded from PAGES.md / CLAUDE.md read-through; resolve-spec-ids.mjs
    // derives the rest from literal evidence once the census has run.
    'pages/OrderSummary.tsx': ['order-summary/SCR.CMP-01'],
    'pages/OrderDetails.tsx': ['order-detail/SCR.CMP-01'],
    'pages/OrderLineDetail.tsx': ['order-line-detail/SCR.CMP-01'],
    'pages/SearchOrders.tsx': ['search-orders/SCR.CMP-01'],
    'pages/Dash.tsx': ['dash/SCR.CMP-01'],
    'pages/Settings.tsx': null, // scaffold — placeholder copy only
    'pages/Reports.tsx': null,  // scaffold — placeholder copy only
    'components/layout/AppShell.tsx': ['shell/SCR.CMP-01'],
    'components/layout/Header.tsx': ['shell/SCR.CMP-02'],
    'components/layout/Footer.tsx': ['shell/SCR.CMP-03'],
    'components/layout/StoreToggle.tsx': ['shell/SCR.CMP-04'],
    'components/layout/UserMenu.tsx': ['shell/SCR.CMP-05'],
    'components/layout/StoreRequired.tsx': ['shell/SCR.CMP-06'],
  },

  unmappedByDesign: [
    /^src\/components\/ui\//,
    /^src\/(main|App)\.tsx$/,
    /^src\/(lib|hooks|types|context)\//,
    /^src\/version\.(ts|json)$/,
  ],
}
