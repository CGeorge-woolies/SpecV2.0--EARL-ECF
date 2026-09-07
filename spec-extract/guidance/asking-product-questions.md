# How to formulate the Product & Design questions

> **Read this before asking a PM anything.** A prototype answers *what it looks like*. It cannot
> answer *what it means*, *who may do it*, or *what happens next* — and a spec derived from it will
> confidently contain those gaps.
>
> The cost of a badly-formed question is not a wasted message. It is a **plausible wrong
> requirement** that passes every check and gets built.
>
> **This is derived from a real package**, by testing candidate question-classes against the 23
> questions that package actually needed. An earlier version of this file had six classes and would
> have missed twelve of them — including the one that unblocked nine specs at once.

---

## 1. The rule that governs all of this

**A static mock renders one arrangement of one dataset at one instant, for one user, with nothing
going wrong.** Everything outside that is invisible **by construction**, which is why careful review
never finds it. Only asking does.

The job is not "review the prototype harder". It is: **enumerate what the prototype structurally
cannot say, and ask about each one.**

---

## 2. The eleven classes

Run these against **every** component. `n/a` is a fine answer — but it must be *answered*, because
an unasked question and an answered `n/a` look identical in a finished spec.

The first six are about **the data**. The last five are about **the act** — and they are the ones
most often missed, because a prototype has no actions that do anything.

### About the data

| # | Class | Ask | Missed, it looks like |
|---|---|---|---|
| 1 | **Order** | Is this sequence a **rule**, or an accident of the fixture? | *"rows in source order"* — the mock's arbitrary array written down as a requirement |
| 2 | **Emptiness** | What renders at **zero**, at **null**, and **before the first load**? | Zero, null and unbuilt look identical in a screenshot. A builder given a table's columns and not told it starts empty **will invent a row** |
| 3 | **Time** | Does anything change with **elapsed time alone**? What is *now* — whose clock? | A threshold that silently passes; a "recent" badge that never expires |
| 4 | **Derivation** | Numerator, denominator, the window they cover, rounding, caps | A headline number nobody can reproduce, and two screens that disagree |
| 5 | **Concurrency** | What happens when **someone else changes this** while it is on screen? | One user, no refresh — the mock's whole world |
| 6 | **Scale** | What does this do at **1,500 rows** rather than 15? | A design workable for 13 audit rows and unusable at 1,300 |

### About the act — and about what is real

| # | Class | Ask | Missed, it looks like |
|---|---|---|---|
| 7 | **Scope / boundary** | This measure or rule — bounded by **what**? This store or the group? This proposition or every order? The **result set** or the **page**? | *"first order"* meaning two different things to two readers; a select-all that prints the wrong number of things |
| 8 | **Permission** | **Who may do this, and who may see it?** | The prototype gates nothing, so every action reads as available to everyone. **This is usually the single highest-leverage question in a package** — one role→capability matrix can close a dozen open items across nine screens |
| 9 | **Effect** | What actually **happens downstream** when this is clicked? What changes, and where? | A fully specified control with an unspecified consequence. In a mock, most actions are inert — so the UI gets built and the outcome does not |
| 10 | **Reversibility & failure** | Is this **undoable**? What is the **recovery path**? What happens when it **fails**? | Success toasts and no failure path; an irreversible action nobody decided should be irreversible |
| 11 | **Is it real?** | Is this value a **real attribute**, or fixture scaffolding? Is this constraint **intended**, or an artefact? | Three columns built for a field that does not exist; a limitation everyone assumes was designed |

> **Detectors.** Any spec sentence containing *"source order"*, *"as shown"* or *"in the order
> given"* is an **unasked question**. So is *"no permission gating is observed"* — that is a note
> that the prototype has none, not a statement that none is required.

### Two more that are Engineering's to answer but Product's to frame

| Class | Ask |
|---|---|
| **Source system** | **Which system is truth** for this value? Product names the system, not the endpoint or the field name |
| **Degraded state** | What does the screen do when an upstream system is **down or slow**? *"Behave as production does"* is a ruling, but it does not reach a builder — say what production does |

---

## 3. What makes a question worth asking

A good question is one where **different answers produce different builds**. If every plausible
answer leads to the same code, do not ask — decide it, say you decided it, and move on.

| | |
|---|---|
| **Consequential** | name what changes depending on the answer |
| **Answerable from the PM's own knowledge** | not from the code, the mock, or a system they do not own |
| **Decidable now** | it does not depend on another undecided thing. If it does, ask **that** first |
| **Bounded** | offer the real options, and say which you would pick and why |

---

## 4. The shape of a question — five parts, plus the one most people omit

