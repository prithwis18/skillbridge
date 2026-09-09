import { makeDb } from './client.js';
import { skills } from './schema.js';
import { SKILL_SEED } from './skills.js';

const { sql, db } = makeDb();
await db.insert(skills).values(SKILL_SEED).onConflictDoNothing({ target: skills.slug });
const rows = await sql<{ count: string }[]>`select count(*)::text as count from skills`;
await sql.end();
console.log(`seeded skills, table now has ${rows[0]?.count ?? '?'}`);
