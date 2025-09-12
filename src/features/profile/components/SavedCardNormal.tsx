import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/helpers';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import cardBrand from '@/assets/svg/cardBrand.svg';

// Import card brand SVGs
import visaLogo from '@/assets/svg/cards/visa.svg';
import mastercardLogo from '@/assets/svg/cards/mastercard.svg';
import amexLogo from '@/assets/svg/cards/amex.svg';
import discoverLogo from '@/assets/svg/cards/discover.svg';
import dinersLogo from '@/assets/svg/cards/diners-club.svg';
import jcbLogo from '@/assets/svg/cards/jcb.svg';
import unionpayLogo from '@/assets/svg/cards/unionpay.svg';

const cardBrandImages: Record<string, string> = {
  visa: visaLogo,
  mastercard: mastercardLogo,
  amex: amexLogo,
  'american express': amexLogo,
  discover: discoverLogo,
  diners: dinersLogo,
  'diners club': dinersLogo,
  jcb: jcbLogo,
  unionpay: unionpayLogo,
};

const getCardBrandImage = (brandName: string): string | null => {
  const normalizedBrand = brandName.toLowerCase().trim();
  return cardBrandImages[normalizedBrand] || null;
};

interface SavedCardNormalProps {
  id: string;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  expiryDate?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleDefault?: (id: string, isDefault: boolean) => Promise<void>;
  className?: string;
  isDefault?: boolean;
  totalCards?: boolean;
  isCard?: boolean;
}

export const SavedCardNormal: React.FC<SavedCardNormalProps> = ({
  id,
  accountHolder,
  accountNumber,
  bankName,
  expiryDate,
  onDelete,
  onToggleDefault,
  className,
  isDefault,
  totalCards,
  isCard = false,
}) => {
  // Local state for tracking update status and optimistic updates
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticIsDefault, setOptimisticIsDefault] = useState(isDefault);

  // Sync optimistic state with prop when it changes (e.g., after server update)
  React.useEffect(() => {
    setOptimisticIsDefault(isDefault);
  }, [isDefault]);

  const handleToggle = async (checked: boolean) => {
    // Don't allow toggle if already updating
    if (isUpdating) return;

    // Only allow toggling on (setting as default)
    if (!checked) return;

    console.log('id', id);

    // Optimistic update - immediately update the UI
    setOptimisticIsDefault(checked);

    if (onToggleDefault) {
      setIsUpdating(true);
      try {
        await onToggleDefault(id, checked);
        // Toast is handled in the mutation hook
      } catch (error) {
        console.error('Failed to update default status:', error);
        // Revert optimistic update on error
        setOptimisticIsDefault(isDefault);
      } finally {
        setIsUpdating(false);
      }
    }
  };
  console.log('isDefault && totalBankAccount ', isDefault, totalCards);
  return (
    <div className={cn('relative  flex flex-col overflow-hidden ')}>
      <div className="flex h-full justify-between items-end text-gray-700">
        {/* Card number */}
        <div className="">
          <div className="flex gap-2">
            <p className="text-base font-medium">{accountHolder}</p>
            {isDefault && (
              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-primary bg-blue-100 rounded">
                Default
              </span>
            )}
          </div>

          <p className="text-lg font-mono tracking-[0.2em] ">{accountNumber}</p>
        </div>
        <div className="flex flex-col justify-end items-end ">
          {(() => {
            const brandImage = getCardBrandImage(bankName);
            if (brandImage) {
              return (
                <img
                  src={brandImage}
                  alt={`${bankName} logo`}
                  className="h-12 w-auto object-contain"
                />
              );
            } else {
              // Fallback to text if no matching SVG
              return (
                <span className="text-2xl font-bold uppercase tracking-wider italic">
                  {bankName}
                </span>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
};
