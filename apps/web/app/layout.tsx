import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillBridge',
  description: 'Find your skill gaps, then the courses that close them',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-full flex-col">
          <Nav />
          <main className="flex flex-1 justify-center px-5 pt-3 pb-14">
            <div className="w-full max-w-[1120px]">{children}</div>
          </main>
          <div className="pb-6 text-center">
            <Link
              href="/admin"
              className="text-[11px] uppercase tracking-[0.14em] text-ink-faint no-underline hover:text-ink-soft"
            >
              Admin
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
