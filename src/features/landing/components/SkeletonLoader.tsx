import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
}

export const SkeletonSlider: React.FC<SkeletonLoaderProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 rounded-lg" />
    </div>
  );
};

export const SkeletonSmallCard: React.FC<SkeletonLoaderProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg" />
          <div className="flex-1 text-center sm:text-left">
            <div className="h-4 sm:h-5 bg-gray-200 rounded w-24 sm:w-32 mx-auto sm:mx-0 mb-2" />
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 mx-auto sm:mx-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonProductCard: React.FC<SkeletonLoaderProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="aspect-[4/3] bg-gray-200" />
        <div className="p-3 sm:p-4">
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="flex justify-between items-center mt-3 sm:mt-4">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-20 sm:w-24" />
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonSection: React.FC<SkeletonLoaderProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white rounded-lg p-4 sm:p-6">
        <div className="h-6 sm:h-7 md:h-8 bg-gray-200 rounded w-48 sm:w-64 mb-4 sm:mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonProductCard key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const HomePageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 sm:h-20 bg-white shadow-sm animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-32 sm:w-40" />
          <div className="flex gap-3 sm:gap-4">
            <div className="h-8 sm:h-10 bg-gray-200 rounded w-20 sm:w-24" />
            <div className="h-8 sm:h-10 bg-gray-200 rounded w-20 sm:w-24" />
          </div>
        </div>
      </div>

      <SkeletonSlider />

      <div className="relative mt-[-50px] sm:mt-[-100px] lg:mt-[-200px] w-full z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-7xl mx-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonSmallCard key={index} />
          ))}
        </div>
      </div>

      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        <SkeletonSection />
        <SkeletonSection />
      </section>
    </div>
  );
};
