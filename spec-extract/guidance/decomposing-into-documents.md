# Deciding which documents to write

> **"One spec per screen" is wrong**, and it is wrong in both directions: it produces one
> unreadable document for any route with tabs, and it produces **nothing at all** for the behaviour
> that belongs to no single screen.
>
> A real package of thirteen documents, decomposed by the rules below, would have been **five**
> under the naive rule — with one of them running to **3,000+ lines** across six tabs, and three
> whole documents missing.

---

## The six rules

### 1. One document per ROUTE — the default

A route the user can navigate to and link to. This is the base case and most documents are this.

### 2. A route with TABS splits — one per tab, plus one for the SHELL

Each tab gets its own document. **The shell gets one of its own**, and it owns everything that
persists while the tabs change:

- the tab strip and which tab is active
- the toolbar / action bar that stays put
- page-level guards (unsaved changes, navigation blocking)
- anything the route does on mount (scroll reset, fetch, title)
- **launch contracts** for flows started from the shell

**Split when a tab has its own component inventory** — its own set of things that render, its own
states, its own data. Not on length alone: one screen in the worked example runs to 2,500 lines and
is correctly a single document, because it is one inventory.

> **Why the shell is separate rather than living in the first tab.** Put it in a tab and it silently
> becomes that tab's property — the other five inherit behaviour from a document about something
> else, and a change to the toolbar gets made in a file named after a tab it has nothing to do with.

### 3. Chrome on EVERY screen gets its own document

Header, primary navigation, footer, the entry gate, global refresh, identity. Anything present
regardless of route.

> **Otherwise it is repeated in every document and drifts.** And the reciprocal matters: each screen
> spec needs a **"shell effects"** line naming what its route changes in the shell. A route that
> replaces the header's centre zone will otherwise be built correctly under a wrong header on every
> one of its tabs at once — that failure has happened.

### 4. Cross-screen ACTIONS get their own document

Bulk actions, row actions, anything whose **outcome** is the same wherever it is invoked.

**One component, one owning document.** Every other document keeps a **launch contract**, never a
copy:

| A launch contract states | |
|---|---|
| trigger | what starts it |
| gate | what must be true first |
| passed in | what the caller provides |
| comes back | what the caller receives |
| rendering layer | inline, portal, new route |

> *A bullet is where a component goes to die; **two homes is how it drifts**.*

### 5. A FLOW that spans screens, or produces an artifact, gets its own document

A multi-step dialog, a wizard, a **printed or exported document**. It is launched from somewhere but
owned nowhere else.

**A printed artifact is a real specification** — page headers that repeat, page breaks, what is on
paper that is not on screen. It cannot live inside a screen document, because it is not a screen.

### 6. Out of scope is a DECISION, and it is written down

A route that exists in the prototype and is not being specified says so, once, with the reason.
Silence reads as an oversight and someone re-derives it later.

---

## Numbering

| | |
|---|---|
| `NN-name` | a document in its own right |
| `NNa`, `NNb`, `NNc` | siblings under one parent concept |

Keep siblings adjacent so the set reads as a family. The letters are cheap; renumbering a package
mid-flight is not.

---

## Worked example — a fulfilment app, 13 documents

| # | Document | Rule |
|---|---|---|
| `01` | Orders Summary | **1** — a route |
| `02` | Order Detail: Details tab | **2** — a tab |
| `02a` | Order Detail: **shell**, tab strip, unsaved-changes guard | **2** — the shell |
| `03` | Order Detail: Articles tab | **2** |
| `04` | Order Detail: Labels tab | **2** |
| `05` | Order Detail: Audit tab | **2** |
| `05a` | Order Detail: Instructions tab | **2** |
| `05c` | Order Detail: Samples tab | **2** |
| `06` | Manual Picking & the printed Picking List | **5** — a flow + a printed artifact |
| `07` | Real Time Performance dashboard | **1** |
| `08` | Order actions & bulk actions | **4** — cross-screen outcomes |
| `09` | Global: app shell, header, gate, navigation | **3** |
| `10` | Search Orders | **1** |

Two routes existed and were **deliberately excluded**, recorded as out of scope (rule 6).

**Under "one spec per screen" this would have been five documents** — one of them 3,000+ lines
across six tabs — **and `06`, `08` and `09` would not exist at all.**

---

## Deriving the list from a census

The census gives you the raw material; these rules turn it into a document list.

1. **Every route in the screen matrix** → a candidate document *(rule 1)*.
2. **Any route the matrix visits in more than one state** — tabs, modes — → **split per state, plus
   a shell** *(rule 2)*.
3. **Compare the literal sets across routes.** Copy appearing on *every* screen is **shell**
   *(rule 3)*. The differ already hoists this: one change reported on every screen is one finding
   about the shell, not N findings about screens.
4. **Compare control kinds across routes.** The same action available from several places is a
   **cross-screen action** *(rule 4)* — give it one owner.
5. **Anything opening a route of its own, or producing print output**, is a **flow** *(rule 5)*.
6. **Every remaining route** → out of scope, in writing *(rule 6)*.

---

## Sanity checks on the finished list

| | |
|---|---|
| **Every component has exactly one owning document** | if two describe it, one of them should hold a launch contract instead |
| **No document describes chrome another one owns** | otherwise both drift |
| **Every screen names its shell effects** | what this route changes about the header, nav or title |
| **Every out-of-scope route is named** | with its reason |
| **No document is a stub** | under ~100 lines is usually a section of its parent, not a document |
| **No document mixes two inventories** | if §B2 reads as two unrelated lists, it is two documents |
