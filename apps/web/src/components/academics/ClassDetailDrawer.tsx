import React, { useState } from 'react';
import { useQuery } from '../../hooks/useApi';

interface ClassDetailDrawerProps {
  classId: string;
  className: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ClassDetailDrawer: React.FC<ClassDetailDrawerProps> = ({
  classId,
  className,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'subjects'>('students');

  // Fetch students enrolled in this class
  const { data: students, loading: loadingStudents } = useQuery<any[]>(
    isOpen ? `/people/students?classId=${classId}` : '',
    isOpen && !!classId,
    [classId]
  );

  // Fetch subject assignments for this class
  const { data: assignments, loading: loadingAssignments } = useQuery<any[]>(
    isOpen ? `/schools/class-subjects?classId=${classId}` : '',
    isOpen && !!classId,
    [classId]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-lg bg-surface-container-lowest border-l border-outline-variant shadow-2xl flex flex-col h-full animate-slide-in-right">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low shrink-0">
            <div>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase tracking-wider">
                Class Directory
              </span>
              <h2 className="text-headline-md font-bold text-on-surface mt-1.5">{className} Details</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Tab Selector */}
          <div className="px-6 border-b border-outline-variant/60 flex gap-4 bg-surface-container-lowest shrink-0">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-3 font-label-md font-bold border-b-2 transition-all flex items-center gap-1.5 text-sm ${
                activeTab === 'students' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              Students ({loadingStudents ? '...' : students?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`py-3 font-label-md font-bold border-b-2 transition-all flex items-center gap-1.5 text-sm ${
                activeTab === 'subjects' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">book</span>
              Subjects ({loadingAssignments ? '...' : assignments?.length || 0})
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-surface">
            {activeTab === 'students' ? (
              loadingStudents ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <p className="text-on-surface-variant text-xs font-semibold">Loading student list...</p>
                </div>
              ) : !students || students.length === 0 ? (
                <div className="text-center py-16 opacity-60">
                  <span className="material-symbols-outlined text-4xl mb-1 text-outline">group</span>
                  <p className="font-bold text-sm text-on-surface">No students enrolled</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Use the student directory to register scholars into this class.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student: any) => (
                    <div
                      key={student.id}
                      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex justify-between items-center shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {student.user.firstName[0]}{student.user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface">
                            {student.user.firstName} {student.user.lastName}
                          </p>
                          <p className="text-xs font-mono font-bold text-outline mt-0.5">
                            Admisson: {student.admissionNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high border border-outline-variant text-on-surface-variant capitalize">
                          {student.boardingStatus}
                        </span>
                        <p className="text-[10px] text-outline capitalize mt-1">
                          Gender: {student.gender || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Subjects assignments tab */
              loadingAssignments ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <p className="text-on-surface-variant text-xs font-semibold">Loading assignments...</p>
                </div>
              ) : !assignments || assignments.length === 0 ? (
                <div className="text-center py-16 opacity-60">
                  <span className="material-symbols-outlined text-4xl mb-1 text-outline">menu_book</span>
                  <p className="font-bold text-sm text-on-surface">No subjects assigned</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Define subject curricula in the Subjects tab.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((a: any) => (
                    <div
                      key={a.id}
                      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex justify-between items-center shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-primary bg-primary-container/10 px-2 py-0.5 rounded border border-primary/10 uppercase">
                            {a.subject.code}
                          </span>
                          <span className="font-bold text-sm text-on-surface">{a.subject.name}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">person</span>
                          {a.teacher ? (
                            <span className="font-semibold text-on-surface">
                              {a.teacher.firstName} {a.teacher.lastName}
                            </span>
                          ) : (
                            <span className="text-error font-medium italic">Unassigned</span>
                          )}
                        </p>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        a.subject.isCore
                          ? 'bg-primary-container/10 border-primary text-primary'
                          : 'bg-surface-container-high border-outline-variant text-on-surface-variant'
                      }`}>
                        {a.subject.isCore ? 'Core' : 'Elective'}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
