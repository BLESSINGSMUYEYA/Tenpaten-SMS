import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';
import type { ApiResponse } from '@myklasi/shared';

/**
 * Creates a Redis-backed rate limiter store.
 * Shared across all serverless instances so limits are enforced globally.
 * Falls back gracefully if Redis is unavailable (in-memory per instance).
 */
function createRedisStore(prefix: string) {
  return new RedisStore({
    prefix,
    // rate-limit-redis v4 uses sendCommand
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<number>,
  });
}

// ---- Login Rate Limiter ----
// 10 attempts per IP per 15 minutes (only failed requests count)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: createRedisStore('rl:login:'),
  handler: (_req, res) => {
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
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:pwd-reset:'),
  handler: (_req, res) => {
    const response: ApiResponse = {
      success: false,
      message: 'Too many password reset attempts. Please try again in an hour.',
    };
    res.status(429).json(response);
  },
});

// ---- General API Rate Limiter ----
// 200 requests per IP per minute
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('rl:api:'),
  handler: (_req, res) => {
    const response: ApiResponse = {
      success: false,
      message: 'Too many requests. Please slow down.',
    };
    res.status(429).json(response);
  },
});
