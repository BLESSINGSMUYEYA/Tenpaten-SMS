import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '../hooks/useApi';
import { Header } from '../components/StudentDashboard/Header';
import { Sidebar } from '../components/StudentDashboard/Sidebar';
import { BottomNav } from '../components/StudentDashboard/BottomNav';

interface Grade {
  id: string;
  subject: {
    name: string;
    code: string;
  };
  totalMark: number;
  gradeLetter: string;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.firstName ?? 'Student';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Queries
  const { data: grades, loading: loadingGrades } = useQuery<Grade[]>('/grades');

  // Calculate terminal average from grades
  const validMarks = (grades || []).filter(g => g.totalMark !== null).map(g => g.totalMark);
  const terminalAverage = validMarks.length > 0 
    ? (validMarks.reduce((a, b) => a + b, 0) / validMarks.length).toFixed(1) 
    : '0';

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        <div className="py-6 flex flex-col gap-6">
          {/* Welcome Banner */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop">
            <div className="md:col-span-2 relative overflow-hidden bg-primary rounded-xl p-6 flex items-center justify-between text-on-primary">
              <div className="relative z-10">
                <span className="bg-secondary px-3 py-1 rounded-full font-label-sm text-label-sm text-on-secondary mb-2 inline-block font-medium">Student Center</span>
                <h2 className="font-headline-sm font-bold mb-1">Welcome back, {firstName}!</h2>
                <p className="font-body-sm opacity-90 max-w-sm">Review your term updates and academic performance below.</p>
              </div>
              <div className="hidden lg:block">
                <span className="material-symbols-outlined text-[100px] opacity-10">workspace_premium</span>
              </div>
            </div>
            {/* Attendance Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-secondary/10 text-secondary border border-secondary/20 rounded-full flex items-center justify-center font-title-lg font-bold mb-2">
                98%
              </div>
              <p className="font-label-md font-medium text-on-surface uppercase tracking-wider">Attendance Summary</p>
              <p className="font-label-sm text-on-surface-variant mt-1">Excellent daily attendance</p>
            </div>
          </section>

          {/* Grades */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h3 className="font-title-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">school</span> Term Gradebook Results
            </h3>
            {loadingGrades ? (
              <p className="text-on-surface-variant">Loading report card...</p>
            ) : grades && grades.length > 0 ? (
              <div className="divide-y divide-outline-variant/60">
                {grades.map(g => (
                  <div key={g.id} className="py-2.5 flex justify-between items-center">
                    <span className="font-bold text-on-surface">{g.subject.name}</span>
                    <div className="flex gap-4 items-center">
                      <span className="font-bold text-primary">{g.totalMark}%</span>
                      <span className="w-8 h-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                        {g.gradeLetter}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant py-4">No published academic grades available for this term yet.</p>
            )}
          </section>

          {/* Progress Summary */}
          <div className="bg-primary-container p-6 rounded-xl text-on-primary-container">
            <p className="font-bold uppercase tracking-widest text-[9px] mb-2 opacity-80">Progress Summary</p>
            <div className="flex justify-between items-center">
              <span>Term Average</span>
              <span className="font-bold text-secondary-fixed">{terminalAverage}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-secondary-fixed" style={{ width: `${terminalAverage}%` }} />
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
};

export default StudentDashboard;
