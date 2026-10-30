import { NextRequest, NextResponse } from 'next/server';
import { planGenerationInputSchema } from '@/lib/validation/planSchema';
import { generatePlanWithGemini, getGeminiConfig, GeminiError } from '@/lib/gemini/client';
import { generateDeterministicPlan } from '@/lib/planning/deterministicPlanner';
import { EventDetails } from '@/types/event';

export async function POST(req: NextRequest) {
  const MAX_PAYLOAD_BYTES = 50 * 1024; // 50 KB

  // 0. Fast-path check: Content-Length header if provided
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      {
        status: 'error',
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeds 50KB limit',
      },
      { status: 413 }
    );
  }

  // 1. Read request text to enforce ceiling against chunked / missing Content-Length headers
  let rawBodyText: string;
  try {
    rawBodyText = await req.text();
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        code: 'BAD_REQUEST',
        message: 'Failed to read request body',
      },
      { status: 400 }
    );
  }

  // Strict byte length inspection
  if (Buffer.byteLength(rawBodyText, 'utf8') > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      {
        status: 'error',
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeds 50KB limit',
      },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBodyText);
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        code: 'INVALID_JSON',
        message: 'Request body must be valid JSON',
      },
      { status: 400 }
    );
  }

  // 1. Server-side schema validation
  const validationResult = planGenerationInputSchema.safeParse(body);
  if (!validationResult.success) {
    const formattedErrors = validationResult.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return NextResponse.json(
      {
        status: 'error',
        code: 'VALIDATION_FAILED',
        message: 'Invalid plan generation parameters',
        errors: formattedErrors,
      },
      { status: 400 }
    );
  }

  const input = validationResult.data;

  // Extract explicit allowFallback flag (defaults to true for robust user experience)
  const allowFallback = (body as { allowFallback?: boolean })?.allowFallback !== false;

  const eventDetails: EventDetails = {
    title: input.title,
    type: input.type,
    date: input.date,
    guestCount: input.guestCount,
    totalBudget: input.totalBudget,
    currency: input.currency,
    location: input.location,
    themeOrStyle: input.themeOrStyle,
    notes: input.specialRequests,
  };

  const geminiConfig = getGeminiConfig();

  // 2. If Gemini is not configured
  if (!geminiConfig.isConfigured) {
    if (!allowFallback) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'GEMINI_NOT_CONFIGURED',
          message: 'Google Gemini API is not configured. Provide GEMINI_API_KEY in .env.local to enable live AI planning.',
        },
        { status: 503 }
      );
    }

    const fallbackPlan = generateDeterministicPlan(eventDetails, {
      specialRequests: input.specialRequests,
      vibeKeywords: input.vibeKeywords,
      reason: 'Gemini API key is not configured in .env.local. Generated via Planora AI deterministic baseline engine.',
    });

    return NextResponse.json(
      {
        status: 'success',
        plan: fallbackPlan,
        meta: {
          source: 'deterministic_fallback',
          isFallback: true,
          notice: 'This plan was generated using the deterministic planning engine because GEMINI_API_KEY is not configured.',
        },
      },
      {
        status: 200,
        headers: {
          'X-Plan-Source': 'deterministic_fallback',
        },
      }
    );
  }

  // 3. Attempt Gemini generation with structured output
  try {
    const aiPlan = await generatePlanWithGemini(eventDetails, {
      specialRequests: input.specialRequests,
      vibeKeywords: input.vibeKeywords,
    });

    return NextResponse.json(
      {
        status: 'success',
        plan: aiPlan,
        meta: {
          source: 'gemini',
          model: geminiConfig.model,
          isFallback: false,
        },
      },
      {
        status: 200,
        headers: {
          'X-Plan-Source': 'gemini',
          'X-Plan-Model': geminiConfig.model,
        },
      }
    );
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const safeLogMsg = rawMsg.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');
    console.error('Gemini plan generation error:', safeLogMsg);

    if (!allowFallback) {
      if (err instanceof GeminiError) {
        return NextResponse.json(
          {
            status: 'error',
            code: err.code,
            message: err.message,
          },
          { status: err.statusCode }
        );
      }

      return NextResponse.json(
        {
          status: 'error',
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during plan generation.',
        },
        { status: 500 }
      );
    }

    // Graceful fallback with sanitized user-facing attribution
    let safeErrorNotice = 'External AI service temporarily unavailable';
    if (err instanceof GeminiError) {
      if (err.code === 'TIMEOUT') {
        safeErrorNotice = 'AI generation request timed out after 25s';
      } else if (err.code === 'RATE_LIMIT_EXCEEDED') {
        safeErrorNotice = 'AI capacity rate limit reached';
      } else if (err.message.includes('503') || err.message.toLowerCase().includes('high demand') || err.message.toLowerCase().includes('unavailable')) {
        safeErrorNotice = 'AI service temporarily experiencing high demand';
      } else {
        safeErrorNotice = err.message.replace(/\{"error":\{.*\}\}/, 'service unavailable');
      }
    }
    const fallbackPlan = generateDeterministicPlan(eventDetails, {
      specialRequests: input.specialRequests,
      vibeKeywords: input.vibeKeywords,
      reason: `Gemini service encounter: ${safeErrorNotice}. Generated via Planora AI deterministic baseline engine.`,
    });

    return NextResponse.json(
      {
        status: 'success',
        plan: fallbackPlan,
        meta: {
          source: 'deterministic_fallback',
          isFallback: true,
          notice: `AI generation encountered an issue (${safeErrorNotice}). High-accuracy deterministic fallback provided.`,
        },
      },
      {
        status: 200,
        headers: {
          'X-Plan-Source': 'deterministic_fallback',
        },
      }
    );
  }
}

