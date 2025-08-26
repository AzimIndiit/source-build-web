import React from 'react';

interface ProfileLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children, sidebar }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            {sidebar}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};