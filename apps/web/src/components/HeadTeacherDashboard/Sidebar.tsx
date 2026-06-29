import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'group', label: 'People', to: '/head-teacher/people' },
  { icon: 'school', label: 'Academic', to: '/head-teacher/academic' },
  { icon: 'calendar_today', label: 'Timetables', to: '/head-teacher/timetable' },
  { icon: 'event_available', label: 'Attendance', to: '/head-teacher/attendance' },
  { icon: 'account_balance', label: 'Finance & Billing', to: '/head-teacher/settings?tab=billing' },
  { icon: 'settings', label: 'Settings', to: '/head-teacher/settings' },
];

export const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const school = user?.school;

  const isActive = (to: string) =>
    to === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(to);

  const filteredNavItems = navItems.filter(item => {
    if (item.label === 'Academic' && school?.featuresGrades === false) return false;
    if (item.label === 'Timetables' && school?.featuresAttendance === false) return false;
    if (item.label === 'Attendance' && school?.featuresAttendance === false) return false;
    if (item.label === 'Finance & Billing' && school?.featuresFees === false) return false;
    return true;
  });

  return (
    <>
      {/* Mobile scrim — outside aside so z-index stacks correctly */}
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
        {user?.role === 'school_director' && (
          <div className="px-4 pt-4 shrink-0">
            <Link
              to="/school-director"
              className="flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary py-2.5 rounded-lg font-bold transition-all text-sm w-full border border-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Director Portal
            </Link>
          </div>
        )}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {filteredNavItems.map(item => (
            <Link
              key={item.label}
              to={item.to}
              onClick={closeSidebar}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 active:scale-95 ${isActive(item.to)
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container dark:hover:bg-surface-container-high'
                }`}
            >
              <span className="material-symbols-outlined" data-icon={item.icon}>{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-surface-border mt-auto flex flex-col gap-2">
          <button
            className="w-full flex items-center justify-center gap-2 bg-error-container text-on-error-container py-3 rounded-lg font-bold hover:bg-error/20"
            onClick={() => { closeSidebar(); logout(); }}
          >
            <span className="material-symbols-outlined" data-icon="logout">logout</span> Logout
          </button>
        </div>

      </aside>
    </>
  );
};
