import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/Card';
import { CabinetProduct } from '../types';

interface CabinetProductCardProps {
  product: CabinetProduct;
  onShopNow: (product: CabinetProduct) => void;
  className?: string;
}

const CabinetProductCard: React.FC<CabinetProductCardProps> = ({
  product,
  onShopNow,
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Status Badges */}
        <div className="absolute top-2 right-2 z-21 space-y-1">
          {product.isNew && (
            <div className="flex justify-center items-center text-sm mt-1 rounded-full bg-red-500 text-white font-semibold h-12 w-12">
              NEW
            </div>
          )}
        </div>

        {/* Product Image Container */}
        <div className="relative aspect-square rounded-sm bg-white">
          {!product.available && (
            <div className="absolute inset-0 bg-black/40 rounded-sm flex flex-col items-center justify-end z-20">
              <div className="bg-gray-200/90 shadow-md rounded-sm text-red-500 mb-2 p-2">
                Not Available
              </div>
            </div>
          )}

          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover rounded-sm ${
              !product.available ? 'opacity-60' : ''
            }`}
          />
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-lg text-center">{product.name}</h3>
          <Button
            variant="default"
            className="w-full h-[49px] text-white"
            onClick={() => onShopNow(product)}
          >
            Shop Now
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default CabinetProductCard;
