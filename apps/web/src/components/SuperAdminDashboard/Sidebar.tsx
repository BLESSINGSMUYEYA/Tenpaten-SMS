import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const navItems = [
  { label: 'Dashboard', to: '/super-admin', icon: 'dashboard' },
  { label: 'Schools', to: '/super-admin/schools', icon: 'domain' },
  { label: 'Users', to: '/super-admin/users', icon: 'group' },
  { label: 'Settings', to: '/super-admin/settings', icon: 'settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (to: string) =>
    to === '/super-admin'
      ? location.pathname === '/super-admin'
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
      {/* Sidebar Navigation - Desktop */}
      <aside className="bg-surface-container-lowest border-r border-outline-variant fixed left-0 top-0 h-full w-72 p-4 pt-6 flex flex-col hidden lg:flex z-20 transition-all duration-300">
        <div className="px-4 mb-6 flex flex-col items-center text-center">
          <Logo height="48px" className="mb-1" />
        </div>
        <div className="flex-1 overflow-y-auto py-md flex flex-col gap-xs">
          {navItems.map(item => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-colors [&>.material-symbols-outlined]:text-[20px] ${
                isActive(item.to)
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="mt-auto border-t border-outline-variant py-md flex flex-col gap-xs">
          <a
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-md text-label-md">Support</span>
          </a>
          <button
            className="flex items-center gap-md px-md py-sm rounded-lg text-error hover:bg-error-container/20 transition-colors w-full text-left font-label-md text-label-md"
            onClick={logout}
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* Sidebar Navigation - Mobile Drawer */}
      <aside
        className={`bg-surface-container-lowest border-r border-outline-variant fixed left-0 top-0 h-full w-72 p-4 pt-6 flex flex-col z-45 lg:hidden transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 mb-6 flex items-center justify-between w-full">
          <div className="flex flex-col items-center text-center">
            <Logo height="48px" className="mb-1" />
          </div>
          <button
            className="p-sm text-on-surface hover:bg-surface-container-low rounded-full"
            onClick={closeSidebar}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-md flex flex-col gap-xs">
          {navItems.map(item => (
            <Link
              key={item.label}
              to={item.to}
              onClick={closeSidebar}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-colors [&>.material-symbols-outlined]:text-[20px] ${
                isActive(item.to)
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="mt-auto border-t border-outline-variant py-md flex flex-col gap-xs">
          <a
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              closeSidebar();
            }}
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-md text-label-md">Support</span>
          </a>
          <button
            className="flex items-center gap-md px-md py-sm rounded-lg text-error hover:bg-error-container/20 transition-colors w-full text-left font-label-md text-label-md"
            onClick={() => {
              closeSidebar();
              logout();
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};
