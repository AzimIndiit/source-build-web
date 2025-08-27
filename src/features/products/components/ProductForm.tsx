import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Calendar, Clock, ChevronLeft } from 'lucide-react';
import { Button, Card, Checkbox } from '@/components/ui';
import { FormInput } from '@/components/forms/FormInput';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { FormSelect } from '@/components/forms/FormSelect';
import { PickupHoursSelector } from './PickupHoursSelector';
import { UseFormReturn } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ProductFormProps {
  methods: UseFormReturn<any>;
  uploadedPhotos: File[];
  setUploadedPhotos: React.Dispatch<React.SetStateAction<File[]>>;
  imageError: boolean;
  setImageError: React.Dispatch<React.SetStateAction<boolean>>;
  variants: Array<{ id: string; images: File[] }>;
  showVariants: boolean;
  setCurrentStep?: React.Dispatch<React.SetStateAction<number>>;
  setShowVariants: React.Dispatch<React.SetStateAction<boolean>>;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (index: number) => void;
  addVariant: () => void;
  removeVariant: (variantId: string) => void;
  handleVariantImageUpload: (variantId: string, files: File[]) => void;
  removeVariantImage: (variantId: string, imageIndex: number) => void;
  handleVariantDrag: (e: React.DragEvent, variantId: string) => void;
  handleVariantDrop: (e: React.DragEvent, variantId: string) => void;
  dragActive: boolean;
  variantDragActive: string | null;
  MAX_IMAGES: number;
  categoryOptions: Array<{ value: string; label: string }>;
  subCategoryOptions: Array<{ value: string; label: string }>;
  tagOptions: Array<{ value: string; label: string }>;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  methods,
  uploadedPhotos,
  imageError,
  setImageError,
  variants,
  showVariants,
  handleDrag,
  handleDrop,
  handleFileChange,
  removePhoto,
  addVariant,
  removeVariant,
  handleVariantImageUpload,
  removeVariantImage,
  handleVariantDrag,
  handleVariantDrop,
  dragActive,
  variantDragActive,
  MAX_IMAGES,
  categoryOptions,
  subCategoryOptions,
  tagOptions,
}) => {
  const {
    watch,
    setValue,
    clearErrors,
    formState: { errors },
    trigger,
  } = methods;
  const formValues = watch();
  const [currentStep, setCurrentStep] = useState(1);

  // Validate Step 1 fields
  const validateStep1 = async () => {
    // Check for images first
    if (uploadedPhotos.length === 0) {
      setImageError(true);
      toast.error('Please upload at least one product image');
      return false;
    }
    setImageError(false);

    // Validate required fields for step 1
    const step1Fields = [
      'title',
      'price',
      'description',
      'category',
      'subCategory',
      'quantity',
      'brand',
      'color',
      'locationAddress',
      'productTag',
    ];

    const isValid = await trigger(step1Fields);

    if (!isValid) {
      // Find first error field and show message
      const firstErrorField = step1Fields.find((field) => errors[field]);
      if (firstErrorField && errors[firstErrorField]) {
        const errorMessage = errors[firstErrorField]?.message;
        if (errorMessage) {
          toast.error(errorMessage as string);
        }
      }
    }

    return isValid;
  };

  // Handle Next button click
  const handleNextClick = async () => {
    const isValid = await validateStep1();
    if (isValid) {
      setCurrentStep(2);
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Back button click
  const handleBackClick = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full h-full ">
      <Card className="p-0 bg-white rounded-xl shadow-sm border-gray-200 h-full flex flex-col ">
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6">
          {/* Step 1: Product Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>

              {/* Photos Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className={`text-sm font-medium ${imageError ? 'text-red-600' : 'text-gray-900'}`}
                  >
                    Photos · {uploadedPhotos.length}/{MAX_IMAGES} - You can add up to {MAX_IMAGES}{' '}
                    photos.
                    <span className="text-red-500">*</span>
                  </h3>
                </div>

                {uploadedPhotos.length === 0 ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center ${
                      imageError ? 'bg-red-50' : 'bg-gray-50'
                    } ${
                      dragActive
                        ? 'border-primary bg-blue-50'
                        : imageError
                          ? 'border-red-300'
                          : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="photo-upload"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer inline-flex flex-col items-center"
                    >
                      <Upload className="h-10 w-10 text-gray-400 mb-3" />
                      <span className="text-sm text-gray-600">
                        Drag & drop media or{' '}
                        <span className="text-primary underline">click here</span>
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 text-center bg-gray-50 ${
                        dragActive ? 'border-primary bg-blue-50' : 'border-gray-300'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        id="photo-upload-more"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="photo-upload-more"
                        className="cursor-pointer inline-flex items-center gap-2"
                      >
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Drag & drop media or{' '}
                          <span className="text-primary underline">click here</span>
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
                      {uploadedPhotos.map((file, index) => (
                        <div
                          key={index}
                          className="relative group border border-gray-200 rounded-sm shadow-sm"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 sm:h-24 md:h-28 lg:h-16 object-cover rounded-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {imageError && (
                  <p className="text-red-500 text-xs mt-2">At least one image is required</p>
                )}
              </div>

              {/* Form Fields */}
              <div className="">
                <FormInput
                  name="title"
                  label="Title"
                  placeholder="Primed MDF 3.25″ Casing, 7′ x 1/2"
                  className="border-gray-300 h-[53px] "
                />
              </div>

              <div>
                <FormInput
                  name="price"
                  label="Price ($)"
                  placeholder="$300.00"
                  type="text"
                  className="border-gray-300 h-[53px]"
                  onInput={(e: React.FormEvent<HTMLInputElement>) => {
                    const input = e.currentTarget;
                    const value = input.value;
                    const cleaned = value.replace(/[^0-9.]/g, '');
                    const parts = cleaned.split('.');
                    if (parts.length > 2) {
                      input.value = parts[0] + '.' + parts.slice(1).join('');
                    } else if (parts.length === 2 && parts[1].length > 2) {
                      input.value = parts[0] + '.' + parts[1].substring(0, 2);
                    } else {
                      input.value = cleaned;
                    }
                  }}
                />
              </div>

              <div>
                <FormTextarea
                  name="description"
                  label="Description"
                  placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                  rows={3}
                  className="border-gray-300 resize-none rounded-sm"
                />
              </div>

              <div>
                <FormSelect
                  name="category"
                  label="Category"
                  placeholder="Commercial Doors"
                  options={categoryOptions}
                  className="h-[53px]"
                />
              </div>

              <div>
                <FormSelect
                  name="subCategory"
                  label="Sub Category"
                  placeholder="Glass Doors"
                  options={subCategoryOptions}
                  className="h-[53px]"
                />
              </div>

              <div>
                <FormInput
                  name="quantity"
                  label="Quantity"
                  placeholder="2"
                  type="number"
                  className="border-gray-300 h-[53px]"
                  min="1"
                  step="1"
                  onInput={(e: React.FormEvent<HTMLInputElement>) => {
                    const input = e.currentTarget;
                    const value = input.value.replace(/[^0-9]/g, '');
                    input.value = value.replace(/^0+/, '') || '';
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (['.', '-', '+', 'e', 'E'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>

              <div>
                <FormInput
                  name="brand"
                  label="Brand"
                  placeholder="Styling"
                  className="border-gray-300 h-[53px]"
                />
              </div>

              <div>
                <div className="flex gap-2 items-center">
                  <FormInput
                    name="color"
                    label="Color (HEX)"
                    type="text"
                    placeholder="#FF0000"
                    className="flex-1 h-[53px]"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    maxLength={7}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const input = e.currentTarget;
                      let value = input.value.toUpperCase();

                      if (value.length === 1 && value !== '#' && /[A-Fa-f0-9]/.test(value)) {
                        value = '#' + value;
                      }

                      value = value.replace(/[^#A-Fa-f0-9]/g, '');

                      if (value.indexOf('#') > 0) {
                        value = '#' + value.replace(/#/g, '');
                      }

                      input.value = value;
                      clearErrors('color');
                    }}
                  />
                  <input
                    type="color"
                    value={formValues.color || '#000000'}
                    onChange={(e) => setValue(`color`, e.target.value)}
                    className={`w-[53px] h-[53px] ${errors.color ? 'mt-0' : 'mt-5'} rounded border border-gray-300 cursor-pointer flex-shrink-0`}
                  />
                </div>
              </div>

              <div>
                <FormInput
                  name="locationAddress"
                  label="Location Address"
                  placeholder="123 High Street London, W1A 1AA UK"
                  className="border-gray-300 h-[53px]"
                />
              </div>

              {/* Product Dimensions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Product Dimensions (Optional)</h4>
                <div className="grid grid-cols-3 gap-2">
                  <FormInput
                    name="dimensions.width"
                    label="Width (inches)"
                    placeholder="24"
                    type="text"
                    className="border-gray-300 h-[53px]"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const input = e.currentTarget;
                      const value = input.value;
                      const cleaned = value.replace(/[^0-9.]/g, '');
                      const parts = cleaned.split('.');
                      if (parts.length > 2) {
                        input.value = parts[0] + '.' + parts.slice(1).join('');
                      } else if (parts.length === 2 && parts[1].length > 2) {
                        input.value = parts[0] + '.' + parts[1].substring(0, 2);
                      } else {
                        input.value = cleaned;
                      }
                    }}
                  />
                  <FormInput
                    name="dimensions.length"
                    label="Length (inches)"
                    placeholder="36"
                    type="text"
                    className="border-gray-300 h-[53px]"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const input = e.currentTarget;
                      const value = input.value;
                      const cleaned = value.replace(/[^0-9.]/g, '');
                      const parts = cleaned.split('.');
                      if (parts.length > 2) {
                        input.value = parts[0] + '.' + parts.slice(1).join('');
                      } else if (parts.length === 2 && parts[1].length > 2) {
                        input.value = parts[0] + '.' + parts[1].substring(0, 2);
                      } else {
                        input.value = cleaned;
                      }
                    }}
                  />
                  <FormInput
                    name="dimensions.height"
                    label="Height (inches)"
                    placeholder="30"
                    type="text"
                    className="border-gray-300 h-[53px]"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const input = e.currentTarget;
                      const value = input.value;
                      const cleaned = value.replace(/[^0-9.]/g, '');
                      const parts = cleaned.split('.');
                      if (parts.length > 2) {
                        input.value = parts[0] + '.' + parts.slice(1).join('');
                      } else if (parts.length === 2 && parts[1].length > 2) {
                        input.value = parts[0] + '.' + parts[1].substring(0, 2);
                      } else {
                        input.value = cleaned;
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <FormSelect
                  name="productTag"
                  label="Product Tag"
                  placeholder="Select or create tags"
                  options={tagOptions}
                  multiple={true}
                  searchable={true}
                  creatable={true}
                  className="h-[53px]"
                  createPlaceholder='Add "{search}" as a new tag'
                  searchPlaceholder="Type to search or create tags..."
                  maxSelections={10}
                />
              </div>

              <div className="space-y-4">
                <FormSelect
                  name={`discount.discountType`}
                  label="Discount Type"
                  placeholder="Select Discount Type"
                  options={[
                    { value: 'none', label: 'No Discount' },
                    { value: 'flat', label: 'Flat Amount' },
                    { value: 'percentage', label: 'Percentage' },
                  ]}
                  className="text-sm h-[53px]"
                />
                {formValues.discount?.discountType !== 'none' && (
                  <FormInput
                    name={`discount.discountValue`}
                    label="Discount Value"
                    placeholder={
                      formValues.discount.discountType === 'percentage' ? '10%' : '10.00'
                    }
                    className="text-sm h-[53px]"
                    type="text"
                    min="0"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const input = e.currentTarget;
                      const value = input.value;
                      const isPercentage = formValues.discount.discountType === 'percentage';

                      let cleaned = value.replace(/[^0-9.]/g, '');
                      cleaned = cleaned.replace(/^-/, '');

                      const parts = cleaned.split('.');
                      if (parts.length > 2) {
                        cleaned = parts[0] + '.' + parts.slice(1).join('');
                      }

                      if (parts.length === 2 && parts[1].length > 2) {
                        cleaned = parts[0] + '.' + parts[1].substring(0, 2);
                      }

                      if (isPercentage) {
                        const numValue = parseFloat(cleaned);
                        if (!isNaN(numValue) && numValue > 100) {
                          cleaned = '100';
                        }
                      }

                      input.value = cleaned;
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === '-') {
                        e.preventDefault();
                      }
                    }}
                  />
                )}
              </div>

              {/* Product Variants Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-gray-900">
                    Product Variants
                    <span className="text-sm text-gray-500 ml-2">({variants.length}/5)</span>
                  </h3>
                  <Button
                    type="button"
                    onClick={addVariant}
                    variant="outline"
                    className="flex items-center gap-2 text-sm h-[48px] border border-primary text-primary hover:text-primary hover:bg-primary/10"
                    disabled={variants.length >= 5}
                  >
                    <Plus className="h-4 w-4" />
                    Add Variant
                  </Button>
                </div>

                {showVariants && variants.length > 0 && (
                  <div className="space-y-4">
                    {variants.map((variant, variantIndex) => (
                      <Card
                        key={variant.id}
                        className="p-4 border-2 border-gray-200 shadow-md gap-2"
                      >
                        <div className="flex items-center justify-between h-10">
                          <h4 className="font-medium text-sm">Variant {variantIndex + 1}</h4>
                          <Button
                            type="button"
                            onClick={() => removeVariant(variant.id)}
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 p-1 h-10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <hr className="my-0 py-0 text-gray-200" />

                        {/* Variant Images */}
                        <div className="my-3">
                          <label className="text-xs font-medium text-gray-700 mb-2 block">
                            Variant Images (Max 5)
                          </label>

                          {variant.images.length === 0 ? (
                            <div
                              className={`border-2 border-dashed rounded-lg p-4 text-center bg-gray-50 ${
                                variantDragActive === variant.id
                                  ? 'border-primary bg-blue-50'
                                  : 'border-gray-300'
                              }`}
                              onDragEnter={(e) => handleVariantDrag(e, variant.id)}
                              onDragLeave={(e) => handleVariantDrag(e, variant.id)}
                              onDragOver={(e) => handleVariantDrag(e, variant.id)}
                              onDrop={(e) => handleVariantDrop(e, variant.id)}
                            >
                              <input
                                type="file"
                                id={`variant-photo-upload-${variant.id}`}
                                className="hidden"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files) {
                                    const files = Array.from(e.target.files);
                                    handleVariantImageUpload(variant.id, files);
                                  }
                                  e.target.value = '';
                                }}
                              />
                              <label
                                htmlFor={`variant-photo-upload-${variant.id}`}
                                className="cursor-pointer inline-flex flex-col items-center"
                              >
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-xs text-gray-600">
                                  Drag & drop media or{' '}
                                  <span className="text-primary underline">click here</span>
                                </span>
                              </label>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div
                                className={`border-2 border-dashed rounded-lg p-3 text-center bg-gray-50 ${
                                  variantDragActive === variant.id
                                    ? 'border-primary bg-blue-50'
                                    : 'border-gray-300'
                                }`}
                                onDragEnter={(e) => handleVariantDrag(e, variant.id)}
                                onDragLeave={(e) => handleVariantDrag(e, variant.id)}
                                onDragOver={(e) => handleVariantDrag(e, variant.id)}
                                onDrop={(e) => handleVariantDrop(e, variant.id)}
                              >
                                <input
                                  type="file"
                                  id={`variant-photo-upload-more-${variant.id}`}
                                  className="hidden"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files) {
                                      const files = Array.from(e.target.files);
                                      handleVariantImageUpload(variant.id, files);
                                    }
                                    e.target.value = '';
                                  }}
                                />
                                <label
                                  htmlFor={`variant-photo-upload-more-${variant.id}`}
                                  className="cursor-pointer inline-flex items-center gap-2"
                                >
                                  <Upload className="h-4 w-4 text-gray-400" />
                                  <span className="text-xs text-gray-600">
                                    Drag & drop media or{' '}
                                    <span className="text-primary underline">click here</span>
                                  </span>
                                </label>
                              </div>

                              <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
                                {variant.images.map((image, imgIndex) => (
                                  <div
                                    key={imgIndex}
                                    className="relative group border border-gray-200 rounded-sm shadow-sm"
                                  >
                                    <img
                                      src={URL.createObjectURL(image)}
                                      alt={`Variant ${variantIndex + 1} Image ${imgIndex + 1}`}
                                      className="w-full sm:h-24 md:h-28  h-20 lg:h-16 object-cover rounded-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeVariantImage(variant.id, imgIndex)}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Variant Form Fields */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex gap-2">
                              <FormInput
                                name={`variants.${variantIndex}.color`}
                                label="Color (HEX)"
                                type="text"
                                placeholder="#FF0000"
                                className="flex-1 h-[53px]"
                                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                maxLength={7}
                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                  const input = e.currentTarget;
                                  let value = input.value.toUpperCase();

                                  if (
                                    value.length === 1 &&
                                    value !== '#' &&
                                    /[A-Fa-f0-9]/.test(value)
                                  ) {
                                    value = '#' + value;
                                  }

                                  value = value.replace(/[^#A-Fa-f0-9]/g, '');

                                  if (value.indexOf('#') > 0) {
                                    value = '#' + value.replace(/#/g, '');
                                  }

                                  input.value = value;
                                }}
                              />
                              <input
                                type="color"
                                value={formValues.variants?.[variantIndex]?.color || '#000000'}
                                onChange={(e) =>
                                  setValue(`variants.${variantIndex}.color`, e.target.value)
                                }
                                className={`w-[53px] h-[53px] mt-5 rounded border border-gray-300 cursor-pointer flex-shrink-0`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <FormInput
                                name={`variants.${variantIndex}.quantity`}
                                label="Quantity"
                                placeholder="10"
                                type="number"
                                className="text-sm"
                                min="1"
                                step="1"
                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                  const input = e.currentTarget;
                                  const value = input.value.replace(/[^0-9]/g, '');
                                  input.value = value.replace(/^0+/, '') || '';
                                }}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                  if (['.', '-', '+', 'e', 'E'].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <FormInput
                                name={`variants.${variantIndex}.price`}
                                label="Price ($)"
                                placeholder="$99.99"
                                type="text"
                                className="text-sm"
                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                  const input = e.currentTarget;
                                  const value = input.value;
                                  const cleaned = value.replace(/[^0-9.]/g, '');
                                  const parts = cleaned.split('.');
                                  if (parts.length > 2) {
                                    input.value = parts[0] + '.' + parts.slice(1).join('');
                                  } else if (parts.length === 2 && parts[1].length > 2) {
                                    input.value = parts[0] + '.' + parts[1].substring(0, 2);
                                  } else {
                                    input.value = cleaned;
                                  }
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <FormSelect
                              name={`variants.${variantIndex}.discount.discountType`}
                              label="Discount Type"
                              placeholder="Select Discount Type"
                              options={[
                                { value: 'none', label: 'No Discount' },
                                { value: 'flat', label: 'Flat Amount' },
                                { value: 'percentage', label: 'Percentage' },
                              ]}
                              className="text-sm h-[53px]"
                            />
                            {formValues.variants?.[variantIndex]?.discount?.discountType !==
                              'none' && (
                              <FormInput
                                name={`variants.${variantIndex}.discount.discountValue`}
                                label=""
                                placeholder={
                                  formValues.variants?.[variantIndex]?.discount?.discountType ===
                                  'percentage'
                                    ? '10%'
                                    : '10.00'
                                }
                                className="text-sm h-[53px]"
                                type="text"
                                min="0"
                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                  const input = e.currentTarget;
                                  const value = input.value;
                                  const isPercentage =
                                    formValues.variants?.[variantIndex]?.discount?.discountType ===
                                    'percentage';

                                  let cleaned = value.replace(/[^0-9.]/g, '');
                                  cleaned = cleaned.replace(/^-/, '');

                                  const parts = cleaned.split('.');
                                  if (parts.length > 2) {
                                    cleaned = parts[0] + '.' + parts.slice(1).join('');
                                  }

                                  if (parts.length === 2 && parts[1].length > 2) {
                                    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
                                  }

                                  if (isPercentage) {
                                    const numValue = parseFloat(cleaned);
                                    if (!isNaN(numValue) && numValue > 100) {
                                      cleaned = '100';
                                    }
                                  }

                                  input.value = cleaned;
                                }}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                  if (e.key === '-') {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {!showVariants && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Add variants to offer different options like colors, sizes, or styles for your
                    product.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Marketplace Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Marketplace Options */}

              <div className="space-y-2 mb-4">
                <h3 className="text-base font-medium text-gray-900">Marketplace</h3>
                <RadioGroup
                  value={
                    formValues.marketplaceOptions?.pickup
                      ? 'pickup'
                      : formValues.marketplaceOptions?.shipping
                        ? 'shipping'
                        : formValues.marketplaceOptions?.delivery
                          ? 'delivery'
                          : ''
                  }
                  onValueChange={(value) => {
                    setValue('marketplaceOptions', {
                      pickup: value === 'pickup',
                      shipping: value === 'shipping',
                      delivery: value === 'delivery',
                    });
                  }}
                  className=""
                >
                  <label
                    htmlFor="pickup"
                    className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                  >
                    <RadioGroupItem
                      id="pickup"
                      value="pickup"
                      className="h-5 w-5 border-gray-300 "
                    />
                    <span className="text-sm font-medium leading-none">Pickup</span>
                  </label>

                  <label
                    htmlFor="shipping"
                    className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                  >
                    <RadioGroupItem
                      id="shipping"
                      value="shipping"
                      className="h-5 w-5 border-gray-300 "
                    />
                    <span className="text-sm font-medium leading-none">Shipping</span>
                  </label>

                  <label
                    htmlFor="delivery"
                    className="flex items-center space-x-3 p-2 rounded-md cursor-pointer"
                  >
                    <RadioGroupItem
                      id="delivery"
                      value="delivery"
                      className="h-5 w-5 border-gray-300 "
                    />
                    <span className="text-sm font-medium leading-none">Delivery</span>
                  </label>
                </RadioGroup>
              </div>

              {/* Conditional Fields based on selected options */}
              {formValues.marketplaceOptions?.pickup && (
                <div className="mb-4 mt-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Pickup Hours
                  </label>
                  <PickupHoursSelector
                    value={formValues.pickupHours}
                    onChange={(value) => setValue('pickupHours', value)}
                  />
                </div>
              )}

              {formValues.marketplaceOptions?.shipping && (
                <div className="mb-4">
                  <FormInput
                    name="shippingPrice"
                    label="Shipping Price ($)"
                    placeholder="$10.00"
                    type="text"
                    className="border-gray-300 h-[53px]"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const input = e.currentTarget;
                      const value = input.value;
                      const cleaned = value.replace(/[^0-9.]/g, '');
                      const parts = cleaned.split('.');
                      if (parts.length > 2) {
                        input.value = parts[0] + '.' + parts.slice(1).join('');
                      } else if (parts.length === 2 && parts[1].length > 2) {
                        input.value = parts[0] + '.' + parts[1].substring(0, 2);
                      } else {
                        input.value = cleaned;
                      }
                    }}
                  />
                </div>
              )}

              {/* Ready By Date and Time */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Ready By</h4>
                <div>
                  <div className="relative">
                    <FormInput
                      name="readyByDate"
                      label="Ready By Date"
                      type="date"
                      placeholder="Select date"
                      className="border-gray-300 h-[53px] pr-10 cursor-pointer w-full [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden"
                      onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                        (e.target as HTMLInputElement).showPicker?.();
                      }}
                    />
                    <Calendar className="absolute right-3 top-[38px] h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <FormInput
                      name="readyByTime"
                      label="Choose Time"
                      type="time"
                      placeholder="Select time"
                      className="border-gray-300 h-[53px] pr-10 cursor-pointer w-full [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden"
                      onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                        (e.target as HTMLInputElement).showPicker?.();
                      }}
                    />
                    <Clock className="absolute right-3 top-[38px] h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Progress Bar and Action Buttons */}
        <div className="pt-4 space-y-4 flex-shrink-0 p-4 sm:p-6">
          <div className="flex gap-2">
            <div
              className={`h-1 flex-1 ${currentStep >= 1 ? 'bg-primary' : 'bg-gray-200'} rounded-full`}
            ></div>
            <div
              className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'} rounded-full`}
            ></div>
          </div>

          {currentStep === 1 ? (
            <Button
              type="button"
              onClick={handleNextClick}
              className="w-full bg-gray-200 h-[48px] hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg"
            >
              Next
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={handleBackClick}
                className="bg-gray-200 h-[48px] hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-primary h-[48px] hover:bg-primary/80 text-white font-medium py-3 rounded-lg"
              >
                Publish
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
