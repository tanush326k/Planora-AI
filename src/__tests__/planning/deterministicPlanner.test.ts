import assert from 'node:assert/strict';
import { generateDeterministicPlan } from '../../lib/planning/deterministicPlanner';
import { EventDetails } from '../../types/event';

const details: EventDetails = {
  title: 'Community Green Fair',
  type: 'community',
  date: '2026-10-15',
  guestCount: 300,
  totalBudget: 12000,
  currency: 'USD',
  location: 'Oak Park Commons',
};

const plan = generateDeterministicPlan(details, {
  specialRequests: 'Need zero-waste stations and bike parking',
});

// Test 1: Plan metadata and source attribution
assert.ok(plan.id.startsWith('plan_'), 'Plan ID must be populated');
assert.equal(plan.isFallback, true, 'Deterministic plan must be labeled isFallback: true');
assert.equal(plan.source, 'deterministic_fallback', 'Source must be deterministic_fallback');
assert.ok((plan.generationNotes || '').length > 0, 'Generation notes must explain why');

// Test 2: Budget conservation
const sumAllocated = plan.budgetPlan.categories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);
assert.ok(
  sumAllocated <= plan.budgetPlan.totalBudget,
  `Allocated budget (${sumAllocated}) cannot exceed total (${plan.budgetPlan.totalBudget})`
);
assert.equal(plan.budgetPlan.totalBudget, 12000);

// Test 3: Date-aware timeline
assert.equal(plan.timelinePlan.eventDate, '2026-10-15');
assert.ok(plan.timelinePlan.phases.length >= 3, 'Must have at least 3 distinct timeline phases');
for (const phase of plan.timelinePlan.phases) {
  assert.ok(phase.milestones.length > 0, 'Each phase must have milestones');
  for (const milestone of phase.milestones) {
    assert.ok(milestone.daysBeforeEvent > 0, 'Milestones must have positive days before event');
    assert.ok(milestone.targetDate, 'Target date must be computed');
  }
}

// Test 4: Vendor checklist
assert.ok(plan.vendorPlan.items.length >= 4, 'Must recommend at least 4 vendors');
for (const v of plan.vendorPlan.items) {
  assert.ok(v.estimatedCostRange.min > 0, 'Vendor min cost must be positive');
  assert.ok(v.estimatedCostRange.max >= v.estimatedCostRange.min, 'Vendor max must be >= min');
  assert.ok(v.keyQuestionsToAsk.length >= 2, 'Must include vetting questions');
}

// Test 5: Personalized ideas
assert.ok(plan.personalizedIdeas.length >= 3, 'Must have personalized ideas');
for (const idea of plan.personalizedIdeas) {
  assert.ok(idea.title.length > 0);
  assert.ok(idea.description.length > 0);
  assert.ok(['low', 'medium', 'high'].includes(idea.estimatedCostImpact));
}

console.log('✓ Deterministic planner & structured output unit tests passed.');
