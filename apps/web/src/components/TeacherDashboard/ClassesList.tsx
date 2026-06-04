import { Link } from 'react-router-dom';

export const ClassesList = () => {
  const classes = [
    { id: 1, name: 'Form 3A - Mathematics', students: 35, nextPeriod: '10:00 AM' },
    { id: 2, name: 'Form 4B - Physics', students: 28, nextPeriod: '11:30 AM' },
    { id: 3, name: 'Form 2C - Mathematics', students: 40, nextPeriod: '02:00 PM' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-title-lg text-primary">My Classes</h2>
        <Link to="/teacher/classes" className="text-secondary hover:text-secondary-container transition-colors text-sm font-medium">View All</Link>
      </div>
      <div className="space-y-4">
        {classes.map(cls => (
          <div key={cls.id} className="p-4 border border-outline-variant rounded-lg hover:border-primary transition-colors cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-title-md text-on-surface group-hover:text-primary transition-colors">{cls.name}</h3>
                <p className="font-body-sm text-on-surface-variant mt-1">{cls.students} Students &bull; Next: {cls.nextPeriod}</p>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary">chevron_right</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
