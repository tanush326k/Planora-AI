import assert from 'node:assert/strict';
import { planGenerationInputSchema } from '../../lib/validation/planSchema';

const pad = (n: number) => String(n).padStart(2, '0');
const now = new Date();
const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const yDate = new Date(now);
yDate.setDate(yDate.getDate() - 1);
const yesterdayStr = `${yDate.getFullYear()}-${pad(yDate.getMonth() + 1)}-${pad(yDate.getDate())}`;

const tDate = new Date(now);
tDate.setDate(tDate.getDate() + 1);
const tomorrowStr = `${tDate.getFullYear()}-${pad(tDate.getMonth() + 1)}-${pad(tDate.getDate())}`;

// Test 1: Valid event inputs
{
  const valid = {
    title: 'Spring Garden Wedding',
    type: 'wedding',
    date: '2028-09-15',
    guestCount: 150,
    totalBudget: 35000,
    currency: 'usd',
    location: 'Charleston, SC',
    themeOrStyle: 'Botanical Elegance',
    vibeKeywords: ['Romantic', 'Garden', 'Intimate'],
  };

  const parsed = planGenerationInputSchema.safeParse(valid);
  assert.ok(parsed.success, 'Valid input should pass schema');
  if (parsed.success) {
    assert.equal(parsed.data.currency, 'USD', 'Currency should be transformed to uppercase');
    assert.equal(parsed.data.vibeKeywords.length, 3, 'Should parse vibe keywords');
  }
}

// Test 2: Past-date validation (Yesterday vs Today vs Tomorrow)
{
  const base = {
    title: 'Anniversary Party',
    type: 'birthday' as const,
    guestCount: 50,
    totalBudget: 5000,
  };

  // Yesterday must be rejected
  const yesterdayResult = planGenerationInputSchema.safeParse({
    ...base,
    date: yesterdayStr,
  });
  assert.equal(yesterdayResult.success, false, 'Yesterday must be rejected');
  if (!yesterdayResult.success) {
    const issue = yesterdayResult.error.issues.find((i) => i.path.includes('date'));
    assert.ok(issue, 'Should have date issue');
    assert.equal(issue?.message, 'Event date must be today or in the future');
  }

  // Today must be valid
  const todayResult = planGenerationInputSchema.safeParse({
    ...base,
    date: todayStr,
  });
  assert.ok(todayResult.success, `Today (${todayStr}) must be valid`);

  // Tomorrow must be valid
  const tomorrowResult = planGenerationInputSchema.safeParse({
    ...base,
    date: tomorrowStr,
  });
  assert.ok(tomorrowResult.success, `Tomorrow (${tomorrowStr}) must be valid`);

  // Historical date in 2020 must be rejected
  const oldDateResult = planGenerationInputSchema.safeParse({
    ...base,
    date: '2020-01-01',
  });
  assert.equal(oldDateResult.success, false, 'Historical date must be rejected');
}

// Test 3: Calendar Date Validity & Boundary Edge Cases
{
  const base = {
    title: 'Community Fair',
    type: 'community' as const,
    guestCount: 100,
    totalBudget: 8000,
  };

  // February 31 (non-existent calendar day)
  const feb31 = planGenerationInputSchema.safeParse({
    ...base,
    date: '2028-02-31',
  });
  assert.equal(feb31.success, false, 'Feb 31 must be rejected');
  if (!feb31.success) {
    const issue = feb31.error.issues.find((i) => i.path.includes('date'));
    assert.equal(issue?.message, 'Date must be a valid calendar date');
  }

  // April 31 (April has only 30 days)
  const apr31 = planGenerationInputSchema.safeParse({
    ...base,
    date: '2028-04-31',
  });
  assert.equal(apr31.success, false, 'April 31 must be rejected');

  // Month 13
  const badMonth = planGenerationInputSchema.safeParse({
    ...base,
    date: '2028-13-10',
  });
  assert.equal(badMonth.success, false, 'Month 13 must be rejected');

  // Day 00
  const dayZero = planGenerationInputSchema.safeParse({
    ...base,
    date: '2028-05-00',
  });
  assert.equal(dayZero.success, false, 'Day 00 must be rejected');

  // Non-leap year February 29 (2027 is not a leap year)
  const feb29NonLeap = planGenerationInputSchema.safeParse({
    ...base,
    date: '2027-02-29',
  });
  assert.equal(feb29NonLeap.success, false, 'Feb 29 on non-leap year must be rejected');

  // Valid leap year February 29 (2028 is a leap year)
  const feb29Leap = planGenerationInputSchema.safeParse({
    ...base,
    date: '2028-02-29',
  });
  assert.ok(feb29Leap.success, 'Feb 29 on leap year 2028 must be valid');
}

// Test 4: General Invalid inputs and rejection
{
  // Short title
  const invalidTitle = planGenerationInputSchema.safeParse({
    title: 'A',
    type: 'birthday',
    date: '2028-08-01',
    guestCount: 20,
    totalBudget: 1000,
  });
  assert.equal(invalidTitle.success, false);

  // Negative budget
  const negativeBudget = planGenerationInputSchema.safeParse({
    title: 'Valid Title',
    type: 'community',
    date: '2028-08-01',
    guestCount: 50,
    totalBudget: -500,
  });
  assert.equal(negativeBudget.success, false);

  // Unreasonable guest count (> 50,000)
  const hugeGuests = planGenerationInputSchema.safeParse({
    title: 'Mega Fest',
    type: 'community',
    date: '2028-08-01',
    guestCount: 999999,
    totalBudget: 50000,
  });
  assert.equal(hugeGuests.success, false);

  // Unsupported event type
  const badType = planGenerationInputSchema.safeParse({
    title: 'Corporate Conference',
    type: 'corporate_conference',
    date: '2028-08-01',
    guestCount: 100,
    totalBudget: 10000,
  });
  assert.equal(badType.success, false);

  // Malformed date
  const badDate = planGenerationInputSchema.safeParse({
    title: 'Valid Title',
    type: 'wedding',
    date: 'tomorrow',
    guestCount: 100,
    totalBudget: 10000,
  });
  assert.equal(badDate.success, false);
}

// Test 5: Vibe Keywords Constraints
{
  const base = {
    title: 'Summer Gala',
    type: 'wedding' as const,
    date: '2028-07-20',
    guestCount: 120,
    totalBudget: 20000,
  };

  // Up to 10 vibe keywords: valid
  const tenVibes = planGenerationInputSchema.safeParse({
    ...base,
    vibeKeywords: ['Vibe1', 'Vibe2', 'Vibe3', 'Vibe4', 'Vibe5', 'Vibe6', 'Vibe7', 'Vibe8', 'Vibe9', 'Vibe10'],
  });
  assert.ok(tenVibes.success, '10 vibes should pass');

  // More than 10 vibe keywords: rejected
  const elevenVibes = planGenerationInputSchema.safeParse({
    ...base,
    vibeKeywords: ['Vibe1', 'Vibe2', 'Vibe3', 'Vibe4', 'Vibe5', 'Vibe6', 'Vibe7', 'Vibe8', 'Vibe9', 'Vibe10', 'Vibe11'],
  });
  assert.equal(elevenVibes.success, false, '11 vibes must be rejected');

  // Vibe keyword > 30 characters: rejected
  const longVibe = planGenerationInputSchema.safeParse({
    ...base,
    vibeKeywords: ['This vibe keyword is way too long to be acceptable in the tags selector'],
  });
  assert.equal(longVibe.success, false, 'Vibe keyword > 30 chars must be rejected');
}

console.log('✓ Input validation, past-date & calendar boundary unit tests passed.');
