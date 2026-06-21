import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
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

    // Verify the user still exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        isDeleted: false,
        isActive: true,
      },
      select: {
        id: true,
        schoolId: true,
        role: true,
        email: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account not found or inactive');
    }

    req.user = {
      userId: user.id,
      schoolId: user.schoolId ?? undefined,
      role: user.role as UserRole,
      email: user.email,
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
      email: payload.email,
    };
  } catch {
    // Ignore invalid token for optional auth
  }

  next();
}

// ---- Token Generation ----

export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}
