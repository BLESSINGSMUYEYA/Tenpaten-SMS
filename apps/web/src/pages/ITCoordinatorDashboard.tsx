import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/ITCoordinatorDashboard/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';


export const ITCoordinatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'IT Coordinator';

  const stats = [
    { label: 'Total Devices',     value: 'N/A',  sub: 'No data', icon: 'devices',         color: 'text-tertiary',   bg: 'bg-tertiary-container/30' },
    { label: 'Active Users',      value: 'N/A',  sub: 'No data', icon: 'group',         color: 'text-primary',    bg: 'bg-primary-container/30' },
    { label: 'Open Tickets',      value: '0',    sub: 'No data', icon: 'confirmation_number', color: 'text-error',  bg: 'bg-error-container/30' },
    { label: 'System Uptime',     value: 'N/A',  sub: 'No data', icon: 'trending_up',    color: 'text-secondary',  bg: 'bg-secondary-container/30' },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 bg-surface-bright overflow-y-auto">
          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="dash-page-title mb-1 flex items-center gap-2">
                IT Control Centre
              </h1>
              <p className="font-body-md text-on-surface-variant">
                Welcome, {fullName}. System status: <span className="text-primary font-semibold">All systems operational</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/it-coordinator/users"
                className="flex items-center gap-2 bg-tertiary text-on-tertiary px-4 py-2 rounded-lg font-label-md hover:opacity-90 transition-all active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                Manage Users
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 cards-stagger">
            {stats.map(s => (
              <div
                key={s.label}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-3 hover:border-tertiary/50 transition-all duration-300 shadow-sm group"
              >
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-on-surface-variant uppercase tracking-wider">{s.label}</span>
                  <div className={`p-2 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-[20px] ${s.color}`}>{s.icon}</span>
                  </div>
                </div>
                <div>
                  <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{s.value}</p>
                  <p className="font-label-sm text-on-surface-variant mt-0.5">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

            {/* System Services Status */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <h2 className="font-title-lg text-title-lg font-semibold text-on-surface">Service Health</h2>
                <span className="flex items-center gap-1.5 text-primary font-label-sm text-label-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live Monitor
                </span>
              </div>
              <div className="divide-y divide-outline-variant p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">monitoring</span>
                <p>System monitoring is not yet configured.</p>
              </div>
              <div className="p-4 bg-surface-container-low/50 border-t border-outline-variant">
                <Link to="/it-coordinator/infrastructure" className="font-label-md text-tertiary hover:underline font-medium flex items-center gap-1">
                  View Full Infrastructure
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                <h2 className="font-title-lg text-title-lg font-semibold text-on-surface">Recent Activity</h2>
              </div>
              <div className="flex flex-col divide-y divide-outline-variant p-8 text-center text-on-surface-variant">
                 <span className="material-symbols-outlined text-4xl mb-2 opacity-50">history</span>
                 <p>No recent activity logs available.</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="font-title-lg text-title-lg font-semibold text-on-surface mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 cards-stagger">
              {[
                { icon: 'person_add',    label: 'Create Account',    to: '/it-coordinator/users',          color: 'text-tertiary',   bg: 'bg-tertiary-container/30' },
                { icon: 'lock_reset',    label: 'Reset Password',    to: '/it-coordinator/users',          color: 'text-secondary',  bg: 'bg-secondary-container/30' },
                { icon: 'backup',        label: 'Run Backup',        to: '/it-coordinator/infrastructure', color: 'text-primary',    bg: 'bg-primary-container/30' },
                { icon: 'security',      label: 'Security Audit',    to: '/it-coordinator/security',       color: 'text-error',      bg: 'bg-error-container/30' },
              ].map(a => (
                <Link
                  key={a.label}
                  to={a.to}
                  className={`flex flex-col items-center justify-center gap-3 p-5 bg-surface-container-lowest border border-outline-variant rounded-xl transition-all group relative ${a.label === 'Security Audit' ? 'opacity-70 cursor-not-allowed hover:border-outline-variant' : 'hover:border-tertiary/50 hover:shadow-sm'}`}
                  onClick={(e) => {
                    if (a.label === 'Security Audit') {
                      e.preventDefault();
                    }
                  }}
                >
                  {a.label === 'Security Audit' && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-tertiary/10 text-tertiary text-[8px] font-bold rounded-full uppercase tracking-wider">Soon</span>
                  )}
                  <div className={`w-12 h-12 rounded-full ${a.bg} flex items-center justify-center ${a.label !== 'Security Audit' ? 'group-hover:scale-110' : ''} transition-transform`}>
                    <span className={`material-symbols-outlined ${a.color}`}>{a.icon}</span>
                  </div>
                  <span className="font-label-md text-label-md font-semibold text-on-surface text-center">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <footer className="mt-8 pt-4 pb-2 text-center border-t border-outline-variant">
            <p className="font-label-sm text-on-surface-variant opacity-60">
              © 2026 MyKlasi SMS · IT Coordinator Portal
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ITCoordinatorDashboard;
