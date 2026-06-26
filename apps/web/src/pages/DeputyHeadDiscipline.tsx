import { useState } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';

type DisciplineCase = {
  id: number;
  studentName: string;
  class: string;
  category: string;
  date: string;
  severity: 'high' | 'medium' | 'low';
  actionTaken: string;
  status: 'active' | 'resolved';
  description: string;
};

export const DeputyHeadDiscipline = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');

  const [cases, setCases] = useState<DisciplineCase[]>([]);

  // Form state
  const [studentName, setStudentName] = useState('');
  const [targetClass, setTargetClass] = useState('Form 3A');
  const [category, setCategory] = useState('Late Coming');
  const [severity, setSeverity] = useState<'high' | 'medium' | 'low'>('medium');
  const [actionTaken, setActionTaken] = useState('');
  const [description, setDescription] = useState('');

  const handleLogIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !actionTaken) return;

    const newCase: DisciplineCase = {
      id: Date.now(),
      studentName,
      class: targetClass,
      category,
      date: new Date().toISOString().split('T')[0],
      severity,
      actionTaken,
      status: 'active',
      description,
    };

    setCases([newCase, ...cases]);
    setIsModalOpen(false);
    // Reset fields
    setStudentName('');
    setActionTaken('');
    setDescription('');
  };

  const handleResolveCase = (id: number) => {
    setCases(cases.map(c => c.id === id ? { ...c, status: 'resolved' as const } : c));
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSeverity === 'All' || c.severity === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  const activeCount = cases.filter(c => c.status === 'active').length;
  const resolvedCount = cases.filter(c => c.status === 'resolved').length;

  const getSeverityColors = (sev: DisciplineCase['severity']) => {
    switch (sev) {
      case 'high':
        return {
          cardBorder: 'hover:border-error border-surface-border',
          pillClass: 'bg-error-container/15 border-error text-error',
          dotClass: 'bg-error',
        };
      case 'medium':
        return {
          cardBorder: 'hover:border-tertiary border-surface-border',
          pillClass: 'bg-tertiary-container/15 border-tertiary text-tertiary',
          dotClass: 'bg-tertiary',
        };
      default:
        return {
          cardBorder: 'hover:border-primary border-surface-border',
          pillClass: 'bg-primary-container/15 border-primary text-primary',
          dotClass: 'bg-primary',
        };
    }
  };

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
              <span className="text-primary font-bold">Discipline</span>
            </nav>
            <h1 className="dash-page-title">Student Conduct & Discipline</h1>
            <p className="font-body-md text-on-surface-variant">Log and manage student behavioral records, incident reports, and corrective actions.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm self-start sm:self-end"
          >
            <span className="material-symbols-outlined" data-icon="gavel">gavel</span>
            Log Incident
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop mb-8">
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="warning">warning</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Active behavior cases</p>
              <h3 className="font-headline-md text-error mt-1">{activeCount}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="task_alt">task_alt</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Resolved Cases (Term)</p>
              <h3 className="font-headline-md text-secondary mt-1">{resolvedCount}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="analytics">analytics</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Conduct Score Average</p>
              <h3 className="font-headline-md text-primary mt-1">N/A</h3>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
            <input
              type="text"
              placeholder="Search student or incident category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
            {['All', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-4 py-2 rounded-full font-label-md active:scale-95 transition-all whitespace-nowrap uppercase text-xs ${
                  filterSeverity === sev
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container border border-surface-border text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {sev === 'All' ? 'All Severities' : `${sev} severity`}
              </button>
            ))}
          </div>
        </div>

        {/* Incident Lists */}
        <div className="space-y-6">
          {filteredCases.length > 0 ? (
            filteredCases.map((c) => {
              const { cardBorder, pillClass } = getSeverityColors(c.severity);
              return (
                <div
                  key={c.id}
                  className={`bg-surface-container-lowest border rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${cardBorder}`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 text-label-sm bg-surface-container text-on-surface font-bold rounded-full">
                          {c.class}
                        </span>
                        <span className="font-label-sm text-outline">Logged: {c.date}</span>
                        <span className={`px-2.5 py-0.5 text-label-sm border rounded-full font-bold uppercase tracking-wider ${pillClass}`}>
                          {c.severity}
                        </span>
                      </div>
                      <h3 className="font-title-lg text-on-surface font-bold">{c.studentName}</h3>
                      <p className="font-label-md text-primary mt-1">{c.category}</p>
                    </div>

                    <span
                      className={`px-3.5 py-1 border text-xs font-bold rounded-full uppercase tracking-wider self-start md:self-auto ${
                        c.status === 'resolved'
                          ? 'bg-secondary-container/15 border-secondary text-secondary'
                          : 'bg-tertiary-container/15 border-tertiary text-tertiary animate-pulse'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="font-body-md text-on-surface-variant mb-4 bg-surface-container-low/40 p-4 rounded-lg border border-surface-border dark:border-outline-variant">
                    {c.description}
                  </p>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-surface-border dark:border-outline-variant">
                    <div className="text-body-sm text-outline">
                      <span className="font-bold text-on-surface">Action taken:</span> {c.actionTaken}
                    </div>

                    {c.status === 'active' && (
                      <div className="flex gap-2 self-stretch sm:self-auto justify-end">
                        <button
                          onClick={() => handleResolveCase(c.id)}
                          className="px-4 py-2 bg-secondary text-on-secondary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">done</span>
                          <span>Resolve Case</span>
                        </button>
                        <button className="px-4 py-2 border border-outline text-on-surface-variant hover:bg-surface-container rounded-lg active:scale-95 transition-all text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">call</span>
                          <span>Contact Parent</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-5xl text-outline mb-4">gavel</span>
              <h3 className="font-title-lg text-on-surface">No behavior logs found</h3>
              <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mt-1">
                There are no incident records matching your criteria.
              </p>
            </div>
          )}
        </div>

        {/* Mock modal for Log Incident */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-surface-border dark:border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-slide-in-bottom">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary">Log Student Conduct</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleLogIncident} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Student Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amina Bello"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Class</label>
                    <select
                      value={targetClass}
                      onChange={(e) => setTargetClass(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="Form 1A">Form 1A</option>
                      <option value="Form 2C">Form 2C</option>
                      <option value="Form 3A">Form 3A</option>
                      <option value="Form 4B">Form 4B</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Incident Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="Late Coming">Late Coming</option>
                      <option value="Chronic Tardiness">Chronic Tardiness</option>
                      <option value="Dress Code Violation">Dress Code Violation</option>
                      <option value="Academic Dishonesty">Academic Dishonesty</option>
                      <option value="Skipping Assembly">Skipping Assembly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Severity Level</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors animate-fade-in"
                    >
                      <option value="low">Low Severity</option>
                      <option value="medium">Medium Severity</option>
                      <option value="high">High Severity</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Immediate Action Taken</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Parental notification, detention scheduled..."
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Incident Description & Circumstances</label>
                  <textarea
                    placeholder="Provide details about what occurred..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors resize-none font-sans"
                  ></textarea>
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
                    Log Incident
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
