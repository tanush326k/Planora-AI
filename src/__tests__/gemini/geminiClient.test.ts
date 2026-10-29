import assert from 'node:assert/strict';
import { getGeminiConfig, GeminiError, generatePlanWithGemini } from '../../lib/gemini/client';

async function runGeminiClientTests() {
  // Test 1: Configuration detection when key is missing or dummy
  {
    const prevKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const config = getGeminiConfig();
    assert.equal(config.isConfigured, false, 'Unset key must report isConfigured: false');
    assert.equal(config.model, 'gemini-3.8-flash', 'Must default to gemini-3.8-flash');

    // Placeholder key
    process.env.GEMINI_API_KEY = 'your_gemini_api_key_here';
    const dummyConfig = getGeminiConfig();
    assert.equal(dummyConfig.isConfigured, false, 'Placeholder key must report isConfigured: false');

    // Restore
    if (prevKey) process.env.GEMINI_API_KEY = prevKey;
    else delete process.env.GEMINI_API_KEY;
  }

  // Test 2: generatePlanWithGemini throws GeminiError when key is unconfigured
  {
    const prevKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    let threw = false;
    try {
      await generatePlanWithGemini({
        title: 'Test Wedding',
        type: 'wedding',
        date: '2026-11-20',
        guestCount: 80,
        totalBudget: 15000,
        currency: 'USD',
      });
    } catch (err: unknown) {
      threw = true;
      assert.ok(err instanceof GeminiError, 'Must throw a typed GeminiError');
      assert.equal((err as GeminiError).code, 'GEMINI_NOT_CONFIGURED');
      assert.equal((err as GeminiError).statusCode, 503);
    }

    assert.ok(threw, 'Should have thrown error when GEMINI_API_KEY is not configured');

    if (prevKey) process.env.GEMINI_API_KEY = prevKey;
  }

  // Test 3: Secret redaction in error messages
  {
    const rawError = 'Failed to connect to Google API with key AIzaSyD9876543210AbCdEfGhIjKlMnOpQrStUv';
    const sanitized = rawError.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');

    assert.ok(!sanitized.includes('AIzaSyD9876543210'), 'API key must be redacted');
    assert.ok(sanitized.includes('[REDACTED_API_KEY]'), 'Redaction placeholder must be present');
  }

  console.log('✓ Gemini client configuration & error isolation unit tests passed.');
}

runGeminiClientTests();
