import React, { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/helpers';
import { motion, AnimatePresence } from 'framer-motion';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholderSrc?: string;
  className?: string;
  wrapperClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  showSkeleton?: boolean;
  aspectRatio?: 'square' | '16/9' | '4/3' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  rootMargin?: string;
  threshold?: number;
  fadeInDuration?: number;
  blurPlaceholder?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Image',
  placeholderSrc,
  className,
  wrapperClassName,
  onLoad,
  onError,
  showSkeleton = true,
  aspectRatio = 'auto',
  objectFit = 'cover',
  rootMargin = '50px',
  threshold = 0.01,
  fadeInDuration = 0.3,
  blurPlaceholder = true,
  ...imgProps
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(placeholderSrc || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isInView) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
      observer.disconnect();
    };
  }, [isInView, rootMargin, threshold]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || hasError) return;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      setIsLoaded(true);
      onError?.();
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src, fallbackSrc, hasError, onLoad, onError]);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case '16/9':
        return 'aspect-video';
      case '4/3':
        return 'aspect-4/3';
      default:
        return '';
    }
  };

  const getObjectFitClass = () => {
    switch (objectFit) {
      case 'contain':
        return 'object-contain';
      case 'fill':
        return 'object-fill';
      case 'none':
        return 'object-none';
      case 'scale-down':
        return 'object-scale-down';
      default:
        return 'object-cover';
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        getAspectRatioClass(),
        wrapperClassName
      )}
    >
      <AnimatePresence mode="wait">
        {/* Skeleton/Placeholder */}
        {!isLoaded && showSkeleton && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeInDuration }}
            className="absolute inset-0 bg-gray-200 animate-pulse"
          />
        )}

        {/* Blur placeholder (if provided) */}
        {!isLoaded && placeholderSrc && blurPlaceholder && (
          <motion.img
            key="placeholder"
            src={placeholderSrc}
            alt=""
            className={cn(
              'absolute inset-0 w-full h-full filter blur-sm',
              getObjectFitClass()
            )}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeInDuration }}
          />
        )}

        {/* Main Image */}
        {isInView && (
          <motion.img
            key="main-image"
            ref={imageRef}
            src={currentSrc || fallbackSrc}
            alt={alt}
            className={cn(
              'w-full h-full',
              getObjectFitClass(),
              className,
              !isLoaded && 'invisible'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: fadeInDuration }}
            loading="lazy"
            {...(() => {
              const { onDrag, onDragStart, onDragEnd, ...safeProps } = imgProps;
              return safeProps;
            })()}
          />
        )}

        {/* Error State */}
        {hasError && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: fadeInDuration }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100"
          >
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-500">Failed to load image</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LazyImage;

// Export a memoized version for performance
export const MemoizedLazyImage = React.memo(LazyImage);