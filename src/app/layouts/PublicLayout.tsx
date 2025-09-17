import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import HomeFooter from '@/features/landing/pages/home/components/HomeFooter';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import HeaderMenu from '@/components/navigation/HeaderMenu';

export function PublicLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      {!['/checkout', '/'].includes(location.pathname) && <HeaderMenu />}
      <main className="flex-1">
        <Outlet />
      </main>
      <HomeFooter />
    </div>
  );
}
