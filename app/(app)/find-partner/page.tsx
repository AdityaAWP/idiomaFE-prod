'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import {
  Search, MapPin, Video, X, Plus, MessageSquare,
  Sparkles, Globe, BarChart2, ChevronRight, Check
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { usePartner } from '../../context/PartnerContext';
import { match as matchApi, users as usersApi, getFullImageUrl } from '@/lib/api';
import { useMatchWebSocket, MatchFoundPayload } from '@/hooks/useMatchWebSocket';

type MatchState = 'idle' | 'searching' | 'found';
type SetupStep = 'language-level' | 'topics';

const LANGUAGES = [
  { code: 'ENGLISH',   flag: '🇬🇧', label: 'English' },
  { code: 'JAPANESE',  flag: '🇯🇵', label: 'Japanese' },
  { code: 'SPANISH',   flag: '🇪🇸', label: 'Spanish' },
  { code: 'KOREAN',    flag: '🇰🇷', label: 'Korean' },
  { code: 'FRENCH',    flag: '🇫🇷', label: 'French' },
  { code: 'MANDARIN',  flag: '🇨🇳', label: 'Mandarin' },
  { code: 'RUSSIAN',   flag: '🇷🇺', label: 'Russian' },
  { code: 'ARABIC',    flag: '🇸🇦', label: 'Arabic' },
];

const LEVELS = [
  { code: 'BEGINNER',     label: 'Beginner',     desc: 'Just starting out' },
  { code: 'INTERMEDIATE', label: 'Intermediate', desc: 'Can hold basic conversations' },
  { code: 'ADVANCED',     label: 'Advanced',     desc: 'Near-fluent speaker' },
];

const QUICK_IDEAS = [
  'Local food', 'Recent movies', 'Travel stories',
  'Language tips', 'Business English', 'Current events',
  'Favourite music', 'Weekend plans',
];

function FindPartnerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partner = usePartner();
  const { user } = useAuth();
  const ws = useMatchWebSocket();

  const fromGoal = searchParams.get('from') === 'goal';

  const [matchState, setMatchState] = useState<MatchState>('idle');
  const [setupStep, setSetupStep] = useState<SetupStep>(
    fromGoal && partner.language ? 'topics' : 'language-level'
  );
  const [topics, setTopics] = useState<string[]>(partner.myTopics ?? []);
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { partner.setMyTopics(topics); }, [topics]);  // eslint-disable-line

  useEffect(() => {
    if (fromGoal && partner.language) setSetupStep('topics');
  }, [partner.language, fromGoal]);  // eslint-disable-line

  // Handle match found from WebSocket
  useEffect(() => {
    if (ws.matchFound) {
      handleMatchFound(ws.matchFound);
    }
  }, [ws.matchFound]); // eslint-disable-line

  // Redirect to onboarding if no language set
  useEffect(() => {
    if (user && !user.targetLanguage && !fromGoal) {
      router.replace('/onboarding');
    }
  }, [user, fromGoal, router]);

  // Sync partner language/level from user profile on first load
  useEffect(() => {
    if (user?.targetLanguage && !fromGoal) {
      partner.setLanguage(user.targetLanguage);
    }
    if (user?.proficiency && !fromGoal) {
      partner.setLevel(user.proficiency.toUpperCase());
    }
  }, []); // eslint-disable-line

  const handleMatchFound = useCallback(async (payload: MatchFoundPayload) => {
    // Determine which user we are (user1 or user2)
    const isUser1 = payload.user1Id === user?.id;
    const partnerUserId = isUser1 ? payload.user2Id : payload.user1Id;

    // Fetch partner's profile for name and avatar
    let partnerName = 'Partner';
    let partnerAvatar: string | null = null;
    try {
      const profile = await usersApi.findById(partnerUserId);
      partnerName = profile.username;
      partnerAvatar = profile.avatarUrl;
    } catch { /* use defaults */ }

    partner.setPartnerInfo(
      partnerUserId,
      payload.partnerTopics,
      partnerName,
      '🌍',
      'Native Speaker',
      partnerAvatar,
    );
    partner.setMyTopics(payload.myTopics);

    // Store channel name and tokens for the room
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_room', JSON.stringify({
        channelName: payload.channelName,
        token: payload.token,
      }));
    }

    setMatchState('found');
  }, [user?.id, partner]);

  const addTopic = (topic: string) => {
    const trimmed = topic.trim();
    if (trimmed && topics.length < 5 && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
      setCurrentInput('');
    }
  };

  const removeTopic = (i: number) => setTopics(topics.filter((_, idx) => idx !== i));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addTopic(currentInput); }
  };

  const handleStartSearching = async () => {
    if (topics.length < 1) return;
    setError('');
    setMatchState('searching');
    const level = `${partner.language.toLowerCase()}.${partner.level.toLowerCase()}`;
    const connected = await ws.connect(level);
    if (!connected) {
      setError('Failed to connect to matchmaking');
      setMatchState('idle');
      return;
    }
    // Allow time for the notification server to register our WebSocket
    await new Promise((r) => setTimeout(r, 600));
    try {
      await matchApi.join({
        level,
        topics,
      });
    } catch (err: any) {
      setError(err.message ?? 'Failed to join matchmaking queue');
      ws.disconnect();
      setMatchState('idle');
    }
  };

  const handleSkip = async () => {
    const level = `${partner.language.toLowerCase()}.${partner.level.toLowerCase()}`;
    // Decline current match and restart search
    try {
      await matchApi.cancel({ level });
    } catch { /* ignore */ }
    setMatchState('searching');
    // Re-join queue (WS is still connected)
    await new Promise((r) => setTimeout(r, 600));
    try {
      await matchApi.join({ level, topics });
    } catch (err: any) {
      setError(err.message ?? 'Failed to re-join queue');
      setMatchState('idle');
      setSetupStep('topics');
    }
  };

  const handleCancelSearch = async () => {
    const level = `${partner.language.toLowerCase()}.${partner.level.toLowerCase()}`;
    try {
      await matchApi.cancel({ level });
    } catch { /* ignore */ }
    ws.disconnect();
    setMatchState('idle');
    setSetupStep('topics');
  };

  const handleJoinCall = () => {
    router.push('/room');
  };

  const canSearch = topics.length >= 1;

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] items-center">
      <div className="page-header animate-fadeInUp shrink-0 w-full max-w-2xl text-center">
        <h1>Find a Partner</h1>
        <p>Match with a native speaker for a 1-on-1 video conversation</p>
      </div>

      <div className="flex-1 flex items-start justify-center pb-16 w-full">
        <div className="w-full max-w-2xl animate-fadeInUp delay-100">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[520px] flex flex-col w-full">

            {/* ── STATE 1: IDLE ── */}
            {matchState === 'idle' && (
              <div className="p-8 flex-1 flex flex-col animate-fadeIn">

                {/* ── STEP A: Language & Level ── */}
                {setupStep === 'language-level' && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">Select Language & Level</h2>
                        <p className="text-sm text-gray-500">Choose what you&rsquo;re practising and your current ability.</p>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Globe size={12} /> Practising Language
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                      {LANGUAGES.map(lang => {
                        const active = partner.language === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => partner.setLanguage(lang.code)}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                              active
                                ? 'bg-[var(--accent)] text-white border-transparent shadow-md'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-[var(--accent)] hover:text-[var(--accent)]'
                            }`}
                          >
                            <span className="text-xl">{lang.flag}</span>
                            {lang.label}
                            {active && <Check size={14} className="ml-auto" />}
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <BarChart2 size={12} /> Proficiency Level
                    </p>
                    <div className="flex flex-col gap-2 mb-8">
                      {LEVELS.map(lv => {
                        const active = partner.level === lv.code;
                        return (
                          <button
                            key={lv.code}
                            onClick={() => partner.setLevel(lv.code)}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all ${
                              active
                                ? 'bg-[var(--accent)] text-white border-transparent shadow-md'
                                : 'bg-white border-gray-200 hover:border-[var(--accent)]'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? 'border-white' : 'border-gray-400'}`}>
                              {active && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-800'}`}>{lv.label}</p>
                              <p className={`text-xs mt-0.5 ${active ? 'text-white/70' : 'text-gray-400'}`}>{lv.desc}</p>
                            </div>
                            {active && <Check size={16} className="ml-auto text-white" />}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setSetupStep('topics')}
                      className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 bg-[var(--accent)] hover:opacity-90 text-white shadow-md transition-all"
                    >
                      Next — Add Topics <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* STEP B: Topics */}
                {setupStep === 'topics' && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      {!fromGoal && (
                        <button onClick={() => setSetupStep('language-level')} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                        </button>
                      )}
                      <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">Add Conversation Topics</h2>
                        <p className="text-sm text-gray-500">Add at least <strong>1 prompt</strong> to start searching.</p>
                      </div>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                          <Globe size={11} /> {partner.language}
                        </span>
                        {fromGoal ? (
                          <button onClick={() => router.push('/dashboard')} className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors">
                            Change language
                          </button>
                        ) : (
                          <button onClick={() => setSetupStep('language-level')} className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors">
                            Change language
                          </button>
                        )}
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BarChart2 size={11} /> Your Proficiency Level
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {LEVELS.map(lv => {
                          const active = partner.level === lv.code;
                          return (
                            <button
                              key={lv.code}
                              onClick={() => partner.setLevel(lv.code)}
                              className={`flex-1 min-w-[90px] flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all ${
                                active ? 'bg-[var(--accent)] text-white border-transparent shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:border-[var(--accent)] hover:text-[var(--accent)]'
                              }`}
                            >
                              <span className={`text-sm font-bold leading-tight ${active ? 'text-white' : 'text-gray-800'}`}>{lv.label}</span>
                              <span className={`text-[11px] mt-0.5 ${active ? 'text-white/75' : 'text-gray-400'}`}>{lv.desc}</span>
                              {active && <Check size={12} className="mt-1 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 min-h-[120px]">
                      {topics.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center border-[1.5px] border-dashed border-gray-200 rounded-xl p-8 text-sm text-gray-500 italic bg-white">
                          <MessageSquare size={24} className="mb-3 text-gray-300" />
                          No topics added yet. Type below to add.
                        </div>
                      )}
                      {topics.map((topic, idx) => (
                        <div key={idx} className="relative group bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:border-black hover:shadow-md transition-all flex flex-col animate-fadeIn">
                          <div className="flex justify-between w-full items-start">
                            <div className="bg-gray-100 p-1.5 rounded-lg text-gray-500 group-hover:bg-black group-hover:text-white transition-colors">
                              <MessageSquare size={14} />
                            </div>
                            <button onClick={() => removeTopic(idx)} className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1 -mt-1">
                              <X size={16} />
                            </button>
                          </div>
                          <span className="font-semibold text-gray-800 text-sm mt-3 line-clamp-2 leading-tight break-words">{topic}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <div className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400">
                          <MessageSquare size={18} />
                        </div>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-lg pl-11 pr-4 py-3 focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all text-sm text-gray-900 focus:outline-none shadow-sm"
                          placeholder="e.g. Traditional foods, movies, hobbies..."
                          value={currentInput}
                          onChange={e => setCurrentInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={topics.length >= 5}
                        />
                      </div>
                      <button
                        onClick={() => addTopic(currentInput)}
                        disabled={topics.length >= 5 || !currentInput.trim()}
                        className={`px-5 rounded-lg text-sm font-medium transition-colors border shadow-sm ${topics.length >= 5 || !currentInput.trim() ? 'border-gray-200 text-gray-400 bg-white cursor-not-allowed' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[13px] px-1 mb-5">
                      <span className={topics.length < 1 ? 'text-orange-500 font-medium' : 'text-gray-400'}>
                        {topics.length < 1 ? 'Add 1 more to continue' : topics.length >= 5 ? 'Maximum reached' : 'Press Enter to add'}
                      </span>
                      <span className="text-gray-400">{topics.length} / 5</span>
                    </div>

                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((topics.length / 5) * 100, 100)}%`, background: topics.length >= 1 ? '#10b981' : '#f59e0b' }} />
                    </div>

                    <div className="mb-8">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                        <Sparkles size={14} className="text-orange-400" /> Quick Ideas
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_IDEAS.map(idea => {
                          const isAdded = topics.includes(idea) || topics.length >= 5;
                          return (
                            <button key={idea} onClick={() => addTopic(idea)} disabled={isAdded}
                              className={`text-sm px-4 py-2 rounded-full transition-colors shadow-sm border flex items-center gap-1.5 ${isAdded ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                              <Plus size={14} /> {idea}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                    )}

                    <div className="mt-auto">
                      <button
                        onClick={handleStartSearching}
                        disabled={!canSearch}
                        className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${canSearch ? 'bg-[var(--accent)] hover:opacity-90 text-white shadow-md' : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'}`}
                      >
                        <Search size={18} />
                        Find Partner
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── STATE 2: SEARCHING ── */}
            {matchState === 'searching' && (
              <div className="p-8 flex-1 flex flex-col items-center justify-center animate-fadeIn text-center">
                <div className="relative w-40 h-40 flex items-center justify-center mb-10">
                  <div className="absolute inset-0 rounded-full border border-gray-300 opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                  <div className="absolute inset-4 rounded-full border border-gray-400 opacity-30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '400ms' }}></div>
                  <div className="absolute inset-8 rounded-full border border-gray-500 opacity-40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '800ms' }}></div>
                  <div className="relative z-10 w-16 h-16 rounded-lg bg-[var(--accent)] shadow-lg flex items-center justify-center text-white">
                    <MapPin size={28} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">Searching the globe...</h2>
                <p className="text-gray-500 mb-4">
                  Looking for a native speaker matching your criteria.
                </p>
                <p className="text-xs text-gray-400 mb-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                  Level: {partner.level} · {topics.length} topic cards
                </p>
                <p className="text-xs text-gray-400 mb-12">
                  WS: {ws.status}
                </p>
                <button
                  onClick={handleCancelSearch}
                  className="text-gray-500 hover:text-black font-medium px-6 py-2.5 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2 border border-transparent hover:border-gray-200"
                >
                  <X size={18} /> Cancel Search
                </button>
              </div>
            )}

            {/* ── STATE 3: FOUND ── */}
            {matchState === 'found' && (
              <div className="flex-1 flex flex-col justify-center animate-fadeIn">
                <div className="absolute top-0 left-0 w-full h-32 bg-[var(--accent)]"></div>
                <div className="px-8 pb-8 pt-16 relative z-10 text-center flex-1 flex flex-col">
                  <div className="w-24 h-24 mx-auto bg-white p-1 rounded-full shadow-md mb-4 border border-gray-200">
                    <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                      {partner.partnerAvatar ? (
                        <img src={getFullImageUrl(partner.partnerAvatar)!} alt={partner.partnerName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">{partner.partnerName?.charAt(0)?.toUpperCase() ?? '?'}</span>
                      )}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 bg-[var(--accent)] text-white px-3 py-1 rounded font-medium text-xs mx-auto mb-3 tracking-wide shadow-sm">
                    <Sparkles size={12} /> Match Found
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900">{partner.partnerName}</h2>
                  <p className="text-gray-500 text-sm mb-6 flex justify-center items-center gap-2">
                    <span>{partner.partnerFlag} {partner.partnerNative}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>Learning {partner.language}</span>
                  </p>

                  <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left border border-gray-200">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Their Topic Cards</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {partner.partnerTopics.length > 0 ? partner.partnerTopics.map((topic, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm flex items-center gap-2">
                          <MessageSquare size={14} className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-800 text-sm font-medium truncate">{topic}</span>
                        </div>
                      )) : (
                        <p className="text-gray-400 text-sm col-span-full">No topics shared</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex gap-4">
                    <button onClick={handleSkip} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium py-3 rounded-md transition-colors shadow-sm">
                      Skip
                    </button>
                    <button onClick={handleJoinCall} className="flex-[2] bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-md shadow-sm transition-all flex items-center justify-center gap-2">
                      <Video size={20} /> Join Video Call
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function FindPartnerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FindPartnerContent />
    </Suspense>
  );
}
