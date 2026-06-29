'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff,
  Languages, Lightbulb, Dices, Send, Sparkles, User,
  Settings, UserPlus, RefreshCw, MessageSquare, X, RotateCcw, ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePartner } from '../../context/PartnerContext';
import { useAgoraCall } from '@/hooks/useAgoraCall';
import { friends as friendsApi, ai as aiApi } from '@/lib/api';

type Message = { id: string; sender: 'me' | 'partner' | 'system'; text: string; translatedText?: string; showTranslation?: boolean; };
type FloatingEmoji = { id: string; emoji: string; x: number; y: number; side: 'local' | 'remote' };

const REACTIONS = ['👋', '😂', '🤔', '👍', '❤️'];

function emojiSound(emoji: string) {
  try {
    const map: Record<string,number> = {'👋':420,'😂':380,'🤔':520,'👍':350,'❤️':440};
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type='sine'; o.frequency.value=map[emoji]||440;
    g.gain.setValueAtTime(0.12,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.18);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime+0.18);
  } catch{}
}

export default function VideoRoomPage() {
  const router = useRouter();
  const agora = useAgoraCall();
  const { partnerTopics, partnerName, partnerFlag, partnerId, myTopics: userTopics, language: partnerLanguage } = usePartner();
  const safeTopics = partnerTopics?.length ? partnerTopics : ['Anime & Manga', 'Casual English', 'Kyoto Travel'];
  const safeName   = partnerName || 'María G.';
  const safeFlag   = partnerFlag || '🇪🇸';

  const [isMobile, setIsMobile] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mq.matches);
    setLayoutReady(true);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Controls ──────────────────────────────────────────────────────────
  const [friendSent, setFriendSent] = useState(false);
  const handleAddFriend = async () => {
    if (!partnerId) return;
    try {
      await friendsApi.sendRequest(partnerId);
      setFriendSent(true);
    } catch (err: any) {
      if (err?.message?.includes('already exists')) {
        // The partner already sent us a request — auto-accept it
        try {
          const requests = await friendsApi.receivedRequests();
          const match = requests.find((r: any) => r.senderId === partnerId);
          if (match) {
            await friendsApi.acceptRequest(match.id);
          }
        } catch {}
        setFriendSent(true);
      }
    }
  };
  const [mobilePanelOpen, setMobilePanelOpen] = useState<'chat' | 'scaf' | null>(null);

  // ── Chat ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([
    { id:'1', sender:'system', text:'🎉 Connected! Your partner\'s topics are ready.' },
  ]);
  const [input, setInput] = useState('');
  const [repeating, setRepeating] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  // ── Silence / scaffolding ─────────────────────────────────────────────
  const [silence, setSilence] = useState(0);
  const [showPresence, setShowPresence] = useState(false);
  const [showScaffold, setShowScaffold] = useState(false);
  const [topicIdx, setTopicIdx] = useState(0);

  // ── AI Topic Suggestion ──────────────────────────────────────────────
  interface TopicSuggestion {
    title: string;
    example: string;
  }
  const [suggestion, setSuggestion] = useState<TopicSuggestion | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const suggestionAttempted = useRef(false);

  const fetchTopicSuggestion = useCallback(async () => {
    suggestionAttempted.current = true;
    setSuggestionLoading(true);
    try {
      const allTopics = [...new Set([...userTopics, ...partnerTopics])];
      const lang = partnerLanguage?.toUpperCase() || 'ENGLISH';
      console.log('[TopicSuggestion] Calling API with:', allTopics, lang);
      const result = await aiApi.topicSuggestion(allTopics, lang);
      console.log('[TopicSuggestion] API response:', result);
      setSuggestion(result);
    } catch (err) {
      console.error('[TopicSuggestion] API failed:', err);
      // fallback – use a generic suggestion
      setSuggestion({ title: 'Conversation Starter', example: safeTopics[topicIdx] || 'What do you think?' });
    } finally {
      setSuggestionLoading(false);
    }
  }, [userTopics, partnerTopics, partnerLanguage, topicIdx, safeTopics]);

  // Auto-fetch only once when scaffold first appears
  useEffect(() => {
    if (showScaffold && !suggestion && !suggestionLoading && !suggestionAttempted.current) {
      fetchTopicSuggestion();
    }
  }, [showScaffold]);

  // Use real speaking detection from Agora
  const isSpeaking = agora.isSpeaking;

  useEffect(() => {
    if (isSpeaking) { setSilence(0); setShowPresence(false); setShowScaffold(false); return; }
    const iv = setInterval(() => {
      setSilence(s => { const n = s+1; if(n>=8) setShowPresence(true); if(n>=12) setShowScaffold(true); return n; });
    }, 1000);
    return () => clearInterval(iv);
  }, [isSpeaking]);

  const signal = useCallback(() => {
    setSilence(0); setShowPresence(false); setShowScaffold(false); setSuggestion(null);
  }, []);

  // ── Emoji reactions ───────────────────────────────────────────────────
  const [showBar, setShowBar] = useState(false);
  const [localEmojis, setLocalEmojis] = useState<FloatingEmoji[]>([]);
  const [remoteEmojis, setRemoteEmojis] = useState<FloatingEmoji[]>([]);

  const fireEmoji = (emoji: string) => {
    emojiSound(emoji);
    const id = `${Date.now()}-${Math.random()}`;
    const x  = 15 + Math.random() * 65;
    const y  = 20 + Math.random() * 45;
    setLocalEmojis(p => [...p, { id, emoji, x, y, side: 'local' }]);
    setTimeout(() => setLocalEmojis(p => p.filter(e => e.id !== id)), 2800);
    agora.sendEmoji?.(emoji);
  };

  // Listen for remote emojis
  useEffect(() => {
    const unsub = agora.onEmoji?.((emoji: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      const x  = 15 + Math.random() * 65;
      const y  = 20 + Math.random() * 45;
      setRemoteEmojis(p => [...p, { id, emoji, x, y, side: 'remote' }]);
      setTimeout(() => setRemoteEmojis(p => p.filter(e => e.id !== id)), 2800);
    });
    return unsub;
  }, [agora.onEmoji]);

  // Listen for remote system messages (Truth/Dare, Topics)
  useEffect(() => {
    const unsub = agora.onSystemMessage?.((text: string) => {
      setMessages(p => [...p, { id: Date.now().toString(), sender: 'system', text }]);
    });
    return unsub;
  }, [agora.onSystemMessage]);

  // Listen for remote chat messages
  useEffect(() => {
    const unsub = agora.onChatMessage?.((text: string) => {
      setMessages(p => [...p, { id: Date.now().toString(), sender: 'partner', text }]);
    });
    return unsub;
  }, [agora.onChatMessage]);

  // ── Helpers ───────────────────────────────────────────────────────────
  const send = () => {
    if (!input.trim()) return;
    signal();
    const text = input;
    setMessages(p => [...p, { id: Date.now().toString(), sender:'me', text }]);
    setInput('');
    agora.sendChatMessage?.(text);
  };

  const repeatRequest = () => {
    setRepeating(true); signal();
    setMessages(p => [...p, { id:Date.now().toString(), sender:'system', text:'🔄 Please repeat that!' }]);
    setTimeout(() => setRepeating(false), 2000);
  };

  const toggleTranslation = (id: string) =>
    setMessages(p => p.map(m => m.id===id ? {...m, showTranslation:!m.showTranslation} : m));

  const handleEndCall = async () => {
    await agora.leave();
    router.push('/find-partner');
  };

  // Navigate when partner ends the call
  useEffect(() => {
    const unsub = agora.onCallEnded?.(() => {
      router.push('/find-partner');
    });
    return unsub;
  }, [agora.onCallEnded, router]);

  // ── Active speaker glow ───────────────────────────────────────────────
  const activeSpeaker = isSpeaking ? 'me' : (agora.remoteUid ? 'partner' : 'me');
  const partnerGlow = activeSpeaker==='partner'
    ? 'ring-4 ring-green-400 shadow-[0_0_30px_rgba(74,222,128,0.35)]'
    : 'border border-gray-200 shadow-sm';
  const selfBorder = activeSpeaker==='me'
    ? 'border-2 border-green-400 shadow-[0_0_14px_rgba(74,222,128,0.4)]'
    : 'border-2 border-white/20';

  // ── Shared UI components ──────────────────────────────────────────────
  const VideoContainer = ({ divRef, isLocal, glow }: { divRef: React.RefObject<HTMLDivElement | null>; isLocal: boolean; glow: string }) => (
    <div className={`flex-1 rounded-2xl overflow-hidden relative bg-[#1a1a2e] transition-all duration-500 ${glow}`}>
      <div ref={divRef} className="w-full h-full" />
      {isLocal && agora.isVideoOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] text-gray-500">
          <User size={48} />
        </div>
      )}
      {!isLocal && !agora.remoteUid && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] text-gray-400 text-sm">
          Waiting for partner to join…
        </div>
      )}
      {!isLocal && agora.remoteUid && !agora.isRemoteVideoOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] text-gray-500">
          <User size={48} />
        </div>
      )}
    </div>
  );

  const ChatMessages = () => (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {messages.map(msg => (
        <div key={msg.id} className={`flex flex-col ${msg.sender==='system'?'items-center':msg.sender==='me'?'items-end':'items-start'}`}>
          {msg.sender==='system' && (
            <div className="bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-semibold px-4 py-1.5 rounded max-w-[90%] text-center">{msg.text}</div>
          )}
          {msg.sender!=='system' && (
            <div className={`flex flex-col ${msg.sender==='me'?'items-end':'items-start'} max-w-[85%]`}>
              <span className="text-xs font-bold text-gray-500 px-1 mb-1">{msg.sender==='me'?'You':safeName.split(' ')[0]}</span>
              <div className="relative group">
                <div className={`px-4 py-2.5 rounded-lg text-sm ${msg.sender==='me'?'bg-black text-white rounded-tr-none':'bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-sm'}`}>
                  {msg.text}
                  {msg.translatedText && msg.showTranslation && (
                    <div className={`mt-2 pt-2 border-t text-sm ${msg.sender==='me'?'border-white/20 text-white/80':'border-gray-200 text-gray-600'}`}>
                      <span className="text-[10px] uppercase font-bold opacity-60 block mb-1">Translation</span>
                      {msg.translatedText}
                    </div>
                  )}
                </div>
                {msg.translatedText && (
                  <button onClick={() => toggleTranslation(msg.id)}
                    className={`absolute top-2 ${msg.sender==='me'?'-left-8':'-right-8'} w-6 h-6 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <Languages size={12}/>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={chatEnd}/>
    </div>
  );

  const ChatInput = () => (
    <div className="p-4 border-t border-gray-100">
      <div className="relative flex items-center">
        <input type="text" value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Type a message…"
          className="w-full bg-white border border-gray-200 rounded-md pl-4 pr-12 py-2.5 focus:ring-1 focus:ring-black focus:border-black text-sm shadow-sm focus:outline-none"/>
        <button onClick={send} disabled={!input.trim()}
          className={`absolute right-1 w-8 h-8 rounded flex items-center justify-center transition-colors ${input.trim()?'bg-black text-white hover:bg-gray-800':'bg-transparent text-gray-300'}`}>
          <Send size={16}/>
        </button>
      </div>
    </div>
  );

  const ScaffoldTools = () => (
    <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={async ()=>{suggestionAttempted.current=false;setShowScaffold(true);setSuggestion(null);fetchTopicSuggestion();}}
          className="bg-white border border-gray-200 hover:border-black text-gray-700 py-3 rounded-xl text-xs font-medium shadow-sm flex items-center justify-center gap-2 transition-colors">
          <Lightbulb size={14}/> Suggest Topic
        </button>
        <button onClick={async ()=>{signal();setMessages(p=>[...p,{id:Date.now().toString(),sender:'system',text:'🎲 Loading Truth/Dare…'}]);try{const r=await aiApi.truthOrDare((partnerLanguage||'ENGLISH').toUpperCase());const text=r.text||'🎲 Truth: What is your most embarrassing language mistake?';setMessages(p=>p.map(m=>m.text==='🎲 Loading Truth/Dare…'?{...m,text}:m));agora.sendSystemMessage?.(text);}catch(err){console.error('Truth/Dare error:',err);setMessages(p=>p.map(m=>m.text==='🎲 Loading Truth/Dare…'?{...m,text:'🎲 Truth: What is your most embarrassing language mistake?'}:m));}}}
          className="bg-white border border-gray-200 hover:border-black text-gray-700 py-3 rounded-xl text-xs font-medium shadow-sm flex items-center justify-center gap-2 transition-colors">
          <Dices size={14}/> Truth/Dare
        </button>
      </div>
      <div className="bg-white border border-dashed border-gray-200 rounded-xl p-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <MessageSquare size={10}/> {safeName.split(' ')[0]}'s Topics
        </p>
        {safeTopics.map((t,i)=>(
          <div key={i} className="text-xs text-gray-600 flex items-center gap-1.5 mb-0.5">
            <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"/> {t}
          </div>
        ))}
      </div>
      {silence > 3 && (
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center justify-between">
          <p className="text-xs text-amber-700 font-medium">{silence<8?'🤫 Silence detected…':'💡 Try a topic!'}</p>
          <span className="text-xs font-bold text-amber-600">{silence}s</span>
        </div>
      )}
    </div>
  );

  // ── Loading screen ───────────────────────────────────────────────────────
  if (agora.loading && !agora.error) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#ff964f] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Initializing video call…</p>
        </div>
      </div>
    );
  }

  if (!layoutReady) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#ff964f] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Preparing…</p>
        </div>
      </div>
    );
  }

  // ── Error screen ─────────────────────────────────────────────────────────
  if (agora.error) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff size={28} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-500 mb-6">{agora.error}</p>
          <button onClick={() => router.push('/find-partner')}
            className="bg-black text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors">
            Find a New Partner
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ═══ MOBILE ═══ */}
      {isMobile && (
      <div className="flex flex-col bg-black relative overflow-hidden h-screen" style={{ height: '100dvh' }}>
        {/* Partner video */}
        <div className="relative flex-1 overflow-hidden">
          <div ref={agora.setupRemoteVideo} className="w-full h-full bg-[#1a1a2e]" />
          {!agora.remoteUid && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] text-gray-400 text-sm">
              Waiting for partner…
            </div>
          )}
          {agora.remoteUid && !agora.isRemoteVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] text-gray-500"><User size={48}/></div>
          )}

          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 border border-white/10">
            {safeFlag} {safeName}
            {activeSpeaker==='partner' && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>}
            {agora.isRemoteMuted && <MicOff size={12} className="text-red-400 ml-1"/>}
          </div>

          <div className="absolute top-4 right-4 z-10">
            <button onClick={handleAddFriend} disabled={friendSent}
              className={`bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all ${friendSent?'text-green-400 cursor-default':'text-white hover:bg-black/80'}`}>
              <UserPlus size={14}/> {friendSent?'Sent':'Add'}
            </button>
          </div>

          {/* Scaffold overlay */}
          <AnimatePresence>
            {showScaffold && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.4}}
                className="absolute inset-0 flex items-center justify-center z-20 p-4"
                style={{backdropFilter:'blur(3px)',background:'rgba(0,0,0,0.45)'}}>
                <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9,y:20}}
                  transition={{type:'spring',stiffness:350,damping:28}}
                  className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-full max-w-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb size={12} /> Topic Suggestion
                      </p>
                    </div>
                    <button onClick={()=>{setShowScaffold(false);signal();}}
                      className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
                      <X size={14}/>
                    </button>
                  </div>

                  {suggestionLoading ? (
                    <div className="text-center py-6">
                      <span className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin inline-block mb-2" />
                      <p className="text-xs text-gray-500">Generating suggestion…</p>
                    </div>
                  ) : suggestion ? (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-3">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Topic</p>
                        <p className="text-sm font-bold text-gray-900">{suggestion.title}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-4">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Conversation Starter</p>
                        <p className="text-sm font-semibold text-gray-800 leading-relaxed">{suggestion.example}</p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-4">
                      <p className="text-sm font-semibold text-gray-800">{safeTopics[topicIdx]}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={()=>{suggestionAttempted.current=false;setSuggestion(null);fetchTopicSuggestion();}}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium py-2 rounded-lg">
                      <RefreshCw size={13}/> Next Topic
                    </button>
                    <button onClick={()=>{setShowScaffold(false);signal();}}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-black text-white text-xs font-medium py-2 rounded-lg">
                      <Sparkles size={13}/> Got It!
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showPresence && (
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}
                className="absolute bottom-4 left-4 z-10">
                <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md text-white text-xs font-medium px-3 py-2 rounded-full border border-white/10">
                  <span className="flex gap-0.5 items-end h-3">
                    {[0,150,300].map(d=><span key={d} className="w-1 bg-white rounded-full animate-bounce" style={{height:d===150?'10px':'6px',animationDelay:`${d}ms`}}/>)}
                  </span>
                  {safeName.split(' ')[0]} is thinking…
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reaction bar */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
            <AnimatePresence>
              {showBar && (
                <motion.div initial={{opacity:0,scale:0.85,y:8}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.85,y:8}}
                  transition={{type:'spring',stiffness:400,damping:25}}
                  className="flex gap-2 bg-black/80 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 shadow-2xl mb-1">
                  {REACTIONS.map(e=><button key={e} onClick={()=>fireEmoji(e)} className="text-xl hover:scale-125 transition-transform select-none">{e}</button>)}
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={()=>setShowBar(v=>!v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold shadow-lg border transition-all ${showBar?'bg-white text-black border-white':'bg-black/70 backdrop-blur-md text-white border-white/20'}`}>
              <span className="text-base">😊</span>{showBar?'Close':'React'}
            </button>
          </div>

          <AnimatePresence>
            {remoteEmojis.map(fe=>(
              <motion.div key={fe.id} className="absolute pointer-events-none z-30 select-none flex items-center justify-center"
                style={{ left:`${fe.x}%`, top:`${fe.y}%` }}
                initial={{ scale:0, opacity:1, y:0 }}
                animate={{ scale:[0,1.35,1.1,1,1,0.8], opacity:[1,1,1,1,0.7,0], y:[0,-10,-25,-55,-100,-160] }}
                transition={{ duration:2.6, ease:'easeOut', times:[0,0.15,0.25,0.4,0.7,1] }}>
                <span style={{ fontSize:'5.5rem', lineHeight:1, filter:'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}>{fe.emoji}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Self video PiP */}
          <div className={`absolute bottom-4 left-4 z-10 w-24 h-32 rounded-xl overflow-hidden border-2 shadow-lg ${activeSpeaker==='me'?'border-green-400':'border-white/30'}`}>
            {!agora.isVideoOff
              ? <div ref={agora.setupLocalVideo} className="w-full h-full bg-[#1a1a2e]" />
              : <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500"><User size={28}/></div>
            }
            <AnimatePresence>
              {localEmojis.map(fe => (
                <motion.div key={fe.id} className="absolute pointer-events-none z-30 select-none flex items-center justify-center"
                  style={{ left:`${fe.x}%`, top:`${fe.y}%` }}
                  initial={{ scale:0, opacity:1, y:0 }}
                  animate={{ scale:[0,1.35,1.1,1,1,0.8], opacity:[1,1,1,1,0.7,0], y:[0,-10,-25,-55,-100,-160] }}
                  transition={{ duration:2.6, ease:'easeOut', times:[0,0.15,0.25,0.4,0.7,1] }}>
                  <span style={{ fontSize:'2.5rem', lineHeight:1, filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>{fe.emoji}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="absolute bottom-1 left-1 right-1 text-center">
              <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                You {agora.isMuted && '🔇'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile control bar */}
        <div className="bg-black/90 backdrop-blur-md border-t border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
          <button onClick={agora.toggleMute}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${agora.isMuted?'bg-red-500/20 text-red-400 border-red-500/30':'bg-white/10 text-white border-white/10'}`}>
            {agora.isMuted?<MicOff size={19}/>:<Mic size={19}/>}
          </button>
          <button onClick={agora.toggleVideo}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${agora.isVideoOff?'bg-red-500/20 text-red-400 border-red-500/30':'bg-white/10 text-white border-white/10'}`}>
            {agora.isVideoOff?<VideoOff size={19}/>:<VideoIcon size={19}/>}
          </button>
          <button onClick={()=>setMobilePanelOpen(mobilePanelOpen==='chat'?null:'chat')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${mobilePanelOpen==='chat'?'bg-blue-500 text-white border-blue-400':'bg-white/10 text-white border-white/10'}`}>
            <MessageSquare size={19}/>
          </button>
          <button onClick={()=>setMobilePanelOpen(mobilePanelOpen==='scaf'?null:'scaf')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${mobilePanelOpen==='scaf'?'bg-yellow-500 text-white border-yellow-400':'bg-white/10 text-white border-white/10'}`}>
            <Sparkles size={19}/>
          </button>
          <button onClick={handleEndCall}
            className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg">
            <PhoneOff size={19}/>
          </button>
        </div>

        {/* Mobile slide-up panel */}
        {mobilePanelOpen && (
          <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col bg-white rounded-t-3xl shadow-2xl" style={{ height: '62%' }}>
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                {mobilePanelOpen==='chat'?<><MessageSquare size={15} className="text-blue-500"/> Chat</>:<><Sparkles size={15} className="text-yellow-500"/> Anti-Anxiety Tools</>}
              </div>
              <button onClick={()=>setMobilePanelOpen(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <ChevronDown size={17}/>
              </button>
            </div>
            {mobilePanelOpen==='scaf' && <ScaffoldTools/>}
            <ChatMessages/>
            {mobilePanelOpen==='chat' && (
            <div className="p-4 border-t border-gray-100">
              <div className="relative flex items-center">
                <input type="text" value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&send()}
                  placeholder="Type a message…"
                  className="w-full bg-white border border-gray-200 rounded-md pl-4 pr-12 py-2.5 focus:ring-1 focus:ring-black focus:border-black text-sm shadow-sm focus:outline-none"/>
                <button onClick={send} disabled={!input.trim()}
                  className={`absolute right-1 w-8 h-8 rounded flex items-center justify-center transition-colors ${input.trim()?'bg-black text-white hover:bg-gray-800':'bg-transparent text-gray-300'}`}>
                  <Send size={16}/>
                </button>
              </div>
            </div>)}
          </div>
        )}
      </div>
      )}

      {/* ═══ DESKTOP ═══ */}
      {!isMobile && (
      <div className="flex flex-col lg:flex-row gap-6 animate-fadeIn h-full">
        <div className="flex-grow lg:w-[65%] flex flex-col gap-4 relative">
          <div className="flex-1 flex gap-4 relative min-h-[300px]">
            {/* Self (left) */}
            <div className={`flex-1 rounded-2xl overflow-hidden relative bg-[#1a1a2e] transition-all duration-300 ${selfBorder}`}>
              {!agora.isVideoOff
                ? <div ref={agora.setupLocalVideo} className="w-full h-full" />
                : <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e] text-gray-500"><User size={48}/></div>
              }
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 border border-white/10 z-10">
                You {agora.isMuted && <MicOff size={14} className="text-red-400"/>}
                {activeSpeaker==='me' && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>}
              </div>
              <AnimatePresence>
                {localEmojis.map(fe => (
                  <motion.div key={fe.id} className="absolute pointer-events-none z-30 select-none"
                    style={{ left:`${fe.x}%`, top:`${fe.y}%` }}
                    initial={{ scale:0, opacity:1, y:0 }}
                    animate={{ scale:[0,1.35,1.1,1,1,0.8], opacity:[1,1,1,1,0.7,0], y:[0,-10,-25,-55,-100,-160] }}
                    transition={{ duration:2.6, ease:'easeOut', times:[0,0.15,0.25,0.4,0.7,1] }}>
                    <span style={{ fontSize:'6rem', lineHeight:1, filter:'drop-shadow(0 4px 20px rgba(0,0,0,0.55))' }}>{fe.emoji}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Partner (right) */}
            <div className={`flex-1 rounded-2xl overflow-hidden relative bg-[#1a1a2e] transition-all duration-500 ${partnerGlow}`}>
              <div ref={agora.setupRemoteVideo} className={`w-full h-full ${agora.remoteUid && agora.isRemoteVideoOn ? '' : 'hidden'}`} />
              {!agora.remoteUid ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] text-gray-400 text-sm">Waiting for partner to join…</div>
              ) : agora.remoteUid && !agora.isRemoteVideoOn ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] text-gray-500"><User size={48} /></div>
              ) : null}

              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 border border-white/10">
                  {safeFlag} {safeName}
                  {activeSpeaker==='partner' && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>}
                  {agora.isRemoteMuted && <MicOff size={12} className="text-red-400 ml-1"/>}
                </div>
                <button onClick={handleAddFriend} disabled={friendSent}
                  className={`bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all ${friendSent?'text-green-400 cursor-default':'text-white hover:bg-black/80'}`}>
                  <UserPlus size={14}/><span className="hidden xl:inline">{friendSent?'Sent':'Add Friend'}</span>
                </button>
              </div>

              <AnimatePresence>
                {remoteEmojis.map(fe => (
                  <motion.div key={fe.id} className="absolute pointer-events-none z-30 select-none"
                    style={{ left:`${fe.x}%`, top:`${fe.y}%` }}
                    initial={{ scale:0, opacity:1, y:0 }}
                    animate={{ scale:[0,1.35,1.1,1,1,0.8], opacity:[1,1,1,1,0.7,0], y:[0,-10,-25,-55,-100,-160] }}
                    transition={{ duration:2.6, ease:'easeOut', times:[0,0.15,0.25,0.4,0.7,1] }}>
                    <span style={{ fontSize:'6rem', lineHeight:1, filter:'drop-shadow(0 4px 20px rgba(0,0,0,0.55))' }}>{fe.emoji}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {showPresence && (
                  <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}
                    className="absolute bottom-4 left-4 z-10">
                    <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md text-white text-xs font-medium px-3 py-2 rounded-full border border-white/10">
                      <span className="flex gap-0.5 items-end h-3">
                        {[0,150,300].map(d=><span key={d} className="w-1 bg-white rounded-full animate-bounce" style={{height:d===150?'10px':'6px',animationDelay:`${d}ms`}}/>)}
                      </span>
                      {safeName.split(' ')[0]} is thinking…
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showScaffold && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.4}}
                    className="absolute inset-0 flex items-center justify-center z-20 p-2 sm:p-6"
                    style={{backdropFilter:'blur(3px)',background:'rgba(0,0,0,0.4)'}}>
                    <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9,y:20}}
                      transition={{type:'spring',stiffness:350,damping:28}}
                      className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 sm:p-6 w-full max-w-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Lightbulb size={12} /> Topic Suggestion
                          </p>
                        </div>
                        <button onClick={()=>{setShowScaffold(false);signal();}}
                          className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
                          <X size={14}/>
                        </button>
                      </div>

                      {suggestionLoading ? (
                        <div className="text-center py-6">
                          <span className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin inline-block mb-2" />
                          <p className="text-xs text-gray-500">Generating suggestion…</p>
                        </div>
                      ) : suggestion ? (
                        <>
                          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mb-3">
                            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Topic</p>
                            <p className="text-sm font-bold text-gray-900">{suggestion.title}</p>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mb-4">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Conversation Starter</p>
                            <p className="text-sm font-semibold text-gray-800 leading-relaxed">{suggestion.example}</p>
                          </div>
                        </>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 mb-4">
                          <p className="text-sm font-semibold text-gray-800">{safeTopics[topicIdx]}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button onClick={()=>{suggestionAttempted.current=false;setSuggestion(null);fetchTopicSuggestion();}}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-medium py-2 sm:py-2.5 rounded-lg transition-colors">
                          <RefreshCw size={14}/> Next Topic
                        </button>
                        <button onClick={()=>{setShowScaffold(false);signal();}}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-medium py-2 sm:py-2.5 rounded-lg transition-colors">
                          <Sparkles size={14}/> Got It!
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Control bar */}
          <div className="h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center gap-3 px-6">
            <button onClick={agora.toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${agora.isMuted?'bg-red-100 text-red-500':'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              {agora.isMuted?<MicOff size={22}/>:<Mic size={22}/>}
            </button>
            <button onClick={agora.toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${agora.isVideoOff?'bg-red-100 text-red-500':'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              {agora.isVideoOff?<VideoOff size={22}/>:<VideoIcon size={22}/>}
            </button>
            <div className="w-px h-8 bg-gray-200 mx-1"/>
            <div className="relative">
              <AnimatePresence>
                {showBar && (
                  <motion.div initial={{ opacity: 0, scale: 0.85, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/80 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 shadow-2xl whitespace-nowrap">
                    {REACTIONS.map(e => <button key={e} onClick={() => fireEmoji(e)} className="text-xl hover:scale-125 transition-transform active:scale-105 select-none">{e}</button>)}
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => setShowBar(v => !v)}
                className={`px-4 h-10 rounded-full text-xs font-semibold shadow-sm border transition-all flex items-center gap-1.5 ${showBar ? 'bg-gray-800 text-white border-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'}`}>
                <span className="text-base">😊</span> React
              </button>
            </div>
            <button onClick={handleEndCall}
              className="px-5 h-10 rounded-md bg-black hover:bg-gray-800 text-white font-medium flex items-center gap-2 transition-all shadow-sm text-sm">
              <PhoneOff size={16}/> End Call
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-[35%] w-full bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <Sparkles size={16} className="text-gray-500"/> Anti-Anxiety Tools
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={async ()=>{suggestionAttempted.current=false;setShowScaffold(true);setSuggestion(null);fetchTopicSuggestion();}}
                className="bg-white border border-gray-200 hover:border-black text-gray-700 py-2.5 rounded-md text-xs font-medium shadow-sm flex items-center justify-center gap-2 transition-colors">
                <Lightbulb size={14}/> Suggest Topic
              </button>
              <button onClick={async ()=>{signal();setMessages(p=>[...p,{id:Date.now().toString(),sender:'system',text:'🎲 Loading Truth/Dare…'}]);try{const r=await aiApi.truthOrDare((partnerLanguage||'ENGLISH').toUpperCase());const text=r.text||'🎲 Truth: What is your most embarrassing language mistake?';setMessages(p=>p.map(m=>m.text==='🎲 Loading Truth/Dare…'?{...m,text}:m));agora.sendSystemMessage?.(text);}catch(err){console.error('Truth/Dare error:',err);setMessages(p=>p.map(m=>m.text==='🎲 Loading Truth/Dare…'?{...m,text:'🎲 Truth: What is your most embarrassing language mistake?'}:m));}}}
                className="bg-white border border-gray-200 hover:border-black text-gray-700 py-2.5 rounded-md text-xs font-medium shadow-sm flex items-center justify-center gap-2 transition-colors">
                <Dices size={14}/> Truth/Dare
              </button>
            </div>
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <MessageSquare size={10}/> {safeName.split(' ')[0]}'s Topics
              </p>
              {safeTopics.map((t,i)=>(
                <div key={i} className="text-xs text-gray-600 flex items-center gap-1.5 mb-0.5">
                  <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"/> {t}
                </div>
              ))}
            </div>
            {silence > 3 && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center justify-between overflow-hidden">
                <p className="text-xs text-amber-700 font-medium">{silence<8?'🤫 Silence detected…':'💡 Try a topic!'}</p>
                <span className="text-xs font-bold text-amber-600">{silence}s</span>
              </motion.div>
            )}
          </div>
          <ChatMessages/>
          <div className="p-4 border-t border-gray-100 shrink-0">
            <div className="relative flex items-center">
              <input type="text" value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&send()}
                placeholder="Type a message…"
                className="w-full bg-white border border-gray-200 rounded-md pl-4 pr-12 py-2.5 focus:ring-1 focus:ring-black focus:border-black text-sm shadow-sm focus:outline-none"/>
              <button onClick={send} disabled={!input.trim()}
                className={`absolute right-1 w-8 h-8 rounded flex items-center justify-center transition-colors ${input.trim()?'bg-black text-white hover:bg-gray-800':'bg-transparent text-gray-300'}`}>
                <Send size={16}/>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
