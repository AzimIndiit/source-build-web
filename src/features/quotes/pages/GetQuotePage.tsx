import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { validateMultipleImages } from '@/utils/imageValidation';
import { useCreateQuoteMutation } from '../hooks/useQuoteMutations';
import { fileService } from '@/features/profile/services/fileService';

// Validation schema
const getQuoteSchema = z.object({
  // Basic Project Details
  projectType: z.string().min(1, 'Project type is required'),
  installationLocation: z.string().min(1, 'Installation location is required'),
  spaceWidth: z
    .string()
    .min(1, 'Width is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Width must be a valid number'),
  spaceHeight: z
    .string()
    .min(1, 'Height is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Height must be a valid number'),
  existingDesign: z.string().min(1, 'Please select if you have existing design'),

  // Cabinet Style & Material
  cabinetStyle: z.string().min(1, 'Cabinet style is required'),
  material: z.string().min(1, 'Material is required'),
  finishColor: z.string().min(1, 'Finish or color is required'),

  // Additional comments
  additionalComments: z.string().optional(),
});

type GetQuoteForm = z.infer<typeof getQuoteSchema>;

// Options for dropdowns
const projectTypeOptions = [
  { value: 'new-construction', label: 'New construction' },
  { value: 'remodel', label: 'Remodel' },
  { value: 'multi-unit', label: 'Multi-unit' },
  { value: 'commercial', label: 'Commercial' },
];

const installationLocationOptions = [
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'office', label: 'Office' },
  { value: 'garage', label: 'Garage' },
  { value: 'basement', label: 'Basement' },
];

const existingDesignOptions = [
  { value: 'blueprints', label: 'Blueprints' },
  { value: 'sketches', label: 'Sketches' },
  { value: 'photos', label: 'Photos' },
  { value: 'none', label: 'No, I need help with design' },
];

const cabinetStyleOptions = [
  { value: 'shaker', label: 'Shaker' },
  { value: 'flat-panel', label: 'Flat panel' },
  { value: 'raised-panel', label: 'Raised panel' },
  { value: 'modern', label: 'Modern' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'transitional', label: 'Transitional' },
];

const materialOptions = [
  { value: 'mdf', label: 'MDF' },
  { value: 'plywood', label: 'Plywood' },
  { value: 'solid-wood', label: 'Solid wood' },
  { value: 'thermofoil', label: 'Thermofoil' },
  { value: 'laminate', label: 'Laminate' },
  { value: 'melamine', label: 'Melamine' },
];

const finishColorOptions = [
  { value: 'painted', label: 'Painted' },
  { value: 'stained', label: 'Stained' },
  { value: 'natural-wood', label: 'Natural wood' },
  { value: 'white', label: 'White' },
  { value: 'gray', label: 'Gray' },
  { value: 'black', label: 'Black' },
  { value: 'navy', label: 'Navy' },
  { value: 'custom-color', label: 'Custom color' },
];

const MAX_IMAGES = 10;

