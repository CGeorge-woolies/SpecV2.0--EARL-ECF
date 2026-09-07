# ECF - Data conventions

> These rules apply across the functional specifications. This is not an API contract and not a
> schema. Engineering owns the backend shape and wire-field mapping.

## 1. How to read a `Source:` line

`Source:` names the product value, the system that knows it, and whether Engineering still has to
source its real origin. A pseudo-field name is a shared product vocabulary, not a wire field.
`n/a - presentational` means the value is client state or chrome. `Eng to source` means the
behaviour is ruled even though the backend origin is not.

## 2. The vocabularies the design branches on

| Vocabulary | Where used | Values the design handles |
|---|---|---|
| Store type | Global shell and Order Summary | Supermarket, CFC, eStore, no store type selected |
| Country | Global shell, Order Summary and print flows | AU, NZ, no country selected |
| Persona | Global shell and Order Details | Store Team, Customer Support, Support Office |
| Order status | Order Summary, Search Orders, Order Details, Move to Shop Floor | Awaiting Pick, Deleted, Dispatched, Packed, Picked, Picking; the specs also use active/not dispatched as rule states |
| Picking status | Order Details shell | Awaiting Pick, Dispatched, Packed, Picked, Picking |
| Order Summary filter flags | Order Summary | Deleted Orders, Dispatched Orders, Hidden; eStore also has Split Supply View On |
| Session/window vocabulary | Order Summary | Session overview, Window overview; CFC also has the ambient split |
| Order table supply columns | Order Summary | Supplied %, eCom Supply, Shop Floor Supply |
| Line position | Order Line Detail | first, middle, last |
| Substitute state | Order Line Detail | allowed, not allowed, selected substitute |
| Label row action | Labels tab | closed, open; open exposes Delete and Print |
| Label status | Labels tab | Awaiting Pick, Packed, and other measured statuses; the complete production map remains open |
| Operational zone | Labels and Dash Indicators | Ambient, Chilled, Freezer/Frozen, Security; taxonomy and ordering remain open |
| Sample supply state | Samples tab | supplied, not supplied |
| Audit actor | Audit tab | user, system |
| Dash picking state | Timeline | picking, non picking |
| Date preset | Search Orders | Today, Yesterday, Last Week, Last Fortnight, Last Month, Last 3 Months, Last 6 Months, Last Year |
| Print context | Print and Export Documents | AU, NZ; invoice is AU dispatched-order work, packing slips and Print Order List are NZ-specific in the prototype notes |
| Flag-column letters | Order Summary order rows | No product flag-letter vocabulary is specified in the functional specs. Engineering must not infer one from fixture data. |

An emitted value outside a handled set needs a product rendering decision. It is not an integration
detail to hide in a generic fallback.

The terms `shell`, `settings` and `reports` are route/spec-family names used by the measurement
references, not data fields.

## 3. Time and the clock

The package uses an operational date, date-range boundaries, order/delivery dates, audit action
date/time and last-refreshed timestamps. The prototype dates and the 03/09/2026 15:30 baseline are
verification fixtures, not product values. Timezone, date format, range inclusivity, allowable
range, future/past-date policy, refresh cadence and stale-data behaviour are open wherever the
owning spec says so. A single product timezone and clock source must be chosen before time-based
behaviour is implemented; no UTC or local-time assumption is made here.

## 4. Currency / units

Quantities, UOM, price, amount, discount, article weights, supplied quantities, bags, percentages,
items per hour and RF Pick Rate are distinct measures. The specs do not settle currency, decimal
precision, weight units, quantity formatting or UOM display. Do not infer AUD/NZD, kg/g or a
rounding rule from the AU/NZ context or fixture literals. Engineering must source the values and
Product must rule any user-visible formatting that remains open.

## 5. Null handling

The specs require field and empty-state behaviour in several places but do not define a universal
null token. Missing customer-care, delivery or personal-shopper instructions, substitute/notes
values, sample values, date values and optional fraud/payment/details fields must not be rendered
as fixture text, `null`, `undefined` or a fabricated zero. The owning product decision must define
whether each missing value is omitted, shown with an approved empty state, or disables an action.
Until then, preserve the distinction between absent, not supplied, not applicable and zero.

## 6. Counting nouns - where two similar measures exist, define both

| Noun | Meaning | Must not be substituted with |
|---|---|---|
| Order count | Number of selected or listed orders | Line count, article count or row count |
| Line count | Number of order lines | Article count or order count |
| Article count | Number of article/items represented by the order or line inventory | Line count or order count |
| Row count | Number of rendered table rows | Order, line or article count |
| Selected count | Number of records currently selected for an action | Available, eligible or rendered count |
| Required count | Number of selected orders requiring a packing slip | Selected count or not-required count |
| Not-required count | Number of selected orders not requiring a packing slip | Required count |
| Tote/label count | Number of tote or label records | Order or article count |
| Items per hour | Performance rate of items over time | Article count or RF Pick Rate |

