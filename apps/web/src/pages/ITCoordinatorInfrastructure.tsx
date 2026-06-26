import React, { useState } from 'react';
import { Sidebar } from '../components/ITCoordinatorDashboard/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';

const devices = [
  { id: 'PC-001', name: 'Admin Office PC',    type: 'Desktop', os: 'Windows 11', ip: '192.168.1.10', status: 'online', lastSeen: 'Now' },
  { id: 'PC-002', name: 'Lab PC #1',          type: 'Desktop', os: 'Windows 10', ip: '192.168.1.21', status: 'online', lastSeen: 'Now' },
  { id: 'PC-003', name: 'Lab PC #2',          type: 'Desktop', os: 'Windows 10', ip: '192.168.1.22', status: 'offline', lastSeen: '2h ago' },
  { id: 'LP-001', name: "Director's Laptop",  type: 'Laptop',  os: 'Windows 11', ip: '192.168.1.50', status: 'online', lastSeen: 'Now' },
  { id: 'LP-002', name: 'Deputy Laptop',      type: 'Laptop',  os: 'macOS 14',   ip: '192.168.1.51', status: 'online', lastSeen: '5m ago' },
  { id: 'PR-001', name: 'Main Printer',       type: 'Printer', os: 'Firmware 3.2',ip:'192.168.1.80', status: 'online', lastSeen: 'Now' },
  { id: 'RO-001', name: 'Main Router',        type: 'Network', os: 'RouterOS 7', ip: '192.168.1.1',  status: 'online', lastSeen: 'Now' },
  { id: 'SW-001', name: 'Network Switch',     type: 'Network', os: 'SwitchOS 2', ip: '192.168.1.2',  status: 'online', lastSeen: 'Now' },
];

const networkStats = [
  { label: 'Download Speed', value: '94 Mbps',  icon: 'download', color: 'text-primary' },
  { label: 'Upload Speed',   value: '47 Mbps',  icon: 'upload',   color: 'text-tertiary' },
  { label: 'Connected Devices', value: '67',    icon: 'devices',  color: 'text-secondary' },
  { label: 'Bandwidth Usage',   value: '61%',   icon: 'wifi',     color: 'text-on-surface-variant' },
];

export const ITCoordinatorInfrastructure: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = devices.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase()) ||
    d.ip.includes(search)
  );

  const online = devices.filter(d => d.status === 'online').length;
  const offline = devices.filter(d => d.status === 'offline').length;

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8 bg-surface-bright overflow-y-auto">
          <div className="mb-6">
            <h1 className="dash-page-title mb-1">Infrastructure</h1>
            <p className="font-body-md text-on-surface-variant">Network topology, device inventory and system health.</p>
          </div>

          {/* Network Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 cards-stagger">
            {networkStats.map(s => (
              <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-md text-on-surface-variant">{s.label}</span>
                  <span className={`material-symbols-outlined text-[20px] ${s.color}`}>{s.icon}</span>
                </div>
                <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Bandwidth bar */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-title-md text-title-md font-semibold text-on-surface">Bandwidth Usage — Today</h2>
              <span className="font-label-sm text-on-surface-variant">61% of 150 Mbps allocated</span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary transition-all duration-700"
                style={{ width: '61%' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-label-sm text-primary">91.5 Mbps used</span>
              <span className="font-label-sm text-on-surface-variant">58.5 Mbps free</span>
            </div>
          </div>

          {/* Device Inventory */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-title-lg text-title-lg font-semibold text-on-surface">Device Inventory</h2>
                <p className="font-label-sm text-on-surface-variant">
                  <span className="text-primary font-semibold">{online} online</span>
                  {offline > 0 && <span className="text-error font-semibold ml-2">{offline} offline</span>}
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-tertiary/40 transition"
                  placeholder="Search devices..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant">
                    {['ID', 'Name', 'Type', 'OS', 'IP Address', 'Last Seen', 'Status'].map(h => (
                      <th key={h} className="font-label-md text-on-surface-variant p-4 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-body-sm text-on-surface">
                  {filtered.map((d, i) => (
                    <tr key={d.id} className={`border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors ${i % 2 === 0 ? '' : 'bg-surface-bright'}`}>
                      <td className="p-4 font-mono text-xs text-on-surface-variant">{d.id}</td>
                      <td className="p-4 font-semibold text-on-surface">{d.name}</td>
                      <td className="p-4 text-on-surface-variant">{d.type}</td>
                      <td className="p-4 text-on-surface-variant">{d.os}</td>
                      <td className="p-4 font-mono text-xs">{d.ip}</td>
                      <td className="p-4 text-on-surface-variant">{d.lastSeen}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm font-bold text-[10px] ${
                          d.status === 'online'
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'online' ? 'bg-primary' : 'bg-error'}`} />
                          {d.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </td>
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

export default ITCoordinatorInfrastructure;
