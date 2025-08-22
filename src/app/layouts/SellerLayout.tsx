import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { SellerSidebar, SellerSidebarToggle } from '@/components/navigation/SellerSidebar';

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
          <div 
            className="flex-1 p-4 pt-8 md:px-6 md:pt-6 transition-all duration-300 min-h-[700px] md:min-h-[890px] lg:min-h-[780px] xl:min-h-[89vh]"
            style={{ 
              marginLeft: isMobile ? '0' : sidebarWidth 
            }}
          >
            <Outlet />
          </div>
      </div>

      {/* Footer - Responsive */}
      <div 
        className="transition-all duration-300"
        style={{ 
          marginLeft: isMobile ? '0' : sidebarWidth 
        }}
      >
        <div className="bg-[#f7f7f7] flex flex-col gap-4 min-h-[56px] items-center justify-center px-4 md:px-12 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-black text-xs md:text-sm w-full max-w-[1100px]">
            <div className="text-center md:text-left">
              <p className="leading-[1.3]">© Copyright 2025. Source Build. All Rights Reserved.</p>
            </div>
            <div className="text-center md:text-right">
              <p className="leading-[1.3] whitespace-pre-wrap">
                <span className="inline-block">Contact Us</span>
                <span className="hidden md:inline"> l </span>
                <span className="md:hidden"> | </span>
                <span className="inline-block">Terms and Conditions</span>
                <span className="hidden md:inline"> l </span>
                <span className="md:hidden"> | </span>
                <span className="inline-block">Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
