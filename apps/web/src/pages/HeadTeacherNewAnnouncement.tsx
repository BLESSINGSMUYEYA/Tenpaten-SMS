import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';
import { useNavigate } from 'react-router-dom';

export const HeadTeacherNewAnnouncement: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Head Teacher';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [priority, setPriority] = useState('normal');
  const [content, setContent] = useState('');
  const [sendSMS, setSendSMS] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setStatusMessage('Please fill in all required fields.');
      return;
    }
    
    // In a real app, this would perform an API request.
    setStatusMessage('Announcement broadcasted successfully!');
    setTimeout(() => {
      navigate('/head-teacher/communication');
    }, 1500);
  };

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-4 md:px-8 min-h-screen bg-surface text-on-surface transition-colors">
        {/* Page Header */}
        <div className="py-6">
          <nav className="flex gap-2 text-label-sm text-outline mb-2">
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/head-teacher')}>Home</span>
            <span>/</span>
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/head-teacher/communication')}>Communication</span>
            <span>/</span>
            <span className="text-primary font-bold">New Announcement</span>
          </nav>
          <h1 className="dash-page-title">New Announcement</h1>
          <p className="font-body-md text-on-surface-variant">Compose a new school-wide bulletin or targeted advisory notice, {fullName}.</p>
        </div>

        <div className="max-w-3xl bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {statusMessage && (
              <div className={`p-4 rounded-lg text-sm font-bold ${statusMessage.includes('successfully') ? 'bg-secondary-container/40 text-secondary' : 'bg-error-container text-on-error-container'}`}>
                {statusMessage}
              </div>
            )}

            {/* Announcement Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Announcement Title *</label>
              <input
                type="text"
                placeholder="e.g. End of Term Examination Schedule"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Target Audience & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                >
                  <option value="all">All Staff, Students & Parents</option>
                  <option value="staff">Staff Members Only</option>
                  <option value="parents">Parents / Guardians Only</option>
                  <option value="students">Students Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Priority Level</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                >
                  <option value="normal">Normal Bulletin</option>
                  <option value="medium">Important Notice</option>
                  <option value="high">Urgent Announcement</option>
                </select>
              </div>
            </div>

            {/* Content Body */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Message Content *</label>
              <textarea
                placeholder="Compose your official announcement here..."
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Extra options */}
            <div className="flex items-center gap-3 bg-surface-container p-4 rounded-lg">
              <input
                type="checkbox"
                id="sendSMS"
                checked={sendSMS}
                onChange={e => setSendSMS(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary-container"
              />
              <label htmlFor="sendSMS" className="text-xs font-medium text-on-surface">
                <strong>Also push via SMS</strong> (Deliver immediate text dispatch to parent and staff phone numbers)
              </label>
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => navigate('/head-teacher/communication')}
                className="px-5 py-2.5 bg-surface-container border border-outline-variant text-outline hover:text-on-surface rounded-lg font-bold transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm text-sm"
              >
                Send Broadcast
              </button>
            </div>
          </form>
        </div>

        <footer className="mt-8 pt-6 pb-2 text-center border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant opacity-60">© 2026 Tenpaten School Management System. Academic Session: 2025/2026</p>
        </footer>
      </main>
      <BottomNav />
    </>
  );
};

export default HeadTeacherNewAnnouncement;
