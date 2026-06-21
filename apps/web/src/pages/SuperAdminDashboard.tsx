import React, { useState } from 'react';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';
import { useQuery } from '../hooks/useApi';

interface School {
  id: string;
  name: string;
  schoolCode: string;
  subscriptionPlan: string;
  type: string;
  district: string;
  isActive: boolean;
  createdAt: string;
  _count?: { users: number };
}

export const SuperAdminDashboard: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live data from DB
  const { data: schools, loading: schoolsLoading } = useQuery<School[]>('/admin/schools');
  const { data: stats, loading: statsLoading } = useQuery<any>('/admin/stats');

  const allSchools = schools || [];

  // Derive live stats
  const totalSchools = stats?.totalSchools ?? allSchools.length;
  const activeSchools = stats?.activeSchools ?? allSchools.filter(s => s.isActive).length;
  const totalStudents = stats?.totalStudents ?? 0;
  const totalStaff = stats?.totalStaff ?? 0;
  const totalParents = stats?.totalParents ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;

  // Recent signups = last 5 schools ordered by createdAt desc (already sorted)
  const recentSchools = allSchools.slice(0, 5);

  // Build bar chart data from real schools grouped by month (last 6 months)
  const buildMonthlyData = () => {
    const now = new Date();
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const count = allSchools.filter(s => {
        const c = new Date(s.createdAt);
        return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
      }).length;
      months.push({ label, count });
    }
    // Running total for cumulative chart
    let running = allSchools.filter(s => {
      const c = new Date(s.createdAt);
      const cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return c < cutoff;
    }).length;
    return months.map(m => {
      running += m.count;
      return { label: m.label, total: running };
    });
  };

  const monthlyData = buildMonthlyData();
  const maxTotal = Math.max(...monthlyData.map(m => m.total), 1);

  const loading = schoolsLoading || statsLoading;

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-margin-mobile md:px-margin-desktop pt-20 pb-margin-desktop overflow-y-auto bg-surface-bright">
          {/* Page Header */}
          <div className="mb-lg flex flex-col sm:flex-row sm:justify-between sm:items-end gap-md">
            <div>
              <h1 className="dash-page-title mb-xs">Platform Overview</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Live metrics and system health for MyKlasi.</p>
            </div>
            <button className="flex items-center justify-center gap-sm bg-primary text-on-primary px-4 py-2.5 rounded-lg hover:bg-primary-container transition-colors shadow-sm self-start sm:self-auto active:scale-95">
              <span className="material-symbols-outlined text-sm">download</span>
              <span className="font-label-md text-label-md">Export Report</span>
            </button>
          </div>

          {/* Summary Cards — all live from DB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-lg cards-stagger">
            {/* Total Schools */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-default relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-fixed-dim rounded-bl-full opacity-20 -z-0 group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start mb-lg relative z-10">
                <h3 className="font-label-md text-label-md text-on-surface-variant font-medium">Total Schools</h3>
                <span className="material-symbols-outlined text-primary">domain</span>
              </div>
              <div className="relative z-10">
                <p className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  {loading ? '…' : totalSchools}
                </p>
                <p className="font-label-sm text-label-sm text-secondary flex items-center gap-1 mt-1 font-medium">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  {loading ? '…' : activeSchools} active
                </p>
              </div>
            </div>

            {/* Total Students */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-default relative overflow-hidden group shadow-sm">
              <div className="flex justify-between items-start mb-lg relative z-10">
                <h3 className="font-label-md text-label-md text-on-surface-variant font-medium">Total Students</h3>
                <span className="material-symbols-outlined text-primary">groups</span>
              </div>
              <div className="relative z-10">
                <p className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  {loading ? '…' : totalStudents.toLocaleString()}
                </p>
                <p className="font-label-sm text-label-sm text-secondary flex items-center gap-1 mt-1 font-medium">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  Across all schools
                </p>
              </div>
            </div>

            {/* Total Staff */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-default relative overflow-hidden group shadow-sm">
              <div className="flex justify-between items-start mb-lg relative z-10">
                <h3 className="font-label-md text-label-md text-on-surface-variant font-medium">Teaching Staff</h3>
                <span className="material-symbols-outlined text-primary">supervisor_account</span>
              </div>
              <div className="relative z-10">
                <p className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  {loading ? '…' : totalStaff.toLocaleString()}
                </p>
                <p className="font-label-sm text-label-sm text-secondary flex items-center gap-1 mt-1 font-medium">
                  <span className="material-symbols-outlined text-[16px]">school</span>
                  Teachers & Admin
                </p>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-default relative overflow-hidden group shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low to-surface-container-lowest opacity-40 -z-10"></div>
              <div className="flex justify-between items-start mb-lg relative z-10">
                <h3 className="font-label-md text-label-md text-on-surface-variant font-medium">System Health</h3>
                <span className="material-symbols-outlined text-secondary">check_circle</span>
              </div>
              <div className="relative z-10">
                <p className="font-headline-lg text-headline-lg text-on-surface font-bold">Online</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 font-medium">
                  {totalUsers} platform accounts
                </p>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Live School Growth Chart */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low rounded-t-xl">
                <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">School Growth Trend</h2>
                <span className="text-xs text-on-surface-variant font-medium">Last 6 months · Live data</span>
              </div>
              <div className="p-md flex-1 min-h-[300px] flex items-end justify-between gap-4 relative">
                {/* Chart Grid Lines */}
                <div className="absolute inset-x-md top-md bottom-md flex flex-col justify-between z-0 border-l border-b border-outline-variant">
                  <div className="w-full border-t border-outline-variant opacity-30 h-0"></div>
                  <div className="w-full border-t border-outline-variant opacity-30 h-0"></div>
                  <div className="w-full border-t border-outline-variant opacity-30 h-0"></div>
                  <div className="w-full border-t border-outline-variant opacity-30 h-0"></div>
                </div>
                {/* Live Chart Bars */}
                {monthlyData.map((m, i) => {
                  const heightPct = maxTotal > 0 ? Math.max(4, (m.total / maxTotal) * 100) : 4;
                  const isLatest = i === monthlyData.length - 1;
                  return (
                    <div
                      key={m.label}
                      style={{ height: `${heightPct}%` }}
                      className={`w-1/6 ${isLatest ? 'bg-primary' : 'bg-primary-fixed'} hover:bg-primary-container transition-all duration-300 rounded-t relative z-10 group cursor-pointer`}
                    >
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none whitespace-nowrap">
                        {m.total} School{m.total !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-md pb-md flex justify-between text-on-surface-variant font-label-sm text-label-sm relative z-10">
                {monthlyData.map(m => <span key={m.label}>{m.label}</span>)}
              </div>
            </div>

            {/* System Alerts panel — kept as static operational notices */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low rounded-t-xl">
                <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Platform Status</h2>
                <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">Operational</span>
              </div>
              <div className="p-md flex-grow flex flex-col gap-sm overflow-y-auto max-h-[340px]">
                <div className="p-sm border border-outline-variant rounded-lg bg-surface flex gap-sm items-start border-l-4 border-l-secondary">
                  <span className="material-symbols-outlined text-secondary shrink-0">check_circle</span>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-semibold">All Systems Normal</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">API, database, and email services are running normally.</p>
                    <span className="font-label-sm text-label-sm text-outline mt-1 block text-[10px]">Now</span>
                  </div>
                </div>
                <div className="p-sm border border-outline-variant rounded-lg bg-surface flex gap-sm items-start border-l-4 border-l-primary-fixed">
                  <span className="material-symbols-outlined text-primary shrink-0">domain</span>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-semibold">{totalSchools} Schools Registered</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{activeSchools} active · {totalSchools - activeSchools} inactive.</p>
                    <span className="font-label-sm text-label-sm text-outline mt-1 block text-[10px]">Live</span>
                  </div>
                </div>
                <div className="p-sm border border-outline-variant rounded-lg bg-surface flex gap-sm items-start border-l-4 border-l-tertiary">
                  <span className="material-symbols-outlined text-tertiary shrink-0">groups</span>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-semibold">{totalUsers} Platform Accounts</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{totalStudents} students · {totalStaff} staff · {totalParents} parents.</p>
                    <span className="font-label-sm text-label-sm text-outline mt-1 block text-[10px]">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent School Signups — live from DB */}
          <div className="mt-gutter bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Recent School Signups</h2>
              <span className="text-xs text-on-surface-variant">Showing {recentSchools.length} most recent</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant">
                    <th className="font-label-md text-label-md text-on-surface-variant p-md pl-md font-semibold">School Name</th>
                    <th className="font-label-md text-label-md text-on-surface-variant p-md font-semibold">Code</th>
                    <th className="font-label-md text-label-md text-on-surface-variant p-md font-semibold">District</th>
                    <th className="font-label-md text-label-md text-on-surface-variant p-md font-semibold">Plan</th>
                    <th className="font-label-md text-label-md text-on-surface-variant p-md font-semibold">Registered</th>
                    <th className="font-label-md text-label-md text-on-surface-variant p-md pr-md text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-md text-center text-on-surface-variant text-sm py-10">Loading schools…</td>
                    </tr>
                  ) : recentSchools.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-md text-center text-on-surface-variant text-sm py-10">No schools registered yet.</td>
                    </tr>
                  ) : recentSchools.map((s, i) => (
                    <tr key={s.id} className={`border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors ${i % 2 === 0 ? 'bg-surface-bright' : ''}`}>
                      <td className="p-md pl-md font-semibold text-primary">{s.name}</td>
                      <td className="p-md text-on-surface-variant font-mono text-xs">{s.schoolCode}</td>
                      <td className="p-md text-on-surface-variant">{s.district}</td>
                      <td className="p-md capitalize">{s.subscriptionPlan}</td>
                      <td className="p-md text-on-surface-variant text-xs">
                        {new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-md pr-md text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold text-[10px] ${s.isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-secondary' : 'bg-outline'}`}></span>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
