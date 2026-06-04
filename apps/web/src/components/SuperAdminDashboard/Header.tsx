import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="bg-surface border-b border-outline-variant h-16 w-full flex justify-between items-center px-margin-mobile md:px-margin-desktop sticky top-0 z-10">
      <div className="flex items-center gap-md">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-on-surface p-sm hover:bg-surface-container-low rounded-full flex items-center justify-center"
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="lg:hidden font-headline-sm text-headline-sm font-bold text-primary">EduCore</h2>
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="pl-10 pr-4 py-2 border border-outline-variant rounded-full bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm w-64 md:w-96 transition-all"
            placeholder="Search EduCore System..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-lg">
        <div className="hidden lg:flex items-center gap-sm bg-secondary-container px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span className="font-label-sm text-label-sm text-on-secondary-container">Maintenance Status</span>
        </div>
        <div className="flex items-center gap-md text-on-surface-variant">
          <button className="hover:text-primary transition-colors p-xs flex items-center justify-center">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {/* Dark mode toggle */}
          <button
            id="dark-mode-toggle"
            onClick={toggle}
            className="p-xs rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center"
            aria-label="Toggle dark mode"
          >
            <span className="material-symbols-outlined">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button className="hover:text-primary transition-colors p-xs flex items-center justify-center">
            <span className="material-symbols-outlined">settings_suggest</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container ml-sm cursor-pointer border border-primary-fixed relative group">
            <span className="material-symbols-outlined text-sm">person</span>
            <div className="absolute right-0 top-10 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow">
              {user?.email || 'super_admin@tenpaten.com'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

