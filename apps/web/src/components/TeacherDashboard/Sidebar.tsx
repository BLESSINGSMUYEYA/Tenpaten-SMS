import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const school = user?.school;

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-label-md text-label-md [&>.material-symbols-outlined]:text-[20px] ${isActive
      ? 'bg-primary-container text-on-primary-container font-bold'
      : 'text-on-surface-variant hover:bg-surface-container'
      }`;
  };

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
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <Link to="/teacher/dashboard" className={getLinkClass('/teacher/dashboard')} onClick={closeSidebar}>
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            Dashboard
          </Link>
          <Link to="/teacher/classes" className={getLinkClass('/teacher/classes')} onClick={closeSidebar}>
            <span className="material-symbols-outlined" data-icon="groups">groups</span>
            My Classes
          </Link>
          {school?.featuresGrades !== false && (
            <Link to="/teacher/assignments" className={getLinkClass('/teacher/assignments')} onClick={closeSidebar}>
              <span className="material-symbols-outlined" data-icon="assignment">assignment</span>
              Assignments
            </Link>
          )}
          {school?.featuresGrades !== false && (
            <Link to="/teacher/grades" className={getLinkClass('/teacher/grades')} onClick={closeSidebar}>
              <span className="material-symbols-outlined" data-icon="grading">grading</span>
              Grades
            </Link>
          )}

          {school?.featuresAttendance !== false && (
            <Link to="/teacher/schedule" className={getLinkClass('/teacher/schedule')} onClick={closeSidebar}>
              <span className="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
              Schedule
            </Link>
          )}
          {school?.featuresAttendance !== false && (
            <Link to="/teacher/attendance" className={getLinkClass('/teacher/attendance')} onClick={closeSidebar}>
              <span className="material-symbols-outlined" data-icon="fact_check">fact_check</span>
              Attendance
            </Link>
          )}

        </nav>
        <div className="mt-auto border-t border-surface-border dark:border-outline-variant pt-3 flex flex-col gap-1">
          <Link to="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg font-semibold transition-colors font-label-md text-label-md [&>.material-symbols-outlined]:text-[20px]">
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
            Settings
          </Link>
          <button onClick={() => { closeSidebar(); logout(); }} className="flex items-center gap-3 px-3 py-2 text-on-error-container bg-error-container hover:bg-error/20 rounded-lg font-bold transition-colors w-full text-left font-label-md text-label-md [&>.material-symbols-outlined]:text-[20px]">
            <span className="material-symbols-outlined" data-icon="logout">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
