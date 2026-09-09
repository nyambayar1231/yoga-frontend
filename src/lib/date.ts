/**
 * YYYY.MM.DD in local time.
 *
 * Built by hand rather than with Intl: Chrome ships no `mn` locale data
 * (`supportedLocalesOf(['mn-MN'])` is empty), so it silently falls back to
 * en-US and renders 09/09/2026. Node's full-ICU build does have `mn`, so the
 * discrepancy only shows up in a browser.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

/**
 * YYYY.MM.DD HH:mm in local time. Same hand-rolled approach as formatDate, and
 * for the same reason: Chrome has no `mn` locale data to fall back on.
 */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${formatDate(iso)} ${hours}:${minutes}`
}

/** HH:mm in local time, for a row that already shows the date. */
export function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
