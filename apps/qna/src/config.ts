import { env, envInt } from '@sih/shared';

export const config = {
  port: envInt('PORT', 3004),
  hubUrl: env('HUB_URL', 'http://localhost:3001'),
  /** Total questions: the fixed seed set plus adaptive follow-ups. */
  maxQuestions: envInt('MAX_QUESTIONS', 5),
  llm: {
    apiKey: env('LLM_API_KEY', 'missing'),
    // OpenAI-compatible: swapping providers is a base-URL change.
    baseUrl: env('LLM_BASE_URL', 'https://api.groq.com/openai/v1'),
    model: env('LLM_MODEL', 'qwen/qwen3.8-27b'),
  },
};
