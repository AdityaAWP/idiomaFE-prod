'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { friends as friendsApi, dm as dmApi, PublicUser, Friendship, FriendRequest } from '@/lib/api';
import { useDmSocket } from '@/hooks/useSocketIO';

interface FriendView {
  userId: string;
  username: string;
  avatarUrl: string | null;
  online: boolean;
  language: string;
  unread: number;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const dmSocket = useDmSocket();
  const [friendList, setFriendList] = useState<FriendView[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendView | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'friends' | 'requests' | 'search'>('friends');

  // Open Requests tab if navigated from notification
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'requests') setTab('requests');
  }, [searchParams]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadFriends = useCallback(async () => {
    try {
      const data = await friendsApi.list();
      setFriendList(
        data.map((f: Friendship) => ({
          userId: f.friend.id,
          username: f.friend.username,
          avatarUrl: f.friend.avatarUrl,
          online: false,
          language: f.friend.targetLanguage ?? 'Unknown',
          unread: 0,
        }))
      );
    } catch {} finally {
      setIsLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const data = await friendsApi.receivedRequests();
      setRequests(data);
    } catch {}
  }, []);

  useEffect(() => { loadFriends(); loadRequests(); }, [loadFriends, loadRequests]);

  const loadMessages = useCallback(async (friendId: string) => {
    try {
      const data = await dmApi.messages(friendId);
      setMessages(data.messages.map((m) => ({ ...m, from: m.senderId === user?.id ? 'me' : 'them' })));
    } catch {
      setMessages([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedFriend) {
      loadMessages(selectedFriend.userId);
    }
  }, [selectedFriend, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle incoming DM messages from socket
  useEffect(() => {
    if (dmSocket.incomingMessages.length > 0) {
      const lastMsg = dmSocket.incomingMessages[dmSocket.incomingMessages.length - 1];
      if (selectedFriend && lastMsg.senderId === selectedFriend.userId) {
        setMessages((prev) => [...prev, { ...lastMsg, from: 'them' }]);
      }
    }
  }, [dmSocket.incomingMessages, selectedFriend]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !selectedFriend) return;
    dmSocket.sendMessage(selectedFriend.userId, text);
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'me' as const, content: text, createdAt: now.toISOString() }]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openChat = (f: FriendView) => setSelectedFriend(f);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await friendsApi.list(); // fallback: search from friends
      // For actual search, use users search: import { users } from lib
      const { users } = await import('@/lib/api');
      const res = await users.search(searchQuery);
      setSearchResults(res.filter((r) => r.id !== user?.id));
    } catch {}
  };

  const handleSendRequest = async (receiverId: string) => {
    try {
      await friendsApi.sendRequest(receiverId);
      setSearchResults((prev) => prev.filter((r) => r.id !== receiverId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendsApi.acceptRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      loadFriends();
    } catch {}
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendsApi.rejectRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch {}
  };

  const filtered = friendList.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay */}
      {selectedFriend && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[#fffdf9]" style={{ top: 'var(--navbar-height)' }}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f0e8de] bg-white shadow-sm shrink-0">
            <button className="text-[var(--accent)] p-1 -ml-1 rounded-lg hover:bg-[var(--paper-2)]" onClick={() => setSelectedFriend(null)}>
              <ArrowLeft size={20} />
            </button>
            <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">
              {selectedFriend.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#2B2B2B] text-sm truncate">{selectedFriend.username}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.from === 'me' ? 'bg-[var(--accent)] text-white rounded-br-sm shadow-md' : 'bg-white border border-[#f0e8de] text-[#2B2B2B] rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="px-4 py-3 border-t border-[#f0e8de] bg-white shrink-0">
            <div className="flex items-center gap-2">
              <input type="text" placeholder={`Message ${selectedFriend.username}…`} value={input}
                onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                className="flex-1 bg-[#fdf8f2] border border-[#f0e8de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
              <button onClick={sendMessage} disabled={!input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent)] text-white shadow-md disabled:opacity-40 shrink-0">
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="animate-fadeInUp" style={{ height: 'calc(100vh - var(--navbar-height) - 56px)' }}>
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-[#2B2B2B] tracking-tight">Friends &amp; Messages</h1>
          <div className="flex gap-4 mt-2">
            <button onClick={() => setTab('friends')} className={`text-sm font-medium px-3 py-1 rounded-full ${tab === 'friends' ? 'bg-[var(--accent)] text-white' : 'text-gray-500'}`}>Friends</button>
            <button onClick={() => setTab('requests')} className={`text-sm font-medium px-3 py-1 rounded-full ${tab === 'requests' ? 'bg-[var(--accent)] text-white' : 'text-gray-500'}`}>Requests</button>
            <button onClick={() => setTab('search')} className={`text-sm font-medium px-3 py-1 rounded-full ${tab === 'search' ? 'bg-[var(--accent)] text-white' : 'text-gray-500'}`}>Find People</button>
          </div>
        </div>

        <div className="flex rounded-2xl border border-[#f0e8de] shadow-md overflow-hidden bg-white" style={{ height: 'calc(100% - 100px)' }}>
          {/* Sidebar */}
          <div className={`flex flex-col border-r border-[#f0e8de] bg-[#fffdf9] w-full md:w-72 lg:w-80 ${selectedFriend ? 'hidden md:flex' : ''}`}>
            {tab === 'friends' && (
              <>
                <div className="p-4 border-b border-[#f0e8de]">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search friends…" value={search} onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-[#fdf8f2] border border-[#f0e8de] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {isLoading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400" size={24} /></div>}
                  {!isLoading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-10">
                      <UserPlus size={32} />
                      <p className="text-sm">No friends yet</p>
                    </div>
                  )}
                  {filtered.map((f) => (
                    <div key={f.userId} onClick={() => openChat(f)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--paper-2)] border-b border-[#f0e8de]/60 cursor-pointer ${selectedFriend?.userId === f.userId ? 'bg-[var(--paper-3)]' : ''}`}>
                      <div className="w-11 h-11 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {f.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm text-[#2B2B2B] truncate block">{f.username}</span>
                        <span className="text-xs text-gray-400">{f.language}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'requests' && (
              <div className="flex-1 overflow-y-auto p-4">
                {requests.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No pending requests</p>}
                {requests.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 py-4 border-b border-[#f0e8de]">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold shrink-0">
                      {r.sender?.username?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{r.sender?.username ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">wants to be friends with you</p>
                    </div>
                    <button onClick={() => handleAcceptRequest(r.id)} className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 shrink-0"><Check size={16} /></button>
                    <button onClick={() => handleRejectRequest(r.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 shrink-0"><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            {tab === 'search' && (
              <div className="p-4 flex-1">
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Search users…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 bg-[#fdf8f2] border border-[#f0e8de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                  <button onClick={handleSearch} className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium">Search</button>
                </div>
                {searchResults.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 py-3 border-b border-[#f0e8de]">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                      {r.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{r.username}</p>
                    </div>
                    <button onClick={() => handleSendRequest(r.id)} className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90">
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat panel (desktop) */}
          <div className={`flex-1 flex-col ${selectedFriend ? 'hidden md:flex' : 'hidden md:flex'}`}>
            {selectedFriend ? (
              <>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f0e8de] bg-white shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">
                    {selectedFriend.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#2B2B2B] text-sm">{selectedFriend.username}</p>
                    <p className="text-xs text-gray-400">{selectedFriend.language}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#fffdf9]">
                  {messages.length === 0 && <p className="text-center text-gray-400 py-20">No messages yet. Say hello!</p>}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.from === 'me' ? 'bg-[var(--accent)] text-white rounded-br-sm shadow-md' : 'bg-white border border-[#f0e8de] text-[#2B2B2B] rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="px-4 py-3.5 border-t border-[#f0e8de] bg-white shrink-0">
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder={`Message ${selectedFriend.username}…`} value={input}
                      onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                      className="flex-1 bg-[#fdf8f2] border border-[#f0e8de] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                    <button onClick={sendMessage} disabled={!input.trim()}
                      className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--accent)] text-white shadow-md disabled:opacity-40 shrink-0">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6 bg-[#fffdf9]">
                <div className="w-20 h-20 rounded-2xl bg-[var(--paper-2)] flex items-center justify-center">
                  <MessageSquare size={36} className="text-[var(--accent)]" />
                </div>
                <h2 className="text-lg font-bold text-[#2B2B2B]">Select a conversation</h2>
                <p className="text-sm text-[#5A5A5A] mt-1 max-w-xs">Pick a friend from the list to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
