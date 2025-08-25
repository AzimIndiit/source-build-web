import React, { useState, useEffect } from 'react';
import { Card, Badge } from '@/components/ui';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface ProductPreviewProps {
  formValues: any;
  uploadedPhotos: File[];
  variants: Array<{ id: string; images: File[] }>;
  categoryOptions: Array<{ value: string; label: string }>;
  subCategoryOptions: Array<{ value: string; label: string }>;
  tagOptions: Array<{ value: string; label: string }>;
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({
  formValues,
  uploadedPhotos,
  variants,
  categoryOptions,
  subCategoryOptions,
  tagOptions,
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

  return (
    <div className="flex-1 w-full">
      <Card className="p-6 sticky top-4">
        <div className="">
          <h2 className="text-lg font-semibold text-gray-700">Preview</h2>
          <p className="text-sm text-gray-500">See how your listing will appear</p>
        </div>

        <div className=" flex rounded-lg overflow-hidden max-h-[70vh]">
          {/* Image Carousel */}
        <div className='w-3/5 h-[70vh] '>
        {uploadedPhotos.length > 0 ? (
            <Carousel 
              setApi={setApi}
              className="w-full bg-[#A9A9A9] rounded-l-sm py-20 px-12 relative">
              <CarouselContent>
                {uploadedPhotos.map((photo, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-400 shadow-2xl">
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
                  <CarouselPrevious className="left-[10px] bg-white  shadow-md border-none hover:bg-gray-50" />
                  <CarouselNext className="right-[10px] bg-white border-none shadow-md hover:bg-gray-50" />
                </>
              )}

<div className='absolute bottom-20 justify-center items-center mb-4 text-white z-99 left-0 flex  gap-2  w-full '>
             <div className='flex gap-2 m-0'>
             {uploadedPhotos.map((photo, index) => (
                  <div key={index} className='w-20 h-20'>
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
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <h2 className='text-2xl font-bold text-gray-600'>Your listing Preview</h2>
                <p className="text-sm">As you create your listing, you can preview
                how it will appear to others on Marketplace</p>
              </div>
            </div>
          )}
        </div>

          {/* Product Details */}
          <div className="w-2/5 p-6  border border-gray-200 rounded-r-lg max-h-[70vh] overflow-auto">
            {/* Title and Price */}
            <div className="pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {formValues.title || 'Product Title'}
              </h2>
              <div className="flex  items-baseline gap-2">
                <div className="text-xl font-medium text-gray-900 max-content">
                  {/* ${formValues.price || '0.00'} */}
                  {formValues.discount?.discountType !== 'none' && formValues.discount?.discountValue ? (
                                  <div className='flex gap-2 items-center '>
                                    <div className="text-xs text-gray-500 line-through">
                                      ${formValues.price}
                                    </div>
                                    <div className="text-sm font-bold text-primary">
                                      ${formValues.price || '0.00'}
                                    </div>
                                    <Badge variant="destructive" className="text-xs bg-primary text-white">
                                      {formValues.discount.discountType === 'percentage' 
                                        ? `${formValues.discount.discountValue}% OFF`
                                        : `$${formValues.discount.discountValue} OFF`
                                      }
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
                    / {categoryOptions.find(opt => opt.value === formValues.category)?.label || formValues.category}
                  </div>
                )}
                {formValues.discount?.discountType !== 'none' && formValues.discount?.discountValue && (
                  <Badge variant="destructive" className="text-xs ml-2">
                    {formValues.discount.discountType === 'percentage' 
                      ? `${formValues.discount.discountValue}% OFF`
                      : `$${formValues.discount.discountValue} OFF`
                    }
                  </Badge>
                )}
              </div>
            </div>

            {/* Sub Category */}
            {formValues.subCategory && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sub Category</h3>
                <p className="text-gray-600">
                  {subCategoryOptions.find(opt => opt.value === formValues.subCategory)?.label || formValues.subCategory}
                </p>
              </div>
            )}

            {/* Quantity */}
            {formValues.quantity && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quantity</h3>
                <p className="text-gray-600">{formValues.quantity}</p>
              </div>
            )}

            {/* Brand */}
            {formValues.brand && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand</h3>
                <p className="text-gray-600">{formValues.brand}</p>
              </div>
            )}

            {/* Color */}
            {formValues.color && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Color</h3>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: formValues.color }}
                  />
                  <span className="text-gray-600">
                    {formValues.color === '#0000FF' ? 'Blue' : 
                     formValues.color === '#000000' ? 'Black' : 
                     formValues.color === '#964B00' ? 'Brown' :
                     formValues.color}
                    {formValues.variants && formValues.variants.length > 0 && 
                     formValues.variants.some((v: any) => v.color) && ', '}
                    {formValues.variants?.map((v: any, i: number) => 
                      v.color ? (
                        i === 0 ? 
                        (v.color === '#0000FF' ? 'Blue' : 
                         v.color === '#000000' ? 'Black' : 
                         v.color === '#964B00' ? 'Brown' : v.color) :
                        `, ${v.color === '#0000FF' ? 'Blue' : 
                             v.color === '#000000' ? 'Black' : 
                             v.color === '#964B00' ? 'Brown' : v.color}`
                      ) : null
                    ).filter(Boolean).join('')}
                  </span>
                </div>
              </div>
            )}

            {/* Product Tags */}
            {formValues.productTag && formValues.productTag.length > 0 && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Tag</h3>
                <div className="flex flex-wrap gap-2">
                  {formValues.productTag.map((tag: any, index: number) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                    >
                      {typeof tag === 'string' ? tag : tagOptions.find(opt => opt.value === tag)?.label || tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {formValues.locationAddress && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600">{formValues.locationAddress}</p>
              </div>
            )}

            {/* Marketplace Options */}
            {(formValues.marketplaceOptions?.pickup || formValues.marketplaceOptions?.shipping || formValues.marketplaceOptions?.delivery) && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Options</h3>
                <div className="space-y-2">
                  {formValues.marketplaceOptions?.pickup && (
                    <div className="text-gray-600">
                      <span className="font-medium">Pickup</span>
                      {formValues.pickupHours && <span>: {formValues.pickupHours}</span>}
                    </div>
                  )}
                  {formValues.marketplaceOptions?.shipping && (
                    <div className="text-gray-600">
                      <span className="font-medium">Shipping</span>
                      {formValues.shippingPrice && <span>: ${formValues.shippingPrice}</span>}
                    </div>
                  )}
                  {formValues.marketplaceOptions?.delivery && (
                    <div className="text-gray-600">
                      <span className="font-medium">Delivery Available</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ready By */}
            {(formValues.readyByDate || formValues.readyByTime) && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready By</h3>
                <p className="text-gray-600">
                  {formValues.readyByDate && new Date(formValues.readyByDate).toLocaleDateString()}
                  {formValues.readyByTime && ` at ${formValues.readyByTime}`}
                </p>
              </div>
            )}

            {/* Description */}
            {formValues.description && (
              <div className="py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {formValues.description}
                </p>
              </div>
            )}

            {/* Variants */}
            {variants.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Available Variants ({variants.filter((_v, i) => 
                    formValues.variants?.[i]?.color && 
                    formValues.variants?.[i]?.price && 
                    formValues.variants?.[i]?.quantity
                  ).length})
                </h4>
                <div className="space-y-3">
                  {variants.map((variant, index) => {
                    const variantData = formValues.variants?.[index];
                    if (!variantData?.color || !variantData?.price || !variantData?.quantity) {
                      return null;
                    }
                    
                    const finalPrice = variantData.discount?.discountType === 'percentage' && variantData.discount?.discountValue
                      ? (parseFloat(variantData.price) * (1 - parseFloat(variantData.discount.discountValue) / 100)).toFixed(2)
                      : variantData.discount?.discountType === 'flat' && variantData.discount?.discountValue
                      ? (parseFloat(variantData.price) - parseFloat(variantData.discount.discountValue)).toFixed(2)
                      : variantData.price;

                    return (
                      <div key={index} className="border rounded-lg p-3 bg-white">
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
                                  <span className="text-sm font-medium">
                                    Variant {index + 1}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Stock: {variantData.quantity} units
                                </div>
                              </div>
                              
                              <div className="text-right">
                                {variantData.discount?.discountType !== 'none' && variantData.discount?.discountValue ? (
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
                                        : `$${variantData.discount.discountValue} OFF`
                                      }
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
                  {variants.length > 0 && !variants.some((_v, i) => 
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