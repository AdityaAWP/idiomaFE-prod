'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell, Menu, ChevronDown, Settings, LogOut,
  UserPlus, MessageSquare, Check, X
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { friends as friendsApi, getFullImageUrl } from '@/lib/api';

interface NavbarProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

interface Notification {
  id: string;
  type: string;
  user: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Navbar({ sidebarCollapsed, onMobileMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Poll for pending friend requests every 5 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const requests = await friendsApi.receivedRequests();
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newNotifs: Notification[] = [];
          requests.forEach((r: any) => {
            if (existingIds.has(r.id)) return;
            newNotifs.push({
              id: r.id,
              type: 'friend_request',
              user: r.sender?.username ?? 'Someone',
              message: 'sent you a friend request.',
              time: 'just now',
              read: false,
            });
          });
          return newNotifs.length > 0 ? [...newNotifs, ...prev] : prev;
        });
      } catch {}
    };
    poll();
    const iv = setInterval(poll, 5000);

    // Also listen for real-time WebSocket friend_request events
    const handleWsEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.senderId && detail?.requestId) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === detail.requestId)) return prev;
          return [{
            id: detail.requestId,
            type: 'friend_request',
            user: detail.senderUsername ?? 'Someone',
            message: 'sent you a friend request.',
            time: 'just now',
            read: false,
          }, ...prev];
        });
      }
    };
    window.addEventListener('idiomamate:friend_request', handleWsEvent);
    return () => {
      clearInterval(iv);
      window.removeEventListener('idiomamate:friend_request', handleWsEvent);
    };
  }, []);

  const handleNotificationClick = (n: Notification) => {
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    setNotificationsOpen(false);
    if (n.type === 'friend_request') {
      router.push('/friends?tab=requests');
    }
  };

  const handleAcceptRequest = async (e: React.MouseEvent, n: Notification) => {
    e.stopPropagation();
    try {
      await friendsApi.acceptRequest(n.id);
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    } catch {}
  };

  const handleDeclineRequest = async (e: React.MouseEvent, n: Notification) => {
    e.stopPropagation();
    try {
      await friendsApi.rejectRequest(n.id);
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { href: '/dashboard', labelKey: 'nav.dashboard' },
    { href: '/find-partner', labelKey: 'nav.match' },
    { href: '/lobbies', labelKey: 'nav.lobbies' },
    { href: '/friends', labelKey: 'nav.friends' },
  ];

  return (
    <header className={`navbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="navbar-left flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg mr-4">
            <div className="flex flex-wrap w-5 h-5 gap-[2px]">
              <div className="w-[9px] h-[9px] bg-[var(--accent)] rounded-sm" />
              <div className="w-[9px] h-[9px] bg-[var(--accent)] rounded-sm" />
              <div className="w-[9px] h-[9px] bg-[var(--accent)] rounded-sm" />
              <div className="w-[9px] h-[9px] bg-[var(--accent)] rounded-sm" />
            </div>
            <span className="text-[var(--ink)] font-extrabold tracking-tight">IDIOMAMATE</span>
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
                      ? 'bg-[var(--accent)] text-white shadow-md'
                      : 'text-[var(--ink-2)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]'
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
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setSettingsOpen(false);
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-dot" />}
            </button>

            {notificationsOpen && (
              <div className="fixed inset-0 z-40 md:absolute md:inset-auto md:right-0 md:mt-2 md:w-80 md:bg-white md:rounded-xl md:shadow-lg md:border md:border-gray-100 flex items-start justify-center" onClick={() => setNotificationsOpen(false)}>
                <div className="w-full mt-16 md:mt-0 mx-4 md:mx-0 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">{t('nav.notifications')}</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                      className="text-xs text-[var(--accent)] hover:text-[var(--ink)] font-medium flex items-center gap-1 transition-colors"
                    >
                      <Check size={12} /> {t('nav.markAllRead')}
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">{t('nav.noNotifications')}</div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-[#FFF8F0] transition-colors ${
                          !notification.read ? 'bg-[#FFF4ED]/40' : ''
                        }`}
                      >
                        <div className="flex gap-3 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
                        <div
                          className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.type === 'friend_request'
                              ? 'bg-green-100 text-[var(--leaf)]'
                              : 'bg-[var(--paper-2)] text-[var(--accent)]'
                          }`}
                        >
                          {notification.type === 'friend_request' ? <UserPlus size={14} /> : <MessageSquare size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 leading-tight">
                            <span className="font-semibold">{notification.user}</span> {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && <div className="w-2 h-2 bg-[var(--accent)] rounded-full mt-1.5 shrink-0" />}
                        </div>
                        {notification.type === 'friend_request' && (
                          <div className="flex gap-2 mt-2 pl-11">
                            <button onClick={(e) => handleAcceptRequest(e, notification)} className="px-3 py-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 text-xs font-medium flex items-center gap-1">
                              <Check size={12} /> Accept
                            </button>
                            <button onClick={(e) => handleDeclineRequest(e, notification)} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-xs font-medium flex items-center gap-1">
                              <X size={12} /> Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              className="navbar-profile flex items-center gap-2"
              onClick={() => {
                setSettingsOpen(!settingsOpen);
                setNotificationsOpen(false);
              }}
            >
              <div className="navbar-avatar bg-[var(--accent)]">
                {user?.avatarUrl ? (
                  <img src={getFullImageUrl(user.avatarUrl)!} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span>{user?.username?.charAt(0)?.toUpperCase() ?? 'U'}</span>
                )}
                <span className="online-dot" />
              </div>
              <div className="navbar-profile-info hidden sm:flex">
                <span className="navbar-profile-name">{user?.username ?? t('nav.user')}</span>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-48 max-[400px]:w-[calc(100vw-16px)] max-[400px]:right-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
                <Link href="/profile" className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                  <Settings size={16} /> {t('nav.settings')}
                </Link>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={() => { setSettingsOpen(false); logout(); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium"
                >
                  <LogOut size={16} /> {t('nav.logout')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
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

      {/* Mobile Menu */}
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
                    ? 'bg-[var(--paper-2)] text-[var(--accent)]'
                    : 'text-[var(--ink-2)] hover:bg-[var(--paper-3)]'
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
