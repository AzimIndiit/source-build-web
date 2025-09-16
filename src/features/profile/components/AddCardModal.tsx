import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CreateCardPayload } from '../services/cardService';
import { CardBrandIcon } from './CardIcons';
import {
  detectCardType,
  formatCardNumber,
  validateCardNumber,
  formatExpiryDate,
  validateExpiryDate,
} from '../utils/cardUtils';

interface AddCardModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCardPayload) => void;
  totalCards?: boolean;
  initialData?: Partial<CreateCardPayload>;
  isEdit?: boolean;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
  totalCards = false,
  initialData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<CreateCardPayload>({
    cardNumber: '',
    expiryMonth: new Date().getMonth() + 1,
    expiryYear: new Date().getFullYear(),
    cvv: '',
    cardholderName: '',
    isDefault: !totalCards,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardType, setCardType] = useState<string>('unknown');
  const [expiryInput, setExpiryInput] = useState('');
  const [displayCardNumber, setDisplayCardNumber] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      if (initialData.expiryMonth && initialData.expiryYear) {
        const month = String(initialData.expiryMonth).padStart(2, '0');
        const year = String(initialData.expiryYear).slice(-2);
        setExpiryInput(`${month}/${year}`);
      }
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      // Remove all non-digits
      const cleanedValue = value.replace(/\D/g, '');

      // Limit to 19 digits max (for longest card numbers)
      const limitedValue = cleanedValue.slice(0, 19);

      // Detect card type
      const detectedType = detectCardType(limitedValue);
      setCardType(detectedType);

      // Format the card number based on card type
      const formattedValue = formatCardNumber(limitedValue, detectedType);
      setDisplayCardNumber(formattedValue);

      // Store clean number in form data
      setFormData((prev) => ({ ...prev, cardNumber: limitedValue }));
    } else if (name === 'expiry') {
      // Format MM/YY
      const formattedValue = formatExpiryDate(value);
      setExpiryInput(formattedValue);

      // Parse month and year
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue.length >= 2) {
        const month = parseInt(cleanValue.slice(0, 2), 10);
        if (cleanValue.length >= 4) {
          const year = 2000 + parseInt(cleanValue.slice(2, 4), 10);
          setFormData((prev) => ({
            ...prev,
            expiryMonth: month,
            expiryYear: year,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            expiryMonth: month,
          }));
        }
      }
    } else if (name === 'cvv') {
      // CVV: 3 digits for most cards, 4 for Amex
      const maxLength = cardType === 'amex' ? 4 : 3;
      const cleanedValue = value.replace(/\D/g, '').slice(0, maxLength);
      setFormData((prev) => ({ ...prev, cvv: cleanedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (name === 'expiry') {
      setErrors((prev) => ({ ...prev, expiry: '' }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate card number
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.length < 13) {
      newErrors.cardNumber = 'Card number is too short';
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Validate expiry
    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!validateExpiryDate(formData.expiryMonth, formData.expiryYear)) {
      newErrors.expiry = 'Card has expired or invalid date';
    }

    // Validate CVV
    const cvvLength = cardType === 'amex' ? 4 : 3;
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length !== cvvLength) {
      newErrors.cvv = `CVV must be ${cvvLength} digits`;
    }

    // Validate cardholder name
    if (!formData.cardholderName || formData.cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Card' : 'Add New Card'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                name="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={displayCardNumber}
                onChange={handleInputChange}
                disabled={isSubmitting || isEdit}
                className={`pr-12 ${errors.cardNumber ? 'border-red-500' : ''}`}
                autoComplete="cc-number"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CardBrandIcon cardType={cardType} className="h-6 w-10" />
              </div>
            </div>
            {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber}</p>}
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Card Name</Label>
            <Input
              id="cardholderName"
              name="cardholderName"
              type="text"
              placeholder="John Doe"
              value={formData.cardholderName}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={errors.cardholderName ? 'border-red-500' : ''}
            />
            {errors.cardholderName && (
              <p className="text-sm text-red-500">{errors.cardholderName}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expire Date</Label>
              <Input
                id="expiry"
                name="expiry"
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                value={expiryInput}
                onChange={handleInputChange}
                disabled={isSubmitting || isEdit}
                className={errors.expiry ? 'border-red-500' : ''}
              />
              {errors.expiry && <p className="text-sm text-red-500">{errors.expiry}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                type="text"
                placeholder={cardType === 'amex' ? '1234' : '123'}
                maxLength={cardType === 'amex' ? 4 : 3}
                value={formData.cvv}
                onChange={handleInputChange}
                disabled={isSubmitting || isEdit}
                className={errors.cvv ? 'border-red-500' : ''}
                autoComplete="cc-csc"
              />
              {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
            </div>
          </div>

          {/* Default Card Switch */}
          {!totalCards && (
            <div className="flex items-center justify-between">
              <Label htmlFor="isDefault">Set as default card</Label>
              <Switch
                id="isDefault"
                className="h-6 w-12"
                checked={formData.isDefault}
                onCheckedChange={handleSwitchChange}
                disabled={isSubmitting}
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-white hover:text-white hover:bg-primary/90"
            >
              {isSubmitting ? 'Processing...' : isEdit ? 'Update Card' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
