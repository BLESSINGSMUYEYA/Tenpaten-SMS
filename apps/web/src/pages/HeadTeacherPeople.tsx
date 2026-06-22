import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/HeadTeacherDashboard/Header';
import { Sidebar } from '../components/HeadTeacherDashboard/Sidebar';
import { BottomNav } from '../components/HeadTeacherDashboard/BottomNav';
import { useQuery, useMutation } from '../hooks/useApi';

type Tab = 'staff' | 'students';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone?: string;
  isActive: boolean;
  photoUrl?: string;
  createdAt: string;
}

interface StudentRecord {
  id: string;
  admissionNumber: string;
  class: {
    id: string;
    displayName: string;
  };
  gender?: string;
  boardingStatus: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  parentRelations: Array<{
    relationship: string;
    parent: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  }>;
}

interface ClassRecord {
  id: string;
  displayName: string;
}

export const HeadTeacherPeople: React.FC = () => {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Head Teacher';

  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('staff');

  // Success toast
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const showSuccessToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 6000);
  };

  // Search & Filter states
  const [staffSearch, setStaffSearch] = useState('');
  const [staffStatusFilter, setStaffStatusFilter] = useState('All');

  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('All');

  // API Queries
  const { data: staffList, loading: loadingStaff, refetch: refetchStaff } = useQuery<StaffMember[]>('/people/staff');
  const { data: studentList, loading: loadingStudents, refetch: refetchStudents } = useQuery<StudentRecord[]>('/people/students');
  const { data: classList } = useQuery<ClassRecord[]>('/schools/classes');

  // API Mutations
  const { mutate: addStaff, loading: creatingStaff, error: staffCreateError } = useMutation('/people/staff', 'post');
  const { mutate: enrollStudent, loading: creatingStudent, error: studentCreateError } = useMutation('/people/students', 'post');

  // Modals & Forms states
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [sFirstName, setSFirstName] = useState('');
  const [sLastName, setSLastName] = useState('');
  const [sRole, setSRole] = useState<'teacher' | 'bursar' | 'deputy_head'>('teacher');
  const [sEmail, setSEmail] = useState('');
  const [sPhone, setSPhone] = useState('');

  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [stFirstName, setStFirstName] = useState('');
  const [stLastName, setStLastName] = useState('');
  const [stClassId, setStClassId] = useState('');
  const [stGender, setStGender] = useState<'male' | 'female'>('male');
  const [stType, setStType] = useState<'day' | 'boarding'>('day');
  const [stParentName, setStParentName] = useState('');
  const [stParentPhone, setStParentPhone] = useState('');
  const [stParentEmail, setStParentEmail] = useState('');

  // Selected details drawer
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sFirstName || !sLastName) return;

    const staffName = sFirstName;

    try {
      const res = await addStaff({
        firstName: sFirstName,
        lastName: sLastName,
        email: sEmail || undefined,
        phone: sPhone || undefined,
        role: sRole,
      });

      // Clear & close
      setSFirstName('');
      setSLastName('');
      setSRole('teacher');
      setSEmail('');
      setSPhone('');
      setAddStaffOpen(false);
      refetchStaff();

      const generatedUsername = res?.username;
      const generatedPassword = res?.tempPassword;

      showSuccessToast(
        `✅ ${staffName} has been onboarded! Username: "${generatedUsername}", Password: "${generatedPassword}"` +
        (sEmail ? `. A welcome email was sent to ${sEmail}.` : '.')
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stFirstName || !stLastName || !stClassId || !stParentName || !stParentPhone) return;

    const studentName = `${stFirstName} ${stLastName}`;

    try {
      const res = await enrollStudent({
        firstName: stFirstName,
        lastName: stLastName,
        classId: stClassId,
        gender: stGender,
        boardingStatus: stType,
        guardian: {
          fullName: stParentName,
          relationship: 'Parent',
          phone: stParentPhone,
          email: stParentEmail || undefined,
        },
      });

      // Clear & close
      setStFirstName('');
      setStLastName('');
      setStClassId('');
      setStParentName('');
      setStParentPhone('');
      setStParentEmail('');
      setAddStudentOpen(false);
      refetchStudents();
      
      const stdUsername = res?.student?.admissionNumber || res?.user?.username;
      const stdPassword = res?.tempPassword;
      const pUsername = res?.parentUsername;
      const pPassword = res?.parentTempPassword;

      let msg = `✅ ${studentName} enrolled! Username: "${stdUsername}", Password: "${stdPassword}"`;
      if (pUsername && pPassword) {
        msg += ` | Guardian Username: "${pUsername}", Password: "${pPassword}"`;
      } else if (stParentEmail) {
        msg += `. A welcome email was sent to guardian at ${stParentEmail}.`;
      }
      showSuccessToast(msg);
    } catch (err) {
      console.error(err);
    }
  };

  // Derived filter logic
  const filteredStaff = (staffList || []).filter(s => {
    const q = staffSearch.toLowerCase();
    const matchesQuery =
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q);

    const matchesStatus =
      staffStatusFilter === 'All' ||
      (staffStatusFilter === 'Active' && s.isActive) ||
      (staffStatusFilter === 'Suspended' && !s.isActive);

    return matchesQuery && matchesStatus;
  });

  const filteredStudents = (studentList || []).filter(s => {
    const q = studentSearch.toLowerCase();
    const matchesQuery =
      s.user.firstName.toLowerCase().includes(q) ||
      s.user.lastName.toLowerCase().includes(q) ||
      s.admissionNumber.toLowerCase().includes(q);

    const matchesClass =
      studentClassFilter === 'All' || s.class.id === studentClassFilter;

    return matchesQuery && matchesClass;
  });

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] max-w-lg w-[90%] animate-fade-in">
          <div className="bg-primary-container border border-primary/20 text-on-primary-container px-5 py-3.5 rounded-xl shadow-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-0.5">mark_email_read</span>
            <div className="flex-1">
              <p className="text-sm font-bold">{successToast}</p>
              <p className="text-xs text-on-primary-container/70 mt-1">The recipient will need to change their password on first login.</p>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-on-primary-container/60 hover:text-on-primary-container flex-shrink-0">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      )}

      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-4 md:px-8 min-h-screen bg-surface text-on-surface transition-colors">
        {/* Page Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="dash-page-title">People Management</h1>
            <p className="text-sm text-on-surface-variant mt-1">Manage staff and student records, {fullName}.</p>
          </div>
          <div className="flex gap-3">
            {tab === 'staff' ? (
              <button
                onClick={() => setAddStaffOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">badge</span>
                Add Staff
              </button>
            ) : (
              <button
                onClick={() => {
                  if (classList && classList.length > 0 && !stClassId) {
                    setStClassId(classList[0].id);
                  }
                  setAddStudentOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Enroll Student
              </button>
            )}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-surface-container rounded-xl p-1 w-fit mb-6 shadow-inner">
          {(['staff', 'students'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm capitalize transition-all ${
                tab === t ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] align-middle mr-1.5">
                {t === 'staff' ? 'badge' : 'school'}
              </span>
              {t === 'staff' ? 'Staff' : 'Students'}
            </button>
          ))}
        </div>

        {/* STAFF SECTION */}
        {tab === 'staff' && (
          <>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between mb-6 shadow-sm">
              <div className="flex items-center gap-2 bg-surface-container border border-outline-variant rounded-lg px-3 py-2 w-full md:w-80">
                <span className="material-symbols-outlined text-outline text-[18px]">search</span>
                <input
                  className="bg-transparent outline-none text-sm text-on-surface placeholder:text-outline flex-1"
                  placeholder="Search staff by name or role..."
                  value={staffSearch}
                  onChange={e => setStaffSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['All', 'Active', 'Suspended'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStaffStatusFilter(s)}
                    className={`px-4 py-2 rounded-full font-bold text-xs uppercase transition-all ${
                      staffStatusFilter === s
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {loadingStaff ? (
              <p className="text-center py-12 text-on-surface-variant">Loading staff registry...</p>
            ) : filteredStaff.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredStaff.map(s => (
                  <div
                    key={s.id}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-primary transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container font-bold text-base flex items-center justify-center flex-shrink-0">
                            {getInitials(s.firstName, s.lastName)}
                          </div>
                          <div>
                            <h3 className="font-bold text-on-surface text-sm leading-tight">
                              {s.firstName} {s.lastName}
                            </h3>
                            <p className="text-xs text-on-surface-variant mt-0.5 capitalize">{s.role.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide ${s.isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                          {s.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>

                      <div className="space-y-2 py-3 border-y border-outline-variant/60">
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">mail</span>
                          <span className="truncate">{s.email}</span>
                        </div>
                        {s.phone && (
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px]">phone</span>
                            <span>{s.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          <span>Onboarded {new Date(s.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-surface-container-lowest border border-outline-variant rounded-xl">
                <span className="material-symbols-outlined text-5xl text-outline">search_off</span>
                <p className="font-bold text-on-surface mt-3">No staff members found</p>
              </div>
            )}
          </>
        )}

        {/* STUDENTS SECTION */}
        {tab === 'students' && (
          <>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between mb-6 shadow-sm">
              <div className="flex items-center gap-2 bg-surface-container border border-outline-variant rounded-lg px-3 py-2 w-full md:w-80">
                <span className="material-symbols-outlined text-outline text-[18px]">search</span>
                <input
                  className="bg-transparent outline-none text-sm text-on-surface placeholder:text-outline flex-1"
                  placeholder="Search by name or admission number..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={studentClassFilter}
                  onChange={e => setStudentClassFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-outline-variant bg-surface-container text-on-surface outline-none focus:border-primary"
                >
                  <option value="All">All Classes</option>
                  {(classList || []).map(c => (
                    <option key={c.id} value={c.id}>{c.displayName}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingStudents ? (
              <p className="text-center py-12 text-on-surface-variant">Loading students roster...</p>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        {['Student', 'Class', 'Boarding Status', 'Adm. No.', 'Parent / Guardian', 'Status', 'Action'].map(h => (
                          <th key={h} className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/50 text-xs">
                      {filteredStudents.length > 0 ? filteredStudents.map(s => (
                        <tr
                          key={s.id}
                          className="hover:bg-surface-container-low transition-colors cursor-pointer"
                          onClick={() => setSelectedStudent(s)}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {getInitials(s.user.firstName, s.user.lastName)}
                              </div>
                              <span className="font-bold text-on-surface">{s.user.firstName} {s.user.lastName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-on-surface-variant">{s.class.displayName}</td>
                          <td className="px-5 py-4 text-on-surface-variant capitalize">{s.boardingStatus}</td>
                          <td className="px-5 py-4 text-on-surface-variant font-mono">{s.admissionNumber}</td>
                          <td className="px-5 py-4">
                            {s.parentRelations?.[0] ? (
                              <>
                                <p className="font-bold text-on-surface">
                                  {s.parentRelations[0].parent.firstName} {s.parentRelations[0].parent.lastName}
                                </p>
                                <p className="text-on-surface-variant text-[11px]">{s.parentRelations[0].parent.phone}</p>
                              </>
                            ) : (
                              <span className="text-outline">No parent linked</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-label-sm font-bold text-[10px] uppercase ${s.status === 'active' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedStudent(s)}
                              className="px-3 py-1.5 border border-outline hover:border-primary text-on-surface-variant hover:text-primary transition-all text-xs font-bold rounded-lg"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="py-14 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl text-outline block mb-2">search_off</span>
                            No matching students registered.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />

      {/* Slide-in Drawer — Student Profile */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-surface-container-lowest border-l border-outline-variant h-full w-full max-w-md shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant">
                <h3 className="font-bold text-primary text-lg">Student Dossier</h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl">
                  {getInitials(selectedStudent.user.firstName, selectedStudent.user.lastName)}
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-lg">
                    {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                  </h4>
                  <p className="text-sm font-bold text-primary">{selectedStudent.class.displayName}</p>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">{selectedStudent.admissionNumber}</p>
                </div>
              </div>

              <div className="space-y-4 border-y border-outline-variant py-5 mb-5 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase tracking-wide mb-1">Gender</span>
                    <span className="font-semibold text-on-surface capitalize">{selectedStudent.gender || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase tracking-wide mb-1">Boarding Status</span>
                    <span className="font-semibold text-on-surface capitalize">{selectedStudent.boardingStatus}</span>
                  </div>
                </div>
              </div>

              {selectedStudent.parentRelations?.[0] && (
                <div className="bg-surface-container rounded-xl p-4">
                  <h5 className="font-bold text-primary text-xs uppercase tracking-wide mb-3">Parent / Guardian Contact</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-[16px] text-outline">person</span>
                      <span className="font-bold">
                        {selectedStudent.parentRelations[0].parent.firstName} {selectedStudent.parentRelations[0].parent.lastName}
                      </span>
                    </div>
                    {selectedStudent.parentRelations[0].parent.phone && (
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">phone</span>
                        <span>{selectedStudent.parentRelations[0].parent.phone}</span>
                      </div>
                    )}
                    {selectedStudent.parentRelations[0].parent.email && (
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                        <span>{selectedStudent.parentRelations[0].parent.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL — Add Staff Member */}
      {addStaffOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
              <h2 className="font-bold text-primary text-lg flex items-center gap-2">
                <span className="material-symbols-outlined">badge</span> Onboard Staff
              </h2>
              <button
                onClick={() => setAddStaffOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {staffCreateError && (
              <div className="mb-4 p-3 bg-error-container border border-error/20 text-on-error-container text-xs rounded-lg">
                Onboarding failed: {staffCreateError}
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">First Name *</label>
                  <input type="text" placeholder="e.g. Chimwemwe" value={sFirstName} onChange={e => setSFirstName(e.target.value)} required
                    className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Last Name *</label>
                  <input type="text" placeholder="e.g. Kavalo" value={sLastName} onChange={e => setSLastName(e.target.value)} required
                    className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">System Role *</label>
                  <select value={sRole} onChange={e => setSRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg">
                    <option value="teacher">Teacher</option>
                    <option value="bursar">Bursar</option>
                    <option value="deputy_head">Deputy Head</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">School Email (Optional)</label>
                  <input type="email" placeholder="name@school.com" value={sEmail} onChange={e => setSEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Phone Number</label>
                <input type="text" placeholder="+265 888 123 456" value={sPhone} onChange={e => setSPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-2">
                <button type="button" onClick={() => setAddStaffOpen(false)}
                  className="px-5 py-2.5 bg-surface-container border border-outline-variant text-outline hover:text-on-surface rounded-lg font-bold text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={creatingStaff}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 shadow-sm text-sm disabled:opacity-50">
                  {creatingStaff ? 'Saving...' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL — Enroll Student */}
      {addStudentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
              <h2 className="font-bold text-primary text-lg flex items-center gap-2">
                <span className="material-symbols-outlined">school</span> Register Scholar
              </h2>
              <button
                onClick={() => setAddStudentOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {studentCreateError && (
              <div className="mb-4 p-3 bg-error-container border border-error/20 text-on-error-container text-xs rounded-lg">
                Enrollment failed: {studentCreateError}
              </div>
            )}

            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">First Name *</label>
                  <input type="text" placeholder="e.g. Chisomo" value={stFirstName} onChange={e => setStFirstName(e.target.value)} required
                    className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Last Name *</label>
                  <input type="text" placeholder="e.g. Banda" value={stLastName} onChange={e => setStLastName(e.target.value)} required
                    className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Class *</label>
                  <select value={stClassId} onChange={e => setStClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg">
                    {(classList || []).map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Gender *</label>
                  <select value={stGender} onChange={e => setStGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Boarding Status *</label>
                  <select value={stType} onChange={e => setStType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg">
                    <option value="day">Day Scholar</option>
                    <option value="boarding">Boarding</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-outline-variant pt-4">
                <span className="block text-xs font-bold uppercase tracking-wider text-primary mb-3">Parent / Guardian Contact</span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Guardian Full Name *</label>
                    <input type="text" placeholder="e.g. Moses Banda" value={stParentName} onChange={e => setStParentName(e.target.value)} required
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Phone Number *</label>
                      <input type="text" placeholder="e.g. 0888123456" value={stParentPhone} onChange={e => setStParentPhone(e.target.value)} required
                        className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Email Address</label>
                      <input type="email" placeholder="e.g. parent@email.com" value={stParentEmail} onChange={e => setStParentEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none focus:border-primary rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-4">
                <button type="button" onClick={() => setAddStudentOpen(false)}
                  className="px-5 py-2.5 bg-surface-container border border-outline-variant text-outline hover:text-on-surface rounded-lg font-bold text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={creatingStudent}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 shadow-sm text-sm disabled:opacity-50">
                  {creatingStudent ? 'Registering...' : 'Register Scholar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HeadTeacherPeople;
