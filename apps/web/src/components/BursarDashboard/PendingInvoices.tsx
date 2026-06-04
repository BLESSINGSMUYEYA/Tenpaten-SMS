export const PendingInvoices = () => {
  const invoices = [
    { id: 'INV-102', student: 'John Doe', grade: 'Form 2A', amount: '$150.00', due: 'Overdue by 5 days' },
    { id: 'INV-105', student: 'Jane Roe', grade: 'Form 4C', amount: '$300.00', due: 'Due Today' },
    { id: 'INV-108', student: 'Mike Ross', grade: 'Form 1B', amount: '$50.00', due: 'Due Tomorrow' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-title-lg text-primary">Pending Invoices</h2>
        <span className="bg-error text-on-error font-label-sm px-2 py-1 rounded-full">{invoices.length} Action Needed</span>
      </div>
      <div className="space-y-4">
        {invoices.map(inv => (
          <div key={inv.id} className="flex justify-between items-center p-4 border border-outline-variant rounded-lg hover:border-primary transition-colors cursor-pointer bg-surface-container-low group">
            <div>
              <h3 className="font-title-md text-on-surface group-hover:text-primary transition-colors">{inv.student}</h3>
              <p className="font-body-sm text-on-surface-variant mt-1">{inv.grade} &bull; {inv.id}</p>
            </div>
            <div className="text-right">
              <p className="font-title-md font-bold text-error">{inv.amount}</p>
              <p className="font-label-sm text-error mt-1">{inv.due}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-2 border border-outline-variant rounded-lg font-label-md text-primary hover:bg-surface-container-low transition-colors">
        Send Reminders
      </button>
    </div>
  );
};
