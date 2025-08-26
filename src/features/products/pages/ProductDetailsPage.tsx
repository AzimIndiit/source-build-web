import React, { useState, useRef, useEffect } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReadMore from '@/components/ui/ReadMore';
import { BreadcrumbWrapper, DeleteConfirmationModal } from '@/components/ui';
import { ReviewCard, type ReviewData } from '@/components/ui/ReviewCard';
import { StarRating } from '@/components/ui/StarRating';

const ProductDetailsPage: React.FC = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('black');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Sample product data - in production this would come from an API
  const product = {
    id: '1',
    title: '(NEW) Westinghouse Chandelier Fixture Zaro 6 Light Iron',
    price: 15.5,
    originalPrice: 31.0,
    discount: 50,
    unit: '',
    category: 'Interior Essentials & Appliances',
    subcategory: 'Light Fixtures',
    marketplace: 'Marketplace',
    isNew: true,
    inStock: true,
    slug: 'westinghouse-chandelier-fixture-zaro-6-light-iron',
    description:
      'Use 6 medium base (E26) bulbs with a maximum of 60 incandescent watts each. For the style pictured, use ST20 shaped LED bulbs...',
    fullDescription: `Use 6 medium base (E26) bulbs with a maximum of 60 incandescent watts each. For the style pictured, use ST20 shaped LED bulbs. Bulbs are not included with this fixture. This chandelier features a modern design with six light points arranged in a circular pattern, perfect for dining rooms, living rooms, or entryways. The matte black finish provides a contemporary look that complements various interior styles.`,
    images: [
      {
        id: '1',
        url: 'https://placehold.co/600x600/2c2c2c/ffffff?text=Chandelier+1',
        alt: 'Main view',
      },
      {
        id: '2',
        url: 'https://placehold.co/600x600/2c2c2c/ffffff?text=Chandelier+2',
        alt: 'Side view',
      },
      {
        id: '3',
        url: 'https://placehold.co/600x600/2c2c2c/ffffff?text=Chandelier+3',
        alt: 'Detail view',
      },
      {
        id: '4',
        url: 'https://placehold.co/600x600/2c2c2c/ffffff?text=Chandelier+4',
        alt: 'Installation view',
      },
    ],
    colors: [
      { name: 'black', hex: '#000000' },
      { name: 'silver', hex: '#C0C0C0' },
      { name: 'bronze', hex: '#8B7355' },
    ],
    rating: 4.7,
    totalReviews: 2306,
  };

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
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    // Here you would typically call an API to delete the product
    console.log('Deleting product:', product.id);
    setIsDeleteModalOpen(false);
    // You might want to navigate away after deletion
    // navigate('/seller/products');
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'MyListing', href: '/seller/products' },
    { label: product.title, isCurrentPage: true },
  ];
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <div className="py-2 sm:py-4">
        <BreadcrumbWrapper items={breadcrumbItems} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Left Column - Image Gallery */}
        <div className="space-y-3 sm:space-y-4">
          {/* Main Image Display */}
          <div className="rounded-md">
            <img
              src={product.images[selectedImageIndex].url}
              alt={product.images[selectedImageIndex].alt}
              className="w-full h-[250px] sm:h-[350px] md:h-[400px] object-cover rounded-sm"
            />
          </div>

          {/* Thumbnail Carousel */}
          <div className="relative">
            <div className="flex items-center">
              {/* Previous Button */}
              <button
                onClick={handlePreviousImage}
                className="absolute left-0 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
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
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
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
                    <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextImage}
                className="absolute right-0 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
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
                <span className="text-xl sm:text-2xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg sm:text-xl md:text-2xl text-gray-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    {product.discount && (
                      <Badge className="bg-primary text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold">
                        -{product.discount}%
                      </Badge>
                    )}
                  </>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                <span className="text-gray-600">Availability:</span>
                {product.inStock ? (
                  <span className="text-green-600 font-medium">In stock</span>
                ) : (
                  <span className="text-red-600 font-medium">Out of stock</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <ReadMore
              text={product.fullDescription}
              maxLength={200}
              className="text-sm sm:text-base text-gray-700 leading-relaxed"
            />
          </div>

          {/* Categories */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <div className="text-xs sm:text-sm text-gray-600">
              <span className="font-medium">Categories: </span>
              <span className="text-gray-900">
                {product.category}, {product.subcategory}, {product.marketplace},{' '}
                {product.isNew ? 'New' : ''}
              </span>
            </div>
          </div>

          {/* Color Selection */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Color</h3>
            <div className="flex space-x-2 sm:space-x-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all cursor-pointer ${
                    selectedColor === color.name
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
            <Button className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-sm sm:text-base h-[48px] sm:h-[56px]">
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClick}
              className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-sm sm:text-base h-[48px] sm:h-[56px]"
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
              rating={product.rating}
              showValue={true}
              totalReviews={product.totalReviews}
            />
          </div>

          {/* Reviews List */}
          <div className="space-y-4 sm:space-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-6 sm:mt-8 text-center">
            <Button
              variant="outline"
              className="px-6 sm:px-8 py-2 text-sm sm:text-base text-primary hover:text-primary/80 underline border-none shadow-none"
            >
              View all
            </Button>
          </div>
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
