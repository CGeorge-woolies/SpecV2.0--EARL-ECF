/**
 * CENSUS — drives a BUILT prototype and records what it actually contains.
 *
 * GENERIC. Knows about tables, triggers, overlays, geometry, motion and text.
 * Knows nothing about the app; the screen/state matrix, the entry gate and the
 * viewports all come from the config.
 *
 * WHY A CENSUS RATHER THAN A DIFF OF THE FILES. Both builds are single-line
 * minified bundles (the baseline's longest line is 713,422 chars). A static string diff
 * of <baseline> against <version> returns ONE changed minified symbol — it is not a usable
 * delta. What changed is only visible once the app is RENDERED, so that is what
 * this measures. (METHOD.md §8.1 step 1 said "diff the string inventory", which
 * reads as a grep and cannot be one.)
 *
 * WHAT IT RECORDS, and why each entry is here — one per class of defect the
 * verification gates were bought with:
 *
 *   literals      an unbuilt overlay is pixel-identical to a correct one while
 *                 it is closed (§3.5.11i)
 *   tables        "there is no table here" has no pixels of its own (§3.5.11z)
 *   triggers      a control's KIND is invisible in a screenshot, and a control
 *                 can legitimately be two kinds at once (§3.5.11cc)
 *   routes        a link that renders perfectly and does nothing passes every
 *                 visual check (§3.5.11h)
 *   geometry      a missing width cap is pixel-identical below the cap (§3.5.9c)
 *   cellScale     cell padding is per-table and it compounds (§3.5.11ii)
 *   dataVariants  render-tree extraction under-samples data variants (§3.5.11c)
 *   assets        a named asset with no artwork reads as delivered (§3.5.11gg)
 *
 * EVERY STATE ASSERTS IT IS THE STATE IT CLAIMS. A measurement taken in the
 * wrong state is not a failed measurement, it is a confident wrong one — it
 * returns clean numbers and no error (§3.5.11j). A driver failure is reported
 * AS a driver failure and never folded into the result (§3.5.10e).
 *
 * Usage:  node src/census.mjs --version <version> [--screens orders,search]
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname, relative, sep } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'out', 'census')
const posix = (p) => p.split(sep).join('/')

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name)
  return i > -1 ? process.argv[i + 1] : fallback
}

/* ---- navigation helpers, passed to the config's `go` functions ------------ *
 * The config says WHERE to go; these say HOW. Kept here so a new app only
 * writes intent, not selector plumbing.                                       */
const helpers = {
  /* Navigate by ROUTE, not by label. The nav items are icon-only - their text
   * content is empty - so label matching silently never fires and every state
   * assertion then (correctly) refuses to measure. Matching the route target is
   * also the thing the config already knows, and it survives an icon change. */
  async nav(page, route) {
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
  },
  async tab(page, label) {
    await page.locator('main').getByText(label, { exact: true }).first().click({ force: true })
    await page.waitForTimeout(600)
  },
  async openOrder(page) {
    // NOT the first row - that is a GROUP HEADER, and clicking it does not
    // navigate. Both sides then agree perfectly while measuring the wrong
    // screen (§3.5.11z corollary). Pick a row that is not bold.
    const rows = page.locator('main table tbody tr:not(.font-bold)')
    await rows.first().click({ force: true })
    await page.waitForTimeout(800)
  },
}

/* ---- the in-page probe ---------------------------------------------------- *
 * One evaluate() per screen/viewport. Everything it returns is RENDERED truth. */
