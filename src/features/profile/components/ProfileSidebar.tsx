import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  User,
  DollarSign,
  Building2,
  FileText,
  Shield,
  Phone,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/helpers';
import { Link, useNavigate } from 'react-router';
import { useLogoutModal } from '@/stores/useLogoutModal';
import { useAuth } from '@/hooks/useAuth';

interface ProfileMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
}

interface ProfileSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  isCollapsed?: boolean;
  isMobile?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeItem = 'profile',
  isOpen = true,
  onClose,
  onItemClick,
  isMobile = false,
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : localCollapsed;
  const setIsCollapsed = onCollapsedChange || setLocalCollapsed;
  const { openModal } = useLogoutModal();
  // Only show "Saved Addresses" if user is a SELLER
  const menuItems: ProfileMenuItem[] = [
    {
      id: 'profile',
      label: 'Profile Details',
      icon: <User className="w-5 h-5" />,
      path: '/profile',
    },
    ...(['seller', 'driver'].includes(user?.role || '')
      ? [
          {
            id: 'my-earnings',
            label: 'My Earnings',
            icon: <DollarSign className="w-5 h-5" />,
            path: '/profile/my-earnings',
          },
          {
            id: 'bank',
            label: 'Manage Bank Acccounts',
            icon: <Building2 className="w-5 h-5" />,
            path: '/profile/bank',
          } as ProfileMenuItem,
        ]
      : []),

    // Conditionally add "Saved Addresses" for sellers only
    ...(['seller', 'buyer'].includes(user?.role || '')
      ? [
          {
            id: 'address',
            label: 'Saved Addresses',
            icon: <MapPin className="w-5 h-5" />,
            path: '/profile/address',
          } as ProfileMenuItem,
        ]
      : []),
    ...(['buyer'].includes(user?.role || '')
      ? [
          {
            id: 'cards',
            label: 'Saved Cards',
            icon: <CreditCard className="w-5 h-5" />,
            path: '/profile/cards',
          } as ProfileMenuItem,
        ]
      : []),
    {
      id: 'terms',
      label: 'Terms & Conditions',
      icon: <FileText className="w-5 h-5" />,
      path: '/profile/terms',
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: <Shield className="w-5 h-5" />,
      path: '/profile/privacy',
    },
    {
      id: 'contact-us',
      label: 'Contact Us',
      icon: <Phone className="w-5 h-5" />,
      path: '/profile/contact-us',
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <LogOut className="w-5 h-5" />,
    },
  ];

  // Auto-collapse on tablet only if not controlled
  useEffect(() => {
    if (!isMobile && controlledCollapsed === undefined) {
      const handleResize = () => {
        if (window.innerWidth >= 768 && window.innerWidth < 1024) {
          setLocalCollapsed(true);
        } else if (window.innerWidth >= 1024) {
          setLocalCollapsed(false);
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isMobile, controlledCollapsed]);

  const handleItemClick = (item: ProfileMenuItem) => {
    if (item.id === 'logout') {
      openModal();
    } else if (item.path) {
      // Navigate to the path
      navigate(item.path);
      // Call the onItemClick callback if provided
      onItemClick?.(item.id);
      // Close the mobile sidebar if on mobile
      if (isMobile) {
        onClose?.();
      }
    } else {
      // Just call the callback if no path is defined
      onItemClick?.(item.id);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden " onClick={onClose} />
      )}
      {/* Collapse Toggle Button - Only show on tablet */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'hidden md:flex absolute -right-3 top-8 z-10 rounded-full text-primary hover:text-primary bg-white border shadow-sm w-6 h-6 p-0',
            'hover:bg-gray-100'
          )}
        >
          <ChevronLeft
            className={cn(
              'w-5 h-5 text-gray-600 transition-transform',
              isCollapsed && 'rotate-180'
            )}
          />
        </Button>
      )}
      <Card
        className={cn(
          'p-6 bg-white border-gray-200 shadow-none rounded-none transition-all duration-300 h-[calc(100vh-60px)] overflow-y-auto relative',
          // isCollapsed ? 'w-[80px]' : 'w-[336px]'

          isMobile ? 'fixed left-0 top-0 z-50 h-screen ' : 'relative',
          isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0',
          isCollapsed && !isMobile ? 'w-[80px] p-2 gap-0 ' : 'w-[336px] gap-2'
        )}
      >
        {isMobile && (
          <div className="flex justify-between items-center  border-b border-gray-200 pb-3 ">
            <Link to="/" className="flex items-center">
              <img src="/logo.svg" alt="Source Build" className="h-8 lg:h-10" />
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={cn('  bg-gray-100 rounded-full p-1', 'hover:bg-gray-100')}
            >
              <X
                className={cn(
                  'w-5 h-5 text-gray-600 transition-transform',
                  isCollapsed && 'rotate-180'
                )}
              />
            </Button>
          </div>
        )}
        {/* User Info */}
        <div
          className={cn(
            'flex items-center  border-b border-gray-200 pb-3',
            isCollapsed || isMobile ? 'flex-row gap-2 ' : 'gap-4 pb-6'
          )}
        >
          <Avatar className={cn('', isCollapsed ? 'w-12 h-12 mt-2 ' : 'w-20 h-20')}>
            <AvatarImage src={user?.avatar} alt={user?.displayName} />
            <AvatarFallback className={cn('font-semibold', isCollapsed ? 'text-sm' : 'text-2xl')}>
              <div className="mt-2">{getInitials(user?.displayName || 'Name')}</div>
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2  max-w-40">
                {user?.displayName}
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className={cn('mt-6 space-y-1', isCollapsed || isMobile ? 'mt-3' : 'mt-6')}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors h-[46px] cursor-pointer',
                activeItem === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                isCollapsed && 'justify-center'
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center ',
                    activeItem === item.id
                      ? 'text-primary bg-primary/15'
                      : 'text-gray-400 bg-gray-100'
                  )}
                >
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && (
                <ChevronRight
                  className={cn(
                    'w-4 h-4',
                    activeItem === item.id ? 'text-primary' : 'text-gray-400'
                  )}
                />
              )}
            </button>
          ))}
        </nav>
      </Card>
    </>
  );
};

// Mobile Sidebar Toggle Button
export const ProfileSidebarToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="fixed bottom-4 left-4 z-30 rounded-full w-12 h-12 bg-primary text-white shadow-lg md:hidden hover:bg-primary/90"
    >
      <Menu className="w-6 h-6" />
    </Button>
  );
};
