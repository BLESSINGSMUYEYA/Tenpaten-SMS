import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { env } from '../config/env';
import {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/errors';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../middleware/auth.middleware';
import { emailService } from './email.service';
import { generateResetToken } from '../utils/helpers';
import type {
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  UserRole,
} from '@myklasi/shared';
import type { Request } from 'express';

// ---- Constants ----
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ---- Helpers ----

/**
 * Hash a refresh token for secure DB storage.
 * We never store raw tokens — only their SHA-256 hash.
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Fire-and-forget audit log writer.
 * Auth events are written asynchronously so they never block the request path.
 */
function writeAuditLog(data: {
  userId?: string | null;
  schoolId?: string | null;
  event: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}): void {
  prisma.auditLog
    .create({
      data: {
        userId: data.userId ?? null,
        schoolId: data.schoolId ?? null,
        event: data.event,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: (data.metadata ?? undefined) as any,
      },
    })
    .catch((err) => {
      console.error('[AuditLog] Write failed:', err.message);
    });
}

/**
 * Verifies if a given school code corresponds to the super admin role.
 * Accepts TPTN-ADMIN-0000, TPTN-2026-0000, ADMIN-2026-0000, and the configured env.SUPER_ADMIN_SCHOOL_CODE.
 */
function isSuperAdminSchoolCode(code: string): boolean {
  const upperCode = code.toUpperCase().trim();
  return (
    upperCode === 'TPTN-ADMIN-0000' ||
    upperCode === 'TPTN-2026-0000' ||
    upperCode === 'ADMIN-2026-0000' ||
    upperCode === env.SUPER_ADMIN_SCHOOL_CODE.toUpperCase().trim()
  );
}

// ---- Auth Service ----

class AuthService {
  /**
   * Login User
   * - Checks school validity + subscription expiry
   * - Enforces per-account lockout (5 failed attempts → 15-min lock)
   * - Stores hashed refresh token in DB for rotation tracking
   * - Writes LOGIN_SUCCESS / LOGIN_FAILED audit log
   */
  public async login(input: LoginInput, req?: Partial<Request>) {
    const { schoolCode, email, password } = input;
    const ip = req?.ip ?? undefined;
    const ua = (req?.headers?.['user-agent'] as string) ?? undefined;

    const isSuperAdminCode = isSuperAdminSchoolCode(schoolCode);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: any;

    if (isSuperAdminCode) {
      user = await prisma.user.findFirst({
        where: { email, role: 'super_admin', isDeleted: false },
        include: { school: true },
      });
    } else {
      // Resolve school
      const school = await prisma.school.findFirst({
        where: { schoolCode, isDeleted: false },
      });

      if (!school) {
        writeAuditLog({ event: 'LOGIN_FAILED', ipAddress: ip, userAgent: ua, metadata: { reason: 'invalid_school_code', schoolCode } });
        throw new UnauthorizedError('Invalid school code, email, or password');
      }

      if (!school.isActive) {
        throw new ForbiddenError('Your school account is deactivated. Please contact support.');
      }

      // Subscription expiry check
      if (school.subscriptionEnd && school.subscriptionEnd < new Date()) {
        throw new ForbiddenError(
          'Your school subscription has expired. Please contact support to renew.'
        );
      }

      const searchKey = email.trim();
      const lowerKey = searchKey.toLowerCase();
      const upperKey = searchKey.toUpperCase();

      user = await prisma.user.findFirst({
        where: {
          schoolId: school.id,
          isDeleted: false,
          OR: [
            { email: lowerKey },
            { username: lowerKey },
            { studentProfile: { admissionNumber: upperKey, isDeleted: false } },
          ],
        },
        include: { school: true },
      });
    }

    if (!user) {
      writeAuditLog({ event: 'LOGIN_FAILED', ipAddress: ip, userAgent: ua, metadata: { reason: 'user_not_found', email } });
      throw new UnauthorizedError('Invalid school code, email, or password');
    }

    if (!user.isActive) {
      throw new ForbiddenError(
        'Your account has been deactivated. Please contact your school administrator.'
      );
    }

    // Per-account lockout check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      writeAuditLog({ userId: user.id, schoolId: user.schoolId, event: 'LOGIN_FAILED', ipAddress: ip, userAgent: ua, metadata: { reason: 'account_locked' } });
      throw new ForbiddenError(
        `Account temporarily locked due to too many failed attempts. Try again in ${remainingMin} minute(s).`
      );
    }

    // Password check
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          ...(shouldLock ? { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) } : {}),
        },
      });

      if (shouldLock) {
        writeAuditLog({ userId: user.id, schoolId: user.schoolId, event: 'ACCOUNT_LOCKED', ipAddress: ip, userAgent: ua, metadata: { attempts: newAttempts } });
      }
      writeAuditLog({ userId: user.id, schoolId: user.schoolId, event: 'LOGIN_FAILED', ipAddress: ip, userAgent: ua, metadata: { reason: 'invalid_password', attempts: newAttempts } });
      throw new UnauthorizedError('Invalid school code, email, or password');
    }

    // Build token payload
    const family = uuidv4(); // New rotation family for this session
    const basePayload = {
      userId: user.id,
      schoolId: user.schoolId ?? undefined,
      role: user.role as UserRole,
      email: user.email ?? '',
      tokenVersion: user.tokenVersion,
    };

    const accessToken = generateAccessToken({ ...basePayload, jti: uuidv4() });
    const refreshToken = generateRefreshToken({ ...basePayload, jti: uuidv4(), family });

    // Persist hashed refresh token to DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        family,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    // Reset lockout counters + record last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), failedLoginAttempts: 0, lockedUntil: null },
    });

    writeAuditLog({ userId: user.id, schoolId: user.schoolId, event: 'LOGIN_SUCCESS', ipAddress: ip, userAgent: ua, metadata: { role: user.role } });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken, mustChangePassword: user.mustChangePassword };
  }

  /**
   * Refresh Token
   * - Looks up the hashed token in DB (proves possession)
   * - Detects rotation attacks via the family chain
   * - Checks tokenVersion for mass-revocation (e.g., after password change)
   * - Rotates: revokes old token, issues new token, persists new hash
   */
  public async refresh(token: string) {
    // Step 1: Cryptographic verify
    const payload = verifyRefreshToken(token);

    // Step 2: Look up in DB by hash
    const tokenHash = hashToken(token);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { school: true } } },
    });

    // Step 3: Token not in DB — potential replay after rotation
    if (!storedToken) {
      if (payload.family) {
        // If this family has a revoked token, it's a reuse attack — revoke entire family
        const familyCompromised = await prisma.refreshToken.findFirst({
          where: { family: payload.family, revokedAt: { not: null } },
        });
        if (familyCompromised) {
          await prisma.refreshToken.updateMany({
            where: { family: payload.family },
            data: { revokedAt: new Date() },
          });
          writeAuditLog({ userId: payload.userId, event: 'TOKEN_REVOKED', metadata: { reason: 'rotation_attack_detected', family: payload.family } });
        }
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Step 4: Already revoked?
    if (storedToken.revokedAt) {
      throw new UnauthorizedError('Refresh token has been revoked. Please log in again.');
    }

    // Step 5: DB-level expiry check (belt-and-suspenders alongside JWT exp)
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has expired. Please log in again.');
    }

    const user = storedToken.user;
    if (!user || user.isDeleted || !user.isActive) {
      throw new UnauthorizedError('User session expired or account deactivated');
    }

    // Step 6: tokenVersion check — password change / admin revocation invalidates this
    if (payload.tokenVersion !== undefined && user.tokenVersion !== payload.tokenVersion) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedError('Session invalidated. Please log in again.');
    }

    if (user.schoolId && (!user.school || !user.school.isActive || user.school.isDeleted)) {
      throw new ForbiddenError('Your school account is deactivated or deleted.');
    }

    // Step 7: Rotate — revoke old, issue new (same family)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const newBasePayload = {
      userId: user.id,
      schoolId: user.schoolId ?? undefined,
      role: user.role as UserRole,
      email: user.email ?? '',
      tokenVersion: user.tokenVersion,
    };

    const newAccessToken = generateAccessToken({ ...newBasePayload, jti: uuidv4() });
    const newRefreshToken = generateRefreshToken({ ...newBasePayload, jti: uuidv4(), family: storedToken.family });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(newRefreshToken),
        family: storedToken.family,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout — revoke the specific refresh token in DB
   * The access token expires naturally within its 15-minute window.
   */
  public async logout(token: string | undefined, userId?: string): Promise<void> {
    if (token) {
      const tokenHash = hashToken(token);
      await prisma.refreshToken
        .updateMany({
          where: { tokenHash, revokedAt: null },
          data: { revokedAt: new Date() },
        })
        .catch(() => {
          // Best effort — don't fail logout if this errors
        });
    }

    if (userId) {
      writeAuditLog({ userId, event: 'LOGOUT' });
    }
  }

  /**
   * Request Password Reset
   * Always returns true to prevent email harvesting.
   */
  public async forgotPassword(input: ForgotPasswordInput) {
    const { email, schoolCode } = input;

    const isSuperAdminCode = isSuperAdminSchoolCode(schoolCode);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: any;

    if (isSuperAdminCode) {
      user = await prisma.user.findFirst({
        where: { email, role: 'super_admin', isDeleted: false },
      });
    } else {
      const school = await prisma.school.findFirst({
        where: { schoolCode, isDeleted: false },
      });

      if (!school) throw new NotFoundError('School');

      const searchKey = email.trim();
      const lowerKey = searchKey.toLowerCase();
      const upperKey = searchKey.toUpperCase();

      user = await prisma.user.findFirst({
        where: {
          schoolId: school.id,
          isDeleted: false,
          OR: [
            { email: lowerKey },
            { username: lowerKey },
            { studentProfile: { admissionNumber: upperKey, isDeleted: false } },
          ],
        },
      });
    }

    if (!user || !user.email) {
      return true; // Anti-harvest: never reveal whether the user exists
    }

    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    writeAuditLog({ userId: user.id, schoolId: user.schoolId, event: 'PASSWORD_RESET_REQUESTED' });

    emailService
      .sendPasswordResetEmail({ email: user.email, firstName: user.firstName, schoolCode, resetToken: token })
      .catch((err) => {
        console.error('Password reset email failed to send:', err);
      });

    return true;
  }

  /**
   * Reset Password with token
   * - Validates the one-time token
   * - Increments tokenVersion (invalidates ALL existing sessions)
   * - Revokes all refresh tokens for the user
   */
  public async resetPassword(input: ResetPasswordInput) {
    const { token, password } = input;

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { token, expiresAt: { gt: new Date() }, usedAt: null },
      include: { user: true },
    });

    if (!resetToken || !resetToken.user || resetToken.user.isDeleted || !resetToken.user.isActive) {
      throw new ValidationError({ token: ['Invalid or expired reset token'] });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Atomic: update password + tokenVersion + mark reset token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash, mustChangePassword: false, tempPassword: null, tokenVersion: { increment: 1 } },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Revoke all refresh tokens — user must log in fresh
    await prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    writeAuditLog({ userId: resetToken.userId, schoolId: resetToken.user.schoolId, event: 'PASSWORD_RESET' });
    return true;
  }

  /**
   * Change Password (authenticated user)
   * - Verifies current password
   * - Increments tokenVersion (invalidates ALL existing sessions)
   * - Revokes all refresh tokens
   */
  public async changePassword(userId: string, input: ChangePasswordInput) {
    const { currentPassword, newPassword } = input;

    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
    });

    if (!user) throw new NotFoundError('User');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ValidationError({ currentPassword: ['Current password is incorrect'] });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false, tempPassword: null, tokenVersion: { increment: 1 } },
    });

    // Revoke all existing refresh tokens — user must log in again on all devices
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    writeAuditLog({ userId, schoolId: user.schoolId, event: 'PASSWORD_CHANGED' });
    return true;
  }
}

export const authService = new AuthService();
