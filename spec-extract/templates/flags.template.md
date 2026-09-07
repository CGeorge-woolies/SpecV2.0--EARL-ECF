# <PRODUCT> — Divergence register

> Every place the **requirement** and the **prototype** part company, plus every ambiguity.
> **Only conflicts block a build.**

| Type | Meaning | Disposition |
|---|---|---|
| **Business-rule extension** | Product supplies logic the mock could not encode | **Expected.** Record it as the requirement |
| **Business-rule conflict** | the rule and the designed experience cannot both hold | **BLOCKS BUILD.** Design must reconcile |
| **Spec defect** | the pack failed to describe what the prototype does | fix the spec **and** the rule that let it through |
| **Mock scaffolding** | exists only to make a static demo work | **Must not be built.** Name it at the component |

## Index

| ID | Screen | Severity | Status | Type | One-line resolution |
|---|---|---|---|---|---|

---

### F-NNN — <one-line title>

| | |
|---|---|
| **Type** | |
| **Severity** | |
| **Status** | Open / **Ruled** (who, when) / Closed |
| **Owner** | |
| **Screens** | |

**The requirement.** State it **first and in full**.

**What the prototype does** *(for reference — do not build this)*: …

**Why the requirement wins.** The reasoning. This is what stops the rule being re-litigated.

**Does the fixture exercise this divergence?** If **no**, a comparison against the prototype is
**silent on this requirement** — and is equally consistent with the violation. Verify it by direct
assertion on the logic instead.

> **A do-not-build call-out must also appear at the COMPONENT BLOCK.** A builder reads the block; a
> flag register is where a decision is *reasoned*, the spec is where it is *delivered*.
