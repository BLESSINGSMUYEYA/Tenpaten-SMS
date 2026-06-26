import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const navItems = [
  { label: 'Dashboard',       to: '/it-coordinator',              icon: 'dashboard' },
  { label: 'Infrastructure',  to: '/it-coordinator/infrastructure', icon: 'device_hub' },
  { label: 'User Management', to: '/it-coordinator/users',         icon: 'manage_accounts' },
  { label: 'Security',        to: '/it-coordinator/security',      icon: 'security' },
  { label: 'Settings',        to: '/it-coordinator/settings',      icon: 'settings' },
];

const SidebarContent: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (to: string) =>
    to === '/it-coordinator'
      ? location.pathname === '/it-coordinator'
      : location.pathname.startsWith(to);

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : 'IT';

  return (
    <>
      <div className="h-14 flex items-center px-6 border-b border-outline-variant w-full shrink-0">
        <Logo height="80px" />
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-tertiary-container/30 border border-tertiary-container/40">
          <div className="w-9 h-9 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-label-md text-on-surface font-bold truncate">{user?.firstName} {user?.lastName}</p>
            <p className="font-label-sm text-tertiary truncate font-medium">IT Coordinator</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-xs">
        <p className="font-label-sm text-on-surface-variant uppercase tracking-widest px-2 pt-2 pb-1 opacity-60">Navigation</p>
        {navItems.map(item => (
          <Link
            key={item.label}
            to={item.to}
            onClick={onLinkClick}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 [&>.material-symbols-outlined]:text-[20px] ${
              isActive(item.to)
                ? 'bg-tertiary-container text-on-tertiary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label-md text-label-md">{item.label}</span>
            {isActive(item.to) && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-tertiary" />
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
      {/* Mobile scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Desktop sidebar */}
      <aside className="bg-surface-container-lowest border-r border-outline-variant fixed left-0 top-0 h-full w-72 flex-col hidden lg:flex z-20">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
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
