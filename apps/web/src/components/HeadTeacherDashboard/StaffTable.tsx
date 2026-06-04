
export const StaffTable = () => {
  return (
    <div className="lg:col-span-2 bg-surface-container-lowest glassmorphism rounded-xl border border-surface-border overflow-hidden shadow-lg">
      <div className="p-6 border-b border-surface-border flex justify-between items-center">
        <h3 className="font-headline-md text-headline-md text-primary">Staff Overview</h3>
        <button className="text-primary font-bold text-label-sm hover:underline">Manage Staff</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase">Staff Name</th>
              <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase">Role</th>
              <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase">Class</th>
              <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            <tr className="hover:bg-surface-container-lowest transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary">AO</div>
                  <span className="font-label-md text-on-surface">Adekunle Olawale</span>
                </div>
              </td>
              <td className="px-6 py-4 text-on-surface-variant">Senior Tutor</td>
              <td className="px-6 py-4 text-on-surface-variant">SS3 Science</td>
              <td className="px-6 py-4">
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm">Present</span>
              </td>
            </tr>
            <tr className="bg-surface-background hover:bg-surface-container-low transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary">JM</div>
                  <span className="font-label-md text-on-surface">Janet Mensah</span>
                </div>
              </td>
              <td className="px-6 py-4 text-on-surface-variant">Class Teacher</td>
              <td className="px-6 py-4 text-on-surface-variant">JS1 Arts</td>
              <td className="px-6 py-4">
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm">Present</span>
              </td>
            </tr>
            <tr className="hover:bg-surface-container-lowest transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary">KK</div>
                  <span className="font-label-md text-on-surface">Kofi Koranteng</span>
                </div>
              </td>
              <td className="px-6 py-4 text-on-surface-variant">Admin Secretary</td>
              <td className="px-6 py-4 text-on-surface-variant">—</td>
              <td className="px-6 py-4">
                <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-label-sm">On Leave</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
