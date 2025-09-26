import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui';
import { FormSelect } from '@/components/forms/FormSelect';
import { Upload, X, Trash2, Plus } from 'lucide-react';
import {
  useUpdateBannerSection,
  useUpdateCollectionSection,
  useUpdateProductSection,
} from '../hooks/useCmsMutations';
import { BannerSection, CollectionSection, ProductSection, BannerButton } from '../types/landing';
import { fileService } from '@/features/profile/services/fileService';
import toast from 'react-hot-toast';

interface BannerSectionFormProps {
  section: BannerSection;
  pageId: string;
  onUpdate: (updates: Partial<BannerSection>) => void;
  disabled?: boolean;
}

interface CollectionSectionFormProps {
  section: CollectionSection;
  pageId: string;
  categoryOptions: { value: string; label: string }[];
  onUpdate: (updates: Partial<CollectionSection>) => void;
  disabled?: boolean;
}

interface ProductSectionFormProps {
  section: ProductSection;
  pageId: string;
  productOptions: { value: string; label: string }[];
  onUpdate: (updates: Partial<ProductSection>) => void;
  disabled?: boolean;
}

const MAX_BUTTONS_PER_BANNER = 2;

export const BannerSectionForm: React.FC<BannerSectionFormProps> = ({
  section,
  pageId,
  onUpdate,
  disabled = false,
}) => {
  const [localSection, setLocalSection] = useState(section);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const updateBannerMutation = useUpdateBannerSection();

  useEffect(() => {
    setLocalSection(section);
    setHasChanges(false);
  }, [section]);

  const handleFieldChange = (field: string, value: any) => {
    setLocalSection((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const uploadedUrl = await fileService.uploadFile(file);
      handleFieldChange('imageUrl', uploadedUrl);
      setUploadedImage(null);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async () => {
    // Upload image first if there's a pending upload
    if (uploadedImage) {
      await handleImageUpload(uploadedImage);
    }

    // Update the section
    updateBannerMutation.mutate(
      {
        pageId,
        sectionId: section.id,
        data: {
          title: localSection.title,
          subtitle: localSection.subtitle,
          imageUrl: localSection.imageUrl,
          buttons: localSection.buttons,
        },
      },
      {
        onSuccess: () => {
          onUpdate(localSection);
          setHasChanges(false);
          toast.success('Banner section updated successfully');
        },
        onError: () => {
          toast.error('Failed to update banner section');
        },
      }
    );
  };

  const handleCancel = () => {
    setLocalSection(section);
    setUploadedImage(null);
    setHasChanges(false);
  };

  const addButton = () => {
    const newButton: BannerButton = {
      id: `btn-${Date.now()}`,
      title: '',
      link: '',
    };
    const updatedButtons = [...(localSection.buttons || []), newButton];
    handleFieldChange('buttons', updatedButtons);
  };

  const removeButton = (buttonId: string) => {
    const updatedButtons = localSection.buttons?.filter((btn) => btn.id !== buttonId);
    handleFieldChange('buttons', updatedButtons);
  };

  const updateButton = (buttonId: string, updates: Partial<BannerButton>) => {
    const updatedButtons = localSection.buttons?.map((btn) =>
      btn.id === buttonId ? { ...btn, ...updates } : btn
    );
    handleFieldChange('buttons', updatedButtons);
    setHasChanges(true);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Banner Section</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor={`banner-title-${section.id}`}>Title</Label>
          <Input
            id={`banner-title-${section.id}`}
            value={localSection.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Enter banner title"
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor={`banner-subtitle-${section.id}`}>Subtitle</Label>
          <Textarea
            id={`banner-subtitle-${section.id}`}
            value={localSection.subtitle || ''}
            onChange={(e) => handleFieldChange('subtitle', e.target.value)}
            placeholder="Enter banner subtitle"
            disabled={disabled}
            rows={3}
          />
        </div>

        <div>
          <Label>Background Image</Label>
          <div className="mt-2">
            {localSection.imageUrl || uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage ? URL.createObjectURL(uploadedImage) : localSection.imageUrl}
                  alt="Banner"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleFieldChange('imageUrl', '');
                    setUploadedImage(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id={`banner-upload-${section.id}`}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedImage(file);
                      setHasChanges(true);
                    }
                  }}
                  disabled={disabled}
                />
                <label htmlFor={`banner-upload-${section.id}`} className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                </label>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Call-to-Action Buttons</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addButton}
              disabled={disabled || (localSection.buttons?.length || 0) >= MAX_BUTTONS_PER_BANNER}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Button
            </Button>
          </div>

          {localSection.buttons?.map((button) => (
            <div key={button.id} className="flex gap-2 mb-2">
              <Input
                value={button.title || ''}
                onChange={(e) => updateButton(button.id, { title: e.target.value })}
                placeholder="Button text"
                disabled={disabled}
              />
              <Input
                value={button.link || ''}
                onChange={(e) => updateButton(button.id, { link: e.target.value })}
                placeholder="Button URL"
                disabled={disabled}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeButton(button.id)}
                disabled={disabled}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Update and Cancel Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={disabled || !hasChanges}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={
              disabled || updateBannerMutation.isPending || isUploading || !hasChanges || !pageId
            }
            className="bg-primary hover:bg-primary/90"
          >
            {updateBannerMutation.isPending ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const CollectionSectionForm: React.FC<CollectionSectionFormProps> = ({
  section,
  pageId,
  categoryOptions,
  onUpdate,
  disabled = false,
}) => {
  const [localSection, setLocalSection] = useState(section);
  const [hasChanges, setHasChanges] = useState(false);
  const updateCollectionMutation = useUpdateCollectionSection();

  const methods = useForm({
    defaultValues: {
      [`categories-${section.id}`]: section.categoryIds || [],
    },
  });

  useEffect(() => {
    setLocalSection(section);
    methods.reset({
      [`categories-${section.id}`]: section.categoryIds || [],
    });
    setHasChanges(false);
  }, [section]);

  const handleFieldChange = (field: string, value: any) => {
    setLocalSection((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleUpdate = async () => {
    const formValues = methods.getValues();
    const categoryIds = formValues[`categories-${section.id}`] || [];

    updateCollectionMutation.mutate(
      {
        pageId,
        sectionId: section.id,
        data: {
          title: localSection.title,
          categoryIds,
        },
      },
      {
        onSuccess: () => {
          onUpdate({ ...localSection, categoryIds });
          setHasChanges(false);
          toast.success('Collection section updated successfully');
        },
        onError: () => {
          toast.error('Failed to update collection section');
        },
      }
    );
  };

  const handleCancel = () => {
    setLocalSection(section);
    methods.reset({
      [`categories-${section.id}`]: section.categoryIds || [],
    });
    setHasChanges(false);
  };

  // Watch for form changes
  useEffect(() => {
    const subscription = methods.watch(() => setHasChanges(true));
    return () => subscription.unsubscribe();
  }, [methods.watch]);

  return (
    <FormProvider {...methods}>
      <Card className="p-6 space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Collection Section</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor={`collection-title-${section.id}`}>Section Title</Label>
            <Input
              id={`collection-title-${section.id}`}
              value={localSection.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter section title"
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor={`categories-${section.id}`}>Categories</Label>
            <FormSelect
              name={`categories-${section.id}`}
              label=""
              placeholder="Select categories"
              className="border-gray-300"
              options={categoryOptions}
              multiple
              searchable
              searchPlaceholder="Search category"
            />
          </div>

          {/* Update and Cancel Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={disabled || !hasChanges}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={disabled || updateCollectionMutation.isPending || !hasChanges || !pageId}
              className="bg-primary hover:bg-primary/90"
            >
              {updateCollectionMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </Card>
    </FormProvider>
  );
};

export const ProductSectionForm: React.FC<ProductSectionFormProps> = ({
  section,
  pageId,
  productOptions,
  onUpdate,
  disabled = false,
}) => {
  const [localSection, setLocalSection] = useState(section);
  const [hasChanges, setHasChanges] = useState(false);
  const updateProductMutation = useUpdateProductSection();

  const methods = useForm({
    defaultValues: {
      [`products-${section.id}`]: section.productIds || [],
    },
  });

  useEffect(() => {
    setLocalSection(section);
    methods.reset({
      [`products-${section.id}`]: section.productIds || [],
    });
    setHasChanges(false);
  }, [section]);

  const handleFieldChange = (field: string, value: any) => {
    setLocalSection((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleUpdate = async () => {
    const formValues = methods.getValues();
    const productIds = formValues[`products-${section.id}`] || [];

    updateProductMutation.mutate(
      {
        pageId,
        sectionId: section.id,
        data: {
          title: localSection.title,
          productIds,
        },
      },
      {
        onSuccess: () => {
          onUpdate({ ...localSection, productIds });
          setHasChanges(false);
          toast.success('Product section updated successfully');
        },
        onError: () => {
          toast.error('Failed to update product section');
        },
      }
    );
  };

  const handleCancel = () => {
    setLocalSection(section);
    methods.reset({
      [`products-${section.id}`]: section.productIds || [],
    });
    setHasChanges(false);
  };

  // Watch for form changes
  useEffect(() => {
    const subscription = methods.watch(() => setHasChanges(true));
    return () => subscription.unsubscribe();
  }, [methods.watch]);

  return (
    <FormProvider {...methods}>
      <Card className="p-6 space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Product Section</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor={`product-title-${section.id}`}>Section Title</Label>
            <Input
              id={`product-title-${section.id}`}
              value={localSection.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter section title"
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor={`products-${section.id}`}>Products</Label>
            <FormSelect
              name={`products-${section.id}`}
              label=""
              placeholder="Select products"
              className="border-gray-300"
              options={productOptions}
              multiple
              searchable
              searchPlaceholder="Search product"
            />
          </div>

          {/* Update and Cancel Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={disabled || !hasChanges}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={disabled || updateProductMutation.isPending || !hasChanges || !pageId}
              className="bg-primary hover:bg-primary/90"
            >
              {updateProductMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </Card>
    </FormProvider>
  );
};
