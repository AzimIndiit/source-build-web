import { useState, useCallback, useEffect } from 'react';
import { useForm, FormProvider, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui';
import { ProductForm } from '../components/ProductForm';
import { ProductPreview } from '../components/ProductPreview';
import { AddSavedAddressModal } from '@/features/profile/components/AddSavedAddressModal';
import {
  useSavedAddresssQuery,
  useCreateSavedAddressMutation,
} from '@/features/profile/hooks/useSavedAddressMutations';
import {
  SavedAddress,
  CreateSavedAddressPayload,
} from '@/features/profile/services/addressService';
import { useCreateProductMutation, useSaveDraftMutation } from '../hooks/useProductMutations';
import { validateImageFile, validateMultipleImages } from '@/utils/imageValidation';

// Variant schema
const variantSchema = z.object({
  color: z
    .string()
    .trim()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid HEX color code'),
  quantity: z
    .string()
    .trim()
    .regex(/^(0|[1-9]\d*)$/, 'Quantity must be a whole number')
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    }, 'Quantity must be at least 0')
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num <= 99999;
    }, 'Quantity must not exceed 99,999'),
  outOfStock: z.boolean().optional(),
  price: z
    .string()
    .trim()
    .min(1, 'Price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number')
    .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0'),
  priceType: z.enum(['sqft', 'linear', 'pallet']).default('sqft').optional(),
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

const createProductSchema = z
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

    priceType: z.enum(['sqft', 'linear', 'pallet']).default('sqft').optional(),

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
      .max(50, 'Sub category must not exceed 50 characters')
      .optional()
      .or(z.literal('')), // allow empty string as valid (optional)

    quantity: z
      .string()
      .trim()

      .regex(/^(0|[1-9]\d*)$/, 'Quantity must be a whole number')
      .refine((val) => {
        const num = parseInt(val);
        return !isNaN(num) && num >= 0;
      }, 'Quantity must be at least 0')
      .refine((val) => {
        const num = parseInt(val);
        return !isNaN(num) && num <= 99999;
      }, 'Quantity must not exceed 99,999'),

    outOfStock: z.boolean().optional(),
    brand: z
      .string()
      .trim()
      .min(2, 'Brand must be at least 2 characters')
      .max(50, 'Brand must not exceed 50 characters')
      .regex(
        /^[a-zA-Z0-9\s\-&.]+$/,
        'Brand can only contain letters, numbers, spaces, hyphens, ampersands, and periods'
      )
      .optional()
      .or(z.literal('')), // allow empty string

    color: z
      .string()
      .trim()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid HEX color code')
      .optional()
      .or(z.literal('')), // allow empty string

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
      .max(10, 'Maximum 10 tags allowed')
      .default([])
      .optional(),

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
    deliveryDistance: z.string().trim().optional(),

    pickupHours: z
      .string()
      .trim()
      // .max(100, 'Pickup hours must not exceed 100 characters')
      .optional(),

    shippingPrice: z.string().trim().optional(),
    localDeliveryFree: z.boolean().optional(),
    readyByDate: z.string().optional(),
    readyByTime: z.string().optional(),
    readyByDays: z.string().optional(),

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
  })
  .passthrough(); // Allow additional fields for dynamic attributes

type CreateProductForm = z.infer<typeof createProductSchema> & Record<string, any>;

// Interface definitions for API responses
interface AttributeValue {
  value: string;
  order?: number;
}

interface Attribute {
  name: string;
  inputType: 'text' | 'number' | 'dropdown' | 'multiselect' | 'boolean' | 'radio';
  required?: boolean;
  values?: AttributeValue[];
  order?: number;
  isActive?: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  hasAttributes?: boolean;
  attributes?: Attribute[];
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: string | Category;
  isActive: boolean;
  hasAttributes?: boolean;
  attributes?: Attribute[];
}

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

// Image upload constraints
const MAX_IMAGES = 5;

