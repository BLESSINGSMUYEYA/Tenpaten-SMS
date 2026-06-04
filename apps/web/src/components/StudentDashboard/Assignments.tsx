export const Assignments = () => {
  const assignments = [
    { id: 1, title: 'Algebra Worksheet 4', subject: 'Mathematics', due: 'Tomorrow', status: 'pending' },
    { id: 2, title: 'Newton\'s Laws Essay', subject: 'Physics', due: 'Friday', status: 'in-progress' },
    { id: 3, title: 'World War II Quiz', subject: 'History', due: 'Next Monday', status: 'pending' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-title-lg text-primary">Pending Assignments</h2>
        <span className="bg-error text-on-error font-label-sm px-2 py-1 rounded-full">{assignments.length} Due</span>
      </div>
      <div className="space-y-4">
        {assignments.map(item => (
          <div key={item.id} className="flex justify-between items-center p-4 border border-outline-variant rounded-lg hover:border-primary transition-colors cursor-pointer group">
            <div>
              <h3 className="font-title-md text-on-surface group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="font-body-sm text-on-surface-variant mt-1">{item.subject}</p>
            </div>
            <div className="text-right">
              <span className={`font-label-sm px-2 py-1 rounded-md ${item.status === 'pending' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
                Due {item.due}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
