import assert from 'node:assert/strict';
import {
  calculateDaysRemaining,
  computeMilestoneTargetDate,
  formatFriendlyDate,
  isValidCalendarDate,
  isValidTimeZone,
  getTodayInTimezone,
  isPastDateInTimezone,
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

// Test 4: Calendar Date Validity & Leap Years
{
  // Valid calendar dates
  assert.equal(isValidCalendarDate('2026-10-30'), true);
  assert.equal(isValidCalendarDate('2028-02-29'), true); // Leap year 2028
  assert.equal(isValidCalendarDate('2026-12-31'), true);

  // Invalid calendar dates
  assert.equal(isValidCalendarDate('2026-02-31'), false); // Feb 31 does not exist
  assert.equal(isValidCalendarDate('2026-02-29'), false); // 2026 is not a leap year
  assert.equal(isValidCalendarDate('2027-02-29'), false); // 2027 is not a leap year
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

// Test 5: Timezone Validation & Fallback Safety
{
  assert.equal(isValidTimeZone('Asia/Kolkata'), true);
  assert.equal(isValidTimeZone('America/Los_Angeles'), true);
  assert.equal(isValidTimeZone('America/New_York'), true);
  assert.equal(isValidTimeZone('UTC'), true);
  assert.equal(isValidTimeZone('Europe/London'), true);

  // Invalid timezones safely return false
  assert.equal(isValidTimeZone('Mars/Olympus_Mons'), false);
  assert.equal(isValidTimeZone('Invalid/Zone'), false);
  assert.equal(isValidTimeZone(''), false);
  assert.equal(isValidTimeZone(undefined), false);

  // Safe fallback to UTC
  const fixed = new Date('2026-10-30T12:00:00Z');
  assert.equal(getTodayInTimezone('Invalid/Zone', fixed), '2026-10-30');
}

// Test 6: Timezone-Specific Boundaries (India, US Pacific, US Eastern, UTC)
{
  // Point in time: 2026-10-30 at 20:30:00 UTC
  // In UTC: 2026-10-30
  // In US Pacific (UTC-7 PDT): 13:30 (Oct 30)
  // In US Eastern (UTC-4 EDT): 16:30 (Oct 30)
  // In India (UTC+5:30 IST): 02:00 (Oct 31) -> already next day!
  const timestampA = new Date('2026-10-30T20:30:00Z');

  assert.equal(getTodayInTimezone('UTC', timestampA), '2026-10-30');
  assert.equal(getTodayInTimezone('America/Los_Angeles', timestampA), '2026-10-30');
  assert.equal(getTodayInTimezone('America/New_York', timestampA), '2026-10-30');
  assert.equal(getTodayInTimezone('Asia/Kolkata', timestampA), '2026-10-31');

  // In US Pacific: Oct 30 is TODAY -> valid
  assert.equal(isPastDateInTimezone('2026-10-30', 'America/Los_Angeles', timestampA), false, 'Oct 30 is today in LA');
  assert.equal(isPastDateInTimezone('2026-10-29', 'America/Los_Angeles', timestampA), true, 'Oct 29 is yesterday in LA');
  assert.equal(isPastDateInTimezone('2026-10-31', 'America/Los_Angeles', timestampA), false, 'Oct 31 is tomorrow in LA');

  // In India: it is ALREADY Oct 31 -> Oct 30 is YESTERDAY
  assert.equal(isPastDateInTimezone('2026-10-30', 'Asia/Kolkata', timestampA), true, 'Oct 30 has passed in Kolkata');
  assert.equal(isPastDateInTimezone('2026-10-31', 'Asia/Kolkata', timestampA), false, 'Oct 31 is today in Kolkata');
}

// Test 7: Evening Boundary in US Pacific (America/Los_Angeles)
{
  // Point in time: 2026-10-31 at 02:00:00 UTC
  // In UTC: already Oct 31 02:00
  // In US Pacific (PDT): Oct 30 at 19:00 (7:00 PM) -> still Oct 30!
  const eveningInLA = new Date('2026-10-31T02:00:00Z');

  assert.equal(getTodayInTimezone('America/Los_Angeles', eveningInLA), '2026-10-30');
  assert.equal(getTodayInTimezone('UTC', eveningInLA), '2026-10-31');

  // For a user in LA at 7 PM on Oct 30, Oct 30 MUST NOT be rejected as past!
  assert.equal(
    isPastDateInTimezone('2026-10-30', 'America/Los_Angeles', eveningInLA),
    false,
    '7 PM in LA on Oct 30 must allow Oct 30'
  );
  assert.equal(
    isPastDateInTimezone('2026-10-29', 'America/Los_Angeles', eveningInLA),
    true,
    'Oct 29 is yesterday in LA'
  );
  assert.equal(
    isPastDateInTimezone('2026-10-31', 'America/Los_Angeles', eveningInLA),
    false,
    'Oct 31 is tomorrow in LA'
  );

  // In UTC at the same moment, Oct 30 has indeed passed
  assert.equal(isPastDateInTimezone('2026-10-30', 'UTC', eveningInLA), true, 'In UTC Oct 30 has passed');
  assert.equal(isPastDateInTimezone('2026-10-31', 'UTC', eveningInLA), false, 'In UTC Oct 31 is today');
}

// Test 8: Midnight Boundary (23:59:59 vs 00:00:01) in US Eastern (America/New_York)
{
  // One second before midnight EDT
  const justBeforeMidnightNY = new Date('2026-10-31T03:59:59Z'); // 23:59:59 EDT Oct 30
  assert.equal(getTodayInTimezone('America/New_York', justBeforeMidnightNY), '2026-10-30');
  assert.equal(isPastDateInTimezone('2026-10-30', 'America/New_York', justBeforeMidnightNY), false);

  // Two seconds later: just after midnight EDT
  const justAfterMidnightNY = new Date('2026-10-31T04:00:01Z'); // 00:00:01 EDT Oct 31
  assert.equal(getTodayInTimezone('America/New_York', justAfterMidnightNY), '2026-10-31');
  assert.equal(isPastDateInTimezone('2026-10-30', 'America/New_York', justAfterMidnightNY), true);
  assert.equal(isPastDateInTimezone('2026-10-31', 'America/New_York', justAfterMidnightNY), false);
}

// Test 9: Legacy isPastDate wrapper compatibility
{
  const testNow = new Date('2026-10-30T12:00:00Z');
  assert.equal(isPastDate('2026-10-30', testNow), false);
  assert.equal(isPastDate('2026-10-29', testNow), true);
  assert.equal(isPastDate('2026-10-31', testNow), false);
}

console.log('✓ Timezone-aware date, calendar validity, boundary conditions & past-date unit tests passed.');
