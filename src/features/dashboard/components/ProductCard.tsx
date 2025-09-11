import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/helpers';
import {
  useToggleProductStatusMutation,
  useUpdateProductStockMutation,
} from '@/features/products/hooks/useProductMutations';
import { motion } from 'framer-motion';
import LazyImage from '@/components/common/LazyImage';

interface Variant {
  color: string;
  quantity: number;
  price: number;
  images?: string[];
  outOfStock?: boolean;
}

interface Product {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  outOfStock?: boolean;
  category: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: string[];
  locationIds?: Array<{
    city: string;
    state?: string;
  }>;
  createdAt: string;
  status: string;
  variants?: Variant[];
  seller?: {
    profile?: {
      businessName?: string;
    };
  };
  readyByDays?: string | number;
}

interface ProductCardProps {
  product: Product;
  onProductClick: (slug: string, status: string) => void;
}

const getReadyByDate = (product: Product) => {
  switch (Number(product.readyByDays)) {
    case 0:
      return (
        <Badge className="absolute bottom-2 left-2 bg-primary/80 text-white rounded px-2 py-1 text-[11px]">
          Same Day Delivery
        </Badge>
      );
    case 1:
      return (
        <Badge className="absolute bottom-2 left-2 bg-gray-200 text-gray-800 rounded px-2 py-1 text-[11px]">
          Next Day Delivery
        </Badge>
      );
    default:
      return null;
  }
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const toggleStatusMutation = useToggleProductStatusMutation();
  const productId = product.id || product._id || '';

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsWishlisted(!isWishlisted);
    // TODO: Add API call here to save wishlist state
  };

  // Calculate total stock including main product and variants
  const getTotalStock = () => {
    let totalStock = 0;
    let hasAnyStock = false;
    let isAllOutOfStock = true;

    // Check main product stock
    // Count quantity if not marked as out of stock
    if (!product.outOfStock) {
      isAllOutOfStock = false;
      if (product.quantity > 0) {
        totalStock += product.quantity;
        hasAnyStock = true;
      }
    }

    // Check variants stock
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant) => {
        // Count variant quantity if not marked as out of stock
        if (!variant.outOfStock) {
          isAllOutOfStock = false;
          if (variant.quantity > 0) {
            totalStock += variant.quantity;
            hasAnyStock = true;
          }
        }
      });
    }

    // If everything is marked as out of stock, we have no stock regardless of quantities
    if (isAllOutOfStock) {
      return { totalStock: 0, hasAnyStock: false, isOutOfStock: true };
    }

    // If not all items are marked out of stock, return actual stock status
    return { totalStock, hasAnyStock, isOutOfStock: false };
  };

  const { totalStock, hasAnyStock, isOutOfStock } = getTotalStock();

  const handleToggleStatus = async (checked: boolean) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await toggleStatusMutation.mutateAsync({
        id: productId,
        status: checked ? 'active' : 'inactive',
      });
    } catch (error) {
      console.error('Failed to update product status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getLocationDisplay = (product: Product) => {
    if (product.locationIds && product.locationIds.length > 0) {
      const firstLocation = product.locationIds[0];
      if (typeof firstLocation === 'object' && firstLocation.city) {
        const display = `${firstLocation.city}, ${firstLocation.state || ''}`.trim();
        return display.length > 30 ? display.slice(0, 30) + '...' : display;
      }
    }
    return 'Location not specified';
  };

  const getImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://placehold.co/300x200.png';
  };

  return (
    <>
      <Card
        className={cn(
          'overflow-hidden border-none shadow-none bg-transparent p-0 cursor-pointer group gap-0'
        )}
        onClick={() => onProductClick(product.slug, product.status)}
      >
        <div className="relative">
          <LazyImage
            src={getImageUrl(product)}
            alt={product.title}
            className="rounded-xl"
            wrapperClassName="w-full h-44 bg-gray-100 rounded-xl"
            fallbackSrc="https://placehold.co/300x200.png"
            objectFit="cover"
            showSkeleton={true}
            fadeInDuration={0.3}
            rootMargin="100px"
          />
          <motion.button
            className="absolute top-2 right-2 rounded-full bg-black/20 backdrop-blur-sm p-2 transition-all duration-200 hover:bg-black/30"
            onClick={handleWishlistClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{
                scale: isWishlisted ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-colors duration-200 cursor-pointer',
                  isWishlisted ? 'text-red-500 fill-red-500' : 'text-white hover:text-red-400'
                )}
              />
            </motion.div>
          </motion.button>
          {getReadyByDate(product)}
        </div>
        <CardContent className="p-3 space-y-2">
          <div className="flex justify-between items-center gap-2">
            {/* Price */}
            <div className="text-[16px] font-semibold mb-1">
              {formatPrice(product.price)} / sq ft
            </div>
          </div>
          {/* Title + Description */}
          <p className="text-[12px] text-gray-500 line-clamp-1 capitalize">{product.category}</p>
          <p className="text-[14px] text-gray-700 leading-snug line-clamp-1 mb-1 capitalize">
            {product.title}{' '}
            {product.dimensions
              ? `- ${product.dimensions.length} L x ${product.dimensions.width} W x ${product.dimensions.height} H `
              : ''}{' '}
          </p>

          {/* Location + Date + Actions */}
          <div className="flex justify-between text-[12px] text-gray-500">
            <span className="capitalize">{getLocationDisplay(product)}</span>
            <span className="text-primary capitalize">{product.seller?.profile?.businessName}</span>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ProductCard;
