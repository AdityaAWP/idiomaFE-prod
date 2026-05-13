import AppShell from '../components/AppShell';
import { PartnerProvider } from '../context/PartnerContext';
import { LanguageProvider } from '../context/LanguageContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <PartnerProvider>
        <AppShell>{children}</AppShell>
      </PartnerProvider>
    </LanguageProvider>
  );
}
