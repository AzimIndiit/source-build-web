import React, { useState, useRef, useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { getInitials } from '@/lib/helpers';
import { FormInput } from '@/components/forms/FormInput';
import { FormPhoneInput } from '@/components/forms/FormPhoneInput';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { ChangePasswordModal } from './ChangePasswordModal';
import { PersonalDetailsFormSkeleton } from './PersonalDetailsFormSkeleton';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfileMutation } from '../hooks/useProfileMutations';
import { useUserQuery } from '@/features/auth/hooks/useUserQuery';
import { formatPhoneNumber } from '@/lib/utils';

// Extended User interface to include seller fields
interface ExtendedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'driver' | 'seller' | 'admin' | 'buyer';
  avatar?: string;
  company?: string;
  region?: string;
  address?: string;
  description?: string;
  businessName?: string;
  businessAddress?: string;
  phone?: string;
  cellPhone?: string;
  einNumber?: string;
  salesTaxId?: string;
  localDelivery?: string | boolean;
  profile?: {
    isVehicles?: boolean;
    isLicense?: boolean;
  };
}

// Base schema for common fields
const basePersonalDetailsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email')
    .max(100, 'Email must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  region: z
    .string()
    .trim()
    .max(50, 'Region must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .trim()
    .max(200, 'Address must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  avatar: z.string().optional(),
  // Seller-specific fields (optional for non-sellers)
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  phone: z.string().optional(),
  cellPhone: z.string().optional(),
  einNumber: z.string().optional(),
  salesTaxId: z.string().optional(),
  localDelivery: z.string().optional(),
});

// Create a function that returns the appropriate schema based on role
const getPersonalDetailsSchema = (role?: string) => {
  if (role === 'seller') {
    return basePersonalDetailsSchema.superRefine((data, ctx) => {
      // Validate business name
      if (!data.businessName || data.businessName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business name must be at least 2 characters',
          path: ['businessName'],
        });
      }

      // Validate business address
      if (!data.businessAddress || data.businessAddress.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business address must be at least 2 characters',
          path: ['businessAddress'],
        });
      }

      // Validate business phone
      if (!data.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business phone is required',
          path: ['phone'],
        });
      } else {
        const cleanedPhone = data.phone.replace(/\D/g, '');
        if (cleanedPhone.length !== 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Phone number must be exactly 10 digits',
            path: ['phone'],
          });
        } else if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(cleanedPhone)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid phone number. Area code cannot start with 0 or 1',
            path: ['phone'],
          });
        }
      }

      // Validate cell phone (required for sellers)
      if (!data.cellPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cell phone is required',
          path: ['cellPhone'],
        });
      } else {
        const cleanedCellPhone = data.cellPhone.replace(/\D/g, '');
        if (cleanedCellPhone.length !== 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Cell phone must be exactly 10 digits',
            path: ['cellPhone'],
          });
        } else if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(cleanedCellPhone)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid cell phone. Area code cannot start with 0 or 1',
            path: ['cellPhone'],
          });
        }
      }

      // Validate EIN number
      if (!data.einNumber || data.einNumber.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'EIN number is required',
          path: ['einNumber'],
        });
      }

      // Validate Sales Tax ID only if localDelivery is false
      if (data.localDelivery === 'no' && (!data.salesTaxId || data.salesTaxId.length < 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sales Tax ID is required',
          path: ['salesTaxId'],
        });
      }
    });
  }

  return basePersonalDetailsSchema;
};

type PersonalDetailsFormData = z.infer<typeof basePersonalDetailsSchema>;

interface PersonalDetailsFormProps {
  initialData?: Partial<PersonalDetailsFormData>;
  onSave?: (data: PersonalDetailsFormData) => void;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({ onSave }) => {
  const { user, isLoading } = useAuth();
  const { data: queryUser, isLoading: isLoadingUser } = useUserQuery();

  const updateProfileMutation = useUpdateProfileMutation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localDelivery, setLocalDelivery] = useState<string>('no');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userData = queryUser || user;
  const extendedUserData = userData as ExtendedUser | null;
  const userRole = extendedUserData?.role;

