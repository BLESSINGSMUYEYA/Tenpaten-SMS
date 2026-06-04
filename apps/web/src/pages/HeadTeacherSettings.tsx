import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';

export const HeadTeacherSettings: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Head Teacher';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States for toggles/inputs
  const [schoolName, setSchoolName] = useState('Tenpaten Private Secondary School');
  const [email, setEmail] = useState(user?.email || 'headteacher@tenpaten.com');
  const [termStart, setTermStart] = useState('2026-05-11');
  const [termEnd, setTermEnd] = useState('2026-08-07');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-4 md:px-8 min-h-screen bg-surface text-on-surface transition-colors">
        {/* Page Header */}
        <div className="py-6">
          <nav className="flex gap-2 text-label-sm text-outline mb-2">
            <span className="hover:text-primary cursor-pointer">Home</span>
            <span>/</span>
            <span className="text-primary font-bold">Settings</span>
          </nav>
          <h1 className="font-headline-xl text-headline-xl text-primary">Settings</h1>
          <p className="font-body-md text-on-surface-variant">Update institution profiles and admin preferences here, {fullName}.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Center Grid - General Config */}
          <div className="lg:col-span-2 space-y-6">
            {/* School Profile */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-on-background text-base mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">school</span> School Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Institution Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Term Start Date</label>
                    <input
                      type="date"
                      value={termStart}
                      onChange={e => setTermStart(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Term End Date</label>
                    <input
                      type="date"
                      value={termEnd}
                      onChange={e => setTermEnd(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-on-background text-base mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">manage_accounts</span> Account Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container bg-opacity-50 text-outline text-sm outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preferences */}
          <div className="space-y-6">
            {/* System Notifications */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-on-background text-base mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications_active</span> Alert Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">Email Bulletins</h4>
                    <p className="text-xs text-on-surface-variant">Send system status and report card notices</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={e => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary-container"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant pt-4">
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">SMS broadcasts</h4>
                    <p className="text-xs text-on-surface-variant">Send direct SMS push texts to parents</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={e => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary-container"
                  />
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm text-center">
              <p className="text-xs text-on-surface-variant mb-4">Ensure all your configuration settings are validated before saving.</p>
              <div className="flex flex-col gap-2">
                <button className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all text-sm">
                  Save All Changes
                </button>
                <button className="w-full py-3 bg-surface-container border border-outline-variant text-outline hover:text-on-surface rounded-lg font-bold transition-all text-sm">
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 pt-6 pb-2 text-center border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant opacity-60">© 2026 Tenpaten School Management System. Academic Session: 2025/2026</p>
        </footer>
      </main>
      <BottomNav />
    </>
  );
};

export default HeadTeacherSettings;
