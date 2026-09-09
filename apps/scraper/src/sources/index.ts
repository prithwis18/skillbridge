import type { ResourceInput, ResourceKind } from '@sih/shared';
import { fixtureSource } from './fixtures.js';

/** Extension point. New scraper or job board = one file here exporting a Source, added to SOURCES. */
export type Source = {
  name: string;
  kind: ResourceKind;
  fetch(skillSlug: string): Promise<ResourceInput[]>;
};

export const SOURCES: Source[] = [fixtureSource];
