'use client';

import {
  Globe,
  Plus,
  MessageSquare,
  Video,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import LearningGoalSelector from '../../components/LearningGoalSelector';
import { useLanguage } from '../../context/LanguageContext';

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-[1400px] mx-auto w-full animate-fadeIn bg-[var(--paper)] min-h-screen p-4 md:p-8 transition-colors font-sans">
      
      {/* Motivational Banner */}
      <div className="bg-[var(--ink)] border border-[var(--ink-2)] rounded-2xl p-8 mb-8 text-[var(--paper)] relative overflow-hidden"
        style={{ background: 'radial-gradient(120% 80% at 50% 110%, color-mix(in oklab, var(--accent) 35%, transparent), transparent 60%), var(--ink)' }}>
        <div className="relative z-10 max-w-2xl">
          <div className="mono text-[var(--accent-2)] mb-2 uppercase text-xs tracking-widest">{t('dashboard.bannerSubtitle')}</div>
          <h2 className="text-3xl font-black tracking-tight mb-2 text-[var(--paper)]">{t('dashboard.bannerTitle')}</h2>
        </div>
      </div>

      <LearningGoalSelector />

      {/* Primary Video Call Match Button */}
      <div className="mb-8">
        <Link href="/find-partner" className="group relative block w-full overflow-hidden rounded-2xl bg-[var(--accent)] text-white p-8 transition-all hover:-translate-y-1">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
            <Video size={140} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-md border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--paper)] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--paper)]"></span>
              </span>
              {t('dashboard.videoActive')}
            </div>
            <h2 className="mb-2 text-3xl font-black tracking-tight">{t('dashboard.startMatch')}</h2>
            <p className="max-w-md text-white/90 text-lg mb-6 leading-relaxed">
              {t('dashboard.startMatchDesc')}
            </p>
            <div className="inline-flex items-center gap-3 rounded-full bg-[var(--paper)] text-[var(--accent)] px-6 py-3 font-bold transition-transform group-hover:translate-x-2">
              <Video size={20} />
              {t('dashboard.findPartner')}
              <ArrowRight size={18} />
            </div>
          </div>
        </Link>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Actions */}
        <div className="w-full">
          <h2 className="mono text-[var(--mute)] mb-4 border-b border-[var(--line)] pb-2">{t('dashboard.moreOptions')}</h2>
          
          <div className="flex flex-col gap-3">
            <Link href="/lobbies" className="group bg-[var(--paper)] border border-[var(--line)] rounded-xl p-5 flex items-center justify-between hover:border-[var(--accent)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[var(--paper-2)] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--ink)] text-sm">{t('dashboard.browseLobbies')}</h3>
                  <p className="text-[var(--mute)] text-xs mt-0.5">{t('dashboard.browseLobbiesDesc')}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-[var(--line)] group-hover:text-[var(--accent)] transition-colors" />
            </Link>

            <Link href="/lobbies/create" className="group bg-[var(--paper)] border border-[var(--line)] rounded-xl p-5 flex items-center justify-between hover:border-[var(--accent)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[var(--paper-2)] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--ink)] text-sm">{t('dashboard.createLobby')}</h3>
                  <p className="text-[var(--mute)] text-xs mt-0.5">{t('dashboard.createLobbyDesc')}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-[var(--line)] group-hover:text-[var(--accent)] transition-colors" />
            </Link>

            <Link href="/friends" className="group bg-[var(--paper)] border border-[var(--line)] rounded-xl p-5 flex items-center justify-between hover:border-[var(--accent)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[var(--paper-2)] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--ink)] text-sm">{t('dashboard.messages')}</h3>
                  <p className="text-[var(--mute)] text-xs mt-0.5">{t('dashboard.messagesDesc')}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-[var(--line)] group-hover:text-[var(--accent)] transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
