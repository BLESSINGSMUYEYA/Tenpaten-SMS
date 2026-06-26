import React, { useState } from 'react';
import { Sidebar } from '../components/SchoolDirectorDashboard/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';

export const SchoolDirectorSettings: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifyParents, setNotifyParents] = useState(true);
  const [notifyStaff, setNotifyStaff] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [reportFrequency, setReportFrequency] = useState('weekly');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Africa/Blantyre');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; color?: string }> = ({ value, onChange, color = 'bg-primary' }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-colors relative ${value ? color : 'bg-surface-container-highest'}`}
      role="switch"
      aria-checked={value}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 bg-surface-bright overflow-y-auto">
          <div className="mb-6">
            <h1 className="dash-page-title mb-1">Director Settings</h1>
            <p className="font-body-md text-on-surface-variant">Manage your preferences, notifications, and institutional configuration.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">

            {/* Notification Preferences */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
                <h2 className="font-title-md font-semibold text-on-surface">Notification Preferences</h2>
              </div>
              <div className="p-5 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-on-surface font-semibold">Notify Parents</p>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">Send automatic updates to parents</p>
                  </div>
                  <Toggle value={notifyParents} onChange={setNotifyParents} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-on-surface font-semibold">Staff Announcements</p>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">Broadcast notices to all staff</p>
                  </div>
                  <Toggle value={notifyStaff} onChange={setNotifyStaff} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-on-surface font-semibold">Public School Profile</p>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">Allow school to appear in public listings</p>
                  </div>
                  <Toggle value={publicProfile} onChange={setPublicProfile} color="bg-secondary" />
                </div>
              </div>
            </div>

            {/* Regional & Language */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">language</span>
                <h2 className="font-title-md font-semibold text-on-surface">Regional Settings</h2>
              </div>
              <div className="p-5 flex flex-col gap-5">
                <div>
                  <label className="font-label-md text-on-surface font-semibold block mb-1.5">System Language</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="ny">Chichewa (Nyanja)</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-on-surface font-semibold block mb-1.5">Timezone</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                  >
                    <option value="Africa/Blantyre">Africa/Blantyre (CAT, UTC+2)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-on-surface font-semibold block mb-1.5">Executive Report Frequency</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    value={reportFrequency}
                    onChange={e => setReportFrequency(e.target.value)}
                  >
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Summary</option>
                    <option value="monthly">Monthly Report</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-error/20 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-error/20 bg-error-container/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                <h2 className="font-title-md font-semibold text-error">Danger Zone</h2>
              </div>
              <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-label-md text-on-surface font-semibold">Reset Institution Setup</p>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">This will clear all setup data and require re-configuration.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-error/30 text-error hover:bg-error-container/20 transition-colors font-label-md font-semibold shrink-0">
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  Reset Setup
                </button>
              </div>
            </div>

            {/* Save */}
            <div className="lg:col-span-2 flex justify-end">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-label-md font-semibold transition-all active:scale-95 shadow-sm ${
                  saved
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-primary text-on-primary hover:opacity-90'
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

export default SchoolDirectorSettings;
