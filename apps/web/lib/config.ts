// Browser-side calls, so these must be NEXT_PUBLIC_ and baked at build time.
export const QNA_URL = process.env.NEXT_PUBLIC_QNA_URL ?? 'http://localhost:3004';
export const INGESTOR_URL = process.env.NEXT_PUBLIC_INGESTOR_URL ?? 'http://localhost:3003';
export const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL ?? 'http://localhost:3001';
