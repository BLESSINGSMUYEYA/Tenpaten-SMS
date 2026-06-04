import { useState, useRef, useEffect } from 'react';
import { Header } from '../components/TeacherDashboard/Header';
import { Sidebar } from '../components/TeacherDashboard/Sidebar';
import { BottomNav } from '../components/TeacherDashboard/BottomNav';

interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface Chat {
  id: number;
  name: string;
  role: 'Parent' | 'Student' | 'Staff';
  avatarCode: string;
  subtitle: string; // e.g., "Amina's Mother", "Form 4 Student"
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
  messages: Message[];
}

export const TeacherMessages = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [activeTab, setActiveTab] = useState<'All' | 'Parent' | 'Student' | 'Staff'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const [typedMessage, setTypedMessage] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock chat details in local state
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      name: 'Mrs. Amina Bello',
      role: 'Parent',
      avatarCode: 'AB',
      subtitle: "Amina's Mother (Form 3A)",
      lastMessage: "Hi teacher, Amina won't make it to school today because she is down with a cold.",
      time: '10m ago',
      unreadCount: 1,
      online: true,
      messages: [
        { id: 1, sender: 'me', text: 'Hello Mrs. Bello. Just checking if Amina completed her physics assignment.', time: 'Yesterday, 4:15 PM' },
        { id: 2, sender: 'them', text: 'Hello! Yes, she finished it, but she woke up feeling very feverish today.', time: 'Yesterday, 5:30 PM' },
        { id: 3, sender: 'me', text: 'Oh, sorry to hear that. Please make sure she rests. I will exempt her from today\'s class check.', time: 'Yesterday, 5:45 PM' },
        { id: 4, sender: 'them', text: "Hi teacher, Amina won't make it to school today because she is down with a cold.", time: '10m ago' },
      ],
    },
    {
      id: 2,
      name: 'Dr. Head Teacher Phiri',
      role: 'Staff',
      avatarCode: 'HP',
      subtitle: 'School Principal',
      lastMessage: 'The faculty meeting has been moved to 4 PM this afternoon.',
      time: '1h ago',
      unreadCount: 2,
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Good morning staff. Reminder to upload all mock midterm scores by end of week.', time: 'Today, 8:00 AM' },
        { id: 2, sender: 'me', text: 'Copy that, Dr. Phiri. Almost done with Form 3A mathematics entries.', time: 'Today, 8:30 AM' },
        { id: 3, sender: 'them', text: 'The faculty meeting has been moved to 4 PM this afternoon.', time: '1h ago' },
      ],
    },
    {
      id: 3,
      name: 'Sarah Mwangi',
      role: 'Student',
      avatarCode: 'SM',
      subtitle: 'Form 4B Student',
      lastMessage: 'Sir, I had a quick question regarding question 4 on the thermodynamics worksheet.',
      time: '3h ago',
      unreadCount: 0,
      online: false,
      messages: [
        { id: 1, sender: 'me', text: 'Hi Sarah, did you get a chance to look at the assignment guidelines?', time: 'Yesterday' },
        { id: 2, sender: 'them', text: 'Yes sir, I started working on them last night.', time: 'Yesterday' },
        { id: 3, sender: 'them', text: 'Sir, I had a quick question regarding question 4 on the thermodynamics worksheet.', time: '3h ago' },
      ],
    },
    {
      id: 4,
      name: 'Mr. Okafor',
      role: 'Parent',
      avatarCode: 'CO',
      subtitle: "Chinedu's Father (Form 3A)",
      lastMessage: 'Regarding the report card, thank you for the feedback.',
      time: '1d ago',
      unreadCount: 0,
      online: false,
      messages: [
        { id: 1, sender: 'them', text: 'Good day teacher, I saw Chinedu\'s scores improved in algebra. Thank you for your support.', time: '2 days ago' },
        { id: 2, sender: 'me', text: 'You are welcome Mr. Okafor. Chinedu has been working very hard in class.', time: '2 days ago' },
        { id: 3, sender: 'them', text: 'Regarding the report card, thank you for the feedback.', time: '1d ago' },
      ],
    },
    {
      id: 5,
      name: 'Mrs. Sarah Mwangi (Bursar)',
      role: 'Staff',
      avatarCode: 'SM',
      subtitle: 'Finance Officer',
      lastMessage: 'Please clear the class clearance list for Form 4.',
      time: '2d ago',
      unreadCount: 0,
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Please clear the class clearance list for Form 4.', time: '2d ago' },
      ],
    },
  ]);

  // Handle auto-scroll to the bottom of the chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg: Message = {
      id: activeChat.messages.length + 1,
      sender: 'me',
      text: typedMessage,
      time: 'Just now',
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            lastMessage: typedMessage,
            time: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setTypedMessage('');
  };

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
    // Mark as read when selecting
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      })
    );
  };

  // Filter list of chats based on search and selected filter tab
  const filteredChats = chats.filter((c) => {
    const matchesTab = activeTab === 'All' || c.role === activeTab;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      
      <main className="lg:ml-72 pt-20 pb-24 lg:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen bg-surface text-on-surface transition-colors flex flex-col">
        {/* Breadcrumbs & Header */}
        <div className="py-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex gap-2 text-label-sm text-outline mb-1">
              <span className="hover:text-primary cursor-pointer">Staff</span>
              <span>/</span>
              <span className="text-primary font-bold">Messages</span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">Message Center</h1>
            <p className="font-body-md text-on-surface-variant">Secure chats with parents, staff, and students.</p>
          </div>
        </div>

        {/* Messaging Container */}
        <div className="flex-1 bg-surface-container-lowest border border-surface-border dark:border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-210px)] lg:h-[640px]">
          
          {/* Left panel: Chat list */}
          <div className="w-full lg:w-96 border-r border-surface-border dark:border-outline-variant flex flex-col bg-surface-container-low/20">
            {/* Search Bar */}
            <div className="p-4 border-b border-surface-border dark:border-outline-variant">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-xl">search</span>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-container border-b border-outline-variant focus:border-primary outline-none text-on-surface font-body-md rounded-lg transition-colors"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-surface-border dark:border-outline-variant overflow-x-auto">
              {(['All', 'Parent', 'Student', 'Staff'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 whitespace-nowrap active:scale-95 transition-all ${
                    activeTab === tab
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab === 'All' ? 'All Chats' : tab + 's'}
                </button>
              ))}
            </div>

            {/* Contact list scrollarea */}
            <div className="flex-1 overflow-y-auto divide-y divide-surface-border dark:divide-outline-variant">
              {filteredChats.length > 0 ? (
                filteredChats.map((c) => {
                  const isActive = c.id === activeChatId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectChat(c.id)}
                      className={`p-4 flex gap-3 hover:bg-surface-container-low transition-colors cursor-pointer relative ${
                        isActive ? 'bg-primary-container/30 border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-sm">
                          {c.avatarCode}
                        </div>
                        {c.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary border-2 border-white dark:border-inverse-surface rounded-full"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`font-title-sm truncate text-on-surface ${isActive ? 'font-bold' : ''}`}>
                            {c.name}
                          </span>
                          <span className="text-[10px] text-outline whitespace-nowrap">{c.time}</span>
                        </div>
                        <p className="text-xs text-outline truncate">{c.subtitle}</p>
                        <p className="text-xs text-on-surface-variant truncate mt-1 leading-relaxed">
                          {c.lastMessage}
                        </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <div className="absolute right-4 bottom-4 w-5 h-5 rounded-full bg-error text-white font-bold text-[10px] flex items-center justify-center">
                          {c.unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-outline">
                  <span className="material-symbols-outlined text-4xl mb-2">forum</span>
                  <p className="font-body-md">No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Active Chat view */}
          <div className="flex-1 flex flex-col bg-surface-container-lowest/30">
            {activeChat ? (
              <>
                {/* Chat Partner Header */}
                <div className="p-4 border-b border-surface-border dark:border-outline-variant flex items-center justify-between bg-surface-container-low/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-xs">
                      {activeChat.avatarCode}
                    </div>
                    <div>
                      <h4 className="font-title-sm text-on-surface font-bold">{activeChat.name}</h4>
                      <p className="text-[11px] text-outline flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeChat.online ? 'bg-secondary' : 'bg-outline'}`}></span>
                        {activeChat.subtitle} • {activeChat.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">phone</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">videocam</span>
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeChat.messages.map((m) => {
                    const isMe = m.sender === 'me';
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
                          isMe
                            ? 'bg-primary text-on-primary rounded-tr-none'
                            : 'bg-surface-container-high text-on-surface rounded-tl-none border border-surface-border dark:border-outline-variant'
                        }`}>
                          <p>{m.text}</p>
                          <span className={`block text-[9px] mt-1 text-right ${
                            isMe ? 'text-white/70' : 'text-outline'
                          }`}>
                            {m.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-surface-border dark:border-outline-variant flex items-center gap-3 bg-surface-container-low/20">
                  <button type="button" className="p-2 hover:bg-surface-container rounded-full text-outline hover:text-primary transition-colors flex items-center">
                    <span className="material-symbols-outlined text-xl">attach_file</span>
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-surface-container border border-outline-variant focus:border-primary outline-none text-on-surface font-body-md rounded-xl transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!typedMessage.trim()}
                    className="p-2.5 bg-primary text-on-primary hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all rounded-full flex items-center shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-outline">
                <span className="material-symbols-outlined text-5xl mb-3">forum</span>
                <p className="font-body-md">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <BottomNav />
    </>
  );
};
export default TeacherMessages;
