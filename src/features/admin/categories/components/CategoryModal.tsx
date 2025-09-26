import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash2, Upload, X } from 'lucide-react';
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
  Attribute,
} from '../types';
import { fileService } from '@/features/profile/services/fileService';
import { validateImageFile } from '@/utils/imageValidation';
import toast from 'react-hot-toast';
import { AttributeModal } from '../../attributes/components/AttributeModal';

const attributeValueSchema = z.object({
  value: z.string().trim().min(1, 'Value is required'),
  order: z.number().optional(),
});

const attributeSchema = z.object({
  name: z.string().trim().min(1, 'Attribute name is required').max(100),
  inputType: z.enum(['text', 'number', 'dropdown', 'multiselect', 'boolean', 'radio']),
  required: z.boolean().optional(),
  values: z.array(attributeValueSchema).optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  description: z.string().trim().optional(),
  image: z.string().trim().min(1, 'Image is required'),
  order: z.number().min(0, 'Order must be at least 0').optional(),
  isActive: z.boolean().optional(),
  hasAttributes: z.boolean().optional(),
  attributes: z.array(attributeSchema).optional(),
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
  const [attributeModalOpen, setAttributeModalOpen] = useState(false);
  const [editingAttributeIndex, setEditingAttributeIndex] = useState<number | null>(null);

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
      order: 0,
      isActive: true,
      hasAttributes: false,
      attributes: [],
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    register,
    clearErrors,
    formState: { errors },
  } = methods;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'attributes',
  });

  const watchedIsActive = watch('isActive');
  const watchedHasAttributes = watch('hasAttributes');
  const watchedAttributes = watch('attributes');

  useEffect(() => {
    if (category) {
      const subcategory = category as Subcategory;
      reset({
        name: category.name,
        description: category.description || '',
        image: category.image || 'existing',
        order: category.order || 0,
        isActive: category.isActive,
        hasAttributes: subcategory.hasAttributes || false,
        attributes: subcategory.attributes || [],
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
        hasAttributes: false,
        attributes: [],
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (file: File) => {
    if (!file) return;
    const validation = await validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file');
      return;
    }
    clearErrors('image');
    setValue('image', 'uploaded');
    setUploadedImage(file);
    setExistingImage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setValue('image', '');
  };

  const removeExistingImage = () => {
    setExistingImage(null);
    setValue('image', '');
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      const response = await fileService.uploadFile(file);
      return response.data.url;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload image');
      throw error;
    }
  };

  const handleAddAttribute = (attribute: Attribute) => {
    if (editingAttributeIndex !== null) {
      update(editingAttributeIndex, attribute);
      setEditingAttributeIndex(null);
    } else {
      append(attribute);
    }
  };

  const handleEditAttribute = (index: number) => {
    setEditingAttributeIndex(index);
    setAttributeModalOpen(true);
  };

  const handleRemoveAttribute = (index: number) => {
    remove(index);
  };

  const onSubmitForm = async (values: CategoryFormData) => {
    try {
      if (!uploadedImage && !existingImage) {
        toast.error('Please upload an image');
        return;
      }

      setIsSubmitting(true);
      let imageUrl = values.image;

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

      // For subcategories
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

  const isSubcategory = !!categoryId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle>
            {category
              ? isSubcategory
                ? 'Edit Subcategory'
                : 'Edit Category'
              : isSubcategory
                ? 'Create New Subcategory'
                : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <FormInput
              name="name"
              label={isSubcategory ? 'Subcategory Name' : 'Category Name'}
              placeholder={`Enter ${isSubcategory ? 'subcategory' : 'category'} name`}
              disabled={isSubmitting}
              type="text"
              autoFocus={false}
            />

            {/* <FormInput
              name="description"
              label="Description (Optional)"
              placeholder="Enter description"
              disabled={isSubmitting}
              type="text"
            /> */}

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">
                {isSubcategory ? 'Subcategory' : 'Category'} Image
                <span className="text-red-500 ml-1">*</span>
              </Label>

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
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <span className="text-sm text-gray-400 font-medium">
                      Drag & drop media or{' '}
                      <span className="text-primary underline">click here</span>
                    </span>
                    <span className="text-xs text-red-600 mt-1">Max file size is 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
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
                      id="image-upload-more"
                      className="hidden"
                      accept="image/*"
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="image-upload-more"
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

                  <div className="grid grid-cols-1 gap-2">
                    {existingImage && (
                      <div className="relative group border border-gray-200 rounded-sm shadow-sm">
                        <img
                          src={existingImage}
                          alt="Preview"
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

            {/* Attributes Section - For both Categories and Subcategories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="hasAttributes" className="text-base font-medium">
                  Attributes
                </Label>

                <Button
                  type="button"
                  className="border-gray-200"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingAttributeIndex(null);
                    setAttributeModalOpen(true);
                    setValue('hasAttributes', true);
                  }}
                >
                  <Plus className="h-4 w-4 " />
                  Add Attribute
                </Button>
              </div>

              {watchedHasAttributes && (
                <div className="space-y-4  rounded-lg  border-gray-200 ">
                  {fields.length > 0 ? (
                    <div className="space-y-2 border-t border-gray-200 pt-4">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center justify-between p-3 border rounded-lg  border-gray-200"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{field.name}</div>
                            {/* <div className="text-sm text-gray-500">
                                Type: {field.inputType}
                                {field.required && ' • Required'}
                                {field.values && field.values.length > 0 && 
                                  ` • ${field.values.length} options`}
                              </div> */}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className=" border-gray-200"
                              onClick={() => handleEditAttribute(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveAttribute(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No attributes added yet
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Active Status */}
            {/* {edit && (
              <div className="flex items-center gap-4 rounded-lg p-4 ">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-base font-medium">
                  {watchedIsActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
                <div className="flex gap-2 items-center">
                 
                  <Switch
                    id="isActive"
                    checked={watchedIsActive}
                    className='data-[state=checked]:bg-green-500'
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )} */}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 w-[220px] border-gray-200 text-gray-600"
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

        {/* Attribute Modal */}
        {attributeModalOpen && (
          <AttributeModal
            isOpen={attributeModalOpen}
            onClose={() => {
              setAttributeModalOpen(false);
              setEditingAttributeIndex(null);
            }}
            onSubmit={async (data) => {
              handleAddAttribute(data as Attribute);
              return Promise.resolve();
            }}
            attribute={
              editingAttributeIndex !== null ? (fields[editingAttributeIndex] as any) : null
            }
            edit={editingAttributeIndex !== null}
            isLoading={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