The Move to Shop Floor dialog may need both `orderCount` and `lineCount`; print flows may need
`totalCount`, `requiredCount` and `notRequiredCount`. Preserve each noun's meaning.

## 7. Domain model rules that span screens

- The global shell supplies store type, country and persona context. Route specs consume that
  context; they do not create competing context rules.
- Order Summary owns the shared order inventory and row selection. Order Details owns the selected
  order and its tabs. Order Line Detail owns one line reached from Articles.
- Move to Shop Floor is one cross-screen outcome for Order Summary bulk, Order Details whole-order
  and Order Details selected-line launches. The confirmation contract and return outcome are shared.
- Print/export is one cross-screen outcome. Callers pass trigger, context, eligibility and selected
  scope; artifact behaviour belongs to the print/export spec.
- Country and store type may change availability and vocabulary only where a spec explicitly says
  so. Persona-specific behaviour is rendered where it is owned, such as NZ Customer Support Edit
  Details.
- Fixture dates, counts, names, order numbers and customer values are verification data only.
- The global header is present across routes, the route mount begins below the 68px shell offset,
  and the content cap follows the shared 1920px maximum-width model.

## 7a. Feature differences - store/tenant switches, not country or type rules

Store type and country are context axes, not generic feature flags. A feature difference may be
implemented only when the owning spec names it: eStore Split Supply View; NZ window terminology,
Packing Slips and Print Order List; CFC ambient split; NZ Customer Support Edit Details; and AU
dispatched-order Print Invoice. Do not turn a country or store-type rendering difference into an
unscoped global toggle, and do not infer a difference for an unmeasured context.

## 8. Identifiers are strings, however numeric they look

Order numbers, order IDs, line numbers, article numbers, tote numbers, shopper IDs, fraud
references and other identifiers are opaque strings. Preserve leading zeroes, punctuation and
exact display identity. They must not be parsed as numbers for sorting, validation, storage or
comparison unless Engineering has a separate ruled requirement; numeric quantities and measures
remain numeric concepts.

## 9. Mock scaffolding - present in the prototype, must NOT ship

| Value | What the prototype does | What is true |
|---|---|---|
| Prototype explanatory entry-gate copy | Explains fixture context and presents context-driving controls | Do not ship explanatory fixture copy or prototype-only labels; production authentication, context source and persistence are open |
| `ANZ ECF Union Prototype` | Acts as product identity | The production product name is still to be supplied |
| Prototype version/timestamp | Shows build/version fixture metadata | Do not ship the baseline timestamp as product copy |
| `Prototype only` and `Store type / country differences in this prototype` | Explains fixture differences | Do not ship as user-facing production copy |
| Manual Picking demo flag popover, including `BCP for Manual Picking` and `Preview feature flags` | Provides prototype controls/labels | Do not build as a production control |
| Search fixture values, customer names, order numbers and date examples | Populate the search demonstration | Do not ship as production data or copy |
| `[DEMO] Department notifications will render here for printing.` | Stands in for a print artifact | Replace with real Department Notifications output; never render the placeholder |
| `[DEMO] Invoice for dispatched order will render here for printing.` | Stands in for invoice output | Replace with a real eligible AU invoice artifact; never render the placeholder |
| `Will load Admin Console MFE` | Stands in for Settings content | Do not build as final product copy; the administration surface is open |
| Reports scaffold with no production report content | Makes the Reports route navigable | Do not treat the absence as production behaviour; report inventory and output are open |

## 10. Naming inconsistencies to settle

- Session versus window terminology is context-sensitive in the prototype; Product must confirm the
  canonical domain meaning and when NZ uses Window.
- Frozen versus Freezer appears across Dash and Labels; Product must confirm whether these are one
  zone or two.
- Order status and picking status overlap in the visible vocabulary; Product must define the
  authoritative status and allowed transitions.
- Supplied %, eCom Supply and Shop Floor Supply are not interchangeable measures; Product must
  define their calculation and display semantics.
- `customerCareInstructions`, `deliveryInstructions` and `personalShopperInstructions` are separate
  instruction categories; their source, visibility and empty states must remain distinct.
- Article count, line count, row count and selected count must remain distinct as defined in section
  6.
- Print Invoice, Packing Slips, Print Order List and Labels are different artifact types; callers
  must not collapse them into a generic print result.

## 11. Where the outstanding sourcing work is - `ENG-SOURCING.md`, generated from the specs

Every `Source:` line marked `Eng to source` is an Engineering sourcing task. The generated
`ENG-SOURCING.md` is the authoritative index for those origins. It must cover identity/context,
navigation, refresh state, filters, operational date, order/session data, permissions, detail tabs,
search criteria/results, Dash telemetry, Move to Shop Floor eligibility/outcome, and print/export
artifacts. This document does not turn those source tasks into a schema or endpoint contract.