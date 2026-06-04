import { useDarkMode } from '../../hooks/useDarkMode';

export const Header = ({ onMenuClick, zenMode = false }: { onMenuClick?: () => void; zenMode?: boolean }) => {
  const { isDark, toggle } = useDarkMode();

  return (
    <header className={`fixed top-0 right-0 z-40 flex items-center justify-between px-4 md:px-6 h-14 bg-surface dark:bg-surface-dim border-b border-surface-border dark:border-outline-variant transition-all duration-300 ease-in-out left-0 ${zenMode ? 'lg:left-0' : 'lg:left-72'}`}>
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined lg:hidden text-primary cursor-pointer" data-icon="menu" onClick={onMenuClick}>menu</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center bg-surface-container px-4 py-2 rounded-lg border border-surface-border">
          <span className="material-symbols-outlined text-outline" data-icon="search">search</span>
          <input className="bg-transparent border-none focus:ring-0 font-body-sm text-on-surface-variant ml-2" placeholder="Search records..." type="text" />
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold overflow-hidden">
          <img alt="User Profile" className="w-full h-full object-cover" src="/assets/profile.jpg" />
        </div>
        <button id="dark-mode-toggle" onClick={toggle} className="ml-4 p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors" aria-label="Toggle dark mode">
          <span className="material-symbols-outlined" data-icon="dark_mode">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>
    </header>
  );
};
