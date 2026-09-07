# The gates — ours, never shipped

These verify **our** work. They do not go to Engineering: the parity gate asserts against a specific
prototype's rendered DOM, and Engineering may be building on a platform where none of it applies. A
green suite here says the package is complete and the build matches — it says nothing about whether
another team's stack should look like this one.

```bash
cd internal && npm install          # playwright + chromium
```

---

## Two kinds of gate

### Document gates — no build required

Run these from day one. They ask whether the **specs** are complete enough to build from.

```bash
npm run gate:docs      # k · h · j
npm run gate:leak      # g
```

| Gate | Asks | Caught, in practice |
|---|---|---|
| **k** `gate-k-spec-completeness` | §A1 present with dataset **volumes**; every component block has a *Design requirement* and a *Source*; no live `⚠ EXTRACT`; no unnamed icon slot; every library reference resolves; a table screen states its cell scale | thirteen specs missing the same field, found once instead of thirteen times |
| **h** `gate-h-field-refs` | every field a spec names resolves to a `Source:` line or to `DATA-CONVENTIONS.md`, and every block has a `Source:` | a value asked for and sourced nowhere |
| **j** `gate-j-assets` | every named asset carries real artwork | an icon index listing 25 glyphs of which one had path data |
| **g** `gate-g-spec-leak` | no spec commentary leaked into UI copy | `⚠`-marked placeholder text shipped as if designed |

### The parity gate — needs a build

```bash
npm run gate:parity                 # all four passes
npm run gate:parity:open            # or one at a time
```

**One gate, four passes, no app-specific code.** It re-runs `spec-extract`'s own generic extraction
passes against the prototype and against your build, and diffs the structured results:

| `--pass` | Compares |
|---|---|
| `resting` | layout, regions, tables and header sets, control kinds, routes, geometry, cell scales |
| `open` | every overlay driven **open** — panel geometry, placement, rendering layer, enter/exit motion |
| `components` | the component-recipe catalogue, by style signature |
| `states` | scroll/sticky, expand-collapse, row hover and selected, focus-visible |

Differences are reported with a JSON path, a ±2px tolerance so sub-pixel engine noise is not a
finding, and run metadata ignored. **The prototype is the requirement**: a difference is a defect in
the build unless the divergence register says otherwise.

Each side gets its own `try`. A driver failure is reported **as a driver failure** and never folded
into the comparison — otherwise "the harness broke" silently becomes "the build is wrong".

---

## Why this replaced eight gates

Earlier versions shipped eight browser-driving gates — literals, navigation, popovers, motion,
drawers, expanders, census, pixel. Each was ~150 lines and each hardcoded **one** product's
selectors, nav indices and component names. Pointed at a different prototype they failed everywhere
or, worse, passed while measuring nothing.

Two of them also demonstrated the anti-pattern the others warned about: `gate-drawers` and
`gate-expanders` each drove **one named component**, so open-state coverage was "whatever someone
remembered to write a file for — asserted, never measured."

Parity is not a separate measurement problem. It is the same measurement, taken twice and compared.
Reusing the extraction passes means **the gates are prototype-agnostic for free**, and every
app-specific fact lives in the one config the extraction already needs.

## Configuration

`verification/config.mjs` holds three things and nothing else: which **app config** to reuse, where
the **prototype** is, and where **your build** is. If you find yourself putting a selector in a gate
file, it belongs in the app config instead.
