import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/head-teacher' },
  { icon: 'group', label: 'People', to: '/head-teacher/people' },
  { icon: 'school', label: 'Academic', to: '/head-teacher/academic' },
  { icon: 'event_available', label: 'Attendance', to: '/head-teacher/attendance' },

  { icon: 'settings', label: 'Settings', to: '/head-teacher/settings' },
];

export const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (to: string) =>
    to === '/head-teacher'
      ? location.pathname === '/head-teacher'
      : location.pathname.startsWith(to);

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
        className={`flex flex-col fixed left-0 top-0 h-full z-50 p-4 bg-surface-container-lowest dark:bg-inverse-surface border-r border-surface-border dark:border-outline-variant shadow-sm w-72 pt-6 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
      <div className="px-4 mb-6 flex flex-col items-center text-center">
        <Logo height="48px" className="mb-1" />
      </div>



      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.label}
            to={item.to}
            onClick={closeSidebar}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 active:scale-95 ${
              isActive(item.to)
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
