#!/usr/bin/env node
/**
 * MEASURE — ask the prototype a question and get a real number back.
 *
 * The specs in this pack state every value they carry in real units. This tool
 * is for the values they DON'T carry: the ones nobody thought to ask about
 * until the moment you needed them, at 4pm, halfway through building a
 * component.
 *
 * The prototype in this pack is a REQUIREMENT ARTIFACT, not an attachment. It
 * is authoritative as a RUNNING thing — open it, drive it, measure it. This is
 * the scripted version of doing that, so an agent can do it too.
 *
 * ── USAGE ───────────────────────────────────────────────────────────────────
 *
 *   npm i playwright && npx playwright install chromium      (once)
 *
 *   # every computed value for the first element matching a selector
 *   node measure.mjs --sel "main table thead th"
 *
 *   # at a specific width, and the 3rd match
 *   node measure.mjs --sel "button" --nth 2 --viewport 1280
 *
 *   # measure something only visible after you drive the UI there
 *   node measure.mjs --sel "[role=dialog]" --click "text=Print Invoice"
 *
 *   # the whole box model for every match, as a table
 *   node measure.mjs --sel "main table tbody tr td" --all --brief
 *
 *   # dump every CSS custom property (the design tokens, as the browser sees them)
 *   node measure.mjs --tokens
 *
 * ── WHY THIS SHIPS, WHEN THE VERIFICATION GATES DO NOT ──────────────────────
 *
 * The gates assert this prototype's own React/Tailwind DOM — they would fail
 * against a correct build on your platform, and they answer a question that is
 * ours ("are the specs complete?") not yours ("is my build right?").
 *
 * This measures the prototype and tells you what it does. That is useful on any
 * platform, because the prototype's rendered output IS the requirement.
 */
import { existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n)
  return i > -1 ? process.argv[i + 1] : d
}
const has = (n) => process.argv.includes('--' + n)

if (has('help') || process.argv.length < 3) {
  console.log(`
measure — query the shipped prototype for real rendered values

  --sel <css>        what to measure (required unless --tokens)
  --nth <n>          which match, 0-based (default 0)
  --all              measure every match, not just one
  --brief            one line per match instead of the full report
  --viewport <px>    width to render at (default 1440)
  --click <sel>      click this first, to reach a state (repeatable)
  --hover <sel>      hover this first
  --wait <ms>        extra settle time after driving (default 400)
  --tokens           dump all CSS custom properties instead
  --gate-click <sel> click this to get past a splash/login gate (repeatable)
  --build <path>     prototype to open (default ./prototype/*.html)

examples
  node measure.mjs --sel "main table thead th" --all --brief
  node measure.mjs --sel "[role=dialog]" --click "text=Print Invoice"
  node measure.mjs --sel "header" --viewport 1024
  node measure.mjs --tokens
`)
  process.exit(0)
}

/* Find the prototype without being told, since there is exactly one. */
function findBuild() {
  const explicit = arg('build')
  if (explicit) return explicit
  const dir = join(HERE, 'prototype')
  if (!existsSync(dir)) throw new Error(`no prototype/ folder beside measure.mjs — pass --build <path>`)
  const html = readdirSync(dir).filter((f) => f.endsWith('.html'))
  if (!html.length) throw new Error(`no .html in ${dir} — pass --build <path>`)
  return join(dir, html[0])
}

/** Everything a builder could need about one element, in real units. */
const REPORT = ({ sel, nth, all }) => {
  const px = (v) => Math.round(parseFloat(v) || 0)
  const els = [...document.querySelectorAll(sel)].filter((el) =>
    typeof el.checkVisibility === 'function'
      ? el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: false, visibilityProperty: true })
      : !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
  )
  const pick = all ? els : els.slice(nth, nth + 1)
  return {
    totalMatches: document.querySelectorAll(sel).length,
    visibleMatches: els.length,
    results: pick.map((el) => {
      const s = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return {
        text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) || null,
        box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        spacing: {
          padding: `${px(s.paddingTop)} ${px(s.paddingRight)} ${px(s.paddingBottom)} ${px(s.paddingLeft)}`,
          margin: `${px(s.marginTop)} ${px(s.marginRight)} ${px(s.marginBottom)} ${px(s.marginLeft)}`,
          gap: s.gap === 'normal' ? null : s.gap,
        },
        type: {
          font: `${px(s.fontSize)}px / ${px(s.lineHeight)}px`,
          family: s.fontFamily.split(',')[0].replace(/["']/g, ''),
          weight: s.fontWeight,
          letterSpacing: s.letterSpacing === 'normal' ? null : s.letterSpacing,
          align: s.textAlign,
          transform: s.textTransform === 'none' ? null : s.textTransform,
        },
        colour: { color: s.color, background: s.backgroundColor },
        border: {
          width: `${px(s.borderTopWidth)} ${px(s.borderRightWidth)} ${px(s.borderBottomWidth)} ${px(s.borderLeftWidth)}`,
          colour: s.borderTopColor,
          radius: s.borderRadius,
        },
        effects: { boxShadow: s.boxShadow === 'none' ? null : s.boxShadow, opacity: s.opacity },
        layout: {
          display: s.display,
          position: s.position,
          zIndex: s.zIndex,
          flex: s.display.includes('flex') ? `${s.flexDirection} / ${s.justifyContent} / ${s.alignItems}` : null,
          gridTemplateColumns: s.display.includes('grid') ? s.gridTemplateColumns : null,
          maxWidth: s.maxWidth === 'none' ? null : s.maxWidth,
          minWidth: s.minWidth === '0px' ? null : s.minWidth,
          overflow: s.overflow === 'visible' ? null : s.overflow,
        },
        motion: {
          transition: s.transitionDuration === '0s' ? null : `${s.transitionProperty} ${s.transitionDuration} ${s.transitionTimingFunction}`,
          animation: s.animationDuration === '0s' ? null : `${s.animationName} ${s.animationDuration}`,
        },
      }
    }),
  }
}

