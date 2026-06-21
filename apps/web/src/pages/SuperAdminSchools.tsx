import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';
import { useQuery, useMutation } from '../hooks/useApi';
import { api } from '../services/api';
import { generateSchoolCode } from '@myklasi/shared';

interface School {
  id: string;
  name: string;
  schoolCode: string;
  subscriptionPlan: string;
  type: string;
  district: string;
  isActive: boolean;
  createdAt: string;
  _count?: { users: number };
}

const DISTRICTS = [
  'Lilongwe', 'Blantyre', 'Zomba', 'Mzimba', 'Kasungu', 'Mangochi', 'Dedza', 'Nkhotakota',
  'Karonga', 'Chitipa', 'Nkhata Bay', 'Salima', 'Balaka', 'Machinga', 'Chiradzulu', 'Thyolo',
  'Mulanje', 'Phalombe', 'Chikwawa', 'Nsanje', 'Mwanza', 'Neno', 'Ntcheu', 'Dowa', 'Ntchisi', 'Mchinji',
];

export const SuperAdminSchools: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  // API hooks
  const { data: schools, loading, error: fetchError, refetch } = useQuery<School[]>('/admin/schools');
  const { mutate: createSchool, loading: creating, error: createError } = useMutation('/admin/schools', 'post');

  // Modal states
  const [addSchoolOpen, setAddSchoolOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolType, setNewSchoolType] = useState<'secondary' | 'primary' | 'mixed'>('secondary');
  const [newSchoolDistrict, setNewSchoolDistrict] = useState('Lilongwe');

  // Head teacher details
  const [htFirstName, setHtFirstName] = useState('');
  const [htLastName, setHtLastName] = useState('');
  const [htEmail, setHtEmail] = useState('');
  const [htPhone, setHtPhone] = useState('');

  // School code override (Super Admin only)
  const [useCustomInitials, setUseCustomInitials] = useState(false);
  const [customInitials, setCustomInitials] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Code preview: recalculate whenever name, district, or custom initials change ───
  useEffect(() => {
    const year = new Date().getFullYear();
    if (!newSchoolName.trim()) {
      setPreviewCode('');
      setCodeStatus('idle');
      return;
    }
    const overrideInitials = useCustomInitials && /^[A-Z]{2,5}$/.test(customInitials.toUpperCase())
      ? customInitials.toUpperCase()
      : undefined;
    const code = generateSchoolCode(newSchoolName, year, overrideInitials);
    setPreviewCode(code);
    setCodeStatus('idle');
  }, [newSchoolName, newSchoolDistrict, useCustomInitials, customInitials]);

  // ─── Debounced uniqueness check ───
  const checkUniqueness = useCallback((code: string) => {
    if (!code) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCodeStatus('checking');
      try {
        const res = await api.get(`/admin/schools/check-code?code=${encodeURIComponent(code)}`);
        setCodeStatus(res.data?.data?.available ? 'available' : 'taken');
      } catch {
        setCodeStatus('idle');
      }
    }, 600);
  }, []);

  useEffect(() => {
    if (previewCode) checkUniqueness(previewCode);
  }, [previewCode, checkUniqueness]);

  const resetForm = () => {
    setNewSchoolName('');
    setNewSchoolType('secondary');
    setNewSchoolDistrict('Lilongwe');
    setHtFirstName('');
    setHtLastName('');
    setHtEmail('');
    setHtPhone('');
    setUseCustomInitials(false);
    setCustomInitials('');
    setPreviewCode('');
    setCodeStatus('idle');
  };

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !htFirstName || !htLastName || !htEmail) return;
    if (codeStatus === 'taken') return;

    try {
      const payload: Record<string, unknown> = {
        name: newSchoolName,
        type: newSchoolType,
        district: newSchoolDistrict,
        country: 'Malawi',
        headTeacher: {
          firstName: htFirstName,
          lastName: htLastName,
          email: htEmail,
          phone: htPhone || undefined,
        },
      };
      if (useCustomInitials && /^[A-Z]{2,5}$/.test(customInitials.toUpperCase())) {
        payload.customInitials = customInitials.toUpperCase();
      }
      await createSchool(payload);
      resetForm();
      setAddSchoolOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to create school:', err);
    }
  };

  const filteredSchools = (schools || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.schoolCode.toLowerCase().includes(search.toLowerCase()) ||
    s.subscriptionPlan.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (isActive: boolean) =>
    isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container';

  const codeStatusBadge = () => {
    if (!previewCode) return null;
    if (codeStatus === 'checking') return (
      <span className="flex items-center gap-1 text-[10px] text-on-surface-variant">
        <span className="material-symbols-outlined text-xs animate-spin">refresh</span> Checking…
      </span>
    );
    if (codeStatus === 'available') return (
      <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
        <span className="material-symbols-outlined text-xs">check_circle</span> Available
      </span>
    );
    if (codeStatus === 'taken') return (
      <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold">
        <span className="material-symbols-outlined text-xs">error</span> Already in use — regenerate
      </span>
    );
    return null;
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-margin-mobile md:px-margin-desktop pt-20 pb-margin-desktop overflow-y-auto bg-surface-bright">
          {/* Page Header */}
          <div className="mb-lg flex flex-col sm:flex-row sm:justify-between sm:items-end gap-md">
            <div>
              <h1 className="dash-page-title mb-xs">Schools Management</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Register, update, and manage school institutions onboarded to MyKlasi.</p>
            </div>
            <button
              onClick={() => setAddSchoolOpen(true)}
              className="flex items-center justify-center gap-sm bg-primary text-on-primary px-4 py-2.5 rounded-lg hover:bg-primary-container transition-colors shadow-sm self-start sm:self-auto active:scale-95 text-sm font-bold"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add New School
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-lg">
            {[
              { label: 'Total Institutions', value: loading ? '…' : (schools?.length || 0), icon: 'domain' },
              { label: 'Active Subscriptions', value: loading ? '…' : (schools?.filter(s => s.isActive).length || 0), icon: 'verified' },
              { label: 'Starter Plans', value: loading ? '…' : (schools?.filter(s => s.subscriptionPlan === 'basic').length || 0), icon: 'workspace_premium' },
              { label: 'Premium Plans', value: loading ? '…' : (schools?.filter(s => s.subscriptionPlan === 'premium').length || 0), icon: 'workspace_premium' },
            ].map(c => (
              <div key={c.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-4 hover:border-primary transition-all">
                <div className="p-2 bg-surface-container-low rounded-lg text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant text-xs">{c.label}</p>
                  <p className="text-headline-sm font-bold text-on-background mt-0.5 text-lg">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {fetchError && (
            <div className="mb-md p-4 bg-error-container border border-error/20 text-on-error-container text-xs rounded-lg">
              Error fetching schools: {fetchError}
            </div>
          )}

          {/* Schools Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low gap-4 flex-wrap">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold text-base">Registered Schools</h2>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input
                  className="pl-9 pr-4 py-1.5 border border-outline-variant rounded-full bg-surface-container-lowest focus:outline-none focus:border-primary font-body-sm text-xs w-64"
                  placeholder="Search by name or code…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant">
                    <th className="p-md pl-md font-semibold text-xs text-on-surface-variant">School Name</th>
                    <th className="p-md font-semibold text-xs text-on-surface-variant">System Code</th>
                    <th className="p-md font-semibold text-xs text-on-surface-variant">Subscription Plan</th>
                    <th className="p-md font-semibold text-xs text-on-surface-variant">Total User Accounts</th>
                    <th className="p-md font-semibold text-xs text-on-surface-variant">District</th>
                    <th className="p-md pr-md text-right font-semibold text-xs text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-on-surface">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-on-surface-variant text-sm">Loading schools…</td>
                    </tr>
                  ) : filteredSchools.map((s, i) => (
                    <tr key={i} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-md pl-md font-bold text-sm text-primary">{s.name}</td>
                      <td className="p-md text-on-surface-variant font-mono font-semibold">{s.schoolCode}</td>
                      <td className="p-md font-medium capitalize">{s.subscriptionPlan}</td>
                      <td className="p-md text-on-surface-variant">{s._count?.users ?? 0}</td>
                      <td className="p-md text-on-surface-variant">{s.district}</td>
                      <td className="p-md pr-md text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm font-bold text-[10px] uppercase ${statusColor(s.isActive)}`}>
                          {s.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filteredSchools.length === 0 && (
                <div className="py-12 text-center text-on-surface-variant text-sm">No schools registered or matched.</div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Add School Modal ── */}
      {addSchoolOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg p-6 shadow-2xl relative flex flex-col max-h-[92vh] overflow-y-auto animate-scale-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">domain_add</span> Add New School
              </h2>
              <button
                onClick={() => { resetForm(); setAddSchoolOpen(false); }}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-error-container border border-error/20 text-on-error-container text-xs rounded-lg">
                Onboarding failed: {createError}
              </div>
            )}

            <form onSubmit={handleAddSchool} className="space-y-4">
              {/* School Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">School / Institution Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Oakwood Preparatory Academy"
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg"
                />
              </div>

              {/* ── Live School Code Preview Panel ── */}
              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Auto-Generated School Code</span>
                  {codeStatusBadge()}
                </div>
                {previewCode ? (
                  <div className="font-mono text-xl font-black tracking-widest text-primary bg-surface-container rounded-lg px-4 py-2 text-center border border-primary/20 select-all">
                    {previewCode}
                  </div>
                ) : (
                  <div className="font-mono text-sm text-on-surface-variant/50 text-center py-2 italic">
                    Enter school name above to preview code
                  </div>
                )}

                {/* Override Toggle — Super Admin only */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setUseCustomInitials(v => !v); setCustomInitials(''); }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none ${useCustomInitials ? 'bg-primary border-primary' : 'bg-surface-container border-outline-variant'}`}
                    role="switch"
                    aria-checked={useCustomInitials}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${useCustomInitials ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Override Initials (Super Admin)</span>
                </div>

                {useCustomInitials && (
                  <div className="animate-fade-in">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Custom Initials (2–5 letters)</label>
                    <input
                      type="text"
                      placeholder="e.g. OPA"
                      maxLength={5}
                      value={customInitials}
                      onChange={e => setCustomInitials(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                      className="w-32 px-4 py-1.5 bg-surface-container border border-outline-variant text-on-surface text-sm font-mono font-bold outline-none focus:border-primary rounded-lg uppercase tracking-widest"
                    />
                    {customInitials && !/^[A-Z]{2,5}$/.test(customInitials) && (
                      <p className="text-[10px] text-red-500 mt-1">Must be 2–5 uppercase letters.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Type & District */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">School Type *</label>
                  <select
                    value={newSchoolType}
                    onChange={e => setNewSchoolType(e.target.value as 'secondary' | 'primary' | 'mixed')}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg"
                  >
                    <option value="secondary">Secondary</option>
                    <option value="primary">Primary</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">District (Malawi) *</label>
                  <select
                    value={newSchoolDistrict}
                    onChange={e => setNewSchoolDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg"
                  >
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Head Teacher Info */}
              <div className="pt-2 border-t border-outline-variant">
                <span className="block text-xs font-bold uppercase tracking-wider text-primary mb-3">Head Teacher Account Info</span>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">First Name *</label>
                    <input type="text" placeholder="e.g. John" value={htFirstName} onChange={e => setHtFirstName(e.target.value)} required
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Last Name *</label>
                    <input type="text" placeholder="e.g. Banda" value={htLastName} onChange={e => setHtLastName(e.target.value)} required
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Email Address *</label>
                    <input type="email" placeholder="e.g. headteacher@email.com" value={htEmail} onChange={e => setHtEmail(e.target.value)} required
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Phone Number</label>
                    <input type="text" placeholder="e.g. +265 888 123 456" value={htPhone} onChange={e => setHtPhone(e.target.value)}
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                <button
                  type="button"
                  onClick={() => { resetForm(); setAddSchoolOpen(false); }}
                  className="px-5 py-2.5 bg-surface-container border border-outline-variant text-outline hover:text-on-surface rounded-lg font-bold transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || codeStatus === 'taken' || !previewCode}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Onboarding…' : 'Onboard School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSchools;
