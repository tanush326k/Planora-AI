import assert from 'node:assert/strict';
import { calculateBaselineBudget } from '../../lib/planning/budgetCalculator';

// Test 1: Wedding Budget distribution sums properly
{
  const total = 30000;
  const budget = calculateBaselineBudget(total, 'wedding', 'USD');
  
  assert.equal(budget.totalBudget, 30000);
  assert.equal(budget.currency, 'USD');
  assert.ok(budget.categories.length > 0, 'Categories must not be empty');
  
  const sumAllocated = budget.categories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);
  assert.ok(Math.abs(sumAllocated - total) <= 1, 'Allocated budget should match total');
  assert.ok(budget.contingencyReserve > 0, 'Must have a contingency buffer');
}

// Test 2: Birthday Budget allocation
{
  const total = 2500;
  const budget = calculateBaselineBudget(total, 'birthday', 'USD');
  
  assert.equal(budget.totalBudget, 2500);
  const foodCat = budget.categories.find(c => c.name.toLowerCase().includes('food'));
  assert.ok(foodCat !== undefined, 'Birthday budget must have food category');
  assert.ok((foodCat?.allocatedAmount || 0) > 500, 'Food should receive major allocation');
}

// Test 3: Community Event Budget allocation
{
  const total = 10000;
  const budget = calculateBaselineBudget(total, 'community', 'USD');
  
  assert.equal(budget.totalBudget, 10000);
  const permitsCat = budget.categories.find(c => c.name.toLowerCase().includes('permits'));
  assert.ok(permitsCat !== undefined, 'Community event must account for permits/safety');
}

console.log('All budgetCalculator unit tests passed successfully.');

