import { useState } from 'react';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';

export const TeacherParentCommunications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [selectedClass, setSelectedClass] = useState('Form 3A - Mathematics');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  // Mock parent contact data per class
  const parentData: Record<string, Array<{ id: number; name: string; parentName: string; contact: string; avatarCode: string }>> = {
    'Form 3A - Mathematics': [
      { id: 1, name: 'Amina Bello', parentName: 'Mrs. Bello', contact: 'amina@example.com', avatarCode: 'AB' },
      { id: 2, name: 'Chinedu Okafor', parentName: 'Mr. Okafor', contact: 'chinedu@example.com', avatarCode: 'CO' },
    ],
    'Form 4B - Physics': [
      { id: 3, name: 'Kwame Nkrumah', parentName: 'Mrs. Nkrumah', contact: 'kwame@example.com', avatarCode: 'KN' },
    ],
    'Form 2C - Mathematics': [
      { id: 4, name: 'David Mwangi', parentName: 'Mr. Mwangi', contact: 'david@example.com', avatarCode: 'DM' },
    ],
  };

  const currentParents = parentData[selectedClass] || [];
  const filteredParents = currentParents.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendMessage = () => {
    // Placeholder: In a real app, this would call an API.
    alert(`Message sent to ${selectedClass} parents: ${message}`);
    setMessage('');
  };

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Breadcrumbs & Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Staff</span>
              <span>/</span>
              <span className="text-primary font-bold">Parent Communication</span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">Parent Communications</h1>
            <p className="font-body-md text-on-surface-variant">Send updates and messages to parents.</p>
          </div>
          <div className="flex gap-2 self-start md:self-end">
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Send Message
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-72">
            <label className="block text-label-sm text-outline mb-1 font-bold">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
            >
              {Object.keys(parentData).map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div className="relative w-full md:w-80 flex items-center self-end">
            <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
            <input
              type="text"
              placeholder="Search student or parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
            />
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-6">
          <textarea
            rows={4}
            placeholder="Write a message to parents..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-outline-variant focus:border-primary rounded-lg bg-surface-container text-on-surface transition-colors"
          />
        </div>

        {/* Parent Contact Table */}
        <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant border-b border-surface-border dark:border-outline-variant font-label-md text-xs uppercase">
                  <th className="py-4 px-6 font-bold">Student</th>
                  <th className="py-4 px-4 font-bold">Parent</th>
                  <th className="py-4 px-4 font-bold">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border dark:divide-outline-variant">
                {filteredParents.length > 0 ? (
                  filteredParents.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-xs">{p.avatarCode}</div>
                        <span className="font-title-sm text-on-surface">{p.name}</span>
                      </td>
                      <td className="py-4 px-4 text-on-surface font-body-md">{p.parentName}</td>
                      <td className="py-4 px-4 text-on-surface font-body-md">{p.contact}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
                      <p className="font-body-md">No matches for "{searchTerm}"</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
};
