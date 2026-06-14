import { useState } from 'react';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';

export const TeacherAssignments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock initial assignments list
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Algebra Test 1 Prep',
      class: 'Form 3A - Mathematics',
      dueDate: '2026-05-28',
      submitted: 15,
      total: 35,
      status: 'active',
      description: 'Prepare solutions for questions 1 through 15 in Chapter 4 of the textbook.',
    },
    {
      id: 2,
      title: 'Electromagnetism Lab Report',
      class: 'Form 4B - Physics',
      dueDate: '2026-05-30',
      submitted: 2,
      total: 28,
      status: 'active',
      description: 'Document your findings from the induction coil practical, including field diagrams.',
    },
    {
      id: 3,
      title: 'Quadratic Equations Worksheet',
      class: 'Form 3A - Mathematics',
      dueDate: '2026-05-22',
      submitted: 32,
      total: 35,
      status: 'pending',
      description: 'Solving standard forms and vertex factorization problems.',
    },
    {
      id: 4,
      title: 'Kinematics Midterm Quiz',
      class: 'Form 4B - Physics',
      dueDate: '2026-05-10',
      submitted: 28,
      total: 28,
      status: 'completed',
      description: 'Covers linear acceleration, projectile motions, and drag co-efficients.',
    },
  ]);

  // Form states for creating a new assignment
  const [newTitle, setNewTitle] = useState('');
  const [newClass, setNewClass] = useState('Form 3A - Mathematics');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDueDate) return;

    const newAssign = {
      id: Date.now(),
      title: newTitle,
      class: newClass,
      dueDate: newDueDate,
      submitted: 0,
      total: newClass.includes('3A') ? 35 : newClass.includes('4B') ? 28 : 40,
      status: 'active',
      description: newDescription,
    };

    setAssignments([newAssign, ...assignments]);
    setIsModalOpen(false);
    // Reset fields
    setNewTitle('');
    setNewDueDate('');
    setNewDescription('');
  };

  const filtered = assignments.filter((a) => a.status === activeTab);

  // Quick statistics
  const activeCount = assignments.filter((a) => a.status === 'active').length;
  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const completedCount = assignments.filter((a) => a.status === 'completed').length;

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Breadcrumbs & Header */}
        <div className="py-lg flex flex-col sm:flex-row sm:items-end justify-between gap-md">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Staff</span>
              <span>/</span>
              <span className="text-primary font-bold">Assignments</span>
            </nav>
            <h1 className="dash-page-title">Coursework & Assignments</h1>
            <p className="font-body-md text-on-surface-variant">Create, distribute, and grade assignments across your subjects.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm self-start sm:self-end"
          >
            <span className="material-symbols-outlined" data-icon="add">add</span>
            New Assignment
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop mb-8">
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="assignment">assignment</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Active Coursework</p>
              <h3 className="font-headline-md text-primary mt-1">{activeCount}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="pending_actions">pending_actions</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Pending Grading</p>
              <h3 className="font-headline-md text-secondary mt-1">{pendingCount}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="done_all">done_all</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Completed This Term</p>
              <h3 className="font-headline-md text-tertiary mt-1">{completedCount + 18}</h3>
            </div>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="border-b border-surface-border dark:border-outline-variant mb-lg flex gap-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 font-title-md transition-all relative ${
              activeTab === 'active' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary font-medium'
            }`}
          >
            Active ({activeCount})
            {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>}
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 font-title-md transition-all relative ${
              activeTab === 'pending' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary font-medium'
            }`}
          >
            Pending Grading ({pendingCount})
            {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 font-title-md transition-all relative ${
              activeTab === 'completed' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary font-medium'
            }`}
          >
            Completed ({completedCount})
            {activeTab === 'completed' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>}
          </button>
        </div>

        {/* Assignment Lists */}
        <div className="space-y-md">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const submissionRate = item.total > 0 ? Math.round((item.submitted / item.total) * 100) : 0;
              return (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl p-lg shadow-sm hover:border-primary transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-lg"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 text-label-sm bg-primary-container text-primary font-bold rounded-full">
                        {item.class}
                      </span>
                      <span className="font-label-sm text-outline">Due: {item.dueDate}</span>
                    </div>
                    <h3 className="font-title-lg text-on-surface">{item.title}</h3>
                    <p className="font-body-md text-on-surface-variant mt-1.5 line-clamp-2 max-w-2xl">{item.description}</p>
                  </div>

                  <div className="w-full md:w-64 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-label-md">
                      <span className="text-on-surface-variant">Submissions ({item.submitted}/{item.total})</span>
                      <span className="font-bold text-primary">{submissionRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${submissionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2 self-stretch md:self-auto justify-end border-t md:border-t-0 border-surface-border dark:border-outline-variant pt-4 md:pt-0">
                    {item.status === 'active' && (
                      <>
                        <button className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all font-label-md flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">grading</span>
                          <span>Review</span>
                        </button>
                        <button className="px-4 py-2 border border-outline text-on-surface-variant hover:bg-surface-container rounded-lg active:scale-95 transition-all font-label-md">
                          <span>Edit</span>
                        </button>
                      </>
                    )}
                    {item.status === 'pending' && (
                      <button className="px-4 py-2 bg-secondary text-on-secondary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all font-label-md flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        <span>Grade All</span>
                      </button>
                    )}
                    {item.status === 'completed' && (
                      <button className="px-4 py-2 border border-primary text-primary font-bold rounded-lg hover:bg-surface-container-low active:scale-95 transition-all font-label-md flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>View Gradebook</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-5xl text-outline mb-4">assignment_turned_in</span>
              <h3 className="font-title-lg text-on-surface">No assignments here</h3>
              <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mt-1">
                There are no courseworks in this category right now.
              </p>
            </div>
          )}
        </div>

        {/* Modal Dialog for New Assignment */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-surface-border dark:border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl p-lg relative animate-slide-in-bottom">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-headline-sm text-primary">New Assignment Setup</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Assignment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Algebra Test 1 Prep"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Target Class</label>
                    <select
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="Form 3A - Mathematics">Form 3A - Mathematics</option>
                      <option value="Form 4B - Physics">Form 4B - Physics</option>
                      <option value="Form 2C - Mathematics">Form 2C - Mathematics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Instructions & Details</label>
                  <textarea
                    placeholder="Provide description of questions, reference pages or materials..."
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-sm pt-md border-t border-surface-border dark:border-outline-variant">
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
                    Post Coursework
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
