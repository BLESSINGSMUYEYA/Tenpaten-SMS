export const ChildrenOverview = () => {
  const children = [
    { id: 1, name: 'Grace Mwenitete', grade: 'Form 4B', attendance: '98%', status: 'Present' },
    { id: 2, name: 'David Mwenitete', grade: 'Form 1A', attendance: '100%', status: 'Present' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm mb-6">
      <h2 className="font-title-lg text-primary mb-4">My Children</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map(child => (
          <div key={child.id} className="p-4 border border-outline-variant rounded-lg flex justify-between items-center bg-surface-container-low hover:border-primary cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center font-bold text-lg">
                {child.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-title-md text-on-surface">{child.name}</h3>
                <p className="font-body-sm text-on-surface-variant">{child.grade} &bull; Attendance: {child.attendance}</p>
              </div>
            </div>
            <span className="font-label-sm px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full">
              {child.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
