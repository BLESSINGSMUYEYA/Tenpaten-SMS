import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';
import { useQuery, useMutation } from '../hooks/useApi';

interface SchoolDetail {
  id: string;
  name: string;
  schoolCode: string;
  subscriptionPlan: string;
  type: string;
  district: string;
  isActive: boolean;
  setupComplete: boolean;
  createdAt: string;
  email?: string;
  phone?: string;
  address?: string;
  motto?: string;
  country?: string;
  _count?: { users: number; students: number };
}

// Mock health score computation
const computeHealthScore = (school: SchoolDetail) => {
  let score = 0;
  if (school.setupComplete) score += 30;
  if (school.isActive) score += 20;
  if ((school._count?.users ?? 0) > 5) score += 20;
  if ((school._count?.students ?? 0) > 10) score += 30;
  return Math.min(score, 100);
};

const healthColor = (score: number) => {
  if (score >= 75) return { bar: 'bg-primary', text: 'text-primary', label: 'Healthy' };
  if (score >= 50) return { bar: 'bg-secondary', text: 'text-secondary', label: 'Moderate' };
  return { bar: 'bg-error', text: 'text-error', label: 'Needs Attention' };
};

const mockActivity = [
  { time: '2 hours ago',  actor: 'Head Teacher',    action: 'Logged in',            icon: 'login' },
  { time: '5 hours ago',  actor: 'Bursar',          action: 'Recorded 3 payments',  icon: 'payments' },
  { time: '1 day ago',    actor: 'Teacher (Ms. K)', action: 'Submitted grade sheet', icon: 'grade' },
  { time: '2 days ago',   actor: 'Head Teacher',    action: 'Added 5 students',     icon: 'person_add' },
  { time: '3 days ago',   actor: 'System',          action: 'Backup completed',      icon: 'backup' },
];

const mockUsers = [
  { name: 'James Phiri',  role: 'Head Teacher', email: 'j.phiri@school.mw',    lastLogin: '2h ago',    active: true },
  { name: 'Grace Banda',  role: 'Bursar',       email: 'g.banda@school.mw',    lastLogin: '5h ago',    active: true },
  { name: 'Moses Chirwa', role: 'Teacher',      email: 'm.chirwa@school.mw',   lastLogin: '1 day ago', active: true },
  { name: 'Ester Lungu',  role: 'Teacher',      email: 'e.lungu@school.mw',    lastLogin: '3 days ago',active: false },
  { name: 'David Moyo',   role: 'Deputy Head',  email: 'd.moyo@school.mw',     lastLogin: 'Never',     active: true },
];

const mockBilling = [
  { date: '2026-06-01', description: 'Term 2 subscription — Basic Plan', amount: 'MK 15,000', status: 'Paid' },
  { date: '2026-03-01', description: 'Term 1 subscription — Basic Plan', amount: 'MK 15,000', status: 'Paid' },
  { date: '2025-09-01', description: 'Term 3 subscription — Basic Plan', amount: 'MK 12,000', status: 'Paid' },
];

