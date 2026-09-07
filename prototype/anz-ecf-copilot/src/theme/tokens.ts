// Design token map for ANZ Admin Service
// Flat names are used throughout the codebase — do not rename them.
// Each entry's trailing comment shows the canonical DS token path from
// core-design-system/core-design-system-design-tokens.md for traceability.
// Woolworths brand, Light mode only.

export const tokens = {

  // ---------------------------------------------------------------------------
  // COLOUR — Interface backgrounds
  // ---------------------------------------------------------------------------
  colorBgPrimary:   '#FFFFFF',  // color/interface/background/primary
  colorBgSecondary: '#F9F9F9',  // color/interface/background/secondary
  colorBgTertiary:  '#F4F4F4',  // color/interface/background/tertiary

  // Interface — inverse backgrounds (dark surfaces)
  colorBgInversePrimary:   '#13130C',  // color/interface/background/inverse/primary
  colorBgInverseSecondary: '#25251F',  // color/interface/background/inverse/secondary
  colorBgInverseTertiary:  '#50504F',  // color/interface/background/inverse/tertiary

  // Interface — highlight backgrounds (brand green tints)
  colorBgHighlightStrong:   '#004F2A',  // color/interface/background/highlight/strong
  colorBgHighlightMedium:   '#008446',  // color/interface/background/highlight/medium
  colorBgHighlightWeak:     '#C8F170',  // color/interface/background/highlight/weak
  colorBgHighlightWeakest:  '#EEFCED',  // color/interface/background/highlight/weakest
  colorBgAuditFlag:         '#B7DDB0',  // Order-flagged-for-audit row fill — muted pastel green, deliberately distinct from the lime picking-supply fill above

  // ---------------------------------------------------------------------------
  // COLOUR — Interface text
  // ---------------------------------------------------------------------------
  colorTextStrong:           '#25251F',  // color/interface/text/strong
  colorTextMedium:           '#666666',  // color/interface/text/medium
  colorTextHighlight:        '#008446',  // color/interface/text/highlight
  colorTextOnContrastStrong: '#FFFFFF',  // color/interface/text/on-contrast/strong
  colorTextOnContrastMedium: '#9C9C9C',  // color/interface/text/on-contrast/medium

  // ---------------------------------------------------------------------------
  // COLOUR — Interface icons
  // ---------------------------------------------------------------------------
  colorIconStrong:           '#25251F',  // color/interface/icon/strong
  colorIconMedium:           '#666666',  // color/interface/icon/medium
  colorIconHighlight:        '#008446',  // color/interface/icon/highlight
  colorIconOnContrastStrong: '#FFFFFF',  // color/interface/icon/on-contrast/strong
  colorIconOnContrastMedium: '#9C9C9C',  // color/interface/icon/on-contrast/medium

  // ---------------------------------------------------------------------------
  // COLOUR — Interface borders
  // ---------------------------------------------------------------------------
  colorBorderStrong:          '#25251F',  // color/interface/border/strong
  colorBorderMedium:          '#9C9C9C',  // color/interface/border/medium
  colorBorderDefault:         '#BDBDBD',  // color/interface/border/default
  colorBorderWeak:            '#E8E8E8',  // color/interface/border/weak
  colorBorderOnContrast:      '#FFFFFF',  // color/interface/border/on-contrast
  colorBorderHighlightStrong: '#004F2A',  // color/interface/border/highlight/strong
  colorBorderHighlightMedium: '#008446',  // color/interface/border/highlight/medium
  colorBorderHighlightWeak:   '#84D5A4',  // color/interface/border/highlight/weak

  // ---------------------------------------------------------------------------
  // COLOUR — Action / primary (Woolworths green CTA)
  // ---------------------------------------------------------------------------
  colorPrimary:         '#008446',  // color/action/background/primary/default  (kept for muiTheme compat)
  colorPrimaryDark:     '#004F2A',  // color/action/background/primary/focus
  colorPrimaryDarkest:  '#003D20',  // color/action/background/primary/active
  colorPrimaryDisabled: '#D2D2D2',  // color/action/background/primary/disabled
  colorPrimaryLight:    '#EEFCED',  // color/interface/background/highlight/weakest (used as selected tint)

  // Action — primary text/icon (always white on green bg)
  colorActionPrimaryText:         '#FFFFFF',  // color/action/text/primary/default
  colorActionPrimaryTextDisabled: '#FFFFFF',  // color/action/text/primary/disabled

  // Action — secondary (outlined, dark border on white bg)
  colorActionSecondaryBg:           '#FFFFFF',  // color/action/background/secondary/default
  colorActionSecondaryBgFocus:      '#F4F4F4',  // color/action/background/secondary/focus
  colorActionSecondaryBorder:       '#25251F',  // color/action/border/secondary/default
  colorActionSecondaryBorderFocus:  '#666666',  // color/action/border/secondary/focus
  colorActionSecondaryText:         '#25251F',  // color/action/text/secondary/default
  colorActionSecondaryTextFocus:    '#666666',  // color/action/text/secondary/focus
  colorActionSecondaryTextDisabled: '#9C9C9C',  // color/action/text/secondary/disabled

  // Action — tertiary (filled neutral)
  colorActionTertiaryBg:           '#F4F4F4',  // color/action/background/tertiary/default
  colorActionTertiaryBgFocus:      '#D2D2D2',  // color/action/background/tertiary/focus
  colorActionTertiaryText:         '#25251F',  // color/action/text/tertiary/default
  colorActionTertiaryTextDisabled: '#9C9C9C',  // color/action/text/tertiary/disabled

  // Action — destructive (red CTA)
  colorActionDestructiveBg:       '#C50000',  // color/action/background/destructive/default
  colorActionDestructiveBgFocus:  '#A80000',  // color/action/background/destructive/focus
  colorActionDestructiveBgActive: '#6F0000',  // color/action/background/destructive/active
  colorActionDestructiveText:     '#FFFFFF',  // color/action/text/destructive/default

  // Action — links
  colorActionLinkDefault:    '#00723D',  // color/action/text/link/default
  colorActionLinkFocus:      '#004F2A',  // color/action/text/link/focus
  colorActionLinkActive:     '#003D20',  // color/action/text/link/active
  colorActionLinkDisabled:   '#D2D2D2',  // color/action/text/link/disabled

  // ---------------------------------------------------------------------------
  // COLOUR — Input / form controls
  // ---------------------------------------------------------------------------
  colorInputBg:           '#FFFFFF',  // color/input/background/default
  colorInputBgDisabled:   '#E8E8E8',  // color/input/background/disabled
  colorInputBgError:      '#FFEBEB',  // color/input/background/error/default
  colorInputBorder:       '#3B3B37',  // color/input/border/default
  colorInputBorderFocus:  '#13130C',  // color/input/border/focus
  colorInputBorderError:  '#C50000',  // color/input/border/error/default
  colorInputBorderActive: '#008446',  // color/input/border/active
  colorInputText:         '#25251F',  // color/input/text/default
  colorInputPlaceholder:  '#666666',  // color/input/text/placeholder/default
  colorInputTextDisabled: '#BDBDBD',  // color/input/text/disabled
  colorInputSupportError: '#C50000',  // color/input/text/supporting/error

  // ---------------------------------------------------------------------------
  // COLOUR — Status (badges, tags, chips)
  // Positive = kiwi (lime green), Tentative = yellow, Negative = red, Info = blue
  // ---------------------------------------------------------------------------
  colorStatusPositiveBgWeak:    '#EEFFC3',  // color/status/background/positive/weak
  colorStatusPositiveBgStrong:  '#446104',  // color/status/background/positive/strong
  colorStatusPositiveTextWeak:  '#334901',  // color/status/text/positive/weak
  colorStatusPositiveTextStrong:'#EEFFC3',  // color/status/text/positive/strong

  colorStatusTentativeBgWeak:    '#FFFDD0',  // color/status/background/tentative/weak
  colorStatusTentativeBgStrong:  '#E2C100',  // color/status/background/tentative/strong
  colorStatusTentativeTextWeak:  '#534700',  // color/status/text/tentative/weak
  colorStatusTentativeTextStrong:'#111103',  // color/status/text/tentative/strong

  colorStatusNegativeBgWeak:    '#FFD4D4',  // color/status/background/negative/weak
  colorStatusNegativeBgStrong:  '#A80000',  // color/status/background/negative/strong
  colorStatusNegativeTextWeak:  '#520000',  // color/status/text/negative/weak
  colorStatusNegativeTextStrong:'#FFEBEB',  // color/status/text/negative/strong

  colorStatusInfoBgWeak:    '#EBF7FF',  // color/status/background/info/weak
  colorStatusInfoBgStrong:  '#0074BC',  // color/status/background/info/strong
  colorStatusInfoTextWeak:  '#00578E',  // color/status/text/info/weak
  colorStatusInfoTextStrong:'#EBF7FF',  // color/status/text/info/strong

  colorStatusNeutralBgWeak:    '#E8E8E8',  // color/status/background/neutral/weak
  colorStatusNeutralBgStrong:  '#3B3B37',  // color/status/background/neutral/strong
  colorStatusNeutralTextWeak:  '#3B3B37',  // color/status/text/neutral/weak
  colorStatusNeutralTextStrong:'#FFFFFF',  // color/status/text/neutral/strong

  // ---------------------------------------------------------------------------
  // COLOUR — Supply channel indicators (eStore Order Summary: eCom / Shop Floor Supply columns)
  // Not from core DS token set — project-specific, mirrors the highlight weak/strong pairing above.
  // ---------------------------------------------------------------------------
  colorSupplyEcomWeak:        '#8ED0FF',  // eCom picking fill (light blue)
  colorSupplyEcomStrong:      '#00205B',  // eCom packed fill (navy blue), >=80% supplied
  colorSupplyShopFloorWeak:   '#FFC182',  // Shop Floor picking fill (light orange)
  colorSupplyShopFloorStrong: '#8A4300',  // Shop Floor packed fill (dark orange), >=80% supplied

  // ---------------------------------------------------------------------------
  // COLOUR — Picking zone indicators (Dash / Real Time Performance)
  // Not from core DS token set — project-specific, used for zone bar charts and
  // the Personal Shopper Timeline gantt segments.
  // ---------------------------------------------------------------------------
  colorZoneAmbient:    '#5B2A86',  // Ambient picking segment (purple)
  colorZoneChilled:    '#E2C100',  // Chilled picking segment (yellow)
  colorZoneFrozen:     '#7CB342',  // Frozen picking segment (green)
  colorZoneSecurity:   '#0074BC',  // Security picking segment (blue)
  colorZoneNonPicking: '#BDBDBD',  // Rostered but not currently picking (grey)

  // ---------------------------------------------------------------------------
  // COLOUR — Alert / toast / inline banners
  // ---------------------------------------------------------------------------
  colorAlertInfoBg:       '#EBF7FF',  // color/alert/background/info
  colorAlertSuccessBg:    '#F4FFDB',  // color/alert/background/success
  colorAlertWarningBg:    '#FFFAE0',  // color/alert/background/warning
  colorAlertOrangeBg:     '#FFF1E2',  // color/alert/background/orange (orange/10)
  colorAlertOrangeBgStrong: '#FF7C25',  // color/alert/background/orange/strong (orange/60 — bright fill)
  colorAlertErrorBg:      '#FFEBEB',  // color/alert/background/error
  colorAlertErrorBgStrong:  '#E10000',  // color/alert/background/error/strong (red/60 — bright fill)

  colorAlertInfoText:     '#13130C',  // color/alert/text/info
  colorAlertSuccessText:  '#13130C',  // color/alert/text/success
  colorAlertWarningText:  '#13130C',  // color/alert/text/warning
  colorAlertOrangeText:   '#13130C',  // color/alert/text/orange
  colorAlertErrorText:    '#13130C',  // color/alert/text/error

  colorAlertInfoIcon:     '#0074BC',  // color/alert/icon/info
  colorAlertSuccessIcon:  '#008446',  // color/alert/icon/success
  colorAlertWarningIcon:  '#705F00',  // color/alert/icon/warning  (yellow/90 — NOT orange)
  colorAlertOrangeIcon:   '#FF7C25',  // color/alert/icon/orange (orange/60 — Everyday Rewards brand)
  colorAlertErrorIcon:    '#C50000',  // color/alert/icon/error

  colorAlertInfoBorder:     '#0074BC',  // color/alert/border/info
  colorAlertSuccessBorder:  '#008446',  // color/alert/border/success
  colorAlertWarningBorder:  '#705F00',  // color/alert/border/warning
  colorAlertOrangeBorder:   '#FF7C25',  // color/alert/border/orange
  colorAlertErrorBorder:    '#C50000',  // color/alert/border/error

  // ---------------------------------------------------------------------------
  // COLOUR — Legacy flat names (kept for backward compat with existing components)
  // These duplicate values above; use the specific tokens above for new code.
  // ---------------------------------------------------------------------------
  colorError:      '#C50000',  // color/action/background/destructive/default  (was wrong: #E10000 = red/60)
  colorErrorBg:    '#FFEBEB',  // color/alert/background/error
  colorSuccess:    '#008446',  // color/action/background/primary/default
  colorSuccessBg:  '#F4FFDB',  // color/alert/background/success              (was wrong: #EEFCED = apple/10)
  colorWarning:    '#705F00',  // color/alert/icon/warning                     (was wrong: #FF7C25 = orange/60 = Everyday Rewards brand)
  colorWarningBg:  '#FFFAE0',  // color/alert/background/warning
  colorInfo:       '#0074BC',  // color/alert/icon/info
  colorInfoBg:     '#EBF7FF',  // color/alert/background/info

  // ---------------------------------------------------------------------------
  // TYPOGRAPHY
  // ---------------------------------------------------------------------------
  fontFamily: "'Roboto', 'Helvetica Neue', Arial, sans-serif",  // family/platform

  // Title scale (Roboto, UI use)
  fontSizeTitleLg: '20px',   // title/lg — 20px / 24px lh, weight 700
  fontSizeTitleMd: '16px',   // title/md — 16px / 20px lh, weight 700
  fontSizeTitleSm: '14px',   // title/sm — 14px / 18px lh, weight 700

  // Body scale (Roboto)
  fontSizeBodyLg: '18px',    // body/lg — 18px / 28px lh, weight 400
  fontSizeBodyMd: '16px',    // body/md — 16px / 24px lh, weight 400
  fontSizeBodySm: '14px',    // body/sm — 14px / 20px lh, weight 400

  // Caption
  fontSizeCaption: '12px',   // caption/sm — 12px / 16px lh, weight 400/700

  lineHeightTitleLg: '24px',
  lineHeightTitleMd: '20px',
  lineHeightTitleSm: '18px',
  lineHeightBodyLg:  '28px',
  lineHeightBodyMd:  '24px',
  lineHeightBodySm:  '20px',
  lineHeightCaption: '16px',

  // ---------------------------------------------------------------------------
  // SPACING (px) — use DS names: internal → content → section → area
  // ---------------------------------------------------------------------------
  spaceInternalXsmall: '2px',   // space/internal-xsmall
  spaceInternalSmall:  '4px',   // space/internal-small
  spaceInternalMedium: '8px',   // space/internal-medium
  spaceInternalLarge:  '12px',  // space/internal-large
  spaceContentSmall:   '16px',  // space/content-small
  spaceContentMedium:  '20px',  // space/content-medium
  spaceContentLarge:   '24px',  // space/content-large
  spaceSectionSmall:   '32px',  // space/section-small
  spaceSectionMedium:  '40px',  // space/section-medium
  spaceSectionLarge:   '48px',  // space/section-large
  spaceAreaSmall:      '64px',  // space/area-small
  spaceAreaMedium:     '80px',  // space/area-medium
  spaceAreaLarge:      '120px', // space/area-large

  // Legacy numeric names (kept for backward compat)
  space2:  '2px',
  space4:  '4px',
  space8:  '8px',
  space12: '12px',
  space16: '16px',
  space20: '20px',
  space24: '24px',
  space32: '32px',
  space40: '40px',
  space48: '48px',

  // ---------------------------------------------------------------------------
  // RADIUS
  // ---------------------------------------------------------------------------
  radiusXxs:  '2px',   // radius/xxs
  radiusXs:   '4px',   // radius/xs
  radiusSm:   '8px',   // radius/sm
  radiusMd:   '12px',  // radius/md
  radiusLg:   '16px',  // radius/lg
  radiusXl:   '20px',  // radius/xl   (was missing)
  radiusPill: '24px',  // radius/xxl  (pill-shaped chips/tags)

  // ---------------------------------------------------------------------------
  // BREAKPOINTS (min-width, mobile-first)
  // ---------------------------------------------------------------------------
  breakpointXs:  '414px',   // breakpoint/xs
  breakpointSm:  '768px',   // breakpoint/sm
  breakpointMd:  '1024px',  // breakpoint/md
  breakpointLg:  '1280px',  // breakpoint/lg
  breakpointXl:  '1440px',  // breakpoint/xl
  breakpointXxl: '1680px',  // breakpoint/xxl

  // ---------------------------------------------------------------------------
  // LAYOUT (not from DS tokens — project-specific)
  // ---------------------------------------------------------------------------
  headerHeight: '68px',
  sidebarWidth: '288px',
}

export default tokens
