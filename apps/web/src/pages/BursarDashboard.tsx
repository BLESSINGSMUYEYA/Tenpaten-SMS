import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/BursarDashboard/Header';
import { Sidebar } from '../components/BursarDashboard/Sidebar';
import { BottomNav } from '../components/BursarDashboard/BottomNav';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useApi';
import type { BursarStats, FeePayment } from '@myklasi/shared';

export const BursarDashboard: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Bursar';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Queries
  const { data: stats, loading: loadingStats } = useQuery<BursarStats>('/finance/stats');
  const { data: payments, loading: loadingPayments } = useQuery<FeePayment[]>('/finance/payments');

  // Derived stats
  const totalInvoiced = stats?.totalInvoiced ?? 0;
  const totalCollected = stats?.totalCollected ?? 0;
  const totalOutstanding = stats?.totalOutstanding ?? 0;
  const collectionRate = stats?.collectionRate ?? 0;

  const formattedInvoiced = `MK ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedCollected = `MK ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedOutstanding = `MK ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedRate = `${collectionRate.toFixed(1)}%`;

  // Calculate payment methods percentages for a custom visual widget
  const recentPayments = payments ?? [];
  const methodCounts = recentPayments.reduce((acc: Record<string, number>, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
    return acc;
  }, {});

  const totalPaymentsSum = Object.values(methodCounts).reduce((sum, val) => sum + val, 0);

  const getMethodPercentage = (method: string) => {
    if (totalPaymentsSum === 0) return 0;
    return ((methodCounts[method] || 0) / totalPaymentsSum) * 100;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'bank': return 'bg-primary';
      case 'mobile_money': return 'bg-secondary';
      case 'cash': return 'bg-tertiary';
      default: return 'bg-outline';
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'bank': return 'Bank Deposit';
      case 'mobile_money': return 'Mobile Money';
      case 'cash': return 'Cash';
      case 'cheque': return 'Cheque';
      default: return method;
    }
  };

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-md md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        <div className="py-lg flex flex-col gap-lg">
          <div>
            <h1 className="dash-page-title">Financial Overview</h1>
            <p className="font-body-md text-on-surface-variant mt-1">Welcome back, {fullName}. Review billing status and recent payments.</p>
          </div>

          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {[
              { label: 'Total Invoiced', value: loadingStats ? '...' : formattedInvoiced, icon: 'receipt', badge: 'Term 2 billings', badgeColor: 'text-on-surface-variant', to: '/bursar/students' },
              { label: 'Total Collected', value: loadingStats ? '...' : formattedCollected, icon: 'payments', badge: 'Payments received', badgeColor: 'text-primary font-bold', to: '/bursar/payments' },
              { label: 'Outstanding Balance', value: loadingStats ? '...' : formattedOutstanding, icon: 'account_balance_wallet', badge: 'Awaiting collection', badgeColor: 'text-error font-bold', to: '/bursar/students' },
              { label: 'Collection Rate', value: loadingStats ? '...' : formattedRate, icon: 'trending_up', badge: 'Collection target 95%', badgeColor: 'text-on-surface-variant', to: '/bursar/fees' },
            ].map(card => (
              <Link key={card.label} to={card.to} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-md hover:border-primary transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{card.label}</span>
                  <div className="p-2 bg-surface-container-low rounded-lg text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-background">{card.value}</span>
                  <span className={`font-label-sm text-label-sm ${card.badgeColor} flex items-center`}>{card.badge}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Charts & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Payment Method Distribution */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col shadow-sm">
              <div className="mb-lg">
                <h3 className="font-title-lg text-title-lg font-semibold text-on-background">Payment Methods</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Revenue breakdown by collection channel</p>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-md">
                {totalPaymentsSum === 0 ? (
                  <p className="text-center font-body-md text-on-surface-variant">No transaction data recorded yet.</p>
                ) : (
                  ['bank', 'mobile_money', 'cash'].map((method) => {
                    const pct = getMethodPercentage(method);
                    const label = getMethodLabel(method);
                    const val = methodCounts[method] || 0;
                    return (
                      <div key={method} className="flex flex-col gap-xs">
                        <div className="flex justify-between items-center text-label-md font-semibold">
                          <span className="text-on-surface">{label}</span>
                          <span className="text-on-surface-variant">MK {val.toLocaleString()} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full ${getMethodColor(method)}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col shadow-sm">
              <div className="mb-lg">
                <h3 className="font-title-lg text-title-lg font-semibold text-on-background">Financial Tasks</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Quick administrative actions</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md h-full">
                {[
                  { icon: 'add_card', label: 'Record Fee Payment', desc: 'Log a new cash, bank, or mobile money deposit.', to: '/bursar/payments' },
                  { icon: 'settings_suggest', label: 'Configure Fees', desc: 'Define Term fee structures per Class stream.', to: '/bursar/fees' },
                  { icon: 'sms', label: 'Send Reminders', desc: 'Trigger parent billing notifications via SMS.', to: '/bursar/students' },
                ].map(action => (
                  <Link key={action.label} to={action.to} className="flex flex-col gap-sm p-md bg-surface-container border border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container-low transition-all group">
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface group-hover:text-primary transition-colors">{action.label}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">{action.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Payments Log */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex justify-between items-center mb-lg">
              <div>
                <h3 className="font-title-lg text-title-lg font-semibold text-on-background">Recent Transactions</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Latest fee collection logs</p>
              </div>
              <Link to="/bursar/payments" className="font-label-sm text-label-sm text-primary hover:underline font-semibold">View Ledger</Link>
            </div>

            {loadingPayments ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentPayments.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant font-body-md">
                No payment transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant text-label-sm font-bold text-on-surface-variant">
                      <th className="py-sm">Receipt</th>
                      <th className="py-sm">Student</th>
                      <th className="py-sm">Class</th>
                      <th className="py-sm">Method</th>
                      <th className="py-sm">Ref Number</th>
                      <th className="py-sm text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.slice(0, 5).map((pay) => (
                      <tr key={pay.id} className="border-b border-outline-variant/50 text-body-md text-on-surface hover:bg-surface-container-low transition-colors">
                        <td className="py-md font-mono text-sm">{pay.receiptNumber}</td>
                        <td className="py-md font-medium">
                          {pay.invoice?.student?.user.firstName} {pay.invoice?.student?.user.lastName}
                        </td>
                        <td className="py-md">{pay.invoice?.student?.class?.displayName}</td>
                        <td className="py-md capitalize">{getMethodLabel(pay.paymentMethod)}</td>
                        <td className="py-md font-mono text-sm text-on-surface-variant">{pay.referenceNumber || 'N/A'}</td>
                        <td className="py-md text-right font-bold text-primary">
                          MK {pay.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-margin-desktop pt-lg pb-xs text-center border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant opacity-60">
            © {new Date().getFullYear()} MyKlasi School Management System. All Rights Reserved.
          </p>
        </footer>
      </main>

      <BottomNav />
    </>
  );
};
export default BursarDashboard;
