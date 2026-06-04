import { useState } from 'react';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';

interface Announcement {
  id: number;
  title: string;
  content: string;
  category: 'Urgent' | 'Academic' | 'Event' | 'General';
  audience: string;
  date: string;
  author: string;
  pinned: boolean;
  read: boolean;
}

export const TeacherAnnouncements = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Urgent' | 'Academic' | 'Event' | 'General'>('All');
  const [expandedId, setExpandedId] = useState<number | null>(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'Urgent' | 'Academic' | 'Event' | 'General'>('General');
  const [newAudience, setNewAudience] = useState('All Classes');
  const [newPinned, setNewPinned] = useState(false);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: 'Midterm Exam Grades Lock',
      content: 'Reminder that the grades entry portal will lock automatically this Friday, October 27 at 12:00 PM. Please ensure all outstanding JCE and MSCE test entries are saved.',
      category: 'Urgent',
      audience: 'Staff & Teachers',
      date: 'Oct 23, 2026',
      author: 'Deputy Head Academics',
      pinned: true,
      read: false,
    },
    {
      id: 2,
      title: 'Physics Lab Session Schedule',
      content: 'The Form 4 MSCE Physics class will have an extended practical session in Science Lab 1 on Wednesday. Please bring your completed lab workbooks.',
      category: 'Academic',
      audience: 'Form 4B - Physics',
      date: 'Oct 22, 2026',
      author: 'Mr. Mwenitete (You)',
      pinned: false,
      read: true,
    },
    {
      id: 3,
      title: 'PTA General Assembly Meeting',
      content: 'The annual Parents and Teachers Association meeting will be held in the main school auditorium this Saturday from 9:30 AM to 12:00 PM.',
      category: 'Event',
      audience: 'All Parents & Staff',
      date: 'Oct 20, 2026',
      author: 'Principal Dr. Phiri',
      pinned: false,
      read: true,
    },
    {
      id: 4,
      title: 'New Textbook Distribution',
      content: 'Form 2 Mathematics reference books are now available in the library. Students can check them out using their library cards starting this afternoon.',
      category: 'General',
      audience: 'Form 2C - Mathematics',
      date: 'Oct 18, 2026',
      author: 'Mr. Mwenitete (You)',
      pinned: false,
      read: true,
    },
  ]);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setAnnouncements((prev) => [{
      id: Date.now(),
      title: newTitle,
      content: newContent,
      category: newCategory,
      audience: newAudience,
      date: 'Just now',
      author: 'Mr. Mwenitete (You)',
      pinned: newPinned,
      read: false,
    }, ...prev]);
    setNewTitle(''); setNewContent(''); setNewCategory('General');
    setNewAudience('All Classes'); setNewPinned(false);
    setIsModalOpen(false);
  };

  const markRead = (id: number) =>
    setAnnouncements((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));

  const togglePin = (id: number) =>
    setAnnouncements((prev) => prev.map((a) => a.id === id ? { ...a, pinned: !a.pinned } : a));

  const deleteAnnouncement = (id: number) =>
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

  const categoryConfig: Record<Announcement['category'], {
    accent: string; bg: string; badge: string; icon: string; label: string;
  }> = {
    Urgent:  { accent: 'border-l-error',    bg: 'bg-error/5',     badge: 'bg-error/10 border-error/40 text-error',       icon: 'warning',      label: 'Urgent'   },
    Academic:{ accent: 'border-l-primary',   bg: 'bg-primary/5',   badge: 'bg-primary/10 border-primary/40 text-primary',  icon: 'school',       label: 'Academic' },
    Event:   { accent: 'border-l-secondary', bg: 'bg-secondary/5', badge: 'bg-secondary/10 border-secondary/40 text-secondary', icon: 'event',    label: 'Event'    },
    General: { accent: 'border-l-tertiary',  bg: 'bg-tertiary/5',  badge: 'bg-tertiary/10 border-tertiary/40 text-tertiary',   icon: 'info',     label: 'General'  },
  };

  const filtered = announcements
    .filter((a) => selectedFilter === 'All' || a.category === selectedFilter)
    .filter((a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.audience.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const unreadCount = announcements.filter((a) => !a.read).length;

  const filterLabels: Record<string, string> = {
    All: 'All', Urgent: '🔴 Urgent', Academic: '🔵 Academic', Event: '🟢 Event', General: '🟡 General',
  };

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors">

        {/* Page Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-2">
              <span className="hover:text-primary cursor-pointer">Staff</span>
              <span>/</span>
              <span className="text-primary font-bold">Announcements</span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">Bulletin Board</h1>
            <p className="font-body-md text-on-surface-variant">
              School-wide notices, alerts, and academic updates.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-end">
            {unreadCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 border border-error/30 text-error text-xs font-bold rounded-full">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse inline-block" />
                {unreadCount} Unread
              </span>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all text-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_box</span>
              New Announcement
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant p-3 rounded-xl shadow-sm mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-outline-variant focus:border-primary rounded-lg outline-none bg-surface-container text-on-surface text-sm transition-colors"
            />
          </div>
          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto py-0.5">
            {(['All', 'Urgent', 'Academic', 'Event', 'General'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  selectedFilter === f
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container border border-surface-border text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements Feed */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((a) => {
              const cfg = categoryConfig[a.category];
              const isExpanded = expandedId === a.id;

              return (
                <div
                  key={a.id}
                  className={`relative bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-xl shadow-sm overflow-hidden border-l-4 transition-all duration-200 ${cfg.accent} ${!a.read ? cfg.bg : ''}`}
                >
                  {/* Card Header — always visible */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-surface-container-low/50 transition-colors"
                    onClick={() => {
                      setExpandedId(isExpanded ? null : a.id);
                      if (!a.read) markRead(a.id);
                    }}
                  >
                    {/* Category icon */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.badge} border`}>
                      <span className="material-symbols-outlined text-[18px]">{cfg.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Unread dot */}
                        {!a.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <h3 className={`text-sm font-bold text-on-surface truncate ${!a.read ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                          {a.title}
                        </h3>
                        {a.pinned && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-error bg-error/10 border border-error/30 px-1.5 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[10px]">push_pin</span>
                            Pinned
                          </span>
                        )}
                        <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-full uppercase tracking-wider ${cfg.badge}`}>
                          {a.category}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-outline">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">person</span>
                          {a.author}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                          {a.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">group</span>
                          {a.audience}
                        </span>
                      </div>

                      {/* Content preview when collapsed */}
                      {!isExpanded && (
                        <p className="text-xs text-on-surface-variant mt-1.5 line-clamp-1 leading-relaxed">
                          {a.content}
                        </p>
                      )}
                    </div>

                    {/* Chevron */}
                    <span className={`material-symbols-outlined text-outline text-[20px] flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-5 pb-4">
                      <div className="border-t border-surface-border dark:border-outline-variant pt-3 mb-4">
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {a.content}
                        </p>
                      </div>

                      {/* Action row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {!a.read && (
                          <button
                            onClick={() => markRead(a.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[14px]">mark_email_read</span>
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => togglePin(a.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold rounded-lg transition-colors active:scale-95 ${
                            a.pinned
                              ? 'bg-error/10 border-error/30 text-error hover:bg-error/20'
                              : 'bg-surface-container border-surface-border text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">push_pin</span>
                          {a.pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-surface-border text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[14px]">share</span>
                          Share
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(a.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 border border-error/30 text-error text-xs font-bold rounded-lg hover:bg-error/20 transition-colors active:scale-95 ml-auto"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-2xl">
              <span className="material-symbols-outlined text-5xl text-outline mb-4 block">campaign</span>
              <h3 className="font-title-lg text-on-surface">No announcements found</h3>
              <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mt-1">
                Try adjusting your search or clear the active filter.
              </p>
            </div>
          )}
        </div>

        {/* New Announcement Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">New Announcement</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Publish to bulletin board</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-[11px] text-outline mb-1 font-bold uppercase tracking-wider">Title</label>
                  <input type="text" required placeholder="Enter announcement title..."
                    value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg bg-surface-container text-on-surface outline-none text-sm transition-colors" />
                </div>

                <div>
                  <label className="block text-[11px] text-outline mb-1 font-bold uppercase tracking-wider">Content</label>
                  <textarea required rows={4} placeholder="Write announcement description..."
                    value={newContent} onChange={(e) => setNewContent(e.target.value)}
                    className="w-full p-3 border border-outline-variant focus:border-primary rounded-lg bg-surface-container text-on-surface outline-none text-sm transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-outline mb-1 font-bold uppercase tracking-wider">Category</label>
                    <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg bg-surface-container text-on-surface outline-none text-sm transition-colors">
                      <option value="General">General</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Academic">Academic</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-outline mb-1 font-bold uppercase tracking-wider">Audience</label>
                    <select value={newAudience} onChange={(e) => setNewAudience(e.target.value)}
                      className="w-full px-3 py-2 border border-outline-variant focus:border-primary rounded-lg bg-surface-container text-on-surface outline-none text-sm transition-colors">
                      <option value="All Classes">All Classes</option>
                      <option value="Form 3A - Mathematics">Form 3A - Maths</option>
                      <option value="Form 4B - Physics">Form 4B - Physics</option>
                      <option value="Form 2C - Mathematics">Form 2C - Maths</option>
                      <option value="Parents only">Parents only</option>
                      <option value="Staff & Teachers">Staff & Teachers</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" id="newPinned" checked={newPinned}
                    onChange={(e) => setNewPinned(e.target.checked)}
                    className="w-4 h-4 text-primary bg-surface-container border-outline rounded focus:ring-primary" />
                  <span className="text-xs text-on-surface-variant">Pin to top of bulletin board</span>
                </label>

                <div className="flex justify-end gap-3 pt-3 border-t border-surface-border dark:border-outline-variant">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-outline text-on-surface-variant hover:bg-surface-container rounded-lg font-bold transition-all text-xs">
                    Cancel
                  </button>
                  <button type="submit"
                    className="px-5 py-2 bg-primary text-on-primary hover:opacity-90 active:scale-95 rounded-lg font-bold transition-all text-xs shadow-sm">
                    Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
};
export default TeacherAnnouncements;
