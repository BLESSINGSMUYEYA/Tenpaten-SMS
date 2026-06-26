import React, { useState } from 'react';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';
import { useQuery } from '../hooks/useApi';

interface School { id: string; name: string; district: string; isActive: boolean; _count?: { users: number } }

const districts = ['Lilongwe', 'Blantyre', 'Zomba', 'Mzimba', 'Kasungu', 'Mangochi', 'Dedza', 'Other'];
const getDistrictCount = (schools: School[], d: string) =>
  schools.filter(s => s.district === d || (d === 'Other' && !districts.slice(0, -1).includes(s.district))).length;

const monthlyGrowth = [3, 5, 4, 7, 6, 8, 9, 7, 11, 10, 12, 14];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const maxGrowth = Math.max(...monthlyGrowth);

const mockHealth = [
  { name: 'St. Francis Primary', score: 94, district: 'Lilongwe',  trend: 'up' },
  { name: 'Kamuzu Academy',      score: 91, district: 'Kasungu',   trend: 'up' },
  { name: 'Zomba Catholic Sec.', score: 88, district: 'Zomba',     trend: 'stable' },
  { name: 'Likuni Boys School',  score: 85, district: 'Lilongwe',  trend: 'up' },
  { name: 'Chichiri Sec. School',score: 82, district: 'Blantyre',  trend: 'stable' },
];

const mockAttention = [
  { name: 'Nkhotakota Primary',  score: 28, district: 'Nkhotakota', reason: 'Setup incomplete, no logins in 14 days' },
  { name: 'Nsanje Sec. School',  score: 35, district: 'Nsanje',     reason: 'Low fee collection, 2 active users only' },
  { name: 'Phalombe Community',  score: 42, district: 'Phalombe',   reason: 'Subscription expiring in 5 days' },
];

export const SuperAdminAnalytics: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: schools, loading } = useQuery<School[]>('/admin/schools');

  const total = schools?.length ?? 0;
  const active = schools?.filter(s => s.isActive).length ?? 0;
  const maxDistrict = Math.max(...districts.map(d => getDistrictCount(schools ?? [], d)), 1);

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 overflow-y-auto bg-surface-bright">
          <div className="mb-6">
            <h1 className="dash-page-title mb-1">Platform Analytics</h1>
            <p className="font-body-md text-on-surface-variant">In-depth platform metrics, growth trends, and school health across Malawi.</p>
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Schools',    value: loading ? '…' : total,                               icon: 'domain',      color: 'text-primary' },
              { label: 'Active Schools',   value: loading ? '…' : active,                              icon: 'verified',    color: 'text-secondary' },
              { label: 'Platform Users',   value: loading ? '…' : (schools?.reduce((a, s) => a + (s._count?.users ?? 0), 0) ?? 0), icon: 'group', color: 'text-tertiary' },
              { label: 'Avg Health Score', value: '72 / 100',                                         icon: 'favorite',    color: 'text-primary' },
            ].map(c => (
              <div key={c.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-label-sm text-on-surface-variant text-xs uppercase tracking-wider">{c.label}</span>
                  <span className={`material-symbols-outlined text-[20px] ${c.color}`}>{c.icon}</span>
                </div>
                <p className="font-headline-sm font-bold text-on-surface text-2xl">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly school registration growth */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                <h2 className="font-title-md font-semibold text-on-surface">School Registrations — 2025/26</h2>
              </div>
              <div className="p-5">
                <div className="flex items-end gap-2 h-44">
                  {monthlyGrowth.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="font-label-sm text-primary font-bold text-[10px]">{v}</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-container hover:opacity-80 transition-all"
                        style={{ height: `${(v / maxGrowth) * 100}%` }}
                      />
                      <span className="font-label-sm text-on-surface-variant text-[9px]">{months[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* District distribution */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                <h2 className="font-title-md font-semibold text-on-surface">Schools by District</h2>
              </div>
              <div className="p-5 flex flex-col gap-3">
                {loading ? (
                  <p className="text-on-surface-variant text-sm">Loading…</p>
                ) : districts.map(d => {
                  const count = getDistrictCount(schools ?? [], d);
                  return (
                    <div key={d} className="flex items-center gap-3">
                      <span className="font-label-sm text-on-surface w-28 shrink-0 font-medium">{d}</span>
                      <div className="flex-1 h-2.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-secondary to-secondary-container rounded-full transition-all duration-700"
                          style={{ width: count === 0 ? '2px' : `${(count / maxDistrict) * 100}%` }}
                        />
                      </div>
                      <span className="font-label-sm text-on-surface-variant w-6 text-right shrink-0">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top performing schools */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">emoji_events</span>
                <h2 className="font-title-md font-semibold text-on-surface">Top Performing Schools</h2>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {mockHealth.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-on-surface font-semibold truncate">{s.name}</p>
                      <p className="font-body-sm text-on-surface-variant text-[11px]">{s.district}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${s.score}%` }} />
                      </div>
                      <span className="font-label-sm font-bold text-primary w-8 text-right">{s.score}</span>
                      <span className={`material-symbols-outlined text-[14px] ${s.trend === 'up' ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {s.trend === 'up' ? 'trending_up' : 'trending_flat'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schools needing attention */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                <h2 className="font-title-md font-semibold text-on-surface">Needs Attention</h2>
                <span className="ml-auto bg-error-container text-on-error-container font-label-sm text-[11px] px-2 py-0.5 rounded-full font-bold">
                  {mockAttention.length}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {mockAttention.map((s, i) => (
                  <div key={i} className="p-3 bg-error-container/10 border border-error/20 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-label-md text-on-surface font-semibold">{s.name}</p>
                      <span className="font-label-sm font-bold text-error">Score: {s.score}</span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant text-[11px]">{s.district} · {s.reason}</p>
                    <div className="mt-2 w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-error rounded-full" style={{ width: `${s.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;
