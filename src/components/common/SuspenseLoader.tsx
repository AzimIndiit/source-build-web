import React from 'react';
import { Loader2 } from 'lucide-react';

interface SuspenseLoaderProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({
  fullScreen = false,
  message = 'Loading...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-[9999] min-h-[100vh] flex justify-center items-center bg-red-500'
    : 'flex items-center justify-center min-h-[200px] w-full';

  return (
    <div className={containerClasses}>
      <div className="gap-4 p-8 bg-red-500 rounded-lg shadow-2xl border border-gray-200 min-h-[100vh] w-full flex justify-center items-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <p className="text-lg text-gray-900 font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default SuspenseLoader;
