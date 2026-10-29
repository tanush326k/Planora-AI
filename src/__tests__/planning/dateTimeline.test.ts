import assert from 'node:assert/strict';
import { calculateDaysRemaining, computeMilestoneTargetDate, formatFriendlyDate } from '../../lib/planning/dateUtils';

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

console.log('✓ Date and timeline edge cases unit tests passed.');

