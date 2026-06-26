import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import type { UserRole } from '@myklasi/shared';

// ---- Role-Based Access Control Middleware ----

/**
 * Requires the authenticated user to have one of the specified roles.
 * Must be used AFTER the `authenticate` middleware.
 */
export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
}

/**
 * Requires the user to be a Super Admin (outside any school context).
 */
export function requireSuperAdmin() {
  return requireRoles('super_admin');
}

/**
 * Requires the user to be any school staff (not student or parent).
 */
export function requireStaff() {
  return requireRoles('director', 'head_teacher', 'deputy_head', 'teacher', 'bursar');
}

/**
 * Requires the user to be head teacher or deputy.
 */
export function requireHeadOrDeputy() {
  return requireRoles('director', 'head_teacher', 'deputy_head');
}

/**
 * Ensures the user belongs to the school specified in the request.
 * For routes that include :schoolId in params, or uses the user's own schoolId.
 */
export function requireSameSchool() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    // Super admin bypasses school checks
    if (req.user.role === 'super_admin') {
      return next();
    }

    const schoolIdFromParams = req.params.schoolId;
    const userSchoolId = req.user.schoolId;

    if (schoolIdFromParams && schoolIdFromParams !== userSchoolId) {
      return next(new ForbiddenError('You can only access your own school data'));
    }

    next();
  };
}

// ---- Permission Checks (inline use in route handlers) ----

export function canAccessSchool(userSchoolId?: string, targetSchoolId?: string): boolean {
  return userSchoolId === targetSchoolId;
}

export function isSchoolStaff(role: UserRole): boolean {
  return ['director', 'head_teacher', 'deputy_head', 'teacher', 'bursar'].includes(role);
}

export function canManageStudents(role: UserRole): boolean {
  return ['director', 'head_teacher', 'deputy_head'].includes(role);
}

export function canManageStaff(role: UserRole): boolean {
  return ['director', 'head_teacher'].includes(role);
}

export function canManageFees(role: UserRole): boolean {
  return ['director', 'head_teacher', 'bursar'].includes(role);
}

export function canMarkAttendance(role: UserRole): boolean {
  return ['director', 'head_teacher', 'deputy_head', 'teacher'].includes(role);
}

export function canEnterGrades(role: UserRole): boolean {
  return ['head_teacher', 'teacher'].includes(role);
}

export function canApproveGrades(role: UserRole): boolean {
  return role === 'head_teacher';
}

export function canBuildTimetable(role: UserRole): boolean {
  return ['head_teacher', 'deputy_head'].includes(role);
}

export function canPostAnnouncement(role: UserRole): boolean {
  return ['head_teacher', 'deputy_head'].includes(role);
}
