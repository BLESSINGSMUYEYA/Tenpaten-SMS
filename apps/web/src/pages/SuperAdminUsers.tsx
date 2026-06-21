import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/SuperAdminDashboard/Header';
import { Sidebar } from '../components/SuperAdminDashboard/Sidebar';
import { useQuery, useMutation } from '../hooks/useApi';

interface SystemUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  mustChangePassword: boolean;
  school?: {
    id: string;
    name: string;
    schoolCode: string;
  };
}

const mapRole = (role: string) => {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'head_teacher': return 'Head Teacher';
    case 'deputy_head': return 'Deputy Head';
    case 'teacher': return 'Teacher';
    case 'bursar': return 'Bursar';
    case 'student': return 'Student';
    case 'parent': return 'Parent';
    default: return role;
  }
};

export const SuperAdminUsers: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the search input — push filtering to the server
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 400);
  };

  // Fetch users — server does the search filtering
  const apiUrl = debouncedSearch.trim()
    ? `/admin/users?search=${encodeURIComponent(debouncedSearch.trim())}`
    : '/admin/users';

  const { data: apiUsers, loading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery<SystemUser[]>(apiUrl, true, [debouncedSearch]);
  const { data: schoolsData } = useQuery<any[]>('/admin/schools');
  const schools = schoolsData || [];

  // Mutator for creating user
  const { mutate: createUser, loading: creatingUser, error: createError } = useMutation('/admin/users', 'post');

  // Modal states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserSchoolId, setNewUserSchoolId] = useState('');
  const [newUserRole, setNewUserRole] = useState('head_teacher');

  useEffect(() => {
    if (schools.length > 0 && !newUserSchoolId) {
      setNewUserSchoolId(schools[0].id);
    }
  }, [schools, newUserSchoolId]);

  const users = apiUsers || [];

  // No client-side filtering needed — server handles it via ?search=
  const filteredUsers = users;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserSchoolId) return;

    const nameParts = newUserName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'User';

    try {
      await createUser({
        firstName,
        lastName,
        email: newUserEmail.toLowerCase(),
        role: newUserRole,
        schoolId: newUserSchoolId,
      });

      // Reset and close
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('head_teacher');
      if (schools.length > 0) {
        setNewUserSchoolId(schools[0].id);
      }
      setAddUserOpen(false);
      refetchUsers();
    } catch (err) {
      // Error is captured in mutation state
      console.error(err);
    }
  };

  const statusColor = (isActive: boolean) => {
    return isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container';
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <Sidebar isOpen={mobileMenuOpen} closeSidebar={() => setMobileMenuOpen(false)} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col lg:ml-72 w-full min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 px-margin-mobile md:px-margin-desktop pt-20 pb-margin-desktop overflow-y-auto bg-surface-bright">
          {/* Page Header */}
          <div className="mb-lg flex flex-col sm:flex-row sm:justify-between sm:items-end gap-md">
            <div>
              <h1 className="dash-page-title mb-xs">System Users</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Oversee, authorize, and manage administrative school users on the MyKlasi platform.</p>
            </div>
            <button 
              onClick={() => setAddUserOpen(true)}
              className="flex items-center justify-center gap-sm bg-primary text-on-primary px-4 py-2.5 rounded-lg hover:bg-primary-container transition-colors shadow-sm self-start sm:self-auto active:scale-95 text-sm font-bold"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Create User Account
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-lg">
            {[
              { label: 'Total Platform Users', value: usersLoading ? '...' : users.length, icon: 'groups', color: 'bg-primary text-on-primary' },
              { label: 'School Admin accounts', value: usersLoading ? '...' : users.filter(u => u.role === 'head_teacher' || u.role === 'deputy_head').length, icon: 'supervisor_account', color: 'bg-secondary text-on-secondary' },
              { label: 'Active Sessions Today', value: 'Live', icon: 'bolt', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
              { label: 'Suspended Users', value: usersLoading ? '...' : users.filter(u => !u.isActive).length, icon: 'block', color: 'bg-error-container text-on-error-container' },
            ].map(c => (
              <div key={c.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-4 hover:border-primary transition-all">
                <div className="p-2 bg-surface-container-low rounded-lg text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant text-xs">{c.label}</p>
                  <p className="text-headline-sm font-bold text-on-background mt-0.5 text-lg">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* User List search + Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low gap-4 flex-wrap">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold text-base">Platform User Directory</h2>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input
                  className="pl-9 pr-4 py-1.5 border border-outline-variant rounded-full bg-surface-container-lowest focus:outline-none focus:border-primary font-body-sm text-xs w-64"
                  placeholder="Search by name, school, email..."
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant">
                    <th className="p-md pl-md font-semibold text-xs text-on-surface-variant">Name</th>
                    <th className="p-md font-semibold text-xs text-on-surface-variant">Email Address</th>
                    <th className="p-md font-semibold text-xs text-on-surface-variant">Assigned Institution</th>
                    <th className="p-md font-semibold text-xs text-on-surface-variant">Account Role</th>
                    <th className="p-md font-semibold text-xs text-on-surface-variant">Last Active</th>
                    <th className="p-md pr-md text-right font-semibold text-xs text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-on-surface">
                  {usersLoading ? (
                    <tr>
                      <td colSpan={6} className="p-md text-center text-on-surface-variant text-sm py-10">
                        <span className="material-symbols-outlined text-3xl block mb-2 text-outline">hourglass_top</span>
                        Loading users…
                      </td>
                    </tr>
                  ) : usersError ? (
                    <tr>
                      <td colSpan={6} className="p-md text-center py-10">
                        <span className="material-symbols-outlined text-3xl block mb-2 text-error">error</span>
                        <p className="text-sm text-on-error-container font-semibold">{usersError}</p>
                        <button onClick={refetchUsers} className="mt-3 px-4 py-1.5 text-xs font-bold bg-primary text-on-primary rounded-lg hover:opacity-90">
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : filteredUsers.map((u, i) => (
                    <tr key={u.id || i} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-md pl-md font-bold text-sm text-primary">{u.firstName} {u.lastName}</td>
                      <td className="p-md font-mono text-on-surface-variant">{u.email}</td>
                      <td className="p-md text-on-surface-variant font-medium">{u.school?.name || 'Platform-wide'}</td>
                      <td className="p-md font-semibold text-secondary">{mapRole(u.role)}</td>
                      <td className="p-md text-on-surface-variant">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</td>
                      <td className="p-md pr-md text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm font-bold text-[10px] uppercase ${statusColor(u.isActive)}`}>
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!usersLoading && filteredUsers.length === 0 && (
                <div className="py-12 text-center text-on-surface-variant text-sm">No platform users matched your criteria.</div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* POP-UP: Add User Modal */}
      {addUserOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 shadow-2xl relative flex flex-col animate-scale-in">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">person_add</span> Create Account
              </h2>
              <button 
                onClick={() => setAddUserOpen(false)} 
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              {createError && (
                <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs font-semibold">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">User Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Grace Chimwaza"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. g.chimwaza@lakeside.edu"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Assign School</label>
                  <select
                    value={newUserSchoolId}
                    onChange={e => setNewUserSchoolId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                  >
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Account Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                  >
                    <option value="head_teacher">Head Teacher</option>
                    <option value="deputy_head">Deputy Head</option>
                    <option value="bursar">Bursar</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                <button
                  type="button"
                  onClick={() => setAddUserOpen(false)}
                  className="px-5 py-2.5 bg-surface-container border border-outline-variant text-outline hover:text-on-surface rounded-lg font-bold transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm text-sm disabled:opacity-50"
                >
                  {creatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminUsers;
