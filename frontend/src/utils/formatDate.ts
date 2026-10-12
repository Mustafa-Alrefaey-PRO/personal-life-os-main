/**
 * Format a date value as dd/mm/yyyy.
 * Accepts a Date object, ISO string, or any value parseable by `new Date()`.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB'); // always dd/mm/yyyy
}

/**
 * Format a date as a long human-readable string, e.g. "Monday, 1 January 2024".
 * Respects the given locale but always puts day before month (en-GB for English).
 */
export function formatDateLong(value: string | Date, locale: string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  // Map 'en' → 'en-GB' so day comes before month; keep others (e.g. 'ar') as-is
  const resolvedLocale = locale === 'en' ? 'en-GB' : locale;
  return date.toLocaleDateString(resolvedLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * The calendar date part (YYYY-MM-DD) of an API date such as "2026-10-12T00:00:00".
 * API dates are date-only values, so the string is used as-is rather than parsed.
 */
export function toDateKey(value: string): string {
  return value.split('T')[0];
}

/** Today's date as YYYY-MM-DD in the user's local time zone (not UTC). */
export function todayKey(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

/** Whether an API date falls inside an optional inclusive YYYY-MM-DD range. Missing dates only match an empty range. */
export function isInDateRange(value: string | undefined, from: string, to: string): boolean {
  if (!from && !to) return true;
  if (!value) return false;
  const key = toDateKey(value);
  return (!from || key >= from) && (!to || key <= to);
}
