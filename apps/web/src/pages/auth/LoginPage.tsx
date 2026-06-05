import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, type LoginInput } from '@tenpaten/shared';
import { Logo } from '../../components/Logo';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Read redirect path from router state or default to appropriate landing
  const from = location.state?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      schoolCode: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(data);
      setIsLoading(false);
      setTimeout(() => {
        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 50);
    } catch (err: any) {
      setIsLoading(false);
      const apiError = err.response?.data?.message || 'Invalid school code, email, or password. Please verify details.';
      setErrorMsg(apiError);
    }
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col items-center justify-center p-md relative overflow-hidden font-body-md text-on-surface">
      {/* Decorative Ambient Background */}
      <div
        className="absolute inset-0 z-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(var(--md-surface-container) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      ></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-fixed opacity-20 blur-[100px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary-container opacity-20 blur-[100px] z-0 pointer-events-none"></div>

      {/* Login Card (Level 2 Elevation: Soft Ambient Shadow) */}
      <main className="relative z-10 w-full max-w-[440px] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.05)] p-lg md:p-xl flex flex-col gap-lg">
        <header className="flex flex-col items-center text-center gap-sm">
          <Logo height="64px" className="mb-xs" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">Secure access to your institution portal</p>
        </header>

        {errorMsg && (
          <div className="p-3 bg-error-container border border-error/20 text-on-error-container text-body-sm rounded-lg flex items-start gap-sm">
            <span className="material-symbols-outlined text-error shrink-0">error</span>
            <div>
              <span className="font-bold block mb-0.5">Authentication failed</span>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
          {/* School Code */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="schoolCode">
              School Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline text-[18px]">domain</span>
              </div>
              <input
                {...register('schoolCode')}
                className={`w-full pl-[36px] pr-md py-[10px] bg-surface-container-lowest border ${errors.schoolCode ? 'border-error focus:ring-error/20' : 'border-outline focus:border-primary focus:ring-primary-fixed-dim'} rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 transition-all`}
                id="schoolCode"
                placeholder="e.g. SSS-2026-4821"
                autoCapitalize="characters"
                type="text"
              />
            </div>
            {errors.schoolCode && (
              <p className="text-[11px] text-error mt-0.5 font-medium">{errors.schoolCode.message}</p>
            )}
          </div>

          {/* Email/Username Input */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline text-[18px]">person</span>
              </div>
              <input
                {...register('email')}
                className={`w-full pl-[36px] pr-md py-[10px] bg-surface-container-lowest border ${errors.email ? 'border-error focus:ring-error/20' : 'border-outline focus:border-primary focus:ring-primary-fixed-dim'} rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 transition-all`}
                id="email"
                placeholder="Enter your email"
                type="email"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-error mt-0.5 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-xs">
            <div className="flex justify-between items-center">
              <label className="font-label-sm text-label-sm text-on-surface" htmlFor="password">
                Password
              </label>
              <Link to="/forgot-password" className="font-label-sm text-label-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim rounded">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline text-[18px]">lock</span>
              </div>
              <input
                {...register('password')}
                className={`w-full pl-[36px] pr-[40px] py-[10px] bg-surface-container-lowest border ${errors.password ? 'border-error focus:ring-error/20' : 'border-outline focus:border-primary focus:ring-primary-fixed-dim'} rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 transition-all`}
                id="password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-sm flex items-center text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-error mt-0.5 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            className="w-full mt-sm py-[10px] px-md bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-on-primary-fixed transition-colors flex items-center justify-center gap-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : (
              <>
                Login
                <span className="material-symbols-outlined text-[18px]">login</span>
              </>
            )}
          </button>
        </form>



        {/* Secondary Action / Footer */}
        <div className="mt-xs pt-md border-t border-outline-variant text-center">
          <Link
            className="inline-flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim rounded py-xs px-sm"
            to="/"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Website
          </Link>
        </div>
      </main>
    </div>
  );
};
