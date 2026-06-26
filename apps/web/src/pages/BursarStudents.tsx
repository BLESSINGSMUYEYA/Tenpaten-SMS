import React, { useState } from 'react';
import { Header } from '../components/BursarDashboard/Header';
import { Sidebar } from '../components/BursarDashboard/Sidebar';
import { BottomNav } from '../components/BursarDashboard/BottomNav';
import { useQuery } from '../hooks/useApi';
import type { Invoice, FeePayment } from '@myklasi/shared';

export const BursarStudents: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Notification States
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Queries
  const { data: invoices, loading: loadingInvoices, refetch: refetchInvoices } = useQuery<Invoice[]>('/finance/invoices');
  const { data: classes } = useQuery<any[]>('/schools/classes');
  const { data: payments } = useQuery<FeePayment[]>('/finance/payments');



  // Filter student list
  const filteredInvoices = (invoices || []).filter((inv) => {
    const s = searchTerm.toLowerCase();
    const studentName = `${inv.student?.user.firstName ?? ''} ${inv.student?.user.lastName ?? ''}`.toLowerCase();
    const admission = (inv.student?.admissionNumber ?? '').toLowerCase();
    const matchesSearch = studentName.includes(s) || admission.includes(s);

    const matchesClass = classFilter ? inv.student?.class?.id === classFilter : true;
    const matchesStatus = statusFilter ? inv.status === statusFilter : true;

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Fetch payments for selected student
  const studentPayments = (payments || []).filter(
    (p) => p.invoiceId === selectedInvoice?.id
  );



  // Let's implement the trigger with axios instead
  const triggerReminder = async (invoiceId: string) => {
    setSmsSending(true);
    setSmsResult(null);
    try {
      // Import api from services/api is not needed if we import it, or we can use our useMutation with a custom URL path.
      // Wait, useMutation takes a fixed URL. But we can just make a direct call using axios.
      // Let's import api from '../services/api'
      const { api } = await import('../services/api');
      await api.post(`/finance/invoices/${invoiceId}/reminder`);
      setSmsResult({ success: true, msg: 'SMS fee reminder dispatched successfully!' });
      refetchInvoices();
    } catch (err: any) {
      setSmsResult({
        success: false,
        msg: err.response?.data?.message || err.message || 'Failed to dispatch SMS reminder.',
      });
    } finally {
      setSmsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-primary-container text-on-primary-container font-bold';
      case 'partial':
        return 'bg-secondary-container text-on-secondary-container font-bold';
      default:
        return 'bg-error-container text-on-error-container font-bold';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'partial': return 'Partial';
      default: return 'Outstanding';
    }
  };

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-md md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        <div className="py-lg flex flex-col gap-lg animate-fade-in">
          <div>
            <h1 className="dash-page-title">Student Balances</h1>
            <p className="font-body-md text-on-surface-variant mt-1">Review class roster accounts, view payment logs, and trigger SMS alerts.</p>
          </div>

          {/* Filters Panel */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col md:flex-row gap-md shadow-sm items-center">
            {/* Search */}
            <div className="relative w-full md:flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-[38px] pr-md py-[8px] bg-surface-container border border-outline rounded-lg text-body-sm"
                placeholder="Search by student name or admission number..."
              />
            </div>

            {/* Class Filter */}
            <div className="w-full md:w-48">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-sm"
              >
                <option value="">All Classes</option>
                {classes?.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-sm"
              >
                <option value="">All Statuses</option>
                <option value="paid">Fully Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="unpaid">Outstanding</option>
              </select>
            </div>
          </div>

          {/* Student Billing Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            {loadingInvoices ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant font-body-md">
                No billing statements found matching filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant text-label-sm font-bold text-on-surface-variant">
                      <th className="py-sm">Admission No</th>
                      <th className="py-sm">Name</th>
                      <th className="py-sm">Class</th>
                      <th className="py-sm">Boarding</th>
                      <th className="py-sm text-right">Billed</th>
                      <th className="py-sm text-right">Paid</th>
                      <th className="py-sm text-right">Balance</th>
                      <th className="py-sm text-center">Status</th>
                      <th className="py-sm text-center">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-outline-variant/50 text-body-md text-on-surface hover:bg-surface-container-low transition-colors">
                        <td className="py-md font-mono text-sm">{inv.student?.admissionNumber}</td>
                        <td className="py-md font-semibold">
                          {inv.student?.user.firstName} {inv.student?.user.lastName}
                        </td>
                        <td className="py-md">{inv.student?.class?.displayName}</td>
                        <td className="py-md capitalize text-sm">{inv.student?.boardingStatus}</td>
                        <td className="py-md text-right font-medium">MK {inv.amountBilled.toLocaleString()}</td>
                        <td className="py-md text-right text-primary font-medium">MK {inv.amountPaid.toLocaleString()}</td>
                        <td className="py-md text-right text-error font-bold">MK {inv.balance.toLocaleString()}</td>
                        <td className="py-md text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-semibold ${getStatusBadge(inv.status)}`}>
                            {getStatusLabel(inv.status)}
                          </span>
                        </td>
                        <td className="py-md text-center">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setSmsResult(null);
                            }}
                            className="py-[4px] px-sm bg-surface-container hover:bg-primary-container hover:text-on-primary-container transition-colors rounded font-label-sm text-label-sm font-semibold"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Slide-over/Modal: Student Account Detail Statement */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end animate-fade-in">
            <div className="bg-surface-container-lowest border-l border-outline-variant w-full max-w-lg h-full p-lg flex flex-col gap-lg shadow-2xl animate-slide-in-right overflow-y-auto">
              <div className="flex justify-between items-center border-b border-outline-variant pb-md">
                <div>
                  <h3 className="font-title-lg text-title-lg font-bold text-on-background">Student Statement</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Detailed financial overview</p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Student Header Info */}
              <div className="bg-surface-container rounded-xl p-md flex gap-md items-center">
                <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-lg uppercase">
                  {selectedInvoice.student?.user.firstName?.[0]}
                  {selectedInvoice.student?.user.lastName?.[0]}
                </div>
                <div>
                  <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
                    {selectedInvoice.student?.user.firstName} {selectedInvoice.student?.user.lastName}
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Adm: {selectedInvoice.student?.admissionNumber} | Class: {selectedInvoice.student?.class?.displayName}</p>
                </div>
              </div>

              {/* Core Financial Stat Cards */}
              <div className="grid grid-cols-3 gap-sm text-center">
                <div className="bg-surface-container p-sm rounded-lg border border-outline-variant/50">
                  <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Total Billed</p>
                  <p className="font-bold text-sm text-on-surface mt-1">MK {selectedInvoice.amountBilled.toLocaleString()}</p>
                </div>
                <div className="bg-primary-container p-sm rounded-lg border border-primary/20">
                  <p className="text-[10px] text-on-primary-container uppercase font-semibold">Amount Paid</p>
                  <p className="font-bold text-sm text-primary mt-1">MK {selectedInvoice.amountPaid.toLocaleString()}</p>
                </div>
                <div className="bg-error-container p-sm rounded-lg border border-error/20">
                  <p className="text-[10px] text-on-error-container uppercase font-semibold">Outstanding</p>
                  <p className="font-bold text-sm text-error mt-1">MK {selectedInvoice.balance.toLocaleString()}</p>
                </div>
              </div>

              {/* Parent/Guardian Info Card */}
              <div className="bg-surface-container p-md rounded-xl border border-outline-variant/60 flex flex-col gap-sm relative">
                <h4 className="font-label-md text-label-md font-bold text-on-surface border-b border-outline-variant/40 pb-xs">Guardian Details</h4>
                <div className="flex flex-col gap-xs text-body-sm text-on-surface-variant">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(selectedInvoice.student as any)?.parents && (selectedInvoice.student as any).parents.length > 0 ? (
                    <>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <p><strong>Name:</strong> {(selectedInvoice.student as any).parents[0].parent.user.firstName} {(selectedInvoice.student as any).parents[0].parent.user.lastName}</p>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <p><strong>Phone:</strong> {(selectedInvoice.student as any).parents[0].parent.phoneNumber || 'N/A'}</p>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <p><strong>Email:</strong> {(selectedInvoice.student as any).parents[0].parent.user.email || 'N/A'}</p>
                    </>
                  ) : (
                    <p className="italic">No guardian linked to this student.</p>
                  )}
                </div>
                {selectedInvoice.balance > 0 && (
                  <button
                    onClick={() => triggerReminder(selectedInvoice.id)}
                    disabled={smsSending}
                    className="w-full mt-2 py-[8px] bg-secondary-container text-on-secondary-container hover:bg-opacity-90 transition-all font-label-md rounded-lg flex items-center justify-center gap-xs disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">sms</span>
                    {smsSending ? 'Sending SMS...' : 'Send SMS Reminder'}
                  </button>
                )}
                {smsResult && (
                  <div className={`mt-xs p-xs text-center text-[11px] rounded font-semibold ${smsResult.success ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                    {smsResult.msg}
                  </div>
                )}
              </div>

              {/* Student Payments Ledger */}
              <div className="flex-1 flex flex-col gap-sm min-h-[200px]">
                <h4 className="font-label-md text-label-md font-bold text-on-surface">Payment History</h4>
                {studentPayments.length === 0 ? (
                  <p className="text-sm text-on-surface-variant italic py-md text-center bg-surface-container/50 rounded-lg">No payments logged for this student statements.</p>
                ) : (
                  <div className="overflow-y-auto max-h-[220px] border border-outline-variant/60 rounded-xl">
                    <table className="w-full text-left text-sm border-collapse bg-surface-container-lowest">
                      <thead>
                        <tr className="bg-surface-container border-b border-outline-variant text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
                          <th className="p-xs pl-sm">Receipt</th>
                          <th className="p-xs">Method</th>
                          <th className="p-xs text-right pr-sm">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentPayments.map((pay) => (
                          <tr key={pay.id} className="border-b border-outline-variant/40 hover:bg-surface-container-low transition-colors">
                            <td className="p-sm font-mono text-xs">{pay.receiptNumber}</td>
                            <td className="p-sm capitalize text-xs">
                              {pay.paymentMethod === 'bank' ? 'Bank Deposit' : pay.paymentMethod === 'mobile_money' ? 'Mobile Money' : pay.paymentMethod}
                            </td>
                            <td className="p-sm text-right pr-sm font-semibold text-primary">MK {pay.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
};
export default BursarStudents;
