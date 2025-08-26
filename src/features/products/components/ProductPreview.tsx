import React, { useState, useEffect } from 'react';
import { Card, Badge } from '@/components/ui';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { X } from 'lucide-react';

interface ProductPreviewProps {
  formValues: any;
  uploadedPhotos: File[];
  variants: Array<{ id: string; images: File[] }>;
  categoryOptions: Array<{ value: string; label: string }>;
  subCategoryOptions: Array<{ value: string; label: string }>;
  tagOptions: Array<{ value: string; label: string }>;
  handleBackClick?: () => void;
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({
  formValues,
  uploadedPhotos,
  variants,
  categoryOptions,
  subCategoryOptions,
  tagOptions,
  handleBackClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [api, setApi] = useState<any>();

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on('select', () => {
      setCurrentImageIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const finalPrice =
    formValues.discount?.discountType === 'percentage' && formValues.discount?.discountValue
      ? (
          parseFloat(formValues.price) *
          (1 - parseFloat(formValues.discount.discountValue) / 100)
        ).toFixed(2)
      : formValues.discount?.discountType === 'flat' && formValues.discount?.discountValue
        ? (parseFloat(formValues.price) - parseFloat(formValues.discount.discountValue)).toFixed(2)
        : formValues.price;

  return (
    <div className="w-full lg:flex-1 h-full ">
      <Card className="p-4 sm:p-6 border-gray-200 h-full flex flex-col rounded-none border-none lg:border lg:rounded-sm ">
        <div className="flex  justify-between items-center gap-2 border-b border-gray-200 pb-4 ">
          <div className="">
            <h2 className="text-lg font-semibold text-gray-700">Preview</h2>
            <p className="text-sm text-gray-500">See how your listing will appear</p>
          </div>

          {handleBackClick && (
            <button
              type="button"
              onClick={handleBackClick}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-4 lg:gap-0 lg:flex-row rounded-lg overflow-hidden min-h-0">
          {/* Image Carousel */}
          <div className="w-full  lg:w-3/5  lg:h-full rounded-sm overflow-hidden  lg:rounded-e-none">
            {uploadedPhotos.length > 0 ? (
              <Carousel
                setApi={setApi}
                className=" min-h-[300px] min-w-[300px] rounded-sm w-full  flex-col lg:flex-row  lg:rounded-e-none lg:h-full bg-[#A9A9A9]   lg:rounded-l-lg  lg:py-20 lg:px-12 relative flex items-center "
              >
                <CarouselContent>
                  {uploadedPhotos.map((photo, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square relative  overflow-hidden border rounded-sm border-gray-400 shadow-2xl">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {uploadedPhotos.length > 1 && (
                  <>
                    <CarouselPrevious className="left-0 lg:left-[49px] bg-white shadow-md border-none hover:bg-gray-50 h-12 sm:h-16 md:h-20 rounded-l-sm" />
                    <CarouselNext className="right-0 lg:right-[49px] bg-white border-none shadow-md hover:bg-gray-50 h-12 sm:h-16 md:h-20 rounded-r-sm" />
                  </>
                )}

                <div className="absolute   bottom-10 md:bottom-20 justify-center items-center text-white z-10 left-0 flex gap-2 w-full px-2">
                  <div className="flex gap-1 sm:gap-2 m-0 overflow-x-auto max-w-full">
                    {uploadedPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0"
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Product ${index + 1}`}
                          className={`${
                            index === currentImageIndex
                              ? 'border-2 border-primary shadow-2xl'
                              : 'border-2 border-transparent'
                          } w-full h-full object-cover rounded-sm transition-all duration-200`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Carousel>
            ) : (
              <div className="h-full bg-gray-100 rounded-t-lg sm:rounded-t-none sm:rounded-l-lg flex items-center justify-center p-4">
                <div className="text-center text-gray-400">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-600">
                    Your listing Preview
                  </h2>
                  <p className="text-xs sm:text-sm mt-2">
                    As you create your listing, you can preview how it will appear to others on
                    Marketplace
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-2/5 p-3 sm:p-4 md:p-6 border border-gray-200 rounded-sm lg:rounded-l-none lg:rounded-r-lg lg:overflow-y-auto min-h-0">
            {/* Title and Price */}
            <div className="pb-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {formValues.title || 'Product Title'}
              </h2>
              <div className="flex  items-baseline gap-2">
                <div className="text-xl font-medium text-gray-900 max-content">
                  {/* ${formValues.price || '0.00'} */}
                  {formValues.discount?.discountType !== 'none' &&
                  formValues.discount?.discountValue ? (
                    <div className="flex gap-2 items-center ">
                      <div className="text-xs text-gray-500 line-through">${formValues.price}</div>
                      <div className="text-sm font-bold text-primary">${finalPrice || '0.00'}</div>
                      <Badge variant="destructive" className="text-xs bg-primary text-white">
                        {formValues.discount.discountType === 'percentage'
                          ? `${formValues.discount.discountValue}% OFF`
                          : `$${formValues.discount.discountValue} OFF`}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-primary">
                      ${formValues.price || '0.00'}
                    </div>
                  )}
                </div>
                {formValues.category && (
                  <div className="text-gray-600">
                    /{' '}
                    {categoryOptions.find((opt) => opt.value === formValues.category)?.label ||
                      formValues.category}
                  </div>
                )}
                {formValues.discount?.discountType !== 'none' &&
                  formValues.discount?.discountValue && (
                    <Badge variant="destructive" className="text-xs ml-2">
                      {formValues.discount.discountType === 'percentage'
                        ? `${formValues.discount.discountValue}% OFF`
                        : `$${formValues.discount.discountValue} OFF`}
                    </Badge>
                  )}
              </div>
            </div>

            {/* Sub Category */}
            {formValues.subCategory && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  Sub Category
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                  {subCategoryOptions.find((opt) => opt.value === formValues.subCategory)?.label ||
                    formValues.subCategory}
                </p>
              </div>
            )}

            {/* Quantity */}
            {formValues.quantity && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  Quantity
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                  {formValues.quantity}
                </p>
              </div>
            )}

            {/* Brand */}
            {formValues.brand && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  Brand
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">{formValues.brand}</p>
              </div>
            )}

            {/* Color */}
            {formValues.color && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  Color
                </h3>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: formValues.color }}
                  />
                  <span className="text-xs sm:text-sm md:text-base text-gray-600">
                    {formValues.color === '#0000FF'
                      ? 'Blue'
                      : formValues.color === '#000000'
                        ? 'Black'
                        : formValues.color === '#964B00'
                          ? 'Brown'
                          : formValues.color}
                    {formValues.variants &&
                      formValues.variants.length > 0 &&
                      formValues.variants.some((v: any) => v.color) &&
                      ', '}
                    {formValues.variants
                      ?.map((v: any, i: number) =>
                        v.color
                          ? i === 0
                            ? v.color === '#0000FF'
                              ? 'Blue'
                              : v.color === '#000000'
                                ? 'Black'
                                : v.color === '#964B00'
                                  ? 'Brown'
                                  : v.color
                            : `, ${
                                v.color === '#0000FF'
                                  ? 'Blue'
                                  : v.color === '#000000'
                                    ? 'Black'
                                    : v.color === '#964B00'
                                      ? 'Brown'
                                      : v.color
                              }`
                          : null
                      )
                      .filter(Boolean)
                      .join('')}
                  </span>
                </div>
              </div>
            )}

            {/* Product Tags */}
            {formValues.productTag && formValues.productTag.length > 0 && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  Product Tag
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formValues.productTag.map((tag: any, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                    >
                      {typeof tag === 'string'
                        ? tag
                        : tagOptions.find((opt) => opt.value === tag)?.label || tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Product Dimensions */}
            {(formValues.dimensions?.width ||
              formValues.dimensions?.length ||
              formValues.dimensions?.height) && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  Dimensions
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                  {formValues.dimensions.width && `W: ${formValues.dimensions.width}"`}
                  {formValues.dimensions.width && formValues.dimensions.length && ' × '}
                  {formValues.dimensions.length && `L: ${formValues.dimensions.length}"`}
                  {formValues.dimensions.length && formValues.dimensions.height && ' × '}
                  {formValues.dimensions.height && `H: ${formValues.dimensions.height}"`}
                </p>
              </div>
            )}

            {/* Location */}
            {formValues.locationAddress && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  Location
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                  {formValues.locationAddress}
                </p>
              </div>
            )}

            {/* Marketplace Options */}
            {(formValues.marketplaceOptions?.pickup ||
              formValues.marketplaceOptions?.shipping ||
              formValues.marketplaceOptions?.delivery) && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  Delivery Options
                </h3>
                <div className="space-y-2">
                  {formValues.marketplaceOptions?.pickup && (
                    <div className="text-xs sm:text-sm md:text-base text-gray-600">
                      <span className="font-medium">Pickup</span>
                      {formValues.pickupHours && <span>: {formValues.pickupHours}</span>}
                    </div>
                  )}
                  {formValues.marketplaceOptions?.shipping && (
                    <div className="text-xs sm:text-sm md:text-base text-gray-600">
                      <span className="font-medium">Shipping</span>
                      {formValues.shippingPrice && <span>: ${formValues.shippingPrice}</span>}
                    </div>
                  )}
                  {formValues.marketplaceOptions?.delivery && (
                    <div className="text-xs sm:text-sm md:text-base text-gray-600">
                      <span className="font-medium">Delivery Available</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ready By */}
            {(formValues.readyByDate || formValues.readyByTime) && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  Ready By
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                  {formValues.readyByDate && new Date(formValues.readyByDate).toLocaleDateString()}
                  {formValues.readyByTime && ` at ${formValues.readyByTime}`}
                </p>
              </div>
            )}

            {/* Description */}
            {formValues.description && (
              <div className="py-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  Description
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                  {formValues.description}
                </p>
              </div>
            )}

            {/* Variants */}
            {variants.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Available Variants (
                  {
                    variants.filter(
                      (_v, i) =>
                        formValues.variants?.[i]?.color &&
                        formValues.variants?.[i]?.price &&
                        formValues.variants?.[i]?.quantity
                    ).length
                  }
                  )
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  {variants.map((variant, index) => {
                    const variantData = formValues.variants?.[index];
                    if (!variantData?.color || !variantData?.price || !variantData?.quantity) {
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
                      <div key={index} className="border rounded-lg p-3 bg-white h-full">
                        <div className="flex gap-3">
                          {/* Variant Images */}
                          {variant.images.length > 0 && (
                            <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={URL.createObjectURL(variant.images[0])}
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
                                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                                    style={{ backgroundColor: variantData.color }}
                                    title={variantData.color}
                                  />
                                  <span className="text-sm font-medium">Variant {index + 1}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Stock: {variantData.quantity} units
                                </div>
                              </div>

                              <div className="text-right">
                                {variantData.discount?.discountType !== 'none' &&
                                variantData.discount?.discountValue ? (
                                  <>
                                    <div className="text-xs text-gray-500 line-through">
                                      ${variantData.price}
                                    </div>
                                    <div className="text-sm font-bold text-primary">
                                      ${finalPrice}
                                    </div>
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
                  {variants.length > 0 &&
                    !variants.some(
                      (_v, i) =>
                        formValues.variants?.[i]?.color &&
                        formValues.variants?.[i]?.price &&
                        formValues.variants?.[i]?.quantity
                    ) && (
                      <div className="text-sm text-gray-500 text-center py-2">
                        Complete variant details to see them here
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
