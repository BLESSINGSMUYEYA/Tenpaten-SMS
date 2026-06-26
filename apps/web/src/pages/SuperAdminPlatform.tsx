import React, { useState } from 'react';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';

interface PlanFeature { name: string; free: boolean; basic: boolean; premium: boolean; enterprise: boolean; }

const planFeatures: PlanFeature[] = [
  { name: 'Student Management',      free: true,  basic: true,  premium: true,  enterprise: true },
  { name: 'Attendance Tracking',     free: true,  basic: true,  premium: true,  enterprise: true },
  { name: 'Grade Management',        free: false, basic: true,  premium: true,  enterprise: true },
  { name: 'Fee & Billing',           free: false, basic: true,  premium: true,  enterprise: true },
  { name: 'SMS Notifications',       free: false, basic: false, premium: true,  enterprise: true },
  { name: 'Email Notifications',     free: false, basic: true,  premium: true,  enterprise: true },
  { name: 'Advanced Reports',        free: false, basic: false, premium: true,  enterprise: true },
  { name: 'API Access',              free: false, basic: false, premium: false, enterprise: true },
  { name: 'Priority Support',        free: false, basic: false, premium: true,  enterprise: true },
  { name: 'Dedicated Account Mgr',   free: false, basic: false, premium: false, enterprise: true },
  { name: 'Custom Branding',         free: false, basic: false, premium: false, enterprise: true },
  { name: 'Unlimited Storage',       free: false, basic: false, premium: false, enterprise: true },
];

type SystemStatus = 'operational' | 'degraded' | 'down';
const systemServices: { name: string; status: SystemStatus; latency: string }[] = [
  { name: 'API Server',     status: 'operational', latency: '42ms' },
  { name: 'Database',       status: 'operational', latency: '8ms' },
  { name: 'File Storage',   status: 'operational', latency: '120ms' },
  { name: 'Email Gateway',  status: 'operational', latency: '240ms' },
  { name: 'SMS Gateway',    status: 'degraded',    latency: '1200ms' },
  { name: 'Background Jobs',status: 'operational', latency: '—' },
];

const statusConfig: Record<SystemStatus, { label: string; color: string; dot: string }> = {
  operational: { label: 'Operational', color: 'text-primary',   dot: 'bg-primary' },
  degraded:    { label: 'Degraded',    color: 'text-secondary', dot: 'bg-secondary' },
  down:        { label: 'Down',        color: 'text-error',     dot: 'bg-error' },
};

export const SuperAdminPlatform: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [debugLogs, setDebugLogs] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({
    smsModule:       true,
    libraryModule:   false,
    inventoryModule: false,
    parentPortal:    true,
    mobileApp:       true,
    bulkImport:      true,
  });
  const [saved, setSaved] = useState(false);

  const toggleFlag = (key: keyof typeof featureFlags) =>
    setFeatureFlags(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Check = ({ v }: { v: boolean }) => (
    <span className={`material-symbols-outlined text-[18px] ${v ? 'text-primary' : 'text-on-surface-variant/30'}`}>
      {v ? 'check_circle' : 'cancel'}
    </span>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void; }) => (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-surface-container-highest'}`}
      role="switch" aria-checked={value}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 overflow-y-auto bg-surface-bright">
          <div className="mb-6">
            <h1 className="dash-page-title mb-1">Platform Configuration</h1>
            <p className="font-body-md text-on-surface-variant">Feature flags, subscription plans, system health, and maintenance controls.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* System Health */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">monitor_heart</span>
                <h2 className="font-title-md font-semibold text-on-surface">System Health</h2>
              </div>
              <div className="p-4 flex flex-col gap-2.5">
                {systemServices.map(s => {
                  const cfg = statusConfig[s.status];
                  return (
                    <div key={s.name} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} ${s.status !== 'operational' ? 'animate-pulse' : ''}`} />
                        <span className="font-label-md text-on-surface font-medium">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-on-surface-variant">{s.latency}</span>
                        <span className={`font-label-sm text-[11px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[18px]">toggle_on</span>
                <h2 className="font-title-md font-semibold text-on-surface">Feature Flags</h2>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {Object.entries(featureFlags).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    smsModule: 'SMS Notifications Module',
                    libraryModule: 'Library Management',
                    inventoryModule: 'Inventory Tracking',
                    parentPortal: 'Parent Portal Access',
                    mobileApp: 'Mobile App Support',
                    bulkImport: 'Bulk CSV Import',
                  };
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="font-label-md text-on-surface">{labels[key]}</span>
                      <Toggle value={val} onChange={() => toggleFlag(key as keyof typeof featureFlags)} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Global Controls */}
            <div className="flex flex-col gap-4">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">admin_panel_settings</span>
                  <h2 className="font-title-md font-semibold text-on-surface">Global Controls</h2>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  {[
                    { label: 'Open Registration',    desc: 'Allow new schools to self-register', val: registrationOpen, set: () => setRegistrationOpen(v => !v) },
                    { label: 'Debug Logging',        desc: 'Enable verbose server logs',          val: debugLogs,        set: () => setDebugLogs(v => !v) },
                  ].map(c => (
                    <div key={c.label} className="flex items-center justify-between">
                      <div>
                        <p className="font-label-md text-on-surface font-semibold">{c.label}</p>
                        <p className="font-body-sm text-on-surface-variant text-[11px]">{c.desc}</p>
                      </div>
                      <Toggle value={c.val} onChange={c.set} />
                    </div>
                  ))}
                  <div className="pt-2 border-t border-outline-variant">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-label-md text-error font-semibold">Maintenance Mode</p>
                        <p className="font-body-sm text-on-surface-variant text-[11px]">Locks platform for all school users</p>
                      </div>
                      <button
                        onClick={() => setMaintenanceMode(v => !v)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-error' : 'bg-surface-container-highest'}`}
                        role="switch" aria-checked={maintenanceMode}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${maintenanceMode ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    {maintenanceMode && (
                      <div className="mt-3 p-3 bg-error-container/20 border border-error/30 rounded-xl">
                        <p className="font-body-sm text-error font-semibold text-[12px]">⚠️ Maintenance mode is ACTIVE. All school users are locked out.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-label-md font-semibold transition-all active:scale-95 shadow-sm ${
                  saved ? 'bg-primary-container text-on-primary-container' : 'bg-primary text-on-primary hover:opacity-90'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{saved ? 'check_circle' : 'save'}</span>
                {saved ? 'Configuration Saved!' : 'Save Configuration'}
              </button>
            </div>
          </div>

          {/* Subscription Plan Feature Matrix */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">workspace_premium</span>
              <h2 className="font-title-md font-semibold text-on-surface">Subscription Plan — Feature Matrix</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface">
                    <th className="px-5 py-3 font-label-sm text-on-surface-variant text-xs font-semibold uppercase">Feature</th>
                    {['Free', 'Basic', 'Premium', 'Enterprise'].map(p => (
                      <th key={p} className="px-5 py-3 font-label-sm text-on-surface text-xs font-bold uppercase text-center">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planFeatures.map((f, i) => (
                    <tr key={i} className="border-b border-outline-variant hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-5 py-3 font-label-md text-on-surface">{f.name}</td>
                      <td className="px-5 py-3 text-center"><Check v={f.free} /></td>
                      <td className="px-5 py-3 text-center"><Check v={f.basic} /></td>
                      <td className="px-5 py-3 text-center"><Check v={f.premium} /></td>
                      <td className="px-5 py-3 text-center"><Check v={f.enterprise} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminPlatform;
