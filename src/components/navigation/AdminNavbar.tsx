import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Menu, X, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/helpers';
import { useLogoutModal } from '@/stores/useLogoutModal';
import { BreadcrumbWrapper, DeleteConfirmationModal } from '../ui';



const breadcrumbNameMap = {
  '/admin/dashboard': 'Dashboard',
  '/admin/messages': 'Messages',
  '/admin/messages/:id': 'Chat Details',
  '/admin/quote': 'Quote',
  '/admin/quote/:id': 'Quote Details',
  '/admin/quote/:id/edit': 'Edit Quote',
  '/admin/categories': 'Categories',
  '/admin/categories/:id/subcategories': 'Subcategories',
};

export function useBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);
  const items = pathnames.map((value, index, filtered) => {
    const to = `/${filtered.slice(0, index + 1).join('/')}`;

    const isId = /^[0-9a-fA-F]{16,24}$/.test(value);

    let label: string;
    if (isId) {
      // look at parent to decide
      const parent = `/${filtered.slice(0, index).join('/')}`;
      console.log('parent', parent===`/admin/categories`)
      if (parent === '/admin/messages') {
        label = 'Chat Details';
      } else if (parent === '/admin/quote') {
        label = 'Quote Details';
      }
      else if (parent === `/admin/categories`) {
        label = 'Subcategories';
      } 
      else {
        label = 'Details'; // fallback
      }
    } else {
      label = breadcrumbNameMap[to as keyof typeof breadcrumbNameMap] || value;
    }
console.log('label', label)
    return {
      label,
      href: index < filtered.length - 1 ? to : undefined,
      isCurrentPage: index === filtered.length - 1,
    };
  });

  return [
    { label: 'Page', href: '/admin/dashboard' },
    ...items.filter((item) => !['admin', 'Subcategories'].includes(item.label )),
  ];
}


export const AdminNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { openModal, isOpen, closeModal } = useLogoutModal();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogoutConfirmation = () => {
    openModal();
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      closeModal(); // Close the modal after logout
      navigate('/admin/auth/login');
    } catch (error) {
      // Even if logout fails, close modal and navigate
      closeModal();
      navigate('/admin/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);



  const breadcrumbItems = [
    ...useBreadcrumbs(),
  ];
console.log('breadcrumbItems', breadcrumbItems)
  return (
    <>
      <div className="bg-white w-full shadow-sm border-b border-gray-200">
        {/* Desktop and Tablet Navbar */}
        <div className="hidden md:flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex gap-4 lg:gap-8 items-center justify-start">
            <BreadcrumbWrapper items={breadcrumbItems} />
          </div>

          <div className="flex gap-3 lg:gap-8 justify-end items-center ml-4 flex-1">
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <button className="bg-blue-50 flex gap-2 h-[42px] items-center px-2 lg:px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors outline-none">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} alt={user?.displayName} />
                    <AvatarFallback className="bg-gray-200 text-gray-500 font-medium top-[2px] relative">
                      {getInitials(user?.displayName || 'Smith')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col text-right items-end justify-end">
                    <span className="text-xs text-gray-600 line-clamp-1 truncate max-w-30">
                      Hello, {user?.displayName || 'Smith'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-1 text-right">
                      Account Profile
                      <ChevronDown size={12} />
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 bg-white">
                <DropdownMenuItem asChild className="cursor-pointer text-sm">
                  <Link to={`/admin/dashboard`} className="flex gap-3 items-center">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gray-200">
                        <LayoutDashboard className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-sm">
                  <Link to="/admin/profile" className="flex gap-3 items-center">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gray-200">
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <span>Manage Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogoutConfirmation}
                  className="cursor-pointer text-sm"
                >
                  <div className="flex gap-3 items-center">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gray-200">
                        <LogOut className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <span>Logout</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden" ref={mobileMenuRef}>
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile Right Section */}
            <div className="flex items-center gap-2">
              {/* Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="!w-6 !h-6" /> : <Menu className="!w-6 !h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200 bg-white px-4 py-4 space-y-4">
              {/* User Profile */}

              <Link to="/admin/profile" className="flex items-center gap-3 py-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.avatar} alt={user?.displayName} />
                  <AvatarFallback className="bg-gray-200 text-white">
                    {getInitials(user?.displayName || 'Smith')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold line-clamp-1 truncate max-w-60">
                    {user?.displayName || 'Smith'}
                  </div>
                  <div className="text-xs text-gray-600">View Profile</div>
                </div>
              </Link>

              <Link to={`/admin/dashboard`} className="flex items-center justify-start py-2">
                <span className="text-sm">Dashbord</span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogoutConfirmation}
                className="w-full text-left text-sm text-red-600 py-2"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}

      {isOpen && (
        <DeleteConfirmationModal
          isOpen={isOpen}
          onClose={closeModal}
          onConfirm={handleLogout}
          title="Logout?"
          description="Are you sure, You want to logout?"
          confirmText="Yes I'm Sure"
          cancelText="Cancel"
          isLoading={isLoggingOut}
        />
      )}
    </>
  );
};
