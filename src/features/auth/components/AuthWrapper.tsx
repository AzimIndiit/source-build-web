import { ReactNode } from 'react';

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
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="#4F62D7"/>
                <path d="M12 20C12 20 15 14 20 14C22.5 14 24 15.5 24 18C24 20.5 22.5 22 20 22C17.5 22 16 23.5 16 26C16 28.5 17.5 30 20 30C25 30 28 24 28 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span className="text-3xl font-bold">
                <span className="text-[#4F62D7]">Source</span>
                <span className="text-gray-900"> Build</span>
              </span>
            </div>
            
            {/* Tagline */}
            <h2 className="text-3xl font-semibold text-gray-800 leading-snug">
              Buy and sell building supplies locally—find great deals on materials from businesses near you.
            </h2>
          </div>
          
          {/* Illustration - Construction Workers SVG */}
          <div className="relative mt-12">
            <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              {/* Background elements */}
              <rect x="20" y="180" width="60" height="100" fill="#FDB813" rx="2"/>
              <rect x="90" y="140" width="60" height="140" fill="#E85D3D" rx="2"/>
              <rect x="160" y="160" width="60" height="120" fill="#FDB813" rx="2"/>
              <rect x="230" y="120" width="60" height="160" fill="#F4B942" rx="2"/>
              
              {/* Grid lines */}
              <path d="M10 100 L50 80 L90 100" stroke="#90EE90" strokeWidth="2" opacity="0.5"/>
              <path d="M320 100 L360 80 L400 100" stroke="#90EE90" strokeWidth="2" opacity="0.5"/>
              <rect x="50" y="50" width="300" height="180" stroke="#E0E0E0" strokeWidth="1" fill="none" strokeDasharray="5 5" opacity="0.3"/>
              
              {/* Worker 1 */}
              <g transform="translate(180, 200)">
                <ellipse cx="0" cy="-35" rx="12" ry="12" fill="#FFD4B2"/>
                <rect x="-15" y="-25" width="30" height="35" fill="#4CAF50" rx="2"/>
                <rect x="-12" y="10" width="10" height="20" fill="#2E7D32"/>
                <rect x="2" y="10" width="10" height="20" fill="#2E7D32"/>
                <rect x="-15" y="-15" width="12" height="20" fill="#81C784"/>
                <path d="M-12 -45 L12 -45 L10 -35 L-10 -35 Z" fill="#FFA726"/>
              </g>
              
              {/* Worker 2 */}
              <g transform="translate(120, 230)">
                <ellipse cx="0" cy="-35" rx="12" ry="12" fill="#FFD4B2"/>
                <rect x="-15" y="-25" width="30" height="35" fill="#2196F3" rx="2"/>
                <rect x="-12" y="10" width="10" height="20" fill="#1565C0"/>
                <rect x="2" y="10" width="10" height="20" fill="#1565C0"/>
                <rect x="15" y="-20" width="25" height="15" fill="#795548" rx="1"/>
                <path d="M-12 -45 L12 -45 L10 -35 L-10 -35 Z" fill="#FFA726"/>
              </g>
              
              {/* Measuring tape */}
              <rect x="250" y="240" width="80" height="3" fill="#FFD700" rx="1"/>
              <circle cx="250" cy="241.5" r="5" fill="#FFA000"/>
              
              {/* Charts/papers */}
              <rect x="300" y="50" width="60" height="40" fill="white" stroke="#E0E0E0" strokeWidth="1" rx="2"/>
              <line x1="310" y1="60" x2="350" y2="60" stroke="#4CAF50" strokeWidth="2"/>
              <line x1="310" y1="70" x2="340" y2="70" stroke="#2196F3" strokeWidth="2"/>
              <line x1="310" y1="80" x2="345" y2="80" stroke="#FF9800" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-6 lg:p-16">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="#4F62D7"/>
                <path d="M12 20C12 20 15 14 20 14C22.5 14 24 15.5 24 18C24 20.5 22.5 22 20 22C17.5 22 16 23.5 16 26C16 28.5 17.5 30 20 30C25 30 28 24 28 24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span className="text-2xl font-bold">
                <span className="text-[#4F62D7]">Source</span>
                <span className="text-gray-900"> Build</span>
              </span>
            </div>
          </div>
          
          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}