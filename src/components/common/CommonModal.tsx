import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CommonModalProps {
  show: boolean;
  onClose: () => void;
  body: React.ReactNode;
  className?: string;
}

const CommonModal: React.FC<CommonModalProps> = ({ show, onClose, body, className }) => {
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className={cn('sm:max-w-[500px] bg-white', className)}>{body}</DialogContent>
    </Dialog>
  );
};

export default CommonModal;
