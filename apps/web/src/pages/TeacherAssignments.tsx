import { useState } from 'react';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';

export const TeacherAssignments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Breadcrumbs & Header */}
        <div className="py-lg flex flex-col sm:flex-row sm:items-end justify-between gap-md">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Staff</span>
              <span>/</span>
              <span className="text-primary font-bold">Assignments</span>
            </nav>
            <h1 className="dash-page-title">Coursework & Assignments</h1>
            <p className="font-body-md text-on-surface-variant">Create, distribute, and grade assignments across your subjects.</p>
          </div>
          <button
            disabled
            className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-container text-outline rounded-lg font-bold transition-all shadow-sm self-start sm:self-end cursor-not-allowed"
          >
            <span className="material-symbols-outlined" data-icon="add">add</span>
            New Assignment
          </button>
        </div>

        {/* Coming Soon Banner */}
        <div className="mb-lg bg-surface-container-high border-2 border-dashed border-primary/50 p-6 rounded-xl text-center">
          <span className="material-symbols-outlined text-primary text-4xl mb-2">construction</span>
          <h2 className="font-title-lg text-on-surface">Coursework & Assignments (Coming Soon)</h2>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto mt-2">
            This module is currently in development. Real assignment creation, distribution, and student submissions will be available in a future update.
          </p>
        </div>

        {/* Empty State */}
        <div className="py-12 text-center bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl">
          <span className="material-symbols-outlined text-5xl text-outline mb-4">assignment_turned_in</span>
          <h3 className="font-title-lg text-on-surface">No assignments here</h3>
          <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mt-1">
            Data will appear here once the feature is released.
          </p>
        </div>
      </main>
      <BottomNav />
    </>
  );
};
