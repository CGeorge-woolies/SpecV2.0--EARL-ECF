---
applyTo: "requirements/ux-ui-library/**,HANDOVER/ux-ui-library/**"
---

# Editing the UX/UI library

- **Every value carries provenance** — `file.tsx → Component`, never a minified symbol. Minification
  renames symbols between builds, so a stale symbol reads as verified while pointing elsewhere.
- **Every value in real units** — px, hex, ms, font-weight. A Tailwind class is realisation; a
  builder on another platform cannot resolve the scale and must not have to.
- **An ABSENT property is a statement, not a gap.** No marker means the recipe is complete. Where a
  value is genuinely missing, write `⚠ EXTRACT`. Do not "fill the gap" with a plausible default.
- **Record motion AS MEASURED, never as transcribed.** A class name is not evidence a rule exists;
  this bundle has carried animation class names with no rule behind them.
- **A component that GENERATES content records that content** — labels, counts, ordering, fixed
  dimensions — plus its measured open geometry. A class-string extraction cannot see any of it.
- **A named asset with no artwork is not an asset.** Check `icons/icons.json` holds real path data.
