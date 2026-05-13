'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Users,
  UserPlus,
  MessageSquare,
  User,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const mainNavItems = [
    { labelKey: 'sidebar.dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { labelKey: 'sidebar.findPartner', href: '/find-partner', icon: <Search size={20} /> },
    { labelKey: 'sidebar.lobbies', href: '/lobbies', icon: <Globe size={20} /> },
  ];

  const socialNavItems = [
    { labelKey: 'sidebar.friends', href: '/friends', icon: <UserPlus size={20} />, badge: 3 },
  ];

  const accountNavItems = [
    { labelKey: 'sidebar.profile', href: '/profile', icon: <User size={20} /> },
  ];

  const renderNavItem = (item: { labelKey: string; href: string; icon: React.ReactNode; badge?: number }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const label = t(item.labelKey);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`sidebar-link ${isActive ? 'active' : ''}`}
        onClick={onMobileClose}
        title={collapsed ? label : undefined}
      >
        <span className="sidebar-link-icon">{item.icon}</span>
        <span className="sidebar-link-label">{label}</span>
        {item.badge && item.badge > 0 && (
          <span className="sidebar-link-badge">{item.badge}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={onMobileClose}
      />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">iM</div>
          <span className="sidebar-logo-text">IdiomaMate</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">{t('sidebar.main')}</div>
          {mainNavItems.map(renderNavItem)}

          <div className="sidebar-section-title">{t('sidebar.social')}</div>
          {socialNavItems.map(renderNavItem)}

          <div className="sidebar-section-title">{t('sidebar.account')}</div>
          {accountNavItems.map(renderNavItem)}
        </nav>

        {/* Footer toggle */}
        <div className="sidebar-footer">
          <button className="sidebar-toggle" onClick={onToggle}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>{t('sidebar.collapse')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
