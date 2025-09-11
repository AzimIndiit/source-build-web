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


interface SavedCardProps {
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

export const SavedCard: React.FC<SavedCardProps> = ({
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

    console.log('id', id)

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
    <Card
      className={cn(
        'relative h-[240px] flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow',
        'bg-gradient-to-l from-[#93278F]/90 to-black border-0',
        className
      )}
    >
      <CardContent className="flex flex-col h-full p-6 text-white">
        {/* Top section with chip and brand */}
        <div className="flex justify-between items-start mb-2">
          {/* Chip icon */}
          <div className="w-12 h-10 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={cardBrand} alt="Card chip" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="flex items-center space-x-2 absolute right-6 top-6">
                <Label 
                  htmlFor={`default-${accountNumber}`} 
                  className={`text-xs text-white transition-opacity duration-200 ${
                    isUpdating ? 'opacity-50' : 'opacity-80'
                  }`}
                >
                  Default
                </Label>
                <Switch
                  id={`default-${accountNumber}`}
                  checked={optimisticIsDefault}
                  onCheckedChange={handleToggle}
                  disabled={isUpdating || (optimisticIsDefault && totalCards)}
                  className={`h-6 w-12 transition-all duration-200 ${
                    isUpdating 
                      ? 'opacity-70 data-[state=checked]:bg-green-400' 
                      : optimisticIsDefault && totalCards 
                      ? 'data-[state=checked]:bg-green-500 opacity-80 cursor-not-allowed' 
                      : 'data-[state=checked]:bg-green-500 hover:data-[state=checked]:bg-green-600'
                  }`}
                />
              </div>
          
          {/* Brand name/logo on the right */}
          <div className="flex flex-col items-end mt-4">
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

        {/* Card number */}
        <div className="flex-1">
          <p className="text-lg font-mono tracking-[0.2em] ">
            {accountNumber}
          </p>
        </div>

        {/* Bottom section with name, expiry and controls */}
        <div className=" mt-8">
          <div className="flex justify-between items-end">
            <div className="flex-1">
              <div className="mb-1">
                <p className="text-xs uppercase tracking-wider opacity-80">Card Holder Name</p>
                <p className="text-base font-medium">{accountHolder}</p>
              </div>
            </div>
            
            {isCard && (
              <div className="mr-4">
                <p className="text-xs uppercase tracking-wider opacity-80">Expiry Date</p>
                <p className="text-base font-medium">{expiryDate}</p>
              </div>
            )}

            {/* Default switch and delete button */}
            <div className="flex items-center space-x-3">
            
              
              <Button
                title="Delete"
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="w-8 h-8 hover:bg-red-500/20 text-red-500 hover:text-red-500 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
