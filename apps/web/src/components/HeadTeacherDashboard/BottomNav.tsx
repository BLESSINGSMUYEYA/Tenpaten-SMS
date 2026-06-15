import { Link, useLocation } from 'react-router-dom';

const bottomNavItems = [
  { icon: 'dashboard', label: 'Home', to: '/head-teacher' },
  { icon: 'group', label: 'People', to: '/head-teacher/people' },
  { icon: 'school', label: 'Academic', to: '/head-teacher/academic' },
  { icon: 'event_available', label: 'Attendance', to: '/head-teacher/attendance' },

];

export const BottomNav = () => {
  const location = useLocation();

  const isActive = (to: string) =>
    to === '/head-teacher'
      ? location.pathname === '/head-teacher'
      : location.pathname.startsWith(to);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface dark:bg-surface-dim px-2 pb-safe h-16 border-t border-surface-border dark:border-outline-variant">
      {bottomNavItems.map(item => (
        <Link
          key={item.label}
          to={item.to}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-full active:scale-90 transition-transform duration-150 ${
            isActive(item.to)
              ? 'bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed'
              : 'text-on-surface-variant dark:text-outline hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined" data-icon={item.icon}>{item.icon}</span>
          <span className="font-label-sm text-label-sm-mobile">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};
