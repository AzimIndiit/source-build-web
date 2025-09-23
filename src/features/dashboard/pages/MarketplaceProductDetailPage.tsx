import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Heart, Edit2, MapPin, Package, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReadMore from '@/components/ui/ReadMore';
import { BreadcrumbWrapper } from '@/components/ui';
import { ReviewCard, type ReviewData } from '@/components/ui/ReviewCard';
import { ReviewCardSkeleton } from '@/components/ui/ReviewCardSkeleton';
import { StarRating } from '@/components/common/StarRating';
import { MarketplaceProductDetailPageSkeleton } from '../components/MarketplaceProductDetailPageSkeleton';
import { useQueries } from '@tanstack/react-query';
import { productService } from '@/features/products/services/productService';
import { reviewService } from '@/features/reviews/services/reviewService';
import LazyImage from '@/components/common/LazyImage';
import useCartStore from '@/stores/cartStore';
import { motion } from 'framer-motion';
import { cn } from '@/lib/helpers';
import { useAddToWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/useWishlist';
import ReviewModal from '@/features/reviews/components/ReviewModal';
import { useAuth } from '@/hooks/useAuth';
import { getReadyByDate } from '../components/ProductCard';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import toast from 'react-hot-toast';
import { getColorName } from '@/utils/colorUtils';
import { formatPickupHoursDisplay } from '@/features/products/pages/ProductDetailsPage';
import { CustomerDetailsSection } from '@/features/orders/components';

const MarketplaceProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // First fetch the product
  const productQuery = useQueries({
    queries: [
      {
        queryKey: ['product', slug],
        queryFn: () => productService.getProductBySlug(slug || ''),
        enabled: !!slug,
      },
    ],
  })[0];

  // Extract product data
  const product: any = productQuery.data?.data;
  const productId = product?.id || product?._id || '';

  // Then fetch related products and reviews in parallel once we have the product ID
  const dependentQueries = useQueries({
    queries: [
      {
        queryKey: ['related-products', productId],
        queryFn: () => productService.getRelatedProducts(productId, 4),
        enabled: !!productId,
      },
      {
        queryKey: ['product-reviews', productId],
        queryFn: () => reviewService.getProductReviews(productId),
        enabled: !!productId,
      },
    ],
  });

  const [relatedProductsQuery, reviewsQuery] = dependentQueries;

  // Extract loading states and data
  const isLoading = productQuery.isLoading;
  const error = productQuery.error;
  const relatedProductsResponse = relatedProductsQuery.data;
  const isLoadingRelated = relatedProductsQuery.isLoading;
  const reviewsResponse = reviewsQuery.data;
  const isLoadingReviews = reviewsQuery.isLoading;

  // Wishlist functionality
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  // Use local state for optimistic UI updates
  const [optimisticWishlist, setOptimisticWishlist] = useState(product?.isInWishlist || false);
  const isWishlistLoading = addToWishlist.isPending || removeFromWishlist.isPending;

  // Sync with product prop when it changes
  useEffect(() => {
    setOptimisticWishlist(product?.isInWishlist || false);
  }, [product?.isInWishlist]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    if (!isWishlistLoading && productId) {
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

  // Get current images based on selected variant
  const currentImages =
    selectedVariant?.images?.length > 0 ? selectedVariant.images : product?.images || [];

  // Reset image index and quantity when variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1); // Reset quantity to 1 when variant changes
  }, [selectedVariant]);

  // Get reviews from API response
  const reviews: ReviewData[] =
    reviewsResponse?.data?.reviews?.map((review: any) => ({
      id: review._id || review.id,
      userName:
        `${review.reviewer?.firstName || ''} ${review.reviewer?.lastName || ''}`.trim() ||
        'Anonymous',
      date: new Date(review.createdAt),
      rating: review.rating,
      comment: review.comment,
      avatar:
        review.reviewer?.profile?.avatar ||
        `https://placehold.co/50x50/FF6B6B/ffffff?text=${(review.reviewer?.firstName?.[0] || 'A').toUpperCase()}${(review.reviewer?.lastName?.[0] || '').toUpperCase()}`,
      helpfulCount: review.helpfulCount,
      response: review.response,
    })) || [];

  // Auto-scroll selected thumbnail into view
  useEffect(() => {
    const selectedThumbnail = thumbnailRefs.current[selectedImageIndex];
    const container = thumbnailContainerRef.current;

    if (selectedThumbnail && container) {
      const containerRect = container.getBoundingClientRect();
      const thumbnailRect = selectedThumbnail.getBoundingClientRect();

      // Check if thumbnail is not fully visible
      if (thumbnailRect.left < containerRect.left || thumbnailRect.right > containerRect.right) {
        selectedThumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedImageIndex]);

  const handlePreviousImage = () => {
    if (!currentImages.length) return;
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : currentImages.length - 1));
  };

  const handleNextImage = () => {
    if (!currentImages.length) return;
    setSelectedImageIndex((prev) => (prev < currentImages.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleQuantityChange = (increment: boolean) => {
    const currentQuantity = selectedVariant
      ? selectedVariant?.outOfStock
        ? 0
        : selectedVariant?.quantity
      : product?.outOfStock
        ? 0
        : product?.quantity || 0;

    if (increment) {
      if (quantity < currentQuantity) {
        setQuantity(quantity + 1);
      }
    } else {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    }
  };

  const { addItem: addToCart } = useCartStore();

  const handleAddToCart = (directCheckout = false) => {
    if (!product) return;

    // Calculate the base price (from variant or product)
    const basePrice = selectedVariant?.price || product.price || 0;

    // Get discount info (from variant or product)
    const discountInfo = selectedVariant?.discount || product.discount;

    // Calculate the discounted price
    let currentPrice = basePrice;
    if (discountInfo && discountInfo.discountType !== 'none' && discountInfo.discountValue) {
      if (discountInfo.discountType === 'flat') {
        currentPrice = Math.max(0, basePrice - discountInfo.discountValue);
      } else if (discountInfo.discountType === 'percentage') {
        currentPrice = basePrice * (1 - discountInfo.discountValue / 100);
      }
    }

    const currentQuantity = selectedVariant
      ? selectedVariant?.outOfStock
        ? 0
        : selectedVariant?.quantity
      : product?.outOfStock
        ? 0
        : product?.quantity || 0;

    // Determine the actual color being added (from variant or base product)
    const actualColor = selectedVariant?.color || product.color;

    // Include color name in title if available
    const colorName = actualColor ? getColorName(actualColor).name : '';
    const variantSuffix = colorName ? ` - ${colorName}` : '';
    const cartItemTitle = `${product.title}${variantSuffix}`;

    // For "Buy Now" - navigate directly to checkout with product data
    if (directCheckout) {
      // Check if user is logged in for checkout
      if (!user) {
        navigate('/auth/login', {
          state: {
            from: { pathname: '/checkout' },
            buyNowItem: {
              productId: product.id || '',
              variantId: (selectedVariant && (selectedVariant?._id || selectedVariant?.id)) || '',
              title: cartItemTitle,
              slug: product.slug,
              price: currentPrice,
              originalPrice: basePrice,
              discount: discountInfo,
              quantity: quantity,
              image: currentImages[0] || 'https://placehold.co/300x200.png',
              color: actualColor,
              seller: (product.seller as any)?.profile?.businessName
                ? {
                    id: (product.seller as any)?._id || '',
                    businessName: (product.seller as any).profile.businessName,
                  }
                : undefined,
              maxQuantity: currentQuantity,
              selectedOptions: selectedVariant
                ? {
                    color: selectedVariant.color,
                  }
                : product.color
                  ? {
                      color: product.color,
                    }
                  : undefined,
            },
          },
        });
        return;
      }

      // Navigate to checkout with the buy now item (not adding to cart)
      navigate('/checkout', {
        state: {
          buyNowItem: {
            id: `${product.id}-${selectedVariant?.id || 'base'}-${Date.now()}`, // Unique ID for this buy now item
            productId: product.id || '',
            variantId: (selectedVariant && (selectedVariant?._id || selectedVariant?.id)) || '',
            title: cartItemTitle,
            slug: product.slug,
            price: currentPrice,
            originalPrice: basePrice,
            discount: discountInfo,
            quantity: quantity,
            image: currentImages[0] || 'https://placehold.co/300x200.png',
            color: actualColor,
            seller: (product.seller as any)?.profile?.businessName
              ? {
                  id: (product.seller as any)?._id || '',
                  businessName: (product.seller as any).profile.businessName,
                }
              : undefined,
            maxQuantity: currentQuantity,
            marketplaceOptions: product.marketplaceOptions,
            shippingPrice: product.shippingPrice,
            selectedOptions: selectedVariant
              ? {
                  color: selectedVariant.color,
                }
              : product.color
                ? {
                    color: product.color,
                  }
                : undefined,
          },
        },
      });
      return;
    }

    // For "Add to Cart" - add to cart store
    // Extract variant ID - use color as identifier if no ID exists
    const variantId = selectedVariant
      ? selectedVariant._id || selectedVariant.id || selectedVariant.color || ''
      : '';

    console.log('Adding to cart with:', {
      productId: product.id,
      variantId,
      selectedVariant,
      color: actualColor,
    });

    addToCart({
      productId: product.id || '',
      variantId: variantId,
      title: cartItemTitle,
      slug: product.slug,
      price: currentPrice,
      originalPrice: basePrice, // Include original price for display
      discount: discountInfo, // Include discount information
      quantity: quantity,
      image: currentImages[0] || 'https://placehold.co/300x200.png',
      color: actualColor,
      seller: (product.seller as any)?.profile?.businessName
        ? {
            id: (product.seller as any)?._id || '',
            businessName: (product.seller as any).profile.businessName,
          }
        : undefined,
      maxQuantity: currentQuantity,
      marketplaceOptions: product.marketplaceOptions,
      shippingPrice: product.shippingPrice,
      selectedOptions: selectedVariant
        ? {
            color: selectedVariant.color,
          }
        : product.color
          ? {
              color: product.color,
            }
          : undefined,
    });
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: product?.title || 'Product', isCurrentPage: true },
  ];

  // Handle loading state
  if (isLoading) {
    return <MarketplaceProductDetailPageSkeleton />;
  }

  // Handle error state
  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load product</p>
          <Button onClick={() => navigate('/seller/products')} variant="outline">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="">
        <BreadcrumbWrapper items={breadcrumbItems} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Left Column - Image Gallery */}
        <div className="space-y-3 sm:space-y-4">
          {/* Main Image Display */}
          <div className="rounded-md relative">
            <div className="w-full absolute bottom-2 left-2 z-10 justify-end">
              {getReadyByDate(product)}
            </div>
            {/* Wishlist Button */}
            <motion.button
              className="absolute top-2 right-2 rounded-full bg-black/20 backdrop-blur-sm p-2 transition-all duration-200 hover:bg-black/30 z-10"
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
                    isWishlistLoading && 'opacity-50'
                  )}
                />
              </motion.div>
            </motion.button>
            <LazyImage
              src={
                currentImages[selectedImageIndex] ||
                'https://placehold.co/600x600/e5e7eb/6b7280?text=No+Image'
              }
              alt={product?.title || 'Product image'}
              className="rounded-sm bg-white border-gray-200 shadow-md border"
              wrapperClassName="w-full h-[250px] sm:h-[350px] md:h-[450px] bg-gray-100 rounded-sm"
              fallbackSrc="https://placehold.co/600x600/e5e7eb/6b7280?text=No+Image"
              objectFit="cover"
              showSkeleton={true}
              fadeInDuration={0.3}
              rootMargin="100px"
            />
          </div>

          {/* Thumbnail Carousel */}
          <div className="relative">
            <div className="flex items-center">
              {/* Previous Button */}
              <button
                onClick={handlePreviousImage}
                className="absolute left-0 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </button>

              {/* Thumbnails Container */}
              <div
                ref={thumbnailContainerRef}
                className="flex gap-2 sm:gap-3 overflow-x-auto mx-10 sm:mx-12 md:mx-14 px-1 sm:px-2 scroll-smooth [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {currentImages.map((image: string, index: number) => (
                  <button
                    key={index}
                    ref={(el) => {
                      thumbnailRefs.current[index] = el;
                    }}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 w-[80px] h-[60px cursor-pointer bg-white sm:w-[120px] sm:h-[80px] md:w-[150px] md:h-[100px] lg:w-[180px] lg:h-[120px] rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <LazyImage
                      src={image}
                      alt={`${product?.title} ${index + 1}`}
                      className="rounded-lg  border-gray-200 shadow-md border"
                      wrapperClassName="w-full h-full"
                      fallbackSrc="https://placehold.co/180x120/e5e7eb/6b7280?text=No+Image"
                      objectFit="cover"
                      showSkeleton={true}
                      fadeInDuration={0.2}
                      rootMargin="50px"
                    />
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextImage}
                className="absolute right-0 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Product Information */}
        <div className="space-y-4">
          {/* Product Title */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              {product.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
              {/* Price Section */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {(() => {
                  const currentDiscount = selectedVariant?.discount || product.discount;
                  const currentPrice = selectedVariant?.price || product.price || 0;

                  if (currentDiscount?.discountType !== 'none' && currentDiscount?.discountValue) {
                    if (currentDiscount.discountType === 'percentage') {
                      const discountedPrice =
                        currentPrice * (1 - currentDiscount.discountValue / 100);
                      const priceUnit =
                        product?.priceType === 'sqft'
                          ? '/sq ft'
                          : product?.priceType === 'linear'
                            ? '/linear ft'
                            : product?.priceType === 'pallet'
                              ? '/pallet'
                              : '';
                      return (
                        <>
                          <span className="text-xl sm:text-2xl font-bold text-primary">
                            ${discountedPrice.toFixed(2)}
                            <span className="text-sm">{priceUnit}</span>
                          </span>
                          <span className="text-lg sm:text-xl md:text-2xl text-gray-400 line-through">
                            ${currentPrice.toFixed(2)}
                            <span className="text-sm">{priceUnit}</span>
                          </span>
                          <Badge className="bg-primary text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold">
                            -{currentDiscount.discountValue}%
                          </Badge>
                        </>
                      );
                    }
                    if (currentDiscount.discountType === 'flat') {
                      const discountedPrice = currentPrice - currentDiscount.discountValue;
                      const priceUnit =
                        product?.priceType === 'sqft'
                          ? '/sq ft'
                          : product?.priceType === 'linear'
                            ? '/linear ft'
                            : product?.priceType === 'pallet'
                              ? '/pallet'
                              : '';
                      return (
                        <>
                          <span className="text-xl sm:text-2xl font-bold text-primary">
                            ${discountedPrice.toFixed(2)}
                            <span className="text-sm">{priceUnit}</span>
                          </span>
                          <span className="text-lg sm:text-xl md:text-2xl text-gray-400 line-through">
                            ${currentPrice.toFixed(2)}
                            <span className="text-sm">{priceUnit}</span>
                          </span>
                          <Badge className="bg-primary text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold">
                            -${currentDiscount.discountValue}
                          </Badge>
                        </>
                      );
                    }
                  } else {
                    const priceUnit =
                      product?.priceType === 'sqft'
                        ? '/sq ft'
                        : product?.priceType === 'linear'
                          ? '/linear ft'
                          : product?.priceType === 'pallet'
                            ? '/pallet'
                            : '';
                    return (
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        ${currentPrice.toFixed(2)}
                        <span className="text-sm">{priceUnit}</span>
                      </span>
                    );
                  }
                })()}
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                <span className="text-gray-600">Availability:</span>
                {(() => {
                  const currentQuantity = selectedVariant
                    ? selectedVariant?.outOfStock
                      ? 0
                      : selectedVariant?.quantity
                    : product.outOfStock
                      ? 0
                      : product.quantity || 0;
                  return currentQuantity > 0 ? (
                    <span className="text-green-600 font-medium">
                      In stock ({currentQuantity} available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of stock</span>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Variants if available */}
       {(product.color ||
            (product.variants && product.variants.some((v: any) => !!v.color))) &&   <div className=" flex flex-col sm:hidden border-t border-gray-200 text-xs sm:text-sm text-gray-600 pt-4 sm:pt-6 space-y-2">
            <span className="font-medium">Colors: </span>
            <div className="flex flex-wrap gap-3 mt-2">
              {/* Main Product Option */}

              {product.color && <div
                onClick={() => setSelectedVariant(null)}
                className={`w-12 h-12 rounded-full border-2transition-all cursor-pointer ${
                  selectedVariant === null
                    ? 'border-black bg-primary/5 border-3'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: product.color }}
                title={product.color ? getColorName(product.color).name : ''}
              />}

              {product.variants &&
                product.variants.length > 0 &&
                product.variants .filter((variant: any) => !!variant.color).map((variant: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-12 h-12 rounded-full cursor-pointer transition-all ${
                      selectedVariant === variant
                        ? 'ring-2 ring-black ring-offset-2'
                        : 'ring-1 ring-gray-300 ring-offset-2 hover:ring-gray-400'
                    }`}
                    style={{ backgroundColor: variant.color }}
                    title={variant.color ? getColorName(variant.color).name : ''}
                  />
                ))}
            </div>
          </div>}

          {/* Description */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <ReadMore
              text={product.description || 'No description available'}
              maxLength={200}
              className="text-sm sm:text-base text-gray-700 leading-relaxed"
            />
          </div>

          {/* Categories */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <div className="text-xs sm:text-sm text-gray-600">
              <span className="font-medium">Categories: </span>
              <span className="text-gray-900">
                {typeof product.category === 'object' && product.category
                  ? product.category.name
                  : product.category}
                {product.subCategory && (
                  <>
                    ,{' '}
                    {typeof product.subCategory === 'object' && product.subCategory
                      ? product.subCategory.name
                      : product.subCategory}
                  </>
                )}
              </span>
            </div>
          </div>

             {/* Marketplace Options */}
             {product.marketplaceOptions && (
            <div className="border-t border-gray-200 pt-4">
                 <div className="text-xs sm:text-sm text-gray-600 mb-2">
           <span className="font-medium">
                Delivery Options
              </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product.marketplaceOptions.pickup && (
                  <div className="group relative p-4 border-2 rounded-xl border-gray-200 transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2 transition-transform">
                        <MapPin className="text-green-600 w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Pickup</p>
                      {product.pickupHours && (
                        <div className="w-full">
                          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                            Hours
                          </p>
                          <div className="mx-auto flex flex-col justify-center items-center w-full px-2 ">
                            {formatPickupHoursDisplay(product.pickupHours)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {product.marketplaceOptions.shipping && (
                  <div className="group relative p-4 border-2 rounded-xl border-gray-200 transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 transition-transform">
                        <Package className="text-blue-600 w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Shipping</p>
                      {product.shippingPrice ? (
                        <div className="">
                          <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">
                            Cost
                          </p>
                          <p className="text-base font-bold text-blue-600">
                            ${product.shippingPrice}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Contact for rates</p>
                      )}
                    </div>
                  </div>
                )}

                {product.marketplaceOptions.delivery && (
                  <div className="group relative p-4 border-2 rounded-xl border-gray-200 transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2 transition-transform">
                        <Truck className="text-purple-600 w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Local Delivery</p>
                      
                      {product.localDeliveryFree ? "Free" : product.deliveryDistance ? (
                        <div>
                          <p className="text-xs text-gray-500">Within</p>
                          <p className="text-base font-bold text-purple-600">
                            {product.deliveryDistance} miles
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Local delivery available</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}


          {/* Product Information Grid */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            {/* Brand */}
            {product.brand && (
              <div className=" text-gray-600 flex items-center gap-2">
                <span className="font-medium">Brand: </span>
                <p className="text-sm font-medium">{product.brand}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {product.productTag && product.productTag.length > 0 && (
            <div className="border-t border-gray-200 pt-4 sm:pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2 text-xs sm:text-sm  text-gray-600 flex-col items-center gap-2">
                <span className="font-medium">Tags: </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.productTag.map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-blue-100 capitalize"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Variants if available */}
   {(product.color ||
            (product.variants && product.variants.some((v: any) => !!v.color))) &&       <div className="border-t hidden sm:flex flex-col border-gray-200 text-xs sm:text-sm text-gray-600 pt-4 sm:pt-6 space-y-2 ">
            <span className="font-medium">Colors: </span>
            <div className="flex flex-wrap gap-3 mt-2">
              {/* Main Product Option */}

           {product.color &&   <div
                onClick={() => setSelectedVariant(null)}
                className={`w-12 h-12 rounded-full cursor-pointer transition-all ${
                  selectedVariant === null
                    ? 'ring-2 ring-black ring-offset-2 '
                    : 'ring-1 ring-gray-300 ring-offset-2 hover:ring-gray-400 '
                }`}
                style={{ backgroundColor: product.color }}
                title={product.color ? getColorName(product.color).name : ''}
              />}

              {product.variants &&
                product.variants.length > 0 &&
                product.variants
                .filter((variant: any) => !!variant.color).map((variant: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-12 h-12 rounded-full cursor-pointer transition-all ${
                      selectedVariant === variant
                        ? 'ring-2 ring-black ring-offset-2'
                        : 'ring-1 ring-gray-300 ring-offset-2 hover:ring-gray-400'
                    }`}
                    style={{ backgroundColor: variant.color }}
                    title={variant.color ? getColorName(variant.color).name : ''}
                  />
                ))}
            </div>
          </div>}

          { product.seller && 
            <CustomerDetailsSection
              customerDetails={product.seller}
              title=""
              reviewTitle=""
            />
          }
          {/* Add to Cart Section */}
          <div className="flex items-center gap-4 pt-6">
            {/* Quantity Selector */}
            <div className="flex items-center bg-white shadow rounded-lg overflow-hidden">
              <button
                onClick={() => handleQuantityChange(false)}
                disabled={quantity <= 1}
                className="p-3  hover:bg-gray-200 transition-colors cursor-pointer  disabled:opacity-50 disabled:cursor-not-allowed h-[56px]"
              >
                <Minus className="h-5 w-5 text-gray-600" />
              </button>
              <span className="px-6 py-3 text-lg font-semibold min-w-[60px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(true)}
                disabled={
                  quantity >=
                  (selectedVariant
                    ? selectedVariant?.outOfStock
                      ? 0
                      : selectedVariant?.quantity
                    : product?.outOfStock
                      ? 0
                      : product?.quantity || 0)
                }
                className="p-3 hover:bg-gray-200 transition-colors cursor-pointer  disabled:opacity-50 disabled:cursor-not-allowed h-[56px]"
              >
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Add to Cart / Go to Cart Button */}

            <div className="flex-1 flex gap-2">
              <Button
                onClick={() => handleAddToCart(false)}
                disabled={
                  selectedVariant
                    ? selectedVariant?.outOfStock || selectedVariant?.quantity === 0
                    : product?.outOfStock || product?.quantity === 0
                }
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-base h-[56px] rounded-xl flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                onClick={() => {
                  handleAddToCart(true);
                }}
                disabled={
                  selectedVariant
                    ? selectedVariant?.outOfStock || selectedVariant?.quantity === 0
                    : product?.outOfStock || product?.quantity === 0
                }
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/10 font-semibold py-3 text-base h-[56px] rounded-xl"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {(isLoadingRelated ||
        (relatedProductsResponse?.data && relatedProductsResponse.data.length > 0)) && (
        <div className="mt-8 sm:mt-12 border-t border-gray-200 pt-6 sm:pt-8">
          <div className="">
            {/* Section Header */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Related Products</h2>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
              {isLoadingRelated
                ? // Show skeleton loaders while loading
                  [...Array(8)].map((_, index) => <ProductCardSkeleton key={`skeleton-${index}`} />)
                : // Show actual products when loaded
                  relatedProductsResponse?.data?.slice(0, 8).map((relatedProduct: any) => (
                    <ProductCard
                      key={relatedProduct._id || relatedProduct.id}
                      product={relatedProduct}
                      onProductClick={(slug: string) => {
                        navigate(`/products/${slug}`);
                        // Scroll to top when navigating to new product
                        window.scrollTo(0, 0);
                      }}
                    />
                  ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews & Rating Section */}
      <div className="mt-8 sm:mt-12 border-t border-gray-200 pt-6 sm:pt-8">
        <div className="">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8 flex justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 ">Reviews & Rating</h2>

              {/* Overall Rating */}
              <StarRating
                rating={product?.rating || 0}
                showValue={true}
                totalReviews={product?.totalReviews || 0}
              />
            </div>
            <Button
              variant={'link'}
              leftIcon={Edit2}
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Please login to write a review');
                  navigate('/auth/login');
                  return;
                }
                setIsReviewModalOpen(true);
              }}
              className=" underline text-sm sm:text-base h-[40px]"
            >
              {product?.hasUserReviewed ? 'Edit Review' : 'Write a review'}
            </Button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 sm:space-y-6">
            {isLoadingReviews ? (
              // Show skeleton loaders while loading
              [...Array(3)].map((_, index) => <ReviewCardSkeleton key={`skeleton-${index}`} />)
            ) : reviews.length > 0 ? (
              reviews.map((review: ReviewData) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <div className="text-gray-500 w-full text-center text-lg flex justify-center items-center min-h-[400px]">
                No reviews yet!
              </div>
            )}
          </div>

          {/* View All Button */}
          {reviews.length > 10 && (
            <div className="mt-6 sm:mt-8 text-center">
              <Button
                variant="outline"
                className="px-6 sm:px-8 py-2 text-sm sm:text-base text-primary hover:text-primary/80 underline border-none shadow-none"
              >
                View all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
        }}
        productId={productId}
        existingReview={product?.userReview}
        onSuccess={() => {
          // Refetch reviews after successful submission
          productQuery?.refetch();
          reviewsQuery?.refetch();
        }}
      />
    </div>
  );
};

export default MarketplaceProductDetailPage;
