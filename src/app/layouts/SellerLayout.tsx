import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { SellerSidebar, SellerSidebarToggle } from '@/components/navigation/SellerSidebar';
import { Footer } from '@/components/common/Footer';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export const SellerLayout: React.FC = () => {
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
    <div className=" relative size-full min-h-screen">
      <ScrollToTop />
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      {/* Main Content */}
      <div className="flex pt-[60px]">
        {/* Desktop/Tablet Sidebar */}
        <div className="hidden md:block fixed left-0 z-40">
          <SellerSidebar
            isCollapsed={isSidebarCollapsed}
            onCollapsedChange={setIsSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar - Only render on mobile */}
        {isMobile && (
          <>
            <SellerSidebar
              isOpen={isMobileSidebarOpen}
              onClose={() => setIsMobileSidebarOpen(false)}
              isMobile={true}
            />
            <SellerSidebarToggle onClick={() => setIsMobileSidebarOpen(true)} />
          </>
        )}

        {/* Content Area */}
        <div className="flex-1">
          <div
            className="  md:px-6  transition-all duration-300 min-h-[calc(100vh-150px)] mt-3 "
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
          >
            {/* Footer - Responsive */}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};
