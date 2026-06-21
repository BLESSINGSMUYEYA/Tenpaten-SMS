import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@myklasi/shared';
import { Mail, LayoutGrid, CheckCircle } from 'lucide-react';
import { Logo } from '../../components/Logo';

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
      schoolCode: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/auth/forgot-password', data);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Something went wrong. Please check your credentials and try again.');
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
          <Logo height="64px" className="mb-xs" variant="stacked" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">Reset your institution portal password</p>
        </header>

        {isSubmitted ? (
          <div className="text-center flex flex-col gap-md animate-fade-in">
            <div className="flex justify-center">
              <div className="p-sm bg-secondary-container rounded-full text-secondary">
                <CheckCircle className="w-10 h-10" />
              </div>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-sm">Check your email</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                If the email is registered on MyKlasi under that school code, we've sent you a password reset link.
                Please check your inbox (and spam folder) for instructions.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full inline-block bg-surface border border-outline-variant hover:bg-surface-container text-primary font-label-md text-label-md py-[10px] rounded-lg transition-colors text-center"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            <div className="text-center">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Reset Password</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Enter your details and we will email you a link to reset your password.
              </p>
            </div>

            {errorMsg && (
              <div className="p-sm bg-error-container border border-error/20 text-on-error-container font-body-sm text-body-sm rounded-lg flex items-start gap-sm">
                <span className="material-symbols-outlined text-error shrink-0">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">

              {/* School Code */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="schoolCode">
                  School Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <input
                    id="schoolCode"
                    {...register('schoolCode')}
                    type="text"
                    placeholder="e.g. SSS-2026-4821"
                    autoCapitalize="characters"
                    className={`w-full pl-[36px] pr-md py-[10px] bg-surface-container-lowest border ${errors.schoolCode ? 'border-error focus:ring-error/20' : 'border-outline focus:border-primary focus:ring-primary-fixed-dim'} rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.schoolCode && (
                  <p className="text-[11px] text-error mt-0.5 font-medium">{errors.schoolCode.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    {...register('email')}
                    type="email"
                    placeholder="name@school.com"
                    className={`w-full pl-[36px] pr-md py-[10px] bg-surface-container-lowest border ${errors.email ? 'border-error focus:ring-error/20' : 'border-outline focus:border-primary focus:ring-primary-fixed-dim'} rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-error mt-0.5 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-sm py-[10px] px-md bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-on-primary-fixed transition-colors flex items-center justify-center gap-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Nevermind, back to Login
                </Link>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};