const TOKENS = () => {
  const out = {}
  for (const sheet of [...document.styleSheets]) {
    let rules
    try { rules = sheet.cssRules } catch { continue }
    for (const rule of rules ?? []) {
      if (!rule.style) continue
      for (const prop of rule.style) {
        if (prop.startsWith('--')) out[prop] = rule.style.getPropertyValue(prop).trim()
      }
    }
  }
  /* Resolve against :root so var() chains land on real values. */
  const cs = getComputedStyle(document.documentElement)
  const resolved = {}
  for (const k of Object.keys(out).sort()) {
    const v = cs.getPropertyValue(k).trim()
    resolved[k] = v || out[k]
  }
  return resolved
}

/* Playwright is imported HERE, not at the top: `--help` must work before
 * anyone has run `npm run setup`, and a tool whose help text needs its own
 * dependencies installed is a tool people give up on at first contact. */
let chromium
try {
  ({ chromium } = await import('playwright'))
} catch {
  console.error(['', 'Playwright is not installed yet. Run:', '', '  npm run setup', ''].join('\n'))
  process.exit(2)
}

const build = findBuild()
const viewport = parseInt(arg('viewport', '1440'), 10)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: viewport, height: 1000 } })
await page.goto(pathToFileURL(build).href, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

/* ---- ENTRY GATE ---------------------------------------------------------
 * Many prototypes open on a splash, login or selector, and everything worth
 * measuring is behind it. This makes a BEST EFFORT to get past a common shape
 * (any <select> in the header, first real option) and is harmless when there is
 * no gate.
 *
 * If your prototype's gate is different, pass `--gate-click "<selector>"` (may
 * be repeated) or edit this block. If a measurement comes back empty, check
 * this FIRST: a measurement taken on the gate screen is not a failed
 * measurement, it is a confident wrong one. */
const gateClicks = process.argv.reduce((acc, a, i) => (a === '--gate-click' ? [...acc, process.argv[i + 1]] : acc), [])
if (gateClicks.length) {
  for (const g of gateClicks) { await page.locator(g).first().click({ force: true }).catch(() => {}); await page.waitForTimeout(300) }
} else {
  const selects = page.locator('header select, main select')
  const n = await selects.count()
  for (let i = 0; i < Math.min(n, 3); i++) await selects.nth(i).selectOption({ index: 1 }).catch(() => {})
  if (n) await page.waitForTimeout(500)
}

/* Drive to the state you want to measure. */
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--click') { await page.locator(process.argv[i + 1]).first().click({ force: true }); await page.waitForTimeout(400) }
  if (process.argv[i] === '--hover') { await page.locator(process.argv[i + 1]).first().hover({ force: true }); await page.waitForTimeout(400) }
}
await page.waitForTimeout(parseInt(arg('wait', '400'), 10))

if (has('tokens')) {
  const t = await page.evaluate(TOKENS)
  console.log(`\nCSS custom properties as resolved at :root  (${Object.keys(t).length})\n`)
  for (const [k, v] of Object.entries(t)) console.log(`  ${k.padEnd(38)} ${v}`)
  console.log('')
} else {
  const sel = arg('sel')
  if (!sel) { console.error('--sel is required (or use --tokens)'); process.exit(2) }
  const out = await page.evaluate(REPORT, { sel, nth: parseInt(arg('nth', '0'), 10), all: has('all') })
  console.log(`\n${sel}   @${viewport}px   — ${out.visibleMatches} visible of ${out.totalMatches} matched\n`)
  if (!out.results.length) console.log('  (nothing visible matched — is it behind a state you need to --click into?)\n')
  for (const [i, r] of out.results.entries()) {
    if (has('brief')) {
      console.log(`  #${String(i).padEnd(3)} ${String(r.box.w + 'x' + r.box.h).padEnd(11)} pad ${r.spacing.padding.padEnd(14)} ${r.type.font.padEnd(14)} ${r.colour.color.padEnd(22)} ${r.text ?? ''}`)
    } else {
      console.log(`  ── match #${i}${r.text ? `  "${r.text}"` : ''}`)
      console.log(JSON.stringify(r, null, 2).split('\n').map((l) => '  ' + l).join('\n'))
      console.log('')
    }
  }
}

await browser.close()
