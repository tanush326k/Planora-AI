import assert from 'node:assert/strict';
import { calculateBaselineBudget } from '../../lib/planning/budgetCalculator';
import { EventType } from '../../types/event';

// Test 1: Hard budget ceiling preservation across various budget scales
const testCases: Array<{ budget: number; type: EventType; currency: string }> = [
  { budget: 50, type: 'birthday', currency: 'USD' },
  { budget: 1234.56, type: 'community', currency: 'USD' },
  { budget: 25000, type: 'wedding', currency: 'EUR' },
  { budget: 87654, type: 'wedding', currency: 'GBP' },
  { budget: 1000000, type: 'community', currency: 'CAD' },
];

for (const tc of testCases) {
  const result = calculateBaselineBudget(tc.budget, tc.type, tc.currency);

  assert.equal(result.totalBudget, tc.budget, `Total budget must match input: ${tc.budget}`);
  assert.equal(result.currency, tc.currency, `Currency must match input: ${tc.currency}`);

  const sumCategories = result.categories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);

  // Sum of categories should not exceed totalBudget
  assert.ok(
    sumCategories <= Math.ceil(tc.budget),
    `Allocations (${sumCategories}) must not exceed ceiling (${tc.budget})`
  );

  // Contingency reserve must be positive for all valid budgets
  assert.ok(
    result.contingencyReserve > 0,
    `Contingency reserve (${result.contingencyReserve}) must be positive for budget: ${tc.budget}`
  );

  // Unallocated amount must never be negative
  assert.ok(
    result.unallocatedAmount >= 0,
    `Unallocated amount (${result.unallocatedAmount}) cannot be negative`
  );
}

// Test 2: Negative or zero budget input safety
const zeroBudget = calculateBaselineBudget(0, 'birthday');
assert.equal(zeroBudget.totalBudget, 0);
assert.equal(zeroBudget.contingencyReserve, 0);

const negativeBudget = calculateBaselineBudget(-500, 'wedding');
assert.equal(negativeBudget.totalBudget, 0, 'Negative budget must be normalized to 0');

console.log('✓ Budget limits & hard ceiling unit tests passed.');

