/**
 * extractJson: qwen3 reasoning routinely contains braces, so stripping <think> has to
 * happen before any brace scan.
 * Run: pnpm --filter @sih/qna test
 */
import assert from 'node:assert/strict';
import { extractJson } from './client.js';

const parse = (s: string) => JSON.parse(extractJson(s));

assert.deepEqual(parse('{"done":true}'), { done: true }, 'plain json');

assert.deepEqual(
  parse('<think>maybe {"done": false} or not</think>\n{"done":true}'),
  { done: true },
  'braces inside think must not be picked up',
);

assert.deepEqual(
  parse('<think>a</think>{"a":1}<think>b { }</think>'),
  { a: 1 },
  'trailing think block after the answer',
);

assert.deepEqual(parse('Sure:\n```json\n{"a":2}\n```'), { a: 2 }, 'fenced json');

assert.throws(() => extractJson('<think>no answer {</think>'), /no JSON object/, 'no object');

console.log('ok — client.test.ts');
