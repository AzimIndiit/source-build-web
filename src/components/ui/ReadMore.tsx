import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ReadMoreProps {
  text: string;
  maxLength?: number;
  className?: string;
  buttonClassName?: string;
  showButton?: boolean;
}

const ReadMore: React.FC<ReadMoreProps> = ({
  text,
  maxLength = 150,
  className = '',
  buttonClassName = '',
  showButton = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded ? text : text.slice(0, maxLength) + '...';
  
  if (!shouldTruncate) {
    return <p className={cn('text-gray-700 leading-relaxed', className)}>{text}</p>;
  }

  return (
    <div className="space-y-2">
      <p className={cn('text-gray-700 leading-relaxed', className)}>
        {displayText}
      </p>
      
      {showButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'h-auto p-0 text-primary hover:text-primary/80 hover:bg-transparent font-medium',
            buttonClassName
          )}
        >
          {isExpanded ? (
            <>
              Read Less
              <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              Read More
              <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ReadMore;
