// WCAG 2.1 AA contrast audit for the ANZ ECF prototype.
//
// Checks real foreground/background color pairs actually rendered in the app
// (sourced from src/theme/tokens.ts usages and the Shadcn oklch vars in
// src/index.css, light mode only — dark mode is unused, see tokens.ts header)
// against the WCAG 2.1 AA thresholds:
//   - 4.5:1 for normal text
//   - 3:1 for large text (>=18pt/24px, or bold >=14pt/18.66px), icons, and
//     graphical/UI-component boundaries (WCAG 1.4.11)
//
// Usage: node scripts/a11y-contrast-check.mjs [--json]
//   --json   print machine-readable JSON instead of the text report
//
// Re-run after editing src/theme/tokens.ts or adding new color pairs below.

// ---------------------------------------------------------------------------
// Color math
// ---------------------------------------------------------------------------

function hexToRgb(hex) {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const int = parseInt(full, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

// oklch(L C H) -> sRGB hex. Standard OKLab/OKLCH conversion (Björn Ottosson).
function oklchToRgb(L, C, Hdeg) {
  const hRad = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

  const toSrgb = (c) => {
    const clamped = Math.max(0, Math.min(1, c))
    const srgb = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055
    return Math.round(Math.max(0, Math.min(1, srgb)) * 255)
  }

  return { r: toSrgb(rLin), g: toSrgb(gLin), b: toSrgb(bLin) }
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
}

// Alpha-blend a translucent color over an opaque background (both RGB 0-255, alpha 0-1).
function blendOver(fg, alpha, bg) {
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
  }
}

function relativeLuminance({ r, g, b }) {
  const chan = (v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const R = chan(r)
  const G = chan(g)
  const B = chan(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function contrastRatio(hex1, hex2) {
  const L1 = relativeLuminance(hexToRgb(hex1))
  const L2 = relativeLuminance(hexToRgb(hex2))
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  return (lighter + 0.05) / (darker + 0.05)
}

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

// Values copied from src/theme/tokens.ts (light mode only — the only mode this
// prototype actually uses; see the "Light mode only" header comment there).
const T = {
  colorBgPrimary: '#FFFFFF',
  colorBgSecondary: '#F9F9F9',
  colorBgTertiary: '#F4F4F4',
  colorBgInversePrimary: '#13130C',
  colorBgInverseSecondary: '#25251F',
  colorBgHighlightStrong: '#004F2A',
  colorBgHighlightWeak: '#C8F170',

  colorTextStrong: '#25251F',
  colorTextMedium: '#666666',
  colorTextHighlight: '#008446',
  colorTextOnContrastStrong: '#FFFFFF',
  colorTextOnContrastMedium: '#9C9C9C',

  colorIconStrong: '#25251F',
  colorIconMedium: '#666666',
  colorIconHighlight: '#008446',

  colorBorderMedium: '#9C9C9C',

  colorPrimary: '#008446',
  colorPrimaryDark: '#004F2A',
  colorPrimaryDisabled: '#D2D2D2',
  colorActionPrimaryText: '#FFFFFF',
  colorActionPrimaryTextDisabled: '#FFFFFF',

  colorActionSecondaryBg: '#FFFFFF',
  colorActionSecondaryBgFocus: '#F4F4F4',
  colorActionSecondaryText: '#25251F',
  colorActionSecondaryTextFocus: '#666666',
  colorActionSecondaryTextDisabled: '#9C9C9C',

  colorActionTertiaryBg: '#F4F4F4',
  colorActionTertiaryText: '#25251F',
  colorActionTertiaryTextDisabled: '#9C9C9C',

  colorActionDestructiveBg: '#C50000',
  colorActionDestructiveBgFocus: '#A80000',
  colorActionDestructiveBgActive: '#6F0000',
  colorActionDestructiveText: '#FFFFFF',

  colorActionLinkDefault: '#00723D',
  colorActionLinkFocus: '#004F2A',
  colorActionLinkActive: '#003D20',
  colorActionLinkDisabled: '#D2D2D2',

  colorInputBg: '#FFFFFF',
  colorInputBgDisabled: '#E8E8E8',
  colorInputBgError: '#FFEBEB',
  colorInputText: '#25251F',
  colorInputPlaceholder: '#666666',
  colorInputTextDisabled: '#BDBDBD',
  colorInputSupportError: '#C50000',
  colorInputBorderError: '#C50000',

  colorStatusPositiveBgWeak: '#EEFFC3',
  colorStatusPositiveBgStrong: '#446104',
  colorStatusPositiveTextWeak: '#334901',
  colorStatusPositiveTextStrong: '#EEFFC3',

  colorStatusTentativeBgWeak: '#FFFDD0',
  colorStatusTentativeBgStrong: '#E2C100',
  colorStatusTentativeTextWeak: '#534700',
  colorStatusTentativeTextStrong: '#111103',

  colorStatusNegativeBgWeak: '#FFD4D4',
  colorStatusNegativeBgStrong: '#A80000',
  colorStatusNegativeTextWeak: '#520000',
  colorStatusNegativeTextStrong: '#FFEBEB',

  colorStatusInfoBgWeak: '#EBF7FF',
  colorStatusInfoBgStrong: '#0074BC',
  colorStatusInfoTextWeak: '#00578E',
  colorStatusInfoTextStrong: '#EBF7FF',

  colorStatusNeutralBgWeak: '#E8E8E8',
  colorStatusNeutralBgStrong: '#3B3B37',
  colorStatusNeutralTextWeak: '#3B3B37',
  colorStatusNeutralTextStrong: '#FFFFFF',

  colorSupplyEcomWeak: '#8ED0FF',
  colorSupplyEcomStrong: '#00205B',
  colorSupplyShopFloorWeak: '#FFC182',
  colorSupplyShopFloorStrong: '#8A4300',

  colorZoneAmbient: '#5B2A86',
  colorZoneChilled: '#E2C100',
  colorZoneFrozen: '#7CB342',
  colorZoneSecurity: '#0074BC',
  colorZoneNonPicking: '#BDBDBD',

  colorAlertInfoBg: '#EBF7FF',
  colorAlertSuccessBg: '#F4FFDB',
  colorAlertWarningBg: '#FFFAE0',
  colorAlertErrorBg: '#FFEBEB',
  colorAlertText: '#13130C', // same for all 4 variants
  colorAlertInfoIcon: '#0074BC',
  colorAlertSuccessIcon: '#008446',
  colorAlertWarningIcon: '#705F00',
  colorAlertErrorIcon: '#C50000',
}

// Project-specific, not in tokens.ts (src/pages/order-detail/lineAccents.tsx).
const accent = {
  slt: { bg: '#F6E3F0', text: '#9C3587' },
  sub: { bg: '#DFF3E1', text: T.colorTextHighlight },
  wght: { bg: T.colorBgTertiary, text: T.colorTextStrong },
}

// Shadcn CSS vars from src/index.css :root (light mode; oklch -> hex).
const S = {
  background: oklchToRgb(1, 0, 0),
  foreground: oklchToRgb(0.145, 0, 0),
  primary: oklchToRgb(0.479, 0.127, 149),
  primaryForeground: oklchToRgb(0.985, 0, 0),
  secondary: oklchToRgb(0.97, 0, 0),
  secondaryForeground: oklchToRgb(0.205, 0, 0),
  mutedForeground: oklchToRgb(0.556, 0, 0),
  accentForeground: oklchToRgb(0.205, 0, 0),
  destructive: oklchToRgb(0.577, 0.245, 27.325),
}
const SH = Object.fromEntries(Object.entries(S).map(([k, v]) => [k, rgbToHex(v)]))
// bg-destructive/10 text-destructive (badge/button "destructive" variant): the background is
// destructive at 10% opacity composited over the white card behind it.
SH.destructiveBg10OnWhite = rgbToHex(blendOver(hexToRgb(SH.destructive), 0.1, hexToRgb('#FFFFFF')))

// ---------------------------------------------------------------------------
// Pairs actually rendered in the app (fg, bg, kind, source)
// kind: 'text' -> 4.5:1 | 'large' -> 3:1 (large text/icons) | 'graphic' -> 3:1 (non-text UI/graphical objects)
// ---------------------------------------------------------------------------

const pairs = [
  // -- Core interface text/icon matrix --------------------------------------
  { name: 'Body text (strong) on primary bg', fg: T.colorTextStrong, bg: T.colorBgPrimary, kind: 'text', source: 'tokens.ts (pervasive)' },
  { name: 'Body text (strong) on secondary bg', fg: T.colorTextStrong, bg: T.colorBgSecondary, kind: 'text', source: 'tokens.ts (pervasive)' },
  { name: 'Body text (strong) on tertiary bg', fg: T.colorTextStrong, bg: T.colorBgTertiary, kind: 'text', source: 'tokens.ts (pervasive)' },
  { name: 'Body text (medium) on primary bg', fg: T.colorTextMedium, bg: T.colorBgPrimary, kind: 'text', source: 'tokens.ts (pervasive)' },
  { name: 'Body text (medium) on secondary bg', fg: T.colorTextMedium, bg: T.colorBgSecondary, kind: 'text', source: 'tokens.ts (pervasive)' },
  { name: 'Highlight/link text on primary bg', fg: T.colorTextHighlight, bg: T.colorBgPrimary, kind: 'text', source: 'tokens.ts (pervasive)' },
  { name: 'Icon (strong) on primary bg', fg: T.colorIconStrong, bg: T.colorBgPrimary, kind: 'large', source: 'tokens.ts (pervasive)' },
  { name: 'Icon (medium) on primary bg', fg: T.colorIconMedium, bg: T.colorBgPrimary, kind: 'large', source: 'tokens.ts (pervasive)' },
  { name: 'Icon (highlight) on primary bg', fg: T.colorIconHighlight, bg: T.colorBgPrimary, kind: 'large', source: 'tokens.ts (pervasive)' },
  { name: 'On-contrast text (strong) on inverse primary bg', fg: T.colorTextOnContrastStrong, bg: T.colorBgInversePrimary, kind: 'text', source: 'tokens.ts (dark surfaces)' },
  { name: 'On-contrast text (strong) on inverse secondary bg', fg: T.colorTextOnContrastStrong, bg: T.colorBgInverseSecondary, kind: 'text', source: 'tokens.ts (dark surfaces)' },
  { name: 'On-contrast text (medium) on inverse primary bg', fg: T.colorTextOnContrastMedium, bg: T.colorBgInversePrimary, kind: 'text', source: 'tokens.ts (dark surfaces)' },

  // -- Action buttons / links ------------------------------------------------
  { name: 'Primary button text (default)', fg: T.colorActionPrimaryText, bg: T.colorPrimary, kind: 'text', source: 'tokens.ts action/primary' },
  { name: 'Primary button text (hover/focus)', fg: T.colorActionPrimaryText, bg: T.colorPrimaryDark, kind: 'text', source: 'tokens.ts action/primary' },
  { name: 'Primary button text (disabled)', fg: T.colorActionPrimaryTextDisabled, bg: T.colorPrimaryDisabled, kind: 'text', source: 'tokens.ts action/primary (disabled — informational only, AA exempts disabled controls)' },
  { name: 'Secondary button text (default)', fg: T.colorActionSecondaryText, bg: T.colorActionSecondaryBg, kind: 'text', source: 'tokens.ts action/secondary' },
  { name: 'Secondary button text (focus)', fg: T.colorActionSecondaryTextFocus, bg: T.colorActionSecondaryBgFocus, kind: 'text', source: 'tokens.ts action/secondary' },
  { name: 'Secondary button text (disabled)', fg: T.colorActionSecondaryTextDisabled, bg: T.colorActionSecondaryBg, kind: 'text', source: 'tokens.ts action/secondary (disabled — informational only)' },
  { name: 'Tertiary button text (default)', fg: T.colorActionTertiaryText, bg: T.colorActionTertiaryBg, kind: 'text', source: 'tokens.ts action/tertiary' },
  { name: 'Tertiary button text (disabled)', fg: T.colorActionTertiaryTextDisabled, bg: T.colorActionTertiaryBg, kind: 'text', source: 'tokens.ts action/tertiary (disabled — informational only)' },
  { name: 'Destructive button text (default)', fg: T.colorActionDestructiveText, bg: T.colorActionDestructiveBg, kind: 'text', source: 'tokens.ts action/destructive' },
  { name: 'Destructive button text (focus)', fg: T.colorActionDestructiveText, bg: T.colorActionDestructiveBgFocus, kind: 'text', source: 'tokens.ts action/destructive' },
  { name: 'Destructive button text (active)', fg: T.colorActionDestructiveText, bg: T.colorActionDestructiveBgActive, kind: 'text', source: 'tokens.ts action/destructive' },
  { name: 'Link text (default)', fg: T.colorActionLinkDefault, bg: T.colorBgPrimary, kind: 'text', source: 'tokens.ts action/link' },
  { name: 'Link text (focus)', fg: T.colorActionLinkFocus, bg: T.colorBgPrimary, kind: 'text', source: 'tokens.ts action/link' },
  { name: 'Link text (active)', fg: T.colorActionLinkActive, bg: T.colorBgPrimary, kind: 'text', source: 'tokens.ts action/link' },
  { name: 'Link text (disabled)', fg: T.colorActionLinkDisabled, bg: T.colorBgPrimary, kind: 'text', source: 'tokens.ts action/link (disabled — informational only)' },

  // -- Inputs -----------------------------------------------------------------
  { name: 'Input text', fg: T.colorInputText, bg: T.colorInputBg, kind: 'text', source: 'tokens.ts input' },
  { name: 'Input placeholder', fg: T.colorInputPlaceholder, bg: T.colorInputBg, kind: 'text', source: 'tokens.ts input' },
  { name: 'Input text (disabled)', fg: T.colorInputTextDisabled, bg: T.colorInputBgDisabled, kind: 'text', source: 'tokens.ts input (disabled — informational only)' },
  { name: 'Input error support text', fg: T.colorInputSupportError, bg: T.colorBgPrimary, kind: 'text', source: 'tokens.ts input' },
  { name: 'Input error border on error bg', fg: T.colorInputBorderError, bg: T.colorInputBgError, kind: 'graphic', source: 'tokens.ts input (border, WCAG 1.4.11)' },

  // -- Status badges (weak + strong) -------------------------------------------
  { name: 'Status badge — Positive (weak)', fg: T.colorStatusPositiveTextWeak, bg: T.colorStatusPositiveBgWeak, kind: 'text', source: 'tokens.ts status/positive' },
  { name: 'Status badge — Positive (strong)', fg: T.colorStatusPositiveTextStrong, bg: T.colorStatusPositiveBgStrong, kind: 'text', source: 'tokens.ts status/positive' },
  { name: 'Status badge — Tentative (weak)', fg: T.colorStatusTentativeTextWeak, bg: T.colorStatusTentativeBgWeak, kind: 'text', source: 'tokens.ts status/tentative' },
  { name: 'Status badge — Tentative (strong)', fg: T.colorStatusTentativeTextStrong, bg: T.colorStatusTentativeBgStrong, kind: 'text', source: 'tokens.ts status/tentative' },
  { name: 'Status badge — Negative (weak)', fg: T.colorStatusNegativeTextWeak, bg: T.colorStatusNegativeBgWeak, kind: 'text', source: 'tokens.ts status/negative' },
  { name: 'Status badge — Negative (strong)', fg: T.colorStatusNegativeTextStrong, bg: T.colorStatusNegativeBgStrong, kind: 'text', source: 'tokens.ts status/negative (also SuppliedInput.tsx tooltip, IndicatorsTab.tsx highlight row)' },
  { name: 'Status badge — Info (weak)', fg: T.colorStatusInfoTextWeak, bg: T.colorStatusInfoBgWeak, kind: 'text', source: 'tokens.ts status/info' },
  { name: 'Status badge — Info (strong)', fg: T.colorStatusInfoTextStrong, bg: T.colorStatusInfoBgStrong, kind: 'text', source: 'tokens.ts status/info' },
  { name: 'Status badge — Neutral (weak)', fg: T.colorStatusNeutralTextWeak, bg: T.colorStatusNeutralBgWeak, kind: 'text', source: 'tokens.ts status/neutral' },
  { name: 'Status badge — Neutral (strong)', fg: T.colorStatusNeutralTextStrong, bg: T.colorStatusNeutralBgStrong, kind: 'text', source: 'tokens.ts status/neutral' },

  // -- Order Summary supply progress bars (OrdersTable.tsx) --------------------
  { name: 'Supply bar label — default/picking', fg: T.colorTextMedium, bg: T.colorBgHighlightWeak, kind: 'large', source: 'order-summary/OrdersTable.tsx:143-161 (SUPPLIED_BAR_LABEL_COLOR.default.picking)' },
  { name: 'Supply bar label — default/packed', fg: T.colorTextOnContrastStrong, bg: T.colorBgHighlightStrong, kind: 'large', source: 'order-summary/OrdersTable.tsx:143-161 (SUPPLIED_BAR_LABEL_COLOR.default.packed)' },
  { name: 'Supply bar label — deleted (any channel)', fg: T.colorAlertErrorIcon, bg: T.colorBgPrimary, kind: 'large', source: 'order-summary/OrdersTable.tsx:143-161 (deleted, on white track)' },
  { name: 'Supply bar label — eCom/picking', fg: T.colorTextStrong, bg: T.colorSupplyEcomWeak, kind: 'large', source: 'order-summary/OrdersTable.tsx:150-155 (ecom.picking)' },
  { name: 'Supply bar label — eCom/packed', fg: T.colorTextOnContrastStrong, bg: T.colorSupplyEcomStrong, kind: 'large', source: 'order-summary/OrdersTable.tsx:150-155 (ecom.packed)' },
  { name: 'Supply bar label — Shop Floor/picking', fg: T.colorTextStrong, bg: T.colorSupplyShopFloorWeak, kind: 'large', source: 'order-summary/OrdersTable.tsx:156-161 (shopFloor.picking)' },
  { name: 'Supply bar label — Shop Floor/packed', fg: T.colorTextOnContrastStrong, bg: T.colorSupplyShopFloorStrong, kind: 'large', source: 'order-summary/OrdersTable.tsx:156-161 (shopFloor.packed)' },

  // -- lineAccents TypeBadge (order-detail) ------------------------------------
  { name: 'TypeBadge — SLT (no matching DS token)', fg: accent.slt.text, bg: accent.slt.bg, kind: 'text', source: 'order-detail/lineAccents.tsx:6' },
  { name: 'TypeBadge — SUB', fg: accent.sub.text, bg: accent.sub.bg, kind: 'text', source: 'order-detail/lineAccents.tsx:7' },
  { name: 'TypeBadge — WGHT', fg: accent.wght.text, bg: accent.wght.bg, kind: 'text', source: 'order-detail/lineAccents.tsx:8' },
  { name: 'SLT warning icon on white', fg: accent.slt.text, bg: T.colorBgPrimary, kind: 'large', source: 'order-detail/SuppliedInput.tsx:57 (AlertTriangle icon)' },

  // -- Alert / toast / inline banners (4 variants) -----------------------------
  { name: 'Alert text — Info', fg: T.colorAlertText, bg: T.colorAlertInfoBg, kind: 'text', source: 'tokens.ts alert/info' },
  { name: 'Alert icon — Info', fg: T.colorAlertInfoIcon, bg: T.colorAlertInfoBg, kind: 'large', source: 'tokens.ts alert/info' },
  { name: 'Alert text — Success', fg: T.colorAlertText, bg: T.colorAlertSuccessBg, kind: 'text', source: 'tokens.ts alert/success' },
  { name: 'Alert icon — Success', fg: T.colorAlertSuccessIcon, bg: T.colorAlertSuccessBg, kind: 'large', source: 'tokens.ts alert/success' },
  { name: 'Alert text — Warning', fg: T.colorAlertText, bg: T.colorAlertWarningBg, kind: 'text', source: 'tokens.ts alert/warning' },
  { name: 'Alert icon — Warning', fg: T.colorAlertWarningIcon, bg: T.colorAlertWarningBg, kind: 'large', source: 'tokens.ts alert/warning' },
  { name: 'Alert text — Error', fg: T.colorAlertText, bg: T.colorAlertErrorBg, kind: 'text', source: 'tokens.ts alert/error' },
  { name: 'Alert icon — Error', fg: T.colorAlertErrorIcon, bg: T.colorAlertErrorBg, kind: 'large', source: 'tokens.ts alert/error' },

  // -- Dash: IndicatorsTab / Gauge / ZoneBarChart / TimelineTab ----------------
  { name: 'TargetBadge text on card (white) bg', fg: T.colorStatusPositiveTextWeak, bg: T.colorBgPrimary, kind: 'text', source: 'dash/IndicatorsTab.tsx:16-29 (TargetBadge — token meant for BgWeak pairing, used directly on white)' },
  { name: 'Totes chart — packed segment label', fg: T.colorTextOnContrastStrong, bg: T.colorBgHighlightStrong, kind: 'large', source: 'dash/IndicatorsTab.tsx:98' },
  { name: 'Totes chart — picking segment label', fg: T.colorTextMedium, bg: T.colorBgHighlightWeak, kind: 'large', source: 'dash/IndicatorsTab.tsx:99' },
  { name: 'Totes chart — awaiting segment label', fg: T.colorBorderMedium, bg: T.colorStatusNeutralBgWeak, kind: 'large', source: 'dash/IndicatorsTab.tsx:100' },
  { name: 'Metric cell — below 95% of target', fg: T.colorStatusNegativeTextWeak, bg: T.colorStatusNegativeBgWeak, kind: 'text', source: 'dash/TimelineTab.tsx:64-73 (metricStatus, bold 700 14px caption)' },
  { name: 'Metric cell — 95-99% of target', fg: T.colorStatusTentativeTextWeak, bg: T.colorStatusTentativeBgWeak, kind: 'text', source: 'dash/TimelineTab.tsx:64-73 (metricStatus, bold 700 14px caption)' },
  { name: 'Metric cell — 100%+ of target', fg: T.colorTextMedium, bg: T.colorBgHighlightWeak, kind: 'text', source: 'dash/TimelineTab.tsx:64-73 (metricStatus, bold 700 14px caption)' },
  { name: 'Bar chart value label on white', fg: T.colorStatusNegativeTextWeak, bg: T.colorBgPrimary, kind: 'text', source: 'dash/ZoneBarChart.tsx:42 (SimpleBarChart value label)' },
  { name: 'Gauge needle/hub on white', fg: T.colorStatusInfoBgStrong, bg: T.colorBgPrimary, kind: 'graphic', source: 'dash/Gauge.tsx:131-141 (needle + hub circle)' },
  { name: 'Gauge white tick on below-target band', fg: T.colorBgPrimary, bg: T.colorStatusNegativeBgStrong, kind: 'graphic', source: 'dash/Gauge.tsx:95-110 (IndicatorsTab passes belowTargetColor=statusNegativeBgStrong)' },
  { name: 'Gauge white tick on above-target band (default)', fg: T.colorBgPrimary, bg: T.colorBgHighlightWeak, kind: 'graphic', source: 'dash/Gauge.tsx:63,95-110 (default aboveTargetColor, not overridden by IndicatorsTab)' },
  { name: 'Zone legend swatch — Ambient vs card bg', fg: T.colorZoneAmbient, bg: T.colorBgPrimary, kind: 'graphic', source: 'dash/TimelineTab.tsx:19-25,110-115 (legend swatch, WCAG 1.4.11)' },
  { name: 'Zone legend swatch — Chilled vs card bg', fg: T.colorZoneChilled, bg: T.colorBgPrimary, kind: 'graphic', source: 'dash/TimelineTab.tsx:19-25,110-115' },
  { name: 'Zone legend swatch — Frozen vs card bg', fg: T.colorZoneFrozen, bg: T.colorBgPrimary, kind: 'graphic', source: 'dash/TimelineTab.tsx:19-25,110-115' },
  { name: 'Zone legend swatch — Security vs card bg', fg: T.colorZoneSecurity, bg: T.colorBgPrimary, kind: 'graphic', source: 'dash/TimelineTab.tsx:19-25,110-115' },
  { name: 'Zone legend swatch — Non picking vs card bg', fg: T.colorZoneNonPicking, bg: T.colorBgPrimary, kind: 'graphic', source: 'dash/TimelineTab.tsx:19-25,110-115' },

  // -- Shadcn primitives (badge.tsx, button.tsx — src/index.css oklch vars) ----
  { name: 'Shadcn — primary badge/button text', fg: SH.primaryForeground, bg: SH.primary, kind: 'text', source: 'components/ui/badge.tsx, button.tsx (variant="default")' },
  { name: 'Shadcn — secondary badge/button text', fg: SH.secondaryForeground, bg: SH.secondary, kind: 'text', source: 'components/ui/badge.tsx, button.tsx (variant="secondary")' },
  { name: 'Shadcn — destructive badge/button text', fg: SH.destructive, bg: SH.destructiveBg10OnWhite, kind: 'text', source: 'components/ui/badge.tsx, button.tsx (variant="destructive", bg-destructive/10 blended over white card)' },
  { name: 'Shadcn — muted foreground on background', fg: SH.mutedForeground, bg: SH.background, kind: 'text', source: 'index.css --muted-foreground (used app-wide via text-muted-foreground)' },
  { name: 'Shadcn — body foreground on background', fg: SH.foreground, bg: SH.background, kind: 'text', source: 'index.css body { @apply bg-background text-foreground }' },
]

// ---------------------------------------------------------------------------
// Evaluate
// ---------------------------------------------------------------------------

const THRESHOLD = { text: 4.5, large: 3, graphic: 3 }

const results = pairs.map((p) => {
  const ratio = contrastRatio(p.fg, p.bg)
  const threshold = THRESHOLD[p.kind]
  return { ...p, ratio: Math.round(ratio * 100) / 100, threshold, pass: ratio >= threshold }
})

const asJson = process.argv.includes('--json')

if (asJson) {
  console.log(JSON.stringify(results, null, 2))
} else {
  const fails = results.filter((r) => !r.pass)
  const passes = results.filter((r) => r.pass)

  console.log(`WCAG 2.1 AA contrast audit — ${results.length} pairs checked`)
  console.log(`${passes.length} pass, ${fails.length} fail\n`)

  if (fails.length) {
    console.log('FAILURES:')
    for (const r of fails) {
      console.log(`  [FAIL] ${r.name}`)
      console.log(`         ${r.fg} on ${r.bg} — ratio ${r.ratio}:1, needs ${r.threshold}:1 (${r.kind})`)
      console.log(`         ${r.source}`)
    }
    console.log('')
  }

  console.log('All results:')
  for (const r of results) {
    console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.ratio.toFixed(2)}:1 (needs ${r.threshold}:1)  ${r.name}`)
  }
}
