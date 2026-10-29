import { NextResponse } from 'next/server';
import { getGeminiConfig } from '@/lib/gemini/client';

export async function GET() {
  const geminiConfig = getGeminiConfig();

  return NextResponse.json({
    status: 'ok',
    service: 'GatherWise AI API',
    timestamp: new Date().toISOString(),
    geminiConfigured: geminiConfig.isConfigured,
    model: geminiConfig.model,
    version: '0.1.0'
  });
}

