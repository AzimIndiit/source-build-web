import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';
import { FormInput } from '@/components/forms/FormInput';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Category,
  CreateCategoryDto,
  Subcategory,
  UpdateCategoryDto,
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from '../types';
import { fileService } from '@/features/profile/services/fileService';
import { validateImageFile } from '@/utils/imageValidation';
import toast from 'react-hot-toast';

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(100, 'Category name must not exceed 100 characters'),
  description: z.string().trim().optional(),
  image: z.string().trim().min(1, 'Category image is required'),
  order: z.number().min(0, 'Order must be at least 0').optional(),
  isActive: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateCategoryDto | UpdateCategoryDto | CreateSubcategoryDto | UpdateSubcategoryDto
  ) => Promise<void>;
  category?: Category | Subcategory | null;
  categoryId?: string;
  isLoading?: boolean;
  edit?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading = false,
  edit = false,
  categoryId,
}) => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
      order: 0,
      isActive: true,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = methods;

  const watchedIsActive = watch('isActive');

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        image: category.image || 'existing', // Set placeholder for existing image
        order: category.order || 0,
        isActive: category.isActive,
      });
      setExistingImage(category.image || null);
      setUploadedImage(null);
    } else {
      reset({
        name: '',
        description: '',
        image: '',
        order: 0,
        isActive: true,
      });
      setExistingImage(null);
      setUploadedImage(null);
    }
  }, [category, reset]);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection
  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Validate image file using utility function
    const validation = await validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file');
      return;
    }

    // Clear validation errors and update form
    clearErrors('image');
    setValue('image', 'uploaded'); // Set a placeholder value to satisfy validation
    setUploadedImage(file);
    setExistingImage(null);
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  // Remove uploaded image
  const removeUploadedImage = () => {
    setUploadedImage(null);
    setValue('image', ''); // Clear the form field
  };

  // Remove existing image
  const removeExistingImage = () => {
    setExistingImage(null);
    setValue('image', ''); // Clear the form field
  };

  // Upload image to server
  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      const response = await fileService.uploadFile(file);
      return response.data.url;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload image');
      throw error;
    }
  };

  const onSubmitForm = async (values: CategoryFormData) => {
    try {
      // Validate that an image is provided
      if (!uploadedImage && !existingImage) {
        toast.error('Please upload a category image');
        return;
      }

      setIsSubmitting(true);
      let imageUrl = values.image;

      // Upload new image if one was selected
      if (uploadedImage) {
        imageUrl = await uploadImageToServer(uploadedImage);
      } else if (existingImage) {
        imageUrl = existingImage;
      }

      const submitData:
        | CreateCategoryDto
        | UpdateCategoryDto
        | CreateSubcategoryDto
        | UpdateSubcategoryDto = {
        ...values,
        image: imageUrl,
      };
      if (categoryId) {
        (submitData as CreateSubcategoryDto | UpdateSubcategoryDto).category = categoryId;
      }
      await onSubmit(submitData);
      reset();
      setUploadedImage(null);
      setExistingImage(null);
      onClose();
    } catch (error) {
      // Error is handled in the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {category
              ? categoryId
                ? 'Edit Subcategory'
                : 'Edit Category'
              : categoryId
                ? 'Create New Subcategory'
                : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Category Name */}
            <FormInput
              name="name"
              label="Category Name"
              placeholder="Enter category name"
              disabled={isSubmitting}
              type="text"
            />

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">
                Category Image
                <span className="text-red-500 ml-1">*</span>
              </Label>

              {/* Image Upload Area */}
              {!existingImage && !uploadedImage ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center ${
                    dragActive
                      ? 'border-primary bg-blue-50'
                      : errors.image
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="category-image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="category-image-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <span className="text-sm  text-gray-400 font-medium">
                      Drag & drop media or{' '}
                      <span className="text-primary underline">click here</span>
                    </span>
                    <span className="text-xs text-red-600 mt-1">Max file size is 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Upload more area */}
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
                      id="category-image-upload-more"
                      className="hidden"
                      accept="image/*"
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="category-image-upload-more"
                      className="cursor-pointer inline-flex items-center gap-2"
                    >
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Drag & drop media or{' '}
                        <span className="text-primary underline">click here</span>
                      </span>
                    </label>
                    <div className="text-xs text-red-600">Max file size is 5MB</div>
                  </div>

                  {/* Image Preview */}
                  <div className="grid grid-cols-1 gap-2">
                    {/* Display existing image */}
                    {existingImage && (
                      <div className="relative group border border-gray-200 rounded-sm shadow-sm">
                        <img
                          src={existingImage}
                          alt="Category"
                          className="w-full h-32 object-cover rounded-sm"
                        />
                        <button
                          type="button"
                          onClick={removeExistingImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer"
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {/* Display newly uploaded image */}
                    {uploadedImage && (
                      <div className="relative group border border-gray-200 rounded-sm shadow-sm">
                        <img
                          src={URL.createObjectURL(uploadedImage)}
                          alt="Upload preview"
                          className="w-full h-32 object-cover rounded-sm"
                        />
                        <button
                          type="button"
                          onClick={removeUploadedImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer"
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {errors.image && <p className="text-sm text-red-600">{errors.image.message}</p>}
            </div>

            {/* Display Order */}
            {/* <div className="space-y-2">
              <Label htmlFor="order">Display Order (Optional)</Label>
              <input
                {...register('order', {
                  setValueAs: (value) => {
                    const parsed = parseInt(value, 10);
                    return isNaN(parsed) ? 0 : parsed;
                  },
                })}
                id="order"
                type="number"
                min={1}
                placeholder="1"
                disabled={isLoading || isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.order && <p className="text-sm text-red-600">{errors.order.message}</p>}
              <p className="text-sm text-gray-500">Lower numbers appear first</p>
            </div> */}

            {/* Active Status */}
            {edit ? (
              <div className="flex items-center justify-between rounded-lg p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-base font-medium">
                    Status
                  </Label>
                </div>
                <div className="flex gap-2 items-center">
                  <p className={`${watchedIsActive ? 'text-green-500' : 'text-red-500'}`}>
                    {watchedIsActive ? 'Active' : 'Inactive'}
                  </p>
                  <Switch
                    id="isActive"
                    checked={watchedIsActive}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ) : null}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 w-[220px] border-gray-200 text-gray-600 "
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white px-6 w-[220px]"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
