import React, { useState, useEffect } from 'react';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';
import { TimetableScheduler } from '../components/timetable/TimetableScheduler';

export const HeadTeacherTimetable: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    const handleZenMode = (e: Event) => {
      setZenMode((e as CustomEvent).detail);
    };
    window.addEventListener('myklasi:zenmode', handleZenMode);
    return () => {
      window.removeEventListener('myklasi:zenmode', handleZenMode);
    };
  }, []);

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      
      <main className={`transition-all duration-300 pt-20 pb-24 lg:pb-8 px-md md:px-margin-desktop min-h-screen bg-surface text-on-surface ${zenMode ? 'lg:ml-0' : 'lg:ml-72'}`}>
        <TimetableScheduler />
      </main>
      
      <BottomNav />
    </>
  );
};

export default HeadTeacherTimetable;
