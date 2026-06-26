import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/SchoolDirectorDashboard/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';

const kpiCards = [
  { label: 'Total Students',    value: '1,248', change: '+24 this term', icon: 'groups',          positive: true  },
  { label: 'Teaching Staff',    value: '84',    change: '4 vacancies',   icon: 'badge',           positive: false },
  { label: 'Revenue Collected', value: 'MK 4.2M', change: '76% of target', icon: 'account_balance_wallet', positive: true },
  { label: 'Avg. Pass Rate',    value: '87.3%', change: '+2.1% vs last term', icon: 'grade',      positive: true  },
];

const quickActions = [
  { icon: 'tune',           label: 'Institution Setup', to: '/school-director/setup',    color: 'text-primary',   bg: 'bg-primary-container/30' },
  { icon: 'bar_chart',      label: 'View Reports',      to: '/school-director/reports',  color: 'text-tertiary',  bg: 'bg-tertiary-container/30' },
  { icon: 'badge',          label: 'Staff & HR',        to: '/school-director/staff',    color: 'text-secondary', bg: 'bg-secondary-container/30' },
  { icon: 'account_balance',label: 'Finance',           to: '/school-director/finance',  color: 'text-on-surface-variant', bg: 'bg-surface-container' },
];

const recentAlerts = [
  { title: 'Term 2 Exams Starting',    desc: 'Examination week begins 30th June. Timetable is ready.',  icon: 'event',       level: 'info' },
  { title: 'Staff Meeting Scheduled',  desc: 'All-staff briefing on Friday at 10:00 AM in the hall.',   icon: 'groups',      level: 'info' },
  { title: 'Low Fee Collection',       desc: 'Grade 8 has only 54% fee payment rate this term.',        icon: 'warning',     level: 'warning' },
  { title: 'New Student Enrollments',  desc: '12 new students registered. Approval needed.',            icon: 'person_add',  level: 'action' },
];

const alertStyles: Record<string, string> = {
  info:    'border-l-primary bg-primary-container/10 text-primary',
  warning: 'border-l-secondary bg-secondary-container/10 text-secondary',
  action:  'border-l-tertiary bg-tertiary-container/10 text-tertiary',
};

export const SchoolDirectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Director';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 bg-surface-bright overflow-y-auto">

          {/* Hero banner */}
          <div className="mb-6 rounded-2xl overflow-hidden relative bg-gradient-to-br from-primary to-primary-container border border-primary/20 shadow-lg">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
            <div className="relative z-10 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-label-md text-on-primary/70 mb-1">{today}</p>
                <h1 className="font-headline-md text-headline-md font-bold text-on-primary mb-1">Good morning, {fullName}</h1>
                <p className="font-body-md text-on-primary/80">Here is your executive overview for today.</p>
              </div>
              <Link
                to="/school-director/setup"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-on-primary px-5 py-2.5 rounded-xl font-label-md font-semibold backdrop-blur-sm border border-white/30 transition-all active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Institution Setup
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 cards-stagger">
            {kpiCards.map(k => (
              <div key={k.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-3 hover:border-primary/40 transition-all duration-300 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-on-surface-variant uppercase tracking-wider">{k.label}</span>
                  <div className="p-2 bg-primary-container/30 rounded-lg">
                    <span className="material-symbols-outlined text-[20px] text-primary">{k.icon}</span>
                  </div>
                </div>
                <div>
                  <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{k.value}</p>
                  <p className={`font-label-sm mt-0.5 flex items-center gap-1 ${k.positive ? 'text-primary' : 'text-error'}`}>
                    <span className="material-symbols-outlined text-[14px]">{k.positive ? 'trending_up' : 'trending_down'}</span>
                    {k.change}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

            {/* Alerts panel */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <h2 className="font-title-lg text-title-lg font-semibold text-on-surface">Director's Notices</h2>
                <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">
                  {recentAlerts.length} items
                </span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {recentAlerts.map((a, i) => (
                  <div
                    key={i}
                    className={`p-4 border-l-4 rounded-lg flex items-start gap-3 ${alertStyles[a.level]}`}
                  >
                    <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">{a.icon}</span>
                    <div>
                      <p className="font-label-md font-semibold text-on-surface">{a.title}</p>
                      <p className="font-body-sm text-on-surface-variant mt-0.5">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                <h2 className="font-title-lg text-title-lg font-semibold text-on-surface">Quick Actions</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {quickActions.map(a => (
                  <Link
                    key={a.label}
                    to={a.to}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-container-low border border-outline-variant rounded-xl hover:border-primary/40 hover:shadow-sm transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-full ${a.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className={`material-symbols-outlined text-[20px] ${a.color}`}>{a.icon}</span>
                    </div>
                    <span className="font-label-sm text-on-surface font-semibold text-center leading-tight">{a.label}</span>
                  </Link>
                ))}
              </div>

              {/* Setup progress */}
              <div className="px-4 pb-4">
                <div className="p-3 bg-primary-container/20 rounded-xl border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-sm text-on-surface font-semibold">Setup Progress</span>
                    <span className="font-label-sm text-primary font-bold">0%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '0%' }} />
                  </div>
                  <Link to="/school-director/setup" className="font-label-sm text-primary hover:underline font-medium flex items-center gap-1">
                    Complete Institution Setup
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-6 pt-4 pb-2 text-center border-t border-outline-variant">
            <p className="font-label-sm text-on-surface-variant opacity-60">
              © 2026 MyKlasi SMS · School Director Portal
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default SchoolDirectorDashboard;
