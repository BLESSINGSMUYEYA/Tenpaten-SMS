import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const school = user?.school;

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    const baseClass =
      'flex flex-col items-center justify-center px-3 py-1 active:scale-95 transition-all duration-150 rounded-xl';
    if (isActive) {
      return `${baseClass} bg-primary-container text-on-primary-container font-bold`;
    }
    return `${baseClass} text-on-surface-variant hover:text-primary`;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface dark:bg-surface-dim px-2 pb-safe h-16 border-t border-surface-border dark:border-outline-variant shadow-lg">
      <Link className={getLinkClass('/bursar/dashboard')} to="/bursar/dashboard">
        <span className="material-symbols-outlined text-xl" data-icon="dashboard">
          dashboard
        </span>
        <span className="font-label-sm-mobile text-[10px] mt-1">Home</span>
      </Link>
      {school?.featuresFees !== false && (
        <>
          <Link className={getLinkClass('/bursar/fees')} to="/bursar/fees">
            <span className="material-symbols-outlined text-xl" data-icon="payments">
              payments
            </span>
            <span className="font-label-sm-mobile text-[10px] mt-1">Fees</span>
          </Link>
          <Link className={getLinkClass('/bursar/payments')} to="/bursar/payments">
            <span className="material-symbols-outlined text-xl" data-icon="receipt_long">
              receipt_long
            </span>
            <span className="font-label-sm-mobile text-[10px] mt-1">Payments</span>
          </Link>
          <Link className={getLinkClass('/bursar/students')} to="/bursar/students">
            <span className="material-symbols-outlined text-xl" data-icon="account_balance_wallet">
              account_balance_wallet
            </span>
            <span className="font-label-sm-mobile text-[10px] mt-1">Balances</span>
          </Link>
        </>
      )}
    </nav>
  );
};
export default BottomNav;
