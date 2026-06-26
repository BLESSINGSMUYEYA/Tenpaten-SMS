import React, { useState } from 'react';
import { useQuery } from '../../hooks/useApi';
import { api } from '../../services/api';

export const SubjectsManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'assignments'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Subject Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isCore, setIsCore] = useState(true);
  const [gradingScaleId, setGradingScaleId] = useState('');
  const [caMax, setCaMax] = useState(30);
  const [examMax, setExamMax] = useState(70);

  // Assignment Form State
  const [assignClassId, setAssignClassId] = useState('');
  const [assignSubjectId, setAssignSubjectId] = useState('');
  const [assignTeacherId, setAssignTeacherId] = useState('');

  // Fetch queries
  const { data: subjects, loading: loadingSubjects, error: errorSubjects, refetch: refetchSubjects } =
    useQuery<any[]>('/schools/subjects');

  const { data: gradingScales } = useQuery<any[]>('/schools/grading-scales');
  const { data: classes } = useQuery<any[]>('/schools/classes');
  const { data: staff } = useQuery<any[]>('/people/staff');

  const { data: assignments, loading: loadingAssignments, refetch: refetchAssignments } =
    useQuery<any[]>('/schools/class-subjects', activeSubTab === 'assignments');

  // Open Subject Modal (Add/Edit)
  const handleOpenSubjectModal = (subject: any | null = null) => {
    setEditingSubject(subject);
    setFormError(null);
    if (subject) {
      setName(subject.name);
      setCode(subject.code);
      setIsCore(subject.isCore);
      setGradingScaleId(subject.gradingScaleId || '');
      setCaMax(subject.caMax !== null ? subject.caMax : 30);
      setExamMax(subject.examMax !== null ? subject.examMax : 70);
    } else {
      setName('');
      setCode('');
      setIsCore(true);
      // Pre-select default grading scale if exists
      const defaultScale = gradingScales?.find((s: any) => s.isDefault);
      setGradingScaleId(defaultScale?.id || (gradingScales && gradingScales[0]?.id) || '');
      setCaMax(30);
      setExamMax(70);
    }
    setIsSubjectModalOpen(true);
  };

  // Open Assignment Modal
  const handleOpenAssignModal = () => {
    setFormError(null);
    setAssignClassId(classes && classes[0]?.id || '');
    setAssignSubjectId(subjects && subjects[0]?.id || '');
    setAssignTeacherId(staff && staff[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Subject name is required');
      return;
    }
    if (!code.trim()) {
      setFormError('Subject code is required');
      return;
    }
    if (caMax + examMax !== 100) {
      setFormError(`CA Max (${caMax}) + Exam Max (${examMax}) must equal 100.`);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      isCore,
      gradingScaleId: gradingScaleId || null,
      caMax,
      examMax,
    };

    try {
      if (editingSubject) {
        await api.patch(`/schools/subjects/${editingSubject.id}`, payload);
      } else {
        await api.post('/schools/subjects', payload);
      }
      setIsSubjectModalOpen(false);
      refetchSubjects();
      if (activeSubTab === 'assignments') {
        refetchAssignments();
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id: string, subjectName: string) => {
    if (!window.confirm(`Are you sure you want to delete subject "${subjectName}"?`)) {
      return;
    }

    try {
      await api.delete(`/schools/subjects/${id}`);
      refetchSubjects();
      if (activeSubTab === 'assignments') {
        refetchAssignments();
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete subject.');
    }
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignClassId || !assignSubjectId) {
      setFormError('Class and Subject are required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.post('/schools/class-subjects', {
        classId: assignClassId,
        subjectId: assignSubjectId,
        teacherId: assignTeacherId || undefined,
      });
      setIsAssignModalOpen(false);
      refetchAssignments();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to assign subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignSubject = async (id: string, className: string, subjectName: string) => {
    if (!window.confirm(`Are you sure you want to unassign "${subjectName}" from class "${className}"?`)) {
      return;
    }

    try {
      await api.delete(`/schools/class-subjects/${id}`);
      refetchAssignments();
    } catch (err: any) {
      console.error(err);
      alert('Failed to unassign subject.');
    }
  };

  // Filter lists
  const filteredSubjects = subjects?.filter((s: any) => {
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term);
  }) || [];

  const filteredAssignments = assignments?.filter((a: any) => {
    const term = searchTerm.toLowerCase();
    const className = a.class?.displayName || '';
    const subjectName = a.subject?.name || '';
    const teacherName = a.teacher ? `${a.teacher.firstName} ${a.teacher.lastName}` : 'Unassigned';
    return (
      className.toLowerCase().includes(term) ||
      subjectName.toLowerCase().includes(term) ||
      teacherName.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div className="flex gap-2 border-b border-outline-variant/60">
        <button
          onClick={() => { setActiveSubTab('directory'); setSearchTerm(''); }}
          className={`px-5 py-2 font-label-md font-bold border-b-2 transition-all capitalize ${
            activeSubTab === 'directory' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          📂 Subjects Directory
        </button>
        <button
          onClick={() => { setActiveSubTab('assignments'); setSearchTerm(''); }}
          className={`px-5 py-2 font-label-md font-bold border-b-2 transition-all capitalize ${
            activeSubTab === 'assignments' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          🔗 Class Assignments
        </button>
      </div>

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-80 flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
          <input
            type="text"
            placeholder={activeSubTab === 'directory' ? 'Search by subject name or code...' : 'Search by class, subject, or teacher...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
          />
        </div>
        {activeSubTab === 'directory' ? (
          <button
            onClick={() => handleOpenSubjectModal(null)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Subject
          </button>
        ) : (
          <button
            onClick={handleOpenAssignModal}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
            Assign Subject to Class
          </button>
        )}
      </div>

      {/* Content Rendering */}
      {activeSubTab === 'directory' ? (
        loadingSubjects ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-on-surface-variant text-sm font-medium">Loading subjects...</p>
          </div>
        ) : errorSubjects ? (
          <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 my-4 text-center">
            <span className="material-symbols-outlined text-[40px] mb-2">error</span>
            <h3 className="font-bold text-lg mb-1">Failed to load subjects</h3>
            <p className="text-sm opacity-90">{errorSubjects}</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">menu_book</span>
            <p className="font-bold text-on-surface-variant text-lg">No subjects found</p>
            <p className="text-on-surface-variant text-sm mt-1">Get started by creating the first subject for the curriculum.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-label-md text-xs uppercase">
                    <th className="py-4 px-6 font-bold">Code</th>
                    <th className="py-4 px-6 font-bold">Subject Name</th>
                    <th className="py-4 px-6 font-bold">Type</th>
                    <th className="py-4 px-6 font-bold text-center">CA Max</th>
                    <th className="py-4 px-6 font-bold text-center">Exam Max</th>
                    <th className="py-4 px-6 font-bold">Grading Scale</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredSubjects.map((s: any, index: number) => {
                    const matchedScale = gradingScales?.find((gs: any) => gs.id === s.gradingScaleId);
                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-surface-container-low transition-colors ${
                          index % 2 === 1 ? 'bg-surface-container-low/20' : ''
                        }`}
                      >
                        <td className="py-4 px-6 font-bold text-primary text-sm uppercase">
                          {s.code}
                        </td>
                        <td className="py-4 px-6 font-bold text-on-surface text-sm">
                          {s.name}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            s.isCore
                              ? 'bg-primary-container/10 border-primary text-primary'
                              : 'bg-surface-container-high border-outline-variant text-on-surface-variant'
                          }`}>
                            {s.isCore ? 'Core' : 'Elective'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-sm font-semibold text-on-surface-variant">
                          {s.caMax || 30}
                        </td>
                        <td className="py-4 px-6 text-center text-sm font-semibold text-on-surface-variant">
                          {s.examMax || 70}
                        </td>
                        <td className="py-4 px-6 text-sm text-on-surface-variant">
                          {matchedScale ? (
                            <span className="font-semibold text-on-surface">
                              {matchedScale.name} {matchedScale.isDefault && '(Default)'}
                            </span>
                          ) : (
                            <span className="italic opacity-50">None</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right space-x-1">
                          <button
                            onClick={() => handleOpenSubjectModal(s)}
                            className="text-primary hover:text-primary-high p-1.5 rounded hover:bg-primary-container/10 transition-colors"
                            title="Edit Subject"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(s.id, s.name)}
                            className="text-error hover:text-error/80 p-1.5 rounded hover:bg-error-container/10 transition-colors"
                            title="Delete Subject"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Class Assignments tab view */
        loadingAssignments ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-on-surface-variant text-sm font-medium">Loading class assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">swap_horiz</span>
            <p className="font-bold text-on-surface-variant text-lg">No assignments found</p>
            <p className="text-on-surface-variant text-sm mt-1">Assign subjects to classes and define teachers to start academic recording.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-label-md text-xs uppercase">
                    <th className="py-4 px-6 font-bold">Class</th>
                    <th className="py-4 px-6 font-bold">Subject Code</th>
                    <th className="py-4 px-6 font-bold">Subject Name</th>
                    <th className="py-4 px-6 font-bold">Assigned Teacher</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredAssignments.map((a: any, index: number) => (
                    <tr
                      key={a.id}
                      className={`hover:bg-surface-container-low transition-colors ${
                        index % 2 === 1 ? 'bg-surface-container-low/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-on-surface text-sm">
                        {a.class?.displayName}
                      </td>
                      <td className="py-4 px-6 text-primary text-sm font-semibold uppercase">
                        {a.subject?.code}
                      </td>
                      <td className="py-4 px-6 text-on-surface text-sm font-medium">
                        {a.subject?.name}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {a.teacher ? (
                          <span className="font-semibold text-on-surface">
                            {a.teacher.firstName} {a.teacher.lastName}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-error-container/10 border border-error/25 text-error rounded-full uppercase">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleUnassignSubject(a.id, a.class?.displayName, a.subject?.name)}
                          className="text-error hover:text-error/80 p-1.5 rounded hover:bg-error-container/10 transition-colors"
                          title="Unassign Subject"
                        >
                          <span className="material-symbols-outlined text-[20px]">link_off</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Subject Creation Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary font-bold">
                {editingSubject ? 'Edit Subject Details' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 bg-error-container text-on-error-container rounded-lg text-xs font-semibold border border-error/20 flex gap-2 items-center">
                <span className="material-symbols-outlined text-sm shrink-0">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Subject Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics, Physical Science"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MATH, PHYS"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">CA Max Mark</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={caMax}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setCaMax(val);
                      setExamMax(100 - val);
                    }}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Exam Max Mark</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={examMax}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setExamMax(val);
                      setCaMax(100 - val);
                    }}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Grading Scale</label>
                <select
                  value={gradingScaleId}
                  onChange={(e) => setGradingScaleId(e.target.value)}
                  className="w-full px-3 py-2.5 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                >
                  <option value="">No Custom Scale (Uses Default)</option>
                  {gradingScales?.map((gs: any) => (
                    <option key={gs.id} value={gs.id}>
                      {gs.name} {gs.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="isCore"
                  checked={isCore}
                  onChange={(e) => setIsCore(e.target.checked)}
                  className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary bg-transparent"
                />
                <label htmlFor="isCore" className="text-body-md text-on-surface font-semibold cursor-pointer select-none">
                  This is a Core Subject (Compulsory for all students in assigned classes)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-5 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Subject'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Subject Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary font-bold">Assign Subject to Class</h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 bg-error-container text-on-error-container rounded-lg text-xs font-semibold border border-error/20 flex gap-2 items-center">
                <span className="material-symbols-outlined text-sm shrink-0">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAssignment} className="space-y-5">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Select Class</label>
                <select
                  required
                  value={assignClassId}
                  onChange={(e) => setAssignClassId(e.target.value)}
                  className="w-full px-3 py-2.5 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                >
                  <option value="" disabled>Choose a class</option>
                  {classes?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.displayName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Select Subject</label>
                <select
                  required
                  value={assignSubjectId}
                  onChange={(e) => setAssignSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                >
                  <option value="" disabled>Choose a subject</option>
                  {subjects?.map((s: any) => (
                    <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Assign Teacher (Optional)</label>
                <select
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="w-full px-3 py-2.5 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                >
                  <option value="">Leave Unassigned</option>
                  {staff?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-5 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Assign Subject'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
