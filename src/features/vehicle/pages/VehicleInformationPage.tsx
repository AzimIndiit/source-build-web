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
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Constants
const MAX_VEHICLE_IMAGES = 4;
const MAX_INSURANCE_IMAGES = 4;
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
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleInformationFormData[]>([]);

  const methods = useForm<VehicleInformationFormData>({
    resolver: zodResolver(vehicleInformationSchema),
    defaultValues: {
      vehicleType: '',
      vehicleRegistrationNumber: '',
      vehicleManufacturer: '',
      vehicleModel: '',
    },
  });

  const { handleSubmit, watch, reset } = methods;

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
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return { valid: false, error: `Selected image is ${sizeMB}MB. Maximum size is 5MB allowed` };
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

  const onAddMoreVehicle = (data: VehicleInformationFormData) => {
    // Check if at least vehicle images are uploaded
    if (vehicleImages.length === 0) {
      setVehicleImageError(true);
      toast.error('Please upload at least one vehicle image');
      return;
    }

    const vehicleData = {
      ...data,
      vehicleImages: [...vehicleImages],
      insuranceImages: [...insuranceImages],
    };
    setVehicles([...vehicles, vehicleData]);
    reset();
    setVehicleImages([]);
    setInsuranceImages([]);
    setVehicleImageError(false);
    setInsuranceImageError(false);
    toast.success('Vehicle added successfully');
  };

  const onSubmit = async (data: VehicleInformationFormData) => {
    // Check if at least vehicle images are uploaded for current vehicle
    if (vehicleImages.length === 0 && vehicles.length === 0) {
      setVehicleImageError(true);
      toast.error('Please upload at least one vehicle image');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);

    // Prepare all vehicles including current one if has images
    let allVehicles = [...vehicles];
    if (vehicleImages.length > 0) {
      allVehicles.push({
        ...data,
        vehicleImages: [...vehicleImages],
        insuranceImages: [...insuranceImages],
      });
    }

    // Check if we have at least one vehicle
    if (allVehicles.length === 0) {
      toast.error('Please add at least one vehicle');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Submitting vehicle information:', allVehicles);
      toast.success('Vehicle information submitted successfully');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error submitting vehicle information:', error);
      toast.error('Failed to submit vehicle information');
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
              placeholder="Select Vehicle type"
              options={vehicleTypes}
            />

            <FormInput
              name="vehicleRegistrationNumber"
              label=""
              type="text"
              disabled={isLoading}
              placeholder="Vehicle registration number"
            />

            <FormSelect
              name="vehicleManufacturer"
              label=""
              disabled={isLoading}
              placeholder="Select Manufacturer"
              options={vehicleManufacturers}
            />

            <FormSelect
              name="vehicleModel"
              label=""
              disabled={isLoading || !selectedManufacturer}
              placeholder="Select Model"
              options={modelOptions}
            />

            {/* Vehicle Images Upload */}
            <div className="space-y-4">
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 transition-all',
                  vehicleDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : vehicleImageError
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400',
                  'cursor-pointer'
                )}
                onDragEnter={handleVehicleDrag}
                onDragLeave={handleVehicleDrag}
                onDragOver={handleVehicleDrag}
                onDrop={handleVehicleDrop}
              >
                <input
                  type="file"
                  id="vehicle-images"
                  multiple
                  accept="image/*"
                  onChange={handleVehicleFileChange}
                  className="hidden"
                  disabled={isLoading || vehicleImages.length >= MAX_VEHICLE_IMAGES}
                />
                <label
                  htmlFor="vehicle-images"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">Drag & drop Vehicle images</p>
                  <p className="text-xs text-gray-500 mt-1">
                    or <span className="text-blue-500">click here</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Max {MAX_VEHICLE_IMAGES} images, 5MB each
                  </p>
                </label>
              </div>

              {vehicleImageError && (
                <p className="text-red-500 text-sm">Please upload at least one vehicle image</p>
              )}

              {vehicleImages.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Vehicle Images ({vehicleImages.length}/{MAX_VEHICLE_IMAGES})
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {vehicleImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Vehicle ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeVehicleImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insurance Images Upload */}
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 transition-all',
                  insuranceDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : insuranceImageError
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400',
                  'cursor-pointer'
                )}
                onDragEnter={handleInsuranceDrag}
                onDragLeave={handleInsuranceDrag}
                onDragOver={handleInsuranceDrag}
                onDrop={handleInsuranceDrop}
              >
                <input
                  type="file"
                  id="insurance-images"
                  multiple
                  accept="image/*"
                  onChange={handleInsuranceFileChange}
                  className="hidden"
                  disabled={isLoading || insuranceImages.length >= MAX_INSURANCE_IMAGES}
                />
                <label
                  htmlFor="insurance-images"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">Drag & drop Insurance images</p>
                  <p className="text-xs text-gray-500 mt-1">
                    or <span className="text-blue-500">click here</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Max {MAX_INSURANCE_IMAGES} images, 5MB each (Optional)
                  </p>
                </label>
              </div>

              {insuranceImageError && (
                <p className="text-red-500 text-sm">Insurance images are optional</p>
              )}

              {insuranceImages.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Insurance Images ({insuranceImages.length}/{MAX_INSURANCE_IMAGES})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {insuranceImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Insurance ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeInsuranceImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {vehicles.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  {vehicles.length} vehicle{vehicles.length > 1 ? 's' : ''} added
                </p>
                <div className="space-y-1">
                  {vehicles.map((vehicle, index) => (
                    <div key={index} className="text-xs text-blue-700">
                      • {vehicle.vehicleManufacturer} {vehicle.vehicleModel} -{' '}
                      {vehicle.vehicleRegistrationNumber}
                      <span className="text-gray-500 ml-2">
                        ({vehicle.vehicleImages?.length || 0} vehicle images,{' '}
                        {vehicle.insuranceImages?.length || 0} insurance images)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 text-blue-600 border-blue-600 hover:bg-blue-50"
                onClick={handleSubmit(onAddMoreVehicle)}
                disabled={isLoading}
              >
                + Add More Vehicle
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
                loading={isLoading}
              >
                Continue
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link to="/auth/signup" className="text-sm text-gray-500 hover:text-gray-700">
                Back to <span className="text-blue-600">Sign Up</span> |{' '}
                <span className="text-blue-600">Login</span>
              </Link>
            </div>
          </form>
        </FormProvider>
      </div>
    </AuthWrapper>
  );
}

export default VehicleInformationPage;
