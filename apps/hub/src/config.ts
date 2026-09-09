import { envInt } from '@sih/shared';

export const config = {
  port: envInt('PORT', 3001),
  /** Gap skill with fewer resources than this triggers a scrape. */
  minCoverage: envInt('MIN_COVERAGE', 2),
  /** Bound on waiting for scraper results before answering with what we have. */
  scrapeWaitMs: envInt('SCRAPE_WAIT_MS', 8000),
  maxRecommendations: envInt('MAX_RECOMMENDATIONS', 12),
};
