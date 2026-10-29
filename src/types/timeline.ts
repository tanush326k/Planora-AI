/**
 * GatherWise AI — Date-Aware Timeline Types
 */

export type TimelinePriority = 'critical' | 'high' | 'medium' | 'low';

export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  daysBeforeEvent: number;
  targetDate?: string;
  completed: boolean;
  priority: TimelinePriority;
  category: string;
}

export interface EventTimelinePhase {
  phaseName: string;
  timeframeDescription: string;
  milestones: TimelineMilestone[];
}

export interface EventTimelinePlan {
  eventDate: string;
  daysRemaining: number;
  phases: EventTimelinePhase[];
}
