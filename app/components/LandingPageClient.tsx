'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, MessageSquare, Globe, ArrowRight, Users, Shuffle, BookOpen, CheckCircle2, Zap, Shield } from 'lucide-react';

/* ─── Topic pool for the Scaffolding Demo ─── */
const TOPICS = [
  { emoji: '🌏', title: 'Cultural Traditions', prompt: 'What is a tradition from your country that you are most proud of?' },
  { emoji: '🍜', title: 'Food & Cuisine', prompt: 'Describe your favourite dish and explain how it is prepared.' },
  { emoji: '🎬', title: 'Movies & Pop Culture', prompt: 'Which film changed your perspective on life, and why?' },
  { emoji: '✈️', title: 'Travel Dreams', prompt: 'If you could visit any place in the world, where would you go?' },
  { emoji: '📚', title: 'Learning Journey', prompt: 'What is the hardest part of learning a new language for you?' },
  { emoji: '🎵', title: 'Music & Art', prompt: 'What kind of music do you listen to when studying or relaxing?' },
  { emoji: '🤖', title: 'Tech & Future', prompt: 'How do you think AI will change the way we learn languages?' },
  { emoji: '🏆', title: 'Personal Goals', prompt: 'Share one goal you are working towards right now.' },
];



/* ─── Feature card data ─── */
const FEATURES = [
  {
    icon: <Video size={26} />,
    color: 'text-[#c99614]',
    bg: 'bg-[#FBF4E0]',
    title: 'Precision Matchmaking',
    desc: 'Define proficiency, goals, and icebreakers before a session. Our algorithm connects you only with partners who align with your learning style.',
    image: '/feature_matchmaking.png',
    glow: 'bg-[#c99614]/30',
    alt: 'Precision Matchmaking',
    layout: 'normal',
  },
  {
    icon: <MessageSquare size={26} />,
    color: 'text-[#c99614]',
    bg: 'bg-[#FFFBE6]',
    title: 'Dynamic Scaffolding',
    desc: 'Real-time topic suggestions, cultural trivia, and grammar prompts activate the moment a conversation stalls—so silence never wins.',
    image: '/cartoon_student.png',
    glow: 'bg-[#c99614]/20',
    alt: 'Dynamic Scaffolding',
    layout: 'reverse',
  },
  {
    icon: <Globe size={26} />,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    title: 'Public Lobbies',
    desc: 'Join organized group rooms by proficiency and topic. Practice spontaneous multi-participant dialogue and build confidence in a social atmosphere.',
    image: '/video_call_cartoon_v2.png',
    glow: 'bg-pink-100',
    alt: 'Public Lobbies',
    layout: 'normal',
  },
];

