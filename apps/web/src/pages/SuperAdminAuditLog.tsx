import React, { useState } from 'react';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';

type ActionType = 'login' | 'create' | 'update' | 'delete' | 'billing' | 'broadcast' | 'system';

interface AuditEntry {
  id: string; timestamp: string; actor: string; school: string;
  action: string; target: string; type: ActionType; ip: string;
}

const mockEntries: AuditEntry[] = [
  { id: 'A-001', timestamp: '2026-06-26 07:45', actor: 'James Phiri (Head Teacher)',   school: 'Kamuzu Academy',       action: 'Logged in',                 target: 'Session',         type: 'login',     ip: '196.44.1.10' },
  { id: 'A-002', timestamp: '2026-06-26 07:30', actor: 'Super Admin',                  school: 'Platform',             action: 'Sent broadcast notification', target: 'All Schools',    type: 'broadcast', ip: '10.0.0.1' },
  { id: 'A-003', timestamp: '2026-06-26 07:00', actor: 'Grace Banda (Bursar)',          school: 'St. Francis Primary',  action: 'Recorded payment',          target: 'Invoice #INV-245', type: 'create',    ip: '196.44.2.5' },
  { id: 'A-004', timestamp: '2026-06-25 22:15', actor: 'Super Admin',                  school: 'Chichiri Sec. School', action: 'Extended subscription',     target: 'Basic → Premium',  type: 'billing',   ip: '10.0.0.1' },
  { id: 'A-005', timestamp: '2026-06-25 18:00', actor: 'System',                       school: 'Platform',             action: 'Automated backup completed', target: 'All databases',   type: 'system',    ip: 'internal' },
  { id: 'A-006', timestamp: '2026-06-25 16:30', actor: 'Moses Chirwa (Teacher)',       school: 'Zomba Catholic Sec.',  action: 'Submitted grade sheet',      target: 'Form 3A Math',    type: 'create',    ip: '196.44.3.8' },
  { id: 'A-007', timestamp: '2026-06-25 14:00', actor: 'Super Admin',                  school: 'Nkhotakota Primary',   action: 'Suspended school account',  target: 'School',          type: 'update',    ip: '10.0.0.1' },
  { id: 'A-008', timestamp: '2026-06-25 11:20', actor: 'Ester Lungu (Teacher)',        school: 'Likuni Boys School',   action: 'Deleted attendance record', target: 'Grade 7 - Jun 24', type: 'delete',   ip: '196.44.1.99' },
  { id: 'A-009', timestamp: '2026-06-25 09:15', actor: 'Super Admin',                  school: 'Platform',             action: 'Created new school',        target: 'Mzimba North Sec.',type: 'create',    ip: '10.0.0.1' },
  { id: 'A-010', timestamp: '2026-06-24 23:00', actor: 'System',                       school: 'Platform',             action: 'SSL certificate renewed',   target: 'myklasi.online',  type: 'system',    ip: 'internal' },
  { id: 'A-011', timestamp: '2026-06-24 17:30', actor: 'David Moyo (Deputy Head)',     school: 'Likuni Boys School',   action: 'Updated timetable',         target: 'Form 2B',         type: 'update',    ip: '196.44.1.88' },
  { id: 'A-012', timestamp: '2026-06-24 14:00', actor: 'Grace Banda (Bursar)',          school: 'St. Francis Primary',  action: 'Generated fee report',      target: 'Term 2 Report',   type: 'create',    ip: '196.44.2.5' },
];

const typeConfig: Record<ActionType, { icon: string; color: string; bg: string }> = {
  login:     { icon: 'login',           color: 'text-primary',   bg: 'bg-primary-container/30' },
  create:    { icon: 'add_circle',      color: 'text-secondary', bg: 'bg-secondary-container/30' },
  update:    { icon: 'edit',            color: 'text-tertiary',  bg: 'bg-tertiary-container/30' },
  delete:    { icon: 'delete',          color: 'text-error',     bg: 'bg-error-container/30' },
  billing:   { icon: 'credit_card',     color: 'text-primary',   bg: 'bg-primary-container/30' },
  broadcast: { icon: 'campaign',        color: 'text-secondary', bg: 'bg-secondary-container/30' },
  system:    { icon: 'settings',        color: 'text-on-surface-variant', bg: 'bg-surface-container' },
};

export const SuperAdminAuditLog: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | ActionType>('all');
  const [search, setSearch] = useState('');

  const filtered = mockEntries
    .filter(e => filterType === 'all' || e.type === filterType)
    .filter(e =>
      search === '' ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.school.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase())
    );

  const typeCounts = Object.keys(typeConfig).reduce((acc, t) => ({
    ...acc, [t]: mockEntries.filter(e => e.type === t).length,
  }), {} as Record<string, number>);

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 overflow-y-auto bg-surface-bright">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="dash-page-title mb-1">Audit Log</h1>
              <p className="font-body-md text-on-surface-variant">Chronological record of all significant platform actions.</p>
            </div>
            <button className="flex items-center gap-2 bg-surface border border-outline-variant text-on-surface px-4 py-2.5 rounded-xl font-label-md hover:bg-surface-container-low transition-all self-start sm:self-auto">
              <span className="material-symbols-outlined text-[18px] text-primary">download</span>
              Export CSV
            </button>
          </div>

          {/* Type filter chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-full font-label-sm font-semibold border transition-all ${filterType === 'all' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/30'}`}
            >
              All ({mockEntries.length})
            </button>
            {Object.entries(typeConfig).map(([t, c]) => (
              <button
                key={t}
                onClick={() => setFilterType(t as ActionType)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label-sm font-semibold border transition-all capitalize ${
                  filterType === t ? `${c.bg} border-transparent ${c.color}` : 'border-outline-variant text-on-surface-variant hover:border-primary/30'
                }`}
              >
                <span className={`material-symbols-outlined text-[14px] ${c.color}`}>{c.icon}</span>
                {t} ({typeCounts[t] ?? 0})
              </button>
            ))}
          </div>

          {/* Main log table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-outline">search</span>
                <input
                  className="pl-9 pr-4 py-2 border border-outline-variant rounded-xl bg-surface text-on-surface font-body-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 w-full"
                  placeholder="Search actor, school, or action…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span className="font-label-sm text-on-surface-variant ml-auto">{filtered.length} entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface">
                    {['Type', 'Timestamp', 'Actor', 'School', 'Action', 'Target', 'IP'].map(h => (
                      <th key={h} className="px-4 py-3 font-label-sm text-on-surface-variant text-xs font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => {
                    const cfg = typeConfig[e.type];
                    return (
                      <tr key={i} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                            <span className={`material-symbols-outlined text-[16px] ${cfg.color}`}>{cfg.icon}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-on-surface-variant text-[11px] whitespace-nowrap">{e.timestamp}</td>
                        <td className="px-4 py-3 font-label-sm text-on-surface font-semibold whitespace-nowrap">{e.actor}</td>
                        <td className="px-4 py-3 font-body-sm text-on-surface-variant">{e.school}</td>
                        <td className="px-4 py-3 font-body-sm text-on-surface">{e.action}</td>
                        <td className="px-4 py-3 font-body-sm text-on-surface-variant">{e.target}</td>
                        <td className="px-4 py-3 font-mono text-on-surface-variant text-[11px]">{e.ip}</td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-on-surface-variant text-sm">No entries matched your filters.</td>
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

export default SuperAdminAuditLog;
