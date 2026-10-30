/**
 * Planora AI — Server-Side Google GenAI Client
 *
 * Implements Google GenAI SDK integration using @google/genai.
 * Secrets are strictly isolated server-side.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { EventDetails } from '@/types/event';
import { GeneratedEventPlan, PersonalizedIdea, ThemeConcept } from '@/types/genai';
import { calculateBaselineBudget } from '../planning/budgetCalculator';
import { calculateDaysRemaining, computeMilestoneTargetDate } from '../planning/dateUtils';
import { buildEventPlanPrompt } from './promptTemplates';
import { EventTimelinePhase, TimelineMilestone } from '@/types/timeline';
import { VendorChecklistItem } from '@/types/vendor';

export interface GeminiConfig {
  apiKey?: string;
  model: string;
  isConfigured: boolean;
}

export function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  // Target documented stable model ID, configurable via GEMINI_MODEL
  // Valid IDs (Google GenAI API, 2025): gemini-2.5-flash, gemini-2.0-flash, gemini-2.5-flash-lite
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

  const isConfigured = Boolean(
    apiKey &&
    apiKey.length > 10 &&
    !apiKey.includes('your_') &&
    !apiKey.includes('placeholder')
  );

  return {
    apiKey: isConfigured ? apiKey : undefined,
    model,
    isConfigured,
  };
}

export class GeminiError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, code = 'GEMINI_ERROR', statusCode = 500) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Gemini Response Structured Output Schema definition
 */
const geminiPlanSchema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: {
      type: Type.STRING,
      description: 'A 2-3 sentence inspiring executive summary and strategic vision for this event.',
    },
    themeConcept: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        colorPalette: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3-5 hex color codes representing the visual theme.',
        },
      },
      required: ['name', 'description', 'colorPalette'],
    },
    personalizedIdeas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: {
            type: Type.STRING,
            description: 'decor | entertainment | food_beverage | activity | favor',
          },
          description: { type: Type.STRING },
          estimatedCostImpact: {
            type: Type.STRING,
            description: 'low | medium | high',
          },
          diyFriendly: { type: Type.BOOLEAN },
        },
        required: ['title', 'category', 'description', 'estimatedCostImpact', 'diyFriendly'],
      },
    },
    vendorRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          bookingWindow: { type: Type.STRING },
          keyQuestionsToAsk: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['category', 'title', 'bookingWindow', 'keyQuestionsToAsk'],
      },
    },
    keyMilestoneSuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          daysBeforeEvent: { type: Type.INTEGER },
          priority: {
            type: Type.STRING,
            description: 'critical | high | medium | low',
          },
          category: { type: Type.STRING },
        },
        required: ['title', 'description', 'daysBeforeEvent', 'priority', 'category'],
      },
    },
    assumptionsAndRecommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Practical logistical advice, local considerations, and missing information assumptions.',
    },
  },
  required: [
    'executiveSummary',
    'themeConcept',
    'personalizedIdeas',
    'vendorRecommendations',
    'keyMilestoneSuggestions',
    'assumptionsAndRecommendations',
  ],
};

interface RawGeminiOutput {
  executiveSummary: string;
  themeConcept: {
    name: string;
    description: string;
    colorPalette: string[];
  };
  personalizedIdeas: Array<{
    title: string;
    category: 'decor' | 'entertainment' | 'food_beverage' | 'activity' | 'favor';
    description: string;
    estimatedCostImpact: 'low' | 'medium' | 'high';
    diyFriendly: boolean;
  }>;
  vendorRecommendations: Array<{
    category: string;
    title: string;
    bookingWindow: string;
    keyQuestionsToAsk: string[];
  }>;
  keyMilestoneSuggestions: Array<{
    title: string;
    description: string;
    daysBeforeEvent: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
  }>;
  assumptionsAndRecommendations: string[];
}

/**
 * Invokes Google Gemini with structured output, then deterministically reconciles
 * the budget, timeline, and vendor costs with application arithmetic.
 */
