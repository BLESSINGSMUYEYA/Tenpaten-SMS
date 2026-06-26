import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';
import { useQuery } from '../hooks/useApi';
import { ClassesManagement } from '../components/academics/ClassesManagement';
import { SubjectsManagement } from '../components/academics/SubjectsManagement';
import { GradeApprovalsPanel } from '../components/academics/GradeApprovalsPanel';
import { ConfigurationsManagement } from '../components/academics/ConfigurationsManagement';

export const HeadTeacherAcademic: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Head Teacher';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'exams' | 'classes' | 'subjects' | 'approvals' | 'configs'>('results');

  // Fetch real grade stats from backend
  const { data: stats, loading, error } = useQuery<any>('/grades/stats');

  const trendColor = (t: string) =>
    t.startsWith('+') ? 'text-secondary' : t.startsWith('-') ? 'text-error' : 'text-on-surface-variant';

  const schoolAverage = stats?.schoolAverage || '0%';
  const topPerformer = stats?.topPerformer || '0%';
  const gradesSubmitted = stats?.gradesSubmitted || '0/0';
  const pendingReports = stats?.pendingReports || '0';
  const performanceBars = stats?.performanceBars || [];
  const barLabels = stats?.barLabels || [];
  const subjects = stats?.subjects || [];
  const examSchedule = stats?.examSchedule || [];

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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-on-surface-variant text-sm font-medium">Fetching academic summary...</p>
          </div>
        ) : error ? (
          <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 my-4 text-center">
            <span className="material-symbols-outlined text-[40px] mb-2">error</span>
            <h3 className="font-bold text-lg mb-1">Failed to load academic data</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'School Average', value: schoolAverage, icon: 'trending_up', color: 'bg-secondary-container text-secondary' },
                { label: 'Top Performer', value: topPerformer, icon: 'emoji_events', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
                { label: 'Grades Submitted', value: gradesSubmitted, icon: 'upload_file', color: 'bg-primary-container text-primary' },
                { label: 'Pending Reports', value: pendingReports, icon: 'pending_actions', color: 'bg-error-container text-on-error-container' },
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
            {performanceBars.length > 0 && (
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
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 bg-surface-container rounded-lg p-1 w-fit mb-4">
              {(['results', 'exams', 'classes', 'subjects', 'approvals', 'configs'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-5 py-2 rounded-md font-bold text-sm capitalize transition-all ${
                    activeTab === t ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {t === 'results'
                    ? 'Grade Results'
                    : t === 'exams'
                    ? 'Exam Schedule'
                    : t === 'classes'
                    ? 'Classes'
                    : t === 'subjects'
                    ? 'Subjects'
                    : t === 'approvals'
                    ? 'Grade Approvals'
                    : 'Configurations'}
                </button>
              ))}
            </div>

            {/* Results Table */}
            {activeTab === 'results' && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant">
                  <h3 className="font-bold text-on-background">Subject Grade Summary</h3>
                </div>
                {subjects.length === 0 ? (
                  <div className="text-center py-10 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">assignment_late</span>
                    <p className="font-medium">No subjects found or grades entered yet</p>
                  </div>
                ) : (
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
                        {subjects.map((s: any, i: number) => (
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
                )}
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
                {examSchedule.length === 0 ? (
                  <div className="text-center py-10 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">event_busy</span>
                    <p className="font-medium">No examinations scheduled yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant">
                    {examSchedule.map((e: any, i: number) => (
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
                )}
              </div>
            )}

            {/* Classes Management */}
            {activeTab === 'classes' && <ClassesManagement />}

            {/* Subjects Management */}
            {activeTab === 'subjects' && <SubjectsManagement />}

            {/* Grade Approvals */}
            {activeTab === 'approvals' && <GradeApprovalsPanel />}

            {/* School Configurations */}
            {activeTab === 'configs' && <ConfigurationsManagement />}
          </>
        )}

        <footer className="mt-8 pt-6 pb-2 text-center border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant opacity-60">© 2026 MyKlasi School Management System. Academic Session: 2025/2026</p>
        </footer>
      </main>
      <BottomNav />
    </>
  );
};

export default HeadTeacherAcademic;
