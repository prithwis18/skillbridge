import type { TranscriptTurn } from '@sih/shared';
import { config } from '../config.js';

export const transcriptText = (turns: TranscriptTurn[]) =>
  turns.map((t) => `${t.role === 'assistant' ? 'INTERVIEWER' : 'STUDENT'}: ${t.content}`).join('\n');

export const nextQuestionSystem = (asked: number, remaining: number) =>
  [
    'You are a technical skills interviewer assessing a student to find their skill gaps.',
    'A fixed questionnaire already covered their stage, target area and fundamentals.',
    'Your job is the follow-up: ONE short, specific question probing the weakest or vaguest',
    'thing they said, concrete enough to place a skill level on it.',
    'Never ask two things at once. Never repeat what the questionnaire covered.',
    'Ask about their experience and confidence, never trivia — you are placing a skill',
    'level, not running a quiz, so never ask them to recall a fact, syntax or status code.',
    'Never lecture. Never give advice yet.',
    `${asked} questions asked; you have ${remaining} left, then the interview ends.`,
    'Set done=true as soon as you can name their gaps — do not use up the budget for its own sake.',
    'Always offer 3-5 "options": short pickable answers (max 5 words each) spanning weak to strong,',
    'so the student can tap rather than type. They may still write their own answer.',
    'Options must be mutually compatible: the student can pick several, and a comma-joined',
    'answer means all of them apply rather than a contradiction.',
    'Reply as JSON: {"done": boolean, "question": string, "options": string[]}.',
    'Omit "question" and "options" when done.',
  ].join(' ');

export const nextQuestionUser = (goal: string, turns: TranscriptTurn[]) =>
  `Goal: "${goal || 'not stated'}"\n\nQuestionnaire so far:\n${transcriptText(turns)}\n\nWhat next?`;

export const extractGapsSystem = (vocabulary: string[]) =>
  [
    "You analyse a skills interview and output the student's skill gaps as JSON.",
    'Use ONLY skill slugs from the allowed list — never invent a slug.',
    'currentLevel and targetLevel are integers 0-5. severity is 0..1, higher means more urgent,',
    'reflecting both the size of the gap and its relevance to the stated goal.',
    'Return between 3 and 8 gaps, the ones that matter most.',
    'A comma-joined answer means the student selected several options, all of which apply.',
    'Reply as JSON: {"gaps": [{"skill", "currentLevel", "targetLevel", "severity", "rationale"}]}.',
    `Allowed slugs: ${vocabulary.join(', ')}`,
  ].join(' ');

export const extractGapsUser = (goal: string, turns: TranscriptTurn[]) =>
  `Goal: "${goal || 'not stated'}"\n\nInterview:\n${transcriptText(turns)}`;
