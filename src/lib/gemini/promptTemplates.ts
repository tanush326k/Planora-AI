import { EventDetails } from '@/types/event';

/**
 * Constructs a structured prompt instructing Gemini to return a comprehensive,
 * strictly formatted JSON payload for the event plan.
 */
export function buildEventPlanPrompt(details: EventDetails, specialRequests?: string): string {
  return `You are GatherWise AI, an expert event planner specializing in ${details.type}s.
Create a detailed, date-aware, and budget-conscious plan for the following event:

Event Title: ${details.title}
Event Type: ${details.type}
Event Date: ${details.date}
Guest Count: ${details.guestCount}
Total Budget: ${details.totalBudget} ${details.currency}
Location: ${details.location || 'Not specified'}
Theme / Style: ${details.themeOrStyle || 'Classic & Joyful'}
${specialRequests ? `Special Requests: ${specialRequests}` : ''}

Respond ONLY with valid, raw JSON conforming to this schema (no markdown fences, no explanatory text outside the JSON):
{
  "executiveSummary": "A 2-3 sentence inspiring summary of the event vision and logistical strategy.",
  "personalizedIdeas": [
    {
      "title": "Creative theme or entertainment concept",
      "category": "decor | entertainment | food_beverage | activity | favor",
      "description": "Concrete explanation of how to execute this idea",
      "estimatedCostImpact": "low | medium | high",
      "diyFriendly": true
    }
  ],
  "vendorRecommendations": [
    {
      "category": "e.g. Venue, Catering, Photography",
      "title": "Vendor role to hire",
      "bookingWindow": "e.g. 6-9 months before",
      "keyQuestionsToAsk": ["Question 1", "Question 2"],
      "estimatedCostMin": 1000,
      "estimatedCostMax": 2500
    }
  ],
  "milestones": [
    {
      "title": "Actionable task",
      "description": "Specific deliverable",
      "daysBeforeEvent": 180,
      "priority": "critical | high | medium | low",
      "category": "Logistics | Creative | Vendors"
    }
  ]
}`;
}

