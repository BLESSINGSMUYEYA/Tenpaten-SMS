import { useState } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Header = ({ onMenuClick, zenMode = false }: { onMenuClick?: () => void; zenMode?: boolean }) => {
  const { isDark, toggle } = useDarkMode();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className={`fixed top-0 right-0 z-40 flex items-center justify-between px-4 md:px-6 h-14 bg-surface dark:bg-surface-dim border-b border-surface-border dark:border-outline-variant transition-all duration-300 ease-in-out left-0 ${zenMode ? 'lg:left-0' : 'lg:left-72'}`}>
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined lg:hidden text-primary cursor-pointer" data-icon="menu" onClick={onMenuClick}>menu</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center bg-surface-container px-4 py-2 rounded-lg border border-surface-border">
          <span className="material-symbols-outlined text-outline" data-icon="search">search</span>
          <input className="bg-transparent border-none focus:ring-0 font-body-sm text-on-surface-variant ml-2" placeholder="Search students..." type="text" />
        </div>
        
        {/* Profile Dropdown Container */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold overflow-hidden focus:outline-none hover:ring-2 hover:ring-primary/50 transition-all flex"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <img alt="User Profile" className="w-full h-full object-cover" src="/assets/profile.jpg" />
          </button>
          
          {dropdownOpen && (
            <>
              {/* Invisible backdrop to dismiss dropdown */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl shadow-lg z-20 py-2 animate-scale-up">
                <Link 
                  to="/change-password" 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-lg" data-icon="manage_accounts">manage_accounts</span>
                  Profile
                </Link>
                <Link 
                  to="#" 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-lg" data-icon="settings">settings</span>
                  Settings
                </Link>
                <div className="h-[1px] bg-surface-border dark:bg-outline-variant my-1" />
                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-error hover:bg-error-container/10 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-lg" data-icon="logout">logout</span>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        <button id="dark-mode-toggle" onClick={toggle} className="ml-2 p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center" aria-label="Toggle dark mode">
          <span className="material-symbols-outlined" data-icon="dark_mode">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>
    </header>
  );
};
