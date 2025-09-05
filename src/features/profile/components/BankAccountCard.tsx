import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { SquarePen, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/helpers';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface BankAccountCardProps {
  id: string;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleDefault?: (id: string, isDefault: boolean) => Promise<void>;
  className?: string;
  isDefault?: boolean;
}

export const BankAccountCard: React.FC<BankAccountCardProps> = ({
  id,
  accountHolder,
  accountNumber,
  bankName,
  onEdit,
  onDelete,
  onToggleDefault,
  className,
  isDefault,
}) => {
  // Local state for tracking update status
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    // Don't allow toggle if already updating
    if (isUpdating) return;

    // Only allow toggling on (setting as default)
    if (!checked) return;

    if (onToggleDefault) {
      setIsUpdating(true);
      try {
        await onToggleDefault(id, checked);
        // Toast is handled in the mutation hook
      } catch (error) {
        console.error('Failed to update default status:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Card
      className={cn(
        'bg-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-shadow relative h-[180px] flex flex-col ',
        className
      )}
    >
      <CardContent className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-1">
            {accountHolder}
          </h3>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`default-${accountNumber}`} className="text-xs text-gray-600">
              Default
            </Label>
            <Switch
              id={`default-${accountNumber}`}
              checked={isDefault || false}
              onCheckedChange={handleToggle}
              // disabled={isDefault}
              className={`h-6 w-12  transition-all duration-200 ${isUpdating ? 'data-[state=checked]:bg-green-500' : isDefault && 'data-[state=checked]:bg-green-500'}`}
              // className={cn(
              //   "h-5 w-9 transition-all duration-200",
              //   isUpdating && "opacity-70"
              // )}
            />
            {/* {isUpdating && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )} */}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-gray-600 text-sm font-mono tracking-wider">{accountNumber}</p>
          <p className="text-gray-700 text-sm">{bankName}</p>
        </div>

        <div className="flex gap-2 justify-end mt-auto pt-3">
          {/* <Button
            title="Edit"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="w-8 h-8 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-md"
          >
            <SquarePen className="w-4 h-4" />
          </Button> */}
          <Button
            title="Delete"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="w-8 h-8 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
