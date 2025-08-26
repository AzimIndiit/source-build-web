import React from 'react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/avatar';
import { 
  User, 
  DollarSign, 
  Building2, 
  FileText, 
  Shield, 
  Phone, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/helpers';

interface ProfileMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface ProfileSidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeItem = 'profile',
  onItemClick,
  user = {
    name: 'Yousef Alaoui',
    email: 'yousefalaoui@gmail.com'
  }
}) => {
  const menuItems: ProfileMenuItem[] = [
    {
      id: 'profile',
      label: 'Profile Details',
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'earnings',
      label: 'My Earnings',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      id: 'bank',
      label: 'Manage Bank Acccounts',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      id: 'terms',
      label: 'Terms & Conditions',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 'contact',
      label: 'Contact Us',
      icon: <Phone className="w-5 h-5" />
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <LogOut className="w-5 h-5" />
    }
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === 'logout') {
      // Handle logout
      console.log('Logout clicked');
    }
    onItemClick?.(itemId);
  };

  return (
    <Card className="p-6 bg-white">
      {/* User Info */}
      <div className="flex flex-col items-center pb-6 border-b border-gray-200">
        <Avatar className="w-20 h-20 mb-3">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-500" />
            </div>
          )}
        </Avatar>
        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      {/* Menu Items */}
      <nav className="mt-6 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors",
              activeItem === item.id
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                activeItem === item.id ? "text-blue-600" : "text-gray-400"
              )}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            <ChevronRight className={cn(
              "w-4 h-4",
              activeItem === item.id ? "text-blue-600" : "text-gray-400"
            )} />
          </button>
        ))}
      </nav>
    </Card>
  );
};