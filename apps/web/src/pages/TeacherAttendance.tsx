import { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';
import { useQuery, useMutation } from '../hooks/useApi';
import { useOnline } from '../contexts/OnlineContext';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface StudentRecord {
  id: string;
  admissionNumber: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ClassRecord {
  id: string;
  displayName: string;
}

interface TermRecord {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface AttendanceItem {
  id: string;
  date: string;
  status: string;
  studentId: string;
  student: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export const TeacherAttendance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const { isOnline, refreshPendingCount } = useOnline();

  const [view, setView] = useState<'today' | 'history'>('today');

  // Today Tab state
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [todayStatuses, setTodayStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [todaySearch, setTodaySearch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedOffline, setSubmittedOffline] = useState(false);

  // History Tab state
  const [historySearch, setHistorySearch] = useState('');
  const [historyClassId, setHistoryClassId] = useState('');

  // Queries — offline fallback built into useQuery
  const { data: classList, isFromCache: classesFromCache } = useQuery<ClassRecord[]>('/schools/classes');
  const { data: termList, isFromCache: termsFromCache } = useQuery<TermRecord[]>('/schools/terms');

  // Fetch students for selected class
  const { data: studentList, loading: loadingStudents, isFromCache: studentsFromCache } = useQuery<StudentRecord[]>(
    `/people/students?classId=${selectedClassId}`,
    !!selectedClassId,
    [selectedClassId]
  );

  // Fetch student lists for history
  const { data: histStudentList } = useQuery<StudentRecord[]>(
    `/people/students?classId=${historyClassId}`,
    !!historyClassId,
    [historyClassId]
  );

  // Fetch history attendance records
  const { data: historyRecords, refetch: refetchHistory } = useQuery<AttendanceItem[]>(
    `/attendance?classId=${historyClassId || 'none'}`,
    !!historyClassId,
    [historyClassId]
  );

  // Mutation — queues offline when network is unavailable
  const { mutate: markAttendance, loading: marking } = useMutation('/attendance/mark', 'post');

  // Automatically select current class and term
  useEffect(() => {
    if (classList && classList.length > 0 && !selectedClassId) {
      setSelectedClassId(classList[0].id);
      setHistoryClassId(classList[0].id);
    }
  }, [classList]);

  useEffect(() => {
    if (termList && termList.length > 0 && !selectedTermId) {
      const current = termList.find(t => t.isCurrent) || termList[0];
      setSelectedTermId(current.id);
    }
  }, [termList]);

  // Set default statuses to present
  useEffect(() => {
    if (studentList) {
      const initialStatuses: Record<string, AttendanceStatus> = {};
      studentList.forEach(s => {
        initialStatuses[s.id] = 'present';
      });
      setTodayStatuses(initialStatuses);
      setSubmitted(false);
      setSubmittedOffline(false);
    }
  }, [studentList]);

  const filteredToday = (studentList || []).filter(s =>
    `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(todaySearch.toLowerCase())
  );

  const filteredHistStudents = (histStudentList || []).filter(s =>
    `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(historySearch.toLowerCase())
  );

  const cycleStatus = (studentId: string) => {
    setTodayStatuses(prev => {
      const cur = prev[studentId];
      const next: AttendanceStatus = cur === 'present' ? 'absent' : cur === 'absent' ? 'late' : 'present';
      return { ...prev, [studentId]: next };
    });
  };

  const markAll = (status: AttendanceStatus) => {
    if (!studentList) return;
    const updated: Record<string, AttendanceStatus> = {};
    studentList.forEach(s => {
      updated[s.id] = status;
    });
    setTodayStatuses(updated);
  };

  const submitAttendance = async () => {
    if (!selectedClassId || !selectedTermId || !studentList) return;

    const todayDateStr = new Date().toISOString().split('T')[0];
    const records = studentList.map(s => ({
      studentId: s.id,
      status: todayStatuses[s.id] || 'present',
    }));

    try {
      const result = await markAttendance({
        classId: selectedClassId,
        termId: selectedTermId,
        date: todayDateStr,
        type: 'morning',
        records,
      }) as any;

      if (result?._offline) {
        setSubmittedOffline(true);
        // Let OnlineContext know there's a new pending record
        await refreshPendingCount();
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper stats for today
  const presentToday = Object.values(todayStatuses).filter(s => s === 'present').length;
  const absentToday = Object.values(todayStatuses).filter(s => s === 'absent').length;
  const lateToday = Object.values(todayStatuses).filter(s => s === 'late').length;

  // History parsing
  const dateGroups = useMemo(() => {
    if (!historyRecords) return [];
    const dateSet = new Set(historyRecords.map(r => r.date.split('T')[0]));
    return Array.from(dateSet).sort().reverse().slice(0, 7);
  }, [historyRecords]);

  const getStudentStats = (studentId: string, dateStr: string) => {
    if (!historyRecords) return null;
    const record = historyRecords.find(r => r.studentId === studentId && r.date.split('T')[0] === dateStr);
    return record ? record.status : null;
  };

  // Offline data freshness indicator
  const showCacheBadge = !isOnline && (classesFromCache || termsFromCache || studentsFromCache);

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-4 md:px-8 min-h-screen bg-surface text-on-surface transition-colors">
        {/* Page Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="dash-page-title">Class Attendance</h1>
            <p className="font-body-md text-on-surface-variant">
              Mark today's register or review historical records.
            </p>
            {/* Offline cache notice */}
            {showCacheBadge && (
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                <span>📦</span> Showing cached data — connect to refresh
              </span>
            )}
          </div>
          {view === 'today' && !submitted && !submittedOffline && (
            <div className="flex gap-2">
              <button
                onClick={() => markAll('present')}
                className="flex items-center gap-1.5 px-4 py-2 bg-surface-container border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-all font-label-md"
              >
                All Present
              </button>
              <button
                onClick={submitAttendance}
                disabled={marking || loadingStudents}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all font-label-md shadow-sm disabled:opacity-50"
              >
                {marking ? 'Saving...' : !isOnline ? '📥 Save Offline' : 'Submit Register'}
              </button>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6 border-b border-outline-variant">
          {(['today', 'history'] as const).map(v => (
            <button
              key={v}
              onClick={() => { setView(v); if (v === 'history' && historyClassId) refetchHistory(); }}
              className={`px-5 py-2 font-label-md font-bold border-b-2 transition-all capitalize ${
                view === v ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {v === 'today' ? '📋 Take Attendance' : '📊 History & Reports'}
            </button>
          ))}
        </div>

        {/* TODAY'S REGISTER */}
        {view === 'today' && (
          <div>
            <div className="bg-primary-container text-on-primary-container rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">
                  Register Settings
                </span>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-on-primary-container/75 font-bold">Class</span>
                    <select
                      value={selectedClassId}
                      onChange={e => setSelectedClassId(e.target.value)}
                      className="bg-transparent border-b border-on-primary-container font-bold text-sm outline-none cursor-pointer py-1"
                    >
                      {(classList || []).map(c => (
                        <option key={c.id} value={c.id} className="text-on-surface">{c.displayName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-on-primary-container/75 font-bold">Term</span>
                    <select
                      value={selectedTermId}
                      onChange={e => setSelectedTermId(e.target.value)}
                      className="bg-transparent border-b border-on-primary-container font-bold text-sm outline-none cursor-pointer py-1"
                    >
                      {(termList || []).map(t => (
                        <option key={t.id} value={t.id} className="text-on-surface">{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submission status badges */}
              {submitted && (
                <div className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-xl font-label-md font-bold">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Register Submitted!
                </div>
              )}
              {submittedOffline && (
                <div className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl font-label-md font-bold">
                  <span className="material-symbols-outlined text-[18px]">cloud_off</span>
                  Saved Offline — will sync when connected
                </div>
              )}
            </div>

            {/* Counters */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Present', value: presentToday, color: 'text-secondary', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20' },
                { label: 'Absent', value: absentToday, color: 'text-error', bg: 'bg-red-50 dark:bg-red-950/20 border-red-500/20' },
                { label: 'Late', value: lateToday, color: 'text-tertiary', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-500/20' },
              ].map(s => (
                <div key={s.label} className={`border rounded-2xl p-4 text-center shadow-sm ${s.bg}`}>
                  <p className="dash-card-label">{s.label}</p>
                  <p className={`dash-card-value mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-4 w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
              <input
                type="text"
                placeholder="Search student…"
                value={todaySearch}
                onChange={e => setTodaySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none bg-surface-container text-on-surface font-body-sm transition-colors"
              />
            </div>

            {/* Student register cards */}
            {loadingStudents ? (
              <p className="text-center py-6 text-on-surface-variant">Loading students list...</p>
            ) : filteredToday.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredToday.map(student => {
                  const status = todayStatuses[student.id] || 'present';
                  const badgeMap: Record<AttendanceStatus, string> = {
                    present: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    absent:  'bg-red-100 text-red-800 border-red-200',
                    late:    'bg-amber-100 text-amber-800 border-amber-200',
                  };
                  return (
                    <div
                      key={student.id}
                      className="flex justify-between items-center py-2.5 px-4 border border-outline-variant rounded-xl shadow-sm bg-surface-container-lowest"
                    >
                      <div>
                        <h3 className="font-label-lg font-bold text-on-surface">
                          {student.user.firstName} {student.user.lastName}
                        </h3>
                        <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 border text-[9px] font-bold rounded-full uppercase tracking-wider ${badgeMap[status]}`}>
                          {status}
                        </span>
                      </div>
                      <button
                        onClick={() => cycleStatus(student.id)}
                        disabled={submitted || submittedOffline}
                        className="p-1.5 bg-surface-container border border-outline-variant rounded-lg text-on-surface-variant hover:text-primary active:scale-90 transition-transform disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-on-surface-variant">No students in this class register.</div>
            )}
          </div>
        )}

        {/* HISTORY & REPORTS */}
        {view === 'history' && (
          <div>
            {!isOnline && (
              <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">cloud_off</span>
                Attendance history is not available offline. Connect to the internet to view history.
              </div>
            )}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Class</label>
                  <select
                    value={historyClassId}
                    onChange={e => setHistoryClassId(e.target.value)}
                    className="px-3 py-2 font-body-sm border border-outline-variant bg-surface-container text-on-surface outline-none rounded"
                  >
                    {(classList || []).map(c => (
                      <option key={c.id} value={c.id}>{c.displayName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
                <input
                  type="text"
                  placeholder="Search student…"
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none bg-transparent text-on-surface font-body-sm"
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden font-body-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b border-outline-variant">
                      <th className="py-3 px-4 font-bold font-label-sm uppercase text-on-surface-variant min-w-[150px]">Student</th>
                      {dateGroups.map(dateStr => (
                        <th key={dateStr} className="py-3 px-4 text-center font-bold font-label-sm uppercase text-on-surface-variant whitespace-nowrap">
                          {new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {filteredHistStudents.length > 0 ? (
                      filteredHistStudents.map(student => (
                        <tr key={student.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-3 px-4 font-bold text-primary">
                            {student.user.firstName} {student.user.lastName}
                          </td>
                          {dateGroups.map(dateStr => {
                            const status = getStudentStats(student.id, dateStr);
                            return (
                              <td key={dateStr} className="py-3 px-4 text-center">
                                {status ? (
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                    status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                                    status === 'absent' ? 'bg-red-100 text-red-800' :
                                    'bg-amber-100 text-amber-800'
                                  }`}>
                                    {status}
                                  </span>
                                ) : (
                                  <span className="text-outline">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={dateGroups.length + 1} className="py-12 text-center text-on-surface-variant">
                          No history matched search parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
};
