'use client';

import { useState, useRef, useEffect } from 'react';
import {
  UserPlus,
  MessageSquare,
  Search,
  Send,
  Phone,
  Video,
  MoreHorizontal,
  Circle,
  ArrowLeft,
  Smile,
  Paperclip,
} from 'lucide-react';

/* ── Mock Friends ── */
const FRIENDS = [
  {
    id: 1,
    name: 'Maria García',
    initials: 'MG',
    color: '#c99614',
    language: '🇪🇸 Spanish',
    online: true,
    lastMsg: 'That sounds great! See you soon 👋',
    lastTime: '2m ago',
    unread: 2,
  },
  {
    id: 2,
    name: 'Kenji Matsuda',
    initials: 'KM',
    color: '#c99614',
    language: '🇯🇵 Japanese',
    online: true,
    lastMsg: 'Can we practice tomorrow?',
    lastTime: '1h ago',
    unread: 0,
  },
  {
    id: 3,
    name: 'Sophie Lefèvre',
    initials: 'SL',
    color: '#10b981',
    language: '🇫🇷 French',
    online: false,
    lastMsg: 'Merci beaucoup! À bientôt.',
    lastTime: 'Yesterday',
    unread: 0,
  },
  {
    id: 4,
    name: 'Ahmed Al-Rashid',
    initials: 'AR',
    color: '#8b5cf6',
    language: '🇸🇦 Arabic',
    online: false,
    lastMsg: 'Great session today!',
    lastTime: '3 days ago',
    unread: 0,
  },
];

type Message = { id: number; from: 'me' | 'them'; text: string; time: string };

const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, from: 'them', text: 'Hey! Ready for today\'s session? 🎉', time: '10:30' },
    { id: 2, from: 'me', text: 'Absolutely! Let\'s start with some vocabulary.', time: '10:31' },
    { id: 3, from: 'them', text: 'Perfect. I want to practice the subjunctive mood today.', time: '10:32' },
    { id: 4, from: 'me', text: 'Good choice! It\'s tricky but very important.', time: '10:33' },
    { id: 5, from: 'them', text: 'That sounds great! See you soon 👋', time: '10:35' },
  ],
  2: [
    { id: 1, from: 'them', text: 'こんにちは！How\'s your Japanese coming along?', time: 'Yesterday' },
    { id: 2, from: 'me', text: 'Getting better! The kanji are still a challenge though 😅', time: 'Yesterday' },
    { id: 3, from: 'them', text: 'Can we practice tomorrow?', time: '1h ago' },
  ],
  3: [
    { id: 1, from: 'me', text: 'Bonjour Sophie! Ça va?', time: '3 days ago' },
    { id: 2, from: 'them', text: 'Très bien merci! Et toi?', time: '3 days ago' },
    { id: 3, from: 'them', text: 'Merci beaucoup! À bientôt.', time: '2 days ago' },
  ],
  4: [
    { id: 1, from: 'them', text: 'مرحبا! Ready to practice Arabic?', time: '3 days ago' },
    { id: 2, from: 'me', text: 'Yes! I\'ve been studying the alphabet.', time: '3 days ago' },
    { id: 3, from: 'them', text: 'Great session today!', time: '3 days ago' },
  ],
};

