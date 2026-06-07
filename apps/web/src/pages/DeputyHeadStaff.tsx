import { useState } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';
import { useQuery, useMutation } from '../hooks/useApi';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  photoUrl?: string;
  createdAt: string;
}

const STAFF_ROLES = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'deputy_head', label: 'Deputy Head' },
  { value: 'bursar', label: 'Bursar' },
];

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History',
  'Geography', 'English', 'Chichewa', 'Social Studies', 'Religious Education',
  'Agriculture', 'Business Studies', 'Computer Studies', 'Life Skills',
];

const avatarCode = (firstName: string, lastName: string) =>
  `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    head_teacher: 'bg-primary-container text-on-primary-container',
    deputy_head: 'bg-secondary-container text-on-secondary-container',
    teacher: 'bg-tertiary-container text-on-tertiary-container',
    bursar: 'bg-surface-container text-on-surface',
  };
  return map[role] ?? 'bg-surface-container text-on-surface';
};

export const DeputyHeadStaff = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Live data from the API ──
  const { data: staff, loading, error: fetchError, refetch } = useQuery<StaffMember[]>('/people/staff');
  const { mutate: onboardStaff, loading: onboarding, error: onboardError } = useMutation('/people/staff', 'post');

  // ── Form state ──
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('teacher');
  const [newSubject, setNewSubject] = useState('Mathematics');

  const resetForm = () => {
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('teacher');
    setNewSubject('Mathematics');
  };

  const handleOnboardTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newEmail) return;

    try {
      await onboardStaff({
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        phone: newPhone || undefined,
        role: newRole,
      });
      resetForm();
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to onboard staff:', err);
    }
  };

  const filteredStaff = (staff || []).filter(t => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'All' || t.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const activeCount = (staff || []).filter(t => t.isActive).length;
  const inactiveCount = (staff || []).filter(t => !t.isActive).length;

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">

        {/* Page Header */}
        <div className="py-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Administration</span>
              <span>/</span>
              <span className="text-primary font-bold">Staff</span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">Staff Management</h1>
            <p className="font-body-md text-on-surface-variant">Monitor school staffing levels, assign class supervisors, and log teacher attendance.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm self-start sm:self-end"
          >
            <span className="material-symbols-outlined">add</span>
            Onboard Teacher
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop mb-8">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined">supervisor_account</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Total Staff</p>
              <h3 className="font-headline-md text-primary mt-1">{loading ? '…' : (staff?.length ?? 0)}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Active</p>
              <h3 className="font-headline-md text-secondary mt-1">{loading ? '…' : activeCount}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined">event_busy</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Inactive</p>
              <h3 className="font-headline-md text-tertiary mt-1">{loading ? '…' : inactiveCount}</h3>
            </div>
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-error-container border border-error/20 text-on-error-container text-xs rounded-lg">
            Failed to load staff: {fetchError}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
            <input
              type="text"
              placeholder="Search teacher by name or email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
            {['All', 'teacher', 'deputy_head', 'bursar'].map(role => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-full font-label-md active:scale-95 transition-all whitespace-nowrap uppercase text-xs ${
                  filterRole === role
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {role === 'All' ? 'All Staff' : role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Directory Grid */}
        {loading ? (
          <div className="py-16 text-center text-on-surface-variant">Loading staff…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-gutter-desktop">
            {filteredStaff.length > 0 ? filteredStaff.map(t => (
              <div
                key={t.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:border-primary transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {t.photoUrl ? (
                        <img src={t.photoUrl} alt={t.firstName} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container font-headline-sm flex items-center justify-center font-bold text-lg">
                          {avatarCode(t.firstName, t.lastName)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-title-lg text-on-surface font-bold">{t.firstName} {t.lastName}</h3>
                        <span className="font-body-sm text-outline capitalize">{t.role.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${roleBadge(t.role)}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 py-4 my-4 border-y border-outline-variant">
                    <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                      <span className="truncate">{t.email}</span>
                    </div>
                    {t.phone && (
                      <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                        <span className="material-symbols-outlined text-[18px]">phone</span>
                        <span>{t.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-primary font-title-sm mt-1">
                      <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                      <span className="font-bold text-xs text-on-surface-variant">
                        Joined {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>View Profile</span>
                  </button>
                  <button className="flex-1 px-4 py-2.5 border border-outline text-on-surface-variant hover:bg-surface-container rounded-lg active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">history</span>
                    <span>Logs</span>
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl">
                <span className="material-symbols-outlined text-5xl text-outline mb-4">search_off</span>
                <h3 className="font-title-lg text-on-surface">No staff members found</h3>
                <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mt-1">
                  No staff matched your query. Try a different filter.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />

      {/* ── Onboard Teacher Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-slide-in-bottom max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">person_add</span>
                Onboard New Faculty
              </h3>
              <button
                onClick={() => { resetForm(); setIsModalOpen(false); }}
                className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {onboardError && (
              <div className="mb-4 p-3 bg-error-container border border-error/20 text-on-error-container text-xs rounded-lg">
                Onboarding failed: {onboardError}
              </div>
            )}

            <form onSubmit={handleOnboardTeacher} className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kwame"
                    value={newFirstName}
                    onChange={e => setNewFirstName(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nkrumah"
                    value={newLastName}
                    onChange={e => setNewLastName(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>
              </div>

              {/* Role + Subject */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Staff Role *</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                  >
                    {STAFF_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Primary Subject</label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">School Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="k.nkrumah@school.edu"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+265 888 000 000"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => { resetForm(); setIsModalOpen(false); }}
                  className="px-6 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container active:scale-95 transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboarding}
                  className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs disabled:opacity-50"
                >
                  {onboarding ? 'Onboarding…' : 'Onboard Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
