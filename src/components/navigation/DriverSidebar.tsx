import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/helpers';
import { 
  LayoutDashboard, 
  Car, 
  Package, 
  DollarSign,
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DriverSidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { path: '/driver', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/driver/vehicles', icon: Car, label: 'My Vehicles' },
  { path: '/driver/orders', icon: Package, label: 'Orders' },
  { path: '/driver/earnings', icon: DollarSign, label: 'Earnings' },
];

export function DriverSidebar({ open, onClose }: DriverSidebarProps) {
  const location = useLocation();

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 bg-gray-900/80 md:hidden',
          open ? 'block' : 'hidden'
        )}
        onClick={onClose}
      />
      
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold">Driver Portal</span>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
              onClick={onClose}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}