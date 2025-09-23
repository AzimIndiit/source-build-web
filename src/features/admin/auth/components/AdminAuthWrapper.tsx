import { ReactNode } from 'react';

interface AdminAuthWrapperProps {
  children: ReactNode;
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 bg-gray-100 overflow-y-auto ">
        <div className="min-h-screen flex items-center justify-center p-2 sm:p-6 ">
          <div className="w-full max-w-xl">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <img src={'/logo.svg'} alt="logo" style={{ mixBlendMode: 'multiply' }} />
              </div>
            </div>

            {/* Form Card */}
            <div className=" p-6 sm:p-10">{children}</div>
          </div>
        </div>
      </div>
      {/* Right Panel - Illustration and Text */}
      <div className="hidden lg:flex lg:w-1/2  items-center justify-center p-12 min-h-screen bg-gradient-to-r from-sky-500/50  to-sky-110 ">
        <div className="flex items-center gap-3 mb-8 ">
          <img src={'/logo.svg'} alt="logo" style={{ mixBlendMode: 'multiply' }} />
        </div>
      </div>
    </div>
  );
}
