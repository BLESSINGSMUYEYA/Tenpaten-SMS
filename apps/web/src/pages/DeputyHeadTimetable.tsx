import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';
import { useQuery, useMutation } from '../hooks/useApi';
import { api } from '../services/api';

interface TimetableSlot {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  periodNumber: number;
  room: string | null;
  termId: string;
  class?: {
    id: string;
    displayName: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
    isCore: boolean;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const daysMap = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday'
} as const;

type DayKey = keyof typeof daysMap;

const getPeriodTime = (num: number) => {
  switch (num) {
    case 1: return { time: '08:00 - 09:00', label: 'Period 1' };
    case 2: return { time: '09:00 - 10:00', label: 'Period 2' };
    case 3: return { time: '10:30 - 11:30', label: 'Period 3' };
    case 4: return { time: '11:30 - 12:30', label: 'Period 4' };
    case 5: return { time: '01:30 - 02:30', label: 'Period 5' };
    case 6: return { time: '02:30 - 03:30', label: 'Period 6' };
    default: return { time: '08:00 - 09:00', label: 'Period 1' };
  }
};

export const DeputyHeadTimetable: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [zenMode, setZenMode] = useState(false);

  // Queries for configurations
  const { data: classesData } = useQuery<any[]>('/schools/classes');
  const { data: subjectsData } = useQuery<any[]>('/schools/subjects');
  const { data: termsData } = useQuery<any[]>('/schools/terms');
  const { data: staffData } = useQuery<any[]>('/people/staff');

  const classes = classesData || [];
  const subjects = subjectsData || [];
  const terms = termsData || [];
  const teachers = (staffData || []).filter(s => s.role === 'teacher' || s.role === 'deputy_head' || s.role === 'head_teacher');

