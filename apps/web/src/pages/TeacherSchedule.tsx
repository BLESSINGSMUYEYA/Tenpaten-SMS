import { useState, useMemo } from 'react';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';
import { useQuery } from '../hooks/useApi';
import { Link } from 'react-router-dom';

// API day enum → display name mapping
const DAY_MAP: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
};

const DISPLAY_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Map display name → current JS day index (0=Sun)
const TODAY_MAP: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
};

interface TimetableSlot {
  id: string;
  day: string;       // 'Mon' | 'Tue' | ...
  periodNumber: number;
  room?: string;
  class: { id: string; displayName: string };
  subject: { id: string; name: string; code: string };
  term: { id: string; name: string };
}

interface TermRecord {
  id: string;
  name: string;
  isCurrent: boolean;
}

const getPeriodStyle = (periodNumber: number) => {
  const styles = [
    { colorClass: 'bg-primary-container/10 border-primary text-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20', dotClass: 'bg-primary', iconName: 'school' },
    { colorClass: 'bg-secondary-container/10 border-secondary text-secondary', badgeClass: 'bg-secondary/10 text-secondary border-secondary/20', dotClass: 'bg-secondary', iconName: 'biotech' },
    { colorClass: 'bg-tertiary-container/10 border-tertiary text-tertiary', badgeClass: 'bg-tertiary/10 text-tertiary border-tertiary/20', dotClass: 'bg-tertiary', iconName: 'engineering' },
    { colorClass: 'bg-on-secondary-container/10 border-purple-500 text-purple-600', badgeClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20', dotClass: 'bg-purple-500', iconName: 'groups' },
    { colorClass: 'bg-surface-container border-outline-variant text-on-surface-variant', badgeClass: 'bg-surface-container-high text-on-surface-variant border-surface-border', dotClass: 'bg-outline-variant', iconName: 'schedule' },
  ];
  return styles[(periodNumber - 1) % styles.length];
};

const getPeriodTimeFromConfig = (config: any[], num: number) => {
  const period = config?.find(c => !c.isBreak && c.periodNumber === num);
  if (period) {
    return { time: `${period.startTime} - ${period.endTime}`, label: period.label };
  }
  return { time: '00:00 - 00:00', label: `Period ${num}` };
};

export const TeacherSchedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Default selected day to today (or Monday if weekend)
  const todayJsDay = new Date().getDay();
  const todayDisplay =
    DISPLAY_DAYS.find(d => TODAY_MAP[d] === todayJsDay) || 'Monday';
  const [selectedDay, setSelectedDay] = useState<string>(todayDisplay);

  const { data: timetableSlots, loading, error } = useQuery<TimetableSlot[]>('/timetable');
  const { data: termList } = useQuery<TermRecord[]>('/schools/terms');
  const { data: mySchool } = useQuery<any>('/schools/my-school');
  
  const timetableConfig = mySchool?.timetableConfig || [];

  // Current term for display context
  const currentTerm = termList?.find(t => t.isCurrent) || termList?.[0];

  // Group slots by display-day
  const weeklySchedule = useMemo(() => {
    const grouped: Record<string, TimetableSlot[]> = {};
    DISPLAY_DAYS.forEach(d => (grouped[d] = []));

    (timetableSlots || []).forEach(slot => {
      const displayDay = DAY_MAP[slot.day];
      if (displayDay && grouped[displayDay]) {
        grouped[displayDay].push(slot);
      }
    });

    // Sort each day by period number
    Object.keys(grouped).forEach(d => {
      grouped[d].sort((a, b) => a.periodNumber - b.periodNumber);
    });

    return grouped;
  }, [timetableSlots]);

  const currentDaySchedule = weeklySchedule[selectedDay] || [];

  // Total unique classes count
  const uniqueClasses = useMemo(() => {
    const ids = new Set((timetableSlots || []).map(s => s.class.id));
    return ids.size;
  }, [timetableSlots]);

  // Total periods this week
  const totalPeriods = (timetableSlots || []).length;

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Breadcrumbs & Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Staff</span>
              <span>/</span>
              <span className="text-primary font-bold">Schedule</span>
            </nav>
            <h1 className="dash-page-title">Weekly Timetable</h1>
            <p className="font-body-md text-on-surface-variant">
              Your scheduled teaching periods
              {currentTerm ? ` — ${currentTerm.name}` : ''}.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Summary Chips */}
            <div className="flex gap-2 font-label-md">
              <span className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-full">
                {uniqueClasses} Classes
              </span>
              <span className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full">
                {totalPeriods} Periods/wk
              </span>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-primary text-primary font-bold rounded-lg hover:bg-surface-container-low active:scale-95 transition-all font-label-md">
              <span className="material-symbols-outlined text-[18px]">print</span>
              Print Schedule
            </button>
          </div>
        </div>

        {/* Loading / Error states */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-on-surface-variant font-body-md">Loading your timetable...</span>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-error-container border border-error/20 text-on-error-container rounded-xl mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <span className="font-body-sm">Failed to load timetable: {error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Week Day Switcher */}
            <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-2 rounded-2xl shadow-sm mb-8 flex overflow-x-auto gap-2">
              {DISPLAY_DAYS.map((day) => {
                const count = weeklySchedule[day]?.length || 0;
                const isSelected = selectedDay === day;
                const isToday = TODAY_MAP[day] === todayJsDay;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-1 min-w-[110px] py-3.5 px-4 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 relative ${
                      isSelected
                        ? 'bg-primary text-on-primary font-bold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    {isToday && (
                      <span className={`absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-secondary' : 'bg-primary'}`} />
                    )}
                    <span className="font-title-md">{day.slice(0, 3)}</span>
                    <span className="hidden sm:block font-body-sm font-normal opacity-70">{day}</span>
                    <span className={`font-label-sm mt-1.5 ${isSelected ? 'text-on-primary/80 font-medium' : 'text-outline font-normal'}`}>
                      {count} {count === 1 ? 'Period' : 'Periods'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Timeline Slots */}
            {currentDaySchedule.length > 0 ? (
              <div className="relative border-l-2 border-outline-variant ml-4 sm:ml-8 space-y-4 pb-4">
                {currentDaySchedule.map((slot) => {
                  const { colorClass, badgeClass, dotClass, iconName } = getPeriodStyle(slot.periodNumber);
                  return (
                    <div key={slot.id} className="relative pl-8 sm:pl-10 group">
                      {/* Timeline Node */}
                      <div
                        className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-surface-container-lowest transition-all group-hover:scale-125 ${dotClass}`}
                      />

                      <div className="flex flex-col gap-1.5">
                        {/* Period label */}
                        <div className="flex items-center gap-2">
                          <span className="font-label-sm text-outline font-bold">
                            {getPeriodTimeFromConfig(timetableConfig, slot.periodNumber).label} 
                            <span className="font-normal opacity-70 ml-1">({getPeriodTimeFromConfig(timetableConfig, slot.periodNumber).time})</span>
                          </span>
                          {slot.room && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-surface-container border border-surface-border dark:border-outline-variant text-on-surface-variant rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">location_on</span>
                              {slot.room}
                            </span>
                          )}
                        </div>

                        {/* Slot Card */}
                        <div
                          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 px-4 border rounded-xl shadow-sm transition-all hover:shadow-md gap-3 sm:gap-0 ${colorClass}`}
                        >
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-10 h-10 rounded-full bg-surface-container-lowest border border-surface-border dark:border-outline-variant flex items-center justify-center text-on-surface flex-shrink-0">
                              <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-title-sm font-bold text-on-surface flex items-center gap-2">
                                {slot.subject.name}
                                <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-full uppercase tracking-wider ${badgeClass} sm:hidden`}>
                                  {slot.subject.code}
                                </span>
                              </h3>
                              <p className="font-body-sm text-on-surface-variant font-medium">{slot.class.displayName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end border-t border-outline-variant/30 pt-3 sm:pt-0 sm:border-0 mt-1 sm:mt-0">
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Link
                                to={`/teacher/attendance?classId=${slot.class.id}`}
                                className={`flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg text-[11px] sm:text-[10px] font-bold hover:brightness-95 active:scale-95 transition-all flex items-center gap-1 bg-surface-container-lowest border ${badgeClass}`}
                              >
                                <span className="material-symbols-outlined text-[14px]">fact_check</span>
                                Attendance
                              </Link>
                              <Link
                                to={`/teacher/grades?classId=${slot.class.id}`}
                                className={`flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg text-[11px] sm:text-[10px] font-bold hover:brightness-95 active:scale-95 transition-all flex items-center gap-1 bg-surface-container-lowest border ${badgeClass}`}
                              >
                                <span className="material-symbols-outlined text-[14px]">grading</span>
                                Grades
                              </Link>
                            </div>
                            <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full uppercase tracking-wider ${badgeClass} hidden sm:block`}>
                              {slot.subject.code}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl ml-0 sm:ml-4">
                <span className="material-symbols-outlined text-5xl text-outline mb-4 block">calendar_today</span>
                <h3 className="font-title-lg text-on-surface">No Classes Scheduled</h3>
                <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mt-1">
                  You have no teaching periods assigned for {selectedDay}.
                </p>
              </div>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
};
