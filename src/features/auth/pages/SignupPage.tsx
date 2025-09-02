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
  const signupMutation = useSignupMutation();

  const methods = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: 'seller',
      firstName: '',
      lastName: '',
      phone: '',
      cellPhone: '',
      businessName: '',
      businessAddress: '',
      email: '',
      password: '',
      confirmPassword: '',
      einNumber: '',
      salesTaxId: '',
      termsAccepted: false,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  // Log validation errors for debugging
  console.log('Validation errors:', errors);

  const onSubmit = async (data: SignupFormData) => {
    const fullData = {
      ...data,
      localDelivery,
    };

    // Use the mutation to handle the API call
    signupMutation.mutate(fullData);
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
              // { value: 'driver', label: 'Driver' }
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
