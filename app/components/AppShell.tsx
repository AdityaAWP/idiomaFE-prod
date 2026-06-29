'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isRoom = pathname?.startsWith('/room');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {!isRoom && (
        <Navbar
          sidebarCollapsed={true}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
        />
      )}
      <main className={`main-content${isRoom ? ' room-mode' : ''}`}>
        {children}
      </main>
    </>
  );
}
