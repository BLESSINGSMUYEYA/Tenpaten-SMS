import { useState } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';
import { useQuery } from '../hooks/useApi';
import { api } from '../services/api';

interface GradingRule {
  id: string;
  gradeSymbol: string;
  minPercentage: number;
  maxPercentage: number;
  classification: string;
}

interface GradingScale {
  id: string;
  name: string;
  isDefault: boolean;
  rules: GradingRule[];
}

export const DeputyHeadAcademics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'performance' | 'scales'>('performance');

  const { data: scales, refetch: refetchScales } = useQuery<GradingScale[]>('/schools/grading-scales', view === 'scales');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newScaleName, setNewScaleName] = useState('');
  const [isDefaultScale, setIsDefaultScale] = useState(false);
  const [scaleRules, setScaleRules] = useState<Array<{
    gradeSymbol: string;
    minPercentage: number;
    maxPercentage: number;
    classification: string;
  }>>([
    { gradeSymbol: '1', minPercentage: 80, maxPercentage: 100, classification: 'Distinction' },
    { gradeSymbol: '2', minPercentage: 75, maxPercentage: 79, classification: 'Distinction' },
    { gradeSymbol: '3', minPercentage: 70, maxPercentage: 74, classification: 'Credit' },
    { gradeSymbol: '4', minPercentage: 65, maxPercentage: 69, classification: 'Credit' },
    { gradeSymbol: '5', minPercentage: 60, maxPercentage: 64, classification: 'Credit' },
    { gradeSymbol: '6', minPercentage: 50, maxPercentage: 59, classification: 'Credit' },
    { gradeSymbol: '7', minPercentage: 45, maxPercentage: 49, classification: 'Pass' },
    { gradeSymbol: '8', minPercentage: 40, maxPercentage: 44, classification: 'Pass' },
    { gradeSymbol: '9', minPercentage: 0, maxPercentage: 39, classification: 'Fail' },
  ]);

  const handleAddRuleRow = () => {
    setScaleRules(prev => [...prev, { gradeSymbol: '', minPercentage: 0, maxPercentage: 100, classification: '' }]);
  };

  const handleRemoveRuleRow = (index: number) => {
    setScaleRules(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleRuleChange = (index: number, field: string, value: any) => {
    setScaleRules(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveScale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScaleName) return;

    try {
      await api.post('/schools/grading-scales', {
        name: newScaleName,
        isDefault: isDefaultScale,
        rules: scaleRules.map(r => ({
          gradeSymbol: r.gradeSymbol,
          minPercentage: parseFloat(r.minPercentage as any) || 0,
          maxPercentage: parseFloat(r.maxPercentage as any) || 0,
          classification: r.classification,
        })),
      });
      setIsModalOpen(false);
      setNewScaleName('');
      setIsDefaultScale(false);
      refetchScales();
      alert('Grading scale created successfully.');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create grading scale.');
    }
  };

  const handleDeleteScale = async (id: string) => {
    if (!confirm('Are you sure you want to delete this grading scale?')) return;
    try {
      await api.delete(`/schools/grading-scales/${id}`);
      refetchScales();
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete grading scale.');
    }
  };

  const classesPerformance = [
    { id: 1, name: 'Form 3A - Mathematics', teacher: 'Dr. Samuel Okoro', enrolled: 35, avgScore: 82, status: 'Excellent' },
    { id: 2, name: 'Form 4B - Physics', teacher: 'Mrs. Sarah Mwangi', enrolled: 28, avgScore: 71, status: 'Good' },
    { id: 3, name: 'Form 2C - Mathematics', teacher: 'Miss Amina Bello', enrolled: 40, avgScore: 70, status: 'Good' },
    { id: 4, name: 'Form 1A - Chemistry', teacher: 'Mr. Kofi Boateng', enrolled: 30, avgScore: 48, status: 'Review' },
  ];

  const filteredPerformance = classesPerformance.filter(
    (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Administration</span>
              <span>/</span>
              <span className="text-primary font-bold">Academics</span>
            </nav>
            <h1 className="dash-page-title">Academics Settings & Performance</h1>
            <p className="font-body-md text-on-surface-variant">Oversee school-wide continuous assessments, configure grading scales, and review metrics.</p>
          </div>
          {view === 'scales' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs shadow-sm self-start md:self-end"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create Grading Scale
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6 border-b border-outline-variant">
          {(['performance', 'scales'] as const).map(v => (
            <button
              key={v}
              onClick={() => { setView(v); }}
              className={`px-5 py-2 font-label-md font-bold border-b-2 transition-all capitalize ${
                view === v ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {v === 'performance' ? '📊 Performance Metrics' : '⚙️ Grading Scales'}
            </button>
          ))}
        </div>

        {view === 'performance' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop mb-8">
              <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined" data-icon="percent">percent</span>
                </div>
                <div>
                  <p className="text-on-surface-variant font-label-md">School Pass Rate</p>
                  <h3 className="font-headline-md text-primary mt-1">84.2%</h3>
                </div>
              </div>
              <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined" data-icon="emoji_events">emoji_events</span>
                </div>
                <div>
                  <p className="text-on-surface-variant font-label-md">Top Performing Class</p>
                  <h3 className="font-headline-md text-secondary mt-1">Form 3A (Maths)</h3>
                </div>
              </div>
              <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-6 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                  <span className="material-symbols-outlined" data-icon="trending_up">trending_up</span>
                </div>
                <div>
                  <p className="text-on-surface-variant font-label-md">Growth vs Last Term</p>
                  <h3 className="font-headline-md text-tertiary mt-1">+3.4%</h3>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-4 rounded-xl shadow-sm mb-6 flex items-center">
              <div className="relative w-full md:w-96 flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
                <input
                  type="text"
                  placeholder="Search classes or teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant border-b border-surface-border dark:border-outline-variant font-label-md text-xs uppercase">
                      <th className="py-4 px-6 font-bold">Class & Course</th>
                      <th className="py-4 px-6 font-bold">Assigned Instructor</th>
                      <th className="py-4 px-4 font-bold text-center">Enrolled</th>
                      <th className="py-4 px-6 font-bold">Class Average Score</th>
                      <th className="py-4 px-6 font-bold text-center">Status</th>
                      <th className="py-4 px-6 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border dark:divide-outline-variant">
                    {filteredPerformance.length > 0 ? (
                      filteredPerformance.map((c, index) => {
                        const statusBadgeClass = c.status === 'Excellent'
                          ? 'bg-secondary-container/15 border-secondary text-secondary'
                          : c.status === 'Good'
                          ? 'bg-primary-container/15 border-primary text-primary'
                          : 'bg-error-container/15 border-error text-error';
                        const barColor = c.avgScore >= 80
                          ? 'bg-secondary'
                          : c.avgScore >= 60
                          ? 'bg-primary'
                          : 'bg-error';
                        return (
                          <tr
                            key={c.id}
                            className={`hover:bg-surface-container-low transition-colors ${
                              index % 2 === 1 ? 'bg-surface-container-low/30' : ''
                            }`}
                          >
                            <td className="py-4 px-6">
                              <span className="font-title-sm text-on-surface font-bold">{c.name}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-body-md text-on-surface-variant">{c.teacher}</span>
                            </td>
                            <td className="py-4 px-4 text-center font-body-md text-on-surface">{c.enrolled} Students</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4 w-60">
                                <span className="font-body-md font-bold text-on-surface w-10">{c.avgScore}%</span>
                                <div className="flex-1 h-2.5 bg-surface-container rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${barColor} transition-all duration-500`}
                                    style={{ width: `${c.avgScore}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-block px-3 py-1 border text-xs font-bold rounded-full uppercase tracking-wider ${statusBadgeClass}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button className="px-3.5 py-1.5 border border-outline hover:border-primary text-on-surface-variant hover:text-primary transition-all font-label-sm text-xs rounded-lg">
                                Review Analytics
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
                          <p className="font-body-md">No classes matched your search query</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {view === 'scales' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-desktop">
            {scales && scales.length > 0 ? (
              scales.map(scale => (
                <div key={scale.id} className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-title-md font-bold text-on-surface">{scale.name}</h3>
                        {scale.isDefault && (
                          <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary-container text-on-primary-container text-[10px] font-bold rounded-full border border-primary/10 uppercase tracking-wider">
                            Default Scale
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteScale(scale.id)}
                        className="text-error hover:text-error/80 p-1 rounded hover:bg-error-container/10 transition-colors"
                        title="Delete Scale"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>

                    <div className="divide-y divide-outline-variant/30 text-body-sm max-h-60 overflow-y-auto pr-1">
                      {scale.rules.map(rule => (
                        <div key={rule.id} className="py-2 flex justify-between items-center">
                          <span className="w-12 h-6 rounded bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-xs">
                            {rule.gradeSymbol}
                          </span>
                          <span className="font-semibold text-on-surface-variant">{rule.minPercentage}% - {rule.maxPercentage}%</span>
                          <span className="text-xs text-outline font-medium italic">{rule.classification}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-4xl mb-2 text-outline">tune</span>
                <p className="font-body-md">No grading scales created yet.</p>
              </div>
            )}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-slide-in-bottom">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary font-bold">Create Grading Scale</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveScale} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Scale Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MSCE 9-Point Scale"
                      value={newScaleName}
                      onChange={(e) => setNewScaleName(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <input
                      type="checkbox"
                      id="isDefaultScale"
                      checked={isDefaultScale}
                      onChange={(e) => setIsDefaultScale(e.target.checked)}
                      className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary bg-transparent"
                    />
                    <label htmlFor="isDefaultScale" className="text-body-md text-on-surface font-semibold cursor-pointer select-none">
                      Set as Default Grading Scale
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-label-lg font-bold text-on-surface-variant">Grade Rules & Thresholds</h4>
                    <button
                      type="button"
                      onClick={handleAddRuleRow}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary-high font-bold border border-primary/20 hover:border-primary px-3 py-1.5 rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">add</span> Add Grade Row
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 text-label-sm font-bold text-outline text-[11px] uppercase tracking-wider px-2">
                      <div className="col-span-3">Grade Symbol</div>
                      <div className="col-span-3">Min %</div>
                      <div className="col-span-3">Max %</div>
                      <div className="col-span-2">Classification</div>
                      <div className="col-span-1"></div>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {scaleRules.map((rule, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-surface-container/30 p-2 rounded-lg border border-outline-variant/20">
                          <div className="col-span-3">
                            <input
                              type="text"
                              required
                              placeholder="A, 1, Distinction..."
                              value={rule.gradeSymbol}
                              onChange={(e) => handleRuleChange(idx, 'gradeSymbol', e.target.value)}
                              className="w-full px-2 py-1 bg-surface-container border border-outline-variant rounded text-on-surface text-center font-bold text-sm"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              required
                              min={0}
                              max={100}
                              value={rule.minPercentage}
                              onChange={(e) => handleRuleChange(idx, 'minPercentage', e.target.value)}
                              className="w-full px-2 py-1 bg-surface-container border border-outline-variant rounded text-on-surface text-center text-sm"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              required
                              min={0}
                              max={100}
                              value={rule.maxPercentage}
                              onChange={(e) => handleRuleChange(idx, 'maxPercentage', e.target.value)}
                              className="w-full px-2 py-1 bg-surface-container border border-outline-variant rounded text-on-surface text-center text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              required
                              placeholder="Credit..."
                              value={rule.classification}
                              onChange={(e) => handleRuleChange(idx, 'classification', e.target.value)}
                              className="w-full px-2 py-1 bg-surface-container border border-outline-variant rounded text-on-surface text-xs"
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRuleRow(idx)}
                              disabled={scaleRules.length <= 1}
                              className="text-error hover:text-error/80 disabled:opacity-40 p-1"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-sm pt-4 border-t border-outline-variant">
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
                    Save Scale
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

export default DeputyHeadAcademics;
