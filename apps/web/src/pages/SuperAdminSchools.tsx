import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa',
  'Dedza', 'Dowa', 'Karonga', 'Kasungu', 'Likoma',
  'Lilongwe', 'Machinga', 'Mangochi', 'Mchinji', 'Mulanje',
  'Mwanza', 'Mzimba', 'Neno', 'Nkhata Bay', 'Nkhotakota',
  'Nsanje', 'Ntcheu', 'Ntchisi', 'Phalombe', 'Rumphi',
  'Salima', 'Thyolo', 'Zomba',
];

const PLANS = [
  { value: 'free',       label: 'Free',       desc: 'Up to 50 students' },
  { value: 'basic',      label: 'Basic',       desc: 'Up to 500 students' },
  { value: 'premium',    label: 'Premium',     desc: 'Up to 2,000 students' },
  { value: 'enterprise', label: 'Enterprise',  desc: 'Unlimited + priority' },
];

interface PersonFields { firstName: string; lastName: string; email: string; phone: string; }
type PersonSetter = React.Dispatch<React.SetStateAction<PersonFields>>;

const PersonSection: React.FC<{
  label: string; icon: string; accentClass?: string;
  value: PersonFields; onChange: PersonSetter; required?: boolean;
}> = ({ label, icon, accentClass = 'text-primary', value, onChange, required }) => {
  const set = (k: keyof PersonFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(prev => ({ ...prev, [k]: e.target.value }));
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${accentClass}`}>
        <span className="material-symbols-outlined text-base">{icon}</span>
        {label}
        {required && <span className="ml-auto text-[10px] font-normal text-on-surface-variant normal-case tracking-normal">Required</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">First Name *</label>
          <input type="text" placeholder="e.g. John" value={value.firstName} onChange={set('firstName')} required={required}
            className="w-full px-3 py-2 bg-surface border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg transition-colors" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Last Name *</label>
          <input type="text" placeholder="e.g. Banda" value={value.lastName} onChange={set('lastName')} required={required}
            className="w-full px-3 py-2 bg-surface border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg transition-colors" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Email Address *</label>
          <input type="email" placeholder="email@school.mw" value={value.email} onChange={set('email')} required={required}
            className="w-full px-3 py-2 bg-surface border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg transition-colors" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Phone <span className="font-normal normal-case">(optional)</span></label>
          <input type="text" placeholder="+265 888 123 456" value={value.phone} onChange={set('phone')}
            className="w-full px-3 py-2 bg-surface border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg transition-colors" />
        </div>
      </div>
    </div>
  );
};

const emptyPerson = (): PersonFields => ({ firstName: '', lastName: '', email: '', phone: '' });


export const SuperAdminSchools: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: schools, loading, error: fetchError, refetch } = useQuery<School[]>('/admin/schools');
  const { mutate: createSchool, loading: creating, error: createError } = useMutation('/admin/schools', 'post');

  // Modal
  const [addSchoolOpen, setAddSchoolOpen] = useState(false);

  // Section 1 — Institution
  const [schoolName, setSchoolName]           = useState('');
  const [schoolType, setSchoolType]           = useState<'secondary'|'primary'|'mixed'>('secondary');
  const [schoolDistrict, setSchoolDistrict]   = useState('Lilongwe');
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free'|'basic'|'premium'|'enterprise'>('basic');
  const [contactEmail, setContactEmail]       = useState('');
  const [contactPhone, setContactPhone]       = useState('');
  const [contactAddress, setContactAddress]   = useState('');

  // Feature Flags
  const [featuresAttendance, setFeaturesAttendance] = useState(true);
  const [featuresGrades, setFeaturesGrades] = useState(true);
  const [featuresFees, setFeaturesFees] = useState(true);
  const [featuresCommunication, setFeaturesCommunication] = useState(true);

  // Section 2 — School Director (required)
  const [director, setDirector] = useState<PersonFields>(emptyPerson());

  // Section 3 — Head Teacher (optional)
  const [addHT, setAddHT] = useState(false);
  const [headTeacher, setHeadTeacher] = useState<PersonFields>(emptyPerson());

  // School code
  const [useCustomInitials, setUseCustomInitials] = useState(false);
  const [customInitials, setCustomInitials]       = useState('');
  const [previewCode, setPreviewCode]             = useState('');
  const [codeStatus, setCodeStatus]               = useState<'idle'|'checking'|'available'|'taken'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => {
    if (!schoolName.trim()) { setPreviewCode(''); setCodeStatus('idle'); return; }
    const yr = new Date().getFullYear();
    const ov = useCustomInitials && /^[A-Z]{2,5}$/.test(customInitials.toUpperCase()) ? customInitials.toUpperCase() : undefined;
    setPreviewCode(generateSchoolCode(schoolName, yr, ov));
    setCodeStatus('idle');
  }, [schoolName, useCustomInitials, customInitials]);

  const checkUnique = useCallback((code: string) => {
    if (!code) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCodeStatus('checking');
      try {
        const res = await api.get(`/admin/schools/check-code?code=${encodeURIComponent(code)}`);
        setCodeStatus(res.data?.data?.available ? 'available' : 'taken');
      } catch { setCodeStatus('idle'); }
    }, 600);
  }, []);

  useEffect(() => { if (previewCode) checkUnique(previewCode); }, [previewCode, checkUnique]);

  const resetForm = () => {
    setSchoolName(''); setSchoolType('secondary'); setSchoolDistrict('Lilongwe');
    setSubscriptionPlan('basic'); setContactEmail(''); setContactPhone(''); setContactAddress('');
    setDirector(emptyPerson()); setAddHT(false); setHeadTeacher(emptyPerson());
    setUseCustomInitials(false); setCustomInitials(''); setPreviewCode(''); setCodeStatus('idle');
    setFeaturesAttendance(true); setFeaturesGrades(true); setFeaturesFees(true); setFeaturesCommunication(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || !director.firstName || !director.lastName || !director.email) return;
    if (codeStatus === 'taken') return;
    if (addHT && (!headTeacher.firstName || !headTeacher.lastName || !headTeacher.email)) return;
    const payload: Record<string, unknown> = {
      name: schoolName, type: schoolType, district: schoolDistrict, country: 'Malawi',
      subscriptionPlan,
      featuresAttendance,
      featuresGrades,
      featuresFees,
      featuresCommunication,
      ...(contactEmail && { email: contactEmail }),
      ...(contactPhone && { phone: contactPhone }),
      ...(contactAddress && { address: contactAddress }),
      schoolDirector: {
        firstName: director.firstName, lastName: director.lastName,
        email: director.email, ...(director.phone && { phone: director.phone }),
      },
    };
    if (addHT) {
      payload.headTeacher = {
        firstName: headTeacher.firstName, lastName: headTeacher.lastName,
        email: headTeacher.email, ...(headTeacher.phone && { phone: headTeacher.phone }),
      };
    }
    if (useCustomInitials && /^[A-Z]{2,5}$/.test(customInitials.toUpperCase())) {
      payload.customInitials = customInitials.toUpperCase();
    }
    try { await createSchool(payload); resetForm(); setAddSchoolOpen(false); refetch(); }
    catch (err) { console.error('Failed to onboard school:', err); }
  };

  const filtered = (schools || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.schoolCode.toLowerCase().includes(search.toLowerCase()) ||
    s.subscriptionPlan.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (a: boolean) => a
    ? 'bg-secondary-container text-on-secondary-container'
    : 'bg-error-container text-on-error-container';

  const planBadge: Record<string, string> = {
    free: 'bg-surface-container text-on-surface-variant',
    basic: 'bg-secondary-container text-on-secondary-container',
    premium: 'bg-primary-container text-on-primary-container',
    enterprise: 'bg-tertiary-container text-on-tertiary-container',
  };

  const CodeBadge = () => {
    if (!previewCode) return null;
    if (codeStatus === 'checking') return <span className="flex items-center gap-1 text-[10px] text-on-surface-variant"><span className="material-symbols-outlined text-xs animate-spin">refresh</span>Checking...</span>;
    if (codeStatus === 'available') return <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold"><span className="material-symbols-outlined text-xs">check_circle</span>Available</span>;
    if (codeStatus === 'taken') return <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold"><span className="material-symbols-outlined text-xs">error</span>Already in use</span>;
    return null;
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 px-margin-mobile md:px-margin-desktop pt-20 pb-margin-desktop overflow-y-auto bg-surface-bright">

          <div className="mb-lg flex flex-col sm:flex-row sm:justify-between sm:items-end gap-md">
            <div>
              <h1 className="dash-page-title mb-xs">Schools Management</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Register, update, and manage school institutions onboarded to MyKlasi.</p>
            </div>
            <button onClick={() => setAddSchoolOpen(true)}
              className="flex items-center justify-center gap-sm bg-primary text-on-primary px-4 py-2.5 rounded-lg hover:bg-primary-container transition-colors shadow-sm self-start sm:self-auto active:scale-95 text-sm font-bold">
              <span className="material-symbols-outlined text-sm">add</span>Onboard New School
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-lg">
            {[
              { label: 'Total Institutions', value: loading ? '...' : (schools?.length || 0), icon: 'domain' },
              { label: 'Active', value: loading ? '...' : (schools?.filter(s => s.isActive).length || 0), icon: 'verified' },
              { label: 'Basic Plans', value: loading ? '...' : (schools?.filter(s => s.subscriptionPlan === 'basic').length || 0), icon: 'workspace_premium' },
              { label: 'Premium Plans', value: loading ? '...' : (schools?.filter(s => s.subscriptionPlan === 'premium').length || 0), icon: 'workspace_premium' },
            ].map(c => (
              <div key={c.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-4 hover:border-primary transition-all">
                <div className="p-2 bg-surface-container-low rounded-lg text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">{c.label}</p>
                  <p className="font-bold text-on-background mt-0.5 text-lg">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {fetchError && <div className="mb-md p-4 bg-error-container border border-error/20 text-on-error-container text-xs rounded-lg">Error: {fetchError}</div>}

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low gap-4 flex-wrap">
              <h2 className="font-bold text-on-surface text-base">Registered Schools</h2>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input className="pl-9 pr-4 py-1.5 border border-outline-variant rounded-full bg-surface-container-lowest focus:outline-none focus:border-primary text-xs w-64"
                  placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant">
                    {['School Name', 'Code', 'Plan', 'Users', 'District', 'Status'].map(h => (
                      <th key={h} className="p-md font-semibold text-xs text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs text-on-surface">
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-on-surface-variant text-sm">Loading schools...</td></tr>
                  ) : filtered.map((s, i) => (
                    <tr key={i} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/super-admin/schools/${s.id}`)}>
                      <td className="p-md font-bold text-sm text-primary group-hover:underline underline-offset-2">{s.name}</td>
                      <td className="p-md text-on-surface-variant font-mono font-semibold">{s.schoolCode}</td>
                      <td className="p-md">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${planBadge[s.subscriptionPlan] || 'bg-surface-container text-on-surface-variant'}`}>
                          {s.subscriptionPlan}
                        </span>
                      </td>
                      <td className="p-md text-on-surface-variant">{s._count?.users ?? 0}</td>
                      <td className="p-md text-on-surface-variant">{s.district}</td>
                      <td className="p-md text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${statusColor(s.isActive)}`}>
                            {s.isActive ? 'Active' : 'Suspended'}
                          </span>
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filtered.length === 0 && (
                <div className="py-12 text-center text-on-surface-variant text-sm">No schools registered or matched.</div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ════════ ONBOARDING MODAL ════════ */}
      {addSchoolOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto animate-scale-in">

            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-outline-variant shrink-0">
              <div>
                <h2 className="font-bold text-primary flex items-center gap-2 text-lg">
                  <span className="material-symbols-outlined">domain_add</span>Onboard New School
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Creates the school record, user accounts, and sends welcome emails with credentials.</p>
              </div>
              <button onClick={() => { resetForm(); setAddSchoolOpen(false); }}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 flex items-center justify-center transition-colors shrink-0">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {createError && (
              <div className="mx-6 mt-4 p-3 bg-error-container border border-error/20 text-on-error-container text-xs rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-error shrink-0">error</span>
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* ── SECTION 1: Institution Details ─────── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-black shrink-0">1</span>
                  <span className="text-sm font-bold text-on-surface">Institution Details</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">School / Institution Name *</label>
                  <input type="text" placeholder="e.g. Oakwood Preparatory Academy"
                    value={schoolName} onChange={e => setSchoolName(e.target.value)} required
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg transition-colors" />
                </div>

                {/* School Code Panel */}
                <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Auto-Generated School Code</span>
                    <CodeBadge />
                  </div>
                  {previewCode
                    ? <div className="font-mono text-xl font-black tracking-widest text-primary bg-surface-container rounded-lg px-4 py-2 text-center border border-primary/20 select-all">{previewCode}</div>
                    : <div className="font-mono text-sm text-on-surface-variant/50 text-center py-2 italic">Enter school name above to preview code</div>
                  }
                  <div className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => { setUseCustomInitials(v => !v); setCustomInitials(''); }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${useCustomInitials ? 'bg-primary border-primary' : 'bg-surface-container border-outline-variant'}`}
                      role="switch" aria-checked={useCustomInitials}>
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${useCustomInitials ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Override Initials (Super Admin)</span>
                  </div>
                  {useCustomInitials && (
                    <div className="animate-fade-in">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Custom Initials (2-5 letters)</label>
                      <input type="text" placeholder="e.g. OPA" maxLength={5}
                        value={customInitials}
                        onChange={e => setCustomInitials(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                        className="w-32 px-4 py-1.5 bg-surface border border-outline-variant text-on-surface text-sm font-mono font-bold outline-none focus:border-primary rounded-lg uppercase tracking-widest" />
                      {customInitials && !/^[A-Z]{2,5}$/.test(customInitials) && (
                        <p className="text-[10px] text-red-500 mt-1">Must be 2-5 uppercase letters.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Type + District */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">School Type *</label>
                    <select value={schoolType} onChange={e => setSchoolType(e.target.value as typeof schoolType)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg">
                      <option value="secondary">Secondary</option>
                      <option value="primary">Primary</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">District *</label>
                    <select value={schoolDistrict} onChange={e => setSchoolDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg">
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Subscription Plan */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Subscription Plan *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PLANS.map(plan => (
                      <button key={plan.value} type="button"
                        onClick={() => setSubscriptionPlan(plan.value as typeof subscriptionPlan)}
                        className={`flex flex-col items-center p-2.5 rounded-xl border-2 text-center transition-all ${
                          subscriptionPlan === plan.value
                            ? 'border-primary bg-primary-container'
                            : 'border-outline-variant bg-surface-container-low hover:border-outline'
                        }`}>
                        <span className={`text-sm font-black capitalize ${subscriptionPlan === plan.value ? 'text-on-primary-container' : 'text-on-surface'}`}>{plan.label}</span>
                        <span className="text-[9px] text-on-surface-variant mt-0.5 leading-tight">{plan.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feature Gating Checklist */}
                <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Granted Feature Modules</span>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-start gap-3 p-3 rounded-xl border border-outline-variant hover:border-primary/50 transition-all cursor-pointer ${featuresAttendance ? 'bg-primary-container/20 border-primary/30' : 'bg-surface-container-lowest'}`}>
                      <input type="checkbox" checked={featuresAttendance} onChange={e => setFeaturesAttendance(e.target.checked)} className="mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold text-on-surface flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">event_available</span> Attendance</span>
                        <span className="block text-[9px] text-on-surface-variant leading-tight mt-0.5">Track check-ins, registers & analytics</span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-xl border border-outline-variant hover:border-primary/50 transition-all cursor-pointer ${featuresGrades ? 'bg-primary-container/20 border-primary/30' : 'bg-surface-container-lowest'}`}>
                      <input type="checkbox" checked={featuresGrades} onChange={e => setFeaturesGrades(e.target.checked)} className="mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold text-on-surface flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">school</span> Grades & Academics</span>
                        <span className="block text-[9px] text-on-surface-variant leading-tight mt-0.5">Subject sheets, marks & report cards</span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-xl border border-outline-variant hover:border-primary/50 transition-all cursor-pointer ${featuresFees ? 'bg-primary-container/20 border-primary/30' : 'bg-surface-container-lowest'}`}>
                      <input type="checkbox" checked={featuresFees} onChange={e => setFeaturesFees(e.target.checked)} className="mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold text-on-surface flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">payments</span> Finance & Fees</span>
                        <span className="block text-[9px] text-on-surface-variant leading-tight mt-0.5">Billing, invoices & payment logs</span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-xl border border-outline-variant hover:border-primary/50 transition-all cursor-pointer ${featuresCommunication ? 'bg-primary-container/20 border-primary/30' : 'bg-surface-container-lowest'}`}>
                      <input type="checkbox" checked={featuresCommunication} onChange={e => setFeaturesCommunication(e.target.checked)} className="mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold text-on-surface flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">campaign</span> Communication</span>
                        <span className="block text-[9px] text-on-surface-variant leading-tight mt-0.5">Broadcasts, alerts & SMS integration</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Optional Contact Info */}
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-[10px] font-bold uppercase tracking-wider text-on-surface-variant select-none list-none">
                    <span className="material-symbols-outlined text-sm group-open:rotate-90 transition-transform">chevron_right</span>
                    School Contact Info <span className="font-normal normal-case tracking-normal ml-1">(optional)</span>
                  </summary>
                  <div className="pt-3 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Contact Email</label>
                      <input type="email" placeholder="admin@school.mw" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Phone</label>
                      <input type="text" placeholder="+265 1 234 567" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Physical Address</label>
                      <input type="text" placeholder="P.O. Box 123, Lilongwe" value={contactAddress} onChange={e => setContactAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                    </div>
                  </div>
                </details>
              </div>

              <div className="border-t border-outline-variant" />

              {/* ── SECTION 2: School Director ─────── */}
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-black shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">School Director Account <span className="text-xs font-normal text-error">required</span></p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed">
                      Institutional owner and signatory. Gets the <strong className="text-on-surface font-mono">school_director</strong> role: Director portal, financial overview, setup wizard, and reports.
                    </p>
                  </div>
                </div>
                <PersonSection label="School Director" icon="account_balance" accentClass="text-primary" value={director} onChange={setDirector} required />
              </div>

              <div className="border-t border-outline-variant" />

              {/* ── SECTION 3: Head Teacher ─────── */}
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-black shrink-0 mt-0.5 transition-colors ${addHT ? 'bg-secondary text-on-secondary' : 'bg-outline-variant text-on-surface-variant'}`}>3</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-on-surface">Head Teacher Account <span className="text-xs font-normal text-on-surface-variant">(optional)</span></p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-on-surface-variant">{addHT ? 'Will be created' : 'Skip for now'}</span>
                        <button type="button"
                          onClick={() => { setAddHT(v => !v); if (addHT) setHeadTeacher(emptyPerson()); }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${addHT ? 'bg-secondary border-secondary' : 'bg-surface-container border-outline-variant'}`}
                          role="switch" aria-checked={addHT}>
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${addHT ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed">
                      Day-to-day academic lead. Gets <strong className="text-on-surface font-mono">head_teacher</strong> role: attendance, grades, timetable, staff management.
                    </p>
                  </div>
                </div>

                {addHT ? (
                  <div className="animate-fade-in">
                    <PersonSection label="Head Teacher" icon="school" accentClass="text-secondary" value={headTeacher} onChange={setHeadTeacher} required />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container/40 px-4 py-5 text-center text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-2xl text-outline block mb-1">person_add</span>
                    Toggle on to create a Head Teacher account now, or add one later via the school's Users panel.
                  </div>
                )}
              </div>

              {/* Summary Banner */}
              <div className="rounded-xl bg-primary-container/40 border border-primary/20 px-4 py-3 flex items-start gap-3 text-xs">
                <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">info</span>
                <span className="text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface">What happens: </strong>
                  School created on the <strong className="capitalize">{subscriptionPlan}</strong> plan.
                  {' '}<strong>{director.firstName || 'The Director'}</strong> will receive a welcome email with login credentials.
                  {addHT && headTeacher.email && <> <strong>{headTeacher.firstName || 'The Head Teacher'}</strong> will also receive separate credentials.</>}
                  {' '}All accounts must change password on first login.
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant">
                <button type="button" onClick={() => { resetForm(); setAddSchoolOpen(false); }}
                  className="px-5 py-2.5 bg-surface-container border border-outline-variant text-outline hover:text-on-surface rounded-lg font-bold transition-all text-sm">
                  Cancel
                </button>
                <button type="submit"
                  disabled={creating || codeStatus === 'taken' || !previewCode || !schoolName || !director.email}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {creating
                    ? <><span className="material-symbols-outlined text-sm animate-spin">refresh</span>Onboarding...</>
                    : <><span className="material-symbols-outlined text-sm">domain_add</span>Onboard School</>
                  }
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
