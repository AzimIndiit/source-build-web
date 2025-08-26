import { Link, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { AuthWrapper } from '../components/AuthWrapper';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'zimmCorp@gmail.com',
      password: 'password123', // Default password for testing
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log('Login data:', data);
      console.log('Starting login process...');

      // Call the actual login function from AuthProvider
      await login(data.email, data.password);

      console.log('Login successful, user authenticated');
      console.log('About to navigate to /seller/dashboard');

      // Show success toast
      toast.success('Login successful!');

      // Navigate based on user role (hardcoded for now)
      setTimeout(() => {
        console.log('Executing navigation to /seller/dashboard');
        navigate('/seller/dashboard');
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            className=" text-base px-4 border-gray-300"
          />

          <FormInput
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            className="text-base px-4 border-gray-300"
          />

          <Button
            type="submit"
            className="w-full  bg-primary   hover:bg-primary/80 text-white font-medium text-base"
            loading={isLoading}
          >
            Login
          </Button>

          <div className="text-center">
            <Link
              to="/auth/forgot-password"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

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
            className="w-full  flex justify-center items-center  border-gray-300 font-medium text-base"
            onClick={() => console.log('Google sign in')}
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
            Continue With Google
          </Button>

          <Button
            type="button"
            className="w-full  flex justify-center items-center bg-green-600 hover:bg-green-700 text-white font-medium text-base"
            onClick={() => navigate('/auth/signup')}
          >
            Create New Account
          </Button>
        </form>
      </FormProvider>
    </AuthWrapper>
  );
}

export default LoginPage;
