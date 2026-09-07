/**
 * OPEN-STATE CENSUS — drives every overlay OPEN and measures it, one-sided.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 *
 * `census.mjs` takes ONE INSTANTANEOUS SNAPSHOT of a RESTING screen. The spec
 * template requires two things that snapshot can never produce:
 *
 *   - authoring rule 7: "Overlays are specified OPEN. A tooltip, popover,
 *     dialog or toast is only covered when its OPEN STATE is written down —
 *     panel geometry, side/align/offset, and rendering layer."
 *   - coverage axis 6: motion "recorded AS MEASURED, never as transcribed",
 *     enter and exit separately, with duration and easing.
 *
 * So the pipeline MANDATED A MEASUREMENT IT HAD NO INSTRUMENT TO TAKE. Every
 * overlay panel and every duration therefore became `⚠ EXTRACT` — not because
 * anyone was careless, but by construction. The tell is in the resting probe
 * itself: it COUNTS overlay triggers by kind (`popover-trigger`,
 * `dialog-trigger`, `menu-trigger`, …) and then opens not one of them.
 *
 * The capability did exist — on the VERIFICATION side. `internal/gate-e` opens
 * every popover; `internal/gate-f` samples transitions properly. But both are
 * TWO-SIDED: they compare the prototype against a REBUILD, which does not exist
 * during `/new-app`. This file is the one-sided extraction equivalent, so the
 * measurement is in hand BEFORE a spec is written rather than after a build
 * exists to compare against.
 *
 * ── THE TWO RULES THAT ARE THE WHOLE DESIGN ─────────────────────────────────
 *
 * 1. ENUMERATE, NEVER HAND-PICK. From gate (e)'s own header: open-state
 *    coverage assembled as a hand-written list is "whatever someone had
 *    remembered to write a file for — asserted, never measured". Every trigger
 *    found on every censused screen is opened, so an overlay added in a later
 *    version is covered the day it is added, with no config edit.
 *
 * 2. MOTION IS A SERIES, NOT AN INSTANT. A missing transition is
 *    pixel-identical once settled — no measurement at any single moment can see
 *    it. Sample ACROSS the duration and require the value to TRAVEL. On exit,
 *    require the element to still be MOUNTED while it travels: a component that
 *    unmounts on the same tick its `open` prop flips cannot animate out
 *    whatever classes it carries, and no class-string read will ever catch it.
 *
 * ── HOW A PANEL IS FOUND (and why not by data-slot) ─────────────────────────
 *
 * By DOM DIFF, not by selector convention. Marking every element before the
 * interaction and looking for what is visible afterwards and was not before
 * catches BOTH implementations — portal-mounted panels (new nodes) and
 * always-mounted-but-hidden panels (existing nodes that became visible) — and
 * it is framework-agnostic. Keying off `[data-slot=popover-content]` would bind
 * this file to one component library, which `extraction.instructions.md`
 * forbids: everything in `src/` is generic, and app or framework detail belongs
 * in a config.
 *
 * Usage:  node src/census-open.mjs --config <path> --version <v> [--screens a,b]
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname, relative, sep } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'out', 'open-census')
const posix = (p) => p.split(sep).join('/')

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name)
  return i > -1 ? process.argv[i + 1] : fallback
}

/* ---- what counts as an overlay trigger ------------------------------------
 * Broad but principled: component-library slot conventions, ARIA popup
 * semantics, and native selects. A config may replace this wholesale via
 * `overlays.triggerSelectors`, but the default must find things in an app that
 * declares nothing, because an overlay nobody enumerated is an overlay nobody
 * specifies. */
const DEFAULT_TRIGGERS = [
  { kind: 'popover', sel: '[data-slot="popover-trigger"]', how: 'click' },
  { kind: 'dialog', sel: '[data-slot="dialog-trigger"]', how: 'click' },
  { kind: 'menu', sel: '[data-slot="menu-trigger"]', how: 'click' },
  { kind: 'select', sel: '[data-slot="select-trigger"]', how: 'click' },
  { kind: 'tooltip', sel: '[data-slot="tooltip-trigger"]', how: 'hover' },
  { kind: 'click-trigger', sel: '[data-base-ui-click-trigger]', how: 'click' },
  { kind: 'aria-popup', sel: '[aria-haspopup]:not([data-slot])', how: 'click' },
  { kind: 'aria-expandable', sel: '[aria-expanded]:not([data-slot]):not([aria-haspopup])', how: 'click' },
  /* Native <select> opens an OS-rendered popup with no DOM to measure. It is
   * enumerated and then classified as unmeasurable-by-design rather than
   * quietly skipped — "a confidently wrong list is worse than no list", and a
   * silent skip is indistinguishable from an overlay nobody found. */
  { kind: 'native-select', sel: 'select', how: 'os-native' },
]

