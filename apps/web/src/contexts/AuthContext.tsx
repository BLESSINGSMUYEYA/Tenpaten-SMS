import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAccessTokenInMemory } from '../services/api';
import type { User, LoginInput, ChangePasswordInput } from '@tenpaten/shared';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);

  // Recover session on mount
  useEffect(() => {
    async function recoverSession() {
      try {
        const response = await api.post('/auth/refresh');
        if (response.data && response.data.success) {
          const { user: userData, accessToken } = response.data.data;
          setAccessTokenInMemory(accessToken);
          setUser(userData);
          setMustChangePassword(userData.mustChangePassword);
        }
      } catch (err) {
        // Session expired or no refresh cookie present - ignore, they need to log in
      } finally {
        setIsLoading(false);
      }
    }

    recoverSession();

    // Listen for session expiry from API interceptor
    const handleSessionExpired = () => {
      setAccessTokenInMemory(null);
      setUser(null);
      setMustChangePassword(false);
    };

    window.addEventListener('auth-session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth-session-expired', handleSessionExpired);
    };
  }, []);

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', input);
      const { user: userData, accessToken, mustChangePassword: passwordResetRequired } = response.data.data;
      
      setAccessTokenInMemory(accessToken);
      setUser(userData);
      setMustChangePassword(passwordResetRequired);
    } catch (error) {
      setAccessTokenInMemory(null);
      setUser(null);
      setMustChangePassword(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed on backend:', err);
    } finally {
      setAccessTokenInMemory(null);
      setUser(null);
      setMustChangePassword(false);
      setIsLoading(false);
    }
  };

  const changePassword = async (input: ChangePasswordInput) => {
    await api.post('/auth/change-password', input);
    setMustChangePassword(false);
    if (user) {
      setUser({ ...user, mustChangePassword: false });
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    mustChangePassword,
    login,
    logout,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
