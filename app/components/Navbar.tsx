  'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Menu,
  ChevronDown,
  Settings,
  Moon,
  Sun,
  LogOut,
  UserPlus,
  MessageSquare,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export default function Navbar({ sidebarCollapsed, onMobileMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock Notifications Data
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'friend_request', user: 'Maria G.', message: 'sent you a friend request.', time: '2m ago', read: false },
    { id: 2, type: 'message', user: 'Kenji M.', message: 'sent you a new message: "That sounds great!"', time: '1h ago', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { href: '/dashboard', labelKey: 'nav.dashboard' },
    { href: '/find-partner', labelKey: 'nav.match' },
    { href: '/lobbies', labelKey: 'nav.lobbies' },
    { href: '/friends', labelKey: 'nav.friends' },
  ];

  // Theme toggle logic
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  return (
    <header className={`navbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="navbar-left flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg mr-4">
            <div className="flex flex-wrap w-5 h-5 gap-[2px]">
              <div className="w-[9px] h-[9px] bg-[#c99614] rounded-sm" />
              <div className="w-[9px] h-[9px] bg-[#c99614] rounded-sm" />
              <div className="w-[9px] h-[9px] bg-[#c99614] rounded-sm" />
              <div className="w-[9px] h-[9px] bg-[#c99614] rounded-sm" />
            </div>
            <span className="bg-gradient-to-r from-[#c99614] to-[#c99614] bg-clip-text text-transparent tracking-tight">IDIOMAMATE</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#c99614] to-[#c99614] text-white shadow-md shadow-[#c99614]/20' 
                      : 'text-[#5A5A5A] hover:bg-[#FBF4E0] hover:text-[#c99614]'
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="navbar-right">

          {/* Notification Bell */}
          <div className="relative">
            <button
              className="navbar-icon-btn"
              aria-label={t('nav.notifications')}
              id="notification-bell"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setSettingsOpen(false);
                setMobileMenuOpen(false);
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-dot" />}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">{t('nav.notifications')}</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
                      className="text-xs text-[#c99614] hover:text-[#a87a10] font-medium flex items-center gap-1 transition-colors"
                    >
                      <Check size={12} /> {t('nav.markAllRead')}
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">{t('nav.noNotifications')}</div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                        className={`px-4 py-3 hover:bg-[#FFF8F0] flex gap-3 transition-colors cursor-pointer ${!notification.read ? 'bg-[#FBF4E0]/40' : ''}`}
                      >
                        <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.type === 'friend_request' ? 'bg-green-100 text-green-600' : 'bg-[#FBF4E0] text-[#c99614]'
                        }`}>
                          {notification.type === 'friend_request' ? <UserPlus size={14} /> : <MessageSquare size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 leading-tight">
                            <span className="font-semibold">{notification.user}</span> {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[#c99614] rounded-full mt-1.5 shrink-0"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-gray-100 pt-1 mt-1">
                  <button className="w-full px-4 py-2 text-sm text-center font-medium text-gray-600 hover:text-black transition-colors">
                    {t('nav.viewAllActivity')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Settings */}
          <div className="relative">
            <button 
              className="navbar-profile flex items-center gap-2" 
              id="user-profile-menu"
              onClick={() => {
                setSettingsOpen(!settingsOpen);
                setNotificationsOpen(false);
                setMobileMenuOpen(false);
              }}
            >
              <div className="navbar-avatar bg-[#c99614]">
                U
                <span className="online-dot" />
              </div>
              <div className="navbar-profile-info hidden sm:flex">
                <span className="navbar-profile-name">{t('nav.user')}</span>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
            </button>
            
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
                <button 
                  onClick={() => setIsDarkTheme(!isDarkTheme)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />} 
                  {isDarkTheme ? t('nav.lightTheme') : t('nav.darkTheme')}
                </button>
                <Link 
                  href="/profile"
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Settings size={16} /> {t('nav.settings')}
                </Link>
                <div className="h-px bg-gray-100 my-1"></div>
                <Link 
                  href="/login"
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium"
                >
                  <LogOut size={16} /> {t('nav.logout')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu - hidden on desktop, shown on mobile */}
          <div className="block md:hidden">
            <button 
              className="navbar-icon-btn ml-1"
              aria-label="Menu"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setSettingsOpen(false);
                setNotificationsOpen(false);
              }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown - hidden on desktop, shown on mobile */}
      {mobileMenuOpen && (
        <div className="flex md:hidden flex-col absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-md p-4 gap-2 z-40 animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FBF4E0] text-[#c99614]'
                    : 'text-[#5A5A5A] hover:bg-gray-50'
                }`}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
