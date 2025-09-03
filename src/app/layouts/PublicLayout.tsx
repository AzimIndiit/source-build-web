import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import HomeFooter from '@/features/landing/pages/home/components/HomeFooter';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <HomeFooter />
    </div>
  );
}
