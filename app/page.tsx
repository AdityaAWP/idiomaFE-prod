import Link from 'next/link';
import LandingPageClient from './components/LandingPageClient';

export const metadata = {
  title: 'IdiomaMate - Professional Language Exchange Platform',
  description:
    'Master languages through authentic video conversations with native speakers worldwide. A professional platform for serious learners.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-gray-900 font-sans selection:bg-[#c99614] selection:text-white flex flex-col relative overflow-hidden">

      {/* SVG dot-pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%236366f1'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Warm glow accent */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#FBF4E0]/80 blur-[120px] rounded-full -translate-x-1/4 -translate-y-1/4 pointer-events-none z-0" />
      {/* Cool glow accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#c99614]/30 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none z-0" />

      {/* ── Navigation ── */}
      <nav className="relative z-50 w-full pt-6">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap w-5 h-5 gap-[2px]">
              <div className="w-[9px] h-[9px] bg-[#c99614] rounded-sm" />
              <div className="w-[9px] h-[9px] bg-[#c99614] rounded-sm" />
              <div className="w-[9px] h-[9px] bg-[#c99614] rounded-sm" />
              <div className="w-[9px] h-[9px] bg-[#c99614] rounded-sm" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#2B2B2B]">IDIOMAMATE</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-10 text-[15px] font-medium text-[#4A4A4A]">
            <Link href="#features" className="hover:text-black transition-colors">Features</Link>
            <Link href="#methodology" className="hover:text-black transition-colors">Methodology</Link>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-[#4A4A4A] font-medium hover:text-black transition-colors text-[15px]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              id="nav-register-btn"
              className="bg-gradient-to-r from-[#c99614] to-[#c99614] hover:from-[#a87a10] hover:to-[#a87a10] text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-[#c99614]/20 hover:shadow-lg hover:shadow-[#c99614]/30 hover:scale-105 text-[15px]"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Main content (client-side animated) ── */}
      <main className="flex-1 relative z-10">
        <LandingPageClient />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-[#c99614] to-[#c99614] rounded-lg flex items-center justify-center text-white font-bold text-[10px] tracking-tighter shadow-sm">
              iM
            </div>
            <span className="font-bold text-gray-900 tracking-tight">IdiomaMate</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-gray-500">
            <Link href="#" className="hover:text-black transition-colors">Platform</Link>
            <Link href="#" className="hover:text-black transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-black transition-colors">Terms of Service</Link>
          </div>
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} IdiomaMate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
