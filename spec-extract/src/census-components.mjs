/**
 * COMPONENT CENSUS — discovers and measures the app's component RECIPES.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 *
 * The third instance of one root cause. The pack requires three things and,
 * until now, shipped instruments for only the first:
 *
 *   screens   → `census.mjs`         (resting geometry, tables, literals)
 *   overlays  → `census-open.mjs`    (open-state panels, enter/exit motion)
 *   RECIPES   → nothing
 *
 * And yet `writing-a-spec.md` §5 says chrome is specified "by reference to the
 * pattern library", and the spec template adds: "the reference MUST resolve —
 * a reference that resolves to nothing reads as complete and is empty."
 *
 * With no instrument producing recipes, the library got hand-authored from
 * source reads. That is why it has holes, and every hole becomes a bare
 * `- **UX/UI:** ⚠ EXTRACT.` in whichever spec cites it. Those markers were then
 * explained away as "a recipe someone still has to write" — but the control
 * RENDERS. It has a computed box model. Nothing about it is unmeasurable; there
 * was simply no pass that looked.
 *
 * ── HOW RECIPES ARE DISCOVERED (without knowing the app) ────────────────────
 *
 * By STYLE CLUSTERING, not by a list of component names. Every visible element
 * is reduced to a style signature — tag, role, the box model, type, colour,
 * border, shadow — and identical signatures collapse into one recipe with an
 * instance count and the screens it appears on.
 *
 * This is deliberately the same principle as gate (e)'s "enumerate, never
 * hand-pick": a component added later is catalogued the day it renders, and a
 * recipe nobody remembered to write is impossible rather than merely unlikely.
 * It also answers a question a hand-written library cannot: WHICH treatments
 * actually differ, and how many there really are. This app was documented with
 * "4 known" table cell scales; measurement found six.
 *
 * ── INTERACTION STATES ──────────────────────────────────────────────────────
 *
 * A recipe is not just its resting look. For one representative of each cluster
 * the pass drives `hover` and `focus` and records what CHANGED — nothing else,
 * because a diff is the specification and a second full dump is noise. Disabled
 * instances are catalogued as their own cluster automatically, since a disabled
 * control has a different signature by construction.
 *
 * Usage:  node src/census-components.mjs --config <path> --version <v> [--screens a,b]
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname, relative, sep } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'out', 'component-census')
const posix = (p) => p.split(sep).join('/')

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name)
  return i > -1 ? process.argv[i + 1] : fallback
}

/** In-page: reduce every visible element to a style signature and cluster. */
const HARVEST = ({ maxNodes }) => {
  const vis = (el) => {
    if (typeof el.checkVisibility === 'function') {
      return el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: false, visibilityProperty: true })
    }
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
  }
  const px = (v) => Math.round(parseFloat(v) || 0)
  const pathOf = (el) => {
    const parts = []
    let n = el
    while (n && n.nodeType === 1 && n !== document.documentElement) {
      const p = n.parentElement
      if (!p) break
      parts.unshift(n.tagName.toLowerCase() + ':nth-child(' + ([...p.children].indexOf(n) + 1) + ')')
      n = p
    }
    return parts.join(' > ')
  }

  /* What counts as a COMPONENT rather than a layout div.
   *
   * Three ways in, deliberately overlapping so an app that declares nothing
   * still yields a catalogue:
   *   1. it declares itself   — a component-library slot marker or an ARIA role
   *   2. it is interactive    — button, input, select, textarea, anchor, cell
   *   3. it paints            — it has a background, border or shadow of its
   *                             own, i.e. it is a visible surface rather than
   *                             an invisible wrapper
   * A bare <div> that only positions its children is none of these, which is
   * exactly right: it is a region, and regions are `census.mjs`'s job. */
  const INTERACTIVE = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A', 'TH', 'TD', 'LABEL', 'SUMMARY'])
  const paints = (s) => {
    const a = s.backgroundColor.match(/rgba?\([^)]*?([\d.]+)\)$/)?.[1] ?? '1'
    const hasBg = s.backgroundColor !== 'transparent' && parseFloat(a) > 0.02
    const hasBorder = px(s.borderTopWidth) > 0 || px(s.borderBottomWidth) > 0 || px(s.borderLeftWidth) > 0 || px(s.borderRightWidth) > 0
    return hasBg || hasBorder || (s.boxShadow && s.boxShadow !== 'none')
  }

  const clusters = new Map()
  let scanned = 0
  for (const el of document.querySelectorAll('*')) {
    if (scanned++ > maxNodes) break
    if (!vis(el)) continue
    const s = getComputedStyle(el)
    const slot = el.getAttribute('data-slot')
    const role = el.getAttribute('role')
    const declares = !!(slot || role)
    const interactive = INTERACTIVE.has(el.tagName)
    if (!declares && !interactive && !paints(s)) continue

    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.height < 4) continue

    /* `border-radius: 9999px` (the "pill" idiom) comes back from
     * getComputedStyle as Chrome's internal clamp — 3.35544e+07px. Recording
     * that verbatim puts `border-radius: 33554432px` into a specification,
     * which is not a value anyone can build to and reads as a measurement
     * error. Normalise to the DESIGN INTENT, which is what a builder needs:
     * fully rounded, i.e. half the height. */
    const rawRadius = s.borderRadius
    const radius = /\d{6,}px|e\+/.test(rawRadius)
      ? `fully-rounded (pill — half of ${Math.round(r.height)}px height)`
      : rawRadius

    /* The signature IS the recipe. Size is excluded on purpose — a button's
     * width follows its label; what a builder must reproduce is the treatment.
     * Height is kept because it is usually a designed constant (a control
     * scale), not content-driven. */
    const sig = JSON.stringify({
      tag: el.tagName.toLowerCase(),
      slot: slot ?? null,
      role: role ?? null,
      h: Math.round(r.height),
      pad: `${px(s.paddingTop)} ${px(s.paddingRight)} ${px(s.paddingBottom)} ${px(s.paddingLeft)}`,
      radius,
      bg: s.backgroundColor,
      color: s.color,
      border: `${px(s.borderTopWidth)}px ${s.borderTopStyle} ${s.borderTopColor}`,
      shadow: s.boxShadow === 'none' ? null : s.boxShadow,
      font: `${px(s.fontSize)}/${px(s.lineHeight)} ${s.fontWeight} ${s.fontFamily.split(',')[0].replace(/["']/g, '')}`,
      letterSpacing: s.letterSpacing === 'normal' ? null : s.letterSpacing,
      transition: s.transitionDuration === '0s' ? null : `${s.transitionProperty} ${s.transitionDuration} ${s.transitionTimingFunction}`,
      disabled: el.getAttribute('aria-disabled') === 'true' || el.hasAttribute('disabled') || null,
      opacity: s.opacity === '1' ? null : s.opacity,
    })

    const hit = clusters.get(sig)
    if (hit) {
      hit.count++
      if (hit.samples.length < 3) hit.samples.push((el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 32))
    } else {
      clusters.set(sig, {
        sig: JSON.parse(sig),
        count: 1,
        box: { w: Math.round(r.width), h: Math.round(r.height) },
        path: pathOf(el),
        samples: [(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 32)],
      })
    }
  }
  return [...clusters.values()].sort((a, b) => b.count - a.count)
}

