import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback, useEffect } from 'react';

import {
  vehicleInformationSchema,
  type VehicleInformationFormData,
} from '../schemas/vehicleSchemas';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useUpdateVehicleMutation,
  useVehicleQuery,
  VEHICLES_QUERY_KEY,
} from '../hooks/useVehicleMutations';

import { queryClient } from '@/lib/queryClient';

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

function EditVehiclePage() {
  const navigate = useNavigate();
  const { vehicleId } = useParams<{ vehicleId: string }>();

  const [vehicleImages, setVehicleImages] = useState<File[]>([]);
  const [insuranceImages, setInsuranceImages] = useState<File[]>([]);
  const [existingVehicleImages, setExistingVehicleImages] = useState<string[]>([]);
  const [existingInsuranceImages, setExistingInsuranceImages] = useState<string[]>([]);
  const [vehicleDragActive, setVehicleDragActive] = useState(false);
  const [insuranceDragActive, setInsuranceDragActive] = useState(false);
  const [vehicleImageError, setVehicleImageError] = useState(false);
  const [insuranceImageError, setInsuranceImageError] = useState(false);
  console.log('vehicleId', vehicleId);
  const { data: vehicleData, isLoading } = useVehicleQuery(vehicleId || '');
  const updateVehicleMutation = useUpdateVehicleMutation();

  const methods = useForm<VehicleInformationFormData>({
    resolver: zodResolver(vehicleInformationSchema),
    defaultValues: {
      vehicleType: '',
      vehicleRegistrationNumber: '',
      vehicleManufacturer: '',
      vehicleModel: '',
    },
  });

  useEffect(() => {
    if (vehicleData?.data) {
      const vehicle = vehicleData.data;
      methods.reset({
        vehicleType: vehicle.vehicleType || '',
        vehicleRegistrationNumber: vehicle.vehicleRegistrationNumber || '',
        vehicleManufacturer: vehicle.vehicleManufacturer || '',
        vehicleModel: vehicle.vehicleModel || '',
      });

      if (vehicle.vehicleImages && vehicle.vehicleImages.length > 0) {
        setExistingVehicleImages(vehicle.vehicleImages);
      }

      if (vehicle.insuranceImages && vehicle.insuranceImages.length > 0) {
        setExistingInsuranceImages(vehicle.insuranceImages);
      }
    }
  }, [vehicleData, methods]);

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

  const removeExistingVehicleImage = (index: number) => {
    setExistingVehicleImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeInsuranceImage = (index: number) => {
    setInsuranceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingInsuranceImage = (index: number) => {
    setExistingInsuranceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: VehicleInformationFormData) => {
    // Check if at least vehicle images are uploaded (either new or existing)
    if (vehicleImages.length === 0 && existingVehicleImages.length === 0) {
      setVehicleImageError(true);
      toast.error('Please upload at least one vehicle image');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (insuranceImages.length === 0 && existingInsuranceImages.length === 0) {
      setInsuranceImageError(true);
      toast.error('Please upload at least one insurance image');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!vehicleId) {
      toast.error('Vehicle ID not found');
      return;
    }

    // Submit vehicle information using the update mutation hook
    try {
      const response: any = await updateVehicleMutation.mutateAsync({
        id: vehicleId,
        vehicleType: data.vehicleType,
        vehicleManufacturer: data.vehicleManufacturer,
        vehicleModel: data.vehicleModel,
        vehicleRegistrationNumber: data.vehicleRegistrationNumber,
        vehicleImageFiles: vehicleImages,
        insuranceImageFiles: insuranceImages,
        existingVehicleImages: existingVehicleImages,
        existingInsuranceImages: existingInsuranceImages,
      });

      // Navigate to vehicles page on success
      if (response?.status === 'success') {
        queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
        navigate('/driver/vehicles');
      }
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Failed to update vehicle information:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  if (!vehicleData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Vehicle not found</p>
          <Button onClick={() => navigate('/driver/vehicles')} className="mt-4">
            Back to Vehicles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6 ">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Edit Vehicle</h1>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col justify-between  sm:min-h-[calc(100vh-10px)] lg:min-h-[calc(100vh-260px)] "
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ">
            <FormSelect
              name="vehicleType"
              label="Vehicle Type"
              disabled={updateVehicleMutation.isPending || isLoading}
              placeholder="Select Vehicle type"
              className="bg-white"
              options={vehicleTypes}
            />

            <FormInput
              name="vehicleRegistrationNumber"
              label="Vehicle Registration Number"
              type="text"
              className="bg-white"
              disabled={updateVehicleMutation.isPending || isLoading}
              placeholder="Vehicle registration number e.g., KA01AB1234"
            />

            <FormSelect
              className="bg-white"
              name="vehicleManufacturer"
              label="Vehicle Manufacturer"
              disabled={updateVehicleMutation.isPending || isLoading}
              placeholder="Select Manufacturer"
              options={vehicleManufacturers}
            />

            <FormSelect
              className="bg-white"
              name="vehicleModel"
              label="Vehicle Model"
              disabled={updateVehicleMutation.isPending || isLoading || !selectedManufacturer}
              placeholder="Select Model"
              options={modelOptions}
            />

            {/* Vehicle Images Upload */}
            <div className="space-y-4">
              {vehicleImages.length === 0 && existingVehicleImages.length === 0 ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center bg-gray-50 h-50 flex justify-center items-center ${
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
                    className={`border-2 border-dashed rounded-lg p-3 text-center bg-gray-50  h-30 flex flex-col justify-center items-center  ${
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
                    {/* Display existing vehicle images from database */}
                    {existingVehicleImages.map((imageUrl, imgIndex) => (
                      <div
                        key={`existing-vehicle-${imgIndex}`}
                        className="relative group border border-gray-200 rounded-sm shadow-sm"
                      >
                        <img
                          src={imageUrl}
                          alt={`Vehicle ${imgIndex + 1}`}
                          className="w-full sm:h-24 h-20 lg:h-28 object-cover rounded-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingVehicleImage(imgIndex)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {/* Display new vehicle images */}
                    {vehicleImages.map((image, imgIndex) => (
                      <div
                        key={`vehicle-${imgIndex}`}
                        className="relative group border border-gray-200 rounded-sm shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Vehicle ${imgIndex + 1}`}
                          className="w-full sm:h-24 h-20 lg:h-28 object-cover rounded-sm"
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
              {vehicleImageError && (
                <p className="text-sm text-red-600 text-left">
                  Please upload at least one vehicle image
                </p>
              )}
            </div>

            {/* Insurance Images Upload */}
            <div className="space-y-2">
              {insuranceImages.length === 0 && existingInsuranceImages.length === 0 ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center bg-gray-50 h-50 flex justify-center items-center ${
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
                    className={`border-2 border-dashed rounded-lg p-3 text-center bg-gray-50  h-30 flex flex-col justify-center items-center  ${
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
                    {/* Display existing insurance images from database */}
                    {existingInsuranceImages.map((imageUrl, imgIndex) => (
                      <div
                        key={`existing-insurance-${imgIndex}`}
                        className="relative group border border-gray-200 rounded-sm shadow-sm"
                      >
                        <img
                          src={imageUrl}
                          alt={`Insurance ${imgIndex + 1}`}
                          className="w-full sm:h-24  h-20 lg:h-28 object-cover rounded-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingInsuranceImage(imgIndex)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {/* Display new insurance images */}
                    {insuranceImages.map((image, imgIndex) => (
                      <div
                        key={`insurance-${imgIndex}`}
                        className="relative group border border-gray-200 rounded-sm shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Insurance ${imgIndex + 1}`}
                          className="w-full sm:h-24  h-20 lg:h-28 object-cover rounded-sm"
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
                <p className="text-sm text-red-600 text-left">
                  Please upload at least one insurance image
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-6 ">
            <Button
              type="submit"
              className="w-full sm:w-[224px] bg-primary hover:bg-primary/80 text-white"
              disabled={updateVehicleMutation.isPending || isLoading}
              loading={updateVehicleMutation.isPending}
            >
              Update
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

export default EditVehiclePage;
