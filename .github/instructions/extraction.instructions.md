---
applyTo: "spec-extract/**"
---

# Working on the extraction framework

**`config/*.config.mjs` is the only app-specific file.** Everything in `src/` is generic — it knows
tables, triggers, overlays, geometry, motion, TSX and class strings, and nothing about any app. To
point the framework at a different React/Tailwind product, write a new config. **Never** put an app
detail in `src/`.

## Rules the harness itself must obey
- **Assert the state before measuring.** A measurement taken in the wrong state is not a failed
  measurement — it is a confident wrong one, returning clean numbers and no error.
- **A driver failure is reported AS a driver failure**, never folded into the result. A shared
  `try` turns *"the harness broke"* into *"the build is wrong"*.
- **Never swallow a timeout.** `.catch(() => {})` converts *the driver failed* into *the element
  does not exist*.
- **Every assertion must trace to something an artifact states.** Asserting a third-party library's
  internal class names invents a requirement — and because it is machine-checked, it outranks the
  written ones.
- **Respect visibility.** Tailwind's responsive idiom keeps both layouts in the DOM; a probe that
  ignores `display:none` is blind to every breakpoint.
- **A confidently wrong list is worse than no list.** If a pass cannot see a class of thing, say so
  and classify it separately — do not report it as a finding.
