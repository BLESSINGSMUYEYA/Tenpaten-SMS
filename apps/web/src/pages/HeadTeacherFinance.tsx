import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';
import { useQuery } from '../hooks/useApi';

interface Invoice {
  id: string;
  studentId: string;
  totalAmount: number;
  finalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  createdAt: string;
  student: {
    admissionNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    class: {
      displayName: string;
    };
  };
  payments: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    method: string;
    receiptNumber: string;
  }>;
}

export const HeadTeacherFinance: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Head Teacher';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic Queries
  const { data: invoices, loading } = useQuery<Invoice[]>('/finance/invoices');

  // Derive stats dynamically from invoices
  const invoiceList = invoices || [];
  const totalBilled = invoiceList.reduce((sum, inv) => sum + inv.finalAmount, 0);
  const totalCollected = invoiceList.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalPending = invoiceList.reduce((sum, inv) => sum + inv.balance, 0);
  const clearingRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) + '%' : '0.0%';

  // Aggregate Fee Clearance by Class/Form
  const feeStatusByClass: { [key: string]: { students: number; cleared: number; pending: number; overdue: number; collected: number; total: number } } = {};
  invoiceList.forEach(inv => {
    const className = inv.student.class?.displayName || 'Unknown Class';
    if (!feeStatusByClass[className]) {
      feeStatusByClass[className] = { students: 0, cleared: 0, pending: 0, overdue: 0, collected: 0, total: 0 };
    }
    const stat = feeStatusByClass[className];
    stat.students += 1;
    if (inv.status === 'paid') {
      stat.cleared += 1;
    } else {
      stat.pending += 1;
      // Overdue if unpaid for more than 14 days
      const isOverdue = inv.balance > 0 && (new Date().getTime() - new Date(inv.createdAt).getTime() > 14 * 24 * 60 * 60 * 1000);
      if (isOverdue) {
        stat.overdue += 1;
      }
    }
    stat.collected += inv.paidAmount;
    stat.total += inv.finalAmount;
  });

  const feeStatusData = Object.keys(feeStatusByClass).map(className => ({
    name: className,
    ...feeStatusByClass[className]
  }));

  // Aggregate recent transactions from all payments
  const allPayments: Array<{
    ref: string;
    name: string;
    class: string;
    date: string;
    amount: string;
    method: string;
    status: string;
    timestamp: number;
  }> = [];

  invoiceList.forEach(inv => {
    (inv.payments || []).forEach(pay => {
      allPayments.push({
        ref: pay.receiptNumber,
        name: `${inv.student.user.firstName} ${inv.student.user.lastName}`,
        class: inv.student.class?.displayName || 'N/A',
        date: new Date(pay.paymentDate).toLocaleDateString(),
        amount: `MK ${pay.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        method: pay.method === 'mobile_money' ? 'Mobile Money' : pay.method.charAt(0).toUpperCase() + pay.method.slice(1),
        status: 'Cleared',
        timestamp: new Date(pay.paymentDate).getTime(),
      });
    });
  });

  const recentTransactions = allPayments.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-4 md:px-8 min-h-screen bg-surface text-on-surface transition-colors">
        {/* Page Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Home</span>
              <span>/</span>
              <span className="text-primary font-bold">Finance</span>
            </nav>
            <h1 className="dash-page-title">Financial Overview</h1>
            <p className="font-body-md text-on-surface-variant">Monitor revenue collection, fee balances, and payment history, {fullName}.</p>
          </div>
        </div>

        {/* Finance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Billed', value: loading ? '...' : `MK ${totalBilled.toLocaleString()}`, icon: 'payments', color: 'bg-secondary-container text-secondary' },
            { label: 'Collected', value: loading ? '...' : `MK ${totalCollected.toLocaleString()}`, icon: 'check_circle', color: 'bg-primary-container text-primary' },
            { label: 'Pending', value: loading ? '...' : `MK ${totalPending.toLocaleString()}`, icon: 'hourglass_empty', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
            { label: 'Clearing Rate', value: loading ? '...' : clearingRate, icon: 'trending_up', color: 'bg-tertiary-container text-tertiary' },
          ].map(c => (
            <div key={c.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${c.color}`}>
                <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant text-xs">{c.label}</p>
                <p className="text-headline-sm font-bold text-on-background mt-0.5 text-lg">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Class Balance Summary */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm mb-6">
          <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant">
            <h3 className="font-bold text-on-background">Fee Clearance by Form</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {['Class', 'Total Students', 'Cleared', 'Pending', 'Overdue', 'Collected Amount', 'Target Revenue'].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-on-surface-variant text-sm">Loading fee structures...</td>
                  </tr>
                ) : feeStatusData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-on-surface-variant text-sm">No fee data recorded yet.</td>
                  </tr>
                ) : feeStatusData.map((f, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface text-sm">{f.name}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{f.students}</td>
                    <td className="px-6 py-4 text-secondary font-bold text-sm">{f.cleared}</td>
                    <td className="px-6 py-4 text-amber-600 dark:text-amber-400 font-bold text-sm">{f.pending}</td>
                    <td className="px-6 py-4 text-error font-bold text-sm">{f.overdue}</td>
                    <td className="px-6 py-4 text-secondary font-bold text-sm">MK {f.collected.toLocaleString()}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm font-semibold">MK {f.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant">
            <h3 className="font-bold text-on-background">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {['Ref', 'Student', 'Class', 'Date', 'Amount', 'Method', 'Status'].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-on-surface-variant text-sm">Loading transactions...</td>
                  </tr>
                ) : recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-on-surface-variant text-sm">No transactions recorded yet.</td>
                  </tr>
                ) : recentTransactions.map((t, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-outline">{t.ref}</td>
                    <td className="px-6 py-4 font-bold text-on-surface text-sm">{t.name}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{t.class}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{t.date}</td>
                    <td className="px-6 py-4 text-secondary font-bold text-sm">{t.amount}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{t.method}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-secondary-container/40 text-secondary">{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-8 pt-6 pb-2 text-center border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant opacity-60">© 2026 Tenpaten School Management System. Academic Session: 2025/2026</p>
        </footer>
      </main>
      <BottomNav />
    </>
  );
};

export default HeadTeacherFinance;
