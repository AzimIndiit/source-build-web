import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Product?',
  description = 'Are you sure, You want to delete this product?',
  confirmText = "Yes I'm Sure",
  cancelText = 'Cancel',
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 overflow-hidden bg-white">
        <div className="p-8 text-center">
          <DialogTitle className="text-xl font-semibold mb-3">{title}</DialogTitle>
          <div className="text-gray-600 text-sm mb-6">{description}</div>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 max-w-[150px] h-11 border-gray-300 hover:bg-gray-50"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 max-w-[150px] h-11 bg-primary hover:bg-primary/90 text-white"
            >
              {isLoading ? 'Processing...' : confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