export async function generatePlanWithGemini(
  details: EventDetails,
  options?: {
    specialRequests?: string;
    vibeKeywords?: string[];
  }
): Promise<GeneratedEventPlan> {
  const config = getGeminiConfig();

  if (!config.isConfigured || !config.apiKey) {
    throw new GeminiError(
      'Gemini API key is not configured. Please supply GEMINI_API_KEY in .env.local.',
      'GEMINI_NOT_CONFIGURED',
      503
    );
  }

  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const daysRemaining = calculateDaysRemaining(details.date);

  const prompt = buildEventPlanPrompt(details, {
    specialRequests: options?.specialRequests,
    vibeKeywords: options?.vibeKeywords,
    daysRemaining,
  });

  let responseText: string | undefined;

  try {
    const GEMINI_TIMEOUT_MS = 25000;
    const abortController = new AbortController();
    let timerId: NodeJS.Timeout | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(() => {
        abortController.abort();
        reject(
          new GeminiError(
            'Gemini request timed out after 25 seconds.',
            'TIMEOUT',
            504
          )
        );
      }, GEMINI_TIMEOUT_MS);
    });

    const generatePromise = ai.models.generateContent({
      model: config.model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: geminiPlanSchema,
        abortSignal: abortController.signal,
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    if (timerId) clearTimeout(timerId);

    responseText = response.text;
  } catch (err: unknown) {
    if (err instanceof GeminiError) {
      throw err;
    }

    const errorMsg = err instanceof Error ? err.message : String(err);

    // Sanitize any potential secrets from error message
    const sanitizedMsg = errorMsg.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');

    if (sanitizedMsg.includes('429') || sanitizedMsg.toLowerCase().includes('quota') || sanitizedMsg.toLowerCase().includes('rate limit')) {
      throw new GeminiError(
        'Gemini rate limit or quota exceeded. Please try again shortly.',
        'RATE_LIMIT_EXCEEDED',
        429
      );
    }

    if (sanitizedMsg.includes('504') || sanitizedMsg.toLowerCase().includes('timeout') || sanitizedMsg.toLowerCase().includes('deadline')) {
      throw new GeminiError(
        'Gemini request timed out. Please try again shortly.',
        'TIMEOUT',
        504
      );
    }

    if (sanitizedMsg.toLowerCase().includes('api key') || sanitizedMsg.includes('403') || sanitizedMsg.includes('401')) {
      throw new GeminiError(
        'Gemini authorization failed. Please check the validity of your GEMINI_API_KEY.',
        'AUTHENTICATION_FAILED',
        401
      );
    }

    throw new GeminiError(
      `Gemini service error: ${sanitizedMsg}`,
      'GEMINI_CALL_FAILED',
      502
    );
  }

  if (!responseText) {
    throw new GeminiError(
      'Gemini returned an empty response.',
      'EMPTY_RESPONSE',
      502
    );
  }

  let parsed: RawGeminiOutput;
  try {
    parsed = JSON.parse(responseText) as RawGeminiOutput;
  } catch {
    throw new GeminiError(
      'Failed to parse structured JSON response from Gemini.',
      'MALFORMED_OUTPUT',
      502
    );
  }

  // -------------------------------------------------------------------------
  // DETERMINISTIC RECONCILIATION LAYER
  // Financial math, budget ceilings, and timeline dates are computed in code.
  // -------------------------------------------------------------------------

  // 1. Deterministic budget
  const budgetPlan = calculateBaselineBudget(details.totalBudget, details.type, details.currency);

  // 2. Deterministic timeline with backward milestone mapping
  const timelinePhases = reconcileTimelinePhases(details, daysRemaining, parsed.keyMilestoneSuggestions);

  // 3. Reconcile vendor checklist with budget allocations
  const vendorPlan = reconcileVendorChecklist(details, parsed.vendorRecommendations);

  // 4. Safe ideas extraction
  const personalizedIdeas: PersonalizedIdea[] = (parsed.personalizedIdeas || []).map((idea) => ({
    title: idea.title || 'Creative Idea',
    category: ['decor', 'entertainment', 'food_beverage', 'activity', 'favor'].includes(idea.category)
      ? idea.category
      : 'decor',
    description: idea.description || '',
    estimatedCostImpact: ['low', 'medium', 'high'].includes(idea.estimatedCostImpact)
      ? idea.estimatedCostImpact
      : 'medium',
    diyFriendly: Boolean(idea.diyFriendly),
  }));

  const themeConcept: ThemeConcept = {
    name: parsed.themeConcept?.name || details.themeOrStyle || 'Celebration Essence',
    description: parsed.themeConcept?.description || 'A tailored visual and experiential concept.',
    colorPalette: Array.isArray(parsed.themeConcept?.colorPalette) && parsed.themeConcept.colorPalette.length > 0
      ? parsed.themeConcept.colorPalette
      : ['#FAF6F0', '#D4AF37', '#2C3E50'],
  };

  const assumptions = [
    `Budget is treated as a hard ceiling (${new Intl.NumberFormat('en-US', { style: 'currency', currency: details.currency, maximumFractionDigits: 0 }).format(details.totalBudget)}) with deterministic allocation.`,
    ...(parsed.assumptionsAndRecommendations || []),
  ];

  return {
    id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    createdAt: new Date().toISOString(),
    eventDetails: details,
    executiveSummary: parsed.executiveSummary,
    themeConcept,
    budgetPlan,
    timelinePlan: {
      eventDate: details.date,
      daysRemaining,
      phases: timelinePhases,
    },
    vendorPlan,
    personalizedIdeas,
    assumptionsAndRecommendations: assumptions,
    source: 'gemini',
    modelUsed: config.model,
    isFallback: false,
    generationNotes: `Successfully generated using Google GenAI (${config.model}) with structured validation.`,
  };
}

