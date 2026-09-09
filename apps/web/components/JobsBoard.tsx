'use client';

import { card } from '@/lib/ui';
import { Catalogue } from './Catalogue';

const STEPS = [
  'Add a source to apps/scraper/src/sources/ that returns kind: "job"',
  'Point its fetch() at a job board API',
  'That is the whole change — resources, ranking and the API already carry kind',
];

const code = 'rounded bg-fill px-1.5 py-0.5 font-mono text-[12.5px]';

export function JobsBoard() {
  return (
    <Catalogue
      kind="job"
      heading="What role are you aiming for?"
      placeholder="Search roles"
      gridTitle="Open roles"
      empty={
        <div className={`${card} border border-line p-9`}>
          <h3 className="mb-2 text-[19px] font-bold">No roles in the catalogue yet</h3>
          <p className="max-w-[62ch] text-ink-faint">
            This page is live and querying <code className={code}>kind=job</code> — there is
            simply nothing to show. Courses and jobs share one table split by{' '}
            <code className={code}>kind</code>, so switching this on needs no migration.
          </p>
          <ol className="mt-4 list-decimal pl-5 text-sm text-ink-soft">
            {STEPS.map((s) => (
              <li key={s} className="mb-1.5">
                {s}
              </li>
            ))}
          </ol>
        </div>
      }
    />
  );
}
