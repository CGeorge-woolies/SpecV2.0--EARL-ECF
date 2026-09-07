# ECF - Divergence register

> Every material difference between a functional requirement and the prototype is recorded here.
> Only entries typed **conflict** block a build. Extensions are expected requirement detail;
> scaffolding is explicitly not production behaviour.

| Type | Meaning | Disposition |
|---|---|---|
| **Extension** | Product supplies logic the static prototype could not encode | Expected; build the requirement |
| **Conflict** | Requirement and prototype cannot both hold | BLOCKS BUILD until reconciled |
| **Spec defect** | The pack failed to describe prototype behaviour that matters | Fix the spec and its gate |
| **Mock scaffolding** | Exists only to make a static demo work | Must not be built |

## Index

| ID | Screen | Severity | Status | Type | One-line resolution |
|---|---|---|---|---|---|
| F-001 | Global shell | Medium | Ruled | Mock scaffolding | Replace prototype identity with the production product name |
| F-002 | Global shell | Medium | Ruled | Mock scaffolding | Do not ship prototype version/timestamp copy |
| F-003 | Entry gate | High | Open | Extension | PM and Engineering define authentication, context source and persistence |
| F-004 | Order Summary | Medium | Open | Extension | Source production volume, eligibility and refresh behaviour |
| F-005 | Order Details | Medium | Open | Extension | Define authoritative status and allowed transitions |
| F-006 | Order Details | Medium | Ruled | Mock scaffolding | Do not build Manual Picking demo flag popover |
| F-007 | Search Orders | Medium | Ruled | Mock scaffolding | Replace all search fixture values with production search data |
| F-008 | Print Documents | High | Open | Mock scaffolding | Replace Department Notifications demo body with a real artifact |
| F-009 | Print Documents | High | Open | Mock scaffolding | Replace invoice demo body with a real eligible AU invoice |
| F-010 | Settings | Medium | Open | Mock scaffolding | Do not build `Will load Admin Console MFE` as final UI |
| F-011 | Reports | Medium | Open | Mock scaffolding | Do not treat the empty Reports scaffold as production behaviour |
| F-012 | Order Summary | Medium | Open | Extension | Implement eStore supply columns and Split Supply View only as specified |
| F-013 | Order Summary | Medium | Open | Extension | Implement NZ window vocabulary and NZ print launch contracts |
| F-014 | Move to Shop Floor | High | Open | Extension | Apply one shared confirmation/outcome contract to all three callers |

### F-001 - Prototype product identity

| | |
|---|---|
| **Type** | Mock scaffolding |
| **Severity** | Medium |
| **Status** | Ruled (requirements package, 2026-09-07) |
| **Owner** | PM |
| **Screens** | 01 Global App Shell |

**The requirement.** Production uses the approved product identity and does not render the
prototype name as production copy.

**What the prototype does** *(for reference - do not build this)*: renders `ANZ ECF Union
Prototype` in the header.

**Why the requirement wins.** The literal identifies the measurement fixture, not the shipped
product.

**Does the fixture exercise this divergence?** Yes. The visible literal directly exercises it.

### F-002 - Prototype version metadata

| | |
|---|---|
| **Type** | Mock scaffolding |
| **Severity** | Medium |
| **Status** | Ruled (requirements package, 2026-09-07) |
| **Owner** | PM |
| **Screens** | 01 Global App Shell |

**The requirement.** The measured baseline version and timestamp are not production copy. Build
metadata is present only if PM explicitly confirms that production requirement.

**What the prototype does** *(for reference - do not build this)*: renders `Version` and `- as at`
with fixture metadata.

**Why the requirement wins.** Fixture metadata supports verification and is not user-facing product
meaning.

**Does the fixture exercise this divergence?** Yes.

### F-003 - Production entry context

| | |
|---|---|
| **Type** | Business-rule extension |
| **Severity** | High |
| **Status** | Open |
| **Owner** | PM and Engineering |
| **Screens** | 01 Global App Shell |

**The requirement.** Production must establish authentication, store type, country and persona
context before context-dependent routes render, with a real source and persistence rule.

**What the prototype does** *(for reference - do not build this)*: uses visible selectors and a
Continue action to drive fixture variants.

**Why the requirement wins.** The prototype has no production identity or persistence contract; its
controls are evidence of context axes, not the shipped entry mechanism.

**Does the fixture exercise this divergence?** No. It exercises selectors, not production identity.

### F-004 - Operational data behaviour

| | |
|---|---|
| **Type** | Business-rule extension |
| **Severity** | Medium |
| **Status** | Open |
| **Owner** | PM and Engineering |
| **Screens** | 02 Order Summary, 06a-06c Dash |

**The requirement.** Production supplies order volume, eligibility, refresh cadence, stale/loading/
failure handling and KPI definitions from operational systems.

**What the prototype does** *(for reference - do not build this)*: displays fixed fixture rows,
counts and timestamps.

**Why the requirement wins.** Static fixture values cannot define operational behaviour.

**Does the fixture exercise this divergence?** No; it is silent on live data behaviour.

### F-005 - Order status transitions

| | |
|---|---|
| **Type** | Business-rule extension |
| **Severity** | Medium |
| **Status** | Open |
| **Owner** | PM and Engineering |
| **Screens** | 03a Order Details Shell, 03b Articles |

**The requirement.** Status selection shows the current state and permits only approved transitions.

**What the prototype does** *(for reference - do not build this)*: renders five selectable measured
status options without production permission or transition rules.

**Why the requirement wins.** The measured select is a rendering inventory, not an authorization
contract.

