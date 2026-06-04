export const RecentGrades = () => {
  const grades = [
    { id: 1, child: 'Grace Mwenitete', subject: 'Physics Midterm', score: 'A-', date: 'Yesterday' },
    { id: 2, child: 'Grace Mwenitete', subject: 'Math Quiz', score: 'B+', date: 'Last Week' },
    { id: 3, child: 'David Mwenitete', subject: 'English Essay', score: 'A', date: 'Last Week' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
      <h2 className="font-title-lg text-primary mb-6">Recent Grades</h2>
      <div className="space-y-4">
        {grades.map(grade => (
          <div key={grade.id} className="flex justify-between items-center p-4 border border-outline-variant rounded-lg bg-surface-container-low">
            <div>
              <h3 className="font-title-md text-on-surface">{grade.subject}</h3>
              <p className="font-body-sm text-on-surface-variant mt-1">{grade.child} &bull; {grade.date}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex justify-center items-center font-bold text-lg">
              {grade.score}
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-2 border border-outline-variant rounded-lg font-label-md text-primary hover:bg-surface-container-low transition-colors">
        View Full Reports
      </button>
    </div>
  );
};
