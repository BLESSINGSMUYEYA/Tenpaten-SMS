import { useState } from 'react';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';

export const TeacherClasses = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');

  const classes = [
    {
      id: 1,
      name: 'Form 3A - Mathematics',
      level: 'Form 3',
      students: 35,
      schedule: 'Mon, Wed, Fri • 08:00 AM',
      room: 'Room 101',
      avgGrade: '82%',
      attendance: '97.2%',
      gradeStatus: 'high', // high | medium | low
    },
    {
      id: 2,
      name: 'Form 4B - Physics',
      level: 'Form 4',
      students: 28,
      schedule: 'Tue, Thu • 10:00 AM',
      room: 'Lab 2',
      avgGrade: '71%',
      attendance: '93.4%',
      gradeStatus: 'medium',
    },
    {
      id: 3,
      name: 'Form 2C - Mathematics',
      level: 'Form 2',
      students: 40,
      schedule: 'Mon, Wed • 02:00 PM',
      room: 'Room 105',
      avgGrade: '70%',
      attendance: '96.8%',
      gradeStatus: 'medium',
    },
  ];

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || cls.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'All' || cls.level === filterLevel;
    return matchesSearch && matchesFilter;
  });

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
              <span className="text-primary font-bold">My Classes</span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">My Assigned Classes</h1>
            <p className="font-body-md text-on-surface-variant">Manage your assigned classes, take attendance registers, and access gradebooks.</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop mb-8">
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="groups">groups</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Total Students</p>
              <h3 className="font-headline-md text-primary mt-1">103</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="trending_up">trending_up</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Class Average</p>
              <h3 className="font-headline-md text-secondary mt-1">74.5%</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Avg Attendance</p>
              <h3 className="font-headline-md text-tertiary mt-1">95.8%</h3>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
            <input
              type="text"
              placeholder="Search class by subject or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
            {['All', 'Form 2', 'Form 3', 'Form 4'].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-4 py-2 rounded-full font-label-md active:scale-95 transition-all whitespace-nowrap ${
                  filterLevel === level
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container border border-surface-border text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Classes Catalog */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter-desktop">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl p-6 shadow-sm hover:border-primary transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-title-lg text-on-surface hover:text-primary transition-colors cursor-pointer">{cls.name}</h2>
                      <p className="font-body-sm text-on-surface-variant mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span>{cls.room} • {cls.students} Students</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 text-label-sm bg-surface-container text-primary rounded-full font-bold">
                      {cls.level}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 my-4 border-y border-surface-border dark:border-outline-variant">
                    <div className="flex flex-col">
                      <span className="text-outline font-label-sm uppercase">Attendance Rate</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                        <span className="font-title-md text-on-surface">{cls.attendance}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-outline font-label-sm uppercase">Average Performance</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="material-symbols-outlined text-primary text-lg">school</span>
                        <span className="font-title-md text-on-surface">{cls.avgGrade}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-on-surface-variant font-body-sm mb-6">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>{cls.schedule}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-border dark:border-outline-variant">
                  <button className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs">
                    <span className="material-symbols-outlined text-[16px]">fact_check</span>
                    <span>Attendance</span>
                  </button>
                  <button className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-4 py-2.5 border border-primary text-primary font-bold rounded-lg hover:bg-surface-container-low active:scale-95 transition-all text-xs">
                    <span className="material-symbols-outlined text-[16px]">grading</span>
                    <span>Gradebook</span>
                  </button>
                  <button className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-4 py-2.5 border border-outline text-on-surface-variant hover:bg-surface-container rounded-lg active:scale-95 transition-all text-xs">
                    <span className="material-symbols-outlined text-[16px]">groups</span>
                    <span>Roster</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-5xl text-outline mb-4">search_off</span>
              <h3 className="font-title-lg text-on-surface">No classes found</h3>
              <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mt-1">
                We couldn't find any classes matching "{searchTerm}". Try refining your query or resetting filters.
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
};
