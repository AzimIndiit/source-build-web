import React, { useEffect, useMemo, useCallback, memo } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProductsQuery } from '@/features/products/hooks/useProductMutations';
import { useForm, FormProvider } from 'react-hook-form';
import {
  BannerSection,
  CollectionSection,
  ProductSection,
  LandingPageSection,
  BannerButton,
} from '../types/landing';
import axiosInstance from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { fileService } from '@/features/profile/services/fileService';
import toast from 'react-hot-toast';
import { Category } from '../../categories/types';
import { FormSelect } from '@/components/forms/FormSelect';
import { Textarea } from '@/components/ui';

// Custom hook for form management
const useSectionForm = (sectionId: string, getValues: () => (string | undefined)[]) => {
  const methods = useForm({
    defaultValues: {
      [`${sectionId}`]: getValues(),
    },
  });

  const { watch, reset } = methods;

  useEffect(() => {
    const values = getValues();
    reset({ [`${sectionId}`]: values });
  }, [sectionId, reset]);

  return { methods, watch, reset };
};

interface LandingPageSectionEditorProps {
  sections: LandingPageSection[];
  onChange: (sections: LandingPageSection[]) => void;
  disabled?: boolean;
  uploadedImages?: Record<string, File>;
  onUploadedImagesChange?: (images: Record<string, File>) => void;
}

// Collection Section Form Component
interface CollectionSectionFormProps {
  section: CollectionSection;
  categoryOptions: { value: string; label: string }[];
  onUpdate: (updates: Partial<CollectionSection>) => void;
  onUpdateCategories: (ids: string[]) => void;
  disabled?: boolean;
}

// Product Section Form Component
interface ProductSectionFormProps {
  section: ProductSection;
  productOptions: { value: string; label: string }[];
  onUpdate: (updates: Partial<ProductSection>) => void;
  onUpdateProducts: (ids: string[]) => void;
  disabled?: boolean;
}

