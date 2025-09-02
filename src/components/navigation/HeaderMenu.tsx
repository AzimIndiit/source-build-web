import { Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
  'All',
  'Commercial Doors',
  'Commercial Building Supplies',
  'Cabinetry',
  'Ceiling Fans',
  'Door Frames',
  'Doors',
  'Carpets',
  'Windows',
  'Hardwood',
  'Flooring',
  'LVP',
  'Tiles',
];

export function HeaderMenu() {
  const [selectedItem, setSelectedItem] = useState('All');

  return (
    <nav
      className="border-b border-gray-200"
      style={{
        background: 'linear-gradient(to right, #A0D7FF 0%, #B9DFFE 50%, #E0EFFE 100%)',
      }}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12 overflow-x-auto scrollbar-hide">
          <button className="flex-shrink-0 p-2 hover:bg-white/30 rounded-md transition-colors cursor-pointer">
            <Menu className="h-5 w-5 text-gray-700" />
          </button>

          <div className="flex items-center ml-4 space-x-1">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors rounded-md cursor-pointer',
                  selectedItem === item
                    ? 'bg-white/40 text-gray-900'
                    : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HeaderMenu;
