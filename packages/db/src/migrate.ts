import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { makeDb } from './client.js';

const here = dirname(fileURLToPath(import.meta.url));
const { sql, db } = makeDb();
// Works from both src/ (tsx) and dist/ (built): migrations sit at the package root.
await migrate(db, { migrationsFolder: resolve(here, '..', 'migrations') });
await sql.end();
console.log('migrations applied');
