import { useState } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';

export const DeputyHeadStaff = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock initial teachers data
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: 'Dr. Samuel Okoro',
      subject: 'Mathematics',
      class: 'Form 3A Supervisor',
      status: 'active', // active | leave | absent
      email: 's.okoro@sunshine.edu',
      phone: '+234 803 111 2222',
      avatarCode: 'SO',
    },
    {
      id: 2,
      name: 'Mrs. Sarah Mwangi',
      subject: 'Physics',
      class: 'Form 4B Supervisor',
      status: 'active',
      email: 's.mwangi@sunshine.edu',
      phone: '+254 722 333 444',
      avatarCode: 'SM',
    },
    {
      id: 3,
      name: 'Mr. Kofi Boateng',
      subject: 'Chemistry',
      class: 'Supervisor: None',
      status: 'leave',
      email: 'k.boateng@sunshine.edu',
      phone: '+233 24 444 5555',
      avatarCode: 'KB',
    },
    {
      id: 4,
      name: 'Miss Amina Bello',
      subject: 'Biology',
      class: 'Form 2C Supervisor',
      status: 'absent',
      email: 'a.bello@sunshine.edu',
      phone: '+234 812 666 7777',
      avatarCode: 'AB',
    },
  ]);

  // Form states for onboarding a teacher
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newClass, setNewClass] = useState('Supervisor: None');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleOnboardTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const names = newName.split(' ');
    const code = names.map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const newTeacher = {
      id: Date.now(),
      name: newName,
      subject: newSubject,
      class: newClass,
      status: 'active',
      email: newEmail,
      phone: newPhone || '+234 000 000 0000',
      avatarCode: code || 'TR',
    };

    setTeachers([newTeacher, ...teachers]);
    setIsModalOpen(false);
    // Reset fields
    setNewName('');
    setNewEmail('');
    setNewPhone('');
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activeCount = teachers.filter(t => t.status === 'active').length;
  const leaveCount = teachers.filter(t => t.status === 'leave').length;
  const absentCount = teachers.filter(t => t.status === 'absent').length;

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Breadcrumbs & Header */}
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
            <span className="material-symbols-outlined" data-icon="add">add</span>
            Onboard Teacher
          </button>
        </div>

        {/* Operational metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop mb-8">
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="supervisor_account">supervisor_account</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Total Teachers</p>
              <h3 className="font-headline-md text-primary mt-1">{teachers.length + 28}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">On Duty Today</p>
              <h3 className="font-headline-md text-secondary mt-1">{activeCount + 26}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="event_busy">event_busy</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">On Leave / Absent</p>
              <h3 className="font-headline-md text-tertiary mt-1">{leaveCount + absentCount + 2}</h3>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
            <input
              type="text"
              placeholder="Search teacher by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
            {['All', 'active', 'leave', 'absent'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full font-label-md active:scale-95 transition-all whitespace-nowrap uppercase text-xs ${
                  filterStatus === status
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container border border-surface-border text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {status === 'active' ? 'On Duty' : status === 'All' ? 'All Staff' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-gutter-desktop">
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map((t) => {
              const statusPillColor = t.status === 'active'
                ? 'bg-secondary-container/15 border-secondary text-secondary'
                : t.status === 'leave'
                ? 'bg-tertiary-container/15 border-tertiary text-tertiary'
                : 'bg-error-container/15 border-error text-error';
              return (
                <div
                  key={t.id}
                  className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl p-6 shadow-sm hover:border-primary transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container font-headline-sm flex items-center justify-center">
                          {t.avatarCode}
                        </div>
                        <div>
                          <h3 className="font-title-lg text-on-surface font-bold">{t.name}</h3>
                          <span className="font-body-sm text-outline">{t.subject} Specialist</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 border text-xs font-bold rounded-full uppercase tracking-wider ${statusPillColor}`}>
                        {t.status === 'active' ? 'On Duty' : t.status === 'leave' ? 'On Leave' : 'Absent'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 py-4 my-4 border-y border-surface-border dark:border-outline-variant">
                      <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                        <span>{t.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                        <span className="material-symbols-outlined text-[18px]">phone</span>
                        <span>{t.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-title-sm mt-1">
                        <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                        <span className="font-bold">{t.class}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Assign Supervisor</span>
                    </button>
                    <button className="flex-1 px-4 py-2.5 border border-outline text-on-surface-variant hover:bg-surface-container rounded-lg active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">history</span>
                      <span>Logs</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-5xl text-outline mb-4">search_off</span>
              <h3 className="font-title-lg text-on-surface">No staff members found</h3>
              <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mt-1">
                No teacher matched your query. Please filter again.
              </p>
            </div>
          )}
        </div>

        {/* Mock modal for Onboard Teacher */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-surface-border dark:border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-slide-in-bottom">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary">Onboard New Faculty</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleOnboardTeacher} className="space-y-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Kwame Nkrumah"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Primary Subject</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="History">History</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Supervisor Class</label>
                    <select
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="Supervisor: None">None (Regular Teacher)</option>
                      <option value="Form 1A Supervisor">Form 1A Supervisor</option>
                      <option value="Form 2C Supervisor">Form 2C Supervisor</option>
                      <option value="Form 3A Supervisor">Form 3A Supervisor</option>
                      <option value="Form 4B Supervisor">Form 4B Supervisor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">School Email</label>
                    <input
                      type="email"
                      required
                      placeholder="k.nkrumah@sunshine.edu"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+234 803 444 8888"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-surface-border dark:border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container active:scale-95 transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs"
                  >
                    Onboard Staff
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
