# What goes to Engineering, and what does not

> Decide this once. The commonest failure is shipping **more** than Engineering can use, so the
> parts that matter get read as optional.

## Ships

| Artifact | Authoritative for |
|---|---|
| `functional-spec/` | the **product requirement** — behaviour, rules, states, structure, motion |
| `ux-ui-library/` | **styling** — tokens in real units, component recipes, icon artwork |
| `DATA-CONVENTIONS.md` | data rules spanning every screen; the vocabularies the design branches on |
| `ENG-SOURCING.md` | every value still to be named, by screen — **generated from the specs** |
| `OPEN-ITEMS.md` | what is genuinely undecided, by owner |
| `divergences/` | where the requirement departs from the prototype, typed |
| `prototype/` | the built prototype — **a requirement artifact, not an attachment** |

**The prototype ships, and it is authoritative as a RUNNING artifact — never as source code.** A
team building on another stack cannot port it, but they can open, drive and measure it. Its rendered
geometry, colours, copy, states and data are the requirement; its class strings are one framework's
way of achieving them.

Each spec's **§A1** says what to take from it, where to find it by a stable literal, **how much of
it there is** so a partial extraction is detectable, and what is **fixture data that must not ship**.

## Does not ship

| | Why |
|---|---|
| the verification gates | ours. They target the prototype's own framework and are the wrong instrument for Engineering's platform |
| the extraction kit | it produced the package; it is not the package |
| the prototype's **source tree** | cannot be ported, and shipping it makes *"do not port this"* far harder to hold |
| any **schema, entity model or API contract** | see below |
| build history, superseded versions, decision logs | a builder needs what is true now, with the reasoning — not how it was got wrong before |

## Why there is no schema

Entity shape, wire field names and payload structure belong to **Engineering and the real backend**.
A shape reverse-derived from a design prototype's fixture store is **a guess wearing the costume of
a contract** — and because it is machine-readable and looks authoritative, it gets followed.

One package tried it. The result: **30 of 37 annotated properties were unsourced**, and the
descriptions had already drifted from the rulings in the same document — a field still marked
*"meaning unclear"* months after it was ruled. **The document that read most like a contract was the
one least likely to be true.**

**What Product owes on data is meaning and provenance:** *what this value is, and which system knows
it.* That lives on each component's `Source:` line, and the cross-cutting parts in
`DATA-CONVENTIONS.md`. Engineering maps those onto the real backend, and **that mapping is
Engineering's deliverable**.

## The test the package must pass

Given `{the specs} + {the library} + {the prototype}`, a team or an agent must be able to:

1. **recreate it to the pixel** — every component, region, state, interaction and transition;
2. **do so on a different platform** — the requirement must survive leaving the prototype's
   framework behind;
3. **wire it to real systems** — every value names what data it reflects and from which system;
4. **read it without reconstructing the conversation** that produced it;
5. **tell what is still undecided** from what is decided, with a named owner.

> A component they can render but not wire is a miss. So is one they can only build in the
> prototype's framework. So is one whose requirement they must reverse-engineer from a struck-out
> question.
