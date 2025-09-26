import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageCircle,
  Bell,
  ShoppingCart,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  LayoutDashboard,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { switchUserRole } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/helpers';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { useLogoutModal } from '@/stores/useLogoutModal';
import { DeleteConfirmationModal } from '../ui';
import { LocationSearch } from '@/components/location/LocationSearch';
import useCartStore from '@/stores/cartStore';
import { useUnreadCountQuery } from '@/features/notifications/hooks/useNotificationMutations';
import { useUnreadMessageCount } from '@/features/messages/hooks/useUnreadMessageCount';
import { useSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';

export const Navbar: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  console.log('user', user);
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal, isOpen, closeModal } = useLogoutModal();
  const { on } = useSocket();
  const isAuthenticated = !!user;

  // Check if current route is messages page
  const isOnMessagesPage =
    location.pathname === `/${user?.role}/messages` ||
    location.pathname.startsWith(`/${user?.role}/messages/`);
  const [isBuyerMode, setIsBuyerMode] = useState(user?.role === 'buyer');
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [localMessageCount, setLocalMessageCount] = useState(0);
  const [chatUnreadCounts, setChatUnreadCounts] = useState<Record<string, number>>({});
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Get real notification count from API (only when authenticated)
  const { data: unreadNotifications } = useUnreadCountQuery(isAuthenticated);
  const notificationCount = unreadNotifications?.data?.count || 0;

  // Get real message count from API (only when authenticated)
  const { unreadCount: initialMessageCount } = useUnreadMessageCount(isAuthenticated);

  // Use local state for message count that can be updated via socket
  const messageCount = localMessageCount || initialMessageCount;

  // Mock count for cart - replace with actual data from your backend
  const cartCount = useCartStore((state) => state.getTotalItems());

  const handleLogoutConfirmation = () => {
    openModal();
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      closeModal(); // Close the modal after logout
      navigate('/');
    } catch (error) {
      // Even if logout fails, close modal and navigate
      closeModal();
      navigate('/');
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

  // Initialize local message count with the initial count from API
  useEffect(() => {
    setLocalMessageCount(initialMessageCount);
  }, [initialMessageCount]);

  // Listen for socket updates to increment/decrement message count
  // Sync isBuyerMode with user role changes
  useEffect(() => {
    setIsBuyerMode(user?.role === 'buyer');
  }, [user?.role]);

  useEffect(() => {
    const handleUpdateUnreadCount = (data: any) => {
      // Check if the event is for the current logged-in user
      if (user?.id && data?.id) {
        // Check if current user is a participant in this chat
        const isParticipant = data?.participants?.some(
          (participant: any) => participant?.id === user?.id || participant?._id === user?.id
        );

        if (!isParticipant) return; // Exit if user is not a participant

        const chatId = data.id;
        const newUserUnreadCount = data?.unreadCounts?.[user.id] || 0;

        // Update the tracking of individual chat unread counts
        setChatUnreadCounts((prev) => {
          const oldCount = prev[chatId] || 0;
          const updatedCounts = { ...prev, [chatId]: newUserUnreadCount };

          // Calculate the difference and update total count
          const difference = newUserUnreadCount - oldCount;
          setLocalMessageCount((prevTotal) => Math.max(0, prevTotal + difference));

          return updatedCounts;
        });

        // Log for debugging
        const senderId = data?.lastMessage?.sender;
        console.log('Socket update:', {
          chatId,
          senderId,
          currentUserId: user?.id,
          newUnreadCount: newUserUnreadCount,
          isParticipant,
        });
      }
    };

    const removeListener = on('update_unread_count', handleUpdateUnreadCount);

    return () => {
      removeListener();
    };
  }, [on, user?.id]);

  const handleSwitchBuyerMode = async (checked: boolean) => {
    // Prevent multiple simultaneous switches
    if (isRoleSwitching) return;

    // Determine the target role based on the switch state
    const targetRole = checked ? 'buyer' : 'seller';

    // Optimistic update - update UI immediately
    setIsBuyerMode(checked);
    setIsRoleSwitching(true);

    // Store the previous role for potential rollback
    const previousRole = user?.role;

    try {
      // Call the API to switch roles
      const response = await switchUserRole(targetRole);

      if (response.success) {
        // Update with the actual user data from response if available

        // Update tokens if provided
        if (response.data?.tokens) {
          localStorage.setItem('access_token', response.data.tokens.accessToken);
          localStorage.setItem('refresh_token', response.data.tokens.refreshToken);
        }

        // Show success message
        toast.success(response.message || `Successfully switched to ${targetRole} mode`);
        // Update the user in the auth store with the response data
        if (response.data?.user) {
          updateUser(response.data.user);
        } else {
          updateUser({ role: targetRole });
        }

        // Navigate based on role
        if (targetRole === 'buyer') {
          // Buyers go to home page
          window.location.href = '/';
        } else {
          // Sellers go to dashboard
          window.location.href = '/seller/dashboard';
        }
      }
    } catch (error: any) {
      // Rollback on error
      setIsBuyerMode(!checked);
      updateUser({ role: previousRole });

      // Show error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        'Failed to switch role. Please try again.';
      toast.error(errorMessage);

      // If it's a profile completion error, optionally navigate to profile page
      if (errorMessage.includes('complete your seller profile')) {
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } finally {
      // Always reset loading state
      setIsRoleSwitching(false);
    }
  };

  return (
    <>
      <div className="bg-white w-full shadow-sm border-b border-gray-200">
        {/* Desktop and Tablet Navbar */}
        <div className="hidden md:flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex gap-4 lg:gap-8 items-center justify-start">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/logo.svg" alt="Source Build" className="h-8 lg:h-10" />
            </Link>

            {/* Location Selector - Visible on tablet and desktop */}
            {isAuthenticated && <LocationSearch variant="navbar" />}
          </div>

          <div className="flex gap-3 lg:gap-8 justify-end items-center ml-4 flex-1">
            {/* Search Bar */}
            {(!isAuthenticated || user?.role === 'buyer') && (
              <div className="hidden lg:block flex-1 max-w-xl">
                <GlobalSearch />
              </div>
            )}

            {/* Right Section - User Actions */}
            {isAuthenticated ? (
              <>
                {/* Search Icon for Tablet */}
                {user?.role === 'buyer' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-full w-[42px] h-[42px] bg-gray-100 hover:bg-gray-200"
                    onClick={() => setIsMobileSearchOpen(true)}
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                )}

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
                      {['seller', 'driver'].includes(user?.role) && (
                        <Link to={`/${user?.role}/dashboard`} className="flex gap-3 items-center">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gray-200">
                              <LayoutDashboard className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <span>Dashboard</span>
                        </Link>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-sm">
                      <Link to="/profile" className="flex gap-3 items-center">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gray-200">
                            <User className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <span>Manage Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    {(user?.role === 'seller' || user?.role === 'buyer') && (
                      <DropdownMenuItem
                        className="cursor-pointer text-sm"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="flex gap-3 items-center w-full">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gray-200">
                              <Settings className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1">
                            {user?.role === 'seller' ? 'Switch to Buyer' : 'Switch to Seller'}
                          </span>
                          <div className="relative">
                            <Switch
                              className={`h-6 w-12 ${isBuyerMode ? 'data-[state=checked]:bg-green-500' : ''}`}
                              checked={isBuyerMode}
                              onCheckedChange={handleSwitchBuyerMode}
                              disabled={isRoleSwitching}
                            />
                            {isRoleSwitching && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    )}

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

                {/* Messages - Hidden on tablet */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex relative rounded-full w-[42px] h-[42px] bg-gray-100 hover:bg-gray-200"
                  onClick={() =>
                    navigate(user?.role === 'buyer' ? '/messages' : `/${user?.role}/messages`)
                  }
                >
                  <MessageCircle className="w-5 h-5" />
                  {messageCount > 0 && !isOnMessagesPage && (
                    <span className="absolute -top-1 -right-1 bg-red-500 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-white text-xs">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    navigate(
                      user?.role === 'buyer' ? '/notifications' : `/${user?.role}/notifications`
                    )
                  }
                  className="relative rounded-full w-[42px] h-[42px] bg-gray-100 hover:bg-gray-200"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-white text-xs">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Button>
              </>
            ) : (
              /* Login/Signup buttons for unauthenticated users */
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild className="hidden md:inline-flex h-10">
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button asChild className="h-10">
                  <Link className="text-white hover:text-white" to="/auth/signup">
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}

            {/* Cart */}
            {(!user || user?.role === 'buyer') && (
              <Button
                variant="ghost"
                className="flex gap-2 lg:gap-6 items-center hover:bg-gray-50 p-2 h-auto"
                onClick={() => {
                  if (!user) {
                    // If not logged in, redirect to login with cart as return location
                    navigate('/auth/login', { state: { from: { pathname: '/cart' } } });
                  } else {
                    // If logged in as buyer, go directly to cart
                    navigate('/cart');
                  }
                }}
              >
                <div className="relative">
                  <ShoppingCart className="!w-[24px] !h-[24px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden lg:block text-sm font-medium">Cart</div>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden" ref={mobileMenuRef}>
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/logo.svg" alt="Source Build" className="h-8" />
            </Link>

            {/* Mobile Right Section */}
            <div className="flex items-center gap-2">
              {/* Search Icon */}
              {user?.role === 'buyer' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-10 h-10"
                  onClick={() => setIsMobileSearchOpen(true)}
                >
                  <Search className="!w-6 !h-6" />
                </Button>
              )}

              {/* Cart */}
              {(!user || user?.role === 'buyer') && (
                <Button variant="ghost" className="relative p-2">
                  <ShoppingCart className="!w-6 !h-6" />
                  <span className="absolute top-2 -right-1 bg-red-500 min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                    2
                  </span>
                </Button>
              )}

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
              {/* Location */}
              {isAuthenticated && <LocationSearch variant="navbar" className="w-full" />}

              {isAuthenticated ? (
                <>
                  {/* User Profile */}

                  <Link to="/profile" className="flex items-center gap-3 py-2">
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
                  {['seller', 'driver'].includes(user?.role) && (
                    <Link
                      to={`/${user?.role}/dashboard`}
                      className="flex items-center justify-start py-2"
                    >
                      <span className="text-sm">Dashbord</span>
                    </Link>
                  )}

                  {/* Switch Mode */}
                  {(user?.role === 'seller' || user?.role === 'buyer') && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">
                        {user?.role === 'seller' ? 'Switch to Buyer' : 'Switch to Seller'}
                      </span>
                      <div className="relative">
                        <Switch
                          className={`h-6 w-12 ${isBuyerMode ? 'data-[state=checked]:bg-green-500' : ''}`}
                          checked={isBuyerMode}
                          onCheckedChange={handleSwitchBuyerMode}
                          disabled={isRoleSwitching}
                        />
                        {isRoleSwitching && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <Link
                    to={user?.role === 'buyer' ? '/messages' : `/${user?.role}/messages`}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm">Messages</span>
                    {!isOnMessagesPage && messageCount > 0 && (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {messageCount > 99 ? '99+' : messageCount}
                      </div>
                    )}
                  </Link>

                  {/* Notifications */}
                  <Link
                    to={user?.role === 'buyer' ? '/notifications' : `/${user?.role}/notifications`}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm">Notifications</span>
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </div>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogoutConfirmation}
                    className="w-full text-left text-sm text-red-600 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-200 "
                  >
                    <Link to="/auth/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full text-white hover:text-white ">
                    <Link to="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Search Overlay */}
      {isMobileSearchOpen && (!isAuthenticated || user?.role === 'buyer') && (
        <div className="fixed inset-0 bg-white z-[60] lg:hidden">
          <div className="flex items-center gap-2 p-4 border-b">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <GlobalSearch />
            </div>
          </div>
        </div>
      )}

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
