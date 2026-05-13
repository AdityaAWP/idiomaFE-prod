'use client';

import { useState } from 'react';
import { Search, Globe, Users, Plus, Filter } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const MOCK_LOBBIES = [
  {
    id: '1',
    title: 'Beginner Spanish Practice 🇪🇸',
    topic: 'Daily routines & Vocabulary',
    host: 'Maria G.',
    language: 'Spanish',
    level: 'Beginner',
    capacity: 4,
    maxCapacity: 5,
    matchColor: 'from-[#FF6B9D] to-[#FF8FB5]'
  },
  {
    id: '2',
    title: 'Advanced English Debate 🇬🇧',
    topic: 'Technology vs Privacy',
    host: 'Alex W.',
    language: 'English',
    level: 'Advanced',
    capacity: 5, // Full
    maxCapacity: 5,
    matchColor: 'from-[#3DB8F5] to-[#62CAFF]'
  },
  {
    id: '3',
    title: 'Kyoto Travel Recommendations 🇯🇵',
    topic: 'Casual Conversation',
    host: 'Kenji M.',
    language: 'Japanese',
    level: 'Intermediate',
    capacity: 2,
    maxCapacity: 5,
    matchColor: 'from-[#7A54FF] to-[#9B7AFF]'
  },
  {
    id: '4',
    title: 'K-Pop & Culture Chat 🇰🇷',
    topic: 'Music & Trending Dramas',
    host: 'Ji-Eun',
    language: 'Korean',
    level: 'Beginner',
    capacity: 3,
    maxCapacity: 5,
    matchColor: 'from-[#2DD4A8] to-[#5AEDCA]'
  },
];

export default function LobbiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequesting, setIsRequesting] = useState<string | null>(null);

  const handleJoin = (lobbyId: string) => {
    setIsRequesting(lobbyId);
    // Simulate join request transition
    setTimeout(() => {
      window.location.href = `/lobbies/${lobbyId}`;
    }, 1200);
  };

  return (
    <>
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-fadeInUp">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2 tracking-tight">
            <Globe className="text-gray-500" size={32} />
            Public Lobbies
          </h1>
          <p className="text-gray-500">Join a 5-person group conversation and practice together.</p>
        </div>
        
        <Link href="/lobbies/create" className="bg-gradient-to-r from-[#c99614] to-[#c99614] hover:from-[#a87a10] hover:to-[#a87a10] text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-[#c99614]/20 transition-all flex items-center justify-center gap-2 hover:scale-105">
          <Plus size={18} /> Create Lobby
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 mb-8 flex flex-col md:flex-row gap-4 animate-fadeInUp delay-100">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search topics, languages, or users..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-md pl-12 pr-4 py-2.5 focus:ring-1 focus:ring-[#c99614] focus:border-[#c99614] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-gray-50 border border-gray-200 rounded-md px-4 py-2.5 text-gray-700 font-medium cursor-pointer focus:ring-1 focus:ring-[#c99614] focus:border-[#c99614] appearance-none min-w-[140px]">
            <option value="">Any Language</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
          </select>
          <button className="w-12 h-[42px] bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center text-gray-500 hover:text-[#c99614] hover:border-[#c99614] transition-colors shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Lobby Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp delay-200">
        {MOCK_LOBBIES.map((lobby) => (
          <div key={lobby.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 flex flex-col group">
            
            {/* Lobby Banner */}
            <div className={`h-16 bg-gray-50 border-b border-gray-100 relative px-6 py-4 flex items-end justify-between transition-colors group-hover:bg-gray-100`}>
              <div className="absolute top-4 right-4 bg-white border border-gray-200 text-gray-700 text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded shadow-sm">
                {lobby.level}
              </div>
            </div>
            
            <div className="p-6 flex-grow flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-1 line-clamp-1">{lobby.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-1">{lobby.topic}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-6 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                    {lobby.host.charAt(0)}
                  </div>
                  <span>Host: {lobby.host}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${lobby.capacity === lobby.maxCapacity ? 'text-red-500 font-bold' : 'text-gray-900 font-semibold'}`}>
                  <Users size={16} />
                  <span>{lobby.capacity}/{lobby.maxCapacity}</span>
                </div>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={() => handleJoin(lobby.id)}
                  disabled={lobby.capacity === lobby.maxCapacity || isRequesting === lobby.id}
                  className={`w-full py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    isRequesting === lobby.id 
                      ? 'bg-[#FBF4E0] text-[#c99614] border border-transparent'
                      : lobby.capacity === lobby.maxCapacity
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#c99614] hover:text-[#c99614] shadow-sm'
                  }`}
                >
                  {isRequesting === lobby.id ? (
                    <><span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span> Requesting...</>
                  ) : lobby.capacity === lobby.maxCapacity ? (
                    'Lobby Full'
                  ) : (
                    'Join Lobby'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
