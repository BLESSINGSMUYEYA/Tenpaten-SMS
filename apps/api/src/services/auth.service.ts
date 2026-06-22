import bcrypt from 'bcrypt';
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
import type { LoginInput, ForgotPasswordInput, ResetPasswordInput, ChangePasswordInput, UserRole } from '@myklasi/shared';

class AuthService {
  /**
   * Login User
   */
  public async login(input: LoginInput) {
    const { schoolCode, email, password } = input; // email acts as the login identifier

    // 1. If it's a super_admin login (using admin school code), handle accordingly
    const isSuperAdminCode = schoolCode === 'TPTN-2026-0000' || schoolCode === 'ADMIN-2026-0000';

    let user;

    if (isSuperAdminCode) {
      user = await prisma.user.findFirst({
        where: {
          email,
          role: 'super_admin',
          isDeleted: false,
        },
        include: {
          school: true,
        },
      });
    } else {
      // Find school by code
      const school = await prisma.school.findFirst({
        where: {
          schoolCode,
          isDeleted: false,
        },
      });

      if (!school) {
        throw new UnauthorizedError('Invalid school code, email, or password');
      }

      if (!school.isActive) {
        throw new ForbiddenError('Your school account is deactivated. Please contact support.');
      }

      const searchKey = email.trim();
      const lowerKey = searchKey.toLowerCase();
      const upperKey = searchKey.toUpperCase();

      // Find user under this school by email, username, or student admission number
      user = await prisma.user.findFirst({
        where: {
          schoolId: school.id,
          isDeleted: false,
          OR: [
            { email: lowerKey },
            { username: lowerKey },
            {
              studentProfile: {
                admissionNumber: upperKey,
                isDeleted: false,
              },
            },
          ],
        },
        include: {
          school: true,
        },
      });
    }

    if (!user) {
      throw new UnauthorizedError('Invalid school code, email, or password');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated. Please contact your school administrator.');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid school code, email, or password');
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      schoolId: user.schoolId ?? undefined,
      role: user.role as UserRole,
      email: user.email ?? '',
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Remove passwordHash from output
    const { passwordHash: _, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
      mustChangePassword: user.mustChangePassword,
    };
  }

  /**
   * Refresh Token
   */
  public async refresh(token: string) {
    const payload = verifyRefreshToken(token);

    // Verify user is still active
    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        isDeleted: false,
        isActive: true,
      },
      include: {
        school: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User session expired or account deactivated');
    }

    if (user.schoolId && (!user.school || !user.school.isActive || user.school.isDeleted)) {
      throw new ForbiddenError('Your school account is deactivated or deleted.');
    }

    const tokenPayload = {
      userId: user.id,
      schoolId: user.schoolId ?? undefined,
      role: user.role as UserRole,
      email: user.email ?? '',
    };

    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const { passwordHash: _, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Request Password Reset
   */
  public async forgotPassword(input: ForgotPasswordInput) {
    const { email, schoolCode } = input;

    const isSuperAdminCode = schoolCode === 'TPTN-2026-0000' || schoolCode === 'ADMIN-2026-0000';

    let user;

    if (isSuperAdminCode) {
      user = await prisma.user.findFirst({
        where: {
          email,
          role: 'super_admin',
          isDeleted: false,
        },
      });
    } else {
      const school = await prisma.school.findFirst({
        where: {
          schoolCode,
          isDeleted: false,
        },
      });

      if (!school) {
        throw new NotFoundError('School');
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
            {
              studentProfile: {
                admissionNumber: upperKey,
                isDeleted: false,
              },
            },
          ],
        },
      });
    }

    if (!user || !user.email) {
      // Return true to avoid email harvesting
      return true;
    }

    // Generate token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send email (asynchronously)
    emailService.sendPasswordResetEmail({
      email: user.email,
      firstName: user.firstName,
      schoolCode,
      resetToken: token,
    }).catch((err) => {
      console.error('Password reset email failed to send:', err);
    });

    return true;
  }

  /**
   * Reset Password with token
   */
  public async resetPassword(input: ResetPasswordInput) {
    const { token, password } = input;

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!resetToken || !resetToken.user || resetToken.user.isDeleted || !resetToken.user.isActive) {
      throw new ValidationError({ token: ['Invalid or expired reset token'] });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          mustChangePassword: false,
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return true;
  }

  /**
   * Force Change Password
   */
  public async changePassword(userId: string, input: ChangePasswordInput) {
    const { currentPassword, newPassword } = input;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Check current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ValidationError({ currentPassword: ['Current password is incorrect'] });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    return true;
  }
}

export const authService = new AuthService();
