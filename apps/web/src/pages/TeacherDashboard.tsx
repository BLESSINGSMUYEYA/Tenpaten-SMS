import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';
import { Link } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
type AttendanceStatus = 'Present' | 'Absent' | 'Late';

interface QuickStudent {
  id: number;
  name: string;
  avatarCode: string;
  status: AttendanceStatus;
}

const CURRENT_CLASS_NAME = 'Form 4B - Physics';
const CURRENT_CLASS_SESSION = '09:00 – 10:30';
const CURRENT_CLASS_ROOM = 'Science Lab 1';

const INITIAL_STUDENTS: QuickStudent[] = [
  { id: 6,  name: 'Kwame Nkrumah', avatarCode: 'KN', status: 'Present' },
  { id: 7,  name: 'Sarah Mwangi',  avatarCode: 'SM', status: 'Present' },
  { id: 8,  name: 'John Kamau',    avatarCode: 'JK', status: 'Present' },
  { id: 9,  name: 'Zainab Yusuf',  avatarCode: 'ZY', status: 'Present' },
];

// ─── Quick Attendance Modal ───────────────────────────────────────────────────
const QuickAttendanceModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [students, setStudents] = useState<QuickStudent[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);

  const cycle = (id: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next: AttendanceStatus =
          s.status === 'Present' ? 'Absent' : s.status === 'Absent' ? 'Late' : 'Present';
        return { ...s, status: next };
      })
    );
  };

  const markAll = (status: AttendanceStatus) =>
    setStudents((prev) => prev.map((s) => ({ ...s, status })));

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    present: students.filter((s) => s.status === 'Present').length,
    absent:  students.filter((s) => s.status === 'Absent').length,
    late:    students.filter((s) => s.status === 'Late').length,
  };

  const handleSave = () => setSaved(true);

  const statusStyles: Record<AttendanceStatus, { border: string; icon: string; text: string }> = {
    Present: { border: 'border-secondary bg-secondary/5', icon: 'check_circle', text: 'text-secondary' },
    Absent:  { border: 'border-error bg-error/5',         icon: 'cancel',       text: 'text-error'     },
    Late:    { border: 'border-tertiary bg-tertiary/5',   icon: 'schedule',     text: 'text-tertiary'  },
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
                  Current Class
                </span>
                <span className="text-[11px] text-outline">{CURRENT_CLASS_SESSION}</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {CURRENT_CLASS_NAME}
              </h3>
              <p className="font-body-sm text-outline flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px]">location_on</span>
                {CURRENT_CLASS_ROOM}
              </p>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Counters */}
          <div className="grid grid-cols-3 gap-2 mb-3 cards-stagger">
            {[
              { label: 'Present', value: counts.present, color: 'text-secondary', bg: 'bg-secondary/10 border-secondary/20' },
              { label: 'Absent',  value: counts.absent,  color: 'text-error',     bg: 'bg-error/10 border-error/20'     },
              { label: 'Late',    value: counts.late,    color: 'text-tertiary',  bg: 'bg-tertiary/10 border-tertiary/20' },
            ].map((c) => (
              <div key={c.label} className={`border rounded-xl py-2 text-center ${c.bg}`}>
                <p className="font-label-sm text-label-sm text-on-surface-variant font-medium">{c.label}</p>
                <p className={`font-title-lg text-title-lg font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Quick mark-all + search */}
          <div className="flex gap-2">
            <button onClick={() => markAll('Present')}
              className="flex-1 py-1.5 font-label-md text-label-md font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary/5 transition-colors active:scale-95">
              ✓ All Present
            </button>
            <button onClick={() => markAll('Absent')}
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
          {filtered.map((student) => {
            const s = statusStyles[student.status];
            return (
              <div key={student.id}
                className={`border rounded-xl px-3 py-2 flex items-center justify-between gap-3 transition-all ${s.border}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold flex items-center justify-center flex-shrink-0">
                    {student.avatarCode}
                  </div>
                  <div>
                    <p className="font-title-sm text-title-sm text-on-surface font-semibold">{student.name}</p>
                    <div className={`flex items-center gap-1 font-label-sm text-label-sm font-medium ${s.text}`}>
                      <span className="material-symbols-outlined text-[12px]">{s.icon}</span>
                      {student.status}
                    </div>
                  </div>
                </div>
                {/* Tap to cycle status */}
                <button onClick={() => cycle(student.id)} disabled={saved}
                  className="p-1 rounded-full hover:bg-surface-container-high active:scale-90 transition-all disabled:opacity-40"
                  title="Tap to change status (Present → Absent → Late → Present)">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">swap_horiz</span>
                </button>
              </div>
            );
          })}
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
              <button onClick={handleSave}
                className="flex-1 py-2.5 bg-primary text-on-primary font-label-md text-label-md font-medium rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm">
                Save Register
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

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      {/* Quick Attendance Modal */}
      {quickAttendanceOpen && (
        <QuickAttendanceModal onClose={() => setQuickAttendanceOpen(false)} />
      )}

      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        <div className="max-w-[1440px] mx-auto">
          <header className="mb-lg">
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Welcome back, {fullName}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">You have 4 classes today and 12 pending grade submissions.</p>
          </header>

          <div className="grid grid-cols-12 gap-md">
            {/* Today's Timetable */}
            <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="px-md py-sm bg-surface-container-low flex justify-between items-center border-b border-outline-variant">
                <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Today's Timetable</h3>
                <Link to="/teacher/schedule" className="text-primary font-label-md hover:underline">Full Schedule</Link>
              </div>
              <div className="p-md">
                <div className="flex gap-md overflow-x-auto pb-md snap-x">
                  <div className="min-w-[280px] snap-start bg-primary-container text-on-primary-container p-md rounded-xl border-l-8 border-primary flex flex-col gap-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-label-sm bg-primary text-white px-xs rounded">CURRENT</span>
                      <span className="font-label-sm">09:00 – 10:30</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-white">{CURRENT_CLASS_NAME}</h4>
                      <p className="font-body-sm opacity-90 flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[18px]">location_on</span> {CURRENT_CLASS_ROOM}
                      </p>
                    </div>
                    <div className="mt-sm flex items-center">
                      <span className="font-label-sm opacity-80">4 students enrolled</span>
                    </div>
                  </div>
                  <div className="min-w-[280px] snap-start bg-surface-container-low p-md rounded-xl border border-outline-variant flex flex-col gap-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-label-sm text-on-surface-variant">UPCOMING</span>
                      <span className="font-label-sm">11:00 – 12:00</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-primary">Form 2 JCE Physical Science</h4>
                      <p className="font-body-sm text-on-surface-variant flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[18px]">location_on</span> Form 2 Blue Classroom
                      </p>
                    </div>
                    <span className="text-on-surface-variant font-label-sm mt-sm">18 Students Registered</span>
                  </div>
                  <div className="min-w-[280px] snap-start bg-surface-container-low p-md rounded-xl border border-outline-variant flex flex-col gap-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-label-sm text-on-surface-variant">AFTERNOON</span>
                      <span className="font-label-sm">13:30 – 15:00</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-primary">Office Hours</h4>
                      <p className="font-body-sm text-on-surface-variant flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[18px]">location_on</span> Staffroom
                      </p>
                    </div>
                    <span className="text-on-surface-variant font-label-sm mt-sm">Open for bookings</span>
                  </div>
                </div>
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
                <p className="font-body-sm text-on-surface-variant mb-md text-center">
                  Mark status for <span className="font-bold text-on-surface">{CURRENT_CLASS_NAME}</span> ({CURRENT_CLASS_SESSION})
                </p>
                <div className="grid grid-cols-2 gap-sm">
                  <button
                    onClick={() => alert(`All students marked present for ${CURRENT_CLASS_NAME}`)}
                    className="flex flex-col items-center justify-center p-md bg-secondary text-white rounded-lg transition-transform active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[32px] mb-xs">check_circle</span>
                    <span className="font-label-md">All Present</span>
                  </button>
                  <button
                    onClick={() => setQuickAttendanceOpen(true)}
                    className="flex flex-col items-center justify-center p-md border border-outline-variant hover:bg-surface-container-low rounded-lg transition-transform active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[32px] mb-xs">edit_square</span>
                    <span className="font-label-md">Manual Entry</span>
                  </button>
                </div>
                <div className="mt-md pt-md border-t border-outline-variant">
                  <div className="flex justify-between items-center text-on-surface-variant font-label-sm">
                    <span>Recent: 3/4 Marked</span>
                    <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-error border-2 border-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Grading Status */}
            <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Grading Status</h3>
                <div className="flex gap-sm">
                  <span className="flex items-center gap-xs font-label-sm text-secondary"><span className="w-2 h-2 rounded-full bg-secondary"></span> Submitted</span>
                  <span className="flex items-center gap-xs font-label-sm text-tertiary-container"><span className="w-2 h-2 rounded-full bg-tertiary-container"></span> Pending</span>
                </div>
              </div>
              <div className="p-md">
                <div className="space-y-lg">
                  {[
                    { label: 'MSCE Physics - Mock Exam', graded: 28, total: 32, pct: 85 },
                    { label: 'JCE Physical Science Lab Reports', graded: 12, total: 40, pct: 30 },
                    { label: 'Form 4 Electromagnetism Test', graded: 45, total: 45, pct: 100 },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-xs">
                        <span className="font-label-md text-label-md">{item.label}</span>
                        <span className="font-label-sm text-on-surface-variant">{item.graded} / {item.total} Graded</span>
                      </div>
                      <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex">
                        <div className="h-full bg-secondary" style={{ width: `${item.pct}%` }}></div>
                        <div className="h-full bg-tertiary-container" style={{ width: `${100 - item.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-lg p-md bg-surface-container-low rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-tertiary-container">warning</span>
                    <p className="font-body-sm">Next grade freeze in <span className="font-bold">2 days</span>. 52 submissions pending.</p>
                  </div>
                  <Link to="/teacher/grades" className="bg-primary text-white font-label-md px-md py-sm rounded-lg hover:brightness-110 transition-all">Go to Gradebook</Link>
                </div>
              </div>
            </section>

            {/* Recent Messages */}
            <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col">
              <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Recent Messages</h3>
                <span className="bg-error text-white font-label-sm px-xs rounded-full">3 New</span>
              </div>
              <div className="overflow-y-auto max-h-[360px]">
                <ul className="divide-y divide-outline-variant">
                  {[
                    { initials: 'MT', name: 'Mia Thompson', time: '10m ago', msg: 'Can I get an extension on the Physics report?' },
                    { initials: 'HP', name: 'Head Teacher Dr. Phiri', time: '1h ago', msg: 'The faculty meeting has been moved to 4 PM.' },
                    { initials: 'PA', name: "Parent: Leo's Mom", time: '3h ago', msg: 'Leo will be absent today due to a fever.' },
                  ].map(m => (
                    <li key={m.name} className="p-md hover:bg-surface-container-low transition-colors cursor-pointer group">
                      <div className="flex gap-md">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-label-md text-label-md font-bold flex-shrink-0">{m.initials}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-xs">
                            <span className="font-label-md text-label-md font-semibold group-hover:text-primary">{m.name}</span>
                            <span className="font-label-sm text-on-surface-variant">{m.time}</span>
                          </div>
                          <p className="font-body-sm text-on-surface-variant line-clamp-1">{m.msg}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto p-md border-t border-outline-variant text-center">
                <Link to="/teacher/messages" className="font-label-md text-primary hover:underline">View All Messages</Link>
              </div>
            </section>

            {/* Recent Activity Table */}
            <section className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="px-md py-sm border-b border-outline-variant">
                <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Recent System Activity</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low text-on-surface-variant font-label-sm">
                    <tr>
                      <th className="px-md py-sm">Timestamp</th>
                      <th className="px-md py-sm">Activity</th>
                      <th className="px-md py-sm">Subject/Class</th>
                      <th className="px-md py-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm divide-y divide-outline-variant">
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-md py-sm text-on-surface-variant">08:45 AM</td>
                      <td className="px-md py-sm font-body-md text-body-md font-semibold">Lesson Plan Uploaded</td>
                      <td className="px-md py-sm text-on-surface-variant">Form 4 MSCE Physics</td>
                      <td className="px-md py-sm"><span className="px-xs py-1 bg-secondary-container text-on-secondary-container rounded font-label-sm">SUCCESS</span></td>
                    </tr>
                    <tr className="bg-surface-container-low/30 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-md py-sm text-on-surface-variant">08:30 AM</td>
                      <td className="px-md py-sm font-body-md text-body-md font-semibold">Fee Status Updated</td>
                      <td className="px-md py-sm text-on-surface-variant">Form 4-A</td>
                      <td className="px-md py-sm"><span className="px-xs py-1 bg-surface-container-high text-on-surface-variant rounded font-label-sm">LOGGED</span></td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-md py-sm text-on-surface-variant">Yesterday</td>
                      <td className="px-md py-sm font-body-md text-body-md font-semibold">Grade Submission</td>
                      <td className="px-md py-sm text-on-surface-variant">Form 4 Physics</td>
                      <td className="px-md py-sm"><span className="px-xs py-1 bg-secondary-container text-on-secondary-container rounded font-label-sm">SUBMITTED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
};

export default TeacherDashboard;
