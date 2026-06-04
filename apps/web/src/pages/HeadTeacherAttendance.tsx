import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';

const classes = [
  { name: 'Form 1A', teacher: 'Mr. Mwale', total: 45, present: 43, absent: 2, rate: 95.6 },
  { name: 'Form 1B', teacher: 'Ms. Phiri', total: 44, present: 40, absent: 4, rate: 90.9 },
  { name: 'Form 2A', teacher: 'Mr. Tembo', total: 42, present: 42, absent: 0, rate: 100 },
  { name: 'Form 2B', teacher: 'Mrs. Msiska', total: 41, present: 33, absent: 8, rate: 80.5 },
  { name: 'Form 3A', teacher: 'Mr. Banda', total: 38, present: 37, absent: 1, rate: 97.4 },
  { name: 'Form 3B', teacher: 'Mrs. Chimwaza', total: 39, present: 35, absent: 4, rate: 89.7 },
  { name: 'Form 4A', teacher: 'Mr. Mwale', total: 36, present: 36, absent: 0, rate: 100 },
  { name: 'Form 4B', teacher: 'Mr. Banda', total: 35, present: 32, absent: 3, rate: 91.4 },
];

const weekTrend = [93.2, 94.8, 96.5, 91.1, 95.3];
const trendLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const HeadTeacherAttendance: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Head Teacher';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-05-28');

  const rateColor = (rate: number) => {
    if (rate >= 95) return 'text-secondary bg-secondary-container/40';
    if (rate >= 85) return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30';
    return 'text-on-error-container bg-error-container';
  };

  const totalPresent = classes.reduce((a, c) => a + c.present, 0);
  const totalStudents = classes.reduce((a, c) => a + c.total, 0);
  const overallRate = ((totalPresent / totalStudents) * 100).toFixed(1);

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
              <span className="text-primary font-bold">Attendance</span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">Attendance</h1>
            <p className="font-body-md text-on-surface-variant">School-wide daily attendance tracker, {fullName}.</p>
          </div>
          <div className="flex gap-3 items-center self-start md:self-end">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-outline-variant rounded-lg px-4 py-2.5 text-sm bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
            />
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm text-sm">
              <span className="material-symbols-outlined text-[18px]">download</span> Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Overall Rate', value: `${overallRate}%`, icon: 'how_to_reg', color: 'bg-secondary-container text-secondary' },
            { label: 'Present Today', value: `${totalPresent}`, icon: 'check_circle', color: 'bg-primary-container text-primary' },
            { label: 'Absent Today', value: `${totalStudents - totalPresent}`, icon: 'cancel', color: 'bg-error-container text-on-error-container' },
            { label: 'Classes Below 85%', value: `${classes.filter(c => c.rate < 85).length}`, icon: 'warning', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
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

        {/* Weekly Trend Chart */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-on-background mb-4">This Week's Attendance Trend</h3>
          <div className="flex items-end gap-4 h-32">
            {weekTrend.map((rate, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-on-surface-variant">{rate}%</span>
                <div
                  className={`w-full rounded-t-md transition-colors ${rate >= 95 ? 'bg-secondary-container hover:bg-secondary' : rate >= 85 ? 'bg-amber-200 hover:bg-amber-400' : 'bg-error-container hover:bg-error'}`}
                  style={{ height: `${rate - 70}%`, minHeight: '8px', maxHeight: '100%' }}
                />
                <span className="text-xs text-on-surface-variant font-medium">{trendLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Class Breakdown */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-bold text-on-background">Class Attendance Breakdown</h3>
            <span className="text-label-sm text-on-surface-variant">{selectedDate}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {['Class', 'Class Teacher', 'Total', 'Present', 'Absent', 'Rate', 'Action'].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {classes.map((c, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface text-sm">{c.name}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{c.teacher}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{c.total}</td>
                    <td className="px-6 py-4 text-secondary font-bold text-sm">{c.present}</td>
                    <td className="px-6 py-4 text-error font-bold text-sm">{c.absent}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${rateColor(c.rate)}`}>{c.rate}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-primary font-bold text-xs hover:underline">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-8 pt-6 pb-2 text-center border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant opacity-60">© 2026 Tenpaten School Management System. Academic Session: 2025/2026</p>
        </footer>
      </main>
      <BottomNav />
    </>
  );
};

export default HeadTeacherAttendance;
