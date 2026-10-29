/**
 * Planora AI — Budget Engine Types
 */

export interface BudgetCategoryAllocation {
  id: string;
  name: string;
  recommendedPercentage: number;
  allocatedAmount: number;
  spentAmount: number;
  items: BudgetItem[];
  description: string;
}

export interface BudgetItem {
  id: string;
  name: string;
  estimatedCost: number;
  actualCost?: number;
  isPaid?: boolean;
  notes?: string;
}

export interface EventBudgetPlan {
  totalBudget: number;
  currency: string;
  contingencyReserve: number; // typically 5-10% of total
  categories: BudgetCategoryAllocation[];
  unallocatedAmount: number;
}

