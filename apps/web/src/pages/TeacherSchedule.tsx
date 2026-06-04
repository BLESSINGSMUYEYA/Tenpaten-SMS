import { useState } from 'react';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';

type ScheduleItem = {
  id: number;
  time: string;
  subject: string;
  room: string;
  type: 'lecture' | 'practical' | 'break' | 'duty' | 'meeting';
  duration: string;
};

export const TeacherSchedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const weeklySchedule: Record<string, ScheduleItem[]> = {
    Monday: [
      { id: 1, time: '08:00 AM - 09:30 AM', subject: 'Form 3A - Mathematics', room: 'Room 101', type: 'lecture', duration: '90m' },
      { id: 2, time: '10:00 AM - 11:30 AM', subject: 'Form 4B - Physics', room: 'Lab 2', type: 'practical', duration: '90m' },
      { id: 3, time: '11:30 AM - 12:30 PM', subject: 'Lunch Break', room: 'Staff Room', type: 'break', duration: '60m' },
      { id: 4, time: '02:00 PM - 03:30 PM', subject: 'Form 2C - Mathematics', room: 'Room 105', type: 'lecture', duration: '90m' },
    ],
    Tuesday: [
      { id: 5, time: '08:00 AM - 09:30 AM', subject: 'Form 2C - Mathematics', room: 'Room 105', type: 'lecture', duration: '90m' },
      { id: 6, time: '10:00 AM - 11:30 AM', subject: 'Form 4B - Physics', room: 'Room 202', type: 'lecture', duration: '90m' },
      { id: 7, time: '11:30 AM - 12:30 PM', subject: 'Office Hours / Prep Block', room: 'Math Office', type: 'duty', duration: '60m' },
      { id: 8, time: '01:00 PM - 02:30 PM', subject: 'Form 1A - Mathematics (Cover)', room: 'Room 103', type: 'lecture', duration: '90m' },
    ],
    Wednesday: [
      { id: 9, time: '08:00 AM - 09:30 AM', subject: 'Form 3A - Mathematics', room: 'Room 101', type: 'lecture', duration: '90m' },
      { id: 10, time: '10:00 AM - 11:30 AM', subject: 'Form 4B - Physics', room: 'Lab 2', type: 'practical', duration: '90m' },
      { id: 11, time: '11:30 AM - 12:30 PM', subject: 'Lunch Break', room: 'Staff Room', type: 'break', duration: '60m' },
      { id: 12, time: '02:00 PM - 03:30 PM', subject: 'Form 2C - Mathematics', room: 'Room 105', type: 'lecture', duration: '90m' },
    ],
    Thursday: [
      { id: 13, time: '08:00 AM - 09:30 AM', subject: 'Form 2C - Mathematics', room: 'Room 105', type: 'lecture', duration: '90m' },
      { id: 14, time: '10:00 AM - 11:30 AM', subject: 'Form 4B - Physics', room: 'Room 202', type: 'lecture', duration: '90m' },
      { id: 15, time: '11:30 AM - 01:00 PM', subject: 'Bi-Weekly Staff Meeting', room: 'Main Hall', type: 'meeting', duration: '90m' },
    ],
    Friday: [
      { id: 16, time: '08:00 AM - 09:30 AM', subject: 'Form 3A - Mathematics', room: 'Room 101', type: 'lecture', duration: '90m' },
      { id: 17, time: '10:00 AM - 11:30 AM', subject: 'Physics Lab Prep', room: 'Lab 2', type: 'duty', duration: '90m' },
      { id: 18, time: '11:30 AM - 12:30 PM', subject: 'Lunch Break', room: 'Staff Room', type: 'break', duration: '60m' },
    ],
  };

  const currentDaySchedule = weeklySchedule[selectedDay] || [];

  const getTypeStyleAndIcon = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'lecture':
        return {
          colorClass: 'bg-primary-container/10 border-primary text-primary',
          badgeClass: 'bg-primary/10 text-primary border-primary/20',
          dotClass: 'bg-primary',
          iconName: 'school',
        };
      case 'practical':
        return {
          colorClass: 'bg-secondary-container/10 border-secondary text-secondary',
          badgeClass: 'bg-secondary/10 text-secondary border-secondary/20',
          dotClass: 'bg-secondary',
          iconName: 'biotech',
        };
      case 'duty':
        return {
          colorClass: 'bg-tertiary-container/10 border-tertiary text-tertiary',
          badgeClass: 'bg-tertiary/10 text-tertiary border-tertiary/20',
          dotClass: 'bg-tertiary',
          iconName: 'engineering',
        };
      case 'meeting':
        return {
          colorClass: 'bg-on-secondary-container/10 border-purple-500 text-purple-600 dark:text-purple-400',
          badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          dotClass: 'bg-purple-500',
          iconName: 'groups',
        };
      default:
        return {
          colorClass: 'bg-surface-container border-outline-variant text-on-surface-variant',
          badgeClass: 'bg-surface-container-high text-on-surface-variant border-surface-border',
          dotClass: 'bg-outline-variant',
          iconName: 'restaurant',
        };
    }
  };

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
            <h1 className="font-headline-xl text-headline-xl text-primary">Weekly Timetable</h1>
            <p className="font-body-md text-on-surface-variant">View your scheduled teaching classes, lab sessions, and duty blocks.</p>
          </div>
          <div className="flex gap-2 self-start md:self-end">
            <button className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-primary text-primary font-bold rounded-lg hover:bg-surface-container-low active:scale-95 transition-all text-xs">
              <span className="material-symbols-outlined text-[18px]">print</span>
              Print Schedule
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary-container text-on-secondary-container border border-secondary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs">
              <span className="material-symbols-outlined text-[18px]">sync_alt</span>
              Request Swap
            </button>
          </div>
        </div>

        {/* Week Day Switcher */}
        <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-2 rounded-2xl shadow-sm mb-8 flex overflow-x-auto gap-2">
          {days.map((day) => {
            const count = weeklySchedule[day]?.length || 0;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 min-w-[120px] py-3.5 px-4 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="font-title-md">{day}</span>
                <span className={`text-xs mt-1.5 ${isSelected ? 'text-on-primary/80 font-medium' : 'text-outline font-normal'}`}>
                  {count} {count === 1 ? 'Period' : 'Periods'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timeline Slots */}
        <div className="relative border-l-2 border-outline-variant ml-4 sm:ml-8 space-y-4 pb-4">
          {currentDaySchedule.length > 0 ? (
            currentDaySchedule.map((item) => {
              const { colorClass, badgeClass, dotClass, iconName } = getTypeStyleAndIcon(item.type);
              return (
                <div key={item.id} className="relative pl-8 sm:pl-10 group">
                  {/* Timeline Node */}
                  <div
                    className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-surface-container-lowest transition-all group-hover:scale-125 ${dotClass}`}
                  ></div>

                  <div className="flex flex-col gap-1.5">
                    {/* Time & Duration */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-outline font-bold">{item.time}</span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-surface-container border border-surface-border dark:border-outline-variant text-on-surface-variant rounded-full">
                        {item.duration}
                      </span>
                    </div>

                    {/* Compact Card */}
                    <div
                      className={`flex justify-between items-center py-2.5 px-4 border rounded-xl shadow-sm transition-all hover:shadow-md ${colorClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-lowest border border-surface-border dark:border-outline-variant flex items-center justify-center text-on-surface flex-shrink-0">
                          <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-on-surface">{item.subject}</h3>
                          <div className="flex items-center gap-1 mt-0.5 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[13px]">location_on</span>
                            <span className="text-[11px]">{item.room}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full uppercase tracking-wider ${badgeClass}`}>
                          {item.type}
                        </span>
                        {item.type !== 'break' && (
                          <button className="p-1.5 bg-surface-container-lowest border border-surface-border rounded-lg text-on-surface-variant hover:text-primary active:scale-90 transition-transform">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl ml-4">
              <span className="material-symbols-outlined text-5xl text-outline mb-4">calendar_today</span>
              <h3 className="font-title-lg text-on-surface">Free Day</h3>
              <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mt-1">
                You have no scheduled teaching blocks or duty sessions on this day.
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
};
