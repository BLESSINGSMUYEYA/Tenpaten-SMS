import React, { useState, useEffect } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';
import { TimetableScheduler } from '../components/timetable/TimetableScheduler';

export const DeputyHeadTimetable: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
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
      <Header onMenuClick={toggleSidebar} zenMode={zenMode} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} zenMode={zenMode} />
      
      <main className={`transition-all duration-300 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface ${zenMode ? 'lg:ml-0' : 'lg:ml-72'}`}>
        <TimetableScheduler />
      </main>
      
      <BottomNav />
    </>
  );
};

export default DeputyHeadTimetable;
