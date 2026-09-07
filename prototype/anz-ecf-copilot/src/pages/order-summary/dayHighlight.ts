import tokens from '@/theme/tokens'

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

/**
 * Highlight colors for the selected day's header row in the overview drawers:
 * yellow for a past date, blue for a future date, green for today.
 */
export function selectedDayHighlight(selectedDate: Date) {
  const selected = startOfDay(selectedDate).getTime()
  const today = startOfDay(new Date()).getTime()

  if (selected < today) {
    return { bg: tokens.colorAlertWarningBg, text: tokens.colorTextStrong }
  }
  if (selected > today) {
    return { bg: tokens.colorAlertInfoBg, text: tokens.colorTextStrong }
  }
  return { bg: tokens.colorBgHighlightMedium, text: tokens.colorTextOnContrastStrong }
}
