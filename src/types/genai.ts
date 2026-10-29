/**
 * GatherWise AI — GenAI Contracts & Structured Output Schemas
 */

import { EventDetails } from './event';
import { EventBudgetPlan } from './budget';
import { EventTimelinePlan } from './timeline';
import { VendorChecklistPlan } from './vendor';

export interface PlanGenerationRequest {
  eventDetails: EventDetails;
  specialRequests?: string;
  vibeKeywords?: string[];
}

export interface PersonalizedIdea {
  title: string;
  category: 'decor' | 'entertainment' | 'food_beverage' | 'activity' | 'favor';
  description: string;
  estimatedCostImpact: 'low' | 'medium' | 'high';
  diyFriendly: boolean;
}

export interface GeneratedEventPlan {
  id: string;
  createdAt: string;
  eventDetails: EventDetails;
  executiveSummary: string;
  budgetPlan: EventBudgetPlan;
  timelinePlan: EventTimelinePlan;
  vendorPlan: VendorChecklistPlan;
  personalizedIdeas: PersonalizedIdea[];
}

export interface PlanRefinementRequest {
  planId: string;
  currentPlan: GeneratedEventPlan;
  userMessage: string;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface PlanRefinementResponse {
  message: string;
  updatedPlan?: Partial<GeneratedEventPlan>;
}
