import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import HomeFooter from '@/features/landing/pages/home/components/HomeFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <HomeFooter />
    </div>
  );
}