const PROBE = () => {
  const box = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  }
  const px = (v) => Math.round(parseFloat(v) || 0)

  /* --- literals: rendered copy, VISIBLE ONLY.
   *
   * Tailwind's responsive idiom is `hidden xl:flex` - BOTH layouts are in the
   * DOM at every width and one is display:none. A text walk that ignores
   * visibility therefore returns an IDENTICAL literal set at 1024 and 1920, and
   * is structurally blind to the entire responsive tier - which is the exact
   * failure the 1024 viewport was added to catch (§3.5.9c). Found by this
   * census reporting 188 literals at every viewport on a screen that is
   * documented to collapse below xl. */
  const visible = (el) => {
    if (!el) return false
    if (typeof el.checkVisibility === 'function') return el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: false, visibilityProperty: true })
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
  }
  const literals = new Set()
  const hiddenLiterals = new Set()
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let node
  while ((node = walker.nextNode())) {
    const t = node.textContent.trim().replace(/\s+/g, ' ')
    if (!(t.length >= 2 && t.length <= 90 && /[A-Za-z]{2}/.test(t))) continue
    if (visible(node.parentElement)) literals.add(t)
    else hiddenLiterals.add(t)
  }

  /* --- tables: count AND header set, in order. A category noun like "card"
   *     carries no structural information; the header set is what a table IS. */
  const tables = [...document.querySelectorAll('table')].filter(visible).map((t) => {
    const heads = [...t.querySelectorAll('thead th, thead td')]
      .map((h) => h.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean)
    const bodyRows = t.querySelectorAll('tbody tr').length
    const firstCell = t.querySelector('tbody td')
    const cs = firstCell ? getComputedStyle(firstCell) : null
    const firstRow = t.querySelector('tbody tr')
    return {
      headers: heads,
      headerCount: heads.length,
      bodyRows,
      box: box(t),
      /* the measured padding / font-size / row-height triple - cell padding is
       * per-table and compounds; this app has run four different scales */
      cellScale: cs ? {
        padding: `${px(cs.paddingTop)}px ${px(cs.paddingLeft)}px`,
        fontSize: px(cs.fontSize),
        lineHeight: px(cs.lineHeight),
        rowHeight: firstRow ? Math.round(firstRow.getBoundingClientRect().height) : null,
      } : null,
      colWidths: [...t.querySelectorAll('thead th')].map((h) => Math.round(h.getBoundingClientRect().width)),
    }
  })

  /* --- trigger census: a control's KIND is a requirement and is invisible in a
   *     screenshot. A control can legitimately be TWO kinds at once. --- */
  const kinds = ['popover-trigger', 'tooltip-trigger', 'select-trigger', 'dialog-trigger', 'menu-trigger']
  const triggers = {}
  for (const k of kinds) triggers[k] = [...document.querySelectorAll(`[data-slot="${k}"]`)].filter(visible).length
  triggers['base-ui-click-trigger'] = [...document.querySelectorAll('[data-base-ui-click-trigger]')].filter(visible).length
  triggers['native-select'] = [...document.querySelectorAll('select')].filter(visible).length
  triggers['dual-kind'] = [...document.querySelectorAll('[data-slot="tooltip-trigger"]')]
    .filter((e) => e.hasAttribute('data-base-ui-click-trigger')).length

  /* --- routes: every navigating affordance. A link that renders and does
   *     nothing passes the pixel diff, the string gate and the nav gate. --- */
  const routes = [...document.querySelectorAll('a[href]')]
    .map((a) => a.getAttribute('href')).filter((h) => h && h !== '#')
  const buttons = document.querySelectorAll('button').length

  /* --- geometry: the width model. Vertical is included deliberately - a
   *     horizontal-only probe misses a bleed applied on all four sides. --- */
  const main = document.querySelector('main')
  const geometry = {
    page: box(document.body),
    main: box(main),
    cap: box(main && main.firstElementChild),
    firstTable: box(document.querySelector('main table')),
    scrollWidth: document.documentElement.scrollWidth,
  }

  /* --- icons + assets --- */
  const svgCount = document.querySelectorAll('svg').length
  const imgs = [...document.querySelectorAll('img')].map((i) => i.getAttribute('src')?.slice(0, 60))

  /* --- data variants: group ids, sub-group labels, enum-ish tokens that only
   *     appear in DATA. Render-tree-first extraction under-samples these. --- */
  const dataVariants = [...document.querySelectorAll('[data-group], [data-kind], [data-status], [data-zone]')]
    .map((e) => ['group', 'kind', 'status', 'zone']
      .map((a) => e.getAttribute('data-' + a)).filter(Boolean).join(':')).filter(Boolean)

  return {
    literals: [...literals].sort(),
    literalCount: literals.size,
    /* Copy present in the DOM but NOT rendered at this width. Recorded rather
     * than discarded: at one viewport it is the other responsive layout, and
     * across viewports the two sets swapping is how a breakpoint proves itself. */
    hiddenLiterals: [...hiddenLiterals].sort(),
    hiddenLiteralCount: hiddenLiterals.size,
    tables,
    tableCount: tables.length,
    triggers,
    routes: [...new Set(routes)].sort(),
    buttons,
    geometry,
    svgCount,
    imgs: [...new Set(imgs)].filter(Boolean),
    dataVariants: [...new Set(dataVariants)].sort(),
  }
}

