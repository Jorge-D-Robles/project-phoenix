/** Convert a Date to YYYY-MM-DD string (UTC) */
export function toDateKey(date: Date): string {
  return date.toISOString().substring(0, 10);
}

/** Get today's date as YYYY-MM-DD string (UTC) */
export function todayDateKey(): string {
  return toDateKey(new Date());
}

/** Abbreviated month names */
export const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** Abbreviated day names */
export const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
