import Redis from 'ioredis';
import { env } from './env';

/**
 * Shared Redis client (ioredis).
 * Used by:
 *  - rate-limit-redis (distributed rate limiting across instances)
 *
 * lazyConnect = true: doesn't connect until first command is issued.
 * This avoids crashing the process at startup if Redis is unavailable.
 */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableOfflineQueue: false, // fail fast rather than queue up commands if Redis is down
});

redis.on('error', (err) => {
  // Log but don't crash — rate limiting will gracefully degrade
  console.error('[Redis] Connection error:', err.message);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});
