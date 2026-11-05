import AdminNavbar from '@/components/AdminNavbar';
import AdminPageTransition from '@/components/AdminPageTransition';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNavbar />
      <main className="pt-16 md:pt-20 min-h-screen bg-bg text-fg">
        <AdminPageTransition>{children}</AdminPageTransition>
      </main>
    </>
  );
}