**Does the fixture exercise this divergence?** No.

### F-006 - Manual Picking demo popover

| | |
|---|---|
| **Type** | Mock scaffolding |
| **Severity** | Medium |
| **Status** | Ruled (requirements package, 2026-09-07) |
| **Owner** | Engineering |
| **Screens** | 03a Order Details Shell |

**The requirement.** No Manual Picking demo flag popover is a production control.

**What the prototype does** *(for reference - do not build this)*: renders `BCP for Manual Picking`
and `Preview feature flags` in a popover.

**Why the requirement wins.** The component is explicitly a prototype aid and Manual Picking is
outside this document's production scope.

**Does the fixture exercise this divergence?** Yes.

### F-007 - Search fixture data

| | |
|---|---|
| **Type** | Mock scaffolding |
| **Severity** | Medium |
| **Status** | Ruled (requirements package, 2026-09-07) |
| **Owner** | Engineering |
| **Screens** | 05 Search Orders |

**The requirement.** Search results and criteria use production identifiers and customer data.

**What the prototype does** *(for reference - do not build this)*: uses fixture values, names,
order numbers and date examples.

**Why the requirement wins.** The spec explicitly marks them verification-only.

**Does the fixture exercise this divergence?** Yes.

### F-008 - Department Notifications artifact

| | |
|---|---|
| **Type** | Mock scaffolding |
| **Severity** | High |
| **Status** | Open |
| **Owner** | PM and Engineering |
| **Screens** | 08 Print and Export Documents |

**The requirement.** Department Notifications generates a real printable artifact after department
and print-option selection.

**What the prototype does** *(for reference - do not build this)*: renders `[DEMO] Department
notifications will render here for printing.`

**Why the requirement wins.** The spec explicitly requires real artifact behaviour and forbids the
placeholder.

**Does the fixture exercise this divergence?** Yes.

### F-009 - Invoice artifact

| | |
|---|---|
| **Type** | Mock scaffolding |
| **Severity** | High |
| **Status** | Open |
| **Owner** | PM, Finance and Engineering |
| **Screens** | 08 Print and Export Documents |

**The requirement.** Print Invoice is restricted to eligible dispatched AU orders and produces a
real invoice artifact.

**What the prototype does** *(for reference - do not build this)*: renders `[DEMO] Invoice for
dispatched order will render here for printing.`

**Why the requirement wins.** The placeholder cannot satisfy invoice eligibility, legal or tax
requirements.

**Does the fixture exercise this divergence?** Yes.

### F-010 - Settings placeholder

| | |
|---|---|
| **Type** | Mock scaffolding |
| **Severity** | Medium |
| **Status** | Open |
| **Owner** | PM and Engineering |
| **Screens** | 09 Settings |

**The requirement.** Settings may identify the route, but the Admin Console implementation and
production copy must be decided before build.

**What the prototype does** *(for reference - do not build this)*: renders `Will load Admin Console
MFE`.

**Why the requirement wins.** The copy describes an unresolved implementation and is explicitly
marked do-not-build.

**Does the fixture exercise this divergence?** Yes.

### F-011 - Reports scaffold

| | |
|---|---|
| **Type** | Mock scaffolding |
| **Severity** | Medium |
| **Status** | Open |
| **Owner** | PM and Engineering |
| **Screens** | 10 Reports |

**The requirement.** PM defines the report inventory, access and output before production reports
are built.

**What the prototype does** *(for reference - do not build this)*: renders only the route title and
shell context with no production report content.

**Why the requirement wins.** Absence in a prototype is not a production report definition.

**Does the fixture exercise this divergence?** Yes.

### F-012 - eStore supply inventory

| | |
|---|---|
| **Type** | Business-rule extension |
| **Severity** | Medium |
| **Status** | Open |
| **Owner** | PM and Engineering |
| **Screens** | 02 Order Summary |

**The requirement.** eStore replaces `Status` and `Supplied %` with `eCom Supply` and `Shop Floor
Supply`, and adds Split Supply View.

**What the prototype does** *(for reference - do not build this)*: encodes the difference through
fixture context and a prototype filter control.

**Why the requirement wins.** The context matrix is the product rule; the fixture only demonstrates
one rendering.

**Does the fixture exercise this divergence?** Yes.

### F-013 - NZ order-summary vocabulary and actions

| | |
|---|---|
| **Type** | Business-rule extension |
| **Severity** | Medium |
| **Status** | Open |
| **Owner** | PM and Engineering |
| **Screens** | 02 Order Summary, 08 Print and Export Documents |

**The requirement.** NZ uses Window terminology where specified and exposes Packing Slips and Print
Order List launch contracts.

**What the prototype does** *(for reference - do not build this)*: shows the measured NZ labels and
launchers in fixture screens.

**Why the requirement wins.** The rule must work beyond the measured fixture and preserve the shared
inventory.

**Does the fixture exercise this divergence?** Yes.

### F-014 - Shared Move to Shop Floor outcome

| | |
|---|---|
| **Type** | Business-rule extension |
| **Severity** | High |
| **Status** | Open |
| **Owner** | PM and Engineering |
| **Screens** | 02, 03b, 07 Move to Shop Floor |

**The requirement.** Bulk, whole-order and selected-line callers use one confirmation contract,
eligibility gate, selected scope and return outcome.

**What the prototype does** *(for reference - do not build this)*: provides separate dialog
components for the measured caller variants.

**Why the requirement wins.** The cross-screen specification deliberately centralises the outcome;
separate prototype components are implementation evidence, not separate product rules.

**Does the fixture exercise this divergence?** Yes, but only for measured callers.
