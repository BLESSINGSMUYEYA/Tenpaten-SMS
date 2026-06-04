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
  createdAt: string;
  student: {
    user: {
      firstName: string;
      lastName: string;
    };
    class: {
      displayName: string;
    };
  };
  payments: Array<{
    amount: number;
    paymentDate: string;
    referenceNumber: string;
    receiptNumber: string;
  }>;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: string;
  createdAt: string;
}

interface Grade {
  id: string;
  studentId: string;
  totalMark: number;
  gradeLetter: string;
  subject: {
    name: string;
  };
  student: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export const ParentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const firstName = user?.firstName ?? 'Parent';

  // Queries
  const { data: invoices, loading: loadingInvoices } = useQuery<Invoice[]>('/finance/invoices');
  const { data: announcements, loading: loadingAnnouncements } = useQuery<Announcement[]>('/announcements');
  const { data: grades } = useQuery<Grade[]>('/grades');

  // Calculate total fees balance outstanding for children
  const totalOutstanding = (invoices || []).reduce((sum, inv) => sum + inv.balance, 0);

  // Get unique list of children names
  const childrenNames = Array.from(new Set((invoices || []).map(inv => `${inv.student.user.firstName}`)));

  return (
    <div className="bg-background text-on-background font-body-md flex h-screen overflow-hidden text-xs">
      {/* SideNavBar - Desktop */}
      <aside className="hidden lg:flex flex-col h-screen p-md space-y-base overflow-y-auto fixed left-0 top-0 w-[280px] bg-surface-container-low border-r border-outline-variant z-20">
        <div className="mb-lg px-md">
          <div className="flex flex-col mb-base gap-xs">
            <Logo height="52px" />
          </div>
        </div>
        <nav className="flex-1 space-y-xs font-bold text-on-surface-variant">
          <a className="flex items-center space-x-md bg-secondary-container text-on-secondary-container rounded-full px-md py-sm" href="#" onClick={e => e.preventDefault()}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md">Dashboard</span>
          </a>
        </nav>
        <div className="pt-lg border-t border-outline-variant space-y-xs">
          <button className="flex items-center space-x-md text-error hover:bg-surface-container-high rounded-full transition-all w-full text-left" onClick={logout}>
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[280px] ml-0 flex flex-col h-screen overflow-hidden w-full min-w-0">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-lg h-16 w-full sticky top-0 z-30 bg-surface border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-primary font-bold text-base">Parent Portal</h2>
          <div className="flex items-center space-x-md">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
              <span className="material-symbols-outlined text-sm">person</span>
            </div>
            <span className="font-label-md hidden lg:block">{firstName} {user?.lastName}</span>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-lg">
          {/* Greeting + Fee Balance */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-lg mb-lg">
            <div className="md:col-span-8 bg-surface-container-lowest p-lg rounded-xl border border-outline-variant relative overflow-hidden flex flex-col justify-center">
              <p className="font-label-sm text-primary uppercase tracking-wider mb-xs font-bold">Welcome, {firstName}</p>
              <h1 className="text-xl font-bold text-on-surface mb-md">Parent Dashboard</h1>
              <div className="flex space-x-sm">
                {childrenNames.length > 0 ? childrenNames.map(name => (
                  <span key={name} className="px-4 py-2 bg-primary text-on-primary text-[10px] rounded-full font-bold uppercase tracking-wider">
                    {name}
                  </span>
                )) : (
                  <span className="text-outline">No active scholars mapped</span>
                )}
              </div>
            </div>
            <div className="md:col-span-4 bg-primary text-white p-lg rounded-xl border border-primary shadow-lg flex flex-col justify-between">
              <div>
                <p className="font-label-sm text-primary-fixed">Children Outstanding Balance</p>
                <h3 className="text-xl font-bold mt-2">MK {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                <p className="text-[10px] text-primary-fixed opacity-90 italic mt-1">Please settle term invoices</p>
              </div>
            </div>
          </section>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Left - Grades & Bulletins */}
            <div className="lg:col-span-2 space-y-lg">
              {/* Children Academic standing */}
              <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant">
                <h4 className="font-bold text-primary mb-4 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">school</span> Recent Terminal Grades
                </h4>
                {grades && grades.length > 0 ? (
                  <div className="divide-y divide-outline-variant/60">
                    {grades.map(g => (
                      <div key={g.id} className="py-2.5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-on-surface">{g.student.user.firstName} {g.student.user.lastName}</p>
                          <p className="text-[10px] text-on-surface-variant">{g.subject.name}</p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <span className="font-bold text-primary">{g.totalMark}%</span>
                          <span className="w-8 h-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                            {g.gradeLetter}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-on-surface-variant py-4">No published children grades available yet.</p>
                )}
              </section>

              {/* Bulletins */}
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant">
                <h4 className="font-bold text-primary mb-4 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">campaign</span> General Bulletins
                </h4>
                <div className="space-y-md">
                  {loadingAnnouncements ? (
                    <p className="text-on-surface-variant">Loading notices...</p>
                  ) : announcements && announcements.length > 0 ? (
                    announcements.map(ann => (
                      <div key={ann.id} className={`p-md border rounded-lg bg-surface ${ann.priority === 'urgent' ? 'border-l-4 border-l-error border-outline-variant' : 'border-outline-variant'}`}>
                        <h5 className="font-bold text-on-surface mb-1">{ann.title}</h5>
                        <p className="text-on-surface-variant mb-2">{ann.body}</p>
                        <span className="text-[9px] uppercase font-bold text-outline">
                          Posted {new Date(ann.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-on-surface-variant py-4 text-center">No active announcements today.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Financial transactions */}
            <div className="space-y-lg">
              <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant">
                <h4 className="font-bold text-primary mb-4 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">receipt_long</span> Payment Ledger
                </h4>
                <div className="space-y-3">
                  {loadingInvoices ? (
                    <p className="text-on-surface-variant">Loading ledgers...</p>
                  ) : invoices && invoices.length > 0 ? (
                    invoices.map(inv => (
                      <div key={inv.id} className="p-3 border border-outline-variant rounded-lg bg-surface">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-on-surface">{inv.student.user.firstName}</p>
                            <p className="text-[10px] text-on-surface-variant">{inv.student.class.displayName}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs pt-2 border-t border-outline-variant/60">
                          <span>Balance:</span>
                          <span className={`font-bold ${inv.balance > 0 ? 'text-error' : 'text-secondary'}`}>
                            MK {inv.balance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-on-surface-variant py-4 text-center">No bills generated.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
