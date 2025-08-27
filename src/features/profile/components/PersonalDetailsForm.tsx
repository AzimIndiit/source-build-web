import React, { useState, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { getInitials } from '@/lib/helpers';
import { FormInput } from '@/components/forms/FormInput';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { ChangePasswordModal } from './ChangePasswordModal';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

// Zod validation schema
const personalDetailsSchema = z.object({
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
  company: z
    .string()
    .trim()
    .max(100, 'Company name must not exceed 100 characters')
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
});

type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsFormProps {
  initialData?: Partial<PersonalDetailsFormData>;
  onSave?: (data: PersonalDetailsFormData) => void;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  initialData = {
    firstName: 'Yousef',
    lastName: 'Alaoui',
    email: 'nikolhansen11@gmail.com',
    company: 'Johns. Pvt. Ltd.',
    region: 'USA',
    address: '70 Washington Square South, New York, United States',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vitae tellus eu dolor tincidunt imperdiet vel ut diam. Nulla a nulla varius, volutpat velit non, ullamcorper augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Maecenas sodales ultricies vulputate.',
  },
  onSave,
}) => {

  const {user} = useAuth();
  console.log(user);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
      defaultValues: {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        company: user?.company,
        region: user?.region,
        address: user?.address,
        description: user?.description,
      },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = methods;

  const formValues = watch();
  const fullName = `${formValues.firstName || ''} ${formValues.lastName || ''}`.trim();

  const onSubmit = async (data: PersonalDetailsFormData) => {
    // Trim all string values before saving
    const trimmedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value,
      ])
    ) as PersonalDetailsFormData;

    onSave?.(trimmedData);
    console.log('Personal details updated successfully', trimmedData);
    toast.success('Personal details updated successfully');
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordChange = async (passwordData: any) => {
    // Here you would typically call an API to change the password
    console.log('Password change data:', passwordData);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
    
    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setValue('avatar', reader.result as string);
      toast.success('Avatar uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

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
                    <AvatarImage src={formValues.avatar} alt={fullName} />
                    <AvatarFallback className="text-xl sm:text-2xl font-semibold">
                      {getInitials(fullName || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/80 transition-colors"
                    aria-label="Upload avatar"
                  >
                    <Camera className="w-4 h-4" />
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
                  />
                  <FormInput
                    name="lastName"
                    label="Last Name *"
                    placeholder="Enter your last name"
                    required
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
                  <FormInput
                    name="company"
                    label="Company Name"
                    placeholder="Enter your company name"
                  />
                </div>

                {/* Region and Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormInput name="region" label="Region" placeholder="Enter your region" />
                  <FormInput name="address" label="Address" placeholder="Enter your address" />
                </div>

                {/* Description */}
                <FormTextarea
                  name="description"
                  label="Description"
                  placeholder="Tell us about yourself..."
                  rows={5}
                  className="min-h-[120px]"
                />

                <div className="pt-4 sm:pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                  {/* Password Change Link */}
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="text-red-500 hover:text-red-600 text-xs sm:text-sm font-medium transition-colors cursor-pointer underline"
                  >
                    Looking to change your password?
                  </button>

                  {/* Save Button */}
                  <div className="w-full sm:w-auto">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto sm:min-w-[200px] md:min-w-[300px] lg:min-w-[469px] text-white px-6 sm:px-8 md:px-12 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
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
