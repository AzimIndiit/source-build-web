import { useState, useCallback, useEffect } from 'react';
import { useForm, FormProvider, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { ProductForm } from '../components/ProductForm';
import { ProductPreview } from '../components/ProductPreview';
import { EditProductPageSkeleton } from '../components/EditProductPageSkeleton';
import { AddSavedAddressModal } from '@/features/profile/components/AddSavedAddressModal';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import {
  useSavedAddresssQuery,
  useCreateSavedAddressMutation,
} from '@/features/profile/hooks/useSavedAddressMutations';
import {
  SavedAddress,
  CreateSavedAddressPayload,
} from '@/features/profile/services/addressService';
import {
  useUpdateProductMutation,
  useProductByIdQuery,
  useSaveDraftMutation,
} from '../hooks/useProductMutations';
import { format } from 'date-fns';
import { Button } from '@/components/ui';
import { validateMultipleImages } from '@/utils/imageValidation';

// Variant schema
const variantSchema = z.object({
  color: z
    .string()
    .trim()
    .min(1, 'Color is required')
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid HEX color code'),
  quantity: z
    .string()
    .trim()
    .min(0, 'Quantity is required')
    .regex(/^\d+$/, 'Quantity must be a whole number')
    .refine((val) => parseInt(val) >= 0, 'Quantity must be at least 0'),
  price: z
    .string()
    .trim()
    .min(1, 'Price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number')
    .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0'),
  discount: z
    .object({
      discountType: z.enum(['none', 'flat', 'percentage']),
      discountValue: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.discountType !== 'none') {
          return data.discountValue && data.discountValue.trim().length > 0;
        }
        return true;
      },
      {
        message: 'Discount value is required when discount type is selected',
        path: ['discountValue'],
      }
    )
    .refine(
      (data) => {
        if (data.discountType === 'percentage' && data.discountValue) {
          const value = parseFloat(data.discountValue);
          return !isNaN(value) && value >= 0 && value <= 100;
        }
        return true;
      },
      {
        message: 'Percentage discount must be between 0 and 100',
        path: ['discountValue'],
      }
    )
    .refine(
      (data) => {
        if (data.discountType === 'flat' && data.discountValue) {
          const value = parseFloat(data.discountValue);
          return !isNaN(value) && value >= 0;
        }
        return true;
      },
      {
        message: 'Flat discount must be a positive number',
        path: ['discountValue'],
      }
    ),
});

const editProductSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must not exceed 100 characters'),

    price: z
      .string()
      .trim()
      .min(1, 'Price is required')
      .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number with up to 2 decimal places')
      .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0')
      .refine((val) => parseFloat(val) <= 999999.99, 'Price must not exceed 999,999.99'),

    description: z
      .string()
      .trim()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description must not exceed 2000 characters'),

    category: z
      .string()
      .trim()
      .min(1, 'Category is required')
      .max(50, 'Category must not exceed 50 characters'),

    subCategory: z
      .string()
      .trim()
      .min(1, 'Sub category is required')
      .max(50, 'Sub category must not exceed 50 characters'),

    quantity: z
      .string()
      .trim()
      .min(0, 'Quantity is required')
      .regex(/^\d+$/, 'Quantity must be a whole number')
      .refine((val) => parseInt(val) >= 0, 'Quantity must be at least 0')
      .refine((val) => parseInt(val) <= 99999, 'Quantity must not exceed 99,999'),

    brand: z
      .string()
      .trim()
      .min(2, 'Brand must be at least 2 characters')
      .max(50, 'Brand must not exceed 50 characters')
      .regex(
        /^[a-zA-Z0-9\s\-&.]+$/,
        'Brand can only contain letters, numbers, spaces, hyphens, ampersands, and periods'
      ),

    color: z
      .string()
      .trim()
      .min(1, 'Color is required')
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Please enter a valid HEX color code (e.g., #FF0000)'
      ),

    locationIds: z
      .array(z.string())
      .min(1, 'At least one location is required')
      .max(10, 'Maximum 10 locations allowed'),

    productTag: z
      .array(
        z
          .string()
          .trim()
          .min(2, 'Each tag must be at least 2 characters')
          .max(30, 'Each tag must not exceed 30 characters')
          .regex(
            /^[a-zA-Z0-9\s\-#]+$/,
            'Tags can only contain letters, numbers, spaces, hyphens, and hashtags'
          )
      )
      .min(1, 'At least one product tag is required')
      .max(10, 'Maximum 10 tags allowed'),

    variants: z.array(variantSchema).max(5, 'Maximum 5 variants allowed').optional(),

    // Marketplace fields
    marketplaceOptions: z
      .object({
        pickup: z.boolean().optional(),
        shipping: z.boolean().optional(),
        delivery: z.boolean().optional(),
      })
      .required()
      .refine(
        (options) => {
          // At least one option must be selected
          return options.pickup || options.shipping || options.delivery;
        },
        {
          message:
            'At least one marketplace option (Pickup, Shipping, or Delivery) must be selected',
        }
      ),

    pickupHours: z
      .string()
      .trim()
      .max(100, 'Pickup hours must not exceed 100 characters')
      .optional(),

    shippingPrice: z.string().trim().optional(),

    readyByDate: z.string().min(1, 'Date is required'),

    readyByTime: z.string().min(1, 'Time is required'),

    dimensions: z
      .object({
        width: z.string().optional(),
        length: z.string().optional(),
        height: z.string().optional(),
      })
      .optional(),

    discount: z
      .object({
        discountType: z.enum(['none', 'flat', 'percentage']),
        discountValue: z.string().optional(),
      })
      .refine(
        (data) => {
          if (data.discountType !== 'none') {
            return data.discountValue && data.discountValue.trim().length > 0;
          }
          return true;
        },
        {
          message: 'Discount value is required when discount type is selected',
          path: ['discountValue'],
        }
      )
      .refine(
        (data) => {
          if (data.discountType === 'percentage' && data.discountValue) {
            const value = parseFloat(data.discountValue);
            return !isNaN(value) && value >= 0 && value <= 100;
          }
          return true;
        },
        {
          message: 'Percentage discount must be between 0 and 100',
          path: ['discountValue'],
        }
      )
      .refine(
        (data) => {
          if (data.discountType === 'flat' && data.discountValue) {
            const value = parseFloat(data.discountValue);
            return !isNaN(value) && value >= 0;
          }
          return true;
        },
        {
          message: 'Flat discount must be a positive number',
          path: ['discountValue'],
        }
      ),
  })
  .refine(
    (data) => {
      // If pickup is selected, pickup hours must be provided
      if (data.marketplaceOptions?.pickup && !data.pickupHours?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: 'Pickup hours are required when pickup option is selected',
      path: ['pickupHours'],
    }
  )
  .refine(
    (data) => {
      // If shipping is selected, shipping price must be provided
      if (data.marketplaceOptions?.shipping && !data.shippingPrice?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: 'Shipping price is required when shipping option is selected',
      path: ['shippingPrice'],
    }
  )
  .refine(
    (data) => {
      // Validate shipping price format if provided
      if (data.marketplaceOptions?.shipping && data.shippingPrice?.trim()) {
        const regex = /^\d+(\.\d{1,2})?$/;
        if (!regex.test(data.shippingPrice)) {
          return false;
        }
        const value = parseFloat(data.shippingPrice);
        if (isNaN(value) || value < 0) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Shipping price must be a valid positive number',
      path: ['shippingPrice'],
    }
  )
  .superRefine((data, ctx) => {
    if (data.marketplaceOptions?.pickup && !data.pickupHours?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['pickupHours'],
        message: 'Pickup hours are required when pickup option is selected',
      });
    }

    if (data.marketplaceOptions?.shipping) {
      if (!data.shippingPrice?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['shippingPrice'],
          message: 'Shipping price is required when shipping option is selected',
        });
      } else {
        const regex = /^\d+(\.\d{1,2})?$/;
        if (!regex.test(data.shippingPrice)) {
          ctx.addIssue({
            code: 'custom',
            path: ['shippingPrice'],
            message: 'Shipping price must be a valid number with up to 2 decimals',
          });
        } else if (parseFloat(data.shippingPrice) < 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['shippingPrice'],
            message: 'Shipping price must be greater than or equal to 0',
          });
        }
      }
    }
  });

type EditProductForm = z.infer<typeof editProductSchema>;

// Create options with lowercase values to match backend
const categoryOptions = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'commercial doors', label: 'Commercial Doors' },
];

// Category to subcategory mapping
const categorySubcategoryMap: Record<string, Array<{ value: string; label: string }>> = {
  electronics: [
    { value: 'phones', label: 'Phones' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'tablets', label: 'Tablets' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'cameras', label: 'Cameras' },
    { value: 'accessories', label: 'Accessories' },
  ],
  clothing: [
    { value: 'mens', label: "Men's Clothing" },
    { value: 'womens', label: "Women's Clothing" },
    { value: 'kids', label: "Kids' Clothing" },
    { value: 'shoes', label: 'Shoes' },
    { value: 'accessories', label: 'Accessories' },
  ],
  home: [
    { value: 'furniture', label: 'Furniture' },
    { value: 'decor', label: 'Decor' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'garden', label: 'Garden' },
  ],
  'home & garden': [
    { value: 'furniture', label: 'Furniture' },
    { value: 'decor', label: 'Decor' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'garden', label: 'Garden' },
  ],
  sports: [
    { value: 'fitness equipment', label: 'Fitness Equipment' },
    { value: 'outdoor gear', label: 'Outdoor Gear' },
    { value: 'sportswear', label: 'Sportswear' },
    { value: 'accessories', label: 'Accessories' },
  ],
  'sports & outdoors': [
    { value: 'fitness equipment', label: 'Fitness Equipment' },
    { value: 'outdoor gear', label: 'Outdoor Gear' },
    { value: 'sportswear', label: 'Sportswear' },
    { value: 'accessories', label: 'Accessories' },
  ],
  accessories: [
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'bags', label: 'Bags' },
    { value: 'watches', label: 'Watches' },
    { value: 'belts', label: 'Belts' },
    { value: 'other', label: 'Other' },
  ],
  commercial: [
    { value: 'equipment', label: 'Equipment' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'tools', label: 'Tools' },
  ],
  'commercial doors': [
    { value: 'doors', label: 'Doors' },
    { value: 'windows', label: 'Windows' },
    { value: 'glass doors', label: 'Glass Doors' },
    { value: 'frames', label: 'Frames' },
    { value: 'hardware', label: 'Hardware' },
  ],
  // Add mappings for variations in category names from backend
};

