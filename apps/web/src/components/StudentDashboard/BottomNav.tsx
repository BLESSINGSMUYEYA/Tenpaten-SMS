export const BottomNav = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface dark:bg-surface-dim px-2 pb-safe h-16 border-t border-surface-border dark:border-outline-variant">
      <a className="flex flex-col items-center justify-center bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed rounded-full px-4 py-1 active:scale-90 transition-transform duration-150" href="/student/dashboard">
        <span className="material-symbols-outlined text-xl" data-icon="dashboard">dashboard</span>
        <span className="font-label-sm-mobile mt-1">Home</span>
      </a>
      <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-transform duration-150" href="#">
        <span className="material-symbols-outlined text-xl" data-icon="assignment">assignment</span>
        <span className="font-label-sm-mobile mt-1">Tasks</span>
      </a>
      <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-transform duration-150" href="#">
        <span className="material-symbols-outlined text-xl" data-icon="grade">grade</span>
        <span className="font-label-sm-mobile mt-1">Grades</span>
      </a>
      <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-transform duration-150" href="#">
        <span className="material-symbols-outlined text-xl" data-icon="menu">menu</span>
        <span className="font-label-sm-mobile mt-1">Menu</span>
      </a>
    </nav>
  );
};
