import { useState, useCallback, useEffect } from 'react';
import { useForm, FormProvider, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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

type CreateProductForm = z.infer<typeof createProductSchema>;

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

// Image upload constraints
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

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
  // Fetch saved addresses
  const { data: addressesData, refetch: refetchAddresses } = useSavedAddresssQuery();
  const createAddressMutation = useCreateSavedAddressMutation();
  const createProductMutation = useCreateProductMutation();
  const saveDraftMutation = useSaveDraftMutation();

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

  // Validate file before adding
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: `"${file.name}" is not an image file` };
    }

    // Check file size
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

        // Check total image count
        if (uploadedPhotos.length >= MAX_IMAGES) {
          toast.error(`Maximum ${MAX_IMAGES} images allowed`);
          return;
        }

        const remainingSlots = MAX_IMAGES - uploadedPhotos.length;
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
          setImageError(false); // Clear error when images are added
          // if (validFiles.length === 1) {
          //   // toast.success('Image uploaded successfully');
          // } else {
          //   toast.success(`${validFiles.length} images uploaded successfully`);
          // }
        }

        // Show all errors
        errors.forEach((error) => toast.error(error));
      }
    },
    [uploadedPhotos]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Check total image count
      if (uploadedPhotos.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        e.target.value = ''; // Reset input
        return;
      }

      const remainingSlots = MAX_IMAGES - uploadedPhotos.length;
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
        setImageError(false); // Clear error when images are added
        // if (validFiles.length === 1) {
        //   toast.success('Image uploaded successfully');
        // } else {
        //   toast.success(`${validFiles.length} images uploaded successfully`);
        // }
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
    // Check if images are uploaded
    if (uploadedPhotos.length === 0) {
      setImageError(true);
      toast.error('Please upload at least one product image');
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

    // Prepare the mutation data
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
      variants: data.variants?.map((v) => ({
        color: v.color,
        quantity: parseInt(v.quantity),
        price: parseFloat(v.price),
        discount: {
          discountType: v.discount.discountType,
          discountValue: v.discount.discountValue
            ? parseFloat(v.discount.discountValue)
            : undefined,
        },
      })),
      imageFiles: uploadedPhotos,
      variantFiles: variantFiles.length > 0 ? variantFiles : undefined,
    };

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
    // Check if minimal required fields are present
    const formData = getValues();

    // Validate minimal required fields for draft
    if (!formData.title || formData.title.trim().length === 0) {
      toast.error('Title is required to save as draft');
      setFocus('title');
      setError('title', { message: 'Title is required to save as draft' });
      return;
    }
    // Validate minimal required fields for draft
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
    if (uploadedPhotos.length === 0) {
      setImageError(true);
      toast.error('At least one image is required to save as draft');
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

    // Prepare the draft data with only provided fields
    const draftData: any = {
      title: formData.title,
      imageFiles: uploadedPhotos,
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
    if (formData.discount && formData.discount.discountType !== 'none') {
      draftData.discount = formData.discount;
    }
    if (formData.variants && formData.variants.length > 0) {
      draftData.variants = formData.variants;
    }
    if (variantFiles.length > 0) {
      draftData.variantFiles = variantFiles;
    }

    try {
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
    if (uploadedPhotos.length === 0) {
      setImageError(true);
      toast.error('Please upload at least one product image');
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
    };
    setVariants([...variants, newVariant]);
    setShowVariants(true);

    // Set default values for the new variant form fields
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

    // Show all errors
    errors.forEach((error) => toast.error(error));
  };

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

  const handleVariantDrop = useCallback((e: React.DragEvent, variantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setVariantDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleVariantImageUpload(variantId, files);
    }
  }, []);
  console.log('getValues', getValues());
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
                className="text-white hover:bg-white h-[40px] sm:h-[48px] text-sm sm:text-base hover:text-primary px-3 sm:px-4"
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
