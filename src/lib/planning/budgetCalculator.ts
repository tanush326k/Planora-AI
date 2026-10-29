import { EventType } from '@/types/event';
import { EventBudgetPlan, BudgetCategoryAllocation } from '@/types/budget';

interface DefaultCategoryDistribution {
  name: string;
  percentage: number;
  description: string;
}

const DEFAULT_DISTRIBUTIONS: Record<EventType, DefaultCategoryDistribution[]> = {
  wedding: [
    { name: 'Venue & Rentals', percentage: 0.40, description: 'Ceremony & reception venue fees, tables, chairs, linens' },
    { name: 'Catering & Beverages', percentage: 0.25, description: 'Plated/buffet service, bar package, service staff fees' },
    { name: 'Photography & Video', percentage: 0.12, description: 'Full day coverage, engagement session, album/video reel' },
    { name: 'Attire & Beauty', percentage: 0.08, description: 'Wedding attire, alterations, hair and makeup styling' },
    { name: 'Music & Entertainment', percentage: 0.07, description: 'DJ, live band, MC, or acoustic ceremony ensemble' },
    { name: 'Contingency Reserve', percentage: 0.08, description: 'Unplanned expenses, tips, and last-minute changes' }
  ],
  birthday: [
    { name: 'Food & Refreshments', percentage: 0.45, description: 'Main meal, appetizers, cocktails, non-alcoholic drinks' },
    { name: 'Venue / Rental Space', percentage: 0.20, description: 'Event hall, restaurant private room, or party equipment' },
    { name: 'Entertainment & Activities', percentage: 0.12, description: 'DJ, performers, photo booth, games' },
    { name: 'Cake & Confections', percentage: 0.10, description: 'Custom thematic cake, dessert table, pastries' },
    { name: 'Decorations & Favors', percentage: 0.08, description: 'Balloons, centerpieces, guest gift bags' },
    { name: 'Contingency Reserve', percentage: 0.05, description: 'Surprise additional guests, extra supplies' }
  ],
  community: [
    { name: 'Permits, Insurance & Safety', percentage: 0.25, description: 'Municipal event permit, insurance, sanitation, first aid' },
    { name: 'AV, Staging & Equipment', percentage: 0.25, description: 'PA system, microphones, stage, tents, power generators' },
    { name: 'Hospitality & Refreshments', percentage: 0.20, description: 'Water stations, food stalls, hospitality for volunteers' },
    { name: 'Marketing & Signage', percentage: 0.15, description: 'Flyers, local social media, banners, directional signs' },
    { name: 'Supplies & Operations', percentage: 0.05, description: 'Badges, walkie-talkies, waste management bins' },
    { name: 'Contingency Reserve', percentage: 0.10, description: 'Weather backup contingencies and emergent logistics' }
  ]
};

/**
 * Deterministically calculates a baseline budget allocation based on total budget and event type.
 */
export function calculateBaselineBudget(totalBudget: number, eventType: EventType, currency = 'USD'): EventBudgetPlan {
  const safeTotal = Math.max(0, totalBudget);
  const distribution = DEFAULT_DISTRIBUTIONS[eventType] || DEFAULT_DISTRIBUTIONS.wedding;

  let allocatedSum = 0;
  let contingencyAmount = 0;

  const categories: BudgetCategoryAllocation[] = distribution.map((dist, index) => {
    const rawAmount = Math.round(safeTotal * dist.percentage);
    allocatedSum += rawAmount;

    if (dist.name.toLowerCase().includes('contingency')) {
      contingencyAmount = rawAmount;
    }

    return {
      id: `cat-${eventType}-${index + 1}`,
      name: dist.name,
      recommendedPercentage: Math.round(dist.percentage * 100),
      allocatedAmount: rawAmount,
      spentAmount: 0,
      description: dist.description,
      items: []
    };
  });

  const unallocatedAmount = Math.max(0, safeTotal - allocatedSum);

  return {
    totalBudget: safeTotal,
    currency,
    contingencyReserve: contingencyAmount,
    categories,
    unallocatedAmount
  };
}
