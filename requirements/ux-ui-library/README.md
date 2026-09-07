# ANZ ECF — UX/UI Pattern Library (design-system extract)

> **Styling source of truth.** Functional specs reference this file; they do not re-spell chrome values.
> Values are extracted from `prototype/anz-ecf-copilot/src/theme/tokens.ts`, `spec-extract/out/component-census/v1.json`, `spec-extract/out/open-census/v1.json` and `spec-extract/out/state-census/v1.json`.

---

## 0.05 How to read a recipe — an ABSENT property is a STATEMENT

No marker means the recipe is complete. A property not listed is not set by the measured component.

A measured absence is written as `none — measured`. It is not a gap.

---

## 0.1 Unit scale — resolve every token to a REAL unit

The prototype uses a token module rather than leaving consumers to resolve utility classes. Token values are verbatim from `src/theme/tokens.ts`; source comments that provide a design-system path are retained in §1–3.

| Token family | Real values |
|---|---|
| Spacing | 2px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 120px |
| Radius | 2px, 4px, 8px, 10px, 12px, 14px, 16px, 20px, 24px, 9999px; measured pill values are written as `pill` |
| Typography | Roboto / Helvetica Neue / Arial / sans-serif; 10px, 11px, 12px, 13px, 14px, 16px, 18px, 20px; line heights 10px, 11px, 16px, 18px, 19px, 20px, 21px, 24px, 28px; font-weight 400, 500, 600, 700 |
| Motion | 0ms, 100ms, 150ms; easing `ease` or `cubic-bezier(0.4, 0, 0.2, 1)` |
| Layering | z-index 50 for popovers, selects and tooltips; z-index 3000 for modal backdrop; z-index 3001 for modal panel |

---

## 0. Token layering — reproduce ALL layers

| Layer | What it holds | Source |
|---|---|---|
| 1. Primitive | Raw hex/oklch/rgb values, px sizes, ms durations | `src/theme/tokens.ts`; computed render in the three census outputs |
| 2. Semantic | Role names such as `colorBgPrimary`, `colorActionLinkDefault`, `colorInputBorderFocus` | `src/theme/tokens.ts` comments |
| 3. Component | Distinct measured render treatments in buttons, badges, cards, fields, tables, overlays and links | `out/component-census/v1.json` recipes |
| 4. Scaffold | Route cap, shell offset, portal layers, backdrop and scroll behavior | `out/open-census/v1.json`; `out/state-census/v1.json`; functional specs |

---

## 0.5 Page scaffold layer

| Region | Width model | Padding | Notes |
|---|---|---|---|
| Shell header | 1440px measured viewport, 68px high fixed/sticky header | 16px horizontal in header controls where measured | Header remains visible across all 20 screens. Scroll appearance change is none — measured. |
| Route content cap | 1920px max content width, centred above that width | 24px page gutter at 1440px on dense routes | Order Summary content cap at 1440px: x=24px, w=1392px. |
| Dense table region | Route-width table plus row/cell scale per table recipe | 4px, 5px 8px, or 6px 8px cell padding by cluster | Header cells pin on scroll where state census reports `CHANGES ON SCROLL — measured`. |
| Portal overlay layer | Panels are portalled outside the trigger subtree | Panel padding per overlay recipe | Popover/select/tooltip layer uses z-index 50; modal layer uses backdrop 3000 and panel 3001. |

---

## 0.6 Rendering layers & stacking

| Component family | Layer requirement | Clipping ancestors | Backdrop |
|---|---|---|---|
| Tooltip | Portalled; not rendered inside trigger; wrapped in an absolute positioner with z-index 50 | none measured | none |
| Popover | Portalled; not rendered inside trigger; absolute stacking ancestor z-index 50 | none measured for toolbar and row-action popovers | none |
| Select dropdown | Portalled; fixed stacking ancestor z-index 50 | body overflow hidden measured | transparent fixed backdrop, 1440px × 1000px, paints false |
| Modal dialog | Portalled; fixed panel z-index 3001 | body overflow hidden measured | fixed 1440px × 1000px backdrop, background `oklab(0 0 0 / 0.45)`, z-index 3000, paints true |

---

## 0.7 Motion — recorded AS MEASURED, never as transcribed

| Component | Enter | Exit | Duration | Easing |
|---|---|---|---|---|
| Tooltip panel | opacity and position/size travel measured; sample opacity commonly 0.346 → 0.741 → 0.925 → 0.993 → 1 | opacity exits to 0.007 then unmounts | animation 150ms, transition 0ms | ease |
| Toolbar/filter popover | opacity, position and size travel measured; sample x/y resolves to final panel position | opacity exits 0.777/0.424 → 0.197/0.075 → 0.016/0 then unmounts | animation 100ms, transition 100ms | ease |
| Row-action popover | opacity travels; exit travels opacity, position and size | opacity exits 0.424 → 0.075 → 0 then unmounts | animation 100ms, transition 100ms | ease |
| Select dropdown | opacity, position and size travel measured | opacity exits 0.654 → 0.259 → 0.075 → 0.007 then unmounts | animation 150ms, transition 0ms | ease |
| Modal dialog | none — measured | hard cut: exit does not travel; unmounts without closing travel | 0ms | ease |
| Disclosure rows | no row-count or main-height delta; declared transition where measured | none — measured as no height delta | 150ms where declared; 0ms where `revealedTransition` is null | cubic-bezier(0.4, 0, 0.2, 1) where inherited from component transition |
| Table rows | none — measured | none — measured | 0ms | n/a |

