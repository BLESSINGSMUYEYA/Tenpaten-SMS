export const AcademicSummary = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
        <h3 className="font-label-md text-outline mb-2">Current GPA</h3>
        <p className="font-display-sm text-primary">3.8</p>
        <p className="font-body-sm text-secondary mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          +0.2 from last term
        </p>
      </div>
      
      <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
        <h3 className="font-label-md text-outline mb-2">Attendance Rate</h3>
        <p className="font-display-sm text-primary">98%</p>
        <p className="font-body-sm text-on-surface-variant mt-2">
          2 days absent
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
        <h3 className="font-label-md text-outline mb-2">Total Merits</h3>
        <p className="font-display-sm text-secondary">45</p>
        <p className="font-body-sm text-on-surface-variant mt-2">
          Top 10% in class
        </p>
      </div>
    </div>
  );
};
