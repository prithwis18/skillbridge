import OpenAI from 'openai';
import type { z } from 'zod';
import { log } from '@sih/shared';
import { config } from '../config.js';

const client = new OpenAI({ apiKey: config.llm.apiKey, baseURL: config.llm.baseUrl });

async function complete(system: string, user: string): Promise<unknown> {
  const res = await client.chat.completions.create({
    model: config.llm.model,
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return JSON.parse(extractJson(res.choices[0]?.message?.content ?? ''));
}

/**
 * Reasoning models (qwen3) prefix the answer with <think>…</think>, and that reasoning
 * routinely contains braces — drafts of the very JSON being written. So strip the think
 * blocks first; slicing to the first '{' without that lands inside the reasoning.
 */
export function extractJson(raw: string): string {
  const text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end < start) throw new Error('no JSON object in model response');
  return text.slice(start, end + 1);
}

/** One retry — JSON mode still returns a stray shape occasionally. */
export async function completeJson<T>(
  // Input side unknown: .default() makes input and output types differ.
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  system: string,
  user: string,
): Promise<T> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return schema.parse(await complete(system, user));
    } catch (err) {
      log.warn({ attempt, err }, 'llm response invalid');
      if (attempt === 2) throw err;
    }
  }
  throw new Error('unreachable');
}