---

## 1–3. Tokens (verbatim)

### Colour tokens

| Token | Real value | Design-system path / source comment |
|---|---|---|
| `colorBgPrimary` | #FFFFFF | color/interface/background/primary |
| `colorBgSecondary` | #F9F9F9 | color/interface/background/secondary |
| `colorBgTertiary` | #F4F4F4 | color/interface/background/tertiary |
| `colorBgInversePrimary` | #13130C | color/interface/background/inverse/primary |
| `colorBgInverseSecondary` | #25251F | color/interface/background/inverse/secondary |
| `colorBgInverseTertiary` | #50504F | color/interface/background/inverse/tertiary |
| `colorBgHighlightStrong` | #004F2A | color/interface/background/highlight/strong |
| `colorBgHighlightMedium` | #008446 | color/interface/background/highlight/medium |
| `colorBgHighlightWeak` | #C8F170 | color/interface/background/highlight/weak |
| `colorBgHighlightWeakest` | #EEFCED | color/interface/background/highlight/weakest |
| `colorBgAuditFlag` | #B7DDB0 | Order-flagged-for-audit row fill |
| `colorTextStrong` | #25251F | color/interface/text/strong |
| `colorTextMedium` | #666666 | color/interface/text/medium |
| `colorTextHighlight` | #008446 | color/interface/text/highlight |
| `colorTextOnContrastStrong` | #FFFFFF | color/interface/text/on-contrast/strong |
| `colorTextOnContrastMedium` | #9C9C9C | color/interface/text/on-contrast/medium |
| `colorIconStrong` | #25251F | color/interface/icon/strong |
| `colorIconMedium` | #666666 | color/interface/icon/medium |
| `colorIconHighlight` | #008446 | color/interface/icon/highlight |
| `colorIconOnContrastStrong` | #FFFFFF | color/interface/icon/on-contrast/strong |
| `colorIconOnContrastMedium` | #9C9C9C | color/interface/icon/on-contrast/medium |
| `colorBorderStrong` | #25251F | color/interface/border/strong |
| `colorBorderMedium` | #9C9C9C | color/interface/border/medium |
| `colorBorderDefault` | #BDBDBD | color/interface/border/default |
| `colorBorderWeak` | #E8E8E8 | color/interface/border/weak |
| `colorBorderOnContrast` | #FFFFFF | color/interface/border/on-contrast |
| `colorBorderHighlightStrong` | #004F2A | color/interface/border/highlight/strong |
| `colorBorderHighlightMedium` | #008446 | color/interface/border/highlight/medium |
| `colorBorderHighlightWeak` | #84D5A4 | color/interface/border/highlight/weak |
| `colorPrimary` | #008446 | color/action/background/primary/default |
| `colorPrimaryDark` | #004F2A | color/action/background/primary/focus |
| `colorPrimaryDarkest` | #003D20 | color/action/background/primary/active |
| `colorPrimaryDisabled` | #D2D2D2 | color/action/background/primary/disabled |
| `colorPrimaryLight` | #EEFCED | color/interface/background/highlight/weakest |
| `colorActionPrimaryText` | #FFFFFF | color/action/text/primary/default |
| `colorActionPrimaryTextDisabled` | #FFFFFF | color/action/text/primary/disabled |
| `colorActionSecondaryBg` | #FFFFFF | color/action/background/secondary/default |
| `colorActionSecondaryBgFocus` | #F4F4F4 | color/action/background/secondary/focus |
| `colorActionSecondaryBorder` | #25251F | color/action/border/secondary/default |
| `colorActionSecondaryBorderFocus` | #666666 | color/action/border/secondary/focus |
| `colorActionSecondaryText` | #25251F | color/action/text/secondary/default |
| `colorActionSecondaryTextFocus` | #666666 | color/action/text/secondary/focus |
| `colorActionSecondaryTextDisabled` | #9C9C9C | color/action/text/secondary/disabled |
| `colorActionTertiaryBg` | #F4F4F4 | color/action/background/tertiary/default |
| `colorActionTertiaryBgFocus` | #D2D2D2 | color/action/background/tertiary/focus |
| `colorActionTertiaryText` | #25251F | color/action/text/tertiary/default |
| `colorActionTertiaryTextDisabled` | #9C9C9C | color/action/text/tertiary/disabled |
| `colorActionDestructiveBg` | #C50000 | color/action/background/destructive/default |
| `colorActionDestructiveBgFocus` | #A80000 | color/action/background/destructive/focus |
| `colorActionDestructiveBgActive` | #6F0000 | color/action/background/destructive/active |
| `colorActionDestructiveText` | #FFFFFF | color/action/text/destructive/default |
| `colorActionLinkDefault` | #00723D | color/action/text/link/default |
| `colorActionLinkFocus` | #004F2A | color/action/text/link/focus |
| `colorActionLinkActive` | #003D20 | color/action/text/link/active |
| `colorActionLinkDisabled` | #D2D2D2 | color/action/text/link/disabled |
| `colorInputBg` | #FFFFFF | color/input/background/default |
| `colorInputBgDisabled` | #E8E8E8 | color/input/background/disabled |
| `colorInputBgError` | #FFEBEB | color/input/background/error/default |
| `colorInputBorder` | #3B3B37 | color/input/border/default |
| `colorInputBorderFocus` | #13130C | color/input/border/focus |
| `colorInputBorderError` | #C50000 | color/input/border/error/default |
| `colorInputBorderActive` | #008446 | color/input/border/active |
| `colorInputText` | #25251F | color/input/text/default |
| `colorInputPlaceholder` | #666666 | color/input/text/placeholder/default |
| `colorInputTextDisabled` | #BDBDBD | color/input/text/disabled |
| `colorInputSupportError` | #C50000 | color/input/text/supporting/error |
| `colorStatusPositiveBgWeak` | #EEFFC3 | color/status/background/positive/weak |
| `colorStatusPositiveBgStrong` | #446104 | color/status/background/positive/strong |
| `colorStatusPositiveTextWeak` | #334901 | color/status/text/positive/weak |
| `colorStatusPositiveTextStrong` | #EEFFC3 | color/status/text/positive/strong |
| `colorStatusTentativeBgWeak` | #FFFDD0 | color/status/background/tentative/weak |
| `colorStatusTentativeBgStrong` | #E2C100 | color/status/background/tentative/strong |
| `colorStatusTentativeTextWeak` | #534700 | color/status/text/tentative/weak |
| `colorStatusTentativeTextStrong` | #111103 | color/status/text/tentative/strong |
| `colorStatusNegativeBgWeak` | #FFD4D4 | color/status/background/negative/weak |
| `colorStatusNegativeBgStrong` | #A80000 | color/status/background/negative/strong |
| `colorStatusNegativeTextWeak` | #520000 | color/status/text/negative/weak |
| `colorStatusNegativeTextStrong` | #FFEBEB | color/status/text/negative/strong |
| `colorStatusInfoBgWeak` | #EBF7FF | color/status/background/info/weak |
| `colorStatusInfoBgStrong` | #0074BC | color/status/background/info/strong |
| `colorStatusInfoTextWeak` | #00578E | color/status/text/info/weak |
| `colorStatusInfoTextStrong` | #EBF7FF | color/status/text/info/strong |
| `colorStatusNeutralBgWeak` | #E8E8E8 | color/status/background/neutral/weak |
| `colorStatusNeutralBgStrong` | #3B3B37 | color/status/background/neutral/strong |
| `colorStatusNeutralTextWeak` | #3B3B37 | color/status/text/neutral/weak |
| `colorStatusNeutralTextStrong` | #FFFFFF | color/status/text/neutral/strong |
| `colorSupplyEcomWeak` | #8ED0FF | eCom picking fill |
| `colorSupplyEcomStrong` | #00205B | eCom packed fill |
| `colorSupplyShopFloorWeak` | #FFC182 | Shop Floor picking fill |
| `colorSupplyShopFloorStrong` | #8A4300 | Shop Floor packed fill |
| `colorZoneAmbient` | #5B2A86 | Ambient picking segment |
| `colorZoneChilled` | #E2C100 | Chilled picking segment |
| `colorZoneFrozen` | #7CB342 | Frozen picking segment |
| `colorZoneSecurity` | #0074BC | Security picking segment |
| `colorZoneNonPicking` | #BDBDBD | Rostered not-picking segment |
| `colorAlertInfoBg` | #EBF7FF | color/alert/background/info |
| `colorAlertSuccessBg` | #F4FFDB | color/alert/background/success |
| `colorAlertWarningBg` | #FFFAE0 | color/alert/background/warning |
| `colorAlertOrangeBg` | #FFF1E2 | color/alert/background/orange |
| `colorAlertOrangeBgStrong` | #FF7C25 | color/alert/background/orange/strong |
| `colorAlertErrorBg` | #FFEBEB | color/alert/background/error |
| `colorAlertErrorBgStrong` | #E10000 | color/alert/background/error/strong |
| `colorAlertInfoText` | #13130C | color/alert/text/info |
| `colorAlertSuccessText` | #13130C | color/alert/text/success |
| `colorAlertWarningText` | #13130C | color/alert/text/warning |
| `colorAlertOrangeText` | #13130C | color/alert/text/orange |
| `colorAlertErrorText` | #13130C | color/alert/text/error |
| `colorAlertInfoIcon` | #0074BC | color/alert/icon/info |
| `colorAlertSuccessIcon` | #008446 | color/alert/icon/success |
| `colorAlertWarningIcon` | #705F00 | color/alert/icon/warning |
| `colorAlertOrangeIcon` | #FF7C25 | color/alert/icon/orange |
| `colorAlertErrorIcon` | #C50000 | color/alert/icon/error |
| `colorAlertInfoBorder` | #0074BC | color/alert/border/info |
| `colorAlertSuccessBorder` | #008446 | color/alert/border/success |
| `colorAlertWarningBorder` | #705F00 | color/alert/border/warning |
| `colorAlertOrangeBorder` | #FF7C25 | color/alert/border/orange |
| `colorAlertErrorBorder` | #C50000 | color/alert/border/error |

