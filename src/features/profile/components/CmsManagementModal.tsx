import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormInput } from '@/components/forms/FormInput';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ContentType } from '../services/cmsService';
import { useAllCmsContentQuery, useCreateOrUpdateCmsMutation } from '../hooks/useCmsMutations';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const cmsContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must not exceed 50000 characters'),
  isActive: z.boolean(),
});

type CmsContentFormData = z.infer<typeof cmsContentSchema>;

interface CmsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CmsManagementModal: React.FC<CmsManagementModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ContentType>(ContentType.TERMS_CONDITIONS);

  // Query all CMS content
  const { data: allContent, isLoading } = useAllCmsContentQuery();
  const createOrUpdateMutation = useCreateOrUpdateCmsMutation();

  // Separate forms for each content type
  const termsForm = useForm<CmsContentFormData>({
    resolver: zodResolver(cmsContentSchema),
    defaultValues: {
      title: 'Terms & Conditions',
      content: '',
      isActive: true,
    },
  });

  const privacyForm = useForm<CmsContentFormData>({
    resolver: zodResolver(cmsContentSchema),
    defaultValues: {
      title: 'Privacy Policy',
      content: '',
      isActive: true,
    },
  });

  const aboutForm = useForm<CmsContentFormData>({
    resolver: zodResolver(cmsContentSchema),
    defaultValues: {
      title: 'About Us',
      content: '',
      isActive: true,
    },
  });

  // Load existing content when modal opens or data changes
  useEffect(() => {
    if (allContent?.data && isOpen) {
      const contents = allContent.data;

      // Find and set Terms & Conditions
      const terms = contents.find((c) => c.type === ContentType.TERMS_CONDITIONS);
      if (terms) {
        termsForm.reset({
          title: terms.title,
          content: terms.content,
          isActive: terms.isActive,
        });
      }

      // Find and set Privacy Policy
      const privacy = contents.find((c) => c.type === ContentType.PRIVACY_POLICY);
      if (privacy) {
        privacyForm.reset({
          title: privacy.title,
          content: privacy.content,
          isActive: privacy.isActive,
        });
      }

      // Find and set About Us
      const about = contents.find((c) => c.type === ContentType.ABOUT_US);
      if (about) {
        aboutForm.reset({
          title: about.title,
          content: about.content,
          isActive: about.isActive,
        });
      }
    }
  }, [allContent, isOpen]);

  const handleSubmit = async (data: CmsContentFormData, type: ContentType) => {
    try {
      await createOrUpdateMutation.mutateAsync({
        type,
        title: data.title,
        content: data.content,
        isActive: data.isActive,
      });
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  const getFormByType = (type: ContentType) => {
    switch (type) {
      case ContentType.TERMS_CONDITIONS:
        return termsForm;
      case ContentType.PRIVACY_POLICY:
        return privacyForm;
      case ContentType.ABOUT_US:
        return aboutForm;
      default:
        return termsForm;
    }
  };

  const currentForm = getFormByType(activeTab);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">Manage CMS Content</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ContentType)}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value={ContentType.TERMS_CONDITIONS}>Terms & Conditions</TabsTrigger>
              <TabsTrigger value={ContentType.PRIVACY_POLICY}>Privacy Policy</TabsTrigger>
              <TabsTrigger value={ContentType.ABOUT_US}>About Us</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-1">
              <TabsContent value={ContentType.TERMS_CONDITIONS} className="mt-4">
                <FormProvider {...termsForm}>
                  <form
                    onSubmit={termsForm.handleSubmit((data) =>
                      handleSubmit(data, ContentType.TERMS_CONDITIONS)
                    )}
                  >
                    <ContentForm />
                    <SaveButton isSubmitting={createOrUpdateMutation.isPending} />
                  </form>
                </FormProvider>
              </TabsContent>

              <TabsContent value={ContentType.PRIVACY_POLICY} className="mt-4">
                <FormProvider {...privacyForm}>
                  <form
                    onSubmit={privacyForm.handleSubmit((data) =>
                      handleSubmit(data, ContentType.PRIVACY_POLICY)
                    )}
                  >
                    <ContentForm />
                    <SaveButton isSubmitting={createOrUpdateMutation.isPending} />
                  </form>
                </FormProvider>
              </TabsContent>

              <TabsContent value={ContentType.ABOUT_US} className="mt-4">
                <FormProvider {...aboutForm}>
                  <form
                    onSubmit={aboutForm.handleSubmit((data) =>
                      handleSubmit(data, ContentType.ABOUT_US)
                    )}
                  >
                    <ContentForm />
                    <SaveButton isSubmitting={createOrUpdateMutation.isPending} />
                  </form>
                </FormProvider>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Reusable form content component
const ContentForm: React.FC = () => {
  const { register, watch, setValue } = useForm<CmsContentFormData>();
  const isActive = watch('isActive');

  return (
    <div className="space-y-4">
      <FormInput name="title" label="Title" placeholder="Enter title" className="w-full" required />

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <textarea
          {...register('content')}
          id="content"
          rows={15}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
          placeholder="Enter your content here..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) => setValue('isActive', checked)}
        />
        <Label htmlFor="isActive" className="text-sm">
          Make this content visible to buyers
        </Label>
      </div>
    </div>
  );
};

// Save button component
const SaveButton: React.FC<{ isSubmitting: boolean }> = ({ isSubmitting }) => (
  <div className="flex justify-end mt-6 pt-4 border-t">
    <Button type="submit" disabled={isSubmitting} className="px-6">
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        'Save Content'
      )}
    </Button>
  </div>
);

export default CmsManagementModal;
