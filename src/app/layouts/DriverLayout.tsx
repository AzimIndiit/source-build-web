import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/common/Footer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { DriverSidebar, DriverSidebarToggle } from '@/components/navigation/DriverSidebar';

export const DriverLayout: React.FC = () => {
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
          <DriverSidebar
            isCollapsed={isSidebarCollapsed}
            onCollapsedChange={setIsSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar - Only render on mobile */}
        {isMobile && (
          <>
            <DriverSidebar
              isOpen={isMobileSidebarOpen}
              onClose={() => setIsMobileSidebarOpen(false)}
              isMobile={true}
            />
            <DriverSidebarToggle onClick={() => setIsMobileSidebarOpen(true)} />
          </>
        )}

        {/* Content Area */}
        <div className="flex-1">
          <div
            className=" p-4 pt-8 md:px-6 md:pt-6 transition-all duration-300  min-h-[700px] md:min-h-[890px] lg:min-h-[780px] xl:min-h-[89vh]"
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