/* ---- in-page helpers ------------------------------------------------------ */

/** Mark every element with its CURRENT visibility, so the post-interaction diff
 *  can tell a newly-mounted panel from one that was already there and hidden. */
const MARK = () => {
  const vis = (el) => {
    if (typeof el.checkVisibility === 'function') {
      return el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: false, visibilityProperty: true })
    }
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
  }
  for (const el of document.querySelectorAll('*')) {
    el.setAttribute('data-census-pre', vis(el) ? 'v' : 'h')
  }
}

const UNMARK = () => {
  for (const el of document.querySelectorAll('[data-census-pre]')) el.removeAttribute('data-census-pre')
}

/** A CSS path stable enough to re-find the same node after a close/reopen. */
const PATH_OF = `(el) => {
  const parts = []
  let n = el
  while (n && n.nodeType === 1 && n !== document.documentElement) {
    const p = n.parentElement
    if (!p) break
    const i = [...p.children].indexOf(n) + 1
    parts.unshift(n.tagName.toLowerCase() + ':nth-child(' + i + ')')
    n = p
  }
  return parts.join(' > ')
}`

/** Everything an open panel IS: geometry, the box model, where it sits relative
 *  to its trigger, which layer it renders in, and what would clip it. */
const MEASURE_PANEL = ({ triggerPath, kind }) => {
  const vis = (el) => {
    if (!el) return false
    if (typeof el.checkVisibility === 'function') {
      return el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: false, visibilityProperty: true })
    }
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
  }
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
  const px = (v) => Math.round(parseFloat(v) || 0)
  const box = (el) => {
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  }

  /* What appeared, or became visible, since MARK ran. */
  const appeared = [...document.querySelectorAll('*')].filter((el) => {
    const pre = el.getAttribute('data-census-pre')
    return (pre === null || pre === 'h') && vis(el)
  })
  if (!appeared.length) return { found: false }

  /* ── FINDING THE PANEL, and the two traps that make a naive answer wrong ──
   *
   * Trap 1: FOCUS GUARDS. Component libraries mount 1×1px sentinel nodes at
   * (-1,-1) either side of an overlay to trap focus. They are new, they are
   * "visible", and taking the outermost new node returns one of them — a clean
   * measurement of nothing.
   *
   * Trap 2: POSITIONERS. The outermost new node is usually a transparent
   * positioning wrapper with no size of its own (a 1440×0 anchor is typical).
   * Measuring it reports z-index `auto`, a transparent background and no
   * transition — a panel that appears to have no styling and no motion.
   *
   * Both were caught by this pass reporting eleven "stubs with no motion" on an
   * app whose popovers demonstrably animate. So: discard sub-pixel nodes, then
   * descend to the first element that actually PAINTS A SURFACE — a background,
   * a border or a shadow. That is the panel a builder has to reproduce. */
  const vw = document.documentElement.clientWidth
  const vh = document.documentElement.clientHeight
  const area = (el) => { const r = el.getBoundingClientRect(); return r.width * r.height }
  const isBackdrop = (el) => {
    const r = el.getBoundingClientRect()
    return r.width >= vw * 0.98 && r.height >= vh * 0.98 && el.textContent.trim().length === 0
  }
  const paints = (el) => {
    const s = getComputedStyle(el)
    const bgAlpha = (s.backgroundColor.match(/rgba?\([^)]*?([\d.]+)\)$/)?.[1] ?? '1')
    const hasBg = s.backgroundColor !== 'transparent' && parseFloat(bgAlpha) > 0.02
    const hasBorder = parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderBottomWidth) > 0 ||
                      parseFloat(s.borderLeftWidth) > 0 || parseFloat(s.borderRightWidth) > 0
    const hasShadow = s.boxShadow && s.boxShadow !== 'none'
    return hasBg || hasBorder || hasShadow
  }

  const MIN_W = 24, MIN_H = 16
  const substantial = appeared.filter((el) => {
    const r = el.getBoundingClientRect()
    return r.width >= MIN_W && r.height >= MIN_H
  })
  const backdrops = substantial.filter(isBackdrop)
  const candidates = substantial.filter((el) => !isBackdrop(el))

  if (!candidates.length) {
    /* Nothing of size appeared. Say which of the two nothings it was. */
    const guardsOnly = appeared.length > 0
    return {
      found: false,
      backdropOnly: backdrops.length > 0,
      note: backdrops.length
        ? 'a backdrop appeared but no sized panel — the overlay may render its content elsewhere'
        : guardsOnly
          ? `only sub-pixel nodes appeared (${appeared.length}) — focus guards/positioners, no painted panel. The trigger may be inert, or the panel may need a different interaction.`
          : 'nothing appeared and nothing became visible — the trigger did not open anything',
    }
  }

  /* Outermost sized candidate = the overlay's own subtree root (positioner or
   * panel). Then descend to the first surface that paints. */
  const outermost = candidates
    .filter((el) => !candidates.some((o) => o !== el && o.contains(el)))
    .sort((a, b) => area(b) - area(a))[0]

  const descendToPainted = (root) => {
    if (paints(root)) return root
    /* Breadth-first: the panel is the shallowest painted node, not the deepest
     * (descending greedily would return an inner badge or button). */
    const queue = [...root.children]
    while (queue.length) {
      const el = queue.shift()
      const r = el.getBoundingClientRect()
      if (r.width >= MIN_W && r.height >= MIN_H && vis(el) && paints(el)) return el
      queue.push(...el.children)
    }
    return root   // nothing paints — a genuinely unstyled panel is a finding, not an error
  }
  const panel = descendToPainted(outermost)
  const panelWasWrapped = panel !== outermost
  const panels = candidates
    .filter((el) => el !== panel && !panel.contains(el) && !el.contains(panel))
    .sort((a, b) => area(b) - area(a))

  const cs = getComputedStyle(panel)
  const pb = box(panel)

  /* Placement relative to the trigger: which side it opened on, and the offset.
   * A panel that is correct in isolation and opens on the wrong side is wrong. */
  let placement = null
  const trigger = triggerPath ? document.querySelector(triggerPath) : null
  if (trigger) {
    const tb = box(trigger)
    const below = pb.y >= tb.y + tb.h - 2
    const above = pb.y + pb.h <= tb.y + 2
    const rightOf = pb.x >= tb.x + tb.w - 2
    const leftOf = pb.x + pb.w <= tb.x + 2
    placement = {
      side: below ? 'bottom' : above ? 'top' : rightOf ? 'right' : leftOf ? 'left' : 'overlapping/centred',
      offsetY: below ? pb.y - (tb.y + tb.h) : above ? tb.y - (pb.y + pb.h) : null,
      offsetX: rightOf ? pb.x - (tb.x + tb.w) : leftOf ? tb.x - (pb.x + pb.w) : null,
      alignLeftDelta: pb.x - tb.x,
      alignCentreDelta: Math.round((pb.x + pb.w / 2) - (tb.x + tb.w / 2)),
      triggerBox: tb,
    }
  }

  /* Rendering layer. A panel with the right pixels in the wrong layer is
   * clipped by any overflow-hidden ancestor and shrink-to-fits against a narrow
   * containing block. Structural requirement, not styling. */
  const ancestors = []
  for (let n = panel.parentElement; n; n = n.parentElement) ancestors.push(n)
  const clipping = ancestors
    .filter((a) => {
      const s = getComputedStyle(a)
      return /hidden|clip|auto|scroll/.test(s.overflow + s.overflowX + s.overflowY)
    })
    .slice(0, 4)
    .map((a) => ({
      tag: a.tagName.toLowerCase(),
      cls: (a.getAttribute('class') || '').slice(0, 60),
      overflow: getComputedStyle(a).overflow,
    }))
  const stackingParents = ancestors
    .filter((a) => {
      const s = getComputedStyle(a)
      return s.zIndex !== 'auto' || s.position === 'fixed' || s.transform !== 'none' || s.isolation === 'isolate'
    })
    .slice(0, 4)
    .map((a) => ({ tag: a.tagName.toLowerCase(), zIndex: getComputedStyle(a).zIndex, position: getComputedStyle(a).position }))

  const directChildOfBody = panel.parentElement === document.body
  const insideTrigger = trigger ? trigger.contains(panel) : false

  /* Rendered copy inside the panel — the same visible-only walk the resting
   * census does, so an unbuilt panel ("Calendar") is distinguishable from a
   * real one by more than its box. */
  const literals = new Set()
  const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT)
  let node
  while ((node = walker.nextNode())) {
    const t = node.textContent.trim().replace(/\s+/g, ' ')
    if (t.length >= 1 && t.length <= 120 && vis(node.parentElement)) literals.add(t)
  }

  const interactive = panel.querySelectorAll('button, a[href], input, select, textarea, [role="button"], [role="option"], [role="menuitem"], [tabindex]:not([tabindex="-1"])').length

  return {
    found: true,
    box: pb,
    path: pathOf(panel),
    placement,
    /* Every measurable value in real units — a builder on another platform
     * cannot resolve a utility class and must not have to. */
    style: {
      background: cs.backgroundColor,
      borderRadius: cs.borderRadius,
      border: cs.border === '0px none rgb(0, 0, 0)' ? 'none' : cs.border,
      boxShadow: cs.boxShadow === 'none' ? 'none' : cs.boxShadow,
      padding: `${px(cs.paddingTop)}px ${px(cs.paddingRight)}px ${px(cs.paddingBottom)}px ${px(cs.paddingLeft)}px`,
      zIndex: cs.zIndex,
      position: cs.position,
      maxWidth: cs.maxWidth,
      minWidth: cs.minWidth,
      overflow: cs.overflow,
      font: `${px(cs.fontSize)}px/${px(cs.lineHeight)}px ${cs.fontFamily.split(',')[0].replace(/"/g, '')} ${cs.fontWeight}`,
      color: cs.color,
    },
    layer: {
      portalled: directChildOfBody || !insideTrigger,
      directChildOfBody,
      renderedInsideTrigger: insideTrigger,
      clippingAncestors: clipping,
      stackingAncestors: stackingParents,
    },
    /* Pick the backdrop that actually PAINTS, not merely the first full-bleed
     * node. The same positioner/wrapper trap as the panel: a portal root and a
     * focus-guard container are both full-bleed and empty, and taking [0]
     * reported `rgba(0,0,0,0)` / `z-index: auto` for a backdrop the source
     * plainly sets to `bg-black/45 z-[3000]`. A spec author caught that by
     * noticing the measurement contradicted the source and refused to write it
     * down — which is the correct instinct, and the reason this is now fixed
     * rather than propagated. */
    backdrop: (() => {
      const painted = backdrops.filter(paints)
      const b = painted[0] ?? backdrops[0]
      if (!b) return null
      const bs = getComputedStyle(b)
      return {
        box: box(b),
        background: bs.backgroundColor,
        zIndex: bs.zIndex,
        position: bs.position,
        /* Say so when nothing among the candidates painted, rather than
         * presenting a transparent wrapper as the backdrop. */
        paints: painted.length > 0,
      }
    })(),
    content: {
      literals: [...literals].sort(),
      literalCount: literals.size,
      interactiveCount: interactive,
      tables: panel.querySelectorAll('table').length,
      /* An unbuilt panel is a box with a few words and no controls. gate (e)
       * found exactly this shipping as `<div>Calendar</div>`.
       *
       * SCOPED TO KINDS THAT SHOULD CARRY CONTENT. A TOOLTIP is a short label
       * with no controls BY DESIGN — applying this test to one flags every
       * correct tooltip in the app. Unscoped, it reported 60 stubs on this
       * prototype and every single one was a healthy tooltip: a false-positive
       * class, and a reviewer who chases 60 non-findings stops reading the
       * list. Only a panel that is supposed to hold something can be a stub. */
      looksLikeStub:
        !['tooltip'].includes(kind) &&
        interactive === 0 &&
        panel.textContent.trim().length < 24,
    },
    /* Recorded because it is a structural fact a builder needs: the panel is
     * wrapped in a transparent positioner that owns the placement. */
    wrappedInPositioner: panelWasWrapped,
    extraPanels: panels.slice(0, 3).map((p) => ({ box: box(p), text: p.textContent.trim().slice(0, 40) })),
  }
}

