'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Globe, Mail, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLocale } from '../../i18n/translations';
import { getFullImageUrl } from '@/lib/api';

const LANGUAGE_OPTIONS = [
  { value: 'ENGLISH', label: 'English' },
  { value: 'SPANISH', label: 'Spanish (Español)' },
  { value: 'JAPANESE', label: 'Japanese (日本語)' },
  { value: 'KOREAN', label: 'Korean (한국어)' },
  { value: 'FRENCH', label: 'French (Français)' },
  { value: 'MANDARIN', label: 'Mandarin (中文)' },
  { value: 'ARABIC', label: 'Arabic (العربية)' },
  { value: 'RUSSIAN', label: 'Russian (Русский)' },
];

const PROFICIENCY_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, logout, uploadAvatar } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLocale>(language);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState(user?.username ?? '');
  const [targetLanguage, setTargetLanguage] = useState(user?.targetLanguage ?? '');
  const [proficiency, setProficiency] = useState(user?.proficiency ?? '');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    setIsSuccess(false);
    try {
      await updateProfile({ username, targetLanguage, proficiency });
      setLanguage(selectedLanguage);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      await uploadAvatar(file);
    } catch (err: any) {
      setError(err.message ?? 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const avatarSrc = getFullImageUrl(user?.avatarUrl);

  return (
    <div className="max-w-3xl mx-auto animate-fadeInUp pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{t('profile.title')}</h1>
        <p className="text-[var(--mute)] mt-2">{t('profile.subtitle')}</p>
      </div>

      <div className="bg-[var(--paper)] rounded-2xl shadow-sm border border-[var(--line)] overflow-hidden">
        <div className="p-8 md:p-12">
          <form onSubmit={handleSave} className="space-y-10">
            <section>
              <h2 className="text-lg font-bold text-[var(--ink)] mb-6 border-b border-[var(--line)] pb-2">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--line)] bg-[var(--paper-2)] flex items-center justify-center">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-[var(--mute)]" />
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[var(--paper-2)] border border-[var(--line)] hover:bg-[var(--paper-3)] text-[var(--ink)] font-medium px-4 py-2 rounded-lg transition-colors shadow-sm text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin" /> Uploading…
                      </span>
                    ) : (
                      'Upload Photo'
                    )}
                  </button>
                  <p className="text-xs text-[var(--mute)] mt-2">JPG, GIF or PNG. Max 2MB.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[var(--ink)] mb-6 border-b border-[var(--line)] pb-2">Personal Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-bold text-[var(--ink-2)] mb-2">Username</label>
                  <div className="relative">
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-[var(--mute)]"><User size={18} /></div>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[var(--paper-2)] border border-[var(--line)] rounded-lg pl-11 pr-4 py-3 focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--ink-2)] mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-[var(--mute)]"><Mail size={18} /></div>
                    <input type="email" value={user?.email ?? ''} disabled
                      className="w-full bg-[var(--paper-2)] border border-[var(--line)] rounded-lg pl-11 pr-4 py-3 text-sm text-[var(--mute)] cursor-not-allowed opacity-70" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[var(--ink)] mb-6 border-b border-[var(--line)] pb-2">Language Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--ink-2)] mb-2">Target Language</label>
                  <div className="relative">
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-[var(--mute)]"><Globe size={18} /></div>
                    <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full bg-[var(--paper-2)] border border-[var(--line)] rounded-lg pl-11 pr-10 py-3 focus:ring-1 focus:ring-[var(--accent)] transition-all text-sm appearance-none">
                      <option value="">Select language…</option>
                      {LANGUAGE_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--ink-2)] mb-2">Proficiency Level</label>
                  <select value={proficiency} onChange={(e) => setProficiency(e.target.value)}
                    className="w-full bg-[var(--paper-2)] border border-[var(--line)] rounded-lg px-4 py-3 focus:ring-1 focus:ring-[var(--accent)] transition-all text-sm">
                    <option value="">Select level…</option>
                    {PROFICIENCY_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[var(--ink)] mb-6 border-b border-[var(--line)] pb-2">Interface Language</h2>
              <div>
                <label className="block text-sm font-bold text-[var(--ink-2)] mb-2">Website Language</label>
                <div className="relative max-w-md">
                  <div className="absolute top-1/2 -translate-y-1/2 left-4 text-[var(--mute)]"><Globe size={18} /></div>
                  <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value as SupportedLocale)}
                    className="w-full bg-[var(--paper-2)] border border-[var(--line)] rounded-lg pl-11 pr-10 py-3 focus:ring-1 focus:ring-[var(--accent)] transition-all text-sm appearance-none font-medium">
                    <option value="English">English</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                    <option value="Korean">Korean (한국어)</option>
                    <option value="French">French (Français)</option>
                    <option value="Russian">Russian (Русский)</option>
                    <option value="Mandarin">Mandarin (中文)</option>
                    <option value="Arabic">Arabic (العربية)</option>
                  </select>
                </div>
              </div>
            </section>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-3 py-2 rounded-md border border-red-200">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <div className="pt-4 flex items-center gap-4 flex-wrap">
              <button type="submit" disabled={isSaving}
                className={`py-3 px-8 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center min-w-[140px] ${
                  isSaving ? 'bg-[var(--paper-2)] text-[var(--mute)] border border-[var(--line)] cursor-not-allowed' : 'bg-[var(--accent)] text-white hover:brightness-95'
                }`}>
                {isSaving ? <><span className="w-4 h-4 border-2 border-[var(--mute)] border-t-transparent rounded-full animate-spin mr-2" /> Saving…</> : t('profile.saveChanges')}
              </button>
              {isSuccess && (
                <div className="flex items-center text-[var(--leaf)] text-sm font-medium animate-fadeIn">
                  <CheckCircle2 size={16} className="mr-1.5" /> Saved successfully
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-[var(--line)]">
              <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Session</h2>
              <button type="button" onClick={() => logout()}
                className="flex items-center gap-3 py-3 px-6 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Log Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
