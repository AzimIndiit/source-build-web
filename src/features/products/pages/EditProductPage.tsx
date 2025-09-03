import { useState, useCallback, useEffect } from 'react';
import { useForm, FormProvider, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { ProductForm } from '../components/ProductForm';
import { ProductPreview } from '../components/ProductPreview';
import { EditProductPageSkeleton } from '../components/EditProductPageSkeleton';
import { AddSavedAddressModal } from '@/features/profile/components/AddSavedAddressModal';
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
    .min(1, 'Quantity is required')
    .regex(/^\d+$/, 'Quantity must be a whole number')
    .refine((val) => parseInt(val) > 0, 'Quantity must be at least 1'),
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
      .min(1, 'Quantity is required')
      .regex(/^\d+$/, 'Quantity must be a whole number')
      .refine((val) => parseInt(val) > 0, 'Quantity must be at least 1')
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

const subCategoryOptions = [
  { value: 'phones', label: 'Phones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'doors', label: 'Doors' },
  { value: 'windows', label: 'Windows' },
  { value: 'glass doors', label: 'Glass Doors' },
];

const tagOptions = [
  { value: 'casing', label: 'Casing' },
  { value: 'trim', label: 'Trim' },
  { value: 'molding', label: 'Molding' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'doors', label: 'Doors' },
  { value: 'windows', label: 'Windows' },
];

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  const { data: productData, isLoading: isLoadingProduct } = useProductByIdQuery(id || '');
  const { data: addressesData, refetch: refetchAddresses } = useSavedAddresssQuery();
  const createAddressMutation = useCreateSavedAddressMutation();
  const updateProductMutation = useUpdateProductMutation();

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
      discount: {
        discountType: 'none',
        discountValue: '',
      },
    },
  });

  const { handleSubmit, watch, reset, setValue } = methods;
  const formValues = watch();
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

      // Check if category exists in options
      const categoryExists = categoryOptions.some((opt) => opt.value === product.category);
      const subCategoryExists = subCategoryOptions.some((opt) => opt.value === product.subCategory);

      console.log('Category exists in options:', categoryExists);
      console.log('SubCategory exists in options:', subCategoryExists);

      // Handle category/subcategory values - ensure they exist in options or use fallback
      let categoryValue = product.category || '';
      let subCategoryValue = product.subCategory || '';

      // If the stored value doesn't exist in options, try to find a close match or use the first option
      if (categoryValue && !categoryExists) {
        // Try to find a case-insensitive match
        const caseInsensitiveMatch = categoryOptions.find(
          (opt) => opt.value.toLowerCase() === categoryValue.toLowerCase()
        );
        if (caseInsensitiveMatch) {
          categoryValue = caseInsensitiveMatch.value;
        } else {
          // If no match found, use the first option as fallback
          categoryValue = categoryOptions[0]?.value || '';
          console.warn(
            `Category "${product.category}" not found in options, using fallback: "${categoryValue}"`
          );
        }
      }

      if (subCategoryValue && !subCategoryExists) {
        // Try to find a case-insensitive match
        const caseInsensitiveMatch = subCategoryOptions.find(
          (opt) => opt.value.toLowerCase() === subCategoryValue.toLowerCase()
        );
        if (caseInsensitiveMatch) {
          subCategoryValue = caseInsensitiveMatch.value;
        } else {
          // If no match found, use the first option as fallback
          subCategoryValue = subCategoryOptions[0]?.value || '';
          console.warn(
            `SubCategory "${product.subCategory}" not found in options, using fallback: "${subCategoryValue}"`
          );
        }
      }

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
        discount: {
          discountType: product.discount?.discountType || 'none',
          discountValue: product.discount?.discountValue?.toString() || '',
        },
      };

      console.log('Form data being set:', formData);
      reset(formData);

      // Force a re-render of the form fields by setting values again after a small delay
      setTimeout(() => {
        methods.setValue('category', categoryValue);
        methods.setValue('subCategory', subCategoryValue);
        // Clear any validation errors and trigger validation
        methods.clearErrors(['category', 'subCategory']);
        methods.trigger(['category', 'subCategory']);
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
      }

      // Clear form errors and revalidate after reset
      setTimeout(() => {
        methods.clearErrors();
        // Force form to recognize the values are valid
        const formValues = methods.getValues();
        console.log('Form values after reset:', formValues);
        // Manually validate to ensure the form knows these are valid values
        methods.trigger();
      }, 200);
    }
  }, [productData, reset, methods]);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: `"${file.name}" is not an image file` };
    }
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return { valid: false, error: `Selected image is ${sizeMB}MB. Maximum size is 5MB allowed` };
    }
    return { valid: true };
  };

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
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files);
        const totalImages = existingImages.length + uploadedPhotos.length;
        if (totalImages >= MAX_IMAGES) {
          toast.error(`Maximum ${MAX_IMAGES} images allowed`);
          return;
        }

        const remainingSlots = MAX_IMAGES - totalImages;
        const validFiles: File[] = [];
        const errors: string[] = [];

        for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
          const validation = validateFile(files[i]);
          if (validation.valid) {
            validFiles.push(files[i]);
          } else if (validation.error) {
            errors.push(validation.error);
          }
        }

        if (files.length > remainingSlots) {
          errors.push(
            `Only ${remainingSlots} more image(s) can be added (max ${MAX_IMAGES} total)`
          );
        }

        if (validFiles.length > 0) {
          setUploadedPhotos((prev) => [...prev, ...validFiles]);
          setImageError(false);
        }

        errors.forEach((error) => toast.error(error));
      }
    },
    [uploadedPhotos, existingImages]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = existingImages.length + uploadedPhotos.length;
      if (totalImages >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        e.target.value = '';
        return;
      }

      const remainingSlots = MAX_IMAGES - totalImages;
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        const validation = validateFile(files[i]);
        if (validation.valid) {
          validFiles.push(files[i]);
        } else if (validation.error) {
          errors.push(validation.error);
        }
      }

      if (files.length > remainingSlots) {
        errors.push(`Only ${remainingSlots} more image(s) can be added (max ${MAX_IMAGES} total)`);
      }

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
    if (existingImages.length === 0 && uploadedPhotos.length === 0) {
      setImageError(true);
      toast.error('Please keep at least one product image');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setImageError(false);

    const variantFiles = variants
      .filter((v) => v.images.length > 0)
      .map((v, index) => ({
        variantId: v.id,
        variantIndex: index,
        files: v.images,
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

  const onError = (errors: FieldErrors<EditProductForm>) => {
    console.log('Form errors:', errors);

    // Check for image upload error first
    if (existingImages.length === 0 && uploadedPhotos.length === 0) {
      setImageError(true);
      toast.error('Please keep at least one product image');
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
    setVariants(variants.filter((v) => v.id !== variantId));
    if (variants.length <= 1) {
      setShowVariants(false);
    }
  };

  const handleVariantImageUpload = (variantId: string, files: File[]) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) return;

    const currentCount = variant.images.length;
    const maxImages = 5;

    if (currentCount >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed per variant`);
      return;
    }

    const remainingSlots = maxImages - currentCount;
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const validation = validateFile(files[i]);
      if (validation.valid) {
        validFiles.push(files[i]);
      } else if (validation.error) {
        errors.push(validation.error);
      }
    }

    if (files.length > remainingSlots) {
      errors.push(
        `Only ${remainingSlots} more image(s) can be added (max ${maxImages} per variant)`
      );
    }

    if (validFiles.length > 0) {
      setVariants(
        variants.map((v) =>
          v.id === variantId ? { ...v, images: [...v.images, ...validFiles] } : v
        )
      );
    }

    errors.forEach((error) => toast.error(error));
  };

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

  const handleVariantDrop = useCallback((e: React.DragEvent, variantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setVariantDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleVariantImageUpload(variantId, files);
    }
  }, []);

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
          </div>
        </div>

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
    </FormProvider>
  );
}

export default EditProductPage;