/** One motion sample of a known node. */
const SAMPLE = (path) => {
  const el = document.querySelector(path)
  if (!el) return { present: false }
  const s = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  return {
    present: true,
    opacity: +(+s.opacity).toFixed(3),
    x: Math.round(r.x),
    y: Math.round(r.y),
    w: Math.round(r.width),
    h: Math.round(r.height),
    transform: s.transform === 'none' ? 'none' : s.transform,
    transitionDuration: s.transitionDuration.split(',')[0].trim(),
    transitionProperty: s.transitionProperty.split(',')[0].trim(),
    animationDuration: s.animationDuration.split(',')[0].trim(),
    animationName: s.animationName.split(',')[0].trim(),
    easing: s.transitionTimingFunction.split(',')[0].trim(),
    /* Base UI / Radix style closing markers. Their PRESENCE proves the element
     * is deliberately kept mounted for its exit; their absence during a close
     * that still travels is fine, but absence PLUS immediate unmount is the
     * structural defect. */
    closingMarker: el.hasAttribute('data-closed') || el.hasAttribute('data-ending-style') || el.getAttribute('data-state') === 'closed',
    classList: (el.getAttribute('class') || '').slice(0, 120),
  }
}

/* ---- driving ------------------------------------------------------------- */

const ms = (s) => (/ms$/.test(s) ? parseFloat(s) : /s$/.test(s) ? parseFloat(s) * 1000 : 0)

