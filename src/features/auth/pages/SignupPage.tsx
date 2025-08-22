import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { AuthWrapper } from '../components/AuthWrapper';
import { signupSchema, type SignupFormData } from '../schemas/authSchemas';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { FormPhoneInput } from '@/components/forms/FormPhoneInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [localDelivery, setLocalDelivery] = useState('no');

  const methods = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: 'seller',
      phone: '',
      cellPhone: '',
      businessName: '',
      fullName: '',
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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const fullData = {
        ...data,
        localDelivery,
      };
      console.log('Signup data:', fullData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success toast
      toast.success('Account created successfully! Please verify your email.');

      // Navigate to OTP verification
      navigate('/auth/verify-otp');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect
            name="accountType"
            label="Account Type"
            placeholder="Select account type"
            options={[
              // { value: 'buyer', label: 'Buyer' },
              { value: 'seller', label: 'Seller' },
              // { value: 'driver', label: 'Driver' }
            ]}
          />

          <FormInput
            name="businessName"
            label="Business Name"
            type="text"
            placeholder="Business Name"
            className="text-base px-4 border-gray-300"
          />

          <FormInput
            name="fullName"
            label="Address"
            type="text"
            placeholder="Address of sales for materials"
            className="text-base px-4 border-gray-300"
          />

          <FormPhoneInput
            name="phone"
            label="Business Phone"
            placeholder="(123) 456-7890"
            className="text-base px-4 border-gray-300"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormPhoneInput
              name="cellPhone"
              label="Cell Phone"
              placeholder="(123) 456-7890"
              className="text-base px-4 border-gray-300"
            />
            <FormInput
              name="einNumber"
              label="EIN Number"
              type="text"
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
            placeholder="Sales Tax ID/Resale Certificates"
            className="text-base px-4 border-gray-300"
          />

          <FormInput
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            className="text-base px-4 border-gray-300"
          />

          <FormInput
            name="password"
            label="Password"
            type="password"
            placeholder="Create a password"
            className="text-base px-4 border-gray-300"
          />

          <FormInput
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            className="text-base px-4 border-gray-300"
          />

          <Controller
            name="termsAccepted"
            control={methods.control}
            render={({ field }) => (
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
            )}
          />

          <div className="pt-4 space-y-4">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 text-white font-medium text-base"
              loading={isLoading}
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
