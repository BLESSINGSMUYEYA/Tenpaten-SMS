import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

/**
 * Tenant Isolation Middleware
 *
 * Injects schoolId from the authenticated user's JWT into req.
 * Every DB query in route handlers uses req.schoolId to scope data.
 * Super Admin is exempt — they operate across all schools.
 */
export function injectTenant(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new ForbiddenError('Authentication required'));
  }

  // Super admin has no school context
  if (req.user.role === 'super_admin') {
    req.schoolId = undefined;
    return next();
  }

  if (!req.user.schoolId) {
    return next(new ForbiddenError('User is not associated with any school'));
  }

  req.schoolId = req.user.schoolId;
  next();
}

// Extend Express Request to include schoolId
declare global {
  namespace Express {
    interface Request {
      schoolId?: string;
    }
  }
}
