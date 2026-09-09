import { z } from 'zod';
import { SkillGap, type TranscriptTurn } from '@sih/shared';
import { completeJson } from './client.js';
import { skillVocabulary } from '../services/vocabulary.js';
import {
  extractGapsSystem, extractGapsUser, nextQuestionSystem, nextQuestionUser,
} from './prompts.js';

const NextQuestion = z.object({
  done: z.boolean(),
  question: z.string().min(1).max(400).optional(),
  options: z.array(z.string().min(1).max(60)).max(6).default([]),
});
type NextQuestion = z.infer<typeof NextQuestion>;

const GapsResponse = z.object({ gaps: z.array(SkillGap).min(1).max(20) });

export async function nextQuestion(
  goal: string,
  turns: TranscriptTurn[],
  remaining: number,
): Promise<NextQuestion> {
  const asked = turns.filter((t) => t.role === 'assistant').length;
  const out = await completeJson(
    NextQuestion,
    nextQuestionSystem(asked, remaining),
    nextQuestionUser(goal, turns),
  );
  // done=false with no question means it has nothing left to ask.
  return !out.done && !out.question ? { done: true, options: [] } : out;
}

export async function extractGaps(goal: string, turns: TranscriptTurn[]): Promise<SkillGap[]> {
  const vocabulary = await skillVocabulary();
  const out = await completeJson(
    GapsResponse,
    extractGapsSystem(vocabulary),
    extractGapsUser(goal, turns),
  );

  const allowed = new Set(vocabulary);
  const kept = vocabulary.length > 0 ? out.gaps.filter((g) => allowed.has(g.skill)) : out.gaps;
  if (kept.length === 0) throw new Error('no gaps matched the known skill vocabulary');
  return kept;
}
