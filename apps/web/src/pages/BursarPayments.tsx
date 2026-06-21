import React, { useState } from 'react';
import { Header } from '../components/BursarDashboard/Header';
import { Sidebar } from '../components/BursarDashboard/Sidebar';
import { BottomNav } from '../components/BursarDashboard/BottomNav';
import { useQuery, useMutation } from '../hooks/useApi';
import type { FeePayment, Invoice } from '@myklasi/shared';

export const BursarPayments: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');

  // Form states for payment recording
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'bank' | 'cheque'>('bank');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [recordError, setRecordError] = useState<string | null>(null);

  // Queries
  const { data: payments, loading: loadingPayments, refetch: refetchPayments } =
    useQuery<FeePayment[]>('/finance/payments');
  const { data: invoices, refetch: refetchInvoices } =
    useQuery<Invoice[]>('/finance/invoices');

  // Mutation
  const { mutate: recordPayment, loading: recordingPayment } = useMutation('/finance/payments', 'post');

  // Filter out paid invoices for selection in payment modal
  const outstandingInvoices = (invoices || []).filter(inv => inv.status !== 'paid');

  const selectedInvoice = outstandingInvoices.find(inv => inv.id === selectedInvoiceId);

  // Filter payments list based on search
  const filteredPayments = (payments || []).filter(pay => {
    const s = searchTerm.toLowerCase();
    const studentName = `${pay.invoice?.student?.user?.firstName ?? ''} ${pay.invoice?.student?.user?.lastName ?? ''}`.toLowerCase();
    const receipt = pay.receiptNumber.toLowerCase();
    const ref = (pay.referenceNumber || '').toLowerCase();
    return studentName.includes(s) || receipt.includes(s) || ref.includes(s);
  });

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecordError(null);

    if (!selectedInvoiceId || !amount || !paymentMethod) {
      setRecordError('Please fill in all required fields.');
      return;
    }

    const payAmt = parseFloat(amount);
    if (selectedInvoice && payAmt > selectedInvoice.balance) {
      setRecordError(`Payment amount exceeds the outstanding invoice balance of MK ${selectedInvoice.balance.toLocaleString()}.`);
      return;
    }

    try {
      await recordPayment({
        invoiceId: selectedInvoiceId,
        amount: payAmt,
        paymentMethod,
        referenceNumber,
        paymentDate: paymentDate || undefined,
      });

      setShowRecordModal(false);
      refetchPayments();
      refetchInvoices();

      // Reset form
      setSelectedInvoiceId('');
      setAmount('');
      setPaymentMethod('bank');
      setReferenceNumber('');
      setPaymentDate('');
    } catch (err: any) {
      setRecordError(err.response?.data?.message || err.message || 'Failed to record payment.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-md md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        <div className="py-lg flex flex-col gap-lg animate-fade-in print:p-0 print:m-0 print:bg-white print:text-black">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm print:hidden">
            <div>
              <h1 className="dash-page-title">Payments Ledger</h1>
              <p className="font-body-md text-on-surface-variant mt-1">Search collection logs, print vouchers, and record student deposits.</p>
            </div>
            <button
              onClick={() => setShowRecordModal(true)}
              className="py-[10px] px-md bg-primary text-on-primary hover:bg-opacity-90 transition-colors font-label-md text-label-md rounded-lg flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_card</span>
              Record Payment
            </button>
          </div>

          {/* Payments List */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm print:hidden">
            {/* Search Bar */}
            <div className="mb-md relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-[38px] pr-md py-[10px] bg-surface-container border border-outline rounded-lg font-body-sm text-body-sm text-on-surface"
                placeholder="Search by student name, receipt number, or reference..."
              />
            </div>

            {loadingPayments ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant font-body-md">
                No payment transactions found matching search details.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant text-label-sm font-bold text-on-surface-variant">
                      <th className="py-sm">Receipt ID</th>
                      <th className="py-sm">Student</th>
                      <th className="py-sm">Class Stream</th>
                      <th className="py-sm">Channel</th>
                      <th className="py-sm">Reference</th>
                      <th className="py-sm">Date</th>
                      <th className="py-sm text-right">Amount</th>
                      <th className="py-sm text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((pay) => (
                      <tr key={pay.id} className="border-b border-outline-variant/50 text-body-md text-on-surface hover:bg-surface-container-low transition-colors">
                        <td className="py-md font-mono text-sm">{pay.receiptNumber}</td>
                        <td className="py-md font-semibold">
                          {pay.invoice?.student?.user.firstName} {pay.invoice?.student?.user.lastName}
                        </td>
                        <td className="py-md">{pay.invoice?.student?.class?.displayName}</td>
                        <td className="py-md capitalize">
                          {pay.paymentMethod === 'bank' ? 'Bank Deposit' : pay.paymentMethod === 'mobile_money' ? 'Mobile Money' : pay.paymentMethod}
                        </td>
                        <td className="py-md font-mono text-sm text-on-surface-variant">{pay.referenceNumber || '—'}</td>
                        <td className="py-md text-sm">{new Date(pay.paymentDate).toLocaleDateString()}</td>
                        <td className="py-md text-right font-bold text-primary">MK {pay.amount.toLocaleString()}</td>
                        <td className="py-md text-center">
                          <button
                            onClick={() => setSelectedPayment(pay)}
                            className="p-1 text-primary hover:bg-primary-container rounded-full transition-colors flex items-center justify-center mx-auto"
                          >
                            <span className="material-symbols-outlined text-[18px]">receipt</span>
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

        {/* Modal: Record Fee Payment */}
        {showRecordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-md print:hidden animate-fade-in">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h3 className="font-title-lg text-title-lg font-bold text-on-background">Record Fee Deposit</h3>
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="p-1 rounded-full hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleRecordSubmit}>
                <div className="p-lg flex flex-col gap-md">
                  {recordError && (
                    <div className="p-sm bg-error-container border border-error/25 text-on-error-container text-body-sm rounded-lg flex gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
                      {recordError}
                    </div>
                  )}

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Select Student Billing Account</label>
                    <select
                      value={selectedInvoiceId}
                      onChange={(e) => setSelectedInvoiceId(e.target.value)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                      required
                    >
                      <option value="">Choose Outstanding Invoice...</option>
                      {outstandingInvoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.student?.user.firstName} {inv.student?.user.lastName} ({inv.student?.class?.displayName}) — Term: {inv.term?.name} (Bal: MK {inv.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedInvoice && (
                    <div className="p-sm bg-surface-container border border-outline-variant rounded-xl flex flex-col gap-xs text-body-sm text-on-surface-variant">
                      <div className="flex justify-between">
                        <span>Original Bill:</span>
                        <span className="font-semibold text-on-surface">MK {selectedInvoice.amountBilled.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Already Paid:</span>
                        <span className="font-semibold text-primary">MK {selectedInvoice.amountPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-outline-variant/50 pt-xs mt-xs font-bold text-on-surface">
                        <span>Outstanding Balance:</span>
                        <span className="text-error">MK {selectedInvoice.balance.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Deposit Amount (MK)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                      placeholder="e.g. 150000"
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                      required
                    >
                      <option value="bank">Bank Deposit</option>
                      <option value="mobile_money">Mobile Money (Airtel/Mpamba)</option>
                      <option value="cash">Physical Cash</option>
                      <option value="cheque">Bank Cheque</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Transaction Reference ID</label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                      placeholder="e.g. Bank slip reference, phone transaction number"
                    />
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Payment Date</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md text-on-surface"
                    />
                  </div>
                </div>

                <div className="p-lg bg-surface-container-low border-t border-outline-variant flex justify-end gap-sm">
                  <button
                    type="button"
                    onClick={() => setShowRecordModal(false)}
                    className="py-[8px] px-md border border-outline text-on-surface-variant font-label-md rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recordingPayment}
                    className="py-[8px] px-md bg-primary text-on-primary hover:bg-opacity-90 font-label-md rounded-lg flex items-center gap-xs disabled:opacity-50"
                  >
                    {recordingPayment ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Printable Payment Receipt Voucher */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-md print:absolute print:inset-0 print:bg-white print:z-0 print:p-0 animate-fade-in">
            <div className="bg-white text-black border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl p-lg flex flex-col gap-lg print:border-none print:shadow-none print:p-0 animate-scale-up">
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-sm">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-primary print:text-black">MyKlasi SMS</h2>
                  <p className="text-xs text-gray-500">Sunshine Secondary School</p>
                  <p className="text-[10px] text-gray-400">P.O. Box 450, Lilongwe, Malawi</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-gray-700">FEE RECEIPT VOUCHER</h3>
                  <p className="text-xs font-mono font-bold text-gray-900 mt-1">{selectedPayment.receiptNumber}</p>
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 gap-sm text-sm border-b border-gray-100 pb-sm">
                <div>
                  <p className="text-xs text-gray-400">STUDENT DETAILS</p>
                  <p className="font-bold mt-1">
                    {selectedPayment.invoice?.student?.user.firstName} {selectedPayment.invoice?.student?.user.lastName}
                  </p>
                  <p className="text-xs text-gray-600">Admission No: {selectedPayment.invoice?.student?.admissionNumber}</p>
                  <p className="text-xs text-gray-600">Class Section: {selectedPayment.invoice?.student?.class?.displayName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">TRANSACTION METADATA</p>
                  <p className="font-medium mt-1">Date: {new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-600 capitalize">Method: {selectedPayment.paymentMethod === 'bank' ? 'Bank Deposit' : selectedPayment.paymentMethod === 'mobile_money' ? 'Mobile Money' : selectedPayment.paymentMethod}</p>
                  <p className="text-xs text-gray-600">Ref: {selectedPayment.referenceNumber || 'N/A'}</p>
                </div>
              </div>

              {/* Financial Account Breakdown */}
              <div className="flex flex-col gap-xs text-sm">
                <div className="flex justify-between border-b border-gray-100 py-xs text-gray-600">
                  <span>Term Session Billing rate:</span>
                  <span>MK {selectedPayment.invoice?.amountBilled.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-sm text-gray-900 font-bold border-b-2 border-primary/20">
                  <span className="text-primary print:text-black">Amount Deposited (This Voucher):</span>
                  <span className="text-lg text-primary print:text-black">MK {selectedPayment.amount.toLocaleString()}</span>
                </div>
                {selectedPayment.invoice && (
                  <div className="flex justify-between pt-xs text-gray-600 font-semibold">
                    <span>Remaining Outstanding Balance:</span>
                    <span className="text-error print:text-black">MK {selectedPayment.invoice.balance.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-md text-xs mt-lg pt-lg border-t border-gray-100">
                <div className="border-t border-dashed border-gray-300 pt-sm text-center text-gray-500">
                  Bursar Signature &amp; Stamp
                  <p className="text-[10px] text-gray-400 mt-2">Recorded by: {selectedPayment.recordedByUser?.firstName} {selectedPayment.recordedByUser?.lastName}</p>
                </div>
                <div className="border-t border-dashed border-gray-300 pt-sm text-center text-gray-500">
                  Parent / Student Signature
                  <p className="text-[10px] text-gray-400 mt-2">Confirmation of Receipt</p>
                </div>
              </div>

              {/* Receipt Modal Footer Actions */}
              <div className="flex justify-end gap-sm mt-md pt-md border-t border-gray-200 print:hidden">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="py-[8px] px-md border border-outline text-on-surface-variant font-label-md rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="py-[8px] px-md bg-primary text-on-primary hover:bg-opacity-90 font-label-md rounded-lg flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
};
export default BursarPayments;
