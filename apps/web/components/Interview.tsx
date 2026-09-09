'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { sendAnswer, startSession, streamUrl } from '@/lib/api';
import { fadeUp, SPRING } from '@/lib/motion';
import { btnGhost, btnPrimary, card, h1, h2, input, label, lede } from '@/lib/ui';
import type { RecommendationPayload, SessionView } from '@/lib/types';
import { ChipGroup } from './ChipGroup';
import { GapList } from './GapList';
import { Progress } from './Progress';
import { Recommendations } from './Recommendations';

const GOALS = [
  'Backend internship',
  'Frontend developer role',
  'Crack DSA interviews',
  'Move into ML',
];

const PANEL = `${card} p-8 pb-6`;

export function Interview() {
  const [session, setSession] = useState<SessionView | null>(null);
  const [goal, setGoal] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationPayload | null>(null);

  // Recommendations arrive asynchronously once the hub has resolved the gaps.
  useEffect(() => {
    if (!session) return;
    const es = new EventSource(streamUrl(session.sessionId));
    es.addEventListener('recommendations', (e) => {
      setResult(JSON.parse((e as MessageEvent).data) as RecommendationPayload);
      setSession((s) => (s ? { ...s, status: 'done' } : s));
    });
    es.onerror = () => es.close();
    return () => es.close();
  }, [session?.sessionId]);

  function apply(view: SessionView) {
    setSession(view);
    setPicked([]);
    setTyped('');
    setError(view.error ?? null);
  }

  async function run(fn: () => Promise<SessionView>) {
    setBusy(true);
    setError(null);
    try {
      apply(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  const reset = () => {
    setSession(null);
    setResult(null);
    setGoal('');
    setPicked([]);
    setTyped('');
    setError(null);
  };

  const toggleMulti = (v: string) =>
    setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));
  const toggleSingle = (v: string) => setPicked((p) => (p[0] === v ? [] : [v]));

  // Several picks become one comma-joined answer; typed detail is appended, never dropped.
  const answer = [picked.join(', '), typed.trim()].filter(Boolean).join(' — ');
  const goalValue = () => goal.trim() || picked[0] || '';

  const start = () => {
    const g = goalValue();
    if (g && !busy) void run(() => startSession(g));
  };
  const next = () => {
    if (session && answer && !busy) void run(() => sendAnswer(session.sessionId, answer));
  };

  // Only the results view goes two-column; the questionnaire stays a single focused card.
  const results = Boolean(session && session.status !== 'asking');

  return (
    <motion.div className={results ? '' : 'mx-auto max-w-[600px]'} layout transition={SPRING}>
      <AnimatePresence mode="wait" initial={false}>
        {!session ? (
          <motion.div key="goal" className={PANEL} {...fadeUp} transition={SPRING}>
            <Progress step={0} total={4} />
            <h1 className={h1}>What are you working towards?</h1>
            <p className={lede}>
              Tell us the goal you are aiming at. A short interview follows, then courses
              matched to whatever it turns up.
            </p>

            <div className={label}>Common goals:</div>
            <ChipGroup options={GOALS} selected={picked} onToggle={toggleSingle} />

            <div className="mb-[22px]">
              <div className={label}>Your goal:</div>
              <input
                className={input}
                autoFocus
                value={goal}
                placeholder="e.g. land a backend internship in 6 months"
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && start()}
              />
            </div>

            {error && <p className="mt-3.5 text-[13.5px] text-red-600">{error}</p>}

            <div className="mt-7 flex justify-end gap-3">
              <button className={btnPrimary} onClick={start} disabled={busy || !goalValue()}>
                {busy ? 'Starting…' : 'Start'}
              </button>
            </div>
          </motion.div>
        ) : session.status === 'asking' ? (
          <motion.div key={`q${session.questionCount}`} className={PANEL} {...fadeUp} transition={SPRING}>
            <Progress step={session.questionCount} total={session.totalSteps} />
            <h1 className={h1}>{session.question}</h1>
            <p className={lede}>
              Pick every answer that applies, or write your own — both feed the same analysis.
            </p>

            <ChipGroup options={session.options} selected={picked} onToggle={toggleMulti} multi />

            <div className="mb-[22px]">
              <div className={label}>Anything to add:</div>
              <input
                className={input}
                value={typed}
                placeholder="Optional — your answer in your own words"
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && next()}
              />
            </div>

            {error && <p className="mt-3.5 text-[13.5px] text-red-600">{error}</p>}

            <div className="mt-7 flex justify-end gap-3">
              <button className={btnGhost} onClick={reset} disabled={busy}>
                Start over
              </button>
              <button className={btnPrimary} onClick={next} disabled={busy || !answer}>
                {busy ? 'Thinking…' : 'Next'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            className="grid items-start gap-[18px] lg:grid-cols-2"
            {...fadeUp}
            transition={SPRING}
          >
            <div className={PANEL}>
              <Progress step={session.totalSteps} total={session.totalSteps} />
              <h1 className={`${h1} text-[27px]`}>Here is what to close</h1>
              <p className={lede}>
                {result
                  ? `${result.gaps.length} gaps, ranked by how much they hold the goal back.`
                  : 'Reading your answers…'}
              </p>

              {session.gaps.length > 0 && <GapList gaps={result?.gaps ?? session.gaps} />}

              {session.status === 'failed' && (
                <p className="mt-3.5 text-[13.5px] text-red-600">
                  {session.error ?? 'The interview could not be analysed.'}
                </p>
              )}

              <div className="mt-7 flex justify-end gap-3">
                <button className={btnGhost} onClick={reset}>
                  Start over
                </button>
              </div>
            </div>

            {/* No panel here: the cards are the surface, sitting straight on the ground. */}
            <div className="pt-2">
              <h2 className={h2}>
                Recommended courses{' '}
                {result && (
                  <span className="text-[13px] font-medium text-ink-faint">
                    {result.recommendations.length}
                    {result.cached ? ' · cached' : ''}
                  </span>
                )}
              </h2>
              <p className={lede}>Best match first — ranked by gap severity and coverage.</p>

              {result ? (
                <Recommendations payload={result} />
              ) : (
                <div className="flex items-center gap-3 text-[14.5px] text-ink-soft">
                  <motion.span
                    className="size-[18px] rounded-full border-2 border-line border-t-check"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                  />
                  Matching courses to your gaps…
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
