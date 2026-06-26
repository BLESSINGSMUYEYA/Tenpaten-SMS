import React, { useState } from 'react';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';

type TicketStatus = 'open' | 'in_progress' | 'resolved';
type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

interface Ticket {
  id: string;
  school: string;
  district: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  messages: { author: string; text: string; time: string; isAdmin: boolean }[];
}

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001', school: 'Kamuzu Academy', district: 'Kasungu',
    subject: 'Cannot record fee payments', description: 'The bursar is unable to record cash payments. The form submits but no record is saved.',
    status: 'open', priority: 'high', createdAt: '2026-06-25', updatedAt: '2h ago',
    messages: [
      { author: 'Head Teacher', text: 'Our bursar has been trying all morning. No payments are being saved after submission.', time: '2h ago', isAdmin: false },
    ],
  },
  {
    id: 'TKT-002', school: 'St. Francis Primary', district: 'Lilongwe',
    subject: 'Subscription renewal needed', description: 'Our subscription expires in 3 days. We need to renew to the Premium plan.',
    status: 'in_progress', priority: 'critical', createdAt: '2026-06-24', updatedAt: '5h ago',
    messages: [
      { author: 'Director',   text: 'We need to upgrade before Friday. Our board approved the Premium plan.', time: '5h ago', isAdmin: false },
      { author: 'Super Admin', text: 'Noted. I\'m processing the upgrade manually. Will confirm shortly.', time: '4h ago', isAdmin: true },
    ],
  },
  {
    id: 'TKT-003', school: 'Zomba Catholic Sec.', district: 'Zomba',
    subject: 'Timetable not loading for teachers', description: 'Teachers report that the timetable page shows a blank screen.',
    status: 'resolved', priority: 'medium', createdAt: '2026-06-22', updatedAt: '1 day ago',
    messages: [
      { author: 'IT Coordinator', text: 'The timetable page is completely blank for all teachers.', time: '2 days ago', isAdmin: false },
      { author: 'Super Admin',    text: 'This was a caching issue. Cleared and deployed a fix. Please verify.', time: '1 day ago', isAdmin: true },
      { author: 'IT Coordinator', text: 'Confirmed fixed! Thank you.', time: '1 day ago', isAdmin: false },
    ],
  },
  {
    id: 'TKT-004', school: 'Chichiri Sec. School', district: 'Blantyre',
    subject: 'Need extra user accounts', description: 'We have 3 new teachers joining next week and need accounts created.',
    status: 'open', priority: 'low', createdAt: '2026-06-26', updatedAt: '30 min ago',
    messages: [
      { author: 'Deputy Head', text: 'Please create 3 teacher accounts. I\'ll email the details.', time: '30 min ago', isAdmin: false },
    ],
  },
];

const statusStyles: Record<TicketStatus, string> = {
  open:        'bg-error-container text-on-error-container',
  in_progress: 'bg-secondary-container text-on-secondary-container',
  resolved:    'bg-primary-container text-on-primary-container',
};
const statusLabels: Record<TicketStatus, string> = {
  open: 'Open', in_progress: 'In Progress', resolved: 'Resolved',
};
const priorityStyles: Record<TicketPriority, string> = {
  low:      'text-on-surface-variant',
  medium:   'text-secondary',
  high:     'text-error',
  critical: 'text-error font-bold',
};
const priorityIcons: Record<TicketPriority, string> = {
  low: 'arrow_downward', medium: 'remove', high: 'arrow_upward', critical: 'priority_high',
};