const tagOptions = [
  { value: 'casing', label: 'Casing' },
  { value: 'trim', label: 'Trim' },
  { value: 'molding', label: 'Molding' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'doors', label: 'Doors' },
  { value: 'windows', label: 'Windows' },
  { value: 'glass', label: 'Glass' },
  { value: 'locks', label: 'Locks' },
  { value: 'hinges', label: 'Hinges' },
  { value: 'frames', label: 'Frames' },
  { value: 'panels', label: 'Panels' },
  { value: 'handles', label: 'Handles' },
];

const MAX_IMAGES = 5;

function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [variants, setVariants] = useState<
    Array<{ id: string; images: File[]; existingImages?: string[] }>
  >([]);
  const [showVariants, setShowVariants] = useState(false);
  const [variantDragActive, setVariantDragActive] = useState<string | null>(null);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);

  const { data: productData, isLoading: isLoadingProduct } = useProductByIdQuery(id || '');
  const { data: addressesData, refetch: refetchAddresses } = useSavedAddresssQuery();
  const createAddressMutation = useCreateSavedAddressMutation();
  const updateProductMutation = useUpdateProductMutation();
  const saveDraftMutation = useSaveDraftMutation();

  const savedAddresses = Array.isArray(addressesData?.data)
    ? addressesData.data
    : addressesData?.data
      ? [addressesData.data]
      : [];

  const addressOptions = savedAddresses.map((address: SavedAddress) => ({
    value: address.id || address._id || '',
    label: `${address.name} , ${address.formattedAddress}` || '',
  }));

  const methods = useForm<EditProductForm>({
    resolver: zodResolver(editProductSchema),
    mode: 'onChange', // Enable real-time validation
    reValidateMode: 'onChange', // Re-validate on every change
    defaultValues: {
      title: '',
      price: '',
      description: '',
      category: '',
      subCategory: '',
      quantity: '',
      brand: '',
      color: '#000000',
      locationIds: [],
      productTag: [],
      variants: [],
      marketplaceOptions: {
        pickup: false,
        shipping: false,
        delivery: false,
      },
      pickupHours: '',
      shippingPrice: '',
      readyByDate: '',
      readyByTime: '',
      dimensions: {
        width: '',
        length: '',
        height: '',
      },
      discount: {
        discountType: 'none',
        discountValue: '',
      },
    },
  });

  const { handleSubmit, watch, reset, setValue } = methods;
  const formValues = watch();

  // Get subcategory options based on selected category
  // Check both exact match and lowercase match for category
  let subCategoryOptions = formValues.category
    ? [
        ...(categorySubcategoryMap[formValues.category] ||
          categorySubcategoryMap[formValues.category.toLowerCase()] ||
          []),
      ]
    : [];

  // If we have a subcategory value but no options (for custom categories from backend),
  // create an option for it
  const currentSubCategory = formValues.subCategory;

  console.log('=== SubCategory Debug ===');
  console.log('Current category:', formValues.category);
  console.log('Current subCategory value:', currentSubCategory);
  console.log('SubCategory options before adding current:', subCategoryOptions);

  if (currentSubCategory && subCategoryOptions.length === 0 && formValues.category) {
    subCategoryOptions.push({ value: currentSubCategory, label: currentSubCategory });
    console.log('Added subcategory because no options available');
  } else if (
    currentSubCategory &&
    !subCategoryOptions.find((opt) => opt.value.toLowerCase() === currentSubCategory.toLowerCase())
  ) {
    // Add current subcategory if it's not in the options list (case-insensitive check)
    subCategoryOptions.push({ value: currentSubCategory, label: currentSubCategory });
    console.log('Added subcategory because not in options list');
  }

  console.log('Final subCategory options:', subCategoryOptions);
  console.log('=== End SubCategory Debug ===');

  // Force update subcategory when data is loaded
  useEffect(() => {
    if (isInitialDataLoaded && currentSubCategory) {
      console.log('Forcing subcategory update after initial load:', currentSubCategory);
      methods.setValue('subCategory', currentSubCategory);
    }
  }, [isInitialDataLoaded, currentSubCategory, methods]);

  // Reset subcategory when category changes (but not during initial load)
  useEffect(() => {
    // Skip this effect during initial data load
    if (!isInitialDataLoaded) return;

    if (formValues.category) {
      const currentSubcategory = formValues.subCategory;
      const availableSubcategories =
        categorySubcategoryMap[formValues.category] ||
        categorySubcategoryMap[formValues.category.toLowerCase()] ||
        [];

      // Check if current subcategory is valid for the new category
      const isValidSubcategory = availableSubcategories.some(
        (sub) =>
          sub.value === currentSubcategory ||
          sub.value.toLowerCase() === currentSubcategory?.toLowerCase()
      );

      // Reset subcategory if it's not valid for the new category
      if (!isValidSubcategory && currentSubcategory) {
        setValue('subCategory', '');
      }
    } else {
      // Clear subcategory when no category is selected
      setValue('subCategory', '');
    }
  }, [formValues.category, setValue, isInitialDataLoaded]);
  useEffect(() => {
    if (productData?.data) {
      const product = productData.data;

      // Debug logging (can be removed in production)
      console.log('Product data:', product);
      console.log('Product category:', product.category);
      console.log('Product subCategory:', product.subCategory);

      if (product.images && product.images.length > 0) {
        setExistingImages(product.images);
      }

      let readyByDate = '';
      let readyByTime = '';
      if (product.readyByDate) {
        try {
          const date = new Date(product.readyByDate);
          readyByDate = format(date, 'yyyy-MM-dd');
          readyByTime = format(date, 'HH:mm');
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      }

      // Handle category value - ensure it exists in options
      let categoryValue = product.category || '';
      let subCategoryValue = product.subCategory || '';

      // First, validate and normalize the category
      if (categoryValue) {
        // Check if category exists in options (case-insensitive)
        const categoryMatch = categoryOptions.find(
          (opt) => opt.value.toLowerCase() === categoryValue.toLowerCase()
        );

        if (categoryMatch) {
          // Use the exact value from options
          categoryValue = categoryMatch.value;
        } else {
          // Category doesn't exist in options - keep original value but log warning
          console.warn(
            `Category "${product.category}" not found in predefined options, keeping original value`
          );
          // Don't use fallback - preserve the original category
        }
      }

      // Now handle subcategory based on the selected category
      if (categoryValue) {
        // Get subcategory options for the current category
        // Try both exact match and lowercase match
        const categorySubOptions =
          categorySubcategoryMap[categoryValue] ||
          categorySubcategoryMap[categoryValue.toLowerCase()] ||
          [];
        console.log(`Subcategory options for category "${categoryValue}":`, categorySubOptions);
        console.log(`Original subcategory value: "${subCategoryValue}"`);

        if (subCategoryValue) {
          if (categorySubOptions.length > 0) {
            // Check if subcategory exists in the category's options (case-insensitive)
            const subCategoryMatch = categorySubOptions.find(
              (opt) => opt.value.toLowerCase() === subCategoryValue.toLowerCase()
            );

            if (subCategoryMatch) {
              // Use the exact value from options
              console.log(`Found matching subcategory: "${subCategoryMatch.value}"`);
              subCategoryValue = subCategoryMatch.value;
            } else {
              // Subcategory doesn't exist for this category - keep original value
              console.warn(
                `SubCategory "${product.subCategory}" not found for category "${categoryValue}", keeping original value`
              );
              // Keep the original subcategory value even if not in options
              // This is important for custom or backend-specific values
            }
          } else {
            // No subcategory options available for this category
            console.log(
              `No subcategory options available for category "${categoryValue}", keeping value: "${subCategoryValue}"`
            );
          }
        }
      }

      console.log('Final category value:', categoryValue);
      console.log('Final subcategory value:', subCategoryValue);

      // Reset form with all values
      const formData = {
        title: product.title || '',
        price: product.price?.toString() || '',
        description: product.description || '',
        category: categoryValue,
        subCategory: subCategoryValue,
        quantity: product.quantity?.toString() || '',
        brand: product.brand || '',
        color: product.color || '#000000',
        locationIds:
          product.locationIds?.map((loc: any) =>
            typeof loc === 'string' ? loc : loc._id || loc.id
          ) || [],
        productTag: product.productTag || [],
        variants:
          product.variants?.map((v: any) => ({
            color: v.color,
            quantity: v.quantity?.toString() || '',
            price: v.price?.toString() || '',
            discount: {
              discountType: v.discount?.discountType || 'none',
              discountValue: v.discount?.discountValue?.toString() || '',
            },
          })) || [],
        marketplaceOptions: {
          pickup: product.marketplaceOptions?.pickup || false,
          shipping: product.marketplaceOptions?.shipping || false,
          delivery: product.marketplaceOptions?.delivery || false,
        },
        pickupHours: product.pickupHours || '',
        shippingPrice: product.shippingPrice?.toString() || '',
        readyByDate,
        readyByTime,
        dimensions: {
          width: product.dimensions?.width?.toString() || '',
          length: product.dimensions?.length?.toString() || '',
          height: product.dimensions?.height?.toString() || '',
        },
        discount: {
          discountType: product.discount?.discountType || 'none',
          discountValue: product.discount?.discountValue?.toString() || '',
        },
      };

      console.log('Form data being set:', formData);
      console.log('Discount data:', formData.discount);
      console.log('Setting subCategory to:', subCategoryValue);

      // Ensure subcategory options include the current value before resetting
      const subCatOptions = categoryValue
        ? categorySubcategoryMap[categoryValue] ||
          categorySubcategoryMap[categoryValue.toLowerCase()] ||
          []
        : [];

      // Check if the subcategory exists in options
      const matchingSubCat = subCatOptions.find(
        (opt) => opt.value.toLowerCase() === subCategoryValue.toLowerCase()
      );

      // Use the exact value from options if found, otherwise use the original value
      const finalSubCategoryValue = matchingSubCat ? matchingSubCat.value : subCategoryValue;

      // Update formData with the final subcategory value
      formData.subCategory = finalSubCategoryValue;

      console.log('About to reset form with subCategory:', formData.subCategory);

      // Use reset to set all form values at once
      reset(formData);

      // Immediately check what was set
      const valuesAfterReset = methods.getValues();
      console.log('Values immediately after reset:', valuesAfterReset);
      console.log('SubCategory after reset:', valuesAfterReset.subCategory);

      // Force a re-render of the form fields by setting values again after a small delay
      setTimeout(() => {
        console.log(
          'Setting form values after delay - category:',
          categoryValue,
          'subcategory:',
          finalSubCategoryValue
        );
        console.log('Setting discount after delay:', formData.discount);
        methods.setValue('category', categoryValue);
        methods.setValue('subCategory', finalSubCategoryValue);

        // Check again after setValue
        const valuesAfterSet = methods.getValues();
        console.log('SubCategory after setValue:', valuesAfterSet.subCategory);
        // Also explicitly set the discount fields
        methods.setValue('discount.discountType', formData.discount.discountType);
        methods.setValue('discount.discountValue', formData.discount.discountValue);
        // Clear any validation errors and trigger validation
        methods.clearErrors([
          'category',
          'subCategory',
          'discount.discountType',
          'discount.discountValue',
        ]);
        // Don't trigger validation immediately as it might cause the value to be cleared
        setTimeout(() => {
          methods.trigger(['category', 'subCategory']);
        }, 50);
      }, 100);

      if (product.variants && product.variants.length > 0) {
        setShowVariants(true);
        setVariants(
          product.variants.map((v: any, index: number) => ({
            id: v.id || v._id || `variant-${index}-${Date.now()}`,
            images: [], // New images to upload
            existingImages: v.images || [], // Store existing variant images separately
          }))
        );

        // Explicitly set variant discount values after a delay
        setTimeout(() => {
          product.variants?.forEach((v: any, index: number) => {
            if (v.discount?.discountType) {
              methods.setValue(`variants.${index}.discount.discountType`, v.discount.discountType);
              methods.setValue(
                `variants.${index}.discount.discountValue`,
                v.discount.discountValue?.toString() || ''
              );
            }
          });
        }, 150);
      }

      // Clear form errors and revalidate after reset
      setTimeout(() => {
        methods.clearErrors();
        // Force form to recognize the values are valid
        const formValues = methods.getValues();
        console.log('Form values after reset:', formValues);
        // Manually validate to ensure the form knows these are valid values
        methods.trigger();
        // Mark that initial data has been loaded
        setIsInitialDataLoaded(true);
      }, 200);
    }
  }, [productData, reset, methods]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files);
        const totalImages = existingImages.length + uploadedPhotos.length;

        // Validate files using common utility
        const { validFiles, errors } = await validateMultipleImages(files, MAX_IMAGES, totalImages);

        if (validFiles.length > 0) {
          setUploadedPhotos((prev) => [...prev, ...validFiles]);
          setImageError(false);
        }

        errors.forEach((error) => toast.error(error));
      }
    },
    [uploadedPhotos, existingImages]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = existingImages.length + uploadedPhotos.length;

      // Validate files using common utility
      const { validFiles, errors } = await validateMultipleImages(files, MAX_IMAGES, totalImages);

      if (validFiles.length > 0) {
        setUploadedPhotos((prev) => [...prev, ...validFiles]);
        setImageError(false);
      }

      errors.forEach((error) => toast.error(error));
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EditProductForm) => {
    const totalImages = existingImages.length + uploadedPhotos.length;
    if (totalImages < 2) {
      setImageError(true);
      toast.error('Please keep at least 2 product images');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setImageError(false);

    const variantFiles = variants
      .map((v, index) => ({ variant: v, originalIndex: index }))
      .filter(({ variant }) => variant.images.length > 0)
      .map(({ variant, originalIndex }) => ({
        variantId: variant.id,
        variantIndex: originalIndex,
        files: variant.images,
      }));

    let readyByDate: string | undefined;
    if (data.readyByDate) {
      const time = data.readyByTime || '00:00';
      readyByDate = new Date(`${data.readyByDate}T${time}:00`).toISOString();
    }

    const mutationData = {
      title: data.title,
      price: parseFloat(data.price),
      description: data.description,
      category: data.category,
      subCategory: data.subCategory,
      quantity: parseInt(data.quantity),
      brand: data.brand,
      color: data.color,
      locationIds: data.locationIds,
      productTag: data.productTag,
      marketplaceOptions: data.marketplaceOptions,
      pickupHours: data.pickupHours,
      shippingPrice: data.shippingPrice ? parseFloat(data.shippingPrice) : undefined,
      readyByDate,
      readyByTime: data.readyByTime,
      dimensions:
        data.dimensions &&
        (data.dimensions.width || data.dimensions.length || data.dimensions.height)
          ? {
              width: data.dimensions.width ? parseFloat(data.dimensions.width) : undefined,
              length: data.dimensions.length ? parseFloat(data.dimensions.length) : undefined,
              height: data.dimensions.height ? parseFloat(data.dimensions.height) : undefined,
            }
          : undefined,
      discount: {
        discountType: data.discount.discountType,
        discountValue: data.discount.discountValue
          ? parseFloat(data.discount.discountValue)
          : undefined,
      },
      variants: data.variants?.map((v, index) => {
        const variant = variants[index];
        return {
          color: v.color,
          quantity: parseInt(v.quantity),
          price: parseFloat(v.price),
          discount: {
            discountType: v.discount.discountType,
            discountValue: v.discount.discountValue
              ? parseFloat(v.discount.discountValue)
              : undefined,
          },
          // Keep existing images in the images property
          // The mutation will merge new uploaded images with these
          images: variant?.existingImages || [],
        };
      }),
      imageFiles: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
      existingImages: existingImages,
      variantFiles: variantFiles.length > 0 ? variantFiles : undefined,
    };

    try {
      await updateProductMutation.mutateAsync({ id: id!, data: mutationData });
      navigate('/seller/products');
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleSaveDraft = async () => {
    // Check if minimal required fields are present (only title, category, price, and images are required)
    const formData = methods.getValues();

    // Validate minimal required fields for draft
    if (!formData.title || formData.title.trim().length === 0) {
      toast.error('Title is required to save as draft');
      methods.setFocus('title');
      methods.setError('title', { message: 'Title is required to save as draft' });
      return;
    }
    
    if (!formData.category || formData.category.trim().length === 0) {
      toast.error('Category is required to save as draft');
      methods.setFocus('category');
      methods.setError('category', { message: 'Category is required to save as draft' });
      return;
    }
    
    if (!formData.price || formData.price.trim().length === 0) {
      toast.error('Price is required to save as draft');
      methods.setFocus('price');
      methods.setError('price', { message: 'Price is required to save as draft' });
      return;
    }
    
    // Check for minimum required images for draft
    const totalImages = existingImages.length + uploadedPhotos.length;
    if (totalImages < 2) {
      setImageError(true);
      toast.error('At least 2 images are required to save as draft');
      // Scroll to the photo section
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setImageError(false);

    // Prepare variant files if any
    const variantFiles = variants
      .map((v, index) => ({ variant: v, index }))
      .filter(({ variant }) => variant.images.length > 0)
      .map(({ variant, index }) => ({
        variantId: variant.id,
        variantIndex: index,
        files: variant.images,
      }));

    // Convert readyByDate if provided
    let readyByDate: string | undefined;
    if (formData.readyByDate) {
      const time = formData.readyByTime || '00:00';
      readyByDate = new Date(`${formData.readyByDate}T${time}:00`).toISOString();
    }

    // For editing existing product, use different approach for draft
    // First prepare basic draft data
    const draftData: any = {
      id: id!, // Include the product ID for update
      title: formData.title,
      imageFiles: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
      existingImages: existingImages,
    };

    // Add optional fields only if they have values
    if (formData.price && formData.price.trim()) {
      draftData.price = formData.price;
    }
    if (formData.description && formData.description.trim()) {
      draftData.description = formData.description;
    }
    if (formData.category && formData.category.trim()) {
      draftData.category = formData.category;
    }
    if (formData.subCategory && formData.subCategory.trim()) {
      draftData.subCategory = formData.subCategory;
    }
    if (formData.quantity && formData.quantity.trim()) {
      draftData.quantity = formData.quantity;
    }
    if (formData.brand && formData.brand.trim()) {
      draftData.brand = formData.brand;
    }
    if (formData.color && formData.color.trim()) {
      draftData.color = formData.color;
    }
    if (formData.locationIds && formData.locationIds.length > 0) {
      draftData.locationIds = formData.locationIds;
    }
    if (formData.productTag && formData.productTag.length > 0) {
      draftData.productTag = formData.productTag;
    }
    if (
      formData.marketplaceOptions &&
      (formData.marketplaceOptions.pickup ||
        formData.marketplaceOptions.shipping ||
        formData.marketplaceOptions.delivery)
    ) {
      draftData.marketplaceOptions = formData.marketplaceOptions;
    }
    if (formData.pickupHours && formData.pickupHours.trim()) {
      draftData.pickupHours = formData.pickupHours;
    }
    if (formData.shippingPrice && formData.shippingPrice.trim()) {
      draftData.shippingPrice = formData.shippingPrice;
    }
    if (readyByDate) {
      draftData.readyByDate = readyByDate;
      draftData.readyByTime = formData.readyByTime;
    }
    if (
      formData.dimensions &&
      (formData.dimensions.width || formData.dimensions.length || formData.dimensions.height)
    ) {
      draftData.dimensions = formData.dimensions;
    }
    if (formData.discount && formData.discount.discountType !== 'none' && formData.discount.discountValue && formData.discount.discountValue.trim()) {
      // Only include discount if it has both a valid type and value
      draftData.discount = {
        discountType: formData.discount.discountType,
        discountValue: formData.discount.discountValue,
      };
    }
    if (formData.variants && formData.variants.length > 0) {
      // Filter out invalid variant discounts
      draftData.variants = formData.variants.map((v) => ({
        ...v,
        discount: (v.discount.discountType !== 'none' && v.discount.discountValue && v.discount.discountValue.trim())
          ? {
              discountType: v.discount.discountType,
              discountValue: v.discount.discountValue,
            }
          : {
              discountType: 'none',
              discountValue: '',
            },
      }));
    }
    if (variantFiles.length > 0) {
      draftData.variantFiles = variantFiles;
    }

    try {
      // Check if this is for updating an existing product draft
      if (id) {
        // For existing products being edited, use the update mutation with status: 'draft'
        const updateData = {
          ...draftData,
          status: 'draft',
          // Convert string values to proper types for update
          price: draftData.price ? parseFloat(draftData.price) : undefined,
          quantity: draftData.quantity ? parseInt(draftData.quantity) : undefined,
          shippingPrice: draftData.shippingPrice ? parseFloat(draftData.shippingPrice) : undefined,
          dimensions: draftData.dimensions
            ? {
                width: draftData.dimensions.width
                  ? parseFloat(draftData.dimensions.width)
                  : undefined,
                length: draftData.dimensions.length
                  ? parseFloat(draftData.dimensions.length)
                  : undefined,
                height: draftData.dimensions.height
                  ? parseFloat(draftData.dimensions.height)
                  : undefined,
              }
            : undefined,
          discount: draftData.discount
            ? {
                discountType: draftData.discount.discountType,
                discountValue: draftData.discount.discountValue
                  ? parseFloat(draftData.discount.discountValue)
                  : undefined,
              }
            : undefined,
          variants: draftData.variants?.map((v: any) => ({
            color: v.color,
            quantity: parseInt(v.quantity || '0'),
            price: parseFloat(v.price || '0'),
            discount: {
              discountType: v.discount.discountType,
              discountValue: v.discount.discountValue
                ? parseFloat(v.discount.discountValue)
                : undefined,
            },
          })),
        };

        // Remove the id from updateData as it's passed separately
        delete updateData.id;

        await saveDraftMutation.mutateAsync({ id: id!, ...updateData });
      } else {
        // For new products, use the saveDraftMutation
        await saveDraftMutation.mutateAsync(draftData);
      }

      navigate('/seller/products');
    } catch (error) {
      console.error('Failed to save draft:', error);
      // Error is already handled by the mutation with toast
    }
  };
  const onError = (errors: FieldErrors<EditProductForm>) => {
    console.log('Form errors:', errors);

    // Check for image upload error first
    const totalImages = existingImages.length + uploadedPhotos.length;
    if (totalImages < 2) {
      setImageError(true);
      toast.error('Please keep at least 2 product images');
      // Scroll to the photo section
      setTimeout(() => {
        const photoSection = document.getElementById('photos');
        if (photoSection) {
          const container = photoSection.closest('.overflow-y-auto');
          if (container) {
            const rect = photoSection.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            container.scrollTop += rect.top - containerRect.top - 100;
          } else {
            photoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
      return;
    }

    // Get the first field with an error
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      // Show error message
      const firstError = errors[firstErrorField as keyof typeof errors];
      if (firstError?.message) {
        toast.error(firstError.message);
      }

      // Scroll to the error field
      setTimeout(() => {
        // Try to find the form element
        const formElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        if (formElement) {
          // Find the scrollable container
          const container = formElement.closest('.overflow-y-auto');
          if (container) {
            // Calculate the position and scroll within the container
            const rect = formElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const scrollTop = container.scrollTop + rect.top - containerRect.top - 100;
            container.scrollTo({ top: scrollTop, behavior: 'smooth' });

            // Focus after scrolling
            setTimeout(() => {
              formElement.focus();
            }, 500);
          } else {
            // Fallback to regular scroll
            formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
              formElement.focus();
            }, 500);
          }
        }
      }, 100);
    }
  };

  const handleAddNewAddress = async (data: CreateSavedAddressPayload) => {
    try {
      await createAddressMutation.mutateAsync(data);
      await refetchAddresses();
      setShowAddAddressModal(false);
    } catch (error) {
      console.error('Failed to add address:', error);
      toast.error('Failed to add address');
    }
  };

  const addVariant = () => {
    if (variants.length >= 5) {
      toast.error('Maximum 5 variants allowed');
      return;
    }
    const newVariant = {
      id: Date.now().toString(),
      images: [],
      existingImages: [],
    };
    setVariants([...variants, newVariant]);
    setShowVariants(true);

    const variantIndex = variants.length;
    setValue(`variants.${variantIndex}.color`, '#000000');
    setValue(`variants.${variantIndex}.discount.discountType`, 'none');
    setValue(`variants.${variantIndex}.quantity`, '');
    setValue(`variants.${variantIndex}.price`, '');
    setValue(`variants.${variantIndex}.discount.discountValue`, '');
  };

  const removeVariant = (variantId: string) => {
    // Find the index of the variant to remove
    const variantIndex = variants.findIndex((v) => v.id === variantId);

    // Remove the variant from state
    setVariants(variants.filter((v) => v.id !== variantId));

    // Clear any errors for this variant
    if (variantIndex !== -1) {
      methods.clearErrors(`variants.${variantIndex}`);
    }

    if (variants.length <= 1) {
      setShowVariants(false);
    }
  };

  const handleVariantImageUpload = useCallback(
    async (variantId: string, files: File[]) => {
      const variant = variants.find((v) => v.id === variantId);
      if (!variant) return;

      const maxImages = 5;

      // Validate files using common utility
      const { validFiles, errors } = await validateMultipleImages(
        files,
        maxImages,
        variant.images.length
      );

      if (validFiles.length > 0) {
        setVariants(
          variants.map((v) =>
            v.id === variantId ? { ...v, images: [...v.images, ...validFiles] } : v
          )
        );
      }

      errors.forEach((error) => toast.error(error));
    },
    [variants]
  );

  const removeVariantImage = (variantId: string, imageIndex: number) => {
    setVariants(
      variants.map((v) =>
        v.id === variantId ? { ...v, images: v.images.filter((_, i) => i !== imageIndex) } : v
      )
    );
  };

  const removeExistingVariantImage = (variantId: string, imageIndex: number) => {
    setVariants(
      variants.map((v) =>
        v.id === variantId
          ? { ...v, existingImages: v.existingImages?.filter((_, i) => i !== imageIndex) || [] }
          : v
      )
    );
  };

  const handleVariantDrag = useCallback((e: React.DragEvent, variantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setVariantDragActive(variantId);
    } else if (e.type === 'dragleave') {
      setVariantDragActive(null);
    }
  }, []);

  const handleVariantDrop = useCallback(
    (e: React.DragEvent, variantId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setVariantDragActive(null);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files);
        handleVariantImageUpload(variantId, files);
      }
    },
    [handleVariantImageUpload]
  );

  if (isLoadingProduct) {
    return <EditProductPageSkeleton />;
  }

  return (
    <FormProvider {...methods}>
      <div className="h-screen bg-gray-50 fixed top-0 w-full z-50 left-0 flex flex-col">
        <div className="bg-primary px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white  hover:text-black p-1 rounded cursor-pointer"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <div>
                <div className="text-xs text-blue-100">Marketplace</div>
                <div className="text-white text-sm sm:text-base font-medium">Edit Product</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => {
                  if (productData?.data?.status === 'draft') {
                    handleSaveDraft();
                  } else {
                    setShowSaveDraftModal(true);
                  }
                }}
                variant="ghost"
                className="text-white hover:bg-white border border-white h-[40px] sm:h-[48px] text-sm sm:text-base hover:text-primary px-3 sm:px-4"
                disabled={updateProductMutation.isPending || saveDraftMutation.isPending}
              >
                {updateProductMutation.isPending || saveDraftMutation.isPending
                  ? 'Saving...'
                  : 'Save Draft'}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Preview Toggle Button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          {!showMobilePreview && (
            <Button
              type="button"
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="bg-primary text-white p-3 shadow-sm hover:bg-primary/90 rounded-sm flex gap-3 w-fit h-10"
            >
              {showMobilePreview ? (
                <>
                  <span>Hide Preview </span> <EyeOff className="h-6 w-6" />
                </>
              ) : (
                <>
                  <span>Show Preview </span> <Eye className="h-6 w-6" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Mobile Preview Modal */}
        {showMobilePreview && (
          <div className="lg:hidden fixed inset-0 z-[100] bg-white overflow-y-auto">
            <div className="min-h-screen">
              <ProductPreview
                handleBackClick={() => setShowMobilePreview(false)}
                formValues={formValues}
                uploadedPhotos={uploadedPhotos}
                existingImages={existingImages}
                addressOptions={addressOptions}
                savedAddresses={savedAddresses}
                variants={variants}
                categoryOptions={categoryOptions}
                subCategoryOptions={subCategoryOptions}
                tagOptions={tagOptions}
              />
            </div>
          </div>
        )}

        {/* Rest of the component structure similar to CreateProductPage */}
        <form
          id="product-form"
          onSubmit={handleSubmit(onSubmit, onError)}
          className="flex-1 flex flex-col lg:flex-row gap-4 p-4 mx-auto overflow-hidden min-h-0 w-full"
        >
          <div className="w-full lg:max-w-[450px] h-full">
            <ProductForm
              methods={methods}
              uploadedPhotos={uploadedPhotos}
              setUploadedPhotos={setUploadedPhotos}
              existingImages={existingImages}
              removeExistingImage={removeExistingImage}
              imageError={imageError}
              setImageError={setImageError}
              addressOptions={addressOptions}
              showAddAddressModal={showAddAddressModal}
              setShowAddAddressModal={setShowAddAddressModal}
              variants={variants}
              showVariants={showVariants}
              setShowVariants={setShowVariants}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              handleFileChange={handleFileChange}
              removePhoto={removePhoto}
              addVariant={addVariant}
              removeVariant={removeVariant}
              handleVariantImageUpload={handleVariantImageUpload}
              removeVariantImage={removeVariantImage}
              removeExistingVariantImage={removeExistingVariantImage}
              handleVariantDrag={handleVariantDrag}
              handleVariantDrop={handleVariantDrop}
              dragActive={dragActive}
              variantDragActive={variantDragActive}
              MAX_IMAGES={MAX_IMAGES}
              categoryOptions={categoryOptions}
              subCategoryOptions={subCategoryOptions}
              tagOptions={tagOptions}
              isLoading={updateProductMutation.isPending}
            />
          </div>

          <div className="w-full lg:flex-1 hidden lg:block h-full">
            <ProductPreview
              formValues={formValues}
              uploadedPhotos={uploadedPhotos}
              existingImages={existingImages}
              addressOptions={addressOptions}
              savedAddresses={savedAddresses}
              variants={variants}
              categoryOptions={categoryOptions}
              subCategoryOptions={subCategoryOptions}
              tagOptions={tagOptions}
            />
          </div>
        </form>
      </div>

      <AddSavedAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onSubmit={handleAddNewAddress}
        isSubmitting={createAddressMutation.isPending}
        totalAddress={savedAddresses.length !== 0}
      />

      <DeleteConfirmationModal
        isOpen={showSaveDraftModal}
        onClose={() => setShowSaveDraftModal(false)}
        onConfirm={() => {
          setShowSaveDraftModal(false);
          handleSaveDraft();
        }}
        title="Save as Draft?"
        description={
          <div className="text-gray-600">
            <p className="mb-2">Saving this product as a draft will:</p>
            <ul className="text-left list-disc list-inside space-y-1 text-sm">
              <li>Remove it from your active listings</li>
              <li>Make it invisible to buyers</li>
              <li>Allow you to edit and publish it later</li>
            </ul>
            <p className="mt-3 font-medium">Are you sure you want to continue?</p>
          </div>
        }
        confirmText="Yes, Save as Draft"
        cancelText="Cancel"
        isLoading={saveDraftMutation.isPending}
      />
    </FormProvider>
  );
}

export default EditProductPage;
