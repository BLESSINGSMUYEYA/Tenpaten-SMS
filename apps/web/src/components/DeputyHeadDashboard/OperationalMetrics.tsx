export const OperationalMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary bg-primary-container p-2 rounded-lg">person_check</span>
          <h3 className="font-label-md text-outline">Staff Attendance</h3>
        </div>
        <p className="font-display-sm text-on-surface">92%</p>
        <p className="font-body-sm text-error mt-2">3 Absent Today</p>
      </div>
      
      <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-secondary bg-secondary-container p-2 rounded-lg">groups</span>
          <h3 className="font-label-md text-outline">Student Attendance</h3>
        </div>
        <p className="font-display-sm text-on-surface">96.5%</p>
        <p className="font-body-sm text-on-surface-variant mt-2">Target: 95%</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-error bg-error-container p-2 rounded-lg">warning</span>
          <h3 className="font-label-md text-outline">Pending Issues</h3>
        </div>
        <p className="font-display-sm text-on-surface">4</p>
        <p className="font-body-sm text-error mt-2">Requires Attention</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-tertiary bg-tertiary-container p-2 rounded-lg">event_available</span>
          <h3 className="font-label-md text-outline">Coverage Needed</h3>
        </div>
        <p className="font-display-sm text-on-surface">2</p>
        <p className="font-body-sm text-on-surface-variant mt-2">Periods unassigned</p>
      </div>
    </div>
  );
};
