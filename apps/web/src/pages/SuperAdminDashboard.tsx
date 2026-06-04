import React, { useState } from 'react';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';

export const SuperAdminDashboard: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col lg:ml-[280px] w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 p-gutter md:p-margin-desktop overflow-y-auto bg-surface-bright">
          {/* Page Header */}
          <div className="mb-lg flex flex-col sm:flex-row sm:justify-between sm:items-end gap-md">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface mb-xs font-bold">Platform Overview</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Live metrics and system health for EduCore.</p>
            </div>
            <button className="flex items-center justify-center gap-sm bg-primary text-on-primary px-4 py-2.5 rounded-lg hover:bg-primary-container transition-colors shadow-sm self-start sm:self-auto active:scale-95">
              <span className="material-symbols-outlined text-sm">download</span>
              <span className="font-label-md text-label-md">Export Report</span>
            </button>
          </div>

          {/* Bento Grid: Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-lg cards-stagger">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-default relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-fixed-dim rounded-bl-full opacity-20 -z-0 group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start mb-lg relative z-10">
                <h3 className="font-label-md text-label-md text-on-surface-variant font-medium">Total Schools</h3>
                <span className="material-symbols-outlined text-primary">domain</span>
              </div>
              <div className="relative z-10">
                <p className="font-headline-lg text-headline-lg text-on-surface font-bold">142</p>
                <p className="font-label-sm text-label-sm text-secondary flex items-center gap-1 mt-1 font-medium">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span> +12 this month
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-default relative overflow-hidden group shadow-sm">
              <div className="flex justify-between items-start mb-lg relative z-10">
                <h3 className="font-label-md text-label-md text-on-surface-variant font-medium">Total Students</h3>
                <span className="material-symbols-outlined text-primary">groups</span>
              </div>
              <div className="relative z-10">
                <p className="font-headline-lg text-headline-lg text-on-surface font-bold">45,890</p>
                <p className="font-label-sm text-label-sm text-secondary flex items-center gap-1 mt-1 font-medium">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span> +5.2% vs last term
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-default relative overflow-hidden group shadow-sm">
              <div className="flex justify-between items-start mb-lg relative z-10">
                <h3 className="font-label-md text-label-md text-on-surface-variant font-medium">Monthly Revenue</h3>
                <span className="material-symbols-outlined text-primary">payments</span>
              </div>
              <div className="relative z-10">
                <p className="font-headline-lg text-headline-lg text-on-surface font-bold">$124.5k</p>
                <p className="font-label-sm text-label-sm text-secondary flex items-center gap-1 mt-1 font-medium">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span> +$8.4k MRR
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-default relative overflow-hidden group shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low to-surface-container-lowest opacity-40 -z-10"></div>
              <div className="flex justify-between items-start mb-lg relative z-10">
                <h3 className="font-label-md text-label-md text-on-surface-variant font-medium">System Health</h3>
                <span className="material-symbols-outlined text-secondary">check_circle</span>
              </div>
              <div className="relative z-10">
                <p className="font-headline-lg text-headline-lg text-on-surface font-bold">99.9%</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 font-medium">Uptime (Last 30 days)</p>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low rounded-t-xl">
                <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">School Growth Trend</h2>
                <select className="bg-surface border border-outline-variant rounded-lg px-2 py-1 font-label-sm text-label-sm text-on-surface-variant focus:outline-none focus:border-primary cursor-pointer">
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="p-md flex-1 min-h-[300px] flex items-end justify-between gap-4 relative">
                {/* Chart Grid Lines */}
                <div className="absolute inset-x-md top-md bottom-md flex flex-col justify-between z-0 border-l border-b border-outline-variant">
                  <div className="w-full border-t border-outline-variant opacity-30 h-0"></div>
                  <div className="w-full border-t border-outline-variant opacity-30 h-0"></div>
                  <div className="w-full border-t border-outline-variant opacity-30 h-0"></div>
                  <div className="w-full border-t border-outline-variant opacity-30 h-0"></div>
                </div>
                {/* Chart Bars */}
                <div className="w-1/6 bg-primary-fixed hover:bg-primary-container transition-all duration-300 rounded-t h-[40%] relative z-10 group cursor-pointer">
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none whitespace-nowrap">
                    110 Schools
                  </div>
                </div>
                <div className="w-1/6 bg-primary-fixed hover:bg-primary-container transition-all duration-300 rounded-t h-[45%] relative z-10 group cursor-pointer">
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none whitespace-nowrap">
                    115 Schools
                  </div>
                </div>
                <div className="w-1/6 bg-primary-fixed hover:bg-primary-container transition-all duration-300 rounded-t h-[55%] relative z-10 group cursor-pointer">
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none whitespace-nowrap">
                    122 Schools
                  </div>
                </div>
                <div className="w-1/6 bg-primary-fixed hover:bg-primary-container transition-all duration-300 rounded-t h-[65%] relative z-10 group cursor-pointer">
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none whitespace-nowrap">
                    130 Schools
                  </div>
                </div>
                <div className="w-1/6 bg-primary-fixed hover:bg-primary-container transition-all duration-300 rounded-t h-[75%] relative z-10 group cursor-pointer">
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none whitespace-nowrap">
                    138 Schools
                  </div>
                </div>
                <div className="w-1/6 bg-primary hover:bg-primary-container transition-all duration-300 rounded-t h-[85%] relative z-10 group cursor-pointer">
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none whitespace-nowrap">
                    142 Schools
                  </div>
                </div>
              </div>
              <div className="px-md pb-md flex justify-between text-on-surface-variant font-label-sm text-label-sm relative z-10">
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low rounded-t-xl">
                <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">System Alerts</h2>
                <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">2 Active</span>
              </div>
              <div className="p-md flex-grow flex flex-col gap-sm overflow-y-auto max-h-[340px]">
                {/* Alert 1 */}
                <div className="p-sm border border-outline-variant rounded-lg bg-surface flex gap-sm items-start border-l-4 border-l-error">
                  <span className="material-symbols-outlined text-error shrink-0">warning</span>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-semibold">Payment Gateway Latency</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Elevated response times reported from Stripe API in the last 15 mins.</p>
                    <span className="font-label-sm text-label-sm text-outline mt-1 block text-[10px]">10 mins ago</span>
                  </div>
                </div>
                {/* Alert 2 */}
                <div className="p-sm border border-outline-variant rounded-lg bg-surface flex gap-sm items-start border-l-4 border-l-secondary">
                  <span className="material-symbols-outlined text-secondary shrink-0">info</span>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-semibold">Scheduled Maintenance</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Database indexing scheduled for Sunday, 2:00 AM UTC.</p>
                    <span className="font-label-sm text-label-sm text-outline mt-1 block text-[10px]">2 hours ago</span>
                  </div>
                </div>
                {/* Alert 3 */}
                <div className="p-sm border border-outline-variant rounded-lg bg-surface flex gap-sm items-start border-l-4 border-l-primary-fixed">
                  <span className="material-symbols-outlined text-primary shrink-0">support_agent</span>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-semibold">High Priority Ticket: #4092</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Oakridge High reporting data sync issue with local SIS.</p>
                    <span className="font-label-sm text-label-sm text-outline mt-1 block text-[10px]">4 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Signups Table Section */}
          <div className="mt-gutter bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Recent School Signups</h2>
              <button className="font-label-md text-label-md text-primary hover:underline font-medium">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant">
                    <th className="font-label-md text-label-md text-on-surface-variant p-md pl-md font-semibold">School Name</th>
                    <th className="font-label-md text-label-md text-on-surface-variant p-md font-semibold">Code</th>
                    <th className="font-label-md text-label-md text-on-surface-variant p-md font-semibold">Plan</th>
                    <th className="font-label-md text-label-md text-on-surface-variant p-md pr-md text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  <tr className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors bg-surface-bright">
                    <td className="p-md pl-md font-semibold">Lakeside Academy</td>
                    <td className="p-md text-on-surface-variant font-mono">LSA-001</td>
                    <td className="p-md">Enterprise</td>
                    <td className="p-md pr-md text-right">
                      <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Active
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-md pl-md font-semibold">River Valley High</td>
                    <td className="p-md text-on-surface-variant font-mono">RVH-042</td>
                    <td className="p-md">Pro</td>
                    <td className="p-md pr-md text-right">
                      <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Active
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors bg-surface-bright">
                    <td className="p-md pl-md font-semibold">St. Jude's Prep</td>
                    <td className="p-md text-on-surface-variant font-mono">SJP-109</td>
                    <td className="p-md">Starter</td>
                    <td className="p-md pr-md text-right">
                      <span className="inline-flex items-center gap-1 bg-surface-container-highest text-on-surface px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> Onboarding
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
