import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { resetPasswordBaseSchema, type ResetPasswordInput } from '@myklasi/shared';
import { Key, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../../components/Logo';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<ResetPasswordInput, 'token'> & { confirmPassword: string }>({
    resolver: zodResolver(resetPasswordBaseSchema.omit({ token: true })),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: Omit<ResetPasswordInput, 'token'> & { confirmPassword: string }) => {
    if (!token) {
      setErrorMsg('Invalid or missing password reset token in URL.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Password reset failed. The token may have expired.');
    } finally {
      setIsLoading(false);
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
      />
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-fixed opacity-20 blur-[100px] z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary-container opacity-20 blur-[100px] z-0 pointer-events-none" />

      <main className="relative z-10 w-full max-w-[440px] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.05)] p-lg md:p-xl flex flex-col gap-lg animate-slide-in-bottom">

        <header className="flex flex-col items-center text-center gap-sm">
          <Logo height="64px" className="mb-xs" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">Create a new secure password for your account</p>
        </header>

        {!token ? (
          <div className="text-center flex flex-col gap-md py-sm">
            <div className="flex justify-center">
              <div className="p-sm bg-error-container rounded-full text-error">
                <span className="material-symbols-outlined text-[40px]">link_off</span>
              </div>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-sm">Invalid Reset URL</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Your password reset link is invalid, incomplete, or corrupted. Please request a new link.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="w-full inline-block bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-[10px] rounded-lg transition-colors text-center"
            >
              Request New Link
            </Link>
          </div>
        ) : isSuccess ? (
          <div className="text-center flex flex-col gap-md animate-fade-in">
            <div className="flex justify-center">
              <div className="p-sm bg-secondary-container rounded-full text-secondary">
                <CheckCircle className="w-10 h-10" />
              </div>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-sm">Password Reset Successful</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Your password has been successfully updated. You can now log in using your new credentials.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full inline-block bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-[10px] rounded-lg transition-colors text-center active:scale-[0.98]"
            >
              Log In Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            <div className="text-center">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Create New Password</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Choose a secure password with at least 8 characters, one number, and one uppercase letter.
              </p>
            </div>

            {errorMsg && (
              <div className="p-sm bg-error-container border border-error/20 text-on-error-container font-body-sm text-body-sm rounded-lg flex items-start gap-sm">
                <span className="material-symbols-outlined text-error shrink-0">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">

              {/* New Password */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="password">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-[36px] pr-[40px] py-[10px] bg-surface-container-lowest border ${errors.password ? 'border-error focus:ring-error/20' : 'border-outline focus:border-primary focus:ring-primary-fixed-dim'} rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-sm flex items-center text-outline hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-error mt-0.5 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-[36px] pr-md py-[10px] bg-surface-container-lowest border ${errors.confirmPassword ? 'border-error focus:ring-error/20' : 'border-outline focus:border-primary focus:ring-primary-fixed-dim'} rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-error mt-0.5 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-sm py-[10px] px-md bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-on-primary-fixed transition-colors flex items-center justify-center gap-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        )}

        <div className="pt-md border-t border-outline-variant text-center">
          <Link
            className="inline-flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors rounded py-xs px-sm"
            to="/login"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Login
          </Link>
        </div>
      </main>
    </div>
  );
};