const CollectionSectionForm: React.FC<CollectionSectionFormProps> = memo(({
  section,
  categoryOptions,
  onUpdate,
  onUpdateCategories,
  disabled = false,
}) => {
  // Use ref to store the latest callback to prevent infinite loops
  const onUpdateCategoriesRef = React.useRef(onUpdateCategories);
  React.useEffect(() => {
    onUpdateCategoriesRef.current = onUpdateCategories;
  }, [onUpdateCategories]);

  // Process category values - use categoryIds which are MongoDB ObjectIds
  const getCategoryValues = () => {
 
    // Use categoryIds if available (these are MongoDB ObjectIds)
    if (section.categoryIds && section.categoryIds.length > 0) {
      const validIds = section.categoryIds.filter(id => {
        // Only return valid MongoDB ObjectIds (24 char hex strings)
        const isValid = /^[a-f\d]{24}$/i.test(id);
        if (!isValid) {
          console.warn(`⚠️ [CATEGORY INIT] Invalid categoryId found: ${id}`);
        }
        return isValid;
      });
      return validIds;
    }
    // Fallback to categories for backward compatibility
    if (section.categories) {
      const ids = section.categories.map(cat => cat.id).filter(id => {
        // Only return valid MongoDB ObjectIds
        const isValid = /^[a-f\d]{24}$/i.test(id);
        if (!isValid) {
          console.warn(`⚠️ [CATEGORY INIT] Invalid category.id found: ${id}`);
        }
        return isValid;
      });
      return ids;
    }
    return [];
  };

  // Create a unique form instance for each section
  const { methods, watch } = useSectionForm(
    `categories-${section.id}`,
    getCategoryValues
  );
  
  // Watch the specific field for this section and update categories when it changes
  const selectedCategoryIds = watch(`categories-${section.id}`);
  
  // Update categories when form field changes - only update local state
  React.useEffect(() => {
  

    if (selectedCategoryIds && Array.isArray(selectedCategoryIds)) {
      // Only update if the values are different from current section categories
      const currentIds = section.categories?.map(cat => cat.id) || [];
      
      // Sort arrays to ensure consistent comparison
      const sortedSelectedIds = [...selectedCategoryIds].sort();
      const sortedCurrentIds = [...currentIds].sort();
      
      const hasChanges = sortedSelectedIds.length !== sortedCurrentIds.length || 
                         sortedSelectedIds.some((id, idx) => id !== sortedCurrentIds[idx]);
    
      
      if (hasChanges) {
        const categoryIds = selectedCategoryIds.filter(Boolean) as string[];
        
      
        
        onUpdateCategoriesRef.current(categoryIds);
      }
    } 
  }, [selectedCategoryIds]); // Remove onUpdateCategories from dependencies to prevent infinite loops

  return (
    <FormProvider {...methods}>
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`collection-title-${section.id}`} className="text-sm font-medium text-gray-700">
            Section Title
          </Label>
          <Input
            id={`collection-title-${section.id}`}
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter section title"
            disabled={disabled}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`categories-${section.id}`} className="text-sm font-medium text-gray-700">
            Categories
          </Label>
          <FormSelect
            name={`categories-${section.id}`}
            label=""
            placeholder="Select categories"
            className="border-gray-300 h-[53px]"
            options={categoryOptions}
            maxSelections={MAX_CATEGORY_SELECTIONS}
            multiple
            searchable
            searchPlaceholder='Search category'
          />
        
        </div>

        {/* <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <Label htmlFor={`button-title-${section.id}`} className="text-sm font-medium text-gray-700">
              Expand All Button Text
            </Label>
            <Input
              id={`button-title-${section.id}`}
              value={section.expandAllButton?.title || ''}
              onChange={(e) =>
                onUpdate({
                  expandAllButton: { ...section.expandAllButton!, title: e.target.value },
                })
              }
              placeholder="e.g., View All Categories"
              disabled={disabled}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`button-link-${section.id}`} className="text-sm font-medium text-gray-700">
              Expand All Button URL
            </Label>
            <Input
              id={`button-link-${section.id}`}
              value={section.expandAllButton?.link || ''}
              onChange={(e) =>
                onUpdate({
                  expandAllButton: { ...section.expandAllButton!, link: e.target.value },
                })
              }
              placeholder="e.g., /marketplace/categories"
              disabled={disabled}
              className="w-full"
            />
          </div>
        </div> */}
      </Card>
    </FormProvider>
  );
});

