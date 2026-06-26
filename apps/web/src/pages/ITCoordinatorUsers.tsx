import React, { useState } from 'react';
import { Sidebar } from '../components/ITCoordinatorDashboard/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';

type StatusType = 'active' | 'suspended' | 'pending';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: StatusType;
  lastLogin: string;
  created: string;
}

const mockUsers: UserRecord[] = [
  { id: 'U001', name: 'Mr. James Phiri',   email: 'j.phiri@school.mw',   role: 'Head Teacher',  status: 'active',    lastLogin: 'Today 08:15', created: '2025-01-10' },
  { id: 'U002', name: 'Ms. Grace Banda',   email: 'g.banda@school.mw',   role: 'Deputy Head',   status: 'active',    lastLogin: 'Today 09:02', created: '2025-01-10' },
  { id: 'U003', name: 'Mr. Chris Mwale',   email: 'c.mwale@school.mw',   role: 'Teacher',       status: 'active',    lastLogin: 'Yesterday',   created: '2025-02-14' },
  { id: 'U004', name: 'Mrs. Lucia Tembo',  email: 'l.tembo@school.mw',   role: 'Bursar',        status: 'active',    lastLogin: 'Today 07:48', created: '2025-01-12' },
  { id: 'U005', name: 'Mr. Paul Chirwa',   email: 'p.chirwa@school.mw',  role: 'Teacher',       status: 'suspended', lastLogin: '5 days ago',  created: '2025-03-01' },
  { id: 'U006', name: 'Ms. Faith Nkosi',   email: 'f.nkosi@school.mw',   role: 'Teacher',       status: 'active',    lastLogin: 'Today 10:30', created: '2025-02-20' },
  { id: 'U007', name: 'Mr. Joseph Mvula',  email: 'j.mvula@school.mw',   role: 'Parent',        status: 'pending',   lastLogin: 'Never',       created: '2026-06-20' },
];

const roleColors: Record<string, string> = {
  'Head Teacher': 'bg-primary-container text-on-primary-container',
  'Deputy Head':  'bg-tertiary-container text-on-tertiary-container',
  'Teacher':      'bg-surface-container-high text-on-surface',
  'Bursar':       'bg-secondary-container text-on-secondary-container',
  'Parent':       'bg-surface-container text-on-surface',
};

const statusColors: Record<StatusType, string> = {
  active:    'bg-primary-container/60 text-primary',
  suspended: 'bg-error-container/60 text-error',
  pending:   'bg-secondary-container/60 text-secondary',
};

export const ITCoordinatorUsers: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  const roles = ['All', 'Head Teacher', 'Deputy Head', 'Teacher', 'Bursar', 'Parent'];

  const filtered = mockUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'All' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 bg-surface-bright overflow-y-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="dash-page-title mb-1">User Management</h1>
              <p className="font-body-md text-on-surface-variant">Create accounts, reset passwords, and manage access.</p>
            </div>
            <button className="flex items-center gap-2 bg-tertiary text-on-tertiary px-4 py-2 rounded-lg font-label-md hover:opacity-90 transition-all active:scale-95 shadow-sm self-start sm:self-auto">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Create Account
            </button>
          </div>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              { label: 'Total Users',  value: mockUsers.length,                                     color: 'bg-surface-container-low border-outline-variant' },
              { label: 'Active',       value: mockUsers.filter(u => u.status === 'active').length,   color: 'bg-primary-container/30 border-primary/20' },
              { label: 'Suspended',    value: mockUsers.filter(u => u.status === 'suspended').length,color: 'bg-error-container/30 border-error/20' },
              { label: 'Pending',      value: mockUsers.filter(u => u.status === 'pending').length,  color: 'bg-secondary-container/30 border-secondary/20' },
            ].map(c => (
              <div key={c.label} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${c.color}`}>
                <span className="font-label-md text-on-surface-variant">{c.label}:</span>
                <span className="font-label-md font-bold text-on-surface">{c.value}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-tertiary/40 transition"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-tertiary/40 transition min-w-[160px]"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* Users table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    {['Name', 'Email', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                      <th key={h} className="font-label-md text-on-surface-variant p-4 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.id} className={`border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors ${i % 2 !== 0 ? 'bg-surface-bright' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container font-bold text-xs shrink-0">
                            {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <span className="font-label-md text-on-surface font-semibold">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-body-sm text-on-surface-variant">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-label-sm text-[10px] font-bold ${roleColors[u.role] ?? 'bg-surface-container text-on-surface'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-label-sm text-on-surface-variant">{u.lastLogin}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm font-bold text-[10px] capitalize ${statusColors[u.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-primary' : u.status === 'suspended' ? 'bg-error' : 'bg-secondary'}`} />
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            title="Reset Password"
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-tertiary-container/50 hover:text-tertiary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                          </button>
                          <button
                            title="Edit"
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {u.status === 'active' ? (
                            <button title="Suspend" className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error transition-colors">
                              <span className="material-symbols-outlined text-[18px]">block</span>
                            </button>
                          ) : (
                            <button title="Activate" className="p-1.5 rounded-lg text-on-surface-variant hover:bg-primary-container/40 hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-on-surface-variant font-body-sm">No users match your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ITCoordinatorUsers;
