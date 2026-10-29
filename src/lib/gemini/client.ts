/**
 * GatherWise AI — Google GenAI Server Integration
 *
 * This module encapsulates server-side communication with Google Gemini.
 * The API key is accessed strictly through process.env.GEMINI_API_KEY.
 *
 * Note: Full runtime integration with @google/genai SDK is enabled in Phase 3.
 */

export interface GeminiConfig {
  apiKey?: string;
  model: string;
  isConfigured: boolean;
}

export function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  return {
    apiKey,
    model,
    isConfigured: Boolean(apiKey && apiKey.length > 10 && !apiKey.includes('your_'))
  };
}

export class GeminiServiceUnavailableError extends Error {
  constructor(message = 'Gemini API key is not configured. Please supply GEMINI_API_KEY in .env.local.') {
    super(message);
    this.name = 'GeminiServiceUnavailableError';
  }
}
