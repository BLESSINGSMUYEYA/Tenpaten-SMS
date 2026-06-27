import rateLimit, { MemoryStore, Options, RateLimitRequestHandler } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';
import type { ApiResponse } from '@myklasi/shared';
import type { Request, Response, NextFunction } from 'express';

/**
 * Creates a rate-limit middleware that lazily initialises its store on the
 * first incoming request — NOT at module load time.
 *
 * This avoids the crash caused by `rate-limit-redis` calling `SCRIPT LOAD`
 * in the `RedisStore` constructor before the Redis connection is ready
 * (and before `enableOfflineQueue: false` allows any commands through).
 *
 * Strategy:
 *  - On the first request, check whether Redis is in the `'ready'` state.
 *  - If yes → build a `RedisStore`-backed `rateLimit` handler.
 *  - If no  → build a `MemoryStore`-backed `rateLimit` handler and warn once.
 *  - All subsequent requests reuse the same handler.
 */
function createLazyRateLimiter(
  prefix: string,
  options: Omit<Partial<Options>, 'store'>
): (req: Request, res: Response, next: NextFunction) => void {
  let handler: RateLimitRequestHandler | null = null;

  return (req: Request, res: Response, next: NextFunction) => {
    if (!handler) {
      if (redis.status === 'ready') {
        // Redis is up — use the distributed store
        handler = rateLimit({
          ...options,
          store: new RedisStore({
            prefix,
            sendCommand: (...args: string[]) =>
              redis.call(args[0], ...args.slice(1)) as Promise<any>,
          }),
        });
        console.log(`[RateLimit] Using RedisStore for prefix "${prefix}"`);
      } else {
        // Redis is not ready — fall back to per-instance memory store
        console.warn(
          `[RateLimit] Redis not ready (status: "${redis.status}"), using MemoryStore for prefix "${prefix}"`
        );
        handler = rateLimit({ ...options, store: new MemoryStore() });
      }
    }

    handler(req, res, next);
  };
}

// ---- Login Rate Limiter ----
// 10 failed attempts per IP per 15 minutes
export const loginRateLimiter = createLazyRateLimiter('rl:login:', {
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
    };
    res.status(429).json(response);
  },
  keyGenerator: (req) => req.ip ?? 'unknown',
});

// ---- Password Reset Rate Limiter ----
// 5 requests per IP per hour
export const passwordResetRateLimiter = createLazyRateLimiter('rl:pwd-reset:', {
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'Too many password reset attempts. Please try again in an hour.',
    };
    res.status(429).json(response);
  },
});

// ---- General API Rate Limiter ----
// 200 requests per IP per minute
export const apiRateLimiter = createLazyRateLimiter('rl:api:', {
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'Too many requests. Please slow down.',
    };
    res.status(429).json(response);
  },
});
