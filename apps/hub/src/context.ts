import { makeDb, type Db } from '@sih/db';
import { makeRedis, type RedisClient } from '@sih/shared';

// Process-wide handles. The hub owns the only DB pool in the system.
const handles = makeDb();
export const sql = handles.sql;
export const db: Db = handles.db;
export const redis: RedisClient = makeRedis();
