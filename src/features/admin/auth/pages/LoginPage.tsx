import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { AdminAuthWrapper } from '../components/AdminAuthWrapper';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { useAuth } from '@/hooks/useAuth';
import useAuthStore from '@/stores/authStore';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@yopmail.com',
      password: 'Password@1',  // Default password for testing
      role: 'admin',
    },
  });

  const { handleSubmit } = methods;

  // Check for content parameter in URL (new Google user without role)

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log('Login data:', data);
      console.log('Starting login process...');

      // Call the actual login function from AuthProvider
      await login(data.email, data.password, data.role);

      // Show success toast

      // Get the user from the store after login
      const currentUser = useAuthStore.getState().user;

      // Get the intended destination from location state
      // Handle both string and object formats for 'from'
      const from =
        typeof location.state?.from === 'string'
          ? location.state.from
          : location.state?.from?.pathname || null;

      // Handle navigation based on user role and status
      if (currentUser) {
        if (currentUser.role === 'admin') {
          navigate(from || '/admin/dashboard');
        }
        toast.success('Login successful!');
      } else {
        // Default navigation if user is not available
        navigate(from || '/');
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthWrapper>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-start">
            <h2 className="text-4xl font-bold text-gray-900">
              <strong> Welcome To </strong> Source Build
            </h2>
          </div>
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
          <div className="text-end">
            <Link
              to="/admin/auth/forgot-password"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full  bg-primary   hover:bg-primary/80 text-white font-medium text-base"
            loading={isLoading}
          >
            Login
          </Button>
        </form>
      </FormProvider>
    </AdminAuthWrapper>
  );
}

export default LoginPage;
