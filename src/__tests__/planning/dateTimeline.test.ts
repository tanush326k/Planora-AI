import assert from 'node:assert/strict';
import {
  calculateDaysRemaining,
  computeMilestoneTargetDate,
  formatFriendlyDate,
  isValidCalendarDate,
  isPastDate,
} from '../../lib/planning/dateUtils';

// Test 1: Date-aware countdown calculations
{
  const relativeDate = new Date('2026-06-01T12:00:00Z');

  // Same day
  assert.equal(calculateDaysRemaining('2026-06-01', relativeDate), 0);

  // 10 days in the future
  assert.equal(calculateDaysRemaining('2026-06-11', relativeDate), 10);

  // Past date
  assert.ok(calculateDaysRemaining('2026-05-20', relativeDate) < 0, 'Past date should yield negative days');

  // Invalid date string
  assert.equal(calculateDaysRemaining('invalid-date', relativeDate), 0);
}

// Test 2: Milestone target date backward computation
{
  const eventDate = '2026-12-25';

  // 30 days before Dec 25 -> Nov 25
  const target30 = computeMilestoneTargetDate(eventDate, 30);
  assert.equal(target30, '2026-11-25');

  // Leap year boundary test (2028 is a leap year)
  const leapEvent = '2028-03-05';
  const targetLeap = computeMilestoneTargetDate(leapEvent, 6);
  assert.equal(targetLeap, '2028-02-28'); // Crosses Feb 29 smoothly

  // Zero days before event
  assert.equal(computeMilestoneTargetDate(eventDate, 0), '2026-12-25');
}

// Test 3: Friendly date formatting
{
  const formatted = formatFriendlyDate('2026-10-31');
  assert.ok(formatted.includes('Oct'), `Should format month: ${formatted}`);
  assert.ok(formatted.includes('31'), `Should format day: ${formatted}`);
  assert.ok(formatted.includes('2026'), `Should format year: ${formatted}`);

  assert.equal(formatFriendlyDate(''), '');
}

// Test 4: Calendar Date Validity
{
  // Valid calendar dates
  assert.equal(isValidCalendarDate('2026-10-30'), true);
  assert.equal(isValidCalendarDate('2028-02-29'), true); // Leap year
  assert.equal(isValidCalendarDate('2026-12-31'), true);

  // Invalid calendar dates
  assert.equal(isValidCalendarDate('2026-02-31'), false); // Feb 31 does not exist
  assert.equal(isValidCalendarDate('2026-02-29'), false); // 2026 is not a leap year
  assert.equal(isValidCalendarDate('2026-04-31'), false); // April has 30 days
  assert.equal(isValidCalendarDate('2026-06-31'), false); // June has 30 days
  assert.equal(isValidCalendarDate('2026-09-31'), false); // Sept has 30 days
  assert.equal(isValidCalendarDate('2026-11-31'), false); // Nov has 30 days
  assert.equal(isValidCalendarDate('2026-13-01'), false); // Month 13
  assert.equal(isValidCalendarDate('2026-00-10'), false); // Month 00
  assert.equal(isValidCalendarDate('2026-05-00'), false); // Day 00
  assert.equal(isValidCalendarDate('2026-05-32'), false); // Day 32
  assert.equal(isValidCalendarDate('invalid-string'), false);
  assert.equal(isValidCalendarDate(''), false);
}

// Test 5: isPastDate logic and Timezone Boundary handling
{
  // Relative to a fixed point in time: 2026-10-30 14:00 UTC
  const fixedDate = new Date('2026-10-30T14:00:00Z');

  // Today (2026-10-30) should NOT be considered in the past
  assert.equal(isPastDate('2026-10-30', fixedDate), false, 'Today must not be past');

  // Tomorrow (2026-10-31) should NOT be considered in the past
  assert.equal(isPastDate('2026-10-31', fixedDate), false, 'Tomorrow must not be past');

  // Future date should NOT be considered in the past
  assert.equal(isPastDate('2027-01-01', fixedDate), false, 'Future date must not be past');

  // Yesterday (2026-10-29) MUST be considered in the past
  assert.equal(isPastDate('2026-10-29', fixedDate), true, 'Yesterday must be in the past');

  // Date 1 year ago MUST be considered in the past
  assert.equal(isPastDate('2025-10-30', fixedDate), true, 'Past year must be in the past');

  // Boundary condition: near UTC midnight transition (2026-10-30 23:59 UTC)
  const lateUtc = new Date('2026-10-30T23:59:59Z');
  assert.equal(isPastDate('2026-10-30', lateUtc), false, 'Today at 23:59 must still be valid');
  assert.equal(isPastDate('2026-10-29', lateUtc), true, 'Yesterday must still be in the past');
}

console.log('✓ Date, timeline, calendar validity & past-date boundary unit tests passed.');
