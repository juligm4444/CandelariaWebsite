import 'server-only';

import { queryOne } from './client';

export type SiteStats = {
  members: number;
  careers: number;
  publications: number;
};

/**
 * Counts that come straight from the database, so the About page never
 * publishes a figure someone typed in. Returns null when the database is not
 * reachable; the page then shows a dash instead of a number.
 */
export async function siteStats(): Promise<SiteStats | null> {
  try {
    const row = await queryOne<{ members: string; careers: string; publications: string }>(
      `select
         (select count(*) from "user"
           where "isInternal" and "isActive" and "areaKey" is not null)::text as members,
         (select count(distinct "careerKey") from "user"
           where "isInternal" and "isActive" and "careerKey" is not null)::text as careers,
         (select count(*) from publications)::text as publications`,
    );
    if (!row) return null;
    return {
      members: Number(row.members),
      careers: Number(row.careers),
      publications: Number(row.publications),
    };
  } catch (error) {
    console.error('[stats] unavailable: %s', error instanceof Error ? error.message : error);
    return null;
  }
}
