import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { useQuery } from '../hooks/useApi';

interface Invoice {
  id: string;
  totalAmount: number;
  finalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  payments: Array<{
    amount: number;
    paymentDate: string;
  }>;
}

interface Grade {
  id: string;
  subject: {
    name: string;
    code: string;
  };
  totalMark: number;
  gradeLetter: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: string;
  createdAt: string;
}

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const firstName = user?.firstName ?? 'Student';

  // Queries
  const { data: invoices } = useQuery<Invoice[]>('/finance/invoices');
  const { data: grades, loading: loadingGrades } = useQuery<Grade[]>('/grades');
  const { data: announcements, loading: loadingAnnouncements } = useQuery<Announcement[]>('/announcements');

  // Derive fee balance details
  const myInvoice = invoices?.[0]; // Current term invoice
  const outstandingBalance = myInvoice ? myInvoice.balance : 0;
  const lastPaymentAmount = myInvoice?.payments?.[0]?.amount ?? 0;

  // Calculate terminal average from grades
  const validMarks = (grades || []).filter(g => g.totalMark !== null).map(g => g.totalMark);
  const terminalAverage = validMarks.length > 0 
    ? (validMarks.reduce((a, b) => a + b, 0) / validMarks.length).toFixed(1) 
    : '0';

  return (
    <div className="bg-background text-on-surface min-h-screen flex">
      {/* SideNavBar - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen flex flex-col p-md w-[280px] z-20 overflow-y-auto bg-surface-container-low border-r border-outline-variant text-xs">
        <div className="mb-xl flex flex-col gap-xs">
          <Logo height="52px" />
        </div>
        <nav className="flex-1 flex flex-col gap-xs font-bold text-on-surface-variant">
          <a className="flex items-center gap-md p-md bg-primary-container text-on-primary-container rounded-lg transition-all" href="#" onClick={e => e.preventDefault()}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md">Dashboard</span>
          </a>
        </nav>
        <div className="mt-auto pt-md border-t border-outline-variant flex flex-col gap-xs">
          <button className="flex items-center gap-md p-md text-error hover:bg-surface-variant transition-all rounded-lg w-full text-left" onClick={logout}>
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="lg:ml-[280px] ml-0 pt-16 p-margin-mobile md:p-margin-desktop min-h-screen flex-1 w-full min-w-0">
        <header className="fixed top-0 right-0 lg:left-[280px] left-0 h-16 z-30 bg-surface border-b border-outline-variant flex justify-between items-center px-margin-mobile md:px-margin-desktop">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Student Portal</h2>
          </div>
          <div className="flex items-center gap-sm">
            <div className="text-right hidden xl:block">
              <p className="font-label-md text-on-surface">{firstName} {user?.lastName}</p>
              <p className="text-on-surface-variant font-mono text-[10px]">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
              <span className="material-symbols-outlined text-sm">person</span>
            </div>
          </div>
        </header>

        <div className="py-lg flex flex-col gap-lg mt-md">
          {/* Welcome Banner */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-md cards-stagger">
            <div className="md:col-span-2 relative overflow-hidden bg-primary rounded-xl p-lg flex items-center justify-between text-on-primary">
              <div className="relative z-10">
                <span className="bg-secondary px-3 py-1 rounded-full font-label-sm text-label-sm text-on-secondary mb-sm inline-block font-medium">Student Center</span>
                <h1 className="font-headline-sm text-headline-sm font-bold mb-xs">Welcome back, {firstName}!</h1>
                <p className="font-body-sm text-body-sm opacity-90 max-w-sm">Review your term updates, notices, and academic performance below.</p>
              </div>
              <div className="hidden lg:block">
                <span className="material-symbols-outlined text-[100px] opacity-10">workspace_premium</span>
              </div>
            </div>
            {/* Attendance Circular Card fallback */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-secondary/10 text-secondary border border-secondary/20 rounded-full flex items-center justify-center font-title-lg text-title-lg font-bold mb-2">
                98%
              </div>
              <p className="font-label-md text-label-md font-medium text-on-surface uppercase tracking-wider">Attendance Summary</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Excellent daily attendance</p>
            </div>
          </section>

          {/* Dynamic Rows */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            {/* Left Column - Bulletins & Grades */}
            <div className="lg:col-span-8 flex flex-col gap-lg">
              {/* Report Card summary */}
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
                <h3 className="font-title-sm text-title-sm font-semibold text-primary mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined">school</span> Term 2 Gradebook Results
                </h3>
                {loadingGrades ? (
                  <p className="text-on-surface-variant">Loading report card...</p>
                ) : grades && grades.length > 0 ? (
                  <div className="divide-y divide-outline-variant/60">
                    {grades.map(g => (
                      <div key={g.id} className="py-2.5 flex justify-between items-center">
                        <span className="font-bold text-on-surface">{g.subject.name}</span>
                        <div className="flex gap-md items-center">
                          <span className="font-bold text-primary">{g.totalMark}%</span>
                          <span className="w-8 h-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                            {g.gradeLetter}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-on-surface-variant py-4">No published academic grades available for this term yet.</p>
                )}
              </section>

              {/* Updates Bulletins */}
              <section>
                <h3 className="font-title-sm text-title-sm font-semibold text-primary mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined">campaign</span> Institutional Bulletins
                </h3>
                <div className="flex flex-col gap-sm">
                  {loadingAnnouncements ? (
                    <p className="text-on-surface-variant">Loading updates...</p>
                  ) : announcements && announcements.length > 0 ? (
                    announcements.map(ann => (
                      <div key={ann.id} className={`p-md border rounded-lg bg-surface-container-lowest ${ann.priority === 'urgent' ? 'border-l-4 border-l-error border-outline-variant' : 'border-outline-variant'}`}>
                        <h4 className="font-title-sm text-title-sm font-semibold text-on-surface mb-1">{ann.title}</h4>
                        <p className="text-on-surface-variant mb-2">{ann.body}</p>
                        <span className="font-label-sm text-label-sm uppercase font-medium text-outline">
                          Posted {new Date(ann.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-on-surface-variant py-4 bg-surface-container-lowest border border-outline-variant p-4 rounded text-center">No announcements posted today.</p>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column - Billing & Progress */}
            <div className="lg:col-span-4 flex flex-col gap-lg">
              {/* Billing ledger balance card */}
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="bg-secondary-container p-md border-b border-outline-variant text-on-secondary-container font-bold flex justify-between items-center">
                  <span>Invoicing Ledger</span>
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div className="p-lg text-center">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Fees Balance Outstanding</p>
                  <h3 className={`text-xl font-bold mt-2 ${outstandingBalance > 0 ? 'text-error' : 'text-secondary'}`}>
                    MK {outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                  {outstandingBalance <= 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mt-3 inline-block">Cleared Account</span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider mt-3 inline-block">Balance Pending</span>
                  )}
                  {lastPaymentAmount > 0 && (
                    <div className="mt-4 pt-3 border-t border-outline-variant text-left">
                      <p className="text-[10px] text-outline font-bold">Last Receipt Amount</p>
                      <p className="font-bold text-on-surface">MK {lastPaymentAmount.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Progress Summary Card */}
              <div className="bg-primary-container p-lg rounded-xl text-on-primary-container">
                <p className="font-bold uppercase tracking-widest text-[9px] mb-2 opacity-80">Progress Summary</p>
                <div className="flex justify-between items-center">
                  <span>Term Average</span>
                  <span className="font-bold text-secondary-fixed">{terminalAverage}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-secondary-fixed" style={{ width: `${terminalAverage}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
