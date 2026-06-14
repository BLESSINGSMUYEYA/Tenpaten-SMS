import { useState } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';

export const DeputyHeadAcademics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [searchTerm, setSearchTerm] = useState('');

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
        {/* Breadcrumbs & Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Administration</span>
              <span>/</span>
              <span className="text-primary font-bold">Academics</span>
            </nav>
            <h1 className="dash-page-title">Academic Performance</h1>
            <p className="font-body-md text-on-surface-variant">Oversee continuous assessment scores, grade averages, and track term milestones.</p>
          </div>
          <div className="flex gap-2 self-start md:self-end">
            <button className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-primary text-primary font-bold rounded-lg hover:bg-surface-container-low active:scale-95 transition-all text-xs">
              <span className="material-symbols-outlined text-[18px]">print</span>
              Print Reports
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs shadow-sm">
              <span className="material-symbols-outlined text-[18px]">publish</span>
              Publish Results
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
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

        {/* Filter bar */}
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

        {/* Performance Grid */}
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
      </main>
      <BottomNav />
    </>
  );
};
