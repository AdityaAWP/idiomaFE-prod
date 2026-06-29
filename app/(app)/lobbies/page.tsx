'use client';

import { useState, useEffect } from 'react';
import { Search, Globe, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { lobbies as lobbiesApi, LobbyData } from '@/lib/api';

export default function LobbiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState('');

  useEffect(() => {
    lobbiesApi.list(languageFilter || undefined)
      .then(setLobbies)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [languageFilter]);

  const filtered = lobbies.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-fadeInUp">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2 tracking-tight">
            <Globe className="text-gray-500" size={32} />
            Public Lobbies
          </h1>
          <p className="text-gray-500">Join a group conversation and practice together.</p>
        </div>
        <Link href="/lobbies/create"
          className="bg-[var(--accent)] hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2 hover:scale-105">
          <Plus size={18} /> Create Lobby
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 mb-8 flex flex-col md:flex-row gap-4 animate-fadeInUp delay-100">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search lobbies..." className="w-full bg-gray-50 border border-gray-200 rounded-md pl-12 pr-4 py-2.5 focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-md px-4 py-2.5 text-gray-700 font-medium cursor-pointer focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] appearance-none min-w-[140px]">
          <option value="">Any Language</option>
          <option value="ENGLISH">English</option>
          <option value="SPANISH">Spanish</option>
          <option value="JAPANESE">Japanese</option>
          <option value="KOREAN">Korean</option>
          <option value="FRENCH">French</option>
          <option value="MANDARIN">Mandarin</option>
          <option value="ARABIC">Arabic</option>
          <option value="RUSSIAN">Russian</option>
        </select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Globe size={48} className="mx-auto mb-4 opacity-50" />
          <p>No lobbies found. Create one!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp delay-200">
        {filtered.map((lobby) => {
          const memberCount = lobby._count?.members ?? lobby.members?.length ?? 0;
          return (
            <div key={lobby.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all flex flex-col group">
              <div className="h-36 bg-[var(--accent)] group-hover:scale-105 transition-transform" />
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-1 line-clamp-1">{lobby.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-1 mb-4">{lobby.description ?? 'No description'}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-5 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                      {lobby.owner?.username?.charAt(0) ?? '?'}
                    </div>
                    <span>{lobby.owner?.username ?? 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-900 font-semibold">
                    <Users size={16} />
                    <span>{memberCount}</span>
                  </div>
                </div>
                <Link href={`/lobbies/${lobby.id}`}
                  className="mt-auto w-full py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:border-[var(--accent)] hover:text-[var(--accent)] shadow-sm transition-all">
                  Join Lobby
                </Link>
              <button onClick={async (e) => {
                e.preventDefault();
                if (!confirm('Delete this lobby?')) return;
                try { await lobbiesApi.delete(lobby.id); setLobbies(prev => prev.filter(l => l.id !== lobby.id)); } catch {}
              }}
                className="mt-2 w-full py-2 rounded-md font-medium text-xs flex items-center justify-center gap-1 bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-colors">
                Delete
              </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
