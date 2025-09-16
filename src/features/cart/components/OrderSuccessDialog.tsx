import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getAssetUrl } from '@/lib/assets';
import LazyImage from '@/components/common/LazyImage';
import OrderSuccessSVG from '@/assets/svg/orderSuccess.svg';

interface OrderSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrders?: () => void;
}

const OrderSuccessDialog: React.FC<OrderSuccessDialogProps> = ({
  isOpen,
  onClose,
  onViewOrders,
}) => {
  const navigate = useNavigate();

  const handleCheckBuyingList = () => {
    onClose();
    if (onViewOrders) {
      onViewOrders();
    } else {
      navigate('/buying');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] text-center bg-white">
        {/* Success Illustration */}
        <div className="flex justify-center mb-6">
          <LazyImage
            src={OrderSuccessSVG}
            alt="Order placed successfully"
            className="w-40 h-40 object-contain"
            loading="lazy"
          />
        </div>

        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center">
            Order Placed Successfully!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Success! Your payment has been processed.
            <br />
            Thank you for your purchase!
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleCheckBuyingList}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-base h-12"
          >
            Check Buying List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSuccessDialog;