/** Sample across a window rather than at one instant. */
async function series(page, path, windowMs, steps = 8) {
  const out = []
  const dt = Math.max(10, Math.round(windowMs / steps))
  for (let i = 0; i < steps; i++) {
    await page.waitForTimeout(dt)
    out.push(await page.evaluate(SAMPLE, path))
  }
  return out
}

/** True when some sample sits strictly between the endpoints — i.e. it moved.
 *  Opacity OR position, because a slide is motion just as much as a fade. */
function travelled(samples, settled) {
  const op = samples.some((s) => s.present && s.opacity > 0.001 && s.opacity < (settled.opacity ?? 1) - 0.02)
  const pos = samples.some((s) => s.present && (Math.abs(s.x - settled.x) > 2 || Math.abs(s.y - settled.y) > 2))
  const size = samples.some((s) => s.present && (Math.abs(s.w - settled.w) > 2 || Math.abs(s.h - settled.h) > 2))
  return { opacity: op, position: pos, size, any: op || pos || size }
}

async function openTrigger(page, sel, index, how) {
  const loc = page.locator(sel).nth(index)
  if (how === 'hover') await loc.hover({ force: true })
  else await loc.click({ force: true })
}

/** Thorough close, for CLEANUP between overlays. Escape does not close
 *  everything; a click far from the panel closes the click-outside kind. Both
 *  are attempted because a stuck overlay poisons every subsequent trigger. */
