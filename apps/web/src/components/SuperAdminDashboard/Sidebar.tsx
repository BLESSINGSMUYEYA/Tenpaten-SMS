import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',    to: '/super-admin',           icon: 'dashboard' },
      { label: 'Analytics',   to: '/super-admin/analytics', icon: 'bar_chart' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Schools',     to: '/super-admin/schools',   icon: 'domain' },
      { label: 'Users',       to: '/super-admin/users',     icon: 'group' },
      { label: 'Billing',     to: '/super-admin/billing',   icon: 'credit_card' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Support',     to: '/super-admin/support',   icon: 'confirmation_number' },
      { label: 'Broadcast',   to: '/super-admin/broadcast', icon: 'campaign' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Audit Log',   to: '/super-admin/audit',    icon: 'history' },
      { label: 'Platform',    to: '/super-admin/platform', icon: 'tune' },
      { label: 'Settings',    to: '/super-admin/settings', icon: 'settings' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (to: string) =>
    to === '/super-admin'
      ? location.pathname === '/super-admin'
      : location.pathname.startsWith(to);

  const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {navGroups.map(group => (
        <div key={group.label}>
          <p className="font-label-sm text-on-surface-variant uppercase tracking-widest px-2 pb-1 opacity-60 text-[10px]">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map(item => (
              <Link
                key={item.label}
                to={item.to}
                onClick={onLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 [&>.material-symbols-outlined]:text-[20px] ${
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
        </div>
      ))}
    </div>
  );

  const BottomActions = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <div className="border-t border-outline-variant p-4 flex flex-col gap-0.5">
      <a
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
        href="#"
        onClick={e => { e.preventDefault(); onLinkClick?.(); }}
      >
        <span className="material-symbols-outlined text-[20px]">help</span>
        <span className="font-label-md text-label-md">Help & Docs</span>
      </a>
      <button
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-error hover:bg-error-container/20 transition-colors w-full text-left font-label-md text-label-md"
        onClick={() => { onLinkClick?.(); logout(); }}
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        Log Out
      </button>
    </div>
  );

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
        <div className="h-14 flex items-center px-6 border-b border-outline-variant w-full shrink-0">
          <Logo height="80px" />
        </div>
        <NavLinks />
        <BottomActions />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`bg-surface-container-lowest border-r border-outline-variant fixed left-0 top-0 h-full w-72 flex flex-col z-50 lg:hidden transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-6 border-b border-outline-variant w-full shrink-0">
          <Logo height="38px" />
          <button
            className="p-1 text-on-surface hover:bg-surface-container-low rounded-full flex items-center justify-center"
            onClick={closeSidebar}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <NavLinks onLinkClick={closeSidebar} />
        <BottomActions onLinkClick={closeSidebar} />
      </aside>
    </>
  );
};
