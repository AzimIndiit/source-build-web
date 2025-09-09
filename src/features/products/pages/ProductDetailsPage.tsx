import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Package, Truck, MapPin, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReadMore from '@/components/ui/ReadMore';
import { BreadcrumbWrapper, DeleteConfirmationModal } from '@/components/ui';
import { ReviewCard, type ReviewData } from '@/components/ui/ReviewCard';
import { StarRating } from '@/components/common/StarRating';
import { ProductDetailsPageSkeleton } from '../components/ProductDetailsPageSkeleton';
import { useProductQuery, useDeleteProductMutation } from '../hooks/useProductMutations';
import toast from 'react-hot-toast';
import { format, parse } from 'date-fns';

// Helper function to parse and format pickup hours
const formatPickupHoursDisplay = (hours: string | object): React.ReactNode => {
  if (!hours) return null;
  
  // If it's an object with day-specific hours
  if (typeof hours === 'object') {
    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayAbbrev: { [key: string]: string } = {
      monday: 'Mon',
      tuesday: 'Tue', 
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };
    
    return (
      <div className="space-y-0.5">
        {daysOrder.map(day => {
          const dayHours = (hours as any)[day];
          if (!dayHours) return null;
          return (
            <div key={day} className="flex gap-2 text-[11px] leading-tight">
              <span className="font-medium text-gray-700 w-7">{dayAbbrev[day]}:</span>
              <span className="text-gray-600">{dayHours.open}-{dayHours.close}</span>
            </div>
          );
        })}
      </div>
    );
  }
  
  // If it's a string, parse it
  if (typeof hours === 'string') {
    // Check if already formatted with days
    if (hours.includes('Mon') || hours.includes('Tue') || hours.includes('Wed')) {
      // Parse the string into structured format
      const dayMap: { [key: string]: string } = {
        'Mon': 'Mon',
        'Tue': 'Tue',
        'Wed': 'Wed',
        'Thu': 'Thu',
        'Fri': 'Fri',
        'Sat': 'Sat',
        'Sun': 'Sun'
      };
      
      // Split by commas to get each day's hours
      const parts = hours.split(',').map(s => s.trim());
      const parsedHours: { day: string; hours: string }[] = [];
      
      parts.forEach(part => {
        // Check each day abbreviation
        for (const [abbrev, displayName] of Object.entries(dayMap)) {
          if (part.includes(abbrev)) {
            // Extract the time portion after the day
            const timeMatch = part.match(new RegExp(`${abbrev}\\s*(.+)`));
            if (timeMatch) {
              parsedHours.push({ day: displayName, hours: timeMatch[1].trim() });
            }
            break;
          }
        }
      });
      
      if (parsedHours.length > 0) {
        return (
          <div className="space-y-0.5">
            {parsedHours.map(({ day, hours: dayHours }) => (
              <div key={day} className="flex gap-2 text-[11px] leading-tight">
                <span className="font-medium text-gray-700 w-7">{day}:</span>
                <span className="text-gray-600">{dayHours}</span>
              </div>
            ))}
          </div>
        );
      }
    }
    
    // If already in 12-hour format (contains AM/PM), return as is
    if (hours.includes('AM') || hours.includes('PM')) {
      return <span className="text-xs text-gray-500">{hours}</span>;
    }
    
    // Convert 24-hour format to 12-hour format
    const formatted = hours.replace(/(\d{1,2}):(\d{2})/g, (match, h, m) => {
      const hour = parseInt(h);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${hour12}:${m} ${period}`;
    });
    
    return <span className="text-xs text-gray-500">{formatted}</span>;
  }
  
  return null;
};

const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  console.log('slug', slug);
  const { data: productResponse, isLoading, error } = useProductQuery(slug || '');
  const deleteProductMutation = useDeleteProductMutation();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Get product data from API response
  const product = productResponse?.data;

  // Get current images based on selected variant
  const currentImages =
    selectedVariant?.images?.length > 0 ? selectedVariant.images : product?.images || [];

  // Reset image index when variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariant]);

  // Sample reviews data
  const reviews: ReviewData[] = [
    {
      id: 1,
      userName: 'Aspen Siphron',
      date: new Date('2025-05-12'),
      rating: 4.9,
      comment:
        "The six lights provide ample brightness while adding a touch of elegance and warmth to any room. Whether you're redecorating or building from scratch, this chandelier is praised for its timeless appeal and reliable performance.",
      avatar: 'https://placehold.co/50x50/FF6B6B/ffffff?text=AS',
    },
    {
      id: 2,
      userName: 'Aspen Siphron',
      date: new Date('2025-05-12'),
      rating: 4.9,
      comment:
        "The six lights provide ample brightness while adding a touch of elegance and warmth to any room. Whether you're redecorating or building from scratch, this chandelier is praised for its timeless appeal and reliable performance.",
      avatar: 'https://placehold.co/50x50/FF6B6B/ffffff?text=AS',
    },
    {
      id: 3,
      userName: 'Aspen Siphron',
      date: new Date('2025-05-12'),
      rating: 4.9,
      comment:
        "The six lights provide ample brightness while adding a touch of elegance and warmth to any room. Whether you're redecorating or building from scratch, this chandelier is praised for its timeless appeal and reliable performance.",
      avatar: 'https://placehold.co/50x50/FF6B6B/ffffff?text=AS',
    },
    {
      id: 4,
      userName: 'Aspen Siphron',
      date: new Date('2025-05-12'),
      rating: 4.9,
      comment:
        "The six lights provide ample brightness while adding a touch of elegance and warmth to any room. Whether you're redecorating or building from scratch, this chandelier is praised for its timeless appeal and reliable performance.",
      avatar: 'https://placehold.co/50x50/FF6B6B/ffffff?text=AS',
    },
  ];

  const reviewst: ReviewData[] = [];

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

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!product?.id) return;

    try {
      await deleteProductMutation.mutateAsync(product.id);
      setIsDeleteModalOpen(false);
      navigate('/seller/products');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'MyListing', href: '/seller/products' },
    { label: product?.title || 'Product', isCurrentPage: true },
  ];

  // Handle loading state
  if (isLoading) {
    return <ProductDetailsPageSkeleton />;
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

  console.log('selectedVariant', selectedVariant)

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
          <div className="rounded-md">
            <img
              src={
                currentImages[selectedImageIndex] ||
                'https://placehold.co/600x600/e5e7eb/6b7280?text=No+Image'
              }
              alt={product?.title || 'Product image'}
              className="w-full h-[250px] sm:h-[350px] md:h-[700px] object-cover rounded-sm"
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
                    className={`flex-shrink-0 w-[80px] h-[60px] sm:w-[120px] sm:h-[80px] md:w-[150px] md:h-[100px] lg:w-[180px] lg:h-[120px] rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product?.title} ${index + 1}`}
                      className="w-full h-full object-cover"
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
                      const discountedPrice = currentPrice * (1 - currentDiscount.discountValue / 100);
                      return (
                        <>
                          <span className="text-xl sm:text-2xl font-bold text-primary">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-lg sm:text-xl md:text-2xl text-gray-400 line-through">
                            ${currentPrice.toFixed(2)}
                          </span>
                          <Badge className="bg-primary text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold">
                            -{currentDiscount.discountValue}%
                          </Badge>
                        </>
                      );
                    }
                    if (currentDiscount.discountType === 'flat') {
                      const discountedPrice = currentPrice - currentDiscount.discountValue;
                      return (
                        <>
                          <span className="text-xl sm:text-2xl font-bold text-primary">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-lg sm:text-xl md:text-2xl text-gray-400 line-through">
                            ${currentPrice.toFixed(2)}
                          </span>
                          <Badge className="bg-primary text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold">
                            -${currentDiscount.discountValue}
                          </Badge>
                        </>
                      );
                    }
                  } else {
                    return (
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        ${currentPrice.toFixed(2)}
                      </span>
                    );
                  }
                })()}
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                <span className="text-gray-600">Availability:</span>
                {(() => {
                  const currentQuantity =selectedVariant ? selectedVariant?.quantity : product.quantity || 0;
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
          <div className=" flex flex-col sm:hidden border-t border-gray-200 text-xs sm:text-sm text-gray-600 pt-4 sm:pt-6 space-y-2">
            <span className="font-medium">Colors: </span>
            <div className="flex flex-wrap gap-3 mt-2">
              {/* Main Product Option */}

              <div
                onClick={() => setSelectedVariant(null)}
                className={`w-12 h-12 rounded-full border-2transition-all cursor-pointer ${
                  selectedVariant === null
                    ? 'border-black bg-primary/5 border-3'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: product.color }}
              />

              {product.variants &&
                product.variants.length > 0 &&
                product.variants.map((variant: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-12 h-12 rounded-full cursor-pointer transition-all ${
                      selectedVariant === variant
                        ? 'ring-2 ring-black ring-offset-2'
                        : 'ring-1 ring-gray-300 ring-offset-2 hover:ring-gray-400'
                    }`}
                    style={{ backgroundColor: variant.color }}
                  />
                ))}
            </div>
          </div>

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
                {product.category}, {product.subCategory}
              </span>
            </div>
          </div>

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
          <div className="border-t hidden sm:flex flex-col border-gray-200 text-xs sm:text-sm text-gray-600 pt-4 sm:pt-6 space-y-2 ">
            <span className="font-medium">Colors: </span>
            <div className="flex flex-wrap gap-3 mt-2">
              {/* Main Product Option */}

              <div
                onClick={() => setSelectedVariant(null)}
                className={`w-12 h-12 rounded-full cursor-pointer transition-all ${
                  selectedVariant === null
                    ? 'ring-2 ring-black ring-offset-2 '
                    : 'ring-1 ring-gray-300 ring-offset-2 hover:ring-gray-400 '
                }`}
                style={{ backgroundColor: product.color }}
              />

              {product.variants &&
                product.variants.length > 0 &&
                product.variants.map((variant: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-12 h-12 rounded-full cursor-pointer transition-all ${
                      selectedVariant === variant
                        ? 'ring-2 ring-black ring-offset-2'
                        : 'ring-1 ring-gray-300 ring-offset-2 hover:ring-gray-400'
                    }`}
                    style={{ backgroundColor: variant.color }}
                  />
                ))}
            </div>
          </div>

          {/* Marketplace Options */}
          {product.marketplaceOptions && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Delivery Options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product.marketplaceOptions.pickup && (
                  <div className="group relative p-4 border-2 rounded-xl border-gray-200 transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                    {/* Icon and content */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2 transition-transform">
                        <MapPin className="text-green-600 w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Pickup</p>
                      {product.pickupHours && (
                        <div className="w-full">
                          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Hours</p>
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
                    {/* Icon and content */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 transition-transform">
                        <Package className="text-blue-600 w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Shipping</p>
                      {product.shippingPrice ? (
                        <div className="">
                          <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">Cost</p>
                          <p className="text-base font-bold text-blue-600">${product.shippingPrice}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Contact for rates</p>
                      )}
                    </div>
                  </div>
                )}
                
                {product.marketplaceOptions.delivery && (
                  <div className="group relative p-4 border-2 rounded-xl border-gray-200 transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                    {/* Icon and content */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2 transition-transform">
                        <Truck className="text-purple-600 w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Delivery</p>
                      <p className="text-xs text-gray-500">Local delivery available</p>
                    </div>
                  </div>
                )}
              </div>

              {(product.readyByDate || product.readyByTime) && (
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">Ready for Pickup</p>
                      <p className="text-sm text-gray-600">
                        {product.readyByDate && format(new Date(product.readyByDate), 'EEEE, MMMM d, yyyy')}
                        {product.readyByTime && ` at ${format(parse(product.readyByTime, 'HH:mm', new Date()), 'h:mm a')}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-row space-y-2 sm:space-y-0 space-x-4 ">
            <Button
              onClick={() => navigate(`/seller/products/${product.id}/edit`)}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-sm sm:text-base h-[48px] sm:h-[56px]"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClick}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-sm sm:text-base h-[48px] sm:h-[56px]"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews & Rating Section */}
      <div className="mt-8 sm:mt-12 border-t border-gray-200 pt-6 sm:pt-8">
        <div className="">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Reviews & Rating
            </h2>

            {/* Overall Rating */}
            <StarRating
              rating={product?.rating || 0}
              showValue={true}
              totalReviews={product?.totalReviews || 0}
            />
          </div>

          {/* Reviews List */}
          <div className="space-y-4 sm:space-y-6">
            {reviewst.length > 0 ? (
              reviewst.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <div className="text-gray-500 w-full text-center text-lg flex justify-center items-center min-h-[400px]">
                No reviews yet!
              </div>
            )}
          </div>

          {/* View All Button */}
          {reviewst.length > 10 && (
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ProductDetailsPage;
