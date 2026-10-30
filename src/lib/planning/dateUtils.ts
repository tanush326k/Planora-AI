/**
 * Planora AI — Date utilities for date-aware timeline calculations and validation
 */

/**
 * Validates that a string is a strictly valid calendar date in YYYY-MM-DD format.
 * Prevents rollover dates (e.g. 2026-02-31 -> 2026-03-03 or month 13).
 */
export function isValidCalendarDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);

  // Month boundary check (0 - 11)
  if (month < 0 || month > 11) return false;
  if (day < 1 || day > 31) return false;

  const parsed = new Date(Date.UTC(year, month, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month &&
    parsed.getUTCDate() === day
  );
}

/**
 * Validates whether a string is a recognized IANA timezone identifier.
 * Safe fallback to UTC occurs if validation fails.
 */
export function isValidTimeZone(tz?: string): boolean {
  if (!tz || typeof tz !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns today's calendar date as YYYY-MM-DD in the specified IANA timezone.
 * Uses standard ECMAScript Intl with 'en-CA' locale (ISO YYYY-MM-DD).
 */
export function getTodayInTimezone(timeZone = 'UTC', relativeDate = new Date()): string {
  const safeTz = isValidTimeZone(timeZone) ? timeZone : 'UTC';
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: safeTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(relativeDate);
}

/**
 * Determines whether a YYYY-MM-DD date is strictly in the past relative to
 * the user's local calendar day in their validated IANA timezone.
 * 
 * Accurately handles timezone offsets across India (UTC+5:30), US Pacific (UTC-8/UTC-7),
 * US Eastern (UTC-5/UTC-4), and UTC without relying on arbitrary grace periods.
 */
export function isPastDateInTimezone(
  dateStr: string,
  timeZone = 'UTC',
  relativeDate = new Date()
): boolean {
  if (!isValidCalendarDate(dateStr)) return false;
  const todayStr = getTodayInTimezone(timeZone, relativeDate);
  return dateStr.trim() < todayStr;
}

/**
 * Legacy compatibility wrapper defaulting to UTC or specified relative date.
 */
export function isPastDate(dateStr: string, relativeDate = new Date()): boolean {
  return isPastDateInTimezone(dateStr, 'UTC', relativeDate);
}

export function calculateDaysRemaining(eventDateISO: string, relativeToDate = new Date()): number {
  const target = new Date(eventDateISO);
  if (isNaN(target.getTime())) {
    return 0;
  }
  const diffTime = target.getTime() - relativeToDate.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  // Normalize -0 to 0
  return Object.is(days, -0) || days === 0 ? 0 : days;
}

export function computeMilestoneTargetDate(eventDateISO: string, daysBeforeEvent: number): string {
  const eventDate = new Date(eventDateISO);
  if (isNaN(eventDate.getTime())) {
    return '';
  }
  const targetDate = new Date(eventDate);
  targetDate.setDate(targetDate.getDate() - daysBeforeEvent);
  return targetDate.toISOString().split('T')[0];
}

export function formatFriendlyDate(dateISO: string): string {
  if (!dateISO) return '';
  const date = new Date(dateISO);
  if (isNaN(date.getTime())) return dateISO;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}
