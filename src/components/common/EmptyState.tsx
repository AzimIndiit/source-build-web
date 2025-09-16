import React from 'react';
import { Button } from '../ui';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon && (
        <div className="mb-6 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant="default"
          onClick={action.onClick}
          className=" text-white bg-primaryhover:bg-primary/90 "
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};