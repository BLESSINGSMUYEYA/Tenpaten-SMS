import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { changePasswordSchema, type ChangePasswordInput } from '@tenpaten/shared';
import { getRoleHomePath } from '../../components/RouteGuards';
import { Key, AlertTriangle } from 'lucide-react';
import { Logo } from '../../components/Logo';

export const ChangePasswordPage: React.FC = () => {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await changePassword(data);
      // Success! Navigate user to their respective home dashboard
      if (user) {
        navigate(getRoleHomePath(user.role), { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password. Please check your current password.');
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
          <div className="flex items-center gap-xs bg-error-container/60 border border-error/20 text-on-error-container px-md py-xs rounded-full">
            <AlertTriangle className="w-4 h-4 text-error animate-pulse shrink-0" />
            <span className="font-label-sm text-label-sm font-semibold">Password Change Required</span>
          </div>
        </header>

        <div className="text-center">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Update Password</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs leading-relaxed">
            This is your first login. To secure your account, you are required to change your temporary password before proceeding.
          </p>
        </div>

        {errorMsg && (
          <div className="p-sm bg-error-container border border-error/20 text-on-error-container font-body-sm text-body-sm rounded-lg flex items-start gap-sm">
            <span className="material-symbols-outlined text-error shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">

          {/* Current Password */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="currentPassword">
              Current Temporary Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                <Key className="w-4 h-4" />
              </div>
              <input
                id="currentPassword"
                {...register('currentPassword')}
                type="password"
                placeholder="Enter temporary password"
                className={`w-full pl-[36px] pr-md py-[10px] bg-surface-container-lowest border ${errors.currentPassword ? 'border-error focus:ring-error/20' : 'border-outline focus:border-primary focus:ring-primary-fixed-dim'} rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            {errors.currentPassword && (
              <p className="text-[11px] text-error mt-0.5 font-medium">{errors.currentPassword.message}</p>
            )}
          </div>

          <hr className="border-outline-variant" />

          {/* New Password */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="newPassword">
              New Secure Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                <Key className="w-4 h-4" />
              </div>
              <input
                id="newPassword"
                {...register('newPassword')}
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className={`w-full pl-[36px] pr-md py-[10px] bg-surface-container-lowest border ${errors.newPassword ? 'border-error focus:ring-error/20' : 'border-outline focus:border-primary focus:ring-primary-fixed-dim'} rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            {errors.newPassword && (
              <p className="text-[11px] text-error mt-0.5 font-medium">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                <Key className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                {...register('confirmPassword')}
                type="password"
                placeholder="Re-enter new password"
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
              <>
                <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                Secure &amp; Update Password
              </>
            )}
          </button>
        </form>

      </main>
    </div>
  );
};
