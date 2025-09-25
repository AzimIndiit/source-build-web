import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { CmsPage, CreateCmsPagePayload, UpdateCmsPagePayload, ContentType } from '../types';
import { LandingPageSection } from '../types/landing';
import { LandingPageSectionEditor } from './LandingPageSectionEditor';

import { fileService } from '@/features/profile/services/fileService';
import toast from 'react-hot-toast';

const landingPageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  content: z.string().optional(), // Made optional for landing pages
});

type LandingPageFormData = z.infer<typeof landingPageSchema>;

interface LandingPageFormProps {
  onSubmit: (data: CreateCmsPagePayload | UpdateCmsPagePayload) => Promise<void>;
  onClose: () => void;
  cms?: CmsPage | null;
  isLoading?: boolean;
  edit?: boolean;
}

// Transform backend sections to frontend format
const transformBackendToFrontend = (sections: any[]): any[] => {
  if (!sections || !Array.isArray(sections)) return [];

  return sections.map((section) => {
    // Transform hero section to banner
    if (section.type === 'hero') {
      return {
        id: section._id || section.id || Date.now().toString(),
        type: 'banner',
        title: section.title || 'Hero Section',
        subtitle: section.subtitle || '',
        imageUrl: section.backgroundImage || '',
        buttons:
          section.items?.map((item: any) => ({
            id: Date.now().toString() + Math.random(),
            title: item.title || '',
            link: item.link || '#',
          })) || [],
      };
    }

    // Transform categories section to collection
    if (section.type === 'categories') {
      return {
        id: section._id || section.id || Date.now().toString(),
        type: 'collection',
        title: section.title || 'Categories Overview',
        // Keep categoryIds for the form to use
        categoryIds: section.categoryIds || [],
        // Transform items if they exist (for display purposes)
        categories:
          section.items?.map((item: any) => ({
            id: item._id || item.id,
            name: item.title || '',
            imageUrl: item.image || '',
            link: item.link || '',
          })) || [],
        expandAllButton: { title: 'Explore All', link: '/marketplace' },
      };
    }

    // Transform products section
    if (section.type === 'products') {
      return {
        id: section._id || section.id || Date.now().toString(),
        type: 'products',
        title: section.title || 'Products Section',
        // Keep productIds for the form to use
        productIds: section.productIds || [],
        // Transform items if they exist (for display purposes)
        products:
          section.items?.map((item: any) => ({
            id: item._id || item.id,
            title: item.title || '',
            price: item.price || '0',
            image: item.image || '',
            description: item.description || '',
            delivery: 'Standard delivery',
            location: '',
            seller: '',
          })) || [],
      };
    }

    return section;
  });
};

// Transform frontend sections to backend format for API submission
const transformFrontendToBackend = async (
  sections: any[],
  uploadedImages: Record<string, File>
): Promise<any[]> => {
  const transformedSections = [];
  const uploadErrors: string[] = [];

  for (const section of sections) {
    let transformedSection: any = {
      _id: section.id,
      type: section.type,
      title: section.title,
    };

    // Transform banner to hero section
    if (section.type === 'banner') {
      let imageUrl = section.imageUrl;

      // Handle file upload if there's a pending upload for this section
      if (uploadedImages[section.id]) {
        try {
          console.log(`📤 Uploading image for banner section "${section.title}"...`);
          imageUrl = await uploadImageToServer(uploadedImages[section.id]);
          console.log(`✅ Image uploaded successfully for section "${section.title}"`);
        } catch (error) {
          const errorMsg = `Failed to upload image for section "${section.title}"`;
          console.error(errorMsg, error);
          uploadErrors.push(errorMsg);
          throw new Error(errorMsg);
        }
      }

      transformedSection = {
        ...transformedSection,
        type: 'hero',
        subtitle: section.subtitle || '',
        backgroundImage: imageUrl || '',
        items:
          section.buttons?.map((button: any) => ({
            title: button.title || '',
            link: button.link || '#',
          })) || [],
      };
    }

    // Transform collection to categories section
    else if (section.type === 'collection') {
      console.log('Transforming collection section:', {
        sectionId: section.id,
        title: section.title,
        categoryIds: section.categoryIds,
        categoriesLength: section.categories?.length
      });
      
      transformedSection = {
        ...transformedSection,
        type: 'categories',
        items:
          section.categories?.map((category: any) => ({
            title: category.name || '',
            image: category.imageUrl || '',
            link: category.link || '',
          })) || [],
        // Preserve categoryIds for backend processing - ensure it's always an array
        categoryIds: Array.isArray(section.categoryIds) ? section.categoryIds : [],
      };
      
      console.log('Transformed to:', {
        categoryIds: transformedSection.categoryIds
      });
    }

    // Transform products section
    else if (section.type === 'products') {
      transformedSection = {
        ...transformedSection,
        items:
          section.products?.map((product: any) => ({
            title: product.title || '',
            price: product.price || '0',
            image: product.image || '',
            description: product.description || '',
          })) || [],
        // Preserve productIds for backend processing
        productIds: section.productIds || [],
      };
    }

    transformedSections.push(transformedSection);
  }

  if (uploadErrors.length > 0) {
    throw new Error(`Image upload failed: ${uploadErrors.join(', ')}`);
  }

  return transformedSections;
};

