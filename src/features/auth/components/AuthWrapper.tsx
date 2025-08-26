import { ReactNode } from 'react';
import workerSvg from '@/assets/auth/worker.svg';

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Illustration and Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-100 to-gray-100 items-center justify-center p-12">
        <div className="max-w-xl">
          <div className="mb-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <img src={'/logo.svg'} alt="logo" style={{ mixBlendMode: 'multiply' }} />
            </div>

            {/* Tagline */}
            <h2 className="text-3xl font-semibold text-gray-800/80 leading-snug">
              Buy and sell building supplies locally—find great deals on materials from businesses
              near you.
            </h2>
          </div>

          {/* Illustration - Construction Workers SVG */}
          <div className="relative mt-12">
            <img src={workerSvg} alt="worker" />
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-6 lg:p-16">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <img src={'/logo.svg'} alt="logo" style={{ mixBlendMode: 'multiply' }} />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
