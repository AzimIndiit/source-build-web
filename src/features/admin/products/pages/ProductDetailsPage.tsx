import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Package, Truck, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReadMore from '@/components/ui/ReadMore';
import { BreadcrumbWrapper, DeleteConfirmationModal } from '@/components/ui';
import { ReviewCard, type ReviewData } from '@/components/ui/ReviewCard';
import { StarRating } from '@/components/common/StarRating';
import { ProductDetailsPageSkeleton } from '../components/ProductDetailsPageSkeleton';
import { ProductReviewDataTable } from '../components/ProductReviewDataTable';
import { useProductQuery, useDeleteProductMutation } from '../hooks/useProductMutations';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getColorName } from '@/utils/colorUtils';
import { ProductPreview } from '../components';

// Helper function to parse and format pickup hours
export const formatPickupHoursDisplay = (hours: string | object): React.ReactNode => {
  if (!hours) return null;

  // If it's an object with day-specific hours
  if (typeof hours === 'object') {
    const daysOrder = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const dayAbbrev: { [key: string]: string } = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };

    return (
      <div className="space-y-0.5">
        {daysOrder.map((day) => {
          const dayHours = (hours as any)[day];
          if (!dayHours) return null;
          return (
            <div key={day} className="flex gap-2 text-[11px] leading-tight">
              <span className="font-medium text-gray-700 w-7">{dayAbbrev[day]}:</span>
              <span className="text-gray-600">
                {dayHours.open}-{dayHours.close}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // If it's a string, parse it
  if (typeof hours === 'string') {
    // Parse string like "Mon–Fri, Sun 9:00 AM–5:00 PM, Sat 9:02 AM–5:00 PM"
    if (hours.includes('AM') || hours.includes('PM')) {
      // Parse the schedule into day-time pairs
      const schedule: { days: string; time: string }[] = [];

      // Handle the complex format by finding all time patterns and their associated days
      const timePattern = /(\d{1,2}:\d{2}\s*[AP]M)[–\-](\d{1,2}:\d{2}\s*[AP]M)/g;
      let remainingStr = hours;
      let match;

      // Find all time ranges in the string
      const timeRanges: string[] = [];
      while ((match = timePattern.exec(hours)) !== null) {
        timeRanges.push(match[0]);
      }

      // Split by the time ranges to get day parts
      timeRanges.forEach((timeRange) => {
        const parts = remainingStr.split(timeRange);
        if (parts.length >= 1) {
          const daysPart = parts[0].trim().replace(/,\s*$/, '');
          if (daysPart) {
            // Clean up the time range format
            const cleanTime = timeRange.replace(/–/g, '-').replace(/\s+/g, ' ');

            // Split multiple day specifications
            const dayGroups = daysPart
              .split(',')
              .map((d) => d.trim())
              .filter((d) => d);
            dayGroups.forEach((dayGroup) => {
              schedule.push({
                days: dayGroup.replace(/–/g, '-'),
                time: cleanTime,
              });
            });
          }
          // Update remaining string for next iteration
          remainingStr = parts.slice(1).join(timeRange);
        }
      });

      // Group by time
      const timeGroups = new Map<string, string[]>();
      schedule.forEach(({ days, time }) => {
        if (!timeGroups.has(time)) {
          timeGroups.set(time, []);
        }
        timeGroups.get(time)!.push(days);
      });

      // Create display groups
      const displayGroups: { days: string; hours: string }[] = [];
      timeGroups.forEach((daysList, time) => {
        // Join all days with same time
        const daysStr = daysList.join(', ');
        displayGroups.push({ days: daysStr, hours: time });
      });

      // Sort to maintain a logical order
      displayGroups.sort((a, b) => {
        // Put entries with Mon-Fri first
        const aHasWeekday = a.days.includes('Mon-Fri');
        const bHasWeekday = b.days.includes('Mon-Fri');
        if (aHasWeekday && !bHasWeekday) return -1;
        if (!aHasWeekday && bHasWeekday) return 1;
        return 0;
      });

      return (
        <div className="space-y-1">
          {displayGroups.map(({ days, hours }, index) => (
            <div key={index} className="flex text-[11px] leading-tight">
              <span className="font-medium text-gray-700">{days}:</span>
              <span className="text-gray-600 ml-2">{hours}</span>
            </div>
          ))}
        </div>
      );
    }

    // Convert 24-hour format to 12-hour format
    const formatted = hours.replace(/(\d{1,2}):(\d{2})/g, (_, h, m) => {
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
  const [reviewSearchValue, setReviewSearchValue] = useState('');
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

  // Sample reviews data (currently unused - for future implementation)
  // const reviews: ReviewData[] = [
  //   {
  //     id: 1,
  //     userName: 'Aspen Siphron',
  //     date: new Date('2025-05-12'),
  //     rating: 4.9,
  //     comment:
  //       "The six lights provide ample brightness while adding a touch of elegance and warmth to any room. Whether you're redecorating or building from scratch, this chandelier is praised for its timeless appeal and reliable performance.",
  //     avatar: 'https://placehold.co/50x50/FF6B6B/ffffff?text=AS',
  //   },
  //   {
  //     id: 2,
  //     userName: 'Aspen Siphron',
  //     date: new Date('2025-05-12'),
  //     rating: 4.9,
  //     comment:
  //       "The six lights provide ample brightness while adding a touch of elegance and warmth to any room. Whether you're redecorating or building from scratch, this chandelier is praised for its timeless appeal and reliable performance.",
  //     avatar: 'https://placehold.co/50x50/FF6B6B/ffffff?text=AS',
  //   },
  //   {
  //     id: 3,
  //     userName: 'Aspen Siphron',
  //     date: new Date('2025-05-12'),
  //     rating: 4.9,
  //     comment:
  //       "The six lights provide ample brightness while adding a touch of elegance and warmth to any room. Whether you're redecorating or building from scratch, this chandelier is praised for its timeless appeal and reliable performance.",
  //     avatar: 'https://placehold.co/50x50/FF6B6B/ffffff?text=AS',
  //   },
  //   {
  //     id: 4,
  //     userName: 'Aspen Siphron',
  //     date: new Date('2025-05-12'),
  //     rating: 4.9,
  //     comment:
  //       "The six lights provide ample brightness while adding a touch of elegance and warmth to any room. Whether you're redecorating or building from scratch, this chandelier is praised for its timeless appeal and reliable performance.",
  //     avatar: 'https://placehold.co/50x50/FF6B6B/ffffff?text=AS',
  //   },
  // ];

  const reviewst: ReviewData[] = [];

  // Transform reviews to match ProductReviewDataTable format
  const transformedReviews = reviewst.map((review) => ({
    id: review.id.toString(),
    user: {
      name: review.userName,
      avatar: review.avatar,
    },
    rating: review.rating,
    comment: review.comment,
    date: typeof review.date === 'string' ? review.date : review.date.toISOString(),
    helpful: undefined,
    verified: true,
  }));

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

  console.log('selectedVariant', selectedVariant);

  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
      </div>

      {/* Main Content */}
        <ProductPreview
          product={product}
        
        />

      {/* Reviews & Rating Section */}
      <ProductReviewDataTable
       title='Reviews & Rating'
        reviews={transformedReviews}
        productRating={product?.rating || 0}
        totalReviews={product?.totalReviews || 0}
        searchValue={reviewSearchValue}
        onSearchChange={setReviewSearchValue}
        showSearch={true}
        isLoading={false}
      />
    </div>
  );
};

export default ProductDetailsPage;
