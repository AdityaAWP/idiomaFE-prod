'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Send, Lightbulb, Dices, Sparkles, UserPlus, Check, X, Users, MessageSquare, ChevronDown, User } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useLobbyCall, LobbyParticipant } from '@/hooks/useLobbyCall';
import { useAuth } from '@/app/context/AuthContext';
import { lobbies as lobbiesApi, friends as friendsApi, ai as aiApi } from '@/lib/api';

export default function GroupLobbyRoom() {
  const router = useRouter();
  const params = useParams();
  const lobbyId = params.id as string;
  const { user } = useAuth();
  const ag = useLobbyCall(lobbyId);

  const [sentFriends, setSentFriends] = useState<Set<string>>(new Set());
  const [mobilePanelOpen, setMobilePanelOpen] = useState<'chat' | 'scaf' | null>(null);
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string }[]>([
    { id: '1', sender: 'system', text: 'Welcome to the lobby! Be respectful.' },
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const partArray = Array.from(ag.participants.values());
  const isMaster = partArray.some(p => p.uid === user?.id);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAddFriend = async (uid: string) => {
    if (sentFriends.has(uid)) return;
    try {
      await friendsApi.sendRequest(uid);
      setSentFriends(prev => new Set(prev).add(uid));
    } catch {}
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'You', text: inputText }]);
    setInputText('');
  };

  const triggerTruthOrDare = async () => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'system', text: '🎲 Loading Truth/Dare…' }]);
    try {
      const r = await aiApi.truthOrDare((user?.targetLanguage || 'ENGLISH').toUpperCase());
      setMessages(prev => prev.map(m => m.text === '🎲 Loading Truth/Dare…' ? { ...m, text: r.text } : m));
    } catch {
      setMessages(prev => prev.map(m => m.text === '🎲 Loading Truth/Dare…' ? { ...m, text: '🎲 Truth: What is your most embarrassing language mistake?' } : m));
    }
  };

  const triggerSuggestTopic = () => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'system', text: '💡 Topic: "What are the biggest culture shocks you\'ve experienced?"' }]);
  };

  const handleEndCall = async () => {
    await ag.leave();
    router.push('/lobbies');
  };

  // ── Loading / Error states ──
  if (ag.loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Joining lobby video call…</p>
        </div>
      </div>
    );
  }

  if (ag.error) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-500 mb-6">{ag.error}</p>
          <button onClick={() => router.push('/lobbies')} className="bg-[var(--accent)] text-white px-6 py-2.5 rounded-lg font-medium">Back to Lobbies</button>
        </div>
      </div>
    );
  }

  // ── Participant tile ──
  const Tile = ({ p }: { p: LobbyParticipant }) => {
    const isMe = p.uid === user?.id;
    return (
      <div className="relative rounded-xl overflow-hidden bg-gray-900 w-full h-full">
        {isMe && ag.isVideoOff ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500"><User size={48} /></div>
        ) : (
          <div
            ref={isMe ? ag.setupLocalVideo : (el: any) => ag.setupRemoteVideo(p.uid, el)}
            className="w-full h-full"
          />
        )}
        {!isMe && !p.videoOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-500"><User size={48} /></div>
        )}
        {!isMe && (
          <div className="absolute top-2 left-2 z-20">
            <button onClick={() => handleAddFriend(p.uid)} disabled={sentFriends.has(p.uid)}
              className={`bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${sentFriends.has(p.uid) ? 'text-green-400 cursor-default' : 'text-white hover:bg-black/80'}`}>
              {sentFriends.has(p.uid) ? <Check size={11} /> : <UserPlus size={11} />}
              <span className="hidden sm:inline">{sentFriends.has(p.uid) ? 'Sent' : 'Add'}</span>
            </button>
          </div>
        )}
        <div className="absolute bottom-2 left-2 z-10 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 border border-white/10">
          {p.username || (isMe ? 'You' : `User ${p.uid.slice(0,5)}`)}
          {(isMe ? ag.isMuted : p.muted) && <MicOff size={11} className="text-red-400" />}
          {p.speaking && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
        </div>
      </div>
    );
  };

  const ChatMessages = () => (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-sm">
      {messages.map(msg => (
        <div key={msg.id} className={`flex flex-col ${msg.sender === 'system' ? 'items-center' : msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
          {msg.sender === 'system' ? (
            <div className="bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-semibold px-3 py-1.5 rounded-lg max-w-[95%] text-center">{msg.text}</div>
          ) : (
            <div className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'} max-w-[85%]`}>
              <div className="text-xs font-bold text-gray-400 mb-1 px-1">{msg.sender}</div>
              <div className={`px-3 py-2 rounded-xl text-sm ${msg.sender === 'You' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>{msg.text}</div>
            </div>
          )}
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );

  const ChatInput = () => (
    <div className="p-3 border-t border-gray-100 bg-white">
      <div className="relative flex items-center">
        <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Group message…"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-2.5 focus:ring-2 focus:ring-black focus:border-black text-sm" />
        <button onClick={handleSendMessage} disabled={!inputText.trim()}
          className={`absolute right-1 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${inputText.trim() ? 'bg-black text-white' : 'text-gray-300'}`}>
          <Send size={15} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══ MOBILE ═══ */}
      <div className="lg:hidden flex flex-col bg-black relative overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Grid of participants */}
        <div className="flex-1 grid grid-cols-2 gap-1 p-1 overflow-hidden">
          {partArray.slice(0, 6).map(p => <Tile key={p.uid} p={p} />)}
          {Array.from({ length: Math.max(0, 5 - partArray.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/60 flex flex-col items-center justify-center text-gray-600">
              <Users size={18} className="mb-1 opacity-50" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Waiting…</span>
            </div>
          ))}
        </div>

        {/* Mobile control bar */}
        <div className="bg-black/80 backdrop-blur-md border-t border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
          <button onClick={ag.toggleMute}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${ag.isMuted ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/10 text-white border-white/10'}`}>
            {ag.isMuted ? <MicOff size={19} /> : <Mic size={19} />}
          </button>
          <button onClick={ag.toggleVideo}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${ag.isVideoOff ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/10 text-white border-white/10'}`}>
            {ag.isVideoOff ? <VideoOff size={19} /> : <VideoIcon size={19} />}
          </button>
          <button onClick={() => setMobilePanelOpen(mobilePanelOpen === 'chat' ? null : 'chat')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${mobilePanelOpen === 'chat' ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/10 text-white border-white/10'}`}>
            <MessageSquare size={19} />
          </button>
          <button onClick={() => setMobilePanelOpen(mobilePanelOpen === 'scaf' ? null : 'scaf')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${mobilePanelOpen === 'scaf' ? 'bg-yellow-500 text-white border-yellow-400' : 'bg-white/10 text-white border-white/10'}`}>
            <Sparkles size={19} />
          </button>
          <button onClick={handleEndCall} className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg">
            <PhoneOff size={19} />
          </button>
        </div>

        {mobilePanelOpen && (
          <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col bg-white rounded-t-3xl shadow-2xl" style={{ height: '62%' }}>
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                {mobilePanelOpen === 'chat' ? <><MessageSquare size={15} className="text-blue-500" /> Group Chat</> : <><Sparkles size={15} className="text-yellow-500" /> Group Scaffolding</>}
              </div>
              <button onClick={() => setMobilePanelOpen(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <ChevronDown size={17} />
              </button>
            </div>
            {mobilePanelOpen === 'scaf' && (
              <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={triggerSuggestTopic} className="bg-white border border-gray-200 hover:border-black text-gray-700 py-3 rounded-xl text-xs font-medium shadow-sm flex items-center justify-center gap-2 transition-colors">
                    <Lightbulb size={14} /> Suggest Topic
                  </button>
                  <button onClick={triggerTruthOrDare} className="bg-white border border-gray-200 hover:border-black text-gray-700 py-3 rounded-xl text-xs font-medium shadow-sm flex items-center justify-center gap-2 transition-colors">
                    <Dices size={14} /> Truth/Dare AI
                  </button>
                </div>
              </div>
            )}
            <ChatMessages />
            {mobilePanelOpen === 'chat' && <ChatInput />}
          </div>
        )}
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden lg:flex h-[calc(100vh-100px)] flex-row gap-6 animate-fadeIn">
        <div className="flex-grow lg:w-[70%] flex flex-col gap-4">
          <div className="flex-1 grid grid-cols-3 gap-4 auto-rows-fr">
            {partArray.slice(0, 6).map(p => <Tile key={p.uid} p={p} />)}
            {Array.from({ length: Math.max(0, 5 - partArray.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                <Users size={24} className="mb-2 opacity-50" />
                <span className="text-xs font-medium uppercase tracking-wider">Waiting…</span>
              </div>
            ))}
          </div>

          <div className="h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button onClick={ag.toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${ag.isMuted ? 'bg-red-100 text-red-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                {ag.isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <button onClick={ag.toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${ag.isVideoOff ? 'bg-red-100 text-red-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                {ag.isVideoOff ? <VideoOff size={22} /> : <VideoIcon size={22} />}
              </button>
            </div>
            <button onClick={handleEndCall} className="px-6 h-10 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-sm">
              <PhoneOff size={18} /> Leave Lobby
            </button>
          </div>
        </div>

        <div className="lg:w-[30%] w-full bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm tracking-wide">
              <Sparkles size={16} className="text-gray-500" /> Group Scaffolding
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={triggerSuggestTopic} className="bg-white border border-gray-200 hover:border-black text-gray-700 py-2.5 rounded-md text-xs font-medium shadow-sm flex items-center justify-center gap-1.5 transition-colors">
                <Lightbulb size={14} /> Suggest Topic
              </button>
              <button onClick={triggerTruthOrDare} className="bg-white border border-gray-200 hover:border-black text-gray-700 py-2.5 rounded-md text-xs font-medium shadow-sm flex items-center justify-center gap-1.5 transition-colors">
                <Dices size={14} /> Truth/Dare AI
              </button>
            </div>
          </div>
          <ChatMessages />
          <ChatInput />
        </div>
      </div>
    </>
  );
}
