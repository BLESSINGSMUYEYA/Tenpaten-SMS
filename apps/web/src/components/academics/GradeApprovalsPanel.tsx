import React, { useState } from 'react';
import { useQuery } from '../../hooks/useApi';
import { api } from '../../services/api';

interface GradeRecord {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  termId: string;
  caMark: number | null;
  examMark: number | null;
  totalMark: number | null;
  gradeLetter: string | null;
  submissionStatus: 'draft' | 'submitted' | 'approved' | 'locked';
  isPublished: boolean;
  rejectionComment: string | null;
  student: {
    admissionNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  class: {
    displayName: string;
  };
  subject: {
    name: string;
    code: string;
  };
}

export const GradeApprovalsPanel: React.FC = () => {
  const [selectedTermId, setSelectedTermId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewGroup, setReviewGroup] = useState<{
    classId: string;
    subjectId: string;
    className: string;
    subjectName: string;
    subjectCode: string;
    records: GradeRecord[];
  } | null>(null);
  
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: terms, loading: loadingTerms } = useQuery<any[]>('/schools/terms');
  
  // Auto-select active term
  React.useEffect(() => {
    if (terms && terms.length > 0 && !selectedTermId) {
      const activeTerm = terms.find((t: any) => t.isCurrent) || terms[0];
      setSelectedTermId(activeTerm.id);
    }
  }, [terms, selectedTermId]);

  const { data: grades, loading: loadingGrades, refetch: refetchGrades } =
    useQuery<GradeRecord[]>(
      selectedTermId ? `/grades?termId=${selectedTermId}` : '',
      !!selectedTermId,
      [selectedTermId]
    );

  // Group grades by classId + subjectId
  const groupedGrades = React.useMemo(() => {
    if (!grades) return [];
    
    const groups: { [key: string]: {
      classId: string;
      subjectId: string;
      className: string;
      subjectName: string;
      subjectCode: string;
      records: GradeRecord[];
    }} = {};

    grades.forEach((g) => {
      const key = `${g.classId}_${g.subjectId}`;
      if (!groups[key]) {
        groups[key] = {
          classId: g.classId,
          subjectId: g.subjectId,
          className: g.class.displayName,
          subjectName: g.subject.name,
          subjectCode: g.subject.code,
          records: [],
        };
      }
      groups[key].records.push(g);
    });

    return Object.values(groups);
  }, [grades]);

