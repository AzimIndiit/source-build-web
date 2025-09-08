import { useNavigate, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback } from 'react';
import { AuthWrapper } from '@/features/auth/components/AuthWrapper';
import {
  vehicleInformationSchema,
  type VehicleInformationFormData,
} from '../schemas/vehicleSchemas';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateVehicleMutation } from '../hooks/useVehicleMutations';

// Constants
const MAX_VEHICLE_IMAGES = 5;
const MAX_INSURANCE_IMAGES = 2;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const vehicleTypes = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'other', label: 'Other' },
];

const vehicleManufacturers = [
  { value: 'toyota', label: 'Toyota' },
  { value: 'honda', label: 'Honda' },
  { value: 'ford', label: 'Ford' },
  { value: 'chevrolet', label: 'Chevrolet' },
  { value: 'nissan', label: 'Nissan' },
  { value: 'hyundai', label: 'Hyundai' },
  { value: 'kia', label: 'Kia' },
  { value: 'mazda', label: 'Mazda' },
  { value: 'volkswagen', label: 'Volkswagen' },
  { value: 'mercedes', label: 'Mercedes-Benz' },
  { value: 'bmw', label: 'BMW' },
  { value: 'audi', label: 'Audi' },
  { value: 'tesla', label: 'Tesla' },
  { value: 'other', label: 'Other' },
];

const vehicleModels: Record<string, Array<{ value: string; label: string }>> = {
  toyota: [
    { value: 'camry', label: 'Camry' },
    { value: 'corolla', label: 'Corolla' },
    { value: 'rav4', label: 'RAV4' },
    { value: 'highlander', label: 'Highlander' },
    { value: 'tacoma', label: 'Tacoma' },
    { value: 'sienna', label: 'Sienna' },
  ],
  honda: [
    { value: 'accord', label: 'Accord' },
    { value: 'civic', label: 'Civic' },
    { value: 'crv', label: 'CR-V' },
    { value: 'pilot', label: 'Pilot' },
    { value: 'odyssey', label: 'Odyssey' },
  ],
  ford: [
    { value: 'f150', label: 'F-150' },
    { value: 'f250', label: 'F-250' },
    { value: 'explorer', label: 'Explorer' },
    { value: 'escape', label: 'Escape' },
    { value: 'transit', label: 'Transit' },
  ],
  chevrolet: [
    { value: 'silverado', label: 'Silverado' },
    { value: 'tahoe', label: 'Tahoe' },
    { value: 'suburban', label: 'Suburban' },
    { value: 'express', label: 'Express' },
  ],
  other: [{ value: 'other', label: 'Other' }],
};

