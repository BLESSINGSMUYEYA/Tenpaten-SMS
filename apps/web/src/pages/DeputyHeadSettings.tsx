import React, { useState } from 'react';
import { Header } from '../components/DeputyHeadDashboard/Header';
import { Sidebar } from '../components/DeputyHeadDashboard/Sidebar';
import { BottomNav } from '../components/DeputyHeadDashboard/BottomNav';
import { useAuth } from '../contexts/AuthContext';

export const DeputyHeadSettings: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Profile forms
  const [email, setEmail] = useState(user?.email || 'deputy.head@tenpaten.edu');
  const [phone, setPhone] = useState('+265 888 777 666');
  const [address, setAddress] = useState('Limbe, Blantyre, Malawi');

  // Academic configs
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [currentTerm, setCurrentTerm] = useState('Term 2');
  const [jceGradeScale, setJceGradeScale] = useState('JCE Standard');

  // Notifications
  const [smsAttendance, setSmsAttendance] = useState(true);
  const [smsGrades, setSmsGrades] = useState(false);
  const [emailLogs, setEmailLogs] = useState(true);

  const [activeTab, setActiveTab] = useState<'profile' | 'school' | 'notifications' | 'security'>('profile');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Administrative profile successfully saved.');
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Academic operational configurations successfully updated.');
  };

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">
        {/* Breadcrumbs & Header */}
        <div className="py-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Administration</span>
              <span>/</span>
              <span className="text-primary font-bold">Settings</span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">System Configurations</h1>
            <p className="font-body-md text-on-surface-variant">Update school grading scales, configure academic terms, customize notification policies, and edit profiles.</p>
          </div>
        </div>

        {/* Configurations Layout */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* Side Tabs List */}
          <nav className="md:col-span-3 border-r border-outline-variant bg-surface-container-low/40 p-4 flex flex-row md:flex-col gap-1 overflow-x-auto whitespace-nowrap md:whitespace-normal">
            {[
              { id: 'profile', icon: 'person', label: 'User Profile' },
              { id: 'school', icon: 'school', label: 'School Settings' },
              { id: 'notifications', icon: 'notifications', label: 'Notifications' },
              { id: 'security', icon: 'shield', label: 'Security & Access' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs transition-colors w-full text-left ${
                  activeTab === tab.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Active Settings Canvas */}
          <div className="md:col-span-9 p-lg sm:p-xl">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-lg animate-fade-in">
                <h3 className="font-headline-sm text-primary mb-md">Deputy Head Teacher Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">First Name</label>
                    <input
                      type="text"
                      disabled
                      value={user?.firstName || 'Blessings'}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container/20 text-on-surface font-body-md cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Last Name</label>
                    <input
                      type="text"
                      disabled
                      value={user?.lastName || 'Mwenitete'}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container/20 text-on-surface font-body-md cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">School Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Residential Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                  />
                </div>

                <div className="pt-4 border-t border-outline-variant">
                  <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs">
                    Save Profile
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'school' && (
              <form onSubmit={handleSaveSchool} className="space-y-lg animate-fade-in">
                <h3 className="font-headline-sm text-primary mb-md">Academic &amp; School Configurations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Academic Session</label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="2024/2025">2024/2025</option>
                      <option value="2025/2026">2025/2026</option>
                      <option value="2026/2027">2026/2027</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Active School Term</label>
                    <select
                      value={currentTerm}
                      onChange={(e) => setCurrentTerm(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="Term 1">Term 1 (First Term)</option>
                      <option value="Term 2">Term 2 (Second Term)</option>
                      <option value="Term 3">Term 3 (Third Term)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Grading Ranges</label>
                    <select
                      value={jceGradeScale}
                      onChange={(e) => setJceGradeScale(e.target.value)}
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface font-body-md transition-colors"
                    >
                      <option value="JCE Standard">JCE Standard (A:80%, B:70%)</option>
                      <option value="MSCE Standard">MSCE Standard (Points 1-9)</option>
                    </select>
                  </div>
                </div>

                <div className="p-md border border-outline-variant bg-surface-container-low/20 rounded-xl">
                  <h4 className="font-bold text-sm text-on-surface mb-2">Grading Schema Details</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Under the selected scale: <b>Excellent</b> is mapped to scores &ge; 80%, <b>Good</b> is mapped to scores &ge; 60%, <b>Fair</b> is &ge; 50%, and any average below 50% triggers a school-wide <b>Academic Review</b> milestone flag.
                  </p>
                </div>

                <div className="pt-4 border-t border-outline-variant">
                  <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs">
                    Save Academic Config
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-lg animate-fade-in">
                <h3 className="font-headline-sm text-primary mb-md">Notification Preferences</h3>
                <p className="text-xs text-on-surface-variant">Choose the automatic triggers for sending text messages to guardians and school logs.</p>
                <div className="space-y-md">
                  <div className="flex items-center justify-between p-md border border-outline-variant rounded-xl bg-surface-container-low/20">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Auto SMS: Student Absenteeism</h4>
                      <p className="text-xs text-on-surface-variant">Send an automatic text notification to a parent immediately after a student is marked absent.</p>
                    </div>
                    <button
                      onClick={() => setSmsAttendance(!smsAttendance)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${smsAttendance ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${smsAttendance ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-md border border-outline-variant rounded-xl bg-surface-container-low/20">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Auto SMS: Term Grading Published</h4>
                      <p className="text-xs text-on-surface-variant">Send an automatic SMS with grade report summaries once results are published.</p>
                    </div>
                    <button
                      onClick={() => setSmsGrades(!smsGrades)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${smsGrades ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${smsGrades ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-md border border-outline-variant rounded-xl bg-surface-container-low/20">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">System Weekly Email Logs</h4>
                      <p className="text-xs text-on-surface-variant">Receive a weekly breakdown of overall school performance, attendance, and finances directly in your mailbox.</p>
                    </div>
                    <button
                      onClick={() => setEmailLogs(!emailLogs)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${emailLogs ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailLogs ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <form onSubmit={(e) => { e.preventDefault(); alert('Security settings updated successfully.'); }} className="space-y-lg animate-fade-in">
                <h3 className="font-headline-sm text-primary mb-md">Security Credentials</h3>
                <div className="space-y-md max-w-md">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant">
                  <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs">
                    Update Security
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
};

export default DeputyHeadSettings;
