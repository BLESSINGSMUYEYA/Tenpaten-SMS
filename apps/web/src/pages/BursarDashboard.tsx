import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { useQuery, useMutation } from '../hooks/useApi';

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

export const BursarDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const firstName = user?.firstName ?? 'Bursar';

  // Queries
  const { data: invoices, loading: loadingInvoices, refetch: refetchInvoices } = useQuery<Invoice[]>('/finance/invoices');
  const { mutate: recordPayment, loading: recording } = useMutation('/finance/payments', 'post');

  // Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'mobile_money' | 'bank' | 'cheque'>('cash');
  const [payRef, setPayRef] = useState('');
  const [payError, setPayError] = useState<string | null>(null);

  // Derive stats dynamically from invoices
  const totalInvoices = invoices || [];
  const totalCollected = totalInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = totalInvoices.reduce((sum, inv) => sum + inv.balance, 0);
  
  const totalBilled = totalCollected + totalOutstanding;
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '0';
  const pendingCount = totalInvoices.filter(inv => inv.status !== 'paid').length;

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError(null);
    if (!selectedInvoiceId || !payAmount) return;

    const targetInvoice = totalInvoices.find(inv => inv.id === selectedInvoiceId);
    if (!targetInvoice) return;

    const parsedAmount = parseFloat(payAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setPayError('Please enter a valid positive payment amount');
      return;
    }

    try {
      await recordPayment({
        studentId: targetInvoice.studentId,
        invoiceId: selectedInvoiceId,
        amount: parsedAmount,
        paymentDate: new Date().toISOString(),
        method: payMethod,
        referenceNumber: payRef || undefined,
      });

      // Clear & close
      setSelectedInvoiceId('');
      setPayAmount('');
      setPayMethod('cash');
      setPayRef('');
      setPaymentModalOpen(false);
      refetchInvoices();
    } catch (err: any) {
      setPayError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col p-md space-y-base w-[280px] h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant z-20">
        <div className="flex flex-col px-sm py-md gap-xs">
          <Logo height="52px" />
        </div>
        <nav className="flex-1 space-y-xs pt-lg font-body-sm text-body-sm">
          {[
            { icon: 'payments', label: 'Financials Ledger', active: true },
          ].map(item => (
            <a key={item.label}
              className={`flex items-center gap-md px-md py-sm transition-all rounded-lg cursor-pointer ${item.active ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              href="#" onClick={e => e.preventDefault()}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="border-t border-outline-variant pt-md space-y-xs">
          <button className="flex items-center gap-md px-md py-sm text-error hover:bg-error-container rounded-lg transition-all w-full text-left font-label-md text-label-md" onClick={logout}>
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-[280px] w-full min-w-0">
        {/* Header */}
        <header className="w-full h-16 flex justify-between items-center px-margin-mobile md:px-margin-desktop sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant">
          <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Financials Dashboard</h2>
          <div className="flex items-center gap-sm cursor-pointer p-1 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
              <span className="material-symbols-outlined text-sm">person</span>
            </div>
            <div className="hidden sm:block text-xs">
              <p className="font-label-md leading-none">{firstName}</p>
              <p className="text-[10px] text-on-surface-variant">Bursar</p>
            </div>
          </div>
        </header>

        <div className="p-margin-mobile md:p-margin-desktop space-y-lg flex-1 overflow-y-auto">
          {/* Quick Actions */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-center bg-primary-container p-lg rounded-xl text-on-primary-container shadow-sm">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-primary">Good Morning, {firstName}</h3>
              <p className="font-body-sm text-body-sm opacity-90">Review outstanding fee ledgers and post incoming payments.</p>
            </div>
            <div className="flex gap-md mt-md md:mt-0">
              <button 
                onClick={() => {
                  if (totalInvoices.length > 0 && !selectedInvoiceId) {
                    setSelectedInvoiceId(totalInvoices[0].id);
                  }
                  setPaymentModalOpen(true);
                }}
                className="flex items-center gap-sm px-lg py-3 bg-secondary text-white rounded-lg font-label-md text-label-md font-medium transition-all hover:bg-on-secondary-container active:scale-95"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Record Fee Payment
              </button>
            </div>
          </section>

          {/* Bento Stats */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg cards-stagger">
            <div className="bg-surface-container-lowest p-lg border border-outline-variant rounded-xl">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium">Total Revenue Collected</p>
              <h4 className="font-headline-sm text-headline-sm font-bold mt-xs text-secondary">
                MK {totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">Total collections to date</p>
            </div>
            <div className="bg-surface-container-lowest p-lg border border-outline-variant rounded-xl">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium">Outstanding Balance</p>
              <h4 className="font-headline-sm text-headline-sm font-bold mt-xs text-error">
                MK {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">Pending student balances</p>
            </div>
            <div className="bg-surface-container-lowest p-lg border border-outline-variant rounded-xl">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium">Collection Rate</p>
              <h4 className="font-headline-sm text-headline-sm font-bold mt-xs">{collectionRate}%</h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">Ratio of receipts to bills</p>
            </div>
            <div className="bg-surface-container-lowest p-lg border border-outline-variant rounded-xl">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium">Unpaid/Partial Invoices</p>
              <h4 className="font-headline-sm text-headline-sm font-bold mt-xs">{pendingCount}</h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">Accounts needing clearance</p>
            </div>
          </section>

          {/* Student Billing Register Table */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-lg border-b border-outline-variant">
              <h3 className="font-title-lg text-title-lg font-semibold">Invoicing Ledger Directory</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time student billing registers and payment details</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low font-bold">
                  <tr>
                    {['Student Name', 'Class', 'Total Bill', 'Paid Amount', 'Balance', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-lg py-md font-label-md text-on-surface-variant border-b border-outline-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loadingInvoices ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-on-surface-variant text-sm">Loading ledger...</td>
                    </tr>
                  ) : totalInvoices.length > 0 ? (
                    totalInvoices.map(row => (
                      <tr key={row.id} className="hover:bg-surface-container transition-colors">
                        <td className="px-lg py-md">
                          <div className="flex items-center gap-md">
                            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md font-bold">
                              {getInitials(row.student.user.firstName, row.student.user.lastName)}
                            </div>
                            <div>
                              <p className="font-title-sm text-title-sm font-semibold text-primary">{row.student.user.firstName} {row.student.user.lastName}</p>
                              <p className="font-label-sm text-label-sm text-on-surface-variant font-mono">{row.student.admissionNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-lg py-md">{row.student.class.displayName}</td>
                        <td className="px-lg py-md font-bold">MK {row.finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-lg py-md text-secondary font-semibold">MK {row.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`px-lg py-md font-semibold ${row.balance > 0 ? 'text-error' : 'text-on-surface'}`}>
                          MK {row.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-lg py-md">
                          <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-medium uppercase ${
                            row.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            row.status === 'partial' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-lg py-md">
                          <button
                            onClick={() => {
                              setSelectedInvoiceId(row.id);
                              setPayAmount(row.balance.toString());
                              setPaymentModalOpen(true);
                            }}
                            disabled={row.balance <= 0}
                            className="px-3 py-1.5 bg-primary text-on-primary font-label-md text-label-md font-medium rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-30"
                          >
                            Receive Payment
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-on-surface-variant">No invoices generated for school.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* POP-UP: Record Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col animate-scale-in">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
              <h2 className="font-title-lg text-title-lg font-semibold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">payments</span> Record Payment
              </h2>
              <button 
                onClick={() => setPaymentModalOpen(false)} 
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {payError && (
              <div className="mb-4 p-3 bg-error-container border border-error/20 text-on-error-container text-xs rounded-lg">
                Payment failed: {payError}
              </div>
            )}

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Select Student Invoice *</label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = totalInvoices.find(i => i.id === e.target.value);
                    if (inv) setPayAmount(inv.balance.toString());
                  }}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg font-bold"
                >
                  {totalInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.student.user.firstName} {inv.student.user.lastName} ({inv.student.class.displayName}) - Balance: MK {inv.balance}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm font-medium uppercase tracking-wider text-on-surface-variant mb-1">Amount Collected (MK) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 150000"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm font-bold outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm font-medium uppercase tracking-wider text-on-surface-variant mb-1">Payment Method *</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                  >
                    <option value="cash">Cash (Bursar Office)</option>
                    <option value="mobile_money">Mobile Money (Airtel/TNM)</option>
                    <option value="bank">Bank Deposit / Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Transaction Ref / Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. TNM-MPESA-88219"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-5 py-2.5 bg-surface-container border border-outline-variant text-outline hover:text-on-surface rounded-lg font-label-md text-label-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recording}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                >
                  {recording ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BursarDashboard;
