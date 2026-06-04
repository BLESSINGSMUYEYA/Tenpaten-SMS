export const DisciplineLog = () => {
  const incidents = [
    { id: 1, student: 'John Doe', class: 'Form 2A', type: 'Late Arrival', reportedBy: 'Mr. Smith', status: 'Pending Review' },
    { id: 2, student: 'Jane Roe', class: 'Form 4C', type: 'Uniform Violation', reportedBy: 'Mrs. Davis', status: 'Resolved' },
    { id: 3, student: 'Mike Ross', class: 'Form 1B', type: 'Disruptive Behavior', reportedBy: 'Dr. Johnson', status: 'Pending Review' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-title-lg text-primary">Recent Discipline Logs</h2>
        <button className="text-primary hover:bg-primary-container px-3 py-1 rounded-md transition-colors text-sm font-medium">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-border text-label-md text-outline">
              <th className="pb-3 pr-4 font-medium">Student</th>
              <th className="pb-3 pr-4 font-medium">Type</th>
              <th className="pb-3 pr-4 font-medium">Reported By</th>
              <th className="pb-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="font-body-sm">
            {incidents.map(incident => (
              <tr key={incident.id} className="border-b border-surface-border hover:bg-surface-container-low transition-colors">
                <td className="py-3 pr-4">
                  <span className="font-medium text-on-surface block">{incident.student}</span>
                  <span className="text-on-surface-variant">{incident.class}</span>
                </td>
                <td className="py-3 pr-4 text-on-surface-variant">{incident.type}</td>
                <td className="py-3 pr-4 text-on-surface-variant">{incident.reportedBy}</td>
                <td className="py-3 text-right">
                  <span className={`font-label-sm px-2 py-1 rounded-full whitespace-nowrap ${
                    incident.status === 'Resolved' 
                      ? 'bg-secondary-container text-on-secondary-container' 
                      : 'bg-error-container text-on-error-container'
                  }`}>
                    {incident.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
