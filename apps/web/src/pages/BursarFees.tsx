import React, { useState } from 'react';
import { Header } from '../components/BursarDashboard/Header';
import { Sidebar } from '../components/BursarDashboard/Sidebar';
import { BottomNav } from '../components/BursarDashboard/BottomNav';
import { useQuery, useMutation } from '../hooks/useApi';
import type { FeeStructure } from '@myklasi/shared';

export const BursarFees: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Form states for config
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [tuitionFee, setTuitionFee] = useState('');
  const [boardingFee, setBoardingFee] = useState('');
  const [otherFee, setOtherFee] = useState('');
  const [configError, setConfigError] = useState<string | null>(null);

  // Form states for generate
  const [genClassId, setGenClassId] = useState('');
  const [genTermId, setGenTermId] = useState('');
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  // Queries
  const { data: structures, loading: loadingStructures, refetch: refetchStructures } =
    useQuery<FeeStructure[]>('/finance/structures');
  const { data: classes } = useQuery<any[]>('/schools/classes');
  const { data: terms } = useQuery<any[]>('/schools/terms');

  // Mutations
  const { mutate: saveStructure, loading: savingStructure } = useMutation('/finance/structures', 'post');
  const { mutate: generateInvoices, loading: generatingInvoices } = useMutation('/finance/invoices/generate', 'post');

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);

    if (!selectedClassId || !selectedTermId || !tuitionFee) {
      setConfigError('Please fill in all required fields.');
      return;
    }

    try {
      await saveStructure({
        classId: selectedClassId,
        termId: selectedTermId,
        tuitionFee: parseFloat(tuitionFee),
        boardingFee: parseFloat(boardingFee || '0'),
        otherFee: parseFloat(otherFee || '0'),
      });
      setShowConfigModal(false);
      refetchStructures();
      // Reset form
      setSelectedClassId('');
      setSelectedTermId('');
      setTuitionFee('');
      setBoardingFee('');
      setOtherFee('');
    } catch (err: any) {
      setConfigError(err.response?.data?.message || err.message || 'Failed to save fee structure.');
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError(null);
    setGenSuccess(null);

    if (!genClassId || !genTermId) {
      setGenError('Please select both class and term.');
      return;
    }

    try {
      const response = await generateInvoices({
        classId: genClassId,
        termId: genTermId,
      });
      // The response object contains a list of created invoices
      const count = Array.isArray(response) ? response.length : 0;
      setGenSuccess(`Invoices successfully generated for ${count} students!`);
      setTimeout(() => {
        setShowGenerateModal(false);
        setGenSuccess(null);
        setGenClassId('');
        setGenTermId('');
      }, 2000);
    } catch (err: any) {
      setGenError(err.response?.data?.message || err.message || 'Failed to generate invoices.');
    }
  };

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-md md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        <div className="py-lg flex flex-col gap-lg animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm">
            <div>
              <h1 className="dash-page-title">Fee Structures</h1>
              <p className="font-body-md text-on-surface-variant mt-1">Configure Term-based fee structures and trigger invoice billings.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="py-[10px] px-md bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors font-label-md text-label-md rounded-lg flex items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                Generate Invoices
              </button>
              <button
                onClick={() => setShowConfigModal(true)}
                className="py-[10px] px-md bg-primary text-on-primary hover:bg-opacity-90 transition-colors font-label-md text-label-md rounded-lg flex items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Configure Fees
              </button>
            </div>
          </div>

          {/* Fee Structures Grid */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h3 className="font-title-lg text-title-lg font-semibold text-on-background mb-md">Active Class Billing Rates</h3>

            {loadingStructures ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !structures || structures.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant font-body-md">
                No fee structures configured yet. Click "Configure Fees" to define term billing rates.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant text-label-sm font-bold text-on-surface-variant">
                      <th className="py-sm">Class Stream</th>
                      <th className="py-sm">Term Session</th>
                      <th className="py-sm text-right">Tuition</th>
                      <th className="py-sm text-right">Boarding</th>
                      <th className="py-sm text-right">Other/Dev</th>
                      <th className="py-sm text-right">Total Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.map((struct) => (
                      <tr key={struct.id} className="border-b border-outline-variant/50 text-body-md text-on-surface hover:bg-surface-container-low transition-colors">
                        <td className="py-md font-semibold">{struct.class?.displayName || 'Unknown Class'}</td>
                        <td className="py-md">
                          {struct.term?.name} ({struct.term?.academicYear?.name})
                        </td>
                        <td className="py-md text-right">MK {struct.tuitionFee.toLocaleString()}</td>
                        <td className="py-md text-right">MK {struct.boardingFee.toLocaleString()}</td>
                        <td className="py-md text-right">MK {struct.otherFee.toLocaleString()}</td>
                        <td className="py-md text-right font-bold text-primary">
                          MK {struct.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Configure Fee Structure */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-md">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h3 className="font-title-lg text-title-lg font-bold text-on-background">Configure Class Fees</h3>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded-full hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleConfigSubmit}>
                <div className="p-lg flex flex-col gap-md">
                  {configError && (
                    <div className="p-sm bg-error-container border border-error/25 text-on-error-container text-body-sm rounded-lg flex gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
                      {configError}
                    </div>
                  )}

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Target Class</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                      required
                    >
                      <option value="">Select a Class...</option>
                      {classes?.map((c) => (
                        <option key={c.id} value={c.id}>{c.displayName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Academic Term</label>
                    <select
                      value={selectedTermId}
                      onChange={(e) => setSelectedTermId(e.target.value)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                      required
                    >
                      <option value="">Select a Term...</option>
                      {terms?.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.academicYear?.name})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Tuition Fee (MK)</label>
                    <input
                      type="number"
                      value={tuitionFee}
                      onChange={(e) => setTuitionFee(e.target.value)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                      placeholder="e.g. 150000"
                      min="0"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Boarding Fee (MK)</label>
                    <input
                      type="number"
                      value={boardingFee}
                      onChange={(e) => setBoardingFee(e.target.value)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                      placeholder="e.g. 120000 (Optional for day students)"
                      min="0"
                    />
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Development / Other Fees (MK)</label>
                    <input
                      type="number"
                      value={otherFee}
                      onChange={(e) => setOtherFee(e.target.value)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                      placeholder="e.g. 30000"
                      min="0"
                    />
                  </div>
                </div>

                <div className="p-lg bg-surface-container-low border-t border-outline-variant flex justify-end gap-sm">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="py-[8px] px-md border border-outline text-on-surface-variant font-label-md rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingStructure}
                    className="py-[8px] px-md bg-primary text-on-primary hover:bg-opacity-90 font-label-md rounded-lg flex items-center gap-xs disabled:opacity-50"
                  >
                    {savingStructure ? 'Saving...' : 'Save Structure'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Generate Invoices */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-md">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h3 className="font-title-lg text-title-lg font-bold text-on-background">Generate Class Invoices</h3>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="p-1 rounded-full hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleGenerateSubmit}>
                <div className="p-lg flex flex-col gap-md">
                  {genError && (
                    <div className="p-sm bg-error-container border border-error/25 text-on-error-container text-body-sm rounded-lg flex gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
                      {genError}
                    </div>
                  )}

                  {genSuccess && (
                    <div className="p-sm bg-primary-container border border-primary/25 text-on-primary-container text-body-sm rounded-lg flex gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary shrink-0">check_circle</span>
                      {genSuccess}
                    </div>
                  )}

                  <div className="p-4 bg-tertiary-container/30 border border-tertiary-container/40 rounded-xl text-body-sm text-on-surface-variant flex gap-sm">
                    <span className="material-symbols-outlined text-tertiary shrink-0 text-[20px]">warning</span>
                    <p className="leading-relaxed">
                      <strong>Billing restriction:</strong> Billing will only execute for classes with an active fee structure. Existing student invoices for the chosen term will be skipped to prevent duplicates.
                    </p>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Target Class</label>
                    <select
                      value={genClassId}
                      onChange={(e) => setGenClassId(e.target.value)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                      required
                    >
                      <option value="">Select a Class...</option>
                      {classes?.map((c) => (
                        <option key={c.id} value={c.id}>{c.displayName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface">Billing Term</label>
                    <select
                      value={genTermId}
                      onChange={(e) => setGenTermId(e.target.value)}
                      className="w-full bg-surface-container border border-outline px-sm py-[8px] rounded-lg text-body-md"
                      required
                    >
                      <option value="">Select a Term...</option>
                      {terms?.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.academicYear?.name})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-lg bg-surface-container-low border-t border-outline-variant flex justify-end gap-sm">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="py-[8px] px-md border border-outline text-on-surface-variant font-label-md rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generatingInvoices || !!genSuccess}
                    className="py-[8px] px-md bg-secondary-container text-on-secondary-container hover:bg-opacity-90 font-label-md rounded-lg flex items-center gap-xs disabled:opacity-50"
                  >
                    {generatingInvoices ? 'Generating...' : 'Start Billing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
};
export default BursarFees;
