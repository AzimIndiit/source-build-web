import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { AuthWrapper } from '../components/AuthWrapper';
import { signupSchema, type SignupFormData } from '../schemas/authSchemas';
import { useSignupMutation } from '../hooks/useAuthMutations';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { FormPhoneInput } from '@/components/forms/FormPhoneInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

function SignupPage() {
  const navigate = useNavigate();
  const [localDelivery, setLocalDelivery] = useState('no');
  const [googleLoading, setGoogleLoading] = useState(false);
  const signupMutation = useSignupMutation();

  const methods = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: 'driver',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      // Role-specific fields
      phone: '',
      cellPhone: '',
      businessName: '',
      businessAddress: '',
      einNumber: '',
      salesTaxId: '',
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;

  const accountType = watch('accountType');

  // Log validation errors for debugging
  console.log('Validation errors:', errors);

  const onSubmit = async (data: SignupFormData) => {
    let fullData: any = {
      accountType: data.accountType,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      termsAccepted: data.termsAccepted,
      role: data.accountType,
    };

    // Add role-specific fields based on account type
    if (data.accountType === 'seller') {
      fullData = {
        ...fullData,
        businessName: data.businessName,
        businessAddress: data.businessAddress,
        phone: data.phone?.replace(/\D/g, ''), // Remove non-digit characters
        cellPhone: data.cellPhone?.replace(/\D/g, ''), // Remove non-digit characters
        einNumber: data.einNumber,
        salesTaxId: data.salesTaxId,
        localDelivery: localDelivery,
      };
    } else if (data.accountType === 'driver') {
      fullData = {
        ...fullData,
        phone: data.phone?.replace(/\D/g, ''), // Remove non-digit characters
      };
      delete fullData.localDelivery;
    }
    // For buyer, no additional fields needed

    // Use the mutation to handle the API call
    signupMutation.mutate(fullData);
  };

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    // For signup, we don't need to send role
    // User will select role after Google authentication
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';
    const googleAuthUrl = `${apiBaseUrl}/auth/google`;

    // Redirect to backend Google OAuth endpoint
    window.location.href = googleAuthUrl;
  };

  return (
    <AuthWrapper>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect
            name="accountType"
            label="Account Type"
            disabled={signupMutation.isPending}
            placeholder="Select account type"
            options={[
              // { value: 'buyer', label: 'Buyer' },
              { value: 'seller', label: 'Seller' },
              { value: 'driver', label: 'Driver' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="firstName"
              label="First Name"
              type="text"
              disabled={signupMutation.isPending}
              placeholder="First Name"
              className="text-base px-4 border-gray-300"
            />
            <FormInput
              name="lastName"
              label="Last Name"
              type="text"
              disabled={signupMutation.isPending}
              placeholder="Last Name"
              className="text-base px-4 border-gray-300"
            />
          </div>

          {/* Seller-specific fields */}
          {accountType === 'seller' && (
            <>
              <FormInput
                name="businessName"
                label="Business Name"
                type="text"
                disabled={signupMutation.isPending}
                placeholder="Business Name"
                className="text-base px-4 border-gray-300"
              />

              <FormInput
                name="businessAddress"
                label="Address"
                type="text"
                disabled={signupMutation.isPending}
                placeholder="Address of sales for materials"
                className="text-base px-4 border-gray-300"
              />

              <FormPhoneInput
                name="phone"
                label="Business Phone"
                disabled={signupMutation.isPending}
                placeholder="(123) 456-7890"
                className="text-base px-4 border-gray-300"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormPhoneInput
                  name="cellPhone"
                  label="Cell Phone"
                  disabled={signupMutation.isPending}
                  placeholder="(123) 456-7890"
                  className="text-base px-4 border-gray-300"
                />
                <FormInput
                  name="einNumber"
                  label="EIN Number"
                  type="text"
                  disabled={signupMutation.isPending}
                  placeholder="EIN number"
                  className="text-base px-4 border-gray-300"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Local Delivery Shipping</Label>
                <RadioGroup
                  value={localDelivery}
                  onValueChange={setLocalDelivery}
                  className="flex gap-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="font-normal cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <FormInput
                name="salesTaxId"
                label="Sales Tax ID"
                type="text"
                disabled={signupMutation.isPending}
                placeholder="Sales Tax ID/Resale Certificates"
                className="text-base px-4 border-gray-300"
              />
            </>
          )}

          {/* Driver-specific fields */}
          {accountType === 'driver' && (
            <>
              <FormPhoneInput
                name="phone"
                label="Phone Number"
                disabled={signupMutation.isPending}
                placeholder="(123) 456-7890"
                className="text-base px-4 border-gray-300"
              />
            </>
          )}

          <FormInput
            name="email"
            label="Email"
            type="email"
            disabled={signupMutation.isPending}
            placeholder="Enter your email"
            className="text-base px-4 border-gray-300"
          />

          <FormInput
            name="password"
            label="Password"
            type="password"
            disabled={signupMutation.isPending}
            placeholder="Create a password"
            className="text-base px-4 border-gray-300"
          />

          <FormInput
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            disabled={signupMutation.isPending}
            placeholder="Confirm your password"
            className="text-base px-4 border-gray-300"
          />

          <Controller
            name="termsAccepted"
            disabled={signupMutation.isPending}
            control={methods.control}
            render={({ field }) => (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                    I agree to the Terms and Conditions
                  </Label>
                </div>
                {methods.formState.errors.termsAccepted && (
                  <p className="text-sm text-red-600">
                    {methods.formState.errors.termsAccepted.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className="pt-4 space-y-4">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 text-white font-medium text-base"
              loading={signupMutation.isPending}
              disabled={signupMutation.isPending}
            >
              Sign Up
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex justify-center items-center border-gray-300 font-medium text-base"
              onClick={handleGoogleSignup}
              disabled={googleLoading || signupMutation.isPending}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign Up With Google
            </Button>

            <Button
              type="button"
              className="w-full flex justify-center items-center bg-green-600 hover:bg-green-700 text-white font-medium text-base"
              onClick={() => navigate('/auth/login')}
            >
              Already have an account?
            </Button>
          </div>
        </form>
      </FormProvider>
    </AuthWrapper>
  );
}

export default SignupPage;
