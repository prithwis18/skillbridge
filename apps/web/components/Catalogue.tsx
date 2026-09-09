'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { fetchResources, fetchSkills } from '@/lib/api';
import { fadeUp, SPRING, stagger } from '@/lib/motion';
import { btnPrimary, chip, chipOff, chipOn, h1, h2, input } from '@/lib/ui';
import type { CatalogueResource, Skill } from '@/lib/types';
import { ResourceCard } from './ResourceCard';

type Props = {
  kind: 'course' | 'job';
  heading: string;
  placeholder: string;
  gridTitle: string;
  /** Rendered when the catalogue holds nothing of this kind. */
  empty: React.ReactNode;
};

const GRID = 'grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(232px,1fr))]';

/** Browse page shared by Courseware and Jobs — same shell, different `kind`. */
export function Catalogue({ kind, heading, placeholder, gridTitle, empty }: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [rows, setRows] = useState<CatalogueResource[] | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills().then(setSkills).catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    setRows(null);
    fetchResources({ kind, skill: active ?? undefined })
      .then((r) => setRows(r.resources))
      .catch((e) => setError(String(e)));
  }, [kind, active]);

  // Search narrows what is already loaded; the skill chips are the server-side filter.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !rows) return rows;
    return rows.filter(
      (r) => r.title.toLowerCase().includes(q) || r.provider.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const chips = useMemo(() => skills.slice(0, 12), [skills]);

  return (
    <motion.div {...fadeUp} transition={SPRING}>
      <section className="mb-7 rounded-card bg-accent-soft px-9 py-8">
        <h1 className={`${h1} max-w-[15ch] text-[29px]`}>{heading}</h1>
        <div className="flex max-w-[460px] gap-2.5 max-sm:flex-col">
          <input
            className={`${input} border-transparent`}
            value={query}
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className={btnPrimary} type="button">
            Search
          </button>
        </div>
        <p className="mt-3.5 text-[13.5px] text-ink-soft">
          Suggestions:{' '}
          {chips.slice(0, 3).map((s) => (
            <button
              key={s.id}
              className="cursor-pointer pr-2.5 text-[13.5px] text-ink underline underline-offset-[3px] hover:text-accent-deep"
              onClick={() => setActive(s.slug)}
            >
              {s.name}
            </button>
          ))}
        </p>
      </section>

      <div className="mb-3.5 flex items-baseline gap-2.5">
        <h2 className={h2}>{gridTitle}</h2>
        {visible && <span className="text-[13px] text-ink-faint">{visible.length}</span>}
      </div>

      <div className="mb-[22px] flex flex-wrap gap-2">
        <button
          className={`${chip} px-4 py-2 text-[13.5px] ${active === null ? chipOn : chipOff}`}
          onClick={() => setActive(null)}
        >
          All
        </button>
        {chips.map((s) => (
          <motion.button
            key={s.id}
            className={`${chip} px-4 py-2 text-[13.5px] ${active === s.slug ? chipOn : chipOff}`}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActive(active === s.slug ? null : s.slug)}
          >
            {s.name}
          </motion.button>
        ))}
      </div>

      {error && <p className="mb-4 text-[13.5px] text-red-600">{error}</p>}

      <AnimatePresence mode="wait" initial={false}>
        {visible === null ? (
          <motion.div key="loading" className={GRID} {...fadeUp}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[330px] animate-pulse rounded-[18px] bg-black/5" />
            ))}
          </motion.div>
        ) : visible.length === 0 ? (
          <motion.div key="empty" {...fadeUp} transition={SPRING}>
            {rows && rows.length === 0 ? (
              empty
            ) : (
              <p className="text-ink-faint">Nothing matches that search.</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`${active ?? 'all'}-${visible.length}`}
            className={GRID}
            variants={stagger(0.04)}
            initial="initial"
            animate="animate"
          >
            {visible.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
