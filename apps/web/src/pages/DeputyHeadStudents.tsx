import React, { useState } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';
import { useQuery, useMutation } from '../hooks/useApi';
import { api } from '../services/api';

// ── API shapes ──────────────────────────────────────────────
interface ClassRecord {
  id: string;
  name: string;
  displayName: string;
  stream?: string;
  _count?: { studentProfiles: number };
}

interface ParentRelation {
  parent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    username?: string | null;
    tempPassword?: string | null;
  };
  relationship: string;
}

interface StudentProfile {
  id: string;
  admissionNumber: string;
  gender?: string;
  boardingStatus?: string;
  dateOfBirth?: string;
  status: string;
  enrollmentDate?: string;
  class?: ClassRecord;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    photoUrl?: string;
    username?: string | null;
    tempPassword?: string | null;
  };
  parentRelations: ParentRelation[];
}

// ── Helper ───────────────────────────────────────────────────
const avatarCode = (firstName: string, lastName: string) =>
  `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

const boardingLabel = (status?: string) => {
  if (!status) return '—';
  return status === 'boarding' ? 'Boarding' : 'Day Scholar';
};

export const DeputyHeadStudents: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassId, setFilterClassId] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  // Success toast
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const showSuccessToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 6000);
  };

  // ── API Hooks ────────────────────────────────────────────────
  const { data: students, loading, error: fetchError, refetch } =
    useQuery<StudentProfile[]>('/people/students');

  const { data: classes, loading: classesLoading } =
    useQuery<ClassRecord[]>('/schools/classes');

  const { mutate: registerStudent, loading: registering, error: registerError } =
    useMutation('/people/students', 'post');

  // ── Form state ───────────────────────────────────────────────
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newGender, setNewGender] = useState('male');
  const [newDOB, setNewDOB] = useState('');
  const [newClassId, setNewClassId] = useState('');
  const [newBoardingStatus, setNewBoardingStatus] = useState('day');
  const [newEnrollmentDate, setNewEnrollmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  // Guardian
  const [guardianFullName, setGuardianFullName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('parent');

  const resetForm = () => {
    setNewFirstName('');
    setNewLastName('');
    setNewGender('male');
    setNewDOB('');
    setNewClassId('');
    setNewBoardingStatus('day');
    setNewEnrollmentDate(new Date().toISOString().split('T')[0]);
    setGuardianFullName('');
    setGuardianPhone('');
    setGuardianEmail('');
    setGuardianRelationship('parent');
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newClassId || !guardianFullName || !guardianPhone) return;

    const studentName = `${newFirstName} ${newLastName}`;

    try {
      const res = await registerStudent({
        firstName: newFirstName,
        lastName: newLastName,
        gender: newGender,
        dateOfBirth: newDOB || undefined,
        classId: newClassId,
        boardingStatus: newBoardingStatus,
        enrollmentDate: newEnrollmentDate || undefined,
        guardian: {
          fullName: guardianFullName,
          phone: guardianPhone,
          email: guardianEmail || undefined,
          relationship: guardianRelationship,
        },
      });
      resetForm();
      setIsRegisterModalOpen(false);
      refetch();

      const stdUsername = res?.student?.admissionNumber || res?.user?.username;
      const stdPassword = res?.tempPassword;
      const pUsername = res?.parentUsername;
      const pPassword = res?.parentTempPassword;

      let msg = `✅ ${studentName} enrolled! Username: "${stdUsername}", Password: "${stdPassword}"`;
      if (pUsername && pPassword) {
        msg += ` | Guardian Username: "${pUsername}", Password: "${pPassword}"`;
      } else if (guardianEmail) {
        msg += `. A welcome email was sent to guardian at ${guardianEmail}.`;
      }
      showSuccessToast(msg);
    } catch (err) {
      console.error('Failed to register student:', err);
    }
  };

  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to delete this student? This action will disable their user account, delete their student profile, and remove all parent associations.')) {
      return;
    }

    setDeletingStudentId(studentId);
    try {
      await api.delete(`/people/students/${studentId}`);
      showSuccessToast('Student successfully deleted.');
      setSelectedStudent(null);
      refetch();
    } catch (err: any) {
      console.error('Failed to delete student:', err);
      alert(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setDeletingStudentId(null);
    }
  };

  // ── Filtered list ────────────────────────────────────────────
  const filteredStudents = (students || []).filter(s => {
    const fullName = `${s.user.firstName} ${s.user.lastName}`.toLowerCase();
    const parentName = s.parentRelations?.[0]
      ? `${s.parentRelations[0].parent.firstName} ${s.parentRelations[0].parent.lastName}`.toLowerCase()
      : '';
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      parentName.includes(searchTerm.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClassId === 'All' || s.class?.id === filterClassId;
    return matchesSearch && matchesClass;
  });

  const boardingCount = (students || []).filter(s => s.boardingStatus === 'boarding').length;
  const dayCount = (students || []).filter(s => s.boardingStatus !== 'boarding').length;

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">

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

        {/* Page Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Administration</span>
              <span>/</span>
              <span className="text-primary font-bold">Students</span>
            </nav>
            <h1 className="dash-page-title">Student Directory</h1>
            <p className="font-body-md text-on-surface-variant">
              Access emergency parent contact details, fee standings, and student profiles.
            </p>
          </div>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm self-start md:self-end text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Register New Student
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop mb-8">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Total Enrolled</p>
              <h3 className="font-headline-md text-primary mt-1">
                {loading ? '…' : `${students?.length ?? 0} Students`}
              </h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined">single_bed</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Boarding Students</p>
              <h3 className="font-headline-md text-secondary mt-1">
                {loading ? '…' : `${boardingCount} Scholars`}
              </h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined">directions_walk</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Day Scholars</p>
              <h3 className="font-headline-md text-tertiary mt-1">
                {loading ? '…' : `${dayCount} Scholars`}
              </h3>
            </div>
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-error-container border border-error/20 text-on-error-container text-xs rounded-lg">
            Failed to load students: {fetchError}
          </div>
        )}

        {/* Table panel */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          {/* Search + Class filters */}
          <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96 flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
              <input
                type="text"
                placeholder="Search student, parent, or admission no…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
              <button
                onClick={() => setFilterClassId('All')}
                className={`px-4 py-2 rounded-full font-label-md active:scale-95 transition-all text-xs whitespace-nowrap ${
                  filterClassId === 'All'
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                All Classes
              </button>
              {!classesLoading && (classes || []).map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setFilterClassId(cls.id)}
                  className={`px-4 py-2 rounded-full font-label-md active:scale-95 transition-all text-xs whitespace-nowrap ${
                    filterClassId === cls.id
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {cls.displayName}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant font-bold text-label-md text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">Adm. No.</th>
                  <th className="px-6 py-4 text-center">Class</th>
                  <th className="px-6 py-4 text-center">Type</th>
                  <th className="px-6 py-4">Parent / Guardian</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-body-md divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      Loading students…
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((s, i) => {
                    const firstParent = s.parentRelations?.[0]?.parent;
                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-surface-container-low transition-colors cursor-pointer ${i % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}
                        onClick={() => setSelectedStudent(s)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {s.user.photoUrl ? (
                              <img src={s.user.photoUrl} alt={s.user.firstName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-sm">
                                {avatarCode(s.user.firstName, s.user.lastName)}
                              </div>
                            )}
                            <span className="font-bold text-on-surface">{s.user.firstName} {s.user.lastName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-on-surface-variant font-mono text-xs">{s.admissionNumber}</td>
                        <td className="px-6 py-4 text-center text-on-surface-variant font-medium">{s.class?.displayName ?? '—'}</td>
                        <td className="px-6 py-4 text-center text-on-surface-variant font-medium">{boardingLabel(s.boardingStatus)}</td>
                        <td className="px-6 py-4">
                          {firstParent ? (
                            <div>
                              <p className="font-bold text-on-surface text-xs">{firstParent.firstName} {firstParent.lastName}</p>
                              <p className="text-xs text-on-surface-variant font-medium">{firstParent.phone ?? firstParent.email}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-outline italic">No guardian linked</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="px-3.5 py-1.5 border border-outline hover:border-primary text-on-surface-variant hover:text-primary transition-all font-label-sm text-xs rounded-lg font-bold"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 text-outline block">search_off</span>
                      <p className="font-body-md">No student matched your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Student Detail Side Drawer ── */}
        {selectedStudent && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setSelectedStudent(null)}
          >
            <div
              className="bg-surface-container-lowest border-l border-outline-variant h-full w-full max-w-md shadow-2xl p-6 relative flex flex-col justify-between animate-slide-in-right overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
                  <h3 className="font-headline-sm text-primary">Student Dossier</h3>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  {selectedStudent.user.photoUrl ? (
                    <img
                      src={selectedStudent.user.photoUrl}
                      alt={selectedStudent.user.firstName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-container text-primary flex items-center justify-center font-headline-md font-bold text-xl">
                      {avatarCode(selectedStudent.user.firstName, selectedStudent.user.lastName)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-headline-sm font-bold text-on-surface">
                      {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                    </h4>
                    <p className="text-sm font-bold text-primary">
                      {selectedStudent.class?.displayName ?? 'No Class'} • {boardingLabel(selectedStudent.boardingStatus)}
                    </p>
                    <p className="text-xs text-on-surface-variant font-mono mt-0.5">{selectedStudent.admissionNumber}</p>
                  </div>
                </div>

                <div className="space-y-4 border-y border-outline-variant py-6">
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase">Gender</span>
                    <span className="text-body-md text-on-surface font-semibold capitalize">{selectedStudent.gender ?? '—'}</span>
                  </div>
                  {selectedStudent.dateOfBirth && (
                    <div>
                      <span className="block text-xs font-bold text-outline uppercase">Date of Birth</span>
                      <span className="text-body-md text-on-surface font-semibold">
                        {new Date(selectedStudent.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase">Status</span>
                    <span className={`inline-block px-2.5 py-0.5 mt-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                      selectedStudent.status === 'active'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-error-container text-on-error-container'
                    }`}>{selectedStudent.status}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase">Email</span>
                    <span className="text-body-md text-on-surface font-semibold break-all">{selectedStudent.user.email}</span>
                  </div>
                </div>

                {/* Temporary Login Details (shows only if password hasn't been changed yet) */}
                {(selectedStudent.user.tempPassword || selectedStudent.parentRelations.some(r => r.parent.tempPassword)) && (
                  <div className="bg-warning-container/30 border border-warning/30 rounded-xl p-4 my-4 space-y-3">
                    <div className="flex items-center gap-2 text-warning font-bold">
                      <span className="material-symbols-outlined text-[20px]">security</span>
                      <h5 className="font-bold text-xs uppercase tracking-wider">Temporary Login Credentials</h5>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      These temporary credentials will disappear once the user logs in and changes their password.
                    </p>

                    {selectedStudent.user.tempPassword && (
                      <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/60 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-primary">Student Account</span>
                          <span className="px-1.5 py-0.5 bg-warning/15 text-warning text-[10px] rounded font-semibold uppercase">Pending Use</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          <div className="flex justify-between items-center bg-surface-container p-2 rounded">
                            <div className="overflow-hidden mr-2">
                              <span className="block text-[10px] text-outline uppercase font-bold">Username</span>
                              <span className="font-mono font-semibold break-all">{selectedStudent.user.username || selectedStudent.admissionNumber}</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedStudent.user.username || selectedStudent.admissionNumber);
                                showSuccessToast('Student username copied!');
                              }}
                              className="text-primary hover:text-primary-hover flex items-center justify-center p-1 rounded hover:bg-surface-container-high flex-shrink-0"
                              title="Copy Username"
                            >
                              <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                          </div>
                          <div className="flex justify-between items-center bg-surface-container p-2 rounded">
                            <div className="overflow-hidden mr-2">
                              <span className="block text-[10px] text-outline uppercase font-bold">Temporary Password</span>
                              <span className="font-mono font-semibold text-warning break-all">{selectedStudent.user.tempPassword}</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedStudent.user.tempPassword || '');
                                showSuccessToast('Student temporary password copied!');
                              }}
                              className="text-primary hover:text-primary-hover flex items-center justify-center p-1 rounded hover:bg-surface-container-high flex-shrink-0"
                              title="Copy Password"
                            >
                              <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedStudent.parentRelations.map((rel, idx) => rel.parent.tempPassword && (
                      <div key={idx} className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/60 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-primary">Parent/Guardian ({rel.relationship})</span>
                          <span className="px-1.5 py-0.5 bg-warning/15 text-warning text-[10px] rounded font-semibold uppercase">Pending Use</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          <div className="flex justify-between items-center bg-surface-container p-2 rounded">
                            <div className="overflow-hidden mr-2">
                              <span className="block text-[10px] text-outline uppercase font-bold">Username / Email</span>
                              <span className="font-mono font-semibold break-all">{rel.parent.email || rel.parent.username}</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(rel.parent.email || rel.parent.username || '');
                                showSuccessToast('Parent username copied!');
                              }}
                              className="text-primary hover:text-primary-hover flex items-center justify-center p-1 rounded hover:bg-surface-container-high flex-shrink-0"
                              title="Copy Username"
                            >
                              <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                          </div>
                          <div className="flex justify-between items-center bg-surface-container p-2 rounded">
                            <div className="overflow-hidden mr-2">
                              <span className="block text-[10px] text-outline uppercase font-bold">Temporary Password</span>
                              <span className="font-mono font-semibold text-warning break-all">{rel.parent.tempPassword}</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(rel.parent.tempPassword || '');
                                showSuccessToast('Parent temporary password copied!');
                              }}
                              className="text-primary hover:text-primary-hover flex items-center justify-center p-1 rounded hover:bg-surface-container-high flex-shrink-0"
                              title="Copy Password"
                            >
                              <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Guardian section */}
                <div className="py-6 space-y-4">
                  <h5 className="font-bold text-primary text-sm">Parent / Guardian Contact</h5>
                  {selectedStudent.parentRelations.length > 0 ? (
                    selectedStudent.parentRelations.map((rel, idx) => (
                      <div key={idx} className="bg-surface-container p-4 rounded-xl border border-outline-variant space-y-2">
                        <div>
                          <span className="block text-xs font-bold text-outline uppercase">Name</span>
                          <span className="text-body-md text-on-surface font-semibold">
                            {rel.parent.firstName} {rel.parent.lastName}
                          </span>
                          <span className="ml-2 text-xs text-on-surface-variant capitalize">({rel.relationship})</span>
                        </div>
                        {rel.parent.phone && (
                          <div>
                            <span className="block text-xs font-bold text-outline uppercase">Phone</span>
                            <span className="text-body-md text-on-surface font-semibold">{rel.parent.phone}</span>
                          </div>
                        )}
                        <div>
                          <span className="block text-xs font-bold text-outline uppercase">Email</span>
                          <span className="text-body-md text-on-surface font-semibold break-all">{rel.parent.email}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-outline italic">No guardian linked to this student.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 border-t border-outline-variant pt-4">
                <button className="flex-1 px-4 py-2.5 border border-outline hover:bg-surface-container rounded-lg font-bold text-xs text-on-surface-variant transition-all">
                  Edit Profile
                </button>
                <button
                  onClick={() => handleDeleteStudent(selectedStudent.id)}
                  disabled={deletingStudentId === selectedStudent.id}
                  className="px-3 py-2.5 border border-error text-error hover:bg-error/10 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 disabled:opacity-50 flex-shrink-0"
                  title="Delete Student"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  {deletingStudentId === selectedStudent.id ? 'Deleting...' : 'Delete'}
                </button>
                {selectedStudent.parentRelations[0]?.parent.phone && (
                  <a
                    href={`tel:${selectedStudent.parentRelations[0].parent.phone}`}
                    className="flex-1 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">phone</span>
                    Call Guardian
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Register Student Modal ── */}
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-slide-in-bottom max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">person_add</span>
                  Register New Scholar
                </h3>
                <button
                  onClick={() => { resetForm(); setIsRegisterModalOpen(false); }}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {registerError && (
                <div className="mb-4 p-3 bg-error-container border border-error/20 text-on-error-container text-xs rounded-lg">
                  Registration failed: {registerError}
                </div>
              )}

              <form onSubmit={handleRegisterStudent} className="space-y-4">
                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blessings"
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
                      placeholder="e.g. Gondwe"
                      value={newLastName}
                      onChange={e => setNewLastName(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                </div>

                {/* Class + Gender + Type */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Class *</label>
                    <select
                      required
                      value={newClassId}
                      onChange={e => setNewClassId(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="">Select…</option>
                      {(classes || []).map(c => (
                        <option key={c.id} value={c.id}>{c.displayName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Gender</label>
                    <select
                      value={newGender}
                      onChange={e => setNewGender(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Type</label>
                    <select
                      value={newBoardingStatus}
                      onChange={e => setNewBoardingStatus(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="day">Day Scholar</option>
                      <option value="boarding">Boarding</option>
                    </select>
                  </div>
                </div>

                {/* DOB + Enrollment Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Date of Birth</label>
                    <input
                      type="date"
                      value={newDOB}
                      onChange={e => setNewDOB(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Enrollment Date</label>
                    <input
                      type="date"
                      value={newEnrollmentDate}
                      onChange={e => setNewEnrollmentDate(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                </div>

                {/* Guardian section */}
                <div className="border-t border-outline-variant pt-4 mt-2">
                  <h5 className="font-bold text-primary text-sm mb-3">Parent / Guardian Information</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Guardian Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mr. Moses Gondwe"
                        value={guardianFullName}
                        onChange={e => setGuardianFullName(e.target.value)}
                        className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Phone *</label>
                        <input
                          type="text"
                          required
                          placeholder="+265 888 123 456"
                          value={guardianPhone}
                          onChange={e => setGuardianPhone(e.target.value)}
                          className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Email</label>
                        <input
                          type="email"
                          placeholder="guardian@email.com"
                          value={guardianEmail}
                          onChange={e => setGuardianEmail(e.target.value)}
                          className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Relationship</label>
                      <select
                        value={guardianRelationship}
                        onChange={e => setGuardianRelationship(e.target.value)}
                        className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                      >
                        <option value="parent">Parent</option>
                        <option value="guardian">Guardian</option>
                        <option value="sibling">Sibling</option>
                        <option value="uncle">Uncle</option>
                        <option value="aunt">Aunt</option>
                        <option value="grandparent">Grandparent</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setIsRegisterModalOpen(false); }}
                    className="px-6 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container active:scale-95 transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registering}
                    className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs disabled:opacity-50"
                  >
                    {registering ? 'Registering…' : 'Register Student'}
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

export default DeputyHeadStudents;
