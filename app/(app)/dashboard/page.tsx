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
    <div className="max-w-[1400px] mx-auto w-full animate-fadeIn bg-[#FFFBF7] dark:bg-[#0a0a0a] min-h-screen p-4 md:p-8 rounded-3xl transition-colors">
      
      {/* Motivational Banner */}
      <div className="bg-gradient-to-r from-[#c99614] to-[#d4a827] rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black mb-2 tracking-tight">{t('dashboard.bannerTitle')}</h2>
          <p className="text-white/90 text-lg">{t('dashboard.bannerSubtitle')}</p>
        </div>
      </div>

      <LearningGoalSelector />

      {/* Primary Video Call Match Button */}
      <div className="mb-8">
        <Link href="/find-partner" className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-r from-[#c99614] to-[#c99614] text-white p-8 transition-all hover:scale-[1.01] shadow-[0_8px_30px_rgba(255,115,71,0.25)] hover:shadow-[0_8px_30px_rgba(255,115,71,0.4)]">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/15 blur-3xl transition-transform group-hover:scale-110"></div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-70 transition-opacity">
            <Video size={140} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-md border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400"></span>
              </span>
              {t('dashboard.videoActive')}
            </div>
            <h2 className="mb-2 text-3xl font-black tracking-tight">{t('dashboard.startMatch')}</h2>
            <p className="max-w-md text-white/85 text-lg mb-6 leading-relaxed">
              {t('dashboard.startMatchDesc')}
            </p>
            <div className="inline-flex items-center gap-3 rounded-xl bg-white text-[#c99614] px-6 py-3 font-bold transition-transform group-hover:translate-x-2 shadow-md">
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
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">{t('dashboard.moreOptions')}</h2>
          
          <div className="flex flex-col gap-3">
            <Link href="/lobbies" className="group bg-white border border-[#f0e8de] rounded-lg p-5 flex items-center justify-between hover:border-[#c99614] transition-colors shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[#FBF4E0] flex items-center justify-center text-[#c99614] group-hover:bg-gradient-to-br group-hover:from-[#c99614] group-hover:to-[#c99614] group-hover:text-white transition-all">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{t('dashboard.browseLobbies')}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{t('dashboard.browseLobbiesDesc')}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-gray-400 group-hover:text-[#c99614] transition-colors" />
            </Link>

            <Link href="/lobbies/create" className="group bg-white border border-[#f0e8de] rounded-lg p-5 flex items-center justify-between hover:border-[#c99614] transition-colors shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[#FBF4E0] flex items-center justify-center text-[#c99614] group-hover:bg-gradient-to-br group-hover:from-[#c99614] group-hover:to-[#c99614] group-hover:text-white transition-all">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{t('dashboard.createLobby')}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{t('dashboard.createLobbyDesc')}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-gray-400 group-hover:text-[#c99614] transition-colors" />
            </Link>

            <Link href="/friends" className="group bg-white border border-[#f0e8de] rounded-lg p-5 flex items-center justify-between hover:border-[#c99614] transition-colors shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[#FBF4E0] flex items-center justify-center text-[#c99614] group-hover:bg-gradient-to-br group-hover:from-[#c99614] group-hover:to-[#c99614] group-hover:text-white transition-all">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{t('dashboard.messages')}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{t('dashboard.messagesDesc')}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-gray-400 group-hover:text-[#c99614] transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