function CreateProductPage() {
  const navigate = useNavigate();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [variants, setVariants] = useState<Array<{ id: string; images: File[] }>>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [variantDragActive, setVariantDragActive] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [currentAttributes, setCurrentAttributes] = useState<Attribute[]>([]);

  // Fetch saved addresses
  const { data: addressesData, refetch: refetchAddresses } = useSavedAddresssQuery();
  const createAddressMutation = useCreateSavedAddressMutation();
  const createProductMutation = useCreateProductMutation();
  const saveDraftMutation = useSaveDraftMutation();

  // Fetch categories from API (only active ones by default)
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories-active'],
    queryFn: async () => {
      // Don't send isActive parameter - let backend handle filtering
      const response = await axiosInstance.get('/categories', {
        params: {
          limit: 100,
        },
      });
      // The categories are directly in response.data.data array
      const categories = response.data.data as Category[];
      return categories.filter((cat) => cat.isActive);
    },
  });

  // Fetch subcategories based on selected category
  const { data: subcategoriesData, isLoading: subcategoriesLoading } = useQuery({
    queryKey: ['subcategories', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      // Don't send isActive parameter - let backend handle filtering
      const response = await axiosInstance.get('/subcategories', {
        params: {
          category: selectedCategoryId,
          limit: 100,
        },
      });
      // Check the response structure and extract subcategories accordingly
      const subcategories = response.data.data as Subcategory[];
      return subcategories.filter((sub) => sub.isActive);
    },
    enabled: !!selectedCategoryId,
  });

  // Convert categories to options for FormSelect
  const categoryOptions =
    categoriesData?.map((category) => ({
      value: category._id,
      label: category.name,
    })) || [];

  // Convert subcategories to options for FormSelect
  const subCategoryOptions =
    subcategoriesData?.map((subcategory) => ({
      value: subcategory._id,
      label: subcategory.name,
    })) || [];

  // Convert saved addresses to options for FormSelect
  const savedAddresses = Array.isArray(addressesData?.data)
    ? addressesData.data
    : addressesData?.data
      ? [addressesData.data]
      : [];

  const addressOptions = savedAddresses.map((address: SavedAddress) => ({
    value: address.id || address._id || '',
    label: `${address.name} , ${address.formattedAddress}` || '',
  }));

  const methods = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
    mode: 'onChange', // Enable real-time validation
    reValidateMode: 'onChange', // Re-validate on every change
    defaultValues: {
      title: '',
      price: '',
      priceType: 'sqft',
      description: '',
      category: '',
      subCategory: '',
      quantity: '',
      brand: '',
      color: '',
      locationIds: [],
      productTag: [],
      variants: [],
      marketplaceOptions: {
        pickup: false,
        shipping: false,
        delivery: false,
      },
      deliveryDistance: '50',
      localDeliveryFree: false,
      pickupHours: '',
      shippingPrice: '200',
      readyByDate: '',
      readyByTime: '',
      readyByDays: '0',
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

  const {
    handleSubmit,
    watch,
    getValues,
    setValue,
    setFocus,
    clearErrors,
    setError,
    formState: { errors },
  } = methods;
  const formValues = watch();

  // Update selected category ID when category changes
  useEffect(() => {
    if (formValues.category !== selectedCategoryId) {
      // Clear previous attribute values when category changes
      if (currentAttributes.length > 0) {
        currentAttributes.forEach((attr) => {
          const fieldName = `attribute_${attr.name.replace(/\s+/g, '_')}`;
          methods.unregister(fieldName as any);
        });
      }

      setSelectedCategoryId(formValues.category);
      // Reset subcategory when category changes
      methods.setValue('subCategory', '');

      // Update attributes from category
      const selectedCategory = categoriesData?.find((cat) => cat._id === formValues.category);
      console.log('Category changed:', formValues.category);
      console.log('Selected category data:', selectedCategory);
      console.log('Category has attributes?', selectedCategory?.hasAttributes);
      console.log('Category attributes:', selectedCategory?.attributes);

      if (selectedCategory?.hasAttributes && selectedCategory.attributes) {
        const filteredAttributes = selectedCategory.attributes.filter(
          (attr) => attr.isActive !== false
        );
        console.log('Setting category attributes:', filteredAttributes);
        setCurrentAttributes(filteredAttributes);
      } else {
        console.log('No attributes for category, clearing');
        setCurrentAttributes([]);
      }
    }
  }, [formValues.category, selectedCategoryId, methods, categoriesData, currentAttributes]);

  // Update attributes when subcategory changes
  useEffect(() => {
    // Clear previous attribute values when subcategory changes
    if (currentAttributes.length > 0) {
      currentAttributes.forEach((attr) => {
        const fieldName = `attribute_${attr.name.replace(/\s+/g, '_')}`;
        methods.unregister(fieldName as any);
      });
    }

    if (formValues.subCategory) {
      const selectedSubcategory = subcategoriesData?.find(
        (sub) => sub._id === formValues.subCategory
      );
      console.log('Subcategory changed:', formValues.subCategory);
      console.log('Selected subcategory data:', selectedSubcategory);
      console.log('Subcategory has attributes?', selectedSubcategory?.hasAttributes);
      console.log('Subcategory attributes:', selectedSubcategory?.attributes);

      if (selectedSubcategory?.hasAttributes && selectedSubcategory.attributes) {
        // Subcategory attributes override category attributes
        const filteredAttributes = selectedSubcategory.attributes.filter(
          (attr) => attr.isActive !== false
        );
        console.log('Setting subcategory attributes:', filteredAttributes);
        setCurrentAttributes(filteredAttributes);
      } else if (!selectedSubcategory?.hasAttributes) {
        // If subcategory doesn't have attributes, use category attributes
        const selectedCategory = categoriesData?.find((cat) => cat._id === formValues.category);
        console.log('Subcategory has no attributes, checking category:', selectedCategory);
        if (selectedCategory?.hasAttributes && selectedCategory.attributes) {
          const filteredAttributes = selectedCategory.attributes.filter(
            (attr) => attr.isActive !== false
          );
          console.log('Using category attributes instead:', filteredAttributes);
          setCurrentAttributes(filteredAttributes);
        } else {
          console.log('No attributes for category either, clearing');
          setCurrentAttributes([]);
        }
      }
    }
  }, [
    formValues.subCategory,
    subcategoriesData,
    formValues.category,
    categoriesData,
    currentAttributes,
    methods,
  ]);

  // Register attribute fields when attributes change
  useEffect(() => {
    if (currentAttributes.length > 0) {
      console.log('Registering attribute fields:', currentAttributes);
      currentAttributes.forEach((attr) => {
        const fieldName = `attribute_${attr.name.replace(/\s+/g, '_')}`;
        console.log(`Registering field: ${fieldName}`);

        // Unregister the field first if it exists to ensure clean state
        try {
          methods.unregister(fieldName as any);
        } catch (e) {
          // Field might not exist, that's ok
        }

        // Register the field with react-hook-form
        methods.register(fieldName as any);

        // Set default value based on input type
        const currentValue = (methods.getValues() as any)[fieldName];
        if (currentValue === undefined || currentValue === null) {
          if (attr.inputType === 'boolean') {
            methods.setValue(fieldName as any, false);
          } else if (attr.inputType === 'multiselect') {
            methods.setValue(fieldName as any, []);
          } else {
            methods.setValue(fieldName as any, '');
          }
        }

        console.log(
          `Field ${fieldName} registered with value:`,
          (methods.getValues() as any)[fieldName]
        );
      });

      // Force a re-render to ensure fields are registered
      methods.trigger();
    }
  }, [currentAttributes]);

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

        // Validate files using common utility
        const { validFiles, errors } = await validateMultipleImages(
          files,
          MAX_IMAGES,
          uploadedPhotos.length
        );

        if (validFiles.length > 0) {
          setUploadedPhotos((prev) => [...prev, ...validFiles]);
          setImageError(false); // Clear error when images are added
        }

        // Show all errors
        errors.forEach((error) => toast.error(error));
      }
    },
    [uploadedPhotos]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Validate files using common utility
      const { validFiles, errors } = await validateMultipleImages(
        files,
        MAX_IMAGES,
        uploadedPhotos.length
      );

      if (validFiles.length > 0) {
        setUploadedPhotos((prev) => [...prev, ...validFiles]);
        setImageError(false); // Clear error when images are added
      }

      // Show all errors
      errors.forEach((error) => toast.error(error));

      // Reset input
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
    // toast.success('Image removed');
  };

  const onSubmit = async (data: CreateProductForm) => {
    // Check if minimum required images are uploaded
    if (uploadedPhotos.length < 2) {
      setImageError(true);
      toast.error('Please upload at least 2 product images');
      // Scroll to the photo section
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setImageError(false);

    // Prepare variant files - map variant images with their IDs
    // Include the variant index to help with matching later
    const variantFiles = variants
      .map((v, index) => ({ variant: v, index }))
      .filter(({ variant }) => variant.images.length > 0)
      .map(({ variant, index }) => ({
        variantId: variant.id,
        variantIndex: index, // Store the original index
        files: variant.images,
      }));

    // Debug: Log the variant data to understand the structure
    console.log('Variants from form:', data.variants);
    console.log('Variant files to upload:', variantFiles);

    // Convert readyByDate to ISO datetime format if provided
    let readyByDate: string | undefined;
    if (data.readyByDate) {
      // Combine date and time if both are provided, otherwise use date with default time
      const time = data.readyByTime || '00:00';
      readyByDate = new Date(`${data.readyByDate}T${time}:00`).toISOString();
    }

    // Collect attribute values from form
    console.log('Current attributes:', currentAttributes);
    console.log('Form data:', data);
    console.log('All form values:', methods.getValues());

    const productAttributes = currentAttributes
      .map((attr) => {
        const fieldName = `attribute_${attr.name.replace(/\s+/g, '_')}`;
        const value = (data as any)[fieldName] || (methods.getValues() as any)[fieldName];
        console.log(`Attribute ${attr.name} (${fieldName}):`, value);
        return {
          attributeName: attr.name,
          inputType: attr.inputType,
          value: value,
          required: attr.required,
        };
      })
      .filter((attr) => attr.value !== undefined && attr.value !== '' && attr.value !== null);

    console.log('Collected productAttributes:', productAttributes);

    // Prepare the mutation data
    const mutationData = {
      title: data.title,
      price: parseFloat(data.price),
      priceType: data.priceType,
      description: data.description,
      category: data.category,
      subCategory: data.subCategory,
      quantity: parseInt(data.quantity),
      outOfStock: data.outOfStock || false,
      brand: data.brand,
      color: data.color,
      locationIds: data.locationIds,
      productTag: data.productTag,
      marketplaceOptions: data.marketplaceOptions,
      pickupHours: data.pickupHours,
      deliveryDistance: data.deliveryDistance ? parseFloat(data.deliveryDistance) : undefined,
      shippingPrice: data.shippingPrice ? parseFloat(data.shippingPrice) : undefined,
      localDeliveryFree: data.localDeliveryFree,
      readyByDate,
      readyByTime: data.readyByTime,
      readyByDays: data.readyByDays ? parseInt(data.readyByDays) : undefined,
      productAttributes: productAttributes.length > 0 ? productAttributes : undefined,
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
      variants: variants
        .map((variant, index) => {
          const formVariant = data.variants?.[index];
          if (!formVariant) return null;
          return {
            color: formVariant.color,
            quantity: parseInt(formVariant.quantity),
            price: parseFloat(formVariant.price),
            priceType: formVariant.priceType || data.priceType || 'sqft',
            outOfStock: formVariant.outOfStock ?? false,
            discount: {
              discountType: formVariant.discount.discountType,
              discountValue: formVariant.discount.discountValue
                ? parseFloat(formVariant.discount.discountValue)
                : undefined,
            },
          };
        })
        .filter(Boolean),
      imageFiles: uploadedPhotos,
      variantFiles: variantFiles.length > 0 ? variantFiles : undefined,
    };

    console.log('Final mutation data with attributes:', mutationData);
    console.log('ProductAttributes in mutation:', mutationData.productAttributes);

    try {
      await createProductMutation.mutateAsync(mutationData);
      // Navigate to products page or wherever appropriate
      navigate('/seller/products');
    } catch (error) {
      console.error('Failed to create product:', error);
      // Error is already handled by the mutation with toast
    }
  };

  const handleSaveDraft = async () => {
    // Check if minimal required fields are present (only title, category, price, and images are required)
    const formData = getValues();

    // Validate minimal required fields for draft
    if (!formData.title || formData.title.trim().length === 0) {
      toast.error('Title is required to save as draft');
      setFocus('title');
      setError('title', { message: 'Title is required to save as draft' });
      return;
    }

    if (!formData.category || formData.category.trim().length === 0) {
      toast.error('Category is required to save as draft');
      setFocus('category');
      setError('category', { message: 'Category is required to save as draft' });
      return;
    }

    if (!formData.price || formData.price.trim().length === 0) {
      toast.error('Price is required to save as draft');
      setFocus('price');
      setError('price', { message: 'Price is required to save as draft' });
      return;
    }

    if (uploadedPhotos.length < 2) {
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

    // Collect attribute values for draft
    const productAttributes: any[] = [];
    if (currentAttributes.length > 0) {
      currentAttributes.forEach((attr) => {
        const fieldName = `attribute_${attr.name.replace(/\s+/g, '_')}`;
        const value = (formData as any)[fieldName] || (methods.getValues() as any)[fieldName];

        if (value !== undefined && value !== '' && value !== null) {
          productAttributes.push({
            attributeName: attr.name,
            inputType: attr.inputType,
            value: value,
            required: attr.required || false,
          });
        }
      });
    }

    // Prepare the draft data with only provided fields
    const draftData: any = {
      title: formData.title,
      imageFiles: uploadedPhotos,
    };

    // Add product attributes if any
    if (productAttributes.length > 0) {
      draftData.productAttributes = productAttributes;
    }

    // Add optional fields only if they have values
    if (formData.price && formData.price.trim()) {
      draftData.price = formData.price;
    }
    if (formData.priceType) {
      draftData.priceType = formData.priceType;
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
    if (formData.outOfStock !== undefined) {
      draftData.outOfStock = formData.outOfStock;
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
    if (formData.deliveryDistance && formData.deliveryDistance) {
      draftData.deliveryDistance = formData.deliveryDistance;
    }
    if (formData.localDeliveryFree !== undefined) {
      draftData.localDeliveryFree = formData.localDeliveryFree;
    }
    if (readyByDate) {
      draftData.readyByDate = readyByDate;
      draftData.readyByTime = formData.readyByTime;
    }
    if (formData.readyByDays && formData.readyByDays.trim()) {
      draftData.readyByDays = parseInt(formData.readyByDays);
    }
    if (
      formData.dimensions &&
      (formData.dimensions.width || formData.dimensions.length || formData.dimensions.height)
    ) {
      draftData.dimensions = {
        width: formData.dimensions.width || '',
        length: formData.dimensions.length || '',
        height: formData.dimensions.height || '',
      };
    }
    if (
      formData.discount &&
      formData.discount.discountType !== 'none' &&
      formData.discount.discountValue &&
      formData.discount.discountValue.trim()
    ) {
      // Only include discount if it has both a valid type and value
      draftData.discount = {
        discountType: formData.discount.discountType,
        discountValue: formData.discount.discountValue,
      };
    }
    if (formData.outOfStock !== undefined) {
      draftData.outOfStock = formData.outOfStock;
    }
    // Only include variants that exist in the variants state (not deleted)
    if (variants && variants.length > 0) {
      draftData.variants = variants
        .map((variant, index) => {
          const formVariant = formData.variants?.[index];
          if (!formVariant) return null;
          return {
            color: formVariant.color,
            quantity: formVariant.quantity,
            price: formVariant.price,
            priceType: formVariant.priceType || formData.priceType || 'sqft',
            outOfStock: formVariant.outOfStock ?? false,
            discount:
              formVariant.discount.discountType !== 'none' &&
              formVariant.discount.discountValue &&
              formVariant.discount.discountValue.trim()
                ? {
                    discountType: formVariant.discount.discountType,
                    discountValue: formVariant.discount.discountValue,
                  }
                : {
                    discountType: 'none',
                    discountValue: '',
                  },
          };
        })
        .filter(Boolean); // Remove null values
    }
    if (variantFiles.length > 0) {
      draftData.variantFiles = variantFiles;
    }

    try {
      console.log('draftData', draftData);
      await saveDraftMutation.mutateAsync(draftData);
      // Navigate to products page after successful draft save
      navigate('/seller/products');
    } catch (error) {
      console.error('Failed to save draft:', error);
      // Error is already handled by the mutation with toast
    }
  };

  const onError = (errors: FieldErrors<CreateProductForm>) => {
    console.log('Form errors:', errors);

    // Check for image upload error first
    if (uploadedPhotos.length < 2) {
      setImageError(true);
      toast.error('Please upload at least 2 product images');
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

  // Handle adding new address
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

  // Variant management functions
  const addVariant = () => {
    if (variants.length >= 5) {
      toast.error('Maximum 5 variants allowed');
      return;
    }
    const newVariant = {
      id: Date.now().toString(),
      images: [],
      color: '#000000',
    };
    setVariants([...variants, newVariant]);
    setShowVariants(true);

    // Set default values for the new variant form fields
    const variantIndex = variants.length;
    setValue(`variants.${variantIndex}.color`, '');
    setValue(`variants.${variantIndex}.discount.discountType`, 'none');
    setValue(`variants.${variantIndex}.quantity`, '');
    setValue(`variants.${variantIndex}.price`, '');
    // Use parent product's priceType as default for variant
    setValue(`variants.${variantIndex}.priceType`, formValues.priceType || 'sqft');
    setValue(`variants.${variantIndex}.discount.discountValue`, '');
  };

  const removeVariant = (variantId: string) => {
    // Find the index of the variant to remove
    const variantIndex = variants.findIndex((v) => v.id === variantId);

    // Remove the variant from state
    const updatedVariants = variants.filter((v) => v.id !== variantId);
    setVariants(updatedVariants);

    // Update form values to remove the variant
    const currentFormVariants = methods.getValues('variants') || [];
    const updatedFormVariants = currentFormVariants.filter(
      (_: any, index: number) => index !== variantIndex
    );
    setValue('variants', updatedFormVariants);

    // Clear any errors for this variant
    if (variantIndex !== -1) {
      methods.clearErrors(`variants.${variantIndex}`);
    }

    if (updatedVariants.length === 0) {
      setShowVariants(false);
      // Clear the entire variants array from form when no variants left
      setValue('variants', []);
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

      // Show all errors
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

  // Drag and drop handlers for variant images
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
  return (
    <FormProvider {...methods}>
      <div className="h-screen bg-gray-50 fixed top-0 w-full z-50 left-0 flex flex-col  ">
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
                <div className="text-white text-sm sm:text-base font-medium">Item for sale</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleSaveDraft}
                variant="ghost"
                className="text-white hover:bg-white border border-white h-[40px] sm:h-[48px] text-sm sm:text-base hover:text-primary px-3 sm:px-4"
                disabled={createProductMutation.isPending || saveDraftMutation.isPending}
              >
                {saveDraftMutation.isPending ? 'Saving...' : 'Save Draft'}
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
              className="bg-primary text-white  p-3 shadow-sm hover:bg-primary/90  rounded-sm flex gap-3 w-fit h-10"
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
                addressOptions={addressOptions}
                savedAddresses={savedAddresses}
                variants={variants}
                categoryOptions={categoryOptions}
                subCategoryOptions={subCategoryOptions}
                tagOptions={tagOptions}
                currentAttributes={currentAttributes}
              />
            </div>
          </div>
        )}

        <form
          id="product-form"
          onSubmit={handleSubmit(onSubmit, onError)}
          className="flex-1 flex flex-col lg:flex-row gap-4 p-4 mx-auto overflow-hidden min-h-0  w-full"
        >
          <div className="w-full lg:max-w-[450px] h-full">
            <ProductForm
              methods={methods}
              uploadedPhotos={uploadedPhotos}
              setUploadedPhotos={setUploadedPhotos}
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
              handleVariantDrag={handleVariantDrag}
              handleVariantDrop={handleVariantDrop}
              dragActive={dragActive}
              variantDragActive={variantDragActive}
              MAX_IMAGES={MAX_IMAGES}
              categoryOptions={categoryOptions}
              subCategoryOptions={subCategoryOptions}
              tagOptions={tagOptions}
              isLoading={createProductMutation.isPending}
              categoriesLoading={categoriesLoading}
              subcategoriesLoading={subcategoriesLoading}
              currentAttributes={currentAttributes}
            />
          </div>

          <div className="w-full lg:flex-1 hidden lg:block h-full">
            <ProductPreview
              formValues={formValues}
              uploadedPhotos={uploadedPhotos}
              addressOptions={addressOptions}
              savedAddresses={savedAddresses}
              variants={variants}
              categoryOptions={categoryOptions}
              subCategoryOptions={subCategoryOptions}
              tagOptions={tagOptions}
              currentAttributes={currentAttributes}
            />
          </div>
        </form>
      </div>

      {/* Add Saved Address Modal - moved outside the main container */}
      <AddSavedAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onSubmit={handleAddNewAddress}
        isSubmitting={createAddressMutation.isPending}
        totalAddress={savedAddresses.length !== 0}
      />
    </FormProvider>
  );
}

export default CreateProductPage;
