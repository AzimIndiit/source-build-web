import React from 'react';

export const SearchResultSkeleton: React.FC = () => {
  return (
    <div className="space-y-1">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="w-full flex items-center gap-3 px-3 py-2"
        >
          <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const RecentSearchesSkeleton: React.FC = () => {
  return (
    <div className="space-y-1">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="w-full flex items-center gap-3 px-3 py-2"
        >
          <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CategoriesSkeleton: React.FC = () => {
  return (
    <div className="space-y-1">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="w-full flex items-center gap-3 px-3 py-2"
        >
          <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const PopularProductsSkeleton: React.FC = () => {
  return (
    <div className="space-y-1">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="w-full flex items-center gap-3 px-3 py-2"
        >
          <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};