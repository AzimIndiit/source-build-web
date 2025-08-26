import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending' | 'error';
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const getStatusIcon = (status: TimelineItem['status'], customIcon?: React.ReactNode) => {
  if (customIcon) return customIcon;
  
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'current':
      return <Clock className="w-5 h-5 text-blue-600" />;
    case 'pending':
      return <Clock className="w-5 h-5 text-gray-400" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-600" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusStyles = (status: TimelineItem['status']) => {
  switch (status) {
    case 'completed':
      return {
        container: 'border-green-200 bg-green-50',
        line: 'bg-green-600',
        text: 'text-green-800',
        title: 'text-green-900 font-semibold',
        description: 'text-green-700',
      };
    case 'current':
      return {
        container: 'border-blue-200 bg-blue-50',
        line: 'bg-blue-600',
        text: 'text-blue-800',
        title: 'text-blue-900 font-semibold',
        description: 'text-blue-700',
      };
    case 'pending':
      return {
        container: 'border-gray-200 bg-gray-50',
        line: 'bg-gray-300',
        text: 'text-gray-600',
        title: 'text-gray-700 font-medium',
        description: 'text-gray-500',
      };
    case 'error':
      return {
        container: 'border-red-200 bg-red-50',
        line: 'bg-red-600',
        text: 'text-red-800',
        title: 'text-red-900 font-semibold',
        description: 'text-red-700',
      };
    default:
      return {
        container: 'border-gray-200 bg-gray-50',
        line: 'bg-gray-300',
        text: 'text-gray-600',
        title: 'text-gray-700 font-medium',
        description: 'text-gray-500',
      };
  }
};

export const Timeline: React.FC<TimelineProps> = ({ items, className = '' }) => {
  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-6">
        {items.map((item, index) => {
          const styles = getStatusStyles(item.status);
          const isLast = index === items.length - 1;
          
          return (
            <div key={item.id} className="relative flex items-start gap-4">
              {/* Icon container */}
              <div className={cn(
                'relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2',
                styles.container
              )}>
                {getStatusIcon(item.status, item.icon)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className={cn('text-sm font-medium', styles.title)}>
                    {item.title}
                  </h3>
                  <span className={cn('text-xs', styles.text)}>
                    {item.timestamp}
                  </span>
                </div>
                
                {item.description && (
                  <p className={cn('text-sm mt-1', styles.description)}>
                    {item.description}
                  </p>
                )}
              </div>
              
              {/* Timeline line connector */}
              {!isLast && (
                <div className={cn(
                  'absolute left-6 top-12 w-0.5 h-6',
                  styles.line
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