export default function FriendsPage() {
  const [selectedFriend, setSelectedFriend] = useState<typeof FRIENDS[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filtered = FRIENDS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (selectedFriend) {
      setMessages(MOCK_MESSAGES[selectedFriend.id] ?? []);
    }
  }, [selectedFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !selectedFriend) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: Date.now(), from: 'me', text, time }]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openChat = (friend: typeof FRIENDS[0]) => {
    setSelectedFriend(friend);
  };

  return (
    <>
      {/* ── MOBILE FULL-FRAME CHAT OVERLAY ── */}
      {selectedFriend && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[#fffdf9]"
          style={{ top: 'var(--navbar-height)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f0e8de] bg-white shadow-sm shrink-0">
            <button
              className="text-[#c99614] p-1 -ml-1 rounded-lg hover:bg-[#FBF4E0] transition-colors"
              onClick={() => setSelectedFriend(null)}
              aria-label="Back to friends list"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: selectedFriend.color }}
              >
                {selectedFriend.initials}
              </div>
              {selectedFriend.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#2B2B2B] text-sm leading-tight truncate">{selectedFriend.name}</p>
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                {selectedFriend.online ? (
                  <><Circle size={7} className="fill-emerald-400 text-emerald-400" /> Online</>
                ) : 'Offline'}
                &nbsp;·&nbsp;{selectedFriend.language}
              </p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button className="w-9 h-9 rounded-xl hover:bg-[#FBF4E0] text-gray-500 hover:text-[#c99614] transition-colors flex items-center justify-center">
                <Phone size={16} />
              </button>
              <button className="w-9 h-9 rounded-xl hover:bg-[#FBF4E0] text-gray-500 hover:text-[#c99614] transition-colors flex items-center justify-center">
                <Video size={16} />
              </button>
              <button className="w-9 h-9 rounded-xl hover:bg-[#FBF4E0] text-gray-500 hover:text-[#c99614] transition-colors flex items-center justify-center">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                {msg.from === 'them' && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] mr-2 shrink-0 self-end"
                    style={{ background: selectedFriend.color }}
                  >
                    {selectedFriend.initials}
                  </div>
                )}
                <div
                  className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === 'me'
                      ? 'bg-gradient-to-br from-[#c99614] to-[#c99614] text-white rounded-br-sm shadow-md shadow-[#c99614]/20'
                      : 'bg-white border border-[#f0e8de] text-[#2B2B2B] rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.text}
                  <div className={`text-[10px] mt-1 ${msg.from === 'me' ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[#f0e8de] bg-white shrink-0">
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl text-gray-400 hover:text-[#c99614] hover:bg-[#FBF4E0] transition-colors flex items-center justify-center shrink-0">
                <Smile size={18} />
              </button>
              <input
                type="text"
                placeholder={`Message ${selectedFriend.name.split(' ')[0]}…`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-[#fdf8f2] border border-[#f0e8de] rounded-xl px-4 py-2.5 text-sm text-[#2B2B2B] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#c99614] focus:border-[#c99614] transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#c99614] to-[#c99614] text-white shadow-md shadow-[#c99614]/25 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP / TABLET TWO-PANEL LAYOUT ── */}
      <div className="animate-fadeInUp" style={{ height: 'calc(100vh - var(--navbar-height) - 56px)' }}>
        {/* Page header */}
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-[#2B2B2B] tracking-tight">Friends &amp; Messages</h1>
          <p className="text-sm text-[#5A5A5A] mt-1">Connect and chat with your language partners</p>
        </div>

        <div
          className="flex rounded-2xl border border-[#f0e8de] shadow-md overflow-hidden bg-white"
          style={{ height: 'calc(100% - 64px)' }}
        >
          {/* ── LEFT: Friend list ── */}
          <div className={`flex flex-col border-r border-[#f0e8de] bg-[#fffdf9] transition-all duration-300 ${
            selectedFriend ? 'hidden md:flex md:w-72 lg:w-80' : 'w-full md:w-72 lg:w-80'
          }`}>
            {/* Search */}
            <div className="p-4 border-b border-[#f0e8de]">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search friends…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#fdf8f2] border border-[#f0e8de] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#2B2B2B] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#c99614] focus:border-[#c99614] transition-all"
                />
              </div>
            </div>

            {/* Online section label */}
            <div className="px-4 pt-3 pb-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Online — {FRIENDS.filter(f => f.online).length}
              </span>
            </div>

            {/* Friend entries */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-10">
                  <UserPlus size={32} />
                  <p className="text-sm">No friends found</p>
                </div>
              )}
              {filtered.map((friend) => (
                <div
                  key={friend.id}
                  className={`group w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-[#FFF8F0] border-b border-[#f0e8de]/60 cursor-pointer ${
                    selectedFriend?.id === friend.id ? 'bg-[#FBF4E0]' : ''
                  }`}
                  onClick={() => openChat(friend)}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: friend.color }}
                    >
                      {friend.initials}
                    </div>
                    {friend.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#2B2B2B] truncate">{friend.name}</span>
                      <span className="text-[11px] text-gray-400 shrink-0 ml-2">{friend.lastTime}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-[#5A5A5A] truncate">{friend.lastMsg}</span>
                      {friend.unread > 0 && (
                        <span className="ml-2 shrink-0 min-w-[18px] h-[18px] px-1 bg-[#c99614] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                          {friend.unread}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-0.5 block">{friend.language}</span>
                  </div>

                  {/* DM quick-action button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); openChat(friend); }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-[#c99614] text-white flex items-center justify-center shadow-md shadow-[#c99614]/30 transition-all hover:scale-105 active:scale-95"
                    title={`Message ${friend.name}`}
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add friend */}
            <div className="p-4 border-t border-[#f0e8de]">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[#c99614]/40 text-[#c99614] text-sm font-medium hover:bg-[#FBF4E0] transition-colors">
                <UserPlus size={15} /> Add Friend
              </button>
            </div>
          </div>

          {/* ── RIGHT: Chat panel (desktop) ── */}
          <div className={`flex-1 flex-col ${selectedFriend ? 'hidden md:flex' : 'hidden md:flex'}`}>
            {selectedFriend ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f0e8de] bg-white shrink-0">
                  <button
                    className="md:hidden mr-1 text-[#c99614]"
                    onClick={() => setSelectedFriend(null)}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: selectedFriend.color }}
                    >
                      {selectedFriend.initials}
                    </div>
                    {selectedFriend.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#2B2B2B] text-sm leading-tight">{selectedFriend.name}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      {selectedFriend.online ? (
                        <><Circle size={7} className="fill-emerald-400 text-emerald-400" /> Online</>
                      ) : 'Offline'}
                      &nbsp;·&nbsp;{selectedFriend.language}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-9 h-9 rounded-xl hover:bg-[#FBF4E0] text-gray-500 hover:text-[#c99614] transition-colors flex items-center justify-center" title="Voice Call">
                      <Phone size={16} />
                    </button>
                    <button className="w-9 h-9 rounded-xl hover:bg-[#FBF4E0] text-gray-500 hover:text-[#c99614] transition-colors flex items-center justify-center" title="Video Call">
                      <Video size={16} />
                    </button>
                    <button className="w-9 h-9 rounded-xl hover:bg-[#FBF4E0] text-gray-500 hover:text-[#c99614] transition-colors flex items-center justify-center" title="More">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#fffdf9]">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      {msg.from === 'them' && (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] mr-2 shrink-0 self-end"
                          style={{ background: selectedFriend.color }}
                        >
                          {selectedFriend.initials}
                        </div>
                      )}
                      <div
                        className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.from === 'me'
                            ? 'bg-gradient-to-br from-[#c99614] to-[#c99614] text-white rounded-br-sm shadow-md shadow-[#c99614]/20'
                            : 'bg-white border border-[#f0e8de] text-[#2B2B2B] rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {msg.text}
                        <div className={`text-[10px] mt-1 ${msg.from === 'me' ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div className="px-4 py-3.5 border-t border-[#f0e8de] bg-white shrink-0">
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-xl text-gray-400 hover:text-[#c99614] hover:bg-[#FBF4E0] transition-colors flex items-center justify-center shrink-0">
                      <Smile size={17} />
                    </button>
                    <button className="w-9 h-9 rounded-xl text-gray-400 hover:text-[#c99614] hover:bg-[#FBF4E0] transition-colors flex items-center justify-center shrink-0">
                      <Paperclip size={17} />
                    </button>
                    <input
                      type="text"
                      id="chat-input"
                      placeholder={`Message ${selectedFriend.name.split(' ')[0]}…`}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-[#fdf8f2] border border-[#f0e8de] rounded-xl px-4 py-3 text-sm text-[#2B2B2B] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#c99614] focus:border-[#c99614] transition-all"
                    />
                    <button
                      id="send-message-btn"
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#c99614] to-[#c99614] text-white shadow-md shadow-[#c99614]/25 hover:shadow-lg hover:shadow-[#c99614]/35 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6 bg-[#fffdf9]">
                <div className="w-20 h-20 rounded-2xl bg-[#FBF4E0] flex items-center justify-center">
                  <MessageSquare size={36} className="text-[#c99614]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#2B2B2B]">Select a conversation</h2>
                  <p className="text-sm text-[#5A5A5A] mt-1 max-w-xs">
                    Pick a friend from the list to start chatting and practicing languages together.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
