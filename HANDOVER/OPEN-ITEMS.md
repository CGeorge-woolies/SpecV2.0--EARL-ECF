# ECF - Open items

> Everything genuinely undecided, by owner. Ruled decisions and fixture-only values are not open
> items.

## 1. Blocking - a builder cannot proceed without guessing

| # | Item | Why it blocks | A sufficient answer | Owner | Ref |
|---|---|---|---|---|---|
| B-01 | Production authentication and entry context | The first route and context-dependent behaviour cannot be wired without an identity/context source | Define authentication, store type, country and persona sources, persistence and the no-context outcome | PM, IAM and Engineering | 01 §C0; GLOB.CMP-05 |
| B-02 | Order status authority and transitions | Status edits and action eligibility could grant or hide operational actions incorrectly | Define canonical status, editable statuses, allowed transitions and permission rules | PM, OMS and IAM | 03a §C0; ODSH.CMP-02 |
| B-03 | Print artifact contracts | Placeholder output cannot be replaced without artifact content and eligibility rules | Define Department Notifications, invoice, packing-slip, order-list and label artifact content, eligibility and output service | PM, Finance and Engineering | 08 §C0; PRN.CMP-02-08 |
| B-04 | Settings production surface | The placeholder is explicitly not a product implementation | Decide Admin Console embed, link or replacement surface and its ownership | PM and Engineering | 09 SET.CMP-02 |
| B-05 | Reports inventory and access | The prototype contains no report definition | Define reports, permissions, data scope and screen/export/print outputs | PM and Engineering | 10 RPT.CMP-02 |

## 2. Should-answer - scope, scale and policy

| # | Item | Why it matters | Owner | Ref |
|---|---|---|---|---|
| S-01 | Route availability, default route and disabled-route policy | Determines the shell navigation contract | PM | 01 GLOB.CMP-03 |
| S-02 | Product name, environment label and optional build metadata | Prevents fixture identity/version copy from becoming product copy | PM | 01 GLOB.CMP-01-02 |
| S-03 | Order Summary refresh cadence, stale threshold and failure handling | Defines operational trust in displayed orders | PM and Engineering | 02 ORDSUM.CMP-02 |
| S-04 | Filter defaults, persistence and deleted/dispatched/hidden eligibility | Defines the initial list and visibility policy | PM and OMS | 02 ORDSUM.CMP-03 |
| S-05 | Operational date range, timezone and future/past-date policy | Controls date filtering and reproducibility | PM and Engineering | 02 ORDSUM.CMP-04; 05 SRCH.CMP-05-06 |
| S-06 | Session, Window and CFC ambient-split definitions | Similar labels currently have unresolved domain meaning | PM and fulfilment planning | 02 ORDSUM.CMP-05 |
| S-07 | Order table ordering, row eligibility and supply-percentage derivation | Prevents counts and scan order from diverging between contexts | PM and OMS | 02 ORDSUM.CMP-07 |
| S-08 | Detail field editability, masking and address validation | Controls customer privacy and support actions | PM, IAM and Customer systems | 03c ODDET.CMP-01-03 |
| S-09 | Instructions source, visibility, stale/update and empty-state copy | Prevents operational instructions being shown or hidden incorrectly | PM and operations | 03d ODINS.CMP-01-03 |
| S-10 | Label generation, tote assignment, status map and row selectability | Defines whether Delete and Print are safe | PM and label service | 03e ODLBL.CMP-01-03 |
| S-11 | Sample attachment, fulfilment and supplied semantics | Gives the Samples table a product meaning | PM and sample system | 03f ODSMP.CMP-01-02 |
| S-12 | Audit retention, ordering, actor names and adjustments | Determines what users may rely on as history | PM and audit owner | 03g ODAUD.CMP-01-03 |
| S-13 | Line identifiers, money, discount, UOM, quantity and substitute rules | Prevents line detail from conflating commercial and fulfilment data | PM and Engineering | 04 LINE.CMP-01-03 |
| S-14 | Search matching, minimum query, status defaults and date boundaries | Defines search correctness and result volume | PM and Search/OMS | 05 SRCH.CMP-02-09 |
| S-15 | Dash KPI definitions, thresholds, zone taxonomy and ordering | Prevents operational metrics from being interpreted inconsistently | PM and performance owner | 06b DASHIND.CMP-01-04 |
| S-16 | Timeline bucket calculation, row identity and non-picking treatment | Defines the meaning of the performance table | PM and performance owner | 06c DASHTL.CMP-01-02 |
| S-17 | Move eligibility, irreversibility, audit, partial failures and undo | A wrong queue move has operational impact | PM, OMS and fulfilment operations | 07 MOVE.CMP-01-04 |
| S-18 | Department selection, invoice legal/tax content and mixed packing-slip handling | Controls document correctness | PM, Finance and Engineering | 08 PRN.CMP-02-06 |

## 3. Engineering - product is settled, the data origin is not

These are sourcing tasks, not Product questions. The complete generated list is in
`ENG-SOURCING.md`: identity/context, navigation, refresh status, filters, operational date,
overview counts, order rows, detail fields, instructions, labels, samples, audit, line detail,
search results, Dash telemetry, Move to Shop Floor outcomes and print/export artifacts.

## 4. Design deliverables that exist nowhere in the prototype

| # | Asset | Needed by | Owner |
|---|---|---|---|
| D-01 | Production entry/authentication and context-gate recipe | 01 | Design Systems |
| D-02 | Order header, toolbar, tab and production action recipes without the demo popover | 03a | Design Systems |
| D-03 | Real Department Notifications artifact and print pagination | 08 | Print Design |
| D-04 | Real invoice artifact and legal/tax presentation | 08 | Finance Design |
| D-05 | Settings/Admin Console production surface | 09 | Product Design |
| D-06 | Reports inventory and report output surfaces | 10 | Product Design |

---

## What is NOT a gap

The package already has 18 functional specifications covering the shell, Order Summary, Order
Details tabs, Order Line Detail, Search Orders, Dash, Move to Shop Floor, Print and Export
Documents, Settings and Reports. The UX/UI library is complete, measurement outputs exist, each
component block carries a `Source:` line, cross-screen ownership is assigned for Move to Shop Floor
and print/export, and fixture data is explicitly marked verification-only. The content cap, shell
offset, route ownership, context axes, tab inventories, launch contracts and measured open states
are specified. These are settled package facts, not open questions.