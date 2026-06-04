import { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';
import { useQuery, useMutation } from '../hooks/useApi';

interface GradeItem {
  id?: string;
  studentId: string;
  caMark?: number;
  examMark?: number;
  totalMark?: number;
  gradeLetter?: string;
  submissionStatus: string;
  student: {
    id: string;
    admissionNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface ClassRecord {
  id: string;
  displayName: string;
}

interface SubjectRecord {
  id: string;
  name: string;
}

interface TermRecord {
  id: string;
  name: string;
  isCurrent: boolean;
  academicYearId: string;
}

export const TeacherGrades = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Filter keys
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editCa, setEditCa] = useState<string>('0');
  const [editExam, setEditExam] = useState<string>('0');

  // Queries
  const { data: classList } = useQuery<ClassRecord[]>('/schools/classes');
  const { data: subjectList } = useQuery<SubjectRecord[]>('/schools/subjects');
  const { data: termList } = useQuery<TermRecord[]>('/schools/terms');

  // Selected Term/Year
  const activeTerm = termList?.find(t => t.id === selectedTermId) || termList?.find(t => t.isCurrent);
  const academicYearId = activeTerm?.academicYearId || '';

  // Grades fetch query
  const { data: gradeList, loading: loadingGrades, refetch: refetchGrades } = useQuery<GradeItem[]>(
    `/grades?classId=${selectedClassId}&subjectId=${selectedSubjectId}&termId=${selectedTermId}`,
    !!selectedClassId && !!selectedSubjectId && !!selectedTermId,
    [selectedClassId, selectedSubjectId, selectedTermId]
  );

  // Query all students in selected class to match grades
  const { data: studentList } = useQuery<any[]>(
    `/people/students?classId=${selectedClassId}`,
    !!selectedClassId,
    [selectedClassId]
  );

  // Mutations
  const { mutate: enterGrades } = useMutation('/grades/enter', 'post');
  const { mutate: submitGrades } = useMutation('/grades/submit', 'patch');

  // Populate default filter fields
  useEffect(() => {
    if (classList && classList.length > 0 && !selectedClassId) {
      setSelectedClassId(classList[0].id);
    }
  }, [classList]);

  useEffect(() => {
    if (subjectList && subjectList.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjectList[0].id);
    }
  }, [subjectList]);

  useEffect(() => {
    if (termList && termList.length > 0 && !selectedTermId) {
      const current = termList.find(t => t.isCurrent) || termList[0];
      setSelectedTermId(current.id);
    }
  }, [termList]);

  // Combine student profile list with grades data for editable matrix grid
  const mergedGrades: GradeItem[] = useMemo(() => {
    if (!studentList) return [];

    return studentList.map(std => {
      const grade = (gradeList || []).find(g => g.studentId === std.id);
      return {
        studentId: std.id,
        caMark: grade?.caMark,
        examMark: grade?.examMark,
        totalMark: grade?.totalMark,
        gradeLetter: grade?.gradeLetter,
        submissionStatus: grade?.submissionStatus || 'draft',
        student: {
          id: std.id,
          admissionNumber: std.admissionNumber,
          user: {
            firstName: std.user.firstName,
            lastName: std.user.lastName,
          },
        },
      };
    });
  }, [studentList, gradeList]);

  const startEditing = (row: GradeItem) => {
    setEditingStudentId(row.studentId);
    setEditCa(row.caMark?.toString() || '0');
    setEditExam(row.examMark?.toString() || '0');
  };

  const cancelEditing = () => {
    setEditingStudentId(null);
  };

  const handleSaveGrade = async (studentId: string) => {
    if (!selectedClassId || !selectedSubjectId || !selectedTermId || !academicYearId) return;

    const ca = Math.min(30, Math.max(0, parseFloat(editCa) || 0));
    const exam = Math.min(70, Math.max(0, parseFloat(editExam) || 0));

    try {
      await enterGrades({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        termId: selectedTermId,
        academicYearId,
        grades: [
          {
            studentId,
            caMark: ca,
            examMark: exam,
          },
        ],
      });
      setEditingStudentId(null);
      refetchGrades();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitGrades = async () => {
    if (!selectedClassId || !selectedSubjectId || !selectedTermId) return;

    if (!confirm('Are you sure you want to submit these grades? They will be locked for editing until review.')) return;

    try {
      await submitGrades({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        termId: selectedTermId,
      });
      refetchGrades();
      alert('Grades submitted successfully to Head Teacher');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredGrades = mergedGrades.filter(row =>
    `${row.student.user.firstName} ${row.student.user.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Performance calculations
  const totalScores = (gradeList || []).filter(g => g.totalMark !== null).map(g => g.totalMark!);
  const classAvg = totalScores.length > 0 ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length) : 0;
  const passRate = totalScores.length > 0 ? Math.round((totalScores.filter(t => t >= 50).length / totalScores.length) * 100) : 0;
  const highestScore = totalScores.length > 0 ? Math.max(...totalScores) : 0;

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-md md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Header */}
        <div className="py-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-primary font-bold text-2xl">Assessment Gradebook</h1>
            <p className="font-body-md text-on-surface-variant">Record, compute, and review academic performance records.</p>
          </div>
          <div className="flex gap-sm">
            <button
              onClick={handleSubmitGrades}
              className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-white font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              Submit for Approval
            </button>
          </div>
        </div>

        {/* Aggregated Stats */}
        <div className="grid grid-cols-3 gap-lg mb-margin-desktop text-center">
          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm">
            <p className="text-on-surface-variant text-xs uppercase tracking-wider font-bold">Class Average</p>
            <h3 className="text-xl font-bold text-primary mt-2">{classAvg}%</h3>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm">
            <p className="text-on-surface-variant text-xs uppercase tracking-wider font-bold">Class Pass Rate</p>
            <h3 className="text-xl font-bold text-secondary mt-2">{passRate}%</h3>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm">
            <p className="text-on-surface-variant text-xs uppercase tracking-wider font-bold">Highest Score</p>
            <h3 className="text-xl font-bold text-tertiary mt-2">{highestScore}%</h3>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm mb-lg flex flex-col md:flex-row gap-md items-center justify-between">
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto flex-1">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-outline uppercase mb-1">Class</label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-outline-variant rounded bg-surface-container text-on-surface outline-none"
              >
                {(classList || []).map(c => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-outline uppercase mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-outline-variant rounded bg-surface-container text-on-surface outline-none"
              >
                {(subjectList || []).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-outline uppercase mb-1">Term</label>
              <select
                value={selectedTermId}
                onChange={e => setSelectedTermId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-outline-variant rounded bg-surface-container text-on-surface outline-none"
              >
                {(termList || []).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="relative w-full md:w-72 flex items-center self-end">
            <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none bg-transparent text-on-surface font-body-sm text-xs"
            />
          </div>
        </div>

        {/* Grade Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant border-b border-outline-variant font-label-md text-[10px] uppercase">
                  <th className="py-4 px-6 font-bold">Student Name</th>
                  <th className="py-4 px-4 font-bold text-center">CA (Max 30)</th>
                  <th className="py-4 px-4 font-bold text-center">Exam (Max 70)</th>
                  <th className="py-4 px-4 font-bold text-center">Total (100)</th>
                  <th className="py-4 px-4 font-bold text-center">Grade Letter</th>
                  <th className="py-4 px-6 font-bold text-center">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {loadingGrades ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-on-surface-variant text-sm">Loading gradebook data...</td>
                  </tr>
                ) : filteredGrades.length > 0 ? (
                  filteredGrades.map(s => {
                    const isEditing = editingStudentId === s.studentId;

                    return (
                      <tr key={s.studentId} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-bold text-primary">{s.student.user.firstName} {s.student.user.lastName}</span>
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-on-surface">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={30}
                              value={editCa}
                              onChange={e => setEditCa(e.target.value)}
                              className="w-16 px-1.5 py-1 text-center bg-surface-container border border-outline-variant rounded focus:border-primary outline-none"
                            />
                          ) : (
                            s.caMark ?? '—'
                          )}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-on-surface">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={70}
                              value={editExam}
                              onChange={e => setEditExam(e.target.value)}
                              className="w-16 px-1.5 py-1 text-center bg-surface-container border border-outline-variant rounded focus:border-primary outline-none"
                            />
                          ) : (
                            s.examMark ?? '—'
                          )}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-primary">
                          {s.totalMark !== undefined ? `${s.totalMark}%` : '—'}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-on-surface">{s.gradeLetter ?? '—'}</td>
                        <td className="py-4 px-6 text-center capitalize">
                          <span className={`inline-block px-3 py-1 border text-[10px] font-bold rounded-full ${
                            s.submissionStatus === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            s.submissionStatus === 'submitted' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                            'bg-surface-container border-outline-variant text-on-surface-variant'
                          }`}>
                            {s.submissionStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isEditing ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleSaveGrade(s.studentId)}
                                className="px-3 py-1.5 bg-secondary text-white font-bold rounded-lg hover:opacity-90 active:scale-95 text-[10px]"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="px-3 py-1.5 border border-outline-variant text-on-surface-variant font-bold rounded-lg hover:bg-surface-container text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(s)}
                              disabled={s.submissionStatus === 'submitted' || s.submissionStatus === 'approved'}
                              className="px-3 py-1.5 border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-all font-bold rounded-lg disabled:opacity-40"
                            >
                              Edit Scores
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                      No student rosters matching search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
};
