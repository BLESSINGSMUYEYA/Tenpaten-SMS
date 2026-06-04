export const QuickActions = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <button className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest border border-surface-border rounded-xl hover:border-primary hover:bg-surface-container-low transition-all active:scale-95 group">
        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container mb-3 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined" data-icon="fact_check">fact_check</span>
        </div>
        <span className="font-label-md text-on-surface text-center">Take Attendance</span>
      </button>

      <button className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest border border-surface-border rounded-xl hover:border-primary hover:bg-surface-container-low transition-all active:scale-95 group">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mb-3 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined" data-icon="grading">grading</span>
        </div>
        <span className="font-label-md text-on-surface text-center">Enter Grades</span>
      </button>

      <button className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest border border-surface-border rounded-xl hover:border-primary hover:bg-surface-container-low transition-all active:scale-95 group">
        <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container mb-3 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined" data-icon="campaign">campaign</span>
        </div>
        <span className="font-label-md text-on-surface text-center">Post Notice</span>
      </button>

      <button className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest border border-surface-border rounded-xl hover:border-primary hover:bg-surface-container-low transition-all active:scale-95 group">
        <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container mb-3 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined" data-icon="assignment_late">assignment_late</span>
        </div>
        <span className="font-label-md text-on-surface text-center">Report Incident</span>
      </button>
    </div>
  );
};
