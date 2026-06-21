import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '@myklasi/shared';
import { Logo } from './Logo';

// Helper to determine role-specific home routes
export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin';
    case 'head_teacher':
      return '/dashboard';
    case 'deputy_head':
      return '/deputy-head';
    case 'teacher':
      return '/teacher/dashboard';
    case 'bursar':
      return '/bursar/dashboard';
    case 'student':
      return '/student/dashboard';
    case 'parent':
      return '/parent/dashboard';
    default:
      return '/login';
  }
}

/**
 * Route guard for pages that REQUIRE authentication
 */
export const PrivateRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, mustChangePassword } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden bg-grid-pattern">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/10 via-transparent to-brand-500/5 pointer-events-none" />
        <div className="flex flex-col items-center z-10">
          <div className="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin loader-glow mb-4" />
          <Logo height="48px" className="animate-pulse mb-2" />
          <p className="text-sm text-muted-foreground mt-1">Securing connection...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page and preserve the path they wanted to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Force password change check
  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // RBAC permission check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

/**
 * Route guard for GUEST-only pages (Login, Forgot Password, Reset Password)
 * If they are already logged in, redirect them immediately to their home page.
 */
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center bg-grid-pattern">
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <>{children}</>;
};

/**
 * Inline permission-level conditional rendering wrapper
 */
export const HasRole: React.FC<{
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ roles, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
