import React, { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CreateSavedAddressPayload, AddressType } from '../services/addressService';
import toast from 'react-hot-toast';
import { FormPhoneInput } from '@/components/forms/FormPhoneInput';
import { phoneValidation } from '@/features/auth/schemas/authSchemas';

// Schema for creating new saved address
const createSavedAddressSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  phoneNumber: phoneValidation,

  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters'),
  state: z
    .string()
    .trim()
    .min(1, 'State is required')
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must not exceed 100 characters'),
  country: z
    .string()
    .trim()
    .min(1, 'Country is required')
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must not exceed 100 characters'),
  zipCode: z
    .string()
    .trim()
    .min(1, 'ZIP code is required')
    .regex(/^[A-Za-z0-9\s-]+$/, 'Invalid ZIP code format')
    .min(3, 'ZIP code must be at least 3 characters')
    .max(20, 'ZIP code must not exceed 20 characters'),
  isDefault: z.boolean(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),

  formattedAddress: z.string().optional().nullable(),
  location: z.string().min(1, 'Location is required').max(100, 'Location must not exceed 100 characters'),
});

// Schema for updating saved address (same as create for now)
const updateSavedAddressSchema = createSavedAddressSchema;

type SavedAddressFormData = z.infer<typeof createSavedAddressSchema>;

interface AddSavedAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSavedAddressPayload) => Promise<void>;
  initialData?: Partial<CreateSavedAddressPayload>;
  isEdit?: boolean;
  totalAddress?: boolean;
  isSubmitting?:boolean;
}

// Google Places Autocomplete types
declare global {
  interface Window {
    google: any;
    initGooglePlaces?: () => void;
  }
}

