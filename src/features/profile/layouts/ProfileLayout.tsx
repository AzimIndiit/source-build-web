import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { ProfileSidebar, ProfileSidebarToggle } from '../components/ProfileSidebar';
import { Footer } from '@/components/common/Footer';

export const ProfileLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Dynamically determine the active section based on the current path
  const getActiveSection = (path: string) => {
    // If path is exactly "/profile" or "/profile/", return "profile"
    if (/^\/profile\/?$/.test(path)) return 'profile';
    // If path is "/profile/my-earnings" or starts with it, return "my-earnings"
    if (/^\/profile\/my-earnings(\/|$)/.test(path)) return 'my-earnings';
    // Otherwise, extract the section after "/profile/"
    const match = path.match(/^\/profile\/([^/]+)/);
    return match ? match[1] : 'profile';
  };

  const activeSection = getActiveSection(pathname);

  const handleSectionChange = (section: string) => {
    if (section === 'profile') {
      navigate('/profile');
    } else {
      navigate(`/profile/${section}`);
    }
    // Close mobile sidebar when a section is selected
    setIsMobileSidebarOpen(false);
  };

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
      // Close mobile sidebar on resize to desktop
      if (width >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic sidebar width based on collapse state
  const sidebarWidth = isSidebarCollapsed ? '80px' : '336px';

  return (
    <div className="relative size-full min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex pt-[60px]">
        {/* Desktop/Tablet Sidebar */}
        <div className="hidden md:block fixed left-0 z-40">
          <ProfileSidebar
            activeItem={activeSection}
            onItemClick={handleSectionChange}
            isCollapsed={isSidebarCollapsed}
            onCollapsedChange={setIsSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar - Only render on mobile */}
        {isMobile && (
          <>
            <ProfileSidebar
              isOpen={isMobileSidebarOpen}
              onClose={() => setIsMobileSidebarOpen(false)}
              isMobile={true}
            />
            <ProfileSidebarToggle onClick={() => setIsMobileSidebarOpen(true)} />
          </>
        )}

        {/* Content Area */}
        <div className="flex-1 min-h-[700px] md:min-h-[890px]  lg:min-h-[780px] xl:min-h-[89vh]">
          <div
            className=" px-4 pt-12 md:px-6 md:pt-6 transition-all duration-300"
            style={{
              marginLeft: isMobile ? '0' : sidebarWidth,
            }}
          >
            <Outlet />
          </div>
        </div>
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
  );
};
