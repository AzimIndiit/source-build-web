import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminNavbar } from '@/components/navigation/AdminNavbar';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import HomeFooter from '@/features/landing/pages/home/components/HomeFooter';
import HeaderMenu from '@/components/navigation/HeaderMenu';
import { AdminSidebar, AdminSidebarToggle } from '@/components/navigation/AdminSidebar';

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Initialize based on current window width to prevent flickering
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      // Auto-collapse on tablet
      if (width >= 768 && width < 1024) {
        setIsSidebarCollapsed(true);
      } else if (width >= 1024) {
        setIsSidebarCollapsed(false);
      }
    };

    // Initial check
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic sidebar width based on collapse state
  const sidebarWidth = isSidebarCollapsed ? '80px' : '260px';

  return (
    <div className=" relative size-full">
      <ScrollToTop />

      {/* Main Content */}
      <div className="flex">
        {/* Desktop/Tablet Sidebar */}
        <div className="hidden md:block fixed left-0 z-40">
          <AdminSidebar
            isCollapsed={isSidebarCollapsed}
            onCollapsedChange={setIsSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar - Only render on mobile */}
        {isMobile && (
          <>
            <AdminSidebar
              isOpen={isMobileSidebarOpen}
              onClose={() => setIsMobileSidebarOpen(false)}
              isMobile={true}
            />
            <AdminSidebarToggle onClick={() => setIsMobileSidebarOpen(true)} />
          </>
        )}

        {/* Content Area */}
        <div className="flex-1">
          {/* Header */}
          <div
            className="fixed top-0 left-0 right-0  transition-all duration-300  z-12"
            style={{
              marginLeft: isMobile ? '0' : sidebarWidth,
            }}
          >
            <AdminNavbar />
          </div>
          <div
            className="px-2  md:px-6  transition-all duration-300 min-h-[calc(100vh-180px)] mt-20 sm:mt-[115px]"
            style={{
              marginLeft: isMobile ? '0' : sidebarWidth,
            }}
          >
            <Outlet />
          </div>
          <div
            style={{
              marginLeft: isMobile ? '0' : sidebarWidth,
            }}
            className="mt-auto"
          >
            {/* Footer - Responsive */}
            <HomeFooter className="bg-[#f7f7f7] text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};