/** In-page: read only the properties an interaction can change. */
const STATE = (path) => {
  const el = document.querySelector(path)
  if (!el) return null
  const s = getComputedStyle(el)
  return {
    bg: s.backgroundColor,
    color: s.color,
    border: s.borderTopColor + ' ' + s.borderTopWidth,
    shadow: s.boxShadow === 'none' ? null : s.boxShadow,
    outline: s.outlineStyle === 'none' ? null : `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`,
    opacity: s.opacity,
    transform: s.transform === 'none' ? null : s.transform,
  }
}

const changed = (a, b) => {
  if (!a || !b) return null
  const out = {}
  for (const k of Object.keys(a)) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) out[k] = { from: a[k], to: b[k] }
  return Object.keys(out).length ? out : null
}

export async function censusComponents(config, version, only) {
  const v = config.versions[version]
  if (!v) throw new Error(`unknown version "${version}"`)
  const url = pathToFileURL(v.build).href

  const cfg = config.components ?? {}
  const viewport = cfg.viewport ?? config.viewports?.[Math.floor((config.viewports?.length ?? 1) / 2)] ?? 1440
  const maxNodes = cfg.maxNodes ?? 6000
  const stateSamples = cfg.stateSamples ?? 40
  const screens = config.screens.filter((s) => !only || only.includes(s.id))

  const browser = await chromium.launch()
  const result = {
    generated: new Date().toISOString(),
    app: config.id,
    version,
    viewport,
    recipes: [],
    driverFailures: [],
  }

  /* One global catalogue keyed by signature: the same button on six screens is
   * ONE recipe used in six places, not six recipes. That collapse is the whole
   * value — it turns "measure everything" into a library a person can read. */
  const global = new Map()

  for (const sc of screens) {
    const page = await browser.newPage({ viewport: { width: viewport, height: 1000 } })
    try {
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.waitForTimeout(400)
      if (sc.gate !== false) {
        await config.entryGate.pass(page)
        if (!(await config.entryGate.assert(page))) throw new Error('entry gate not passed - refusing to measure')
      }
      await sc.go(page, { nav: navHelper, tab: tabHelper, openOrder: openOrderHelper })
      if (sc.assert && !(await sc.assert(page))) throw new Error(`state assertion failed for "${sc.id}"`)

      const found = await page.evaluate(HARVEST, { maxNodes })

      /* Interaction states for the busiest clusters on this screen. Hover and
       * focus are recorded as a DIFF against rest — the change is the
       * requirement; repeating the unchanged properties is noise. */
      const interactiveish = found
        .filter((c) => ['button', 'a', 'input', 'select', 'textarea'].includes(c.sig.tag) || c.sig.role === 'button')
        .slice(0, stateSamples)
      for (const c of interactiveish) {
        try {
          const rest = await page.evaluate(STATE, c.path)
          await page.locator(c.path).first().hover({ force: true, timeout: 2000 })
          await page.waitForTimeout(140)
          const hover = await page.evaluate(STATE, c.path)
          await page.locator(c.path).first().focus({ timeout: 2000 }).catch(() => {})
          await page.waitForTimeout(120)
          const focus = await page.evaluate(STATE, c.path)
          await page.mouse.move(2, 2)
          c.states = { hover: changed(rest, hover), focus: changed(rest, focus) }
        } catch {
          c.states = { hover: null, focus: null, note: 'not drivable at this viewport' }
        }
      }

      for (const c of found) {
        const key = JSON.stringify(c.sig)
        const hit = global.get(key)
        if (hit) {
          hit.count += c.count
          if (!hit.screens.includes(sc.id)) hit.screens.push(sc.id)
          if (!hit.states && c.states) hit.states = c.states
          for (const s of c.samples) if (hit.samples.length < 5 && s && !hit.samples.includes(s)) hit.samples.push(s)
        } else {
          global.set(key, { ...c, screens: [sc.id] })
        }
      }
      process.stdout.write(`  ${sc.id.padEnd(30)} ${String(found.length).padStart(4)} distinct recipes\n`)
    } catch (err) {
      result.driverFailures.push({ screen: sc.id, error: String(err.message ?? err).split('\n')[0] })
    } finally {
      await page.close()
    }
  }

  await browser.close()
  result.recipes = [...global.values()].sort((a, b) => b.count - a.count)
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

  console.log(`\nCOMPONENT CENSUS — ${config.id} ${version}`)
  const { result, outFile } = await censusComponents(config, version, only)

  const withStates = result.recipes.filter((r) => r.states?.hover || r.states?.focus).length
  const bySlot = new Map()
  for (const r of result.recipes) {
    const k = r.sig.slot ?? r.sig.role ?? r.sig.tag
    bySlot.set(k, (bySlot.get(k) ?? 0) + 1)
  }
  console.log(`\n  distinct recipes      : ${result.recipes.length}`)
  console.log(`  total instances       : ${result.recipes.reduce((a, r) => a + r.count, 0)}`)
  console.log(`  with hover/focus diff : ${withStates}`)
  console.log(`\n  recipes per component kind (top 15):`)
  for (const [k, n] of [...bySlot.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`      ${String(k).padEnd(26)} ${n}`)
  }
  if (result.driverFailures.length) {
    console.log(`\n  ⚠ DRIVER FAILURES: ${result.driverFailures.length}`)
    for (const f of result.driverFailures.slice(0, 8)) console.log(`      ${f.screen} — ${f.error.slice(0, 80)}`)
  }
  console.log(`\n  written → ${posix(relative(process.cwd(), outFile))}\n`)
}
