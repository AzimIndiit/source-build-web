import React, { useState, useEffect } from 'react';
import { Link, To, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  ChevronDown,
  Percent,
  DollarSign,
  Package,
  FolderTree,
  ShoppingCart,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLogoutModal } from '@/stores/useLogoutModal';

const navigationItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
  {
    name: 'User Management',
    href: null,
    icon: Users,
    isExpandable: true,
    subItems: [
      { name: 'Buyers', href: '/admin/buyers' },
      { name: 'Sellers', href: '/admin/sellers' },
      { name: 'Drivers', href: '/admin/drivers' },
    ],
  },
  {
    name: 'Promotions',
    href: null,
    icon: Percent,
    isExpandable: true,
    subItems: [
      { name: 'Coupons', href: '/admin/coupons' },
      { name: 'Banners', href: '/admin/banners' },
      { name: 'Collections', href: '/admin/collections' },
    ],
  },
  { name: 'Quote', href: '/admin/quote', icon: DollarSign },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Pages', href: '/admin/cms', icon: FileText },
  { name: 'Contact Queries', href: '/admin/contact-queries', icon: Users },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Profile Settings', href: '/admin/profile', icon: Settings },
  {
    name: 'Logout',
    href: null,
    icon: LogOut,
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen = true,
  onClose,
  isMobile = false,
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal } = useLogoutModal();
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['User Management']);

  // Use controlled state if provided, otherwise use local state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : localCollapsed;
  const setIsCollapsed = onCollapsedChange || setLocalCollapsed;

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

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'bg-white h-screen flex flex-col border-r border-gray-200 transition-all duration-300',
          isMobile ? 'fixed left-0 top-0 z-50' : 'relative',
          isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0',
          isCollapsed && !isMobile ? 'w-[80px]' : 'w-[260px]'
        )}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-end  px-6  pt-4  bg-primary">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full w-8 h-8 bg-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
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
              className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')}
            />
          </Button>
        )}

        {/* Scrollable Content Area */}
        <div className={cn('flex-1  py-6 bg-primary', !isCollapsed && 'overflow-y-auto')}>
          {/* Logo */}
          <div className="">
            {isCollapsed ? (
              <div className="flex justify-center items-center bg-white rounded-sm  mx-auto p-1 w-full max-w-[50px]">
                <Link to="/admin/dashboard" className="flex items-center   justify-center ">
                  <img src="/favicon.ico" alt="Source Build" className="h-10 w-10  " />
                </Link>
              </div>
            ) : (
              <div className="mt-[-10px]">
                <div className="flex justify-center items-center bg-white p-1 rounded-sm  mx-auto  w-full max-w-[230px]">
                  <Link to="/admin/dashboard" className="flex items-center   justify-center ">
                    <img src="/logo.svg" alt="Source Build" className="h-10 lg:h-12 " />
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 px-3 mt-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedItems.includes(item.name);

              // Check if current item or any sub-item is active
              const isActive = item.href ? location.pathname.includes(item.href) : false;
              const hasActiveSubItem =
                item.subItems?.some((sub) => location.pathname.includes(sub.href)) || false;

              // Handle Logout
              if (item.name === 'Logout') {
                return (
                  <div
                    key={item.name}
                    onClick={() => {
                      if (isMobile && onClose) {
                        onClose();
                      }
                      openModal();
                    }}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg text-sm font-medium transition-all group relative cursor-pointer',
                      'text-white hover:bg-gray-900',
                      isCollapsed && !isMobile && 'justify-center px-2'
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon size={20} className="text-white" />
                    {(!isCollapsed || isMobile) && <span>{item.name}</span>}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && !isMobile && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </div>
                );
              }

              // Handle expandable items
              if (item.isExpandable) {
                return (
                  <div key={item.name}>
                    <div
                      onClick={() => {
                        if (!isCollapsed || isMobile) {
                          setExpandedItems((prev) =>
                            prev.includes(item.name)
                              ? prev.filter((i) => i !== item.name)
                              : [...prev, item.name]
                          );
                        }
                      }}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg text-sm font-medium transition-all group relative cursor-pointer',
                        hasActiveSubItem
                          ? 'bg-gray-900 text-white'
                          : 'text-white hover:bg-gray-900',
                        isCollapsed && !isMobile && 'justify-center px-2'
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon size={20} className="text-white" />
                      {(!isCollapsed || isMobile) && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          <ChevronDown
                            size={16}
                            className={cn(
                              'text-white transition-transform',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        </>
                      )}

                      {/* Tooltip/Dropdown for collapsed state */}
                      {isCollapsed && !isMobile && (
                        <div className="absolute left-full top-0 ml-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                          <div className="relative">
                            {/* Arrow pointing to the menu item */}
                            <div className="absolute -left-2 top-[18px] w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-gray-900"></div>

                            {/* Dropdown container */}
                            <div className="bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden min-w-[200px] border border-gray-800">
                              {/* Header */}
                              <div className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                                <div className="flex items-center gap-2">
                                  <Icon size={16} className="text-white/80" />
                                  <span className="font-semibold text-sm">{item.name}</span>
                                </div>
                              </div>

                              {/* Sub-items */}
                              {item.subItems && item.subItems.length > 0 && (
                                <div className="p-1">
                                  {item.subItems.map((subItem) => {
                                    const isSubActive = location.pathname.includes(subItem.href);
                                    return (
                                      <Link
                                        key={subItem.name}
                                        to={subItem.href}
                                        onClick={() => {
                                          if (isMobile && onClose) {
                                            onClose();
                                          }
                                        }}
                                        className={cn(
                                          'block px-4 py-2.5 text-sm rounded-smtransition-all duration-150',
                                          isSubActive
                                            ? 'bg-primary text-white font-medium'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:pl-5'
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          {subItem.name}
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Empty state for items with no sub-items */}
                              {(!item.subItems || item.subItems.length === 0) && (
                                <div className="px-4 py-3 text-gray-500 text-xs italic">
                                  No items available
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sub-items */}
                    {isExpanded &&
                      (!isCollapsed || isMobile) &&
                      item.subItems &&
                      item.subItems.length > 0 && (
                        <div className="ml-8 mt-1 flex flex-col gap-1">
                          {item.subItems.map((subItem) => {
                            const isSubActive = location.pathname.includes(subItem.href);
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                onClick={() => {
                                  if (isMobile && onClose) {
                                    onClose();
                                  }
                                }}
                                className={cn(
                                  'p-4 rounded-lg text-sm font-medium transition-all',
                                  isSubActive
                                    ? 'bg-gray-900 text-white'
                                    : 'text-white/80 hover:text-white hover:bg-gray-800'
                                )}
                              >
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                  </div>
                );
              }

              // Regular menu items
              return (
                <Link
                  key={item.name}
                  to={item.href as To}
                  onClick={() => {
                    if (isMobile && onClose) {
                      onClose();
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg text-sm font-medium transition-all group relative',
                    isActive ? 'bg-gray-900 text-white' : 'text-white hover:bg-gray-900',
                    isCollapsed && !isMobile && 'justify-center px-2'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon size={20} className="text-white" />
                  {(!isCollapsed || isMobile) && <span>{item.name}</span>}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

// Mobile Sidebar Toggle Button
export const AdminSidebarToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => {
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
