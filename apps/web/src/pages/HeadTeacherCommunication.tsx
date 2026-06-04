import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';
import { Link } from 'react-router-dom';

const sentAnnouncements = [
  { id: '1', title: 'End of Term 2 Examination Timetable', date: '28 May 2026', audience: 'All Staff & Parents', status: 'Delivered', content: 'Please note that Term 2 final exams commence on 16 June. Check details on academic tabs.' },
  { id: '2', title: 'Maintenance Shutdown notice', date: '26 May 2026', audience: 'All Staff', status: 'Delivered', content: 'Water utilities will be undergoing routine repair work this Saturday from 8:00 AM to noon.' },
  { id: '3', title: 'PTA General Assembly Postponement', date: '22 May 2026', audience: 'Parents', status: 'Delivered', content: 'Due to unforeseen assembly ground upgrades, the PTA meeting is rescheduled to 12 June.' },
];

const parentComms = [
  { sender: 'Mr. & Mrs. Chisaka', student: 'Limbikani Chisaka (Form 2)', subject: 'Leave Request for Family Travel', date: 'Today, 10:15 AM', status: 'Unread', preview: 'We are requesting leave of absence for our son Limbikani due to a family emergency...' },
  { sender: 'Mrs. Florence Phiri', student: 'Tadala Phiri (Form 2B)', subject: 'Fee Payment Installment Plan Inquiry', date: 'Yesterday, 4:30 PM', status: 'Read', preview: 'I am writing to inquire if I could pay the balance of the school fees in two monthly installments...' },
  { sender: 'Mr. David Mussa', student: 'Ephraim Mussa (Form 4)', subject: 'Report Card Clarification', date: '25 May 2026', status: 'Replied', preview: 'Ephraim has a query regarding his Chemistry grade which seems different from the class assignments...' },
];

export const HeadTeacherCommunication: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Head Teacher';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'announcements' | 'inbox'>('announcements');

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-4 md:px-8 min-h-screen bg-surface text-on-surface transition-colors">
        {/* Page Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Home</span>
              <span>/</span>
              <span className="text-primary font-bold">Communication</span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">Communication</h1>
            <p className="font-body-md text-on-surface-variant">Broadcast official circulars and view parent queries, {fullName}.</p>
          </div>
          <Link
            to="/head-teacher/announcements/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm text-sm self-start md:self-end"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Announcement
          </Link>
        </div>

        {/* Info stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Broadcasts Sent', value: '42', icon: 'campaign', color: 'bg-primary-container text-primary' },
            { label: 'Pending Queries', value: '7', icon: 'chat', color: 'bg-secondary-container text-secondary' },
            { label: 'Parent Messages', value: '18', icon: 'forum', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
            { label: 'Delivery Success', value: '99.8%', icon: 'check_circle', color: 'bg-tertiary-container text-tertiary' },
          ].map(c => (
            <div key={c.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${c.color}`}>
                <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">{c.label}</p>
                <p className="text-headline-sm font-bold text-on-background mt-0.5">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-1 bg-surface-container rounded-lg p-1 w-fit mb-4">
          {(['announcements', 'inbox'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-md font-bold text-sm capitalize transition-all ${
                activeTab === t ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {t === 'announcements' ? 'Broadcast History' : 'Parent Inbox'}
            </button>
          ))}
        </div>

        {/* Announcements List */}
        {activeTab === 'announcements' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant">
              <h3 className="font-bold text-on-background">Official School Broadcasts</h3>
            </div>
            <div className="divide-y divide-outline-variant">
              {sentAnnouncements.map((ann, i) => (
                <div key={i} className="p-6 hover:bg-surface-container-low transition-colors">
                  <div className="flex justify-between items-start mb-2 gap-4 flex-wrap">
                    <div>
                      <h4 className="font-bold text-on-surface text-base">{ann.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-1">Audience: <span className="font-bold text-primary">{ann.audience}</span> · {ann.date}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-container/40 text-secondary uppercase tracking-wider">{ann.status}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inbox / Parent Comms */}
        {activeTab === 'inbox' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant">
              <h3 className="font-bold text-on-background">Parent Inquiries</h3>
            </div>
            <div className="divide-y divide-outline-variant">
              {parentComms.map((item, i) => (
                <div key={i} className="p-6 hover:bg-surface-container-low transition-colors">
                  <div className="flex justify-between items-start mb-2 gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface text-sm">{item.sender}</span>
                        <span className="text-xs text-outline">({item.student})</span>
                      </div>
                      <h4 className="font-bold text-primary mt-1 text-sm">{item.subject}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant font-medium">{item.date}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'Unread' ? 'bg-error-container text-on-error-container' : item.status === 'Read' ? 'bg-surface-container text-on-surface-variant' : 'bg-secondary-container/40 text-secondary'
                      }`}>{item.status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed italic">"{item.preview}"</p>
                  <div className="mt-3 flex gap-2">
                    <button className="text-xs font-bold text-primary hover:underline">Reply</button>
                    <button className="text-xs font-bold text-outline hover:text-on-surface">Archive</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-8 pt-6 pb-2 text-center border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant opacity-60">© 2026 Tenpaten School Management System. Academic Session: 2025/2026</p>
        </footer>
      </main>
      <BottomNav />
    </>
  );
};

export default HeadTeacherCommunication;
