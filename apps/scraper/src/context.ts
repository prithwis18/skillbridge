import { makeRedis, type RedisClient } from '@sih/shared';

export const redis: RedisClient = makeRedis();