### Typography, spacing and radius tokens

| Token | Real value | Source comment |
|---|---|---|
| `fontFamily` | 'Roboto', 'Helvetica Neue', Arial, sans-serif | family/platform |
| `fontSizeTitleLg` | 20px | title/lg — 20px / 24px lh, weight 700 |
| `fontSizeTitleMd` | 16px | title/md — 16px / 20px lh, weight 700 |
| `fontSizeTitleSm` | 14px | title/sm — 14px / 18px lh, weight 700 |
| `fontSizeBodyLg` | 18px | body/lg — 18px / 28px lh, weight 400 |
| `fontSizeBodyMd` | 16px | body/md — 16px / 24px lh, weight 400 |
| `fontSizeBodySm` | 14px | body/sm — 14px / 20px lh, weight 400 |
| `fontSizeCaption` | 12px | caption/sm — 12px / 16px lh, weight 400/700 |
| `lineHeightTitleLg` | 24px | token module |
| `lineHeightTitleMd` | 20px | token module |
| `lineHeightTitleSm` | 18px | token module |
| `lineHeightBodyLg` | 28px | token module |
| `lineHeightBodyMd` | 24px | token module |
| `lineHeightBodySm` | 20px | token module |
| `lineHeightCaption` | 16px | token module |
| `spaceInternalXsmall` | 2px | space/internal-xsmall |
| `spaceInternalSmall` | 4px | space/internal-small |
| `spaceInternalMedium` | 8px | space/internal-medium |
| `spaceInternalLarge` | 12px | space/internal-large |
| `spaceContentSmall` | 16px | space/content-small |
| `spaceContentMedium` | 20px | space/content-medium |
| `spaceContentLarge` | 24px | space/content-large |
| `spaceSectionSmall` | 32px | space/section-small |
| `spaceSectionMedium` | 40px | space/section-medium |
| `spaceSectionLarge` | 48px | space/section-large |
| `spaceAreaSmall` | 64px | space/area-small |
| `spaceAreaMedium` | 80px | space/area-medium |
| `spaceAreaLarge` | 120px | space/area-large |

