import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const school = user?.school;

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-label-md text-label-md [&>.material-symbols-outlined]:text-[20px] ${isActive
        ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
        : 'text-on-surface-variant hover:bg-surface-container'
      }`;
  };

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
        className={`flex flex-col fixed left-0 top-0 h-full z-50 bg-surface-container-lowest dark:bg-inverse-surface border-r border-surface-border dark:border-outline-variant shadow-sm w-72 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        <div className="h-14 flex items-center px-6 border-b border-outline-variant w-full shrink-0">
          <Logo height="80px" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <Link to="/bursar/dashboard" className={getLinkClass('/bursar/dashboard')} onClick={closeSidebar}>
            <span className="material-symbols-outlined" data-icon="dashboard">
              dashboard
            </span>
            Dashboard
          </Link>
          {school?.featuresFees !== false && (
            <>
              <Link to="/bursar/fees" className={getLinkClass('/bursar/fees')} onClick={closeSidebar}>
                <span className="material-symbols-outlined" data-icon="payments">
                  payments
                </span>
                Fee Structure
              </Link>
              <Link to="/bursar/payments" className={getLinkClass('/bursar/payments')} onClick={closeSidebar}>
                <span className="material-symbols-outlined" data-icon="receipt_long">
                  receipt_long
                </span>
                Payments
              </Link>
              <Link to="/bursar/students" className={getLinkClass('/bursar/students')} onClick={closeSidebar}>
                <span className="material-symbols-outlined" data-icon="account_balance_wallet">
                  account_balance_wallet
                </span>
                Student Balances
              </Link>
            </>
          )}
        </nav>
        <div className="mt-auto border-t border-surface-border dark:border-outline-variant pt-3 flex flex-col gap-1">
          <Link
            to="/bursar/settings"
            className={getLinkClass('/bursar/settings')}
            onClick={closeSidebar}
          >
            <span className="material-symbols-outlined" data-icon="settings">
              settings
            </span>
            Settings
          </Link>
          <button
            onClick={() => {
              closeSidebar();
              logout();
            }}
            className="flex items-center gap-3 px-3 py-2 text-on-error-container bg-error-container hover:bg-error/20 rounded-lg font-bold transition-colors w-full text-left font-label-md text-label-md [&>.material-symbols-outlined]:text-[20px]"
          >
            <span className="material-symbols-outlined" data-icon="logout">
              logout
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
