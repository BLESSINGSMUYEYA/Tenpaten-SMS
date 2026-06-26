import React, { useState } from 'react';
import { useQuery } from '../../hooks/useApi';
import { api } from '../../services/api';
import { ClassDetailDrawer } from './ClassDetailDrawer';

export const ClassesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [stream, setStream] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [selectedClassForDrawer, setSelectedClassForDrawer] = useState<{ id: string, name: string } | null>(null);

  // Fetch classes and academic years
  const { data: classes, loading: loadingClasses, error: errorClasses, refetch: refetchClasses } =
    useQuery<any[]>('/schools/classes');

  const { data: academicYears, loading: loadingYears } =
    useQuery<any[]>('/schools/academic-years');

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setName('');
    setStream('');
    // Pre-select current academic year if available
    const currentYear = academicYears?.find((y: any) => y.isCurrent);
    setAcademicYearId(currentYear?.id || (academicYears && academicYears[0]?.id) || '');
    setFormError(null);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Class name is required');
      return;
    }
    if (!academicYearId) {
      setFormError('Academic Year is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.post('/schools/classes', {
        name: name.trim(),
        stream: stream.trim() || undefined,
        academicYearId,
      });
      setIsModalOpen(false);
      refetchClasses();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to create class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: string, displayName: string) => {
    if (!window.confirm(`Are you sure you want to delete class "${displayName}"?`)) {
      return;
    }

    try {
      await api.delete(`/schools/classes/${id}`);
      refetchClasses();
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete class. Please try again.');
    }
  };

  // Filtering classes based on search term
  const filteredClasses = classes?.filter((c: any) => {
    const term = searchTerm.toLowerCase();
    return (
      c.displayName.toLowerCase().includes(term) ||
      (c.academicYear?.name && c.academicYear.name.toLowerCase().includes(term))
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-80 flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
          <input
            type="text"
            placeholder="Search classes or years..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
          />
        </div>
        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Class
        </button>
      </div>

      {/* Main Classes List */}
      {loadingClasses ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-on-surface-variant text-sm font-medium">Loading classes...</p>
        </div>
      ) : errorClasses ? (
        <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 my-4 text-center">
          <span className="material-symbols-outlined text-[40px] mb-2">error</span>
          <h3 className="font-bold text-lg mb-1">Failed to load classes</h3>
          <p className="text-sm opacity-90">{errorClasses}</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">school</span>
          <p className="font-bold text-on-surface-variant text-lg">No classes found</p>
          <p className="text-on-surface-variant text-sm mt-1">Get started by creating the first class for your school.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-label-md text-xs uppercase">
                  <th className="py-4 px-6 font-bold">Class Name</th>
                  <th className="py-4 px-6 font-bold">Stream</th>
                  <th className="py-4 px-6 font-bold">Academic Year</th>
                  <th className="py-4 px-6 font-bold text-center">Enrolled Students</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredClasses.map((c: any, index: number) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-surface-container-low transition-colors cursor-pointer ${
                      index % 2 === 1 ? 'bg-surface-container-low/20' : ''
                    }`}
                    onClick={() => setSelectedClassForDrawer({ id: c.id, name: c.displayName })}
                  >
                    <td className="py-4 px-6 font-bold text-on-surface text-sm">
                      {c.name}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant text-sm">
                      {c.stream || <span className="italic opacity-50">None</span>}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant text-sm">
                      <span className="flex items-center gap-1.5">
                        {c.academicYear?.name}
                        {c.academicYear?.isCurrent && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-container text-on-primary-container rounded-full uppercase border border-primary/10">
                            Current
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-on-surface text-sm">
                      {c._count?.studentProfiles || 0}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClass(c.id, c.displayName);
                        }}
                        className="text-error hover:text-error/80 p-1.5 rounded hover:bg-error-container/10 transition-colors"
                        title="Delete Class"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary font-bold">Add New Class</h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSaveClass} className="space-y-5">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Form 1, Standard 7"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Stream (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. A, B, North, Blue"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Academic Year</label>
                <select
                  required
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  className="w-full px-3 py-2.5 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                >
                  <option value="" disabled>Select Academic Year</option>
                  {loadingYears ? (
                    <option disabled>Loading years...</option>
                  ) : academicYears && academicYears.length > 0 ? (
                    academicYears.map((y: any) => (
                      <option key={y.id} value={y.id}>
                        {y.name} {y.isCurrent ? '(Current)' : ''}
                      </option>
                    ))
                  ) : (
                    <option disabled>No academic years found</option>
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                    'Save Class'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Class Details Drawer */}
      <ClassDetailDrawer
        classId={selectedClassForDrawer?.id || ''}
        className={selectedClassForDrawer?.name || ''}
        isOpen={!!selectedClassForDrawer}
        onClose={() => setSelectedClassForDrawer(null)}
      />
    </div>
  );
};
