/**
 * STATE CENSUS — the states that happen IN PLACE.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 *
 * The fourth and last instrument. Three passes already exist and each closed a
 * class of `⚠ EXTRACT` that had no instrument behind it:
 *
 *   census.mjs             resting screens — regions, tables, geometry
 *   census-open.mjs        overlays driven OPEN, and motion as a series
 *   census-components.mjs  component recipes by style clustering, + hover/focus
 *
 * What none of them can see is a state that changes an element **in place**,
 * with no overlay and no new component:
 *
 *   - a header that gains a shadow ONCE THE BODY HAS SCROLLED BENEATH IT. Every
 *     pass above measures at scroll-top, where the shadow does not exist. The
 *     spec template names this exact case as a required *Design requirement*,
 *     and it was still `⚠ EXTRACT` because nothing scrolled.
 *   - a row group that EXPANDS. Not an overlay — no portal, no panel; the same
 *     table grows.
 *   - a row that is SELECTED, or hovered. The component census drives hover on
 *     buttons and inputs; a `<tr>` is neither.
 *   - a FOCUS-VISIBLE ring, which appears on keyboard focus and not on click.
 *
 * Each of those is a rendered fact a builder must reproduce, and each was
 * being written down as "not extracted" while the prototype rendered it on
 * demand. That is the same root cause as the other three: a requirement the
 * pack mandates and provides no way to measure.
 *
 * ── THE METHOD ──────────────────────────────────────────────────────────────
 *
 * Everything here is a BEFORE/AFTER DIFF. Snapshot the candidate elements,
 * perform one real interaction, snapshot again, and record only what changed.
 * A diff is the specification; a second full dump of unchanged properties is
 * noise, and it hides the one property that moved.
 *
 * Nothing is hand-listed. Sticky elements are found by computed `position`,
 * disclosures by `aria-expanded` or a row-count change, selectable rows by the
 * presence of a checkbox. An app that declares none of these yields an empty
 * section rather than a false one.
 *
 * Usage:  node src/census-states.mjs --config <path> --version <v> [--screens a,b]
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname, relative, sep } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'out', 'state-census')
const posix = (p) => p.split(sep).join('/')

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name)
  return i > -1 ? process.argv[i + 1] : fallback
}

/** Properties an in-place state change can plausibly move. */
const SNAP = (sel) => {
  /* Only report a pseudo-element that actually draws something — every element
   * has ::before/::after computed styles, and returning them unconditionally
   * would swamp the diff with noise. */
  const pseudo = (el, which) => {
    const p = getComputedStyle(el, which)
    if (!p || p.content === 'none' || p.content === 'normal') return null
    const draws = (p.backgroundImage && p.backgroundImage !== 'none') ||
      (p.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(p.backgroundColor)) ||
      (p.boxShadow && p.boxShadow !== 'none') ||
      parseFloat(p.height) > 0
    if (!draws) return null
    return {
      content: p.content,
      height: p.height,
      width: p.width,
      position: p.position,
      top: p.top,
      bottom: p.bottom,
      backgroundImage: p.backgroundImage === 'none' ? null : p.backgroundImage,
      backgroundColor: /rgba\(0, 0, 0, 0\)/.test(p.backgroundColor) ? null : p.backgroundColor,
      boxShadow: p.boxShadow === 'none' ? null : p.boxShadow,
      opacity: p.opacity,
    }
  }
  const out = []
  const els = [...document.querySelectorAll(sel)].slice(0, 40)
  for (const el of els) {
    const s = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    out.push({
      tag: el.tagName.toLowerCase(),
      slot: el.getAttribute('data-slot') ?? null,
      cls: (el.getAttribute('class') || '').slice(0, 70),
      box: { y: Math.round(r.y), h: Math.round(r.height) },
      shadow: s.boxShadow === 'none' ? null : s.boxShadow,
      bg: s.backgroundColor,
      border: `${s.borderBottomWidth} ${s.borderBottomColor}`,
      position: s.position,
      top: s.top,
      zIndex: s.zIndex,
      opacity: s.opacity,
      color: s.color,
      /* `filter` matters more than it looks: the commonest row-hover idiom in
       * this app is `hover:brightness-95`, which moves NO colour property —
       * it is a filter. Omitting it reported "no row-hover treatment" on a
       * table that visibly darkens under the cursor, i.e. a confident wrong
       * negative about a rendered behaviour. */
      filter: s.filter === 'none' ? null : s.filter,
      outline: s.outlineStyle === 'none' ? null : `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`,
      transform: s.transform === 'none' ? null : s.transform,
      transition: s.transitionDuration === '0s' ? null : `${s.transitionProperty} ${s.transitionDuration} ${s.transitionTimingFunction}`,
      /* PSEUDO-ELEMENTS. `getComputedStyle(el)` cannot see `::before`/`::after`,
       * and the sticky-header "shadow" in this app is not a box-shadow at all —
       * it is a 10px `::after` gradient strip. Reading only the element
       * reported "no change on scroll" for a header that visibly gains one, and
       * a builder told "drop shadow" would blur the wrong edge entirely.
       * Any pass that judges appearance must read both pseudos or it is blind
       * to a whole class of rendered decoration. */
      before: pseudo(el, '::before'),
      after: pseudo(el, '::after'),
    })
  }
  return out
}

