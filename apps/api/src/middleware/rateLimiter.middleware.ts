import rateLimit from 'express-rate-limit';
import type { ApiResponse } from '@myklasi/shared';

// ---- Login Rate Limiter ----
// 10 attempts per IP per 15 minutes — then lockout

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: (_req, res) => {
    const response: ApiResponse = {
      success: false,
      message:
        'Too many login attempts from this IP. Please try again in 15 minutes.',
    };
    res.status(429).json(response);
  },
  keyGenerator: (req) => {
    // Rate limit per IP
    return req.ip ?? 'unknown';
  },
});

// ---- General API Rate Limiter ----

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    const response: ApiResponse = {
      success: false,
      message: 'Too many requests. Please slow down.',
    };
    res.status(429).json(response);
  },
});

// ---- Password Reset Rate Limiter ----

export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    const response: ApiResponse = {
      success: false,
      message: 'Too many password reset attempts. Please try again in an hour.',
    };
    res.status(429).json(response);
  },
});
