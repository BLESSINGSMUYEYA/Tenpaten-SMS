import { useState, useMemo } from 'react';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';
import { useQuery } from '../hooks/useApi';
import { Link } from 'react-router-dom';

interface ClassSubjectAssignment {
  id: string;
  classId: string;
  subjectId: string;
  teacherId?: string;
  class: {
    id: string;
    name: string;
    displayName: string;
    _count: {
      studentProfiles: number;
    };
  };
  subject: {
    id: string;
    name: string;
    code: string;
    isCore: boolean;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export const TeacherClasses = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch class-subject assignments (auto-scoped to this teacher by backend)
  const { data: assignments, loading } = useQuery<ClassSubjectAssignment[]>('/schools/class-subjects');

  // Unique class names for the filter chips
  const uniqueClassNames = useMemo(() => {
    const names = new Set((assignments || []).map(a => a.class.name));
    return Array.from(names).sort();
  }, [assignments]);

  const [filterClass, setFilterClass] = useState('All');

  const filteredAssignments = useMemo(() => {
    return (assignments || []).filter(a => {
      const matchesSearch =
        a.class.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subject.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterClass === 'All' || a.class.name === filterClass;
      return matchesSearch && matchesFilter;
    });
  }, [assignments, searchTerm, filterClass]);

  // Compute aggregate metrics
  const totalStudents = useMemo(() => {
    // Sum students across unique classes
    const seen = new Set<string>();
    let total = 0;
    (assignments || []).forEach(a => {
      if (!seen.has(a.classId)) {
        total += a.class._count.studentProfiles;
        seen.add(a.classId);
      }
    });
    return total;
  }, [assignments]);

  const totalSubjects = (assignments || []).length;
  const uniqueClassCount = useMemo(() => {
    return new Set((assignments || []).map(a => a.classId)).size;
  }, [assignments]);

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Breadcrumbs & Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Staff</span>
              <span>/</span>
              <span className="text-primary font-bold">My Classes</span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">My Assigned Classes</h1>
            <p className="font-body-md text-on-surface-variant">
              Manage your assigned classes, take attendance registers, and access gradebooks.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop mb-8">
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Total Students</p>
              <h3 className="font-headline-md text-primary mt-1">{loading ? '—' : totalStudents}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined">class</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Classes Assigned</p>
              <h3 className="font-headline-md text-secondary mt-1">{loading ? '—' : uniqueClassCount}</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined">book</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md">Subjects Taught</p>
              <h3 className="font-headline-md text-tertiary mt-1">{loading ? '—' : totalSubjects}</h3>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
            <input
              type="text"
              placeholder="Search by class or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
            {['All', ...uniqueClassNames].map((cls) => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-4 py-2 rounded-full font-label-md active:scale-95 transition-all whitespace-nowrap ${
                  filterClass === cls
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container border border-surface-border text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-on-surface-variant font-body-md">Loading your assignments...</span>
          </div>
        )}

        {/* Classes/Subjects Catalog */}
        {!loading && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter-desktop">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl p-6 shadow-sm hover:border-primary transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="font-title-lg text-on-surface hover:text-primary transition-colors">
                          {assignment.class.displayName} — {assignment.subject.name}
                        </h2>
                        <p className="font-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">groups</span>
                            {assignment.class._count.studentProfiles} Students
                          </span>
                          {assignment.subject.isCore && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">Core</span>
                          )}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-label-sm bg-surface-container text-primary rounded-full font-bold border border-primary/20">
                        {assignment.subject.code}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 my-4 border-y border-surface-border dark:border-outline-variant">
                      <div className="flex flex-col">
                        <span className="text-outline font-label-sm uppercase">Class</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="material-symbols-outlined text-primary text-lg">class</span>
                          <span className="font-title-md text-on-surface">{assignment.class.displayName}</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-outline font-label-sm uppercase">Subject Type</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="material-symbols-outlined text-secondary text-lg">book</span>
                          <span className="font-title-md text-on-surface">{assignment.subject.isCore ? 'Core Subject' : 'Elective'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-border dark:border-outline-variant">
                    <Link
                      to={`/teacher/attendance`}
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">fact_check</span>
                      <span>Attendance</span>
                    </Link>
                    <Link
                      to={`/teacher/grades`}
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-4 py-2.5 border border-primary text-primary font-bold rounded-lg hover:bg-surface-container-low active:scale-95 transition-all text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">grading</span>
                      <span>Gradebook</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl">
                {assignments && assignments.length === 0 ? (
                  <>
                    <span className="material-symbols-outlined text-5xl text-outline mb-4 block">school</span>
                    <h3 className="font-title-lg text-on-surface">No Classes Assigned Yet</h3>
                    <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mt-1">
                      You have not been assigned to any classes or subjects. Contact your Head Teacher or Deputy.
                    </p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-5xl text-outline mb-4 block">search_off</span>
                    <h3 className="font-title-lg text-on-surface">No matches found</h3>
                    <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mt-1">
                      Try adjusting your search or filter.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
};
