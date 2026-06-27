import rateLimit, { MemoryStore, Store } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';
import type { ApiResponse } from '@myklasi/shared';

/**
 * A wrapper store that delegates to RedisStore if Redis is connected/available.
 * If Redis is unavailable or fails during operation/init, it falls back to the in-memory MemoryStore.
 */
class GracefulRedisStore implements Store {
  private redisStore: RedisStore;
  private memoryStore: MemoryStore;
  private useMemory = false;

  constructor(prefix: string) {
    this.memoryStore = new MemoryStore();
    
    this.redisStore = new RedisStore({
      prefix,
      sendCommand: async (command: string, ...args: string[]): Promise<any> => {
        if (this.useMemory) {
          return 0;
        }
        try {
          return await redis.call(command, ...args);
        } catch (err: any) {
          console.error(`[RedisStore] Command "${command}" failed, falling back to MemoryStore:`, err.message);
          this.useMemory = true;
          return 0; // Return dummy value so constructor/init does not throw
        }
      },
    });
  }

  init(options: any) {
    this.memoryStore.init(options);
    if (this.redisStore.init) {
      try {
        this.redisStore.init(options);
      } catch (err: any) {
        console.error('[RedisStore] Init failed, falling back to MemoryStore:', err.message);
        this.useMemory = true;
      }
    }
  }

  async increment(key: string) {
    if (this.useMemory) {
      return this.memoryStore.increment(key);
    }
    try {
      return await this.redisStore.increment(key);
    } catch (err: any) {
      console.error('[RedisStore] Increment failed, falling back to MemoryStore:', err.message);
      this.useMemory = true;
      return this.memoryStore.increment(key);
    }
  }

  async decrement(key: string) {
    if (this.useMemory) {
      return this.memoryStore.decrement(key);
    }
    try {
      await this.redisStore.decrement(key);
    } catch (err: any) {
      console.error('[RedisStore] Decrement failed, falling back to MemoryStore:', err.message);
      this.useMemory = true;
      await this.memoryStore.decrement(key);
    }
  }

  async resetKey(key: string) {
    if (this.useMemory) {
      return this.memoryStore.resetKey(key);
    }
    try {
      await this.redisStore.resetKey(key);
    } catch (err: any) {
      console.error('[RedisStore] ResetKey failed, falling back to MemoryStore:', err.message);
      this.useMemory = true;
      await this.memoryStore.resetKey(key);
    }
  }
}

/**
 * Creates a rate limiter store that falls back gracefully if Redis is unavailable.
 */
function createRedisStore(prefix: string) {
  return new GracefulRedisStore(prefix);
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
