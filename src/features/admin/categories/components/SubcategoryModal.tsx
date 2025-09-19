import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { FormInput } from '@/components/forms/FormInput';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { FormSelect } from '@/components/forms/FormSelect';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Subcategory, Category, CreateSubcategoryDto, UpdateSubcategoryDto } from '../types';
import axiosInstance from '@/lib/axios';

const subcategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Subcategory name is required')
    .max(100, 'Subcategory name must not exceed 100 characters'),
  description: z.string().trim().optional(),
  category: z.string().min(1, 'Category is required'),
  image: z.string().trim().optional(),
  order: z.number().min(0, 'Order must be at least 0').optional(),
  isActive: z.boolean().optional(),
});

type SubcategoryFormData = z.infer<typeof subcategorySchema>;

interface SubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSubcategoryDto | UpdateSubcategoryDto) => Promise<void>;
  subcategory?: Subcategory | null;
  isLoading?: boolean;
}

export const SubcategoryModal: React.FC<SubcategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  subcategory,
  isLoading = false,
}) => {
  const methods = useForm<SubcategoryFormData>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      image: '',
      order: 0,
      isActive: true,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    formState: { errors, isValid },
  } = methods;

  const watchedIsActive = watch('isActive');

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: async () => {
      const response = await axiosInstance.get('/categories?limit=100&isActive=true');
      return response.data.data.categories as Category[];
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (subcategory) {
      const categoryId =
        typeof subcategory.category === 'object' ? subcategory.category._id : subcategory.category;

      reset({
        name: subcategory.name,
        description: subcategory.description || '',
        category: categoryId,
        image: subcategory.image || '',
        order: subcategory.order || 0,
        isActive: subcategory.isActive,
      });
    } else {
      reset({
        name: '',
        description: '',
        category: '',
        image: '',
        order: 0,
        isActive: true,
      });
    }
  }, [subcategory, reset]);

  const onSubmitForm = async (values: SubcategoryFormData) => {
    try {
      await onSubmit(values);
      reset();
      onClose();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  // Prepare category options for FormSelect
  const categoryOptions =
    categoriesData?.map((cat) => ({
      value: cat._id,
      label: cat.name,
    })) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{subcategory ? 'Edit Subcategory' : 'Create New Subcategory'}</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Subcategory Name */}
            <FormInput
              name="name"
              label="Subcategory Name"
              placeholder="Enter subcategory name"
              disabled={isLoading}
              type="text"
            />

            {/* Category Selection */}
            <FormSelect
              name="category"
              label="Category"
              placeholder="Select a category"
              options={categoryOptions}
              disabled={isLoading || !categoriesData}
            />

            {/* Description */}
            <FormTextarea
              name="description"
              label="Description (Optional)"
              placeholder="Enter subcategory description"
              rows={3}
              disabled={isLoading}
            />

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image">Image URL (Optional)</Label>
              <div className="relative">
                <input
                  {...register('image')}
                  id="image"
                  type="text"
                  placeholder="Enter image URL or upload"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed pr-10"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {errors.image && <p className="text-sm text-red-600">{errors.image.message}</p>}
              <p className="text-sm text-gray-500">Provide an image URL for the subcategory</p>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
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
                placeholder="0"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.order && <p className="text-sm text-red-600">{errors.order.message}</p>}
              <p className="text-sm text-gray-500">Lower numbers appear first</p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border border-gray-300 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-base font-medium">
                  Active Status
                </Label>
                <p className="text-sm text-gray-500">Active subcategories are visible to users</p>
              </div>
              <Switch
                id="isActive"
                checked={watchedIsActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
                disabled={isLoading}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !isValid}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {subcategory ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{subcategory ? 'Update Subcategory' : 'Create Subcategory'}</>
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