---

## 4. Component recipes

These are measured clusters. A `variant` here is a distinct rendered treatment in `out/component-census/v1.json`, not necessarily a named React prop.

### 4.1 Route Heading

- **Provenance:** `out/component-census/v1.json` → heading/text clusters; route specs `05`, `06a`, `09`, `10`.
- **Geometry:** default route heading uses measured text flow inside the route content cap; card title heading cluster is h3/card-title, count 18, box 66px × 21px, padding 0px, radius 0px, transparent background, color rgb(37, 37, 31), border 0px, font 14px/21px Roboto 700.
- **States:** default only. Hover/focus none — measured absence for static headings.
- **Screens:** order-detail-details, order-detail-instructions, order-detail-nz-customer-support, order-line-detail, dash-indicators, dash-timeline; route-heading usage on order-summary, search-orders, dash shell, settings and reports resolves to this text hierarchy plus page scaffold.

### 4.2 Button Variants

| Recipe | Count | Screens | Geometry and style | State diff |
|---|---:|---|---|---|
| `4.2.a` Toolbar icon tooltip button, 24px | 71 | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au | 24px × 24px; padding 0px; radius 8px; background transparent; color oklch(0.145 0 0); border 1px solid transparent; font 14px/20px Roboto 500; transition all 150ms cubic-bezier(0.4, 0, 0.2, 1) | hover/focus in component cluster none; focus uses §4.11 where focused |
| `4.2.b` Toolbar icon button disabled, 36px | 19 | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au, order-detail-* | 36px × 36px; padding 0px; radius 10px; background transparent; color oklch(0.145 0 0); border 1px solid transparent; opacity 0.5; font 14px/20px Roboto 500; transition all 150ms cubic-bezier(0.4, 0, 0.2, 1) | disabled opacity 0.5 |
| `4.2.c` Primary circular icon button | 12 | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au, order-detail-* | 32px × 32px; padding 0px; radius pill; background rgb(0, 132, 70); color oklch(0.985 0 0); border 1px solid transparent; shadow rgba(0,0,0,0.1) 0px 10px 15px -3px and 0px 4px 6px -4px; font 14px/20px Roboto 500; transition all 150ms cubic-bezier(0.4, 0, 0.2, 1) | focus shadow appends §4.11 focus ring where measured |
| `4.2.d` Row action trigger, 28px | 4 | order-detail-labels | 28px × 28px; padding 0px; radius 8px; background transparent; color oklch(0.556 0 0); border 1px solid transparent; font 14px/20px Roboto 500; transition all 150ms cubic-bezier(0.4, 0, 0.2, 1) | opens §4.8 row-action popover |
| `4.2.e` Secondary text action | measured cluster | search-orders, dialogs, details | height 32px or 36px by cluster; radius 8px or 10px; white/transparent background; dark text; border rgb(189, 189, 189) or oklch(0.922 0 0); font 13px/19px or 14px/20px Roboto 500 | focus-visible ring from §4.11 where measured |
| `4.2.f` Destructive/confirm dialog action | measured in dialogs | order-summary, order-summary-nz, order-summary-estore | modal action style belongs to §4.7 panel; actions are 2 or 7 interactive elements depending dialog | modal motion none — measured |