async function closeOverlay(page) {
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(60)
  await page.mouse.click(4, 4).catch(() => {})
  await page.waitForTimeout(60)
}

/** Close for MEASURING THE EXIT — one action, no waits, so sampling starts at
 *  t≈0.
 *
 *  This distinction is not fussiness. The thorough close above spends ~120ms on
 *  its second attempt before the caller can take a sample; against a declared
 *  100ms exit the animation is entirely over by the first read, and the pass
 *  reports "EXIT CANNOT ANIMATE — structural defect" about a component that
 *  animates perfectly. That false finding was produced by this very file and is
 *  exactly the "confidently wrong measurement" the harness rules forbid: a
 *  driver artefact must never be reported as a property of the build. */
async function closeFast(page, how) {
  if (how === 'hover') await page.mouse.move(2, 2).catch(() => {})
  else await page.keyboard.press('Escape').catch(() => {})
}

/* ---- main ---------------------------------------------------------------- */

export async function censusOpen(config, version, only) {
  const v = config.versions[version]
  if (!v) throw new Error(`unknown version "${version}"`)
  const url = pathToFileURL(v.build).href

  const ov = config.overlays ?? {}
  const triggers = ov.triggerSelectors ?? DEFAULT_TRIGGERS
  const viewport = ov.viewport ?? config.viewports?.[Math.floor((config.viewports?.length ?? 1) / 2)] ?? 1440
  /* SAMPLE, do not exhaust. One screen in this app carries 2,987 tooltip
   * triggers — one per table cell, all one recipe. A spec needs the recipe.
   * `coverage.mjs` enforces that this sample is honest by comparing the sampled
   * panels to each other and failing if they turn out to be several recipes. */
  const maxPerKind = ov.sampleSize ?? ov.maxPerKind ?? 3
  const screens = config.screens.filter((s) => !only || only.includes(s.id))

  const browser = await chromium.launch()
  const result = {
    generated: new Date().toISOString(),
    app: config.id,
    version,
    viewport,
    screens: {},
    driverFailures: [],
    /* Overlays a config explicitly declared out of scope, with the reason. An
     * absent overlay and a waived one must never look the same. */
    waivers: (ov.waivers ?? []).map((w) => ({ match: String(w.match), reason: w.reason })),
  }

  for (const sc of screens) {
    const measured = []
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

      for (const t of triggers) {
        const count = Math.min(await page.locator(t.sel).count(), maxPerKind)
        for (let i = 0; i < count; i++) {
          const id = `${sc.id}/${t.kind}#${i}`
          if ((ov.waivers ?? []).some((w) => new RegExp(w.match).test(id))) continue

          if (t.how === 'os-native') {
            /* Honest classification beats a silent skip. */
            const label = await page.locator(t.sel).nth(i).evaluate((el) => {
              const l = el.labels?.[0]?.textContent?.trim()
              return l || el.getAttribute('aria-label') || el.name || null
            }).catch(() => null)
            measured.push({
              id, kind: t.kind, index: i, label,
              measurable: false,
              why: 'native <select> — the option list is rendered by the OS, not the DOM. Its OPTIONS are measurable (recorded), its POPUP is not.',
              options: await page.locator(t.sel).nth(i).evaluate((el) => [...el.options].map((o) => o.textContent.trim())).catch(() => []),
            })
            continue
          }

          try {
            const triggerPath = await page.locator(t.sel).nth(i).evaluate(new Function('el', `return (${PATH_OF})(el)`))
            const label = await page.locator(t.sel).nth(i).evaluate((el) =>
              (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48) || null).catch(() => null)

            /* Phase A — identify and measure the settled panel. */
            await page.evaluate(MARK)
            await openTrigger(page, t.sel, i, t.how)
            await page.waitForTimeout(ov.settleMs ?? 420)
            const panel = await page.evaluate(MEASURE_PANEL, { triggerPath, kind: t.kind })
            await page.evaluate(UNMARK)

            if (!panel.found) {
              measured.push({ id, kind: t.kind, index: i, label, opened: false, ...panel })
              await closeOverlay(page)
              continue
            }

            /* Phase B — motion. Re-drive the SAME node: close, reopen, sample
             * from t=0, then close and sample the exit. Enter and exit are
             * recorded separately because an exit is not the enter reversed,
             * and the exit is the half that gets dropped. */
            await closeOverlay(page)
            await page.waitForTimeout(240)

            await openTrigger(page, t.sel, i, t.how)
            const settledProbe = await (async () => {
              await page.waitForTimeout(ov.settleMs ?? 420)
              return page.evaluate(SAMPLE, panel.path)
            })()
            const window = Math.max(ms(settledProbe.transitionDuration), ms(settledProbe.animationDuration), 180) * 1.4

            await closeOverlay(page)
            await page.waitForTimeout(300)
            await openTrigger(page, t.sel, i, t.how)
            const enter = await series(page, panel.path, window)
            await page.waitForTimeout(window)
            const settled = await page.evaluate(SAMPLE, panel.path)

            /* One close action, no waits — sampling must start at t≈0 or a fast
             * exit is over before the first read (see closeFast). */
            await closeFast(page, t.how)
            const exit = await series(page, panel.path, window)
            await page.waitForTimeout(window + 250)
            const afterExit = await page.evaluate(SAMPLE, panel.path)

            const enterTravel = travelled(enter, settled)
            const exitTravel = travelled(exit.filter((s) => s.present), settled)
            const stayedMountedWhileClosing = exit.some((s) => s.present)
            const hasAnimClass = /animate-|fade-|zoom-|slide-/.test(settled.classList || '')
            const declaredMs = Math.max(ms(settled.transitionDuration), ms(settled.animationDuration))

            measured.push({
              id, kind: t.kind, index: i, label, opened: true,
              panel,
              motion: {
                declared: {
                  transitionDuration: settled.transitionDuration,
                  transitionProperty: settled.transitionProperty,
                  animationDuration: settled.animationDuration,
                  animationName: settled.animationName,
                  easing: settled.easing,
                },
                enter: { travelled: enterTravel, samples: enter.map((s) => (s.present ? { o: s.opacity, x: s.x, y: s.y } : null)) },
                exit: {
                  travelled: exitTravel,
                  stayedMountedWhileClosing,
                  carriedClosingMarker: exit.some((s) => s.present && s.closingMarker),
                  unmountedAfter: !afterExit.present,
                  samples: exit.map((s) => (s.present ? { o: s.opacity, x: s.x, y: s.y } : null)),
                },
                /* The three findings a class-string read cannot produce. */
                verdict:
                  declaredMs === 0 && !enterTravel.any
                    ? (hasAnimClass
                        ? 'NONE — measured. Animation class names present but no rule behind them (declared duration 0s, nothing travelled). Do not transcribe the classes.'
                        : 'NONE — measured. No transition declared and nothing travelled. This is a design decision and must be recorded as one.')
                    : !stayedMountedWhileClosing && enterTravel.any
                      ? 'ENTER animates, EXIT CANNOT — the node is gone on the first sample after close. A component that unmounts on the same tick its open prop flips cannot animate out, whatever classes it carries. STRUCTURAL, not styling.'
                      : `MEASURED — enter ${enterTravel.any ? 'travels' : 'does not travel'}, exit ${exitTravel.any ? 'travels' : 'does not travel'}, declared ${settled.transitionDuration}/${settled.animationDuration} ${settled.easing}`,
              },
            })
            await closeOverlay(page)
            await page.waitForTimeout(120)
          } catch (err) {
            result.driverFailures.push({ screen: sc.id, overlay: id, error: String(err.message ?? err).split('\n')[0] })
            await closeOverlay(page).catch(() => {})
          }
        }
      }
      /* ---- MANUAL RECIPES — the escape hatch auto-discovery needs ----------
       * Auto-discovery finds overlays that DECLARE themselves: a component
       * library's slot attribute, `aria-haspopup`, `aria-expanded`. A dialog
       * opened by a plain `<button onClick={() => setOpen(true)}>` declares
       * nothing and is invisible to every selector — and those are usually the
       * most consequential overlays in the app (confirmations, destructive
       * actions, printed-document previews).
       *
       * So a config may name them. This is the ONE place a hand-written list is
       * correct rather than the anti-pattern gate (e) warns about, because it
       * covers what enumeration provably cannot reach — and `coverage.mjs`
       * still holds the discovered-vs-measured line around it. */
      for (const rec of (ov.extra ?? []).filter((r) => r.screen === sc.id)) {
        const id = `${sc.id}/manual:${rec.id}`
        try {
          /* RESET BEFORE **EVERY** INVOCATION OF A RECIPE.
           *
           * A recipe is not idempotent: most of them reach their state by
           * TOGGLING something. Run `select a row, then click the action`
           * twice against the same page and the second run deselects the row
           * it needs — the action reports itself as permanently gated even
           * though it is reachable, and the failure is indistinguishable from
           * a real product gate.
           *
           * That is not hypothetical: this pass opens each recipe up to three
           * times (identify, then enter, then exit), and instrumenting one
           * showed `checkedAfter=1` on the first call and `checkedAfter=0` on
           * the second. So the framework guarantees the precondition instead of
           * asking every recipe author to write an idempotent one — reloading
           * is cheap next to being wrong about a requirement. */
          const resetScreen = async () => {
            await page.goto(url, { waitUntil: 'networkidle' })
            await page.waitForTimeout(300)
            if (sc.gate !== false) await config.entryGate.pass(page)
            await sc.go(page, { nav: navHelper, tab: tabHelper, openOrder: openOrderHelper })
            await page.waitForTimeout(200)
          }
          const openFresh = async () => { await resetScreen(); await rec.open(page) }

          await resetScreen()
          await closeOverlay(page)
          await page.evaluate(MARK)
          await rec.open(page)
          await page.waitForTimeout(ov.settleMs ?? 420)
          if (rec.assert && !(await rec.assert(page))) throw new Error('recipe assert failed — the overlay did not open')
          const panel = await page.evaluate(MEASURE_PANEL, { triggerPath: null, kind: "manual" })
          await page.evaluate(UNMARK)

          let motion = null
          if (panel.found) {
            const close = rec.close ?? ((p) => p.keyboard.press('Escape'))
            await close(page)
            await page.waitForTimeout(300)
            await openFresh()
            await page.waitForTimeout(ov.settleMs ?? 420)
            const settled = await page.evaluate(SAMPLE, panel.path)
            const window = Math.max(ms(settled.transitionDuration), ms(settled.animationDuration), 180) * 1.4
            await close(page)
            const exit = await series(page, panel.path, window)
            await page.waitForTimeout(window + 250)
            const afterExit = await page.evaluate(SAMPLE, panel.path)
            const exitTravel = travelled(exit.filter((s) => s.present), settled)
            motion = {
              declared: {
                transitionDuration: settled.transitionDuration,
                animationDuration: settled.animationDuration,
                animationName: settled.animationName,
                easing: settled.easing,
              },
              exit: {
                travelled: exitTravel,
                stayedMountedWhileClosing: exit.some((s) => s.present),
                unmountedAfter: !afterExit.present,
              },
              verdict: `MEASURED (manual recipe) — declared ${settled.transitionDuration}/${settled.animationDuration} ${settled.easing}, exit ${exitTravel.any ? 'travels' : 'does not travel'}`,
            }
          }
          measured.push({ id, kind: 'manual', index: 0, label: rec.label ?? rec.id, opened: panel.found, panel, motion, recipe: true })
          await closeOverlay(page)
        } catch (err) {
          result.driverFailures.push({ screen: sc.id, overlay: id, error: String(err.message ?? err).split('\n')[0] })
          await closeOverlay(page).catch(() => {})
        }
      }
    } catch (err) {
      result.driverFailures.push({ screen: sc.id, overlay: '(screen setup)', error: String(err.message ?? err).split('\n')[0] })
    } finally {
      await page.close()
    }

    result.screens[sc.id] = { label: sc.label, spec: sc.spec, overlays: measured }
    const opened = measured.filter((m) => m.opened).length
    const notMeasurable = measured.filter((m) => m.measurable === false).length
    const empty = measured.filter((m) => m.opened === false).length
    process.stdout.write(
      `  ${sc.id.padEnd(30)} ${String(opened).padStart(3)} opened · ${empty} produced no panel · ${notMeasurable} OS-native\n`
    )
  }

  await browser.close()
  mkdirSync(OUT, { recursive: true })
  const outFile = join(OUT, `${version}.json`)
  writeFileSync(outFile, JSON.stringify(result, null, 2))
  return { result, outFile }
}

