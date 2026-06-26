import React, { useState } from 'react';
import { Sidebar } from '../components/ITCoordinatorDashboard/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';

export const ITCoordinatorSettings: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [twoFactor, setTwoFactor] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState('90');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState('daily');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 bg-surface-bright overflow-y-auto">
          <div className="mb-6">
            <h1 className="dash-page-title mb-1">System Settings</h1>
            <p className="font-body-md text-on-surface-variant">Configure security, backup, and system preferences.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">

            {/* Security Settings */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">security</span>
                <h2 className="font-title-md font-semibold text-on-surface">Security Settings</h2>
              </div>
              <div className="p-5 flex flex-col gap-5">
                {/* 2FA toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-on-surface font-semibold">Two-Factor Authentication</p>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">Require 2FA for admin accounts</p>
                  </div>
                  <button
                    onClick={() => setTwoFactor(v => !v)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${twoFactor ? 'bg-tertiary' : 'bg-surface-container-highest'}`}
                    role="switch"
                    aria-checked={twoFactor}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${twoFactor ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Session timeout */}
                <div>
                  <label className="font-label-md text-on-surface font-semibold block mb-1.5">Session Timeout</label>
                  <p className="font-body-sm text-on-surface-variant mb-2">Auto-logout after inactivity</p>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-tertiary/40 transition"
                    value={sessionTimeout}
                    onChange={e => setSessionTimeout(e.target.value)}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                {/* Password expiry */}
                <div>
                  <label className="font-label-md text-on-surface font-semibold block mb-1.5">Password Expiry</label>
                  <p className="font-body-sm text-on-surface-variant mb-2">Force password reset after N days</p>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-tertiary/40 transition"
                    value={passwordExpiry}
                    onChange={e => setPasswordExpiry(e.target.value)}
                  >
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Backup & Notifications */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">backup</span>
                <h2 className="font-title-md font-semibold text-on-surface">Backup & Notifications</h2>
              </div>
              <div className="p-5 flex flex-col gap-5">
                {/* Email alerts toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-on-surface font-semibold">Email Alerts</p>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">Receive security alerts via email</p>
                  </div>
                  <button
                    onClick={() => setEmailAlerts(v => !v)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${emailAlerts ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    role="switch"
                    aria-checked={emailAlerts}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${emailAlerts ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Backup schedule */}
                <div>
                  <label className="font-label-md text-on-surface font-semibold block mb-1.5">Automated Backup Schedule</label>
                  <p className="font-body-sm text-on-surface-variant mb-2">System-wide database backup frequency</p>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    value={backupSchedule}
                    onChange={e => setBackupSchedule(e.target.value)}
                  >
                    <option value="hourly">Every hour</option>
                    <option value="daily">Daily (midnight)</option>
                    <option value="weekly">Weekly (Sunday)</option>
                  </select>
                </div>

                {/* Manual backup */}
                <div>
                  <p className="font-label-md text-on-surface font-semibold mb-1.5">Manual Backup</p>
                  <p className="font-body-sm text-on-surface-variant mb-3">Last backup: Today at 00:00 AM · 124 MB</p>
                  <button className="flex items-center gap-2 bg-surface-container-low border border-outline-variant text-on-surface px-4 py-2.5 rounded-lg font-label-md hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-primary">backup</span>
                    Run Backup Now
                  </button>
                </div>
              </div>
            </div>

            {/* Save button row */}
            <div className="lg:col-span-2 flex justify-end">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-label-md font-semibold transition-all active:scale-95 shadow-sm ${
                  saved
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-tertiary text-on-tertiary hover:opacity-90'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{saved ? 'check_circle' : 'save'}</span>
                {saved ? 'Settings Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ITCoordinatorSettings;