### 4.3 Badge and Status Pills

| Recipe | Count | Screens | Geometry and style | Usage |
|---|---:|---|---|---|
| `4.3.a` Status open strong | 12 | order-summary-nz | 46px × 20px; padding 2px 8px; radius pill; background rgb(0, 79, 42); color rgb(255, 255, 255); border 1px solid rgb(0, 79, 42); font 12px/16px Roboto 700 | `Open` |
| `4.3.b` On hold hot-pink status | 4 | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au | 61px × 20px; padding 2px 8px; radius pill; background rgb(255, 20, 147); color rgb(255, 255, 255); border 1px solid rgb(255, 20, 147); font 12px/16px Roboto 700 | `On Hold` |
| `4.3.c` Neutral article tag | 4 | order-detail-articles, order-detail-estore | 53px × 20px; padding 2px 8px; radius pill; background rgb(244, 244, 244); color rgb(37, 37, 31); border 1px solid rgb(189, 189, 189); font 12px/16px Roboto 500 | `WGHT` |
| `4.3.d` Purple article tag | 4 | order-detail-articles, order-detail-estore | 37px × 20px; padding 2px 8px; radius pill; background rgb(246, 227, 240); color rgb(156, 53, 135); border 1px solid rgb(156, 53, 135); font 12px/16px Roboto 500 | `SLT` |
| `4.3.e` Label packed badge | 3 | order-detail-labels | 57px × 20px; padding 2px 8px; radius pill; background rgb(244, 255, 219); color rgb(0, 132, 70); border 1px solid rgb(0, 132, 70); font 12px/16px Roboto 500 | `Packed` |
| `4.3.f` Detail picking badge | 2 | order-detail-details, order-detail-nz-customer-support | 78px × 26px; padding 4px 10px; radius pill; background rgb(238, 252, 237); color rgb(0, 132, 70); border 1px solid rgb(132, 213, 164); font 12px/16px Roboto 500 | `Picking` |
| `4.3.g` Awaiting pick label badge | 1 | order-detail-labels | 91px × 20px; padding 2px 8px; radius pill; background rgb(249, 249, 249); color rgb(102, 102, 102); border 1px solid rgb(189, 189, 189); font 12px/16px Roboto 500 | `Awaiting Pick` |
| `4.3.h` Small supply/status text | 190 | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au | 32px/34px × 10px; padding 0px; radius 0px; transparent; font 10px/10px Roboto 500; colors rgb(255,255,255) for packed and rgb(102,102,102) for picking | supply bar labels |

### 4.4 Card and Section Recipes

| Recipe | Count | Screens | Geometry and style |
|---|---:|---|---|
| `4.4.a` Full-width order header card | 8 | order-detail-articles, order-detail-details, order-detail-instructions, order-detail-labels, order-detail-samples, order-detail-audit, order-detail-nz-customer-support, order-detail-estore | 1392px × 55px; padding 0px; radius 12px; background rgb(255, 255, 255); border 1px solid rgb(232, 232, 232); shadow none; font 16px/24px Roboto 400 |
| `4.4.b` Full-width order header content | 8 | same as `4.4.a` | 1390px × 53px; padding 16px; radius 0px; transparent background; border 0px |
| `4.4.c` Detail field-group card | 3 + 3 | order-detail-details, order-detail-nz-customer-support | 453px × 563px or 604px; padding 0px; radius 12px; background rgb(255,255,255); border 1px solid rgb(232,232,232); font 16px/24px Roboto 400 |
| `4.4.d` Instruction panel card | 3 | order-detail-instructions | 453px × 293px; padding 0px; radius 12px; background rgb(255,255,255); border 1px solid rgb(232,232,232) |
| `4.4.e` KPI indicator card | 3 | dash-indicators | 400px × 480px; padding 0px; radius 12px; background rgb(255,255,255); border 1px solid rgb(232,232,232) |
| `4.4.f` Compact metric card | 3 | dash-indicators | 400px × 338px; padding 0px; radius 12px; background rgb(255,255,255); border 1px solid rgb(232,232,232) |
| `4.4.g` Table-holding card | one-off by route | order-detail-articles, order-detail-samples, order-detail-audit | 1392px wide; heights 1261px, 133px, 628px; padding 0px; radius 12px; background rgb(255,255,255); border 1px solid rgb(232,232,232) |
| `4.4.h` Card header | 18 | order-detail-details, order-detail-instructions, order-detail-nz-customer-support, order-line-detail, dash-indicators, dash-timeline | 451px × 46px; padding 12px 16px; radius 0px; transparent background; font 16px/24px Roboto 400 |

