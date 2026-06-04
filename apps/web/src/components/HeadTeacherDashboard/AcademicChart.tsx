
export const AcademicChart = () => {
  return (
    <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-surface-border p-lg shadow-sm">
      <div className="flex justify-between items-center mb-md">
        <h3 className="font-headline-md text-headline-md text-primary">Academic Performance</h3>
        <select className="bg-surface-container border-none rounded-lg font-label-sm px-4 py-2 focus:ring-primary">
          <option>All Classes</option>
          <option>Primary 1-6</option>
          <option>Secondary 1-3</option>
        </select>
      </div>
      {/* Placeholder chart – replace with a chart library later */}
      <div className="relative h-64 w-full flex items-end justify-between px-4 pb-8 border-b border-surface-border">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
          <div className="border-t border-on-surface w-full" />
          <div className="border-t border-on-surface w-full" />
          <div className="border-t border-on-surface w-full" />
          <div className="border-t border-on-surface w-full" />
        </div>
        {/* Bars */}
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="flex gap-1 items-end">
            <div className="w-10 bg-primary-container rounded-t-md" style={{ height: '120px' }} />
            <div className="w-10 bg-primary rounded-t-md" style={{ height: '150px' }} />
          </div>
          <span className="font-label-sm text-on-surface-variant">Mathematics</span>
        </div>
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="flex gap-1 items-end">
            <div className="w-10 bg-primary-container rounded-t-md" style={{ height: '140px' }} />
            <div className="w-10 bg-primary rounded-t-md" style={{ height: '180px' }} />
          </div>
          <span className="font-label-sm text-on-surface-variant">Science</span>
        </div>
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="flex gap-1 items-end">
            <div className="w-10 bg-primary-container rounded-t-md" style={{ height: '110px' }} />
            <div className="w-10 bg-primary rounded-t-md" style={{ height: '130px' }} />
          </div>
          <span className="font-label-sm text-on-surface-variant">English</span>
        </div>
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="flex gap-1 items-end">
            <div className="w-10 bg-primary-container rounded-t-md" style={{ height: '160px' }} />
            <div className="w-10 bg-primary rounded-t-md" style={{ height: '190px' }} />
          </div>
          <span className="font-label-sm text-on-surface-variant">Social Studies</span>
        </div>
      </div>
      <div className="flex gap-lg mt-md justify-center">
        <div className="flex items-center gap-sm">
          <div className="w-3 h-3 bg-primary-container rounded-full" />
          <span className="font-label-sm text-on-surface-variant">Term 1 Avg</span>
        </div>
        <div className="flex items-center gap-sm">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <span className="font-label-sm text-on-surface-variant">Term 2 Avg</span>
        </div>
      </div>
    </div>
  );
};
