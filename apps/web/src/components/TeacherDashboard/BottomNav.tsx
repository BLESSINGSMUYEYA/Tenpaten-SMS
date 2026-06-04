import { Link, useLocation } from 'react-router-dom';

export const BottomNav = () => {
  const location = useLocation();

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
      <Link className={getLinkClass('/teacher/dashboard')} to="/teacher/dashboard">
        <span className="material-symbols-outlined text-xl" data-icon="dashboard">dashboard</span>
        <span className="font-label-sm-mobile mt-1">Home</span>
      </Link>
      <Link className={getLinkClass('/teacher/classes')} to="/teacher/classes">
        <span className="material-symbols-outlined text-xl" data-icon="groups">groups</span>
        <span className="font-label-sm-mobile mt-1">Classes</span>
      </Link>
      <Link className={getLinkClass('/teacher/attendance')} to="/teacher/attendance">
        <span className="material-symbols-outlined text-xl" data-icon="how_to_reg">how_to_reg</span>
        <span className="font-label-sm-mobile mt-1">Attendance</span>
      </Link>
      <Link className={getLinkClass('/teacher/schedule')} to="/teacher/schedule">
        <span className="material-symbols-outlined text-xl" data-icon="calendar_month">calendar_month</span>
        <span className="font-label-sm-mobile mt-1">Schedule</span>
      </Link>
    </nav>
  );
};
