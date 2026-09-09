'use client';

import { motion } from 'motion/react';
import { item } from '@/lib/motion';
import { btnOutline, tag } from '@/lib/ui';

/**
 * Thumbnails are derived, not stored — the catalogue has no artwork. A stable hash of the
 * title picks the palette so a card keeps the same colour across reloads and refetches.
 */
const PALETTE = [
  { bg: '#14532d', ink: '#dcfce7' },
  { bg: '#0f766e', ink: '#ccfbf1' },
  { bg: '#1e40af', ink: '#dbeafe' },
  { bg: '#9a3412', ink: '#ffedd5' },
  { bg: '#9d174d', ink: '#fce7f3' },
  { bg: '#4338ca', ink: '#e0e7ff' },
  { bg: '#3f6212', ink: '#ecfccb' },
  { bg: '#7e22ce', ink: '#f3e8ff' },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const pretty = (slug: string) => slug.replace(/-/g, ' ');
const hours = (mins: number | null) => (mins ? `${Math.round(mins / 60)}h` : null);

export type CardResource = {
  id: string;
  kind: 'course' | 'job';
  title: string;
  url: string;
  provider: string;
  level: string;
  durationMins: number | null;
  skills: string[];
};

type Props = {
  resource: CardResource;
  /** Position in a ranked list; omitted when the grid has no meaningful order. */
  rank?: number;
};

export function ResourceCard({ resource, rank }: Props) {
  const theme = PALETTE[hash(resource.title) % PALETTE.length]!;
  const meta = [resource.level, hours(resource.durationMins)].filter(Boolean).join(' · ');
  // The thumbnail carries the topic; the title sits below, so it is never printed twice.
  const topic = resource.skills[0] ? pretty(resource.skills[0]) : resource.provider;

  return (
    <motion.article
      className="flex flex-col rounded-[18px] border border-line bg-card p-3 pb-3.5"
      variants={item}
      whileHover={{ y: -3 }}
    >
      <div
        className="relative mb-3 flex h-[116px] items-end overflow-hidden rounded-xl p-3.5"
        style={{ background: theme.bg, color: theme.ink }}
      >
        {rank !== undefined && (
          <span className="absolute top-3 left-3 grid size-6 place-items-center rounded-full bg-white/25 text-xs font-bold tabular-nums">
            {rank}
          </span>
        )}
        <span className="line-clamp-2 text-[19px] font-extrabold capitalize leading-[1.15] tracking-[-0.02em]">
          {topic}
        </span>
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-[0.08em] opacity-75">
          {resource.kind === 'job' ? 'Role' : 'Course'}
        </span>
      </div>

      <div className="flex-1 px-1">
        <h3 className="mb-1.5 line-clamp-2 text-[14.5px] font-semibold leading-[1.35]">
          {resource.title}
        </h3>
        <p className="mb-1 text-[13px] text-ink-soft">{resource.provider}</p>
        <p className="mb-2.5 text-[12.5px] capitalize text-ink-faint">{meta}</p>
        {resource.skills.length > 0 && (
          <div className="mb-3.5 flex flex-wrap gap-1.5">
            {resource.skills.slice(0, 3).map((s) => (
              <span className={tag} key={s}>
                {pretty(s)}
              </span>
            ))}
          </div>
        )}
      </div>

      <a className={`${btnOutline} mx-1`} href={resource.url} target="_blank" rel="noreferrer">
        {resource.kind === 'job' ? 'View role' : 'View course'}
      </a>
    </motion.article>
  );
}
