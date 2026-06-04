import { Link } from 'react-router-dom';

export const TodaySchedule = () => {
  const schedule = [
    { id: 1, time: '08:00 AM - 09:30 AM', subject: 'Form 3A - Mathematics', room: 'Room 101', type: 'lecture' },
    { id: 2, time: '10:00 AM - 11:30 AM', subject: 'Form 4B - Physics', room: 'Lab 2', type: 'practical' },
    { id: 3, time: '11:30 AM - 12:30 PM', subject: 'Lunch Break', room: 'Staff Room', type: 'break' },
    { id: 4, time: '02:00 PM - 03:30 PM', subject: 'Form 2C - Mathematics', room: 'Room 105', type: 'lecture' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-title-lg text-primary">Today's Schedule</h2>
        <Link to="/teacher/schedule" className="text-secondary hover:text-secondary-container transition-colors text-sm font-medium">Full Timetable</Link>
      </div>
      <div className="relative border-l-2 border-outline-variant ml-4 space-y-6 pb-2">
        {schedule.map((item) => (
          <div key={item.id} className="relative pl-6">
            {/* Timeline Dot */}
            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-surface-container-lowest ${item.type === 'break' ? 'bg-outline-variant' : 'bg-primary'}`}></div>
            
            <div className="flex flex-col">
              <span className="font-label-sm text-outline mb-1">{item.time}</span>
              <div className={`p-4 rounded-lg border ${item.type === 'break' ? 'bg-surface-container-low border-transparent' : 'border-outline-variant bg-surface-container-lowest'}`}>
                <h3 className={`font-title-sm ${item.type === 'break' ? 'text-on-surface-variant' : 'text-on-surface'}`}>{item.subject}</h3>
                <div className="flex items-center gap-2 mt-2 text-on-surface-variant font-body-sm">
                  <span className="material-symbols-outlined text-[16px]" data-icon="location_on">location_on</span>
                  <span>{item.room}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
