'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../components/AppShell';
import { PartnerProvider } from '../context/PartnerContext';
import { LanguageProvider } from '../context/LanguageContext';
import { NotificationProvider } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <PartnerProvider>
        <NotificationProvider>
        <AuthGuard>
          <AppShell>{children}</AppShell>
        </AuthGuard>
        </NotificationProvider>
      </PartnerProvider>
    </LanguageProvider>
  );
}