/** Which elements are STICKY or FIXED — the ones a scroll can change. */
const STICKY_SELECTORS = () => {
  const hits = new Set()
  for (const el of document.querySelectorAll('*')) {
    const s = getComputedStyle(el)
    if (s.position !== 'sticky' && s.position !== 'fixed') continue
    const r = el.getBoundingClientRect()
    if (r.width < 8 || r.height < 4) continue
    const tag = el.tagName.toLowerCase()
    const slot = el.getAttribute('data-slot')
    hits.add(slot ? `${tag}[data-slot="${slot}"]` : tag)
  }
  return [...hits]
}

const diff = (a, b) => {
  if (!a || !b) return null
  const out = {}
  for (const k of Object.keys(a)) {
    if (k === 'cls' || k === 'tag' || k === 'slot') continue
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) out[k] = { from: a[k], to: b[k] }
  }
  return Object.keys(out).length ? out : null
}

export async function censusStates(config, version, only) {
  const v = config.versions[version]
  if (!v) throw new Error(`unknown version "${version}"`)
  const url = pathToFileURL(v.build).href
  const cfg = config.states ?? {}
  const viewport = cfg.viewport ?? config.viewports?.[Math.floor((config.viewports?.length ?? 1) / 2)] ?? 1440
  const screens = config.screens.filter((s) => !only || only.includes(s.id))

  const browser = await chromium.launch()
  const result = { generated: new Date().toISOString(), app: config.id, version, viewport, screens: {}, driverFailures: [] }

  for (const sc of screens) {
    const page = await browser.newPage({ viewport: { width: viewport, height: 900 } })
    const record = { scroll: [], disclosure: [], row: {}, focusVisible: null }
    try {
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.waitForTimeout(400)
      if (sc.gate !== false) {
        await config.entryGate.pass(page)
        if (!(await config.entryGate.assert(page))) throw new Error('entry gate not passed - refusing to measure')
      }
      await sc.go(page, { nav: navHelper, tab: tabHelper, openOrder: openOrderHelper })
      if (sc.assert && !(await sc.assert(page))) throw new Error(`state assertion failed for "${sc.id}"`)

      /* RESET BETWEEN PROBE SECTIONS.
       *
       * Each section performs real interactions, and they contaminate each
       * other: the disclosure probe clicks toggles, one of which can navigate
       * away, so the row probe then measures a DIFFERENT table and reports "no
       * row-hover treatment" for a table that plainly has one. This is the same
       * isolation defect already fixed in `census-open.mjs` for manual recipes —
       * a probe that mutates state must not hand that state to the next probe. */
      const resetScreen = async () => {
        await page.goto(url, { waitUntil: 'networkidle' })
        await page.waitForTimeout(300)
        if (sc.gate !== false) await config.entryGate.pass(page)
        await sc.go(page, { nav: navHelper, tab: tabHelper, openOrder: openOrderHelper })
        await page.waitForTimeout(200)
      }

      /* ---- 1. SCROLL --------------------------------------------------------
       * The header-shadow case the template names by hand. Sticky/fixed
       * elements are discovered from computed position, not from a list. */
      const stickySels = await page.evaluate(STICKY_SELECTORS)
      for (const sel of stickySels.slice(0, 8)) {
        try {
          await page.evaluate(() => window.scrollTo(0, 0))
          await page.waitForTimeout(220)
          const atTop = await page.evaluate(SNAP, sel)
          await page.evaluate(() => window.scrollBy(0, 600))
          await page.waitForTimeout(400)
          const scrolled = await page.evaluate(SNAP, sel)
          const changes = atTop.map((a, i) => diff(a, scrolled[i])).filter(Boolean)
          record.scroll.push({
            selector: sel,
            instances: atTop.length,
            changedInstances: changes.length,
            /* An empty change set is a FINDING, not a blank: it says the
             * element is sticky and its appearance does not react to scroll,
             * which is a design decision a builder must not invent around. */
            changes: changes.slice(0, 3),
            verdict: changes.length
              ? 'CHANGES ON SCROLL — measured'
              : 'no change on scroll — measured. Sticky, but its appearance does not react. Record as `none`, not as unmeasured.',
          })
          await page.evaluate(() => window.scrollTo(0, 0))
          await page.waitForTimeout(200)
        } catch (err) {
          result.driverFailures.push({ screen: sc.id, probe: `scroll:${sel}`, error: String(err.message ?? err).split('\n')[0] })
        }
      }

      /* ---- 2. DISCLOSURE (expand / collapse) --------------------------------
       * Not an overlay: the same container grows. Measured as a row-count and
       * height delta plus any transition declared on the revealed region. */
      try {
        await resetScreen()
        const before = await page.evaluate(() => ({
          rows: document.querySelectorAll('main table tbody tr').length,
          h: Math.round(document.querySelector('main')?.getBoundingClientRect().height ?? 0),
        }))
        const toggles = page.locator('main [aria-expanded="false"], main tbody tr[data-state="closed"]')
        const n = Math.min(await toggles.count(), cfg.disclosureSamples ?? 2)
        for (let i = 0; i < n; i++) {
          await toggles.nth(i).scrollIntoViewIfNeeded().catch(() => {})
          /* Short timeout on purpose. An `aria-expanded="false"` element that
           * is not actually clickable otherwise burns Playwright's 30s default
           * per instance — on a large screen matrix that is minutes of wall
           * clock spent discovering nothing. Fail fast and report it as the
           * driver failure it is. */
          await toggles.nth(i).click({ force: true, timeout: cfg.clickTimeoutMs ?? 4000 })
          await page.waitForTimeout(450)
          const after = await page.evaluate(() => ({
            rows: document.querySelectorAll('main table tbody tr').length,
            h: Math.round(document.querySelector('main')?.getBoundingClientRect().height ?? 0),
            /* Whatever appeared: does it declare a transition of its own? */
            revealed: (() => {
              const el = document.querySelector('main [aria-expanded="true"]')
              if (!el) return null
              const s = getComputedStyle(el)
              return { transition: s.transitionDuration === '0s' ? null : `${s.transitionProperty} ${s.transitionDuration}` }
            })(),
          }))
          record.disclosure.push({
            rowsBefore: before.rows,
            rowsAfter: after.rows,
            rowDelta: after.rows - before.rows,
            mainHeightDelta: after.h - before.h,
            revealedTransition: after.revealed?.transition ?? null,
            verdict: after.revealed?.transition
              ? 'expands with a declared transition — measured'
              : 'expands with NO transition — measured. Content appears instantly; record as `none`.',
          })
          await toggles.nth(i).click({ force: true }).catch(() => {})
          await page.waitForTimeout(250)
        }
      } catch (err) {
        result.driverFailures.push({ screen: sc.id, probe: 'disclosure', error: String(err.message ?? err).split('\n')[0] })
      }

      /* ---- 3. ROW STATES — hover and selected -------------------------------
       * A <tr> is neither a button nor an input, so the component census never
       * drives it; yet row hover and the selected-row treatment are among the
       * most-cited things in a table spec. */
      try {
        await resetScreen()
        const rows = page.locator('main table tbody tr')
        const rowCount = await rows.count()
        if (rowCount) {
          /* SAMPLE SEVERAL ROWS, NEVER JUST THE FIRST.
           *
           * In a grouped table the first `<tbody> <tr>` is a GROUP HEADER, and
           * it deliberately has no hover treatment. Hovering only it reports
           * "no row-hover treatment" on a table that visibly darkens under the
           * cursor — a confident wrong negative about a rendered behaviour.
           * `census.mjs`'s own row helper already excludes `.font-bold` for the
           * same reason; SETUP.md names this exact trap.
           *
           * Sampling instead DISCOVERS the row variants: a header row with no
           * hover and a data row with one are two treatments, and both belong
           * in the spec. */
          const hoverVariants = []
          for (let i = 0; i < Math.min(rowCount, cfg.rowSamples ?? 4); i++) {
            const rest = await page.evaluate(SNAP, 'main table tbody tr')
            await rows.nth(i).scrollIntoViewIfNeeded().catch(() => {})
            await rows.nth(i).hover({ force: true })
            await page.waitForTimeout(200)
            const hovered = await page.evaluate(SNAP, 'main table tbody tr')
            const d = diff(rest[i], hovered[i])
            const key = JSON.stringify(d)
            if (!hoverVariants.some((v) => JSON.stringify(v.change) === key)) {
              hoverVariants.push({ rowIndex: i, rowClass: rest[i]?.cls ?? null, change: d })
            }
            await page.mouse.move(2, 2)
            await page.waitForTimeout(80)
          }
          record.row.hoverVariants = hoverVariants
          record.row.hover = hoverVariants.find((v) => v.change)?.change ?? null
          record.row.hoverVerdict = hoverVariants.some((v) => v.change)
            ? `${hoverVariants.filter((v) => v.change).length} of ${hoverVariants.length} sampled row variants react to hover — measured`
            : 'no sampled row reacts to hover — measured'

          const cb = page.locator('main table tbody [data-slot="checkbox"], main table tbody input[type="checkbox"]')
          if (await cb.count()) {
            await cb.first().scrollIntoViewIfNeeded().catch(() => {})
            const beforeSelect = await page.evaluate(SNAP, 'main table tbody tr')
            await cb.first().click({ force: true })
            await page.waitForTimeout(300)
            const selected = await page.evaluate(SNAP, 'main table tbody tr')
            const changed = beforeSelect.map((a, i) => diff(a, selected[i])).filter(Boolean)
            record.row.selected = changed[0] ?? null
            record.row.selectedVerdict = changed.length
              ? 'selected rows change appearance — measured'
              : 'NO selected-row treatment — measured. A row can be selected with no visual change; that is a finding, not a missing measurement.'
            await cb.first().click({ force: true }).catch(() => {})
            await page.waitForTimeout(150)
          }
          await page.mouse.move(2, 2)
        }
      } catch (err) {
        result.driverFailures.push({ screen: sc.id, probe: 'row-states', error: String(err.message ?? err).split('\n')[0] })
      }

      /* ---- 4. FOCUS-VISIBLE -------------------------------------------------
       * Keyboard focus, which is NOT the same as `.focus()` — `:focus-visible`
       * is what draws the ring, and it is the accessibility contract. */
      try {
        await resetScreen()
        await page.keyboard.press('Tab')
        await page.waitForTimeout(200)
        record.focusVisible = await page.evaluate(() => {
          const el = document.activeElement
          if (!el || el === document.body) return null
          const s = getComputedStyle(el)
          return {
            on: `${el.tagName.toLowerCase()}${el.getAttribute('data-slot') ? `[data-slot="${el.getAttribute('data-slot')}"]` : ''}`,
            outline: s.outlineStyle === 'none' ? null : `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`,
            outlineOffset: s.outlineOffset,
            boxShadow: s.boxShadow === 'none' ? null : s.boxShadow,
            matchesFocusVisible: el.matches(':focus-visible'),
          }
        })
      } catch (err) {
        result.driverFailures.push({ screen: sc.id, probe: 'focus-visible', error: String(err.message ?? err).split('\n')[0] })
      }

      const nScroll = record.scroll.filter((s) => s.changedInstances > 0).length
      process.stdout.write(
        `  ${sc.id.padEnd(30)} scroll:${record.scroll.length}(${nScroll} react) · disclosure:${record.disclosure.length} · row:${record.row.hover ? 'hover' : '—'}/${record.row.selected ? 'selected' : '—'} · focus:${record.focusVisible ? 'yes' : '—'}\n`
      )
    } catch (err) {
      result.driverFailures.push({ screen: sc.id, probe: '(setup)', error: String(err.message ?? err).split('\n')[0] })
    } finally {
      await page.close()
    }
    result.screens[sc.id] = record
  }

  await browser.close()
  mkdirSync(OUT, { recursive: true })
  const outFile = join(OUT, `${version}.json`)
  writeFileSync(outFile, JSON.stringify(result, null, 2))
  return { result, outFile }
}

