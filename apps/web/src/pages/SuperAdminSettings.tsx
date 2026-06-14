import React, { useState } from 'react';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';

export const SuperAdminSettings: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Configuration States
  const [platformName, setPlatformName] = useState('Tenpaten Multi-Tenant SMS');
  const [supportEmail, setSupportEmail] = useState('support@tenpaten.com');
  const [stripeActive, setStripeActive] = useState(true);
  const [paychanguActive, setPaychanguActive] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [maxStorage, setMaxStorage] = useState('10'); // GB

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Global settings saved successfully!');
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 px-margin-mobile md:px-margin-desktop pt-20 pb-margin-desktop overflow-y-auto bg-surface-bright">
          {/* Page Header */}
          <div className="mb-lg">
            <h1 className="dash-page-title mb-xs">Global System Settings</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Update platform integrations, payment gateway switches, and security parameters.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* General & Integration Parameters */}
            <div className="lg:col-span-2 space-y-lg">
              {/* General Config */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
                <h3 className="font-bold text-on-background text-base mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">dns</span> Platform Configuration
                </h3>
                <div className="space-y-md">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Platform Brand Name *</label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={e => setPlatformName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Platform Support Contact *</label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={e => setSupportEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Max School Storage (GB) *</label>
                      <input
                        type="number"
                        value={maxStorage}
                        onChange={e => setMaxStorage(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Gateways Config */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
                <h3 className="font-bold text-on-background text-base mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">account_balance_wallet</span> Gateway Integrations
                </h3>
                <div className="space-y-md">
                  <div className="flex items-center justify-between p-md bg-surface rounded-xl border border-outline-variant">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface flex items-center gap-sm">
                        Stripe Payments
                      </h4>
                      <p className="text-xs text-on-surface-variant">Process standard visa/mastercards subscriptions globally.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={stripeActive}
                      onChange={e => setStripeActive(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary-container cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-md bg-surface rounded-xl border border-outline-variant">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface flex items-center gap-sm">
                        Paychangu Payments (Malawi Local)
                      </h4>
                      <p className="text-xs text-on-surface-variant">Authorize mobile wallets payments (Airtel, Mpamba, FDH Mobile).</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={paychanguActive}
                      onChange={e => setPaychanguActive(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary-container cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Status & Actions */}
            <div className="space-y-lg">
              {/* Feature Parameters */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
                <h3 className="font-bold text-on-background text-base mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">toggle_on</span> Feature Controls
                </h3>
                <div className="space-y-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Allow Registration</h4>
                      <p className="text-xs text-on-surface-variant">Enable new public signups</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowRegistration}
                      onChange={e => setAllowRegistration(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary-container cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-outline-variant pt-4">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface text-error">Maintenance Mode</h4>
                      <p className="text-xs text-on-surface-variant">Route platform traffic to stubs</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={e => setMaintenanceMode(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary-container cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Actions panel */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm text-center">
                <p className="text-xs text-on-surface-variant mb-md">Validate that Stripe, Paychangu, and platform flags are correctly configured before committing.</p>
                <div className="flex flex-col gap-sm">
                  <button type="submit" className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all text-sm">
                    Save Global Settings
                  </button>
                  <button type="button" className="w-full py-3 bg-surface-container border border-outline-variant text-outline hover:text-on-surface rounded-lg font-bold transition-all text-sm">
                    Reset Config
                  </button>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminSettings;
