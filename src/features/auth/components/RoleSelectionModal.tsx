import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { FormPhoneInput } from '@/components/forms/FormPhoneInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import { optionalPhoneValidation, phoneValidation } from '../schemas/authSchemas';
import useAuthStore from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';
import { ApiUser, transformApiUserToUser, USER_QUERY_KEY } from '../hooks/useUserQuery';
import axiosInstance from '@/lib/axios';

// Dynamic schema based on role - matching SignupPage structure
const createRoleSchema = (role: string) => {
  const baseSchema = {
    role: z.string().min(1, 'Account type is required'),
  };

  if (role === 'driver') {
    return z.object({
      ...baseSchema,
      phone: phoneValidation,
    });
  }

  if (role === 'seller') {
    return z
      .object({
        ...baseSchema,
        businessName: z
          .string()
          .min(2, 'Business name must be at least 2 characters')
          .max(70)
          .trim(),
        businessAddress: z
          .string()
          .min(2, 'Business address must be at least 2 characters')
          .max(255)
          .trim(),
        phone: phoneValidation,
        cellPhone: phoneValidation,
        einNumber: z.string().min(1, 'EIN number is required'),
        localDelivery: z.enum(['yes', 'no']),
        salesTaxId: z.string().optional(),
      })
      .refine(
        (data) => {
          // salesTaxId is required only when localDelivery is 'no'
          if (data.localDelivery === 'no') {
            return data.salesTaxId && data.salesTaxId.length > 0;
          }
          return true;
        },
        {
          message: 'Sales Tax ID is required when Local Delivery is No',
          path: ['salesTaxId'],
        }
      );
  }

  // Buyer doesn't need additional fields
  return z.object(baseSchema);
};

interface RoleSelectionModalProps {
  isOpen: boolean;
  userId: string;
  onClose?: () => void;
}

