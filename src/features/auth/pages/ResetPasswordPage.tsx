import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { AuthWrapper } from '../components/AuthWrapper';
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/authSchemas';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      console.log('Reset password data:', { ...data, token });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success toast
      toast.success('Password reset successfully! Redirecting to login...');

      // Navigate to login after a short delay
      setTimeout(() => {
        navigate('/auth/login');
      }, 1500);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-600">Please enter your details below to reset your password</p>
          </div>

          <FormInput
            name="password"
            label="New Password"
            type="password"
            placeholder="Enter new password"
            className="text-base px-4 border-gray-300"
          />

          <FormInput
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            className="text-base px-4 border-gray-300"
          />

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/80 text-white font-medium text-base"
            loading={isLoading}
          >
            Continue
          </Button>

          <div className="text-center">
            <p className="text-gray-600">
              Back to{' '}
              <Link to="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                Login
              </Link>
            </p>
          </div>
        </form>
      </FormProvider>
    </AuthWrapper>
  );
}

export default ResetPasswordPage;
