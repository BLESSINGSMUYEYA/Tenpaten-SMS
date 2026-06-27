import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const navItems = [
  { label: 'Dashboard',        to: '/school-director',          icon: 'dashboard' },
  { label: 'Institution Setup', to: '/school-director/setup',   icon: 'tune' },
  { label: 'Academic Overview', to: '/school-director/academic', icon: 'school' },
  { label: 'Staff & HR',        to: '/school-director/staff',   icon: 'badge' },
  { label: 'Finance',           to: '/school-director/finance', icon: 'account_balance' },
  { label: 'Reports',           to: '/school-director/reports', icon: 'bar_chart' },
  { label: 'Settings',          to: '/school-director/settings',icon: 'settings' },
];

const SidebarContent: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (to: string) =>
    to === '/school-director'
      ? location.pathname === '/school-director'
      : location.pathname.startsWith(to);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'SD';

  const school = user?.school;

  const filteredNavItems = navItems.filter(item => {
    if (item.label === 'Academic Overview' && school?.featuresGrades === false) return false;
    if (item.label === 'Finance' && school?.featuresFees === false) return false;
    return true;
  });

  return (
    <>
      <div className="h-14 flex items-center px-6 border-b border-outline-variant w-full shrink-0">
        <Logo height="80px" />
      </div>

      {/* Director badge */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-primary-container/40 to-secondary-container/30 border border-outline-variant">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary font-bold text-sm shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-label-md text-on-surface font-bold truncate">{user?.firstName} {user?.lastName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[12px] text-secondary">star</span>
              <p className="font-label-sm text-secondary truncate font-semibold">School Director</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-xs">
        <p className="font-label-sm text-on-surface-variant uppercase tracking-widest px-2 pt-2 pb-1 opacity-60">Navigation</p>
        {filteredNavItems.map(item => (
          <Link
            key={item.label}
            to={item.to}
            onClick={onLinkClick}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 [&>.material-symbols-outlined]:text-[20px] ${
              isActive(item.to)
                ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label-md text-label-md">{item.label}</span>
            {isActive(item.to) && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Link>
        ))}
      </div>

      <div className="border-t border-outline-variant p-4 flex flex-col gap-xs">
        <a
          href="#"
          onClick={e => e.preventDefault()}
          className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="font-label-md text-label-md">Support</span>
        </a>
        <button
          className="flex items-center gap-md px-md py-sm rounded-lg text-error hover:bg-error-container/20 transition-colors w-full text-left font-label-md text-label-md"
          onClick={() => { onLinkClick?.(); logout(); }}
        >
          <span className="material-symbols-outlined">logout</span>
          Log Out
        </button>
      </div>
    </>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Desktop */}
      <aside className="bg-surface-container-lowest border-r border-outline-variant fixed left-0 top-0 h-full w-72 flex-col hidden lg:flex z-20">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      <aside
        className={`bg-surface-container-lowest border-r border-outline-variant fixed left-0 top-0 h-full w-72 flex flex-col z-50 lg:hidden transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onLinkClick={closeSidebar} />
      </aside>
    </>
  );
};
