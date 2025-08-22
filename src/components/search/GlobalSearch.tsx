import React, { useState, useRef, useEffect } from 'react';
import { Search, Clock, TrendingUp, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SearchItem {
  id: string;
  query: string;
  timestamp: number;
  category?: string;
}

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<SearchItem[]>('recentSearches', []);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    const newSearch: SearchItem = {
      id: Date.now().toString(),
      query: searchQuery,
      timestamp: Date.now(),
    };

    const updatedSearches = [
      newSearch,
      ...recentSearches.filter(s => s.query !== searchQuery)
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    setIsOpen(false);
    console.log('Searching for:', searchQuery);
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    handleSearch(searchQuery);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const categories = [
    { icon: TrendingUp, label: 'Cabinetry', query: 'category:cabinetry' },
    { icon: TrendingUp, label: 'Commercial Doors', query: 'category:doors' },
  ];

  return (
    <div ref={searchRef} className="relative flex-1 max-w-xl">
      <div className="relative flex items-center">
           
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder="Search the marketplace"
           className="pr-10 h-[40px] border-gray-300"
        />
        <Button
          onClick={() => handleSearch()}
          size="sm"
          className="absolute right-0 h-[40px] w-[40px] p-0 rounded-l-none rounded-r-sm bg-primary"
        >
          <Search className="w-5 h-5 text-white" />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleRecentSearchClick(item.query)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700">{item.query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(category.label)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                >
                  <category.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Products</h3>
            <button
              onClick={() => handleRecentSearchClick('particle board shelving')}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
            >
              <Avatar className="w-10 h-10 rounded-md">
                <AvatarFallback className="bg-gray-200 rounded-md">
                  <Package className="w-5 h-5 text-gray-500" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700 line-clamp-1">
                brand new particle board shelving for cabinetry 23 1/4" x 12"
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};