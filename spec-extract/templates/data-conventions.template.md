# <PRODUCT> — Data conventions

> **The handful of data rules that apply to EVERY screen**, and therefore cannot live inside any one
> spec. Everything else about data is stated **in the component block that renders it**, on its
> `Source:` line.
>
> **This is NOT an API contract and NOT a schema.** It names no endpoint, no payload shape and no
> wire format. Field names here are **the product's names for things**; Engineering maps them onto
> whatever the backend actually calls them, and that mapping is Engineering's deliverable.

## 1. How to read a `Source:` line

```
- **Source:** `pseudo.field` — what the value means, in product terms ·
  which system knows it · ⚠ Eng to source
```

| Part | Gives you |
|---|---|
| `` `pseudo.field` `` | **a name for the value, not a field on the wire.** It exists so the spec, the flag register and the sourcing index refer to the same thing. **Map it** |
| — *meaning* | what the value **is**, in product terms — the part only Product can supply |
| · *system* | **which system knows this**, at the granularity Product can be sure of. Never an endpoint |
| · *status* | absent = the baseline carries it · `⚠ Eng to source` = behaviour settled, origin not |
| `n/a — presentational` | reflects no server data — client view state or pure chrome |

**`⚠ Eng to source` is not a nullable field and not an open product question.** It means: *this
behaviour is ruled, build it, and tell us what the real field is called.*

## 2. The vocabularies the design branches on

Not shapes — the value sets the UI has a rendering for. **If the real system emits a value that is
not here, the design has no answer for it**, and that is a product gap to raise, not an integration
detail to absorb.

| Vocabulary | Where used | Values the design handles |
|---|---|---|

> **Casing is Engineering's call.** What matters is that one value maps to one rendering.

## 3. Time and the clock
## 4. Currency / units
## 5. Null handling
## 6. Counting nouns — where two similar measures exist, define both
## 7. Domain model rules that span screens
## 7a. Feature differences — store/tenant switches, not country or type rules
## 8. Identifiers are strings, however numeric they look
## 9. Mock scaffolding — present in the prototype, must NOT ship

| Value | What the prototype does | What is true |
|---|---|---|

> **A build that faithfully reproduces a fake is a defect**, not fidelity.

## 10. Naming inconsistencies to settle
## 11. Where the outstanding sourcing work is — `ENG-SOURCING.md`, generated from the specs
