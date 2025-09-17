import React from 'react';
import { Button } from '@/components/ui/button';
import CommonModal from '@/components/common/CommonModal';
import { AssemblyOption } from '../types';

interface AssemblyOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: AssemblyOption) => void;
  title?: string;
  description?: string;
  className?: string;
}

const AssemblyOptionsModal: React.FC<AssemblyOptionsModalProps> = ({
  isOpen,
  onClose,
  onSelectOption,
  title = 'Assembly Options',
  description = 'Would you like to process your order with RTA (Ready-to-Assemble) cabinets or pre-assembled cabinets?',
  className = 'sm:max-w-[500px]',
}) => {
  const handleOptionSelect = (option: AssemblyOption) => {
    onSelectOption(option);
    onClose();
  };

  return (
    <CommonModal
      show={isOpen}
      onClose={onClose}
      className={className}
      body={
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-semibold">{title}</h4>
          </div>
          <div className="mb-6">
            <p className="text-gray-600">{description}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 text-gray-500"
              onClick={() => handleOptionSelect('RTA')}
            >
              RTA Cabinets
            </Button>
            <Button
              variant="default"
              size="lg"
              className="flex-1 text-white"
              onClick={() => handleOptionSelect('Assembled')}
            >
              Assembled Cabinets
            </Button>
          </div>
        </div>
      }
    />
  );
};

export default AssemblyOptionsModal;
