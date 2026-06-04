export const FinancialSummary = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-title-lg text-primary">Financial Summary</h2>
        <button className="text-secondary hover:text-secondary-container font-label-sm">Pay Now</button>
      </div>
      
      <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6 border border-error-container">
        <p className="font-label-md">Total Outstanding Balance</p>
        <p className="font-display-md font-bold mt-1">$450.00</p>
        <p className="font-body-sm mt-1">Due by Oct 15, 2026</p>
      </div>

      <h3 className="font-title-md text-on-surface mb-3">Recent Transactions</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 border-b border-surface-border">
          <div>
            <p className="font-title-sm text-on-surface">Term 3 Fee Installment 1</p>
            <p className="font-body-sm text-on-surface-variant">Grace M. &bull; Sep 1, 2026</p>
          </div>
          <span className="font-label-md text-secondary">-$200.00</span>
        </div>
        <div className="flex justify-between items-center p-3 border-b border-surface-border">
          <div>
            <p className="font-title-sm text-on-surface">Uniform Purchase</p>
            <p className="font-body-sm text-on-surface-variant">David M. &bull; Aug 28, 2026</p>
          </div>
          <span className="font-label-md text-secondary">-$45.00</span>
        </div>
      </div>
    </div>
  );
};