  const methods = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(getPersonalDetailsSchema(userRole)),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      region: '',
      address: '',
      description: '',
      avatar: '',
      businessName: '',
      businessAddress: '',
      phone: '',
      cellPhone: '',
      einNumber: '',
      salesTaxId: '',
      localDelivery: 'no',
    },
  });
  console.log('methods.', methods.formState.errors);

  // Update form only on initial load or when user data significantly changes
  // Track if form has been initialized to prevent unnecessary resets
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  useEffect(() => {
    const userData = queryUser || user;

    // Only reset form if:
    // 1. Form hasn't been initialized yet
    // 2. User ID has changed (switching accounts)
    // 3. We're not in the middle of submitting
    if (
      userData &&
      (!isFormInitialized || userData.id !== extendedUserData?.id) &&
      !methods.formState.isSubmitting
    ) {
      const extendedUser = userData as ExtendedUser;
      methods.reset({
        firstName: extendedUser.firstName || '',
        lastName: extendedUser.lastName || '',
        email: extendedUser.email || '',
        region: extendedUser.region || '',
        address: extendedUser.address || '',
        description: extendedUser.description || '',
        avatar: extendedUser.avatar || '',
        businessName: extendedUser.businessName || '',
        businessAddress: extendedUser.businessAddress || '',
        phone: formatPhoneNumber(extendedUser.phone || '') || '',
        cellPhone: formatPhoneNumber(extendedUser.cellPhone || '') || '',
        einNumber: extendedUser.einNumber || '',
        salesTaxId: extendedUser.salesTaxId || '',
        localDelivery: extendedUser.localDelivery === true ? 'yes' : 'no',
      });
      setLocalDelivery(extendedUser.localDelivery === true ? 'yes' : 'no');
      setIsFormInitialized(true);
    }
  }, [queryUser?.id, user?.id, isFormInitialized, methods, extendedUserData?.id]);

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = methods;

  const formValues = watch();
  console.log('formValues', formValues, 'userData', userData);
  const fullName = `${formValues.firstName || ''} ${formValues.lastName || ''}`.trim();

  const onSubmit = async (data: PersonalDetailsFormData) => {
    try {
      // Trim all string values before saving
      const trimmedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          typeof value === 'string' ? value.trim() : value,
        ])
      ) as PersonalDetailsFormData;

      // Prepare the update payload
      const updatePayload: any = {
        firstName: trimmedData.firstName,
        lastName: trimmedData.lastName,
        region: trimmedData.region,
        address: trimmedData.address,
        description: trimmedData.description,
      };

      // Add seller-specific fields if user is a seller
      if (userRole === 'seller') {
        updatePayload.businessName = trimmedData.businessName;
        updatePayload.businessAddress = trimmedData.businessAddress;
        updatePayload.phone = trimmedData.phone?.replace(/\D/g, '');
        updatePayload.cellPhone = trimmedData.cellPhone?.replace(/\D/g, '');
        updatePayload.einNumber = trimmedData.einNumber;
        updatePayload.salesTaxId = trimmedData.salesTaxId;
        updatePayload.localDelivery = localDelivery === 'yes';
      }

      // If there's a selected file, include it
      if (selectedFile) {
        updatePayload.avatarFile = selectedFile;
      } else if (trimmedData.avatar && !trimmedData.avatar.startsWith('data:')) {
        // Keep existing avatar URL if no new file selected
        updatePayload.avatar = trimmedData.avatar;
      }

      // Call the mutation
      await updateProfileMutation.mutateAsync(updatePayload);

      // Clear selected file after successful update
      setSelectedFile(null);
      setPreviewUrl(null);

      // Call optional onSave callback
      onSave?.(trimmedData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordChange = async (passwordData: any) => {
    // The ChangePasswordModal will handle the API call internally
    // This prop is optional and only used if custom logic is needed
    console.log('Password change data:', passwordData);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      event.target.value = ''; // Reset the input
      return;
    }

    // Check file type (accept only images)
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      event.target.value = ''; // Reset the input
      return;
    }

    // Store the file for upload
    setSelectedFile(file);

    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      setValue('avatar', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Show skeleton while loading user data or during auth loading
  if (isLoadingUser || isLoading || (!userData && !isLoadingUser)) {
    return <PersonalDetailsFormSkeleton />;
  }

  return (
    <>
      <Card className="bg-white border-gray-200 shadow-none">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Personal details</h2>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {/* Avatar Section */}
              <div className="mb-6 sm:mb-8 flex justify-center sm:justify-start">
                <div className="relative inline-block">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                    <AvatarImage
                      src={previewUrl || formValues.avatar || userData?.avatar}
                      alt={fullName}
                    />
                    <AvatarFallback className="text-xl sm:text-2xl font-semibold">
                      {getInitials(fullName || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    disabled={updateProfileMutation.isPending}
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                    aria-label="Upload avatar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Avatar file input"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 sm:space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormInput
                    name="firstName"
                    label="First Name *"
                    placeholder="Enter your first name"
                    required
                    disabled={updateProfileMutation.isPending}
                  />
                  <FormInput
                    name="lastName"
                    label="Last Name *"
                    placeholder="Enter your last name"
                    required
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                {/* Email and Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormInput
                    name="email"
                    label="Email"
                    type="email"
                    disabled
                    placeholder="Enter your email address"
                  />
                  {userRole === 'seller' && (
                    <FormInput name="region" label="Region" placeholder="Enter your region" />
                  )}
                  {userRole === 'driver' && (
                    <FormPhoneInput
                      name="phone"
                      label="Phone"
                      placeholder="(123) 456-7890"
                      disabled={updateProfileMutation.isPending}
                    />
                  )}
                </div>

                {/* Seller-specific fields */}
                {userRole === 'seller' && (
                  <>
                    {/* Business Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <FormInput
                        name="businessName"
                        label="Business Name"
                        placeholder="Enter your business name"
                        disabled={updateProfileMutation.isPending}
                      />
                      <FormInput
                        name="businessAddress"
                        label="Business Address"
                        placeholder="Enter your business address"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>

                    {/* Phone Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <FormPhoneInput
                        name="phone"
                        label="Business Phone"
                        placeholder="(123) 456-7890"
                        disabled={updateProfileMutation.isPending}
                      />
                      <FormPhoneInput
                        name="cellPhone"
                        label="Cell Phone"
                        placeholder="(123) 456-7890"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>

                    {/* Tax Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <FormInput
                        name="einNumber"
                        label="EIN Number"
                        placeholder="Enter your EIN number"
                        disabled={updateProfileMutation.isPending}
                      />
                      <div className="grid grid-cols-3 gap-4 ">
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Local Delivery Shipping</Label>
                          <RadioGroup
                            value={localDelivery}
                            disabled={updateProfileMutation.isPending}
                            onValueChange={setLocalDelivery}
                            className="flex gap-8"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="delivery-yes" />
                              <Label htmlFor="delivery-yes" className="font-normal cursor-pointer">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="delivery-no" />
                              <Label htmlFor="delivery-no" className="font-normal cursor-pointer">
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        {localDelivery === 'no' && (
                          <div className="col-span-2">
                            <FormInput
                              name="salesTaxId"
                              label="Sales Tax ID"
                              placeholder="Enter your Sales Tax ID"
                              disabled={updateProfileMutation.isPending}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Local Delivery Option */}
                  </>
                )}
                {userRole === 'driver' && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <FormInput
                        name="address"
                        label="Address"
                        placeholder="Enter your address"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                  </>
                )}
                {/* Region and Address - Common fields */}

                {/* Description */}
                {userRole === 'seller' && (
                  <FormTextarea
                    name="description"
                    label="Description"
                    placeholder="Tell us about yourself..."
                    rows={5}
                    maxLength={500}
                    className="min-h-[120px]"
                    disabled={updateProfileMutation.isPending}
                  />
                )}

                <div
                  className={`pt-4 sm:pt-6 flex flex-col-reverse sm:flex-row items-center  gap-4 ${userData?.authType === 'email' ? 'justify-between' : 'justify-end'}`}
                >
                  {/* Password Change Link */}
                  {userData?.authType === 'email' && (
                    <button
                      type="button"
                      disabled={updateProfileMutation.isPending}
                      onClick={handleChangePassword}
                      className="text-red-500 hover:text-red-600 text-xs sm:text-sm font-medium transition-colors cursor-pointer underline"
                    >
                      Looking to change your password?
                    </button>
                  )}
                  {/* Save Button */}
                  <div className="w-full sm:w-auto">
                    <Button
                      type="submit"
                      disabled={isSubmitting || updateProfileMutation.isPending}
                      className="w-full sm:w-auto sm:min-w-[200px] md:min-w-[300px] lg:min-w-[469px] text-white px-6 sm:px-8 md:px-12 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base disabled:opacity-50"
                    >
                      {isSubmitting || updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordChange}
      />
    </>
  );
};

export default PersonalDetailsForm;
