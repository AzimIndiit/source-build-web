import React, { useState } from 'react';
import { MapPin, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/Card';
import FilterDropdown from '@/components/ui/FilterDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuLabel, DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';

interface Product {
  id: string;
  title: string;
  price: number;
  unit: string;
  category: string;
  dimensions: string;
  location: string;
  date: string;
  image: string;
  inStock: boolean;
  slug: string;
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState('American Fork, UT');
  const [activeFilters, setActiveFilters] = useState<any>({});

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters);
    console.log('Applied filters:', filters);
    // Here you would typically filter the products based on the selected filters
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    console.log('Cleared all filters');
    // Here you would typically reset the products to show all
  };

  const handleProductClick = (product: Product) => {
    navigate(`/seller/products/${product.slug}`);
  };

  // Sample product data matching the Figma design
  const products: Product[] = [
    {
      id: '1',
      title: 'Interior Essentials & Appliances',
      price: 250,
      unit: 'per sq ft',
      category: 'Interior Essentials & Appliances',
      dimensions: '% 11-1/4"x8\' Particle board for...',
      location: 'Draper, UT',
      date: '22/01/2025',
      image: 'https://placehold.co/300x200.png',
      inStock: true,
      slug: 'interior-essentials-appliances',
    },
    {
      id: '2',
      title: 'Interior Essentials & Appliances',
      price: 250,
      unit: 'per sq ft',
      category: 'Interior Essentials & Appliances',
      dimensions: '% 11-1/4"x8\' Particle board for...',
      location: 'Draper, UT',
      date: '20/01/2025',
      image: 'https://placehold.co/300x200.png',
      inStock: true,
      slug: 'interior-essentials-appliances',
    },
    {
      id: '3',
      title: 'Interior Essentials & Appliances',
      price: 250,
      unit: 'per sq ft',
      category: 'Interior Essentials & Appliances',
      dimensions: '% 11-1/4"x8\' Particle board for...',
      location: 'Draper, UT',
      date: '17/01/2025',
      image: 'https://placehold.co/300x200.png',
      inStock: true,
      slug: 'interior-essentials-appliances',
    },
    {
      id: '4',
      title: 'Interior Essentials & Appliances',
      price: 250,
      unit: 'per sq ft',
      category: 'Interior Essentials & Appliances',
      dimensions: '% 11-1/4"x8\' Particle board for...',
      location: 'Draper, UT',
      date: '15/12/2024',
      image: 'https://placehold.co/300x200.png',
      inStock: true,
      slug: 'interior-essentials-appliances',
    },
    {
      id: '5',
      title: 'Interior Essentials & Appliances',
      price: 250,
      unit: 'per sq ft',
      category: 'Interior Essentials & Appliances',
      dimensions: '% 11-1/4"x8\' Particle board for...',
      location: 'Draper, UT',
      date: '18/12/2024',
      image: 'https://placehold.co/300x200.png',
      inStock: true,
      slug: 'interior-essentials-appliances',
    },
    {
      id: '6',
      title: 'Interior Essentials & Appliances',
      price: 50,
      unit: 'per sq ft',
      category: 'Interior Essentials & Appliances',
      dimensions: '% 11-1/4"x8\' Particle board for...',
      location: 'Draper, UT',
      date: '17/12/2024',
      image: 'https://placehold.co/300x200.png',
      inStock: true,
      slug: 'interior-essentials-appliances',
    },
    {
      id: '7',
      title: 'Interior Essentials & Appliances',
      price: 250,
      unit: 'per sq ft',
      category: 'Interior Essentials & Appliances',
      dimensions: '% 11-1/4"x8\' Particle board for...',
      location: 'Draper, UT',
      date: '16/12/2024',
      image: 'https://placehold.co/300x200.png',
      inStock: true,
      slug: 'interior-essentials-appliances',
    },
    {
      id: '8',
      title: 'Interior Essentials & Appliances',
      price: 250,
      unit: 'per sq ft',
      category: 'Interior Essentials & Appliances',
      dimensions: '% 11-1/4"x8\' Particle board for...',
      location: 'Draper, UT',
      date: '15/12/2024',
      image: 'https://placehold.co/300x200.png',
      inStock: true,
      slug: 'interior-essentials-appliances',
    },
  ];

  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Listing</h1>
        <div className="flex items-center gap-2">
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

          <FilterDropdown onApply={handleApplyFilters} onClear={handleClearFilters} />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden border border-gray-200 rounded-xl hover:shadow-md transition-shadow p-0 cursor-pointer group"
            onClick={() => handleProductClick(product)}
          >
            <div className="relative">
              <img src={product.image} alt={product.title} className="w-full h-40 object-cover" />
              {product.inStock && (
                <Badge className="absolute bottom-2 left-2 bg-primary text-white rounded-sm px-2 py-0.5 text-[11px]">
                  In Stock
                </Badge>
              )}
            </div>
            <CardContent className="p-3">
              {/* Price */}
              <div className="text-[15px] font-semibold mb-1">
                ${product.price} {product.unit}
              </div>

              {/* Title + Dimensions */}
              <p className="text-[13px] text-gray-700 leading-snug line-clamp-2 mb-1">
                {product.title} {product.dimensions}
              </p>

              {/* Location + Date + Actions */}
              <div className="flex items-center justify-between text-[12px] text-gray-500">
                <span>{product.location}</span>
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-primary cursor-pointer">{product.date}</span>
                  <Edit2 className="h-4 w-4 text-primary cursor-pointer hover:text-primary/80" />
                  <Trash2 className="h-4 w-4 text-red-600 cursor-pointer hover:text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <PaginationWrapper currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />
    </div>
  );
};

export default ProductsPage;
