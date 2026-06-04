import React, { useState } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';

type BursaryRequest = {
  id: number;
  studentName: string;
  class: string;
  requestedAmount: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
};

type Transaction = {
  id: number;
  studentName: string;
  class: string;
  amount: string;
  method: string;
  date: string;
};

export const DeputyHeadFinancials: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Mock bursary requests
  const [bursaries, setBursaries] = useState<BursaryRequest[]>([
    { id: 1, studentName: 'Kelvin Chirwa', class: 'Form 4B', requestedAmount: 'K150,000', reason: 'Orphaned student facing final term eviction.', status: 'pending' },
    { id: 2, studentName: 'Esther Phiri', class: 'Form 3A', requestedAmount: 'K95,000', reason: 'Father laid off from agricultural sector.', status: 'pending' },
    { id: 3, studentName: 'Limbani Mthembu', class: 'Form 2C', requestedAmount: 'K120,000', reason: 'Single parent with medical complications.', status: 'pending' },
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: 1, studentName: 'Tamara Nyirenda', class: 'Form 1A', amount: 'K180,000', method: 'National Bank Deposit', date: '2026-05-28' },
    { id: 2, studentName: 'Blessed Gondwe', class: 'Form 3A', amount: 'K90,000', method: 'Airtel Money Pay', date: '2026-05-27' },
    { id: 3, studentName: 'Fiona Phiri', class: 'Form 4B', amount: 'K220,000', method: 'FDH Mobile App', date: '2026-05-27' },
    { id: 4, studentName: 'Mwayi Mwale', class: 'Form 2C', amount: 'K120,000', method: 'Mpamba Transfer', date: '2026-05-26' },
  ]);

  const handleApproveBursary = (id: number) => {
    setBursaries(bursaries.map(b => b.id === id ? { ...b, status: 'approved' as const } : b));
  };

  const handleRejectBursary = (id: number) => {
    setBursaries(bursaries.map(b => b.id === id ? { ...b, status: 'rejected' as const } : b));
  };

  const activeBursariesCount = bursaries.filter(b => b.status === 'pending').length;

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Breadcrumbs & Header */}
        <div className="py-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Administration</span>
              <span>/</span>
              <span className="text-primary font-bold">Financials</span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">Financial Overview</h1>
            <p className="font-body-md text-on-surface-variant">Oversee school fee collection, review class payments progress, and authorize student bursary assistance.</p>
          </div>
          <div className="flex gap-2 self-start md:self-end">
            <button className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-primary text-primary font-bold rounded-lg hover:bg-surface-container-low active:scale-95 transition-all text-xs">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Export Invoices
            </button>
          </div>
        </div>

        {/* Operational metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-margin-desktop">
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Term Collection Rate</p>
              <h3 className="font-headline-md text-primary mt-1">78.4%</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Total Collected</p>
              <h3 className="font-headline-md text-secondary mt-1">K28,450K</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <span className="material-symbols-outlined">pending</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Outstanding Fees</p>
              <h3 className="font-headline-md text-amber-600 dark:text-amber-300 mt-1">K6,200K</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined">request_quote</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Pending Bursaries</p>
              <h3 className="font-headline-md text-error mt-1">{activeBursariesCount} Cases</h3>
            </div>
          </div>
        </div>

        {/* Two Columns Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Left Column: Bursary approvals & progress bars */}
          <div className="lg:col-span-8 space-y-lg">
            {/* Bursary Assistance Panel */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-title-lg font-bold text-primary">Pending Fee Assistance & Bursaries</h3>
                <span className="px-3 py-1 bg-primary-container text-primary font-bold text-xs rounded-full">{activeBursariesCount} pending</span>
              </div>
              <div className="p-lg space-y-lg">
                {bursaries.some(b => b.status === 'pending') ? (
                  bursaries.filter(b => b.status === 'pending').map((b) => (
                    <div key={b.id} className="p-md border border-outline-variant rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-surface-container-low/20">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-xs font-bold bg-primary-container text-primary rounded-full">{b.class}</span>
                          <span className="text-sm font-bold text-on-surface">{b.studentName}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed max-w-lg mb-1">{b.reason}</p>
                        <p className="text-xs font-bold text-primary">Requesting Amount: {b.requestedAmount}</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleRejectBursary(b.id)}
                          className="px-4 py-2 border border-error hover:bg-error-container/20 text-error rounded-lg active:scale-95 transition-all text-xs font-bold"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleApproveBursary(b.id)}
                          className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 text-outline">verified</span>
                    <p className="font-body-md font-bold">All fee assistance requests reviewed!</p>
                  </div>
                )}
              </div>
            </section>

            {/* Class-wise fee payment progression */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm p-lg">
              <h3 className="text-title-lg font-bold text-primary mb-md">Class-wise Payment Progress</h3>
              <div className="space-y-md">
                {[
                  { form: 'Form 4 (Senior JCE/MSCE)', progress: 88, collected: 'K8,800,000', total: 'K10,000,000', color: 'bg-primary' },
                  { form: 'Form 3 (Senior Secondary)', progress: 75, collected: 'K7,500,000', total: 'K10,000,000', color: 'bg-primary' },
                  { form: 'Form 2 (Junior Secondary)', progress: 68, collected: 'K6,120,000', total: 'K9,000,000', color: 'bg-secondary' },
                  { form: 'Form 1 (New Entrants)', progress: 82, collected: 'K6,030,000', total: 'K7,350,000', color: 'bg-primary' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-on-surface">{item.form}</span>
                      <span className="font-medium text-on-surface-variant">{item.collected} / {item.total} paid</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.progress}%` }}></div>
                      </div>
                      <span className="font-bold text-primary text-xs w-10 text-right">{item.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Recent transactions */}
          <aside className="lg:col-span-4 space-y-lg">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant">
                <h3 className="text-title-lg font-bold text-primary">Recent Payments</h3>
              </div>
              <div className="p-lg space-y-md">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-start border-b border-outline-variant last:border-0 pb-4 last:pb-0">
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">{tx.studentName}</h4>
                      <p className="text-xs text-on-surface-variant">{tx.class} • {tx.method}</p>
                      <p className="text-xs text-outline mt-1 font-medium">{tx.date}</p>
                    </div>
                    <span className="font-bold text-secondary text-sm">{tx.amount}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
      <BottomNav />
    </>
  );
};

export default DeputyHeadFinancials;
