import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

export const Sidebar = ({ 
  isOpen, 
  closeSidebar,
  zenMode = false 
}: { 
  isOpen: boolean; 
  closeSidebar: () => void;
  zenMode?: boolean;
}) => {
  const { logout } = useAuth();
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-label-md text-label-md [&>.material-symbols-outlined]:text-[20px] ${
      isActive
        ? 'bg-primary-container text-on-primary-container font-bold'
        : 'text-on-surface-variant hover:bg-surface-container font-medium'
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
        className={`flex flex-col fixed left-0 top-0 h-full z-50 p-4 bg-surface-container-lowest dark:bg-inverse-surface border-r border-surface-border dark:border-outline-variant shadow-sm w-72 pt-6 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          zenMode ? 'lg:-translate-x-full' : 'lg:translate-x-0'
        }`}
      >
      <div className="px-4 mb-6 flex flex-col items-center text-center">
        <Logo height="48px" className="mb-1" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        <Link to="/deputy-head" className={getLinkClass('/deputy-head')} onClick={closeSidebar}>
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          Dashboard
        </Link>
        <Link to="/deputy-head/timetable" className={getLinkClass('/deputy-head/timetable')} onClick={closeSidebar}>
          <span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
          Timetables
        </Link>
        <Link to="/deputy-head/academics" className={getLinkClass('/deputy-head/academics')} onClick={closeSidebar}>
          <span className="material-symbols-outlined" data-icon="school">school</span>
          Academic Records
        </Link>
        <Link to="/deputy-head/attendance" className={getLinkClass('/deputy-head/attendance')} onClick={closeSidebar}>
          <span className="material-symbols-outlined" data-icon="how_to_reg">how_to_reg</span>
          Attendance
        </Link>

        <Link to="/deputy-head/students" className={getLinkClass('/deputy-head/students')} onClick={closeSidebar}>
          <span className="material-symbols-outlined" data-icon="group">group</span>
          Student Directory
        </Link>
        <Link to="/deputy-head/staff" className={getLinkClass('/deputy-head/staff')} onClick={closeSidebar}>
          <span className="material-symbols-outlined" data-icon="badge">badge</span>
          Staff Management
        </Link>
        <Link to="/deputy-head/discipline" className={getLinkClass('/deputy-head/discipline')} onClick={closeSidebar}>
          <span className="material-symbols-outlined" data-icon="gavel">gavel</span>
          Discipline Log
        </Link>
        <Link to="/deputy-head/settings" className={getLinkClass('/deputy-head/settings')} onClick={closeSidebar}>
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
          Settings
        </Link>
      </nav>
      <div className="mt-auto border-t border-surface-border dark:border-outline-variant pt-4 flex flex-col gap-2">
        <button onClick={() => { closeSidebar(); logout(); }} className="flex items-center gap-3 px-4 py-2.5 text-on-error-container bg-error-container hover:bg-error/20 rounded-lg font-bold transition-colors w-full text-left font-label-md text-label-md [&>.material-symbols-outlined]:text-[20px]">
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          Logout
        </button>
      </div>
      </aside>
    </>
  );
};
export default Sidebar;
