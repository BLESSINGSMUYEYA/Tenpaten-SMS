import { Router } from 'express';
import { authService } from '../services/auth.service';
import { loginRateLimiter } from '../middleware/rateLimiter.middleware';
import { validateBody } from './../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler, sendSuccess } from '../utils/errors';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '@myklasi/shared';
import { env } from '../config/env';

const router = Router();

// Cookie configuration for refresh token
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
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
    const result = await authService.login(req.body);
    
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
  asyncHandler(async (_req, res) => {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
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
    // Hydrate the full user from database
    const user = await authService.refresh(req.cookies?.refreshToken || '');
    sendSuccess(res, { user: user.user }, 'Current user retrieved');
  })
);

export default router;
