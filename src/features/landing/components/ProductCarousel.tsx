import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  image: string;
  price: string;
  priceUnit?: string;
  title: string;
  location: string;
  company: string;
  companyColor?: string;
  deliveryType: 'Same-day delivery' | 'Next-day delivery';
  isFavorite?: boolean;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const itemsPerView = 5;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const getDeliveryBgColor = (deliveryType: string) => {
    return deliveryType === 'Same-day delivery' ? 'bg-blue-600' : 'bg-gray-700';
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>

      <div className="relative">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2',
            'w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center',
            'hover:shadow-xl transition-shadow',
            currentIndex === 0 && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentIndex === maxIndex}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2',
            'w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center',
            'hover:shadow-xl transition-shadow',
            currentIndex === maxIndex && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Products Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out gap-4"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView + 0.8)}%)`,
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0"
                style={{ width: `calc(${100 / itemsPerView}% - 12.8px)` }}
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Heart
                        className={cn(
                          'w-5 h-5',
                          favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        )}
                      />
                    </button>

                    {/* Delivery Badge */}
                    <div
                      className={cn(
                        'absolute bottom-3 left-3 px-3 py-1 rounded-full text-white text-xs font-medium',
                        getDeliveryBgColor(product.deliveryType)
                      )}
                    >
                      {product.deliveryType}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Price */}
                    <div className="mb-2">
                      <span className="text-2xl font-bold">{product.price}</span>
                      {product.priceUnit && (
                        <span className="text-gray-600 text-sm ml-1">{product.priceUnit}</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.title}</h3>

                    {/* Location and Company */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{product.location}</span>
                      <span
                        className="font-medium"
                        style={{ color: product.companyColor || '#3b82f6' }}
                      >
                        {product.company}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;
