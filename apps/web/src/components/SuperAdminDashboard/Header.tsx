import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Logo } from '../Logo';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="fixed top-0 right-0 z-40 flex items-center justify-between px-margin-mobile md:px-margin-desktop h-14 bg-surface dark:bg-surface-dim border-b border-surface-border dark:border-outline-variant transition-all duration-300 ease-in-out left-0 lg:left-72">
      <div className="flex items-center gap-md">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-on-surface p-sm hover:bg-surface-container-low rounded-full flex items-center justify-center"
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        {/* Mobile Logo Branding */}
        <div className="lg:hidden flex items-center">
          <Logo height="28px" />
        </div>
        {/* Search Bar */}
        <div className="hidden sm:flex items-center bg-surface-container px-3 py-1.5 rounded-lg border border-surface-border">
          <span className="material-symbols-outlined text-outline">search</span>
          <input
            className="bg-transparent border-none focus:outline-none focus:ring-0 font-body-sm text-on-surface-variant ml-2 w-64 md:w-96 transition-all"
            placeholder="Search Tenpaten System..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-md text-on-surface-variant">
        <button className="hover:text-primary transition-colors p-xs flex items-center justify-center" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="hover:text-primary transition-colors p-xs flex items-center justify-center" aria-label="Settings">
          <span className="material-symbols-outlined">settings_suggest</span>
        </button>
        {/* Dark mode toggle */}
        <button
          id="dark-mode-toggle"
          onClick={toggle}
          className="ml-2 p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center"
          aria-label="Toggle dark mode"
        >
          <span className="material-symbols-outlined">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        {/* Profile Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container ml-sm cursor-pointer border border-primary-fixed relative group overflow-hidden">
          <img alt="User Profile" className="w-full h-full object-cover" src="/assets/profile.jpg" onError={(e) => {
            e.currentTarget.style.display = 'none';
            const icon = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
            if (icon) icon.style.display = 'inline-block';
          }} />
          <span className="material-symbols-outlined fallback-icon hidden text-sm">person</span>
          <div className="absolute right-0 top-12 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow z-50">
            {user?.email || 'super_admin@tenpaten.com'}
          </div>
        </div>
      </div>
    </header>
  );
};

