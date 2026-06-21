import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';

// ── Class-level data ──────────────────────────────────────
interface ClassData {
  name: string;
  teacher: string;
  total: number;
  present: number;
  absent: number;
  rate: number;
}

const classes: ClassData[] = [
  { name: 'Form 1A', teacher: 'Mr. Mwale', total: 45, present: 43, absent: 2, rate: 95.6 },
  { name: 'Form 1B', teacher: 'Ms. Phiri', total: 44, present: 40, absent: 4, rate: 90.9 },
  { name: 'Form 2A', teacher: 'Mr. Tembo', total: 42, present: 42, absent: 0, rate: 100 },
  { name: 'Form 2B', teacher: 'Mrs. Msiska', total: 41, present: 33, absent: 8, rate: 80.5 },
  { name: 'Form 3A', teacher: 'Mr. Banda', total: 38, present: 37, absent: 1, rate: 97.4 },
  { name: 'Form 3B', teacher: 'Mrs. Chimwaza', total: 39, present: 35, absent: 4, rate: 89.7 },
  { name: 'Form 4A', teacher: 'Mr. Mwale', total: 36, present: 36, absent: 0, rate: 100 },
  { name: 'Form 4B', teacher: 'Mr. Banda', total: 35, present: 32, absent: 3, rate: 91.4 },
];

// ── Student-level mock data (per class) ───────────────────
type AttendanceStatus = 'present' | 'absent' | 'late';

interface StudentRecord {
  id: number;
  name: string;
  admissionNo: string;
  status: AttendanceStatus;
  timeIn: string | null;
  reason: string | null;
}

const firstNames = ['Chimwemwe', 'Kondwani', 'Thokozani', 'Blessings', 'Tadala', 'Mphatso', 'Grace', 'Precious', 'Comfort', 'Hope', 'Gift', 'Mercy', 'Lovemore', 'Dalitso', 'Faith', 'Tiyamike', 'Martha', 'Joseph', 'James', 'Peter', 'Ruth', 'Esther', 'Daniel', 'Samuel', 'Mary', 'Lucia', 'Agnes', 'Patrick', 'Charles', 'Tamandani', 'Elina', 'Wezzie', 'Madalitso', 'Bright', 'Innocent', 'Stella', 'Naomi', 'Victoria', 'George', 'Francis', 'Bertha', 'Alinafe', 'Yankho', 'Chisomo', 'Takondwa'];
const lastNames = ['Phiri', 'Banda', 'Mwale', 'Tembo', 'Msiska', 'Chimwaza', 'Kamanga', 'Nyirenda', 'Gondwe', 'Chirwa', 'Mkandawire', 'Ng\'oma', 'Kalua', 'Lungu', 'Moyo', 'Jere', 'Nkhoma', 'Mbewe', 'Chisi', 'Kumwenda'];
const absenceReasons = ['Illness', 'Family emergency', 'No reason given', 'Medical appointment', 'Transport issues'];

function generateStudents(cls: ClassData, classIndex: number): StudentRecord[] {
  const students: StudentRecord[] = [];
  // Use deterministic "randomness" from class index
  let absentCount = 0;
  let lateCount = 0;
  const maxLate = Math.floor(cls.present * 0.1); // ~10% of present are late

  for (let i = 0; i < cls.total; i++) {
    const seed = (classIndex * 100 + i * 7 + 3) % 100;
    const fnIdx = (classIndex * 13 + i) % firstNames.length;
    const lnIdx = (classIndex * 7 + i * 3) % lastNames.length;

    let status: AttendanceStatus = 'present';
    let timeIn: string | null = `07:${String(10 + (seed % 20)).padStart(2, '0')}`;
    let reason: string | null = null;

    if (absentCount < cls.absent && seed > 70) {
      status = 'absent';
      timeIn = null;
      reason = absenceReasons[seed % absenceReasons.length];
      absentCount++;
    } else if (status === 'present' && lateCount < maxLate && seed > 55 && seed <= 70) {
      status = 'late';
      timeIn = `07:${String(35 + (seed % 25)).padStart(2, '0')}`;
      lateCount++;
    }

    students.push({
      id: i + 1,
      name: `${firstNames[fnIdx]} ${lastNames[lnIdx]}`,
      admissionNo: `MK-${2024 + classIndex}-${String(i + 1).padStart(3, '0')}`,
      status,
      timeIn,
      reason,
    });
  }

  // If we haven't hit the absent count yet, mark last few students as absent
  while (absentCount < cls.absent) {
    const idx = cls.total - 1 - absentCount;
    if (idx >= 0 && students[idx].status !== 'absent') {
      students[idx].status = 'absent';
      students[idx].timeIn = null;
      students[idx].reason = absenceReasons[absentCount % absenceReasons.length];
      absentCount++;
    } else {
      break;
    }
  }

  return students;
}

