import React, { useState } from 'react';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';
import { useQuery } from '../hooks/useApi';

interface School { id: string; name: string; district: string; subscriptionPlan: string; }

type BroadcastType = 'info' | 'warning' | 'urgent';
type DeliveryType = 'in_app' | 'email' | 'both';
type TargetType = 'all' | 'plan' | 'school';

interface SentBroadcast {
  id: string; title: string; body: string; type: BroadcastType;
  target: string; sentAt: string; schools: number; reads: number;
}

const mockSent: SentBroadcast[] = [
  { id: 'B-001', title: 'Planned Maintenance — Sunday 29 June', body: 'The platform will be under maintenance from 00:00 to 04:00 CAT. Please inform staff.', type: 'warning', target: 'All Schools', sentAt: '2026-06-26 08:00', schools: 24, reads: 18 },
  { id: 'B-002', title: 'New Feature: Bulk Attendance Import', body: 'You can now import attendance records via CSV. See the Help Center for instructions.', type: 'info', target: 'Premium Schools', sentAt: '2026-06-20 10:00', schools: 7, reads: 7 },
  { id: 'B-003', title: 'Subscription Renewal Reminder', body: '5 schools have subscriptions expiring this week. Please renew to avoid service interruption.', type: 'urgent', target: 'Expiring Schools', sentAt: '2026-06-18 09:00', schools: 5, reads: 3 },
];

const typeStyles: Record<BroadcastType, { pill: string; icon: string; iconColor: string }> = {
  info:    { pill: 'bg-primary-container text-on-primary-container',   icon: 'info',    iconColor: 'text-primary' },
  warning: { pill: 'bg-secondary-container text-on-secondary-container', icon: 'warning', iconColor: 'text-secondary' },
  urgent:  { pill: 'bg-error-container text-on-error-container',       icon: 'crisis_alert', iconColor: 'text-error' },
};

export const SuperAdminBroadcast: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<BroadcastType>('info');
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [targetPlan, setTargetPlan] = useState('premium');
  const [delivery, setDelivery] = useState<DeliveryType>('both');
  const [sent, setSent] = useState(false);

  const { data: schools } = useQuery<School[]>('/admin/schools');

  const handleSend = () => {
    if (!title.trim() || !body.trim()) return;
    setSent(true);
    setTitle(''); setBody('');
    setTimeout(() => setSent(false), 3000);
  };

  const targetDescription = () => {
    if (targetType === 'all') return `All ${schools?.length ?? 0} schools`;
    if (targetType === 'plan') return `${targetPlan} plan schools`;
    return 'Selected school';
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 overflow-y-auto bg-surface-bright">
          <div className="mb-6">
            <h1 className="dash-page-title mb-1">Broadcast Announcements</h1>
            <p className="font-body-md text-on-surface-variant">Send platform-wide notices, alerts, and feature updates to schools.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Compose panel */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">campaign</span>
                <h2 className="font-title-md font-semibold text-on-surface">Compose Broadcast</h2>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {/* Type */}
                <div>
                  <label className="font-label-md text-on-surface font-semibold block mb-2">Broadcast Type</label>
                  <div className="flex gap-2">
                    {(['info', 'warning', 'urgent'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all font-label-sm font-semibold capitalize ${
                          type === t ? `${typeStyles[t].pill} border-transparent shadow-sm` : 'border-outline-variant text-on-surface-variant hover:border-primary/20'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[16px] ${type === t ? '' : typeStyles[t].iconColor}`}>{typeStyles[t].icon}</span>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target */}
                <div>
                  <label className="font-label-md text-on-surface font-semibold block mb-2">Target Audience</label>
                  <div className="flex gap-2 mb-2">
                    {[{ v: 'all', l: 'All Schools' }, { v: 'plan', l: 'By Plan' }, { v: 'school', l: 'One School' }].map(o => (
                      <button
                        key={o.v}
                        onClick={() => setTargetType(o.v as TargetType)}
                        className={`flex-1 py-2 rounded-xl border font-label-sm font-semibold transition-all ${
                          targetType === o.v ? 'bg-primary-container text-on-primary-container border-primary/30' : 'border-outline-variant text-on-surface-variant hover:border-primary/20'
                        }`}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                  {targetType === 'plan' && (
                    <select className="w-full px-4 py-2.5 border border-outline-variant rounded-xl bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={targetPlan} onChange={e => setTargetPlan(e.target.value)}>
                      {['free', 'basic', 'premium', 'enterprise'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                    </select>
                  )}
                  <p className="font-body-sm text-on-surface-variant mt-1 text-[12px]">
                    Will reach: <span className="font-semibold text-primary">{targetDescription()}</span>
                  </p>
                </div>

                {/* Delivery */}
                <div>
                  <label className="font-label-md text-on-surface font-semibold block mb-2">Delivery Method</label>
                  <select className="w-full px-4 py-2.5 border border-outline-variant rounded-xl bg-surface text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={delivery} onChange={e => setDelivery(e.target.value as DeliveryType)}>
                    <option value="in_app">In-App Only</option>
                    <option value="email">Email Only</option>
                    <option value="both">In-App + Email</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="font-label-md text-on-surface font-semibold block mb-1.5">Title</label>
                  <input
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-xl bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    placeholder="Announcement headline…"
                    value={title} onChange={e => setTitle(e.target.value)}
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="font-label-md text-on-surface font-semibold block mb-1.5">Message Body</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-xl bg-surface text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                    placeholder="Write your message to schools…"
                    value={body} onChange={e => setBody(e.target.value)}
                  />
                </div>

                {/* Live preview */}
                {(title || body) && (
                  <div className={`p-4 rounded-xl border-l-4 ${
                    type === 'info' ? 'bg-primary-container/20 border-primary' :
                    type === 'warning' ? 'bg-secondary-container/20 border-secondary' :
                    'bg-error-container/20 border-error'
                  }`}>
                    <p className="font-label-sm text-on-surface-variant mb-1 text-[10px] uppercase tracking-wider">Preview</p>
                    <p className="font-label-md text-on-surface font-semibold">{title || 'Untitled'}</p>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">{body}</p>
                  </div>
                )}

                <button
                  onClick={handleSend}
                  disabled={!title.trim() || !body.trim()}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-label-md font-semibold transition-all active:scale-95 shadow-sm ${
                    sent ? 'bg-primary-container text-on-primary-container' : 'bg-primary text-on-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{sent ? 'check_circle' : 'send'}</span>
                  {sent ? 'Broadcast Sent!' : 'Send Broadcast'}
                </button>
              </div>
            </div>

            {/* Sent history */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                <h2 className="font-title-md font-semibold text-on-surface">Sent Broadcasts</h2>
              </div>
              <div className="flex flex-col divide-y divide-outline-variant">
                {mockSent.map(b => (
                  <div key={b.id} className="p-4 hover:bg-surface-container-low/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[18px] ${typeStyles[b.type].iconColor}`}>{typeStyles[b.type].icon}</span>
                        <p className="font-label-md text-on-surface font-semibold">{b.title}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold shrink-0 capitalize ${typeStyles[b.type].pill}`}>
                        {b.type}
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant line-clamp-2 mb-2">{b.body}</p>
                    <div className="flex items-center gap-4 text-[11px] text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">domain</span>
                        {b.target}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">send</span>
                        {b.schools} schools
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">visibility</span>
                        {b.reads}/{b.schools} read
                      </span>
                      <span className="ml-auto">{b.sentAt}</span>
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

export default SuperAdminBroadcast;
