import { Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { AuthWrapper } from '../components/AuthWrapper';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas/authSchemas';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { authService } from '../services/authService';

function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: 'zimmCorp@gmail.com',
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response :any = await authService.forgotPassword(data.email);
      
      if (response.status==='success') {
        toast.success( `Password reset link sent to ${data.email}`, {
          duration: 5000,
        });
        reset();
      } else {
        toast.error( 'Failed to send reset link. Please try again.');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send reset link. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
            <p className="text-gray-600">
              Please enter your registered email address below to recover your password.
            </p>
          </div>

          <FormInput
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
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

export default ForgotPasswordPage;
