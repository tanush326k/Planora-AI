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
 * Determines whether a YYYY-MM-DD date is strictly in the past.
 * 
 * Handles timezone boundaries consistently:
 * An event date is considered in the past only if it has already concluded
 * in both the local system time AND UTC.
 * Today's date remains valid across timezone boundaries.
 */
export function isPastDate(dateStr: string, relativeDate = new Date()): boolean {
  if (!isValidCalendarDate(dateStr)) return false;

  const [year, monthStr, dayStr] = dateStr.trim().split('-').map(Number);
  const month = monthStr - 1;
  const day = dayStr;

  // Local calendar date comparison (midnight to midnight)
  const targetDateLocal = new Date(year, month, day);
  const localToday = new Date(
    relativeDate.getFullYear(),
    relativeDate.getMonth(),
    relativeDate.getDate()
  );

  // UTC calendar date comparison (UTC midnight to UTC midnight)
  const targetDateUTC = new Date(Date.UTC(year, month, day));
  const utcToday = new Date(
    Date.UTC(
      relativeDate.getUTCFullYear(),
      relativeDate.getUTCMonth(),
      relativeDate.getUTCDate()
    )
  );

  // Strictly in the past only if it has elapsed in both local and UTC frames
  return targetDateLocal < localToday && targetDateUTC < utcToday;
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