async function navHelper(page, route) {
  const items = page.locator('header nav').locator('a, button')
  const n = await items.count()
  for (let i = 0; i < n; i++) {
    const href = (await items.nth(i).getAttribute('href')) ?? ''
    const text = (await items.nth(i).textContent())?.trim() ?? ''
    if (href.includes(route) || (text && text.includes(route))) {
      await items.nth(i).click({ force: true })
      await page.waitForTimeout(700)
      return
    }
  }
  throw new Error(`nav target "${route}" not found among ${n} items`)
}
async function tabHelper(page, label) {
  await page.locator('main').getByText(label, { exact: true }).first().click({ force: true })
  await page.waitForTimeout(600)
}
async function openOrderHelper(page) {
  await page.locator('main table tbody tr:not(.font-bold)').first().click({ force: true })
  await page.waitForTimeout(800)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cfgPath = arg('config', join(HERE, '..', 'config', 'myapp.config.mjs'))
  const version = arg('version', 'v1')
  const only = arg('screens') ? arg('screens').split(',') : null
  const config = (await import(pathToFileURL(cfgPath).href)).default

  console.log(`\nSTATE CENSUS — ${config.id} ${version}`)
  const { result, outFile } = await censusStates(config, version, only)

  const all = Object.values(result.screens)
  const scrollReacts = all.flatMap((s) => s.scroll).filter((s) => s.changedInstances > 0).length
  const scrollInert = all.flatMap((s) => s.scroll).filter((s) => s.changedInstances === 0).length
  const disclosures = all.flatMap((s) => s.disclosure).length
  const rowHover = all.filter((s) => s.row?.hover).length
  const rowSelected = all.filter((s) => s.row?.selected).length
  const rowNoSelect = all.filter((s) => s.row?.selectedVerdict && !s.row.selected).length
  console.log(`\n  sticky elements that REACT to scroll : ${scrollReacts}`)
  console.log(`  sticky elements that do not (measured): ${scrollInert}`)
  console.log(`  disclosures measured                 : ${disclosures}`)
  console.log(`  screens with a row-hover treatment   : ${rowHover}`)
  console.log(`  screens with a selected-row treatment: ${rowSelected}   (${rowNoSelect} measured as HAVING NONE)`)
  if (result.driverFailures.length) {
    console.log(`\n  ⚠ DRIVER FAILURES: ${result.driverFailures.length}`)
    for (const f of result.driverFailures.slice(0, 8)) console.log(`      ${f.screen} ${f.probe} — ${f.error.slice(0, 70)}`)
  }
  console.log(`\n  written → ${posix(relative(process.cwd(), outFile))}\n`)
}
