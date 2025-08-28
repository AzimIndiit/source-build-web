import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  ChevronDown,
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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/helpers';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { useLogoutModal } from '@/stores/useLogoutModal';
import { DeleteConfirmationModal } from '../ui';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { openModal, isOpen, closeModal } = useLogoutModal();
  const isAuthenticated = !!user;
  const [isBuyerMode, setIsBuyerMode] = useState(user?.role === 'buyer');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Mock notification counts - replace with actual data from your backend
  const notificationCount = 12; // Example count
  const messageCount = 5; // Example count
  const cartCount = 2; // Example count

  const handleLogoutConfirmation = () => {
    openModal();
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-blue-50 flex gap-2 h-[42px] items-center px-2 md:px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors outline-none">
                  <MapPin className="w-5 h-5 text-gray-700" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs text-gray-600 hidden md:block">American Fork, UT</span>
                    <span className="text-xs md:text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <span className="hidden lg:inline">Update Location</span>
                      <span className="lg:hidden">Location</span>
                      <ChevronDown size={12} />
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Select Location</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">American Fork, UT</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Provo, UT</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Salt Lake City, UT</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-3 lg:gap-8 justify-end items-center ml-4 flex-1">
            {/* Search Bar */}
            <div className="hidden lg:block flex-1 max-w-xl">
              <GlobalSearch />
            </div>

            {/* Search Icon for Tablet */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full w-[42px] h-[42px] bg-gray-100 hover:bg-gray-200"
              onClick={() => setIsMobileSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Right Section - User Actions */}
            {isAuthenticated ? (
              <>
                {/* User Profile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="cursor-pointer">
                    <button className="bg-blue-50 flex gap-2 h-[42px] items-center px-2 lg:px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors outline-none">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gray-400 text-white font-medium top-[2px] relative">
                          {getInitials(user?.displayName || 'Smith')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col text-left">
                        <span className="text-xs text-gray-600">
                          Hello, {user?.displayName || 'Smith'}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
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

                    {user?.role === 'seller' && (
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
                          <span className="flex-1">Switch to Buyer</span>
                          <Switch
                            className={`h-6 w-12 ${isBuyerMode ? 'data-[state=checked]:bg-green-500' : ''}`}
                            checked={isBuyerMode}
                            onCheckedChange={setIsBuyerMode}
                          />
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
                  onClick={() => navigate(`/${user?.role}/messages`)}
                >
                  <MessageCircle className="w-5 h-5" />
                  {messageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-white text-xs">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/${user?.role}/notifications`)}
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
                <Button variant="ghost" asChild className="hidden lg:inline-flex">
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              className="flex gap-2 lg:gap-6 items-center hover:bg-gray-50 p-2 h-auto"
            >
              <div className="relative">
                <ShoppingCart className="!w-[24px] !h-[24px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-sm font-medium">Cart</div>
            </Button>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/logo.svg" alt="Source Build" className="h-8" />
            </Link>

            {/* Mobile Right Section */}
            <div className="flex items-center gap-2">
              {/* Search Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10"
                onClick={() => setIsMobileSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <Button variant="ghost" className="relative p-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute top-2 -right-1 bg-red-500 min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                  2
                </span>
              </Button>

              {/* Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200 bg-white px-4 py-4 space-y-4">
              {/* Location */}
              <button className="w-full bg-blue-50 flex gap-2 items-center px-3 py-2 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-700" />
                <div className="flex-1 flex flex-col text-left">
                  <span className="text-xs text-gray-600">Current Location</span>
                  <span className="text-sm font-semibold text-gray-900">American Fork, UT</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isAuthenticated ? (
                <>
                  {/* User Profile */}

                  <Link to="/profile" className="flex items-center gap-3 py-2">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gray-400 text-white">
                        {getInitials(user?.displayName || 'Smith')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold">{user?.displayName || 'Smith'}</div>
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
                  {user?.role === 'seller' && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">Switch to Buyer</span>
                      <Switch
                        className={`h-6 w-12 ${isBuyerMode ? 'data-[state=checked]:bg-green-500' : ''}`}
                        checked={isBuyerMode}
                        onCheckedChange={setIsBuyerMode}
                      />
                    </div>
                  )}

                  {/* Messages */}
                  <Link
                    to={`/${user?.role}/messages`}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm">Messages</span>
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {messageCount > 9 ? '9+' : messageCount}
                    </div>
                  </Link>

                  {/* Notifications */}
                  <Link
                    to={`/${user?.role}/notifications`}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm">Notifications</span>
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notificationCount > 9 ? '9+' : notificationCount}
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
                  <Button asChild className="w-full">
                    <Link to="/auth/login">Login</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Search Overlay */}
      {isMobileSearchOpen && (
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
        />
      )}
    </>
  );
};