/* Navigation helpers, matching census.mjs so a config's `go` works unchanged in
 * both passes. Kept here rather than imported to keep each pass runnable alone. */
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

  console.log(`\nOPEN-STATE CENSUS — ${config.id} ${version}`)
  const { result, outFile } = await censusOpen(config, version, only)

  const all = Object.values(result.screens).flatMap((s) => s.overlays)
  const opened = all.filter((o) => o.opened)
  const stubs = opened.filter((o) => o.panel?.content?.looksLikeStub)
  const noMotion = opened.filter((o) => /^NONE/.test(o.motion?.verdict ?? ''))
  const deadClasses = opened.filter((o) => /no rule behind them/.test(o.motion?.verdict ?? ''))
  const noExit = opened.filter((o) => /EXIT CANNOT/.test(o.motion?.verdict ?? ''))

  console.log(`\n  overlays enumerated : ${all.length}`)
  console.log(`  measured OPEN       : ${opened.length}`)
  console.log(`  no panel produced   : ${all.filter((o) => o.opened === false).length}`)
  console.log(`  OS-native (no DOM)  : ${all.filter((o) => o.measurable === false).length}`)
  console.log(`\n  motion: none (measured)      : ${noMotion.length}`)
  console.log(`  motion: DEAD ANIMATION CLASS : ${deadClasses.length}   ← names present, no rule behind them`)
  console.log(`  motion: NO EXIT (unmounts)   : ${noExit.length}   ← structural, invisible to every class read`)
  if (stubs.length) console.log(`\n  ⚠ ${stubs.length} panel(s) look like STUBS (no controls, <24 chars)`)
  if (result.driverFailures.length) {
    console.log(`\n  ⚠ DRIVER FAILURES (reported separately, NOT findings): ${result.driverFailures.length}`)
    for (const f of result.driverFailures.slice(0, 10)) console.log(`      ${f.overlay} — ${f.error.slice(0, 80)}`)
  }
  console.log(`\n  written → ${posix(relative(process.cwd(), outFile))}\n`)
}
