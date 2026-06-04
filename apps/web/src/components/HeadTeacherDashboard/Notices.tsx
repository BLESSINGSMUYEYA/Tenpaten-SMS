
export const Notices = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-md text-headline-md text-primary">Recent Notices</h3>
        <button className="text-primary font-bold text-label-sm hover:underline">View All</button>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-surface-container-low rounded-lg border-l-4 border-primary">
          <p className="font-label-md text-primary font-bold">Mid-Term Break Notice</p>
          <p className="font-body-sm text-on-surface-variant mt-1">School will be closed from 15th to 19th Oct...</p>
          <p className="font-label-sm text-outline mt-2 italic">Posted 2h ago</p>
        </div>
        <div className="p-4 bg-surface-container-low rounded-lg border-l-4 border-warning">
          <p className="font-label-md text-primary font-bold">Fee Reminder: Term 2</p>
          <p className="font-body-sm text-on-surface-variant mt-1">Outstanding fees should be settled before...</p>
          <p className="font-label-sm text-outline mt-2 italic">Posted Yesterday</p>
        </div>
        <div className="p-4 bg-surface-container-low rounded-lg border-l-4 border-secondary">
          <p className="font-label-md text-primary font-bold">Inter-house Sports Results</p>
          <p className="font-body-sm text-on-surface-variant mt-1">Congratulations to the Blue House for winning...</p>
          <p className="font-label-sm text-outline mt-2 italic">Posted 2 days ago</p>
        </div>
      </div>
    </div>
  );
};