  // Filters
  const [viewMode, setViewMode] = useState<'class' | 'teacher' | 'school'>('class');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Auto-select defaults
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    if (terms.length > 0 && !selectedTermId) {
      const currentTerm = terms.find(t => t.isCurrent) || terms[0];
      setSelectedTermId(currentTerm.id);
    }
  }, [terms, selectedTermId]);

  useEffect(() => {
    if (teachers.length > 0 && !selectedTeacherId) {
      setSelectedTeacherId(teachers[0].id);
    }
  }, [teachers, selectedTeacherId]);

  // Build the slots query URL dynamically so the hook re-fetches whenever
  // the term or class selection changes — this is the primary DB filter fix.
  const slotsUrl = useMemo(() => {
    if (!selectedTermId) return '';
    const params = new URLSearchParams({ termId: selectedTermId });
    if (viewMode === 'class' && selectedClassId) {
      params.set('classId', selectedClassId);
    } else if (viewMode === 'teacher' && selectedTeacherId) {
      params.set('teacherId', selectedTeacherId);
    }
    return `/timetable?${params.toString()}`;
  }, [selectedTermId, selectedClassId, selectedTeacherId, viewMode]);

  // Query slots — enabled only once we have a term selected
  const { data: slotsData, refetch: refetchSlots } = useQuery<TimetableSlot[]>(
    slotsUrl,
    !!slotsUrl,
    [slotsUrl]
  );

  // Mutation for creating a slot
  const { mutate: createSlot, loading: creatingSlot, error: createError, reset: resetCreateError } = useMutation('/timetable/slots', 'post');

  // Add Slot / Edit Slot states
  const [addSlotOpen, setAddSlotOpen] = useState(false);
  const [targetDay, setTargetDay] = useState<DayKey>('Mon');
  const [targetPeriod, setTargetPeriod] = useState(1);

  const [formSubjectId, setFormSubjectId] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formRoom, setFormRoom] = useState('');

  const [editSlotOpen, setEditSlotOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);

  const handleOpenAdd = (day: DayKey, period: number) => {
    setTargetDay(day);
    setTargetPeriod(period);
    setFormSubjectId('');
    setFormTeacherId('');
    setFormRoom('');
    resetCreateError();
    setAddSlotOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubjectId || !formTeacherId || !selectedClassId || !selectedTermId) return;

    try {
      await createSlot({
        classId: selectedClassId,
        subjectId: formSubjectId,
        teacherId: formTeacherId,
        day: targetDay,
        periodNumber: targetPeriod,
        room: formRoom || undefined,
        termId: selectedTermId,
      });
      setAddSlotOpen(false);
      refetchSlots();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to delete this timetable slot?')) return;
    try {
      await api.delete(`/timetable/slots/${slotId}`);
      setEditSlotOpen(false);
      refetchSlots();
    } catch (err) {
      console.error(err);
      alert('Failed to delete slot. Ensure you have the permissions.');
    }
  };

  const getSubjectColorStyle = (isCore: boolean) => {
    return isCore
      ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500 text-blue-700 dark:text-blue-300'
      : 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300';
  };

  const daysList: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periodNumbers = [1, 2, 3, 4, 5, 6];

  // Filter slots for rendering
  const getCellSlots = (day: DayKey, period: number) => {
    const list = slotsData || [];
    if (viewMode === 'class') {
      return list.filter(s => s.day === day && s.periodNumber === period && s.classId === selectedClassId);
    } else if (viewMode === 'teacher') {
      return list.filter(s => s.day === day && s.periodNumber === period && s.teacherId === selectedTeacherId);
    } else {
      return list.filter(s => s.day === day && s.periodNumber === period);
    }
  };

  return (
    <>
      <Header onMenuClick={toggleSidebar} zenMode={zenMode} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} zenMode={zenMode} />

      <main className={`transition-all duration-300 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface ${zenMode ? 'lg:ml-0' : 'lg:ml-72'}`}>
        
        {/* Page Header */}
        <div className="py-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant mb-1 text-xs">
              <span className="font-label-sm text-outline">Academic</span>
              <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
              <span className="font-label-sm text-primary font-bold">Master Timetable</span>
            </div>
            <h1 className="dash-page-title flex items-center gap-2">
              Timetable Management
              {zenMode && <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Zen Mode</span>}
            </h1>
            <p className="font-body-md text-on-surface-variant mt-1">Configure and manage class schedule blocks, classrooms, and teacher allocations.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setZenMode(!zenMode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all border ${
                zenMode 
                  ? 'bg-primary text-on-primary border-primary shadow-md' 
                  : 'bg-surface border-outline-variant hover:bg-surface-container-low text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {zenMode ? 'fullscreen_exit' : 'fullscreen'}
              </span>
              <span>{zenMode ? 'Exit Zen Mode' : 'Zen Mode'}</span>
            </button>

            <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant">
              {(['class', 'teacher', 'school'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-md font-label-md transition-all text-xs font-bold capitalize ${
                    viewMode === mode ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {mode === 'class' ? 'By Class' : mode === 'teacher' ? 'By Teacher' : 'School-Wide'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedTermId}
                onChange={e => setSelectedTermId(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-on-surface text-xs focus:outline-none focus:border-primary"
              >
                {terms.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.academicYear?.name})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            {viewMode === 'class' && (
              <div className="flex flex-col">
                <label className="text-on-surface-variant mb-1 text-xs font-semibold">Select Class</label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-sm min-w-[200px]"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.displayName}</option>
                  ))}
                </select>
              </div>
            )}
            
            {viewMode === 'teacher' && (
              <div className="flex flex-col">
                <label className="text-on-surface-variant mb-1 text-xs font-semibold">Select Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-sm min-w-[200px]"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>
            )}

            {viewMode === 'school' && (
              <span className="px-3 py-1.5 rounded bg-primary-container text-primary font-bold text-xs uppercase">School-Wide Calendar Overview</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500/30 border border-blue-500"></span> Core Course
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500"></span> Elective
            </span>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col mb-8">
          <div className="overflow-auto custom-scrollbar">
            {/* Header */}
            <div className="min-w-[900px] w-full grid grid-cols-[100px_repeat(5,_1fr)] border-b border-outline-variant bg-surface-container-lowest text-xs font-bold">
              <div className="p-3 border-r border-outline-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-outline">schedule</span>
              </div>
              {daysList.map(d => (
                <div key={d} className="p-3 border-r border-outline-variant text-center text-on-surface capitalize">
                  {daysMap[d]}
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div className="min-w-[900px] w-full grid grid-cols-[100px_repeat(5,_1fr)] divide-y divide-outline-variant">
              {periodNumbers.map(period => (
                <React.Fragment key={period}>
                  <div className="bg-surface-container-lowest p-2 border-r border-outline-variant flex flex-col items-center justify-center text-center">
                    <span className="font-bold text-xs text-on-surface-variant">Period {period}</span>
                    <span className="text-[10px] text-outline mt-0.5">{getPeriodTime(period).time}</span>
                  </div>

                  {daysList.map(day => {
                    const cells = getCellSlots(day, period);
                    const hasSlots = cells.length > 0;

                    return (
                      <div
                        key={day}
                        className={`p-2 border-r border-outline-variant min-h-[120px] transition-colors relative flex flex-col gap-2 ${
                          hasSlots ? 'bg-surface' : 'bg-surface-container-low/40'
                        }`}
                      >
                        {cells.map(s => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setSelectedSlot(s);
                              setEditSlotOpen(true);
                            }}
                            className={`flex-1 rounded-md border p-3 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all ${getSubjectColorStyle(s.subject?.isCore ?? true)}`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-sm leading-tight">
                                {s.subject?.name}
                              </span>
                              {viewMode === 'school' && (
                                <span className="text-[9px] bg-primary/10 text-primary px-1 rounded font-bold shrink-0">
                                  {s.class?.displayName}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px] opacity-90">
                              <span>{s.teacher ? `${s.teacher.firstName} ${s.teacher.lastName}` : 'No Teacher'}</span>
                              <span className="bg-surface/50 border border-outline-variant px-1 rounded text-[10px] font-bold">
                                {s.room || 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Free Period Action */}
                        {!hasSlots && viewMode === 'class' && (
                          <button
                            onClick={() => handleOpenAdd(day, period)}
                            className="flex-1 border border-dashed border-outline-variant hover:border-primary hover:text-primary transition-all text-on-surface-variant rounded-md flex flex-col items-center justify-center p-3 text-xs gap-1 opacity-60 hover:opacity-100 bg-transparent"
                          >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            <span className="font-bold text-[10px] uppercase">Free Slot</span>
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Intermission rows */}
                  {period === 2 && (
                    <div className="col-span-6 bg-surface-container-high py-2 px-4 flex items-center justify-center border-b border-outline-variant">
                      <span className="text-on-surface-variant text-xs font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">coffee</span>
                        Morning Recess Break (10:00 - 10:30)
                      </span>
                    </div>
                  )}

                  {period === 4 && (
                    <div className="col-span-6 bg-surface-container-high py-2 px-4 flex items-center justify-center border-b border-outline-variant">
                      <span className="text-on-surface-variant text-xs font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">lunch_dining</span>
                        Lunch Intermission Break (12:30 - 01:30)
                      </span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />

      {/* MODAL: Add Slot */}
      {addSlotOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 shadow-2xl relative flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">add_box</span> Add Schedule Slot
              </h2>
              <button 
                onClick={() => setAddSlotOpen(false)} 
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveAdd} className="space-y-4">
              {createError && (
                <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs font-semibold">
                  {createError}
                </div>
              )}

              <div className="bg-surface-container p-3 rounded-lg text-xs">
                Scheduling for <strong>{daysMap[targetDay]}</strong> during <strong>{getPeriodTime(targetPeriod).label} ({getPeriodTime(targetPeriod).time})</strong>.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Subject *</label>
                <select
                  value={formSubjectId}
                  onChange={e => setFormSubjectId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Assigned Teacher *</label>
                <select
                  value={formTeacherId}
                  onChange={e => setFormTeacherId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Room Location</label>
                <input
                  type="text"
                  placeholder="e.g. Room 201, Chemistry Lab"
                  value={formRoom}
                  onChange={e => setFormRoom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                <button
                  type="button"
                  onClick={() => setAddSlotOpen(false)}
                  className="px-5 py-2.5 bg-surface-container border border-outline-variant text-outline hover:text-on-surface rounded-lg font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSlot}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all text-sm disabled:opacity-50"
                >
                  {creatingSlot ? 'Saving...' : 'Save Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View / Delete Slot */}
      {editSlotOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 shadow-2xl relative flex flex-col animate-scale-in">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">info</span> Timetable Details
              </h2>
              <button 
                onClick={() => setEditSlotOpen(false)} 
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-sm text-on-surface">
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-outline-variant/60">
                <span className="text-on-surface-variant font-semibold">Subject:</span>
                <span className="col-span-2 font-bold text-primary">{selectedSlot.subject?.name} ({selectedSlot.subject?.code})</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-outline-variant/60">
                <span className="text-on-surface-variant font-semibold">Teacher:</span>
                <span className="col-span-2 font-bold">{selectedSlot.teacher ? `${selectedSlot.teacher.firstName} ${selectedSlot.teacher.lastName}` : 'Unassigned'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-outline-variant/60">
                <span className="text-on-surface-variant font-semibold">Location:</span>
                <span className="col-span-2 font-mono font-bold text-secondary">{selectedSlot.room || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-outline-variant/60">
                <span className="text-on-surface-variant font-semibold">Schedule:</span>
                <span className="col-span-2 font-semibold">
                  {daysMap[selectedSlot.day]} • Period {selectedSlot.periodNumber} ({getPeriodTime(selectedSlot.periodNumber).time})
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-outline-variant mt-6">
              <button
                type="button"
                onClick={() => handleDeleteSlot(selectedSlot.id)}
                className="px-5 py-2.5 bg-error-container text-on-error-container hover:opacity-90 rounded-lg font-bold text-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span> Delete Slot
              </button>
              <button
                type="button"
                onClick={() => setEditSlotOpen(false)}
                className="px-5 py-2.5 bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high rounded-lg font-bold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeputyHeadTimetable;
