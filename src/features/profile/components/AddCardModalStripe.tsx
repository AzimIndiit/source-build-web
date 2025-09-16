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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { CreateCardPayload } from '../services/cardService';

interface AddCardModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: { token: string; cardholderName: string; isDefault: boolean }) => void;
  totalCards?: boolean;
  initialData?: Partial<CreateCardPayload>;
  isEdit?: boolean;
}

const CardForm: React.FC<{
  onSubmit: (data: { token: string; cardholderName: string; isDefault: boolean }) => void;
  onClose: () => void;
  isSubmitting: boolean;
  totalCards: boolean;
  isEdit: boolean;
  initialData?: Partial<CreateCardPayload>;
}> = ({ onSubmit, onClose, isSubmitting, totalCards, isEdit }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [isDefault, setIsDefault] = useState(!totalCards);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe is not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      return;
    }

    if (!cardholderName.trim()) {
      setError('Cardholder name is required');
      return;
    }

    try {
      // Create token with Stripe
      const { error: stripeError, token } = await stripe.createToken(cardElement, {
        name: cardholderName,
      });

      if (stripeError) {
        setError(stripeError.message || 'Failed to process card');
        return;
      }

      if (!token) {
        setError('Failed to create card token');
        return;
      }

      // Submit token to backend
      onSubmit({
        token: token.id,
        cardholderName,
        isDefault,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        borderRadius: '8px',
        fontSize: '16px',
        lineHeight: '2.5',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cardholder Name */}
      <div className="space-y-2">
        <Label htmlFor="cardholderName">Cardholder Name</Label>
        <Input
          id="cardholderName"
          type="text"
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Stripe Card Element */}
      <div className="space-y-2">
        <Label>Card Details</Label>
        <div className="p-3 border rounded-sm border-gray-200 h-[69px]">
          <CardElement
            options={cardElementOptions}
            onChange={(e) => {
              setCardComplete(e.complete);
              if (e.error) {
                setError(e.error.message);
              } else {
                setError(null);
              }
            }}
          />
        </div>
        <p className="text-xs text-gray-500">Enter your card number, expiry date, and CVC</p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Default Card Switch */}
      {!isEdit && (
        <div className="flex items-center justify-between">
          <Label htmlFor="isDefault">Set as default card</Label>
          <Switch
            id="isDefault"
            className="h-6 w-12"
            checked={isDefault}
            onCheckedChange={setIsDefault}
            disabled={isSubmitting}
          />
        </div>
      )}

      {/* Test Card Info */}
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Test Mode:</strong> Use card number <code>4242 4242 4242 4242</code> with any
          future expiry date and any 3-digit CVC.
        </p>
      </div>

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
          disabled={!stripe || isSubmitting || !cardComplete || !cardholderName}
          className="flex-1 bg-primary text-white hover:text-white hover:bg-primary/90"
        >
          {isSubmitting ? 'Processing...' : isEdit ? 'Update Card' : 'Add Card'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const AddCardModalStripe: React.FC<AddCardModalProps> = ({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
  totalCards = false,
  initialData,
  isEdit = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Card' : 'Add New Card'}</DialogTitle>
        </DialogHeader>

        <Elements stripe={stripePromise}>
          <CardForm
            onSubmit={onSubmit}
            onClose={onClose}
            isSubmitting={isSubmitting}
            totalCards={totalCards}
            isEdit={isEdit}
            initialData={initialData}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};