### 4.5 Input, Textarea and Native Select

| Recipe | Count | Screens | Geometry and style | State diff |
|---|---:|---|---|---|
| `4.5.a` Header native select | 40 | all 20 screens | 140px × 34px; padding 6px 32px 6px 12px; radius 4px; transparent background; color rgb(255,255,255); border 1px solid oklab(0.999994 0.0000455678 0.0000200868 / 0.3); font 14px/20px Roboto 500 | OS-native open panel not represented in DOM — measured |
| `4.5.b` Entry-gate native select | 3 | entry-gate | 240px × 36px; padding 8px 12px; radius 8px; background rgb(255,255,255); color rgb(37,37,31); border 1px solid rgb(189,189,189); font 14px/0px Roboto 400 | OS-native open panel not represented in DOM — measured |
| `4.5.c` Search field input | 10 | search-orders-prefilter, search-orders-results | 283px × 32px; padding 0px 10px; radius 10px; transparent background; color oklch(0.145 0 0); border 1px solid oklch(0.922 0 0); shadow rgba(0,0,0,0.05) 0px 1px 2px 0px; font 14px/20px Roboto 400; transition 150ms cubic-bezier(0.4,0,0.2,1) | focus-visible shadow from §4.11 when focused |
| `4.5.d` Quantity/edit input | 24 | order-detail-articles, order-detail-estore | 64px × 32px; padding 0px 4px 0px 20px; radius 8px; background oklch(1 0 0); color oklch(0.145 0 0); border 1px solid rgb(189,189,189); font 14px/20px Roboto 400 | status colour variants measured: rgb(156,53,135), rgb(197,0,0), rgb(0,132,70) |
| `4.5.e` Disabled quantity input | 4 | order-detail-articles, order-detail-estore | 64px × 32px; padding 0px 8px; radius 8px; background oklch(0.97 0 0); color oklch(0.556 0 0); border 1px solid oklch(0.922 0 0); font 14px/20px Roboto 400 | disabled true |
| `4.5.f` Instruction textarea | 2 | order-detail-instructions | 419px × 180px; padding 8px 12px; radius 10px; transparent background; color oklch(0.145 0 0); border 1px solid oklch(0.922 0 0); shadow rgba(0,0,0,0.05) 0px 1px 2px 0px; font 14px/20px Roboto 400; transition 150ms cubic-bezier(0.4,0,0.2,1) | focus-visible ring from §4.11 |

### 4.6 Select Dropdown Panels

| Recipe | Count | Screens | Open geometry | Layer and motion |
|---|---:|---|---|---|
| `4.6.a` Order status select panel | 2 | order-detail-details, order-detail-nz-customer-support | x=202px, y=246px, w=116px, h=188px; padding 4px; radius 10px; background oklch(1 0 0); font 16px/24px Roboto 400 | portalled fixed z-index 50; body overflow hidden; transparent fixed backdrop paints false; enter/exit 150ms ease |
| `4.6.b` Search status select panel | 2 | search-orders-prefilter, search-orders-results | x=267px, y=154px, w=283px, h=224px; padding 4px; radius 10px; background oklch(1 0 0); font 16px/24px Roboto 400 | same layer; enter/exit 150ms ease |
| `4.6.c` Search date-range select panel | 2 | search-orders-prefilter, search-orders-results | x=267px, y=358px, w=283px, h=296px; padding 4px; radius 10px; background oklch(1 0 0); font 16px/24px Roboto 400 | same layer; enter/exit 150ms ease |

### 4.7 Modal Dialogs

| Recipe | Count | Screens | Open geometry | Layer and motion |
|---|---:|---|---|---|
| `4.7.a` 480px confirmation dialog | 4 | order-summary, order-summary-nz, order-summary-estore | widths 480px; heights 192px, 236px, 270px, 312px; padding 32px; radius 14px; background oklch(1 0 0); color oklch(0.145 0 0); shadow rgba(0,0,0,0.25) 0px 25px 50px -12px; max-width 1392px; font 16px/24px Roboto 400 | panel fixed z-index 3001; backdrop fixed z-index 3000, oklab(0 0 0 / 0.45), 1440px × 1000px; enter none, exit hard cut — measured |
| `4.7.b` Department notifications dialog | 1 | order-summary | x=440px, y=176px, w=560px, h=648px; padding 32px; radius 14px; same background, color, shadow and layer as `4.7.a`; 44 interactive elements measured | enter none, exit hard cut — measured |

