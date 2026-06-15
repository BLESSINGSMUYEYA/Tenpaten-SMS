import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

export const Sidebar = ({ isOpen, closeSidebar }: { isOpen: boolean; closeSidebar: () => void }) => {
  const { logout } = useAuth();
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      <aside
        className={`flex flex-col fixed left-0 top-0 h-full z-50 p-4 bg-surface-container-lowest dark:bg-inverse-surface border-r border-surface-border dark:border-outline-variant shadow-sm w-72 pt-6 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
      <div className="px-4 mb-6 flex flex-col items-center text-center">
        <Logo height="36px" className="mb-1" />
      </div>
      <nav className="flex-1 space-y-2">
        <Link to="/parent/dashboard" className="flex items-center gap-4 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-bold font-label-md text-label-md">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          Dashboard
        </Link>
        <Link to="#" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-lg font-medium font-label-md text-label-md transition-colors">
          <span className="material-symbols-outlined" data-icon="child_care">child_care</span>
          My Children
        </Link>

        <Link to="#" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-lg font-medium font-label-md text-label-md transition-colors">
          <span className="material-symbols-outlined" data-icon="analytics">analytics</span>
          Academic Reports
        </Link>

      </nav>
      <div className="mt-auto border-t border-surface-border dark:border-outline-variant pt-4 flex flex-col gap-2">
        <button onClick={() => { closeSidebar(); logout(); }} className="flex items-center gap-4 px-4 py-3 text-on-error-container bg-error-container hover:bg-error/20 rounded-lg font-bold font-label-md text-label-md transition-colors w-full text-left">
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          Logout
        </button>
      </div>
      </aside>
    </>
  );
};
