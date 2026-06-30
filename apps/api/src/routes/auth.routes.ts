import { Router } from 'express';
import { authService } from '../services/auth.service';
import { loginRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimiter.middleware';
import { validateBody } from './../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler, sendSuccess, NotFoundError } from '../utils/errors';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '@myklasi/shared';
import { env } from '../config/env';
import { prisma } from '../config/database';

const router = Router();

// Cookie configuration for refresh token
// sameSite: 'strict' prevents the cookie being sent on cross-site navigations (CSRF protection)
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching JWT expiration
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT tokens
 * @access  Public (Rate limited)
 */
router.post(
  '/login',
  loginRateLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    // Pass req so the service can record IP + user-agent in the audit log
    const result = await authService.login(req.body, req);
    
    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    
    sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
      mustChangePassword: result.mustChangePassword,
    }, 'Login successful');
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Log user out / clear cookies
 * @access  Public
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    // Revoke the specific refresh token in DB so it can't be reused
    const refreshToken = req.cookies?.refreshToken;
    const userId = req.user?.userId; // may be undefined if not authenticated
    await authService.logout(refreshToken, userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    sendSuccess(res, null, 'Logout successful');
  })
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token cookie
 * @access  Public
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    
    if (!token) {
      sendSuccess(res, null, 'No refresh token provided', 401);
      return;
    }

    const result = await authService.refresh(token);

    // Set new refresh token in cookie
    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
    }, 'Token refreshed successfully');
  })
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validateBody(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body);
    sendSuccess(res, null, 'If the email matches an active account, a password reset link has been sent');
  })
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body);
    sendSuccess(res, null, 'Password reset successful. Please log in with your new password.');
  })
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Force password update on first login or user profile settings
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    await authService.changePassword(userId, req.body);
    sendSuccess(res, null, 'Password updated successfully');
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve currently logged in user context
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    // req.user is already verified by authenticate middleware
    // Do a fresh DB lookup to return the full user profile
    const user = await prisma.user.findFirst({
      where: {
        id: req.user!.userId,
        isDeleted: false,
        isActive: true,
      },
      include: { school: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const { passwordHash: _, ...safeUser } = user;
    sendSuccess(res, { user: safeUser }, 'Current user retrieved');
  })
);

/**
 * @route   GET /api/auth/public-stats
 * @desc    Get public stats (schools, students count) for landing page
 * @access  Public
 */
router.get(
  '/public-stats',
  asyncHandler(async (req, res) => {
    const schoolCount = await prisma.school.count({
      where: {
        isDeleted: false,
        isActive: true,
      },
    });

    const studentCount = await prisma.studentProfile.count({
      where: {
        isDeleted: false,
      },
    });

    sendSuccess(res, {
      schools: schoolCount,
      students: studentCount,
      uptime: '99.9%',
    }, 'Public stats retrieved successfully');
  })
);

export default router;
