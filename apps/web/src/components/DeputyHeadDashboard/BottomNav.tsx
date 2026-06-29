import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const school = user?.school;

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    const baseClass = "flex flex-col items-center justify-center px-4 py-1 active:scale-90 transition-transform duration-150";
    if (isActive) {
      return `${baseClass} bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed rounded-full`;
    }
    return `${baseClass} text-on-surface-variant hover:text-primary`;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface dark:bg-surface-dim px-2 pb-safe h-16 border-t border-surface-border dark:border-outline-variant">
      <Link className={getLinkClass('/deputy-head')} to="/deputy-head">
        <span className="material-symbols-outlined text-xl" data-icon="dashboard">dashboard</span>
        <span className="font-label-sm-mobile mt-1">Home</span>
      </Link>
      <Link className={getLinkClass('/deputy-head/staff')} to="/deputy-head/staff">
        <span className="material-symbols-outlined text-xl" data-icon="badge">badge</span>
        <span className="font-label-sm-mobile mt-1">Staff</span>
      </Link>
      <Link className={getLinkClass('/deputy-head/students')} to="/deputy-head/students">
        <span className="material-symbols-outlined text-xl" data-icon="group">group</span>
        <span className="font-label-sm-mobile mt-1">Students</span>
      </Link>
      {school?.featuresAttendance !== false && (
        <Link className={getLinkClass('/deputy-head/attendance')} to="/deputy-head/attendance">
          <span className="material-symbols-outlined text-xl" data-icon="how_to_reg">how_to_reg</span>
          <span className="font-label-sm-mobile mt-1">Attendance</span>
        </Link>
      )}
      <Link className={getLinkClass('/deputy-head/settings')} to="/deputy-head/settings">
        <span className="material-symbols-outlined text-xl" data-icon="settings">settings</span>
        <span className="font-label-sm-mobile mt-1">Settings</span>
      </Link>
    </nav>
  );
};
