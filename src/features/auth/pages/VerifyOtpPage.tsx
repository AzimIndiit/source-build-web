import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthWrapper } from '../components/AuthWrapper';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

function VerifyOtpPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Verifying OTP:', otp);
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    console.log('Resending OTP');
  };

  return (
    <AuthWrapper>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">OTP Verification</h2>
          <p className="text-gray-600">
            Enter 6-digit OTP sent on your registered email
          </p>
          <p className="text-gray-600 font-medium">ZimmCorp@gmail.com.</p>
        </div>

        <div className="flex justify-center py-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Didn't get OTP?{' '}
            <button
              type="button"
              onClick={handleResend}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Resend
            </button>
          </p>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
          loading={isLoading}
          disabled={otp.length !== 6}
        >
          Verify
        </Button>

        <div className="text-center">
          <p className="text-gray-600">
            Back to{' '}
            <Link 
              to="/auth/signup" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign Up
            </Link>
            {' | '}
            <Link 
              to="/auth/login" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </AuthWrapper>
  );
}

export default VerifyOtpPage;