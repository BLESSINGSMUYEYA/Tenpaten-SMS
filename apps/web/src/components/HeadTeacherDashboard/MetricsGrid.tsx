
export const MetricsGrid = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Students */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-border shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="material-symbols-outlined p-2 bg-surface-container text-primary rounded-lg" data-icon="group">group</span>
          <span className="text-secondary text-label-sm">+2.4%</span>
        </div>
        <div>
          <p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Total Students</p>
          <p className="font-headline-lg text-headline-lg text-on-surface">1,248</p>
        </div>
      </div>
      {/* Staff Count */}
      <div className="bg-surface-container-lowest glassmorphism p-4 rounded-xl border border-surface-border shadow-lg flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="material-symbols-outlined p-2 bg-surface-container text-primary rounded-lg" data-icon="badge">badge</span>
          <span className="text-on-surface-variant text-label-sm">Active</span>
        </div>
        <div>
          <p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Staff Count</p>
          <p className="font-headline-lg text-headline-lg text-on-surface">42</p>
        </div>
      </div>
      {/* Attendance */}
      <div className="bg-surface-container-lowest glassmorphism p-4 rounded-xl border border-surface-border shadow-lg flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="material-symbols-outlined p-2 bg-surface-container text-primary rounded-lg" data-icon="fact_check">fact_check</span>
          <span className="text-secondary text-label-sm">94%</span>
        </div>
        <div>
          <p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Today's Attendance</p>
          <div className="w-full bg-surface-container h-2 rounded-full mt-2">
            <div className="bg-secondary h-full rounded-full" style={{ width: '94%' }} />
          </div>
        </div>
      </div>
      {/* Fee Collection */}
      <div className="bg-primary p-4 rounded-xl border border-primary-container shadow-lg flex flex-col justify-between text-on-primary">
        <div className="flex justify-between items-start mb-2">
          <span className="material-symbols-outlined p-2 bg-primary-container text-primary-fixed-dim rounded-lg" data-icon="account_balance">account_balance</span>
          <span className="text-primary-fixed-dim text-label-sm">72% Goal</span>
        </div>
        <div>
          <p className="font-label-sm text-primary-fixed-dim uppercase tracking-wider">Fee Collection</p>
          <p className="font-headline-lg text-headline-lg">72%</p>
          <p className="font-label-sm text-primary-fixed opacity-70 mt-1">Term 2 Target</p>
        </div>
      </div>
    </section>
  );
};