export const SuperAdminSchoolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'billing' | 'support'>('overview');
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const { data: school, loading } = useQuery<SchoolDetail>(`/admin/schools/${id}`);
  const { mutate: toggleActive } = useMutation(`/admin/schools/${id}`, 'patch');
  const { mutate: deleteSchool, loading: deleting } = useMutation(`/admin/schools/${id}`, 'delete');

  const health = school ? computeHealthScore(school) : 0;
  const hColor = healthColor(health);

  const statCards = [
    { label: 'Total Users',    value: school?._count?.users ?? '—',    icon: 'group',       color: 'text-primary' },
    { label: 'Students',       value: school?._count?.students ?? '—', icon: 'school',      color: 'text-secondary' },
    { label: 'Setup',          value: school?.setupComplete ? '100%' : 'Incomplete', icon: 'tune', color: school?.setupComplete ? 'text-primary' : 'text-error' },
    { label: 'Active Today',   value: '3',                             icon: 'login',       color: 'text-tertiary' },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview',  icon: 'dashboard' },
    { key: 'users',    label: 'Users',     icon: 'group' },
    { key: 'billing',  label: 'Billing',   icon: 'credit_card' },
    { key: 'support',  label: 'Support',   icon: 'confirmation_number' },
  ] as const;

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-primary animate-spin text-4xl">refresh</span>
        <p className="text-on-surface-variant">Loading school…</p>
      </div>
    </div>
  );

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 overflow-y-auto bg-surface-bright">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Link to="/super-admin/schools" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">domain</span>
              Schools
            </Link>
            <span className="text-on-surface-variant">/</span>
            <span className="text-on-surface font-semibold truncate">{school?.name ?? 'Loading…'}</span>
          </div>

          {/* Hero header */}
          <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container border border-outline-variant rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-[28px]">domain</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      {school?.name ?? '—'}
                    </h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                      school?.isActive
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-error-container text-on-error-container'
                    }`}>
                      {school?.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">
                    <span className="font-mono font-semibold text-primary">{school?.schoolCode}</span>
                    {' · '}{school?.type} · {school?.district}
                  </p>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">
                    {school?.email ?? 'No email'} · {school?.phone ?? 'No phone'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 shrink-0">
                <button className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary/40 rounded-lg font-label-sm font-semibold transition-all text-sm">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  Contact
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-outline-variant text-on-surface-variant hover:text-secondary hover:border-secondary/40 rounded-lg font-label-sm font-semibold transition-all text-sm">
                  <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                  Extend Plan
                </button>
                <button
                  onClick={() => setShowSuspendConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-error-container/20 border border-error/20 text-error hover:bg-error-container/40 rounded-lg font-label-sm font-semibold transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">{school?.isActive ? 'block' : 'check_circle'}</span>
                  {school?.isActive ? 'Suspend' : 'Reactivate'}
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirmText('');
                    setShowDeleteConfirm(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-error/10 border border-error/20 text-error hover:bg-error/30 rounded-lg font-label-sm font-semibold transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Delete School
                </button>
              </div>
            </div>

            {/* Health score + plan strip */}
            <div className="mt-5 pt-5 border-t border-outline-variant grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="font-label-sm text-on-surface-variant mb-1">Health Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${hColor.bar} transition-all`} style={{ width: `${health}%` }} />
                  </div>
                  <span className={`font-label-md font-bold ${hColor.text}`}>{health}</span>
                </div>
                <p className={`font-label-sm ${hColor.text} mt-0.5`}>{hColor.label}</p>
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant mb-1">Subscription Plan</p>
                <span className="font-label-md font-bold text-on-surface capitalize">{school?.subscriptionPlan ?? '—'}</span>
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant mb-1">Expires</p>
                <span className="font-label-md font-bold text-on-surface">30 Sep 2026</span>
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant mb-1">Member Since</p>
                <span className="font-label-md font-bold text-on-surface">
                  {school?.createdAt ? new Date(school.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' }) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {statCards.map(c => (
              <div key={c.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all shadow-sm">
                <div className="p-2 bg-surface-container rounded-lg">
                  <span className={`material-symbols-outlined text-[20px] ${c.color}`}>{c.icon}</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">{c.label}</p>
                  <p className="font-title-md font-bold text-on-surface">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-container p-1 rounded-xl mb-6 w-fit overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-label-md font-semibold transition-all whitespace-nowrap ${
                  activeTab === t.key
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {/* Recent Activity */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                  <h2 className="font-title-md font-semibold text-on-surface">Recent Activity</h2>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {mockActivity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container/40 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-primary text-[16px]">{a.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-label-md text-on-surface font-semibold">{a.actor}</p>
                        <p className="font-body-sm text-on-surface-variant">{a.action}</p>
                      </div>
                      <span className="font-label-sm text-on-surface-variant shrink-0 text-[11px]">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* School Info */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                  <h2 className="font-title-md font-semibold text-on-surface">School Information</h2>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {[
                    { label: 'Full Name',  value: school?.name },
                    { label: 'Code',       value: school?.schoolCode },
                    { label: 'Type',       value: school?.type },
                    { label: 'District',   value: school?.district },
                    { label: 'Country',    value: school?.country ?? 'Malawi' },
                    { label: 'Motto',      value: school?.motto ?? '—' },
                    { label: 'Address',    value: school?.address ?? '—' },
                    { label: 'Email',      value: school?.email ?? '—' },
                    { label: 'Phone',      value: school?.phone ?? '—' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between gap-4 py-1.5 border-b border-outline-variant/40 last:border-b-0">
                      <span className="font-label-sm text-on-surface-variant min-w-[90px]">{item.label}</span>
                      <span className="font-label-sm text-on-surface font-medium text-right break-words">{item.value ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Users */}
          {activeTab === 'users' && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <h2 className="font-title-md font-semibold text-on-surface">School Users</h2>
                <span className="font-label-sm text-on-surface-variant">{mockUsers.length} accounts</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface">
                      {['Name', 'Role', 'Email', 'Last Login', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 font-label-sm text-on-surface-variant text-xs font-semibold uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((u, i) => (
                      <tr key={i} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 py-3 font-label-md text-on-surface font-semibold">{u.name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-[11px] font-semibold">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-body-sm text-on-surface-variant">{u.email}</td>
                        <td className="px-4 py-3 font-body-sm text-on-surface-variant">{u.lastLogin}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${
                            u.active ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'
                          }`}>
                            {u.active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary" title="Reset Password">
                              <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-error-container/30 transition-colors text-on-surface-variant hover:text-error" title={u.active ? 'Suspend' : 'Activate'}>
                              <span className="material-symbols-outlined text-[16px]">{u.active ? 'block' : 'check_circle'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Billing */}
          {activeTab === 'billing' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Current Plan', value: school?.subscriptionPlan ?? '—', icon: 'workspace_premium', color: 'text-primary' },
                  { label: 'Next Renewal', value: '30 Sep 2026',                   icon: 'event',            color: 'text-secondary' },
                  { label: 'Amount Due',   value: 'MK 15,000',                     icon: 'payments',         color: 'text-tertiary' },
                ].map(c => (
                  <div key={c.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-label-sm text-on-surface-variant uppercase">{c.label}</span>
                      <span className={`material-symbols-outlined ${c.color} text-[20px]`}>{c.icon}</span>
                    </div>
                    <p className="font-headline-sm font-bold text-on-surface capitalize">{c.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                  <h2 className="font-title-md font-semibold text-on-surface">Payment History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface">
                        {['Date', 'Description', 'Amount', 'Status'].map(h => (
                          <th key={h} className="px-4 py-3 font-label-sm text-on-surface-variant text-xs font-semibold uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockBilling.map((b, i) => (
                        <tr key={i} className="border-b border-outline-variant hover:bg-surface-container-low/40">
                          <td className="px-4 py-3 font-body-sm text-on-surface-variant">{b.date}</td>
                          <td className="px-4 py-3 font-body-sm text-on-surface">{b.description}</td>
                          <td className="px-4 py-3 font-label-md font-semibold text-on-surface">{b.amount}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-0.5 bg-primary-container text-on-primary-container rounded-full font-label-sm text-[11px] font-bold">{b.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Support */}
          {activeTab === 'support' && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col items-center gap-4 text-center animate-fade-in shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary-container/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[32px]">confirmation_number</span>
              </div>
              <h2 className="font-title-lg font-semibold text-on-surface">Support Tickets</h2>
              <p className="font-body-md text-on-surface-variant max-w-sm">
                No open support tickets for this school. Use the Support page to raise a ticket on their behalf.
              </p>
              <Link
                to="/super-admin/support"
                className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Raise a Ticket
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Suspend confirm modal */}
      {showSuspendConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-error text-[24px]">warning</span>
            </div>
            <h2 className="font-title-lg font-semibold text-on-surface text-center mb-2">
              {school?.isActive ? 'Suspend School?' : 'Reactivate School?'}
            </h2>
            <p className="font-body-sm text-on-surface-variant text-center mb-6">
              {school?.isActive
                ? 'This will immediately lock out all users of this school.'
                : 'This will restore full access for all school users.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuspendConfirm(false)}
                className="flex-1 py-2.5 border border-outline-variant rounded-xl font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await toggleActive({ isActive: !school?.isActive });
                  setShowSuspendConfirm(false);
                }}
                className="flex-1 py-2.5 bg-error text-on-error rounded-xl font-label-md font-semibold hover:opacity-90 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4 text-error">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <h2 className="font-title-lg font-semibold text-on-surface text-center mb-2">
              Delete School Permanently?
            </h2>
            <p className="font-body-sm text-on-surface-variant text-center mb-4 leading-relaxed">
              This action <strong className="text-error">cannot be undone</strong>. This will permanently delete the school <strong>{school?.name}</strong> and all of its associated data, including:
            </p>
            <ul className="text-left font-body-sm text-on-surface-variant mb-6 space-y-1 bg-surface-container-low p-3 rounded-lg border border-outline-variant list-disc list-inside">
              <li>All user and administrator accounts ({school?._count?.users ?? 0})</li>
              <li>All student profiles ({school?._count?.students ?? 0})</li>
              <li>All classes, subjects, and timetables</li>
              <li>All academic grades and attendance records</li>
              <li>All fee structures, invoices, and payments</li>
            </ul>
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Type the school code <span className="font-mono text-primary font-black select-all bg-surface px-1.5 py-0.5 rounded border border-primary/20">{school?.schoolCode}</span> to confirm:
              </label>
              <input
                type="text"
                placeholder={school?.schoolCode}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-outline-variant text-on-surface text-sm font-mono font-bold outline-none focus:border-error rounded-lg uppercase tracking-widest text-center"
              />
            </div>
            <div className="flex gap-3">
              <button
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-outline-variant rounded-xl font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={deleting || deleteConfirmText.trim().toUpperCase() !== school?.schoolCode}
                onClick={async () => {
                  try {
                    await deleteSchool();
                    setShowDeleteConfirm(false);
                    navigate('/super-admin/schools');
                  } catch (err) {
                    console.error('Failed to delete school:', err);
                  }
                }}
                className="flex-1 py-2.5 bg-error text-on-error rounded-xl font-label-md font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSchoolDetail;
