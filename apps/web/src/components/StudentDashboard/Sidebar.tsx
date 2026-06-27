import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

export const Sidebar = ({ isOpen, closeSidebar }: { isOpen: boolean; closeSidebar: () => void }) => {
  const { logout, user } = useAuth();
  const school = user?.school;
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      <aside
        className={`flex flex-col fixed left-0 top-0 h-full z-50 bg-surface-container-lowest dark:bg-inverse-surface border-r border-surface-border dark:border-outline-variant shadow-sm w-72 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="h-14 flex items-center px-6 border-b border-outline-variant w-full shrink-0">
          <Logo height="80px" />
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Link to="/student/dashboard" className="flex items-center gap-4 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-bold font-label-md text-label-md">
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            Dashboard
          </Link>
          {school?.featuresGrades !== false && (
            <>
              <div className="flex items-center justify-between px-4 py-3 text-on-surface-variant opacity-60 cursor-not-allowed rounded-lg font-medium font-label-md text-label-md">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined" data-icon="assignment">assignment</span>
                  My Assignments
                </div>
                <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[9px] font-bold rounded-full uppercase tracking-wider">Soon</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-on-surface-variant opacity-60 cursor-not-allowed rounded-lg font-medium font-label-md text-label-md">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined" data-icon="grade">grade</span>
                  My Grades
                </div>
                <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[9px] font-bold rounded-full uppercase tracking-wider">Soon</span>
              </div>
            </>
          )}
          {school?.featuresAttendance !== false && (
            <div className="flex items-center justify-between px-4 py-3 text-on-surface-variant opacity-60 cursor-not-allowed rounded-lg font-medium font-label-md text-label-md">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
                Timetable
              </div>
              <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[9px] font-bold rounded-full uppercase tracking-wider">Soon</span>
            </div>
          )}
          {school?.featuresCommunication !== false && (
            <div className="flex items-center justify-between px-4 py-3 text-on-surface-variant opacity-60 cursor-not-allowed rounded-lg font-medium font-label-md text-label-md">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
                School Notices
              </div>
              <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[9px] font-bold rounded-full uppercase tracking-wider">Soon</span>
            </div>
          )}
        </nav>
        <div className="mt-auto border-t border-surface-border dark:border-outline-variant pt-4 flex flex-col gap-2">
          <button onClick={() => { closeSidebar(); logout(); }} className="flex items-center gap-4 px-4 py-3 text-on-error-container bg-error-container hover:bg-error/20 rounded-lg font-bold font-label-md text-label-md transition-colors w-full text-left">
            <span className="material-symbols-outlined" data-icon="logout">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
