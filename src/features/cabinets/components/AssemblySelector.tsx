import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AssemblySelectorProps {
  assemblyType: 'rta' | 'assembled';
  onAssemblyChange: (type: 'rta' | 'assembled') => void;
}

const AssemblySelector: React.FC<AssemblySelectorProps> = ({ assemblyType, onAssemblyChange }) => {
  return (
    <div className="mb-6">
      <h6 className="font-semibold mb-3">Choose Assembly</h6>
      <div className="flex gap-2">
        <Button
          variant={assemblyType === 'rta' ? 'default' : 'secondary'}
          className={cn(
            '!rounded-sm h-[49px]',
            assemblyType === 'rta' ? 'text-white border' : 'text-gray-500 border border-gray-500'
          )}
          onClick={() => onAssemblyChange('rta')}
        >
          RTA Cabinets
        </Button>
        <Button
          variant={assemblyType === 'assembled' ? 'default' : 'secondary'}
          className={cn(
            '!rounded-sm h-[49px]',
            assemblyType === 'assembled'
              ? 'text-white border'
              : 'text-gray-500 border border-gray-400'
          )}
          onClick={() => onAssemblyChange('assembled')}
        >
          Assembled Cabinets
        </Button>
      </div>
    </div>
  );
};

export default AssemblySelector;
