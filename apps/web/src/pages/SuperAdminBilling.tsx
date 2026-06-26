import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';
import { useQuery } from '../hooks/useApi';

interface School {
  id: string;
  name: string;
  schoolCode: string;
  subscriptionPlan: string;
  district: string;
  isActive: boolean;
  createdAt: string;
}

// Mock enrichment data
const expiryDays = (i: number) => [180, 25, 7, 90, 3, 60, 14][i % 7];
const planFee: Record<string, number> = { free: 0, basic: 15000, premium: 35000, enterprise: 75000 };

const urgencyColor = (days: number) => {
  if (days <= 7)  return 'bg-error-container text-on-error-container';
  if (days <= 30) return 'bg-secondary-container text-on-secondary-container';
  return 'bg-primary-container text-on-primary-container';
};

export const SuperAdminBilling: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterPlan, setFilterPlan] = useState('All');
  const [search, setSearch] = useState('');

  const { data: schools, loading } = useQuery<School[]>('/admin/schools');

  const enriched = (schools ?? []).map((s, i) => ({
    ...s,
    daysLeft: expiryDays(i),
    fee: planFee[s.subscriptionPlan] ?? 0,
  }));

  const filtered = enriched
    .filter(s => filterPlan === 'All' || s.subscriptionPlan === filterPlan.toLowerCase())
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.schoolCode.toLowerCase().includes(search.toLowerCase()));

  const totalMRR = enriched.reduce((sum, s) => sum + (s.fee / 3), 0);
  const totalARR = enriched.reduce((sum, s) => sum + s.fee, 0);
  const expiringSoon = enriched.filter(s => s.daysLeft <= 30).length;
  const activeCount = enriched.filter(s => s.isActive).length;

  const planCounts = ['free', 'basic', 'premium', 'enterprise'].map(p => ({
    plan: p, count: enriched.filter(s => s.subscriptionPlan === p).length,
  }));
  const maxPlanCount = Math.max(...planCounts.map(p => p.count), 1);

  const planColors: Record<string, string> = {
    free: 'bg-surface-container-high',
    basic: 'bg-secondary',
    premium: 'bg-primary',
    enterprise: 'bg-tertiary',
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 overflow-y-auto bg-surface-bright">
          <div className="mb-6">
            <h1 className="dash-page-title mb-1">Subscription & Billing</h1>
            <p className="font-body-md text-on-surface-variant">Manage school plans, renewals, and platform revenue.</p>
          </div>

          {/* Revenue KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Monthly Revenue (MRR)', value: `MK ${Math.round(totalMRR).toLocaleString()}`,  icon: 'trending_up',       color: 'text-primary' },
              { label: 'Annual Revenue (ARR)',  value: `MK ${totalARR.toLocaleString()}`,              icon: 'account_balance',   color: 'text-secondary' },
              { label: 'Active Schools',        value: activeCount,                                    icon: 'verified',          color: 'text-tertiary' },
              { label: 'Expiring ≤ 30 Days',   value: expiringSoon,                                   icon: 'event',             color: expiringSoon > 0 ? 'text-error' : 'text-primary' },
            ].map(c => (
              <div key={c.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-label-sm text-on-surface-variant text-xs">{c.label}</span>
                  <span className={`material-symbols-outlined text-[20px] ${c.color}`}>{c.icon}</span>
                </div>
                <p className="font-headline-sm font-bold text-on-surface">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Plan distribution chart */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                <h2 className="font-title-md font-semibold text-on-surface">Plan Distribution</h2>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {planCounts.map(p => (
                  <div key={p.plan}>
                    <div className="flex justify-between mb-1">
                      <span className="font-label-md text-on-surface capitalize font-semibold">{p.plan}</span>
                      <span className="font-label-sm text-on-surface-variant">{p.count} schools</span>
                    </div>
                    <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${planColors[p.plan]} transition-all duration-700`}
                        style={{ width: `${(p.count / maxPlanCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiring soon alert */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">event</span>
                <h2 className="font-title-md font-semibold text-on-surface">Expiring Soon</h2>
                {expiringSoon > 0 && (
                  <span className="ml-auto bg-error-container text-on-error-container font-label-sm text-[11px] px-2 py-0.5 rounded-full font-bold">
                    {expiringSoon} schools
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2 max-h-48 overflow-y-auto">
                {loading ? (
                  <p className="text-on-surface-variant text-sm">Loading…</p>
                ) : enriched.filter(s => s.daysLeft <= 30).length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] text-primary">check_circle</span>
                    <p className="font-body-sm">No schools expiring in the next 30 days.</p>
                  </div>
                ) : enriched.filter(s => s.daysLeft <= 30).map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-3 bg-surface-container-low border border-outline-variant rounded-xl">
                    <div>
                      <p className="font-label-md text-on-surface font-semibold">{s.name}</p>
                      <p className="font-body-sm text-on-surface-variant capitalize">{s.subscriptionPlan} · {s.district}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${urgencyColor(s.daysLeft)}`}>
                        {s.daysLeft}d left
                      </span>
                      <Link
                        to={`/super-admin/schools/${s.id}`}
                        className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full billing table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-title-md font-semibold text-on-surface">All Schools — Billing Overview</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-outline">search</span>
                  <input
                    className="pl-8 pr-4 py-1.5 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:border-primary w-48"
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-1.5 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
                  value={filterPlan}
                  onChange={e => setFilterPlan(e.target.value)}
                >
                  {['All', 'Free', 'Basic', 'Premium', 'Enterprise'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface">
                    {['School', 'Code', 'Plan', 'District', 'Fee/Term', 'Expires In', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 font-label-sm text-on-surface-variant text-xs font-semibold uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="py-12 text-center text-on-surface-variant text-sm">Loading…</td></tr>
                  ) : filtered.map((s, i) => (
                    <tr key={i} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-3 font-label-md text-primary font-semibold">{s.name}</td>
                      <td className="px-4 py-3 font-mono text-on-surface-variant text-xs">{s.schoolCode}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 bg-primary-container text-on-primary-container rounded-full font-label-sm text-[11px] font-bold capitalize">
                          {s.subscriptionPlan}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-body-sm text-on-surface-variant">{s.district}</td>
                      <td className="px-4 py-3 font-label-md font-semibold text-on-surface">
                        {s.fee === 0 ? 'Free' : `MK ${s.fee.toLocaleString()}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${urgencyColor(s.daysLeft)}`}>
                          {s.daysLeft}d
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${s.isActive ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                          {s.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/super-admin/schools/${s.id}`} className="flex items-center gap-1 text-primary hover:underline font-label-sm text-xs font-semibold">
                          View <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filtered.length === 0 && (
                <div className="py-12 text-center text-on-surface-variant text-sm">No schools matched.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminBilling;
