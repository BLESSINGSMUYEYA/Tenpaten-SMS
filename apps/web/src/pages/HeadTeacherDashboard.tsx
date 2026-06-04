import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useApi';

export const HeadTeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Head Teacher';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic Queries
  const { data: staffList, loading: loadingStaff } = useQuery<any[]>('/people/staff');
  const { data: studentList, loading: loadingStudents } = useQuery<any[]>('/people/students');
  const { data: invoiceList, loading: loadingInvoices } = useQuery<any[]>('/finance/invoices');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: attendanceList } = useQuery<any[]>(`/attendance?date=${todayStr}`);

  // Derived Stats
  const totalStudents = studentList ? studentList.length : 0;
  const activeStaff = staffList ? staffList.length : 0;
  
  // Calculate attendance rate
  let attendanceRate = '100%';
  if (attendanceList && attendanceList.length > 0) {
    const presentCount = attendanceList.filter(a => a.status === 'present' || a.status === 'late').length;
    attendanceRate = `${((presentCount / attendanceList.length) * 100).toFixed(1)}%`;
  } else {
    attendanceRate = 'No records';
  }

  // Calculate total revenue from paid payments
  let totalRevenue = 0;
  if (invoiceList) {
    totalRevenue = invoiceList.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  }

  const formattedRevenue = `MK ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-md md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Dashboard Canvas */}
        <div className="py-lg flex flex-col gap-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">Dashboard Overview</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Welcome back, {fullName}. Here is the summary of your institution today.</p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {[
              { label: 'Total Students', value: loadingStudents ? '...' : totalStudents, icon: 'groups', badge: 'Active scholars', badgeColor: 'text-on-surface-variant', to: '/head-teacher/people' },
              { label: 'Active Staff', value: loadingStaff ? '...' : activeStaff, icon: 'badge', badge: 'Optimal capacity', badgeColor: 'text-on-surface-variant', to: '/head-teacher/people' },
              { label: 'Attendance Today', value: attendanceRate, icon: 'how_to_reg', badge: 'Daily check-in', badgeColor: 'text-on-surface-variant', to: '/head-teacher/attendance' },
              { label: 'Revenue Collected', value: loadingInvoices ? '...' : formattedRevenue, icon: 'account_balance_wallet', badge: 'Term 2 fees', badgeColor: 'text-on-surface-variant', to: '/head-teacher/finance' },
            ].map(card => (
              <Link key={card.label} to={card.to} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-md hover:border-primary transition-all">
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{card.label}</span>
                  <div className="p-2 bg-surface-container-low rounded-lg text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-background">{card.value}</span>
                  <span className={`font-label-sm text-label-sm font-medium ${card.badgeColor} flex items-center`}>{card.badge}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Charts & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-title-lg text-title-lg font-semibold text-on-background">Enrollment &amp; Attendance Trend</h3>
                <Link to="/head-teacher/attendance" className="font-label-sm text-label-sm text-primary hover:underline font-medium">View Full Report</Link>
              </div>
              <div className="flex-1 min-h-[240px] relative rounded-lg border border-outline-variant/50 overflow-hidden flex items-end px-4 pb-4 gap-4"
                style={{ backgroundImage: 'linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <div className="w-full flex justify-between items-end h-[200px] gap-2 mt-auto">
                  {[60, 65, 50, 80, 75, 90, 95].map((h, i) => (
                    <div key={i} className="w-full bg-primary-container rounded-t-sm hover:bg-primary transition-colors group relative" style={{ height: `${h}%` }}>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs hidden group-hover:block bg-surface border border-outline text-on-surface px-1.5 py-0.5 rounded shadow font-bold">{h}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts Panel */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-title-lg text-title-lg font-semibold text-on-background">System Alerts</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-medium">1 Active</span>
              </div>
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[240px]">
                <div className="p-4 bg-surface-container-highest border border-outline-variant rounded-lg flex gap-3 items-start">
                  <span className="material-symbols-outlined text-primary text-[20px] shrink-0">info</span>
                  <div>
                    <h4 className="font-label-md text-label-md font-semibold text-on-background">Term 2 Active</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Class schedules and billing are live for Term 2 session.</p>
                  </div>
                </div>
                <div className="p-4 bg-tertiary-container/20 border border-tertiary-container/30 rounded-lg flex gap-3 items-start">
                  <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">warning</span>
                  <div>
                    <h4 className="font-label-md text-label-md font-semibold text-on-background">Fee Invoices Initialized</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Billing invoices generated automatically for all enrolled students.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-title-lg text-title-lg font-semibold text-on-background mb-md">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-lg cards-stagger">
              {[
                { icon: 'person_add', label: 'Enroll Student', to: '/head-teacher/people' },
                { icon: 'badge', label: 'Add Staff', to: '/head-teacher/people' },
                { icon: 'campaign', label: 'Send Broadcast', to: '/head-teacher/announcements/new' },
                { icon: 'summarize', label: 'Generate Report', to: '/head-teacher/academic' },
              ].map(action => (
                <Link key={action.label} to={action.to} className="flex flex-col items-center justify-center gap-sm p-lg bg-surface-container-lowest border border-outline-variant rounded-xl hover:border-primary hover:shadow-sm transition-all group">
                  <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary-container transition-colors">
                    <span className="material-symbols-outlined text-primary group-hover:text-on-primary-container">{action.icon}</span>
                  </div>
                  <span className="font-label-md text-label-md font-semibold text-on-background">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-margin-desktop pt-lg pb-xs text-center border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant opacity-60">
            © 2026 Tenpaten School Management System. All Rights Reserved.
            <span className="mx-2">|</span>
            Academic Session: 2025/2026
          </p>
        </footer>
      </main>

      <BottomNav />
    </>
  );
};

export default HeadTeacherDashboard;