export const GetQuotePage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const createQuoteMutation = useCreateQuoteMutation();

  const methods = useForm<GetQuoteForm>({
    resolver: zodResolver(getQuoteSchema),
    mode: 'onChange',
    defaultValues: {
      projectType: '',
      installationLocation: '',
      spaceWidth: '',
      spaceHeight: '',
      existingDesign: '',
      cabinetStyle: '',
      material: '',
      finishColor: '',
      additionalComments: '',
    },
  });

  const { handleSubmit } = methods;

  // Compute disabled state for form elements
  const isFormDisabled = createQuoteMutation.isPending || isUploadingFiles;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);

      // Validate files
      const { validFiles, errors } = await validateMultipleImages(
        files,
        MAX_IMAGES,
        uploadedPhotos.length
      );

      if (validFiles.length > 0) {
        setUploadedPhotos((prev) => [...prev, ...validFiles]);
      }

      errors.forEach((error) => toast.error(error));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Validate files
      const { validFiles, errors } = await validateMultipleImages(
        files,
        MAX_IMAGES,
        uploadedPhotos.length
      );

      if (validFiles.length > 0) {
        setUploadedPhotos((prev) => [...prev, ...validFiles]);
      }

      errors.forEach((error) => toast.error(error));
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: GetQuoteForm) => {
    try {
      // Upload images first if any
      let imageUrls: string[] = [];

      if (uploadedPhotos.length > 0) {
        setIsUploadingFiles(true);

        try {
          const uploadPromises = uploadedPhotos.map((photo) => fileService.uploadFile(photo));
          const uploadResults = await Promise.all(uploadPromises);
          imageUrls = uploadResults.map((result) => result.data.url);
        } catch (uploadError) {
          toast('Failed to upload images');
          setIsUploadingFiles(false);
          throw uploadError;
        } finally {
          setIsUploadingFiles(false);
        }
      }

      // Create request payload as JSON
      const requestPayload = {
        ...data,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      // Submit using mutation
      await createQuoteMutation.mutateAsync(requestPayload);

      // Navigate on success
      navigate('/');
    } catch (error) {
      console.error('Failed to submit quote request:', error);
      // Error toast is handled by the mutation
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-white rounded-lg shadow-sm  ">
        {/* Form Content */}
        <div className="  my-8 w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6">
            {/* Basic Project Details Section */}
            <div className="">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Project Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect
                  name="projectType"
                  label="What is the project type?"
                  placeholder="Select project type"
                  options={projectTypeOptions}
                  disabled={isFormDisabled}
                />

                <FormSelect
                  name="installationLocation"
                  label="What is the installation location?"
                  placeholder="Select installation location"
                  options={installationLocationOptions}
                  disabled={isFormDisabled}
                />

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What are the dimensions of the space?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      name="spaceWidth"
                      label=""
                      placeholder="Width (in feet)"
                      type="text"
                      disabled={isFormDisabled}
                    />
                    <FormInput
                      name="spaceHeight"
                      label=""
                      placeholder="Height (in feet)"
                      type="text"
                      disabled={isFormDisabled}
                    />
                  </div>
                </div>

                <div className="md:col-span-1">
                  <FormSelect
                    name="existingDesign"
                    label="Do you have a layout or design already?"
                    placeholder="Select layout or design"
                    options={existingDesignOptions}
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
            </div>

            {/* Cabinet Style & Material Section */}
            <div className="">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Cabinet Style & Material</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect
                  name="cabinetStyle"
                  label="What cabinet style do you prefer?"
                  placeholder="Select cabinet style"
                  options={cabinetStyleOptions}
                  disabled={isFormDisabled}
                />

                <FormSelect
                  name="material"
                  label="What material do you want?"
                  placeholder="Select material"
                  options={materialOptions}
                  disabled={isFormDisabled}
                />

                <div className="md:col-span-2">
                  <FormSelect
                    name="finishColor"
                    label="What finish or color are you looking for?"
                    placeholder="Select finish or color"
                    options={finishColorOptions}
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
            </div>

            {/* Upload Images Section */}
            <div className="">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Pictures</h2>
              <p className="text-sm text-gray-600 mb-4">
                Share photos of your space or design inspiration (optional)
              </p>

              {/* Image Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag & drop images here or{' '}
                  <label className="text-primary cursor-pointer hover:underline">
                    browse
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isFormDisabled}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">
                  Max {MAX_IMAGES} images • JPG, PNG, GIF up to 10MB each
                </p>
              </div>

              {/* Display Uploaded Images */}
              {uploadedPhotos.length > 0 && (
                <div className="mt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {uploadedPhotos.length < MAX_IMAGES && (
                      <label className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                        <Plus className="w-6 h-6 text-gray-400" />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isFormDisabled}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Comments Section */}
            <div className="">
              <FormTextarea
                name="additionalComments"
                label="Additional Comments"
                placeholder="Enter any additional requirements or comments..."
                rows={4}
                disabled={isFormDisabled}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                className="min-w-[150px] border-gray-500 text-gray-600"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isFormDisabled}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isFormDisabled} className="min-w-[150px] text-white">
                {createQuoteMutation.isPending ? 'Submitting...' : 'Submit Quote Request'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
};
