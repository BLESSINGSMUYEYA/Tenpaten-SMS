export const FinancialOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary bg-primary-container p-2 rounded-lg">account_balance</span>
          <h3 className="font-label-md text-outline">Total Revenue</h3>
        </div>
        <p className="font-display-sm text-on-surface">$124,500</p>
        <p className="font-body-sm text-secondary mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          +12% from last month
        </p>
      </div>
      
      <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-error bg-error-container p-2 rounded-lg">error</span>
          <h3 className="font-label-md text-outline">Outstanding Fees</h3>
        </div>
        <p className="font-display-sm text-error">$15,200</p>
        <p className="font-body-sm text-on-surface-variant mt-2">Across 32 students</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-tertiary bg-tertiary-container p-2 rounded-lg">receipt</span>
          <h3 className="font-label-md text-outline">Recent Expenses</h3>
        </div>
        <p className="font-display-sm text-on-surface">$8,450</p>
        <p className="font-body-sm text-on-surface-variant mt-2">This week</p>
      </div>
    </div>
  );
};
