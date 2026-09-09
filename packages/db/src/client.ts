import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export type Db = ReturnType<typeof makeDb>['db'];

/** The hub's single persistent pool. Nothing else in the system opens one. */
export function makeDb(url = process.env.DATABASE_URL ?? 'postgres://sih:sih@localhost:5432/sih') {
  const sql = postgres(url, { max: 10, onnotice: () => {} });
  return { sql, db: drizzle(sql, { schema }) };
}