function VehicleInformationPage() {
  const navigate = useNavigate();
  const [vehicleImages, setVehicleImages] = useState<File[]>([]);
  const [insuranceImages, setInsuranceImages] = useState<File[]>([]);
  const [vehicleDragActive, setVehicleDragActive] = useState(false);
  const [insuranceDragActive, setInsuranceDragActive] = useState(false);
  const [vehicleImageError, setVehicleImageError] = useState(false);
  const [insuranceImageError, setInsuranceImageError] = useState(false);
  const createVehicleMutation = useCreateVehicleMutation();

  const methods = useForm<VehicleInformationFormData>({
    resolver: zodResolver(vehicleInformationSchema),
    defaultValues: {
      vehicleType: '',
      vehicleRegistrationNumber: '',
      vehicleManufacturer: '',
      vehicleModel: '',
    },
  });

  const { handleSubmit, watch } = methods;

  const selectedManufacturer = watch('vehicleManufacturer');
  const modelOptions = selectedManufacturer
    ? vehicleModels[selectedManufacturer] || vehicleModels.other
    : [];

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

  // Vehicle image handlers
  const handleVehicleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setVehicleDragActive(true);
    } else if (e.type === 'dragleave') {
      setVehicleDragActive(false);
    }
  }, []);

  const handleVehicleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setVehicleDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files);

        // Check total image count
        if (vehicleImages.length >= MAX_VEHICLE_IMAGES) {
          toast.error(`Maximum ${MAX_VEHICLE_IMAGES} images allowed`);
          return;
        }

        const remainingSlots = MAX_VEHICLE_IMAGES - vehicleImages.length;
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
            `Only ${remainingSlots} more image(s) can be added (max ${MAX_VEHICLE_IMAGES} total)`
          );
        }

        if (validFiles.length > 0) {
          setVehicleImages((prev) => [...prev, ...validFiles]);
          setVehicleImageError(false);
        }

        // Show all errors
        errors.forEach((error) => toast.error(error));
      }
    },
    [vehicleImages]
  );

  const handleVehicleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Check total image count
      if (vehicleImages.length >= MAX_VEHICLE_IMAGES) {
        toast.error(`Maximum ${MAX_VEHICLE_IMAGES} images allowed`);
        e.target.value = '';
        return;
      }

      const remainingSlots = MAX_VEHICLE_IMAGES - vehicleImages.length;
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
          `Only ${remainingSlots} more image(s) can be added (max ${MAX_VEHICLE_IMAGES} total)`
        );
      }

      if (validFiles.length > 0) {
        setVehicleImages((prev) => [...prev, ...validFiles]);
        setVehicleImageError(false);
      }

      // Show all errors
      errors.forEach((error) => toast.error(error));

      // Reset input
      e.target.value = '';
    }
  };

  // Insurance image handlers
  const handleInsuranceDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setInsuranceDragActive(true);
    } else if (e.type === 'dragleave') {
      setInsuranceDragActive(false);
    }
  }, []);

  const handleInsuranceDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setInsuranceDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files);

        // Check total image count
        if (insuranceImages.length >= MAX_INSURANCE_IMAGES) {
          toast.error(`Maximum ${MAX_INSURANCE_IMAGES} images allowed`);
          return;
        }

        const remainingSlots = MAX_INSURANCE_IMAGES - insuranceImages.length;
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
            `Only ${remainingSlots} more image(s) can be added (max ${MAX_INSURANCE_IMAGES} total)`
          );
        }

        if (validFiles.length > 0) {
          setInsuranceImages((prev) => [...prev, ...validFiles]);
          setInsuranceImageError(false);
        }

        // Show all errors
        errors.forEach((error) => toast.error(error));
      }
    },
    [insuranceImages]
  );

  const handleInsuranceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Check total image count
      if (insuranceImages.length >= MAX_INSURANCE_IMAGES) {
        toast.error(`Maximum ${MAX_INSURANCE_IMAGES} images allowed`);
        e.target.value = '';
        return;
      }

      const remainingSlots = MAX_INSURANCE_IMAGES - insuranceImages.length;
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
          `Only ${remainingSlots} more image(s) can be added (max ${MAX_INSURANCE_IMAGES} total)`
        );
      }

      if (validFiles.length > 0) {
        setInsuranceImages((prev) => [...prev, ...validFiles]);
        setInsuranceImageError(false);
      }

      // Show all errors
      errors.forEach((error) => toast.error(error));

      // Reset input
      e.target.value = '';
    }
  };

  const removeVehicleImage = (index: number) => {
    setVehicleImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeInsuranceImage = (index: number) => {
    setInsuranceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: VehicleInformationFormData) => {
    // Check if at least vehicle images are uploaded
      if (vehicleImages.length === 0) {
        setVehicleImageError(true);
        toast.error('Please upload at least one vehicle image');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (insuranceImages.length === 0) {
        setInsuranceImageError(true);
        toast.error('Please upload at least one insurance image');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

    // Submit vehicle information using the mutation hook
    try {
      const response: any = await createVehicleMutation.mutateAsync({
        vehicleType: data.vehicleType,
        vehicleManufacturer: data.vehicleManufacturer,
        vehicleModel: data.vehicleModel,
        vehicleRegistrationNumber: data.vehicleRegistrationNumber,
        vehicleImageFiles: vehicleImages,
        insuranceImageFiles: insuranceImages,
      });

      // Navigate to driving license page on success
      if (response?.status === 'success') {
        console.log('navigating to driver license', response?.status);
        navigate('/auth/driver-license');
      }
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Failed to submit vehicle information:', error);
    }
  };

  return (
    <AuthWrapper>
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Vehicle Information</h1>
          <p className="text-gray-500 text-sm">
            Provide your vehicle details to ensure smooth delivery assignments and route
            optimization.
          </p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormSelect
              name="vehicleType"
              label=""
              disabled={createVehicleMutation.isPending}
              placeholder="Select Vehicle type"
              options={vehicleTypes}
            />

            <FormInput
              name="vehicleRegistrationNumber"
              label=""
              type="text"
              disabled={createVehicleMutation.isPending}
              placeholder="Vehicle registration number e.g., KA01AB1234"
            />

            <FormSelect
              name="vehicleManufacturer"
              label=""
              disabled={createVehicleMutation.isPending}
              placeholder="Select Manufacturer"
              options={vehicleManufacturers}
            />

            <FormSelect
              name="vehicleModel"
              label=""
              disabled={createVehicleMutation.isPending || !selectedManufacturer}
              placeholder="Select Model"
              options={modelOptions}
            />

            {/* Vehicle Images Upload */}
            <div className="space-y-4">
              {vehicleImages.length === 0 ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center bg-gray-50 ${
                    vehicleDragActive ? 'border-primary bg-blue-50' : 'border-gray-300'
                  } ${vehicleImageError ? 'border-red-500' : ''}`}
                  onDragEnter={handleVehicleDrag}
                  onDragLeave={handleVehicleDrag}
                  onDragOver={handleVehicleDrag}
                  onDrop={handleVehicleDrop}
                >
                  <input
                    type="file"
                    id="vehicle-photo-upload"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleVehicleFileChange}
                  />
                  <label
                    htmlFor="vehicle-photo-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-600">
                      Drag & drop media or{' '}
                      <span className="text-primary underline">click here</span>
                    </span>
                    <span className="text-xs text-red-600">Max file size is 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className={`border-2 border-dashed rounded-lg p-3 text-center bg-gray-50 ${
                      vehicleDragActive ? 'border-primary bg-blue-50' : 'border-gray-300'
                    } ${vehicleImageError ? 'border-red-500' : ''}`}
                    onDragEnter={handleVehicleDrag}
                    onDragLeave={handleVehicleDrag}
                    onDragOver={handleVehicleDrag}
                    onDrop={handleVehicleDrop}
                  >
                    <input
                      type="file"
                      id="vehicle-photo-upload-more"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleVehicleFileChange}
                    />
                    <label
                      htmlFor="vehicle-photo-upload-more"
                      className="cursor-pointer inline-flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        Drag & drop media or{' '}
                        <span className="text-primary underline">click here</span>
                      </span>
                    </label>
                    <div className="text-xs text-red-600">Max file size is 5MB</div>
                  </div>

                  <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
                    {/* Display existing vehicle images */}
                    {vehicleImages.map((image, imgIndex) => (
                      <div
                        key={`vehicle-${imgIndex}`}
                        className="relative group border border-gray-200 rounded-sm shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Vehicle ${imgIndex + 1}`}
                          className="w-full sm:h-24 md:h-28 h-20 lg:h-16 object-cover rounded-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeVehicleImage(imgIndex)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {vehicleImageError && (
                <p className="text-sm text-red-600 text-center">
                  Please upload at least one vehicle image
                </p>
              )}
            {/* Insurance Images Upload */}
            <div className="space-y-2">
              {insuranceImages.length === 0 ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center bg-gray-50 ${
                    insuranceDragActive ? 'border-primary bg-blue-50' : 'border-gray-300' 
                  } ${insuranceImageError ? 'border-red-500' : ''}`}
                  onDragEnter={handleInsuranceDrag}
                  onDragLeave={handleInsuranceDrag}
                  onDragOver={handleInsuranceDrag}
                  onDrop={handleInsuranceDrop}
                >
                  <input
                    type="file"
                    id="insurance-photo-upload"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleInsuranceFileChange}
                  />
                  <label
                    htmlFor="insurance-photo-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-600">
                      Drag & drop insurance documents or{' '}
                      <span className="text-primary underline">click here</span>
                    </span>
                    <span className="text-xs text-red-600">Max file size is 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className={`border-2 border-dashed rounded-lg p-3 text-center bg-gray-50 ${
                      insuranceDragActive ? 'border-primary bg-blue-50' : 'border-gray-300'
                    } ${insuranceImageError ? 'border-red-500' : ''}`}
                    onDragEnter={handleInsuranceDrag}
                    onDragLeave={handleInsuranceDrag}
                    onDragOver={handleInsuranceDrag}
                    onDrop={handleInsuranceDrop}
                  >
                    <input
                      type="file"
                      id="insurance-photo-upload-more"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleInsuranceFileChange}
                    />
                    <label
                      htmlFor="insurance-photo-upload-more"
                      className="cursor-pointer inline-flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        Add more insurance documents{' '}
                        <span className="text-primary underline">click here</span>
                      </span>
                    </label>
                    <div className="text-xs text-red-600">Max file size is 5MB</div>
                  </div>

                  <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
                    {/* Display existing insurance images */}
                    {insuranceImages.map((image, imgIndex) => (
                      <div
                        key={`insurance-${imgIndex}`}
                        className="relative group border border-gray-200 rounded-sm shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Insurance ${imgIndex + 1}`}
                          className="w-full sm:h-24 md:h-28 h-20 lg:h-16 object-cover rounded-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeInsuranceImage(imgIndex)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {insuranceImageError && (
                <p className="text-sm text-red-600 text-center">
                  Please upload at least one insurance image
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1  bg-primary hover:bg-primary/80 text-white"
                disabled={createVehicleMutation.isPending}
                loading={createVehicleMutation.isPending}
              >
                Continue
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link to="/auth/signup" className="text-sm text-gray-500 hover:text-gray-700">
                Back to <span className="text-primary">Sign Up</span> |{' '}
                <span className="text-primary">Login</span>
              </Link>
            </div>
          </form>
        </FormProvider>
      </div>
    </AuthWrapper>
  );
}

export default VehicleInformationPage;
