'use client';

import Link from 'next/link';
import { card } from '@/lib/ui';
import { Catalogue } from './Catalogue';

export function Courseware() {
  return (
    <Catalogue
      kind="course"
      heading="What do you want to learn today?"
      placeholder="Search courses"
      gridTitle="Recommended courses"
      empty={
        <div className={`${card} border border-line p-9`}>
          <h3 className="mb-2 text-[19px] font-bold">No courses yet</h3>
          <p className="max-w-[62ch] text-ink-faint">
            The catalogue fills two ways: an admin pushes one from the{' '}
            <Link href="/admin" className="text-accent-deep underline">
              admin page
            </Link>
            , or the scraper fills a skill the moment an interview turns up a gap nothing
            covers.
          </p>
        </div>
      }
    />
  );
}
