/**
 * <APP NAME> — the ONLY app-specific file in `spec-extract/`.
 *
 * Copy this to `<app>.config.mjs` and fill it in. Everything under `src/` is
 * generic and must not be edited: it knows tables, triggers, overlays,
 * geometry, motion, TSX and class strings, and nothing about any product.
 *
 * The two rules that matter while filling this in:
 *   1. EVERY state must be able to PROVE it arrived (`assert`). A measurement
 *      taken in the wrong state is not a failed measurement — it is a
 *      confidently wrong one, with clean numbers and no error.
 *   2. The viewport list must STRADDLE every breakpoint that changes layout,
 *      not just every width cap. A responsive tier nothing measures is a tier
 *      nobody specifies.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '..', '..')

export default {
  id: 'my-app',
  name: '<Product name>',

  /* Each version names a BUILD (self-contained html — what the census drives)
   * and OPTIONALLY a source tree. Source is optional on purpose: an older
   * baseline may predate it, and the framework must still census that build. */
  versions: {
    'v1': { build: path.join(repo, 'build-v1.html'), source: null },
    'v2': { build: path.join(repo, 'build-v2.html'), source: path.join(repo, 'src-v2') },
  },

  /* Where the requirement documents live, so orphans reconcile in BOTH
   * directions: a source file no spec claims, and a spec ID no source claims. */
  specsDir: path.join(repo, 'requirements', 'functional-spec'),
  libraryFile: path.join(repo, 'requirements', 'ux-ui-library', 'README.md'),

  /* A module exporting a flat object of design-token name → value. Read for the
   * portable unit table: a NAMED token ports to any platform, a measured colour
   * does not. Path is relative to a version's `source`. Set null if none. */
  tokensModule: 'src/theme/tokens.ts',

  /* ---- ENTRY GATE ------------------------------------------------------- *
   * If the app opens on a splash, login or selector, get past it here — and
   * PROVE it. Omit `pass` if there is no gate, but always keep `assert`.      */
  entryGate: {
    async pass(page) {
      // e.g. await page.locator('select').first().selectOption({ label: 'X' })
      await page.waitForTimeout(500)
    },
    async assert(page) {
      // Something that is true ONLY past the gate.
      return (await page.locator('main').count()) > 0
    },
  },

  /* ---- VIEWPORTS -------------------------------------------------------- *
   * Include one width BELOW your smallest layout breakpoint, one ABOVE your
   * largest width cap, and the caps themselves.                              */
  viewports: [1024, 1280, 1512, 1920, 2400],
  screenshotHeight: 2200,

  /* ---- SCREEN × STATE MATRIX -------------------------------------------- *
   * `go` drives INTO the state; `assert` proves it arrived. Navigating by
   * ROUTE beats navigating by label — icon-only nav has no text, and label
   * matching then silently never fires.                                      */
  screens: [
    {
      id: 'home',
      label: '<Screen name>',
      spec: '01',                       // the spec file this screen maps to
      go: async (p, h) => {},           // h.nav(p, '/route') · h.tab(p, 'Label') · h.openOrder(p)
      assert: async (p) => /\/home/.test(p.url()),
    },
  ],

  /* Contexts that change what renders. An overlay behind a context gate is
   * unverified no matter how many viewports ran. */
  contexts: [
    { id: 'default', default: true },
  ],

  /* ---- OVERLAYS — the open-state pass ------------------------------------
   * Read by `census-open.mjs`, enforced by `coverage.mjs`.
   *
   * WHY THIS SECTION EXISTS. The resting census cannot see an overlay: a
   * closed dialog is pixel-identical whether it was built correctly or not
   * built at all, and motion is invisible to any measurement taken at a single
   * instant. The spec template REQUIRES both ("overlays are specified OPEN";
   * motion "recorded AS MEASURED"). Without this pass those requirements have
   * no instrument behind them, and every overlay becomes a `⚠ EXTRACT` that
   * survives into the handover. That is not hypothetical — it is how one real
   * run produced 335 of them.
   *
   * YOU USUALLY NEED NOTHING HERE. Triggers are auto-discovered from the DOM,
   * so an overlay added in a later version is covered the day it is added. The
   * fields below are for the cases discovery cannot reach. */
  overlays: {
    /* How many instances of each screen×kind to open. NOT exhaustive, on
     * purpose: one real screen carries ~3,000 tooltip triggers, one per table
     * cell, and they are 3,000 instances of ONE recipe. `coverage.mjs` keeps
     * the sample honest by comparing the sampled panels to each other and
     * failing if they turn out to be several recipes wearing one kind. */
    sampleSize: 3,

    /* Which viewport the open pass runs at. Defaults to the middle of your
     * `viewports`. Overlays rarely change with width; where one does, add a
     * screen entry that reaches it and it is sampled there too. */
    // viewport: 1440,

    /* How long to wait for a panel to settle before measuring it. */
    // settleMs: 420,

    /* Override the trigger taxonomy only if your app declares nothing the
     * defaults recognise (component-library slots, `aria-haspopup`,
     * `aria-expanded`, native `select`). `how` is 'click' | 'hover' |
     * 'os-native'. */
    // triggerSelectors: [{ kind: 'popover', sel: '[data-slot="popover-trigger"]', how: 'click' }],

    /* Overlays auto-discovery CANNOT reach, named by hand.
     *
     * Discovery finds overlays that declare themselves — a slot attribute,
     * `aria-haspopup`, `aria-expanded`. A dialog opened by a plain
     * `<button onClick={() => setOpen(true)}>` declares nothing, and those are
     * usually the ones that matter most: confirmations, destructive actions,
     * printed-document previews. Name them here.
     *
     *   { id, screen, label?, open(page), assert?(page), close?(page) }
     */
    extra: [
      // {
      //   id: '<overlay id>',
      //   screen: '<screen id from the matrix above>',
      //   open: async (p) => {
      //     await p.locator('main table tbody [data-slot="checkbox"]').first().click({ force: true })
      //     await p.getByRole('button', { name: /<the trigger>/i }).click()
      //   },
      //   assert: async (p) => (await p.getByRole('dialog').count()) > 0,
      //   close: async (p) => p.keyboard.press('Escape'),
      // },
    ],

    /* Out of scope, WITH A REASON — `match` is a regex against `<screen>/<kind>`
     * or `<screen>/<kind>#<index>`.
     *
     * A waiver is the ONLY way an overlay may go unmeasured, and it must say
     * why. An absent overlay and a deliberately-excluded one look identical in
     * a finished package, so `coverage.mjs` fails a waiver that carries no
     * reason — an unexplained exclusion is indistinguishable from an oversight. */
    waivers: [
      // { match: 'settings/tooltip', reason: 'scaffold route, no content to specify — see the out-of-scope note in spec 09' },
    ],
  },

  source: {
    roots: ['src'],
    componentGlobs: ['**/*.tsx'],
    /* Modules exporting `state → value` tables. These encode MEANING, so they
     * are reproduced INLINE in the component block rather than referenced. */
    semanticMapModules: [],
    /* Fixture data — extracted for verification, NEVER shipped. */
    fixtureModules: [],
    /* Anything matching these is demo scaffolding and must be marked
     * do-not-build AT THE COMPONENT, not only in a divergence register. */
    scaffoldingPatterns: [/^Demo/, /\[DEMO\]/],
  },

  /* ---- COMPONENT ↔ SPEC-ID MAP ------------------------------------------ *
   * Seed what you know; `resolve-spec-ids.mjs` derives the rest from literal
   * evidence. `null` = deliberately unmapped, with the reason. An entry that
   * is absent entirely is an ORPHAN and gets reported.
   *
   * This map is what makes every future delta cheap: it turns a source diff
   * into a list of spec IDs to revalidate. */
  componentSpecMap: {
    // 'pages/Home.tsx': ['01/SCR.CMP-01'],
    // 'components/ui/button.tsx': null,   // design-system primitive
  },

  /* Framework plumbing and design-system primitives, excluded from the orphan
   * report so the report stays short enough to actually read. */
  unmappedByDesign: [
    /^src\/components\/ui\//,
    /^src\/(main|App)\.tsx$/,
    /^src\/(lib|hooks|types|context)\//,
  ],
}
