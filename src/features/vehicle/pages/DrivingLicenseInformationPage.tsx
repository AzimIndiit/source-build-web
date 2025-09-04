import { useNavigate, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback } from 'react';
import { AuthWrapper } from '@/features/auth/components/AuthWrapper';
import {
  drivingLicenseSchema,
  type DrivingLicenseFormData,
} from '../schemas/licenseSchemas';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateLicenseMutation } from '../hooks/useLicenseMutations';

// Constants
const MAX_LICENSE_IMAGES = 2; // Front and back of license
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

function DrivingLicenseInformationPage() {
  const navigate = useNavigate();
  const [licenseImages, setLicenseImages] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [licenseImageError, setLicenseImageError] = useState(false);
  
  const createLicenseMutation = useCreateLicenseMutation();

  const methods = useForm<DrivingLicenseFormData>({
    resolver: zodResolver(drivingLicenseSchema),
    defaultValues: {
      licenseNumber: '',
    },
  });

  const { handleSubmit } = methods;

  // Validate file before adding
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: `"${file.name}" is not an image file` };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `Maximum size is 5MB allowed` };
    }

    return { valid: true };
  };

  // Image handlers
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
        if (licenseImages.length >= MAX_LICENSE_IMAGES) {
          toast.error(`Maximum ${MAX_LICENSE_IMAGES} images allowed`);
          return;
        }

        const remainingSlots = MAX_LICENSE_IMAGES - licenseImages.length;
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
            `Only ${remainingSlots} more image(s) can be added (max ${MAX_LICENSE_IMAGES} total)`
          );
        }

        if (validFiles.length > 0) {
          setLicenseImages((prev) => [...prev, ...validFiles]);
          setLicenseImageError(false);
        }

        // Show all errors
        errors.forEach((error) => toast.error(error));
      }
    },
    [licenseImages]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Check total image count
      if (licenseImages.length >= MAX_LICENSE_IMAGES) {
        toast.error(`Maximum ${MAX_LICENSE_IMAGES} images allowed`);
        e.target.value = '';
        return;
      }

      const remainingSlots = MAX_LICENSE_IMAGES - licenseImages.length;
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
          `Only ${remainingSlots} more image(s) can be added (max ${MAX_LICENSE_IMAGES} total)`
        );
      }

      if (validFiles.length > 0) {
        setLicenseImages((prev) => [...prev, ...validFiles]);
        setLicenseImageError(false);
      }

      // Show all errors
      errors.forEach((error) => toast.error(error));

      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setLicenseImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: DrivingLicenseFormData) => {
    // Check if at least one license image is uploaded
    if (licenseImages.length === 0) {
      setLicenseImageError(true);
      toast.error('Please upload at least one driving license image');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Submit license information using the mutation hook
    try {
      const response = await createLicenseMutation.mutateAsync({
        licenseNumber: data.licenseNumber,
        licenseImageFiles: licenseImages,
      });
      
      // Navigate to driver dashboard on success
      if (response?.success) {
        navigate('/driver');
      }
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Failed to submit license information:', error);
    }
  };

  return (
    <AuthWrapper>
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Driving License</h1>
          <p className="text-gray-500 text-sm">
            Upload a valid driving license to verify your eligibility for deliveries.
          </p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              name="licenseNumber"
              label=""
              type="text"
              disabled={createLicenseMutation.isPending}
              placeholder="Enter License number"
              className="text-base px-4 border-gray-300"
            />

            {/* License Images Upload */}
            <div className="space-y-4">
              {licenseImages.length === 0 ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center bg-gray-50 ${
                    dragActive ? 'border-primary bg-blue-50' : 'border-gray-300'
                  } ${licenseImageError ? 'border-red-500' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="license-photo-upload"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="license-photo-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <span className="text-base text-gray-700 font-medium mb-1">
                      Drag & drop images
                    </span>
                    <span className="text-sm text-gray-500">
                      or <span className="text-primary underline">click here</span>
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center bg-gray-50 ${
                      dragActive ? 'border-primary bg-blue-50' : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="license-photo-upload-more"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={licenseImages.length >= MAX_LICENSE_IMAGES}
                    />
                    <label
                      htmlFor="license-photo-upload-more"
                      className={`inline-flex items-center gap-2 ${
                        licenseImages.length >= MAX_LICENSE_IMAGES
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer'
                      }`}
                    >
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {licenseImages.length >= MAX_LICENSE_IMAGES
                          ? 'Maximum images reached'
                          : 'Add more images'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Display uploaded license images */}
                    {licenseImages.map((image, index) => (
                      <div
                        key={`license-${index}`}
                        className="relative group border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`License ${index === 0 ? 'Front' : 'Back'}`}
                          className="w-full h-48 object-contain p-2"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                          <span className="text-white text-sm font-medium">
                            {index === 0 ? 'Front Side' : 'Back Side'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {licenseImages.length === 1 && (
                    <p className="text-sm text-amber-600 text-center">
                      ℹ️ Consider uploading both front and back of your license for faster verification
                    </p>
                  )}
                </div>
              )}
              
              {licenseImageError && (
                <p className="text-sm text-red-600 text-center">
                  Please upload at least one driving license image
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/80 text-white"
                disabled={createLicenseMutation.isPending}
                loading={createLicenseMutation.isPending}
              >
                Continue
              </Button>
            </div>

            <div className="text-center pt-2">
              <span className="text-sm text-gray-500">
                Back to{' '}
                <Link to="/auth/signup" className="text-primary hover:underline">
                  Sign Up
                </Link>
                {' | '}
                <Link to="/auth/login" className="text-primary hover:underline">
                  Login
                </Link>
              </span>
            </div>
          </form>
        </FormProvider>
      </div>
    </AuthWrapper>
  );
}

export default DrivingLicenseInformationPage;