/* ---- main ---------------------------------------------------------------- */
export async function census(config, version, only) {
  const v = config.versions[version]
  if (!v) throw new Error(`unknown version "${version}"`)
  const url = pathToFileURL(v.build).href

  const screens = config.screens.filter((s) => !only || only.includes(s.id))
  const browser = await chromium.launch()
  const result = {
    generated: new Date().toISOString(),
    app: config.id,
    version,
    build: posix(relative(process.cwd(), v.build)),
    viewports: config.viewports,
    screens: {},
    driverFailures: [],   // NEVER folded into the data (§3.5.10e)
  }

  for (const sc of screens) {
    result.screens[sc.id] = { label: sc.label, spec: sc.spec, viewports: {} }

    for (const w of config.viewports) {
      const page = await browser.newPage({
        viewport: { width: w, height: config.screenshotHeight ?? 2000 },
      })
      try {
        await page.goto(url, { waitUntil: 'networkidle' })
        await page.waitForTimeout(400)

        if (sc.gate !== false) {
          await config.entryGate.pass(page)
          /* PROVE we are past the gate. Until it is passed <main> holds only a
           * disclaimer and the document contains zero tables - a census taken
           * there returns clean numbers about the wrong screen (§3.5.11j). */
          if (!(await config.entryGate.assert(page))) {
            throw new Error('entry gate not passed - refusing to measure')
          }
        }

        await sc.go(page, helpers)

        /* PROVE the state arrived. */
        if (sc.assert && !(await sc.assert(page))) {
          throw new Error(`state assertion failed for "${sc.id}" - refusing to measure`)
        }

        result.screens[sc.id].viewports[w] = await page.evaluate(PROBE)
      } catch (err) {
        /* A driver failure is reported as a driver failure. Folding it into the
         * data turns "the harness broke" into "the build is wrong". */
        result.driverFailures.push({ screen: sc.id, viewport: w, error: String(err.message ?? err) })
        result.screens[sc.id].viewports[w] = null
      } finally {
        await page.close()
      }
    }
    const ok = Object.values(result.screens[sc.id].viewports).filter(Boolean).length
    process.stdout.write(`  ${sc.id.padEnd(22)} ${ok}/${config.viewports.length} viewports\n`)
  }

  await browser.close()
  mkdirSync(OUT, { recursive: true })
  const outFile = join(OUT, `${version}.json`)
  writeFileSync(outFile, JSON.stringify(result, null, 2))
  return { result, outFile }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cfgPath = arg('config', join(HERE, '..', 'config', 'myapp.config.mjs'))
  const version = arg('version', 'v1')
  const only = arg('screens') ? arg('screens').split(',') : null
  const config = (await import(pathToFileURL(cfgPath).href)).default

  console.log(`\nCENSUS — ${config.id} ${version}`)
  const { result, outFile } = await census(config, version, only)

  const screens = Object.keys(result.screens).length
  const measured = Object.values(result.screens)
    .flatMap((s) => Object.values(s.viewports)).filter(Boolean).length
  console.log(`\n  screens        : ${screens}`)
  console.log(`  measurements   : ${measured}`)
  if (result.driverFailures.length) {
    console.log(`\n  ⚠ DRIVER FAILURES (reported separately, NOT counted as findings): ${result.driverFailures.length}`)
    for (const f of result.driverFailures.slice(0, 12)) {
      console.log(`      ${f.screen} @${f.viewport} — ${f.error.slice(0, 90)}`)
    }
  }
  console.log(`\n  written → ${posix(relative(process.cwd(), outFile))}\n`)
}