const ProductSectionForm: React.FC<ProductSectionFormProps> = memo(({
  section,
  productOptions,
  onUpdate,
  onUpdateProducts,
  disabled = false,
}) => {
  // Use ref to store the latest callback to prevent infinite loops
  const onUpdateProductsRef = React.useRef(onUpdateProducts);
  React.useEffect(() => {
    onUpdateProductsRef.current = onUpdateProducts;
  }, [onUpdateProducts]);

  // Process product values - use productIds which are MongoDB ObjectIds
  const getProductValues = () => {

    
    // Use productIds if available (these are MongoDB ObjectIds)
    if (section.productIds && section.productIds.length > 0) {
      const validIds = section.productIds.filter(id => {
        // Only return valid MongoDB ObjectIds (24 char hex strings)
        const isValid = /^[a-f\d]{24}$/i.test(id);
        if (!isValid) {
          console.warn(`⚠️ [PRODUCT INIT] Invalid productId found: ${id}`);
        }
        return isValid;
      });
      return validIds;
    }
    // Fallback to products for backward compatibility
    if (section.products) {
      const ids = section.products.map(item => item.id).filter((id): id is string => {
        // Only return valid MongoDB ObjectIds
        const isValid = id ? /^[a-f\d]{24}$/i.test(id) : false;
        if (id && !isValid) {
          console.warn(`⚠️ [PRODUCT INIT] Invalid product.id found: ${id}`);
        }
        return isValid;
      });
      return ids;
    }
    return [];
  };

  // Create a unique form instance for each section
  const { methods, watch } = useSectionForm(
    `products-${section.id}`,
    getProductValues
  );
  
  // Watch the specific field for this section and update products when it changes
  const selectedProductIds = watch(`products-${section.id}`);
  
  // Update products when form field changes - only update local state
  React.useEffect(() => {
   
    if (selectedProductIds && Array.isArray(selectedProductIds)) {
      // Only update if the values are different from current section products
      const currentIds = section.products?.map(item => item.id) || [];
      
      // Sort arrays to ensure consistent comparison
      const sortedSelectedIds = [...selectedProductIds].sort();
      const sortedCurrentIds = [...currentIds].sort();
      
      const hasChanges = sortedSelectedIds.length !== sortedCurrentIds.length || 
                         sortedSelectedIds.some((id, idx) => id !== sortedCurrentIds[idx]);
      
     
      
      if (hasChanges) {
        const productIds = selectedProductIds.filter(Boolean) as string[];
        
       
        // Only update local state for immediate UI feedback
        // Section-specific mutations will be handled by the Update button in AddCmsModal
        onUpdateProductsRef.current(productIds);
      } 
    } 
  }, [selectedProductIds]); // Remove onUpdateProducts from dependencies to prevent infinite loops

  return (
    <FormProvider {...methods}>
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`product-title-${section.id}`} className="text-sm font-medium text-gray-700">
            Section Title
          </Label>
          <Input
            id={`product-title-${section.id}`}
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter section title"
            disabled={disabled}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`products-${section.id}`} className="text-sm font-medium text-gray-700">
            Products
          </Label>
          <FormSelect
            name={`products-${section.id}`}
            label=""
            placeholder="Select products"
            className="border-gray-300 h-[53px]"
            options={productOptions}
            maxSelections={MAX_PRODUCT_SELECTIONS}
            multiple
            searchable
            searchPlaceholder='Search product'
          />
        </div>
{/* 
        <Input
          value={section.subtitle || ''}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          placeholder="Section subtitle (optional)"
          disabled={disabled}
        /> */}
      </Card>
    </FormProvider>
  );
});

// Constants for better maintainability
const DEFAULT_LIMIT = 100;
const MAX_CATEGORY_SELECTIONS = 4;
const MAX_PRODUCT_SELECTIONS = 8;
const MAX_BANNER_SECTIONS = 5;
const MAX_BUTTONS_PER_BANNER = 2;

