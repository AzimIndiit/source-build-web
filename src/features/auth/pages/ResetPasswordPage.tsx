import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AuthWrapper } from '../components/AuthWrapper';
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/authSchemas';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { authService } from '../services/authService';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const methods = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { handleSubmit } = methods;

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenError('No reset token provided. Please request a new password reset link.');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await authService.verifyResetToken(token);
        if (response.status === 'success' && response.data?.valid) {
          setTokenValid(true);
        } else {
          setTokenError(
            response.message ||
              'Invalid or expired reset token. Please request a new password reset link.'
          );
        }
      } catch (error: any) {
        console.error('Token verification error:', error);
        const errorMessage =
          error?.response?.data?.message ||
          'Invalid or expired reset token. Please request a new password reset link.';
        setTokenError(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('No reset token provided');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, data.password);

      if (response.status === 'success') {
        toast.success(response.message || 'Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/auth/login');
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to reset password. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper>
      {isVerifying ? (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Verifying Reset Token</h2>
          <p className="text-gray-600">Please wait while we verify your reset token...</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      ) : tokenError ? (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Token Invalid</h2>
          <p className="text-red-600">{tokenError}</p>
          <div className="space-y-3">
            <Link
              to="/auth/forgot-password"
              className="block w-full bg-primary hover:bg-primary/80 text-white font-medium text-base rounded-lg py-3"
            >
              Request New Reset Link
            </Link>
            <Link to="/auth/login" className="block text-primary hover:text-primary/80 font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      ) : tokenValid ? (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
              <p className="text-gray-600">
                Please enter your details below to reset your password
              </p>
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
      ) : null}
    </AuthWrapper>
  );
}

export default ResetPasswordPage;
