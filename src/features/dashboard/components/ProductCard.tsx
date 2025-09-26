import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/Card';
import { cn, formatCurrency } from '@/lib/helpers';
import { Product } from '@/features/products/hooks/useProductMutations';
import { motion } from 'framer-motion';
import LazyImage from '@/components/common/LazyImage';
import { useAddToWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/useWishlist';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface ProductCardProps {
  product: Product & { isInWishlist?: boolean };
  onProductClick: (slug: string, status: string) => void;
}

export const getReadyByDate = (product: Product) => {
  switch (Number(product?.readyByDays)) {
    case 0:
      return (
        <Badge className=" absolute bottom-2 left-2 bg-primary/80 text-white rounded px-2 py-1 text-[11px]">
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
  const { isAuthenticated } = useAuth();
  const productId = product.id || product._id || '';
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  // Use local state for optimistic UI updates
  const [optimisticWishlist, setOptimisticWishlist] = useState(product.isInWishlist || false);
  const isLoading = addToWishlist.isPending || removeFromWishlist.isPending;

  // Sync with product prop when it changes
  useEffect(() => {
    setOptimisticWishlist(product.isInWishlist || false);
  }, [product.isInWishlist]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    if (!isLoading) {
      // Optimistically update the UI immediately
      const newWishlistState = !optimisticWishlist;
      setOptimisticWishlist(newWishlistState);

      // Then perform the actual mutation
      if (newWishlistState) {
        addToWishlist.mutate(
          { productId },
          {
            onError: () => {
              // Revert on error
              setOptimisticWishlist(false);
            },
          }
        );
      } else {
        removeFromWishlist.mutate(
          { productId },
          {
            onError: () => {
              // Revert on error
              setOptimisticWishlist(true);
            },
          }
        );
      }
    }
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
                scale: optimisticWishlist ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-colors duration-200 cursor-pointer',
                  optimisticWishlist
                    ? 'text-red-500 fill-red-500'
                    : 'text-white hover:text-red-400',
                  isLoading && 'opacity-50'
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
              {formatCurrency(product.price)}
              {product.priceType && (
                <span className="text-[12px] font-normal">
                  /{' '}
                  {product.priceType === 'sqft'
                    ? 'sq ft'
                    : product.priceType === 'linear'
                      ? 'linear ft'
                      : 'pallet'}
                </span>
              )}
            </div>
          </div>
          {/* Title + Description */}
          <p className="text-[12px] text-gray-500 line-clamp-1 capitalize">
            {typeof product.category === 'string' ? product.category : product.category?.name}
          </p>
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
