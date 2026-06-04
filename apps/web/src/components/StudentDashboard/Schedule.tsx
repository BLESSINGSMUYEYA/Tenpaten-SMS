export const Schedule = () => {
  const schedule = [
    { id: 1, time: '08:00 AM', subject: 'Mathematics', room: 'Room 101', teacher: 'Mr. Smith' },
    { id: 2, time: '10:00 AM', subject: 'Physics', room: 'Lab 2', teacher: 'Dr. Johnson' },
    { id: 3, time: '11:30 AM', subject: 'Lunch Break', room: 'Cafeteria', teacher: '' },
    { id: 4, time: '01:00 PM', subject: 'History', room: 'Room 204', teacher: 'Mrs. Davis' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-title-lg text-primary">Today's Classes</h2>
      </div>
      <div className="space-y-4">
        {schedule.map(item => (
          <div key={item.id} className="flex gap-4 p-4 border border-outline-variant rounded-lg bg-surface-container-low hover:border-primary transition-colors cursor-pointer group">
            <div className="w-20 shrink-0 font-label-md text-primary font-bold">{item.time}</div>
            <div className="flex-1">
              <h3 className="font-title-md text-on-surface group-hover:text-primary transition-colors">{item.subject}</h3>
              {item.teacher && <p className="font-body-sm text-on-surface-variant mt-1">{item.teacher} &bull; {item.room}</p>}
              {!item.teacher && <p className="font-body-sm text-outline mt-1">{item.room}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
