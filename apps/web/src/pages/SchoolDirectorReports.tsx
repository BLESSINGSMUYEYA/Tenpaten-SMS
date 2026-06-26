import React, { useState } from 'react';
import { Sidebar } from '../components/SchoolDirectorDashboard/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';

const performanceData = [75, 80, 72, 88, 85, 90, 87];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

const subjectPerformance = [
  { subject: 'Mathematics', avg: 72, color: 'bg-primary' },
  { subject: 'English',     avg: 85, color: 'bg-secondary' },
  { subject: 'Science',     avg: 78, color: 'bg-tertiary' },
  { subject: 'Chichewa',    avg: 91, color: 'bg-primary-fixed' },
  { subject: 'Social Stud.',avg: 83, color: 'bg-secondary-container' },
];

const gradeEnrollment = [
  { grade: 'Gr 1', students: 120 },
  { grade: 'Gr 2', students: 115 },
  { grade: 'Gr 3', students: 130 },
  { grade: 'Gr 4', students: 98 },
  { grade: 'Gr 5', students: 110 },
  { grade: 'Gr 6', students: 105 },
  { grade: 'Gr 7', students: 89 },
  { grade: 'Gr 8', students: 81 },
];

const maxEnrollment = Math.max(...gradeEnrollment.map(g => g.students));

export const SchoolDirectorReports: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'academic' | 'finance' | 'enrollment'>('academic');

  const maxPerf = Math.max(...performanceData);

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 bg-surface-bright overflow-y-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="dash-page-title mb-1">Reports & Analytics</h1>
              <p className="font-body-md text-on-surface-variant">Institutional performance insights and data analysis.</p>
            </div>
            <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:opacity-90 transition-all active:scale-95 shadow-sm self-start sm:self-auto">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Report
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 bg-surface-container p-1 rounded-xl mb-6 w-fit">
            {(['academic', 'finance', 'enrollment'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg font-label-md font-semibold transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Academic tab */}
          {activeTab === 'academic' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Pass rate trend chart */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                  <h2 className="font-title-lg text-title-lg font-semibold text-on-surface">Average Pass Rate — 2026</h2>
                  <span className="font-label-sm text-primary font-semibold">Term 1 to Term 3</span>
                </div>
                <div className="p-6">
                  <div className="flex items-end gap-3 h-48">
                    {performanceData.map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="font-label-sm text-primary font-bold">{v}%</span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-container transition-all hover:opacity-80"
                          style={{ height: `${(v / maxPerf) * 100}%` }}
                        />
                        <span className="font-label-sm text-on-surface-variant text-[10px]">{months[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subject performance */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                  <h2 className="font-title-lg text-title-lg font-semibold text-on-surface">Subject Performance</h2>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  {subjectPerformance.map(s => (
                    <div key={s.subject}>
                      <div className="flex justify-between mb-1.5">
                        <span className="font-label-md text-on-surface font-semibold">{s.subject}</span>
                        <span className="font-label-md text-on-surface-variant">{s.avg}% avg</span>
                      </div>
                      <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.color} transition-all duration-700`}
                          style={{ width: `${s.avg}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enrollment tab */}
          {activeTab === 'enrollment' && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <h2 className="font-title-lg text-title-lg font-semibold text-on-surface">Students per Grade</h2>
                <span className="font-label-sm text-on-surface-variant">
                  Total: {gradeEnrollment.reduce((a, g) => a + g.students, 0)} students
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-end gap-3 h-56">
                  {gradeEnrollment.map((g, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="font-label-sm text-secondary font-bold">{g.students}</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-secondary to-secondary-container hover:opacity-80 transition-all"
                        style={{ height: `${(g.students / maxEnrollment) * 100}%` }}
                      />
                      <span className="font-label-sm text-on-surface-variant text-[10px]">{g.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Finance tab */}
          {activeTab === 'finance' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              {[
                { label: 'Total Collected',   value: 'MK 4.2M', icon: 'payments',       color: 'text-primary',   bg: 'bg-primary-container/30' },
                { label: 'Outstanding',       value: 'MK 1.3M', icon: 'pending',         color: 'text-error',     bg: 'bg-error-container/30' },
                { label: 'Collection Rate',   value: '76.4%',   icon: 'trending_up',     color: 'text-secondary', bg: 'bg-secondary-container/30' },
              ].map(c => (
                <div key={c.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-label-md text-on-surface-variant">{c.label}</span>
                    <div className={`p-2 rounded-lg ${c.bg}`}>
                      <span className={`material-symbols-outlined text-[20px] ${c.color}`}>{c.icon}</span>
                    </div>
                  </div>
                  <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{c.value}</p>
                </div>
              ))}
              <div className="sm:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                <h3 className="font-title-md font-semibold text-on-surface mb-4">Fee Collection Progress</h3>
                <div className="w-full h-4 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                    style={{ width: '76.4%' }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-label-sm text-primary">MK 4.2M collected (76.4%)</span>
                  <span className="font-label-sm text-on-surface-variant">Target: MK 5.5M</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SchoolDirectorReports;
