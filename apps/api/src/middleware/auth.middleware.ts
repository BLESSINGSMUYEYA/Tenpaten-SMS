import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import type { JwtPayload, UserRole } from '@myklasi/shared';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        schoolId?: string;
        role: UserRole;
        email: string;
      };
    }
  }
}

// ---- JWT Authentication Middleware ----

/**
 * Verifies the Bearer access token from the Authorization header.
 *
 * PERFORMANCE NOTE: We intentionally do NOT hit the database on every request.
 * Instead we trust the cryptographically-signed JWT payload.
 * - Access tokens are short-lived (15m) — revocation delay is acceptable.
 * - Session validity (deactivated accounts, password changes) is enforced
 *   at REFRESH time via tokenVersion + RefreshToken DB records.
 * - This keeps authenticated routes to a single JWT verify call (< 1ms).
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No access token provided');
    }

    const token = authHeader.slice(7);

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }

    req.user = {
      userId: payload.userId,
      schoolId: payload.schoolId,
      role: payload.role,
      email: payload.email ?? '',
    };

    next();
  } catch (error) {
    next(error);
  }
}

// ---- Optional Auth (for public + auth routes) ----

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    req.user = {
      userId: payload.userId,
      schoolId: payload.schoolId,
      role: payload.role,
      email: payload.email ?? '',
    };
  } catch {
    // Ignore invalid token for optional auth
  }

  next();
}

// ---- Token Generation ----

export function generateAccessToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>
): string {
  return jwt.sign(
    { ...payload, jti: payload.jti ?? uuidv4() },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions
  );
}

export function generateRefreshToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>
): string {
  return jwt.sign(
    { ...payload, jti: payload.jti ?? uuidv4() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}
