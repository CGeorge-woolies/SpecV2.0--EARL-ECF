---
mode: agent
description: Write or revise one component block to the pack's standard
---

# Specify one component

Given a component id (e.g. `SCR.CMP-40`) or a name, produce a block that satisfies both gates.

Fill every field. `n/a` is an acceptable answer; **a missing field is not**.

- **Design requirement** — what must be true for the user, and **why**, with no framework in it.
- **Source** — `` `pseudo.field` `` — meaning · **system** · `⚠ Eng to source` where open.
- **Business rules** — thresholds, eligibility, permissions, configurables, **and why**. If a mock
  is the only evidence, it is silent here, not correct: mark `⚠ OPEN` with a named owner.
- **Structure & placement** — box structure, child order, grid participation, width constraints,
  and **rendering layer** (inline vs portal, stacking, clipping ancestors).
- **Render** — the exact render of each data field, in real units.
- **States** — four tiers, **DEFAULT FIRST**, including `not rendered until <precondition>`.
- **Motion** — enter and exit separately, with duration and easing, or an explicit `none`.
- **Interactions** — `IF <trigger> THEN <outcome>`.
- **Acceptance** — GIVEN / WHEN / THEN.

Then answer the six classes a mock cannot express: **order · emptiness · time · derivation ·
concurrency · scale**.

If the render is tabular, **name the header cells in order** — "card" and "panel" carry no
structural information. If it computes what it draws, record centre, radius, sweep, ticks and label
positions as ratios.
