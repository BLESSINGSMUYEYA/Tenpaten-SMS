import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';
import { useQuery, useMutation } from '../hooks/useApi';
import { Link } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = 'present' | 'absent' | 'late';

interface TimetableSlot {
  id: string;
  day: string;
  periodNumber: number;
  room?: string;
  class: { id: string; displayName: string };
  subject: { id: string; name: string; code: string };
}

interface StudentRecord {
  id: string;
  admissionNumber: string;
  user: { id: string; firstName: string; lastName: string };
}

interface TermRecord {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface GradeRecord {
  id: string;
  submissionStatus: string;
  classId: string;
  subjectId: string;
}

interface MessageRecord {
  id: string;
  subject: string;
  body: string;
  createdAt: string;
  sender: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

// ─── Day mapping ──────────────────────────────────────────────────────────────
const JS_DAY_TO_API: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
};

// ─── Quick Attendance Modal ───────────────────────────────────────────────────
interface QuickAttendanceModalProps {
  classSlot: TimetableSlot;
  students: StudentRecord[];
  termId: string;
  onClose: () => void;
}

const QuickAttendanceModal: React.FC<QuickAttendanceModalProps> = ({
  classSlot,
  students,
  termId,
  onClose,
}) => {
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const init: Record<string, AttendanceStatus> = {};
    students.forEach(s => { init[s.id] = 'present'; });
    return init;
  });
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { mutate: markAttendance } = useMutation('/attendance/mark', 'post');

  const cycle = (id: string) => {
    setStatuses(prev => {
      const cur = prev[id];
      const next: AttendanceStatus = cur === 'present' ? 'absent' : cur === 'absent' ? 'late' : 'present';
      return { ...prev, [id]: next };
    });
  };

  const markAll = (s: AttendanceStatus) =>
    setStatuses(() => Object.fromEntries(students.map(st => [st.id, s])));

  const filtered = students.filter(s =>
    `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    present: Object.values(statuses).filter(s => s === 'present').length,
    absent: Object.values(statuses).filter(s => s === 'absent').length,
    late: Object.values(statuses).filter(s => s === 'late').length,
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const todayDateStr = new Date().toISOString().split('T')[0];
      await markAttendance({
        classId: classSlot.class.id,
        termId,
        date: todayDateStr,
        type: 'morning',
        records: students.map(s => ({
          studentId: s.id,
          status: statuses[s.id] || 'present',
        })),
      });
      setSaved(true);
    } catch (err) {
      console.error('Failed to save attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  const statusStyles: Record<AttendanceStatus, { border: string; icon: string; text: string }> = {
    present: { border: 'border-secondary bg-secondary/5', icon: 'check_circle', text: 'text-secondary' },
    absent: { border: 'border-error bg-error/5', icon: 'cancel', text: 'text-error' },
    late: { border: 'border-tertiary bg-tertiary/5', icon: 'schedule', text: 'text-tertiary' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-surface-border dark:border-outline-variant">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded uppercase tracking-wider">
                  Period {classSlot.periodNumber}
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {classSlot.class.displayName} — {classSlot.subject.name}
              </h3>
              {classSlot.room && (
                <p className="font-body-sm text-outline flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[13px]">location_on</span>
                  {classSlot.room}
                </p>
              )}
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Counters */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Present', value: counts.present, color: 'text-secondary', bg: 'bg-secondary/10 border-secondary/20' },
              { label: 'Absent', value: counts.absent, color: 'text-error', bg: 'bg-error/10 border-error/20' },
              { label: 'Late', value: counts.late, color: 'text-tertiary', bg: 'bg-tertiary/10 border-tertiary/20' },
            ].map((c) => (
              <div key={c.label} className={`border rounded-xl py-2 text-center ${c.bg}`}>
                <p className="font-label-sm text-label-sm text-on-surface-variant font-medium">{c.label}</p>
                <p className={`font-title-lg text-title-lg font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Quick mark-all */}
          <div className="flex gap-2">
            <button onClick={() => markAll('present')}
              className="flex-1 py-1.5 font-label-md text-label-md font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary/5 transition-colors active:scale-95">
              ✓ All Present
            </button>
            <button onClick={() => markAll('absent')}
              className="flex-1 py-1.5 font-label-md text-label-md font-medium text-error border border-error rounded-lg hover:bg-error/5 transition-colors active:scale-95">
              ✗ All Absent
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
            <input type="text" placeholder="Search student…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant focus:border-primary outline-none rounded-xl text-on-surface font-body-md text-body-md transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-1.5">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-on-surface-variant text-sm">No students in this class.</p>
          ) : (
            filtered.map((student) => {
              const status = statuses[student.id] || 'present';
              const s = statusStyles[status];
              return (
                <div key={student.id}
                  className={`border rounded-xl px-3 py-2 flex items-center justify-between gap-3 transition-all ${s.border}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold flex items-center justify-center flex-shrink-0">
                      {student.user.firstName.charAt(0)}{student.user.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-title-sm text-title-sm text-on-surface font-semibold">
                        {student.user.firstName} {student.user.lastName}
                      </p>
                      <div className={`flex items-center gap-1 font-label-sm text-label-sm font-medium ${s.text}`}>
                        <span className="material-symbols-outlined text-[12px]">{s.icon}</span>
                        {status}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => cycle(student.id)} disabled={saved || saving}
                    className="p-1 rounded-full hover:bg-surface-container-high active:scale-90 transition-all disabled:opacity-40">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">swap_horiz</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-surface-border dark:border-outline-variant">
          {saved ? (
            <div className="flex items-center justify-center gap-2 py-2 text-secondary font-title-sm text-title-sm font-semibold">
              <span className="material-symbols-outlined">task_alt</span>
              Attendance saved — {counts.present}P · {counts.absent}A · {counts.late}L
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-2.5 border border-outline text-on-surface-variant font-label-md text-label-md font-medium rounded-xl hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || students.length === 0}
                className="flex-1 py-2.5 bg-primary text-on-primary font-label-md text-label-md font-medium rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Register'}
              </button>
            </div>
          )}
          <p className="text-center text-[11px] text-outline mt-2">Tap the arrows to cycle: Present → Absent → Late</p>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Teacher';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [quickAttendanceOpen, setQuickAttendanceOpen] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const { data: timetableSlots } = useQuery<TimetableSlot[]>('/timetable');
  const { data: termList } = useQuery<TermRecord[]>('/schools/terms');
  const { data: grades } = useQuery<GradeRecord[]>('/grades');
  const { data: messages } = useQuery<MessageRecord[]>('/messages');

  // Current term
  const currentTerm = termList?.find(t => t.isCurrent) || termList?.[0];

  // Today's day (Mon, Tue, etc.)
  const todayApiDay = JS_DAY_TO_API[new Date().getDay()];

  // Slots for today
  const todaySlots = useMemo(() => {
    if (!timetableSlots || !todayApiDay) return [];
    return [...timetableSlots]
      .filter(s => s.day === todayApiDay)
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }, [timetableSlots, todayApiDay]);

  // Current/next slot (first = current)
  const currentSlot = todaySlots[0];

  // Fetch students for the current class (so Quick Attendance modal has real data)
  const { data: currentClassStudents } = useQuery<StudentRecord[]>(
    `/people/students?classId=${currentSlot?.class.id || ''}`,
    !!currentSlot?.class.id,
    [currentSlot?.class.id]
  );

  // Grade submission stats
  const pendingGrades = useMemo(() => {
    return (grades || []).filter(g => g.submissionStatus === 'draft').length;
  }, [grades]);

  const submittedGrades = useMemo(() => {
    return (grades || []).filter(g => g.submissionStatus === 'submitted' || g.submissionStatus === 'approved').length;
  }, [grades]);

  // Grade breakdown by unique class-subject combo
  const gradeGroups = useMemo(() => {
    const map = new Map<string, { label: string; total: number; graded: number }>();
    (grades || []).forEach(g => {
      const key = `${g.classId}-${g.subjectId}`;
      const slot = timetableSlots?.find(s => s.class.id === g.classId && s.subject.id === g.subjectId);
      const label = slot
        ? `${slot.class.displayName} — ${slot.subject.name}`
        : `Class ${g.classId.slice(0, 6)}`;
      if (!map.has(key)) {
        map.set(key, { label, total: 0, graded: 0 });
      }
      const entry = map.get(key)!;
      entry.total++;
      if (g.submissionStatus !== 'draft' || (grades || []).find(gr => gr.id === g.id && gr.submissionStatus !== 'draft')) {
        // Count graded (has any mark)
      }
      entry.graded++;
    });
    return Array.from(map.values()).slice(0, 3);
  }, [grades, timetableSlots]);

  // Unique class count (from timetable)
  const uniqueClassCount = useMemo(() => {
    return new Set((timetableSlots || []).map(s => s.class.id)).size;
  }, [timetableSlots]);

  // Recent messages (last 3)
  const recentMessages = useMemo(() => {
    return (messages || []).slice(0, 3);
  }, [messages]);

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      {/* Quick Attendance Modal */}
      {quickAttendanceOpen && currentSlot && currentTerm && (
        <QuickAttendanceModal
          classSlot={currentSlot}
          students={currentClassStudents || []}
          termId={currentTerm.id}
          onClose={() => setQuickAttendanceOpen(false)}
        />
      )}

      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        <div className="max-w-[1440px] mx-auto">
          <header className="mb-lg">
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Welcome back, {fullName}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {todaySlots.length > 0
                ? `You have ${todaySlots.length} class${todaySlots.length !== 1 ? 'es' : ''} today${pendingGrades > 0 ? ` and ${pendingGrades} grade${pendingGrades !== 1 ? 's' : ''} pending submission` : ''}.`
                : 'No classes scheduled today.'}
            </p>
          </header>

          <div className="grid grid-cols-12 gap-md">
            {/* Today's Timetable */}
            <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="px-md py-sm bg-surface-container-low flex justify-between items-center border-b border-outline-variant">
                <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Today's Timetable</h3>
                <Link to="/teacher/schedule" className="text-primary font-label-md hover:underline">Full Schedule</Link>
              </div>
              <div className="p-md">
                {todaySlots.length > 0 ? (
                  <div className="flex gap-md overflow-x-auto pb-md snap-x">
                    {todaySlots.map((slot, idx) => (
                      <div
                        key={slot.id}
                        className={`min-w-[280px] snap-start p-md rounded-xl flex flex-col gap-sm ${
                          idx === 0
                            ? 'bg-primary-container text-on-primary-container border-l-8 border-primary'
                            : 'bg-surface-container-low border border-outline-variant'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`font-label-sm px-2 py-0.5 rounded text-[11px] font-bold uppercase ${idx === 0 ? 'bg-primary text-white' : 'text-on-surface-variant'}`}>
                            {idx === 0 ? 'Current' : idx === 1 ? 'Upcoming' : `Period ${slot.periodNumber}`}
                          </span>
                          <span className={`font-label-sm text-[11px] ${idx === 0 ? 'text-on-primary-container/80' : 'text-on-surface-variant'}`}>
                            Period {slot.periodNumber}
                          </span>
                        </div>
                        <div>
                          <h4 className={`font-headline-sm text-headline-sm font-bold text-sm ${idx === 0 ? 'text-white' : 'text-primary'}`}>
                            {slot.subject.name}
                          </h4>
                          <p className={`font-body-sm text-xs mt-0.5 ${idx === 0 ? 'opacity-90' : 'text-on-surface-variant'}`}>
                            {slot.class.displayName}
                          </p>
                        </div>
                        {slot.room && (
                          <p className={`font-body-sm text-xs flex items-center gap-1 ${idx === 0 ? 'opacity-80' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {slot.room}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline block mb-2">calendar_today</span>
                    <p className="text-on-surface-variant font-body-sm">No classes scheduled for today.</p>
                    <Link to="/teacher/schedule" className="text-primary font-label-md hover:underline mt-2 block">
                      View Full Schedule
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Attendance */}
            <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm">
              <div className="px-md py-sm bg-secondary-container text-on-secondary-container flex justify-between items-center rounded-t-xl">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                  <h3 className="font-label-md text-label-md uppercase tracking-wider">Quick Attendance</h3>
                </div>
                <span className="font-label-sm font-bold">Now</span>
              </div>
              <div className="p-md flex-1 flex flex-col">
                {currentSlot ? (
                  <>
                    <p className="font-body-sm text-on-surface-variant mb-md text-center">
                      Mark register for <span className="font-bold text-on-surface">{currentSlot.class.displayName}</span>
                    </p>
                    <p className="font-body-sm text-on-surface-variant mb-md text-center text-xs">
                      {currentSlot.subject.name} — Period {currentSlot.periodNumber}
                    </p>
                    <div className="grid grid-cols-2 gap-sm">
                      <button
                        onClick={() => {
                          if (currentClassStudents && currentClassStudents.length > 0 && currentTerm) {
                            // Mark all present immediately
                          }
                          setQuickAttendanceOpen(true);
                        }}
                        className="flex flex-col items-center justify-center p-md bg-secondary text-white rounded-lg transition-transform active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[32px] mb-xs">check_circle</span>
                        <span className="font-label-md">All Present</span>
                      </button>
                      <button
                        onClick={() => setQuickAttendanceOpen(true)}
                        className="flex flex-col items-center justify-center p-md border border-outline-variant hover:bg-surface-container-low rounded-lg transition-transform active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[32px] mb-xs">edit_square</span>
                        <span className="font-label-md">Manual Entry</span>
                      </button>
                    </div>
                    <div className="mt-md pt-md border-t border-outline-variant">
                      <div className="flex justify-between items-center text-on-surface-variant font-label-sm">
                        <span>{currentClassStudents?.length ?? '—'} students in class</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                    <span className="material-symbols-outlined text-3xl text-outline mb-2">event_busy</span>
                    <p className="font-body-sm text-on-surface-variant">No current class to mark.</p>
                    <Link to="/teacher/attendance" className="text-primary font-label-sm hover:underline mt-2">
                      Go to Attendance
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Grading Status */}
            <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Grading Status</h3>
                <div className="flex gap-sm">
                  <span className="flex items-center gap-xs font-label-sm text-secondary">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span> Submitted
                  </span>
                  <span className="flex items-center gap-xs font-label-sm text-outline">
                    <span className="w-2 h-2 rounded-full bg-outline"></span> Draft
                  </span>
                </div>
              </div>
              <div className="p-md">
                {grades === null ? (
                  <p className="text-on-surface-variant text-sm py-4 text-center">Loading grade data...</p>
                ) : (grades || []).length === 0 ? (
                  <p className="text-on-surface-variant text-sm py-4 text-center">No grades entered yet.</p>
                ) : gradeGroups.length > 0 ? (
                  <div className="space-y-lg">
                    {gradeGroups.map(item => {
                      const pct = item.total > 0 ? Math.round((item.graded / item.total) * 100) : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between items-center mb-xs">
                            <span className="font-label-md text-label-md">{item.label}</span>
                            <span className="font-label-sm text-on-surface-variant">{item.graded} / {item.total} Entered</span>
                          </div>
                          <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex">
                            <div className="h-full bg-secondary" style={{ width: `${pct}%` }}></div>
                            <div className="h-full bg-outline-variant" style={{ width: `${100 - pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <div className="mt-lg p-md bg-surface-container-low rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    {pendingGrades > 0 ? (
                      <>
                        <span className="material-symbols-outlined text-tertiary">warning</span>
                        <p className="font-body-sm">
                          <span className="font-bold">{pendingGrades}</span> grade{pendingGrades !== 1 ? 's' : ''} in draft — not yet submitted.
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-secondary">check_circle</span>
                        <p className="font-body-sm">All grades submitted. Good work!</p>
                      </>
                    )}
                  </div>
                  <Link to="/teacher/grades" className="bg-primary text-white font-label-md px-md py-sm rounded-lg hover:brightness-110 transition-all">
                    Go to Gradebook
                  </Link>
                </div>
              </div>
            </section>

            {/* Recent Messages */}
            <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col">
              <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Recent Messages</h3>
                {recentMessages.length > 0 && (
                  <span className="bg-primary text-white font-label-sm px-xs rounded-full">
                    {recentMessages.length}
                  </span>
                )}
              </div>
              <div className="overflow-y-auto max-h-[360px]">
                {recentMessages.length > 0 ? (
                  <ul className="divide-y divide-outline-variant">
                    {recentMessages.map(m => {
                      const initials = `${m.sender.firstName.charAt(0)}${m.sender.lastName.charAt(0)}`.toUpperCase();
                      const timeAgo = new Date(m.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                      return (
                        <li key={m.id} className="p-md hover:bg-surface-container-low transition-colors cursor-pointer group">
                          <div className="flex gap-md">
                            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-label-md text-label-md font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-xs">
                                <span className="font-label-md text-label-md font-semibold group-hover:text-primary">
                                  {m.sender.firstName} {m.sender.lastName}
                                </span>
                                <span className="font-label-sm text-on-surface-variant">{timeAgo}</span>
                              </div>
                              <p className="font-body-sm text-on-surface-variant line-clamp-1">{m.subject}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="py-10 text-center">
                    <span className="material-symbols-outlined text-3xl text-outline block mb-2">mail</span>
                    <p className="font-body-sm text-on-surface-variant">No messages yet.</p>
                  </div>
                )}
              </div>
              <div className="mt-auto p-md border-t border-outline-variant text-center">
                <Link to="/teacher/messages" className="font-label-md text-primary hover:underline">View All Messages</Link>
              </div>
            </section>

            {/* Quick Stats Row */}
            <section className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-md">
              {[
                {
                  label: 'Classes Today',
                  value: todaySlots.length,
                  icon: 'today',
                  color: 'text-primary',
                  bg: 'bg-primary-container',
                  link: '/teacher/schedule',
                },
                {
                  label: 'Classes Assigned',
                  value: uniqueClassCount,
                  icon: 'groups',
                  color: 'text-secondary',
                  bg: 'bg-secondary-container',
                  link: '/teacher/classes',
                },
                {
                  label: 'Pending Submissions',
                  value: pendingGrades,
                  icon: 'pending_actions',
                  color: pendingGrades > 0 ? 'text-error' : 'text-secondary',
                  bg: pendingGrades > 0 ? 'bg-error-container' : 'bg-secondary-container',
                  link: '/teacher/grades',
                },
                {
                  label: 'Submitted Grades',
                  value: submittedGrades,
                  icon: 'grading',
                  color: 'text-tertiary',
                  bg: 'bg-tertiary-container',
                  link: '/teacher/grades',
                },
              ].map(stat => (
                <Link
                  key={stat.label}
                  to={stat.link}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-md hover:border-primary transition-all group"
                >
                  <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant">{stat.label}</p>
                    <p className={`font-title-lg font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                </Link>
              ))}
            </section>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
};

export default TeacherDashboard;
