---
mode: agent
description: Run the document gates and report honestly
---

# Verify the package

```bash
cd spec-extract && node src/coverage.mjs --version <v> --strict   # every marker routed; none left live
cd ../internal  && npm run gate:docs                              # k · h · j
cd ../internal  && npm run gate:parity                            # only once a build exists
```

- **(k)** every spec carries §A1 with dataset **volumes**, a *Design requirement* and a *Source* on
  every block, no live `⚠ EXTRACT`, no "still unmeasured", no unnamed icon slot, no dangling
  library reference, a stated cell scale.
- **(h)** every field a spec names resolves to a `Source:` line or to `DATA-CONVENTIONS.md`, and
  every component block has a `Source:` line.
- **(j)** every named asset carries artwork.
- **parity** re-runs the four extraction passes against prototype AND build and diffs them —
  resting layout, overlays open, component recipes, in-place states. No build yet? Say the pass was
  **not run**; a gate nobody ran is not a gate that passed.

## Reporting
Quote the numbers. A list of green checks with no measurement is an incomplete report, and it reads
as more thorough than it is. If something was not run, **say it was not run** — a gate nobody ran is
not a gate that passed.