export function RoleSelectionModal({ isOpen, userId }: RoleSelectionModalProps) {
  const navigate = useNavigate();
  const { setUser, updateUser, setIsAuthenticated, checkAuth } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [localDelivery, setLocalDelivery] = useState('no');

  const methods = useForm<any>({
    resolver: zodResolver(createRoleSchema(selectedRole)),
    defaultValues: {
      role: '',
      businessName: '',
      businessAddress: '',
      phone: '',
      cellPhone: '',
      einNumber: '',
      localDelivery: 'no',
      salesTaxId: '',
    },
  });

  const { handleSubmit, watch, setValue, reset } = methods;

  const watchedRole = watch('role');

  useEffect(() => {
    if (watchedRole) {
      setSelectedRole(watchedRole);
      // Reset form when role changes but keep the role
      const newDefaults: any = {
        role: watchedRole,
        businessName: '',
        businessAddress: '',
        phone: '',
        cellPhone: '',
        einNumber: '',
        localDelivery: 'no',
        salesTaxId: '',
      };
      reset(newDefaults);
    }
  }, [watchedRole, reset]);

  // Watch localDelivery for conditional salesTaxId field
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.localDelivery) {
        setLocalDelivery(value.localDelivery);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Prepare the payload based on role
      let payload: any = {
        userId,
        role: data.role,
      };

      if (data.role === 'driver') {
        payload.phone = data.phone.replace(/\D/g, '');
      } else if (data.role === 'seller') {
        payload = {
          ...payload,
          businessName: data.businessName,
          businessAddress: data.businessAddress,
          phone: data.phone.replace(/\D/g, ''),
          cellPhone: data.cellPhone?.replace(/\D/g, '') || '',
          einNumber: data.einNumber,
          localDelivery: data.localDelivery === 'yes',
          salesTaxId: data.salesTaxId || '',
        };
      }

      // Submit role selection to backend
      const response = await axios.post('/auth/complete-google-signup', payload);

      if (response.data.status === 'success') {
        const { tokens, user } = response.data.data;

        // Store tokens
        if (tokens) {
          localStorage.setItem('access_token', tokens.accessToken || tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refreshToken || tokens.refresh_token);
        }

        try {
          const user = await queryClient.fetchQuery({
            queryKey: USER_QUERY_KEY,
            queryFn: async () => {
              const meResponse = await axiosInstance.get('/auth/me');

              if (meResponse.data && meResponse.data.data && meResponse.data.data.user) {
                const apiUser = meResponse.data.data.user as ApiUser;
                return transformApiUserToUser(apiUser);
              }

              throw new Error('Invalid user data from /me API');
            },
          });

          if (user) {
            console.log('AuthStore: User profile fetched', user);
            setUser(user);
          } else {
            throw new Error('No user data received from /me');
          }
        } catch (meError) {
          console.error('AuthStore: Failed to fetch user from /me, using login response', meError);
          // Fallback to using the user from login response if /me fails
          if (response.data.data.user) {
            const transformedUser = transformApiUserToUser(response.data.data.user as ApiUser);
            setUser(transformedUser);
          } else {
            throw meError;
          }
        }
        // // Set user in auth store if user data is present
        // if (user) {

        //   // Invalidate queries to refresh user data
        //   queryClient.invalidateQueries({ queryKey: ['user'] });
        //   queryClient.invalidateQueries({ queryKey: ['user-me'] });
        // } else {
        //   // If no user data in response, call checkAuth to fetch user
        //   try {
        //     await checkAuth();
        //   } catch (error) {
        //     console.error('Failed to fetch user profile:', error);
        //   }
        // }

        toast.success('Account setup completed successfully!');

        // Navigate based on role
        const currentUser = user || useAuthStore.getState().user;

        if (data.role === 'seller' || currentUser?.role === 'seller') {
          navigate('/seller/dashboard');
        } else if (data.role === 'driver' || currentUser?.role === 'driver') {
          if (!currentUser?.isVehicles) {
            navigate('/auth/vehicle-information');
          } else if (!currentUser?.isLicense) {
            navigate('/auth/driver-license');
          } else {
            navigate('/driver/dashboard');
          }
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Role selection error:', error);
      toast.error(error.response?.data?.message || 'Failed to complete signup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        // Prevent closing the modal by clicking outside or pressing Escape
        // Modal can only be closed after successful submission
      }}
    >
      <DialogContent
        hideCloseButton={true}
        className="w-[95vw] max-w-[95vw] sm:max-w-[500px] md:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Select Your Account Type</DialogTitle>
          <DialogDescription>
            Please select your account type and provide the required information to continue.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 px-2 sm:px-0">
            <FormSelect
              name="role"
              label="Account Type"
              disabled={isSubmitting}
              placeholder="Select account type"
              options={[
                // { value: 'buyer', label: 'Buyer' },
                { value: 'seller', label: 'Seller' },
                { value: 'driver', label: 'Driver' },
              ]}
            />

            {selectedRole === 'driver' && (
              <div className="space-y-4">
                <FormPhoneInput
                  name="phone"
                  label="Phone Number"
                  placeholder="(555) 123-4567"
                  disabled={isSubmitting}
                />
              </div>
            )}

            {selectedRole === 'seller' && (
              <div className="space-y-4">
                <FormInput
                  name="businessName"
                  label="Business Name"
                  type="text"
                  placeholder="Business Name"
                  disabled={isSubmitting}
                  className="text-base px-4 border-gray-300"
                />

                <FormInput
                  name="businessAddress"
                  label="Business Address"
                  type="text"
                  placeholder="Address of sales for materials"
                  disabled={isSubmitting}
                  className="text-base px-4 border-gray-300"
                />

                <FormPhoneInput
                  name="phone"
                  label="Business Phone"
                  placeholder="(123) 456-7890"
                  disabled={isSubmitting}
                  className="text-base px-4 border-gray-300"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormPhoneInput
                    name="cellPhone"
                    label="Cell Phone"
                    placeholder="(123) 456-7890"
                    disabled={isSubmitting}
                    className="text-base px-4 border-gray-300"
                  />

                  <FormInput
                    name="einNumber"
                    label="EIN Number"
                    type="text"
                    placeholder="EIN number"
                    disabled={isSubmitting}
                    className="text-base px-4 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Local Delivery Shipping *</Label>
                  <RadioGroup
                    value={localDelivery}
                    onValueChange={(value) => {
                      setLocalDelivery(value);
                      setValue('localDelivery', value);
                    }}
                    className="flex flex-row gap-6 sm:gap-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="yes"
                        id="delivery-yes"
                        className="h-5 w-5 sm:h-4 sm:w-4"
                      />
                      <Label
                        htmlFor="delivery-yes"
                        className="font-normal cursor-pointer text-base sm:text-sm"
                      >
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="no"
                        id="delivery-no"
                        className="h-5 w-5 sm:h-4 sm:w-4"
                      />
                      <Label
                        htmlFor="delivery-no"
                        className="font-normal cursor-pointer text-base sm:text-sm"
                      >
                        No
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {localDelivery === 'no' && (
                  <FormInput
                    name="salesTaxId"
                    label="Sales Tax ID / Resale Certificates"
                    type="text"
                    placeholder="Sales Tax ID/Resale Certificates"
                    disabled={isSubmitting}
                    className="text-base px-4 border-gray-300"
                  />
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full text-white hover:text-white"
              disabled={isSubmitting || !selectedRole}
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export default RoleSelectionModal;
