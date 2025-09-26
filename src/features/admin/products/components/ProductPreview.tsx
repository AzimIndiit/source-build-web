import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui';
import { getColorName } from '@/utils/colorUtils';

import { ChevronLeft, ChevronRight, Info, CircleCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';
import LazyImage from '@/components/common/LazyImage';
import { CustomerDetailsSection } from '@/features/orders/components';

interface ProductPreviewProps {
  product: any;
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({ product }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
  // Get current images based on selected variant
  const currentImages = product?.images?.length > 0 ? product.images : product?.images || [];

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

  const getReadyByDate = (product: any) => {
    switch (Number(product?.readyByDays)) {
      case 0:
        return (
          <Badge className=" bg-primary/80 text-white  px-2 py-1 text-[11px]">
            Same Day Delivery
          </Badge>
        );
      case 1:
        return (
          <Badge className=" bg-gray-200 text-gray-800  px-2 py-1 text-[11px]">
            Next Day Delivery
          </Badge>
        );
      default:
        return null;
    }
  };
  return (
    <div className="flex-1 flex flex-col gap-4 lg:gap-0 lg:flex-row rounded-lg overflow-hidden min-h-0">
      {/* Image Carousel */}
      <div className="w-full  lg:w-2/5  lg:h-full rounded-sm overflow-hidden  lg:rounded-e-none">
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

        {/* Thumbnail Carousel */}
        <div className="relative mt-4">
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

      {/* Product Details */}
      <div className="w-full lg:w-3/5 p-3 sm:p-4 md:p-6 rounded-sm lg:rounded-l-none lg:rounded-r-lg lg:overflow-y-auto min-h-0">
        {/* Title and Price */}
        <div className="pb-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 capitalize">
            {product.title || 'Product Title'}
          </h2>
          <div className="flex  items-baseline gap-2">
            <div className="text-xl font-medium text-gray-900 max-content">
              <div className="text-sm font-bold text-primary">
                {formatCurrency(product.price || 0)}
                {product.priceType && ` per ${product.priceType}`}
              </div>
            </div>
            {product.category && (
              <div className="text-gray-600">
                / {typeof product.category === 'object' ? product.category.name : product.category}
              </div>
            )}
          </div>
        </div>

        {/* Sub Category */}
        {product?.subCategory && (
          <div className="py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
              Sub Category
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              {product?.subCategory?.name}
            </p>
          </div>
        )}

        {/* Quantity */}
        {(product.quantity || product.outOfStock) && (
          <div className="py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
              Quantity
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              {product.outOfStock ? (
                <Badge variant="destructive" className="bg-red-500 text-white">
                  Out of Stock
                </Badge>
              ) : (
                product.quantity
              )}
            </p>
          </div>
        )}

        {/* Brand */}
        {product.brand && (
          <div className="py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
              Brand
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">{product.brand}</p>
          </div>
        )}

        {/* Color */}
        {(product.color ||
          (product.variants.length > 0 &&
            product.variants &&
            product.variants.some((v: any) => v.color))) && (
          <div className="py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
              Color
              {product.variants.length > 0 &&
              product.variants &&
              product.variants.filter((v: any) => v.color).length > 0
                ? 's'
                : ''}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {product.color && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: product.color }}
                  />
                  <span className="text-xs sm:text-sm md:text-base text-gray-600 capitalize">
                    {getColorName(product.color).name}
                  </span>
                </div>
              )}
              {product.variants.length > 0 &&
                product.variants &&
                product.variants
                  .filter((v: any) => v.color)
                  .map((v: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      {/* {(i === 0 && product.color) && <span className="text-gray-400">•</span>} */}
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: v.color }}
                      />
                      <span className="text-xs sm:text-sm md:text-base text-gray-600 capitalize">
                        {getColorName(v.color).name}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* Product Tags */}
        {product.productTag && product.productTag.length > 0 && (
          <div className="py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
              Product Tag
            </h3>
            {product.productTag && product.productTag.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.productTag.map((tag: any, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-50 text-primary border border-blue-200 hover:bg-blue-100"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              ''
            )}
          </div>
        )}
        {/* Product Dimensions */}

        {product.dimensions?.width ||
          product.dimensions?.length ||
          (product.dimensions?.height && (
            <div className="py-4 border-b border-gray-200">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                Dimensions
              </h3>
              {product.dimensions?.width ||
              product.dimensions?.length ||
              product.dimensions?.height ? (
                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                  {product.dimensions.width && `W: ${product.dimensions.width}"`}
                  {product.dimensions.width && product.dimensions.length && ' × '}
                  {product.dimensions.length && `L: ${product.dimensions.length}"`}
                  {product.dimensions.length && product.dimensions.height && ' × '}
                  {product.dimensions.height && `H: ${product.dimensions.height}"`}
                </p>
              ) : (
                ''
              )}
            </div>
          ))}
        {/* Locations */}
        <div className="py-4 border-b border-gray-200">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            {product.locationIds && product.locationIds.length > 1 ? 'Locations' : 'Location'}
          </h3>
          {product.locationIds && product.locationIds.length > 0 ? (
            <div className="space-y-3">
              {product.locationIds.map((location: any, index: number) => {
                // Handle both string IDs and location objects
                if (typeof location === 'string') {
                  return (
                    <div key={location} className="text-xs sm:text-sm md:text-base text-gray-600">
                      <p className="font-medium">Location ID: {location}</p>
                    </div>
                  );
                }
                // Handle location objects
                return (
                  <div
                    key={location._id || location.id || index}
                    className="text-xs sm:text-sm md:text-base text-gray-600"
                  >
                    <p className="font-medium">{location.name || `Location ${index + 1}`}</p>
                    {location.city && <p className="text-gray-500 mt-0.5">City: {location.city}</p>}
                    {location.state && <p className="text-gray-500">State: {location.state}</p>}
                    {location.country && (
                      <p className="text-gray-500">Country: {location.country}</p>
                    )}
                    {location.formattedAddress && (
                      <p className="text-gray-500 mt-1">{location.formattedAddress}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : product.location ? (
            <div className="text-xs sm:text-sm md:text-base text-gray-600">
              <p className="font-medium">
                {typeof product.location === 'object'
                  ? product.location.name || product.location.city || 'Location'
                  : product.location}
              </p>
              {typeof product.location === 'object' && (
                <>
                  {product.location.city && (
                    <p className="text-gray-500 mt-0.5">City: {product.location.city}</p>
                  )}
                  {product.location.state && (
                    <p className="text-gray-500">State: {product.location.state}</p>
                  )}
                  {product.location.country && (
                    <p className="text-gray-500">Country: {product.location.country}</p>
                  )}
                  {product.location.formattedAddress && (
                    <p className="text-gray-500 mt-1">{product.location.formattedAddress}</p>
                  )}
                </>
              )}
            </div>
          ) : (
            'Location will appear here'
          )}
        </div>

        {/* Delivery Information */}
        <div className="py-4 border-b border-gray-200">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Marketplace Options
          </h3>
          <div className="space-y-2">
            {product.marketplaceOptions?.delivery && (
              <div className="text-xs sm:text-sm md:text-base text-gray-600">
                <span className="font-medium flex items-center gap-2">
                  Local Delivery <CircleCheck className="w-4 h-4 text-green-500" />{' '}
                  {product.deliveryDistance ? `${product.deliveryDistance} miles` : 'Free'}
                </span>
              </div>
            )}

            {product.marketplaceOptions?.pickup && (
              <div className="text-xs sm:text-sm md:text-base text-gray-600">
                <span className="font-medium flex items-center gap-2">
                  Pickup Available <CircleCheck className="w-4 h-4 text-green-500" />
                </span>
                {product.pickupHours && <span>: {product.pickupHours}</span>}
              </div>
            )}
            {product.marketplaceOptions?.shipping && (
              <div className="text-xs sm:text-sm md:text-base text-gray-600">
                <span className="font-medium flex items-center gap-2">
                  Shipping Available <CircleCheck className="w-4 h-4 text-green-500" />
                </span>
                {product.shippingPrice && <span>: {formatCurrency(product.shippingPrice)}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Ready By */}

        <div className="py-4 border-b border-gray-200">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Ready By
          </h3>
          <div className="relative">{getReadyByDate(product)}</div>
        </div>

        {/* Product Attributes */}
        {product.productAttributes && product.productAttributes.length > 0 && (
          <div className="py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3">
              Product Attributes
            </h3>
            <div className="space-y-2">
              {product.productAttributes.map((attr: any, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm md:text-base text-gray-600">
                    <span className="font-medium">{attr.attributeName}:</span> {attr.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="py-4">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Description
          </h3>
          {product.description ? (
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          ) : (
            'Description will appear here'
          )}
        </div>

        {/* Variants */}
        {product?.variants.length > 0 ? (
          <div className="border-t border-gray-200 pt-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Available Variants (
              {
                product?.variants.filter(
                  (_v: any, i: number) =>
                    product.variants?.[i]?.color &&
                    product.variants?.[i]?.price &&
                    (product.variants?.[i]?.quantity || product.variants?.[i]?.outOfStock)
                ).length
              }
              )
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {product?.variants.map((variant: any, index: number) => {
                const variantData = product.variants?.[index];
                if (
                  !variantData?.color ||
                  !variantData?.price ||
                  (!variantData?.quantity && !variantData?.outOfStock)
                ) {
                  return null;
                }

                const finalPrice =
                  variantData.discount?.discountType === 'percentage' &&
                  variantData.discount?.discountValue
                    ? (
                        parseFloat(variantData.price) *
                        (1 - parseFloat(variantData.discount.discountValue) / 100)
                      ).toFixed(2)
                    : variantData.discount?.discountType === 'flat' &&
                        variantData.discount?.discountValue
                      ? (
                          parseFloat(variantData.price) -
                          parseFloat(variantData.discount.discountValue)
                        ).toFixed(2)
                      : variantData.price;

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 bg-white h-full"
                  >
                    <div className="flex gap-3">
                      {/* Variant Images */}
                      {variant.images && variant.images.length > 0 && (
                        <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={variant.images[0]}
                            alt={`Variant ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {variant.images.length > 1 && (
                            <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-1 rounded-tl">
                              +{variant.images.length - 1}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Variant Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300 capitalize"
                                style={{ backgroundColor: variantData.color }}
                                title={getColorName(variantData.color).name}
                              />
                              <span className="text-sm font-medium">Variant {index + 1}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {variantData.outOfStock ? (
                                <Badge
                                  variant="destructive"
                                  className="text-xs bg-red-500 text-white"
                                >
                                  Out of Stock
                                </Badge>
                              ) : (
                                `Stock: ${variantData.quantity} units`
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            {variantData.discount?.discountType !== 'none' &&
                            variantData.discount?.discountValue ? (
                              <>
                                <div className="text-xs text-gray-500 line-through">
                                  ${variantData.price}
                                </div>
                                <div className="text-sm font-bold text-primary">${finalPrice}</div>
                                <Badge variant="destructive" className="text-xs mt-1">
                                  {variantData.discount.discountType === 'percentage'
                                    ? `${variantData.discount.discountValue}% OFF`
                                    : `$${variantData.discount.discountValue} OFF`}
                                </Badge>
                              </>
                            ) : (
                              <div className="text-sm font-bold text-primary">
                                ${variantData.price}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Show placeholder if variants exist but are incomplete */}
              {product?.variants.length > 0 &&
                !product?.variants.some(
                  (_v: any, i: number) =>
                    product.variants?.[i]?.color &&
                    product.variants?.[i]?.price &&
                    (product.variants?.[i]?.quantity || product.variants?.[i]?.outOfStock)
                ) && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    Complete variant details to see them here
                  </div>
                )}
            </div>
          </div>
        ) : (
          ''
        )}

        {/* Seller */}
        <div className="py-4">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Seller
          </h3>
          {product.seller && (
            <CustomerDetailsSection customerDetails={product.seller} title="" reviewTitle="" />
          )}
        </div>
      </div>
    </div>
  );
};
