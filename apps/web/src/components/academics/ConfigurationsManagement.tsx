import React, { useState } from 'react';
import { useQuery } from '../../hooks/useApi';
import { api } from '../../services/api';

export const ConfigurationsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'years' | 'terms' | 'timetable'>('years');
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Year Form State
  const [yearName, setYearName] = useState('');
  const [yearStartDate, setYearStartDate] = useState('');
  const [yearEndDate, setYearEndDate] = useState('');
  const [yearIsCurrent, setYearIsCurrent] = useState(false);

  // Term Form State
  const [termName, setTermName] = useState('');
  const [termAcademicYearId, setTermAcademicYearId] = useState('');
  const [termStartDate, setTermStartDate] = useState('');
  const [termEndDate, setTermEndDate] = useState('');
  const [termIsCurrent, setTermIsCurrent] = useState(false);

  // Queries
  const { data: years, loading: loadingYears, refetch: refetchYears } =
    useQuery<any[]>('/schools/academic-years');

  const { data: terms, loading: loadingTerms, refetch: refetchTerms } =
    useQuery<any[]>('/schools/terms');

  const { data: mySchool, loading: loadingSchool, refetch: refetchSchool } =
    useQuery<any>('/schools/my-school', activeTab === 'timetable');

  const [timetableConfig, setTimetableConfig] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (mySchool?.timetableConfig) {
      setTimetableConfig(mySchool.timetableConfig);
    } else if (activeTab === 'timetable' && timetableConfig.length === 0) {
      // Default config
      setTimetableConfig([
        { periodNumber: 1, startTime: '08:00', endTime: '09:00', label: 'Period 1' },
        { periodNumber: 2, startTime: '09:00', endTime: '10:00', label: 'Period 2' },
        { isBreak: true, startTime: '10:00', endTime: '10:30', label: 'Morning Recess', icon: 'coffee' },
        { periodNumber: 3, startTime: '10:30', endTime: '11:30', label: 'Period 3' },
        { periodNumber: 4, startTime: '11:30', endTime: '12:30', label: 'Period 4' },
        { isBreak: true, startTime: '12:30', endTime: '13:30', label: 'Lunch Break', icon: 'lunch_dining' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:30', label: 'Period 5' },
        { periodNumber: 6, startTime: '14:30', endTime: '15:30', label: 'Period 6' }
      ]);
    }
  }, [mySchool, activeTab]);

  const handleSaveTimetableConfig = async () => {
    setIsSubmitting(true);
    try {
      await api.patch('/schools/my-school/timetable-config', { timetableConfig });
      alert('Timetable configuration saved successfully!');
      refetchSchool();
    } catch (err: any) {
      console.error(err);
      alert('Failed to save timetable configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPeriod = () => {
    const nextPeriodNum = timetableConfig.filter(c => !c.isBreak).length + 1;
    setTimetableConfig([...timetableConfig, { periodNumber: nextPeriodNum, startTime: '', endTime: '', label: `Period ${nextPeriodNum}` }]);
  };

  const addBreak = () => {
    setTimetableConfig([...timetableConfig, { isBreak: true, startTime: '', endTime: '', label: 'Break', icon: 'coffee' }]);
  };

  const updateConfigItem = (index: number, field: string, value: any) => {
    const newConfig = [...timetableConfig];
    newConfig[index] = { ...newConfig[index], [field]: value };
    setTimetableConfig(newConfig);
  };

  const removeConfigItem = (index: number) => {
    if (!window.confirm('Remove this slot from the timetable configuration?')) return;
    const newConfig = timetableConfig.filter((_, i) => i !== index);
    
    // Re-number periods
    let pNum = 1;
    newConfig.forEach(c => {
      if (!c.isBreak) {
        c.periodNumber = pNum++;
        if (c.label.startsWith('Period ')) c.label = `Period ${c.periodNumber}`;
      }
    });
    setTimetableConfig(newConfig);
  };

  const handleOpenYearModal = () => {
    setYearName('');
    setYearStartDate('');
    setYearEndDate('');
    setYearIsCurrent(false);
    setFormError(null);
    setIsYearModalOpen(true);
  };

  const handleOpenTermModal = () => {
    setTermName('');
    setTermAcademicYearId(years && years.length > 0 ? years[0].id : '');
    setTermStartDate('');
    setTermEndDate('');
    setTermIsCurrent(false);
    setFormError(null);
    setIsTermModalOpen(true);
  };

  const handleSaveYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearName.trim() || !yearStartDate || !yearEndDate) {
      setFormError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.post('/schools/academic-years', {
        name: yearName.trim(),
        startDate: new Date(yearStartDate).toISOString(),
        endDate: new Date(yearEndDate).toISOString(),
        isCurrent: yearIsCurrent,
      });
      setIsYearModalOpen(false);
      refetchYears();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to create academic year.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termName.trim() || !termAcademicYearId || !termStartDate || !termEndDate) {
      setFormError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.post('/schools/terms', {
        academicYearId: termAcademicYearId,
        name: termName.trim(),
        startDate: new Date(termStartDate).toISOString(),
        endDate: new Date(termEndDate).toISOString(),
        isCurrent: termIsCurrent,
      });
      setIsTermModalOpen(false);
      refetchTerms();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to create term.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetYearCurrent = async (id: string, name: string) => {
    if (!window.confirm(`Set "${name}" as the active academic year?`)) return;
    try {
      await api.patch(`/schools/academic-years/${id}`, { isCurrent: true });
      refetchYears();
    } catch (err: any) {
      console.error(err);
      alert('Failed to update year.');
    }
  };

  const handleSetTermCurrent = async (id: string, name: string) => {
    if (!window.confirm(`Set "${name}" as the active school term?`)) return;
    try {
      await api.patch(`/schools/terms/${id}`, { isCurrent: true });
      refetchTerms();
    } catch (err: any) {
      console.error(err);
      alert('Failed to update term.');
    }
  };

  const handleDeleteYear = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete academic year "${name}"?`)) return;
    try {
      await api.delete(`/schools/academic-years/${id}`);
      refetchYears();
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete academic year.');
    }
  };

  const handleDeleteTerm = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete term "${name}"?`)) return;
    try {
      await api.delete(`/schools/terms/${id}`);
      refetchTerms();
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete term.');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab select */}
      <div className="flex gap-2 border-b border-outline-variant/60">
        <button
          onClick={() => setActiveTab('years')}
          className={`px-5 py-2 font-label-md font-bold border-b-2 transition-all capitalize ${
            activeTab === 'years' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          📅 Academic Years
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-5 py-2 font-label-md font-bold border-b-2 transition-all capitalize ${
            activeTab === 'terms' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          ⏱️ School Terms
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-5 py-2 font-label-md font-bold border-b-2 transition-all capitalize ${
            activeTab === 'timetable' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          🕒 Timetable Structure
        </button>
      </div>

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm">
        <div>
          <h3 className="font-bold text-on-background">
            {activeTab === 'years' ? 'Manage Academic Sessions' : activeTab === 'terms' ? 'Manage Grading & Scheduling Terms' : 'Manage Timetable Structure'}
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {activeTab === 'timetable' ? 'Configure periods and breaks for the school timetable.' : 'Configure active calendar periods and handle transitions.'}
          </p>
        </div>
        {activeTab === 'years' ? (
          <button
            onClick={handleOpenYearModal}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Academic Year
          </button>
        ) : activeTab === 'terms' ? (
          <button
            onClick={handleOpenTermModal}
            disabled={!years || years.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create School Term
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={addBreak}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-surface-container text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-all text-sm border border-outline-variant"
            >
              <span className="material-symbols-outlined text-[18px]">coffee</span> Add Break
            </button>
            <button
              onClick={addPeriod}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span> Add Period
            </button>
          </div>
        )}
      </div>

      {/* Render tables */}
      {activeTab === 'years' ? (
        loadingYears ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-on-surface-variant text-sm font-medium">Loading academic years...</p>
          </div>
        ) : !years || years.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">calendar_today</span>
            <p className="font-bold text-on-surface-variant text-lg">No academic years configured</p>
            <p className="text-on-surface-variant text-sm mt-1">Set up your school calendar by adding the first year.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-label-md text-xs uppercase">
                    <th className="py-4 px-6 font-bold">Academic Session</th>
                    <th className="py-4 px-6 font-bold">Start Date</th>
                    <th className="py-4 px-6 font-bold">End Date</th>
                    <th className="py-4 px-6 font-bold text-center">Status</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {years.map((y: any, index: number) => (
                    <tr
                      key={y.id}
                      className={`hover:bg-surface-container-low transition-colors ${
                        index % 2 === 1 ? 'bg-surface-container-low/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-on-surface text-sm">
                        {y.name}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant text-sm">
                        {formatDate(y.startDate)}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant text-sm">
                        {formatDate(y.endDate)}
                      </td>
                      <td className="py-4 px-6 text-center text-sm">
                        {y.isCurrent ? (
                          <span className="px-3 py-1 text-xs font-bold bg-primary-container text-on-primary-container rounded-full border border-primary/20 uppercase tracking-wider">
                            Active Year
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetYearCurrent(y.id, y.name)}
                            className="px-3 py-1 text-xs font-bold text-primary hover:bg-primary-container/10 border border-primary/20 rounded-full transition-all uppercase tracking-wider"
                          >
                            Set Active
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteYear(y.id, y.name)}
                          disabled={y.isCurrent}
                          className="text-error hover:text-error/80 disabled:opacity-30 p-1.5 rounded hover:bg-error-container/10 transition-colors"
                          title={y.isCurrent ? 'Cannot delete the active year' : 'Delete Year'}
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
        )
      ) : activeTab === 'terms' ? (
        /* Terms table */
        loadingTerms ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-on-surface-variant text-sm font-medium">Loading school terms...</p>
          </div>
        ) : !terms || terms.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">date_range</span>
            <p className="font-bold text-on-surface-variant text-lg">No terms configured</p>
            <p className="text-on-surface-variant text-sm mt-1">Set up grading intervals by adding the first term.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-label-md text-xs uppercase">
                    <th className="py-4 px-6 font-bold">Term Name</th>
                    <th className="py-4 px-6 font-bold">Academic Session</th>
                    <th className="py-4 px-6 font-bold">Start Date</th>
                    <th className="py-4 px-6 font-bold">End Date</th>
                    <th className="py-4 px-6 font-bold text-center">Status</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {terms.map((t: any, index: number) => (
                    <tr
                      key={t.id}
                      className={`hover:bg-surface-container-low transition-colors ${
                        index % 2 === 1 ? 'bg-surface-container-low/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-on-surface text-sm">
                        {t.name}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant text-sm font-semibold">
                        {t.academicYear?.name}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant text-sm">
                        {formatDate(t.startDate)}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant text-sm">
                        {formatDate(t.endDate)}
                      </td>
                      <td className="py-4 px-6 text-center text-sm">
                        {t.isCurrent ? (
                          <span className="px-3 py-1 text-xs font-bold bg-primary-container text-on-primary-container rounded-full border border-primary/20 uppercase tracking-wider">
                            Active Term
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetTermCurrent(t.id, t.name)}
                            className="px-3 py-1 text-xs font-bold text-primary hover:bg-primary-container/10 border border-primary/20 rounded-full transition-all uppercase tracking-wider"
                          >
                            Set Active
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteTerm(t.id, t.name)}
                          disabled={t.isCurrent}
                          className="text-error hover:text-error/80 disabled:opacity-30 p-1.5 rounded hover:bg-error-container/10 transition-colors"
                          title={t.isCurrent ? 'Cannot delete the active term' : 'Delete Term'}
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
        )
      ) : (
        /* Timetable Structure Config */
        loadingSchool ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-on-surface-variant text-sm font-medium">Loading timetable configuration...</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
              <h4 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <span className="material-symbols-outlined">schedule</span>
                Daily Timetable Slots
              </h4>
              <button
                onClick={handleSaveTimetableConfig}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {timetableConfig.map((item, index) => (
                <div key={index} className={`flex items-center gap-4 p-3 rounded-xl border ${item.isBreak ? 'bg-surface-container border-outline-variant/50 border-dashed' : 'bg-surface border-outline-variant'} transition-colors hover:border-primary/50`}>
                  
                  {/* Handle Reordering in future if needed. For now just delete/add */}
                  <div className="flex items-center justify-center w-8 shrink-0 text-on-surface-variant font-bold">
                    {index + 1}
                  </div>

                  <div className="flex-1 grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Label</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => updateConfigItem(index, 'label', e.target.value)}
                        className="w-full px-2 py-1.5 border border-outline-variant rounded bg-transparent text-sm font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Start Time</label>
                      <input
                        type="time"
                        value={item.startTime}
                        onChange={e => updateConfigItem(index, 'startTime', e.target.value)}
                        className="w-full px-2 py-1.5 border border-outline-variant rounded bg-transparent text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">End Time</label>
                      <input
                        type="time"
                        value={item.endTime}
                        onChange={e => updateConfigItem(index, 'endTime', e.target.value)}
                        className="w-full px-2 py-1.5 border border-outline-variant rounded bg-transparent text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <div className="flex items-center gap-2 py-1.5 px-2 bg-surface-container rounded border border-outline-variant/50 text-xs text-on-surface-variant font-semibold">
                        <span className="material-symbols-outlined text-[16px]">
                          {item.isBreak ? (item.icon || 'coffee') : 'menu_book'}
                        </span>
                        {item.isBreak ? 'Break' : 'Class'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeConfigItem(index)}
                    className="w-8 h-8 flex items-center justify-center shrink-0 rounded-full text-error hover:bg-error-container/20 transition-colors"
                    title="Remove slot"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              ))}
              {timetableConfig.length === 0 && (
                <div className="text-center py-8 text-on-surface-variant font-medium">
                  No slots configured. Add a period or break to start.
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* Modal Year Creation */}
      {isYearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary font-bold">Add Academic Year</h3>
              <button
                onClick={() => setIsYearModalOpen(false)}
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

            <form onSubmit={handleSaveYear} className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Session Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025/2026"
                  value={yearName}
                  onChange={(e) => setYearName(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Start Date</label>
                <input
                  type="date"
                  required
                  value={yearStartDate}
                  onChange={(e) => setYearStartDate(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">End Date</label>
                <input
                  type="date"
                  required
                  value={yearEndDate}
                  onChange={(e) => setYearEndDate(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="yearIsCurrent"
                  checked={yearIsCurrent}
                  onChange={(e) => setYearIsCurrent(e.target.checked)}
                  className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary bg-transparent"
                />
                <label htmlFor="yearIsCurrent" className="text-body-md text-on-surface font-semibold cursor-pointer select-none">
                  Set as current academic year immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsYearModalOpen(false)}
                  className="px-5 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Saving...' : 'Save Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Term Creation */}
      {isTermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary font-bold">Add School Term</h3>
              <button
                onClick={() => setIsTermModalOpen(false)}
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

            <form onSubmit={handleSaveTerm} className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Select Academic Session</label>
                <select
                  required
                  value={termAcademicYearId}
                  onChange={(e) => setTermAcademicYearId(e.target.value)}
                  className="w-full px-3 py-2.5 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                >
                  {years?.map((y: any) => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.isCurrent ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Term Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1, Term 2"
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Start Date</label>
                <input
                  type="date"
                  required
                  value={termStartDate}
                  onChange={(e) => setTermStartDate(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">End Date</label>
                <input
                  type="date"
                  required
                  value={termEndDate}
                  onChange={(e) => setTermEndDate(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="termIsCurrent"
                  checked={termIsCurrent}
                  onChange={(e) => setTermIsCurrent(e.target.checked)}
                  className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary bg-transparent"
                />
                <label htmlFor="termIsCurrent" className="text-body-md text-on-surface font-semibold cursor-pointer select-none">
                  Set as current active term immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsTermModalOpen(false)}
                  className="px-5 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Saving...' : 'Save Term'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
