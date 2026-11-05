import AdminNavbar from '@/components/AdminNavbar';
import DemoBanner from '@/components/DemoBanner';
import AdminPageTransition from '@/components/AdminPageTransition';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNavbar />
      {process.env.NEXT_PUBLIC_DEMO_MODE === '1' && <DemoBanner />}
      <main className="pt-16 md:pt-20 min-h-screen bg-bg text-fg">
        <AdminPageTransition>{children}</AdminPageTransition>
      </main>
    </>
  );
}