// Helper function to upload image to server
const uploadImageToServer = async (file: File): Promise<string> => {
  try {
    console.log('📤 Uploading image to server:', { fileName: file.name, fileSize: file.size });
    const response = await fileService.uploadFile(file);
    console.log('✅ Image uploaded successfully:', { url: response.data.url });
    return response.data.url;
  } catch (error: any) {
    console.error('❌ Image upload failed:', error);
    toast.error(error?.response?.data?.message || 'Failed to upload image');
    throw error;
  }
};

export const LandingPageForm: React.FC<LandingPageFormProps> = ({
  onSubmit,
  onClose,
  cms,
  isLoading = false,
  edit = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sections, setSections] = useState<LandingPageSection[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Record<string, File>>({});
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});

  // Track if there are pending images to upload
  const hasPendingImages = Object.keys(uploadedImages).length > 0;

  const methods = useForm<LandingPageFormData>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      title: '',
      content: '',
    },
    mode: 'onChange',
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (cms) {
      reset({
        title: cms.title,
        content: cms.content || '',
      });
      // Transform backend sections to frontend format
      const transformedSections = transformBackendToFrontend(cms.sections || []);
      setSections(transformedSections);
    } else {
      reset({
        title: '',
        content: '',
      });
      setSections([]);
    }
  }, [cms, reset]);

  // Validate sections before submission
  const validateSections = (sections: LandingPageSection[]): { 
    isValid: boolean; 
    errors: string[]; 
    sectionErrors: Record<string, string> 
  } => {
    const errors: string[] = [];
    const sectionErrorMap: Record<string, string> = {};
    
    // Check for at least one banner section
    const bannerSections = sections.filter(s => s.type === 'banner');
    if (bannerSections.length === 0) {
      errors.push('At least one banner section is required');
    }
    
    // Validate each section
    sections.forEach((section) => {
      const sectionErrorMessages: string[] = [];
      
      if (section.type === 'banner') {
        // Banner validation
        if (!section.title || section.title.trim().length === 0) {
          sectionErrorMessages.push('Title is required');
        }
        if (!section.subtitle || section.subtitle.trim().length === 0) {
          sectionErrorMessages.push('Subtitle is required');
        }
        if (!section.imageUrl && !uploadedImages[section.id]) {
          sectionErrorMessages.push('Image is required');
        }
      } else if (section.type === 'collection') {
        // Collection/Categories validation
        if (!section.title || section.title.trim().length === 0) {
          sectionErrorMessages.push('Title is required');
        }
        const categoryIds = (section as any).categoryIds || [];
        if (categoryIds.length === 0) {
          sectionErrorMessages.push('At least one category must be selected');
        }
      } else if (section.type === 'products') {
        // Products validation
        if (!section.title || section.title.trim().length === 0) {
          sectionErrorMessages.push('Title is required');
        }
        const productIds = (section as any).productIds || [];
        if (productIds.length === 0) {
          sectionErrorMessages.push('At least one product must be selected');
        }
      }
      
      if (sectionErrorMessages.length > 0) {
        sectionErrorMap[section.id] = sectionErrorMessages.join(', ');
        errors.push(...sectionErrorMessages.map(msg => `${section.title || 'Section'}: ${msg}`));
      }
    });
    
    return {
      isValid: errors.length === 0 && bannerSections.length > 0,
      errors,
      sectionErrors: sectionErrorMap
    };
  };

  const onSubmitForm = async (values: LandingPageFormData) => {
    try {
      setIsSubmitting(true);

      // Log current sections state
      console.log('Current sections before validation:', sections.map(s => ({
        id: s.id,
        type: s.type,
        title: s.title,
        categoryIds: (s as any).categoryIds,
        productIds: (s as any).productIds
      })));
      
      // Validate sections first
      const validation = validateSections(sections);
      if (!validation.isValid) {
        // Set section errors for inline display
        setSectionErrors(validation.sectionErrors);
        
        // Show a general error message
        toast.error('Please fix the errors in the sections below');
        
        setIsSubmitting(false);
        return;
      }
      
      // Clear any previous errors
      setSectionErrors({});

      // Check if there are pending images that need to be uploaded
      const hasPendingImages = Object.keys(uploadedImages).length > 0;
      if (hasPendingImages) {
        console.log('📤 Uploading pending images before submission...');
        toast.loading('Uploading images...');
      }

      // Transform sections from frontend to backend format (this handles image uploads)
      const transformedSections = await transformFrontendToBackend(sections, uploadedImages);

      // Prepare the payload
      const payload: CreateCmsPagePayload | UpdateCmsPagePayload = edit
        ? {
            title: values.title,
            content: values.content || '',
            sections: transformedSections,
            type: ContentType.LANDING_PAGE,
          }
        : {
            type: ContentType.LANDING_PAGE,
            title: values.title,
            content: values.content || '',
            sections: transformedSections,
          };

      console.log('📤 Submitting landing page:', {
        edit,
        pageId: cms?._id,
        hasPendingImages,
        payload,
      });

      // Submit the form data
      await onSubmit(payload);

      // Clear uploaded images after successful submission
      setUploadedImages({});

      // Reset the form and close
      reset();
      onClose();
    } catch (error) {
      console.error('❌ LandingPageForm: onSubmitForm failed', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        edit,
        pageId: cms?._id,
      });
      toast.error(edit ? 'Failed to update landing page' : 'Failed to create landing page');
    } finally {
      console.log('🏁 LandingPageForm: onSubmitForm completed');
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Page Title */}
          <div className="space-y-4">
            <FormInput
              name="title"
              label="Title"
              placeholder="Enter page title"
              disabled={edit || isSubmitting || isLoading}
              type="text"
            />
          </div>

          {/* Landing Page Sections */}
          <div className="mt-4">
            <LandingPageSectionEditor
              sections={sections as any}
              onChange={(newSections) => {
                console.log('LandingPageForm: Sections updated:', newSections.map((s: any) => ({
                  id: s.id,
                  type: s.type,
                  title: s.title,
                  categoryIds: s.categoryIds,
                  productIds: s.productIds
                })));
                setSections(newSections as any);
                
                // Clear errors when sections change
                if (Object.keys(sectionErrors).length > 0) {
                  setSectionErrors({});
                }
              }}
              disabled={isSubmitting || isLoading}
              uploadedImages={uploadedImages}
              onUploadedImagesChange={setUploadedImages}
              sectionErrors={sectionErrors}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isLoading}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 min-w-0 sm:min-w-[220px] border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 min-w-0 sm:min-w-[220px] bg-primary hover:bg-primary/90 text-white"
            title={hasPendingImages ? 'Images will be uploaded on submit' : ''}
          >
            {isSubmitting || isLoading
              ? edit
                ? 'Updating...'
                : 'Creating...'
              : edit
                ? 'Update'
                : 'Create'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
