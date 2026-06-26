import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '../../hooks/useApi';
import { api } from '../../services/api';

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

const getPeriodTimeFromConfig = (config: any[], num: number) => {
  const period = config.find(c => !c.isBreak && c.periodNumber === num);
  if (period) {
    return { time: `${period.startTime} - ${period.endTime}`, label: period.label };
  }
  // Fallback
  return { time: '00:00 - 00:00', label: `Period ${num}` };
};

export const TimetableScheduler: React.FC = () => {
  const [zenMode, setZenMode] = useState(false);

  // Queries for configurations
  const { data: classesData } = useQuery<any[]>('/schools/classes');
  const { data: subjectsData } = useQuery<any[]>('/schools/subjects');
  const { data: termsData } = useQuery<any[]>('/schools/terms');
  const { data: staffData } = useQuery<any[]>('/people/staff');
  const { data: mySchool } = useQuery<any>('/schools/my-school');

  const timetableConfig = useMemo(() => {
    if (mySchool?.timetableConfig && mySchool.timetableConfig.length > 0) {
      return mySchool.timetableConfig;
    }
    // Default fallback if not configured
    return [
      { periodNumber: 1, startTime: '08:00', endTime: '09:00', label: 'Period 1' },
      { periodNumber: 2, startTime: '09:00', endTime: '10:00', label: 'Period 2' },
      { isBreak: true, startTime: '10:00', endTime: '10:30', label: 'Morning Recess', icon: 'coffee' },
      { periodNumber: 3, startTime: '10:30', endTime: '11:30', label: 'Period 3' },
      { periodNumber: 4, startTime: '11:30', endTime: '12:30', label: 'Period 4' },
      { isBreak: true, startTime: '12:30', endTime: '13:30', label: 'Lunch Break', icon: 'lunch_dining' },
      { periodNumber: 5, startTime: '13:30', endTime: '14:30', label: 'Period 5' },
      { periodNumber: 6, startTime: '14:30', endTime: '15:30', label: 'Period 6' }
    ];
  }, [mySchool]);

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

  // Build the slots query URL dynamically
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

  // Query slots
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

  // Drag-and-Drop state
  const [draggedSlot, setDraggedSlot] = useState<TimetableSlot | null>(null);
  const [dropTarget, setDropTarget] = useState<{ day: DayKey; period: number } | null>(null);
  const [movingSlot, setMovingSlot] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const isDragEnabled = viewMode === 'class';

  const handleDragStart = (e: React.DragEvent, slot: TimetableSlot) => {
    if (!isDragEnabled) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', slot.id);
    setTimeout(() => setDraggedSlot(slot), 0);
  };

  const handleDragEnd = () => {
    setDraggedSlot(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, day: DayKey, period: number) => {
    if (!isDragEnabled || !draggedSlot) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget({ day, period });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = async (e: React.DragEvent, day: DayKey, period: number) => {
    e.preventDefault();
    if (!draggedSlot || movingSlot) return;

    if (draggedSlot.day === day && draggedSlot.periodNumber === period) {
      handleDragEnd();
      return;
    }

    setMovingSlot(true);
    try {
      await api.patch(`/timetable/slots/${draggedSlot.id}/move`, { day, periodNumber: period });
      showToast('Slot moved successfully', 'success');
      refetchSlots();
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.teacherId?.[0]
        || err?.response?.data?.message
        || 'Failed to move slot';
      showToast(msg, 'error');
    } finally {
      setMovingSlot(false);
      handleDragEnd();
    }
  };

  const isDropTarget = (day: DayKey, period: number) =>
    dropTarget?.day === day && dropTarget?.period === period;

  const isDragSource = (day: DayKey, period: number) =>
    draggedSlot?.day === day && draggedSlot?.periodNumber === period;

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
    <div className="flex flex-col gap-6">
      {/* Configuration Header Controls */}
      <div className="py-2 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
            Timetable Scheduler
            {zenMode && <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Zen Mode</span>}
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Configure schedule blocks, allocations, and avoid collisions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setZenMode(!zenMode);
              // Fire custom event to notify parent containers of sidebar toggle if needed
              window.dispatchEvent(new CustomEvent('myklasi:zenmode', { detail: !zenMode }));
            }}
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
              className="bg-transparent border-b-2 border-outline-variant focus:border-primary px-2 py-1.5 outline-none font-body-md font-semibold text-on-surface text-xs"
            >
              {terms.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.academicYear?.name})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
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
            <span className="px-3 py-1.5 rounded bg-primary-container text-primary font-bold text-xs uppercase border border-primary/10">
              School-Wide Calendar Overview
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500/30 border border-blue-500"></span> Core Subject
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500"></span> Elective
          </span>
        </div>
      </div>

      {/* Scheduler Grid Canvas */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto">
          {/* Header */}
          <div className="min-w-[900px] w-full grid grid-cols-[100px_repeat(5,_1fr)] border-b border-outline-variant bg-surface-container-low text-xs font-bold">
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
            {timetableConfig.map((configItem, idx) => {
              if (configItem.isBreak) {
                return (
                  <div key={`break-${idx}`} className="col-span-6 bg-surface-container-low py-2 px-4 flex items-center justify-center border-b border-outline-variant">
                    <span className="text-on-surface-variant text-xs font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">{configItem.icon || 'coffee'}</span>
                      {configItem.label} ({configItem.startTime} - {configItem.endTime})
                    </span>
                  </div>
                );
              }

              const period = configItem.periodNumber;

              return (
                <React.Fragment key={`period-${period}`}>
                  <div className="bg-surface-container-lowest p-2 border-r border-outline-variant flex flex-col items-center justify-center text-center">
                    <span className="font-bold text-xs text-on-surface-variant">{configItem.label}</span>
                    <span className="text-[10px] text-outline mt-0.5">{configItem.startTime} - {configItem.endTime}</span>
                  </div>

                  {daysList.map(day => {
                    const cells = getCellSlots(day, period);
                    const hasSlots = cells.length > 0;

                    const cellIsDropTarget = isDropTarget(day, period);
                    const cellIsDragSource = isDragSource(day, period);
                    const targetHasSlots = cellIsDropTarget && hasSlots;

                    return (
                      <div
                        key={day}
                        onDragOver={e => handleDragOver(e, day, period)}
                        onDragLeave={handleDragLeave}
                        onDrop={e => handleDrop(e, day, period)}
                        className={`p-2 border-r border-outline-variant min-h-[120px] transition-all duration-200 relative flex flex-col gap-2 ${
                          hasSlots ? 'bg-surface' : 'bg-surface-container-low/20'
                        } ${
                          cellIsDropTarget
                            ? 'ring-2 ring-primary ring-inset bg-primary/5 border-primary'
                            : ''
                        } ${
                          cellIsDragSource ? 'opacity-40' : ''
                        }`}
                      >
                        {targetHasSlots && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="bg-primary text-on-primary rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                              Swap
                            </div>
                          </div>
                        )}
                        
                        {cells.map(s => (
                          <div
                            key={s.id}
                            draggable={isDragEnabled}
                            onDragStart={e => handleDragStart(e, s)}
                            onDragEnd={handleDragEnd}
                            onClick={() => {
                              if (draggedSlot) return;
                              setSelectedSlot(s);
                              setEditSlotOpen(true);
                            }}
                            className={`flex-1 rounded-md border p-3 flex flex-col justify-between transition-all ${getSubjectColorStyle(s.subject?.isCore ?? true)} ${
                              isDragEnabled ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'cursor-pointer'
                            } ${draggedSlot?.id === s.id ? 'opacity-50 scale-95' : ''}`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-sm leading-tight text-on-surface">
                                {s.subject?.name}
                              </span>
                              {isDragEnabled && (
                                <span className="material-symbols-outlined text-[14px] text-on-surface-variant/40" title="Drag to reschedule">
                                  drag_indicator
                                </span>
                              )}
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

                        {/* Add Slot Button */}
                        {!hasSlots && viewMode === 'class' && (
                          <button
                            onClick={() => handleOpenAdd(day, period)}
                            className="flex-1 border border-dashed border-outline-variant hover:border-primary hover:text-primary transition-all text-on-surface-variant rounded-md flex flex-col items-center justify-center p-3 text-xs gap-1 opacity-50 hover:opacity-100 bg-transparent"
                          >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            <span className="font-bold text-[9px] uppercase tracking-wider">Free Slot</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Slot Modal */}
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

              <div className="bg-surface-container-low p-3 rounded-lg text-xs">
                Scheduling for <strong>{daysMap[targetDay]}</strong> during <strong>{getPeriodTimeFromConfig(timetableConfig, targetPeriod).label} ({getPeriodTimeFromConfig(timetableConfig, targetPeriod).time})</strong>.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Subject *</label>
                <select
                  value={formSubjectId}
                  onChange={e => setFormSubjectId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-transparent text-on-surface text-sm outline-none focus:border-primary"
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
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-transparent text-on-surface text-sm outline-none focus:border-primary"
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
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-transparent text-on-surface text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                <button
                  type="button"
                  onClick={() => setAddSlotOpen(false)}
                  className="px-5 py-2.5 border border-outline text-on-surface-variant rounded-lg font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSlot}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all text-xs disabled:opacity-50"
                >
                  {creatingSlot ? 'Saving...' : 'Save Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {editSlotOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 shadow-2xl relative flex flex-col">
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
                  {daysMap[selectedSlot.day]} • {getPeriodTimeFromConfig(timetableConfig, selectedSlot.periodNumber).label} ({getPeriodTimeFromConfig(timetableConfig, selectedSlot.periodNumber).time})
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-outline-variant mt-6">
              <button
                type="button"
                onClick={() => handleDeleteSlot(selectedSlot.id)}
                className="px-5 py-2.5 bg-error-container text-on-error-container hover:opacity-90 rounded-lg font-bold text-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span> Delete Slot
              </button>
              <button
                type="button"
                onClick={() => setEditSlotOpen(false)}
                className="px-5 py-2.5 border border-outline hover:bg-surface-container rounded-lg font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Conflict Alert */}
      {toast && (
        <div className={`fixed bottom-28 lg:bottom-8 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-slide-up ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
};
