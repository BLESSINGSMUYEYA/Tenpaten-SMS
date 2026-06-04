import React, { useState } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';

type Student = {
  id: number;
  name: string;
  class: string;
  gender: 'M' | 'F';
  type: 'Boarding' | 'Day';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  attendanceRate: number;
  standing: 'Excellent' | 'Good' | 'Fair' | 'Review';
  avatarCode: string;
};

export const DeputyHeadStudents: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form states for registering a student
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('Form 3A');
  const [newGender, setNewGender] = useState<'M' | 'F'>('M');
  const [newType, setNewType] = useState<'Boarding' | 'Day'>('Day');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');

  // Initial mock students
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: 'Blessings Gondwe',
      class: 'Form 3A',
      gender: 'M',
      type: 'Day',
      parentName: 'Mr. Moses Gondwe',
      parentPhone: '+265 888 123 456',
      parentEmail: 'm.gondwe@gmail.com',
      feeStatus: 'Paid',
      attendanceRate: 98.2,
      standing: 'Excellent',
      avatarCode: 'BG',
    },
    {
      id: 2,
      name: 'Fiona Phiri',
      class: 'Form 4B',
      gender: 'F',
      type: 'Boarding',
      parentName: 'Mrs. Gertrude Phiri',
      parentPhone: '+265 999 456 789',
      parentEmail: 'g.phiri@outlook.com',
      feeStatus: 'Pending',
      attendanceRate: 92.5,
      standing: 'Good',
      avatarCode: 'FP',
    },
    {
      id: 3,
      name: 'Mwayi Mwale',
      class: 'Form 2C',
      gender: 'M',
      type: 'Day',
      parentName: 'Mr. John Mwale',
      parentPhone: '+265 881 789 012',
      parentEmail: 'j.mwale@yahoo.com',
      feeStatus: 'Overdue',
      attendanceRate: 85.0,
      standing: 'Fair',
      avatarCode: 'MM',
    },
    {
      id: 4,
      name: 'Tamara Nyirenda',
      class: 'Form 1A',
      gender: 'F',
      type: 'Boarding',
      parentName: 'Mr. & Mrs. Nyirenda',
      parentPhone: '+265 992 012 345',
      parentEmail: 'nyirenda.house@gmail.com',
      feeStatus: 'Paid',
      attendanceRate: 99.1,
      standing: 'Excellent',
      avatarCode: 'TN',
    },
    {
      id: 5,
      name: 'Kelvin Chirwa',
      class: 'Form 4B',
      gender: 'M',
      type: 'Boarding',
      parentName: 'Mr. Peter Chirwa',
      parentPhone: '+265 885 345 678',
      parentEmail: 'p.chirwa@hotmail.com',
      feeStatus: 'Overdue',
      attendanceRate: 72.4,
      standing: 'Review',
      avatarCode: 'KC',
    },
  ]);

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newParentName || !newParentPhone) return;

    const names = newName.split(' ');
    const code = names.map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const newStudent: Student = {
      id: Date.now(),
      name: newName,
      class: newClass,
      gender: newGender,
      type: newType,
      parentName: newParentName,
      parentPhone: newParentPhone,
      parentEmail: newParentEmail || `${names[0].toLowerCase()}@example.com`,
      feeStatus: 'Pending',
      attendanceRate: 100,
      standing: 'Excellent',
      avatarCode: code || 'ST',
    };

    setStudents([newStudent, ...students]);
    setIsRegisterModalOpen(false);

    // Reset fields
    setNewName('');
    setNewParentName('');
    setNewParentPhone('');
    setNewParentEmail('');
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || s.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const boardingCount = students.filter(s => s.type === 'Boarding').length;
  const dayCount = students.filter(s => s.type === 'Day').length;

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Breadcrumbs & Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Administration</span>
              <span>/</span>
              <span className="text-primary font-bold">Students</span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">Student Directory</h1>
            <p className="font-body-md text-on-surface-variant">Access emergency parent contact details, fee standings, and student profiles.</p>
          </div>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm self-start md:self-end text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Register New Student
          </button>
        </div>

        {/* Operational metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop mb-8">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Total Enrolled</p>
              <h3 className="font-headline-md text-primary mt-1">{students.length + 130} Students</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined">single_bed</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Boarding Students</p>
              <h3 className="font-headline-md text-secondary mt-1">{boardingCount + 52} Scholars</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined">directions_walk</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Day Scholars</p>
              <h3 className="font-headline-md text-tertiary mt-1">{dayCount + 78} Scholars</h3>
            </div>
          </div>
        </div>

        {/* Directory Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96 flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
              <input
                type="text"
                placeholder="Search student or parent name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
              {['All', 'Form 1A', 'Form 2C', 'Form 3A', 'Form 4B'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setFilterClass(cls)}
                  className={`px-4 py-2 rounded-full font-label-md active:scale-95 transition-all text-xs whitespace-nowrap ${
                    filterClass === cls
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container border border-surface-border text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {cls === 'All' ? 'All Classes' : cls}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant font-bold text-label-md text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">Class</th>
                  <th className="px-6 py-4 text-center">Type</th>
                  <th className="px-6 py-4">Parent Guardian</th>
                  <th className="px-6 py-4 text-center">Academic Standing</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-body-md divide-y divide-outline-variant">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s, i) => {
                    const standingColor = s.standing === 'Excellent'
                      ? 'bg-secondary-container/15 border-secondary text-secondary'
                      : s.standing === 'Good'
                      ? 'bg-primary-container/15 border-primary text-primary'
                      : s.standing === 'Fair'
                      ? 'bg-amber-100 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-300'
                      : 'bg-error-container/15 border-error text-error';
                    return (
                      <tr key={s.id} className={`hover:bg-surface-container-low transition-colors cursor-pointer ${i % 2 === 1 ? 'bg-surface-container-low/20' : ''}`} onClick={() => setSelectedStudent(s)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">
                              {s.avatarCode}
                            </div>
                            <span className="font-bold text-on-surface">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-on-surface-variant font-medium">{s.class}</td>
                        <td className="px-6 py-4 text-center text-on-surface-variant font-medium">{s.type}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-on-surface text-xs">{s.parentName}</p>
                            <p className="text-xs text-on-surface-variant font-medium">{s.parentPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 border text-xs font-bold rounded-full uppercase tracking-wider ${standingColor}`}>
                            {s.standing}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setSelectedStudent(s)} className="px-3.5 py-1.5 border border-outline hover:border-primary text-on-surface-variant hover:text-primary transition-all font-label-sm text-xs rounded-lg font-bold">
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
                      <p className="font-body-md">No student match found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* sliding Side Drawer for Student Details */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setSelectedStudent(null)}>
            <div className="bg-surface-container-lowest border-l border-outline-variant h-full w-full max-w-md shadow-2xl p-6 relative flex flex-col justify-between animate-slide-in-right overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
                  <h3 className="font-headline-sm text-primary">Student Dossier</h3>
                  <button onClick={() => setSelectedStudent(null)} className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary-container text-primary flex items-center justify-center font-headline-md font-bold">
                    {selectedStudent.avatarCode}
                  </div>
                  <div>
                    <h4 className="font-headline-sm font-bold text-on-surface">{selectedStudent.name}</h4>
                    <p className="text-sm font-bold text-primary">{selectedStudent.class} • {selectedStudent.type}</p>
                  </div>
                </div>

                <div className="space-y-4 border-y border-outline-variant py-6">
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase">Gender</span>
                    <span className="text-body-md text-on-surface font-semibold">{selectedStudent.gender === 'M' ? 'Male' : 'Female'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase">Attendance Rate</span>
                    <span className="text-body-md text-on-surface font-semibold">{selectedStudent.attendanceRate}%</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase">Academic Standing</span>
                    <span className="text-body-md text-on-surface font-semibold">{selectedStudent.standing}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase">Financial Ledger Status</span>
                    <span className={`inline-block px-2.5 py-0.5 mt-1 border text-xs font-bold rounded-full uppercase tracking-wider ${
                      selectedStudent.feeStatus === 'Paid'
                        ? 'bg-secondary-container/15 border-secondary text-secondary'
                        : selectedStudent.feeStatus === 'Pending'
                        ? 'bg-amber-100 border-amber-500 text-amber-700'
                        : 'bg-error-container/15 border-error text-error'
                    }`}>
                      {selectedStudent.feeStatus}
                    </span>
                  </div>
                </div>

                <div className="py-6 space-y-4">
                  <h5 className="font-bold text-primary text-sm">Parent / Guardian Contact</h5>
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase">Guardian Name</span>
                    <span className="text-body-md text-on-surface font-semibold">{selectedStudent.parentName}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase">Telephone Number</span>
                    <span className="text-body-md text-on-surface font-semibold">{selectedStudent.parentPhone}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-outline uppercase">Email Address</span>
                    <span className="text-body-md text-on-surface font-semibold">{selectedStudent.parentEmail}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 border-t border-outline-variant pt-4">
                <button className="flex-1 px-4 py-2.5 border border-outline hover:bg-surface-container rounded-lg font-bold text-xs text-on-surface-variant transition-all">
                  Edit Profile
                </button>
                <button className="flex-1 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">phone</span>
                  Call Guardian
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal form for Registering a Student */}
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-slide-in-bottom">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary">Register New Scholar</h3>
                <button onClick={() => setIsRegisterModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleRegisterStudent} className="space-y-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blessings Gondwe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Class</label>
                    <select
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="Form 1A">Form 1A</option>
                      <option value="Form 2C">Form 2C</option>
                      <option value="Form 3A">Form 3A</option>
                      <option value="Form 4B">Form 4B</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Gender</label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as any)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="Day">Day Scholar</option>
                      <option value="Boarding">Boarding Student</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-outline-variant pt-4 mt-2">
                  <h5 className="font-bold text-primary text-sm mb-3">Parent / Guardian Information</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Guardian Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mr. Moses Gondwe"
                        value={newParentName}
                        onChange={(e) => setNewParentName(e.target.value)}
                        className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Guardian Phone</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. +265 888 123 456"
                          value={newParentPhone}
                          onChange={(e) => setNewParentPhone(e.target.value)}
                          className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Guardian Email</label>
                        <input
                          type="email"
                          placeholder="e.g. m.gondwe@gmail.com"
                          value={newParentEmail}
                          onChange={(e) => setNewParentEmail(e.target.value)}
                          className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant">
                  <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="px-6 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container active:scale-95 transition-all text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs">
                    Register Student
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
