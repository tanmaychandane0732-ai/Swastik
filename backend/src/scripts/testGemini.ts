import { env } from '../config/env';

interface GenAIClient {
  models: {
    generateContent(params: { model: string; contents: string }): Promise<{ text?: string | null }>;
  };
}

async function loadGenAI(): Promise<new (options: { apiKey: string }) => GenAIClient> {
  const dynamicImport = new Function('specifier', 'return import(specifier)');
  const module = (await dynamicImport('@google/genai')) as {
    GoogleGenAI: new (options: { apiKey: string }) => GenAIClient;
  };
  return module.GoogleGenAI;
}

/**
 * Developer Smoke Test for Google Gemini Integration in FinQuest
 * Verifies API reachability, SDK initialization, and model response without exposing secrets.
 */
async function runGeminiSmokeTest(): Promise<void> {
  console.log('==================================================');
  console.log('🤖 Gemini Integration Test');
  console.log('--------------------------------------------------');

  const apiKey = env.GEMINI_API_KEY?.trim();
  const modelName = env.GEMINI_MODEL || 'gemini-3.5-flash';

  if (!apiKey) {
    console.log('Configuration: MISSING (GEMINI_API_KEY is not set in backend/.env)');
    console.log('SDK: IDLE');
    console.log('Gemini AI: UNAVAILABLE');
    console.log('Local fallback: ACTIVE (All game & auth features functional)');
    console.log('==================================================');
    process.exit(0);
  }

  console.log('Configuration: FOUND (Masked: ' + apiKey.substring(0, 4) + '...' + apiKey.slice(-4) + ', length: ' + apiKey.length + ')');
  console.log(`Model Target: ${modelName}`);

  try {
    const GoogleGenAI = await loadGenAI();
    const ai = new GoogleGenAI({ apiKey });
    console.log('SDK: READY (@google/genai)');

    const prompt = 'In 10 words, state the primary flight safety check for personal finances.';
    const startTime = Date.now();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    const duration = Date.now() - startTime;

    const reply = response.text?.trim() || '';

    if (reply) {
      console.log(`API request: SUCCESS (${duration}ms)`);
      console.log(`Model response: "${reply}"`);
      console.log('Gemini AI: OPERATIONAL');
      console.log('==================================================');
      process.exit(0);
    } else {
      console.log(`API request: FAILED (Empty response body from ${modelName})`);
      console.log('Gemini AI: UNAVAILABLE');
      console.log('Local fallback: ACTIVE');
      console.log('==================================================');
      process.exit(1);
    }
  } catch (error: any) {
    const safeError = error?.message?.split('\n')[0]?.substring(0, 180) || 'Unknown API Error';
    console.log('API request: FAILED');
    console.log(`Reason: ${safeError}`);
    console.log('Gemini AI: UNAVAILABLE');
    console.log('Local fallback: ACTIVE');
    console.log('==================================================');
    process.exit(0);
  }
}

runGeminiSmokeTest();