### 4.8 Popover Panels

| Recipe | Count | Screens | Open geometry | Layer and motion |
|---|---:|---|---|---|
| `4.8.a` Filter/options popover | 6 measured trigger/panel records | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au | x=16px; y=144px/159px/171px by context; w=288px; h=181px, or 223px for eStore; padding 10px; radius 10px; background oklch(1 0 0); color oklch(0.145 0 0); shadow oklab(0.145 0 0 / 0.1) 0px 0px 0px 1px plus rgba(0,0,0,0.1) 0px 4px 6px -1px and 0px 2px 4px -2px | portalled absolute z-index 50; no backdrop; enter/exit 100ms ease |
| `4.8.b` Date picker popover | measured on order-summary contexts | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au | w=212px, h=305px; y=141px in AU/eStore/NZ and 153px in CFC; radius 10px; padding 0px | portalled z-index 50; enter/exit 100ms ease |
| `4.8.c` Detail preview popover | 2 | order-detail-details, order-detail-nz-customer-support | x=16px, y=784px, w=288px, h=164px; padding 10px; radius 10px; background oklch(1 0 0); font 14px/20px Roboto 400 | portalled absolute z-index 50; enter/exit 100ms ease |
| `4.8.d` Label row-action popover | 3 | order-detail-labels | x=1323px; y=349px/399px/449px; w=84px; h=64px; padding 0px; radius 10px; background oklch(1 0 0); font 14px/20px Roboto 400; literals Delete, Print | portalled absolute z-index 50; enter/exit 100ms ease |

### 4.9 Table Cell Scales

| Recipe | Count | Screens | Cell scale | State diff |
|---|---:|---|---|---|
| `4.9.a` Dense operational body cell | 4442 | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au, search-orders-results | td 180px × 33px; padding 6px 8px; radius 0px; transparent background; color oklch(0.145 0 0); border 0px; font 14px/20px Roboto 400 | row hover `filter: brightness(0.95)` for hover-enabled rows; selected-row treatment none in Order Summary — measured |
| `4.9.b` Dense flag/checkbox body cell | 3345 | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au, search-orders-results | td 39px × 33px; padding 4px; radius 0px; transparent background; font 12px/16px Roboto 400 | checkbox focus ring §4.11 where measured |
| `4.9.c` Dense checkbox cell large text | 670 | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au, search-orders-results | td 39px × 33px; padding 4px; font 16px/24px Roboto 400 | same as `4.9.b` |
| `4.9.d` Dense link-like body cell | 440 | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au, search-orders-results | td 165px × 33px; padding 6px 8px; color rgb(0,132,70); font 14px/20px Roboto 400 | row hover from row recipe |
| `4.9.e` Summary/parent row cell | 426 | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au | td 421px × 35px; padding 5px 8px; color rgb(37,37,31); font 14px/20px Roboto 700 | sampled parent row hover none — measured |
| `4.9.f` Detail article row | measured | order-detail-articles, order-detail-estore | row hover-enabled variant changes `filter` from none to `brightness(0.97)` | selected eStore detail rows also change to `brightness(0.97)` |
| `4.9.g` Labels/samples/audit row | measured | order-detail-labels, order-detail-samples, order-detail-audit | no sampled row reacts to hover — measured | labels selected-row treatment none — measured |
| `4.9.h` Dash timeline row | measured | dash-timeline | no sampled row reacts to hover — measured | sticky table headers change on scroll — measured |

### 4.10 Tooltip

| Recipe | Count | Screens | Geometry and style | Motion |
|---|---:|---|---|---|
| `4.10.a` Shared tooltip panel | 32 panels, representing 2987 triggers | all 20 screens | height 28px; width varies by literal; padding 6px 12px; radius 8px; background oklch(0.145 0 0); color oklch(1 0 0); border 0px; shadow none; max-width 320px; font 12px/16px Roboto 400; z-index 50 | enter/exit 150ms ease, opacity travel measured |
| `4.10.b` Tooltip trigger icon/text | 1333 + additional trigger clusters | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au, search-orders-results, global nav | common icon trigger 16px × 16px; padding 0px; radius 0px; transparent; color oklch(0.145 0 0); font 12px/16px Roboto 400 | focus-visible outline/shadow per §4.11 |

### 4.11 Focus, Scroll, Disclosure and Row State Recipes

