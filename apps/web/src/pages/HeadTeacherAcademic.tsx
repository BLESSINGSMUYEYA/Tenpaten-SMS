import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';
import { useQuery } from '../hooks/useApi';
import { api } from '../services/api';
import { ClassesManagement } from '../components/academics/ClassesManagement';
import { SubjectsManagement } from '../components/academics/SubjectsManagement';
import { RoomsManagement } from '../components/academics/RoomsManagement';
import { GradeApprovalsPanel } from '../components/academics/GradeApprovalsPanel';
import { ConfigurationsManagement } from '../components/academics/ConfigurationsManagement';

export const HeadTeacherAcademic: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Head Teacher';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'exams' | 'classes' | 'subjects' | 'rooms' | 'approvals' | 'configs'>('results');

  // Fetch real grade stats from backend
  const { data: stats, loading, error, refetch: refetchStats } = useQuery<any>('/grades/stats');

  // Fetch real exams, classes, subjects, terms
  const { data: exams, refetch: refetchExams } = useQuery<any[]>('/schools/exams');
  const { data: classes } = useQuery<any[]>('/schools/classes');
  const { data: subjectsList } = useQuery<any[]>('/schools/subjects');
  const { data: terms } = useQuery<any[]>('/schools/terms');

  const currentTerm = terms?.find((t: any) => t.isCurrent) || terms?.[0];

  // Exam Form State
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examSubjectId, setExamSubjectId] = useState('');
  const [examClassId, setExamClassId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('08:00 – 11:00');
  const [examVenue, setExamVenue] = useState('Main Hall');
  const [examStatus, setExamStatus] = useState('Upcoming');

  const handleOpenAddModal = () => {
    setEditingExamId(null);
    setExamSubjectId(subjectsList?.[0]?.id || '');
    setExamClassId(classes?.[0]?.id || '');
    setExamDate('');
    setExamTime('08:00 – 11:00');
    setExamVenue('Main Hall');
    setExamStatus('Upcoming');
    setFormError(null);
    setIsExamModalOpen(true);
  };

  const handleOpenEditModal = (exam: any) => {
    setEditingExamId(exam.id);
    setExamSubjectId(exam.subjectId || exam.subject?.id || '');
    setExamClassId(exam.classId || exam.class?.id || '');
    const d = new Date(exam.date);
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
    setExamDate(dateStr);
    setExamTime(exam.time);
    setExamVenue(exam.venue);
    setExamStatus(exam.status);
    setFormError(null);
    setIsExamModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examSubjectId || !examClassId || !examDate || !examTime || !examVenue) {
      setFormError('All fields are required');
      return;
    }

    const termId = currentTerm?.id;
    if (!termId) {
      setFormError('No current term configured. Please configure an academic term first.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      termId,
      classId: examClassId,
      subjectId: examSubjectId,
      date: new Date(examDate).toISOString(),
      time: examTime,
      venue: examVenue,
      status: examStatus,
    };

    try {
      if (editingExamId) {
        await api.patch(`/schools/exams/${editingExamId}`, payload);
      } else {
        await api.post('/schools/exams', payload);
      }
      setIsExamModalOpen(false);
      refetchExams();
      refetchStats();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to save exam schedule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the exam schedule for "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/schools/exams/${id}`);
      refetchExams();
      refetchStats();
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete exam schedule. Please try again.');
    }
  };

  const trendColor = (t: string) =>
    t.startsWith('+') ? 'text-secondary' : t.startsWith('-') ? 'text-error' : 'text-on-surface-variant';

  const schoolAverage = stats?.schoolAverage || '0%';
  const topPerformer = stats?.topPerformer || '0%';
  const gradesSubmitted = stats?.gradesSubmitted || '0/0';
  const pendingReports = stats?.pendingReports || '0';
  const performanceBars = stats?.performanceBars || [];
  const barLabels = stats?.barLabels || [];
  const subjects = stats?.subjects || [];

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
              {(['results', 'exams', 'classes', 'subjects', 'rooms', 'approvals', 'configs'] as const).map(t => (
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
                    : t === 'rooms'
                    ? 'Rooms'
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
                  <button
                    onClick={handleOpenAddModal}
                    className="text-primary font-bold text-xs hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Add Exam
                  </button>
                </div>
                {!exams || exams.length === 0 ? (
                  <div className="text-center py-10 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">event_busy</span>
                    <p className="font-medium">No examinations scheduled yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant">
                    {exams.map((e: any) => {
                      const d = new Date(e.date);
                      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const formattedDay = days[d.getDay()] || 'Day';
                      const formattedMonth = `${d.getDate()} ${months[d.getMonth()] || ''}`;

                      return (
                        <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors">
                          <div className="w-14 h-14 rounded-xl bg-primary-container text-primary flex flex-col items-center justify-center shrink-0">
                            <span className="text-xs font-bold">{formattedDay}</span>
                            <span className="text-xs">{formattedMonth}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-on-surface text-sm">{e.subject?.name}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{e.time} · {e.venue} · {e.class?.displayName}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-container text-on-primary-container uppercase">{e.status}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditModal(e)}
                                className="text-primary hover:bg-primary-container/20 p-1.5 rounded transition-colors"
                                title="Edit Exam"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteExam(e.id, e.subject?.name)}
                                className="text-error hover:bg-error-container/20 p-1.5 rounded transition-colors"
                                title="Delete Exam"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Classes Management */}
            {activeTab === 'classes' && <ClassesManagement />}

            {/* Subjects Management */}
            {activeTab === 'subjects' && <SubjectsManagement />}

            {/* Rooms Management */}
            {activeTab === 'rooms' && <RoomsManagement />}

            {/* Grade Approvals */}
            {activeTab === 'approvals' && <GradeApprovalsPanel />}

            {/* School Configurations */}
            {activeTab === 'configs' && <ConfigurationsManagement />}
          </>
        )}

        {/* Exam Modal */}
        {isExamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary font-bold">
                  {editingExamId ? 'Edit Exam Schedule' : 'Schedule New Exam'}
                </h3>
                <button
                  onClick={() => setIsExamModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3.5 bg-error-container text-on-error-container rounded-lg text-xs font-semibold border border-error/20 flex gap-2 items-center">
                  <span className="material-symbols-outlined text-sm shrink-0">error</span>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveExam} className="space-y-5">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Subject</label>
                  <select
                    required
                    value={examSubjectId}
                    onChange={(e) => setExamSubjectId(e.target.value)}
                    className="w-full px-3 py-2.5 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  >
                    <option value="" disabled>Select Subject</option>
                    {subjectsList?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Class / Grade</label>
                  <select
                    required
                    value={examClassId}
                    onChange={(e) => setExamClassId(e.target.value)}
                    className="w-full px-3 py-2.5 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  >
                    <option value="" disabled>Select Class</option>
                    {classes?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.displayName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Date</label>
                    <input
                      type="date"
                      required
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 08:00 – 11:00"
                      value={examTime}
                      onChange={(e) => setExamTime(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Hall, Room 4"
                    value={examVenue}
                    onChange={(e) => setExamVenue(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Status</label>
                  <select
                    value={examStatus}
                    onChange={(e) => setExamStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setIsExamModalOpen(false)}
                    className="px-5 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Exam'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
