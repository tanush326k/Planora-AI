import assert from 'node:assert/strict';
import { planGenerationInputSchema } from '../../lib/validation/planSchema';

// Test 1: Valid event inputs
{
  const valid = {
    title: 'Spring Garden Wedding',
    type: 'wedding',
    date: '2026-09-15',
    guestCount: 150,
    totalBudget: 35000,
    currency: 'usd',
    location: 'Charleston, SC',
    themeOrStyle: 'Botanical Elegance',
  };

  const parsed = planGenerationInputSchema.safeParse(valid);
  assert.ok(parsed.success, 'Valid input should pass schema');
  if (parsed.success) {
    assert.equal(parsed.data.currency, 'USD', 'Currency should be transformed to uppercase');
  }
}

// Test 2: Invalid inputs and rejection
{
  // Short title
  const invalidTitle = planGenerationInputSchema.safeParse({
    title: 'A',
    type: 'birthday',
    date: '2026-08-01',
    guestCount: 20,
    totalBudget: 1000,
  });
  assert.equal(invalidTitle.success, false);

  // Negative budget
  const negativeBudget = planGenerationInputSchema.safeParse({
    title: 'Valid Title',
    type: 'community',
    date: '2026-08-01',
    guestCount: 50,
    totalBudget: -500,
  });
  assert.equal(negativeBudget.success, false);

  // Unreasonable guest count (> 50,000)
  const hugeGuests = planGenerationInputSchema.safeParse({
    title: 'Mega Fest',
    type: 'community',
    date: '2026-08-01',
    guestCount: 999999,
    totalBudget: 50000,
  });
  assert.equal(hugeGuests.success, false);

  // Unsupported event type
  const badType = planGenerationInputSchema.safeParse({
    title: 'Corporate Conference',
    type: 'corporate_conference',
    date: '2026-08-01',
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

console.log('✓ Input validation & boundary constraints unit tests passed.');

