---
mode: agent
description: Formulate the Product & Design questions for a screen or a delta
---

# Ask the PM

**Read `spec-extract/guidance/asking-product-questions.md` first.** It is short, and it is the whole
method.

## Before you ask anything
Settle everything the artifacts can settle. The prototype answers **rendering**. Source answers
**identity, semantic maps and generated content**. Neither answers **meaning**, and asking Product a
question the artifacts already answer spends the one resource you cannot refill.

## Then, per component
Run the **eleven classes a mock cannot express**.

*About the data:* **order · emptiness · time · derivation · concurrency · scale**

*About the act — the ones most often missed, because a prototype has no actions that do anything:*
**scope · permission · effect · reversibility & failure · is-it-real**

*Framed by Product, answered by Engineering:* **source system · degraded state**

`n/a` is a fine answer. **Unasked is not** — an unasked question and an answered `n/a` look
identical in a finished spec.

**Look hard for the question that closes many.** Several items are often the same question wearing
different screens: *"no permission gating is observed"* appearing on nine specs is **one** question,
and answering it can be worth more than everything else on the list.

## Shape every question the same way
1. **the evidence** — quoted or measured, not paraphrased;
2. **what the artifacts already say**, and where;
3. **the gap or conflict**, in one sentence;
4. **the options**, each with its consequence;
5. **your recommendation and why**;
6. **what a sufficient answer looks like** — the part usually omitted, and the reason PMs answer
   *"yes, roughly"* to questions that needed a numerator and a denominator.

Order the list by **how much it blocks**, not by screen. And **say what is not a gap** — an audit
listing only problems misrepresents the package.

Drop any question where every plausible answer produces the same build. Decide it, say you decided
it, and move on.

## Ask these ONE AT A TIME
- **removals** — each with evidence and a proposed disposition;
- anything that **supersedes an existing ruling** — say so, and restate what is being overturned;
- anything where the prototype and a written requirement **disagree**.

Never batch a question whose answer changes the framing of the next one.

## Record the answer
In the **component block it governs**, definitively, **with its reasoning**. Not in a questions
table — a ruled decision filed as a question reads as unresolved. Open items keep a **named owner**.
Where the answer departs from the prototype, state the requirement **first and in full** and mark
the prototype version **do not build**.