| Recipe | Screens | Measured state |
|---|---|---|
| `4.11.a` Global tooltip/nav focus | entry-gate, order-summary contexts, settings, reports | outline 1px auto oklab(0.708 0 0 / 0.5); outline-offset 1px; box-shadow none; matches `:focus-visible` true |
| `4.11.b` Button/input focus ring | order-detail-articles, order-detail-labels, order-detail-samples, order-detail-audit, search-orders-results | outline none; outline-offset 0px; box-shadow includes oklab(0.708 0 0 / 0.5) 0px 0px 0px 3px; matches `:focus-visible` true |
| `4.11.c` Header scroll | all measured screens | no appearance change on scroll — measured. Sticky, but visual treatment does not react. |
| `4.11.d` Sticky table header scroll | order-summary contexts, search-orders-results, dash-timeline | th changedInstances 14/14 or 16/16 or 5/5; verdict `CHANGES ON SCROLL — measured` |
| `4.11.e` Order Summary row hover/selection | order-summary, order-summary-nz, order-summary-estore, order-summary-cfc-au | one sampled hover-enabled row changes filter none → brightness(0.95); selected-row treatment none — measured |
| `4.11.f` Search results row hover/selection | search-orders-results | hover and selected both change filter none → brightness(0.95) |
| `4.11.g` Article detail row hover/selection | order-detail-articles, order-detail-estore | hover changes filter none → brightness(0.97); eStore selected rows also change to brightness(0.97) |
| `4.11.h` Labels/samples/audit/timeline row hover | order-detail-labels, order-detail-samples, order-detail-audit, dash-timeline | no sampled row reacts to hover — measured |
| `4.11.i` Disclosure expand/collapse | order-summary contexts, order-detail-labels, order-detail-samples, order-detail-audit, order-detail-instructions | rowDelta 0 and mainHeightDelta 0; declared transition all 150ms where reported; content appears instantly where transition is null — measured |

### 4.12 Link Recipes

| Recipe | Count | Screens | Geometry and style | State diff |
|---|---:|---|---|---|
| `4.12.a` Global nav/brand link | 11 | entry-gate, order-summary contexts, search-orders, dash, settings, reports | 184px × 20px; padding 0px; transparent background; color rgb(255,255,255); border 0px; font 16px/20px Roboto 700; transition color/background/border/outline/text-decoration/fill/stroke 150ms cubic-bezier(0.4,0,0.2,1) | focus §4.11.a |
| `4.12.b` Order detail crumb/card link | 9 | order-detail-* and order-line-detail | 126px × 35px; padding 0px; transparent background; color oklch(0.145 0 0); font 16px/24px Roboto 400; transition opacity 150ms cubic-bezier(0.4,0,0.2,1) | focus §4.11.a where anchor focused |
| `4.12.c` Adjacent navigation link | 2 | order-line-detail | Previous 109px × 36px disabled opacity 0.3; Next 83px × 36px; color rgb(0,114,61); font 14px/20px Roboto 500; transition 150ms cubic-bezier(0.4,0,0.2,1) | disabled opacity 0.3 |
| `4.12.d` Order id inline link | 1 | order-line-detail | 92px × 21px; color rgb(0,114,61); font 14px/21px Roboto 600; transition opacity 150ms cubic-bezier(0.4,0,0.2,1) | default only measured |

### 4.13 Component Cluster Register

The component census contains 280 measured style clusters. The family recipes above cover the shared and named one-off treatments used by the 19 functional specs: Button variants, Badge, Card, Input, Select, Table cell scales, Tooltip and Link. Shared recipes are identified by high instance counts and multi-screen coverage; one-off recipes are retained where they own a distinct rendered treatment, especially modal, popover and route-specific table cards.

---

## 4.x Icon register — an icon is a VALUE, not a description

| Key | Glyph | Family | Size | Where used |
|---|---|---|---|---|
| Tooltip/icon trigger | measured SVG/icon content in trigger cluster | prototype icon set | 12px, 14px, 16px, 20px, 24px, 28px, 32px, 36px depending trigger recipe | global nav, order tables, quick actions, labels row actions |

Named icon artwork is not separately enumerated in the measured component census; trigger box and colour values are specified in §4.2 and §4.10.

---

## 5. How a spec references this library

- Chrome — colour, spacing, radius, shadow, focus rings and motion — by §4 recipe reference.
- Semantic maps — any `state → value` table — remain inline in the owning component block.
- Every `UX/UI:` line in a functional spec must cite a section in this library.

---

## 6. Referenced but NOT extracted — the dangling-reference register

| Reference | Cited by | Status |
|---|---|---|
| none — measured | n/a | Every current UX/UI recipe reference resolves to §4. |

---

## 6.5 Build notes — implementation traps

- Native select open panels are OS-native and do not render DOM panels; this is measured, not missing.
- Modal dialogs unmount on close with 0ms animation and 0ms transition; exit is a hard cut.
- Header stickiness does not create a visual scroll reaction; record scroll appearance as none — measured.
- Order Summary selected rows have no selected-row visual treatment even though selection state exists; this is a measured finding.
- Label, sample, audit and dashboard timeline rows have no sampled hover reaction; do not add hover styling to match denser order/search tables.

---

## 7. Open / decision items

None in this library. Product and engineering decisions remain in the owning functional specs and sourcing register.
