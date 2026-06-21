import React, { useState } from 'react';
import { Header } from '../components/BursarDashboard/Header';
import { Sidebar } from '../components/BursarDashboard/Sidebar';
import { BottomNav } from '../components/BursarDashboard/BottomNav';
import { useAuth } from '../contexts/AuthContext';

export const BursarSettings: React.FC = () => {
  const { user, changePassword } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setSuccessMsg('Your account password was updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-md md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        <div className="py-lg flex flex-col gap-lg animate-fade-in max-w-2xl">
          <div>
            <h1 className="dash-page-title">Account Settings</h1>
            <p className="font-body-md text-on-surface-variant mt-1">Configure profile security options and password updates.</p>
          </div>

          {/* Profile Overview Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col gap-md">
            <h3 className="font-title-lg text-title-lg font-semibold text-on-background">Profile Metadata</h3>
            <div className="flex gap-md items-center border-b border-outline-variant/40 pb-md">
              <div className="w-14 h-14 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xl uppercase">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div>
                <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
                  {user?.firstName} {user?.lastName}
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant capitalize">{user?.role} Account</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md text-body-md text-on-surface-variant">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface block">Email Address</span>
                {user?.email}
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface block">Phone Number</span>
                {user?.phone || 'Not Registered'}
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h3 className="font-title-lg text-title-lg font-semibold text-on-background mb-md">Update Credentials</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              {errorMsg && (
                <div className="p-sm bg-error-container border border-error/25 text-on-error-container text-body-sm rounded-lg flex gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-sm bg-primary-container border border-primary/25 text-on-primary-container text-body-sm rounded-lg flex gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0">check_circle</span>
                  {successMsg}
                </div>
              )}

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex justify-end pt-sm border-t border-outline-variant/60 mt-sm">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-[10px] px-md bg-primary text-on-primary hover:bg-opacity-90 font-label-md text-label-md rounded-lg flex items-center gap-xs disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
};
export default BursarSettings;
