import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';
import { useQuery } from '../hooks/useApi';

const getPeriodTime = (num: number) => {
  switch (num) {
    case 1: return { time: '07:30', period: 'AM' };
    case 2: return { time: '08:15', period: 'AM' };
    case 3: return { time: '09:00', period: 'AM' };
    case 4: return { time: '10:15', period: 'AM' };
    case 5: return { time: '11:00', period: 'AM' };
    case 6: return { time: '11:45', period: 'AM' };
    case 7: return { time: '01:30', period: 'PM' };
    case 8: return { time: '02:15', period: 'PM' };
    default: return { time: '03:00', period: 'PM' };
  }
};

export const DeputyHeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Deputy Head';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Live Queries
  const { data: timetableSlots, loading: loadingTimetable } = useQuery<any[]>('/timetable');
  const { data: gradesList, loading: loadingGrades } = useQuery<any[]>('/grades');
  const { data: announcements, loading: loadingAnnouncements } = useQuery<any[]>('/announcements');

  // Derive Hero Stats
  const totalSlotsCount = timetableSlots ? timetableSlots.length : 0;
  const gradeSubmissionRate = gradesList && gradesList.length > 0
    ? Math.round((gradesList.filter(g => g.submissionStatus !== 'draft').length / gradesList.length) * 100)
    : 0;
  const pendingApprovalsCount = gradesList
    ? gradesList.filter(g => g.submissionStatus === 'submitted').length
    : 0;

  // Derive Today's Timetable Summary
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const rawDay = dayNames[new Date().getDay()];
  const currentDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(rawDay) ? rawDay : 'Mon';

  const todaySlots = (timetableSlots || [])
    .filter((s: any) => s.day === currentDay)
    .slice(0, 4)
    .map((s: any) => {
      const periodTime = getPeriodTime(s.periodNumber);
      return {
        time: periodTime.time,
        period: periodTime.period,
        title: `${s.class?.displayName || 'Class'} - ${s.subject?.name || 'Subject'}`,
        room: `${s.room || 'Room'} • ${s.teacher ? `${s.teacher.firstName} ${s.teacher.lastName}` : 'No Teacher'}`,
        badge: 'Scheduled',
        badgeStyle: 'bg-primary-fixed text-primary',
        bg: 'bg-surface-container-highest text-primary'
      };
    });

  // Derive Grade Submission Status grouped by Subject
  const gradesBySubject: { [subjectName: string]: { submitted: number; total: number } } = {};
  (gradesList || []).forEach(g => {
    const subName = g.subject?.name || 'Unknown Subject';
    if (!gradesBySubject[subName]) {
      gradesBySubject[subName] = { submitted: 0, total: 0 };
    }
    gradesBySubject[subName].total += 1;
    if (g.submissionStatus !== 'draft') {
      gradesBySubject[subName].submitted += 1;
    }
  });

  const departmentsData = Object.keys(gradesBySubject).map(subName => {
    const { submitted, total } = gradesBySubject[subName];
    const isCompleted = submitted === total;
    return {
      dept: subName,
      progress: `${submitted}/${total} submitted`,
      status: isCompleted ? 'Completed' : 'In Progress',
      statusStyle: isCompleted ? 'bg-secondary-container/30 text-secondary' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
      action: isCompleted ? 'Review' : 'Remind'
    };
  });

  // Derive Recent Announcements
  const recentAnnouncements = (announcements || []).slice(0, 3).map((ann: any) => {
    const timeStr = new Date(ann.createdAt).toLocaleDateString();
    const authorName = ann.poster ? `${ann.poster.firstName} ${ann.poster.lastName}` : 'System';
    return {
      tag: ann.priority.toUpperCase(),
      tagStyle: ann.priority === 'urgent' ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed',
      time: timeStr,
      title: ann.title,
      body: ann.body,
      author: authorName
    };
  });

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Breadcrumbs & Header */}
        <div className="py-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Home</span>
              <span>/</span>
              <span className="text-primary font-bold">Deputy Head Overview</span>
            </nav>
            <h1 className="dash-page-title">Deputy Head Overview</h1>
            <p className="font-body-md text-on-surface-variant">Welcome back, {fullName}. Monitor overall school operations, administrative tasks, and staff duty logs.</p>
          </div>
        </div>

        {/* Dashboard Canvas */}
        <div className="space-y-lg">
          {/* Hero Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg cards-stagger">
            <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined">event_available</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant">Timetable Status</p>
                <p className="font-headline-sm text-headline-sm text-primary mt-1 font-bold">
                  {loadingTimetable ? '...' : totalSlotsCount > 0 ? `${totalSlotsCount} Slots Scheduled` : 'No slots scheduled'}
                </p>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">upload_file</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant">Grade Submissions</p>
                <p className="font-headline-sm text-headline-sm text-primary mt-1 font-bold">
                  {loadingGrades ? '...' : `${gradeSubmissionRate}% Received`}
                </p>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant">Pending Approvals</p>
                <p className="font-headline-sm text-headline-sm text-error mt-1 font-bold">
                  {loadingGrades ? '...' : `${pendingApprovalsCount} Actions`}
                </p>
              </div>
            </div>
          </div>

          {/* Main Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-lg">
              {/* Today's Timetable Summary */}
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
                  <h3 className="font-title-lg text-title-lg font-semibold text-on-surface">Today's Timetable Summary ({currentDay})</h3>
                </div>
                <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-md">
                  {loadingTimetable ? (
                    <div className="col-span-2 text-center py-6 text-on-surface-variant font-body-sm text-body-sm">Loading timetable slots...</div>
                  ) : todaySlots.length === 0 ? (
                    <div className="col-span-2 text-center py-6 text-on-surface-variant font-body-sm text-body-sm">No classes scheduled for today.</div>
                  ) : todaySlots.map((cls, i) => (
                    <div key={i} className="p-md border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors flex gap-md">
                      <div className={`${cls.bg} w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0`}>
                        <span className="font-label-sm text-label-sm font-semibold">{cls.time}</span>
                        <span className="font-label-sm text-label-sm">{cls.period}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-title-sm text-title-sm font-semibold text-on-surface">{cls.title}</p>
                        <p className="text-label-sm text-on-surface-variant mt-0.5">{cls.room}</p>
                        <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-medium ${cls.badgeStyle}`}>{cls.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Grade Submission Status */}
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant">
                  <h3 className="font-title-lg text-title-lg font-semibold text-on-surface">Grade Submission Status</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead className="bg-surface-container-lowest border-b border-outline-variant">
                      <tr>
                        {['Subject', 'Progress', 'Status', 'Action'].map(h => (
                          <th key={h} className="px-6 py-3 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-body-md divide-y divide-outline-variant">
                      {loadingGrades ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-on-surface-variant text-sm">Loading grade submission status...</td>
                        </tr>
                      ) : departmentsData.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-on-surface-variant text-sm">No grades recorded yet.</td>
                        </tr>
                      ) : departmentsData.map((row, i) => (
                        <tr key={i} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-6 py-4 font-body-md text-body-md font-semibold text-on-surface">{row.dept}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{row.progress}</td>
                          <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-medium uppercase tracking-wider ${row.statusStyle}`}>{row.status}</span></td>
                          <td className="px-6 py-4"><button className="font-label-md text-label-md text-primary font-medium hover:underline">{row.action}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Right Column - Announcements */}
            <aside className="lg:col-span-4 space-y-lg">
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
                  <h3 className="text-title-lg font-bold text-primary">Recent Announcements</h3>
                </div>
                <div className="p-lg overflow-y-auto space-y-lg">
                  {loadingAnnouncements ? (
                    <div className="text-center py-6 text-on-surface-variant text-sm">Loading announcements...</div>
                  ) : recentAnnouncements.length === 0 ? (
                    <div className="text-center py-6 text-on-surface-variant text-sm">No recent announcements.</div>
                  ) : recentAnnouncements.map((ann, i) => (
                    <div key={i} className="pb-6 border-b border-outline-variant last:border-0 last:pb-0 hover:bg-surface-bright transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-label-sm text-label-sm font-medium px-2.5 py-0.5 rounded-full ${ann.tagStyle}`}>{ann.tag}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">{ann.time}</span>
                      </div>
                      <h4 className="font-title-sm text-title-sm font-semibold text-on-surface mb-1">{ann.title}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{ann.body}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-primary font-label-sm text-label-sm font-bold">{ann.author[0]}</div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">{ann.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-margin-desktop pt-lg pb-xs text-center border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant opacity-60">
            © 2026 MyKlasi School Management System. All Rights Reserved.
            <span className="mx-2">|</span>
            Academic Session: 2025/2026
          </p>
        </footer>
      </main>
      <BottomNav />
    </>
  );
};

export default DeputyHeadDashboard;