// Memoized section filters for better performance
export const LandingPageSectionEditor: React.FC<LandingPageSectionEditorProps> = ({
  sections,
  onChange,
  disabled = false,
  uploadedImages = {},
  onUploadedImagesChange,
}) => {
  // Use passed uploadedImages or fallback to local state
  const [localUploadedImages, setLocalUploadedImages] = React.useState<Record<string, File>>({});
  const [dragActive, setDragActive] = React.useState<Record<string, boolean>>({});

  // Use external uploadedImages if provided, otherwise use local state
  const currentUploadedImages = onUploadedImagesChange ? uploadedImages : localUploadedImages;
  const setCurrentUploadedImages = onUploadedImagesChange ? onUploadedImagesChange : setLocalUploadedImages;

  // File upload helper functions
  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      const response = await fileService.uploadFile(file);
      return response.data.url;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload image');
      throw error;
    }
  };

  const handleFileSelect = (sectionId: string, file: File) => {
    // Store the file temporarily without uploading
    const newImages = { ...currentUploadedImages, [sectionId]: file };
    setCurrentUploadedImages(newImages);
  };

  const handleDrag = (sectionId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [sectionId]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  const handleDrop = (sectionId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [sectionId]: false }));

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(sectionId, file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const handleInputChange = (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(sectionId, file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const removeUploadedImage = (sectionId: string) => {
    const newImages = { ...currentUploadedImages };
    delete newImages[sectionId];
    setCurrentUploadedImages(newImages);
  };

  const uploadPendingImages = async () => {
    const uploadPromises = Object.keys(currentUploadedImages).map(async (sectionId) => {
      const file = currentUploadedImages[sectionId];
      try {
        const imageUrl = await uploadImageToServer(file);
        // Update the section with the uploaded image URL
        const section = sections.find(s => s.id === sectionId);
        if (section?.type === 'banner') {
          updateSection(sectionId, { imageUrl });
        }
        return { sectionId, success: true };
      } catch (error) {
        console.error(`Failed to upload image for section ${sectionId}:`, error);
        return { sectionId, success: false, error };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    // Clear successfully uploaded images
    const newImages = { ...currentUploadedImages };
    results.forEach(result => {
      if (result.success) {
        delete newImages[result.sectionId];
      }
    });
    setCurrentUploadedImages(newImages);

    // Show results
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    if (successCount > 0) {
      toast.success(`${successCount} image(s) uploaded successfully`);
    }
    if (failureCount > 0) {
      toast.error(`${failureCount} image(s) failed to upload`);
    }
  };

  const hasPendingImages = Object.keys(uploadedImages).length > 0;
  // Memoize filtered sections to prevent unnecessary re-computations
  const { bannerSections, collectionSections, productSections } = useMemo(() => ({
    bannerSections: sections.filter((s) => s.type === 'banner') as BannerSection[],
    collectionSections: sections.filter((s) => s.type === 'collection') as CollectionSection[],
    productSections: sections.filter((s) => s.type === 'products') as ProductSection[],
  }), [sections]);

  // Fetch categories for the multi-select
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-active'],
    queryFn: async () => {
      const response = await axiosInstance.get('/categories', {
        params: { limit: DEFAULT_LIMIT },
      });
      const categories = response.data.data as Category[];
      return categories.filter((cat) => cat.isActive);
    },
  });

  // Fetch products for the multi-select
  const { data: productsResponse } = useProductsQuery({ limit: DEFAULT_LIMIT });
  
  // Memoize data processing to prevent unnecessary re-computations
  const { categoryOptions, productOptions } = useMemo(() => {
    const categories = categoriesData?.map((category) => ({
      value: category._id,
      label: category.name,
    })) || [];

    const products = Array.isArray(productsResponse?.data)
      ? productsResponse.data
      : (productsResponse?.data as any)?.products || [];

    const productOpts = products.map((product: any) => ({
      value: product._id || product.id,
      label: product.title || product.name || 'Unnamed Product',
    }));

    return {
      categoryOptions: categories,
      productOptions: productOpts,
    };
  }, [categoriesData, productsResponse]);

  // Memoize callback functions to prevent unnecessary re-renders
  const addSection = useCallback((type: 'banner' | 'collection' | 'products') => {
    const sectionTitles = {
      banner: 'Hero Section',
      collection: 'Categories Overview',
      products: 'Products Section',
    };

    const sectionDefaults = {
      banner: { imageUrl: '', buttons: [] },
      collection: { categories: [], expandAllButton: { title: '', link: '' } },
      products: { products: [] },
    };

    const newSection: LandingPageSection = {
      id: Date.now().toString(),
      type,
      title: sectionTitles[type],
      
      ...sectionDefaults[type],
    };
    
    onChange([...sections, newSection]);
  }, [sections, onChange]);

  const updateSection = useCallback((sectionId: string, updates: Partial<LandingPageSection>) => {

    
    const newSections = sections.map((section) =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    
    onChange(newSections);
  }, [sections, onChange]);

  const updateSectionWithImage = useCallback(async (sectionId: string, updates: Partial<LandingPageSection>) => {
    let finalUpdates = { ...updates };
    
    // If there's an uploaded image for this section, upload it first
    if (currentUploadedImages[sectionId]) {
      try {
        const imageUrl = await uploadImageToServer(currentUploadedImages[sectionId]);
        // For banner sections, use imageUrl property
        const section = sections.find(s => s.id === sectionId);
        if (section?.type === 'banner') {
          (finalUpdates as any).imageUrl = imageUrl;
        }
        // Clear the uploaded file from state after successful upload
        const newImages = { ...currentUploadedImages };
        delete newImages[sectionId];
        setCurrentUploadedImages(newImages);
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Failed to upload image:', error);
        toast.error('Failed to upload image');
        return; // Don't update the section if image upload fails
      }
    }
    
    // Update local state for immediate UI feedback
    const newSections = sections.map((section) =>
      section.id === sectionId ? { ...section, ...finalUpdates } : section
    );
    onChange(newSections);
  }, [sections, onChange, currentUploadedImages]);

  const removeSection = useCallback((sectionId: string) => {
    onChange(sections.filter((s) => s.id !== sectionId));
  }, [sections, onChange]);

  const addBannerButton = useCallback((sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId) as BannerSection;
    if (!section) return;

    const newButton: BannerButton = {
      id: Date.now().toString(),
      title: 'Button Text',
      link: '#',
    };
    updateSection(sectionId, {
      buttons: [...(section.buttons || []), newButton],
    });
  }, [sections, updateSection]);

  const updateBannerButton = useCallback((
    sectionId: string,
    buttonId: string,
    updates: Partial<BannerButton>
  ) => {
    const section = sections.find((s) => s.id === sectionId) as BannerSection;
    if (!section) return;

    const newButtons = section.buttons?.map((btn) =>
      btn.id === buttonId ? { ...btn, ...updates } : btn
    );
    updateSection(sectionId, { buttons: newButtons });
  }, [sections, updateSection]);

  const removeBannerButton = useCallback((sectionId: string, buttonId: string) => {
    const section = sections.find((s) => s.id === sectionId) as BannerSection;
    if (!section) return;

    updateSection(sectionId, {
      buttons: section.buttons?.filter((btn) => btn.id !== buttonId),
    });
  }, [sections, updateSection]);

  const updateSectionCategories = useCallback((sectionId: string, selectedCategoryIds: string[]) => {

    
    // Filter to only include valid MongoDB ObjectIds
    const validIds = selectedCategoryIds.filter(id => {
      const isValid = /^[a-f\d]{24}$/i.test(id);
      if (!isValid) {
        console.warn(`⚠️ [CATEGORY UPDATE] Invalid ID filtered out: ${id}`);
      }
      return isValid;
    });
    

    // Store the categoryIds directly - backend will populate the data
    const updatePayload = { 
      categoryIds: validIds,
      // Clear categories to avoid confusion
      categories: []
    };
    
    updateSection(sectionId, updatePayload);
  }, [updateSection]);

  const updateSectionProducts = useCallback((sectionId: string, selectedProductIds: string[]) => {
    
    // Filter to only include valid MongoDB ObjectIds
    const validIds = selectedProductIds.filter(id => {
      const isValid = /^[a-f\d]{24}$/i.test(id);
      if (!isValid) {
        console.warn(`⚠️ [PRODUCT UPDATE] Invalid ID filtered out: ${id}`);
      }
      return isValid;
    });
    
    
    // Store the productIds directly - backend will populate the data
    const updatePayload = { 
      productIds: validIds,
      // Clear products to avoid confusion
      products: []
    };
    
    updateSection(sectionId, updatePayload);
  }, [updateSection]);


  return (
    <div className="w-full space-y-4">
  
      
      <Tabs defaultValue="banner" className="w-full ">
        <TabsList className="grid w-full grid-cols-3 rounded-sm p-1 h-full">
         <TabsTrigger 
           className='h-10 cursor-pointer hover:bg-gray-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]' 
           value="banner"
         >
           Banner Sections
         </TabsTrigger>
         <TabsTrigger  
           className='h-10 cursor-pointer hover:bg-gray-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]' 
           value="collection"
         >
           Collection Sections
         </TabsTrigger>
         <TabsTrigger  
           className='h-10 cursor-pointer hover:bg-gray-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]' 
           value="products"
         >
           Product Sections
         </TabsTrigger>
       </TabsList>

      {/* Banner Sections Tab */}
      <TabsContent value="banner" className="space-y-4 max-h-[600px] overflow-y-auto p-4 transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Banner Sections</h3>
          <Button
            type="button"
            size="sm"
            onClick={() => addSection('banner')}
            disabled={disabled || bannerSections.length >= MAX_BANNER_SECTIONS}
            className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
            title={bannerSections.length >= MAX_BANNER_SECTIONS ? `Maximum ${MAX_BANNER_SECTIONS} banner sections allowed` : 'Add a new banner section'}
          >
            <Plus className="w-4 h-4 mr-1 transition-transform duration-200" />
            Add Banner ({bannerSections.length}/{MAX_BANNER_SECTIONS})
          </Button>
        </div>

        {bannerSections.map((section) => (
          <Card key={section.id} className="p-4 space-y-4 transition-all duration-200 ease-in-out hover:shadow-md">
            <div className="flex items-center justify-between">
             <div className='flex-1'>
             <Label htmlFor={`banner-title-${section.id}`} className="text-sm font-medium text-gray-700 mb-2 block">
               Section Title
             </Label>
              <Input
                id={`banner-title-${section.id}`}
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                placeholder="Enter section title"
                disabled={disabled}
                className="w-full"
              />
             </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeSection(section.id)}
                disabled={disabled}
                className="text-red-600 hover:text-red-700 ml-4 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 transition-transform duration-200" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`banner-description-${section.id}`} className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id={`banner-description-${section.id}`}
                value={section.subtitle || ''}
                onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                placeholder="Enter section description"
                disabled={disabled}
                className="w-full resize-none rounded-sm h-20 border-gray-200 focus:border-gray-500 transition-all duration-200 ease-in-out focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Background Image
              </Label>
              {/* Image Upload Area */}
              {!section.imageUrl && !currentUploadedImages[section.id] ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                    dragActive[section.id]
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                  onDragEnter={(e) => handleDrag(section.id, e)}
                  onDragLeave={(e) => handleDrag(section.id, e)}
                  onDragOver={(e) => handleDrag(section.id, e)}
                  onDrop={(e) => handleDrop(section.id, e)}
                >
                  <input
                    type="file"
                    id={`banner-image-upload-${section.id}`}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleInputChange(section.id, e)}
                    disabled={disabled}
                  />
                  <label
                    htmlFor={`banner-image-upload-${section.id}`}
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <span className="text-sm text-gray-400 font-medium">
                      Drag & drop image or{' '}
                      <span className="text-primary underline">click here</span>
                    </span>
                    <span className="text-xs text-red-600 mt-1">Max file size is 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Upload more area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 text-center bg-gray-50 transition-all duration-200 ${
                      dragActive[section.id] ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={(e) => handleDrag(section.id, e)}
                    onDragLeave={(e) => handleDrag(section.id, e)}
                    onDragOver={(e) => handleDrag(section.id, e)}
                    onDrop={(e) => handleDrop(section.id, e)}
                  >
                    <input
                      type="file"
                      id={`banner-image-upload-more-${section.id}`}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleInputChange(section.id, e)}
                      disabled={disabled}
                    />
                    <label
                      htmlFor={`banner-image-upload-more-${section.id}`}
                      className="cursor-pointer inline-flex items-center gap-2"
                    >
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Drag & drop image or{' '}
                        <span className="text-primary underline">click here</span>
                      </span>
                    </label>
                    <div className="text-xs text-red-600">Max file size is 5MB</div>
                  </div>

                  {/* Image Preview */}
                  <div className="grid grid-cols-1 gap-2">
                    {/* Display existing image */}
                    {( currentUploadedImages[section.id] || section.imageUrl) && (
                      <div className="relative group border border-gray-200 rounded-sm shadow-sm">
                        <img
                          src={currentUploadedImages[section.id] ? URL.createObjectURL(currentUploadedImages[section.id]) : section.imageUrl}
                          alt="Banner background"
                          className="w-full h-32 object-cover rounded-sm"
                        />
                        <button
                          type="button"
                          onClick={() => updateSectionWithImage(section.id, { imageUrl: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer transition-all duration-200 hover:bg-red-600 hover:scale-110"
                          disabled={disabled}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                   
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Call-to-Action Buttons
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addBannerButton(section.id)}
                  disabled={disabled || (section.buttons?.length || 0) >= MAX_BUTTONS_PER_BANNER}
                  className="disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:hover:scale-100 hover:border-primary hover:text-primary"
                  title={(section.buttons?.length || 0) >= MAX_BUTTONS_PER_BANNER ? `Maximum ${MAX_BUTTONS_PER_BANNER} buttons per banner allowed` : 'Add a new button to this banner'}
                >
                  <Plus className="w-3 h-3 mr-1 transition-transform duration-200" />
                  Add Button ({(section.buttons?.length || 0)}/{MAX_BUTTONS_PER_BANNER})
                </Button>
              </div>
              {section.buttons?.map((button, buttonIndex) => (
                <div key={button.id} className="space-y-2 p-3 border border-gray-200 rounded-lg bg-gray-50 transition-all duration-200 ease-in-out hover:bg-gray-100 hover:border-gray-300">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-gray-600">
                      Button {buttonIndex + 1}
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeBannerButton(section.id, button.id)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-700 h-6 w-6 p-0 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 transition-transform duration-200" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor={`button-title-${button.id}`} className="text-xs font-medium text-gray-600">
                        Button Text
                      </Label>
                      <Input
                        id={`button-title-${button.id}`}
                        value={button.title}
                        onChange={(e) =>
                          updateBannerButton(section.id, button.id, { title: e.target.value })
                        }
                        placeholder="e.g., Shop Now"
                        disabled={disabled}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`button-link-${button.id}`} className="text-xs font-medium text-gray-600">
                        Button URL
                      </Label>
                      <Input
                        id={`button-link-${button.id}`}
                        value={button.link}
                        onChange={(e) =>
                          updateBannerButton(section.id, button.id, { link: e.target.value })
                        }
                        placeholder="e.g., /shop"
                        disabled={disabled}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </TabsContent>

      {/* Collection Sections Tab */}
      <TabsContent value="collection" className="space-y-4 max-h-[600px] overflow-y-auto p-4 transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Collection Sections</h3>
          {/* <Button
            type="button"
            size="sm"
            onClick={() => addSection('collection')}
            disabled={disabled || collectionSections.length >= MAX_COLLECTION_SECTIONS}
            className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
            title={collectionSections.length >= MAX_COLLECTION_SECTIONS ? `Maximum ${MAX_COLLECTION_SECTIONS} collection sections allowed` : 'Add a new collection section'}
          >
            <Plus className="w-4 h-4 mr-1 transition-transform duration-200" />
            Add Collection ({collectionSections.length}/{MAX_COLLECTION_SECTIONS})
          </Button> */}
        </div>

        {collectionSections.map((section) => (
          <CollectionSectionForm
            key={section.id}
            section={section}
            categoryOptions={categoryOptions}
            onUpdate={(updates) => updateSection(section.id, updates)}
            onUpdateCategories={(ids) => updateSectionCategories(section.id, ids)}
            disabled={disabled}
          />
        ))}
      </TabsContent>

      {/* Product Sections Tab */}
      <TabsContent value="products" className="space-y-4 max-h-[600px] overflow-y-auto p-4 transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Product Sections</h3>
          {/* <Button
            type="button"
            size="sm"
            onClick={() => addSection('products')}
            disabled={disabled || productSections.length >= MAX_PRODUCT_SECTIONS}
            className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
            title={productSections.length >= MAX_PRODUCT_SECTIONS ? `Maximum ${MAX_PRODUCT_SECTIONS} product sections allowed` : 'Add a new product section'}
          >
            <Plus className="w-4 h-4 mr-1 transition-transform duration-200" />
            Add Products ({productSections.length}/{MAX_PRODUCT_SECTIONS})
          </Button> */}
        </div>

        {productSections.map((section) => (
          <ProductSectionForm
            key={section.id}
            section={section}
            productOptions={productOptions}
            onUpdate={(updates) => updateSection(section.id, updates)}
            onUpdateProducts={(ids) => updateSectionProducts(section.id, ids)}
            disabled={disabled}
          />
        ))}
      </TabsContent>
      </Tabs>
    </div>
  );
};
