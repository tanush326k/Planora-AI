/**
 * GatherWise AI — Core Event Planning Types
 */

export type EventType = 'wedding' | 'birthday' | 'community';

export interface EventDetails {
  title: string;
  type: EventType;
  date: string; // ISO date string YYYY-MM-DD
  guestCount: number;
  totalBudget: number;
  currency: string;
  location?: string;
  themeOrStyle?: string;
  notes?: string;
}

export interface EventCategoryInfo {
  id: EventType;
  title: string;
  tagline: string;
  description: string;
  typicalLeadTimeMonths: number;
  keyPriorities: string[];
  suggestedBudgetCategories: string[];
}