1. **The evidence** — what the prototype does, quoted or measured. Not paraphrased.
2. **What the artifacts already say**, and where.
3. **The gap or conflict**, in one sentence.
4. **The options**, each with its consequence.
5. **Your recommendation**, with the reason.
6. **What a sufficient answer looks like.** ← *the one usually left out*

> **Why (6) matters.** Without it a PM cannot tell when they are done, and you get *"yes, roughly"*
> to a question that needed a numerator and a denominator. Write it as a phrase:
> *"the trigger, and whether it can move backwards once passed"* · *"numerator and denominator, each
> named"* · *"real / not-real, and if real, what sets it"* · *"intended / not, and the recovery if
> any"*.

**Example.**
> *The prototype hard-codes seven milestone thresholds (`1, 25, 50, 100, 200, 500, 1000`). The pack
> has no rule for which orders count. A fixed list silently stops working: a customer's 1,100th
> order falls off the end and is marked as nothing, with no error. Options: **(a)** keep the list,
> **(b)** a rule with no ceiling. I would take (b) — it needs no maintenance and cannot run out.*
> **A sufficient answer: the rule, and whether the first order is special.**

Giving your reading — and letting the PM overrule it — is faster for them and surfaces disagreement,
which is the point.

---

## 5. Order the list by how much it blocks

Not by screen, and not by the order you found them.

| Tier | Meaning |
|---|---|
| **Blocking** | a value is **rendered** whose meaning is undecided, or an action ships whose effect is unknown. A builder cannot proceed without guessing |
| **Should-answer** | scope, scale and policy. The build proceeds; the risk is that it is wrong later |
| **Engineering** | product is settled, the data origin is not. **These should never go to the PM** |

**Look hard for the question that closes many.** One package had *thirteen* open items across nine
specs all saying *"no permission gating is observed"*. That is **one** question, and answering it
was worth more than the other twenty-two combined. Before sending a list, check whether several
items are the same question wearing different screens.

---

## 6. Ask these ONE AT A TIME

Batch independent questions. **Never batch a question whose answer changes the framing of the next**
— you will get an answer to a question you should not have asked yet.

- **Removals.** A removal from the product is never a deletion of the requirement; it is a
  relocation or a supersession, and only the PM knows which. Present each on its own, with evidence
  and a proposed disposition.
- **Anything that supersedes an existing ruling.** Say plainly that it does, and restate the old
  rationale so the PM can see what they are overturning.
- **Anything where the prototype and a written requirement disagree.** That is a conflict, and
  conflicts are the only class that blocks a build.

---

## 7. What NOT to ask

| Do not ask | Because |
|---|---|
| Anything the prototype settles | It is a rendering question. Measure it |
| Anything the source settles | Identity, semantic maps, generated content. Read it |
| Wire format, field names, payload shape, casing | Engineering's, not Product's |
| *"Is this right?"* about something you have not stated | The PM will agree with a vague thing and disagree with the built thing |
| A question you can answer by picking the obvious option | Decide it, say so, move on |

> **The most common failure is asking Product an Engineering question.** *"What should this field be
> called?"* is not a product question. *"What does this value mean, and which system knows it?"* is.

---

## 8. Say what is NOT a gap

An audit that lists only problems **misrepresents the package**, and a PM reading it cannot tell a
thin spec from a thorough one with four open edges.

Alongside the questions, state plainly what is already complete — every component having a source
and a design requirement, ordering specified as a rule rather than as source order, temporal
behaviour named, scaffolding called out at the component, divergences typed and owned. Then name
**the pattern** in what remains. It is usually the same shape: **complete on what renders and when,
thinnest on what a number means, who may act, and what happens next** — precisely the three things a
static prototype cannot show.

---

## 9. Recording the answer

The answer goes **in the component block it governs**, stated definitively, with its reasoning.

- **Never leave a ruled decision in a questions table.** It reads as unresolved, and the next reader
  rebuilds the requirement from a struck-out question.
- **Keep the *why*.** It is what stops the rule being re-litigated or quietly optimised away.
  Compression is of *form*, never of *content*.
- **An open item keeps a named owner** and lives in the open-items section — which holds open items
  **only**.
- **Where the answer departs from the prototype**, state the requirement **first and in full**, and
  keep the prototype version visibly subordinate and marked **do not build**.

---

## 10. The two gates the answers serve

| Gate | Asks | Passing it means |
|---|---|---|
| **Rebuild-ready** | *Can they build the pixels?* | every region, component, field, state, motion and structural fact recorded |
| **Requirement-ready** | *Can they build the right thing, and wire it?* | every component has a **business rule**, every temporal state is named, every value's **source system** is named, every action's **effect and permission** is stated, and all mock scaffolding is marked must-not-build |

**A component can pass the first gate completely and be unbuildable.** That is the normal outcome of
working from a prototype, and it is exactly what these questions exist to prevent.
