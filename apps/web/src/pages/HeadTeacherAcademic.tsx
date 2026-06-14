import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';

const subjects = [
  { name: 'Mathematics', teacher: 'Mr. Banda', avg: 72, highest: 98, lowest: 34, submitted: 12, total: 12, trend: '+4%' },
  { name: 'English Language', teacher: 'Ms. Phiri', avg: 78, highest: 96, lowest: 42, submitted: 15, total: 15, trend: '+2%' },
  { name: 'Natural Sciences', teacher: 'Mrs. Chimwaza', avg: 65, highest: 91, lowest: 30, submitted: 8, total: 14, trend: '-1%' },
  { name: 'Social Studies', teacher: 'Mr. Tembo', avg: 80, highest: 97, lowest: 55, submitted: 12, total: 12, trend: '+6%' },
  { name: 'Biology', teacher: 'Mrs. Msiska', avg: 68, highest: 94, lowest: 29, submitted: 10, total: 12, trend: '+1%' },
  { name: 'Chemistry', teacher: 'Mrs. Msiska', avg: 61, highest: 89, lowest: 25, submitted: 9, total: 12, trend: '-3%' },
];

const examSchedule = [
  { subject: 'Mathematics (MSCE)', date: 'Mon, 16 Jun', time: '08:00 – 11:00', venue: 'Hall A', form: 'Form 4', status: 'Upcoming' },
  { subject: 'English Language (MSCE)', date: 'Tue, 17 Jun', time: '08:00 – 10:30', venue: 'Hall B', form: 'Form 4', status: 'Upcoming' },
  { subject: 'Natural Sciences (JCE)', date: 'Wed, 18 Jun', time: '08:00 – 10:00', venue: 'Hall A', form: 'Form 2', status: 'Upcoming' },
  { subject: 'Mathematics (JCE)', date: 'Thu, 19 Jun', time: '08:00 – 11:00', venue: 'Hall B', form: 'Form 2', status: 'Upcoming' },
  { subject: 'Social Studies (PSLCE)', date: 'Fri, 20 Jun', time: '09:00 – 11:00', venue: 'Main Hall', form: 'Standard 8', status: 'Upcoming' },
];

const performanceBars = [72, 78, 65, 80, 68, 61];
const barLabels = ['Math', 'Eng', 'Sci', 'SS', 'Bio', 'Chem'];

export const HeadTeacherAcademic: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Head Teacher';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'exams'>('results');

  const trendColor = (t: string) =>
    t.startsWith('+') ? 'text-secondary' : 'text-error';

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
              <span className="text-primary font-bold">Academic</span>
            </nav>
            <h1 className="dash-page-title">Academic Overview</h1>
            <p className="font-body-md text-on-surface-variant">Subject performance, grade reports & exam schedule, {fullName}.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm text-sm self-start md:self-end">
            <span className="material-symbols-outlined text-[18px]">summarize</span>
            Generate Report
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'School Average', value: '71%', icon: 'trending_up', color: 'bg-secondary-container text-secondary' },
            { label: 'Top Performer', value: '98%', icon: 'emoji_events', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
            { label: 'Grades Submitted', value: '66/77', icon: 'upload_file', color: 'bg-primary-container text-primary' },
            { label: 'Pending Reports', value: '11', icon: 'pending_actions', color: 'bg-error-container text-on-error-container' },
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

        {/* Performance Chart */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-on-background mb-4">Average Score by Subject</h3>
          <div className="flex items-end gap-3 h-40">
            {performanceBars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-on-surface-variant">{h}%</span>
                <div
                  className="w-full rounded-t-md bg-primary-container hover:bg-primary transition-colors group relative"
                  style={{ height: `${h}%` }}
                />
                <span className="text-xs text-on-surface-variant">{barLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-container rounded-lg p-1 w-fit mb-4">
          {(['results', 'exams'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-md font-bold text-sm capitalize transition-all ${
                activeTab === t ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {t === 'results' ? 'Grade Results' : 'Exam Schedule'}
            </button>
          ))}
        </div>

        {/* Results Table */}
        {activeTab === 'results' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant">
              <h3 className="font-bold text-on-background">Subject Grade Summary — Term 2, 2025/26</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    {['Subject', 'Teacher', 'Avg Score', 'Highest', 'Lowest', 'Submitted', 'Trend'].map(h => (
                      <th key={h} className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 font-bold text-on-surface text-sm">{s.name}</td>
                      <td className="px-6 py-4 text-on-surface-variant text-sm">{s.teacher}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden w-16">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${s.avg}%` }} />
                          </div>
                          <span className="text-sm font-bold text-on-surface">{s.avg}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant text-sm">{s.highest}%</td>
                      <td className="px-6 py-4 text-on-surface-variant text-sm">{s.lowest}%</td>
                      <td className="px-6 py-4 text-on-surface-variant text-sm">{s.submitted}/{s.total}</td>
                      <td className={`px-6 py-4 font-bold text-sm ${trendColor(s.trend)}`}>{s.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Exam Schedule */}
        {activeTab === 'exams' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-bold text-on-background">End-of-Term Examination Schedule</h3>
              <button className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add</span> Add Exam
              </button>
            </div>
            <div className="divide-y divide-outline-variant">
              {examSchedule.map((e, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-primary-container text-primary flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold">{e.date.split(',')[0]}</span>
                    <span className="text-xs">{e.date.split(' ').slice(1).join(' ')}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface text-sm">{e.subject}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{e.time} · {e.venue} · {e.form}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-container text-on-primary-container uppercase">{e.status}</span>
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

export default HeadTeacherAcademic;
