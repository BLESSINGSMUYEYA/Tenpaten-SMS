import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuth } from '../contexts/AuthContext';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  zenMode?: boolean;
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  head_teacher: 'Head Teacher',
  deputy_head: 'Deputy Head',
  teacher: 'Teacher',
  bursar: 'Bursar',
  student: 'Student',
  parent: 'Parent',
  it_coordinator: 'IT Coordinator',
  school_director: 'School Director',
};

export const DashboardHeader = ({ onMenuClick, zenMode = false }: DashboardHeaderProps) => {
  const { isDark, toggle } = useDarkMode();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [dropdownOpen]);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '??';

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const roleName = user ? (roleLabels[user.role] ?? user.role) : '';

  return (
    <header
      className={`fixed top-0 right-0 z-40 flex items-center justify-between px-4 md:px-6 h-14 bg-surface dark:bg-surface-dim border-b border-surface-border dark:border-outline-variant transition-all duration-300 ease-in-out left-0 ${
        zenMode ? 'lg:left-0' : 'lg:left-72'
      }`}
    >
      {/* ─── Left: Hamburger + Greeting ─── */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <span className="material-symbols-outlined text-primary" data-icon="menu">menu</span>
        </button>

        {/* Greeting — hidden on small screens */}
        <div className="hidden sm:block">
          <p className="font-label-md text-on-surface font-bold leading-tight">
            {displayName}
          </p>
          <p className="font-label-sm text-on-surface-variant leading-tight capitalize">
            {roleName}
          </p>
        </div>
      </div>

      {/* ─── Right: Actions ─── */}
      <div className="flex items-center gap-1.5 md:gap-2">

        {/* Dark mode toggle */}
        <button
          id="dark-mode-toggle"
          onClick={toggle}
          className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center"
          aria-label="Toggle dark mode"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]" data-icon="dark_mode">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* ─── Profile avatar + dropdown ─── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(prev => !prev)}
            className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold overflow-hidden focus:outline-none hover:ring-2 hover:ring-primary/40 transition-all"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            aria-label="Profile menu"
          >
            {user?.photoUrl ? (
              <img
                alt={displayName}
                className="w-full h-full object-cover"
                src={user.photoUrl}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-xs font-bold">{initials}</span>
            )}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest dark:bg-inverse-surface border border-surface-border dark:border-outline-variant rounded-xl shadow-xl z-50 py-1 animate-slide-in-bottom origin-top-right">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-surface-border dark:border-outline-variant">
                <p className="font-label-md text-on-surface font-bold truncate">{displayName}</p>
                <p className="font-label-sm text-on-surface-variant truncate">{user?.email}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-container text-on-primary-container uppercase tracking-wider">
                  {roleName}
                </span>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  to="/change-password"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 font-label-md text-on-surface hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant" data-icon="lock">lock</span>
                  Change Password
                </Link>
              </div>

              <div className="border-t border-surface-border dark:border-outline-variant my-1" />

              {/* Logout */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 font-label-md font-bold text-error hover:bg-error-container/10 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px]" data-icon="logout">logout</span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
