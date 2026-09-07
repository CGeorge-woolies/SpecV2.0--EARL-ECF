# Personas

Three personas are toggled from the header user menu (`UserMenu`), persisted to localStorage. Use `usePersona()` to gate persona-specific UI:

```tsx
const { isSupportOffice, isStoreTeam, isCustomerSupport } = usePersona()
{isSupportOffice && <Component />}
```

## Store Team
Frontline store-level user. Sees the base set of nav items and page actions with no elevated permissions.

## Support Office
Central/HQ-level user with elevated permissions — sees additional nav items and page-level actions not available to Store Team.

## Customer Support
Central customer-service user, distinct from Support Office — currently scoped to a single restriction (below): editing customer/delivery/fee fields on Order Details. Does not otherwise carry Support Office's elevated permissions.

## Nav items restricted to Support Office
_(none yet — nav is currently just the Order Summary placeholder)_

## Page-level permission table

| Page | Restriction | Personas |
|---|---|---|
| Order Details (`/order/detail?id={orderNo}`) | "Edit Details"/"Cancel" button, far-right of the grey toolbar (not a quick action) — puts the whole Details tab into edit mode: Name/Mobile/Phone/Work Number/Delivery Address 1-3 (Customer Number stays read-only), Delivery Date, Delivery Window, and Fulfilment Fee become editable — visible only on the **Details** tab, only for **NZ** stores (any store type), only for **Customer Support** | Customer Support only |
| Search Orders (`/search-orders`) | "Search all stores" checkbox in the Filters header — cross-store search is an elevated capability, not available to Store Team | Support Office, Customer Support |

Add a row here whenever a page introduces persona gating, describing exactly what differs between personas.