export const AddSavedAddressModal: React.FC<AddSavedAddressModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  totalAddress=false,
  isSubmitting=false
}) => {
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [, setIsGoogleLoaded] = useState(false);

  const methods = useForm<SavedAddressFormData>({
    resolver: zodResolver(isEdit ? updateSavedAddressSchema : createSavedAddressSchema),
    defaultValues: initialData 
      ? {
          name: initialData.name || '',
          phoneNumber: initialData.phoneNumber || '',
          location: initialData.location || '',
          city: initialData.city || '',
          state: initialData.state || '',
          country: initialData.country || '',
          zipCode: initialData.zipCode || '',
          isDefault: initialData.isDefault || false,
          formattedAddress: initialData.formattedAddress || '',
        }
      : {
          name: '',
          phoneNumber: '',
          location: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          isDefault: !totalAddress, // Only set to true if there are no existing addresses
          formattedAddress: '',
        },
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = methods;
  // Reset form when initialData changes (for edit mode) or modal closes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
      
        // Ensure isDefault is explicitly set from initialData when editing
        reset({
          name: initialData.name || '',
          phoneNumber: initialData.phoneNumber || '',
          location: initialData.location || '',
          city: initialData.city || '',
          state: initialData.state || '',
          country: initialData.country || '',
          zipCode: initialData.zipCode || '',
          isDefault: initialData.isDefault ?? false,  // Use nullish coalescing to preserve false values
          formattedAddress: initialData.formattedAddress || '',
          latitude: initialData.latitude || undefined,
          longitude: initialData.longitude || undefined,
        });
      }
    } else {
      // Reset form when modal is closed
      reset({
        name: '',
        phoneNumber: '',
        location: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        isDefault: !totalAddress, // Only set to true if there are no existing addresses

        formattedAddress: '',
      });
    }
  }, [initialData, isOpen, reset, totalAddress]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!isOpen || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) return;

    const loadGooglePlaces = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleLoaded(true);
        initializeAutocomplete();
      } else {
        // Load Google Places API script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGooglePlaces`;
        script.async = true;
        script.defer = true;
        window.initGooglePlaces = () => {
          setIsGoogleLoaded(true);
          initializeAutocomplete();
        };
        document.head.appendChild(script);
      }
    };

    const initializeAutocomplete = () => {
      if (!locationInputRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        {
          types: ['address'],
          fields: ['address_components', 'geometry', 'place_id', 'formatted_address'],
        }
      );

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    };

    const timer = setTimeout(loadGooglePlaces, 100);
    return () => {
      clearTimeout(timer);
      // Clean up autocomplete listener
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isOpen]);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();

    if (!place || !place.address_components) {
      toast.error('Please select a valid address from the dropdown');
      return;
    }

    const addressComponents = place.address_components;
  
    // Extract address components
    addressComponents.forEach((component: any) => {
      const types = component.types;

      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        route = component.long_name;
      }
      if (types.includes('locality')) {
        setValue('city', component.long_name);
      }
      if (types.includes('administrative_area_level_1')) {
        setValue('state', component.long_name);
      }
      if (types.includes('country')) {
        setValue('country', component.long_name);
      }
      if (types.includes('postal_code')) {
        setValue('zipCode', component.long_name);
      }
    });

    // Set place details
    setValue('formattedAddress', place.formatted_address || '');

    // // Get coordinates
    // if (place.geometry && place.geometry.location) {
    //   setValue('latitude', place.geometry.location.lat());
    //   setValue('longitude', place.geometry.location.lng());
    // }
  };

  const handleFormSubmit = async (data: SavedAddressFormData) => {
    // Build formatted address from individual fields if not already set
    const formattedAddress = data.formattedAddress || 
      [data.location, data.city, data.state, data.country, data.zipCode]
        .filter(Boolean)
        .join(', ');

    const submitData: CreateSavedAddressPayload = {
      name: data.name,
      phoneNumber: data.phoneNumber,
      city: data.city,
      state: data.state,
      country: data.country,
      location: data.location,
      zipCode: data.zipCode,
      isDefault: data.isDefault,
      type: AddressType.BOTH,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
      formattedAddress: formattedAddress,
    };

    await onSubmit(submitData);
    // The parent component will handle closing the modal on success
  };

  const handleClose = () => {
    // Only reset form when modal is being closed (not during submission)
    if (!isSubmitting) {
      reset();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[600px] md:max-w-[700px] p-0 bg-white max-h-[90vh] overflow-y-auto z-51 ">
        <DialogHeader className="px-4 pt-4 sm:px-6 pb-0 mb-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {isEdit ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="p-4 sm:p-6 space-y-4 sm:space-y-5"
          >
            <div className="space-y-4">
              {/* Name and Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormInput
                    label="Name"
                    name="name"
                    placeholder="Judy Nguyen"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <FormPhoneInput
                    label="Phone"
                    name="phoneNumber"
                    placeholder="(905) 878-2725"
                    type="tel"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Location with Google Places */}
              <div>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      label="Location"
                      name="location"
                      inputRef={(e:any) => {
                        field.ref(e);
                        locationInputRef.current = e;
                      }}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      type="text"
                      placeholder="181 Mercer Street, New York, NY 10012, United States"
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormInput
                    label="City"
                    name="city"
                    placeholder="Los Angeles, California"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <FormInput label="State" name="state" placeholder="Alaska" className="w-full" disabled={isSubmitting} />
                </div>
              </div>

              {/* Country and ZIP Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormInput label="Country" name="country" placeholder="USA" className="w-full" disabled={isSubmitting} />
                </div>
                <div>
                  <FormInput
                    label="ZIP Code"
                    name="zipCode"
                    placeholder="90001"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
             {totalAddress &&  <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="isDefault"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-gray-300"
                      disabled={isSubmitting}
                      />
                    <Label
                      htmlFor="isDefault"
                      className="text-sm font-normal text-gray-600 cursor-pointer"
                    >
                      Save as default
                    </Label>
                  </div>
                )}
              />}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-full sm:w-[200px] md:w-[224px] border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-[200px] md:w-[224px] bg-primary text-white hover:bg-primary/90 text-sm sm:text-base"
              >
                {isSubmitting ? 'Saving...' : isEdit ? 'Update Address' : 'Add Address'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