function reconcileTimelinePhases(
  details: EventDetails,
  daysRemaining: number,
  suggestions?: RawGeminiOutput['keyMilestoneSuggestions']
): EventTimelinePhase[] {
  const totalDays = Math.max(daysRemaining, 14);

  // Phase 1: Planning Foundation
  // Phase 2: Key Bookings & Creative
  // Phase 3: Final Details & RSVP Lock
  // Phase 4: Event Week & Day-of

  const milestones: TimelineMilestone[] = (suggestions || []).map((s, idx) => {
    const daysBefore = Math.max(1, Math.min(s.daysBeforeEvent || 30, totalDays));
    const targetDate = computeMilestoneTargetDate(details.date, daysBefore);

    return {
      id: `ms-gemini-${idx + 1}`,
      title: s.title,
      description: s.description,
      daysBeforeEvent: daysBefore,
      targetDate,
      completed: false,
      priority: ['critical', 'high', 'medium', 'low'].includes(s.priority) ? s.priority : 'medium',
      category: s.category || 'General',
    };
  });

  // If Gemini provided fewer than 3 milestones, supplement with standard ones
  if (milestones.length < 3) {
    const daysBeforeVenue = Math.max(1, Math.round(totalDays * 0.75));
    milestones.push({
      id: 'ms-auto-1',
      title: 'Secure Primary Venue & Date',
      description: 'Execute contract and pay deposit.',
      daysBeforeEvent: daysBeforeVenue,
      targetDate: computeMilestoneTargetDate(details.date, daysBeforeVenue),
      completed: false,
      priority: 'critical',
      category: 'Venue',
    });

    const daysBeforeCatering = Math.max(1, Math.round(totalDays * 0.5));
    milestones.push({
      id: 'ms-auto-2',
      title: 'Finalize Catering & Guest RSVP',
      description: 'Lock headcount and dietary requirements.',
      daysBeforeEvent: daysBeforeCatering,
      targetDate: computeMilestoneTargetDate(details.date, daysBeforeCatering),
      completed: false,
      priority: 'high',
      category: 'Catering',
    });
  }

  // Sort milestones chronologically (most days before first)
  milestones.sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent);

  // Group into 3-4 phased brackets
  const phase1Tasks = milestones.filter((m) => m.daysBeforeEvent >= totalDays * 0.6);
  const phase2Tasks = milestones.filter((m) => m.daysBeforeEvent < totalDays * 0.6 && m.daysBeforeEvent >= totalDays * 0.25);
  const phase3Tasks = milestones.filter((m) => m.daysBeforeEvent < totalDays * 0.25);

  const phases: EventTimelinePhase[] = [];

  if (phase1Tasks.length > 0) {
    phases.push({
      phaseName: 'Phase 1: Foundation & Major Contracts',
      timeframeDescription: `Initial planning window (${Math.round(totalDays * 0.6)}+ days out)`,
      milestones: phase1Tasks,
    });
  }

  if (phase2Tasks.length > 0) {
    phases.push({
      phaseName: 'Phase 2: Coordination & Experience Design',
      timeframeDescription: `Mid-stage execution (${Math.round(totalDays * 0.25)}–${Math.round(totalDays * 0.6)} days out)`,
      milestones: phase2Tasks,
    });
  }

  if (phase3Tasks.length > 0) {
    phases.push({
      phaseName: 'Phase 3: Final Countdown & Logistics',
      timeframeDescription: `Final stretch (under ${Math.round(totalDays * 0.25)} days out)`,
      milestones: phase3Tasks,
    });
  }

  // Fallback single phase if grouping produced empty buckets
  if (phases.length === 0) {
    phases.push({
      phaseName: 'Action Timeline',
      timeframeDescription: `Milestones leading up to ${details.date}`,
      milestones,
    });
  }

  return phases;
}

