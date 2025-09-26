import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazyImage from '@/components/common/LazyImage';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/helpers';
import { useAddToWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/useWishlist';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface Slide {
  image: string;
  delivery: string;
  price: string;
  priceType?: 'sqft' | 'linear' | 'pallet';
  description: string;
  location: string;
  seller: string;
  readyByDate?: string;
  inStock?: boolean;
  // Product information for wishlist functionality
  id?: string;
  _id?: string;
  slug?: string;
  isInWishlist?: boolean;
  readyByDays?: number;
}

interface CustomArrowProps {
  onClick?: () => void;
}

interface MultiSliderSliderProps {
  slides: Slide[];
}

export const getReadyByDate = (slide: Slide) => {
  switch (Number(slide?.readyByDays)) {
    case 1:
      return (
        <Badge className="absolute bottom-2 left-2 bg-primary/80 text-white  px-2 py-1 text-[11px]">
          Same Day Delivery
        </Badge>
      );
    case 2:
      return (
        <Badge className="absolute bottom-2 left-2 bg-gray-200 text-gray-800  px-2 py-1 text-[11px]">
          Next Day Delivery
        </Badge>
      );
    default:
      return null;
  }
};

const CustomPrevArrow: React.FC<CustomArrowProps> = ({ onClick }) => (
  <div
    className="absolute left-0 top-1/2 z-20 -translate-y-1/2 cursor-pointer bg-white/90 hover:bg-white h-8 sm:h-10 md:h-12 lg:h-14 rounded-e-lg sm:rounded-e-xl md:rounded-e-2xl flex justify-center items-center p-1 sm:p-1.5 md:p-2 shadow-md hover:shadow-lg transition-all duration-300"
    onClick={onClick}
  >
    <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-700" />
  </div>
);

const CustomNextArrow: React.FC<CustomArrowProps> = ({ onClick }) => (
  <div
    className="absolute right-0 h-8 sm:h-10 md:h-12 lg:h-14 top-1/2 z-20 -translate-y-1/2 cursor-pointer flex justify-center items-center rounded-s-lg sm:rounded-s-xl md:rounded-s-2xl bg-white/90 hover:bg-white p-1 sm:p-1.5 md:p-2 shadow-md hover:shadow-lg transition-all duration-300"
    onClick={onClick}
  >
    <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-700" />
  </div>
);

const MultiSliderSlider: React.FC<MultiSliderSliderProps> = ({ slides }) => {
  const navigate = useNavigate();
  const { isAuthenticated ,user} = useAuth();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  // Use local state for optimistic UI updates
  const [optimisticWishlist, setOptimisticWishlist] = useState<Record<number, boolean>>({});
  const isLoading = addToWishlist.isPending || removeFromWishlist.isPending;

  // Initialize optimistic wishlist state from slides
  useEffect(() => {
    const initialWishlist: Record<number, boolean> = {};
    slides.forEach((slide, index) => {
      initialWishlist[index] = slide.isInWishlist || false;
    });
    setOptimisticWishlist(initialWishlist);
  }, [slides]);

  const handleWishlistClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    const slide = slides[index];
    const productId = slide.id || slide._id || '';

    if (!productId) {
      toast.error('Product ID not found');
      return;
    }

    if (!isLoading) {
      // Optimistically update the UI immediately
      const newWishlistState = !optimisticWishlist[index];
      setOptimisticWishlist((prev) => ({
        ...prev,
        [index]: newWishlistState,
      }));

      // Then perform the actual mutation
      if (newWishlistState) {
        addToWishlist.mutate(
          { productId },
          {
            onError: () => {
              // Revert on error
              setOptimisticWishlist((prev) => ({
                ...prev,
                [index]: false,
              }));
            },
          }
        );
      } else {
        removeFromWishlist.mutate(
          { productId },
          {
            onError: () => {
              // Revert on error
              setOptimisticWishlist((prev) => ({
                ...prev,
                [index]: true,
              }));
            },
          }
        );
      }
    }
  };

  const customSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5.2,
    slidesToScroll: 1,
    swipeToSlide: true,
    touchThreshold: 10,
    centerMode: false,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 4.2,
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3.5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3.2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2.5,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2.2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1.3,
          centerMode: false,
        },
      },
      {
        breakpoint: 390,
        settings: {
          slidesToShow: 1.15,
          centerMode: false,
        },
      },
    ],
  };

  return (
    <section
      className={`relative w-full overflow-hidden ${slides.length === 1 ? 'max-w-md ' : ''}`}
    >
      <Slider {...customSettings} className="">
        {slides.map((slide, index) => (
          <div className="pr-1.5 sm:pr-2 md:pr-3 lg:pr-4" key={index}>
            <div className="rounded-sm sm:rounded-lg overflow-hidden duration-300 bg-white">
              <div className="relative">
                <div
                  onClick={() => navigate( `/products/${slide.slug}` || '')}
                  className="relative h-28 sm:h-36 md:h-44 lg:h-48 cursor-pointer group overflow-hidden"
                >
                  <LazyImage
                    src={slide.image}
                    alt={slide.description || 'Product image'}
                    className="w-full h-full object-cover"
                    aspectRatio="auto"
                    objectFit="cover"
                    showSkeleton={true}
                    fadeInDuration={0.3}
                    wrapperClassName="w-full h-full"
                  />
         {(!isAuthenticated || user?.role==='buyer') &&         <motion.button
                    className="absolute top-2 right-2 rounded-full bg-black/20 backdrop-blur-sm p-2 transition-all duration-200 hover:bg-black/30"
                    onClick={(e) => handleWishlistClick(e, index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      animate={{
                        scale: optimisticWishlist[index] ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart
                        className={cn(
                          'h-5 w-5 transition-colors duration-200 cursor-pointer',
                          optimisticWishlist[index]
                            ? 'text-red-500 fill-red-500'
                            : 'text-white hover:text-red-400',
                          isLoading && 'opacity-50'
                        )}
                      />
                    </motion.div>
                  </motion.button>}
                  {getReadyByDate(slide)}
                </div>
              </div>

              <div className="p-1.5 sm:p-2 md:p-3 lg:p-4">
                <h2
                  onClick={() => navigate( `/products/${slide.slug}` || '')}
                  className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 cursor-pointer hover:text-primary transition-colors duration-200 mb-1"
                >
                  ${slide.price}
                  {slide.priceType && (
                    <span className="text-[10px] sm:text-xs md:text-sm font-normal text-gray-600">
                      /{' '}
                      {slide.priceType === 'sqft'
                        ? 'sq ft'
                        : slide.priceType === 'linear'
                          ? 'linear ft'
                          : 'pallet'}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 mb-1 line-clamp-2">
                  {slide.description}
                </p>
                {slide.readyByDate && (
                  <p className="text-[10px] sm:text-[11px] md:text-xs text-blue-600 font-medium mb-1.5 sm:mb-2">
                    Ready by: {slide.readyByDate}
                  </p>
                )}
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] md:text-xs text-gray-500">
                  <span className="flex items-center gap-0.5 truncate max-w-[60%]">
                    {slide.inStock !== undefined && (
                      <span
                        className={`w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 ${slide.inStock ? 'bg-green-500' : 'bg-red-500'} rounded-full flex-shrink-0`}
                      ></span>
                    )}
                    <span className="truncate">{slide.location}</span>
                  </span>
                  <span className="truncate max-w-[40%] text-right">{slide.seller}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default MultiSliderSlider;