  // Compute status for a group
  const getGroupStatus = (records: GradeRecord[]) => {
    const totalCount = records.length;
    const submittedCount = records.filter(r => r.submissionStatus === 'submitted').length;
    const approvedCount = records.filter(r => r.submissionStatus === 'approved').length;
    const publishedCount = records.filter(r => r.isPublished).length;
    const draftCount = records.filter(r => r.submissionStatus === 'draft').length;

    if (submittedCount > 0) return 'Pending Approval';
    if (publishedCount === totalCount && totalCount > 0) return 'Published';
    if (approvedCount > 0) return 'Approved (Unpublished)';
    if (draftCount > 0) return 'Draft (Unsubmitted)';
    return 'No Marks';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending Approval':
        return 'bg-warning/15 border-warning text-warning';
      case 'Published':
        return 'bg-secondary-container/15 border-secondary text-secondary';
      case 'Approved (Unpublished)':
        return 'bg-primary-container/15 border-primary text-primary';
      default:
        return 'bg-surface-container-high border-outline-variant text-on-surface-variant';
    }
  };

  const handleApprove = async (classId: string, subjectId: string) => {
    if (!window.confirm('Approve all submitted grades for this course?')) return;
    setIsSubmitting(true);
    try {
      await api.patch('/grades/approve', {
        classId,
        subjectId,
        termId: selectedTermId,
        status: 'approved',
      });
      setReviewGroup(null);
      refetchGrades();
      alert('Grades approved successfully.');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to approve grades.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent, classId: string, subjectId: string) => {
    e.preventDefault();
    if (!rejectionFeedback.trim()) {
      alert('Please provide feedback comments for the rejection.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.patch('/grades/approve', {
        classId,
        subjectId,
        termId: selectedTermId,
        status: 'draft',
        rejectionComment: rejectionFeedback.trim(),
      });
      setShowRejectForm(false);
      setRejectionFeedback('');
      setReviewGroup(null);
      refetchGrades();
      alert('Grades sent back to teacher for corrections.');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to reject grades.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishToggle = async (classId: string, isPublished: boolean) => {
    const actionText = isPublished ? 'publish' : 'unpublish';
    if (!window.confirm(`Are you sure you want to ${actionText} all approved grades for this class?`)) return;
    try {
      await api.patch('/grades/publish', {
        classId,
        termId: selectedTermId,
        isPublished,
      });
      refetchGrades();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to ${actionText} grades.`);
    }
  };

  // Filter groups
  const filteredGroups = groupedGrades.filter((g) => {
    const term = searchTerm.toLowerCase();
    return (
      g.className.toLowerCase().includes(term) ||
      g.subjectName.toLowerCase().includes(term) ||
      g.subjectCode.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Selector controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-80 flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
          <input
            type="text"
            placeholder="Search class or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-label-sm text-outline font-bold uppercase">Active Term:</span>
          <select
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="bg-transparent border-b-2 border-outline-variant focus:border-primary px-2 py-1.5 outline-none font-body-md font-semibold text-on-surface text-sm"
          >
            {loadingTerms ? (
              <option>Loading terms...</option>
            ) : (
              terms?.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.academicYear?.name})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Main Review List */}
      {loadingGrades ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-on-surface-variant text-sm font-medium">Fetching submitted grades...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">fact_check</span>
          <p className="font-bold text-on-surface-variant text-lg">No grade sheets found</p>
          <p className="text-on-surface-variant text-sm mt-1">There are no continuous assessment reports entered for this term yet.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-label-md text-xs uppercase">
                  <th className="py-4 px-6 font-bold">Class</th>
                  <th className="py-4 px-6 font-bold">Course</th>
                  <th className="py-4 px-6 font-bold text-center">Marks Entered</th>
                  <th className="py-4 px-6 font-bold text-center">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredGroups.map((g, index) => {
                  const status = getGroupStatus(g.records);
                  const badgeClass = getStatusBadge(status);
                  return (
                    <tr
                      key={`${g.classId}_${g.subjectId}`}
                      className={`hover:bg-surface-container-low transition-colors ${
                        index % 2 === 1 ? 'bg-surface-container-low/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-on-surface text-sm">
                        {g.className}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold">
                        <span className="text-primary mr-1 uppercase">[{g.subjectCode}]</span>
                        <span className="text-on-surface">{g.subjectName}</span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-sm text-on-surface-variant">
                        {g.records.filter(r => r.totalMark !== null).length} / {g.records.length}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 border text-xs font-bold rounded-full uppercase tracking-wider ${badgeClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => {
                            setReviewGroup(g);
                            setShowRejectForm(false);
                          }}
                          className="px-4 py-1.5 border border-outline hover:border-primary text-on-surface-variant hover:text-primary transition-all font-label-sm text-xs rounded-lg font-bold"
                        >
                          Review Marks
                        </button>
                        {status === 'Approved (Unpublished)' && (
                          <button
                            onClick={() => handlePublishToggle(g.classId, true)}
                            className="px-4 py-1.5 bg-secondary text-on-secondary hover:opacity-90 active:scale-95 transition-all font-label-sm text-xs rounded-lg font-bold"
                          >
                            Publish
                          </button>
                        )}
                        {status === 'Published' && (
                          <button
                            onClick={() => handlePublishToggle(g.classId, false)}
                            className="px-4 py-1.5 border border-error text-error hover:bg-error-container/10 transition-all font-label-sm text-xs rounded-lg font-bold"
                          >
                            Unpublish
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Action Modal */}
      {reviewGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-headline-sm text-primary font-bold">Review continuous assessments</h3>
                <p className="text-xs text-on-surface-variant mt-0.5 font-semibold">
                  Class: {reviewGroup.className} | Course: [{reviewGroup.subjectCode}] {reviewGroup.subjectName}
                </p>
              </div>
              <button
                onClick={() => setReviewGroup(null)}
                className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-6 border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-80 overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-label-md text-xs uppercase sticky top-0">
                    <tr>
                      <th className="py-3 px-4 font-bold">Admission No</th>
                      <th className="py-3 px-4 font-bold">Student Name</th>
                      <th className="py-3 px-4 font-bold text-center">CA Mark</th>
                      <th className="py-3 px-4 font-bold text-center">Exam Mark</th>
                      <th className="py-3 px-4 font-bold text-center">Total (100)</th>
                      <th className="py-3 px-4 font-bold text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {reviewGroup.records.map((r, idx) => (
                      <tr key={r.id} className={idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}>
                        <td className="py-2.5 px-4 font-mono font-bold text-on-surface-variant">{r.student.admissionNumber}</td>
                        <td className="py-2.5 px-4 font-bold text-on-surface">{r.student.user.firstName} {r.student.user.lastName}</td>
                        <td className="py-2.5 px-4 text-center font-semibold text-on-surface-variant">{r.caMark ?? '-'}</td>
                        <td className="py-2.5 px-4 text-center font-semibold text-on-surface-variant">{r.examMark ?? '-'}</td>
                        <td className="py-2.5 px-4 text-center font-bold text-primary">{r.totalMark ?? '-'}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-block w-8 h-6 bg-surface-container-high font-bold text-xs rounded text-center leading-6 text-on-surface">
                            {r.gradeLetter ?? '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Decision actions */}
            {getGroupStatus(reviewGroup.records) === 'Pending Approval' && (
              <div className="space-y-4 pt-4 border-t border-outline-variant">
                {!showRejectForm ? (
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="px-5 py-2.5 border border-error text-error font-bold rounded-lg hover:bg-error-container/10 active:scale-95 transition-all text-xs"
                    >
                      Reject Grade Sheet
                    </button>
                    <button
                      onClick={() => handleApprove(reviewGroup.classId, reviewGroup.subjectId)}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-xs"
                    >
                      Approve Grade Sheet
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleReject(e, reviewGroup.classId, reviewGroup.subjectId)} className="space-y-3">
                    <div>
                      <label className="block text-label-md text-error font-bold mb-1.5">Feedback & Rejection Comments</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="State clearly what corrections are needed (e.g. Missing grades, typos, incorrect exam ratios)..."
                        value={rejectionFeedback}
                        onChange={(e) => setRejectionFeedback(e.target.value)}
                        className="w-full p-3 border border-error/30 focus:border-error rounded-xl outline-none bg-transparent text-on-surface text-sm transition-colors"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="px-4 py-2 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container transition-all text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-error text-on-error font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs"
                      >
                        Submit Rejection
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