function reconcileVendorChecklist(
  details: EventDetails,
  recommendations?: RawGeminiOutput['vendorRecommendations']
): { totalVendors: number; bookedCount: number; items: VendorChecklistItem[] } {
  const budget = details.totalBudget;

  const defaultVendors: Array<{
    category: string;
    title: string;
    bookingWindow: string;
    keyQuestionsToAsk?: string[];
    minFrac: number;
    maxFrac: number;
  }> = [
      { category: 'Venue', title: 'Reception & Ceremony Hall', bookingWindow: '6-9 months before', minFrac: 0.25, maxFrac: 0.4 },
      { category: 'Catering', title: 'Food & Beverage Partner', bookingWindow: '4-6 months before', minFrac: 0.2, maxFrac: 0.3 },
      { category: 'Media', title: 'Photographer / Videographer', bookingWindow: '3-6 months before', minFrac: 0.08, maxFrac: 0.15 },
      { category: 'Entertainment', title: 'DJ / Sound Engineering', bookingWindow: '2-4 months before', minFrac: 0.05, maxFrac: 0.1 },
      { category: 'Decor', title: 'Florals & Equipment Rentals', bookingWindow: '2-3 months before', minFrac: 0.05, maxFrac: 0.1 },
    ];

  const items: VendorChecklistItem[] = (recommendations && recommendations.length > 0 ? recommendations : defaultVendors).map(
    (rec, idx) => {
      const minCost = Math.round(budget * (0.05 + idx * 0.03));
      const maxCost = Math.round(budget * (0.1 + idx * 0.04));

      return {
        id: `vendor-gemini-${idx + 1}`,
        category: rec.category || 'General Vendor',
        title: rec.title || 'Event Professional',
        bookingWindow: rec.bookingWindow || '3-6 months before',
        estimatedCostRange: {
          min: Math.min(minCost, Math.round(budget * 0.35)),
          max: Math.min(maxCost, Math.round(budget * 0.45)),
        },
        keyQuestionsToAsk:
          'keyQuestionsToAsk' in rec && Array.isArray(rec.keyQuestionsToAsk) && rec.keyQuestionsToAsk.length > 0
            ? rec.keyQuestionsToAsk
            : [
              'What is your cancellation/deposit refund policy?',
              'Are there any overtime or hidden fees not in the quote?',
            ],
        status: 'not_started',
        notes: 'Planning estimate. Confirm with actual quotes.',
      };
    }
  );

  return {
    totalVendors: items.length,
    bookedCount: 0,
    items,
  };
}
