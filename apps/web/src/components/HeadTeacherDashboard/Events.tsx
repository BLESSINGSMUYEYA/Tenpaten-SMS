
const Events = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-headline-md text-primary">Upcoming Events</h3>
        <button className="material-symbols-outlined text-outline" data-icon="event" aria-label="Events"></button>
      </div>
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center bg-primary rounded-lg p-2 min-w-[56px] h-fit">
            <span className="text-on-primary font-bold text-headline-md">24</span>
            <span className="text-primary-fixed-dim text-label-sm uppercase">Oct</span>
          </div>
          <div>
            <p className="font-label-md text-on-surface font-bold">PTA General Meeting</p>
            <p className="font-body-sm text-on-surface-variant">Main Auditorium, 10:00 AM</p>
            <span className="text-secondary text-label-sm font-bold bg-secondary-container px-2 py-0.5 rounded mt-2 inline-block">Confirmed</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center bg-surface-container-high rounded-lg p-2 min-w-[56px] h-fit">
            <span className="text-primary font-bold text-headline-md">02</span>
            <span className="text-on-surface-variant text-label-sm uppercase">Nov</span>
          </div>
          <div>
            <p className="font-label-md text-on-surface font-bold">End of Term Exams Start</p>
            <p className="font-body-sm text-on-surface-variant">School‑wide assessment period</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center bg-surface-container-high rounded-lg p-2 min-w-[56px] h-fit">
            <span className="text-primary font-bold text-headline-md">15</span>
            <span className="text-on-surface-variant text-label-sm uppercase">Nov</span>
          </div>
          <div>
            <p className="font-label-md text-on-surface font-bold">Speech &amp; Prize Giving Day</p>
            <p className="font-body-sm text-on-surface-variant">Annual academic excellence ceremony</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
