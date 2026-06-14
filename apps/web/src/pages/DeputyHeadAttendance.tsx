import React, { useState } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';

type AttendanceRecord = {
  id: number;
  studentName: string;
  class: string;
  status: 'present' | 'absent' | 'late';
  time: string;
  reason?: string;
};

export const DeputyHeadAttendance: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [newStudentName, setNewStudentName] = useState('');
  const [newClass, setNewClass] = useState('Form 3A');
  const [newStatus, setNewStatus] = useState<'present' | 'absent' | 'late'>('late');
  const [newTime, setNewTime] = useState('07:35 AM');
  const [newReason, setNewReason] = useState('Missed the school bus');

  // Mock data
  const [records, setRecords] = useState<AttendanceRecord[]>([
    { id: 1, studentName: 'Blessings Gondwe', class: 'Form 3A', status: 'late', time: '07:32 AM', reason: 'Heavy traffic on Chipembere Hwy' },
    { id: 2, studentName: 'Fiona Phiri', class: 'Form 4B', status: 'absent', time: '-', reason: 'Medical appointment' },
    { id: 3, studentName: 'Mwayi Mwale', class: 'Form 2C', status: 'late', time: '07:45 AM', reason: 'Overslept' },
    { id: 4, studentName: 'Tamara Nyirenda', class: 'Form 1A', status: 'present', time: '07:12 AM' },
    { id: 5, studentName: 'Tadala Chisale', class: 'Form 3A', status: 'present', time: '07:15 AM' },
    { id: 6, studentName: 'Chikondi Banda', class: 'Form 4B', status: 'present', time: '07:05 AM' },
  ]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;

    const newRecord: AttendanceRecord = {
      id: Date.now(),
      studentName: newStudentName,
      class: newClass,
      status: newStatus,
      time: newStatus === 'absent' ? '-' : newTime,
      reason: newStatus !== 'present' ? newReason : undefined,
    };

    setRecords([newRecord, ...records]);
    setIsModalOpen(false);
    // Reset fields
    setNewStudentName('');
    setNewReason('Missed the school bus');
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || r.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const lateCount = records.filter(r => r.status === 'late').length;
  const absentCount = records.filter(r => r.status === 'absent').length;

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Breadcrumbs & Header */}
        <div className="py-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Administration</span>
              <span>/</span>
              <span className="text-primary font-bold">Attendance</span>
            </nav>
            <h1 className="dash-page-title">Attendance Tracker</h1>
            <p className="font-body-md text-on-surface-variant">Monitor daily school-wide attendance, register late-comers, and review teacher logs.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm self-start md:self-end text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            Log Attendance Record
          </button>
        </div>

        {/* Operational metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-margin-desktop">
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">how_to_reg</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Average Attendance</p>
              <h3 className="font-headline-md text-primary mt-1">94.6%</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined">co_present</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">On Duty Today</p>
              <h3 className="font-headline-md text-secondary mt-1">98%</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Late Arrivals Today</p>
              <h3 className="font-headline-md text-amber-600 dark:text-amber-300 mt-1">{lateCount + 12}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined">person_off</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Unexcused Absences</p>
              <h3 className="font-headline-md text-error mt-1">{absentCount + 5}</h3>
            </div>
          </div>
        </div>

        {/* Visual Attendance Heatmap representation by class */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm p-lg mb-margin-desktop">
          <h3 className="text-title-lg font-bold text-primary mb-md">Class-wise Attendance Ratio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {[
              { form: 'Form 1A', rate: 96.5, count: '30/31', color: 'bg-primary' },
              { form: 'Form 2C', rate: 91.2, count: '38/40', color: 'bg-primary' },
              { form: 'Form 3A', rate: 94.8, count: '33/35', color: 'bg-secondary' },
              { form: 'Form 4B', rate: 89.2, count: '25/28', color: 'bg-error' },
            ].map(item => (
              <div key={item.form} className="bg-surface-container border border-outline-variant rounded-xl p-md flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-on-surface text-sm">{item.form}</span>
                  <span className="text-xs text-on-surface-variant font-medium">{item.count} present</span>
                </div>
                <div className="flex items-end gap-3 mt-1">
                  <span className="font-headline-sm font-bold text-on-surface">{item.rate}%</span>
                  <span className="text-xs text-outline font-medium mb-1">Target: 95%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mt-3">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.rate}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters and Table bar */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
            <div className="relative w-full md:w-96 flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
              <input
                type="text"
                placeholder="Search students in attendance logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
              {['All', 'Form 1A', 'Form 2C', 'Form 3A', 'Form 4B'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setFilterClass(cls)}
                  className={`px-4 py-2 rounded-full font-label-md active:scale-95 transition-all text-xs whitespace-nowrap ${
                    filterClass === cls
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container border border-surface-border text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {cls === 'All' ? 'All Classes' : cls}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant font-bold text-label-md text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">Class</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Arrival Time</th>
                  <th className="px-6 py-4">Reason / Notes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-body-md divide-y divide-outline-variant">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r, i) => {
                    const statusClass = r.status === 'present'
                      ? 'bg-secondary-container/15 border-secondary text-secondary'
                      : r.status === 'late'
                      ? 'bg-amber-100 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-300'
                      : 'bg-error-container/15 border-error text-error';
                    return (
                      <tr key={r.id} className={`hover:bg-surface-container-low transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                        <td className="px-6 py-4 font-bold text-on-surface">{r.studentName}</td>
                        <td className="px-6 py-4 text-center text-on-surface-variant font-medium">{r.class}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 border text-xs font-bold rounded-full uppercase tracking-wider ${statusClass}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant font-medium">{r.time}</td>
                        <td className="px-6 py-4 text-xs text-on-surface-variant italic max-w-xs truncate">{r.reason || 'On time'}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="px-3.5 py-1.5 border border-outline hover:border-primary text-on-surface-variant hover:text-primary transition-all font-label-sm text-xs rounded-lg font-bold">
                            View Logs
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
                      <p className="font-body-md">No attendance records match your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Modal Log Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl p-lg relative animate-slide-in-bottom">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-headline-sm text-primary">Log Attendance Record</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleAddRecord} className="space-y-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blessings Gondwe"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Class</label>
                    <select
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="Form 1A">Form 1A</option>
                      <option value="Form 2C">Form 2C</option>
                      <option value="Form 3A">Form 3A</option>
                      <option value="Form 4B">Form 4B</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="present">Present</option>
                      <option value="late">Late Arrival</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                </div>

                {newStatus !== 'present' && (
                  <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    {newStatus === 'late' && (
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Arrival Time</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 07:35 AM"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Reason / Details</label>
                      <input
                        type="text"
                        required
                        placeholder="Provide reason for absence or late coming"
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container active:scale-95 transition-all text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs">
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
};

export default DeputyHeadAttendance;
