import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import notFoundSvg from '@/assets/svg/notFound.svg';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <EmptyState
        icon={<img src={notFoundSvg} alt="Page not found" className="h-64 w-auto" />}
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        action={{
          label: 'Go to Home',
          onClick: () => navigate('/'),
        }}
        className="max-w-md"
      />
    </div>
  );
};

export default NotFoundPage;
