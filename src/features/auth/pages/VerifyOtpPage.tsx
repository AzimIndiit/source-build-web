import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthWrapper } from '../components/AuthWrapper';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useVerifyOtpMutation, useResendOtpMutation } from '../hooks/useAuthMutations';
import toast from 'react-hot-toast';

const OTP_RESEND_COOLDOWN = 60; // seconds
const OTP_RESEND_KEY = 'otp_resend_timestamp';

function VerifyOtpPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const email = sessionStorage.getItem('signup_email');
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();

  // Calculate remaining cooldown time from localStorage
  const calculateRemainingTime = () => {
    const storedTimestamp = localStorage.getItem(OTP_RESEND_KEY);
    if (!storedTimestamp) return 0;

    const timestamp = parseInt(storedTimestamp, 10);
    const now = Date.now();
    const elapsed = Math.floor((now - timestamp) / 1000);
    const remaining = OTP_RESEND_COOLDOWN - elapsed;

    return remaining > 0 ? remaining : 0;
  };

  // Check if email exists, redirect if not
  useEffect(() => {
    if (!email) {
      // toast.error('Session expired. Please sign up again.');
      navigate('/auth/login');
    }
  }, [email, navigate]);

  // Initialize countdown on mount
  useEffect(() => {
    const remaining = calculateRemainingTime();
    setCountdown(remaining);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0) {
      timer = setTimeout(() => {
        const newCountdown = countdown - 1;
        setCountdown(newCountdown);

        // Clear localStorage when countdown reaches 0
        if (newCountdown === 0) {
          localStorage.removeItem(OTP_RESEND_KEY);
        }
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    if (!email) {
      toast.error('Email not found. Please sign up again.');
      return;
    }

    // Call the verify OTP mutation
    verifyOtpMutation.mutate(
      { email, otp, type: 'UR' },
      {
        onSuccess: () => {
          // Clear the OTP resend timestamp on successful verification
          localStorage.removeItem(OTP_RESEND_KEY);
        },
      }
    );
  };

  const handleResend = () => {
    if (!email) {
      toast.error('Email not found. Please sign up again.');
      return;
    }

    // Check if already in cooldown (double-check)
    const remaining = calculateRemainingTime();
    if (remaining > 0) {
      toast.error(`Please wait ${remaining} seconds before requesting another OTP`);
      return;
    }

    // Store timestamp in localStorage
    localStorage.setItem(OTP_RESEND_KEY, Date.now().toString());

    // Call the resend OTP mutation
    resendOtpMutation.mutate(
      { email, type: 'UR' },
      {
        onSuccess: () => {
          setOtp('');
          // Start countdown only on successful resend
          setCountdown(OTP_RESEND_COOLDOWN);
        },
        onError: (error: any) => {
          // Check if it's a rate limit error
          const errorMessage = error.response?.data?.message || '';
          if (errorMessage.includes('Please wait')) {
            // Extract the seconds from the error message
            const match = errorMessage.match(/(\d+) seconds/);
            const seconds = match ? parseInt(match[1], 10) : OTP_RESEND_COOLDOWN;
            
            // Set the countdown to the server-specified time
            setCountdown(seconds);
            
            // Update the timestamp to sync with server cooldown
            const serverCooldownStart = Date.now() - ((OTP_RESEND_COOLDOWN - seconds) * 1000);
            localStorage.setItem(OTP_RESEND_KEY, serverCooldownStart.toString());
            
            toast(`Please wait ${seconds} seconds before requesting another OTP`, {
              icon: '⏰',
              style: {
                background: '#FEF8C6',
                color: '#000',
                border: '1px solid #FCE992',
              },
            });
          } else {
            // Clear the timestamp if resend fails for other reasons
            localStorage.removeItem(OTP_RESEND_KEY);
            setCountdown(0);
            toast.error(errorMessage || 'Failed to resend OTP. Please try again.');
          }
        },
      }
    );
  };

  // Don't render the form if no email is present
  if (!email) {
    return null;
  }

  return (
    <AuthWrapper>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">OTP Verification</h2>
          <p className="text-gray-600">Enter 6-digit OTP sent on your registered email</p>
          <p className="text-gray-600 font-medium">{email}</p>
        </div>

        <div className="flex justify-center sm:py-6">
          <InputOTP
            disabled={verifyOtpMutation.isPending || resendOtpMutation.isPending}
            maxLength={6}
            pattern="^[0-9]+$"
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup className="gap-3">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Didn't get OTP?{' '}
            {countdown > 0 ? (
              <span className="font-medium text-gray-700">
                Resend in <span className="text-primary font-bold">{countdown}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendOtpMutation.isPending}
                className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50 cursor-pointer transition-colors "
              >
                {resendOtpMutation.isPending ? 'Resending...' : 'Resend'}
              </button>
            )}
          </p>
        </div>

        <Button
          type="submit"
          className="w-full  bg-primary hover:bg-primary/80 text-white font-medium text-base"
          loading={verifyOtpMutation.isPending}
          disabled={otp.length !== 6 || verifyOtpMutation.isPending}
        >
          Verify
        </Button>

        <div className="text-center">
          <p className="text-gray-600">
            Back to{' '}
            <Link to="/auth/signup" className="text-primary hover:text-primary/80 font-medium">
              Sign Up
            </Link>
            {' | '}
            <Link to="/auth/login" className="text-primary hover:text-primary/80 font-medium">
              Login
            </Link>
          </p>
        </div>
      </form>
    </AuthWrapper>
  );
}

export default VerifyOtpPage;
