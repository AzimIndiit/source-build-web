import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  path: string;
}

const categories: Category[] = [
  { id: '1', name: 'Cabinets', path: '/cabinets-collection' },
  { id: '2', name: 'Countertops', path: '/countertops' },
  { id: '3', name: 'Tiles', path: '/tiles' },
  { id: '4', name: 'Flooring', path: '/flooring' },
  { id: '5', name: 'Hardware', path: '/hardware' },
  { id: '6', name: 'Sinks', path: '/sinks' },
  { id: '7', name: 'Faucets', path: '/faucets' },
];

interface CategoriesNavbarProps {
  className?: string;
}

const CategoriesNavbar: React.FC<CategoriesNavbarProps> = ({ className }) => {
  return (
    <nav className={cn('w-full bg-gray-100 border-b border-gray-200', className)}>
      <div className="container mx-auto px-4">
        <ul className="flex items-center justify-start space-x-8 py-4 overflow-x-auto">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                to={category.path}
                className="text-gray-700 hover:text-primary transition-colors whitespace-nowrap"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default CategoriesNavbar;
