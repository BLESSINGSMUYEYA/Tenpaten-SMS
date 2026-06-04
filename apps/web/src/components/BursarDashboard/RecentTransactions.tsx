export const RecentTransactions = () => {
  const transactions = [
    { id: 'TRX-001', student: 'Grace Mwenitete', amount: '+$200.00', date: 'Today, 10:45 AM', type: 'Tuition', status: 'Completed' },
    { id: 'TRX-002', student: 'School Supplies Ltd', amount: '-$450.00', date: 'Yesterday', type: 'Expense', status: 'Completed' },
    { id: 'TRX-003', student: 'David Mwenitete', amount: '+$45.00', date: 'Sep 23, 2026', type: 'Uniform', status: 'Completed' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-title-lg text-primary">Recent Transactions</h2>
        <button className="text-secondary hover:text-secondary-container font-label-sm">View All Ledger</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-border text-label-md text-outline">
              <th className="pb-3 pr-4 font-medium">Transaction ID</th>
              <th className="pb-3 pr-4 font-medium">Description</th>
              <th className="pb-3 pr-4 font-medium">Amount</th>
              <th className="pb-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="font-body-sm">
            {transactions.map(trx => (
              <tr key={trx.id} className="border-b border-surface-border hover:bg-surface-container-low transition-colors">
                <td className="py-3 pr-4 text-on-surface-variant">{trx.id}</td>
                <td className="py-3 pr-4">
                  <span className="font-medium text-on-surface block">{trx.student}</span>
                  <span className="text-on-surface-variant">{trx.type} &bull; {trx.date}</span>
                </td>
                <td className={`py-3 pr-4 font-bold ${trx.amount.startsWith('+') ? 'text-secondary' : 'text-error'}`}>
                  {trx.amount}
                </td>
                <td className="py-3 text-right">
                  <span className="font-label-sm px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container">
                    {trx.status}
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