const weekTrend = [93.2, 94.8, 96.5, 91.1, 95.3];
const trendLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// ── Status helpers ────────────────────────────────────────
const statusConfig: Record<AttendanceStatus, { label: string; icon: string; bg: string; text: string; dot: string }> = {
  present: {
    label: 'Present',
    icon: 'check_circle',
    bg: 'bg-primary-container/40',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  late: {
    label: 'Late',
    icon: 'schedule',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  absent: {
    label: 'Absent',
    icon: 'cancel',
    bg: 'bg-error-container/40',
    text: 'text-error',
    dot: 'bg-error',
  },
};

// ── Detail Panel component ────────────────────────────────
interface DetailPanelProps {
  cls: ClassData;
  classIndex: number;
  selectedDate: string;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ cls, classIndex, selectedDate, onClose }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');

  const students = useMemo(() => generateStudents(cls, classIndex), [cls, classIndex]);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filterStatus === 'all' || s.status === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [students, search, filterStatus]);

  const lateCount = students.filter(s => s.status === 'late').length;
  const presentOnTime = cls.present - lateCount;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] md:w-[620px] bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
        {/* ── Panel Header ── */}
        <div className="flex-shrink-0 border-b border-outline-variant bg-surface-container-low px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[22px]">groups</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-on-surface">{cls.name}</h2>
                <p className="text-label-sm text-on-surface-variant">{cls.teacher} &middot; {selectedDate}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* ── Mini Stats Row ── */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: 'Total', value: cls.total, icon: 'people', color: 'text-on-surface-variant bg-surface-container' },
              { label: 'Present', value: presentOnTime, icon: 'check_circle', color: 'text-primary bg-primary-container/40' },
              { label: 'Late', value: lateCount, icon: 'schedule', color: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30' },
              { label: 'Absent', value: cls.absent, icon: 'cancel', color: 'text-error bg-error-container/40' },
            ].map(s => (
              <div key={s.label} className={`rounded-lg px-3 py-2.5 text-center ${s.color}`}>
                <span className="material-symbols-outlined text-[16px] mb-0.5 block">{s.icon}</span>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider mt-1 opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Search & Filter Bar ── */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-outline-variant bg-surface-container-low/50 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search student name or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'present', 'late', 'absent'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                  filterStatus === f
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Student List ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-30 mb-3">search_off</span>
              <p className="font-medium">No students found</p>
              <p className="text-sm opacity-60">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((student, idx) => {
                const cfg = statusConfig[student.status];
                return (
                  <div
                    key={student.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent hover:border-outline-variant hover:bg-surface-container-low/60 transition-all group`}
                    style={{ animationDelay: `${Math.min(idx * 20, 300)}ms` }}
                  >
                    {/* Avatar circle */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${cfg.bg} ${cfg.text}`}>
                        {student.name.charAt(0)}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${cfg.dot}`} />
                    </div>

                    {/* Name + ID */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{student.name}</p>
                      <p className="text-[11px] text-on-surface-variant">{student.admissionNo}</p>
                    </div>

                    {/* Time in */}
                    <div className="hidden sm:block text-right flex-shrink-0 w-16">
                      {student.timeIn ? (
                        <p className="text-xs text-on-surface-variant font-medium">{student.timeIn}</p>
                      ) : (
                        <p className="text-xs text-error/60 italic">—</p>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                      <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                      {cfg.label}
                    </div>

                    {/* Reason (absent only) */}
                    {student.reason && (
                      <div className="hidden md:block flex-shrink-0">
                        <span
                          className="text-[11px] text-on-surface-variant italic max-w-[120px] truncate block"
                          title={student.reason}
                        >
                          {student.reason}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Panel Footer ── */}
        <div className="flex-shrink-0 border-t border-outline-variant bg-surface-container-low px-6 py-3 flex items-center justify-between">
          <p className="text-label-sm text-on-surface-variant">
            Showing <span className="font-bold text-on-surface">{filtered.length}</span> of{' '}
            <span className="font-bold text-on-surface">{students.length}</span> students
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────
export const HeadTeacherAttendance: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Head Teacher';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-05-28');
  const [detailClass, setDetailClass] = useState<{ cls: ClassData; index: number } | null>(null);

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
            <h1 className="dash-page-title">Attendance</h1>
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
                      <button
                        onClick={() => setDetailClass({ cls: c, index: i })}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-8 pt-6 pb-2 text-center border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant opacity-60">© 2026 MyKlasi School Management System. Academic Session: 2025/2026</p>
        </footer>
      </main>
      <BottomNav />

      {/* ── Detail Panel Overlay ── */}
      {detailClass && (
        <DetailPanel
          cls={detailClass.cls}
          classIndex={detailClass.index}
          selectedDate={selectedDate}
          onClose={() => setDetailClass(null)}
        />
      )}
    </>
  );
};

export default HeadTeacherAttendance;