export const SuperAdminSupport: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | TicketStatus>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ school: '', subject: '', description: '', priority: 'medium' });

  const filtered = mockTickets.filter(t => filterStatus === 'all' || t.status === filterStatus);

  const stats = [
    { label: 'Open',        value: mockTickets.filter(t => t.status === 'open').length,        color: 'text-error',    icon: 'confirmation_number' },
    { label: 'In Progress', value: mockTickets.filter(t => t.status === 'in_progress').length, color: 'text-secondary',icon: 'pending' },
    { label: 'Resolved',    value: mockTickets.filter(t => t.status === 'resolved').length,    color: 'text-primary',  icon: 'check_circle' },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 overflow-y-auto bg-surface-bright">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="dash-page-title mb-1">Support & Ticketing</h1>
              <p className="font-body-md text-on-surface-variant">Manage school support requests and provide assistance.</p>
            </div>
            <button
              onClick={() => setShowNewTicket(true)}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-label-md font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Ticket
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map(s => (
              <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <span className={`material-symbols-outlined text-[24px] ${s.color}`}>{s.icon}</span>
                <div>
                  <p className="font-title-md font-bold text-on-surface">{s.value}</p>
                  <p className="font-label-sm text-on-surface-variant">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ticket list */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <h2 className="font-title-md font-semibold text-on-surface flex-1">Tickets</h2>
                <div className="flex gap-1">
                  {(['all', 'open', 'in_progress', 'resolved'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-2.5 py-1 rounded-lg font-label-sm text-[11px] font-semibold transition-all capitalize ${
                        filterStatus === s ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {s === 'all' ? 'All' : s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col divide-y divide-outline-variant max-h-[500px] overflow-y-auto">
                {filtered.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 text-left hover:bg-surface-container-low transition-colors ${selectedTicket?.id === t.id ? 'bg-primary-container/20 border-l-4 border-primary' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`material-symbols-outlined text-[14px] ${priorityStyles[t.priority]}`}>{priorityIcons[t.priority]}</span>
                        <p className="font-label-md text-on-surface font-semibold truncate">{t.subject}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold shrink-0 ${statusStyles[t.status]}`}>
                        {statusLabels[t.status]}
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant">{t.school} · {t.district}</p>
                    <p className="font-body-sm text-on-surface-variant/60 text-[11px] mt-0.5">{t.id} · Updated {t.updatedAt}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket detail */}
            {selectedTicket ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h2 className="font-title-md font-semibold text-on-surface">{selectedTicket.subject}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${statusStyles[selectedTicket.status]}`}>
                      {statusLabels[selectedTicket.status]}
                    </span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant">{selectedTicket.school} · {selectedTicket.district} · {selectedTicket.id}</p>
                </div>
                <div className="p-4 bg-surface-container-low/40 border-b border-outline-variant">
                  <p className="font-body-sm text-on-surface">{selectedTicket.description}</p>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto max-h-[280px]">
                  {selectedTicket.messages.map((m, i) => (
                    <div key={i} className={`flex flex-col gap-1 ${m.isAdmin ? 'items-end' : 'items-start'}`}>
                      <p className="font-label-sm text-on-surface-variant text-[11px]">{m.author} · {m.time}</p>
                      <div className={`px-4 py-2.5 rounded-2xl font-body-sm max-w-[80%] ${
                        m.isAdmin ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface-container-high text-on-surface rounded-tl-none'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-outline-variant flex gap-2">
                  <input
                    className="flex-1 px-4 py-2.5 border border-outline-variant rounded-xl bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    placeholder="Type a reply…"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                  />
                  <button
                    disabled={!reply.trim()}
                    className="p-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
                    onClick={() => setReply('')}
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center gap-3">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">inbox</span>
                <p className="font-title-md text-on-surface-variant">Select a ticket to view details</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New ticket modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-title-lg font-semibold text-on-surface">Raise a Support Ticket</h2>
              <button onClick={() => setShowNewTicket(false)} className="p-1.5 hover:bg-surface-container-high rounded-lg">
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-1.5">School</label>
                <input className="w-full px-4 py-2.5 border border-outline-variant rounded-xl bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="School name" value={newTicket.school} onChange={e => setNewTicket(p => ({ ...p, school: e.target.value }))} />
              </div>
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-1.5">Subject</label>
                <input className="w-full px-4 py-2.5 border border-outline-variant rounded-xl bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Brief summary of the issue" value={newTicket.subject} onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-1.5">Priority</label>
                <select className="w-full px-4 py-2.5 border border-outline-variant rounded-xl bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={newTicket.priority} onChange={e => setNewTicket(p => ({ ...p, priority: e.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-1.5">Description</label>
                <textarea rows={3} className="w-full px-4 py-2.5 border border-outline-variant rounded-xl bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder="Describe the issue in detail…" value={newTicket.description} onChange={e => setNewTicket(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowNewTicket(false)} className="flex-1 py-2.5 border border-outline-variant rounded-xl font-label-md text-on-surface-variant hover:bg-surface-container-low">Cancel</button>
                <button
                  onClick={() => setShowNewTicket(false)}
                  className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl font-label-md font-semibold hover:opacity-90"
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSupport;