/* ═══════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative pt-20 pb-20 px-6 max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between min-h-[calc(100vh-100px)]">
      {/* Left text */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full lg:w-[45%] text-left flex flex-col items-start z-10 mt-10 lg:mt-0"
      >
        {/* Glassmorphism card */}
        <div className="w-full bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 lg:p-10 mb-8">


          <h1 className="text-4xl lg:text-[3.6rem] font-extrabold mb-5 tracking-tight text-[#2B2B2B] leading-[1.08]">
            Master languages through{' '}
            <span className="bg-gradient-to-r from-[#c99614] to-[#c99614] bg-clip-text text-transparent">
              Idiomamate
            </span>
            .
          </h1>
          <p className="text-base md:text-[1.05rem] text-[#5A5A5A] mb-8 leading-relaxed font-medium">
            A professional environment engineered for serious learners. Build fluency, confidence, and cross-cultural competence — together.
          </p>

          <div className="flex flex-row items-center gap-5 w-full flex-wrap">
            <Link
              href="/register"
              id="hero-get-started"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#c99614] to-[#c99614] hover:from-[#a87a10] hover:to-[#a87a10] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[#c99614]/30 hover:shadow-xl hover:shadow-[#c99614]/40 hover:scale-105"
            >
              Get Started
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <ExploreButtonInline />
          </div>
        </div>

        {/* Language flags strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col items-center justify-center w-full max-w-[450px] bg-white/60 backdrop-blur-sm py-4 px-6 rounded-2xl border border-gray-100 shadow-sm"
        >
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Supported Languages</span>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[
              { src: '/flag_sa.png', alt: 'Arabic' },
              { src: '/flag_cn.png', alt: 'Mandarin' },
              { src: '/flag_uk.png', alt: 'English' },
              { src: '/flag_fr.png', alt: 'French' },
              { src: '/flag_ru.png', alt: 'Russian' },
              { src: '/flag_es.png', alt: 'Spanish' },
              { src: '/flag_ko.png', alt: 'Korean' },
              { src: '/flag_jp.png', alt: 'Japanese' },
            ].map((f) => (
              <img
                key={f.src}
                src={f.src}
                alt={f.alt}
                title={f.alt}
                className="w-9 h-9 object-contain hover:-translate-y-1 hover:scale-110 transition-all cursor-pointer mix-blend-multiply drop-shadow-sm"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Right — visual */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="w-full lg:w-[50%] relative h-[500px] lg:h-[700px] mt-16 lg:mt-0 flex justify-end items-center"
      >
        {/* Background blobs */}
        <div className="absolute top-[5%] right-[5%] w-[350px] h-[350px] lg:w-[550px] lg:h-[550px] bg-[#c99614] rounded-full -z-10" />
        <div className="absolute top-[0%] right-[0%] w-[150px] h-[150px] lg:w-[250px] lg:h-[250px] bg-[#c99614] rounded-full -z-10" />
        <div className="absolute bottom-[5%] right-[-5%] w-[100px] h-[100px] lg:w-[150px] lg:h-[150px] bg-[#434CE6] rounded-full -z-10" />

        {/* Hero image */}
        <div className="absolute inset-x-0 bottom-0 top-[5%] flex items-end justify-center pointer-events-none overflow-visible z-10">
          <img
            src="/video_call_white_bg.png"
            alt="Video Call Interface"
            className="max-h-[105%] w-3xl object-contain mix-blend-multiply drop-shadow-2xl translate-x-4 translate-y-4"
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   SCAFFOLDING DEMO SECTION
═══════════════════════════════════════════════ */
function ScaffoldingDemo() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="py-24 relative overflow-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
      `}</style>

      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#FBF4E0] to-slate-50 -z-10" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%236366f1'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold tracking-widest text-[#c99614] uppercase">Live Demo · Visual Scaffolding</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2B2B2B] mt-3 mb-4 tracking-tight">
            Never run out of things to say.
          </h2>
          <p className="text-[#5A5A5A] text-lg leading-relaxed font-medium max-w-2xl mx-auto">
            When silence hits, IdiomaMate surfaces contextual topic cards in real-time. Explore the topics below — this is exactly what your partner sees during a live call.
          </p>
        </motion.div>
      </div>

      {/* Marquee container */}
      <div 
        className="relative w-full overflow-hidden flex py-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="flex gap-6 px-3 w-max animate-marquee"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {[...TOPICS, ...TOPICS].map((topic, i) => (
            <div
              key={i}
              className="relative w-[340px] shrink-0 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/80 p-8 flex flex-col items-center text-center hover:scale-105 hover:shadow-2xl hover:border-[#c99614]/50 transition-all duration-300"
            >
              {/* Silence timer badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide whitespace-nowrap z-10">
                🔇 Silence Detected · 12s
              </div>

              <div className="text-5xl mb-4 mt-2">{topic.emoji}</div>

              <span className="text-[11px] font-bold tracking-widest text-[#c99614] uppercase mb-2">Suggested Topic</span>
              <h3 className="text-xl font-extrabold text-[#2B2B2B] mb-3">{topic.title}</h3>
              <p className="text-[#5A5A5A] text-sm leading-relaxed font-medium italic flex-1">
                "{topic.prompt}"
              </p>

              {/* Card footer */}
              <div className="flex items-center gap-2 mt-6 text-xs text-gray-400 font-medium pt-4 border-t border-gray-100 w-full justify-center">
                <Users size={13} />
                Both partners see this
              </div>
            </div>
          ))}
        </div>
        
        {/* Gradient fades for edges */}
        <div className="absolute top-0 bottom-0 left-0 w-16 md:w-40 bg-gradient-to-r from-[#FFF8F0] to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 md:w-40 bg-gradient-to-l from-[#FFF8F0] to-transparent pointer-events-none" />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FEATURE CARDS SECTION
═══════════════════════════════════════════════ */
function FeatureCard({ feat, i }: { feat: typeof FEATURES[0]; i: number }) {
  const isReverse = feat.layout === 'reverse';
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: i * 0.1 }}
      className={`flex flex-col ${isReverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
    >
      {/* Image side */}
      <div className="w-full lg:w-1/2 relative flex justify-center">
        <div className={`absolute inset-0 ${feat.glow} rounded-full blur-3xl opacity-60 -z-10 translate-y-4 scale-75`} />
        <motion.img
          whileHover={{ scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          src={feat.image}
          alt={feat.alt}
          className="w-[80%] h-auto object-contain mix-blend-multiply drop-shadow-2xl"
        />
      </div>

      {/* Text side */}
      <div className="w-full lg:w-1/2 flex flex-col items-start">
        {/* Hover-bouncing icon card */}
        <motion.div
          whileHover={{ y: [-2, -8, -2] }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className={`w-16 h-16 ${feat.bg} ${feat.color} rounded-3xl flex items-center justify-center mb-8 shadow-xl`}
        >
          {feat.icon}
        </motion.div>

        <h4 className="text-3xl lg:text-4xl font-extrabold text-[#2B2B2B] mb-5 tracking-tight">{feat.title}</h4>
        <p className="text-[#5A5A5A] text-lg leading-relaxed mb-6 font-medium">{feat.desc}</p>

        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-[#c99614] font-semibold hover:gap-3 transition-all text-sm group"
        >
          Learn more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#FCFBFA]">
      <div className="max-w-[1400px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-24"
        >
          <h2 className="text-xs font-bold tracking-widest text-[#c99614] uppercase mb-3">Core Capabilities</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-[#2B2B2B] mb-6 tracking-tight">
            Structured architecture to prevent conversation breakdown.
          </h3>
          <p className="text-[#5A5A5A] text-lg leading-relaxed font-medium">
            Casual language apps fail because they lack structure. We provide robust scaffolding to eliminate language anxiety and ensure productive learning sessions.
          </p>
        </motion.div>

        <div className="flex flex-col gap-32">
          {FEATURES.map((feat, i) => (
            <FeatureCard key={feat.title} feat={feat} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════
   METHODOLOGY SECTION
═══════════════════════════════════════════════ */
function MethodologySection() {
  const pillars = [
    {
      icon: <BookOpen size={22} />,
      color: 'text-[#c99614]',
      bg: 'bg-[#FBF4E0]',
      title: 'Guided Learning',
      desc: 'Learn with partners who match your exact level, helping you improve naturally through practical, real-world conversations.',
    },
    {
      icon: <Zap size={22} />,
      color: 'text-[#c99614]',
      bg: 'bg-[#FFFBE6]',
      title: 'No More Awkward Silences',
      desc: 'Our dynamic topic cards and real-time prompts keep the conversation flowing smoothly, so you never run out of things to say.',
    },
    {
      icon: <Shield size={22} />,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      title: 'Distraction-Free Environment',
      desc: 'A clean, easy-to-use interface designed specifically for focused language practice, free from the noise of typical social apps.',
    },
    {
      icon: <CheckCircle2 size={22} />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      title: 'Genuine Connections',
      desc: 'Express yourself with emojis, reactions, and interactive features that make online interactions feel as natural and fun as in-person chats.',
    },
  ];

  const steps = [
    { num: '01', title: 'Pre-match Configuration', desc: 'Set your learning goal, target language, proficiency level, and icebreaker questions — before you even enter a session.' },
    { num: '02', title: 'Precision Matching', desc: 'The algorithm pairs you with the most compatible partner. No random roulette, no wasted time.' },
    { num: '03', title: 'Scaffolded Conversation', desc: 'Topic cards, grammar prompts, and cultural trivia surface automatically when silence is detected.' },
    { num: '04', title: 'Reflect & Progress', desc: 'Review your session topics, vocabulary wins, and connection history to track long-term fluency growth.' },
  ];

  return (
    <section id="methodology" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#c99614]/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-xs font-bold tracking-widest text-[#c99614] uppercase">Why IdiomaMate Works</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2B2B2B] mt-3 mb-4 tracking-tight">
            Designed for real fluency.
          </h2>
          <p className="text-[#5A5A5A] text-lg leading-relaxed font-medium">
            We focus on practical conversation and smart matchmaking, giving you the perfect environment to build your language confidence.
          </p>
        </motion.div>

        {/* 4 pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 flex gap-5 items-start hover:shadow-2xl transition-all duration-300"
            >
              <div className={`w-12 h-12 min-w-12 ${p.bg} ${p.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                {p.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2B2B2B] mb-2">{p.title}</h3>
                <p className="text-[#5A5A5A] text-sm leading-relaxed font-medium">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works — horizontal stepper */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold tracking-widest text-[#c99614] uppercase">How It Works</span>
          <h3 className="text-3xl md:text-4xl font-extrabold text-[#2B2B2B] mt-3 tracking-tight">How IdioMate Works</h3>
          <p className="text-[#5A5A5A] mt-3 text-base font-medium">Your journey to fluency in four simple steps.</p>
        </motion.div>

        {/* Stepper row */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="absolute top-[28px] left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-[2px] bg-gradient-to-r from-[#c99614] via-[#c99614] to-[#c99614] hidden md:block z-0" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {[
              { num: '01', color: 'from-[#c99614] to-[#d4a827]', title: 'Create Profile', desc: 'Set your language goals and proficiency level.' },
              { num: '02', color: 'from-[#c99614] to-[#d4a827]', title: 'Get Matched', desc: 'Our AI finds perfect conversation partners.' },
              { num: '03', color: 'from-[#c99614] to-[#c99614]', title: 'Practice Live', desc: 'Join interactive sessions with guidance.' },
              { num: '04', color: 'from-[#c99614] to-[#c99614]', title: 'Track Progress', desc: 'Monitor improvements and celebrate wins.' },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex flex-col items-center text-center"
              >
                {/* Circle */}
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-white font-extrabold text-lg shadow-lg mb-4`}>
                  {s.num}
                </div>
                <h4 className="text-sm font-bold text-[#2B2B2B] mb-1">{s.title}</h4>
                <p className="text-[#5A5A5A] text-xs leading-relaxed font-medium">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════
   BOTTOM CTA BANNER
═══════════════════════════════════════════════ */
function CtaBanner() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white -z-10" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%236366f1'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#2B2B2B] mb-5 tracking-tight">
          Ready to speak without fear?
        </h2>
        <p className="text-[#5A5A5A] text-lg mb-10 font-medium leading-relaxed">
          Join IdiomaMate and experience the only language-exchange platform built around preventing conversation breakdown.
        </p>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/register"
            id="cta-get-started"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c99614] to-[#c99614] hover:from-[#a87a10] hover:to-[#a87a10] text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-[#c99614]/30 hover:shadow-2xl hover:shadow-[#c99614]/40"
          >
            Get Started — It&apos;s Free
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   INLINE EXPLORE BUTTON (no separate file needed)
═══════════════════════════════════════════════ */
function ExploreButtonInline() {
  const handleClick = () => {
    const target = document.getElementById('features');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <button
      onClick={handleClick}
      className="text-[#2B2B2B] font-bold underline decoration-2 underline-offset-4 hover:text-[#c99614] hover:decoration-[#c99614] transition-all cursor-pointer bg-transparent border-none p-0"
    >
      Explore Platform
    </button>
  );
}

/* ═══════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════ */
export default function LandingPageClient() {
  return (
    <>
      <HeroSection />
      <ScaffoldingDemo />
      <FeaturesSection />
      <MethodologySection />
      <CtaBanner />
    </>
  );
}
