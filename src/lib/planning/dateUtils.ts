/**
 * GatherWise AI — Date utilities for date-aware timeline calculations
 */

export function calculateDaysRemaining(eventDateISO: string, relativeToDate = new Date()): number {
  const target = new Date(eventDateISO);
  if (isNaN(target.getTime())) {
    return 0;
  }
  const diffTime = target.getTime() - relativeToDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
