'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Camera, Globe, Mail, CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLocale } from '../../i18n/translations';

export default function ProfilePage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const [displayName, setDisplayName] = useState('');
  const [email] = useState('user@example.com');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLocale>(language);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('idiomamate_display_name');
    const savedAvatar = localStorage.getItem('idiomamate_avatar');
    
    if (savedName) setDisplayName(savedName);
    else setDisplayName('John Doe'); 
    
    if (savedAvatar) setAvatarUrl(savedAvatar);
  }, []);

  // Keep local selector in sync if language changes externally
  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSuccess(false);

    // Simulate API delay
    setTimeout(() => {
      localStorage.setItem('idiomamate_display_name', displayName);
      if (avatarUrl) {
        localStorage.setItem('idiomamate_avatar', avatarUrl);
      }

      // Apply language change immediately via context
      setLanguage(selectedLanguage);
      
      setIsSaving(false);
      setIsSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeInUp pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('profile.title')}</h1>
        <p className="text-gray-500 mt-2">{t('profile.subtitle')}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar / Navigation (Simulated) */}
        <div className="md:w-64 bg-gray-50 border-r border-gray-200 p-6 hidden md:block">
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#c99614] to-[#c99614] text-white font-semibold shadow-sm">
              <User size={18} /> {t('profile.navProfile')}
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-100 font-medium transition-colors">
              <Globe size={18} /> {t('profile.navPreferences')}
            </a>
          </nav>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8">
          <form onSubmit={handleSave} className="space-y-10">
            
            {/* Profile Picture Section */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">{t('profile.sectionPicture')}</h2>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center relative">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-400" />
                    )}
                    
                    {/* Hover Overlay */}
                    <div 
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                </div>
                
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors shadow-sm text-sm"
                  >
                    {t('profile.uploadBtn')}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">{t('profile.uploadHint')}</p>
                </div>
              </div>
            </section>

            {/* Personal Info Section */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">{t('profile.sectionPersonal')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-bold text-gray-700 mb-2">{t('profile.displayName')}</label>
                  <div className="relative">
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-11 pr-4 py-3 focus:ring-1 focus:ring-[#c99614] focus:border-[#c99614] transition-all text-sm text-gray-900 focus:outline-none focus:bg-white shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">{t('profile.emailAddress')}</label>
                  <div className="relative">
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      disabled
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm text-gray-500 cursor-not-allowed shadow-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{t('profile.emailHint')}</p>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">{t('profile.sectionSecurity')}</h2>
              <div className="flex items-center justify-between max-w-2xl bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t('profile.passwordLabel')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t('profile.passwordDesc')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  id="change-password-btn"
                  onClick={() => router.push('/change-password')}
                  className="flex items-center gap-1.5 text-sm font-semibold text-black hover:text-gray-600 transition-colors whitespace-nowrap"
                >
                  {t('profile.changePassword')} <ChevronRight size={16} />
                </button>
              </div>
            </section>

            {/* Preferences Section */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">{t('profile.sectionPreferences')}</h2>
              <div>
                <label htmlFor="language" className="block text-sm font-bold text-gray-700 mb-2">{t('profile.websiteLanguage')}</label>
                <p className="text-sm text-gray-500 mb-3">{t('profile.websiteLanguageDesc')}</p>
                <div className="relative max-w-md">
                  <div className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400">
                    <Globe size={18} />
                  </div>
                  <select
                    id="language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as SupportedLocale)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-11 pr-10 py-3 focus:ring-1 focus:ring-[#c99614] focus:border-[#c99614] transition-all text-sm text-gray-900 appearance-none focus:outline-none focus:bg-white cursor-pointer font-medium shadow-sm"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                    <option value="Korean">Korean (한국어)</option>
                    <option value="French">French (Français)</option>
                    <option value="Russian">Russian (Русский)</option>
                    <option value="Mandarin">Mandarin (中文)</option>
                    <option value="Arabic">Arabic (العربية)</option>
                  </select>
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-4 flex items-center gap-4 flex-wrap">
              <button
                type="submit"
                disabled={isSaving}
                id="save-changes-btn"
                className={`py-3 px-8 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center min-w-[140px] ${
                  isSaving
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#c99614] to-[#c99614] hover:from-[#a87a10] hover:to-[#a87a10] text-white border border-transparent shadow-md shadow-[#c99614]/20 hover:shadow-lg hover:shadow-[#c99614]/30'
                }`}
              >
                {isSaving ? (
                  <><span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></span> {t('profile.saving')}</>
                ) : (
                  t('profile.saveChanges')
                )}
              </button>

              <button
                type="button"
                id="goto-change-password-btn"
                onClick={() => router.push('/change-password')}
                className="py-3 px-8 rounded-lg font-medium shadow-sm transition-all border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-2"
              >
                <Lock size={16} /> {t('profile.changePassword')}
              </button>
              
              {isSuccess && (
                <div className="flex items-center text-green-600 text-sm font-medium animate-fadeIn">
                  <CheckCircle2 size={16} className="mr-1.5" /> {t('profile.saveSuccess')}
                </div>
              )}
            </div>

            {/* Logout Section */}
            <div className="pt-6 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('profile.sectionSecurity') ? 'Session' : 'Session'}</h2>
              <button
                type="button"
                id="logout-btn"
                onClick={() => router.push('/login')}
                className="flex items-center gap-3 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Log Out
              </button>
              <p className="text-xs text-gray-400 mt-2">You will be redirected to the login page.</p>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
