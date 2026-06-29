'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

// Must match backend Language enum
const LANGUAGES = [
  { code: 'ENGLISH',   flag: '🇬🇧', label: 'English' },
  { code: 'SPANISH',   flag: '🇪🇸', label: 'Spanish' },
  { code: 'FRENCH',    flag: '🇫🇷', label: 'French' },
  { code: 'KOREAN',    flag: '🇰🇷', label: 'Korean' },
  { code: 'JAPANESE',  flag: '🇯🇵', label: 'Japanese' },
  { code: 'MANDARIN',  flag: '🇨🇳', label: 'Mandarin' },
  { code: 'ARABIC',    flag: '🇸🇦', label: 'Arabic' },
  { code: 'RUSSIAN',   flag: '🇷🇺', label: 'Russian' },
];

// Must match backend Proficiency enum
const LEVELS = [
  { value: 'BEGINNER',     label: 'Beginner',     emoji: '🌱', desc: 'I know a few words and basic phrases' },
  { value: 'INTERMEDIATE', label: 'Intermediate', emoji: '📚', desc: 'I can hold simple conversations' },
  { value: 'ADVANCED',     label: 'Advanced',     emoji: '🚀', desc: "I'm fluent but want to polish my skills" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile, isAuthenticated, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [proficiency, setProficiency] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Redirect if already set up
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.targetLanguage) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Show nothing while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  const filteredLangs = LANGUAGES.filter((l) =>
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleComplete = async () => {
    setError('');
    setIsLoading(true);
    try {
      await updateProfile({ targetLanguage, proficiency });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="auth-logo">
        <div className="auth-logo-icon">iM</div>
        <span className="auth-logo-text">IdiomaMate</span>
      </div>

      <div className="auth-card onboarding-card animate-fadeInUp">
        <div className="onboarding-progress">
          <div className="onboarding-progress-bar">
            <div
              className="onboarding-progress-fill"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
          <div className="onboarding-progress-label">Step {step} of 2</div>
        </div>

        {/* Step 1: Target Language */}
        {step === 1 && (
          <div className="onboarding-step animate-fadeInUp" key="step1">
            <div className="onboarding-step-icon target">
              <Globe size={28} />
            </div>
            <h2 className="onboarding-step-title">What language do you want to learn?</h2>
            <p className="onboarding-step-desc">
              Choose the language you want to practice and improve
            </p>

            <div className="onboarding-search-wrapper">
              <input
                type="text"
                className="onboarding-search"
                placeholder="Search languages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="onboarding-language-grid">
              {filteredLangs.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`onboarding-language-card ${targetLanguage === lang.code ? 'selected' : ''}`}
                  onClick={() => setTargetLanguage(lang.code)}
                >
                  <span className="onboarding-language-flag">{lang.flag}</span>
                  <span className="onboarding-language-name">{lang.label}</span>
                  {targetLanguage === lang.code && (
                    <CheckCircle2 size={16} className="onboarding-language-check" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Proficiency Level */}
        {step === 2 && (
          <div className="onboarding-step animate-fadeInUp" key="step3">
            <div className="onboarding-step-icon proficiency">
              <BarChart3 size={28} />
            </div>
            <h2 className="onboarding-step-title">What&apos;s your current level?</h2>
            <p className="onboarding-step-desc">
              In {LANGUAGES.find((l) => l.code === targetLanguage)?.label || 'your target language'}, how would you describe your skills?
            </p>

            <div className="onboarding-proficiency-group">
              {LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`onboarding-proficiency-card ${proficiency === level.value ? 'selected' : ''}`}
                  onClick={() => setProficiency(level.value)}
                >
                  <div className="onboarding-proficiency-radio">
                    <div className="onboarding-proficiency-radio-inner" />
                  </div>
                  <span className="onboarding-proficiency-emoji">{level.emoji}</span>
                  <div className="onboarding-proficiency-info">
                    <span className="onboarding-proficiency-label">{level.label}</span>
                    <span className="onboarding-proficiency-desc">{level.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-3 py-2 rounded-md border border-red-200 mt-4">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <div className="onboarding-actions">
          {step > 1 && (
            <button type="button" className="onboarding-back-btn" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          )}

          <div style={{ flex: 1 }} />

          {step < 2 ? (
            <button
              type="button"
              className={`auth-submit-btn onboarding-next-btn ${!targetLanguage ? 'disabled' : ''}`}
              onClick={() => setStep(2)}
              disabled={!targetLanguage}
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              className={`auth-submit-btn onboarding-next-btn ${!proficiency || isLoading ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`}
              onClick={handleComplete}
              disabled={!proficiency || isLoading}
            >
              {isLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Start Learning</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
